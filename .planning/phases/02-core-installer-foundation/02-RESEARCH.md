# Phase 2: Core Installer Foundation - Research

**Researched:** 2025-01-26
**Domain:** Node.js CLI installer with NPX support
**Confidence:** HIGH

## Summary

Researched Node.js CLI installer patterns for building a tool that runs via `npx` without pre-installation, copies template files to user directories, performs simple variable replacement, and provides progress feedback. The project already has appropriate dependencies (fs-extra, commander, chalk) and uses ESM modules.

The standard approach uses:
- **fs-extra** for file operations (recursive copy, directory creation, permission preservation)
- **commander** for CLI argument parsing with auto-generated help
- **cli-progress** for progress bars (needs to be added as dependency)
- **Built-in Node.js modules** for path security and template rendering

Key findings: Don't hand-roll file copying (fs-extra handles edge cases), path validation (use path.normalize + validation), or CLI parsing (commander is standard). For simple template variable replacement, string.replace() with regex is more appropriate than full templating engines like Handlebars. Progress bars require careful cleanup on errors to avoid terminal state issues.

**Primary recommendation:** Use fs-extra.copy() for recursive copying with permission preservation, commander for CLI parsing, cli-progress for progress bars, and simple string replacement for template rendering. Structure code with clear separation between IO, rendering, path resolution, and CLI concerns.

## Standard Stack

The established libraries/tools for Node.js CLI installers:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fs-extra | 11.3.3 | File system operations | Provides recursive copy, ensureDir, and other utilities missing from native fs. Promise-based, battle-tested (67M+ weekly downloads) |
| commander | 14.0.2 | CLI argument parsing | Most popular CLI framework for Node.js (19M+ weekly downloads). Auto-generates help, supports options/flags, simple API |
| cli-progress | 3.12.0 | Progress bars | Dedicated progress bar library with multi-bar support (5.5M weekly downloads). Better than spinners (ora) for % progress |
| chalk | 5.6.2 | Terminal colors | Already in project. Standard for colored console output (116M+ weekly downloads) |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js path | Built-in | Path manipulation | Always use for cross-platform path handling. Prevents Windows/Unix separator issues |
| Node.js os | Built-in | OS information | Get home directory (os.homedir()), platform detection, EOL characters |
| Node.js child_process | Built-in | Execute shell commands | Disk space checking (df on Unix, PowerShell on Windows) |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| fs-extra | Native fs.promises | fs.promises lacks recursive copy, move, and ensure operations. Would require manual implementation with edge case handling |
| commander | yargs | yargs has more features but heavier and more complex API. Commander is simpler and sufficient |
| commander | minimist | minimist too basic, no auto-help generation, manual validation required |
| cli-progress | ora | ora provides spinners (indeterminate), not progress bars with percentages |
| String replace | Handlebars/Mustache | Full templating engines are overkill for simple variable replacement. Adds dependencies and complexity |

**Installation:**
```bash
npm install cli-progress --save
# fs-extra, commander, chalk already installed
```

## Architecture Patterns

### Recommended Project Structure

```
bin/
  install.js                 # Entry point with shebang #!/usr/bin/env node
  lib/
    io/
      file-operations.js     # fs-extra wrappers for copy, ensure
    rendering/
      template-renderer.js   # String replacement logic
    paths/
      path-resolver.js       # Path validation & normalization
    cli/
      progress.js            # Progress bar helpers
      logger.js              # Logging utilities with chalk
    errors/
      install-error.js       # Custom error types with exit codes
```

**Separation of Concerns:**
- **Entry point:** CLI parsing, orchestration only
- **IO layer:** Encapsulates file system operations
- **Rendering:** Template processing isolated
- **Paths:** Security and validation centralized
- **CLI:** UI concerns (progress, logging) separate
- **Errors:** Structured error handling with exit codes

### Pattern 1: NPX Entry Point (ESM)

**What:** Executable Node.js script that works with `npx` without pre-installation

**When to use:** Always for CLI tools meant to run via npx

**Example:**
```javascript
#!/usr/bin/env node
// Source: Node.js best practices + npm documentation

// ESM modules require explicit .js extensions
import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get script directory in ESM (replaces __dirname)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Wrap in async main for proper error handling
async function main() {
  const program = new Command();
  
  program
    .name('get-shit-done-multi')
    .version('2.0.0')
    .description('Install get-shit-done skills')
    .requiredOption('--claude', 'Install for Claude Code')
    .option('--global', 'Install globally to ~/.claude/')
    .option('--local', 'Install locally to .claude/ (default)')
    .option('--verbose', 'Show detailed progress')
    .parse(process.argv);

  const options = program.opts();
  
  // Installation logic here
  await installProcess(options);
}

// Execute with proper error handling
main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
```

**Key points:**
- Shebang `#!/usr/bin/env node` required (cross-platform)
- ESM requires `.js` extensions in imports
- Use `import.meta.url` to get script location (not `__dirname`)
- Wrap in async function for top-level await support
- Proper error handling at top level

### Pattern 2: File Operations with fs-extra

**What:** Recursive directory copy with permission preservation and filtering

**When to use:** Copying template directories to user installation locations

**Example:**
```javascript
// Source: fs-extra documentation
import fs from 'fs-extra';
import path from 'path';

export async function copyDirectory(source, dest, options = {}) {
  // Ensure destination directory exists
  await fs.ensureDir(dest);
  
  // Copy with options
  await fs.copy(source, dest, {
    overwrite: true,           // Replace existing files
    errorOnExist: false,       // Don't error if exists
    preserveTimestamps: true,  // Keep original timestamps
    filter: options.filter     // Optional filter function
  });
}

export async function ensureDirectory(dirPath) {
  // Creates directory and parents if needed (like mkdir -p)
  // No-op if already exists
  await fs.ensureDir(dirPath);
}

export async function writeManifest(filePath, data) {
  // Write JSON with pretty formatting
  // Creates parent directories if needed
  await fs.writeJSON(filePath, data, { spaces: 2 });
}

export async function checkPathExists(targetPath) {
  return await fs.pathExists(targetPath);
}
```

**Key points:**
- `fs.copy()` preserves file permissions automatically
- `fs.ensureDir()` is idempotent (safe to call multiple times)
- `fs.writeJSON()` creates parent directories automatically
- `fs.pathExists()` returns boolean (no exception)

### Pattern 3: Path Security & Validation

**What:** Prevent directory traversal attacks by validating resolved paths

**When to use:** Always when accepting any path input or building paths from components

**Example:**
```javascript
// Source: Node.js security best practices
import path from 'path';

export function validatePath(basePath, userPath) {
  // Normalize removes . and .. segments
  const normalized = path.normalize(userPath);
  
  // Resolve to absolute path
  const absolute = path.resolve(basePath, normalized);
  
  // Ensure resolved path starts with base path
  const resolvedBase = path.resolve(basePath);
  if (!absolute.startsWith(resolvedBase)) {
    throw new Error(`Path traversal detected: ${userPath}`);
  }
  
  return absolute;
}

export function resolveInstallPath(scope) {
  // Use os.homedir() for cross-platform home directory
  import os from 'os';
  
  if (scope === 'global') {
    return path.join(os.homedir(), '.claude');
  } else {
    // Local: relative to current working directory
    return path.join(process.cwd(), '.claude');
  }
}
```

**Key points:**
- Use `path.normalize()` to remove `..` and `.` segments
- Use `path.resolve()` for absolute paths
- Validate result starts with expected base directory
- Use `path.join()` for cross-platform path construction
- Use `os.homedir()` not `~` expansion

### Pattern 4: Template Rendering (String Replacement)

**What:** Simple variable replacement in template files using regex

**When to use:** For basic template substitution without logic or loops

**Example:**
```javascript
// Source: Built-in string manipulation
export function renderTemplate(content, variables) {
  let result = content;
  const unknown = new Set();
  
  // Replace each known variable
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  
  // Detect unknown variables (left unreplaced)
  const remainingRegex = /\{\{([A-Z_]+)\}\}/g;
  let match;
  while ((match = remainingRegex.exec(result)) !== null) {
    unknown.add(match[1]);
  }
  
  return { 
    result, 
    unknown: Array.from(unknown) 
  };
}

// Usage
const { result, unknown } = renderTemplate(
  'Install to {{PLATFORM_ROOT}} with {{COMMAND_PREFIX}}help',
  { 
    PLATFORM_ROOT: '~/.claude', 
    COMMAND_PREFIX: '/gsd-' 
  }
);

if (unknown.length > 0) {
  console.warn(`Unknown template variables: ${unknown.join(', ')}`);
}
```

**Key points:**
- No external dependencies required
- Tracks unknown variables for warnings
- Simple regex-based replacement
- Returns both result and unknown variables
- Faster than full templating engines for simple cases

### Pattern 5: Progress Bar with Error Handling

**What:** Multi-bar progress tracking with proper cleanup on errors

**When to use:** For multi-phase operations where user needs feedback

**Example:**
```javascript
// Source: cli-progress documentation
import cliProgress from 'cli-progress';

export class ProgressTracker {
  constructor() {
    this.multibar = new cliProgress.MultiBar({
      clearOnComplete: false,
      hideCursor: true,
      format: '{name} |{bar}| {percentage}% | {value}/{total}'
    });
    this.bars = new Map();
    
    // Ensure cleanup on Ctrl+C
    process.on('SIGINT', () => this.stop());
  }
  
  createBar(name, total) {
    const bar = this.multibar.create(total, 0, { name });
    this.bars.set(name, bar);
    return bar;
  }
  
  update(name, value) {
    const bar = this.bars.get(name);
    if (bar) bar.update(value);
  }
  
  increment(name) {
    const bar = this.bars.get(name);
    if (bar) bar.increment();
  }
  
  stop() {
    this.multibar.stop();
  }
}

// Usage with error handling
const progress = new ProgressTracker();
try {
  const skillsBar = progress.createBar('Skills', 29);
  const agentsBar = progress.createBar('Agents', 13);
  
  await installSkills(progress);
  await installAgents(progress);
  
  progress.stop();
} catch (error) {
  progress.stop(); // CRITICAL: Always stop on error
  throw error;
}
```

**Key points:**
- Always call `stop()` in finally block or catch
- Handle SIGINT (Ctrl+C) to cleanup properly
- Multi-bar for parallel progress tracking
- Terminal left in clean state even on error

### Pattern 6: Structured Error Handling

**What:** Custom error types with exit codes and context

**When to use:** For CLI tools that need specific exit codes and error messages

**Example:**
```javascript
// Source: Node.js CLI best practices
export class InstallError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'InstallError';
    this.code = code;
    this.details = details;
  }
}

// Exit codes
export const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_ARGS: 2,      // Commander handles this
  MISSING_TEMPLATES: 3,
  PERMISSION_DENIED: 4,
  INSUFFICIENT_SPACE: 5
};

// Usage
throw new InstallError(
  'Permission denied',
  EXIT_CODES.PERMISSION_DENIED,
  { 
    path: '/target/dir',
    suggestion: 'Check directory permissions or use --global flag'
  }
);

// Top-level handler
main().catch(error => {
  if (error instanceof InstallError) {
    console.error(`Error: ${error.message}`);
    if (error.details.path) {
      console.error(`Path: ${error.details.path}`);
    }
    if (error.details.suggestion) {
      console.error(`Suggestion: ${error.details.suggestion}`);
    }
    process.exit(error.code);
  } else {
    console.error('Unexpected error:', error.message);
    process.exit(EXIT_CODES.GENERAL_ERROR);
  }
});
```

**Key points:**
- Structured error types with exit codes
- Include contextual information (path, suggestion)
- Standard exit codes for automation
- Top-level error handler for clean output

### Pattern 7: Logging with Verbosity

**What:** Conditional logging based on verbosity flag

**When to use:** Providing different levels of detail to users

**Example:**
```javascript
// Source: CLI best practices with chalk
import chalk from 'chalk';

export function createLogger(verbose = false) {
  return {
    info: (msg) => console.log(chalk.blue('ℹ'), msg),
    success: (msg) => console.log(chalk.green('✓'), msg),
    warn: (msg) => console.warn(chalk.yellow('⚠'), msg),
    error: (msg) => console.error(chalk.red('✗'), msg),
    verbose: (msg) => {
      if (verbose) {
        console.log(chalk.gray(msg));
      }
    }
  };
}

// Usage
const log = createLogger(options.verbose);

log.info('Starting installation...');
log.verbose('Copying file: skill-1.md');
log.verbose('Copying file: skill-2.md');
log.success('29 skills, 13 agents installed');
```

**Key points:**
- Use chalk for colored output
- Verbose mode shows file-by-file details
- Unicode symbols for visual clarity
- Conditional logging without if statements

### Anti-Patterns to Avoid

- **Hardcoded path separators:** Never use `/` or `\` directly. Always use `path.join()` or `path.resolve()`
- **Ignoring __dirname in ESM:** ESM doesn't have `__dirname`. Use `fileURLToPath(import.meta.url)` instead
- **Not cleaning up progress bars:** Always call `stop()` even on errors, or terminal state corrupts
- **Using eval() for templates:** Security risk and unnecessary for simple replacement
- **Forgetting .js extensions in imports:** ESM requires explicit extensions: `import './file.js'`
- **Not handling SIGINT:** User hits Ctrl+C and terminal left in bad state
- **Mixing sync and async fs operations:** Use consistent async/await pattern throughout

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Recursive directory copy | Custom walkdir + copy loop | `fs-extra.copy()` | Handles permissions, symlinks, cross-device copies, error handling, filters |
| CLI argument parsing | Manual `process.argv` parsing | `commander` | Auto-generates help, validates types, handles errors, standard patterns |
| Progress bars | Custom `\r` and ANSI codes | `cli-progress` | Multi-bar support, proper terminal state management, works across terminals |
| Path normalization | String manipulation | `path.normalize()` + validation | Cross-platform, handles edge cases, security validated |
| Directory creation | Recursive mkdir logic | `fs-extra.ensureDir()` | Handles race conditions, idempotent, cross-platform |
| Template engines | Custom parser | String.replace() for simple cases | For complex logic, use Handlebars. For variables only, string replace is sufficient |
| JSON file writing | Manual JSON.stringify + mkdir | `fs-extra.writeJSON()` | Creates parent dirs, handles formatting, atomic writes |
| Disk space checking | Manual platform detection | Use `child_process.execSync` with df/PowerShell | Cross-platform, handles different filesystems |

**Key insight:** File system operations have many edge cases (permissions, symlinks, race conditions, cross-device moves, platform differences). fs-extra handles these. Don't reimplement unless you understand all edge cases.

## Common Pitfalls

### Pitfall 1: Forgetting Executable Permissions on Bin File

**What goes wrong:** `npx` fails with "permission denied" error when trying to execute bin/install.js

**Why it happens:** Git doesn't track executable permission by default on all platforms. File must be marked executable for Unix-like systems

**How to avoid:**
```bash
# Set executable in git
git update-index --chmod=+x bin/install.js

# Verify in package.json
{
  "bin": {
    "get-shit-done-multi": "bin/install.js"
  }
}
```

**Warning signs:**
- Error: "EACCES: permission denied" when running via npx
- `ls -la bin/install.js` shows no execute bit on Unix

### Pitfall 2: Not Handling Async in Entry Point

**What goes wrong:** Unhandled promise rejections, process doesn't exit with proper code

**Why it happens:** Top-level await not available in older Node versions. Async errors not caught

**How to avoid:**
```javascript
#!/usr/bin/env node

// WRONG: Top-level await might not work
await main();

// RIGHT: Wrap in async function with error handler
async function main() {
  // All logic here
}

main().catch(error => {
  console.error('Error:', error.message);
  process.exit(1);
});
```

**Warning signs:**
- "UnhandledPromiseRejection" warnings
- Process doesn't exit with correct exit code
- Errors not displayed to user

### Pitfall 3: Progress Bar Not Stopping on Error

**What goes wrong:** Terminal left in corrupted state, cursor hidden, output garbled

**Why it happens:** Progress bar manipulates terminal state. If not stopped properly, state persists

**How to avoid:**
```javascript
const progress = new ProgressTracker();
try {
  await installProcess(progress);
  progress.stop();
} catch (error) {
  progress.stop(); // ALWAYS stop, even on error
  throw error;
}

// Also handle Ctrl+C
process.on('SIGINT', () => {
  progress.stop();
  console.log('\nInstallation cancelled');
  process.exit(130);
});
```

**Warning signs:**
- Cursor disappears after error
- Subsequent terminal output on wrong line
- Progress bar remnants visible after exit

### Pitfall 4: Path Separator Issues (Windows vs Unix)

**What goes wrong:** Paths work on development machine but fail on Windows or vice versa

**Why it happens:** Hardcoded `/` or `\` in path strings. Windows uses backslash, Unix uses forward slash

**How to avoid:**
```javascript
// WRONG
const bad = baseDir + '/templates/skills';
const bad2 = `${baseDir}\\templates\\skills`;

// RIGHT
import path from 'path';
const good = path.join(baseDir, 'templates', 'skills');
const good2 = path.resolve(baseDir, 'templates', 'skills');
```

**Warning signs:**
- Works on macOS/Linux but fails on Windows
- Error: "ENOENT: no such file or directory"
- Paths with mixed separators

### Pitfall 5: Relative Path Resolution in ESM

**What goes wrong:** Template directory not found, paths resolve to wrong location

**Why it happens:** ESM doesn't have `__dirname`. Relative paths resolve from `process.cwd()`, not script location

**How to avoid:**
```javascript
// WRONG in ESM
const templatesDir = './templates';  // Relative to CWD, not script

// RIGHT in ESM
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const templatesDir = join(__dirname, '../templates');
```

**Warning signs:**
- Works when run from project root, fails from subdirectories
- "Cannot find templates directory" errors
- Different behavior based on where command is run

### Pitfall 6: Not Validating Templates Before Copy

**What goes wrong:** Installation starts, then fails midway with cryptic error

**Why it happens:** Template directory doesn't exist or isn't readable. Error happens during copy, not before

**How to avoid:**
```javascript
// Pre-flight checks before starting
async function validatePrerequisites(templatesDir) {
  // Check templates exist
  if (!await fs.pathExists(templatesDir)) {
    throw new InstallError(
      'Templates directory not found',
      EXIT_CODES.MISSING_TEMPLATES,
      { path: templatesDir }
    );
  }
  
  // Check readable
  try {
    await fs.access(templatesDir, fs.constants.R_OK);
  } catch (error) {
    throw new InstallError(
      'Cannot read templates directory',
      EXIT_CODES.PERMISSION_DENIED,
      { path: templatesDir }
    );
  }
}
```

**Warning signs:**
- Installation fails after progress bar starts
- Error messages about missing files mid-copy
- Partial installations left behind

### Pitfall 7: Missing .js Extensions in ESM Imports

**What goes wrong:** "Cannot find module" errors in Node.js

**Why it happens:** ESM requires explicit file extensions. CommonJS allowed omitting `.js`

**How to avoid:**
```javascript
// WRONG in ESM
import { copy } from './file-operations';

// RIGHT in ESM
import { copy } from './file-operations.js';
```

**Warning signs:**
- Error: "Cannot find module './file-operations'"
- Works with bundler but fails in Node.js
- Error: "ERR_MODULE_NOT_FOUND"

## Code Examples

Verified patterns from official sources:

### Installation Flow Orchestration

```javascript
#!/usr/bin/env node
// Source: Combination of fs-extra, commander, cli-progress docs

import { Command } from 'commander';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import os from 'os';
import fs from 'fs-extra';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  // Parse CLI arguments
  const program = new Command();
  program
    .name('get-shit-done-multi')
    .version('2.0.0')
    .description('Install get-shit-done skills to Claude Code')
    .requiredOption('--claude', 'Install for Claude Code')
    .option('--global', 'Install globally to ~/.claude/')
    .option('--local', 'Install locally to .claude/ (default)')
    .option('--verbose', 'Show detailed file-by-file progress')
    .parse(process.argv);

  const options = program.opts();
  
  // Resolve installation target
  const scope = options.global ? 'global' : 'local';
  const targetDir = scope === 'global' 
    ? join(os.homedir(), '.claude')
    : join(process.cwd(), '.claude');
  
  // Resolve templates directory (relative to script location)
  const templatesDir = join(__dirname, '../templates');
  
  // Validate prerequisites
  await validatePrerequisites(templatesDir, targetDir);
  
  // Check for existing installation
  const manifestPath = join(targetDir, '.gsd-install-manifest.json');
  if (await fs.pathExists(manifestPath)) {
    console.warn('⚠ Existing installation detected');
    console.warn('This will overwrite the current installation.');
    // User confirmation would go here (Phase 4)
  }
  
  // Create progress tracker
  const progress = createProgressTracker(options.verbose);
  
  try {
    // Install phases
    await installSkills(templatesDir, targetDir, progress, options);
    await installAgents(templatesDir, targetDir, progress, options);
    await installShared(templatesDir, targetDir, progress, options);
    
    // Write manifest
    await writeInstallManifest(manifestPath, {
      version: '2.0.0',
      installedAt: new Date().toISOString(),
      scope,
      targetDir,
      platform: 'claude'
    });
    
    progress.stop();
    console.log('✓ Installation complete!');
    console.log(`Try /gsd-help to get started`);
    
  } catch (error) {
    progress.stop();
    throw error;
  }
}

main().catch(error => {
  if (error.code) {
    console.error(`Error: ${error.message}`);
    process.exit(error.code);
  } else {
    console.error('Unexpected error:', error.message);
    process.exit(1);
  }
});
```

### Copying Templates with Rendering

```javascript
// Source: fs-extra documentation + custom rendering
import fs from 'fs-extra';
import path from 'path';

export async function copyAndRenderTemplates(sourceDir, destDir, variables, filter) {
  // Get all files in source
  const items = await fs.readdir(sourceDir, { withFileTypes: true });
  
  for (const item of items) {
    const sourcePath = path.join(sourceDir, item.name);
    const destPath = path.join(destDir, item.name);
    
    if (item.isDirectory()) {
      // Recursive for directories
      await fs.ensureDir(destPath);
      await copyAndRenderTemplates(sourcePath, destPath, variables, filter);
    } else if (item.isFile()) {
      // Apply filter if provided
      if (filter && !filter(sourcePath)) {
        continue;
      }
      
      // Read file
      const content = await fs.readFile(sourcePath, 'utf8');
      
      // Render templates (markdown files only)
      if (sourcePath.endsWith('.md')) {
        const { result, unknown } = renderTemplate(content, variables);
        
        if (unknown.length > 0) {
          console.warn(`Unknown variables in ${sourcePath}: ${unknown.join(', ')}`);
        }
        
        await fs.outputFile(destPath, result, 'utf8');
        
        // Preserve permissions
        const stats = await fs.stat(sourcePath);
        await fs.chmod(destPath, stats.mode);
      } else {
        // Binary files or non-markdown - just copy
        await fs.copy(sourcePath, destPath, { preserveTimestamps: true });
      }
    }
  }
}

function renderTemplate(content, variables) {
  let result = content;
  const unknown = new Set();
  
  // Replace known variables
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(regex, value);
  }
  
  // Find unknown variables
  const remainingRegex = /\{\{([A-Z_]+)\}\}/g;
  let match;
  while ((match = remainingRegex.exec(result)) !== null) {
    unknown.add(match[1]);
  }
  
  return { result, unknown: Array.from(unknown) };
}
```

### Pre-flight Validation

```javascript
// Source: Node.js best practices
import fs from 'fs-extra';
import { execSync } from 'child_process';
import os from 'os';

export async function validatePrerequisites(templatesDir, targetDir) {
  // Check Node.js version
  const nodeVersion = process.versions.node;
  const [major] = nodeVersion.split('.').map(Number);
  if (major < 16) {
    throw new InstallError(
      `Node.js 16+ required. Current: ${nodeVersion}`,
      EXIT_CODES.GENERAL_ERROR
    );
  }
  
  // Check templates exist
  if (!await fs.pathExists(templatesDir)) {
    throw new InstallError(
      'Templates directory not found',
      EXIT_CODES.MISSING_TEMPLATES,
      { 
        path: templatesDir,
        suggestion: 'Package may be corrupted. Try reinstalling.'
      }
    );
  }
  
  // Check templates readable
  try {
    await fs.access(templatesDir, fs.constants.R_OK);
  } catch (error) {
    throw new InstallError(
      'Cannot read templates directory',
      EXIT_CODES.PERMISSION_DENIED,
      { path: templatesDir }
    );
  }
  
  // Check target directory writable (parent must exist and be writable)
  const parentDir = path.dirname(targetDir);
  try {
    await fs.access(parentDir, fs.constants.W_OK);
  } catch (error) {
    throw new InstallError(
      'Cannot write to target location',
      EXIT_CODES.PERMISSION_DENIED,
      { 
        path: parentDir,
        suggestion: 'Check directory permissions or use --global flag'
      }
    );
  }
  
  // Check disk space (50MB minimum)
  const minSpace = 50 * 1024 * 1024;
  try {
    const available = await checkDiskSpace(targetDir);
    if (available < minSpace) {
      throw new InstallError(
        `Insufficient disk space. Required: 50MB, Available: ${Math.round(available / 1024 / 1024)}MB`,
        EXIT_CODES.INSUFFICIENT_SPACE,
        { path: targetDir }
      );
    }
  } catch (error) {
    // Disk space check is best-effort, don't fail if command unavailable
    console.warn('⚠ Could not check disk space');
  }
}

async function checkDiskSpace(targetPath) {
  const platform = os.platform();
  
  try {
    if (platform === 'win32') {
      const cmd = `powershell "Get-PSDrive | Where-Object {$_.Free} | Select-Object -ExpandProperty Free"`;
      const output = execSync(cmd, { encoding: 'utf8' });
      return parseInt(output.trim());
    } else {
      const cmd = `df -k "${targetPath}" | tail -1 | awk '{print $4}'`;
      const output = execSync(cmd, { encoding: 'utf8' });
      return parseInt(output.trim()) * 1024;
    }
  } catch (error) {
    // Return large number if check fails (don't block installation)
    return Number.MAX_SAFE_INTEGER;
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Callbacks for fs | Promises (fs.promises, fs-extra) | Node 10+ (2018) | Cleaner async code, better error handling |
| CommonJS (require) | ESM (import/export) | Node 14+ (2020) | Better tree-shaking, modern syntax, explicit deps |
| Manual CLI parsing | commander/yargs | ~2015 | Auto-generated help, validation, standard patterns |
| Manual progress bars | cli-progress/ora | ~2017 | Multi-bar support, proper cleanup, works everywhere |
| Custom templating | Handlebars for complex, regex for simple | Ongoing | Right tool for complexity level |
| Synchronous fs operations | Async fs operations | Node 10+ (2018) | Non-blocking, better for CLI responsiveness |

**Deprecated/outdated:**
- **`fs.existsSync()`**: Use `fs.pathExists()` from fs-extra (returns promise)
- **`mkdirp` package**: Built into fs.mkdir with `{ recursive: true }` as of Node 10.12
- **Global npm installs for CLI tools**: npx preferred (run without install)
- **`__dirname` in ESM**: Use `fileURLToPath(import.meta.url)` instead
- **Optimist (CLI parser)**: Unmaintained since 2015, use commander or yargs

## Resolved Questions

All open questions have been resolved with user decisions:

1. **Progress granularity for large directories** ✅ RESOLVED
   - Decision: Use per-phase progress (skills, agents, shared) for default mode
   - File-by-file detail shown only in verbose mode (`--verbose` flag)
   - Rationale: Output files go to `.claude/`, `.github/`, `.codex/` or other CLI directories and need to be lightweight (~50 files total)

2. **Optimal disk space buffer** ✅ RESOLVED
   - Decision: Use 50MB minimum as specified
   - Rationale: Output consists of lightweight markdown files for CLI skills/agents, 50MB is more than sufficient
   - Can adjust if measurements show it's too low, but starting point is appropriate

3. **User confirmation mechanism** ✅ RESOLVED
   - Decision: Agreed with recommendation to defer to Phase 4 (Interactive UX)
   - Phase 2: Just warn and proceed (no prompting library needed yet)
   - Full interactive prompts come in Phase 4 when @clack/prompts is introduced

## Sources

### Primary (HIGH confidence)

- **npm registry:** fs-extra@11.3.3, commander@14.0.2, cli-progress@3.12.0 verified via npm search
- **Package.json inspection:** Confirmed project uses ESM ("type": "module"), has fs-extra and commander dependencies
- **Node.js documentation (16+):** Built-in modules (path, os, child_process, fs) - https://nodejs.org/docs/latest-v16.x/api/
- **fs-extra GitHub:** Documentation for copy(), ensureDir(), writeJSON() methods - github.com/jprichardson/node-fs-extra
- **commander GitHub:** Documentation for CLI parsing patterns - github.com/tj/commander.js
- **cli-progress GitHub:** Documentation for progress bar usage - github.com/npkgz/cli-progress

### Secondary (MEDIUM confidence)

- **npm weekly download counts:** Verified popularity claims (fs-extra 67M+, commander 19M+, chalk 116M+)
- **Node.js version timeline:** ESM support, fs.promises availability timelines from release notes
- **NPX behavior:** How npx executes packages from npm CLI documentation

### Tertiary (LOW confidence)

- **Disk space checking:** Shell command patterns (df, PowerShell) - common practice but not officially documented
- **Exit code conventions:** Standard Unix exit codes - widely used but not formally standardized for Node.js
- **Performance characteristics:** Sequential vs parallel copy performance - depends on system, not benchmarked

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified to exist, versions confirmed, usage patterns from official docs
- Architecture: HIGH - Patterns based on established Node.js and CLI best practices, verified with official docs
- Pitfalls: HIGH - Based on documented issues in official repos and common problems in Node.js ecosystem

**Research date:** 2025-01-26
**Valid until:** 2025-02-26 (30 days - stack is stable, major releases unlikely)
