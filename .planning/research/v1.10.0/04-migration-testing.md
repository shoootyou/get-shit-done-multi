# Migration, Testing & Documentation Strategy
# Milestone v1.9.2: Installation CLI Optimization

**Researched:** 2026-01-24  
**Confidence:** HIGH (based on Node.js ecosystem best practices, semver conventions, existing codebase patterns)

---

## Executive Summary

This milestone introduces **breaking changes** to CLI flag structure. Key decisions:

1. **Deprecation Strategy:** Soft deprecation with helpful warnings (2-3 release grace period)
2. **Versioning:** Requires **MINOR version bump** to v1.10.0 (not patch)
3. **Testing:** Multi-layer approach (unit → integration → E2E)
4. **Migration Path:** Clear warnings + documentation + automatic suggestion

**Recommendation:** Stage this as v1.10.0 with 2-release deprecation period before removing old flags in v1.11.0.

---

## 1. Deprecation & Migration Strategy

### 1.1 Detection Strategy

Detect deprecated flag usage patterns:

```javascript
// Detection logic for install.js
function detectDeprecatedFlags(args) {
  const deprecatedPatterns = [
    {
      pattern: () => (hasGlobal || hasLocal) && !hasPlatformFlag(),
      oldUsage: '--global or --local without platform',
      newUsage: '--claude --global (or --copilot, --codex)',
      severity: 'WARNING'
    },
    {
      pattern: () => args.includes('--local') && !args.includes('--claude') && !args.includes('--copilot') && !args.includes('--codex'),
      oldUsage: '--local',
      newUsage: '--claude --local (default behavior)',
      severity: 'WARNING'
    }
  ];
  
  return deprecatedPatterns.filter(p => p.pattern());
}

function hasPlatformFlag() {
  return hasClaude || hasCopilot || hasCodex || hasAll;
}
```

**Why detect before execution:** 
- Users get immediate feedback
- Prevents confusion about what was installed
- Enables helpful migration suggestions

### 1.2 Warning Message Template

```
┌────────────────────────────────────────────────────────────────┐
│ ⚠️  DEPRECATION WARNING                                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  The flag '--local' without a platform is deprecated.         │
│                                                                │
│  📌 What you typed:                                           │
│     npx get-shit-done-multi --local                           │
│                                                                │
│  ✅ Use this instead:                                         │
│     npx get-shit-done-multi --claude --local                  │
│                                                                │
│  💡 Why: GSD now supports multiple platforms. Specify which   │
│     platform(s) you want to install:                          │
│     --claude    (Claude Code)                                 │
│     --copilot   (GitHub Copilot CLI)                          │
│     --codex     (Codex CLI)                                   │
│     --all       (All platforms)                               │
│                                                                │
│  ⏱  This flag will be removed in v1.11.0 (planned Q2 2026)   │
│                                                                │
└────────────────────────────────────────────────────────────────┘

Continuing with default platform (Claude)...
```

**Design principles:**
- Box drawing for visual emphasis
- Clear "what you typed" vs "what to type" contrast
- Brief rationale (one line)
- Timeline for removal
- Graceful fallback behavior

### 1.3 Fallback Behavior (v1.10.0 - v1.10.x)

**Strategy: Soft deprecation with intelligent defaults**

```javascript
// Graceful fallback logic
function resolveInstallationTargets(args) {
  const deprecations = detectDeprecatedFlags(args);
  
  if (deprecations.length > 0) {
    // Show warning box
    showDeprecationWarning(deprecations);
    
    // Fall back to Claude (historical default)
    if (!hasPlatformFlag()) {
      console.log(`  ${dim}Defaulting to Claude Code installation...${reset}\n`);
      return { platforms: ['claude'], scope: hasGlobal ? 'global' : 'local' };
    }
  }
  
  // Normal flow for new flags
  return parseNewFlags(args);
}
```

**Why soft deprecation:**
- Users in CI/CD pipelines won't break immediately
- Scripts/tutorials have time to update
- Provides educational moment without friction
- Industry standard (npm, git, docker all use this pattern)

### 1.4 Hard Deprecation (v1.11.0+)

```javascript
// Error instead of warning
function validateFlags(args) {
  const deprecations = detectDeprecatedFlags(args);
  
  if (deprecations.length > 0) {
    console.error(`\n  ${red}ERROR: Unsupported flags detected${reset}\n`);
    deprecations.forEach(d => {
      console.error(`  ✗ ${d.oldUsage}`);
      console.error(`    Use: ${d.newUsage}\n`);
    });
    console.error(`  See migration guide: https://github.com/shoootyou/get-shit-done-multi/docs/migration-v1.11.md\n`);
    process.exit(1);
  }
}
```

### 1.5 Migration Timeline

| Version | Behavior | Communication |
|---------|----------|---------------|
| **v1.9.x (current)** | Old flags work silently | None (baseline) |
| **v1.10.0** | Deprecation warnings, fallback to Claude | README, CHANGELOG, warning message |
| **v1.10.x** | Same (2-3 minor releases) | Reminder in each release notes |
| **v1.11.0** | Hard error, installation fails | Migration guide, breaking change notice |

**Rationale:** 
- 2-3 minor releases = ~2-4 months based on current velocity
- Balances stability with progress
- Matches npm/Node.js deprecation timelines

---

## 2. Testing Strategy

### 2.1 Test Pyramid Structure

```
                    E2E Tests (5-10 scenarios)
                 ├─ Full install flow
                 ├─ Interactive menu
                 └─ Multi-platform install
              
           Integration Tests (15-25 scenarios)
        ├─ Platform adapters
        ├─ Flag parsing
        └─ Error handling

    Unit Tests (40-60 scenarios)
 ├─ Flag validation
 ├─ Message formatting
 └─ Path resolution
```

### 2.2 Unit Tests

**Location:** `__tests__/flag-parsing.test.js`

```javascript
describe('Flag Parsing (v1.10.0)', () => {
  describe('New flag system', () => {
    test('--claude flag sets platform to claude', () => {
      const result = parseFlags(['--claude']);
      expect(result.platforms).toContain('claude');
    });
    
    test('--copilot flag sets platform to copilot', () => {
      const result = parseFlags(['--copilot']);
      expect(result.platforms).toContain('copilot');
    });
    
    test('--codex flag sets platform to codex', () => {
      const result = parseFlags(['--codex']);
      expect(result.platforms).toContain('codex');
    });
    
    test('--all flag includes all platforms', () => {
      const result = parseFlags(['--all']);
      expect(result.platforms).toEqual(['claude', 'copilot', 'codex']);
    });
    
    test('Multiple platforms: --claude --copilot', () => {
      const result = parseFlags(['--claude', '--copilot']);
      expect(result.platforms).toEqual(['claude', 'copilot']);
    });
    
    test('Scope defaults to local', () => {
      const result = parseFlags(['--claude']);
      expect(result.scope).toBe('local');
    });
    
    test('--global flag sets scope to global', () => {
      const result = parseFlags(['--claude', '--global']);
      expect(result.scope).toBe('global');
    });
  });
  
  describe('Deprecated flag detection', () => {
    test('--local without platform triggers deprecation', () => {
      const warnings = detectDeprecatedFlags(['--local']);
      expect(warnings).toHaveLength(1);
      expect(warnings[0].oldUsage).toContain('--local');
    });
    
    test('--global without platform triggers deprecation', () => {
      const warnings = detectDeprecatedFlags(['--global']);
      expect(warnings).toHaveLength(1);
    });
    
    test('--claude --local does NOT trigger deprecation', () => {
      const warnings = detectDeprecatedFlags(['--claude', '--local']);
      expect(warnings).toHaveLength(0);
    });
  });
  
  describe('Invalid flag combinations', () => {
    test('--all with individual platform shows warning', () => {
      expect(() => parseFlags(['--all', '--claude'])).toThrow(/--all cannot be combined/);
    });
    
    test('--local --global conflict', () => {
      expect(() => parseFlags(['--local', '--global'])).toThrow(/Cannot specify both/);
    });
  });
});
```

**Location:** `__tests__/deprecation-warnings.test.js`

```javascript
describe('Deprecation Warning Messages', () => {
  test('Warning message includes old usage', () => {
    const message = generateDeprecationWarning({
      oldUsage: '--local',
      newUsage: '--claude --local'
    });
    expect(message).toContain('--local');
    expect(message).toContain('--claude --local');
  });
  
  test('Warning includes removal timeline', () => {
    const message = generateDeprecationWarning({
      oldUsage: '--local',
      newUsage: '--claude --local'
    });
    expect(message).toContain('v1.11.0');
  });
});
```

### 2.3 Integration Tests

**Location:** `__tests__/installation-flow.test.js`

```javascript
describe('Installation Flow Integration', () => {
  let tmpDir;
  
  beforeEach(async () => {
    tmpDir = await tmp.dir({ unsafeCleanup: true });
  });
  
  afterEach(async () => {
    await tmpDir.cleanup();
  });
  
  test('--claude --local creates .claude directory', async () => {
    await runInstall(['--claude', '--local'], tmpDir.path);
    
    const claudeDir = path.join(tmpDir.path, '.claude', 'skills');
    expect(fs.existsSync(claudeDir)).toBe(true);
  });
  
  test('--copilot --local creates .github/copilot directory', async () => {
    await runInstall(['--copilot', '--local'], tmpDir.path);
    
    const copilotDir = path.join(tmpDir.path, '.github', 'copilot', 'skills');
    expect(fs.existsSync(copilotDir)).toBe(true);
  });
  
  test('--all --local creates all three directories', async () => {
    await runInstall(['--all', '--local'], tmpDir.path);
    
    const claudeExists = fs.existsSync(path.join(tmpDir.path, '.claude', 'skills'));
    const copilotExists = fs.existsSync(path.join(tmpDir.path, '.github', 'copilot', 'skills'));
    const codexExists = fs.existsSync(path.join(tmpDir.path, '.codex', 'skills'));
    
    expect(claudeExists).toBe(true);
    expect(copilotExists).toBe(true);
    expect(codexExists).toBe(true);
  });
  
  test('--claude --copilot creates two directories', async () => {
    await runInstall(['--claude', '--copilot'], tmpDir.path);
    
    const claudeExists = fs.existsSync(path.join(tmpDir.path, '.claude', 'skills'));
    const copilotExists = fs.existsSync(path.join(tmpDir.path, '.github', 'copilot', 'skills'));
    const codexExists = fs.existsSync(path.join(tmpDir.path, '.codex', 'skills'));
    
    expect(claudeExists).toBe(true);
    expect(copilotExists).toBe(true);
    expect(codexExists).toBe(false); // Should NOT exist
  });
  
  test('Deprecated --local falls back to Claude with warning', async () => {
    const output = await runInstallWithOutput(['--local'], tmpDir.path);
    
    expect(output).toContain('DEPRECATION WARNING');
    expect(output).toContain('Defaulting to Claude');
    
    const claudeExists = fs.existsSync(path.join(tmpDir.path, '.claude', 'skills'));
    expect(claudeExists).toBe(true);
  });
});

describe('Platform Adapter Integration', () => {
  test('Claude adapter generates correct number of skills', async () => {
    const result = await claudeAdapter.install({ scope: 'local', targetDir: tmpDir.path });
    expect(result.generated).toBeGreaterThanOrEqual(29); // 29 skills expected
  });
  
  test('Copilot adapter generates correct number of skills', async () => {
    const result = await copilotAdapter.install({ scope: 'local', targetDir: tmpDir.path });
    expect(result.generated).toBeGreaterThanOrEqual(29);
  });
  
  test('Failed generation returns errors array', async () => {
    // Mock a generation failure
    jest.spyOn(fs, 'writeFile').mockRejectedValueOnce(new Error('Write failed'));
    
    const result = await claudeAdapter.install({ scope: 'local', targetDir: tmpDir.path });
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.failed).toBeGreaterThan(0);
  });
});
```

### 2.4 E2E Tests

**Location:** `__tests__/e2e/interactive-menu.test.js`

```javascript
describe('Interactive Menu E2E', () => {
  test('No flags launches interactive menu', async () => {
    const child = spawn('node', ['bin/install.js'], {
      env: { ...process.env, FORCE_TTY: 'true' }
    });
    
    let output = '';
    child.stdout.on('data', data => output += data.toString());
    
    await sleep(1000); // Wait for menu to render
    
    expect(output).toContain('Select platforms to install');
    expect(output).toContain('Claude Code');
    expect(output).toContain('GitHub Copilot CLI');
    expect(output).toContain('Codex CLI');
    
    child.kill();
  });
  
  test('Non-TTY environment shows helpful message', async () => {
    const result = await execa('node', ['bin/install.js'], {
      env: { ...process.env, CI: 'true' }
    });
    
    expect(result.stdout).toContain('Non-interactive environment detected');
    expect(result.stdout).toContain('--claude');
    expect(result.stdout).toContain('--copilot');
    expect(result.stdout).toContain('--codex');
  });
});

describe('Multi-Platform Installation E2E', () => {
  test('--all installs successfully in temp directory', async () => {
    const tmpDir = await tmp.dir({ unsafeCleanup: true });
    
    const result = await execa('node', ['bin/install.js', '--all', '--local'], {
      cwd: tmpDir.path
    });
    
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Installation complete');
    
    // Verify all directories created
    const dirs = ['..claude/skills', '.github/copilot/skills', '.codex/skills'];
    for (const dir of dirs) {
      const fullPath = path.join(tmpDir.path, dir);
      expect(fs.existsSync(fullPath)).toBe(true);
    }
    
    await tmpDir.cleanup();
  });
});
```

### 2.5 Error Handling Tests

**Location:** `__tests__/error-handling.test.js`

```javascript
describe('Error Handling', () => {
  describe('Invalid flag combinations', () => {
    test('--all with individual platform', async () => {
      const result = await execa('node', ['bin/install.js', '--all', '--claude'], {
        reject: false
      });
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('--all cannot be combined with individual platform flags');
    });
    
    test('--local and --global together', async () => {
      const result = await execa('node', ['bin/install.js', '--claude', '--local', '--global'], {
        reject: false
      });
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Cannot specify both --local and --global');
    });
  });
  
  describe('Platform availability', () => {
    test('Unsupported platform on current system shows warning', async () => {
      // Mock platform detection to return empty
      jest.spyOn(detect, 'detectInstalledCLIs').mockResolvedValue({
        claude: false,
        copilot: false,
        codex: false
      });
      
      const result = await execa('node', ['bin/install.js', '--claude'], {
        reject: false
      });
      
      expect(result.stdout).toContain('Claude Code not detected');
      expect(result.stdout).toContain('installation will proceed');
    });
  });
  
  describe('Permission errors', () => {
    test('Write permission denied shows clear error', async () => {
      const readOnlyDir = await tmp.dir();
      fs.chmodSync(readOnlyDir.path, 0o444); // Read-only
      
      const result = await execa('node', ['bin/install.js', '--claude', '--local'], {
        cwd: readOnlyDir.path,
        reject: false
      });
      
      expect(result.exitCode).toBe(1);
      expect(result.stderr).toContain('Permission denied');
      
      fs.chmodSync(readOnlyDir.path, 0o755); // Restore for cleanup
      await readOnlyDir.cleanup();
    });
  });
  
  describe('Partial installation failures', () => {
    test('1 of 3 platforms fails, shows summary', async () => {
      // Mock copilot adapter to fail
      jest.spyOn(copilotAdapter, 'install').mockRejectedValue(new Error('Network timeout'));
      
      const result = await execa('node', ['bin/install.js', '--all'], {
        reject: false
      });
      
      expect(result.stdout).toContain('Installation Summary');
      expect(result.stdout).toContain('Claude Code: ✓ Success');
      expect(result.stdout).toContain('Copilot CLI: ✗ Failed');
      expect(result.stdout).toContain('Codex CLI: ✓ Success');
      expect(result.exitCode).toBe(1); // Partial failure
    });
  });
});
```

### 2.6 CI/CD Environment Tests

**Location:** `__tests__/ci-environments.test.js`

```javascript
describe('CI/CD Environment Support', () => {
  test('CI=true env var detected as non-interactive', () => {
    const isInteractive = detectTTY({ CI: 'true' });
    expect(isInteractive).toBe(false);
  });
  
  test('Non-TTY stdout detected correctly', () => {
    const isInteractive = detectTTY({ stdout: { isTTY: false } });
    expect(isInteractive).toBe(false);
  });
  
  test('GitHub Actions environment', async () => {
    const result = await execa('node', ['bin/install.js', '--claude'], {
      env: { 
        ...process.env, 
        CI: 'true',
        GITHUB_ACTIONS: 'true'
      }
    });
    
    expect(result.stdout).not.toContain('Select platforms'); // No interactive menu
    expect(result.exitCode).toBe(0);
  });
});
```

### 2.7 Test Coverage Goals

| Area | Current | Target v1.10.0 | Notes |
|------|---------|----------------|-------|
| **Flag parsing** | 0% | 95%+ | New functionality, must be thorough |
| **Deprecation warnings** | 0% | 90%+ | Critical for user experience |
| **Installation flow** | ~30% | 75%+ | Integration tests + E2E |
| **Error handling** | ~40% | 80%+ | All error paths tested |
| **Platform adapters** | ~60% | 80%+ | Existing coverage + new tests |

**Rationale:**
- New functionality (flag parsing) needs highest coverage
- Error handling is critical for user experience
- Platform adapters already tested, incremental improvement

### 2.8 Testing Workflow

```bash
# Local development
npm test                          # Run all tests
npm test -- --watch              # Watch mode
npm test -- flag-parsing         # Specific test file
npm run test:coverage            # Coverage report

# CI/CD pipeline
npm run test:specs               # Unit tests (fast)
npm run test:installation        # Integration tests (medium)
npm run test:e2e                 # E2E tests (slow)
```

**CI strategy:**
- Unit tests: Every commit
- Integration tests: Every PR
- E2E tests: Pre-release only (slow, brittle)

---

## 3. Documentation Updates

### 3.1 Documentation Update Checklist

- [ ] **README.md**
  - [ ] Update Quick Start installation commands
  - [ ] Add examples of new flags
  - [ ] Add migration note for existing users
  - [ ] Update "What's New" section

- [ ] **docs/setup-claude-code.md**
  - [ ] Update installation commands to use `--claude`
  - [ ] Add examples: local vs global
  - [ ] Remove references to bare `--local`/`--global`

- [ ] **docs/setup-copilot-cli.md**
  - [ ] Update to use `--copilot` flag
  - [ ] Add global installation example
  - [ ] Cross-reference multi-platform installation

- [ ] **docs/setup-codex-cli.md**
  - [ ] Update to use `--codex` flag
  - [ ] Note: local-only currently (global in future)
  - [ ] Add architectural note about future global support

- [ ] **CHANGELOG.md**
  - [ ] Add v1.10.0 section
  - [ ] Breaking changes section
  - [ ] Deprecation warnings section
  - [ ] Migration examples

- [ ] **docs/migration-v1.10.md** (NEW)
  - [ ] Old → new flag mapping table
  - [ ] Common scenarios with examples
  - [ ] Troubleshooting section
  - [ ] Script update guide

- [ ] **docs/troubleshooting.md**
  - [ ] Add "Deprecation Warnings" section
  - [ ] Add "Flag Combination Errors" section
  - [ ] Add "Multi-Platform Installation Issues" section

### 3.2 README.md Updates

**Before (v1.9.x):**
```markdown
### Install

```bash
# Claude Code (uppercase tools, string format)
npx get-shit-done-multi

# GitHub Copilot CLI
npx get-shit-done-multi --copilot

# Codex CLI (optimized for OpenAI)
npx get-shit-done-multi --codex
```
```

**After (v1.10.0):**
```markdown
### Install

Choose one or more platforms to install:

```bash
# Claude Code
npx get-shit-done-multi --claude

# GitHub Copilot CLI
npx get-shit-done-multi --copilot

# Codex CLI
npx get-shit-done-multi --codex

# Install multiple platforms
npx get-shit-done-multi --claude --copilot

# Install all platforms
npx get-shit-done-multi --all
```

**Global vs Local:**
```bash
# Local installation (default, project-specific)
npx get-shit-done-multi --claude --local

# Global installation (affects all projects)
npx get-shit-done-multi --claude --global

# All platforms globally
npx get-shit-done-multi --all --global
```

**Interactive menu (no flags):**
```bash
npx get-shit-done-multi
# Opens checkbox menu to select platforms
```

**⚠️ Migrating from v1.9.x?** Old flags (`--local`/`--global` without platform) are deprecated. See [migration guide](docs/migration-v1.10.md).
```

### 3.3 CHANGELOG.md Format

```markdown
## [1.10.0] - 2026-01-XX

### ⚠️ BREAKING CHANGES

**Installation flags redesigned for multi-platform support.**

Old flags `--local` and `--global` without specifying a platform are **deprecated**.

**Migration required:**

| Old Command | New Command | Notes |
|-------------|-------------|-------|
| `npx get-shit-done-multi` | `npx get-shit-done-multi --claude` | Explicit platform required |
| `npx get-shit-done-multi --local` | `npx get-shit-done-multi --claude --local` | Specify platform |
| `npx get-shit-done-multi --global` | `npx get-shit-done-multi --claude --global` | Specify platform |
| `npx get-shit-done-multi --copilot` | No change | Already correct |

**Deprecation timeline:**
- v1.10.x: Warnings shown, old flags still work (default to Claude)
- v1.11.0: Old flags will cause installation to fail

See [Migration Guide](docs/migration-v1.10.md) for details.

### Added

- Platform-specific flags: `--claude`, `--copilot`, `--codex`
- Bulk installation: `--all` installs all platforms
- Multi-platform support: `--claude --copilot` installs both
- Interactive menu when no flags provided (checkbox multi-select)
- Scope flags work per-platform: `--claude --local`, `--copilot --global`
- Deprecation warnings for old flag combinations
- Helpful error messages for invalid flag combinations

### Changed

- Installation now requires explicit platform selection
- Default behavior (no flags) opens interactive menu instead of auto-installing Claude
- Cleaner output: removed unnecessary system messages

### Deprecated

- `--local` and `--global` without platform flags (use `--claude --local` instead)
- Will be removed in v1.11.0

### Fixed

- Flag ambiguity when installing multiple platforms
- Unclear error messages for invalid flag combinations

### Documentation

- Added [Migration Guide v1.10](docs/migration-v1.10.md)
- Updated all setup guides with new flag syntax
- Added troubleshooting section for flag errors
- Updated README with multi-platform examples
```

### 3.4 Migration Guide (NEW)

**Location:** `docs/migration-v1.10.md`

```markdown
# Migration Guide: v1.9.x → v1.10.0

**Date:** 2026-01-XX  
**Status:** Deprecated flags work with warnings until v1.11.0

---

## Quick Reference

| Scenario | v1.9.x Command | v1.10.0 Command |
|----------|----------------|-----------------|
| Install Claude locally | `npx get-shit-done-multi` or `--local` | `npx get-shit-done-multi --claude` |
| Install Claude globally | `npx get-shit-done-multi --global` | `npx get-shit-done-multi --claude --global` |
| Install Copilot | `npx get-shit-done-multi --copilot` | No change ✓ |
| Install all platforms | Not possible | `npx get-shit-done-multi --all` |
| Interactive menu | Not available | `npx get-shit-done-multi` (no flags) |

---

## What Changed?

### Before v1.10.0

Installation assumed Claude unless you specified `--copilot` or `--codex`:

```bash
npx get-shit-done-multi          # ← Installed Claude (implicit)
npx get-shit-done-multi --local  # ← Installed Claude locally (implicit)
```

**Problem:** Ambiguous. Users didn't know which platform was being installed.

### After v1.10.0

Explicit platform selection required:

```bash
npx get-shit-done-multi --claude         # ← Explicit
npx get-shit-done-multi --claude --local # ← Explicit
```

**Benefit:** Clear, supports multiple platforms, no ambiguity.

---

## Common Scenarios

### Scenario 1: Local Claude installation (most common)

**Old:**
```bash
cd my-project
npx get-shit-done-multi
```

**New:**
```bash
cd my-project
npx get-shit-done-multi --claude
```

### Scenario 2: Global Claude installation

**Old:**
```bash
npx get-shit-done-multi --global
```

**New:**
```bash
npx get-shit-done-multi --claude --global
```

### Scenario 3: Install for multiple platforms

**Old:** Not possible (had to run multiple times)

**New:**
```bash
# Install Claude and Copilot in one command
npx get-shit-done-multi --claude --copilot

# Install all three platforms
npx get-shit-done-multi --all
```

### Scenario 4: CI/CD pipelines

**Old:**
```yaml
- name: Install GSD
  run: npx get-shit-done-multi --local
```

**New:**
```yaml
- name: Install GSD
  run: npx get-shit-done-multi --claude --local
```

### Scenario 5: Bash scripts

**Old:**
```bash
#!/bin/bash
npx get-shit-done-multi --global
```

**New:**
```bash
#!/bin/bash
npx get-shit-done-multi --claude --global
```

---

## Deprecation Timeline

| Version | Behavior | Action Required |
|---------|----------|-----------------|
| **v1.9.x** | Old flags work silently | None |
| **v1.10.0** | Deprecation warnings shown | Update commands (recommended) |
| **v1.10.x** | Warnings continue | Update before v1.11.0 |
| **v1.11.0** | **Old flags will fail** | **Must update** |

**Timeline:** v1.11.0 planned for ~Q2 2026 (2-3 months after v1.10.0).

---

## Updating Documentation

If you maintain tutorials, blog posts, or documentation:

1. **Replace** `npx get-shit-done-multi` → `npx get-shit-done-multi --claude`
2. **Replace** `--local` (bare) → `--claude --local`
3. **Replace** `--global` (bare) → `--claude --global`
4. **Add** examples of `--all` for multi-platform installs
5. **Add** note about interactive menu (no flags)

---

## Troubleshooting

### "DEPRECATION WARNING" appears

**Cause:** You're using old flags.

**Solution:** Add platform flag:
```bash
# Instead of:
npx get-shit-done-multi --local

# Use:
npx get-shit-done-multi --claude --local
```

### "Cannot specify both --local and --global"

**Cause:** Conflicting scope flags.

**Solution:** Choose one:
```bash
npx get-shit-done-multi --claude --local   # OR
npx get-shit-done-multi --claude --global
```

### "--all cannot be combined with individual platform flags"

**Cause:** Redundant flags.

**Solution:** Use either `--all` or individual platforms:
```bash
# This:
npx get-shit-done-multi --all

# NOT this:
npx get-shit-done-multi --all --claude
```

---

## Need Help?

- [Troubleshooting Guide](troubleshooting.md)
- [GitHub Issues](https://github.com/shoootyou/get-shit-done-multi/issues)
- [Documentation](https://github.com/shoootyou/get-shit-done-multi/docs)
```

### 3.5 Setup Guide Updates Example

**docs/setup-claude-code.md Changes:**

```diff
 ## Installation
 
 GSD can be installed globally (affecting all your projects) or locally (project-specific).
 
 ### Local Installation (Project-Specific)
 
 Recommended for most use cases - keeps GSD configuration within your project:
 
 ```bash
 # Navigate to your project directory
 cd /path/to/your/project
 
 # Install GSD for Claude Code
-npx get-shit-done-multi
+npx get-shit-done-multi --claude
 
 # Expected output:
 # ✓ Detecting installed CLIs...
 # ✓ Claude Code detected
 # ✓ Installing to .claude/get-shit-done/
 # ✓ Skills registered
 # ✓ Commands available: 15 GSD commands
 # ✓ Installation complete!
 ```

 ### Global Installation
 
+Install GSD globally to make it available across all projects:
+
 ```bash
-# Install globally (affects all Claude Code projects)
-npx get-shit-done-multi --global
+# Install GSD globally for Claude Code
+npx get-shit-done-multi --claude --global
 
 # Installs to:
 # - macOS/Linux: ~/.config/claude/skills/
 # - Windows: %APPDATA%\Claude\skills\
 ```

+### Multi-Platform Installation
+
+If you use multiple AI assistants, install GSD for all platforms:
+
+```bash
+# Install for Claude and Copilot
+npx get-shit-done-multi --claude --copilot
+
+# Install for all platforms
+npx get-shit-done-multi --all
+```
+
+See [Multi-Platform Setup Guide](multi-platform-setup.md) for details.
```

---

## 4. Error Handling

### 4.1 Error Taxonomy

| Error Type | Severity | User Action | System Behavior |
|------------|----------|-------------|-----------------|
| **Invalid flag combination** | ERROR | Fix flags | Exit with code 1 |
| **Platform not detected** | WARNING | Continue anyway | Proceed with installation |
| **Permission denied** | ERROR | Fix permissions | Exit with code 1 |
| **Partial failure** | WARNING | Review errors | Exit with code 1, show summary |
| **Deprecated flags** | WARNING | Update flags | Continue with fallback |

### 4.2 Invalid Flag Combinations

**Error:** `--all` with individual platforms

```javascript
function validateFlags(args) {
  if (hasAll && (hasClaude || hasCopilot || hasCodex)) {
    console.error(`\n  ${red}ERROR: Invalid flag combination${reset}\n`);
    console.error(`  The ${cyan}--all${reset} flag cannot be combined with individual platform flags.\n`);
    console.error(`  ${yellow}Choose one:${reset}`);
    console.error(`    ${green}✓${reset} npx get-shit-done-multi --all`);
    console.error(`    ${green}✓${reset} npx get-shit-done-multi --claude --copilot\n`);
    process.exit(1);
  }
}
```

**Error:** `--local` and `--global` together

```javascript
if (hasLocal && hasGlobal) {
  console.error(`\n  ${red}ERROR: Conflicting scope flags${reset}\n`);
  console.error(`  Cannot specify both ${cyan}--local${reset} and ${cyan}--global${reset}.\n`);
  console.error(`  ${yellow}Choose one:${reset}`);
  console.error(`    ${green}✓${reset} npx get-shit-done-multi --claude --local`);
  console.error(`    ${green}✓${reset} npx get-shit-done-multi --claude --global\n`);
  process.exit(1);
}
```

**Error:** No platform specified (v1.11.0+)

```javascript
// Only in v1.11.0+
if (!hasClaude && !hasCopilot && !hasCodex && !hasAll && !isInteractive) {
  console.error(`\n  ${red}ERROR: No platform specified${reset}\n`);
  console.error(`  You must specify which platform(s) to install:\n`);
  console.error(`    ${cyan}--claude${reset}    Install for Claude Code`);
  console.error(`    ${cyan}--copilot${reset}   Install for GitHub Copilot CLI`);
  console.error(`    ${cyan}--codex${reset}     Install for Codex CLI`);
  console.error(`    ${cyan}--all${reset}       Install for all platforms\n`);
  console.error(`  Or run without flags for interactive menu.\n`);
  process.exit(1);
}
```

### 4.3 Platform Availability Warnings

```javascript
async function checkPlatformAvailability(platforms) {
  const detected = await detectInstalledCLIs();
  const missing = [];
  
  for (const platform of platforms) {
    if (!detected[platform]) {
      missing.push(platform);
    }
  }
  
  if (missing.length > 0) {
    console.log(`\n  ${yellow}⚠ Platform Detection Warning${reset}\n`);
    missing.forEach(p => {
      const name = {
        claude: 'Claude Code',
        copilot: 'GitHub Copilot CLI',
        codex: 'Codex CLI'
      }[p];
      console.log(`  ${dim}•${reset} ${name} not detected on this system`);
    });
    console.log(`\n  ${dim}Installation will proceed. Install the CLI(s) later if needed.${reset}\n`);
  }
}
```

**Rationale:** Don't block installation. User might be pre-configuring or installing on a different machine.

### 4.4 Permission Errors

```javascript
async function handleInstallationError(error, platform) {
  if (error.code === 'EACCES' || error.code === 'EPERM') {
    console.error(`\n  ${red}ERROR: Permission denied${reset}\n`);
    console.error(`  Cannot write to installation directory for ${platform}.\n`);
    console.error(`  ${yellow}Solutions:${reset}`);
    console.error(`    1. Run with appropriate permissions`);
    console.error(`    2. Use --local instead of --global`);
    console.error(`    3. Change directory ownership: ${dim}sudo chown -R $USER <dir>${reset}\n`);
    process.exit(1);
  }
  
  if (error.code === 'ENOSPC') {
    console.error(`\n  ${red}ERROR: No space left on device${reset}\n`);
    console.error(`  Installation requires ~5MB of disk space.\n`);
    process.exit(1);
  }
  
  // Generic error
  console.error(`\n  ${red}ERROR: Installation failed${reset}\n`);
  console.error(`  ${error.message}\n`);
  console.error(`  ${dim}If this persists, please report: https://github.com/shoootyou/get-shit-done-multi/issues${reset}\n`);
  process.exit(1);
}
```

### 4.5 Partial Installation Failures

```javascript
async function installMultiplePlatforms(platforms, scope) {
  const results = {
    successful: [],
    failed: []
  };
  
  for (const platform of platforms) {
    try {
      const adapter = getAdapter(platform);
      await adapter.install({ scope });
      results.successful.push(platform);
      console.log(`  ${green}✓${reset} ${platform}: Installation complete`);
    } catch (error) {
      results.failed.push({ platform, error: error.message });
      console.error(`  ${red}✗${reset} ${platform}: ${error.message}`);
    }
  }
  
  // Summary
  console.log(`\n  ${yellow}Installation Summary${reset}`);
  console.log(`  ${green}✓${reset} Successful: ${results.successful.length}/${platforms.length}`);
  
  if (results.failed.length > 0) {
    console.log(`  ${red}✗${reset} Failed: ${results.failed.length}/${platforms.length}\n`);
    
    results.failed.forEach(f => {
      console.error(`    ${red}•${reset} ${f.platform}: ${f.error}`);
    });
    
    console.log(`\n  ${yellow}Partial installation completed.${reset}`);
    console.log(`  Fix errors and re-run to complete installation.\n`);
    
    process.exit(1); // Partial failure is still a failure
  }
  
  return results;
}
```

**Rationale:** 
- Show clear summary of what succeeded/failed
- Exit with error code so CI/CD detects failure
- Provide actionable next steps

### 4.6 Interactive Menu Errors

```javascript
async function showInteractiveMenu() {
  // Detect if TTY is available
  if (!process.stdin.isTTY || process.env.CI) {
    console.log(`\n  ${yellow}Non-interactive environment detected${reset}\n`);
    console.log(`  When running in CI/CD or non-TTY environment, specify platforms explicitly:\n`);
    console.log(`    ${cyan}--claude${reset}    Install for Claude Code`);
    console.log(`    ${cyan}--copilot${reset}   Install for GitHub Copilot CLI`);
    console.log(`    ${cyan}--codex${reset}     Install for Codex CLI`);
    console.log(`    ${cyan}--all${reset}       Install all platforms\n`);
    console.log(`  Example: ${dim}npx get-shit-done-multi --claude --local${reset}\n`);
    process.exit(1);
  }
  
  // Show menu...
}
```

---

## 5. Rollout Strategy

### 5.1 Version Recommendation

**Recommendation: MINOR version bump → v1.10.0**

**Rationale per Semantic Versioning (semver.org):**

- **MAJOR (2.0.0):** Breaking changes that REMOVE functionality
- **MINOR (1.10.0):** Breaking changes WITH backward compatibility
- **PATCH (1.9.2):** Backwards-compatible bug fixes

This change:
- ✅ Adds new functionality (platform flags, --all, interactive menu)
- ✅ Maintains backward compatibility (old flags work with warnings)
- ✅ Changes behavior but doesn't remove existing capability
- ❌ Does NOT remove functionality immediately

**Industry precedent:**
- npm, Node.js, Git all use MINOR for deprecations with grace period
- MAJOR reserved for hard removals

### 5.2 Release Sequence

**Phase 1: v1.10.0 (Soft Deprecation)**

```markdown
Release date: ~Week of Feb 1, 2026
Duration: 2-3 minor releases (~2-4 months)

Changes:
- Add new flags (--claude, --copilot, --codex, --all)
- Show deprecation warnings for old flags
- Old flags work (fallback to Claude)
- Interactive menu for no flags

Communication:
- CHANGELOG.md: Breaking changes section
- README.md: Migration note at top
- docs/migration-v1.10.md: Detailed guide
- GitHub release notes: Deprecation timeline
- (Optional) npm post-install message for 1 release
```

**Phase 2: v1.10.1 - v1.10.3 (Grace Period)**

```markdown
Release dates: Feb-April 2026
Duration: 2-3 releases

Changes:
- Bug fixes only
- Keep warnings
- No behavior changes

Communication:
- Each release notes: "Reminder: Update flags before v1.11.0"
- Track deprecation warning analytics (if feasible)
```

**Phase 3: v1.11.0 (Hard Deprecation)**

```markdown
Release date: ~April 2026 (Q2)
Duration: Permanent

Changes:
- Old flags cause errors (exit code 1)
- Remove fallback behavior
- Update help text

Communication:
- CHANGELOG.md: "BREAKING: Removed deprecated flags"
- Migration guide: Mark as mandatory
- GitHub release: "Breaking change" label
```

### 5.3 Communication Plan

**Channels:**

| Channel | Timing | Message |
|---------|--------|---------|
| **GitHub Release** | v1.10.0 launch | Full changelog, migration guide link |
| **README.md** | v1.10.0 | Migration notice box at top |
| **CHANGELOG.md** | v1.10.0 | Breaking changes section |
| **npm Package** | v1.10.0 only | Post-install message (1 release) |
| **Documentation** | v1.10.0 | All setup guides updated |

**npm post-install message (v1.10.0 only):**

```javascript
// In install.js, at end of successful installation:
if (hadDeprecationWarning) {
  console.log(`\n  ${yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}`);
  console.log(`  ${yellow}📣 Important: Flag changes in v1.10.0${reset}`);
  console.log(`  ${yellow}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${reset}\n`);
  console.log(`  Old flags are deprecated and will be removed in v1.11.0.`);
  console.log(`  See migration guide: ${cyan}https://github.com/shoootyou/get-shit-done-multi/docs/migration-v1.10.md${reset}\n`);
}
```

### 5.4 Rollback Plan

If critical issues found in v1.10.0:

1. **Immediate:** Publish v1.10.1 with fix
2. **If severe:** Deprecate v1.10.0 on npm (`npm deprecate get-shit-done-multi@1.10.0 "Use 1.10.1 - fixes critical bug"`)
3. **If catastrophic:** Revert to v1.9.x behavior, delay feature to v1.11.0

**Triggers for rollback:**
- Installation success rate drops below 95%
- More than 10 bug reports in first 48 hours
- CI/CD pipelines breaking widely

### 5.5 Success Metrics

Track these to evaluate rollout:

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Installation success rate** | >98% | CI/CD logs, error reports |
| **Deprecation warning rate** | Declining over time | Log analytics (if feasible) |
| **Bug reports** | <5 in first week | GitHub issues |
| **Migration adoption** | >50% by v1.11.0 | Warning rate decline |

---

## 6. Implementation Checklist

### 6.1 Pre-Development

- [ ] Review BRIEF.md requirements
- [ ] Confirm platform adapter interfaces
- [ ] Set up test directory structure
- [ ] Create feature branch: `feature/v1.10-cli-optimization`

### 6.2 Development Phase

**Flag parsing:**
- [ ] Implement new flag detection (--claude, --copilot, --codex, --all)
- [ ] Implement scope handling (--local, --global per platform)
- [ ] Implement deprecated flag detection
- [ ] Implement flag validation (conflicts, invalid combinations)

**Deprecation system:**
- [ ] Create deprecation warning formatter
- [ ] Implement fallback behavior (default to Claude)
- [ ] Add timeline messaging
- [ ] Log deprecation events (optional)

**Error handling:**
- [ ] Invalid flag combination errors
- [ ] Platform availability warnings
- [ ] Permission error handling
- [ ] Partial installation failure handling
- [ ] Non-TTY environment detection

**Interactive menu:**
- [ ] Implement prompts-based menu
- [ ] Checkbox platform selection
- [ ] Scope selection (global/local)
- [ ] Non-TTY fallback

### 6.3 Testing Phase

**Unit tests:**
- [ ] Flag parsing tests (15+ scenarios)
- [ ] Deprecation detection tests (10+ scenarios)
- [ ] Validation tests (10+ scenarios)
- [ ] Message formatting tests (5+ scenarios)

**Integration tests:**
- [ ] Installation flow tests (10+ scenarios)
- [ ] Platform adapter tests (5+ scenarios)
- [ ] Error handling tests (10+ scenarios)
- [ ] CI environment tests (5+ scenarios)

**E2E tests:**
- [ ] Interactive menu flow (2+ scenarios)
- [ ] Multi-platform installation (3+ scenarios)
- [ ] Deprecation warnings in real install (2+ scenarios)

**Manual testing:**
- [ ] Test on macOS
- [ ] Test on Linux
- [ ] Test on Windows (if supported)
- [ ] Test in GitHub Actions CI
- [ ] Test in non-TTY environment

### 6.4 Documentation Phase

- [ ] Update README.md installation section
- [ ] Update docs/setup-claude-code.md
- [ ] Update docs/setup-copilot-cli.md
- [ ] Update docs/setup-codex-cli.md
- [ ] Create docs/migration-v1.10.md
- [ ] Update docs/troubleshooting.md
- [ ] Write CHANGELOG.md entry
- [ ] Update package.json version to 1.10.0
- [ ] Update help text in install.js

### 6.5 Release Phase

- [ ] Merge to main
- [ ] Create git tag: v1.10.0
- [ ] Publish to npm
- [ ] Create GitHub release with changelog
- [ ] Update repo README with deprecation notice
- [ ] Monitor for issues (48-72 hours)
- [ ] Respond to user feedback

### 6.6 Post-Release

- [ ] Track deprecation warning rate (if feasible)
- [ ] Collect migration feedback
- [ ] Plan v1.11.0 timeline (hard deprecation)
- [ ] Update documentation based on user questions

---

## 7. Risk Assessment

### 7.1 Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Breaking CI/CD pipelines** | MEDIUM | HIGH | Soft deprecation, clear docs, grace period |
| **User confusion about flags** | MEDIUM | MEDIUM | Excellent error messages, migration guide |
| **Test suite brittleness** | LOW | MEDIUM | Focus on integration > E2E |
| **Platform adapter failures** | LOW | HIGH | Existing code stable, incremental changes |
| **Interactive menu issues** | LOW | LOW | Non-TTY fallback, clear messaging |

### 7.2 Mitigation Strategies

**Breaking CI/CD pipelines:**
- Soft deprecation (warnings, not errors)
- 2-3 month grace period
- Clear migration guide with CI/CD examples
- Monitor GitHub issues for widespread breakage

**User confusion:**
- Detailed deprecation warnings
- Suggest exact replacement command
- Migration guide with common scenarios
- Update all official documentation

**Test brittleness:**
- Unit tests for core logic (stable)
- Integration tests for workflows (more stable than E2E)
- Minimal E2E tests (brittle but necessary)
- Mock external dependencies

---

## 8. Open Questions

### 8.1 Resolved

- ✅ **Should old flags work or fail immediately?** → Work with warnings (soft deprecation)
- ✅ **What version number?** → v1.10.0 (minor bump per semver)
- ✅ **How long until removal?** → 2-3 minor releases (~2-4 months)
- ✅ **Interactive menu required?** → Yes, for improved UX

### 8.2 For Discussion

1. **Should we track deprecation warning analytics?**
   - Pro: Know when users have migrated
   - Con: Privacy concerns, implementation complexity
   - **Recommendation:** Skip for now, rely on GitHub issues

2. **Post-install message in v1.10.0?**
   - Pro: Reaches all users immediately
   - Con: Annoying for users who already know
   - **Recommendation:** Yes, but only in v1.10.0, remove in v1.10.1

3. **Should --all --global be allowed?**
   - Pro: Installs everything globally in one command
   - Con: Potentially confusing (lots of global pollution)
   - **Recommendation:** Allow it, warn user about global install scope

---

## 9. References

### 9.1 Semver Guidelines

- [Semantic Versioning 2.0.0](https://semver.org/)
- Deprecation = MINOR (adds new, keeps old)
- Removal = MAJOR (breaks existing)

### 9.2 CLI Testing Best Practices

- Jest for unit/integration tests (already in use)
- execa for E2E CLI testing (already in devDependencies)
- prompts library for interactive menus (already in dependencies)

### 9.3 Deprecation Patterns

**Node.js core:**
- Soft deprecation with warnings (process.emitWarning)
- 2-3 major version grace period
- Clear migration path in docs

**npm:**
- `npm deprecate` command for packages
- Warning messages in install output
- Typically 6-12 months before removal

**Git:**
- Warning messages for deprecated commands
- Aliases provided for common renames
- Multi-year grace periods

### 9.4 Error Handling Patterns

- Clear error messages (what went wrong, why, how to fix)
- Exit codes: 0 = success, 1 = error
- Structured output for CI/CD parsing
- Helpful suggestions for common mistakes

---

## 10. Conclusion

This milestone requires careful planning due to its breaking nature. Key success factors:

1. **Excellent communication** - Users need to know what changed and why
2. **Graceful migration path** - Warnings, not errors, for deprecated flags
3. **Comprehensive testing** - Especially flag parsing and error handling
4. **Clear documentation** - Migration guide is critical
5. **Appropriate versioning** - MINOR bump (1.10.0) per semver

**Timeline:**
- Development: 1-2 weeks
- Testing: 3-5 days
- Documentation: 2-3 days
- Grace period: 2-4 months (v1.10.x)
- Hard deprecation: v1.11.0 (Q2 2026)

**Confidence:** HIGH - This follows industry-standard patterns for CLI deprecations. Risk is mitigated through soft deprecation, comprehensive testing, and clear communication.
