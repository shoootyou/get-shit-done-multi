---
name: gsd-help
description: Show available GSD commands and usage guide
skill_version: 1.9.1
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools:
  - read
arguments: []
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

1. `{{cmdPrefix}}new-project` - Initialize project (includes research, requirements, roadmap)
2. `{{cmdPrefix}}plan-phase 1` - Create detailed plan for first phase
3. `{{cmdPrefix}}execute-phase 1` - Execute the phase

## Staying Updated

GSD evolves fast. Check for updates periodically:

```
{{cmdPrefix}}whats-new
```

Shows what changed since your installed version. Update with:

```bash
npx get-shit-done-multi@latest
```

## Core Workflow

```
{{cmdPrefix}}new-project → {{cmdPrefix}}plan-phase → {{cmdPrefix}}execute-phase → repeat
```

### Project Initialization

**`{{cmdPrefix}}new-project`**
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

Usage: `{{cmdPrefix}}new-project`

**`{{cmdPrefix}}map-codebase`**
Map an existing codebase for brownfield projects.

- Analyzes codebase with parallel Explore agents
- Creates `.planning/codebase/` with 7 focused documents
- Covers stack, architecture, structure, conventions, testing, integrations, concerns
- Use before `{{cmdPrefix}}new-project` on existing codebases

Usage: `{{cmdPrefix}}map-codebase`

### Phase Planning

**`{{cmdPrefix}}discuss-phase <number>`**
Help articulate your vision for a phase before planning.

- Captures how you imagine this phase working
- Creates CONTEXT.md with your vision, essentials, and boundaries
- Use when you have ideas about how something should look/feel

Usage: `{{cmdPrefix}}discuss-phase 2`

**`{{cmdPrefix}}research-phase <number>`**
Comprehensive ecosystem research for niche/complex domains.

- Discovers standard stack, architecture patterns, pitfalls
- Creates RESEARCH.md with "how experts build this" knowledge
- Use for 3D, games, audio, shaders, ML, and other specialized domains
- Goes beyond "which library" to ecosystem knowledge

Usage: `{{cmdPrefix}}research-phase 3`

**`{{cmdPrefix}}list-phase-assumptions <number>`**
See what Claude is planning to do before it starts.

- Shows Claude's intended approach for a phase
- Lets you course-correct if Claude misunderstood your vision
- No files created - conversational output only

Usage: `{{cmdPrefix}}list-phase-assumptions 3`

**`{{cmdPrefix}}plan-phase <number>`**
Create detailed execution plan for a specific phase.

- Generates `.planning/phases/XX-phase-name/XX-YY-PLAN.md`
- Breaks phase into concrete, actionable tasks
- Includes verification criteria and success measures
- Multiple plans per phase supported (XX-01, XX-02, etc.)

Usage: `{{cmdPrefix}}plan-phase 1`
Result: Creates `.planning/phases/01-foundation/01-01-PLAN.md`

### Execution

**`{{cmdPrefix}}execute-phase <phase-number>`**
Execute all plans in a phase.

- Groups plans by wave (from frontmatter), executes waves sequentially
- Plans within each wave run in parallel via Task tool
- Verifies phase goal after all plans complete
- Updates REQUIREMENTS.md, ROADMAP.md, STATE.md

Usage: `{{cmdPrefix}}execute-phase 5`

### Roadmap Management

**`{{cmdPrefix}}add-phase <description>`**
Add new phase to end of current milestone.

- Appends to ROADMAP.md
- Uses next sequential number
- Updates phase directory structure

Usage: `{{cmdPrefix}}add-phase "Add admin dashboard"`

**`{{cmdPrefix}}insert-phase <after> <description>`**
Insert urgent work as decimal phase between existing phases.

- Creates intermediate phase (e.g., 7.1 between 7 and 8)
- Useful for discovered work that must happen mid-milestone
- Maintains phase ordering

Usage: `{{cmdPrefix}}insert-phase 7 "Fix critical auth bug"`
Result: Creates Phase 7.1

**`{{cmdPrefix}}remove-phase <number>`**
Remove a future phase and renumber subsequent phases.

- Deletes phase directory and all references
- Renumbers all subsequent phases to close the gap
- Only works on future (unstarted) phases
- Git commit preserves historical record

Usage: `{{cmdPrefix}}remove-phase 17`
Result: Phase 17 deleted, phases 18-20 become 17-19

### Milestone Management

**`{{cmdPrefix}}new-milestone <name>`**
Start a new milestone through unified flow.

- Deep questioning to understand what you're building next
- Optional domain research (spawns 4 parallel researcher agents)
- Requirements definition with scoping
- Roadmap creation with phase breakdown

Mirrors `{{cmdPrefix}}new-project` flow for brownfield projects (existing PROJECT.md).

Usage: `{{cmdPrefix}}new-milestone "v2.0 Features"`

**`{{cmdPrefix}}complete-milestone <version>`**
Archive completed milestone and prepare for next version.

- Creates MILESTONES.md entry with stats
- Archives full details to milestones/ directory
- Creates git tag for the release
- Prepares workspace for next version

Usage: `{{cmdPrefix}}complete-milestone 1.0.0`

### Progress Tracking

**`{{cmdPrefix}}progress`**
Check project status and intelligently route to next action.

- Shows visual progress bar and completion percentage
- Summarizes recent work from SUMMARY files
- Displays current position and what's next
- Lists key decisions and open issues
- Offers to execute next plan or create it if missing
- Detects 100% milestone completion

Usage: `{{cmdPrefix}}progress`

### Session Management

**`{{cmdPrefix}}resume-work`**
Resume work from previous session with full context restoration.

- Reads STATE.md for project context
- Shows current position and recent progress
- Offers next actions based on project state

Usage: `{{cmdPrefix}}resume-work`

**`{{cmdPrefix}}pause-work`**
Create context handoff when pausing work mid-phase.

- Creates .continue-here file with current state
- Updates STATE.md session continuity section
- Captures in-progress work context

Usage: `{{cmdPrefix}}pause-work`

### Debugging

**`{{cmdPrefix}}debug [issue description]`**
Systematic debugging with persistent state across context resets.

- Gathers symptoms through adaptive questioning
- Creates `.planning/debug/[slug].md` to track investigation
- Investigates using scientific method (evidence → hypothesis → test)
- Survives `/clear` — run `{{cmdPrefix}}debug` with no args to resume
- Archives resolved issues to `.planning/debug/resolved/`

Usage: `{{cmdPrefix}}debug "login button doesn't work"`
Usage: `{{cmdPrefix}}debug` (resume active session)

### Todo Management

**`{{cmdPrefix}}add-todo [description]`**
Capture idea or task as todo from current conversation.

- Extracts context from conversation (or uses provided description)
- Creates structured todo file in `.planning/todos/pending/`
- Infers area from file paths for grouping
- Checks for duplicates before creating
- Updates STATE.md todo count

Usage: `{{cmdPrefix}}add-todo` (infers from conversation)
Usage: `{{cmdPrefix}}add-todo Add auth token refresh`

**`{{cmdPrefix}}check-todos [area]`**
List pending todos and select one to work on.

- Lists all pending todos with title, area, age
- Optional area filter (e.g., `{{cmdPrefix}}check-todos api`)
- Loads full context for selected todo
- Routes to appropriate action (work now, add to phase, brainstorm)
- Moves todo to done/ when work begins

Usage: `{{cmdPrefix}}check-todos`
Usage: `{{cmdPrefix}}check-todos api`

### Utility Commands

**`{{cmdPrefix}}help`**
Show this command reference.

**`{{cmdPrefix}}whats-new`**
See what's changed since your installed version.

- Shows installed vs latest version comparison
- Displays changelog entries for versions you've missed
- Highlights breaking changes
- Provides update instructions when behind

Usage: `{{cmdPrefix}}whats-new`

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

Set during `{{cmdPrefix}}new-project`:

**Interactive Mode**

- Confirms each major decision
- Pauses at checkpoints for approval
- More guidance throughout

**YOLO Mode**

- Auto-approves most decisions
- Executes plans without confirmation
- Only stops for critical checkpoints

Change anytime by editing `.planning/config.json`

## Common Workflows

**Starting a new project:**

```
{{cmdPrefix}}new-project        # Unified flow: questioning → research → requirements → roadmap
/clear
{{cmdPrefix}}plan-phase 1       # Create plans for first phase
/clear
{{cmdPrefix}}execute-phase 1    # Execute all plans in phase
```

**Resuming work after a break:**

```
{{cmdPrefix}}progress  # See where you left off and continue
```

**Adding urgent mid-milestone work:**

```
{{cmdPrefix}}insert-phase 5 "Critical security fix"
{{cmdPrefix}}plan-phase 5.1
{{cmdPrefix}}execute-phase 5.1
```

**Completing a milestone:**

```
{{cmdPrefix}}complete-milestone 1.0.0
/clear
{{cmdPrefix}}new-milestone  # Start next milestone (questioning → research → requirements → roadmap)
```

**Capturing ideas during work:**

```
{{cmdPrefix}}add-todo                    # Capture from conversation context
{{cmdPrefix}}add-todo Fix modal z-index  # Capture with explicit description
{{cmdPrefix}}check-todos                 # Review and work on todos
{{cmdPrefix}}check-todos api             # Filter by area
```

**Debugging an issue:**

```
{{cmdPrefix}}debug "form submission fails silently"  # Start debug session
# ... investigation happens, context fills up ...
/clear
{{cmdPrefix}}debug                                    # Resume from where you left off
```

## Getting Help

- Read `.planning/PROJECT.md` for project vision
- Read `.planning/STATE.md` for current context
- Check `.planning/ROADMAP.md` for phase status
- Run `{{cmdPrefix}}progress` to check where you're up to
</reference>
