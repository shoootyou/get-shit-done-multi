# Phase 2: Core Installer Foundation - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

User can install get-shit-done skills to Claude Code via `npx get-shit-done-multi --claude` using templates from `/templates/`. Initial version is 2.0.0. No rollback (Phase 5), no interactive prompts (Phase 4), no multi-platform adapter abstraction yet (Phase 3) — just validate core mechanics work for Claude.

</domain>

<decisions>
## Implementation Decisions

### Installation Target & Scope
- Default: Local (`.claude/`) repo-specific installation
- Support both `--global` and `--local` flags explicitly in Phase 2
- If neither flag specified: default to local
- Global installs to: `~/.claude/`
- Local installs to: `.claude/` (relative to current directory)

### Existing Installation Detection
- Detect by checking for `.gsd-install-manifest.json` file in target location
- If manifest exists: installation detected
- When detected: warn user that existing installation will be overwritten
- Prompt for confirmation before proceeding
- User must confirm (Y/N) to continue
- If user declines: abort installation gracefully

### Installation Progress & Feedback
- **Verbosity levels:**
  - Default (moderate): Show phases (skills, agents, shared) with progress bars
  - Verbose (`--verbose` flag): Show every file as it's copied
- **Progress indicator style:** Progress bars showing % complete for each phase
- **Phases to show:**
  1. Installing skills (29 total)
  2. Installing agents (13 total)
  3. Installing shared directory
- **Success message:** Summary with counts + next steps
  - Format: "✓ 29 skills, 13 agents installed to .claude/"
  - Include: "Try /gsd-help to get started"
- **Failure message:** Show error + what failed + suggest fix
  - Example: "Failed to copy skill gsd-execute-phase: EACCES permission denied"
  - Include: Suggested fix when possible (check permissions, free disk space)

### Template Variable Replacement
- **{{PLATFORM_ROOT}} replacements:**
  - Global: `~/.claude`
  - Local: `.claude`
- **{{COMMAND_PREFIX}} replacement:** `/gsd-` (slash prefix for Claude)
- **Unknown variables:** Skip replacement (leave as-is) and log warning
  - Example: `{{UNKNOWN_VAR}}` stays as `{{UNKNOWN_VAR}}` in output
  - Warning logged: "Unknown template variable: {{UNKNOWN_VAR}}"
- **Template validation:** Validate templates exist and are readable before starting
  - Check that `templates/skills/`, `templates/agents/`, `templates/get-shit-done/` directories exist
  - Verify read permissions on template directories
  - Fail early if templates missing or unreadable

### Error Handling & Recovery
- **Partial installation on failure:** Note partial state in error message
  - Message includes: "Partial installation may exist. Full rollback coming in Phase 5."
  - List what was successfully installed before failure
- **Disk space check:** Check available disk space before starting (require 50MB minimum)
  - Fail early with clear message if insufficient space
- **Permission errors:** Show permission error + file path
  - Format: "Permission denied: /path/to/file"
  - No automatic retry or sudo suggestion
- **Invalid templates:** Skip invalid templates and continue with valid ones
  - Log warning for each skipped template
  - Installation succeeds if at least some templates are valid
  - Final summary shows: "28/29 skills installed (1 skipped due to invalid format)"

### CLI Flags & Output
- **Required flags:** `--claude` (platform selector)
- **Optional flags:**
  - `--global` — Install to `~/.claude/`
  - `--local` — Install to `.claude/` (default)
  - `--verbose` — Show detailed file-by-file progress
  - `--help` — Show help information
  - `--version` — Show version (2.0.0)
- **Output format:** Progress bars for moderate, line-by-line for verbose
- **Exit codes:**
  - 0 — Success
  - 1 — General error
  - 2 — Invalid arguments
  - 3 — Missing templates
  - 4 — Permission denied
  - 5 — Insufficient disk space

### Claude's Discretion
- Exact progress bar implementation library choice
- Error message wording refinements
- Log file location and format
- Temporary file handling during copy operations
- Directory creation order
- Manifest file format details

</decisions>

<specifics>
## Specific Ideas

- Installation should complete in <30 seconds for typical setup
- Templates directory is `/templates/` — never read from `.github/`
- Skills structure: `.claude/skills/gsd-<name>/SKILL.md` (directory-based)
- Agents structure: `.claude/agents/gsd-<name>.md` (flat files)
- Shared directory copies to: `.claude/get-shit-done/`
- Manifest file: `.claude/.gsd-install-manifest.json`

</specifics>

<deferred>
## Deferred Ideas

- Rollback on failure — Phase 5 (Atomic Transactions)
- Interactive prompts for scope selection — Phase 4 (Interactive UX)
- Platform adapter abstraction — Phase 3 (Multi-Platform Support)
- Backup of existing installation before overwrite — Phase 5
- Update detection and version comparison — Phase 6

</deferred>

---

*Phase: 02-core-installer-foundation*
*Context gathered: 2026-01-26*
