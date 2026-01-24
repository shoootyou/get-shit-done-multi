# Cross-Platform Testing & Validation

This document explains the cross-platform testing suite that validates the template system generates working agents for both Claude and Copilot platforms.

## Overview

The test suite validates the complete pipeline:

```
Agent Spec → Template Engine → Generated Agent → Installation → Invocation
```

**Test Stages:**

1. **Generation** - Validates agents generate correctly for both platforms
2. **Installation** - Validates files land in correct platform directories
3. **Invocation** - Validates agents respond via CLI (smoke tests)

## Prerequisites

**Required:**
- Node.js installed
- Project dependencies installed (`npm install`)

**Optional (for invocation tests):**
- Claude CLI installed (`claude --version` works)
- GitHub Copilot CLI installed (`gh copilot --version` works)
- Agents installed via `node bin/install.js --all`

## Running Tests

### All Tests (Recommended)

```bash
npm test
```

Runs all test suites in sequence:
1. Agent Generation Tests (22 tests - 11 agents × 2 platforms)
2. Agent Installation Tests (5 tests)
3. Agent Invocation Tests (depends on CLI availability)

### Individual Test Suites

**Generation Only:**
```bash
npm run test:generation
```

Validates:
- All 11 agents generate for Claude
- All 11 agents generate for Copilot
- Frontmatter structure compliance
- Platform-specific formatting

**Installation Only:**
```bash
npm run test:installation
```

Validates:
- Files install to correct directories
- Platform-specific formatting (tools string vs array)
- Metadata presence (Copilot only)

**Invocation Only:**
```bash
npm run test:invocation
```

Validates:
- Agents respond via CLI
- Tool execution works
- Platform-specific features

**Note:** Invocation tests require actual CLI installations. Tests skip gracefully if CLIs not available.

## Test Output

### Successful Run

```
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Cross-Platform Testing & Validation Suite              ║
║                                                           ║
║   Validates template → agent → install → invoke           ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝

============================================================
Running: Agent Generation Tests
============================================================

=== Agent Generation Tests ===

Platform: claude

✅ gsd-executor: Generated successfully
✅ gsd-planner: Generated successfully
...

Platform: copilot

✅ gsd-executor: Generated successfully
✅ gsd-planner: Generated successfully
...

============================================================
Total agents tested: 22 (11 agents × 2 platforms)
✅ Passed: 22
❌ Failed: 0
============================================================

============================================================
Running: Agent Installation Tests
============================================================

=== Agent Installation Tests ===

Test 1: Claude local installation

✅ Claude: Agent installed to .claude/agents/

Test 2: Copilot installation

✅ Copilot: Agent installed to .github/copilot/agents/

...

============================================================
✅ Passed: 5
❌ Failed: 0
============================================================

============================================================
Running: Agent Invocation Tests
============================================================

=== Agent Invocation Smoke Tests ===

Claude CLI: ✅ Available
Copilot CLI: ✅ Available

--- Claude CLI Tests ---

Testing: gsd-executor
  ✅ Agent responded (exit 0)
  ✅ Tools used in response
  Duration: 2500ms

...

============================================================
✅ Passed: 6
❌ Failed: 0
⚠️  Skipped: 2
============================================================

============================================================
TEST SUMMARY
============================================================
✅ PASS - Agent Generation Tests (3.45s)
✅ PASS - Agent Installation Tests (1.23s)
✅ PASS - Agent Invocation Tests (8.76s)
============================================================

Total: 3 suites
✅ Passed: 3
❌ Failed: 0
⏱️  Duration: 13.44s

🎉 All cross-platform tests passed!
```

### Failed Test

If tests fail, output shows:

```
❌ FAIL - Agent Generation Tests (2.34s)

⚠️  1 test suite(s) failed
Review output above for details.
```

Exit code: 1 (for CI integration)

## Test Architecture

### Test Framework

Custom Node.js test runner (zero npm dependencies):

- Console-based output (✅/❌ emojis)
- Explicit assertions
- Exit code reporting (0 = pass, 1 = fail)
- Temp file cleanup

### Test Files

```
scripts/
├── test-cross-platform.js         # E2E orchestrator
├── test-agent-generation.js       # Generation validation
├── test-agent-installation.js     # Installation validation
└── test-agent-invocation.js       # Invocation smoke tests
```

### Test Data

- **Generation:** Uses real agent specs from `agents/*.md`
- **Installation:** Uses temp directories (`/tmp/agent-*-test-{timestamp}`)
- **Invocation:** Uses simple prompts ("List files", "What is your role?")

All tests clean up temp files after execution.

## Platform-Specific Validation

### Claude

- Tools formatted as comma-separated string: `tools: read, write, bash`
- No metadata field
- Local installation: `.claude/agents/`
- Global installation: `~/.claude/agents/`

### Copilot

- Tools formatted as array: `tools: [search, execute, edit]`
- Metadata field required
- Installation: `.github/copilot/agents/`

## Troubleshooting

### Generation Tests Fail

**Issue:** "Template rendering failed"

**Solution:**
- Check agent spec frontmatter is valid YAML
- Verify template engine is working: `node -e "require('./bin/lib/template-system/generator')"`

### Installation Tests Fail

**Issue:** "Files not in expected location"

**Solution:**
- Check adapters exist: `ls bin/lib/adapters/`
- Verify adapters export required functions

### Invocation Tests Skip

**Issue:** "No CLIs available"

**Solution:**
- Install Claude CLI: https://docs.anthropic.com/claude-cli
- Install Copilot CLI: `gh extension install github/gh-copilot`
- Verify: `claude --version` and `gh copilot --version`

### Invocation Tests Fail

**Issue:** "Agent not found"

**Solution:**
- Install agents: `node bin/install.js --all`
- Verify installation: `ls .claude/agents/` or `ls .github/copilot/agents/`

**Issue:** "Invocation timeout"

**Solution:**
- Check CLI is responding: `claude agent gsd-executor "hello"`
- Increase timeout in test file (default: 30s)

## CI Integration

Tests are designed for local development (cannot run on GitHub Actions - no CLI access).

For CI integration of generation/installation tests only:

```yaml
- name: Run generation tests
  run: npm run test:generation

- name: Run installation tests
  run: npm run test:installation
```

Invocation tests should be run manually by developers.

## Adding New Tests

### New Agent

No changes needed - generation/installation tests discover agents automatically from `agents/*.md`.

### New Platform

1. Add adapter to `bin/lib/adapters/{platform}.js`
2. Update `scripts/test-agent-generation.js` platforms array
3. Update `scripts/test-agent-installation.js` with platform-specific validation
4. Add invocation method to CLI invoker (if exists)
5. Update `scripts/test-agent-invocation.js` with platform tests

## Maintenance

### Test Coverage

Current coverage:
- **Generation:** 11 agents × 2 platforms = 22 tests
- **Installation:** 5 tests (paths, formatting, metadata)
- **Invocation:** 2 agents × 2 platforms = 4+ tests (depends on CLI availability)

### Test Philosophy

- **Smoke tests, not exhaustive:** Quick validation that things work
- **Focus on integration:** Template → agent → install → invoke
- **Graceful degradation:** Skip tests if dependencies unavailable
- **Fast execution:** All tests complete in < 30 seconds (excluding invocation)

---

*Last updated: Phase 5 (Cross-Platform Testing & Validation)*
