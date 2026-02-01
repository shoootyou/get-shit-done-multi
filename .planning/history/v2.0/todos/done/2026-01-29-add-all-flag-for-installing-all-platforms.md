---
created: 2026-01-29T13:13
title: Add --all flag for installing all platforms
area: tooling
priority: medium
files:
  - bin/install.js:45-48
  - bin/lib/cli/flag-parser.js:14-32
---

## Problem

Currently, users must specify each platform individually:
```bash
npx get-shit-done-multi --claude --copilot --codex --local
```

This is verbose and error-prone when wanting to install to all platforms.

There's no shorthand to install to all available platforms at once.

## Solution

Add `--all` flag that acts as a shorthand for selecting all platforms.

### Recommended Implementation

Use `parsePlatformFlags()` in `flag-parser.js` (as user suggested - this is the right place!):

**Step 1: Add flag to install.js**
```js
// Platform flags
program
  .option('--claude', 'Install to Claude Code')
  .option('--copilot', 'Install to GitHub Copilot CLI')
  .option('--codex', 'Install to Codex CLI')
  .option('--all', 'Install to all platforms (claude, copilot, codex)');
```

**Step 2: Update parsePlatformFlags() in flag-parser.js**
```js
export function parsePlatformFlags(options, adapterRegistry) {
  // Handle --all flag (shorthand for all platforms)
  if (options.all) {
    return adapterRegistry.getSupportedPlatforms();
  }
  
  // Individual platform selection
  const platforms = [];
  if (options.claude) platforms.push('claude');
  if (options.copilot) platforms.push('copilot');
  if (options.codex) platforms.push('codex');
  
  // Validate platforms (already done below)
  const supported = adapterRegistry.getSupportedPlatforms();
  for (const platform of platforms) {
    if (!supported.includes(platform)) {
      throw new InstallError(
        `Unknown platform: ${platform}. Supported: ${supported.join(', ')}`,
        EXIT_CODES.INVALID_ARGS
      );
    }
  }
  
  return platforms;
}
```

**Step 3: Add validation**

Check for conflicting flags:
```js
// After "if (options.all)" check
if (options.all && (options.claude || options.copilot || options.codex)) {
  throw new InstallError(
    'Cannot use --all with individual platform flags (--claude, --copilot, --codex)',
    EXIT_CODES.INVALID_ARGS
  );
}
```

**Step 4: Update help text**

Update `install.js` help text to mention `--all`:
```
Run without flags for interactive mode with beautiful prompts.
Use --all to install to all platforms at once.
```

### Benefits

1. **Shorter command**: `npx get-shit-done-multi --all --local`
2. **Future-proof**: If new platforms are added, `--all` automatically includes them
3. **Clear intent**: Obvious what the user wants to do
4. **Consistent with existing patterns**: Uses same validation logic

### Testing Scenarios

Test in `/tmp` isolated directories:

1. `--all --local` → Should install claude, copilot, codex to .claude/, .github/, .codex/
2. `--all --global` → Should install to ~/.claude/, ~/.copilot/, ~/.codex/
3. `--all --claude` → Should error: "Cannot use --all with individual platform flags"
4. `--all --custom-path /tmp/test` → Should error: "Cannot use --custom-path with multiple platforms" (existing validation)

### Alternative Considered

Could add `--all` handling in `install.js` directly, but `parsePlatformFlags()` is the right abstraction:
- Single responsibility: flag parsing logic in one place
- Testable: Can unit test the function
- Maintainable: All platform selection logic centralized

## Notes

- User suggestion to use `parsePlatformFlags()` is correct ✓
- This is the cleanest implementation
- Maintains existing validation (custom-path, etc.)
- No breaking changes to existing functionality
