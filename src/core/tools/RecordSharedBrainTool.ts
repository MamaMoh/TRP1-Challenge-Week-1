import { Task } from "../task/Task"
import { formatResponse } from "../prompts/responses"
import { BaseTool, ToolCallbacks } from "./BaseTool"

interface RecordSharedBrainParams {
	message: string
}

/**
 * RecordSharedBrainTool allows the AI to append a lesson, architectural decision, or stylistic rule
 * to .orchestration/AGENT.md (Shared Brain). The content is then injected into the system prompt for future turns.
 */
export class RecordSharedBrainTool extends BaseTool<"record_shared_brain"> {
	readonly name = "record_shared_brain" as const

	async execute(params: RecordSharedBrainParams, task: Task, callbacks: ToolCallbacks): Promise<void> {
		const { pushToolResult, handleError } = callbacks
		const message = params.message?.trim()
		if (!message) {
			task.recordToolError("record_shared_brain")
			pushToolResult(formatResponse.toolError("message is required and cannot be empty."))
			return
		}

		const workspaceRoot = task.workspacePath
		if (!workspaceRoot) {
			pushToolResult(formatResponse.toolError("Workspace path is unknown; cannot record to Shared Brain."))
			return
		}

		try {
			const sharedBrain = (global as any).__sharedBrainManager as
				| { append(workspaceRoot: string, content: string): Promise<void> }
				| undefined
			if (!sharedBrain) {
				pushToolResult(formatResponse.toolError("Shared Brain is not available."))
				return
			}
			const line = `- [${new Date().toISOString()}] (recorded by agent) ${message}`
			await sharedBrain.append(workspaceRoot, line)
			pushToolResult(
				`Recorded to Shared Brain (.orchestration/AGENT.md): "${message.slice(0, 80)}${message.length > 80 ? "…" : ""}"`,
			)
		} catch (error) {
			await handleError("recording to Shared Brain", error as Error)
		}
	}
}

export const recordSharedBrainTool = new RecordSharedBrainTool()
