# Architecture: Multi-Platform Agent Template System

## Overview

This project uses **template-based generation** to support multiple AI platforms (Claude and GitHub Copilot) from a single source of truth. Instead of maintaining separate agent files for each platform, we maintain **agent specs** that generate optimized agents for each platform at install time.

### Why Template-Based Generation?

**Problem:** Different AI platforms have different requirements:
- Claude uses uppercase tool names (`Bash`), string tool format, no metadata field
- Copilot uses lowercase primary aliases (`execute`), array tool format, nested metadata
- Maintaining separate files leads to drift, inconsistency, and double maintenance burden

**Solution:** Single source of truth with platform-specific rendering:
```
Agent Spec (specs/agents/*.md) 
    ↓ (Template System)
    ├→ Claude Agent (agents/*.md)
    └→ Copilot Agent (.github/copilot/agents/*.md)
```

**Benefits:**
1. **Zero drift** - One spec generates both platforms
2. **Platform optimization** - Each platform gets native format
3. **No runtime overhead** - Generated once at install time
4. **Single maintenance point** - Update spec, regenerate both
5. **Testable** - Validate generation, installation, and invocation

## Template System Architecture

The template system transforms agent specs into platform-specific agents through a four-stage pipeline:

```
Spec File → Parse → Render → Transform → Validate → Write
```

### Generation Pipeline

1. **Parse** - Extract YAML frontmatter and markdown body
2. **Render** - Apply Mustache conditionals and variables
3. **Transform** - Apply platform-specific transformations (tools, metadata)
4. **Validate** - Check against platform requirements
5. **Write** - Output to platform-specific directory

### Core Modules

#### lib-ghcc/templates/generator.js

**Purpose:** Orchestrates the complete generation pipeline.

**Key Functions:**
```javascript
generateAgent(specPath, platform, options)
  // File-based generation
  // Returns: { success, output, errors, warnings, metadata }

generateFromSpec(specContent, platform, options)
  // In-memory generation (for tests)
  // Returns: { success, output, errors, warnings, metadata }
```

**Pipeline Stages:**
1. Read spec file or parse spec content
2. Build context with platform variables
3. Render template with Mustache
4. Parse rendered YAML frontmatter
5. Transform fields for platform
6. Map tools to platform-specific names
7. Validate against platform rules
8. Serialize to final format
9. Write to target location

**Error Handling:** Each stage returns structured errors with identifiers for precise debugging.

#### lib-ghcc/templates/validator.js

**Purpose:** Validates template specs before generation.

**Key Functions:**
```javascript
validateTemplate(spec)
  // Validates template structure
  // Checks: frontmatter syntax, required fields, Mustache syntax

validatePlatformOutput(output, platform)
  // Validates generated agent
  // Checks: platform-specific rules, tool availability, size limits
```

**Validation Levels:**
- **Errors** - Block generation (invalid YAML, missing required fields)
- **Warnings** - Non-blocking (risky tools, approaching size limits)

#### lib-ghcc/templates/registry.js

**Purpose:** Tracks agent specs and generated outputs.

**Key Functions:**
```javascript
registerSpec(specPath, metadata)
  // Track spec in registry
  // Metadata: version, lastGenerated, platforms

getRegisteredSpecs()
  // List all registered specs
  // Used by bulk generation

updateGenerationTimestamp(specPath, platform)
  // Track when spec was last generated for platform
```

**Registry Location:** `.planning/template-registry.json`

#### lib-ghcc/templates/types.js

**Purpose:** Type definitions and constants.

**Key Exports:**
```javascript
PLATFORMS = { CLAUDE: 'claude', COPILOT: 'copilot' }
SPEC_SECTIONS = ['frontmatter', 'body']
REQUIRED_FIELDS = ['name', 'description', 'tools']
```

**Type Structures:**
```typescript
TemplateSpec {
  frontmatter: Object,  // YAML metadata
  body: string,         // Markdown content
  path: string          // Source file path
}

GenerationResult {
  success: boolean,
  output: string,       // Generated agent content
  errors: string[],     // Blocking errors
  warnings: string[],   // Non-blocking warnings
  metadata: Object      // Generation metadata
}
```

## Platform Abstraction Layer

The platform abstraction layer isolates platform differences in three modules:

### Module Breakdown

#### bin/lib/template-system/tool-mapper.js

**Purpose:** Bidirectional mapping between canonical tool names and platform-specific names.

**Key Concepts:**

**Canonical Tool Names:** Platform-independent identifiers
```javascript
CANONICAL_TOOLS = {
  BASH: 'Bash',      // Execute shell commands
  READ: 'Read',      // Read files
  WRITE: 'Write',    // Write files (alias: Edit)
  GREP: 'Grep',      // Search file contents
  GLOB: 'Glob',      // Find files by pattern
  TASK: 'Task'       // Spawn sub-agents
}
```

**Platform-Specific Mapping:**
```javascript
// Claude → Use canonical names (uppercase)
mapToolsForPlatform(['Bash', 'Read', 'Edit'], 'claude')
// Returns: ['Bash', 'Read', 'Edit']

// Copilot → Use PRIMARY aliases (lowercase)
mapToolsForPlatform(['Bash', 'Read', 'Edit'], 'copilot')
// Returns: ['execute', 'read', 'edit']
```

**Bidirectional Lookup (REVERSE_TOOL_INDEX):**

Accepts all variants (uppercase, lowercase, aliases) and returns canonical name:
```javascript
lookupCanonicalTool('bash')     // → 'Bash'
lookupCanonicalTool('BASH')     // → 'Bash'
lookupCanonicalTool('execute')  // → 'Bash'
lookupCanonicalTool('Bash')     // → 'Bash'
```

**PRIMARY Aliases for Copilot:**

Official Copilot spec requires PRIMARY names, not compatible alternatives:
```javascript
COPILOT_PRIMARY_TOOLS = {
  'Bash': 'execute',    // NOT 'bash' (compatible)
  'Edit': 'edit',       // NOT 'write' (compatible)
  'Grep': 'search',     // NOT 'grep' (compatible)
  'Glob': 'search',     // NOT 'glob' (compatible) - deduplicates with Grep
  'Task': 'agent'       // NOT 'task' (compatible)
}
```

**Deduplication:** Grep + Glob both map to `search` → deduplicate with `Set()`:
```javascript
['Grep', 'Glob'] → ['search', 'search'] → ['search']
```

**Key Functions:**
```javascript
mapToolsForPlatform(tools, platform)
  // Maps canonical names to platform-specific names
  // Handles deduplication for Copilot

validateToolList(tools, platform)
  // Returns warnings for unavailable/unknown tools
  // Non-blocking (mapTools filters them)

lookupCanonicalTool(toolName)
  // Accepts any variant, returns canonical name
  // Case-insensitive
```

#### bin/lib/template-system/field-transformer.js

**Purpose:** Transform frontmatter fields for platform-specific requirements.

**Platform Capability Flags:**
```javascript
PLATFORM_CAPABILITIES = {
  claude: {
    supportsMetadata: false,       // No metadata field in Claude
    supportsModel: true,
    supportsHooks: false,
    supportsSkills: false,
    maxPromptLength: null,         // No hard limit
    toolsFormat: 'string',         // "Bash, Read, Edit"
    toolCaseSensitive: true,       // Bash !== bash
    supportsDisallowedTools: false
  },
  copilot: {
    supportsMetadata: true,        // Nested metadata object
    supportsModel: true,
    supportsHooks: true,
    supportsSkills: true,
    maxPromptLength: 30000,        // 30K character limit
    toolsFormat: 'array',          // ["execute", "read", "edit"]
    toolCaseSensitive: false,      // execute === Execute
    supportsDisallowedTools: true
  }
}
```

**Field Rules (FIELD_RULES):**

Single source of truth for all platform metadata differences:
```javascript
FIELD_RULES = {
  metadata: {
    claude: null,           // No metadata field
    copilot: 'nested'       // Nested under metadata: {}
  },
  model: {
    claude: 'model',        // Direct field
    copilot: 'model'        // Direct field
  },
  tools: {
    claude: 'string',       // "Bash, Read, Edit"
    copilot: 'array'        // ["execute", "read", "edit"]
  },
  color: {
    claude: 'supported',    // color: '#FF6600'
    copilot: null           // Not in spec, filtered with warning
  }
  // ... more field mappings
}
```

**Key Functions:**
```javascript
transformFieldsForPlatform(fields, platform)
  // Transforms all fields for target platform
  // Returns: { transformed, warnings }

supportsField(platform, fieldName)
  // Query if platform supports field
  // Example: supportsField('copilot', 'color') → false

getFieldWarning(platform, fieldName)
  // Get warning message for unsupported field
  // Used for user feedback

getPlatformLimits(platform)
  // Get platform-specific constraints
  // Example: getPlatformLimits('copilot').maxPromptLength → 30000
```

**Unknown Field Handling:** Preserve with warnings for forward compatibility.

#### bin/lib/template-system/validators.js

**Purpose:** Platform-specific validation rules.

**Validation Structure:**
```javascript
validateForPlatform(spec, platform) {
  return {
    valid: boolean,
    errors: string[],      // Blocking issues
    warnings: string[]     // Non-blocking issues
  }
}
```

**Claude Validation:**
- ✅ Tools as string format
- ✅ No metadata field
- ✅ Uppercase tool names (case-sensitive)
- ⚠️ Unknown tools (warnings, not errors)

**Copilot Validation:**
- ✅ Tools as array format
- ✅ Metadata nested under metadata object
- ✅ Size ≤ 30,000 characters (error if exceeded)
- ✅ PRIMARY aliases used (execute, edit, search, agent)
- ✅ Color field filtered (not in spec)
- ⚠️ Approaching size limit (warning at 28K-30K)

**Validation Order:**
1. Tool validation → warnings (mapTools filters unavailable tools)
2. Field validation → errors for missing required fields
3. Size validation → errors for hard limits, warnings for soft limits
4. Format validation → errors for invalid YAML/structure

**Key Functions:**
```javascript
validateForClaude(spec)
  // Validate against Claude spec requirements
  // Returns: { valid, errors, warnings }

validateForCopilot(spec)
  // Validate against Copilot spec requirements
  // Returns: { valid, errors, warnings }

validateToolList(tools, platform)
  // Tool-specific validation
  // Returns warnings for unavailable tools
```

## Design Decisions

Key architectural decisions from phases 1-5:

### Template Engine

**Why gray-matter + Mustache?**
- Battle-tested libraries used by thousands of projects
- Zero dependencies (gray-matter has minimal deps)
- Logic-less templates prevent complexity creep
- Standard frontmatter format (YAML)

**Why spec-as-template pattern?**
- Single source of truth prevents drift
- Templates are the canonical format (not generated output)
- Version control tracks intent, not platform artifacts
- Easier review (one file to change, not two)

**Why install-time generation?**
- No runtime overhead (generated once, used many times)
- Users get optimized agents immediately
- Simpler mental model (install → use)
- Generated files can be gitignored (optional)

### Platform Abstraction

**Why bidirectional tool mapper?**
- Accepts all tool name variants (uppercase, lowercase, aliases)
- Simplifies validation (don't need to know which variant was used)
- Enables case-insensitive platforms (Copilot) and case-sensitive (Claude)
- Two-pass building (non-canonical first, canonical second) ensures canonical tools override conflicts

**Why PRIMARY aliases for Copilot?**
- Official Copilot spec compliance (zero warnings)
- Clear distinction between platforms (execute vs Bash)
- Future-proof (spec defines PRIMARY as official names)
- Deduplication prevents redundancy (Grep+Glob → search)

**Why separate tool references in prompts?**
- Agent content references tools by name
- Platform conditionals in prose: `{{#isClaude}}Bash{{/isClaude}}{{#isCopilot}}execute{{/isCopilot}}`
- Enables natural language in docs (use platform-specific names)
- Maintains accuracy (don't reference unavailable tools)

### Validation Strategy

**Why validation-first approach?**
- Catch errors early with helpful messages
- Better developer experience
- Prevents invalid agents from being installed
- Clear error messages with file paths and line numbers

**Why warnings vs errors?**
- Errors block generation (must fix)
- Warnings inform but allow generation (risky but valid)
- Flexibility for edge cases and forward compatibility
- Unknown tools → warnings (may be future additions)

**Why platform-specific validators?**
- Each platform has unique requirements
- Clearer error messages (platform-specific guidance)
- Easier to extend (add platform without affecting others)
- Validation tied to platform capabilities

### Content Organization

**Why specs/agents/ directory?**
- Clear separation between templates (specs) and output (agents)
- Parallel to agents/ directory for discoverability
- Versionable source of truth
- Enables bulk operations (migrate all, validate all)

**Why agent splitting pattern?**
- Copilot 30K limit requires functional decomposition
- Coordinator/specialist roles maintain full content
- Zero content loss (100% preservation)
- Backward compatible (coordinator uses original name)

## Platform Support Matrix

Comprehensive comparison of platform capabilities:

| Feature | Claude | Copilot | Notes |
|---------|--------|---------|-------|
| **Tools Format** | String | Array | `"Bash, Read, Edit"` vs `["execute", "read", "edit"]` |
| **Tool Naming** | Uppercase | PRIMARY aliases | `Bash` vs `execute` |
| **Tool Case Sensitivity** | Yes | No | `Bash` ≠ `bash` (Claude), `execute` = `Execute` (Copilot) |
| **Metadata Structure** | None | Nested | No field vs `metadata: { platform, generated }` |
| **Size Limits** | None | 30K chars | gsd-planner, gsd-debugger require splitting |
| **Model Selection** | ✅ | ✅ | Both support model parameter |
| **Hooks** | ❌ | ✅ | Copilot supports pre/post hooks |
| **Skills** | ❌ | ✅ | Copilot supports skill definitions |
| **Disallowed Tools** | ❌ | ✅ | Copilot supports tool restrictions |
| **MCP Support** | ✅ | ✅ | Both support MCP tools (via tools field) |
| **Color Field** | ✅ | ❌ | Claude supports, Copilot filters |
| **Conditionals** | `{{#isClaude}}` | `{{#isCopilot}}` | Mustache conditionals |

### Example: Generated Output Comparison

**Spec (specs/agents/gsd-verifier.md):**
```yaml
---
name: gsd-verifier
description: Verifies phase goals through goal-backward analysis
tools: {{toolBash}}, {{toolRead}}, {{toolGrep}}, {{toolGlob}}
{{#isCopilot}}
metadata:
  platform: copilot
  generated: {{timestamp}}
{{/isCopilot}}
---
```

**Claude Output (agents/gsd-verifier.md):**
```yaml
---
name: gsd-verifier
description: Verifies phase goals through goal-backward analysis
tools: Bash, Read, Grep, Glob
---
```

**Copilot Output (.github/copilot/agents/gsd-verifier.md):**
```yaml
---
name: gsd-verifier
description: Verifies phase goals through goal-backward analysis
tools:
  - execute
  - read
  - search
metadata:
  platform: copilot
  generated: 2026-01-22T13:41:13Z
---
```

**Key Differences:**
1. Tools format: String vs Array
2. Tool names: Uppercase vs PRIMARY aliases
3. Metadata: Absent vs Nested
4. Grep+Glob: Both listed vs Deduplicated to `search`

## File Structure

```
project-root/
├── specs/
│   └── agents/              # Template specs (single source)
│       ├── gsd-verifier.md
│       ├── gsd-planner.md
│       └── ...
├── agents/                  # Generated Claude agents
│   ├── gsd-verifier.md
│   ├── gsd-planner.md
│   └── ...
├── .github/
│   └── copilot/
│       └── agents/          # Generated Copilot agents
│           ├── gsd-verifier.md
│           ├── gsd-planner.md
│           └── ...
├── lib-ghcc/
│   └── templates/           # Template system core
│       ├── generator.js     # Orchestrates generation
│       ├── validator.js     # Template validation
│       ├── registry.js      # Spec tracking
│       ├── types.js         # Type definitions
│       └── index.js         # Public API
├── bin/
│   └── lib/
│       └── template-system/ # Platform abstraction
│           ├── tool-mapper.js       # Tool name mapping
│           ├── field-transformer.js # Field transformations
│           ├── validators.js        # Platform validators
│           ├── spec-parser.js       # YAML frontmatter parsing
│           ├── context-builder.js   # Platform context
│           ├── engine.js            # Mustache rendering
│           └── generator.js         # High-level generation API
├── scripts/
│   └── test-cross-platform.js      # E2E test orchestrator
└── docs/
    ├── AGENT-SPLIT-PATTERN.md      # Size optimization pattern
    └── TESTING-CROSS-PLATFORM.md   # Test suite documentation
```

## Generated Output

### Claude Agents (agents/*.md)

**Format:**
- YAML frontmatter with string tools format
- No metadata field
- Uppercase tool names (Bash, Read, Edit, Grep, Glob, Task)
- Standard markdown body

**Example:**
```yaml
---
name: gsd-executor
description: Executes GSD plans with atomic commits
tools: Bash, Read, Edit, Grep, Glob, Task
model: claude-sonnet-4.5
---

<role>
You are a GSD plan executor...
</role>
```

### Copilot Agents (.github/copilot/agents/*.md)

**Format:**
- YAML frontmatter with array tools format
- Nested metadata object
- PRIMARY alias tool names (execute, read, edit, search, agent)
- Single-line array formatting
- Standard markdown body

**Example:**
```yaml
---
name: gsd-executor
description: Executes GSD plans with atomic commits
tools: [execute, read, edit, search, agent]
model: claude-sonnet-4.5
metadata:
  platform: copilot
  projectName: lib-ghcc
  projectVersion: 1.9.0
  generated: 2026-01-22T13:41:13Z
---

<role>
You are a GSD plan executor...
</role>
```

### Size Considerations

**Copilot 30K Limit:**

Some agents exceed Copilot's 30,000 character limit:
- gsd-planner (41KB) → Split into gsd-planner + gsd-planner-specialist
- gsd-debugger (35KB) → Split into gsd-debugger + gsd-debugger-specialist

**Agent Splitting Pattern:**

See [AGENT-SPLIT-PATTERN.md](docs/AGENT-SPLIT-PATTERN.md) for details on coordinator/specialist decomposition.

**Key Points:**
- Coordinator uses original name (backward compatible)
- Specialist provides deep methodology via task tool
- 100% content preservation (zero loss)
- Functional decomposition (not compression)

## Code Examples

### Template Rendering

**Input Spec:**
```yaml
---
name: {{agentName}}
tools: {{#isClaude}}{{toolBash}}, {{toolRead}}{{/isClaude}}{{#isCopilot}}[{{toolBash}}, {{toolRead}}]{{/isCopilot}}
---
```

**Context:**
```javascript
{
  agentName: 'example-agent',
  isClaude: true,
  isCopilot: false,
  toolBash: 'Bash',
  toolRead: 'Read'
}
```

**Rendered Output:**
```yaml
---
name: example-agent
tools: Bash, Read
---
```

### Tool Mapping

```javascript
const { mapToolsForPlatform } = require('./bin/lib/template-system/tool-mapper');

// Claude - returns canonical names
const claudeTools = mapToolsForPlatform(['Bash', 'Read', 'Edit'], 'claude');
// Result: ['Bash', 'Read', 'Edit']

// Copilot - returns PRIMARY aliases
const copilotTools = mapToolsForPlatform(['Bash', 'Read', 'Edit'], 'copilot');
// Result: ['execute', 'read', 'edit']

// Deduplication (Grep + Glob → search)
const copilotSearch = mapToolsForPlatform(['Grep', 'Glob'], 'copilot');
// Result: ['search'] (deduplicated)
```

### Field Transformation

```javascript
const { transformFieldsForPlatform } = require('./bin/lib/template-system/field-transformer');

const fields = {
  name: 'example-agent',
  tools: ['Bash', 'Read'],
  color: '#FF6600',
  customField: 'value'
};

// Claude transformation
const { transformed: claudeFields, warnings: claudeWarnings } = 
  transformFieldsForPlatform(fields, 'claude');
// Result: { name, tools: "Bash, Read", color, customField }
// Warnings: ['customField not recognized']

// Copilot transformation
const { transformed: copilotFields, warnings: copilotWarnings } = 
  transformFieldsForPlatform(fields, 'copilot');
// Result: { name, tools: ['execute', 'read'], metadata: {...}, customField }
// Warnings: ['color not supported', 'customField not recognized']
```

### Platform Validation

```javascript
const { validateForPlatform } = require('./bin/lib/template-system/validators');

const spec = {
  name: 'example-agent',
  description: 'Example',
  tools: ['execute', 'read'],
  content: '# Agent content...',
  metadata: { platform: 'copilot' }
};

// Validate for Copilot
const result = validateForPlatform(spec, 'copilot');
// Result: {
//   valid: true,
//   errors: [],
//   warnings: []
// }

// If size exceeds limit
const largeSpec = { ...spec, content: '...'.repeat(15000) };
const sizeResult = validateForPlatform(largeSpec, 'copilot');
// Result: {
//   valid: false,
//   errors: ['Agent exceeds 30,000 character limit (31,245 chars)'],
//   warnings: []
// }
```

## Testing Architecture

Comprehensive test suite validates the complete pipeline. See [TESTING-CROSS-PLATFORM.md](docs/TESTING-CROSS-PLATFORM.md) for details.

**Test Stages:**

1. **Generation Tests** (`npm run test:generation`)
   - All 13 agents generate correctly
   - Platform-specific format validation
   - 22 tests (11 agents × 2 platforms)

2. **Installation Tests** (`npm run test:installation`)
   - Files land in correct directories
   - Format validation (YAML + markdown)
   - 5 tests

3. **Invocation Tests** (`npm run test:invocation`)
   - Agents respond via CLI
   - Tool execution verification
   - Smoke tests (requires CLIs installed)

4. **E2E Orchestration** (`npm test`)
   - Sequential execution: generation → installation → invocation
   - Real-time output with inherited stdio
   - Exit on first failure

**Test Command Matrix:**
```bash
npm test                    # All tests (recommended)
npm run test:generation     # Generation only
npm run test:installation   # Installation only
npm run test:invocation     # Invocation only (requires CLIs)
```

## Related Documentation

- [TESTING-CROSS-PLATFORM.md](docs/TESTING-CROSS-PLATFORM.md) - Test suite guide
- [AGENT-SPLIT-PATTERN.md](docs/AGENT-SPLIT-PATTERN.md) - Size optimization pattern
- [contributing.md](contributing.md) - How to add agents and run tests
- [README.md](README.md) - Project overview and quick start

---

*Architecture documented: 2026-01-22*
*Based on implementation through Phase 5*
