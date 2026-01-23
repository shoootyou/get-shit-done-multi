---
name: get-shit-done
description: Structured spec-driven workflow for planning and executing software projects{{#isCopilot}} with GitHub Copilot CLI{{/isCopilot}}{{#isCodex}} with Codex CLI{{/isCodex}}{{#isClaude}} with Claude Code{{/isClaude}}.
---

# Get Shit Done (GSD) Skill{{#isCopilot}} for GitHub Copilot CLI{{/isCopilot}}{{#isCodex}} for Codex CLI{{/isCodex}}{{#isClaude}} for Claude Code{{/isClaude}}

## When to use
- Use this skill when the user asks for GSD or uses a `gsd:*` command.
- Use it for structured planning, phase execution, verification, or roadmap work.
{{#isCodex}}- Automatically loaded when user types `$get-shit-done`{{/isCodex}}

## How to run commands
{{#isCopilot}}GitHub Copilot CLI does not support custom slash commands. Treat inputs that start with `{{cmdPrefix}}` or `gsd:` as command invocations.

Commands are installed as individual skills in `{{skillsPath}}/`. Load the corresponding skill:

`{{skillsPath}}/gsd-<command>/SKILL.md`

Example:
- `gsd:new-project` -> `{{skillsPath}}/gsd-new-project/SKILL.md`
- `gsd:help` -> `{{skillsPath}}/gsd-help/SKILL.md`
{{/isCopilot}}{{#isCodex}}In Codex CLI, invoke this skill explicitly with:
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
Each command loads its definition from individual skills in `{{skillsPath}}/gsd-<command>/`.
{{/isCodex}}{{#isClaude}}Commands are invoked with `{{cmdPrefix}}<command>` syntax.

Commands are installed as individual skills in `{{skillsPath}}/`. Load the corresponding skill:

`{{skillsPath}}/gsd-<command>/SKILL.md`

Example:
- `{{cmdPrefix}}new-project` -> `{{skillsPath}}/gsd-new-project/SKILL.md`
- `{{cmdPrefix}}help` -> `{{skillsPath}}/gsd-help/SKILL.md`
{{/isClaude}}

## File references
Command files and workflows include `@path` references. These are mandatory context. Use the read tool to load each referenced file before proceeding.

## Tool mapping
- "Bash tool" → use the execute tool
- "Read/Write" → use read/edit tools
- "AskUserQuestion" → ask directly in chat and provide explicit numbered options
- "Task/subagent" → prefer a matching custom agent from `{{agentsPath}}` when available; otherwise adopt that role in-place
{{#isCodex}}

## Subagents as Skills
GSD subagents are installed as individual skills in `{{gsdPath}}/agents/`. Each agent has its own `SKILL.md` file with specialized instructions.

Available subagents:
- `gsd-planner` - Creates executable phase plans
- `gsd-executor` - Executes plans with atomic commits
- `gsd-verifier` - Verifies phase goal achievement
- `gsd-researcher` - Researches implementation approaches
- And 7 more (see agents directory)

When a command spawns a subagent, load the corresponding `SKILL.md` from the agents directory and adopt that role.
{{/isCodex}}

## Output expectations
Follow the XML or markdown formats defined in the command and template files exactly. These files are operational prompts, not documentation.

## Paths
Resources are installed under `{{gsdPath}}`. Individual skills are under `{{skillsPath}}/gsd-*/`. {{#isClaude}}Use those paths when command content references files.{{/isClaude}}{{#isCopilot}}Use those paths when command content references Claude-style paths.{{/isCopilot}}{{#isCodex}}Use those paths when command content references other files.

## Installation modes
- **Global**: Skills in global directory, invoke from any directory
- **Local**: Skills in project directory (project-specific), invoke only in this repo
{{/isCodex}}
