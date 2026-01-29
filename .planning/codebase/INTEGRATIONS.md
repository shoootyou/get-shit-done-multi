# External Integrations

**Analysis Date:** 2026-01-29

## APIs & External Services

**Package Registry:**
- npmjs.com - Package distribution and installation
  - Package: `get-shit-done-multi`
  - Installation method: `npx get-shit-done-multi`
  - Update mechanism: Built-in version checker
  - No authentication required (public package)

**GitHub:**
- Repository hosting: `github.com/shoootyou/get-shit-done-multi`
  - Issue tracking via GitHub Issues
  - Release management via GitHub Releases
  - Version links in `CHANGELOG.md`

**No Third-Party APIs:**
- No external API calls detected
- No HTTP/HTTPS requests to external services
- No axios, fetch, or request libraries in dependencies
- Fully offline operation after installation

## Data Storage

**Databases:**
- None

**File Storage:**
- Local filesystem only
  - Templates: `templates/` directory
  - User installations: `.claude/`, `.github/`, `.codex/` directories
  - Project planning: `.planning/` directory
  - Version tracking: JSON files (`version.json`, `versions.json`)
  - Installation manifest: `.gsd-install-manifest.json`

**Caching:**
- None (no caching layer)
- Note: Docker sandbox volumes removed in Phase 7.2

## Authentication & Identity

**Auth Provider:**
- None (local-only tool)
- No user authentication required
- No API keys or tokens needed

**AI Platform Authentication:**
- Claude Code CLI - Managed by Claude (external to this project)
- GitHub Copilot CLI - Managed by GitHub (external to this project)
- OpenAI Codex CLI - Managed by OpenAI (external to this project)
- Installer does not handle AI platform authentication

## Monitoring & Observability

**Error Tracking:**
- None
- Errors logged to console only
- `.github/.gsd-error.log` - Local error log for GSD operations

**Logs:**
- Console output via custom logger: `bin/lib/cli/logger.js`
- Chalk-based colored output
- No centralized logging service
- No log aggregation

**Metrics:**
- None
- No telemetry or usage tracking
- No analytics integration

## CI/CD & Deployment

**Hosting:**
- npmjs.com (package registry)
- Distributed as npm package
- No hosted application or web service

**CI Pipeline:**
- GitHub Actions (inferred from `dependabot.yml`)
  - Dependabot: Daily updates for GitHub Actions and npm packages
  - No CI workflow files detected in `.github/workflows/`

**Deployment:**
- Manual publish to npm via `npm publish`
- No prepublishOnly script (Phase 7.2 cleanup)
- No automated deployment pipeline detected

## Environment Configuration

**Required env vars:**
- None required for installation or operation

**Optional env vars:**
- None (CONTAINER_RUNTIME removed with Docker files in Phase 7.2)

**Secrets location:**
- No secrets required
- No API keys or tokens

**Configuration files:**
- `.planning/config.json` - GSD project configuration
- `.claude/settings.json` - Claude hooks and status line config
- `.github/get-shit-done/.gsd-install-manifest.json` - Installation manifest

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## AI Platform Integrations

**Claude Code CLI:**
- Platform: Anthropic Claude
- Installation target: `.claude/` directory (local) or `~/.claude/` (global)
- File format: Markdown (`.md`)
- Command prefix: `/gsd-`
- Tools: Capitalized comma-separated (Read, Write, Bash, Grep, Glob, Task)
- Adapter: `bin/lib/platforms/claude-adapter.js`
- Detection: Checks for `.claude/get-shit-done/` path
- Note: SessionStart hooks removed in Phase 7.2 cleanup

**GitHub Copilot CLI:**
- Platform: GitHub Copilot (OpenAI-powered)
- Installation target: `.github/` directory (local) or `~/.github/` (global)
- File format: Agent markdown (`.agent.md`)
- Command prefix: `/gsd-`
- Tools: Lowercase array (read, edit, execute, search, agent)
- Tool mappings: Claude names → Copilot aliases
  - Read → read
  - Write/Edit → edit
  - Bash → execute
  - Grep/Glob → search
  - Task → agent
- Adapter: `bin/lib/platforms/copilot-adapter.js`
- Detection: Checks for `copilot` binary and `.github/get-shit-done/` path
- Binary detector: `bin/lib/platforms/binary-detector.js`
- Copilot instructions: `.github/copilot-instructions.md`

**OpenAI Codex CLI:**
- Platform: OpenAI Codex
- Installation target: `.codex/` directory (local) or `~/.codex/` (global)
- File format: Agent markdown (`.agent.md`)
- Command prefix: `$gsd-` (differs from others)
- Tools: Lowercase array (identical to Copilot)
- Tool mappings: Same as Copilot (read, edit, execute, search, agent)
- Adapter: `bin/lib/platforms/codex-adapter.js`
- Detection: Checks for `codex` binary and `.codex/get-shit-done/` path
- Binary detector: `bin/lib/platforms/binary-detector.js`
- Note: 95% identical to Copilot adapter, duplicated intentionally per ARCHITECTURE-DECISION.md

**Platform Registry:**
- Central registry: `bin/lib/platforms/registry.js`
- Singleton pattern: `adapterRegistry`
- Supported platforms: claude, copilot, codex
- Extensible for future platforms

**Platform Detection:**
- Auto-detection: `bin/lib/platforms/detector.js`
- Checks for platform directories and binaries
- Binary detection: `bin/lib/platforms/binary-detector.js`
- Path resolution: `bin/lib/platforms/platform-paths.js`

## Template System

**Template Engine:**
- gray-matter 4.0.3 - Frontmatter parsing
- Custom rendering: `bin/lib/rendering/frontmatter-serializer.js`
- Variable injection: `{{PLATFORM_ROOT}}`, `{{COMMAND_PREFIX}}`, `{{VERSION}}`, `{{PLATFORM_NAME}}`

**Template Sources:**
- Master templates: `templates/` directory
  - Skills: `templates/skills/` (29 skills)
  - Agents: `templates/agents/` (13 agents)
  - Shared resources: `templates/get-shit-done/`
- Platform-specific: Generated during installation
- Version tracking: `version.json` per skill, `versions.json` for agents

**Template Structure:**
- Skills: Frontmatter + Markdown content
  - Frontmatter fields: `allowed-tools`, `argument-hint`, `description`
  - Platform transformation applied during installation
- Agents: Frontmatter + Markdown content
  - Frontmatter fields: `tools`, `skills` (Claude only), `description`
  - Metadata block for Copilot/Codex only

## Docker Integration

**Development Environment:**
- Note: Docker files removed in Phase 7.2 cleanup
- `Dockerfile` - Removed (was: Ubuntu 24.04 base with AI CLIs)
- `docker-compose.yml` - Removed (was: orchestration for development)
- `Makefile` - Still present (Docker commands commented, but file retained for future use)

**Historical Context:**
- Previously: Full Docker development environment with all 3 AI platforms
- Removed: 5MB+ Docker-related files (Dockerfile, docker-compose.yml)
- Reason: Simplification, reduced maintenance burden

## Migration & Updates

**Version Detection:**
- Old version detector: `bin/lib/version/old-version-detector.js`
- Version comparison: `semver` package
- Update checker: `bin/lib/updater/check-update.js`

**Migration Support:**
- Migration orchestrator: `bin/lib/migration/migration-orchestrator.js`
- Backup creation: `.gsd-backup/YYYY-MM-DD-HHMM/`
- Manifest repair: `bin/lib/manifests/repair.js`
- Schema validation: `bin/lib/manifests/schema.js`

**Update Scopes:**
- Global installations: `~/.claude/`, `~/.github/`, `~/.codex/`
- Local installations: `./.claude/`, `./.github/`, `./.codex/`
- Custom paths: User-specified installation directories

**Update Detection:**
- Check global: `bin/lib/updater/check-global.js`
- Check local: `bin/lib/updater/check-local.js`
- Check custom: `bin/lib/updater/check-custom-path.js`
- Format status: `bin/lib/updater/format-status.js`
- Validator: `bin/lib/updater/validator.js`

## Git Integration

**Repository:**
- Hosted on: GitHub
- URL: `git+https://github.com/shoootyou/get-shit-done-multi.git`
- License: MIT

**Git Operations:**
- Workflow helper: `get-shit-done/workflows/git-identity-helpers.sh`
- Used by GSD workflows for atomic commits
- No direct git library dependencies (uses CLI via Bash)
- Note: Scripts directory removed in Phase 7.2 cleanup

**Version Control:**
- `.gitignore` - Excludes node_modules, coverage, sandbox dirs, .planning/config.json
- Note: Hooks directory removed in Phase 7.2 cleanup
- No git hosting API integration (no Octokit or similar)

---

*Integration audit: 2026-01-29*
