# How to Install GSD

Run this command to install GSD skills to your AI assistant:

```bash
npx get-shit-done-multi
```

The installer will:

1. Detect your platform (Claude, Copilot, or Codex)
2. Ask which skills/agents to install
3. Install to the appropriate location
4. Confirm success

Done. Your AI assistant now has GSD capabilities.

## Installation Options

### Interactive Mode (Default)

The default mode provides an interactive wizard:

```bash
npx get-shit-done-multi
```

Features:

- Auto-detects installed platforms (Claude Code, GitHub Copilot CLI, Codex CLI)
- Multi-select interface for choosing skills/agents
- Prompts for installation location (local vs. global)
- Confirms all actions before proceeding
- Shows progress during installation
- Provides clear success/failure messages

### Non-Interactive Mode

For automation or CI/CD pipelines, use flags to skip prompts:

```bash
# Install to Claude Code (non-interactive)
npx get-shit-done-multi --claude

# Install to GitHub Copilot CLI (local, non-interactive)
npx get-shit-done-multi --copilot --local

# Install to Codex CLI (global, non-interactive)
npx get-shit-done-multi --codex --global

# Install to multiple platforms at once
npx get-shit-done-multi --claude --copilot
```

### Platform Selection

Use platform flags to specify where to install:

- `--claude`: Install to Claude Code
- `--copilot`: Install to GitHub Copilot CLI
- `--codex`: Install to Codex CLI

You can specify multiple platforms:

```bash
# Install to both Claude and Copilot
npx get-shit-done-multi --claude --copilot
```

If no platform flag is provided, the installer auto-detects available platforms.

### Installation Scope

Control whether to install locally (project-specific) or globally (user-wide):

- `--local`: Install to current project (`.claude/`, `.github/`, `.codex/`)
- `--global`: Install globally (`~/.claude/`, `~/.copilot/`, `~/.codex/`)

**Default behavior:**

- Interactive mode: Prompts you to choose
- Non-interactive mode: Defaults to `--local`

```bash
# Install globally to Claude
npx get-shit-done-multi --claude --global

# Install locally to current project (Copilot)
npx get-shit-done-multi --copilot --local
```

**Show Help:**

```bash
npx get-shit-done-multi --help
# or
npx get-shit-done-multi -h
```

**Show Version:**

```bash
npx get-shit-done-multi --version
# or
npx get-shit-done-multi -v
```

The `--version` command shows all installed GSD versions across platforms and scopes.

## Understanding What Gets Installed

When you run the installer, it copies three types of files to your platform directory:

### 1. Skills (29 total)

Skills are slash commands you invoke directly. Each skill has a specific purpose in the GSD workflow.

**Core Workflow Skills:**

- `/gsd-new-project` - Start new project with research and roadmap
- `/gsd-new-milestone` - Add new milestone to existing project
- `/gsd-plan-phase` - Create execution plans for a phase
- `/gsd-execute-phase` - Execute plans with atomic commits
- `/gsd-verify-phase` - Verify phase goals achieved

**Planning Skills:**

- `/gsd-create-plan` - Create detailed execution plan
- `/gsd-continue-plan` - Resume paused plan execution
- `/gsd-review-plan` - Review plan quality before execution

**Research Skills:**

- `/gsd-research-domain` - Research technical domain
- `/gsd-research-library` - Research specific library
- `/gsd-analyze-codebase` - Analyze existing code

**And 19 more specialized skills...**

**File Location:**

```plaintext
[platform]/skills/gsd-new-project/SKILL.md
[platform]/skills/gsd-plan-phase/SKILL.md
[platform]/skills/gsd-execute-phase/SKILL.md
...
```

Each `SKILL.md` file contains:

- `name`: Display name shown in UI
- `description`: What the skill does
- `allowed-tools`: Tools the skill can use (e.g., Bash, Edit, View)
- `argument-hint`: Expected arguments or usage pattern
- Instructions and protocols for execution

### 2. Agents (13 total)

Agents are specialized sub-agents that skills delegate to for complex tasks.

**Available Agents:**

- `gsd-executor` - Executes plans with atomic commits per task
- `gsd-planner` - Creates detailed phase plans from requirements
- `gsd-verifier` - Verifies goal achievement and quality standards
- `gsd-researcher` - Researches domains and libraries
- `gsd-analyst` - Analyzes code and requirements
- `gsd-documenter` - Creates and updates documentation
- `gsd-tester` - Writes and runs tests
- `gsd-debugger` - Diagnoses and fixes issues
- `gsd-refactorer` - Improves code quality
- `gsd-reviewer` - Reviews plans and code for quality
- `gsd-migrater` - Handles migrations and upgrades
- `gsd-installer` - Handles installation and setup tasks
- `gsd-troubleshooter` - Diagnoses and resolves problems

**File Location:**

```plaintext
[platform]/agents/gsd-executor.agent.md
[platform]/agents/gsd-planner.agent.md
[platform]/agents/gsd-verifier.agent.md
...
```

Each agent file contains:

- `name`: Unique identifier
- `description`: When to delegate to this agent
- `tools`: Comma-separated list of allowed tools
- `skills`: Pre-loaded skills (Claude only)
- Specialized instructions and protocols

### 3. Shared Directory

The shared directory contains references, templates, and tracking files:

```text
[platform]/get-shit-done/
├── references/
│   ├── commit-guidelines.md
│   ├── planning-protocols.md
│   ├── verification-standards.md
│   └── ...
├── templates/
│   ├── plan-template.md
│   ├── summary-template.md
│   └── ...
├── workflows/
│   ├── git-identity-helpers.sh
│   └── ...
└── .gsd-install-manifest.json
```

**Installation Manifest:**

The `.gsd-install-manifest.json` file tracks your installation:

```json
{
  "gsd_version": "2.0.0",
  "platform": "claude",
  "scope": "global",
  "installed_at": "2026-01-29T12:00:00Z",
  "files": [
    ".claude/skills/gsd-new-project/SKILL.md",
    ".claude/agents/gsd-executor.agent.md",
    "..."
  ]
}
```

This manifest is used for:

- Update detection (checking if newer version available)
- Version tracking (showing installed versions)
- Uninstall operations (knowing what to remove)

### Platform-Specific Locations

Where files are installed depends on the platform and scope:

| Platform | Local Installation | Global Installation |
 |----------   |-------------------   |---------------------  |
| **Claude Code** | `.claude/skills/`<br>`.claude/agents/`<br>`.claude/get-shit-done/` | `~/.claude/skills/`<br>`~/.claude/agents/`<br>`~/.claude/get-shit-done/` |
| **GitHub Copilot CLI** | `.github/skills/`<br>`.github/agents/`<br>`.github/get-shit-done/` | `~/.copilot/skills/`<br>`~/.copilot/agents/`<br>`~/.copilot/get-shit-done/` |
| **Codex CLI** | `.codex/skills/`<br>`.codex/agents/`<br>`.codex/get-shit-done/` | `~/.codex/skills/`<br>`~/.codex/agents/`<br>`~/.codex/get-shit-done/` |

**Local installations** are project-specific and only available in the current directory.

**Global installations** are user-wide and available across all projects.

### Total Installation Size

Approximately 2MB total:

- 29 skills: ~1.2MB
- 13 agents: ~600KB
- Shared directory: ~200KB

## Requirements

Before installing GSD, ensure you have:

1. **Node.js 20 or higher**

   ```bash
   node --version  # Should show v20.0.0 or higher
   ```

1. **One of the following AI platforms:**
   - Claude Code (Claude Desktop with Code integration)
   - GitHub Copilot CLI (`gh copilot` command)
   - Codex CLI (OpenAI Codex integration)

2. **Sufficient disk space:**
   - At least 2MB available on target disk

3. **Write permissions:**
   - For local install: Write access to current directory
   - For global install: Write access to home directory

## Next Steps

After installation:

- **Learn what was installed:** See [What Gets Installed](what-gets-installed.md) for detailed file breakdown
- **Understand platform differences:** See [Platform Specifics](platform-specifics.md) for platform variations
- **Start using GSD:** See [How GSD Works](how-gsd-works.md) for workflow overview
- **Encounter issues?** See [Troubleshooting](troubleshooting.md) for common problems and solutions
- **Need to upgrade?** See [How to Upgrade](how-to-upgrade.md) for update instructions
- **Want to remove?** See [How to Uninstall](how-to-uninstall.md) for cleanup steps
