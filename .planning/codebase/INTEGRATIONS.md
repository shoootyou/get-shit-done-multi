# External Integrations

**Analysis Date:** 2026-01-19

## APIs & External Services

**npm Registry:**
- npm view command - Fetches latest package version
  - Used in: `hooks/gsd-check-update.js`
  - Purpose: Background update checking
  - Auth: None (public registry)

**Context7 (Optional):**
- Context7 MCP server - Documentation query service
  - Tools: `mcp__context7__resolve-library-id`, `mcp__context7__query-docs`
  - Used in: `agents/gsd-phase-researcher.md`, `agents/gsd-project-researcher.md`, `agents/gsd-planner.md`
  - Purpose: Fetch library documentation during research/planning phases
  - Auth: Not specified

## Data Storage

**Databases:**
- None

**File Storage:**
- Local filesystem only
  - User config: `~/.claude/get-shit-done/`
  - Project state: `.planning/` (project directory)
  - Cache: `~/.claude/cache/gsd-update-check.json`
  - Version tracking: `~/.claude/get-shit-done/VERSION`

**Caching:**
- Local file-based cache for npm update checks
  - Location: `~/.claude/cache/gsd-update-check.json`
  - Data: `{ update_available, installed, latest, checked }`
  - TTL: Not specified

## Authentication & Identity

**Auth Provider:**
- None (no user authentication system)

## Monitoring & Observability

**Error Tracking:**
- None

**Logs:**
- Console output only (no structured logging)
- Update checks cached to: `~/.claude/cache/gsd-update-check.json`

## CI/CD & Deployment

**Hosting:**
- npm Registry (`get-shit-done-cc` package)

**CI Pipeline:**
- GitHub repository: `https://github.com/glittercowboy/get-shit-done`
- GitHub Copilot CLI assets: `.github/skills/`, `.github/agents/`
- Issue templates: `.github/ISSUE_TEMPLATE/gsd-new-project.yml`

## Environment Configuration

**Required env vars:**
- None

**Secrets location:**
- Not applicable (no secrets/credentials required)

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

---

*Integration audit: 2026-01-19*
