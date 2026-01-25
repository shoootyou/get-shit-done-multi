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

### Testing Constraints (CRITICAL)
- **Test directory:** ALL tests MUST execute under `/tmp` directory
- **Isolation:** Each test MUST have its own folder under `/tmp`
- **Source protection:** CANNOT execute installation in current source directory
- **No source modification:** CANNOT modify source files (.github/, .claude/, .codex/, get-shit-done/)
- **Applies to:** ALL phases, ALL testing activities throughout the project

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

- Custom template repositories (only bundled templates from `.github/`)
- Generating new skills/agents (use existing `.github/skills/` and `.github/agents/` as source)
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
- Interactive UX with beautiful prompts
- Atomic transactions with rollback
- Version tracking and update detection
- Path security
- Cross-platform support (macOS, Linux, Windows)
- Complete documentation

**v2.x:** Future enhancements (new commands = MINOR, breaking changes = MAJOR)

---

**Project Type:** Greenfield (new installer for existing skills)
**Started:** 2025-01-25
**Maintained By:** shoootyou
