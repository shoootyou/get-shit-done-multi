---
name: gsd:verify-installation
description: Run comprehensive installation verification
category: setup
arguments: []
examples:
  - command: "/gsd:verify-installation"
    description: Verify GSD installation and check CLI compatibility
---

# Verify Installation

Run comprehensive diagnostics to verify GSD installation works correctly.

This command will check:
- ✓ Which CLIs are installed (Claude Code, Copilot CLI, Codex CLI)
- ✓ Whether GSD skill/prompt is registered in each CLI
- ✓ Whether all GSD commands are accessible
- ✓ Whether GSD agents are supported in current CLI

## Running Diagnostics

```javascript
const path = require('path');
const gitRoot = require('child_process').execSync('git rev-parse --show-toplevel', { encoding: 'utf8' }).trim();
const { runDiagnostics } = require(path.join(gitRoot, 'lib-ghcc/verification/diagnostic-runner'));
const { CLIInstalledTest, SkillRegisteredTest } = require(path.join(gitRoot, 'lib-ghcc/verification/cli-detector'));
const { CommandAvailableTest } = require(path.join(gitRoot, 'lib-ghcc/verification/command-verifier'));
const { AgentCapabilityTest } = require(path.join(gitRoot, 'lib-ghcc/verification/agent-verifier'));

// Define all diagnostic tests
const tests = [
  // CLI Installation Tests
  new CLIInstalledTest('Claude Code', 'claude'),
  new CLIInstalledTest('GitHub Copilot CLI', 'copilot'),
  new CLIInstalledTest('Codex CLI', 'codex'),
  
  // Skill Registration Tests
  new SkillRegisteredTest('claude'),
  new SkillRegisteredTest('copilot'),
  new SkillRegisteredTest('codex'),
  
  // Command Availability Test
  new CommandAvailableTest(),
  
  // Agent Capability Tests (key agents)
  new AgentCapabilityTest('gsd-executor'),
  new AgentCapabilityTest('gsd-planner'),
  new AgentCapabilityTest('gsd-verifier'),
  new AgentCapabilityTest('gsd-debugger'),
  new AgentCapabilityTest('gsd-phase-researcher'),
  new AgentCapabilityTest('gsd-plan-checker'),
  new AgentCapabilityTest('gsd-codebase-mapper'),
  new AgentCapabilityTest('gsd-project-researcher'),
  new AgentCapabilityTest('gsd-research-synthesizer'),
  new AgentCapabilityTest('gsd-roadmapper'),
  new AgentCapabilityTest('gsd-integration-checker')
];

// Run diagnostics
runDiagnostics(tests).then(summary => {
  console.log('\n═══════════════════════════════════════════════');
  console.log('  VERIFICATION SUMMARY');
  console.log('═══════════════════════════════════════════════');
  console.log(`✓ ${summary.passed} passed`);
  console.log(`⚠ ${summary.warned} warnings`);
  console.log(`✗ ${summary.failed} failed`);
  console.log('═══════════════════════════════════════════════\n');
  
  if (summary.failed === 0 && summary.warned === 0) {
    console.log('🎉 All checks passed! GSD is ready to use.\n');
  } else if (summary.failed === 0) {
    console.log('⚠️  Some warnings detected. GSD should work but may have limitations.\n');
  } else {
    console.log('❌ Some checks failed. Please address the issues above.\n');
  }
}).catch(error => {
  console.error('Verification error:', error.message);
  process.exit(1);
});
```

## Manual Verification (If Diagnostic Runner Not Available)

If you cannot run the JavaScript diagnostic runner, perform these manual checks:

### 1. Check CLI Installations

**Claude Code:**
```bash
claude --version && echo "✓ PASS: Claude Code is installed"
```
- ✓ PASS: Command succeeds (exit code 0) and displays version
- ✗ FAIL: Command not found or exits with error
- Install: https://claude.ai/download

**GitHub Copilot CLI:**
```bash
copilot --version && echo "✓ PASS: GitHub Copilot CLI is installed"
```
- ✓ PASS: Command succeeds (exit code 0) and displays version
- ✗ FAIL: Command not found or exits with error
- Install: https://github.com/github/gh-copilot

**Codex CLI:**
```bash
codex --version && echo "✓ PASS: Codex CLI is installed"
```
- ✓ PASS: Command succeeds (exit code 0) and displays version
- ✗ FAIL: Command not found or exits with error
- Install: https://www.npmjs.com/package/codex-cli

### 2. Check GSD Skill Registration

**Claude Code:**
```bash
[ -f ~/Library/Application\ Support/Claude/.agent/get-shit-done/.agent.md ] && echo "✓ PASS: GSD registered in Claude Code" || echo "⊙ SKIP or ✗ FAIL"
```
- ✓ PASS: Command exits 0 (file exists)
- ⊙ SKIP: File doesn't exist but you don't use Claude Code
- ✗ FAIL: File doesn't exist and you want to use Claude Code
- Fix: `npx get-shit-done-multi --claude`

**GitHub Copilot CLI:**
```bash
[ -f .github/skills/get-shit-done/SKILL.md ] && echo "✓ PASS: GSD registered in Copilot CLI" || echo "⊙ SKIP or ✗ FAIL"
```
- ✓ PASS: Command exits 0 (file exists)
- ⊙ SKIP: File doesn't exist but you don't use Copilot CLI
- ✗ FAIL: File doesn't exist and you want to use Copilot CLI
- Fix: `npx get-shit-done-multi --copilot`

**Codex CLI:**
```bash
[ -f ~/.codex/prompts/get-shit-done/PROMPT.md ] && echo "✓ PASS: GSD registered in Codex CLI" || echo "⊙ SKIP or ✗ FAIL"
```
- ✓ PASS: Command exits 0 (file exists)
- ⊙ SKIP: File doesn't exist but you don't use Codex CLI
- ✗ FAIL: File doesn't exist and you want to use Codex CLI
- Fix: `npx get-shit-done-multi --codex`

### 3. Check GSD Commands Available

```bash
cd $(git rev-parse --show-toplevel) && count=$(ls -1 .github/skills/get-shit-done/commands/gsd/*.md 2>/dev/null | wc -l | tr -d ' ') && [ "$count" -ge 29 ] && echo "✓ PASS: $count GSD commands found" || echo "✗ FAIL: Only $count commands found"
```
- ✓ PASS: Command exits 0 (29 or more command files found)
- ✗ FAIL: Command exits 1 (fewer than 29 command files)
- Fix: Reinstall GSD or check repository integrity

**List all commands:**
```bash
ls -1 .github/skills/get-shit-done/commands/gsd/*.md | xargs -n1 basename
```

### 4. Check GSD Agents Available

```bash
cd $(git rev-parse --show-toplevel) && count=$(ls -1 .github/agents/gsd-*.md 2>/dev/null | wc -l | tr -d ' ') && [ "$count" -eq 11 ] && echo "✓ PASS: All $count GSD agents found" || echo "⚠ WARN: Only $count agents found"
```
- ✓ PASS: Command exits 0 (exactly 11 agent files found)
- ⚠ WARN: Command exits 1 (fewer than 11 agent files found)
- Fix: Check repository integrity

**List all agents:**
```bash
ls -1 .github/agents/gsd-*.md 2>/dev/null | xargs -n1 basename | sed 's/\.md$//'
```

**Expected agents:**
- gsd-executor
- gsd-planner
- gsd-verifier
- gsd-debugger
- gsd-phase-researcher
- gsd-plan-checker
- gsd-codebase-mapper
- gsd-project-researcher
- gsd-research-synthesizer
- gsd-roadmapper
- gsd-integration-checker

### 5. Check Current CLI Detection

```bash
# Detect which CLI you're currently using
echo $COPILOT_CLI_VERSION  # Set if using GitHub Copilot CLI
which claude codex copilot 2>/dev/null
```

### Summary of Manual Checks

Run all checks and report results in this format:

```
═══════════════════════════════════════════════
  VERIFICATION SUMMARY
═══════════════════════════════════════════════

CLI Installations:
  ✓ Claude Code: installed (version X.X.X) / not installed
  ✓ Copilot CLI: installed (version X.X.X) / not installed
  ✓ Codex CLI: installed (version X.X.X) / not installed

GSD Skill Registration:
  ✓/⊙/✗ Claude Code: registered / skipped / not registered
  ✓/⊙/✗ Copilot CLI: registered / skipped / not registered
  ✓/⊙/✗ Codex CLI: registered / skipped / not registered

GSD Components:
  ✓ Commands: XX files found
  ✓ Agents: XX files found

═══════════════════════════════════════════════
```

## Understanding Results

**Status Icons:**
- ✓ **Pass**: Feature works as expected
- ⊙ **Skip**: Not applicable (CLI not used/configured)
- ⚠ **Warn**: Feature works with limitations
- ✗ **Fail**: Feature not available

**Common Issues:**

1. **CLI not installed**: Follow the installation link provided
2. **Skill not registered**: Run `npx get-shit-done-multi --<cli>` to register
3. **Commands missing**: Reinstall GSD package
4. **Agent not supported**: Use a different CLI for that agent

For detailed compatibility information, see `docs/agent-capabilities.md`.
