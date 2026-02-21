import { OrchestrationStorage } from "./OrchestrationStorage"

const SHARED_BRAIN_FILENAME = "AGENT.md"

const SHARED_BRAIN_HEADER = `# Shared Brain

Persistent knowledge base shared across parallel sessions (Architect/Builder/Tester). Contains lessons learned and project-specific architectural decisions. Appended by the extension when verification fails or decisions are recorded.

---

`

/**
 * SharedBrainManager maintains .orchestration/AGENT.md (the "Shared Brain").
 * The file is created with a header on first append. All subsequent writes are append-only.
 */
export class SharedBrainManager {
	constructor(private storage: OrchestrationStorage) {}

	/**
	 * Returns the full content of the Shared Brain file, or empty string if it does not exist.
	 * Used to inject lessons/decisions into the system prompt so the agent can use them.
	 */
	async getContent(workspaceRoot: string): Promise<string> {
		const exists = await this.storage.fileExists(SHARED_BRAIN_FILENAME, workspaceRoot)
		if (!exists) return ""
		try {
			return await this.storage.readFile(SHARED_BRAIN_FILENAME, workspaceRoot)
		} catch {
			return ""
		}
	}

	/**
	 * Appends content to the Shared Brain file. Creates the file with a standard header if it does not exist.
	 * @param workspaceRoot Workspace root for .orchestration path
	 * @param content Content to append (e.g. a lesson line or decision); no newline is added automatically
	 */
	async append(workspaceRoot: string, content: string): Promise<void> {
		const exists = await this.storage.fileExists(SHARED_BRAIN_FILENAME, workspaceRoot)
		if (!exists) {
			await this.storage.writeFile(
				SHARED_BRAIN_FILENAME,
				SHARED_BRAIN_HEADER + content + (content.endsWith("\n") ? "" : "\n"),
				workspaceRoot,
			)
		} else {
			await this.storage.appendFile(
				SHARED_BRAIN_FILENAME,
				content + (content.endsWith("\n") ? "" : "\n"),
				workspaceRoot,
			)
		}
	}
}
