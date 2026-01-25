# Platform Differences: Claude vs GitHub Copilot CLI

**Research Date:** 2025-01-25
**Confidence:** HIGH (based on existing codebase analysis)
**Source:** Direct comparison of `.claude/` vs `.github/` implementations

---

## Executive Summary

Claude and GitHub Copilot CLI share similar extensibility models but differ in:
1. **Directory structure** - `.claude/` vs `.github/` roots, different skill locations
2. **File naming** - Agents use `.md` vs `.agent.md`, skills live in subdirectories
3. **Tool syntax** - Capitalized comma-separated vs lowercase JSON arrays
4. **Metadata requirements** - GitHub requires additional `metadata` block
5. **Path references** - `~/.claude/` vs `.github/` prefixes for shared resources

Both platforms support the same core capabilities: agents (sub-agents), skills (slash commands), hooks, and shared resources.

---

## Directory Structure Comparison

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

## Frontmatter Field Mapping

### Agents (Sub-agents)

#### Claude Agent Frontmatter
```yaml
---
name: agent-name
description: Agent purpose and context
tools: Read, Write, Edit, Bash, Grep, Glob, WebSearch, WebFetch, Task
---
```

#### GitHub Copilot Agent Frontmatter
```yaml
---
name: agent-name
description: Agent purpose and context
tools: [read, edit, execute, search, agent]
metadata:
  platform: copilot
  generated: '2026-01-24'
  templateVersion: 1.0.0
  projectVersion: 1.9.0
  projectName: 'project-name'
---
```

**Differences:**
| Field | Claude | GitHub Copilot | Required? |
|-------|--------|----------------|-----------|
| `name` | Present | Present | Both ✓ |
| `description` | Present | Present | Both ✓ |
| `tools` | Comma-separated, capitalized | JSON array, lowercase | Both ✓ |
| `metadata` | Not present | Required block | GitHub only |

### Skills (Slash Commands)

#### Claude Skill Frontmatter
```yaml
---
name: command-name
description: Command purpose
skill_version: 1.9.1
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools: Read, Write, Bash, Task
arguments: [{name: arg1, type: string, required: false, description: 'Arg description'}]
---
```

#### GitHub Copilot Skill Frontmatter
```yaml
---
name: command-name
description: Command purpose
skill_version: 1.9.1
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools: [read, edit, execute, agent]
arguments: [{name: arg1, type: string, required: false, description: 'Arg description'}]
metadata:
  platform: copilot
  generated: '2026-01-24'
  templateVersion: 1.0.0
  projectVersion: 1.9.0
  projectName: 'project-name'
---
```

**Differences:**
| Field | Claude | GitHub Copilot | Notes |
|-------|--------|----------------|-------|
| `name` | Present | Present | Identical |
| `description` | Present | Present | Identical |
| `skill_version` | Present | Present | Identical |
| `requires_version` | Present | Present | Identical |
| `platforms` | Array | Array | Identical |
| `tools` | Comma-separated | JSON array | Different syntax |
| `arguments` | JSON array | JSON array | Identical structure |
| `metadata` | Not present | Required block | GitHub only |

---

## Tool Name Mappings

Tools are the primary difference between platforms. GitHub Copilot uses standardized tool names with aliases.

### Tool Mapping Table

| Claude Tool | GitHub Copilot Tool | Category | Notes |
|-------------|---------------------|----------|-------|
| `Read` | `read` | File I/O | Case difference |
| `Write` | `edit` | File I/O | **Name change** - GitHub uses `edit` for creation & modification |
| `Edit` | `edit` | File I/O | GitHub consolidates Write/Edit into `edit` |
| `Bash` | `execute` | Shell | **Name change** |
| `Grep` | `search` | Code search | **Name change** |
| `Glob` | `search` | File search | GitHub consolidates into `search` |
| `WebSearch` | Not available* | Web | Claude-specific (or MCP extension) |
| `WebFetch` | Not available* | Web | Claude-specific (or MCP extension) |
| `Task` | `agent` | Delegation | **Name change** |
| `TodoWrite` | Not available* | Special | Claude-specific |
| `AskUserQuestion` | Direct chat | User interaction | Not a tool, handled differently |
| `mcp__context7__*` | Not available* | MCP | Claude-specific extensions |

\*GitHub Copilot may support these through extensions, but not in base configuration.

### Tool Transformation Rules

When converting Claude → GitHub Copilot:
```javascript
const toolMap = {
  'Read': 'read',
  'Write': 'edit',
  'Edit': 'edit',
  'Bash': 'execute',
  'Grep': 'search',
  'Glob': 'search',
  'Task': 'agent',
  // Platform-specific tools that may need removal or special handling
  'WebSearch': null,      // Remove or flag as unavailable
  'WebFetch': null,       // Remove or flag as unavailable
  'TodoWrite': null,      // Remove or flag as unavailable
  'AskUserQuestion': null // Convert to instruction to ask in chat
};

// Algorithm:
// 1. Split Claude tools by comma
// 2. Trim whitespace
// 3. Map to GitHub equivalent
// 4. Remove nulls (unavailable tools)
// 5. Deduplicate (Write+Edit both → 'edit')
// 6. Output as JSON array
```

Example transformation:
```yaml
# Claude
tools: Read, Write, Edit, Bash, Grep, Glob, Task

# GitHub Copilot
tools: [read, edit, execute, search, agent]
```

---

## Path Reference Transformations

File references use `@` prefix but differ in root paths.

### Claude Path References
```markdown
# Absolute platform paths (in skill root directory context)
@~/.claude/get-shit-done/references/questioning.md
@~/.claude/get-shit-done/templates/project.md

# Relative project paths (same across platforms)
@.planning/PROJECT.md
@.planning/ROADMAP.md
```

### GitHub Copilot Path References
```markdown
# Absolute platform paths
@.github/get-shit-done/references/questioning.md
@.github/get-shit-done/templates/project.md

# Relative project paths (same across platforms)
@.planning/PROJECT.md
@.planning/ROADMAP.md
```

### Transformation Rules

| Pattern | Claude | GitHub Copilot |
|---------|--------|----------------|
| Platform root | `~/.claude/` | `.github/` |
| Shared resources | `~/.claude/get-shit-done/` | `.github/get-shit-done/` |
| Skill location (runtime) | `/home/sandbox/Library/Application Support/Claude/skills/` | `/workspace/.github/copilot/skills/` |
| Agent location (runtime) | `/home/sandbox/Library/Application Support/Claude/agents/` | `/workspace/.github/copilot/agents/` |
| Project files | `.planning/` | `.planning/` (no change) |

**Transformation algorithm:**
```javascript
function transformPath(claudePath) {
  return claudePath
    .replace(/^@~\/.claude\//, '@.github/')
    .replace(/\/home\/sandbox\/Library\/Application Support\/Claude\//, '/workspace/.github/copilot/')
}
```

---

## Platform-Specific Requirements

### Claude Code Requirements

1. **File naming:**
   - Agents: `{name}.md`
   - Skills: `{command-name}/SKILL.md`

2. **Tool syntax:**
   - Comma-separated list
   - Capitalized tool names
   - Example: `tools: Read, Write, Bash`

3. **Settings:**
   - Optional `settings.json` for hooks and statusLine

4. **Hooks:**
   - Supported via `.claude/hooks/`
   - Can be JavaScript or shell scripts

### GitHub Copilot CLI Requirements

1. **File naming:**
   - Agents: `{name}.agent.md` (must include `.agent` suffix)
   - Skills: `{command-name}/SKILL.md` (same as Claude)

2. **Tool syntax:**
   - JSON array format
   - Lowercase tool names
   - Example: `tools: [read, edit, execute]`

3. **Metadata block:**
   - **Required** in frontmatter
   - Must include: `platform`, `generated`, `templateVersion`, `projectVersion`, `projectName`
   - Example:
     ```yaml
     metadata:
       platform: copilot
       generated: '2026-01-24'
       templateVersion: 1.0.0
       projectVersion: 1.9.0
       projectName: 'project-name'
     ```

4. **Hooks:**
   - No direct equivalent discovered
   - May need alternative implementation

5. **Tool aliases (official documentation):**
   - Supports aliasing common tool patterns
   - Documented at: https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases
   - Not yet implemented in observed codebase

---

## Shared Patterns (No Transformation Needed)

These elements are identical across platforms:

1. **Skill directory structure:**
   - One directory per skill
   - `SKILL.md` in each directory
   - Additional files (VERSION, CHANGELOG.md) supported

2. **Shared resources structure:**
   - `references/` for reference documentation
   - `templates/` for templates
   - `workflows/` for workflow definitions

3. **Arguments definition:**
   - JSON array format
   - Fields: `name`, `type`, `required`, `description`

4. **Platforms field:**
   - Array listing supported platforms
   - Common values: `[claude, copilot, codex]`

5. **Versioning fields:**
   - `skill_version` for skill version
   - `requires_version` for minimum GSD version

6. **Markdown body:**
   - Everything after frontmatter is identical
   - Uses same XML tags: `<objective>`, `<process>`, `<role>`, etc.

---

## Recommended Adapter Architecture

Based on the analysis, the installer should support multiple adapters:

### 1. Universal Template Format (Internal)

Keep source templates in a neutral format:
```yaml
---
name: {{NAME}}
description: {{DESCRIPTION}}
skill_version: {{VERSION}}
requires_version: {{MIN_VERSION}}
platforms: {{PLATFORMS}}
tools:
  - read
  - edit
  - execute
  - search
  - agent
  - bash  # Will be transformed per platform
  - websearch  # Optional - may not be available on all platforms
arguments: {{ARGUMENTS}}
# Platform-specific fields injected at generation time
---
{{BODY}}
```

### 2. Platform Adapters

Each adapter handles platform-specific transformations:

```javascript
class ClaudeAdapter {
  transformTools(tools) {
    const map = {
      'read': 'Read',
      'edit': 'Edit',
      'execute': 'Bash',
      'search': 'Grep',
      'agent': 'Task'
    };
    return tools.map(t => map[t] || t).join(', ');
  }
  
  transformFrontmatter(universal) {
    return {
      name: universal.name,
      description: universal.description,
      tools: this.transformTools(universal.tools)
      // No metadata block for Claude
    };
  }
  
  transformPath(path) {
    return path.replace(/__PLATFORM__/g, '~/.claude');
  }
  
  getFileExtension(type) {
    return type === 'agent' ? '.md' : '/SKILL.md';
  }
  
  getTargetDir() {
    return '.claude';
  }
}

class CopilotAdapter {
  transformTools(tools) {
    const map = {
      'read': 'read',
      'edit': 'edit',
      'execute': 'execute',
      'search': 'search',
      'agent': 'agent'
    };
    // Deduplicate and filter available tools
    return [...new Set(tools.map(t => map[t]).filter(Boolean))];
  }
  
  transformFrontmatter(universal, metadata) {
    return {
      name: universal.name,
      description: universal.description,
      tools: this.transformTools(universal.tools),
      metadata: {
        platform: 'copilot',
        generated: new Date().toISOString().split('T')[0],
        templateVersion: metadata.templateVersion,
        projectVersion: metadata.projectVersion,
        projectName: metadata.projectName
      }
    };
  }
  
  transformPath(path) {
    return path.replace(/__PLATFORM__/g, '.github');
  }
  
  getFileExtension(type) {
    return type === 'agent' ? '.agent.md' : '/SKILL.md';
  }
  
  getTargetDir() {
    return '.github';
  }
}
```

### 3. Installer Flow

```javascript
class SkillInstaller {
  constructor(adapter) {
    this.adapter = adapter;
  }
  
  install(universalTemplate, metadata) {
    // 1. Transform frontmatter
    const frontmatter = this.adapter.transformFrontmatter(
      universalTemplate.frontmatter,
      metadata
    );
    
    // 2. Transform body paths
    const body = universalTemplate.body.replace(
      /@__PLATFORM__\//g,
      `@${this.adapter.getTargetDir()}/`
    );
    
    // 3. Build output
    const output = this.buildMarkdown(frontmatter, body);
    
    // 4. Write to platform-specific location
    const targetPath = this.adapter.getTargetDir() + 
      '/' + universalTemplate.type + 's/' +
      universalTemplate.name +
      this.adapter.getFileExtension(universalTemplate.type);
    
    fs.writeFileSync(targetPath, output);
  }
  
  buildMarkdown(frontmatter, body) {
    return '---\n' + 
           yaml.stringify(frontmatter) + 
           '---\n\n' + 
           body;
  }
}

// Usage
const claudeInstaller = new SkillInstaller(new ClaudeAdapter());
const copilotInstaller = new SkillInstaller(new CopilotAdapter());

// Install to both platforms
claudeInstaller.install(template, metadata);
copilotInstaller.install(template, metadata);
```

### 4. Template Placeholders

Use platform-agnostic placeholders in source templates:

| Placeholder | Claude | GitHub Copilot |
|-------------|--------|----------------|
| `__PLATFORM__` | `.claude` | `.github` |
| `__PLATFORM_ROOT__` | `~/.claude` | `.github` |
| `__SKILL_PATH__` | `/home/sandbox/.../Claude/skills/` | `/workspace/.github/copilot/skills/` |
| `__AGENT_PATH__` | `/home/sandbox/.../Claude/agents/` | `/workspace/.github/copilot/agents/` |

Example template:
```markdown
@__PLATFORM_ROOT__/get-shit-done/references/questioning.md
@.planning/PROJECT.md
```

Transforms to:
- Claude: `@~/.claude/get-shit-done/references/questioning.md`
- GitHub: `@.github/get-shit-done/references/questioning.md`

---

## Validation Checklist

When implementing cross-platform support, validate:

### Agent Files
- [ ] Correct file extension (`.md` vs `.agent.md`)
- [ ] Tools in correct format (capitalized comma-list vs lowercase array)
- [ ] Metadata block present (GitHub only)
- [ ] Path references use correct root
- [ ] File written to correct directory

### Skill Files
- [ ] Correct file extension (`SKILL.md` same for both)
- [ ] Tools in correct format
- [ ] Metadata block present (GitHub only)
- [ ] Path references use correct root
- [ ] Arguments array format correct
- [ ] Directory structure correct

### Shared Resources
- [ ] Correct root directory (`.claude/` vs `.github/`)
- [ ] Same internal structure (`references/`, `templates/`, `workflows/`)
- [ ] No platform-specific content in shared files

### Tool Availability
- [ ] All specified tools available on target platform
- [ ] Fallback handling for unavailable tools
- [ ] User notified if features unavailable

---

## Testing Strategy

### Test Matrix

| Test Case | Claude | GitHub Copilot |
|-----------|--------|----------------|
| Agent creation | `.md` file in `.claude/agents/` | `.agent.md` file in `.github/agents/` |
| Skill creation | `SKILL.md` in `.claude/skills/{name}/` | `SKILL.md` in `.github/skills/{name}/` |
| Tool parsing | Comma-separated capitalized | JSON array lowercase |
| Path resolution | `~/.claude/` resolves | `.github/` resolves |
| Metadata presence | Absent (valid) | Present (required) |
| Tool deduplication | Not needed | `[edit, edit]` → `[edit]` |

### Validation Script

```bash
#!/bin/bash
# validate-platform.sh <platform>

PLATFORM=$1

if [ "$PLATFORM" = "claude" ]; then
  ROOT=".claude"
  AGENT_EXT=".md"
elif [ "$PLATFORM" = "copilot" ]; then
  ROOT=".github"
  AGENT_EXT=".agent.md"
else
  echo "Unknown platform: $PLATFORM"
  exit 1
fi

# Check structure
[ -d "$ROOT/agents" ] || echo "Missing agents directory"
[ -d "$ROOT/skills" ] || echo "Missing skills directory"
[ -d "$ROOT/get-shit-done" ] || echo "Missing shared resources"

# Check agent files
for agent in $ROOT/agents/*$AGENT_EXT; do
  echo "Validating $agent"
  # Check frontmatter format
  # Check tool syntax
  # Check metadata presence (GitHub only)
done

# Check skill files
for skill in $ROOT/skills/*/SKILL.md; do
  echo "Validating $skill"
  # Check frontmatter format
  # Check tool syntax
  # Check metadata presence (GitHub only)
done
```

---

## Known Limitations & Gotchas

### 1. Tool Availability

**Issue:** Claude supports tools that GitHub Copilot doesn't have direct equivalents for.

**Affected tools:**
- `WebSearch` - Claude-specific or MCP extension
- `WebFetch` - Claude-specific or MCP extension
- `TodoWrite` - Claude-specific
- `mcp__context7__*` - MCP extensions

**Mitigation:**
- Remove unsupported tools during transformation
- Add note in skill description if functionality reduced
- Consider alternative implementations (e.g., manual web lookup instructions)

### 2. Hooks Support

**Issue:** Claude supports hooks (`.claude/hooks/`), GitHub Copilot has no equivalent.

**Affected features:**
- Session start hooks
- Status line customization
- Pre-commit hooks

**Mitigation:**
- Skip hooks when installing to GitHub Copilot
- Document manual alternatives (GitHub Actions, git hooks)
- Warn user if installing hook-dependent functionality

### 3. Metadata Overhead

**Issue:** GitHub Copilot requires metadata block, adding boilerplate.

**Mitigation:**
- Auto-generate metadata during installation
- Use sensible defaults: `platform: copilot`, `templateVersion: 1.0.0`
- Include project name from installation context

### 4. Write vs Edit Consolidation

**Issue:** Claude distinguishes `Write` (create) and `Edit` (modify), GitHub Copilot uses `edit` for both.

**Observed behavior:** GitHub Copilot uses `edit` tool even when creating new files.

**Mitigation:**
- Always map both `Write` and `Edit` to `edit` in GitHub
- Deduplicate resulting tool list

### 5. Case Sensitivity

**Issue:** Tool names are case-sensitive in frontmatter parsing.

**Mitigation:**
- Normalize case during transformation
- Claude: `Read` → GitHub: `read`
- Never mix cases in source templates

---

## Official Documentation Sources

### Claude Code
- Sub-agents: https://code.claude.com/docs/en/sub-agents
- Skills: https://code.claude.com/docs/en/slash-commands
- Frontmatter reference: https://code.claude.com/docs/en/slash-commands#frontmatter-reference

### GitHub Copilot CLI
- Custom agents: https://docs.github.com/en/copilot/reference/custom-agents-configuration
- Tool aliases: https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases

**Note:** Official documentation provides normative references but observed codebase provides implementation details. Both sources have been considered in this analysis.

---

## Recommendations for Installer

### 1. Multi-Platform Installation

**Recommendation:** Install to BOTH platforms by default.

**Rationale:**
- User may switch between platforms
- Minimal additional cost (just file duplication with transformations)
- Avoids confusing "skill not found" errors

**Implementation:**
```javascript
installer.install({
  targets: ['claude', 'copilot'],
  sourceTemplate: 'templates/gsd-new-project.md',
  metadata: { projectVersion: '1.9.0', projectName: 'my-project' }
});
```

### 2. Graceful Degradation

**Recommendation:** Warn about unavailable features but don't fail installation.

**Implementation:**
```javascript
const unavailableTools = ['WebSearch', 'WebFetch'];
if (unavailableTools.length > 0) {
  console.warn(`⚠️  GitHub Copilot doesn't support: ${unavailableTools.join(', ')}`);
  console.warn(`   Some features may be limited.`);
}
```

### 3. Template Validation

**Recommendation:** Validate templates before transformation.

**Checks:**
- All `@__PLATFORM__` placeholders present
- Tool names are valid
- Frontmatter fields complete
- Arguments array well-formed

### 4. Platform Detection

**Recommendation:** Auto-detect current platform and prioritize that installation.

**Implementation:**
```javascript
function detectPlatform() {
  if (fs.existsSync('.claude/settings.json')) return 'claude';
  if (fs.existsSync('.github/copilot-instructions.md')) return 'copilot';
  return null; // Install both
}
```

### 5. Idempotent Installation

**Recommendation:** Support re-running installation to update existing skills.

**Implementation:**
- Check if target files exist
- Compare versions
- Update if source is newer
- Preserve user modifications (git diff check)

---

## Conclusion

The Claude and GitHub Copilot platforms are highly compatible with systematic differences in:
- **Syntax** (tool naming, frontmatter format)
- **Paths** (`.claude/` vs `.github/`)
- **Metadata** (optional vs required)
- **Tool availability** (Claude has more MCP integrations)

**Recommendation:** Build a platform-agnostic installer with adapter pattern. Generate platform-specific files from universal templates at installation time.

**Complexity estimate:** Medium - mostly string transformations and file I/O, but requires careful handling of tool mapping and path resolution.

**Risk level:** Low - platforms are similar enough that bugs will be obvious during testing, and worst case is a malformed frontmatter that fails fast.
