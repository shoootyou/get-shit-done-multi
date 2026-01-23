---
name: gsd-restore-milestone
description: Restore archived milestone from .planning/history/ back to active workspace
skill_version: 1.9.1
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools:
  - read
  - write
  - bash
arguments:
  - name: version
    type: string
    required: true
    description: Milestone version to restore
---

<objective>
Restore archived milestone from .planning/history/ back to .planning/milestones/ for reference or rework.

Purpose: Make archived milestone active again (e.g., for bug fixes, analysis).
Output: Milestone restored to milestones/, updated registry.
</objective>

<process>
<step name="verify_archived_exists">
Check milestone exists in history:

```bash
version="$1"
history_dir=".planning/history/v${version}"
```

If not found:
  Error: "Milestone v{version} not found in history/"
  List available: ls .planning/history/
</step>

<step name="check_not_already_active">
Check if milestone already exists in milestones/:

```bash
if [ -d ".planning/milestones/v${version}" ]; then
  echo "Error: Milestone v${version} already active"
  exit 1
fi
```

If exists:
  Error: "Milestone v{version} already active in milestones/"
  Hint: "Archive it first if you want to replace: /gsd:archive-milestone {version}"
</step>

<step name="restore_milestone_files">
Move milestone from history back to milestones:

```bash
# Create target directory
mkdir -p ".planning/milestones/v${version}"

# Move files
mv ".planning/history/v${version}/"* ".planning/milestones/v${version}/"
rmdir ".planning/history/v${version}"

# Verify restore
ls -la ".planning/milestones/v${version}/"
```
</step>

<step name="update_milestones_registry">
Update MILESTONES.md registry with restored status:

```bash
# Update location and status
sed -i "s|Location: .planning/history/v${version}/|Location: .planning/milestones/v${version}/|" .planning/MILESTONES.md
sed -i "s|Status: Archived|Status: Restored (Active)|" .planning/MILESTONES.md

# Add restore timestamp
SECTION_LINE=$(grep -n "^## v${version}" .planning/MILESTONES.md | cut -d: -f1)
sed -i "${SECTION_LINE}a\- **Restored:** $(date +%Y-%m-%d)" .planning/MILESTONES.md
```
</step>

<step name="commit">
```bash
git add ".planning/milestones/v${version}/"
git add .planning/MILESTONES.md
git rm -r ".planning/history/v${version}/"
git commit -m "milestone: restore v${version} from archive

Moved from history/ back to active workspace."
```
</step>

<step name="present_summary">
```
## MILESTONE RESTORED: v{version}

**Restored to:** .planning/milestones/v{version}/
**Status:** Active (available for reference)

Files restored:
- ROADMAP.md (milestone plan)
- REQUIREMENTS.md (requirements met)
- MILESTONE-AUDIT.md (E2E validation)

### Next Steps

- Review milestone: cat .planning/milestones/v{version}/ROADMAP.md
- Archive again: /gsd:archive-milestone {version}
```
</step>
</process>
