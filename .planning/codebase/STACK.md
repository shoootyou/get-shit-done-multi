# Technology Stack

**Analysis Date:** 2026-01-19

## Languages

**Primary:**
- JavaScript (Node.js) - Installation scripts, hooks, and utilities

**Secondary:**
- Markdown - Command definitions, agent prompts, templates, and documentation

## Runtime

**Environment:**
- Node.js >= 16.7.0

**Package Manager:**
- npm (npx distribution)
- Lockfile: Not present (distribution package)

## Frameworks

**Core:**
- No external frameworks - Pure Node.js standard library

**Testing:**
- Not detected in distribution

**Build/Dev:**
- No build tooling - Direct script execution

## Key Dependencies

**Critical:**
- None - Uses only Node.js built-in modules

**Infrastructure:**
- `fs` (built-in) - File system operations for installation and config
- `path` (built-in) - Path manipulation
- `os` (built-in) - System information and home directory detection
- `readline` (built-in) - Interactive CLI prompts
- `child_process` (built-in) - Spawning processes for hooks and updates

## Configuration

**Environment:**
- Installation location configured via CLI flags or environment variables
- `CLAUDE_CONFIG_DIR` - Custom config directory location
- Supports `~/.claude` (global), `./.claude` (local), or `./.github` (Copilot CLI)

**Build:**
- No build configuration - Scripts run directly

## Platform Requirements

**Development:**
- Node.js >= 16.7.0
- Works on Mac, Windows, and Linux

**Production:**
- Deployment target: Claude Code IDE or GitHub Copilot CLI
- Installed via npx as `get-shit-done-cc`
- Available on npm registry

---

*Stack analysis: 2026-01-19*
