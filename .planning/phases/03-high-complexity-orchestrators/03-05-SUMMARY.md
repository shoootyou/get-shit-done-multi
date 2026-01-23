# Gap Closure Summary: --project-dir Flag Support

**Plan:** 03-05  
**Status:** ✅ COMPLETE  
**Duration:** 12 minutes  
**Type:** Critical blocking fix

## Problem Resolved

User attempted to test installation in /tmp directory but skills were being installed to workspace. Root cause: install.js hardcoded `process.cwd()` without respecting `--project-dir` CLI flag.

## Changes Made

### 1. Added --project-dir Argument Parsing
**File:** `bin/install.js` (lines ~70-89)  
**Change:** Added `parseProjectDirArg()` function similar to existing `parseConfigDirArg()` pattern

Supports both formats:
- `--project-dir /tmp/test`
- `--project-dir=/tmp/test`

### 2. Updated getConfigPaths to Accept projectDir
**File:** `bin/lib/paths.js` (line 15)  
**Change:** Added optional `projectDir` parameter, defaults to `process.cwd()`

```javascript
function getConfigPaths(cli, projectDir = null) {
  const cwd = projectDir || process.cwd();
  // ...
}
```

### 3. Updated Copilot Adapter getTargetDirs
**File:** `bin/lib/adapters/copilot.js` (line 31)  
**Change:** Added optional `projectDir` parameter, passes through to `getConfigPaths()`

```javascript
function getTargetDirs(isGlobal, projectDir = null) {
  const { global, local } = getConfigPaths('copilot', projectDir);
  // ...
}
```

### 4. Updated installCopilot Function
**File:** `bin/install.js` (line 821)  
**Change:** Added `projectDir` parameter with default, removed hardcoded `process.cwd()`

```javascript
function installCopilot(projectDir = process.cwd()) {
  // ...
  const dirs = copilotAdapter.getTargetDirs(false, projectDir);
  const githubDir = path.join(projectDir, '.github');
  // ...
}
```

### 5. Updated All installCopilot() Call Sites
**Files:** `bin/install.js` (lines 1227, 1417, 1462)  
**Change:** Pass `explicitProjectDir || process.cwd()` to all calls

```javascript
installCopilot(explicitProjectDir || process.cwd());
```

### 6. Updated Help Text
**File:** `bin/install.js` (line ~104)  
**Change:** Added documentation for `--project-dir` flag

## Test Results

```bash
$ node bin/install.js --copilot --project-dir /tmp/gsd-test-install
  ✓ Skills: 4 generated
  ✓ Installed copilot-instructions.md
  ✓ Installed GitHub issue templates
  ✓ Verified: 2 skill files, 13 agents
```

**Verification:**
- ✅ Skills installed to `/tmp/gsd-test-install/.github/copilot/skills/`
  - gsd-help/SKILL.md
  - gsd-execute-phase/SKILL.md
  - gsd-new-project/SKILL.md
  - gsd-new-milestone/SKILL.md
- ✅ Agents installed to `/tmp/gsd-test-install/.github/agents/` (13 agents)
- ✅ Legacy skill installed to `/tmp/gsd-test-install/.github/skills/get-shit-done/`
- ✅ Issue templates installed to `/tmp/gsd-test-install/.github/ISSUE_TEMPLATE/`
- ✅ Workspace files NOT modified (timestamp verification passed)

**File structure:**
```
/tmp/gsd-test-install/
└── .github/
    ├── copilot/
    │   └── skills/
    │       ├── gsd-help/SKILL.md
    │       ├── gsd-execute-phase/SKILL.md
    │       ├── gsd-new-milestone/SKILL.md
    │       └── gsd-new-project/SKILL.md
    ├── agents/
    │   └── [13 .agent.md files]
    ├── skills/
    │   └── get-shit-done/SKILL.md (legacy)
    ├── ISSUE_TEMPLATE/
    └── copilot-instructions.md
```

## Impact

**Unblocks:** Checkpoint 03-04 can now be completed with proper testing in temporary directories

**Benefits:**
- Can test installations without polluting main repository
- Matches user expectation: "Las pruebas deben ir bajo la carpeta test-output"
- Enables CI/CD testing in isolated directories
- Backward compatible (works without flag)

## Remaining Issues (Non-Blocking)

These warnings appeared but don't block functionality:

1. **Unknown tools:** AskUserQuestion, todowrite not in compatibility matrix
2. **Unknown fields:** 4 fields in orchestrators not in FIELD_RULES
3. **Write tool:** Claude-specific, warning about cross-platform compatibility

These should be addressed but don't prevent checkpoint completion.

## Metrics

**Lines changed:** ~30  
**Files modified:** 3  
**Functions updated:** 4  
**Test locations:** 3 call sites  
**Backward compatible:** Yes  
**Breaking changes:** None

## Next Steps

1. Resume checkpoint 03-04 verification with proper temporary directory testing
2. Address non-blocking warnings in follow-up (Issues #2-4)
3. Consider similar fix for installCodex() function

## Notes

- Pattern matches existing --config-dir implementation
- Maintains principle: specs/ are source of truth, .github/ are generated outputs
- User guidance validated: Testing in /tmp is now the correct approach
