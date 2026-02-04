<div align="center">

# Get Shit Done Multi

**Spec-driven development system for AI coding assistants with multi-platform support**

[![npm version](https://img.shields.io/npm/v/get-shit-done-multi)](https://www.npmjs.com/package/get-shit-done-multi)
[![npm downloads](https://img.shields.io/npm/dm/get-shit-done-multi)](https://www.npmjs.com/package/get-shit-done-multi)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**Supported Platforms:** Claude Code · GitHub Copilot CLI · Codex CLI

</div>

> **📦 Template System** — Starting v2.0.0, this repository serves as a multi-platform template installer. For the primary GSD development and in-depth documentation, see [get-shit-done](https://github.com/glittercowboy/get-shit-done).

## What It Does

Get Shit Done Multi (GSD Multi) is a template-based installer that deploys working AI assistant skills and agents to
multiple platforms with a single command. Instead of manually configuring your Claude Code, GitHub Copilot CLI, or
Codex CLI environment, GSD Multi installs a complete spec-driven development system.

This system transforms AI coding into a structured workflow: define your idea, let AI research and plan, then execute
with atomic commits and fresh context. You get clean git history, reproducible builds, and human-in-loop verification
at key points.

The multi-platform approach means you can use the same workflow across different AI assistants, switching platforms as
needed while maintaining project state.

## Quick Start

```bash
npx get-shit-done-multi
```

The installer detects your platform (Claude Code, GitHub Copilot CLI, or Codex CLI) and deploys 29 skills and 13
agents. After installation, start your first project with platform-specific commands:

```bash
# Claude Code / GitHub Copilot CLI
/gsd-new-project

# Codex CLI
$gsd-new-project
```

The system guides you through questioning, research, requirements extraction, and roadmap creation. Then execute
phase by phase with atomic task plans and clean commits.

**Note:** Use `/gsd-` prefix for Claude and Copilot, `$gsd-` prefix for Codex.

### Beta Version

Test the latest features before stable release:

```bash
npx get-shit-done-multi@beta
```

The beta version includes pre-release features from the dev branch.

## Workflow

```text
User Input → Orchestrator → Specialized Agents → Verification
     │              │                │                  │
     │              ├──→ Researcher ─┤                  │
     │              ├──→ Planner ────┤                  │
     │              └──→ Executor ───┘                  │
     │                                                  │
     └────────────────── Feedback ←─────────────────────┘

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

Each phase produces small, focused plans that execute in fresh context windows to avoid degradation. Human verification
happens at natural checkpoints.

## GSD Workflow Commands

The complete workflow cycle uses these commands:

- **`/gsd-new-project`** or **`$gsd-new-project`** — Start new project with guided setup
- **`/gsd-discuss-phase <N>`** — Explore phase approach through questions
- **`/gsd-research-phase <N>`** — Research implementation patterns
- **`/gsd-plan-phase <N>`** — Create atomic execution plans
- **`/gsd-execute-phase <N>`** — Execute all plans with fresh context
- **`/gsd-verify-work`** — Manual acceptance testing
- **`/gsd-complete-milestone`** — Archive and prepare next milestone

See [How GSD Works](docs/how-gsd-works.md) for detailed workflow explanation.

## Supported Platforms

- **Claude Code** - Skills-based system with slash commands (replaces legacy `.claude/commands/`)
- **GitHub Copilot CLI** - Conversational interface with agent support
- **Codex CLI** - OpenAI's command-line interface

All platforms share the same workflow and project state. Switch between platforms mid-project as needed.

**Note for Claude users:** GSD Multi uses Claude's skills system (`.claude/skills/`). The legacy commands directory
(`.claude/commands/`) has been deprecated by Claude in favor of skills, which provide the same slash command interface
with additional features like frontmatter control and automatic loading. See
[Platform Specifics](docs/platform-specifics.md) for details.

## Documentation

**Getting Started:**

- [Installation Guide](docs/how-to-install.md)
- [How GSD Works](docs/how-gsd-works.md)
- [Platform Comparison](docs/platform-comparison.md)

**Reference:**

- [Full Documentation](docs/README.md)
- [Troubleshooting](docs/troubleshooting.md)

## Requirements

- **Node.js 20+** (Node 20 LTS active until October 2026)
- **One of the following AI platforms:**
  - **Claude Code** requires `claude` binary - [Installation guide](https://code.claude.com/docs/en/setup)
  - **GitHub Copilot CLI** requires `copilot` binary - [Installation guide](https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli)
  - **Codex CLI** requires `codex` binary - [Installation guide](https://developers.openai.com/codex/cli/)

## Credits & License

This project (GSD Multi) is a multi-platform fork of the original
[get-shit-done](https://github.com/glittercowboy/get-shit-done) framework by Lex Christopherson.

**Fork Point:** v1.6.4 (https://github.com/glittercowboy/get-shit-done/releases/tag/v1.6.4)

**Version Timeline:**

- v1.7.0 (2026-01-19): Multi-CLI support experiments (Codex CLI added)
- v1.8.0 (2026-01-20): Milestone archiving and mapping improvements
- v2.0.0 (current): Full multi-platform + template system achievement

**Key Differences:**

- Original: Primary GSD development, Claude-only, source of all capabilities
- GSD Multi: Multi-platform template installer (Claude, Copilot, Codex) — syncs from original

**Starting v2.0.0:** This repository functions as a template synchronization system. All new capabilities, skills, and agents are developed in the original get-shit-done repository and synced here for multi-platform deployment.

Both projects are MIT licensed. See [LICENSE](LICENSE) for details.
