# Requirements: GSD Skills Standardization

**Defined:** 2026-01-22
**Core Value:** Specs in /specs/skills/ must be single source of truth for GSD commands across 3 platforms (Copilot, Claude, Codex)

## v1 Requirements

Requirements for v1.9.1 release. Each maps to roadmap phases.

### Foundation & Schema

- [ ] **FOUN-01**: Create /specs/skills/ directory structure with README
- [ ] **FOUN-02**: Define canonical frontmatter schema (name, description, tools, metadata)
- [ ] **FOUN-03**: Implement conditional syntax support ({{#isClaude}}, {{#isCopilot}}, {{#isCodex}})
- [ ] **FOUN-04**: Create metadata template with platform, versions, generated fields
- [ ] **FOUN-05**: Implement folder-per-skill structure (/specs/skills/gsd-[command]/SKILL.md)
- [ ] **FOUN-06**: Add schema validation with error messages
- [ ] **FOUN-07**: Support frontmatter inheritance for DRY
- [ ] **FOUN-08**: Auto-generate metadata fields (timestamps, versions)

### Command Migration

- [ ] **MIGR-01**: Audit all 29 commands for dependencies and @-references
- [ ] **MIGR-02**: Create command name mapping table (gsd: → gsd-)
- [ ] **MIGR-03**: Migrate 3 LOW complexity commands (help, progress, add-todo)
- [ ] **MIGR-04**: Migrate 4 MEDIUM complexity commands (plan-phase, research-phase, debug, map-codebase)
- [ ] **MIGR-05**: Migrate 3 HIGH complexity commands (new-project, execute-phase, new-milestone)
- [ ] **MIGR-06**: Migrate remaining 19 commands in batch
- [ ] **MIGR-07**: Preserve @-references functionality across all commands
- [ ] **MIGR-08**: Maintain multi-section XML structure in all specs
- [ ] **MIGR-09**: Create batch migration tool for simple commands
- [ ] **MIGR-10**: Build validation suite (legacy vs new comparison)
- [ ] **MIGR-11**: Generate migration guide with examples

### Multi-Platform Support

- [ ] **PLAT-01**: Add generateSkillsFromSpecs() function to install.js
- [ ] **PLAT-02**: Integrate skill generation into installClaude()
- [ ] **PLAT-03**: Integrate skill generation into installCopilot()
- [ ] **PLAT-04**: Integrate skill generation into installCodex()
- [ ] **PLAT-05**: Implement tool mapping (Claude tools → platform equivalents)
- [ ] **PLAT-06**: Support platform-specific content via conditionals
- [ ] **PLAT-07**: Test installation on Claude Code
- [ ] **PLAT-08**: Test installation on GitHub Copilot CLI
- [ ] **PLAT-09**: Test installation on Codex CLI
- [ ] **PLAT-10**: Add platform detection with graceful fallbacks
- [ ] **PLAT-11**: Create platform capability matrix documentation

### Orchestration & Subagents

- [ ] **ORCH-01**: Verify Task tool spawning works in new format
- [ ] **ORCH-02**: Test subagent spawning with gsd-project-researcher
- [ ] **ORCH-03**: Test subagent spawning with gsd-roadmapper
- [ ] **ORCH-04**: Test subagent spawning with gsd-executor
- [ ] **ORCH-05**: Test subagent spawning with gsd-planner
- [ ] **ORCH-06**: Validate structured return parsing in orchestrators
- [ ] **ORCH-07**: Support agent context passing via @-references
- [ ] **ORCH-08**: Test parallel subagent spawning (new-project scenario)

### Testing & Validation

- [ ] **TEST-01**: Create Jest test suite for spec parsing
- [ ] **TEST-02**: Add tests for conditional rendering
- [ ] **TEST-03**: Add tests for frontmatter validation
- [ ] **TEST-04**: Add tests for metadata generation
- [ ] **TEST-05**: Create integration tests for all 3 platforms
- [ ] **TEST-06**: Test --all flag with parallel installation
- [ ] **TEST-07**: Test legacy fallback when spec missing
- [ ] **TEST-08**: Add regression tests for 29 commands
- [ ] **TEST-09**: Test @-reference resolution with variable interpolation
- [ ] **TEST-10**: Validate YAML parser compatibility across platforms

### Documentation & Migration

- [ ] **DOCS-01**: Create /specs/skills/README.md with structure explanation
- [ ] **DOCS-02**: Document frontmatter schema with examples
- [ ] **DOCS-03**: Document conditional syntax usage
- [ ] **DOCS-04**: Create migration guide for future commands
- [ ] **DOCS-05**: Update main README.md with new structure
- [ ] **DOCS-06**: Document install.js changes
- [ ] **DOCS-07**: Create troubleshooting guide for common issues
- [ ] **DOCS-08**: Update CHANGELOG.md with v1.9.1 changes
- [ ] **DOCS-09**: Document legacy → new spec transition strategy
- [ ] **DOCS-10**: Create command reference comparison (old vs new)

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Features

- **ADV-01**: Hot-reload skills without reinstalling
- **ADV-02**: Skill versioning with compatibility checks
- **ADV-03**: Skill marketplace/registry support
- **ADV-04**: Interactive skill tester/debugger
- **ADV-05**: Skill analytics (usage tracking, performance)

### Automation

- **AUTO-01**: Auto-migration script for legacy commands
- **AUTO-02**: CI/CD pipeline for spec validation
- **AUTO-03**: Automated platform testing matrix
- **AUTO-04**: Auto-sync specs to installed locations

## Out of Scope

| Feature | Reason |
|---------|--------|
| Modifying legacy ./commands/gsd/ structure | Coexistence strategy, legacy remains unchanged |
| Backward compatibility for old installations | New structure is opt-in via fresh install |
| Skill dependency management | Single-level structure sufficient for v1 |
| Dynamic skill loading at runtime | Installation-time generation is proven pattern |
| Graphical skill editor | CLI-first project, text files are primary interface |
| Support for non-GSD skills | Focused on GSD command migration only |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| FOUN-01 | Phase 1 | Pending |
| FOUN-02 | Phase 1 | Pending |
| FOUN-03 | Phase 2 | Pending |
| FOUN-04 | Phase 1 | Pending |
| FOUN-05 | Phase 1 | Pending |
| FOUN-06 | Phase 7 | Pending |
| FOUN-07 | Phase 2 | Pending |
| FOUN-08 | Phase 2 | Pending |
| MIGR-01 | Phase 3 | Pending |
| MIGR-02 | Phase 1 | Pending |
| MIGR-03 | Phase 5 | Pending |
| MIGR-04 | Phase 4 | Pending |
| MIGR-05 | Phase 3 | Pending |
| MIGR-06 | Phase 5 | Pending |
| MIGR-07 | Phase 3, 4, 5 | Pending |
| MIGR-08 | Phase 3, 4, 5 | Pending |
| MIGR-09 | Phase 5 | Pending |
| MIGR-10 | Phase 6 | Pending |
| MIGR-11 | Phase 8 | Pending |
| PLAT-01 | Phase 2 | Pending |
| PLAT-02 | Phase 2 | Pending |
| PLAT-03 | Phase 2 | Pending |
| PLAT-04 | Phase 2 | Pending |
| PLAT-05 | Phase 7 | Pending |
| PLAT-06 | Phase 7 | Pending |
| PLAT-07 | Phase 7 | Pending |
| PLAT-08 | Phase 7 | Pending |
| PLAT-09 | Phase 7 | Pending |
| PLAT-10 | Phase 7 | Pending |
| PLAT-11 | Phase 7 | Pending |
| ORCH-01 | Phase 3 | Pending |
| ORCH-02 | Phase 3 | Pending |
| ORCH-03 | Phase 3 | Pending |
| ORCH-04 | Phase 3 | Pending |
| ORCH-05 | Phase 3 | Pending |
| ORCH-06 | Phase 4, 6 | Pending |
| ORCH-07 | Phase 4 | Pending |
| ORCH-08 | Phase 6 | Pending |
| TEST-01 | Phase 7 | Pending |
| TEST-02 | Phase 7 | Pending |
| TEST-03 | Phase 7 | Pending |
| TEST-04 | Phase 7 | Pending |
| TEST-05 | Phase 7 | Pending |
| TEST-06 | Phase 7 | Pending |
| TEST-07 | Phase 7 | Pending |
| TEST-08 | Phase 7 | Pending |
| TEST-09 | Phase 6 | Pending |
| TEST-10 | Phase 7 | Pending |
| DOCS-01 | Phase 8 | Pending |
| DOCS-02 | Phase 8 | Pending |
| DOCS-03 | Phase 8 | Pending |
| DOCS-04 | Phase 8 | Pending |
| DOCS-05 | Phase 8 | Pending |
| DOCS-06 | Phase 8 | Pending |
| DOCS-07 | Phase 8 | Pending |
| DOCS-08 | Phase 8 | Pending |
| DOCS-09 | Phase 8 | Pending |
| DOCS-10 | Phase 8 | Pending |

**Coverage:**
- v1 requirements: 59 total
- Mapped to phases: 59 ✓
- Unmapped: 0

---
*Requirements defined: 2026-01-22*
*Last updated: 2026-01-22 after roadmap creation - all 59 requirements mapped to phases*
