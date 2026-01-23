# Phase 7: Multi-Platform Testing - Research

**Researched:** 2025-01-23
**Domain:** CLI integration testing across multiple platforms
**Confidence:** MEDIUM

## Summary

Multi-platform CLI testing requires testing 29 GSD commands across 3 platforms (Claude Code, GitHub Copilot CLI, Codex CLI) with comprehensive regression testing. The standard approach uses isolated test environments per platform, automated installation testing, manual command verification, and exact output comparison for regression testing.

The project already has a testing foundation using Node.js native `assert` module and `child_process`, but requirements specify adding Jest for new test coverage. The standard stack adds process execution libraries (execa), output comparison tools (strip-ansi, diff), test isolation utilities (tmp), and concurrency control (p-map) to the existing foundation.

Key architectural pattern: Sequential platform testing (not parallel) with isolated directory per platform, clean reinstall before each test, and structured test results in JSON/YAML format for programmatic analysis.

**Primary recommendation:** Keep existing native test infrastructure, add Jest for new spec/platform tests, use execa for reliable process execution, strip-ansi for output comparison, and p-map for parallel command testing within each platform.

## Standard Stack

The established libraries/tools for Node.js CLI integration testing:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Jest | 30.x | Full-featured testing framework | Industry standard, rich ecosystem, snapshot testing, parallel execution, mature |
| execa | 9.x (ESM), 5.x (CommonJS) | Process execution | Better child_process API, promise-based, cross-platform, proper error handling, timeout support |
| strip-ansi | 7.x | Remove ANSI escape codes | Essential for output comparison, handles all ANSI standards, widely used |
| diff | 8.x | Create unified diffs | Show exact text differences, standard diff algorithm implementation |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| p-map | 7.x | Parallel execution with concurrency control | Testing multiple commands in parallel within single platform |
| p-limit | 5.x | Concurrency limiter | Rate limiting for resource-intensive operations |
| tmp / tmp-promise | 0.2.x | Temporary directory management | Creating isolated test directories with automatic cleanup |
| which | 4.x | Find executables in PATH | Verify CLI tools are installed and accessible |
| fs-extra | 11.x | Enhanced fs operations | Recursive copy, move, remove operations for test setup |

### Native Node.js (No Dependencies)
| Module | Purpose | When to Use |
|--------|---------|-------------|
| assert | Simple assertions | Existing tests, lightweight unit tests |
| child_process | Process spawning | When execa overhead not justified |
| fs/promises | File operations | Modern async file operations |
| path | Path manipulation | Always for cross-platform path handling |
| os | Platform detection | Detecting OS, EOL, temp directory |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Jest | Vitest | Vitest is faster/modern but less mature for CommonJS projects |
| Jest | Node.js test runner (node:test) | Native test runner has no dependencies but fewer features |
| execa | child_process | Native module works but requires manual error handling, timeout management |
| p-map | Promise.all with chunking | Manual implementation error-prone, missing backpressure handling |

**Installation:**
```bash
# For Phase 7 additions (Jest test suite)
npm install --save-dev jest execa@5 strip-ansi diff p-map tmp-promise which

# Note: execa@5 for CommonJS compatibility (project uses "type": "commonjs")
# execa@9 is ESM-only and would require package.json changes
```

## Architecture Patterns

### Recommended Project Structure
```
test-environments/             # Isolated testing (gitignored)
├── copilot-test/
│   ├── get-shit-done/        # Full repo clone
│   └── test-results.json
├── claude-test/
│   └── ...
└── codex-test/
    └── ...

scripts/
├── test-cross-platform.js    # Orchestration script (exists)
├── test-platform-install.js  # New: Install testing
├── test-platform-commands.js # New: Command testing
└── test-regression.js        # New: Regression testing

__tests__/                     # Jest tests (Phase 7)
├── spec-parsing.test.js      # TEST-01
├── conditional-rendering.test.js  # TEST-02
├── frontmatter-validation.test.js # TEST-03
├── metadata-generation.test.js    # TEST-04
└── platform-integration.test.js   # TEST-05

bin/lib/
├── orchestration/            # Existing tests stay
│   ├── *.test.js            # Keep native assert tests
│   └── ...
└── template-system/
    ├── *.test.js            # Keep native assert tests
    └── ...
```

### Pattern 1: Isolated Test Environment per Platform

**What:** Create separate, isolated directory for each platform with complete repo clone

**When to use:** Multi-platform testing where platforms may interfere with each other

**Why:** Prevents cross-contamination, enables clean state guarantees, allows testing git operations safely

**Implementation:**
```javascript
const path = require('path');
const { mkdirSync, rmSync } = require('fs');
const { execSync } = require('child_process');

async function setupPlatformEnvironment(platform) {
  const testRoot = path.join(process.cwd(), 'test-environments');
  const platformDir = path.join(testRoot, `${platform}-test`);
  const repoDir = path.join(platformDir, 'get-shit-done');
  
  // Clean state - remove existing
  rmSync(platformDir, { recursive: true, force: true });
  mkdirSync(platformDir, { recursive: true });
  
  // Clone current repo
  execSync(`git clone ${process.cwd()} ${repoDir}`, {
    cwd: platformDir,
    stdio: 'inherit'
  });
  
  return { platformDir, repoDir };
}
```

**Critical details:**
- Use full repo clone, not symlinks (git operations require real repo)
- Clean state before each test run (rmSync with force: true)
- Clone from current directory (not remote) to test local changes
- Return both platformDir and repoDir for different operations

### Pattern 2: Sequential Platform Testing

**What:** Test one platform completely before moving to next platform

**When to use:** Testing platforms that might interfere with global state

**Why:** Prevents race conditions, clearer failure attribution, easier debugging

**Implementation:**
```javascript
async function orchestrateTests(platforms, commands) {
  const results = { platforms: {} };
  
  // Sequential, not parallel
  for (const platform of platforms) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`Testing platform: ${platform}`);
    console.log('='.repeat(60));
    
    const env = await setupPlatformEnvironment(platform);
    
    try {
      // Phase 1: Installation
      results.platforms[platform] = {
        install: await testInstallation(env, commands),
        commands: await testCommands(env, commands),
        regression: await testRegression(env, commands)
      };
    } catch (error) {
      results.platforms[platform].error = error.message;
    } finally {
      await cleanupEnvironment(env);
    }
  }
  
  return results;
}
```

**Don't:**
```javascript
// ANTI-PATTERN: Parallel platform testing
await Promise.all(platforms.map(p => testPlatform(p)));
// Causes: Race conditions, unclear failures, resource conflicts
```

### Pattern 3: Command Output Comparison for Regression

**What:** Capture and compare exact output between legacy and spec-based commands

**When to use:** Regression testing to ensure spec-based commands match legacy behavior

**Implementation:**
```javascript
const { execa } = require('execa');
const stripAnsi = require('strip-ansi');
const diff = require('diff');

async function compareCommandOutputs(command, args, options = {}) {
  const execOptions = {
    reject: false,  // Don't throw on non-zero exit
    timeout: 30000,
    env: { ...process.env, NO_COLOR: '1' },  // Disable colors
    ...options
  };
  
  // Execute and capture
  const result = await execa(command, args, execOptions);
  
  // Normalize output
  const stdout = stripAnsi(result.stdout).trim();
  const stderr = stripAnsi(result.stderr).trim();
  
  return {
    stdout,
    stderr,
    exitCode: result.exitCode,
    command: `${command} ${args.join(' ')}`
  };
}

async function testRegression(legacyCommand, specCommand, args) {
  const legacy = await compareCommandOutputs(legacyCommand, args);
  const spec = await compareCommandOutputs(specCommand, args);
  
  // Compare outputs
  if (legacy.stdout === spec.stdout && 
      legacy.exitCode === spec.exitCode) {
    return { match: true };
  }
  
  // Generate diff for failures
  const patches = diff.createPatch(
    'output',
    legacy.stdout,
    spec.stdout,
    'Legacy',
    'Spec'
  );
  
  return {
    match: false,
    legacy: legacy.stdout,
    spec: spec.stdout,
    diff: patches,
    exitCodeMatch: legacy.exitCode === spec.exitCode
  };
}
```

**Critical details:**
- Use `NO_COLOR=1` environment variable to disable terminal colors
- Strip ANSI codes even with NO_COLOR (some tools ignore it)
- Compare both stdout AND exit codes
- Capture stderr for debugging even if test passes
- Use `reject: false` to prevent execa throwing on non-zero exit

### Pattern 4: Structured Test Results

**What:** JSON/YAML format for programmatic test result analysis

**When to use:** All test runs for automated reporting and triage

**Schema:**
```javascript
{
  version: '1.0.0',
  timestamp: '2025-01-23T10:30:00Z',
  platforms: {
    copilot: {
      install: {
        success: true,
        duration: '12.5s',
        commands_installed: 29
      },
      tests: [
        {
          command: 'gsd-plan-phase',
          success: true,
          output_match: true,
          duration: '1.2s'
        },
        {
          command: 'gsd-discuss-phase',
          success: false,
          error: 'Tool Edit not supported',
          severity: 'P0',
          category: 'platform-bug',
          stderr: '...'
        }
      ],
      regression: {
        total: 29,
        passed: 27,
        failed: 2
      }
    }
  }
}
```

**Implementation:**
```javascript
const fs = require('fs/promises');
const path = require('path');

async function saveTestResults(results, platform) {
  const outputPath = path.join(
    'test-environments',
    `${platform}-test`,
    'test-results.json'
  );
  
  await fs.writeFile(
    outputPath,
    JSON.stringify(results, null, 2),
    'utf8'
  );
  
  console.log(`Results saved to ${outputPath}`);
}
```

### Pattern 5: Parallel Command Testing with Concurrency Control

**What:** Test multiple commands in parallel within single platform, with rate limiting

**When to use:** Testing many commands (29 in this case) to reduce overall test time

**Implementation:**
```javascript
const pMap = require('p-map');

async function testCommandsParallel(commands, env, concurrency = 3) {
  console.log(`Testing ${commands.length} commands with concurrency ${concurrency}`);
  
  const results = await pMap(
    commands,
    async (command) => {
      const startTime = Date.now();
      
      try {
        const result = await testSingleCommand(command, env);
        return {
          command,
          success: true,
          duration: Date.now() - startTime,
          ...result
        };
      } catch (error) {
        return {
          command,
          success: false,
          duration: Date.now() - startTime,
          error: error.message,
          stderr: error.stderr
        };
      }
    },
    { concurrency }
  );
  
  return results;
}
```

**Concurrency tuning:**
- `concurrency: 1` - Sequential (debugging)
- `concurrency: 3` - Balanced (default)
- `concurrency: 5` - Aggressive (fast machine)
- `concurrency: 10+` - Risk of resource exhaustion

### Pattern 6: Failure Triage and Classification

**What:** Categorize each failure into 5 categories with severity levels

**Categories:**
1. **Platform bug** - Tool limitation (e.g., "Edit tool not supported")
2. **Spec bug** - Incorrect migration (e.g., "Parse error in YAML")
3. **Install bug** - Generation issue (e.g., "Command not found after install")
4. **Test setup bug** - Environment problem (e.g., "Permission denied")
5. **Expected difference** - Not a bug (e.g., "Version number in output")

**Implementation:**
```javascript
function classifyFailure(testResult) {
  const { command, error, stderr, platform } = testResult;
  
  // Platform bug patterns
  if (stderr.includes('tool not found') || 
      stderr.includes('not supported') ||
      stderr.includes('tool not available')) {
    return {
      category: 'platform-bug',
      severity: 'P0',  // Blocking
      description: `${platform} does not support required tool`,
      fix_plan: 'Add tool mapping or platform-specific conditional'
    };
  }
  
  // Spec bug patterns
  if (stderr.includes('parse error') ||
      stderr.includes('invalid yaml') ||
      error.includes('frontmatter')) {
    return {
      category: 'spec-bug',
      severity: 'P0',
      description: 'Spec file has syntax or validation error',
      fix_plan: 'Fix spec YAML frontmatter'
    };
  }
  
  // Install bug patterns
  if (error.includes('ENOENT') ||
      error.includes('command not found') ||
      error.includes('no such file')) {
    return {
      category: 'install-bug',
      severity: 'P0',
      description: 'Command not installed or path incorrect',
      fix_plan: 'Fix generation script or installation process'
    };
  }
  
  // Test setup bug patterns
  if (error.includes('EACCES') ||
      error.includes('permission denied') ||
      error.includes('EPERM')) {
    return {
      category: 'test-setup-bug',
      severity: 'P1',  // Non-blocking, fix environment
      description: 'Permission issue in test environment',
      fix_plan: 'Fix directory permissions or git config'
    };
  }
  
  // Expected difference patterns
  if (stderr.includes('version') ||
      error.includes('timestamp')) {
    return {
      category: 'expected-difference',
      severity: 'P1',
      description: 'Output difference is expected (version, timestamp, etc)',
      fix_plan: 'Document as expected or normalize in comparison'
    };
  }
  
  // Unknown - needs investigation
  return {
    category: 'unknown',
    severity: 'P0',  // Treat as blocking until investigated
    description: error,
    fix_plan: 'Investigate and reclassify'
  };
}
```

**Severity Levels:**
- **P0 (Blocking):** Must be fixed before phase completion
- **P1 (Non-blocking):** Should be fixed but doesn't block progress

### Pattern 7: Git Identity Verification in Tests

**What:** Verify git identity is preserved correctly across all platforms

**When to use:** Testing git operations to ensure Phase 5.1 identity preservation works

**Implementation:**
```javascript
const { execa } = require('execa');

async function verifyGitIdentity(repoDir, expected = {}) {
  try {
    // Get current git identity
    const nameResult = await execa('git', ['config', 'user.name'], {
      cwd: repoDir
    });
    const emailResult = await execa('git', ['config', 'user.email'], {
      cwd: repoDir
    });
    
    const actual = {
      name: nameResult.stdout.trim(),
      email: emailResult.stdout.trim()
    };
    
    // If expected provided, compare
    if (expected.name || expected.email) {
      const match = actual.name === expected.name &&
                   actual.email === expected.email;
      
      return {
        valid: match,
        actual,
        expected,
        message: match ? 'Git identity correct' : 'Git identity mismatch'
      };
    }
    
    // Otherwise just return what we found
    return {
      valid: !!(actual.name && actual.email),
      actual,
      message: actual.name && actual.email 
        ? 'Git identity configured' 
        : 'Git identity missing'
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      message: 'Failed to read git identity'
    };
  }
}
```

### Anti-Patterns to Avoid

**Don't: Share directories between platforms**
```javascript
// BAD: All platforms share same directory
const testDir = './test-shared';
platforms.forEach(p => testPlatform(p, testDir)); // Race conditions!

// GOOD: Isolated directory per platform
for (const platform of platforms) {
  const env = await setupPlatformEnvironment(platform);
  await testPlatform(platform, env);
}
```

**Don't: Ignore stderr**
```javascript
// BAD: Only check stdout
const { stdout } = await execa(command, args);
return stdout === expected; // Missed error details in stderr

// GOOD: Capture both stdout and stderr
const { stdout, stderr } = await execa(command, args);
return { stdout, stderr }; // Full context for debugging
```

**Don't: Hardcode path separators**
```javascript
// BAD: Platform-specific separator
const configPath = 'test/config/settings.json'; // Breaks on Windows with backslash

// GOOD: Use path.join()
const configPath = path.join('test', 'config', 'settings.json');
```

**Don't: Test platforms in parallel**
```javascript
// BAD: Parallel platform testing
await Promise.all(platforms.map(p => testPlatform(p)));

// GOOD: Sequential platform testing
for (const platform of platforms) {
  await testPlatform(platform);
}
```

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Process execution with timeout | Custom timeout wrapper around spawn | execa with timeout option | Signal handling is complex, cross-platform differences, zombie process prevention |
| ANSI code stripping | Regex-based escape code remover | strip-ansi | ANSI codes are complex (colors, cursor, styles), regex misses edge cases |
| Text diff generation | Custom diff algorithm | diff or jest-diff | Diff algorithms are complex (Myers algorithm), unified format requirements |
| Temporary directories | Manual temp dir creation/cleanup | tmp or tmp-promise | Unique name generation, automatic cleanup, signal handlers, race condition prevention |
| Concurrency control | Custom promise queue or semaphore | p-map or p-limit | Correct concurrency limiting is subtle, error propagation, backpressure management |
| Cross-platform paths | String concatenation with `/` or `\` | path.join() and path.resolve() | Windows vs Unix separators, normalization, UNC paths |
| Command lookup in PATH | Manual PATH searching | which package | Platform-specific PATH parsing, Windows PATHEXT handling, permission checking |
| Deep object comparison | Recursive equality checker | assert.deepStrictEqual | Circular references, property ordering, symbols, NaN handling |

**Key insight:** For CLI testing, NEVER hand-roll process execution, text comparison, or temporary directory management. These problems have subtle edge cases and well-tested libraries.

**When to hand-roll:**
- Domain-specific business logic (e.g., test result classification)
- Performance-critical paths where library overhead matters
- Library doesn't exist for exact use case
- Library is unmaintained or has critical bugs

## Common Pitfalls

### Pitfall 1: Environment Contamination

**What goes wrong:** Tests pollute global state, affecting each other

**Why it happens:**
- Installing CLIs globally instead of locally
- Modifying global git config instead of repo-specific
- Sharing directories between tests

**How to avoid:**
- Use isolated directories per test (separate repos per platform)
- Set git config in test repo, not globally
- Clean state before each test (rm -rf and re-clone)
- Never touch ~/.gitconfig or global PATH

**Warning signs:**
- Test passes alone but fails when run after other test
- Different results depending on test execution order
- Mysterious failures on CI but not locally

### Pitfall 2: Race Conditions in Parallel Tests

**What goes wrong:** Tests fail intermittently when run in parallel

**Why it happens:**
- Shared resources (ports, files, directories)
- Non-atomic operations (read-modify-write)
- Concurrent git operations on same repo

**How to avoid:**
- Each test gets unique directory
- Test platforms sequentially (not in parallel)
- Test commands within platform in parallel (they don't conflict)
- Use p-map concurrency control for command testing

**Warning signs:**
- Tests pass individually but fail when run together
- Intermittent failures with no code changes
- Failures only happen on multi-core machines

### Pitfall 3: Platform-Specific Path Issues

**What goes wrong:** Tests pass on Unix (macOS/Linux), fail on Windows

**Why it happens:**
- Hardcoded `/` separators (Windows uses `\`)
- Assuming case-sensitive filesystem
- Line ending differences (LF vs CRLF)

**How to avoid:**
- ALWAYS use path.join(), never string concatenation
- Normalize paths in comparisons: path.normalize()
- Use os.EOL for line endings, not `\n`
- Test on Windows if targeting Windows users

**Warning signs:**
- Works on macOS but not Windows
- Path comparison failures
- Git diff shows no changes but files are "modified"

### Pitfall 4: ANSI Code Pollution

**What goes wrong:** Output comparison fails due to invisible color codes

**Why it happens:**
- CLI outputs colors by default
- Different terminals use different ANSI codes
- Some tools ignore NO_COLOR environment variable

**How to avoid:**
- Set `NO_COLOR=1` environment variable
- Use strip-ansi on ALL captured output before comparison
- Don't assume `--no-color` flag exists (not standardized)
- Compare normalized output, not raw

**Warning signs:**
- Output "looks the same" visually but comparison fails
- Copy-paste into test passes, but captured output fails
- Works in some terminals but not others

### Pitfall 5: Incomplete Process Cleanup

**What goes wrong:** Child processes survive test completion, consume resources

**Why it happens:**
- Not killing spawned processes in cleanup
- Not waiting for process exit
- Detached processes continuing after parent exits

**How to avoid:**
- Use execa (handles cleanup automatically)
- Always use try/finally for cleanup
- Set timeouts on all process execution
- Track spawned processes, terminate in cleanup

**Warning signs:**
- CPU usage stays high after tests complete
- Port already in use errors
- Growing number of zombie processes
- Tests slow down after multiple runs

### Pitfall 6: Timeout Issues

**What goes wrong:** Tests hang indefinitely or fail with timeout

**Why it happens:**
- CLI tool waits for stdin input
- Network operations without timeout
- Deadlock in test code

**How to avoid:**
- Set reasonable timeouts (30s for CLI operations)
- Provide input to stdin or mock it
- Use timeout parameter in execa
- Fail fast on hang detection

**Warning signs:**
- Test hangs forever, must Ctrl+C
- Timeout errors without clear cause
- Tests that sometimes complete, sometimes hang

### Pitfall 7: Git Identity Issues

**What goes wrong:** Git commits fail or use wrong author

**Why it happens:**
- No user.name/user.email configured in test repo
- Git requires identity for commits
- Global config doesn't apply to test repo

**How to avoid:**
- Set git config in each test repo during setup
- Verify git identity before operations that need it
- Use GIT_AUTHOR_NAME/GIT_COMMITTER_NAME env vars as fallback
- Phase 5.1 git-identity-helpers.sh should be tested

**Warning signs:**
- "Please tell me who you are" git errors
- Commits attributed to wrong person
- Git operations fail in test but work manually

### Pitfall 8: Snapshot Brittleness

**What goes wrong:** Regression tests break on every run

**Why it happens:**
- Timestamps in output
- Absolute paths in output
- Random UUIDs or session IDs
- Performance metrics (duration, memory)

**How to avoid:**
- Normalize timestamps before comparison (replace with placeholder)
- Replace absolute paths with relative paths or [PROJECT_ROOT]
- Mock random values or strip UUIDs
- Remove performance data from output comparison

**Warning signs:**
- Every test run requires updating snapshots
- Failures with diff showing only timestamps/paths
- Tests fail on different machines due to paths

### Pitfall 9: False Negatives from Whitespace

**What goes wrong:** Tests fail on whitespace-only differences

**Why it happens:**
- Different line endings (LF vs CRLF)
- Trailing whitespace differences
- Indentation changes (tabs vs spaces)

**How to avoid:**
- Trim output before comparing: `.trim()`
- Normalize whitespace: `.replace(/\s+/g, ' ')`
- Use semantic comparison for structured output
- Split by line and compare arrays (ignores trailing newlines)

**Warning signs:**
- Diff shows no visible difference
- Fails on different platforms (Windows vs Unix)
- Copy-paste looks identical but comparison fails

### Pitfall 10: Insufficient Error Context

**What goes wrong:** Test fails, but unclear why

**Why it happens:**
- Not capturing stderr
- Not logging command that failed
- Not showing diff between expected/actual

**How to avoid:**
- ALWAYS capture stdout AND stderr
- Log full command with args: `${command} ${args.join(' ')}`
- Use diff library for clear failure messages
- Include exit code in failure reports
- Log environment variables if relevant

**Warning signs:**
- "Test failed" with no explanation
- Can't reproduce failure manually
- No idea which command failed

### Pitfall 11: Non-Deterministic Tests

**What goes wrong:** Tests pass sometimes, fail other times

**Why it happens:**
- Timing-dependent logic (race conditions)
- Parallel execution order assumptions
- Shared mutable state
- External dependencies (network, filesystem)

**How to avoid:**
- Make tests deterministic (same input = same output)
- Don't rely on execution order
- Avoid shared state between tests
- Mock external dependencies
- Use fixed seeds for random data

**Warning signs:**
- "Flaky" tests that fail intermittently
- Different results on different runs
- Works 90% of the time, fails 10%

## Code Examples

Verified patterns for common operations:

### Example 1: Setting Up Isolated Test Environment

```javascript
// Source: Based on test-cross-platform.js patterns
const path = require('path');
const { mkdirSync, rmSync } = require('fs');
const { execSync } = require('child_process');

async function setupPlatformEnvironment(platform) {
  const testRoot = path.join(process.cwd(), 'test-environments');
  const platformDir = path.join(testRoot, `${platform}-test`);
  const repoDir = path.join(platformDir, 'get-shit-done');
  
  console.log(`Setting up ${platform} test environment...`);
  
  // Clean state - remove existing directory
  rmSync(platformDir, { recursive: true, force: true });
  mkdirSync(platformDir, { recursive: true });
  
  // Clone current repo (tests local changes)
  console.log(`Cloning repo to ${repoDir}...`);
  execSync(`git clone ${process.cwd()} ${repoDir}`, {
    cwd: platformDir,
    stdio: 'inherit'
  });
  
  // Verify git identity in cloned repo
  const { stdout: name } = execSync('git config user.name', {
    cwd: repoDir,
    encoding: 'utf8'
  });
  const { stdout: email } = execSync('git config user.email', {
    cwd: repoDir,
    encoding: 'utf8'
  });
  
  console.log(`Git identity: ${name.trim()} <${email.trim()}>`);
  
  return { platformDir, repoDir };
}
```

### Example 2: Testing Command with Output Capture

```javascript
// Source: execa documentation + strip-ansi usage
const { execa } = require('execa');
const stripAnsi = require('strip-ansi');

async function testCommand(command, args, options = {}) {
  const startTime = Date.now();
  
  try {
    const result = await execa(command, args, {
      cwd: options.cwd,
      timeout: options.timeout || 30000,
      reject: false,  // Don't throw on non-zero exit
      env: {
        ...process.env,
        NO_COLOR: '1',  // Disable colors
        ...options.env
      }
    });
    
    return {
      success: result.exitCode === 0,
      exitCode: result.exitCode,
      stdout: stripAnsi(result.stdout).trim(),
      stderr: stripAnsi(result.stderr).trim(),
      duration: Date.now() - startTime,
      command: `${command} ${args.join(' ')}`
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      command: `${command} ${args.join(' ')}`
    };
  }
}
```

### Example 3: Regression Testing with Diff

```javascript
// Source: diff package documentation
const diff = require('diff');

async function compareCommandOutputs(legacyResult, specResult) {
  // Quick check for exact match
  if (legacyResult.stdout === specResult.stdout &&
      legacyResult.exitCode === specResult.exitCode) {
    return {
      match: true,
      message: 'Outputs match exactly'
    };
  }
  
  // Exit code mismatch is critical
  if (legacyResult.exitCode !== specResult.exitCode) {
    return {
      match: false,
      critical: true,
      message: `Exit code mismatch: ${legacyResult.exitCode} vs ${specResult.exitCode}`,
      legacy: legacyResult.stdout,
      spec: specResult.stdout
    };
  }
  
  // Generate unified diff
  const patches = diff.createPatch(
    'command-output',
    legacyResult.stdout,
    specResult.stdout,
    'Legacy',
    'Spec'
  );
  
  return {
    match: false,
    critical: false,
    diff: patches,
    legacy: legacyResult.stdout,
    spec: specResult.stdout
  };
}
```

### Example 4: Parallel Command Testing

```javascript
// Source: p-map documentation
const pMap = require('p-map');

async function testAllCommands(commands, env, options = {}) {
  const concurrency = options.concurrency || 3;
  
  console.log(`Testing ${commands.length} commands (concurrency: ${concurrency})...`);
  
  const results = await pMap(
    commands,
    async (command) => {
      try {
        const result = await testCommand(command, [], {
          cwd: env.repoDir,
          timeout: 30000
        });
        
        return {
          command,
          ...result
        };
      } catch (error) {
        return {
          command,
          success: false,
          error: error.message
        };
      }
    },
    { concurrency }
  );
  
  // Summary
  const passed = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log(`\nResults: ${passed} passed, ${failed} failed`);
  
  return { results, passed, failed };
}
```

### Example 5: Saving Structured Test Results

```javascript
// Source: Standard JSON output pattern
const fs = require('fs/promises');
const path = require('path');
const jsYaml = require('js-yaml');

async function saveTestResults(results, platform, format = 'json') {
  const outputDir = path.join('test-environments', `${platform}-test`);
  const outputFile = path.join(outputDir, `test-results.${format}`);
  
  const data = {
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    platform,
    ...results
  };
  
  let content;
  if (format === 'yaml') {
    content = jsYaml.dump(data, { indent: 2 });
  } else {
    content = JSON.stringify(data, null, 2);
  }
  
  await fs.writeFile(outputFile, content, 'utf8');
  console.log(`Results saved to ${outputFile}`);
  
  return outputFile;
}
```

### Example 6: Failure Classification

```javascript
// Source: Based on CONTEXT.md failure categories
function classifyFailure(testResult) {
  const { command, error, stderr, exitCode, platform } = testResult;
  
  // Platform bug: Tool not supported
  if (stderr.includes('tool not found') || 
      stderr.includes('not supported')) {
    return {
      category: 'platform-bug',
      severity: 'P0',
      description: `${platform} does not support required tool`,
      fix_plan: 'Add tool mapping or conditional content'
    };
  }
  
  // Spec bug: Parse/validation error
  if (stderr.includes('parse error') ||
      stderr.includes('invalid spec') ||
      stderr.includes('frontmatter')) {
    return {
      category: 'spec-bug',
      severity: 'P0',
      description: 'Spec file has syntax or validation error',
      fix_plan: 'Fix spec YAML frontmatter'
    };
  }
  
  // Install bug: Command not found
  if (error.includes('ENOENT') ||
      error.includes('command not found')) {
    return {
      category: 'install-bug',
      severity: 'P0',
      description: 'Command not installed correctly',
      fix_plan: 'Fix generation or installation script'
    };
  }
  
  // Test setup bug: Permission issue
  if (error.includes('EACCES') ||
      error.includes('permission denied')) {
    return {
      category: 'test-setup-bug',
      severity: 'P1',
      description: 'Permission issue in test environment',
      fix_plan: 'Fix directory permissions'
    };
  }
  
  // Expected difference: Version/timestamp
  if (stderr.includes('version') ||
      error.includes('timestamp')) {
    return {
      category: 'expected-difference',
      severity: 'P1',
      description: 'Expected output difference (version, timestamp)',
      fix_plan: 'Document or normalize in comparison'
    };
  }
  
  // Unknown - needs investigation
  return {
    category: 'unknown',
    severity: 'P0',
    description: error || 'Unknown failure',
    fix_plan: 'Investigate and reclassify'
  };
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Mocha/Chai for testing | Jest or Vitest | ~2020 | Better DX, built-in assertions, snapshots |
| Manual Promise.all() | p-map/p-limit | ~2018 | Concurrency control, better error handling |
| child_process directly | execa | ~2019 | Better API, cross-platform, proper cleanup |
| Manual ANSI stripping | strip-ansi | Always standard | Comprehensive, tested |
| Snapshot testing manual | Jest snapshots | ~2017 | Automated, version controlled |
| Node.js 12 and earlier | Node.js 16+ required | 2021 | Native promises fs, native test runner |

**Deprecated/outdated:**
- **Mocha + Chai:** Still works but Jest is more popular for new projects
- **tap/tape:** Minimalist testing fell out of favor for feature-rich Jest
- **ava:** Was popular ~2018 but Jest won mindshare
- **child_process without promises:** Use util.promisify or execa
- **mktemp command:** Use tmp library instead of shelling out

**Current (2025) trends:**
- Vitest gaining traction for ESM projects
- Node.js native test runner (node:test) for zero-dependency projects
- TypeScript testing with ts-jest or tsx
- Parallel testing by default (Jest, Vitest)

**Project-specific context:**
- Project uses CommonJS ("type": "commonjs")
- Existing tests use native assert module
- Requirements specify Jest (TEST-01 through TEST-07)
- Need execa@5 (CommonJS) not execa@9 (ESM-only)

## Open Questions

Things that couldn't be fully resolved:

1. **Jest vs Native Tests Coexistence**
   - What we know: Project has native assert tests, requirements want Jest
   - What's unclear: Should all tests migrate to Jest, or keep both?
   - Recommendation: Keep both - native tests for existing code, Jest for Phase 7 new tests

2. **Test Execution Time Budget**
   - What we know: 29 commands × 3 platforms = 87 command tests minimum
   - What's unclear: Acceptable time for full test suite (manual + automated)
   - Recommendation: Target 5-10 minutes for automated tests, document manual test time separately

3. **Platform CLI Installation Verification**
   - What we know: Need to test on Claude Code, Copilot CLI, Codex CLI
   - What's unclear: How to verify platform CLIs are correctly installed before testing
   - Recommendation: Use `which` to verify platform CLI exists, test with --version flag

4. **Output Normalization Edge Cases**
   - What we know: Need exact output match for regression
   - What's unclear: How to handle legitimate differences (version numbers, timestamps, paths)
   - Recommendation: Create normalization rules, document expected differences

5. **Jest Configuration for CommonJS Project**
   - What we know: Project is CommonJS, Jest defaults to ESM in recent versions
   - What's unclear: Exact Jest configuration needed
   - Recommendation: Verify jest.config.js with testEnvironment: 'node' and default transform

## Sources

### Primary (HIGH confidence)
- **npm registry (verified 2025-01-23):**
  - jest@30.2.0 - Latest version verified
  - execa@9.6.1 (ESM), 5.x (CommonJS) - Version compatibility verified
  - strip-ansi@7.1.2 - Current version
  - diff@8.0.3 - Current version
  - p-map@7.x, p-limit@5.x - Sindre Sorhus libraries

- **Project source code:**
  - `.planning/phases/07-multi-platform-testing/07-CONTEXT.md` - User decisions
  - `package.json` - Project dependencies and scripts
  - `bin/lib/orchestration/equivalence-test.js` - Existing test patterns
  - `scripts/test-cross-platform.js` - Test orchestration

### Secondary (MEDIUM confidence)
- **Node.js documentation:**
  - child_process module - Native process spawning
  - path module - Cross-platform path handling
  - os module - Platform detection
  - fs/promises - Modern async file operations

- **Common patterns:**
  - Sequential platform testing (prevents race conditions)
  - Isolated directories per platform (prevents contamination)
  - Strip ANSI before comparison (standard practice)

### Tertiary (LOW confidence - Claude training data)
- Library feature details beyond documentation
- Best practices without official source verification
- Version recommendations based on ecosystem knowledge
- Performance characteristics without benchmarks

**Note on confidence levels:**
- HIGH: Verified with npm registry, official docs, or project source
- MEDIUM: Standard patterns confirmed by multiple sources
- LOW: Based on Claude training data, needs verification

**Research limitations:**
- Context7 API not accessible during research
- No access to library changelogs for migration guidance
- Couldn't verify WebSearch results (would need external verification)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - npm versions verified, project source analyzed
- Architecture: HIGH - Based on existing project patterns and CONTEXT.md decisions
- Pitfalls: MEDIUM - Standard CLI testing pitfalls, not project-specific validation
- Code examples: HIGH - Based on existing project code and library documentation
- State of the art: LOW - Based on Claude training data about ecosystem trends

**Research date:** 2025-01-23
**Valid until:** Approximately 30 days (stable domain, but npm packages update frequently)

**Assumptions:**
1. Project stays CommonJS (no migration to ESM)
2. Node.js 16+ as stated in package.json engines
3. Testing on macOS/Linux (user's platform detection shows Unix paths)
4. GitHub as git remote (project uses GitHub)

**Research constraints from CONTEXT.md:**
- Isolated directories on same machine (not Docker/VMs)
- Separate repos per platform (3 clones)
- Same git identity for all platforms
- Sequential platform testing (Copilot → Claude → Codex)
- 100% success threshold (all 29 commands)
- Continue on failure (batch failures)
- Exact output match for regression
- 5 failure categories with P0/P1 severity
- JSON/YAML test results format
