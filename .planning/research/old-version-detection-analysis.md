# Old Version Detection Analysis

## Investigation Summary

Analyzed `/tmp/gsd-test-200/` which contains version 1.8.0 installations across all three platforms.

## Old Version Structure (v1.8.0)

### Platform-Specific Structures

#### CLAUDE (.claude/)
- **Commands:** `.claude/commands/gsd/*.md` (30+ command files)
- **Agents:** `.claude/agents/gsd-*.md` (11 agent files, NO .agent.md suffix)
- **Hooks:** `.claude/hooks/` (3 files: gsd-check-update.js, pre-commit-docs, statusline.js)
- **Settings:** `.claude/settings.json` (hooks configuration)
- **Shared:** `.claude/get-shit-done/` (VERSION, references/, templates/, workflows/)
- **Key marker:** `.claude/get-shit-done/VERSION` contains "1.8.0"

#### COPILOT (.github/)
- **Skills:** `.github/skills/get-shit-done/` (monolithic skill structure)
- **Agents:** `.github/agents/gsd-*.agent.md` (11 agent files, WITH .agent.md suffix)
- **Issue Templates:** `.github/ISSUE_TEMPLATE/gsd-new-project.yml`
- **Instructions:** `.github/copilot-instructions.md`
- **Commands:** `.github/skills/get-shit-done/commands/gsd/*.md`
- **Shared:** `.github/skills/get-shit-done/` (VERSION, references/, templates/, workflows/)
- **Key marker:** `.github/skills/get-shit-done/VERSION` contains "1.8.0"

#### CODEX (.codex/)
- **Skills:** `.codex/skills/get-shit-done/` (monolithic skill structure)
- **Commands:** `.codex/skills/get-shit-done/commands/gsd/*.md`
- **Shared:** `.codex/skills/get-shit-done/` (VERSION, references/, templates/, workflows/)
- **Key marker:** `.codex/skills/get-shit-done/VERSION` contains "1.8.0"

## New Version Structure (v2.0.0)

### Platform-Agnostic Templates
- **Skills:** `templates/skills/gsd-*/` (individual skill directories)
- **Agents:** `templates/agents/gsd-*.agent.md` (13 agent files)
- **Shared:** `templates/get-shit-done/` (references/, templates/)
- **Versioning:** Each skill has `version.json`, agents have `versions.json`

### Key Differences

| Aspect | Old (v1.x) | New (v2.x) |
|--------|-----------|------------|
| **Skill Structure** | Monolithic `get-shit-done/` with all commands | Individual `gsd-*` skill directories |
| **VERSION Location** | Single `VERSION` file in root | `version.json` per skill + `versions.json` for agents |
| **Agent Naming** | Claude: `gsd-*.md`, Others: `gsd-*.agent.md` | All: `gsd-*.agent.md` |
| **Claude Hooks** | 3 hooks in `.claude/hooks/` | No hooks (removed) |
| **Commands Location** | Inside monolithic skill | Each command is a separate skill |
| **Issue Templates** | `.github/ISSUE_TEMPLATE/gsd-*.yml` | None (removed?) |

## Detection Strategy for Old Versions

### Detection Points

1. **Monolithic Skill Check:**
   - Copilot: `.github/skills/get-shit-done/SKILL.md` exists
   - Codex: `.codex/skills/get-shit-done/SKILL.md` exists
   - Claude: `.claude/commands/gsd/` directory exists

2. **Single VERSION File:**
   - Copilot: `.github/skills/get-shit-done/VERSION` exists
   - Codex: `.codex/skills/get-shit-done/VERSION` exists
   - Claude: `.claude/get-shit-done/VERSION` exists

3. **Claude-Specific Hooks:**
   - `.claude/hooks/gsd-check-update.js` exists
   - `.claude/hooks/statusline.js` exists
   - `.claude/settings.json` references these hooks

4. **Old Agent Naming (Claude only):**
   - Files like `.claude/agents/gsd-planner.md` (without .agent.md suffix)

### Detection Logic

```javascript
// Pseudo-code for detection
async function isOldVersion(platform, targetDir) {
  const checks = {
    claude: [
      exists(`${targetDir}/.claude/get-shit-done/VERSION`),
      exists(`${targetDir}/.claude/commands/gsd/`),
      exists(`${targetDir}/.claude/hooks/gsd-check-update.js`)
    ],
    copilot: [
      exists(`${targetDir}/.github/skills/get-shit-done/SKILL.md`),
      exists(`${targetDir}/.github/skills/get-shit-done/VERSION`)
    ],
    codex: [
      exists(`${targetDir}/.codex/skills/get-shit-done/SKILL.md`),
      exists(`${targetDir}/.codex/skills/get-shit-done/VERSION`)
    ]
  };
  
  // If ANY check is true, it's an old version
  return checks[platform].some(check => check === true);
}
```

## Impact & Scope

### Why This Matters

1. **Breaking Changes:** Structure completely different, can't merge
2. **Update Flow:** Must detect and warn user before attempting update
3. **Migration Required:** Old installations need full reinstall or migration
4. **User Experience:** Silent failure or corruption if not detected

### Affected Components

- `bin/lib/version/installation-finder.js` - Must detect old structure
- `bin/lib/updater/check-update.js` - Must warn about incompatibility
- `bin/lib/updater/update-messages.js` - Need special message for old versions

## Recommendation

This is **TOO LARGE FOR A TODO** - should be a **PHASE** because:

1. **Complexity:** Multi-platform detection logic with different patterns
2. **Integration:** Touches multiple existing modules (finder, updater, messages)
3. **Testing:** Needs comprehensive testing across all 3 platforms
4. **Documentation:** Requires migration guide for users
5. **Error Handling:** Special error messages and recovery flows
6. **Scope:** 3-5 files to modify, new module to create, tests to write

### Suggested Phase Structure

**Phase X: Old Version Detection & Migration**
- Task 1: Create old version detector module
- Task 2: Integrate with installation finder
- Task 3: Add migration warnings to check-updates
- Task 4: Update error messages for incompatible versions
- Task 5: Add migration guide documentation
- Task 6: Add integration tests for detection
