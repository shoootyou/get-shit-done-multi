# Getting Started with GSD in Claude Code

**Last updated:** 2026-01-19

This guide walks you through installing and using GSD (Get Shit Done) with Claude Code, Anthropic's CLI-based development environment.

## Prerequisites

Before installing GSD for Claude Code, ensure you have:

- **Claude Code installed:** Download from [Claude](https://claude.ai/)
- **Claude Code authenticated:** Sign in with your Anthropic account
- **Node.js 16.7.0 or higher:** Check with `node --version`
- **npm:** Bundled with Node.js (check with `npm --version`)

### Verify Claude Code Installation

```bash
# Check Claude Code is installed and accessible
claude --version

# Expected output:
# Claude Code v1.x.x
```

If Claude Code is not installed, visit [claude.ai](https://claude.ai/) to download.

## Installation

GSD can be installed globally (affecting all your projects) or locally (project-specific).

### Local Installation (Project-Specific)

Recommended for most use cases - keeps GSD configuration within your project:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Install GSD for Claude Code
npx get-shit-done-multi --claude

# Expected output:
# ✓ Detecting installed CLIs...
# ✓ Claude Code detected
# ✓ Installing to .claude/get-shit-done/
# ✓ Skills registered
# ✓ Commands available: 15 GSD commands
# ✓ Installation complete!
```

**What gets installed:**
```
your-project/
  .claude/
    get-shit-done/
      agents/          # 11 specialized agents
      commands/        # 15 /gsd-* commands
      get-shit-done/   # Core workflow files
      lib-ghcc/        # Shared utilities
```

### Global Installation

Install once, use across all projects:

```bash
# Install globally for Claude Code
npx get-shit-done-multi --claude

# Expected output:
# ✓ Detecting installed CLIs...
# ✓ Claude Code detected
# ✓ Installing to ~/Library/Application Support/Claude/get-shit-done/
#   (macOS example - path varies by OS)
# ✓ Skills registered globally
# ✓ Commands available in all projects: 15 GSD commands
# ✓ Installation complete!
```

**Global installation paths:**
- **macOS:** `~/Library/Application Support/Claude/get-shit-done/`
- **Windows:** `%APPDATA%\Claude\get-shit-done\`
- **Linux:** `~/.config/claude/get-shit-done/`

## Verification

After installation, verify everything works:

```bash
# Run verification command in Claude Code
/gsd-verify-installation

# Expected output:
# ✅ Installation Verification Report
# 
# CLI Detection
# ✓ Claude Code installed (v1.x.x)
# ✓ Native agent support available
# 
# Installation Paths
# ✓ Skills found: .claude/get-shit-done/
# ✓ Agents found: .claude/agents/ (11 agents)
# 
# Commands Available
# ✓ 15 GSD commands registered
#   /gsd-new-project, /gsd-plan-phase, /gsd-execute-plan, etc.
# 
# Agent Capabilities
# ✓ All 11 agents available with full support
# 
# State Management
# ✓ Directory locking available
# ✓ Concurrent CLI usage supported
# 
# ✅ All checks passed! GSD ready to use.
```

### Troubleshooting Verification

If verification fails, see common issues:

**Issue:** "Claude Code not detected"
```bash
# Solution: Verify Claude Code is in PATH
claude --version

# If not found, add to PATH or reinstall Claude Code
```

**Issue:** "Skills not found"
```bash
# Solution: Re-run installation
npx get-shit-done-multi --claude

# Or check installation path
ls -la .claude/get-shit-done/
```

**Issue:** "Commands not available"
```bash
# Solution: Restart Claude Code CLI to refresh skills
# Then try again
/gsd-verify-installation
```

For more troubleshooting, see [Troubleshooting Guide](troubleshooting.md).

## Your First Command

Let's start a new project using GSD:

```bash
# Create a new project with GSD
/gsd-new-project

# Claude Code will prompt you for:
# - Project name
# - Brief description
# - Key requirements
# - Tech preferences

# GSD creates:
.planning/
  PROJECT.md          # Project definition
  REQUIREMENTS.md     # User requirements
  ROADMAP.md          # Phase breakdown
  STATE.md            # Current progress
  phases/             # Phase-specific plans
```

### Common Commands

```bash
# Create project roadmap
/gsd-new-project

# Plan a specific phase
/gsd-plan-phase 1

# Execute a plan
/gsd-execute-plan 01-01

# Verify phase completion
/gsd-verify-phase 1

# Debug issues
/gsd-debug

# Get help
/gsd-help
```

## Key Differences for Claude Code

### Native Agent Support

Claude Code provides the **fastest agent execution** of all three CLIs:

```javascript
// Claude Code native agent invocation
// Direct agent-to-agent communication
// No orchestration overhead
const result = await claude.invokeAgent('gsd-planner', prompt);
```

**Benefits:**
- **Fastest execution:** ~200ms average agent invocation time
- **Best orchestration:** Native agent delegation
- **Largest context:** 200K token context window (Claude 3 Opus/Sonnet)

### Path Handling

Claude Code uses OS-specific paths:

**macOS:**
```bash
# Global config
~/Library/Application Support/Claude/

# Local config
.claude/
```

**Windows:**
```bash
# Global config
%APPDATA%\Claude\

# Local config
.claude\
```

**Linux:**
```bash
# Global config
~/.config/claude/

# Local config
.claude/
```

### Performance Tips

1. **Use global installation for solo work:**
   - Faster skill loading (~50ms vs ~80ms)
   - Available across all projects
   - Single update point

2. **Use local installation for teams:**
   - Committed to repository
   - Team sees same GSD version
   - Project-specific configurations

3. **Leverage native agents:**
   - Claude Code's native agents are fastest
   - Best for complex multi-step workflows
   - Optimal for large codebases (200K context)

### Common Gotchas

**1. Skills not loading after installation**
- **Cause:** Claude Code caches skill list
- **Fix:** Restart Claude Code or run `/gsd-verify-installation`

**2. Permission errors on macOS**
- **Cause:** macOS Gatekeeper or file permissions
- **Fix:** Grant permissions in System Preferences → Security & Privacy

**3. Path resolution on Windows**
- **Cause:** Windows uses backslashes, POSIX uses forward slashes
- **Fix:** GSD handles automatically via `path.join()` - no action needed

**4. Context window limits**
- **Cause:** Very large codebases exceed 200K tokens
- **Fix:** Use `.gsdignore` to exclude large directories (node_modules, etc.)

## Troubleshooting

### Command Not Found

**Symptom:** Running `/gsd-new-project` shows "command not found"

**Diagnosis:**
```bash
/gsd-verify-installation
```

**Solutions:**
1. **If skills not installed:**
   ```bash
   npx get-shit-done-multi --claude
   ```

2. **If skills installed but not detected:**
   - Restart Claude Code
   - Check path: `ls -la .claude/get-shit-done/`

3. **If persistent:**
   - Reinstall globally: `npx get-shit-done-multi --claude`
   - Check Claude Code version: `claude --version` (requires v1.0.0+)

### Permission Denied

**Symptom:** "Permission denied" when running GSD commands

**Diagnosis:**
```bash
ls -la .claude/
ls -la ~/Library/Application\ Support/Claude/
```

**Solutions:**
1. **Fix file permissions:**
   ```bash
   chmod -R 755 .claude/get-shit-done/
   ```

2. **macOS only - Grant disk access:**
   - System Preferences → Security & Privacy → Full Disk Access
   - Add Claude Code to allowed apps

3. **Reinstall with correct permissions:**
   ```bash
   npx get-shit-done-multi --claude
   ```

### Agent Timeout

**Symptom:** Agent invocation times out or hangs

**Diagnosis:**
```bash
# Check Claude API status
# Visit status.anthropic.com

# Check agent configuration
cat .claude/agents/gsd-planner.md
```

**Solutions:**
1. **Check internet connection:** Agent execution requires Claude API
2. **Verify authentication:** `claude whoami`
3. **Reduce context size:** Large prompts may timeout, use `.gsdignore`
4. **Retry:** Transient API issues usually resolve quickly

For more troubleshooting, see [Troubleshooting Guide](troubleshooting.md).

## Next Steps

Now that GSD is installed, explore:

1. **Learn the differences:** Read [Implementation Differences](implementation-differences.md)
2. **Compare CLIs:** Check [CLI Comparison Matrix](cli-comparison.md)
3. **Add more CLIs:** Follow [Migration Guide](migration-guide.md) to add Copilot or Codex
4. **Understand workflows:** Review GSD-STYLE.md in the repository

## Multi-CLI Setup

Want to use GSD with multiple CLIs? You can seamlessly switch:

```bash
# Add Copilot CLI to existing Claude Code project
cd your-project
npx get-shit-done-multi --copilot

# State is shared automatically
cat .planning/STATE.md  # Shows same progress

# Switch between CLIs anytime
# In Claude Code: /gsd-plan-phase 1
# In Copilot CLI: /gsd-execute-plan 01-01

# Both see same .planning/ directory
```

See [Migration Guide](migration-guide.md) for details.

## Questions?

If you encounter issues not covered here:

1. **Run verification:** `/gsd-verify-installation`
2. **Check troubleshooting:** [Troubleshooting Guide](troubleshooting.md)
3. **Review differences:** [Implementation Differences](implementation-differences.md)
4. **Compare CLIs:** [CLI Comparison Matrix](cli-comparison.md)

## Reference

- **Claude Code Documentation:** [claude.ai/docs](https://claude.ai/docs)
- **GSD Style Guide:** [GSD-STYLE.md](../GSD-STYLE.md)
- **CLI Comparison:** [cli-comparison.md](cli-comparison.md)
- **Agent Capabilities:** [agent-capabilities.md](agent-capabilities.md)
