# How GSD Works

Step-by-step explanation of the GSD workflow from user perspective.

## Overview

GSD follows a **four-stage workflow** for every project phase:

1. **Research** → Understand domain and libraries
2. **Plan** → Break phase into executable tasks
3. **Execute** → Implement plans with atomic commits
4. **Verify** → Confirm phase goals achieved

## ASCII Workflow Diagram

```text
┌─────────────────────────────────────────────────────────────────┐
│  User: /gsd-plan-phase 1                                        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────────┐
│  Orchestrator: Loads context, spawns researcher & planner       │
└────────────────┬────────────────────────────────────────────────┘
                 │
       ┌─────────┴─────────┐
       ↓                   ↓
┌──────────────┐    ┌──────────────┐
│  Researcher  │    │   Planner    │
│  (Parallel)  │ →  │   (Serial)   │
└──────┬───────┘    └──────┬───────┘
       │                   │
       │   RESEARCH.md     │   PLAN.md files
       │                   │
       └────────┬──────────┘
                ↓
       ┌──────────────────┐
       │   User: Review   │
       │   & Approve      │
       └────────┬─────────┘
                ↓
       ┌─────────────────┐
       │ /gsd-execute-   │
       │    phase 1      │
       └────────┬────────┘
                ↓
       ┌─────────────────┐
       │    Executor     │
       │  (Atomic Task)  │
       └────────┬────────┘
                │
                │   SUMMARY.md
                │
                ↓
       ┌─────────────────┐
       │ /gsd-verify-    │
       │    phase 1      │
       └────────┬────────┘
                ↓
       ┌─────────────────┐
       │    Verifier     │
       │ (Goal-Backward) │
       └────────┬────────┘
                │
                │   VERIFICATION.md
                │
                ↓
       ┌─────────────────┐
       │  Phase Complete │
       └─────────────────┘
```

## Stage 1: Research

**Command:** `/gsd-research-phase <phase>`

**What Happens:**

1. Researcher agent spawned
2. Investigates domain, libraries, patterns
3. Identifies best practices and pitfalls
4. Creates `RESEARCH.md` in phase directory

**When to Use:**

- Novel domains (first time using a library)
- High-risk decisions (architecture choices)
- Unclear technical approach

**When to Skip:**

- Established patterns in codebase
- Simple CRUD operations
- Pure refactoring

## Stage 2: Planning

**Command:** `/gsd-plan-phase <phase>`

**What Happens:**

1. Planner agent spawned
2. Reads ROADMAP.md, RESEARCH.md, STATE.md
3. Breaks phase into executable tasks
4. Groups tasks into PLAN.md files
5. Identifies dependencies and parallelization

**Output:** Multiple PLAN.md files (e.g., `01-01-PLAN.md`, `01-02-PLAN.md`)

**Plan Structure:**

```yaml
---
phase: 01-setup
plan: 01
wave: 1
depends_on: []
files_modified: [...]
autonomous: true
---

# Objective
[What this plan achieves]

# Tasks
<task name="..." type="auto">
  <files>...</files>
  <action>...</action>
  <verify>...</verify>
  <done>...</done>
</task>
```plaintext

## Stage 3: Execution

**Command:** `/gsd-execute-phase <phase>`

**What Happens:**

1. Executor agent spawned for each PLAN.md
2. Follows task instructions precisely
3. Makes atomic git commits per task
4. Creates SUMMARY.md after plan completes

**Parallel Execution:**

- Plans in same wave run in parallel
- Dependencies ensure correct order
- Each plan is independent

**Checkpoints:**

- Human verification checkpoints pause execution
- User confirms work before continuing
- Decision checkpoints await user choices

**Output:** Code changes + SUMMARY.md files

## Stage 4: Verification

**Command:** `/gsd-verify-phase <phase>`

**What Happens:**

1. Verifier agent spawned
2. Reads phase goal from ROADMAP.md
3. Analyzes codebase (goal-backward)
4. Confirms observable truths achieved
5. Creates `VERIFICATION.md` report

**Goal-Backward Analysis:**

- Start with phase goal (outcome, not tasks)
- Derive observable truths (what must be true)
- Check codebase delivers those truths
- Report gaps if any

**Output:** `VERIFICATION.md` with pass/fail status

## Continuous Workflow

Projects proceed phase-by-phase:

```

Phase 1: Plan → Execute → Verify → Complete
Phase 2: Plan → Execute → Verify → Complete
Phase 3: Plan → Execute → Verify → Complete
...

Each phase builds on previous phases. STATE.md tracks progress.

## Key Files

| File | Purpose | Created By |
 |------   |---------   |------------  |
| ROADMAP.md | Project phases and goals | `/gsd-new-project` |
| REQUIREMENTS.md | Requirements traceability | `/gsd-new-project` |
| STATE.md | Current project state | Orchestrator |
| RESEARCH.md | Domain research | `/gsd-research-phase` |
| PLAN.md | Executable tasks | `/gsd-plan-phase` |
| SUMMARY.md | What was built | `/gsd-execute-phase` |
| VERIFICATION.md | Goal verification | `/gsd-verify-phase` |

## Specialized Agents

GSD uses specialized agents for complex tasks:

- **gsd-researcher**: Domain and library research
- **gsd-planner**: Phase planning and task breakdown
- **gsd-executor**: Plan execution with atomic commits
- **gsd-verifier**: Goal-backward verification
- **gsd-roadmapper**: Project roadmap creation
- **gsd-integration-checker**: Cross-phase integration
- (and 7 more specialized agents)

Each agent is spawned as needed and works autonomously.

## Next Steps

- [What is GSD](what-is-gsd.md) - High-level concept
- [How to Install](how-to-install.md) - Get started
- [Architecture](architecture.md) - Technical implementation
