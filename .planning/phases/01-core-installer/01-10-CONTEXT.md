---
phase: 1
phase_name: Template Migration (ONE-TIME)
discussed: 2026-01-26T02:42:00Z
areas: [Test Suite Scope & Organization, Iterative Migration Workflow, Validation Strategy & Checkpoints, Manual Review Process]
decisions_count: 16
architecture: CUSTOM BALANCED (Test-First + Iterative + Mitigations)
---

# Phase 1 Context: Template Migration (ONE-TIME)

**Goal:** Migrate 42 files (.github/ → /templates/) with frontmatter corrections using Test-First + Iterative + Mitigations approach

**Architecture:** CUSTOM BALANCED
- **Phase 1a:** Test Suite Creation (2-3 days)
- **Phase 1b:** Iterative Migration (3-4 days)
- **Phase 1c:** Manual Approval & Deletion (1 day)

This document captures implementation decisions from phase discussion. Use this to guide research and planning.

---

## 1. Test Suite Scope & Organization

### Test Organization Structure

**Confirmed:** Mixed organization (suites by type + tests per file)

```
tests/
├── unit/                                 # Isolated transformation tests
│   ├── frontmatter-transforms.test.js   # tools → allowed-tools, etc.
│   ├── tool-name-mappings.test.js       # execute → Bash, search → Grep
│   ├── version-json-generation.test.js  # Schema validation
│   ├── skills-extraction.test.js        # Agent skills field extraction
│   └── template-variables.test.js       # {{VAR}} injection
└── integration/                          # End-to-end file migration
    ├── skill-migration.test.js          # Complete skill transformation
    └── agent-migration.test.js          # Complete agent transformation
```

**Rationale:**
- Unit tests validate individual transformations (fast, isolated)
- Integration tests validate complete file migration (comprehensive)
- Mixed approach catches both transformation bugs and integration issues

### Test Types

**Confirmed:** Both types (unit + integration)

**Unit tests:**
- Test individual transformation functions
- Mock file I/O
- Fast execution (<100ms per test)
- Cover edge cases and error conditions

**Integration tests:**
- Test complete file transformation pipeline
- Real file I/O (in /tmp directory)
- Slower but comprehensive (1-2s per test)
- Validate final output against schemas

### Passing Criteria

**Confirmed:** Strict - 100% tests passing

- **All unit tests must pass** (no failures, no skips)
- **All integration tests must pass** (no failures, no skips)
- **Zero warnings allowed** in test output
- **No pending/skipped tests** (must be explicitly addressed)

**Rationale:**
- One-time migration with no recovery mechanism
- ANY bug persists forever (migration code deleted)
- 100% passing = high confidence before real migration

### Pre-Migration Validation

**Confirmed:** Sample files (2-3 representative)

**Sample selection:**
- 1 simple skill (minimal frontmatter, few tools)
- 1 complex skill (many tools, custom fields)
- 1 agent (skills field extraction required)

**Validation process:**
1. Create sample files in `/tmp/gsd-samples/`
2. Run full test suite against samples
3. Manually inspect sample output
4. Only proceed if 100% passing

**Blocker:** Cannot start real migration if samples fail

---

## 2. Iterative Migration Workflow

### Migration Order

**Confirmed:** Alphabetical (predictable, simple)

**Execution:**
```
Skills (alphabetical):
  gsd-add-phase
  gsd-add-todo
  gsd-archive-milestone
  ... (26 more)
  gsd-whats-new

Agents (alphabetical):
  gsd-codebase-mapper
  gsd-debugger
  gsd-debugger-specialist
  ... (10 more)
  gsd-verifier
```

**Rationale:**
- Predictable and reproducible
- No subjective ordering decisions
- Easy to resume if interrupted
- Clear progress tracking (file 15 of 42)

### Checkpoint Behavior

**Confirmed:** Semi-automatic (checkpoint + pause for optional review)

**Every 10 files:**
1. Automatic git commit with message:
   ```
   migrate: checkpoint ${N} (files ${start}-${end})
   
   Migrated:
   - file1.md
   - file2.md
   ...
   ```

2. Display checkpoint report:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    CHECKPOINT 1: Files 1-10 Complete
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   ✓ 10 files migrated successfully
   ✓ All validations passed
   ✓ Git checkpoint created
   
   Last 10 files:
   1. gsd-add-phase       ✓ passed
   2. gsd-add-todo        ✓ passed
   ...
   
   Options:
   [c] Continue to next 10
   [r] Review last 10 (show diffs)
   [a] Abort migration
   ```

3. Wait for user input (default: continue after 5s)

**Rationale:**
- Automatic commits = progress preserved
- Optional pause = user can review if desired
- Low friction for normal flow (auto-continue)

### File Failure Handling

**Confirmed:** Skip file + log error (continue with remaining)

**When file fails validation:**
1. Log error with details:
   ```
   ✗ gsd-example-skill failed validation
   
   Error: Tool mapping failed
   - Expected: "Read, Write, Bash"
   - Got: "read, write, execute"
   
   File skipped. Will be logged in final report.
   ```

2. Continue to next file (don't abort)

3. Track failed files for final report

**Final report shows:**
- Total files: 42
- Successful: 39
- Failed: 3 (with details)
- User decides: abort or fix manually later

**Rationale:**
- Don't let one bad file block entire migration
- See full scope of issues before deciding
- Can fix failed files manually after migration

### Rollback Strategy

**Confirmed:** Rollback completo (empezar de nuevo)

**If user detects problem during manual review:**
1. Abort approval
2. Run rollback script:
   ```bash
   npm run migrate:rollback
   ```
3. This will:
   - Delete all `/templates/` output
   - Git reset to pre-migration state
   - Clean up checkpoints
4. Fix migration script
5. Start migration from beginning

**NO partial rollback** (no "undo just this file")

**Rationale:**
- Ensures consistency (all files use same logic)
- Simpler than tracking partial state
- Migration is idempotent (can re-run safely)

---

## 3. Validation Strategy & Checkpoints

### Validation Severity

**Confirmed:** Todo bloqueante (any error = abort)

**All validation layers are blocking:**
- Pre-Flight errors → abort before starting
- In-Flight errors → abort current file, log and skip
- Test failures → abort current file, log and skip
- Post-Flight errors → abort and show report
- Manual review rejection → abort deletion

**No warnings mode** - any validation issue is an error

**Rationale:**
- One-time migration = zero tolerance for errors
- Warnings would need manual triage (defeat automation)
- Better to fix issues and re-run than ship with warnings

### Validation Timing

**Confirmed:** Pre-Flight before | In-Flight per file | Post-Flight at end

**Detailed timing:**

**Pre-Flight (once, before any migration):**
- Source file validation (all 42 files parseable)
- Git status check (clean working tree)
- Destination validation (/templates/ doesn't exist)
- Test suite validation (100% passing on samples)
- Blocker: Cannot proceed if Pre-Flight fails

**In-Flight (per file, during migration):**
- Frontmatter parsing (valid YAML)
- Schema validation (required fields present)
- Transformation validation (correct field conversions)
- Test execution (unit + integration for this file)
- Blocker: Skip file if In-Flight fails, continue to next

**Post-Flight (once, after all migrations):**
- Schema validation (all outputs against official specs)
- Cross-reference validation (skills field references exist)
- Template variable validation (all {{VARS}} replaced)
- Diff generation (before/after comparison)
- Blocker: Cannot approve if Post-Flight fails

**Rationale:**
- Pre-Flight catches environment issues early
- In-Flight catches transformation bugs per file
- Post-Flight catches global consistency issues

### Git Checkpoint Automation

**Confirmed:** Automatic (commit after each checkpoint)

**Checkpoint schedule:**
- Every 10 files (checkpoints 1, 2, 3, 4)
- Automatic git commit (no confirmation)
- Message includes file list

**Checkpoint commits:**
```bash
git add templates/
git commit -m "migrate: checkpoint ${N} (files ${start}-${end})

Migrated:
- gsd-skill-1
- gsd-skill-2
...
"
```

**Final checkpoint:**
After last file (may be <10 files if 42 % 10 != 0):
```bash
git commit -m "migrate: checkpoint final (files 41-42)"
```

**Rationale:**
- No user friction (automatic commits)
- Progress preserved even if process crashes
- Granular git history for debugging

### Validation Report Content

**Confirmed:** Complete (stats + all validations + diffs)

**Report structure:**

```markdown
# Migration Validation Report

Generated: 2026-01-26T03:00:00Z

## Summary Statistics

- Total files: 42
- Successful: 39
- Failed: 3
- Duration: 45 minutes

## Pre-Flight Validation

✓ Source files validated (42/42 parseable)
✓ Git status clean
✓ Destination ready
✓ Test suite ready (45/45 passing)

## Migration Results

### Successful Migrations (39)

1. gsd-add-phase ✓
   - Frontmatter: tools → allowed-tools ✓
   - Tool mappings: 3 converted ✓
   - version.json: created ✓
   - Tests: 12/12 passing ✓

[... 38 more ...]

### Failed Migrations (3)

1. gsd-example-skill ✗
   - Error: Tool mapping failed
   - Expected: "Read, Write, Bash"
   - Got: "read, write, execute"
   - Validation: FAILED at In-Flight
   
[... 2 more ...]

## Post-Flight Validation

✓ Schema validation (39/39 passed)
✓ Cross-references validated
✓ Template variables replaced
✗ Manual review: PENDING

## Diffs

### gsd-add-phase

```diff
- tools: [read, write, execute]
+ allowed-tools: Read, Write, Bash

- skill_version: 1.9.1
- requires_version: 1.9.0+
- platforms: [claude, copilot]
+ # version.json created

[... full diff ...]
```

[... 38 more diffs ...]

## Next Steps

1. Review this report carefully
2. Check sample installation test results
3. Review failed files (if any)
4. Approve or abort migration
```

**Report saved to:** `.planning/phases/01-core-installer/VALIDATION-REPORT.md`

---

## 4. Manual Review Process

### Review Checklist

**Confirmed:** Structured checklist (step by step)

**Mandatory checklist for user:**

```markdown
# Migration Manual Review Checklist

## Phase 1: Report Review
- [ ] Read validation report summary
- [ ] Check all statistics (42 files, X successful, Y failed)
- [ ] Review Pre-Flight results (all green)
- [ ] Review Post-Flight results (all green)

## Phase 2: Sample File Review
Select 3 representative files and verify:
- [ ] File 1 (simple skill): Frontmatter correct, version.json exists
- [ ] File 2 (complex skill): All fields transformed correctly
- [ ] File 3 (agent): Skills field extracted correctly

## Phase 3: Failed Files (if any)
For each failed file:
- [ ] Understand error message
- [ ] Decide: fix manually later or abort migration

## Phase 4: Diff Review
- [ ] Review 3 sample diffs (before/after)
- [ ] Verify tool name mappings correct
- [ ] Verify template variables injected
- [ ] Check version.json content

## Phase 5: Sample Installation Test
- [ ] Run sample installation: `npm run migrate:test-install`
- [ ] Verify templates install correctly to /tmp/test-install/
- [ ] Check installed files match expected structure
- [ ] Test passes without errors

## Phase 6: Approval Decision
- [ ] All checklist items above completed
- [ ] Confident in migration quality
- [ ] Ready to delete migration code
```

**Enforcement:** Script won't proceed to approval without checklist

### Review Presentation

**Confirmed:** Validation report + diffs side-by-side

**Display format (terminal):**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 MIGRATION COMPLETE - REVIEW REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📊 Statistics              | 📝 Validation
──────────────────────────│──────────────────────────
Total: 42 files           │ Pre-Flight:  ✓ PASS
Successful: 39            │ In-Flight:   ✓ PASS
Failed: 3                 │ Post-Flight: ✓ PASS
Duration: 45 min          │ Manual:      ⏸ PENDING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📂 Files to Review:
1. Validation report: .planning/phases/01-core-installer/VALIDATION-REPORT.md
2. Full diffs: .planning/phases/01-core-installer/diffs/
3. Checklist: .planning/phases/01-core-installer/REVIEW-CHECKLIST.md

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📋 Next Steps:
1. cat .planning/phases/01-core-installer/VALIDATION-REPORT.md
2. Complete checklist (open REVIEW-CHECKLIST.md)
3. Run sample installation: npm run migrate:test-install
4. Return here to approve or abort

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Press [Enter] when ready to continue to approval...
```

**Diffs side-by-side example:**
```
────────────────────────────────────────────────────────────────
 gsd-add-phase: BEFORE         │  gsd-add-phase: AFTER
────────────────────────────────────────────────────────────────
tools: [read, write, execute]  │  allowed-tools: Read, Write, Bash
skill_version: 1.9.1           │  # moved to version.json
requires_version: 1.9.0+       │  # moved to version.json
platforms: [claude, copilot]   │  # moved to version.json
────────────────────────────────────────────────────────────────
```

### Approval Mechanism

**Confirmed:** Interactive flag `[y/N]`

**Approval flow:**

1. User completes checklist
2. Script shows summary:
   ```
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    READY FOR APPROVAL
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   ✓ 39 files migrated successfully
   ✗ 3 files failed (see report)
   ✓ Sample installation test passed
   ✓ All validations passed
   
   ⚠️  WARNING: This action will:
   1. Commit migration code to git (one-time)
   2. DELETE migration code completely (rm -rf scripts/)
   3. Migration code will exist ONLY in git history
   
   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   
   Approve migration and delete code? [y/N]:
   ```

3. User types `y` + Enter to approve
4. Any other input (n, N, Enter, Ctrl+C) = abort

**After approval:**
```bash
# Automatic actions:
git add scripts/
git commit -m "feat(phase-1): migration complete

- Migrated 39/42 files successfully
- 3 files failed (manual fix required)
- Generated validation report
- Ready for Phase 1c deletion
"

rm -rf scripts/
git add -A
git commit -m "chore(phase-1): remove migration code

Migration code committed once, now deleted.
Preserved in git history: ${COMMIT_SHA}
"
```

**After deletion:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 PHASE 1 COMPLETE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Migration code committed to git
✓ Migration code deleted from working tree
✓ Templates ready in /templates/

Git reference: ${COMMIT_SHA}

Next: Begin Phase 2 (Core Installer Foundation)
```

### Sample Installation Test

**Confirmed:** Mandatory (blocking)

**Test procedure:**

```bash
npm run migrate:test-install
```

**What it does:**
1. Create isolated test directory: `/tmp/gsd-install-test-${timestamp}/`
2. Copy templates to test directory
3. Run basic installation simulation:
   - Replace template variables
   - Create directory structure
   - Validate output files
4. Check installed structure:
   ```
   /tmp/gsd-install-test-${timestamp}/
   ├── skills/
   │   ├── gsd-add-phase/
   │   │   ├── SKILL.md
   │   │   └── version.json
   │   └── ... (29 skills)
   ├── agents/
   │   ├── gsd-executor.md
   │   └── ... (13 agents)
   └── get-shit-done/
       └── .gsd-install-manifest.json
   ```
5. Validate:
   - All files exist
   - No template variables remaining (no {{...}})
   - version.json files valid JSON
   - Frontmatter parseable

**Success output:**
```
✓ Sample installation test PASSED

Installed to: /tmp/gsd-install-test-1738032120/
- 29 skills installed correctly
- 13 agents installed correctly
- All validations passed

Cleanup: /tmp directory will be cleaned automatically
```

**Failure output:**
```
✗ Sample installation test FAILED

Error: Template variable not replaced
File: skills/gsd-example/SKILL.md
Found: {{PLATFORM_ROOT}} (should be replaced)

Cannot proceed to approval until test passes.
```

**Blocker:** Cannot approve migration if sample installation test fails

---

## Scope Boundaries

### In Scope (Phase 1)

**Phase 1a: Test Suite Creation**
- 45 test cases (unit + integration)
- Sample file validation (2-3 representative)
- Test framework setup (vitest)
- Schema validation setup (ajv)

**Phase 1b: Iterative Migration**
- Alphabetical order processing (42 files)
- File-by-file transformation with validation
- Git checkpoints every 10 files (automatic)
- Skip failed files (continue to next)
- Pre/In/Post-Flight validation layers

**Phase 1c: Manual Approval & Deletion**
- Validation report generation (complete)
- Structured review checklist (mandatory)
- Sample installation test (blocking)
- Interactive approval (y/N)
- Migration code deletion (rm -rf scripts/)

### Out of Scope (Future Phases)

- **Phase 2:** Core installer foundation (npx executable)
- **Phase 3:** Multi-platform support (adapters)
- **Phase 4:** Interactive CLI (prompts)
- **Phase 5:** Atomic transactions (rollback)
- **Phase 6:** Version detection (updates)
- **Phase 7:** Path security (traversal)
- **Phase 8:** Documentation (complete)

### Explicitly Not Included

- Parallel file processing (sequential only)
- Incremental migration (all-or-nothing per run)
- Migration code as generator (deleted after Phase 1)
- Partial rollback (full rollback only)
- Warning tolerance (all errors are blocking)
- Custom file ordering (alphabetical only)
- Automated approval (manual review required)

---

## Open Questions for Research

### Test Framework Selection

- **vitest** vs **jest** for ESM-native testing?
- Consider: ESM support, speed, TypeScript integration
- Recommendation needed from research

### Schema Validation Library

- **ajv** (JSON Schema standard) vs **zod** (TypeScript-first)?
- Consider: Schema complexity, error messages, TypeScript support
- Current decision: zod 4.3.6 (from RISK-MITIGATIONS.md)

### Diff Generation Library

- **diff** package vs **jsdiff** vs native git diff?
- Consider: Formatting, color support, side-by-side display
- Research: best library for terminal diff output

### Sample File Selection Strategy

- Manual selection (user provides 3 files)?
- Automatic selection (algorithm picks representative files)?
- Hybrid (suggest + allow override)?
- Research: criteria for "representative" sample

---

## Technical Constraints

### Phase 1 Architecture

**Confirmed:** CUSTOM BALANCED
- Test-First Migration (automated validation)
- Iterative File-by-File (granular control)
- Phase 1+2 Mitigations (10 critical validations)
- 90% risk reduction
- 5-7 days implementation

### Technology Stack

**From ARCHITECTURE-DECISION.md:**
- **vitest** 4.0.18 — test framework (ESM-native)
- **ajv** 8.17.1 OR **zod** 4.3.6 — schema validation
- **gray-matter** 4.0.3 — YAML frontmatter parsing
- **diff** 8.0.3 — change visualization
- **fs-extra** 11.3.3 — atomic file operations

### File Structure

**Phase 1 only:**
```
scripts/
├── migrate-to-templates.js        # Main migration script
├── lib/
│   ├── readers/                   # Read from .github/
│   ├── parsers/                   # Parse YAML frontmatter
│   ├── transformers/              # Transform fields
│   ├── validators/                # Validate transformations
│   ├── writers/                   # Write to /templates/
│   └── reporters/                 # Generate reports
└── tests/
    ├── unit/                      # Unit tests (5 files)
    └── integration/               # Integration tests (2 files)
```

**After Phase 1c (deleted):**
```
scripts/  # REMOVED COMPLETELY
```

**Preserved only in git history**

### Code Organization

- Modular structure (separate concerns)
- Pure functions for transformations (no side effects)
- I/O at edges only (readers/writers)
- All code in `/scripts/` (temporary location)
- Deleted after approval (no long-term maintenance)

---

## Success Criteria Refinement

### From Roadmap (Phase 1 Original)

1. ✓ All 29 skills migrated to `/templates/skills/`
2. ✓ All 13 agents migrated to `/templates/agents/`
3. ✓ Skill frontmatter corrections applied
4. ✓ Agent frontmatter corrections applied
5. ✓ version.json created per skill (29 files)
6. ✓ versions.json created for agents (1 file)
7. ✓ Template variables injected
8. ✓ Tool names mapped correctly
9. ✓ Shared directory template created
10. ✓ Skills field auto-generated for agents
11. ✓ All templates validate against specs
12. ✓ Migration validates 100% success

### Additional Criteria from Discussion

**Test Suite (Phase 1a):**
13. ✓ 45 test cases written (unit + integration)
14. ✓ Mixed organization (by type + by file)
15. ✓ 100% passing required (strict)
16. ✓ Validated against 2-3 sample files

**Iterative Migration (Phase 1b):**
17. ✓ Alphabetical order processing
18. ✓ Git checkpoints every 10 files (automatic)
19. ✓ Failed files skipped (logged for report)
20. ✓ Pre/In/Post-Flight validation layers

**Manual Review (Phase 1c):**
21. ✓ Structured checklist provided
22. ✓ Validation report generated (complete)
23. ✓ Diffs presented side-by-side
24. ✓ Sample installation test passed (mandatory)
25. ✓ Interactive approval given (y/N)
26. ✓ Migration code committed once
27. ✓ Migration code deleted completely

---

**Context captured:** 2026-01-26  
**Architecture:** CUSTOM BALANCED (Test-First + Iterative + Mitigations)  
**Risk Reduction:** 90%  
**Time Estimate:** 5-7 days  
**Ready for:** Planning phase (`/gsd-plan-phase 1`)
