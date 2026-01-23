---
name: gsd-map-codebase
description: Analyze codebase with parallel mapper agents to produce structured documentation
skill_version: 1.9.1
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools: [task, read, write, bash, glob, grep]
arguments: [{name: area, type: string, required: false, description: 'Optional specific area to map (e.g., ''api'', ''auth'')'}]
---

<objective>
Analyze existing codebase using parallel gsd-codebase-mapper agents to produce structured codebase documents.

Each mapper agent explores a focus area and **writes documents directly** to `.planning/codebase/`. The orchestrator only receives confirmations, keeping context usage minimal.

Output: .planning/codebase/ folder with 7 structured documents about the codebase state.
</objective>

<execution_context>
@~/.codex/skills/get-shit-done/workflows/map-codebase.md
</execution_context>

<context>
Focus area: $ARGUMENTS (optional - if provided, tells agents to focus on specific subsystem)

**Load project state if exists:**
Check for .planning/STATE.md - loads context if project already initialized

**This command can run:**
- Before $gsd-new-project (brownfield codebases) - creates codebase map first
- After $gsd-new-project (greenfield codebases) - updates codebase map as code evolves
- Anytime to refresh codebase understanding
</context>

<when_to_use>
**Use map-codebase for:**
- Brownfield projects before initialization (understand existing code first)
- Refreshing codebase map after significant changes
- Onboarding to an unfamiliar codebase
- Before major refactoring (understand current state)
- When STATE.md references outdated codebase info

**Skip map-codebase for:**
- Greenfield projects with no code yet (nothing to map)
- Trivial codebases (<5 files)
</when_to_use>

<process>
1. Check if .planning/codebase/ already exists (offer to refresh or skip)
2. Create .planning/codebase/ directory structure
3. Spawn 4 parallel gsd-codebase-mapper agents:

```javascript
// Agent 1: Tech focus
Task({
  prompt: `
<objective>
Map codebase technology stack and integrations
</objective>

<focus>tech</focus>

<area>\${FOCUS_AREA || "entire codebase"}</area>

<writes>
- .planning/codebase/STACK.md
- .planning/codebase/INTEGRATIONS.md
</writes>

<workflow>
@~/.codex/skills/get-shit-done/workflows/map-codebase.md
</workflow>
  `,
  agent_type: "gsd-codebase-mapper",
  description: "Map tech stack and integrations"
});

// Agent 2: Architecture focus
Task({
  prompt: `
<objective>
Map codebase architecture and structure
</objective>

<focus>arch</focus>

<area>\${FOCUS_AREA || "entire codebase"}</area>

<writes>
- .planning/codebase/ARCHITECTURE.md
- .planning/codebase/STRUCTURE.md
</writes>

<workflow>
@~/.codex/skills/get-shit-done/workflows/map-codebase.md
</workflow>
  `,
  agent_type: "gsd-codebase-mapper",
  description: "Map architecture and structure"
});

// Agent 3: Quality focus
Task({
  prompt: `
<objective>
Map codebase conventions and testing practices
</objective>

<focus>quality</focus>

<area>\${FOCUS_AREA || "entire codebase"}</area>

<writes>
- .planning/codebase/CONVENTIONS.md
- .planning/codebase/TESTING.md
</writes>

<workflow>
@~/.codex/skills/get-shit-done/workflows/map-codebase.md
</workflow>
  `,
  agent_type: "gsd-codebase-mapper",
  description: "Map conventions and testing"
});

// Agent 4: Concerns focus
Task({
  prompt: `
<objective>
Identify codebase concerns and issues
</objective>

<focus>concerns</focus>

<area>\${FOCUS_AREA || "entire codebase"}</area>

<writes>
- .planning/codebase/CONCERNS.md
</writes>

<workflow>
@~/.codex/skills/get-shit-done/workflows/map-codebase.md
</workflow>
  `,
  agent_type: "gsd-codebase-mapper",
  description: "Identify concerns and issues"
});
```
4. Wait for agents to complete, collect confirmations (NOT document contents)
5. Verify all 7 documents exist with line counts
6. Commit codebase map
7. Offer next steps (typically: $gsd-new-project or $gsd-plan-phase)
</process>

<success_criteria>
- [ ] .planning/codebase/ directory created
- [ ] All 7 codebase documents written by mapper agents
- [ ] Documents follow template structure
- [ ] Parallel agents completed without errors
- [ ] User knows next steps
</success_criteria>
