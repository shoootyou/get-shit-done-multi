# Deprecated Files - Phase 8.1

**Removal Date:** 2026-01-24  
**Phase:** 8.1-04 Script Audit & Asset Updates  
**Total Removed:** 18 files (120 KB)

## Overview

These files were removed during Phase 8.1 script audit after comprehensive analysis. Each file was verified to ensure:
- ❌ NOT used by install.js or core functionality
- ❌ NOT referenced by agents or skills
- ❌ NOT in package.json scripts
- ❌ NOT part of active workflows

## Removed Files

### Root Directory

| File | Purpose | Size | Reason | Last Modified |
|------|---------|------|--------|---------------|
| `test-generate.js` | Generate gsd-list-phase-assumptions skill | 810 B | Temporary testing script from Phase 5.4 - not integrated in any workflow | 2026-01-23 |

### scripts/audit/

| File | Purpose | Size | Reason | Last Modified |
|------|---------|------|--------|---------------|
| `validate-installation.js` | Validate GSD installation on platforms | 4.6 KB | Duplicates functionality of gsd-verify-installation skill | 2026-01-23 |
| `validate-references.sh` | Validate @-references in commands/gsd/*.md | 2.3 KB | Legacy structure validator - commands/gsd/ no longer exists | 2026-01-23 |

### scripts/shared/

| File | Purpose | Size | Reason | Last Modified |
|------|---------|------|--------|---------------|
| `user-prompts.js` | Simple wrapper for prompts library | 491 B | Unused wrapper - other scripts use prompts directly | 2026-01-24 |

### scripts/documentation/

| File | Purpose | Size | Reason | Last Modified |
|------|---------|------|--------|---------------|
| `generate-samples.js` | Generate 13 agents to test-output/ | 2.6 KB | Testing script - install.js generates agents to real directories | 2026-01-23 |
| `generate-skill-outputs.js` | Generate skills from specs for platforms | 7.9 KB | Duplicates install.js generateSkillsFromSpecs() functionality | 2026-01-23 |
| `generate-validation-report.js` | Generate validation reports for Phase 7 | 6.5 KB | Phase 7 one-time task - phase complete | 2026-01-24 |
| `rename-to-lowercase.js` | Rename docs to lowercase with git history | 1.0 KB | Phase 8.1 one-time task - already executed | 2026-01-24 |

### scripts/validation/ (10 files - Phase 7 Testing Suite)

| File | Purpose | Size | Reason | Last Modified |
|------|---------|------|--------|---------------|
| `test-npm-install.js` | Test npm install of GSD package | 5.2 KB | Phase 7 testing complete - not in package.json | 2026-01-24 |
| `analyze-test-results.js` | Analyze test-npm-install results | 9.2 KB | Depends on test-npm-install - Phase 7 complete | 2026-01-24 |
| `create-test-project.js` | Create test project for GSD install | 2.4 KB | Used by test-npm-install - Phase 7 complete | 2026-01-24 |
| `test-platform-commands.js` | Test 29 GSD commands per platform | 3.4 KB | Phase 7 testing standalone script | 2026-01-23 |
| `test-platform-detection.js` | Test platform detection logic | 4.8 KB | Phase 7 testing standalone script | 2026-01-23 |
| `test-platform-install.js` | Test installation on 3 platforms | 4.5 KB | Phase 7 testing standalone script | 2026-01-24 |
| `test-regression.js` | Test regression (legacy vs new commands) | 4.2 KB | Phase 7 testing standalone script | 2026-01-23 |
| `test-cross-cli-state.js` | Test cross-CLI state management | 3.2 KB | Phase 7 testing standalone script | 2026-01-23 |
| `test-state-management.js` | Test state management utilities | 8.0 KB | Phase 7 testing standalone script | 2026-01-23 |
| `test-tool-mapping.js` | Test tool mapping (Claude → platform equivalents) | 7.3 KB | Phase 7 testing standalone script | 2026-01-23 |

## Kept Files (Active/Essential)

The following files were **kept** as they are actively used:

### Active Infrastructure
- ✅ `jest.config.js` - Used by tests in `__tests__/` (6 test files)
- ✅ `scripts/audit/removal-confirmer.js` - This audit tool (Phase 8.1-04 checkpoint)
- ✅ `scripts/audit/script-analyzer.js` - Used by removal-confirmer.js

### Migration Chain (Used by install.js)
- ✅ `scripts/migration/migration-flow.js` - Called by bin/install.js
- ✅ `scripts/migration/detect-old-structure.js` - Used by migration-flow
- ✅ `scripts/migration/backup-handler.js` - Used by migration-flow
- ✅ `scripts/migration/migration-prompts.js` - Used by migration-flow

### Shared Utilities
- ✅ `scripts/shared/git-operations.js` - Used by rename-to-lowercase.js
- ✅ `scripts/shared/progress-display.js` - Used by migration-flow.js

## Recovery Instructions

All removed files can be recovered from git history if needed:

```bash
# Find file in history
git log --all --full-history -- path/to/file

# View file content from specific commit
git show <commit-hash>:path/to/file

# Restore file from specific commit
git checkout <commit-hash> -- path/to/file
```

### Recovery by Category

**Test-generate.js (Phase 5.4 testing):**
```bash
git log --all --full-history -- test-generate.js
git checkout <commit-hash> -- test-generate.js
```

**Validation scripts (Phase 7 testing suite):**
```bash
git log --all --full-history -- scripts/validation/
git checkout <commit-hash> -- scripts/validation/test-npm-install.js
```

**Documentation generators:**
```bash
git log --all --full-history -- scripts/documentation/generate-*.js
```

## Impact Analysis

### Zero Impact on Functionality
- ✅ Install.js unaffected (migration chain preserved)
- ✅ Package.json scripts unaffected (no removed files in scripts)
- ✅ Agents unaffected (no dependencies on removed scripts)
- ✅ Skills unaffected (no dependencies on removed scripts)
- ✅ Core system unaffected (bin/, lib-ghcc/ untouched)

### Preserved Test Infrastructure
- ✅ Jest tests remain functional (jest.config.js kept)
- ✅ Package.json test scripts remain (test:generation, test:installation, etc.)
- ✅ Essential validation scripts kept (test-agent-*.js in package.json)

## Rationale

### Phase 7 Testing Scripts (10 files)
- **Purpose:** One-time testing for Phase 7 (Multi-Platform Testing)
- **Status:** Phase 7 complete (96.6% generation rate, all platforms validated)
- **Decision:** Testing infrastructure for completed phase - safe to remove

### Documentation Generators (4 files)
- **Purpose:** Generate samples/skills/reports during development
- **Status:** Functionality duplicated by install.js or one-time tasks complete
- **Decision:** Redundant or obsolete - install.js is source of truth

### Legacy Validators (2 files)
- **Purpose:** Validate old structure (commands/gsd/, legacy references)
- **Status:** Legacy structure migrated to specs/ format
- **Decision:** Obsolete - validates non-existent structure

### Unused Utilities (2 files)
- **Purpose:** Helper modules (user-prompts wrapper, test-generate)
- **Status:** Not referenced by any active code
- **Decision:** Dead code - safe to remove

---

*Generated during Phase 8.1-04 script audit checkpoint*  
*Audit tool: scripts/audit/removal-confirmer.js with script-analyzer.js*
