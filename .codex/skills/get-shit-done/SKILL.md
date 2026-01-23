---
name: get-shit-done
description: Structured spec-driven workflow for planning and executing software projects with Codex CLI.
---

# Get Shit Done (GSD) Skill for Codex CLI

## When to use
- Use this skill when the user asks for GSD or mentions project planning, phase execution, or roadmap work.
- Automatically loaded when user types `$get-shit-done`

## How to invoke
In Codex CLI, invoke this skill explicitly with:
```
$get-shit-done help
$get-shit-done new-project
$get-shit-done plan-phase 2
$get-shit-done execute-phase 2
```

The skill name is `get-shit-done` (NOT `gsd`). All commands are passed as arguments after the skill name.

## Available commands
- `help` - Show complete GSD command reference
- `new-project` - Initialize a new GSD project with research and roadmap
- `new-milestone` - Add a new milestone to existing project
- `plan-phase` - Create detailed plans for a phase
- `execute-phase` - Execute phase plans with atomic commits
- `verify-phase` - Verify phase goal achievement
- `progress` - Show project status and completion
- And 17 more commands (use `$get-shit-done help` for full list)

## Command definitions
Each command loads its definition from:
`.codex/skills/get-shit-done/commands/gsd/<command>.md`

These are operational prompts that define the command's behavior.

## File references
Command files and workflows include `@path` references. These are mandatory context. Use the read tool to load each referenced file before proceeding.

## Tool mapping
- "Bash tool" → use the execute tool
- "Read/Write" → use read/edit tools
- "AskUserQuestion" → ask directly in chat and provide explicit numbered options
- "Task/subagent" → prefer a matching custom agent from `.codex/skills/get-shit-done/agents` when available; otherwise adopt that role in-place

## Subagents as Skills
GSD subagents are installed as individual skills in `.codex/skills/get-shit-done/agents/`. Each agent has its own `SKILL.md` file with specialized instructions.

Available subagents:
- `gsd-planner` - Creates executable phase plans
- `gsd-executor` - Executes plans with atomic commits
- `gsd-verifier` - Verifies phase goal achievement
- `gsd-researcher` - Researches implementation approaches
- And 7 more (see agents directory)

When a command spawns a subagent, load the corresponding `SKILL.md` from the agents directory and adopt that role.

## Output expectations
Follow the XML or markdown formats defined in the command and template files exactly. These files are operational prompts, not documentation.

## Paths
This skill is installed under `.codex/skills/get-shit-done`. Use those paths when command content references other files.

## Installation modes
- **Global**: Skills in `~/.codex/skills/`, invoke from any directory
- **Local**: Skills in `.codex/skills/` (project-specific), invoke only in this repo
