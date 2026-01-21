# Platform Generation Validation Report

**Generated:** 2026-01-21T19:07:14.679Z
**Agents tested:** 11

## Summary

| Platform | Generated | Valid | Success Rate |
|----------|-----------|-------|--------------|
| Claude | 11/11 | 11/11 | 100% |
| Copilot | 9/11 | 9/9 | 82% |

## Claude Generation Results

| Agent | Status | Size | Valid | Issues |
|-------|--------|------|-------|--------|
| gsd-planner | ✓ | 41012 | ✓ | 0 |
| gsd-executor | ✓ | 20561 | ✓ | 0 |
| gsd-verifier | ✓ | 21671 | ✓ | 0 |
| gsd-codebase-mapper | ✓ | 22124 | ✓ | 0 |
| gsd-debugger | ✓ | 35253 | ✓ | 0 |
| gsd-phase-researcher | ✓ | 17364 | ✓ | 0 |
| gsd-plan-checker | ✓ | 19845 | ✓ | 0 |
| gsd-project-researcher | ✓ | 21666 | ✓ | 0 |
| gsd-research-synthesizer | ✓ | 6806 | ✓ | 0 |
| gsd-roadmapper | ✓ | 15696 | ✓ | 0 |
| gsd-integration-checker | ✓ | 12037 | ✓ | 0 |

## Copilot Generation Results

| Agent | Status | Size | Valid | Issues |
|-------|--------|------|-------|--------|
| gsd-planner | ✗ | 0 | - | 1 (too large) |
| gsd-executor | ✓ | 20634 | ✓ | 0 |
| gsd-verifier | ✓ | 21744 | ✓ | 0 |
| gsd-codebase-mapper | ✓ | 22197 | ✓ | 0 |
| gsd-debugger | ✗ | 0 | - | 1 (too large) |
| gsd-phase-researcher | ✓ | 17398 | ✓ | 0 |
| gsd-plan-checker | ✓ | 19918 | ✓ | 0 |
| gsd-project-researcher | ✓ | 21700 | ✓ | 0 |
| gsd-research-synthesizer | ✓ | 6879 | ✓ | 0 |
| gsd-roadmapper | ✓ | 15769 | ✓ | 0 |
| gsd-integration-checker | ✓ | 12110 | ✓ | 0 |

## Format Compliance

### Claude Agents

| Agent | Description | Tools | Metadata | Status |
|-------|-------------|-------|----------|--------|
| gsd-codebase-mapper | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-debugger | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-executor | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-integration-checker | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-phase-researcher | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-plan-checker | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-planner | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-project-researcher | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-research-synthesizer | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-roadmapper | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-verifier | ✅ | ✅ | ✅ | ✅ Pass |

### Copilot Agents

| Agent | Description | Tools | Metadata | Status |
|-------|-------------|-------|----------|--------|
| gsd-codebase-mapper | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-executor | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-integration-checker | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-phase-researcher | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-plan-checker | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-project-researcher | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-research-synthesizer | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-roadmapper | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-verifier | ✅ | ✅ | ✅ | ✅ Pass |

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
