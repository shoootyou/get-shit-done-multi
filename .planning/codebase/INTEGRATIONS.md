# External Integrations

**Analysis Date:** 2025-02-01

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
- Package name: `get-shit-done-multi`
- Version: 2.0.0 (current stable)
- Beta channel: Available via `@beta` tag
- No hosted application or web service

**CI Pipeline:**
- GitHub Actions workflows:
  - `.github/workflows/publish-main.yml` - Main release publishing
  - `.github/workflows/pr-validation.yml` - PR validation
- Dependabot: Daily updates for GitHub Actions and npm packages
  - Configuration inferred from `.github/dependabot.yml` (if present)

**Deployment:**
- Manual publish to npm via GitHub Actions workflow
- Workflow: `publish-main.yml`
  - Trigger: Manual workflow_dispatch
  - Node version: 20.x
  - Registry: https://registry.npmjs.org
  - Provenance: OIDC-based provenance enabled
  - Access: public
  - Steps:
    1. Version validation (semver format check)
    2. Tag existence check
    3. Version comparison with current
    4. Dependencies installation (`npm ci`)
    5. Test execution (`npm test`)
    6. Tarball creation and testing
    7. Dry-run publish
    8. Git tag creation (annotated)
    9. GitHub Release creation
    10. NPM publish with provenance

**Pre-release Publishing:**
- Script: `scripts/publish-pre.sh`
- Supports beta/rc versions
- Env var: `PUBLISH=true` to actually publish
- Default: Dry-run validation only

**PR Validation:**
- Workflow: `pr-validation.yml`
- Triggers: All pull requests
- Checks:
  - Dependencies installation
  - Test suite execution
  - Tarball creation and validation
  - Installation verification
- Comments: Bot posts validation results on PRs
- Concurrency: Per-PR concurrency group

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
- Installation target: `.claude/get-shit-done/` (local) or `~/.claude/get-shit-done/` (global)
- Directory structure:
  - `agents/` - Agent definitions (13 agents)
  - `skills/` - Skill definitions (29 skills)
  - `get-shit-done/` - Shared resources (workflows, templates, references)
- File format: Markdown (`.md`)
- Command prefix: `/gsd-`
- Tools: Capitalized comma-separated (Read, Write, Bash, Grep, Glob, Task)
- Frontmatter: YAML with `allowed-tools`, `argument-hint`, `description`
- Adapter: `bin/lib/platforms/claude/adapter.js`
- Validator: `bin/lib/platforms/claude/validator.js`
- Serializer: `bin/lib/platforms/claude/serializer.js`
- Cleaner: `bin/lib/platforms/claude/cleaner.js`
- Detection: Checks for `.claude/get-shit-done/` path and `claude` binary
- Binary detector: `bin/lib/platforms/binary-detector.js`

**GitHub Copilot CLI:**
- Platform: GitHub Copilot (OpenAI-powered)
- Installation target: `.github/get-shit-done/` (local) or `~/.github/get-shit-done/` (global)
- Directory structure:
  - `agents/` - Agent definitions (13 agents)
  - `skills/` - Skill definitions (29 skills)
  - `get-shit-done/` - Shared resources (workflows, templates, references)
- File format: Agent markdown (`.agent.md`)
- Command prefix: `/gsd-`
- Tools: Lowercase array (read, edit, execute, search, agent)
- Tool mappings: Claude names → Copilot aliases
  - Read → read
  - Write/Edit → edit
  - Bash → execute
  - Grep/Glob → search
  - Task → agent
- Frontmatter: JavaScript-like syntax
- Adapter: `bin/lib/platforms/copilot/adapter.js`
- Validator: `bin/lib/platforms/copilot/validator.js`
- Serializer: `bin/lib/platforms/copilot/serializer.js`
- Cleaner: `bin/lib/platforms/copilot/cleaner.js`
- Detection: Checks for `copilot` binary and `.github/get-shit-done/` path
- Binary detector: `bin/lib/platforms/binary-detector.js`
- Copilot instructions: `.github/copilot-instructions.md` (401 bytes)

**OpenAI Codex CLI:**
- Platform: OpenAI Codex
- Installation target: `.codex/get-shit-done/` (local) or `~/.codex/get-shit-done/` (global)
- Directory structure:
  - `agents/` - Agent definitions (13 agents)
  - `skills/` - Skill definitions (29 skills)
  - `get-shit-done/` - Shared resources (workflows, templates, references)
- File format: Agent markdown (`.agent.md`)
- Command prefix: `$gsd-` (differs from Claude/Copilot)
- Tools: Lowercase array (identical to Copilot)
- Tool mappings: Same as Copilot (read, edit, execute, search, agent)
- Frontmatter: JavaScript-like syntax
- Adapter: `bin/lib/platforms/codex/adapter.js`
- Validator: `bin/lib/platforms/codex/validator.js`
- Serializer: `bin/lib/platforms/codex/serializer.js`
- Cleaner: `bin/lib/platforms/codex/cleaner.js`
- Detection: Checks for `codex` binary and `.codex/get-shit-done/` path
- Binary detector: `bin/lib/platforms/binary-detector.js`
- Note: 95% identical to Copilot adapter, duplicated intentionally per architecture decisions

**Platform Registry:**
- Central registry: `bin/lib/platforms/registry.js`
- Singleton pattern: `adapterRegistry`
- Supported platforms: claude, copilot, codex
- Platform names: `bin/lib/platforms/platform-names.js`
  - claude → "Claude Code"
  - copilot → "GitHub Copilot CLI"
  - codex → "Codex CLI"
- Extensible for future platforms

**Platform Detection:**
- Auto-detection: `bin/lib/platforms/detector.js`
- Checks for platform directories and installation manifests
- Binary detection: `bin/lib/platforms/binary-detector.js`
  - Uses `which` (Unix) or `where` (Windows) commands
  - 2-second timeout per binary
  - Commands: `claude`, `copilot`, `codex`
- Path resolution: `bin/lib/platforms/platform-paths.js`
- Instruction paths: `bin/lib/platforms/instruction-paths.js`
- Base adapter: `bin/lib/platforms/_shared/base-adapter.js`
- Base validator: `bin/lib/platforms/_shared/base-validator.js`
- Field validators: `bin/lib/platforms/_shared/field-validators.js` (Joi schemas)
- Validation errors: `bin/lib/platforms/_shared/validation-error.js`

## Template System

**Template Engine:**
- gray-matter 4.0.3 - YAML frontmatter parsing
- Custom rendering: `bin/lib/templates/template-renderer.js`
- Variable injection: `{{PLATFORM_ROOT}}`, `{{COMMAND_PREFIX}}`, `{{VERSION}}`, `{{PLATFORM_NAME}}`
- Replacement pattern: `\{\{VARIABLE\}\}`

**Template Sources:**
- Master templates: `templates/` directory
  - Skills: `templates/skills/` (29 skills)
  - Agents: `templates/agents/` (13 agents)
  - Shared resources: `templates/get-shit-done/`
- Platform-specific: Generated during installation
- Version tracking: Per-skill `version.json`, agent `versions.json`

**Template Structure:**
- Skills: Frontmatter + Markdown content
  - Frontmatter fields: `allowed-tools`, `argument-hint`, `description`
  - Platform transformation applied during installation
  - Tools transformed from Claude format to platform-specific format
- Agents: Frontmatter + Markdown content
  - Frontmatter fields: `tools`, `skills` (Claude only), `description`
  - Metadata block for Copilot/Codex only
  - Tool list transformed to platform-specific format

**Installation Modules:**
- Orchestrator: `bin/lib/installer/orchestrator.js`
- Install agents: `bin/lib/installer/install-agents.js`
- Install skills: `bin/lib/installer/install-skills.js`
- Install shared: `bin/lib/installer/install-shared.js`
- Install platform instructions: `bin/lib/installer/install-platform-instructions.js`

## Docker Integration

**Development Environment:**
- Note: Docker support not currently implemented
- No Dockerfile or docker-compose.yml found in repository
- Local development uses native Node.js installation

## Migration & Updates

**Version Detection:**
- Installation finder: `bin/lib/version/installation-finder.js`
- Version checker: `bin/lib/version/version-checker.js`
- Version comparison: `semver` package
- Update checker: `bin/lib/updater/check-update.js`

**Migration Support:**
- Migration orchestrator: `bin/lib/migration/migration-orchestrator.js`
- Migration manager: Implementation in orchestrator
- Backup creation: `.gsd-backup/YYYY-MM-DD-HHMM/` directories
- Manifest repair: `bin/lib/manifests/repair.js`
- Schema validation: `bin/lib/manifests/schema.js`
- Manifest reader: `bin/lib/manifests/reader.js`
- Manifest writer: `bin/lib/manifests/writer.js`

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
- Workflow helper: `templates/get-shit-done/workflows/git-identity-helpers.sh`
- Used by GSD workflows for atomic commits
- No direct git library dependencies (uses CLI via Bash)
- GSD generates git commands for AI to execute

**Version Control:**
- `.gitignore` - Excludes node_modules, coverage, .planning/config.json
- No git hosting API integration (no Octokit or similar)
- Git operations delegated to AI assistant Bash tool

## CLI Components

**Interactive Mode:**
- Interactive installer: `bin/lib/cli/interactive.js`
- Uses @clack/prompts for beautiful terminal UI
- Platform selection with multi-select
- Scope selection (global/local/custom)
- Installation loop: `bin/lib/cli/install-loop.js`

**CLI Utilities:**
- Logger: `bin/lib/cli/logger.js` (chalk-based colored output)
- Banner manager: `bin/lib/cli/banner-manager.js`
- Next steps: `bin/lib/cli/next-steps.js`
- Mode detector: `bin/lib/cli/mode-detector.js`
- Flag parser: `bin/lib/cli/flag-parser.js`
- Usage display: `bin/lib/cli/usage.js`

**Error Handling:**
- Install errors: `bin/lib/errors/install-error.js`
- Directory errors: `bin/lib/errors/directory-error.js`
- Validation errors: `bin/lib/platforms/_shared/validation-error.js`
- Error logger: `bin/lib/validation/error-logger.js`

**File Operations:**
- File operations: `bin/lib/io/file-operations.js` (fs-extra based)
- File scanner: `bin/lib/utils/file-scanner.js`
- Path resolver: `bin/lib/paths/path-resolver.js`
- Symlink resolver: `bin/lib/paths/symlink-resolver.js`
- Path validator: `bin/lib/validation/path-validator.js`
- CLI validator: `bin/lib/validation/cli-validator.js`

**Configuration:**
- Paths config: `bin/lib/config/paths.js`

**Preflight Checks:**
- Preflight modules in `bin/lib/preflight/` (structure inferred from tests)

---

*Integration audit: 2025-02-01*
