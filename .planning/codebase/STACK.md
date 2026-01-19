# Technology Stack

**Analysis Date:** 2026-01-19

## Languages

**Primary:**
- JavaScript (Node.js) - All executable scripts, hooks, and installation logic

**Secondary:**
- Markdown - Agent definitions, command specs, documentation, templates
- JSON - Configuration files, package manifests

## Runtime

**Environment:**
- Node.js 16.7.0+ (specified in `package.json` engines field)

**Package Manager:**
- npm
- Lockfile: Not committed (listed in `.gitignore`)

## Frameworks

**Core:**
- None - Pure Node.js implementation using standard library

**Testing:**
- Not detected

**Build/Dev:**
- None - Direct execution of JS files with shebang (`#!/usr/bin/env node`)

## Key Dependencies

**Critical:**
- None - Zero npm dependencies (pure Node.js standard library)

**Infrastructure:**
- Built-in Node.js modules only:
  - `fs` - File system operations (`bin/install.js`, `hooks/*.js`)
  - `path` - Path manipulation
  - `os` - OS utilities (homedir, platform detection)
  - `readline` - Interactive CLI prompts (`bin/install.js`)
  - `child_process` - Spawning processes (`hooks/gsd-check-update.js`)

## Configuration

**Environment:**
- No `.env` files detected
- Configuration via JSON files:
  - `get-shit-done/templates/config.json` - GSD system config (gates, parallelization)
  - `.github/skills/get-shit-done/templates/config.json` - Copilot CLI version

**Build:**
- No build system - interpreted JavaScript
- No TypeScript, no transpilation, no bundling

## Platform Requirements

**Development:**
- Node.js 16.7.0 or higher
- npm (bundled with Node.js)
- Compatible with Mac, Windows, Linux

**Production:**
- Runs as installed npm package (`get-shit-done-cc`)
- Installation targets:
  - Claude Code: `~/.claude/get-shit-done/`
  - GitHub Copilot CLI: `./.github/skills/get-shit-done/`
  - Global: `~/.claude/`

---

*Stack analysis: 2026-01-19*
