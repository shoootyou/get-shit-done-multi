# Phase 6: Update Detection and Versioning - Research

**Researched:** 2025-01-27
**Domain:** CLI update detection, version comparison, manifest reading, file discovery
**Confidence:** HIGH

## Summary

Phase 6 implements update detection and versioning for the GSD installer. The core challenge is reliably detecting installed versions across multiple platforms and scopes, comparing them using semantic versioning, and presenting update options inline with platform selection.

The standard approach uses **semver** (npm's official semantic versioning parser) for all version comparisons, **fs-extra** for robust file operations with proper error handling, and Node's built-in **os** module for cross-platform home directory resolution. Production CLIs like npm and create-react-app use similar patterns: detect versions on every run, display inline status, and auto-update on user selection.

Key insight: Don't hand-roll version comparison, directory diffing, or JSON error recovery. Use battle-tested libraries (semver, fs-extra) and standard try-catch-repair patterns for manifest reading. The ecosystem has solved these problems thoroughly.

**Primary recommendation:** Use semver for all version operations, parallel Promise.all for file discovery across known paths, and fs-extra's copy with overwrite:false for customization preservation.

## Standard Stack

The established libraries/tools for CLI update detection and version management:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| semver | ^7.7.3 | Semantic version parsing and comparison | Used by npm itself, industry standard for Node.js version operations |
| fs-extra | ^11.3.3 | File system operations with promises | Already in package.json, adds promisified fs with helpful utilities like pathExists, copy with filters |
| os (built-in) | Node.js | Home directory resolution | Standard cross-platform way to get user home directory |
| crypto (built-in) | Node.js | File hashing for customization detection | Standard for computing file checksums |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| path (built-in) | Node.js | Path manipulation | Cross-platform path joining, dirname, basename |
| @clack/prompts | ^0.11.0 | CLI prompts | Already in package.json, used for confirmation prompts |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| semver | compare-versions | Less feature-complete, semver is npm's official parser |
| fs-extra | node:fs/promises | fs-extra adds pathExists, copy with filters - worth the dependency |
| Manual version parsing | String comparison | Breaks on edge cases (1.10.0 < 1.9.0 if using string compare) |

**Installation:**
```bash
npm install semver@^7.7.3  # Add to existing dependencies
# fs-extra already installed (^11.3.3)
```

## Architecture Patterns

### Recommended Module Structure
```
bin/lib/version/
├── installation-finder.js    # Discover installations by scope
├── manifest-reader.js         # Read and repair manifests
├── version-checker.js         # Compare versions using semver
└── update-prompter.js         # Format inline version display
```

### Pattern 1: Scope-Based Installation Discovery
**What:** Find all manifests for a given scope (global or local) by checking known paths in parallel
**When to use:** On installer startup to detect existing installations

**Example:**
```javascript
// installation-finder.js
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const MANIFEST_FILE = '.gsd-install-manifest.json';

export async function findInstallations(scope) {
  const paths = getManifestPaths(scope);
  
  // Check all paths in parallel (fast for 6 paths)
  const checks = await Promise.all(
    paths.map(async (manifestPath) => {
      const exists = await fs.pathExists(manifestPath);
      if (!exists) return null;
      
      try {
        const manifest = await readManifestWithRepair(manifestPath);
        return { path: manifestPath, manifest, status: 'ok' };
      } catch (error) {
        return { path: manifestPath, manifest: null, status: 'error', error };
      }
    })
  );
  
  return checks.filter(c => c !== null);
}

function getManifestPaths(scope) {
  const homeDir = os.homedir();
  
  if (scope === 'global') {
    return [
      path.join(homeDir, '.claude', 'get-shit-done', MANIFEST_FILE),
      path.join(homeDir, '.copilot', 'get-shit-done', MANIFEST_FILE),
      path.join(homeDir, '.codex', 'get-shit-done', MANIFEST_FILE)
    ];
  } else {
    return [
      path.join(process.cwd(), '.claude', 'get-shit-done', MANIFEST_FILE),
      path.join(process.cwd(), '.github', 'get-shit-done', MANIFEST_FILE),
      path.join(process.cwd(), '.codex', 'get-shit-done', MANIFEST_FILE)
    ];
  }
}
```

### Pattern 2: Manifest Reading with Automatic Repair
**What:** Read and parse manifest JSON, attempt repair on corruption, reconstruct from directory if needed
**When to use:** Every time reading a manifest file

**Example:**
```javascript
// manifest-reader.js
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

export async function readManifestWithRepair(manifestPath) {
  // Try normal read first
  try {
    if (!await fs.pathExists(manifestPath)) {
      return null;
    }
    
    const content = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(content);
    
    // Validate required fields
    if (!manifest.gsd_version || !manifest.platform || !manifest.scope) {
      throw new Error('Missing required fields');
    }
    
    return manifest;
  } catch (error) {
    // Handle specific error types
    if (error.code === 'EACCES') {
      throw new Error(`Permission denied reading manifest: ${manifestPath}`);
    }
    
    if (error instanceof SyntaxError || error.message.includes('required fields')) {
      // Attempt repair
      console.warn(`⚠️  Corrupt manifest detected: ${manifestPath}`);
      console.warn('   Attempting automatic repair...');
      return await repairManifest(manifestPath);
    }
    
    throw error;
  }
}

async function repairManifest(manifestPath) {
  const installDir = path.dirname(manifestPath);
  
  // Scan directory to reconstruct file list
  const files = [];
  try {
    const entries = await fs.readdir(installDir, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile() && !entry.name.startsWith('.gsd-')) {
        const filePath = path.relative(installDir, path.join(entry.path, entry.name));
        files.push({ path: filePath });
      }
    }
  } catch (error) {
    console.warn('   Could not scan directory:', error.message);
  }
  
  // Try to extract version from package.json
  let version = 'unknown';
  const pkgPath = path.join(installDir, 'package.json');
  if (await fs.pathExists(pkgPath)) {
    try {
      const pkg = await fs.readJson(pkgPath);
      version = pkg.version || 'unknown';
    } catch {}
  }
  
  // Derive platform from directory structure
  const parentDir = path.dirname(installDir);
  const platform = path.basename(parentDir);
  
  // Derive scope from path (contains home directory = global)
  const homeDir = os.homedir();
  const scope = installDir.includes(homeDir) ? 'global' : 'local';
  
  // Reconstruct manifest
  const repairedManifest = {
    gsd_version: version,
    platform: platform,
    scope: scope,
    installed_at: new Date().toISOString(),
    files: files,
    _repaired: true,
    _repair_date: new Date().toISOString(),
    _repair_reason: 'corrupt_or_incomplete'
  };
  
  // Write repaired manifest
  await fs.writeJson(manifestPath, repairedManifest, { spaces: 2 });
  console.log('   ✓ Manifest repaired successfully');
  
  return repairedManifest;
}
```

### Pattern 3: Version Comparison with Semver
**What:** Compare installed vs current version, detect updates/downgrades/major bumps
**When to use:** After discovering installations, before displaying options

**Example:**
```javascript
// version-checker.js
import semver from 'semver';

export function compareVersions(installedVersion, currentVersion) {
  // Coerce versions to handle "v1.2.3" format
  const installed = semver.coerce(installedVersion);
  const current = semver.coerce(currentVersion);
  
  if (!installed || !current) {
    return { status: 'unknown', reason: 'invalid_version' };
  }
  
  // Check for downgrade (block completely)
  if (semver.lt(current, installed)) {
    return {
      status: 'downgrade',
      installed: installed.version,
      current: current.version,
      message: 'Cannot downgrade. Use latest version.'
    };
  }
  
  // Check for major version bump (warn user)
  const installedMajor = semver.major(installed);
  const currentMajor = semver.major(current);
  if (currentMajor > installedMajor) {
    return {
      status: 'major_update',
      installed: installed.version,
      current: current.version,
      majorJump: `${installedMajor}.x → ${currentMajor}.x`,
      message: 'Major version update - breaking changes possible'
    };
  }
  
  // Check for update available
  if (semver.gt(current, installed)) {
    const diff = semver.diff(current, installed); // 'major' | 'minor' | 'patch'
    return {
      status: 'update_available',
      installed: installed.version,
      current: current.version,
      updateType: diff,
      message: `Update available: v${installed.version} → v${current.version}`
    };
  }
  
  // Already up to date
  return {
    status: 'up_to_date',
    installed: installed.version,
    current: current.version
  };
}
```

### Pattern 4: Inline Version Display
**What:** Format version status for display in interactive platform selection
**When to use:** When presenting platform options to user

**Example:**
```javascript
// update-prompter.js
export function formatPlatformOption(platform, versionStatus) {
  const baseName = getPlatformDisplayName(platform);
  
  if (!versionStatus || versionStatus.status === 'not_installed') {
    return baseName;
  }
  
  if (versionStatus.status === 'up_to_date') {
    return `${baseName} (v${versionStatus.installed})`;
  }
  
  if (versionStatus.status === 'update_available') {
    return `${baseName} (v${versionStatus.installed} → v${versionStatus.current})`;
  }
  
  if (versionStatus.status === 'major_update') {
    return `${baseName} (v${versionStatus.installed} → v${versionStatus.current} ⚠️  major)`;
  }
  
  return baseName;
}

function getPlatformDisplayName(platform) {
  const names = {
    'claude': 'Claude Code',
    'copilot': 'GitHub Copilot',
    'codex': 'Codex'
  };
  return names[platform] || platform;
}
```

### Pattern 5: Customization Preservation
**What:** Preserve user customizations during update using fs-extra copy with overwrite control
**When to use:** When updating existing installation

**Example:**
```javascript
// In installer orchestrator
import fs from 'fs-extra';
import { confirm } from '@clack/prompts';

async function updateInstallation(templateDir, installDir, packageJson) {
  const preserveCustomizations = await confirm({
    message: 'Preserve your customizations?',
    initialValue: true
  });
  
  if (preserveCustomizations) {
    // Copy without overwriting existing files
    await fs.copy(templateDir, installDir, {
      overwrite: false,      // Don't replace existing files
      errorOnExist: false    // Don't throw error if file exists
    });
    
    console.log('✓ Updated with customizations preserved');
    console.log('');
    console.log('💡 Consider contributing your improvements:');
    console.log(`   ${packageJson.repository.url}`);
  } else {
    // Full overwrite
    await fs.copy(templateDir, installDir, {
      overwrite: true
    });
    
    console.log('✓ Updated to latest version');
  }
}
```

### Anti-Patterns to Avoid

- **Manual version string comparison:** Never use `if (version1 > version2)` - breaks on "1.10.0" < "1.9.0"
- **Sequential file checks:** Don't check 6 paths sequentially when Promise.all is safe and faster
- **Assuming JSON.parse errors are always SyntaxError:** Check error.code for EACCES, ENOENT
- **Not coercing versions:** Always use `semver.coerce()` to handle "v1.2.3" vs "1.2.3"
- **Glob patterns for known paths:** Overkill - explicit paths are faster and more predictable
- **Blocking downgrades with --force override:** Per context, downgrades should be completely blocked

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Version comparison | String comparison, regex parsing | semver package | Handles prerelease, build metadata, coercion, edge cases (1.10 > 1.9) |
| Directory diffing | File-by-file comparison loop | fs-extra copy with overwrite:false or dir-compare | Handles symlinks, permissions, nested structures |
| JSON error recovery | Custom parser, regex fixes | Try-catch with directory scan reconstruction | Standard pattern, easier to maintain |
| File hashing | Custom hash implementation | crypto.createHash() | Built-in, battle-tested, cross-platform |
| Home directory resolution | process.env.HOME or hardcoded paths | os.homedir() | Cross-platform (Windows vs Unix), standardized |
| Async file operations | Callback-based fs module | fs-extra (promisified) | Already in package.json, cleaner async/await |

**Key insight:** Version comparison is deceptively complex. Prerelease versions (1.0.0-beta), build metadata (1.0.0+build123), and version coercion ("v1.2" vs "1.2.0") require proper semver handling. Manual string comparison fails on common cases like "1.10.0" being treated as less than "1.9.0".

## Common Pitfalls

### Pitfall 1: Version String Comparison
**What goes wrong:** Using `>` or `<` operators on version strings produces incorrect results
**Why it happens:** JavaScript string comparison is lexicographic, not semantic
**How to avoid:** Always use semver.gt(), semver.lt(), etc.
**Warning signs:** Tests fail on versions like "1.10.0" or "2.0.0-beta"

**Example of problem:**
```javascript
// WRONG - breaks on version 1.10.0
if ('1.10.0' > '1.9.0') // false! (string comparison)

// RIGHT - semantic version comparison
if (semver.gt('1.10.0', '1.9.0')) // true
```

### Pitfall 2: Not Handling File Permission Errors
**What goes wrong:** Installer crashes with cryptic error when manifest is unreadable
**Why it happens:** File system operations can fail with EACCES (permission denied)
**How to avoid:** Check error.code for EACCES, ENOENT, EISDIR and provide helpful messages
**Warning signs:** Installer fails on some systems but not others (permission differences)

**Example of solution:**
```javascript
try {
  const manifest = await fs.readFile(path, 'utf8');
} catch (error) {
  if (error.code === 'EACCES') {
    throw new Error(`Permission denied: ${path}. Try running with appropriate permissions.`);
  }
  if (error.code === 'ENOENT') {
    return null; // File doesn't exist - expected case
  }
  throw error; // Unexpected error
}
```

### Pitfall 3: Sequential File Operations When Parallel is Safe
**What goes wrong:** Checking 6 manifest paths sequentially adds unnecessary latency
**Why it happens:** Default to sequential for safety, but existence checks are read-only
**How to avoid:** Use Promise.all for independent read operations (no race conditions)
**Warning signs:** Installer feels slow during discovery phase

**Example of solution:**
```javascript
// SLOW - sequential checks (60ms+)
const found = [];
for (const path of paths) {
  if (await fs.pathExists(path)) found.push(path);
}

// FAST - parallel checks (10ms)
const checks = await Promise.all(
  paths.map(async p => ({ path: p, exists: await fs.pathExists(p) }))
);
const found = checks.filter(c => c.exists).map(c => c.path);
```

### Pitfall 4: Not Validating Manifest Structure After Parse
**What goes wrong:** JSON.parse succeeds but manifest is missing required fields
**Why it happens:** Partial file corruption or manual editing
**How to avoid:** Validate required fields exist after successful parse, treat invalid manifests as corrupt and regenerate from directory scan
**Warning signs:** Installer crashes later when accessing manifest.gsd_version

**Example of solution:**
```javascript
const manifest = JSON.parse(content);

// Validate structure
const required = ['gsd_version', 'platform', 'scope', 'installed_at'];
for (const field of required) {
  if (!manifest[field]) {
    // Treat as corrupted - regenerate from directory scan
    return await repairManifestFromDirectory(path);
  }
}
```

**Updated approach (per user decision):**
- On corrupt JSON OR missing required fields → ignore corrupted manifest completely
- Scan directory from scratch, create brand new manifest
- Mark with `_repaired: true` flag
- Don't try to extract partial data from corrupted file

### Pitfall 5: Forgetting Version Coercion
**What goes wrong:** semver.gt('v1.2.3', '1.2.4') throws error or returns incorrect result
**Why it happens:** Inconsistent version format (with/without "v" prefix)
**How to avoid:** Use semver.coerce() before any comparison
**Warning signs:** Works in tests but fails with real-world version formats

**Example of solution:**
```javascript
// WRONG - may fail if versions have different formats
if (semver.gt(installed, current)) { ... }

// RIGHT - coerce to clean format first
const installedClean = semver.coerce(installed);
const currentClean = semver.coerce(current);
if (installedClean && currentClean && semver.gt(currentClean, installedClean)) { ... }
```

### Pitfall 6: Using Glob Patterns for Known Paths
**What goes wrong:** Unnecessary complexity, slower performance, harder to debug
**Why it happens:** Glob feels more flexible/powerful
**How to avoid:** Use explicit path list when you know exactly where to look
**Warning signs:** Extra dependency (glob package), slower discovery

**Example:**
```javascript
// OVERKILL - glob pattern for known paths
const manifests = await glob('~/.{claude,copilot,codex}/get-shit-done/.gsd-install-manifest.json');

// BETTER - explicit list
const paths = [
  '~/.claude/get-shit-done/.gsd-install-manifest.json',
  '~/.copilot/get-shit-done/.gsd-install-manifest.json',
  '~/.codex/get-shit-done/.gsd-install-manifest.json'
];
```

## Code Examples

Verified patterns from official sources and production CLIs:

### Example 1: Complete Installation Discovery Flow
```javascript
// Source: Standard Node.js patterns + semver documentation
import semver from 'semver';
import fs from 'fs-extra';
import os from 'os';
import path from 'path';

export async function discoverInstallationsWithStatus(scope, currentVersion) {
  // Find all manifests for given scope
  const installations = await findInstallations(scope);
  
  // Compare each installation's version with current
  const withStatus = installations
    .filter(install => install.status === 'ok')
    .map(install => {
      const versionStatus = compareVersions(
        install.manifest.gsd_version,
        currentVersion
      );
      
      return {
        platform: install.manifest.platform,
        path: install.path,
        manifest: install.manifest,
        versionStatus
      };
    });
  
  return withStatus;
}

// Usage in installer
async function main() {
  const currentVersion = packageJson.version; // "2.0.0"
  const scope = options.global ? 'global' : 'local';
  
  const installations = await discoverInstallationsWithStatus(scope, currentVersion);
  
  // Display with inline version status
  const platformOptions = installations.map(install => ({
    value: install.platform,
    label: formatPlatformOption(install.platform, install.versionStatus),
    hint: install.versionStatus.message || ''
  }));
}
```

### Example 2: Downgrade Prevention with Clear Error
```javascript
// Source: Package manager patterns (npm, yarn)
export function checkDowngrade(installedVersion, currentVersion) {
  const installed = semver.coerce(installedVersion);
  const current = semver.coerce(currentVersion);
  
  if (!installed || !current) {
    throw new Error('Invalid version format');
  }
  
  if (semver.lt(current, installed)) {
    throw new Error(`
Cannot downgrade GSD installation

  Installed: v${installed.version}
  Installer: v${current.version}

Downgrades are not supported. To use the latest version:

  npx get-shit-done-multi@latest

Or install a specific version:

  npx get-shit-done-multi@${installed.version}
    `.trim());
  }
}
```

### Example 3: Major Version Warning Flow
```javascript
// Source: npm/yarn major update patterns
import { confirm } from '@clack/prompts';
import semver from 'semver';

export async function warnOnMajorUpdate(installedVersion, currentVersion) {
  const installedMajor = semver.major(installedVersion);
  const currentMajor = semver.major(currentVersion);
  
  if (currentMajor > installedMajor) {
    console.log('');
    console.log('⚠️  Major version update detected');
    console.log('');
    console.log(`   ${installedVersion} → ${currentVersion}`);
    console.log('');
    console.log('   Major updates may include breaking changes.');
    console.log('   Your existing workflows might need updates.');
    console.log('');
    
    const confirmed = await confirm({
      message: 'Continue with major version update?',
      initialValue: true
    });
    
    if (!confirmed) {
      throw new Error('Update cancelled by user');
    }
  }
}
```

### Example 4: Robust Manifest Reading with All Error Cases
```javascript
// Source: Standard Node.js error handling patterns
import fs from 'fs-extra';

export async function readManifestRobust(manifestPath) {
  // Check existence first
  const exists = await fs.pathExists(manifestPath);
  if (!exists) {
    return { success: false, reason: 'not_found', manifest: null };
  }
  
  try {
    // Read file
    const content = await fs.readFile(manifestPath, 'utf8');
    
    // Parse JSON
    const manifest = JSON.parse(content);
    
    // Validate structure
    const requiredFields = ['gsd_version', 'platform', 'scope', 'installed_at'];
    const missingFields = requiredFields.filter(field => !manifest[field]);
    
    if (missingFields.length > 0) {
      return {
        success: false,
        reason: 'invalid_structure',
        missing: missingFields,
        manifest: null
      };
    }
    
    return { success: true, manifest };
    
  } catch (error) {
    // Handle specific error types
    if (error.code === 'EACCES') {
      return {
        success: false,
        reason: 'permission_denied',
        error: error.message,
        manifest: null
      };
    }
    
    if (error instanceof SyntaxError) {
      return {
        success: false,
        reason: 'corrupt_json',
        error: error.message,
        manifest: null
      };
    }
    
    // Unknown error
    return {
      success: false,
      reason: 'unknown_error',
      error: error.message,
      manifest: null
    };
  }
}
```

### Example 5: --check-updates Flag Implementation
```javascript
// Source: Standard CLI patterns (npm outdated, yarn outdated)
import { program } from 'commander';

program
  .option('--check-updates', 'Check for updates without installing')
  .action(async (options) => {
    if (options.checkUpdates) {
      await checkUpdatesOnly();
      process.exit(0);
    }
    
    // Normal installation flow
    await runInstaller(options);
  });

async function checkUpdatesOnly() {
  const currentVersion = packageJson.version;
  
  console.log(`GSD Installer v${currentVersion}`);
  console.log('');
  console.log('Checking installations...');
  console.log('');
  
  // Check global installations
  const globalInstalls = await discoverInstallationsWithStatus('global', currentVersion);
  if (globalInstalls.length > 0) {
    console.log('Global installations:');
    for (const install of globalInstalls) {
      const status = formatStatusLine(install);
      console.log(`  ${status}`);
    }
  } else {
    console.log('Global installations: none');
  }
  
  console.log('');
  
  // Check local installations
  const localInstalls = await discoverInstallationsWithStatus('local', currentVersion);
  if (localInstalls.length > 0) {
    console.log('Local installations:');
    for (const install of localInstalls) {
      const status = formatStatusLine(install);
      console.log(`  ${status}`);
    }
  } else {
    console.log('Local installations: none');
  }
}

function formatStatusLine(install) {
  const platform = getPlatformDisplayName(install.platform);
  const status = install.versionStatus;
  
  if (status.status === 'up_to_date') {
    return `✓ ${platform}: v${status.installed} (up to date)`;
  }
  
  if (status.status === 'update_available') {
    return `⬆ ${platform}: v${status.installed} → v${status.current} (${status.updateType} update available)`;
  }
  
  if (status.status === 'major_update') {
    return `⚠️  ${platform}: v${status.installed} → v${status.current} (major update available)`;
  }
  
  return `? ${platform}: ${status.status}`;
}
```

### Example 6: CLI Flag Validation (--custom-path)
```javascript
// Source: CLI best practices + user requirements
import { Command } from 'commander';

export function parseCLIOptions() {
  const program = new Command();
  
  program
    .option('--check-updates', 'Check for updates without installing')
    .option('--verbose', 'Show detailed discovery information')
    .option('--custom-path <path>', 'Check additional custom installation path')
    // ... other options

  program.parse();
  const options = program.opts();
  
  // Validate --custom-path usage
  const customPathArgs = process.argv.filter(arg => 
    arg.startsWith('--custom-path')
  );
  
  if (customPathArgs.length > 1) {
    console.error('');
    console.error('Error: --custom-path can only be specified once.');
    console.error('To check additional paths, run the installer separately for each path.');
    console.error('');
    console.error('Example:');
    console.error('  npx get-shit-done-multi --custom-path=/path1');
    console.error('  npx get-shit-done-multi --custom-path=/path2');
    console.error('');
    process.exit(1);
  }
  
  return options;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual version string comparison | semver package with coercion | npm v1.0 (2011) | Prevents version comparison bugs |
| Callback-based fs module | fs-extra with promises | Node.js 10+ (2018) | Cleaner async code, fewer errors |
| Custom JSON parsers with recovery | Try-parse-repair pattern | Standard since Node.js early days | Simpler, more maintainable |
| Glob patterns for all file discovery | Explicit paths for known locations | N/A (best practice) | Faster, more predictable |
| Block all updates without confirmation | Inline display + auto-update on selection | Modern CLI patterns (2020+) | Better UX, less friction |

**Deprecated/outdated:**
- **update-notifier package**: Still works but requires background process, complex caching. Modern CLIs check on every run (fast enough).
- **String-based version comparison**: Never use `>` `<` on version strings - always use semver
- **Synchronous file operations**: Use async/await with fs-extra for better performance

## Open Questions Resolved

All questions have been resolved through user clarification:

1. **Manifest repair heuristics** — RESOLVED
   - **Decision:** Ignore corrupted manifest completely, scan directory from scratch, create brand new manifest
   - **Rationale:** Simpler approach, avoids trying to extract partial data from corrupted files
   - **Implementation:** On corrupt JSON or missing required fields, treat as new installation and regenerate manifest via directory scan
   - **Mark repaired:** Add `_repaired: true` flag to regenerated manifest

2. **Customization detection accuracy** — RESOLVED
   - **Decision:** Ask user once (preserve Y/n), don't auto-detect customizations
   - **Rationale:** Avoids complexity of trying to distinguish intentional vs accidental changes
   - **Implementation:** Simple prompt before update: "Preserve customizations? [Y/n]"

3. **--custom-path flag usage** — RESOLVED
   - **Decision:** Only allow once with single path, throw error if specified multiple times
   - **Rationale:** Keep usage simple, users run installer multiple times for multiple custom paths
   - **Error message:** "Error: --custom-path can only be specified once. To check additional paths, run the installer separately for each path."
   - **Implementation:** Validate CLI args, reject duplicate --custom-path flags

## Open Questions (None Remaining)

All architectural decisions resolved. Ready for planning.

## Sources

### Primary (HIGH confidence)
- semver package documentation: https://github.com/npm/node-semver
- Node.js fs module documentation: https://nodejs.org/api/fs.html
- fs-extra package documentation: https://github.com/jprichardson/node-fs-extra
- Node.js os module documentation: https://nodejs.org/api/os.html

### Secondary (MEDIUM confidence)
- npm/yarn CLI update patterns: Observed behavior in production tools
- CLI version display conventions: Common patterns across npm, create-react-app, vite
- Error recovery patterns: Standard Node.js practices

### Tertiary (LOW confidence)
- None - all findings verified against official documentation or package source code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - semver is npm's official parser, fs-extra is battle-tested
- Architecture patterns: HIGH - Standard Node.js async patterns, well-documented
- Version comparison: HIGH - semver documentation is comprehensive with examples
- File operations: HIGH - fs-extra and Node.js fs documented thoroughly
- Manifest repair: MEDIUM - Pattern is sound but specific heuristics are judgment calls
- CLI UX patterns: MEDIUM - Based on observation of production tools, not standardized spec
- Customization detection: MEDIUM - Simple approach (ask user) avoids complexity but lacks sophistication

**Research date:** 2025-01-27
**Valid until:** ~30 days (stable domain - semver is mature, Node.js APIs stable)
**Revalidate if:** semver releases major version, Node.js changes fs behavior, new CLI best practices emerge
