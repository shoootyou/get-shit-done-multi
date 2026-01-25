# Domain Architecture & Path Rewriting Research

**Project:** Template-based installer for Skills & Agents  
**Researched:** 2025-01-25  
**Focus:** Domain-oriented architecture, path rewriting, interactive CLI UX

---

## Executive Summary

This research covers three critical architectural areas for the template-based installer:

1. **Domain-Oriented Module Structure** - Organizing `/bin/lib` by responsibility (platforms/, templates/, rendering/) instead of file type
2. **Path Rewriting & Resolution** - Strategies for rewriting template paths like `@.github/...` to target directories
3. **Interactive CLI UX** - Libraries and patterns for "no flags = interactive mode" with progress indicators

**Key Recommendations:**
- Use domain-driven directory structure with explicit public APIs via `index.js`
- Use hybrid path rewriting: template variables (`{{VAR}}`) + path aliases (`@install`)
- Use `@clack/prompts` for interactive CLI with built-in spinners and disabled menu options

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

**Install:**
```bash
npm install @clack/prompts mustache
```

This research provides comprehensive guidance for building a professional, maintainable template-based installer with excellent UX.
