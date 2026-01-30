---
created: 2026-01-27T10:38
title: Standardize warning messages to use logger.warn with proper indentation
area: tooling
files:
  - bin/lib/validation/pre-install-checks.js:69
  - bin/lib/cli/logger.js:41-44
---

## Problem

After first installation, the system displays a raw console.warn message:
```
console.warn('Warning: Could not check disk space (requires Node.js 19+)');
```

This appears in `pre-install-checks.js:69` and doesn't use the centralized logger.warn function, resulting in:
- Inconsistent formatting (no ⚠ symbol, no indentation)
- Not aligned with other warning messages in the codebase
- Breaks the visual hierarchy of the CLI output

The logger module provides a `warn(message, indent = 0)` function that:
- Adds yellow ⚠ symbol
- Supports configurable indentation
- Maintains consistent formatting across the CLI

## Solution

1. Import logger in pre-install-checks.js: `import * as logger from '../cli/logger.js';`
2. Replace console.warn with: `logger.warn('Could not check disk space (requires Node.js 19+)', 2);`
3. Verify indentation matches other warning messages in the installation flow
4. Test with Node.js < 19 to ensure warning displays correctly
5. Search for any other console.warn usages in bin/ directory and standardize

Expected output format:
```
  ⚠ Could not check disk space (requires Node.js 19+)
```
