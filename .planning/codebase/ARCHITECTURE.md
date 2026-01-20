# Architecture

**Analysis Date:** 2026-01-20

**Scope:**
- Source files: 55 files
- Primary language: JavaScript (100% of implementation code)
- LOC: 9,610 lines
- Test files: 2 files

## Pattern Overview

**Overall:** Orchestrator-Agent with Multi-CLI Adapter Pattern

**Key Characteristics:**
- Orchestrators delegate to specialized agents (gsd-executor, gsd-planner, gsd-verifier, etc.)
- Multi-CLI adapters abstract differences between Claude, Copilot, and Codex CLIs
- Command system dynamically loads markdown-defined commands at runtime
- State management provides concurrent-safe project tracking
- Workflow-driven execution using markdown templates

## Layers

**Installation Layer:**
- Purpose: Installs GSD system to target CLI environments
- Location: `bin/install.js`
- Contains: CLI detection, adapter selection, file copying/conversion
- Depends on: Adapters, Path utilities, Upgrade utilities
- Used by: npm install process, user installation

**Command Layer:**
- Purpose: Exposes user-facing commands through CLI interfaces
- Location: `commands/gsd/`
- Contains: 29 markdown command definitions with frontmatter + prompt
- Depends on: Command system, Workflows, Templates
- Used by: gsd-cli.js entry point

**Orchestration Layer:**
- Purpose: Coordinates multi-agent workflows with CLI abstraction
- Location: `bin/lib/orchestration/`
- Contains: Agent invocation, performance tracking, capability matrix, result validation
- Depends on: Agent registry, CLI detection, State management
- Used by: Commands, Workflows

**Command System Layer:**
- Purpose: Dynamic command discovery and execution
- Location: `bin/lib/command-system/`
- Contains: Loader, registry, executor, parser, help generator, error handler
- Depends on: CLI detection, Adapters
- Used by: gsd-cli.js

**Adapter Layer:**
- Purpose: Abstracts differences between Claude, Copilot, and Codex CLIs
- Location: `bin/lib/adapters/`
- Contains: claude.js, copilot.js, codex.js, shared utilities (path-rewriter, format-converter)
- Depends on: Path utilities
- Used by: Installation, Command system, Orchestration

**State Management Layer:**
- Purpose: Provides concurrent-safe project state tracking
- Location: `lib-ghcc/`
- Contains: StateManager, SessionManager, DirectoryLock, StateValidator, UsageTracker, StateMigrations
- Depends on: File system
- Used by: Orchestration layer, Commands

**Verification Layer:**
- Purpose: Validates installations and command execution
- Location: `lib-ghcc/verification/`
- Contains: CLI detector, agent verifier, command verifier, diagnostic runner
- Depends on: Adapters, Command system
- Used by: Installation, Development testing

**Content Layer:**
- Purpose: Provides templates, workflows, references, and agent definitions
- Location: `get-shit-done/`, `agents/`
- Contains: Workflows (15), Templates (18), References, Agent definitions (11), Skills
- Depends on: None (pure content)
- Used by: Commands, Orchestration, Agents

## Data Flow

**Command Execution Flow:**

1. User invokes command: `gsd-cli gsd:new-project`
2. `bin/gsd-cli.js` entry point loads command system
3. Command loader reads `commands/gsd/new-project.md`
4. Executor detects current CLI (Claude/Copilot/Codex)
5. Command prompt + context references sent to CLI
6. Command orchestrates workflow (may spawn agents)
7. Results validated and recorded in state

**Agent Invocation Flow:**

1. Orchestrator calls `invokeAgent(agentName, prompt, options)`
2. Directory lock acquired for concurrent safety
3. CLI detected and agent metadata loaded from registry
4. Agent capability checked for current CLI
5. Agent prompt sent to CLI with performance tracking
6. Result validated and returned to orchestrator
7. State management records execution

**Installation Flow:**

1. User runs `npm install -g get-shit-done-cc`
2. `bin/install.js` entry point runs
3. CLI detection identifies available CLIs
4. User selects CLI(s) and scope (global/local)
5. Adapter converts content for target CLI
6. Files copied to target CLI directories
7. Verification tests confirm installation

**State Management:**

- Project state stored in `.planning/` directory
- DirectoryLock prevents concurrent write conflicts
- StateManager provides atomic operations
- SessionManager tracks command execution history
- StateMigrations handle version upgrades

## Key Abstractions

**Command Definition:**
- Purpose: Declarative command specification
- Examples: `commands/gsd/new-project.md`, `commands/gsd/execute-phase.md`
- Pattern: YAML frontmatter + markdown prompt
- Frontmatter: name, description, allowed-tools, argument-hint
- Body: objective, execution_context, process steps

**Agent Definition:**
- Purpose: Specialized autonomous execution unit
- Examples: `agents/gsd-executor.md`, `agents/gsd-planner.md`, `agents/gsd-verifier.md`
- Pattern: YAML frontmatter + role/process instructions
- Spawned by: Task tool invocations from orchestrators
- Returns: Structured output to spawning orchestrator

**Workflow:**
- Purpose: Reusable orchestration logic
- Examples: `get-shit-done/workflows/map-codebase.md`, `get-shit-done/workflows/execute-phase.md`
- Pattern: Step-by-step process documentation
- Referenced by: Commands via @-references

**Adapter:**
- Purpose: CLI-specific implementation abstraction
- Examples: `bin/lib/adapters/claude.js`, `bin/lib/adapters/copilot.js`
- Pattern: getTargetDirs(), convertContent(), installFiles()
- Enables: Single codebase supporting multiple CLIs

**State Module:**
- Purpose: Isolated state management concern
- Examples: `lib-ghcc/state-manager.js`, `lib-ghcc/directory-lock.js`
- Pattern: ES6 classes with clear interfaces
- Integration: Single entry point via `state-integration.js`

## Entry Points

**NPM Installation:**
- Location: `bin/install.js`
- Triggers: `npm install -g get-shit-done-cc` or `npx get-shit-done-cc`
- Responsibilities: CLI detection, user prompts, adapter selection, file installation

**GSD CLI:**
- Location: `bin/gsd-cli.js`
- Triggers: Direct invocation via `gsd-cli <command>`
- Responsibilities: Command loading, argument parsing, command execution

**Test Suites:**
- Location: `bin/test-command-system.js`, `bin/test-state-management.js`, `bin/test-cross-cli-state.js`
- Triggers: Manual execution during development
- Responsibilities: Validation of command system, state management, cross-CLI behavior

**Documentation Generators:**
- Location: `bin/doc-generator/*.js`
- Triggers: `npm run docs:generate`
- Responsibilities: Generate CLI comparison docs, capability matrix, extract capabilities

## Error Handling

**Strategy:** Graceful degradation with CLI fallback

**Patterns:**
- CommandError class for command-specific failures
- formatError() for user-friendly error messages
- degradeGracefully() suggests alternatives when features unavailable
- CLI-specific fallback via CLIFallback class
- Verification layer validates installations and provides diagnostics
- Result validation ensures agent outputs match expectations

## Cross-Cutting Concerns

**Logging:** Console-based with color coding (cyan, green, yellow, dim, reset)

**Validation:** 
- Command frontmatter validation via verifier
- State validation via StateValidator
- Result validation via ResultValidator
- Planning directory validation via validate-planning-dir.js

**Authentication:** Not applicable (CLI tool)

**CLI Detection:**
- Runtime detection via `detectCLI()` in `bin/lib/detect.js`
- Checks environment markers: CLAUDE_CODE, GITHUB_COPILOT, CODEX_CLI
- Installation-time detection via `detectInstalledCLIs()`
- Adapter selection based on detected CLI

**Performance Tracking:**
- PerformanceTracker monitors agent execution time
- Performance marks and measures via Node perf_hooks
- Usage tracking via UsageTracker
- Session history via SessionManager

**Concurrency Control:**
- DirectoryLock prevents concurrent writes to .planning/
- File-based locking with retry mechanism
- Lock acquisition timeout handling
- Automatic cleanup on process exit

---

*Architecture analysis: 2026-01-20*
