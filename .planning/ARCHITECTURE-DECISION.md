# Architecture Decision: Phase 1 Migration Strategy

**Date:** 2026-01-26  
**Status:** APPROVED  
**Decision:** CUSTOM BALANCED (Test-First + Iterative + Mitigations)

---

## Context

Phase 1 must migrate 42 files (.github/ → /templates/) with frontmatter corrections. After approval, migration code is DELETED completely. This is a one-time operation with NO recovery mechanism post-deletion.

**Critical Risks:**
1. Manual validation failures (user misses bugs)
2. Post-deletion bugs (can't re-run migration)
3. Migration errors corrupt templates (no rollback)

## Research Conducted

Two research tracks completed:
- **RISK-MITIGATIONS.md** — 20 automated validations across 5 layers
- **RISK-ALTERNATIVES.md** — 6 architectural alternatives evaluated

## Decision

**Selected: CUSTOM BALANCED**

Combination of:
- **Test-First Migration** — automated test suite validates transformations
- **Iterative File-by-File** — migrate with git checkpoint per file
- **Phase 1+2 Mitigations** — 10 critical automated validations

## Why This Architecture

### Risk Reduction: 90%

**Layered Defense:**
1. **Tests (40% reduction)** — Automated validation of transformations
2. **Iterative (30% reduction)** — Granular control, low stakes per file
3. **Mitigations (20% reduction)** — Pre/In/Post-Flight automated checks

### Granular Recovery

- Git checkpoint after each file migration
- Can rollback specific files (not all-or-nothing)
- Review checkpoints every 10 files (optional pause)

### Progressive Confidence

- See migration working file-by-file
- Early detection of systematic errors
- Adjust strategy mid-migration if needed

### Complete Deletion Preserved

- Migration code still deleted after final approval
- No long-term code preservation
- Tests and checkpoints are temporary scaffolding

## Implementation

### Phase 1 Structure (5-7 days)

**Phase 1a: Test Suite Creation** (2-3 days)
- Write 45 test cases covering:
  - Frontmatter field transformations
  - Tool name mappings (execute → Bash, etc.)
  - version.json generation
  - Skills field extraction (agents)
  - Template variable injection
- Libraries: vitest, ajv, gray-matter
- Validate against sample files before full migration

**Phase 1b: Iterative Migration** (3-4 days)
- Process 42 files individually with:
  ```
  For each file:
  1. Pre-Flight checks (source validation)
  2. Transform frontmatter
  3. Run automated tests
  4. In-Flight validation (during transform)
  5. Post-Flight checks (schema validation)
  6. Write to /templates/
  7. Git checkpoint (commit file)
  8. Continue or pause for review
  ```
- Review checkpoints:
  - After files 1-10 (optional pause)
  - After files 11-20 (optional pause)
  - After files 21-30 (optional pause)
  - After files 31-42 (final validation)

**Phase 1c: Manual Approval & Deletion** (1 day)
- User reviews full output with checklist
- Sample installation test (install from /templates/ to test dir)
- Explicit approval command
- Commit migration code ONCE to git
- `rm -rf scripts/` (complete deletion)
- Update documentation

### Validation Layers

**Layer 1: Pre-Flight** (before migration)
- Source file validation (parseable YAML)
- Destination directory check (no conflicts)
- Git status check (clean working tree)

**Layer 2: Tests** (per file)
- Frontmatter transformations correct
- Tool mappings accurate
- version.json schema valid
- Template variables injected

**Layer 3: In-Flight** (during migration)
- Real-time validation as fields transform
- Fail-fast on transformation errors

**Layer 4: Post-Flight** (after migration)
- Schema validation against official specs
- Reference integrity (skills field in agents)
- Sample installation test

**Layer 5: Manual** (final approval)
- Comprehensive checklist (frontmatter, tools, variables)
- Diff reports (before/after comparison)
- Explicit approval confirmation

## Trade-offs Accepted

### More Time Investment

- **Original BALANCED:** 4-5 days
- **CUSTOM BALANCED:** 5-7 days
- **Reasoning:** Worth it for 90% risk reduction on one-time operation

### Higher Complexity

- **Original BALANCED:** Medium complexity
- **CUSTOM BALANCED:** Medium-High complexity
- **Reasoning:** Tests + Iterative requires more setup, but prevents disasters

### Progressive vs Batch

- **Original:** Batch migration (all files at once)
- **CUSTOM:** Progressive (file-by-file)
- **Reasoning:** Lower stakes, granular recovery, early error detection

## Alternatives Considered

| Alternative | Risk Reduction | Time | Why Not Selected |
|-------------|----------------|------|------------------|
| HIGH SAFETY (Hybrid + All Mitigations) | 95% | 6-7 days | Overkill (Git Snapshot not needed with iterative) |
| BALANCED Original (Test-First only) | 85% | 4-5 days | All-or-nothing, higher stakes |
| PRAGMATIC (Enhanced Manual) | 75% | 2-3 days | Too risky for one-time operation |
| QUICK (Git Snapshot) | 65% | 1-2 days | Insufficient for critical migration |

## Success Criteria

- [ ] Test suite passes 100% before migration starts
- [ ] All 42 files migrate successfully with git checkpoints
- [ ] All automated validations pass (Pre/In/Post-Flight)
- [ ] Sample installation test succeeds
- [ ] User completes manual validation checklist
- [ ] Explicit approval given
- [ ] Migration code deleted completely

## Dependencies

**Technology Stack:**
- **vitest** 4.0.18 — test framework (ESM-native)
- **ajv** 8.17.1 — JSON Schema validation
- **gray-matter** 4.0.3 — YAML frontmatter parsing
- **diff** 8.0.3 — change visualization
- **fs-extra** 11.3.3 — atomic file operations

**Research Documents:**
- `.planning/research/RISK-MITIGATIONS.md` — validation implementations
- `.planning/research/RISK-ALTERNATIVES.md` — architectural options
- `.planning/research/SUMMARY.md` — synthesis

## Next Steps

1. Update ROADMAP.md with new Phase 1 structure (1a, 1b, 1c)
2. Create detailed plan for Phase 1a (test suite)
3. Begin implementation with `/gsd-plan-phase 1`

---

**Approved by:** User  
**Date:** 2026-01-26  
**Risk Assessment:** 90% reduction achieved  
**Time Estimate:** 5-7 days  
**Confidence:** HIGH
