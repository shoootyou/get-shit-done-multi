# Phase 3.1: Agent Size Optimization

**Status:** Executing
**Created:** 2026-01-21
**Revised:** 2026-01-21
**Goal:** Split oversized agents into coordinator/specialist pairs to fit Copilot's 30K limit while preserving all content

## Problem

Two agents exceed GitHub Copilot's 30,000 character prompt limit:
- **gsd-planner**: 41,135 chars (exceeds by 11,135 chars / 37%)
- **gsd-debugger**: 35,456 chars (exceeds by 5,456 chars / 18%)

Result: Only 9/11 agents (82%) work on Copilot platform.

## Solution (Revised Approach)

Split oversized agents into coordinator/specialist pairs using functional decomposition:
1. **gsd-planner** → **gsd-planner** (coordinator, ~22K) + **gsd-planner-strategist** (specialist, ~22K)
2. **gsd-debugger** → **gsd-debugger** (investigator, ~13K) + **gsd-debugger-specialist** (specialist, ~24K)
3. Preserve ALL content - zero information loss
4. Coordinator agents handle orchestration, spawn specialists for complex analysis
5. Better architecture: separation of concerns (execution vs methodology)
6. Use original names for coordinators (backward compatibility)

## Success Criteria

1. All 4 agents (2 split pairs): <30,000 characters each
2. Zero content loss (all examples, details, and methodology preserved)
3. Coordinators can spawn specialists via task tool
4. All functionality preserved (core protocols intact)
5. All tests passing
6. 13/13 agents working on both platforms (100% coverage)
7. **Documentation follows naming conventions (lowercase-with-hyphens.md)**
8. **Original oversized specs removed (content preserved in splits)**
9. **Coordinator agents use original names (backward compatibility)**
10. **Clean test-output generation with all 13 agents for both platforms**

## Agent Split Strategy

### gsd-planner Split

**gsd-planner** (~22K chars) - Primary coordinator (renamed from gsd-planner-coordinator)
- Frontmatter, role, discovery levels
- Execution flow (orchestration)
- Checkpoint management
- Structured returns, gap closure, revision mode
- Spawns strategist for complex analysis

**gsd-planner-strategist** (~22K chars) - Methodology specialist (new)
- Task breakdown (all examples)
- Dependency graphs (all patterns)
- Scope estimation, goal-backward (full process)
- TDD integration, philosophy
- All tables and anti-patterns

### gsd-debugger Split

**gsd-debugger** (~13K chars) - Primary investigator (renamed from gsd-debugger-investigator)
- Frontmatter, role, execution flow
- Debug file protocol
- Checkpoint management
- Hypothesis testing (core framework)
- Spawns specialist for complex scenarios

**gsd-debugger-specialist** (~24K chars) - Methodology specialist (new)
- Complete hypothesis testing methodology
- All investigation techniques (with examples)
- Verification patterns (detailed)
- Research vs reasoning, philosophy
- All code examples and case studies

## Coordination Pattern

```
User → Primary Agent (gsd-planner or gsd-debugger)
  ├─ Simple cases → handled directly
  └─ Complex cases → spawn Specialist
      ├─ Get methodology/technique advice
      ├─ Get detailed analysis
      └─ Return to Primary for execution
```

## Agent Count & Naming

- Before: 11 agents (9 work on Copilot)
- After: 13 agents (13 work on Copilot)
- Change breakdown:
  * Remove 2: gsd-planner.md, gsd-debugger.md (original oversized specs)
  * Add 4: Split versions with functional decomposition
  * Rename coordinators to original names (backward compatibility)

Final agent names:
- `gsd-planner` (was gsd-planner-coordinator, ~22K chars)
- `gsd-planner-strategist` (new, ~22K chars)
- `gsd-debugger` (was gsd-debugger-investigator, ~13K chars)
- `gsd-debugger-specialist` (new, ~24K chars)
- All other 9 agents unchanged

## Architectural Requirements

### 1. Naming Convention Compliance
- Documentation files: lowercase-with-hyphens.md
- Pattern doc: `docs/agent-split-pattern.md` (not AGENT-SPLIT-PATTERN.md)
- Follows project convention: architecture.md, migration-guide.md, etc.

### 2. Backward Compatibility
- Commands spawn gsd-planner (not gsd-planner-coordinator)
- Commands spawn gsd-debugger (not gsd-debugger-investigator)
- Zero breaking changes to existing workflows
- Old references already updated to new names
- **Internal references updated: coordinator/investigator specs updated to use final names (gsd-planner, gsd-debugger)**

### 3. Content Preservation
- Original specs deleted ONLY after content verified in splits
- 100% content preserved between original and split versions
- All examples, tables, and methodology intact
- Character count verification: splits ≈ original (±10%)
- **After renaming, update internal self-references in split specs**

### 4. Clean Generation
- test-output/ regenerated from scratch (remove old files first)
- All 13 agents for Claude platform
- All 13 agents for Copilot platform
- Validation report confirms 100% coverage

## Plans

Executed by gsd-executor:
- 03.1-01: Split gsd-planner + document pattern
- 03.1-02: Split gsd-debugger
- 03.1-03: Update references to use new coordinator names
- 03.1-04: Validation & human verification (current checkpoint)

## Dependencies

- Phase 3 complete (template system operational)
- Blocks Phase 4 (want 100% platform coverage before installation)
