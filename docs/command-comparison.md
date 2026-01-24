# Command System Comparison

**Audience:** Users upgrading from pre-v1.9.1 to v1.9.1+

**Purpose:** Understand what changed between legacy command system and new spec-based skill system.

## Quick Reference

| Aspect | Legacy (Pre-v1.9.1) | New (v1.9.1+) |
|--------|---------------------|---------------|
| **Invocation** | `/gsd:plan-phase` | `/gsd-plan-phase` |
| **File location** | `commands/gsd/plan-phase.md` | `specs/skills/gsd-plan-phase/SKILL.md` |
| **Structure** | Single file per command | Folder per skill (enables expansion) |
| **Frontmatter** | Optional, unstructured | Required YAML with [schema](../specs/skills/README.md#canonical-frontmatter-schema) |
| **Platform support** | Static files per platform | Generated from template |
| **Conditional syntax** | None (manual duplication) | Mustache conditionals (`{{#isClaude}}`) |
| **Generation** | Hand-written | Template-based |
| **Tool declarations** | Implicit (platform determines) | Explicit in frontmatter |
| **Metadata tracking** | Manual | Auto-generated (timestamp, version) |

## File Path Migration

### Legacy Paths (Removed in v1.9.1)

```
commands/gsd/
├── new-project.md
├── execute-phase.md
├── plan-phase.md
├── help.md
└── ... (29 total)
```

**Installed to:**
- Claude Code: `~/.claude/commands/gsd/*.md`
- Copilot CLI: `.github/copilot/commands/*.md`
- Codex CLI: `.codex/commands/*.md`

### New Paths (v1.9.1+)

```
specs/skills/
├── README.md
├── _shared.yml
├── gsd-new-project/
│   └── SKILL.md
├── gsd-execute-phase/
│   └── SKILL.md
├── gsd-plan-phase/
│   └── SKILL.md
├── gsd-help/
│   └── SKILL.md
└── ... (28 total)
```

**Generated to:**
- Claude Code: `~/.claude/get-shit-done/.github/skills/*.md`
- Copilot CLI: `.github/skills/get-shit-done/*.md`
- Codex CLI: `.codex/skills/get-shit-done/*.md`

## Invocation Changes

| Command | Old Invocation | New Invocation |
|---------|----------------|----------------|
| Help | `/gsd:help` | `/gsd-help` |
| New project | `/gsd:new-project` | `/gsd-new-project` |
| Plan phase | `/gsd:plan-phase <N>` | `/gsd-plan-phase <N>` |
| Execute phase | `/gsd:execute-phase <N>` | `/gsd-execute-phase <N>` |
| Research phase | `/gsd:research-phase <N>` | `/gsd-research-phase <N>` |
| Verify work | `/gsd:verify-work <N>` | `/gsd-verify-work <N>` |
| Progress | `/gsd:progress` | `/gsd-progress` |
| Map codebase | `/gsd:map-codebase` | `/gsd-map-codebase` |
| Debug | `/gsd:debug [issue]` | `/gsd-debug [issue]` |
| New milestone | `/gsd:new-milestone` | `/gsd-new-milestone` |
| Plan milestone gaps | `/gsd:plan-milestone-gaps` | `/gsd-plan-milestone-gaps` |
| Complete milestone | `/gsd:complete-milestone` | `/gsd-complete-milestone` |
| Archive milestone | `/gsd:archive-milestone` | `/gsd-archive-milestone` |
| Restore milestone | `/gsd:restore-milestone` | `/gsd-restore-milestone` |
| Audit milestone | `/gsd:audit-milestone` | `/gsd-audit-milestone` |
| List milestones | `/gsd:list-milestones` | `/gsd-list-milestones` |
| Add phase | `/gsd:add-phase` | `/gsd-add-phase` |
| Insert phase | `/gsd:insert-phase` | `/gsd-insert-phase` |
| Remove phase | `/gsd:remove-phase` | `/gsd-remove-phase` |
| Discuss phase | `/gsd:discuss-phase` | `/gsd-discuss-phase` |
| Add todo | `/gsd:add-todo` | `/gsd-add-todo` |
| Check todos | `/gsd:check-todos` | `/gsd-check-todos` |
| Pause work | `/gsd:pause-work` | `/gsd-pause-work` |
| Resume work | `/gsd:resume-work` | `/gsd-resume-work` |
| List phase assumptions | `/gsd:list-phase-assumptions` | `/gsd-list-phase-assumptions` |
| Verify installation | `/gsd:verify-installation` | `/gsd-verify-installation` |
| What's new | `/gsd:whats-new` | `/gsd-whats-new` |
| Update | `/gsd:update` | `/gsd-update` |

**Pattern:** Replace `:` with `-` in all commands.

## Frontmatter Changes

### Legacy Format (Optional, Unstructured)

```markdown
---
name: gsd:plan-phase
description: Plan a phase
---

# Body content...
```

### New Format (Required, Structured)

```yaml
---
name: gsd-plan-phase
description: Create detailed execution plan for a phase
argument-hint: "<phase-number>"
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
  - agent_spawn
  {{/isCopilot}}
  {{#isCodex}}
  - fs_read
  - terminal_run
  - fs_write
  - agent_spawn
  {{/isCodex}}
metadata:
  platform: claude
  generated: 2026-01-24T00:00:00Z
  gsdVersion: 1.9.1
---

# Body content (platform-agnostic markdown)...
```

**Key differences:**
1. YAML frontmatter required (not optional)
2. Schema-validated fields (name, description, tools)
3. Platform conditionals for tools
4. Auto-generated metadata
5. Body must be platform-agnostic

## Tool Declaration Changes

### Legacy (Implicit)

Tools determined by platform runtime. No declaration in command file.

### New (Explicit with Conditionals)

```yaml
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
  {{#isCodex}}
  - fs_read
  - terminal_run
  - fs_write
  {{/isCodex}}
```

Benefits:
- Explicit permissions (principle of least privilege)
- Platform-specific adaptation
- Automatic validation during generation

## Migration Path

**From legacy to new:**

1. **Uninstall legacy** - Run cleanup script or manual removal (legacy files will be backed up automatically during upgrade)
2. **Reinstall v1.9.1+** - Run `npx get-shit-done-multi` with appropriate flags
3. **Update invocations** - Replace `/gsd:` with `/gsd-` in all usage
4. **Verify installation** - Run `/gsd-verify-installation`

**No automatic conversion:** Legacy command files cannot be automatically converted to specs. Creating new specs requires following [migration guide](./migration-guide.md).

## Breaking Changes

**⚠️ Complete removal in v1.9.1:**

- Legacy `/gsd:` prefix removed (use `/gsd-` instead)
- Legacy `commands/gsd/*.md` system removed entirely
- No backward compatibility with pre-v1.9.1 installations
- Manual migration required (cleanup script provided)

**See also:**
- [Migration Guide](./migration-guide.md) - How to create new skills
- [Skills README](../specs/skills/README.md) - Spec schema documentation
