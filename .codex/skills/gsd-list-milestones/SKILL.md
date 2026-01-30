---
name: gsd-list-milestones
description: "Display milestone registry showing all archived milestones with status"
allowed-tools: Read, Bash
---


<objective>

List all archived milestones from the `.planning/MILESTONES.md` registry.

Displays milestone name, archive date, requirement count, status, and location in a readable table format.

Provides visibility into what has been archived and enables milestone discovery for restore operations.

</objective>

<execution_context>

@get-shit-done/workflows/list-milestones.md

</execution_context>

<context>

**Check if milestones exist:**
```bash
ls .planning/MILESTONES.md 2>/dev/null
```

If missing: Display "No milestones archived yet. Archive your first milestone with $gsd-archive-milestone"

If exists: Parse and display milestone table from registry.

</context>

<process>

## 1. Check for milestone registry

Verify `.planning/MILESTONES.md` exists:

```bash
if [ ! -f .planning/MILESTONES.md ]; then
  echo "No milestones archived yet. Archive your first milestone with $gsd-archive-milestone"
  exit 0
fi
```

If registry doesn't exist, exit with helpful message.

If registry exists, continue to execute workflow.

## 2. Execute list-milestones workflow

Call list-milestones.md workflow to read and format milestone data:

```bash
# Workflow handles:
# - Reading MILESTONES.md
# - Parsing milestone table
# - Formatting output
# - Displaying helpful footer
```

## 3. Display formatted output

Present workflow output showing all archived milestones in table format.

</process>

<success_criteria>

- [ ] Registry existence checked before attempting to read
- [ ] List-milestones workflow executed successfully
- [ ] Milestones displayed in readable table format
- [ ] User sees "no milestones" message if registry doesn't exist
- [ ] User sees restore command suggestion if milestones exist

</success_criteria>

## Examples

List all archived milestones:
```
$gsd-list-milestones
```

Expected output (when milestones exist):
```
Archived Milestones
==================

| Milestone | Archived | Requirements | Status | Location |
|-----------|----------|--------------|--------|----------|
| v1.0-mvp  | 2026-01-15 | 23 | archived | .planning/history/v1.0-mvp |
| sprint-1  | 2026-01-10 | 15 | archived | .planning/history/sprint-1 |

Total: 2 milestone(s) archived

Restore a milestone: $gsd-restore-milestone [name]
```

Expected output (when no milestones):
```
No milestones archived yet. Archive your first milestone with $gsd-archive-milestone
```

## Prerequisites

- `.planning/` directory must be initialized
- No other prerequisites - gracefully handles missing MILESTONES.md

## Output

- Table of archived milestones with metadata
- Total count
- Helpful next-step suggestions

## Error Handling

- **No registry**: Shows friendly "no milestones yet" message
- **Empty registry**: Shows table header but no rows
- **Malformed registry**: Displays what can be parsed, continues

## Related Commands

- `$gsd-archive-milestone` - Archive a completed milestone
- `$gsd-restore-milestone` - Restore an archived milestone (future)
- `$gsd-new-milestone` - Start planning a new milestone

## Implementation

This command invokes the `list-milestones` workflow from `get-shit-done/workflows/list-milestones.md` which handles the registry reading and output formatting.

## See Also

- List-milestones workflow: `get-shit-done/workflows/list-milestones.md`
- Milestone registry: `.planning/MILESTONES.md`
- Archive workflow: `get-shit-done/workflows/archive-milestone.md`
