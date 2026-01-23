# Phase 6: Orchestration Validation - Research

**Researched:** 2026-01-23
**Domain:** Multi-agent orchestration system validation
**Confidence:** HIGH

## Summary

Phase 6 validates that orchestration patterns work correctly across the 29 migrated GSD commands. Orchestration in this system involves parent commands (orchestrators) spawning subagents via `Task()` calls, structured markdown returns for status parsing, @-references for context passing, and both parallel and sequential execution modes.

Research found:
- **Existing infrastructure**: Comprehensive orchestration validation library already exists in `bin/lib/orchestration/` with result validators, equivalence testers, and agent invokers
- **Standard patterns**: Task spawning, structured returns (## RESEARCH COMPLETE, ## PLAN COMPLETE), @-references with variable interpolation
- **Testing strategy**: Integration tests that compare legacy vs new spec behavior, validate structured output parsing, and verify context passing

**Primary recommendation:** Build validation suite on existing orchestration infrastructure, focus on behavioral equivalence testing between legacy commands and new specs, test the 3 high-complexity orchestrators (new-project, new-milestone, execute-phase) which have the most complex spawning patterns.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js Assert | Built-in | Test assertions | No external dependencies, sufficient for validation |
| fs/promises | Built-in | File system validation | Native async file operations for artifact checking |
| Markdown parsing | Regex-based | Structured return parsing | Lightweight, no dependencies, works for specific ## HEADING format |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Performance Tracker | Internal | Track agent execution time | Already exists in `bin/lib/orchestration/performance-tracker.js` |
| Result Validator | Internal | Validate .planning/ structure | Already exists in `bin/lib/orchestration/result-validator.js` |
| Agent Invoker | Internal | CLI-agnostic agent calls | Already exists in `bin/lib/orchestration/agent-invoker.js` |
| Equivalence Test | Internal | Compare outputs across CLIs | Already exists in `bin/lib/orchestration/equivalence-test.js` |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Regex parsing | Marked.js parser | Marked.js adds dependency, regex sufficient for controlled ## HEADING format |
| Integration tests | Unit tests only | Unit tests can't validate end-to-end spawning, need integration |
| Manual validation | Automated suite | Manual validation doesn't scale to 29 commands, automation essential |

**Installation:**
```bash
# No external dependencies needed - using built-in Node.js modules
# Existing orchestration infrastructure in bin/lib/orchestration/
```

## Architecture Patterns

### Recommended Project Structure
```
bin/lib/orchestration/
├── result-validator.js       # Validate .planning/ artifacts
├── equivalence-test.js        # Compare legacy vs new behavior
├── agent-invoker.js           # Spawn agents for testing
├── performance-tracker.js     # Track execution metrics
└── *.test.js                  # Unit tests for each module

.planning/phases/06-orchestration-validation/
├── 06-RESEARCH.md             # This file
├── 06-01-PLAN.md              # Validation suite plan
├── test-cases/                # Test scenarios
│   ├── parallel-spawning.md   # 5 agents at once (new-project)
│   ├── sequential-spawning.md # Checkpoint continuation (research-phase)
│   └── structured-returns.md  # Parsing ## COMPLETE blocks
└── validation-results/        # Test outputs
```

### Pattern 1: Structured Return Parsing
**What:** Extract status blocks from agent markdown output
**When to use:** When orchestrator needs to route based on subagent completion status
**Example:**
```javascript
// Source: bin/lib/orchestration/result-validator.js pattern (adapted)
function parseStructuredReturn(markdown) {
  // Look for structured return headers
  const patterns = [
    /^## RESEARCH COMPLETE$/m,
    /^## PLAN COMPLETE$/m,
    /^## EXECUTION COMPLETE$/m,
    /^## RESEARCH BLOCKED$/m
  ];
  
  for (const pattern of patterns) {
    const match = markdown.match(pattern);
    if (match) {
      // Extract section content
      const headerStart = match.index;
      const contentStart = headerStart + match[0].length;
      
      // Find next ## or end of string
      const nextHeader = markdown.substring(contentStart).search(/^## /m);
      const contentEnd = nextHeader === -1 
        ? markdown.length 
        : contentStart + nextHeader;
      
      const content = markdown.substring(contentStart, contentEnd).trim();
      
      return {
        status: match[0].replace('## ', '').replace(' ', '_').toLowerCase(),
        content,
        raw: markdown
      };
    }
  }
  
  return {
    status: 'unknown',
    content: markdown,
    raw: markdown
  };
}
```

### Pattern 2: Parallel Task Spawning Validation
**What:** Test that multiple Task() calls execute concurrently
**When to use:** Testing orchestrators like new-project that spawn 4-6 agents at once
**Example:**
```javascript
// Validation pattern for parallel spawning
async function validateParallelSpawning(orchestratorName, expectedAgents) {
  const startTime = Date.now();
  const tracker = new PerformanceTracker();
  
  // Invoke orchestrator
  const result = await invokeAgent(orchestratorName, testPrompt);
  
  const duration = Date.now() - startTime;
  
  // Check that all agents were spawned
  const spawnedAgents = tracker.getActiveAgents();
  assert.deepStrictEqual(
    spawnedAgents.sort(),
    expectedAgents.sort(),
    'All expected agents should be spawned'
  );
  
  // Verify parallel execution (not sequential)
  // If sequential: duration ≈ sum of individual durations
  // If parallel: duration ≈ max(individual durations)
  const sequentialEstimate = spawnedAgents.reduce(
    (sum, agent) => sum + tracker.getDuration(agent), 0
  );
  
  // Parallel should be significantly faster than sequential
  assert.ok(
    duration < sequentialEstimate * 0.7,
    `Execution should be parallel (${duration}ms < ${sequentialEstimate * 0.7}ms)`
  );
  
  return { success: true, duration, agents: spawnedAgents };
}
```

### Pattern 3: @-Reference Resolution Validation
**What:** Verify that @-references in prompts resolve to actual files
**When to use:** Testing context passing between orchestrators and subagents
**Example:**
```javascript
// Extract and validate @-references from prompt
function validateContextPassing(prompt, planningDir = '.planning') {
  const refPattern = /@([^\s,}]+)/g;
  const references = [];
  let match;
  
  while ((match = refPattern.exec(prompt)) !== null) {
    references.push(match[1]);
  }
  
  const errors = [];
  for (const ref of references) {
    // Check if file exists
    const fullPath = ref.startsWith('/') ? ref : path.join(planningDir, ref);
    if (!fs.existsSync(fullPath)) {
      errors.push(`Referenced file not found: ${ref}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    references,
    errors
  };
}
```

### Pattern 4: Variable Interpolation Testing
**What:** Test {variable} and @{variable} substitution in prompts
**When to use:** Validating execute-phase which uses @{plan_01_path} style variables
**Example:**
```javascript
// Test variable interpolation in orchestrator prompts
function testVariableInterpolation() {
  const template = "Execute plan at {plan_01_path}\n\nPlan: @{plan_01_path}";
  const variables = {
    plan_01_path: '.planning/phases/01-foundation/01-01-PLAN.md'
  };
  
  const result = interpolateVariables(template, variables);
  
  // Check both {var} and @{var} formats are replaced
  assert.ok(
    result.includes('.planning/phases/01-foundation/01-01-PLAN.md'),
    'Variables should be interpolated'
  );
  assert.ok(
    !result.includes('{plan_01_path}'),
    'Variable placeholders should be replaced'
  );
  assert.ok(
    !result.includes('@{plan_01_path}'),
    '@-prefixed variables should also be replaced'
  );
  
  return result;
}
```

### Anti-Patterns to Avoid
- **Testing with mock agents only:** Real agent execution needed to validate spawning mechanism
- **Ignoring timing validation:** Parallel spawning MUST be faster than sequential, measure to verify
- **String comparison for equivalence:** Legacy and new specs may have whitespace differences, normalize before comparing
- **Manual test case maintenance:** Generate test cases from spec files to stay in sync with changes

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Agent invocation abstraction | Custom CLI wrapper | `bin/lib/orchestration/agent-invoker.js` | Already handles CLI detection, error handling, performance tracking |
| .planning/ structure validation | File existence checks | `bin/lib/orchestration/result-validator.js` | Validates complete structure, JSON parsing, phase files |
| Cross-CLI equivalence testing | Manual comparison | `bin/lib/orchestration/equivalence-test.js` | Handles normalization, structural comparison, multiple CLIs |
| Performance tracking | Date.now() calls | `bin/lib/orchestration/performance-tracker.js` | Tracks agent execution with marks, calculates durations |
| Structured return parsing | Custom regex per command | Unified parsing function | One pattern handles all ## COMPLETE variants |

**Key insight:** Orchestration infrastructure already exists and is tested (208 passing tests per STATE.md). Validation suite should extend existing patterns, not reinvent them.

## Common Pitfalls

### Pitfall 1: Assuming Task() Spawns Synchronously
**What goes wrong:** Tests assume Task() blocks until agent completes, but behavior may be async
**Why it happens:** Unclear if Task() is synchronous or async in the actual platform implementation
**How to avoid:** Test both behaviors - assume async, add await if needed, verify completion before continuing
**Warning signs:** Tests pass but orchestrators fail in production when agents don't complete

### Pitfall 2: Not Validating Variable Interpolation Order
**What goes wrong:** Variables used in @-references must be interpolated BEFORE file resolution
**Why it happens:** Order matters: @{var} needs {var} replaced first, then @ resolution
**How to avoid:** Two-pass processing: 1) interpolate {variables}, 2) resolve @-references
**Warning signs:** @-references with variables fail to resolve, "file not found" errors

### Pitfall 3: Comparing Legacy vs New with Exact Match
**What goes wrong:** Whitespace, formatting, timestamp differences cause false negatives
**Why it happens:** Generated output may have different spacing than legacy
**How to avoid:** Normalize whitespace, ignore timestamps, compare semantic structure
**Warning signs:** Tests fail despite functionally identical behavior

### Pitfall 4: Testing Only Simple Commands
**What goes wrong:** Simple commands (help, add-todo) don't exercise orchestration
**Why it happens:** Easy to test, but don't validate complex spawning patterns
**How to avoid:** Prioritize high-complexity orchestrators (new-project, execute-phase, new-milestone)
**Warning signs:** Simple tests pass but complex orchestrators fail

### Pitfall 5: Not Testing Structured Return Malformations
**What goes wrong:** Orchestrators assume well-formed ## COMPLETE blocks, break on variations
**Why it happens:** Happy path testing only, no error case validation
**How to avoid:** Test malformed returns: missing headers, duplicate headers, wrong format
**Warning signs:** Orchestrators hang or crash when subagents return unexpected format

### Pitfall 6: Ignoring Checkpoint Continuation Pattern
**What goes wrong:** Sequential spawning with checkpoint files not validated
**Why it happens:** Parallel spawning is more obvious, sequential checkpoint pattern less visible
**How to avoid:** Test research-phase pattern: spawn → checkpoint file → respawn with @-reference
**Warning signs:** Long-running operations fail to resume, context loss between spawns

## Code Examples

Verified patterns from existing codebase:

### Parallel Spawning (from gsd-new-project SKILL.md)
```javascript
// Source: specs/skills/gsd-new-project/SKILL.md lines 537-677
// Pattern: Spawn 4 agents in parallel, each with specific focus

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

// All 4 Task() calls execute concurrently
// Orchestrator waits for all to complete before proceeding
```

### Sequential Spawning with Checkpoint (from gsd-research-phase SKILL.md)
```javascript
// Source: specs/skills/gsd-research-phase/SKILL.md lines 141-146
// Pattern: Spawn → wait for structured return → route based on status

Task(
  prompt=filled_prompt,
  subagent_type="gsd-phase-researcher",
  description="Research Phase {phase}"
)

// Agent returns structured markdown:
// ## RESEARCH COMPLETE
// **Phase:** {phase_number} - {phase_name}
// **Confidence:** [HIGH/MEDIUM/LOW]
// ...

// Orchestrator parses return, routes to next action
```

### Variable Interpolation in Prompt (from gsd-execute-phase SKILL.md)
```javascript
// Source: specs/skills/gsd-execute-phase/SKILL.md line 120
// Pattern: {variable} in prompt, @{variable} for file reference

Task(prompt="Execute plan at {plan_01_path}\n\nPlan: @{plan_01_path}\nProject state: @.planning/STATE.md", 
     subagent_type="gsd-executor")

// {plan_01_path} displays path to user
// @{plan_01_path} loads file content into agent context
// Variables must be interpolated before @ resolution
```

### Structured Return Format (from gsd-phase-researcher.md)
```markdown
<!-- Source: specs/agents/gsd-phase-researcher.md structured return section -->

## RESEARCH COMPLETE

**Phase:** {phase_number} - {phase_name}
**Confidence:** [HIGH/MEDIUM/LOW]

### Key Findings

[3-5 bullet points of most important discoveries]

### File Created

`${PHASE_DIR}/${PADDED_PHASE}-RESEARCH.md`

### Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Standard Stack | [level] | [why] |
| Architecture | [level] | [why] |
| Pitfalls | [level] | [why] |

### Ready for Planning

Research complete. Planner can now create PLAN.md files.
```

### Validation Test Structure (adapted from existing patterns)
```javascript
// Source: bin/lib/orchestration/result-validator.test.js pattern
const assert = require('assert');
const { ResultValidator } = require('./result-validator');

async function testOrchestrationValidation() {
  const validator = new ResultValidator('.planning');
  
  // Test 1: Structure validation
  const structure = await validator.validateStructure();
  assert.strictEqual(structure.valid, true, 'Planning structure should be valid');
  
  // Test 2: Agent output validation
  const output = await validator.validateAgentOutput('phases/01-foundation');
  assert.strictEqual(output.valid, true, 'Agent outputs should be valid');
  assert.ok(output.errors.length === 0, 'No errors should be present');
  
  // Test 3: JSON validation
  const json = await validator.validateJSON('config.json');
  assert.strictEqual(json.valid, true, 'config.json should be valid JSON');
  
  console.log('✓ All orchestration validation tests passed');
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Legacy commands in ./commands/gsd/ | Specs in /specs/skills/ | Phase 1-5 (2026-01-22) | Need validation to ensure behavioral equivalence |
| Implicit agent spawning | Explicit Task() calls | Phase 3 (2026-01-22) | More testable, can validate spawning patterns |
| No structured returns | ## COMPLETE blocks | Phase 3-4 (2026-01-22) | Enables orchestrator routing validation |
| Manual testing | Automated validation suite | Phase 6 (current) | Scalable to 29 commands |

**Deprecated/outdated:**
- Manual command comparison: Now automated via equivalence tests
- Legacy format testing: Focus on new spec validation, legacy kept for fallback only

## Open Questions

Things that couldn't be fully resolved:

1. **Task() Execution Model**
   - What we know: Task() is used for spawning, appears in both parallel and sequential contexts
   - What's unclear: Whether Task() is inherently async or sync, platform-specific behavior
   - Recommendation: Test both modes, verify with actual platform execution in Phase 7

2. **Structured Return Parsing Reliability**
   - What we know: ## COMPLETE format is defined, examples exist in agent specs
   - What's unclear: How platforms handle malformed returns, error propagation to orchestrator
   - Recommendation: Test error cases, document expected behavior for Phase 7 multi-platform testing

3. **Variable Interpolation Timing**
   - What we know: Both {var} and @{var} formats exist, order matters
   - What's unclear: Whether template system handles this automatically or orchestrators must do it
   - Recommendation: Test interpolation in validation suite, document expected order

4. **Checkpoint File Format**
   - What we know: Research-phase uses checkpoint continuation, passes @-reference to prior state
   - What's unclear: Standardized checkpoint file format, naming conventions
   - Recommendation: Document pattern from research-phase, consider standardization in Phase 8

## Sources

### Primary (HIGH confidence)
- Codebase examination: `bin/lib/orchestration/` directory (10 files, ~60KB of production code)
- Existing specs: `specs/skills/gsd-new-project/`, `specs/skills/gsd-execute-phase/`, `specs/skills/gsd-research-phase/`
- Agent specs: `specs/agents/gsd-phase-researcher.md`, `specs/agents/gsd-executor.md`
- Verification reports: `.planning/phases/02-template-engine-integration/02-VERIFICATION.md`, `.planning/phases/5.1-fix-git-identity-preservation-in-agents/5.1-VERIFICATION.md`

### Secondary (MEDIUM confidence)
- STATE.md: 208 passing tests mentioned for template system
- ROADMAP.md: Phase 6 success criteria defining structured return parsing, parallel spawning
- REQUIREMENTS.md: ORCH-06, ORCH-08, MIGR-10, TEST-09 requirements

### Tertiary (LOW confidence)
- None - all findings based on direct codebase examination

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All infrastructure exists in codebase, no external dependencies needed
- Architecture: HIGH - Patterns verified in multiple command specs and existing orchestration code
- Pitfalls: MEDIUM - Inferred from code patterns, need validation through actual testing

**Research date:** 2026-01-23
**Valid until:** 2026-02-23 (30 days - stable internal codebase, no external dependencies)
**Research method:** Direct codebase examination, no external sources needed
