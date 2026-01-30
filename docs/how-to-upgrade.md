# How to Upgrade GSD

Upgrading is the same as installing:

```bash
npx get-shit-done-multi
```

The installer detects existing installations and prompts you to upgrade if outdated.

## How Update Detection Works

GSD uses a manifest-based approach to detect and manage updates across all platforms.

### Manifest-Based Detection

When you run `npx get-shit-done-multi`, the installer:

1. **Scans for existing installations:**
   - Checks local directories (`.claude/`, `.github/`, `.codex/`)
   - Checks global directories (`~/.claude/`, `~/.copilot/`, `~/.codex/`)

2. **Reads installation manifests:**
   - Each installation has a `.gsd-install-manifest.json` file
   - Located in `[platform]/get-shit-done/.gsd-install-manifest.json`
   - Contains version number and installation metadata

3. **Compares versions:**
   - Compares installed version vs. current package version
   - Identifies outdated installations
   - Shows which installations need upgrading

4. **Prompts for upgrade:**
   - Lists all outdated installations
   - Asks which ones to upgrade
   - You can upgrade all, some, or none

### Version Display

Check all installed GSD versions:

```bash
npx get-shit-done-multi --version
```

Example output:

```text
GSD Installer v2.0.1

Installed versions:
- Claude (global): v2.0.0 at ~/.claude/get-shit-done/
  → Update available: v2.0.1
- Copilot (local): v2.0.1 at .github/get-shit-done/
  ✓ Up to date
- Codex (global): v1.9.5 at ~/.codex/get-shit-done/
  → Update available: v2.0.1 (major version change)
```

This helps you:

- See which installations exist
- Identify outdated versions
- Plan upgrades strategically

### Multi-Platform Upgrades

If you have GSD installed across multiple platforms or scopes, the installer handles each independently:

**Example scenario:**

```text
Found installations:
1. Claude (global): v2.0.0 → v2.0.1 available
2. Copilot (local): v2.0.0 → v2.0.1 available
3. Codex (global): v2.0.1 (up to date)

Upgrade which installations?
[ ] 1. Claude (global)
[ ] 2. Copilot (local)

Press Space to select, Enter to confirm
```

You can:

- Upgrade all platforms at once
- Upgrade specific platforms only
- Skip upgrades for certain installations
- Choose different scopes (local vs. global)

## Upgrade Process

When you confirm an upgrade, the installer follows these steps:

### 1. Pre-flight Validation

Before upgrading, the installer checks:

- **Disk space:** Ensures sufficient space for new files
- **Permissions:** Verifies write access to installation directory
- **File conflicts:** Checks for custom modifications (warns if found)

### 2. File Replacement

The installer **does not create backups** because:

- All GSD files are templates (read-only reference material)
- Your project's `.planning/` directory is never touched
- Custom modifications should not exist (templates are reference-only)

The upgrade process:

1. Overwrites existing skill files
2. Overwrites existing agent files
3. Replaces shared directory contents
4. Updates `.gsd-install-manifest.json` with new version

### 3. Manifest Update

After successful upgrade, the manifest is updated:

**Before:**

```json
{
  "gsd_version": "2.0.0",
  "installed_at": "2026-01-15T10:30:00Z",
  ...
}
```

**After:**

```json
{
  "gsd_version": "2.0.1",
  "installed_at": "2026-01-29T14:20:00Z",
  ...
}
```

### 4. Confirmation

The installer confirms success:

```plaintext
✓ Upgraded Claude (global) from v2.0.0 to v2.0.1
✓ Upgraded Copilot (local) from v2.0.0 to v2.0.1

All upgrades complete.
```

## Breaking Changes

### Understanding Version Numbers

GSD follows semantic versioning (semver):

- **Major version** (v2.x.x → v3.x.x): Breaking changes
- **Minor version** (v2.0.x → v2.1.x): New features, backwards compatible
- **Patch version** (v2.0.0 → v2.0.1): Bug fixes, fully compatible

### Handling Major Version Updates

When upgrading across major versions (e.g., v2.x → v3.x):

1. **Read the CHANGELOG:**

   ```bash
   npx get-shit-done-multi --changelog
   # or visit: https://github.com/your-org/gsd/blob/main/CHANGELOG.md
   ```

2. **Check breaking changes:**
   - Skill name changes
   - Agent protocol changes
   - File structure modifications
   - New requirements

3. **Plan the upgrade:**
   - Finish in-progress work first
   - Commit all changes
   - Test on a non-critical project first

4. **Proceed with upgrade:**

   ```bash
   npx get-shit-done-multi --yes
   ```

### Safe Upgrades

**Patch and minor version updates are always safe:**

- No breaking changes
- Skills maintain same names
- Agents maintain same interfaces
- Your existing `.planning/` directories continue working

**You can upgrade confidently for:**

- v2.0.0 → v2.0.1 (patch)
- v2.0.x → v2.1.0 (minor)
- v2.x.x → v2.y.z (same major)

## Downgrading

Downgrading to an older version is **not directly supported**.

### Why Downgrading Is Not Supported

- NPM always installs the latest version via `npx`
- Manifest system tracks forward upgrades only
- Breaking changes make backwards compatibility complex

### How to Revert to an Older Version

If you need to use an older GSD version:

**Option 1: Install specific version (if available)**

```bash
# Uninstall current version first
# (see docs/how-to-uninstall.md)

# Install specific older version
npx get-shit-done-multi@2.0.0
```

**Option 2: Use npm install for pinned version**

```bash
npm install get-shit-done-multi@2.0.0
node_modules/.bin/get-shit-done-multi
```

**Important:** Older versions may not be available if removed from NPM.

## Non-Interactive Upgrade

For CI/CD or automation, upgrade non-interactively:

```bash
# Upgrade all installations without prompting
npx get-shit-done-multi --yes

# Upgrade specific platform only
npx get-shit-done-multi --claude --yes

# Upgrade to global location
npx get-shit-done-multi --global --yes
```

The `--yes` flag:

- Skips all confirmation prompts
- Automatically upgrades outdated installations
- Uses default options (local scope if not specified)

## Troubleshooting Upgrades

### Upgrade Fails with Permission Error

**Problem:** `Error: EACCES: permission denied`

**Solution:**

```bash
# Use --local flag to install in current directory
npx get-shit-done-multi --local --yes

# Or fix permissions on global directory
chmod -R u+w ~/.claude/
```

### Version Not Detected After Upgrade

**Problem:** `--version` shows old version after upgrade

**Causes:**

- Manifest file not updated (file write failed)
- Wrong installation location
- Multiple installations (checking wrong one)

**Solution:**

```bash
# Check manifest directly
cat ~/.claude/get-shit-done/.gsd-install-manifest.json

# Look for gsd_version field
# If incorrect, try reinstalling:
npx get-shit-done-multi --claude --global --yes
```

### Upgrade Succeeds but Skills Not Updated

**Problem:** Skills still show old version behavior

**Cause:** AI platform hasn't reloaded skills from disk

**Solution:**

1. Restart your AI platform (Claude Desktop, VS Code, etc.)
2. Reload skill cache (platform-specific)
3. Verify files updated: `ls -la ~/.claude/skills/gsd-*/`

### Can't Upgrade Due to Disk Space

**Problem:** Pre-flight validation fails with "Insufficient disk space"

**Solution:**

1. Free up disk space (need ~2MB)
2. Install to different location:

   ```bash
   # Switch from global to local
   npx get-shit-done-multi --local --yes
   ```

1. Remove unused installations first

## Next Steps

- **Learn what gets updated:** See [What Gets Installed](what-gets-installed.md) for file details
- **Check for breaking changes:** See [CHANGELOG.md](../CHANGELOG.md) for version history
- **Encounter issues?** See [Troubleshooting](troubleshooting.md) for common problems
- **Need to remove?** See [How to Uninstall](how-to-uninstall.md) for cleanup
