<div align="center">

# GET SHIT DONE

**Spec-driven development system for AI coding assistants. No enterprise theater. Just ship.**

[![npm version](https://img.shields.io/npm/v/get-shit-done-multi?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-multi)
[![npm downloads](https://img.shields.io/npm/dm/get-shit-done-multi?style=for-the-badge&logo=npm&logoColor=white&color=CB3837)](https://www.npmjs.com/package/get-shit-done-multi)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge)](LICENSE)

**Multi-Platform:** Template-based optimization for Claude Code · GitHub Copilot CLI · Codex CLI

**Original project by:** [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done)

</div>

---

## What It Does

GSD transforms vibecoding chaos into reliable, reproducible development:

- **Context Engineering** — Fresh context windows for heavy work, structured files for memory
- **Multi-Agent Orchestration** — Parallel research, planning, execution with specialized agents  
- **Atomic Task Execution** — Small plans, clean commits, no context degradation
- **Human-in-Loop Verification** — AI builds, you verify, system auto-fixes

**The result:** Describe your idea, approve the roadmap, walk away. Come back to completed work with clean git history.

---

## What's New in v1.9.1 ✨

**Spec-based skill system:** GSD commands are now generated from unified specs in `/specs/skills/` - single source of truth across all 3 platforms with zero drift.

**⚠️ Breaking changes:**
- Command prefix: Use `/gsd-` instead of `/gsd:` (e.g., `/gsd-help`)
- Legacy system removed: Run cleanup script after upgrading

See [CHANGELOG.md](CHANGELOG.md) for complete release notes and [documentation](#documentation) for guides.

---

## Quick Start

### Install

GSD generates agents optimized for each platform during installation:

```bash
# Claude Code (uppercase tools, string format)
npx get-shit-done-multi

# GitHub Copilot CLI
npx get-shit-done-multi --copilot

# Codex CLI (optimized for OpenAI)
npx get-shit-done-multi --codex
```

**Note:** Agents are generated from templates with platform-specific optimization. Re-run install to regenerate agents.

### First Project

```bash
# In Claude Code
/gsd-new-project

# In Copilot/Codex (conversational)
"Start a new GSD project"
```

System will:
1. Ask questions until it understands your idea
2. Research the domain (optional)
3. Extract requirements (v1 vs v2)
4. Create roadmap with phases

Then for each phase:

```bash
/gsd-discuss-phase 1   # Shape implementation (optional)
/gsd-plan-phase 1      # Research + create atomic plans
/gsd-execute-phase 1   # Build with fresh context per plan
/gsd-verify-work 1     # Test + auto-fix issues
```

**That's it.** Repeat for each phase, complete milestone, start next version.

📖 **Detailed walkthrough:** [How It Works](docs/how-it-works.md)

---

## Architecture

GSD uses template-based generation to optimize agents for each platform. Single source specs with install-time generation ensure zero drift across Claude Code, Copilot CLI, and Codex CLI.

📖 **Details:** [Architecture](docs/architecture.md) · [Contributing](docs/contributing.md)

---

## About This Version

**Multi-CLI version** maintained by **shoootyou**  
**Original creator:** TÂCHES ([glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done))

This version extends the original brilliant work to support three AI platforms while maintaining the same core workflow and philosophy.

**What's the same:**
- Context engineering principles
- Multi-agent orchestration
- Atomic task execution
- All original commands

**What's new:**
- GitHub Copilot CLI support
- Codex CLI support  
- Skills-based architecture
- Cross-platform portability

> **Learn more about the original project and full attribution:** [Credits](#credits) · [Full Attribution](docs/attribution.md)

---

## Commands

> **Note:** Commands use `/gsd-` prefix (hyphen) as of v1.9.1. Legacy `/gsd:` (colon) format removed.
> 
> **Syntax:** Claude Code uses `/gsd-*` commands. Copilot/Codex use conversational commands.
>
> 📖 **Complete reference:** [docs/commands/README.md](docs/commands/README.md)

### Core Workflow

| Command | What It Does |
|---------|--------------|
| `/gsd-new-project` | Initialize: questions → research → requirements → roadmap |
| `/gsd-discuss-phase [N]` | Capture your implementation vision (optional) |
| `/gsd-plan-phase [N]` | Research domain + create atomic task plans |
| `/gsd-execute-phase <N>` | Build in fresh context, atomic commits |
| `/gsd-verify-work [N]` | Manual testing + automated fix generation |
| `/gsd-complete-milestone` | Archive + tag release |

### Management

| Command | What It Does |
|---------|--------------|
| `/gsd-progress` | Show current state + next steps |
| `/gsd-add-phase` | Extend current milestone |
| `/gsd-map-codebase` | Analyze existing code (brownfield projects) |
| `/gsd-pause-work` / `/gsd-resume-work` | Session handoff |

### Utilities

| Command | What It Does |
|---------|--------------|
| `/gsd-add-todo [desc]` | Capture ideas for later |
| `/gsd-debug [desc]` | Systematic debugging |
| `/gsd-help` | List all commands |

**More commands:** Phase insertion, milestone management, todos, and more in [full reference](docs/commands/README.md).

---

## Documentation

**Getting Started:**
- [Setup Guide](docs/setup-claude-code.md) — Install for Claude Code, Copilot CLI, or Codex CLI
- [Troubleshooting](docs/troubleshooting.md) — Common issues and solutions

**User Guides:**
- [Migration Guide](docs/migration-guide.md) — Create new skill specs
- [Command Comparison](docs/command-comparison.md) — Legacy vs new spec format

**Reference:**
- [Skill Specs](specs/skills/README.md) — Skill specification documentation
- [CHANGELOG](CHANGELOG.md) — Version history and breaking changes

For contributors, see [GSD-STYLE.md](GSD-STYLE.md).

---

## Troubleshooting

**Installation issues?**

```bash
# Verify installation
ls ~/.claude/commands/gsd/           # Claude Code (global)
ls .github/skills/get-shit-done/     # Copilot CLI
ls .codex/skills/get-shit-done/      # Codex CLI

# Reinstall
npx get-shit-done-multi@latest [--copilot|--codex]
```

**Commands not working?**

- **Claude Code:** Restart to reload slash commands
- **Copilot/Codex:** Try conversational: "Start a GSD project"
- Run help command to verify: `/gsd-help` or `"Show GSD help"`

**Docker/Podman containers:**

For isolated development environments with persistent caches:

```bash
# Using Docker
make net           # Interactive shell with network
make nonet         # Isolated shell without network

# Using Podman (rootless alternative)
make podman-net    # Interactive shell with network
make podman-nonet  # Isolated shell without network
```

📖 **Container docs:** [docs/containers-readme.md](docs/containers-readme.md)

**Other issues:**

```bash
export CLAUDE_CONFIG_DIR=/home/user/.claude
npx get-shit-done-multi --global
```

📖 **More help:** [docs/troubleshooting.md](docs/troubleshooting.md)

---

## Credits

**Maintained by:** shoootyou  
**Original creator:** TÂCHES ([github.com/glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done))

This multi-CLI version extends the original to support Claude Code, GitHub Copilot CLI, and Codex CLI. Core workflow, philosophy, and architecture credit to TÂCHES.

> *Standing on the shoulders of giants.* The brilliance of Get Shit Done comes from TÂCHES' original vision of eliminating enterprise theater and just building cool stuff that works. This version simply makes that brilliance accessible across multiple AI platforms.

📖 **Full attribution and credits:** [docs/attribution.md](docs/attribution.md)

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

<div align="center">

**AI coding assistants are powerful. GSD makes them reliable.**

**[Get Started](docs/how-it-works.md)** · **[All Commands](docs/commands/README.md)** · **[Architecture](docs/architecture.md)**

</div>
