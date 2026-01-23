# Migration Guide: Single-CLI to Multi-CLI

**Last updated:** 2026-01-19

This guide walks you through transitioning from using GSD (Get Shit Done) with a single CLI to using it with multiple CLIs, enabling seamless switching and resilience.

## Why Multi-CLI?

### Flexibility
- **Use the best tool for each task:** Claude Code for complex reasoning, Copilot CLI for GitHub integration, Codex CLI for OpenAI tooling
- **Switch freely:** Same project, different CLI, no state loss
- **Task-specific optimization:** Choose CLI based on current needs

### Resilience
- **Fallback options:** If one CLI is down, use another
- **API limits:** Switch CLIs if hitting rate limits
- **Cost management:** Balance usage across different APIs

### Learning
- **Compare approaches:** See how different models handle same task
- **Evaluate CLIs:** Test which CLI fits your workflow best
- **Future-proof:** Ready for new CLIs without disruption

### Real-world Benefits

**Example workflow:**
```bash
# Morning: Complex planning in Claude Code (best reasoning)
cd my-project
claude
/gsd-new-project

# Afternoon: Collaborative planning in Copilot CLI (GitHub integration)
gh copilot
/gsd-plan-phase 1

# Evening: Cost-conscious execution in Codex CLI (OpenAI pricing)
codex
/gsd-execute-plan 01-01

# All three CLIs see same .planning/ state!
```

## Current State Assessment

Before migrating, understand your current setup:

### Step 1: Verify current installation

```bash
# Run verification to see what's installed
/gsd-verify-installation

# Example output:
# ✅ Installation Verification Report
# 
# CLI Detection
# ✓ Claude Code installed (v1.2.0)
# ○ Copilot CLI not installed
# ○ Codex CLI not installed
```

### Step 2: Check which CLI you're using

```bash
# Check environment
echo $CLAUDE_CODE      # Set if in Claude Code
echo $COPILOT_CLI      # Set if in Copilot CLI
echo $CODEX_CLI        # Set if in Codex CLI

# Check .planning/ existence
ls -la .planning/

# If .planning/ exists, you have an active GSD project
```

### Step 3: Identify your goals

**Choose migration target:**

- **Add one additional CLI:** For specific use case (e.g., add Copilot for team work)
- **Add all CLIs:** For maximum flexibility
- **Replace current CLI:** Switch to different primary CLI

## Migration Paths

### Path A: Single-CLI → Dual-CLI

Most common path - add one additional CLI.

**Example: Claude Code → Claude Code + Copilot CLI**

```bash
# Current state: Using Claude Code
cd my-project
ls .claude/get-shit-done/  # ✓ Exists

# Add Copilot CLI
npx get-shit-done-multi --copilot

# Expected output:
# ✓ Detecting installed CLIs...
# ✓ Claude Code detected (existing installation)
# ✓ Copilot CLI detected
# ✓ Installing Copilot CLI skills to .github/skills/get-shit-done/
# ✓ Preserving existing .planning/ directory
# ✓ Installation complete!

# Verify both CLIs see same state
/gsd-verify-installation

# Expected output:
# CLI Detection
# ✓ Claude Code installed (v1.2.0)
# ✓ Copilot CLI installed (v1.5.0)
# 
# State Management
# ✓ Shared .planning/ directory
# ✓ Concurrent usage supported
```

### Path B: Single-CLI → Multi-CLI (All)

Install all three CLIs at once.

```bash
# Current state: Using any single CLI
cd my-project

# Add all CLIs simultaneously
npx get-shit-done-multi --all

# This installs:
# - Claude Code: .claude/get-shit-done/
# - Copilot CLI: .github/skills/get-shit-done/
# - Codex CLI: .codex/skills/get-shit-done/

# All share same .planning/ directory
```

### Path C: Replace Primary CLI

Switch from one CLI to another as primary, keeping old as fallback.

**Example: Copilot CLI → Claude Code (primary)**

```bash
# Current state: Using Copilot CLI
cd my-project
ls .github/skills/get-shit-done/  # ✓ Exists

# Add Claude Code
npx get-shit-done-multi --claude

# State preserved automatically
cat .planning/STATE.md  # Same progress

# Now use Claude Code as primary
claude
/gsd-plan-phase 2

# Copilot CLI still works as fallback
gh copilot
/gsd-verify-phase 1
```

## Migration Steps (Detailed)

### Step 1: Backup your current state

**Critical:** Always backup before making changes.

```bash
# Create timestamped backup
timestamp=$(date +%Y%m%d-%H%M%S)
cp -r .planning .planning-backup-$timestamp

# Verify backup
ls -la .planning-backup-$timestamp/

# Commit to version control
git add .planning .planning-backup-$timestamp
git commit -m "Backup before multi-CLI migration"
```

### Step 2: Install additional CLIs

Choose installation command based on your target:

**Add Claude Code:**
```bash
npx get-shit-done-multi --claude

# Installs to:
# - Global: ~/Library/Application Support/Claude/get-shit-done/ (macOS)
# - Local: .claude/get-shit-done/
```

**Add Copilot CLI:**
```bash
# Requires GitHub CLI installed and authenticated
gh auth login  # If not already authenticated

npx get-shit-done-multi --copilot

# Installs to:
# - Local only: .github/skills/get-shit-done/
```

**Add Codex CLI:**
```bash
# Requires OpenAI API key configured
export OPENAI_API_KEY="your-api-key"

npx get-shit-done-multi --codex

# Installs to:
# - Global: ~/.codex/skills/get-shit-done/
# - Local: .codex/skills/get-shit-done/
```

**Add all at once:**
```bash
# Ensure all CLIs are installed first:
# - claude --version
# - gh copilot --version
# - codex --version

npx get-shit-done-multi --all

# Installs GSD for all detected CLIs
```

### Step 3: Verify multi-CLI setup

```bash
# Run verification
/gsd-verify-installation

# Expected output for successful multi-CLI setup:
# ✅ Installation Verification Report
# 
# CLI Detection
# ✓ Claude Code installed (v1.2.0)
# ✓ Copilot CLI installed (v1.5.0)
# ✓ Codex CLI installed (v0.84.0)
# 
# Installation Paths
# ✓ Claude skills: .claude/get-shit-done/
# ✓ Copilot skills: .github/skills/get-shit-done/
# ✓ Codex skills: .codex/skills/get-shit-done/
# 
# State Management
# ✓ Shared .planning/ directory
# ✓ Directory locking enabled
# ✓ Concurrent usage supported
# ✓ Session persistence active
# 
# ✅ Multi-CLI setup complete!
```

### Step 4: Test CLI switching

```bash
# Test 1: Check state in different CLIs
# In Claude Code:
cat .planning/STATE.md

# In Copilot CLI:
cat .planning/STATE.md

# In Codex CLI:
cat .planning/STATE.md

# All should show identical content


# Test 2: Make a change in one CLI
# In Claude Code:
/gsd-new-project

# Switch to Copilot CLI - verify change visible:
gh copilot
cat .planning/PROJECT.md  # Shows project from Claude Code


# Test 3: Execute command in different CLI
# In Copilot CLI:
/gsd-plan-phase 1

# Switch to Codex CLI - verify plan exists:
codex
ls .planning/phases/01-*/01-01-PLAN.md
```

### Step 5: Configure CLI preferences (Optional)

Create `.planning/config.json` to customize behavior:

```json
{
  "cli": {
    "preference_order": ["claude", "copilot", "codex"],
    "fallback_enabled": true,
    "auto_switch_on_failure": true
  },
  "performance": {
    "lock_timeout_ms": 10000,
    "retry_attempts": 3
  },
  "features": {
    "session_persistence": true,
    "usage_tracking": true,
    "command_recording": true
  }
}
```

**Configuration options:**

- **preference_order:** Order to try CLIs for fallback
- **fallback_enabled:** Automatically try next CLI if current fails
- **auto_switch_on_failure:** Switch CLI on repeated failures
- **lock_timeout_ms:** How long to wait for directory lock
- **session_persistence:** Track active CLI session
- **usage_tracking:** Record usage metrics per CLI
- **command_recording:** Save command history

## Common Migration Scenarios

### Scenario 1: Team using Copilot, add Claude for solo work

**Goal:** Keep Copilot CLI for team collaboration, add Claude Code for personal projects.

```bash
# Team setup (already done):
.github/skills/get-shit-done/  # Committed to repo

# Add Claude Code locally:
npx get-shit-done-multi --claude

# Result:
# - Team: Uses Copilot CLI (via .github/)
# - You: Can use Claude Code for faster iteration
# - Both share .planning/ - no conflicts
```

### Scenario 2: Using Claude globally, add local Copilot for one project

**Goal:** Keep global Claude Code, add project-specific Copilot.

```bash
# Global Claude Code (already installed):
ls ~/Library/Application\ Support/Claude/get-shit-done/

# Add Copilot CLI to project:
cd special-project
npx get-shit-done-multi --copilot

# Result:
# - Global Claude Code: Available in all projects
# - Local Copilot CLI: Only in special-project
# - This project: Can use both
```

### Scenario 3: Migrating from Codex to Claude as primary

**Goal:** Switch to Claude Code but keep Codex as fallback.

```bash
# Current: Codex CLI
ls .codex/skills/get-shit-done/

# Add Claude Code:
npx get-shit-done-multi --claude

# Update preference in .planning/config.json:
{
  "cli": {
    "preference_order": ["claude", "codex"]
  }
}

# Result:
# - Primary: Claude Code (faster, better reasoning)
# - Fallback: Codex CLI (if Claude unavailable)
```

## Troubleshooting Migration

### Issue: CLIs see different state

**Symptom:** Changes in one CLI not visible in another

**Diagnosis:**
```bash
# Check .planning/ directory exists
ls -la .planning/

# Check directory is shared
# All CLIs should use same physical directory

# Check for lock conflicts
ls -la .planning/.lock
```

**Solution:**
```bash
# Ensure all CLIs point to same directory
# GSD does this automatically

# If using symlinks, verify they're not broken
ls -la | grep planning

# Remove lock if stale
rm -rf .planning/.lock
```

### Issue: Permission errors after adding CLI

**Symptom:** New CLI can't write to `.planning/`

**Diagnosis:**
```bash
# Check permissions
ls -la .planning/

# Check ownership
ls -l .planning/
```

**Solution:**
```bash
# Fix permissions
chmod -R 755 .planning/

# Fix ownership (replace user:group)
chown -R $USER:$USER .planning/
```

### Issue: Commands not available after installation

**Symptom:** New CLI doesn't recognize `/gsd-*` commands

**Diagnosis:**
```bash
# Run verification
/gsd-verify-installation

# Check specific CLI installation
# Claude:
ls .claude/get-shit-done/

# Copilot:
ls .github/skills/get-shit-done/

# Codex:
ls .codex/skills/get-shit-done/
```

**Solution:**
```bash
# Reload skills per CLI:

# Claude Code:
# Restart Claude Code application

# Copilot CLI:
gh copilot reload

# Codex CLI:
codex skills reload

# Verify again:
/gsd-verify-installation
```

### Issue: State corruption during migration

**Symptom:** `.planning/STATE.md` unreadable after adding CLI

**Diagnosis:**
```bash
# Check if STATE.md is valid
cat .planning/STATE.md

# Check for backup
ls .planning/.backup/
```

**Solution:**
```bash
# Restore from backup created in Step 1
cp -r .planning-backup-*/. .planning/

# Or restore from version control
git checkout HEAD -- .planning/

# Verify state restored
cat .planning/STATE.md
```

## Rollback Migration

If migration causes issues, rollback to single-CLI setup:

### Rollback to original CLI

```bash
# 1. Restore .planning/ backup
cp -r .planning-backup-*/. .planning/

# 2. Remove newly installed CLIs

# Remove Claude Code:
rm -rf .claude/get-shit-done/
rm -rf ~/Library/Application\ Support/Claude/get-shit-done/

# Remove Copilot CLI:
rm -rf .github/skills/get-shit-done/

# Remove Codex CLI:
rm -rf .codex/skills/get-shit-done/
rm -rf ~/.codex/skills/get-shit-done/

# 3. Verify original CLI still works
/gsd-verify-installation
```

## Best Practices

### Version Synchronization

**Keep all CLIs on same GSD version:**

```bash
# Check versions across CLIs
grep version .claude/get-shit-done/package.json
grep version .github/skills/get-shit-done/package.json
grep version .codex/skills/get-shit-done/package.json

# If versions differ, upgrade all:
npx get-shit-done-multi --all --upgrade
```

### Git Ignore Configuration

**Update `.gitignore` for multi-CLI:**

```gitignore
# GSD runtime files (don't commit)
.planning/command-recordings/
.planning/metrics/
.planning/.session.json
.planning/.lock
.planning/.backup/

# GSD core files (commit these)
# .planning/PROJECT.md
# .planning/REQUIREMENTS.md
# .planning/ROADMAP.md
# .planning/STATE.md
# .planning/phases/

# CLI installations (depends on team setup)
# .claude/          # Commit if team uses Claude
.github/            # Usually commit for Copilot
# .codex/           # Commit if team uses Codex
```

### Team Coordination

**Communicate multi-CLI setup to team:**

1. **Document in README:**
   ```markdown
   ## GSD Multi-CLI Setup
   
   This project uses GSD with multiple CLIs:
   - Primary: Copilot CLI (team collaboration)
   - Optional: Claude Code (solo work)
   - Optional: Codex CLI (OpenAI integration)
   
   Install all: `npx get-shit-done-multi --all`
   ```

2. **Add verification to CI:**
   ```yaml
   # .github/workflows/verify-gsd.yml
   - name: Verify GSD installation
     run: /gsd-verify-installation
   ```

3. **Create onboarding guide:**
   - Link to setup guides
   - Explain CLI preference order
   - Show example workflows

### Cost Optimization

**Balance CLI usage for cost efficiency:**

```bash
# Track usage per CLI
cat .planning/metrics/usage-tracking.json

# Export for analysis
node lib-ghcc/state/usage-tracking.js export > usage.csv

# Open in spreadsheet to see:
# - Cost per CLI
# - Commands per CLI
# - Token usage per CLI

# Adjust preference order based on cost:
# Example: Use Codex (cheaper) for execution,
#          Claude (better) for planning
```

## Next Steps

After successful migration:

1. **Experiment with CLI switching:**
   - Try same command in different CLIs
   - Compare results and performance
   - Find your preferred workflow

2. **Set up fallback configuration:**
   - Configure `preference_order` in `.planning/config.json`
   - Test automatic fallback

3. **Monitor usage:**
   - Check `.planning/metrics/` periodically
   - Optimize CLI choice based on data

4. **Share experience:**
   - Document what works for your team
   - Update preferences as you learn

## Reference

- **Setup Guides:** [setup-claude-code.md](setup-claude-code.md), [setup-copilot-cli.md](setup-copilot-cli.md), [setup-codex-cli.md](setup-codex-cli.md)
- **Troubleshooting:** [troubleshooting.md](troubleshooting.md)
- **Implementation Differences:** [implementation-differences.md](implementation-differences.md)
- **CLI Comparison:** [cli-comparison.md](cli-comparison.md)

## Questions?

If you encounter issues during migration:

1. **Run verification:** `/gsd-verify-installation`
2. **Check troubleshooting:** [troubleshooting.md](troubleshooting.md)
3. **Restore backup:** From Step 1 backup
4. **Review setup guides:** Ensure each CLI installed correctly
