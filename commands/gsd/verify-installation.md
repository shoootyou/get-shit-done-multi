---
name: gsd:verify-installation
description: Run comprehensive installation verification
category: setup
arguments: []
examples:
  - command: "/gsd:verify-installation"
    description: Verify GSD installation and check CLI compatibility
---

<objective>
Run comprehensive diagnostics to verify GSD installation works correctly.

This command will check:
- ✓ Which CLIs are installed (Claude Code, Copilot CLI, Codex CLI)
- ✓ Whether GSD skill/prompt is registered in each CLI
- ✓ Whether all GSD commands are accessible
- ✓ Whether GSD agents are supported in current CLI
</objective>

<context>
No specific context files required - this is a system verification command.
</context>

<process>

<step name="run_verification_script">
Execute the verification script that tests all GSD components:

```bash
node .scripts/run-verification.js
```

The script will:
1. Test which CLIs are installed (Claude, Copilot, Codex)
2. Verify GSD skill registration in each CLI
3. Check all GSD commands are accessible
4. Verify agent capability matrix and support for all 11 agents

Results are displayed with status icons:
- ✓ **Pass**: Feature works as expected
- ⚠ **Warn**: Feature works with limitations
- ✗ **Fail**: Feature not available
</step>

</process>

<guidance>

## Common Issues

1. **CLI not installed**: Follow the installation link provided in the test output
2. **Skill not registered**: Run `npx get-shit-done-multi --<cli>` to register
3. **Commands missing**: Reinstall GSD package
4. **Agent not supported**: Use a different CLI for that agent

For detailed compatibility information, see `docs/agent-capabilities.md`.

## What Gets Tested

**CLI Installation (3 tests):**
- Claude Code CLI (`claude-code`)
- GitHub Copilot CLI (`gh copilot`)
- Codex CLI (`codex`)

**Skill Registration (3 tests):**
- GSD registered in Claude
- GSD registered in Copilot
- GSD registered in Codex

**Command Availability (1 test):**
- All 29 GSD commands accessible

**Agent Support (11 tests):**
- gsd-executor - Executes phase plans
- gsd-planner - Creates phase plans
- gsd-verifier - Verifies phase completion
- gsd-debugger - Debug investigations
- gsd-phase-researcher - Researches implementation approaches
- gsd-plan-checker - Validates plans before execution
- gsd-codebase-mapper - Maps codebases
- gsd-project-researcher - Researches project domains
- gsd-research-synthesizer - Synthesizes research findings
- gsd-roadmapper - Creates project roadmaps
- gsd-integration-checker - Verifies cross-phase integration

## Technical Details

The verification system uses:
- **DiagnosticTest** base class for all tests
- **AgentCapabilityTest** loads capability matrix from `bin/lib/orchestration/capability-matrix.js`
- **CLIInstalledTest** checks CLI installations
- **SkillRegisteredTest** verifies skill/prompt registration
- **CommandAvailableTest** checks command file availability

Tests run autonomously and report detailed results with actionable fixes.

</guidance>
