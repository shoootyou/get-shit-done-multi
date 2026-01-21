# Platform Generation Validation Report

**Generated:** 2026-01-21T18:06:40.368Z
**Agents tested:** 11

## Summary

| Platform | Generated | Valid | Success Rate |
|----------|-----------|-------|--------------|
| Claude | 11/11 | 11/11 | 100% |
| Copilot | 9/11 | 9/9 | 82% |

## Claude Generation Results

| Agent | Status | Size | Valid | Issues |
|-------|--------|------|-------|--------|
| gsd-planner | ✓ | 41098 | ✓ | 0 |
| gsd-executor | ✓ | 20646 | ✓ | 0 |
| gsd-verifier | ✓ | 21750 | ✓ | 0 |
| gsd-codebase-mapper | ✓ | 22206 | ✓ | 0 |
| gsd-debugger | ✓ | 35339 | ✓ | 0 |
| gsd-phase-researcher | ✓ | 17453 | ✓ | 0 |
| gsd-plan-checker | ✓ | 19922 | ✓ | 0 |
| gsd-project-researcher | ✓ | 21757 | ✓ | 0 |
| gsd-research-synthesizer | ✓ | 6880 | ✓ | 0 |
| gsd-roadmapper | ✓ | 15778 | ✓ | 0 |
| gsd-integration-checker | ✓ | 12114 | ✓ | 0 |

## Copilot Generation Results

| Agent | Status | Size | Valid | Issues |
|-------|--------|------|-------|--------|
| gsd-planner | ✗ | 0 | - | 1 (too large) |
| gsd-executor | ✓ | 20647 | ✓ | 0 |
| gsd-verifier | ✓ | 21751 | ✓ | 0 |
| gsd-codebase-mapper | ✓ | 22207 | ✓ | 0 |
| gsd-debugger | ✗ | 0 | - | 1 (too large) |
| gsd-phase-researcher | ✓ | 17406 | ✓ | 0 |
| gsd-plan-checker | ✓ | 19923 | ✓ | 0 |
| gsd-project-researcher | ✓ | 21710 | ✓ | 0 |
| gsd-research-synthesizer | ✓ | 6881 | ✓ | 0 |
| gsd-roadmapper | ✓ | 15779 | ✓ | 0 |
| gsd-integration-checker | ✓ | 12115 | ✓ | 0 |

## Platform Differences

**Claude-specific features:**
- Case-sensitive tool names (Bash, Read, Write)
- WebFetch tool (internet access)
- MCP wildcard tools (mcp__context7__*)
- Model field support (haiku, sonnet, opus)
- Hooks and skills support
- 200K character prompt limit

**Copilot-specific features:**
- Lowercase tool names (bash, read, write)
- MCP server configuration (mcp-servers field)
- Excludes model, hooks, skills, disallowedTools fields
- 30K character prompt limit

**Note:** Some agents exceed Copilot's 30K limit (gsd-planner: 41KB, gsd-debugger: 35KB)
