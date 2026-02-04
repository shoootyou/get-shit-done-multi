---
name: gsd-help
description: Show available GSD commands and usage guide
---

<objective>
Display the complete GSD command reference.

Output ONLY the reference content below. Do NOT add:

- Project-specific analysis
- Git status or file context
- Next-step suggestions
- Any commentary beyond the reference
  </objective>

<reference>
# GSD Command Reference

**GSD** (Get Shit Done) creates hierarchical project plans optimized for solo agentic development with Claude Code.

## Quick Start

1. `{{COMMAND_PREFIX}}new-project` - Initialize project (includes research, requirements, roadmap)
2. `{{COMMAND_PREFIX}}plan-phase 1` - Create detailed plan for first phase
3. `{{COMMAND_PREFIX}}execute-phase 1` - Execute the phase

## Staying Updated

GSD evolves fast. Update periodically:

```bash
npx get-shit-done-cc@latest
```

## Core Workflow

```
{{COMMAND_PREFIX}}new-project → {{COMMAND_PREFIX}}plan-phase → {{COMMAND_PREFIX}}execute-phase → repeat
```

### Project Initialization

**`{{COMMAND_PREFIX}}new-project`**
Initialize new project through unified flow.

One command takes you from idea to ready-for-planning:
- Deep questioning to understand what you're building
- Optional domain research (spawns 4 parallel researcher agents)
- Requirements definition with v1/v2/out-of-scope scoping
- Roadmap creation with phase breakdown and success criteria

Creates all `.planning/` artifacts:
- `PROJECT.md` — vision and requirements
- `config.json` — workflow mode (interactive/yolo)
- `research/` — domain research (if selected)
- `REQUIREMENTS.md` — scoped requirements with REQ-IDs
- `ROADMAP.md` — phases mapped to requirements
- `STATE.md` — project memory

Usage: `{{COMMAND_PREFIX}}new-project`

**`{{COMMAND_PREFIX}}map-codebase`**
Map an existing codebase for brownfield projects.

- Analyzes codebase with parallel Explore agents
- Creates `.planning/codebase/` with 7 focused documents
- Covers stack, architecture, structure, conventions, testing, integrations, concerns
- Use before `{{COMMAND_PREFIX}}new-project` on existing codebases

Usage: `{{COMMAND_PREFIX}}map-codebase`

### Phase Planning

**`{{COMMAND_PREFIX}}discuss-phase <number>`**
Help articulate your vision for a phase before planning.

- Captures how you imagine this phase working
- Creates CONTEXT.md with your vision, essentials, and boundaries
- Use when you have ideas about how something should look/feel

Usage: `{{COMMAND_PREFIX}}discuss-phase 2`

**`{{COMMAND_PREFIX}}research-phase <number>`**
Comprehensive ecosystem research for niche/complex domains.

- Discovers standard stack, architecture patterns, pitfalls
- Creates RESEARCH.md with "how experts build this" knowledge
- Use for 3D, games, audio, shaders, ML, and other specialized domains
- Goes beyond "which library" to ecosystem knowledge

Usage: `{{COMMAND_PREFIX}}research-phase 3`

**`{{COMMAND_PREFIX}}list-phase-assumptions <number>`**
See what Claude is planning to do before it starts.

- Shows Claude's intended approach for a phase
- Lets you course-correct if Claude misunderstood your vision
- No files created - conversational output only

Usage: `{{COMMAND_PREFIX}}list-phase-assumptions 3`

**`{{COMMAND_PREFIX}}plan-phase <number>`**
Create detailed execution plan for a specific phase.

- Generates `.planning/phases/XX-phase-name/XX-YY-PLAN.md`
- Breaks phase into concrete, actionable tasks
- Includes verification criteria and success measures
- Multiple plans per phase supported (XX-01, XX-02, etc.)

Usage: `{{COMMAND_PREFIX}}plan-phase 1`
Result: Creates `.planning/phases/01-foundation/01-01-PLAN.md`

### Execution

**`{{COMMAND_PREFIX}}execute-phase <phase-number>`**
Execute all plans in a phase.

- Groups plans by wave (from frontmatter), executes waves sequentially
- Plans within each wave run in parallel via Task tool
- Verifies phase goal after all plans complete
- Updates REQUIREMENTS.md, ROADMAP.md, STATE.md

Usage: `{{COMMAND_PREFIX}}execute-phase 5`

### Quick Mode

**`{{COMMAND_PREFIX}}quick`**
Execute small, ad-hoc tasks with GSD guarantees but skip optional agents.

Quick mode uses the same system with a shorter path:
- Spawns planner + executor (skips researcher, checker, verifier)
- Quick tasks live in `.planning/quick/` separate from planned phases
- Updates STATE.md tracking (not ROADMAP.md)

Use when you know exactly what to do and the task is small enough to not need research or verification.

Usage: `{{COMMAND_PREFIX}}quick`
Result: Creates `.planning/quick/NNN-slug/PLAN.md`, `.planning/quick/NNN-slug/SUMMARY.md`

### Roadmap Management

**`{{COMMAND_PREFIX}}add-phase <description>`**
Add new phase to end of current milestone.

- Appends to ROADMAP.md
- Uses next sequential number
- Updates phase directory structure

Usage: `{{COMMAND_PREFIX}}add-phase "Add admin dashboard"`

**`{{COMMAND_PREFIX}}insert-phase <after> <description>`**
Insert urgent work as decimal phase between existing phases.

- Creates intermediate phase (e.g., 7.1 between 7 and 8)
- Useful for discovered work that must happen mid-milestone
- Maintains phase ordering

Usage: `{{COMMAND_PREFIX}}insert-phase 7 "Fix critical auth bug"`
Result: Creates Phase 7.1

**`{{COMMAND_PREFIX}}remove-phase <number>`**
Remove a future phase and renumber subsequent phases.

- Deletes phase directory and all references
- Renumbers all subsequent phases to close the gap
- Only works on future (unstarted) phases
- Git commit preserves historical record

Usage: `{{COMMAND_PREFIX}}remove-phase 17`
Result: Phase 17 deleted, phases 18-20 become 17-19

### Milestone Management

**`{{COMMAND_PREFIX}}new-milestone <name>`**
Start a new milestone through unified flow.

- Deep questioning to understand what you're building next
- Optional domain research (spawns 4 parallel researcher agents)
- Requirements definition with scoping
- Roadmap creation with phase breakdown

Mirrors `{{COMMAND_PREFIX}}new-project` flow for brownfield projects (existing PROJECT.md).

Usage: `{{COMMAND_PREFIX}}new-milestone "v2.0 Features"`

**`{{COMMAND_PREFIX}}complete-milestone <version>`**
Archive completed milestone and prepare for next version.

- Creates MILESTONES.md entry with stats
- Archives full details to milestones/ directory
- Creates git tag for the release
- Prepares workspace for next version

Usage: `{{COMMAND_PREFIX}}complete-milestone 1.0.0`

### Progress Tracking

**`{{COMMAND_PREFIX}}progress`**
Check project status and intelligently route to next action.

- Shows visual progress bar and completion percentage
- Summarizes recent work from SUMMARY files
- Displays current position and what's next
- Lists key decisions and open issues
- Offers to execute next plan or create it if missing
- Detects 100% milestone completion

Usage: `{{COMMAND_PREFIX}}progress`

### Session Management

**`{{COMMAND_PREFIX}}resume-work`**
Resume work from previous session with full context restoration.

- Reads STATE.md for project context
- Shows current position and recent progress
- Offers next actions based on project state

Usage: `{{COMMAND_PREFIX}}resume-work`

**`{{COMMAND_PREFIX}}pause-work`**
Create context handoff when pausing work mid-phase.

- Creates .continue-here file with current state
- Updates STATE.md session continuity section
- Captures in-progress work context

Usage: `{{COMMAND_PREFIX}}pause-work`

### Debugging

**`{{COMMAND_PREFIX}}debug [issue description]`**
Systematic debugging with persistent state across context resets.

- Gathers symptoms through adaptive questioning
- Creates `.planning/debug/[slug].md` to track investigation
- Investigates using scientific method (evidence → hypothesis → test)
- Survives `/clear` — run `{{COMMAND_PREFIX}}debug` with no args to resume
- Archives resolved issues to `.planning/debug/resolved/`

Usage: `{{COMMAND_PREFIX}}debug "login button doesn't work"`
Usage: `{{COMMAND_PREFIX}}debug` (resume active session)

### Todo Management

**`{{COMMAND_PREFIX}}add-todo [description]`**
Capture idea or task as todo from current conversation.

- Extracts context from conversation (or uses provided description)
- Creates structured todo file in `.planning/todos/pending/`
- Infers area from file paths for grouping
- Checks for duplicates before creating
- Updates STATE.md todo count

Usage: `{{COMMAND_PREFIX}}add-todo` (infers from conversation)
Usage: `{{COMMAND_PREFIX}}add-todo Add auth token refresh`

**`{{COMMAND_PREFIX}}check-todos [area]`**
List pending todos and select one to work on.

- Lists all pending todos with title, area, age
- Optional area filter (e.g., `{{COMMAND_PREFIX}}check-todos api`)
- Loads full context for selected todo
- Routes to appropriate action (work now, add to phase, brainstorm)
- Moves todo to done/ when work begins

Usage: `{{COMMAND_PREFIX}}check-todos`
Usage: `{{COMMAND_PREFIX}}check-todos api`

### User Acceptance Testing

**`{{COMMAND_PREFIX}}verify-work [phase]`**
Validate built features through conversational UAT.

- Extracts testable deliverables from SUMMARY.md files
- Presents tests one at a time (yes/no responses)
- Automatically diagnoses failures and creates fix plans
- Ready for re-execution if issues found

Usage: `{{COMMAND_PREFIX}}verify-work 3`

### Milestone Auditing

**`{{COMMAND_PREFIX}}audit-milestone [version]`**
Audit milestone completion against original intent.

- Reads all phase VERIFICATION.md files
- Checks requirements coverage
- Spawns integration checker for cross-phase wiring
- Creates MILESTONE-AUDIT.md with gaps and tech debt

Usage: `{{COMMAND_PREFIX}}audit-milestone`

**`{{COMMAND_PREFIX}}plan-milestone-gaps`**
Create phases to close gaps identified by audit.

- Reads MILESTONE-AUDIT.md and groups gaps into phases
- Prioritizes by requirement priority (must/should/nice)
- Adds gap closure phases to ROADMAP.md
- Ready for `{{COMMAND_PREFIX}}plan-phase` on new phases

Usage: `{{COMMAND_PREFIX}}plan-milestone-gaps`

### Configuration

**`{{COMMAND_PREFIX}}settings`**
Configure workflow toggles and model profile interactively.

- Toggle researcher, plan checker, verifier agents
- Select model profile (quality/balanced/budget)
- Updates `.planning/config.json`

Usage: `{{COMMAND_PREFIX}}settings`

**`{{COMMAND_PREFIX}}set-profile <profile>`**
Quick switch model profile for GSD agents.

- `quality` — Opus everywhere except verification
- `balanced` — Opus for planning, Sonnet for execution (default)
- `budget` — Sonnet for writing, Haiku for research/verification

Usage: `{{COMMAND_PREFIX}}set-profile budget`

### Utility Commands

**`{{COMMAND_PREFIX}}help`**
Show this command reference.

**`{{COMMAND_PREFIX}}update`**
Update GSD to latest version with changelog preview.

- Shows installed vs latest version comparison
- Displays changelog entries for versions you've missed
- Highlights breaking changes
- Confirms before running install
- Better than raw `npx get-shit-done-cc`

Usage: `{{COMMAND_PREFIX}}update`

**`{{COMMAND_PREFIX}}join-discord`**
Join the GSD Discord community.

- Get help, share what you're building, stay updated
- Connect with other GSD users

Usage: `{{COMMAND_PREFIX}}join-discord`

## Files & Structure

```
.planning/
├── PROJECT.md            # Project vision
├── ROADMAP.md            # Current phase breakdown
├── STATE.md              # Project memory & context
├── config.json           # Workflow mode & gates
├── todos/                # Captured ideas and tasks
│   ├── pending/          # Todos waiting to be worked on
│   └── done/             # Completed todos
├── debug/                # Active debug sessions
│   └── resolved/         # Archived resolved issues
├── codebase/             # Codebase map (brownfield projects)
│   ├── STACK.md          # Languages, frameworks, dependencies
│   ├── ARCHITECTURE.md   # Patterns, layers, data flow
│   ├── STRUCTURE.md      # Directory layout, key files
│   ├── CONVENTIONS.md    # Coding standards, naming
│   ├── TESTING.md        # Test setup, patterns
│   ├── INTEGRATIONS.md   # External services, APIs
│   └── CONCERNS.md       # Tech debt, known issues
└── phases/
    ├── 01-foundation/
    │   ├── 01-01-PLAN.md
    │   └── 01-01-SUMMARY.md
    └── 02-core-features/
        ├── 02-01-PLAN.md
        └── 02-01-SUMMARY.md
```

## Workflow Modes

Set during `{{COMMAND_PREFIX}}new-project`:

**Interactive Mode**

- Confirms each major decision
- Pauses at checkpoints for approval
- More guidance throughout

**YOLO Mode**

- Auto-approves most decisions
- Executes plans without confirmation
- Only stops for critical checkpoints

Change anytime by editing `.planning/config.json`

## Planning Configuration

Configure how planning artifacts are managed in `.planning/config.json`:

**`planning.commit_docs`** (default: `true`)
- `true`: Planning artifacts committed to git (standard workflow)
- `false`: Planning artifacts kept local-only, not committed

When `commit_docs: false`:
- Add `.planning/` to your `.gitignore`
- Useful for OSS contributions, client projects, or keeping planning private
- All planning files still work normally, just not tracked in git

**`planning.search_gitignored`** (default: `false`)
- `true`: Add `--no-ignore` to broad ripgrep searches
- Only needed when `.planning/` is gitignored and you want project-wide searches to include it

Example config:
```json
{
  "planning": {
    "commit_docs": false,
    "search_gitignored": true
  }
}
```

## Common Workflows

**Starting a new project:**

```
{{COMMAND_PREFIX}}new-project        # Unified flow: questioning → research → requirements → roadmap
/clear
{{COMMAND_PREFIX}}plan-phase 1       # Create plans for first phase
/clear
{{COMMAND_PREFIX}}execute-phase 1    # Execute all plans in phase
```

**Resuming work after a break:**

```
{{COMMAND_PREFIX}}progress  # See where you left off and continue
```

**Adding urgent mid-milestone work:**

```
{{COMMAND_PREFIX}}insert-phase 5 "Critical security fix"
{{COMMAND_PREFIX}}plan-phase 5.1
{{COMMAND_PREFIX}}execute-phase 5.1
```

**Completing a milestone:**

```
{{COMMAND_PREFIX}}complete-milestone 1.0.0
/clear
{{COMMAND_PREFIX}}new-milestone  # Start next milestone (questioning → research → requirements → roadmap)
```

**Capturing ideas during work:**

```
{{COMMAND_PREFIX}}add-todo                    # Capture from conversation context
{{COMMAND_PREFIX}}add-todo Fix modal z-index  # Capture with explicit description
{{COMMAND_PREFIX}}check-todos                 # Review and work on todos
{{COMMAND_PREFIX}}check-todos api             # Filter by area
```

**Debugging an issue:**

```
{{COMMAND_PREFIX}}debug "form submission fails silently"  # Start debug session
# ... investigation happens, context fills up ...
/clear
{{COMMAND_PREFIX}}debug                                    # Resume from where you left off
```

## Getting Help

- Read `.planning/PROJECT.md` for project vision
- Read `.planning/STATE.md` for current context
- Check `.planning/ROADMAP.md` for phase status
- Run `{{COMMAND_PREFIX}}progress` to check where you're up to
  </reference>
