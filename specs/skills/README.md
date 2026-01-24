# GSD Skills Specification

This directory contains skill specifications for the GSD (Get Shit Done) command system. Skills define the capabilities available to Claude, GitHub Copilot, and VS Code Codex across all three platforms.

## Overview

**Purpose:** Define GSD commands as platform-agnostic skill specifications that automatically adapt to each platform's capabilities.

**Architecture:** This system reuses the proven template architecture from `/specs/agents/` (208 passing tests). The same gray-matter parsing, Mustache conditionals, and tool mapping that works for agents now works for skills.

**Relationship to legacy:** Legacy commands live in `/commands/gsd/*.md` with `gsd:` prefix. New specs use `gsd-` prefix and live in `/specs/skills/{skill-name}/SKILL.md`. During transition, both systems coexist. The spec system will eventually replace legacy commands.

## Why Spec-Based Skills?

**Problem solved:**

Before v1.9.1, GSD maintained 29 command files per platform manually:
- `commands/gsd/*.md` for legacy format
- `.claude/commands/*.md` for Claude Code
- `.github/copilot/commands/*.md` for GitHub Copilot CLI
- `.codex/skills/*.md` for Codex CLI

**Changes = 4× work:** Any update required editing 4 files manually.

**Platform drift:** Subtle differences crept in between platforms over time.

**Benefits of spec system:**

1. **Single source of truth** - One spec generates all platforms
2. **Zero drift** - Generated files guaranteed identical behavior
3. **Automatic adaptation** - Tools map to platform capabilities
4. **Proven foundation** - Reuses template system from agents (208 passing tests)
5. **Easy maintenance** - Update spec once, regenerate all platforms

**Migration impact:**

v1.9.1 removes legacy system completely. Use spec-based skills exclusively.

## Directory Structure

Skills follow a **folder-per-skill** structure that matches the Claude standard:

```
/specs/skills/
├── README.md                    # This file - schema documentation
├── gsd-help/
│   └── SKILL.md                # Skill specification
├── gsd-new-project/
│   └── SKILL.md
├── gsd-plan-phase/
│   └── SKILL.md
└── gsd-execute-phase/
    └── SKILL.md
```

**Naming conventions:**

- **Folder name** MUST match skill name exactly: `gsd-help` folder for `name: gsd-help`
- **File name** MUST be `SKILL.md` (all caps)
- **Skill name** follows pattern: `gsd-{action}` or `gsd-{action}-{object}`

**Why folder-per-skill:**

- Enables future expansion (templates, assets, tests per skill)
- Follows Claude's established pattern
- Clear ownership and isolation
- Easy to add/remove skills

## Canonical Frontmatter Schema

Every `SKILL.md` file MUST have YAML frontmatter with these fields:

### Required Fields

```yaml
name: string             # Skill identifier (gsd-{action})
description: string      # One-line description (shown in help)
tools: array            # Platform-specific tools array
```

### Optional Fields

```yaml
argument-hint: string   # Shown in UI: /gsd-command [hint]
allowed-tools: array    # Legacy field, prefer 'tools'
metadata: object        # Auto-generated, don't author
```

### Field Specifications

#### `name` (required)

- **Type:** String
- **Format:** `gsd-{action}` or `gsd-{action}-{object}`
- **Examples:** `gsd-help`, `gsd-new-project`, `gsd-plan-phase`
- **Validation:** Must match parent folder name
- **Constraints:** Lowercase, hyphens only, starts with `gsd-`

#### `description` (required)

- **Type:** String  
- **Format:** One-line description (max 100 characters)
- **Examples:** 
  - `"Show available GSD commands and usage guide"`
  - `"Initialize a new project with deep context gathering"`
  - `"Create detailed execution plan for a phase"`
- **Usage:** Shown in help listings and command palette
- **Constraints:** No newlines, concise, action-oriented

#### `tools` (required)

- **Type:** Array of strings
- **Format:** Platform-specific tool names
- **Platform adaptation:** Uses Mustache conditionals (see Platform Conditionals section)
- **Examples:**
  ```yaml
  # Claude platform
  tools: [Read, Bash, Write, Task]
  
  # GitHub Copilot platform  
  tools: [file_read, shell_execute, file_write]
  
  # With conditionals
  tools:
    {{#isClaude}}
    - Read
    - Bash
    - Write
    {{/isClaude}}
    {{#isCopilot}}
    - file_read
    - shell_execute
    - file_write
    {{/isCopilot}}
  ```
- **Available tools by platform:** See Tool Declarations section

#### `argument-hint` (optional)

- **Type:** String
- **Format:** Hint text shown in brackets
- **Examples:**
  - `"[issue description]"` → `/gsd-debug [issue description]`
  - `"<phase-number>"` → `/gsd-plan-phase <phase-number>`
- **Usage:** UI affordance for commands that take arguments
- **Constraints:** Keep under 30 characters

#### `metadata` (auto-generated)

- **Type:** Object
- **DO NOT AUTHOR:** Generated automatically during platform output
- **Structure:**
  ```yaml
  metadata:
    platform: "claude" | "copilot" | "codex"
    generated: "2026-01-22T10:30:00Z"
    gsdVersion: "1.2.0"
  ```

### Validation Rules

**Schema constraints enforced by template system:**

1. `name` field must exist and match folder name
2. `description` field must exist and be non-empty
3. `tools` array must exist (can be empty for info-only commands)
4. Frontmatter must be valid YAML
5. Frontmatter must be bounded by `---` markers
6. File must be named `SKILL.md` exactly

**Will fail validation:**
- Missing required fields
- Name mismatch (file in `gsd-help/` with `name: gsd-other`)
- Invalid YAML syntax
- Platform conditionals in body (must be in frontmatter)

## Platform Conditionals

Skills use **Mustache conditionals** to adapt frontmatter for each platform. The same spec generates Claude, Copilot, and Codex versions automatically.

### Conditional Syntax

```yaml
{{#isClaude}}
# Claude-specific content
{{/isClaude}}

{{#isCopilot}}
# Copilot-specific content
{{/isCopilot}}

{{#isCodex}}
# Codex-specific content
{{/isCodex}}
```

### Available Conditionals

| Conditional     | When True                    | Use Case                           |
|----------------|------------------------------|-------------------------------------|
| `{{#isClaude}}` | Platform is Claude Code      | Claude-specific tools, references   |
| `{{#isCopilot}}`| Platform is GitHub Copilot   | Copilot-specific tools, syntax      |
| `{{#isCodex}}`  | Platform is VS Code Codex    | Codex-specific tools, capabilities  |

### Conditional Placement

**✅ ALLOWED - In frontmatter:**
```yaml
---
name: gsd-help
description: Show help
tools:
  {{#isClaude}}
  - Read
  - Bash
  {{/isClaude}}
  {{#isCopilot}}
  - file_read
  - shell_execute
  {{/isCopilot}}
---
```

**❌ NOT ALLOWED - In body:**
Body content should be platform-agnostic. If you need platform-specific instructions, use separate reference files.

### Tool Declaration Patterns

Common patterns for tool arrays:

**Pattern 1: Simple list (same tools across platforms)**
```yaml
tools: [Read, Write, Bash]
```

**Pattern 2: Platform-specific (most common)**
```yaml
tools:
  {{#isClaude}}
  - Read
  - Bash
  - Write
  - Task
  {{/isClaude}}
  {{#isCopilot}}
  - file_read
  - shell_execute
  - file_write
  - spawn_agent
  {{/isCopilot}}
```

**Pattern 3: Conditional tool (only on some platforms)**
```yaml
tools:
  - Read
  - Write
  {{#isClaude}}
  - Task  # Only Claude has Task tool
  {{/isClaude}}
```

### Syntax Examples

**Simple conditional:**
```yaml
tools:
  {{#isClaude}}
  - Read
  - Bash
  {{/isClaude}}
  {{#isCopilot}}
  - file_read
  - shell_execute
  {{/isCopilot}}
  {{#isCodex}}
  - fs_read
  - terminal_run
  {{/isCodex}}
```

**Conditional with shared content:**
```yaml
description: "Create execution plan for phase"
{{#isClaude}}
argument-hint: "<phase-number>"
{{/isClaude}}
{{#isCopilot}}
argument-hint: "[phase number]"
{{/isCopilot}}
{{#isCodex}}
argument-hint: "<phase-number>"
{{/isCodex}}
```

### Rules

1. **Conditionals ONLY in frontmatter**, NEVER in body
2. **Body must be platform-agnostic** markdown
3. **Always provide all 3 platforms** (Claude, Copilot, Codex)
4. **Conditionals cannot be nested**

## Tool Declarations

Tool names vary by platform. Use conditionals to map correctly.

### Claude Tools

| Tool Name         | Purpose                                    |
|-------------------|--------------------------------------------|
| `Read`            | Read files and directories                 |
| `Bash`            | Execute shell commands                     |
| `Write`           | Create/edit files                          |
| `Task`            | Spawn subagent with isolated context       |
| `AskUserQuestion` | Prompt user for input                      |

### GitHub Copilot Tools

| Tool Name          | Purpose                                   |
|--------------------|-------------------------------------------|
| `file_read`        | Read files and directories                |
| `shell_execute`    | Execute shell commands                    |
| `file_write`       | Create/edit files                         |
| `spawn_agent`      | Spawn subagent with isolated context      |
| `prompt_user`      | Prompt user for input                     |

### VS Code Codex Tools

| Tool Name          | Purpose                                   |
|--------------------|-------------------------------------------|
| `fs_read`          | Read files and directories                |
| `terminal_run`     | Execute shell commands                    |
| `fs_write`         | Create/edit files                         |
| `agent_spawn`      | Spawn subagent with isolated context      |
| `user_prompt`      | Prompt user for input                     |

### Tool Mapping Reference

Quick reference for cross-platform tool declarations:

```yaml
# File operations
{{#isClaude}}Read{{/isClaude}}{{#isCopilot}}file_read{{/isCopilot}}{{#isCodex}}fs_read{{/isCodex}}

# Shell commands
{{#isClaude}}Bash{{/isClaude}}{{#isCopilot}}shell_execute{{/isCopilot}}{{#isCodex}}terminal_run{{/isCodex}}

# File creation/editing
{{#isClaude}}Write{{/isClaude}}{{#isCopilot}}file_write{{/isCopilot}}{{#isCodex}}fs_write{{/isCodex}}

# Subagent spawning
{{#isClaude}}Task{{/isClaude}}{{#isCopilot}}spawn_agent{{/isCopilot}}{{#isCodex}}agent_spawn{{/isCodex}}

# User interaction
{{#isClaude}}AskUserQuestion{{/isClaude}}{{#isCopilot}}prompt_user{{/isCopilot}}{{#isCodex}}user_prompt{{/isCodex}}
```

## Tool Reference by Platform

Skills declare required tools in frontmatter. Tools differ by platform.

### Claude Code Tools

| Tool | Purpose | Common Use |
|------|---------|------------|
| `Read` | View files and directories | Reading context files, checking structure |
| `Bash` | Execute shell commands | Running tests, git operations, file operations |
| `Write` | Create/edit files | Creating plans, updating state, writing code |
| `Task` | Spawn subagents | Orchestrators spawning specialized agents |
| `Edit` | Batch file edits | Multiple changes to same file |

### GitHub Copilot CLI Tools

| Tool | Purpose | Equivalent |
|------|---------|------------|
| `file_read` | Read file contents | Claude: Read |
| `file_write` | Create/modify files | Claude: Write |
| `shell_execute` | Run shell commands | Claude: Bash |
| `directory_list` | List directory contents | Claude: Read |
| `search_code` | Search codebase | Claude: grep via Bash |

### Codex CLI Tools

| Tool | Purpose | Equivalent |
|------|---------|------------|
| `fs_read` | Read file contents | Claude: Read |
| `fs_write` | Write file contents | Claude: Write |
| `terminal_run` | Execute commands | Claude: Bash |
| `fs_list` | List directories | Claude: Read |
| `search_grep` | Search files | Claude: grep via Bash |

### Tool Mapping

Template system automatically maps tools during generation:
- `Read` → `file_read` (Copilot) → `fs_read` (Codex)
- `Bash` → `shell_execute` (Copilot) → `terminal_run` (Codex)
- `Write` → `file_write` (Copilot) → `fs_write` (Codex)
- `Task` → `spawn_agent` (Copilot) → `agent_spawn` (Codex)

**Do NOT manually map tools in specs.** Use conditionals to declare platform-native names.

## Metadata Template

Metadata is **auto-generated** during platform output. DO NOT author these fields in skill specs.

### Generated Structure

```yaml
metadata:
  platform: "claude"              # Platform identifier
  generated: "2026-01-22T10:30:00Z"  # ISO 8601 timestamp
  gsdVersion: "1.2.0"             # GSD system version
```

### Field Details

- **platform**: `"claude"` | `"copilot"` | `"codex"` - Target platform
- **generated**: ISO 8601 timestamp when spec was rendered
- **gsdVersion**: Semantic version of GSD system that generated output

### Usage

Metadata enables:
- Version tracking (which GSD version generated this?)
- Platform detection (which platform is this for?)
- Cache invalidation (when was this generated?)
- Debugging (trace output back to source spec)

## Command Name Mapping

Complete mapping from legacy command format to new spec format.

### Naming Convention

| Format        | Pattern       | Location                        | Example            |
|---------------|---------------|---------------------------------|--------------------|
| **Legacy**    | `gsd:action`  | `/commands/gsd/action.md`       | `gsd:help`         |
| **Spec**      | `gsd-action`  | `/specs/skills/gsd-action/`     | `gsd-help`         |

### Complete Mapping Table

All 29 legacy commands with their spec equivalents and complexity ratings:

| Legacy Name                | Spec Name               | Folder                    | Complexity | Description                                      |
|----------------------------|-------------------------|---------------------------|------------|--------------------------------------------------|
| `gsd:add-phase`            | `gsd-add-phase`         | `gsd-add-phase/`          | MEDIUM     | Add phase to existing roadmap                    |
| `gsd:add-todo`             | `gsd-add-todo`          | `gsd-add-todo/`           | LOW        | Add item to project TODO list                    |
| `gsd:archive-milestone`    | `gsd-archive-milestone` | `gsd-archive-milestone/`  | LOW        | Archive completed milestone                      |
| `gsd:audit-milestone`      | `gsd-audit-milestone`   | `gsd-audit-milestone/`    | MEDIUM     | Analyze milestone completeness                   |
| `gsd:check-todos`          | `gsd-check-todos`       | `gsd-check-todos/`        | LOW        | Show pending TODO items                          |
| `gsd:complete-milestone`   | `gsd-complete-milestone`| `gsd-complete-milestone/` | MEDIUM     | Mark milestone complete with verification        |
| `gsd:debug`                | `gsd-debug`             | `gsd-debug/`              | HIGH       | Systematic debugging with persistent state       |
| `gsd:discuss-phase`        | `gsd-discuss-phase`     | `gsd-discuss-phase/`      | LOW        | Discuss phase approach before planning           |
| `gsd:execute-phase`        | `gsd-execute-phase`     | `gsd-execute-phase/`      | HIGH       | Execute phase plans with orchestration           |
| `gsd:help`                 | `gsd-help`              | `gsd-help/`               | LOW        | Show available commands and usage                |
| `gsd:insert-phase`         | `gsd-insert-phase`      | `gsd-insert-phase/`       | MEDIUM     | Insert phase between existing phases             |
| `gsd:invoke-agent`         | `gsd-invoke-agent`      | `gsd-invoke-agent/`       | MEDIUM     | Manually invoke specific agent                   |
| `gsd:list-milestones`      | `gsd-list-milestones`   | `gsd-list-milestones/`    | LOW        | List all project milestones                      |
| `gsd:list-phase-assumptions`| `gsd-list-phase-assumptions`| `gsd-list-phase-assumptions/`| LOW   | Show assumptions for phase                       |
| `gsd:map-codebase`         | `gsd-map-codebase`      | `gsd-map-codebase/`       | MEDIUM     | Generate architectural map of codebase           |
| `gsd:new-milestone`        | `gsd-new-milestone`     | `gsd-new-milestone/`      | HIGH       | Create new milestone with planning               |
| `gsd:new-project`          | `gsd-new-project`       | `gsd-new-project/`        | HIGH       | Initialize project with research and roadmap     |
| `gsd:pause-work`           | `gsd-pause-work`        | `gsd-pause-work/`         | LOW        | Pause work and save state                        |
| `gsd:plan-milestone-gaps`  | `gsd-plan-milestone-gaps`| `gsd-plan-milestone-gaps/`| MEDIUM    | Identify and plan for missing milestones         |
| `gsd:plan-phase`           | `gsd-plan-phase`        | `gsd-plan-phase/`         | HIGH       | Create detailed phase execution plan             |
| `gsd:progress`             | `gsd-progress`          | `gsd-progress/`           | LOW        | Show current project progress                    |
| `gsd:remove-phase`         | `gsd-remove-phase`      | `gsd-remove-phase/`       | MEDIUM     | Remove phase from roadmap                        |
| `gsd:research-phase`       | `gsd-research-phase`    | `gsd-research-phase/`     | MEDIUM     | Research domain before planning                  |
| `gsd:restore-milestone`    | `gsd-restore-milestone` | `gsd-restore-milestone/`  | LOW        | Restore archived milestone                       |
| `gsd:resume-work`          | `gsd-resume-work`       | `gsd-resume-work/`        | LOW        | Resume from paused state                         |
| `gsd:update`               | `gsd-update`            | `gsd-update/`             | LOW        | Update GSD system                                |
| `gsd:verify-installation`  | `gsd-verify-installation`| `gsd-verify-installation/`| LOW       | Check GSD installation                           |
| `gsd:verify-work`          | `gsd-verify-work`       | `gsd-verify-work/`        | MEDIUM     | Verify completed work quality                    |
| `gsd:whats-new`            | `gsd-whats-new`         | `gsd-whats-new/`          | LOW        | Show changelog since installed version           |

### Complexity Ratings

**LOW** - No orchestration, simple file operations or display:
- Read/display content (help, progress, list commands)
- Simple file operations (add-todo, pause-work)
- No subagent spawning

**MEDIUM** - Moderate orchestration (1-2 agent spawns):
- Single subagent for focused task (plan-phase, research-phase)
- Moderate analysis (audit-milestone, verify-work)
- File manipulation with validation (add-phase, remove-phase)

**HIGH** - Complex orchestration (3+ agent spawns or parallel operations):
- Multiple subagents coordinated (execute-phase, new-project)
- Persistent state across sessions (debug)
- Complex multi-step workflows (new-milestone)

## Examples

### Example 1: Simple Command (Low Complexity)

**File:** `/specs/skills/gsd-help/SKILL.md`

```yaml
---
name: gsd-help
description: Show available GSD commands and usage guide
tools:
  {{#isClaude}}
  - Read
  {{/isClaude}}
  {{#isCopilot}}
  - file_read
  {{/isCopilot}}
  {{#isCodex}}
  - fs_read
  {{/isCodex}}
---

<objective>
Display the complete GSD command reference.

Output ONLY the reference content. Do NOT add:
- Project-specific analysis
- Git status or file context
- Next-step suggestions
</objective>

<reference>
# GSD Command Reference

[Help content here...]
</reference>
```

### Example 2: Medium Complexity Command

**File:** `/specs/skills/gsd-plan-phase/SKILL.md`

```yaml
---
name: gsd-plan-phase
description: Create detailed execution plan for a phase
argument-hint: <phase-number>
tools:
  {{#isClaude}}
  - Read
  - Write
  - Bash
  - Task
  - AskUserQuestion
  {{/isClaude}}
  {{#isCopilot}}
  - file_read
  - file_write
  - shell_execute
  - spawn_agent
  - prompt_user
  {{/isCopilot}}
---

<objective>
Create detailed, executable plan for specified phase.

Spawns gsd-planner agent with isolated context for deep planning.
</objective>

<execution_context>
@{{gsdPath}}/references/planning-principles.md
@{{gsdPath}}/templates/plan.md
</execution_context>

<process>
[Planning process steps...]
</process>
```

### Example 3: High Complexity Command

**File:** `/specs/skills/gsd-new-project/SKILL.md`

```yaml
---
name: gsd-new-project
description: Initialize a new project with deep context gathering and PROJECT.md
tools:
  {{#isClaude}}
  - Read
  - Bash
  - Write
  - Task
  - AskUserQuestion
  {{/isClaude}}
  {{#isCopilot}}
  - file_read
  - shell_execute
  - file_write
  - spawn_agent
  - prompt_user
  {{/isCopilot}}
---

<objective>
Initialize new project through unified flow:
questioning → research (optional) → requirements → roadmap

Creates:
- .planning/PROJECT.md — project context
- .planning/config.json — workflow preferences
- .planning/research/ — domain research (optional)
- .planning/REQUIREMENTS.md — scoped requirements
- .planning/ROADMAP.md — phase structure
- .planning/STATE.md — project memory

After this command: Run /gsd-plan-phase 1 to start execution.
</objective>

<execution_context>
@{{gsdPath}}/references/questioning.md
@{{gsdPath}}/references/ui-brand.md
@{{gsdPath}}/templates/project.md
@{{gsdPath}}/templates/requirements.md
</execution_context>

<process>
[Multi-phase initialization process...]
</process>
```

## Migration Guide

### For New Skills

1. Create folder: `mkdir -p specs/skills/gsd-{action}`
2. Create spec: `specs/skills/gsd-{action}/SKILL.md`
3. Add frontmatter with required fields (name, description, tools)
4. Add platform conditionals for tools if needed
5. Write skill body (objective, context, process)
6. Test with template system

### For Existing Commands

Legacy commands in `/commands/gsd/*.md` will gradually migrate to spec format:

1. Create corresponding folder in `/specs/skills/`
2. Convert `name: gsd:action` → `name: gsd-action`
3. Add tool conditionals for multi-platform support
4. Move to `SKILL.md` in folder
5. Legacy command remains until spec is validated

**During transition:** Both systems coexist. Legacy commands work, new specs being developed.

## Validation

Skills are validated by the template system during output generation:

### Automatic Validation

- Frontmatter YAML syntax
- Required fields present (name, description, tools)
- Name matches folder name
- Platform conditionals valid Mustache syntax
- File named `SKILL.md`

### Manual Validation

Run template system validator:

```bash
npm test -- specs/skills
```

### Common Validation Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "Missing required field: name" | No name in frontmatter | Add `name: gsd-{action}` |
| "Name mismatch" | name doesn't match folder | Rename folder or update name field |
| "Invalid YAML" | Syntax error in frontmatter | Check YAML syntax (colons, indentation) |
| "File must be SKILL.md" | Wrong filename | Rename to SKILL.md (all caps) |
| "Invalid tool name" | Tool not in platform list | Check Tool Declarations section |

## Technical Implementation

### Template System Integration

Skills use the same gray-matter + Mustache system as agent specs:

1. **Parse:** gray-matter extracts frontmatter YAML
2. **Validate:** Check required fields, folder name match
3. **Render:** Mustache renders conditionals based on platform
4. **Output:** Platform-specific skill file generated

### File Structure

```
specs/skills/gsd-{action}/
├── SKILL.md           # Required: Skill specification
├── templates/         # Optional: Mustache templates
├── assets/            # Optional: Images, diagrams
└── tests/             # Optional: Skill-specific tests
```

Currently only `SKILL.md` is required. Other directories reserved for future expansion.

### Platform Output

Template system generates platform-specific files:

```bash
# For Claude
{{gsdPath}}/skills/gsd-help.md

# For GitHub Copilot  
~/.copilot/gsd/skills/gsd-help.md

# For VS Code Codex
~/.codex/gsd/skills/gsd-help.md
```

### Version Tracking

`metadata.gsdVersion` tracks which system version generated output:

- Enables cache invalidation (regenerate if outdated)
- Debugging (which spec version caused this behavior?)
- Migration tracking (what features are available?)

## References

- **Agent specs:** `/specs/agents/*.md` - Working examples of template system
- **Template system:** `bin/lib/template-system/` - Implementation with 208 passing tests
- **Legacy commands:** `/commands/gsd/*.md` - Original command specifications
- **Planning templates:** `{{gsdPath}}/templates/` - Reference templates

## Future Expansion

Folder-per-skill structure enables:

- **Templates:** Skill-specific Mustache templates in `templates/`
- **Assets:** Diagrams, examples in `assets/`
- **Tests:** Skill validation tests in `tests/`
- **Variants:** Platform-specific overrides in `variants/`
- **Docs:** Extended documentation in `docs/`

Currently, only `SKILL.md` is used. Other capabilities reserved for future phases.
