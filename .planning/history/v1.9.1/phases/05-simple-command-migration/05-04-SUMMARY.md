---
phase: 05-simple-command-migration
plan: 04
status: complete
type: migration
subsystem: todo-management
tags: [todo, file-creation, interactive-selection, routing, user-interaction]
dependencies:
  requires: [05-01, 05-02]
  provides: [gsd-add-todo, gsd-check-todos]
  affects: []
tech:
  tech-stack:
    added: []
    patterns: [interactive-selection, file-creation, todo-management]
  file-tracking:
    key-files:
      created:
        - specs/skills/gsd-add-todo/SKILL.md
        - specs/skills/gsd-check-todos/SKILL.md
        - .claude/get-shit-done/gsd-add-todo/SKILL.md
      modified: []
decisions:
  - id: 05-04-01
    title: "Todo management as two separate commands"
    rationale: "add-todo focuses on capture, check-todos on selection and routing - separation of concerns"
    alternatives: ["Single combined command"]
    impact: "Clear command responsibilities, easier to use and maintain"
  - id: 05-04-02
    title: "Interactive selection with AskUserQuestion"
    rationale: "Natural user interaction pattern for selection and routing"
    alternatives: ["CLI arguments for selection"]
    impact: "Better UX, supports complex routing decisions"
metrics:
  duration: 281s
  completed: 2026-01-23
---

# Phase 5 Plan 04: Batch 4 - Todo Management Commands

**One-liner:** Migrated gsd-add-todo and gsd-check-todos with file creation, frontmatter structure, and interactive selection/routing patterns

## Overview

Migrated two todo management commands implementing the file creation + interactive selection pattern. Commands work together: add-todo creates structured todo files with frontmatter, check-todos provides interactive selection and routing to action.

**Pattern validated:** File creation with frontmatter + interactive selection with routing

## Tasks Completed

### Task 1: Migrate gsd-add-todo command
**Commit:** `e405f53`
**Files:** `specs/skills/gsd-add-todo/SKILL.md`

Created spec from legacy commands/gsd/add-todo.md (182 lines):
- Todo file creation in `.planning/todos/pending/`
- Frontmatter structure: title, area, phase, created, priority
- Unique filename generation with date prefix
- Area inference from file paths
- Duplicate detection and resolution
- Git commit after creation
- Tools: write, read, bash, glob

**Key preservation:**
- Complete file creation workflow
- Frontmatter format for structured data
- Area consistency checking
- STATE.md integration

### Task 2: Migrate gsd-check-todos command
**Commit:** `7b90e41`
**Files:** `specs/skills/gsd-check-todos/SKILL.md`

Created spec from legacy commands/gsd/check-todos.md (217 lines):
- Glob pattern to find todos: `.planning/todos/pending/*.md`
- Parse frontmatter for display
- Interactive selection with AskUserQuestion
- Routing based on user choice:
  - Work on it now → move to done/, start working
  - Add to phase plan → note reference, keep in pending
  - Create a phase → suggest /gsd:add-phase
  - Brainstorm approach → discuss in place
  - Put it back → return to list
- Roadmap context checking for phase matching
- STATE.md updates when todo count changes
- Tools: read, write, bash, glob, task

**Key preservation:**
- Interactive loop structure
- Complex routing logic (5 action options)
- File movement workflow (pending → done)
- Context loading and display

### Task 3: Validate batch 4 migration
**Commit:** `5f81ece`

Validation results:
✓ Both specs exist with valid structure
✓ gsd-add-todo has Write tool for file creation
✓ gsd-check-todos has task tool for routing
✓ Todo file structure preserved (frontmatter format)
✓ Interactive selection logic intact
✓ Generation successful (gsd-add-todo confirmed)

**Pattern validated:** File creation + interactive selection

## Implementation Details

### Todo File Structure
```markdown
---
created: 2026-01-23T10:30
title: Fix authentication bug
area: auth
files:
  - src/auth/login.ts:45
---

## Problem
[Context-rich description]

## Solution
[Approach hints or "TBD"]
```

### Interactive Selection Flow
1. List todos with area/age
2. User selects by number
3. Load full context
4. Check roadmap for phase match
5. Offer context-appropriate actions
6. Execute selected action
7. Update STATE.md if needed
8. Commit changes

### Area Inference Logic
- Path pattern matching (api, ui, auth, database, etc.)
- Consistency with existing areas
- Fallback to "general"

## Decisions Made

### 1. Todo management as two separate commands
**Context:** Could combine into single command

**Decision:** Keep as two separate commands (add-todo, check-todos)

**Rationale:**
- add-todo: Focus on quick capture without interrupting workflow
- check-todos: Focus on review, selection, and routing decisions
- Separation of concerns improves clarity
- Each command has clear, single purpose

**Impact:** Clear command responsibilities, easier to use and maintain

### 2. Interactive selection with AskUserQuestion
**Context:** Could use CLI arguments for selection

**Decision:** Use AskUserQuestion for interactive selection and routing

**Rationale:**
- Natural user interaction for complex decisions
- Supports context-dependent options (roadmap matching)
- Better UX than remembering argument syntax
- Enables dynamic option generation

**Impact:** Better UX, supports complex routing decisions

## Technical Notes

### Tools Usage

**gsd-add-todo:**
- `write`: Create todo files
- `read`: Check STATE.md, read existing todos
- `bash`: Directory creation, git operations, duplicate checking
- `glob`: Find existing todos for area consistency

**gsd-check-todos:**
- `read`: Parse todo files, check ROADMAP.md
- `write`: Update STATE.md
- `bash`: File operations, git operations
- `glob`: Find pending todos
- `task`: Route to other commands (e.g., /gsd:add-phase)

### Frontmatter Parsing
Both commands work with gray-matter frontmatter:
- `grep "^created:"` for extraction
- YAML structure for structured data
- Consistent with planning system format

### File Operations
- Atomic file creation in pending/
- Safe file movement (pending → done)
- Git tracking throughout workflow

## Deviations from Plan

None - plan executed exactly as written.

## Testing Performed

### Spec Validation
✓ Frontmatter structure valid
✓ Tools declared correctly
✓ Body content preserved
✓ Arguments defined properly

### Specific Validations
✓ add-todo: Write tool present
✓ add-todo: Todo file creation logic intact
✓ add-todo: Frontmatter structure preserved
✓ check-todos: task tool for routing
✓ check-todos: AskUserQuestion for selection
✓ check-todos: Routing options complete
✓ check-todos: Todo glob pattern correct

### Generation Test
✓ gsd-add-todo generated successfully
✓ Generated output matches spec format
✓ Tools properly formatted in output
✓ Body content preserved correctly

## Migration Statistics

**Commands migrated:** 2
**Source lines:** 399 (182 + 217)
**Pattern complexity:** LOW-MEDIUM
**Key patterns:**
- File creation with frontmatter
- Interactive selection
- Context-dependent routing
- File movement workflow

**Batch 4 completion:** 2/2 commands (100%)

## Next Phase Readiness

**Status:** ✅ Ready

**Batch 4 complete.** Todo management pattern validated:
- File creation with structured frontmatter
- Interactive selection with AskUserQuestion
- Complex routing logic (5 action types)
- STATE.md integration
- Git workflow integration

**Blockers:** None

**Concerns:** None

**Next batch:** Plan 05-05 (Batch 5: Verification suite - gsd-check-phase, gsd-verify-installation)

## Links

**Plan:** `.planning/phases/05-simple-command-migration/05-04-PLAN.md`
**Legacy sources:**
- `.claude/commands/gsd/add-todo.md`
- `.claude/commands/gsd/check-todos.md`

**Generated outputs:**
- `.claude/get-shit-done/gsd-add-todo/SKILL.md`
- `.claude/get-shit-done/gsd-check-todos/SKILL.md` (generated on next install)

**Related:**
- 05-01: Reference commands (Batch 1)
- 05-02: Workflow delegation (Batch 2)
- 05-03: Phase management (Batch 3)
