# Codebase Structure

**Analysis Date:** 2026-01-19

## Directory Layout

```
get-shit-done/
├── .git/               # Git repository
├── .github/            # GitHub Copilot CLI installation (duplicates structure)
│   ├── agents/         # Agent definitions (symlinked or copied)
│   ├── skills/         # Copilot skill wrapper
│   └── ISSUE_TEMPLATE/ # GitHub issue templates
├── .gsd/               # Lightweight asset directory (deprecated/legacy)
├── .planning/          # Project workspace (created during project init)
│   ├── codebase/       # Codebase analysis documents
│   ├── phases/         # Phase directories with plans
│   ├── research/       # Research outputs
│   ├── PROJECT.md      # Project context
│   ├── ROADMAP.md      # Phase breakdown
│   ├── STATE.md        # Project memory
│   └── config.json     # Workflow preferences
├── agents/             # Specialized subagent definitions
├── assets/             # Branding/visual assets
├── bin/                # Executable entry points
├── commands/           # Command definitions
│   └── gsd/            # GSD command files
├── docs/               # Documentation
├── get-shit-done/      # Core system assets
│   ├── commands/       # Command definitions (copied here during install)
│   ├── references/     # Reusable context snippets
│   ├── templates/      # Artifact templates
│   └── workflows/      # Orchestration workflows
├── github/             # GitHub-specific assets (issue templates)
├── hooks/              # Runtime enhancement scripts
├── lib-ghcc/           # GitHub Copilot CLI integration layer
└── package.json        # NPM package metadata
```

## Directory Purposes

**agents/**
- Purpose: Specialized subagent role definitions
- Contains: 11 .md files, each defining an agent (role, tools, process, success criteria)
- Key files: `gsd-executor.md`, `gsd-planner.md`, `gsd-verifier.md`, `gsd-codebase-mapper.md`

**bin/**
- Purpose: Package entry points
- Contains: `install.js` - main installer script
- Key files: `install.js` (819 lines, handles all installation logic)

**commands/gsd/**
- Purpose: User-facing command definitions
- Contains: 24 .md files, each a complete command specification
- Key files: `new-project.md`, `plan-phase.md`, `execute-phase.md`, `verify-work.md`

**get-shit-done/**
- Purpose: Core system assets (source of truth for all installations)
- Contains: Subdirectories for workflows, templates, references, commands
- Key files: Everything copied during installation

**get-shit-done/workflows/**
- Purpose: Multi-step orchestration processes
- Contains: 12 .md files defining complex workflows
- Key files: `execute-phase.md`, `map-codebase.md`, `verify-phase.md`, `execute-plan.md`

**get-shit-done/templates/**
- Purpose: Artifact structure definitions
- Contains: 21 .md files + 1 config.json template
- Key files: `project.md`, `phase-prompt.md`, `roadmap.md`, `state.md`, `summary.md`

**get-shit-done/references/**
- Purpose: Reusable guidance and context snippets
- Contains: 7 .md files with best practices and patterns
- Key files: `checkpoints.md`, `git-integration.md`, `tdd.md`, `verification-patterns.md`

**hooks/**
- Purpose: Claude Code runtime enhancements
- Contains: 2 Node.js scripts
- Key files: `statusline.js` (84 lines, custom statusline), `gsd-check-update.js` (51 lines)

**.github/skills/get-shit-done/**
- Purpose: GitHub Copilot CLI installation target (mirrors get-shit-done/)
- Contains: Same structure as get-shit-done/ but for Copilot context
- Key files: `SKILL.md` (skill definition), `commands/gsd/*.md`

**lib-ghcc/**
- Purpose: Copilot CLI integration adapter
- Contains: SKILL.md, copilot-instructions.md
- Key files: `SKILL.md` (skill wrapper for Copilot)

**.planning/** *(created during project initialization)*
- Purpose: Project workspace and state management
- Contains: Project artifacts, phase directories, analysis documents
- Key files: `PROJECT.md`, `ROADMAP.md`, `STATE.md`, `config.json`

**.planning/codebase/** *(created by /gsd:map-codebase)*
- Purpose: Codebase analysis reference documents
- Contains: 7 .md files analyzing tech, arch, quality, concerns
- Key files: `ARCHITECTURE.md`, `STRUCTURE.md`, `CONVENTIONS.md`, `TESTING.md`

**.planning/phases/** *(created during planning)*
- Purpose: Phase execution artifacts
- Contains: Directories named `{NN}-{phase-name}/` with plans and summaries
- Key files: `{NN}-{MM}-PLAN.md`, `{NN}-{MM}-SUMMARY.md`

**docs/**
- Purpose: User-facing documentation
- Contains: 3 .md files
- Key files: `github-copilot-cli.md`, `github-issues.md`, `attribution.md`

**assets/**
- Purpose: Visual branding
- Contains: SVG files
- Key files: `terminal.svg` (used in README)

**github/ISSUE_TEMPLATE/**
- Purpose: GitHub issue templates for GSD workflows
- Contains: Issue template YAML files
- Key files: Templates for new projects, phases, bugs

## Key File Locations

**Entry Points:**
- `bin/install.js`: NPM package entry point (executes on `npx get-shit-done-cc`)
- `commands/gsd/help.md`: Command reference documentation
- `lib-ghcc/SKILL.md`: Copilot CLI skill entry point

**Configuration:**
- `package.json`: Package metadata, bin entry, version
- `get-shit-done/templates/config.json`: Default workflow config template
- `.planning/config.json`: Project-specific workflow preferences (created at init)

**Core Logic:**
- `commands/gsd/*.md`: All command execution logic
- `get-shit-done/workflows/*.md`: All orchestration logic
- `agents/*.md`: All subagent behavior definitions

**Documentation:**
- `README.md`: Main documentation, getting started guide
- `CHANGELOG.md`: Version history, breaking changes
- `GSD-STYLE.md`: Writing guide for GSD documents
- `docs/*.md`: Supplementary documentation

## Naming Conventions

**Files:**
- Commands: `kebab-case.md` (e.g., `new-project.md`, `execute-phase.md`)
- Agents: `gsd-{role}.md` (e.g., `gsd-executor.md`, `gsd-planner.md`)
- Templates: `kebab-case.md` or `UPPERCASE.md` for structure (e.g., `project.md`, `DEBUG.md`)
- Scripts: `kebab-case.js` (e.g., `install.js`, `gsd-check-update.js`)

**Directories:**
- Top-level: `kebab-case` (e.g., `get-shit-done`, `lib-ghcc`)
- Hidden: `.lowercase` (e.g., `.planning`, `.gsd`, `.github`)
- Phase dirs: `{NN}-{kebab-case}` (e.g., `01-setup`, `05-user-authentication`)

**Artifacts (in .planning/):**
- Project docs: `UPPERCASE.md` (e.g., `PROJECT.md`, `ROADMAP.md`, `STATE.md`)
- Plans: `{NN}-{MM}-PLAN.md` (e.g., `01-03-PLAN.md` = phase 1, plan 3)
- Summaries: `{NN}-{MM}-SUMMARY.md` (e.g., `01-03-SUMMARY.md`)
- Codebase docs: `UPPERCASE.md` (e.g., `ARCHITECTURE.md`, `TESTING.md`)

## Where to Add New Code

**New Command:**
- Primary code: `commands/gsd/{command-name}.md`
- Workflow (if orchestration): `get-shit-done/workflows/{workflow-name}.md`
- Template (if artifact): `get-shit-done/templates/{template-name}.md`
- Reference (if reusable): `get-shit-done/references/{reference-name}.md`

**New Agent:**
- Implementation: `agents/gsd-{role}.md`
- Follow pattern: YAML frontmatter + role + process + success criteria

**New Template:**
- Implementation: `get-shit-done/templates/{template-name}.md`
- Follow pattern: Frontmatter + sections + [Placeholder] markers

**New Reference:**
- Implementation: `get-shit-done/references/{topic}.md`
- Follow pattern: Guidance focused on single concern

**Installer Changes:**
- Implementation: `bin/install.js`
- Test both Claude (`--global`, `--local`) and Copilot (`--copilot`) modes

**Runtime Hooks:**
- Implementation: `hooks/{hook-name}.js`
- Integration: Reference in Claude statusline config

## Special Directories

**.planning/**
- Purpose: Project workspace created during initialization
- Generated: Yes (by `/gsd:new-project`)
- Committed: Yes (entire directory tracked)

**.planning/phases/**
- Purpose: Phase execution artifacts
- Generated: Yes (by `/gsd:plan-phase`, `/gsd:execute-phase`)
- Committed: Yes (plans, summaries, all artifacts)

**.planning/codebase/**
- Purpose: Codebase analysis reference
- Generated: Yes (by `/gsd:map-codebase`)
- Committed: Yes (reference for future commands)

**.github/skills/get-shit-done/**
- Purpose: Copilot CLI installation location
- Generated: Yes (by `npx get-shit-done-cc --copilot`)
- Committed: Optional (typically yes for per-project installs)

**.github/agents/**
- Purpose: Copilot-accessible agent definitions
- Generated: Yes (by `npx get-shit-done-cc --copilot`)
- Committed: Optional (typically yes)

**.gsd/**
- Purpose: Legacy lightweight asset directory
- Generated: No (deprecated, use get-shit-done/ instead)
- Committed: Yes (for backward compatibility)

**get-shit-done/**
- Purpose: Source of truth for all assets
- Generated: No (source code)
- Committed: Yes (part of package)

## Installation Modes

**Global Claude Install** (`--global`):
- Target: `~/.claude/get-shit-done/`
- Copies: commands, agents, workflows, templates, references
- Statusline: `~/.claude/settings.json` (statusline.script)
- Access: Available in all Claude Code projects

**Local Claude Install** (`--local`):
- Target: `./.claude/get-shit-done/`
- Copies: Same as global
- Statusline: `./.claude/settings.json`
- Access: Only in current project

**Copilot CLI Install** (`--copilot`):
- Target: `./.github/skills/get-shit-done/`, `./.github/agents/`
- Copies: Full structure with path rewriting
- Config: `.github/ISSUE_TEMPLATE/` (GitHub integration)
- Access: Only in current repository

## File Organization Rationale

**Commands separate from workflows:**
- Commands are thin wrappers with context loading
- Workflows are thick orchestration logic
- Allows workflow reuse across multiple commands

**Templates separate from agents:**
- Templates define structure (passive)
- Agents fill templates (active)
- Agents can use multiple templates

**References separate from workflows:**
- References are reusable snippets
- Workflows reference via @path includes
- Reduces duplication across workflows

**Dual install locations (get-shit-done/ and .github/):**
- get-shit-done/ is source of truth
- .github/ is Copilot-specific deployment
- Allows NPM distribution + per-repo customization

---

*Structure analysis: 2026-01-19*
