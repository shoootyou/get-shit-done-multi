<purpose>

Archive current milestone to history/v{X.Y}/ with mirrored .planning/ structure. This workflow provides atomic file operations for direct history/ archiving, replacing the old multi-step milestones/ archive approach.

This is called by gsd-complete-milestone skill.

</purpose>

<archive_structure>

**Format:** `.planning/history/v{X.Y}/`

**Mirrored structure:** Preserves .planning/ subdirectory organization

**After archiving:**
- Workspace contains only: PROJECT.md, MILESTONES.md, config.json, codebase/
- All milestone files moved to: history/v{X.Y}/

</archive_structure>

<workflow>

## Archive Operations

### 1. Source Git Identity Helpers

```bash
# Idempotent check (safe to call multiple times)
if ! type commit_as_user >/dev/null 2>&1; then
    source .github/get-shit-done/workflows/git-identity-helpers.sh
fi
```

**Note:** .github is replaced during installation with .github, .claude, or .codex depending on platform.

### 2. Create Archive Directory

```bash
# Mirror .planning/ structure in history/
VERSION="1.0"  # Example, passed from skill
mkdir -p .planning/history/v${VERSION}/
```

**Atomic operation:** Directory creation is instant (mkdir -p is idempotent).

### 3. Move Files Atomically

**Required files:**
```bash
# These must exist
mv .planning/ROADMAP.md .planning/history/v${VERSION}/
mv .planning/STATE.md .planning/history/v${VERSION}/
mv .planning/PROJECT.md .planning/history/v${VERSION}/
```

**Optional files:**
```bash
# Don't fail if missing (2>/dev/null || true)
mv .planning/REQUIREMENTS.md .planning/history/v${VERSION}/ 2>/dev/null || true
```

**Directories:**
```bash
# Move entire directories (preserves structure)
mv .planning/phases .planning/history/v${VERSION}/ 2>/dev/null || true
mv .planning/research .planning/history/v${VERSION}/ 2>/dev/null || true
mv .planning/todos .planning/history/v${VERSION}/ 2>/dev/null || true
```

**Why atomic:** mv at filesystem level appears instantly or not at all (no intermediate state).

### 4. Git Tracking

```bash
# Stage additions and deletions
git add .planning/history/v${VERSION}/
git add -u .planning/

# Commit with user identity
commit_as_user "milestone: archive v${VERSION} to history

Moved to .planning/history/v${VERSION}/:
- ROADMAP.md, STATE.md, PROJECT.md
- REQUIREMENTS.md
- phases/, research/, todos/

Workspace ready for next milestone."
```

**Note:** `git add -u` stages deletions from .planning/ (the moved files).

### 5. Update MILESTONES.md Registry

```bash
# Append to registry (create if doesn't exist)
cat >> .planning/MILESTONES.md << EOF

## v${VERSION} — ${MILESTONE_NAME}

**Completed:** $(date +%Y-%m-%d)
**Phases:** ${PHASE_COUNT}
**Plans:** ${PLAN_COUNT}

**Key Accomplishments:**
- ${ACCOMPLISHMENT_1}
- ${ACCOMPLISHMENT_2}
- ${ACCOMPLISHMENT_3}

**Location:** .planning/history/v${VERSION}/

EOF

git add .planning/MILESTONES.md
commit_as_user "milestone: register v${VERSION} completion"
```

**Variables from skill:**
- VERSION: User-provided version (e.g., "1.0")
- MILESTONE_NAME: Extracted from ROADMAP.md
- PHASE_COUNT: Count of unique phase directories
- PLAN_COUNT: Count of SUMMARY.md files
- ACCOMPLISHMENT_*: Extracted from SUMMARY.md files

### 6. Optional Git Tag

```bash
# Only if user confirmed via AskUserQuestion
git tag v${VERSION}
git push origin v${VERSION}
```

**Note:** Tag creation is optional and only happens if user selects "Create tag" option.

</workflow>

<expected_state>

## After Completion

**Workspace contains only:**
- `.planning/PROJECT.md` (untouched)
- `.planning/MILESTONES.md` (updated with entry)
- `.planning/config.json` (untouched)
- `.planning/codebase/` (untouched)
- `.planning/history/v${VERSION}/` (new archive)

**Archived to history/v${VERSION}/:**
- `ROADMAP.md`
- `STATE.md`
- `PROJECT.md`
- `REQUIREMENTS.md` (if exists)
- `phases/` (if exists)
- `research/` (if exists)
- `todos/` (if exists)

</expected_state>

<notes>

## Implementation Notes

- **Atomic operations:** All mv commands are atomic at filesystem level
- **Git tracking:** Moves are tracked by git, allowing rollback if needed
- **Optional files:** Use `2>/dev/null || true` to prevent failures on missing files
- **Directory moves:** Preserve internal structure completely
- **Template variables:** .github replaced during installation (.github/.claude/.codex)
- **AI execution:** AI composes bash commands as needed (no separate scripts required)

## Safety Features

- Idempotent git helper sourcing (safe to call multiple times)
- Optional file handling (won't fail on missing REQUIREMENTS.md, etc.)
- Git commit preserves user identity via commit_as_user
- Clear error messages if required files missing

</notes>

<notes>

## Implementation Notes

- **Atomic operations:** All mv commands are atomic at filesystem level
- **Git tracking:** Moves are tracked by git, allowing rollback if needed
- **Optional files:** Use `2>/dev/null || true` to prevent failures on missing files
- **Directory moves:** Preserve internal structure completely
- **Template variables:** .github replaced during installation (.github/.claude/.codex)
- **AI execution:** AI composes bash commands as needed (no separate scripts required)

## Safety Features

- Idempotent git helper sourcing (safe to call multiple times)
- Optional file handling (won't fail on missing REQUIREMENTS.md, etc.)
- Git commit preserves user identity via commit_as_user
- Clear error messages if required files missing

</notes>
