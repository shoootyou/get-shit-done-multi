---
name: gsd:archive-milestone
description: Archive completed milestone with full metadata preservation and git traceability
argument-hint: "[milestone-name]"
allowed-tools:
  - Read
  - Write
  - Bash
  - AskUserQuestion
---

<objective>

Archive a completed milestone to `.planning/history/[milestone-name]/` with full historical traceability.

Moves planning files (ROADMAP, STATE, PROJECT, REQUIREMENTS, research, phases) to history directory, preserves codebase map, updates MILESTONES.md registry, creates git commit + tag.

Provides safety valve: archived milestones can be restored with `/gsd:restore-milestone`.

</objective>

<execution_context>

@get-shit-done/workflows/archive-milestone.md

</execution_context>

<context>

Milestone name: $ARGUMENTS (optional - if not provided, prompts user for name)

**Validate planning exists:**
```bash
ls .planning/ROADMAP.md .planning/STATE.md .planning/PROJECT.md 2>/dev/null
```

If missing files, suggest `/gsd:new-project` first.

</context>

<process>

## 1. Determine milestone name

If $ARGUMENTS provided:
- Use as milestone name
- Validate format (alphanumeric, dash, underscore only)

If $ARGUMENTS not provided:
- Prompt user: "What name for this milestone? (e.g., 'v1.0-mvp', 'sprint-1')"
- Validate format

## 2. Execute archive workflow

Call archive-milestone.md workflow with milestone name:

```bash
# Workflow handles:
# - Git validation
# - User confirmation  
# - Create archive directory
# - Move files atomically
# - Update MILESTONES.md
# - Git commit + tag
```

## 3. Present results

Display workflow output with:
- Archive location
- Git tag created
- Files moved
- Next steps (map-codebase, new-milestone)

</process>

<success_criteria>

- [ ] Milestone name determined (from args or prompt)
- [ ] Archive workflow executed successfully
- [ ] Files moved to .planning/history/[name]/
- [ ] MILESTONES.md updated
- [ ] Git commit and tag created
- [ ] User sees next steps

</success_criteria>

## Examples

Preview what would be archived:
```
/gsd:archive-milestone --dry-run
```

Archive with confirmation:
```
/gsd:archive-milestone
```

Force archive without prompt:
```
/gsd:archive-milestone --force
```

## Prerequisites

- Active milestone must exist in STATE.md
- Working directory must be clean (no uncommitted changes)
- .planning/ directory must be initialized

## Output

- Archive branch created: `archive/milestone-{id}-{timestamp}`
- Milestone moved to: `.planning/history/{id}/`
- STATE.md updated: `active_milestone` cleared
- Git commit created with archive transaction

## Error Handling

- **No active milestone**: Exits with clear error message prompting to set one first
- **Uncommitted changes**: Prompts user to commit or stash before proceeding
- **Archive directory conflict**: Suggests manual cleanup of existing archive
- **Transaction failure**: Automatically rolls back all operations to prevent partial state

## Related Commands

- `/gsd:new-milestone` - Create new milestone after archiving
- `/gsd:list-milestones` - View all milestones including archived
- `/gsd:restore-milestone` - Restore from archive (future)

## Implementation

This command invokes the `archiveMilestone` workflow from `get-shit-done/workflows/archive-milestone.js` with appropriate options based on flags provided.

## See Also

- Archive workflow documentation: `get-shit-done/workflows/archive-milestone.js`
- Milestone registry: `get-shit-done/workflows/milestone-registry.js`
- Project planning: `.planning/PROJECT.md`
