---
name: gsd-plan-milestone-gaps
description: Parse audit gaps, spawn planner to create gap closure phases
skill_version: 1.9.1
requires_version: 1.9.0+
platforms: [claude, copilot, codex]
tools:
  - read
  - write
  - bash
  - task
arguments:
  - name: version
    type: string
    required: true
    description: Milestone version to plan gaps for
---

<objective>
Parse MILESTONE-AUDIT.md gaps, spawn planner to create gap closure phases, append to roadmap.

Purpose: Address integration gaps before milestone completion.
Output: New phases in ROADMAP.md addressing audit gaps.
</objective>

<process>
<step name="load_audit">
Load milestone audit:

```bash
version="$1"
audit_file=".planning/v${version}-MILESTONE-AUDIT.md"
cat "$audit_file"
```

Verify status: gaps_found
If status: passed, exit with: "No gaps to plan - audit passed"

Parse "Integration Gaps" section:
- Extract each gap description
- Note affected phases/requirements
</step>

<step name="spawn_planner">
Spawn gsd-planner in gap closure mode:

```javascript
task({
  agent_type: "gsd-planner",
  description: "Plan gap closure phases",
  prompt: `
<objective>
Create gap closure phases for milestone \${version} audit gaps.
</objective>

<audit_report>
@.planning/v\${version}-MILESTONE-AUDIT.md
</audit_report>

<current_roadmap>
@.planning/ROADMAP.md
</current_roadmap>

<gaps>
\${gaps.map(g => \`
Gap: \${g.description}
Affected: \${g.affected}
Fix needed: \${g.fix}
\`).join('\\n')}
</gaps>

<tasks>
1. Group gaps by concern (integration, missing feature, broken flow)
2. For each group: create gap closure phase
3. Append phases to ROADMAP.md (after current highest phase)
4. Update STATE.md with pending gap closure work
</tasks>

<output>
Update ROADMAP.md with new phases:
- Phase {N+1}: {Gap closure description}
- Phase {N+2}: {Gap closure description}

Each phase should address specific gaps from audit.
</output>
  `
})
```
</step>

<step name="verify_roadmap_updated">
After planner completes:

```bash
# Show new phases added
tail -20 .planning/ROADMAP.md

# Count new phases
NEW_PHASE_COUNT=$(grep -c "^- Phase" .planning/ROADMAP.md)
echo "Roadmap now has ${NEW_PHASE_COUNT} phases"
```
</step>

<step name="present_next_steps">
Present gap closure plan:

```
## GAP CLOSURE PHASES CREATED

**Gaps found:** {count}
**New phases:** {count}

### Next Steps

1. Execute gap closure phases: {{cmdPrefix}}progress (will route to execution)
2. After gaps fixed: {{cmdPrefix}}audit-milestone {version} (re-audit)
3. If audit passes: {{cmdPrefix}}complete-milestone {version}

**Estimated time:** {phase_count} × ~1 day = {total} days
```
</step>
</process>
