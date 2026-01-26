# Frontmatter Format Corrections (SKILLS ONLY)

**Date:** 2026-01-26  
**Status:** Documented - To be implemented in Phase 1  
**Scope:** SKILLS ONLY - Agents have independent structure

---

## Problem

Current **skill** frontmatter in `.github/skills/` contains **unsupported fields** according to official Claude documentation:

https://code.claude.com/docs/en/slash-commands#frontmatter-reference

**NOTE:** This issue applies to **SKILLS ONLY**. Agents (`.github/agents/*.agent.md`) have a different structure and are NOT affected by these corrections.

### Invalid Fields Found

All 29 skills have these **unsupported** fields:

```yaml
---
name: gsd-new-project
description: ...
skill_version: 1.9.1              # ❌ NOT SUPPORTED
requires_version: 1.9.0+          # ❌ NOT SUPPORTED
platforms: [claude, copilot, codex]  # ❌ NOT SUPPORTED
tools: [read, edit, execute]      # ❌ WRONG FIELD NAME (should be allowed-tools)
arguments: [{...}]                # ❌ NOT SUPPORTED (should be argument-hint)
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
argument-hint: "[domain]"                # ✅ Optional hint for arguments
allowed-tools: Read, Write, Bash, Task   # ✅ Comma-separated string, one line
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

### 1. Preserve Metadata in version.json (SKILLS ONLY)

Create `version.json` in each **skill** directory (NOT in agents):

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

**Note about `arguments` field:**
- Read from source to generate appropriate `argument-hint`
- **DO NOT** store in version.json
- Used as reference during conversion only
- Discarded after generating hint

**Agent Note:** Agents do NOT need version.json - they follow a simpler structure.

### 2. Fix Frontmatter During Template Conversion (SKILLS ONLY)

**CRITICAL:** These corrections happen in `/templates/skills/` directory, **NOT** on source files.

**Agents:** Do NOT apply these corrections to agents - they have different structure.

#### Step 1: Copy from source
```bash
cp -r .github/skills/gsd-new-project templates/skills/
```

#### Step 2: Fix frontmatter in skill template
- Remove: `skill_version`, `requires_version`, `platforms`, `metadata`, `arguments`
- Rename: `tools` → `allowed-tools`
- Convert format: `[read, edit]` → `Read, Edit, Bash`
- Convert arguments to argument-hint:
  - Read `arguments` array from source
  - Generate appropriate hint string (e.g., `[domain]`, `[filename] [format]`)
  - Write to `argument-hint` field
  - **Discard** original `arguments` array (do not preserve)

#### Step 3: Create version.json (skills only)
```bash
# Only store: skill_version, requires_version, platforms, metadata
# DO NOT include arguments field
echo '{"skill_version": "1.9.1", "requires_version": "1.9.0+", "platforms": [...], "metadata": {...}}' > templates/skills/gsd-new-project/version.json
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
3. **Create version.json** with extracted metadata (skills only):
   - Include: `skill_version`, `requires_version`, `platforms`, `metadata`
   - **Exclude:** `arguments` field (use as reference only, do not store)
4. **Transform frontmatter**:
   - Remove unsupported fields
   - Rename `tools` → `allowed-tools`
   - Convert array to comma-separated string
   - Normalize tool names
   - Convert `arguments` to `argument-hint` (discard original array)
5. **Write to templates/** directory
6. **Never modify** source files in `.github/`

### Phase 2: Platform Adapters

Each adapter handles platform-specific tool name mappings:

- **Claude:** Use official names (Read, Write, Bash, Task)
- **Copilot:** May need different mappings (TBD during research)
- **Codex:** May need different mappings (TBD during research)

## Files Affected

**SKILLS ONLY:**
- **29 skills** in `.github/skills/*/SKILL.md` need frontmatter correction
- **Total:** 29 files

**AGENTS:**
- **13 agents** in `.github/agents/*.agent.md` 
- **Status:** NO corrections needed - agents have independent structure
- **Action:** Copy to templates as-is (may need platform-specific adjustments later)

## Testing Checklist

**Skills:**
- [ ] All source files in `.github/skills/` remain unchanged
- [ ] Skill templates created in `/templates/skills/` directory
- [ ] Each skill template has corrected frontmatter
- [ ] Each skill directory has `version.json`
- [ ] `version.json` contains: skill_version, requires_version, platforms, metadata ONLY
- [ ] `version.json` does NOT contain `arguments` field
- [ ] Tool names use official capitalization
- [ ] `allowed-tools` is comma-separated string
- [ ] No unsupported fields remain in skill frontmatter
- [ ] `argument-hint` field used instead of `arguments` array
- [ ] Original `arguments` array discarded after conversion

**Agents:**
- [ ] All source files in `.github/agents/` remain unchanged
- [ ] Agent templates copied to `/templates/agents/` as-is
- [ ] NO version.json for agents
- [ ] NO frontmatter corrections for agents (different spec)

## References

- Official Frontmatter Reference (Skills): https://code.claude.com/docs/en/slash-commands#frontmatter-reference
- Official Tools List: https://code.claude.com/docs/en/settings#tools-available-to-claude
- Official Sub-Agents Reference: https://code.claude.com/docs/en/sub-agents

## Agent Structure (Separate from Skills)

Agents have a simpler frontmatter structure. Based on observation of `.github/agents/*.agent.md`:

```yaml
---
name: gsd-executor
description: Executes GSD plans with atomic commits...
tools: [read, edit, execute, search]
metadata:
  platform: copilot
  generated: '2026-01-24'
  templateVersion: 1.0.0
  projectVersion: 1.9.0
  projectName: 'get-shit-done-multi'
---
```

**Agent corrections (if any) will be defined after researching official agent documentation.**

For now, agents will be copied to templates as-is with minimal changes:
- Platform-specific tool name mappings (via adapters)
- Path reference updates
- No frontmatter field removals/renames for Phase 1

---

**Last Updated:** 2026-01-26  
**Next Action:** Execute Phase 1 template generation with corrections
