# Multi-Platform Agent Optimization

## What This Is

A template-based agent installation system that maximizes platform-native capabilities for Claude and GitHub Copilot. When users install GSD agents, they get versions optimized for their specific platform using official specs as source of truth, not runtime deduction.

## Core Value

Agent definitions use native platform capabilities—Claude and Copilot each get configurations that leverage their specific features through declarative frontmatter, not interpretation.

## Requirements

### Validated

- ✓ Agent installation via bin/install.js — existing
- ✓ 10 GSD agents in ./agents directory — existing
- ✓ Multi-CLI orchestration system — existing
- ✓ Command system with markdown definitions — existing
- ✓ State management for concurrent execution — existing

### Active

- [ ] Template system with placeholders for platform-specific syntax
- [ ] Agent templates replace current ./agents/*.md files
- [ ] Claude validation using https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
- [ ] Copilot generation using https://docs.github.com/en/copilot/reference/custom-agents-configuration
- [ ] Installation parameter (--copilot flag) triggers platform-specific generation
- [ ] Both platforms have equal optimization priority
- [ ] Agent functionality unchanged—only frontmatter/configuration optimized
- [ ] Semantic versioning: patch release (1.8.0 → 1.8.1)

### Out of Scope

- Codex optimization — deferred to future phase
- Changing agent functionality/behavior — this is configuration optimization only
- Breaking changes to existing agents — must remain backward compatible
- Runtime platform detection — transformation happens at install-time

## Context

**Brownfield Project:**
This codebase already has:
- Working multi-CLI orchestration system
- 10 specialized GSD agents (gsd-executor, gsd-planner, gsd-verifier, etc.)
- Install script at bin/install.js
- CLI detection and adapter system

**Current State:**
- Agents work on Copilot through deduction/interpretation
- Configurations optimized for Claude's format
- Both platforms functional but not leveraging native capabilities

**Problem:**
Users aren't getting maximum value from Copilot-native features because agent configs are designed for Claude and Copilot interprets them generically.

**Opportunity:**
Platform-specific optimization at install-time means both Claude and Copilot users get best-in-class experience without runtime compromise.

## Constraints

- **Tech Stack**: Node.js ES Modules, pure JavaScript (no build step) — preserve simplicity
- **Compatibility**: Must work with existing bin/install.js — extend, don't rewrite
- **Release Type**: Patch version (bug/optimization fix, not feature) — 1.8.0 → 1.8.1
- **Agent Count**: 10 existing agents must all be converted — complete coverage
- **Documentation Sources**: 
  - Claude: https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields (authoritative)
  - Copilot: https://docs.github.com/en/copilot/reference/custom-agents-configuration (authoritative)
- **Functionality Preservation**: Agent behavior unchanged — only metadata/config optimization

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Template-based with placeholders | Single source of truth generates platform-specific outputs | — Pending |
| Replace ./agents files with templates | Eliminates drift between template and output | — Pending |
| Install-time transformation via --copilot flag | Users get optimized version without runtime overhead | — Pending |
| Both platforms equal priority | No compromise on either platform's capabilities | — Pending |
| Use official docs as source of truth | Ensures compliance with actual platform specs, not assumptions | — Pending |
| Patch version bump | This is optimization/fix of existing functionality, not new feature | — Pending |

---
*Last updated: 2026-01-21 after initialization*
