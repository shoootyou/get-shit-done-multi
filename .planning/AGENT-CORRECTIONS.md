# Agent Frontmatter Corrections

**Date:** 2026-01-26  
**Status:** Documented - To be implemented in Phase 1  
**Scope:** AGENTS (13 files) - Separate from Skills

---

## Problem

Current **agent** frontmatter in `.github/agents/` contains fields that are NOT supported or differ between Claude and Copilot platforms.

**Agents have different specifications than Skills** - they need platform-specific corrections.

### Current Agent Frontmatter (Invalid)

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

**Issues:**
- `tools` format: Array instead of comma-separated string
- `tools` names: Copilot aliases instead of Claude official names
- `metadata` block: Should be removed and stored in versions.json
- Missing `skills` field: Should include referenced skills (Claude only)

---

## Official Supported Fields

### Claude Agents

Per https://code.claude.com/docs/en/sub-agents:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique identifier (lowercase + hyphens) |
| `description` | Yes | When to delegate to this subagent |
| `tools` | No | Tools as **comma-separated string** (e.g., `Read, Bash, Task`) |
| `disallowedTools` | No | Tools to deny |
| `model` | No | Model: `sonnet`, `opus`, `haiku`, `inherit` (default: inherit) |
| `permissionMode` | No | Permission mode: `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `skills` | No | **Skills to pre-load** (full content injected at startup) |
| `hooks` | No | Lifecycle hooks scoped to this subagent |

### Copilot Agents

Per https://docs.github.com/en/copilot/reference/custom-agents-configuration:

| Field | Required | Description |
|-------|----------|-------------|
| `name` | No | Display name |
| `description` | Yes | Agent purpose and capabilities |
| `target` | No | Environment: `vscode` or `github-copilot` (default: both) |
| `tools` | No | List/string of tool names (default: all) |
| `infer` | No | Auto-invoke based on context (default: true) |
| `mcp-servers` | No | Additional MCP servers |
| `metadata` | No | Name-value annotation pairs |

---

## Corrections Required

### 1. Tools Field Format

**Current (invalid):**
```yaml
tools: [read, edit, execute, search, agent]
```

**Correct:**
```yaml
tools: Read, Edit, Bash, Grep, Task
```

**Changes:**
- Array → Comma-separated string
- Lowercase Copilot aliases → Official Claude names
- Apply same tool mappings as skills

### 2. Tool Name Mappings

Use same mappings as skills (from Copilot aliases to Claude official):

| Copilot Alias | Claude Official | Notes |
|---------------|-----------------|-------|
| `read` | `Read` | Capitalize |
| `edit` | `Edit` | Capitalize |
| `execute` | `Bash` | Rename |
| `search` | `Grep` | Rename (or `Glob` if pattern matching) |
| `agent` | `Task` | Rename |
| `shell` | `Bash` | Rename |
| `custom-agent` | `Task` | Rename |

Reference: https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases

### 3. Skills Field (Claude Only)

**Scan agent content** for skill references (e.g., `/gsd-plan-phase`, `/gsd-debug`).

**Add ALL referenced skills** to `skills` field:

```yaml
skills: gsd-plan-phase, gsd-execute-phase, gsd-debug
```

**Example scan:**
- Agent content mentions: "spawned by `/gsd-execute-phase`"
- Add to frontmatter: `skills: gsd-execute-phase`

**Note:** This field is Claude-specific, Copilot agents don't have `skills` field.

### 4. Metadata → versions.json

**Remove `metadata` block** from frontmatter.

**Create `versions.json`** in each platform's agent directory:

```json
{
  "gsd-executor": {
    "version": "1.9.1",
    "requires_version": "1.9.0+",
    "platforms": ["claude", "copilot", "codex"],
    "metadata": {
      "platform": "copilot",
      "generated": "2026-01-24",
      "templateVersion": "1.0.0",
      "projectVersion": "1.9.0",
      "projectName": "get-shit-done-multi"
    }
  },
  "gsd-planner": {
    ...
  }
}
```

**Location:**
- `.github/agents/versions.json` (Copilot)
- `.claude/agents/versions.json` (Claude)
- `.codex/agents/versions.json` (Codex)

**Template location:**
- `templates/agents/versions.json` with `{{VARIABLES}}`

---

## Solution

### 1. Template Conversion Process

#### Step 1: Copy agent from source
```bash
cp .github/agents/gsd-executor.agent.md templates/agents/
```

#### Step 2: Fix frontmatter
- Remove: `metadata` block
- Convert: `tools` array → comma-separated string
- Map: Copilot aliases → Claude official names
- Add: `skills` field with all referenced skills (scan content)
- Keep: All officially supported fields

#### Step 3: Create versions.json template
```bash
# Create template with all agents
cat > templates/agents/versions.json << EOF
{
  "gsd-executor": {
    "version": "{{VERSION}}",
    "requires_version": "{{MIN_VERSION}}",
    "platforms": {{PLATFORMS}},
    "metadata": {
      "templateVersion": "{{TEMPLATE_VERSION}}",
      "projectVersion": "{{PROJECT_VERSION}}",
      "projectName": "{{PROJECT_NAME}}"
    }
  }
}
EOF
```

### 2. Skill Reference Extraction

**Algorithm:**
1. Read agent markdown content
2. Find all `/gsd-` or `$gsd-` or `gsd-` references
3. Extract skill names (e.g., `/gsd-plan-phase` → `gsd-plan-phase`)
4. Cross-reference with `.github/skills/` directory
5. Add to `skills` field in frontmatter (comma-separated)

**Example:**

Agent content:
```
You are spawned by `/gsd-execute-phase` orchestrator.
Use `/gsd-debug` for complex scenarios.
```

Extracted skills:
```yaml
skills: gsd-execute-phase, gsd-debug
```

### 3. Platform-Specific Generation

**Claude agents:**
```yaml
---
name: gsd-executor
description: Executes GSD plans with atomic commits...
tools: Read, Edit, Bash, Grep, Task
skills: gsd-execute-phase
---
```

**Copilot agents:**
```yaml
---
name: gsd-executor
description: Executes GSD plans with atomic commits...
tools: read, edit, execute, search, agent
---
```

**Note:** Copilot doesn't support `skills` field - omit it.

---

## Files Affected

**13 agents** in `.github/agents/*.agent.md`:
1. gsd-codebase-mapper.agent.md
2. gsd-debugger-specialist.agent.md
3. gsd-debugger.agent.md
4. gsd-executor.agent.md
5. gsd-integration-checker.agent.md
6. gsd-phase-researcher.agent.md
7. gsd-plan-checker.agent.md
8. gsd-planner-strategist.agent.md
9. gsd-planner.agent.md
10. gsd-project-researcher.agent.md
11. gsd-research-synthesizer.agent.md
12. gsd-roadmapper.agent.md
13. gsd-verifier.agent.md

**All require:**
- Tool format conversion
- Tool name mapping
- Metadata extraction to versions.json
- Skill reference extraction (Claude only)

---

## Testing Checklist

**Agents:**
- [ ] All source files in `.github/agents/` remain unchanged
- [ ] Agent templates created in `/templates/agents/` directory
- [ ] Each agent template has corrected frontmatter
- [ ] `tools` field is comma-separated string
- [ ] Tool names use official Claude names
- [ ] `metadata` block removed from frontmatter
- [ ] `skills` field populated with all referenced skills (scan content)
- [ ] `versions.json` template created in `/templates/agents/`
- [ ] versions.json contains all 13 agents with metadata
- [ ] versions.json has {{VARIABLES}} for platform-specific values

**Installation:**
- [ ] versions.json copied to `.github/agents/versions.json` at install
- [ ] versions.json copied to `.claude/agents/versions.json` at install
- [ ] versions.json copied to `.codex/agents/versions.json` at install
- [ ] {{VARIABLES}} replaced with actual values per platform

---

## Example Transformation

### Before (source - .github/agents/gsd-executor.agent.md):
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

You are spawned by `/gsd-execute-phase` orchestrator.
```

### After (template - templates/agents/gsd-executor.agent.md):
```yaml
---
name: gsd-executor
description: Executes GSD plans with atomic commits...
tools: Read, Edit, Bash, Grep
skills: gsd-execute-phase
---

You are spawned by `/gsd-execute-phase` orchestrator.
```

### versions.json (templates/agents/versions.json):
```json
{
  "gsd-executor": {
    "version": "1.9.1",
    "requires_version": "1.9.0+",
    "platforms": ["claude", "copilot", "codex"],
    "metadata": {
      "templateVersion": "1.0.0",
      "projectVersion": "1.9.0",
      "projectName": "get-shit-done-multi"
    }
  }
}
```

---

## References

- Claude Sub-Agents: https://code.claude.com/docs/en/sub-agents
- Copilot Custom Agents: https://docs.github.com/en/copilot/reference/custom-agents-configuration
- Copilot Tool Aliases: https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases
- Claude Tools: https://code.claude.com/docs/en/settings#tools-available-to-claude

---

**Last Updated:** 2026-01-26  
**Next Action:** Execute Phase 1 template generation with agent corrections
