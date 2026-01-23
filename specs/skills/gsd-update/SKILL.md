---
name: gsd-update
description: Update GSD installation to latest version from repository
skill_version: 1.9.1
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools:
  - name: read
  - name: bash
arguments: []
---

<objective>
Update GSD installation to latest version from repository, display changelog, 
and verify installation.

Purpose: Keep GSD up-to-date with latest features and bug fixes.
Output: Updated installation, changelog displayed.
</objective>

<process>
<step name="check_current_version">
Determine current GSD version:

```bash
# Check current version from package.json
CURRENT_VERSION=$(jq -r '.version' package.json 2>/dev/null || echo "unknown")
echo "Current GSD version: ${CURRENT_VERSION}"
```
</step>

<step name="fetch_latest">
Fetch latest version from repository:

```bash
# Ensure we're in GSD directory
if [ ! -f "package.json" ] || ! grep -q '"name": "get-shit-done"' package.json; then
  echo "Error: Not in GSD directory"
  exit 1
fi

# Fetch latest from origin
git fetch origin main

# Get latest version
LATEST_VERSION=$(git show origin/main:package.json | jq -r '.version' 2>/dev/null || echo "unknown")
echo "Latest GSD version: ${LATEST_VERSION}"
```
</step>

<step name="check_if_update_needed">
Compare versions:

```bash
if [ "${CURRENT_VERSION}" = "${LATEST_VERSION}" ]; then
  echo "✓ Already up-to-date (${CURRENT_VERSION})"
  echo ""
  echo "No update needed. You're running the latest version."
  exit 0
fi

echo ""
echo "Update available: ${CURRENT_VERSION} → ${LATEST_VERSION}"
echo ""
```
</step>

<step name="display_changelog">
Display changelog between versions:

```bash
# Parse CHANGELOG.md for changes between versions
echo "=== Changelog: ${CURRENT_VERSION} → ${LATEST_VERSION} ==="
echo ""

# Extract relevant changelog section
# Look for version headers and extract content between current and latest
if [ -f "CHANGELOG.md" ]; then
  # Show changes from remote (latest)
  git show origin/main:CHANGELOG.md | awk "
    /^## \[${LATEST_VERSION}\]/,/^## \[${CURRENT_VERSION}\]/ {
      if (/^## \[${CURRENT_VERSION}\]/) exit;
      print
    }
  " | head -50
else
  echo "(CHANGELOG.md not found)"
fi

echo ""
```
</step>

<step name="confirm_update">
Ask for confirmation:

If user confirms: proceed with update
If user declines: exit without updating

```bash
echo "Proceed with update? This will:"
echo "  1. Stash any local changes"
echo "  2. Pull latest code from origin/main"
echo "  3. Run npm install"
echo "  4. Verify installation"
echo ""
read -p "Continue? (y/n): " CONFIRM

if [ "${CONFIRM}" != "y" ] && [ "${CONFIRM}" != "Y" ]; then
  echo "Update cancelled"
  exit 0
fi
```
</step>

<step name="stash_local_changes">
Stash any local changes:

```bash
# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "Stashing local changes..."
  git stash push -m "GSD update: stash before update to ${LATEST_VERSION}"
  STASHED=true
else
  STASHED=false
fi
```
</step>

<step name="pull_latest">
Pull latest code:

```bash
echo "Pulling latest code..."
git pull origin main

if [ $? -ne 0 ]; then
  echo "Error: git pull failed"
  if [ "${STASHED}" = "true" ]; then
    echo "Your changes are stashed. Run 'git stash pop' to restore."
  fi
  exit 1
fi
```
</step>

<step name="install_dependencies">
Install updated dependencies:

```bash
echo "Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
  echo "Error: npm install failed"
  exit 1
fi
```
</step>

<step name="verify_installation">
Verify updated installation:

```bash
echo "Verifying installation..."

# Check version updated
NEW_VERSION=$(jq -r '.version' package.json)

if [ "${NEW_VERSION}" != "${LATEST_VERSION}" ]; then
  echo "Warning: Version mismatch after update"
  echo "  Expected: ${LATEST_VERSION}"
  echo "  Got: ${NEW_VERSION}"
fi

# Run basic checks
echo "Running verification checks..."

# Check required files exist
CHECKS_PASSED=true

if [ ! -f "bin/install.js" ]; then
  echo "✗ Missing bin/install.js"
  CHECKS_PASSED=false
else
  echo "✓ bin/install.js exists"
fi

if [ ! -d "specs/skills" ]; then
  echo "✗ Missing specs/skills directory"
  CHECKS_PASSED=false
else
  SKILL_COUNT=$(ls -1 specs/skills | wc -l)
  echo "✓ specs/skills exists (${SKILL_COUNT} skills)"
fi

if [ ! -d "specs/agents" ]; then
  echo "✗ Missing specs/agents directory"
  CHECKS_PASSED=false
else
  AGENT_COUNT=$(ls -1 specs/agents | wc -l)
  echo "✓ specs/agents exists (${AGENT_COUNT} agents)"
fi
```
</step>

<step name="restore_stashed_changes">
Offer to restore stashed changes:

```bash
if [ "${STASHED}" = "true" ]; then
  echo ""
  echo "Local changes were stashed before update."
  read -p "Restore stashed changes? (y/n): " RESTORE
  
  if [ "${RESTORE}" = "y" ] || [ "${RESTORE}" = "Y" ]; then
    git stash pop
    echo "Changes restored. Review any merge conflicts."
  else
    echo "Changes remain stashed. Run 'git stash pop' to restore later."
  fi
fi
```
</step>

<step name="present_summary">
Present update summary:

```
## GSD UPDATE COMPLETE

**Previous version:** ${CURRENT_VERSION}
**Current version:** ${NEW_VERSION}

✓ Code updated
✓ Dependencies installed
✓ Installation verified

### Next Steps

1. Review changelog above for new features
2. Test critical workflows (e.g., /gsd:progress)
3. Report any issues on GitHub

**Note:** Skills and agents were not regenerated. Run installation 
manually if needed:
  - npm run install:local (for testing)
  - Or wait for next GSD command run (auto-regenerates)
```
</step>
</process>
