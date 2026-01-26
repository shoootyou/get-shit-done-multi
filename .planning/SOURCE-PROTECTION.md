# Source Directory Protection

## CRITICAL CONSTRAINT

The following directories are **READ-ONLY SOURCE REFERENCES** and MUST NEVER be modified or deleted:

- `.claude/` — Claude Code source reference
- `.github/` — GitHub Copilot source reference  
- `.codex/` — Codex CLI source reference

## Why These Are Protected

1. **Historical Reference:** These directories contain the original, working implementation
2. **Migration Source:** Phase 1 migration read from these directories to create `/templates/`
3. **Backup:** If templates have issues, these directories are the authoritative source
4. **Development Use:** The project itself uses GSD skills from `.claude/`

## What Happened

During Phase 2 execution, the `.claude/` directory was accidentally deleted from the working tree. This violated the read-only constraint and was immediately restored via `git checkout HEAD -- .claude/`.

## Protection Mechanisms

### 1. Documentation
- This file serves as explicit warning
- STATE.md documents the "Source files are READ-ONLY" decision
- Executors must respect this constraint

### 2. Git Tracking
- All three directories are tracked in git
- Accidental deletion can be restored via `git checkout HEAD -- <dir>/`

### 3. Test Isolation
- Tests MUST use `/tmp` directories
- Tests MUST use `targetDirOverride` parameter
- Tests MUST NEVER write to project root `.claude/`, `.github/`, `.codex/`

### 4. Installer Behavior
- Default target is `~/.claude/` (user home) or `./.claude/` (cwd)
- Installer never writes to project source directories
- Tests override target to `/tmp/gsd-test-*`

## Recovery Procedure

If source directories are accidentally deleted:

```bash
# Restore from git
git checkout HEAD -- .claude/
git checkout HEAD -- .github/
git checkout HEAD -- .codex/

# Verify restoration
ls -la .claude/ .github/ .codex/
```

## For Executors

**NEVER:**
- Delete `.claude/`, `.github/`, or `.codex/` directories
- Modify files within these directories
- Use these directories as test targets
- Copy over these directories during installation

**ALWAYS:**
- Use `/tmp` for test installations
- Use `targetDirOverride` parameter in tests
- Read from `/templates/` directory (not source directories)
- Preserve these directories in working tree

## Verification

Check that source directories exist and are unchanged:

```bash
# All three should exist
test -d .claude && test -d .github && test -d .codex && echo "✓ All source directories present"

# Git should show no changes
git status --short .claude/ .github/ .codex/
# Expected: no output (clean)
```

---

**Created:** 2026-01-26  
**Reason:** `.claude/` was accidentally deleted during Phase 2 execution  
**Status:** Directories restored, protection documented
