# Phase 1: Foundation — Installation Infrastructure - Research

**Researched:** 2026-01-19
**Domain:** Node.js CLI installation and cross-platform file system operations
**Confidence:** HIGH

## Summary

This research investigated best practices for building a reliable, cross-platform CLI installer using only Node.js built-in modules. The investigation covered path handling, file system operations, home directory resolution, version upgrade strategies, CLI auto-detection patterns, and common installer pitfalls.

**Key findings:**
- Node.js built-in modules (`path`, `fs`, `os`) provide complete support for cross-platform installation without external dependencies
- The `path` module handles all platform-specific path separators and conventions automatically
- `os.homedir()` is the canonical cross-platform method for home directory resolution since Node.js v4.0.0
- Atomic file operations require manual implementation using write-to-temp-then-rename pattern
- Version upgrades must preserve user data through non-destructive directory operations
- CLI config directories follow predictable patterns across platforms (`~/.config/` on POSIX, `%APPDATA%` equivalent on Windows)

**Primary recommendation:** Use Node.js built-ins exclusively with the write-to-temp-then-rename pattern for atomic operations, `fs.mkdir({recursive: true})` for safe directory creation, and explicit user confirmation before any destructive operations.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `path` | Node.js built-in | Cross-platform path handling | Official Node.js module, handles Windows/POSIX differences automatically |
| `fs` | Node.js built-in | File system operations | Core module with sync/async/promise APIs for all file operations |
| `os` | Node.js built-in | System information and paths | Provides `os.homedir()` and platform detection |
| `readline` | Node.js built-in | Interactive CLI prompts | Standard for user confirmation and interactive input |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `process` | Node.js built-in | Environment variables, args | Access `process.argv`, `process.env`, `process.platform` |
| `fs/promises` | Node.js v10+ | Promise-based file operations | Modern async/await file operations (preferred over callbacks) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Built-ins only | `fs-extra` | Adds helper methods but violates zero-dependency requirement |
| Built-ins only | `write-file-atomic` | Guarantees atomicity but adds dependency |
| Built-ins only | `jsonfile` | Simpler JSON handling but adds dependency |

**Installation:**
```bash
# No installation needed - all built-in Node.js modules
```

## Architecture Patterns

### Recommended Project Structure
```
bin/
├── install.js           # Main installer entry point
└── lib/
    ├── paths.js         # Path resolution and home directory detection
    ├── file-ops.js      # Atomic file operations
    ├── detect.js        # CLI installation detection
    └── upgrade.js       # Version upgrade and migration logic
```

### Pattern 1: Cross-Platform Path Handling
**What:** Always use `path` module methods, never string concatenation
**When to use:** Any file path construction or manipulation
**Example:**
```javascript
// Source: https://nodejs.org/api/path.html
const path = require('path');
const os = require('os');

// CORRECT: Platform-agnostic
const configPath = path.join(os.homedir(), '.codex', 'skills', 'get-shit-done');

// INCORRECT: Breaks on Windows
const configPath = os.homedir() + '/.codex/skills/get-shit-done';

// Expand ~ in user-provided paths
function expandTilde(filePath) {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

// Normalize paths for comparison
const normalized = path.normalize(userInputPath);
```

### Pattern 2: Atomic File Operations
**What:** Write to temporary file, then rename for atomicity
**When to use:** Any settings or critical file modification
**Example:**
```javascript
// Source: Web research - atomic write pattern
const fs = require('fs').promises;
const path = require('path');

async function atomicWrite(filePath, data) {
  const dir = path.dirname(filePath);
  const tmpFile = path.join(dir, `.${path.basename(filePath)}.tmp`);
  
  await fs.writeFile(tmpFile, data, 'utf8');
  await fs.rename(tmpFile, filePath); // Atomic on POSIX systems
}

async function safeJsonUpdate(settingsPath, updater) {
  let data;
  try {
    const file = await fs.readFile(settingsPath, 'utf8');
    data = JSON.parse(file);
  } catch (e) {
    data = {}; // Initialize with defaults if missing
  }
  
  const updated = updater(data);
  await atomicWrite(settingsPath, JSON.stringify(updated, null, 2) + '\n');
}
```

### Pattern 3: Safe Directory Creation
**What:** Use `{recursive: true}` for idempotent directory creation
**When to use:** Creating installation directories
**Example:**
```javascript
// Source: https://nodejs.org/api/fs.html
const fs = require('fs').promises;

// Creates parent directories as needed, no error if exists
await fs.mkdir('/path/to/nested/dir', { recursive: true });

// Sync variant for installation scripts
const fs = require('fs');
fs.mkdirSync('/path/to/nested/dir', { recursive: true });
```

### Pattern 4: Home Directory Resolution
**What:** Use `os.homedir()` for cross-platform home directory
**When to use:** Resolving user-specific configuration paths
**Example:**
```javascript
// Source: https://nodejs.org/api/os.html
const os = require('os');
const path = require('path');

// Cross-platform home directory
const home = os.homedir();
// macOS/Linux: /Users/username or /home/username
// Windows: C:\Users\username

// Build config paths
const claudeConfig = path.join(home, '.claude');
const codexConfig = path.join(home, '.codex');
```

### Pattern 5: JSON Settings with Error Handling
**What:** Always wrap JSON.parse in try-catch, provide defaults
**When to use:** Reading/writing settings files
**Example:**
```javascript
// Source: Web research - JSON error handling
function readSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      console.warn(`Corrupt settings file: ${settingsPath}`);
      return {}; // Return defaults on parse error
    }
  }
  return {}; // File doesn't exist
}

function writeSettings(settingsPath, settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}
```

### Pattern 6: CLI Detection Strategy
**What:** Check standard config directories for each CLI
**When to use:** Auto-detecting which CLIs are installed
**Example:**
```javascript
// Source: Web research - CLI config locations
const fs = require('fs');
const path = require('path');
const os = require('os');

function detectInstalledCLIs() {
  const home = os.homedir();
  const detected = {};
  
  // Claude Code
  const claudePaths = [
    path.join(home, '.claude'),
    path.join(home, '.config', 'claude')
  ];
  detected.claude = claudePaths.some(p => fs.existsSync(p));
  
  // GitHub Copilot CLI
  const copilotPaths = [
    path.join(home, '.config', 'github-copilot-cli')
  ];
  detected.copilot = copilotPaths.some(p => fs.existsSync(p));
  
  // Codex CLI
  const codexPaths = [
    path.join(home, '.codex'),
    path.join(home, '.config', 'codex')
  ];
  detected.codex = codexPaths.some(p => fs.existsSync(p));
  
  return detected;
}
```

### Anti-Patterns to Avoid
- **String concatenation for paths:** Use `path.join()` instead
- **Hardcoded path separators:** Never use `/` or `\\` directly
- **Manual tilde expansion in Node.js:** Node.js doesn't expand `~` like shells do
- **Destructive defaults:** Always prompt before overwriting user data
- **Synchronous operations in production:** Use `fs/promises` for non-blocking I/O
- **Ignoring JSON parse errors:** Always wrap `JSON.parse()` in try-catch

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File locking | Custom mutex system | `proper-lockfile` package OR document single-process constraint | Multi-process file access requires OS-level coordination |
| Atomic writes | `fs.writeFile` directly | Write-to-temp-then-rename pattern | Prevents corruption on crash/interrupt |
| JSON schema validation | Manual validation | `ajv` OR manual checks | Complex validation logic error-prone |
| Deep directory copy | Recursive manual implementation | `fs.cp` (Node 16.7+) with `{recursive: true}` | Built-in handles edge cases |
| Path traversal security | String checks | `path.resolve()` + startsWith check | Prevents `../` attacks |

**Key insight:** File system operations have subtle race conditions and platform differences. Use proven patterns and built-in methods that handle edge cases.

## Common Pitfalls

### Pitfall 1: Destructive Clean Install
**What goes wrong:** Deleting entire installation directory removes user data/customizations
**Why it happens:** Attempting to prevent "orphaned files" from old versions
**How to avoid:** 
- Preserve user-created files in `.planning/` and other data directories
- Only remove known GSD files
- Back up before major upgrades
**Warning signs:** 
- User reports lost project data after upgrade
- Complaints about "starting from scratch"

### Pitfall 2: Path Separator Assumptions
**What goes wrong:** Installer works on Mac but breaks on Windows
**Why it happens:** Using `/` in string concatenation or hardcoded paths
**How to avoid:**
- Always use `path.join()`, `path.resolve()`, `path.dirname()`
- Use `path.sep` and `path.delimiter` for platform-specific needs
- Test on Windows, not just POSIX systems
**Warning signs:**
- Error messages containing mixed separators like `C:\Users\user/.codex`
- "File not found" errors only on Windows

### Pitfall 3: Tilde Not Expanded
**What goes wrong:** Paths like `~/.codex` treated as literal, creating `~` directory in cwd
**Why it happens:** Node.js doesn't expand `~` like shells do
**How to avoid:**
- Always use `os.homedir()` instead of `~`
- Implement `expandTilde()` helper for user-provided paths
- Document that shell expansion doesn't apply
**Warning signs:**
- Users report weird `~` directory created
- Config files not found despite "correct" path

### Pitfall 4: Race Conditions in File Operations
**What goes wrong:** Check-then-act patterns fail when filesystem changes between calls
**Why it happens:** `if (exists) { write() }` has gap between check and write
**How to avoid:**
- Use atomic operations (write-to-temp-then-rename)
- Use `{ recursive: true }` which is idempotent
- Don't check for existence before `mkdir` with recursive flag
**Warning signs:**
- Intermittent failures in CI/CD
- "File already exists" errors that "shouldn't happen"

### Pitfall 5: JSON Parse Errors Crash Installer
**What goes wrong:** Corrupt settings file crashes entire installation
**Why it happens:** Not wrapping `JSON.parse()` in try-catch
**How to avoid:**
- Always try-catch around `JSON.parse()`
- Provide sensible defaults on parse failure
- Optionally back up corrupt file before overwriting
**Warning signs:**
- Installer crashes with "Unexpected token" or "Unexpected end of JSON"
- Can't reinstall after failed installation

### Pitfall 6: Windows Path Length Limits
**What goes wrong:** Long nested paths fail on Windows (MAX_PATH = 260 characters)
**Why it happens:** Windows has stricter path length limits than POSIX systems
**How to avoid:**
- Keep directory nesting shallow
- Use shorter directory names
- Consider UNC path prefix `\\?\` for long paths (advanced)
**Warning signs:**
- Failures only on Windows with deeply nested structures
- "Path too long" errors

### Pitfall 7: Permissions Not Verified
**What goes wrong:** Installation fails silently or with cryptic errors
**Why it happens:** Not checking write permissions before attempting operations
**How to avoid:**
- Test write access to target directory early
- Provide clear error messages about permission issues
- Suggest solutions (run as admin, change directory)
**Warning signs:**
- "EACCES" or "EPERM" errors
- Silent failures with no visible output

## Code Examples

Verified patterns from official sources:

### Cross-Platform Config Path Resolution
```javascript
// Source: https://nodejs.org/api/os.html + https://nodejs.org/api/path.html
const os = require('os');
const path = require('path');

function getConfigPaths(cli) {
  const home = os.homedir();
  const platform = os.platform();
  
  const configs = {
    claude: {
      global: path.join(home, '.claude'),
      local: path.join(process.cwd(), '.claude')
    },
    copilot: {
      global: path.join(home, '.config', 'github-copilot-cli'),
      local: path.join(process.cwd(), '.github')
    },
    codex: {
      global: path.join(home, '.codex'),
      local: path.join(process.cwd(), '.codex')
    }
  };
  
  return configs[cli] || null;
}
```

### Safe Recursive Copy with Path Rewriting
```javascript
// Source: Current installer + https://nodejs.org/api/fs.html
const fs = require('fs');
const path = require('path');

function copyWithPathReplacement(srcDir, destDir, pathReplacer) {
  // Clean install: remove existing to prevent orphaned files
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
  }
  fs.mkdirSync(destDir, { recursive: true });
  
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    
    if (entry.isDirectory()) {
      copyWithPathReplacement(srcPath, destPath, pathReplacer);
    } else if (entry.name.endsWith('.md')) {
      // Rewrite paths in markdown files for alternate install locations
      let content = fs.readFileSync(srcPath, 'utf8');
      content = pathReplacer(content);
      fs.writeFileSync(destPath, content);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}
```

### Interactive Confirmation Pattern
```javascript
// Source: Current installer + Node.js readline docs
const readline = require('readline');

function promptUser(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

// Usage
const response = await promptUser('Overwrite existing installation? (y/N) ');
if (response !== 'y' && response !== 'yes') {
  console.log('Installation cancelled.');
  process.exit(0);
}
```

### Version Upgrade Pattern
```javascript
// Source: Web research + current installer
const fs = require('fs');
const path = require('path');

function upgradeInstallation(installDir) {
  // Preserve user data directories
  const preserveDirs = ['.planning', 'user-data'];
  const backups = {};
  
  // Backup user data
  for (const dir of preserveDirs) {
    const fullPath = path.join(installDir, dir);
    if (fs.existsSync(fullPath)) {
      const backupPath = `${fullPath}.backup-${Date.now()}`;
      fs.renameSync(fullPath, backupPath);
      backups[dir] = backupPath;
    }
  }
  
  // Perform installation (clean install)
  // ... install new files ...
  
  // Restore user data
  for (const [dir, backupPath] of Object.entries(backups)) {
    const targetPath = path.join(installDir, dir);
    if (fs.existsSync(backupPath)) {
      fs.renameSync(backupPath, targetPath);
    }
  }
  
  // Clean up orphaned files from old versions
  const orphanedFiles = [
    'hooks/gsd-notify.sh', // Example: removed in v1.6.x
  ];
  
  for (const relPath of orphanedFiles) {
    const fullPath = path.join(installDir, relPath);
    if (fs.existsSync(fullPath)) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    }
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Callback-based `fs` | `fs/promises` with async/await | Node.js v10 (2018) | Cleaner async code, better error handling |
| Manual directory recursion | `fs.mkdir({recursive: true})` | Node.js v10.12 (2018) | Idempotent, simpler, safer |
| `fs.exists()` then create | Direct create with recursive flag | Node.js v10+ | Eliminates race conditions |
| Deep copying with manual recursion | `fs.cp(src, dest, {recursive: true})` | Node.js v16.7 (2021) | Built-in handles edge cases |
| Manual home directory env check | `os.homedir()` | Node.js v4+ (2015) | Cross-platform standard |

**Deprecated/outdated:**
- `fs.exists()`: Deprecated, use direct operations with error handling instead
- Callback-based `fs` methods: Still work but promise-based preferred for new code
- `process.env.HOME` for home directory: Use `os.homedir()` which handles all platforms

## Open Questions

Things that couldn't be fully resolved:

1. **Codex CLI Exact Config Directory**
   - What we know: Likely `~/.codex/` or `~/.config/codex/` based on ecosystem patterns
   - What's unclear: Codex CLI documentation doesn't specify exact location
   - Recommendation: Check both locations, prioritize `~/.codex/` as primary

2. **Windows Long Path Handling**
   - What we know: Windows has 260-char limit, can use `\\?\` prefix to bypass
   - What's unclear: Whether this is necessary for typical GSD installations
   - Recommendation: Keep paths short, document if issues arise

3. **File Locking for Multi-Process Safety**
   - What we know: Zero-dependency constraint prevents using `proper-lockfile`
   - What's unclear: Whether multi-process installs are realistic scenario
   - Recommendation: Document as single-process only, add locking if needed later

## Sources

### Primary (HIGH confidence)
- Node.js Official Documentation - fs module: https://nodejs.org/api/fs.html
- Node.js Official Documentation - path module: https://nodejs.org/api/path.html
- Node.js Official Documentation - os module: https://nodejs.org/api/os.html

### Secondary (MEDIUM confidence)
- Node.js cross-platform path handling guide (verified with official docs)
- Node.js home directory resolution patterns (verified with official docs)
- Node.js file system atomic operations research (community patterns verified against official docs)
- CLI auto-detection patterns (verified against Claude/Copilot documentation)

### Tertiary (LOW confidence)
- Codex CLI exact config directory location (not officially documented)
- Windows long path handling necessity (environment-dependent)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All Node.js built-ins, official documentation verified
- Architecture: HIGH - Patterns verified against official docs and current working implementation
- Pitfalls: MEDIUM - Based on web research and common Node.js issues, not all tested in this specific context
- CLI detection: MEDIUM - Based on documentation for Claude/Copilot, Codex location unconfirmed
- Version upgrade: MEDIUM - Pattern is sound but not yet implemented/tested for GSD

**Research date:** 2026-01-19
**Valid until:** 2026-02-19 (30 days - Node.js APIs are stable)
**Node.js version researched against:** v25.3.0 (current) and LTS practices
