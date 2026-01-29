# Phase 8 Discussion Context
**Date:** 2025-01-29
**Phase:** 08 - Documentation and Polish
**Participants:** User, GSD Orchestrator

## Overview
Deep dive into Phase 8 execution strategy covering documentation structure, writing style, platform documentation approach, and README positioning. All decisions captured for execution planning.

---

## Area 1: Documentation Structure & Location

### Decision: Question-Driven Documentation in docs/
**Rationale:** Users come with specific questions. Each document should answer one question clearly.

**Root files (conventional GitHub):**
- `README.md` - Project overview + credits + documentation index
- `CONTRIBUTING.md` - How to contribute (development setup)
- `LICENSE` - MIT license (already exists)
- `CHANGELOG.md` - Version history (Keep a Changelog format)
  - **Header note:** "Forked from v1.6.4 of [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done). For original project history, see the [original releases](https://github.com/glittercowboy/get-shit-done/releases)."
  - **Version timeline in this fork:**
    - v1.7.0 (2026-01-19): Multi-CLI support experiments (Codex CLI added)
    - v1.8.0 (2026-01-20): Milestone archiving and mapping improvements
    - v2.0.0 (current/upcoming): Full multi-platform + template system achievement
  - Keep existing CHANGELOG entries as-is (they document fork development journey)

**docs/ structure (question-driven):**

**Installation & Usage:**
1. `docs/how-to-install.md` - First time installation guide
2. `docs/how-to-upgrade.md` - Upgrade from previous version
3. `docs/how-to-uninstall.md` - Remove/cleanup skills and agents
4. `docs/what-gets-installed.md` - Explain skills, agents, commands
5. `docs/troubleshooting.md` - Common issues & solutions

**Understanding GSD:**
6. `docs/what-is-gsd.md` - Concept & workflow overview
7. `docs/how-gsd-works.md` - Architecture & execution model
8. `docs/platform-comparison.md` - Quick reference comparison tables
9. `docs/platform-specifics.md` - Deep dive per platform (Claude/Copilot/Codex)
10. `docs/platform-migration.md` - Migration FAQ and switching guides

**Advanced Topics:**
11. `docs/how-to-customize.md` - Custom paths, local installs
12. `docs/architecture.md` - Technical architecture for contributors

**Documentation Index:**
- `docs/README.md` - Organized index of all documentation

### Key Constraints
- No documentation files in `.planning/` - that's GSD internal workspace
- Source material: `.planning/` files + actual code + testing
- Write fresh for end-users (don't copy-paste .planning/ content)
- Each doc should be focused and answer specific questions

---

## Area 2: Writing Style & Audience

### Decision: Layered Human Writing (No Emojis)
**Rationale:** Serve both casual users and technical developers in same doc.

**Style Guidelines:**
- **Tone:** Natural, human writing (no emojis, no corporate speak)
- **Pronouns:** Use "you" (friendly, direct)
- **Technical level:** Layered approach within each document
- **Format:** GitHub-flavored Markdown

**Layered Document Structure:**
Each documentation file should have sections:

1. **Quick Start** (user-friendly)
   - Minimal steps to achieve goal
   - Copy-paste commands
   - "Just works" approach

2. **Details** (technical depth)
   - Explain what's happening
   - Configuration options
   - Advanced usage

3. **Troubleshooting** (if applicable)
   - Common issues
   - Error messages
   - Solutions

**Example for `docs/how-to-install.md`:**
```markdown
# How to Install GSD

## Quick Start
Run this command to install GSD skills to your AI assistant:
[Simple steps, copy-paste ready]

## Installation Options
GSD supports three installation modes...
[Detailed explanation of --global, --local, --custom-path]

## Understanding What Gets Installed
When you run the installer, it copies skill and agent definitions...
[Technical details about file locations, frontmatter, etc.]

## Troubleshooting
**Problem:** Permission denied...
**Solution:** Run with sudo or use --local
```

### Code Examples
- Include real code examples in all docs
- Show actual frontmatter for each platform
- Use templates/ as source of truth
- Keep examples minimal but complete

---

## Area 3: Architecture Documentation

### Decision: User vs Developer Architecture Docs
**Rationale:** Different audiences need different depth.

**`docs/how-gsd-works.md` (User-focused):**
- High-level workflow explanation
- Orchestrator → Planner → Executor → Verifier flow
- What happens when you run `gsd-plan-phase`
- How phases, plans, and execution work
- ASCII diagrams for universal compatibility

**`docs/architecture.md` (Developer-focused):**
- Technical implementation details
- Module responsibilities
- File structure explanations
- Platform adapter patterns
- Template rendering system
- Mermaid diagrams (GitHub rendering)

**Diagram Strategy:**
- **ASCII art:** Use in `README.md` (npm registry compatible)
- **Mermaid:** Use in `docs/` (GitHub renders, code block on npm)
- **Both approaches:** ASCII for overview, Mermaid for technical details

**Source Material (don't copy directly):**
- Read `.planning/codebase/ARCHITECTURE.md` to understand system
- Read actual code in `bin/`, `templates/`
- Write fresh documentation based on understanding
- Focus on user/developer needs, not planning artifacts

---

## Area 4: Platform Documentation

### Decision: Three Separate Platform Docs
**Rationale:** Different purposes need different formats.

**1. `docs/platform-comparison.md` - Quick Reference**
- Comparison tables (side-by-side)
- Feature matrix
- "Which platform should I choose?"
- File location differences
- Frontmatter format differences
- Quick decision guide

**2. `docs/platform-specifics.md` - Deep Dive**
- Separate sections per platform
- Claude: .md files, yaml frontmatter
- Copilot: .github/skills/, instruction field
- Codex: [specific format from templates/]
- Full frontmatter examples for each platform
- File structure for each platform
- Installation locations

**3. `docs/platform-migration.md` - FAQ Style**
- "How do I migrate from Claude to Copilot?"
- "Can I use multiple platforms simultaneously?"
- "How do I switch platforms after installation?"
- "What happens to my existing skills when I switch?"
- Step-by-step migration guides

**Code Examples:**
- Include actual frontmatter examples from templates/
- Show real skill definitions for each platform
- Demonstrate differences with parallel examples

---

## Area 5: README.md Strategy

### Decision: Brief Index-Style README
**Rationale:** npm package page needs quick overview, detailed docs in docs/

**Target Length:** 50-100 lines

**Structure:**
```markdown
# Get Shit Done Multi

**Spec-driven development system for AI coding assistants. Multi-platform support.**

[2-3 paragraph description of what GSD Multi is]
- Spec-driven development for AI assistants
- Multi-platform: Claude, Copilot, Codex
- Template-based skill/agent installation

## Quick Start
\`\`\`bash
npx get-shit-done-multi
\`\`\`

[ASCII diagram showing high-level flow]

## Supported Platforms
- Claude Code
- GitHub Copilot CLI
- Codex CLI

## Documentation
- [Installation Guide](docs/how-to-install.md)
- [How GSD Works](docs/how-gsd-works.md)
- [Platform Comparison](docs/platform-comparison.md)
- [Full Documentation](docs/README.md)

## Requirements
- Node.js >=20.0.0
- One of: Claude Code, GitHub Copilot CLI, or Codex CLI

## Credits & License
This project (GSD Multi) is a multi-platform fork of the original 
[get-shit-done](https://github.com/glittercowboy/get-shit-done) 
framework by Lex Christopherson.

**Fork Point:** v1.6.4 (https://github.com/glittercowboy/get-shit-done/releases/tag/v1.6.4)

**Key differences:**
- Original: Claude-only with direct .md skills
- GSD Multi: Multi-platform support (Claude, Copilot, Codex) using templating system

Both projects are MIT licensed. See [LICENSE](LICENSE) for details.
```

**Changes from current README:**
- Remove all emojis
- Reduce length significantly (currently ~150 lines)
- Make it index-focused
- Keep proper attribution to original author (Lex Christopherson)
- Explain relationship clearly (adaptation/extension)
- ASCII diagram instead of emoji-heavy explanations
- Link to comprehensive docs/ instead of including everything

---

## Attribution & License Strategy

### Decision: Proper MIT License Attribution with Version History
**Background:**
- Original project: `get-shit-done` by Lex Christopherson (MIT)
  - Repository: https://github.com/glittercowboy/get-shit-done
  - Original: Claude-only, direct .md files
- This project: `get-shit-done-multi` (also called "GSD Multi")
  - Forked at v1.6.4: https://github.com/glittercowboy/get-shit-done/releases/tag/v1.6.4
  - Fork development: v1.7.0 (multi-CLI experiments), v1.8.0 (improvements), v2.0.0 (multi-platform + template system achieved)
  - Multi-platform adaptation using templating system

**Project Naming:**
- **Official name:** Get Shit Done Multi (GSD Multi)
- **npm package:** get-shit-done-multi
- **Rationale:** "Multi" emphasizes multi-platform support (Claude, Copilot, Codex)

**Attribution Approach:**
1. Keep original MIT license with Lex Christopherson copyright
2. Add clear credits section in README explaining relationship and fork point (v1.6.4)
3. Explain key differences (not competing, adapting for multi-platform use case)
4. Reference original project for pre-fork history (versions <= 1.6.4)
5. Acknowledge fork development journey: v1.7.0-1.8.0 (transitional), v2.0.0+ (goal achieved)
6. No confusion about which package does what

**Version History Strategy:**
- **Fork point:** v1.6.4 (when fork was created from original project)
- **Pre-fork versions:** <= v1.6.4 are from original project: https://github.com/glittercowboy/get-shit-done/releases
- **Fork development timeline:**
  - v1.7.0 (2026-01-19): Early attempt at multi-CLI support (Codex CLI added)
  - v1.8.0 (2026-01-20): Milestone archiving and codebase mapping improvements
  - v2.0.0 (upcoming): Full achievement of multi-platform + template system goal
- CHANGELOG.md should include header note: "Forked from v1.6.4 of glittercowboy/get-shit-done. For original project history, see https://github.com/glittercowboy/get-shit-done/releases"
- All versions >= 1.7.0 are part of this fork's development journey toward the multi-platform goal

**No Risk Assessment:**
- MIT license explicitly allows modification and redistribution
- Proper attribution given in README and LICENSE
- Different package name (get-shit-done-multi vs get-shit-done-cc)
- Different use case (multi-platform vs Claude-only)
- Clear fork point documented (v1.6.4)
- Both projects can coexist

---

## Documentation Writing Rules

### Source Material Rules
1. **.planning/ is NOT documentation** - it's GSD internal workspace
2. **Read for understanding:**
   - .planning/codebase/ files (understand system)
   - Actual code in bin/, templates/
   - Test files for behavior
3. **Write fresh for users:**
   - Don't copy-paste from .planning/
   - Focus on user needs
   - Answer specific questions

### Style Rules
1. **No emojis** in any documentation
2. **Natural human writing** - not corporate, not too casual
3. **Layered approach** - quick start then details
4. **Code examples** - show, don't just tell
5. **Consistent structure** - follow same pattern across docs

### Technical Rules
1. **ASCII diagrams** in README.md (npm compatibility)
2. **Mermaid diagrams** in docs/ (GitHub rendering)
3. **Real examples** from templates/ directory
4. **Version specifics** - document Node 20 requirement
5. **Platform accuracy** - test commands before documenting

---

## Success Criteria Summary

### Phase 8 Must Deliver:
1. ✅ Root README.md (brief, index-focused, proper attribution)
2. ✅ CONTRIBUTING.md (development setup)
3. ✅ CHANGELOG.md (version history)
4. ✅ docs/README.md (documentation index)
5. ✅ 12 question-driven docs (installation, architecture, platforms)
6. ✅ Layered writing (quick start + details in each doc)
7. ✅ Real code examples from templates/
8. ✅ ASCII diagrams in README, Mermaid in docs/
9. ✅ No emojis, human natural writing
10. ✅ Proper attribution to original author

### Validation Approach:
- Read through user perspective (can they find answers?)
- Check npm package page rendering (ASCII works?)
- Verify GitHub rendering (Mermaid works?)
- Test installation commands in docs
- Verify links between documents work
- Check CODE_EXAMPLES reference actual templates/

---

## Next Steps
1. ✅ Context captured → This document
2. ⏭️ Research Phase 8 (documentation best practices, technical writing)
3. ⏭️ Plan Phase 8 (break into executable plans)
4. ⏭️ Execute Phase 8 (write all documentation)
5. ⏭️ Verify Phase 8 (check success criteria achieved)

---

## Open Questions: NONE
All gray areas resolved through discussion.
