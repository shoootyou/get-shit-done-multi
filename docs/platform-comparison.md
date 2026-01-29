# Platform Comparison

Quick reference guide for differences between Claude Code, GitHub Copilot CLI, and Codex CLI support in GSD Multi.

## Quick Decision Guide

**Choose Claude if:**
- You use VS Code with Claude Code extension
- You prefer YAML frontmatter
- You want official tool names (Read, Write, Bash)

**Choose Copilot if:**
- You use GitHub Copilot CLI
- You're already in GitHub ecosystem
- You need enterprise GitHub integration

**Choose Codex if:**
- You use Codex CLI
- You prefer `$` command prefix (not `/`)
- You want Codex-specific features

**All platforms provide the same GSD capabilities.** Platform choice affects only file format and location, not functionality.

## Installation Locations

| Aspect | Claude | Copilot | Codex |
|--------|--------|---------|-------|
| Local skills | `.claude/skills/` | `.github/skills/` | `.codex/skills/` |
| Local agents | `.claude/agents/` | `.github/agents/` | `.codex/agents/` |
| Shared directory | `.claude/get-shit-done/` | `.github/get-shit-done/` | `.codex/get-shit-done/` |
| Global skills | `~/.claude/skills/` | `~/.copilot/skills/` | `~/.codex/skills/` |
| Global agents | `~/.claude/agents/` | `~/.copilot/agents/` | `~/.codex/agents/` |

## File Formats

| Aspect | Claude | Copilot | Codex |
|--------|--------|---------|-------|
| Skill extension | `.md` | `.md` | `.md` |
| Agent extension | `.md` | `.agent.md` | `.agent.md` |
| Frontmatter format | YAML | YAML | YAML |
| Path references | `@.claude/` | `@.github/` | `@.codex/` |
| Command prefix | `/gsd-` | `/gsd-` | `$gsd-` |

## Tool Names

| Claude Official | Copilot Mapping | Codex Mapping |
|-----------------|-----------------|---------------|
| Read | read | read |
| Write | write | write |
| Edit | edit | edit |
| Bash | execute | execute |
| Grep | search | search |
| Glob | glob | glob |
| Task | agent | agent |

## Frontmatter Fields

| Field | Claude | Copilot | Codex |
|-------|--------|---------|-------|
| name | Optional | Optional | Optional |
| description | Recommended | Required | Required |
| allowed-tools (skills) | Optional | Optional | Optional |
| tools (agents) | Optional | Optional | Optional |
| skills (agents) | Optional | N/A | N/A |
| platform | N/A | Required | Required |
| metadata | N/A | Remove (use versions.json) | Remove (use versions.json) |

## Key Differences Summary

### 1. Command Prefix

- **Claude/Copilot:** Use `/gsd-plan-phase`
- **Codex:** Use `$gsd-plan-phase`

### 2. Tools Format

- **All platforms:** Comma-separated string in frontmatter
- **Example:** `allowed-tools: Read, Write, Edit, Bash`

### 3. Skills Field (Agents Only)

- **Claude:** `skills` field auto-generated from content scan
- **Copilot/Codex:** N/A (not supported)

### 4. Path References

- **Claude:** `@.claude/get-shit-done/references/...`
- **Copilot:** `@.github/get-shit-done/references/...`
- **Codex:** `@.codex/get-shit-done/references/...`

## Next Steps

- See [Platform Specifics](platform-specifics.md) for detailed examples
- See [Platform Migration](platform-migration.md) for switching guides
- See [How to Install](how-to-install.md) for installation commands
