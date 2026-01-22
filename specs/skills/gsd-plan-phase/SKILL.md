---
name: gsd-plan-phase
description: Orchestrate phase planning with research, planning, and verification loop
skill_version: 1.9.1
requires_version: 1.9.0+
platforms:
  - claude
  - copilot
  - codex
tools:
  - name: task
    required: true
    reason: Spawn gsd-phase-researcher, gsd-planner, gsd-plan-checker agents sequentially
  - name: read
    required: true
    reason: Load project state, roadmap, requirements, research, verification artifacts
  - name: write
    required: true
    reason: Update ROADMAP.md with plan details, create marker files
  - name: bash
    required: true
    reason: Phase normalization, argument parsing, file validation, git operations
  - name: ask_user_question
    required: true
    reason: User intervention at max iterations, confirmation of breakdown
arguments:
  - name: phase
    type: string
    required: true
    description: Phase number or name to plan
  - name: --research
    type: flag
    required: false
    description: Force re-research (ignore existing RESEARCH.md)
  - name: --skip-research
    type: flag
    required: false
    description: Skip research entirely (go straight to planning)
  - name: --gaps
    type: flag
    required: false
    description: Gap closure mode (plan from VERIFICATION.md/UAT.md failures)
  - name: --skip-verify
    type: flag
    required: false
    description: Skip verification loop (trust planner output)
metadata:
  generated: {{generated}}
  platform: {{platform}}
  version: {{version}}
---
