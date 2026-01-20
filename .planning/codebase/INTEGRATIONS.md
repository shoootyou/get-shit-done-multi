# External Integrations

**Analysis Date:** 2026-01-20

## APIs & External Services

**NPM Registry:**
- Package publication and distribution
  - Package: `get-shit-done-cc`
  - Version: 1.6.4
  - Registry: https://registry.npmjs.org
  - Auth: Not required for installation (public package)

**GitHub:**
- Repository hosting
  - Repo: git+https://github.com/glittercowboy/get-shit-done.git
  - Used for: Issue templates, version control, source distribution
  - SDK/Client: `simple-git` npm package for local git operations
  - Integration points:
    - `github/ISSUE_TEMPLATE/` - GitHub issue templates for project initialization
    - Git operations via `simple-git` for state management

**No External APIs:**
- No REST API calls
- No GraphQL endpoints
- No webhook integrations
- No third-party API SDKs (Stripe, Supabase, AWS, etc.)

## Data Storage

**Databases:**
- None - No database connections

**File Storage:**
- Local filesystem only
  - State directory: `.planning/`
  - Configuration: `.planning/config.json`
  - Usage tracking: `.planning/usage.json`
  - Session management: `.planning/.session.json`
  - State metadata: `.planning/.meta.json`
  - Atomic writes via temp files for concurrent safety
  - Implementation: `lib-ghcc/state-io.js`, `lib-ghcc/state-manager.js`

**Caching:**
- None - No Redis, Memcached, or distributed cache
- In-memory session state only (per process)

## Authentication & Identity

**Auth Provider:**
- None - No authentication system
- CLI detection based on environment variables and filesystem paths
- No user accounts, tokens, or credentials managed by GSD
- Relies on host CLI (Claude Code, GitHub Copilot CLI, Codex CLI) for identity

## Monitoring & Observability

**Error Tracking:**
- None - No Sentry, Rollbar, or external error tracking

**Logs:**
- Local logging only
  - Console output for user-facing messages
  - Debug logging controlled by `DEBUG` environment variable
  - Usage tracking stored in `.planning/usage.json`
  - Cost and token tracking for multi-CLI operations
  - Implementation: `lib-ghcc/usage-tracker.js`

## CI/CD & Deployment

**Hosting:**
- NPM registry (package distribution)
- No server-side hosting (CLI tool only)

**CI Pipeline:**
- Git hooks for documentation validation
  - Pre-commit hook: `hooks/pre-commit-docs`
  - Validates documentation consistency before commits
  - Installed via: `npm run install-hooks`

**Deployment Process:**
- Manual NPM publish (no automated CD)
- Version management via `package.json`
- Installation via `npx get-shit-done-cc`

## Environment Configuration

**Required env vars:**
- None strictly required
- Optional detection vars (set by host CLIs):
  - `CLAUDE_CODE` or `CLAUDE_CLI`
  - `GITHUB_COPILOT_CLI` or `COPILOT_CLI`
  - `CODEX_CLI`

**Secrets location:**
- No secrets required or managed
- No API keys, tokens, or credentials
- No .env file usage

## Webhooks & Callbacks

**Incoming:**
- None - No webhook endpoints
- No server listening for external events

**Outgoing:**
- None - No webhook calls to external services
- No callback URLs registered

## CLI Interoperability

**Multi-CLI Support:**
- Detects and adapts to three CLI environments:
  - Claude Code (`claude`)
  - GitHub Copilot CLI (`gh copilot`)
  - Codex CLI (`codex`)
- Detection logic: `bin/lib/detect.js`, `lib-ghcc/verification/cli-detector.js`
- Adaptive installation based on detected CLI
- Cross-CLI state management for seamless switching

**CLI Commands:**
- Spawns subprocesses to test CLI availability
- Checks CLI version via `--version` flag
- Uses `child_process.spawn()` for CLI detection
- Implementation: `lib-ghcc/verification/cli-detector.js`

**Git Integration:**
- Uses `simple-git` library for local git operations
- No remote git API calls
- Git used for:
  - Version tracking
  - State history management
  - Installation verification

---

*Integration audit: 2026-01-20*
