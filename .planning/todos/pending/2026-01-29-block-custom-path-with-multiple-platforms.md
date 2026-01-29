---
created: 2026-01-29T11:02
title: Block custom-path with multiple platforms
area: validation
priority: high
files:
  - bin/install.js:73-79
  - bin/lib/validation/cli-validator.js (new)
  - bin/lib/installer/orchestrator.js:62-65
---

## Problem

When user runs: `--copilot --codex --custom-path /tmp/test`

**Current behavior (BUG):**
- Both platforms install to `/tmp/test` (SAME directory)
- Second installation OVERWRITES the first
- User ends up with only ONE platform's files (the last one)
- No warning or error

**Root cause:**
In `orchestrator.js:62-65`:
```js
const targetDir = targetDirOverride || (isGlobal
  ? join(homedir(), targetBase.replace('~/', ''))
  : targetBase);
```

`targetDirOverride` (customPath) completely replaces `targetBase` (platform-specific path like `.github` or `.codex`), so multiple platforms overwrite each other.

## Solution

**Block custom-path when multiple platforms selected** (Option 2)

### Implementation Location

Per user guidance: Add validation in `bin/lib/validation/` and invoke in `install.js` right after custom-path validation (line 73) and before `--check-updates` validation (line 76).

### Steps

1. **Create validation module** `bin/lib/validation/cli-validator.js`:
   ```js
   /**
    * Validate that custom-path is not used with multiple platforms
    * @param {Array<string>} platforms - Selected platforms
    * @param {string|null} customPath - Custom path option
    * @throws {Error} If validation fails
    */
   export function validateCustomPathWithPlatforms(platforms, customPath) {
     if (customPath && platforms.length > 1) {
       throw new Error(
         'Cannot use --custom-path with multiple platforms.\n' +
         '\n' +
         'Reason: All platforms would install to the same directory and overwrite each other.\n' +
         '\n' +
         'Solution: Run separate commands:\n' +
         `  npx get-shit-done-multi --${platforms[0]} --custom-path ${customPath}\n` +
         `  npx get-shit-done-multi --${platforms[1]} --custom-path <other-path>\n` +
         '\n' +
         'Or use default paths:\n' +
         `  npx get-shit-done-multi --${platforms.join(' --')} --local`
       );
     }
   }
   ```

2. **Add validation to install.js** (after line 73, before line 76):
   ```js
   // Existing custom-path validation (lines 64-73)
   const customPathArgs = process.argv.filter(arg =>
     arg.startsWith('--custom-path')
   );
   if (customPathArgs.length > 1) {
     multipleDirectoryErrors();
     process.exit(1);
   }

   // NEW: Validate custom-path with multiple platforms
   const platforms = parsePlatformFlags(options, adapterRegistry);
   validateCustomPathWithPlatforms(platforms, options.customPath);

   // Handle --check-updates flag (line 76)
   if (options.checkUpdates) {
     ...
   }
   ```

3. **Test scenarios:**
   - `--copilot --custom-path /tmp/test` → ✓ OK
   - `--copilot --codex --custom-path /tmp/test` → ✗ Error with clear message
   - `--copilot --codex --local` → ✓ OK (no custom-path)

### Error Message Example

```
Error: Cannot use --custom-path with multiple platforms.

Reason: All platforms would install to the same directory and overwrite each other.

Solution: Run separate commands:
  npx get-shit-done-multi --copilot --custom-path /tmp/test
  npx get-shit-done-multi --codex --custom-path /tmp/other

Or use default paths:
  npx get-shit-done-multi --copilot --codex --local
```

## Alternative Considered

**Option 1:** Append platform subdirectory (e.g., `/tmp/test/.github/` + `/tmp/test/.codex/`)

This would require changing orchestrator logic:
```js
const targetDir = targetDirOverride 
  ? join(targetDirOverride, targetBase)  // Append platform dir
  : (isGlobal
      ? join(homedir(), targetBase.replace('~/', ''))
      : targetBase);
```

**Decision:** Option 2 (blocking) is clearer and prevents accidental overwrites. Users explicitly choose which platform goes where.

## Priority

**High** - Data loss bug. Users lose files without warning.
