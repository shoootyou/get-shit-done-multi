---
name: get-shit-done
description: Structured spec-driven workflow for planning and executing software projects with Codex CLI.
---

# Get Shit Done (GSD) Skill for Codex CLI

## When to use
- Use this skill when the user asks for GSD or uses a `gsd` command.
- Use it for structured planning, phase execution, verification, or roadmap work.

## How to run commands
Codex CLI supports custom prompts as slash commands. GSD commands are installed in `~/.codex/prompts/gsd/` and invoked with the `/gsd/` prefix.

Available commands:
- `/gsd/help` - Show complete GSD command reference
- `/gsd/new-project` - Initialize a new GSD project with research and roadmap
- `/gsd/new-milestone` - Add a new milestone to existing project
- `/gsd/plan-phase` - Create detailed plans for a phase
- `/gsd/execute-phase` - Execute phase plans with atomic commits
- `/gsd/verify-phase` - Verify phase goal achievement
- And 18 more commands (use `/gsd/help` for full list)

Each command loads its definition from:
`.codex/skills/get-shit-done/commands/gsd/<command>.md`

## File references
Command files and workflows include `@path` references. These are mandatory context. Use the read tool to load each referenced file before proceeding.

## Tool mapping
- "Bash tool" -> use the execute tool
- "Read/Write" -> use read/edit tools
- "AskUserQuestion" -> ask directly in chat and provide explicit numbered options
- "Task/subagent" -> prefer a matching custom agent from `.codex/skills/get-shit-done/agents` when available; otherwise adopt that role in-place

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
This skill is installed under `.codex/skills/get-shit-done`. Use those paths when command content references `~/.claude`.

## Global vs Local
- **Global installation**: Skills in `~/.codex/skills/`, prompts in `~/.codex/prompts/gsd/`
- **Local installation**: Skills in `.codex/skills/` (project-specific), prompts embedded in skills
