---
created: 2026-01-28T12:41
title: Fix critical installation bugs - Copilot frontmatter and template variables
area: installer
severity: critical
files:
  - bin/lib/installer/orchestrator.js:279-282
  - bin/lib/platforms/copilot-adapter.js:82-96
  - bin/lib/installer/orchestrator.js:312-319
  - templates/agents/*.agent.md
  - templates/get-shit-done/**
---

## Problem

Three critical bugs discovered in installation system affecting Copilot (and potentially other platforms):

### Bug #1: Skills field incorrectly added to Copilot agents
**Status:** Confirmed via test
**Impact:** Copilot agents receive `skills: [...]` field in frontmatter, which should NOT exist for Copilot
**Root cause:** `transformFrontmatter()` method exists in adapters but is NEVER called during agent installation
**Evidence:** 
- Line 281-282 in orchestrator.js only calls `replaceVariables()` 
- `transformFrontmatter()` method defined but unused
- Test confirms skills field not being removed

### Bug #2: Tools format incorrect for Copilot agents
**Status:** Confirmed
**Impact:** Tools serialized as YAML array instead of required single-line format
**Required format:** `['tool-a', 'tool-b', 'custom-mcp/tool-1']` (one line, single quotes, comma-separated)
**Current behavior:** gray-matter serializes as multi-line YAML array:
```yaml
tools:
  - read
  - edit
  - execute
```
**Root cause:** 
- `transformFrontmatter()` returns JavaScript array
- gray-matter.stringify() converts to YAML format
- No custom serializer for tools field

### Bug #3: Template variables not replaced in get-shit-done/ directory
**Status:** Confirmed by inspection
**Impact:** Files in `get-shit-done/` directory contain unreplaced variables like `{{PLATFORM_ROOT}}`
**Current behavior:** Only manifest file processed (line 316-319)
**Required behavior:** ALL files in get-shit-done/ need variable replacement
**Root cause:** `copyDirectory()` copies files as-is, only manifest gets `processTemplateFile()`

## Investigation Results

**Test performed in /tmp:**
```javascript
// CopilotAdapter.transformFrontmatter() test
Input: { skills: ['gsd-help'], tools: 'Read, Write, Bash' }
Output: { tools: ['read', 'edit', 'execute'], metadata: {...} }
// ✓ Skills removed correctly in transformation
// ✓ Tools mapped correctly (Read→read, Write→edit, Bash→execute)
// ✗ But transformation never called in installation flow!
```

**Code inspection:**
- orchestrator.js:279-282 - Agents: Only `replaceVariables()` called
- orchestrator.js:312-319 - Shared dir: Only manifest processed
- NO call to `adapter.transformFrontmatter()` anywhere

## Severity Assessment

**Critical** - Affects ALL Copilot installations in production:
- Invalid frontmatter breaks Copilot CLI parsing
- Template variables visible to users
- Ships broken product

**Scope:** 
- All 13 agent files
- All files in get-shit-done/ shared directory
- Affects Phase 3, 4, 5, 6, 6.1 deliverables

## Resolution Options

### Option 1: Hotfix (Patch within current structure)
**Approach:**
1. Add frontmatter transformation to agent installation (call `adapter.transformFrontmatter()`)
2. Implement custom tools serializer for Copilot format
3. Recursively process all files in get-shit-done/ directory with variable replacement

**Pros:**
- Minimal code changes
- Fixes issue immediately
- No phase planning needed

**Cons:**
- Doesn't address systemic issue (why wasn't this caught earlier?)
- No tests added for frontmatter transformations
- Risk of missing similar bugs

**Files to change:**
- `bin/lib/installer/orchestrator.js` (add frontmatter transformation)
- Create `bin/lib/rendering/frontmatter-serializer.js` (custom Copilot tools format)
- `bin/lib/installer/orchestrator.js` (recursive variable replacement in get-shit-done/)

**Estimated time:** 1-2 hours

---

### Option 2: New Phase (Comprehensive Fix + Testing)
**Approach:**
1. Create Phase 6.2: "Installation Output Verification"
2. Add integration tests that verify actual installation output
3. Fix all three bugs with proper test coverage
4. Add verification step to check frontmatter format per platform
5. Add verification step to check variable replacement completion

**Pros:**
- Proper test coverage prevents regression
- Catches similar issues in other platforms (Claude, Codex)
- Documents expected output format
- Follows GSD methodology

**Cons:**
- Takes longer (planning + execution + verification)
- Delays bug fix
- Users affected until phase completes

**New phase structure:**
- Plan 1: Integration tests for installation output
- Plan 2: Fix agent frontmatter transformation
- Plan 3: Fix shared directory variable replacement
- Plan 4: Platform-specific output verification

**Estimated time:** 4-6 hours

---

### Option 3: Hybrid (Quick fix + Deferred testing phase)
**Approach:**
1. Immediate hotfix for all 3 bugs (Option 1)
2. Commit as emergency fix
3. Create Phase 6.2 for comprehensive testing (Option 2)
4. Execute Phase 6.2 before Phase 7

**Pros:**
- Fixes user-facing issues immediately
- Still gets proper test coverage
- Validates fix works before moving to Phase 7

**Cons:**
- Two-step process
- Potential rework if tests reveal issues

**Estimated time:** 
- Hotfix: 1-2 hours
- Testing phase: 3-4 hours

## Recommendation

**Option 3 (Hybrid)** is recommended:

**Rationale:**
- Critical bugs affecting production installations
- Users need fix ASAP (hotfix)
- But also need confidence it won't regress (testing phase)
- Allows verification before Phase 7 (Path Security)

**Execution order:**
1. Implement hotfix now (all 3 bugs)
2. Test manually with real installation
3. Commit as emergency fix
4. Create Phase 6.2 for integration tests
5. Execute Phase 6.2 before Phase 7
6. If tests reveal issues, fix immediately

## Technical Details

### Bug #1 Fix: Transform frontmatter
```javascript
// In installAgents() - line 280
const parsed = matter(content);
const transformedData = adapter.transformFrontmatter(parsed.data);
const processed = matter.stringify(parsed.content, transformedData);
await writeFile(destFile, replaceVariables(processed, variables));
```

### Bug #2 Fix: Custom tools serializer
```javascript
// New file: bin/lib/rendering/frontmatter-serializer.js
export function serializeCopilotFrontmatter(data) {
  const lines = ['---'];
  for (const [key, value] of Object.entries(data)) {
    if (key === 'tools' && Array.isArray(value)) {
      // Single-line format: ['tool-a', 'tool-b']
      lines.push(`tools: [${value.map(t => `'${t}'`).join(', ')}]`);
    } else if (typeof value === 'object') {
      lines.push(`${key}:`);
      for (const [k, v] of Object.entries(value)) {
        lines.push(`  ${k}: ${JSON.stringify(v)}`);
      }
    } else {
      lines.push(`${key}: ${JSON.stringify(value)}`);
    }
  }
  lines.push('---');
  return lines.join('\n');
}
```

### Bug #3 Fix: Recursive variable replacement
```javascript
// In installSharedDirectory() - after line 313
async function processAllFilesRecursively(dir, variables) {
  const files = await readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = join(dir, file.name);
    if (file.isDirectory()) {
      await processAllFilesRecursively(fullPath, variables);
    } else {
      await processTemplateFile(fullPath, variables, isVerbose);
    }
  }
}
await processAllFilesRecursively(sharedTargetDir, variables);
```

## Next Steps

User must select which option to execute before proceeding.
