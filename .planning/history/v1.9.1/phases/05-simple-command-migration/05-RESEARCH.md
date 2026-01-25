# Phase 5: Simple Command Migration - Research

**Researched:** 2025-01-22
**Domain:** Simple command migration patterns, workflow commands, utility commands, milestone management
**Confidence:** HIGH

## Summary

Phase 5 migrates the remaining 21 commands from the legacy system to the new skill-based architecture. These commands represent the "simple" tier: single-stage execution with 0-1 spawns, reference-only commands, or workflow commands that delegate to external files. Unlike Phase 3 (5-7 parallel spawns) and Phase 4 (1-4 spawns with iteration loops), these commands have minimal orchestration complexity.

**Key findings:**

1. **Three distinct tiers identified**: Commands fall into three natural groups: (1) Reference-only commands that display information without execution, (2) Simple orchestrators that reference workflow files or spawn 0-1 agents, (3) Complex single-stage commands with intricate logic but no spawning.

2. **All required agents already exist**: audit-milestone needs gsd-integration-checker (✓ exists), verify-work needs gsd-planner + gsd-debugger (✓ exist), plan-milestone-gaps needs gsd-planner (✓ exists). No new agents need to be created.

3. **Progress command is the routing hub**: The 356-line progress command routes to 11 different commands based on project state. It must be migrated late in the batch since it references nearly all other commands.

4. **Milestone lifecycle commands form a cluster**: complete-milestone → audit-milestone → plan-milestone-gaps → archive-milestone form a dependency chain. These must be migrated as a group.

**Primary recommendation:** Migrate in 4 batches: (1) Tier 1 reference-only (3 commands), (2) Tier 2 simple orchestrators (3 commands), (3) Tier 3 complex single-stage excluding progress (14 commands), (4) progress last as integration point (1 command). Total: 21 commands.

## Standard Stack

The established libraries/tools for simple command migration:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gray-matter | 4.0.3 | Parse frontmatter from skill specs | Already integrated in Phase 1-4 |
| Task tool | Claude native | Spawn subagents (when needed) | Built-in Claude Code capability |
| AskUserQuestion | Claude native | User decision points | Checkpoints, confirmations |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| Read | Load @-referenced files | Context injection |
| Write | Create/update files | Planning artifacts, handoff files |
| Bash | File operations, git | Pre-flight validation, commits |
| Glob/Grep | Discovery | Find phases, plans, summaries |
| SlashCommand | Route to other commands | progress command routing |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @-references | Inline instructions | @-refs enable reuse, updates propagate |
| SlashCommand | Hardcoded logic | SlashCommand enables clean routing |
| Workflow file references | Inline process steps | Workflow files enable shared logic |

**Installation:**
```bash
# No new dependencies needed
# All tools are Claude Code native capabilities
```

## Architecture Patterns

### Recommended Migration Structure
```
specs/skills/
├── gsd-list-phase-assumptions/
│   └── SKILL.md               # 50 lines → Tier 1 (reference-only)
├── gsd-whats-new/
│   └── SKILL.md               # 124 lines → Tier 1 (reference-only)
├── gsd-verify-installation/
│   └── SKILL.md               # 97 lines → Tier 1 (reference-only)
├── gsd-discuss-phase/
│   └── SKILL.md               # 80 lines → Tier 2 (workflow ref)
├── gsd-resume-work/
│   └── SKILL.md               # 40 lines → Tier 2 (workflow ref)
├── gsd-add-phase/
│   └── SKILL.md               # 207 lines → Tier 3 (roadmap manipulation)
├── gsd-insert-phase/
│   └── SKILL.md               # 227 lines → Tier 3 (decimal numbering)
├── gsd-remove-phase/
│   └── SKILL.md               # 338 lines → Tier 3 (renumbering)
├── gsd-add-todo/
│   └── SKILL.md               # 182 lines → Tier 3 (capture task)
├── gsd-check-todos/
│   └── SKILL.md               # 217 lines → Tier 3 (interactive selection)
├── gsd-pause-work/
│   └── SKILL.md               # 123 lines → Tier 3 (handoff file)
├── gsd-list-milestones/
│   └── SKILL.md               # 142 lines → Tier 3 (display table)
├── gsd-archive-milestone/
│   └── SKILL.md               # 139 lines → Tier 3 (archive to history)
├── gsd-restore-milestone/
│   └── SKILL.md               # 151 lines → Tier 3 (restore from history)
├── gsd-complete-milestone/
│   └── SKILL.md               # 136 lines → Tier 3 (completion workflow)
├── gsd-audit-milestone/
│   └── SKILL.md               # 258 lines → Tier 3 (spawns gsd-integration-checker)
├── gsd-plan-milestone-gaps/
│   └── SKILL.md               # 284 lines → Tier 3 (gap analysis + roadmap)
├── gsd-verify-work/
│   └── SKILL.md               # 219 lines → Tier 3 (UAT orchestration)
├── gsd-update/
│   └── SKILL.md               # 172 lines → Tier 3 (update GSD)
└── gsd-progress/
    └── SKILL.md               # 356 lines → Tier 3 (routing hub - LAST)
```

**Note:** invoke-agent (66 lines) is excluded from this migration phase as it's a meta-command for direct agent invocation that may become obsolete with the new architecture.

### Pattern 1: Reference-Only Commands
**What:** Commands that display information without modifying state
**When to use:** list-phase-assumptions, whats-new, verify-installation
**Example:**
```xml
<!-- Source: commands/gsd/list-phase-assumptions.md -->
<objective>
Analyze a phase and present Claude's assumptions about technical approach, 
implementation order, scope boundaries, risk areas, and dependencies.

Purpose: Help users see what Claude thinks BEFORE planning begins.
Output: Conversational output only (no file creation).
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/list-phase-assumptions.md
</execution_context>

<process>
1. Validate phase number argument
2. Check if phase exists in roadmap
3. Follow list-phase-assumptions.md workflow
4. Present assumptions clearly
5. Prompt "What do you think?"
</process>
```

**Key characteristics:**
- No file writes
- No spawns
- References workflow file for actual logic
- Conversational output
- May use Read/Bash for loading context

### Pattern 2: Workflow File Delegation
**What:** Commands that reference external workflow files for detailed process
**When to use:** discuss-phase, resume-work (commands with complex multi-step flows)
**Example:**
```xml
<!-- Source: commands/gsd/discuss-phase.md -->
<objective>
Extract implementation decisions that downstream agents need — researcher 
and planner will use CONTEXT.md to know what to investigate and what 
choices are locked.
</objective>

<execution_context>
@~/.claude/get-shit-done/workflows/discuss-phase.md
@~/.claude/get-shit-done/templates/context.md
</execution_context>

<process>
1. Validate phase number (error if missing or not in roadmap)
2. Check if CONTEXT.md exists (offer update/view/skip if yes)
3. Analyze phase — Identify domain and generate phase-specific gray areas
4. Present gray areas — Multi-select: which to discuss? (NO skip option)
5. Deep-dive each area — 4 questions per area, then offer more/next
6. Write CONTEXT.md — Sections match areas discussed
7. Offer next steps (research or plan)
</process>
```

**Key characteristics:**
- `@~/.claude/get-shit-done/workflows/[name].md` contains detailed steps
- Command file contains high-level flow
- Workflow file contains decision trees, loops, edge cases
- Enables reuse across commands (resume-work workflow used by progress too)

### Pattern 3: Roadmap Manipulation Commands
**What:** Commands that add, remove, or modify phases in ROADMAP.md
**When to use:** add-phase, insert-phase, remove-phase
**Example:**
```xml
<!-- Source: commands/gsd/add-phase.md -->
<objective>
Add a new integer phase to the end of the current milestone in the roadmap.

Purpose: Add planned work discovered during execution that belongs at 
the end of current milestone.
</objective>

<process>
<step name="parse_arguments">
Parse command arguments - all arguments become phase description.
</step>

<step name="load_roadmap">
Load ROADMAP.md, validate it exists.
</step>

<step name="find_last_phase">
Parse roadmap, identify current milestone section, find highest phase number.
</step>

<step name="append_phase">
Calculate next_phase = last_phase + 1.
Append to milestone section in ROADMAP.md.
Update STATE.md if needed.
Commit changes.
</step>
</process>
```

**Key characteristics:**
- Complex parsing logic (find milestone sections, phase numbers)
- In-place file editing (not create/delete)
- Must handle both integer and decimal phases (72, 72.1, 72.2)
- Git commit after changes
- No spawning needed

**Variant: insert-phase (decimal numbering):**
```bash
# After phase 72, insert as 72.1, 72.2, etc.
# Parse: "/gsd:insert-phase 72 Fix critical bug"
# Result: Phase 72.1 inserted after 72, before 73
```

**Variant: remove-phase (renumbering):**
```bash
# Remove phase 17, renumber 18→17, 19→18, etc.
# Must handle decimal phases too: 17.1, 17.2 also removed
# Git commit serves as historical record
```

### Pattern 4: Milestone Lifecycle Management
**What:** Commands that complete, audit, archive, restore milestones
**When to use:** complete-milestone, audit-milestone, plan-milestone-gaps, archive-milestone, restore-milestone
**Example:**
```xml
<!-- Source: commands/gsd/complete-milestone.md -->
<objective>
Mark milestone {{version}} complete, archive to milestones/, and update 
ROADMAP.md and REQUIREMENTS.md.

Purpose: Create historical record of shipped version, archive milestone 
artifacts, and prepare for next milestone.
</objective>

<process>
0. Check for audit:
   - Look for .planning/v{{version}}-MILESTONE-AUDIT.md
   - If missing: recommend /gsd:audit-milestone first
   - If status is gaps_found: recommend /gsd:plan-milestone-gaps
   - If status is passed: proceed

1. Archive ROADMAP.md + REQUIREMENTS.md to milestones/v{{version}}/
2. Update PROJECT.md (evolve "What This Is" to reflect completion)
3. Update MILESTONES.md registry
4. Git tag v{{version}}
5. Delete ROADMAP.md + REQUIREMENTS.md (milestone cycle ends)
</process>
```

**Dependency chain:**
```
complete-milestone
    ↓ (checks for)
audit-milestone (spawns gsd-integration-checker)
    ↓ (if gaps found)
plan-milestone-gaps (spawns gsd-planner)
    ↓ (after gaps fixed)
complete-milestone
    ↓ (archives to)
archive-milestone
    ↓ (can be undone with)
restore-milestone
```

**Key characteristics:**
- Each command checks prerequisites
- audit-milestone spawns gsd-integration-checker (already exists)
- plan-milestone-gaps spawns gsd-planner (already exists)
- Files move to `.planning/history/[milestone-name]/`
- MILESTONES.md tracks all archived milestones
- Git tags mark milestone versions

### Pattern 5: Progress Command Routing Hub
**What:** Single command that routes to 11 different commands based on project state
**When to use:** progress command (migrate LAST after all referenced commands exist)
**Example:**
```xml
<!-- Source: commands/gsd/progress.md -->
<objective>
Check project progress, summarize recent work and what's ahead, then 
intelligently route to the next action - either executing an existing 
plan or creating the next one.
</objective>

<process>
<step name="verify">
Verify planning structure exists (.planning/, STATE.md, ROADMAP.md).
</step>

<step name="load">
Load full project context (STATE.md, ROADMAP.md, PROJECT.md).
</step>

<step name="recent">
Gather recent work context (2-3 most recent SUMMARY.md files).
</step>

<step name="position">
Parse current position: phase, plan, status, pending todos, debug sessions.
</step>

<step name="report">
Present rich status report with progress bar, recent work, blockers.
</step>

<step name="route">
Route based on verified counts:

| Condition | Meaning | Route To |
|-----------|---------|----------|
| uat_with_gaps > 0 | UAT gaps need fixing | /gsd:plan-phase --gaps |
| summaries < plans | Unexecuted plans | /gsd:execute-phase |
| summaries = plans AND plans > 0 | Phase complete | Check milestone |
| plans = 0 AND CONTEXT exists | Ready to plan | /gsd:plan-phase |
| plans = 0 AND no CONTEXT | Need discussion | /gsd:discuss-phase |
| current < highest phase | More phases | Next phase |
| current = highest | Milestone done | /gsd:complete-milestone |
| ROADMAP missing | Between milestones | /gsd:new-milestone |
</step>
</process>
```

**Routes to these commands:**
- `/gsd:new-project` (if no .planning/)
- `/gsd:execute-phase {phase}` (unexecuted plans exist)
- `/gsd:plan-phase {phase}` (phase needs planning)
- `/gsd:plan-phase {phase} --gaps` (UAT gaps found)
- `/gsd:discuss-phase {phase}` (no CONTEXT.md)
- `/gsd:list-phase-assumptions {phase}` (alternative to discuss)
- `/gsd:verify-work {phase}` (user testing)
- `/gsd:complete-milestone` (milestone done)
- `/gsd:new-milestone` (between milestones)
- `/gsd:check-todos` (pending todos exist)
- `/gsd:debug` (active debug sessions)

**Key characteristics:**
- Complex conditional routing (9 different routes)
- Uses SlashCommand tool for routing
- Must count files accurately (plans, summaries, UAT files)
- Reads git log for recent work
- Must be migrated LAST (depends on all routed commands)

### Pattern 6: Interactive Selection Commands
**What:** Commands that present lists and wait for user selection
**When to use:** check-todos, list-milestones
**Example:**
```xml
<!-- Source: commands/gsd/check-todos.md -->
<objective>
List all pending todos, allow selection, load full context for the 
selected todo, and route to appropriate action.
</objective>

<process>
1. List all .planning/todos/pending/*.md files
2. Parse each: number, title, area, created date
3. Display in readable table format
4. Use AskUserQuestion with todo options
5. Read selected todo file (full context)
6. Present: area, description, phase context, options
7. Route based on selection:
   - "Work on this now" → appropriate command
   - "Mark done" → move to .planning/todos/done/
   - "Delete" → remove file
   - "Back to list" → restart loop
</process>
```

**Key characteristics:**
- Glob to find files
- Parse structured markdown (frontmatter)
- AskUserQuestion for selection
- May loop back to list
- Routes to other commands based on context

### Anti-Patterns to Avoid

- **Don't merge similar commands**: add-phase, insert-phase, remove-phase are separate commands by design. Each has distinct logic and user mental model.
- **Don't inline workflow files**: discuss-phase references `workflows/discuss-phase.md` which is shared with resume-work. Keep workflow files separate.
- **Don't reorder milestone lifecycle**: complete-milestone must check for audit, audit must be completable before archiving. Preserve dependency chain.
- **Don't migrate progress early**: It routes to 11 commands - all must exist first or SlashCommand calls will fail.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Phase number parsing | Custom regex | Existing roadmap parser pattern | Handles both integer and decimal phases (72, 72.1) |
| Git operations | Custom exec wrappers | Bash tool with git commands | Already proven in Phase 3-4 migrations |
| User confirmation | Custom prompt logic | AskUserQuestion tool | Native, handles options/validation |
| File counting | Complex loops | Bash: `ls | wc -l` | Simple, reliable, already used in legacy |
| Milestone version comparison | Custom semver logic | String comparison is sufficient | Versions are user-provided strings, not strict semver |

**Key insight:** These commands are "simple" because they don't do novel things - they manipulate known files (ROADMAP.md, STATE.md) with known structures. Don't reinvent patterns that Phase 3-4 already established.

## Common Pitfalls

### Pitfall 1: Migrating Progress Too Early
**What goes wrong:** progress routes to 11 commands via SlashCommand. If migrated before those commands exist, routing fails.
**Why it happens:** It looks like a "simple" command (no spawns), so seems easy to migrate early.
**How to avoid:** Migrate progress LAST in Phase 5. Create a checklist of all routed commands and verify each exists before migrating progress.
**Warning signs:** SlashCommand tool calls failing with "command not found" errors.

### Pitfall 2: Breaking Milestone Lifecycle Dependencies
**What goes wrong:** complete-milestone checks for audit, audit may trigger gap planning, gaps must be fixed before archiving.
**Why it happens:** Commands seem independent but have implicit dependencies through file checks.
**How to avoid:** Migrate milestone commands as a group in this order:
1. list-milestones (display only, no deps)
2. audit-milestone (spawns checker)
3. plan-milestone-gaps (creates fix phases)
4. complete-milestone (checks audit, archives)
5. archive-milestone (moves to history)
6. restore-milestone (undoes archive)
**Warning signs:** Commands run but create inconsistent state (archived milestone with unresolved gaps).

### Pitfall 3: Losing Decimal Phase Support
**What goes wrong:** Roadmap manipulation commands break when encountering decimal phases (72.1, 72.2).
**Why it happens:** Simple phase parsing assumes integers only.
**How to avoid:** Test with decimal phases. remove-phase must remove 72.1 and 72.2 when removing 72. insert-phase must calculate next decimal (72.2 after 72.1).
**Warning signs:** Commands work on integer phases but fail or corrupt roadmap when decimal phases exist.

### Pitfall 4: Workflow File References Breaking
**What goes wrong:** Commands reference `@~/.claude/get-shit-done/workflows/[name].md` but files are missing or moved.
**Why it happens:** Workflow files weren't migrated or were moved to different location.
**How to avoid:** Before migrating commands that reference workflow files:
1. List all @-references in command
2. Verify workflow files exist at referenced paths
3. If workflow files need migration, do that first
4. Update @-references if paths changed
**Warning signs:** Commands run but fail with "file not found" for @-referenced workflow files.

### Pitfall 5: Todo/Milestone File Parsing Inconsistencies
**What goes wrong:** check-todos or list-milestones parses files incorrectly, displays corrupted data.
**Why it happens:** Todo/milestone file format is assumed but not validated.
**How to avoid:** 
1. Examine existing .planning/todos/pending/*.md files to understand format
2. Examine .planning/MILESTONES.md structure
3. Use gray-matter for YAML frontmatter parsing (already integrated)
4. Handle missing fields gracefully (default values)
**Warning signs:** Commands display garbled output, can't find todos despite files existing.

## Code Examples

Verified patterns from legacy commands:

### Roadmap Phase Parsing
```bash
# Source: commands/gsd/add-phase.md lines 51-78
# Parse current milestone section and find highest phase number

# Find milestone marker
MILESTONE_START=$(grep -n "^## Milestone:" "$ROADMAP" | tail -1 | cut -d: -f1)

# Extract phases after milestone marker
PHASES=$(sed -n "${MILESTONE_START},\$p" "$ROADMAP" | grep "^- Phase [0-9]")

# Find highest phase number (handles both integer and decimal)
HIGHEST_PHASE=$(echo "$PHASES" | sed 's/^- Phase \([0-9.]*\):.*/\1/' | sort -n | tail -1)

# Calculate next phase
NEXT_PHASE=$((HIGHEST_PHASE + 1))

# Append to roadmap
echo "- Phase ${NEXT_PHASE}: ${DESCRIPTION}" >> "$ROADMAP"
```

### File Counting for Routing
```bash
# Source: commands/gsd/progress.md lines 114-118
# Count plans, summaries, UAT files in current phase

PHASE_DIR=".planning/phases/$(printf "%02d" $PHASE)-*"

PLAN_COUNT=$(ls -1 ${PHASE_DIR}/*-PLAN.md 2>/dev/null | wc -l)
SUMMARY_COUNT=$(ls -1 ${PHASE_DIR}/*-SUMMARY.md 2>/dev/null | wc -l)
UAT_COUNT=$(grep -l "status: diagnosed" ${PHASE_DIR}/*-UAT.md 2>/dev/null | wc -l)
```

### User Selection with AskUserQuestion
```javascript
// Source: commands/gsd/check-todos.md (pseudo-code from process section)
// Present todos and wait for selection

const todos = glob('.planning/todos/pending/*.md');
const options = todos.map(file => {
  const content = fs.readFileSync(file);
  const parsed = matter(content); // gray-matter parsing
  return {
    label: `[${parsed.data.area}] ${parsed.data.title}`,
    value: file
  };
});

const selected = await AskUserQuestion({
  question: "Which todo do you want to work on?",
  options: [
    ...options,
    { label: "Cancel", value: "cancel" }
  ]
});

if (selected !== 'cancel') {
  // Load full context and route
  const fullContext = fs.readFileSync(selected, 'utf8');
  // ... present options and route
}
```

### Milestone Registry Update
```bash
# Source: commands/gsd/archive-milestone.md (process section)
# Update MILESTONES.md registry after archiving

# Add entry to registry
cat >> .planning/MILESTONES.md << EOF

## v${VERSION}
- **Archived:** $(date +%Y-%m-%d)
- **Requirements:** $(ls milestones/v${VERSION}/*.md | wc -l) requirements
- **Status:** Archived
- **Location:** .planning/history/v${VERSION}/
EOF

# Commit changes
git add .planning/MILESTONES.md
git commit -m "milestone: archive v${VERSION}"
git tag "v${VERSION}"
```

### Spawning Integration Checker
```xml
<!-- Source: commands/gsd/audit-milestone.md lines 82-96 -->
<step name="spawn_integration_checker">
Spawn gsd-integration-checker with full context:

Task(prompt="
<objective>
Check cross-phase integration and end-to-end flows.
</objective>

<verification_files>
Read all VERIFICATION.md files from completed phases.
</verification_files>

<requirements>
@.planning/REQUIREMENTS.md
</requirements>

<output>
Write: .planning/v{version}-MILESTONE-AUDIT.md
</output>
", subagent_type="gsd-integration-checker")
</step>
```

## Batching Strategy

### Batch 1: Reference-Only Commands (Day 1, ~4 hours)
**Migrate together:** These have zero dependencies and no side effects.

| Command | Lines | Complexity | Notes |
|---------|-------|------------|-------|
| list-phase-assumptions | 50 | LOW | References workflow file |
| whats-new | 124 | LOW | Fetches changelog, displays diff |
| verify-installation | 97 | LOW | Runs diagnostics |

**Why together:** No spawns, no file writes, can be migrated in parallel. Test by running each command and verifying output.

**Estimated time:** 1-1.5 hours each (spec creation + testing).

### Batch 2: Simple Orchestrators (Day 2, ~6 hours)
**Migrate together:** Workflow file references, minimal spawning.

| Command | Lines | Complexity | Notes |
|---------|-------|------------|-------|
| resume-work | 40 | LOW | References resume-project workflow |
| discuss-phase | 80 | MEDIUM | References discuss-phase workflow, user interaction |

**Why together:** Both reference workflow files that exist. discuss-phase is more complex (adaptive questioning) but no spawns.

**Sequential order:** resume-work first (simpler), then discuss-phase (more complex).

**Estimated time:** 2-3 hours each.

**Note:** invoke-agent (66 lines) is deferred - it's a meta-command that may become obsolete with new architecture.

### Batch 3: Roadmap Manipulation (Day 3, ~8 hours)
**Migrate together:** All manipulate ROADMAP.md structure.

| Command | Lines | Complexity | Notes |
|---------|-------|------------|-------|
| add-phase | 207 | MEDIUM | Append to roadmap |
| insert-phase | 227 | HIGH | Decimal numbering logic |
| remove-phase | 338 | HIGH | Renumbering + phase directory deletion |

**Why together:** Share roadmap parsing logic, test as a set (add → insert → remove → verify).

**Sequential order:** add-phase first (simplest), then insert-phase (decimal logic), then remove-phase (most complex).

**Estimated time:** 2.5-3 hours each.

### Batch 4: Todo Management (Day 4, ~5 hours)
**Migrate together:** Both manipulate todo files.

| Command | Lines | Complexity | Notes |
|---------|-------|------------|-------|
| add-todo | 182 | LOW | Create todo file |
| check-todos | 217 | MEDIUM | Interactive selection + routing |

**Why together:** add-todo creates files that check-todos reads. Test as a pair.

**Sequential order:** add-todo first (creates), then check-todos (reads).

**Estimated time:** 2 hours (add-todo), 3 hours (check-todos).

### Batch 5: Work Session Management (Day 5, ~3 hours)
**Migrate together:** Handoff file creation/reading.

| Command | Lines | Complexity | Notes |
|---------|-------|------------|-------|
| pause-work | 123 | LOW | Create .continue-here.md |

**Why standalone:** resume-work already migrated in Batch 2. pause-work creates files that resume-work reads.

**Estimated time:** 2-3 hours.

### Batch 6: Milestone Lifecycle (Days 6-8, ~20 hours)
**Migrate together:** Milestone completion, audit, gap planning, archiving.

| Command | Lines | Complexity | Notes |
|---------|-------|------------|-------|
| list-milestones | 142 | LOW | Display MILESTONES.md registry |
| audit-milestone | 258 | HIGH | Spawns gsd-integration-checker |
| plan-milestone-gaps | 284 | HIGH | Gap analysis + roadmap updates |
| complete-milestone | 136 | MEDIUM | Checks audit, archives |
| archive-milestone | 139 | MEDIUM | Moves to history |
| restore-milestone | 151 | MEDIUM | Restores from history |

**Why together:** These form a lifecycle chain. Test the full flow: audit → gaps → complete → archive → restore.

**Sequential order:** 
1. list-milestones (display only, no deps)
2. audit-milestone (spawns checker, creates audit file)
3. plan-milestone-gaps (reads audit, creates fix phases)
4. complete-milestone (checks audit, triggers archive)
5. archive-milestone (moves files to history)
6. restore-milestone (undoes archive)

**Estimated time:** 
- list-milestones: 2 hours
- audit-milestone: 4 hours (spawn integration)
- plan-milestone-gaps: 4 hours (gap parsing)
- complete-milestone: 3 hours (lifecycle coordination)
- archive-milestone: 3 hours (file moves)
- restore-milestone: 3 hours (reverse archive)
Total: ~20 hours (2-3 days)

### Batch 7: Verification & Update (Day 9, ~6 hours)
**Migrate together:** UAT testing and GSD updates.

| Command | Lines | Complexity | Notes |
|---------|-------|------------|-------|
| verify-work | 219 | HIGH | UAT orchestration, spawns debugger + planner |
| update | 172 | MEDIUM | Update GSD, display changelog |

**Why together:** Both are standalone workflows with no inter-dependencies.

**Sequential order:** update first (simpler), then verify-work (spawns multiple agents).

**Estimated time:** 3 hours (update), 4 hours (verify-work).

### Batch 8: Progress Hub (Day 10, ~6 hours)
**Migrate alone:** Routes to 11 commands, must be migrated LAST.

| Command | Lines | Complexity | Notes |
|---------|-------|------------|-------|
| progress | 356 | VERY HIGH | Routes to 11 commands, complex conditional logic |

**Why alone:** Progress depends on ALL other commands existing. If migrated early, routing fails. Must be final migration.

**Pre-migration checklist:**
- [ ] All routed commands exist in specs/skills/
- [ ] Test each route path manually
- [ ] Verify file counting logic (plans, summaries, UAT)
- [ ] Test all 9 routing conditions

**Estimated time:** 6 hours (complex routing + testing all paths).

## Dependency Mapping

### Commands by Reference Count
```
Progress routes to 11 commands:
  → new-project (already migrated Phase 3)
  → execute-phase (already migrated Phase 3)
  → plan-phase (already migrated Phase 4)
  → research-phase (already migrated Phase 4)
  → discuss-phase (Batch 2)
  → list-phase-assumptions (Batch 1)
  → verify-work (Batch 7)
  → complete-milestone (Batch 6)
  → new-milestone (already migrated Phase 3)
  → check-todos (Batch 4)
  → debug (already migrated Phase 4)

Complete-milestone checks for:
  → audit-milestone (Batch 6)
  → plan-milestone-gaps (Batch 6)

Audit-milestone spawns:
  → gsd-integration-checker (✓ already exists)

Verify-work spawns:
  → gsd-debugger (✓ already exists - Phase 4)
  → gsd-planner (✓ already exists - Phase 4)

Plan-milestone-gaps spawns:
  → gsd-planner (✓ already exists - Phase 4)

Resume-work references:
  → resume-project workflow file (verify exists before migration)

Discuss-phase references:
  → discuss-phase workflow file (verify exists before migration)
  → context.md template (verify exists before migration)
```

### No Circular Dependencies
All dependencies are acyclic. Progress is the only command that references many others, and it's migrated last.

## Risk Assessment

### Command-Specific Risks

| Command | Risk Level | Risk Factor | Mitigation |
|---------|------------|-------------|------------|
| progress | VERY HIGH | Routes to 11 commands, complex logic | Migrate LAST, test all route paths |
| remove-phase | HIGH | Renumbers all subsequent phases, deletes files | Test with backups, verify renumbering logic |
| insert-phase | HIGH | Decimal numbering, must calculate next decimal | Test edge cases (72.1, 72.2, 72.9, 72.10) |
| audit-milestone | MEDIUM | Spawns gsd-integration-checker, critical for milestone completion | Verify agent exists, test spawn context |
| verify-work | MEDIUM | Spawns multiple agents (debugger + planner) | Verify agents exist, test UAT workflow |
| plan-milestone-gaps | MEDIUM | Parses audit file, updates roadmap | Test with various gap formats |
| discuss-phase | LOW | User interaction heavy, but no spawns | Test adaptive questioning flow |
| All others | LOW | Standard migration patterns from Phase 3-4 | Follow established patterns |

### Platform-Specific Concerns

| Concern | Impact | Commands Affected | Mitigation |
|---------|--------|-------------------|------------|
| Git operations | Commits after roadmap changes | add-phase, insert-phase, remove-phase, archive-milestone | Test git commit messages, verify staging |
| File globbing | Finding phases/plans/todos | progress, check-todos, list-milestones | Test with various file counts (0, 1, many) |
| Decimal phase parsing | Must handle 72.1, 72.2, etc. | insert-phase, remove-phase, progress routing | Test edge cases, verify sort order |
| Workflow file @-refs | Must resolve paths correctly | discuss-phase, resume-work, list-phase-assumptions | Verify workflow files exist before migration |
| Bash shell differences | File counting, grep flags | progress, audit-milestone | Use portable bash, test on multiple shells |

### Critical Workflow Flows to Validate

1. **Milestone completion flow:**
   ```
   /gsd:audit-milestone
   → (if gaps found) /gsd:plan-milestone-gaps
   → (fix gaps) /gsd:execute-phase
   → /gsd:audit-milestone (re-audit)
   → (if passed) /gsd:complete-milestone
   → (archives to) /gsd:archive-milestone
   ```
   **Risk:** Breaking this flow means milestones can't be completed. Test end-to-end.

2. **Progress routing to next action:**
   ```
   /gsd:progress
   → counts files, checks state
   → routes to appropriate command
   ```
   **Risk:** Incorrect routing wastes user time. Test all 9 route conditions.

3. **Phase manipulation chain:**
   ```
   /gsd:add-phase → append
   /gsd:insert-phase → insert decimal
   /gsd:remove-phase → delete + renumber
   → verify ROADMAP.md integrity
   ```
   **Risk:** Corrupting roadmap structure breaks entire GSD workflow. Test with backups.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Commands in commands/gsd/*.md | Skills in specs/skills/gsd-*/SKILL.md | Phase 1 (foundation) | New architecture enables better tooling |
| Inline agent spawn code | Task tool invocation | Phase 3 (orchestrators) | Cleaner spawning, consistent pattern |
| Hardcoded workflow steps | @-reference to workflow files | Phase 3-4 | Enables workflow reuse across commands |
| Manual phase numbering | Decimal phase insertion | Phase 5 (this phase) | Handles urgent work without renumbering |

**Deprecated/outdated:**
- **invoke-agent command**: Generic agent invoker, may become obsolete with direct skill invocation in new architecture. Excluded from Phase 5 migration.
- **Inline workflows**: Old commands had inline process steps. New architecture uses @-referenced workflow files for reusability.

## Open Questions

### Question 1: Should invoke-agent be migrated?
**What we know:** 
- invoke-agent is a meta-command for direct agent invocation
- 66 lines, references agent-invoker.js infrastructure
- Not part of core GSD workflow (no other commands depend on it)

**What's unclear:** 
- New architecture may enable direct agent invocation via skills
- Unclear if CLI-specific adapter logic (Claude Code vs Copilot CLI) still needed
- May be replaced by future architecture improvements

**Recommendation:** 
- Exclude from Phase 5 migration
- Defer decision until Phase 6 (polish/optimization)
- If needed, migrate separately with full architecture review

### Question 2: Are all workflow files available?
**What we know:**
- discuss-phase references `~/.claude/get-shit-done/workflows/discuss-phase.md`
- resume-work references `~/.claude/get-shit-done/workflows/resume-project.md`
- list-phase-assumptions references `~/.claude/get-shit-done/workflows/list-phase-assumptions.md`

**What's unclear:**
- Workflow files exist in current GSD installation
- Need to verify all referenced workflow files exist before migration
- May need to migrate workflow files first if they're missing

**Recommendation:**
- Before Batch 2, run: `ls ~/.claude/get-shit-done/workflows/*.md`
- Verify all referenced workflow files exist
- If missing, add workflow file migration as Batch 1.5

### Question 3: How to handle decimal phase limits?
**What we know:**
- insert-phase creates decimal phases (72.1, 72.2, etc.)
- No explicit limit in legacy code
- Could theoretically go to 72.99 or beyond

**What's unclear:**
- What happens at 72.9 → 72.10 (two digits after decimal)
- Should there be a hard limit (e.g., max 9 decimal phases)?
- How does sorting work with double-digit decimals (72.10 vs 72.2)?

**Recommendation:**
- Test edge cases during Batch 3 migration
- Document behavior (likely: bash numeric sort handles 72.10 correctly)
- Consider adding validation: max 9 insertions per integer phase
- If needed, add warning: "Phase 72.9 exists, consider using add-phase for next work"

## Sources

### Primary (HIGH confidence)
- Legacy commands in `commands/gsd/` directory - all 21 remaining commands examined
- Migrated skills in `specs/skills/` - Phase 3-4 patterns verified
- Phase 3 RESEARCH.md - `.planning/phases/03-high-complexity-orchestrators/03-RESEARCH.md` - orchestration patterns
- Phase 4 RESEARCH.md - `.planning/phases/04-mid-complexity-commands/04-RESEARCH.md` - iteration patterns
- Agent registry in `specs/agents/` - verified all required agents exist (gsd-integration-checker, gsd-planner, gsd-debugger)

### Secondary (MEDIUM confidence)
- GSD documentation in `docs/` - workflow patterns, command relationships
- Existing workflow files (verified via file inspection)

### Tertiary (LOW confidence)
- None - all findings based on direct code inspection

## Metadata

**Confidence breakdown:**
- Command classification: HIGH - Examined all 21 commands directly
- Batching strategy: HIGH - Based on verified dependencies and complexity
- Risk assessment: HIGH - Identified actual risks from code inspection
- Time estimates: MEDIUM - Based on Phase 3-4 actual times (1-4 hours per command)

**Research date:** 2025-01-22
**Valid until:** 2025-02-21 (30 days - stable codebase, patterns unlikely to change)

**Assumptions made:**
1. All workflow files exist at referenced paths (needs verification before Batch 2)
2. Time estimates based on Phase 3-4 actuals hold for Phase 5 commands
3. Progress command routing complexity requires full day of testing
4. Decimal phase numbering has no hard limit (needs validation during testing)
5. invoke-agent deferral is acceptable (not critical to core workflow)
