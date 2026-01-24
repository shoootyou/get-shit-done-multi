# Getting Started with GSD in GitHub Copilot CLI

**Last updated:** 2026-01-19

This guide walks you through installing and using GSD (Get Shit Done) with GitHub Copilot CLI, GitHub's AI-powered command-line development assistant.

## Prerequisites

Before installing GSD for Copilot CLI, ensure you have:

- **GitHub Copilot CLI installed:** Install via `gh extension install github/gh-copilot`
- **GitHub CLI (gh) authenticated:** Sign in with `gh auth login`
- **GitHub Copilot subscription:** Required for Copilot CLI access
- **Node.js 16.7.0 or higher:** Check with `node --version`
- **npm:** Bundled with Node.js (check with `npm --version`)

### Verify Copilot CLI Installation

```bash
# Check GitHub CLI is installed
gh --version

# Expected output:
# gh version 2.x.x (yyyy-mm-dd)

# Check Copilot CLI extension is installed
gh copilot --version

# Expected output:
# GitHub Copilot CLI v1.x.x
```

If not installed:
```bash
# Install GitHub CLI first
brew install gh  # macOS
# Or download from: https://cli.github.com/

# Authenticate
gh auth login

# Install Copilot CLI extension
gh extension install github/gh-copilot
```

## Installation

GSD for Copilot CLI uses **local installation only** (no global option). This ensures team collaboration and consistent configurations.

### Local Installation (Project-Specific)

```bash
# Navigate to your project directory
cd /path/to/your/project

# Install GSD for Copilot CLI
npx get-shit-done-multi --copilot

# Expected output:
# ✓ Detecting installed CLIs...
# ✓ GitHub Copilot CLI detected
# ✓ Installing to .github/skills/get-shit-done/
# ✓ Skills registered
# ✓ Commands available: 15 GSD commands
# ✓ Installation complete!
```

## What Gets Installed

Local project structure:
```
.github/
├── skills/          # 29 individual skill folders
│   ├── gsd-new-project/
│   ├── gsd-execute-phase/
│   ├── gsd-plan-phase/
│   └── ... (26 more)
└── agents/          # 11 specialized agents
    ├── gsd-executor/
    ├── gsd-planner/
    └── ... (9 more)

get-shit-done/       # System content
├── workflows/       # Workflow patterns
├── templates/       # Document templates
└── references/      # Reference docs
```

**Expected file counts:**
- Skills: 29 folders (one per command)
- Agents: 11 folders (specialized agents)

**Important:** The `.github/` directory should be committed to your repository for team collaboration.

### Why Local Only?

Copilot CLI's architecture is designed for **team-based workflows**:

- **Committed to repository:** Everyone on team uses same GSD version
- **GitHub integration:** Skills integrate with GitHub issues, PRs, actions
- **Consistent experience:** No "works on my machine" issues
- **Team collaboration:** Shared agent configurations and planning

## Verification

After installation, verify everything works:

```bash
# Run verification command in Copilot CLI
/gsd-verify-installation

# Expected output:
# ✅ Installation Verification Report
# 
# CLI Detection
# ✓ GitHub Copilot CLI installed (v1.x.x)
# ✓ Custom agent support available
# 
# Installation Paths
# ✓ Skills found: .github/skills/get-shit-done/
# ✓ Agents found: .github/agents/ (11 agents)
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

**Issue:** "Copilot CLI not detected"
```bash
# Solution: Verify GitHub CLI and Copilot extension
gh --version
gh copilot --version

# If Copilot not installed:
gh extension install github/gh-copilot
```

**Issue:** "Skills not found"
```bash
# Solution: Re-run installation
npx get-shit-done-multi --copilot

# Or check installation path
ls -la .github/skills/get-shit-done/
```

**Issue:** "Authentication required"
```bash
# Solution: Authenticate GitHub CLI
gh auth login

# Verify authentication
gh auth status
```

For more troubleshooting, see [Troubleshooting Guide](troubleshooting.md).

## Your First Command

Let's start a new project using GSD:

```bash
# Create a new project with GSD
/gsd-new-project

# Copilot CLI will prompt you for:
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

## Key Differences for Copilot CLI

### GitHub Integration

Copilot CLI provides **seamless GitHub workflow integration**:

```bash
# GSD commands can interact with GitHub
/gsd-new-project  # Can create GitHub repo, issues, projects

# State synchronization via GitHub
# Team members see same .planning/ artifacts via git
```

**Benefits:**
- **Team collaboration:** Skills committed to repo
- **GitHub integration:** Issues, PRs, actions
- **Consistent versions:** Everyone uses same GSD version
- **No global installation conflicts:** Project-specific only

### Path Handling

Copilot CLI uses **.github/** directory structure exclusively:

```bash
# Local config only
.github/
  skills/
    get-shit-done/
  agents/
```

**No global installation available** - this is intentional for team consistency.

### Performance Tips

1. **Commit .github/ directory:**
   - Ensures team sees same GSD version
   - Skills auto-discovered on git clone
   - Reduces setup time for new team members

2. **Use GitHub integration:**
   - Link GSD phases to GitHub milestones
   - Create issues from requirements
   - Track progress in GitHub Projects

3. **Leverage GitHub Actions:**
   - Automate verification on PR
   - Run `/gsd-verify-phase` in CI
   - Enforce planning standards

### Common Gotchas

**1. Skills not loading after git clone**
- **Cause:** Copilot CLI hasn't refreshed skill list
- **Fix:** Run `/gsd-verify-installation` to register skills

**2. GitHub authentication expired**
- **Cause:** `gh` CLI token expired
- **Fix:** Re-authenticate with `gh auth login`

**3. Rate limiting**
- **Cause:** GitHub API rate limits (5000/hour authenticated)
- **Fix:** Usually resolves quickly; check with `gh api rate_limit`

**4. Requires GitHub repository**
- **Cause:** Copilot CLI expects `.github/` in git repository
- **Fix:** Initialize git: `git init && git add . && git commit -m "Initial commit"`

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
   npx get-shit-done-multi --copilot
   ```

2. **If skills installed but not detected:**
   - Run `gh copilot reload` to refresh skills
   - Check path: `ls -la .github/skills/get-shit-done/`

3. **If persistent:**
   - Verify GitHub authentication: `gh auth status`
   - Check Copilot subscription: `gh copilot status`

### Permission Denied

**Symptom:** "Permission denied" when running GSD commands

**Diagnosis:**
```bash
ls -la .github/
gh auth status
```

**Solutions:**
1. **Fix file permissions:**
   ```bash
   chmod -R 755 .github/skills/get-shit-done/
   ```

2. **Verify GitHub authentication:**
   ```bash
   gh auth login
   gh auth status
   ```

3. **Check Copilot subscription:**
   ```bash
   gh copilot status
   
   # If not active, visit:
   # https://github.com/features/copilot
   ```

### GitHub API Rate Limit

**Symptom:** Commands fail with "rate limit exceeded"

**Diagnosis:**
```bash
# Check current rate limit status
gh api rate_limit
```

**Solutions:**
1. **Wait for reset:** Rate limits reset hourly
2. **Use authenticated requests:** `gh auth login` provides higher limits (5000/hour)
3. **Optimize commands:** Use `/gsd-verify-installation` sparingly

### Agent Timeout

**Symptom:** Agent invocation times out or hangs

**Diagnosis:**
```bash
# Check GitHub Copilot status
gh copilot status

# Check agent configuration
cat .github/agents/gsd-planner.md
```

**Solutions:**
1. **Check internet connection:** Agent execution requires GitHub API
2. **Verify authentication:** `gh auth status`
3. **Check GitHub status:** Visit [githubstatus.com](https://www.githubstatus.com/)
4. **Retry:** Transient API issues usually resolve quickly

For more troubleshooting, see [Troubleshooting Guide](troubleshooting.md).

## Next Steps

Now that GSD is installed, explore:

1. **Learn the differences:** Read [Implementation Differences](implementation-differences.md)
2. **Compare CLIs:** Check [CLI Comparison Matrix](cli-comparison.md)
3. **Add more CLIs:** Follow [Migration Guide](migration-guide.md) to add Claude or Codex
4. **Understand workflows:** Review GSD-STYLE.md in the repository

## Multi-CLI Setup

Want to use GSD with multiple CLIs? You can seamlessly switch:

```bash
# Add Claude Code to existing Copilot CLI project
cd your-project
npx get-shit-done-multi --claude

# State is shared automatically
cat .planning/STATE.md  # Shows same progress

# Switch between CLIs anytime
# In Copilot CLI: /gsd-plan-phase 1
# In Claude Code: /gsd-execute-plan 01-01

# Both see same .planning/ directory
```

See [Migration Guide](migration-guide.md) for details.

## Team Collaboration

### Onboarding New Team Members

When a new developer joins:

```bash
# 1. Clone repository
git clone <repo-url>
cd <project>

# 2. Verify GSD installation
/gsd-verify-installation

# 3. Start contributing
/gsd-verify-phase 1  # Check current phase status
```

GSD is automatically available - no separate installation needed!

### Version Control

**Commit these files:**
```
.github/
  skills/get-shit-done/
  agents/

.planning/
  PROJECT.md
  REQUIREMENTS.md
  ROADMAP.md
  STATE.md
  phases/
```

**Add to .gitignore:**
```
.planning/command-recordings/
.planning/metrics/
.planning/.session.json
```

## Questions?

If you encounter issues not covered here:

1. **Run verification:** `/gsd-verify-installation`
2. **Check troubleshooting:** [Troubleshooting Guide](troubleshooting.md)
3. **Review differences:** [Implementation Differences](implementation-differences.md)
4. **Compare CLIs:** [CLI Comparison Matrix](cli-comparison.md)

## Reference

- **GitHub Copilot CLI Documentation:** [gh copilot --help](https://cli.github.com/manual/gh_copilot)
- **GSD Style Guide:** [GSD-STYLE.md](../GSD-STYLE.md)
- **CLI Comparison:** [cli-comparison.md](cli-comparison.md)
- **Agent Capabilities:** [agent-capabilities.md](agent-capabilities.md)
