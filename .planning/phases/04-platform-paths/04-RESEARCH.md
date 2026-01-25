# Phase 4: Platform Path Implementation - Research

**Researched:** 2025-01-24  
**Domain:** Cross-platform filesystem path resolution, validation, and installation  
**Confidence:** HIGH

## Summary

Phase 4 requires implementing cross-platform path resolution for Claude (`.claude/`), Copilot (`.github/` local, `~/.copilot/` global), and Codex (`.codex/` local only) installations. The codebase already has path utilities in `bin/lib/paths.js` that need updating for the new specification. 

The standard approach uses Node.js built-in `path` and `os` modules for all path operations, with `fs-extra` (already a dependency) providing robust directory creation and cleanup utilities. Cross-platform validation requires Windows-specific character checks and platform-specific path length limits. Permission errors should be caught and provide helpful suggestions to use `--local` instead of `--global`.

Current codebase uses `getConfigPaths()` utility but has hardcoded old Claude path (`~/Library/Application Support/Claude`) that must be replaced with `~/.claude/`. Adapters in `bin/lib/adapters/` receive paths from utilities and don't construct them internally, which is the correct pattern.

**Primary recommendation:** Use Node.js built-ins (`path`, `os`) for path operations, `fs-extra` for robust filesystem operations, platform-specific validation before mkdir, and catch EACCES/EPERM errors to provide helpful messages.

## Standard Stack

The established libraries/tools for cross-platform path handling in Node.js:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `path` (Node.js built-in) | - | Path construction, normalization | Cross-platform path separator handling, zero dependencies |
| `os` (Node.js built-in) | - | OS detection, home directory | Platform detection, tilde expansion via `os.homedir()` |
| `fs-extra` | 11.3.3 | Enhanced filesystem operations | Already in dependencies, provides `ensureDir`, `pathExists`, `remove` |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `fs.promises` (Node.js built-in) | - | Async filesystem operations | When fs-extra convenience methods aren't needed |
| `fs.constants` (Node.js built-in) | - | Permission constants (W_OK, R_OK) | For permission checking with `fs.access()` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| `fs-extra` | Native `fs.promises` only | Lose convenience methods like `ensureDir`, `pathExists`, `remove` - would need custom implementations |
| `os.homedir()` | Manual `~` expansion | Breaks on Windows where home is `%USERPROFILE%`, not portable |
| `path.join()` | String concatenation | Breaks on Windows (backslashes vs forward slashes), not cross-platform |

**Installation:**
```bash
# fs-extra already in package.json dependencies
npm install fs-extra@^11.3.3
```

## Architecture Patterns

### Recommended Project Structure
```
bin/lib/
├── paths.js              # Path resolution utilities (update for new spec)
├── path-validator.js     # NEW: Platform-specific path validation
├── conflict-resolver.js  # NEW: GSD content detection, conflict handling
└── adapters/
    ├── claude.js         # Uses paths from utilities
    ├── copilot.js        # Uses paths from utilities
    └── codex.js          # Uses paths from utilities
```

### Pattern 1: Centralized Path Resolution
**What:** Single source of truth for platform path mappings  
**When to use:** All installation code should call `getConfigPaths()`, never construct paths directly  
**Example:**
```javascript
// Source: Current codebase bin/lib/paths.js (needs update)
const path = require('path');
const os = require('os');

function getConfigPaths(platform, scope, configDir = null) {
  // Custom config directory overrides default
  if (configDir) {
    const base = path.resolve(configDir);
    return {
      claude: path.join(base, '.claude'),
      copilot: path.join(base, '.github'),
      codex: path.join(base, '.codex')
    }[platform];
  }
  
  // Standard paths
  const home = os.homedir();
  const cwd = process.cwd();
  
  const paths = {
    claude: {
      global: path.join(home, '.claude'),  // NEW PATH
      local: path.join(cwd, '.claude')
    },
    copilot: {
      global: path.join(home, '.copilot'),
      local: path.join(cwd, '.github')
    },
    codex: {
      global: null,  // NOT SUPPORTED
      local: path.join(cwd, '.codex')
    }
  };
  
  return paths[platform][scope];
}
```

### Pattern 2: Platform-Specific Path Validation
**What:** Validate paths before filesystem operations  
**When to use:** Before any `mkdir` or file write operation  
**Example:**
```javascript
// NEW module: bin/lib/path-validator.js
const path = require('path');

// Windows invalid characters: <>:"|?*
const WINDOWS_INVALID_CHARS = /[<>:"|?*\x00-\x1f]/;
const WINDOWS_RESERVED_NAMES = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;

function validatePath(targetPath) {
  const errors = [];
  
  // Platform-specific validation
  if (process.platform === 'win32') {
    // Check invalid characters
    if (WINDOWS_INVALID_CHARS.test(targetPath)) {
      errors.push('Path contains invalid Windows characters: <>:"|?*');
    }
    
    // Check reserved names
    const basename = path.basename(targetPath);
    if (WINDOWS_RESERVED_NAMES.test(basename)) {
      errors.push(`Path uses reserved Windows name: ${basename}`);
    }
    
    // Check path length (MAX_PATH = 260)
    if (targetPath.length > 260) {
      errors.push(`Path exceeds Windows MAX_PATH (260 chars): ${targetPath.length} chars`);
    }
  } else {
    // Unix: Check path length (4096 Linux, 1024 macOS - use conservative)
    const maxLength = process.platform === 'darwin' ? 1024 : 4096;
    if (targetPath.length > maxLength) {
      errors.push(`Path exceeds maximum length (${maxLength} chars): ${targetPath.length} chars`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
```

### Pattern 3: Permission-Aware Directory Creation
**What:** Check permissions before mkdir, provide helpful errors  
**When to use:** Creating global directories that may require permissions  
**Example:**
```javascript
const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

async function ensureInstallDir(targetPath, scope) {
  try {
    // Check parent directory write permissions first
    const parentDir = path.dirname(targetPath);
    if (await fse.pathExists(parentDir)) {
      await fs.promises.access(parentDir, fs.constants.W_OK);
    }
    
    // Create directory (idempotent)
    await fse.ensureDir(targetPath);
    return { success: true };
    
  } catch (error) {
    // Permission errors
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      const suggestion = scope === 'global' 
        ? 'Try using --local to install in current directory instead'
        : 'Check directory permissions';
      
      return {
        success: false,
        error: `Permission denied: ${targetPath}`,
        suggestion
      };
    }
    
    throw error; // Re-throw unexpected errors
  }
}
```

### Pattern 4: GSD Content Identification
**What:** Detect GSD-managed files vs user files for conflict resolution  
**When to use:** Re-installation or cleanup operations  
**Example:**
```javascript
// NEW module: bin/lib/conflict-resolver.js
const path = require('path');

const GSD_DIRECTORIES = ['commands', 'agents', 'skills', 'get-shit-done'];

function isGSDContent(filePath, installRoot) {
  const relativePath = path.relative(installRoot, filePath);
  const parts = relativePath.split(path.sep);
  
  // Check if file is in a GSD-managed directory
  return GSD_DIRECTORIES.includes(parts[0]);
}

async function detectConflicts(targetPath) {
  if (!await fse.pathExists(targetPath)) {
    return { hasConflicts: false, gsdFiles: [], userFiles: [] };
  }
  
  const files = await fse.readdir(targetPath, { recursive: true });
  const gsdFiles = [];
  const userFiles = [];
  
  for (const file of files) {
    const fullPath = path.join(targetPath, file);
    if (isGSDContent(fullPath, targetPath)) {
      gsdFiles.push(fullPath);
    } else {
      userFiles.push(fullPath);
    }
  }
  
  return {
    hasConflicts: userFiles.length > 0,
    gsdFiles,
    userFiles
  };
}
```

### Pattern 5: WSL Detection
**What:** Detect Windows Subsystem for Linux and treat as Linux  
**When to use:** Platform-specific path validation or error messages  
**Example:**
```javascript
const fs = require('fs');

function isWSL() {
  // Only check if platform reports as Linux
  if (process.platform !== 'linux') {
    return false;
  }
  
  // Method 1: Check /proc/version for "microsoft" or "WSL"
  try {
    const procVersion = fs.readFileSync('/proc/version', 'utf8').toLowerCase();
    if (procVersion.includes('microsoft') || procVersion.includes('wsl')) {
      return true;
    }
  } catch (e) {
    // /proc/version doesn't exist, not WSL
  }
  
  // Method 2: Check for /mnt/c (Windows C: drive mount)
  try {
    fs.statSync('/mnt/c');
    return true;
  } catch (e) {
    // /mnt/c doesn't exist
  }
  
  return false;
}

function getEffectivePlatform() {
  if (isWSL()) {
    return 'linux'; // Treat WSL as Linux, not Windows
  }
  return process.platform;
}
```

### Anti-Patterns to Avoid
- **Manual tilde expansion:** Don't use `filePath.replace('~', home)` - misses edge cases like `~user/path`. Use `os.homedir()` only at start of path.
- **String path concatenation:** Don't use `'path' + '/' + 'to' + '/' + 'file'` - breaks on Windows. Use `path.join()`.
- **Hardcoded path separators:** Don't use `/` or `\\` directly. Use `path.sep` or let `path.join()` handle it.
- **Try/catch for existence checks:** Don't use `try { fs.statSync(path) } catch { }` pattern. Use `fs-extra`'s `pathExists()` for cleaner code.
- **Synchronous filesystem operations in async context:** Prefer `fs-extra` async methods or `fs.promises` over sync variants when possible.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Directory creation with parents | Recursive mkdir with error handling | `fse.ensureDir(path)` | Handles race conditions, idempotent, better error messages |
| Path existence checking | `try/catch` around `fs.statSync()` | `fse.pathExists(path)` | Cleaner API, returns boolean, no exceptions |
| Recursive directory deletion | Custom recursive file walker | `fse.remove(path)` | Handles edge cases (symlinks, permissions, large directories) |
| File/directory copying | Custom copy logic | `fse.copy(src, dest)` | Preserves permissions, handles symlinks, recursive |
| Tilde expansion | Regex replacement `~` → home | `os.homedir()` + `path.join()` | Handles `~user` syntax, Windows `%USERPROFILE%` |
| Path normalization | Custom string manipulation | `path.normalize()`, `path.resolve()` | Handles `..`, `.`, platform separators correctly |
| Platform detection | `process.platform === 'linux'` only | WSL detection function | WSL reports as Linux but may need special handling |

**Key insight:** Cross-platform filesystem operations have many edge cases (permissions, symlinks, race conditions, path separators, reserved names). Node.js built-ins and `fs-extra` have battle-tested implementations.

## Common Pitfalls

### Pitfall 1: Tilde Not Expanded in path.join()
**What goes wrong:** `path.join('~', '.claude')` returns `'~/.claude'` (literal string), not expanded home directory  
**Why it happens:** Node.js `path` module doesn't expand `~` - it's a shell feature, not filesystem feature  
**How to avoid:** Always use `os.homedir()` explicitly: `path.join(os.homedir(), '.claude')`  
**Warning signs:** Paths with literal `~` character failing with ENOENT errors

### Pitfall 2: Windows Path Separator Assumptions
**What goes wrong:** Hardcoded `/` in paths breaks on Windows which uses `\`  
**Why it happens:** Development on Unix but deployment includes Windows  
**How to avoid:** Use `path.join()` for ALL path construction, never string concatenation  
**Warning signs:** Windows test failures with "cannot find path" errors

### Pitfall 3: Permission Errors Without Context
**What goes wrong:** `mkdir` fails with EACCES, user doesn't know why or how to fix  
**Why it happens:** Generic error handling doesn't provide helpful suggestions  
**How to avoid:** Catch EACCES/EPERM specifically, check scope (global vs local), suggest `--local` for global permission errors  
**Warning signs:** User confusion when global installation fails

### Pitfall 4: Race Conditions in Directory Creation
**What goes wrong:** Check if directory exists, then create it - but another process creates it between check and mkdir  
**Why it happens:** Time-of-check-time-of-use (TOCTOU) bug  
**How to avoid:** Use idempotent operations like `fse.ensureDir()` or `fs.mkdirSync(path, { recursive: true })` - both succeed if directory exists  
**Warning signs:** Intermittent EEXIST errors in concurrent installations

### Pitfall 5: Path Length on Windows
**What goes wrong:** Paths work on Unix (4096 char limit) but fail on Windows (260 char limit)  
**Why it happens:** MAX_PATH = 260 on Windows (includes drive letter and null terminator)  
**How to avoid:** Validate path length before operations, use shorter base paths, or enable long path support on Windows 10+  
**Warning signs:** ENAMETOOLONG errors on Windows only

### Pitfall 6: Reserved Names on Windows
**What goes wrong:** Creating files named `CON`, `PRN`, `AUX`, `NUL`, `COM1-9`, `LPT1-9` fails silently or creates device files  
**Why it happens:** These are reserved device names in Windows  
**How to avoid:** Validate against reserved names regex: `/^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i`  
**Warning signs:** Files disappear or create weird device files on Windows

### Pitfall 7: Mixing Sync and Async Operations
**What goes wrong:** Using `fs.mkdirSync()` in async function causes blocking, poor performance  
**Why it happens:** Easy to use sync APIs without thinking about event loop  
**How to avoid:** Prefer async versions (`fs.promises`, `fs-extra` promises) in async functions  
**Warning signs:** Installation hangs or is much slower than expected

## Code Examples

Verified patterns from official sources and current codebase:

### Path Resolution (Update Current Implementation)
```javascript
// Source: bin/lib/paths.js (current) - needs update for new spec
const path = require('path');
const os = require('os');

/**
 * Get configuration paths for a specific platform
 * @param {string} platform - 'claude', 'copilot', or 'codex'
 * @param {string} scope - 'global' or 'local'
 * @param {string} [configDir] - Optional custom config directory
 * @returns {string} Target installation path
 */
function getConfigPaths(platform, scope, configDir = null) {
  // Custom config directory overrides defaults
  if (configDir) {
    const base = path.resolve(configDir);
    const platformDirs = {
      claude: '.claude',
      copilot: '.github',
      codex: '.codex'
    };
    return path.join(base, platformDirs[platform]);
  }
  
  const home = os.homedir();
  const cwd = process.cwd();
  
  const pathMap = {
    claude: {
      global: path.join(home, '.claude'),      // UPDATED from ~/Library/Application Support/Claude
      local: path.join(cwd, '.claude')
    },
    copilot: {
      global: path.join(home, '.copilot'),
      local: path.join(cwd, '.github')
    },
    codex: {
      global: null,  // Codex doesn't support global installation
      local: path.join(cwd, '.codex')
    }
  };
  
  if (!pathMap[platform]) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  
  if (scope === 'global' && pathMap[platform].global === null) {
    throw new Error(`Global installation not supported for ${platform}`);
  }
  
  return pathMap[platform][scope];
}

module.exports = { getConfigPaths };
```

### Directory Creation with Error Handling
```javascript
// Source: Node.js fs-extra documentation
const fse = require('fs-extra');
const path = require('path');

async function createInstallationDirectories(basePath, platform) {
  const dirs = {
    agents: path.join(basePath, 'agents'),
    skills: path.join(basePath, 'skills'),
    gsd: path.join(basePath, 'get-shit-done')
  };
  
  try {
    // Create all directories (parallel)
    await Promise.all(
      Object.values(dirs).map(dir => fse.ensureDir(dir))
    );
    
    return { success: true, dirs };
    
  } catch (error) {
    if (error.code === 'EACCES' || error.code === 'EPERM') {
      return {
        success: false,
        error: 'Permission denied',
        path: basePath,
        suggestion: 'Try using --local flag to install in current directory'
      };
    }
    throw error;
  }
}
```

### Conflict Detection
```javascript
// Source: Design pattern from context
const fse = require('fs-extra');
const path = require('path');

const GSD_DIRECTORIES = ['commands', 'agents', 'skills', 'get-shit-done'];

async function analyzeInstallationConflicts(targetPath) {
  if (!await fse.pathExists(targetPath)) {
    return { 
      hasConflicts: false, 
      gsdFiles: [], 
      userFiles: [],
      canAutoClean: true 
    };
  }
  
  const entries = await fse.readdir(targetPath);
  const gsdFiles = [];
  const userFiles = [];
  
  for (const entry of entries) {
    const fullPath = path.join(targetPath, entry);
    const stat = await fse.stat(fullPath);
    
    if (GSD_DIRECTORIES.includes(entry)) {
      // GSD directory - can be auto-cleaned
      if (stat.isDirectory()) {
        const files = await fse.readdir(fullPath, { recursive: true });
        gsdFiles.push(...files.map(f => path.join(fullPath, f)));
      } else {
        gsdFiles.push(fullPath);
      }
    } else {
      // User file - needs confirmation
      userFiles.push(fullPath);
    }
  }
  
  return {
    hasConflicts: userFiles.length > 0,
    gsdFiles,
    userFiles,
    canAutoClean: userFiles.length === 0
  };
}
```

### Old Path Migration Detection
```javascript
// Source: Design pattern from context
const fse = require('fs-extra');
const path = require('path');
const os = require('os');

async function detectOldClaudePath() {
  const oldPath = path.join(os.homedir(), 'Library', 'Application Support', 'Claude');
  
  if (await fse.pathExists(oldPath)) {
    return {
      exists: true,
      path: oldPath,
      warning: `⚠️  Old installation detected at ${oldPath}\n` +
               `   Manual cleanup recommended to avoid conflicts.\n` +
               `   New installation will use: ~/.claude/`
    };
  }
  
  return { exists: false };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual `~` string replacement | `os.homedir()` + `path.join()` | Node.js v0.10+ (2013) | Cross-platform support, handles Windows %USERPROFILE% |
| `fs.mkdirSync` without recursive | `fs.mkdirSync(path, {recursive: true})` | Node.js v10.12.0 (2018) | No need for manual parent directory creation |
| Try/catch for path exists | `fs.promises.access()` or `fse.pathExists()` | fs.promises Node.js v10.0.0 (2018) | Cleaner API, no exceptions for control flow |
| `__dirname + '/' + file` | `path.join(__dirname, file)` | Always (best practice) | Cross-platform path separators |
| Sync filesystem operations | Async `fs.promises` or `fs-extra` | Node.js v10.0.0+ fs.promises | Non-blocking I/O, better performance |

**Deprecated/outdated:**
- `~/Library/Application Support/Claude` for Claude global path → `~/.claude/` (Phase 4 breaking change)
- String concatenation for paths → `path.join()`
- Manual recursive directory creation → `{ recursive: true }` option or `fse.ensureDir()`
- `fs.exists()` → Deprecated in Node.js v1.0.0, use `fs.access()` or `fse.pathExists()`

## Open Questions

Things that couldn't be fully resolved:

1. **Windows Long Path Support**
   - What we know: Windows 10+ supports paths > 260 chars with registry setting or manifest
   - What's unclear: Should we detect long path support and suggest enabling it?
   - Recommendation: Validate against 260 char limit, show error with link to enable long paths if needed

2. **Permission Escalation Strategy**
   - What we know: Global installation may fail with EACCES
   - What's unclear: Should we suggest `sudo` on Unix or show admin instructions on Windows?
   - Recommendation: Never auto-escalate, suggest `--local` flag instead (safer, doesn't require privileges)

3. **Partial Installation State Persistence**
   - What we know: Installation can fail mid-way leaving partial state
   - What's unclear: How to reliably detect incomplete vs. valid installation?
   - Recommendation: Check for presence of critical files (SKILL.md, workflows/, agents/) to detect completeness

4. **Symlink Handling in Conflict Detection**
   - What we know: User might have symlinks in installation directories
   - What's unclear: Should we follow symlinks or treat them as regular files?
   - Recommendation: Don't follow symlinks (use `lstat` not `stat`) to avoid traversing outside installation directory

5. **Case-Sensitivity Differences**
   - What we know: Windows is case-insensitive, Unix is case-sensitive
   - What's unclear: How to handle conflicts like `Get-Shit-Done/` vs `get-shit-done/`?
   - Recommendation: Use lowercase directory names consistently (already done), warn if casing differs

## Sources

### Primary (HIGH confidence)
- Node.js v20.20.0 Documentation - `path` module: https://nodejs.org/dist/latest-v20.x/docs/api/path.html
- Node.js v20.20.0 Documentation - `os` module: https://nodejs.org/dist/latest-v20.x/docs/api/os.html
- Node.js v20.20.0 Documentation - `fs` module: https://nodejs.org/dist/latest-v20.x/docs/api/fs.html
- fs-extra v11.3.3 Documentation: https://github.com/jprichardson/node-fs-extra
- Current codebase analysis: `bin/lib/paths.js`, `bin/lib/adapters/`

### Secondary (MEDIUM confidence)
- Windows MAX_PATH documentation: MSDN documentation on path length limits
- POSIX PATH_MAX limits: Linux kernel documentation (4096 chars)
- WSL detection patterns: Microsoft WSL documentation and community practices

### Tertiary (LOW confidence - noted from training data, not verified)
- Windows reserved device names (CON, PRN, etc.) - should verify with MSDN docs
- Best practices for permission checking order (parent dir access before mkdir)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Node.js built-ins are authoritative, fs-extra already in dependencies
- Architecture: HIGH - Current codebase patterns verified, adapters follow correct pattern
- Pitfalls: HIGH - Based on Node.js documentation and real codebase inspection

**Research date:** 2025-01-24  
**Valid until:** 60 days (Node.js v20 is LTS, stable until 2026-04-30)

**Key Findings:**
1. Current `bin/lib/paths.js` has hardcoded old Claude path that must be updated
2. `fs-extra` already in dependencies provides all needed utilities (`ensureDir`, `pathExists`, `remove`)
3. Node.js v20 has stable `fs.promises` API with `{ recursive: true }` for mkdir
4. Platform detection needs WSL handling (Linux + check /proc/version or /mnt/c)
5. Windows validation requires checking invalid chars, reserved names, and 260 char limit
6. Permission errors should suggest `--local` flag, not privilege escalation
7. GSD content is identifiable by directory names: `commands/`, `agents/`, `skills/`, `get-shit-done/`
8. Current codebase has test infrastructure (Jest) and test helpers in `bin/lib/test-helpers/`
