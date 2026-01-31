# Platform Differences: Claude Code vs GitHub Copilot CLI

**Research Date:** 2025-01-26
**Confidence:** HIGH (verified against official documentation)
**Sources:** 
- Claude skills: https://code.claude.com/docs/en/slash-commands#frontmatter-reference
- Claude agents: https://code.claude.com/docs/en/sub-agents
- Copilot agents: https://docs.github.com/en/copilot/reference/custom-agents-configuration
- Copilot tool aliases: https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases

---

## Executive Summary

Claude Code and GitHub Copilot CLI have **significantly different frontmatter specifications** that require careful handling:

### Critical Differences

1. **Skills frontmatter** - Claude: `allowed-tools` (comma-separated), GitHub: `tools` (array/string)
2. **Tool name capitalization** - Claude: `Read, Bash, Task`, GitHub: case-insensitive but typically lowercase
3. **Unsupported fields** - `skill_version`, `requires_version`, `platforms`, `arguments`, `metadata` are NOT in official specs
4. **Agents-specific** - Claude: `tools` (string), `skills` field; GitHub: `tools` (array), no `skills` field
5. **Arguments handling** - Claude: `argument-hint` (string), NOT `arguments` (array)

### Key Finding

**CRITICAL:** The current codebase uses fields (`skill_version`, `requires_version`, `platforms`, `metadata`, `arguments`) that are **NOT supported** by official documentation for either platform. These must be removed from frontmatter and stored separately if needed.

---

## Part 1: Official Frontmatter Specifications

### Claude Code Skills - OFFICIAL Fields

**Source:** https://code.claude.com/docs/en/slash-commands#frontmatter-reference

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | No | string | Display name (lowercase, hyphens, max 64 chars). Defaults to directory name |
| `description` | Recommended | string | What the skill does and when to use it |
| `argument-hint` | No | string | Hint shown during autocomplete (e.g., `[filename]`, `[issue-number]`) |
| `disable-model-invocation` | No | boolean | `true` = prevent auto-loading, manual `/name` only (default: `false`) |
| `user-invocable` | No | boolean | `false` = hide from `/` menu (default: `true`) |
| `allowed-tools` | No | string | **Comma-separated** tool names (e.g., `Read, Bash, Task`) |
| `model` | No | string | Model to use when skill is active |
| `context` | No | string | Set to `fork` to run in subagent |
| `agent` | No | string | Which subagent type when `context: fork` |
| `hooks` | No | object | Hooks scoped to skill lifecycle |

**All fields are optional.** Only `description` is recommended.

**Example:**
```yaml
---
name: explain-code
description: Explains code with visual diagrams and analogies
argument-hint: "[file-path]"
allowed-tools: Read, Grep, Glob
---
```

### Claude Code Agents (Sub-agents) - OFFICIAL Fields

**Source:** https://code.claude.com/docs/en/sub-agents

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | Yes | string | Unique identifier (lowercase, hyphens) |
| `description` | Yes | string | When to delegate to this subagent |
| `tools` | No | string | **Comma-separated** tool names the subagent can use |
| `disallowedTools` | No | string | Tools to deny |
| `model` | No | string | `sonnet`, `opus`, `haiku`, `inherit` (default: `inherit`) |
| `permissionMode` | No | string | `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan` |
| `skills` | No | array | Skills to pre-load into subagent context at startup |
| `hooks` | No | object | Lifecycle hooks scoped to this subagent |

**Only `name` and `description` are required.**

**Example:**
```yaml
---
name: code-reviewer
description: Analyze code and provide specific, actionable feedback on quality, security, and best practices
tools: Read, Grep, Glob
model: sonnet
skills: [code-standards, security-checklist]
---
```

### GitHub Copilot CLI Agents - OFFICIAL Fields

**Source:** https://docs.github.com/en/copilot/reference/custom-agents-configuration

| Field | Required | Type | Description |
|-------|----------|------|-------------|
| `name` | No | string | Display name |
| `description` | Yes | string | Agent purpose and capabilities |
| `target` | No | string | Environment: `vscode` or `github-copilot` (default: both) |
| `tools` | No | array or string | Tool names (default: all tools enabled) |
| `infer` | No | boolean | Auto-invoke based on context (default: `true`) |
| `mcp-servers` | No | object | Additional MCP server configuration |

**Notes:**
- Tools can be array (`['read', 'edit']`) or string
- Tool names are **case insensitive**
- `metadata` field is **NOT in official specification**
- No equivalent to Claude's `skills` field

**Example:**
```yaml
---
name: test-specialist
description: Focuses on test coverage, quality, and testing best practices
tools: ["read", "search", "edit"]
---
```

---

## Part 2: Unsupported Fields (Must Remove)

### Fields NOT in Official Specifications

The following fields appear in the current codebase but are **NOT supported** by official documentation:

| Field | Found In | Status |
|-------|----------|--------|
| `skill_version` | All skills | ❌ NOT SUPPORTED - Remove from frontmatter |
| `requires_version` | All skills | ❌ NOT SUPPORTED - Remove from frontmatter |
| `platforms` | All skills | ❌ NOT SUPPORTED - Remove from frontmatter |
| `arguments` | All skills | ❌ NOT SUPPORTED - Use `argument-hint` instead |
| `metadata` | Skills & agents | ❌ NOT SUPPORTED - Remove from frontmatter |

### Correct Approach

**Store unsupported metadata in separate version files:**

#### For Skills: `version.json` per skill
```json
{
  "skill_version": "1.9.1",
  "requires_version": "1.9.0+",
  "platforms": ["claude", "copilot"],
  "metadata": {
    "generated": "2026-01-24",
    "templateVersion": "1.0.0"
  }
}
```

#### For Agents: Single `versions.json` for all agents
```json
{
  "agents": {
    "gsd-executor": {
      "version": "1.9.1",
      "platforms": ["claude", "copilot"],
      "metadata": {
        "generated": "2026-01-24"
      }
    }
  }
}
```

---

## Part 3: Tool Name Mappings

### Official Tool Aliases

**Source:** https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases

GitHub Copilot supports **case-insensitive** tool aliases. Claude uses capitalized canonical names.

| Primary (Copilot) | Claude Canonical | Compatible Aliases | Purpose |
|-------------------|------------------|--------------------|---------|
| `execute` | `Bash` | `shell`, `Bash`, `powershell` | Execute shell command |
| `read` | `Read` | `Read`, `NotebookRead` | Read file contents |
| `edit` | `Edit` or `Write` | `Edit`, `MultiEdit`, `Write`, `NotebookEdit` | File editing |
| `search` | `Grep` or `Glob` | `Grep`, `Glob` | Search files/text |
| `agent` | `Task` | `custom-agent`, `Task` | Delegate to agent |
| `web` | `WebSearch`, `WebFetch` | `WebSearch`, `WebFetch` | Web access |
| `todo` | `TodoWrite` | `TodoWrite` | Task list management |

### Tool Format Differences

**Claude Code:**
```yaml
tools: Read, Write, Bash, Grep, Task
```
- Format: Comma-separated string
- Capitalization: Capitalized (e.g., `Read`, `Bash`)
- Field name (skills): `allowed-tools`
- Field name (agents): `tools`

**GitHub Copilot:**
```yaml
tools: ["read", "edit", "execute", "search", "agent"]
```
- Format: Array or comma-separated string
- Capitalization: Case-insensitive (typically lowercase)
- Field name: `tools` (both skills and agents)

### Transformation Algorithm

**Copilot → Claude:**
```javascript
function copilotToClaude(tools) {
  const map = {
    'execute': 'Bash',
    'shell': 'Bash',
    'read': 'Read',
    'edit': 'Edit',  // or 'Write' depending on context
    'write': 'Write',
    'search': 'Grep',  // or 'Glob' for pattern matching
    'agent': 'Task',
    'web': 'WebSearch',  // May not be supported
    'websearch': 'WebSearch',
    'webfetch': 'WebFetch',
    'todo': 'TodoWrite'
  };
  
  return Array.isArray(tools)
    ? tools.map(t => map[t.toLowerCase()] || t).join(', ')
    : tools;  // Already string format
}
```

**Claude → Copilot:**
```javascript
function claudeToCopilot(tools) {
  const map = {
    'Read': 'read',
    'Write': 'edit',
    'Edit': 'edit',
    'Bash': 'execute',
    'Grep': 'search',
    'Glob': 'search',
    'Task': 'agent',
    'WebSearch': 'web',
    'WebFetch': 'web',
    'TodoWrite': 'todo'
  };
  
  const toolList = typeof tools === 'string'
    ? tools.split(',').map(t => t.trim())
    : tools;
    
  // Deduplicate (Write+Edit both → 'edit')
  return [...new Set(toolList.map(t => map[t] || t.toLowerCase()))];
}
```

---

## Part 4: Arguments Handling

### Claude: `argument-hint` (String)

**Official field:** `argument-hint`
**Format:** String hint for autocomplete
**Examples:**
- `"[filename]"`
- `"[issue-number]"`
- `"[domain]"`
- `"[file-path] [format]"`

```yaml
---
name: gsd-new-project
argument-hint: "[domain]"
---
```

### Current (Invalid): `arguments` (Array)

**NOT SUPPORTED:**
```yaml
---
arguments:
  - name: domain
    type: string
    required: false
    description: Project domain or type
---
```

### Conversion Logic

Transform `arguments` array → `argument-hint` string:

```javascript
function generateArgumentHint(arguments) {
  if (!arguments || arguments.length === 0) return null;
  
  // Generate hint from argument names
  const hints = arguments.map(arg => {
    const bracket = arg.required ? `<${arg.name}>` : `[${arg.name}]`;
    return bracket;
  });
  
  return hints.join(' ');
}

// Example:
// Input: [{name: "domain", required: false}, {name: "template", required: false}]
// Output: "[domain] [template]"
```

---

## Part 5: Platform-Specific Fields

### Claude-Specific Features

**Skills field (agents only):**
```yaml
---
name: research-agent
skills: [questioning, research-patterns]
---
```
- Pre-loads full skill content into agent context
- Not available in GitHub Copilot
- **Omit when generating GitHub agents**

**Context forking (skills only):**
```yaml
---
context: fork
agent: Explore
---
```
- Runs skill in subagent context
- Not available in GitHub Copilot
- **Omit when generating GitHub skills**

### GitHub Copilot-Specific Features

**MCP Servers:**
```yaml
---
mcp-servers:
  custom-mcp:
    type: 'local'
    command: 'some-command'
---
```
- Configures Model Context Protocol servers
- Not available in Claude Code (uses separate config)
- **Omit when generating Claude agents**

**Target environment:**
```yaml
---
target: vscode
---
```
- Restricts where agent runs
- Not available in Claude Code
- **Omit when generating Claude agents**

---

## Part 6: Validation Rules

### Skills Validation

**Claude Code:**
```bash
✓ Field name: allowed-tools (not tools)
✓ Format: string (not array)
✓ Capitalization: Read, Bash, Task
✓ No unsupported fields
✗ skill_version, requires_version, platforms, arguments, metadata
```

**GitHub Copilot:**
```bash
✓ Field name: tools (not allowed-tools)
✓ Format: array or string
✓ Case: insensitive
✓ No unsupported fields
✗ skill_version, requires_version, platforms, arguments, metadata
```

### Agents Validation

**Claude Code:**
```bash
✓ Required: name, description
✓ tools format: string
✓ skills field: optional array
✗ metadata block
```

**GitHub Copilot:**
```bash
✓ Required: description
✓ tools format: array or string
✗ skills field
✗ metadata block
```

---

## Part 7: Directory Structure Comparison

### Claude Code Structure
```
.claude/
├── agents/              # Sub-agents
│   └── {name}.md       # Agent definition files
├── hooks/              # Lifecycle hooks
│   ├── {hook}.js       # Node.js hook scripts
│   └── pre-commit-docs # Shell script hooks
├── skills/             # Slash commands
│   └── {command-name}/ # One directory per skill
│       └── SKILL.md    # Skill definition
├── get-shit-done/      # Shared resources (platform-specific name)
│   ├── references/     # Reference documentation
│   ├── templates/      # Templates
│   └── workflows/      # Workflow definitions
└── settings.json       # Configuration
```

### GitHub Copilot CLI Structure
```
.github/
├── agents/              # Custom agents
│   └── {name}.agent.md # Agent definition files
├── skills/             # Custom skills
│   └── {command-name}/ # One directory per skill
│       └── SKILL.md    # Skill definition
├── get-shit-done/      # Shared resources (platform-specific name)
│   ├── references/     # Reference documentation
│   ├── templates/      # Templates
│   └── workflows/      # Workflow definitions
└── copilot-instructions.md  # Global instructions (optional)
```

**Key Differences:**
| Aspect | Claude | GitHub Copilot |
|--------|--------|----------------|
| **Root directory** | `.claude/` | `.github/` |
| **Agent file extension** | `.md` | `.agent.md` |
| **Skills directory** | Same structure | Same structure |
| **Hooks support** | Yes (`.claude/hooks/`) | No equivalent discovered |
| **Global config** | `settings.json` | `copilot-instructions.md` |
| **Shared resources path** | `.claude/get-shit-done/` | `.github/get-shit-done/` |

---

## Part 8: Correct vs Incorrect Examples

### Skills - BEFORE (Incorrect)

```yaml
---
name: gsd-new-project
description: Orchestrate project initialization
skill_version: 1.9.1                      # ❌ NOT SUPPORTED
requires_version: 1.9.0+                  # ❌ NOT SUPPORTED
platforms: [claude, copilot, codex]      # ❌ NOT SUPPORTED
tools: [read, edit, execute, agent]      # ❌ WRONG FIELD NAME
arguments:                                # ❌ NOT SUPPORTED
  - name: domain
    type: string
    required: false
metadata:                                 # ❌ NOT SUPPORTED
  platform: copilot
  generated: '2026-01-24'
---
```

### Skills - AFTER (Correct - Claude)

```yaml
---
name: gsd-new-project
description: Orchestrate project initialization with parallel research and roadmap creation
argument-hint: "[domain]"
allowed-tools: Read, Write, Bash, Task
---
```

**Removed fields stored in `version.json`:**
```json
{
  "skill_version": "1.9.1",
  "requires_version": "1.9.0+",
  "platforms": ["claude", "copilot"],
  "metadata": {
    "generated": "2026-01-24",
    "templateVersion": "1.0.0"
  }
}
```

### Skills - AFTER (Correct - GitHub)

```yaml
---
name: gsd-new-project
description: Orchestrate project initialization with parallel research and roadmap creation
argument-hint: "[domain]"
tools: ["read", "edit", "execute", "agent"]
---
```

**Note:** Same `version.json` file (platform-agnostic metadata)

### Agents - BEFORE (Incorrect)

```yaml
---
name: gsd-executor
description: Executes GSD plans with atomic commits
tools: [read, edit, execute, search]     # ❌ Array format, wrong names
metadata:                                 # ❌ NOT SUPPORTED
  platform: copilot
  generated: '2026-01-24'
---
```

### Agents - AFTER (Correct - Claude)

```yaml
---
name: gsd-executor
description: Executes GSD plans with atomic commits, validation, and rollback
tools: Read, Edit, Bash, Grep
skills: [gsd-commit-validator, error-recovery]
---
```

### Agents - AFTER (Correct - GitHub)

```yaml
---
name: gsd-executor
description: Executes GSD plans with atomic commits, validation, and rollback
tools: ["read", "edit", "execute", "search"]
---
```

**Note:** No `skills` field (not supported), metadata in `versions.json`

## Part 9: Installer Implementation Requirements

### Critical Corrections Matrix

| Issue | Current | Correct | Implementation |
|-------|---------|---------|----------------|
| **Skills field name** | `tools` | `allowed-tools` (Claude) / `tools` (GitHub) | Platform-specific templates |
| **Skills format** | Array | String (Claude) / Array (GitHub) | `tools.join(', ')` for Claude |
| **Tool names** | Copilot aliases | Claude canonical | Apply tool mapping |
| **Arguments** | `arguments: [...]` | `argument-hint: "[name]"` | Generate hint from args |
| **Version fields** | In frontmatter | In `version.json` | Extract and save separately |
| **Metadata block** | In frontmatter | In `version.json` / `versions.json` | Remove from frontmatter |
| **Agent skills** | Missing | Add for Claude only | Scan content for `@skill` references |

### Field Removal Checklist

**Remove from ALL frontmatter:**
- [ ] `skill_version`
- [ ] `requires_version`
- [ ] `platforms`
- [ ] `arguments` (replace with `argument-hint`)
- [ ] `metadata`

**Store in version files:**
- [ ] Skills: Create `version.json` per skill directory
- [ ] Agents: Create single `versions.json` in `.github/agents/`

### Platform-Specific Generation

**Claude Skills (.claude/skills/):**
```javascript
{
  fieldName: 'allowed-tools',
  format: 'string',
  transform: tools => tools.map(copilotToClaude).join(', '),
  additionalFields: []
}
```

**GitHub Skills (.github/skills/):**
```javascript
{
  fieldName: 'tools',
  format: 'array',
  transform: tools => tools.map(t => t.toLowerCase()),
  additionalFields: []
}
```

**Claude Agents (.claude/agents/):**
```javascript
{
  fieldName: 'tools',
  format: 'string',
  transform: tools => tools.map(copilotToClaude).join(', '),
  additionalFields: ['skills']  // Auto-generate from content
}
```

**GitHub Agents (.github/agents/):**
```javascript
{
  fieldName: 'tools',
  format: 'array',
  transform: tools => tools.map(t => t.toLowerCase()),
  additionalFields: []  // No skills field
}
```

---

## Part 10: Validation & Testing

### Validation Script

```bash
#!/bin/bash
# validate-frontmatter.sh <file>

FILE=$1
PLATFORM=$2  # claude or github

# Extract frontmatter
awk '/^---$/{flag=!flag;next}flag' "$FILE" > /tmp/frontmatter.yml

# Check for unsupported fields
UNSUPPORTED=("skill_version" "requires_version" "platforms" "arguments" "metadata")
for field in "${UNSUPPORTED[@]}"; do
  if grep -q "^$field:" /tmp/frontmatter.yml; then
    echo "❌ Unsupported field: $field"
    exit 1
  fi
done

# Check field names
if [ "$PLATFORM" = "claude" ]; then
  # Skills must use allowed-tools
  if grep -q "^tools:" /tmp/frontmatter.yml; then
    TYPE=$(basename $(dirname "$FILE"))
    if [ "$TYPE" = "skills" ]; then
      echo "❌ Skills must use 'allowed-tools', not 'tools'"
      exit 1
    fi
  fi
fi

# Check format
if [ "$PLATFORM" = "claude" ]; then
  # Tools must be comma-separated string
  if grep "^tools:\|^allowed-tools:" /tmp/frontmatter.yml | grep -q "\["; then
    echo "❌ Claude tools must be comma-separated string, not array"
    exit 1
  fi
fi

echo "✓ Frontmatter valid"
```

### Test Cases

**Test 1: Unsupported fields removed**
```bash
! grep -r "skill_version:" .claude/skills/*/SKILL.md
! grep -r "metadata:" .github/agents/*.agent.md
```

**Test 2: Correct field names**
```bash
# Claude skills use allowed-tools
grep -r "^allowed-tools:" .claude/skills/*/SKILL.md

# GitHub skills use tools
grep -r "^tools:" .github/skills/*/SKILL.md
```

**Test 3: Format correctness**
```bash
# Claude tools are strings
grep "^tools:" .claude/agents/*.md | grep -v "\["

# GitHub tools are arrays
grep "^tools:" .github/agents/*.agent.md | grep "\["
```

**Test 4: Version files exist**
```bash
# Each skill has version.json
for skill in .github/skills/*/; do
  [ -f "$skill/version.json" ] || echo "Missing: $skill/version.json"
done

# Agents have versions.json
[ -f .github/agents/versions.json ]
```

---

## Part 11: Migration Checklist

### Phase 1: Backup & Analysis
- [ ] Backup all current `.github/` files
- [ ] List all skills with invalid frontmatter
- [ ] List all agents with invalid frontmatter
- [ ] Document tool name mappings needed

### Phase 2: Extract Metadata
- [ ] Extract `skill_version` from all skills
- [ ] Extract `requires_version` from all skills
- [ ] Extract `platforms` from all skills
- [ ] Extract `metadata` blocks
- [ ] Extract `arguments` arrays

### Phase 3: Generate Version Files
- [ ] Create `version.json` for each skill
- [ ] Create `versions.json` for agents
- [ ] Validate JSON syntax
- [ ] Commit version files

### Phase 4: Update Frontmatter
- [ ] Skills: Replace `tools` with `allowed-tools` (Claude)
- [ ] Skills: Convert `arguments` to `argument-hint`
- [ ] Skills: Remove unsupported fields
- [ ] Agents: Fix tools format
- [ ] Agents: Add `skills` field (Claude only)
- [ ] Agents: Remove metadata block

### Phase 5: Tool Name Mapping
- [ ] Map Copilot aliases → Claude canonical
- [ ] Convert arrays → comma-separated strings (Claude)
- [ ] Deduplicate tools
- [ ] Validate tool names

### Phase 6: Validation
- [ ] Run validation script on all files
- [ ] Check version files readable
- [ ] Test skill loading in Claude
- [ ] Test agent loading in Copilot
- [ ] Verify no regressions

---

## Part 12: Common Pitfalls & Solutions

### Pitfall 1: Wrong Field Name in Skills

**Problem:**
```yaml
# ❌ WRONG - skills should use allowed-tools
name: my-skill
tools: Read, Bash
```

**Solution:**
```yaml
# ✓ CORRECT
name: my-skill
allowed-tools: Read, Bash
```

### Pitfall 2: Array Format in Claude

**Problem:**
```yaml
# ❌ WRONG - Claude uses string format
tools: [Read, Bash, Task]
```

**Solution:**
```yaml
# ✓ CORRECT
tools: Read, Bash, Task
```

### Pitfall 3: Arguments Instead of Hint

**Problem:**
```yaml
# ❌ WRONG - arguments array not supported
arguments:
  - name: filename
    required: true
```

**Solution:**
```yaml
# ✓ CORRECT
argument-hint: "<filename>"
```

### Pitfall 4: Metadata in Frontmatter

**Problem:**
```yaml
# ❌ WRONG - metadata not supported
metadata:
  platform: copilot
  version: 1.0.0
```

**Solution:**
```yaml
# ✓ CORRECT - no metadata in frontmatter
# Store in version.json instead
```

### Pitfall 5: Skills Field in GitHub Agents

**Problem:**
```yaml
# ❌ WRONG - GitHub doesn't support skills field
name: my-agent
skills: [code-review, linting]
```

**Solution:**
```yaml
# ✓ CORRECT - omit skills field for GitHub
name: my-agent
# Skills field only for Claude
```

---

## Part 13: Reference Implementation

### Skill Converter

```javascript
class SkillConverter {
  constructor(platform) {
    this.platform = platform; // 'claude' or 'github'
  }
  
  convert(sourceFrontmatter) {
    const converted = {
      name: sourceFrontmatter.name,
      description: sourceFrontmatter.description
    };
    
    // Convert arguments → argument-hint
    if (sourceFrontmatter.arguments) {
      converted['argument-hint'] = this.generateHint(sourceFrontmatter.arguments);
    }
    
    // Convert tools
    if (sourceFrontmatter.tools) {
      const toolField = this.platform === 'claude' ? 'allowed-tools' : 'tools';
      converted[toolField] = this.convertTools(sourceFrontmatter.tools);
    }
    
    return converted;
  }
  
  generateHint(arguments) {
    return arguments
      .map(arg => arg.required ? `<${arg.name}>` : `[${arg.name}]`)
      .join(' ');
  }
  
  convertTools(tools) {
    const toolList = Array.isArray(tools) ? tools : tools.split(',').map(t => t.trim());
    
    if (this.platform === 'claude') {
      const claudeTools = toolList.map(t => this.copilotToClaude(t));
      return claudeTools.join(', ');
    } else {
      return toolList.map(t => t.toLowerCase());
    }
  }
  
  copilotToClaude(tool) {
    const map = {
      'execute': 'Bash',
      'read': 'Read',
      'edit': 'Edit',
      'search': 'Grep',
      'agent': 'Task',
      'web': 'WebSearch'
    };
    return map[tool.toLowerCase()] || tool;
  }
  
  extractMetadata(sourceFrontmatter) {
    return {
      skill_version: sourceFrontmatter.skill_version,
      requires_version: sourceFrontmatter.requires_version,
      platforms: sourceFrontmatter.platforms,
      metadata: sourceFrontmatter.metadata
    };
  }
}

// Usage
const claudeConverter = new SkillConverter('claude');
const githubConverter = new SkillConverter('github');

const source = {
  name: 'gsd-new-project',
  description: 'Create new project',
  tools: ['read', 'edit', 'execute'],
  arguments: [{name: 'domain', required: false}],
  skill_version: '1.9.1'
};

const claudeFrontmatter = claudeConverter.convert(source);
// {
//   name: 'gsd-new-project',
//   description: 'Create new project',
//   'allowed-tools': 'Read, Edit, Bash',
//   'argument-hint': '[domain]'
// }

const githubFrontmatter = githubConverter.convert(source);
// {
//   name: 'gsd-new-project',
//   description: 'Create new project',
//   tools: ['read', 'edit', 'execute'],
//   'argument-hint': '[domain]'
// }

const versionData = claudeConverter.extractMetadata(source);
// { skill_version: '1.9.1', ... }
```

---

## Part 14: Summary & Recommendations

### Key Findings (Verified Against Official Docs)

1. **Unsupported fields are widespread:** `skill_version`, `requires_version`, `platforms`, `arguments`, `metadata` appear in current files but are NOT in official specifications

2. **Field naming differs:** Skills use `allowed-tools` (Claude) vs `tools` (GitHub)

3. **Format differs:** Claude uses comma-separated strings, GitHub uses arrays

4. **Arguments handling:** Must use `argument-hint` string, not `arguments` array

5. **Platform-specific features:** Claude agents support `skills` field, GitHub does not

### Recommendations

**1. Immediate Actions:**
- Remove unsupported fields from ALL frontmatter
- Store metadata in separate version files
- Fix field naming (allowed-tools vs tools)
- Convert arguments → argument-hint

**2. Installer Design:**
- Platform-specific adapters for each target
- Validation before and after conversion
- Version file generation
- Tool name mapping layer

**3. Testing Strategy:**
- Validate all frontmatter before deployment
- Test skills load correctly in Claude
- Test agents load correctly in GitHub
- Verify no functionality loss

**4. Documentation:**
- Document version file format
- Provide migration guide
- Include validation scripts
- Maintain platform comparison reference

### Confidence Assessment

| Area | Confidence | Basis |
|------|------------|-------|
| Claude skills fields | **HIGH** | Official docs at code.claude.com |
| Claude agents fields | **HIGH** | Official docs at code.claude.com |
| GitHub agents fields | **HIGH** | Official docs at docs.github.com |
| Tool aliases | **HIGH** | Official tool alias table |
| Unsupported fields | **HIGH** | Absence from all official docs |
| Tool mappings | **HIGH** | Official alias compatibility table |

**All findings verified against official documentation sources provided.**

---

## Part 15: Path References & Directory Structure

### Directory Structure

**Claude:**
```
.claude/
├── agents/
│   └── {name}.md
├── skills/
│   └── {name}/
│       ├── SKILL.md
│       └── version.json
└── get-shit-done/
    ├── references/
    └── templates/
```

**GitHub Copilot:**
```
.github/
├── agents/
│   ├── {name}.agent.md
│   └── versions.json
├── skills/
│   └── {name}/
│       ├── SKILL.md
│       └── version.json
└── get-shit-done/
    ├── references/
    └── templates/
```

**Key Differences:**
- Agent file extension: `.md` (Claude) vs `.agent.md` (GitHub)
- Agent versions: Stored in per-project `versions.json`
- Skills structure: Same across both platforms
- Path prefixes: `~/.claude/` vs `.github/`

### Path References

**Claude:**
```markdown
@~/.claude/get-shit-done/references/questioning.md
@.planning/PROJECT.md
```

**GitHub Copilot:**
```markdown
@.github/get-shit-done/references/questioning.md
@.planning/PROJECT.md
```

---

## Part 16: Official Documentation Sources

**All specifications verified against these authoritative sources:**

### Claude Code
- **Skills frontmatter:** https://code.claude.com/docs/en/slash-commands#frontmatter-reference
- **Agents frontmatter:** https://code.claude.com/docs/en/sub-agents

### GitHub Copilot
- **Agents configuration:** https://docs.github.com/en/copilot/reference/custom-agents-configuration
- **Tool aliases:** https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases

**Research methodology:**
1. Fetched official documentation pages
2. Extracted frontmatter field tables  
3. Cross-referenced examples
4. Verified tool alias mappings
5. Documented unsupported fields by absence from official specs

**Date:** 2025-01-26  
**Confidence:** HIGH (verified against official documentation, not assumptions)

---

## RESEARCH COMPLETE

**Findings:**
- Unsupported fields identified: `skill_version`, `requires_version`, `platforms`, `arguments`, `metadata`
- Correct field naming documented: `allowed-tools` vs `tools`
- Tool mapping table verified from official GitHub docs
- All corrections in FRONTMATTER-CORRECTIONS.md and AGENT-CORRECTIONS.md are accurate

**Files validated:**
- .planning/FRONTMATTER-CORRECTIONS.md - ✓ Accurate per official docs
- .planning/AGENT-CORRECTIONS.md - ✓ Accurate per official docs

**Confidence:** HIGH - All specifications verified against official documentation sources.
