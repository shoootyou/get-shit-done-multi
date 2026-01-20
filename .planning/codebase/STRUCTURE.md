# Codebase Structure

**Analysis Date:** 2026-01-20

## Codebase Metrics

**Files Analyzed:**
- Total files: 165 files
- Source files: 55 files (JavaScript)
- Test files: 2 files
- Config files: 2 files (package.json, package-lock.json)
- Markdown files: 108+ files (commands, agents, workflows, templates, docs)

**Lines of Code:**
- Total: 9,610 lines
- Source: ~7,000 lines (estimated, excluding comments/whitespace)
- Tests: Minimal coverage (~400 lines estimated)

**Excluded from analysis:**
- Infrastructure: .claude, .github, .codex, node_modules, .git
- Build artifacts: dist, build, out, target, coverage
- Planning: .planning, .planning-old, research.claude

## Directory Layout

```plaintext
.
├── bin/                          # Executable entry points & core libraries
│   ├── install.js               # NPM installation entry point
│   ├── gsd-cli.js               # Command execution entry point
│   ├── test-*.js                # Development test suites
│   ├── validate-docs.js         # Documentation validation
│   ├── doc-generator/           # Documentation generation tools
│   └── lib/                     # Core implementation libraries
│       ├── adapters/            # Multi-CLI adapters (claude, copilot, codex)
│       │   ├── claude.js
│       │   ├── copilot.js
│       │   ├── codex.js
│       │   └── shared/          # Shared adapter utilities
│       │       ├── path-rewriter.js
│       │       └── format-converter.js
│       ├── command-system/      # Dynamic command loading & execution
│       │   ├── loader.js        # Loads commands from markdown files
│       │   ├── executor.js      # Executes commands with CLI detection
│       │   ├── registry.js      # Command registry (in-memory)
│       │   ├── parser.js        # Command argument parsing
│       │   ├── verifier.js      # Command validation
│       │   ├── help-generator.js
│       │   ├── error-handler.js
│       │   └── recorder.js      # Command execution recording
│       └── orchestration/       # Multi-agent coordination
│           ├── agent-invoker.js # CLI-agnostic agent invocation
│           ├── agent-registry.js # Agent metadata registry
│           ├── capability-matrix.js
│           ├── performance-tracker.js
│           ├── result-validator.js
│           └── validate-planning-dir.js
│
├── lib-ghcc/                    # State management subsystem
│   ├── state-integration.js    # Single entry point for state modules
│   ├── state-manager.js        # Core state operations
│   ├── session-manager.js      # Command session tracking
│   ├── directory-lock.js       # Concurrent access control
│   ├── state-validator.js      # State validation
│   ├── state-migrations.js     # Version migration handling
│   ├── state-io.js             # File I/O operations
│   ├── usage-tracker.js        # Usage analytics
│   ├── cli-fallback.js         # CLI feature fallback handling
│   ├── cli-recommender.js      # CLI recommendation engine
│   └── verification/           # Installation verification
│       ├── cli-detector.js
│       ├── agent-verifier.js
│       ├── command-verifier.js
│       ├── diagnostic-runner.js
│       └── diagnostic-test.js
│
├── commands/gsd/                # User-facing command definitions (29 files)
│   ├── new-project.md          # Initialize new project
│   ├── execute-phase.md        # Execute phase plans
│   ├── plan-phase.md           # Create phase plans
│   ├── verify-work.md          # Verify phase completion
│   ├── map-codebase.md         # Map existing codebase
│   ├── help.md                 # Command help system
│   └── ...                     # 23 more command definitions
│
├── agents/                      # Specialized agent definitions (11 files)
│   ├── gsd-executor.md         # Plan execution agent
│   ├── gsd-planner.md          # Phase planning agent
│   ├── gsd-verifier.md         # Phase verification agent
│   ├── gsd-codebase-mapper.md  # Codebase analysis agent
│   ├── gsd-debugger.md         # Debug investigation agent
│   ├── gsd-roadmapper.md       # Roadmap creation agent
│   ├── gsd-phase-researcher.md # Phase research agent
│   ├── gsd-plan-checker.md     # Plan validation agent
│   └── ...                     # 4 more agent definitions
│
├── get-shit-done/               # GSD system content
│   ├── SKILL-copilot.md        # Copilot skill definition
│   ├── SKILL-codex.md          # Codex skill definition
│   ├── workflows/              # Reusable workflow patterns (15 files)
│   │   ├── map-codebase.md
│   │   ├── execute-phase.md
│   │   ├── verify-phase.md
│   │   └── ...
│   ├── templates/              # Document templates (18 files)
│   │   ├── project.md
│   │   ├── roadmap.md
│   │   ├── requirements.md
│   │   ├── phase-prompt.md
│   │   ├── codebase/           # Codebase mapping templates (7 files)
│   │   │   ├── architecture.md
│   │   │   ├── structure.md
│   │   │   ├── stack.md
│   │   │   └── ...
│   │   └── research-project/   # Project research templates (5 files)
│   └── references/             # Reference documentation
│       ├── checkpoints.md
│       ├── git-integration.md
│       ├── questioning.md
│       ├── verification-patterns.md
│       └── ...
│
├── docs/                        # Documentation
│   └── assets/                 # Documentation assets
│
├── github/                      # GitHub-specific files
│   └── ISSUE_TEMPLATE/         # Issue templates
│
├── hooks/                       # Git hooks
│   └── pre-commit-docs         # Documentation pre-commit hook
│
├── assets/                      # Project assets
│
├── package.json                # NPM package definition
├── package-lock.json           # NPM dependency lock
├── README.md                   # Project documentation
├── CHANGELOG.md                # Version history
├── LICENSE                     # MIT license
└── GSD-STYLE.md                # Style guide
```

Generated with: Manual structure analysis

## Directory Purposes

**bin/**
- Purpose: Executable entry points and core implementation
- Contains: CLI entry points, libraries, test suites, doc generators
- Key files: `install.js` (installation), `gsd-cli.js` (command execution)

**bin/lib/adapters/**
- Purpose: Multi-CLI abstraction layer
- Contains: CLI-specific adapters and shared conversion utilities
- Key files: `claude.js`, `copilot.js`, `codex.js`, `shared/path-rewriter.js`

**bin/lib/command-system/**
- Purpose: Dynamic command discovery and execution
- Contains: Command loader, registry, executor, parser, verifier
- Key files: `loader.js` (parses markdown commands), `executor.js` (runs commands)

**bin/lib/orchestration/**
- Purpose: Multi-agent workflow coordination
- Contains: Agent invocation, registry, capability detection, performance tracking
- Key files: `agent-invoker.js` (spawns agents), `agent-registry.js` (agent metadata)

**lib-ghcc/**
- Purpose: State management subsystem
- Contains: State tracking, concurrency control, validation, migrations
- Key files: `state-integration.js` (entry point), `directory-lock.js` (concurrency), `state-manager.js` (core operations)

**lib-ghcc/verification/**
- Purpose: Installation and system verification
- Contains: CLI detection, agent/command verification, diagnostics
- Key files: `cli-detector.js`, `diagnostic-runner.js`

**commands/gsd/**
- Purpose: User-facing command definitions
- Contains: 29 markdown files with YAML frontmatter + prompts
- Key files: `new-project.md`, `execute-phase.md`, `plan-phase.md`, `help.md`

**agents/**
- Purpose: Specialized agent role definitions
- Contains: 11 agent definitions for execution, planning, verification, etc.
- Key files: `gsd-executor.md`, `gsd-planner.md`, `gsd-verifier.md`

**get-shit-done/**
- Purpose: GSD system content (workflows, templates, references)
- Contains: Skill definitions, workflows, templates, references
- Key files: `SKILL-copilot.md`, `SKILL-codex.md`

**get-shit-done/workflows/**
- Purpose: Reusable orchestration patterns
- Contains: 15 workflow definitions
- Key files: `map-codebase.md`, `execute-phase.md`, `verify-phase.md`

**get-shit-done/templates/**
- Purpose: Document templates for generated artifacts
- Contains: 18 template files plus specialized subdirectories
- Key files: `project.md`, `roadmap.md`, `phase-prompt.md`

**get-shit-done/templates/codebase/**
- Purpose: Codebase analysis output templates
- Contains: 7 templates for mapping existing code
- Key files: `architecture.md`, `structure.md`, `stack.md`, `conventions.md`

**get-shit-done/references/**
- Purpose: Reference documentation for workflows
- Contains: Best practices, patterns, integration guides
- Key files: `checkpoints.md`, `git-integration.md`, `questioning.md`

**docs/**
- Purpose: User-facing documentation
- Contains: Project documentation and assets
- Generated: Yes (via doc-generator/)

**github/**
- Purpose: GitHub-specific configuration
- Contains: Issue templates
- Committed: Yes

**hooks/**
- Purpose: Git hook scripts
- Contains: Pre-commit documentation validation
- Committed: Yes (user installs via npm script)

## Key File Locations

**Entry Points:**
- `bin/install.js`: NPM installation entry point
- `bin/gsd-cli.js`: GSD CLI command execution entry point

**Configuration:**
- `package.json`: NPM package metadata, scripts, bin definition
- `.planning/config.json`: Project workflow preferences (generated)
- `.planning/map-config.json`: Codebase mapping exclusions (optional, user-created)

**Core Logic:**
- `bin/lib/command-system/executor.js`: Command execution orchestration
- `bin/lib/orchestration/agent-invoker.js`: Agent invocation abstraction
- `lib-ghcc/state-integration.js`: State management entry point
- `bin/lib/adapters/shared/path-rewriter.js`: Multi-CLI path conversion

**Testing:**
- `bin/test-command-system.js`: Command system integration tests
- `bin/test-state-management.js`: State management unit tests
- `bin/lib/orchestration/performance-tracker.test.js`: Performance tracker tests
- `bin/lib/orchestration/result-validator.test.js`: Result validator tests

## Naming Conventions

**Files:**
- Entry points: `kebab-case.js` (e.g., `gsd-cli.js`, `install.js`)
- Commands: `kebab-case.md` (e.g., `new-project.md`, `execute-phase.md`)
- Agents: `gsd-{role}.md` (e.g., `gsd-executor.md`, `gsd-planner.md`)
- Templates: `UPPERCASE.md` or `kebab-case.md` (e.g., `PROJECT.md`, `phase-prompt.md`)
- Libraries: `kebab-case.js` (e.g., `state-manager.js`, `agent-invoker.js`)
- Tests: `{module-name}.test.js` (e.g., `performance-tracker.test.js`)

**Directories:**
- Lowercase with hyphens: `command-system`, `get-shit-done`, `doc-generator`
- No underscores used

**Modules:**
- ES6 modules: `.js` files with `import`/`export` (command-system, orchestration, lib-ghcc)
- CommonJS: `require()`/`module.exports` (adapters, older utilities)
- Mixed: ES6 modules use `createRequire()` to import CommonJS modules

**Classes:**
- PascalCase: `StateManager`, `DirectoryLock`, `AgentRegistry`, `CommandError`

**Functions:**
- camelCase: `invokeAgent()`, `detectCLI()`, `replaceClaudePaths()`, `parseCommandFile()`

## Where to Add New Code

**New Command:**
- Primary code: `commands/gsd/{command-name}.md`
- Format: YAML frontmatter + markdown prompt
- Tests: Add verification to `lib-ghcc/verification/command-verifier.js`
- Help: Automatically included in `gsd:help` (no manual update needed)

**New Agent:**
- Implementation: `agents/gsd-{role}.md`
- Format: YAML frontmatter (name, description, tools, color) + role instructions
- Registry: Automatically discovered by `AgentRegistry` (no manual update needed)
- Tests: Add verification to `lib-ghcc/verification/agent-verifier.js`

**New CLI Adapter:**
- Implementation: `bin/lib/adapters/{cli-name}.js`
- Required exports: `getTargetDirs()`, `convertContent()`, `installFiles()`
- Shared utilities: `bin/lib/adapters/shared/`
- Detection: Add to `bin/lib/detect.js`

**New Workflow:**
- Implementation: `get-shit-done/workflows/{workflow-name}.md`
- Referenced by: Commands via `@~/.claude/get-shit-done/workflows/{workflow-name}.md`
- No code changes needed (pure markdown content)

**New Template:**
- Implementation: `get-shit-done/templates/{template-name}.md`
- Category-specific: Use subdirectories (e.g., `codebase/`, `research-project/`)
- Referenced by: Commands and workflows via @-references

**State Management Feature:**
- Implementation: `lib-ghcc/{feature-name}.js`
- Integration: Export from `lib-ghcc/state-integration.js`
- Pattern: ES6 class with clear interface
- Tests: Create `{feature-name}.test.js` or add to `bin/test-state-management.js`

**Utilities:**
- Shared helpers: `bin/lib/` (organized by subsystem)
- Adapter utilities: `bin/lib/adapters/shared/`
- Pattern: Export functions, not classes

**Documentation:**
- User docs: `docs/` (generated via `bin/doc-generator/`)
- Reference docs: `get-shit-done/references/`
- Inline docs: JSDoc comments in source files

## Special Directories

**node_modules/**
- Purpose: NPM dependencies
- Generated: Yes (npm install)
- Committed: No

**.planning/**
- Purpose: Project state and generated artifacts
- Generated: Yes (by GSD commands)
- Committed: User choice (typically yes)
- Structure: PROJECT.md, STATE.md, ROADMAP.md, phase directories

**.claude/**
- Purpose: Claude CLI local installation
- Generated: Yes (by installer)
- Committed: No

**.github/**
- Purpose: GitHub workflows and configuration
- Generated: No (manually created)
- Committed: Yes

**.git/**
- Purpose: Git repository
- Generated: Yes (git init)
- Committed: N/A (repository itself)

**dist/, build/, out/, target/, coverage/**
- Purpose: Build outputs and test coverage
- Generated: If applicable (this project has none)
- Committed: No

---

*Structure analysis: 2026-01-20*
