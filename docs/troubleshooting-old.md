# Troubleshooting Guide

**Last updated:** 2026-01-19

This guide helps you diagnose and resolve common issues when using GSD (Get Shit Done) across Claude Code, GitHub Copilot CLI, and Codex CLI.

## Quick Navigation by Symptom

| Symptom | CLI | Section |
|---------|-----|---------|
| Command not found | All | [Installation Issues](#installation-issues) |
| Permission denied | All | [Permission Issues](#permission-issues) |
| Skill not detected | Claude Code | [Claude Code Issues](#claude-code-issues) |
| GitHub auth failed | Copilot CLI | [Copilot CLI Issues](#copilot-cli-issues) |
| API key not configured | Codex CLI | [Codex CLI Issues](#codex-cli-issues) |
| Agent timeout | All | [Agent Issues](#agent-issues) |
| State corruption | All | [State Management Issues](#state-management-issues) |
| Concurrent CLI conflict | All | [State Management Issues](#state-management-issues) |
| Directory lock timeout | All | [State Management Issues](#state-management-issues) |

## Installation Issues

### Command not found

**Symptom:** Running `/gsd-new-project` shows "command not found" or "skill not recognized"

**Diagnosis:**
```bash
# Run verification to diagnose issue
/gsd-verify-installation

# Expected output will show what's missing:
# ✗ Skills not found
# ✗ Commands not registered
```

**Solutions by CLI:**

**Claude Code:**
```bash
# 1. Check if installed
ls -la .claude/get-shit-done/

# 2. If missing, install
npx get-shit-done-multi --claude

# 3. Restart Claude Code to refresh skills
# (Skills are cached by Claude Code runtime)

# 4. Verify
/gsd-verify-installation
```

**Copilot CLI:**
```bash
# 1. Check if installed
ls -la .github/skills/get-shit-done/

# 2. If missing, install
npx get-shit-done-multi --copilot

# 3. Reload skills
gh copilot reload

# 4. Verify
/gsd-verify-installation
```

**Codex CLI:**
```bash
# 1. Check if installed
ls -la .codex/skills/get-shit-done/

# 2. If missing, install
npx get-shit-done-multi --codex

# 3. Reload skills
codex skills reload

# 4. Verify
/gsd-verify-installation
```

**Root Cause:**
- Skills not installed in expected directory
- CLI hasn't refreshed skill registry
- Incorrect installation path (global vs local)

**Prevention:**
- Always run `/gsd-verify-installation` after installation
- Restart CLI or reload skills after installation
- Use consistent installation method (global vs local)

### Installation path incorrect

**Symptom:** Installation succeeds but commands not available

**Diagnosis:**
```bash
# Check all possible installation paths

# Claude Code
ls ~/.claude/get-shit-done/  # Global (macOS)
ls .claude/get-shit-done/    # Local

# Copilot CLI
ls .github/skills/get-shit-done/  # Local only

# Codex CLI
ls ~/.codex/skills/get-shit-done/  # Global
ls .codex/skills/get-shit-done/    # Local
```

**Solutions:**

1. **Determine intended installation type:**
   ```bash
   # For global: Affects all projects
   npx get-shit-done-multi --claude  # Installs globally by default
   
   # For local: Project-specific
   npx get-shit-done-multi --claude --local
   ```

2. **Remove incorrect installation:**
   ```bash
   # Remove global
   rm -rf ~/.claude/get-shit-done/
   
   # Remove local
   rm -rf .claude/get-shit-done/
   ```

3. **Reinstall correctly:**
   ```bash
   # Follow setup guide for your CLI:
   # - setup-claude-code.md
   # - setup-copilot-cli.md
   # - setup-codex-cli.md
   ```

**Root Cause:**
- CLI expected global but found local (or vice versa)
- Mixed installations confusing CLI

**Prevention:**
- Decide on global vs local before installing
- Document team's preferred installation method
- Use `/gsd-verify-installation` to confirm correct path

## Permission Issues

### Permission denied on macOS

**Symptom:** "Permission denied" errors when running GSD commands

**Diagnosis:**
```bash
# Check file permissions
ls -la .claude/get-shit-done/
ls -la ~/.claude/get-shit-done/

# Check if macOS Gatekeeper is blocking
# System Preferences → Security & Privacy → General
# Look for blocked application messages
```

**Solutions:**

1. **Fix file permissions:**
   ```bash
   chmod -R 755 .claude/get-shit-done/
   chmod -R 755 ~/.claude/get-shit-done/
   ```

2. **Grant Full Disk Access (macOS):**
   - Open System Preferences → Security & Privacy
   - Click "Privacy" tab
   - Select "Full Disk Access" from left sidebar
   - Click lock icon to make changes
   - Add Claude Code, Terminal, or your CLI application
   - Restart application

3. **Bypass Gatekeeper for specific files:**
   ```bash
   xattr -r -d com.apple.quarantine .claude/get-shit-done/
   ```

**Root Cause:**
- macOS Gatekeeper quarantines downloaded files
- CLI application lacks disk access permissions
- Incorrect file ownership or permissions

**Prevention:**
- Grant Full Disk Access during CLI setup
- Install CLI via official channels (reduces quarantine)
- Run `chmod` after installation as precaution

### Permission denied on Windows

**Symptom:** "Access denied" or "Permission denied" on Windows

**Diagnosis:**
```bash
# Check if files are read-only
attrib %APPDATA%\Claude\get-shit-done\*

# Check if antivirus is blocking
# Review Windows Defender logs in Event Viewer
```

**Solutions:**

1. **Remove read-only flag:**
   ```cmd
   attrib -r %APPDATA%\Claude\get-shit-done\* /s
   ```

2. **Run as Administrator:**
   - Right-click CLI application
   - Select "Run as Administrator"
   - Try installation again

3. **Add exclusion to Windows Defender:**
   - Windows Security → Virus & threat protection
   - Manage settings → Exclusions
   - Add folder: `%APPDATA%\Claude\get-shit-done\`

**Root Cause:**
- Files marked read-only
- Antivirus blocking file modifications
- Insufficient user permissions

**Prevention:**
- Install with administrator privileges
- Add GSD paths to antivirus exclusions
- Ensure user has write access to installation paths

### Permission denied on Linux

**Symptom:** Permission errors on Linux systems

**Diagnosis:**
```bash
# Check ownership and permissions
ls -la ~/.config/claude/get-shit-done/
ls -la .claude/get-shit-done/

# Check SELinux status (if applicable)
getenforce
```

**Solutions:**

1. **Fix ownership:**
   ```bash
   sudo chown -R $USER:$USER ~/.config/claude/get-shit-done/
   ```

2. **Fix permissions:**
   ```bash
   chmod -R 755 ~/.config/claude/get-shit-done/
   ```

3. **SELinux issues:**
   ```bash
   # Check SELinux context
   ls -Z ~/.config/claude/

   # Restore default context
   restorecon -R ~/.config/claude/get-shit-done/
   ```

**Root Cause:**
- Incorrect file ownership (files owned by root)
- Restrictive file permissions
- SELinux preventing access

**Prevention:**
- Install without `sudo` when possible
- Ensure consistent user ownership
- Configure SELinux policies if needed

## CLI-Specific Issues

### Claude Code Issues

#### Skill not loading

**Symptom:** Skills installed but not recognized by Claude Code

**Diagnosis:**
```bash
# Check skill directory exists
ls -la .claude/get-shit-done/

# Check skill manifest
cat .claude/get-shit-done/skill.json 2>/dev/null || \
cat .claude/get-shit-done/package.json 2>/dev/null
```

**Solutions:**

1. **Restart Claude Code:**
   - Claude Code caches skill registry
   - Restart forces refresh

2. **Clear skill cache:**
   ```bash
   # Remove cache (path varies by OS)
   rm -rf ~/Library/Caches/Claude/skills/  # macOS
   rm -rf $XDG_CACHE_HOME/claude/skills/   # Linux
   rm -rf %TEMP%\Claude\skills\            # Windows
   ```

3. **Reinstall skills:**
   ```bash
   rm -rf .claude/get-shit-done/
   npx get-shit-done-multi --claude
   ```

**Root Cause:**
- Stale skill cache in Claude Code
- Corrupted skill manifest
- Installation interrupted mid-process

**Prevention:**
- Always restart Claude Code after skill installation
- Monitor installation output for errors
- Use `/gsd-verify-installation` to confirm

#### Path resolution errors on Windows

**Symptom:** Commands fail with "path not found" on Windows

**Diagnosis:**
```bash
# Check for mixed path separators
grep -r "\\/" .claude/get-shit-done/  # Mixed separators

# Check path format in commands
cat .claude/get-shit-done/commands/gsd/new-project.md
```

**Solutions:**

1. **GSD handles automatically:**
   - All GSD code uses `path.join()` for cross-platform compatibility
   - If errors persist, it's likely external to GSD

2. **Check project paths:**
   ```bash
   # Ensure project paths don't have special characters
   # Windows doesn't handle: < > : " | ? *
   ```

3. **Use forward slashes in config:**
   ```json
   // .planning/config.json
   {
     "paths": {
       "planning": ".planning",  // Use forward slashes
       "phases": ".planning/phases"
     }
   }
   ```

**Root Cause:**
- Windows uses backslashes, POSIX uses forward slashes
- Some tools don't handle mixed separators
- Special characters in paths

**Prevention:**
- GSD handles path normalization automatically
- Avoid special characters in project paths
- Use forward slashes in configuration files

#### Agent delegation failures

**Symptom:** Agent fails to spawn sub-agents

**Diagnosis:**
```bash
# Check agent configuration
cat .claude/agents/gsd-executor.md

# Check Claude Code agent runtime status
# (No public API - check Claude Code logs)
```

**Solutions:**

1. **Verify native agent support:**
   ```bash
   /gsd-verify-installation
   # Should show: ✓ Native agent support available
   ```

2. **Check Claude Code version:**
   ```bash
   claude --version
   # Requires v1.0.0+ for agent delegation
   ```

3. **Reduce agent depth:**
   - If agent chain is very deep (>3 levels)
   - Claude Code may timeout
   - Break into smaller tasks

**Root Cause:**
- Claude Code version too old
- Agent recursion too deep
- Claude API timeout

**Prevention:**
- Keep Claude Code updated
- Limit agent delegation depth
- Use `/gsd-verify-installation` to check support

### Copilot CLI Issues

#### GitHub authentication required

**Symptom:** Commands fail with authentication errors

**Diagnosis:**
```bash
# Check GitHub CLI authentication
gh auth status

# Expected output:
# ✓ Logged in to github.com as USERNAME
# ✓ Git operations for github.com configured
```

**Solutions:**

1. **Authenticate GitHub CLI:**
   ```bash
   gh auth login
   # Follow interactive prompts
   ```

2. **Refresh token:**
   ```bash
   gh auth refresh
   ```

3. **Check scopes:**
   ```bash
   gh auth status
   # Ensure required scopes are granted:
   # - repo (for repository access)
   # - read:org (for org features)
   ```

**Root Cause:**
- Not authenticated with GitHub CLI
- Token expired
- Insufficient scopes

**Prevention:**
- Run `gh auth login` during initial setup
- Use `gh auth refresh` periodically
- Grant all requested scopes during auth

#### Skill refresh needed

**Symptom:** Newly installed skills not recognized

**Diagnosis:**
```bash
# Check skills are installed
ls .github/skills/get-shit-done/

# Check GitHub CLI extensions
gh extension list
```

**Solutions:**

1. **Reload skills:**
   ```bash
   gh copilot reload
   ```

2. **Restart GitHub CLI:**
   ```bash
   # Exit and restart CLI session
   ```

3. **Reinstall Copilot extension:**
   ```bash
   gh extension remove github/gh-copilot
   gh extension install github/gh-copilot
   ```

**Root Cause:**
- Copilot CLI skill cache not refreshed
- GitHub CLI extension issue

**Prevention:**
- Run `gh copilot reload` after installing skills
- Keep GitHub CLI updated (`gh upgrade`)

#### Custom agent not recognized

**Symptom:** GSD agents not found by Copilot CLI

**Diagnosis:**
```bash
# Check agents directory
ls -la .github/agents/

# Verify agent file format
head -20 .github/agents/gsd-executor.md
```

**Solutions:**

1. **Verify agent structure:**
   ```bash
   # Agents must have proper frontmatter
   cat .github/agents/gsd-executor.md
   # Should start with:
   # ---
   # name: gsd-executor
   # description: ...
   # ---
   ```

2. **Reload GitHub Copilot:**
   ```bash
   gh copilot reload
   ```

3. **Check Copilot version:**
   ```bash
   gh extension list
   # Ensure github/gh-copilot is latest version
   
   gh extension upgrade github/gh-copilot
   ```

**Root Cause:**
- Incorrect agent file format
- Agent cache not refreshed
- Copilot CLI version too old

**Prevention:**
- Don't manually modify agent files
- Run `gh copilot reload` after installation
- Keep Copilot CLI extension updated

### Codex CLI Issues

#### Skill registration

**Symptom:** Skills installed but not available

**Diagnosis:**
```bash
# Check skills directory
ls -la .codex/skills/get-shit-done/

# Check prompts directory
ls -la .codex/prompts/

# Check Codex CLI skills list
codex skills list
```

**Solutions:**

1. **Reload skills:**
   ```bash
   codex skills reload
   ```

2. **Verify skill structure:**
   ```bash
   # Check skill manifest exists
   cat .codex/skills/get-shit-done/skill.yaml
   ```

3. **Regenerate prompts:**
   ```bash
   # Remove old prompts
   rm -rf .codex/prompts/*
   
   # Reinstall to regenerate
   npx get-shit-done-multi --codex
   ```

**Root Cause:**
- Skill registry not refreshed
- Missing or malformed skill manifest
- Prompts not generated

**Prevention:**
- Run `codex skills reload` after installation
- Don't manually modify skill manifests
- Verify prompts exist in `.codex/prompts/`

#### Prompt directory setup

**Symptom:** Prompts not found or empty directory

**Diagnosis:**
```bash
# Check prompts directory
ls -la .codex/prompts/

# Check prompt file content
cat .codex/prompts/new-project.txt
```

**Solutions:**

1. **Create prompts directory:**
   ```bash
   mkdir -p .codex/prompts
   ```

2. **Reinstall to regenerate prompts:**
   ```bash
   npx get-shit-done-multi --codex
   ```

3. **Verify Codex CLI config:**
   ```bash
   codex config list
   # Check prompts_dir setting
   ```

**Root Cause:**
- Prompts directory not created
- Installation didn't complete
- Codex CLI misconfigured

**Prevention:**
- Let installer create directory automatically
- Don't manually create `.codex/` structure
- Run `/gsd-verify-installation` after setup

#### OpenAI API configuration

**Symptom:** "API key not configured" or "401 Unauthorized"

**Diagnosis:**
```bash
# Check environment variable
echo $OPENAI_API_KEY

# Check Codex CLI configuration
codex config list

# Test API connection
codex auth status
```

**Solutions:**

1. **Set API key via environment:**
   ```bash
   export OPENAI_API_KEY="your-api-key-here"
   
   # Make permanent (add to shell profile)
   echo 'export OPENAI_API_KEY="your-api-key"' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **Set API key via Codex CLI:**
   ```bash
   codex config set api_key "your-api-key-here"
   ```

3. **Verify key is valid:**
   ```bash
   curl https://api.openai.com/v1/models \
     -H "Authorization: Bearer $OPENAI_API_KEY"
   ```

**Root Cause:**
- API key not set
- API key invalid or revoked
- Environment variable not exported

**Prevention:**
- Set API key during Codex CLI setup
- Add to shell profile for persistence
- Verify key works before using GSD

## Agent Issues

### Agent timeout

**Symptom:** Agent invocation hangs or times out

**Diagnosis:**
```bash
# Check which CLI you're using
/gsd-verify-installation

# Test agent directly (example for executor)
# Via CLI command interface
```

**Solutions by CLI:**

**Claude Code:**
```bash
# 1. Check Claude API status
# Visit: status.anthropic.com

# 2. Check internet connection
ping anthropic.com

# 3. Reduce prompt size
# Use .gsdignore to exclude large directories

# 4. Verify authentication
claude whoami
```

**Copilot CLI:**
```bash
# 1. Check GitHub status
# Visit: githubstatus.com

# 2. Check authentication
gh auth status

# 3. Check rate limits
gh api rate_limit

# 4. Retry
# Transient API issues usually resolve quickly
```

**Codex CLI:**
```bash
# 1. Check OpenAI status
# Visit: status.openai.com

# 2. Check API key
codex auth status

# 3. Try different model
# Edit .codex/config.yaml
# model: gpt-4-turbo  # Faster than gpt-4

# 4. Reduce timeout
codex config set timeout 30
```

**Root Cause:**
- API service degradation
- Network connectivity issues
- Large prompts causing timeout
- Rate limiting

**Prevention:**
- Monitor service status pages
- Use `.gsdignore` to limit context size
- Configure appropriate timeouts
- Implement retry logic (GSD does this automatically)

### Agent produces incorrect output

**Symptom:** Agent completes but output is wrong

**Diagnosis:**
```bash
# Check agent logs (if available)
ls .planning/command-recordings/

# Review last command recording
cat .planning/command-recordings/latest.json

# Check agent prompt
# (Varies by CLI)
```

**Solutions:**

1. **Verify agent configuration:**
   ```bash
   # Check agent file hasn't been modified
   git diff .claude/agents/gsd-planner.md
   git diff .github/agents/gsd-planner.md
   git diff .codex/skills/get-shit-done/agents/gsd-planner.md
   ```

2. **Reinstall if modified:**
   ```bash
   npx get-shit-done-multi --claude --force  # Overwrites existing
   ```

3. **Check input quality:**
   - Vague requirements produce vague plans
   - Provide specific, detailed requirements
   - Review PROJECT.md and REQUIREMENTS.md

4. **Try different CLI:**
   ```bash
   # Different models may produce better results
   # Claude Code → GPT-4 (Copilot) → GPT-4/o1 (Codex)
   ```

**Root Cause:**
- Insufficient or vague input
- Modified agent configuration
- Model limitations for specific task
- Bug in agent prompt

**Prevention:**
- Provide detailed requirements upfront
- Don't manually modify agent files
- Use appropriate CLI for task complexity
- Report consistent issues as bugs

## State Management Issues

### Concurrent CLI usage conflicts

**Symptom:** "Directory lock timeout" or state corruption

**Diagnosis:**
```bash
# Check for lock directory
ls -la .planning/.lock

# Check lock age
stat .planning/.lock

# Check which CLI created lock
cat .planning/.meta.json | grep lastCLI
```

**Solutions:**

1. **Wait for lock to release:**
   - GSD uses 10-second timeout by default
   - Other CLI operation may be in progress

2. **Remove stale lock:**
   ```bash
   # Only if you're certain no CLI is running
   rm -rf .planning/.lock
   ```

3. **Check for zombie processes:**
   ```bash
   # macOS/Linux
   ps aux | grep -E "(claude|gh|codex)"
   
   # Kill if necessary
   kill -9 <PID>
   ```

**Root Cause:**
- Two CLIs trying to modify state simultaneously
- CLI crashed while holding lock
- Lock timeout too short for operation

**Prevention:**
- Let one CLI complete before switching
- GSD handles locking automatically
- Don't force-kill CLI processes

### `.planning/` directory corruption

**Symptom:** Invalid JSON or missing STATE.md file

**Diagnosis:**
```bash
# Check STATE.md exists and is valid
cat .planning/STATE.md

# Check for JSON parse errors
node -e "console.log(JSON.parse(require('fs').readFileSync('.planning/.session.json')))"

# Run state validation
/gsd-verify-installation
# Look for state validation errors
```

**Solutions:**

1. **Restore from backup:**
   ```bash
   # Check if backup exists
   ls .planning/.backup/
   
   # Restore latest backup
   cp .planning/.backup/STATE.md.* .planning/STATE.md
   ```

2. **Recreate STATE.md:**
   ```bash
   # If no backup, recreate from scratch
   /gsd-new-project
   # This initializes new .planning/ directory
   ```

3. **Use state repair tool:**
   ```bash
   # GSD includes state validator
   node lib-ghcc/state/state-validator.js \
     --dir .planning \
     --repair \
     --auto-fix
   ```

**Root Cause:**
- Disk full during write operation
- Process killed during state update
- Manual editing of state files
- Filesystem corruption

**Prevention:**
- Never manually edit `.planning/` files
- Let GSD handle all state modifications
- Ensure sufficient disk space
- Use version control for state files

### State migration failures

**Symptom:** "Migration failed" when upgrading GSD

**Diagnosis:**
```bash
# Check current state version
cat .planning/.meta.json | grep version

# Check for migration errors
cat .planning/.backup/migration.log 2>/dev/null
```

**Solutions:**

1. **Restore pre-migration backup:**
   ```bash
   # Automatic backup created before migration
   ls .planning/.backup/pre-migration-*
   
   # Restore if needed
   cp -r .planning/.backup/pre-migration-*/* .planning/
   ```

2. **Manual migration:**
   ```bash
   # Run migration tool directly
   node lib-ghcc/state/state-manager.js migrate \
     --from <old-version> \
     --to <new-version>
   ```

3. **Fresh start:**
   ```bash
   # Last resort: backup .planning/ and recreate
   mv .planning .planning.old
   /gsd-new-project
   # Manually copy important data from .planning.old
   ```

**Root Cause:**
- Breaking changes in state format
- Migration script bug
- Corrupted state before migration

**Prevention:**
- Always backup `.planning/` before upgrading
- GSD creates automatic backups during migration
- Test upgrades in separate branch first

## Advanced Troubleshooting

### Enable debug logging

```bash
# Set debug environment variable
export GSD_DEBUG=1

# Run command with debug output
/gsd-new-project

# Debug logs written to:
.planning/debug.log
```

### Collect diagnostic information

```bash
# Run full diagnostic report
/gsd-verify-installation > diagnostic-report.txt

# Include system information
echo "--- System Info ---" >> diagnostic-report.txt
uname -a >> diagnostic-report.txt
node --version >> diagnostic-report.txt
npm --version >> diagnostic-report.txt

# Include CLI versions
echo "--- CLI Versions ---" >> diagnostic-report.txt
claude --version 2>&1 >> diagnostic-report.txt
gh --version 2>&1 >> diagnostic-report.txt
codex --version 2>&1 >> diagnostic-report.txt
```

### Check known issues

Before reporting issues:

1. **Check CHANGELOG.md** for known issues in current version
2. **Search GitHub issues:** (When repo is public)
3. **Check CLI status pages:**
   - Claude: [status.anthropic.com](https://status.anthropic.com/)
   - GitHub: [githubstatus.com](https://www.githubstatus.com/)
   - OpenAI: [status.openai.com](https://status.openai.com/)

## Getting Help

If issues persist after following this guide:

1. **Run full verification:**
   ```bash
   /gsd-verify-installation
   ```

2. **Review setup guides:**
   - [Claude Code Setup](setup-claude-code.md)
   - [Copilot CLI Setup](setup-copilot-cli.md)
   - [Codex CLI Setup](setup-codex-cli.md)

3. **Check implementation differences:**
   - [Implementation Differences](implementation-differences.md)

4. **Review migration guide:**
   - [Migration Guide](migration-guide.md)

## Reference

- **Setup Guides:** [setup-claude-code.md](setup-claude-code.md), [setup-copilot-cli.md](setup-copilot-cli.md), [setup-codex-cli.md](setup-codex-cli.md)
- **Implementation Differences:** [implementation-differences.md](implementation-differences.md)
- **CLI Comparison:** [cli-comparison.md](cli-comparison.md)
- **Migration Guide:** [migration-guide.md](migration-guide.md)
