<purpose>

Restore an archived milestone from `.planning/history/[milestone-name]/` back to `.planning/` to resume work.

Validates prerequisites, moves planning files from history back to active workspace, updates MILESTONES.md registry, and creates git commit for traceability.

</purpose>

<philosophy>

**Why restore milestones:**
- Safety valve for archiving operations
- Recover from premature archiving
- Resume work on milestone after interruption
- Maintain full traceability through git history

**Restore vs new-milestone:**
- `restore-milestone`: Brings back archived milestone (continues existing work)
- `new-milestone`: Creates fresh milestone (starts new work)

**Safety first:**
- Git validation prevents accidental data loss
- Conflict detection warns about existing active planning
- User confirmation required before overwriting
- Archive preserved in history/ for reference

</philosophy>

<process>

<step name="validate_prerequisites">

Check git working directory is clean:

```bash
git status --porcelain
```

**If not clean:**
```
Git working directory is not clean. Please commit or stash changes before restoring.

Issues found:
  - Untracked files: [list]
  - Modified files: [list]
  - Staged files: [list]
```

Exit workflow.

**If clean:** Continue to check_archive_exists.

</step>

<step name="check_archive_exists">

Verify archive directory exists:

```bash
ls .planning/history/[milestone-name]/ 2>/dev/null
```

**If missing:**
```
Archive not found: .planning/history/[milestone-name]/

Use $gsd-list-milestones to see available archives.
```

Exit workflow.

**If exists:** Continue to check_conflicts.

</step>

<step name="check_conflicts">

Check if .planning/ has active planning files:

```bash
ls .planning/ROADMAP.md .planning/STATE.md .planning/PROJECT.md 2>/dev/null
```

**If files exist:**
```
⚠️  Active planning files exist in .planning/

The following files will be overwritten:
  - ROADMAP.md
  - STATE.md
  - PROJECT.md
  - REQUIREMENTS.md (if exists)
  - research/ (if exists)
  - phases/ (if exists)

Type 'y' to overwrite and continue, 'n' to cancel:
```

Wait for user input.

**If 'n' or anything except 'y':** Exit with "Restore cancelled."

**If 'y' or no conflicts:** Continue to confirm_intent.

</step>

<step name="confirm_intent">

Prompt user for confirmation:

```
Restore milestone '[milestone-name]' from archive?

This will move files from .planning/history/[milestone-name]/ to .planning/:
- ROADMAP.md
- STATE.md
- PROJECT.md
- REQUIREMENTS.md
- research/
- phases/

Archive directory will be preserved for reference.

Type 'y' to proceed, 'n' to cancel:
```

Wait for user input.

**If 'n' or anything except 'y':** Exit with "Restore cancelled."

**If 'y':** Continue to move_files.

</step>

<step name="move_files">

Move files from archive back to .planning/ root:

```bash
# Move files back (reverse of archive)
mv .planning/history/[milestone-name]/ROADMAP.md .planning/
mv .planning/history/[milestone-name]/STATE.md .planning/
mv .planning/history/[milestone-name]/PROJECT.md .planning/
mv .planning/history/[milestone-name]/REQUIREMENTS.md .planning/ 2>/dev/null || true

# Move directories
mv .planning/history/[milestone-name]/research .planning/ 2>/dev/null || true
mv .planning/history/[milestone-name]/phases .planning/ 2>/dev/null || true
```

**Note:** Archive directory in `.planning/history/[milestone-name]/` is kept empty as a marker.

Continue to update_registry.

</step>

<step name="update_registry">

Update MILESTONES.md to mark milestone as restored:

```bash
RESTORE_DATE=$(date +%Y-%m-%d)
MILESTONE_NAME="[milestone-name]"

# Find milestone row in MILESTONES.md and update status from "archived" to "restored (YYYY-MM-DD)"
if [ -f .planning/MILESTONES.md ]; then
  # Use sed to update the status column for this milestone
  # Pattern: Find line with milestone name, replace status column (4th column) with "restored (date)"
  sed -i.bak "s/| ${MILESTONE_NAME} | \([^|]*\) | \([^|]*\) | archived | /| ${MILESTONE_NAME} | \1 | \2 | restored (${RESTORE_DATE}) | /" .planning/MILESTONES.md
  rm .planning/MILESTONES.md.bak 2>/dev/null || true
fi
```

Continue to commit_restore.

</step>

<step name="commit_restore">

Create git commit:

```bash
# Stage changes
git add .planning/ROADMAP.md .planning/STATE.md .planning/PROJECT.md
git add .planning/REQUIREMENTS.md 2>/dev/null || true
git add .planning/research/ 2>/dev/null || true
git add .planning/phases/ 2>/dev/null || true
git add .planning/MILESTONES.md

# Commit
git commit -m "restore: ${MILESTONE_NAME}

Restored from .planning/history/${MILESTONE_NAME}/
- ROADMAP.md
- STATE.md
- PROJECT.md
- REQUIREMENTS.md
- research/
- phases/

Status updated in MILESTONES.md to 'restored (${RESTORE_DATE})'
Archive directory preserved for reference."
```

Continue to offer_next.

</step>

<step name="offer_next">

Display completion message:

```
✓ Milestone '[milestone-name]' restored successfully

Restored to: .planning/
Archive location: .planning/history/[milestone-name]/ (kept for reference)

Next steps:
1. Review restored planning files
2. $gsd-resume-project - Resume work on this milestone

Archive is still available in history/ for reference.
```

</step>

</process>

<success_criteria>

- [ ] Git working directory validated before any operations
- [ ] Archive existence verified
- [ ] Conflict detection warned about existing planning files
- [ ] User confirmed intent to restore
- [ ] ROADMAP.md, STATE.md, PROJECT.md, REQUIREMENTS.md moved from archive
- [ ] research/ and phases/ directories moved from archive
- [ ] Archive directory preserved in `.planning/history/[milestone-name]/`
- [ ] MILESTONES.md updated with "restored ([date])" status
- [ ] Git commit created with descriptive message
- [ ] User informed of restore location and next steps

</success_criteria>
