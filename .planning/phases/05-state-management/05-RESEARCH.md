# Phase 5: State Management — CLI Interoperability - Research

**Researched:** 2025-01-19
**Domain:** File-based state management with concurrent access
**Confidence:** MEDIUM

## Summary

Phase 5 requires implementing a file-based state management system that allows multiple CLI processes (Claude Code, GitHub Copilot CLI, Codex CLI) to safely read and write to the same `.planning/` directory without corruption or data loss. The challenge is that Node.js **does not provide built-in file locking**, so we must implement atomic operations and concurrency control using only Node.js built-ins (zero npm dependencies per project constraints).

The standard approach combines three patterns:
1. **Write-then-rename for atomicity** - Write to temp file, then `fs.promises.rename()` atomically
2. **Directory-based locking** - Use `fs.promises.mkdir()` as atomic lock acquisition
3. **Optimistic locking with versioning** - Detect conflicts at commit time rather than preventing them

**Primary recommendation:** Implement atomic file operations using write-then-rename pattern, combined with directory-based locking for multi-process coordination, and version-based conflict detection for concurrent CLI usage.

## Standard Stack

Since the project uses zero npm dependencies (Node.js built-ins only), all patterns must use core Node.js modules.

### Core
| Module | Version | Purpose | Why Standard |
|--------|---------|---------|--------------|
| fs/promises | Node.js 20+ | Async file operations | Promise-based API, non-blocking I/O, built-in |
| crypto | Node.js 20+ | SHA-256 checksums for integrity | Built-in hash functions for file validation |
| path | Node.js 20+ | Cross-platform path handling | Essential for Windows/Linux compatibility |
| perf_hooks | Node.js 20+ | Performance tracking | Sub-millisecond timing for operations |

### Supporting
| Module | Version | Purpose | When to Use |
|--------|---------|---------|-------------|
| process.env | Node.js 20+ | CLI detection via environment variables | Detect which CLI is running |
| util.parseArgs | Node.js 20+ | CLI argument parsing | Stable since v20, zero dependencies |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Built-in patterns | write-file-atomic (npm) | Would violate zero-dependency constraint |
| Directory locks | proper-lockfile (npm) | Adds dependency, but handles stale locks better |
| Manual validation | Ajv JSON Schema (npm) | Adds dependency, but provides standard validation |

**Installation:**
No installation required - all built-in Node.js modules.

## Architecture Patterns

### Recommended Project Structure
```
.planning/
├── config.json          # CLI configuration (fallback order, retry settings)
├── usage.json           # API usage tracking per CLI
├── state.json           # Session state
├── .lock/               # Directory-based lock (created/deleted atomically)
└── phases/
    ├── 01-foundation/
    │   ├── PLAN.md
    │   └── .state.json  # Phase-specific state
    └── ...
```

### Pattern 1: Atomic Write-Then-Rename
**What:** Write data to temp file, then atomically rename to target
**When to use:** All file writes to ensure atomicity
**Example:**
```typescript
// Source: Node.js official docs + community patterns
async function atomicWrite(filePath, data) {
  const tempPath = `${filePath}.tmp`;
  
  try {
    // Write to temp file with restrictive permissions
    await fs.promises.writeFile(tempPath, data, { mode: 0o600 });
    
    // Atomic rename (on same filesystem/volume)
    await fs.promises.rename(tempPath, filePath);
  } catch (err) {
    // Clean up temp file on error
    await fs.promises.unlink(tempPath).catch(() => {});
    throw err;
  }
}
```

**CRITICAL CAVEAT:** `fs.promises.rename()` is only atomic **within the same filesystem**. Cross-volume moves return `EXDEV` error and require manual copy-then-delete (not atomic).

### Pattern 2: Directory-Based Locking
**What:** Use `fs.mkdir()` as atomic lock acquisition
**When to use:** Multi-process coordination
**Example:**
```typescript
// Source: Community zero-dependency pattern
async function withLock(lockDir, operation, maxRetries = 5) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Atomic lock acquisition
      await fs.promises.mkdir(lockDir);
      
      try {
        return await operation();
      } finally {
        // Always release lock
        await fs.promises.rmdir(lockDir);
      }
    } catch (err) {
      if (err.code === 'EEXIST') {
        // Lock held by another process - wait and retry
        const delay = Math.min(100 * Math.pow(2, attempt), 2000);
        await new Promise(r => setTimeout(r, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error(`Failed to acquire lock after ${maxRetries} attempts`);
}
```

### Pattern 3: Optimistic Locking with Version Numbers
**What:** Each state file includes version number, detect conflicts at write time
**When to use:** Concurrent CLI operations where conflicts are rare
**Example:**
```typescript
// Source: Database concurrency patterns adapted for files
async function optimisticUpdate(filePath, updateFn) {
  // Read current state and version
  const current = await readJSON(filePath);
  const currentVersion = current._version || 0;
  
  // Apply updates
  const updated = updateFn(current);
  updated._version = currentVersion + 1;
  
  // Atomic write-then-rename
  await atomicWrite(filePath, JSON.stringify(updated, null, 2));
  
  // If another process wrote between read and write, we'll overwrite
  // Solution: Add version check after write or use locking
}
```

### Pattern 4: Checksum-Based Integrity
**What:** Calculate SHA-256 hash after write, verify before read
**When to use:** Detect corruption from crashes or concurrent writes
**Example:**
```typescript
// Source: Node.js crypto module
const crypto = require('crypto');
const fs = require('fs/promises');

async function checksumFile(filePath) {
  const hash = crypto.createHash('sha256');
  const stream = fs.createReadStream(filePath);
  
  for await (const chunk of stream) {
    hash.update(chunk);
  }
  
  return hash.digest('hex');
}

async function writeWithChecksum(filePath, data) {
  await atomicWrite(filePath, data);
  const checksum = crypto.createHash('sha256').update(data).digest('hex');
  await atomicWrite(`${filePath}.sha256`, checksum);
}

async function verifyAndRead(filePath) {
  const data = await fs.readFile(filePath, 'utf8');
  const expectedChecksum = await fs.readFile(`${filePath}.sha256`, 'utf8');
  const actualChecksum = crypto.createHash('sha256').update(data).digest('hex');
  
  if (actualChecksum !== expectedChecksum) {
    throw new Error('File integrity check failed - corruption detected');
  }
  
  return data;
}
```

### Pattern 5: State Migration with Version Detection
**What:** Store schema version in state, migrate when version changes
**When to use:** GSD version upgrades that change state format
**Example:**
```typescript
// Source: Database migration patterns
const CURRENT_STATE_VERSION = 2;

async function migrateState(stateDir) {
  const metaPath = path.join(stateDir, '.meta.json');
  
  let meta = { version: 1 };
  try {
    meta = JSON.parse(await fs.readFile(metaPath, 'utf8'));
  } catch {}
  
  if (meta.version === CURRENT_STATE_VERSION) return;
  
  // Backup before migration
  const backupDir = path.join(stateDir, `backup-v${meta.version}-${Date.now()}`);
  await fs.mkdir(backupDir, { recursive: true });
  await fs.cp(stateDir, backupDir, { recursive: true });
  
  // Apply migrations in order
  for (let v = meta.version; v < CURRENT_STATE_VERSION; v++) {
    await migrations[v](stateDir);
  }
  
  // Update version
  await atomicWrite(metaPath, JSON.stringify({ version: CURRENT_STATE_VERSION }));
}
```

### Anti-Patterns to Avoid
- **Check-then-act (TOCTOU):** Don't check file existence then write - just write and handle errors
- **Global variables for state:** Each function should accept state path, enabling testing and isolation
- **Partial writes:** Always write to temp file first, never write directly to state files
- **Ignoring EXDEV errors:** Handle cross-volume rename failures with proper error messages

## Don't Hand-Roll

Problems that look simple but have existing solutions or critical edge cases:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File locking | OS-level fcntl/flock wrapper | Directory-based locking pattern | Node.js doesn't expose native locks, directory creation is atomic |
| JSON schema validation | Custom validator | Manual type checks + JSDoc | Ajv requires npm dependency; hand-rolled validation is good enough for internal state |
| Retry logic | Custom backoff implementation | Exponential backoff pattern | Easy to get wrong (thundering herd, infinite loops); use tested pattern |
| Stale lock detection | Timestamp-based cleanup | Process-based cleanup on startup | Timestamps can drift; better to check locks on CLI startup |
| JSON repair | Corruption recovery | Fail fast + restore from backup | Silent corruption fixes hide data loss; better to detect and alert |

**Key insight:** File locking is OS-dependent and Node.js doesn't expose it. The directory-based locking pattern using `fs.mkdir()` is the zero-dependency standard, though it requires manual stale lock cleanup.

## Common Pitfalls

### Pitfall 1: Cross-Platform Rename Atomicity
**What goes wrong:** `fs.rename()` behavior differs between Windows and Unix
**Why it happens:** Windows doesn't guarantee atomicity, especially with file locks or antivirus
**How to avoid:** 
- Always use same-volume renames (check with `EXDEV` error)
- Test on both platforms
- Document that `.planning/` must be on same filesystem as project
**Warning signs:** `EPERM` errors on Windows, intermittent rename failures

### Pitfall 2: TOCTOU Race Conditions
**What goes wrong:** Check if file exists, then write - another process writes in between
**Why it happens:** File operations are not atomic across multiple calls
**How to avoid:**
- Never check existence before writing
- Use try/catch and handle errors
- Combine check and action in single atomic operation where possible
**Warning signs:** Intermittent "file already exists" errors, data loss

### Pitfall 3: Partial Writes During Crashes
**What goes wrong:** Process crashes mid-write, leaving corrupted JSON
**Why it happens:** `writeFile()` is not atomic, data written in chunks
**How to avoid:**
- Always use write-then-rename pattern
- Keep temp files in same directory as target (ensures same filesystem)
- Clean up temp files on CLI startup
**Warning signs:** JSON parse errors, truncated files, empty files

### Pitfall 4: Concurrent Writes Without Locking
**What goes wrong:** Two CLIs write to same file simultaneously, last write wins (data loss)
**Why it happens:** File operations are not serialized across processes
**How to avoid:**
- Use directory-based locking for all writes
- Implement retry logic with exponential backoff
- Detect conflicts with version numbers
**Warning signs:** Lost updates, inconsistent state, user reports data disappearing

### Pitfall 5: Stale Lock Files
**What goes wrong:** Process crashes while holding lock, lock directory never removed
**Why it happens:** No cleanup on abnormal exit
**How to avoid:**
- Clean up locks on CLI startup (check process still exists)
- Use timeout + retry rather than waiting forever
- Log lock acquisition attempts for debugging
**Warning signs:** CLI hangs waiting for lock, manual `.lock` directory removal needed

### Pitfall 6: Cross-Device Rename (EXDEV)
**What goes wrong:** Rename fails with EXDEV when source and dest on different filesystems
**Why it happens:** `.planning/` on different mount point, symlink, network drive
**How to avoid:**
- Catch EXDEV error and show clear message
- Use copy-then-delete as fallback (but document non-atomicity)
- Validate `.planning/` location on init
**Warning signs:** "Cross-device link" errors, rename failures on specific systems

### Pitfall 7: JSON Corruption from Concurrent Reads
**What goes wrong:** Read partially-written JSON file during write operation
**Why it happens:** Another process writing while this process reading
**How to avoid:**
- Use read locks (directory-based) for critical reads
- Retry JSON parse errors once (may catch mid-write)
- Validate JSON structure after parse
**Warning signs:** Intermittent JSON parse errors, unexpected null values

### Pitfall 8: Lock Directory on Network Filesystem
**What goes wrong:** mkdir atomicity not guaranteed on NFS, SMB
**Why it happens:** Network filesystems have different consistency guarantees
**How to avoid:**
- Detect network filesystem and warn user
- Use process ID + hostname in lock directory name
- Implement lease/timeout mechanism
**Warning signs:** Multiple processes acquire lock simultaneously, corruption on shared drives

## Code Examples

Verified patterns from official sources:

### Atomic File Write (Production-Ready)
```typescript
// Source: Node.js official docs + WebSearch verified patterns
import { promises as fs } from 'fs';
import path from 'path';

async function atomicWriteJSON(filePath, data) {
  const tempPath = `${filePath}.${process.pid}.tmp`;
  const jsonData = JSON.stringify(data, null, 2);
  
  try {
    // Write to temp file in same directory (ensures same filesystem)
    await fs.writeFile(tempPath, jsonData, { 
      mode: 0o600,  // Restrictive permissions
      encoding: 'utf8'
    });
    
    // Atomic rename (POSIX guarantees atomicity on same filesystem)
    await fs.rename(tempPath, filePath);
  } catch (err) {
    // Clean up temp file on any error
    try {
      await fs.unlink(tempPath);
    } catch {}
    
    if (err.code === 'EXDEV') {
      throw new Error(
        `Cannot atomically write to ${filePath}: crosses filesystem boundary. ` +
        `Ensure .planning/ directory is on same filesystem as project.`
      );
    }
    
    throw err;
  }
}
```

### Directory-Based Locking (Zero Dependencies)
```typescript
// Source: WebSearch + community patterns
import { promises as fs } from 'fs';
import path from 'path';

class DirectoryLock {
  constructor(lockPath, options = {}) {
    this.lockPath = lockPath;
    this.maxRetries = options.maxRetries || 10;
    this.baseDelay = options.baseDelay || 100;
  }
  
  async acquire() {
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Atomic lock acquisition
        await fs.mkdir(this.lockPath);
        return true;
      } catch (err) {
        if (err.code === 'EEXIST') {
          // Lock held by another process
          // Check if stale (optional: add PID file check here)
          
          // Exponential backoff with jitter
          const delay = this.baseDelay * Math.pow(2, attempt);
          const jitter = Math.random() * 100;
          await new Promise(r => setTimeout(r, delay + jitter));
          continue;
        }
        throw err;
      }
    }
    throw new Error(`Failed to acquire lock at ${this.lockPath} after ${this.maxRetries} attempts`);
  }
  
  async release() {
    try {
      await fs.rmdir(this.lockPath);
    } catch (err) {
      // Ignore ENOENT - lock already released
      if (err.code !== 'ENOENT') throw err;
    }
  }
  
  async withLock(operation) {
    await this.acquire();
    try {
      return await operation();
    } finally {
      await this.release();
    }
  }
}

// Usage:
const lock = new DirectoryLock('.planning/.lock');
await lock.withLock(async () => {
  // Critical section - only one CLI at a time
  const state = await readState();
  state.lastUpdate = Date.now();
  await writeState(state);
});
```

### State Read with Retry and Validation
```typescript
// Source: Resilience patterns + WebSearch
async function readStateWithRetry(filePath, maxAttempts = 3) {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      const state = JSON.parse(content);
      
      // Basic validation
      if (!state._version || typeof state._version !== 'number') {
        throw new Error('Invalid state: missing or invalid _version');
      }
      
      return state;
    } catch (err) {
      if (err instanceof SyntaxError && attempt < maxAttempts - 1) {
        // JSON parse error - might be mid-write, retry
        await new Promise(r => setTimeout(r, 50));
        continue;
      }
      
      if (err.code === 'ENOENT') {
        // File doesn't exist - return initial state
        return { _version: 0 };
      }
      
      throw err;
    }
  }
}
```

### CLI Detection via Environment
```typescript
// Source: Node.js official docs + process.env patterns
function detectCLI() {
  // Check environment variables
  if (process.env.GITHUB_COPILOT_CLI) return 'github-copilot-cli';
  if (process.env.CODEX_CLI) return 'codex-cli';
  if (process.env.CLAUDE_CODE) return 'claude-code';
  
  // Fallback: check process title or argv
  const processName = process.title.toLowerCase();
  if (processName.includes('copilot')) return 'github-copilot-cli';
  if (processName.includes('codex')) return 'codex-cli';
  if (processName.includes('claude')) return 'claude-code';
  
  return 'unknown';
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Synchronous fs operations | fs/promises with async/await | Node.js 10+ | Better performance, non-blocking I/O |
| npm packages for locking | Built-in directory locks | Zero-dependency trend 2024+ | Simpler, no supply chain risk |
| Manual JSON validation | Type checking + JSDoc | TypeScript decline 2024 | Sufficient for internal state |
| process.env manual parsing | util.parseArgs | Node.js 20+ | Built-in arg parsing, no yargs needed |
| dotenv package | --env-file flag | Node.js 20.6+ | Built-in .env support |

**Deprecated/outdated:**
- `write-file-atomic` npm package: Zero-dependency implementations now preferred
- `proper-lockfile` npm package: Directory-based locking is sufficient for this use case
- Synchronous fs APIs: Blocks event loop, avoid in production code
- `fs.exists()`: Deprecated, causes race conditions (TOCTOU)

## Open Questions

Things that couldn't be fully resolved:

1. **Network Filesystem Support**
   - What we know: mkdir atomicity not guaranteed on NFS/SMB
   - What's unclear: Should we detect and block, or allow with warnings?
   - Recommendation: Detect via `fsPromises.stat()` filesystem type, show warning but allow

2. **Stale Lock Cleanup Strategy**
   - What we know: Need to clean up locks from crashed processes
   - What's unclear: PID files vs. timeout-based vs. startup cleanup
   - Recommendation: Startup cleanup + timeout (10 second max lock age)

3. **JSON Schema Validation Without Dependencies**
   - What we know: No built-in JSON Schema validator in Node.js
   - What's unclear: How much manual validation is sufficient?
   - Recommendation: Basic type checks + required field validation, document expected schema

4. **Cross-CLI Session Persistence**
   - What we know: Need session state to survive CLI restart/switch
   - What's unclear: What belongs in session vs. phase state vs. config?
   - Recommendation: Session = temp work, Phase = committed work, Config = user prefs

5. **Retry vs. Fail-Fast for Lock Acquisition**
   - What we know: Can retry with exponential backoff
   - What's unclear: When to give up and show error vs. keep retrying?
   - Recommendation: 10 retries (max 10 seconds), then fail with clear message about concurrent usage

## Sources

### Primary (HIGH confidence)
- Node.js fs API docs: https://nodejs.org/api/fs.html
- Node.js crypto API docs: https://nodejs.org/api/crypto.html
- Node.js environment variables: https://nodejs.org/api/environment_variables.html

### Secondary (MEDIUM confidence)
- Directory-based locking pattern: WebSearch verified with multiple sources
- Write-then-rename pattern: Node.js docs + community best practices
- Exponential backoff: WebSearch verified resilience patterns
- Cross-platform file handling: Node.js docs + GitHub awesome-cross-platform-nodejs

### Tertiary (LOW confidence)
- Network filesystem detection: Community discussions, needs validation
- Stale lock cleanup strategies: Multiple approaches, no clear consensus
- Manual JSON validation patterns: Project-specific, not standardized

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All Node.js built-ins, official documentation
- Architecture: MEDIUM - Patterns verified but not battle-tested in this context
- Pitfalls: HIGH - Well-documented in community and official sources

**Research date:** 2025-01-19
**Valid until:** ~30 days (Node.js fs API stable, patterns unlikely to change)
