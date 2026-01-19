# Codebase Structure

**Analysis Date:** 2026-01-19

## Directory Layout

```
get-shit-done/
├── .github/              # GitHub Copilot CLI installation target
│   ├── agents/           # Copied from agents/ during --copilot install
│   └── skills/get-shit-done/
│       ├── commands/gsd/ # Copied from commands/gsd/
│       ├── references/   # Copied from get-shit-done/references/
│       ├── workflows/    # Copied from get-shit-done/workflows/
│       └── templates/    # Copied from get-shit-done/templates/
├── .gsd/                 # Legacy Claude Code target (deprecated, symlinked)
├── .planning/            # Runtime project state (created during project init)
│   ├── codebase/         # Codebase analysis documents (created by map-codebase)
│   ├── phases/           # Phase-specific plans and summaries
│   ├── research/         # Domain research outputs
│   ├── todos/            # Captured future work items
│   ├── debug/            # Debug session state
│   ├── PROJECT.md        # Living project context
│   ├── ROADMAP.md        # Phase structure and status
│   ├── STATE.md          # Project memory (decisions, blockers, position)
│   ├── REQUIREMENTS.md   # Scoped requirements with traceability
│   └── config.json       # Workflow preferences (autocommit, test commands)
├── agents/               # Specialized agent prompt files
├── assets/               # Static assets (terminal.svg for README)
├── bin/                  # Executable scripts
│   └── install.js        # NPM package installer
├── commands/gsd/         # User-facing slash command definitions
├── docs/                 # Documentation (if present)
├── get-shit-done/        # Core system files (Claude Code canonical source)
│   ├── references/       # Reusable guidance documents
│   ├── templates/        # Document structure definitions
│   └── workflows/        # Orchestration logic for commands
├── hooks/                # Runtime hooks (statusline, update checks)
├── lib-ghcc/             # GitHub Copilot CLI specific adapter files
│   ├── SKILL.md          # Skill definition for Copilot CLI
│   └── copilot-instructions.md  # Copilot-specific instructions
├── CHANGELOG.md          # Version history
├── GSD-STYLE.md          # Documentation style guide
├── LICENSE               # MIT license
├── README.md             # User-facing documentation
└── package.json          # NPM package metadata
```

## Directory Purposes

**`agents/`:**
- Purpose: Specialized agent prompt files
- Contains: Agent definitions (gsd-executor.md, gsd-planner.md, gsd-verifier.md, etc.)
- Key files: 11 agent prompt files (codebase-mapper, debugger, executor, integration-checker, phase-researcher, plan-checker, planner, project-researcher, research-synthesizer, roadmapper, verifier)
- Pattern: Each file is markdown with frontmatter (name, description, tools, color) + role + philosophy + process

**`bin/`:**
- Purpose: Executable installation scripts
- Contains: Node.js installer for NPM package
- Key files: `install.js` (main installer)

**`commands/gsd/`:**
- Purpose: User-facing command definitions
- Contains: 24 slash command markdown files
- Key files: `new-project.md`, `plan-phase.md`, `execute-phase.md`, `verify-work.md`, `progress.md`, `map-codebase.md`, `help.md`
- Pattern: Frontmatter (name, description, allowed-tools, argument-hint, agent) + objective + execution_context + process + success criteria

**`get-shit-done/`:**
- Purpose: Canonical source for system files (copied during installation)
- Contains: Core system components (references, templates, workflows)
- Note: This is the source of truth; `.gsd/` and `.github/skills/get-shit-done/` are deployment targets

**`get-shit-done/references/`:**
- Purpose: Reusable guidance loaded via @-references in commands and agents
- Contains: 7 reference documents
- Key files:
  - `checkpoints.md` - Checkpoint protocol for long-running agents
  - `continuation-format.md` - Continuation agent spawning patterns
  - `git-integration.md` - Git commit conventions and atomic commit pattern
  - `questioning.md` - Deep questioning methodology
  - `tdd.md` - Test-driven development patterns
  - `ui-brand.md` - Status message formatting and Unicode symbols
  - `verification-patterns.md` - Verification approaches and success criteria

**`get-shit-done/templates/`:**
- Purpose: Document structure definitions
- Contains: Markdown templates for all state documents
- Key files: `project.md`, `roadmap.md`, `state.md`, `requirements.md`, `summary.md`, `phase-prompt.md`, `research.md`, `milestone.md`, `discovery.md`, `context.md`, `UAT.md`, `DEBUG.md`, `verification-report.md`, `continue-here.md`, `user-setup.md`
- Subdirectories:
  - `codebase/` - Templates for codebase analysis documents (7 templates: architecture, concerns, conventions, integrations, stack, structure, testing)
  - `research-project/` - Templates for project research outputs

**`get-shit-done/workflows/`:**
- Purpose: Orchestration logic for complex commands
- Contains: 12 workflow documents providing detailed orchestration steps
- Key files:
  - `execute-phase.md` - Wave-based parallel execution logic
  - `execute-plan.md` - Single plan execution with checkpoint handling
  - `map-codebase.md` - Parallel codebase mapper orchestration
  - `verify-phase.md` - Goal-backward verification protocol
  - `verify-work.md` - User acceptance testing flow
  - `diagnose-issues.md` - Debug diagnostics workflow
  - `discuss-phase.md` - Implementation context capture workflow
  - `discovery-phase.md` - New project questioning protocol
  - `transition.md` - Milestone transition protocol
  - `complete-milestone.md` - Milestone archival and tagging
  - `resume-project.md` - Session restoration protocol

**`hooks/`:**
- Purpose: Runtime hooks for environment integration
- Contains: JavaScript hooks executed by Claude Code
- Key files:
  - `statusline.js` - Status line display integration
  - `gsd-check-update.js` - Version check on command invocation

**`lib-ghcc/`:**
- Purpose: GitHub Copilot CLI adapter layer
- Contains: Copilot-specific skill definition and instructions
- Key files:
  - `SKILL.md` - Skill definition exposing GSD to Copilot CLI
  - `copilot-instructions.md` - Brief instructions for Copilot CLI usage

**`.planning/` (runtime directory):**
- Purpose: Project state and execution artifacts
- Contains: All project-specific state, plans, research, summaries
- Created by: `/gsd:new-project` command
- Structure:
  - `PROJECT.md` - Living project context (what, why, requirements, decisions)
  - `ROADMAP.md` - Phase breakdown with success criteria
  - `STATE.md` - Project memory (position, decisions, blockers)
  - `REQUIREMENTS.md` - Categorized requirements with traceability
  - `config.json` - Workflow preferences (autocommit, test_command, verify_command)
  - `codebase/` - Codebase analysis (STACK.md, ARCHITECTURE.md, etc.)
  - `research/` - Domain research outputs (STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md, SUMMARY.md)
  - `phases/{NN}-{slug}/` - Phase directories containing PLAN.md and SUMMARY.md files
  - `todos/` - Future work items (TODO-{area}-{hash}.md)
  - `debug/` - Debug session state (DEBUG-SESSION-{id}.md)

**`.planning/phases/{NN}-{slug}/` (runtime directory):**
- Purpose: Phase-specific execution artifacts
- Contains: Plans, summaries, research, context, UAT reports, verification reports
- Naming: `{NN}` is zero-padded phase number (01, 02, 18), `{slug}` is kebab-case phase name
- Files:
  - `{NN}-RESEARCH.md` - Phase-specific domain research (optional)
  - `{NN}-CONTEXT.md` - User implementation decisions (created by discuss-phase)
  - `{NN}-{MM}-PLAN.md` - Executable plan ({MM} is plan number: 01, 02, 03)
  - `{NN}-{MM}-SUMMARY.md` - Plan completion summary (created by executor)
  - `{NN}-VERIFICATION.md` - Goal-backward verification report (created by verifier)
  - `{NN}-UAT.md` - User acceptance testing report (created by verify-work)

**`.github/` (deployment target for Copilot CLI):**
- Purpose: GitHub Copilot CLI skill installation location
- Created by: `npx get-shit-done-cc --copilot`
- Contains: Mirror of commands, agents, references, workflows, templates

**`.gsd/` (deprecated deployment target):**
- Purpose: Legacy Claude Code installation location (symlinked to get-shit-done/)
- Status: Deprecated in favor of `~/.claude` global install or `./.claude` local install
- Note: Installer creates this as symlink for backward compatibility

## Key File Locations

**Entry Points:**
- `bin/install.js`: NPM package entry point
- `commands/gsd/new-project.md`: Project initialization entry
- `commands/gsd/help.md`: Command reference and usage guide

**Configuration:**
- `package.json`: NPM package metadata, version, bin entry
- `.planning/config.json`: Per-project workflow preferences (created during init)

**Core Logic:**
- `agents/*.md`: Specialized agent implementations
- `commands/gsd/*.md`: User-facing command orchestrators
- `get-shit-done/workflows/*.md`: Reusable orchestration patterns

**Testing:**
- Not detected (system is self-hosted; testing happens through usage)

**Documentation:**
- `README.md`: User-facing overview and getting started
- `CHANGELOG.md`: Version history with dated entries
- `GSD-STYLE.md`: Documentation style guide
- `commands/gsd/help.md`: In-system command reference

## Naming Conventions

**Files:**
- Commands: `kebab-case.md` (e.g., `new-project.md`, `execute-phase.md`)
- Agents: `gsd-{role}.md` (e.g., `gsd-executor.md`, `gsd-planner.md`)
- References: `kebab-case.md` (e.g., `git-integration.md`, `questioning.md`)
- Templates: `kebab-case.md` (e.g., `project.md`, `roadmap.md`)
- Workflows: `kebab-case.md` (e.g., `execute-phase.md`, `map-codebase.md`)
- Runtime plans: `{NN}-{MM}-PLAN.md` (e.g., `01-01-PLAN.md`, `18-03-PLAN.md`)
- Runtime summaries: `{NN}-{MM}-SUMMARY.md` (e.g., `01-01-SUMMARY.md`)
- Runtime state: `UPPERCASE.md` (e.g., `PROJECT.md`, `STATE.md`, `ROADMAP.md`)

**Directories:**
- Commands: `commands/gsd/` (gsd namespace for all commands)
- Phases: `.planning/phases/{NN}-{slug}/` (zero-padded number + kebab-case)
- Agents: `agents/` (flat, no nesting)
- System files: `get-shit-done/{category}/` (references, templates, workflows)

**Commit Messages:**
- Pattern: `{type}({phase}): {description}`
- Types: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`
- Phase: Zero-padded phase number (e.g., `01`, `18`) or phase range (e.g., `01-03`)
- Examples: `feat(01): add user authentication`, `fix(18-02): handle empty cart edge case`

**Command Naming:**
- Pattern: `/gsd:{verb}-{noun}` or `/gsd:{noun}`
- Examples: `/gsd:new-project`, `/gsd:plan-phase`, `/gsd:execute-phase`, `/gsd:progress`
- Copilot CLI: Same pattern without leading slash (`gsd:new-project`)

**Agent Naming:**
- Pattern: `gsd-{role}`
- Examples: `gsd-executor`, `gsd-planner`, `gsd-verifier`, `gsd-codebase-mapper`
- Role describes agent's specialization (executor executes, planner plans, verifier verifies)

## Where to Add New Code

**New Command:**
- Primary code: `commands/gsd/{command-name}.md`
- Workflow logic (if complex): `get-shit-done/workflows/{command-name}.md`
- Tests: Not applicable (commands are prompts, not code)
- Documentation: Add to `commands/gsd/help.md` command reference table

**New Agent:**
- Implementation: `agents/gsd-{role}.md`
- Usage: Spawn via Task tool from orchestrator command
- Documentation: Reference in spawning command's objective section

**New Template:**
- Template file: `get-shit-done/templates/{name}.md`
- Usage: Reference in agent or command that generates the document
- Example: Create `get-shit-done/templates/my-doc.md`, reference in agent: "Use template from `get-shit-done/templates/my-doc.md`"

**New Reference:**
- Reference file: `get-shit-done/references/{topic}.md`
- Usage: Load via `@~/.claude/get-shit-done/references/{topic}.md` in command or agent frontmatter
- Example: Create `get-shit-done/references/deployment.md`, add to execution_context section

**New Workflow:**
- Workflow file: `get-shit-done/workflows/{workflow-name}.md`
- Usage: Reference via `@~/.claude/get-shit-done/workflows/{workflow-name}.md` in command
- Example: Create `get-shit-done/workflows/my-workflow.md`, add to command's execution_context

**Utilities:**
- Shared helpers: `hooks/{utility}.js` for Node.js runtime hooks
- Example: Add `hooks/my-hook.js` for new statusline feature

**Installation Logic:**
- Installer modifications: `bin/install.js`
- Note: Update file copy logic if adding new directories to deploy

## Special Directories

**`.planning/`:**
- Purpose: Runtime project state and execution artifacts
- Generated: Yes, by `/gsd:new-project`
- Committed: Yes (entire directory tracked in git)
- Ignored: Never (this is project memory)

**`.planning/phases/`:**
- Purpose: Phase-specific plans, summaries, and reports
- Generated: Yes, by phase commands (plan-phase, execute-phase, verify-work)
- Committed: Yes (each plan and summary committed individually)

**`.planning/codebase/`:**
- Purpose: Codebase analysis documents for brownfield projects
- Generated: Yes, by `/gsd:map-codebase`
- Committed: Yes (consumed by planner during phase planning)

**`.planning/research/`:**
- Purpose: Domain research outputs from project initialization
- Generated: Yes (optional), by `/gsd:new-project` or `/gsd:new-milestone`
- Committed: Yes (consumed during requirements definition and planning)

**`.planning/todos/`:**
- Purpose: Captured future work items
- Generated: Yes, by `/gsd:add-todo`
- Committed: Yes (managed via `/gsd:check-todos`)

**`.planning/debug/`:**
- Purpose: Persistent debug session state
- Generated: Yes, by `/gsd:debug`
- Committed: Yes (enables resuming debug investigations across sessions)

**`node_modules/` (if present):**
- Purpose: NPM dependencies (not present in source repo)
- Generated: Yes, by `npm install` (if cloning for development)
- Committed: No (.gitignore excludes)

**`.git/`:**
- Purpose: Git repository metadata
- Generated: Yes, by git init or project initialization
- Committed: No (git metadata, not content)

**`.github/`:**
- Purpose: GitHub Copilot CLI deployment target
- Generated: Yes, by `npx get-shit-done-cc --copilot`
- Committed: Yes (when used, becomes part of repository for Copilot CLI users)
- Note: Only present in repositories using GitHub Copilot CLI

**`get-shit-done/`:**
- Purpose: Canonical source for system files
- Generated: No (source code)
- Committed: Yes (this is the package source)
- Note: Deployed to `~/.claude/get-shit-done/` (global) or `./.claude/get-shit-done/` (local) during installation

---

*Structure analysis: 2026-01-19*
