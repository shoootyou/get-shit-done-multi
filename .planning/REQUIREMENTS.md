# Requirements

## Milestone: v2.0 — Template-Based Multi-Platform Installer

**Goal:** Deploy get-shit-done skills and agents to Claude Code, GitHub Copilot CLI, and Codex CLI via single npx command with interactive UX, atomic transactions, and cross-platform support.

---

## v1 Requirements

### Category: Core Installation (INSTALL)

**INSTALL-01: NPX Entry Point**
- User runs `npx get-shit-done-multi` without pre-installation
- Installer runs from npm registry (always latest version)
- After installation, installer can be removed (skills persist)
- Initial version is 2.0.0
- **Rationale:** Standard npx pattern (like create-react-app)

**INSTALL-02: File System Operations**
- Copy template files from package to target directory
- Create directories as needed (recursive)
- Preserve file permissions where applicable
- **Rationale:** Basic installer mechanics

**INSTALL-03: Template Rendering**
- Load templates from `/templates/skills/` and `/templates/agents/` directories
- Templates are COPIES of existing `.github/skills/` and `.github/agents/` files with variables
- Replace template variables (e.g., `{{PLATFORM_ROOT}}`, `{{COMMAND_PREFIX}}`)
- Use EJS for JavaScript/JSON files (supports conditionals)
- Use plain string replacement for Markdown files (avoid syntax conflicts)
- Maintain directory structure: skills are `.xxx/skills/gsd-<name>/SKILL.md`
- **Rationale:** Transform universal templates to platform-specific

**INSTALL-04: Atomic Operations with Pre-Flight Validation**
- Run comprehensive pre-flight validation before any writes
- Pre-installation checks prevent ~80% of failures (disk space, permissions, paths)
- On validation failure, no files written (atomic behavior)
- **Rollback deferred:** Post-validation failures leave partial files (out of scope for v2.0)
  - Trade-off: Pre-flight validation reduces post-start failures to ~20%
  - Future: v2.1+ can add rollback based on user feedback
- **Rationale:** Pre-flight validation provides atomic behavior for common failure modes while keeping implementation simple
- **Implementation:** Validation gate in orchestrator before any file operations

**INSTALL-05: Pre-Installation Validation**
- Check available disk space with 10% buffer
  - Use parent directory for check if target doesn't exist yet (first install)
  - Prevents false "Node.js 19+" warnings on first installation
- Verify write permissions to target directory with actual write test
- Validate paths for security (no traversal, no system directories)
- Detect existing installation from manifest files
- Collect warnings (non-fatal) to display after validation passes
- **Rationale:** Prevent ~80% of failures before any writes occur
- **Implementation:** Pre-flight validation gate in orchestrator before template validation

### Category: Platform Support (PLATFORM)

**PLATFORM-01: Platform Detection**
- Detect installed GSD instances by checking for:
  - `.github/skills/gsd-*`, `.github/agents/gsd-*`, `.github/get-shit-done/`
  - `.claude/skills/gsd-*`, `.claude/agents/gsd-*`, `.claude/get-shit-done/`
  - `.codex/skills/gsd-*`, `.codex/agents/gsd-*`, `.codex/get-shit-done/`
- Check both global (`~/`) and local (repo root) paths
- Return list of detected installations with versions
- **Rationale:** Use GSD-specific paths, not CLI binary detection

**PLATFORM-01B: Binary Detection for Recommendations**
- Detect available CLI binaries: `copilot`, `claude`, `codex`
- Use for recommendations: "You have Claude Code installed, install GSD for Claude?"
- Don't use for installation validation (use PLATFORM-01 instead)
- **Rationale:** Recommend platforms but validate via GSD paths

**PLATFORM-02: Platform Adapter Interface**
- Define `PlatformAdapter` base class with standard methods
- Methods: `transformFrontmatter()`, `transformTools()`, `transformPath()`, `getFileExtension()`, `getTargetDir()`
- **ARCHITECTURAL RULE:** Each platform MUST have its own complete adapter implementation
- **NO INHERITANCE** between platform adapters (ClaudeAdapter, CopilotAdapter, CodexAdapter)
- Each adapter is ISOLATED - changes to one platform should NOT affect others
- Code duplication between adapters is ACCEPTABLE and PREFERRED over coupling
- **Rationale:** Platform isolation over DRY - if CLI specifications change, only one adapter needs updating

**PLATFORM-03: Claude Code Adapter**
- Transform tool names: Keep capitalized (Read, Write, Bash)
- Target directory: `~/.claude/skills/gsd/` (global) or `.claude/skills/` (local)
- File extension: `.md` for agents
- Path references: `@.claude/get-shit-done/references/...`
- Command prefix: `/gsd-...`
- No frontmatter metadata block required
- Copy shared directory to `.claude/get-shit-done/`
- **Rationale:** Claude-specific conventions (see research/PLATFORMS.md)

**PLATFORM-04: GitHub Copilot Adapter**
- Transform tool names: Lowercase + mappings (Read→read, Bash→execute, Write+Edit→edit, Grep+Glob→search, Task→agent)
- Target directory: `~/.copilot/skills/gsd/` (global) or `.github/skills/` (local)
- File extension: `.agent.md` for agents
- Path references: `@.github/get-shit-done/references/...`
- Command prefix: `/gsd-...`
- Required frontmatter metadata: platform, generated, templateVersion, projectVersion, projectName
- Copy shared directory to `.github/get-shit-done/` or `~/.copilot/get-shit-done/`
- Detect binary: `copilot` (not `gh`)
- **Rationale:** GitHub-specific conventions (see research/PLATFORMS.md)

**PLATFORM-04B: Codex CLI Adapter**
- Transform tool names: Same as Copilot (lowercase + mappings)
- Target directory: `~/.codex/skills/gsd/` (global) or `.codex/skills/` (local)
- File extension: `.agent.md` for agents
- Path references: `@.codex/get-shit-done/references/...`
- Command prefix: `$gsd-...` (NOT `/gsd-...`)
- Replace all `/gsd-` with `$gsd-` in skill content
- Required frontmatter metadata: Same as Copilot
- Copy shared directory to `.codex/get-shit-done/`
- Detect binary: `codex`
- **IMPORTANT:** CodexAdapter is SEPARATE implementation, NOT inheritance from CopilotAdapter
- Code similarity with CopilotAdapter is acceptable duplication (per PLATFORM-02 rule)
- **Rationale:** Codex uses `$` prefix for commands; adapter isolation per architectural rule

**PLATFORM-05: Shared Directory Copy**
- Copy `./get-shit-done/` directory (references, templates, workflows)
- Place in platform-specific location:
  - Claude: `.claude/get-shit-done/` (local) or `~/.claude/get-shit-done/` (global)
  - Copilot: `.github/get-shit-done/` (local) or `~/.copilot/get-shit-done/` (global)
  - Codex: `.codex/get-shit-done/` (local) or `~/.codex/get-shit-done/` (global)
- Preserve directory structure
- Include `.gsd-install-manifest.json` template in `/get-shit-done/` directory
- **Rationale:** Skills reference shared resources

### Category: CLI Flags and Modes (CLI)

**CLI-01: Interactive Mode (Default)**
- No flags = interactive prompts with @clack/prompts
- Auto-detect platforms, show which are available
- Multi-select skills/agents to install
- Confirm before installation
- **Rationale:** Best UX for manual installation

**CLI-02: Platform Selection Flags**
- `--claude` flag: Install to Claude Code (skip detection)
- `--copilot` flag: Install to GitHub Copilot CLI (skip detection)
- Multiple flags supported: `--claude --copilot` (install to both)
- **Rationale:** Non-interactive mode for automation

**CLI-03: Installation Mode Flags**
- `--local` flag: Install to current project (`.claude/`, `.github/`, `.codex/`)
- `--global` flag: Install globally (`~/.claude/`, `~/.copilot/`, `~/.codex/`)
- Default behavior: Prompt in interactive, local in non-interactive
- **Rationale:** Support both global and project-local skills

**CLI-04: Confirmation Flags**
- `--yes` or `-y` flag: Skip confirmation prompts (auto-confirm)
- **Rationale:** Automation and CI/CD support

**CLI-05: Help and Version**
- `--help` or `-h` flag: Show usage information
- `--version` or `-v` flag: Detect and show ALL installations (global + local) with their versions
- Version detection checks all possible GSD installation paths
- Display format: 
  ```
  Installed versions:
  - Claude (global): v2.0.1 at ~/.claude/get-shit-done/
  - Copilot (local): v2.0.0 at .github/get-shit-done/
  - Codex (global): v2.0.1 at ~/.codex/get-shit-done/
  ```
- **Rationale:** Standard CLI conventions + multi-installation awareness

### Category: User Experience (UX)

**UX-01: Progress Feedback**
- Show spinner during file operations
- Display completion message with next steps
- Show error messages with actionable guidance
- **Rationale:** User knows what's happening

**UX-02: Beautiful Interactive Prompts**
- Use @clack/prompts for consistent UI
- Intro message explaining what installer does
- Platform selection with disabled "coming soon" options
- Multi-select for skills/agents
- Confirmation prompt before installation
- Outro message with success/failure
- **Rationale:** Premium CLI experience

**UX-03: Error Handling with Guidance**
- Catch common errors (insufficient space, no permissions, invalid paths, existing installation)
- Show specific error messages with context (not generic "failed")
- Provide actionable next steps based on error type
- Log all errors to `.gsd-error.log` in target directory
- Validation errors show both technical + friendly messages on terminal
- Runtime errors show friendly message on terminal + technical details in log file
- **Rationale:** Users can self-recover from failures with clear guidance
- **Implementation:** Error logging wrapper in installation entry point with error type detection

### Category: Version Management (VERSION)

**VERSION-01: Installation Manifest**
- Write `.gsd-install-manifest.json` to target directory after successful installation
- Place in each installation path:
  - `.claude/get-shit-done/.gsd-install-manifest.json`
  - `.github/get-shit-done/.gsd-install-manifest.json`
  - `.codex/get-shit-done/.gsd-install-manifest.json`
  - `~/.claude/get-shit-done/.gsd-install-manifest.json`
  - `~/.copilot/get-shit-done/.gsd-install-manifest.json`
  - `~/.codex/get-shit-done/.gsd-install-manifest.json`
- Include: gsd_version, platform, scope (global/local), installed_at (ISO timestamp), files[] (sorted)
- Generated via post-installation directory scan with two-pass write (empty → scan → rewrite with complete list)
- Manifest includes itself in files array
- No checksums or schema_version (can extend in v2.1+)
- **Rationale:** Track what was installed for updates/uninstall, support multiple installations
- **Implementation:** `generateAndWriteManifest()` called after all installation phases complete

**VERSION-02: Update Detection**
- On re-run, check ALL installed versions from manifests in all paths
- Prompt user for each outdated installation
- Use semver for version comparison
- **Rationale:** Users stay current with bug fixes and features across all installations

**VERSION-03: Version Display**
- Show current installer version in `--version` output
- Show all installed versions (from all manifests) in `--version` output
- Show installed version per platform in interactive mode (if already installed)
- **Rationale:** Transparency about what's running across all installations

### Category: Path Safety (SAFETY)

**SAFETY-01: Path Traversal Prevention**
- Validate all output paths before writing
- Reject paths containing `../` or absolute paths outside target
- Resolve symlinks before validation
- **Rationale:** Critical Risk #2 mitigation (see research/risks.md)

**SAFETY-02: Path Normalization**
- Use `path.join()` and `path.resolve()` for all path operations
- Never concatenate strings for paths
- Use `os.homedir()` for home directory (not `process.env.HOME`)
- **Rationale:** Cross-platform compatibility (especially Windows)

### Category: Template Structure (TEMPLATE)

**TEMPLATE-01: Migration to Template Structure (PHASE 1 ONE-TIME)**
- **Purpose:** ONE-TIME migration from `.github/` to `/templates/` with frontmatter corrections
- **Source:** Read from `.github/skills/` and `.github/agents/` (READ-ONLY, never modify)
- **Target:** Write corrected templates to `/templates/skills/` and `/templates/agents/`
- **Process:** 
  1. Copy skill/agent content
  2. Apply frontmatter corrections (see TEMPLATE-01C and TEMPLATE-01D)
  3. Add template variables (`{{PLATFORM_ROOT}}`, `{{COMMAND_PREFIX}}`, etc.)
  4. Generate version.json files
  5. Validate output against official specs
- **After Phase 1:** Delete migration code, `/templates/` becomes permanent source
- **install.js:** Always reads from `/templates/`, never from `.github/`
- **Do NOT:** Modify original source files in `.github/`, `.claude/`, or `.codex/` directories
- **Do NOT:** Create ongoing conversion pipeline (migration is one-time only)
- **Do NOT:** Generate new skills or agents from scratch
- **Skills structure:** `/templates/skills/gsd-<skill-name>/SKILL.md` (directory-based)
- **Agents structure:** `/templates/agents/gsd-<agent-name>.agent.md` (flat files)
- **Agent versions:** `/templates/agents/versions.json` (consolidated metadata for all agents)
- **Rationale:** One-time migration establishes clean template foundation, avoid maintaining dual sources

**TEMPLATE-01B: Template Variable Injection (PHASE 1 ONE-TIME)**
- **During migration:** Replace hardcoded values with template variables:
  - Platform roots: `.github/` → `{{PLATFORM_ROOT}}`
  - Command prefixes: `/gsd-` → `{{COMMAND_PREFIX}}`
  - Version numbers: `1.9.1` → `{{VERSION}}`
  - Platform names: `copilot` → `{{PLATFORM_NAME}}`
- Preserve all other content exactly as-is
- Maintain directory structure for skills
- **After Phase 1:** No further conversion needed, templates are ready
- **Rationale:** One-time systematic conversion ensures no content loss, templates work for all platforms

**TEMPLATE-01C: Frontmatter Format Correction for Skills (PHASE 1 ONE-TIME)**
- **APPLIES TO SKILLS ONLY** - Agents have independent structure (see TEMPLATE-01D)
- **During Phase 1 migration only:** Fix invalid frontmatter fields when creating templates (NOT on source files):
  - **Remove unsupported fields:** `skill_version`, `requires_version`, `platforms`, `metadata`, `arguments`
  - **Rename field:** `tools` → `allowed-tools`
  - **Convert tools format:** From YAML array `[read, edit]` to comma-separated string `Read, Edit, Bash`
  - **Normalize tool names:** Apply proper capitalization (read→Read, bash→Bash, execute→Bash, etc.)
  - **Convert arguments to argument-hint:** Use `arguments` array from source as reference to generate appropriate `argument-hint` string (e.g., `[domain]`, `[filename] [format]`)
- **Create version.json** in each template skill directory during migration:
  - Store removed metadata: `skill_version`, `requires_version`, `platforms`, `metadata` ONLY
  - **DO NOT** store `arguments` field - use as reference only during conversion
  - Used for version tracking and platform compatibility checks
  - Format: `{"skill_version": "1.9.1", "requires_version": "1.9.0+", "platforms": ["claude", "copilot", "codex"], "metadata": {...}}`
- **After Phase 1:** Templates have correct frontmatter, version.json files exist, migration code deleted
- **Official supported frontmatter fields for SKILLS** (per https://code.claude.com/docs/en/slash-commands#frontmatter-reference):
  - `name` (optional): Display name
  - `description` (recommended): What the skill does
  - `argument-hint` (optional): Autocomplete hint for expected arguments (e.g., `[issue-number]` or `[filename] [format]`)
  - `disable-model-invocation` (optional): Prevent auto-loading
  - `user-invocable` (optional): Show in `/` menu
  - `allowed-tools` (optional): Tools Claude can use - **comma-separated string, one line**
  - `model` (optional): Model to use
  - `context` (optional): Set to `fork` for subagent
  - `agent` (optional): Subagent type when context is fork
  - `hooks` (optional): Lifecycle hooks
- **Rationale:** One-time correction during migration establishes clean foundation, no ongoing conversion needed

**TEMPLATE-01D: Agent Frontmatter Correction (PHASE 1 ONE-TIME)**
- **APPLIES TO AGENTS ONLY** (13 files) - Separate from Skills
- **During Phase 1 migration only:** Fix agent frontmatter fields when creating templates (NOT on source files):
  - **Remove unsupported field:** `metadata` block
  - **Convert tools format:** From YAML array `[read, edit]` to comma-separated string `Read, Edit, Bash`
  - **Map tool names:** Copilot aliases → Claude official (execute→Bash, search→Grep, agent→Task)
  - **Add skills field (Claude only):** Scan agent content for `/gsd-` references, add all found skills
  - **Keep supported fields:** name, description, tools, disallowedTools, model, permissionMode, skills, hooks (Claude) | name, description, target, tools, infer, mcp-servers (Copilot)
- **Create versions.json** in templates/agents/ during migration (NOT per-agent):
  - Consolidated file with all agents: `{"agent-name": {version, platforms, metadata}, ...}`
  - Template with {{VARIABLES}} for platform-specific values
  - Copied to `.xxx/agents/versions.json` during installation (one per platform)
  - Format: `{"gsd-executor": {"version": "1.9.1", "requires_version": "1.9.0+", "platforms": [...], "metadata": {...}}}`
- **After Phase 1:** Templates have correct frontmatter, versions.json exists, migration code deleted
- **Official supported frontmatter fields for AGENTS:**
  - **Claude** (per https://code.claude.com/docs/en/sub-agents):
    - `name` (required): Unique identifier
    - `description` (required): When to delegate to subagent
    - `tools` (optional): Comma-separated string
    - `disallowedTools` (optional): Tools to deny
    - `model` (optional): sonnet/opus/haiku/inherit
    - `permissionMode` (optional): default/acceptEdits/dontAsk/bypassPermissions/plan
    - `skills` (optional): Skills to pre-load at startup
    - `hooks` (optional): Lifecycle hooks
  - **Copilot** (per https://docs.github.com/en/copilot/reference/custom-agents-configuration):
    - `name` (optional): Display name
    - `description` (required): Purpose and capabilities
    - `target` (optional): vscode/github-copilot
    - `tools` (optional): List or string
    - `infer` (optional): Auto-invoke (default true)
    - `mcp-servers` (optional): Additional MCP servers
    - `metadata` (optional but remove): Use versions.json instead
- **Skill reference extraction:** Scan agent content for `/gsd-*`, `$gsd-*`, `gsd-*` patterns, cross-reference with skills directory, add to `skills` field (Claude only)
- **Rationale:** One-time correction during migration establishes clean foundation, agents have platform-specific requirements, metadata centralized in versions.json

**TEMPLATE-02: Platform-Specific Transformations**
- Handle platform differences via adapters (not template duplication)
- Transformations include:
  - **Tool name mappings** with proper formatting per platform:
    - Claude/Copilot/Codex: Comma-separated string in `allowed-tools` field
    - Tool capitalization: Read, Write, Edit, Bash, Grep, Glob, Task, etc.
    - Cross-platform mappings handled by adapters
  - Path reference rewriting
  - Command prefix changes (`/gsd-` vs `$gsd-`)
  - File extension changes
  - Frontmatter additions/removals
- **Rationale:** Single source of truth, platform differences isolated in adapters

**TEMPLATE-02B: Tool Name Reference Table**
- Official tool names per Claude docs (https://code.claude.com/docs/en/settings#tools-available-to-claude):
  - `AskUserQuestion` - Multiple choice questions
  - `Bash` - Shell commands (requires permission)
  - `TaskOutput` - Background task output
  - `Edit` - Targeted file edits (requires permission)
  - `ExitPlanMode` - Exit plan mode (requires permission)
  - `Glob` - File pattern matching
  - `Grep` - Content search
  - `KillShell` - Kill background shell
  - `MCPSearch` - MCP tool search
  - `NotebookEdit` - Jupyter notebook edits (requires permission)
  - `Read` - Read file contents
  - `Skill` - Execute skill (requires permission)
  - `Task` - Run sub-agent
  - `TaskCreate`, `TaskGet`, `TaskList`, `TaskUpdate` - Task management
  - `WebFetch` - Fetch URL (requires permission)
  - `WebSearch` - Web search (requires permission)
  - `Write` - Create/overwrite files (requires permission)
  - `LSP` - Language server protocol
- **Rationale:** Use official tool names, avoid invented/incorrect mappings

**TEMPLATE-03: Template Variables**
- Support variables: `{{PLATFORM_ROOT}}`, `{{PLATFORM_NAME}}`, `{{VERSION}}`, `{{COMMAND_PREFIX}}`
- Replace during rendering phase
- Examples:
  - `{{PLATFORM_ROOT}}` → `.claude/` or `.github/` or `.codex/`
  - `{{COMMAND_PREFIX}}` → `/gsd-` or `$gsd-`
- **Rationale:** Same template, different output per platform

### Category: Testing (TEST)

**TEST-01: Testing Isolation**
- ALL tests MUST execute under `/tmp` directory
- Each test MUST have its own unique folder (e.g., `/tmp/gsd-test-{timestamp}`)
- Never execute installation in source directory
- Never modify source files (.github/, .claude/, .codex/, get-shit-done/)
- **Rationale:** Prevent accidental source file corruption during development/testing

**TEST-02: Test Cleanup**
- Test folders should be cleaned up after test completion
- Failed tests may leave folders for debugging
- Provide utility to clean all `/tmp/gsd-test-*` folders
- **Rationale:** Prevent /tmp pollution from repeated testing

### Category: Documentation (DOCS)

**DOCS-01: Installation Instructions**
- Create `/docs/installation.md` with usage examples
- Show interactive and non-interactive modes
- Include troubleshooting section
- **Rationale:** Users know how to install

**DOCS-02: Architecture Documentation**
- Create `/docs/architecture.md` explaining adapter pattern
- Document module structure (`/bin/lib/`)
- **Rationale:** Contributors understand system design

**DOCS-03: Platform Comparison**
- Create `/docs/platform-differences.md` with tool mappings table
- Explain frontmatter differences
- **Rationale:** Transparency about platform-specific behavior

---

## v2.x Requirements (Future Enhancements)

### Category: Advanced Features

**SECURITY-01: Template Sandboxing**
- Deeper path validation (symlink resolution, junction points)
- Digital signature verification for templates
- Dependency scanning

**UPDATE-01: Auto-Update**
- `--update` flag to automatically update if outdated
- Show changelog on update

**UNINSTALL-01: Uninstall Command**
- Remove installed files using manifest
- Clean up empty directories

**PLUGIN-01: Plugin System for External Adapters**
- External adapter loading from `~/.gsd/adapters/`
- Adapter versioning and validation
- Plugin discovery via cosmiconfig
- **Note:** This is a separate future project

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INSTALL-01 | Phase 2 | ✅ Complete |
| INSTALL-02 | Phase 2 | ✅ Complete |
| INSTALL-03 | Phase 2 | ✅ Complete |
| INSTALL-04 | Phase 5 | ✅ Complete |
| INSTALL-05 | Phase 5 | ✅ Complete |
| PLATFORM-01 | Phase 3 | ✅ Complete |
| PLATFORM-01B | Phase 3 | ✅ Complete |
| PLATFORM-02 | Phase 3 | ✅ Complete |
| PLATFORM-03 | Phase 3 | ✅ Complete |
| PLATFORM-04 | Phase 3 | ✅ Complete |
| PLATFORM-04B | Phase 3 | ✅ Complete |
| PLATFORM-05 | Phase 3 | ✅ Complete |
| CLI-01 | Phase 4 | ✅ Complete |
| CLI-02 | Phase 2 | ✅ Complete |
| CLI-03 | Phase 3 | ✅ Complete |
| CLI-04 | Phase 4 | ✅ Complete |
| CLI-05 | Phase 2 | ✅ Complete |
| UX-01 | Phase 4 | ✅ Complete |
| UX-02 | Phase 4 | ✅ Complete |
| UX-03 | Phase 4 | ✅ Complete |
| VERSION-01 | Phase 5 | ✅ Complete |
| VERSION-02 | Phase 6 | ✅ Complete |
| VERSION-03 | Phase 6 | ✅ Complete |
| SAFETY-01 | Phase 7 | ✅ Complete |
| SAFETY-02 | Phase 2 | ✅ Complete |
| TEMPLATE-01 | Phase 1 | ✅ Complete |
| TEMPLATE-01B | Phase 1 | ✅ Complete |
| TEMPLATE-01C | Phase 1 | ✅ Complete |
| TEMPLATE-01D | Phase 1 | ✅ Complete |
| TEMPLATE-02 | Phase 3 | ✅ Complete |
| TEMPLATE-02B | Phase 1 | ✅ Complete |
| TEMPLATE-03 | Phase 1 | ✅ Complete |
| DOCS-01 | Phase 8 | Pending |
| DOCS-02 | Phase 8 | Pending |
| DOCS-03 | Phase 8 | Pending |
| TEST-01 | Phase 1 | ✅ Complete |
| TEST-02 | Phase 1 | ✅ Complete |

**Total v2.0 Requirements:** 37 (added TEMPLATE-01D for agents)
**Total v2.x Requirements:** 4 (deferred enhancements)

---

**Last Updated:** 2025-01-25
