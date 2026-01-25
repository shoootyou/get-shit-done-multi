# Project Research Summary

**Project:** GSD Skills Migration to Multi-Platform Spec Format
**Domain:** CLI tool skill/command specification and multi-platform installation system
**Researched:** January 22, 2025
**Confidence:** HIGH

## Executive Summary

This project migrates 29 GSD commands from a Claude-specific format (`.claude/commands/gsd/*.md`) to a unified spec-based system (`/specs/skills/`) that generates platform-specific outputs for Claude Code, GitHub Copilot CLI, and Codex CLI. The architecture is proven—GSD already has a working template system used for agents that handles Mustache-style conditionals (`{{#isClaude}}`), tool mapping, and platform-specific generation. The skills migration reuses 95% of this existing infrastructure.

**Recommended approach:** Create a single source of truth per skill in `/specs/skills/gsd-{command}/SKILL.md` with platform-specific conditionals in the frontmatter. The existing template engine (spec-parser → context-builder → engine → tool-mapper → platform adapters) processes these specs at install time, generating the correct format for each platform. Legacy commands remain as fallback during transition, enabling gradual migration without breaking existing installations.

**Key risks:** (1) Incomplete cross-reference migration causing command invocation failures, (2) frontmatter parsing differences between platforms breaking installations, and (3) breaking changes disguised as "just formatting" that reduce functionality. All three are preventable through: comprehensive reference auditing before migration, least-common-denominator YAML approach with multi-parser validation, and feature parity testing per command.

## Key Findings

### Recommended Stack

The project already has all required technology in place with zero additional dependencies needed. GSD's existing template system is a complete solution for spec-based multi-platform generation.

**Core technologies:**
- **Node.js 16.7.0+**: Runtime environment — already in use, built-in modules only (fs, path, util), meets zero-dependencies constraint
- **gray-matter 4.0.3**: YAML frontmatter parsing — proven in spec-parser.js, handles `---` delimited frontmatter reliably
- **js-yaml 4.1.1**: YAML serialization — handles platform-specific formatting (arrays vs strings), used in engine.js and generator.js
- **Mustache-style conditionals**: Template engine — custom regex-based in engine.js, handles `{{#varName}}...{{/varName}}` and `{{variable}}` substitution

**Critical insight:** The agent spec system (`/specs/agents/*.md`) already does exactly what skills need. The v1.9 agent migration proves the architecture with 208 passing tests covering the template pipeline, tool mapping, and platform generation. Skills follow the identical pattern with minor adaptations for folder structure (`gsd-*/SKILL.md`) and target directories (commands vs agents).

### Expected Features

Based on analysis of all 29 existing commands, these features must be preserved during migration:

**Must have (table stakes — migration fails without these):**
- **Frontmatter metadata**: name, description, allowed-tools fields — every command depends on this for identity and tool access
- **@-references**: Load context via `@path` syntax — 25+ commands use this extensively for templates, workflows, state files
- **Multi-section structure**: `<objective>`, `<process>`, `<success_criteria>`, etc. — provides command organization
- **Tool mappings**: Platform-specific tool translation (Claude's `Bash` → Copilot's `execute`) — commands cannot execute without correct tool access
- **Conditional content**: `{{#isClaude}}` / `{{#isCopilot}}` for platform differences — required for multi-platform deployment
- **Subagent spawning**: Task tool invocation with structured prompts — 8 commands spawn subagents (orchestrators are critical path)
- **Argument handling**: Parse `$ARGUMENTS` with flags like `--research`, `--gaps-only` — 15+ commands depend on arguments
- **Structured returns**: Commands return specific formats (`## RESEARCH COMPLETE`) — orchestrators parse these to route workflow
- **Process subsections**: Phase/step blocks within `<process>` — 15+ commands use multi-stage execution
- **Embedded bash blocks**: Validation and state manipulation inline — 20+ commands use bash for checks

**Should have (quality enhancements):**
- **Git integration patterns**: Auto-commits with semantic messages (12 commands use this for audit trail)
- **State persistence conventions**: Updates to STATE.md, ROADMAP.md (10 commands maintain state)
- **Verification loops**: Plan verification before execution, phase verification after (prevents issues before context burned)
- **Wave-based parallelization**: Groups tasks by dependency, runs waves in parallel (3-5x speedup in execute-phase)
- **Checkpoint protocol**: Pause for user approval at critical points (interactive vs YOLO modes)

**Defer (v2+):**
- **Research routing framework**: Generalized parallel researcher spawning (currently works but ad-hoc)
- **Gap closure automation**: Auto-detect and auto-plan gaps after verification (currently manual)
- **Context budget tracking**: Automatic context pressure monitoring (currently implicit)
- **Debug persistence**: Cross-session debug state (debug command has basic version)

### Architecture Approach

The new `/specs/skills/` structure mirrors the proven `/specs/agents/` pattern. Single specs with Mustache conditionals flow through the template system to generate platform-specific outputs. The architecture supports gradual migration—legacy commands remain functional as specs are migrated one at a time.

**Major components:**
1. **Spec layer** (`/specs/skills/gsd-*/SKILL.md`) — Single source of truth with `{{#isClaude}}` conditionals for platform variations
2. **Template engine** (`bin/lib/template-system/`) — spec-parser → context-builder → engine → tool-mapper → field-transformer pipeline (proven with 208 tests)
3. **Platform adapters** (`bin/lib/adapters/*.js`) — `getTargetDirs()`, `convertContent()`, `verify()` interface provides platform-specific installation (Claude, Copilot, Codex)
4. **Install orchestrator** (`bin/install.js`) — Coordinates generation and installation, handles dual-source (specs + legacy fallback)

**Data flow:** Developer writes spec → install.js detects platform → generateSkillsFromSpecs() processes specs → engine renders conditionals → tool-mapper translates tools → adapter writes to platform-specific location → platform CLI discovers and loads command.

**Legacy compatibility strategy:** Specs generate first, legacy copies second (same filename). Generated specs overwrite static files. Commands not yet migrated to specs still install from legacy. Zero breaking changes during transition.

### Critical Pitfalls

Based on common migration patterns and multi-platform system analysis:

1. **Incompletely migrated command references** — Commands reference each other by name (`gsd:command` vs `gsd-command`). Partial migration causes invocation failures when one command tries to invoke another. **Prevention:** Create complete mapping table before migration, audit all cross-references with `grep -r`, use semantic replacement (not string replace), test invocation chains end-to-end.

2. **Platform-specific frontmatter breaks installation** — Conditional frontmatter sections don't render correctly, causing missing tool declarations or syntax errors. Commands install but fail at runtime with "tool not available." **Prevention:** Evaluate conditionals BEFORE writing to platform directory (not after), validate generated output has no template syntax remaining, test installation on all 3 platforms in CI.

3. **Metadata schema drift** — Metadata fields inconsistent between agents and skills (`projectVersion` vs `project_version`), causing template generation failures or version detection breakage. **Prevention:** Define canonical schema in `/specs/README.md`, add JSON Schema validation to install.js, enforce schema in all specs with linting pre-commit hook.

4. **Legacy path assumptions** — install.js has hardcoded paths (`./commands/gsd/`), glob patterns don't match new folder structure, path rewriting assumes flat files. **Prevention:** Extract path configuration to constants, use unified glob patterns supporting both flat and nested, make adapters path-agnostic with proper `path.join()`.

5. **Breaking changes disguised as formatting** — "Just changing format" reduces functionality: descriptions shortened, tool permissions reduced, examples removed, aliases lost. Users upgrade and commands become less capable. **Prevention:** Feature parity checklist per command, behavioral smoke tests comparing old vs new output, explicit documentation of intentional changes in CHANGELOG.

## Implications for Roadmap

Based on research, the migration should proceed incrementally with careful validation at each step. The architecture is proven, so the focus is on methodical migration and compatibility preservation.

### Phase 1: Foundation & Schema
**Rationale:** Establish standards and prove architecture before bulk migration. This prevents rework and catches issues when they're cheapest to fix.
**Delivers:** `/specs/skills/` directory structure, canonical metadata schema, one test skill migration (gsd-help), enhanced install.js with generateSkillsFromSpecs()
**Addresses:** Metadata schema drift pitfall, legacy path assumptions
**Features:** Frontmatter metadata, tool mappings, conditional content (table stakes)
**Research needs:** STANDARD (well-documented Node.js patterns, existing template system to replicate)

### Phase 2: Core Command Migration (High Complexity)
**Rationale:** Migrate critical orchestration commands first to validate subagent spawning and argument handling work correctly. These are highest risk/highest value.
**Delivers:** new-project, new-milestone, execute-phase in spec format
**Addresses:** Incompletely migrated command references (audit before migration), breaking changes disguised as formatting (feature parity testing)
**Features:** Subagent spawning, argument handling, structured returns, @-references (all critical)
**Research needs:** PHASE-SPECIFIC for new-project (orchestrates 5 agents), otherwise STANDARD patterns

### Phase 3: Middle Complexity Commands
**Rationale:** With orchestrators working, migrate planning and verification commands (1-2 subagent spawns each)
**Delivers:** plan-phase, research-phase, debug, map-codebase in spec format
**Addresses:** Platform-specific frontmatter validation (test on all platforms)
**Features:** Verification loops, process subsections, embedded bash
**Research needs:** STANDARD (patterns established in Phase 2)

### Phase 4: Simple Commands (Bulk)
**Rationale:** Remaining 21 commands are single-stage, no orchestration—fast to migrate with proven patterns
**Delivers:** progress, add-todo, check-todos, help, verify-installation, etc. in spec format
**Features:** Basic frontmatter, simple tool usage
**Research needs:** SKIP (trivial migrations following template)

### Phase 5: Validation & Documentation
**Rationale:** Ensure no breaking changes, document new system for contributors
**Delivers:** Multi-platform integration tests, migration guide, contributor docs
**Addresses:** All pitfalls verified prevented through testing
**Research needs:** SKIP (testing and documentation)

### Phase 6: Legacy Deprecation (Future)
**Rationale:** After proving specs in production, sunset legacy format
**Delivers:** Remove `./commands/gsd/` directory, spec-only system
**Research needs:** SKIP (cleanup phase)

### Phase Ordering Rationale

- **Foundation first**: Prevents rework by establishing standards. Testing with simplest command (gsd-help) proves architecture before risking complex commands.
- **Complexity-based ordering**: High complexity first validates hardest patterns (subagent spawning, orchestration). If these work, simpler commands are guaranteed to work.
- **Incremental risk**: Each phase delivers working commands. Rollback is always possible (legacy fallback remains functional).
- **Parallel-safe**: Phases 2-4 could be parallelized after Phase 1 completes (command migrations are independent once pipeline established).

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 2 (new-project)**: Complex orchestration with 5 parallel agents + synthesizer, needs research on parallel Task spawning patterns and result aggregation

Phases with standard patterns (skip research-phase):
- **Phase 1**: Replicates existing agent spec pattern, no new patterns
- **Phase 3-4**: Follow patterns established in Phase 2
- **Phase 5-6**: Testing and cleanup, no new development

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All technology already in use with 208 tests proving it works. Zero new dependencies. |
| Features | HIGH | Analyzed all 29 existing commands, observable patterns, 100% coverage of current usage. |
| Architecture | HIGH | Proven with agents in v1.9, clear precedent exists. Integration points identified in install.js. |
| Pitfalls | HIGH | Based on observed codebase patterns (path assumptions, metadata inconsistencies) and well-documented migration anti-patterns from npm, Python packaging, etc. |

**Overall confidence:** HIGH

All critical components are proven in the codebase. The agent spec system is an exact precedent that works in production. The main uncertainty is execution risk (methodical testing needed), not architectural risk.

### Gaps to Address

Minimal gaps due to strong existing precedent:

- **Frontmatter parser compatibility across platforms**: Research identified YAML 1.1 vs 1.2 differences. **Resolution:** Use least-common-denominator YAML (quoted strings, block style only), validate with multiple parsers before committing specs.

- **Command name collision during transition**: Users may have both legacy and new installed. **Resolution:** Phase 1 adds detection and warning in install.js, documentation includes explicit uninstall-then-install instructions.

- **Parallel installation safety**: `--all` flag may have race conditions. **Resolution:** Phase 1 implements sequential-by-default installation, isolated working directories per adapter.

## Sources

### Primary (HIGH confidence)
- **Existing commands**: `.claude/commands/gsd/*.md` (29 files) — Direct observation of frontmatter schema, @-reference patterns, tool usage, subagent spawning
- **Existing agent specs**: `specs/agents/*.md` (14 files) — Working examples of conditional syntax, tool mapping, Mustache templates
- **Template system**: `bin/lib/template-system/*.js` (15 modules, 208 tests) — Proven generation pipeline, validates architecture works
- **Adapter system**: `bin/lib/adapters/*.js` (3 adapters) — Platform-specific interfaces, path handling, content transformation
- **Install orchestrator**: `bin/install.js` (1100+ lines) — Integration points, existing agent generation to replicate
- **Project requirements**: `.planning/PROJECT.md` — Explicit requirements for this migration

### Secondary (MEDIUM confidence)
- **Migration pattern research**: npm, pip, RubyGems format migrations — Common pitfalls (metadata drift, path assumptions, breaking changes disguised as formatting)
- **Multi-platform CLI patterns**: Git, Docker cross-platform tools — Command parity challenges, installation patterns
- **YAML specification differences**: YAML 1.1 vs 1.2 — Parser compatibility issues (would benefit from testing on actual platform CLIs)

### Tertiary (LOW confidence)
- None — all research based on primary sources (existing codebase) or well-documented migration patterns

---
*Research completed: January 22, 2025*
*Ready for roadmap: yes*
*Next step: Create ROADMAP.md with 6 phases based on implications above*
