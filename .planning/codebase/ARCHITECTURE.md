# Architecture

**Analysis Date:** 2026-01-19

## Pattern Overview

**Overall:** Orchestrator-Agent Meta-Prompting System

**Key Characteristics:**
- Thin orchestrators coordinate workflow, delegate execution to specialized agents
- Agents are isolated prompt files loaded into fresh context windows via Task tool
- State flows through markdown files in `.planning/` directory
- Commands are executable markdown files with frontmatter configuration
- Multi-wave parallel execution using dependency-aware task grouping

## Layers

**User Interface Layer:**
- Purpose: Command invocation surface
- Location: `commands/gsd/*.md`
- Contains: Slash command definitions with frontmatter metadata, process steps, validation logic
- Depends on: Workflow layer, Template layer
- Used by: Claude Code slash command system (or GitHub Copilot CLI skill wrapper)

**Orchestrator Layer:**
- Purpose: Coordinate multi-agent workflows, manage state transitions, handle user interaction
- Location: `commands/gsd/*.md` (process sections), `get-shit-done/workflows/*.md`
- Contains: Coordination logic, agent spawning, result aggregation, checkpoint handling
- Depends on: Agent layer, State layer, Template layer
- Used by: User Interface layer
- Pattern: Parse arguments → Validate → Spawn agents → Collect results → Update state → Present to user

**Agent Layer:**
- Purpose: Execute isolated specialized tasks in fresh context windows
- Location: `agents/*.md`
- Contains: Specialized agent prompts (planner, executor, verifier, researcher, debugger, etc.)
- Depends on: State layer, Template layer, Reference layer
- Used by: Orchestrator layer via Task tool
- Pattern: Load state → Execute specialized work → Write output → Return structured confirmation

**State Layer:**
- Purpose: Persistent project memory and inter-agent communication
- Location: `.planning/*.md`, `.planning/phases/*/` (created during runtime)
- Contains: PROJECT.md, ROADMAP.md, STATE.md, REQUIREMENTS.md, phase plans and summaries
- Depends on: Template layer
- Used by: All layers (read/write project state)

**Template Layer:**
- Purpose: Define document structures and conventions
- Location: `get-shit-done/templates/*.md`
- Contains: Markdown templates for all state documents
- Depends on: Nothing (pure templates)
- Used by: Orchestrator layer, Agent layer

**Reference Layer:**
- Purpose: Provide reusable guidance and conventions
- Location: `get-shit-done/references/*.md`
- Contains: Questioning patterns, verification patterns, git integration, TDD, UI brand, checkpoints
- Depends on: Nothing (pure reference material)
- Used by: Agent layer (loaded via @-references)

**Installation Layer:**
- Purpose: Deploy system to Claude Code or GitHub Copilot CLI environments
- Location: `bin/install.js`, `hooks/*.js`
- Contains: Node.js installer script, status line hooks
- Depends on: Nothing (bootstraps system)
- Used by: External (npx invocation)

## Data Flow

**Command Invocation Flow:**

1. User types `/gsd:command-name [args]` (or `gsd:command-name` in Copilot CLI)
2. Claude loads `commands/gsd/command-name.md`
3. Orchestrator parses arguments, validates environment
4. Orchestrator reads current state from `.planning/STATE.md`
5. Orchestrator spawns specialized agents via Task tool
6. Agents execute in parallel (where dependencies allow)
7. Agents write outputs to `.planning/` directory
8. Agents return structured confirmations to orchestrator
9. Orchestrator updates STATE.md
10. Orchestrator presents results to user with "Next Up" guidance

**Phase Execution Flow:**

1. `/gsd:plan-phase N` → Spawns `gsd-phase-researcher` (optional) → Spawns `gsd-planner` → Spawns `gsd-plan-checker` → Iterates until plans pass → Writes `{phase}-RESEARCH.md`, `{phase}-{N}-PLAN.md`
2. `/gsd:execute-phase N` → Discovers plans → Groups by wave → Spawns `gsd-executor` agents in parallel per wave → Executors commit atomically → Spawns `gsd-verifier` → Writes `{phase}-{N}-SUMMARY.md`, `{phase}-VERIFICATION.md`
3. `/gsd:verify-work N` → Extracts testable deliverables → Prompts user for each → On failure: spawns `gsd-debugger` agents → spawns `gsd-planner` in gaps mode → Writes `{phase}-UAT.md`, fix plans

**State Management:**
- STATE.md acts as project memory (decisions, blockers, position)
- ROADMAP.md tracks phases and their completion status
- Each phase gets directory: `.planning/phases/{NN}-{slug}/`
- Plans contain frontmatter metadata (wave, dependencies, autonomous flag)
- Git commits track each completed task atomically

## Key Abstractions

**Command:**
- Purpose: User-facing entry point with argument handling
- Examples: `commands/gsd/new-project.md`, `commands/gsd/execute-phase.md`, `commands/gsd/plan-phase.md`
- Pattern: Frontmatter (name, description, allowed-tools) + execution_context (@-references) + process steps + success criteria

**Agent:**
- Purpose: Isolated specialist executing in fresh context
- Examples: `agents/gsd-executor.md`, `agents/gsd-planner.md`, `agents/gsd-verifier.md`
- Pattern: Frontmatter (name, description, tools, color) + role + philosophy + process + templates + rules

**Workflow:**
- Purpose: Reusable orchestration logic shared across commands
- Examples: `get-shit-done/workflows/execute-phase.md`, `get-shit-done/workflows/execute-plan.md`
- Pattern: Purpose + core principles + process steps + checkpoint handling + edge cases

**Plan:**
- Purpose: Executable prompt containing 2-3 atomic tasks
- Location: `.planning/phases/{NN}-{slug}/{NN}-{MM}-PLAN.md`
- Pattern: Frontmatter (phase, plan, wave, autonomous, depends_on) + objective + context (@-references) + tasks (with verification) + success criteria

**Wave:**
- Purpose: Dependency-aware execution group for parallel task processing
- Implementation: Plans tagged with `wave: N` in frontmatter
- Pattern: Wave 1 (no dependencies) → Wave 2 (depends on Wave 1) → Wave 3 (depends on Wave 2)

**Checkpoint:**
- Purpose: Pause point for user input during long-running agent execution
- Implementation: Tasks with `type="checkpoint"` in plan XML
- Pattern: Agent executes to checkpoint → Returns structured state → Orchestrator presents to user → Spawns fresh continuation agent

## Entry Points

**CLI Installation:**
- Location: `bin/install.js`
- Triggers: `npx get-shit-done-cc [--global|--local|--copilot]`
- Responsibilities: Copy commands, agents, workflows, templates, references to target directory (~/.claude or ./.claude or ./.github)

**Project Initialization:**
- Location: `commands/gsd/new-project.md`
- Triggers: `/gsd:new-project` command
- Responsibilities: Question user → Optional research → Extract requirements → Generate roadmap → Create PROJECT.md, ROADMAP.md, STATE.md, config.json

**Phase Planning:**
- Location: `commands/gsd/plan-phase.md`
- Triggers: `/gsd:plan-phase N` command
- Responsibilities: Research domain → Create atomic plans → Verify plans → Write PLAN.md files

**Phase Execution:**
- Location: `commands/gsd/execute-phase.md`
- Triggers: `/gsd:execute-phase N` command
- Responsibilities: Discover plans → Group by wave → Execute in parallel → Verify completion → Write SUMMARY.md files

**Manual Verification:**
- Location: `commands/gsd/verify-work.md`
- Triggers: `/gsd:verify-work N` command
- Responsibilities: Walk user through testable deliverables → Diagnose failures → Create fix plans → Write UAT.md

**Progress Check:**
- Location: `commands/gsd/progress.md`
- Triggers: `/gsd:progress` command
- Responsibilities: Load STATE.md → Present current position → Suggest next command

**Codebase Mapping:**
- Location: `commands/gsd/map-codebase.md`
- Triggers: `/gsd:map-codebase` command
- Responsibilities: Spawn 4 parallel `gsd-codebase-mapper` agents → Write STACK.md, ARCHITECTURE.md, STRUCTURE.md, CONVENTIONS.md, TESTING.md, INTEGRATIONS.md, CONCERNS.md to `.planning/codebase/`

## Error Handling

**Strategy:** Fail fast with clear error messages, provide recovery guidance

**Patterns:**
- Validation checks at command start (project exists, phase exists, git initialized)
- Bash error handling: `command || { echo "ERROR: ..."; exit 1; }`
- Agent failures: Orchestrator presents error, suggests retry or manual intervention
- Checkpoint system: Long-running agents pause for user input rather than guessing
- Git integration: Atomic commits per task enable surgical rollback

## Cross-Cutting Concerns

**Logging:** Status messages with Unicode symbols (◆ for spawning, ✓ for success, ⚠ for warnings)

**Validation:** 
- Argument parsing and normalization (phase numbers, flags)
- File existence checks before operations
- Git repository validation
- Roadmap consistency verification

**Authentication:** Not applicable (local CLI tool, no external auth)

**Context Management:**
- Orchestrators stay at ~15-30% context usage
- Agents get fresh 200k token contexts
- @-references load context on-demand
- State documents sized to avoid degradation (hard limits enforced)

**Git Integration:**
- Atomic commits per task with conventional commit format
- Phase-prefixed commit messages: `feat({phase}): description`
- Automatic staging and committing in executors
- Tag creation on milestone completion

**Parallel Execution:**
- Task tool spawns multiple agents simultaneously
- Wave-based dependency management prevents race conditions
- Executors write to isolated plan-specific files (no conflicts)

**Dual Installation Support:**
- Single codebase supports both Claude Code (~/.claude) and GitHub Copilot CLI (./.github)
- SKILL.md and copilot-instructions.md provide Copilot-specific guidance
- Path references use placeholders (~/.claude) with runtime resolution

---

*Architecture analysis: 2026-01-19*
