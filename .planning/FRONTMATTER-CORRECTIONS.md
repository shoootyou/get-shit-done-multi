# Frontmatter Format Corrections

**Date:** 2026-01-26  
**Status:** Documented - To be implemented in Phase 1

---

## Problem

Current skill/agent frontmatter in `.github/skills/` and `.github/agents/` contains **unsupported fields** according to official Claude documentation:

https://code.claude.com/docs/en/slash-commands#frontmatter-reference

### Invalid Fields Found

All 29 skills and 13 agents have these **unsupported** fields:

```yaml
---
name: gsd-new-project
description: ...
skill_version: 1.9.1              # ❌ NOT SUPPORTED
requires_version: 1.9.0+          # ❌ NOT SUPPORTED
platforms: [claude, copilot, codex]  # ❌ NOT SUPPORTED
tools: [read, edit, execute]      # ❌ WRONG FIELD NAME (should be allowed-tools)
arguments: [...]                  # ✅ OK but not officially documented
metadata:                         # ❌ NOT SUPPORTED
  platform: copilot
  generated: '2026-01-24'
  templateVersion: 1.0.0
  projectVersion: 1.9.0
  projectName: 'get-shit-done-multi'
---
```

### Correct Format

Per official documentation, only these fields are supported:

```yaml
---
name: gsd-new-project
description: Orchestrate project initialization with parallel research and roadmap creation
allowed-tools: Read, Write, Bash, Task  # ✅ Comma-separated string, one line
arguments: [...]                         # ✅ Supported (though not in docs table)
---
```

## Official Supported Fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name for the skill |
| `description` | Recommended | What the skill does and when to use it |
| `argument-hint` | No | Hint shown during autocomplete |
| `disable-model-invocation` | No | Set to `true` to prevent auto-loading |
| `user-invocable` | No | Set to `false` to hide from `/` menu |
| `allowed-tools` | No | Tools Claude can use - **comma-separated string** |
| `model` | No | Model to use when skill is active |
| `context` | No | Set to `fork` to run in subagent |
| `agent` | No | Which subagent type when `context: fork` |
| `hooks` | No | Hooks scoped to skill lifecycle |

## Solution

### 1. Preserve Metadata in version.json

Create `version.json` in each skill/agent directory:

```json
{
  "skill_version": "1.9.1",
  "requires_version": "1.9.0+",
  "platforms": ["claude", "copilot", "codex"],
  "metadata": {
    "platform": "copilot",
    "generated": "2026-01-24",
    "templateVersion": "1.0.0",
    "projectVersion": "1.9.0",
    "projectName": "get-shit-done-multi"
  }
}
```

### 2. Fix Frontmatter During Template Conversion

**CRITICAL:** These corrections happen in `/templates/` directory, **NOT** on source files.

#### Step 1: Copy from source
```bash
cp -r .github/skills/gsd-new-project templates/skills/
```

#### Step 2: Fix frontmatter in template
- Remove: `skill_version`, `requires_version`, `platforms`, `metadata`
- Rename: `tools` → `allowed-tools`
- Convert format: `[read, edit]` → `Read, Edit, Bash`

#### Step 3: Create version.json
```bash
echo '{"skill_version": "1.9.1", ...}' > templates/skills/gsd-new-project/version.json
```

### 3. Tool Name Format

**Current (invalid):**
```yaml
tools: [read, edit, execute, agent]
```

**Correct:**
```yaml
allowed-tools: Read, Edit, Bash, Task
```

#### Tool Name Mappings

| Current Array Value | Correct String Value |
|---------------------|----------------------|
| `read` | `Read` |
| `write` | `Write` |
| `edit` | `Edit` |
| `bash` | `Bash` |
| `execute` | `Bash` |
| `grep` | `Grep` |
| `glob` | `Glob` |
| `search` | `Grep` (or `Glob` depending on usage) |
| `agent` | `Task` |
| `task` | `Task` |

## Official Tool Names

Per https://code.claude.com/docs/en/settings#tools-available-to-claude:

**No Permission Required:**
- `Read` - Read file contents
- `Grep` - Search patterns in files
- `Glob` - Find files by pattern
- `Task` - Run sub-agent
- `TaskOutput` - Get background task output
- `TaskCreate`, `TaskGet`, `TaskList`, `TaskUpdate` - Task management
- `AskUserQuestion` - Ask multiple choice questions
- `KillShell` - Kill background shell
- `MCPSearch` - Search/load MCP tools
- `LSP` - Language server protocol

**Permission Required:**
- `Write` - Create/overwrite files
- `Edit` - Make targeted edits
- `Bash` - Execute shell commands
- `NotebookEdit` - Modify Jupyter notebooks
- `WebFetch` - Fetch URL content
- `WebSearch` - Perform web searches
- `Skill` - Execute a skill
- `ExitPlanMode` - Exit plan mode

## Implementation Plan

### Phase 1: Template Generation

1. **Read source files** from `.github/skills/` and `.github/agents/`
2. **Parse frontmatter** and extract invalid fields
3. **Create version.json** with extracted metadata
4. **Transform frontmatter**:
   - Remove unsupported fields
   - Rename `tools` → `allowed-tools`
   - Convert array to comma-separated string
   - Normalize tool names
5. **Write to templates/** directory
6. **Never modify** source files in `.github/`

### Phase 2: Platform Adapters

Each adapter handles platform-specific tool name mappings:

- **Claude:** Use official names (Read, Write, Bash, Task)
- **Copilot:** May need different mappings (TBD during research)
- **Codex:** May need different mappings (TBD during research)

## Files Affected

- **29 skills** in `.github/skills/*/SKILL.md`
- **13 agents** in `.github/agents/*.agent.md`
- **Total:** 42 files need frontmatter correction

## Testing Checklist

- [ ] All source files remain unchanged
- [ ] Templates created in `/templates/` directory
- [ ] Each template has corrected frontmatter
- [ ] Each template directory has `version.json`
- [ ] Tool names use official capitalization
- [ ] `allowed-tools` is comma-separated string
- [ ] No unsupported fields remain in frontmatter

## References

- Official Frontmatter Reference: https://code.claude.com/docs/en/slash-commands#frontmatter-reference
- Official Tools List: https://code.claude.com/docs/en/settings#tools-available-to-claude

---

**Last Updated:** 2026-01-26  
**Next Action:** Execute Phase 1 template generation with corrections
