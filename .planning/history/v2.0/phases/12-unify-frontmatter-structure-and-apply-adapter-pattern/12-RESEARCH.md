# Phase 12: Unify frontmatter structure and apply adapter pattern - Research

**Researched:** 2026-02-01
**Domain:** Module refactoring, code organization, YAML serialization
**Confidence:** HIGH

## Summary

This research investigated the technical approach for reorganizing frontmatter validation and rendering modules to follow the per-platform adapter pattern established in Phase 11. The investigation covered module refactoring safety, import migration strategies, code duplication patterns, platform-specific YAML serialization requirements, and contributor documentation patterns.

**Key findings:**
- Manual refactoring is the standard approach for ~15 import statements in Node.js ESM projects
- The 3-wave migration strategy is sound: rename → split → relocate, with syntax checks between waves and full tests at the end
- Per-platform code duplication (established in Phase 11) is the correct pattern for platform isolation
- Platform-specific YAML serialization logic is well-documented in existing code and ready to be split
- Contributor documentation should follow existing project style with checklist format

**Primary recommendation:** Execute the 3-wave migration as planned, using git mv for Wave 1 to preserve history, manual file creation for Wave 2 (per-platform splits), and syntax validation between waves with comprehensive testing after Wave 3.

## Standard Stack

No new libraries required for this phase. All work uses existing dependencies and Node.js built-in capabilities.

### Core Dependencies (Already in Project)
| Library | Version | Purpose | Why Used |
|---------|---------|---------|----------|
| gray-matter | 4.x | YAML frontmatter parsing | Established in Phase 1, handles parsing |
| Node.js fs/path | Built-in | File operations and module management | Standard for ESM imports and file I/O |

### Tools for Migration
| Tool | Purpose | When to Use |
|------|---------|-------------|
| `git mv` | Rename files with history preservation | Wave 1: rendering/ → serialization/ |
| `grep -r` | Find all import statements | After each wave to verify no old paths remain |
| `node --check` | Syntax validation without execution | Between waves to catch import errors |
| Test suite | Comprehensive validation | After Wave 3 (end of migration) |

**Note:** No automated refactoring tools (e.g., jscodeshift) needed for this scope. Manual refactoring provides full control and clarity for ~15 import statements.

## Architecture Patterns

### Pattern 1: Three-Wave Migration Strategy

**What:** Break large module reorganization into three sequential, independently reviewable waves

**When to use:** Module reorganization that involves renaming, splitting, and relocating files

**Wave structure:**
```
Wave 1: Rename module directory (structure change, no logic change)
  - git mv bin/lib/rendering bin/lib/serialization
  - Update all imports: ../rendering/ → ../serialization/
  - Validation: Syntax check + grep for old paths

Wave 2: Split shared files into per-platform files (logic duplication)
  - Create: claude-serializer.js, copilot-serializer.js, codex-serializer.js
  - Create: claude-cleaner.js, copilot-cleaner.js, codex-cleaner.js
  - Update imports: Use platform-specific files
  - Remove: Old shared frontmatter-serializer.js, frontmatter-cleaner.js
  - Validation: Syntax check + verify per-platform imports

Wave 3: Relocate non-frontmatter file (final structure change)
  - git mv bin/lib/serialization/template-renderer.js bin/lib/templates/
  - Update imports: ../serialization/ → ../templates/
  - Validation: Full test suite
```

**Why this pattern:**
- Each wave is independently reviewable
- Syntax validation catches import errors early
- Logic testing happens once after all structural changes
- Clear rollback points (one commit per wave)

### Pattern 2: Per-Platform Code Duplication

**What:** Each platform gets its own serializer/cleaner with duplicated code, following Phase 11 validator pattern

**When to use:** Multi-platform systems where platform independence matters more than DRY

**Structure:**
```javascript
// claude-serializer.js - Claude-specific logic only
export function serializeFrontmatter(data) {
  // Full serialization logic
  // Claude arrays: block style (multi-line)
  // No platform parameter needed
}

// copilot-serializer.js - Copilot-specific logic only
export function serializeFrontmatter(data) {
  // Full serialization logic (duplicated from claude)
  // Copilot arrays: flow style (single-line)
  // Platform logic baked in
}

// codex-serializer.js - Codex-specific logic only
export function serializeFrontmatter(data) {
  // Full serialization logic (duplicated)
  // Codex arrays: flow style + special quoting
  // Platform-specific edge cases
}
```

**Integration:**
```javascript
// claude-adapter.js
import { serializeFrontmatter } from '../serialization/claude-serializer.js';
// Uses Claude serializer explicitly

// copilot-adapter.js  
import { serializeFrontmatter } from '../serialization/copilot-serializer.js';
// Uses Copilot serializer explicitly
```

**Why this pattern:**
- Platform isolation: Changes to Claude don't affect Copilot
- Simplicity: No conditional logic or platform parameters
- Debugging: Clear call stack, no indirection
- Evolution: Platforms can diverge independently
- Consistency: Matches Phase 11 validator pattern

### Pattern 3: Import Path Migration

**What:** Systematic approach to updating all import statements when modules move

**Process:**
```bash
# 1. Find all files that import from the module
grep -r "from.*rendering" bin/ tests/ --include="*.js"

# 2. Document the mappings
# Old: from '../rendering/frontmatter-serializer.js'
# New: from '../serialization/claude-serializer.js'

# 3. Update imports in logical groups
# - Platform adapters (3 files)
# - Installer modules (6 files)
# - Internal imports (1 file: cleaner → serializer)
# - Test files (2 files)

# 4. Validate no old paths remain
grep -r "from.*rendering" bin/ tests/ --include="*.js"
# Expected: No results

# 5. Syntax check all JavaScript files
find bin/ -name "*.js" -exec node --check {} \;
```

**Files to update (identified from codebase):**
```
Platform adapters:
  bin/lib/platforms/claude-adapter.js
  bin/lib/platforms/copilot-adapter.js
  bin/lib/platforms/codex-adapter.js

Installer modules:
  bin/lib/installer/install-shared.js
  bin/lib/installer/install-platform-instructions.js
  bin/lib/installer/install-agents.js
  bin/lib/installer/install-skills.js
  bin/lib/installer/orchestrator.js

Internal:
  bin/lib/serialization/claude-cleaner.js (imports claude-serializer.js)
  bin/lib/serialization/copilot-cleaner.js (imports copilot-serializer.js)
  bin/lib/serialization/codex-cleaner.js (imports codex-serializer.js)

Tests:
  tests/unit/frontmatter-serializer.test.js
  tests/unit/template-renderer.test.js
```

### Pattern 4: Platform-Specific YAML Serialization

**What:** Each platform requires different YAML formatting for arrays and special fields

**Platform differences (from existing code):**

**Claude:**
```yaml
# Arrays: block style (multi-line)
skills:
  - gsd-help
  - gsd-verify
  - gsd-plan

# Standard YAML escaping for special characters
```

**Copilot:**
```yaml
# Arrays: flow style (single-line with brackets)
skills: ['gsd-help', 'gsd-verify', 'gsd-plan']

# Standard YAML escaping for special characters
```

**Codex:**
```yaml
# Arrays: flow style (single-line with brackets)
skills: ['gsd-help', 'gsd-verify', 'gsd-plan']

# Special: argument-hint and description ALWAYS quoted
argument-hint: "[issue-number]"
description: "Create a plan for the implementation"
```

**Common serialization logic (duplicated in all platforms):**
```javascript
// Field ordering
const standardFields = ['name', 'description', 'tools', 'disallowedTools', 'skills', 'metadata'];

// Empty value handling
- Empty arrays: omitted from output
- Empty strings: omitted from output  
- undefined: skipped
- false/0: explicitly retained

// Special character quoting
- Dates/versions: always quoted ("2026-01-28", "1.2.3")
- YAML special chars: quote when starts with >|*&!%@`#- or contains :{}[]
- Escape: backslashes and quotes in strings
```

**When splitting shared serializer:**
1. Copy full formatValue(), formatArray(), formatObject() to each platform file
2. Remove platform parameter (it's implicit)
3. Keep platform-specific branches in each file:
   - claude-serializer.js: Keep Claude array formatting only
   - copilot-serializer.js: Keep Copilot array formatting only
   - codex-serializer.js: Keep Codex array formatting + special quoting

### Anti-Patterns to Avoid

**1. Partial Migration State**
- ❌ Update some imports but not others
- ❌ Leave old and new files coexisting
- ✅ Complete each wave fully before moving to next

**2. Automated Refactoring Tools**
- ❌ Use jscodeshift or similar for small scope
- ❌ Risk of tool bugs or unexpected transformations
- ✅ Manual refactoring for ~15 imports provides clarity

**3. Shared Utility Extraction**
- ❌ Extract "common YAML escaping" to shared utility
- ❌ Creates coupling between platforms
- ✅ Duplicate full logic in each platform file

**4. Testing Between Waves**
- ❌ Run full test suite after Wave 1 (import paths changed)
- ❌ Run full test suite after Wave 2 (files split)
- ✅ Syntax check between waves, full tests after Wave 3

## Don't Hand-Roll

Problems that have established solutions or patterns:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Finding all imports | Custom AST parser | `grep -r "from.*pattern"` | Grep is reliable, fast, and handles ESM import syntax |
| Import syntax validation | Custom validator | `node --check file.js` | Node.js built-in validates ESM syntax correctly |
| Git history preservation | Manual copy/delete | `git mv source dest` | Git mv preserves file history for renames |
| YAML serialization | Custom YAML writer | gray-matter (parsing) + custom serialization (existing) | gray-matter is established, custom serializer handles platform requirements |
| Module path resolution | String manipulation | Node.js path module | path.relative(), path.join() handle cross-platform paths correctly |

**Key insight:** For module refactoring with ~15 imports, standard Unix tools (grep, git mv) and Node.js built-ins (--check, path module) are more reliable than custom automation.

## Common Pitfalls

### Pitfall 1: Forgetting Internal Imports

**What goes wrong:** When moving modules, external imports get updated but internal imports (module A importing module B in same directory) are missed

**Why it happens:** 
- Focus on "who uses this module" misses "what this module uses"
- Internal imports have different relative paths (same directory vs parent directory)

**Example:**
```javascript
// frontmatter-cleaner.js imports frontmatter-serializer.js
// Old (both in rendering/):
import { serializeFrontmatter } from './frontmatter-serializer.js';

// After Wave 1 (both in serialization/): No change needed
import { serializeFrontmatter } from './frontmatter-serializer.js';

// After Wave 2 (cleaner becomes platform-specific):
// claude-cleaner.js:
import { serializeFrontmatter } from './claude-serializer.js';

// copilot-cleaner.js:
import { serializeFrontmatter } from './copilot-serializer.js';
```

**How to avoid:**
1. Map ALL imports, not just external ones
2. Check imports within moved modules themselves
3. Use grep in both directions: "who imports X" and "what does X import"

**Warning signs:**
- Syntax check passes but runtime fails
- Module not found errors on first use
- Test imports work but code imports don't

### Pitfall 2: Incomplete Code Duplication

**What goes wrong:** When copying shared code to per-platform files, missing conditional branches or edge cases

**Why it happens:**
- Shared code has platform conditionals (if platform === 'claude')
- Easy to copy "main path" and miss else branches
- Platform-specific logic might be deep in nested functions

**Example from existing serializer:**
```javascript
// Current shared code:
function formatArray(key, value, platform) {
  if (platform === 'claude') {
    // Claude logic ← Need to copy to claude-serializer.js
    const items = value.map(item => `  - ${item}`).join('\n');
    return `${key}:\n${items}`;
  }
  
  // Copilot/Codex logic ← Need to copy to BOTH copilot and codex serializers
  const items = value.map(item => `'${item}'`).join(', ');
  return `${key}: [${items}]`;
}

// Also check formatValue() for Codex-specific:
if (platform === 'codex' && (fieldName === 'argument-hint' || fieldName === 'description')) {
  // Codex special quoting ← Must be in codex-serializer.js
}
```

**How to avoid:**
1. Review ALL conditional branches in shared code
2. Create checklist: Claude-specific, Copilot-specific, Codex-specific, Shared
3. Each platform file gets: its specific logic + shared logic
4. Don't remove if/else - keep both branches in duplicated code initially
5. Review can simplify after duplication is complete

**Warning signs:**
- Tests pass for one platform, fail for another
- Edge cases work in shared code, break in per-platform
- Platform-specific features lost after split

### Pitfall 3: Case Sensitivity in Import Paths

**What goes wrong:** Import path has different case than filename, works on Mac/Windows but breaks on Linux

**Why it happens:**
- macOS and Windows filesystems are case-insensitive by default
- Linux filesystems are case-sensitive
- Local testing on Mac/Windows succeeds, CI on Linux fails

**Example:**
```javascript
// File created: claude-serializer.js (lowercase 's')

// Import (wrong case):
import { serializeFrontmatter } from './claude-Serializer.js';
//                                            ↑ Capital S

// Works on: macOS, Windows
// Fails on: Linux, CI pipelines
```

**How to avoid:**
1. Match filename case exactly in imports
2. Use lowercase-with-hyphens consistently (kebab-case)
3. Verify imports before commit: `node --check`
4. If project has CI, check logs for case sensitivity errors

**Warning signs:**
- Works locally, fails in CI
- Works on Mac, fails when teammate on Linux pulls
- Module not found errors only on some systems

### Pitfall 4: Test Imports Forgotten

**What goes wrong:** Update imports in source code but forget to update test files that import the same modules

**Why it happens:**
- Tests are in different directory (tests/ vs bin/)
- Focus on "making the code work" overlooks "making tests run"
- Tests might not run locally if using --watch with specific files

**Example:**
```javascript
// Source updated:
// bin/lib/platforms/claude-adapter.js
import { serializeFrontmatter } from '../serialization/claude-serializer.js';

// Test still has old path:
// tests/unit/frontmatter-serializer.test.js
import { serializeFrontmatter } from '../../bin/lib/rendering/frontmatter-serializer.js';
//                                             ↑ Old path
```

**How to avoid:**
1. Include tests/ in grep searches: `grep -r "pattern" bin/ tests/`
2. Run full test suite after import updates
3. Check test files explicitly in Wave 1 and Wave 2

**Warning signs:**
- `npm test` fails with module not found
- Tests pass locally but fail in CI
- Some test files succeed, others fail on imports

### Pitfall 5: Platform Logic Removal During Split

**What goes wrong:** When removing platform parameter and splitting files, accidentally remove platform-specific logic that's still needed

**Why it happens:**
- Thinking "this file is only for Claude, remove all platform checks"
- But some logic is shared + platform-specific in same function
- Removing if (platform === 'claude') removes the logic inside it

**Example:**
```javascript
// Original shared code:
function formatValue(value, fieldName, platform) {
  // General logic (needed in all platforms)
  if (value === null) return 'null';
  
  // Platform-specific (only needed in codex-serializer.js)
  if (platform === 'codex' && (fieldName === 'argument-hint' || fieldName === 'description')) {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  
  // General logic continues...
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return `'${value}'`;
  }
  
  return value;
}

// Wrong split (codex-serializer.js):
function formatValue(value, fieldName) {
  // Removed platform check, but also lost the logic!
  if (value === null) return 'null';
  // ← Missing Codex special quoting here
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return `'${value}'`;
  }
  return value;
}

// Correct split (codex-serializer.js):
function formatValue(value, fieldName) {
  if (value === null) return 'null';
  
  // Keep Codex logic, remove the check
  if (fieldName === 'argument-hint' || fieldName === 'description') {
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
  }
  
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return `'${value}'`;
  }
  return value;
}
```

**How to avoid:**
1. Map all platform-specific logic before splitting
2. Each platform file gets: remove check, keep logic
3. Review: claude-serializer.js has Claude logic, copilot-serializer.js has Copilot logic, etc.
4. Test each platform separately after split

**Warning signs:**
- Codex output loses special quoting
- Claude arrays switch to flow style
- Platform-specific features regress

### Pitfall 6: Git History Loss

**What goes wrong:** Deleting and recreating files loses git history; blame/log no longer shows file evolution

**Why it happens:**
- Intuition: "delete old file, create new file"
- Git doesn't auto-detect renames above ~50% similarity
- Wave 2 creates NEW files (no history to preserve, this is OK)
- Wave 1 renames EXISTING files (history should be preserved)

**How to avoid:**
```bash
# Wave 1 (rename): Use git mv
git mv bin/lib/rendering bin/lib/serialization
# Preserves history for all files in directory

# Wave 2 (split): Create new files
# No git mv needed - these are new platform-specific files
# Original shared files will be deleted, but that's OK
cp bin/lib/serialization/frontmatter-serializer.js bin/lib/serialization/claude-serializer.js
# Edit platform-specific logic
# git add new files
# git rm old shared file

# Wave 3 (relocate): Use git mv again
git mv bin/lib/serialization/template-renderer.js bin/lib/templates/template-renderer.js
```

**When history preservation matters:**
- Wave 1: YES - these files continue with same purpose
- Wave 2: NO - new files with different scope (per-platform)
- Wave 3: YES - file continues with same purpose

**Warning signs:**
- `git log --follow file` shows no history
- `git blame` shows all lines as one commit
- Can't trace when specific logic was added

## Code Examples

Verified patterns from existing codebase and established Node.js practices.

### Example 1: Wave 1 - Rename Module Directory

```bash
# Rename directory with history preservation
git mv bin/lib/rendering bin/lib/serialization

# Update all imports in one pass
# Platform adapters (3 files)
# Find: from '../rendering/frontmatter-serializer.js'
# Replace: from '../serialization/frontmatter-serializer.js'

# Installer modules (6 files)  
# Find: from '../rendering/
# Replace: from '../serialization/

# Tests (2 files)
# Find: from '../../bin/lib/rendering/
# Replace: from '../../bin/lib/serialization/

# Verify no old paths remain
grep -r "from.*rendering" bin/ tests/ --include="*.js"
# Expected: No results

# Syntax check all JS files
find bin/ -name "*.js" -exec node --check {} \; 2>&1 | grep -v "Syntax OK"
# Expected: No errors

# Commit Wave 1
git add -A
git commit -m "refactor(serialization): rename rendering module to serialization

Wave 1 of 3: Rename module directory for clarity
- bin/lib/rendering/ → bin/lib/serialization/
- Updated all imports (platform adapters, installers, tests)
- No logic changes, only path updates
- Verified with syntax check and grep"
```

### Example 2: Wave 2 - Split Into Per-Platform Files

```javascript
// Step 1: Create claude-serializer.js
// Source: Copy from bin/lib/serialization/frontmatter-serializer.js

/**
 * Claude-specific YAML frontmatter serializer
 * Arrays in block style (multi-line)
 * Standard YAML escaping
 */

export function serializeFrontmatter(data) {
  const lines = [];
  const standardFields = ['name', 'description', 'tools', 'disallowedTools', 'skills', 'metadata'];
  const allFields = new Set([...standardFields, ...Object.keys(data)]);
  
  for (const key of allFields) {
    if (!(key in data)) continue;
    const value = data[key];
    if (value === undefined) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    
    if (Array.isArray(value)) {
      lines.push(formatArray(key, value));
    } else if (typeof value === 'object' && value !== null) {
      lines.push(formatObject(key, value));
    } else {
      lines.push(formatScalar(key, value));
    }
  }
  
  return lines.join('\n');
}

function formatArray(key, value) {
  // Claude: block style (multi-line)
  const items = value.map(item => `  - ${item}`).join('\n');
  return `${key}:\n${items}`;
}

function formatObject(key, value) {
  const lines = [`${key}:`];
  for (const [subKey, subValue] of Object.entries(value)) {
    if (subValue === undefined) continue;
    if (typeof subValue === 'object' && subValue !== null && !Array.isArray(subValue)) {
      lines.push(`  ${subKey}:`);
      for (const [nestedKey, nestedValue] of Object.entries(subValue)) {
        if (nestedValue === undefined) continue;
        lines.push(`    ${nestedKey}: ${formatValue(nestedValue, nestedKey)}`);
      }
    } else {
      lines.push(`  ${subKey}: ${formatValue(subValue, subKey)}`);
    }
  }
  return lines.join('\n');
}

function formatScalar(key, value) {
  return `${key}: ${formatValue(value, key)}`;
}

function formatValue(value, fieldName) {
  if (value === null) return 'null';
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (typeof value === 'number') return String(value);
  
  if (typeof value === 'string') {
    // Date/version quoting
    if (/^\d{4}-\d{2}-\d{2}/.test(value) || /^\d+\.\d+(\.\d+)?$/.test(value)) {
      if (value.includes("'")) {
        return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      return `'${value}'`;
    }
    
    // YAML special character quoting
    const needsQuoting = /^[>|*&!%@`#]|[:{}\[\]]/.test(value) || value.startsWith('-');
    
    if (!needsQuoting) {
      return value;
    }
    
    if (value.includes("'")) {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    return `'${value}'`;
  }
  
  if (Array.isArray(value)) {
    const items = value.map(v => `'${v}'`).join(', ');
    return `[${items}]`;
  }
  
  return String(value);
}
```

```javascript
// Step 2: Create copilot-serializer.js and codex-serializer.js
// Follow same structure, change formatArray() and add Codex quoting

// codex-serializer.js formatValue() addition:
function formatValue(value, fieldName) {
  // ... null, boolean, number checks ...
  
  if (typeof value === 'string') {
    // Codex-specific: Always quote argument-hint and description
    if (fieldName === 'argument-hint' || fieldName === 'description') {
      return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
    }
    
    // ... rest of string logic ...
  }
  
  // ... rest of function ...
}
```

```javascript
// Step 3: Create per-platform cleaners
// claude-cleaner.js

import matter from 'gray-matter';
import { serializeFrontmatter } from './claude-serializer.js';

/**
 * Clean frontmatter for Claude platform
 * Removes empty fields and rebuilds with Claude formatting
 */
export function cleanFrontmatter(content) {
  try {
    const parsed = matter(content);
    const data = parsed.data;
    
    const cleanedData = {};
    for (const [key, value] of Object.entries(data)) {
      // Handle argument-hint
      if (key === 'argument-hint') {
        if (value === '' || value === null || value === undefined) {
          continue;
        } else if (Array.isArray(value)) {
          cleanedData[key] = '[' + value.join(', ') + ']';
        } else {
          cleanedData[key] = value;
        }
      }
      // Keep non-empty values
      else if (value !== '' && value !== null && value !== undefined) {
        cleanedData[key] = value;
      }
      // Keep false/0 explicitly
      else if (value === false || value === 0) {
        cleanedData[key] = value;
      }
    }
    
    const serialized = serializeFrontmatter(cleanedData);
    return `---\n${serialized}\n---\n\n${parsed.content}`;
  } catch (error) {
    return content;
  }
}
```

```bash
# Step 4: Update imports to use per-platform files

# bin/lib/platforms/claude-adapter.js
# Old: import { serializeFrontmatter } from '../rendering/frontmatter-serializer.js';
# New: import { serializeFrontmatter } from '../serialization/claude-serializer.js';

# bin/lib/platforms/copilot-adapter.js  
# New: import { serializeFrontmatter } from '../serialization/copilot-serializer.js';

# bin/lib/platforms/codex-adapter.js
# New: import { serializeFrontmatter } from '../serialization/codex-serializer.js';

# bin/lib/installer/install-skills.js
# Old: import { cleanFrontmatter } from '../rendering/frontmatter-cleaner.js';
# Keep import path, but file now dispatches to per-platform cleaners
# OR: Update to import per-platform cleaners based on detected platform

# Step 5: Remove old shared files
git rm bin/lib/serialization/frontmatter-serializer.js
git rm bin/lib/serialization/frontmatter-cleaner.js

# Step 6: Update test imports
# tests/unit/frontmatter-serializer.test.js needs platform-specific imports
# Split into: claude-serializer.test.js, copilot-serializer.test.js, codex-serializer.test.js
# OR: Update to import and test all three serializers

# Verify syntax
find bin/ -name "*.js" -exec node --check {} \; 2>&1 | grep -v "Syntax OK"

# Commit Wave 2
git add -A
git commit -m "refactor(serialization): split into per-platform serializers and cleaners

Wave 2 of 3: Apply adapter pattern to serialization
- Created: claude-serializer.js, copilot-serializer.js, codex-serializer.js
- Created: claude-cleaner.js, copilot-cleaner.js, codex-cleaner.js
- Each platform file is self-contained (duplicated code)
- Updated all imports to use platform-specific files
- Removed shared frontmatter-serializer.js and frontmatter-cleaner.js
- Follows Phase 11 validator pattern: independence over DRY"
```

### Example 3: Wave 3 - Relocate Template Renderer

```bash
# Create new module directory
mkdir -p bin/lib/templates

# Move template-renderer.js (not frontmatter-specific)
git mv bin/lib/serialization/template-renderer.js bin/lib/templates/template-renderer.js

# Update imports (5 files use template-renderer)
# Find: from '../serialization/template-renderer.js'
# Replace: from '../templates/template-renderer.js'

# OR if from installer/:
# Find: from '../serialization/template-renderer.js'  
# Replace: from '../templates/template-renderer.js'

# Verify
grep -r "template-renderer" bin/ tests/ --include="*.js"
# All imports should be from ../templates/ or ../../bin/lib/templates/

# Syntax check
find bin/ -name "*.js" -exec node --check {} \; 2>&1 | grep -v "Syntax OK"

# Run full test suite
npm test

# Commit Wave 3
git add -A
git commit -m "refactor(templates): move template-renderer to templates module

Wave 3 of 3: Separate general template rendering from frontmatter serialization
- Moved: bin/lib/serialization/template-renderer.js → bin/lib/templates/
- Updated all imports (install-shared, install-platform-instructions, etc.)
- Ran full test suite: all tests passing
- Module organization complete"
```

### Example 4: Validation After Each Wave

```bash
# After Wave 1: Verify imports updated
echo "=== Checking for old 'rendering' paths ==="
grep -r "from.*rendering" bin/ tests/ --include="*.js"
# Expected: No results

echo "=== Syntax checking all JavaScript files ==="
find bin/ -name "*.js" -exec node --check {} \; 2>&1 | grep -v "Syntax OK"
# Expected: No errors

# After Wave 2: Verify per-platform imports
echo "=== Checking platform adapters use platform-specific serializers ==="
grep "import.*serializer" bin/lib/platforms/*.js
# Expected: 
#   claude-adapter.js: from '../serialization/claude-serializer.js'
#   copilot-adapter.js: from '../serialization/copilot-serializer.js'
#   codex-adapter.js: from '../serialization/codex-serializer.js'

echo "=== Syntax checking ==="
find bin/ -name "*.js" -exec node --check {} \; 2>&1 | grep -v "Syntax OK"
# Expected: No errors

# After Wave 3: Full test suite
echo "=== Running full test suite ==="
npm test
# Expected: All tests pass
```

## State of the Art

| Aspect | Current Approach | Best Practice 2025 | Status |
|--------|------------------|-------------------|--------|
| Module refactoring | Manual for ~15 imports | Manual for small scope, automated (jscodeshift) for large | ✅ Current is appropriate |
| Import validation | grep + node --check | ESLint with import plugin or TypeScript | ✅ Sufficient for project |
| Per-platform duplication | Duplicate code for platform isolation | Extract shared, use platform adapters | ⚠️ Project chose duplication intentionally |
| YAML serialization | Custom serializer for fine-grained control | js-yaml with options | ✅ Custom needed for platform requirements |
| Git history | git mv for renames | git mv for renames | ✅ Standard practice |
| Testing strategy | Test after complete migration | Test continuously (watch mode) | ✅ Wave strategy matches refactoring scope |

**Deprecated/outdated:**
- CommonJS require() - Project uses ESM imports (current standard)
- Automated refactoring for small changes - Manual provides clarity for ~15 imports

**Current best practice:**
The project's approach aligns with 2025 best practices for module refactoring:
- Manual refactoring for small scope (HIGH confidence)
- ESM imports with .js extensions (HIGH confidence)
- Per-platform duplication for isolation (HIGH confidence - intentional trade-off)
- Git mv for history preservation (HIGH confidence)
- Syntax validation between waves, full tests at end (HIGH confidence)

## Open Questions

None identified. All domains have been researched with sufficient confidence for planning.

**Research coverage:**
- ✅ Module refactoring patterns (HIGH confidence)
- ✅ Import migration strategies (HIGH confidence)
- ✅ Code duplication patterns (HIGH confidence from existing codebase)
- ✅ Platform-specific YAML serialization (HIGH confidence from existing code)
- ✅ Multi-wave migration safety (HIGH confidence)
- ✅ Contributor documentation patterns (HIGH confidence from existing docs)
- ✅ Common pitfalls (MEDIUM-HIGH confidence from training + analysis)

## Sources

### Primary (HIGH confidence)
- **Existing codebase analysis:**
  - `bin/lib/rendering/frontmatter-serializer.js` - Platform-specific YAML formatting logic (207 lines)
  - `bin/lib/rendering/frontmatter-cleaner.js` - Frontmatter cleaning pattern (50 lines)
  - `bin/lib/frontmatter/claude-validator.js` - Per-platform validator pattern from Phase 11
  - `bin/lib/platforms/claude-adapter.js` - Platform adapter integration pattern
  - `tests/unit/frontmatter-serializer.test.js` - Test import patterns
  - `CONTRIBUTING.md` - Project contribution style and patterns
  - `docs/architecture.md` - System structure and module organization

- **Import mapping analysis:**
  - grep analysis identified 15 import statements across 12 files
  - Platform adapters: 3 files (claude, copilot, codex)
  - Installer modules: 6 files (install-shared, install-platform-instructions, install-agents, install-skills, orchestrator)
  - Internal: 1 file (cleaner → serializer)
  - Tests: 2 files (frontmatter-serializer.test.js, template-renderer.test.js)

### Secondary (MEDIUM confidence)
- **Node.js ESM best practices** - From training data (verified against project's existing ESM usage):
  - .js extensions required in imports
  - git mv preserves history
  - Manual refactoring for small scope preferred
  - node --check for syntax validation

- **Code organization patterns** - From training data + Phase 11 validation:
  - Per-platform duplication for independence
  - Manual imports vs auto-discovery
  - Platform isolation over DRY

### Tertiary (LOW confidence)
None - all findings verified against existing codebase or established practices

## Metadata

**Confidence breakdown:**
- Module refactoring: HIGH - Standard Node.js/git practices, verified with existing project structure
- Import migration: HIGH - Direct analysis of current imports, clear mapping identified
- Code duplication: HIGH - Pattern established in Phase 11, validated in codebase
- YAML serialization: HIGH - Existing code provides complete implementation reference
- Migration strategy: HIGH - Standard wave-based approach, validated against project scope
- Contributor docs: HIGH - Style and structure derived from existing project documentation
- Common pitfalls: MEDIUM-HIGH - Combination of training knowledge and codebase analysis

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable practices, existing codebase as reference)

**Research scope:**
This research focused on HOW to implement the module reorganization decisions from Phase 12 CONTEXT.md. It did not explore alternatives to the decisions already made (per-platform duplication, 3-wave migration, manual imports), as those were locked in during the /gsd-discuss-phase conversation.

**Planner guidance:**
All architectural patterns, pitfalls, and code examples are directly applicable to task creation. The 3-wave migration structure should map to task waves. Import path mappings are ready for task specifications. Per-platform code duplication should be explicitly noted in task descriptions to avoid abstraction attempts.
