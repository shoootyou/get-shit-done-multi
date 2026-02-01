# Platform Specifics

Deep dive into platform-specific formats, frontmatter examples, and conventions for Claude Code, GitHub Copilot CLI,
and Codex CLI.

## Claude Code

### Overview

- **Target Directory:** `.claude/skills/`, `.claude/agents/`, `.claude/get-shit-done/`
- **Global Directory:** `~/.claude/skills/`, `~/.claude/agents/`, `~/.claude/get-shit-done/`
- **Instructions File:** `CLAUDE.md` (local: project root, global: `~/.claude/CLAUDE.md`)
- **Command Prefix:** `/gsd-...`
- **File Extensions:** `.md` for both skills and agents
- **Frontmatter:** YAML with optional metadata block

### Historical Context: Commands → Skills Migration

Claude deprecated the `.claude/commands/` directory in favor of `.claude/skills/` in 2025. According to the
[official documentation](https://code.claude.com/docs/en/slash-commands#control-who-invokes-a-skill):

> "Custom slash commands have been merged into skills. A file at `.claude/commands/review.md` and a skill at
> `.claude/skills/review/SKILL.md` both create `/review` and work the same way. Your existing `.claude/commands/`
> files keep working. Skills add optional features: a directory for supporting files, frontmatter to control whether
> you or Claude invokes them, and the ability for Claude to load them automatically when relevant."

**Key differences:**

- **Commands (legacy):** Single `.md` file, basic frontmatter, always user-invoked
- **Skills (current):** Directory-based, rich frontmatter with `user-invocable` control, auto-loading support

GSD Multi uses the skills system exclusively. If you see references to "commands" in older documentation, these now
refer to skills.

### Skill Frontmatter Example

```yaml
---
name: /gsd-plan-phase
description: Create execution plans for a phase
argument-hint: [phase-number]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
user-invocable: true
---
```

**Official Supported Fields (Skills):**

- `name` (optional): Display name
- `description` (recommended): What the skill does
- `argument-hint` (optional): Expected arguments (e.g., `[phase-number]`)
- `allowed-tools` (optional): Comma-separated string
- `user-invocable` (optional): Show in `/` menu (default: true)
- `disable-model-invocation` (optional): Prevent auto-loading
- `model` (optional): Model to use (sonnet/opus/haiku)
- `context` (optional): Set to `fork` for subagent
- `agent` (optional): Subagent type when context is fork
- `hooks` (optional): Lifecycle hooks

**Official Tool Names:**
Read, Write, Edit, Bash, Grep, Glob, Task, AskUserQuestion, WebFetch, WebSearch, Skill, LSP, etc.

See official docs: https://code.claude.com/docs/en/slash-commands#frontmatter-reference

### Agent Frontmatter Example

```yaml
---
name: gsd-executor
description: Executes plans with atomic commits and deviation handling
tools: Read, Write, Edit, Bash
skills: gsd-execute-phase, gsd-commit-changes
model: sonnet
permissionMode: default
---
```

**Official Supported Fields (Agents):**

- `name` (required): Unique identifier
- `description` (required): When to delegate to subagent
- `tools` (optional): Comma-separated string
- `disallowedTools` (optional): Tools to deny
- `skills` (optional): Skills to pre-load at startup
- `model` (optional): sonnet/opus/haiku/inherit
- `permissionMode` (optional): default/acceptEdits/dontAsk/bypassPermissions/plan
- `hooks` (optional): Lifecycle hooks

See official docs: https://code.claude.com/docs/en/sub-agents

### Path References

Skills and agents reference shared resources:

```markdown
See @.claude/get-shit-done/references/commit-guidelines.md for details.
```

### Template Source

Templates: `templates/skills/*/SKILL.md`, `templates/agents/*.agent.md`

## GitHub Copilot CLI

### Overview

- **Target Directory:** `.github/skills/`, `.github/agents/`, `.github/get-shit-done/`
- **Global Directory:** `~/.copilot/skills/`, `~/.copilot/agents/`, `~/.copilot/get-shit-done/`
- **Instructions File:** `copilot-instructions.md` (local: `.github/copilot-instructions.md`, global: `~/.copilot/copilot-instructions.md`)
- **Command Prefix:** `/gsd-...`
- **File Extensions:** `.md` for skills, `.agent.md` for agents
- **Binary Detection:** `copilot` command

**Key difference from Claude:** Uses standard [Agent Skills format](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills) (open standard shared across platforms)

### Skill Frontmatter Example

```yaml
---
name: gsd-plan-phase
description: Create execution plans for a phase
argument-hint: [phase-number]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---
```

**Supported Fields (Skills):**

Same as Claude Code - uses the [Agent Skills open standard](https://github.com/agentskills/agentskills):

- `name` (required): Unique identifier (lowercase, hyphenated)
- `description` (required): What the skill does and when Copilot should use it
- `argument-hint` (optional): Expected arguments
- `allowed-tools` (optional): Comma-separated string
- `license` (optional): License information

**Tool Names:**

Copilot supports [tool aliases](https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases) (case insensitive):
- `Read` or `read` → File reading
- `Edit`, `Write`, `MultiEdit` → File editing  
- `Bash`, `execute`, `shell`, `powershell` → Shell execution
- `Grep`, `Glob`, `search` → Search operations
- `Task`, `agent`, `custom-agent` → Subagent delegation

### Agent Frontmatter Example

```yaml
---
name: gsd-executor
description: Executes plans with atomic commits and deviation handling
tools: Read, Write, Edit, Bash
---
```

**Supported Fields (Agents):**

Based on [GitHub Copilot custom agents configuration](https://docs.github.com/en/copilot/reference/custom-agents-configuration#yaml-frontmatter-properties):

- `name` (required): Unique identifier
- `description` (required): When to delegate to this agent
- `tools` (optional): Array of tool names or aliases (e.g., `["read", "edit", "search"]`)
  - Use `["*"]` to enable all tools
  - Use `[]` to disable all tools
- `mcp-servers` (optional, org/enterprise only): MCP server configuration

See official docs:
- Skills: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
- Agents: https://docs.github.com/en/copilot/reference/custom-agents-configuration

### Path References

```markdown
See @.github/get-shit-done/references/commit-guidelines.md for details.
```

### Template Source

Templates: `templates/skills/*/SKILL.md`, `templates/agents/*.agent.md`

## Codex CLI

### Overview

- **Target Directory:** `.codex/skills/`, `.codex/agents/`, `.codex/get-shit-done/`
- **Global Directory:** `~/.codex/skills/`, `~/.codex/agents/`, `~/.codex/get-shit-done/`
- **Instructions File:** `AGENTS.md` (local: project root, global: `~/.codex/AGENTS.md`)
- **Command Prefix:** `$gsd-...` (NOT `/gsd-...`)
- **File Extensions:** `.md` for skills, `.agent.md` for agents
- **Binary Detection:** `codex` command

**Key difference from Claude/Copilot:** Command prefix is `$` instead of `/`

### Skill Frontmatter Example

```yaml
---
name: gsd-plan-phase
description: Create execution plans for a phase
argument-hint: [phase-number]
allowed-tools: Read, Write, Edit, Bash, Grep, Glob
---
```

**Supported Fields (Skills):**

Same as Claude Code and GitHub Copilot - uses the [Agent Skills open standard](https://developers.openai.com/codex/skills/):

- `name` (required): Unique identifier (lowercase, hyphenated)
- `description` (required): What the skill does and when to use it
- `argument-hint` (optional): Expected arguments
- `allowed-tools` (optional): Comma-separated string
- `license` (optional): License information

**Tool Names:** Same as Copilot (case insensitive aliases supported)

### Agent Frontmatter Example

```yaml
---
name: gsd-executor
description: Executes plans with atomic commits and deviation handling
tools: Read, Write, Edit, Bash
---
```

**Supported Fields (Agents):** Same format as Copilot

### Path References

```markdown
See @.codex/get-shit-done/references/commit-guidelines.md for details.
```

### Template Source

Templates: `templates/skills/*/SKILL.md`, `templates/agents/*.agent.md`

## Next Steps

- See [Platform Comparison](platform-comparison.md) for quick reference tables
- See [Platform Migration](platform-migration.md) for switching platforms
- See [Architecture](architecture.md) for adapter pattern details
