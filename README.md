<p align="center">
  <a href="https://marketplace.visualstudio.com/items?itemName=RooVeterinaryInc.roo-cline"><img src="https://img.shields.io/badge/VS_Code_Marketplace-007ACC?style=flat&logo=visualstudiocode&logoColor=white" alt="VS Code Marketplace"></a>
  <a href="https://x.com/roocode"><img src="https://img.shields.io/badge/roocode-000000?style=flat&logo=x&logoColor=white" alt="X"></a>
  <a href="https://youtube.com/@roocodeyt?feature=shared"><img src="https://img.shields.io/badge/YouTube-FF0000?style=flat&logo=youtube&logoColor=white" alt="YouTube"></a>
  <a href="https://discord.gg/roocode"><img src="https://img.shields.io/badge/Join%20Discord-5865F2?style=flat&logo=discord&logoColor=white" alt="Join Discord"></a>
  <a href="https://www.reddit.com/r/RooCode/"><img src="https://img.shields.io/badge/Join%20r%2FRooCode-FF4500?style=flat&logo=reddit&logoColor=white" alt="Join r/RooCode"></a>
</p>
<p align="center">
  <em>Get help fast → <a href="https://discord.gg/roocode">Join Discord</a> • Prefer async? → <a href="https://www.reddit.com/r/RooCode/">Join r/RooCode</a></em>
</p>

# Roo Code

> Your AI-Powered Dev Team, Right in Your Editor

<details>
  <summary>🌐 Available languages</summary>

- [English](README.md)
- [Català](locales/ca/README.md)
- [Deutsch](locales/de/README.md)
- [Español](locales/es/README.md)
- [Français](locales/fr/README.md)
- [हिंदी](locales/hi/README.md)
- [Bahasa Indonesia](locales/id/README.md)
- [Italiano](locales/it/README.md)
- [日本語](locales/ja/README.md)
- [한국어](locales/ko/README.md)
- [Nederlands](locales/nl/README.md)
- [Polski](locales/pl/README.md)
- [Português (BR)](locales/pt-BR/README.md)
- [Русский](locales/ru/README.md)
- [Türkçe](locales/tr/README.md)
- [Tiếng Việt](locales/vi/README.md)
- [简体中文](locales/zh-CN/README.md)
- [繁體中文](locales/zh-TW/README.md)
- ...
  </details>

---

## What Can Roo Code Do For YOU?

- Generate Code from natural language descriptions and specs
- Adapt with Modes: Code, Architect, Ask, Debug, and Custom Modes
- Refactor & Debug existing code
- Write & Update documentation
- Answer Questions about your codebase
- Automate repetitive tasks
- Utilize MCP Servers

## Modes

Roo Code adapts to how you work:

- Code Mode: everyday coding, edits, and file ops
- Architect Mode: plan systems, specs, and migrations
- Ask Mode: fast answers, explanations, and docs
- Debug Mode: trace issues, add logs, isolate root causes
- Custom Modes: build specialized modes for your team or workflow
- Roomote Control: Roomote Control lets you remotely control tasks running in your local VS Code instance.

Learn more: [Using Modes](https://docs.roocode.com/basic-usage/using-modes) • [Custom Modes](https://docs.roocode.com/advanced-usage/custom-modes) • [Roomote Control](https://docs.roocode.com/roo-code-cloud/roomote-control)

## Tutorial & Feature Videos

<div align="center">

|                                                                                                                                                                           |                                                                                                                                                                            |                                                                                                                                                                          |
| :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| <a href="https://www.youtube.com/watch?v=Mcq3r1EPZ-4"><img src="https://img.youtube.com/vi/Mcq3r1EPZ-4/maxresdefault.jpg" width="100%"></a><br><b>Installing Roo Code</b> | <a href="https://www.youtube.com/watch?v=ZBML8h5cCgo"><img src="https://img.youtube.com/vi/ZBML8h5cCgo/maxresdefault.jpg" width="100%"></a><br><b>Configuring Profiles</b> | <a href="https://www.youtube.com/watch?v=r1bpod1VWhg"><img src="https://img.youtube.com/vi/r1bpod1VWhg/maxresdefault.jpg" width="100%"></a><br><b>Codebase Indexing</b>  |
|    <a href="https://www.youtube.com/watch?v=iiAv1eKOaxk"><img src="https://img.youtube.com/vi/iiAv1eKOaxk/maxresdefault.jpg" width="100%"></a><br><b>Custom Modes</b>     |     <a href="https://www.youtube.com/watch?v=Ho30nyY332E"><img src="https://img.youtube.com/vi/Ho30nyY332E/maxresdefault.jpg" width="100%"></a><br><b>Checkpoints</b>      | <a href="https://www.youtube.com/watch?v=HmnNSasv7T8"><img src="https://img.youtube.com/vi/HmnNSasv7T8/maxresdefault.jpg" width="100%"></a><br><b>Context Management</b> |

</div>
<p align="center">
<a href="https://docs.roocode.com/tutorial-videos">More quick tutorial and feature videos...</a>
</p>

## Resources

- **[Documentation](https://docs.roocode.com):** The official guide to installing, configuring, and mastering Roo Code.
- **[YouTube Channel](https://youtube.com/@roocodeyt?feature=shared):** Watch tutorials and see features in action.
- **[Discord Server](https://discord.gg/roocode):** Join the community for real-time help and discussion.
- **[Reddit Community](https://www.reddit.com/r/RooCode):** Share your experiences and see what others are building.
- **[GitHub Issues](https://github.com/RooCodeInc/Roo-Code/issues):** Report bugs and track development.
- **[Feature Requests](https://github.com/RooCodeInc/Roo-Code/discussions/categories/feature-requests?discussions_q=is%3Aopen+category%3A%22Feature+Requests%22+sort%3Atop):** Have an idea? Share it with the developers.

---

## TRP1 Challenge: Intent-Governed Hook Middleware

This repository includes an implementation of **Intent-Code Traceability** for the Roo Code extension (TRP1 Challenge). The system enforces intent-first governance for destructive operations and maintains an audit trace.

### Features

- **Intent selection before destructive ops** — `select_active_intent` must be used before `write_to_file`, `edit_file`, or `execute_command`. The user approves or rejects the intent via a VS Code dialog (HITL).
- **Scope validation** — File paths are validated against the active intent’s `ownedScope` (glob patterns). Optional `.orchestration/.intentignore` skips scope for matching paths.
- **Agent trace** — Every successful file write is appended to `.orchestration/agent_trace.jsonl` with intent id, content hash, path, and classification (INTENT_EVOLUTION / AST_REFACTOR).
- **Intent map** — New files (CREATE) are recorded in `.orchestration/intent_map.md`.
- **Shared Brain** — Lessons (e.g. blocked ops, failed commands) are appended to `.orchestration/AGENT.md` and injected into the system prompt.
- **Optimistic locking** — Stale-file check before writes; file-state lock updated after successful writes.

### Documentation

| Document                                                   | Description                                                                                                 |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| [**TRP1 Challenge Report**](docs/TRP1_Challenge_Report.md) | Formal report: architecture before/after, design rationale, implementation phases, challenges, sample data. |
| [**ARCHITECTURE_NOTES.md**](ARCHITECTURE_NOTES.md)         | Detailed architecture and hook integration (sections 8–12).                                                 |
| [**Mermaid diagrams**](docs/MERMAID_DIAGRAMS.md)           | All report diagrams in Mermaid (architecture, sequence, phases).                                            |
| [**Spec & tasks**](specs/001-intent-hook-middleware/)      | Feature spec, data model, task list (`spec.md`, `data-model.md`, `tasks.md`).                               |

### Workspace layout (`.orchestration/`)

After using intent-governed tools, the workspace may contain:

- `active_intents.yaml` — Intent definitions (id, name, scope, constraints).
- `agent_trace.jsonl` — Append-only write trace (one JSON object per line).
- `intent_map.md` — Intent → file table for new files.
- `AGENT.md` — Shared Brain (lessons and decisions).
- `.intentignore` — Optional glob patterns that skip scope validation.

### Quick try

1. Open a workspace folder and ensure `.orchestration/active_intents.yaml` exists (create it with at least one intent and `ownedScope`).
2. In a chat, ask the agent to create or edit a file (e.g. “Create a simple test.html”).
3. When the agent calls `select_active_intent`, approve the intent in the dialog.
4. After a successful write, check `.orchestration/agent_trace.jsonl` and `.orchestration/intent_map.md`.

---

## Local Setup & Development

1. **Clone** the repo:

```sh
git clone https://github.com/RooCodeInc/Roo-Code.git
```

2. **Install dependencies**:

```sh
pnpm install
```

3. **Run the extension**:

There are several ways to run the Roo Code extension:

### Development Mode (F5)

For active development, use VSCode's built-in debugging:

Press `F5` (or go to **Run** → **Start Debugging**) in VSCode. This will open a new VSCode window with the Roo Code extension running.

- Changes to the webview will appear immediately.
- Changes to the core extension will also hot reload automatically.

### Automated VSIX Installation

To build and install the extension as a VSIX package directly into VSCode:

```sh
pnpm install:vsix [-y] [--editor=<command>]
```

This command will:

- Ask which editor command to use (code/cursor/code-insiders) - defaults to 'code'
- Uninstall any existing version of the extension.
- Build the latest VSIX package.
- Install the newly built VSIX.
- Prompt you to restart VS Code for changes to take effect.

Options:

- `-y`: Skip all confirmation prompts and use defaults
- `--editor=<command>`: Specify the editor command (e.g., `--editor=cursor` or `--editor=code-insiders`)

### Manual VSIX Installation

If you prefer to install the VSIX package manually:

1.  First, build the VSIX package:
    ```sh
    pnpm vsix
    ```
2.  A `.vsix` file will be generated in the `bin/` directory (e.g., `bin/roo-cline-<version>.vsix`).
3.  Install it manually using the VSCode CLI:
    ```sh
    code --install-extension bin/roo-cline-<version>.vsix
    ```

---

We use [changesets](https://github.com/changesets/changesets) for versioning and publishing. Check our `CHANGELOG.md` for release notes.

---

## Disclaimer

**Please note** that Roo Code, Inc does **not** make any representations or warranties regarding any code, models, or other tools provided or made available in connection with Roo Code, any associated third-party tools, or any resulting outputs. You assume **all risks** associated with the use of any such tools or outputs; such tools are provided on an **"AS IS"** and **"AS AVAILABLE"** basis. Such risks may include, without limitation, intellectual property infringement, cyber vulnerabilities or attacks, bias, inaccuracies, errors, defects, viruses, downtime, property loss or damage, and/or personal injury. You are solely responsible for your use of any such tools or outputs (including, without limitation, the legality, appropriateness, and results thereof).

---

## Contributing

We love community contributions! Get started by reading our [CONTRIBUTING.md](CONTRIBUTING.md).

---

## License

[Apache 2.0 © 2025 Roo Code, Inc.](./LICENSE)

---

**Enjoy Roo Code!** Whether you keep it on a short leash or let it roam autonomously, we can’t wait to see what you build. If you have questions or feature ideas, drop by our [Reddit community](https://www.reddit.com/r/RooCode/) or [Discord](https://discord.gg/roocode). Happy coding!
