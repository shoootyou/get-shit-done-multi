# Project State

**Project:** GSD Multi-CLI Tool Support (Codex CLI Integration)  
**Last Updated:** 2026-01-19  
**Status:** In Progress

---

## Project Reference

### Core Value
Enable developers to use GSD workflows in Codex CLI with the same power and reliability they experience in Claude Code and GitHub Copilot CLI, with seamless switching between all three CLIs on the same project.

### Current Focus
Command system development - building dynamic command infrastructure with registry, parser, loader, executor, and error handling.

---

## Current Position

**Phase:** 3 of 6 (Command System)  
**Plan:** 03 of 3 (completed)  
**Status:** Phase 3 complete - Ready for Phase 4  
**Progress:** `███████████` 100% (11 of 11 total plans complete)

**Last activity:** 2026-01-19 - Completed 03-03-PLAN.md (Command recording and verification)

**Next Action:** Execute 04-01-PLAN.md (Installation system - first plan of Phase 4)

---

## Performance Metrics

### Execution

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Phases Complete | 3/6 | 6/6 | In Progress |
| Requirements Delivered | ~18/51 | 51/51 | In Progress |
| Success Criteria Met | ~12/30 | 30/30 | In Progress |
| Blockers | 0 | 0 | ✓ |

### Quality

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| Test Coverage | — | 80%+ | Not Started |
| Integration Tests | — | All Pass | Not Started |
| Cross-Platform Tests | — | Mac/Win/Linux | Not Started |
| Documentation Complete | — | 100% | Not Started |

---

## Accumulated Context

### Decisions

| Phase | Plan | Decision | Rationale |
|-------|------|----------|-----------|
| 01 | 01 | Use path.join() exclusively | Cross-platform compatibility (Windows vs POSIX) |
| 01 | 01 | Detect CLIs via global config directory existence | Reliable detection method using fs.existsSync() |
| 01 | 01 | Zero npm dependencies - Node.js built-ins only | Reduces installation footprint, ensures stability |
| 01 | 02 | Use getConfigPaths('codex') for consistent path handling | Reuse existing utility from 01-01, maintains consistency |
| 01 | 02 | Follow Copilot installation pattern for Codex | Both use skills-based structure, different from Claude |
| 01 | 02 | Atomic backup/restore with timestamp-based naming | Prevents data loss, enables recovery from failed upgrades |
| 01 | 02 | Preserve .planning and user-data directories | User project data must survive version upgrades |
| 01 | 03 | Claude config path: ~/Library/Application Support/Claude | Actual path used by Claude CLI (not ~/.claude) |
| 01 | 03 | Copilot config path: ~/.copilot | Actual path used by Copilot CLI (not ~/.config/github-copilot-cli) |
| 01 | 03 | Codex should not install GitHub issue templates | Only relevant for .github/ installations (Claude/Copilot) |
| 01 | 04 | Check backups object before restore | Handle fresh installs gracefully when no existing data |
| 01 | 04 | Apply preserve/restore to all three CLI paths | Consistent data preservation across Claude, Copilot, Codex |
| 03 | 01 | Map-based storage for command registry | O(1) lookup performance, standard JavaScript data structure |
| 03 | 01 | Thin wrapper around util.parseArgs() | Avoid reimplementing argument parsing, use Node.js built-in |
| 03 | 01 | Singleton registry instance | Global command storage accessible across modules |
| 03 | 01 | YAML-like frontmatter parsing | Existing command files use key: value format, no full YAML parser needed |
| 03 | 01 | Async handler stubs during registration | Handlers return { prompt, args, metadata }, execution logic in next plan |
| 03 | 02 | Added detectCLI() to detect.js | Runtime CLI detection (missing from Phase 1) - uses env vars, cwd, and installed CLI detection |
| 03 | 02 | Special handling for gsd:help in executor | Direct help generation instead of prompt return for clean output |
| 03 | 02 | Use createRequire for CommonJS interop | detect.js is CommonJS, command-system is ES modules |
| 03 | 02 | Graceful degradation warnings | Continue execution with warnings for missing CLI features |
| 03 | 03 | JSON format for command recordings | Simple, human-readable format with timestamp, CLI, command, args, result, duration |
| 03 | 03 | Store recordings in .planning/command-recordings/ | Keeps recordings with project planning artifacts |
| 03 | 03 | No test framework dependency | Simple console.log assertions maintain zero-dependency goal |
| 03 | 03 | Structured verification results | { success, commandCount, issues } pattern for programmatic checks |

### Technical Discoveries

- **Cross-platform path handling:** path.join() handles Windows vs POSIX separators automatically
- **CLI detection pattern:** Check for global config directories
  - Claude: ~/Library/Application Support/Claude
  - Copilot: ~/.copilot
  - Codex: ~/.codex
- **Safe directory creation:** fs.mkdirSync({recursive: true}) is idempotent and safe
- **Codex installation structure:** Uses skills-based structure like Copilot (.codex/skills/get-shit-done/)
- **Atomic operations:** fs.renameSync() provides atomic backup/restore for data preservation
- **GitHub issue templates:** Only relevant for Claude and Copilot (install to .github/)
- **Command Registry Pattern:** Map-based storage with O(1) operations for command lookup
- **util.parseArgs() API:** Node.js built-in provides { values, positionals } format with strict: false for flexibility
- **Command file structure:** YAML-like frontmatter (---...---) followed by command prompt content
- **Dynamic command loading:** fs/promises.readdir() to discover .md files, parse and register automatically
- **Runtime CLI detection:** detectCLI() uses env vars (CLAUDE_CODE, COPILOT_CLI, CODEX_CLI), then cwd path matching, then single-CLI fallback
- **CommonJS/ES Module interop:** createRequire enables ES modules to import CommonJS without full file conversion
- **Help generation:** Auto-generate from command metadata (description, arguments, examples) with category grouping
- **Feature support matrix:** Track CLI capabilities (agent-delegation, task-tool, progressive-disclosure) for graceful degradation
- **Command recording pattern:** JSON files with timestamp, CLI, command, args, result, duration in .planning/command-recordings/
- **Verification pattern:** Structured results with success boolean and issues array for programmatic validation
- **Test pattern:** Simple console.log-based assertions with ✅/❌ markers, no test framework dependency

### Open Questions

1. **Codex CLI Version:** Research indicated conflicting version numbers (0.84.0 vs 0.87.0). Need to verify actual available version on npm before Phase 2 planning.
2. **Agent Orchestration in Codex:** How to achieve multi-step agent workflows in Codex CLI which lacks native agent delegation? Research needed during Phase 4 planning.
3. **Progressive Disclosure Limits:** Codex docs mention ~5,000 word guideline per skill. GSD's main skill is ~15,000 words. May need to split or test if guideline is enforced.

### Blockers

*None currently. Project is greenfield addition to existing codebase.*

### Todos

- [x] Complete Phase 1 Plan 01 (path utilities and CLI detection)
- [x] Complete Phase 1 Plan 02 (Codex installation and upgrade module)
- [x] Complete Phase 1 Plan 03 (installation testing and verification)
- [x] Complete Phase 1 Plan 04 (upgrade module integration)
- [x] Complete Phase 2 Plan 01 (adapter layer architecture)
- [x] Complete Phase 2 Plan 02-04 (CLI-specific adapters)
- [x] Complete Phase 3 Plan 01 (command system infrastructure)
- [x] Complete Phase 3 Plan 02 (command executor and error handler)
- [x] Complete Phase 3 Plan 03 (command recording and verification)
- [x] Phase 3 complete - Command system foundation ready
- [ ] Run Phase 1 verification to confirm all requirements satisfied
- [ ] Verify Codex CLI version on npm before Phase 2
- [ ] Research agent orchestration patterns for Codex before Phase 4

---

## Session Continuity

### For Next Session

**Context:** Phase 3 (Command System) complete. All command system infrastructure including registry, parser, loader, executor, error handler, help generator, recording, and verification complete.

**Starting Point:** 03-03-PLAN.md complete. Command system ready for Phase 4 (Installation System) integration.

**Key Context:**
- **Phase 3 Complete:** Command system foundation with all components
  - Command Registry: Map-based storage with O(1) lookup
  - Argument Parser: Thin wrapper around util.parseArgs()
  - Command Loader: Dynamic loading from filesystem with frontmatter parsing
  - Command Executor: CLI detection, feature checking, graceful degradation
  - Error Handler: CommandError class with suggestions and graceful degradation
  - Help Generator: Auto-generated from metadata, 4 categories, 24 commands
  - Command Recorder: JSON-based execution recording for cross-CLI comparison
  - Command Verifier: Installation validation checking all 24 commands
  - Test Suite: 17 automated tests covering all components
- **Zero npm dependencies maintained:** All using Node.js built-ins
- **Ready for Phase 4:** Installation system integration

**Last Session:** 2026-01-19 19:20-19:32 UTC
**Stopped at:** Completed 03-03-PLAN.md (Command recording and verification) - Phase 3 complete
**Resume file:** None

---

*State initialized: 2025-01-19*  
*Last updated: 2026-01-19*
