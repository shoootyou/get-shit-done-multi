# What Gets Installed

When you run `npx get-shit-done-multi`, the installer copies three types of files to your platform directory:

1. **Skills** (29 files) - Commands you invoke (e.g., `/gsd-plan-phase`)
2. **Agents** (13 files) - Specialized sub-agents (e.g., gsd-executor)
3. **Shared Directory** (1 folder) - References, templates, workflows

**Total size:** Approximately 2MB

---

## Skills (29 total)

Skills are slash commands that you invoke directly in your AI assistant. Each skill provides a specific capability in the GSD workflow.

### Core Workflow Skills

**Project & Milestone Management:**
- `/gsd-new-project` - Start new project with research and roadmap
- `/gsd-new-milestone` - Add new milestone to existing project
- `/gsd-complete-milestone` - Mark milestone as done
- `/gsd-archive-milestone` - Archive completed milestone
- `/gsd-restore-milestone` - Restore archived milestone
- `/gsd-list-milestones` - Show all milestones and their status
- `/gsd-audit-milestone` - Review milestone progress and issues

**Phase Planning & Execution:**
- `/gsd-plan-phase` - Create execution plans for a phase
- `/gsd-execute-phase` - Execute plans with atomic commits
- `/gsd-verify-work` - Verify phase goals achieved
- `/gsd-research-phase` - Research before planning phase
- `/gsd-discuss-phase` - Discuss phase approach before planning

**Phase Structure Management:**
- `/gsd-add-phase` - Add new phase to roadmap
- `/gsd-insert-phase` - Insert phase between existing phases
- `/gsd-remove-phase` - Remove phase from roadmap
- `/gsd-plan-milestone-gaps` - Identify and plan missing phases
- `/gsd-list-phase-assumptions` - Show assumptions for phase

**Work Management:**
- `/gsd-pause-work` - Pause current work and save state
- `/gsd-resume-work` - Resume paused work from checkpoint
- `/gsd-progress` - Show overall project progress
- `/gsd-add-todo` - Add item to project todo list
- `/gsd-check-todos` - Review and update todo items

**Analysis & Debugging:**
- `/gsd-map-codebase` - Analyze existing codebase structure
- `/gsd-debug` - Debug and fix issues in current phase

**Utilities:**
- `/gsd-help` - Show GSD command reference
- `/gsd-verify-installation` - Verify GSD installed correctly
- `/gsd-update` - Check for and install updates
- `/gsd-whats-new` - Show recent changes and features
- `/get-shit-done` - Alias for main workflow command

### File Structure

Skills are organized in subdirectories:

```
[platform]/skills/
├── gsd-new-project/
│   └── SKILL.md
├── gsd-plan-phase/
│   └── SKILL.md
├── gsd-execute-phase/
│   └── SKILL.md
└── ... (26 more)
```

### Skill File Format

Each `SKILL.md` file has frontmatter and instructions:

```markdown
---
name: gsd-plan-phase
description: Create detailed execution plans for a phase
allowed-tools: View, Edit, Create, Bash, Grep, Sed
argument-hint: Phase number or name
---

# Phase Planning Skill

[Detailed instructions for how to plan a phase...]
```

**Frontmatter fields:**
- `name` - Unique identifier (used for invocation)
- `description` - What the skill does (shown in UI)
- `allowed-tools` - Which tools Claude can use
- `argument-hint` - Expected arguments or usage pattern

---

## Agents (13 total)

Agents are specialized sub-agents that skills delegate to for complex tasks. You don't invoke agents directly - skills use them behind the scenes.

### Available Agents

**Planning & Strategy:**
- `gsd-planner` - Creates detailed phase plans from requirements
- `gsd-planner-strategist` - Strategic planning for complex phases
- `gsd-roadmapper` - Generates project roadmaps with phases

**Execution & Verification:**
- `gsd-executor` - Executes plans with atomic commits per task
- `gsd-verifier` - Verifies goal achievement and quality standards
- `gsd-integration-checker` - Checks integration and compatibility

**Research & Analysis:**
- `gsd-project-researcher` - Researches project domains and requirements
- `gsd-phase-researcher` - Researches specific phase requirements
- `gsd-research-synthesizer` - Synthesizes research into actionable insights
- `gsd-codebase-mapper` - Maps and analyzes existing codebases

**Problem Solving:**
- `gsd-debugger` - Diagnoses and fixes issues
- `gsd-debugger-specialist` - Specialized debugging for complex problems

**Quality Assurance:**
- `gsd-plan-checker` - Reviews plan quality before execution

### File Structure

Agents are individual files (not in subdirectories):

```
[platform]/agents/
├── gsd-executor.agent.md
├── gsd-planner.agent.md
├── gsd-verifier.agent.md
├── gsd-debugger.agent.md
└── ... (9 more)
```

### Agent File Format

Each `.agent.md` file has frontmatter and specialized instructions:

```markdown
---
name: gsd-executor
description: Execute phase plans with atomic commits and deviation handling
tools: View, Edit, Create, Bash, Grep, Sed
skills: gsd-plan-phase, gsd-verify-work
---

# Plan Executor Agent

[Detailed instructions for executing plans...]
```

**Frontmatter fields:**
- `name` - Unique identifier
- `description` - When to delegate to this agent
- `tools` - Comma-separated list of allowed tools
- `skills` - Pre-loaded skills (Claude only, auto-generated)

**Note:** The `skills` field is automatically generated for Claude by scanning agent content for skill references. Other platforms don't use this field.

---

## Shared Directory

The shared directory contains supporting files used by skills and agents:

```
[platform]/get-shit-done/
├── references/
│   ├── commit-guidelines.md
│   ├── planning-protocols.md
│   ├── verification-standards.md
│   ├── research-methods.md
│   ├── deviation-rules.md
│   └── checkpoint-protocols.md
├── templates/
│   ├── plan-template.md
│   ├── summary-template.md
│   ├── roadmap-template.md
│   ├── requirements-template.md
│   └── context-template.md
├── workflows/
│   ├── git-identity-helpers.sh
│   ├── phase-validation.sh
│   └── manifest-checker.sh
└── .gsd-install-manifest.json
```

### References Directory

Protocol documents that guide execution:

- **commit-guidelines.md** - How to write atomic commits
- **planning-protocols.md** - How to create phase plans
- **verification-standards.md** - How to verify completion
- **research-methods.md** - How to research domains
- **deviation-rules.md** - How to handle unplanned work
- **checkpoint-protocols.md** - How to handle checkpoints

### Templates Directory

Templates for generating planning documents:

- **plan-template.md** - Structure for execution plans
- **summary-template.md** - Structure for phase summaries
- **roadmap-template.md** - Structure for project roadmaps
- **requirements-template.md** - Structure for requirements docs
- **context-template.md** - Structure for phase context

### Workflows Directory

Helper scripts and utilities:

- **git-identity-helpers.sh** - Preserve user identity in commits
- **phase-validation.sh** - Validate phase structure
- **manifest-checker.sh** - Check installation manifest

### Installation Manifest

The `.gsd-install-manifest.json` file tracks your installation:

```json
{
  "gsd_version": "2.0.0",
  "platform": "claude",
  "scope": "global",
  "installed_at": "2026-01-29T12:00:00Z",
  "files": [
    ".claude/skills/gsd-new-project/SKILL.md",
    ".claude/skills/gsd-plan-phase/SKILL.md",
    ".claude/agents/gsd-executor.agent.md",
    ".claude/agents/gsd-planner.agent.md",
    ".claude/get-shit-done/references/commit-guidelines.md",
    "... (all installed files)"
  ]
}
```

**Manifest fields:**
- `gsd_version` - Installed version (e.g., "2.0.0")
- `platform` - Platform name ("claude", "copilot", or "codex")
- `scope` - Installation scope ("global" or "local")
- `installed_at` - ISO 8601 timestamp of installation
- `files` - Sorted array of all installed file paths

**Used for:**
- Update detection (is newer version available?)
- Version tracking (what versions are installed where?)
- Uninstall operations (what files to remove?)
- Integrity checking (are all files present?)

---

## Platform-Specific Locations

Where files are installed depends on the platform and scope you choose.

### Directory Structure by Platform

| Platform | Local Installation | Global Installation |
|----------|-------------------|---------------------|
| **Claude Code** | `.claude/skills/`<br>`.claude/agents/`<br>`.claude/get-shit-done/` | `~/.claude/skills/`<br>`~/.claude/agents/`<br>`~/.claude/get-shit-done/` |
| **GitHub Copilot CLI** | `.github/skills/`<br>`.github/agents/`<br>`.github/get-shit-done/` | `~/.copilot/skills/`<br>`~/.copilot/agents/`<br>`~/.copilot/get-shit-done/` |
| **Codex CLI** | `.codex/skills/`<br>`.codex/agents/`<br>`.codex/get-shit-done/` | `~/.codex/skills/`<br>`~/.codex/agents/`<br>`~/.codex/get-shit-done/` |

### Local vs. Global

**Local installation (`.claude/`, `.github/`, `.codex/`):**
- Project-specific
- Only available in current directory
- Good for per-project customization
- Doesn't affect other projects
- Requires write permission to current directory

**Global installation (`~/.claude/`, `~/.copilot/`, `~/.codex/`):**
- User-wide
- Available in all projects
- Good for consistent workflow across projects
- Shared across all your work
- Requires write permission to home directory

### Full Example: Claude Global Installation

```
~/.claude/
├── skills/
│   ├── gsd-new-project/
│   │   └── SKILL.md
│   ├── gsd-plan-phase/
│   │   └── SKILL.md
│   ├── gsd-execute-phase/
│   │   └── SKILL.md
│   └── ... (26 more)
├── agents/
│   ├── gsd-executor.agent.md
│   ├── gsd-planner.agent.md
│   ├── gsd-verifier.agent.md
│   └── ... (10 more)
└── get-shit-done/
    ├── references/
    ├── templates/
    ├── workflows/
    └── .gsd-install-manifest.json
```

---

## Installation Sizes

Approximate sizes for each component:

| Component | Size | Files |
|-----------|------|-------|
| **Skills** | ~1.2 MB | 29 SKILL.md files |
| **Agents** | ~600 KB | 13 .agent.md files |
| **Shared Directory** | ~200 KB | References, templates, workflows |
| **Total** | **~2 MB** | **42+ files** |

These are template files (plain text Markdown), so they compress well and load quickly.

---

## What Is NOT Installed

GSD installation does **not** include:

### No Runtime Dependencies

- No npm packages in node_modules
- No global npm packages
- No Python packages
- No system libraries

### No System Integration

- No PATH modifications
- No environment variables (except during execution)
- No shell configuration changes
- No registry entries (Windows)
- No LaunchAgents (macOS)

### No User Data

- No databases
- No user configuration files
- No project-specific data
- No credentials or secrets

GSD is purely template files that your AI assistant reads. The installer copies files and that's it.

---

## Platform-Specific Differences

While GSD works across all platforms, there are subtle differences:

### Frontmatter Variations

**Skills:**
- All platforms: Use `allowed-tools` field
- All platforms: Use `argument-hint` field
- Format is identical across platforms

**Agents:**
- All platforms: Use `tools` field (comma-separated)
- Claude only: Has `skills` field (auto-generated)
- Copilot/Codex: No `skills` field

### Tool Name Mappings

Tool names are normalized to Claude's canonical names:

| Capability | Claude | Copilot Alias | Codex Alias |
|------------|--------|---------------|-------------|
| Execute shell | Bash | execute | shell |
| Search files | Grep | search | find |
| Stream edit | Sed | replace | modify |
| Delegate task | Task | agent | delegate |

The installer handles these mappings automatically, so skills work identically across platforms.

---

## Next Steps

- **Understand the workflow:** See [How GSD Works](how-gsd-works.md)
- **Learn platform differences:** See [Platform Specifics](platform-specifics.md)
- **Install GSD:** See [How to Install](how-to-install.md)
- **Upgrade existing installation:** See [How to Upgrade](how-to-upgrade.md)
- **Remove GSD:** See [How to Uninstall](how-to-uninstall.md)
