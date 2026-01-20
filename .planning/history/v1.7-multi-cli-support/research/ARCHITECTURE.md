# Architecture Research: Multi-CLI Tool Development

**Domain:** Multi-backend CLI tooling for AI coding assistants
**Researched:** 2025-01-19
**Confidence:** HIGH

## Executive Summary

Multi-CLI developer tools supporting both GitHub Copilot CLI and Codex CLI should adopt a **plugin/adapter architecture** with a clear separation between core logic (CLI-agnostic) and adapter layers (CLI-specific). This research identifies proven patterns from the ecosystem and provides a specific architectural recommendation for extending GSD to support multiple AI CLI platforms.

Key architectural insight: **The core workflow logic should be CLI-agnostic, with thin adapter layers handling platform-specific concerns** (directory structure, invocation mechanisms, and metadata formats).

## Standard Multi-Backend CLI Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Installation Layer                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ CLI Detector │  │Path Resolver │  │Config Writer │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         └──────────────────┴──────────────────┘              │
├─────────────────────────────────────────────────────────────┤
│                     Conversion Layer                         │
│  ┌─────────────────────────────────────────────────────┐    │
│  │             Format Adapter (Agent ↔ Skill)           │    │
│  │    ┌──────────┐  ┌──────────┐  ┌──────────┐         │    │
│  │    │Agent→Skill│  │Command→  │  │Path      │         │    │
│  │    │Converter  │  │Prompt    │  │Rewriter  │         │    │
│  │    └──────────┘  └──────────┘  └──────────┘         │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                      Core Content Layer                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Commands │ Workflows │ Templates │ References       │    │
│  │  (CLI-agnostic logic and prompts)                    │    │
│  └─────────────────────────────────────────────────────┘    │
├─────────────────────────────────────────────────────────────┤
│                      Target Adapters                         │
│  ┌──────────────────────┐  ┌──────────────────────┐         │
│  │  Copilot Adapter     │  │  Codex Adapter       │         │
│  │  ~/.claude/          │  │  ~/.codex/           │         │
│  │  .claude/            │  │  .codex/             │         │
│  │  agents/*.agent.md   │  │  prompts/*.md        │         │
│  └──────────────────────┘  └──────────────────────┘         │
│  ┌──────────────────────┐                                    │
│  │  GitHub Copilot      │                                    │
│  │  .github/agents/     │                                    │
│  │  .github/skills/     │                                    │
│  └──────────────────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **CLI Detector** | Identify which CLI platform(s) to install for | Check for CLI presence, parse install flags |
| **Path Resolver** | Map target CLI to correct directory structure | Use XDG base directory spec for config, platform-specific paths |
| **Config Writer** | Write platform-specific config files | Template-based generation with platform adapters |
| **Format Adapter** | Convert between source and target formats | Adapter pattern with bidirectional converters |
| **Agent→Skill Converter** | Transform agent definitions to skill format | Markdown frontmatter conversion, file restructuring |
| **Command→Prompt Converter** | Adapt command invocation syntax | Map `/command` to platform-native invocation |
| **Path Rewriter** | Adjust file paths for target platform | Replace `~/.claude` with `~/.codex`, `.github/`, etc. |
| **Core Content** | CLI-agnostic workflow logic | Markdown templates, workflow specs, references |
| **Target Adapters** | Platform-specific output writers | Directory layout, metadata format, invocation wrappers |

## Recommended Project Structure

### Source Repository (Single Codebase)

```
get-shit-done/
├── bin/
│   └── install.js              # Multi-CLI aware installer
├── core/                        # NEW: CLI-agnostic core
│   ├── commands/                # Command definitions (portable)
│   ├── workflows/               # Workflow specs (portable)
│   ├── templates/               # Output templates (portable)
│   └── references/              # Reference docs (portable)
├── adapters/                    # NEW: CLI-specific adapters
│   ├── copilot-cli/             # GitHub Copilot (Claude) adapter
│   │   ├── agent-converter.js   # .agent.md generator
│   │   ├── directory-map.js     # ~/.claude mappings
│   │   └── statusline.json      # Copilot-specific config
│   ├── copilot-github/          # GitHub Copilot (GitHub) adapter
│   │   ├── skill-converter.js   # SKILL.md generator
│   │   ├── directory-map.js     # .github/skills mappings
│   │   └── metadata.js          # GitHub-specific frontmatter
│   └── codex-cli/               # Codex CLI adapter
│       ├── prompt-converter.js  # Prompt format generator
│       ├── directory-map.js     # ~/.codex mappings
│       └── config.js            # Codex-specific config
├── agents/                      # DEPRECATED: Move to core/
├── commands/                    # DEPRECATED: Move to core/
└── package.json
```

### Target Installation (Multi-Platform Output)

**GitHub Copilot CLI (Claude backend):**
```
~/.claude/
└── agents/
    └── gsd-*.agent.md          # Converted from core/
```

**GitHub Copilot CLI (GitHub backend):**
```
.github/
├── agents/
│   └── gsd-*.agent.md          # Custom agents
└── skills/
    └── get-shit-done/
        ├── SKILL.md             # Skill entry point
        ├── commands/            # From core/commands
        ├── workflows/           # From core/workflows
        ├── templates/           # From core/templates
        └── references/          # From core/references
```

**Codex CLI:**
```
~/.codex/
└── prompts/
    └── gsd/
        ├── manifest.json        # Codex metadata
        ├── commands/            # Converted from core/
        └── workflows/           # Converted from core/
```

### Structure Rationale

- **`core/`**: CLI-agnostic content. This is the single source of truth for workflow logic, ensuring changes propagate to all platforms.
- **`adapters/`**: Platform-specific transformation logic. Each adapter knows how to convert core content to its target format and directory structure.
- **Separation of concerns**: Core developers work on workflow logic without CLI-specific concerns. Adapter developers handle platform integration.
- **Testability**: Core logic can be tested independently. Adapters can be tested with fixtures.
- **Extensibility**: Adding support for a new CLI (e.g., Cursor, Windsurf) requires only a new adapter, no core changes.

## Architectural Patterns

### Pattern 1: Plugin/Adapter Architecture

**What:** Core system orchestrates workflow logic; adapters handle platform-specific transformations.

**When to use:** When supporting multiple backends with different APIs or formats (exactly GSD's situation).

**Trade-offs:**
- ✅ **Pros:** Extensible, decoupled, testable independently
- ❌ **Cons:** More complex than single-target, requires adapter maintenance

**Example:**
```javascript
// adapters/copilot-github/skill-converter.js
class CopilotGitHubAdapter {
  convertAgentToSkill(agentPath) {
    const agentContent = fs.readFileSync(agentPath, 'utf-8');
    const skillContent = this.transformAgentToSkill(agentContent);
    const metadata = this.extractMetadata(agentContent);
    
    return {
      content: skillContent,
      frontmatter: this.formatYAMLFrontmatter(metadata),
      outputPath: this.mapSkillPath(agentPath)
    };
  }
  
  transformAgentToSkill(content) {
    // Convert agent format to skill format
    return content
      .replace(/^# Agent: (.+)$/m, '---\nname: $1\n---\n')
      .replace(/\@~\/.claude/g, '@.github/skills/get-shit-done');
  }
}
```

### Pattern 2: Path Rewriting Layer

**What:** Dynamically adjust file paths during installation based on target CLI's directory conventions.

**When to use:** When different CLIs use different config directories (`~/.claude`, `~/.codex`, `.github/`).

**Trade-offs:**
- ✅ **Pros:** Single source, multiple targets; no duplicate content
- ❌ **Cons:** Must track all path references; breakage if paths hardcoded

**Example:**
```javascript
// adapters/base-adapter.js
class BaseAdapter {
  rewritePaths(content, pathMap) {
    let rewritten = content;
    for (const [sourcePath, targetPath] of Object.entries(pathMap)) {
      const regex = new RegExp(sourcePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      rewritten = rewritten.replace(regex, targetPath);
    }
    return rewritten;
  }
}

// adapters/copilot-github/directory-map.js
const pathMap = {
  '~/.claude': '.github/skills/get-shit-done',
  '~/.claude/agents': '.github/agents',
  '/gsd:': 'gsd:',  // Remove leading slash for GitHub Copilot
};
```

### Pattern 3: Conversion Layer Pattern

**What:** Transform between internal format and multiple output formats (Agent ↔ Skill, Command ↔ Prompt).

**When to use:** When target platforms expect different metadata or structural formats.

**Trade-offs:**
- ✅ **Pros:** Clean separation, format-agnostic core
- ❌ **Cons:** Conversion bugs can cause subtle issues; must maintain converters

**Example:**
```javascript
// adapters/copilot-github/agent-converter.js
class AgentToSkillConverter {
  convert(agentDefinition) {
    return {
      // GitHub Copilot Skills use YAML frontmatter
      frontmatter: {
        name: agentDefinition.name,
        description: agentDefinition.description,
        // Skills don't have "model" or "capabilities" in frontmatter
      },
      // Convert agent body to skill instructions
      body: this.convertInstructions(agentDefinition.instructions),
      // Map tool invocations
      toolMappings: this.mapTools(agentDefinition.tools),
    };
  }
  
  convertInstructions(instructions) {
    // Convert agent-specific directives to skill format
    return instructions
      .replace(/<agent_type>/g, '') // Remove agent-specific tags
      .replace(/Task tool/g, 'Custom agent from .github/agents');
  }
}
```

### Pattern 4: Configuration Detection

**What:** Detect which CLI(s) are installed or requested, then route to appropriate adapter(s).

**When to use:** Installation time, to determine output targets.

**Trade-offs:**
- ✅ **Pros:** User-friendly (auto-detects), supports multi-install
- ❌ **Cons:** Detection logic can be fragile

**Example:**
```javascript
// bin/install.js
function detectTargetCLIs(args, env) {
  const targets = [];
  
  // Explicit flags
  if (args.includes('--copilot-cli')) {
    targets.push({ type: 'copilot-cli', backend: 'claude' });
  }
  if (args.includes('--copilot')) {
    targets.push({ type: 'copilot-github', backend: 'github' });
  }
  if (args.includes('--codex')) {
    targets.push({ type: 'codex-cli', backend: 'openai' });
  }
  
  // Auto-detect if no explicit flags
  if (targets.length === 0) {
    if (fs.existsSync(path.join(os.homedir(), '.claude'))) {
      targets.push({ type: 'copilot-cli', backend: 'claude' });
    }
    if (fs.existsSync(path.join(process.cwd(), '.github'))) {
      targets.push({ type: 'copilot-github', backend: 'github' });
    }
  }
  
  return targets;
}
```

## Data Flow

### Installation Flow

```
User runs: npx get-shit-done --copilot

    ↓
[CLI Detector] → Identify targets (GitHub Copilot)
    ↓
[Path Resolver] → Determine target directories (.github/skills/, .github/agents/)
    ↓
[Load Adapter] → CopilotGitHubAdapter
    ↓
[Core Content] → Read from core/commands, core/workflows, etc.
    ↓
[Format Conversion] → Agent→Skill, Path Rewriting
    ↓
[Write Output] → .github/skills/get-shit-done/*, .github/agents/*
    ↓
[Success] ✓ Installed for GitHub Copilot (GitHub backend)
```

### Command Execution Flow (GitHub Copilot Skill)

```
User types: gsd:new-project

    ↓
[GitHub Copilot] → Loads .github/skills/get-shit-done/SKILL.md
    ↓
[Skill Entry Point] → Routes to commands/gsd/new-project.md
    ↓
[Command Definition] → Loads @referenced files (workflows, templates)
    ↓
[Workflow Execution] → Spawns agents from .github/agents/
    ↓
[Template Application] → Generates output using templates/
    ↓
[Result] → Writes to .planning/, .gsd/, etc.
```

### Command Execution Flow (Claude Code Agent)

```
User types: /gsd:new-project

    ↓
[Claude Code] → Loads ~/.claude/agents/gsd-orchestrator.agent.md
    ↓
[Agent Instructions] → Routes to command logic
    ↓
[Workflow Execution] → Spawns subagents using Task tool
    ↓
[Template Application] → Generates output
    ↓
[Result] → Writes to .planning/, .gsd/, etc.
```

### Key Data Flows

1. **Installation-time conversion:** Core content → Adapter → Platform-specific output
2. **Runtime path resolution:** Command references `@path` → Adapter resolves to CLI-specific path
3. **Cross-platform state:** `.planning/` and `.gsd/` are CLI-agnostic, shared by all platforms

## CLI Platform Differences

### GitHub Copilot CLI (Claude) vs GitHub Copilot CLI (GitHub) vs Codex

| Aspect | Copilot CLI (Claude) | Copilot CLI (GitHub) | Codex CLI |
|--------|---------------------|---------------------|-----------|
| **Config directory** | `~/.claude/` (global)<br>`.claude/` (local) | `.github/` (local only) | `~/.codex/` (global) |
| **Agent format** | `*.agent.md` with frontmatter | `*.agent.md` with frontmatter | Prompts in JSON/MD |
| **Command invocation** | `/gsd:command` | `gsd:command` (no slash) | `codex gsd:command` |
| **Skill/plugin format** | N/A (uses agents) | `SKILL.md` with YAML frontmatter | Prompts with `manifest.json` |
| **Tool invocation** | Task tool (spawns agents) | Custom agents, task tool | API-based, agentic |
| **Context loading** | `@path` references | `@path` references | Manual import |
| **Autonomy** | Synchronous, user-driven | Synchronous, user-driven | Asynchronous, agent-driven |
| **Best for** | Daily development tasks | Repo-specific workflows | Autonomous coding agents |

### Conversion Mapping

| Source (Core) | Copilot CLI (Claude) | Copilot CLI (GitHub) | Codex CLI |
|---------------|---------------------|---------------------|-----------|
| `core/commands/gsd/new-project.md` | `~/.claude/agents/gsd-orchestrator.agent.md` (embed) | `.github/skills/get-shit-done/commands/gsd/new-project.md` | `~/.codex/prompts/gsd/new-project.json` |
| `core/workflows/plan-phase.md` | Embedded in agent | `.github/skills/get-shit-done/workflows/plan-phase.md` | `~/.codex/prompts/gsd/workflows/plan-phase.json` |
| `agents/gsd-planner.md` | `~/.claude/agents/gsd-planner.agent.md` | `.github/agents/gsd-planner.agent.md` | `~/.codex/prompts/gsd/gsd-planner.json` |
| Path: `~/.claude` | `~/.claude` (unchanged) | `.github/skills/get-shit-done` | `~/.codex/prompts/gsd` |
| Command: `/gsd:` | `/gsd:` (unchanged) | `gsd:` (remove slash) | `codex gsd:` (prefix CLI) |

## Build Order and Dependencies

### Phase 1: Core Refactoring (Foundation)

**Goal:** Establish CLI-agnostic core

**Tasks:**
1. Create `core/` directory structure
2. Move existing content from `commands/`, `workflows/`, `templates/` to `core/`
3. Audit all path references (change to generic markers like `{{CONFIG_DIR}}`)
4. Update internal cross-references to be relative

**Dependencies:** None
**Output:** Clean, portable core content

### Phase 2: Adapter Framework (Infrastructure)

**Goal:** Build adapter abstraction and GitHub Copilot adapter

**Tasks:**
1. Create `adapters/` directory
2. Build `BaseAdapter` class with common methods (path rewriting, file copying)
3. Implement `CopilotGitHubAdapter` (skill format)
4. Implement path mapping and conversion logic

**Dependencies:** Phase 1 (core content must be portable)
**Output:** Working adapter for GitHub Copilot (.github)

### Phase 3: Installer Refactoring (Integration)

**Goal:** Multi-CLI aware installation

**Tasks:**
1. Update `bin/install.js` to detect target CLI(s)
2. Add adapter selection logic
3. Implement parallel installation (can install for multiple CLIs)
4. Add `--target` flag for explicit targeting

**Dependencies:** Phase 2 (adapters must exist)
**Output:** Installer that can target GitHub Copilot (.github)

### Phase 4: Additional Adapters (Expansion)

**Goal:** Support Codex and other CLIs

**Tasks:**
1. Implement `CodexAdapter` (prompt format, manifest.json)
2. Implement `CopilotCLIAdapter` (agent format, ~/.claude) if not default
3. Add adapter-specific tests

**Dependencies:** Phase 3 (installer must support multiple adapters)
**Output:** Full multi-CLI support

### Phase 5: Validation and Documentation (Polish)

**Goal:** Ensure correctness and usability

**Tasks:**
1. Integration tests (install to each CLI, run sample command)
2. Update README with multi-CLI instructions
3. Add migration guide (single-CLI → multi-CLI)
4. Document adapter API for community extensions

**Dependencies:** Phase 4 (all adapters implemented)
**Output:** Production-ready multi-CLI GSD

## Integration Points

### External CLIs

| CLI | Integration Pattern | Notes |
|-----|---------------------|-------|
| **GitHub Copilot (GitHub)** | Skill format in `.github/skills/` | Uses YAML frontmatter, `gsd:` prefix (no slash) |
| **GitHub Copilot (Claude)** | Agent format in `~/.claude/agents/` | Uses frontmatter, `/gsd:` prefix |
| **Codex CLI** | Prompt format in `~/.codex/prompts/` | Uses `manifest.json`, `codex gsd:` invocation |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **Core ↔ Adapter** | Read-only (core), write-only (adapter) | Core never knows about adapters; adapters read core |
| **Adapter ↔ Installer** | Function calls | Installer invokes adapter methods with target paths |
| **Installer ↔ User** | CLI flags, environment variables | Support `--target`, `--config-dir`, `CLAUDE_CONFIG_DIR`, etc. |

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **1-2 CLIs** | Simple adapters, inline conversion logic (current state) |
| **3-5 CLIs** | Adapter framework, shared base class, plugin system |
| **6+ CLIs** | Community-contributed adapters, adapter marketplace, versioned adapter API |

### Scaling Priorities

1. **First challenge:** Maintaining adapter compatibility as CLI platforms evolve
   - **Solution:** Version adapters alongside CLI versions; adapter API versioning
2. **Second challenge:** Core content changes breaking adapters
   - **Solution:** Contract testing; adapters test against core fixtures
3. **Third challenge:** Community contributions (new adapters)
   - **Solution:** Adapter development guide, testing harness, CI validation

## Anti-Patterns

### Anti-Pattern 1: CLI-Specific Logic in Core

**What people do:** Add `if (isCopilot)` checks in core workflow logic

**Why it's wrong:** 
- Core becomes coupled to specific CLIs
- New CLIs require core changes
- Testing becomes complex (need all CLIs to test)

**Do this instead:** 
- Keep core CLI-agnostic
- Use adapter layer to handle platform differences
- Define clear adapter contracts

**Example:**
```javascript
// ❌ BAD: CLI-specific logic in core
function generateCommand(name, isCopilot) {
  const prefix = isCopilot ? 'gsd:' : '/gsd:';
  return `${prefix}${name}`;
}

// ✅ GOOD: Adapter handles platform differences
// core/commands/template.js
function generateCommand(name) {
  return `{{COMMAND_PREFIX}}${name}`;  // Generic marker
}

// adapters/copilot-github/adapter.js
function adaptCommand(template) {
  return template.replace(/\{\{COMMAND_PREFIX\}\}/g, 'gsd:');
}
```

### Anti-Pattern 2: Hardcoded Paths

**What people do:** Use absolute paths like `~/.claude/agents/` in templates and workflows

**Why it's wrong:**
- Can't adapt to different CLIs
- Local vs global installs break
- Custom config directories not supported

**Do this instead:**
- Use path markers: `{{CONFIG_DIR}}/agents/`
- Adapter resolves markers at installation time
- Document path conventions

### Anti-Pattern 3: Format Duplication

**What people do:** Maintain separate copies of content for each CLI (e.g., `commands-copilot/`, `commands-codex/`)

**Why it's wrong:**
- Drift between versions
- Update must be done multiple times
- Increases maintenance burden

**Do this instead:**
- Single source of truth in `core/`
- Adapters transform at installation
- Use templates with format markers

### Anti-Pattern 4: Adapter-Specific Testing Only

**What people do:** Test adapters in isolation without testing core content

**Why it's wrong:**
- Core changes can break all adapters
- No guarantee adapters produce valid output
- Integration issues discovered late

**Do this instead:**
- Test core content independently (logic, templates)
- Test adapters with fixtures (conversion correctness)
- Integration tests (end-to-end: install → run command)

## Migration Path (Existing GSD → Multi-CLI GSD)

### Phase 1: Backward-Compatible Refactor
1. Keep existing structure working
2. Add `core/` directory alongside existing directories
3. Add first adapter (GitHub Copilot) that reads from `core/`
4. Installation defaults to current behavior (Claude)

### Phase 2: Dual Support
1. Support both old structure (agents/) and new structure (core/)
2. Add deprecation warnings
3. Documentation updated to show new structure

### Phase 3: Migration Complete
1. Remove old structure
2. All installs use adapter system
3. Default adapter: GitHub Copilot (most users)

## Sources

**HIGH Confidence:**
- Plugin/Adapter Architecture: https://peerdh.com/blogs/programming-insights/designing-a-plugin-architecture-for-extensible-cli-applications-3
- Adapter Design Pattern: https://www.geeksforgeeks.org/system-design/adapter-pattern/
- Multi-Backend CLI Best Practices: https://bettercli.org/
- XDG Base Directory Specification: https://www.datacamp.com/tutorial/dotfiles
- Conversion Layer Pattern: https://www.momentslog.com/development/design-pattern/supporting-multiple-data-formats-with-the-adapter-pattern
- Real-world Example (Repomix multi-format): https://dev.to/jongwan93/a-deep-dive-into-repomix-how-a-simple-style-flag-powers-multiple-output-formats-1caa

**MEDIUM Confidence:**
- GitHub Copilot Agents vs Skills: https://github.com/orgs/community/discussions/183962
- VS Code Agent Skills: https://code.visualstudio.com/docs/copilot/customization/agent-skills
- GitHub Copilot Customization: https://blog.cloud-eng.nl/2025/12/22/copilot-customization/

**LOW Confidence (Codex-specific):**
- Codex CLI architecture (limited official documentation, deprecated API)
- Codex vs Copilot comparison: https://milvus.io/ai-quick-reference/whats-the-difference-between-codex-and-copilot

---

*Architecture research for: Multi-CLI Developer Tool (GSD)*
*Researched: 2025-01-19*
