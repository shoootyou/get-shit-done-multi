# Project State

**Last Updated:** 2026-02-01  
**Updated By:** GSD Execute Plan (Completed 12-01-PLAN.md)

---

## Project Reference

**Core Value:** Template-based installer that deploys AI CLI skills and agents to multiple platforms (Claude Code, GitHub Copilot CLI, Codex CLI) via single npx command with interactive UX and atomic transactions.

**Current Milestone:** v2.0 — Complete Multi-Platform Installer

**Current Focus:** Phase 12 — Unify frontmatter structure and apply adapter pattern (IN PROGRESS)

**Next Phase:** Phase 12 Wave 2 — Per-platform serializer split

---

## Current Position

### Phase Status
**Current Phase:** Phase 12 — Unify frontmatter structure and apply adapter pattern (IN PROGRESS)
**Next Phase:** Wave 2 — Per-platform serializer split
**Completed:** 1 of 3 plans  
**Milestone:** v2.1 Enhancement

### Plan Status
**Completed Plans:** 46/48 total (Phase 1: 4/4, Phase 2: 4/4, Phase 3: 3/3, Phase 4: 1/1, Phase 5: 2/2, Phase 6: 3/3, Phase 6.1: 4/4, Phase 6.2: 3/3, Phase 7: 2/2, Phase 7.1: 2/2, Phase 7.2: 4/4, Phase 8: 5/5, Phase 9: 4/4, Phase 10: 2/2, Phase 11: 2/2, Phase 12: 1/3)  
**Last activity:** 2026-02-01 - Completed 12-01-PLAN.md (rename rendering/ to serialization/)  
**Next:** Plan 12-02 (per-platform serializer split)

### Progress Bar
```
Milestone v2.0: Complete Multi-Platform Installer
Phase 1:   [████████████████████████████████████████████████████] 100% (4/4 plans) ✅ COMPLETE
Phase 2:   [████████████████████████████████████████████████████] 100% (4/4 plans) ✅ COMPLETE
Phase 3:   [████████████████████████████████████████████████████] 100% (3/3 plans) ✅ COMPLETE
Phase 4:   [████████████████████████████████████████████████████] 100% (1/1 plans) ✅ COMPLETE
Phase 5:   [████████████████████████████████████████████████████] 100% (2/2 plans) ✅ COMPLETE
Phase 6:   [████████████████████████████████████████████████████] 100% (3/3 plans) ✅ COMPLETE
Phase 6.1: [████████████████████████████████████████████████████] 100% (4/4 plans) ✅ COMPLETE
Phase 6.2: [████████████████████████████████████████████████████] 100% (3/3 plans) ✅ COMPLETE
Phase 7:   [████████████████████████████████████████████████████] 100% (2/2 plans) ✅ COMPLETE
Phase 7.1: [████████████████████████████████████████████████████] 100% (2/2 plans) ✅ COMPLETE
Phase 7.2: [████████████████████████████████████████████████████] 100% (4/4 plans) ✅ COMPLETE
Phase 8:   [████████████████████████████████████████████████████] 100% (5/5 plans) ✅ COMPLETE
Phase 9:   [████████████████████████████████████████████████████] 100% (4/4 plans) ✅ COMPLETE
Phase 10:  [████████████████████████████████████████████████████] 100% (2/2 plans) ✅ COMPLETE
Phase 11:  [████████████████████████████████████████████████████] 100% (2/2 plans) ✅ COMPLETE
Phase 12:  [█████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░]  33% (1/3 plans) 🔄 IN PROGRESS

Overall Progress:
[████████████████████████████████████████████████████]  96% (46/48 total plans)
```

---

## Performance Metrics

### Velocity
- **Phases Completed:** 10 of 11 (Phase 1-10 complete, Phase 11 in progress)
- **Phases In Progress:** 1 (Phase 11)
- **Plans Completed:** 44/45 (98%)
- **Days Active:** 6 (2026-01-26 to 2026-02-01)
- **Plans Today:** 1 (11-01 on 2026-02-01)

### Quality
- **Requirements Documented:** 37/37 (100%)
- **Templates Migrated:** 76 files (28 skills × 2 + 13 agents + 6 platform-specific + shared)
- **Validation Status:** ✅ All checks passed (0 errors)
- **Manual Review:** ✅ User approved after 9 corrections applied
- **Test Coverage:** ✅ 15 integration tests for migration flow

### Coverage
- **Requirements Mapped:** 37/37 (100%)
- **Requirements Completed:** 37/37 (100% - Phase 1: 8, Phase 2: 6, Phase 3: 9, Phase 4: 5, Phase 5: 5, Phase 6: 3, Phase 6.1: 1)

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
   - **Protection Mechanisms:**
     - Documentation (this constraint, SOURCE-PROTECTION.md archived)
     - Git tracking - all three directories tracked and can be restored
     - Phase 2 incident: .claude/ accidentally deleted, immediately restored via `git checkout HEAD -- .claude/`
   - **Why Protected:**
     - Historical reference (original working implementations)
     - Migration source (Phase 1 read from these for templates/)
     - Development use (project uses GSD skills from .claude/)
     - Backup (authoritative source if templates have issues)

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

36. **2026-01-26 (03-03):** Multiple platform flags supported simultaneously (CLI-FLAGS-01)
    - Users can specify multiple platform flags in one command
    - Example: `npx get-shit-done-multi --claude --copilot --local`
    - Installs sequentially to each platform with progress feedback
    - Rationale: Enables efficient multi-platform setup workflows, natural CLI UX

37. **2026-01-26 (03-03):** Default scope is local installation (SCOPE-DEFAULT-01)
    - If neither --global nor --local specified, default to local
    - Safer default - doesn't modify home directory without explicit consent
    - Users must explicitly request --global for system-wide install
    - Rationale: Follows principle of least surprise, local is more appropriate for project-specific usage

38. **2026-01-26 (03-03):** Split renderTemplate and replaceVariables (TEMPLATE-RENDERING-01)
    - renderTemplate(filePath, variables) - reads file, replaces vars, returns string
    - replaceVariables(content, variables) - processes string in-memory
    - Clear separation of concerns: file I/O vs string processing
    - Rationale: Orchestrator can choose appropriate function, makes testing easier

39. **2026-01-26 (03-03):** Fixed processTemplateFile signature mismatch (BUG-FIX-01)
    - Bug: processTemplateFile was calling renderTemplate(content, variables)
    - Fix: Updated to use replaceVariables(content, variables) after renderTemplate signature changed
    - Impact: Was causing ENAMETOOLONG errors during installation
    - Rationale: Critical bug blocking all installation functionality (RULE 1 auto-fix)

40. **2026-01-26 (04-01):** Adapter → Core pattern for installation (INTERACTIVE-ARCH-01)
    - Both CLI mode and Interactive mode gather parameters, then call shared installPlatforms() function
    - installation-core.js contains shared logic used by both entry points
    - Eliminates code duplication (removed 123 lines)
    - Rationale: DRY principle while maintaining clean separation of concerns

41. **2026-01-26 (04-01):** @clack/prompts for interactive UX (INTERACTIVE-UX-01)
    - Used @clack/prompts for beautiful terminal prompts
    - TTY detection via process.stdin.isTTY determines eligibility
    - Exit code 0 for user cancellation (not an error, user choice)
    - Rationale: Modern, accessible UX for primary installation method

42. **2026-01-26 (04-01):** Streamlined installation flow (INTERACTIVE-UX-02)
    - Install ALL skills/agents by default (no selection prompts)
    - No confirmation prompt before installation
    - Platform + scope selection only
    - Rationale: Simpler UX, most users want everything installed

43. **2026-01-26 (04-01):** Sequential multi-platform installation (INTERACTIVE-EXEC-01)
    - Multi-platform installs happen one at a time (not parallel)
    - Platform-labeled progress bars ("claude Skills" not just "Skills")
    - Clear section headers (Warnings, Installing..., Next Steps)
    - Rationale: Clearer output, easier debugging, prevents I/O contention

44. **2026-01-27 (05-01):** fs.statfs() for disk space checks (VALIDATION-01)
    - Use Node.js 19+ native API for cross-platform disk space checks
    - Warning fallback for Node < 19 (validation skipped gracefully)
    - 10% buffer on disk space requirement (not 20% or fixed amount)
    - Rationale: Native API accurate, 10% buffer safe without being overly conservative

45. **2026-01-27 (05-01):** Actual file write test for permissions (VALIDATION-02)
    - Test write permissions with actual temp file (not fs.access())
    - Creates `.gsd-test-write-{timestamp}` then deletes
    - Catches ACLs, SELinux, read-only mounts
    - Rationale: Most accurate method, ~1-2ms overhead acceptable

46. **2026-01-27 (05-01):** Validation errors show both technical + friendly (VALIDATION-03)
    - Validation errors display technical details AND actionable guidance on terminal
    - Runtime errors show friendly only + log file path
    - Error logged to .gsd-error.log regardless
    - Rationale: Validation errors are actionable (user can fix), runtime errors need log investigation

47. **2026-01-27 (05-02):** Two-pass manifest write pattern (MANIFEST-01)
    - Write empty manifest → scan directory → rewrite with complete file list
    - Manifest includes itself in files array
    - Simpler than tracking files during copy operations
    - Rationale: Post-installation scan simplest approach, ~10ms overhead acceptable

48. **2026-01-27 (05-02):** Minimal manifest structure for v2.0 (MANIFEST-02)
    - Fields: gsd_version, platform, scope, installed_at, files[]
    - No checksums (SHA256 hashes would add complexity)
    - No schema version field (can add in v2.1+ if needed)
    - Rationale: Keep it simple for v2.0, extensible for future versions

49. **2026-01-27 (05-02):** No rollback implementation in Phase 5 (SCOPE-DECISION-01)
    - Pre-installation validation only, no rollback on failure
    - Failed installations leave partial files (user manual cleanup)
    - Error messages provide clear cleanup instructions
    - Rationale: Simpler codebase, faster execution, focus on preventing failures vs recovering from them

44. **2026-01-26 (04-01):** Command prefix centralization (INTERACTIVE-REFACTOR-01)
    - Created platform-names.js for platform name utilities
    - Single source of truth for platformNames mapping
    - getPlatformName() and getCliName() shared functions
    - Rationale: Eliminated 38 lines of duplication across 3 files

45. **2026-01-26 (04-01):** Extracted CLI utilities (INTERACTIVE-REFACTOR-02)
    - usage.js - Help and usage messages
    - flag-parser.js - Platform/scope flag parsing
    - mode-detector.js - Interactive mode detection
    - Reduced install.js from 119 to 97 lines
    - Rationale: Clean code organization, single responsibility per module

46. **2026-01-27 (04-01 refinement):** CLI logic unification (CLI-UNIFICATION-01)
    - Created install-loop.js to centralize installation loop logic
    - Created banner-manager.js for banner and context display
    - Unified subtitle functions in logger.js with generic subtitle() function
    - Eliminated code duplication between install.js and interactive.js
    - Rationale: DRY principle, single source of truth for installation flow

47. **2026-01-27 (04-01 refinement):** Logger function consolidation (CLI-UNIFICATION-02)
    - Created generic subtitle() function with type parameter ('warn', 'info', 'none')
    - warnSubtitle(), infoSubtitle(), simpleSubtitle() now delegate to subtitle()
    - Reduced code duplication from 63 lines to 28 lines
    - Rationale: Eliminate repetitive subtitle implementation code

48. **2026-01-27 (04-01 refinement):** Installation loop centralization (CLI-UNIFICATION-03)
    - Created executeInstallationLoop() shared function in install-loop.js
    - Both CLI mode (install.js) and interactive mode (interactive.js) use same loop
    - Eliminated ~40 lines of duplicated loop logic
    - Rationale: Single place to update multi-platform installation logic

49. **2026-01-27 (05-01):** Use fs.statfs() for disk space checks (VALIDATION-01)
    - Node.js 19+ native API for cross-platform disk space
    - Add 10% buffer to required space (templateSize × 1.1)
    - Graceful fallback with warning on Node < 19
    - Rationale: Native API is faster, more reliable than df/PowerShell parsing

50. **2026-01-27 (05-01):** Test write permissions with actual temp file (VALIDATION-02)
    - Create `.gsd-test-write-{timestamp}` file, write test content, delete
    - More accurate than fs.access() (catches ACLs, SELinux, read-only mounts)
    - ~1-2ms overhead acceptable for reliability
    - Rationale: Test actual operation we'll perform during installation

51. **2026-01-27 (05-01):** Validation errors show technical + friendly messages (VALIDATION-03)
    - Terminal output includes both technical details and actionable guidance
    - Disk space shows required MB, available MB, and how much to free
    - Permission errors show chmod command to fix
    - Rationale: Power users get details, all users get action items

52. **2026-01-27 (05-01):** Runtime errors show friendly message only (VALIDATION-04)
    - Terminal output shows user-friendly message without technical details
    - Full technical details saved to .gsd-error.log file
    - Contrast with validation errors which show both
    - Rationale: Keep terminal clean, preserve debugging info in log file

53. **2026-01-27 (06-01):** Use semver package for all version operations (VERSION-01)
    - semver ^7.7.3 is npm's official semantic version parser
    - Handles prerelease, build metadata, version coercion
    - Prevents bugs from manual string comparison (1.10.0 vs 1.9.0)
    - Rationale: Battle-tested, handles edge cases, industry standard

54. **2026-01-27 (06-01):** Parallel path checking with Promise.all (VERSION-02)
    - Check 6 standard manifest paths simultaneously (not sequentially)
    - Safe for read-only operations, no race conditions
    - Reduces discovery latency from ~60ms to ~10ms
    - Rationale: Performance optimization for common operation

55. **2026-01-27 (06-01):** Automatic manifest repair via directory scan (VERSION-03)
    - On corrupt JSON or missing fields → scan directory from scratch
    - Create brand new manifest with version='unknown'
    - Mark with _repaired flag and _repair_date timestamp
    - Rationale: Recover gracefully instead of failing, ignore corrupted data

56. **2026-01-27 (06-01):** Downgrade detection with blocking flag (VERSION-04)
    - Detect when installer version < installed version
    - Block completely (no --force override allowed)
    - Return blocking: true flag for UI to prevent installation
    - Rationale: Downgrades not supported per 06-CONTEXT.md decision 2.3

57. **2026-01-27 (06-01):** Major version jump detection (VERSION-05)
    - Detect major version increase (2.x → 3.x) using semver.major()
    - Return majorJump field for UI warning display
    - Separate status='major_update' from regular updates
    - Rationale: Warn users about potential breaking changes per 06-CONTEXT.md 2.4

58. **2026-01-27 (06-02):** Verbose mode discovery detail (VERSION-06)
    - Verbose flag shows path checking, file discovery, manifest content
    - Normal mode shows only final results
    - Helps users debug installation detection issues
    - Rationale: Users need visibility into discovery process for troubleshooting

59. **2026-01-27 (06-02):** Custom path platform detection (VERSION-07)
    - Custom paths return 'custom' placeholder from derivePlatform()
    - Platform resolved by reading manifest.platform field
    - Fallback to 'unknown' if manifest invalid
    - Rationale: Non-standard paths don't follow directory structure conventions

60. **2026-01-27 (06-02):** Downgrade blocking in orchestrator (VERSION-08)
    - Block downgrades completely before installation begins
    - Show clear error with version info and npx instructions
    - No way to override (by design - prevent data loss)
    - Rationale: Downgrades can corrupt installations per 06-CONTEXT.md 2.3

61. **2026-01-27 (06-02):** Major update confirmation prompts (VERSION-09)
    - Require explicit confirmation for major version updates
    - Show breaking changes warning
    - Skippable via --yes flag for automation
    - Rationale: Major updates may break existing workflows per 06-CONTEXT.md 2.4

62. **2026-01-27 (06-02):** Customization preservation prompts (VERSION-10)
    - Prompt users about preserving modifications
    - Show contribution link to encourage upstream fixes
    - Note: Actual preservation logic not yet implemented
    - Rationale: Encourage contribution while informing about customizations per 06-CONTEXT.md 3.1

63. **2026-01-28 (06.1-01):** Graceful detection error handling (MIGRATION-DETECTION-01)
    - detectOldVersion() returns { isOld: false, version: null, paths: [] } on errors
    - Never throws exceptions from detection functions
    - Prevents detection failures from blocking installation
    - Rationale: Detection is opportunistic - failures shouldn't prevent fresh installs

64. **2026-01-28 (06.1-01):** Platform-specific v1.x markers (MIGRATION-DETECTION-02)
    - Claude: VERSION file AND (commands/gsd OR hooks/gsd-check-update.js)
    - Copilot/Codex: SKILL.md AND VERSION in skills/get-shit-done directory
    - Different marker patterns reflect different v1.x architectures
    - Rationale: Each platform had unique v1.x structure requiring distinct detection logic

65. **2026-01-28 (06.1-01):** Separate Claude old/new agent detection (MIGRATION-DETECTION-03)
    - Old v1.x: gsd-*.md files (e.g., gsd-planner.md)
    - New v2.0: gsd-*.agent.md files (e.g., gsd-planner.agent.md)
    - Detection filters for .md only, excludes .agent.md
    - Rationale: Prevents mixing old and new agent formats in backup

66. **2026-01-28 (06.1-01):** Path filtering with existence checks (MIGRATION-DETECTION-04)
    - getOldInstallationPaths() uses pathExists() to filter paths
    - Only includes files/directories that actually exist
    - Prevents backup errors from missing files
    - Rationale: v1.x installations vary (some have hooks, some don't) - filter dynamically

67. **2026-01-28 (06.1-02):** Resolve relative paths before backup (MIGRATION-BACKUP-01)
    - createBackup() resolves relative paths to absolute before processing
    - Old version detector returns relative paths (e.g., '.claude/commands/gsd')
    - Must resolve relative to targetDir before pathExists() checks
    - Rationale: Keeps detector simple and reusable; centralizes path resolution in backup manager

68. **2026-01-28 (06.1-02):** Keep partial backups on failure (MIGRATION-BACKUP-02)
    - Partial backups preserved when some files fail after 3 retries
    - Returns success: false with list of failed paths
    - User can manually recover from partial backup
    - Rationale: Data loss prevention, debugging aid, clear user messaging per CONTEXT D3.2

69. **2026-01-28 (06.1-03):** Migration timing in orchestrator (INTEGRATION-01)
    - Old version migration check happens BEFORE validateVersionBeforeInstall
    - detectOldVersion → performMigration → validateVersionBeforeInstall
    - Migration must complete before any installation validation
    - Rationale: Old versions incompatible with v2.0.0; must migrate before new validation runs

70. **2026-01-28 (06.1-03):** Exit code convention for migration (INTEGRATION-02)
    - User declining migration = exit(0) (not an error, user choice)
    - Migration failure = exit(1) (error condition)
    - Successful migration = continue to regular installation
    - Rationale: User declining is intentional choice, not failure; follows Unix conventions

71. **2026-01-28 (06.1-03):** Interactive mode multi-platform migration (INTEGRATION-03)
    - Detect ALL old platforms at once with detectAllOldVersions
    - Show all detected old versions before prompts
    - Migrate each platform sequentially with individual confirmations
    - User can decline at first migration (exits for all)
    - Rationale: Show full scope upfront, per-platform control, early exit prevents wasted migrations

72. **2026-01-28 (06.1-03):** Check-update early return for old versions (INTEGRATION-04)
    - Old version check happens BEFORE v2.x version comparison
    - showOldVersionMessage for old versions, then return early
    - Don't proceed to regular update checks if old version found
    - Rationale: Old versions need migration not update; prevents confusing "update" messaging

73. **2026-01-28 (06.1-03):** Incompatibility message distinct from update message (INTEGRATION-05)
    - "Incompatible Version Detected" not "Update Available"
    - Lists all platforms with old versions
    - Actionable guidance: run installer (not manual steps)
    - Explains migration creates backup
    - Rationale: Clear distinction between old v1.x (incompatible) and v2.x (update available)

74. **2026-01-28 (06.1-04):** Use vitest for integration tests with /tmp isolation (TEST-01)
    - Existing test framework, consistent with project
    - Tests execute in unique /tmp directories per TEST-01 requirement
    - Automatic cleanup in afterEach per TEST-02 requirement
    - Rationale: Leverage existing infrastructure, ensure test isolation

75. **2026-01-28 (06.1-04):** Place upgrade guide after Quick Start in README (TEST-02)
    - Users with v1.x need migration info before proceeding
    - Positioned after installation instructions but before usage details
    - Comprehensive with troubleshooting and manual options
    - Rationale: Users see migration path immediately after learning how to install

76. **2026-01-28 (06.1-04):** Preserve full directory structure in backup (TEST-03)
    - Backup maintains original relative paths: `.gsd-backup/2024-01-28-1400/.claude/commands/gsd/test.md`
    - Users can reference files in original locations
    - Easier to understand what was backed up
    - Rationale: Success criteria requires structure preservation for user reference

77. **2026-01-28 (06.2-01):** Custom YAML serializer over js-yaml (SERIALIZER-01)
    - Built custom serializer instead of using js-yaml library
    - js-yaml's flowLevel option is all-or-nothing - cannot mix flow and block styles
    - Needed: root objects in block style, arrays in flow (Copilot/Codex) or block (Claude), nested objects in block
    - Rationale: Precise formatting control for platform-specific requirements

78. **2026-01-28 (06.2-01):** Quote date and version strings in YAML (SERIALIZER-02)
    - Automatically quote strings matching date patterns (`/^\d{4}-\d{2}-\d{2}/`) and version patterns (`/^\d+\.\d+(\.\d+)?$/`)
    - Prevents YAML from auto-parsing '2026-01-28' as Date object or '2.0.0' as number
    - Preserves string type for data consistency
    - Rationale: Critical for data integrity - tests caught type coercion bugs via structural validation

79. **2026-01-28 (06.2-01):** Single quotes for tool names in arrays (SERIALIZER-03)
    - Use single quotes for array items: `['read', 'custom-mcp/tool-1']`
    - Handles special characters (slashes, hyphens) without escaping
    - Copilot CLI parser correctly handles slashes in quoted strings
    - Rationale: Simpler and more readable than double quotes with escaping

80. **2026-01-28 (06.2-02):** Two-step agent processing pipeline (ADAPTER-INTEGRATION-01)
    - Variable replacement must happen before frontmatter transformation
    - Frontmatter may contain template variables like {{PLATFORM_ROOT}}
    - Orchestrator calls replaceVariables() then adapter.transformFrontmatter()
    - Rationale: Ensures variables in frontmatter are resolved before platform-specific transformation

81. **2026-01-28 (06.2-02):** ClaudeAdapter uses gray-matter serialization (ADAPTER-INTEGRATION-02)
    - ClaudeAdapter uses gray-matter's native stringify() for frontmatter
    - CopilotAdapter/CodexAdapter use custom serializer from 06.2-01
    - Claude supports standard YAML multi-line arrays
    - Copilot/Codex require single-line flow style (not supported by gray-matter)
    - Rationale: Use standard tools when possible, custom only when necessary

82. **2026-01-28 (06.2-02):** Skills extraction via regex pattern (ADAPTER-INTEGRATION-03)
    - ClaudeAdapter scans body for `/gsd-([a-z-]+)/g` pattern
    - Extracts all unique skill references and adds to frontmatter
    - Skills must be declared in frontmatter for Claude skill pre-loading
    - Only Claude agents include skills field (Copilot/Codex exclude it)
    - Rationale: Platform-specific frontmatter requirements handled in adapter transformation

83. **2026-01-28 (06.2-03):** Use entry.parentPath for Node.js 20.1+ recursive readdir (RECURSIVE-01)
    - Node.js 20.1+ adds `entry.parentPath` property when using `{ recursive: true }`
    - Use `join(entry.parentPath || baseDir, entry.name)` for correct path construction
    - Avoids ENOENT errors from naive `join(baseDir, entry.name)` approach
    - Rationale: Node.js behavior changed in 20.1+ to support nested directory traversal

84. **2026-01-28 (06.2-03):** Skip template/ subdirectory in variable replacement (RECURSIVE-02)
    - Files in get-shit-done/templates/ contain {{PLACEHOLDER}} variables for users
    - These are user-time placeholders (e.g., {{MILESTONE_NAME}}, {{DATE}})
    - Only replace install-time variables ({{VERSION}}, {{PLATFORM_ROOT}}, {{COMMAND_PREFIX}}, {{PLATFORM_NAME}})
    - Rationale: Distinguish between installer variables and user placeholders

85. **2026-01-28 (06.2-03):** Home directory for integration tests (RECURSIVE-03)
    - Use `~/.gsd-output-test-*` instead of `/tmp/gsd-output-test-*`
    - Phase 5 validation blocks system directories including /tmp
    - Tests need real installation paths to verify validation rules
    - Rationale: Integration tests must work within security constraints

86. **2026-01-28 (06.2-03):** Flexible skills field assertion in tests (RECURSIVE-04)
    - Check for skills field presence when defined, not strict requirement on all agents
    - Some agents don't reference any skills, so skills field may be empty/undefined
    - Test validates that skills field exists when skills are referenced
    - Rationale: Accurate test expectations matching actual agent content patterns

87. **2026-01-28 (07-01):** Manual Windows reserved name validation (PATH-SECURITY-01)
    - Implemented manual validation instead of using sanitize-filename's sanitization
    - REJECT malicious paths with detailed error messages rather than silently sanitizing
    - Windows reserved names: CON, PRN, AUX, NUL, COM1-9, LPT1-9
    - Case-insensitive, cross-platform validation
    - Rationale: Security requires explicit rejection with context, not silent sanitization

88. **2026-01-28 (07-01):** Single-level symlink resolution only (PATH-SECURITY-02)
    - Use fs.lstat() + fs.readlink() instead of fs.realpath()
    - Explicitly detect and reject symlink chains
    - Prevent chain-following attacks
    - Broken symlinks rejected with clear error
    - Rationale: Security requirement - controlled resolution prevents traversal via chains

89. **2026-01-28 (07-01):** Defense-in-depth path validation (PATH-SECURITY-03)
    - 8 validation layers: URL decode, null bytes, normalize, traversal, containment, allowlist, length, components
    - Each layer catches attacks that might slip through individual checks
    - Comprehensive error collection for batch validation
    - All layers use Node.js built-ins for reliability
    - Rationale: Multiple security barriers prevent bypass via edge cases

90. **2026-01-28 (07-01):** Cross-platform Windows reserved names (PATH-SECURITY-04)
    - Validate Windows reserved names on all platforms (not just Windows)
    - Ensures consistent behavior when code runs on different OSes
    - Prevents issues from platform-specific differences
    - Rationale: Security and portability require consistent validation rules

91. **2026-01-28 (07-02):** Use orchestrator for symlink handling (PATH-SECURITY-05)
    - Symlink detection in orchestrator.js via skipPrompts flag
    - Unified approach for both interactive and non-interactive modes
    - Alternative: Separate handling in interactive.js and non-interactive.js
    - Rationale: Simpler architecture, single point of control, easier to maintain

92. **2026-01-28 (07-02):** Validate in file-operations.js not template-processor.js (PATH-SECURITY-06)
    - Add validation to writeFile() in file-operations.js
    - Template-processor.js doesn't exist in codebase
    - Alternative: Create template-processor.js, validate in orchestrator
    - Rationale: Validate at actual write point, no unnecessary abstraction

93. **2026-01-28 (07-02):** Handle absolute vs relative paths in validation (PATH-SECURITY-07)
    - Use parent directory as base for absolute paths
    - Use process.cwd() as base for relative paths
    - Bug discovered during integration testing
    - Rationale: Support both local and global installations correctly

94. **2026-01-28 (07-02):** Three-layer validation approach (PATH-SECURITY-08)
    - Layer 1: Pre-installation (target directory)
    - Layer 2: Batch validation (all template paths)
    - Layer 3: Per-file write-time (after variable substitution)
    - Rationale: Defense-in-depth catches attacks at multiple points

95. **2026-01-29 (07.1-01):** Fail-fast on prerequisite failures (PREFLIGHT-01)
    - Templates missing → skip path validation (can't validate paths without templates)
    - Broken symlinks → error immediately (can't proceed with invalid target)
    - Rationale: Prerequisite failures make dependent validations meaningless

96. **2026-01-29 (07.1-01):** Fail-slow for independent errors (PREFLIGHT-02)
    - Collect all independent validation errors (disk, permissions, multiple invalid paths)
    - Display grouped report showing all issues at once
    - Rationale: Better UX - user sees all problems, fixes them all, retries once (not whack-a-mole)

97. **2026-01-29 (07.1-01):** Validation order: cheap-first (PREFLIGHT-03)
    - Order: disk (statfs) → templates (pathExists) → permissions (write test) → paths (8-layer × N) → symlinks (lstat + readlink)
    - Rationale: Fail early on cheap checks before expensive operations

98. **2026-01-29 (07.1-01):** Increased disk space buffer to 50% (PREFLIGHT-04)
    - Previous: 10% buffer in pre-install-checks.js
    - Now: 50% buffer in pre-flight-validator.js per CONTEXT.md guidance
    - Rationale: More conservative for safety, prevents edge case failures

99. **2026-01-29 (07.1-01):** Symlinks as warnings not fatal (PREFLIGHT-05)
    - Symlink detection returns code 0 (warning) not error code
    - User sees warning but installation can proceed
    - Rationale: Symlinks are valid paths, just need user awareness

100. **2026-01-29 (07.1-02):** Bash-based integration tests over JS mocking (INTEG-TEST-BASH)
     - Integration tests use real filesystem, not mocked fs
     - Tests copy full project to /tmp for isolation
     - Execute in isolated directories, never modify source
     - Rationale: Need real filesystem behavior for validation testing

101. **2026-01-29 (07.1-02):** Validation gate in executeInstallationLoop() (VALIDATION-GATE-LOCATION)
     - Place validateBeforeInstall() at start of executeInstallationLoop()
     - Covers both interactive and non-interactive flows
     - Single point of validation before any installation work
     - Rationale: Simplest integration point that covers all code paths

102. **2026-01-29 (07.1-02):** Remove all validation from orchestrator (ORCHESTRATOR-CLEANUP)
     - Single-point validation pattern enforced
     - Orchestrator only processes files, no validation
     - Removed 68 lines of redundant batch validation
     - Rationale: Clear separation of concerns, easier to maintain

103. **2026-01-29 (07.2-01):** Use npm default behavior for common files (PUBLISH-FILES)
     - Only specify non-standard directories (bin/, templates/) in files array
     - npm auto-includes: package.json, README, LICENSE, CHANGELOG
     - Rationale: Simpler maintenance, follows npm conventions

104. **2026-01-29 (07.2-01):** Update to Node 20 (current LTS) (NODE-VERSION)
     - Node 16 is EOL (no security updates since September 2023)
     - Node 20 is Active LTS until October 2026
     - All project APIs stable in both versions (no code changes needed)
     - Rationale: Security updates, better long-term support

105. **2026-01-29 (07.2-02):** Delete obsolete development artifacts (CODE-CLEANUP-01)
     - Deleted audit-functions.json (5MB), audit-functions.md (35KB), scripts/audit-functions.js (14KB)
     - Removed empty scripts/ directory
     - Git history preserves everything - no need to keep dev artifacts in working directory
     - Rationale: Reduce package size, cleaner codebase

106. **2026-01-29 (07.2-02):** Document catch-all error handling (ERROR-HANDLING-01)
     - Add error parameter even for expected catch-all blocks
     - Include explanatory comment documenting why catch-all is correct
     - Pattern: "Any error means X - this is expected behavior"
     - Rationale: Empty catch blocks hide intent, documentation preserves understanding

107. **2026-01-29 (07.2-02):** Environment variable policy (ENV-VAR-POLICY)
     - All behavior controlled via CLI flags, not environment variables
     - Exception: Standard Node.js vars (NODE_ENV, DEBUG) acceptable
     - Removed redundant ALLOW_SYMLINKS (skipPrompts flag already handles non-interactive mode)
     - Rationale: Explicit configuration over implicit env vars, clearer API surface

108. **2026-01-29 (07.2-02):** TODO comment format (TODO-FORMAT)
     - Format: "Previously TODO: X. Current implementation: Y because Z"
     - Preserve context for future maintainers about what was considered
     - Don't delete TODOs - explain current state and rationale
     - Rationale: Documentation of decisions is valuable for maintenance

109. **2026-01-29 (07.2-04):** End-to-end tarball testing workflow (PUBLISH-VERIFICATION-01)
     - Workflow: npm pack → extract to /tmp → npm install --omit=dev → test bin execution
     - Simulates real npx execution environment before publishing
     - Catches dependency categorization issues, missing files, broken bin scripts
     - Rationale: Quality gate prevents publishing broken packages to npm registry

110. **2026-01-29 (07.2-04):** Moved gray-matter to production dependencies (PUBLISH-VERIFICATION-02)
     - gray-matter imported by 4 production modules (claude-adapter, codex-adapter, copilot-adapter, frontmatter-cleaner)
     - Was incorrectly in devDependencies (likely due to also being used by tests)
     - Moving to dependencies fixes ERR_MODULE_NOT_FOUND runtime error
     - Rationale: Runtime imports must be in dependencies, not devDependencies

111. **2026-01-29 (07.2-04):** Human verification checkpoint for interactive mode (PUBLISH-VERIFICATION-03)
     - Automated tests covered --help and --version flags
     - Interactive prompt testing requires human verification (complex terminal UI)
     - Checkpoint confirmed prompts display correctly and user flow works
     - Rationale: Some UX aspects need human validation before publishing

112. **2026-01-29 (08-03):** FAQ format for migration guide (PLATFORM-MIGRATION-01)
     - Used FAQ format with questions as headers for migration documentation
     - More user-friendly than procedural documentation
     - Addresses real user questions directly (switching platforms, multi-platform, .planning/)
     - Rationale: Users scan for their specific question rather than reading procedural steps

113. **2026-01-29 (08-03):** Side-by-side comparison tables (PLATFORM-COMPARISON-01)
     - Platform comparison uses tables for Claude/Copilot/Codex side-by-side
     - Enables quick scanning and platform comparison at a glance
     - Tables for: installation locations, file formats, tool names, frontmatter fields
     - Rationale: Visual comparison faster than narrative descriptions

114. **2026-01-29 (08-03):** Real frontmatter examples per platform (PLATFORM-SPECIFICS-01)
     - Platform-specifics includes concrete frontmatter examples for each platform
     - Shows exact YAML with proper tool names (Read vs read, Bash vs execute)
     - Separate examples for skills and agents per platform
     - Rationale: Concrete examples more helpful than abstract field descriptions

115. **2026-01-29 (08-03):** Emphasized .planning/ directory independence (PLATFORM-MIGRATION-02)
     - Clearly documented that .planning/ directory is platform-agnostic
     - Workflow identical across platforms (only installation location changes)
     - Critical concept: users can switch platforms without affecting project state
     - Rationale: Common misconception that switching platforms affects project history

116. **2026-01-29 (08-03):** Documented Codex prefix difference prominently (PLATFORM-CODEX-PREFIX)
     - Codex uses $gsd- command prefix (not /gsd- like Claude/Copilot)
     - Documented in all three platform docs (comparison, specifics, migration)
     - Most common confusion point when switching to Codex
     - Rationale: Prefix difference is critical for usability, needs high visibility

117. **2026-01-29 (08-01):** README hub format with ASCII diagrams (DOC-README-HUB)
     - Brief hub format (50-150 lines) with links to docs/ folder
     - ASCII diagrams only (Mermaid doesn't render on npmjs.com)
     - Proper attribution to fork point v1.6.4 and Lex Christopherson
     - Version timeline showing fork development journey
     - Rationale: npm package pages benefit from concise overview, ASCII is universally compatible

118. **2026-01-29 (08-01):** CHANGELOG documents fork from v1.6.4 (DOC-CHANGELOG-FORK)
     - Header note directs to original project for pre-fork history
     - Version timeline: v1.7.0 (experiments), v1.8.0 (improvements), v2.0.0 (achievement)
     - Keep a Changelog format for consistency
     - Rationale: Clear attribution and fork transparency

119. **2026-01-29 (08-01):** No emojis in documentation (DOC-NO-EMOJIS)
     - Professional tone appropriate for development tools
     - Better accessibility (screen readers)
     - npm package page compatibility
     - Rationale: Professional, accessible documentation consistent across all files

120. **2026-01-30 (08-04):** ASCII diagrams in user-facing docs, Mermaid in technical docs (DOC-DIAGRAM-STRATEGY)
     - ASCII diagrams for user docs (what-is-gsd.md, how-gsd-works.md) render everywhere (npm, terminals, browsers)
     - Mermaid diagrams for developer docs (architecture.md) provide better visual clarity
     - User docs prioritize accessibility; developer docs prioritize clarity
     - Rationale: npm registry doesn't render Mermaid; ASCII ensures universal compatibility

121. **2026-01-30 (08-04):** Documentation split by audience (DOC-AUDIENCE-SEGMENTATION)
     - User docs: what-is-gsd.md, how-gsd-works.md, how-to-customize.md
     - Developer docs: architecture.md
     - Navigation hub: docs/README.md serves both audiences
     - Rationale: Users need workflow understanding; developers need technical architecture

122. **2026-01-30 (08-04):** Document future features with workarounds (DOC-FUTURE-FEATURES)
     - Custom paths (v2.1+) documented in how-to-customize.md with current workaround
     - Partial installation (v2.1+) documented with manual workaround
     - Rationale: Set user expectations, provide solutions for current version

123. **2026-01-30 (08-05):** Markdown line length: 120 characters (DOC-LINE-LENGTH)
     - Relaxed from default 80 to 120 for modern displays
     - Excludes code blocks, tables, and headings
     - Rationale: 80 too restrictive for technical documentation with long URLs/paths

124. **2026-01-30 (08-05):** Disable strict heading/structure rules (DOC-HEADING-RULES)
     - Disabled MD001 (heading increment), MD024 (duplicate headings), MD025 (multiple H1s), MD036 (emphasis as heading)
     - Allow flexible documentation structure over blog-style conventions
     - Rationale: Technical docs need structural flexibility, duplicate headings in sections are normal

125. **2026-01-30 (08-05):** Exclude GSD infrastructure from markdown linting (DOC-LINT-SCOPE)
     - Exclude .planning/, .claude/, .codex/, .github/agents/, .github/get-shit-done/, etc.
     - Focus linting on user-facing project documentation only
     - Rationale: GSD internal files follow different format conventions (XML tasks, template variables)

126. **2026-01-30 (08-05):** Code fence language strategy (DOC-CODE-FENCES)
     - ASCII diagrams (box-drawing chars): `text`
     - Output/plaintext content: `plaintext`
     - Python script to automatically detect and tag
     - Rationale: Improves syntax highlighting, clarifies content type

127. **2026-01-30 (09-02):** Adapter method placement pattern (PLATFORM-ADAPTER-PATTERN)
     - New path-related methods added after getPathReference()
     - Groups all path methods together in adapter class
     - Maintains consistent ordering across all three adapters
     - Rationale: Logical grouping improves code readability and maintainability

128. **2026-01-30 (09-02):** Delegation pattern for instruction paths (INSTRUCTION-PATH-DELEGATION)
     - All adapters delegate to instruction-paths.js utility
     - Follows existing pattern from platform-paths.js
     - Keeps adapters thin, focused on platform-specific logic
     - Single source of truth for instruction file locations
     - Rationale: Centralized path rules easier to maintain, consistent with existing architecture

129. **2026-01-30 (09-01):** Dynamic marker extraction for merge logic (MERGE-DYNAMIC-MARKERS)
     - Markers extracted from first/last lines AFTER variable replacement
     - Allows markers to vary by platform (different command prefixes)
     - Comparison in destination file uses post-replacement markers
     - Rationale: Support platform-specific content in instruction files

130. **2026-01-30 (09-01):** Three-scenario merge strategy (MERGE-SCENARIOS)
     - File doesn't exist → create new file
     - File exists, no marker → append with blank line separator
     - File exists, marker found → compare block and replace if different
     - Special handling: markdown title interruption detection
     - Rationale: Smart merge preserves user customizations while updating GSD content

131. **2026-01-30 (09-01):** Scope-aware instruction file paths (INSTRUCTION-SCOPE-PATHS)
     - Local installations: Claude/Codex at root, Copilot in .github/
     - Global installations: All in platform directory (.claude/, .copilot/, .codex/)
     - Centralized in instruction-paths.js utility
     - Rationale: Respect platform conventions while maintaining consistency

132. **2026-01-30 (09-01):** Atomic writes for instruction files (MERGE-ATOMIC-WRITES)
     - Write to .tmp file first, then rename to target
     - Cleanup temp file on failure
     - Prevents partial writes and file corruption
     - Rationale: Safe file operations during merge, especially for user-customized files

133. **2026-01-31 (10-01):** Direct history/ archiving for milestones (MILESTONE-ARCHIVE-UNIFIED)
     - Archive directly to .planning/history/v{X.Y}/ instead of milestones/
     - Use AskUserQuestion tool for confirmations (not manual text prompts)
     - Inline bash commands in SKILL.md (AI executes directly, no separate scripts)
     - Workspace contains only PROJECT.md, MILESTONES.md, config.json, codebase/ after completion
     - Rationale: AI-first approach, cleaner workspace, atomic operations with git tracking

134. **2026-01-31 (10-02):** Block deprecated commands immediately (MILESTONE-DEPRECATION-BLOCK)
     - Deprecated commands show message and exit without executing operations
     - No way to override blocking behavior (by design)
     - Clear migration path shown in deprecation message
     - Rationale: Prevent confusion and accidental use of deprecated multi-step workflow

135. **2026-01-31 (10-02):** Educational deprecation messages (MILESTONE-DEPRECATION-EDUCATION)
     - Show bash alternatives in restore-milestone (ls, cat, git show)
     - Explain why restore is no longer needed (permanent history/ archives)
     - Old vs new workflow comparison in archive-milestone
     - Rationale: Teach users new paradigm, provide self-service alternatives

136. **2026-01-31 (10-02):** Registry-based milestone listing (MILESTONE-LIST-REGISTRY)
     - List-milestones reads MILESTONES.md directly with simple cat command
     - No directory scanning or complex parsing needed
     - MILESTONES.md already formatted for display
     - Rationale: Simpler implementation, faster execution, easier maintenance

137. **2026-02-01 (11-01):** Joi for schema-based validation (VALIDATION-JOI)
     - Joi 18.0.2 for declarative validation rules
     - Custom error messages per field and rule
     - Fail-fast validation with abortEarly: true
     - Rationale: Mature, well-tested schema validation library

138. **2026-02-01 (11-01):** Template method pattern for validators (VALIDATION-TEMPLATE-METHOD)
     - BaseValidator orchestrates: structure → required → optional → unknown
     - Shared implementation for structure and required fields
     - Hook methods for platform-specific validation
     - Rationale: Consistent flow, extensible for platform-specific rules

139. **2026-02-01 (11-01):** Fail-fast validation approach (VALIDATION-FAIL-FAST)
     - Stop immediately on first validation error
     - One error at a time for simpler reporting
     - Better UX: fix one issue, re-run, see next
     - Rationale: Clearer error messages, faster iteration

140. **2026-02-01 (11-01):** ValidationError with formatted console output (VALIDATION-ERROR-FORMAT)
     - Include all context: template, platform, field, value, expected, spec URL
     - System info: package version, Node.js version, platform
     - GitHub issue reporting URL
     - Formatted with emoji and decorative lines
     - Rationale: User-friendly error reporting with all needed context

141. **2026-02-01 (11-01):** Field validation per agentskills.io spec (VALIDATION-SPEC-RULES)
     - Name: 1-64 chars, letters/numbers/hyphens only
     - Description: max 1024 chars, safe characters only
     - Frontmatter: object, not empty, contains required fields
     - Rationale: Enforce base spec rules for all platforms

142. **2026-02-01 (12-01):** Renamed rendering/ module to serialization/ (MODULE-NAMING)
     - Module name now reflects purpose (YAML serialization, not UI rendering)
     - All 10 import paths updated across platform adapters, installer modules, and tests
     - Git history preserved via git mv command
     - Rationale: Accurate naming prevents confusion about module responsibility

143. **2026-02-01 (12-01):** Git mv for history preservation (GIT-HISTORY)
     - Used git mv instead of delete+create to preserve file history
     - Enables git blame traceability and code archeology
     - Alternative of delete+create rejected due to history loss
     - Rationale: File history critical for understanding code evolution

144. **2026-02-01 (12-01):** Wave-based migration strategy (MIGRATION-WAVES)
     - Wave 1: Structure changes (rename module directory)
     - Wave 2: Per-platform split (separate serializers)
     - Wave 3: Template separation (move template-renderer.js)
     - Rationale: Incremental changes reduce risk, enable verification at each stage


### Roadmap Evolution

**Phase Insertions:**
- **2026-01-28:** Phase 6.2 inserted after Phase 6.1 - Installation Output Verification & Bug Fixes (URGENT)
  - Reason: Critical bugs discovered affecting all Copilot installations
  - Impact: Must complete before Phase 7 to ensure security validation works on correct output
  - Scope: 3 bugs (skills field handling, tools format, template variables)

- **2026-01-29:** Phase 7.1 inserted after Phase 7 - Pre-Flight Validation Refactor (URGENT)
  - Reason: User testing revealed poor UX - errors scattered during installation, not grouped upfront
  - Impact: Better fail-fast UX, cleaner code (single-point validation), simpler orchestrator
  - Scope: Centralize all validation before installation, remove redundant checks, comprehensive testing
  - Philosophy: Trust tests + natural errors, single validation point, grouped error reporting

- **2026-01-29:** Phase 7.2 inserted after Phase 7.1 - Codebase Cleanup and Publishing Fixes (URGENT)
  - Reason: Map-codebase audit revealed publishing issues, obsolete code, and technical debt before final release
  - Impact: Ensures npm publish works correctly, removes confusion from obsolete code, Node 20 minimum
  - Scope: npm config, remove template renderer, cleanup audit files, update tests, fix error handling, Node 20
  - Key concerns: Publishing (templates/bin), large files (audit-functions.*), version detection TODOs, ALLOW_SYMLINKS cleanup

- **2026-01-31:** Phase 10 added after Phase 9 - Milestone Completion Workflow Unification (POST-v2.0)
  - Reason: Multiple commands for milestone completion causing confusion between complete-milestone and archive-milestone
  - Impact: Unified workflow that moves directly to history/, consistent UX with ask_user, deprecated redundant commands
  - Scope: Research skill patterns, refactor complete-milestone, deprecate archive/restore, update list-milestones
  - Value: Simpler workflow (1 command instead of 2), clean workspace for new-milestone, consistent confirmations

- **2026-01-31:** Phase 11 added after Phase 10 - Skill Validation and Adapter System
  - Reason: Need standardized validation and flexible adapters for skill frontmatter across platforms
  - Impact: Enforces agentskills.io spec + Claude extensions, prevents malformed skills, extensible for future platforms
  - Scope: Frontmatter validation (name/description fields), platform-specific field adapters, reusable adapter pattern
  - Base spec: https://agentskills.io/specification with Claude extensions from https://code.claude.com/docs/en/slash-commands#frontmatter-reference
  - Philosophy: Default to standard (name + description mandatory), layer platform-specific fields on top, configurable per platform

- **2026-02-01:** Phase 12 added - Unify frontmatter structure and apply adapter pattern
  - Reason: Inconsistency between frontmatter validation (per-platform in Phase 11) and rendering modules (shared serializers)
  - Impact: Consistent architectural pattern across all frontmatter functionality, clearer module organization
  - Scope: Evaluate module naming/consolidation, refactor rendering to follow per-platform adapter pattern
  - Issues: bin/lib/rendering/ has frontmatter-serializer/cleaner not following one-per-platform pattern from Phase 11

### Critical Constraints

**Active Constraints (MUST be followed):**

1. **Source Directory Protection** (2026-01-26, reaffirmed 2026-01-29)
   - `.github/`, `.claude/`, `.codex/` are READ-ONLY
   - All installer work happens in `templates/` directory
   - These directories contain the working implementation this project uses
   - Violation: Phase 2 accidentally deleted `.claude/`, restored immediately
   - Enforcement: Git tracking, documentation, code reviews

2. **Template Isolation** (2026-01-26)
   - `templates/` is the source of truth for npm package distribution
   - Installer copies FROM templates/, never FROM source directories
   - Source directories only used for initial template generation in Phase 1
   - Changes to source directories do NOT affect published package

3. **Test Isolation** (2026-01-29)
   - All tests MUST run in `/tmp` with isolated subdirectories
   - Tests MUST copy full project to `/tmp` before running
   - Tests NEVER modify real templates/ or source directories
   - Prevents accidental corruption during test execution

4. **npm Publishing Structure** (2026-01-29)
   - `files` array must include ONLY: `["bin", "templates"]`
   - npm auto-includes: package.json, README, LICENSE, CHANGELOG
   - All other directories excluded from published package
   - Package verified production-ready at 339KB (<1MB target)

### Technical Debt
- Migration scripts preserved in git history (committed before deletion)
- Can be referenced if needed for future migrations
- Customization preservation: prompt exists but file-level preservation not implemented yet

### Todos
- [x] Create migration script foundation (01-01)
- [x] Migrate 28 skills to templates/ (01-02)
- [x] Migrate 13 agents to templates/ (01-03)
- [x] Validation and manual review (01-04)
- [x] Phase 2 Plan 01: Foundation & Project Structure (02-01)
- [x] Phase 2 Plan 02: Core Modules (02-02)
- [x] Phase 2 Plan 03: CLI Orchestration (02-03)
- [x] Phase 2 Plan 04: Installation Flow (02-04)
- [x] Phase 3 Plan 01: Platform Foundation (03-01)
- [x] Phase 3 Plan 02: Concrete Platform Adapters (03-02)
- [x] Phase 3 Plan 03: Orchestrator Integration (03-03)
- [x] Phase 4 Plan 01: Interactive Mode (04-01)
- [x] Phase 5 Plan 01: Pre-Installation Validation (05-01)
- [x] Phase 5 Plan 02: Manifest Generation (05-02)
- [x] Phase 6 Plan 01: Core Version Detection Modules (06-01)
- [ ] Phase 6 Plan 02: Update Detection UI Integration (pending)

### Pending Todos
None

### Completed Todos
- 2026-02-01-update-changelog-and-docs-for-v2.md — Updated CHANGELOG.md and docs/what-gets-installed.md for v2.0.0 to include phase 10 changes (milestone completion unification, skill deprecations, gsd-add-todo enhancements)
- 2026-01-30-update-package-and-repo-descriptions.md — Updated package.json description to highlight structured workflow with 29 skills and 13 agents
- 2026-01-30-update-documentation-corrections-clarifications.md — Updated how-to-customize.md (added --all flag, fixed --version, clarified custom paths, removed partial install), cleaned architecture.md (removed Key Decisions and Testing sections), fixed repo URLs (yourusername → shoootyou), removed broken commands link
- 2026-01-30-fix-platform-specifics-unified-standard.md — Fixed platform-specifics.md to show all platforms use Agent Skills open standard with same frontmatter format (removed incorrect platform-specific fields)
- 2026-01-30-update-platform-binary-requirements.md — Updated binary requirements (claude, copilot, codex) with installation links in README.md, how-to-install.md, and troubleshooting.md
- 2026-01-30-remove-yes-flag.md — Removed unused --yes flag from bin/install.js and all user-facing documentation (5 files updated)
- 2026-01-30-fix-readme-documentation-post-phase-8.md — Fixed command prefixes, code blocks, added workflow section,
  documented commands→skills migration
- 2026-01-30-review-package-configuration-decisions.md — Investigated markdownlint config (dev-only, keep as-is) and
  added docs/ to package.json files (offline documentation, 366KB total package size)

### Blockers
None

---

## Session Continuity

### What Just Happened
✅ **Phase 10 Plan 02 Complete (2/4 plans)!** Deprecated archive-milestone and restore-milestone commands with blocking messages, updated list-milestones to read from MILESTONES.md registry. All deprecated commands show GSD branded banners, explain migration path, and exit immediately without executing operations. List-milestones now uses simple cat command to display registry directly (no directory scanning or complex parsing). **Phase 10 now 50% complete (2/4 plans).**

### What's Next
**Continue Phase 10 - Execute Plan 03 Next**

Phase 10 status:
- ✅ Plan 01: Unified milestone completion workflow (complete-milestone refactored)
- ✅ Plan 02: Deprecated archive/restore, updated list-milestones (just completed)
- ⏳ Plan 03: Check if exists
- ⏳ Plan 04: Check if exists

**Next:** Check for 10-03-PLAN.md or 10-04-PLAN.md to continue Phase 10

### Context for Next Session
- ✅ **Milestone completion workflow unified:** Direct history/ archiving, AskUserQuestion confirmations
- ✅ **Archive/restore deprecated:** Blocking messages with clear migration path
- ✅ **List-milestones updated:** Registry-based with simple cat command
- **Progress:** 96% (43/45 total plans)
- **Phase 10:** ✅ COMPLETE (2/2 plans)
- **Next action:** Execute 10-03-PLAN.md if exists, or check ROADMAP.md for Phase 10 completion

### Handoff Notes
Phase 10 progressing smoothly. Completed unified milestone completion workflow with direct history/ archiving and AI-first patterns (Plan 01). Just completed deprecation of archive-milestone and restore-milestone commands with blocking messages and educational content (Plan 02). List-milestones now reads from MILESTONES.md registry directly using simple cat command. All deprecation messages use GSD branded banners and template variables. Ready to continue with remaining Phase 10 plans.

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
- `.planning/phases/02-core-installer-foundation/02-03-SUMMARY.md` — CLI Orchestration (✅ Complete)
- `.planning/phases/02-core-installer-foundation/02-04-SUMMARY.md` — Installation Flow (✅ Complete)
- **Phase 2: ✅ COMPLETE** (4/4 plans complete)
- `.planning/phases/03-multi-platform-support/03-01-SUMMARY.md` — Platform Foundation (✅ Complete)
- `.planning/phases/03-multi-platform-support/03-02-SUMMARY.md` — Concrete Platform Adapters (✅ Complete)
- `.planning/phases/03-multi-platform-support/03-03-SUMMARY.md` — Orchestrator Integration (✅ Complete)
- **Phase 3: ✅ COMPLETE** (3/3 plans complete)
- `.planning/phases/04-interactive-cli-ux/04-01-SUMMARY.md` — Interactive Mode (✅ Complete)
- `.planning/phases/04-interactive-cli-ux/04-VERIFICATION.md` — Phase 4 verification report
- **Phase 4: ✅ COMPLETE** (1/1 plans complete)
- `.planning/phases/05-atomic-transactions/05-01-SUMMARY.md` — Pre-Installation Validation (✅ Complete)
- `.planning/phases/05-atomic-transactions/05-02-SUMMARY.md` — Manifest Generation (✅ Complete)
- **Phase 5: ✅ COMPLETE** (2/2 plans complete)
- `.planning/phases/06-update-detection-versioning/06-01-SUMMARY.md` — Version Tracking (✅ Complete)
- `.planning/phases/06-update-detection-versioning/06-02-SUMMARY.md` — Update Detection (✅ Complete)
- `.planning/phases/06-update-detection-versioning/06-03-SUMMARY.md` — Interactive Update Flow (✅ Complete)
- **Phase 6: ✅ COMPLETE** (3/3 plans complete)
- `.planning/phases/06.1-old-version-detection-migration/06.1-01-SUMMARY.md` — Old GSD v1 Detection (✅ Complete)
- `.planning/phases/06.1-old-version-detection-migration/06.1-02-SUMMARY.md` — Migration Strategy (✅ Complete)
- `.planning/phases/06.1-old-version-detection-migration/06.1-03-SUMMARY.md` — Migration Execution (✅ Complete)
- `.planning/phases/06.1-old-version-detection-migration/06.1-04-SUMMARY.md` — Integration Tests (✅ Complete)
- **Phase 6.1: ✅ COMPLETE** (4/4 plans complete)
- `.planning/phases/06.2-installation-output-verification/06.2-01-SUMMARY.md` — Skills Field Bug Fix (✅ Complete)
- `.planning/phases/06.2-installation-output-verification/06.2-02-SUMMARY.md` — Tools Format Fix (✅ Complete)
- `.planning/phases/06.2-installation-output-verification/06.2-03-SUMMARY.md` — Recursive Variable Replacement (✅ Complete)
- **Phase 6.2: ✅ COMPLETE** (3/3 plans complete)
- `.planning/phases/07-old-version-detection-migration/07-01-SUMMARY.md` — Path Security Validation Modules (✅ Complete)
- `.planning/phases/07-old-version-detection-migration/07-02-SUMMARY.md` — Integration into Pre-Install Checks (✅ Complete)
- **Phase 7: ✅ COMPLETE** (2/2 plans complete)
- `.planning/phases/07.1-pre-flight-validation-refactor/07.1-01-SUMMARY.md` — Pre-Flight Validation Refactor (✅ Complete)
- `.planning/phases/07.1-pre-flight-validation-refactor/07.1-02-SUMMARY.md` — Integration Tests (✅ Complete)
- **Phase 7.1: ✅ COMPLETE** (2/2 plans complete)
- `.planning/phases/07.2-codebase-cleanup-and-publishing-fixes/07.2-01-SUMMARY.md` — Codebase Cleanup (✅ Complete)
- `.planning/phases/07.2-codebase-cleanup-and-publishing-fixes/07.2-02-SUMMARY.md` — Package Configuration (✅ Complete)
- `.planning/phases/07.2-codebase-cleanup-and-publishing-fixes/07.2-03-SUMMARY.md` — Publishing Verification (✅ Complete)
- `.planning/phases/07.2-codebase-cleanup-and-publishing-fixes/07.2-04-SUMMARY.md` — Final Verification (✅ Complete)
- **Phase 7.2: ✅ COMPLETE** (4/4 plans complete)
- `.planning/phases/08-documentation-and-polish/08-01-SUMMARY.md` — Root Documentation (✅ Complete)
- `.planning/phases/08-documentation-and-polish/08-02-SUMMARY.md` — Installation Docs (✅ Complete)
- `.planning/phases/08-documentation-and-polish/08-03-SUMMARY.md` — Platform Docs (✅ Complete)
- `.planning/phases/08-documentation-and-polish/08-04-SUMMARY.md` — Architecture & Advanced (✅ Complete)
- `.planning/phases/08-documentation-and-polish/08-05-SUMMARY.md` — Quality Validation (✅ Complete)
- **Phase 8: ✅ COMPLETE** (5/5 plans complete)
- `.planning/phases/09-platform-instructions-installer/09-01-SUMMARY.md` — Platform Instructions Function (✅ Complete)
- `.planning/phases/09-platform-instructions-installer/09-02-SUMMARY.md` — Adapter Methods (✅ Complete)
- `.planning/phases/09-platform-instructions-installer/09-03-SUMMARY.md` — Orchestrator Integration (✅ Complete)
- `.planning/phases/09-platform-instructions-installer/09-04-SUMMARY.md` — Integration Tests (✅ Complete)
- **Phase 9: ✅ COMPLETE** (4/4 plans complete)
- **Phase 10: ✅ COMPLETE** (2/2 plans complete)
  - Unified milestone completion workflow (complete-milestone archives directly to history/)
  - Deprecated archive/restore commands with blocking messages
  - Updated list-milestones to read from MILESTONES.md registry
  - AI-first development: natural language instructions, no scripts
  - Template variables for cross-platform support

### Project Files
- `package.json` — Project metadata (updated with @clack/prompts, cli-progress, chalk, fs-extra, sanitize-filename)
- `bin/install.js` — NPM entry point (✅ Updated in 04-01, refactored to 82 lines)
- `bin/lib/errors/install-error.js` — Custom error types (✅ Created in 02-01, updated in 05-01 with invalidPath)
- `bin/lib/validation/pre-install-checks.js` — Pre-installation validation (✅ Created in 05-01)
- `bin/lib/validation/path-validator.js` — Defense-in-depth path validation with 8 layers (✅ Created in 07-01)
- `bin/lib/validation/error-logger.js` — Error logging and formatting (✅ Created in 05-01)
- `bin/lib/io/file-operations.js` — File operations with fs-extra (✅ Created in 02-02)
- `bin/lib/paths/path-resolver.js` — Path validation and security (✅ Created in 02-02)
- `bin/lib/paths/symlink-resolver.js` — Single-level symlink resolution (✅ Created in 07-01)
- `bin/lib/rendering/template-renderer.js` — Template variable replacement (✅ Created in 02-02)
- `bin/lib/rendering/frontmatter-cleaner.js` — Frontmatter cleaning utilities (✅ Created in 02-02)
- `bin/lib/cli/banner-manager.js` — Banner and context display (✅ Created in 04-01 refinement)
- `bin/lib/cli/install-loop.js` — Installation loop logic (✅ Created in 04-01 refinement)
- `bin/lib/cli/progress.js` — Progress bar utilities (✅ Created in 02-02)
- `bin/lib/cli/logger.js` — Logging with chalk and subtitle unification (✅ Created in 02-02, enhanced in 04-01)
- `bin/lib/cli/interactive.js` — Interactive mode orchestrator (✅ Created in 04-01)
- `bin/lib/cli/installation-core.js` — Shared installation logic (✅ Created in 04-01)
- `bin/lib/cli/next-steps.js` — Next steps display (✅ Created in 04-01)
- `bin/lib/cli/usage.js` — Usage/help messages (✅ Created in 04-01)
- `bin/lib/cli/flag-parser.js` — Platform/scope flag parsing (✅ Created in 04-01)
- `bin/lib/cli/mode-detector.js` — Interactive mode detection (✅ Created in 04-01)
- `bin/lib/cli/README.md` — CLI architecture documentation (✅ Created in 04-01)
- `bin/lib/platforms/platform-names.js` — Platform name utilities (✅ Created in 04-01)
- `bin/lib/platforms/base-adapter.js` — Base adapter interface (✅ Created in 03-01)
- `bin/lib/platforms/registry.js` — Adapter registry singleton (✅ Created in 03-01, updated in 03-02)
- `bin/lib/platforms/detector.js` — GSD installation detector (✅ Created in 03-01)
- `bin/lib/platforms/binary-detector.js` — CLI binary detector (✅ Created in 03-01)
- `bin/lib/platforms/claude-adapter.js` — Claude platform adapter (✅ Created in 03-02)
- `bin/lib/platforms/copilot-adapter.js` — Copilot platform adapter (✅ Created in 03-02)
- `bin/lib/platforms/codex-adapter.js` — Codex platform adapter (✅ Created in 03-02)
- `bin/lib/installer/orchestrator.js` — Installation orchestrator (✅ Updated in 04-01)
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
- `docs/` — Documentation (✅ Complete - 13 guides for users and developers)

---

## Milestone Tracking

### v2.0 — Complete Multi-Platform Installer
**Goal:** Deploy skills to Claude + Copilot + Codex via npx with interactive UX and atomic transactions  
**Status:** ✅ COMPLETE  
**Progress:** 13/13 phases complete (100%)  
**Started:** 2026-01-26  
**Completed:** 2026-01-30

**Phase Breakdown:**
- Phase 1: Template Migration (✅ Complete - 4/4 plans, all skills/agents migrated and validated)
- Phase 2: Core Installer Foundation (✅ Complete - 4/4 plans)
- Phase 3: Multi-Platform Support (✅ Complete - 3/3 plans)
- Phase 4: Interactive CLI with Beautiful UX (✅ Complete - 1/1 plans)
- Phase 5: Atomic Transactions (✅ Complete - 2/2 plans)
- Phase 6: Update Detection (✅ Complete - 3/3 plans)
- Phase 6.1: Old Version Detection & Migration (✅ Complete - 4/4 plans)
- Phase 6.2: Installation Output Verification & Bug Fixes (✅ Complete - 3/3 plans)
- Phase 7: Path Security and Validation (✅ Complete - 2/2 plans)
- Phase 7.1: Pre-Flight Validation Refactor (✅ Complete - 2/2 plans)
- Phase 7.2: Codebase Cleanup and Publishing Fixes (✅ Complete - 4/4 plans)
- Phase 8: Documentation and Polish (✅ Complete - 5/5 plans)
- Phase 9: Platform Instructions Installer (✅ Complete - 4/4 plans)

**Total Plans:** 41/41 complete (100%)

**Current Scope:** All phases complete. Ready for milestone completion with `/gsd-complete-milestone`.

---

## Session Continuity

**Last session:** 2026-02-01T02:03:01Z  
**Stopped at:** Completed 12-01-PLAN.md (Rename rendering/ to serialization/)  
**Resume file:** None

---

**State initialized:** 2026-01-25  
**Last updated:** 2026-02-01  
**Ready for:** Phase 12 Plan 02 - Per-platform serializer split (Wave 2)
