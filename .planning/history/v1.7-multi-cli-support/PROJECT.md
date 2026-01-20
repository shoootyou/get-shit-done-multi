# Get Shit Done - Codex CLI Support

## What This Is

**Add complete OpenAI Codex CLI support to the Get Shit Done (GSD) meta-prompting system, enabling developers to use GSD workflows seamlessly across Claude Code, GitHub Copilot CLI, and OpenAI Codex CLI with full interoperability.**

GSD is a production-grade meta-prompting and spec-driven development system. It currently supports Claude Code (global/local) and GitHub Copilot CLI (local only). This project extends GSD to support OpenAI Codex CLI with both global (`~/.codex/`) and local (`.codex/`) installation options, maintaining complete feature parity and allowing developers to switch between CLIs without losing context.

## Core Value

**Enable developers to use GSD workflows in Codex CLI with the same power and reliability they experience in Claude Code and GitHub Copilot CLI, with seamless switching between all three CLIs on the same project.**

The system must work identically across all three CLIs, reading and writing to the same `.planning/` directory structure so users can switch between Claude, Copilot, and Codex without friction.

## Why This Matters

GSD has proven valuable for structured development with Claude Code and GitHub Copilot CLI. OpenAI Codex CLI represents a third major AI coding assistant platform with its own user base. By supporting Codex CLI:

1. **Market expansion** - Reach developers who prefer Codex CLI
2. **Platform flexibility** - Users can choose their preferred CLI without losing GSD capabilities
3. **True interoperability** - Same project, different CLI, zero friction
4. **Future-proofing** - Establish GSD as CLI-agnostic

## What Success Looks Like

1. User runs `npx get-shit-done-cc --codex` and GSD installs to `.codex/` (local)
2. User runs `npx get-shit-done-cc --codex-global` and GSD installs to `~/.codex/` (global)
3. All 24 GSD commands work in Codex CLI using prompts (`/gsd:command` format)
4. Specialized agents work in Codex (via skills, not custom agents since Codex lacks native support)
5. User can run `/gsd:new-project` in Claude, then `/gsd:plan-phase 1` in Codex, then `/gsd:execute-phase 1` in Copilot - all on the same `.planning/` directory
6. Documentation clearly explains implementation differences between CLIs

## Requirements

### Validated

*These capabilities already exist in the GSD codebase:*

- ✓ Command system with 24 GSD commands (new-project, plan-phase, execute-phase, etc.) — existing
- ✓ Multi-agent orchestration with 11 specialized agents — existing
- ✓ Template system with 21 document templates — existing
- ✓ Workflow orchestration layer with 12 workflow definitions — existing
- ✓ Installation system supporting Claude Code and GitHub Copilot CLI — existing
- ✓ Document-based state management via `.planning/` directory — existing
- ✓ Zero npm dependencies (pure Node.js standard library) — existing
- ✓ Cross-platform support (Mac, Windows, Linux) — existing

### Active

*New capabilities for Codex CLI support:*

- [ ] Codex CLI local installation (`--codex` flag) to `.codex/skills/get-shit-done/`
- [ ] Codex CLI global installation (`--codex-global` flag) to `~/.codex/skills/get-shit-done/`
- [ ] Codex prompt structure in `~/.codex/prompts/gsd/` for command invocation
- [ ] Adapt 24 GSD commands to Codex prompt format with argument handling
- [ ] Convert 11 specialized agents to Codex skills (since Codex lacks custom agent support)
- [ ] Installer detects Codex CLI and offers appropriate installation option
- [ ] Documentation: CLI comparison table (Claude vs Copilot vs Codex)
- [ ] Documentation: Implementation differences guide
- [ ] Documentation: Codex-specific setup instructions
- [ ] All existing GSD workflows function correctly in Codex CLI
- [ ] Verification that `.planning/` artifacts work across all three CLIs

### Out of Scope

- **Native Codex custom agents** — Codex CLI doesn't support custom agents like GitHub Copilot CLI does; we'll use skills as the equivalent mechanism
- **Codex-exclusive features** — Not building features that only work in Codex
- **Rewriting existing functionality** — Existing Claude/Copilot code remains unchanged unless required for Codex compatibility
- **IDE plugins** — Focus is CLI-only, not VS Code extensions or other IDEs
- **Breaking changes to existing installations** — Claude and Copilot users must not be affected

## Current Codebase Context

### What Already Exists

**Installation System:**
- `bin/install.js` - Node.js installer that deploys GSD to Claude/Copilot directories
- Supports flags: default (Claude global), `--copilot` (Copilot local), `--local` (Claude local)
- Rewrites paths in files during installation
- Zero npm dependencies (uses Node.js built-ins only)

**Command Structure:**
- 24 command definitions in `commands/gsd/*.md` and `.github/skills/get-shit-done/commands/gsd/*.md`
- Commands include frontmatter with metadata (name, description, allowed-tools)
- Commands reference workflows, templates, and agents via `@path` syntax

**Agent System:**
- 11 specialized agents in `agents/*.agent.md` and `.github/agents/*.agent.md`
- Agent definitions include role, tools, execution flow, and success criteria
- GitHub Copilot CLI has native custom agent support; Claude Code uses inline role adoption

**Template & Reference System:**
- 21 templates in `get-shit-done/templates/`
- 7 reference documents in `get-shit-done/references/`
- Used by commands, workflows, and agents to generate artifacts

**State Management:**
- All project state lives in `.planning/` directory
- Includes: PROJECT.md, ROADMAP.md, STATE.md, REQUIREMENTS.md, config.json, phases/
- CLI-agnostic design - any CLI can read/write these files

### What's Different About Codex CLI

**Architecture:**
- **Skills** instead of "custom agents" - Codex has skills (instructional packages) but not GitHub Copilot's custom agent system
- **Prompts as commands** - Codex uses `~/.codex/prompts/*.md` files as slash commands (`/command-name`)
- **MCP support** - Codex supports Model Context Protocol for tool/server integration
- **Subagent patterns** - Codex can spawn subagents via `codex exec` but it's not native like Copilot

**Installation Paths:**
- Global: `~/.codex/skills/get-shit-done/` (like Claude global)
- Local: `.codex/skills/get-shit-done/` (like Copilot local)
- Prompts: `~/.codex/prompts/gsd/` or `.codex/prompts/gsd/`

**Command Invocation:**
- Codex: `/gsd:new-project` (slash command from prompt file)
- Copilot: `gsd:new-project` (matched by skill description)
- Claude: `/gsd:new-project` (native slash command)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Single codebase for all CLIs | Maintain one source of truth; reduce duplication | All CLI variants generated from same source files |
| Use skills as agent equivalent in Codex | Codex lacks native custom agents; skills are closest mechanism | Convert each agent to a skill with specialized instructions |
| Prompts directory for commands | Codex's native way to expose slash commands | Create prompt files in `~/.codex/prompts/gsd/*.md` |
| Document implementation differences | Users need to understand what works differently across CLIs | Comprehensive comparison table in `/docs/cli-comparison.md` |
| Support both global and local Codex installs | Match existing Claude/Copilot flexibility | Two new flags: `--codex` (local), `--codex-global` (global) |
| No breaking changes to existing installs | Claude and Copilot users must not be affected | Extend installer, don't modify existing logic |

## Constraints

**Technical:**
- Must maintain zero npm dependencies (pure Node.js only)
- Must work on Node.js 16.7.0+
- Must work on Mac, Windows, Linux
- Cannot use Codex-exclusive APIs that don't exist in Claude/Copilot
- Must respect `.planning/` directory structure exactly as-is

**User Experience:**
- Installation must be single command (`npx get-shit-done-cc --codex`)
- Same commands must work across all three CLIs
- Switching CLIs mid-project must work seamlessly
- Documentation must be clear about differences

**Project:**
- User will validate in Codex CLI directly
- All 24 commands must be functional
- No timeline pressure, but completeness is required

## Open Questions

- None at this time. Research phase completed; implementation-ready.

## Related Context

**Technology Stack:**
- JavaScript (Node.js) - Installation and hooks
- Markdown - Agent definitions, command specs, templates
- JSON - Configuration files

**Existing CLI Support:**
- Claude Code: `~/.claude/get-shit-done/` (global) or `.claude/get-shit-done/` (local)
- GitHub Copilot CLI: `.github/skills/get-shit-done/` (local only)

**Codebase Map:**
- See `.planning/codebase/` for detailed architecture, conventions, and structure analysis

---

*Last updated: 2026-01-19 after initialization with brownfield codebase context*
