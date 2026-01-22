# Stack Research

**Domain:** Template-based multi-platform agent generation
**Researched:** 2025-01-21
**Confidence:** HIGH

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **gray-matter** | ^4.0.3 | Frontmatter parsing | Battle-tested (used by metalsmith, assemble, phenomic), parses YAML/JSON/TOML frontmatter reliably, supports stringification back to frontmatter (for round-trip editing), handles edge cases regex parsers miss |
| **Template Literals** | Native ES6+ | Template generation | No dependencies, already in Node.js, sufficient for platform-specific field mapping, easier debugging (templates are just JavaScript), no build step required |
| **js-yaml** | ^4.1.1 | YAML serialization | Industry standard for YAML in Node.js, needed for writing platform-specific YAML frontmatter, actively maintained (last updated Nov 2025), gray-matter uses it internally |

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| **mustache** | ^4.2.0 | Logic-less templates | If templates become complex enough to need conditionals/loops, zero dependencies, works in browser+Node, supports CommonJS/ESM/AMD |
| **yaml** | ^2.8.2 | Modern YAML parser | Alternative to js-yaml if you need streaming or newer YAML 1.2 features (updated Nov 2025), but js-yaml is more established |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Node.js built-in fs/path** | File operations | Already available, no extra dependencies |
| **JSON Schema** | Validate platform specs | Optional: validate parsed frontmatter matches platform requirements |

## Installation

```bash
# Core (required)
npm install gray-matter js-yaml

# Optional: if template complexity grows beyond template literals
npm install mustache
```

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| **Template Literals** | EJS (^4.0.1) | If you need partial includes, custom delimiters, or async rendering. Updated Jan 2026, supports CommonJS/ESM, but adds 350KB dependency |
| **Template Literals** | Handlebars (^4.7.8) | If you need precompilation or complex helpers. Last updated Sept 2023 (less active), heavier than needed for simple field mapping |
| **gray-matter** | Custom regex parsing | Never. Regex-based frontmatter parsing fails on edge cases (YAML in code blocks, multi-doc sources, complex strings) |
| **js-yaml** | yaml package | If you need streaming, modern YAML 1.2 strict compliance, or better error messages. js-yaml is more widely adopted but yaml is more modern |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **Regex for frontmatter** | Fails on edge cases (nested YAML, code blocks with YAML examples, complex strings), error-prone, slower than proper parsers | gray-matter |
| **String concatenation** | Brittle, no escaping, hard to maintain, introduces YAML syntax errors | Template literals with proper YAML escaping via js-yaml.dump() |
| **Build-step templates (Nunjucks, Pug)** | Project constraint: "no build step". TypeScript compilation or template precompilation adds complexity | Template literals or runtime-compiled templates (mustache, EJS) |
| **Front-matter** (npm package) | Last updated 2019, uses regex for parsing (unreliable), gray-matter is the successor and fixes all issues | gray-matter |

## Stack Patterns by Variant

**For Simple Field Mapping (Recommended for MVP):**
- Use: Template literals + gray-matter + js-yaml
- Because: Agent definitions have ~10-15 fields, mostly direct mappings. Template literals are clearest for this. Example:
  ```javascript
  const claudeFrontmatter = yaml.dump({
    name: agent.name,
    description: agent.description,
    tools: mapToolsToClaude(agent.tools),
    model: agent.model || 'inherit'
  });
  const claudeAgent = `---\n${claudeFrontmatter}---\n\n${agent.prompt}`;
  ```

**If Conditional Logic Becomes Complex:**
- Use: Mustache + gray-matter + js-yaml
- Because: Mustache is logic-less but supports conditionals/sections. Zero dependencies. Example:
  ```javascript
  const template = `---
name: {{name}}
description: {{description}}
{{#tools}}
tools: {{.}}
{{/tools}}
---

{{prompt}}`;
  const output = Mustache.render(template, data);
  ```

**If You Need Async Operations or Partials:**
- Use: EJS + gray-matter + js-yaml
- Because: EJS supports async/await, includes, and custom delimiters. But only if template literals become unmanageable.

## Architecture Pattern

```
Source Agent Definition (Unified Format)
         ↓
   [gray-matter.read()]
         ↓
   { data: {...}, content: "..." }
         ↓
   [Platform Adapter] ← Transform fields for target platform
         ↓
   { data: {platform-specific}, content: "..." }
         ↓
   [Template Literal / Mustache]
         ↓
   Platform-Optimized Agent File
         ↓
   [Write to ~/.claude/agents/ or .github/copilot-agents/]
```

**Key Design Decisions:**

1. **Parsing Strategy:** Use gray-matter for input (handles YAML/JSON/TOML), js-yaml for output (control serialization)
2. **Template Strategy:** Start with template literals. Escape to Mustache only if conditionals proliferate.
3. **Platform Adapter Layer:** Pure JavaScript functions that map unified schema to platform-specific schema
4. **No Runtime Schema Validation:** Rely on platform CLIs to validate generated configs (fail fast at install time, not generation time)

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| gray-matter@^4.0.3 | js-yaml@^3.0.0 or ^4.0.0 | gray-matter uses js-yaml internally; version 4.x is compatible with both |
| Node.js >= 16.7.0 | All recommended packages | Project already requires Node 16.7.0+ (from package.json) |
| mustache@^4.2.0 | Works with gray-matter output | Mustache expects plain objects; gray-matter.data is compatible |

## CommonJS Compatibility

**Critical:** Project is CommonJS (`"type": "commonjs"` in package.json), NOT ES Modules.

All recommended packages support CommonJS via `require()`:
- ✅ gray-matter: `const matter = require('gray-matter');`
- ✅ js-yaml: `const yaml = require('js-yaml');`
- ✅ mustache: `const Mustache = require('mustache');`
- ✅ ejs: `const ejs = require('ejs');` (if needed)

**Do NOT use:** ES Module syntax (`import`) unless project migrates to ESM.

## Platform Specification Mapping

Based on official documentation (fetched 2025-01-21):

### Claude Code Fields
Source: https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields

**Required:**
- `name` (string): Unique identifier, lowercase + hyphens
- `description` (string): When to delegate to this agent

**Optional:**
- `tools` (array): Tool names or deny with `disallowedTools`
- `model` (string): `sonnet`, `opus`, `haiku`, `inherit` (default)
- `permissionMode` (string): `default`, `acceptEdits`, `dontAsk`, `bypassPermissions`, `plan`
- `skills` (array): Skills to load at startup
- `hooks` (object): Lifecycle hooks

**Body:** System prompt in Markdown

### GitHub Copilot Fields
Source: https://docs.github.com/en/copilot/reference/custom-agents-configuration

**Required:**
- None (filename becomes agent name)

**Optional:**
- `name` (string): Agent identifier
- `description` (string): Agent purpose
- `tools` (array): Tool names or `["*"]` for all. Aliases: `execute`, `read`, `edit`, `search`, `agent`, `web`, `todo`
- `mcp-servers` (object): MCP server configuration (org/enterprise level only)

**Body:** System prompt (max 30,000 chars)

**Key Differences:**
| Feature | Claude | Copilot |
|---------|--------|---------|
| Model selection | ✅ `model` field | ❌ Not supported |
| Permission modes | ✅ 5 modes | ❌ Not applicable |
| MCP servers | ❌ Not in frontmatter | ✅ In frontmatter (org-level) |
| Tool namespacing | ❌ Flat list | ✅ `server-name/tool-name` |
| Skill loading | ✅ `skills` array | ❌ Not supported |

## Template Strategy Recommendation

**Use Template Literals for field mapping:**

```javascript
// lib/templates/claude.js
function generateClaudeAgent(unified) {
  const frontmatter = {
    name: unified.name,
    description: unified.description,
    tools: unified.tools?.map(mapToolToClaude) || undefined,
    model: unified.model || 'inherit',
    permissionMode: unified.permissionMode || 'default'
  };
  
  // Remove undefined fields
  Object.keys(frontmatter).forEach(key => 
    frontmatter[key] === undefined && delete frontmatter[key]
  );
  
  const yaml = require('js-yaml');
  const yamlStr = yaml.dump(frontmatter, { lineWidth: -1 });
  
  return `---\n${yamlStr}---\n\n${unified.prompt}`;
}
```

**Use Mustache if conditional sections proliferate:**

```javascript
// templates/copilot.mustache
---
{{#name}}
name: {{name}}
{{/name}}
{{#description}}
description: {{description}}
{{/description}}
{{#hasTools}}
tools: [{{#tools}}"{{.}}"{{^last}}, {{/last}}{{/tools}}]
{{/hasTools}}
---

{{prompt}}
```

**Rationale:**
- Template literals: Clearer for simple mappings, easier to debug (it's just JS), no extra dependencies
- Mustache: Logic-less prevents template complexity from spiraling, widely known syntax, zero dependencies

## Sources

- **Claude Code Documentation** — https://code.claude.com/docs/en/sub-agents (fetched 2025-01-21, HIGH confidence)
- **GitHub Copilot Documentation** — https://docs.github.com/en/copilot/reference/custom-agents-configuration (fetched 2025-01-21, HIGH confidence)
- **gray-matter GitHub** — https://github.com/jonschlinkert/gray-matter (v4.0.3, last updated July 2023, MEDIUM confidence for currency)
- **js-yaml GitHub** — https://github.com/nodeca/js-yaml (v4.1.1, last updated Nov 2025, HIGH confidence)
- **EJS Documentation** — https://ejs.co/ and https://github.com/mde/ejs (v4.0.1, last updated Jan 2026, HIGH confidence)
- **Mustache.js GitHub** — https://github.com/janl/mustache.js (v4.2.0, last updated Oct 2024, HIGH confidence)
- **npm registry** — Version checks via `npm view` (2025-01-21)

---
*Stack research for: Template-based multi-platform agent generation*  
*Researched: 2025-01-21*
