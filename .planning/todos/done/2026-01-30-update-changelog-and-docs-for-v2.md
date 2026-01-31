---
created: 2026-01-30T11:14
title: Update CHANGELOG.md and docs for v2.0.0 release
area: docs
files:
  - CHANGELOG.md
  - docs/
  - .planning/phases/08-documentation-and-polish/08-RESEARCH.md
  - .planning/phases/09-platform-instructions-installer/
---

## Problem

CHANGELOG.md needs to be finalized for v2.0.0 release with two distinct audiences:

1. **Documentation needs update**: docs/ must be updated following Phase 8 structure/logic to include Phase 9 functionality (Platform Instructions Installer: AGENTS.md/CLAUDE.md/copilot-instructions.md system)

2. **Changelog has no user/contributor separation**: Current changelog doesn't distinguish between end-user facing improvements vs internal implementation details

3. **Unreleased changes not consolidated**: Multiple "unreleased" entries need to be moved under version 2.0.0

**Context from Phase 8**: Phase 8 established documentation structure and writing style that should be followed when adding Phase 9 content.

**Context from Phase 9**: New platform instructions installer feature needs documentation:
- Smart merge logic (create/append/replace scenarios)
- Platform-specific instruction files (AGENTS.md, CLAUDE.md, copilot-instructions.md)
- Scope-aware paths (local vs global installations)
- Dynamic block detection using first/last line markers

## Solution

**Part 1: Update Documentation (docs/)**
- Review Phase 8 research on documentation style: `.planning/phases/08-documentation-and-polish/08-RESEARCH.md`
- Follow established structure/patterns from Phase 8
- Add Phase 9 Platform Instructions Installer documentation:
  - What it does (installs instruction files with smart merge)
  - How it works (3 merge scenarios, dynamic markers)
  - User-facing behavior (when files are created/updated/merged)
  - Platform-specific paths and file locations

**Part 2: CHANGELOG.md Structure**
Create two sections per version:

### User Section (End-User Focused)
Write for people who **consume** the product (.claude, .github, .codex users):
- Tools additions and improvements
- Correct YAML frontmatter format in skill/agent markdown files
- File location replacements and detection
- Automatic skill detection improvements
- Template variable replacements ({{PLATFORM_ROOT}}, {{COMMAND_PREFIX}})
- Installation behavior improvements
- What's new from user perspective

### Contributor Section (Developer Focused)
Write for people who **develop/maintain** the project:
- Internal implementation details
- templates/ system architecture and changes
- Module structure changes
- Build/test infrastructure
- Technical debt resolved
- Refactoring and code quality improvements
- Internal APIs and patterns

**Part 3: Consolidate Unreleased**
- Move all "unreleased changes" entries under version 2.0.0
- Organize by section (user vs contributor)
- Add dates where relevant

**Style Guide**: Reference Phase 8 research for documentation writing standards, tone, and structure patterns.
