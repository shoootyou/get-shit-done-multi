---
phase: 07
discussed: 2026-01-28T17:35:00Z
areas: [error-messages, validation-strictness, symlink-handling, recovery-rollback]
decisions_count: 16
---

# Phase 7 Context: Path Security and Validation

**Goal:** Prevent malicious or malformed paths from causing security issues during installation

**Discussed:** 2026-01-28

---

## Essential Features

### Path Validation Requirements

- **Pre-validation before any file writes** - Check all paths before beginning installation (atomic approach)
- **Comprehensive error reporting** - Report all validation failures in a single message, not just first error
- **Defense in depth** - Validate paths both before transaction starts AND during transaction execution
- **Cross-platform compatibility** - Handle Windows, macOS, and Linux path conventions

### Security Coverage

Must block:
- **Path traversal:** `../`, `..\/`, and URL-encoded variants (`%2e%2e/`, `%2e%2e%5c`)
- **Absolute paths outside target:** `/etc/passwd`, `C:\Windows\System32\`
- **Windows reserved names:** CON, PRN, AUX, NUL, COM1-9, LPT1-9 (on all platforms)
- **Non-allowlisted paths:** Only write to expected directories (.claude, .github, .codex, get-shit-done)

### User Experience

- **Educational error messages** - Explain what happened without revealing attack details
- **Debug logging** - Create detailed log in `/tmp/gsd-install-debug-{timestamp}.log` for troubleshooting
- **Exit code 1** - Use standard error exit code for cross-platform compatibility
- **Security errors shown even in silent mode** - Never suppress security-related failures

---

## Technical Boundaries

### Validation Strictness Level

- **Basic + URL-encoded detection** - Block `../` and `%2e%2e/` style attacks
- **Allowlist-only approach** - Only permit writes to known safe directories
- **Platform-specific path limits:**
  - Windows: 260 character paths (MAX_PATH compatibility)
  - Unix/macOS: 4096 character paths (PATH_MAX)
  - Component limit: 255 characters per filename (macOS compatibility)

### Symlink Handling Rules

- **Require user confirmation** - Interactive mode prompts for approval
- **Non-interactive mode requires flag** - Must pass `--allow-symlinks` explicitly
- **Single-level resolution only** - Follow immediate symlink, reject chains
- **Broken symlinks:**
  - Interactive: Ask to create target directory
  - Non-interactive: Reject with error

### Integration Points

- **Phase 5 transaction system** - Path validation integrated into InstallTransaction
- **Validation timing:**
  1. Pre-validation: Check all paths before transaction begins
  2. Transaction validation: Re-check during write operations (double-check)
- **Partial installation handling:** Preserve failed installations for debugging, don't auto-cleanup

---

## Scope Limits

### Out of Scope

- **Double encoding attacks** (`....//....//`) - Not handling in Phase 7
- **Auto-repair of invalid paths** - Reject, don't attempt to fix
- **Recursive symlink chains** - Only resolve 1 level, reject deeper chains
- **Custom validation rules** - No user-configurable validation logic
- **Whitelisting user paths** - No mechanism to bypass validation for trusted sources

### Deferred Features

- **Validation bypass mode** - Could add `--unsafe-skip-validation` in future (not Phase 7)
- **Path sanitization** - Could auto-fix some issues rather than reject (future consideration)
- **Checksum verification** - Validate file integrity in addition to paths (different phase)

---

## Open Questions

### Research Topics

1. **URL decoding edge cases**
   - Which URL-encoded patterns are actually used in real attacks?
   - Do Node.js path functions decode automatically in any cases?
   - Test: `decodeURIComponent()` vs manual pattern matching

2. **Symlink resolution performance**
   - How slow is `fs.lstat()` + `fs.readlink()` on large directories?
   - Should we cache symlink resolution results?
   - Benchmark: 1000 files with 10% symlinks

3. **Windows reserved name variants**
   - Do we need to check case-insensitive (CON vs con vs CoN)?
   - What about extensions (CON.txt, CON.md)?
   - Research: Windows reserved name full specification

4. **Transaction rollback scenarios**
   - What happens if validation passes but disk fills during writes?
   - How to distinguish validation failures from other errors in transaction?
   - Test: Disk space exhaustion mid-install

5. **Debug log security**
   - Should debug logs be automatically cleaned up?
   - How much detail is safe to log (full paths vs sanitized)?
   - Consider: GDPR if paths contain user info

---

## Implementation Guidance

### Validation Order

1. **Pre-validation phase:**
   - Decode URL-encoded paths
   - Check for path traversal patterns
   - Verify no absolute paths outside target
   - Check Windows reserved names
   - Validate path length limits
   - Ensure paths in allowlist

2. **Transaction validation:**
   - Re-run same checks during write
   - Resolve symlinks if present
   - Verify target still valid after resolution

### Error Message Format

**User-facing (educational):**
```
✗ Installation failed: Path security violation

The installer detected an unsafe file path.
GSD only writes files within the installation directory.

If you're seeing this unexpectedly, please report an issue.

Debug log: /tmp/gsd-install-debug-20260128-173500.log
```

**Debug log (detailed):**
```
[2026-01-28T17:35:00Z] Path validation failed
Path: skills/../../etc/passwd
Reason: Path traversal detected (..)
Pattern: ../
Installation aborted before any writes
```

### Symlink Confirmation Prompt

**Interactive mode:**
```
⚠ Symlink detected in installation path
  Path: .claude
  Points to: /Users/you/shared/claude-skills
  
? Installation will write files to the symlink target.
  Continue? (y/n)
```

**Non-interactive mode:**
```
✗ Installation failed: Symlink detected
  Path: .claude
  Target: /Users/you/shared/claude-skills
  
Add --allow-symlinks flag to proceed:
  npx get-shit-done --claude --local --allow-symlinks
```

---

## Success Criteria Alignment

From ROADMAP.md Phase 7:

- ✓ **All output paths validated before write operations** - Pre-validation phase handles this
- ✓ **Paths containing `../` rejected with clear error** - Educational error message defined
- ✓ **Absolute paths outside target directory rejected** - Part of validation checks
- ✓ **Symlinks resolved before validation** - 1-level resolution with user confirmation
- ✓ **Validation integrated into transaction system** - Defense-in-depth approach (pre + during)

---

**Next Steps:**
1. Research open questions (URL encoding patterns, symlink performance, etc.)
2. Plan implementation approach based on research findings
3. Create path-validator.js and symlink-resolver.js
4. Write security tests for attack vectors
5. Integrate with InstallTransaction from Phase 5
