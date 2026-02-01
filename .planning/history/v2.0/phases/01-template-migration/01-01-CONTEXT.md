# Phase 1: Template Migration (ONE-TIME) - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

ONE-TIME migration of `.github/` skills and agents to `/templates/` with frontmatter corrections. Includes mandatory manual validation gate before approval. After approval, migration code is committed and then deleted completely. This establishes `/templates/` as permanent source of truth for future phases.

</domain>

<decisions>
## Implementation Decisions

### Frontmatter validation approach
- Collect ALL validation errors and show comprehensive report at end (not fail-fast)
- Block migration completion if ANY validation errors found - must fix all errors to proceed
- Validate against official Claude/Copilot specs PLUS internal schema rules (strictest validation)
- Show all validation details field-by-field in error report (maximum detail)
- User must see exactly what's wrong and where before any files are written

### Manual validation workflow
- Interactive terminal UI with file browser for reviewing migrated files
- Show full side-by-side diff (before → after) for each migrated file
- After review, user must type 'APPROVED' to continue (explicit confirmation required)
- CLI opens external tool (VS Code or diff viewer) for detailed file inspection
- No proceeding to Phase 2 without explicit approval

### Template variable consistency
- Required variables vary by file type:
  - Skills: PLATFORM_ROOT, COMMAND_PREFIX (minimum)
  - Agents: PLATFORM_ROOT, COMMAND_PREFIX (minimum)
  - Shared: PLATFORM_ROOT, VERSION, PLATFORM_NAME (all required)
- Missing required template variables = validation error that blocks migration
- Use placeholder values in /templates/ (e.g., `{{PLATFORM_ROOT}}`, `{{VERSION}}`)
- Auto-correct non-standard template syntax (e.g., ${VAR}) to standard format ({{VAR}})

### Migration rollback strategy
- Automatic cleanup: delete /templates/ if user rejects during approval
- NO rollback support after approval - Phase 1 is ONE-TIME, user assumes responsibility
- Re-running migration always starts from scratch (no incremental updates)
- If /templates/ exists when starting: automatic delete and proceed
- Migration script is deleted after approval - preserved only in git history

### Claude's Discretion
- Exact implementation of interactive terminal UI components
- Choice of external diff viewer tool (VS Code, meld, etc.)
- Formatting and color scheme for validation reports
- Progress indicators during migration process

</decisions>

<specifics>
## Specific Ideas

- "Es importante considerar que la fase 1 es ONE-TIME por lo que al terminar la migración y aprobarla, no debe haber nada de rollback ni volver a ejecutar. El usuario asume la responsabilidad"
- Validation should feel strict and thorough - better to catch all issues upfront than discover them later
- External tool opening for diffs allows proper review in familiar editor

</specifics>

<deferred>
## Deferred Ideas

None - discussion stayed within phase scope. Phase 1 is strictly about migration and validation, not installation or usage of templates.

</deferred>

---

*Phase: 01-template-migration*
*Context gathered: 2026-01-26*
