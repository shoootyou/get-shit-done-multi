---
phase: 8
discussed: 2026-01-24T01:08:00.000Z
areas: [Documentation Depth & Audience, Migration Guide Scope, Troubleshooting Coverage, Transition Strategy Communication]
decisions_count: 18
---

# Phase 8 Context: Documentation & Release

## Essential Features

### Documentation Structure
- `/specs/skills/README.md` must explain the structure clearly enough for readers to understand the system
- Focus on WHY the spec system exists (problem solved, benefits over legacy)
- Technical reference (frontmatter, metadata) in separate section, not inline
- Main README.md gets brief mention + link to `/specs/skills/README.md` (no major rewrite)

### Migration Guide
- **Audience:** Both GSD maintainers AND external users creating custom skills
- **Focus:** How to create new spec from scratch (NOT migrating legacy commands)
- Must include platform-specific conditional syntax ({{#isCopilot}}, {{#isClaude}}, {{#isCodex}})
- **Outcome:** User completes guide with working skill installed on their platform

### Troubleshooting Guide
- Anticipate hypothetical installation issues (Phase 7 had no real issues)
- **First check priority:** Tool requirements met
- Platform-specific sections for all 3 platforms (Copilot, Claude, Codex)
- No debug logs/commands required (keep it simple)

### Transition Strategy
- **Complete legacy removal during this milestone** (v1.9.1)
- Manual migration required with cleanup instructions
- Provide BOTH manual steps AND automated cleanup script
- Include comparison table (old vs new format)
- Reference official Claude documentation on skills vs commands coexistence

## Technical Boundaries

### Documentation Format
- Markdown files in `/specs/skills/` and updates to main README.md
- Separate reference sections (not inline examples)
- Comparison tables for old/new format visualization

### Migration Approach
- NO automatic migration
- NO legacy preservation ("complete removal during milestone")
- Focus on creating NEW specs, not converting OLD commands

### Cleanup Tooling
- Automated script for legacy removal
- Manual fallback instructions

## Scope Limits

### Out of Scope
- Deep technical implementation details (Claude decides architecture)
- Performance optimization documentation
- Testing/CI documentation
- Contributing guidelines (separate from user docs)

### Explicitly NOT Including
- Legacy command migration guide (focus on NEW specs only)
- Major README.md rewrite (just brief mention)
- Debug logging infrastructure
- Platform-independent approach (must cover all 3 platforms)

## Open Questions for Research

### Documentation Standards
- What's the standard structure for skill documentation? (check Claude docs)
- Examples from other multi-platform CLI tools?
- Best practices for frontmatter documentation?

### Migration Guide Format
- Step-by-step tutorial structure?
- What's a minimal working example?
- How detailed should conditional syntax examples be?

### Troubleshooting Common Issues
- What hypothetical issues are most likely? (platform detection, file permissions, path issues)
- What's the standard troubleshooting flow for CLI tools?
- Platform-specific installation quirks to document?

### Cleanup Script Design
- What files/folders need removal? (./commands/gsd/*, .github/copilot/commands/*, etc.)
- Safety checks before deletion?
- Idempotent (can run multiple times safely)?

## User Decisions Captured

### Area 1: Documentation Depth & Audience
1. Purpose: Readers should "understand the structure"
2. Content focus: WHY (problem/benefits), not just WHAT/HOW
3. Technical details: Separate reference section
4. Main README: Brief mention with link only

### Area 2: Migration Guide Scope
1. Audience: Both GSD maintainers and external users
2. Focus: Create new specs from scratch (remove legacy)
3. Include: Platform-specific conditional syntax usage
4. Outcome: Working skill installed on user's platform

### Area 3: Troubleshooting Coverage
1. Issues: Anticipate hypothetical (no real issues found)
2. First check: Tool requirements met
3. Platform coverage: All 3 platforms separately
4. Debug tools: No log files/debug commands needed

### Area 4: Transition Strategy Communication
1. Upgrade behavior: Manual migration with cleanup instructions
2. Deprecation: Complete removal during this milestone (v1.9.1)
3. Cleanup method: Both manual steps AND automated script
4. Documentation: Include comparison table + reference official Claude docs

## Key Quote from User

> "yep using official documentation from https://code.claude.com/docs/en/slash-commands#control-who-invokes-a-skill : 'Custom slash commands have been merged into skills. A file at .claude/commands/review.md and a skill at .claude/skills/review/SKILL.md both create /review and work the same way. Your existing .claude/commands/ files keep working. Skills add optional features: a directory for supporting files, frontmatter to control whether you or Claude invokes them, and the ability for Claude to load them automatically when relevant.'"

This establishes the conceptual foundation for explaining the transition.

## Success Signals

Phase 8 is done when:
- [ ] User can read `/specs/skills/README.md` and understand WHY + WHAT the system is
- [ ] User can follow migration guide and end with a working custom skill installed
- [ ] User knows what to check first when installation fails (tool requirements)
- [ ] User has cleanup script + manual instructions to remove legacy completely
- [ ] Comparison table shows old vs new format clearly
- [ ] CHANGELOG.md documents v1.9.1 with spec system introduction

## Notes for Planner

- Research should find examples of good skill documentation (check Claude docs)
- Cleanup script needs careful design (irreversible deletion)
- Comparison table can reuse work from Phase 1 command mapping
- Official Claude docs link should be prominent in transition strategy
