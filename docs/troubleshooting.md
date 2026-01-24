# Troubleshooting Guide

**Last updated:** 2026-01-24 (v1.9.1)

**Purpose:** Diagnose and fix common GSD installation and usage issues

**First check:** Tool requirements met (see [Prerequisites](#prerequisites))

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation Issues](#installation)
3. [Skill Discovery Issues](#discovery)
4. [Platform-Specific Issues](#platform)
5. [Generation Errors](#generation)
6. [Legacy Cleanup Issues](#legacy)

## Prerequisites {#prerequisites}

**Before troubleshooting, verify:**

```bash
# Node.js 16+ installed
node --version
# Expected: v16.x.x or higher

# npm installed
npm --version
# Expected: 8.x.x or higher

# Git installed
git --version
# Expected: git version 2.x.x

# At least one CLI installed
# Claude Code: Open Claude Code application
# Copilot CLI: gh copilot --version
# Codex CLI: codex --version
```

**If any prerequisite missing:**
- Node.js: Download from https://nodejs.org/
- Git: Download from https://git-scm.com/
- GitHub CLI (for Copilot): `brew install gh` or https://cli.github.com/
- Claude Code: Download from https://code.claude.com/
- Codex CLI: Follow installation at https://codex.dev/

## Installation Issues {#installation}

### Issue: Installation Hangs or Times Out

**Symptom:** `npm install -g get-shit-done-multi` never completes or times out.

**Diagnosis:**
```bash
# Check npm registry connection
npm ping

# Check npm config
npm config list
```

**Solutions by CLI:**

**All platforms:**
```bash
# Clear npm cache
npm cache clean --force

# Try with verbose logging
npm install -g get-shit-done-multi --verbose

# Use alternate registry if necessary
npm install -g get-shit-done-multi --registry https://registry.npmjs.org/
```

**Root Cause:**
- Network connectivity issues
- npm cache corruption
- Registry timeout

**Prevention:**
- Ensure stable internet connection during installation
- Run `npm cache clean --force` before large installations

### Issue: Permission Denied During Installation

**Symptom:** `EACCES: permission denied` errors during installation.

**Diagnosis:**
```bash
# Check npm prefix (where global packages install)
npm config get prefix

# Check ownership
ls -la $(npm config get prefix)
```

**Solutions by CLI:**

**Claude Code:**
```bash
# Option 1: Fix npm permissions (recommended)
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Then reinstall
npm install -g get-shit-done-multi
```

**GitHub Copilot CLI:**
```bash
# Option 2: Use npx (no global install)
npx get-shit-done-multi --copilot
```

**Codex CLI:**
```bash
# Option 3: Install as current user
npm install -g get-shit-done-multi --unsafe-perm
```

**Root Cause:**
- npm global directory owned by root
- Installing to system directory without sudo

**Prevention:**
- Configure npm to use user-owned directory for global packages
- Avoid using `sudo npm install -g`

### Issue: Skills Not Found After Installation

**Symptom:** Running `/gsd-new-project` shows "command not found" or "skill not recognized" after installing v1.9.1.

**Diagnosis:**
```bash
# Check if skills directory exists
ls -la ~/.claude/get-shit-done/.github/skills/ 2>/dev/null ||
ls -la .github/skills/get-shit-done/ 2>/dev/null ||
ls -la .codex/skills/get-shit-done/ 2>/dev/null

# Check if SKILL.md files are present
find ~ -name "gsd-*.md" -path "*skills*" 2>/dev/null | head -10

# Expected: 28 skill files
find ~ -name "gsd-*.md" -path "*skills*" 2>/dev/null | wc -l
```

**Solutions by CLI:**

**Claude Code:**
```bash
# Regenerate skills from specs
npm install -g get-shit-done-multi

# Verify installation
ls ~/.claude/get-shit-done/.github/skills/ | wc -l
# Expected: 28 files

# Restart Claude Code application
# Skills are cached, restart required after generation
```

**GitHub Copilot CLI:**
```bash
# Regenerate skills
npx get-shit-done-multi --copilot

# Reload skills registry
gh copilot reload

# Verify
gh copilot list-skills | grep gsd-
# Expected: 28 skills listed
```

**Codex CLI:**
```bash
# Regenerate skills
npx get-shit-done-multi --codex

# Verify skills loaded
codex skills list | grep "gsd-"
# Expected: 28 skills

# If not loaded, restart Codex CLI
codex restart
```

**Root Cause:**
- Skills not generated during installation (generation step failed silently)
- CLI hasn't refreshed skills registry since installation
- Installation path mismatch (global vs local, wrong home directory)

**Prevention:**
- Always run installation command appropriate for your CLI
- Restart CLI or run reload command after installation
- Verify with directory listing immediately after install

## Skill Discovery Issues {#discovery}

### Issue: Skill Exists But Not Invocable

**Symptom:** Skill file exists in directory but `/gsd-command` doesn't work.

**Diagnosis:**
```bash
# Verify skill file exists
test -f ~/.claude/get-shit-done/.github/skills/gsd-new-project.md && echo "✓ File exists"

# Check frontmatter is valid
head -20 ~/.claude/get-shit-done/.github/skills/gsd-new-project.md | grep "^name:"
# Expected: name: gsd-new-project

# Check file permissions
ls -l ~/.claude/get-shit-done/.github/skills/gsd-new-project.md
# Should be readable (r-- at minimum)
```

**Solutions by CLI:**

**Claude Code:**
```bash
# Verify skills directory path
echo $HOME/.claude/get-shit-done/.github/skills/
# Should exist

# Check Claude Code settings
cat ~/.claude/settings.json | grep skills
# Skills path should be configured

# Restart Claude Code
# (Skills loaded on startup)
```

**GitHub Copilot CLI:**
```bash
# Check skills path in Copilot config
gh copilot config get skills-path

# Verify skills are registered
gh copilot list-skills | grep gsd-new-project

# Force reload
gh copilot reload --force
```

**Codex CLI:**
```bash
# Check skills path
codex config show | grep skills

# List loaded skills
codex skills list --all | grep gsd-new-project

# Reload skills
codex skills reload
```

**Root Cause:**
- Invalid frontmatter preventing skill registration
- CLI skills cache not refreshed
- File permissions preventing read access

**Prevention:**
- Always verify frontmatter is valid YAML after manual edits
- Run reload command after manual skill modifications
- Ensure files are world-readable (chmod 644)

### Issue: Wrong Skill Version Loaded

**Symptom:** Skill behavior doesn't match expected (old version cached).

**Solutions by CLI:**

**Claude Code:**
```bash
# Clear Claude's skill cache
rm -rf ~/.claude/cache/skills/

# Reinstall
npm install -g get-shit-done-multi

# Restart Claude Code
```

**GitHub Copilot CLI:**
```bash
# Force reload with cache clear
gh copilot reload --clear-cache

# Verify version
gh copilot show-skill gsd-help | grep "gsdVersion"
# Expected: 1.9.1
```

**Codex CLI:**
```bash
# Clear skill cache
codex skills clear-cache

# Reload
codex skills reload

# Verify
codex show gsd-help | grep version
```

**Root Cause:**
- CLI cached old skill version
- Reinstallation didn't overwrite existing files

**Prevention:**
- Always run reload/restart after reinstallation
- Use `--force` flag during reinstalls

## Platform-Specific Issues {#platform}

### Claude Code Issues

#### Issue: Claude Code Not Finding Skills Directory

**Symptom:** Skills not discovered after installation to `~/.claude/get-shit-done/`.

**Diagnosis:**
```bash
# Check directory exists
ls -la ~/.claude/get-shit-done/.github/skills/

# Check Claude Code looks in this directory
cat ~/.claude/settings.json | jq '.skillsPaths'
```

**Solution:**
```bash
# Manually configure skills path (if not auto-detected)
# Edit ~/.claude/settings.json:
{
  "skillsPaths": [
    "$HOME/.claude/get-shit-done/.github/skills/"
  ]
}

# Restart Claude Code
```

#### Issue: Task Tool Not Working in Claude

**Symptom:** Orchestrator skills (gsd-new-project, gsd-execute-phase) fail when spawning subagents.

**Diagnosis:**
```bash
# Check agents directory exists
ls -la ~/.claude/get-shit-done/.github/agents/

# Check Task tool is allowed in Claude Code settings
cat ~/.claude/settings.json | jq '.allowedTools'
```

**Solution:**
```bash
# Ensure agents installed alongside skills
npm install -g get-shit-done-multi

# Verify
ls ~/.claude/get-shit-done/.github/agents/ | grep "gsd-"
# Expected: 11 agent files
```

### GitHub Copilot CLI Issues

#### Issue: gh copilot Command Not Found

**Symptom:** `gh copilot` command doesn't exist after installing GitHub CLI.

**Diagnosis:**
```bash
# Check GitHub CLI installed
gh --version

# Check Copilot extension installed
gh extension list | grep copilot
```

**Solution:**
```bash
# Install Copilot CLI extension
gh extension install github/gh-copilot

# Authenticate
gh auth login

# Verify
gh copilot --version
```

#### Issue: Copilot Skills Not Loading

**Symptom:** Skills exist in `.github/skills/get-shit-done/` but not invocable.

**Diagnosis:**
```bash
# Check skills directory structure
ls -la .github/skills/get-shit-done/

# List loaded skills
gh copilot list-skills
```

**Solution:**
```bash
# Reinstall to local directory
npx get-shit-done-multi --copilot

# Ensure in git repository (Copilot requires git context)
git init  # if not already a git repo

# Reload
gh copilot reload
```

### Codex CLI Issues

#### Issue: Codex CLI Not Installed

**Symptom:** `codex` command not found.

**Solution:**
```bash
# Install Codex CLI (platform-specific)
# macOS:
brew install codex-cli

# Linux:
curl -fsSL https://codex.dev/install.sh | sh

# Windows:
# Download from https://codex.dev/download/windows

# Verify
codex --version
```

#### Issue: Skills Not Loading in Codex

**Symptom:** Skills generated but Codex doesn't recognize them.

**Diagnosis:**
```bash
# Check skills directory
ls -la .codex/skills/get-shit-done/

# Check Codex config
codex config show
```

**Solution:**
```bash
# Regenerate with correct paths
npx get-shit-done-multi --codex

# Initialize Codex in project (if needed)
codex init

# Reload skills
codex skills reload
```

## Generation Errors {#generation}

### Issue: Template Rendering Error

**Symptom:** Installation shows "Error rendering template for skill X".

**Diagnosis:**
```bash
# Check spec file exists
ls specs/skills/gsd-X/SKILL.md

# Check for template syntax errors
grep "{{" specs/skills/gsd-X/SKILL.md
```

**Solution:**
- Verify all Mustache conditionals are closed
- Check: `{{#isClaude}}` has matching `{{/isClaude}}`
- Ensure no nested conditionals (not supported)
- Validate YAML frontmatter

### Issue: Tool Mapping Error

**Symptom:** Generated skill has invalid tool names for platform.

**Diagnosis:**
```bash
# Check generated file
cat ~/.claude/get-shit-done/.github/skills/gsd-X.md | grep "^tools:"
```

**Solution:**
- Use conditionals in spec, not in generated output
- Ensure platform conditionals cover all 3 platforms
- Don't manually edit generated files (edit spec instead)

## Legacy Cleanup Issues {#legacy}

### Issue: Legacy Commands Still Present After Upgrade

**Symptom:** Both old (`/gsd:`) and new (`/gsd-`) commands visible.

**Diagnosis:**
```bash
# Check for legacy directories
ls -la ~/.claude/commands/gsd/ 2>/dev/null && echo "Legacy found in Claude"
ls -la .github/copilot/commands/ 2>/dev/null && echo "Legacy found in Copilot"
ls -la .codex/commands/gsd/ 2>/dev/null && echo "Legacy found in Codex"
```

**Solution:**
```bash
# Run cleanup script
bash scripts/cleanup-legacy-commands.sh --dry-run
# Review what will be deleted

# Execute cleanup
bash scripts/cleanup-legacy-commands.sh
# Confirm when prompted
```

**Manual cleanup (if script unavailable):**
```bash
# Remove legacy directories
rm -rf ~/.claude/commands/gsd/
rm -rf .github/copilot/commands/
rm -rf .codex/commands/gsd/

# Restart CLI
```

### Issue: Cleanup Script Permission Denied

**Symptom:** Cleanup script fails with "Permission denied".

**Solution:**
```bash
# Make script executable
chmod +x scripts/cleanup-legacy-commands.sh

# Run with bash explicitly
bash scripts/cleanup-legacy-commands.sh
```

## Still Having Issues?

If issues persist after following this guide:

1. **Check version:** `npm list -g get-shit-done-multi` (should be v1.9.1+)
2. **Reinstall fresh:**
   ```bash
   npm uninstall -g get-shit-done-multi
   npm cache clean --force
   npm install -g get-shit-done-multi
   ```
3. **Check logs:** Installation logs show detailed errors
4. **File an issue:** https://github.com/shoootyou/get-shit-done-multi/issues

**Include in issue report:**
- GSD version (`npm list -g get-shit-done-multi`)
- Platform (Claude Code / Copilot CLI / Codex CLI)
- OS and version
- Error messages (full text)
- Steps to reproduce

## See Also

- [Migration Guide](./MIGRATION-GUIDE.md) - Creating new skills
- [Command Comparison](./COMMAND-COMPARISON.md) - Old vs new format
- [Skills README](../specs/skills/README.md) - Schema documentation
