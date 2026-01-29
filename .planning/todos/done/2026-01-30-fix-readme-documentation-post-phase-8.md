---
created: 2026-01-30T00:33
title: Fix README and documentation post-Phase 8
area: docs
files:
  - README.md
  - docs/how-to-install.md
  - docs/platform-comparison.md
  - docs/platform-specifics.md
---

## Problem

Phase 8 completed comprehensive documentation, but several issues need correction:

1. **Command prefix inconsistency in README quick start:**
   - Claude/Copilot use `/gsd-new-project`
   - Codex uses `$gsd-new-project` (different prefix)
   - README currently doesn't distinguish between platforms

2. **Code block formatting issue in README quick start section**
   - Needs proper markdown code fence formatting

3. **GSD workflow commands missing from README:**
   - Consider adding applicable `/gsd-xxx` skills/agents for workflow
   - Or divide into separate workflow section
   - Should help users understand available commands

4. **Claude commands→skills migration not documented:**
   - Claude deprecated `.claude/commands/` in favor of `.claude/skills/`
   - Per https://code.claude.com/docs/en/slash-commands#control-who-invokes-a-skill:
     > "Custom slash commands have been merged into skills. A file at .claude/commands/review.md and a skill at .claude/skills/review/SKILL.md both create /review and work the same way."
   - Should document this transition in README and relevant docs
   - Explain that old commands still work but skills add features

## Solution

1. Update README.md quick start:
   - Show platform-specific command examples
   - Fix code block formatting
   - Add conditional note: "Use `/gsd-` for Claude/Copilot, `$gsd-` for Codex"

2. Add GSD workflow section to README or separate doc:
   - List key commands: new-project, discuss-phase, research-phase, plan-phase, execute-phase, verify-work
   - Brief description of each
   - Link to full command list in docs/

3. Document commands→skills migration:
   - Add note in README under "About Claude" or similar section
   - Update platform-specifics.md with historical context
   - Clarify that GSD uses skills (not legacy commands)

4. Review all docs/ files for command prefix consistency
