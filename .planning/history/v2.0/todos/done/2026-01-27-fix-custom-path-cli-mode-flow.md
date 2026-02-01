---
created: 2026-01-27T23:59
title: Fix --custom-path in CLI mode to flow through installation
area: tooling
files:
  - bin/install.js:88-106
  - bin/lib/cli/interactive.js:136-179
  - bin/lib/cli/flag-parser.js:40-52
decision: Option A - Keep scope and customPath separate (minimal change)
---

## Problem

The `--custom-path` parameter has inconsistent behavior between interactive and CLI modes:

1. **Interactive mode (WORKING)**: When `--custom-path` is provided, `runInteractive()` receives it via `options.customPath` and skips the scope prompt, treating the custom path as implicit local scope (lines 141-179 in interactive.js)

2. **CLI mode (BROKEN)**: When using CLI flags like `--copilot --custom-path=/path`, the flow is:
   - Line 88-90: `runInteractive()` correctly receives `customPath: options.customPath`
   - Line 100: `parseScope()` is called but doesn't know about customPath
   - Line 101-105: `executeInstallationLoop()` receives customPath BUT the scope might not align properly

3. **Root cause**: The interactive mode was fixed to skip scope prompt when customPath is present, but the CLI path doesn't have equivalent logic to ensure customPath is properly integrated with the parsed scope.

## Solution

**Selected Approach: Option A - Keep scope and customPath separate (minimal change)**

### Why this approach:
- ✅ Least breaking change - keeps existing architecture intact
- ✅ Already mostly working - interactive mode already uses this pattern
- ✅ Clear separation of concerns - scope ('global'|'local') and customPath are different concepts
- ✅ Easier to test - no changes to parseScope logic
- ✅ Consistent with current design - customPath is already passed as separate option

### Implementation steps:

1. **Verify CLI flow preserves customPath** (bin/install.js:100-106)
   - Ensure `parseScope(options)` returns correct scope when customPath is present
   - Verify `executeInstallationLoop()` receives `customPath: options.customPath`
   - Default scope should be 'local' when customPath is provided (similar to interactive mode)

2. **Add integration test** to verify:
   ```bash
   npx . --copilot --custom-path=/tmp/test
   # Should install to /tmp/test without asking for scope
   ```

3. **Document behavior**:
   - When `--custom-path` is provided, default scope is 'local'
   - User can explicitly override with `--global` or `--local` + `--custom-path`
   - The customPath IS the target directory, scope just determines subdirectory structure

### Alternative approaches considered:

**Option B: Make parseScope aware of customPath**
- ❌ More complex - parseScope would return object instead of string
- ❌ Breaking change - all parseScope consumers need updates
- ❌ Mixes concerns - scope selection and path customization are separate

**Option C: Treat customPath as a third scope type**
- ❌ Conceptually wrong - customPath isn't a scope, it's a PATH for a scope
- ❌ Major refactor - would require rewriting scope handling everywhere
- ❌ Loses flexibility - can't combine scope type with custom path

## Testing checklist

- [ ] Interactive mode with --custom-path skips scope prompt (already working)
- [ ] CLI mode with --custom-path preserves the path through installation
- [ ] CLI mode with --custom-path defaults to 'local' scope
- [ ] CLI mode with --custom-path --global works correctly
- [ ] CLI mode with --custom-path --local works correctly
- [ ] Check-updates with --custom-path only checks that path (already working per phase 06-03)
