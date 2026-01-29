# How to Uninstall GSD

Remove GSD by deleting the installation directories.

---

## Quick Removal

### Claude

**Local installation:**

```bash
rm -rf .claude/skills/gsd-* .claude/agents/gsd-* .claude/get-shit-done/
```

**Global installation:**

```bash
rm -rf ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/
```

### GitHub Copilot CLI

**Local installation:**

```bash
rm -rf .github/skills/gsd-* .github/agents/gsd-* .github/get-shit-done/
```

**Global installation:**

```bash
rm -rf ~/.copilot/skills/gsd-* ~/.copilot/agents/gsd-* ~/.copilot/get-shit-done/
```

### Codex CLI

**Local installation:**

```bash
rm -rf .codex/skills/gsd-* .codex/agents/gsd-* .codex/get-shit-done/
```

**Global installation:**

```bash
rm -rf ~/.codex/skills/gsd-* ~/.codex/agents/gsd-* ~/.codex/get-shit-done/
```

Done. GSD is completely removed.

---

## What Gets Removed

When you delete GSD directories, you remove:

### 1. Skills (29 files)

All GSD skill directories:

```plaintext
[platform]/skills/gsd-new-project/
[platform]/skills/gsd-plan-phase/
[platform]/skills/gsd-execute-phase/
... (26 more)
```

Each skill directory contains a `SKILL.md` file with the skill definition.

### 2. Agents (13 files)

All GSD agent files:

```plaintext
[platform]/agents/gsd-executor.agent.md
[platform]/agents/gsd-planner.agent.md
[platform]/agents/gsd-verifier.agent.md
... (10 more)
```

### 3. Shared Directory

The entire `get-shit-done/` folder:

```text
[platform]/get-shit-done/
├── references/         (protocols and guidelines)
├── templates/          (plan templates)
├── workflows/          (helper scripts)
└── .gsd-install-manifest.json
```

**Total removal:** Approximately 2MB of files.

---

## Verifying Removal

After running the removal commands, verify GSD is completely gone:

### Check Claude Installation

```bash
ls ~/.claude/get-shit-done/ 2>/dev/null || echo "Removed successfully"
ls .claude/get-shit-done/ 2>/dev/null || echo "Removed successfully"
```

### Check Copilot Installation

```bash
ls ~/.copilot/get-shit-done/ 2>/dev/null || echo "Removed successfully"
ls .github/get-shit-done/ 2>/dev/null || echo "Removed successfully"
```

### Check Codex Installation

```bash
ls ~/.codex/get-shit-done/ 2>/dev/null || echo "Removed successfully"
ls .codex/get-shit-done/ 2>/dev/null || echo "Removed successfully"
```

If you see "Removed successfully" for all checks, GSD is completely uninstalled.

### Alternative Verification

Check for any remaining GSD files:

```bash
# Search for GSD skills (should return nothing)
find ~/.claude ~/.copilot ~/.codex .claude .github .codex -name "gsd-*" 2>/dev/null
```

Empty output means successful removal.

---

## Partial Removal

You don't have to remove all GSD installations. You can remove specific platforms or scopes.

### Remove Specific Platform Only

**Remove only Claude installation (keep Copilot/Codex):**

```bash
rm -rf ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/
rm -rf .claude/skills/gsd-* .claude/agents/gsd-* .claude/get-shit-done/
```

**Remove only Copilot installation:**

```bash
rm -rf ~/.copilot/skills/gsd-* ~/.copilot/agents/gsd-* ~/.copilot/get-shit-done/
rm -rf .github/skills/gsd-* .github/agents/gsd-* .github/get-shit-done/
```

**Remove only Codex installation:**

```bash
rm -rf ~/.codex/skills/gsd-* ~/.codex/agents/gsd-* ~/.codex/get-shit-done/
rm -rf .codex/skills/gsd-* .codex/agents/gsd-* .codex/get-shit-done/
```

### Remove Specific Scope Only

**Remove only global installations (keep local):**

```bash
rm -rf ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/
rm -rf ~/.copilot/skills/gsd-* ~/.copilot/agents/gsd-* ~/.copilot/get-shit-done/
rm -rf ~/.codex/skills/gsd-* ~/.codex/agents/gsd-* ~/.codex/get-shit-done/
```

**Remove only local installations (keep global):**

```bash
rm -rf .claude/skills/gsd-* .claude/agents/gsd-* .claude/get-shit-done/
rm -rf .github/skills/gsd-* .github/agents/gsd-* .github/get-shit-done/
rm -rf .codex/skills/gsd-* .codex/agents/gsd-* .codex/get-shit-done/
```

---

## What Is NOT Removed

Uninstalling GSD does **not** affect:

### Your Project Files

Your `.planning/` directory remains intact:

```plaintext

your-project/
├── .planning/
│   ├── ROADMAP.md
│   ├── REQUIREMENTS.md
│   ├── STATE.md
│   ├── phases/
│   │   └── 01-phase-name/
│   │       ├── PLAN.md
│   │       └── SUMMARY.md
│   └── research/

```

GSD only removes the template files it installed. All your project-specific planning and execution history remains untouched.

### Other Platform Files

Non-GSD files in platform directories are preserved:

- `.claude/` - Other Claude skills/agents remain
- `.github/` - GitHub workflows, actions remain
- `.codex/` - Other Codex configurations remain

Only files matching `gsd-*` are removed.

### Git History

Your git commits made by GSD remain in git history. The uninstall only removes template files from your working directory.

---

## Reinstalling After Removal

To reinstall GSD after removal:

```bash
npx get-shit-done-multi
```

The installer treats it as a fresh installation:

1. Auto-detects platforms (no old installation found)
2. Prompts for installation location
3. Installs all files fresh
4. Creates new `.gsd-install-manifest.json`

Your previous installation settings (scope, platforms) are not remembered. You'll need to choose again.

---

## Uninstall Script (Future)

**Note:** Currently, there is no automatic uninstall command.

Planned for v2.1+:

```bash
# Planned feature (not yet available)
npx get-shit-done-multi --uninstall
```

This will:

- Detect all GSD installations
- Prompt which to remove
- Delete selected installations
- Verify removal

Until then, use the manual `rm -rf` commands above.

---

## Why Manual Removal is Safe

Deleting GSD directories is completely safe because:

1. **Template files are static:** No runtime configuration or state
2. **No system integration:** No PATH modifications, no registry changes
3. **No dependencies:** Other packages don't depend on GSD files
4. **Idempotent:** Can safely run removal commands multiple times
5. **Project files untouched:** Your `.planning/` data is separate

The `rm -rf` commands only remove what the installer created. Nothing more.

---

## Removing Without Knowing Installation Location

If you're not sure where GSD is installed, find it first:

```bash
# Find all GSD installations
find ~ -name ".gsd-install-manifest.json" 2>/dev/null
```

Example output:

```plaintext
/Users/you/.claude/get-shit-done/.gsd-install-manifest.json
/Users/you/project/.github/get-shit-done/.gsd-install-manifest.json
```

Then remove based on the paths found:

```bash
# For ~/.claude/get-shit-done/
rm -rf ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/

# For project/.github/get-shit-done/
rm -rf /path/to/project/.github/skills/gsd-* \
       /path/to/project/.github/agents/gsd-* \
       /path/to/project/.github/get-shit-done/
```

---

## Troubleshooting Removal

### Permission Denied When Removing

**Problem:** `rm: cannot remove: Permission denied`

**Cause:** Files owned by different user or read-only permissions

**Solution:**

```bash
# Fix permissions first
chmod -R u+w ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/

# Then remove
rm -rf ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/
```

### Files Reappear After Removal

**Problem:** GSD files come back after deletion

**Cause:** AI platform recreates files from cache

**Solution:**

1. Remove GSD files
2. Clear platform cache (platform-specific)
3. Restart your AI platform

### Can't Find GSD Installation

**Problem:** Not sure if GSD is installed

**Solution:**

```bash
# Search all common locations
ls -la ~/.claude/get-shit-done/ 2>/dev/null
ls -la ~/.copilot/get-shit-done/ 2>/dev/null
ls -la ~/.codex/get-shit-done/ 2>/dev/null
ls -la .claude/get-shit-done/ 2>/dev/null
ls -la .github/get-shit-done/ 2>/dev/null
ls -la .codex/get-shit-done/ 2>/dev/null
```

If all return "No such file or directory", GSD is not installed.

---

## Next Steps

- **Want to reinstall?** See [How to Install](how-to-install.md)
- **Encountered issues?** See [Troubleshooting](troubleshooting.md)
- **Need to understand what was removed?** See [What Gets Installed](what-gets-installed.md)
