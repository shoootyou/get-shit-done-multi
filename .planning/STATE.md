# Project State

**Last Updated:** 2026-01-26  
**Updated By:** GSD Phase Executor (Plan 03-02 complete - Concrete Platform Adapters)

---

## Project Reference

**Core Value:** Template-based installer that deploys AI CLI skills and agents to multiple platforms (Claude Code, GitHub Copilot CLI, Codex CLI) via single npx command with interactive UX and atomic transactions.

**Current Milestone:** v2.0 — Complete Multi-Platform Installer

**Current Focus:** ⚙️ Phase 3 In Progress (Plan 02/03 complete). Platform adapters created: ClaudeAdapter (capitalized tools, no metadata), CopilotAdapter (lowercase array with mappings, metadata), CodexAdapter (isolated duplicate of Copilot with $gsd- prefix). All registered in singleton registry. Orchestrator integration next.

---

## Current Position

### Phase Status
**Current Phase:** 3 of 8 (Multi-Platform Support) ⚙️ IN PROGRESS  
**Phase Goal:** Adapter pattern for Claude, Copilot, Codex with platform-specific transformations  
**Started:** 2026-01-26  
**Completed:** In progress  
**Verification:** TBD  
**Last Activity:** 2026-01-26 - Completed Plan 03-02 (Concrete Platform Adapters)

### Plan Status
**Completed Plans:** 8/35 total (Phase 1: 4/4, Phase 2: 2/4, Phase 3: 2/3)  
**Current Plan:** Phase 3 - Plan 03 (Orchestrator Integration)  
**Status:** Ready for Plan 03-03

### Progress Bar
```
Milestone v2.0: Complete Multi-Platform Installer
Phase 1: [████████████████████████████████████████████████████] 100% (4/4 plans) ✅ COMPLETE
Phase 2: [█████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░] 50% (2/4 plans) ⚙️ IN PROGRESS
Phase 3: [██████████████████████████████████░░░░░░░░░░░░░░░░░░] 67% (2/3 plans) ⚙️ IN PROGRESS

Overall Progress:
[███████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 23% (8/35 total plans)
```

---

## Performance Metrics

### Velocity
- **Phases Completed:** 1 (Phase 1 - Template Migration)
- **Phases In Progress:** 2 (Phase 2 - Core Installer Foundation, Phase 3 - Multi-Platform Support)
- **Plans Completed:** 8/35
- **Days Active:** 2
- **Plans Today:** 8

### Quality
- **Requirements Documented:** 37/37 (100%)
- **Templates Migrated:** 76 files (28 skills × 2 + 13 agents + 6 platform-specific + shared)
- **Validation Status:** ✅ All checks passed (0 errors)
- **Manual Review:** ✅ User approved after 9 corrections applied

### Coverage
- **Requirements Mapped:** 37/37 (100%)
- **Requirements Completed:** 14/37 (38% - Phase 1 complete + Phase 2 partial + Phase 3 partial)

---

## Accumulated Context

### Key Decisions

1. **2026-01-26:** Frontmatter corrections based on official Claude documentation
   - Skills use `allowed-tools` (not `tools`)
   - Skills use `argument-hint` (not `arguments` array)
   - Remove unsupported fields: skill_version, requires_version, platforms, metadata
   - Create version.json per skill for metadata preservation
   - Rationale: Align with official Claude slash-commands spec

2. **2026-01-26:** Agent frontmatter corrections differ from skills
   - Agents use `tools` (not `allowed-tools`)
   - Remove metadata block from frontmatter
   - Create single versions.json for ALL agents (not per-agent)
   - Auto-generate `skills` field by scanning agent content (Claude only)
   - Rationale: Agents have different spec than skills per Claude sub-agents docs

3. **2026-01-26:** Tool name mappings standardized
   - Copilot aliases → Claude official names
   - execute → Bash, search → Grep, agent → Task, etc.
   - Apply to both skills and agents
   - Reference: Copilot tool aliases documentation

4. **2026-01-26:** Source files are READ-ONLY
   - Never modify .github/, .claude/, or .codex/ directories
   - All work happens in templates/ directory
   - Source files preserved as reference and backup
   - Rationale: Prevent accidental corruption of working files

5. **2026-01-26:** Templates are source of truth for installation
   - templates/ directory is what gets copied during install
   - Source directories (.github/, etc.) only used for initial template generation
   - Installer reads from templates/, not from source
   - Rationale: Clear separation between development source and distribution templates

6. **2026-01-26 (01-01):** Use gray-matter for YAML parsing (MIGRATION-01)
   - Industry-standard library for frontmatter parsing
   - Handles edge cases better than manual parsing
   - Version 4.0.3 is stable release
   - Rationale: Battle-tested, reliable, widely used in ecosystem

7. **2026-01-26 (01-01):** Collect-all-errors validation pattern (MIGRATION-02)
   - Validator accumulates all errors before reporting
   - Better UX: see all issues at once, not fail-fast
   - Comprehensive reports grouped by file
   - Rationale: More efficient developer experience, faster iteration

8. **2026-01-26 (01-01):** ESM imports throughout migration scripts (MIGRATION-03)
   - All scripts use modern import/export syntax
   - Matches project conventions
   - Better static analysis support
   - Rationale: Modern Node.js standard, future-proof

9. **2026-01-26 (01-02):** Object-based argument conversion (MIGRATION-04)
   - Arguments can be simple strings OR objects with {name, type, required, description}
   - Converter extracts `name` property from objects for argument-hint
   - Handles both legacy simple format and modern structured format
   - Rationale: Skills use complex argument metadata that needs proper extraction

10. **2026-01-26 (01-02):** Confirmed 28 skills (not 29) (MIGRATION-05)
    - Source has 28 gsd-* skill directories
    - get-shit-done directory exists but is not a skill
    - Plan stated 29 but actual count is 28
    - Rationale: Accurate inventory for validation and tracking

11. **2026-01-26 (01-03):** Skill reference scanning patterns (MIGRATION-06)
    - Scan agent content for skill references: `/gsd-*`, `$gsd-*`, `` `gsd-*` ``, `\bgsd-*\b`
    - Cross-reference with actual skills directory to filter valid references only
    - Covers all skill invocation formats across platforms (Claude, Copilot, Codex)
    - Rationale: Auto-generate skills field accurately for agent frontmatter

12. **2026-01-26 (01-03):** Tools array to string conversion for agents (MIGRATION-07)
    - Agents use tools as comma-separated string vs skills use array format
    - Apply same tool name normalization (Copilot aliases → Claude names)
    - Example: `['read', 'write']` → `'Read, Write'`
    - Rationale: Agent spec differs from skill spec per TEMPLATE-01D

13. **2026-01-26 (01-03):** Consolidated versions.json for agents (MIGRATION-08)
    - Single versions.json for ALL agents instead of per-agent files
    - Skills use per-skill version.json, agents use consolidated approach
    - Agents share common metadata fields, consolidation reduces file count
    - Rationale: Metadata structure differs between skills and agents

14. **2026-01-26 (01-03):** Shared directory in templates (MIGRATION-09)
    - Copied entire get-shit-done/ directory to templates/
    - Includes references/, templates/, workflows/ subdirectories
    - Template variables injected in manifest and other files
    - Rationale: Shared resources distributed with installer, need template variable support

15. **2026-01-26 (01-04):** Platform-specific get-shit-done skill versions (MIGRATION-10)
    - Created three versions: claude/, copilot/, codex/ subdirectories
    - Each uses platform-appropriate command prefix and tool names
    - Phase 2 installer will copy correct version based on detected platform
    - Rationale: Each platform needs different command syntax for master skill

16. **2026-01-26 (01-04):** Templates use Claude format for tools field (MIGRATION-11)
    - Templates store tools as Claude format: comma-separated string with capitals
    - Phase 2 installers handle platform-specific translation during installation
    - Copilot needs array format with lowercase aliases: ["read", "edit", "execute"]
    - Codex uses same format as Claude (no translation needed)
    - Rationale: Single template format, translation belongs in installer logic

17. **2026-01-26 (02-01):** ESM modules throughout installer (INSTALLER-01)
    - All installer modules use import/export syntax
    - Use import.meta.url for __dirname replacement
    - Matches project conventions from Phase 1
    - Rationale: Modern Node.js standard, future-proof

18. **2026-01-26 (02-01):** cli-progress for progress bars (INSTALLER-02)
    - Chose cli-progress over ora (spinners)
    - Multi-phase installation benefits from % complete display
    - Version ^3.12.0, 5.5M+ weekly downloads
    - Rationale: Better UX for showing installation progress across skills/agents/shared

19. **2026-01-26 (02-01):** Custom error types with exit codes (INSTALLER-03)
    - InstallError class with code and details properties
    - EXIT_CODES constants (SUCCESS=0, INVALID_ARGS=2, etc.)
    - Factory functions for common errors (invalidArgs, missingTemplates, etc.)
    - Rationale: Programmatic error handling and proper exit status for scripts

20. **2026-01-26 (02-01):** Separation of concerns via bin/lib/ (INSTALLER-04)
    - Directory structure: io, rendering, paths, cli, errors
    - Each module has single responsibility
    - Clear organization for maintainability
    - Rationale: Follows established patterns for CLI tools

21. **2026-01-26 (02-02):** fs-extra for file operations (CORE-01)
    - Use fs-extra library for recursive directory copy
    - Handles edge cases (permissions, symlinks) better than manual fs.promises
    - Permission/space errors converted to InstallError
    - Rationale: Battle-tested, robust error handling, clean API

22. **2026-01-26 (02-02):** Simple string replacement for templates (CORE-02)
    - RegExp replacement instead of full templating engine
    - Limited variables (PLATFORM_ROOT, COMMAND_PREFIX, VERSION, PLATFORM_NAME)
    - No complex logic needed
    - Rationale: Minimal overhead, simpler and safer than eval-based solutions

23. **2026-01-26 (02-02):** Path traversal validation (CORE-03)
    - Validate paths with startsWith check and .. pattern detection
    - Prevents malicious paths during template installation
    - Throws InvalidArgs error on violation
    - Rationale: Critical security requirement to prevent attacks

24. **2026-01-26 (02-02):** cli-progress multi-bar display (CORE-04)
    - Use cli-progress MultiBar instead of single spinner
    - Shows % complete for each phase (skills, agents, shared)
    - Custom format with █/░ characters
    - Rationale: Better UX for long operations with visual progress feedback

25. **2026-01-26 (02-02):** Chalk for colored output (CORE-05)
    - Use chalk with unicode symbols (ℹ ✓ ⚠ ✗ →)
    - Standard library for terminal colors
    - Good cross-platform support
    - Rationale: Cleaner API than raw ANSI codes, better compatibility

26. **2026-01-26 (03-01):** Base adapter as abstract interface (PLATFORM-ABSTRACTION-01)
    - PlatformAdapter defines 6 required methods but not used as parent class
    - Concrete adapters (Claude, Copilot, Codex) will be ISOLATED
    - No inheritance between concrete adapters
    - Rationale: Code duplication preferred over coupling per PLATFORM-02 architectural rule

27. **2026-01-26 (03-01):** Registry singleton pattern (PLATFORM-ABSTRACTION-02)
    - AdapterRegistry uses Map storage for efficient lookups
    - Single instance exported and shared across modules
    - Prevents registration conflicts
    - Rationale: Central lookup point, O(1) access, consistent adapter access

28. **2026-01-26 (03-01):** GSD detection via manifest files (PLATFORM-ABSTRACTION-03)
    - Check for .gsd-install-manifest.json in platform directories
    - Supports future version tracking in Phase 6
    - Works across platforms without external dependencies
    - Rationale: Reliable installation detection, extensible for metadata

29. **2026-01-26 (03-01):** Binary detection separate from validation (PLATFORM-ABSTRACTION-04)
    - detectBinaries() used for recommendations only
    - detectInstallations() used for actual validation
    - User can install for platform they don't have yet
    - Rationale: Binary presence suggests intent but doesn't validate installation per PLATFORM-01B

30. **2026-01-26 (03-02):** ClaudeAdapter tool and frontmatter format (ADAPTER-01)
    - transformTools() keeps capitalized comma-separated string unchanged
    - transformFrontmatter() returns only name, description, tools (no metadata block)
    - Uses .md extension and /gsd- command prefix
    - Rationale: Claude uses capitalized tool names, minimal frontmatter per Claude spec

31. **2026-01-26 (03-02):** CopilotAdapter tool mappings and metadata (ADAPTER-02)
    - transformTools() converts to lowercase array with mappings (Read→read, Bash→execute, etc.)
    - transformFrontmatter() includes metadata block (platform, generated, versions)
    - Uses .agent.md extension and /gsd- command prefix
    - Rationale: Copilot uses lowercase tool aliases, requires metadata per Copilot spec

32. **2026-01-26 (03-02):** CodexAdapter isolation over inheritance (ADAPTER-03)
    - Extends ONLY PlatformAdapter, NOT CopilotAdapter
    - Duplicates 95% of CopilotAdapter code (transformTools, transformFrontmatter, toolMappings)
    - Only difference: uses $gsd- prefix instead of /gsd-
    - Rationale: Platform isolation over DRY per PLATFORM-02 architectural rule

33. **2026-01-26 (03-02):** Codex command prefix differentiation (ADAPTER-04)
    - getCommandPrefix() returns '$gsd-' for Codex vs '/gsd-' for Claude/Copilot
    - Only behavioral difference between Codex and Copilot adapters
    - Rationale: Distinguishes Codex command invocation syntax from other platforms

34. **2026-01-26 (03-02):** Tool mapping duplication (ADAPTER-05)
    - toolMappings dictionary duplicated in both CopilotAdapter and CodexAdapter
    - Could have been extracted to shared module
    - Chose duplication for platform isolation
    - Rationale: Platform-specific changes don't affect other platforms, enables independent evolution

35. **2026-01-26 (03-02):** Registry auto-initialization (ADAPTER-06)
    - AdapterRegistry constructor calls _initialize() method
    - All three adapters (claude, copilot, codex) registered on construction
    - Simple singleton pattern with immediate availability
    - Rationale: All adapters available immediately on registry import, no manual registration needed

### Technical Debt
- Migration scripts preserved in git history (committed before deletion)
- Can be referenced if needed for future migrations

### Todos
- [x] Create migration script foundation (01-01)
- [x] Migrate 28 skills to templates/ (01-02)
- [x] Migrate 13 agents to templates/ (01-03)
- [x] Validation and manual review (01-04)
- [x] Phase 2 Plan 01: Foundation & Project Structure (02-01)
- [x] Phase 2 Plan 02: Core Modules (02-02)
- [ ] Phase 2 Plan 03: CLI Orchestration
- [ ] Phase 2 Plan 04: Installation Flow
- [x] Phase 3 Plan 01: Platform Foundation (03-01)
- [x] Phase 3 Plan 02: Concrete Platform Adapters (03-02)
- [ ] Phase 3 Plan 03: Orchestrator Integration

### Blockers
None

---

## Session Continuity

### What Just Happened
✅ **Plan 03-02 Complete!** Created three concrete platform adapters in 281 seconds (4m 41s): (1) ClaudeAdapter (bin/lib/platforms/claude-adapter.js) - Extends PlatformAdapter, transformTools() keeps capitalized format unchanged, transformFrontmatter() returns minimal fields (no metadata), .md extension, /gsd- prefix; (2) CopilotAdapter (bin/lib/platforms/copilot-adapter.js) - Extends PlatformAdapter, transformTools() converts to lowercase array with mappings (Read→read, Bash→execute, etc.), transformFrontmatter() includes metadata block, .agent.md extension, /gsd- prefix; (3) CodexAdapter (bin/lib/platforms/codex-adapter.js) - Extends ONLY PlatformAdapter (NOT CopilotAdapter), duplicates 95% of Copilot code (intentional per PLATFORM-02), only difference is $gsd- prefix; (4) Registry integration - Added imports and _initialize() method to auto-register all three adapters on construction. getSupportedPlatforms() returns ['claude', 'copilot', 'codex']. All verification checks passed. Four atomic commits (6a95ab2, 588304b, 1a080d3, 7f73769). No deviations from plan.

### What's Next
1. **Immediate:** Plan 03-03 - Orchestrator Integration (Use adapters during installation flow)
2. **Phase 3 Focus:** Complete multi-platform support by integrating adapters into installation orchestration
3. **Critical:** Orchestrator will use adapterRegistry.get(platform) for adapter lookup
4. **Critical:** Tool transformations and frontmatter transformations will be applied during installation

### Context for Next Session
- **Platform adapters complete:** ✅ ClaudeAdapter, CopilotAdapter, CodexAdapter all created and registered
- **Adapter isolation enforced:** ✅ Each adapter extends ONLY PlatformAdapter (no cross-inheritance)
- **Tool transformations working:** ✅ Claude keeps capitalized, Copilot/Codex convert to lowercase array with mappings
- **Registry populated:** ✅ All three adapters registered, getSupportedPlatforms() returns all platform names
- **Code duplication intentional:** ✅ CodexAdapter duplicates Copilot (95% identical) per PLATFORM-02 isolation rule
- **Next action:** Create orchestrator module that uses adapters for platform-specific installation

### Handoff Notes
✅ Plan 03-02 complete! Three isolated platform adapters created and registered. ClaudeAdapter keeps template format unchanged (capitalized tools, no metadata). CopilotAdapter converts to lowercase array with tool mappings and adds metadata block. CodexAdapter duplicates Copilot implementation (intentional) with only $gsd- prefix difference. Registry auto-initializes all adapters on construction. All 6 adapter methods implemented for each platform. All verification tests passed. Ready for Wave 3 orchestrator integration. See 03-02-SUMMARY.md for complete details. No blockers.

---

## Files and Locations

### Planning Artifacts
- `.planning/PROJECT.md` — Project definition (core value, constraints)
- `.planning/REQUIREMENTS.md` — 37 v2.0 requirements with traceability
- `.planning/ROADMAP.md` — 7-phase structure with success criteria
- `.planning/STATE.md` — This file (project memory)
- `.planning/FRONTMATTER-CORRECTIONS.md` — Skills corrections specification
- `.planning/AGENT-CORRECTIONS.md` — Agents corrections specification
- `.planning/config.json` — Configuration (depth: comprehensive)

### Research Artifacts
- `.planning/research/SUMMARY.md` — Research synthesis
- `.planning/research/ECOSYSTEM.md` — Installer patterns
- `.planning/research/PLATFORMS.md` — Claude vs Copilot comparison (needs update)
- `.planning/research/DOMAIN.md` — Architecture approach
- `.planning/research/RISKS.md` — Critical risks

### Phase Plans
- `.planning/phases/01-template-migration/01-01-SUMMARY.md` — Migration foundation (✅ Complete)
- `.planning/phases/01-template-migration/01-02-SUMMARY.md` — Skills migration (✅ Complete)
- `.planning/phases/01-template-migration/01-03-SUMMARY.md` — Agents migration (✅ Complete)
- `.planning/phases/01-template-migration/01-04-SUMMARY.md` — Validation & manual review (✅ Complete)
- `.planning/phases/01-template-migration/01-MIGRATION-REPORT.md` — Comprehensive migration report
- **Phase 1: ✅ COMPLETE**
- `.planning/phases/02-core-installer-foundation/02-01-SUMMARY.md` — Foundation & Project Structure (✅ Complete)
- `.planning/phases/02-core-installer-foundation/02-02-SUMMARY.md` — Core Modules (✅ Complete)
- **Phase 2: ⚙️ IN PROGRESS** (2/4 plans complete)
- Next: Plan 02-03 - CLI Orchestration
- `.planning/phases/03-multi-platform-support/03-01-SUMMARY.md` — Platform Foundation (✅ Complete)
- `.planning/phases/03-multi-platform-support/03-02-SUMMARY.md` — Concrete Platform Adapters (✅ Complete)
- **Phase 3: ⚙️ IN PROGRESS** (2/3 plans complete)
- Next: Plan 03-03 - Orchestrator Integration

### Project Files
- `package.json` — Project metadata (updated with cli-progress, chalk, fs-extra dependencies)
- `bin/install.js` — NPM entry point with shebang (✅ Created in 02-01)
- `bin/lib/errors/install-error.js` — Custom error types (✅ Created in 02-01)
- `bin/lib/io/file-operations.js` — File operations with fs-extra (✅ Created in 02-02)
- `bin/lib/paths/path-resolver.js` — Path validation and security (✅ Created in 02-02)
- `bin/lib/rendering/template-renderer.js` — Template variable replacement (✅ Created in 02-02)
- `bin/lib/cli/progress.js` — Progress bar utilities (✅ Created in 02-02)
- `bin/lib/cli/logger.js` — Logging with chalk (✅ Created in 02-02)
- `bin/lib/platforms/base-adapter.js` — Base adapter interface (✅ Created in 03-01)
- `bin/lib/platforms/registry.js` — Adapter registry singleton (✅ Created in 03-01, updated in 03-02)
- `bin/lib/platforms/detector.js` — GSD installation detector (✅ Created in 03-01)
- `bin/lib/platforms/binary-detector.js` — CLI binary detector (✅ Created in 03-01)
- `bin/lib/platforms/claude-adapter.js` — Claude platform adapter (✅ Created in 03-02)
- `bin/lib/platforms/copilot-adapter.js` — Copilot platform adapter (✅ Created in 03-02)
- `bin/lib/platforms/codex-adapter.js` — Codex platform adapter (✅ Created in 03-02)
- `scripts/migrate-to-templates.js` — Main migration entry point (✅ Complete, preserved in git)
- `scripts/lib/frontmatter-parser.js` — YAML parser and validator (✅ Created)
- `scripts/lib/validator.js` — Error collection engine (✅ Created)
- `scripts/lib/template-injector.js` — Variable replacement (✅ Created)
- `scripts/lib/skill-migrator.js` — Skills migration engine (✅ Created)
- `scripts/lib/skill-scanner.js` — Skill reference scanner (✅ Created)
- `scripts/lib/agent-migrator.js` — Agents migration engine (✅ Created)
- `scripts/lib/interactive-review.js` — Manual review UI (✅ Created)
- `.github/skills/` — Source skills (28 directories, read-only reference)
- `.github/agents/` — Source agents (13 files, read-only reference)
- `templates/skills/` — Migrated skills (28 directories + platform-specific get-shit-done, ✅ Complete)
- `templates/agents/` — Migrated agents (13 files + versions.json, ✅ Complete)
- `templates/get-shit-done/` — Shared resources with template variables (✅ Complete)
- `get-shit-done/` — Source shared resources (read-only reference)
- `docs/` — Documentation (needs creation)

---

## Milestone Tracking

### v2.0 — Complete Multi-Platform Installer
**Goal:** Deploy skills to Claude + Copilot + Codex via npx with interactive UX and atomic transactions  
**Status:** Implementation Phase  
**Progress:** 1.67/7 phases complete (24%)  
**Started:** 2026-01-25  
**Target Completion:** TBD

**Phase Breakdown:**
- Phase 0: Documentation & Planning (✅ Complete - requirements documented)
- Phase 1: Template Migration (✅ Complete - all skills/agents migrated and validated)
- Phase 2: Core Installer Foundation (⚙️ In Progress - 2/4 plans complete)
- Phase 3: Multi-Platform Support (⚙️ In Progress - 2/3 plans complete)
- Phase 4: Interactive UX (Pending)
- Phase 5: Atomic Transactions (Pending)
- Phase 6: Update Detection (Pending)
- Phase 7: Path Security (Pending)
- Phase 8: Documentation (Pending)

**Current Scope:** Phase 3 Plan 02 complete - Three concrete platform adapters created (ClaudeAdapter, CopilotAdapter, CodexAdapter) with tool transformations, frontmatter transformations, and registry integration. Orchestrator integration next.

---

**State initialized:** 2026-01-25  
**Last updated:** 2026-01-26  
**Ready for:** Phase 3 Plan 03 - Orchestrator Integration
