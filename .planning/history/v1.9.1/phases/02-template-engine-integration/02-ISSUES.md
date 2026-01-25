# Phase 2 Issues Found During Execution

**Date:** 2026-01-22
**Status:** BLOCKING - Execution paused at Wave 3
**Severity:** CRITICAL

## Issues Discovered

### Issue 1: Incorrect Skill Output Structure

**Problem:** generateSkillsFromSpecs() generates flat files instead of folder structure

**Current behavior:**
```
.claude/
└── gsd-help.md          ❌ Wrong - flat file
```

**Expected behavior (per Claude docs):**
```
.claude/skills/
└── gsd-help/
    └── SKILL.md         ✅ Correct - folder per skill
```

**Reference:** https://code.claude.com/docs/en/slash-commands#automatic-discovery-from-nested-directories

**Impact:**
- Generated skills won't be discovered by Claude/Copilot/Codex
- Breaks compatibility with official spec
- Cannot support future expansion (templates, examples, scripts)

**Root cause:**
- Plan 02-01 implementation used `${name}.md` pattern
- Should be `${name}/SKILL.md` pattern

---

### Issue 2: Testing in Protected Directories

**Problem:** Execution tested by modifying `.claude/`, `.codex/`, `.github/copilot/` directly

**Why this is wrong:**
- These directories are for PRODUCTION use only
- Testing should NEVER modify them during development
- Pollutes git working directory with test artifacts

**Expected behavior:**
- All testing in `test-output/{platform}/skills/` directory
- Use temporary directory for install.js testing
- Protected directories remain untouched during development

**Impact:**
- Risk of committing test artifacts to production paths
- Difficult to distinguish test vs production state
- Violates clean testing practices

---

### Issue 3: Missing Codex Platform Support

**Problem:** Template system didn't support Codex platform

**Status:** ✅ FIXED in commit 20fa968
- Added Codex to field-transformer.js
- Added Codex to tool-mapper.js  
- Added Codex to validators.js

This fix is correct and should be kept.

---

## Required Corrections

### 1. Update Implementation (Plan 02-01)

**File:** `bin/install.js::generateSkillsFromSpecs()`

Change from:
```javascript
const outputPath = path.join(outputDir, `${spec.name}.md`);
```

To:
```javascript
const outputPath = path.join(outputDir, spec.name, 'SKILL.md');
```

Ensure directory is created:
```javascript
const skillDir = path.join(outputDir, spec.name);
await fs.mkdir(skillDir, { recursive: true });
```

### 2. Update Testing Strategy (Plan 02-04)

**Current approach:**
- Runs `node bin/install.js --local`
- Generates into `.claude/`, `.codex/`, `.github/copilot/`

**New approach:**
- Create temp directory: `test-output/temp-install/`
- Mock output paths to write to `test-output/{platform}/skills/`
- OR: Create dedicated test script that doesn't use install.js
- Verify structure: `test-output/claude/skills/gsd-help/SKILL.md`

### 3. Update Plans

**Plans requiring updates:**
- [x] 02-01-PLAN.md - Specify folder/SKILL.md structure explicitly
- [x] 02-04-PLAN.md - Change testing to use test-output/

**Plans that are correct:**
- [x] 02-02-PLAN.md - Frontmatter inheritance (unaffected)
- [x] 02-03-PLAN.md - Platform integration (paths OK, just output structure wrong)

---

## Recovery Strategy

### Option A: Fix and Resume (Recommended)

1. **Update plan 02-01:**
   - Add explicit folder/SKILL.md structure requirement
   - Update must_haves to verify folder structure

2. **Fix implementation:**
   - Modify generateSkillsFromSpecs() to create folder/SKILL.md
   - Keep all other code (platform integration, Codex support)

3. **Update plan 02-04:**
   - Change from install.js testing to test-output approach
   - Use script similar to scripts/generate-skill-outputs.js
   - Verify in test-output/{platform}/skills/gsd-help/SKILL.md

4. **Create gap closure plan:**
   - Plan 02-05: Fix skill output structure + test in test-output
   - Mark as gap_closure: true
   - Execute with `/gsd:execute-phase 2 --gaps-only`

### Option B: Revert and Re-plan

1. Revert commits 2998f9b through 20fa968
2. Re-run `/gsd:plan-phase 2` with corrected requirements
3. Execute fresh plans

---

## Recommendation

**Use Option A (Fix and Resume)**

Reasons:
- Most code is correct (frontmatter inheritance, platform integration, Codex support)
- Only 2 issues: output structure + testing approach
- Faster than full revert
- Preserves working Codex platform support

Next command: Create plan 02-05 as gap closure plan
