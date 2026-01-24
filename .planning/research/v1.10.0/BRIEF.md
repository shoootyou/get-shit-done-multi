# Milestone v1.10.0: Installation CLI Optimization

## Objective

Redesign the installation command-line interface to support multi-platform selection with intuitive flags and interactive menus. **BREAKING CHANGE:** Remove old `--local`/`--global` flags entirely (no backward compatibility).

## User Requirements

1. **Platform-specific flags**: Replace `--local`/`--global` with platform flags:
   - `--claude` for Claude Code
   - `--copilot` for GitHub Copilot CLI
   - `--codex` for Codex CLI

2. **Flexible installation modes**:
   - Claude and Copilot support `--global` or `--local` (default: local)
   - Codex: **local only** (no global support in this milestone)
   - `--codex --global` shows warning: "Global installation not supported for Codex. Installing locally in current folder."
   - Examples: `--claude --local`, `--copilot --global`

3. **Platform installation paths** (CLARIFIED):
   - **Claude local:** `[repo-root]/.claude/`
   - **Claude global:** `~/.claude/`
   - **Copilot local:** `[repo-root]/.github/`
   - **Copilot global:** `~/.copilot/`
   - **Codex local:** `[repo-root]/.codex/` (only mode supported)

4. **Bulk installation**:
   - `--all`: Install all platforms locally
   - `--all --global`: Install Claude and Copilot globally, Codex locally (with warning)

5. **Multi-platform installation**:
   - Support multiple flags: `--copilot --claude` installs both

6. **Interactive menu** (no parameters):
   - Checkbox multi-selection for platforms
   - Then ask global/local preference (default: local)

7. **HARD REMOVAL of old flags** (BREAKING):
   - `--local` and `--global` flags are **REMOVED** (not deprecated)
   - No backward compatibility warnings
   - Show clear error with migration instructions if used
   - Remove `--codex-global` flag and all references

8. **Clean output**:
   - Only show messages that are necessary/relevant
   - Remove noise like "Note: Linux: XDG Base Directory support..."
   - Optimize message display based on context

9. **Uninstall implementation** (ADDED):
   - Create uninstall.js with same flag system as install.js
   - Support `--claude`, `--copilot`, `--codex`, `--all` flags
   - Support `--global`/`--local` scope modifiers
   - Apply consistency requirements to both install and uninstall

## Clarifications (UPDATED 2026-01-24)

- **Codex global support**: NOT implemented in this milestone. Show warning and install locally.
- **Backward compatibility**: NONE. Hard removal of old flags, no deprecation period.
- **Interactive menu**: Checkbox multi-selection for platforms (confirmed)
- **Message optimization**: Only show when necessary, context-aware
- **Documentation scope**: README + installation docs + simple migration guide
- **Uninstall consistency**: MUST be implemented in this milestone (not deferred)
- **Version**: Keeping v1.10.0 despite breaking changes (user decision)
- **Migration guide**: Simple, focused only on `--local`/`--global` → `--claude` transition
- **CHANGELOG structure**: Two sections (End Users + Contributors)
- **--codex-global removal**: Delete command and all references completely

## Current State

- Installation system in `bin/install.js` and `bin/uninstall.js`
- Platform adapters: claude, copilot, codex
- Current flags: `--local`, `--global`, `--codex-global` (all will be removed)
- Specs in `/specs/skills/` and `/specs/agents/`

## Success Criteria (UPDATED)

- ✅ Platform-specific flags working for all 3 platforms
- ✅ `--all` flag installs all platforms (local by default)
- ✅ `--all --global` installs Claude and Copilot globally, Codex locally with warning
- ✅ Multi-platform selection: `--copilot --claude` works
- ✅ Interactive menu with checkbox selection + global/local choice
- ✅ **OLD FLAGS REMOVED**: `--local`, `--global`, `--codex-global` deleted entirely
- ✅ Clear error message if old flags used (with migration instructions)
- ✅ Codex global shows warning and installs locally
- ✅ Clean output without unnecessary messages
- ✅ **uninstall.js fully implemented** with same flag system
- ✅ Documentation updated (README + installation docs + simple migration guide)
- ✅ CHANGELOG.md with two sections (End Users + Contributors)
- ✅ Platform paths correctly implemented (Claude: ~/.claude/ + .claude/, Copilot: ~/.copilot/ + .github/)

