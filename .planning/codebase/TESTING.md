# Testing Patterns

**Analysis Date:** 2026-01-19

## Test Framework

**Runner:**
- None configured in codebase
- No test dependencies in `package.json`
- No test configuration files detected

**Assertion Library:**
- Not applicable - no tests exist

**Run Commands:**
```bash
# No test commands configured
# See TDD plan setup guidance below
```

## Test File Organization

**Location:**
- No existing test files detected
- No established pattern

**Naming:**
- Per TDD reference, supports: `*.test.ts`, `*.spec.ts`
- Can be co-located or in `__tests__/` or `tests/` directories

**Structure:**
```
No tests directory structure exists yet
```

## TDD Philosophy

**Core Principle:**
> Can you write `expect(fn(input)).toBe(output)` before writing `fn`?
> Yes → TDD plan | No → Standard plan

**From `get-shit-done/references/tdd.md`:**

TDD is about design quality, not coverage metrics. The red-green-refactor cycle forces thinking about behavior before implementation.

## Test Structure

**When to use TDD (create dedicated TDD plan):**
- Business logic with defined inputs/outputs
- API endpoints with request/response contracts
- Data transformations, parsing, formatting
- Validation rules and constraints
- Algorithms with testable behavior
- State machines and workflows
- Utility functions with clear specifications

**Skip TDD (use standard plan):**
- UI layout, styling, visual components
- Configuration changes
- Glue code connecting existing components
- One-off scripts and migrations
- Simple CRUD with no business logic
- Exploratory prototyping

**Suite Organization:**
```markdown
One feature per TDD plan. TDD plans produce 2-3 commits:
- RED: Write failing test
- GREEN: Implement to pass
- REFACTOR: Clean up (if needed)
```

## Mocking

**Framework:** Not configured

**Patterns:**
- Test behavior, not implementation
- Test public API, observable behavior
- Avoid mocking internals or private methods

## Test Quality Guidelines

**Good Tests:**
- Test behavior, not implementation: "returns formatted date string"
- One concept per test: Separate tests for valid input, empty input, malformed input
- Descriptive names: "should reject empty email", "returns null for invalid ID"
- No implementation details: Test public API only

**Bad Tests:**
- Testing implementation: "calls formatDate helper with correct params"
- Multiple concepts in one test
- Generic names: "test1", "handles error", "works correctly"
- Testing internal state

## Framework Setup (First TDD Plan)

**When executing first TDD plan, set up testing:**

**1. Detect project type:**
```bash
if [ -f package.json ]; then echo "node"; fi
if [ -f requirements.txt ] || [ -f pyproject.toml ]; then echo "python"; fi
if [ -f go.mod ]; then echo "go"; fi
if [ -f Cargo.toml ]; then echo "rust"; fi
```

**2. Install minimal framework:**

| Project | Framework | Install |
|---------|-----------|---------|
| Node.js | Jest | `npm install -D jest @types/jest ts-jest` |
| Node.js (Vite) | Vitest | `npm install -D vitest` |
| Python | pytest | `pip install pytest` |
| Go | testing | Built-in |
| Rust | cargo test | Built-in |

**3. Create config:**
- Jest: `jest.config.js` with ts-jest preset
- Vitest: `vitest.config.ts` with test globals
- pytest: `pytest.ini` or `pyproject.toml` section

**4. Verify setup:**
```bash
npm test  # Node
pytest    # Python
go test ./...  # Go
cargo test    # Rust
```

## TDD Plan Structure

**Frontmatter:**
```yaml
---
phase: XX-name
plan: NN
type: tdd
---
```

**Sections:**
```markdown
<objective>
[What feature and why]
Purpose: [Design benefit of TDD for this feature]
Output: [Working, tested feature]
</objective>

<feature>
  <name>[Feature name]</name>
  <files>[source file, test file]</files>
  <behavior>
    [Expected behavior in testable terms]
    Cases: input → expected output
  </behavior>
  <implementation>[How to implement once tests pass]</implementation>
</feature>

<verification>
[Test command that proves feature works]
</verification>

<success_criteria>
- Failing test written and committed
- Implementation passes test
- Refactor complete (if needed)
- All 2-3 commits present
</success_criteria>
```

## Red-Green-Refactor Cycle

**RED - Write failing test:**
1. Create test file following project conventions
2. Write test describing expected behavior
3. Run test - it MUST fail
4. If test passes: feature exists or test is wrong
5. Commit: `test({phase}-{plan}): add failing test for [feature]`

**GREEN - Implement to pass:**
1. Write minimal code to make test pass
2. No cleverness, no optimization - just make it work
3. Run test - it MUST pass
4. Commit: `feat({phase}-{plan}): implement [feature]`

**REFACTOR (if needed):**
1. Clean up implementation if obvious improvements exist
2. Run tests - MUST still pass
3. Only commit if changes made: `refactor({phase}-{plan}): clean up [feature]`

## Commit Pattern

**TDD commits follow project standard:**
```bash
# RED phase
test(08-02): add failing test for email validation

- Tests valid email formats accepted
- Tests invalid formats rejected
- Tests empty input handling

# GREEN phase
feat(08-02): implement email validation

- Regex pattern matches RFC 5322
- Returns boolean for validity
- Handles edge cases (empty, null)

# REFACTOR phase (optional)
refactor(08-02): extract regex to constant

- Moved pattern to EMAIL_REGEX constant
- No behavior changes
- Tests still pass
```

**Format:** `{type}({phase}-{plan}): {description}`

**Types:**
- `test` - Test-only (TDD RED)
- `feat` - Feature implementation (TDD GREEN)
- `refactor` - Code cleanup (TDD REFACTOR)
- `fix` - Bug fix
- `perf` - Performance improvement
- `chore` - Dependencies, config, tooling

## Coverage

**Requirements:** No coverage targets enforced

**Philosophy:** 
- TDD is about design quality, not coverage metrics
- Focus on behavioral testing over coverage percentages
- Coverage emerges from TDD discipline

## Context Budget

**TDD plans target ~40% context usage** (lower than standard plans' ~50%)

**Why lower:**
- RED phase: write test, run test, potentially debug why it didn't fail
- GREEN phase: implement, run test, potentially iterate on failures
- REFACTOR phase: modify code, run tests, verify no regressions

Each phase involves reading files, running commands, analyzing output. The back-and-forth is inherently heavier than linear task execution.

## Error Handling

**Test doesn't fail in RED phase:**
- Feature may already exist - investigate
- Test may be wrong (not testing what you think)
- Fix before proceeding

**Test doesn't pass in GREEN phase:**
- Debug implementation
- Don't skip to refactor
- Keep iterating until green

**Tests fail in REFACTOR phase:**
- Undo refactor
- Commit was premature
- Refactor in smaller steps

**Unrelated tests break:**
- Stop and investigate
- May indicate coupling issue
- Fix before proceeding

## Current State

**Test infrastructure:** Not configured

**Test files:** None exist

**Next steps when adding tests:**
1. First TDD plan will install framework (see Framework Setup above)
2. Follow TDD plan structure from `get-shit-done/references/tdd.md`
3. Create dedicated TDD plan per feature (not batched)
4. Follow RED-GREEN-REFACTOR cycle with atomic commits

---

*Testing analysis: 2026-01-19*
