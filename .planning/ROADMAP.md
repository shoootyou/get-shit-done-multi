# Project Roadmap

**Project:** GSD Multi-CLI Tool Support (Codex CLI Integration)  
**Created:** 2025-01-19  
**Total Phases:** 5  
**Depth:** Comprehensive

## Overview

Extend GSD from single-CLI to multi-CLI support (Claude Code, GitHub Copilot CLI, Codex CLI) using a plugin/adapter architecture. Each phase delivers a complete, verifiable capability that builds toward seamless CLI interoperability. The structure follows natural dependency chains: foundation infrastructure → CLI-specific adapters → agent translation → state interoperability → quality assurance.

## Phases

### Phase 1: Foundation — Installation Infrastructure ✓

**Goal:** Developers can install GSD to any target CLI with cross-platform reliability and version safety

**Status:** Complete (4 plans executed, all requirements satisfied)

**Dependencies:** None (foundational)

**Requirements:**
- INSTALL-01: Install locally to `.codex/skills/get-shit-done/` ✓
- INSTALL-02: Install globally to `~/.codex/skills/get-shit-done/` ✓
- INSTALL-03: Auto-detect installed CLIs ✓
- INSTALL-05: Preserve existing customizations and state ✓
- INSTALL-06: Handle version upgrades without data loss ✓
- INSTALL-07: Cross-platform path handling (Mac, Windows, Linux) ✓
- INSTALL-10: Clear success/failure messaging and next steps ✓

**Success Criteria:**
1. User runs `npx get-shit-done-cc --codex` and GSD installs to `.codex/skills/get-shit-done/` without errors on Mac, Windows, and Linux ✓
2. User runs `npx get-shit-done-cc --codex-global` and GSD installs to `~/.codex/skills/get-shit-done/` with correct home directory resolution across platforms ✓
3. Installer detects existing GSD installations (Claude Code, GitHub Copilot CLI, Codex CLI) and displays which CLIs are available for installation ✓
4. User upgrades from previous GSD version and all files in `.planning/` remain intact with no data loss ✓
5. Installation completes with clear messaging showing which CLI(s) were configured and what commands are now available ✓

**Plans:** 4 plans

Plans:
- [x] 01-01-PLAN.md — Foundation utilities (path handling and CLI detection)
- [x] 01-02-PLAN.md — Installer extension (Codex support and version management)
- [x] 01-03-PLAN.md — Integration verification (cross-platform testing)
- [x] 01-04-PLAN.md — Upgrade module integration (wire data preservation into installer)

---

### Phase 2: Adapter Implementation — Multi-CLI Deployment ✓

**Goal:** GSD commands deploy to all three target CLIs with correct format and directory structure for each platform

**Dependencies:** Phase 1 (requires path utilities, CLI detector, base installation framework)

**Requirements:**
- INSTALL-04: Install for all detected CLIs in a single run
- INSTALL-08: Post-install verification confirms commands are accessible
- CMD-07: Codex CLI commands use prompt files in correct directory
- CMD-10: Commands work with both global and local installations
- AGENT-02: GitHub Copilot CLI agents work with custom agent definitions
- AGENT-03: Codex CLI agents work as skills

**Success Criteria:**
1. User runs `npx get-shit-done-cc --all` and GSD installs to Claude Code (`.claude/`), GitHub Copilot CLI (`.github/skills/`), and Codex CLI (`.codex/`) in a single execution
2. User can invoke `/gsd:help` in Claude Code, GitHub Copilot CLI, and Codex CLI and sees consistent command listing
3. Post-install verification runs automatically and confirms all 24 GSD commands are accessible in each installed CLI
4. GSD agents appear in `.github/agents/` for GitHub Copilot and as skills in `.codex/skills/` for Codex with correct format conversion
5. User switches between global and local installations without path resolution errors

**Plans:** 4 plans (3 original + 1 gap closure)

Plans:
- [x] 02-01-PLAN.md — Create adapter layer architecture (CLI-specific modules + shared utilities)
- [x] 02-02-PLAN.md — Wire adapters into installer (refactor install.js with adapter pattern)
- [x] 02-03-PLAN.md — Add --all flag and enhanced verification (multi-CLI installation)
- [x] 02-04-PLAN.md — Gap Closure: Fix Codex global prompts directory copy

---

### Phase 3: Command System — Unified Command Interface ✓

**Goal:** All 24 GSD commands function identically across Claude Code, GitHub Copilot CLI, and Codex CLI

**Status:** Complete (3 plans executed, all requirements satisfied)

**Dependencies:** Phase 2 (requires adapters deployed)

**Requirements:**
- CMD-01: All 24 GSD commands work identically across three CLIs ✓
- CMD-02: Commands use `/gsd:command-name` syntax in all CLIs ✓
- CMD-03: Commands accept and process arguments correctly ✓
- CMD-04: Command errors translate to user-friendly messages ✓
- CMD-05: User can run same command in multiple CLIs and compare results ✓
- CMD-06: Command execution sequences can be recorded ✓
- CMD-08: Command help and usage accessible via `/gsd:help` ✓
- CMD-09: Commands handle missing dependencies or CLI limitations gracefully ✓

**Success Criteria:**
1. User runs `/gsd:new-project` in Claude Code, then `/gsd:plan-phase 1` in GitHub Copilot CLI, then `/gsd:execute-phase 1` in Codex CLI on same project and all commands execute successfully with correct argument handling ✓
2. User runs command with invalid arguments and receives clear, actionable error message explaining what went wrong and how to fix it (same error format across all CLIs) ✓
3. User accesses `/gsd:help` in each CLI and sees complete command listing with descriptions, arguments, and examples ✓
4. User runs a command that requires CLI-specific features and receives graceful degradation message explaining what's not available and suggesting workarounds ✓
5. User switches from one CLI to another mid-workflow and command history/context persists appropriately ✓

**Plans:** 3 plans

Plans:
- [x] 03-01-PLAN.md — Command System Infrastructure (registry, parser, loader)
- [x] 03-02-PLAN.md — CLI Integration & Help System (executor, error-handler, help-generator, gsd-cli)
- [x] 03-03-PLAN.md — Command Recording & Verification (recorder, verifier, test suite)

---

### Phase 4: Agent Translation — Orchestration Adaptation

**Goal:** GSD's 11 specialized agents function across all CLIs with documented capability differences

**Dependencies:** Phase 3 (requires commands functional)

**Requirements:**
- AGENT-01: All 11 GSD agents function in Codex CLI
- AGENT-04: Agent functionality equivalent across CLIs
- AGENT-05: Agent invocation transparent to user
- AGENT-06: Documentation explains agent feature differences per CLI
- AGENT-07: Unified agent registry shows availability per CLI
- AGENT-08: Agent results pass between CLIs when switching mid-project
- AGENT-09: Performance benchmarking per agent per CLI
- AGENT-11: All agents write to same `.planning/` directory structure

**Success Criteria:**
1. User invokes `gsd-executor` agent via `/gsd:execute-phase 1` and agent functions in Claude Code (native), GitHub Copilot CLI (custom agent), and Codex CLI (skill) with equivalent outputs
2. User reviews agent capability matrix showing which of the 11 agents are fully supported, partially supported, or unsupported in each CLI with clear explanations
3. User runs multi-phase workflow starting in Claude Code (planner), switching to Codex CLI (executor), then GitHub Copilot CLI (verifier) and each agent reads previous agent's outputs from `.planning/` directory without errors
4. User accesses performance data showing execution time for each agent in each CLI to make informed CLI selection decisions
5. User encounters agent limitation in Codex CLI and receives clear documentation explaining what works differently and why

**Plans:** 4 plans

Plans:
- [ ] 04-01-PLAN.md — Agent orchestration core (registry + invoker)
- [ ] 04-02-PLAN.md — Performance tracking (perf_hooks integration)
- [ ] 04-03-PLAN.md — Capability matrix and documentation
- [ ] 04-04-PLAN.md — Result validation and testing

---

### Phase 5: State Management — CLI Interoperability

**Goal:** Users can switch CLIs mid-project with full state consistency and zero data loss

**Dependencies:** Phase 4 (requires agents functional across CLIs)

**Requirements:**
- STATE-01: `.planning/` directory structure identical across CLIs
- STATE-02: User can start in Claude Code and resume in Codex CLI
- STATE-03: User can switch between CLIs mid-phase with consistent state
- STATE-04: Configuration in `.planning/config.json` respected by all CLIs
- STATE-05: Session persistence across CLI restart or switch
- STATE-06: Smart retry logic tries alternate CLI if command fails
- STATE-07: Cost tracking logs API usage per CLI
- STATE-08: State validation detects and repairs inconsistencies
- STATE-09: Concurrent CLI usage doesn't corrupt state
- STATE-10: State migration handles format changes across versions

**Success Criteria:**
1. User runs Phase 1 planning in Claude Code, then executes Phase 1 in GitHub Copilot CLI, then verifies Phase 1 in Codex CLI, and all three CLIs read/write to same `.planning/` directory with zero data loss or corruption
2. User has two terminal windows open (Claude Code and Codex CLI) working on same project simultaneously and state remains consistent without file conflicts or lost updates
3. User encounters CLI failure mid-command and GSD automatically retries with next available CLI from configured fallback order without user intervention
4. User reviews `.planning/usage.json` and sees API usage costs broken down by CLI, command, and agent for informed cost optimization
5. User upgrades GSD version and state migration tool automatically detects format changes, backs up existing state, and migrates to new format without data loss

---

### Phase 6: Documentation & Verification

**Goal:** Developers have comprehensive documentation, verification tools, and confidence that multi-CLI support works reliably

**Dependencies:** Phase 5 (requires all features implemented)

**Requirements:**
- INSTALL-09: Installer provides intelligent CLI selection recommendations
- DOCS-01: CLI comparison table (Claude vs Copilot vs Codex)
- DOCS-02: Implementation differences guide
- DOCS-03: Setup instructions for each CLI
- DOCS-04: Troubleshooting guide for CLI-specific issues
- DOCS-05: Migration guide for single-CLI to multi-CLI setup
- DOCS-06: Documentation generator auto-creates CLI comparison
- DOCS-07: Interactive capability matrix UI
- DOCS-08: Code examples for each CLI
- DOCS-09: Release notes indicate CLI-specific changes
- DOCS-10: Documentation versioned and remains accurate

**Success Criteria:**
1. User visits documentation and finds side-by-side comparison table showing exact command syntax, feature availability, and performance characteristics for Claude Code, GitHub Copilot CLI, and Codex CLI
2. User follows CLI-specific setup guide (e.g., "Getting Started with GSD in Codex CLI") and completes installation, runs first command, and understands key differences within 10 minutes
3. User encounters issue and finds solution in troubleshooting guide organized by CLI and common error patterns with exact commands to fix
4. User runs `/gsd:verify-installation` command and receives comprehensive report showing which CLIs are installed, which commands are available, which agents work, and any configuration warnings
5. User views interactive capability matrix (web or CLI) filtering by CLI, feature, or agent and sees real-time accuracy (auto-generated from codebase, not manually maintained)

---

## Progress

| Phase | Status | Completed |
|-------|--------|-----------|
| 1 - Foundation | Complete | 2026-01-19 |
| 2 - Adapter Implementation | Complete | 2026-01-19 |
| 3 - Command System | Complete | 2026-01-19 |
| 4 - Agent Translation | Pending | — |
| 5 - State Management | Pending | — |
| 6 - Documentation & Verification | Pending | — |

---

## Coverage Validation

**Total v1 Requirements:** 51  
**Requirements Mapped:** 51  
**Coverage:** 100% ✓

### Requirement Distribution

| Category | Phase(s) | Count |
|----------|----------|-------|
| Installation & Setup | 1, 2 | 10 |
| Command System | 3 | 10 |
| Agent/Subagent System | 2, 4 | 11 |
| State Management | 5 | 10 |
| Documentation | 6 | 10 |

---

*Roadmap created: 2025-01-19*  
*Next step: `/gsd:plan-phase 1` to begin implementation*
