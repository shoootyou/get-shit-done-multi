# Milestone v1.9.2: Installation CLI Optimization

## Objective

Redesign the installation command-line interface to support multi-platform selection with intuitive flags and interactive menus.

## User Requirements

1. **Platform-specific flags**: Replace `--local`/`--global` with platform flags:
   - `--claude` for Claude Code
   - `--copilot` for GitHub Copilot CLI
   - `--codex` for Codex CLI

2. **Flexible installation modes**:
   - Each platform supports `--global` or `--local` (default: local)
   - Codex: local only now, but architecture should support global in future
   - Examples: `--claude --local`, `--copilot --global`

3. **Bulk installation**:
   - `--all`: Install all platforms locally
   - `--all --global`: Install all platforms globally

4. **Multi-platform installation**:
   - Support multiple flags: `--copilot --claude` installs both

5. **Interactive menu** (no parameters):
   - Checkbox multi-selection for platforms
   - Then ask global/local preference (default: local)

6. **Deprecation of old flags**:
   - Show warning message for `--local`/`--global` without platform
   - Guide users to new syntax (e.g., `--claude --local`)

7. **Clean output**:
   - Only show messages that are necessary/relevant
   - Remove noise like "Note: Linux: XDG Base Directory support..."
   - Optimize message display based on context

8. **Consistency**:
   - Apply changes to both install.js and uninstall.js
   - Update README and installation docs

## Clarifications

- **Codex global support**: Prepare architecture to support global in future (not implemented yet)
- **Backward compatibility**: Show deprecation warning, guide to new syntax
- **Interactive menu**: Checkbox multi-selection for platforms (recommended)
- **Message optimization**: Only show when necessary, context-aware
- **Documentation scope**: README + installation docs (recommended)
- **Uninstall consistency**: Yes, apply same flag system

## Current State

- Installation system in `bin/install.js` and `bin/uninstall.js`
- Platform adapters: claude, copilot, codex
- Current flags: `--local`, `--global` (deprecated)
- Specs in `/specs/skills/` and `/specs/agents/`

## Success Criteria

- ✅ Platform-specific flags working for all 3 platforms
- ✅ `--all` flag installs all platforms (local by default)
- ✅ `--all --global` installs all platforms globally
- ✅ Multi-platform selection: `--copilot --claude` works
- ✅ Interactive menu with checkbox selection + global/local choice
- ✅ Deprecation warnings for old flags with migration guidance
- ✅ Clean output without unnecessary messages
- ✅ install.js and uninstall.js both updated
- ✅ Documentation updated (README + installation docs)

