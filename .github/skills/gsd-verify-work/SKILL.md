---
name: gsd-verify-work
description: Validate built features through conversational UAT
skill_version: 1.9.1
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools: [read, edit, execute, agent]
arguments: [{name: phase, type: string, required: false, description: 'Phase number to verify (if not provided, checks for active sessions)'}]
metadata:
  platform: copilot
  generated: '2026-01-23'
  templateVersion: 1.0.0
  projectVersion: 1.9.0
  projectName: 'get-shit-done-multi'
---

<objective>
Validate built features through conversational testing with persistent state.

Purpose: Confirm what Claude built actually works from user's perspective. One test at a time, plain text responses, no interrogation. When issues are found, automatically diagnose, plan fixes, and prepare for execution.

Output: {phase}-UAT.md tracking all test results. If issues found: diagnosed gaps, verified fix plans ready for /gsd:execute-phase
</objective>

<execution_context>
@.github/get-shit-done/workflows/verify-work.md
@.github/get-shit-done/templates/UAT.md
</execution_context>

<context>
Phase: $ARGUMENTS (optional)
- If provided: Test specific phase (e.g., "4")
- If not provided: Check for active sessions or prompt for phase

@.planning/STATE.md
@.planning/ROADMAP.md
</context>

<process>
<step name="load_phase_context">
Load phase context from planning directory.

1. If phase argument provided: use that phase
2. If no argument: check for active UAT sessions (*.UAT.md files)
3. Load SUMMARY.md files from phase directory
4. Extract phase goal from ROADMAP.md
5. Understand what was built and what needs verification
</step>

<step name="check_existing_uat">
Check for existing {phase}-*-UAT.md files in phase directory.

If exists with status "diagnosed":
- Display current content
- Offer: "Resume / Start fresh / Cancel"
- If Resume: continue from where left off
- If Start fresh: archive old UAT, create new
- If Cancel: exit

If exists with status "passed":
- Display: "This phase already passed UAT"
- Offer to re-test or exit
</step>

<step name="generate_test_scenarios">
Based on phase goal and SUMMARY files:

1. Extract testable deliverables (user-observable outcomes)
2. Derive 3-5 test scenarios from user's perspective
3. For each scenario:
   - What to test (specific action/flow)
   - Steps to execute the test
   - Expected outcome (what success looks like)
4. Present test plan to user for confirmation
5. Allow user to add/remove/modify scenarios before starting
</step>

<step name="guide_testing">
Present tests one at a time with conversational flow.

For each test scenario:
1. Show test description and expected behavior
2. Present steps clearly
3. Ask: "What happened?" (plain text response)
4. Interpret response:
   - "yes" / "y" / "next" / "passed" = PASS
   - Anything else = ISSUE (capture description)
5. If issue: ask follow-up questions to understand:
   - What exactly happened vs expected?
   - Can you reproduce it?
   - Any error messages?
6. Infer severity from description (blocker/major/minor)
7. Log result and continue to next test

**Anti-patterns:**
- Don't use structured forms for test responses
- Don't ask "what severity?" — infer from description
- Don't present full checklist upfront — one at a time
- Don't run automated tests — this is manual user validation
- Don't fix issues during testing — log as gaps, diagnose after
</step>

<step name="triage_issues">
After all tests complete, if issues found:

1. Review all logged issues
2. Categorize each:
   - **Bug**: Behavior broken (feature exists but doesn't work correctly)
   - **Gap**: Feature missing (expected functionality not implemented)
3. Assess severity:
   - **Blocker**: Prevents core functionality, must fix
   - **Major**: Significant impact on usability
   - **Minor**: Edge case or polish issue
4. Prepare for resolution routing
</step>

<step name="route_to_resolution">
Based on triage results, spawn appropriate agents.

**If bugs found (broken behavior):**

Spawn debugger to investigate:
```javascript
task({
  agent_type: "gsd-debugger",
  description: "Debug UAT issues",
  prompt: `
<issues>
${issueDescriptions}
</issues>

<context>
Phase ${phase} completed. UAT revealed bugs.
Load SUMMARY files and investigate root causes.
</context>

<objective>
Create DEBUG.md session with:
- Reproduction steps for each bug
- Investigation strategy
- Root cause analysis
</objective>
  `
})
```

**If gaps found (missing features):**

Spawn planner in gaps mode:
```javascript
task({
  agent_type: "gsd-planner",
  description: "Plan gap closure",
  prompt: `
<gaps>
${gapDescriptions}
</gaps>

<context>
Phase ${phase} UAT revealed missing features.
Create plans to address these gaps.
</context>

<objective>
Create gap closure plans using --gaps flag pattern.
Each gap should have its own plan with:
- What needs to be built
- How it integrates with existing work
- Verification criteria
</objective>
  `
})
```

**If both bugs and gaps:**
Spawn both agents in parallel (debugger first, then planner)

**If all tests passed:**
Write UAT.md with status: passed
Skip spawning, proceed to commit
</step>

<step name="wait_for_diagnosis">
If agents were spawned:

1. Wait for debugger to create DEBUG.md
2. Wait for planner to create gap closure plans
3. Spawn gsd-plan-checker to verify fix plans
4. If checker finds issues: iterate planner ↔ checker (max 3 iterations)
5. When plans verified: proceed to write UAT report
</step>

<step name="write_uat_report">
Create .planning/phases/{phase}-*/{phase}-*-UAT.md:

```yaml
---
phase: {phase}
tested: {timestamp}
status: {passed|diagnosed}
severity: {blocker|major|minor|none}
tests_total: {N}
tests_passed: {M}
---

# Phase {phase} UAT Report

## Test Results

{For each test scenario:}
### Test {N}: {scenario name}

**Steps:**
{test steps}

**Expected:**
{expected outcome}

**Result:** {PASS|ISSUE}

{If issue: detailed description}

## Issues Found

{If issues:}
### Issue {N}: {title}

**Type:** {bug|gap}
**Severity:** {blocker|major|minor}
**Description:** {what's wrong}
**Impact:** {how it affects users}

## Resolution Status

{If issues diagnosed:}
- DEBUG.md created: {path}
- Fix plans created: {list plan files}
- Plans verified: {yes|no|iterations}
- Ready for execution: {yes|no}

{If all passed:}
All tests passed. Phase verified.

## Next Steps

{Route A/B/C/D from offer_next}
```
</step>

<step name="commit">
Commit the UAT report:

```bash
git add .planning/phases/{phase}-*/{phase}-*-UAT.md

# If issues found and diagnosed
git commit -m "test(${phase}): UAT diagnosed - ${N} issues triaged"

# If all passed
git commit -m "test(${phase}): UAT passed - all features verified"
```
</step>

<step name="present_summary">
Present completion summary with routing.

Use offer_next section to route based on UAT results:
- Route A: All tests pass + more phases remain
- Route B: All tests pass + last phase complete
- Route C: Issues found + fix plans ready
- Route D: Issues found + planning blocked
</step>
</process>

<offer_next>
Output this markdown directly (not as a code block). Route based on UAT results:

| Status | Route |
|--------|-------|
| All tests pass + more phases | Route A (next phase) |
| All tests pass + last phase | Route B (milestone complete) |
| Issues found + fix plans ready | Route C (execute fixes) |
| Issues found + planning blocked | Route D (manual intervention) |

---

**Route A: All tests pass, more phases remain**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PHASE {Z} VERIFIED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

{N}/{N} tests passed
UAT complete ✓

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Phase {Z+1}: {Name}** — {Goal from ROADMAP.md}

/gsd:discuss-phase {Z+1} — gather context and clarify approach

<sub>/clear first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- /gsd:plan-phase {Z+1} — skip discussion, plan directly
- /gsd:execute-phase {Z+1} — skip to execution (if already planned)

───────────────────────────────────────────────────────────────

---

**Route B: All tests pass, milestone complete**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PHASE {Z} VERIFIED ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

{N}/{N} tests passed
Final phase verified ✓

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Audit milestone** — verify requirements, cross-phase integration, E2E flows

/gsd:audit-milestone

<sub>/clear first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- /gsd:complete-milestone — skip audit, archive directly

───────────────────────────────────────────────────────────────

---

**Route C: Issues found, fix plans ready**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PHASE {Z} ISSUES FOUND ⚠
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

{N}/{M} tests passed
{X} issues diagnosed
Fix plans verified ✓

### Issues Found

{List issues with severity from UAT.md}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Execute fix plans** — run diagnosed fixes

/gsd:execute-phase {Z} --gaps-only

<sub>/clear first → fresh context window</sub>

───────────────────────────────────────────────────────────────

**Also available:**
- cat .planning/phases/{phase_dir}/*-PLAN.md — review fix plans
- /gsd:plan-phase {Z} --gaps — regenerate fix plans

───────────────────────────────────────────────────────────────

---

**Route D: Issues found, planning blocked**

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► PHASE {Z} BLOCKED ✗
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**Phase {Z}: {Name}**

{N}/{M} tests passed
Fix planning blocked after {X} iterations

### Unresolved Issues

{List blocking issues from planner/checker output}

───────────────────────────────────────────────────────────────

## ▶ Next Up

**Manual intervention required**

Review the issues above and either:
1. Provide guidance for fix planning
2. Manually address blockers
3. Accept current state and continue

───────────────────────────────────────────────────────────────

**Options:**
- /gsd:plan-phase {Z} --gaps — retry fix planning with guidance
- /gsd:discuss-phase {Z} — gather more context before replanning

───────────────────────────────────────────────────────────────
</offer_next>

<anti_patterns>
- Don't use AskUserQuestion for test responses — plain text conversation
- Don't ask severity — infer from description
- Don't present full checklist upfront — one test at a time
- Don't run automated tests — this is manual user validation
- Don't fix issues during testing — log as gaps, diagnose after all tests complete
</anti_patterns>

<success_criteria>
- [ ] UAT.md created with tests from SUMMARY.md
- [ ] Tests presented one at a time with expected behavior
- [ ] Plain text responses (no structured forms)
- [ ] Severity inferred, never asked
- [ ] Batched writes: on issue, every 5 passes, or completion
- [ ] Committed on completion
- [ ] If issues: parallel debug agents diagnose root causes
- [ ] If issues: gsd-planner creates fix plans from diagnosed gaps
- [ ] If issues: gsd-plan-checker verifies fix plans (max 3 iterations)
- [ ] Ready for `/gsd:execute-phase` when complete
</success_criteria>
