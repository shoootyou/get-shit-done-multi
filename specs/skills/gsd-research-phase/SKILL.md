---
name: gsd-research-phase
description: Research implementation approach for phase before planning
skill_version: 1.9.1
requires_version: 1.9.0+
platforms:
  - claude
  - copilot
  - codex
tools:
  - name: task
    required: true
    reason: Spawn gsd-phase-researcher agent for ecosystem research
  - name: read
    required: true
    reason: Load phase context and existing research files
  - name: write
    required: false
    reason: Optional - agents write RESEARCH.md directly
  - name: bash
    required: true
    reason: Phase normalization, directory validation, file checks
arguments:
  - name: phase
    type: string
    required: true
    description: Phase number or name to research
metadata:
  generated: {{generated}}
  platform: {{platform}}
  version: {{version}}
---
