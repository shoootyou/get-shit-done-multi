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
npx get-shit-done-multi --claude --copilot
npx get-shit-done-multi --claude --copilot --codex
```

Each platform gets its own installation. Your `.planning/` directory works with all platforms.

## Non-Interactive Mode

Skip prompts for automation:

```bash
npx get-shit-done-multi --claude --global --yes
```

Useful for:
- CI/CD pipelines
- Automated setup scripts
- Team onboarding scripts

## Version Management

### Check Installed Versions

```bash
npx get-shit-done-multi --version
```

Shows ALL installations (global + local, all platforms):
```
Installed versions:
- Claude (global): v2.0.0 at ~/.claude/get-shit-done/
- Copilot (local): v2.0.0 at .github/get-shit-done/
```

### Upgrade All Installations

```bash
npx get-shit-done-multi
```

Installer detects outdated installations and prompts for upgrade.

### Upgrade Specific Platform

```bash
npx get-shit-done-multi --claude --yes
```

## Custom Paths (Not Yet Implemented)

Future feature (v2.1+):

```bash
npx get-shit-done-multi --custom-path ~/my-skills/
```

**Workaround for now:**
1. Install to local directory
2. Manually move files to custom location
3. Update platform configuration to point to custom location

## Partial Installation (Not Yet Implemented)

Future feature (v2.1+):

Select specific skills/agents to install:

```bash
npx get-shit-done-multi --skills gsd-plan-phase,gsd-execute-phase
```

**Workaround for now:**
1. Install all skills
2. Manually delete unwanted skills
3. Note: Full installation recommended for complete workflow

## Manual Customization

### Editing Skills

You can manually edit installed skills:

1. Install GSD:
   ```bash
   npx get-shit-done-multi --local
   ```

2. Edit skill file:
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

2. Follow platform's skill format (see [Platform Specifics](platform-specifics.md))

3. Your custom skills won't be affected by GSD reinstalls

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
