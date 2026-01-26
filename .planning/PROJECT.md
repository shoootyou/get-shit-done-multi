# Project Definition

## Core Value

**Template-based installer for Skills & Agents** that deploys AI CLI skills and agents to multiple platforms (Claude Code, GitHub Copilot CLI, Codex CLI, and future platforms).

Similar to tools like `create-react-app` or `create-vite`, this uses the **npx pattern** for convenience while installing **persistent skills** that remain after the installer exits.

## Problem Statement

Current state: The get-shit-done workflow exists but requires manual installation with platform-specific differences (`.claude/` vs `.github/`, `.md` vs `.agent.md`, different tool names, different frontmatter formats).

Users face:
- Manual file copying and configuration
- Platform-specific setup complexity
- No update mechanism
- Risk of misconfiguration breaking skills
- Difficult onboarding for new platforms

## Solution

A **single npx command** (`npx get-shit-done-multi`) that:
1. Auto-detects installed AI platforms
2. Prompts user interactively (or accepts CLI flags)
3. Transforms universal templates to platform-specific formats
4. Installs skills/agents atomically with rollback on failure
5. Tracks versions for update detection

**Architecture:** Three-stage approach with manual validation gate
- **Phase 1 (Migration):** ONE-TIME conversion from `.github/` → `/templates/` with frontmatter corrections
  - Generates corrected templates
  - **PAUSES for mandatory manual validation**
  - Waits for explicit approval before continuing
- **Approval Gate:** Manual review of generated templates against official specs
  - User validates frontmatter corrections
  - User approves template quality
  - Only after approval: commit migration code to git, then DELETE completely
- **Phase 2+ (Steady State):** `/templates/` is permanent source, installation code written fresh
  - No migration dependencies (fresh code, may duplicate some logic)
  - install.js uses `/templates/` as source (never `.github/`)
  - Migration code exists ONLY in git history (never executed again)

## Core Constraints

### Technical
- **Node.js ≥16.7.0** (minimum for native ESM support)
- **Cross-platform** (macOS, Linux, Windows)
- **Zero runtime dependencies** for installed skills (installer can have deps)
- **Atomic operations** (no partial installations)

### Safety
- **Path validation** (prevent traversal attacks)
- **Rollback on failure** (transaction pattern)
- **Pre-install checks** (disk space, permissions, conflicts)
- **Testing isolation** (ALL tests run in `/tmp`, never in source directory)
- **Source file protection** (NEVER modify original files in `.github/`, `.claude/`, `.codex/`)

### Testing Constraints (CRITICAL)
- **Test directory:** ALL tests MUST execute under `/tmp` directory
- **Isolation:** Each test MUST have its own folder under `/tmp`
- **Source protection:** CANNOT execute installation in current source directory
- **No source modification:** CANNOT modify source files (.github/, .claude/, .codex/, get-shit-done/)
- **Applies to:** ALL phases, ALL testing activities throughout the project

### Template Conversion Constraints (CRITICAL)
- **Phase 1 is ONE-TIME MIGRATION:** Convert `.github/` → `/templates/` once with frontmatter corrections
- **MANDATORY MANUAL VALIDATION:** Phase 1 MUST pause after generating templates for manual review
- **Approval gate:** Phase 2+ can ONLY begin after explicit manual approval of Phase 1 results
- **Source files are READ-ONLY:** Never modify `.github/`, `.claude/`, or `.codex/` directories
- **Work in templates/:** All conversions and corrections happen in `/templates/` directory
- **Frontmatter corrections:** Applied during Phase 1 migration, NOT on source files
- **After approval:** `/templates/` becomes permanent source of truth
- **install.js always uses templates/:** Installation reads from `/templates/`, not `.github/`
- **Migration code lifecycle:**
  1. Write migration scripts in Phase 1
  2. Execute migration → generate /templates/
  3. PAUSE for manual validation
  4. After approval: Commit migration code once to git
  5. DELETE migration code completely from working tree
  6. Migration code preserved ONLY in git history (never executed again)
- **NO code preservation:** NO stages, NO shared utilities, NO .archive/ directory
- **Phase 2+ independence:** Installation code written from scratch (no migration dependencies)
- **Preserve originals:** Keep `.github/` as historical reference only
- **Applies to:** Phase 1 migration strategy, affects all subsequent phases

### Extensibility
- **Adapter pattern** for platform differences
- **Versioned adapters** to handle spec changes
- Adding new platforms requires only new adapter (no core changes)

### User Experience
- **Interactive by default** (no flags = beautiful prompts)
- **Non-interactive mode** for automation (CI/CD)
- **Clear progress** (spinners, confirmations, error messages)

## Success Criteria

Project succeeds when:
1. User runs `npx get-shit-done-multi`, answers prompts, gets working skills
2. Installation takes <30 seconds for typical setup
3. Failures rollback cleanly (no broken state)
4. Adding a new platform requires only a new adapter (no core changes)
5. Works identically on macOS, Linux, and Windows

## Out of Scope (v2.0)

- Custom template repositories (only bundled templates from `/templates/`)
- Generating new skills/agents (Phase 1 migrates existing, then `/templates/` is source)
- **Modifying source files** (`.github/`, `.claude/`, `.codex/` are READ-ONLY historical reference)
- **Ongoing conversion logic** (Phase 1 migration is ONE-TIME, then deleted)
- **Maintaining .github/ as source** (Phase 1 migrates to `/templates/`, which becomes truth)
- Plugin system for external adapters (future work)
- Web-based configuration UI
- Telemetry or usage analytics
- Automated testing of installed skills (verification is manual)
- Uninstall command (can be added in v2.x)

## Target Users

- Developers using Claude Code, GitHub Copilot CLI, or Codex CLI
- Solo developers (not enterprise teams)
- Users familiar with npx pattern (`npx create-react-app`, etc.)
- Technical users comfortable with CLI tools

## Platform Priorities

1. **Claude Code** (v2.0 priority - original platform, cleaner frontmatter)
2. **GitHub Copilot CLI** (v2.0 priority - large user base, well-documented)
3. **Codex CLI** (v2.0 priority - similar patterns to Copilot)
4. **Future platforms** (Cursor, Windsurf, Cline - future work)

## Milestone Definition

**This milestone (v2.0):** Complete template-based installer with Claude + Copilot + Codex support, interactive UX, atomic transactions, version tracking, security, and cross-platform support.

**v2.0:** Initial complete product release
- Foundation + Multi-Platform (Claude, Copilot, Codex)
- Frontmatter corrections for skills and agents (see FRONTMATTER-CORRECTIONS.md and AGENT-CORRECTIONS.md)
- Interactive UX with beautiful prompts
- Atomic transactions with rollback
- Version tracking and update detection
- Path security
- Cross-platform support (macOS, Linux, Windows)
- Complete documentation

**Key Documentation:**
- `.planning/FRONTMATTER-CORRECTIONS.md` — Skills frontmatter specifications
- `.planning/AGENT-CORRECTIONS.md` — Agents frontmatter specifications  
- `.planning/REQUIREMENTS.md` — 37 v2.0 requirements
- `.planning/ROADMAP.md` — 7-phase execution plan

**v2.x:** Future enhancements (new commands = MINOR, breaking changes = MAJOR)

---

**Project Type:** Greenfield (new installer for existing skills)
**Started:** 2025-01-25
**Maintained By:** shoootyou
