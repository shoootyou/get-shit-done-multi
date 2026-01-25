---
name: gsd-archive-milestone
description: Move completed milestone files to .planning/history/ for long-term storage
skill_version: 1.9.1
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools: [read, edit, execute]
arguments: [{name: version, type: string, required: true, description: Milestone version to archive}]
metadata:
  platform: copilot
  generated: '2026-01-24'
  templateVersion: 1.0.0
  projectVersion: 1.9.0
  projectName: 'get-shit-done-multi'
---

<objective>
Move completed milestone from .planning/milestones/ to .planning/history/ for long-term archival.

Purpose: Clean up active workspace while preserving historical records.
Output: Milestone moved to history/, updated MILESTONES.md registry.
</objective>

<process>
<step name="verify_milestone_exists">
Check milestone exists:

```bash
version="$1"
milestone_dir=".planning/milestones/v${version}"
```

If not found:
  Error: "Milestone v{version} not found in milestones/"
  Hint: "Did you mean to complete it first? {{COMMAND_PREFIX}}complete-milestone {version}"
</step>

<step name="create_history_directory">
Create history directory structure:

```bash
mkdir -p ".planning/history/v${version}"
```
</step>

<step name="move_milestone_files">
Move milestone directory to history:

```bash
# Move entire milestone directory
mv ".planning/milestones/v${version}/"* ".planning/history/v${version}/"
rmdir ".planning/milestones/v${version}"

# Verify move
ls -la ".planning/history/v${version}/"
```
</step>

<step name="update_milestones_registry">
Update MILESTONES.md registry with archive status:

```bash
# Update status from "Completed" to "Archived"
sed -i "s|Location: .planning/milestones/v${version}/|Location: .planning/history/v${version}/|" .planning/MILESTONES.md
sed -i "s|Status: Completed|Status: Archived|" .planning/MILESTONES.md

# Add archive timestamp
SECTION_LINE=$(grep -n "^## v${version}" .planning/MILESTONES.md | cut -d: -f1)
sed -i "${SECTION_LINE}a\- **Archived:** $(date +%Y-%m-%d)" .planning/MILESTONES.md
```
</step>

<step name="commit">
```bash
git add ".planning/history/v${version}/"
git add .planning/MILESTONES.md
git rm -r ".planning/milestones/v${version}/"
git commit -m "milestone: archive v${version} to history/

Moved to long-term storage for historical record."
```
</step>

<step name="present_summary">
```
## MILESTONE ARCHIVED: v{version}

**Archived to:** .planning/history/v{version}/
**Status:** Archived (long-term storage)

Files preserved:
- ROADMAP.md (milestone plan)
- REQUIREMENTS.md (requirements met)
- MILESTONE-AUDIT.md (E2E validation)

### Recovery

To restore: {{COMMAND_PREFIX}}restore-milestone {version}
```
</step>
</process>
