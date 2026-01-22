# Dependency Audit: Phase 3 Orchestrators

**Date:** 2026-01-22  
**Purpose:** Document all cross-command dependencies, @-references, and orchestration relationships before migration to prevent breakage

## Summary

- **Total @-references found:** 80 across all commands
- **Commands with @-references:** 24/29 commands
- **Unique reference targets:** 34 distinct files/paths
- **Template files referenced:** 7 unique templates
- **Reference files referenced:** 4 unique reference docs
- **Workflow files referenced:** 7 unique workflows
- **Planning artifacts referenced:** 10 unique artifact types

### Top @-reference Consumers

| Command | Count | Type |
|---------|-------|------|
| new-milestone | 12 | Orchestrator |
| plan-phase | 11 | Orchestrator |
| new-project | 9 | Orchestrator |
| execute-phase | 8 | Orchestrator |
| verify-work | 4 | Consumer |
| plan-milestone-gaps | 4 | Consumer |
| discuss-phase | 4 | Consumer |
| audit-milestone | 4 | Consumer |

## Reference Categories

### Templates (7 files)
- `@~/.claude/get-shit-done/templates/project.md` — used 2x (new-project, new-milestone)
- `@~/.claude/get-shit-done/templates/requirements.md` — used 2x (new-project, new-milestone)
- `@~/.claude/get-shit-done/templates/context.md` — used 1x
- `@~/.claude/get-shit-done/templates/milestone-archive.md` — used 1x
- `@~/.claude/get-shit-done/templates/UAT.md` — used 1x

### Reference Files (4 files)
- `@~/.claude/get-shit-done/references/ui-brand.md` — used 4x (new-project, new-milestone, execute-phase, help)
- `@~/.claude/get-shit-done/references/questioning.md` — used 2x (new-project, new-milestone)

### Workflow Files (7 files)
- `@~/.claude/get-shit-done/workflows/execute-phase.md` — used 2x
- `@~/.claude/get-shit-done/workflows/resume-project.md` — used 2x
- `@~/.claude/get-shit-done/workflows/verify-work.md` — used 1x
- `@~/.claude/get-shit-done/workflows/map-codebase.md` — used 1x
- `@~/.claude/get-shit-done/workflows/list-phase-assumptions.md` — used 1x
- `@~/.claude/get-shit-done/workflows/discuss-phase.md` — used 1x
- `@~/.claude/get-shit-done/workflows/complete-milestone.md` — used 1x

### Planning Artifacts (Most Referenced)
- `@.planning/STATE.md` — used 16x (most referenced file!)
- `@.planning/ROADMAP.md` — used 12x
- `@.planning/REQUIREMENTS.md` — used 6x
- `@.planning/PROJECT.md` — used 5x
- `@.planning/config.json` — used 4x
- `@.planning/research/SUMMARY.md` — used 2x
- `@.planning/MILESTONES.md` — used 1x
- `@.planning/phases/{phase_dir}/*-PLAN.md` — dynamic
- `@.planning/phases/{phase_dir}/{phase}-VERIFICATION.md` — dynamic
- `@.planning/phases/{phase_dir}/{phase}-UAT.md` — dynamic
- `@.planning/phases/{phase_dir}/{phase}-RESEARCH.md` — dynamic
- `@.planning/phases/{phase_dir}/{phase}-CONTEXT.md` — dynamic
- `@.planning/debug/{slug}.md` — dynamic

## By Command

### gsd-new-project

**@-references (count: 9):**
- Line 32: `@~/.claude/get-shit-done/references/questioning.md` — Deep questioning patterns
- Line 33: `@~/.claude/get-shit-done/references/ui-brand.md` — UI/UX guidelines
- Line 34: `@~/.claude/get-shit-done/templates/project.md` — PROJECT.md template
- Line 35: `@~/.claude/get-shit-done/templates/requirements.md` — REQUIREMENTS.md template
- Line 688: `@.planning/PROJECT.md` — Shows created artifact to user
- Line 691: `@.planning/REQUIREMENTS.md` — Shows created artifact to user
- Line 694: `@.planning/research/SUMMARY.md` — Shows research summary to user
- Line 697: `@.planning/config.json` — Shows config to user
- Line 783: `@.planning/ROADMAP.md` — Shows roadmap to user

**Spawns subagents:**
- `gsd-project-researcher` (4 parallel) — Stack, Features, Architecture, Pitfalls research
- `gsd-research-synthesizer` (1) — Synthesize research into SUMMARY.md
- `gsd-roadmapper` (1) — Create ROADMAP.md
- `gsd-roadmapper` (1 conditional) — Revise roadmap if user provides feedback

**Total spawns:** Up to 7 subagents

**Creates artifacts:**
- `.planning/PROJECT.md` — Project context and vision
- `.planning/config.json` — Workflow preferences (mode, depth, parallelization)
- `.planning/research/` directory
  - `.planning/research/01-stack.md`
  - `.planning/research/02-features.md`
  - `.planning/research/03-architecture.md`
  - `.planning/research/04-pitfalls.md`
  - `.planning/research/SUMMARY.md`
- `.planning/REQUIREMENTS.md` — Scoped requirements
- `.planning/ROADMAP.md` — Phase structure
- `.planning/STATE.md` — Project memory/tracking

**Consumed by:** (19 commands read artifacts this creates)
- `gsd-plan-phase` — reads ROADMAP.md, STATE.md, PROJECT.md
- `gsd-execute-phase` — reads ROADMAP.md, STATE.md
- `gsd-progress` — reads STATE.md, ROADMAP.md
- `gsd-new-milestone` — reads PROJECT.md, STATE.md, MILESTONES.md, config.json
- `gsd-add-phase` — reads ROADMAP.md, STATE.md
- `gsd-insert-phase` — reads ROADMAP.md, STATE.md
- `gsd-remove-phase` — reads ROADMAP.md, STATE.md
- `gsd-research-phase` — reads ROADMAP.md
- `gsd-discuss-phase` — reads ROADMAP.md, STATE.md
- `gsd-list-phase-assumptions` — reads ROADMAP.md, STATE.md
- `gsd-complete-milestone` — reads ROADMAP.md, STATE.md
- `gsd-archive-milestone` — reads ROADMAP.md, STATE.md
- `gsd-restore-milestone` — reads STATE.md
- `gsd-audit-milestone` — reads ROADMAP.md
- `gsd-check-todos` — reads ROADMAP.md, STATE.md
- `gsd-add-todo` — reads STATE.md
- `gsd-verify-work` — reads ROADMAP.md, STATE.md
- `gsd-plan-milestone-gaps` — reads STATE.md
- `gsd-pause-work` — reads STATE.md
- `gsd-resume-work` — reads STATE.md
- `gsd-map-codebase` — reads STATE.md
- `gsd-help` — reads ROADMAP.md, STATE.md

**Migration risk:** HIGH
- Creates foundational artifacts consumed by 19 other commands
- Spawns 7 subagents with complex orchestration
- Has 9 @-references to templates, references, and created artifacts

### gsd-new-milestone

**@-references (count: 12):**
- Line 33: `@~/.claude/get-shit-done/references/questioning.md` — Deep questioning patterns
- Line 34: `@~/.claude/get-shit-done/references/ui-brand.md` — UI/UX guidelines
- Line 35: `@~/.claude/get-shit-done/templates/project.md` — PROJECT.md template
- Line 36: `@~/.claude/get-shit-done/templates/requirements.md` — REQUIREMENTS.md template
- Line 45: `@.planning/PROJECT.md` — Read existing project context
- Line 46: `@.planning/STATE.md` — Read current state
- Line 47: `@.planning/MILESTONES.md` — Read existing milestones
- Line 48: `@.planning/config.json` — Read workflow preferences
- Line 572: `@.planning/PROJECT.md` — Shows artifact to user
- Line 575: `@.planning/REQUIREMENTS.md` — Shows artifact to user
- Line 578: `@.planning/research/SUMMARY.md` — Shows research summary to user
- Line 581: `@.planning/config.json` — Shows config to user

**Spawns subagents:**
- `gsd-project-researcher` (4 parallel) — Stack, Features, Architecture, Pitfalls research
- `gsd-research-synthesizer` (1) — Synthesize research into SUMMARY.md
- `gsd-roadmapper` (1) — Create milestone roadmap

**Total spawns:** 6 subagents

**Creates artifacts:**
- `.planning/milestones/{slug}/MILESTONE.md` — Milestone definition
- `.planning/milestones/{slug}/ROADMAP.md` — Milestone roadmap
- `.planning/milestones/{slug}/STATE.md` — Milestone state
- `.planning/milestones/{slug}/config.json` — Milestone config
- `.planning/milestones/{slug}/research/` directory
  - `01-stack.md`, `02-features.md`, `03-architecture.md`, `04-pitfalls.md`
  - `SUMMARY.md`
- Updates `.planning/MILESTONES.md` — Append new milestone entry
- Updates `.planning/STATE.md` — Update current milestone

**Consumed by:** (8 commands read artifacts this creates)
- `gsd-complete-milestone` — reads milestone ROADMAP.md, STATE.md
- `gsd-archive-milestone` — reads milestone artifacts
- `gsd-restore-milestone` — reads milestone STATE.md
- `gsd-audit-milestone` — reads milestone ROADMAP.md
- `gsd-list-milestones` — reads MILESTONES.md
- `gsd-plan-milestone-gaps` — reads milestone plans
- `gsd-verify-work` — reads milestone context
- `gsd-progress` — reads active milestone STATE.md

**Migration risk:** MEDIUM-HIGH
- Creates milestone artifacts consumed by 8 other commands
- Spawns 6 subagents with similar pattern to new-project
- Has 12 @-references (most of any command!)
- Similar orchestration pattern to new-project (can reuse migration patterns)

### gsd-execute-phase

**@-references (count: 8):**
- Line 26: `@~/.claude/get-shit-done/references/ui-brand.md` — UI/UX guidelines
- Line 27: `@~/.claude/get-shit-done/workflows/execute-phase.md` — Self-reference to workflow doc
- Line 36: `@.planning/ROADMAP.md` — Read phase structure
- Line 37: `@.planning/STATE.md` — Read current execution state
- Line 234: `@{plan_01_path}` — Plan file for wave 1 executor
- Line 234: `@.planning/STATE.md` — State for wave 1 executor
- Line 235: `@{plan_02_path}` — Plan file for wave 2 executor
- Line 235: `@.planning/STATE.md` — State for wave 2 executor
- Line 236: `@{plan_03_path}` — Plan file for wave 3 executor
- Line 236: `@.planning/STATE.md` — State for wave 3 executor
- Line 250: `@~/.claude/get-shit-done/workflows/execute-phase.md` — Reference to workflow doc

**Spawns subagents:**
- `gsd-executor` (1-N per wave) — Execute individual plans

**Total spawns:** Variable (1-14 per phase based on parallelization)

**Reads artifacts:**
- `.planning/ROADMAP.md` — Get phase structure and plan list
- `.planning/STATE.md` — Get current position, decisions, blockers
- `.planning/phases/{phase_dir}/*-PLAN.md` — Individual plan files to execute

**Writes artifacts:**
- `.planning/STATE.md` — Updates after each plan completes
- `.planning/phases/{phase_dir}/*-SUMMARY.md` — Created by spawned executors

**Consumed by:**
- User via `gsd-progress` — reads updated STATE.md
- Next `gsd-execute-phase` invocation — reads updated STATE.md

**Migration risk:** MEDIUM
- Wave-based spawning pattern (complex orchestration)
- Reads plans created by gsd-plan-phase (external dependency)
- Updates STATE.md that many commands depend on
- 8 @-references including dynamic plan paths
- Simpler than new-project/new-milestone (no research phase)

## Dependency Graph

### Creation → Consumption Flow

```
gsd-new-project
    ├─ creates PROJECT.md ────────────┐
    ├─ creates ROADMAP.md ────────────┤
    ├─ creates STATE.md ──────────────┤
    ├─ creates REQUIREMENTS.md ───────┤
    ├─ creates config.json ───────────┤
    └─ creates research/ ─────────────┤
                                      ↓
                          gsd-plan-phase (reads all)
                                      ├─ creates phases/{dir}/*-PLAN.md
                                      └─ updates ROADMAP.md
                                                ↓
                                      gsd-execute-phase (reads)
                                                ├─ spawns gsd-executor (N times)
                                                ├─ creates *-SUMMARY.md
                                                └─ updates STATE.md
                                                          ↓
                                                gsd-progress (reads STATE.md)

gsd-new-milestone
    ├─ reads PROJECT.md, STATE.md, MILESTONES.md
    ├─ creates milestones/{slug}/MILESTONE.md
    ├─ creates milestones/{slug}/ROADMAP.md
    ├─ creates milestones/{slug}/STATE.md
    └─ updates MILESTONES.md
                ↓
          gsd-complete-milestone, gsd-archive-milestone, etc.
```

### Bidirectional Dependencies

| Creator | Artifact | Consumer(s) |
|---------|----------|-------------|
| new-project | STATE.md | execute-phase, plan-phase, progress, +16 more |
| new-project | ROADMAP.md | execute-phase, plan-phase, progress, +12 more |
| new-project | PROJECT.md | new-milestone, plan-phase, +3 more |
| plan-phase | *-PLAN.md | execute-phase (spawns executors with plan) |
| execute-phase | *-SUMMARY.md | verify-work, progress, audit-milestone |
| new-milestone | MILESTONES.md | list-milestones, complete-milestone, archive-milestone |

### Subagent Dependency Tree

```
Phase 3 Orchestrators
├─ gsd-new-project
│   ├─ spawns gsd-project-researcher (4x parallel)
│   ├─ spawns gsd-research-synthesizer (1x)
│   └─ spawns gsd-roadmapper (1-2x)
│
├─ gsd-new-milestone
│   ├─ spawns gsd-project-researcher (4x parallel)
│   ├─ spawns gsd-research-synthesizer (1x)
│   └─ spawns gsd-roadmapper (1x)
│
└─ gsd-execute-phase
    └─ spawns gsd-executor (1-14x per phase, wave-based)

Note: Subagents are separate specs (not in Phase 3 scope)
      Migration can happen independently
```

## Migration Risk Assessment

| Command | Risk | Reason | Mitigation |
|---------|------|--------|------------|
| **new-project** | **HIGH** | 9 @-refs, 7 subagent spawns, creates foundation artifacts for 19 commands | Migrate last in phase, comprehensive testing, verify all 19 downstream commands |
| **new-milestone** | **MEDIUM-HIGH** | 12 @-refs (most!), 6 subagent spawns, creates milestone artifacts for 8 commands | Similar pattern to new-project, can reuse migration approach |
| **execute-phase** | **MEDIUM** | 8 @-refs, variable spawns (1-14), wave orchestration complexity, updates STATE.md | Migrate first (simplest orchestrator), test wave mechanics thoroughly |

### Risk Factors

**Cross-command reference density:**
- STATE.md referenced by 16 commands (single point of failure)
- ROADMAP.md referenced by 12 commands
- Breaking these during migration cascades to all consumers

**Subagent spawning complexity:**
- new-project: 7 subagent spawns (4 parallel + 3 sequential)
- new-milestone: 6 subagent spawns (4 parallel + 2 sequential)
- execute-phase: 1-14 spawns per phase (wave-based parallelization)

**Template dependencies:**
- Shared templates across commands (questioning.md, ui-brand.md, project.md, requirements.md)
- Breaking template format affects multiple orchestrators

## Parallel Migration Feasibility

### Wave 1 Candidates (Can migrate independently)

**execute-phase:**
- ✅ Reads plans created by plan-phase (not in Phase 3)
- ✅ Doesn't create artifacts consumed by new-project/new-milestone
- ✅ Simpler than the other two (no research phase)
- ✅ Updates STATE.md but doesn't create it
- **Recommendation:** Migrate FIRST to validate orchestrator migration pattern

### Wave 2 Candidates (Have dependencies)

**new-project + new-milestone:**
- ⚠️ Share 4 @-references (questioning.md, ui-brand.md, project.md, requirements.md)
- ⚠️ new-milestone reads PROJECT.md created by new-project
- ⚠️ Share subagent types (project-researcher, research-synthesizer, roadmapper)
- ✅ Don't directly depend on each other at runtime
- ✅ Can migrate in parallel IF:
  - Shared templates tested first
  - Shared subagent behavior verified
  - Different test projects used for validation

### Sequential Requirements

1. **execute-phase before new-project/new-milestone**
   - Simpler orchestration pattern validates migration approach
   - Doesn't risk foundational artifacts (STATE.md, ROADMAP.md creation)

2. **new-project before new-milestone (recommended but not required)**
   - Similar patterns (reuse migration learnings)
   - new-milestone reads artifacts new-project creates
   - However, can be parallel if using separate test scenarios

3. **Orchestrators can migrate before their subagents**
   - Subagents are separate skill specs (not in Phase 3 scope)
   - Orchestrators reference subagent types, not implementations
   - Subagent migration is separate phase

### Recommended Migration Order

**Plan 03-02 (execute-phase):**
- Simplest orchestrator
- No artifact creation dependencies
- Tests wave-based spawning pattern
- Tests @-reference migration for workflows and planning artifacts

**Plan 03-03 (new-milestone):**
- More @-references (12 vs 9) but similar complexity to new-project
- Can validate parallel research pattern
- Tests artifact creation that other commands consume

**Plan 03-04 (new-project):**
- Most critical (19 downstream consumers)
- Benefits from learnings of 03-02 and 03-03
- Foundational artifacts require most careful testing
- Migrate last to reduce risk

**Alternative (if parallel desired):**
- Plan 03-02: execute-phase (wave 1)
- Plan 03-03 + 03-04: new-milestone + new-project (parallel wave 2)
  - Requires separate test projects
  - Shared template changes coordinated
  - Both must complete before phase verification

## Validation Script

See: `scripts/validate-references.sh`

The validation script:
1. Extracts all @-references from commands
2. Expands paths (handles `~` and relative paths)
3. Checks file existence
4. Reports missing references
5. Returns exit code for CI integration

**Usage:**
```bash
./scripts/validate-references.sh
```

**Expected output:**
```
Validating @-references in commands...
✅ All @-references valid
```

## Migration Checklist

Before migrating each orchestrator:

- [ ] Run validation script: `./scripts/validate-references.sh`
- [ ] Identify all @-references in target command
- [ ] Map referenced files to new spec locations
- [ ] Document subagent spawning patterns
- [ ] List all artifacts created
- [ ] List all commands that consume those artifacts
- [ ] Create test scenarios for artifact creation/consumption
- [ ] Plan verification testing with downstream consumers
- [ ] Update this audit with any new findings

After migrating each orchestrator:

- [ ] Re-run validation script
- [ ] Test all downstream consumers
- [ ] Verify subagent spawning works in new spec format
- [ ] Confirm artifact creation matches legacy
- [ ] Update migration risk assessment
- [ ] Document any deviations from expected patterns

## Findings Summary

**Key insights for Phase 3 migration:**

1. **STATE.md is the most critical dependency** (16 references)
   - Any migration affecting STATE.md creation/updates must be tested extensively
   - execute-phase UPDATES but doesn't CREATE → safer to migrate first

2. **Template sharing is extensive**
   - questioning.md, ui-brand.md shared across orchestrators
   - Migrating to specs/ structure must preserve template access patterns

3. **Subagent spawning is complex but standardized**
   - All three use Task() with subagent_type parameter
   - Specs need to support Task-based spawning or adapt pattern

4. **Artifact creation is bidirectional**
   - Orchestrators create artifacts that other commands (and orchestrators) consume
   - Breaking artifact format/location cascades failures

5. **Wave-based orchestration is unique to execute-phase**
   - Parallelization config determines spawn count
   - Needs careful testing with wave mechanics

6. **@-reference count (80) is manageable**
   - Most references to planning artifacts (already in .planning/)
   - Template/reference files in ~/.claude/get-shit-done/ need path mapping
   - Dynamic references ({plan_01_path}) need variable expansion support

**Recommendation:** Execute Plan 03-02 (execute-phase) first, learn from it, then decide on parallel vs sequential for 03-03/03-04.
