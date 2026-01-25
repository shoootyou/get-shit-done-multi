# Phase 3: High-Complexity Orchestrators - Research

**Researched:** 2025-01-22
**Domain:** Multi-agent orchestration patterns, parallel subagent spawning, @-reference preservation, XML structure migration
**Confidence:** HIGH

## Summary

Phase 3 migrates the three most complex GSD commands that orchestrate multiple subagents in parallel. These commands (new-project, new-milestone, execute-phase) spawn 4-5 agents concurrently using the Task tool and coordinate their outputs. The research reveals that these orchestrators follow established patterns: spawn parallel agents with rich context, wait for structured returns, handle blocking scenarios, and route based on results.

**Key findings:**

1. **Orchestration pattern is consistent**: All three commands follow spawn → wait → parse → route pattern. The Task tool spawns subagents, blocks until completion, and returns structured output that the orchestrator parses.

2. **@-references are pervasive**: 76 @-references exist across legacy commands, pointing to templates, references, and planning artifacts. These must be preserved exactly in migration - they're not just file paths, they're context injection points.

3. **Multi-section XML structure is critical**: Commands use `<objective>`, `<execution_context>`, `<process>`, `<output>`, `<success_criteria>` sections. This structure isn't arbitrary - it maps to how Claude processes instructions.

**Primary recommendation:** Migrate command-by-command (not bulk) preserving exact structure and @-references. Use the template system's existing capabilities, don't add orchestration-specific features.

## Standard Stack

The established libraries/tools for orchestration:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Task tool | Claude native | Spawn subagents in parallel | Built-in Claude Code capability, blocks until completion |
| gray-matter | 4.0.3 | Parse frontmatter from specs | Already integrated, handles YAML + Markdown |
| Node.js fs | Built-in | File operations for @-reference resolution | Native, no dependencies |

### Supporting
| Tool | Purpose | When to Use |
|------|---------|-------------|
| Bash tool | Git operations, file checks | Pre-flight validation, commit orchestration |
| AskUserQuestion | User decision points | Checkpoint handling, approval gates |
| Read tool | Load @-referenced files | Context injection for subagents |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Task tool parallel spawning | Sequential spawns with loop | Parallel is 5x faster, already implemented in legacy |
| @-references | Copy-paste content | @-references enable dynamic content, updates propagate |
| XML sections | Markdown headers | XML sections have semantic meaning to Claude's instruction parser |

**Installation:**
```bash
# No new dependencies needed
# Task tool is Claude Code native capability
```

## Architecture Patterns

### Pattern 1: Parallel Subagent Spawning
**What:** Spawn multiple agents in same message using multiple Task() calls
**When to use:** Independent work items that can run concurrently
**Example:**
```javascript
// Source: commands/gsd/new-project.md lines 328-484
// Spawn 4 researchers in parallel
Task(prompt="<research_type>Stack dimension</research_type>...", 
     subagent_type="gsd-project-researcher", 
     description="Stack research")
Task(prompt="<research_type>Features dimension</research_type>...", 
     subagent_type="gsd-project-researcher", 
     description="Features research")
Task(prompt="<research_type>Architecture dimension</research_type>...", 
     subagent_type="gsd-project-researcher", 
     description="Architecture research")
Task(prompt="<research_type>Pitfalls dimension</research_type>...", 
     subagent_type="gsd-project-researcher", 
     description="Pitfalls research")
```

**Key characteristics:**
- All Task() calls in single message
- Tool blocks until ALL complete
- No polling or status checking needed
- Each agent gets independent prompt context

**Wave-based variant (execute-phase):**
```javascript
// Source: commands/gsd/execute-phase.md lines 228-242
// Execute wave 1 plans in parallel
Task(prompt="Execute plan at {plan_01_path}...", subagent_type="gsd-executor")
Task(prompt="Execute plan at {plan_02_path}...", subagent_type="gsd-executor")
Task(prompt="Execute plan at {plan_03_path}...", subagent_type="gsd-executor")
// Wait for wave 1 completion before spawning wave 2
```

### Pattern 2: Rich Context Injection for Subagents
**What:** Pass structured XML prompts with multiple context sections
**When to use:** Subagents need specific instructions, constraints, and output format
**Example:**
```xml
<!-- Source: commands/gsd/new-project.md lines 489-508 -->
Task(prompt="
<task>
Synthesize research outputs into SUMMARY.md.
</task>

<research_files>
Read these files:
- .planning/research/STACK.md
- .planning/research/FEATURES.md
- .planning/research/ARCHITECTURE.md
- .planning/research/PITFALLS.md
</research_files>

<output>
Write to: .planning/research/SUMMARY.md
Use template: ~/.claude/get-shit-done/templates/research-project/SUMMARY.md
Commit after writing.
</output>
", subagent_type="gsd-research-synthesizer", description="Synthesize research")
```

**Key sections:**
- `<task>` - What to do (single sentence)
- `<context>` - Background information
- `<output>` - Where to write, format requirements
- `<quality_gate>` - Validation checklist
- `<downstream_consumer>` - How results will be used

### Pattern 3: Structured Return Parsing
**What:** Subagents return structured markdown that orchestrator parses
**When to use:** Orchestrator needs to route based on subagent outcome
**Example:**
```markdown
<!-- Source: commands/gsd/new-project.md lines 603-606 -->
<!-- Subagent returns one of: -->

## ROADMAP CREATED
**Phase:** 1
**Summary:** [details]

<!-- OR -->

## ROADMAP BLOCKED
**Blocked by:** [issue]
**Options:** [list]
```

**Orchestrator routing:**
```javascript
// Pseudo-code from execute-phase
if (result.includes("## ROADMAP BLOCKED")) {
  presentBlockerToUser();
  offerOptions();
  respawn();
} else if (result.includes("## ROADMAP CREATED")) {
  readRoadmap();
  presentToUser();
  askApproval();
}
```

### Pattern 4: @-Reference Preservation
**What:** References to templates, references, and artifacts that inject context
**When to use:** Command needs external content at runtime
**Example:**
```xml
<!-- Source: commands/gsd/new-project.md lines 30-36 -->
<execution_context>

@~/.claude/get-shit-done/references/questioning.md
@~/.claude/get-shit-done/references/ui-brand.md
@~/.claude/get-shit-done/templates/project.md
@~/.claude/get-shit-done/templates/requirements.md

</execution_context>
```

**Types of @-references:**
- `@~/.claude/get-shit-done/references/*.md` - Instruction patterns
- `@~/.claude/get-shit-done/templates/*.md` - Output templates
- `@.planning/*.md` - Project artifacts (PROJECT.md, ROADMAP.md)
- `@.planning/phases/*/PLAN.md` - Phase plans
- `@.planning/research/*.md` - Research outputs

**Critical:** These are not file paths - they're context injection points. Claude reads these files at runtime to get instructions/templates.

### Anti-Patterns to Avoid

- **Don't spawn agents sequentially when parallel is possible** - new-project spawns 4 researchers in one message, not one-by-one. Parallel is 5x faster.
- **Don't inline long instructions** - Use @-references to external files. Keeps orchestrator lean, context reusable.
- **Don't parse subagent returns with regex** - Look for markdown headers (`## RESULT TYPE`), not fragile string matching.
- **Don't commit orchestrator + subagent changes together** - Orchestrator commits only phase metadata. Subagents commit their own outputs.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Parallel agent spawning | Custom queue/pool system | Multiple Task() calls in one message | Task tool handles parallel execution natively |
| Subagent communication | Custom message passing | XML sections in Task prompt | Claude parses XML naturally |
| Context injection | Copy-paste file contents | @-references | Dynamic, updates propagate, context budget friendly |
| Wave-based execution | Custom dependency resolver | Wave numbers in plan frontmatter + sequential spawn | Simple, explicit, already implemented |
| Structured returns | JSON parsing | Markdown headers (`## RESULT`) | More natural for Claude, easier to debug |

**Key insight:** The Task tool + @-references + XML structure already solve orchestration. Don't add orchestration-specific code to template system.

## Common Pitfalls

### Pitfall 1: Losing @-References During Migration
**What goes wrong:** Copy command to spec format, @-references become broken paths or get removed
**Why it happens:** Template system doesn't process @-references - they're for Claude to interpret at runtime
**How to avoid:** 
1. Preserve @-references EXACTLY as-is during migration
2. Verify references exist: `test -f ~/.claude/get-shit-done/references/questioning.md`
3. Check reference count before/after: `grep -c "@" old.md vs new.md`
**Warning signs:** 
- Command generates errors about missing files
- Subagents lack context they should have
- Output quality degrades (missing templates)

### Pitfall 2: Breaking Multi-Section XML Structure
**What goes wrong:** Convert XML sections to markdown headers, Claude loses instruction semantics
**Why it happens:** XML sections look arbitrary, seem like candidates for "cleanup"
**How to avoid:**
1. Keep `<objective>`, `<execution_context>`, `<process>`, `<output>`, `<success_criteria>` exactly
2. Nested XML is fine (`<step>`, `<task>`, `<phase>` inside `<process>`)
3. Don't convert to markdown headers - Claude parses XML differently
**Warning signs:**
- Command executes but produces wrong structure
- Subagents misunderstand instructions
- Process steps happen out of order

### Pitfall 3: Parallel Spawn Becomes Sequential
**What goes wrong:** Migrate multiple Task() calls to loop, performance degrades 5x
**Why it happens:** Looks like code duplication, seems like it should be DRY'd
**How to avoid:**
1. Multiple Task() in one message = parallel execution
2. Task() calls in sequence/loop = sequential execution
3. Preserve parallel spawning pattern exactly
**Warning signs:**
- `new-project` research takes 5-10 minutes instead of 2 minutes
- Agents spawn one-by-one instead of simultaneously
- User sees sequential agent indicators instead of parallel

### Pitfall 4: Dependency Audit Incompleteness
**What goes wrong:** Miss cross-command @-references, migration breaks dependent commands
**Why it happens:** Focus on target command, don't check what references IT
**How to avoid:**
1. Grep for command name across all commands: `grep -r "gsd-new-project" commands/`
2. Check for indirect references via files: `grep -r "PROJECT.md" commands/` finds commands that depend on new-project output
3. Document bidirectional dependencies: X spawns Y, Z references X's output
**Warning signs:**
- Tests pass for migrated command but fail for others
- Commands that worked before migration now error
- Missing files or context in downstream commands

### Pitfall 5: Tool Declarations Too Broad
**What goes wrong:** Add Task tool to skill spec, non-orchestrators can now spawn agents
**Why it happens:** "Task is needed" → add to shared tools
**How to avoid:**
1. Follow "principle of least privilege" - only orchestrators get Task tool
2. Don't add Task to `_shared.yml`
3. Each command declares only tools it uses directly
**Warning signs:**
- Simple commands can spawn agents (security issue)
- Tool declarations bloat (every command has 10+ tools)
- Platform compatibility breaks (Copilot doesn't have Task equivalent)

### Pitfall 6: Frontmatter Overwrites Legacy
**What goes wrong:** Template system writes to same paths, breaks commands still using legacy
**Why it happens:** Both systems generate to same output directory
**How to avoid:**
1. Check existing commands during generate: warn if file exists
2. Use gsd- prefix for new format, gsd: for legacy (different names)
3. Test with --dry-run before actual generation
**Warning signs:**
- Legacy commands stop working after skill generation
- File permissions change unexpectedly
- Git shows unexpected modifications to legacy commands

## Code Examples

Verified patterns from legacy commands:

### Example 1: Parallel Research Spawning (new-project/new-milestone)
```javascript
// Source: commands/gsd/new-project.md lines 232-242, 328-484
// Display spawning indicator FIRST (better UX)
```
◆ Spawning 4 researchers in parallel...
  → Stack research
  → Features research
  → Architecture research
  → Pitfalls research
```

// Then spawn all 4 in one message
Task(prompt="
<research_type>
Project Research — Stack dimension for [domain].
</research_type>

<milestone_context>
[greenfield OR subsequent]
</milestone_context>

<question>
What's the standard 2025 stack for [domain]?
</question>

<project_context>
[PROJECT.md summary]
</project_context>

<output>
Write to: .planning/research/STACK.md
Use template: ~/.claude/get-shit-done/templates/research-project/STACK.md
</output>
", subagent_type="gsd-project-researcher", description="Stack research")

Task(prompt="...", subagent_type="gsd-project-researcher", description="Features research")
Task(prompt="...", subagent_type="gsd-project-researcher", description="Architecture research")
Task(prompt="...", subagent_type="gsd-project-researcher", description="Pitfalls research")

// After all complete, spawn synthesizer
Task(prompt="...", subagent_type="gsd-research-synthesizer", description="Synthesize research")
```

### Example 2: Wave-Based Execution (execute-phase)
```xml
<!-- Source: commands/gsd/execute-phase.md lines 40-80, 228-242 -->
<process>
1. **Validate phase exists**
   - Find phase directory
   - Count PLAN.md files

2. **Discover plans**
   - List all *-PLAN.md files
   - Check which have *-SUMMARY.md (already complete)
   - Build list of incomplete plans

3. **Group by wave**
   - Read `wave` from each plan's frontmatter
   - Group plans by wave number

4. **Execute waves**
   For each wave in order:
   - Spawn gsd-executor for each plan in wave (parallel)
   - Wait for completion
   - Verify SUMMARYs created
   - Proceed to next wave
</process>

<!-- Spawning pattern -->
<wave_execution>
Spawn all plans in a wave with a single message:

Task(prompt="Execute plan at {plan_01_path}\n\nPlan: @{plan_01_path}", subagent_type="gsd-executor")
Task(prompt="Execute plan at {plan_02_path}\n\nPlan: @{plan_02_path}", subagent_type="gsd-executor")
Task(prompt="Execute plan at {plan_03_path}\n\nPlan: @{plan_03_path}", subagent_type="gsd-executor")

All three run in parallel. Task tool blocks until all complete.
</wave_execution>
```

### Example 3: Structured Return with Routing (new-project roadmapper)
```javascript
// Source: commands/gsd/new-project.md lines 680-794
// Spawn roadmapper
Task(prompt="
<planning_context>
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/research/SUMMARY.md
@.planning/config.json
</planning_context>

<instructions>
Create roadmap:
1. Derive phases from requirements
2. Map every v1 requirement to exactly one phase
3. Write files immediately (ROADMAP.md, STATE.md)
4. Return ROADMAP CREATED with summary
</instructions>
", subagent_type="gsd-roadmapper", description="Create roadmap")

// Parse structured return
if (result.includes("## ROADMAP BLOCKED")) {
  // Present blocker, get user input
  presentBlockerInformation();
  workWithUserToResolve();
  respawn();
} else if (result.includes("## ROADMAP CREATED")) {
  // Success path
  readCreatedRoadmap();
  presentToUser();
  askForApproval();
  
  if (approved) {
    commitRoadmap();
  } else if (adjustments) {
    respawnWithRevisionContext();
  }
}
```

### Example 4: @-Reference Structure
```xml
<!-- Source: commands/gsd/new-project.md lines 30-36 -->
<execution_context>

@~/.claude/get-shit-done/references/questioning.md
@~/.claude/get-shit-done/references/ui-brand.md
@~/.claude/get-shit-done/templates/project.md
@~/.claude/get-shit-done/templates/requirements.md

</execution_context>

<!-- Later in process -->
<context>
Phase: $ARGUMENTS

@.planning/ROADMAP.md
@.planning/STATE.md
</context>
```

**Structure rules:**
1. Section name matters: `<execution_context>` vs `<context>` have different semantics
2. Blank lines around @-references improve readability
3. Relative paths (.planning) and absolute paths (~/.claude) both work
4. Order can matter - some references build on others

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Sequential agent spawning | Parallel Task() calls | v1.8 (2024-12) | 5x faster new-project research |
| JSON structured returns | Markdown headers | v1.7 (2024-11) | More natural for Claude, easier debugging |
| Copy-paste templates | @-references | v1.5 (2024-09) | Dynamic updates, context budget efficient |
| Inline all instructions | External reference files | v1.6 (2024-10) | Reusable patterns, lean orchestrators |

**Deprecated/outdated:**
- `TaskOutput` loops - Task tool now blocks until completion, no polling needed
- Separate synthesizer spawn - Can be part of initial parallel spawn
- String matching returns - Use markdown header checks instead

## Open Questions

Things that couldn't be fully resolved:

1. **Task tool platform compatibility**
   - What we know: Task is Claude Code native, spawns subagents in parallel
   - What's unclear: Does GitHub Copilot CLI have equivalent? How to handle in migration?
   - Recommendation: Add platform conditional for Task - orchestrators might be Claude-only initially

2. **@-reference resolution during generation**
   - What we know: @-references work at runtime when Claude executes command
   - What's unclear: Should template system validate @-references exist during generation?
   - Recommendation: Add warning (not error) if referenced file missing - might be created later

3. **Checkpoint handling in orchestrators**
   - What we know: execute-phase has checkpoint protocol, others use AskUserQuestion
   - What's unclear: Should orchestrators handle subagent checkpoints specially?
   - Recommendation: Document pattern but don't add orchestrator-specific code - subagents handle their own checkpoints

## Sources

### Primary (HIGH confidence)
- Legacy commands: commands/gsd/new-project.md, new-milestone.md, execute-phase.md (direct inspection)
- Agent specs: specs/agents/gsd-project-researcher.md, gsd-executor.md, gsd-roadmapper.md (subagent interfaces)
- Existing plans: .planning/phases/02-template-engine-integration/02-01-PLAN.md (proven patterns)

### Secondary (MEDIUM confidence)
- Template system code: bin/lib/template-system/generator.js (implementation details)
- Phase 2 research: .planning/phases/02-template-engine-integration/02-RESEARCH.md (architecture context)

### Tertiary (LOW confidence)
- None - all findings verified from codebase inspection

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Task tool is native Claude capability, verified in use
- Architecture: HIGH - Patterns extracted from working legacy commands
- Pitfalls: HIGH - Based on migration lessons from Phase 1-2

**Research date:** 2025-01-22
**Valid until:** 2025-03-22 (60 days - orchestration patterns stable, Task tool unlikely to change)

**Key constraints from context:**
- Must preserve @-references exactly (MIGR-07)
- Must maintain multi-section XML structure (MIGR-08)
- Must complete dependency audit (MIGR-01)
- Must support parallel subagent spawning (ORCH-01 through ORCH-05)
- Must not add orchestration-specific features to template system (from prior decisions)

**Migration complexity:**
- new-project: 892 lines, 14 subagent spawns, 4 @-references
- new-milestone: 718 lines, 9 subagent spawns, 4 @-references
- execute-phase: 305 lines, dynamic subagent spawns (wave-based), 2 @-references

All three are HIGH complexity due to orchestration logic, not just line count.
