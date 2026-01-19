# Coding Conventions

**Analysis Date:** 2026-01-19

## Naming Patterns

**Files:**
- kebab-case: `execute-phase.md`, `gsd-codebase-mapper.md`, `install.js`
- All GSD agents prefixed: `gsd-*.md`
- All GSD commands prefixed: `gsd:*`

**Directories:**
- kebab-case: `get-shit-done/`, `lib-ghcc/`
- Lowercase: `agents/`, `commands/`, `hooks/`, `templates/`, `workflows/`, `references/`

**Variables (JavaScript):**
- Constants: camelCase for primitive values: `const hasGlobal`, `const cyan`
- Constants: CAPS_UNDERSCORES in bash blocks: `PHASE_ARG`, `CODE_FILES`
- Functions: camelCase: `parseConfigDirArg()`, `expandTilde()`, `readSettings()`

**XML Attributes:**
- XML tags: kebab-case: `<execution_context>`, `<success_criteria>`
- Step names: snake_case: `name="load_project_state"`, `name="execute_tasks"`
- Type attributes: colon separator: `type="checkpoint:human-verify"`, `type="auto"`

## Code Style

**Formatting:**
- No formal formatter detected
- 2-space indentation in JavaScript files: `bin/install.js`, `hooks/*.js`
- Template literals for multi-line strings with color codes

**Linting:**
- No ESLint or other linter configuration detected
- Code follows consistent manual style

## File Structure

**Markdown Documents:**
- Commands use YAML frontmatter with `---` delimiters
- Agents use YAML frontmatter with `---` delimiters
- Workflows: No frontmatter, start with XML `<purpose>` tag
- Templates: Start with `# Template Name` header

**JavaScript:**
- Shebang line: `#!/usr/bin/env node` in executable files
- CommonJS modules: `require()`, `module.exports`
- No ES6 imports/exports

## Import Organization

**JavaScript (Node.js):**
1. Built-in modules first: `fs`, `path`, `os`, `readline`, `child_process`
2. Package imports: `require('../package.json')`
3. No third-party dependencies

**Markdown @ References:**
1. Static references to workflows: `@~/.claude/get-shit-done/workflows/execute-phase.md`
2. Static references to templates: `@~/.claude/get-shit-done/templates/project.md`
3. Static references to references: `@~/.claude/get-shit-done/references/ui-brand.md`
4. Dynamic references: `@.planning/PROJECT.md`, `@.planning/STATE.md`
5. Conditional references: `@.planning/DISCOVERY.md (if exists)`

## XML Structure

**Semantic Container Tags:**
- `<objective>` — Command purpose and goals
- `<execution_context>` — @ references to load
- `<process>` — Implementation steps container
- `<step>` — Individual execution step with `name` attribute
- `<success_criteria>` — Completion checklist
- `<task>` — Executable task with type attribute
- `<role>` — Agent role definition
- `<philosophy>` — Design principles

**Task Structure:**
```xml
<task type="auto">
  <name>Task description</name>
  <files>file1.ts, file2.ts</files>
  <action>Implementation details</action>
  <verify>Verification command</verify>
  <done>Acceptance criteria</done>
</task>
```

**Never use generic XML:**
- ❌ `<section>`, `<item>`, `<content>`, `<subsection>`
- ✅ Semantic tags: `<objective>`, `<action>`, `<verification>`

## Error Handling

**Patterns:**
- Check file existence before operations: `fs.existsSync(path)`
- Try-catch blocks for file operations that may fail
- Early return with error message on validation failures
- Process exit with code 1 on fatal errors: `process.exit(1)`

**Validation:**
- Check command-line arguments before processing
- Verify directory/file creation after operations
- Use dedicated verification functions: `verifyInstalled()`, `verifyFileInstalled()`

## Logging

**Framework:** `console` (native Node.js)

**Patterns:**
- Color codes via ANSI escape sequences: `\x1b[36m` (cyan), `\x1b[32m` (green)
- Named constants for colors: `const cyan = '\x1b[36m'`
- Success: `console.log(green + '✓' + reset + ' message')`
- Error: `console.error(yellow + '✗' + reset + ' message')`
- Info: Plain `console.log()` with optional dim style

**Message Format:**
- Prefix with color-coded symbol: `✓` for success, `✗` for error
- Use template literals with color variables
- Always reset color after message: `${reset}`

## Comments

**When to Comment:**
- Function purpose: JSDoc-style comment before function definitions
- Complex logic explanation: Inline comments explaining "why", not "what"
- Section headers: `// Parse args`, `// Colors`, `// Main`
- TODO/FIXME: Avoided in production code (found only in templates/docs)

**Style:**
- Single-line: `// Comment text`
- Multi-line function docs:
```javascript
/**
 * Function description
 */
```
- XML comments in markdown: `<!-- Comment -->`

## Function Design

**Size:**
- Focused single-purpose functions: 20-50 lines typical
- Larger functions for main install logic: 100+ lines acceptable

**Parameters:**
- Prefer explicit parameters over implicit globals
- Use descriptive names: `settingsPath`, `dirPath`, `description`
- Optional parameters via conditional logic or defaults

**Return Values:**
- Boolean for success/failure: `verifyInstalled()` returns `true/false`
- Objects for complex data: settings objects
- Undefined for side-effect functions: `cleanupOrphanedFiles()`

## Module Design

**Exports:**
- No explicit exports in executable scripts (`bin/install.js`)
- Functions defined inline, not exported

**File Organization:**
- Utility functions at top
- Main execution logic at bottom
- Comments mark major sections

## Language & Tone

**Imperative Voice:**
- ✅ "Execute tasks", "Create file", "Read STATE.md"
- ❌ "Execution is performed", "The file should be created"

**No Filler:**
- Absent: "Let me", "Just", "Simply", "Basically", "I'd be happy to"
- Present: Direct instructions, technical precision

**No Sycophancy:**
- Absent: "Great!", "Awesome!", "Excellent!", "I'd love to help"
- Present: Factual statements, verification results

**No Temporal Language in Implementation:**
- ❌ "We changed X to Y", "Previously", "Instead of"
- ✅ Describe current state only
- Exception: CHANGELOG.md, commit messages

## Commit Conventions

**Format:**
```
{type}({phase}-{plan}): {description}
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `test`: Tests only (TDD RED)
- `refactor`: Code cleanup (TDD REFACTOR)
- `docs`: Documentation/metadata
- `chore`: Config/dependencies

**Rules:**
- One commit per task during execution
- Stage files individually (never `git add .`)
- Capture commit hash for SUMMARY.md
- Include `Co-Authored-By:` line in commit messages

## Markdown Conventions

**Code Blocks:**
- Always specify language: ````bash`, ````xml`, ````javascript`, ````markdown`
- Use bash for shell commands
- Use xml for task structures

**Headers:**
- Use ATX style: `#`, `##`, `###` (not underline style)
- Sentence case: "Core principle" not "Core Principle"
- No trailing punctuation

**Lists:**
- Unordered: hyphen `-` for bullets
- Ordered: `1.`, `2.`, `3.` with periods
- Consistent indentation: 2 spaces for nested items

**Emphasis:**
- Bold for emphasis: `**text**`
- Italic rare, used for examples: `*example*`
- Code for file paths, commands, variables: `` `path/to/file` ``

**File Paths:**
- Always use backticks: `` `bin/install.js` ``, `` `agents/gsd-*.md` ``
- Absolute references: `` `~/.claude/get-shit-done/` ``
- Project-relative: `` `.planning/PROJECT.md` ``

---

*Convention analysis: 2026-01-19*
