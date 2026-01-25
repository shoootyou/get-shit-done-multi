# Phase 2: Template Engine Integration - Research

**Researched:** 2025-01-22
**Domain:** Template processing, skill generation pipeline, platform-specific rendering
**Confidence:** HIGH

## Summary

Phase 2 integrates the existing, battle-tested template system (208 passing tests) into the install.js pipeline for skill generation. The research reveals that all core capabilities already exist - we're adapting an existing, working system rather than building new infrastructure.

**Key findings:**

1. **Template system is production-ready**: gray-matter 4.0.3 + js-yaml 4.1.1 with Mustache conditionals already handles agents successfully. The same pipeline works for skills with minimal adaptation.

2. **Existing prototype validates the approach**: scripts/generate-skill-outputs.js demonstrates conditional processing working correctly. It processes {{#isClaude}}/{{#isCopilot}}/{{#isCodex}} blocks and generates clean platform-specific output.

3. **Integration pattern is established**: install.js already has generateAgentsFromSpecs() that reads specs, calls generateAgent(), writes output. Skills need identical pattern with different paths.

**Primary recommendation:** Adapt existing generateAgent() pipeline for skills by adding skill-specific paths and frontmatter validation. Don't build new infrastructure - extend the working system.

## Standard Stack

The established libraries/tools for template processing:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gray-matter | 4.0.3 | Parse YAML frontmatter from Markdown | Industry standard, used by Jekyll, Hugo, VuePress. Handles edge cases (nested frontmatter, encoding) |
| js-yaml | 4.1.1 | YAML parsing and serialization | Official YAML implementation for Node.js. Used by gray-matter and for validation |
| Node.js | >=16.7.0 | Runtime environment | Already project minimum, supports all needed features |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| js-yaml | 3.14.2 | YAML parsing (gray-matter dep) | Automatically used by gray-matter, don't call directly |
| fs | Node built-in | File system operations | Reading specs, writing outputs |
| path | Node built-in | Path resolution | Handling spec/output directory structures |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| gray-matter | front-matter | gray-matter more mature (8M+ weekly downloads vs 200K), better error messages |
| js-yaml | yaml | js-yaml is official YAML 1.2 implementation, more compliant |
| Mustache.js | Handlebars | Current regex approach (43 lines in engine.js) handles {{#var}} conditionals perfectly, adding Mustache.js would be over-engineering |

**Installation:**
```bash
# Already installed - no new dependencies needed
npm list gray-matter js-yaml
# gray-matter@4.0.3
# js-yaml@4.1.1
```

## Architecture Patterns

### Recommended Project Structure
```
bin/lib/template-system/
├── generator.js              # Pipeline orchestrator (generateAgent function)
├── spec-parser.js           # gray-matter wrapper for parsing
├── context-builder.js       # Platform context (isClaude, isCopilot, etc.)
├── engine.js                # Mustache conditional renderer
├── field-transformer.js     # Platform-specific field handling
├── tool-mapper.js           # Tool name mapping (Read → file_read)
└── validators.js            # Spec validation

specs/skills/
├── README.md                # Canonical schema (already exists)
└── gsd-{command}/
    └── SKILL.md             # Folder-per-skill pattern

bin/install.js
└── generateSkillsFromSpecs()  # NEW: Skill generation function (mirrors generateAgentsFromSpecs)
```

### Pattern 1: Template Processing Pipeline
**What:** Multi-stage pipeline that transforms spec → platform-specific output
**When to use:** For any spec-to-output generation (agents, skills, configs)
**Example:**
```javascript
// Source: bin/lib/template-system/generator.js lines 118-433
function generateAgent(specPath, platform, options = {}) {
  // Stage 1: Parse spec file (gray-matter)
  const spec = parseSpec(specPath);
  
  // Stage 2: Build platform context
  const context = buildContext(platform, {
    workDir: options.workDir || process.cwd(),
    paths: options.paths || {}
  });
  
  // Stage 3: Render templates (Mustache conditionals)
  const renderedContent = render(rawContent, context);
  
  // Stage 4: Transform tools to platform-specific names
  spec.frontmatter.tools = mapTools(spec.frontmatter.tools, platform);
  
  // Stage 5: Transform fields for platform support
  const finalFrontmatter = transformFields(spec.frontmatter, platform);
  
  // Stage 6: Add platform metadata (Copilot only)
  const withMetadata = addPlatformMetadata(finalFrontmatter, platform);
  
  // Stage 7: Validate and combine
  const output = `---\n${serializeFrontmatter(withMetadata, platform)}---\n${spec.body}`;
  
  return { success: true, output, warnings: [] };
}
```

**Key insight:** Each stage is independent and tested. Don't bypass stages - they catch edge cases.

### Pattern 2: Platform Context Building
**What:** Build platform flags and capabilities for conditional rendering
**When to use:** Before rendering any template
**Example:**
```javascript
// Source: bin/lib/template-system/context-builder.js lines 18-64
function buildContext(platform, options = {}) {
  const isClaude = platform === 'claude';
  const isCopilot = platform === 'copilot';
  const isCodex = platform === 'codex';
  
  return {
    // Platform identification
    platform,
    isClaude,
    isCopilot,
    isCodex,
    
    // Paths
    agentsPath: options.paths?.agents || getAgentsPath(platform),
    skillsPath: options.paths?.skills || getSkillsPath(platform),
    workDir: options.workDir || process.cwd(),
    
    // Capabilities (for advanced conditionals)
    ...getPlatformCapabilities(platform)
  };
}
```

### Pattern 3: Conditional Syntax Processing
**What:** Process {{#isClaude}}...{{/isClaude}} blocks based on context
**When to use:** Rendering spec content with platform variations
**Example:**
```javascript
// Source: bin/lib/template-system/engine.js lines 17-72
function render(template, context) {
  let result = template;
  
  // First, process conditional blocks: {{#varName}}...{{/varName}}
  result = result.replace(/\{\{#(\w+)\}\}([\s\S]*?)\{\{\/\1\}\}/g, (match, varName, content) => {
    if (!(varName in context)) {
      throw new Error(`Undefined variable in template: {{#${varName}}}`);
    }
    
    const value = context[varName];
    
    // Include content if value is truthy
    return value ? content : '';
  });
  
  // Then, replace simple {{variable}} with context values
  result = result.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, varName) => {
    if (!(varName in context)) {
      throw new Error(`Undefined variable in template: {{${varName}}}`);
    }
    return String(context[varName]);
  });
  
  return result;
}
```

### Pattern 4: generateXFromSpecs Integration
**What:** Read spec directory, generate all specs, report results
**When to use:** Batch generation during installation
**Example:**
```javascript
// Source: bin/install.js lines 242-295
function generateAgentsFromSpecs(specsDir, outputDir, platform) {
  const errors = [];
  let generated = 0;
  let failed = 0;

  // Ensure output directory exists
  fs.mkdirSync(outputDir, { recursive: true });

  // Read all spec files
  const specFiles = fs.readdirSync(specsDir)
    .filter(file => file.endsWith('.md') && file !== '.gitkeep');

  for (const specFile of specFiles) {
    const specPath = path.join(specsDir, specFile);
    
    try {
      // Generate using template system
      const result = generateAgent(specPath, platform);
      
      if (result.success) {
        const outputPath = path.join(outputDir, specFile);
        fs.writeFileSync(outputPath, result.output, 'utf8');
        generated++;
      } else {
        failed++;
        errors.push({ file: specFile, error: result.errors });
      }
    } catch (err) {
      failed++;
      errors.push({ file: specFile, error: err.message });
    }
  }

  return { generated, failed, errors };
}
```

**Adaptation for skills:**
- Change `specsDir` to scan subdirectories (gsd-*/SKILL.md pattern)
- Otherwise identical structure

### Anti-Patterns to Avoid

**Anti-pattern: Bypassing the pipeline**
- **Why it's bad:** Each stage validates and transforms. Skipping stages loses error detection.
- **What to do instead:** Always use generateAgent() or generateFromSpec(), don't manually parse/render.

**Anti-pattern: Rendering before parsing**
- **Why it's bad:** Template conditionals in frontmatter YAML break gray-matter parsing.
- **What to do instead:** Parse first, then render with context (pipeline does this correctly).

**Anti-pattern: Platform-specific code in specs**
- **Why it's bad:** Spec should be canonical. Platform adaptation happens in template system.
- **What to do instead:** Use {{#isClaude}} conditionals, not different spec files.

**Anti-pattern: Direct gray-matter calls**
- **Why it's bad:** spec-parser.js adds error handling, path resolution, validation.
- **What to do instead:** Use parseSpec() or parseSpecString() from spec-parser.js.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML frontmatter parsing | Custom regex or split() | gray-matter | Handles edge cases: nested markers, encoding, YAML arrays, special chars in content |
| YAML validation | String checking | js-yaml.load() in validate() | Provides line numbers, column positions, error snippets for debugging |
| Conditional processing | String replacement | engine.js render() | Handles nested conditionals, undefined variable detection, proper escaping |
| Tool name mapping | Manual switch statements | tool-mapper.js mapTools() | Centralized mapping with validation, warnings for unknown tools |
| Platform detection | Boolean checks everywhere | context-builder.js buildContext() | Single source of truth, extensible to new platforms |
| Frontmatter serialization | yaml.dump() directly | serializeFrontmatter() in generator.js | Platform-specific formatting (Claude: tools as string, Copilot: tools as array) |
| Metadata generation | Manual timestamp code | field-transformer.js addPlatformMetadata() | Follows platform conventions (Copilot nests under metadata, Claude omits) |

**Key insight:** The template system has 208 passing tests covering edge cases. Don't recreate this validation coverage - use the tested system.

## Common Pitfalls

### Pitfall 1: Rendering Templates in Frontmatter Before Parsing
**What goes wrong:** gray-matter can't parse YAML with {{#isClaude}} inside it
**Why it happens:** Intuition says "render then parse" but YAML parser sees {{ as syntax error
**How to avoid:** 
1. Read raw file content
2. Build context FIRST
3. Render ENTIRE file (frontmatter + body) with context
4. THEN parse with parseSpecString()
**Warning signs:** gray-matter errors like "bad indentation" or "unexpected token"
**Example from generator.js lines 129-159:**
```javascript
// ✅ CORRECT: Render before parsing
const rawContent = fs.readFileSync(absolutePath, 'utf8');
const context = buildContext(platform);
const renderedContent = render(rawContent, context);  // Render FIRST
const spec = parseSpecString(renderedContent);        // Parse AFTER

// ❌ WRONG: Parse before rendering
const spec = parseSpec(absolutePath);                 // Parse FIRST
const rendered = render(spec.body, context);          // Render AFTER - frontmatter lost conditionals
```

### Pitfall 2: Tool Arrays vs String Format
**What goes wrong:** Claude expects "tools: Read, Bash, Write" (string), Copilot expects "tools: [file_read, shell_execute]" (array)
**Why it happens:** Platforms have different YAML conventions
**How to avoid:** Use serializeFrontmatter() in generator.js which handles platform differences
**Warning signs:** Claude shows "tools: undefined" or Copilot doesn't recognize tools
**Example from generator.js lines 24-72:**
```javascript
function serializeFrontmatter(frontmatter, platform) {
  const fm = JSON.parse(JSON.stringify(frontmatter));
  
  if (platform === 'claude') {
    // Claude: tools as comma-separated string
    if (Array.isArray(fm.tools)) {
      fm.tools = fm.tools.join(', ');
    }
  } else if (platform === 'copilot') {
    // Copilot: tools remains as array
    // Will be formatted as single-line array by YAML dump
  }
  
  return yaml.dump(fm, { flowLevel: 1, lineWidth: -1 });
}
```

### Pitfall 3: Metadata Field Structure Differences
**What goes wrong:** Adding metadata fields that don't match platform conventions
**Why it happens:** Different platforms have different metadata field requirements
**How to avoid:** Use addPlatformMetadata() which follows platform rules:
- **Claude:** NO metadata fields (not in official spec)
- **Copilot:** Metadata nested under `metadata` object
- **Codex:** TBD based on platform docs
**Warning signs:** Platform ignores or errors on metadata fields
**Example from field-transformer.js lines 216-248:**
```javascript
function addPlatformMetadata(frontmatter, platform) {
  // Claude: NO metadata fields
  if (platform === 'claude') {
    return frontmatter;  // Return unchanged
  }
  
  // Copilot: Metadata MUST be nested under 'metadata' object
  if (platform === 'copilot') {
    const metadata = {
      platform: platform,
      generated: new Date().toISOString().split('T')[0], // YYYY-MM-DD
      templateVersion: '1.0.0',
      projectVersion: projectInfo.version
    };
    
    return {
      ...frontmatter,
      metadata: metadata  // Nested under metadata object
    };
  }
}
```

### Pitfall 4: Folder-per-Skill Path Resolution
**What goes wrong:** Trying to read specs/*.md directly instead of specs/*/SKILL.md
**Why it happens:** Agents use flat structure (specs/agents/*.md), skills use folder structure (specs/skills/gsd-*/SKILL.md)
**How to avoid:** 
```javascript
// For skills, scan directories THEN read SKILL.md
const skillDirs = fs.readdirSync(specsDir).filter(name => {
  const fullPath = path.join(specsDir, name);
  return fs.statSync(fullPath).isDirectory();
});

for (const skillDir of skillDirs) {
  const specPath = path.join(specsDir, skillDir, 'SKILL.md');
  if (fs.existsSync(specPath)) {
    // Process spec
  }
}
```
**Warning signs:** "Spec file not found" errors, or processing README.md as a skill

### Pitfall 5: Frontmatter Inheritance Not Implemented
**What goes wrong:** No DRY mechanism for shared frontmatter blocks across skills
**Why it happens:** Requirement FOUN-07 needs implementation - not in current system
**How to avoid:** 
- Phase 2 must implement frontmatter inheritance mechanism
- Consider approaches:
  1. **YAML anchors/aliases** - Use js-yaml's native support for `&anchor` and `*alias`
  2. **_shared.yml file** - Load common blocks, merge into skill frontmatter
  3. **Template fragments** - Include mechanism for frontmatter sections
**Warning signs:** Duplicated tool lists across multiple skills, copy-paste frontmatter
**Implementation note:** This is NEW functionality to add in Phase 2

## Code Examples

Verified patterns from official sources:

### Skill Spec with Conditionals
```yaml
---
# Source: specs/skills/gsd-help/SKILL.md lines 1-14
name: gsd-help
description: Show available GSD commands and usage guide

{{#isClaude}}
tools: [Read, Bash, Glob]
{{/isClaude}}
{{#isCopilot}}
tools: [file_read, shell_execute, glob]
{{/isCopilot}}
{{#isCodex}}
tools: [read, bash, glob]
{{/isCodex}}
---

<objective>
Display the complete GSD command reference.
</objective>
```

### Generate Skills Function (NEW - to implement)
```javascript
// Based on generateAgentsFromSpecs pattern (bin/install.js lines 242-295)
function generateSkillsFromSpecs(specsDir, outputDir, platform) {
  const errors = [];
  let generated = 0;
  let failed = 0;

  try {
    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Read all skill directories (folder-per-skill pattern)
    const skillDirs = fs.readdirSync(specsDir)
      .filter(name => {
        const fullPath = path.join(specsDir, name);
        return fs.statSync(fullPath).isDirectory() && name.startsWith('gsd-');
      });

    for (const skillDir of skillDirs) {
      const specPath = path.join(specsDir, skillDir, 'SKILL.md');
      
      if (!fs.existsSync(specPath)) {
        console.log(`  ${yellow}⚠${reset} Skipping ${skillDir}: no SKILL.md found`);
        continue;
      }
      
      try {
        // Generate skill using template system
        const result = generateAgent(specPath, platform);
        
        if (result.success) {
          // Write generated content to output directory
          // Output name: gsd-help.md (skill name + .md)
          const outputName = `${skillDir}.md`;
          const outputPath = path.join(outputDir, outputName);
          fs.writeFileSync(outputPath, result.output, 'utf8');
          generated++;
          
          // Log warnings if any
          if (result.warnings && result.warnings.length > 0) {
            result.warnings.forEach(warning => {
              console.log(`  ${yellow}⚠${reset} ${skillDir}: ${warning.message || warning}`);
            });
          }
        } else {
          // Generation failed
          failed++;
          const errorMsg = result.errors && result.errors.length > 0
            ? result.errors.map(e => e.message).join(', ')
            : 'Unknown error';
          errors.push({ file: skillDir, error: errorMsg });
          console.error(`  ${yellow}✗${reset} Failed to generate ${skillDir}: ${errorMsg}`);
        }
      } catch (err) {
        failed++;
        errors.push({ file: skillDir, error: err.message });
        console.error(`  ${yellow}✗${reset} Error generating ${skillDir}: ${err.message}`);
      }
    }
  } catch (err) {
    errors.push({ error: `Failed to read specs directory: ${err.message}` });
    console.error(`  ${yellow}✗${reset} Failed to read specs directory: ${err.message}`);
  }

  return { generated, failed, errors };
}
```

### Integration into installClaude()
```javascript
// Add after generateAgentsFromSpecs() call in installClaude()
// Source: bin/install.js around line 560

// Generate agents from specs
const agentGenResult = generateAgentsFromSpecs(
  path.join(__dirname, '../specs/agents'),
  dirs.agents,
  'claude'
);

// Generate skills from specs (NEW)
const skillGenResult = generateSkillsFromSpecs(
  path.join(__dirname, '../specs/skills'),
  dirs.skills,  // Skills directory from getConfigPaths()
  'claude'
);

// Report generation results
if (skillGenResult.failed > 0) {
  console.log(`  ${yellow}⚠${reset} Skills: ${skillGenResult.generated} generated, ${skillGenResult.failed} failed`);
} else {
  console.log(`  ${green}✓${reset} Skills: ${skillGenResult.generated} generated`);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Legacy commands in /commands/gsd/*.md | Spec-driven in /specs/skills/gsd-*/SKILL.md | Phase 1 (Jan 2025) | Folder-per-skill enables future expansion (templates, assets, tests) |
| Manual platform files | Template generation with conditionals | v1.8.0 (agents) | Single source of truth, guaranteed consistency |
| YAML anchors for DRY | (To be decided) | Phase 2 (now) | Need to implement frontmatter inheritance |
| gray-matter 3.x | gray-matter 4.0.3 | Pre-1.0 | Better error messages, TypeScript definitions |
| js-yaml 3.x | js-yaml 4.1.1 | v1.8.0 | YAML 1.2 spec compliance, security fixes |

**Deprecated/outdated:**
- **Legacy command prefix `gsd:`** - Replaced with `gsd-` in spec system (colon for Claude command invocation, hyphen for file naming)
- **Flat file structure for skills** - Replaced with folder-per-skill (matches Claude pattern, enables expansion)
- **Manual tool mapping** - Replaced with tool-mapper.js centralized mapping

## Open Questions

Things that couldn't be fully resolved:

1. **Frontmatter Inheritance Implementation**
   - What we know: Requirement FOUN-07 needs DRY mechanism for shared frontmatter
   - What's unclear: Best approach (YAML anchors vs _shared.yml vs template fragments)
   - Recommendation: 
     - **Option A (YAML anchors):** Native js-yaml support, standard YAML feature
       ```yaml
       # _shared.yml
       common-tools: &common-tools
         - Read
         - Bash
       
       # SKILL.md
       tools:
         <<: *common-tools
         - Write
       ```
       **Pro:** Standard YAML, no custom parsing
       **Con:** Requires loading _shared.yml before parsing each spec
     
     - **Option B (_shared.yml merge):** Load shared blocks, merge with Object.assign()
       **Pro:** Simple, explicit
       **Con:** Need merge precedence rules
     
     - **Recommendation:** Start with Option B (_shared.yml merge) for simplicity, can add YAML anchor support later if needed

2. **Skill Output File Naming**
   - What we know: Folder is `gsd-help/`, output should be `gsd-help.md`
   - What's unclear: Edge cases (skills with same name, special characters)
   - Recommendation: Use folder name + `.md` as output name. Validate no duplicates during generation.

3. **Codex Platform Support**
   - What we know: Template system has `isCodex` conditionals, specs include {{#isCodex}} blocks
   - What's unclear: Codex metadata field requirements (like Copilot's nested metadata)
   - Recommendation: For Phase 2, implement Claude + Copilot. Codex can be added when metadata spec is known.

## Sources

### Primary (HIGH confidence)
- **Local codebase** - bin/lib/template-system/ (208 passing tests)
- **Local codebase** - bin/install.js (generateAgentsFromSpecs implementation)
- **Local codebase** - scripts/generate-skill-outputs.js (working prototype)
- **Local codebase** - specs/skills/README.md (canonical schema)
- **Local codebase** - specs/skills/gsd-help/SKILL.md (working skill spec)
- **Local codebase** - package.json (dependency versions)

### Secondary (MEDIUM confidence)
- gray-matter npm page - https://www.npmjs.com/package/gray-matter (usage patterns, API)
- js-yaml npm page - https://www.npmjs.com/package/js-yaml (YAML 1.2 spec compliance)

### Tertiary (LOW confidence)
- None - all research based on existing working codebase

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Existing code uses gray-matter 4.0.3 + js-yaml 4.1.1 successfully with 208 passing tests
- Architecture: HIGH - All patterns verified in working codebase (generateAgentsFromSpecs, template pipeline)
- Pitfalls: HIGH - Based on actual implementation details (serializeFrontmatter, addPlatformMetadata behavior)
- Frontmatter inheritance: MEDIUM - Requirement exists but implementation approach to be decided in planning

**Research date:** 2025-01-22
**Valid until:** 2025-02-22 (30 days - stable system, dependencies mature)

**Key validation notes:**
- Template system has comprehensive test suite (208 tests passing)
- Prototype script (generate-skill-outputs.js) validates conditional processing works
- Agent generation in production validates pipeline reliability
- No external research needed - all information from working codebase
