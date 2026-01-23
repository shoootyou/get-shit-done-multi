# Getting Started with GSD in Codex CLI

**Last updated:** 2026-01-19

This guide walks you through installing and using GSD (Get Shit Done) with Codex CLI, OpenAI's command-line development assistant.

## Prerequisites

Before installing GSD for Codex CLI, ensure you have:

- **Codex CLI installed:** Install via npm or pip (varies by version)
- **OpenAI API key:** Required for Codex API access
- **Codex CLI authenticated:** Configure with your OpenAI credentials
- **Node.js 16.7.0 or higher:** Check with `node --version`
- **npm:** Bundled with Node.js (check with `npm --version`)

### Verify Codex CLI Installation

```bash
# Check Codex CLI is installed
codex --version

# Expected output:
# Codex CLI v0.8x.x
```

If not installed:
```bash
# Install via npm (check npm registry for latest)
npm install -g @openai/codex-cli

# Or via pip
pip install codex-cli

# Configure OpenAI API key
export OPENAI_API_KEY="your-api-key-here"

# Verify authentication
codex auth status
```

## Installation

GSD can be installed globally (affecting all your projects) or locally (project-specific).

### Local Installation (Project-Specific)

Recommended for most use cases - keeps GSD configuration within your project:

```bash
# Navigate to your project directory
cd /path/to/your/project

# Install GSD for Codex CLI
npx get-shit-done-multi --codex

# Expected output:
# ✓ Detecting installed CLIs...
# ✓ Codex CLI detected
# ✓ Installing to .codex/skills/get-shit-done/
# ✓ Skills registered
# ✓ Prompts generated in .codex/prompts/
# ✓ Commands available: 15 GSD commands
# ✓ Installation complete!
```

**What gets installed:**
```
your-project/
  .codex/
    skills/
      get-shit-done/
        agents/        # 11 specialized agents (skill-based)
        commands/      # 15 /gsd-* commands
        get-shit-done/ # Core workflow files
        lib-ghcc/      # Shared utilities
    prompts/           # Generated prompts for CLI processing
```

### Global Installation

Install once, use across all projects:

```bash
# Install globally for Codex CLI
npx get-shit-done-multi --codex

# Expected output:
# ✓ Detecting installed CLIs...
# ✓ Codex CLI detected
# ✓ Installing to ~/.codex/skills/get-shit-done/
# ✓ Skills registered globally
# ✓ Commands available in all projects: 15 GSD commands
# ✓ Installation complete!
```

**Global installation path:**
```
~/.codex/
  skills/
    get-shit-done/
  prompts/
```

## Verification

After installation, verify everything works:

```bash
# Run verification command in Codex CLI
/gsd-verify-installation

# Expected output:
# ✅ Installation Verification Report
# 
# CLI Detection
# ✓ Codex CLI installed (v0.8x.x)
# ✓ Skills-based architecture detected
# 
# Installation Paths
# ✓ Skills found: .codex/skills/get-shit-done/
# ✓ Prompts found: .codex/prompts/ (15 commands)
# 
# Commands Available
# ✓ 15 GSD commands registered
#   /gsd-new-project, /gsd-plan-phase, /gsd-execute-plan, etc.
# 
# Agent Capabilities
# ✓ All 11 agents available (skill-based simulation)
# 
# State Management
# ✓ Directory locking available
# ✓ Concurrent CLI usage supported
# 
# ✅ All checks passed! GSD ready to use.
```

### Troubleshooting Verification

If verification fails, see common issues:

**Issue:** "Codex CLI not detected"
```bash
# Solution: Verify Codex CLI is in PATH
codex --version

# If not found, reinstall:
npm install -g @openai/codex-cli
```

**Issue:** "Skills not found"
```bash
# Solution: Re-run installation
npx get-shit-done-multi --codex

# Or check installation path
ls -la .codex/skills/get-shit-done/
```

**Issue:** "OpenAI API key not configured"
```bash
# Solution: Set API key
export OPENAI_API_KEY="your-api-key-here"

# Or configure via Codex CLI
codex config set api_key "your-api-key-here"

# Verify
codex auth status
```

For more troubleshooting, see [Troubleshooting Guide](troubleshooting.md).

## Your First Command

Let's start a new project using GSD:

```bash
# Create a new project with GSD
/gsd-new-project

# Codex CLI will prompt you for:
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

## Key Differences for Codex CLI

### Skills-Based Architecture

Codex CLI uses **skill-based architecture** rather than native agents:

```javascript
// Agent behavior simulated via skills
// Skills in .codex/skills/get-shit-done/
// Prompts generated in .codex/prompts/

// Agent invocation becomes skill-to-skill orchestration
const result = await codex.executeSkill('gsd-planner', prompt);
```

**Benefits:**
- **OpenAI ecosystem integration:** Works with OpenAI tools and APIs
- **Flexible prompt control:** Direct access to generated prompts
- **GPT-4 and o1 support:** Choose model based on task complexity

**Tradeoffs:**
- **Agent orchestration overhead:** ~100ms additional latency vs native agents
- **Manual prompt management:** Prompts stored in `.codex/prompts/` directory
- **No native agent delegation:** Uses skill chaining instead

### Path Handling

Codex CLI uses `.codex/` directory structure:

**Global:**
```bash
~/.codex/
  skills/
    get-shit-done/
  prompts/
```

**Local:**
```bash
.codex/
  skills/
    get-shit-done/
  prompts/
```

### Performance Tips

1. **Use appropriate models:**
   - **GPT-4 Turbo:** Fast, good for most tasks (~250ms)
   - **GPT-4:** More capable, slower (~500ms)
   - **o1:** Best for complex reasoning (~1000ms+)

2. **Manage prompt directory:**
   - Prompts in `.codex/prompts/` can be edited
   - Customize prompts for specific workflows
   - Version control prompts for team consistency

3. **Optimize for OpenAI:**
   - Use streaming for long responses
   - Batch similar operations
   - Monitor token usage for cost control

### Common Gotchas

**1. Skills not loading after installation**
- **Cause:** Codex CLI hasn't refreshed skill list
- **Fix:** Run `codex skills reload` or restart Codex CLI

**2. OpenAI API rate limits**
- **Cause:** Exceeded OpenAI rate limits (varies by tier)
- **Fix:** Wait for reset or upgrade OpenAI plan

**3. Prompt directory management**
- **Cause:** Large prompt files slow down CLI
- **Fix:** Keep prompts concise, follow ~5,000 word guideline

**4. Agent simulation overhead**
- **Cause:** Skill-to-skill orchestration adds latency
- **Fix:** Expected behavior - plan for ~100ms overhead per agent call

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
   npx get-shit-done-multi --codex
   ```

2. **If skills installed but not detected:**
   - Reload skills: `codex skills reload`
   - Check path: `ls -la .codex/skills/get-shit-done/`

3. **If persistent:**
   - Reinstall globally: `npx get-shit-done-multi --codex`
   - Check Codex CLI version: `codex --version` (requires v0.84.0+)

### Permission Denied

**Symptom:** "Permission denied" when running GSD commands

**Diagnosis:**
```bash
ls -la .codex/
ls -la ~/.codex/
```

**Solutions:**
1. **Fix file permissions:**
   ```bash
   chmod -R 755 .codex/skills/get-shit-done/
   ```

2. **Check OpenAI authentication:**
   ```bash
   codex auth status
   
   # If not authenticated:
   export OPENAI_API_KEY="your-api-key"
   ```

3. **Reinstall with correct permissions:**
   ```bash
   npx get-shit-done-multi --codex
   ```

### OpenAI API Error

**Symptom:** Commands fail with API errors

**Diagnosis:**
```bash
# Check API key configuration
codex config list

# Test API access
codex test-connection
```

**Solutions:**
1. **Verify API key:**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   codex auth status
   ```

2. **Check rate limits:**
   - Visit [OpenAI usage page](https://platform.openai.com/usage)
   - Upgrade plan if needed

3. **Check OpenAI status:**
   - Visit [OpenAI status page](https://status.openai.com/)
   - Retry after incidents resolve

### Agent Timeout

**Symptom:** Agent invocation times out or hangs

**Diagnosis:**
```bash
# Check Codex CLI status
codex status

# Check skill configuration
cat .codex/skills/get-shit-done/agents/gsd-planner.md
```

**Solutions:**
1. **Check internet connection:** Requires OpenAI API access
2. **Verify authentication:** `codex auth status`
3. **Reduce context size:** Large prompts may timeout
4. **Switch models:** Try GPT-4 Turbo for faster responses
5. **Retry:** Transient API issues usually resolve quickly

For more troubleshooting, see [Troubleshooting Guide](troubleshooting.md).

## Next Steps

Now that GSD is installed, explore:

1. **Learn the differences:** Read [Implementation Differences](implementation-differences.md)
2. **Compare CLIs:** Check [CLI Comparison Matrix](cli-comparison.md)
3. **Add more CLIs:** Follow [Migration Guide](migration-guide.md) to add Claude or Copilot
4. **Understand workflows:** Review GSD-STYLE.md in the repository

## Multi-CLI Setup

Want to use GSD with multiple CLIs? You can seamlessly switch:

```bash
# Add Claude Code to existing Codex CLI project
cd your-project
npx get-shit-done-multi --claude

# State is shared automatically
cat .planning/STATE.md  # Shows same progress

# Switch between CLIs anytime
# In Codex CLI: /gsd-plan-phase 1
# In Claude Code: /gsd-execute-plan 01-01

# Both see same .planning/ directory
```

See [Migration Guide](migration-guide.md) for details.

## OpenAI Ecosystem Integration

### Using with OpenAI Tools

Codex CLI integrates with OpenAI's broader ecosystem:

```bash
# Use with OpenAI Playground
# Export prompts for testing
cat .codex/prompts/new-project.txt

# Use with OpenAI API directly
curl https://api.openai.com/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $OPENAI_API_KEY" \
  -d @.codex/prompts/new-project.json

# Integrate with GPT Builder
# Export GSD workflows as custom GPTs
```

### Cost Management

Monitor and control OpenAI costs:

```bash
# Check token usage
/gsd-verify-installation  # Shows token estimates

# View usage tracking
cat .planning/metrics/usage-tracking.json

# Export for analysis
node lib-ghcc/state/usage-tracking.js export > usage.csv
```

**Cost optimization tips:**
- Use GPT-4 Turbo for routine tasks (cheaper, faster)
- Reserve GPT-4 or o1 for complex planning/debugging
- Monitor `.planning/metrics/` for usage trends
- Set OpenAI usage limits in dashboard

## Questions?

If you encounter issues not covered here:

1. **Run verification:** `/gsd-verify-installation`
2. **Check troubleshooting:** [Troubleshooting Guide](troubleshooting.md)
3. **Review differences:** [Implementation Differences](implementation-differences.md)
4. **Compare CLIs:** [CLI Comparison Matrix](cli-comparison.md)

## Reference

- **Codex CLI Documentation:** [openai.com/codex](https://openai.com/codex)
- **OpenAI API Reference:** [platform.openai.com/docs](https://platform.openai.com/docs)
- **GSD Style Guide:** [GSD-STYLE.md](../GSD-STYLE.md)
- **CLI Comparison:** [cli-comparison.md](cli-comparison.md)
- **Agent Capabilities:** [agent-capabilities.md](agent-capabilities.md)
