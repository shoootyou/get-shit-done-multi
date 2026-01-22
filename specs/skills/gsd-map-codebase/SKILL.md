---
name: gsd-map-codebase
description: Analyze codebase with parallel mapper agents to produce structured documentation
skill_version: 1.9.1
requires_version: 1.9.0+
platforms:
  - claude
  - copilot
  - codex
tools:
  - name: task
    required: true
    reason: Spawn 4 parallel gsd-codebase-mapper agents with different focuses
  - name: read
    required: true
    reason: Load project state and check existing codebase maps
  - name: write
    required: false
    reason: Agents write codebase documents directly
  - name: bash
    required: true
    reason: Directory creation, file validation, git operations
  - name: glob
    required: true
    reason: Discover existing codebase files
  - name: grep
    required: true
    reason: Search codebase for patterns during mapping
arguments:
  - name: area
    type: string
    required: false
    description: Optional specific area to map (e.g., 'api', 'auth')
metadata:
  generated: {{generated}}
  platform: {{platform}}
  version: {{version}}
---
