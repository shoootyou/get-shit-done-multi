---
name: get-shit-done
description: Structured spec-driven workflow for planning and executing software projects with GitHub Copilot CLI.
---

# Get Shit Done (GSD) Skill for GitHub Copilot CLI

## When to use
- Use this skill when the user asks for GSD or uses a `/gsd-*` or `gsd-*` command.
- Use it for structured planning, phase execution, verification, or roadmap work.


## How to run commands
GitHub Copilot CLI does not support custom slash commands. Treat inputs that start with `/gsd-` or `gsd-` as command invocations.

Commands are installed as individual skills in `/Users/rodolfo/croonix-github/get-shit-done/.github/copilot/skills/`. Load the corresponding skill:

`/Users/rodolfo/croonix-github/get-shit-done/.github/copilot/skills/gsd-<command>/SKILL.md`

Example:
- `gsd-new-project` -> `/Users/rodolfo/croonix-github/get-shit-done/.github/copilot/skills/gsd-new-project/SKILL.md`
- `gsd-help` -> `/Users/rodolfo/croonix-github/get-shit-done/.github/copilot/skills/gsd-help/SKILL.md`


## File references
Command files and workflows include `@path` references. These are mandatory context. Use the read tool to load each referenced file before proceeding.

## Tool mapping
- "Bash tool" → use the execute tool
- "Read/Write" → use read/edit tools
- "AskUserQuestion" → ask directly in chat and provide explicit numbered options
- "Task/subagent" → prefer a matching custom agent from `/Users/rodolfo/croonix-github/get-shit-done/.github/copilot/agents` when available; otherwise adopt that role in-place


## Output expectations
Follow the XML or markdown formats defined in the command and template files exactly. These files are operational prompts, not documentation.

## Paths
Resources are installed under `/Users/rodolfo/croonix-github/get-shit-done/.github/get-shit-done`. Individual skills are under `/Users/rodolfo/croonix-github/get-shit-done/.github/copilot/skills/gsd-*/`. Use those paths when command content references Claude-style paths.
