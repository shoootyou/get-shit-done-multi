---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - README.md
  - docs/README.md
  - docs/what-is-gsd.md
autonomous: true

must_haves:
  truths:
    - "README prominently indicates this is a template synchronization system"
    - "Users understand v2.0.0+ means template maintenance only, no new features"
    - "Documentation directs users to original get-shit-done for deep understanding"
  artifacts:
    - path: "README.md"
      provides: "Project scope section and updated Credits section"
      contains: "Template System"
    - path: "docs/README.md"
      provides: "Updated scope context in docs hub"
    - path: "docs/what-is-gsd.md"
      provides: "Reference to original repo for complete documentation"
  key_links:
    - from: "README.md"
      to: "https://github.com/glittercowboy/get-shit-done"
      via: "explicit link in scope section"
---

<objective>
Update project documentation to reflect v2.0.0+ scope change: this repository is now a template synchronization system only, with no active development of new capabilities.

Purpose: Clearly communicate that starting v2.0.0, this project syncs agents/skills from the original get-shit-done repository, and users should reference the original repo for in-depth GSD understanding.

Output: Updated README.md and key docs with clear scope messaging and references to original repository.
</objective>

<execution_context>
@.github/get-shit-done/workflows/execute-plan.md
@.github/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/todos/pending/2026-02-04-update-project-scope-v2-template-only.md
@README.md
@docs/README.md
@docs/what-is-gsd.md
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add Project Scope section to README.md</name>
  <files>README.md</files>
  <action>
Add a prominent "Project Scope" section right after the centered header (before "What It Does") that clearly communicates:

1. Add a badge/callout at the top (after the badges div):
```markdown
> **📦 Template System** — Starting v2.0.0, this repository serves as a multi-platform template installer. For the primary GSD development and in-depth documentation, see [get-shit-done](https://github.com/glittercowboy/get-shit-done).
```

2. Update the "Credits & License" section to emphasize:
- This repo syncs agents, skills, and get-shit-done folder content from the original
- No active development of new capabilities happens here
- The original repo is the source of truth for GSD methodology

Update the "Key Differences" part to:
```markdown
**Key Differences:**

- Original: Primary GSD development, Claude-only, source of all capabilities
- GSD Multi: Multi-platform template installer (Claude, Copilot, Codex) — syncs from original

**Starting v2.0.0:** This repository functions as a template synchronization system. All new capabilities, skills, and agents are developed in the original get-shit-done repository and synced here for multi-platform deployment.
```
  </action>
  <verify>
- `grep -q "Template System" README.md` returns success
- `grep -q "template synchronization" README.md` returns success
- README.md has clear reference to original repo for understanding GSD
  </verify>
  <done>README.md clearly communicates v2.0.0+ scope as template-only system with reference to original repo</done>
</task>

<task type="auto">
  <name>Task 2: Update docs hub and what-is-gsd.md</name>
  <files>docs/README.md, docs/what-is-gsd.md</files>
  <action>
**docs/README.md changes:**

1. Add a note after the title indicating scope:
```markdown
> **Note:** GSD Multi is a multi-platform installer that deploys GSD to Claude, Copilot, and Codex. For comprehensive GSD methodology documentation, visit the [original get-shit-done repository](https://github.com/glittercowboy/get-shit-done).
```

2. In the "Support" section, update the fork information line to:
```markdown
- **Primary GSD Repository:** https://github.com/glittercowboy/get-shit-done (source of all capabilities)
- **Fork Information:** Template system forked from v1.6.4 and syncs from original
```

**docs/what-is-gsd.md changes:**

1. Add a note after the title:
```markdown
> This documentation provides an overview of GSD concepts. For the complete, authoritative GSD documentation including latest developments, visit [get-shit-done](https://github.com/glittercowboy/get-shit-done).
```

2. Update the "Multi-Platform Support" section to add:
```markdown
**About GSD Multi:**

GSD Multi is a template installer that deploys GSD skills and agents to multiple platforms. Starting v2.0.0, this repository focuses solely on multi-platform deployment—all new capabilities are developed in the [original get-shit-done repository](https://github.com/glittercowboy/get-shit-done) and synced here.
```
  </action>
  <verify>
- `grep -q "original get-shit-done" docs/README.md` returns success
- `grep -q "template installer" docs/what-is-gsd.md` returns success
- Both files have clear links to glittercowboy/get-shit-done
  </verify>
  <done>Documentation hub and what-is-gsd.md updated with scope context and references to original repo</done>
</task>

</tasks>

<verification>
- [ ] README.md has prominent scope indicator (badge/callout)
- [ ] README.md Credits section explains template sync relationship
- [ ] docs/README.md directs users to original repo for deep understanding
- [ ] docs/what-is-gsd.md explains this is a template installer
- [ ] All files have working links to https://github.com/glittercowboy/get-shit-done
</verification>

<success_criteria>
A user landing on this repository immediately understands:
1. This is a multi-platform template installer
2. v2.0.0+ means template maintenance only
3. For GSD methodology and new capabilities, they should visit the original repo
</success_criteria>

<output>
After completion, create `.planning/quick/001-update-project-scope-v2-0-0-as-template-/001-SUMMARY.md`
</output>
