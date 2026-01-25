# Requirements

## Milestone: v1.0 — Template-Based Multi-Platform Installer

**Goal:** Deploy get-shit-done skills and agents to Claude Code and GitHub Copilot CLI via single npx command with interactive UX and atomic transactions.

---

## v1 Requirements

### Category: Core Installation (INSTALL)

**INSTALL-01: NPX Entry Point**
- User runs `npx get-shit-done-multi` without pre-installation
- Installer runs from npm registry (always latest version)
- After installation, installer can be removed (skills persist)
- **Rationale:** Standard npx pattern (like create-react-app)

**INSTALL-02: File System Operations**
- Copy template files from package to target directory
- Create directories as needed (recursive)
- Preserve file permissions where applicable
- **Rationale:** Basic installer mechanics

**INSTALL-03: Template Rendering**
- Load templates from `/templates/` directory
- Replace template variables (e.g., `{{PLATFORM_ROOT}}`)
- Use EJS for JavaScript/JSON files (supports conditionals)
- Use plain string replacement for XML/Markdown (avoid syntax conflicts)
- **Rationale:** Transform universal templates to platform-specific

**INSTALL-04: Atomic Operations with Rollback**
- Track all file operations during installation
- On failure, rollback all completed operations in reverse order
- Leave no partial installation state
- **Rationale:** Critical Risk #1 mitigation (see research/risks.md)

**INSTALL-05: Pre-Installation Validation**
- Check available disk space (minimum 50MB)
- Verify write permissions to target directory
- Detect file conflicts (warn before overwriting)
- **Rationale:** Prevent failures mid-installation

### Category: Platform Support (PLATFORM)

**PLATFORM-01: Platform Detection**
- Auto-detect Claude Code (check `~/.claude/` directory)
- Auto-detect GitHub Copilot (run `gh copilot --version`)
- Return list of installed platforms
- **Rationale:** Enable intelligent defaults in interactive mode

**PLATFORM-02: Platform Adapter Interface**
- Define `PlatformAdapter` base class with standard methods
- Methods: `transformFrontmatter()`, `transformTools()`, `transformPath()`, `getFileExtension()`, `getTargetDir()`
- **Rationale:** Abstraction for platform differences

**PLATFORM-03: Claude Code Adapter**
- Transform tool names: Keep capitalized (Read, Write, Bash)
- Target directory: `~/.claude/commands/gsd/` (global) or `.claude/` (local)
- File extension: `.md` for agents
- Path references: `@~/.claude/get-shit-done/references/...`
- No frontmatter metadata block required
- **Rationale:** Claude-specific conventions (see research/PLATFORMS.md)

**PLATFORM-04: GitHub Copilot Adapter**
- Transform tool names: Lowercase + mappings (Read→read, Bash→execute, Write+Edit→edit, Grep+Glob→search)
- Target directory: `.github/skills/get-shit-done/`
- File extension: `.agent.md` for agents
- Path references: `@.github/get-shit-done/references/...`
- Required frontmatter metadata: platform, generated, templateVersion, projectVersion, projectName
- **Rationale:** GitHub-specific conventions (see research/PLATFORMS.md)

**PLATFORM-05: Shared Directory Copy**
- Copy `./get-shit-done/` directory (references, templates, workflows)
- Place in platform-specific location (`.claude/get-shit-done/` or `.github/get-shit-done/`)
- Preserve directory structure
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
- `--local` flag: Install to current project (`.claude/` or `.github/`)
- `--global` flag: Install globally (`~/.claude/commands/gsd/`)
- Default behavior: Prompt in interactive, local in non-interactive
- **Rationale:** Support both global and project-local skills

**CLI-04: Confirmation Flags**
- `--yes` or `-y` flag: Skip confirmation prompts (auto-confirm)
- **Rationale:** Automation and CI/CD support

**CLI-05: Help and Version**
- `--help` or `-h` flag: Show usage information
- `--version` or `-v` flag: Show installer version
- **Rationale:** Standard CLI conventions

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
- Catch common errors (no permissions, disk full, platform not installed)
- Show specific error message (not generic "failed")
- Provide next steps (e.g., "Run with sudo" or "Free up disk space")
- **Rationale:** Users can self-recover from failures

### Category: Version Management (VERSION)

**VERSION-01: Installation Manifest**
- Write `.gsd-install-manifest.json` after installation
- Include: version, timestamp, installed files, platform
- **Rationale:** Track what was installed for updates/uninstall

**VERSION-02: Update Detection**
- On re-run, check installed version vs current version
- Prompt user if update available
- Use semver for version comparison
- **Rationale:** Users stay current with bug fixes and features

**VERSION-03: Version Display**
- Show current version in `--version` output
- Show installed version in interactive mode (if already installed)
- **Rationale:** Transparency about what's running

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

**TEMPLATE-01: Base Templates**
- Store shared templates in `/templates/base/`
- Include: skill definitions, agent definitions, shared libraries
- **Rationale:** DRY principle (don't duplicate per platform)

**TEMPLATE-02: Platform Overlays**
- Store platform-specific files in `/templates/platforms/claude/` and `/templates/platforms/copilot/`
- Overlay files override or extend base templates
- **Rationale:** Platform differences isolated from base

**TEMPLATE-03: Template Variables**
- Support variables: `{{PLATFORM_ROOT}}`, `{{PLATFORM_NAME}}`, `{{VERSION}}`
- Replace during rendering phase
- **Rationale:** Same template, different output per platform

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

## v2 Requirements (Deferred)

### Category: Advanced Features

**CODEX-01: Codex CLI Support**
- Codex adapter (similar to Copilot pattern)
- Target directory: `.codex/skills/get-shit-done/`

**PLUGIN-01: Plugin System**
- External adapter loading from `~/.gsd/adapters/`
- Adapter versioning and validation
- Plugin discovery via cosmiconfig

**SECURITY-01: Template Sandboxing**
- Deeper path validation (symlink resolution, junction points)
- Digital signature verification for templates
- Dependency scanning

**WINDOWS-01: Windows Testing**
- Test on Windows with PowerShell
- Validate path separator handling
- Test environment variable expansion

**UPDATE-01: Auto-Update**
- `--update` flag to automatically update if outdated
- Show changelog on update

**UNINSTALL-01: Uninstall Command**
- Remove installed files using manifest
- Clean up empty directories

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| INSTALL-01 | Phase 1 | Pending |
| INSTALL-02 | Phase 1 | Pending |
| INSTALL-03 | Phase 1 | Pending |
| INSTALL-04 | Phase 4 | Pending |
| INSTALL-05 | Phase 4 | Pending |
| PLATFORM-01 | Phase 2 | Pending |
| PLATFORM-02 | Phase 2 | Pending |
| PLATFORM-03 | Phase 2 | Pending |
| PLATFORM-04 | Phase 2 | Pending |
| PLATFORM-05 | Phase 2 | Pending |
| CLI-01 | Phase 3 | Pending |
| CLI-02 | Phase 1 | Pending |
| CLI-03 | Phase 2 | Pending |
| CLI-04 | Phase 3 | Pending |
| CLI-05 | Phase 1 | Pending |
| UX-01 | Phase 3 | Pending |
| UX-02 | Phase 3 | Pending |
| UX-03 | Phase 3 | Pending |
| VERSION-01 | Phase 4 | Pending |
| VERSION-02 | Phase 5 | Pending |
| VERSION-03 | Phase 5 | Pending |
| SAFETY-01 | Phase 6 | Pending |
| SAFETY-02 | Phase 1 | Pending |
| TEMPLATE-01 | Phase 1 | Pending |
| TEMPLATE-02 | Phase 2 | Pending |
| TEMPLATE-03 | Phase 1 | Pending |
| DOCS-01 | Phase 8 | Pending |
| DOCS-02 | Phase 8 | Pending |
| DOCS-03 | Phase 8 | Pending |

**Total v1 Requirements:** 29
**Total v2 Requirements:** 6

---

**Last Updated:** 2025-01-25
