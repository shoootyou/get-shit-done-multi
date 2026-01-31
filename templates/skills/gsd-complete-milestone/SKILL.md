---
name: gsd-complete-milestone
description: Complete milestone with direct history/v{X.Y}/ archiving and cleanup
allowed-tools: Read, Edit, Bash, AskUserQuestion
argument-hint: [version]
---

<objective>
Complete milestone {{version}}, archive all files directly to .planning/history/v{{version}}/ with mirrored structure, and clean workspace for next milestone.

Purpose: Archive milestone artifacts to permanent history/, update MILESTONES.md registry, optional git tag, prepare clean workspace.
Output: Milestone archived to history/v{{version}}/, workspace contains only PROJECT.md, MILESTONES.md, config.json, codebase/.
</objective>

<execution_context>
@{{PLATFORM_ROOT}}/get-shit-done/workflows/complete-milestone.md
@{{PLATFORM_ROOT}}/get-shit-done/references/ui-brand.md
</execution_context>

<context>
**Project files:**
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md` (optional)
- `.planning/phases/` (if exists)
- `.planning/research/` (if exists)
- `.planning/todos/` (if exists)

**User input:**
- Version: {{version}} (e.g., "1.0", "1.1", "2.0")
</context>

<process>

<step name="verify_readiness">

Check if milestone is complete by counting phases with SUMMARY.md files:

```bash
# Count completed plans
ls .planning/phases/*/SUMMARY.md 2>/dev/null | wc -l

# Check ROADMAP for milestone scope
cat .planning/ROADMAP.md
```

Present milestone scope and stats to user.
</step>

<step name="confirm_completion">

Use AskUserQuestion to get combined readiness + archive confirmation:

**Tool: AskUserQuestion**
- **header:** "Ready to Complete Milestone?"
- **question:** "Complete v{{version}}? This will archive all files to history/v{{version}}/"
- **details:** Show milestone stats:
  - Number of phases completed
  - Number of plans completed
  - Key accomplishments (extracted from SUMMARYs)
- **options:**
  - "Complete and archive" — Archive to history/ and mark complete
  - "Cancel" — Exit without changes

**If "Cancel":** Exit with message "Milestone completion cancelled."

**If "Complete and archive":** Continue to next step.
</step>

<step name="archive_to_history">

Archive all milestone files directly to history/v{{version}}/ using bash commands:

```bash
# Source git helpers
if ! type commit_as_user >/dev/null 2>&1; then
    source {{PLATFORM_ROOT}}/get-shit-done/workflows/git-identity-helpers.sh
fi

# Create destination with mirrored structure
mkdir -p .planning/history/v{{version}}/

# Move required files atomically
mv .planning/ROADMAP.md .planning/history/v{{version}}/
mv .planning/STATE.md .planning/history/v{{version}}/
mv .planning/PROJECT.md .planning/history/v{{version}}/

# Move optional files (don't fail if missing)
mv .planning/REQUIREMENTS.md .planning/history/v{{version}}/ 2>/dev/null || true

# Move directories (preserves structure)
mv .planning/phases .planning/history/v{{version}}/ 2>/dev/null || true
mv .planning/research .planning/history/v{{version}}/ 2>/dev/null || true
mv .planning/todos .planning/history/v{{version}}/ 2>/dev/null || true

# Stage all changes
git add .planning/history/v{{version}}/
git add -u .planning/  # Stages deletions

# Commit with user identity
commit_as_user "milestone: archive v{{version}} to history

Moved to .planning/history/v{{version}}/:
- ROADMAP.md, STATE.md, PROJECT.md
- REQUIREMENTS.md
- phases/, research/, todos/

Workspace ready for next milestone."
```

**Note:** All operations are atomic at filesystem level (mv appears instantly or not at all).
</step>

<step name="update_milestones_registry">

Update .planning/MILESTONES.md with new entry (create if doesn't exist):

```bash
# Extract milestone name from ROADMAP.md (now in history/)
MILESTONE_NAME=$(grep "^# " .planning/history/v{{version}}/ROADMAP.md | head -1 | sed 's/^# //')

# Count phases and plans
PHASE_COUNT=$(find .planning/history/v{{version}}/phases -name "SUMMARY.md" 2>/dev/null | cut -d/ -f5 | cut -d- -f1 | sort -u | wc -l)
PLAN_COUNT=$(find .planning/history/v{{version}}/phases -name "SUMMARY.md" 2>/dev/null | wc -l)

# Extract key accomplishments from SUMMARYs
# (AI: Read 3-5 SUMMARY files and extract major accomplishments)

# Append to registry
cat >> .planning/MILESTONES.md << EOF

## v{{version}} — ${MILESTONE_NAME}

**Completed:** $(date +%Y-%m-%d)
**Phases:** ${PHASE_COUNT}
**Plans:** ${PLAN_COUNT}

**Key Accomplishments:**
- [ACCOMPLISHMENT_1]
- [ACCOMPLISHMENT_2]
- [ACCOMPLISHMENT_3]

**Location:** .planning/history/v{{version}}/

EOF

git add .planning/MILESTONES.md
commit_as_user "milestone: register v{{version}} completion"
```
</step>

<step name="confirm_git_tag">

Use AskUserQuestion to offer optional git tag:

**Tool: AskUserQuestion**
- **header:** "Git Tag"
- **question:** "Create git tag v{{version}}?"
- **options:**
  - "Create tag v{{version}}" — Tag this version
  - "Skip tag" — No git tag

**If "Create tag v{{version}}":**
```bash
git tag v{{version}}
echo "Tag v{{version}} created locally."
echo "To push: git push origin v{{version}}"
```

**If "Skip tag":** Continue to next step.
</step>

<step name="show_completion">

Display stage banner (following ui-brand.md):

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► MILESTONE COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**v{{version}} {MILESTONE_NAME}** — {N} phases complete

Archived to: .planning/history/v{{version}}/
Git tag: v{{version}} {if created}

Workspace clean: PROJECT.md, MILESTONES.md, config.json, codebase/

───────────────────────────────────────────────────────────────

## ▶ Next Up

**New Milestone** — Start planning next version

`{{COMMAND_PREFIX}}new-milestone`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────
```
</step>

</process>

<success_criteria>
- [ ] All milestone files archived to .planning/history/v{{version}}/
- [ ] Directory structure mirrored (phases/, research/, todos/)
- [ ] Git commit preserves user identity
- [ ] Optional git tag created based on user choice
- [ ] Workspace contains only: PROJECT.md, MILESTONES.md, config.json, codebase/
- [ ] User knows next command ({{COMMAND_PREFIX}}new-milestone)
</success_criteria>

<critical_rules>
- **Use AskUserQuestion:** All confirmations via AskUserQuestion tool (not manual text prompts)
- **Atomic operations:** Use mv for file moves (not cp then rm)
- **Git identity:** Source git-identity-helpers.sh and use commit_as_user
- **Optional files:** Use 2>/dev/null || true for files that might not exist
- **Direct archiving:** Archive to history/v{{version}}/ (not milestones/)
- **Clean workspace:** After completion, only PROJECT.md, MILESTONES.md, config.json, codebase/ remain
</critical_rules>