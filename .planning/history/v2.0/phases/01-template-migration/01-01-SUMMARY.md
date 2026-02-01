---
phase: 01-template-migration
plan: 01
subsystem: migration-infrastructure
tags:
  - migration
  - frontmatter
  - validation
  - template-variables
  - yaml
requires:
  - .planning/FRONTMATTER-CORRECTIONS.md
  - .planning/AGENT-CORRECTIONS.md
  - .planning/REQUIREMENTS.md
provides:
  - scripts/migrate-to-templates.js
  - scripts/lib/frontmatter-parser.js
  - scripts/lib/validator.js
  - scripts/lib/template-injector.js
affects:
  - 01-02 (Skills Migration)
  - 01-03 (Agents Migration)
  - 01-04 (Validation & Review)
tech-stack:
  added:
    - gray-matter@4.0.3
    - '@inquirer/prompts@8.2.0'
    - open@11.0.0
  patterns:
    - collect-all-errors validation
    - ESM module architecture
key-files:
  created:
    - scripts/migrate-to-templates.js
    - scripts/lib/frontmatter-parser.js
    - scripts/lib/validator.js
    - scripts/lib/template-injector.js
  modified:
    - package.json
decisions:
  - id: MIGRATION-01
    title: Use gray-matter for YAML parsing
    rationale: Industry-standard library, handles edge cases, widely tested
  - id: MIGRATION-02
    title: Collect-all-errors validation pattern
    rationale: Better UX - show all issues at once, not fail-fast
  - id: MIGRATION-03
    title: ESM import/export for migration scripts
    rationale: Align with modern Node.js, matches project patterns
metrics:
  duration: 106 seconds
  completed: 2026-01-26
---

# Phase 01 Plan 01: Migration Script & Frontmatter Parsing Summary

**One-liner:** Foundation for ONE-TIME migration with gray-matter YAML parser, collect-all-errors validator, and template variable injector.

## What Was Done

Created the complete foundation for Phase 1's ONE-TIME template migration:

1. **Installed migration dependencies:**
   - `gray-matter@4.0.3` - YAML frontmatter parsing
   - `@inquirer/prompts@8.2.0` - Interactive CLI
   - `open@11.0.0` - External diff viewer

2. **Created migration script infrastructure:**
   - Main entry point: `scripts/migrate-to-templates.js`
   - Frontmatter parser: `scripts/lib/frontmatter-parser.js`
   - Error collector: `scripts/lib/validator.js`
   - Template injector: `scripts/lib/template-injector.js`

3. **Implemented core functionality:**
   - **Frontmatter Parser:** Extracts and validates YAML against Claude/Copilot specs
   - **Validator:** Collect-all-errors pattern (not fail-fast), comprehensive reports
   - **Template Injector:** Replaces platform-specific paths with `{{VARIABLES}}`

## Technical Details

### Frontmatter Validation Rules

**For Skills:**
- Supported: `name`, `description`, `argument-hint`, `allowed-tools`, `disable-model-invocation`, `user-invocable`, `model`, `context`, `agent`, `hooks`
- Unsupported (move to version.json): `skill_version`, `requires_version`, `platforms`, `metadata`, `arguments`, `tools`
- Format: `allowed-tools` must be comma-separated string, not array

**For Agents:**
- Supported: `name`, `description`, `tools`, `disallowedTools`, `model`, `permissionMode`, `skills`, `hooks`
- Unsupported (move to versions.json): `metadata`, `skill_version`, `requires_version`, `platforms`
- Format: `tools` must be comma-separated string, not array

### Template Variables

Injector replaces:
- `.github/` → `{{PLATFORM_ROOT}}`
- `.claude/` → `{{PLATFORM_ROOT}}`
- `.codex/` → `{{PLATFORM_ROOT}}`
- `/gsd-` → `{{COMMAND_PREFIX}}`
- `$gsd-` → `{{COMMAND_PREFIX}}`

### Architecture Decisions

1. **ESM modules:** All scripts use modern `import/export` syntax
2. **Collect-all-errors:** Better UX than fail-fast - see all issues at once
3. **Simple structure:** ONE-TIME code, optimized for clarity over abstraction
4. **Modular design:** Separate concerns (parsing, validation, injection)

## Commits

| Hash    | Message                                    |
| ------- | ------------------------------------------ |
| cc3aea5 | chore(01-01): install migration dependencies |
| 5079f8c | feat(01-01): create migration script foundation |

## Files Changed

**Created:**
- `scripts/migrate-to-templates.js` (753 bytes) - Main entry point
- `scripts/lib/frontmatter-parser.js` (3.6K) - YAML parsing and validation
- `scripts/lib/validator.js` (2.3K) - Error collection engine
- `scripts/lib/template-injector.js` (1.4K) - Variable replacement

**Modified:**
- `package.json` - Added 3 devDependencies

## Decisions Made

1. **gray-matter for YAML parsing** (MIGRATION-01)
   - Industry standard, battle-tested
   - Handles edge cases better than manual parsing
   - 4.0.3 is stable release

2. **Collect-all-errors pattern** (MIGRATION-02)
   - Better developer experience
   - See all frontmatter issues at once
   - Comprehensive reports grouped by file

3. **ESM imports throughout** (MIGRATION-03)
   - Modern Node.js standard
   - Matches project conventions
   - Better static analysis

## Testing & Verification

✅ All success criteria met:
- Dependencies installed in package.json devDependencies
- Migration script executable and runs successfully
- Frontmatter parser validates skills and agents
- Validator implements collect-all-errors pattern
- Template injector replaces platform-specific values
- Script outputs "Migration foundation ready"
- All code uses ESM syntax

## Deviations from Plan

None - plan executed exactly as written.

## Next Phase Readiness

**Ready for Plan 01-02: Skills Migration**

This plan provides:
- ✅ Frontmatter parsing utilities
- ✅ Validation engine
- ✅ Template variable injection
- ✅ Main script entry point

Next plan can use these utilities to:
1. Read 29 skills from `.github/skills/`
2. Parse and validate frontmatter
3. Correct format per FRONTMATTER-CORRECTIONS.md
4. Inject template variables
5. Write to `templates/skills/`
6. Generate `version.json` per skill

**Blockers:** None

**Dependencies ready:** All migration infrastructure in place

## Notes

- Migration is ONE-TIME code - will be deleted after approval
- Optimized for clarity and correctness over abstraction
- All utilities tested via script execution
- Ready for skills and agents migration (Plans 02-03)

---

**Summary created:** 2026-01-26  
**Plan completed in:** 106 seconds  
**Status:** ✅ Complete - All tasks executed successfully
