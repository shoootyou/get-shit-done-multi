---
name: gsd-debug
description: Structured debugging workflow with session persistence and investigation tracking
skill_version: 1.9.1
requires_version: 1.9.0+
platforms:
  - claude
  - copilot
  - codex
tools:
  - name: task
    required: true
    reason: Spawn gsd-debugger agent for investigation
  - name: read
    required: true
    reason: Load existing debug sessions and project context
  - name: write
    required: true
    reason: Create debug session files for persistence
  - name: bash
    required: true
    reason: Session discovery, slug generation, file validation
  - name: ask_user_question
    required: true
    reason: Gather symptoms (expected, actual, errors, timeline, reproduction)
arguments:
  - name: issue
    type: string
    required: false
    description: Issue description (if omitted, shows active sessions for resume)
metadata:
  generated: {{generated}}
  platform: {{platform}}
  version: {{version}}
---
