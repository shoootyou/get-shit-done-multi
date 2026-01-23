<purpose>

Archive a completed milestone to `.planning/history/[milestone-name]/` with full metadata preservation and git traceability.

Creates historical record, moves planning files to history, preserves codebase map, updates MILESTONES.md registry, and creates git commit + tag for future reference.

</purpose>

<philosophy>

**Why archive milestones:**
- Clean slate for next milestone planning
- Historical traceability of decisions and progress  
- Git-based recovery (tag + commit)
- Preserves what mattered without cluttering active workspace

**Archive vs complete-milestone:**
- `archive-milestone`: Moves files to history (reversible)
- `complete-milestone`: Full v[X.Y] tagging with evolution review

**Safety first:**
- Git validation prevents accidental data loss
- User confirmation required
- Atomic operations with transaction pattern
- Preserves `.planning/codebase/` for continuity

**Atomic operations:**
- `mv` commands are atomic at filesystem level (file appears instantly at destination or not at all)
- Git validation prevents execution on dirty state (rollback via git if issues)
- Operations are ordered: directory creation → file moves → registry update → git commit
- If interrupted mid-process, git shows exactly what was moved (traceable via `git status`)

</philosophy>

<process>

<step name="validate_prerequisites">

Check git working directory is clean:

```bash
git status --porcelain
```

**If not clean:**
```
Git working directory is not clean. Please commit or stash changes before archiving.

Issues found:
  - Untracked files: [list]
  - Modified files: [list]
  - Staged files: [list]
```

Exit workflow.

**If clean:** Continue to confirm_intent.

</step>

<step name="confirm_intent">

Prompt user for confirmation:

```
Archive milestone '[milestone-name]'?

This will move planning files to .planning/history/[milestone-name]/:
- ROADMAP.md
- STATE.md  
- PROJECT.md
- REQUIREMENTS.md
- research/
- phases/

.planning/codebase/ will be preserved (last map stays active).

Type 'y' to proceed, 'n' to cancel:
```

Wait for user input.

**If 'n' or anything except 'y':** Exit with "Archive cancelled."

**If 'y':** Continue to create_archive_directory.

</step>

<step name="create_archive_directory">

Create archive directory:

```bash
mkdir -p .planning/history/[milestone-name]
```

Continue to move_files.

</step>

<step name="move_files">

Move planning files to archive using atomic operations:

```bash
# Move files
mv .planning/ROADMAP.md .planning/history/[milestone-name]/
mv .planning/STATE.md .planning/history/[milestone-name]/
mv .planning/PROJECT.md .planning/history/[milestone-name]/
mv .planning/REQUIREMENTS.md .planning/history/[milestone-name]/ 2>/dev/null || true

# Move directories  
mv .planning/research .planning/history/[milestone-name]/ 2>/dev/null || true
mv .planning/phases .planning/history/[milestone-name]/ 2>/dev/null || true
```

**Note:** `.planning/codebase/` is NOT moved - it stays for next milestone.

Continue to update_registry.

</step>

<step name="update_registry">

Update or create MILESTONES.md registry:

```bash
# Get metadata
MILESTONE_NAME="[milestone-name]"
ARCHIVE_DATE=$(date +%Y-%m-%d)
ARCHIVE_PATH=".planning/history/${MILESTONE_NAME}"

# Count requirements (if exists)
REQ_COUNT=0
if [ -f "${ARCHIVE_PATH}/REQUIREMENTS.md" ]; then
  REQ_COUNT=$(grep -c "^- \[.\] \*\*" "${ARCHIVE_PATH}/REQUIREMENTS.md" || echo "0")
fi

# Get git info
COMMIT_SHA=$(git rev-parse HEAD)
COMMIT_SHORT=$(git rev-parse --short HEAD)
```

Create or append to `.planning/MILESTONES.md`:

```bash
# Create MILESTONES.md with headers if it doesn't exist
if [ ! -f .planning/MILESTONES.md ]; then
  cat > .planning/MILESTONES.md << 'EOF'
# Milestone Registry

| Milestone | Archived | Requirements | Status | Commit | Tag |
|-----------|----------|--------------|--------|--------|-----|
EOF
fi

# Append milestone entry
echo "| ${MILESTONE_NAME} | ${ARCHIVE_DATE} | ${REQ_COUNT} | archived | ${COMMIT_SHORT} | archive/${MILESTONE_NAME} |" >> .planning/MILESTONES.md
```

Continue to commit_archive.

</step>

<step name="commit_archive">

Create git commit and tag:

```bash
# Stage changes
git add .planning/history/${MILESTONE_NAME}/
git add .planning/MILESTONES.md

# Commit
git commit -m "archive: ${MILESTONE_NAME}

Moved to .planning/history/${MILESTONE_NAME}/
- ROADMAP.md
- STATE.md
- PROJECT.md
- REQUIREMENTS.md (${REQ_COUNT} requirements)
- research/
- phases/

Preserved .planning/codebase/ for next milestone."

# Create annotated tag
git tag -a "archive/${MILESTONE_NAME}" -m "Archive milestone: ${MILESTONE_NAME}

Archived: ${ARCHIVE_DATE}
Requirements: ${REQ_COUNT}
Location: .planning/history/${MILESTONE_NAME}/"
```

Continue to offer_next.

</step>

<step name="offer_next">

Display completion message:

```
✓ Milestone '${MILESTONE_NAME}' archived successfully

Archive location: .planning/history/${MILESTONE_NAME}/
Git tag: archive/${MILESTONE_NAME}
Commit: ${COMMIT_SHORT}

Next steps:
1. $get-shit-done map-codebase - Refresh codebase analysis for next milestone
2. $get-shit-done new-milestone - Start planning next milestone

.planning/codebase/ preserved from this milestone.
```

</step>

</process>

<success_criteria>

- [ ] Git working directory validated before any operations
- [ ] User confirmed intent to archive
- [ ] Archive directory created at `.planning/history/[milestone-name]/`
- [ ] ROADMAP.md, STATE.md, PROJECT.md, REQUIREMENTS.md moved to archive
- [ ] research/ and phases/ directories moved to archive  
- [ ] `.planning/codebase/` preserved (not moved)
- [ ] MILESTONES.md updated with milestone entry
- [ ] Git commit created with descriptive message
- [ ] Git tag created: `archive/[milestone-name]`
- [ ] User informed of archive location and next steps

</success_criteria>
