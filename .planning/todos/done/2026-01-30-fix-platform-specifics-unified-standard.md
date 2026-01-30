---
created: 2026-01-30T02:14
title: Fix platform-specifics.md - All platforms use same skill/agent standard
area: docs
files:
  - docs/platform-specifics.md:102-230
---

## Problem

The docs/platform-specifics.md document incorrectly shows that GitHub Copilot CLI and Codex CLI have different skill and agent configurations than Claude Code. In reality, all three platforms follow the same skill standard.

**Evidence:**
- GitHub Copilot CLI skill standard: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills
- Codex CLI skill standard: https://developers.openai.com/codex/skills/
- GitHub Copilot agents configuration: https://docs.github.com/en/copilot/reference/custom-agents-configuration#yaml-frontmatter-properties

**Current issues in platform-specifics.md:**

1. **Lines 102-145 (Copilot Skills):** Shows different frontmatter fields than Claude:
   - Lists `platform`, `generated`, `templateVersion` as required
   - Shows different tool names (lowercase: read, write, edit vs Claude's capitalized)
   - These don't match the official skill standard

2. **Lines 146-169 (Copilot Agents):** Shows different agent frontmatter:
   - Lists `platform`, `target`, `infer` fields
   - Says `skills` field not supported
   - Agent config doesn't match official documentation

3. **Lines 181-230 (Codex):** Copied from Copilot with same issues

## Solution

Update platform-specifics.md to reflect that all platforms use the same skill/agent standard:

1. Review official documentation for all three platforms
2. Identify the actual unified skill/agent frontmatter format
3. Update Copilot section (lines 102-180) with correct configuration
4. Update Codex section (lines 181-230) with correct configuration  
5. Update agent frontmatter for Copilot using https://docs.github.com/en/copilot/reference/custom-agents-configuration#yaml-frontmatter-properties
6. Note only the differences (e.g., command prefix: `/` vs `$`)
7. Remove incorrect fields that don't exist in the standards
