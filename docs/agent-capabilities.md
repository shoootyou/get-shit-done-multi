# Agent Capability Matrix

This document shows which GSD agents are supported on each CLI platform.

**Generated:** 2026-01-19

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

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

### gsd-planner

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

### gsd-verifier

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

### gsd-debugger

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

### gsd-phase-researcher

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

### gsd-plan-checker

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

### gsd-codebase-mapper

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

### gsd-project-researcher

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

### gsd-research-synthesizer

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

### gsd-roadmapper

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

### gsd-integration-checker

- **Claude Code**: Native support, no limitations
- **GitHub Copilot CLI**: Custom agent, full feature parity
- **Codex CLI**: Skill-based, all features supported

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
*Last updated: 2026-01-19T20:55:43.672Z*
