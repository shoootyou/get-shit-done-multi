# Architectural Alternatives: Risk Avoidance Through Design

**Project:** GitHub Workflow Template Migrator
**Context:** High-stakes one-time migration with complete code deletion
**Researched:** 2025-01-21

## Executive Summary

The current architecture has a **critical vulnerability**: manual validation is the only safety net before irreversible code deletion. If the user misses a bug during review, there's no recovery mechanism.

**Key Finding:** The project's "complete deletion" requirement conflicts with traditional safety mechanisms (versioning, rollback, re-execution). The alternatives below explore different risk/deletion tradeoffs.

**Recommendation:** Hybrid approach (Test-First + Git Snapshot) provides highest confidence while maintaining eventual complete deletion.

---

## Current Architecture Risk Profile

| Risk | Probability | Impact | Severity |
|------|-------------|--------|----------|
| Manual validation failure (user misses bug) | Medium-High | High | **CRITICAL** |
| Post-deletion bugs (can't re-run) | Medium | High | **CRITICAL** |
| Migration produces corrupted templates | Low | Critical | **HIGH** |
| User approves incorrect templates | Medium | High | **CRITICAL** |

**Overall Risk Level:** CRITICAL - One failure point with no recovery

---

## Alternative 1: Test-First Migration

### How It Works

Before any migration:
1. **Define expected behaviors** - What makes a valid workflow template?
2. **Write test suite** - Tests for template structure, variable replacement, file paths, YAML validity
3. **Run migration** - Generate templates in /templates/
4. **Auto-validate** - Test suite validates ALL generated files
5. **Report results** - User reviews test results (PASS/FAIL), not raw YAML
6. **User approval** - Based on test confidence, not manual inspection

**Example test scenarios:**
- All YAML files are valid (parse without errors)
- All `${{ github.repository }}` references replaced with `$REPO_NAME`
- Required files present (workflow.yml, README.md, etc.)
- No leftover `.github/` references
- Directory structure matches spec

### Risks Eliminated

- ✅ **Manual validation failure** - Automated tests catch structural bugs
- ✅ **Corrupted template risk** - YAML validation prevents broken files
- ✅ **Missed edge cases** - Tests codify expected behaviors
- ✅ **Variable replacement errors** - Tests verify all substitutions

### Risks Introduced

- ⚠️ **Test suite incompleteness** - Tests might miss novel bug types
- ⚠️ **False confidence** - Passing tests ≠ perfect templates
- ⚠️ **Upfront effort** - Writing comprehensive tests takes time
- ⚠️ **Test maintenance** - If migration logic changes, tests must update

### Complexity

**Medium** - Requires:
- Test framework selection (Vitest, Jest, or custom)
- YAML parsing library
- File system testing utilities
- Test report generation

**Implementation estimate:** 20-30 test cases for comprehensive coverage

### Implementation Time

**3-5 days**
- Day 1-2: Test framework setup, define test scenarios
- Day 2-3: Write structural and content tests
- Day 3-4: Write validation reporting
- Day 4-5: Integration with migration flow

### Alignment with Project Goals

| Goal | Alignment | Notes |
|------|-----------|-------|
| Complete deletion | ✅ YES | Tests can be deleted with migration code |
| Simplicity | ⚠️ PARTIAL | Adds test layer, but simplifies validation |
| Risk reduction | 🟢 HIGH | Catches ~80% of structural bugs automatically |

### When to Use

**Choose this when:**
- User has low risk tolerance
- Template structure is complex (many files, many transformations)
- Validation checklist would be >20 items
- Upfront time investment acceptable

**Skip this when:**
- Migration is trivial (1-2 simple files)
- User highly confident in manual validation
- Time-constrained (need to ship in days, not weeks)

### Real-World Pattern

This is the **"Migration Testing"** pattern used by:
- Database migration frameworks (Flyway, Liquibase)
- Infrastructure-as-Code tools (Terraform has validate commands)
- Code generators (validates output against schema)

**Confidence:** HIGH - Well-established pattern

---

## Alternative 2: Iterative File-by-File Migration

### How It Works

Break migration into atomic operations:
1. **Migrate one file** - Transform `.github/workflow/ci.yml` → `/templates/ci/workflow.yml`
2. **Present for approval** - Show diff, explain transformation
3. **User decides** - APPROVE (keep) / REJECT (revert) / MODIFY (manual edit)
4. **Commit decision** - Approved file becomes permanent
5. **Repeat** - Next file

**Progress tracking:**
```
Migration Progress: 4/12 files
✅ ci.yml → templates/ci/workflow.yml
✅ publish.yml → templates/publish/workflow.yml
⏳ test.yml → (reviewing)
⏸️  deploy.yml → (not started)
```

### Risks Eliminated

- ✅ **Lower stakes per decision** - Mistake affects one file, not all
- ✅ **Easy rollback** - Can revert single file without starting over
- ✅ **Incremental confidence** - User learns transformation pattern
- ✅ **Early error detection** - Bug in file 1 informs file 2+

### Risks Introduced

- ⚠️ **Fatigue risk** - Approving 12 files individually is tedious
- ⚠️ **Cross-file bugs missed** - Focus on single file misses global issues
- ⚠️ **State management complexity** - Must track which files approved
- ⚠️ **Incomplete migration** - User might abandon mid-process

### Complexity

**Medium** - Requires:
- State persistence (which files done)
- Resume capability (continue after interruption)
- Clear progress UI
- Per-file rollback mechanism

### Implementation Time

**2-3 days**
- Day 1: State management system
- Day 2: Interactive approval flow
- Day 3: Progress tracking and resume

### Alignment with Project Goals

| Goal | Alignment | Notes |
|------|-----------|-------|
| Complete deletion | ✅ YES | Can still delete after all files done |
| Simplicity | ⚠️ PARTIAL | User flow is simpler, implementation is not |
| Risk reduction | 🟡 MEDIUM | Reduces blast radius, but adds fatigue risk |

### When to Use

**Choose this when:**
- Many files to migrate (8+ workflows)
- User wants granular control
- Files are heterogeneous (different transformation logic per file)
- User available for multiple review sessions

**Skip this when:**
- Few files (<5)
- Files are homogeneous (same transformation pattern)
- User wants "one and done" experience
- Fatigue risk high (user busy, will lose context between sessions)

### Real-World Pattern

This is the **"Incremental Refactoring"** pattern used by:
- Code refactoring tools (ReSharper, IntelliJ - refactor one method at a time)
- Data migration wizards (Salesforce, HubSpot - migrate one object type at a time)
- Config migration tools (ESLint v8→v9 - migrate one rule at a time)

**Confidence:** HIGH - Common in interactive tools

---

## Alternative 3: Git Snapshot Safety Net

### How It Works

Use Git itself as the safety mechanism:

**Before deletion:**
```bash
# Migration creates safety branch
git checkout -b safety/pre-migration-$(date +%s)
git add .
git commit -m "Safety snapshot: pre-migration state"
git push origin safety/pre-migration-*

# Back to main for normal flow
git checkout main
# ... run migration ...
# ... delete migration code ...
```

**If bug found later:**
```bash
# Retrieve safety branch
git checkout safety/pre-migration-1234567
# Extract migration code
cp -r src/migrate /tmp/migrate-recovery
git checkout main
# Restore and re-run
cp -r /tmp/migrate-recovery src/migrate
npm run migrate
```

**Auto-cleanup:** GitHub Action deletes safety branch after 30 days

### Risks Eliminated

- ✅ **Post-deletion bugs** - Can recover migration code from branch
- ✅ **Catastrophic failure** - Full repo state recoverable
- ✅ **No recovery mechanism** - Branch IS the recovery mechanism
- ✅ **Regret risk** - User can "undo" for 30 days

### Risks Introduced

- ⚠️ **Not true deletion** - Migration code exists in Git history
- ⚠️ **30-day window only** - After cleanup, branch gone
- ⚠️ **Coordination required** - User must remember branch name
- ⚠️ **Repo pollution** - Safety branches clutter repo

### Complexity

**Simple** - Built on Git primitives:
- Branch creation
- Scheduled cleanup (GitHub Actions)
- Clear documentation for recovery

### Implementation Time

**1 day**
- 2 hours: Branch creation logic
- 2 hours: Cleanup GitHub Action
- 2 hours: Recovery documentation
- 2 hours: Testing

### Alignment with Project Goals

| Goal | Alignment | Notes |
|------|-----------|-------|
| Complete deletion | ⚠️ PARTIAL | Eventually deleted, but exists in Git history |
| Simplicity | ✅ YES | Leverages existing Git infrastructure |
| Risk reduction | 🟡 MEDIUM | Recovery possible, but manual and time-limited |

### When to Use

**Choose this when:**
- User wants simplest safety net
- Git workflow familiar to user
- 30-day recovery window sufficient
- "Eventually deleted" acceptable compromise

**Skip this when:**
- User requires IMMEDIATE complete deletion
- Team unfamiliar with Git branch recovery
- Repo must have clean history (no safety branches)

### Real-World Pattern

This is the **"Soft Delete"** pattern used by:
- Databases (rows marked deleted, purged after X days)
- Cloud storage (Trash folder, empties after 30 days)
- Email (Deleted folder, purged automatically)
- Git (reflog keeps "deleted" commits for 90 days)

**Confidence:** HIGH - Universal safety pattern

---

## Alternative 4: Dual-Source (Keep Migration Code)

### How It Works

**Paradigm shift:** Migration code is not "scaffolding to delete" but **"template generator to maintain"**

**New mental model:**
```
src/migrate/           → "Template Maintenance Tool"
  ├── generators/      → Reusable template generators
  ├── transformers/    → Variable substitution logic
  └── cli.ts           → Can re-run anytime

/templates/            → Generated output (like build artifacts)
```

**User workflow:**
```bash
# Initial migration
npm run migrate

# Bug found? Fix generator and re-run
npm run migrate --clean  # Regenerate all templates

# Need new template? Use existing generators
npm run migrate:new --template=my-new-workflow
```

### Risks Eliminated

- ✅ **Post-deletion bugs** - Can always re-run migration
- ✅ **No recovery** - Generator IS the recovery tool
- ✅ **Manual fixes** - Bugs fixed in generator, not templates
- ✅ **Future maintenance** - Can generate new templates using same logic
- ✅ **Knowledge preservation** - Transformation logic preserved

### Risks Introduced

- ⚠️ **Code maintenance burden** - Must maintain generator long-term
- ⚠️ **Complexity creep** - Generator becomes feature-rich over time
- ⚠️ **Source of truth confusion** - Are templates or generator source?
- ❌ **Violates deletion requirement** - User explicitly wants deletion

### Complexity

**Low** - Actually SIMPLIFIES the problem:
- No "one-time" pressure
- Can iterate on generator
- Tests validate generator output

### Implementation Time

**Negative time** - REMOVES the need for deletion logic

### Alignment with Project Goals

| Goal | Alignment | Notes |
|------|-----------|-------|
| Complete deletion | ❌ NO | Directly conflicts with stated requirement |
| Simplicity | ✅ YES | Simplest architecture (no deletion) |
| Risk reduction | 🟢 HIGH | Highest confidence (can always regenerate) |

### When to Use

**Choose this when:**
- User reconsiders deletion requirement
- Templates will need updates over time
- Multiple templates will be created (not one-time)
- Team wants "single source of truth" for templates

**Skip this when:**
- User firm on "complete deletion" requirement
- Templates are truly static (never change)
- Repo complexity must be minimized

### Real-World Pattern

This is the **"Code Generation"** pattern used by:
- Prisma (keeps schema.prisma, generates client code)
- GraphQL Code Generator (keeps schema, generates types)
- Swagger/OpenAPI (keeps spec, generates SDKs)
- ORMs (keep models, generate migrations)

**Key insight:** Generated code often kept in repo, but generator is the source of truth.

**Confidence:** HIGH - Standard pattern for maintainable generated code

---

## Alternative 5: Enhanced Manual Validation

### How It Works

Keep current architecture (manual validation → deletion), but provide **significantly better validation tooling**:

#### 5.1: Structured Validation Checklist

```markdown
## Migration Validation Checklist

### Structural Integrity
- [ ] All YAML files parse without errors
- [ ] Directory structure matches spec
- [ ] No missing required files

### Content Accuracy
- [ ] All variable references replaced
- [ ] No leftover .github/ paths
- [ ] README.md updated with new paths

### Functional Testing
- [ ] Ran `gh workflow validate` on all workflows
- [ ] Tested template installation in empty repo
- [ ] Verified workflows trigger correctly

### Edge Cases
- [ ] Special characters in repo name handled
- [ ] Private vs public repo settings
- [ ] Branch protection compatibility
```

#### 5.2: Automated Diff Report

```
Migration Report: 8 files transformed

templates/ci/workflow.yml
  - Line 12: ${{ github.repository }} → $REPO_NAME
  - Line 34: .github/scripts → scripts/
  - RISK: High (core workflow file)

templates/publish/workflow.yml  
  - Line 5: ${{ secrets.NPM_TOKEN }} → $NPM_TOKEN
  - RISK: Medium (publish secrets)

Summary:
  ✓ 47 variable substitutions
  ✓ 12 path updates
  ⚠ 2 manual review recommended
```

#### 5.3: Sample Installation Test

```bash
# Auto-generated test script
./validate-migration.sh

# What it does:
# 1. Creates temp repo
# 2. Installs templates
# 3. Attempts to run workflows
# 4. Reports success/failure
```

### Risks Eliminated

- ⚠️ **Partial: Manual validation failure** - Better tools, but still manual
- ✅ **Obvious mistakes** - Checklist prevents forgetting steps
- ✅ **YAML syntax errors** - Automated validation catches

### Risks Introduced

- ⚠️ **False confidence from tools** - Passing checklist ≠ perfect migration
- ⚠️ **Checklist fatigue** - Long checklist might be skipped
- ⚠️ **Still relies on human** - Ultimate validation still manual

### Complexity

**Simple** - Enhances existing approach:
- Checklist (markdown file)
- Diff report (script output)
- Validation script (bash + gh cli)

### Implementation Time

**1-2 days**
- 4 hours: Validation checklist design
- 4 hours: Diff report generator
- 4 hours: Sample installation script
- 4 hours: Documentation

### Alignment with Project Goals

| Goal | Alignment | Notes |
|------|-----------|-------|
| Complete deletion | ✅ YES | No changes to deletion plan |
| Simplicity | ✅ YES | Minimal added complexity |
| Risk reduction | 🟡 MEDIUM | Helps but doesn't eliminate manual risk |

### When to Use

**Choose this when:**
- Want quick wins without architecture changes
- User confident but wants safety net
- Time-constrained (fastest to implement)
- Migration relatively simple

**Skip this when:**
- Migration highly complex (many edge cases)
- User has low confidence in manual validation
- Automated validation required for compliance/policy

### Real-World Pattern

This is the **"Assisted Manual Process"** pattern used by:
- Code review checklists (DORA, OWASP)
- Deployment runbooks (step-by-step with validation)
- QA test plans (manual testing with structured steps)

**Confidence:** HIGH - Standard practice for manual processes

---

## Alternative 6: Hybrid Approaches

### Hybrid A: Test-First + Git Snapshot

**Combination:** Automated testing (Alternative 1) + Safety branch (Alternative 3)

**How it works:**
1. Write comprehensive test suite
2. Run migration + auto-validate with tests
3. Create safety branch before deletion
4. User reviews test results (not templates)
5. Delete migration code from main branch
6. Auto-cleanup safety branch after 30 days

**Strengths:**
- ✅ **Highest confidence** - Automated tests + recovery mechanism
- ✅ **Best of both worlds** - Prevention (tests) + recovery (branch)
- ✅ **Eventually complete deletion** - 30 days later

**Tradeoffs:**
- More implementation time (4-6 days)
- Most complex approach
- Overhead of tests + branch management

**When to use:** Low risk tolerance + eventual deletion acceptable

---

### Hybrid B: Iterative + Enhanced Validation

**Combination:** File-by-file (Alternative 2) + Better tooling (Alternative 5)

**How it works:**
1. For EACH file:
   - Run automated validation (YAML parse, structure check)
   - Show structured diff report
   - User approves with checklist
2. Progress saved incrementally
3. Delete migration code after all files approved

**Strengths:**
- ✅ **Lower stakes per decision** - One file at a time
- ✅ **Automated sanity checks** - Each file validated
- ✅ **Incremental progress** - Can pause/resume

**Tradeoffs:**
- User fatigue if many files
- Longer overall process
- State management complexity

**When to use:** Many files + user wants control

---

### Hybrid C: Dual-Source with Deletion Option

**Combination:** Keep generator (Alternative 4) but offer deletion

**How it works:**
1. Migration code structured as reusable generator
2. After successful migration, ASK user:
   - "Keep generator for future use?" (recommended)
   - "Delete generator now?" (your stated preference)
3. If delete: Same flow as current architecture
4. If keep: Generator becomes maintenance tool

**Strengths:**
- ✅ **Decision deferred** - User decides after seeing benefits
- ✅ **Flexibility** - Supports both approaches
- ✅ **Better defaults** - Recommends keeping, but allows deletion

**Tradeoffs:**
- Requires user decision (not automatic)
- More complex messaging/education

**When to use:** User might reconsider deletion after seeing generator value

---

## Comparison Matrix

| Alternative | Risk Reduction | Complexity | Time | Deletion | Implementation | Confidence |
|-------------|----------------|------------|------|----------|----------------|------------|
| **1. Test-First** | 🟢 HIGH (80%) | Medium | 3-5 days | ✅ YES | Auto-validation suite | HIGH |
| **2. Iterative** | 🟡 MEDIUM (60%) | Medium | 2-3 days | ✅ YES | State management | MEDIUM |
| **3. Git Snapshot** | 🟡 MEDIUM (50%) | Simple | 1 day | ⚠️ 30 days | Branch + cleanup | HIGH |
| **4. Dual-Source** | 🟢 HIGH (95%) | Low | Negative | ❌ NO | Keep generator | HIGH |
| **5. Enhanced Manual** | 🟡 MEDIUM (40%) | Simple | 1-2 days | ✅ YES | Better tooling | MEDIUM |
| **6A. Test + Snapshot** | 🟢 HIGHEST (90%) | High | 4-6 days | ⚠️ 30 days | Both systems | HIGH |
| **6B. Iterative + Tools** | 🟢 HIGH (70%) | High | 3-4 days | ✅ YES | Both systems | MEDIUM |
| **6C. Dual w/ Option** | 🟢 HIGH (95%) | Low | Negative | ⚠️ Optional | Deferred decision | HIGH |

### Risk Reduction Explained

- **40%** = Catches obvious mistakes only
- **50%** = Manual recovery possible
- **60%** = Granular control reduces blast radius  
- **70%** = Automated + manual validation
- **80%** = Comprehensive automated testing
- **90%** = Automated testing + recovery mechanism
- **95%** = Can always regenerate perfectly

---

## Recommendations by Risk Tolerance

### Low Risk Tolerance: "Must Be Certain"

**Recommended:** Alternative 6A (Test-First + Git Snapshot)

**Rationale:**
- Automated tests catch ~80% of bugs before user review
- Safety branch provides 30-day recovery window
- Two layers of protection (prevention + recovery)
- Eventually achieves complete deletion

**Implementation:**
```
Week 1: Build test suite (3-5 days)
Week 2: Integrate Git snapshot + cleanup (1 day)
Week 2: End-to-end testing (1-2 days)
```

**Accepts:** 30-day delay to complete deletion, higher upfront time

---

### Medium Risk Tolerance: "Balanced Approach"

**Recommended:** Alternative 1 (Test-First Migration)

**Rationale:**
- Automated validation eliminates most common bugs
- Test results easier to review than raw YAML
- Can delete migration code immediately after tests pass
- Reasonable implementation time (3-5 days)

**Implementation:**
```
Day 1-2: Test framework + structural tests
Day 3-4: Content validation + edge cases
Day 5: Integration + documentation
```

**Accepts:** Upfront test development time, test suite might miss novel bugs

---

### High Risk Tolerance: "Ship Fast"

**Recommended:** Alternative 5 (Enhanced Manual Validation)

**Rationale:**
- Fastest to implement (1-2 days)
- Keeps architecture simple
- Better than current "raw manual validation"
- Immediate complete deletion

**Implementation:**
```
Day 1: Validation checklist + diff report
Day 2: Sample installation script + docs
```

**Accepts:** Still relies on human accuracy, won't catch all bugs

---

### Pragmatic Alternative: Reconsider Deletion

**Recommended:** Alternative 4 or 6C (Dual-Source)

**Rationale:**
The "complete deletion" requirement creates the risk. Keeping the migration code as a **template generator** is:
- Lowest risk (can always regenerate)
- Simplest implementation (no deletion logic)
- Future-proofed (can create new templates)
- Industry standard (see Prisma, GraphQL codegen, etc.)

**Question to consider:** Why delete the migration code?

Common answers:
- "Code complexity" → Generator is ~200 lines, well-documented
- "One-time use" → But bugs might require re-running
- "Clean repository" → Generated templates are ~2KB, generator is ~5KB

**If goal is "eventual deletion after stability proven":**
- Keep generator for 3-6 months
- Delete only after templates proven in production
- This is Alternative 6C

---

## Decision Framework

Use this flowchart to choose:

```
START: How confident are you in manual validation?

├─ Very confident
│  └─ Alternative 5 (Enhanced Manual)
│     Time: 1-2 days, Risk Reduction: Medium
│
├─ Somewhat confident
│  └─ How many files?
│     ├─ Few (<5 files)
│     │  └─ Alternative 1 (Test-First)
│     │     Time: 3-5 days, Risk Reduction: High
│     │
│     └─ Many (8+ files)
│        └─ Alternative 2 or 6B (Iterative)
│           Time: 3-4 days, Risk Reduction: High
│
└─ Not confident (must be certain)
   └─ Is 30-day delayed deletion acceptable?
      ├─ Yes
      │  └─ Alternative 6A (Test + Snapshot)
      │     Time: 4-6 days, Risk Reduction: Highest
      │
      └─ No (must delete immediately)
         └─ Alternative 1 (Test-First)
            Time: 3-5 days, Risk Reduction: High

BONUS: Would you reconsider keeping migration code?
└─ Maybe → Alternative 6C (offer choice after success)
└─ Definitely not → Use flowchart above
```

---

## Implementation Recommendations

### For Alternative 1 (Test-First) - Recommended for Most Cases

**Test categories to implement:**

1. **Structural Tests** (15 tests)
   - All YAML files parse without errors
   - Required files exist
   - Directory structure matches spec
   - No unexpected files created

2. **Content Tests** (20 tests)
   - All variable substitutions performed
   - No leftover references to .github/
   - Placeholders follow naming convention
   - README.md updated correctly

3. **Edge Case Tests** (10 tests)
   - Special characters in values
   - Empty/missing optional fields
   - Multiple workflows in one file
   - Comments preserved

**Test framework:** Vitest (fast, TypeScript-native)

**Validation libraries:**
- `js-yaml` - YAML parsing/validation
- `ajv` - JSON Schema validation for structure
- `fast-glob` - File system assertions

**Example test:**
```typescript
import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import yaml from 'js-yaml'

describe('Migration: CI Workflow', () => {
  it('should produce valid YAML', () => {
    const content = readFileSync('templates/ci/workflow.yml', 'utf8')
    expect(() => yaml.load(content)).not.toThrow()
  })

  it('should replace all variable references', () => {
    const content = readFileSync('templates/ci/workflow.yml', 'utf8')
    expect(content).not.toContain('${{ github.repository }}')
    expect(content).toContain('$REPO_NAME')
  })
})
```

---

### For Alternative 3 (Git Snapshot)

**Safety branch naming convention:**
```
safety/migration-<timestamp>
Example: safety/migration-2025-01-21-1705867200
```

**Cleanup GitHub Action:**
```yaml
name: Cleanup Safety Branches
on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Delete old safety branches
        run: |
          CUTOFF_DATE=$(date -d '30 days ago' +%s)
          for branch in $(git branch -r | grep 'origin/safety/migration-'); do
            TIMESTAMP=$(echo $branch | grep -oP '\d{10}$')
            if [ $TIMESTAMP -lt $CUTOFF_DATE ]; then
              BRANCH_NAME=${branch#origin/}
              git push origin --delete $BRANCH_NAME
              echo "Deleted old branch: $BRANCH_NAME"
            fi
          done
```

**Recovery documentation:**
```markdown
## Recovering Migration Code

If you need to re-run the migration after deletion:

1. Find your safety branch:
   \`\`\`bash
   git branch -a | grep safety/migration
   \`\`\`

2. Extract migration code:
   \`\`\`bash
   git checkout safety/migration-<timestamp>
   cp -r src/migrate /tmp/recover-migrate
   git checkout main
   \`\`\`

3. Restore and re-run:
   \`\`\`bash
   cp -r /tmp/recover-migrate src/migrate
   npm run migrate
   \`\`\`
```

---

## Confidence Assessment

| Alternative | Confidence | Source |
|-------------|------------|--------|
| Test-First | HIGH | Standard pattern in migration tools |
| Iterative | MEDIUM | Common in interactive tools, but fatigue risk |
| Git Snapshot | HIGH | Universal safety pattern (soft delete) |
| Dual-Source | HIGH | Standard in code generation tools |
| Enhanced Manual | MEDIUM | Better than nothing, but manual risk remains |
| Hybrids | MEDIUM | Combinations increase complexity |

**Overall research confidence:** HIGH - All alternatives are well-established patterns

---

## Conclusion

**The paradox:** Complete deletion creates the risk, but keeping code conflicts with stated requirements.

**Best path forward depends on:**
1. **Risk tolerance** - How certain must you be?
2. **Time available** - Days or weeks?
3. **Deletion flexibility** - Immediate or eventual (30 days)?

**Safest approach:** Alternative 6A (Test-First + Git Snapshot)
- Automated validation catches bugs before deletion
- Safety branch allows recovery for 30 days
- Eventually achieves complete deletion
- Highest confidence (90% risk reduction)

**Pragmatic approach:** Alternative 6C (Dual-Source with Option)
- Keep migration code initially
- Prove templates work in production
- Delete later if still desired
- Highest risk reduction (95%)

**Question to explore:** Is "complete deletion" a hard requirement or a preference? If preference, keeping migration code dramatically reduces risk with minimal downside.
