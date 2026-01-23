# GitHub Copilot CLI Support

## Overview
This repository installs Get Shit Done (GSD) for both Claude Code and GitHub Copilot CLI. The Copilot CLI installation is local to the current repository because there is no global install path in this workflow.

## Install
Interactive:

```bash
npx get-shit-done-multi
```

Select `GitHub Copilot CLI` when prompted.

Non-interactive:

```bash
npx get-shit-done-multi --copilot
```

This installs:
- `.github/skills/get-shit-done`
- `.github/agents` (GSD agents only)
- `.github/ISSUE_TEMPLATE/gsd-new-project.yml`

It does not modify global Copilot settings.

## Using GSD in Copilot CLI
1. Start the CLI from the repository root:

   ```bash
   copilot
   ```

2. Confirm the skill is available:

   ```
   /skills list
   ```

3. Invoke a GSD command by typing it directly:

   ```
   /gsd-new-project
   ```

4. Use `/agent` to switch to a specific GSD agent when needed.

## Behavior differences from Claude Code
- Copilot CLI does not support custom slash commands, so you must type `/gsd-*` or `gsd-*` directly.
- `AskUserQuestion` is replaced with plain chat questions and numbered options.
- Claude-specific hooks (statusline, update checks) are not installed.
- All GSD paths point to `.github/skills/get-shit-done`.

## Update or remove
- Re-run `npx get-shit-done-multi --copilot` to refresh the installation.
- Remove `.github/skills/get-shit-done` and any `gsd-*.agent.md` files in `.github/agents` to uninstall.
 - Remove `.github/ISSUE_TEMPLATE/gsd-new-project.yml` to remove the issue template.
