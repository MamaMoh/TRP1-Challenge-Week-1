import * as path from "path"
import * as fs from "fs/promises"

import { TraceManager } from "./TraceManager"
import { IntentManager } from "./IntentManager"
import { IntentMapManager } from "./IntentMapManager"
import type { ToolExecutionContext, PostHookResult, MutationClass } from "./types"

const MUTATION_TOOLS = new Set(["write_to_file", "edit_file"])

/**
 * PostToolHook logs file write operations to agent_trace.jsonl after successful execution.
 * Supports write_to_file and edit_file. Updates file state lock store after write for optimistic locking.
 * On INTENT_EVOLUTION (file create), updates .orchestration/intent_map.md.
 */
export class PostToolHook {
	private traceManager: TraceManager
	private intentManager: IntentManager
	private intentMapManager: IntentMapManager

	constructor(traceManager: TraceManager, intentManager: IntentManager, intentMapManager: IntentMapManager) {
		this.traceManager = traceManager
		this.intentManager = intentManager
		this.intentMapManager = intentMapManager
	}

	private getIntentManager(): IntentManager {
		const globalIntentManager = (global as any).__intentManager as IntentManager | undefined
		return globalIntentManager || this.intentManager
	}

	private getMutationClassFromPreHook(taskId: string, filePath: string): MutationClass | undefined {
		const map = (global as any).__lastWriteMutationByPath as Record<string, MutationClass> | undefined
		return map?.[`${taskId}:${filePath}`]
	}

	/**
	 * Appends a lesson line to .orchestration/AGENT.md (Shared Brain). Non-blocking; logs and swallows errors.
	 */
	private async recordLessonToSharedBrain(workspaceRoot: string, lesson: string): Promise<void> {
		try {
			const sharedBrain = (global as any).__sharedBrainManager as
				| { append(workspaceRoot: string, content: string): Promise<void> }
				| undefined
			if (sharedBrain) {
				const line = `- [${new Date().toISOString()}] ${lesson}`
				await sharedBrain.append(workspaceRoot, line)
			}
		} catch (err) {
			console.error("[PostToolHook] Failed to record lesson to Shared Brain:", err)
		}
	}

	async run(context: ToolExecutionContext, result: unknown): Promise<PostHookResult> {
		// Record execute_command failures to Shared Brain
		if (context.toolName === "execute_command") {
			const failed =
				result != null && typeof result === "object" && (result as { success?: boolean }).success === false
			if (failed && context.workspacePath) {
				const cmd = (context.toolParams.command as string) || "command"
				const errMsg =
					result != null && typeof result === "object" && "error" in result
						? String((result as { error: unknown }).error)
						: "unknown"
				this.recordLessonToSharedBrain(
					context.workspacePath,
					`Lesson: execute_command failed. Command: ${cmd.slice(0, 80)}${cmd.length > 80 ? "…" : ""}. Error: ${errMsg.slice(0, 120)}${errMsg.length > 120 ? "…" : ""}`,
				).catch(() => {})
			}
			return { success: true }
		}

		if (!MUTATION_TOOLS.has(context.toolName)) {
			return { success: true }
		}

		// Only trace and update lock when the write actually succeeded
		const executionSucceeded =
			result != null && typeof result === "object" && (result as { success?: boolean }).success !== false
		if (!executionSucceeded) {
			return { success: true }
		}

		const intentManager = this.getIntentManager()
		let activeIntentId: string | undefined = context.activeIntentId
		if (!activeIntentId) {
			const activeIntent = await intentManager.getActiveIntent(context.taskId, context.workspacePath)
			activeIntentId = activeIntent?.id
		}
		if (!activeIntentId) {
			return { success: true }
		}

		const workspaceRoot = context.workspacePath
		if (!workspaceRoot) {
			return { success: true, error: "No workspace root found in context" }
		}

		const filePath = (context.toolParams.path as string) || (context.toolParams.file_path as string)
		if (!filePath) {
			return { success: true, error: "Missing file path in tool params" }
		}

		let content: string | undefined = context.toolParams.content as string | undefined
		if (context.toolName === "edit_file" && content === undefined) {
			try {
				const absolutePath = path.resolve(workspaceRoot, filePath)
				content = await fs.readFile(absolutePath, "utf-8")
			} catch (err) {
				return { success: true, error: "Could not read file for trace after edit_file" }
			}
		}
		if (content === undefined) {
			return { success: true, error: "Missing file path or content in tool params" }
		}

		try {
			const mutationClass = this.getMutationClassFromPreHook(context.taskId, filePath)
			const traceEntry = await this.traceManager.createTraceEntry({
				intentId: activeIntentId,
				filePath,
				content,
				workspaceRoot,
				toolName: context.toolName,
				mutationClass,
			})
			await this.traceManager.appendTraceEntry(traceEntry, workspaceRoot)

			// Update intent_map.md on INTENT_EVOLUTION (new file created under an intent)
			if (traceEntry.mutationClass === "CREATE") {
				try {
					await this.intentMapManager.appendIntentEvolutionEntry(
						activeIntentId,
						filePath,
						traceEntry.timestamp,
						workspaceRoot,
					)
				} catch (err) {
					console.error("[PostToolHook] Failed to update intent_map.md:", err)
				}
			}

			// Update file state lock so next write is not incorrectly flagged as stale
			const store = (global as any).__fileStateLockStore as
				| { update(filePath: string, content: string): void }
				| undefined
			if (store) {
				store.update(filePath, content)
			}

			return { success: true, traceEntry }
		} catch (error) {
			console.error(`[PostToolHook] Failed to log trace entry:`, error)
			return {
				success: true,
				error: error instanceof Error ? error.message : String(error),
			}
		}
	}
}
