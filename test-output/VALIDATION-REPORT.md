# Platform Generation Validation Report

**Generated:** 2026-01-21T20:43:09.541Z
**Agents tested:** 11

## Summary

| Platform | Generated | Valid | Success Rate |
|----------|-----------|-------|--------------|
| Claude | 11/11 | 11/11 | 100% |
| Copilot | 9/11 | 9/9 | 82% |

## Claude Generation Results

| Agent | Status | Size | Valid | Issues |
|-------|--------|------|-------|--------|
| gsd-planner | ✓ | 41011 | ✓ | 0 |
| gsd-executor | ✓ | 20560 | ✓ | 0 |
| gsd-verifier | ✓ | 21670 | ✓ | 0 |
| gsd-codebase-mapper | ✓ | 22123 | ✓ | 0 |
| gsd-debugger | ✓ | 35252 | ✓ | 0 |
| gsd-phase-researcher | ✓ | 17363 | ✓ | 0 |
| gsd-plan-checker | ✓ | 19844 | ✓ | 0 |
| gsd-project-researcher | ✓ | 21665 | ✓ | 0 |
| gsd-research-synthesizer | ✓ | 6805 | ✓ | 0 |
| gsd-roadmapper | ✓ | 15695 | ✓ | 0 |
| gsd-integration-checker | ✓ | 12036 | ✓ | 0 |

## Copilot Generation Results

| Agent | Status | Size | Valid | Issues |
|-------|--------|------|-------|--------|
| gsd-planner | ✗ | 0 | - | 1 (too large) |
| gsd-executor | ✓ | 20693 | ✓ | 0 |
| gsd-verifier | ✓ | 21803 | ✓ | 0 |
| gsd-codebase-mapper | ✓ | 22256 | ✓ | 0 |
| gsd-debugger | ✗ | 0 | - | 1 (too large) |
| gsd-phase-researcher | ✓ | 17457 | ✓ | 0 |
| gsd-plan-checker | ✓ | 19977 | ✓ | 0 |
| gsd-project-researcher | ✓ | 21759 | ✓ | 0 |
| gsd-research-synthesizer | ✓ | 6938 | ✓ | 0 |
| gsd-roadmapper | ✓ | 15828 | ✓ | 0 |
| gsd-integration-checker | ✓ | 12169 | ✓ | 0 |

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
