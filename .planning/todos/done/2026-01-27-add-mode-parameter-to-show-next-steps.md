---
created: 2026-01-27T18:58
title: Add mode parameter to showNextSteps for install vs check-updates contexts
area: ui
files:
  - bin/lib/cli/next-steps.js:17
  - bin/install.js:108
  - bin/lib/updater/check-update.js:61
---

## Problem

`showNextSteps()` is currently used in two different contexts with inappropriate messaging:

1. **After successful installation** (`install.js:108`) - ✅ Correct usage
   - Shows: "Next Steps", "Try /gsd-help", "Try /gsd-diagnose"
   - This makes sense - user just installed, needs to know what to do next

2. **During check-updates when no installation found** (`check-update.js:61`) - ❌ Wrong usage
   - Shows: "Next Steps", "Try /gsd-help", "Try /gsd-diagnose"
   - This doesn't make sense - there's NO installation, can't run commands

**Current code in check-update.js (line 61):**
```javascript
if (!exists) {
    logger.error('Installation not found', 2);
    showNextSteps(['claude', 'copilot', 'codex']); // WRONG CONTEXT
    return;
}
```

User can't run `/gsd-help` if there's no installation!

## Solution

Add a `mode` parameter to `showNextSteps()` to support different contexts:

### Option 1: Mode parameter (recommended)
```javascript
export function showNextSteps(platforms, mode = 'install', indent = 1) {
  if (mode === 'install') {
    // Current behavior: show commands to try
    logger.blockTitle('Next Steps', { width: 80 });
    logger.info(`Open ${cliName} and run ${prefix}help`, indent);
    logger.info(`Try ${prefix}diagnose`, indent);
  } else if (mode === 'no-installation') {
    // New: show how to install
    logger.blockTitle('No Installation Found', { width: 80 });
    logger.info(`Run the installer to set up GSD:`, indent);
    logger.info(`  npx get-shit-done-multi --claude --global`, indent);
    logger.info(`  npx get-shit-done-multi --copilot --local`, indent);
  }
}
```

### Option 2: Separate functions (cleaner domain separation)
Move to separate domain-specific files:
- `bin/lib/cli/next-steps.js` → installation-only messages
- `bin/lib/updater/update-messages.js` → update-specific messages

**Benefits of Option 2:**
- Respects "library per domain" principle
- Cleaner separation of concerns
- `updater/` module doesn't depend on `cli/` module
- Easier to maintain and test

## Implementation Notes

**If Option 1 (mode parameter):**
- Update `bin/lib/cli/next-steps.js` to accept mode
- Update `bin/install.js` call: `showNextSteps(platforms, 'install')`
- Update `bin/lib/updater/check-update.js` call: `showNextSteps(platforms, 'no-installation')`

**If Option 2 (separate functions):**
- Keep `showNextSteps()` in `bin/lib/cli/next-steps.js` (install-only)
- Create `bin/lib/updater/update-messages.js` with:
  - `showNoInstallationMessage(platforms)`
  - `showUpdateAvailableMessage(platform, versions)`
  - Future: other update-related messages
- Update imports in check-update.js

## Recommendation

**Option 2 (separate functions)** is better because:
- ✅ Respects domain boundaries (CLI vs Updater)
- ✅ Each module owns its messages
- ✅ More scalable (updater will likely need more message types)
- ✅ Cleaner dependency graph
- ✅ Follows existing pattern (`bin/lib/updater/` already exists)

## Testing

Test both contexts work correctly:
```bash
# Test 1: Installation context (should show commands)
npx . --claude --global
# Should show: "Try /gsd-help", "Try /gsd-diagnose"

# Test 2: Check-updates no installation (should show how to install)
npx . --check-updates --custom-path /tmp/nonexistent
# Should show: "Run the installer to set up GSD"
```
