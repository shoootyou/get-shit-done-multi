# Platform Specifics

Deep dive into platform-specific formats, frontmatter examples, and conventions for Claude Code, GitHub Copilot CLI,
and Codex CLI.

## Claude Code

### Overview

- **Target Directory:** `.claude/skills/`, `.claude/agents/`, `.claude/get-shit-done/`
- **Global Directory:** `~/.claude/skills/`, `~/.claude/agents/`, `~/.claude/get-shit-done/`
- **Command Prefix:** `/gsd-...`
- **File Extensions:** `.md` for both skills and agents
- **Frontmatter:** YAML with optional metadata block

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

---

## GitHub Copilot CLI

### Overview

- **Target Directory:** `.github/skills/`, `.github/agents/`, `.github/get-shit-done/`
- **Global Directory:** `~/.copilot/skills/`, `~/.copilot/agents/`, `~/.copilot/get-shit-done/`
- **Command Prefix:** `/gsd-...`
- **File Extensions:** `.md` for skills, `.agent.md` for agents
- **Frontmatter:** YAML with required metadata fields
- **Binary Detection:** `copilot` command

### Skill Frontmatter Example

```yaml
---
name: /gsd-plan-phase
description: Create execution plans for a phase
argument-hint: [phase-number]
allowed-tools: read, write, edit, execute, search
platform: copilot
generated: true
templateVersion: 2.0.0
---
```

**Supported Fields (Skills):**

- `name` (optional): Display name
- `description` (recommended): What the skill does
- `argument-hint` (optional): Expected arguments
- `allowed-tools` (optional): Comma-separated string (lowercase)
- `platform` (required): "copilot"
- `generated` (required): true
- `templateVersion` (required): Template version (e.g., "2.0.0")

**Tool Name Mappings:**

- `read` (not Read)
- `write` (not Write)
- `edit` (not Edit)
- `execute` (not Bash)
- `search` (not Grep)
- `agent` (not Task)

### Agent Frontmatter Example

```yaml
---
name: gsd-executor
description: Executes plans with atomic commits and deviation handling
tools: read, write, edit, execute
platform: copilot
target: github-copilot
---
```

**Supported Fields (Agents):**

- `name` (optional): Display name
- `description` (required): Purpose and capabilities
- `tools` (optional): Comma-separated string (lowercase)
- `platform` (required): "copilot"
- `target` (optional): vscode/github-copilot
- `infer` (optional): Auto-invoke (default: true)

**Note:** `skills` field NOT supported in Copilot (Claude-only feature)

See official docs: https://docs.github.com/en/copilot/reference/custom-agents-configuration

### Path References

```markdown
See @.github/get-shit-done/references/commit-guidelines.md for details.
```

### Template Source

Templates: `templates/skills/*/SKILL.md`, `templates/agents/*.agent.md`

---

## Codex CLI

### Overview

- **Target Directory:** `.codex/skills/`, `.codex/agents/`, `.codex/get-shit-done/`
- **Global Directory:** `~/.codex/skills/`, `~/.codex/agents/`, `~/.codex/get-shit-done/`
- **Command Prefix:** `$gsd-...` (NOT `/gsd-...`)
- **File Extensions:** `.md` for skills, `.agent.md` for agents
- **Frontmatter:** YAML with required metadata fields
- **Binary Detection:** `codex` command

### Skill Frontmatter Example

```yaml
---
name: $gsd-plan-phase
description: Create execution plans for a phase
argument-hint: [phase-number]
allowed-tools: read, write, edit, execute, search
platform: codex
generated: true
templateVersion: 2.0.0
---
```

**Key Difference from Copilot:**

- Command prefix is `$gsd-` (not `/gsd-`)
- All skill content replaces `/gsd-` with `$gsd-`
- Platform field is "codex" (not "copilot")

**Tool Name Mappings:** Same as Copilot (lowercase, execute, search, agent)

### Agent Frontmatter Example

```yaml
---
name: gsd-executor
description: Executes plans with atomic commits and deviation handling
tools: read, write, edit, execute
platform: codex
---
```

**Supported Fields:** Same as Copilot (see above)

### Path References

```markdown
See @.codex/get-shit-done/references/commit-guidelines.md for details.
```

### Template Source

Templates: `templates/skills/*/SKILL.md`, `templates/agents/*.agent.md`

---

## Next Steps

- See [Platform Comparison](platform-comparison.md) for quick reference tables
- See [Platform Migration](platform-migration.md) for switching platforms
- See [Architecture](architecture.md) for adapter pattern details
