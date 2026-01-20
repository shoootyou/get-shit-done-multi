# Agent Capability Matrix

This document shows which GSD agents are supported on each CLI platform.

**Generated:** 2026-01-19

## Phase 4 Status: Infrastructure Complete ✅

As of Phase 4 gap closure, the agent translation layer is **fully implemented**:

- ✅ All 11 GSD agents registered and available
- ✅ CLI-agnostic orchestration layer built
- ✅ Real CLI command execution (adapters no longer use mocks)
- ✅ Performance tracking with sub-millisecond precision
- ✅ User-facing `/gsd:invoke-agent` command for agent invocation

**Next steps:** Phase 5 (Testing & Verification) will validate cross-CLI equivalence and integration.

**Testing agent availability:** Run `/gsd:invoke-agent {agent-name} "{prompt}"` to test if an agent works on your installed CLI.

---

## Support Levels

- ✓ **Full Support**: All features work without limitations
- ⚠ **Partial Support**: Most features work with documented limitations
- ✗ **Unsupported**: Agent cannot be used on this CLI

## Agent Support Matrix

| Agent | Claude Code | GitHub Copilot CLI | Codex CLI |
|-------|-------------|-------------------|-----------|
| gsd-executor | ✓ | ✓ | ✓ |
| gsd-planner | ✓ | ✓ | ✓ |
| gsd-verifier | ✓ | ✓ | ✓ |
| gsd-debugger | ✓ | ✓ | ✓ |
| gsd-phase-researcher | ✓ | ✓ | ✓ |
| gsd-plan-checker | ✓ | ✓ | ✓ |
| gsd-codebase-mapper | ✓ | ✓ | ✓ |
| gsd-project-researcher | ✓ | ✓ | ✓ |
| gsd-research-synthesizer | ✓ | ✓ | ✓ |
| gsd-roadmapper | ✓ | ✓ | ✓ |
| gsd-integration-checker | ✓ | ✓ | ✓ |

## Detailed Notes

Each agent's specific implementation details and notes per CLI:

### gsd-executor

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

### gsd-planner

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

### gsd-verifier

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

### gsd-debugger

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

### gsd-phase-researcher

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

### gsd-plan-checker

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

### gsd-codebase-mapper

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

### gsd-project-researcher

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

### gsd-research-synthesizer

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

### gsd-roadmapper

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

### gsd-integration-checker

- **Claude Code**: Real CLI execution via claude-code command (requires Claude CLI installed)
- **GitHub Copilot CLI**: Real CLI execution via gh copilot command (requires GitHub CLI + copilot extension)
- **Codex CLI**: Real CLI execution via codex skill command (requires Codex CLI installed)

## CLI-Specific Limitations

Platform constraints that affect GSD workflow execution:

### Claude Code

- ✓ **Slash Commands**: Full /gsd:* command support via native slash command system
- ✓ **Custom Agents**: Native .agent.md format in .agent/ directories
- ✓ **Parallel Agents**: No limitations on concurrent agent invocation

### GitHub Copilot CLI

- ✗ **Slash Commands**: Use skills with $get-shit-done instead of /gsd:* commands
- ✓ **Custom Agents**: Custom agent definitions in .github/agents/
- ✓ **Parallel Agents**: No limitations on concurrent agent invocation

### Codex CLI

- ✗ **Slash Commands**: Use skills with $get-shit-done instead of /gsd:* commands
- ✓ **Custom Agents**: Skill-based approach in .codex/skills/
- ✓ **Parallel Agents**: No limitations on concurrent agent invocation

---

*This document is auto-generated from capability-matrix.js*  
*Last updated: 2026-01-19T21:31:11.942Z*
