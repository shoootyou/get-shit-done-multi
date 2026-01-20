# Requirements: GSD Milestone & Codebase Management

**Defined:** 2026-01-20
**Core Value:** Completed milestones must be archived with full historical traceability while enabling a clean slate for next milestone planning, and codebase analysis must accurately reflect application code only.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Archiving

- [x] **ARCH-01**: User can archive completed milestone with /gsd:archive-milestone command
- [x] **ARCH-02**: archive-milestone validates git working directory is clean before proceeding
- [x] **ARCH-03**: archive-milestone creates .planning/history/[milestone-name]/ directory
- [x] **ARCH-04**: archive-milestone moves ROADMAP.md, STATE.md, PROJECT.md, REQUIREMENTS.md to history folder
- [x] **ARCH-05**: archive-milestone moves research/ and phases/ directories to history folder
- [x] **ARCH-06**: archive-milestone preserves .planning/codebase/ (keeps last map active)
- [x] **ARCH-07**: archive-milestone creates/updates .planning/MILESTONES.md registry
- [x] **ARCH-08**: MILESTONES.md includes: milestone name, completion date, archive location, requirements completed count
- [x] **ARCH-09**: MILESTONES.md includes: key commit SHA references from the milestone
- [x] **ARCH-10**: archive-milestone commits archival with descriptive message
- [x] **ARCH-11**: User receives confirmation prompt before archiving (prevent accidental execution)
- [x] **ARCH-12**: archive-milestone creates git tag "archive/[milestone-name]" for historical reference

### Listing & Restore

- [x] **LIST-01**: User can list all archived milestones with /gsd:list-milestones command
- [x] **LIST-02**: list-milestones shows: milestone name, date archived, location, requirement count
- [x] **REST-01**: User can restore archived milestone with /gsd:restore-milestone [name] command
- [x] **REST-02**: restore-milestone validates git working directory is clean before proceeding
- [x] **REST-03**: restore-milestone moves files from .planning/history/[milestone-name]/ back to .planning/
- [x] **REST-04**: restore-milestone updates MILESTONES.md to mark milestone as "restored"

### Codebase Mapping

- [x] **MAP-01**: map-codebase excludes .claude directory from analysis
- [x] **MAP-02**: map-codebase excludes .github directory from analysis
- [x] **MAP-03**: map-codebase excludes .codex directory from analysis
- [x] **MAP-04**: map-codebase excludes node_modules directory from analysis
- [x] **MAP-05**: map-codebase excludes .git directory from analysis
- [x] **MAP-06**: map-codebase excludes dist, build, out, target, coverage directories from analysis
- [x] **MAP-07**: map-codebase respects .gitignore patterns when analyzing codebase
- [x] **MAP-08**: map-codebase reads .planning/map-config.json for custom exclusion patterns (optional)
- [x] **MAP-09**: map-codebase generates directory tree visualization in STRUCTURE.md
- [x] **MAP-10**: map-codebase includes file count and line count metrics in documents

### Exclusion Enforcement (Phase 2.1 - INSERTED)

- [x] **FIX-01**: map-codebase workflow builds complete exclusion list from defaults + .gitignore + custom config
- [x] **FIX-02**: map-codebase workflow passes explicit exclusion list to each agent in spawn prompt
- [x] **FIX-03**: gsd-codebase-mapper agent applies exclusions to all tool calls (Grep, Glob, Bash)
- [x] **FIX-04**: Empty directory test (only .github/) produces documents with 0 files found

### Integration

- [x] **INT-01**: verify-milestone workflow modified to suggest archive-milestone after successful verification
- [x] **INT-02**: archive-milestone suggests running /gsd:map-codebase after completion
- [x] **INT-03**: archive-milestone output shows clear next steps (map refresh, new milestone planning)
- [x] **INT-04**: MILESTONES.md file created with proper markdown table structure
- [x] **INT-05**: All archive operations use atomic file moves to prevent partial state

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Archiving

- **ARCH-ADV-01**: Archive comparison (diff between two milestones showing changes)
- **ARCH-ADV-02**: Archive analytics (time-to-complete, velocity trends)
- **ARCH-ADV-03**: Selective restore (restore specific files from archive)
- **ARCH-ADV-04**: Pre-archive validation (verify all phase goals met)
- **ARCH-ADV-05**: Post-archive hooks (run custom automation scripts)

### Advanced Mapping

- **MAP-ADV-01**: Language-aware analysis (show % breakdown by language)
- **MAP-ADV-02**: Documentation coverage analysis
- **MAP-ADV-03**: Dependency graph visualization
- **MAP-ADV-04**: Hotspot identification (high-churn files from git history)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Full version control inside archive | You already have Git - don't reimplement it. Use git tags and SHAs. |
| Real-time codebase monitoring | Performance killer for large codebases. Manual or event-triggered refresh only. |
| Unlimited archive history | Storage bloat. Consider retention policy in v2+. |
| Archive everything including dependencies | node_modules in archive = gigabytes. Archive package.json only. |
| AI-generated milestone summaries | AI hallucinations in historical records. User writes summary. |
| Automatic archive on timeline | False positives for long phases. Manual archive only. |
| Incremental codebase mapping | Full re-analysis for accuracy. Performance acceptable for milestone transitions. |
| Cross-milestone dependency tracking | Each milestone is self-contained. |
| Archive compression/optimization | Clarity over space savings. |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| ARCH-01 | Phase 1 | Complete |
| ARCH-02 | Phase 1 | Complete |
| ARCH-03 | Phase 1 | Complete |
| ARCH-04 | Phase 1 | Complete |
| ARCH-05 | Phase 1 | Complete |
| ARCH-06 | Phase 1 | Complete |
| ARCH-07 | Phase 1 | Complete |
| ARCH-08 | Phase 1 | Complete |
| ARCH-09 | Phase 1 | Complete |
| ARCH-10 | Phase 1 | Complete |
| ARCH-11 | Phase 1 | Complete |
| ARCH-12 | Phase 1 | Complete |
| LIST-01 | Phase 3 | Complete |
| LIST-02 | Phase 3 | Complete |
| REST-01 | Phase 3 | Complete |
| REST-02 | Phase 3 | Complete |
| REST-03 | Phase 3 | Complete |
| REST-04 | Phase 3 | Complete |
| MAP-01 | Phase 2 | Complete |
| MAP-02 | Phase 2 | Complete |
| MAP-03 | Phase 2 | Complete |
| MAP-04 | Phase 2 | Complete |
| MAP-05 | Phase 2 | Complete |
| MAP-06 | Phase 2 | Complete |
| MAP-07 | Phase 2 | Complete |
| MAP-08 | Phase 2 | Complete |
| MAP-09 | Phase 2 | Complete |
| MAP-10 | Phase 2 | Complete |
| FIX-01 | Phase 2.1 | Complete |
| FIX-02 | Phase 2.1 | Complete |
| FIX-03 | Phase 2.1 | Complete |
| FIX-04 | Phase 2.1 | Complete |
| INT-01 | Phase 4 | Complete |
| INT-02 | Phase 4 | Complete |
| INT-03 | Phase 4 | Complete |
| INT-04 | Phase 4 | Complete |
| INT-05 | Phase 4 | Complete |

**Coverage:**
- v1 requirements: 37 total
- Mapped to phases: 37 ✓
- Unmapped: 0

---
*Requirements defined: 2026-01-20*
*Last updated: 2026-01-20 after initial definition*
