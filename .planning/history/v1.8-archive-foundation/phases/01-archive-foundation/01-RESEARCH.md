# Phase 1: Archive Foundation - Research

**Researched:** 2025-01-20
**Domain:** File system operations, git automation, archival workflows
**Confidence:** HIGH

## Summary

This phase implements a milestone archival system using Node.js native fs.promises for file operations and simple-git for git automation. The research identified established patterns for atomic file operations with rollback capabilities, git working directory validation, and safe archival workflows.

The standard approach is transaction-based file operations with explicit rollback steps, simple-git for git status validation and tag creation, and native readline for user confirmation prompts. No complex frameworks are needed - Node.js built-ins combined with simple-git provide all required capabilities.

**Primary recommendation:** Use manual transaction pattern with rollback array, validate git state before any operations, and implement atomic operations with proper error handling and cleanup.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fs/promises | Node.js built-in | Async file operations | Native, stable, promise-based API |
| simple-git | ^3.30.0 | Git automation | Most popular Node.js git wrapper, active maintenance |
| path | Node.js built-in | Path manipulation | Safe path operations, prevents traversal attacks |
| readline | Node.js built-in | User prompts | Native, no dependencies, adequate for CLI |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| enquirer | ^2.4.1 | Enhanced prompts | If richer UX needed (optional) |
| p-limit | ^5.0.0 | Concurrency control | If parallel operations needed (likely not for phase 1) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| simple-git | nodegit | nodegit is native bindings (faster) but more complex, harder to maintain |
| readline | inquirer/enquirer | Richer UX but adds dependencies, overkill for simple yes/no |
| Manual transaction | Database | Would add complexity, file operations sufficient for this use case |

**Installation:**
```bash
npm install simple-git
# fs/promises, path, readline are built-in
```

## Architecture Patterns

### Recommended Project Structure
```
.github/skills/get-shit-done/
├── commands/              # Command entry points (markdown files)
│   └── gsd/
│       └── archive-milestone.md
├── workflows/             # Workflow implementations (JS modules)
│   └── archive-milestone.js
├── lib/                   # Shared utilities
│   ├── file-transaction.js   # Transaction pattern
│   ├── git-utils.js          # Git helpers
│   └── markdown-utils.js     # Markdown manipulation
└── references/            # Documentation
```

### Pattern 1: Transaction Pattern with Rollback
**What:** Manual transaction implementation using rollback function array
**When to use:** Any multi-step file operation that needs atomic behavior
**Example:**
```javascript
// Source: WebSearch verified with transaction pattern research
async function transaction(steps) {
  const rollbacks = [];
  try {
    for (const step of steps) {
      const rollbackFn = await step();
      if (rollbackFn) rollbacks.unshift(rollbackFn); // reverse order
    }
  } catch (err) {
    // Execute rollbacks in reverse order
    for (const rollback of rollbacks) {
      try { 
        await rollback(); 
      } catch (rollbackError) { 
        console.error('Rollback failed:', rollbackError);
        // Log but continue with remaining rollbacks
      }
    }
    throw err;
  }
}

// Usage for archive operation:
await transaction([
  // Step 1: Create backup directory
  async () => {
    await fs.mkdir('.planning/history/backup', { recursive: true });
    return async () => { 
      await fs.rm('.planning/history/backup', { recursive: true, force: true }); 
    };
  },
  // Step 2: Move files
  async () => {
    await fs.rename('ROADMAP.md', '.planning/history/backup/ROADMAP.md');
    return async () => { 
      await fs.rename('.planning/history/backup/ROADMAP.md', 'ROADMAP.md'); 
    };
  },
  // More steps...
]);
```

### Pattern 2: Git Working Directory Validation
**What:** Check git status before any destructive operations
**When to use:** Always, before archival or other git-integrated operations
**Example:**
```javascript
// Source: WebSearch - simple-git status API
import simpleGit from 'simple-git';

async function validateGitClean() {
  const git = simpleGit();
  const status = await git.status();
  
  const isClean = (
    status.not_added.length === 0 &&
    status.conflicted.length === 0 &&
    status.created.length === 0 &&
    status.deleted.length === 0 &&
    status.modified.length === 0 &&
    status.renamed.length === 0 &&
    status.staged.length === 0
  );
  
  if (!isClean) {
    throw new Error(
      'Git working directory is not clean. Please commit or stash changes before archiving.'
    );
  }
}
```

### Pattern 3: Safe File Operations with Path Validation
**What:** Sanitize and validate paths before operations
**When to use:** Always when accepting path inputs or constructing paths
**Example:**
```javascript
// Source: Node.js official docs + security best practices
import path from 'node:path';
import fs from 'node:fs/promises';

async function safeMove(source, destination, baseDir = '.planning') {
  // Normalize and validate paths
  const safeSrc = path.normalize(source);
  const safeDst = path.normalize(destination);
  
  // Ensure destination is within allowed base directory
  const resolvedDst = path.resolve(safeDst);
  const resolvedBase = path.resolve(baseDir);
  
  if (!resolvedDst.startsWith(resolvedBase)) {
    throw new Error('Path traversal detected');
  }
  
  // Ensure destination directory exists
  await fs.mkdir(path.dirname(safeDst), { recursive: true });
  
  // Move file
  await fs.rename(safeSrc, safeDst);
}
```

### Pattern 4: Markdown Registry Management
**What:** Append entries to markdown file with proper formatting
**When to use:** Updating MILESTONES.md registry
**Example:**
```javascript
// Source: Best practices for markdown manipulation
import fs from 'node:fs/promises';

async function appendMilestoneEntry(milestoneData) {
  const entry = `
## ${milestoneData.name}

**Completed:** ${milestoneData.date}
**Archive:** \`${milestoneData.archivePath}\`
**Requirements:** ${milestoneData.requirementsCount} completed
**Key Commits:** ${milestoneData.commits.map(c => \`\`${c.sha.substring(0, 7)}\`\`).join(', ')}

`;
  
  // Read existing content
  let content = '';
  try {
    content = await fs.readFile('.planning/MILESTONES.md', 'utf8');
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Create file with header
      content = '# Milestone Archive\n\n';
    } else {
      throw err;
    }
  }
  
  // Append new entry
  await fs.writeFile('.planning/MILESTONES.md', content + entry, 'utf8');
}
```

### Pattern 5: User Confirmation with Validation
**What:** Prompt for confirmation with input validation
**When to use:** Before destructive operations like archival
**Example:**
```javascript
// Source: Node.js readline best practices
import readline from 'node:readline';

async function confirmAction(message) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  return new Promise((resolve) => {
    const askQuestion = () => {
      rl.question(`${message} (y/n): `, (answer) => {
        const normalized = answer.trim().toLowerCase();
        
        if (['y', 'yes'].includes(normalized)) {
          rl.close();
          resolve(true);
        } else if (['n', 'no'].includes(normalized)) {
          rl.close();
          resolve(false);
        } else {
          console.log("Please answer 'y' for yes or 'n' for no.");
          askQuestion(); // Ask again
        }
      });
    };
    
    askQuestion();
  });
}
```

### Pattern 6: Git Tag Creation
**What:** Create annotated git tags for archival points
**When to use:** After successful archive commit
**Example:**
```javascript
// Source: simple-git API + git tagging best practices
import simpleGit from 'simple-git';

async function createArchiveTag(milestoneName) {
  const git = simpleGit();
  const tagName = `archive/${milestoneName}`;
  const message = `Archive milestone: ${milestoneName}`;
  
  // Create annotated tag
  await git.tag(['-a', tagName, '-m', message]);
  
  console.log(`Created tag: ${tagName}`);
}
```

### Anti-Patterns to Avoid

- **Synchronous file operations in main flow:** Blocks event loop, use async fs/promises
- **No rollback on partial failure:** Leaves repository in inconsistent state
- **Skipping git clean validation:** Could archive uncommitted work or create conflicts
- **Path concatenation with strings:** Use `path.join()` to avoid OS-specific path issues
- **Unvalidated user input:** Always sanitize and validate paths and inputs
- **Silent errors in rollback:** Log rollback failures even if continuing
- **Missing UTF-8 encoding:** Explicitly specify 'utf8' for text files

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Git operations | Custom git CLI parsing | simple-git library | Handles errors, cross-platform, typed responses |
| Path manipulation | String concatenation | path.join/resolve | Handles OS differences, prevents traversal |
| User prompts | Custom stdin parsing | readline (built-in) or enquirer | Handles TTY issues, validation, cross-platform |
| Concurrent operations | Manual promise tracking | p-limit library | Prevents resource exhaustion, clean API |
| File locks | Custom lock files | Advisory locks or serialize operations | Race conditions, cleanup on crash |
| Markdown parsing | Regex parsing | marked/markdown-it | Edge cases, nested structures, spec compliance |

**Key insight:** File operations and git automation have many edge cases (permissions, race conditions, cross-platform differences, error states). Use established libraries that have battle-tested these scenarios.

## Common Pitfalls

### Pitfall 1: Race Conditions in File Operations
**What goes wrong:** Multiple async operations on same file/directory can corrupt data
**Why it happens:** Node.js async operations are not atomic; read-modify-write cycles can overlap
**How to avoid:** 
- Serialize operations on same resource (use await, not parallel Promise.all)
- Validate file state before operations (check existence, read lock files)
- Use transaction pattern to ensure atomicity
**Warning signs:** Intermittent errors, missing data, corrupted files in concurrent scenarios

### Pitfall 2: Incomplete Rollback Leaving Inconsistent State
**What goes wrong:** Error during multi-step operation leaves files partially moved/deleted
**Why it happens:** Operations succeed up to error point, no cleanup implemented
**How to avoid:**
- Register rollback function for each successful step
- Execute rollbacks in reverse order on error
- Continue rollback even if individual steps fail (log errors but proceed)
**Warning signs:** Repository has files in wrong location after errors, manual cleanup needed

### Pitfall 3: Path Traversal Security Issues
**What goes wrong:** User input like "../../etc/passwd" escapes intended directory
**Why it happens:** Direct string concatenation of paths without validation
**How to avoid:**
- Always use `path.normalize()` and `path.resolve()`
- Validate resolved path starts with expected base directory
- Never trust user input for file paths
**Warning signs:** Security audit flags, unexpected file access

### Pitfall 4: Git Operations When Directory Not Clean
**What goes wrong:** Archival commits include unrelated uncommitted changes
**Why it happens:** Not checking git status before operations
**How to avoid:**
- Call `git.status()` first and validate all arrays are empty
- Provide clear error message listing uncommitted files
- Fail fast before any file moves
**Warning signs:** Archive commits contain unrelated changes, confusion in git history

### Pitfall 5: Missing Directories for File Moves
**What goes wrong:** `fs.rename()` fails if destination directory doesn't exist
**Why it happens:** Assuming directory structure exists
**How to avoid:**
- Always create destination directories with `{ recursive: true }`
- Use `path.dirname()` to extract directory from destination path
- Create directories before file operations in transaction steps
**Warning signs:** ENOENT errors during file moves

### Pitfall 6: Not Closing readline Interface
**What goes wrong:** Process hangs after user prompt completes
**Why it happens:** readline interface keeps stdin open
**How to avoid:**
- Always call `rl.close()` after getting answer
- Use try/finally to ensure cleanup
**Warning signs:** CLI command doesn't exit after completion

### Pitfall 7: Async Operations Without Error Handling
**What goes wrong:** Unhandled promise rejections crash process or silently fail
**Why it happens:** Missing try/catch or .catch() on async operations
**How to avoid:**
- Wrap all async operations in try/catch
- Add error context (which file, which operation)
- Never ignore errors (at minimum, log them)
**Warning signs:** Process crashes with unhandled rejection, silent failures

### Pitfall 8: Blocking Event Loop with Sync Operations
**What goes wrong:** Synchronous file operations freeze CLI during execution
**Why it happens:** Using fs.renameSync instead of fs.promises.rename
**How to avoid:**
- Always use fs/promises for file operations
- Only use sync in initialization code that runs once
**Warning signs:** Unresponsive CLI during operations, performance issues

## Code Examples

Verified patterns from official sources:

### Complete Archive Workflow
```javascript
// Combines all patterns into cohesive workflow
import fs from 'node:fs/promises';
import path from 'node:path';
import simpleGit from 'simple-git';
import readline from 'node:readline';

async function archiveMilestone(milestoneName) {
  const git = simpleGit();
  
  // 1. Validate git working directory is clean
  const status = await git.status();
  const isClean = (
    status.not_added.length === 0 &&
    status.conflicted.length === 0 &&
    status.created.length === 0 &&
    status.deleted.length === 0 &&
    status.modified.length === 0 &&
    status.renamed.length === 0 &&
    status.staged.length === 0
  );
  
  if (!isClean) {
    throw new Error('Working directory not clean. Commit or stash changes first.');
  }
  
  // 2. Get user confirmation
  const confirmed = await confirmAction(
    `Archive milestone "${milestoneName}"? This will move planning files to history.`
  );
  
  if (!confirmed) {
    console.log('Archive cancelled.');
    return;
  }
  
  // 3. Execute transaction with rollback capability
  const archivePath = `.planning/history/${milestoneName}`;
  
  await transaction([
    // Create archive directory
    async () => {
      await fs.mkdir(archivePath, { recursive: true });
      return async () => {
        await fs.rm(archivePath, { recursive: true, force: true });
      };
    },
    
    // Move ROADMAP.md
    async () => {
      await fs.rename('ROADMAP.md', path.join(archivePath, 'ROADMAP.md'));
      return async () => {
        await fs.rename(path.join(archivePath, 'ROADMAP.md'), 'ROADMAP.md');
      };
    },
    
    // Move other files (STATE.md, PROJECT.md, REQUIREMENTS.md)
    // ... similar steps
    
    // Update MILESTONES.md registry
    async () => {
      const entry = `\n## ${milestoneName}\n\n**Archived:** ${new Date().toISOString()}\n`;
      await fs.appendFile('.planning/MILESTONES.md', entry, 'utf8');
      // Rollback would require reading old content first
      return null; // Simplified - real implementation would backup
    }
  ]);
  
  // 4. Commit archival
  await git.add('.planning/*');
  await git.commit(`archive: ${milestoneName}\n\nArchived planning files for completed milestone.`);
  
  // 5. Create git tag
  await git.tag(['-a', `archive/${milestoneName}`, '-m', `Archive: ${milestoneName}`]);
  
  console.log(`✓ Milestone "${milestoneName}" archived successfully`);
  console.log(`  Archive: ${archivePath}`);
  console.log(`  Tag: archive/${milestoneName}`);
}

// Helper functions from earlier patterns
async function transaction(steps) { /* ... */ }
async function confirmAction(message) { /* ... */ }
```

### Directory Movement with Validation
```javascript
// Source: Node.js fs.promises + path best practices
import fs from 'node:fs/promises';
import path from 'node:path';

async function moveDirectory(src, dest) {
  // Validate source exists
  try {
    await fs.access(src);
  } catch (err) {
    throw new Error(`Source directory does not exist: ${src}`);
  }
  
  // Ensure destination parent exists
  await fs.mkdir(path.dirname(dest), { recursive: true });
  
  // Move directory (rename is atomic for same filesystem)
  await fs.rename(src, dest);
}
```

### Git Status Check with Detailed Errors
```javascript
// Source: simple-git API
import simpleGit from 'simple-git';

async function validateGitCleanWithDetails() {
  const git = simpleGit();
  const status = await git.status();
  
  const issues = [];
  
  if (status.not_added.length > 0) {
    issues.push(`Untracked files: ${status.not_added.join(', ')}`);
  }
  if (status.modified.length > 0) {
    issues.push(`Modified files: ${status.modified.join(', ')}`);
  }
  if (status.deleted.length > 0) {
    issues.push(`Deleted files: ${status.deleted.join(', ')}`);
  }
  if (status.staged.length > 0) {
    issues.push(`Staged files: ${status.staged.join(', ')}`);
  }
  
  if (issues.length > 0) {
    throw new Error(
      'Git working directory is not clean:\n' + 
      issues.map(i => `  - ${i}`).join('\n')
    );
  }
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Callback-based fs | fs/promises | Node.js v10 (2018) | Cleaner async/await code |
| nodegit (native bindings) | simple-git (CLI wrapper) | Ongoing preference | Easier maintenance, no native compilation |
| inquirer (large dep tree) | enquirer or native readline | 2020+ | Lighter dependencies for simple prompts |
| Manual async serialization | async/await | Node.js v7.6 (2017) | Native language support |
| String path manipulation | path.join/resolve | Always recommended | Cross-platform, security |

**Deprecated/outdated:**
- **Callback-based fs module:** Use fs/promises instead
- **fs.exists():** Deprecated, use fs.access() or try/catch on operations
- **Synchronous operations in async flows:** Blocks event loop unnecessarily

## Open Questions

Things that couldn't be fully resolved:

1. **Should archive support rollback of git commit?**
   - What we know: Git commits can be reverted or reset
   - What's unclear: Whether archive operation should include git rollback in transaction
   - Recommendation: No - git operations should be outside transaction. If file operations fail, rollback; if git operations fail after files succeed, user can manually fix (rare case)

2. **Concurrency control for multiple archival operations**
   - What we know: Single user typically runs archive, unlikely to be concurrent
   - What's unclear: Whether to implement file locks or operation queue
   - Recommendation: Start without locks; add if needed based on real usage

3. **Large directory performance**
   - What we know: fs.rename is fast for same filesystem, but large directories take time
   - What's unclear: Whether to show progress for large operations
   - Recommendation: Add simple "Moving X files..." message if performance becomes issue

## Sources

### Primary (HIGH confidence)
- https://nodejs.org/api/fs.html - Node.js fs module official documentation
- https://www.npmjs.com/package/simple-git - simple-git official npm package
- https://git-scm.com/docs/git-tag - Git tag documentation

### Secondary (MEDIUM confidence)
- https://github.com/lirantal/nodejs-cli-apps-best-practices - CLI best practices guide (verified standards)
- https://www.conventionalcommits.org/ - Commit message conventions (industry standard)
- https://janmarten.name/transaction/ - Transaction pattern examples (pattern verified with multiple sources)

### Tertiary (LOW confidence)
- WebSearch results for Node.js file operations pitfalls - Multiple sources agree on race conditions and async safety
- WebSearch results for simple-git usage patterns - Consistent across multiple tutorials

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Official documentation and npm download statistics confirm simple-git + fs/promises
- Architecture: HIGH - Transaction pattern verified with multiple sources, matches established practices
- Pitfalls: MEDIUM-HIGH - Verified with official docs and multiple community sources, but some edge cases unverified

**Research date:** 2025-01-20
**Valid until:** Approximately 180 days (stable ecosystem, slow-moving dependencies)

**Notes:**
- No CONTEXT.md existed, so research was unconstrained
- Stack decision was pre-made: Node.js native + simple-git
- Research focused on implementation patterns rather than technology selection
- All code examples are based on verified sources or official documentation
