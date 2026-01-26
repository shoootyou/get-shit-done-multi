---
name: gsd-progress
description: >-
  Check project progress, show context, and route to next action (execute or
  plan)
allowed-tools: 'Read, Bash, Task'
argument-hint: ''
---

<objective>
Check project progress, summarize recent work and what's ahead, then intelligently route to the next action - either executing an existing plan or creating the next one.

Provides situational awareness before continuing work. Routes to 11 different commands based on project state.
</objective>

<process>

<step name="verify_structure">
**Verify planning structure exists:**

```bash
if [ ! -d ".planning" ]; then
  echo "No planning structure found."
  echo ""
  echo "Run {{COMMAND_PREFIX}}new-project to start a new project."
  exit 0
fi

if [ ! -f ".planning/STATE.md" ]; then
  echo "Planning structure incomplete - missing STATE.md"
  echo ""
  echo "Run {{COMMAND_PREFIX}}new-project to start a new project."
  exit 0
fi

# If ROADMAP.md missing but PROJECT.md exists - between milestones
if [ ! -f ".planning/ROADMAP.md" ] && [ -f ".planning/PROJECT.md" ]; then
  echo "✓ Milestone archived - ready for next milestone"
  echo ""
  echo "## ▶ Next Up"
  echo ""
  echo "**Start Next Milestone** — questioning → research → requirements → roadmap"
  echo ""
  echo "{{COMMAND_PREFIX}}new-milestone"
  exit 0
fi

if [ ! -f ".planning/ROADMAP.md" ]; then
  echo "Planning structure incomplete - missing ROADMAP.md"
  echo ""
  echo "Run {{COMMAND_PREFIX}}new-project to start a new project."
  exit 0
fi
```

If missing critical files, exit with instructions.
</step>

<step name="load_context">
**Load full project context:**

Read all three key files for complete situational awareness:

```bash
# Load STATE.md for living memory
STATE_CONTENT=$(cat .planning/STATE.md)

# Load ROADMAP.md for phase structure
ROADMAP_CONTENT=$(cat .planning/ROADMAP.md)

# Load PROJECT.md for project context
PROJECT_CONTENT=$(cat .planning/PROJECT.md 2>/dev/null || echo "")
```

Parse critical values from STATE.md:

```bash
# Extract current position
CURRENT_PHASE=$(echo "$STATE_CONTENT" | grep "^Phase:" | head -1 | sed 's/Phase: \([0-9.]*\).*/\1/')
CURRENT_PLAN=$(echo "$STATE_CONTENT" | grep "^Plan:" | head -1 | sed 's/Plan: \([0-9]*\).*/\1/')
STATUS=$(echo "$STATE_CONTENT" | grep "^Status:" | head -1 | sed 's/Status: //')

# Extract project name from PROJECT.md
PROJECT_NAME=$(echo "$PROJECT_CONTENT" | grep "^# " | head -1 | sed 's/^# //')
```

This provides the full context needed for intelligent routing.
</step>

<step name="gather_recent_work">
**Gather recent work context:**

Find the 2-3 most recent SUMMARY files to show "what we've been working on":

```bash
# Find all SUMMARY files, sorted by modification time (newest first)
RECENT_SUMMARIES=$(find .planning/phases -name "*-SUMMARY.md" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -3 | cut -d' ' -f2-)

# Extract phase-plan and one-line summary from each
RECENT_WORK=""
for summary in $RECENT_SUMMARIES; do
  if [ -f "$summary" ]; then
    PHASE_PLAN=$(basename "$summary" | sed 's/-SUMMARY.md//')
    # Get the one-liner after "## Summary" or first H2
    ONELINER=$(grep "^##" "$summary" | head -1 | sed 's/^## //' | sed 's/^Summary: //')
    RECENT_WORK="${RECENT_WORK}- ${PHASE_PLAN}: ${ONELINER}\n"
  fi
done
```

This shows user continuity with prior work.
</step>

<step name="count_files">
**Count files for routing decisions:**

File counts determine which route to take.

```bash
# Find current phase directory (handles both padded and unpadded)
PADDED_PHASE=$(printf "%02d" ${CURRENT_PHASE%%.*} 2>/dev/null || echo "$CURRENT_PHASE")
PHASE_DIR=$(ls -d .planning/phases/${PADDED_PHASE}-* .planning/phases/${CURRENT_PHASE}-* 2>/dev/null | head -1)

if [ -n "$PHASE_DIR" ]; then
  # Count plans in current phase
  PLAN_COUNT=$(ls -1 "${PHASE_DIR}"/*-PLAN.md 2>/dev/null | wc -l)
  
  # Count summaries in current phase
  SUMMARY_COUNT=$(ls -1 "${PHASE_DIR}"/*-SUMMARY.md 2>/dev/null | wc -l)
  
  # Count UAT files with gaps (status: diagnosed)
  UAT_WITH_GAPS=$(grep -l "status: diagnosed" "${PHASE_DIR}"/*-UAT.md 2>/dev/null | wc -l)
  
  # Check for CONTEXT.md
  HAS_CONTEXT=$(ls "${PHASE_DIR}"/*-CONTEXT.md 2>/dev/null | wc -l)
  
  # Get phase name from directory
  PHASE_NAME=$(basename "$PHASE_DIR" | sed 's/^[0-9]*-//' | sed 's/-/ /g')
else
  PLAN_COUNT=0
  SUMMARY_COUNT=0
  UAT_WITH_GAPS=0
  HAS_CONTEXT=0
  PHASE_NAME="Unknown"
fi

# Count pending todos
TODO_COUNT=$(ls -1 .planning/todos/pending/*.md 2>/dev/null | wc -l)

# Count active debug sessions (not resolved)
DEBUG_COUNT=$(ls -1 .planning/debug/*-DEBUG.md 2>/dev/null | grep -v "RESOLVED" | wc -l)

# Find highest phase in roadmap
HIGHEST_PHASE=$(grep "^- Phase [0-9]" .planning/ROADMAP.md | sed 's/^- Phase \([0-9.]*\):.*/\1/' | sort -n | tail -1)

# Calculate completion percentage
TOTAL_PLANS=$(find .planning/phases -name "*-PLAN.md" | wc -l)
COMPLETED_PLANS=$(find .planning/phases -name "*-SUMMARY.md" | wc -l)
if [ "$TOTAL_PLANS" -gt 0 ]; then
  COMPLETION=$((COMPLETED_PLANS * 100 / TOTAL_PLANS))
else
  COMPLETION=0
fi
```

These counts drive the routing logic.
</step>

<step name="present_status_report">
**Present rich status report:**

Show user full situational awareness before routing:

```
# ${PROJECT_NAME}

**Progress:** [${PROGRESS_BAR}] ${COMPLETED_PLANS}/${TOTAL_PLANS} plans complete

## Recent Work
${RECENT_WORK}

## Current Position
Phase ${CURRENT_PHASE} of ${HIGHEST_PHASE}: ${PHASE_NAME}
Plan ${CURRENT_PLAN} - ${STATUS}
CONTEXT: ${HAS_CONTEXT > 0 ? "✓" : "—"}
Plans: ${SUMMARY_COUNT}/${PLAN_COUNT} complete

## Key Decisions Made
[Extract from STATE.md Decisions section]

## Blockers/Concerns
[Extract from STATE.md Blockers/Concerns section]

${TODO_COUNT > 0 ? "## Pending Todos\n- ${TODO_COUNT} pending — {{COMMAND_PREFIX}}check-todos to review\n" : ""}

${DEBUG_COUNT > 0 ? "## Active Debug Sessions\n- ${DEBUG_COUNT} active — {{COMMAND_PREFIX}}debug to continue\n" : ""}

## What's Next
[Determined by routing logic below]
```

Generate progress bar:

```bash
# Calculate progress bar (10 blocks)
FILLED=$((COMPLETION / 10))
EMPTY=$((10 - FILLED))
PROGRESS_BAR=$(printf '█%.0s' $(seq 1 $FILLED))$(printf '░%.0s' $(seq 1 $EMPTY))
```
</step>

<step name="route_to_next_action">
**Route based on verified counts and state:**

Priority-ordered routing logic (evaluated top to bottom). Display appropriate command for user to run.

**Priority 1: UAT gaps need fixing**

If UAT files with status "diagnosed" exist, prioritize fixing gaps:

```
if [ "$UAT_WITH_GAPS" -gt 0 ]; then
  Display:
  ---
  ## ⚠ UAT Gaps Found
  
  Phase ${CURRENT_PHASE} has ${UAT_WITH_GAPS} UAT file(s) with diagnosed gaps.
  
  {{COMMAND_PREFIX}}plan-phase ${CURRENT_PHASE} --gaps
  
  ---
  Also available:
  - {{COMMAND_PREFIX}}execute-phase ${CURRENT_PHASE} — execute existing plans  
  - {{COMMAND_PREFIX}}verify-work ${CURRENT_PHASE} — run more UAT testing
  
  Exit
fi
```

**Priority 2: Unexecuted plans exist**

If summaries < plans AND plans > 0, route to execute-phase:

```
if [ "$SUMMARY_COUNT" -lt "$PLAN_COUNT" ] && [ "$PLAN_COUNT" -gt 0 ]; then
  NEXT_PLAN=$((SUMMARY_COUNT + 1))
  NEXT_PLAN_PADDED=$(printf "%02d" $NEXT_PLAN)
  
  # Find and read plan file
  NEXT_PLAN_FILE="${PHASE_DIR}/${CURRENT_PHASE}-${NEXT_PLAN_PADDED}-PLAN.md"
  if [ -f "$NEXT_PLAN_FILE" ]; then
    PLAN_OBJECTIVE=$(grep -A 2 "^# Phase" "$NEXT_PLAN_FILE" | grep "^\*\*Objective:\*\*" | sed 's/\*\*Objective:\*\* //')
  fi
  
  Display:
  ---
  ## ▶ Next Up
  
  ${CURRENT_PHASE}-${NEXT_PLAN_PADDED}: ${PLAN_OBJECTIVE}
  
  {{COMMAND_PREFIX}}execute-phase ${CURRENT_PHASE}
  
  <sub>/clear first → fresh context window</sub>
  ---
  
  Exit
fi
```

**Priority 3: Phase complete - check milestone status**

If summaries = plans AND plans > 0, phase is complete. Check if milestone complete:

```
if [ "$SUMMARY_COUNT" -eq "$PLAN_COUNT" ] && [ "$PLAN_COUNT" -gt 0 ]; then
  if [ "$CURRENT_PHASE" = "$HIGHEST_PHASE" ]; then
    # Milestone complete
    Display:
    ---
    ## 🎉 Milestone Complete
    
    All ${HIGHEST_PHASE} phases finished!
    
    ## ▶ Next Up
    
    Complete Milestone — archive and prepare for next
    
    {{COMMAND_PREFIX}}complete-milestone
    
    <sub>/clear first → fresh context window</sub>
    ---
    
    Also available:
    - {{COMMAND_PREFIX}}verify-work — user acceptance test before completing
    
    Exit
  else
    # More phases remain - move to next
    NEXT_PHASE_NUM=$(echo "$CURRENT_PHASE + 1" | bc)
    NEXT_PHASE_LINE=$(grep "^- Phase ${NEXT_PHASE_NUM}:" .planning/ROADMAP.md | head -1)
    NEXT_PHASE_NAME=$(echo "$NEXT_PHASE_LINE" | sed 's/^- Phase [0-9.]*: //')
    
    Display:
    ---
    ## ✓ Phase ${CURRENT_PHASE} Complete
    
    ## ▶ Next Up
    
    Phase ${NEXT_PHASE_NUM}: ${NEXT_PHASE_NAME}
    
    {{COMMAND_PREFIX}}discuss-phase ${NEXT_PHASE_NUM}
    
    <sub>/clear first → fresh context window</sub>
    ---
    
    Also available:
    - {{COMMAND_PREFIX}}plan-phase ${NEXT_PHASE_NUM} — skip discussion, plan directly
    - {{COMMAND_PREFIX}}research-phase ${NEXT_PHASE_NUM} — research-heavy planning
    - {{COMMAND_PREFIX}}verify-work ${CURRENT_PHASE} — user acceptance test before continuing
    
    Exit
  fi
fi
```

**Priority 4: Phase needs planning**

If plans = 0, phase needs planning. Check for CONTEXT file:

```
if [ "$PLAN_COUNT" -eq 0 ]; then
  PHASE_GOAL=$(grep "^- Phase ${CURRENT_PHASE}:" .planning/ROADMAP.md | head -1 | sed 's/^- Phase [0-9.]*: //')
  
  if [ "$HAS_CONTEXT" -gt 0 ]; then
    # Context exists - ready to plan
    Display:
    ---
    ## ▶ Next Up
    
    Phase ${CURRENT_PHASE}: ${PHASE_NAME} — ${PHASE_GOAL}
    
    <sub>✓ Context gathered, ready to plan</sub>
    
    {{COMMAND_PREFIX}}plan-phase ${CURRENT_PHASE}
    
    <sub>/clear first → fresh context window</sub>
    ---
    
    Exit
  else
    # No context - need discussion
    Display:
    ---
    ## ▶ Next Up
    
    Phase ${CURRENT_PHASE}: ${PHASE_NAME} — ${PHASE_GOAL}
    
    {{COMMAND_PREFIX}}discuss-phase ${CURRENT_PHASE}
    
    <sub>/clear first → fresh context window</sub>
    ---
    
    Also available:
    - {{COMMAND_PREFIX}}plan-phase ${CURRENT_PHASE} — skip discussion, plan directly
    - {{COMMAND_PREFIX}}list-phase-assumptions ${CURRENT_PHASE} — see Claude's assumptions
    ---
    
    Exit
  fi
fi
```

**Priority 5: Pending todos**

If TODO_COUNT > 0, route to check-todos:

```
if [ "$TODO_COUNT" -gt 0 ]; then
  Display:
  ---
  ## ▶ Next Up
  
  Review Pending Todos — ${TODO_COUNT} todo(s) need attention
  
  {{COMMAND_PREFIX}}check-todos
  ---
  
  Exit
fi
```

**Priority 6: Active debug sessions**

If DEBUG_COUNT > 0, route to debug:

```
if [ "$DEBUG_COUNT" -gt 0 ]; then
  Display:
  ---
  ## ▶ Next Up
  
  Resume Debug Session — ${DEBUG_COUNT} active session(s)
  
  {{COMMAND_PREFIX}}debug
  ---
  
  Exit
fi
```

**Fallback: No clear action**

No obvious next step - offer options:

```
Display:
---
## No Clear Next Action

Milestone may be complete, or planning structure needs attention.

Options:
- {{COMMAND_PREFIX}}complete-milestone — archive and prepare for next
- {{COMMAND_PREFIX}}new-milestone — start new milestone  
- {{COMMAND_PREFIX}}verify-work ${CURRENT_PHASE} — run user acceptance testing
---
```

**Routing Summary:**

This command routes to 11 different GSD commands based on project state:

1. `{{COMMAND_PREFIX}}plan-phase --gaps` (UAT gaps exist)
2. `{{COMMAND_PREFIX}}execute-phase` (unexecuted plans exist)
3. `{{COMMAND_PREFIX}}complete-milestone` (milestone complete)
4. `{{COMMAND_PREFIX}}discuss-phase` (next phase, no context)
5. `{{COMMAND_PREFIX}}plan-phase` (has context or alternative)
6. `{{COMMAND_PREFIX}}verify-work` (alternative for testing)
7. `{{COMMAND_PREFIX}}list-phase-assumptions` (alternative for planning)
8. `{{COMMAND_PREFIX}}check-todos` (pending todos)
9. `{{COMMAND_PREFIX}}debug` (active debug sessions)
10. `{{COMMAND_PREFIX}}new-milestone` (fallback between milestones)
11. `{{COMMAND_PREFIX}}new-project` (no planning structure - from step "verify_structure")

All routing decisions based on file counts and state checks.
</step>

<step name="handle_edge_cases">
**Handle edge cases:**

- Empty directories handled by file counts (0 is valid)
- Decimal phases handled by pattern matching (72.1, 72.2)
- Missing files handled by 2>/dev/null redirects
- Handoff file detection: check for `.planning/phases/*/.continue-here.md`

If handoff file exists:

```bash
if [ -f "${PHASE_DIR}/.continue-here.md" ]; then
  echo ""
  echo "📋 **Session handoff detected** — ${PHASE_DIR}/.continue-here.md"
  echo ""
fi
```
</step>

</process>

<success_criteria>

- [ ] Rich context provided (recent work, decisions, issues)
- [ ] Current position clear with visual progress
- [ ] What's next clearly explained with routing
- [ ] Smart routing: execute if plans exist, plan if not
- [ ] All 11 routing paths work correctly
- [ ] File counting logic accurate (handles 0 files gracefully)
- [ ] Progress bar displays correctly
- [ ] Pending todos and debug sessions highlighted

</success_criteria>
