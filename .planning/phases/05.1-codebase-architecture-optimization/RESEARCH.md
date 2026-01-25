# Phase 5.1: Codebase Architecture Optimization - Research

**Researched:** 2025-01-25
**Domain:** Node.js codebase restructuring, dependency analysis, refactoring
**Confidence:** HIGH

## Summary

Researched implementation approach for restructuring ~1600 LOC Node.js CLI project from chaotic structure to clean domain-based architecture. The standard stack uses mature npm tools (depcheck, unimported, madge) for dependency analysis, git-based file moves with IDE import updates (no complex AST tools needed at this scale), Jest native multi-location support, and npm-check-updates for aggressive dependency modernization.

Key finding: **Manual restructuring with incremental testing is safer than automated AST refactoring** for projects of this size. The critical path is: analyze dependencies → fix circular deps → remove unused files → restructure by domain → update tests → modernize dependencies → document changes. Each stage must end with green tests.

The feature/domain-based architecture (platforms/, installation/, configuration/, templating/, testing/) is modern best practice for CLI tools. Jest natively supports split test locations (integration in __tests__/, unit tests colocated in bin/). The existing adapter pattern should be preserved with simple constructor injection, not over-engineered with DI frameworks.

**Primary recommendation:** Use proven npm ecosystem tools (not custom scripts), migrate incrementally with tests between stages, and default to simplicity over abstraction.

## Standard Stack

The established tools for Node.js codebase restructuring:

### Core Analysis Tools
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| depcheck | 1.4.7 | Find unused dependencies in package.json | Industry standard for npm package cleanup, mature (2013) |
| unimported | 1.31.1 | Find unused source files | Actively maintained (2024), fast static analysis |
| madge | 8.0.0 | Dependency graph visualization, circular detection | De facto standard for Node.js dependency analysis |
| dependency-cruiser | 17.3.7 | Advanced architecture validation rules | Most actively maintained (Jan 2025), enforces architecture constraints |

### Refactoring Tools
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| npm-check-updates | 19.3.1 | Aggressive dependency updates | Standard for "update everything" workflow |
| git mv | (core) | Safe file moving with history | Built-in, tracks renames, preferred over manual |
| IDE refactoring | (VS Code) | Automatic import path updates | Essential for multi-file moves |

### Testing
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| jest | 30.2.0 | Test runner with multi-location support | Native testMatch patterns, no plugins needed |

### Documentation
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| madge | 8.0.0 | Generate architecture diagrams | Same tool for analysis + visualization |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Manual file moves | jscodeshift (AST refactoring) | jscodeshift is overkill for ~50 file moves, adds complexity |
| npm-check-updates | renovate/dependabot | Those are for continuous automation, ncu is for one-time aggressive updates |
| Jest config | Multiple test runners | Jest supports both locations natively, no need for complexity |

**Installation:**
```bash
npm install --save-dev depcheck unimported madge dependency-cruiser npm-check-updates
```

## Architecture Patterns

### Recommended Project Structure
```
bin/lib/
├── platforms/           # Domain: AI platform integrations
│   ├── claude-adapter.js
│   ├── copilot-adapter.js
│   ├── codex-adapter.js
│   └── base-adapter.js  # Shared interface
├── installation/        # Domain: Installation workflow
│   ├── installer.js
│   ├── validator.js
│   └── post-install.js
├── configuration/       # Domain: Config management
│   ├── config-loader.js
│   ├── flag-parser.js
│   └── path-resolver.js
├── templating/          # Domain: Template generation
│   ├── doc-generator.js
│   ├── template-engine.js
│   └── formatters/
└── testing/             # Domain: Test utilities
    ├── test-helpers.js
    └── fixtures/
```

**Why feature/domain-based:** Modern best practice (vs layered architecture). Groups by business capability, not technical layer. Easier to understand, modify, and extend with new platforms.

### Pattern 1: Incremental File Migration
**What:** Move files in small batches with tests between each batch
**When to use:** Restructuring existing codebases (always)
**Example:**
```bash
# Move one domain at a time
git mv bin/lib/claude-adapter.js bin/lib/platforms/
git mv bin/lib/copilot-adapter.js bin/lib/platforms/

# Update imports automatically (IDE) or manually
grep -r "claude-adapter" bin/ __tests__/  # Find all importers

# Test immediately
npm test

# Commit when green
git commit -m "refactor: move platforms domain to bin/lib/platforms/"
```

### Pattern 2: Jest Multi-Location Configuration
**What:** Support both __tests__/ and colocated tests natively
**When to use:** Split test strategy (integration vs unit)
**Example:**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',  // Integration tests
    '**/bin/**/*.test.js',         // Unit tests colocated
  ],
  collectCoverageFrom: [
    'bin/**/*.js',
    '!bin/**/*.test.js',           // Exclude tests from coverage
  ],
  coverageDirectory: 'coverage',
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
};
```

### Pattern 3: Adapter Pattern with Simple DI
**What:** Preserve existing adapter pattern, use constructor injection
**When to use:** Multiple platform implementations (Claude, Copilot, Codex)
**Example:**
```javascript
// base-adapter.js - Define interface
class BaseAdapter {
  constructor(config) {
    if (this.constructor === BaseAdapter) {
      throw new Error("BaseAdapter is abstract");
    }
    this.config = config;
  }

  async install() { throw new Error("Must implement"); }
  async validate() { throw new Error("Must implement"); }
}

// claude-adapter.js - Implement
const BaseAdapter = require('./base-adapter');

class ClaudeAdapter extends BaseAdapter {
  constructor(config) {
    super(config);
    this.platform = 'claude';
  }

  async install() { /* Implementation */ }
  async validate() { /* Implementation */ }
}

module.exports = ClaudeAdapter;

// install.js - Factory with DI
function getAdapter(platform, config) {
  const adapters = {
    claude: require('./lib/platforms/claude-adapter'),
    copilot: require('./lib/platforms/copilot-adapter'),
  };
  
  const AdapterClass = adapters[platform];
  return new AdapterClass(config);  // Constructor injection
}
```

### Pattern 4: Dependency Analysis Workflow
**What:** Use madge to identify unused files and circular dependencies
**When to use:** Before restructuring (always)
**Example:**
```bash
# 1. Find unused files (not in dependency tree from entry point)
npx madge --depends install.js bin/ > dep-tree.txt
npx unimported > unused-files.txt

# 2. Find circular dependencies
npx madge --circular bin/ > circular-deps.txt

# 3. Visualize structure
npx madge --image before.png bin/

# 4. Fix circular deps BEFORE restructuring
```

### Anti-Patterns to Avoid
- **Over-engineering with AST tools:** jscodeshift for ~50 file moves is massive overkill
- **Moving all files at once:** Impossible to debug when tests fail
- **Updating all deps before tests green:** Confuses restructuring failures with dependency failures
- **Adding DI frameworks:** Constructor injection is sufficient for this scale
- **Restructuring without dependency analysis:** Will accidentally delete files still in use

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finding unused files | grep + manual tracking | `unimported` | Handles dynamic imports, conditional requires, complex dependency trees |
| Circular dependency detection | Manual code review | `madge --circular` | Catches transitive circular deps humans miss |
| Import path updates | Find/replace scripts | IDE refactoring (VS Code) | Handles edge cases (string interpolation, dynamic imports) |
| Dependency graph visualization | Custom graph builder | `madge --image` | Handles CommonJS, ES modules, resolves node_modules |
| Architecture rule enforcement | Code review guidelines | `dependency-cruiser` | Validates rules automatically in CI |
| Breaking change detection | Manual changelog review | npm package CHANGELOGs + testing | Community-maintained, catches undocumented breaks |
| Test coverage comparison | Manual diff | Jest `--coverage` with baseline file | Precise line-by-line coverage tracking |

**Key insight:** Static analysis tools (depcheck, unimported, madge) are mature and battle-tested. Custom scripts miss edge cases and create maintenance burden.

## Common Pitfalls

### Pitfall 1: Import Path Breakage After File Moves
**What goes wrong:** Move file → relative imports break (../../lib vs ../lib)
**Why it happens:** Import paths are relative, file moves change directory depth
**How to avoid:**
- Use `git mv` (not manual copy/delete) to preserve history
- Move files in small batches (one domain at a time)
- Use IDE "Move File" refactoring to auto-update imports
- Run `npm test` after each batch
- grep for old import paths before committing: `grep -r "old/path" bin/`
**Warning signs:**
- Tests fail with "Cannot find module" errors
- Imports pointing to wrong directory depth (too many ../)

### Pitfall 2: Circular Dependencies Exposed During Restructuring
**What goes wrong:** Tests pass before restructure, fail after with circular dependency errors
**Why it happens:** Circular deps hidden by file structure, exposed when moving files
**How to avoid:**
- Run `npx madge --circular bin/` BEFORE starting restructure
- Fix all circular deps first (extract shared utilities or combine files)
- Verify `madge --circular` returns empty before proceeding
**Warning signs:**
- "ReferenceError: Cannot access before initialization"
- Stack overflow errors in tests
- Mysterious undefined values

### Pitfall 3: Test Path Configuration Mismatch
**What goes wrong:** Tests run before restructure, Jest can't find them after moving
**Why it happens:** Jest testMatch patterns don't include new locations
**How to avoid:**
- Update jest.config.js testMatch FIRST (before moving any tests)
- Add new pattern while keeping old: `['**/__tests__/**', '**/bin/**/*.test.js']`
- Verify existing tests still run after config change
- Move tests incrementally, run suite after each move
- Remove old patterns only after ALL tests migrated
**Warning signs:**
- Jest reports "No tests found"
- Test count drops after moving files
- Coverage report missing files

### Pitfall 4: Aggressive Dependency Updates Breaking Tests
**What goes wrong:** Run `ncu -u` → npm install → tests fail with cryptic errors
**Why it happens:** Multiple breaking changes in different packages at once
**How to avoid:**
- Update dependencies AFTER restructuring is complete (separate concern)
- Update in groups: test tools first, then prod deps, then dev tools
- Run full test suite after each group
- Check CHANGELOGs for major version bumps: `npm view <pkg> versions`
- If blocking breakage, keep old version and document why
**Warning signs:**
- Tests fail with "TypeError: X is not a function"
- API calls change shape (different params, return values)
- New required config options

### Pitfall 5: Removing Files Still in Use
**What goes wrong:** Delete file marked "unused" → runtime errors during tests or install
**Why it happens:** Dynamic imports (`require(variable)`), conditional requires, test-only usage
**How to avoid:**
- Use `unimported` tool, but verify each file before deleting
- grep for filename in codebase: `grep -r "filename" bin/ __tests__/`
- Check for dynamic imports: search for `require(` + variable names
- Run FULL test suite (not just unit tests) before committing deletions
- Git history is safety net, can restore if needed
**Warning signs:**
- Tests fail with "Cannot find module" after deletion
- Install process breaks with missing file errors
- Coverage drops significantly after file removal

### Pitfall 6: Lost Coverage During Restructure
**What goes wrong:** Tests pass but coverage drops from 80% to 60%
**Why it happens:** Moved test files not picked up by Jest, or coverage config outdated
**How to avoid:**
- Establish baseline: `npm test -- --coverage > baseline-coverage.txt`
- Check coverage after migration: compare line counts
- Investigate any drop > 5%
- Verify collectCoverageFrom patterns include new locations
**Warning signs:**
- Fewer lines covered in coverage report
- Entire modules missing from coverage (not just lower %)
- Coverage report doesn't include new bin/lib/* structure

### Pitfall 7: Forgetting to Update Scripts/CI Paths
**What goes wrong:** Local tests pass, CI pipeline fails
**Why it happens:** package.json scripts or GitHub workflows use hardcoded paths
**How to avoid:**
- Review all package.json scripts for file paths
- Check .github/workflows/ for hardcoded bin/ paths
- Search for old structure in all config: `grep -r "bin/lib/old-path" .`
- Run CI locally if possible (act, GitHub Actions locally)
**Warning signs:**
- CI fails but local tests pass
- Scripts fail with "File not found" errors
- Linting/formatting scripts miss new locations

### Pitfall 8: Over-Engineering the Adapter Pattern
**What goes wrong:** Add DI framework, create complex factory abstraction, tests become harder to write
**Why it happens:** Misunderstanding SOLID as "must use frameworks"
**How to avoid:**
- Keep existing adapter pattern if it works
- Constructor injection is sufficient DI for this scale
- SOLID is about design, not frameworks
- Don't refactor what isn't broken
**Warning signs:**
- Tests require complex setup/mocking
- Adding new platform requires changing multiple files
- Team doesn't understand the abstraction

## Migration Strategy

**Step-by-step approach for safe, incremental restructuring:**

### Stage 0: Preparation & Baseline (Day 1 Morning)
1. Commit current state: `git commit -m "chore: checkpoint before optimization"`
2. Install tools: `npm install --save-dev depcheck unimported madge dependency-cruiser`
3. Establish baseline: `npm test -- --coverage > baseline-coverage.txt`
4. Run analysis:
   - `npx depcheck > analysis-unused-deps.txt`
   - `npx unimported > analysis-unused-files.txt`
   - `npx madge --circular bin/ > analysis-circular-deps.txt`
   - `npx madge --depends install.js bin/ > analysis-dep-tree.txt`
5. Review outputs, identify cleanup targets

### Stage 1: Fix Circular Dependencies (Day 1 Afternoon)
1. Address each circular dep from madge output
2. Extract shared utilities OR combine circular files
3. Run tests after each fix
4. Verify: `npx madge --circular bin/` returns empty

### Stage 2: Remove Unused Files (Day 1 Evening)
1. For each file in `unimported` output:
   - Verify not in install.js dependency tree
   - grep for dynamic imports: `grep -r "filename" bin/ __tests__/`
   - If truly unused: `git rm bin/path/to/file.js`
   - Commit in batches
2. Run full test suite: `npm test`
3. Remove unused dependencies: `npm uninstall <package>` for each in depcheck output

### Stage 3: Update Jest Configuration (Day 2 Morning)
1. Update jest.config.js with both patterns:
   ```javascript
   testMatch: [
     '**/__tests__/**/*.test.js',   // Keep existing
     '**/bin/**/*.test.js',          // Add new
   ],
   ```
2. Verify tests still pass: `npm test`
3. Commit: `git commit -m "test: add bin/ test pattern"`

### Stage 4: Create Directory Structure (Day 2)
1. Create folders:
   ```bash
   mkdir -p bin/lib/{platforms,installation,configuration,templating,testing}
   ```
2. Commit: `git commit -m "refactor: create domain folders"`

### Stage 5: Move Files by Domain (Day 2-3)
**For each domain (platforms → templating → configuration → installation → testing):**
1. Identify files for domain
2. Move files: `git mv bin/lib/file.js bin/lib/platforms/`
3. Update imports in moved files (IDE or manual)
4. Find importers: `grep -r "file" bin/ __tests__/`
5. Update import paths in importers
6. Run tests: `npm test` (must pass)
7. Commit: `git commit -m "refactor: move <domain> to bin/lib/<domain>/"`

**Domain migration order:** platforms → templating → configuration → installation → testing

### Stage 6: Move Tests to Colocation (Day 3)
1. Categorize tests:
   - Integration (full workflows) → stay in __tests__/
   - Unit (single module) → move to bin/ near code
2. For each unit test:
   - `git mv __tests__/module.test.js bin/lib/domain/module.test.js`
   - Update import paths in test file (adjust relative imports)
   - Run tests: `npm test`
   - Commit: `git commit -m "test: colocate <module> unit tests"`

### Stage 7: Update Dependencies (Day 4)
1. Check outdated: `npm outdated > outdated-before.txt`
2. Update all: `npx npm-check-updates -u && npm install`
3. Run tests: `npm test`
4. If tests fail:
   - Identify failing package from errors
   - Check CHANGELOG: `npm view <pkg> versions`
   - Fix breaking changes OR revert: `npm install <pkg>@<old-version>`
   - Document blockers in report
5. Group strategy if needed: test deps first, prod deps next, dev tools last
6. Commit: `git commit -m "chore: update dependencies to latest"`

### Stage 8: Generate Documentation (Day 4-5)
1. Generate diagram: `npx madge --image architecture-after.png bin/lib/`
2. Compare coverage: `npm test -- --coverage > coverage-after.txt`
3. Create report with:
   - Before/after structure tree
   - Files removed (table with justifications)
   - Files moved (mapping table)
   - Dependencies updated (table with breaking changes, fixes)
   - Test results comparison
   - Architecture diagram
4. Commit: `git commit -m "docs: add phase 5.1 report"`

### Stage 9: Evaluate Coverage Directory (Day 5)
1. Check if committed: `git ls-files coverage/`
2. If exists: `git rm -r coverage/ && echo "coverage/" >> .gitignore`
3. Commit: `git commit -m "chore: remove coverage/ from git"`

### Stage 10: Final Verification (Day 5)
1. Run tests: `npm test -- --coverage`
2. Verify coverage maintained (within 5% of baseline)
3. Check no circular deps: `npx madge --circular bin/`
4. Verify all 8 requirements met (ARCH-OPT-01 through 08)
5. Summary commit: `git commit --allow-empty -m "chore: complete phase 5.1"`

**Rollback plan:** At any stage, if tests fail and fix unclear: `git reset --hard <last-green-commit>`, review failure, retry with smaller batch.

**Key success metrics:**
- ✅ All tests pass at end of each stage
- ✅ Coverage maintained (±5% of baseline)
- ✅ No circular dependencies
- ✅ All files in bin/lib/ are in dependency tree
- ✅ Dependencies on latest stable (or documented exceptions)

## Code Examples

### Dependency Analysis Commands
```bash
# Find unused npm packages
npx depcheck

# Find unused source files
npx unimported

# Visualize dependency graph
npx madge --image graph.png bin/

# Find circular dependencies (must be empty)
npx madge --circular bin/

# Show dependency tree from entry point
npx madge --depends install.js bin/
```

### Jest Multi-Location Configuration
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'node',
  testMatch: [
    '**/__tests__/**/*.test.js',  // Integration tests
    '**/bin/**/*.test.js',         // Unit tests colocated
  ],
  collectCoverageFrom: [
    'bin/**/*.js',
    '!bin/**/*.test.js',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testPathIgnorePatterns: ['/node_modules/', '/coverage/'],
};
```

### Safe File Moving Process
```bash
# Create target directory
mkdir -p bin/lib/platforms/

# Move file (Git tracks rename)
git mv bin/lib/claude-adapter.js bin/lib/platforms/claude-adapter.js

# Find all importers
grep -r "claude-adapter" bin/ __tests__/

# Update import paths (IDE or manual)
# OLD: require('../../bin/lib/claude-adapter')
# NEW: require('../../bin/lib/platforms/claude-adapter')

# Run tests (must pass)
npm test

# Commit when green
git commit -m "refactor: move claude-adapter to platforms/"
```

### Dependency Update Workflow
```bash
# Check what's outdated
npm outdated

# Update all to latest (aggressive)
npx npm-check-updates -u

# Install new versions
npm install

# Run tests
npm test

# If tests fail, check breaking changes
npm view <package-name> versions --json
# Read CHANGELOG, fix code, or revert package
```

### Adapter Pattern with Constructor DI
```javascript
// base-adapter.js - Abstract base class
class BaseAdapter {
  constructor(config) {
    if (this.constructor === BaseAdapter) {
      throw new Error("BaseAdapter is abstract");
    }
    this.config = config;
  }

  async install() { throw new Error("Must implement install()"); }
  async validate() { throw new Error("Must implement validate()"); }
}

module.exports = BaseAdapter;

// claude-adapter.js - Concrete implementation
const BaseAdapter = require('./base-adapter');

class ClaudeAdapter extends BaseAdapter {
  constructor(config) {
    super(config);
    this.platform = 'claude';
  }

  async install() {
    // Platform-specific installation logic
  }

  async validate() {
    // Platform-specific validation logic
  }
}

module.exports = ClaudeAdapter;

// install.js - Factory pattern with DI
const ClaudeAdapter = require('./lib/platforms/claude-adapter');
const CopilotAdapter = require('./lib/platforms/copilot-adapter');
const CodexAdapter = require('./lib/platforms/codex-adapter');

function getAdapter(platform, config) {
  const adapters = {
    claude: ClaudeAdapter,
    copilot: CopilotAdapter,
    codex: CodexAdapter,
  };
  
  const AdapterClass = adapters[platform];
  if (!AdapterClass) {
    throw new Error(`Unknown platform: ${platform}`);
  }
  
  return new AdapterClass(config);  // Constructor injection
}

// Usage
const adapter = getAdapter(platformName, userConfig);
await adapter.install();
await adapter.validate();
```

### Architecture Validation Rules
```javascript
// .dependency-cruiser.js - Enforce architecture rules
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'no-orphans',
      severity: 'warn',
      from: { orphan: true },
      to: {},
    },
    {
      name: 'platforms-independence',
      comment: 'Platform adapters should not import from other platforms',
      severity: 'error',
      from: { path: '^bin/lib/platforms/[^/]+\\.js$' },
      to: { 
        path: '^bin/lib/platforms/(?!base-adapter)[^/]+\\.js$',
        pathNot: '^bin/lib/platforms/base-adapter\\.js$',
      },
    },
  ],
};
```

### Migration Report Template
```markdown
# Phase 5.1 Architecture Optimization Report

## Structure Before
```
bin/
├── install.js
└── lib/
    ├── claude-adapter.js
    ├── copilot-adapter.js
    ├── doc-generator.js
    └── [other files]
```

## Structure After
```
bin/
├── install.js
└── lib/
    ├── platforms/
    │   ├── base-adapter.js
    │   ├── claude-adapter.js
    │   └── copilot-adapter.js
    ├── templating/
    │   └── doc-generator.js
    └── [organized by domain]
```

## Files Removed
| File | Reason | Last Modified |
|------|--------|---------------|
| bin/old-helper.js | Not in dependency tree | 2024-08-15 |

## Files Moved
| Old Path | New Path | Reason |
|----------|----------|--------|
| bin/lib/claude-adapter.js | bin/lib/platforms/claude-adapter.js | Domain organization |

## Dependencies Updated
| Package | Old | New | Breaking Changes | Fix |
|---------|-----|-----|------------------|-----|
| jest | 29.0.0 | 30.2.0 | Snapshot format | Ran jest -u |

## Test Results
- Before: 45 tests, 82% coverage
- After: 45 tests, 84% coverage
- No regressions, coverage improved
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AST-based refactoring (jscodeshift) | Git mv + IDE refactoring | ~2020 | Simpler, more reliable for small-medium projects |
| Single __tests__/ directory | Split by type (integration vs unit) | ~2021 | Better colocation, faster test feedback |
| Conservative dependency updates | Aggressive with npm-check-updates | Ongoing | Faster security patches, but requires active testing |
| Layered architecture (controllers/services/models) | Feature/domain-based | ~2018 | Easier to understand and modify by feature |
| Custom dependency analysis scripts | Mature tools (madge, depcheck) | ~2015 | Battle-tested, handles edge cases |

**Deprecated/outdated:**
- **jscodeshift for small refactors**: Massive overkill for <100 file moves, IDE does it better
- **renovate for one-time updates**: Built for continuous automation, use ncu for one-shot aggressive updates
- **Technical layer folders**: "controllers/", "services/" folders are outdated, use domain-based instead
- **istanbul for coverage**: Replaced by c8 and Jest built-in coverage (Istanbul still works but superseded)

## Open Questions

Things that couldn't be fully resolved:

1. **Specific files in current bin/ and lib-ghcc/ structure**
   - What we know: ~1600 LOC across directories, has adapters and template system
   - What's unclear: Exact file list and current organization
   - Recommendation: Run `tree bin/ lib-ghcc/` to map current structure before planning

2. **Current test file organization**
   - What we know: Tests in both __tests__/ and bin/
   - What's unclear: Which tests are integration vs unit, how many to move
   - Recommendation: Audit tests during Stage 6, categorize by scope (full workflow vs single module)

3. **Existing circular dependencies**
   - What we know: Likely exist given "chaotic" structure description
   - What's unclear: How many, severity
   - Recommendation: Run `madge --circular` in Stage 0, count and assess before starting

4. **Current dependency versions and update needs**
   - What we know: Dependencies "may be outdated"
   - What's unclear: How outdated, how many major version bumps needed
   - Recommendation: Run `npm outdated` in Stage 0, assess scope of updates

5. **Breaking changes in future AI platforms (GPT-4All, Mistral, Gemini)**
   - What we know: Architecture should support future integrations
   - What's unclear: APIs, installation patterns, specific requirements
   - Recommendation: Design base-adapter interface to be flexible, add new platforms after optimization complete

## Sources

### Primary (HIGH confidence)
- npm registry versions for depcheck (1.4.7), unimported (1.31.1), madge (8.0.0), dependency-cruiser (17.3.7), npm-check-updates (19.3.1), jest (30.2.0) - verified Jan 2025
- Jest documentation patterns for multi-location test configuration
- Git documentation for `git mv` behavior (rename tracking)
- Node.js ecosystem standards for feature-based architecture (2018-2025 evolution)

### Secondary (MEDIUM confidence)
- Industry best practices for incremental refactoring (test between stages)
- CLI tool architecture patterns (flat entry point, organized internals)
- Adapter pattern with constructor injection (standard OOP pattern)

### Tertiary (LOW confidence - marked for validation)
- Specific breaking changes in jest 29→30 (snapshot format) - should verify with actual changelog
- eslint 8→9 flat config migration - should verify if project uses eslint

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - npm registry versions verified, tools are industry standard
- Architecture patterns: HIGH - feature/domain is documented best practice, Jest multi-location is native
- Migration strategy: HIGH - based on proven incremental approach, standard in industry
- Pitfalls: MEDIUM - based on common experiences, but project-specific issues may vary
- SOLID implementation: HIGH - constructor injection is standard, no framework needed

**Research date:** 2025-01-25
**Valid until:** 2025-04-25 (90 days - tools are mature, changes slowly)

**Requirements coverage:**
- ✅ ARCH-OPT-01: File audit approach (unimported, madge dependency tree)
- ✅ ARCH-OPT-02: Feature/domain structure (5 folders documented)
- ✅ ARCH-OPT-03: SOLID principles (adapter pattern, constructor DI)
- ✅ ARCH-OPT-04: Test unification (Jest multi-location config)
- ✅ ARCH-OPT-05: Coverage directory (git rm + .gitignore)
- ✅ ARCH-OPT-06: Dependency modernization (npm-check-updates workflow)
- ✅ ARCH-OPT-07: install.js unchanged (entry point preservation)
- ✅ ARCH-OPT-08: Detailed report (template and format provided)
