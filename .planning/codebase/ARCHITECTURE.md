# Architecture

**Analysis Date:** 2026-01-19

## Pattern Overview

**Overall:** Meta-Prompting System with Orchestration Layer

**Key Characteristics:**
- Command-driven workflow system for AI-assisted development
- Multi-agent orchestration with specialized subagents
- Document-based state management and context engineering
- Template-driven artifact generation

## Layers

**Installation Layer:**
- Purpose: Deploy GSD assets to Claude Code or GitHub Copilot CLI configurations
- Location: `bin/install.js`
- Contains: Install logic, path rewriting, configuration setup
- Depends on: Node.js filesystem APIs, package.json metadata
- Used by: Users via `npx get-shit-done-cc` commands

**Command Layer:**
- Purpose: Define user-facing commands and their execution logic
- Location: `commands/gsd/`
- Contains: 24 command definition files (.md format) with embedded prompts
- Depends on: Workflow layer, template layer, agent layer
- Used by: Claude Code/Copilot CLI when user invokes commands

**Workflow Layer:**
- Purpose: Orchestrate multi-step processes and coordinate subagent spawning
- Location: `get-shit-done/workflows/`
- Contains: 12 workflow orchestration files defining process steps
- Depends on: Agent layer, template layer, references
- Used by: Command layer to execute complex operations

**Agent Layer:**
- Purpose: Specialized AI subagents for focused tasks
- Location: `agents/`
- Contains: 11 agent definition files with role, tools, and process instructions
- Depends on: Template layer, workflow layer
- Used by: Workflow layer via Task/subagent spawning

**Template Layer:**
- Purpose: Define structure for generated artifacts (PROJECT.md, PLAN.md, etc.)
- Location: `get-shit-done/templates/`
- Contains: 21 template files for various document types
- Depends on: Nothing (pure structure definitions)
- Used by: Commands, workflows, and agents during artifact generation

**Reference Layer:**
- Purpose: Provide reusable context snippets and guidelines
- Location: `get-shit-done/references/`
- Contains: 7 reference documents (checkpoints, TDD, git integration, etc.)
- Depends on: Nothing (pure reference material)
- Used by: Commands and workflows via @reference includes

**Runtime Hooks:**
- Purpose: Enhance CLI experience with statusline and update checks
- Location: `hooks/`
- Contains: 2 Node.js scripts for statusline rendering and version checking
- Depends on: Claude Code statusline API, filesystem access
- Used by: Claude Code at runtime

## Data Flow

**Command Invocation Flow:**

1. User types `/gsd:command` or `gsd:command`
2. Claude/Copilot CLI loads command definition from `commands/gsd/<command>.md`
3. Command loads workflow from `get-shit-done/workflows/<workflow>.md` (if orchestration needed)
4. Workflow spawns specialized agents from `agents/` via Task tool
5. Agents execute, write artifacts to `.planning/`, return confirmation
6. Workflow aggregates results, updates STATE.md
7. User receives summary output

**Artifact Generation Flow:**

1. Agent/workflow loads template from `get-shit-done/templates/<template>.md`
2. Gathers context via Bash/Read tools (codebase exploration, user input)
3. Fills template placeholders with gathered data
4. Writes completed artifact to `.planning/` directory
5. Commits artifact to git with semantic message

**State Management:**
- All project state stored in `.planning/` directory structure
- STATE.md acts as "project memory" updated by workflows
- Each phase/plan tracked via filesystem (directories and *-PLAN.md files)
- Git commits provide audit trail of all changes

## Key Abstractions

**Command Definition:**
- Purpose: Self-contained instruction set for Claude/Copilot
- Examples: `commands/gsd/new-project.md`, `commands/gsd/execute-phase.md`
- Pattern: YAML frontmatter + XML-structured prompts + process steps

**Agent Definition:**
- Purpose: Specialized role with tools, constraints, and process
- Examples: `agents/gsd-executor.md`, `agents/gsd-planner.md`, `agents/gsd-verifier.md`
- Pattern: YAML frontmatter + role description + process steps + success criteria

**Workflow Orchestration:**
- Purpose: Multi-step process coordination with subagent management
- Examples: `get-shit-done/workflows/execute-phase.md`, `get-shit-done/workflows/map-codebase.md`
- Pattern: Purpose statement + philosophy + process steps + agent spawning logic

**Template Structure:**
- Purpose: Skeleton for generated artifacts with placeholders
- Examples: `get-shit-done/templates/project.md`, `get-shit-done/templates/phase-prompt.md`
- Pattern: Frontmatter + section headers + [Placeholder] markers + guidance

## Entry Points

**NPX Installation Entry:**
- Location: `bin/install.js`
- Triggers: `npx get-shit-done-cc [options]`
- Responsibilities: Parse args, detect target (Claude/Copilot), copy assets, configure statusline

**Command Invocation Entry:**
- Location: `commands/gsd/<command>.md`
- Triggers: User types `/gsd:command` in Claude Code or `gsd:command` in Copilot CLI
- Responsibilities: Load context, execute workflow, manage state, output results

**Skill Loader Entry (Copilot):**
- Location: `lib-ghcc/SKILL.md`, `.github/skills/get-shit-done/SKILL.md`
- Triggers: Copilot CLI detects skill invocation
- Responsibilities: Map slash commands to command files, load @references, provide tool mappings

## Error Handling

**Strategy:** Defensive validation with early exits

**Patterns:**
- Pre-flight checks at start of each command (e.g., "Abort if project exists")
- Explicit error messages with user guidance (e.g., "ERROR: No phase directory matching '5'")
- State reconstruction offers when STATE.md missing
- Git repo existence validation before operations
- File existence checks before read operations

## Cross-Cutting Concerns

**Logging:** Minimal - relies on git commits for audit trail, bash output for real-time status

**Validation:** Pre-flight checks in commands, state existence validation, git status checks

**Authentication:** Not applicable - local filesystem operations only

**Path Resolution:** Dynamic path rewriting during install (Claude: `~/.claude`, Copilot: `.github/skills/get-shit-done`)

**Version Management:** Update check hook (`hooks/gsd-check-update.js`), version display in statusline

**Context Engineering:** @reference includes, template-based generation, subagent isolation for fresh context

---

*Architecture analysis: 2026-01-19*
