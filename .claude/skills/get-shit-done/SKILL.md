---
name: get-shit-done
description: Structured spec-driven workflow for planning and executing software projects with Claude Code.
---

# Get Shit Done (GSD) Skill for Claude Code

## When to use
- Use this skill when the user asks for GSD or uses a `/gsd-*` command.
- Use it for structured planning, phase execution, verification, or roadmap work.


## How to run commands
Commands are invoked with `/gsd-<command>` syntax.

Commands are installed as individual skills in `/Users/rodolfo/Library/Application Support/Claude/skills/`. Load the corresponding skill:

`/Users/rodolfo/Library/Application Support/Claude/skills/gsd-<command>/SKILL.md`

Example:
- `/gsd-new-project` -> `/Users/rodolfo/Library/Application Support/Claude/skills/gsd-new-project/SKILL.md`
- `/gsd-help` -> `/Users/rodolfo/Library/Application Support/Claude/skills/gsd-help/SKILL.md`


## File references
Command files and workflows include `@path` references. These are mandatory context. Use the read tool to load each referenced file before proceeding.

## Tool mapping
- "Bash tool" → use the execute tool
- "Read/Write" → use read/edit tools
- "AskUserQuestion" → ask directly in chat and provide explicit numbered options
- "Task/subagent" → prefer a matching custom agent from `/Users/rodolfo/Library/Application Support/Claude/agents` when available; otherwise adopt that role in-place


## Output expectations
Follow the XML or markdown formats defined in the command and template files exactly. These files are operational prompts, not documentation.

## Paths
Resources are installed under `/Users/rodolfo/Library/Application Support/Claude/get-shit-done`. Individual skills are under `/Users/rodolfo/Library/Application Support/Claude/skills/gsd-*/`. Use those paths when command content references files.
