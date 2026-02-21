import { OrchestrationStorage } from "./OrchestrationStorage"

const INTENT_MAP_FILENAME = "intent_map.md"

const INTENT_MAP_HEADER = `# Intent Map

Maps business intents to physical files. Updated when new files are created under an intent (INTENT_EVOLUTION).

| Intent ID | File Path | Timestamp |
|-----------|-----------|-----------|
`

/**
 * IntentMapManager maintains .orchestration/intent_map.md, the spatial map of intents to files.
 * Updated incrementally when INTENT_EVOLUTION occurs (file create under an intent).
 */
export class IntentMapManager {
	constructor(private storage: OrchestrationStorage) {}

	/**
	 * Appends an intent–file mapping to intent_map.md when INTENT_EVOLUTION occurs.
	 * Creates the file with header if it does not exist.
	 * @param intentId Intent ID (e.g. INT-001)
	 * @param filePath Relative file path from workspace root
	 * @param timestamp ISO timestamp for the evolution event
	 * @param workspaceRoot Workspace root for .orchestration path
	 */
	async appendIntentEvolutionEntry(
		intentId: string,
		filePath: string,
		timestamp: string,
		workspaceRoot: string,
	): Promise<void> {
		const exists = await this.storage.fileExists(INTENT_MAP_FILENAME, workspaceRoot)
		const row = this.formatTableRow(intentId, filePath, timestamp)
		if (!exists) {
			await this.storage.writeFile(INTENT_MAP_FILENAME, INTENT_MAP_HEADER + row + "\n", workspaceRoot)
		} else {
			await this.storage.appendFile(INTENT_MAP_FILENAME, row + "\n", workspaceRoot)
		}
	}

	private formatTableRow(intentId: string, filePath: string, timestamp: string): string {
		// Escape pipe in values for markdown table
		const escape = (s: string) => s.replace(/\|/g, "\\|")
		return `| ${escape(intentId)} | ${escape(filePath)} | ${escape(timestamp)} |`
	}
}
