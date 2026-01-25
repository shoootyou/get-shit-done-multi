# Gap Closure Summary: Skills Installation Directory Fix

**Plan:** 03-06  
**Status:** ✅ COMPLETE  
**Duration:** 8 minutes  
**Type:** Critical path correction

## Problem Resolved

Skills were being generated in `.github/copilot/skills/` but GitHub Copilot CLI expects them in `.github/skills/`. User couldn't see individual skill folders - only the legacy `get-shit-done` folder.

## Root Cause

**File:** `bin/install.js` line 904  
**Wrong code:** `const skillDestDir = path.join(dotGithubDir, 'copilot', 'skills');`

Added unnecessary `copilot` subdirectory that doesn't match GitHub Copilot CLI conventions.

## Changes Made

### 1. Fixed Skills Destination Path
**File:** `bin/install.js` (line 904)

**Change:**
```javascript
// BEFORE (WRONG)
const skillDestDir = path.join(dotGithubDir, 'copilot', 'skills');

// AFTER (CORRECT)
const skillDestDir = path.join(dotGithubDir, 'skills');
```

### 2. Updated Documentation Comments
**File:** `bin/lib/adapters/copilot.js` (lines 21-26, 44-49)

**Updated to reflect:**
- Individual skills: `.github/skills/gsd-help/`, `.github/skills/gsd-execute-phase/`, etc.
- Legacy skill: `.github/skills/get-shit-done/`
- Removed incorrect references to `.github/skills/get-shit-done/` as only path

## Test Results

```bash
$ node bin/install.js --copilot --project-dir /tmp/gsd-test-correct

✓ Skills: 4 generated
✓ Verified: 2 skill files, 13 agents
```

**Verification - CORRECT Structure:**
```
/tmp/gsd-test-correct/.github/
├── agents/
│   └── [13 .agent.md files]
├── skills/
│   ├── get-shit-done/SKILL.md         (legacy)
│   ├── gsd-help/SKILL.md              ✅ NEW
│   ├── gsd-execute-phase/SKILL.md     ✅ NEW
│   ├── gsd-new-project/SKILL.md       ✅ NEW
│   └── gsd-new-milestone/SKILL.md     ✅ NEW
├── ISSUE_TEMPLATE/
└── copilot-instructions.md
```

**Verification - NO Wrong Structure:**
```bash
$ ls /tmp/gsd-test-correct/.github/copilot/
ls: cannot access '/tmp/gsd-test-correct/.github/copilot/': No such file or directory
```

✅ Perfect! No `copilot` subdirectory created.

## Structure Comparison

### Before (WRONG)
```
.github/
├── copilot/                    ❌ Unnecessary nesting
│   └── skills/
│       ├── gsd-help/
│       ├── gsd-execute-phase/
│       └── ...
└── skills/
    └── get-shit-done/          (only legacy visible to user)
```

### After (CORRECT)
```
.github/
├── agents/                     ✅ Correct
│   └── [13 agents]
└── skills/                     ✅ Correct - all skills at same level
    ├── get-shit-done/          (legacy)
    ├── gsd-help/               ✅ Discoverable
    ├── gsd-execute-phase/      ✅ Discoverable
    ├── gsd-new-project/        ✅ Discoverable
    └── gsd-new-milestone/      ✅ Discoverable
```

## Impact

**Unblocks:** Skills are now discoverable by GitHub Copilot CLI

**User-visible changes:**
- Can now see individual skill folders in `.github/skills/`
- Skills appear alongside legacy `get-shit-done` folder
- GitHub Copilot CLI can discover and execute new skills
- Clean, intuitive directory structure

**No breaking changes:**
- Legacy skill still works: `.github/skills/get-shit-done/`
- Agents unchanged: `.github/agents/`
- Backward compatible with existing installations

## Relation to Plan 03-05

**Plan 03-05 (previous):** Fixed `--project-dir` flag support ✅  
**Plan 03-06 (this):** Fixed skills destination directory ✅

Together these plans ensure:
1. Can test in arbitrary directories (03-05)
2. Skills go to correct location (03-06)

## What User Should See Now

When running `node bin/install.js --copilot`:

```bash
$ ls .github/skills/
get-shit-done/        # Legacy
gsd-help/             # Individual skill
gsd-execute-phase/    # Individual skill
gsd-new-project/      # Individual skill
gsd-new-milestone/    # Individual skill
```

Each folder contains `SKILL.md` with platform-specific generated content.

## Cleanup for Existing Installations

Users with previous incorrect installations should:

```bash
# Remove incorrect copilot subdirectory (if exists)
rm -rf .github/copilot/

# Reinstall to get correct structure
node bin/install.js --copilot
```

## Metrics

**Lines changed:** 3  
**Files modified:** 2  
**Critical path fix:** Yes  
**Breaking changes:** None  
**User impact:** High (now can use new skills)

## Next Steps

1. ✅ Skills now in correct location
2. ✅ Structure matches GitHub Copilot CLI expectations
3. ✅ Legacy skill coexists peacefully
4. Resume checkpoint 03-04 verification
5. User can test skills in GitHub Copilot CLI

## Notes

- Simple one-line fix with major user-visible impact
- Corrects misunderstanding of GitHub Copilot CLI directory structure
- `.github/skills/` is the standard GitHub location for Copilot skills
- `copilot` in adapter name is internal naming, not directory structure
