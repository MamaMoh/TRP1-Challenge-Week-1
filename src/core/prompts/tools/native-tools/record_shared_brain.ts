import type OpenAI from "openai"

const RECORD_SHARED_BRAIN_DESCRIPTION = `Record a lesson learned, architectural decision, or project-specific rule into the Shared Brain (.orchestration/AGENT.md). This content is then injected into the system prompt for future turns and parallel sessions so the agent (and other sessions) can avoid repeating mistakes and follow project decisions.

Use this when:
- You make an architectural decision that should be remembered.
- You establish a stylistic or project-specific rule.
- You want to record a lesson from a failure or verification step for future reference.

Parameters:
- message: (required) The lesson, decision, or rule to record (one or two sentences recommended).

Example: Recording an architectural decision
{ "message": "Use the /api prefix for all REST endpoints; avoid /v1 in paths." }`

export default {
	type: "function",
	function: {
		name: "record_shared_brain",
		description: RECORD_SHARED_BRAIN_DESCRIPTION,
		strict: true,
		parameters: {
			type: "object",
			properties: {
				message: {
					type: "string",
					description: "The lesson, architectural decision, or stylistic rule to record for future sessions.",
				},
			},
			required: ["message"],
			additionalProperties: false,
		},
	},
} satisfies OpenAI.Chat.ChatCompletionTool
