# Coding Conventions

**Analysis Date:** 2026-01-19

## Naming Patterns

**Files:**
- kebab-case: `execute-phase.md`, `git-integration.md`, `gsd-check-update.js`
- All markdown files use `.md` extension
- JavaScript files use `.js` extension (Node.js, no TypeScript)

**Functions:**
- camelCase: `readSettings()`, `writeSettings()`, `replaceClaudePaths()`
- Action-oriented names describing what function does

**Variables:**
- camelCase for local variables: `settingsPath`, `statuslineCommand`, `changelogSrc`
- UPPERCASE with underscores for bash/environment variables: `PHASE_ARG`, `PLAN_START_TIME`, `PLAN_START_EPOCH`
- Descriptive names avoiding abbreviations

**Types:**
- XML tags: kebab-case: `<execution_context>`, `<success_criteria>`, `<required_reading>`
- Attributes: snake_case: `name="load_project_state"`, `priority="first"`
- Type attributes with colons: `type="checkpoint:human-verify"`

## Code Style

**Formatting:**
- No automated formatter configured (no Prettier/ESLint detected)
- 2-space indentation (observed in JavaScript files)
- Unix line endings (LF)

**Linting:**
- No ESLint configuration detected
- Manual code review enforced through project philosophy

## Import Organization

**Order:**
- Built-in Node.js modules first: `fs`, `path`, `os`, `readline`
- Third-party modules (none currently in this codebase)
- Relative imports (not applicable, no modules)

**Path Aliases:**
- Uses relative paths: `path.join(__dirname, '..')`
- Environment-based expansion: `~/.claude/` with `expandTilde()` helper

## Error Handling

**Patterns:**
- Try-catch blocks with empty object fallback for JSON parsing
- Explicit exit codes: `process.exit(1)` for errors, `process.exit(0)` for success
- Early returns for validation failures
- File existence checks before operations: `fs.existsSync(path)`

**Example:**
```javascript
function readSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}
```

## Logging

**Framework:** Native `console` (Node.js)

**Patterns:**
- ANSI color codes for terminal output: `\x1b[36m` (cyan), `\x1b[32m` (green), `\x1b[33m` (yellow)
- Color constants defined at file top: `const cyan = '\x1b[36m'`
- Structured output with symbols: `✓` for success, `✗` for errors, `⚠` for warnings
- Progress indicators during installation
- Silent errors in non-critical paths (statusline JSON parsing)

**Output Structure:**
```javascript
console.log(`  ${green}✓${reset} Installed commands/gsd`);
console.error(`  ${yellow}✗${reset} Failed to install ${description}`);
```

## Comments

**When to Comment:**
- File headers with shebang and purpose: `#!/usr/bin/env node`
- Section explanations for complex logic
- Inline reasoning for non-obvious decisions
- No JSDoc detected in codebase

**Style:**
- Single-line comments: `// Colors`
- Multi-line avoided in favor of clear code

## Function Design

**Size:** Functions are focused, typically 10-30 lines

**Parameters:** 
- Descriptive parameter names
- Functions accept minimal parameters: `readSettings(settingsPath)`
- Helper functions for common operations

**Return Values:** 
- Explicit returns, no implicit undefined
- Objects for multiple values: `return { settingsPath, settings, statuslineCommand }`
- Boolean returns for verification: `verifyInstalled()` returns `true/false`

## Module Design

**Exports:** 
- No exports in current codebase (scripts are entry points)
- Self-contained executables with shebang

**Barrel Files:** 
- Not applicable (no module system)

## Language & Tone (Markdown Files)

**Voice:**
- Imperative: "Execute tasks", "Create file", "Read STATE.md"
- No filler words: Absent "Let me", "Just", "Simply", "Basically"
- No sycophancy: Absent "Great!", "Awesome!", "Excellent!"
- Direct and technical

**Structure:**
- XML tags for semantic structure
- Markdown headers within XML containers
- Progressive disclosure through layers (command → workflow → template → reference)

## File Organization

**Commands:**
- Location: `commands/gsd/*.md`
- YAML frontmatter with name, description, argument-hint, allowed-tools
- Section order: `<objective>`, `<execution_context>`, `<context>`, `<process>`, `<success_criteria>`

**Workflows:**
- Location: `get-shit-done/workflows/*.md`
- No frontmatter
- Common tags: `<purpose>`, `<when_to_use>`, `<required_reading>`, `<process>`, `<step>`

**Templates:**
- Location: `get-shit-done/templates/*.md`
- Variable placeholders: `[Project Name]`, `{phase}-{plan}-PLAN.md`

**References:**
- Location: `get-shit-done/references/*.md`
- Deep-dive documentation on specific concepts

**Agents:**
- Location: `agents/*.md`
- YAML frontmatter with name, description, tools, color
- Role-based structure with specific responsibilities

## Prohibited Patterns

**Enterprise Anti-Patterns:**
- NO story points, sprint ceremonies, RACI matrices
- NO human dev time estimates (days/weeks)
- NO team coordination patterns

**Temporal Language (in implementation docs):**
- DON'T use: "We changed X to Y", "Previously", "No longer"
- DO: Describe current state only
- Exception: CHANGELOG.md, git commits

**Generic XML:**
- DON'T use: `<section>`, `<item>`, `<content>`
- DO use: Semantic tags: `<objective>`, `<verification>`, `<action>`

---

*Convention analysis: 2026-01-19*
