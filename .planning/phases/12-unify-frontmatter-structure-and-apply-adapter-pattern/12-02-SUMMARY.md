---
phase: 12-unify-frontmatter-structure-and-apply-adapter-pattern
plan: 02
subsystem: frontmatter-architecture
tags: [refactoring, platform-isolation, adapter-pattern, serialization]

requires:
  - phase: 11
    plan: 02
    provided: per-platform validator pattern
  - phase: 12
    plan: 01
    provided: renamed rendering/ to serialization/

provides:
  - platform-specific serializers (claude, copilot, codex)
  - platform-specific cleaners (claude, copilot, codex)
  - template-renderer in correct templates/ module
  - complete platform isolation for frontmatter serialization

affects:
  - phase: 12
    plan: 03
    how: tests need updating for new per-platform structure

tech-stack:
  added: []
  removed: [shared frontmatter-serializer, shared frontmatter-cleaner]
  patterns: [per-platform duplication, platform-isolation-over-dry]

key-files:
  created:
    - bin/lib/serialization/claude-serializer.js
    - bin/lib/serialization/copilot-serializer.js
    - bin/lib/serialization/codex-serializer.js
    - bin/lib/serialization/claude-cleaner.js
    - bin/lib/serialization/copilot-cleaner.js
    - bin/lib/serialization/codex-cleaner.js
    - bin/lib/templates/ (directory)
  moved:
    - bin/lib/templates/template-renderer.js (from serialization/)
  deleted:
    - bin/lib/serialization/frontmatter-serializer.js
    - bin/lib/serialization/frontmatter-cleaner.js
  modified:
    - bin/lib/platforms/claude-adapter.js
    - bin/lib/platforms/copilot-adapter.js
    - bin/lib/platforms/codex-adapter.js
    - bin/lib/installer/install-skills.js
    - bin/lib/installer/orchestrator.js
    - bin/lib/installer/install-shared.js
    - bin/lib/installer/install-platform-instructions.js
    - bin/lib/installer/install-agents.js

decisions:
  - title: Code duplication over coupling
    choice: Each platform has full serializer/cleaner logic
    rationale: Changes to Claude formatting don't affect Copilot/Codex
    alternatives: Shared code with platform parameter (rejected - creates coupling)
    
  - title: Separate templates/ module
    choice: template-renderer.js moved to bin/lib/templates/
    rationale: EJS rendering is general-purpose, not frontmatter-specific
    alternatives: Keep in serialization/ (rejected - wrong separation of concerns)
    
  - title: Platform-specific cleaners
    choice: Each cleaner imports its own serializer
    rationale: Ensures platform consistency end-to-end
    alternatives: Shared cleaner with platform parameter (rejected - defeats isolation)

metrics:
  duration: 6m 10s
  tasks_completed: 3
  files_created: 7
  files_modified: 8
  files_deleted: 2
  lines_added: ~800
  commits: 3

completed: 2026-02-01
---

# Phase 12 Plan 02: Per-Platform Serializer Split Summary

**One-liner:** Split shared frontmatter serializer/cleaner into per-platform files (claude, copilot, codex) with full logic duplication, following Phase 11 validator pattern for platform isolation

## What Was Accomplished

### Task 2: Created Per-Platform Serializers ✅
**Commit:** 66d4181

Created three platform-specific serializers with full serialization logic:

1. **claude-serializer.js** (200+ lines)
   - Block-style arrays (multi-line)
   - Example: `skills:\n  - gsd-help\n  - gsd-verify`
   - No platform parameter needed - logic baked in

2. **copilot-serializer.js** (200+ lines)
   - Flow-style arrays (single-line with brackets)
   - Example: `skills: ['gsd-help', 'gsd-verify']`
   - Duplicated from claude with array formatting changes

3. **codex-serializer.js** (200+ lines)
   - Flow-style arrays like Copilot
   - Special quoting: always double-quote argument-hint and description
   - Platform-specific formatValue() logic

**Key principle:** Code duplication is intentional and preferred over coupling. Each serializer is fully independent.

### Task 3: Created Per-Platform Cleaners and Updated Adapters ✅
**Commit:** b891b41

Created three platform-specific cleaners:

1. **claude-cleaner.js**
   - Imports `./claude-serializer.js`
   - Cleans frontmatter using Claude formatting

2. **copilot-cleaner.js**
   - Imports `./copilot-serializer.js`
   - Cleans frontmatter using Copilot formatting

3. **codex-cleaner.js**
   - Imports `./codex-serializer.js`
   - Cleans frontmatter using Codex formatting

Updated all three platform adapters:
- `claude-adapter.js` → imports `claude-serializer.js` (removed 'claude' parameter)
- `copilot-adapter.js` → imports `copilot-serializer.js` (removed 'copilot' parameter)
- `codex-adapter.js` → imports `codex-serializer.js` (removed 'codex' parameter)

Updated installer integration:
- `install-skills.js` → uses cleaner registry matching platform
- `orchestrator.js` → removed unused import

Deleted old shared files:
- ❌ `frontmatter-serializer.js`
- ❌ `frontmatter-cleaner.js`

**Result:** Platform isolation achieved. Changes to Claude serialization logic don't affect Copilot or Codex.

### Task 4: Moved template-renderer to templates/ Module ✅
**Commit:** adad93e

Moved template-renderer.js to correct module:
- Created `bin/lib/templates/` directory
- Moved `template-renderer.js` using git mv (history preserved)

Updated all imports (5 installer files):
- `install-shared.js`
- `install-platform-instructions.js`
- `install-agents.js`
- `install-skills.js`
- `orchestrator.js`

All changed from:
```javascript
from '../serialization/template-renderer.js'
```

To:
```javascript
from '../templates/template-renderer.js'
```

**Rationale:** template-renderer.js handles general EJS rendering, not YAML serialization. Separation of concerns: serialization/ is frontmatter-specific, templates/ is general-purpose.

## Module Structure (After)

```
bin/lib/
├── serialization/           # Per-platform frontmatter serialization
│   ├── claude-serializer.js   (200+ lines, block-style arrays)
│   ├── copilot-serializer.js  (200+ lines, flow-style arrays)
│   ├── codex-serializer.js    (200+ lines, flow + special quoting)
│   ├── claude-cleaner.js      (50+ lines, imports claude-serializer)
│   ├── copilot-cleaner.js     (50+ lines, imports copilot-serializer)
│   └── codex-cleaner.js       (50+ lines, imports codex-serializer)
├── templates/               # General template rendering
│   └── template-renderer.js   (EJS processing)
└── platforms/               # Platform adapters
    ├── claude-adapter.js      (imports claude-serializer)
    ├── copilot-adapter.js     (imports copilot-serializer)
    └── codex-adapter.js       (imports codex-serializer)
```

## Platform Isolation Verification

**Independence verified:**
1. Claude changes only touch: claude-serializer.js, claude-cleaner.js, claude-adapter.js
2. Copilot changes only touch: copilot-serializer.js, copilot-cleaner.js, copilot-adapter.js
3. Codex changes only touch: codex-serializer.js, codex-cleaner.js, codex-adapter.js
4. No shared code with platform conditionals
5. No platform parameter passing

**Pattern consistency:**
- Matches Phase 11 validator pattern (claude-validator, copilot-validator, codex-validator)
- Matches adapter pattern (claude-adapter, copilot-adapter, codex-adapter)
- Code duplication over coupling principle applied consistently

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

### Decision 1: Full Logic Duplication
**What:** Each serializer contains complete serialization logic (200+ lines duplicated)

**Why:** 
- Platform isolation: Claude fix doesn't risk breaking Copilot
- No conditional code: Each platform's logic is self-contained
- Easier debugging: All Claude logic in one file

**Impact:**
- ~600 lines of duplicated code across 3 serializers
- Trade-off: maintenance (3 places to fix bugs) vs safety (isolated changes)
- Architectural decision: isolation > DRY principle

### Decision 2: Cleaner Registry Pattern
**What:** install-skills.js uses registry object mapping platform → cleaner function

**Why:**
- Consistent with validator registry pattern
- Dynamic lookup based on platform variable
- Type-safe: error if platform not found

**Implementation:**
```javascript
const cleaners = {
  'claude': cleanClaudeFrontmatter,
  'copilot': cleanCopilotFrontmatter,
  'codex': cleanCodexFrontmatter
};
```

### Decision 3: Remove Platform Parameters
**What:** Removed `platform` parameter from all serializeFrontmatter() calls

**Why:**
- Platform logic baked into each serializer
- No need to pass platform - it's implicit
- Cleaner API: `serializeFrontmatter(data)` vs `serializeFrontmatter(data, platform)`

**Before:**
```javascript
const frontmatter = serializeFrontmatter(data, 'claude');
```

**After:**
```javascript
import { serializeFrontmatter } from '../serialization/claude-serializer.js';
const frontmatter = serializeFrontmatter(data);
```

## Test Impact

**Tests requiring updates (Plan 12-03):**
1. `tests/unit/frontmatter-serializer.test.js` → needs platform-specific test files
2. Any tests importing shared serializer/cleaner → need platform-specific imports

**Test files NOT modified in this plan:**
- Deferred to Plan 12-03 (test migration)

## Next Phase Readiness

**Ready for Wave 4 (Plan 12-03):**
- ✅ Per-platform serializers created
- ✅ Per-platform cleaners created
- ✅ Adapters updated to use platform-specific imports
- ✅ Old shared files deleted
- ✅ Module structure finalized
- ✅ All syntax validation passing

**Blockers for Plan 12-03:**
- None

**Known issues:**
- Test file `tests/unit/frontmatter-serializer.test.js` still imports old shared file (expected - will be fixed in Plan 12-03)

## Platform-Specific Differences Codified

### Claude Serializer
- **Array formatting:** Block style (multi-line)
- **Object formatting:** 2-space indentation
- **String quoting:** Minimal (only when required by YAML)
- **Special rules:** None

### Copilot Serializer
- **Array formatting:** Flow style (single-line with brackets)
- **Object formatting:** 2-space indentation
- **String quoting:** Single quotes for array items
- **Special rules:** None

### Codex Serializer
- **Array formatting:** Flow style (single-line with brackets)
- **Object formatting:** 2-space indentation
- **String quoting:** Single quotes for array items
- **Special rules:** Always double-quote `argument-hint` and `description` fields

## Architecture Validation

**Phase 11 pattern consistency:**
- ✅ Validators: per-platform (claude, copilot, codex)
- ✅ Serializers: per-platform (claude, copilot, codex)
- ✅ Cleaners: per-platform (claude, copilot, codex)
- ✅ Adapters: per-platform (claude, copilot, codex)

**Module separation:**
- ✅ frontmatter/ → validation
- ✅ serialization/ → per-platform serializers/cleaners
- ✅ templates/ → general rendering
- ✅ platforms/ → platform adapters

**Import graph:**
- claude-adapter → claude-serializer ✅
- copilot-adapter → copilot-serializer ✅
- codex-adapter → codex-serializer ✅
- claude-cleaner → claude-serializer ✅
- copilot-cleaner → copilot-serializer ✅
- codex-cleaner → codex-serializer ✅
- No cross-platform imports ✅

## Commits

1. **66d4181** - `feat(12-02): create per-platform serializers`
   - Created claude-serializer.js, copilot-serializer.js, codex-serializer.js
   - Each with full logic (no shared imports)

2. **b891b41** - `feat(12-02): split cleaners and update adapter imports`
   - Created claude-cleaner.js, copilot-cleaner.js, codex-cleaner.js
   - Updated all adapter imports
   - Deleted old shared files
   - Updated install-skills.js cleaner registry

3. **adad93e** - `feat(12-02): move template-renderer to templates module`
   - Moved template-renderer.js to bin/lib/templates/
   - Updated 5 installer file imports

## Performance Impact

**Build time:** No change (pure refactoring)

**Runtime:** Negligible
- Serializer logic identical (just relocated)
- No additional function calls
- Import cost: 3 files instead of 1 (minimal)

**Memory:** Minimal increase
- 3 serializer modules loaded instead of 1 shared
- ~600 lines of duplicated code in memory
- Trade-off: isolation worth minimal memory cost

## Migration Path

**For future platform additions:**

1. Create new serializer: `bin/lib/serialization/{platform}-serializer.js`
2. Create new cleaner: `bin/lib/serialization/{platform}-cleaner.js`
3. Create new adapter importing platform serializer
4. Add to cleaner registry in install-skills.js
5. No changes needed to existing platforms

**Example (adding "cursor" platform):**
```javascript
// bin/lib/serialization/cursor-serializer.js
export function serializeFrontmatter(data) {
  // Cursor-specific logic
}

// bin/lib/serialization/cursor-cleaner.js
import { serializeFrontmatter } from './cursor-serializer.js';
export function cleanFrontmatter(content) { ... }

// bin/lib/installer/install-skills.js
const cleaners = {
  'claude': cleanClaudeFrontmatter,
  'copilot': cleanCopilotFrontmatter,
  'codex': cleanCodexFrontmatter,
  'cursor': cleanCursorFrontmatter  // Add here
};
```

## Success Metrics

- ✅ 3 platform serializers created with full logic
- ✅ 3 platform cleaners created importing their own serializers
- ✅ All 3 platform adapters use platform-specific imports
- ✅ Old shared serializer/cleaner deleted
- ✅ template-renderer.js moved to bin/lib/templates/
- ✅ All installer imports updated (5 files)
- ✅ All files pass syntax validation
- ✅ Platform isolation verified (changes to one platform don't affect others)
- ✅ Ready for Wave 4 (documentation and full testing)

## Lessons Learned

1. **Code duplication is sometimes the right choice**
   - Platform isolation worth ~600 lines of duplicated code
   - Changes to one platform don't risk breaking others
   - Easier to reason about (all Claude logic in one file)

2. **Git mv preserves history**
   - Moving template-renderer.js with git mv keeps file history
   - Helps with future git blame and bisect

3. **Registry pattern scales well**
   - Cleaner registry in install-skills.js matches validator registry
   - Easy to add new platforms
   - Type-safe with runtime error checking

4. **Module boundaries matter**
   - templates/ for general rendering
   - serialization/ for frontmatter-specific logic
   - Clear separation of concerns

## Ready for Next Plan

**Plan 12-03 can proceed with:**
- ✅ Clean per-platform structure
- ✅ All imports updated
- ✅ Old shared files removed
- ✅ Module structure finalized
- ✅ Test update roadmap clear

**Documentation needs:**
- Explain why code is duplicated (intentional, not technical debt)
- Platform-specific formatting rules
- How to add new platforms
