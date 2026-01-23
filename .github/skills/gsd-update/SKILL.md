---
name: gsd-update
description: Update GSD installation to latest version from npm
skill_version: 1.9.2
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools: [read, execute]
arguments: []
metadata:
  platform: copilot
  generated: '2026-01-23'
  templateVersion: 1.0.0
  projectVersion: 1.9.0
  projectName: 'get-shit-done-multi'
---

<objective>
Check current GSD version, compare with latest available on npm, and update if needed.

Purpose: Keep GSD up-to-date with latest features and bug fixes.
Output: Version comparison, changelog, and updated installation.
</objective>

<execution_context>
@/workspace/.github/copilot/skills/get-shit-done/VERSION
@/workspace/.github/copilot/skills/get-shit-done/CHANGELOG.md
</execution_context>

<process>

<step name="detect_platform">
Detect which platform is being used:

```bash
# Detect platform based on installation directory
if [ -d "${HOME}/.claude/skills" ] || [ -d "./.claude/skills" ]; then
  PLATFORM="claude"
  INSTALL_CMD="npx get-shit-done-multi@latest"
  if [ -f "./.claude/skills/get-shit-done/VERSION" ]; then
    VERSION_FILE="./.claude/skills/get-shit-done/VERSION"
  elif [ -f "${HOME}/.claude/skills/get-shit-done/VERSION" ]; then
    VERSION_FILE="${HOME}/.claude/skills/get-shit-done/VERSION"
  fi
elif [ -d "./.github/skills" ] || [ -d "${HOME}/.github/copilot/skills" ]; then
  PLATFORM="copilot"
  INSTALL_CMD="npx get-shit-done-multi@latest --copilot"
  if [ -f "./.github/skills/get-shit-done/VERSION" ]; then
    VERSION_FILE="./.github/skills/get-shit-done/VERSION"
  elif [ -f "${HOME}/.github/copilot/skills/get-shit-done/VERSION" ]; then
    VERSION_FILE="${HOME}/.github/copilot/skills/get-shit-done/VERSION"
  fi
elif [ -d "./.codex/skills" ] || [ -d "${HOME}/.codex/skills" ]; then
  PLATFORM="codex"
  INSTALL_CMD="npx get-shit-done-multi@latest --codex"
  if [ -f "./.codex/skills/get-shit-done/VERSION" ]; then
    VERSION_FILE="./.codex/skills/get-shit-done/VERSION"
  elif [ -f "${HOME}/.codex/skills/get-shit-done/VERSION" ]; then
    VERSION_FILE="${HOME}/.codex/skills/get-shit-done/VERSION"
  fi
else
  echo "Error: GSD installation not found"
  echo "Run installation first: npx get-shit-done-multi"
  exit 1
fi

echo "Platform detected: ${PLATFORM}"
```
</step>

<step name="check_current_version">
Read current installed version:

```bash
if [ -f "${VERSION_FILE}" ]; then
  CURRENT_VERSION=$(cat "${VERSION_FILE}")
  echo "Current version: ${CURRENT_VERSION}"
else
  echo "Warning: VERSION file not found at ${VERSION_FILE}"
  CURRENT_VERSION="unknown"
fi
```
</step>

<step name="check_npm_versions">
Check available versions on npm:

```bash
echo ""
echo "Checking npm registry..."

# Get latest version from npm
LATEST_VERSION=$(npm view get-shit-done-multi version 2>/dev/null)

if [ -z "${LATEST_VERSION}" ]; then
  echo "Error: Could not fetch version info from npm"
  echo "Check your internet connection"
  exit 1
fi

echo "Latest version: ${LATEST_VERSION}"
echo ""

# Get recent versions (last 5)
echo "Recent versions available:"
npm view get-shit-done-multi versions --json 2>/dev/null | \
  jq -r '.[-5:] | reverse | .[]' 2>/dev/null || \
  echo "  (Could not fetch version list)"
echo ""
```
</step>

<step name="compare_versions">
Compare current vs latest:

```bash
if [ "${CURRENT_VERSION}" = "${LATEST_VERSION}" ]; then
  echo "✓ You're running the latest version (${CURRENT_VERSION})"
  echo ""
  echo "No update needed."
  exit 0
fi

# Simple version comparison (works for semantic versions)
if [ "${CURRENT_VERSION}" != "unknown" ]; then
  echo "📦 Update available: ${CURRENT_VERSION} → ${LATEST_VERSION}"
else
  echo "📦 Latest version available: ${LATEST_VERSION}"
fi
echo ""
```
</step>

<step name="display_changelog">
Display recent changes:

```bash
echo "=== Recent Changes ==="
echo ""

# Try to read CHANGELOG.md from installed location
CHANGELOG_FILE="${VERSION_FILE%/*}/CHANGELOG.md"

if [ -f "${CHANGELOG_FILE}" ]; then
  # Show latest version changes (top section)
  awk '/^## \[/{p++} p==1' "${CHANGELOG_FILE}" | head -30
else
  echo "(CHANGELOG.md not available locally)"
  echo "View at: https://github.com/shoootyou/get-shit-done-multi/blob/main/CHANGELOG.md"
fi

echo ""
```
</step>

<step name="confirm_update">
Ask for update confirmation:

```bash
echo "Update command: ${INSTALL_CMD}"
echo ""
echo "This will:"
echo "  1. Download latest version from npm"
echo "  2. Regenerate platform-specific skills and agents"
echo "  3. Update all GSD files in place"
echo ""
read -p "Proceed with update? (y/n): " CONFIRM

if [ "${CONFIRM}" != "y" ] && [ "${CONFIRM}" != "Y" ]; then
  echo "Update cancelled"
  echo ""
  echo "To update later, run: ${INSTALL_CMD}"
  exit 0
fi
```
</step>

<step name="run_update">
Execute npm installation:

```bash
echo ""
echo "Running update..."
echo "Command: ${INSTALL_CMD}"
echo ""

# Run the installation command
eval "${INSTALL_CMD}"

UPDATE_EXIT_CODE=$?

if [ ${UPDATE_EXIT_CODE} -ne 0 ]; then
  echo ""
  echo "✗ Update failed with exit code ${UPDATE_EXIT_CODE}"
  echo ""
  echo "Try running manually: ${INSTALL_CMD}"
  exit 1
fi
```
</step>

<step name="verify_update">
Verify the update succeeded:

```bash
echo ""
echo "Verifying update..."

# Read new version
if [ -f "${VERSION_FILE}" ]; then
  NEW_VERSION=$(cat "${VERSION_FILE}")
  
  if [ "${NEW_VERSION}" = "${LATEST_VERSION}" ]; then
    echo "✓ Successfully updated to ${NEW_VERSION}"
  else
    echo "⚠ Version mismatch:"
    echo "  Expected: ${LATEST_VERSION}"
    echo "  Installed: ${NEW_VERSION}"
  fi
else
  echo "⚠ Could not verify version (VERSION file not found)"
  NEW_VERSION="${LATEST_VERSION}"
fi
```
</step>

<step name="present_summary">
Show update summary:

```
## GSD UPDATE COMPLETE

**Previous version:** ${CURRENT_VERSION}
**New version:** ${NEW_VERSION}

✓ Downloaded from npm
✓ Skills and agents regenerated
✓ Installation verified

### Next Steps

1. Test a command to ensure everything works:
   /gsd-help

2. Review changelog for new features and changes

3. If using Claude Code, restart to reload commands

### Resources

- Changelog: ${CHANGELOG_FILE}
- Issues: https://github.com/shoootyou/get-shit-done-multi/issues
- Docs: https://github.com/shoootyou/get-shit-done-multi/blob/main/docs/

---

**Having issues?** Run /gsd-verify-installation for diagnostics.
```
</step>

</process>

<anti_patterns>
- Don't try to update via git (use npm package)
- Don't modify VERSION file manually
- Don't skip version check (always compare first)
- Don't assume update succeeded without verification
</anti_patterns>
