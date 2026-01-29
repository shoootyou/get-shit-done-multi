# Get Shit Done Multi

**Spec-driven development system for AI coding assistants with multi-platform support**

[![npm version](https://img.shields.io/npm/v/get-shit-done-multi)](https://www.npmjs.com/package/get-shit-done-multi)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Supported Platforms:** Claude Code · GitHub Copilot CLI · Codex CLI

---

## What It Does

Get Shit Done Multi (GSD Multi) is a template-based installer that deploys working AI assistant skills and agents to multiple platforms with a single command. Instead of manually configuring your Claude Code, GitHub Copilot CLI, or Codex CLI environment, GSD Multi installs a complete spec-driven development system.

This system transforms AI coding into a structured workflow: define your idea, let AI research and plan, then execute with atomic commits and fresh context. You get clean git history, reproducible builds, and human-in-loop verification at key points.

The multi-platform approach means you can use the same workflow across different AI assistants, switching platforms as needed while maintaining project state.

---

## Quick Start

```bash
npx get-shit-done-multi
```

The installer detects your platform (Claude Code, GitHub Copilot CLI, or Codex CLI) and deploys 28 skills and 13 agents. After installation, you can start your first project:

```bash
# Claude Code
/gsd:new-project

# Copilot/Codex (conversational)
"Start a new GSD project"
```

The system guides you through questioning, research, requirements extraction, and roadmap creation. Then execute phase by phase with atomic task plans and clean commits.

---

## Workflow

```
User Input → Orchestrator → Specialized Agents → Verification
     │              │                │                  │
     │              ├─→ Researcher ──┤                  │
     │              ├─→ Planner ─────┤                  │
     │              └─→ Executor ────┤                  │
     │                                                   │
     └───────────────── Feedback ←────────────────────┘

Phases:
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│ 1. Discuss     │ →  │ 2. Plan        │ →  │ 3. Execute     │
│ (Your vision)  │    │ (Atomic tasks) │    │ (Fresh context)│
└────────────────┘    └────────────────┘    └────────────────┘
                                                      ↓
┌────────────────┐    ┌────────────────┐    ┌────────────────┐
│ 6. Complete    │ ←  │ 5. Iterate     │ ←  │ 4. Verify      │
│ (Milestone)    │    │ (Next phase)   │    │ (Human check)  │
└────────────────┘    └────────────────┘    └────────────────┘
```

Each phase produces small, focused plans that execute in fresh context windows to avoid degradation. Human verification happens at natural checkpoints.

---

## Supported Platforms

- **Claude Code** - Original platform with slash commands
- **GitHub Copilot CLI** - Conversational interface with agent support
- **Codex CLI** - OpenAI's command-line interface

All platforms share the same workflow and project state. Switch between platforms mid-project as needed.

---

## Documentation

**Getting Started:**
- [Installation Guide](docs/how-to-install.md)
- [How GSD Works](docs/how-gsd-works.md)
- [Platform Comparison](docs/platform-comparison.md)

**Reference:**
- [All Commands](docs/commands/README.md)
- [Full Documentation](docs/README.md)
- [Troubleshooting](docs/troubleshooting.md)

---

## Requirements

- **Node.js 20+** (Node 20 LTS active until October 2026)
- One of: Claude Code, GitHub Copilot CLI, or Codex CLI

---

## Credits & License

This project (GSD Multi) is a multi-platform fork of the original [get-shit-done](https://github.com/glittercowboy/get-shit-done) framework by Lex Christopherson.

**Fork Point:** v1.6.4 (https://github.com/glittercowboy/get-shit-done/releases/tag/v1.6.4)

**Version Timeline:**
- v1.7.0 (2026-01-19): Multi-CLI support experiments (Codex CLI added)
- v1.8.0 (2026-01-20): Milestone archiving and mapping improvements
- v2.0.0 (current): Full multi-platform + template system achievement

**Key Differences:**
- Original: Claude-only with direct .md skills
- GSD Multi: Multi-platform support (Claude, Copilot, Codex) using templating system

Both projects are MIT licensed. See [LICENSE](LICENSE) for details.
