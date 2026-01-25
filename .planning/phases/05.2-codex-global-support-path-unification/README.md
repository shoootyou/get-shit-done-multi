# Phase 5.2: Codex Global Support & Path Unification

**Status:** Not Started  
**Type:** INSERTED (Feature - built on clean architecture from 5.1)  
**Depends on:** Phase 5.1 (Codebase Architecture Optimization)  
**Timeline:** 1-2 days

## Goal

Implement missing `--codex --global` functionality and unify path resolution logic across all three platforms (Claude, Copilot, Codex) - built on the clean architecture from Phase 5.1.

## Why After Architecture Optimization

This functionality is implemented **AFTER** Phase 5.1 to avoid refactoring new code:

1. Phase 5.1 restructures `bin/` and `lib-ghcc/` completely
2. If we implement Codex global first, then restructure, we refactor code we just wrote
3. Building on clean architecture = cleaner implementation
4. Path unification is easier on organized codebase

## Requirements

### CODEX-GLOBAL-01: Implement Global Codex Support
- `--codex --global` reads/writes configuration from `~/.codex/`
- `--codex` (without `--global`) uses local at `[repo-root]/.codex/`
- Remove warning that Codex global is unsupported

### CODEX-GLOBAL-02: Path Resolution Unification
- Unify path resolution logic to reduce duplication
- All platforms use consistent path resolution pattern
- Single source of truth for path calculation

### PATH-UNIF-01: Test Infrastructure
- All tests execute in `/tmp` directories
- Never touch real `.claude/`, `.copilot/`, `.codex/` directories
- Simulate environments in isolated `/tmp` locations

## Success Criteria

- [ ] `--codex --global` installs to `~/.codex/`
- [ ] `--codex --local` installs to `[repo-root]/.codex/`
- [ ] Path resolution logic unified in single module
- [ ] All platform adapters use unified path resolver
- [ ] Test suite runs in `/tmp` only
- [ ] All existing functionality still works (no regressions)
- [ ] Documentation updated to reflect Codex global support

## Testing Requirements

**CRITICAL:** All tests must run in temporary directories

- Create test directories under `/tmp/gsd-test-*`
- Never use actual project configuration directories
- Mock file system operations to use `/tmp` paths
- Clean up test directories after execution

Test all combinations:
- `--codex` (local)
- `--codex --local` (explicit local)
- `--codex --global` (new functionality)
- Multi-platform: `--claude --codex --global`
- Interactive menu with Codex selected + global scope

## Technical Approach

1. **Update `bin/lib/paths.js`**
   - Add Codex global path: `~/.codex/`
   - Ensure Codex local path: `[repo-root]/.codex/`
   - Unify path resolution function

2. **Update Codex Adapter**
   - Remove global warning
   - Add global path handling
   - Use unified path resolver

3. **Refactor Path Resolution**
   - Extract common logic to shared function
   - All adapters use same path calculation
   - Reduce code duplication

4. **Test Suite in `/tmp`**
   - Create isolated test environments
   - Test all path combinations
   - Validate file operations in temp directories

## Files to Modify

**Note:** File paths may have changed after Phase 5.1 restructuring. Adapt as needed based on new architecture.

- `bin/lib/paths.js` (or new location) - Add Codex global, unify logic
- `bin/lib/adapters/codex-adapter.js` (or new location) - Remove warning, add global
- `bin/lib/flag-parser.js` (or new location) - Remove Codex global warning logic
- `bin/*.test.js` (or new location) - Add tests for Codex global
- `README.md` - Update docs to show Codex global support

## Risks

- **Low risk:** Straightforward implementation
- Path unification might reveal edge cases in existing logic
- Must ensure all existing paths still work correctly

## Next Phase

After completion, proceed to Phase 5.3 (Future Integration Preparation & Validation).
