# Platform Migration

Frequently asked questions about switching platforms, using multiple platforms, and migration strategies.

## Can I use multiple platforms simultaneously?

**Yes.** GSD Multi supports installing to multiple platforms at once:

```bash
npx get-shit-done-multi --claude --copilot --codex
```

Each platform gets its own installation:

- Claude: `.claude/` or `~/.claude/`
- Copilot: `.github/` or `~/.copilot/`
- Codex: `.codex/` or `~/.codex/`

All platforms share the same GSD workflow. Your `.planning/` directory works with all platforms.

## How do I switch from Claude to Copilot?

**Option 1: Install Copilot alongside Claude (Recommended)**

```bash
# Install to Copilot without removing Claude
npx get-shit-done-multi --copilot
```

Your `.planning/` directory works with both. Switch by changing which platform you use.

**Option 2: Migrate (Remove Claude, Install Copilot)**

```bash
# Step 1: Remove Claude installation
rm -rf ~/.claude/skills/gsd-* ~/.claude/agents/gsd-* ~/.claude/get-shit-done/

# Step 2: Install to Copilot
npx get-shit-done-multi --copilot
```text

Your `.planning/` directory is NOT affected. All project history preserved.

## How do I switch from Copilot to Codex?

Same process as Claude → Copilot:

**Install alongside:**

```bash
npx get-shit-done-multi --codex
```

**Or migrate:**

```bash
# Remove Copilot
rm -rf ~/.copilot/skills/gsd-* ~/.copilot/agents/gsd-* ~/.copilot/get-shit-done/

# Install Codex
npx get-shit-done-multi --codex
```

**Note:** Codex uses `$gsd-` command prefix (not `/gsd-`). After switching, use:

- `$gsd-plan-phase` instead of `/gsd-plan-phase`
- `$gsd-execute-phase` instead of `/gsd-execute-phase`
- etc.

## What happens to my .planning/ directory when I switch?

**Nothing.** Your `.planning/` directory is platform-independent:

- ROADMAP.md works with all platforms
- PLAN.md files work with all platforms
- SUMMARY.md files work with all platforms
- STATE.md works with all platforms

GSD workflow is identical across platforms. Only the skills/agents installation location changes.

## Can I have both global and local installations?

**Yes.** You can install:

- Globally: `npx get-shit-done-multi --global`
- Locally (per project): `npx get-shit-done-multi --local`

**Example:**

```bash
# Global installation for all projects
cd ~/
npx get-shit-done-multi --claude --global

# Local installation for specific project
cd ~/my-project/
npx get-shit-done-multi --claude --local
```

Local installation takes precedence if both exist.

## How do I migrate from v1.x to v2.0?

**v2.0 is a fresh install.** No migration needed:

1. **Uninstall v1.x skills** (if you have manual .claude/ files)
2. **Run installer:**

   ```bash
   npx get-shit-done-multi

```text

3. **Your .planning/ directories are NOT affected**

v2.0 uses template-based installation. Old manual skills can coexist but may conflict.

## Do platform-specific features affect my projects?

**No.** Platform differences are:

- File format (frontmatter, tool names)
- File location (`.claude/` vs `.github/` vs `.codex/`)
- Command prefix (Codex uses `$gsd-`, others use `/gsd-`)

**GSD workflow is identical:**

- Same orchestrator → researcher → planner → executor → verifier flow
- Same .planning/ structure
- Same phases, plans, summaries
- Same verification methodology

Choose platform based on your AI assistant, not project needs.

## How do I know which platform I have installed?

**Check version:**

```bash
npx get-shit-done-multi --version
```

Output shows ALL installations:

```plaintext
Installed versions:
- Claude (global): v2.0.0 at ~/.claude/get-shit-done/
- Copilot (local): v2.0.0 at .github/get-shit-done/
- Codex (global): v2.0.0 at ~/.codex/get-shit-done/
```

**Or check manually:**

```bash
ls ~/.claude/get-shit-done/ 2>/dev/null && echo "Claude installed"
ls ~/.copilot/get-shit-done/ 2>/dev/null && echo "Copilot installed"
ls ~/.codex/get-shit-done/ 2>/dev/null && echo "Codex installed"
```

## Can I customize skills per platform?

**Not directly.** GSD Multi uses templates to ensure consistency across platforms.

**Workaround for advanced users:**

1. Install to local directory
2. Manually edit `.claude/skills/gsd-*/SKILL.md` files
3. Changes persist until you reinstall

**Warning:** Manual edits are overwritten on reinstall. Use version control.

## Next Steps

- See [Platform Comparison](platform-comparison.md) for quick reference
- See [Platform Specifics](platform-specifics.md) for format details
- See [How to Install](how-to-install.md) for installation commands
