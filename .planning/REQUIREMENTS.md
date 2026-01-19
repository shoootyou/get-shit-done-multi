# Requirements

## v1 Requirements

### Installation & Setup

- [x] **INSTALL-01**: User can run `npx get-shit-done-cc --codex` to install GSD locally to `.codex/skills/get-shit-done/`
- [x] **INSTALL-02**: User can run `npx get-shit-done-cc --codex-global` to install GSD globally to `~/.codex/skills/get-shit-done/`
- [x] **INSTALL-03**: Installer auto-detects which CLIs are installed (Claude Code, GitHub Copilot CLI, Codex CLI)
- [x] **INSTALL-04**: Installer offers to install for all detected CLIs in a single run
- [x] **INSTALL-05**: Installation preserves existing user customizations and state in `.planning/`
- [x] **INSTALL-06**: Installer handles version upgrades without data loss
- [x] **INSTALL-07**: Cross-platform path handling works correctly on Mac, Windows, and Linux
- [x] **INSTALL-08**: Post-install verification confirms all commands are accessible
- [ ] **INSTALL-09**: Installer provides intelligent CLI selection recommendations based on task type
- [x] **INSTALL-10**: Installation completes with clear success/failure messaging and next steps

### Command System

- [x] **CMD-01**: All 24 GSD commands work identically across Claude Code, GitHub Copilot CLI, and Codex CLI
- [x] **CMD-02**: User can invoke commands using `/gsd:command-name` syntax in all CLIs
- [x] **CMD-03**: Commands accept and process arguments correctly in each CLI
- [x] **CMD-04**: Command errors are translated to user-friendly messages regardless of CLI
- [x] **CMD-05**: User can run the same command in multiple CLIs and compare results
- [x] **CMD-06**: Command execution sequences can be recorded for documentation purposes
- [x] **CMD-07**: Codex CLI commands use prompt files in `~/.codex/prompts/gsd/` or `.codex/prompts/gsd/`
- [x] **CMD-08**: Command help and usage information is accessible via `/gsd:help` in all CLIs
- [x] **CMD-09**: Commands handle missing dependencies or CLI-specific limitations gracefully
- [x] **CMD-10**: Command invocation works with both global and local installations

### Agent/Subagent System

- [ ] **AGENT-01**: All 11 GSD agents (executor, planner, roadmapper, debugger, verifier, etc.) function in Codex CLI
- [x] **AGENT-02**: GitHub Copilot CLI agents continue working with custom agent definitions in `.github/agents/`
- [x] **AGENT-03**: Codex CLI agents work as skills since Codex lacks native custom agent support
- [ ] **AGENT-04**: Agent functionality is equivalent across CLIs (same inputs produce same outputs)
- [ ] **AGENT-05**: Agent invocation is transparent to user (they don't need to know implementation differs)
- [ ] **AGENT-06**: Documentation clearly explains which agent features work differently per CLI
- [ ] **AGENT-07**: Unified agent registry shows which agents are available in each CLI
- [ ] **AGENT-08**: Agent results can be passed between CLIs when switching mid-project
- [ ] **AGENT-09**: Performance benchmarking shows execution time per agent per CLI
- [ ] **AGENT-10**: Agent failures trigger smart retry logic (try different CLI if available)
- [ ] **AGENT-11**: All agents write to same `.planning/` directory structure regardless of CLI

### State Management

- [ ] **STATE-01**: `.planning/` directory structure works identically across all three CLIs
- [ ] **STATE-02**: User can start work in Claude Code and resume in Codex CLI without data loss
- [ ] **STATE-03**: User can switch between CLIs mid-phase and state remains consistent
- [ ] **STATE-04**: Configuration in `.planning/config.json` is respected by all CLIs
- [ ] **STATE-05**: Session persistence allows resuming work after CLI restart or switch
- [ ] **STATE-06**: Smart retry logic automatically tries alternate CLI if command fails
- [ ] **STATE-07**: Cost tracking logs API usage per CLI to `.planning/usage.json`
- [ ] **STATE-08**: State validation detects and repairs inconsistencies from CLI switches
- [ ] **STATE-09**: Concurrent CLI usage (two CLIs open simultaneously) doesn't corrupt state
- [ ] **STATE-10**: State migration handles format changes across GSD versions

### Documentation

- [ ] **DOCS-01**: CLI comparison table shows features side-by-side (Claude vs Copilot vs Codex)
- [ ] **DOCS-02**: Implementation differences guide explains what works differently per CLI
- [ ] **DOCS-03**: Setup instructions exist for each CLI (Claude Code, Copilot CLI, Codex CLI)
- [ ] **DOCS-04**: Troubleshooting guide covers CLI-specific common issues
- [ ] **DOCS-05**: Migration guide helps users transition from single-CLI to multi-CLI setup
- [ ] **DOCS-06**: Documentation generator auto-creates CLI comparison from code
- [ ] **DOCS-07**: Interactive capability matrix UI shows which features work in which CLIs
- [ ] **DOCS-08**: Code examples demonstrate usage in each CLI
- [ ] **DOCS-09**: Release notes clearly indicate CLI-specific changes
- [ ] **DOCS-10**: Documentation is versioned and remains accurate across releases

## v2 Requirements

*Potential future enhancements:*

- [ ] MCP (Model Context Protocol) integration for Codex CLI tool servers
- [ ] IDE plugin support beyond CLIs
- [ ] Real-time collaboration (multiple developers, multiple CLIs, same project)
- [ ] Advanced telemetry and analytics dashboard
- [ ] CLI-specific optimizations (use best CLI for each task automatically)
- [ ] Community skill/agent marketplace with multi-CLI compatibility badges
- [ ] Visual Studio Code extension with unified GSD interface
- [ ] Cloud-based state synchronization across machines

## Out of Scope

- **CLI emulation layer** — Not building one CLI to emulate another; each CLI uses native capabilities
- **Vendor lock-in** — Not forcing users to one CLI; true interoperability is the goal
- **Auto-installation without consent** — Will never install CLIs without user permission
- **Silent CLI switching** — User must explicitly choose or approve CLI changes
- **Single config format enforcement** — Each CLI can have its own config extensions
- **Real-time state polling** — State syncs on command invocation, not continuously
- **Complete feature parity requirement** — Some CLI-specific features are acceptable if documented
- **Output interception** — Not modifying CLI stdout/stderr; pass through as-is
- **Assumed shared context** — Each CLI invocation loads fresh context; no assumptions
- **Synchronous blocking across CLIs** — Commands in one CLI don't block commands in another
- **Backwards compatibility with pre-multi-CLI GSD versions** — v1 is a breaking change requiring reinstallation

## Traceability

*This section maps requirements to roadmap phases. Populated during roadmap creation.*

| Requirement | Phase | Status |
|-------------|-------|--------|
| INSTALL-01 | Phase 1 | Complete |
| INSTALL-02 | Phase 1 | Complete |
| INSTALL-03 | Phase 1 | Complete |
| INSTALL-04 | Phase 2 | Complete |
| INSTALL-05 | Phase 1 | Complete |
| INSTALL-06 | Phase 1 | Complete |
| INSTALL-07 | Phase 1 | Complete |
| INSTALL-08 | Phase 2 | Complete |
| INSTALL-09 | Phase 6 | Pending |
| INSTALL-10 | Phase 1 | Complete |
| CMD-01 | Phase 3 | Complete |
| CMD-02 | Phase 3 | Complete |
| CMD-03 | Phase 3 | Complete |
| CMD-04 | Phase 3 | Complete |
| CMD-05 | Phase 3 | Complete |
| CMD-06 | Phase 3 | Complete |
| CMD-07 | Phase 2 | Complete |
| CMD-08 | Phase 3 | Complete |
| CMD-09 | Phase 3 | Complete |
| CMD-10 | Phase 2 | Complete |
| AGENT-01 | Phase 4 | Pending |
| AGENT-02 | Phase 2 | Complete |
| AGENT-03 | Phase 2 | Complete |
| AGENT-04 | Phase 4 | Pending |
| AGENT-05 | Phase 4 | Pending |
| AGENT-06 | Phase 4 | Pending |
| AGENT-07 | Phase 4 | Pending |
| AGENT-08 | Phase 4 | Pending |
| AGENT-09 | Phase 4 | Pending |
| AGENT-10 | Phase 5 | Pending |
| AGENT-11 | Phase 4 | Pending |
| STATE-01 | Phase 5 | Pending |
| STATE-02 | Phase 5 | Pending |
| STATE-03 | Phase 5 | Pending |
| STATE-04 | Phase 5 | Pending |
| STATE-05 | Phase 5 | Pending |
| STATE-06 | Phase 5 | Pending |
| STATE-07 | Phase 5 | Pending |
| STATE-08 | Phase 5 | Pending |
| STATE-09 | Phase 5 | Pending |
| STATE-10 | Phase 5 | Pending |
| DOCS-01 | Phase 6 | Pending |
| DOCS-02 | Phase 6 | Pending |
| DOCS-03 | Phase 6 | Pending |
| DOCS-04 | Phase 6 | Pending |
| DOCS-05 | Phase 6 | Pending |
| DOCS-06 | Phase 6 | Pending |
| DOCS-07 | Phase 6 | Pending |
| DOCS-08 | Phase 6 | Pending |
| DOCS-09 | Phase 6 | Pending |
| DOCS-10 | Phase 6 | Pending |

---

*Requirements defined: 2026-01-19*  
*Total v1 requirements: 51*  
*Total v2 requirements: 8*  
*Out of scope: 11 explicit exclusions*
