# Project Milestones: GSD Enhancements

## v1.7 Multi-CLI Support (Shipped: 2026-01-19)

**Delivered:** Complete OpenAI Codex CLI integration enabling seamless GSD workflows across Claude Code, GitHub Copilot CLI, and Codex CLI with full interoperability.

**Phases completed:** 6 phases (Foundation, Adapter Implementation, Command System, Agent Translation, State Management, Documentation & Verification)

**Key accomplishments:**

- Multi-CLI installation system supporting Codex CLI (global/local) alongside existing Claude and Copilot support
- Unified command system with 24 GSD commands working identically across all three CLIs
- Agent translation layer converting 11 specialized agents to Codex skills (Codex-compatible)
- Cross-CLI state management with atomic file operations, session persistence, and CLI resilience
- Comprehensive documentation with CLI comparison matrix, troubleshooting guides, and interactive capability browser
- Zero npm dependencies maintained throughout - pure Node.js built-ins only

**Stats:**

- 3 CLIs supported (Claude Code, GitHub Copilot CLI, Codex CLI)
- 24 commands + 11 agents fully functional across all platforms
- 6 phases, 29 plans executed
- 51/51 requirements shipped (100% coverage)
- Complete documentation generation infrastructure with pre-commit automation

**Git range:** Phase 1-6 implementation (2026-01-19)

**What's next:** Foundation ready for milestone lifecycle management and enhanced GSD capabilities

---

## v1.8 GSD Milestone & Codebase Management (Shipped: 2026-01-20)

**Delivered:** Complete milestone lifecycle management with archive, discovery, restore capabilities and accurate codebase mapping excluding infrastructure directories.

**Phases completed:** 1-4 plus 2.1 inserted (9 plans total)

**Key accomplishments:**

- Safe milestone archiving with git validation, atomic operations, and MILESTONES.md registry
- Codebase mapping exclusion system respecting .gitignore, custom config, and infrastructure directories
- Exclusion enforcement fix ensuring agents actually apply exclusions during analysis
- Discovery and restore commands for milestone safety valve with registry updates
- Workflow integration with verify→archive suggestion and clear next-step guidance

**Stats:**

- 201 files in project
- Markdown + JavaScript/TypeScript codebase
- 5 phases (4 planned + 1 inserted), 9 plans executed
- Single day execution (2026-01-20)
- 37/37 requirements shipped (100% coverage)

**Git range:** `994cf32` (first feat) → `8ba1648` (milestone complete)

**What's next:** Ready for next milestone planning with fresh requirements definition

---

## Registry

| Milestone | Archived | Requirements | Status | Commit | Location |
|-----------|----------|--------------|--------|--------|----------|
| v1.7-multi-cli-support | 2026-01-19 | 51 | archived | — | history/v1.7-multi-cli-support |
| v1.8-archive-foundation | 2026-01-20 | 37 | archived | b44f1fe | history/v1.8-archive-foundation |
