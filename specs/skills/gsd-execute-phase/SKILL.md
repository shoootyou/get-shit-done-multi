---
name: gsd-execute-phase
description: Execute all plans in a phase with wave-based parallelization
skill_version: 1.9.1
requires_version: 1.9.0+
platforms:
  - claude
  - copilot
  - codex
tools:
  - name: task
    required: true
    reason: Spawn gsd-executor agents in parallel per wave
  - name: read
    required: true
    reason: Load plan files and phase metadata
  - name: write
    required: false
    reason: Update STATE.md progress tracking
  - name: bash
    required: true
    reason: Git operations, file discovery, validation
  - name: edit
    required: false
    reason: Update ROADMAP.md and REQUIREMENTS.md
  - name: glob
    required: false
    reason: Discover plan files in phase directory
  - name: grep
    required: false
    reason: Parse frontmatter from plan files
  - name: TodoWrite
    required: false
    reason: Track orchestration todos
  - name: AskUserQuestion
    required: false
    reason: Handle human-needed verification items
arguments:
  - name: phase
    type: string
    required: true
    description: Phase number or name to execute
  - name: --gaps-only
    type: flag
    required: false
    description: Execute only gap closure plans
metadata:
  generated: {{generated}}
  platform: {{platform}}
  version: {{version}}
---

[Body content will be migrated in next task]
