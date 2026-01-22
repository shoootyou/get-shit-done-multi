# Architecture Research

**Domain:** Template-based multi-platform agent generation system
**Researched:** 2025-01-21
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                      Install Orchestrator                       │
│                      (bin/install.js)                           │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ CLI         │  │ User Config  │  │ Template Engine      │  │
│  │ Detection   │  │ Parser       │  │ (Mustache/Handlebars)│  │
│  └──────┬──────┘  └──────┬───────┘  └──────────┬───────────┘  │
│         │                │                     │               │
├─────────┴────────────────┴─────────────────────┴───────────────┤
│                      Generation Pipeline                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Spec        │→│ Context       │→│ Generator            │  │
│  │ Parser      │  │ Builder       │  │ (per adapter)        │  │
│  └─────────────┘  └──────────────┘  └──────────┬───────────┘  │
│                                                 │               │
├─────────────────────────────────────────────────┴───────────────┤
│                      Adapter Layer                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Claude   │  │ Copilot  │  │ Codex    │                      │
│  │ Adapter  │  │ Adapter  │  │ Adapter  │                      │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                      │
│       │             │             │                             │
├───────┴─────────────┴─────────────┴─────────────────────────────┤
│                      Output Layer                               │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │         Platform-Specific Agent Files                    │   │
│  │  (agents/gsd-planner.md, agents/gsd-verifier.md, etc)   │   │
│  └──────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **CLI Detection** | Detect installed CLIs (Claude, Copilot, Codex) | Shell checks, config file existence |
| **Spec Parser** | Parse official agent spec files (YAML frontmatter + markdown) | YAML parser + markdown parser |
| **Context Builder** | Build template context from spec + platform flags | Object mapper, platform conditionals |
| **Template Engine** | Render templates with context | Mustache/Handlebars (logic-less preferred) |
| **Adapter** | Transform content for platform-specific paths/formats | Path rewriting, format conversion |
| **Generator** | Orchestrate spec → template → output flow | Pipeline coordinator |
| **Install Orchestrator** | Main entry point, CLI arg parsing, workflow | Node.js script |

## Recommended Project Structure

```
bin/
├── install.js                    # Main installer (existing - extend, not replace)
└── lib/
    ├── detect.js                 # CLI detection (existing)
    ├── paths.js                  # Config paths (existing)
    ├── adapters/                 # Platform adapters (existing)
    │   ├── claude.js
    │   ├── copilot.js
    │   └── codex.js
    └── template-system/          # NEW: Template layer
        ├── engine.js             # Template engine wrapper (Mustache/Handlebars)
        ├── spec-parser.js        # Parse spec files (YAML + markdown)
        ├── context-builder.js    # Build template context
        └── generator.js          # Orchestrate generation pipeline

specs/                            # NEW: Official specs (source of truth)
├── agents/
│   ├── gsd-planner.spec.md      # Agent spec with template variables
│   ├── gsd-verifier.spec.md
│   └── ...
└── shared/
    ├── meta-prompting.md         # Shared sections (partials)
    └── protocols.md

templates/                        # NEW: Optional - if using separate templates
└── agents/
    └── base-agent.hbs           # Base template if using template files

agents/                           # OUTPUT: Generated at install-time
├── gsd-planner.md               # Generated from spec
├── gsd-verifier.md
└── ...
```

### Structure Rationale

- **bin/lib/template-system/**: New directory for template system, cleanly separated from existing install logic
- **specs/**: Single source of truth for agent definitions, contains template variables ({{cli}}, {{paths}}, etc.)
- **agents/**: Generated output, not committed to git (or committed as build artifacts)
- **Extends existing install.js**: Import template-system modules, integrate into existing workflow

## Architectural Patterns

### Pattern 1: Spec-as-Template (Recommended)

**What:** Agent spec files ARE the templates. No separate .hbs/.mustache files. YAML frontmatter + markdown body with embedded template variables.

**When to use:** When templates closely mirror output (low transformation complexity)

**Trade-offs:**
- ✅ Single file per agent (spec is template)
- ✅ Easier to maintain (one file to edit)
- ✅ Clear what generates what
- ❌ Mixed concerns (spec + template syntax)

**Example:**
```markdown
---
name: gsd-planner
description: Creates executable phase plans...
{{#isCopilot}}
tools: Read, Write, Bash, Glob, Grep
{{/isCopilot}}
{{#isClaude}}
tools: Read, Write, Bash, Glob, Grep, WebFetch, mcp__context7__*
{{/isClaude}}
color: green
---

<role>
You are a GSD planner...

{{#isCopilot}}
Your working directory is {{workDir}}.
{{/isCopilot}}

{{#isClaude}}
Specs are located in {{specsPath}}.
{{/isClaude}}
</role>
```

### Pattern 2: Template + Spec Separation

**What:** Separate .spec.yml (data) and .template.md (structure) files. Template engine combines them.

**When to use:** When same template generates multiple outputs, or complex transformations needed

**Trade-offs:**
- ✅ Clean separation of data and presentation
- ✅ Template reuse across multiple specs
- ❌ Two files to maintain per agent
- ❌ Less obvious what generates what

**Example:**
```yaml
# specs/agents/gsd-planner.spec.yml
name: gsd-planner
description: Creates executable phase plans...
tools:
  copilot: [Read, Write, Bash, Glob, Grep]
  claude: [Read, Write, Bash, WebFetch, mcp__context7__*]
```

```markdown
# templates/agents/base-agent.hbs
---
name: {{name}}
description: {{description}}
tools: {{tools}}
---

<role>{{role}}</role>
```

### Pattern 3: Inline Template Sections (Hybrid)

**What:** Use markdown comments to mark platform-specific sections. Parser extracts sections based on platform.

**When to use:** When most content is shared, small platform-specific variations

**Trade-offs:**
- ✅ All content in one file
- ✅ No template engine needed
- ✅ Easy to diff shared vs platform-specific
- ❌ Custom parser logic required
- ❌ Less flexible than template engine

**Example:**
```markdown
---
name: gsd-planner
<!-- BEGIN COMMON -->
description: Creates executable phase plans...
<!-- END COMMON -->
<!-- BEGIN COPILOT -->
tools: Read, Write, Bash, Glob, Grep
<!-- END COPILOT -->
<!-- BEGIN CLAUDE -->
tools: Read, Write, Bash, WebFetch, mcp__context7__*
<!-- END CLAUDE -->
---

<role>
You are a GSD planner...
</role>
```

## Data Flow

### Template Generation Flow (Install-Time)

```
User runs: npx get-shit-done-multi --copilot
    ↓
install.js: Parse CLI args (--copilot flag detected)
    ↓
CLI Detection: Detect installed CLIs
    ↓
Context Builder: Build platform context
    {
      isCopilot: true,
      isClaude: false,
      paths: { agents: '.github/agents/', ... },
      workDir: '.github/skills/get-shit-done/'
    }
    ↓
For each spec file in specs/agents/:
    ↓
    Spec Parser: Read spec file → Parse YAML frontmatter + markdown body
        ↓
    Template Engine: Render spec with context
        ↓
    Adapter: Transform paths/content for Copilot
        ↓
    Output: Write to .github/agents/[name].md
```

### Key Processing Steps

1. **Parse Phase:**
   - Read spec file from specs/agents/
   - Parse YAML frontmatter
   - Extract markdown body
   - Identify template variables

2. **Context Phase:**
   - Build platform context (isCopilot, isClaude, etc.)
   - Merge with spec metadata
   - Add path variables (agentsPath, skillsPath, etc.)

3. **Render Phase:**
   - Template engine processes {{variables}}
   - Conditionals {{#isCopilot}}...{{/isCopilot}}
   - Partials {{> shared/protocols}}

4. **Transform Phase:**
   - Adapter rewrites paths (convertContent in existing adapter)
   - Format adjustments (if needed)

5. **Write Phase:**
   - Write to platform-specific output directory
   - Preserve file permissions
   - Log success

## Integration Points

### Extending Existing install.js

**Integration Strategy: Module Import + Pipeline Injection**

The existing `install.js` already has an adapter pattern. Template system integrates cleanly:

```javascript
// bin/install.js (existing structure)
const claudeAdapter = require('./lib/adapters/claude');
const copilotAdapter = require('./lib/adapters/copilot');
const { copyWithPathReplacement } = ... // existing

// NEW: Import template system
const templateSystem = require('./lib/template-system/generator');

// Modify existing copyWithPathReplacement or add new generateAgents function
function generateAgents(adapter, platform) {
  const context = buildContext(platform);
  templateSystem.generateAll('specs/agents/', dirs.agents, adapter, context);
}

// In main installation flow:
if (hasCopilot) {
  const dirs = copilotAdapter.getTargetDirs(false);
  // OLD: copyWithPathReplacement(agentsDir, dirs.agents, copilotAdapter, 'agent');
  // NEW: generateAgents(copilotAdapter, 'copilot');
  generateAgents(copilotAdapter, 'copilot');
}
```

**Minimal Changes Required:**
1. Add `lib/template-system/` directory with new modules
2. Import generator module in install.js
3. Replace `copyWithPathReplacement` with `generateAgents` for agent files
4. Keep existing adapter interface (convertContent, getTargetDirs)

**Backward Compatibility:**
- Keep existing adapters as-is (they provide convertContent)
- Template system uses adapter.convertContent for path rewriting
- Non-template files (like hooks/) still use copyWithPathReplacement

### External Integration Points

| Integration | Pattern | Notes |
|-------------|---------|-------|
| **Template Engine (Mustache)** | npm package import | Logic-less, widely supported, fast |
| **YAML Parser** | npm package (js-yaml) | Parse frontmatter in spec files |
| **Existing Adapters** | Use convertContent method | Reuse existing path rewriting |
| **File System** | Node.js fs module | Read specs, write output |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| **install.js ↔ generator** | Function call (generateAll) | Pass adapter, context, paths |
| **generator ↔ spec-parser** | Function call (parseSpec) | Return { frontmatter, body } |
| **generator ↔ engine** | Function call (render) | Pass template, context → string |
| **generator ↔ adapter** | Interface (convertContent) | Existing adapter method |

## Build-Time vs Install-Time Generation

### Install-Time Generation (Recommended)

**What:** Generate platform-specific agents when user runs `npx get-shit-done-multi --copilot`

**Pros:**
- ✅ Specs remain single source of truth
- ✅ No build artifacts in git
- ✅ Users get correct platform output automatically
- ✅ Can adapt to detected CLI environment

**Cons:**
- ❌ Slower install (but negligible - <100ms for 10 agents)
- ❌ Requires template engine in dependencies

**Best for:** Multi-platform tools where users install for specific CLI

### Build-Time Generation

**What:** Generate all platform variants during development/CI, commit to git

**Pros:**
- ✅ Faster install (no generation needed)
- ✅ Users see exact output in git
- ✅ No runtime dependencies

**Cons:**
- ❌ Git bloat (3x files: spec + copilot + claude variants)
- ❌ Harder to maintain (must regenerate on spec changes)
- ❌ Risk of stale generated files

**Best for:** Single-platform tools, or when install speed is critical

### Hybrid Approach

Generate at install-time, but include pre-generated fallbacks in git for offline/airgapped installs.

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| **1-20 agents** | Simple spec-as-template, Mustache engine, install-time generation |
| **20-100 agents** | Consider template caching, parallel generation, shared partials |
| **100+ agents** | Build-time generation with watch mode, advanced template inheritance |

### Scaling Priorities

1. **First bottleneck:** Template rendering (20+ agents)
   - **Solution:** Cache compiled templates (Handlebars precompiles), parallelize generation
   
2. **Second bottleneck:** Spec parsing (50+ agents)
   - **Solution:** Lazy load specs, parse only requested platform variants

For this project (10-15 agents), simple install-time generation with Mustache is optimal.

## Anti-Patterns

### Anti-Pattern 1: Template Sprawl

**What people do:** Create separate template files for every agent, even when 95% identical
**Why it's wrong:** Maintenance nightmare - change shared logic in 10 places
**Do this instead:** Use template partials/inheritance for shared sections:

```markdown
<!-- specs/agents/gsd-planner.spec.md -->
---
name: gsd-planner
---

{{> shared/meta-prompting}}

<role>
Planner-specific role...
</role>
```

### Anti-Pattern 2: Over-Abstracting Templates

**What people do:** Create complex template hierarchies with 5 levels of inheritance
**Why it's wrong:** Impossible to trace what generates final output
**Do this instead:** Keep it flat - 1-2 levels max. Prefer explicit over DRY when clarity matters.

### Anti-Pattern 3: Logic in Templates

**What people do:** Put complex conditionals in templates (Handlebars helpers with business logic)
**Why it's wrong:** Templates become untestable, hard to reason about
**Do this instead:** Move logic to context builder. Templates should only have simple conditionals:

```javascript
// GOOD: Logic in context builder
const context = {
  isCopilot: platform === 'copilot',
  tools: platform === 'copilot' 
    ? ['Read', 'Write', 'Bash'] 
    : ['Read', 'Write', 'Bash', 'WebFetch']
};

// Template stays simple
{{#isCopilot}}
tools: {{tools}}
{{/isCopilot}}
```

### Anti-Pattern 4: String Manipulation in Adapters

**What people do:** Rewrite adapters to handle template syntax, duplicate path logic
**Why it's wrong:** Breaks existing adapter interface, duplicates code
**Do this instead:** Template engine generates content first, THEN adapter transforms paths (existing pattern):

```javascript
// GOOD: Template → Adapter pipeline
const rendered = templateEngine.render(spec, context);
const transformed = adapter.convertContent(rendered, 'agent'); // Existing method
fs.writeFileSync(outputPath, transformed);
```

### Anti-Pattern 5: Committing Generated Files as Source

**What people do:** Edit generated agent files directly instead of specs
**Why it's wrong:** Next install overwrites manual changes, specs become stale
**Do this instead:** 
- **Option A:** Add `.gitignore` for agents/ (generated), commit specs/ only
- **Option B:** Commit generated as build artifacts, mark clearly in README, enforce via CI check

## Template Engine Comparison

| Engine | Complexity | Features | Best For |
|--------|-----------|----------|----------|
| **Mustache** | Simple | Variables, sections, partials | Logic-less templates, fast rendering |
| **Handlebars** | Medium | Mustache + helpers, block helpers | Complex conditionals, custom formatting |
| **EJS** | High | Embedded JavaScript, full JS logic | Maximum flexibility, but risky |
| **Custom Parser** | Medium | Exactly what you need | Unique requirements, avoid dependencies |

**Recommendation for this project:** **Mustache**
- Logic-less = specs stay declarative
- Fast (<1ms per template)
- Widely supported (40+ languages)
- Minimal dependency (npm: mustache, 4.2.0)

## Implementation Phases

### Phase 1: Template Engine Integration (Foundation)

**Build order:**
1. Install Mustache: `npm install mustache`
2. Create `lib/template-system/engine.js` - wrapper around Mustache
3. Create `lib/template-system/spec-parser.js` - parse YAML + markdown
4. Create `lib/template-system/context-builder.js` - build platform context
5. Create `lib/template-system/generator.js` - orchestrate pipeline
6. Unit tests for each module

**Dependencies:** None (self-contained)

### Phase 2: Spec Migration (Content)

**Build order:**
1. Create `specs/agents/` directory
2. Convert first agent (gsd-planner.md) to spec format with template variables
3. Test generation for both platforms
4. Migrate remaining agents one-by-one
5. Extract shared sections to partials (optional)

**Dependencies:** Phase 1 complete

### Phase 3: Install Integration (Workflow)

**Build order:**
1. Modify `install.js` to import generator
2. Add `generateAgents()` function
3. Replace `copyWithPathReplacement` call for agents
4. Add CLI flag `--generate-only` for testing
5. Update README with new workflow

**Dependencies:** Phase 2 complete (at least one spec exists)

### Phase 4: Polish & Optimization (Optional)

**Build order:**
1. Add template caching (Handlebars precompile)
2. Parallel generation (Promise.all for agents)
3. Watch mode for development (`npm run dev:watch`)
4. CI check: verify generated files match specs

**Dependencies:** Phase 3 complete

## Recommended Approach for This Project

**Pattern:** Spec-as-Template (Pattern 1)
**Engine:** Mustache
**Generation:** Install-time
**Integration:** Extend install.js, keep existing adapters

**Rationale:**
- 10 agents = simple spec-as-template sufficient
- Logic-less templates keep specs clean
- Install-time generation adapts to detected CLI
- Minimal changes to existing install.js
- Existing adapters already handle path transformation

## Sources

**Template Engines:**
- Mustache specification: https://mustache.github.io/mustache.5.html (HIGH confidence)
- Handlebars documentation: https://handlebarsjs.com/guide/ (HIGH confidence)
- Mustache.js npm: v4.2.0 (HIGH confidence)
- Handlebars npm: v4.7.8 (HIGH confidence)
- EJS npm: v4.0.1 (HIGH confidence)

**Code Generation Systems:**
- Yeoman architecture: https://yeoman.io/authoring/ (HIGH confidence)
- Plop.js structure: https://github.com/plopjs/plop (HIGH confidence)
- Hygen architecture: https://github.com/jondot/hygen (HIGH confidence)
- Enquirer prompts: https://github.com/enquirer/enquirer (MEDIUM confidence - for context builder)

**Current System:**
- Analyzed bin/install.js (existing adapter pattern) (HIGH confidence)
- Analyzed bin/lib/adapters/copilot.js (convertContent interface) (HIGH confidence)
- Analyzed agents/gsd-planner.md (agent format) (HIGH confidence)

---
*Architecture research for: Template-based multi-platform agent generation system*
*Researched: 2025-01-21*
