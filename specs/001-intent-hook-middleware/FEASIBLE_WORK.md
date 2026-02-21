# Feasible Work from P1–P3 Checklist

This document maps each checklist item to **what we can implement now**: integration points, scope, and any open decisions.

---

## P1 – High impact vs spec

### 1. Implement `intent_map.md` (create/update on INTENT_EVOLUTION)

**Can we work on it?** **Yes.**

- **Where:** `PostToolHook.run()` after `appendTraceEntry`. We already have `mutationClass` (CREATE vs MODIFY) and `toSpecEntry` maps CREATE → `INTENT_EVOLUTION`. So we know “INTENT_EVOLUTION” at post-hook time.
- **Scope:**
    - Add an `IntentMapManager` (or logic in TraceManager/OrchestrationStorage) that:
        - Reads existing `.orchestration/intent_map.md` if present.
        - Appends or updates a line/section for this intent + file path when `classification === "INTENT_EVOLUTION"`.
    - Define a simple format (e.g. `## Intent ID\n- file_path` or a small structured block).
- **Open:** Exact format of `intent_map.md` (markdown table vs list vs YAML). Minimal: append `intent_id | file_path | timestamp` per INTENT_EVOLUTION.

---

### 2. Add Approve/Reject HITL for intent evolution

**Can we work on it?** **Yes.**

- **Where:**
    - **Option A:** `SelectActiveIntentTool.execute()` — after `getIntent()` and before `setActiveIntent()`, call `vscode.window.showWarningMessage(..., "Approve", "Reject")`. If Reject, return without setting intent.
    - **Option B:** PreToolHook when about to allow a destructive op (e.g. first time this task uses this intent for a write) — show Approve/Reject for “intent evolution” (could be limited to INTENT_EVOLUTION writes only for a simpler v1).
- **Scope:** Show a modal/warning with message like “Allow intent [id] to be used for this task?” with Approve/Reject; on Reject, block (don’t set intent in Option A, or return `allowed: false` in Option B). No need for `.intentignore` in the same PR.
- **Open:** Whether HITL is on _select_ (every intent selection) vs _first write per intent_ (fewer prompts). Spec says “update core intent evolution” — selecting an intent is the natural “evolution” moment.

---

### 3. (Optional) Extend agent trace: `id`, `vcs.revision_id`, `ranges` or `related`

**Can we work on it?** **Yes (incremental).**

- **Where:** `TraceManager.createTraceEntry()` and `toSpecEntry()` (and `SpecTraceLogEntry` in `types.ts`). We already have `contentHash`, `filePath`, `intentId`, `lineRanges` (optional) on `TraceLogEntry`.
- **Scope:**
    - Add `id: uuidv4()` and `vcs: { revision_id: gitSha }` (we already pass `gitSha` in createTraceEntry; ensure it’s read from git and written to spec entry).
    - Add either `ranges: [{ start_line, end_line, content_hash }]` (from `lineRanges` + content hash of that range) or `related: [{ type: "specification", value: intentId }]` so the report can cite “Intent–AST correlation.”
- **Open:** Full nested schema (conversations, contributor) is larger; “at least id, vcs.revision_id, and one of ranges or related” is enough for the rubric.

---

## P2 – Shared Brain and lessons

### 4. `.orchestration/AGENT.md` or `CLAUDE.md` (Shared Brain)

**Can we work on it?** **Yes.**

- **Where:**
    - Ensure `.orchestration` exists (already do in OrchestrationStorage).
    - On first write to Shared Brain (or on extension activation for that workspace), create `.orchestration/AGENT.md` with a short header (e.g. “# Shared Brain”) if missing; then all appends go there. Use one filename (e.g. `AGENT.md`) to avoid duplication.
- **Scope:**
    - Add `appendToSharedBrain(workspaceRoot, content)` (or similar) in OrchestrationStorage that ensures `.orchestration/AGENT.md` exists and appends a line.
    - Document in ARCHITECTURE_NOTES that `.orchestration/AGENT.md` is the Shared Brain.
- **Open:** None; single file and append-only is enough for “ensure file exists and is written by the extension.”

---

### 5. Lesson recording (on linter/test failure, append to Shared Brain)

**Can we work on it?** **Partially — needs a clear trigger.**

- **Where:**
    - **Option A:** PostToolHook for `execute_command`: if `result` indicates failure (e.g. non‑zero exit or tool_error), call Shared Brain append with a one-line “Lesson: command X failed at …”.
    - **Option B:** A dedicated place that sees “tool_error” or “verification failed” (e.g. where `handleError` or tool results are processed) and appends a lesson.
    - Requires access to `workspaceRoot` and a small “lesson” string (e.g. “Linter/test failed after editing file X”).
- **Scope:** Append one line to `.orchestration/AGENT.md` when we detect a failed `execute_command` (or a generic tool_error from run command). Format: e.g. `- [date] Lesson: <short reason>`.
- **Open:** Where exactly “linter/test failure” is visible. If the only reliable signal is “execute_command returned error,” we can start there; if there’s a separate “verification step” in the flow, we’d hook that when we find it.

---

## P3 – Governance and polish

### 6. `.intentignore`: skip scope checks for paths matching rules

**Can we work on it?** **Yes.**

- **Where:** `PreToolHook` right before or after `scopeValidator.validatePath()`. If the file path matches a pattern listed in `.intentignore` (or a path in `.orchestration/.intentignore`), skip scope validation (or always allow).
- **Scope:**
    - Define format (e.g. one glob or path per line in `.orchestration/.intentignore` or repo root `.intentignore`).
    - Load file once (or with small cache), interpret as globs/paths, and if `filePath` matches any, set `isInScope = true` (or skip the scope check).
- **Open:** File location (`.orchestration/.intentignore` vs root `.intentignore`) and whether “skip scope” means “allow” or “skip only for certain intents.” Minimal: one file, globs, skip scope check when matched.

---

### 7. `write_file` schema: optional `intent_id` / `mutation_class`

**Can we work on it?** **Yes.**

- **Where:** Native tool definition for `write_to_file` (e.g. in `src/core/prompts/tools/native-tools/write_to_file.ts` or wherever the schema is defined). Add optional parameters `intent_id` and `mutation_class` in the schema; document that hooks enforce intent and derive mutation_class if not provided.
- **Scope:** Schema-only addition + one-line doc in tool description or ARCHITECTURE_NOTES. No change to hook logic required.
- **Open:** None.

---

### 8. Phase 8 (optimistic locking) tasks: tests, OptimisticLockManager

**Can we work on it?** **Yes.**

- **Where:**
    - Optimistic locking _behavior_ already exists (`FileStateLockStore` + PreToolHook).
    - Add unit tests for `FileStateLockStore` (record, getExpectedHash, checkStale, update) and for PreToolHook “stale file” path (mock store, expect `allowed: false` and “Stale file detected”).
    - Optional: extract an `OptimisticLockManager` that wraps the store and is used by PreToolHook/PostToolHook for clearer naming and to satisfy task list.
- **Scope:** Tests are well-defined; optional refactor to OptimisticLockManager is a small rename/wrapper.
- **Open:** Whether to introduce OptimisticLockManager or keep using `__fileStateLockStore` and only add tests.

---

### 9. JSDoc and tests for hooks (T054–T059)

**Can we work on it?** **Yes.**

- **Where:** Add JSDoc to `TraceManager`, `PostToolHook`, `PreToolHook`, `IntentManager`, `OrchestrationStorage`, `ScopeValidator`, `FileStateLockStore`; add or extend tests in `tests/hooks/` (or existing `*.spec.ts` for hooks).
- **Scope:** One pass of JSDoc on public methods; one or two tests per hook class if missing (e.g. PostToolHook trace logging, PreToolHook scope + intent).
- **Open:** None.

---

## Summary: what we can work on

| Item                                         | Feasible | Integration point                                        | Notes                                                            |
| -------------------------------------------- | -------- | -------------------------------------------------------- | ---------------------------------------------------------------- |
| intent_map.md on INTENT_EVOLUTION            | Yes      | PostToolHook after appendTraceEntry                      | Simple append/update when classification is INTENT_EVOLUTION     |
| Approve/Reject HITL                          | Yes      | SelectActiveIntentTool or PreToolHook                    | showWarningMessage Approve/Reject; block on Reject               |
| Trace schema (id, vcs, ranges/related)       | Yes      | TraceManager + types                                     | Add fields to SpecTraceLogEntry and createTraceEntry/toSpecEntry |
| .orchestration/AGENT.md Shared Brain         | Yes      | OrchestrationStorage + ensure on first append            | One file, append-only, document in ARCHITECTURE_NOTES            |
| Lesson recording                             | Partial  | PostToolHook for execute_command or tool_error handler   | Start with “execute_command failed” → append lesson              |
| .intentignore                                | Yes      | PreToolHook before/after scope check                     | Load globs; skip scope when path matches                         |
| write_file schema intent_id / mutation_class | Yes      | write_to_file tool definition                            | Optional params + doc                                            |
| Phase 8 tests / OptimisticLockManager        | Yes      | FileStateLockStore + PreToolHook tests; optional wrapper | Tests first; manager optional                                    |
| JSDoc and hook tests                         | Yes      | All hook files + tests/hooks or \*.spec.ts               | Straightforward                                                  |

Recommended order if implementing in one go: (1) intent_map.md, (2) Shared Brain file + append, (3) HITL Approve/Reject, (4) .intentignore, (5) trace schema extension, (6) lesson recording (execute_command), (7) write_file schema, (8) Phase 8 tests + JSDoc.
