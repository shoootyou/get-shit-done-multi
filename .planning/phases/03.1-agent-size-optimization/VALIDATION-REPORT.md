# Platform Generation Validation Report

**Generated:** 2026-01-21T22:00:47.571Z
**Agents tested:** 13

## Summary

| Platform | Generated | Valid | Success Rate |
|----------|-----------|-------|--------------|
| Claude | 13/13 | 13/13 | 100% |
| Copilot | 13/13 | 13/13 | 100% |

## Claude Generation Results

| Agent | Status | Size | Valid | Issues |
|-------|--------|------|-------|--------|
| gsd-planner-coordinator | ✓ | 22517 | ✓ | 0 |
| gsd-planner-strategist | ✓ | 22342 | ✓ | 0 |
| gsd-executor | ✓ | 20560 | ✓ | 0 |
| gsd-verifier | ✓ | 21670 | ✓ | 0 |
| gsd-codebase-mapper | ✓ | 22123 | ✓ | 0 |
| gsd-debugger-investigator | ✓ | 13028 | ✓ | 0 |
| gsd-debugger-specialist | ✓ | 24369 | ✓ | 0 |
| gsd-phase-researcher | ✓ | 17363 | ✓ | 0 |
| gsd-plan-checker | ✓ | 19844 | ✓ | 0 |
| gsd-project-researcher | ✓ | 21665 | ✓ | 0 |
| gsd-research-synthesizer | ✓ | 6805 | ✓ | 0 |
| gsd-roadmapper | ✓ | 15695 | ✓ | 0 |
| gsd-integration-checker | ✓ | 12036 | ✓ | 0 |

## Copilot Generation Results

| Agent | Status | Size | Valid | Issues |
|-------|--------|------|-------|--------|
| gsd-planner-coordinator | ✓ | 22622 | ✓ | 0 |
| gsd-planner-strategist | ✓ | 22461 | ✓ | 0 |
| gsd-executor | ✓ | 20693 | ✓ | 0 |
| gsd-verifier | ✓ | 21803 | ✓ | 0 |
| gsd-codebase-mapper | ✓ | 22256 | ✓ | 0 |
| gsd-debugger-investigator | ✓ | 13150 | ✓ | 0 |
| gsd-debugger-specialist | ✓ | 24502 | ✓ | 0 |
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
| gsd-debugger-investigator | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-debugger-specialist | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-debugger | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-executor | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-integration-checker | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-phase-researcher | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-plan-checker | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-planner-coordinator | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-planner-strategist | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-planner | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-project-researcher | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-research-synthesizer | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-roadmapper | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-verifier | ✅ | ✅ | ✅ | ✅ Pass |

### Copilot Agents

| Agent | Description | Tools | Metadata | Status |
|-------|-------------|-------|----------|--------|
| gsd-codebase-mapper | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-debugger-investigator | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-debugger-specialist | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-executor | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-integration-checker | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-phase-researcher | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-plan-checker | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-planner-coordinator | ✅ | ✅ | ✅ | ✅ Pass |
| gsd-planner-strategist | ✅ | ✅ | ✅ | ✅ Pass |
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

**Phase 3.1 Success:** All agents now under 30K limit after coordinator/specialist split (gsd-planner → coordinator+strategist, gsd-debugger → investigator+specialist)
