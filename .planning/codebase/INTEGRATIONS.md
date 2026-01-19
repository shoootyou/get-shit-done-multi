# External Integrations

**Analysis Date:** 2026-01-19

## APIs & External Services

**NPM Registry:**
- npm view command - Check for package updates
  - SDK/Client: npm CLI (via child_process.execSync)
  - Auth: None required (public package)
  - Used in: `hooks/gsd-check-update.js`

**GitHub:**
- Repository hosting - https://github.com/glittercowboy/get-shit-done
  - Used for: Source code, releases, issue tracking
  - Integration: URL references in package.json and documentation

## Data Storage

**Databases:**
- None

**File Storage:**
- Local filesystem only
  - Config: `~/.claude/` or `./.claude/` or `./.github/`
  - Cache: `~/.claude/cache/` for update check results
  - Todos: `~/.claude/todos/` for session state
  - State: `.planning/` directory for project state

**Caching:**
- Custom file-based cache
  - Location: `~/.claude/cache/gsd-update-check.json`
  - Purpose: Update availability check results
  - Implementation: JSON files written by hook scripts

## Authentication & Identity

**Auth Provider:**
- None - System operates as local scripts

**Implementation:**
- No authentication required
- Runs with user's filesystem permissions

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Console output only
  - Install script: Colored terminal output with status indicators
  - Hooks: Background execution, results cached to JSON

## CI/CD & Deployment

**Hosting:**
- npm registry (https://www.npmjs.com/package/get-shit-done-cc)

**CI Pipeline:**
- Not detected in repository

**Distribution:**
- npx execution: `npx get-shit-done-cc`
- Version tracking: VERSION file + package.json

## Environment Configuration

**Required env vars:**
- None required

**Optional env vars:**
- `CLAUDE_CONFIG_DIR` - Override default Claude config location

**Secrets location:**
- Not applicable - No secrets used

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## IDE/Tool Integration

**Claude Code:**
- Custom commands directory: `commands/gsd/*.md`
- Skill system: `get-shit-done/` directory structure
- Agents: `.claude/agents/gsd-*.md` (11 specialized agents)
- Hooks: Session lifecycle hooks (SessionStart, Stop)
- Statusline: Custom statusbar via `hooks/statusline.js`

**GitHub Copilot CLI:**
- Skills: `.github/skills/get-shit-done/`
- Agents: `.github/agents/gsd-*.agent.md` (converted with YAML frontmatter)
- Instructions: `.github/copilot-instructions.md`

## Session Lifecycle Hooks

**SessionStart:**
- `hooks/gsd-check-update.js` - Background update checker
  - Spawns detached process
  - Queries npm registry for latest version
  - Writes result to cache file
  - Timeout: 10 seconds

**Stop:**
- Not configured in default installation

**Statusline:**
- `hooks/statusline.js` - Real-time status display
  - Reads JSON from stdin (provided by IDE)
  - Shows: model, current task, directory, context usage
  - Color-coded progress bar for context window

---

*Integration audit: 2026-01-19*
