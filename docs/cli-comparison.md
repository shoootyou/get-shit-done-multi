---
generated: true
timestamp: 2026-01-20T00:10:09.892Z
generator: generate-comparison.js
gsd-version: 1.6.4
---

> **Note:** This file is auto-generated. Do not edit manually.
> Last generated: January 20, 2026

# CLI Comparison Matrix

**Last generated:** 2026-01-19 23:37 UTC

This document compares GSD (Get Shit Done) feature availability across Claude Code, GitHub Copilot CLI, and Codex CLI.

All features are implemented in the GSD codebase. Availability depends on CLI installation.

## Agent Availability

The following custom agents are available in the GSD workflow:

| Agent | Claude Code | Copilot CLI | Codex CLI |
|-------|-------------|-------------|------------|
| gsd-executor | ✓ Full support | ✓ Full support | ✓ Full support |
| gsd-planner | ✓ Full support | ✓ Full support | ✓ Full support |
| gsd-verifier | ✓ Full support | ✓ Full support | ✓ Full support |
| gsd-debugger | ✓ Full support | ✓ Full support | ✓ Full support |
| gsd-phase-researcher | ✓ Full support | ✓ Full support | ✓ Full support |
| gsd-plan-checker | ✓ Full support | ✓ Full support | ✓ Full support |
| gsd-codebase-mapper | ✓ Full support | ✓ Full support | ✓ Full support |
| gsd-project-researcher | ✓ Full support | ✓ Full support | ✓ Full support |
| gsd-research-synthesizer | ✓ Full support | ✓ Full support | ✓ Full support |
| gsd-roadmapper | ✓ Full support | ✓ Full support | ✓ Full support |
| gsd-integration-checker | ✓ Full support | ✓ Full support | ✓ Full support |

## CLI-Specific Limitations

### Claude Code

- **slash_commands**: ✓ Supported
  - Full /gsd:* command support via native slash command system
- **custom_agents**: ✓ Supported
  - Native .agent.md format in .agent/ directories
- **parallel_agents**: ✓ Supported
  - No limitations on concurrent agent invocation

### Copilot CLI

- **slash_commands**: ✗ Not Supported
  - Use skills with $get-shit-done instead of /gsd:* commands
- **custom_agents**: ✓ Supported
  - Custom agent definitions in .github/agents/
- **parallel_agents**: ✓ Supported
  - No limitations on concurrent agent invocation

### Codex CLI

- **slash_commands**: ✗ Not Supported
  - Use skills with $get-shit-done instead of /gsd:* commands
- **custom_agents**: ✓ Supported
  - Skill-based approach in .codex/skills/
- **parallel_agents**: ✓ Supported
  - No limitations on concurrent agent invocation


## Legend

| Icon | Meaning | Description |
|------|---------|-------------|
| ✓ | Full support | Feature fully implemented and tested |
| ⚠ | Partial support | Feature available with limitations |
| ✗ | Not supported | Feature not available on this CLI |

**Note:** All agents require the respective CLI to be installed on your system:
- **Claude Code:** `claude-code` command must be available
- **Copilot CLI:** `gh` command with `copilot` extension installed
- **Codex CLI:** `codex` command must be available
## Installation Requirements

To use GSD with a specific CLI, you must have that CLI installed:

### Claude Code
```bash
# Verify installation
claude-code --version
```

### Copilot CLI
```bash
# Install GitHub CLI
# See: https://cli.github.com/

# Install Copilot extension
gh extension install github/gh-copilot

# Verify installation
gh copilot --version
```

### Codex CLI
```bash
# Install via npm
npm install -g @openai/codex-cli

# Verify installation
codex --version
```

---

*This document is auto-generated from `bin/lib/orchestration/capability-matrix.js`*
*Run `node bin/doc-generator/generate-comparison.js` to regenerate*
