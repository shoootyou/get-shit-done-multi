# How to Customize GSD

Advanced configuration options for GSD Multi installation.

## Installation Scope

### Global Installation

Install GSD skills once for all projects:

```bash
npx get-shit-done-multi --global
```

**Installs to:**

- Claude: `~/.claude/skills/`, `~/.claude/agents/`
- Copilot: `~/.copilot/skills/`, `~/.copilot/agents/`
- Codex: `~/.codex/skills/`, `~/.codex/agents/`

**Use when:**

- You work on many projects
- You want consistent GSD across projects
- You use the same AI platform everywhere

### Local Installation

Install GSD per project:

```bash
cd ~/my-project/
npx get-shit-done-multi --local
```

**Installs to:**

- Claude: `.claude/skills/`, `.claude/agents/`
- Copilot: `.github/skills/`, `.github/agents/`
- Codex: `.codex/skills/`, `.codex/agents/`

**Use when:**

- You want different GSD versions per project
- You want project-specific skills
- You commit skills to git (team collaboration)

### Both Global and Local

You can have both:

```bash
# Global installation
npx get-shit-done-multi --global

# Local installation for specific project
cd ~/special-project/
npx get-shit-done-multi --local
```

**Priority:** Local installation takes precedence over global if both exist.

## Platform Selection

### Single Platform

Install to specific platform:

```bash
npx get-shit-done-multi --claude
npx get-shit-done-multi --copilot
npx get-shit-done-multi --codex
```

### Multiple Platforms

Install to multiple platforms simultaneously:

```bash
# Install to two platforms
npx get-shit-done-multi --claude --copilot

# Install to all three platforms
npx get-shit-done-multi --claude --copilot --codex

# Or use --all shorthand
npx get-shit-done-multi --all
```

Each platform gets its own installation. Your `.planning/` directory works with all platforms.

## Non-Interactive Mode

Skip prompts for automation:

```bash
npx get-shit-done-multi --claude --global
```

Useful for:

- CI/CD pipelines
- Automated setup scripts
- Team onboarding scripts

## Version Management

### Check Package Version

```bash
npx get-shit-done-multi --version
```

Shows the package version from npm (not the installed version):

```plaintext
get-shit-done-multi version 2.0.0
```

**Note:** This shows the npm package version. To check installed versions, see [How to Upgrade](how-to-upgrade.md).

### Upgrade All Installations

```bash
npx get-shit-done-multi
```

Installer detects outdated installations and prompts for upgrade.

### Upgrade Specific Platform

```bash
npx get-shit-done-multi --claude
```

## Custom Paths

Install GSD to a non-standard directory:

```bash
# Install to custom path for Claude
npx get-shit-done-multi --claude --custom-path ~/my-custom-location/

# Install to custom path for Copilot
npx get-shit-done-multi --copilot --custom-path /opt/ai-tools/
```

**How it works:**

- Installs content **directly** in the specified path (doesn't create platform subdirectories)
- Example: `--copilot --custom-path ~/tools/` installs to `~/tools/` (not `~/tools/.github/`)
- Designed for platforms that use non-standard paths

**Restrictions:**

- **Single platform only** - cannot combine with multiple platform flags
- Cannot use `--claude --copilot --custom-path` (will error)
- Use separate commands for multiple platforms with custom paths

**Use cases:**

- Platform configured to look in custom directory
- Corporate environments with restricted paths
- Custom AI tool configurations

## Manual Customization

### Editing Skills

You can manually edit installed skills:

1. Install GSD:

   ```bash
   npx get-shit-done-multi --local
   ```

1. Edit skill file:

   ```bash
   vim .claude/skills/gsd-plan-phase/SKILL.md
   ```

3. Changes persist until reinstall

**Warning:** Manual edits are overwritten on reinstall. Use version control.

### Adding Custom Skills

Add your own skills alongside GSD:

1. Create skill file:

   ```bash
   mkdir .claude/skills/my-custom-skill/
   vim .claude/skills/my-custom-skill/SKILL.md
   ```

1. Follow platform's skill format (see [Platform Specifics](platform-specifics.md))

2. Your custom skills won't be affected by GSD reinstalls

## Uninstall and Reinstall

Clean slate:

```bash
# Remove all GSD files
rm -rf ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/

# Reinstall fresh
npx get-shit-done-multi
```

Your `.planning/` directories are NOT affected.

## Next Steps

- [How to Install](how-to-install.md) - Basic installation
- [How to Uninstall](how-to-uninstall.md) - Removal instructions
- [Platform Migration](platform-migration.md) - Switching platforms
