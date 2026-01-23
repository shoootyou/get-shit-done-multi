---
name: gsd:restore-milestone
description: Restore archived milestone from history back to active planning
argument-hint: "[milestone-name]"
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>

Restore an archived milestone from `.planning/history/[milestone-name]/` back to `.planning/` for continued work.

Moves planning files (ROADMAP, STATE, PROJECT, REQUIREMENTS, research, phases) from history back to active planning directory, updates MILESTONES.md registry, creates git commit.

Provides safety valve for archiving operations: enables recovery if milestone was archived prematurely.

</objective>

<execution_context>

@get-shit-done/workflows/restore-milestone.md

</execution_context>

<context>

Milestone name: $ARGUMENTS (required - must specify which milestone to restore)

**Validate archive exists:**
```bash
ls .planning/history/[milestone-name]/ 2>/dev/null
```

If archive directory missing, suggest `$get-shit-done list-milestones` to see available archives.

**Check for conflicts:**
```bash
ls .planning/ROADMAP.md .planning/STATE.md .planning/PROJECT.md 2>/dev/null
```

If active planning files exist, warn user about overwrite and prompt for confirmation.

</context>

<process>

## 1. Validate milestone name

If $ARGUMENTS not provided:
- Display error: "Milestone name required. Usage: $get-shit-done restore-milestone [milestone-name]"
- Suggest: "Use $get-shit-done list-milestones to see available archives"
- Exit

If $ARGUMENTS provided:
- Use as milestone name
- Validate format (alphanumeric, dash, underscore only)

## 2. Check archive exists

Verify archive directory exists:
```bash
ls .planning/history/[milestone-name]/ 2>/dev/null
```

If missing:
- Display error: "Archive not found: .planning/history/[milestone-name]/"
- Suggest: "Use $get-shit-done list-milestones to see available archives"
- Exit

## 3. Execute restore workflow

Call restore-milestone.md workflow with milestone name:

```bash
# Workflow handles:
# - Git validation
# - Conflict detection
# - User confirmation  
# - Move files atomically
# - Update MILESTONES.md
# - Git commit
```

## 4. Present results

Display workflow output with:
- Restore location
- Files moved
- Git commit created
- Next steps (resume-project)

</process>

<success_criteria>

- [ ] Milestone name validated (from args)
- [ ] Archive existence verified
- [ ] Restore workflow executed successfully
- [ ] Files moved from .planning/history/[name]/ to .planning/
- [ ] MILESTONES.md updated
- [ ] Git commit created
- [ ] User sees next steps

</success_criteria>

## Examples

Restore specific milestone:
```
$get-shit-done restore-milestone v1.0-mvp
```

## Prerequisites

- Archive must exist in .planning/history/[milestone-name]/
- Working directory must be clean (no uncommitted changes)
- .planning/ directory must be initialized

## Output

- Files restored to: `.planning/`
- Archive directory preserved: `.planning/history/[milestone-name]/` (kept for reference)
- MILESTONES.md updated: status changed to "restored ([date])"
- Git commit created with restore transaction

## Error Handling

- **No milestone name**: Exits with usage instructions and suggestion to list milestones
- **Archive not found**: Prompts to use $get-shit-done list-milestones to find available archives
- **Active planning exists**: Warns about overwrite and requires confirmation
- **Uncommitted changes**: Prompts user to commit or stash before proceeding

## Related Commands

- `$get-shit-done list-milestones` - View all milestones including archived
- `$get-shit-done archive-milestone` - Archive completed milestone
- `$get-shit-done resume-project` - Resume work after restore

## Implementation

This command invokes the `restoreMilestone` workflow from `get-shit-done/workflows/restore-milestone.md` with appropriate validation and error handling.

## See Also

- Restore workflow documentation: `get-shit-done/workflows/restore-milestone.md`
- Archive workflow: `get-shit-done/workflows/archive-milestone.md`
- Milestone registry: `.planning/MILESTONES.md`
- Project planning: `.planning/PROJECT.md`
