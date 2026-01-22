# Phase 4: Mid-Complexity Commands - Research

**Researched:** 2025-01-22
**Domain:** Mid-complexity orchestrators with 1-2 subagent spawns, verification loops, conditional logic
**Confidence:** HIGH

## Summary

Phase 4 migrates four commands that orchestrate 1-2 subagents with conditional logic and iteration patterns. These commands (plan-phase, research-phase, debug, map-codebase) represent a "mid-complexity" tier between simple commands (Phase 5) and high-complexity orchestrators (Phase 3: 5-7 parallel spawns).

**Key findings:**

1. **Complexity tier validated**: These commands spawn 1-2 agents each, contrasting with Phase 3's 5-7 parallel spawns. plan-phase is most complex (475 lines, 4 spawns, revision loop), while map-codebase is simplest (71 lines, mentioned spawns in prose).

2. **plan-phase is the anchor**: It's referenced by 13 other commands and orchestrates the core planning workflow (research → plan → verify → iterate). It spawns 3 unique agent types (gsd-phase-researcher, gsd-planner, gsd-plan-checker) in a verification loop pattern.

3. **Verification loop pattern**: plan-phase implements a 3-iteration revision loop where checker feedback spawns revised planning. This pattern is unique to mid-tier commands—Phase 3 doesn't have this iterative refinement.

4. **Sequential vs parallel spawning**: Unlike Phase 3's parallel spawns, these commands use sequential spawning with checkpoints. Agents spawn → wait → parse → route → potentially respawn with new context.

**Primary recommendation:** Migrate in dependency order (research-phase → map-codebase → debug → plan-phase) preserving exact verification loop logic and checkpoint handling patterns.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Task tool | Claude native | Sequential subagent spawning | Built-in, blocks until completion |
| gray-matter | 4.0.3 | Parse frontmatter from PLAN.md | Already integrated in template system |
| Bash tool | Claude native | Phase validation, file checks | Pre-flight validation before spawning |
| AskUserQuestion | Claude native | Checkpoint/decision handling | User intervention at iteration boundaries |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| Read | Load @-referenced context | Before spawning (gather context) |
| Write | Create marker files | Debug session persistence |
| Glob/Grep | Discovery (find plans) | Pre-spawn validation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Sequential spawning + checkpoints | Parallel spawning | These commands NEED user input mid-flow, parallel wouldn't work |
| Iteration counter | While-true loop | Max iterations prevent infinite loops |
| Structured returns (## RESULT) | JSON | Markdown headers are more natural for Claude |

**Installation:**
```bash
# No new dependencies
# All tools are Claude Code native
```

## Architecture Patterns

### Recommended Migration Structure
```
specs/skills/
├── gsd-plan-phase/
│   └── SKILL.md           # 475 lines → migrate structure exactly
├── gsd-research-phase/
│   └── SKILL.md           # 180 lines → simpler, reference by plan-phase
├── gsd-debug/
│   └── SKILL.md           # 149 lines → session persistence pattern
└── gsd-map-codebase/
    └── SKILL.md           # 71 lines → simple, references workflow file
```

### Pattern 1: Verification Loop with Max Iterations
**What:** Spawn planner → spawn checker → parse issues → respawn planner with feedback (max 3 times)
**When to use:** Quality gates that need refinement cycles (plan-phase uses this)
**Example:**
```javascript
// Source: commands/gsd/plan-phase.md lines 366-419
// Track iteration count
let iteration_count = 1;

// Initial spawn
Task(prompt="<planning_context>...</planning_context>", 
     subagent_type="gsd-planner")

// Verification loop
while (iteration_count < 3) {
  Task(prompt="<verification_context>...</verification_context>",
       subagent_type="gsd-plan-checker")
  
  if (result.includes("## VERIFICATION PASSED")) {
    break;
  } else if (result.includes("## ISSUES FOUND")) {
    // Respawn planner with issues
    Task(prompt="<revision_context>Issues: {issues}</revision_context>",
         subagent_type="gsd-planner")
    iteration_count++;
  }
}

if (iteration_count >= 3) {
  // User intervention required
  AskUserQuestion("Max iterations reached. Proceed anyway?")
}
```

**Key characteristics:**
- Counter tracks iteration (NOT infinite loop)
- Max 3 iterations hardcoded (prevents runaway)
- User intervention MUST happen after max iterations
- Each respawn includes feedback from prior iteration

### Pattern 2: Conditional Research Flow
**What:** Check for existing research, skip if exists unless --research flag
**When to use:** Expensive operations that should cache (research, mapping)
**Example:**
```bash
# Source: commands/gsd/plan-phase.md lines 104-134
# Check existing research
ls "${PHASE_DIR}"/*-RESEARCH.md 2>/dev/null

if [ -f "${PHASE_DIR}/${PHASE}-RESEARCH.md" ] && [ "$FORCE_RESEARCH" != "true" ]; then
  echo "Using existing research: ${RESEARCH_FILE}"
  # Skip to planning
else
  # Spawn researcher
  Task(prompt="<research>...", subagent_type="gsd-phase-researcher")
fi
```

**Flags that modify flow:**
- `--research`: Force re-research (ignore cache)
- `--skip-research`: Skip entirely (go straight to planning)
- `--gaps`: Gap closure mode (reads VERIFICATION.md instead)
- `--skip-verify`: Skip checker loop

### Pattern 3: Checkpoint-Based Continuation
**What:** Agent reaches checkpoint, returns to orchestrator, user responds, spawn continuation agent
**When to use:** Long-running investigations that need user input mid-stream
**Example:**
```javascript
// Source: commands/gsd/debug.md lines 98-139
// Initial spawn
Task(prompt="<objective>Investigate {issue}</objective>...", 
     subagent_type="gsd-debugger")

// Parse return
if (result.includes("## CHECKPOINT REACHED")) {
  // Present checkpoint to user
  displayCheckpointInfo(result);
  
  // Get user response
  const userResponse = AskUserQuestion({
    question: checkpoint.question,
    options: checkpoint.options
  });
  
  // Spawn continuation with response
  Task(prompt=`
    <objective>Continue debugging {issue}</objective>
    <prior_state>
    Debug file: @.planning/debug/{slug}.md
    </prior_state>
    <checkpoint_response>
    Type: {checkpoint_type}
    Response: ${userResponse}
    </checkpoint_response>
  `, subagent_type="gsd-debugger")
}
```

**Key pattern:**
- Agent writes state to disk (persistence)
- Checkpoint includes type + question + options
- Continuation agent loads prior state via @-reference
- User response passed as structured context

### Pattern 4: Parallel Spawn Prose (map-codebase)
**What:** Process description mentions parallel spawning but doesn't show Task() calls
**When to use:** Rare—most commands show explicit spawns
**Example:**
```markdown
<!-- Source: commands/gsd/map-codebase.md lines 51-63 -->
<process>
3. Spawn 4 parallel gsd-codebase-mapper agents:
   - Agent 1: tech focus → writes STACK.md, INTEGRATIONS.md
   - Agent 2: arch focus → writes ARCHITECTURE.md, STRUCTURE.md
   - Agent 3: quality focus → writes CONVENTIONS.md, TESTING.md
   - Agent 4: concerns focus → writes CONCERNS.md
4. Wait for agents to complete, collect confirmations
</process>
```

**Migration note:** This prose style needs conversion to explicit Task() calls:
```javascript
Task(prompt="<focus>tech</focus><writes>STACK.md, INTEGRATIONS.md</writes>...", 
     subagent_type="gsd-codebase-mapper")
Task(prompt="<focus>arch</focus><writes>ARCHITECTURE.md, STRUCTURE.md</writes>...", 
     subagent_type="gsd-codebase-mapper")
Task(prompt="<focus>quality</focus><writes>CONVENTIONS.md, TESTING.md</writes>...", 
     subagent_type="gsd-codebase-mapper")
Task(prompt="<focus>concerns</focus><writes>CONCERNS.md</writes>...", 
     subagent_type="gsd-codebase-mapper")
```

### Pattern 5: File-Based Session Persistence (debug)
**What:** Write session state to .planning/debug/{slug}.md for continuation
**When to use:** Multi-turn workflows that span context resets
**Example:**
```markdown
<!-- Source: commands/gsd/debug.md lines 74-78 -->
<debug_file>
Create: .planning/debug/{slug}.md
</debug_file>

<!-- Then in continuation agent -->
<prior_state>
Debug file: @.planning/debug/{slug}.md
</prior_state>
```

**Key pattern:**
- Orchestrator creates unique slug from issue description
- Agent writes findings to debug file incrementally
- Continuation agent reads via @-reference
- File persists across context resets

### Anti-Patterns to Avoid

- **Don't convert iteration counters to infinite loops** — Max iterations prevent runaway costs
- **Don't parallelize checkpoint-based flows** — These NEED sequential spawn → user input → respawn
- **Don't skip flag validation** — Missing flag checks lead to undefined behavior
- **Don't inline prose spawning** — Convert map-codebase prose to explicit Task() calls

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phase number normalization | String manipulation | Bash printf + regex | Edge cases: decimals (2.1), padding (08 vs 8) |
| Frontmatter parsing | Custom YAML parser | gray-matter | Already integrated, handles all edge cases |
| Iteration tracking | While-true + break | Counter + max check | Prevents infinite loops, clearer intent |
| Checkpoint serialization | JSON stringify | Markdown sections | More natural for Claude, easier to read |
| File existence checks | Try/catch | Bash test commands | Clearer, already validated in legacy |

**Key insight:** These commands have nuanced conditional logic (flags, iterations, checkpoints). Don't simplify away the nuance—it handles real edge cases.

## Common Pitfalls

### Pitfall 1: Breaking Verification Loop Logic
**What goes wrong:** Simplify iteration logic, lose max-iteration safeguard, runaway costs
**Why it happens:** Looks like boilerplate, seems like defensive programming
**How to avoid:**
1. Preserve iteration counter exactly as written
2. Keep hardcoded max of 3 (don't parameterize)
3. User intervention MUST happen after max iterations
4. Test: Force checker to always return issues, verify stops at 3
**Warning signs:**
- Command loops forever on plan issues
- No user prompt after 3 iterations
- Cost spikes from repeated spawns

### Pitfall 2: Flag Parsing Incompleteness
**What goes wrong:** Miss a flag (e.g., --gaps), command fails or behaves wrong
**Why it happens:** Focus on common case (--research), miss edge flags
**How to avoid:**
1. Extract ALL flags from argument-hint: `grep "argument-hint" | grep -Eo "\-\-[a-z-]+" | sort -u`
2. Verify each flag in process steps: `grep -- "${flag}" commands/gsd/*.md`
3. Test each flag combination (6 combos for plan-phase)
**Warning signs:**
- User reports "flag doesn't work"
- Gap closure mode broken (plan-phase --gaps)
- Research skipping doesn't work

### Pitfall 3: Checkpoint Response Structure Lost
**What goes wrong:** Flatten checkpoint handling, lose type + options structure
**Why it happens:** Checkpoint feels like "just pause and ask user"
**How to avoid:**
1. Checkpoint has 3 parts: type, question, options
2. User response must be structured (not free text)
3. Continuation agent needs type + response in context
4. Verify: `grep -A10 "## CHECKPOINT REACHED" specs/agents/gsd-debugger.md`
**Warning signs:**
- Continuation agent doesn't know what user chose
- Investigation paths not branching correctly
- User sees generic "continue?" instead of specific options

### Pitfall 4: Research Cache Invalidation Missing
**What goes wrong:** Existing RESEARCH.md used even when stale
**Why it happens:** Cache check added, but no --research flag to force refresh
**How to avoid:**
1. Always check for existing file first
2. Provide flag to override (--research)
3. Display what was used: "Using existing research: {file}"
4. Offer re-research at completion if output seems wrong
**Warning signs:**
- User says "research is outdated but command won't refresh"
- Phase planning uses stale stack info
- --research flag doesn't force refresh

### Pitfall 5: map-codebase Prose Not Converted
**What goes wrong:** Migrate prose as-is, no agents actually spawn
**Why it happens:** Process says "spawn 4 agents" but shows no Task() calls
**How to avoid:**
1. Find prose mentions: `grep -A5 "Spawn.*agents" commands/gsd/map-codebase.md`
2. Convert each bullet to explicit Task() call
3. Verify 4 Task() calls exist in migrated SKILL.md
4. Test: Run command, verify 4 agents actually spawn
**Warning signs:**
- Command completes instantly (no agents ran)
- Codebase files not created
- No parallel spawn indicators in output

### Pitfall 6: Phase Directory Normalization Edge Cases
**What goes wrong:** Phase input "8" doesn't match directory "08-*", command fails
**Why it happens:** Normalization logic complex: integers, decimals, padding
**How to avoid:**
1. Preserve normalization bash exactly (lines 66-74 in plan-phase)
2. Handle integers (8 → 08), decimals (2.1 → 02.1), already padded (08 → 08)
3. Test all three cases
4. Match both padded and unpadded directories: `ls .planning/phases/${PHASE}-* .planning/phases/${UNPADDED_PHASE}-*`
**Warning signs:**
- "Phase not found" errors for valid phases
- Works for double-digit phases, fails for single-digit
- Decimal phases (3.5) fail to match directories

## Code Examples

Verified patterns from legacy commands:

### Example 1: plan-phase Verification Loop
```bash
# Source: commands/gsd/plan-phase.md lines 295-419

## 9. Handle Planner Return

**`## PLANNING COMPLETE`:**
- Display: `Planner created {N} plan(s). Files on disk.`
- If `--skip-verify`: Skip to step 13
- Otherwise: Proceed to step 10

## 10. Spawn gsd-plan-checker Agent

Task(
  prompt=checker_prompt,
  subagent_type="gsd-plan-checker",
  description="Verify Phase {phase} plans"
)

## 11. Handle Checker Return

**If `## VERIFICATION PASSED`:**
- Display: `Plans verified. Ready for execution.`
- Proceed to step 13

**If `## ISSUES FOUND`:**
- Display: `Checker found issues: [list]`
- Check iteration_count
- Proceed to step 12

## 12. Revision Loop (Max 3 Iterations)

Track: `iteration_count` (starts at 1 after initial plan + check)

**If iteration_count < 3:**
  Display: `Sending back to planner for revision... (iteration {N}/3)`
  
  Task(
    prompt=revision_prompt,  # includes structured_issues_from_checker
    subagent_type="gsd-planner",
    description="Revise Phase {phase} plans"
  )
  
  # After planner returns → spawn checker again (step 10)
  iteration_count++

**If iteration_count >= 3:**
  Display: `Max iterations reached. {N} issues remain: [list]`
  
  AskUserQuestion:
  1. Force proceed (execute despite issues)
  2. Provide guidance (user gives direction, retry)
  3. Abandon (exit planning)
```

### Example 2: research-phase with Checkpoint Continuation
```javascript
// Source: commands/gsd/research-phase.md lines 73-171

// Initial spawn
Task(prompt=`
<objective>
Research implementation approach for Phase {phase_number}: {phase_name}
Mode: ecosystem
</objective>

<context>
Phase description: {phase_description}
Requirements: {requirements_list}
Prior decisions: {decisions_if_any}
</context>

<downstream_consumer>
Your RESEARCH.md will be loaded by /gsd:plan-phase which uses specific sections:
- Standard Stack → Plans use these libraries
- Architecture Patterns → Task structure follows these
- Don't Hand-Roll → Tasks NEVER build custom solutions
</downstream_consumer>

<output>
Write to: .planning/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md
</output>
`, subagent_type="gsd-phase-researcher")

// Handle return
if (result.includes("## RESEARCH COMPLETE")) {
  displaySummary();
  offerOptions();
} else if (result.includes("## CHECKPOINT REACHED")) {
  presentCheckpoint();
  userResponse = AskUserQuestion(checkpoint.question);
  
  // Spawn continuation
  Task(prompt=`
  <objective>
  Continue research for Phase {phase_number}
  </objective>
  
  <prior_state>
  Research file: @.planning/phases/${PHASE}-{slug}/${PHASE}-RESEARCH.md
  </prior_state>
  
  <checkpoint_response>
  Type: {checkpoint_type}
  Response: ${userResponse}
  </checkpoint_response>
  `, subagent_type="gsd-phase-researcher")
}
```

### Example 3: debug Session Persistence
```javascript
// Source: commands/gsd/debug.md lines 30-139

// Check for active sessions
const activeSessions = bash(`ls .planning/debug/*.md 2>/dev/null | grep -v resolved`);

if (activeSessions.length > 0 && !$ARGUMENTS) {
  // User picks session to resume OR describes new issue
  displaySessions(activeSessions);
  AskUserQuestion("Resume which session or describe new issue?");
}

// For new issue: gather symptoms
const symptoms = {
  expected: AskUserQuestion("What should happen?"),
  actual: AskUserQuestion("What happens instead?"),
  errors: AskUserQuestion("Any errors? (paste or describe)"),
  timeline: AskUserQuestion("When did this start? Ever worked?"),
  reproduction: AskUserQuestion("How do you trigger it?")
};

// Create session slug
const slug = createSlug(symptoms.actual);  // "cannot-start-dev-server"

// Spawn debugger with persistence
Task(prompt=`
<objective>
Investigate issue: ${slug}
</objective>

<symptoms>
expected: ${symptoms.expected}
actual: ${symptoms.actual}
errors: ${symptoms.errors}
reproduction: ${symptoms.reproduction}
timeline: ${symptoms.timeline}
</symptoms>

<mode>
symptoms_prefilled: true
goal: find_and_fix
</mode>

<debug_file>
Create: .planning/debug/${slug}.md
</debug_file>
`, subagent_type="gsd-debugger")

// Handle checkpoint (continuation)
if (result.includes("## CHECKPOINT REACHED")) {
  Task(prompt=`
  <objective>Continue debugging ${slug}</objective>
  <prior_state>
  Debug file: @.planning/debug/${slug}.md
  </prior_state>
  <checkpoint_response>
  Type: ${checkpoint.type}
  Response: ${userResponse}
  </checkpoint_response>
  `, subagent_type="gsd-debugger")
}
```

### Example 4: Phase Normalization (all phase commands)
```bash
# Source: commands/gsd/plan-phase.md lines 66-74
# Source: commands/gsd/research-phase.md lines 36-44

# Normalize phase number (8 → 08, but preserve decimals like 2.1 → 02.1)
if [[ "$PHASE" =~ ^[0-9]+$ ]]; then
  # Integer: 8 → 08
  PHASE=$(printf "%02d" "$PHASE")
elif [[ "$PHASE" =~ ^([0-9]+)\.([0-9]+)$ ]]; then
  # Decimal: 2.1 → 02.1
  PHASE=$(printf "%02d.%s" "${BASH_REMATCH[1]}" "${BASH_REMATCH[2]}")
fi

# Match both padded and unpadded directories
PHASE_DIR=$(ls -d .planning/phases/${PHASE}-* 2>/dev/null | head -1)

# If not found, create with normalized name
if [ -z "$PHASE_DIR" ]; then
  PHASE_NAME=$(grep "Phase ${PHASE}:" .planning/ROADMAP.md | sed 's/.*Phase [0-9]*: //' | tr '[:upper:]' '[:lower:]' | tr ' ' '-')
  mkdir -p ".planning/phases/${PHASE}-${PHASE_NAME}"
  PHASE_DIR=".planning/phases/${PHASE}-${PHASE_NAME}"
fi
```

### Example 5: Conditional Research Flow (plan-phase)
```bash
# Source: commands/gsd/plan-phase.md lines 104-200

## 5. Handle Research

# Skip research in gap closure mode
if [ "$GAPS_MODE" = "true" ]; then
  echo "Gap closure mode: skipping research (using VERIFICATION.md)"
  # Jump to step 6
fi

# Skip if flag set
if [ "$SKIP_RESEARCH" = "true" ]; then
  echo "Research skipped by --skip-research flag"
  # Jump to step 6
fi

# Check for existing research
RESEARCH_FILE=$(ls "${PHASE_DIR}"/*-RESEARCH.md 2>/dev/null | head -1)

if [ -f "$RESEARCH_FILE" ] && [ "$FORCE_RESEARCH" != "true" ]; then
  echo "Using existing research: $RESEARCH_FILE"
  # Jump to step 6
fi

# If we get here: spawn researcher
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " GSD ► RESEARCHING PHASE ${PHASE}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "◆ Spawning researcher..."

Task(
  prompt=research_prompt,
  subagent_type="gsd-phase-researcher",
  description="Research Phase ${PHASE}"
)

# Handle researcher return
if (result.includes("## RESEARCH COMPLETE")) {
  echo "Research complete. Proceeding to planning..."
  # Continue to step 6
} else if (result.includes("## RESEARCH BLOCKED")) {
  # Display blocker, offer options
  AskUserQuestion("Research blocked. Provide context / Skip / Abort?")
}
```

## Command Analysis Table

| Command | Lines | Spawns | Agents | @-refs | Flags | Complexity Driver |
|---------|-------|--------|--------|--------|-------|-------------------|
| **plan-phase** | 475 | 4 | 3 types (researcher, planner, checker) | 11 | --research, --skip-research, --gaps, --skip-verify | Verification loop (3 iters), 4 conditional branches |
| **research-phase** | 180 | 2 | 1 type (researcher) | 1 | none | Checkpoint continuation, mode parameter |
| **debug** | 149 | 2 | 1 type (debugger) | 1 | none | Session persistence, symptom gathering, checkpoint |
| **map-codebase** | 71 | 4 (prose) | 1 type (mapper) | 1 | none | Parallel spawn mentioned in prose, not explicit |

**Key insights:**
- **plan-phase** is 6.7x more complex than **map-codebase** by line count
- **plan-phase** has 4 flags, others have 0-1 (flag parsing is complexity driver)
- All spawn 1-2 agent types (vs Phase 3's 5-7 parallel spawns across 3+ types)
- @-references are minimal (1-11) compared to Phase 3's 15-20+

## Dependency Mapping

### Subagent Dependencies
```
plan-phase
  ├── gsd-phase-researcher (optional, conditional on research flags)
  ├── gsd-planner (always, revision loop may spawn twice)
  └── gsd-plan-checker (optional, conditional on --skip-verify)

research-phase
  └── gsd-phase-researcher (always, may checkpoint and respawn)

debug
  └── gsd-debugger (always, may checkpoint and respawn)

map-codebase
  └── gsd-codebase-mapper (4 parallel spawns, 1 agent type, 4 focus areas)
```

**Agent spec verification:**
```bash
ls specs/agents/gsd-phase-researcher.md  # ✓ 637 lines
ls specs/agents/gsd-planner.md           # ✓ 793 lines
ls specs/agents/gsd-plan-checker.md      # ✓ 750 lines
ls specs/agents/gsd-debugger.md          # ✓ 518 lines
ls specs/agents/gsd-codebase-mapper.md   # ✓ 984 lines
```

All required agents exist—no new agent specs needed.

### Incoming References (Downstream Dependencies)

**plan-phase referenced by 13 commands:**
- add-phase, check-todos, debug, execute-phase, help, insert-phase, map-codebase, new-milestone, new-project, plan-milestone-gaps, progress, research-phase, verify-work

**Critical dependencies:**
1. **new-project** → plan-phase (offers "plan first phase" at completion)
2. **new-milestone** → plan-phase (offers "plan first phase" at completion)
3. **execute-phase** → plan-phase (suggests planning if no plans exist)
4. **plan-milestone-gaps** → plan-phase (uses --gaps flag for gap closure)

**research-phase referenced by 1 command:**
- help (documentation only)

**debug referenced by 2 commands:**
- help, progress (suggests debug for anomalies)

**map-codebase referenced by 2 commands:**
- help, new-project (offers mapping for brownfield projects)

**Migration priority:** plan-phase LAST (13 references, must not break downstream commands).

### File Dependencies

**Created files:**
```
plan-phase:
  - .planning/phases/{phase}-{name}/{phase}-RESEARCH.md (conditional)
  - .planning/phases/{phase}-{name}/{phase}-PLAN.md (1-N files)

research-phase:
  - .planning/phases/{phase}-{name}/{phase}-RESEARCH.md

debug:
  - .planning/debug/{slug}.md (persistent session)

map-codebase:
  - .planning/codebase/STACK.md
  - .planning/codebase/INTEGRATIONS.md
  - .planning/codebase/ARCHITECTURE.md
  - .planning/codebase/STRUCTURE.md
  - .planning/codebase/CONVENTIONS.md
  - .planning/codebase/TESTING.md
  - .planning/codebase/CONCERNS.md
```

**Consumed files (via @-references):**
```
plan-phase:
  - ~/.claude/get-shit-done/references/ui-brand.md
  - .planning/STATE.md
  - .planning/ROADMAP.md
  - .planning/REQUIREMENTS.md
  - .planning/phases/{phase}-{name}/{phase}-CONTEXT.md (optional)
  - .planning/phases/{phase}-{name}/{phase}-RESEARCH.md (optional)
  - .planning/phases/{phase}-{name}/{phase}-VERIFICATION.md (--gaps mode)
  - .planning/phases/{phase}-{name}/{phase}-UAT.md (--gaps mode)

map-codebase:
  - ~/.claude/get-shit-done/workflows/map-codebase.md
```

**Dependency note:** plan-phase references ui-brand.md and workflows/map-codebase.md. These files must exist before migration testing.

### Template Dependencies

**Referenced templates (implicit):**
```
plan-phase → gsd-planner → uses PLAN.md template structure
research-phase → gsd-phase-researcher → uses RESEARCH.md template structure
map-codebase → gsd-codebase-mapper → uses 7 codebase/*.md templates
```

**Template locations:**
```bash
# Verify templates exist
ls ~/.claude/get-shit-done/templates/plan.md 2>/dev/null
ls ~/.claude/get-shit-done/templates/research-phase.md 2>/dev/null
ls ~/.claude/get-shit-done/templates/codebase/*.md 2>/dev/null
```

## Migration Complexity Assessment

### Complexity Tiers

**Tier 1: Simple (map-codebase)**
- Lines: 71
- Spawns: 4 (prose, needs conversion)
- Flags: 0
- Conditionals: 4
- **Effort: 2 hours** — Prose → explicit spawns, simple flow

**Tier 2: Moderate (debug, research-phase)**
- Lines: 149-180
- Spawns: 2 (checkpoint continuation)
- Flags: 0-1
- Conditionals: 6-7
- **Effort: 3-4 hours each** — Checkpoint handling, session persistence

**Tier 3: Complex (plan-phase)**
- Lines: 475
- Spawns: 4 (revision loop, conditional)
- Flags: 4
- Conditionals: 31
- **Effort: 8-10 hours** — Verification loop, flag matrix, @-reference preservation

### Migration Challenges by Command

#### plan-phase (highest complexity)
| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| 11 @-references | High — Must preserve exactly | Pre-migration reference audit |
| 4 flags with interactions | High — Flag matrix: 16 combinations | Test matrix: common paths + edge cases |
| 3-iteration revision loop | High — Counter logic, max iteration safeguard | Preserve exact logic, test runaway prevention |
| 13 downstream references | High — Breaking changes cascade | Migrate last, test all referencing commands |
| Sequential spawn patterns | Medium — Different from Phase 3 parallel | Don't try to parallelize verification loop |

#### research-phase (moderate complexity)
| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| Checkpoint continuation | Medium — State across context resets | Preserve @-reference to prior state |
| Mode parameter | Low — Single enum value | Document mode values in SKILL.md |
| Minimal flags | Low — No complex flag parsing | Straightforward |

#### debug (moderate complexity)
| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| Session persistence | Medium — File-based state | Preserve slug generation, @-reference pattern |
| Symptom gathering | Medium — Multi-question AskUserQuestion flow | Preserve exact question sequence |
| Checkpoint continuation | Medium — Resume logic | Test resume from various checkpoint types |

#### map-codebase (lowest complexity)
| Challenge | Impact | Mitigation |
|-----------|--------|------------|
| Prose spawns | High — No explicit Task() calls | Convert prose to 4 explicit Task() calls |
| Workflow @-reference | Low — Simple reference to workflows/ | Verify file exists |
| 7 output files | Medium — Need validation step | Add file existence checks |

### Risk Analysis

**HIGH RISK:**
1. **plan-phase verification loop** — If broken, planning quality degrades (no checker feedback)
   - **Mitigation:** Preserve iteration counter exactly, test max iteration behavior
   
2. **Flag parsing incompleteness** — Missing flags break workflows (--gaps for gap closure)
   - **Mitigation:** Extract all flags with grep, verify each in test plan
   
3. **@-reference loss** — Breaks context injection for subagents
   - **Mitigation:** Reference count before/after: `grep -c "@" old.md vs new.md`

**MEDIUM RISK:**
4. **Checkpoint structure flattening** — Continuation agents lose context
   - **Mitigation:** Preserve type + options + response structure exactly
   
5. **Phase normalization edge cases** — Decimal phases (3.5) fail to match directories
   - **Mitigation:** Test integer, decimal, already-padded cases
   
6. **map-codebase prose not converted** — Agents don't actually spawn
   - **Mitigation:** Count Task() calls in migrated spec (should be 4)

**LOW RISK:**
7. **Platform compatibility** — Task tool is Claude-specific
   - **Mitigation:** Use conditional tool declarations (already in Phase 3 pattern)

### Recommended Migration Order

**Order: research-phase → map-codebase → debug → plan-phase**

**Rationale:**
1. **research-phase first** — plan-phase depends on it (spawns gsd-phase-researcher). Simple checkpoint pattern validates continuation logic.

2. **map-codebase second** — Independent, simplest prose conversion. Tests parallel spawn pattern without complexity.

3. **debug third** — Session persistence pattern more complex than research checkpoints. No dependencies on other Phase 4 commands.

4. **plan-phase LAST** — Most complex (475 lines, 4 flags, revision loop). Referenced by 13 commands. Breaking it breaks entire planning workflow.

**Testing after each:**
- research-phase: Test checkpoint continuation, verify RESEARCH.md created
- map-codebase: Verify 4 agents spawn, 7 files created
- debug: Test session persistence across context reset
- plan-phase: Test all 4 flags, revision loop, verify no downstream breakage

## Success Criteria Verification Approach

### Pre-Migration Validation

**1. Agent spec inventory:**
```bash
# Verify all required agents exist
for agent in gsd-phase-researcher gsd-planner gsd-plan-checker gsd-debugger gsd-codebase-mapper; do
  [ -f "specs/agents/${agent}.md" ] && echo "✓ ${agent}" || echo "✗ MISSING: ${agent}"
done
```

**2. @-reference audit:**
```bash
# Extract all @-references from legacy commands
for cmd in plan-phase research-phase debug map-codebase; do
  echo "## ${cmd}"
  grep "@" "commands/gsd/${cmd}.md" | sed 's/.*@/@/' | sort -u
done
```

**3. Flag extraction:**
```bash
# Extract all flags from argument-hint
for cmd in plan-phase research-phase debug map-codebase; do
  echo "## ${cmd}"
  grep "argument-hint" "commands/gsd/${cmd}.md" | grep -Eo "\-\-[a-z-]+" | sort -u
done
```

### Post-Migration Verification

**1. Subagent spawning (1-2 agents):**
```bash
# Verify Task() calls in migrated spec
for cmd in plan-phase research-phase debug map-codebase; do
  count=$(grep -c "Task(" "specs/skills/gsd-${cmd}/SKILL.md" || echo 0)
  echo "${cmd}: ${count} spawns"
done

# Expected:
# plan-phase: 4 (researcher, planner, checker, planner-revision)
# research-phase: 2 (researcher, researcher-continuation)
# debug: 2 (debugger, debugger-continuation)
# map-codebase: 4 (mapper x4 with different focuses)
```

**2. Argument handling:**
```bash
# Test each flag for plan-phase
/gsd:plan-phase 1                 # Default flow
/gsd:plan-phase 1 --research      # Force re-research
/gsd:plan-phase 1 --skip-research # Skip research
/gsd:plan-phase 1 --gaps          # Gap closure mode
/gsd:plan-phase 1 --skip-verify   # Skip checker loop
```

**3. Process structure preservation:**
```bash
# Verify process steps maintained
for cmd in plan-phase research-phase debug map-codebase; do
  echo "## ${cmd}"
  grep -c "^## [0-9]" "specs/skills/gsd-${cmd}/SKILL.md"
done

# Expected step counts:
# plan-phase: 13 (validate → parse → validate phase → dir → research → check plans → context → spawn planner → handle return → spawn checker → handle checker → revision loop → present)
# research-phase: 6 (normalize → check existing → gather context → spawn researcher → handle return → continuation)
# debug: 5 (check sessions → gather symptoms → spawn debugger → handle return → continuation)
# map-codebase: 7 (check existing → create dir → spawn mappers → wait → verify → commit → next steps)
```

**4. Bash validation blocks:**
```bash
# Verify bash blocks exist for validation steps
for cmd in plan-phase research-phase debug map-codebase; do
  echo "## ${cmd}"
  grep -c '```bash' "specs/skills/gsd-${cmd}/SKILL.md"
done

# Expected bash block counts:
# plan-phase: ~10 (validate env, parse args, normalize phase, validate phase, dir check, research check, plan check, frontmatter parsing, etc.)
# research-phase: ~5 (normalize phase, validate, check existing, gather context, verify output)
# debug: ~2 (check sessions, verify debug file created)
# map-codebase: ~3 (check existing, create dir, verify 7 files created)
```

**5. Integration testing:**
```bash
# Test full workflows
/gsd:research-phase 1             # Standalone research
/gsd:plan-phase 1                 # Research → plan → verify
/gsd:plan-phase 1 --skip-research # Plan only (use existing research)
/gsd:debug "server won't start"   # Debug new issue
/gsd:debug                        # Resume existing session
/gsd:map-codebase                 # Map entire codebase
/gsd:map-codebase api             # Map specific area
```

**6. Downstream validation:**
```bash
# Test commands that reference plan-phase
/gsd:new-project        # Offers plan-phase at completion
/gsd:execute-phase 1    # Suggests plan-phase if no plans
/gsd:plan-milestone-gaps # Uses plan-phase --gaps
```

### Verification Checklist

**Per command:**
- [ ] All @-references preserved (count matches legacy)
- [ ] All flags parsed and handled
- [ ] Subagent spawn count matches expectation (1-2 agents, 2-4 spawns)
- [ ] Process steps numbered and sequential
- [ ] Bash validation blocks present for pre-flight checks
- [ ] Conditional logic preserved (if/else branches)
- [ ] Iteration counters preserved (max 3 for revision loops)
- [ ] Checkpoint handling structure intact (type + options + response)
- [ ] File creation verified (RESEARCH.md, PLAN.md, debug/*.md, codebase/*.md)
- [ ] Structured returns parsed correctly (## RESULT headers)

**Integration:**
- [ ] Downstream commands still work (13 references for plan-phase)
- [ ] Agent specs unchanged (no accidental edits)
- [ ] Template references valid (files exist)
- [ ] Workflow files referenced correctly

## State of the Art

| Pattern | Legacy Approach | Current Approach | When Changed | Impact |
|---------|-----------------|------------------|--------------|--------|
| Orchestrator spawning | Sequential spawn + checkpoint | Still sequential (correct for mid-tier) | N/A | Phase 3 uses parallel, Phase 4 uses sequential—both valid for different complexity tiers |
| Revision loops | Max 3 iterations hardcoded | Still hardcoded (correct) | N/A | Prevents runaway costs, user intervention after max |
| Session persistence | File-based (debug/*.md) | Still file-based | N/A | Enables continuation across context resets |
| Phase normalization | Bash printf + regex | Still Bash (correct) | N/A | Handles integers, decimals, padding edge cases |

**Deprecated/outdated:**
- None — Mid-tier patterns are stable and appropriate for complexity level

**Recent changes:**
- None observed — Legacy commands use current best practices

## Open Questions

1. **map-codebase prose conversion specifics**
   - What we know: Process says "spawn 4 agents" but shows no Task() calls
   - What's unclear: What exact prompts differentiate the 4 agents? (tech vs arch vs quality vs concerns)
   - Recommendation: Check @-referenced workflow file `~/.claude/get-shit-done/workflows/map-codebase.md` for agent prompts

2. **plan-phase --gaps mode usage**
   - What we know: Flag exists, reads VERIFICATION.md and UAT.md instead of RESEARCH.md
   - What's unclear: How frequently used? Critical path or edge case?
   - Recommendation: Grep for "plan-phase --gaps" in docs, test plan-milestone-gaps command that uses it

3. **Checkpoint types inventory**
   - What we know: Checkpoints have "type" field for routing continuation
   - What's unclear: Complete enumeration of checkpoint types (investigation-mode, approval, blocker, etc.)
   - Recommendation: Grep checkpoint_type in agent specs, document all types

4. **Platform-specific spawning**
   - What we know: Task tool is Claude-specific, conditional declarations exist
   - What's unclear: Do Copilot/Codex equivalents support sequential spawn + checkpoint pattern?
   - Recommendation: Check platform conditional blocks in Phase 3 migrated skills

## Sources

### Primary (HIGH confidence)
- commands/gsd/plan-phase.md — 475 lines, complete specification
- commands/gsd/research-phase.md — 180 lines, complete specification
- commands/gsd/debug.md — 149 lines, complete specification
- commands/gsd/map-codebase.md — 71 lines, complete specification
- specs/agents/gsd-phase-researcher.md — 637 lines, agent implementation
- specs/agents/gsd-planner.md — 793 lines, agent implementation
- specs/agents/gsd-plan-checker.md — 750 lines, agent implementation
- specs/agents/gsd-debugger.md — 518 lines, agent implementation
- specs/agents/gsd-codebase-mapper.md — 984 lines, agent implementation
- .planning/phases/03-high-complexity-orchestrators/03-RESEARCH.md — Phase 3 patterns (parallel spawning, @-references, anti-patterns)

### Secondary (MEDIUM confidence)
- specs/skills/gsd-new-project/SKILL.md — 24,959 bytes, migration example (Phase 3 orchestrator)
- specs/skills/gsd-execute-phase/SKILL.md — 11,345 bytes, migration example (Phase 3 orchestrator)
- README.md, specs/skills/_shared.yml — Template system structure

### Tertiary (LOW confidence)
- None — All claims verified with primary sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — All tools verified as Claude Code native
- Architecture patterns: HIGH — 5 patterns extracted from legacy commands with line numbers
- Complexity assessment: HIGH — Line counts, spawn counts, flag counts directly measured
- Dependency mapping: HIGH — grep-verified incoming references, file dependencies documented
- Migration order: HIGH — Based on measured dependencies and complexity tiers
- Pitfalls: HIGH — Derived from Phase 3 research + command-specific analysis

**Research date:** 2025-01-22
**Valid until:** 2025-02-22 (30 days, stable domain)

**Commands analyzed:** 4 (100% of Phase 4 scope)
**Agent specs verified:** 5 (100% of required agents exist)
**Dependency references:** 13 commands reference plan-phase, 2 reference map-codebase, 2 reference debug, 1 references research-phase
**Lines of code:** 875 total (plan-phase: 475, research-phase: 180, debug: 149, map-codebase: 71)
