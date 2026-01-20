# Project Research Summary

**Project:** GSD CLI - Milestone Management & Codebase Mapping
**Domain:** CLI Workflow Tooling for Software Development
**Researched:** January 27, 2025
**Confidence:** HIGH

## Executive Summary

This milestone adds two critical capabilities to GSD CLI: milestone archiving and improved codebase mapping with exclusion controls. The research reveals that **data safety is paramount**—archiving involves destructive operations that can permanently lose work if not implemented correctly. Experts build these systems with robust pre-flight validation, atomic operations, and clear recovery paths.

The recommended approach prioritizes **safety over convenience**: block archiving on uncommitted changes, use atomic file moves with rollback capability, create git tags for historical reference, and provide built-in restore functionality. Use Node.js native APIs (`fs.promises`, `path`) for file operations and only add dependencies where they provide clear safety/usability benefits (`simple-git` for git integration, `ignore` for .gitignore spec compliance).

The key risk is data loss from archiving uncommitted work or failed atomic operations. Mitigation requires: (1) mandatory git status validation before any destructive operation, (2) transaction-pattern file moves with verification, (3) git tag creation to prevent orphaned commits, and (4) comprehensive user guidance on recovery paths. One data loss incident destroys user trust permanently.

## Key Findings

### Recommended Stack

The codebase is pure JavaScript with minimal dependencies—maintain this philosophy. Use Node.js native APIs (`fs.promises.cp()` for recursive copy, `fs.mkdir({recursive})` for directory creation, `path.join()` for cross-platform paths) for all file operations. Only add libraries where native capabilities fall short.

**Core technologies:**
- **Node.js native fs.promises** (≥16.7.0): File archiving, atomic operations — zero dependencies, stable API, cross-platform
- **simple-git** (^3.28.0): Git status validation, commit automation — lightweight CLI wrapper, 7M+ weekly downloads, avoids nodegit's native binding issues
- **ignore** (^7.0.0): .gitignore spec pattern matching for exclusions — official spec 2.22.1 compliance, used by ESLint/Prettier
- **Template strings** (ES2015+): Markdown generation (MILESTONES.md registry) — zero dependencies, sufficient for structured text

**Critical version requirement:** Node.js ≥16.7.0 for stable `fs.cp()` with recursive support (stabilized in v22.3.0).

### Expected Features

Users expect standard milestone archiving workflows (archive with metadata, view archive list, restore capability) and codebase analysis that respects .gitignore conventions. Missing table-stakes features like archive confirmation prompts or .gitignore parsing makes the product feel incomplete.

**Must have (table stakes):**
- Archive milestone with metadata (name, date, who, commit SHA)
- List archived milestones (searchable registry)
- Restore from archive (safety valve for mistakes)
- Respect .gitignore patterns (universal exclusion standard)
- Exclude common noise (node_modules/, .git/, dist/, build/)
- Archive confirmation prompt (prevent accidental data loss)

**Should have (competitive):**
- Custom exclusion patterns (.planning/map-config.json for project-specific needs)
- Archive comparison (diff between milestones to track changes)
- Pre-archive validation (verify phase goals met before archiving)
- Post-archive hooks (custom automation scripts)
- Language-aware analysis (show breakdown: 40% TypeScript, 30% Python)

**Defer (v2+):**
- Webhook triggers (GitHub Actions integration)
- Selective restore (extract specific files from archive)
- Archive export/import (share across repos)
- Dependency graph visualization (parse imports, show module relationships)
- Hotspot identification (git history analysis for high-churn areas)

### Architecture Approach

Use **command-workflow separation** pattern: commands are thin entry points (argument parsing), workflows contain orchestration logic (reusable, testable). Implement **parallel agent orchestration** for codebase mapping (4 agents simultaneously for tech/arch/quality/concerns). Persist state in **markdown files with frontmatter** (human-readable, git-friendly, no database needed).

**Major components:**
1. **archive-milestone.md (workflow)** — Orchestrates validation → move → register → commit; ensures atomic operation with rollback
2. **MILESTONES.md registry** — Single source of truth for archive history; markdown table with timestamps, versions, commit hashes
3. **.planning/history/{milestone}/** — Archive storage preserving ROADMAP, STATE, PROJECT, REQUIREMENTS, research/, phases/
4. **map-codebase.md (workflow)** — Spawns 4 parallel mapper agents with exclusion config; agents write directly to .planning/codebase/
5. **.planning/codebase/** — Active documentation (NOT archived); lives across milestones as evolving reference

**Critical architectural decision:** `.planning/codebase/` stays active (not archived) because it documents the current codebase state, not a historical milestone. Historical codebase state is accessible via git tags and checkouts.

### Critical Pitfalls

1. **Archiving uncommitted changes** — git archive silently ignores uncommitted work; ALWAYS run `git status --porcelain` pre-flight and block if dirty
2. **Non-atomic file moves** — Interrupted operations leave split state; use transaction pattern (temp dir → verify → atomic rename)
3. **Orphaned git commits** — Deleting branches without tags makes commits unrecoverable after GC; create `archive/{milestone}` tags BEFORE deleting
4. **Overly broad exclusion patterns** — Pattern `**/*.*` excludes ALL files; validate patterns, provide dry-run visualization, warn on broad matchers
5. **No recovery path** — Users afraid to archive if they can't undo; implement `gsd:restore-milestone`, document recovery in archive output

## Implications for Roadmap

Based on research, suggested phase structure follows dependency order and risk mitigation:

### Phase 1: Foundation & Safety
**Rationale:** Must establish safe archiving before exposing destructive operations to users. File system operations and git integration are foundation for all archiving features.
**Delivers:** Archive milestone command with git validation, atomic file moves, MILESTONES.md registry, archive commit automation
**Addresses:** Archive milestone (table stakes), confirmation prompt, metadata storage
**Avoids:** Pitfall #1 (uncommitted changes), Pitfall #2 (non-atomic moves), Pitfall #3 (orphaned commits)
**Stack used:** Node.js native fs.promises, simple-git, template strings
**Research flag:** Standard patterns, skip phase-specific research

### Phase 2: Exclusion System & Codebase Mapping
**Rationale:** Archiving must be working and stable before adding codebase mapping dependencies. Exclusion system is complex (gitignore spec, pattern validation) and needs focused attention.
**Delivers:** .gitignore parsing, custom exclusion config (.planning/map-config.json), pattern validation, dry-run visualization, enhanced map-codebase workflow
**Addresses:** .gitignore patterns (table stakes), custom exclusions (competitive), exclude common noise
**Avoids:** Pitfall #4 (overly broad patterns), Pitfall #8 (ignoring tracked files)
**Stack used:** ignore package (v7.0.0), Node.js path normalization
**Research flag:** Standard patterns, ignore package well-documented

### Phase 3: Integration & Recovery
**Rationale:** Core features working; now add quality-of-life improvements (restore, verification integration, better UX).
**Delivers:** Restore milestone command, verify-work integration (suggest archive on pass), recovery documentation, cross-platform path handling, progress indicators
**Addresses:** Restore from archive (table stakes), archive-verify-map workflow integration
**Avoids:** Pitfall #6 (no recovery path), Pitfall #7 (cross-platform paths), Pitfall #10 (no progress indication)
**Stack used:** Cross-platform path normalization, progress UX patterns
**Research flag:** May need CLI UX research for progress indicators

### Phase 4: Enhanced Archiving (Optional, post-MVP)
**Rationale:** Only add after core validated with users. These are "nice to have" enhancements, not essential.
**Delivers:** Archive comparison (diff), pre-archive validation (phase goals check), post-archive hooks, archive search/filter
**Addresses:** Archive comparison (competitive), pre-archive validation (competitive), post-archive hooks
**Avoids:** Pitfall #5 (poor commit messages), Pitfall #9 (lost context)
**Research flag:** Needs phase research for diff algorithms and validation strategies

### Phase Ordering Rationale

- **Safety first:** Phase 1 establishes non-negotiable safety guardrails (git validation, atomic operations) before users can cause data loss
- **Dependency-driven:** Exclusion system (Phase 2) builds on stable archiving (Phase 1); recovery (Phase 3) requires both working
- **Risk mitigation:** Critical pitfalls (data loss, orphaned commits) addressed in Phase 1 before expanding scope
- **MVP focus:** Phases 1-3 deliver complete MVP (archive + map + restore); Phase 4 deferred until validation
- **Component boundaries:** Archive workflow (Phase 1) is independent from exclusion system (Phase 2), enabling parallel development if needed

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 3 (Integration & Recovery):** CLI UX patterns for progress indicators and multi-step operations need investigation
- **Phase 4 (Enhanced Archiving):** Diff algorithms for milestone comparison and validation strategies for pre-archive checks

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Foundation & Safety):** File archiving, git integration, markdown registries all have well-documented Node.js patterns
- **Phase 2 (Exclusion System):** .gitignore spec is standardized, ignore package is well-documented with examples

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | **HIGH** | Node.js official docs (v25.4.0), npm packages verified (simple-git 3.28.0, ignore 7.0.0), active maintenance confirmed |
| Features | **MEDIUM** | Web research from 2025 sources, cross-verified with official Git docs and GitHub documentation for workflow patterns |
| Architecture | **HIGH** | Verified with existing GSD codebase exploration + 2025 CLI design best practices (clig.dev, Microsoft .NET CLI guidance) |
| Pitfalls | **HIGH** | Official Git documentation, platform docs (Node.js, POSIX, Windows), community consensus from Stack Overflow |

**Overall confidence:** HIGH

Research based on official documentation (Node.js, Git, npm packages), current codebase patterns in `.github/skills/get-shit-done/`, and 2025-dated best practices from authoritative sources (Microsoft, PatternFly, clig.dev). All package versions verified as current (simple-git 3.28.0, ignore 7.0.0).

### Gaps to Address

- **Cross-platform testing coverage:** Need explicit CI tests for Windows path handling and filesystem differences (validate Phase 3 works on Windows/macOS/Linux)
- **Recovery edge cases:** Restore workflow needs testing for partial archives, corrupted manifests, cross-version compatibility
- **Pattern validation UX:** How to communicate "this pattern is too broad" without annoying experienced users (needs UX testing in Phase 2)
- **Archive size limits:** No research on handling extremely large milestones (thousands of files, gigabytes); may need streaming or chunking strategy

These gaps should be addressed through spike tasks during phase planning or flagged for explicit testing in phase plans.

## Sources

### Primary (HIGH confidence)
- **Node.js v25.4.0 Documentation** — fs.promises API, path module, cross-platform file operations
- **Git Official Documentation** — git status, orphan branches, ref tracking, archive operations
- **npm Official Registry** — simple-git (v3.28.0, 7M+ weekly downloads), ignore (v7.0.0, spec 2.22.1 compliant)
- **GSD CLI Codebase** — Existing patterns in `.github/skills/get-shit-done/` (command-workflow separation, agent orchestration)

### Secondary (MEDIUM confidence)
- **CLI Design Best Practices (2025)** — clig.dev, Microsoft .NET CLI Design Guidance, PatternFly CLI Handbook
- **GitIgnore Specification** — Official .gitignore spec 2.22.1, GitHub's gitignore templates collection
- **Web Research (2025)** — Document archiving best practices (NotionSender, Documind, RoseMet), code analysis tools (GitLoop, CodeViz), CI/CD integration patterns (GitHub Docs, GitLab)

### Tertiary (LOW confidence)
- None used for final recommendations (all sources MEDIUM or higher)

---
*Research completed: January 27, 2025*
*Ready for roadmap: yes*
