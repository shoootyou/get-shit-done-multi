# Implementation Differences

**Last updated:** 2026-01-19

This guide explains the architectural and implementation differences between GSD (Get Shit Done) across Claude Code, GitHub Copilot CLI, and Codex CLI.

## Overview

GSD provides a unified planning and execution workflow across all three CLI platforms. While the core functionality remains the same, each CLI has different capabilities and architectural approaches that affect how GSD features are delivered.

**Why differences exist:**
- **CLI Architecture:** Each CLI has different extensibility models (skills vs agents vs prompts)
- **Platform Integration:** Different hosting platforms (Anthropic, GitHub, OpenAI) have different capabilities
- **Design Philosophy:** CLIs prioritize different use cases (solo development, team workflows, ecosystem integration)

**What stays the same:**
- `.planning/` directory structure and state management
- Command syntax (`/gsd:*` commands)
- Agent workflows and orchestration logic
- Documentation and planning artifacts

## Command System Differences

All three CLIs use the `/gsd:*` command syntax, but the underlying implementation varies:

### Claude Code
- **Architecture:** Native skills system in `~/.claude/get-shit-done/`
- **Registration:** Skills auto-discovered via `.claude/skills/` directory
- **Invocation:** Direct CLI command processing
- **Performance:** Fastest - native integration with Claude Code runtime
- **Example:**
  ```bash
  /gsd:new-project  # Processed directly by Claude Code
  ```

### Copilot CLI
- **Architecture:** GitHub-integrated skills in `.github/skills/get-shit-done/`
- **Registration:** Skills discovered via `.github/skills/` directory structure
- **Invocation:** Processed through GitHub Copilot's skill system
- **Performance:** Fast - optimized for GitHub workflows
- **Example:**
  ```bash
  /gsd:new-project  # Routed through GitHub Copilot skill system
  ```

### Codex CLI
- **Architecture:** Skills-based system in `~/.codex/skills/get-shit-done/`
- **Registration:** Skills registered via `.codex/skills/` directory
- **Invocation:** Prompts stored in `.codex/prompts/` for CLI processing
- **Performance:** Good - OpenAI backend with prompt-based execution
- **Example:**
  ```bash
  /gsd:new-project  # Processed via Codex prompt system
  ```

**Key takeaway:** Same command syntax works everywhere, but the execution path differs.

## Agent System Differences

GSD uses 11 specialized agents for different workflow tasks. Agent availability depends on CLI capabilities:

### Claude Code
- **Architecture:** Native agent system in `~/.claude/agents/`
- **Agent delegation:** Full support - agents can spawn other agents
- **Execution:** Direct invocation via Claude Code agent runtime
- **Performance:** Excellent - native agent-to-agent communication
- **Best for:** Complex multi-step workflows with agent orchestration

### Copilot CLI
- **Architecture:** Custom agents in `.github/agents/`
- **Agent delegation:** Full support via GitHub Copilot's custom agent system
- **Execution:** GitHub-integrated agent invocation
- **Performance:** Very good - optimized for collaborative workflows
- **Best for:** Team workflows with shared agent configurations

### Codex CLI
- **Architecture:** Agent-like behavior via skills (no native agent support)
- **Agent delegation:** Simulated via skill-to-skill orchestration
- **Execution:** Skills emulate agent behavior with prompt chaining
- **Performance:** Good - requires additional orchestration layer
- **Best for:** OpenAI ecosystem integration without custom agent infrastructure

**Agent availability:** See [CLI Comparison Matrix](cli-comparison.md) for detailed support levels.

## Installation Paths

Each CLI uses different installation paths based on their design philosophy:

### Claude Code
```
Global:  ~/Library/Application Support/Claude/get-shit-done/
         (macOS example - varies by OS)
Local:   .claude/get-shit-done/
```
- Supports both global and local installations
- Global installation affects all projects using Claude Code
- Local installation project-specific, committed to repository

### Copilot CLI
```
Local only: .github/skills/get-shit-done/
```
- Local installation only (no global option)
- Committed to repository for team collaboration
- GitHub integration requires `.github/` directory structure

### Codex CLI
```
Global:  ~/.codex/skills/get-shit-done/
Local:   .codex/skills/get-shit-done/
```
- Supports both global and local installations
- Global installation for user-wide access
- Local installation for project-specific configurations

**Installation commands:**
```bash
# Claude Code (global)
npx get-shit-done-cc --claude

# Copilot CLI (local)
npx get-shit-done-cc --copilot

# Codex CLI (global)
npx get-shit-done-cc --codex

# All CLIs at once
npx get-shit-done-cc --all
```

## State Management

All three CLIs share the same state management implementation:

### Shared Components
- **`.planning/` directory:** Identical structure across all CLIs
- **State files:** STATE.md, PROJECT.md, ROADMAP.md, REQUIREMENTS.md
- **Phases:** Organized in `.planning/phases/` with consistent format
- **Command recordings:** `.planning/command-recordings/` tracks all CLI interactions

### Concurrent Usage Support
```javascript
// Example: Directory locking prevents concurrent writes
// Implementation in lib-ghcc/state/directory-lock.js

DirectoryLock.withLock(stateDir, async () => {
  // Only one CLI can modify state at a time
  await stateManager.updateState(changes);
});
```

**Features:**
- **Directory locking:** Prevents concurrent write conflicts
- **Session persistence:** `.planning/.session.json` tracks active CLI
- **CLI switching:** State preserved when switching between CLIs
- **Atomic writes:** Write-then-rename pattern ensures data integrity

**Example workflow:**
```bash
# Start in Claude Code
/gsd:new-project

# Switch to Copilot CLI
/gsd:plan-phase 1

# Switch to Codex CLI
/gsd:execute-plan 01-01

# State remains consistent across all CLIs
cat .planning/STATE.md
```

## Performance Characteristics

Performance varies based on CLI architecture and backend:

### Execution Time
*(Based on Phase 4 performance tracking)*

| Operation | Claude Code | Copilot CLI | Codex CLI |
|-----------|-------------|-------------|-----------|
| Command loading | ~50ms | ~80ms | ~100ms |
| Agent invocation | ~200ms | ~250ms | ~300ms |
| State read/write | ~10ms | ~10ms | ~10ms |
| Directory lock acquire | ~5ms | ~5ms | ~5ms |

### Context Window Sizes
- **Claude Code:** Claude 3 Opus (200K tokens), Claude 3.5 Sonnet (200K tokens)
- **Copilot CLI:** GPT-4 (128K tokens), GPT-4 Turbo (128K tokens)
- **Codex CLI:** GPT-4 (128K tokens), o1 (200K tokens)

### Performance Tips

**For Claude Code:**
- Use global installation for faster skill loading
- Native agents provide fastest multi-step workflows
- Best for large codebases due to context window

**For Copilot CLI:**
- GitHub integration adds ~30ms overhead but provides team benefits
- Use for collaborative workflows where team sees same output
- Best for GitHub-centric workflows

**For Codex CLI:**
- Skill-based architecture adds orchestration overhead
- OpenAI backend optimizations help mitigate
- Best when integrating with existing OpenAI tooling

## Feature Availability

See [CLI Comparison Matrix](cli-comparison.md) for detailed feature availability table.

**Summary:**

| Feature Category | Claude Code | Copilot CLI | Codex CLI |
|-----------------|-------------|-------------|-----------|
| Commands (/gsd:*) | ✓ All | ✓ All | ✓ All |
| Agents (11 total) | ✓ Native | ✓ Native | ✓ Simulated |
| State Management | ✓ Full | ✓ Full | ✓ Full |
| Concurrent Usage | ✓ Yes | ✓ Yes | ✓ Yes |
| CLI Switching | ✓ Yes | ✓ Yes | ✓ Yes |

### Interactive Exploration
For detailed capability information with filtering and notes, see:
- **Static comparison:** [cli-comparison.md](cli-comparison.md)
- **Structured data:** [capability-data.json](capability-data.json)

## CLI-Specific Limitations

### Claude Code
- **Path handling:** macOS uses `~/Library/Application Support/Claude/`, Windows uses `%APPDATA%\Claude\`
- **Authentication:** Requires Claude account and active Claude Code installation
- **Offline mode:** Limited - requires Claude API access for agent execution

### Copilot CLI
- **GitHub dependency:** Requires `gh` CLI authentication
- **Team-only features:** Some commands require GitHub org membership
- **Rate limiting:** GitHub API rate limits may affect command execution
- **Local only:** No global installation option

### Codex CLI
- **Agent simulation:** Agent delegation works but adds orchestration overhead
- **Prompt directory:** Skills generate prompts in `.codex/prompts/` for processing
- **OpenAI dependency:** Requires OpenAI API key and active account
- **Skill size:** Skills should stay under ~15,000 words per OpenAI guidelines

## Migration Between CLIs

You can seamlessly switch between CLIs in the same project:

**Example migration:**
```bash
# Start with Claude Code
cd my-project
npx get-shit-done-cc --claude
/gsd:new-project

# Add Copilot CLI
npx get-shit-done-cc --copilot
# State preserved automatically

# Add Codex CLI
npx get-shit-done-cc --codex
# Still using same .planning/ directory

# Verify all CLIs see same state
/gsd:verify-installation
```

See [Migration Guide](migration-guide.md) for step-by-step instructions.

## Choosing the Right CLI

**Use Claude Code when:**
- You prioritize execution speed and native agent support
- You work solo or in small teams
- You want the largest context window (200K tokens)
- You prefer desktop application integration

**Use Copilot CLI when:**
- You work in GitHub-centric teams
- You want skills committed to repository for team collaboration
- You need GitHub integration (issues, PRs, actions)
- You prefer CLI-based workflows

**Use Codex CLI when:**
- You're already in the OpenAI ecosystem
- You want integration with OpenAI tools and APIs
- You prefer skill-based architecture over agents
- You're comfortable with prompt-based execution

**Use multiple CLIs when:**
- You want flexibility to switch based on task
- You need resilience (fallback if one CLI unavailable)
- You want to compare approaches across CLIs
- You're evaluating which CLI fits your workflow best

## Next Steps

- **Setup:** Choose your CLI and follow [setup guide](setup-claude-code.md)
- **Troubleshooting:** See [troubleshooting guide](troubleshooting.md) for common issues
- **Migration:** Read [migration guide](migration-guide.md) for multi-CLI setup
- **Reference:** Explore [CLI comparison matrix](cli-comparison.md) for detailed features

## Questions?

If you encounter issues not covered here:
1. Run `/gsd:verify-installation` to diagnose
2. Check [troubleshooting guide](troubleshooting.md) for solutions
3. Review CLI-specific setup guides for your platform
