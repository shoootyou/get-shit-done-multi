# Agent Split Pattern: Coordinator/Specialist

## Purpose

Enable oversized agents to work on platforms with character limits by splitting into functional pairs that maintain 100% content preservation.

**Challenge:** Copilot has a 30,000 character limit for agent specs. Some agents (gsd-planner at 41K, gsd-debugger at 35K) exceed this limit.

**Solution:** Functional decomposition into coordinator/specialist pairs rather than content compression.

## Roles

### Coordinator (Primary Agent)

- **Spawned by:** Orchestrators/commands (e.g., `/gsd:plan-phase`, `/gsd:debug`)
- **Handles:** Execution flow and orchestration
- **Contains:** Role, execution steps, checkpoint management, structured returns
- **Makes decisions:** When to spawn specialist for complex scenarios
- **Typical size:** ~50% of original content (execution-focused)

### Specialist (Advisory Agent)

- **Spawned by:** Coordinator via task tool
- **Provides:** Deep methodology and techniques
- **Contains:** Philosophy, detailed techniques, examples, patterns, anti-patterns
- **Returns:** Analysis, recommendations, strategies (NOT implementation)
- **Typical size:** ~50% of original content (knowledge-focused)

## Content Distribution

### Coordinator Gets

- Role definition and core responsibilities
- Execution flow (step-by-step orchestration)
- Checkpoint and structured return protocols
- Mode-specific protocols (gap closure, revision, etc.)
- **When/how to spawn specialist** (coordination section)
- File management protocols (e.g., debug files, state files)
- Error handling and recovery

### Specialist Gets

- Philosophy sections (principles, patterns, mental models)
- Detailed methodology (with ALL examples preserved)
- Technique libraries (complete, uncompressed)
- Anti-patterns and edge cases
- Reference tables and decision trees
- Deep dive sections with full code examples

## Coordination Protocol

### When Coordinator Spawns Specialist

Coordinator spawns specialist when:

- **Complex analysis needed** - Beyond standard execution patterns
- **Novel scenarios** - Without established patterns in coordinator's knowledge
- **Decision-making** - Requiring framework analysis or methodology selection
- **User explicitly requests** - "Explain your methodology" or "Why this approach?"

### Spawn Pattern

```javascript
task(
  agent_type="gsd-xxx-specialist",
  description="Analyze dependency graph",
  prompt=`
Context: {situation description}
Question: {specific analysis needed}

Provide: {what specialist should return}
`
)
```

### Specialist Response Format

Specialist returns:
- **Analysis** - What the situation means
- **Recommendations** - What approach to take
- **Rationale** - Why this recommendation fits
- **NOT execution** - Coordinator implements the advice

## Split Methodology

### Step 1: Document Structure

```bash
# Extract section outline
grep -n "^#\|^<" original-agent.md > structure.txt
```

### Step 2: Categorize Sections

For each section, decide:
- **Execution** → Coordinator
- **Methodology** → Specialist
- **Ambiguous** → Split or duplicate small pieces

### Step 3: Split with Zero Loss

```bash
# Verify character counts
original=$(wc -c < original-agent.md)
combined=$(wc -c < coordinator.md && wc -c < specialist.md | awk '{sum+=$1} END {print sum}')
diff=$((combined - original))

# Should be within ±500 chars (only frontmatter and coordination section added)
```

### Step 4: Add Coordination Logic

In coordinator, add before `<execution_flow>`:

```xml
<coordination>

## When to Spawn Specialist

Spawn {agent-name}-specialist when:
- {scenario 1}
- {scenario 2}
- {scenario 3}

Spawn pattern:
```
task(
  agent_type="{agent-name}-specialist",
  description="{brief description}",
  prompt="Context: ...\nQuestion: ..."
)
```

For standard cases: Use built-in execution flow.
For complex cases: Spawn specialist for analysis, then execute per their recommendations.

</coordination>
```

### Step 5: Verify Both Agents

- [ ] Coordinator < 30,000 characters
- [ ] Specialist < 30,000 characters
- [ ] Combined ≈ original (±500 chars tolerance)
- [ ] All sections accounted for
- [ ] All examples preserved (not abbreviated)
- [ ] Coordination section present in coordinator
- [ ] Proper frontmatter in both agents

## Example Splits

### gsd-planner → gsd-planner + gsd-planner-strategist

**Coordinator (21K chars):**
- Role, execution flow
- Checkpoint management
- Gap closure mode
- Revision mode
- Structured returns
- **Coordination section**

**Strategist (19K chars):**
- Philosophy (anti-enterprise patterns, quality curve)
- Discovery levels (all 4 levels with examples)
- Task breakdown (complete with examples)
- Dependency graphs (construction rules, vertical slices)
- Scope estimation (context budget, split signals)
- Goal-backward verification (complete methodology)
- TDD integration (full RED-GREEN-REFACTOR)

### gsd-debugger → gsd-debugger + gsd-debugger-specialist

**Investigator (19K chars):**
- Role, execution flow
- Debug file protocol (all formats and update rules)
- Checkpoint management
- Session management
- Structured returns
- **Coordination section**

**Specialist (16K chars):**
- Philosophy (scientific method, cognitive biases)
- Hypothesis testing (complete with RED-AMBER-GREEN)
- Investigation techniques (all 7+ techniques with full examples)
- Verification patterns (all patterns with examples)
- Research vs reasoning (decision trees)

## Benefits

### 1. Zero Content Loss
Every example, table, and technique preserved—just reorganized.

### 2. Better Architecture
Separation of concerns: execution vs. knowledge/methodology.

### 3. Scalability
Pattern works for any oversized agent—proven with 2 different agent types.

### 4. No Breaking Changes
Orchestrators spawn coordinators; users don't see the change. Specialists are transparent implementation details.

### 5. Platform Parity
Both Claude and Copilot get the same functionality—just organized differently for Copilot's constraints.

## Anti-Patterns to Avoid

### ❌ Content Compression
**Don't:** Remove examples, abbreviate tables, convert detailed sections to bullets.  
**Why:** Information loss defeats the purpose.

### ❌ Arbitrary Size Targets
**Don't:** "Coordinator must be exactly 20K, specialist exactly 15K."  
**Why:** Natural splits may not align to round numbers.

### ❌ Rewriting During Split
**Don't:** "Improve" or "clarify" text while splitting.  
**Why:** Risk introducing errors. Split is reorganization, not revision.

### ❌ Unclear Coordination
**Don't:** Leave coordinator without spawn logic or unclear triggers.  
**Why:** Coordinator won't know when to use specialist.

### ❌ Specialist Execution
**Don't:** Have specialist try to implement its recommendations.  
**Why:** Coordinator owns execution; specialist provides analysis only.

## Validation Checklist

After split, verify:

- [ ] **Character counts:** Both agents under 30,000 chars
- [ ] **Content preservation:** Combined ≈ original (±500 chars)
- [ ] **Section accounting:** Every section from original in one of the two new agents
- [ ] **Examples intact:** No "simplified" or abbreviated examples
- [ ] **Tables intact:** Not converted to prose or bullets
- [ ] **Coordination present:** Coordinator has spawn logic
- [ ] **Frontmatter correct:** Both agents have proper YAML frontmatter
- [ ] **Roles clear:** Coordinator = execution, Specialist = methodology
- [ ] **Generation works:** Both agents render for both platforms
- [ ] **References updated:** Commands spawn coordinators (not old names)

## Maintenance

When updating split agents:

1. **Small changes:** Edit coordinator or specialist directly
2. **Large changes:** Consider if split point needs adjustment
3. **New sections:** Categorize as execution or methodology, add to appropriate agent
4. **Coordination tuning:** Adjust spawn triggers based on usage patterns

## Future Extensions

This pattern could support:

- **Multi-specialist coordinators** - Coordinator spawns multiple specialists
- **Specialist chains** - One specialist spawns another
- **Dynamic splitting** - Generate splits at install time based on platform
- **Variant specialists** - Different specialists for different domains
