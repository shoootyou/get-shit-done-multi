---
created: 2026-01-30T02:02
title: Update platform binary requirements in documentation
area: docs
files:
  - docs/how-to-install.md:261-274
  - docs/troubleshooting.md
  - README.md:117-120
---

## Problem

Documentation currently mentions the AI platforms (Claude Code, GitHub Copilot CLI, Codex CLI) but doesn't clearly specify the binary requirements and installation links for each platform.

Current state in how-to-install.md (lines 271-274):
- Lists platforms generically
- GitHub Copilot shows `gh copilot` command but not the binary name
- No installation links provided
- No clear binary requirements for Claude or Codex

Users need to know:
1. **Claude Code** requires `claude` binary - https://code.claude.com/docs/en/setup
2. **GitHub Copilot CLI** requires `copilot` binary - https://docs.github.com/en/copilot/how-tos/set-up/install-copilot-cli
3. **Codex CLI** requires `codex` binary - https://developers.openai.com/codex/cli/

## Solution

Update Requirements section in all documentation to explicitly state:

1. **docs/how-to-install.md** - Expand "One of the following AI platforms" section (lines 271-274) to include:
   - Binary name for each platform
   - Installation link for each platform
   - Format: "Platform Name requires `binary` - [installation link]"

2. **docs/troubleshooting.md** - Review and update platform-specific troubleshooting sections to reference correct binaries

3. **README.md** - Update Requirements section (lines 117-120) to specify binaries with installation links

4. **Search all docs** - Check for any other references to platform requirements that need updating

Style: List binaries without verification commands (per user preference)
