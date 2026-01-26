# CLI Architecture Documentation

## Overview

The `get-shit-done-multi` installer supports two modes:
1. **CLI Mode** - Direct installation via command-line flags
2. **Interactive Mode** - Beautiful prompts using @clack/prompts

Both modes share the same underlying installation logic to ensure consistency.

## Architecture Pattern: Adapter → Core

### Core Principle

> "CLI mode and Interactive mode are ADAPTERS that gather parameters differently, then call the SAME installation core."

This pattern ensures:
- ✅ No duplicate code between modes
- ✅ Consistent behavior and messaging
- ✅ Single source of truth for installation logic
- ✅ Easy to test (test core once, use everywhere)
- ✅ Clean separation of concerns

### Flow Diagram

```
┌─────────────────┐         ┌──────────────────┐
│   CLI Mode      │         │ Interactive Mode │
│  (bin/install)  │         │  (interactive.js)│
└────────┬────────┘         └────────┬─────────┘
         │                           │
         │ Parse flags               │ Show prompts
         │ Extract params            │ Gather selections
         │                           │
         └───────────┬───────────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │  Installation Core    │
         │ (installation-core.js)│
         │                       │
         │  installPlatforms()   │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   Orchestrator        │
         │  (orchestrator.js)    │
         │                       │
         │  Per-platform install │
         └───────────────────────┘
```

## File Structure

```
bin/
├── install.js                      # Entry point - CLI mode adapter
└── lib/
    ├── cli/
    │   ├── installation-core.js    # SHARED: Core installation logic
    │   ├── interactive.js          # Interactive mode adapter
    │   ├── next-steps.js           # SHARED: Next steps display
    │   ├── logger.js               # SHARED: Colored output
    │   └── progress.js             # SHARED: Progress bars
    └── installer/
        └── orchestrator.js         # SHARED: Per-platform installation
```

## Key Functions

### `installPlatforms(platforms, scope, options)`
**Location:** `bin/lib/cli/installation-core.js`

The core installation function shared by both modes.

**Parameters:**
- `platforms: string[]` - Array of platforms to install (e.g., `['claude', 'copilot']`)
- `scope: string` - Installation scope: `'global'` or `'local'`
- `options: Object` - Additional options
  - `scriptDir: string` - Script directory path (required)
  - `verbose: boolean` - Show verbose output (default: false)
  - `useProgressBars: boolean` - Use progress bars (default: true)
  - `showBanner: boolean` - Show banner before installation (default: false)

**Returns:** `Promise<Object>` with installation results

**Usage:**
```javascript
import { installPlatforms } from './lib/cli/installation-core.js';

// CLI mode
await installPlatforms(['claude', 'copilot'], 'local', {
  scriptDir: __dirname,
  showBanner: true,
  verbose: options.verbose
});

// Interactive mode
await installPlatforms(platforms, scope, {
  scriptDir: getScriptDir(import.meta.url),
  showBanner: false // Already showed banner
});
```

### `showNextSteps(platforms, indent)`
**Location:** `bin/lib/cli/next-steps.js`

Displays next steps after installation with correct command prefix.

**Command Prefix Rules:**
- **Codex CLI (solo):** Uses `$gsd-` prefix
- **Claude Code / GitHub Copilot CLI:** Uses `/gsd-` prefix
- **Multiple platforms:** Uses `/gsd-` prefix (common denominator)

**Parameters:**
- `platforms: string[]` - Installed platforms
- `indent: number` - Number of spaces to indent (default: 0)

**Usage:**
```javascript
import { showNextSteps } from './lib/cli/next-steps.js';

showNextSteps(['claude']); // Shows /gsd- commands
showNextSteps(['codex']); // Shows $gsd- commands
showNextSteps(['claude', 'codex']); // Shows /gsd- commands
```

## Mode-Specific Responsibilities

### CLI Mode (bin/install.js)

**Responsibilities:**
1. Parse command-line flags with commander
2. Validate platform flags
3. Determine scope (--global or --local)
4. Call `installPlatforms()` with parameters

**Does NOT:**
- ❌ Implement installation logic
- ❌ Show next steps directly
- ❌ Handle progress bars directly

### Interactive Mode (bin/lib/cli/interactive.js)

**Responsibilities:**
1. Show banner and intro
2. Detect installed CLIs
3. Show warning if no CLIs detected
4. Prompt for platform selection (multiselect)
5. Prompt for scope selection
6. Call `installPlatforms()` with selections

**Does NOT:**
- ❌ Implement installation logic
- ❌ Show next steps directly
- ❌ Handle progress bars directly

## Design Rationale

### Why Adapters?

The adapter pattern provides:

1. **Mode Independence:** CLI and Interactive modes can evolve independently without affecting each other
2. **Single Source of Truth:** Installation logic lives in one place
3. **Testability:** Test the core once, trust both modes
4. **Maintainability:** Bug fixes in core automatically apply to both modes
5. **Extensibility:** New modes (e.g., API mode, web mode) just need new adapters

### Why Not Class-Based?

We use functional composition instead of class inheritance because:
- Simpler to understand and maintain
- No hidden state or complex hierarchies
- Functions are easier to test in isolation
- Aligns with Node.js module conventions

### Why Separate next-steps.js?

Command prefix handling (`/gsd-` vs `$gsd-`) is a cross-cutting concern that:
- Appears in multiple places (CLI messages, interactive messages)
- Has specific business rules (Codex solo uses $, others use /)
- Should be centralized to prevent drift

## Message Formatting Rules

### Indentation Standards

- **Section headers:** No indentation
- **Info messages:** 1 space indent (using `logger.info(msg, 1)`)
- **Nested info:** 2 space indent (using `logger.info(msg, 2)`)
- **Progress bars:** Managed by cli-progress (no manual indent)

### Command Prefix Handling

**Rule:** Command prefix depends on platform combination

```javascript
// Codex only
platforms = ['codex']
prefix = '$gsd-'
// Shows: "Run $gsd-help to see available commands"

// Claude or Copilot or both
platforms = ['claude']
prefix = '/gsd-'
// Shows: "Run /gsd-help to see available commands"

// Multiple platforms
platforms = ['claude', 'codex']
prefix = '/gsd-'  // Use common denominator
// Shows: "Run /gsd-help to see available commands"
```

### Success Messages

```javascript
// Single platform
logger.success(`${platform} installation complete`, 1);

// Multiple platforms
logger.success(`${names} installation complete`, 1);
```

### Next Steps Section

```javascript
logger.header('Next Steps');  // Shows header with underline
showNextSteps(platforms);     // Shows 3 command lines with correct prefix
```

## Testing Strategy

### Test the Core

Focus tests on `installation-core.js`:
- ✅ Correct platform installation
- ✅ Error handling (partial failures, total failures)
- ✅ Success/failure tracking
- ✅ Message output

### Test the Adapters Lightly

CLI and Interactive modes just need:
- ✅ Correct parameter extraction
- ✅ Correct core function calls
- ✅ Error propagation

### Integration Tests

End-to-end tests for both modes:
- ✅ CLI mode with various flags
- ✅ Interactive mode with different selections
- ✅ Both produce same results for same parameters

## Extension Points

### Adding a New Mode

To add a new mode (e.g., web-based installer):

1. Create new adapter (e.g., `bin/lib/web/server.js`)
2. Gather parameters via your method (web form, API, etc.)
3. Call `installPlatforms(platforms, scope, options)`
4. Done! All installation logic is reused.

Example:
```javascript
import { installPlatforms } from '../cli/installation-core.js';

async function handleWebRequest(req, res) {
  const { platforms, scope } = req.body;
  
  const results = await installPlatforms(platforms, scope, {
    scriptDir: __dirname,
    useProgressBars: false, // No TTY in web context
    showBanner: false
  });
  
  res.json(results);
}
```

### Adding New Installation Steps

To add a new step to installation:

1. Update `installation-core.js` (or `orchestrator.js` if platform-specific)
2. Both CLI and Interactive modes automatically use new step
3. Update tests for the core function

### Customizing Messages Per Mode

If a mode needs custom messages:

```javascript
// In adapter (e.g., interactive.js)
await installPlatforms(platforms, scope, {
  scriptDir,
  showBanner: false,
  // Add mode-specific flag
  customMessageCallback: (event, data) => {
    if (event === 'platform_complete') {
      p.log.success(`${data.platform} installed!`);
    }
  }
});
```

## Anti-Patterns to Avoid

### ❌ Duplicate Installation Logic

```javascript
// BAD: Duplicating logic in interactive.js
async function runInstallation(platforms, scope) {
  for (const platform of platforms) {
    // Installation logic here...
  }
}
```

### ❌ Mode-Specific Code in Core

```javascript
// BAD: Checking mode in core
function installPlatforms(platforms, scope, options) {
  if (options.isInteractive) {
    // Show interactive messages
  } else {
    // Show CLI messages
  }
}
```

### ❌ Tight Coupling Between Modes

```javascript
// BAD: Interactive mode calling CLI functions directly
import { main as cliMain } from '../install.js';
await cliMain(); // Don't do this!
```

## Summary

The CLI architecture follows a clean **Adapter → Core** pattern:

- **CLI mode** = Adapter that parses flags
- **Interactive mode** = Adapter that shows prompts
- **Installation core** = Shared logic both adapters call
- **Next steps** = Shared display logic with command prefix rules

This pattern ensures consistency, maintainability, and extensibility.
