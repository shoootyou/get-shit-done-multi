# Contributing Guide

Welcome! This guide explains how to contribute to the multi-platform agent template system.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Adding a New Agent](#adding-a-new-agent)
3. [Modifying Existing Agents](#modifying-existing-agents)
4. [Platform Conditionals](#platform-conditionals)
5. [Testing Workflow](#testing-workflow)
6. [Code Style](#code-style)
7. [Pull Request Guidelines](#pull-request-guidelines)

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Git
- (Optional) Claude CLI for testing Claude agents
- (Optional) GitHub Copilot CLI (`gh copilot`) for testing Copilot agents

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd <repository-name>
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Run tests to verify setup:**
   ```bash
   npm test
   ```

   This runs the complete test suite:
   - Generation tests (22 tests - 11 agents × 2 platforms)
   - Installation tests (5 tests)
   - Invocation tests (if CLIs installed)

### Test Commands

```bash
npm test                    # All tests (recommended)
npm run test:generation     # Generation tests only
npm run test:installation   # Installation tests only
npm run test:invocation     # Invocation tests (requires CLIs)
```

**Test Structure:**
- **Generation** - Validates agents generate correctly for both platforms
- **Installation** - Validates files land in correct directories with correct format
- **Invocation** - Validates agents respond via actual CLI execution (smoke tests)

## Adding a New Agent

Follow these steps to add a new agent to the system:

### Step 1: Create Agent Spec

Create a new file in `specs/agents/` directory:

```bash
# Example: Creating a new code reviewer agent
touch specs/agents/gsd-code-reviewer.md
```

### Step 2: Define Agent Frontmatter

Use YAML frontmatter with platform conditionals:

```yaml
---
name: gsd-code-reviewer
description: "Reviews code changes and provides feedback"

{{#isClaude}}
tools: [Bash, Read, Grep, Glob]
{{/isClaude}}
{{#isCopilot}}
tools: [execute, read, search]
{{/isCopilot}}

model: claude-sonnet-4.5
---
```

**Key Fields:**
- `name` - Agent identifier (lowercase-with-hyphens)
- `description` - Short description of agent purpose
- `tools` - Platform-specific tool lists (use conditionals)
- `model` - Default model (optional)

**Tool Reference:**
- Claude: `Bash`, `Read`, `Edit`, `Grep`, `Glob`, `Task`
- Copilot: `execute`, `read`, `edit`, `search`, `agent`

**Note:** Grep and Glob both map to `search` in Copilot (automatically deduplicated)

### Step 3: Write Agent Content

Add agent instructions in markdown after the frontmatter:

```markdown
---
# (frontmatter above)
---

<role>
You are a GSD code reviewer. You analyze code changes and provide constructive feedback.
</role>

<review_process>

## Step 1: Read Changes

{{#isClaude}}
Use the Bash tool to run git commands:
{{/isClaude}}
{{#isCopilot}}
Use the execute tool to run git commands:
{{/isCopilot}}

```bash
git diff --staged
```

## Step 2: Analyze Code

Look for:
- Bug risks
- Security issues
- Performance concerns
- Style inconsistencies

</review_process>
```

**Use platform conditionals** for tool references in prose (see [Platform Conditionals](#platform-conditionals))

### Step 4: Test Generation

Generate agents for both platforms:

```bash
npm run test:generation
```

This validates:
- YAML frontmatter syntax
- Platform-specific transformations
- Tool mapping correctness
- Format compliance

**Expected output:**
```
✓ gsd-code-reviewer (Claude)
✓ gsd-code-reviewer (Copilot)
```

### Step 5: Test Installation

Validate installation workflow:

```bash
npm run test:installation
```

This verifies:
- Files generated in correct directories
- YAML format valid
- Markdown body present
- Size within limits (Copilot ≤30K)

### Step 6: Manual Validation

Install and test with actual CLI:

**For Claude:**
```bash
node bin/install.js --local
claude --agent gsd-code-reviewer "Review my last commit"
```

**For Copilot:**
```bash
node bin/install.js --copilot
gh copilot agent gsd-code-reviewer "Review my last commit"
```

### Example: Walk Through gsd-verifier.md

The `gsd-verifier.md` agent is a good reference template:

```yaml
---
name: gsd-verifier
description: "Verifies phase goal achievement through goal-backward analysis"

{{#isClaude}}
tools: [Read, Bash, Grep, Glob]
{{/isClaude}}
{{#isCopilot}}
tools: [read, bash, grep, glob]
{{/isCopilot}}
---

<role>
You are a GSD phase verifier...
</role>
```

**Key features:**
- Platform conditionals for tool lists
- Clear role definition
- Structured process steps
- Tool references match platform

## Modifying Existing Agents

To modify an existing agent:

### Step 1: Edit Spec

Edit the spec file in `specs/agents/`:

```bash
# Example: Updating gsd-verifier
vim specs/agents/gsd-verifier.md
```

### Step 2: Regenerate

Test that changes generate correctly:

```bash
npm run test:generation
```

Or regenerate via install:

```bash
node bin/install.js --all
```

### Step 3: Validate

Run full test suite to catch any issues:

```bash
npm test
```

**What tests catch:**
- YAML syntax errors
- Invalid tool names
- Missing required fields
- Size limit violations (Copilot)
- Format inconsistencies

### Step 4: Test Manually

Test the updated agent via CLI:

```bash
# Claude
claude --agent <agent-name> "test prompt"

# Copilot
gh copilot agent <agent-name> "test prompt"
```

## Platform Conditionals

Use Mustache conditionals to handle platform-specific content:

### Block Conditionals (Multi-line)

Use for sections that differ between platforms:

```yaml
---
{{#isClaude}}
tools: [Bash, Read, Edit]
{{/isClaude}}
{{#isCopilot}}
tools: [execute, read, edit]
{{/isCopilot}}
---
```

### Inline Conditionals (Single Reference)

Use for tool references in prose:

```markdown
Run {{#isClaude}}Bash{{/isClaude}}{{#isCopilot}}execute{{/isCopilot}} commands:

```bash
git status
```
```

### Variable Substitution

Use variables for consistency:

```yaml
---
tools: {{toolBash}}, {{toolRead}}, {{toolEdit}}
---
```

Variables available:
- `{{toolBash}}` - `Bash` (Claude) or `execute` (Copilot)
- `{{toolRead}}` - `Read` (Claude) or `read` (Copilot)
- `{{toolEdit}}` - `Edit` (Claude) or `edit` (Copilot)
- `{{toolGrep}}` - `Grep` (Claude) or `search` (Copilot)
- `{{toolGlob}}` - `Glob` (Claude) or `search` (Copilot)
- `{{toolTask}}` - `Task` (Claude) or `agent` (Copilot)

**Note:** `{{toolGrep}}` and `{{toolGlob}}` both become `search` in Copilot (deduplicated automatically)

### Platform Flags

Available conditional flags:
- `{{#isClaude}}...{{/isClaude}}` - Renders only for Claude
- `{{#isCopilot}}...{{/isCopilot}}` - Renders only for Copilot

### Example from Actual Spec

From `gsd-executor.md`:

```markdown
<bash>
{{#isClaude}}
bash is your primary tool for running commands.
{{/isClaude}}
{{#isCopilot}}
execute is your primary tool for running commands.
{{/isCopilot}}

Pay attention to following when using it:
* Give long-running commands adequate time...
</bash>
```

**Result for Claude:**
```markdown
<bash>
bash is your primary tool for running commands.
Pay attention to following when using it:
...
</bash>
```

**Result for Copilot:**
```markdown
<bash>
execute is your primary tool for running commands.
Pay attention to following when using it:
...
</bash>
```

## Testing Workflow

### Unit Tests

Test individual modules:

```bash
# Test tool mapper
node bin/lib/template-system/tool-mapper.test.js

# Test field transformer
node bin/lib/template-system/field-transformer.test.js

# Test validators
node bin/lib/template-system/validators.test.js
```

### Integration Tests

Test full generation pipeline:

```bash
npm run test:generation
```

**What it tests:**
- All 13 agents generate for Claude
- All 13 agents generate for Copilot
- Platform-specific transformations applied
- Output format valid

**Output:**
```
Running agent generation tests...
✓ gsd-verifier (Claude)
✓ gsd-verifier (Copilot)
✓ gsd-planner (Claude)
✓ gsd-planner (Copilot)
...
22/22 tests passed
```

### Installation Tests

Validate file placement and format:

```bash
npm run test:installation
```

**What it tests:**
- Files generated in correct directories
- YAML frontmatter valid
- Markdown body present
- Platform-specific formats correct
- Size within limits

### Invocation Tests (Requires CLIs)

Test actual CLI execution:

```bash
npm run test:invocation
```

**Prerequisites:**
- Claude CLI installed (`claude --version` works)
- GitHub Copilot CLI installed (`gh copilot --version` works)
- Agents installed (`node bin/install.js --all`)

**What it tests:**
- Agents respond to test prompts
- Tools execute correctly
- Platform detection works
- Agent registration successful

**Graceful degradation:** Tests skip with exit 0 if CLIs not installed (not failures)

### E2E Orchestration

Run complete pipeline:

```bash
npm test
```

**Pipeline:**
1. **Generation** → Validate all agents generate
2. **Installation** → Validate files placed correctly
3. **Invocation** → Validate CLI execution (if CLIs available)

**Exit behavior:** Stops on first failure for fast feedback

### Custom Test Framework

Tests use a custom framework following existing project patterns:

**Pattern:**
- Console output for results
- Exit codes (0 = success, 1 = failure)
- No external dependencies
- Simple child_process spawning

**Example test structure:**
```javascript
// Test runner spawns tests
const result = spawnSync('node', ['test-file.js'], {
  cwd: projectRoot,
  stdio: 'inherit'
});

if (result.status !== 0) {
  console.error('❌ Tests failed');
  process.exit(1);
}
```

## Code Style

### Module Format

Use CommonJS modules (not ES6 modules):

```javascript
// ✅ Correct
const { generateAgent } = require('./lib-ghcc/templates');

module.exports = { myFunction };

// ❌ Wrong
import { generateAgent } from './lib-ghcc/templates';

export { myFunction };
```

### No Build Step

Write Node.js native code (no transpilation):

- Use features supported by Node.js v14+
- No TypeScript (project uses plain JavaScript)
- No Babel, Webpack, or other build tools

### Follow Existing Patterns

Match existing code style:

```javascript
// Function naming
function validateAgent(spec) { ... }

// Error handling
if (!spec.name) {
  return { success: false, errors: ['Missing name'] };
}

// Result objects
return {
  success: true,
  output: generatedContent,
  errors: [],
  warnings: []
};
```

### Dependencies

**Existing approved dependencies:**
- `gray-matter` - Frontmatter parsing
- `js-yaml` - YAML serialization
- `mustache` - Template rendering

**Before adding new dependencies:**
- Check if functionality exists in existing deps
- Consider maintenance burden
- Prefer standard library when possible

### File Naming

- Use kebab-case: `tool-mapper.js` (not `toolMapper.js`)
- Test files: `tool-mapper.test.js` (not `tool-mapper.spec.js`)
- Agent specs: `gsd-agent-name.md` (not `GsdAgentName.md`)

### Comments

Add helpful comments for complex logic:

```javascript
// Build REVERSE_INDEX in two passes:
// Pass 1: Add non-canonical names (aliases, lowercase)
// Pass 2: Add canonical names (overrides conflicts like Edit vs Write)
```

## Pull Request Guidelines

### Before Submitting

1. **Run full test suite:**
   ```bash
   npm test
   ```

2. **Verify no warnings during installation:**
   ```bash
   node bin/install.js --all
   # Should see: "✓ Installation complete" with no warnings
   ```

3. **Test manually with CLIs:**
   ```bash
   # Test new/modified agents
   claude --agent <agent-name> "test prompt"
   gh copilot agent <agent-name> "test prompt"
   ```

4. **Update documentation if needed:**
   - architecture.md for design changes
   - contributing.md for workflow changes
   - README.md for user-facing changes

### Commit Message Format

Use conventional commits:

```bash
# Format: type(scope): description
git commit -m "feat(agents): add code reviewer agent"
git commit -m "fix(tool-mapper): handle case-insensitive lookup"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(generation): add size limit validation"
```

**Types:**
- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `test` - Test additions/changes
- `refactor` - Code refactoring
- `perf` - Performance improvement
- `chore` - Tooling, dependencies

### Atomic Commits

Make commits focused and reviewable:

```bash
# ✅ Good - each commit does one thing
git commit -m "feat(agents): add gsd-code-reviewer spec"
git commit -m "test(generation): add tests for code-reviewer"
git commit -m "docs(contributing): document code review agent"

# ❌ Bad - too many unrelated changes
git commit -m "add code reviewer, fix bug, update docs"
```

### Pull Request Description

Include in PR description:

1. **What changed** - Brief summary
2. **Why** - Reason for the change
3. **Testing** - How you verified it works
4. **Screenshots** - If UI/output changes

**Example:**
```markdown
## What Changed
Added gsd-code-reviewer agent for automated code review

## Why
Users requested automated code review capability (#123)

## Testing
- ✅ Generation tests pass (both platforms)
- ✅ Installation tests pass
- ✅ Manually tested with Claude CLI
- ✅ Manually tested with Copilot CLI

## Related Issue
Closes #123
```

### Reference Issues

Link to related issues:

```markdown
Fixes #123
Closes #456
Related to #789
```

### Review Checklist

Before requesting review:

- [ ] Tests pass (`npm test`)
- [ ] No installation warnings
- [ ] Code follows existing style
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] PR description complete

## Getting Help

### Documentation Resources

- [architecture.md](architecture.md) - Technical design and implementation
- [testing-cross-platform.md](docs/testing-cross-platform.md) - Test suite details
- [AGENT-SPLIT-PATTERN.md](docs/AGENT-SPLIT-PATTERN.md) - Size optimization pattern
- [README.md](README.md) - Project overview and quick start

### Debug Mode

Enable debug logging:

```bash
DEBUG=gsd:* node bin/install.js --all
```

### Common Questions

**Q: Why are my tool names wrong in generated agents?**

A: Tool names must match platform. Use conditionals:
```yaml
{{#isClaude}}
tools: [Bash, Read]
{{/isClaude}}
{{#isCopilot}}
tools: [execute, read]
{{/isCopilot}}
```

**Q: Agent exceeds 30K limit for Copilot?**

A: See [AGENT-SPLIT-PATTERN.md](docs/AGENT-SPLIT-PATTERN.md) for coordinator/specialist splitting pattern.

**Q: Generation tests fail with YAML syntax error?**

A: Check frontmatter YAML validity. Use online YAML validator or `js-yaml` to test.

**Q: Invocation tests skip - is this a failure?**

A: No, tests skip gracefully when CLIs not installed. Install CLIs to run invocation tests.

### Report Issues

File issues on GitHub with:
- Error messages (full output)
- Steps to reproduce
- Expected vs actual behavior
- Environment (Node version, OS)

### Community

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and community support
- Pull Requests - Code contributions

---

*Contributing guide last updated: 2026-01-22*
*Questions? Open a GitHub Discussion.*
