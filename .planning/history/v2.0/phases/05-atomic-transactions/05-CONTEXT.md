# Phase 5: Pre-Installation Validation & Manifest Generation

**Created:** 2026-01-27  
**Status:** Context gathered via discussion  
**Method:** Interactive Q&A (ask_user tool)

---

## Phase Scope Change

**CRITICAL DECISION:** No rollback implementation in Phase 5.

**Original Goal:** Installation fails mid-process → all completed operations rollback, leaving no partial state

**Revised Goal:** Pre-installation validation + manifest generation (no rollback on failure)

**Rationale:**
- Simpler implementation
- Faster installation (no tracking overhead)
- Users can manually cleanup partial installs if needed
- Focus on preventing failures rather than recovering from them

**Trade-offs Accepted:**
- ❌ Users may have partial installations on failure
- ❌ Manual cleanup required on failure
- ❌ Doesn't address Critical Risk #1 from planning (partial installations)
- ✅ Simpler codebase
- ✅ Faster execution
- ✅ Less complexity to test and maintain

---

## Decision Log

### 1. Rollback Granularity & Ordering

**Decision 1.1: No Rollback**
- **Choice:** Skip rollback entirely
- **Implication:** Installation stops on error, partial files remain
- **User impact:** Must manually cleanup and re-run

**Decision 1.2: Error Handling**
- **Choice:** Stop and report progress when failure occurs
- **Message format:** "Stopping... Partial install in ~/.claude/"

---

### 2. Pre-Installation Validation Scope

**Decision 2.1: Disk Space Check**
- **Choice:** Check exact size + 10% buffer
- **Rationale:** Safe buffer without being overly conservative
- **Implementation:** Calculate template size, require 1.1× available

**Decision 2.2: Permission Checks**
- **Choice:** Test actual write to target directory
- **Method:** Create temporary test file, write, delete
- **Location:** Target directory (e.g., `~/.claude/.gsd-test-write`)
- **Rationale:** Most accurate, catches edge cases (ACLs, SELinux, read-only mounts)

**Decision 2.3: Existing File Handling**
- **Choice:** Always overwrite GSD files, preserve non-GSD files
- **Logic:**
  - Overwrite: `gsd-*` skills, `gsd-*.agent.md` agents, `get-shit-done/` directory
  - Preserve: User's custom skills/agents in same directories
  - No prompts or warnings
- **Rationale:** Clean upgrade path, but respects user customizations

**Decision 2.4: Validation Error Messages**
- **Choice:** Both technical details + actionable guidance
- **Format:**
  ```
  ✗ Validation failed: Not enough disk space
  
  Details:
  - Required: 2.5 MB (including 10% buffer)
  - Available: 1.2 MB
  - Location: ~/.claude/
  
  Fix: Free up at least 1.3 MB and try again
  ```
- **Rationale:** Power users get details, all users get clear action items

---

### 3. Manifest Content & Timing

**Decision 3.1: Manifest Write Timing**
- **Choice:** Write at end (after successful installation only)
- **Location:** `{target}/.gsd-install-manifest.json`
  - Global: `~/.claude/.gsd-install-manifest.json`
  - Local: `./.claude/.gsd-install-manifest.json`
- **Rationale:** Clean state - only successful installs have manifests
- **Note:** Failed installs leave no manifest (consistent with no rollback)

**Decision 3.2: Manifest Content - Checksums**
- **Choice:** No checksums
- **Include:**
  - `gsd_version` (e.g., "2.0.0")
  - `platform` (e.g., "claude")
  - `scope` (e.g., "global")
  - `installed_at` (ISO 8601 timestamp)
  - `files` (array of relative paths)
- **Exclude:**
  - File checksums (SHA256 hashes)
  - File sizes
  - Individual timestamps
- **Rationale:** Simpler manifest, faster generation, smaller file

**Decision 3.3: Manifest Schema Versioning**
- **Choice:** No schema version field in v2.0
- **Manifest structure:**
  ```json
  {
    "gsd_version": "2.0.0",
    "platform": "claude",
    "scope": "global",
    "installed_at": "2026-01-27T02:00:00.000Z",
    "files": [
      "skills/gsd-help/SKILL.md",
      "skills/gsd-help/version.json",
      "agents/gsd-planner.agent.md",
      ".gsd-install-manifest.json"
    ]
  }
  ```
- **Rationale:** Keep it simple for v2.0, can add schema_version in v2.1+ if needed

---

### 4. Error Recovery User Experience

**Decision 4.1: Installation Failure Messaging**
- **Choice:** Show progress message on stop
- **Format:** "Stopping... Partial install in ~/.claude/"
- **Additional info:** Display which phase failed (Skills, Agents, Shared)
- **Rationale:** User knows installation is incomplete and where partial files are

**Decision 4.2: Error Logging**
- **Choice:** Save to target directory
- **Log file:** `{target}/.gsd-error.log`
  - Global: `~/.claude/.gsd-error.log`
  - Local: `./.claude/.gsd-error.log`
- **Content:**
  - Timestamp
  - Error message
  - Stack trace
  - Installation context (platform, scope, phase)
- **Cleanup:** Overwrite on next install (no accumulation)
- **Rationale:** Easy to find, doesn't pollute home directory, persists for debugging

**Decision 4.3: Retry Strategy**
- **Choice:** Suggest manual cleanup + re-run
- **Guidance message:**
  ```
  Installation failed. Partial files remain in ~/.claude/
  
  To retry:
  1. Remove partial installation:
     rm -rf ~/.claude/skills/gsd-*
     rm -rf ~/.claude/agents/gsd-*
     rm -rf ~/.claude/.gsd-install-manifest.json
  
  2. Re-run installer:
     npx get-shit-done-multi --claude --global
  ```
- **No automatic retry:** User must re-invoke installer
- **No --force flag:** Keep CLI simple, manual cleanup is explicit
- **Rationale:** User has full control, clear steps, no hidden behavior

**Decision 4.4: Runtime Error Message Format**
- **Choice:** User-friendly only (no technical details on terminal)
- **Terminal output:**
  ```
  ✗ Installation failed: Permission denied
  
  The installer couldn't write to ~/.claude/skills/
  
  Fix: Check directory permissions
  Try: chmod +w ~/.claude/skills
  
  Details saved to: ~/.claude/.gsd-error.log
  ```
- **Technical details:** Only in `.gsd-error.log` file
- **Contrast:** Validation errors show both (decision 2.4), runtime errors show friendly only
- **Rationale:** Terminal stays clean, technical users can check log file

---

## Validation Checks Summary

### Pre-Installation Checks (Run Before Any Writes)

1. **Disk Space Check**
   - Calculate total template size
   - Check available space in target directory
   - Require: template_size × 1.1 (10% buffer)
   - Fail early if insufficient

2. **Permission Check**
   - Test write to target directory
   - Create: `{target}/.gsd-test-write-{timestamp}`
   - Write: "test"
   - Delete: cleanup test file
   - Fail early if cannot write

3. **Existing Installation Detection**
   - Check for `{target}/.gsd-install-manifest.json`
   - If exists: Read version, show warning
   - Continue anyway (overwrite GSD files)

4. **Path Validation**
   - Validate target paths (no traversal)
   - Check target directory is valid for platform
   - Confirm scope (global/local) matches path

### Runtime Checks (During Installation)

1. **Template Existence**
   - Verify all templates exist before copying
   - Fail early if templates directory is corrupt

2. **File Write Success**
   - Check each file write operation
   - Stop installation on first failure
   - Log error to `.gsd-error.log`
   - Show user-friendly message

---

## Implementation Notes

### File Structure

```
bin/lib/
├── validation/
│   ├── pre-install-checks.js    ← NEW
│   │   - checkDiskSpace()
│   │   - checkWritePermissions()
│   │   - detectExistingInstall()
│   │   - validatePaths()
│   │
│   └── manifest-generator.js     ← NEW
│       - generateManifest()
│       - writeManifest()
│       - collectInstalledFiles()
```

### Integration Points

1. **orchestrator.js**
   - Add pre-installation validation step
   - Add manifest generation after successful install
   - Add error logging on failure

2. **installation-core.js**
   - Call validation before install loop
   - Handle validation failures gracefully
   - Show appropriate error messages

3. **file-operations.js**
   - Add error logging to write operations
   - Ensure errors bubble up cleanly

---

## Success Criteria (Revised)

### Must-Haves

1. ✅ Pre-installation disk space check (exact + 10% buffer)
2. ✅ Pre-installation permission check (test write)
3. ✅ Existing installation detection (read manifest)
4. ✅ Path validation (no traversal)
5. ✅ Manifest generation after successful install
6. ✅ Manifest includes: version, platform, scope, timestamp, file list
7. ✅ Error logging to `.gsd-error.log` in target directory
8. ✅ User-friendly error messages on terminal
9. ✅ Actionable guidance on validation failures
10. ✅ Clear retry instructions on installation failure

### Out of Scope

- ❌ Rollback mechanism (removed from Phase 5)
- ❌ File checksums in manifest
- ❌ Schema versioning in manifest
- ❌ Automatic retry on failure
- ❌ --force flag for overwriting
- ❌ Progress tracking during installation stop
- ❌ Partial manifest for incomplete installs

---

## Questions Resolved

All implementation gray areas discussed and resolved via ask_user tool:

1. **Rollback Granularity & Ordering** → No rollback
2. **Pre-Installation Validation Scope** → Disk space (10% buffer), test write, overwrite GSD files only, both technical + friendly messages
3. **Manifest Content & Timing** → Write at end, no checksums, no schema version
4. **Error Recovery User Experience** → Show progress on stop, log to target directory, suggest manual cleanup, user-friendly messages only

---

## Risk Assessment

### New Risks Introduced

1. **Partial Installations**
   - **Risk:** Users left with incomplete installs
   - **Severity:** Medium
   - **Mitigation:** Clear error messages with cleanup instructions
   - **Accepted:** Yes (scope decision trade-off)

2. **Manual Cleanup Burden**
   - **Risk:** Users must manually remove partial files
   - **Severity:** Low
   - **Mitigation:** Provide exact cleanup commands in error message
   - **Accepted:** Yes (simpler than rollback)

### Risks Mitigated

1. **Installation Failures**
   - **Mitigation:** Pre-installation validation catches most issues
   - **Impact:** Reduced by ~80% (disk space, permissions caught early)

2. **Confusing Error Messages**
   - **Mitigation:** User-friendly messages + actionable guidance
   - **Impact:** Better UX than generic errors

3. **Lost Error Context**
   - **Mitigation:** Error logging to `.gsd-error.log`
   - **Impact:** Technical details preserved for debugging

---

## Next Steps

1. Review this context document
2. Create Phase 5 plan (1-3 plans depending on complexity)
3. Implement validation checks
4. Implement manifest generation
5. Test error scenarios
6. Update documentation

---

**Context Complete:** Ready for planning
