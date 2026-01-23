# Phase 3 Critical Issues

**Discovered:** 2026-01-22 21:57 UTC  
**Status:** BLOCKING checkpoint completion  
**Context:** User attempted to test installation in /tmp, revealed multiple issues

## Issue 1: --project-dir Flag Not Implemented ✅ FIXED (Plan 03-05)

**Severity:** BLOCKING  
**Status:** ✅ RESOLVED  
**Impact:** Cannot test installations in temporary directories

**Solution:** Added --project-dir argument parsing and parameter passing through installCopilot().

---

## Issue 1b: Skills Installation Directory Wrong ✅ FIXED (Plan 03-06)

**Severity:** CRITICAL  
**Status:** ✅ RESOLVED  
**Impact:** Skills generated in wrong directory, not discoverable by GitHub Copilot CLI

**Symptoms:**
```bash
# User reports: Only sees .github/skills/get-shit-done/, no individual skills
# Root cause: Skills generated in .github/copilot/skills/ (wrong)
# Expected: Skills in .github/skills/ (correct)
```

**Solution:** Changed skillDestDir from `.github/copilot/skills/` to `.github/skills/`

**Result:**
```
.github/skills/
├── get-shit-done/         (legacy)
├── gsd-help/              ✅ Discoverable
├── gsd-execute-phase/     ✅ Discoverable
├── gsd-new-project/       ✅ Discoverable
└── gsd-new-milestone/     ✅ Discoverable
```

---

## Issue 2: Unknown Tools in Compatibility Matrix

**Severity:** WARNING (non-blocking but needs resolution)  
**Impact:** Tools may not work correctly on Copilot platform

**Symptoms:**
```
⚠ gsd-execute-phase: Unknown tool: "todowrite" is not in the compatibility matrix
⚠ gsd-execute-phase: Unknown tool: "askuserquestion" is not in the compatibility matrix
⚠ gsd-new-milestone: Unknown tool: "AskUserQuestion" is not in the compatibility matrix
⚠ gsd-new-project: Unknown tool: "AskUserQuestion" is not in the compatibility matrix
```

**Tools missing:**
- `todowrite` / `TodoWrite` - Used in gsd-execute-phase
- `askuserquestion` / `AskUserQuestion` - Used in all 3 orchestrators

**Analysis needed:**
1. Are these tools actually used in the command bodies?
2. Do they exist in Claude but not Copilot?
3. Should they be mapped to Copilot equivalents or removed?
4. Check if case-sensitivity is causing issues (todowrite vs TodoWrite)

**Affected specs:**
- `specs/skills/gsd-execute-phase/SKILL.md`
- `specs/skills/gsd-new-project/SKILL.md`
- `specs/skills/gsd-new-milestone/SKILL.md`

---

## Issue 3: Write Tool Platform Compatibility

**Severity:** WARNING  
**Impact:** Command may not work on Copilot if Write tool is required

**Symptoms:**
```
⚠ gsd-execute-phase: write: Write is Claude-specific. Use Edit for cross-platform compatibility.
⚠ gsd-new-milestone: write: Write is Claude-specific. Use Edit for cross-platform compatibility.
⚠ gsd-new-project: write: Write is Claude-specific. Use Edit for cross-platform compatibility.
```

**Analysis needed:**
1. Check if specs actually use Write tool in their tools declarations
2. Determine if Write is essential for orchestrator functionality
3. Decide: Replace with Edit (cross-platform) or keep Write (Claude-only feature)

**Recommendation:**
- If specs don't declare Write in tools, this may be a false positive
- If they do declare Write, consider whether Edit is sufficient
- Document platform-specific tool strategy in specs/skills/README.md

---

## Issue 4: Unknown Fields in Frontmatter

**Severity:** WARNING  
**Impact:** Some frontmatter fields may be ignored or cause issues

**Symptoms:**
```
⚠ gsd-execute-phase: Unknown field - not in FIELD_RULES
⚠ gsd-new-milestone: Unknown field - not in FIELD_RULES (4 occurrences)
⚠ gsd-new-project: Unknown field - not in FIELD_RULES (4 occurrences)
```

**Analysis needed:**
1. Which fields are causing warnings? (warning doesn't specify field name)
2. Are these fields from legacy commands or newly added?
3. Should they be added to FIELD_RULES or removed from specs?

**Investigation:**
- Check field-transformer.js FIELD_RULES (line ~25-33)
- Compare against spec frontmatter in specs/skills/gsd-*/SKILL.md
- Likely candidates: metadata, hooks, color, model, etc.

---

## Impact on Checkpoint 03-04

**Cannot proceed with checkpoint verification because:**
1. ❌ Cannot test installation in clean temporary directory (Issue #1)
2. ⚠️ Tools may not work correctly when testing commands (Issue #2)
3. ⚠️ Unknown if generated skills have correct structure (Issues #3, #4)

**Blocking:** Issue #1 must be fixed before checkpoint can be completed  
**Non-blocking:** Issues #2-4 are warnings that should be investigated but don't prevent testing

---

## Recommended Action

**Immediate (blocking):**
1. Implement --project-dir flag support in install.js
2. Test installation to /tmp/gsd-test-install
3. Verify skills are created in correct location with correct structure

**Follow-up (non-blocking):**
4. Investigate tool compatibility warnings
5. Investigate unknown field warnings
6. Document platform-specific tool strategy
7. Consider creating gap closure plan if issues are significant

---

## Notes

- User expectation: "Las pruebas deben ir bajo la carpeta test-output con la carpeta correspondiente"
- User expectation: "La actualización de las rutas actuales de .claude/.codex/.copilot NO ESTA PERMITIDA"
- User is correct: specs/ are the source of truth, .github/copilot/skills/ are generated outputs
- Testing in /tmp is the correct approach to validate generation without polluting repo
