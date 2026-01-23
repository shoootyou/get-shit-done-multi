---
name: gsd-complete-milestone
description: Mark milestone complete, archive to milestones/, update PROJECT and MILESTONES registry
skill_version: 1.9.1
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools: [read, write, bash]
arguments: [{name: version, type: string, required: true, description: 'Milestone version to complete (e.g., "v1.0.0")'}]
---

<objective>
Mark milestone complete (version provided as argument), archive to milestones/, and update ROADMAP.md and REQUIREMENTS.md.

Purpose: Create historical record of shipped version, archive milestone artifacts, and prepare for next milestone.
</objective>

<process>
<step name="check_audit">
Look for .planning/v{version}-MILESTONE-AUDIT.md where version is provided as argument

If missing:
  Recommend: "$gsd-audit-milestone first - need E2E validation before completion"
  Exit (user must audit first)

If exists with status: gaps_found:
  Recommend: "$gsd-plan-milestone-gaps - address gaps before completion"
  Exit (user must fix gaps first)

If exists with status: passed:
  Proceed with completion
</step>

<step name="archive_roadmap_requirements">
Archive current milestone artifacts:

```bash
# version argument provided by user
version="$1"

# Create milestone directory
mkdir -p ".planning/milestones/v${version}"

# Archive key files
cp .planning/ROADMAP.md ".planning/milestones/v${version}/"
cp .planning/REQUIREMENTS.md ".planning/milestones/v${version}/"

# Archive audit report
cp ".planning/v${version}-MILESTONE-AUDIT.md" ".planning/milestones/v${version}/"

# Count phases completed
PHASE_COUNT=$(ls -d .planning/phases/* | wc -l)
```
</step>

<step name="update_project">
Update PROJECT.md to reflect milestone completion:

Read current "What This Is" section.
Evolve it to reflect completed work from this milestone.
Update "Current focus" to "Between milestones" or next milestone if known.
</step>

<step name="update_milestones_registry">
Update MILESTONES.md registry:

```bash
cat >> .planning/MILESTONES.md << ENDMARKER

## v${version}
- **Completed:** $(date +%Y-%m-%d)
- **Phases:** ${PHASE_COUNT} phases completed
- **Requirements:** $(grep -c "^###" .planning/REQUIREMENTS.md) requirements met
- **Status:** Completed
- **Location:** .planning/milestones/v${version}/
- **Audit:** Passed E2E integration checks
ENDMARKER
```
</step>

<step name="git_tag">
Create git tag for milestone:

```bash
git add ".planning/milestones/v${version}/"
git add .planning/MILESTONES.md
git add .planning/PROJECT.md
git commit -m "milestone: complete v${version}

- ${PHASE_COUNT} phases completed
- All requirements met
- E2E audit passed"

git tag -a "v${version}" -m "Release v${version}

$(cat .planning/ROADMAP.md | head -20)
"
```
</step>

<step name="delete_working_files">
Delete ROADMAP.md and REQUIREMENTS.md (milestone cycle ends):

```bash
git rm .planning/ROADMAP.md .planning/REQUIREMENTS.md
git commit -m "milestone: clear roadmap for next cycle"
```

Note: Files are preserved in .planning/milestones/v${version}/
</step>

<step name="present_summary">
Present completion summary:

```
## MILESTONE COMPLETE: v{version}

**Completed:** {date}
**Phases:** {count} phases
**Requirements:** {count} requirements met
**Audit:** Passed

**Archived to:** .planning/milestones/v{version}/
**Git tag:** v{version}

### Next Steps

1. Retrospective (what went well, what to improve)
2. Start next milestone: $gsd-new-milestone
3. Or take a break - you earned it!
```
</step>
</process>
