---
created: 2026-01-27T19:46
title: Refactor check-update.js - use platform-names and split into separate modules
area: tooling
files:
  - bin/lib/updater/check-update.js:205-210
  - bin/lib/updater/check-update.js:1-230
  - bin/lib/platforms/platform-names.js:1-33
---

## Problem

`check-update.js` has two issues:

### 1. Duplicated Platform Names (lines 205-210)

The `formatStatusLine()` function duplicates platform name mappings that already exist in `platform-names.js`:

```javascript
// In check-update.js (DUPLICATED)
const names = {
    'claude': 'Claude Code',
    'copilot': 'GitHub Copilot',
    'codex': 'Codex'
};
const baseName = names[platform] || platform;

// Already exists in platform-names.js
export const platformNames = {
  claude: 'Claude Code',
  copilot: 'GitHub Copilot CLI',
  codex: 'Codex CLI'
};
export function getPlatformName(platform) {
  return platformNames[platform] || 'your AI CLI';
}
```

This violates DRY principle and risks inconsistency if names change.

### 2. Single File Does Too Much

`check-update.js` (230 lines) handles three distinct responsibilities:
- Check global installations (lines ~70-110)
- Check local installations (lines ~112-152)
- Check custom path (lines ~34-68)

This makes the file harder to:
- Navigate and understand
- Test in isolation
- Maintain separately
- Reuse individual checkers

Each checker has unique logic and concerns, but they're all mixed together.

## Solution

### Part 1: Use platform-names.js in formatStatusLine

Replace duplicated names with import:

```javascript
import { getPlatformName } from '../platforms/platform-names.js';

function formatStatusLine(platform, versionStatus, verbose) {
    const baseName = getPlatformName(platform);
    // ... rest of function
}
```

Note: `platform-names.js` includes "CLI" suffix (e.g., "GitHub Copilot CLI"), might want to remove it for status lines or add a `getPlatformDisplayName()` variant.

### Part 2: Split into Separate Modules

Create three focused modules in `bin/lib/updater/`:

**Structure:**
```
bin/lib/updater/
  ├── check-update.js          # Main orchestrator (calls the 3 below)
  ├── check-global.js          # checkGlobalInstallations()
  ├── check-local.js           # checkLocalInstallations()
  ├── check-custom-path.js     # checkCustomPath()
  ├── update-messages.js       # (already exists)
  └── format-status.js         # formatStatusLine(), validateInstallation()
```

**Benefits:**
- Single Responsibility Principle
- Easier to test each checker independently
- Easier to navigate (know which file to open)
- Shared utilities in `format-status.js`
- Main orchestrator stays clean and readable

**Migration approach:**
1. Create `format-status.js` with `formatStatusLine()` and `validateInstallation()`
2. Create `check-global.js` with `checkGlobalInstallations()` function
3. Create `check-local.js` with `checkLocalInstallations()` function
4. Create `check-custom-path.js` with `checkCustomPath()` function
5. Update `check-update.js` to import and orchestrate the 4 modules
6. Verify all flows still work

## Testing

```bash
# Test global check
cd /tmp && node bin/install.js --check-updates

# Test local check
cd /tmp/test-dir && node /path/to/install.js --check-updates

# Test custom path
node bin/install.js --check-updates --custom-path /tmp/custom

# Test verbose mode
node bin/install.js --check-updates --verbose
```

## Notes

- This is pure refactoring - no behavior changes
- Keep same exports from check-update.js (`handleCheckUpdates`)
- All 5 new modules should be in `bin/lib/updater/` for domain cohesion
- Consider if platform-names.js needs a variant without "CLI" suffix for status displays
