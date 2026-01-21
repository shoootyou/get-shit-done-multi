# Phase 3.1: Agent Size Optimization

**Status:** Planning
**Created:** 2026-01-21
**Goal:** Optimize gsd-planner and gsd-debugger to fit GitHub Copilot's 30K character limit

## Problem

Two agents exceed GitHub Copilot's 30,000 character prompt limit:
- **gsd-planner**: 41,135 chars (exceeds by 11,135 chars / 37%)
- **gsd-debugger**: 35,456 chars (exceeds by 5,456 chars / 18%)

Result: Only 9/11 agents (82%) work on Copilot platform.

## Solution

Create compact versions of oversized agents using manual optimization:
1. Create `specs/agents/compact/` directory for optimized versions
2. Condense gsd-planner by removing verbosity and duplication (~11K chars)
3. Condense gsd-debugger by removing explanatory overhead (~5.5K chars)
4. Update generator to prefer compact versions for Copilot platform
5. Preserve original specs for Claude platform (no size limit)

## Success Criteria

1. gsd-planner Copilot version: <30,000 characters
2. gsd-debugger Copilot version: <30,000 characters
3. All functionality preserved (core protocols intact)
4. All tests passing
5. 11/11 agents working on both platforms (100% coverage)

## Optimization Strategy

### gsd-planner (-11K chars)
- Execution flow: -6,000 chars (condense bash examples)
- Task breakdown: -2,200 chars (remove duplication)
- Goal-backward: -2,500 chars (compress process steps)
- Checkpoints: -1,800 chars (reduce anti-patterns)
- Other: -2,500 chars (TDD, revision, templates)

### gsd-debugger (-5.5K chars)
- Philosophy: -2,000 chars (remove duplicated concepts)
- Examples: -1,800 chars (pseudocode instead of full code)
- Tables: -700 chars (convert to bullets)
- Research: -600 chars (compress or extract)
- Repetition: -400 chars (remove preambles)

## Plans

TBD by gsd-planner

## Dependencies

- Phase 3 complete (template system operational)
- Blocks Phase 4 (want 100% platform coverage before installation)
