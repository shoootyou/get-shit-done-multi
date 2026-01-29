# Troubleshooting

This guide covers common issues you may encounter when installing, upgrading, or using GSD.

Each issue includes:

- **Problem:** Exact error message or symptom
- **Symptoms:** How you experience the issue
- **Cause:** Why it happens
- **Solutions:** Ranked from best to worst

---

## Installation Issues

### 1. Error: Permission denied (EACCES)

**Problem:**

```plaintext
Error: EACCES: permission denied, mkdir '~/.claude/skills'
```

**Symptoms:**

- Installation fails immediately
- Cannot create directories in home folder
- Cannot write files to target location

**Cause:**

- No write permissions to target directory
- Directory owned by different user
- System restrictions (corporate machines, restricted accounts)

**Solutions:**

1. **Use local installation (recommended):**

   ```bash
   npx get-shit-done-multi --local --yes

```plaintext

   This installs to current directory where you likely have permissions.

2. **Fix directory permissions:**

   ```bash
   # Fix permissions for your user
   chmod -R u+w ~/.claude/
   chmod -R u+w ~/.copilot/
   chmod -R u+w ~/.codex/
   
   # Then retry installation
   npx get-shit-done-multi
   ```

1. **Create directories manually:**

   ```bash
   # Create the directories first
   mkdir -p ~/.claude/skills ~/.claude/agents ~/.claude/get-shit-done
   
   # Fix ownership
   sudo chown -R $USER ~/.claude/
   
   # Then install
   npx get-shit-done-multi --claude --global

```plaintext

4. **Use sudo (not recommended):**

   ```bash
   sudo npx get-shit-done-multi --global
   ```

   This can create permission issues later. Avoid unless necessary.

---

### 2. Error: Insufficient disk space

**Problem:**

```plaintext
Error: Pre-flight validation failed: Insufficient disk space
Required: 2MB, Available: 0.5MB
```

**Symptoms:**

- Installation fails before copying files
- Pre-flight validation shows disk space error
- System disk is full or nearly full

**Cause:**

- Less than 2MB available on target disk
- Disk quota exceeded
- Temporary files filling disk

**Solutions:**

1. **Free up disk space:**

   ```bash
   # Check disk usage
   df -h
   
   # Find large files
   du -sh ~/* | sort -h
   
   # Remove unnecessary files

```plaintext

2. **Install to different location with more space:**

   ```bash
   # If home disk is full, install locally to project
   cd /path/to/project/with/space
   npx get-shit-done-multi --local
   ```

1. **Use external drive or different partition:**

   ```bash
   # Create symlink from home to external drive
   mkdir -p /Volumes/External/.claude
   ln -s /Volumes/External/.claude ~/.claude
   
   # Then install normally
   npx get-shit-done-multi --claude --global

```plaintext

---

### 3. Error: Platform not detected

**Problem:**

```

Error: No AI platforms detected
Please install Claude Code, GitHub Copilot CLI, or Codex CLI first

```plaintext

**Symptoms:**

- Interactive mode shows "No platforms found"
- Installer exits without installing
- All platform detection attempts fail

**Cause:**

- None of the supported platforms are installed
- Platforms installed but not in PATH
- Platform directories don't exist yet

**Solutions:**

1. **Install your AI platform first:**
   - **Claude Code:** Install Claude Desktop with Code integration
   - **GitHub Copilot CLI:** Run `gh extension install github/gh-copilot`
   - **Codex CLI:** Install OpenAI Codex integration

2. **Use explicit platform flag:**

   ```bash
   # Force installation to specific platform
   npx get-shit-done-multi --claude --yes
   ```

   This skips auto-detection and installs to the specified platform.

1. **Create platform directory manually:**

   ```bash
   # Create Claude directory structure
   mkdir -p ~/.claude/skills ~/.claude/agents
   
   # Then install with explicit flag
   npx get-shit-done-multi --claude --global --yes

```plaintext

---

### 4. Error: Existing installation conflict

**Problem:**

```

Warning: Existing GSD installation found at ~/.claude/get-shit-done/
Current version: v2.0.0
This installation will overwrite existing files.

```plaintext

**Symptoms:**

- Pre-flight validation warns about existing files
- Installer prompts for confirmation
- Unsure whether to proceed

**Cause:**

- Previous GSD installation exists
- Upgrading from older version
- Interrupted previous installation

**Solutions:**

1. **Continue to upgrade (recommended):**

   ```bash
   # Installer will overwrite old files with new versions
   # This is the normal upgrade path
   npx get-shit-done-multi --yes
   ```

1. **Uninstall first, then reinstall:**

   ```bash
   # Remove old installation
   rm -rf ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/
   
   # Fresh install
   npx get-shit-done-multi

```plaintext

   See [How to Uninstall](how-to-uninstall.md) for complete removal instructions.

3. **Install to different location:**

   ```bash
   # Keep global installation, add local
   npx get-shit-done-multi --local --yes
   ```

---

### 5. Error: Path resolution failed (Windows)

**Problem:**

```plaintext
Error: Invalid path: C:\Users\You\.claude\skills\gsd-new-project
Path contains reserved name or invalid characters
```

**Symptoms:**

- Installation fails on Windows
- Path-related errors
- Files created in wrong locations

**Cause:**

- Windows path separators (`\` vs `/`)
- Windows reserved names (CON, PRN, AUX, NUL, etc.)
- Long path names exceeding Windows limits

**Solutions:**

1. **Use forward slashes in custom paths:**

   ```bash
   # Windows accepts forward slashes
   npx get-shit-done-multi --local

```plaintext

2. **Avoid Windows reserved names:**
   - Don't name folders: CON, PRN, AUX, NUL, COM1-9, LPT1-9
   - Don't use trailing dots in folder names
   - Avoid special characters: `< > : " | ? *`

3. **Enable long path support (Windows 10+):**

   ```powershell
   # Run as Administrator
   New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" `
     -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
   ```

1. **Install to shorter path:**

   ```bash
   # Use shorter installation path
   cd C:\code\project
   npx get-shit-done-multi --local

```plaintext

---

### 6. Error: Symlink permission prompt

**Problem:**

```

Warning: Target path contains symlink: ~/.claude -> /external/.claude
Continue installation? (y/n)

```plaintext

**Symptoms:**

- Interactive prompt about symlinks during installation
- Uncertain whether symlink is safe
- Installation paused waiting for input

**Cause:**

- Target path is or contains a symbolic link
- Security check to prevent following malicious symlinks
- Common when using external drives or custom setups

**Solutions:**

1. **Approve if symlink is intentional:**

   ```bash
   # If you created the symlink, it's safe to continue
   # Type 'y' and press Enter
   ```

1. **Reject and use non-symlinked path:**

   ```bash
   # Type 'n' to cancel
   # Then install to direct path:
   npx get-shit-done-multi --local --yes

```plaintext

3. **Use `--yes` to auto-approve:**

   ```bash
   # Skip all prompts (includes symlink approval)
   npx get-shit-done-multi --yes
   ```

   Only use if you trust the symlink.

---

## Post-Installation Issues

### 7. Installation succeeds but commands not working

**Problem:**

```plaintext
# After installation, trying to use GSD:
/gsd-plan-phase
Error: Command not recognized
```

**Symptoms:**

- Installation reports success
- `/gsd-*` commands not recognized by AI assistant
- No errors during installation
- Files exist in correct location

**Cause:**

- Platform hasn't reloaded skills from disk
- Skills cache is stale
- Wrong installation location for platform config
- Platform not running or not configured correctly

**Solutions:**

1. **Restart your AI platform:**
   - **Claude Desktop:** Quit and relaunch app
   - **VS Code (Copilot):** Reload window (`Cmd+Shift+P` → "Reload Window")
   - **Terminal (Codex):** Start new terminal session

2. **Verify installation location matches platform config:**

   ```bash
   # Check where files were installed
   npx get-shit-done-multi --version
   
   # Check where platform expects skills
   # Claude: ~/.claude/skills/ or .claude/skills/
   # Copilot: ~/.copilot/skills/ or .github/skills/
   # Codex: ~/.codex/skills/ or .codex/skills/

```plaintext

3. **Verify files exist:**

   ```bash
   # List installed skills
   ls -la ~/.claude/skills/gsd-*/
   ls -la ~/.copilot/skills/gsd-*/
   ls -la ~/.codex/skills/gsd-*/
   ```

   If files are missing, reinstall.

1. **Check platform-specific requirements:**
   - **Claude:** Ensure Claude Code integration is enabled
   - **Copilot:** Ensure `gh copilot` command works
   - **Codex:** Ensure Codex CLI is configured

---

### 8. Update detection not working

**Problem:**

```plaintext
# Running --version shows nothing
npx get-shit-done-multi --version

GSD Installer v2.0.1
No installations found.
```

**Symptoms:**

- `--version` doesn't show installed versions
- Installer doesn't detect existing installation
- Upgrade prompts don't appear
- Files exist but not detected

**Cause:**

- Missing `.gsd-install-manifest.json` file
- Corrupted manifest file
- Manifest in wrong location
- Permission issues reading manifest

**Solutions:**

1. **Check manifest exists:**

   ```bash
   cat ~/.claude/get-shit-done/.gsd-install-manifest.json
   cat .github/get-shit-done/.gsd-install-manifest.json
   cat ~/.codex/get-shit-done/.gsd-install-manifest.json

```plaintext

2. **Verify manifest format:**

   ```bash
   # Check if JSON is valid
   cat ~/.claude/get-shit-done/.gsd-install-manifest.json | python -m json.tool
   ```

   If error, manifest is corrupted.

1. **Reinstall to regenerate manifest:**

   ```bash
   # Reinstall (overwrites and creates new manifest)
   npx get-shit-done-multi --claude --global --yes

```plaintext

4. **Check file permissions:**

   ```bash
   # Ensure manifest is readable
   ls -la ~/.claude/get-shit-done/.gsd-install-manifest.json
   
   # Fix permissions if needed
   chmod 644 ~/.claude/get-shit-done/.gsd-install-manifest.json
   ```

---

## Upgrade Issues

### 9. Upgrade fails but installation still works

**Problem:**

```plaintext
Error: Failed to update ~/.claude/skills/gsd-plan-phase/SKILL.md
Installation may be incomplete
```

**Symptoms:**

- Upgrade shows errors
- Some files updated, some not
- Mixed versions across files
- Old version still partially working

**Cause:**

- File in use (locked by running process)
- Partial permission issues
- Disk full during upgrade
- Interrupted upgrade (network issue, crash)

**Solutions:**

1. **Close all AI platform instances:**

   ```bash
   # Make sure no process is using GSD files
   # Then retry upgrade
   npx get-shit-done-multi --yes

```plaintext

2. **Force reinstall:**

   ```bash
   # Remove existing installation
   rm -rf ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/
   
   # Fresh install
   npx get-shit-done-multi --claude --global --yes
   ```

1. **Check for file locks:**

   ```bash
   # macOS/Linux: Check for processes using files
   lsof | grep get-shit-done
   
   # Kill any processes holding locks

```plaintext

---

### 10. Upgrade changes break my workflow

**Problem:**

```

# After upgrading to v3.0.0

Error: /gsd-plan-milestone no longer exists
Use /gsd-plan-phase instead

```plaintext

**Symptoms:**

- Commands renamed or removed
- Workflow behaves differently
- Breaking changes not anticipated
- Need to revert to old version

**Cause:**

- Major version upgrade with breaking changes
- Didn't read CHANGELOG before upgrading
- Assumed backwards compatibility

**Solutions:**

1. **Read CHANGELOG for migration guide:**

   ```bash
   # Check what changed
   npx get-shit-done-multi --changelog
   ```

1. **Adapt workflow to new version:**
   - Learn new command names
   - Update documentation
   - Inform team members

2. **Downgrade if necessary:**

   ```bash
   # Uninstall current version
   rm -rf ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/
   
   # Install specific older version
   npx get-shit-done-multi@2.5.0

```plaintext

   See [How to Upgrade](how-to-upgrade.md) for downgrade details.

---

## Runtime Issues

### 11. Error: Git identity not preserved in commits

**Problem:**

```

# After GSD makes commits

git log --oneline
a1b2c3d GSD Agent <noreply@gsd.dev>

```plaintext

**Symptoms:**

- Commits show wrong author name/email
- User identity overridden by agent
- Git history attributes work to wrong person

**Cause:**

- Git identity helpers not loaded
- Environment variables not set
- Git config missing user.name/user.email

**Solutions:**

1. **Set git config globally:**

   ```bash
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

1. **Set git config locally (per-project):**

   ```bash
   cd /path/to/project
   git config user.name "Your Name"
   git config user.email "your.email@example.com"

```plaintext

3. **Verify git identity helpers are working:**

   ```bash
   # Check if helpers are loaded
   cat .github/get-shit-done/workflows/git-identity-helpers.sh
   ```

1. **Amend recent commits if needed:**

   ```bash
   # Fix last commit
   git commit --amend --author="Your Name <your.email@example.com>" --no-edit
   
   # Fix last N commits
   git rebase -i HEAD~N -x "git commit --amend --author='Your Name <your.email@example.com>' --no-edit"

```plaintext

---

### 12. Error: Planning directory structure issues

**Problem:**

```

Error: .planning/phases/01-phase-name/01-01-PLAN.md not found
Cannot execute plan

```plaintext

**Symptoms:**

- GSD commands fail to find planning files
- Directory structure doesn't match expected format
- Phase/plan numbering incorrect

**Cause:**

- Manual file creation with wrong naming
- Directory structure doesn't follow conventions
- Files moved or renamed outside GSD workflow

**Solutions:**

1. **Use GSD commands to create structure:**

   ```bash
   # Don't manually create planning files
   # Use GSD commands instead:
   /gsd-new-project
   /gsd-add-phase
   /gsd-plan-phase 1
   ```

1. **Verify directory structure:**

   ```bash
   # Check structure matches expected format
   tree .planning/

```plaintext

   Should show:

   ```

   .planning/
   ├── ROADMAP.md
   ├── REQUIREMENTS.md
   ├── STATE.md
   └── phases/
       └── 01-phase-name/
           ├── 01-01-PLAN.md
           ├── 01-01-SUMMARY.md
           └── 01-01-CONTEXT.md

```plaintext

3. **Regenerate from roadmap:**

   ```bash
   # If structure is broken, regenerate
   /gsd-new-project
   ```

---

## Network and Package Issues

### 13. Error: npm package not found

**Problem:**

```plaintext
npx get-shit-done-multi
npm ERR! 404 Not Found - GET https://registry.npmjs.org/get-shit-done-multi
```

**Symptoms:**

- `npx` command fails
- Package not found on npm registry
- Cannot download or install

**Cause:**

- Package name misspelled
- Package not published yet
- npm registry connection issues
- Corporate firewall blocking npm

**Solutions:**

1. **Verify package name:**

   ```bash
   # Correct package name
   npx get-shit-done-multi
   
   # Common typos to avoid:
   # get-shit-done (without -multi)
   # gsd-multi
   # get-shit-done-cli

```plaintext

2. **Check npm registry connection:**

   ```bash
   # Test npm connection
   npm ping
   
   # Check registry URL
   npm config get registry
   ```

1. **Use different registry if behind corporate firewall:**

   ```bash
   # Use public registry
   npm config set registry https://registry.npmjs.org/
   
   # Then retry
   npx get-shit-done-multi

```plaintext

---

### 14. Error: Node.js version too old

**Problem:**

```

Error: This package requires Node.js version 20 or higher
Current version: v18.12.0

```plaintext

**Symptoms:**

- Installation fails immediately
- Version check error
- Package won't run

**Cause:**

- Node.js version older than v20
- Using system Node.js instead of updated version

**Solutions:**

1. **Upgrade Node.js:**

   ```bash
   # Using nvm (recommended)
   nvm install 20
   nvm use 20
   
   # Using Homebrew (macOS)
   brew upgrade node
   
   # Using apt (Ubuntu/Debian)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

1. **Verify Node.js version:**

   ```bash
   node --version  # Should show v20.0.0 or higher

```plaintext

3. **Use npx with specific Node version (nvm):**

   ```bash
   nvm exec 20 npx get-shit-done-multi
   ```

---

## Getting Help

If none of these solutions work:

### 1. Check Error Log

GSD creates an error log when installation fails:

```bash
# Check for error log
cat .gsd-error.log
cat ~/.gsd-error.log
```plaintext

This contains detailed error information.

### 2. Gather Information

Before asking for help, collect:

- **Error message:** Full output (copy-paste)
- **Environment:**

  ```bash
  node --version
  npm --version
  uname -a  # OS information
  ```

- **Installation command:** Exact command you ran
- **Installation location:** Where you tried to install
- **Manifest file:** If it exists

  ```bash
  cat ~/.claude/get-shit-done/.gsd-install-manifest.json
  ```

### 3. Open GitHub Issue

Visit the GitHub repository and create an issue:

1. **Title:** Brief description (e.g., "Installation fails with EACCES on macOS")
2. **Description:** Include all information from step 2
3. **Steps to reproduce:** Exact commands that cause the error
4. **Expected behavior:** What should happen
5. **Actual behavior:** What actually happens

### 4. Check Existing Issues

Before opening new issue, search existing issues:

- Someone may have already reported the same problem
- Solution may already exist in comments

---

## Next Steps

- **Fresh installation:** See [How to Install](how-to-install.md)
- **Upgrade existing installation:** See [How to Upgrade](how-to-upgrade.md)
- **Remove GSD:** See [How to Uninstall](how-to-uninstall.md)
- **Understand what's installed:** See [What Gets Installed](what-gets-installed.md)
