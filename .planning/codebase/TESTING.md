# Testing Patterns

**Analysis Date:** 2026-01-19

## Test Framework

**Runner:**
- Not detected
- No test configuration files found (no jest.config.*, vitest.config.*, etc.)

**Assertion Library:**
- Not detected

**Run Commands:**
- No test scripts defined in `package.json`
- Package.json does not include test dependencies

**Status:**
This project does not have automated tests. Testing is manual and relies on:
1. Installation verification in `bin/install.js` via `verifyInstalled()` functions
2. File existence checks after operations
3. Manual testing of Claude Code/Copilot CLI integration

## Test File Organization

**Location:**
- No test files detected (no `*.test.js`, `*.spec.js`, `__tests__/` directories)

**Pattern:**
- Not applicable — no test suite present

## Verification Patterns

**Installation Verification:**
```javascript
function verifyInstalled(dirPath, description) {
  if (!fs.existsSync(dirPath)) {
    console.error(`Failed to install ${description}: directory not created`);
    return false;
  }
  try {
    const entries = fs.readdirSync(dirPath);
    if (entries.length === 0) {
      console.error(`Failed to install ${description}: directory is empty`);
      return false;
    }
  } catch (e) {
    console.error(`Failed to install ${description}: ${e.message}`);
    return false;
  }
  return true;
}
```

**File Verification:**
```javascript
function verifyFileInstalled(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`Failed to install ${description}: file not created`);
    return false;
  }
  return true;
}
```

**Location:**
- `bin/install.js` lines 251-278

## Testing Strategy

**Manual Testing:**
The project uses human verification checkpoints defined in markdown:

```xml
<task type="checkpoint:human-verify" gate="blocking">
  <what-built>Description of what was built</what-built>
  <how-to-verify>
    1. Step-by-step verification instructions
    2. Expected behavior
    3. URLs or commands to test
  </how-to-verify>
  <resume-signal>How to continue after verification</resume-signal>
</task>
```

**Reference:** `get-shit-done/references/checkpoints.md`

**Integration Testing:**
- Tests run in actual Claude Code/GitHub Copilot CLI environment
- Users verify commands work: `/gsd:help`, `/gsd:new-project`, etc.
- Installation verification built into installer script

## Verification Commands

**Bash Verification Patterns:**

Used throughout command/workflow files to verify prerequisites:

```bash
# Check file existence
[ -f .planning/PROJECT.md ] && echo "exists"

# Count files
ls .planning/todos/pending/*.md 2>/dev/null | wc -l

# Verify git repo
[ -d .git ] || [ -f .git ]

# Detect code files
find . -name "*.ts" -o -name "*.js" | grep -v node_modules

# Verify command success
curl -X POST localhost:3000/api/auth/login | grep "200"
```

**Examples:**
- `commands/gsd/new-project.md` — Brownfield detection
- `commands/gsd/check-todos.md` — TODO counting
- `agents/gsd-verifier.md` — Goal-backward verification

## Mock Data & Fixtures

**Not applicable** — No test suite present

**Pattern:**
Templates in `get-shit-done/templates/` serve as fixtures for document generation:
- `project.md` — PROJECT.md template
- `roadmap.md` — ROADMAP.md template
- `phase-prompt.md` — PLAN.md template
- `verification-report.md` — VERIFICATION.md template

## Coverage

**Requirements:** None enforced

**Status:** No coverage tooling

**Alternative Quality Measures:**
1. GSD Verifier Agent (`agents/gsd-verifier.md`) — Goal-backward verification
2. Plan Checker Agent (`agents/gsd-plan-checker.md`) — Plan quality analysis
3. Integration Checker Agent (`agents/gsd-integration-checker.md`) — Cross-phase verification

## Test Types

**Unit Tests:**
- Not present

**Integration Tests:**
- Manual integration testing via Claude Code/Copilot CLI
- Installation script verification functions act as integration tests

**E2E Tests:**
- Manual E2E flows documented in workflows
- Human verification checkpoints in plans

## Quality Assurance Approach

**Document-Driven Verification:**

The system uses markdown documents with embedded verification logic:

**Example from `agents/gsd-verifier.md`:**
```bash
# Check for incomplete implementations
grep -E "(TODO|FIXME|XXX|HACK|PLACEHOLDER)" "$file"

# Check for empty stubs
grep -c -E "TODO|FIXME|placeholder|not implemented|coming soon" "$path"

# Find console.log debugging
grep -rn "console\.log" src/ --include="*.ts"
```

**Goal-Backward Verification:**
1. Read phase goal from ROADMAP.md
2. Analyze actual implementation
3. Verify implementation achieves goal
4. Generate VERIFICATION.md report

**Pattern:**
- Each phase ends with `/gsd:verify-work` command
- Spawns `gsd-verifier` agent with fresh context
- Agent reads goal, inspects code, produces verification report
- Documents gaps between promise and delivery

## Common Verification Patterns

**File Structure Verification:**
```bash
# Verify required files exist
required_files=("src/index.ts" "package.json" "README.md")
for file in "${required_files[@]}"; do
  [ -f "$file" ] || echo "Missing: $file"
done
```

**API Testing:**
```bash
# Test endpoint
curl -X POST http://localhost:3000/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}' \
  | grep "200"
```

**Build Verification:**
```bash
# Build and check success
npm run build && [ -d dist ] && echo "Build successful"
```

**Deployment Verification:**
```bash
# Verify deployment
vercel ls | grep "production"
curl https://deployed-url.com | grep "expected-content"
```

## TDD Reference

**Location:** `get-shit-done/references/tdd.md`

**Pattern:**
When `/gsd:plan-phase` detects testing-related phases, it includes TDD reference:

**TDD Workflow:**
1. RED: Write failing test (commit: `test(phase-plan): description`)
2. GREEN: Minimal implementation to pass (commit: `feat(phase-plan): description`)
3. REFACTOR: Improve code (commit: `refactor(phase-plan): description`)

**Used for phases with keywords:**
- "test", "testing", "TDD", "spec", "coverage"

## Installation Testing

**Self-Verification:**

`bin/install.js` includes built-in verification:

```javascript
// Track installation failures
let failed = false;

// Verify commands
failed = !verifyInstalled(commandsDir, 'commands/gsd') || failed;

// Verify get-shit-done directory
failed = !verifyInstalled(gsdDir, 'get-shit-done') || failed;

// Verify agents
failed = !verifyInstalled(agentsDir, 'agents') || failed;

// If critical components failed, exit with error
if (failed) {
  console.error('Installation failed');
  process.exit(1);
}
```

**Success Output:**
```
  ✓ Installed commands/gsd
  ✓ Installed get-shit-done
  ✓ Installed agents
  ✓ Installed CHANGELOG.md
```

## Recommendations for Adding Tests

**If automated tests are added, follow these conventions:**

**File Naming:**
- Co-locate tests: `install.test.js` next to `install.js`
- Or separate: `tests/install.test.js`

**Test Structure:**
```javascript
describe('install', () => {
  describe('verifyInstalled', () => {
    it('returns false when directory does not exist', () => {
      // Test implementation
    });
    
    it('returns false when directory is empty', () => {
      // Test implementation
    });
    
    it('returns true when directory has files', () => {
      // Test implementation
    });
  });
});
```

**Mocking:**
```javascript
// Mock fs module
jest.mock('fs');
const fs = require('fs');

// Mock file existence
fs.existsSync.mockReturnValue(true);
```

**Framework Suggestion:**
- Jest — Most common for Node.js projects
- Vitest — Modern, fast alternative
- Node's native test runner (`node:test`) — No dependencies

---

*Testing analysis: 2026-01-19*
