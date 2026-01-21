# Custom GSD Agents

This directory contains generated agent definitions for the GitHub Copilot platform.

**Generation:** These files are generated from `specs/agents/*.md` using the template generation system.

## Coordinator/Specialist Pairs

As of Phase 3.1, some agents use a coordinator/specialist pattern to work within platform size limits:

### Planning Agents

**gsd-planner-coordinator** (primary)
- Orchestrates phase planning
- Spawns gsd-planner-strategist for complex scenarios
- Spec: `specs/agents/gsd-planner-coordinator.md`
- Generated: `gsd-planner-coordinator.agent.md`

**gsd-planner-strategist** (specialist)
- Provides planning methodology and analysis
- Spawned by coordinator when needed
- Spec: `specs/agents/gsd-planner-strategist.md`
- Generated: `gsd-planner-strategist.agent.md`

### Debugging Agents

**gsd-debugger-investigator** (primary)
- Orchestrates debugging sessions
- Spawns gsd-debugger-specialist for complex scenarios
- Spec: `specs/agents/gsd-debugger-investigator.md`
- Generated: `gsd-debugger-investigator.agent.md`

**gsd-debugger-specialist** (specialist)
- Provides debugging methodology and investigation techniques
- Spawned by investigator when needed
- Spec: `specs/agents/gsd-debugger-specialist.md`
- Generated: `gsd-debugger-specialist.agent.md`

## Pattern Details

See `docs/AGENT-SPLIT-PATTERN.md` for the complete coordinator/specialist pattern documentation.

## Legacy Agents

- `gsd-planner.agent.md` - **Deprecated** (replaced by coordinator + strategist)
- `gsd-debugger.agent.md` - **Deprecated** (replaced by investigator + specialist)

These files remain for backward compatibility but orchestrators now spawn the coordinator variants.

## Regeneration

To regenerate all agents for both platforms:

```bash
npm run generate -- --platform=copilot --output=.github/agents/
npm run generate -- --platform=claude --output=agents/
```

Or generate specific agents:

```bash
npm run generate -- --platform=copilot --agent=gsd-planner-coordinator --output=.github/agents/
```
