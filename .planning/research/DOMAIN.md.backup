# Domain Architecture & Path Rewriting Research

**Project:** Template-based installer for Skills & Agents  
**Researched:** 2025-01-25  
**Focus:** Domain-oriented architecture, path rewriting, interactive CLI UX

---

## Executive Summary

This research covers five critical architectural areas for the template-based installer:

1. **Domain-Oriented Module Structure** - Organizing `/bin/lib` by responsibility (platforms/, templates/, rendering/) instead of file type
2. **Path Rewriting & Resolution** - Strategies for rewriting template paths like `@.github/...` to target directories
3. **Interactive CLI UX** - Libraries and patterns for "no flags = interactive mode" with progress indicators
4. **Transformation Pipeline Architecture** - Functional pipeline pattern with composable stages
5. **Phase 1 Migration Architecture (Temporary)** - One-time migration from `.github/` to `/templates/` (code deleted after)
6. **Phase 2+ Installation Architecture (Permanent)** - Template-based installation pipeline (reuses stages from Phase 1)

**Key Recommendations:**
- Use domain-driven directory structure with explicit public APIs via `index.js`
- Use hybrid path rewriting: template variables (`{{VAR}}`) + path aliases (`@install`)
- Use `@clack/prompts` for interactive CLI with built-in spinners and disabled menu options
- **Use Stage-Based Composition (ETL Pattern):** Shared stages, separate pipelines for migration and installation
- **Clear separation:** Migration pipeline is temporary (deleted after Phase 1), installation is permanent
- **Reuse validated components:** Installation reuses battle-tested stages from migration

---

## 1. Domain-Oriented Module Structure

**Confidence: MEDIUM-HIGH** (Based on DDD principles and Node.js best practices)

### Core Principle: Organize by Domain, Not File Type

**Anti-pattern (file type organization):**
```
/bin/lib/
├── models/
├── controllers/
├── services/
├── utils/
```

**Pattern (domain organization):**
```
/bin/lib/
├── platforms/       # Platform detection & config
├── templates/       # Template discovery & loading
├── rendering/       # Template rendering & path rewriting
├── paths/           # Path resolution
├── io/              # File operations
├── prompts/         # Interactive prompts
└── validation/      # Input validation
```

### Recommended Structure for /bin/lib

```
/bin/lib/
├── platforms/          # Platform detection & configuration
│   ├── index.js       # Public API: detectPlatform(), getPlatformConfig()
│   ├── detector.js    # Internal: platform detection logic
│   ├── configs.js     # Internal: platform-specific configs
│   └── types.js       # Types/constants for platforms
│
├── templates/         # Template discovery & loading
│   ├── index.js       # Public API: findTemplates(), loadTemplate()
│   ├── loader.js      # Internal: file system operations
│   ├── validator.js   # Internal: template validation
│   └── cache.js       # Internal: template caching (optional)
│
├── rendering/         # Template rendering & path rewriting
│   ├── index.js       # Public API: render(), rewritePaths()
│   ├── engine.js      # Internal: template engine wrapper
│   ├── rewriter.js    # Internal: path rewriting logic
│   └── filters.js     # Internal: custom template filters (optional)
│
├── paths/             # Path resolution & manipulation
│   ├── index.js       # Public API: resolvePath(), normalizePath()
│   ├── resolver.js    # Internal: path resolution logic
│   └── patterns.js    # Internal: path pattern matching
│
├── io/                # File system operations
│   ├── index.js       # Public API: writeFile(), copyFile()
│   ├── writer.js      # Internal: safe file writing
│   ├── copier.js      # Internal: recursive copying
│   └── backup.js      # Internal: backup operations (optional)
│
├── prompts/           # Interactive prompts
│   ├── index.js       # Public API: promptForPlatform(), confirmInstall()
│   ├── platform.js    # Internal: platform selection prompts
│   ├── template.js    # Internal: template selection prompts
│   └── styles.js      # Internal: prompt styling/theming (optional)
│
└── validation/        # Input validation
    ├── index.js       # Public API: validateConfig(), validatePaths()
    ├── config.js      # Internal: config validation rules
    └── paths.js       # Internal: path validation rules
```

### Module API Pattern: index.js as Public Gateway

**Purpose:** Each domain module exposes a clean public API through `index.js`. Internal implementation files are hidden from external consumers.

**Example: platforms/index.js**
```javascript
// Public API - only export what consumers need
export { detectPlatform } from './detector.js'
export { getPlatformConfig } from './configs.js'
export { PLATFORMS } from './types.js'

// Internal modules (detector.js, configs.js) are not directly accessible
// Consumers MUST use this public API
```

**Example: rendering/index.js**
```javascript
import { renderTemplate } from './engine.js'
import { rewritePaths } from './rewriter.js'

// Composed public API
export async function render(template, context) {
  const rendered = await renderTemplate(template, context)
  return rewritePaths(rendered, context.paths)
}

// Don't expose internal modules directly
// External code cannot import from ./engine.js or ./rewriter.js
```

**Example: Consumer code**
```javascript
// ✅ GOOD: Using public API
import { detectPlatform } from '../platforms/index.js'
import { render } from '../rendering/index.js'

// ❌ BAD: Reaching into internals (breaks encapsulation)
import { detectPlatform } from '../platforms/detector.js'
```

### Avoiding "God Files"

**God File Problem:** Single large file handling multiple concerns (1000+ lines)

**Anti-pattern Example:**
```javascript
// ❌ BAD: bin/lib/installer.js (1500 lines)
// Contains:
// - Platform detection (200 lines)
// - Template loading (300 lines)
// - Path rewriting (250 lines)
// - File copying (400 lines)
// - Validation (200 lines)
// - Prompts (150 lines)
```

**Solution:** Split by Single Responsibility Principle (SRP)

**Pattern Example:**
```javascript
// ✅ GOOD: Split by domain

// bin/lib/platforms/detector.js (80 lines)
// ONLY platform detection logic

// bin/lib/templates/loader.js (120 lines)
// ONLY template loading logic

// bin/lib/rendering/rewriter.js (150 lines)
// ONLY path rewriting logic

// Each file focused on ONE responsibility
// Files stay under 200-300 lines
```

### Module Boundaries & Dependency Direction

**Rule:** Dependencies flow from high-level (orchestration) to low-level (utilities)

```
High-level (orchestration layer)
    ↓
  prompts → platforms → templates → rendering → io
    ↓           ↓           ↓           ↓       ↓
validation    paths      paths       paths   validation
    ↓
(shared utilities - can be used by all)
```

**Key Principles:**
1. **Lower-level modules don't import from higher-level** (prevents circular dependencies)
2. **Shared utilities** (validation, paths) can be used by any module
3. **Clear data flow** prevents spaghetti dependencies

**Example:**
```javascript
// ✅ GOOD: prompts uses platforms (high → low)
// bin/lib/prompts/platform.js
import { detectPlatform, PLATFORMS } from '../platforms/index.js'

// ✅ GOOD: rendering uses paths (domain → utility)
// bin/lib/rendering/rewriter.js
import { normalizePath } from '../paths/index.js'

// ❌ BAD: platforms uses prompts (low → high, circular risk)
// bin/lib/platforms/detector.js
import { confirmPlatform } from '../prompts/index.js' // DON'T DO THIS
```

### Benefits of Domain-Oriented Structure

1. **Easier to navigate:** "Where's platform detection?" → `platforms/` directory
2. **Clear boundaries:** Each domain has explicit public API
3. **Better testing:** Can test each domain module in isolation
4. **Prevents god files:** Natural size limits when organized by domain
5. **Easier onboarding:** New developers can understand one domain at a time
6. **Flexible evolution:** Can refactor internal implementation without affecting consumers

---

## 2. Path Rewriting & Resolution

**Confidence: HIGH** (Industry standard patterns verified)

### Problem Statement

Skills and Agents reference files using placeholder paths:
- `@.github/get-shit-done/workflows/ci.yml`
- `@.claude/skills/research.js`
- `{{INSTALL_DIR}}/agents/orchestrator.js`

These need to be rewritten based on:
- **Platform:** GitHub CLI → `.github/`, Claude Desktop → `.claude/`
- **Custom paths:** User-specified installation directory
- **Context:** Different paths for different use cases

### Strategy 1: Simple String Replacement

**Confidence: HIGH** (Standard pattern)

**When to use:** Simple, one-to-one replacements

```javascript
function rewritePath(templatePath, config) {
  const { sourcePrefix, targetPrefix } = config
  
  // Replace @.github/ with actual target like .claude/
  return templatePath.replace(
    new RegExp(`^@?${sourcePrefix}`, 'g'), 
    targetPrefix
  )
}

// Example
rewritePath('@.github/workflows/ci.yml', {
  sourcePrefix: '.github',
  targetPrefix: '.claude'
})
// => '.claude/workflows/ci.yml'
```

**Pros:** Simple, fast, no dependencies  
**Cons:** Limited flexibility, no validation, manual escaping

### Strategy 2: Template Variable Pattern (RECOMMENDED)

**Confidence: HIGH** (Industry standard)

**When to use:** Need multiple variables, file content rewriting

Use placeholder syntax: `{{VARIABLE}}` or `${VARIABLE}`

```javascript
// Simple implementation
function rewritePaths(content, variables) {
  let result = content
  
  for (const [key, value] of Object.entries(variables)) {
    // Support both {{VAR}} and ${VAR} syntax
    result = result.replace(
      new RegExp(`\\{\\{${key}\\}\\}|\\$\\{${key}\\}`, 'g'),
      value
    )
  }
  
  return result
}

// Example
const template = `
import { workflow } from '{{INSTALL_DIR}}/core/workflow.js'
import { config } from '{{INSTALL_DIR}}/config.json'
`

const rewritten = rewritePaths(template, {
  INSTALL_DIR: '.claude/get-shit-done'
})

// Result:
// import { workflow } from '.claude/get-shit-done/core/workflow.js'
// import { config } from '.claude/get-shit-done/config.json'
```

**Pros:** Clear intent, flexible, easy to understand  
**Cons:** Need to parse entire file content

### Strategy 3: Path Prefix Mapping (WEBPACK/ROLLUP STYLE)

**Confidence: HIGH** (Module bundler pattern)

**When to use:** Import path resolution, complex path hierarchies

Similar to Webpack aliases and Rollup path mapping:

```javascript
// Path mapping configuration
const pathMappings = {
  '@install': '.claude/get-shit-done',
  '@workflows': '.claude/get-shit-done/workflows',
  '@skills': '.claude/get-shit-done/skills',
  '@agents': '.claude/get-shit-done/agents'
}

function resolvePath(importPath, mappings) {
  // Sort by length (longest match first)
  const sortedAliases = Object.keys(mappings)
    .sort((a, b) => b.length - a.length)
  
  for (const alias of sortedAliases) {
    if (importPath.startsWith(alias)) {
      return importPath.replace(alias, mappings[alias])
    }
  }
  
  return importPath // No match, return as-is
}

// Example
resolvePath('@workflows/ci.yml', pathMappings)
// => '.claude/get-shit-done/workflows/ci.yml'

resolvePath('@install/config.json', pathMappings)
// => '.claude/get-shit-done/config.json'
```

**Reference: How module bundlers do it**

**Webpack:**
```javascript
// webpack.config.js
module.exports = {
  resolve: {
    alias: {
      '@install': path.resolve(__dirname, '.claude/get-shit-done'),
      '@workflows': path.resolve(__dirname, '.claude/get-shit-done/workflows')
    }
  }
}
```

**Rollup:**
```javascript
// rollup.config.js
import alias from '@rollup/plugin-alias'

export default {
  plugins: [
    alias({
      entries: [
        { find: '@install', replacement: '.claude/get-shit-done' },
        { find: '@workflows', replacement: '.claude/get-shit-done/workflows' }
      ]
    })
  ]
}
```

**esbuild:**
```javascript
esbuild.build({
  alias: {
    '@install': '.claude/get-shit-done',
    '@workflows': '.claude/get-shit-done/workflows'
  }
})
```

**Pros:** Industry standard, clear semantics, supports deep paths  
**Cons:** Need to maintain mapping, order matters (longest match first)

### Recommended Libraries

#### mustache (v4.2.0) - For Template Variables
**Confidence: HIGH** (Widely used, well documented)

```bash
npm install mustache
```

```javascript
import Mustache from 'mustache'

const template = `
import { workflow } from '{{INSTALL_DIR}}/core/workflow.js'
import { skill } from '{{INSTALL_DIR}}/skills/{{SKILL_NAME}}.js'
`

const rendered = Mustache.render(template, {
  INSTALL_DIR: '.claude/get-shit-done',
  SKILL_NAME: 'research'
})

// Result:
// import { workflow } from '.claude/get-shit-done/core/workflow.js'
// import { skill } from '.claude/get-shit-done/skills/research.js'
```

**Pros:**
- Logic-less (safe, can't execute arbitrary code)
- Well documented
- Supports sections, partials, conditionals
- Uses `{{variable}}` syntax (clear and readable)

**Cons:**
- Larger than simple regex (but still small)
- May be overkill for very simple substitution

**When to use:** File content rewriting with multiple variables

#### expand-template (v2.0.3) - Lightweight Alternative
**Confidence: MEDIUM** (npm verified, limited documentation)

```bash
npm install expand-template
```

```javascript
import template from 'expand-template'

const pathTmpl = template('{INSTALL_DIR}/workflows/ci.yml')
console.log(pathTmpl({ INSTALL_DIR: '.claude/get-shit-done' }))
// => '.claude/get-shit-done/workflows/ci.yml'
```

**Pros:**
- Tiny (< 1KB)
- Zero dependencies
- Fast

**Cons:**
- Only supports `{var}` syntax (not `{{var}}`)
- No helpers or logic
- Minimal documentation

**When to use:** Simple path substitution, performance critical

### Recommended Hybrid Approach

**Use both strategies together for flexibility:**

```javascript
// 1. Define path mappings based on platform
function createPathMappings(platform, installDir) {
  return {
    '@install': installDir,
    '@workflows': `${installDir}/workflows`,
    '@skills': `${installDir}/skills`,
    '@agents': `${installDir}/agents`,
    '@platform': platform === 'github' ? '.github' : '.claude'
  }
}

// 2. Rewrite file content with template variables
function rewriteFileContent(content, mappings) {
  let result = content
  
  for (const [alias, realPath] of Object.entries(mappings)) {
    // Convert @alias to ALIAS for variable name
    const varName = alias.replace('@', '').toUpperCase()
    
    // Replace {{VAR}} pattern (mustache style)
    result = result.replace(
      new RegExp(`\\{\\{${varName}\\}\\}`, 'g'),
      realPath
    )
    
    // Replace @alias pattern in imports (webpack style)
    result = result.replace(
      new RegExp(`(['"])${alias}/`, 'g'),
      `$1${realPath}/`
    )
  }
  
  return result
}

// 3. Usage
const mappings = createPathMappings('claude', '.claude/get-shit-done')

const templateContent = `
import { workflow } from '@install/core/workflow.js'
import { config } from '{{INSTALL}}/config.json'
`

const rewritten = rewriteFileContent(templateContent, mappings)

// Result:
// import { workflow } from '.claude/get-shit-done/core/workflow.js'
// import { config } from '.claude/get-shit-done/config.json'
```

### Path Resolution Best Practices

#### 1. Always Use Forward Slashes in Templates

```javascript
// ✅ GOOD: Cross-platform (works on Windows, Mac, Linux)
const template = '{{INSTALL_DIR}}/workflows/ci.yml'

// ❌ BAD: Windows-specific (breaks on Mac/Linux)
const template = '{{INSTALL_DIR}}\\workflows\\ci.yml'
```

**Solution:** Use forward slashes in templates, convert to platform-specific paths when writing:

```javascript
import path from 'path'

function writeToFile(templatePath, variables, targetFile) {
  const resolved = rewritePaths(templatePath, variables)
  const platformPath = path.normalize(resolved) // Converts to \ on Windows
  
  // Write platformPath to file
}
```

#### 2. Validate Paths After Rewriting

```javascript
function validateRewrittenPath(path) {
  // Check for unreplaced variables
  if (/\{\{[^}]+\}\}/.test(path)) {
    throw new Error(`Unresolved variable in path: ${path}`)
  }
  
  // Check for invalid characters (Windows)
  if (/[<>:"|?*]/.test(path)) {
    throw new Error(`Invalid characters in path: ${path}`)
  }
  
  // Check for double slashes (unless protocol like file://)
  if (!/^[a-z]+:\/\//.test(path) && /\/\//.test(path)) {
    console.warn(`Double slashes in path: ${path}`)
  }
  
  return true
}

// Usage
const rewritten = rewritePaths(template, variables)
validateRewrittenPath(rewritten) // Throws if invalid
```

#### 3. Support Relative and Absolute Paths

```javascript
import path from 'path'

function resolveTemplatePath(templatePath, baseDir) {
  if (path.isAbsolute(templatePath)) {
    return templatePath
  }
  
  return path.join(baseDir, templatePath)
}

// Example
resolveTemplatePath('/abs/path/file.js', '/base')
// => '/abs/path/file.js' (already absolute)

resolveTemplatePath('rel/path/file.js', '/base')
// => '/base/rel/path/file.js' (made absolute)
```

### Edge Cases to Handle

1. **Nested variables:** `{{BASE}}/{{SUB}}/file.js`
   - Rewrite in order or use Mustache for proper nesting

2. **URL-style paths:** `file://{{INSTALL_DIR}}/config.json`
   - Don't normalize URLs, only filesystem paths

3. **Multiple occurrences:** Same variable used many times in one file
   - Regex with `g` flag handles this

4. **Escaped variables:** `\{{NOT_A_VAR}}` should not be replaced
   - Implement escape handling if needed

5. **Case sensitivity:** Should `{{install_dir}}` match `INSTALL_DIR`?
   - Decision: Use consistent case (UPPER_CASE recommended)

### Testing Strategy

```javascript
// Test cases for path rewriting
const testCases = [
  {
    name: 'Replace @alias in imports',
    input: "import x from '@install/workflows/ci.yml'",
    variables: { '@install': '.claude/gsd' },
    expected: "import x from '.claude/gsd/workflows/ci.yml'"
  },
  {
    name: 'Replace {{VAR}} in paths',
    input: '{{INSTALL_DIR}}/config.json',
    variables: { INSTALL_DIR: '.github/actions' },
    expected: '.github/actions/config.json'
  },
  {
    name: 'Handle nested variables',
    input: '{{BASE}}/{{SUB}}/file.js',
    variables: { BASE: '.claude', SUB: 'workflows' },
    expected: '.claude/workflows/file.js'
  },
  {
    name: 'Preserve URLs',
    input: 'file://{{INSTALL_DIR}}/config.json',
    variables: { INSTALL_DIR: '/home/user/.claude' },
    expected: 'file:///home/user/.claude/config.json'
  }
]

// Run tests
for (const test of testCases) {
  const result = rewritePaths(test.input, test.variables)
  console.assert(result === test.expected, 
    `${test.name} failed: expected ${test.expected}, got ${result}`)
}
```

---

## 3. Interactive CLI UX

**Confidence: HIGH** (npm registry verified, widely used libraries)

### Library Comparison

#### @clack/prompts (v0.11.0) - **RECOMMENDED**

**Repository:** https://github.com/bombshell-dev/clack  
**Confidence:** HIGH (npm verified, active development, used by major projects)

**Why @clack/prompts:**
- Modern, beautiful UI out of the box
- Excellent developer experience with intuitive API
- Built-in progress indicators and spinners
- Perfect for multi-step flows
- Active development (2025)
- **Supports disabled menu options** (perfect for "coming soon")
- Used by: Astro, SvelteKit, Nuxt, and other major projects

```bash
npm install @clack/prompts
```

**Example Usage:**
```javascript
import * as p from '@clack/prompts'

async function main() {
  console.clear()
  
  p.intro('🚀 Skills & Agents Installer')
  
  // Select platform
  const platform = await p.select({
    message: 'Which platform are you using?',
    options: [
      { value: 'github', label: 'GitHub CLI (gh)', hint: 'For gh command' },
      { value: 'claude', label: 'Claude Desktop', hint: 'For Claude.app' },
      { value: 'cursor', label: 'Cursor', hint: 'Coming soon...', disabled: true }
    ]
  })
  
  if (p.isCancel(platform)) {
    p.cancel('Installation cancelled')
    process.exit(0)
  }
  
  // Select templates (multi-select)
  const templates = await p.multiselect({
    message: 'Which skills/agents to install?',
    options: [
      { value: 'research', label: 'Research Agent', hint: 'Domain research' },
      { value: 'roadmap', label: 'Roadmap Creator', hint: 'Planning workflows' }
    ],
    required: true
  })
  
  // Confirm installation
  const confirm = await p.confirm({
    message: 'Install selected items?',
    initialValue: true
  })
  
  if (!confirm) {
    p.cancel('Installation cancelled')
    process.exit(0)
  }
  
  // Show progress
  const s = p.spinner()
  s.start('Installing templates...')
  
  await installTemplates(platform, templates)
  
  s.stop('Installation complete!')
  
  p.outro('✨ All done! Your skills and agents are ready.')
}

main().catch(console.error)
```

**Key Features:**
- `intro()` / `outro()` - Beautiful start/end messages
- `select()` - Single choice menu
- `multiselect()` - Multiple choice menu
- `confirm()` - Yes/no prompt
- `text()` - Text input
- `spinner()` - Progress indicator
- `isCancel()` - Handle Ctrl+C gracefully
- **`disabled: true`** - Show "coming soon" items in menus

**Pros:**
- Beautiful UI by default (no configuration needed)
- Handles Ctrl+C elegantly with `isCancel()`
- Built-in spinners and progress indicators
- TypeScript support
- Can disable menu items (perfect for showing roadmap)

**Cons:**
- Newer library (less battle-tested than Inquirer)
- Smaller plugin ecosystem

#### @inquirer/prompts (v8.2.0) - Mature Alternative

**Repository:** https://github.com/SBoudrias/Inquirer.js  
**Confidence:** HIGH (Industry standard, npm verified)

**Why Inquirer:**
- Industry standard (used by Yeoman, Vue CLI, Create React App)
- Battle-tested over many years
- Extensive plugin ecosystem
- Very stable API

```bash
npm install @inquirer/prompts
```

**Example Usage:**
```javascript
import { select, checkbox, confirm } from '@inquirer/prompts'

const platform = await select({
  message: 'Which platform?',
  choices: [
    { name: 'GitHub CLI (gh)', value: 'github' },
    { name: 'Claude Desktop', value: 'claude' },
    { name: 'Cursor (Coming soon)', value: 'cursor', disabled: true }
  ]
})

const templates = await checkbox({
  message: 'Which skills/agents?',
  choices: [
    { name: 'Research Agent', value: 'research', checked: true },
    { name: 'Roadmap Creator', value: 'roadmap' }
  ]
})

const shouldInstall = await confirm({
  message: 'Install selected items?',
  default: true
})
```

**Key Features:**
- `select()` - Single choice
- `checkbox()` - Multiple choice
- `confirm()` - Yes/no
- `input()` - Text input
- `password()` - Hidden input
- Extensive plugin ecosystem

**Pros:**
- Most mature option
- Huge ecosystem
- Very well documented
- Proven reliability

**Cons:**
- Less beautiful default UI than @clack
- More verbose API
- No built-in spinner (need separate package like `ora`)

#### prompts (v2.4.2) - Lightweight Option

**Repository:** https://github.com/terkelg/prompts  
**Confidence:** MEDIUM (npm verified, less documentation)

Simpler, lighter alternative for basic needs.

```bash
npm install prompts
```

**Pros:** Lightweight (< 20KB), simple API  
**Cons:** Less polished UI, fewer features

### Recommendation: Use @clack/prompts

**Why @clack for this project:**

1. **Beautiful UI matches modern expectations** - CLI tools should look professional
2. **Built-in disabled options** - Perfect for showing "coming soon" platforms
3. **Integrated spinner/progress** - Multi-step install needs clear progress feedback
4. **Graceful cancellation** - `isCancel()` makes Ctrl+C handling elegant
5. **Active development** - Well maintained, continuously improving
6. **Industry adoption** - Used by major framework CLI tools

### "No Flags = Interactive Mode" Pattern

**Confidence: HIGH** (Standard CLI pattern)

**Implementation Strategy:**

```javascript
#!/usr/bin/env node
import { parseArgs } from 'node:util'
import * as p from '@clack/prompts'

// Parse command-line flags
const { values } = parseArgs({
  options: {
    platform: { type: 'string', short: 'p' },
    template: { type: 'string', short: 't', multiple: true },
    yes: { type: 'boolean', short: 'y' },
    help: { type: 'boolean', short: 'h' }
  },
  allowPositionals: true
})

async function main() {
  // Show help if requested
  if (values.help) {
    showHelp()
    process.exit(0)
  }
  
  // Determine if we need interactive mode
  const isInteractive = !values.platform || !values.template
  
  if (isInteractive) {
    // No flags provided = interactive mode
    await runInteractiveMode()
  } else {
    // Flags provided = non-interactive mode
    await runNonInteractiveMode(values)
  }
}

async function runInteractiveMode() {
  console.clear()
  
  p.intro('🚀 Skills & Agents Installer')
  
  const platform = await p.select({
    message: 'Which platform?',
    options: [/* ... */]
  })
  
  // ... rest of interactive prompts
}

async function runNonInteractiveMode(options) {
  // Use flags directly (no prompts)
  console.log(`Installing ${options.template.join(', ')} for ${options.platform}...`)
  
  // Validate options
  if (!isValidPlatform(options.platform)) {
    console.error(`Invalid platform: ${options.platform}`)
    process.exit(1)
  }
  
  // Skip confirmation if --yes flag
  if (!options.yes) {
    const answer = await confirm('Continue?')
    if (!answer) process.exit(0)
  }
  
  // Do installation
  await install(options.platform, options.template)
}

main().catch(console.error)
```

**Usage examples:**
```bash
# Interactive mode (no flags)
$ install-skills
🚀 Skills & Agents Installer
? Which platform? › 
  ❯ GitHub CLI (gh)
    Claude Desktop
    Cursor (Coming soon)

# Non-interactive mode (with flags)
$ install-skills --platform github --template research --template roadmap
Installing research, roadmap for github...

# Skip confirmation with --yes
$ install-skills -p github -t research -y
Installing research for github...
Done!
```

### Best Practices for CLI UX

#### 1. Always Support Both Modes

- **Interactive mode** for exploration and first-time users
- **Non-interactive mode** for automation, CI/CD, scripts

#### 2. Make Interactive the Default

```javascript
// No flags = interactive (user-friendly)
const isInteractive = !values.platform || !values.template

// NOT: require --interactive flag (extra typing)
```

#### 3. Provide `--yes` Flag

Skip confirmations for automation:

```javascript
if (!options.yes) {
  const confirmed = await p.confirm({
    message: 'Continue with installation?',
    initialValue: true
  })
  
  if (!confirmed) {
    p.cancel('Installation cancelled')
    process.exit(0)
  }
}
```

#### 4. Handle Ctrl+C Gracefully

```javascript
const platform = await p.select({ /* ... */ })

if (p.isCancel(platform)) {
  p.cancel('Operation cancelled')
  process.exit(0) // Clean exit
}

// Always check isCancel() after prompts
```

#### 5. Clear Screen for Interactive Mode

```javascript
if (isInteractive) {
  console.clear() // Clean slate for prompts
}

// DON'T clear in non-interactive mode (breaks CI logs)
```

### Showing "Coming Soon" Options

**With @clack/prompts:**
```javascript
const platform = await p.select({
  message: 'Which platform?',
  options: [
    { value: 'github', label: 'GitHub CLI', hint: 'Ready ✓' },
    { value: 'claude', label: 'Claude Desktop', hint: 'Ready ✓' },
    { 
      value: 'cursor', 
      label: 'Cursor', 
      hint: '🚧 Coming soon',
      disabled: true  // ← User can see it but can't select
    },
    { 
      value: 'vscode', 
      label: 'VS Code Copilot', 
      hint: '🚧 Coming soon',
      disabled: true
    }
  ]
})
```

**Benefits:**
- Users see the roadmap (transparency)
- Builds anticipation for future features
- No confusion about missing options
- Shows active development

**With @inquirer/prompts:**
```javascript
const platform = await select({
  message: 'Which platform?',
  choices: [
    { name: 'GitHub CLI (gh) ✓', value: 'github' },
    { name: 'Claude Desktop ✓', value: 'claude' },
    { 
      name: 'Cursor 🚧 Coming soon', 
      value: 'cursor',
      disabled: true
    }
  ]
})
```

### Progress Indicators

#### Simple Spinner (Single Step)

**With @clack/prompts:**
```javascript
const s = p.spinner()
s.start('Copying files...')

await copyFiles()

s.stop('Files copied!')
```

#### Multi-Step Progress

**For multiple steps, use sequential spinners:**
```javascript
// Step 1: Validate
const s1 = p.spinner()
s1.start('Validating configuration...')
await validateConfig(platform, templates)
s1.stop('Configuration valid ✓')

// Step 2: Create directories
const s2 = p.spinner()
s2.start('Creating directories...')
await createDirectories(platform)
s2.stop('Directories created ✓')

// Step 3: Copy files
const s3 = p.spinner()
s3.start(`Copying ${templates.length} templates...`)

for (const template of templates) {
  s3.message(`Copying ${template}...`) // Update message
  await copyTemplate(template)
}

s3.stop(`${templates.length} templates installed ✓`)

// Step 4: Update configs
const s4 = p.spinner()
s4.start('Updating configuration files...')
await updateConfigs(platform, templates)
s4.stop('Configuration updated ✓')
```

#### Progress Bar for File Operations

**Use ora (separate package) for more detailed progress:**

```bash
npm install ora
```

```javascript
import ora from 'ora'

const spinner = ora('Installing templates...').start()

for (let i = 0; i < templates.length; i++) {
  spinner.text = `Installing ${templates[i].name} (${i + 1}/${templates.length})`
  await installTemplate(templates[i])
}

spinner.succeed('All templates installed!')
```

### Complete Interactive Flow Example

```javascript
#!/usr/bin/env node
import * as p from '@clack/prompts'
import { detectPlatform, getAvailableTemplates, install } from './lib/index.js'

async function main() {
  console.clear()
  
  p.intro('🚀 Skills & Agents Installer v1.0.0')
  
  // 1. Detect or select platform
  const s = p.spinner()
  s.start('Detecting platform...')
  const detectedPlatform = await detectPlatform()
  s.stop(detectedPlatform 
    ? `Detected: ${detectedPlatform}` 
    : 'No platform detected')
  
  const platform = await p.select({
    message: 'Install for which platform?',
    initialValue: detectedPlatform,
    options: [
      { value: 'github', label: 'GitHub CLI (gh)', hint: 'For gh command' },
      { value: 'claude', label: 'Claude Desktop', hint: 'For Claude.app' },
      { value: 'cursor', label: 'Cursor', hint: '🚧 Coming soon', disabled: true }
    ]
  })
  
  if (p.isCancel(platform)) {
    p.cancel('Installation cancelled')
    process.exit(0)
  }
  
  // 2. Select what to install
  const templates = await p.multiselect({
    message: 'Select skills and agents to install:',
    options: getAvailableTemplates(platform).map(t => ({
      value: t.id,
      label: t.name,
      hint: t.description
    })),
    required: true
  })
  
  if (p.isCancel(templates)) {
    p.cancel('Installation cancelled')
    process.exit(0)
  }
  
  // 3. Confirm
  const confirm = await p.confirm({
    message: `Install ${templates.length} item(s) for ${platform}?`,
    initialValue: true
  })
  
  if (!confirm) {
    p.cancel('Installation cancelled')
    process.exit(0)
  }
  
  // 4. Install with progress
  const installSpinner = p.spinner()
  installSpinner.start('Installing...')
  
  try {
    await install(platform, templates, {
      onProgress: (msg) => installSpinner.message(msg)
    })
    
    installSpinner.stop('Installation complete! ✓')
    
    // 5. Success message
    p.outro(`✨ Done! Your skills and agents are ready.
    
Next steps:
  • Run: ${platform === 'github' ? 'gh gsd' : 'Open Claude Desktop'}
  • Docs: https://github.com/your-repo
`)
  } catch (error) {
    installSpinner.stop('Installation failed')
    p.log.error(error.message)
    process.exit(1)
  }
}

main().catch((error) => {
  p.log.error(error)
  process.exit(1)
})
```

### Menu UX Best Practices

#### 1. Use Hints for Clarity

```javascript
options: [
  { 
    value: 'github', 
    label: 'GitHub CLI', 
    hint: 'For gh command line' 
  },
  { 
    value: 'claude', 
    label: 'Claude Desktop', 
    hint: 'For Claude.app on Mac/Windows' 
  }
]
```

#### 2. Smart Defaults

```javascript
const shouldContinue = await p.confirm({
  message: 'Continue with installation?',
  initialValue: true  // ← Yes is default (most common choice)
})
```

#### 3. Validation

```javascript
const customPath = await p.text({
  message: 'Installation directory?',
  placeholder: '.claude/get-shit-done',
  validate: (value) => {
    if (!value) return 'Path is required'
    if (path.isAbsolute(value)) return 'Use relative path'
    return undefined // Valid
  }
})
```

#### 4. Intro/Outro for Context

```javascript
p.intro('🚀 Skills & Agents Installer v1.0.0')

// ... prompts and installation ...

p.outro('✨ Installation complete! Run `gh gsd` to get started.')
```

---

## Additional Resources

### Interactive CLI Libraries

- **@clack/prompts:** https://github.com/bombshell-dev/clack
  - Used by: Astro, SvelteKit, Nuxt
  
- **@inquirer/prompts:** https://github.com/SBoudrias/Inquirer.js
  - Used by: Yeoman, Vue CLI, Create React App

### Template Engines

- **mustache:** https://github.com/janl/mustache.js
  - Logic-less templates
  
- **handlebars:** https://handlebarsjs.com/
  - More powerful template engine

### Spinner/Progress Libraries

- **ora:** https://github.com/sindresorhus/ora
  - Most popular Node.js spinner
  
- **cli-spinners:** https://github.com/sindresorhus/cli-spinners
  - Spinner styles used by ora

### Module Bundler Documentation

- **Webpack resolve.alias:** https://webpack.js.org/configuration/resolve/#resolvealias
- **Rollup plugin-alias:** https://github.com/rollup/plugins/tree/master/packages/alias
- **esbuild alias:** https://esbuild.github.io/api/#alias

---

## 4. Transformation Pipeline Architecture

**Confidence: HIGH** (Based on established ETL patterns, functional programming principles, and Node.js ecosystem best practices)

### Problem Statement

Building an installer that transforms 42 files (29 skills + 13 agents) with complex frontmatter transformations requires:
- Clear pipeline stages (read → parse → transform → validate → write)
- Strong module boundaries
- Robust error handling
- Atomic operations (all-or-nothing)
- Idempotent operations (safe to re-run)
- Comprehensive testing

### Core Architecture Pattern: Functional Pipeline

**RECOMMENDED:** Use functional composition where each stage is a pure function that takes context, transforms it, returns context.

```javascript
// pipeline/index.js
async function runPipeline(config) {
  const context = new PipelineContext(config);
  
  try {
    await readStage(context);
    await parseStage(context);
    await transformStage(context);
    await validateStage(context);
    await generateStage(context);
    await writeStage(context);
    
    return context;
  } catch (err) {
    await rollbackStage(context);
    throw err;
  }
}
```

**Why this pattern:**
- ✅ **Composable:** Easy to add/remove stages
- ✅ **Testable:** Each stage tested independently
- ✅ **Debuggable:** Inspect context between stages
- ✅ **Predictable:** No hidden side effects

**Alternative patterns considered:**
- ❌ **Streams:** Overkill for 42 files, harder to debug
- ❌ **Middleware:** More complex than needed, express-style unnecessary

### Module Structure for Transformation Pipeline

**Principle:** Organize by pipeline stage, with clear separation between I/O and pure transformations.

```
/bin/lib/
├── pipeline/
│   ├── index.js              # Main orchestrator
│   ├── context.js            # Pipeline context object
│   └── stages.js             # Stage definitions
│
├── readers/                  # Stage 1: Read
│   ├── index.js              # Public API
│   ├── file-reader.js        # Read source files
│   └── frontmatter-parser.js # Parse YAML frontmatter
│
├── transformers/             # Stage 2: Transform
│   ├── index.js              # Public API
│   ├── skill-transformer.js  # Transform skill frontmatter
│   ├── agent-transformer.js  # Transform agent frontmatter
│   ├── tool-mapper.js        # Map tool names (Copilot→Claude)
│   └── skill-extractor.js    # Extract /gsd-* references
│
├── validators/               # Stage 3: Validate
│   ├── index.js              # Public API
│   ├── schema-validator.js   # Validate against Joi schemas
│   ├── reference-validator.js # Validate cross-references
│   └── schemas/
│       ├── skill-schema.js
│       └── agent-schema.js
│
├── generators/               # Stage 4: Generate
│   ├── index.js              # Public API
│   ├── metadata-generator.js # Generate version.json per skill
│   └── versions-generator.js # Generate consolidated versions.json
│
├── writers/                  # Stage 5: Write
│   ├── index.js              # Public API
│   ├── atomic-writer.js      # Atomic file operations
│   └── directory-copier.js   # Directory operations
│
└── errors/
    ├── index.js              # Public API
    ├── pipeline-error.js     # Base error class
    └── validation-error.js   # Validation-specific errors
```

**Key principles:**
1. **I/O at edges only:** Only `readers/` and `writers/` touch filesystem
2. **Pure transformers:** All transformation logic is pure (no side effects)
3. **Single responsibility:** Each module does ONE thing
4. **Public APIs:** `index.js` exports only public functions, hides internals
5. **Error types:** Custom errors with stage/file context

### Pipeline Context Pattern

**Problem:** Each stage needs access to configuration, paths, files, and accumulated state.

**Solution:** Context object passed through entire pipeline.

```javascript
// pipeline/context.js
class PipelineContext {
  constructor(config) {
    this.config = config;
    this.sourcePath = config.sourcePath;
    this.targetPath = config.targetPath;
    this.tempPath = null;
    
    // Accumulated data
    this.files = [];        // All files being processed
    this.skills = [];       // Parsed skill files
    this.agents = [];       // Parsed agent files
    this.metadata = {};     // Generated metadata
    
    // Error tracking
    this.errors = [];
    this.warnings = [];
  }
  
  addFile(file) {
    this.files.push(file);
  }
  
  addError(error) {
    this.errors.push(error);
  }
  
  hasErrors() {
    return this.errors.length > 0;
  }
  
  getFileCount() {
    return this.files.length;
  }
}

module.exports = { PipelineContext };
```

**Usage in stages:**
```javascript
// Each stage takes context, modifies it, returns it
async function transformStage(context) {
  for (const file of context.files) {
    try {
      if (file.type === 'skill') {
        file.frontmatter = transformSkillFrontmatter(file.frontmatter);
      } else if (file.type === 'agent') {
        file.frontmatter = transformAgentFrontmatter(file.frontmatter);
      }
    } catch (err) {
      context.addError(new TransformError(file.path, err));
    }
  }
  return context;
}
```

### Frontmatter Parsing with gray-matter

**RECOMMENDED LIBRARY:** `gray-matter` v4.0.3

**Why gray-matter:**
- ✅ Industry standard (2.3M+ weekly downloads)
- ✅ Used by Jekyll, Hugo, 11ty, VuePress, Gatsby, Astro
- ✅ Handles YAML, JSON, TOML, Coffee
- ✅ Can stringify (write back modified frontmatter)
- ✅ Excerpt support
- ✅ Excellent error messages

**Installation:**
```bash
npm install gray-matter
```

**Usage:**
```javascript
const matter = require('gray-matter');

// readers/frontmatter-parser.js
function parseFrontmatter(filePath, content) {
  try {
    const parsed = matter(content);
    return {
      frontmatter: parsed.data,    // YAML as JS object
      markdown: parsed.content,     // Markdown content
      original: parsed.orig         // Original string
    };
  } catch (err) {
    if (err.name === 'YAMLException') {
      throw new ParseError(filePath, 'Invalid YAML syntax', err);
    }
    throw err;
  }
}

// writers/frontmatter-writer.js
function stringifyFrontmatter(frontmatter, markdown) {
  return matter.stringify(markdown, frontmatter);
}
```

**Alternative considered:**
- ❌ `front-matter`: YAML only, no stringify support, less maintained

### Error Handling Strategy

**Two-tier approach:**
1. **Fail-fast for critical errors** (invalid config, missing source directory)
2. **Collect-and-report for validation errors** (invalid frontmatter in one file)

**Error types:**
```javascript
// errors/pipeline-error.js
class PipelineError extends Error {
  constructor(stage, message, file = null, cause = null) {
    super(message);
    this.name = 'PipelineError';
    this.stage = stage;       // Which stage failed
    this.file = file;          // Which file (if applicable)
    this.cause = cause;        // Underlying error
  }
  
  toString() {
    let msg = `[${this.stage}] ${this.message}`;
    if (this.file) msg += ` (file: ${this.file})`;
    return msg;
  }
}

class ValidationError extends PipelineError {
  constructor(file, field, message) {
    super('validation', message, file);
    this.field = field;
  }
}

class TransformError extends PipelineError {
  constructor(file, message, cause) {
    super('transform', message, file, cause);
  }
}
```

**Error handling in pipeline:**
```javascript
async function runPipeline(config) {
  const context = new PipelineContext(config);
  
  try {
    // Fail-fast stages
    await readStage(context);
    if (context.hasErrors()) {
      throw new PipelineError('read', 'Failed to read source files');
    }
    
    // Collect-errors stages
    await transformStage(context);  // Continues even if some files fail
    await validateStage(context);   // Accumulates all validation errors
    
    // Report all errors
    if (context.hasErrors()) {
      console.error(`Found ${context.errors.length} errors:`);
      context.errors.forEach(err => console.error(`  ${err}`));
      throw new PipelineError('validation', 'Validation failed');
    }
    
    // Fail-fast for writes
    await writeStage(context);
    
  } catch (err) {
    await rollbackStage(context);
    throw err;
  }
}
```

### Atomic Operations & Rollback

**Problem:** If transformation fails halfway through writing, you're left with corrupted state.

**RECOMMENDED SOLUTION:** Write to temporary directory, then atomic move.

```javascript
// writers/atomic-writer.js
const path = require('path');
const fs = require('fs').promises;
const os = require('os');

async function atomicWrite(context) {
  // Create temp directory
  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), 'gsd-installer-')
  );
  context.tempPath = tempDir;
  
  try {
    // Write all files to temp directory
    for (const file of context.files) {
      const targetPath = path.join(tempDir, file.relativePath);
      await fs.mkdir(path.dirname(targetPath), { recursive: true });
      await fs.writeFile(targetPath, file.content);
    }
    
    // Validate temp directory
    await validateOutput(tempDir);
    
    // Atomic move (or copy+delete if cross-filesystem)
    await moveDirectory(tempDir, context.targetPath);
    
    console.log(`✓ Successfully installed to ${context.targetPath}`);
    
  } catch (err) {
    // Cleanup temp directory
    await fs.rm(tempDir, { recursive: true, force: true });
    throw new PipelineError('write', 'Failed to write files', null, err);
  }
}

async function moveDirectory(source, target) {
  try {
    // Try atomic rename (works if same filesystem)
    await fs.rename(source, target);
  } catch (err) {
    // Fall back to copy + delete (cross-filesystem)
    await fs.cp(source, target, { recursive: true });
    await fs.rm(source, { recursive: true, force: true });
  }
}
```

**Why this approach:**
- ✅ Clean rollback (just delete temp directory)
- ✅ Target directory never in corrupted state
- ✅ Can validate before committing
- ✅ Atomic on same filesystem

**Alternative: Dry-run mode**
```javascript
async function runPipeline(config, { dryRun = false }) {
  const context = new PipelineContext(config);
  
  await readStage(context);
  await transformStage(context);
  await validateStage(context);
  
  if (dryRun) {
    console.log('Dry run - would write:', context.files.length, 'files');
    context.files.forEach(f => console.log(`  - ${f.relativePath}`));
  } else {
    await writeStage(context);
  }
}
```

**Use dry-run for:**
- User preview before actual install
- Testing without side effects
- Debugging transformations

### Validation Strategy

**Two levels:**
1. **Schema validation** (structure, types, required fields)
2. **Cross-reference validation** (skill references exist)

**RECOMMENDED LIBRARY:** `joi` v17.x for schema validation

**Installation:**
```bash
npm install joi
```

**Schema validation:**
```javascript
// validators/schemas/skill-schema.js
const Joi = require('joi');

const skillSchema = Joi.object({
  version: Joi.string()
    .required()
    .pattern(/^\d+\.\d+\.\d+$/)
    .messages({
      'string.pattern.base': 'version must be semver format (e.g., 1.0.0)'
    }),
  
  name: Joi.string().required(),
  
  description: Joi.string().required(),
  
  tags: Joi.array()
    .items(Joi.string())
    .default([]),
  
  arguments: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    required: Joi.boolean().default(false),
    type: Joi.string()
      .valid('string', 'number', 'boolean', 'array', 'object')
      .default('string'),
    description: Joi.string()
  })).default([]),
  
  capabilities: Joi.array()
    .items(Joi.string().valid('read', 'write', 'execute'))
    .default([])
    
}).unknown(false); // Fail on unknown fields

module.exports = { skillSchema };
```

**Validator usage:**
```javascript
// validators/schema-validator.js
const { skillSchema } = require('./schemas/skill-schema');

function validateSkill(data, filePath) {
  const { error, value } = skillSchema.validate(data, {
    abortEarly: false // Get all errors, not just first
  });
  
  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message,
      file: filePath
    }));
    
    throw new ValidationError(
      filePath,
      errors.map(e => e.field).join(', '),
      errors.map(e => e.message).join('; ')
    );
  }
  
  return value; // Returns validated & coerced value
}
```

**Cross-reference validation:**
```javascript
// validators/reference-validator.js
function validateSkillReferences(agents, skills) {
  const skillNames = new Set(skills.map(s => s.frontmatter.name));
  const errors = [];
  
  agents.forEach(agent => {
    agent.skillReferences.forEach(ref => {
      if (!skillNames.has(ref)) {
        errors.push({
          file: agent.path,
          message: `Unknown skill reference: ${ref}`
        });
      }
    });
  });
  
  return errors;
}

// Usage in validateStage
async function validateStage(context) {
  // Schema validation
  for (const file of context.files) {
    try {
      if (file.type === 'skill') {
        validateSkill(file.frontmatter, file.path);
      }
    } catch (err) {
      context.addError(err);
    }
  }
  
  // Cross-reference validation
  const refErrors = validateSkillReferences(context.agents, context.skills);
  refErrors.forEach(err => context.addError(new ValidationError(
    err.file, 'skill_reference', err.message
  )));
  
  return context;
}
```

### Idempotency Guarantees

**Requirement:** Running installer twice must produce identical results.

**Strategies:**

**1. Pure transformations (no incremental changes):**
```javascript
// ❌ BAD: Non-idempotent
function transform(data) {
  data.count = (data.count || 0) + 1; // Increments each time!
  return data;
}

// ✅ GOOD: Idempotent
function transform(data) {
  return {
    ...data,
    count: 1 // Always set to 1
  };
}
```

**2. Replace, don't append:**
```javascript
// ❌ BAD: Appends each time
function addTag(data) {
  data.tags.push('installer');
  return data;
}

// ✅ GOOD: Set-based approach
function ensureTag(data) {
  const tags = new Set(data.tags || []);
  tags.add('installer');
  return { ...data, tags: Array.from(tags) };
}
```

**3. Deterministic metadata (no timestamps):**
```javascript
// ❌ BAD: Changes each run
const metadata = {
  generated_at: new Date().toISOString()
};

// ✅ GOOD: Use source version or omit
const metadata = {
  source_version: getSourceVersion(), // From git hash or package.json
  installer_version: require('../package.json').version
};
```

**4. Checksum-based skip:**
```javascript
const crypto = require('crypto');

function needsUpdate(sourcePath, targetPath) {
  if (!fs.existsSync(targetPath)) return true;
  
  const sourceHash = hashFile(sourcePath);
  const targetHash = hashFile(targetPath);
  
  return sourceHash !== targetHash;
}

function hashFile(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(content).digest('hex');
}

// Usage in writeStage
async function writeStage(context) {
  for (const file of context.files) {
    if (needsUpdate(file.sourcePath, file.targetPath)) {
      await fs.writeFile(file.targetPath, file.content);
      console.log(`  Updated: ${file.relativePath}`);
    } else {
      console.log(`  Skipped: ${file.relativePath} (unchanged)`);
    }
  }
}
```

### Testing Strategy

**Four testing levels:**

**1. Unit tests: Pure transformations**
```javascript
// transformers/skill-transformer.test.js
const { transformSkillFrontmatter } = require('./skill-transformer');

describe('transformSkillFrontmatter', () => {
  it('should rename gsd_version to version', () => {
    const input = { gsd_version: '1.0.0', name: 'test' };
    const output = transformSkillFrontmatter(input);
    
    expect(output).toEqual({ version: '1.0.0', name: 'test' });
    expect(output).not.toHaveProperty('gsd_version');
  });
  
  it('should convert string tags to array', () => {
    const input = { tags: 'tag1, tag2' };
    const output = transformSkillFrontmatter(input);
    
    expect(output.tags).toEqual(['tag1', 'tag2']);
  });
  
  it('should be idempotent', () => {
    const input = { gsd_version: '1.0.0' };
    const once = transformSkillFrontmatter(input);
    const twice = transformSkillFrontmatter(once);
    
    expect(once).toEqual(twice);
  });
});
```

**2. Integration tests: Pipeline stages**
```javascript
// pipeline/pipeline.test.js
const { runPipeline } = require('./index');
const { PipelineContext } = require('./context');

describe('pipeline', () => {
  it('should process skill files end-to-end', async () => {
    const context = new PipelineContext({
      sourcePath: './test/fixtures/skills',
      targetPath: './test/output'
    });
    
    await runPipeline(context);
    
    expect(context.files).toHaveLength(2);
    expect(context.errors).toHaveLength(0);
    
    // Verify output
    const output = await fs.readFile(
      './test/output/skill1.md',
      'utf8'
    );
    expect(output).toContain('version: 1.0.0');
  });
});
```

**3. Snapshot tests: Complex transformations**
```javascript
// transformers/agent-transformer.test.js
it('should transform agent frontmatter correctly', () => {
  const input = {
    name: 'Test Agent',
    gsd_version: '1.0.0',
    tools: 'read_file, write_file',
    context7: 'yes'
  };
  
  const output = transformAgentFrontmatter(input);
  
  // Captures entire output structure
  expect(output).toMatchSnapshot();
});
```

**4. Golden files: End-to-end verification**
```
/test/
├── fixtures/          # Input files
│   ├── skills/
│   │   └── test-skill.md
│   └── agents/
│       └── test-agent.md
└── golden/            # Expected output
    ├── skills/
    │   └── test-skill.md
    └── agents/
        └── test-agent.md
```

```javascript
it('should match golden file', async () => {
  await runPipeline(context);
  
  const actual = await fs.readFile(
    './test/output/skills/test-skill.md',
    'utf8'
  );
  const expected = await fs.readFile(
    './test/golden/skills/test-skill.md',
    'utf8'
  );
  
  expect(actual).toBe(expected);
});
```

**Test coverage targets:**
- ✅ Unit tests: 100% of transformer functions
- ✅ Integration tests: All pipeline stages
- ✅ Snapshot tests: Complex transformations
- ✅ Golden files: End-to-end installer run

### Performance Optimization

**For 42 files, performance is not critical, but these patterns scale:**

**1. Parallel processing:**
```javascript
// Process independent transformations in parallel
async function transformStage(context) {
  const transformed = await Promise.all(
    context.files.map(async file => {
      file.frontmatter = transformFrontmatter(file);
      return file;
    })
  );
  
  context.files = transformed;
  return context;
}
```

**When to use:**
- ✅ Independent transformations
- ✅ I/O-bound operations
- ❌ NOT for this project (42 files = fast enough serially)

**2. Skip unchanged files:**
```javascript
// Already covered in "Idempotency" section
if (needsUpdate(sourcePath, targetPath)) {
  await writeFile(targetPath, content);
}
```

**When to use:**
- ✅ Re-running installer on existing installation
- ✅ Incremental updates
- ✅ Large file counts

### Recommended Pipeline Flow

**Full pipeline for this project:**

```javascript
// bin/lib/pipeline/index.js
const { PipelineContext } = require('./context');
const { readStage } = require('./stages/read-stage');
const { parseStage } = require('./stages/parse-stage');
const { transformStage } = require('./stages/transform-stage');
const { validateStage } = require('./stages/validate-stage');
const { generateStage } = require('./stages/generate-stage');
const { writeStage } = require('./stages/write-stage');
const { rollbackStage } = require('./stages/rollback-stage');

async function runPipeline(config, options = {}) {
  const context = new PipelineContext(config);
  
  try {
    // Stage 1: Read source files
    await readStage(context);
    console.log(`✓ Read ${context.getFileCount()} files`);
    
    // Stage 2: Parse YAML frontmatter
    await parseStage(context);
    console.log(`✓ Parsed frontmatter`);
    
    // Stage 3: Transform frontmatter
    await transformStage(context);
    console.log(`✓ Transformed frontmatter`);
    
    // Stage 4: Validate
    await validateStage(context);
    if (context.hasErrors()) {
      console.error(`✗ Validation failed with ${context.errors.length} errors`);
      context.errors.forEach(err => console.error(`  ${err}`));
      throw new PipelineError('validation', 'Validation failed');
    }
    console.log(`✓ Validated`);
    
    // Stage 5: Generate metadata files
    await generateStage(context);
    console.log(`✓ Generated metadata`);
    
    // Stage 6: Write to target (atomic)
    if (options.dryRun) {
      console.log(`Dry run - would write ${context.files.length} files`);
    } else {
      await writeStage(context);
      console.log(`✓ Installed to ${context.targetPath}`);
    }
    
    return context;
    
  } catch (err) {
    console.error(`✗ Pipeline failed at stage: ${err.stage || 'unknown'}`);
    await rollbackStage(context);
    throw err;
  }
}

module.exports = { runPipeline, PipelineContext };
```

**Stage implementations:**

```javascript
// bin/lib/pipeline/stages/read-stage.js
const fs = require('fs').promises;
const path = require('path');

async function readStage(context) {
  const { sourcePath } = context;
  
  // Read skills
  const skillsPath = path.join(sourcePath, '.github/skills');
  const skillFiles = await fs.readdir(skillsPath);
  
  for (const file of skillFiles) {
    if (!file.endsWith('.md')) continue;
    
    const filePath = path.join(skillsPath, file);
    const content = await fs.readFile(filePath, 'utf8');
    
    context.addFile({
      type: 'skill',
      path: filePath,
      relativePath: `skills/${file}`,
      content,
      frontmatter: null // Parsed in next stage
    });
  }
  
  // Read agents
  const agentsPath = path.join(sourcePath, '.github/agents');
  const agentFiles = await fs.readdir(agentsPath);
  
  for (const file of agentFiles) {
    if (!file.endsWith('.md')) continue;
    
    const filePath = path.join(agentsPath, file);
    const content = await fs.readFile(filePath, 'utf8');
    
    context.addFile({
      type: 'agent',
      path: filePath,
      relativePath: `agents/${file}`,
      content,
      frontmatter: null
    });
  }
  
  return context;
}

module.exports = { readStage };
```

```javascript
// bin/lib/pipeline/stages/parse-stage.js
const matter = require('gray-matter');
const { ParseError } = require('../../errors');

async function parseStage(context) {
  for (const file of context.files) {
    try {
      const parsed = matter(file.content);
      file.frontmatter = parsed.data;
      file.markdown = parsed.content;
    } catch (err) {
      context.addError(new ParseError(
        file.path,
        'Failed to parse YAML frontmatter',
        err
      ));
    }
  }
  
  // Fail-fast if any parse errors
  if (context.hasErrors()) {
    throw new PipelineError('parse', 'Failed to parse frontmatter');
  }
  
  return context;
}

module.exports = { parseStage };
```

```javascript
// bin/lib/pipeline/stages/transform-stage.js
const { transformSkillFrontmatter } = require('../../transformers/skill-transformer');
const { transformAgentFrontmatter } = require('../../transformers/agent-transformer');

async function transformStage(context) {
  for (const file of context.files) {
    try {
      if (file.type === 'skill') {
        file.frontmatter = transformSkillFrontmatter(file.frontmatter);
      } else if (file.type === 'agent') {
        file.frontmatter = transformAgentFrontmatter(file.frontmatter);
      }
    } catch (err) {
      context.addError(new TransformError(file.path, err.message, err));
    }
  }
  
  return context;
}

module.exports = { transformStage };
```

### Sources & References

**Pipeline Architecture:**
- Functional programming patterns: https://mostly-adequate.gitbook.io/mostly-adequate-guide/
- ETL patterns: https://martinfowler.com/articles/data-monolith-to-mesh.html

**Frontmatter Parsing:**
- **gray-matter:** https://github.com/jonschlinkert/gray-matter (RECOMMENDED)
- NPM stats: https://npmtrends.com/gray-matter

**Validation:**
- **joi:** https://joi.dev/api/ (Schema validation)
- NPM: https://www.npmjs.com/package/joi

**Testing:**
- Jest snapshots: https://jestjs.io/docs/snapshot-testing
- Golden files pattern: https://ro-che.info/articles/2017-12-04-golden-tests

**Atomic Operations:**
- Node.js fs.rename: https://nodejs.org/api/fs.html#fs_fs_rename_oldpath_newpath_callback
- Atomic file operations: https://rcoh.me/posts/atomic-rsync/

---

## 5. Phase 1 Migration Architecture (Temporary)

**Confidence: HIGH** (Based on database migration patterns, codemod tools, and ETL best practices)

### Problem Statement

Phase 1 is a **ONE-TIME MIGRATION** that:
1. Reads from `.github/skills/` and `.github/agents/`
2. Parses YAML frontmatter
3. Applies corrections (remove fields, rename `tools` → `allowed-tools`, etc.)
4. Generates `version.json` files
5. Writes to `/templates/` with `{{VARIABLES}}`
6. Validates output
7. Reports results
8. **CRITICAL:** This code is DELETED after successful migration

**Key architectural challenge:** Should migration code reuse permanent installation components, or be completely separate?

### Research: Architectural Patterns

#### Pattern 1: Complete Separation (Database Migration Pattern)

**How database migrations work:**
- Migration files are SEPARATE from application code
- Each migration is self-contained, versioned, immutable
- Application uses ORM (permanent), migrations use raw SQL (temporary)
- Migrations NEVER reuse application code

**Rationale:**
1. Application code changes over time
2. Migrations must be idempotent and reproducible forever
3. Different concerns (one-time transformation vs ongoing operations)
4. No coupling risk

**Applied to our project:**
```
/bin/migrate/              # Temporary, entire directory deleted after success
├── index.js               # Migration orchestrator
├── readers/               # Read .github/ YAML
├── transformers/          # Apply corrections
├── writers/               # Write to /templates/
└── validators/            # Validate migration output

/bin/lib/                  # Permanent installation code
├── templates/             # Template loading
├── rendering/             # Variable rendering
├── install/               # Installation orchestrator
└── ...                    # Other permanent modules
```

**Pros:**
- ✅ Complete isolation (zero coupling risk)
- ✅ Easy to delete (entire `/bin/migrate/` directory)
- ✅ No chance migration concerns leak into permanent code
- ✅ Clear "this is temporary" signal

**Cons:**
- ❌ Code duplication (file operations, validation logic)
- ❌ More code to write and test
- ❌ Can't reuse validated components

#### Pattern 2: Shared Utilities (Package Manager Pattern)

**How package managers work:**
- `npm install` vs `npm publish` share SAME core utilities
- Different command handlers for different workflows
- Shared low-level operations (registry client, file operations, JSON parsing)

**Rationale:**
1. File operations are file operations (shared)
2. Install vs publish have different workflows (separate)
3. Core abstractions are stable enough to share

**Applied to our project:**
```
/bin/lib/
├── core/                  # SHARED utilities (permanent)
│   ├── file-ops.js        # Read, write, copy files
│   ├── yaml-parser.js     # Parse YAML frontmatter
│   └── validator.js       # Validation utilities
│
├── pipelines/
│   ├── migrate.js         # TEMPORARY migration pipeline (deleted after)
│   └── install.js         # PERMANENT installation pipeline
│
└── [other permanent modules]
```

**Pros:**
- ✅ Reuse low-level utilities (less duplication)
- ✅ Utilities are stable, safe to share
- ✅ Less code to write overall

**Cons:**
- ❌ Harder to delete (need to identify what's temporary)
- ❌ Risk of migration concerns leaking into utilities
- ❌ Utilities might evolve, breaking migration

#### Pattern 3: Stage-Based Composition (ETL Pattern) ⭐ **RECOMMENDED**

**How ETL pipelines work:**
- Extract, Transform, Load are separate, composable stages
- Each stage is pure function with clear input/output contract
- Orchestrator connects stages into pipelines
- Different pipelines compose same stages differently

**Rationale:**
1. Stages are pure, reusable primitives
2. Pipelines are compositions (migration vs installation)
3. Maximum reuse with clear separation
4. Stages can be tested independently

**Applied to our project:**

```
/bin/lib/
├── stages/                         # PERMANENT, reusable stages
│   ├── read/
│   │   ├── from-yaml.js           # Read .github/ YAML files
│   │   └── from-template.js       # Read /templates/ files
│   │
│   ├── parse/
│   │   ├── yaml-frontmatter.js    # Parse YAML frontmatter
│   │   └── detect-variables.js    # Find {{VARIABLES}} in templates
│   │
│   ├── transform/
│   │   ├── remove-fields.js       # Remove unwanted fields
│   │   ├── rename-fields.js       # Rename fields (tools → allowed-tools)
│   │   ├── add-variables.js       # Add {{VARIABLES}} to content
│   │   └── render-variables.js    # Render {{VARIABLES}} to values
│   │
│   ├── validate/
│   │   ├── check-frontmatter.js   # Validate frontmatter schema
│   │   └── check-files.js         # Validate file structure
│   │
│   ├── write/
│   │   ├── to-directory.js        # Write files to directory
│   │   └── with-backup.js         # Write with backup/rollback
│   │
│   └── report/
│       ├── migration-report.js    # Generate migration report
│       └── install-report.js      # Generate installation report
│
├── pipelines/
│   └── migrate.js                 # TEMPORARY migration pipeline (deleted after)
│
└── install/
    └── index.js                   # PERMANENT installation orchestrator
```

**Migration Pipeline (Temporary):**
```javascript
// /bin/pipelines/migrate.js - DELETED AFTER MIGRATION
import { readFromYaml } from '../lib/stages/read/from-yaml.js'
import { parseFrontmatter } from '../lib/stages/parse/yaml-frontmatter.js'
import { removeFields, renameFields, addVariables } from '../lib/stages/transform/index.js'
import { checkFrontmatter } from '../lib/stages/validate/check-frontmatter.js'
import { toDirectory } from '../lib/stages/write/to-directory.js'
import { migrationReport } from '../lib/stages/report/migration-report.js'

export async function migrate() {
  // Pipeline: .github/ → /templates/
  
  // 1. Read source files
  const skills = await readFromYaml('.github/skills/')
  const agents = await readFromYaml('.github/agents/')
  
  // 2. Parse frontmatter
  const parsed = [...skills, ...agents].map(parseFrontmatter)
  
  // 3. Apply transformations
  const transformed = parsed
    .map(removeFields(['unwantedField', 'anotherOldField']))
    .map(renameFields({ tools: 'allowed-tools' }))
    .map(addVariables())  // Add {{PLATFORM_ROOT}}, etc.
  
  // 4. Validate
  const validated = transformed.map(checkFrontmatter)
  
  // 5. Write to /templates/
  await toDirectory('/templates/', validated)
  
  // 6. Report
  return migrationReport(validated)
}
```

**Installation Pipeline (Permanent):**
```javascript
// /bin/lib/install/index.js - PERMANENT
import { readFromTemplate } from '../stages/read/from-template.js'
import { detectVariables } from '../stages/parse/detect-variables.js'
import { renderVariables } from '../stages/transform/render-variables.js'
import { checkFiles } from '../stages/validate/check-files.js'
import { toDirectory } from '../stages/write/to-directory.js'
import { installReport } from '../stages/report/install-report.js'

export async function install(templateId, targetDir, variables) {
  // Pipeline: /templates/ → target directory
  
  // 1. Read template
  const template = await readFromTemplate(templateId)
  
  // 2. Detect variables
  const vars = detectVariables(template)
  
  // 3. Render variables
  const rendered = renderVariables(template, variables)
  
  // 4. Validate
  const validated = checkFiles(rendered)
  
  // 5. Write to target
  await toDirectory(targetDir, validated)
  
  // 6. Report
  return installReport(validated)
}
```

**What Gets Deleted:**
```bash
# After migration succeeds, delete:
rm /bin/pipelines/migrate.js

# What stays (PERMANENT):
/bin/lib/stages/          # All stages - reused by installation
/bin/lib/install/         # Installation orchestrator
```

**Pros:**
- ✅ Maximum reuse of validated components
- ✅ Clear separation (pipeline vs stages)
- ✅ Easy to test (stages are pure functions)
- ✅ Installation reuses battle-tested stages
- ✅ Only delete pipeline file (stages stay)
- ✅ Stages have no migration-specific logic

**Cons:**
- ❌ Requires designing good stage contracts upfront
- ❌ More upfront architecture work

### Recommendation: Stage-Based Composition (Pattern 3)

**Why this is best for our project:**

1. **Reuse with safety:** Migration validates stages that installation will use
2. **Easy deletion:** Only `/bin/pipelines/migrate.js` needs deletion
3. **Pure stages:** No side effects, no coupling, fully testable
4. **Battle-tested:** Migration validates stages before installation uses them
5. **Clear contracts:** Each stage has clear input/output

**Stage Contract Pattern:**

```javascript
// All stages follow this contract:

/**
 * Stage function contract
 * @param {StageInput} input - Data from previous stage
 * @param {Object} config - Configuration options
 * @returns {StageOutput | Promise<StageOutput>} - Data for next stage
 * @throws {StageError} - If stage fails
 */

// Example: read stage
export async function readFromYaml(path, config = {}) {
  // Input: file path
  // Output: array of file objects
  return [{ path: '...', content: '...' }]
}

// Example: transform stage
export function renameFields(data, mapping, config = {}) {
  // Input: data object, field mapping
  // Output: transformed data object
  return { ...data, newField: data.oldField }
}

// Example: validate stage
export function checkFrontmatter(data, schema, config = {}) {
  // Input: data object, schema
  // Output: data object (unchanged) or throws
  // Side effect: throws ValidationError if invalid
  if (!isValid(data, schema)) {
    throw new ValidationError('Invalid frontmatter')
  }
  return data
}
```

### Validation Strategy

**Critical:** Must validate migration success before deleting code.

**Validation Checklist:**

```javascript
// /bin/validate-migration.js
async function validateMigration() {
  const checks = [
    // 1. All source files migrated
    checkAllFilesMigrated('.github/', '/templates/'),
    
    // 2. Frontmatter corrections applied
    checkFrontmatterCorrect('/templates/'),
    
    // 3. Variables added correctly
    checkVariablesPresent('/templates/'),
    
    // 4. File structure correct
    checkDirectoryStructure('/templates/'),
    
    // 5. Installation pipeline works on migrated templates
    testInstallationPipeline('/templates/skills/test-skill'),
    
    // 6. Manual spot-checks
    generateSpotCheckReport('/templates/')
  ]
  
  const results = await Promise.all(checks)
  
  if (results.every(r => r.passed)) {
    console.log('✅ Migration validated. Safe to delete /bin/pipelines/migrate.js')
    return true
  } else {
    console.error('❌ Migration validation failed')
    console.error(results.filter(r => !r.passed))
    return false
  }
}
```

**Validation steps:**

1. **Automated checks:**
   - File count matches (29 skills + 13 agents = 42 files)
   - All frontmatter fields renamed correctly
   - All `{{VARIABLES}}` present where expected
   - No `tools` field (should be `allowed-tools`)
   - All `version.json` files generated

2. **Test installation:**
   - Run installation pipeline on migrated templates
   - Verify installation completes without errors
   - Validate installed files match expected structure

3. **Manual review:**
   - Spot-check 3-5 templates for correctness
   - Verify complex cases handled correctly
   - Generate diff report for review

4. **Generate migration report:**
   - Summary of changes
   - List of transformed files
   - Any warnings or edge cases

**Only after ALL validations pass:** Delete `/bin/pipelines/migrate.js`

### Rollback Strategy

**If migration fails partway:**

1. **Git protection:**
   - Migration writes to NEW directory `/templates/`
   - Original `.github/` unchanged
   - If failure → `git clean -fd` removes `/templates/`

2. **Atomic migration:**
   - Write to `/templates-temp/` first
   - Validate output
   - Atomic rename: `/templates-temp/` → `/templates/`
   - If validation fails → delete `/templates-temp/`, no harm

3. **Idempotent migration:**
   - Safe to re-run migration
   - Same input → same output
   - Deterministic transformations

**Rollback procedure:**
```bash
# If migration fails or output is wrong:
rm -rf /templates/        # Remove bad output
git status                # Confirm .github/ unchanged
npm run migrate           # Re-run migration
```

### Migration Execution Plan

**Phase 1 execution:**

```bash
# 1. Run migration
npm run migrate

# 2. Validate output
npm run validate-migration

# 3. Review migration report
cat .planning/migration-report.md

# 4. Spot-check templates
code /templates/skills/gsd-research.md

# 5. Test installation on migrated template
npm run install -- --template=gsd-research --platform=claude-desktop

# 6. If all checks pass, delete migration pipeline
git rm /bin/pipelines/migrate.js
git commit -m "Phase 1 complete: Delete migration pipeline"
```

---

## 6. Phase 2+ Installation Architecture (Permanent)

**Confidence: HIGH** (Based on package manager patterns, template systems, and installation tool best practices)

### Problem Statement

Phase 2+ is the **PERMANENT INSTALLATION PIPELINE** that:
1. Reads from `/templates/` (NOT `.github/`)
2. Renders `{{VARIABLES}}` to actual values
3. Copies to target directory
4. **NO conversion logic** (templates already correct)
5. Runs forever as the main installer

**Key architectural principles:**
- Clean, maintainable architecture
- No migration concerns
- Platform adapters for cross-platform support
- Clear component boundaries

### Component Architecture

**Recommended structure:**

```
/bin/lib/
├── stages/                      # Pure, reusable stages (from migration)
│   ├── read/
│   ├── parse/
│   ├── transform/
│   ├── validate/
│   ├── write/
│   └── report/
│
├── install/                     # Installation orchestrator
│   ├── index.js                 # Main entry point
│   ├── pipeline.js              # Pipeline composition
│   └── config.js                # Installation configuration
│
├── platforms/                   # Platform adapters
│   ├── index.js                 # Platform detection
│   ├── claude-desktop.js        # Claude Desktop platform
│   ├── claude-cli.js            # Claude CLI platform (future)
│   ├── github-cli.js            # GitHub CLI platform (future)
│   └── base.js                  # Base platform interface
│
├── templates/                   # Template management
│   ├── index.js                 # Public API
│   ├── loader.js                # Load templates from /templates/
│   ├── registry.js              # Template registry (catalog)
│   └── validator.js             # Template validation
│
├── rendering/                   # Variable rendering
│   ├── index.js                 # Public API
│   ├── engine.js                # Template engine (mustache)
│   ├── variables.js             # Variable resolution
│   └── filters.js               # Custom filters (optional)
│
├── prompts/                     # Interactive CLI
│   ├── index.js                 # Public API
│   ├── platform-select.js       # Platform selection
│   ├── template-select.js       # Template selection
│   └── confirm.js               # Confirmation prompts
│
└── errors/                      # Error handling
    ├── index.js                 # Public API
    ├── install-error.js         # Installation errors
    └── validation-error.js      # Validation errors
```

### Component Boundaries

**1. Installation Orchestrator (`/bin/lib/install/`)**

**Responsibility:** Coordinate installation pipeline

**Public API:**
```javascript
// /bin/lib/install/index.js
export async function install(options) {
  // options: { template, platform, variables, targetDir }
  const pipeline = createPipeline(options)
  return await pipeline.run()
}
```

**Does NOT:**
- ❌ Know about .github/ (migration concern)
- ❌ Do field transformations (conversion concern)
- ❌ Have migration-specific logic

**Does:**
- ✅ Compose stages into installation pipeline
- ✅ Handle installation configuration
- ✅ Coordinate platform adapters

---

**2. Platform Adapters (`/bin/lib/platforms/`)**

**Responsibility:** Provide platform-specific configuration

**Interface:**
```javascript
// /bin/lib/platforms/base.js
class Platform {
  get name() { return 'platform-name' }
  get installDir() { return '/path/to/install' }
  get configFile() { return '/path/to/config' }
  
  async detect() {
    // Return true if this platform is present
  }
  
  getVariables() {
    // Return platform-specific variables
    return {
      PLATFORM_ROOT: this.installDir,
      PLATFORM_NAME: this.name
    }
  }
}
```

**Example:**
```javascript
// /bin/lib/platforms/claude-desktop.js
export class ClaudeDesktopPlatform extends Platform {
  get name() { return 'claude-desktop' }
  
  get installDir() {
    // Platform-specific logic
    if (process.platform === 'darwin') {
      return path.join(os.homedir(), 'Library/Application Support/Claude')
    } else if (process.platform === 'win32') {
      return path.join(os.homedir(), 'AppData/Roaming/Claude')
    } else {
      return path.join(os.homedir(), '.config/claude')
    }
  }
  
  async detect() {
    return fs.existsSync(this.installDir)
  }
  
  getVariables() {
    return {
      PLATFORM_ROOT: path.join(this.installDir, '.claude'),
      PLATFORM_NAME: 'claude-desktop',
      SKILLS_DIR: path.join(this.installDir, '.claude/skills'),
      AGENTS_DIR: path.join(this.installDir, '.claude/agents')
    }
  }
}
```

**When to introduce platform adapters:**

- ✅ **Phase 2:** Basic platform detection (hardcode Claude Desktop paths)
- ✅ **Phase 3:** Full platform adapter pattern (prepare for multiple platforms)
- ✅ **Phase 4+:** Add new platforms (claude-cli, github-cli)

**Don't over-engineer in Phase 2:** Start simple, refactor when adding second platform.

---

**3. Template Management (`/bin/lib/templates/`)**

**Responsibility:** Load, validate, catalog templates

**Public API:**
```javascript
// /bin/lib/templates/index.js
export async function loadTemplate(templateId) {
  // Load template from /templates/skills/ or /templates/agents/
  return {
    id: 'template-id',
    type: 'skill' | 'agent',
    files: [{ path: '...', content: '...' }],
    metadata: { version: '...', dependencies: [...] }
  }
}

export async function listTemplates() {
  // Return catalog of available templates
  return [
    { id: 'skill-1', name: 'Research Skill', type: 'skill' },
    { id: 'agent-1', name: 'Orchestrator', type: 'agent' }
  ]
}

export async function validateTemplate(template) {
  // Validate template structure and frontmatter
}
```

**Internal:**
```javascript
// /bin/lib/templates/loader.js - Template loading logic
// /bin/lib/templates/registry.js - Template catalog/index
// /bin/lib/templates/validator.js - Template validation
```

---

**4. Variable Rendering (`/bin/lib/rendering/`)**

**Responsibility:** Render `{{VARIABLES}}` in templates

**Public API:**
```javascript
// /bin/lib/rendering/index.js
export async function render(template, variables) {
  // Render all {{VARIABLES}} in template files
  return {
    ...template,
    files: template.files.map(file => ({
      ...file,
      content: renderContent(file.content, variables)
    }))
  }
}
```

**Internal:**
```javascript
// /bin/lib/rendering/engine.js - Mustache wrapper
// /bin/lib/rendering/variables.js - Variable resolution
// /bin/lib/rendering/filters.js - Custom filters (optional)
```

**Example:**
```javascript
// Input template:
import { workflow } from '{{PLATFORM_ROOT}}/core/workflow.js'

// Variables:
{ PLATFORM_ROOT: '.claude/get-shit-done' }

// Output:
import { workflow } from '.claude/get-shit-done/core/workflow.js'
```

---

**5. Interactive CLI (`/bin/lib/prompts/`)**

**Responsibility:** Interactive prompts for installation

**Public API:**
```javascript
// /bin/lib/prompts/index.js
export async function promptForInstallation() {
  const platform = await selectPlatform()
  const template = await selectTemplate()
  const confirm = await confirmInstallation({ platform, template })
  
  return { platform, template, confirmed: confirm }
}
```

**Internal:**
```javascript
// /bin/lib/prompts/platform-select.js
import * as clack from '@clack/prompts'

export async function selectPlatform() {
  return await clack.select({
    message: 'Select installation platform:',
    options: [
      { value: 'claude-desktop', label: 'Claude Desktop' },
      { value: 'claude-cli', label: 'Claude CLI (coming soon)', disabled: true },
      { value: 'github-cli', label: 'GitHub CLI (coming soon)', disabled: true }
    ]
  })
}
```

---

### Installation Pipeline Flow

**Complete installation flow:**

```javascript
// /bin/lib/install/pipeline.js
import { detectPlatform } from '../platforms/index.js'
import { loadTemplate } from '../templates/index.js'
import { render } from '../rendering/index.js'
import { writeFiles } from '../stages/write/to-directory.js'
import { validateInstallation } from '../stages/validate/check-files.js'

export async function runInstallation(options) {
  // 1. Detect or select platform
  const platform = options.platform || await detectPlatform()
  const platformAdapter = getPlatformAdapter(platform)
  
  // 2. Load template
  const template = await loadTemplate(options.template)
  
  // 3. Get platform variables
  const variables = {
    ...platformAdapter.getVariables(),
    ...options.variables
  }
  
  // 4. Render template
  const rendered = await render(template, variables)
  
  // 5. Validate
  await validateInstallation(rendered)
  
  // 6. Write to target directory
  const targetDir = options.targetDir || platformAdapter.installDir
  await writeFiles(targetDir, rendered.files)
  
  // 7. Report success
  return {
    success: true,
    template: template.id,
    platform: platform,
    installedTo: targetDir
  }
}
```

**Key differences from migration:**
- ✅ Reads from `/templates/` (not `.github/`)
- ✅ Renders variables (no field transformations)
- ✅ Platform-aware (uses platform adapters)
- ✅ Interactive mode (prompts for user input)
- ✅ NO conversion logic (templates already correct)

### Separation of Concerns

**What installation DOES:**
- Load templates from `/templates/`
- Render `{{VARIABLES}}` to values
- Detect/select platform
- Copy files to target directory
- Validate installation

**What installation DOES NOT:**
- ❌ Read from `.github/` (migration concern)
- ❌ Transform frontmatter fields (conversion concern)
- ❌ Know about migration-specific corrections
- ❌ Handle legacy formats

**Clean boundary:** Installation assumes templates are already correct.

### When to Introduce Complexity

**Phase 2 (MVP):**
- ✅ Simple platform detection (hardcode Claude Desktop)
- ✅ Basic template loading (no registry)
- ✅ Simple variable rendering (mustache)
- ✅ Direct file copying (no fancy features)

**Phase 3 (Platform Support):**
- ✅ Platform adapter pattern
- ✅ Multiple platform support
- ✅ Platform-specific configuration

**Phase 4+ (Advanced Features):**
- ✅ Template registry/catalog
- ✅ Dependency management
- ✅ Version management
- ✅ Update mechanism

**Don't over-engineer Phase 2.** Start simple, refactor when adding complexity.

### Testing Strategy

**Unit tests (stages):**
```javascript
// test/stages/render.test.js
test('renders {{PLATFORM_ROOT}} variable', () => {
  const content = 'import x from "{{PLATFORM_ROOT}}/core.js"'
  const variables = { PLATFORM_ROOT: '.claude' }
  const result = renderVariables(content, variables)
  expect(result).toBe('import x from ".claude/core.js"')
})
```

**Integration tests (pipeline):**
```javascript
// test/install/pipeline.test.js
test('installs template to target directory', async () => {
  const result = await runInstallation({
    template: 'test-skill',
    platform: 'claude-desktop',
    targetDir: '/tmp/test-install'
  })
  
  expect(result.success).toBe(true)
  expect(fs.existsSync('/tmp/test-install/skill.md')).toBe(true)
})
```

**E2E tests (full installation):**
```javascript
// test/e2e/install.test.js
test('full installation flow', async () => {
  // 1. Load template
  // 2. Render variables
  // 3. Install to temp directory
  // 4. Validate installed files
  // 5. Cleanup
})
```

---

## 7. Migration vs Installation: Architecture Decision

### Final Recommendation: Stage-Based with Clear Boundaries

**Structure:**

```
/bin/
├── lib/
│   ├── stages/              # PERMANENT: Pure, reusable stages
│   │   ├── read/
│   │   ├── parse/
│   │   ├── transform/
│   │   ├── validate/
│   │   ├── write/
│   │   └── report/
│   │
│   ├── install/             # PERMANENT: Installation orchestrator
│   ├── platforms/           # PERMANENT: Platform adapters
│   ├── templates/           # PERMANENT: Template management
│   ├── rendering/           # PERMANENT: Variable rendering
│   ├── prompts/             # PERMANENT: Interactive CLI
│   └── errors/              # PERMANENT: Error handling
│
└── pipelines/
    └── migrate.js           # TEMPORARY: Migration pipeline (deleted after Phase 1)
```

**Key decisions:**

1. **Shared stages, separate pipelines:** Migration and installation share pure stages, but have different orchestration
2. **Easy deletion:** Only `/bin/pipelines/migrate.js` deleted after Phase 1
3. **No coupling:** Installation has no migration-specific logic
4. **Battle-tested stages:** Migration validates stages that installation will use
5. **Clean boundaries:** Clear separation between temporary and permanent code

**Phase 1 (Migration):**
- Compose stages: `readFromYaml → parse → transform → validate → write → report`
- Orchestrator: `/bin/pipelines/migrate.js` (temporary)
- After success: Delete `/bin/pipelines/migrate.js`

**Phase 2+ (Installation):**
- Compose stages: `readFromTemplate → parse → render → validate → write → report`
- Orchestrator: `/bin/lib/install/` (permanent)
- Uses same stages (already validated by migration)

### Validation Before Deletion

**Checklist before deleting migration code:**

- [ ] All 42 files migrated (29 skills + 13 agents)
- [ ] Frontmatter corrections applied correctly
- [ ] `{{VARIABLES}}` present in all templates
- [ ] No `tools` field (renamed to `allowed-tools`)
- [ ] All `version.json` files generated
- [ ] Installation pipeline works on migrated templates
- [ ] Manual spot-check of 3-5 templates
- [ ] Migration report generated and reviewed
- [ ] Test installation completes successfully

**Only after ALL checks pass:** `git rm /bin/pipelines/migrate.js`

### Build Order Implications

**Phase 1 (Migration):**
1. Build stages (read, parse, transform, validate, write)
2. Build migration pipeline (compose stages)
3. Run migration
4. Validate output
5. Delete migration pipeline

**Phase 2 (Installation):**
1. Reuse stages from Phase 1 (already built and tested)
2. Build installation orchestrator
3. Build platform detection (simple, hardcoded)
4. Build template loading
5. Build variable rendering
6. Compose installation pipeline

**Phase 3+ (Advanced):**
1. Add platform adapters
2. Add template registry
3. Add interactive CLI
4. Add advanced features

**Key insight:** Phase 2 reuses battle-tested stages from Phase 1, reducing risk and effort.

---

## Summary & Recommendations

### Domain-Oriented Module Structure

✅ **Use domain directories:** `platforms/`, `templates/`, `rendering/`, `paths/`, `io/`, `prompts/`, `validation/`  
✅ **Public API via index.js:** Hide implementation details, expose clean APIs  
✅ **Single Responsibility Principle:** Each module handles one domain area  
✅ **Dependency direction:** High-level → Low-level, no circular dependencies

### Path Rewriting

✅ **Use hybrid approach:**
- Template variables (`{{INSTALL_DIR}}`) for file content
- Path aliases (`@install`) for import paths

✅ **Recommended library:** `mustache` (v4.2.0) for template rendering  
✅ **Validation:** Check for unresolved variables, invalid characters  
✅ **Cross-platform:** Forward slashes in templates, normalize on write

### Interactive CLI

✅ **Use @clack/prompts (v0.11.0):** Modern UI, built-in spinners, disabled options  
✅ **Pattern:** No flags = interactive mode, flags = non-interactive mode  
✅ **Progress:** Sequential spinners for multi-step installations  
✅ **UX:** Show "coming soon" options with `disabled: true`, handle Ctrl+C gracefully

### Transformation Pipeline Architecture

✅ **Use functional pipeline pattern:** `read → parse → transform → validate → generate → write`  
✅ **Context object:** Pass `PipelineContext` through all stages  
✅ **I/O at edges only:** Only `readers/` and `writers/` touch filesystem  
✅ **Pure transformers:** All transformation logic is pure (no side effects)  

✅ **Module structure:**
```
pipeline/          # Orchestrator
readers/           # Read & parse frontmatter
transformers/      # Pure transformation functions
validators/        # Schema & reference validation
generators/        # Metadata generation
writers/           # Atomic file operations
errors/            # Custom error types
```

✅ **Frontmatter parsing:** Use `gray-matter` (v4.2.3) - industry standard  
✅ **Schema validation:** Use `joi` (v17.x) for comprehensive validation  
✅ **Error handling:** Fail-fast for critical, collect-and-report for validation  
✅ **Atomic operations:** Write to temp directory, atomic move to target  
✅ **Idempotency:** Pure transformations, deterministic output, checksum-based skips  
✅ **Testing:** Unit (transformers), integration (stages), snapshot (complex), golden (E2E)

### Phase 1 Migration Architecture (Temporary)

✅ **Use Stage-Based Composition (ETL Pattern):** Shared stages, separate pipelines  
✅ **Structure:**
```
/bin/lib/stages/       # PERMANENT: Pure, reusable stages
/bin/pipelines/        # TEMPORARY: Migration pipeline (deleted after Phase 1)
  └── migrate.js       # Delete this file after successful migration
```

✅ **Migration pipeline composes stages:** `readFromYaml → parse → transform → validate → write → report`  
✅ **Validation checklist before deletion:**
- All 42 files migrated (29 skills + 13 agents)
- Frontmatter corrections applied
- `{{VARIABLES}}` present
- Test installation on migrated templates
- Manual spot-check

✅ **Rollback strategy:**
- Migration writes to NEW `/templates/` directory
- Original `.github/` unchanged (git protection)
- If failure → delete `/templates/`, re-run

✅ **What gets deleted:** Only `/bin/pipelines/migrate.js` (stages stay, reused by installation)

### Phase 2+ Installation Architecture (Permanent)

✅ **Reuse validated stages from Phase 1:** Same stages, different composition  
✅ **Installation pipeline composes stages:** `readFromTemplate → parse → render → validate → write → report`  
✅ **Component boundaries:**
```
install/          # Installation orchestrator
platforms/        # Platform adapters (claude-desktop, claude-cli, github-cli)
templates/        # Template loading and registry
rendering/        # Variable rendering ({{VARIABLES}} → values)
prompts/          # Interactive CLI
```

✅ **No migration logic:** Installation assumes templates are already correct  
✅ **Platform adapters:** Provide platform-specific configuration and variables  
✅ **When to introduce:**
- Phase 2: Simple platform detection (hardcode paths)
- Phase 3: Full platform adapter pattern
- Phase 4+: Multiple platforms

✅ **Clean separation:** Installation reads from `/templates/` only (never `.github/`)

### Architecture Decision: Stage-Based with Clear Boundaries

**Key decisions:**
1. ✅ **Shared stages, separate pipelines:** Maximum reuse with clear separation
2. ✅ **Easy deletion:** Only pipeline file deleted, stages stay
3. ✅ **No coupling:** Installation has zero migration-specific logic
4. ✅ **Battle-tested:** Migration validates stages that installation reuses
5. ✅ **Pure stages:** No side effects, fully testable, reusable

**Build order implications:**
- **Phase 1:** Build stages → migration pipeline → validate → delete pipeline
- **Phase 2:** Reuse stages → installation orchestrator → platform detection → template loading
- **Phase 3+:** Add platform adapters, template registry, advanced features

**Install:**
```bash
npm install @clack/prompts mustache gray-matter joi
```

**Test:**
```bash
npm install -D jest
```

This research provides comprehensive guidance for building a professional, maintainable template-based installer with:
- **Excellent UX** (interactive prompts, progress indicators)
- **Robust architecture** (functional pipeline, clear boundaries)
- **Safe operations** (atomic writes, idempotency, rollback)
- **High confidence** (comprehensive testing, schema validation)
- **Clean migration strategy** (temporary vs permanent code clearly separated)
