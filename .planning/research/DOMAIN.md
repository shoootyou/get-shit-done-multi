# Domain Architecture: npx Installer (NOT a Library)

**Project:** Template-based installer for Skills & Agents  
**Researched:** 2025-01-25  
**Updated:** 2025-01-25 (Corrected Architecture)  
**Focus:** npx installer architecture, Phase 1 migration (DELETED), Phase 2+ installation (permanent)

---

## Executive Summary

This research covers the correct architectural approach for a **greenfield npx installer** (NOT a library):

1. **Phase 1 Migration (DELETED after approval)** - Simple one-time script, ALL code deleted
2. **Phase 2+ Installation (permanent)** - npx installer with `/bin/install.js` + `/lib` helpers
3. **Manual Validation Gate** - Phase 1 PAUSES for manual review before approval
4. **NO Stage Reuse** - Phase 1 and Phase 2+ are COMPLETELY SEPARATE
5. **NO Public API** - Internal helpers only, no exports, no library pattern

**Key Corrections:**

❌ **WRONG:** Shared stages, stage-based composition, reuse patterns  
✅ **RIGHT:** Phase 1 and Phase 2+ are completely separate, NO code reuse

❌ **WRONG:** Public API pattern with `index.js` exports (library pattern)  
✅ **RIGHT:** Internal helpers in `/lib`, entry point is `/bin/install.js` (npx installer)

❌ **WRONG:** Delete only pipeline file, preserve stages  
✅ **RIGHT:** Delete ALL Phase 1 code (`rm -rf scripts/` or equivalent)

❌ **WRONG:** Automatic progression from Phase 1 to Phase 2  
✅ **RIGHT:** Manual validation gate - Phase 1 PAUSES for approval

---

## Critical Architectural Principles

### 1. This is NOT a Library

**What this project IS:**
- **npx installer** - executable script users run via `npx`
- **Entry point:** `/bin/install.js` (executable, `#!/usr/bin/env node`)
- **Internal helpers:** `/lib/platforms/`, `/lib/templates/`, `/lib/io/`
- **NO public exports** - all code is internal implementation

**What this project is NOT:**
- ❌ NOT a library with public API
- ❌ NOT reusable components for other projects
- ❌ NOT `index.js` with exports

**Implications:**
- No need for "public API" abstraction
- No need for `index.js` export files
- Helpers can import from each other directly
- Focus on executable clarity, not reusability

### 2. Phase 1 and Phase 2+ Are Completely Separate

**Phase 1 (Migration):**
- **ONE-TIME SCRIPT** that migrates `.github/` → `/templates/`
- **ALL CODE DELETED** after manual approval
- **NO REUSE** - Phase 2+ does NOT import any Phase 1 code
- **MAY DUPLICATE LOGIC** - that's OK, Phase 1 gets deleted anyway

**Phase 2+ (Installation):**
- **PERMANENT INSTALLER** that installs from `/templates/`
- **Written FRESH** after Phase 1 deletion
- **NO MIGRATION LOGIC** - assumes templates already correct
- **MAY DUPLICATE LOGIC** from Phase 1 - that's fine

**Why separate?**
- **Different concerns:** One-time transformation vs ongoing installation
- **Different lifetimes:** Temporary vs permanent
- **Different constraints:** Migration is complex, installation is simple
- **Clean deletion:** Delete entire Phase 1 directory, no dependencies

### 3. Complete Code Deletion (No Preservation)

**After Phase 1 approval:**
```bash
rm -rf scripts/        # Or whatever Phase 1 directory is
git add -A
git commit -m "Remove Phase 1 migration code"
```

**What gets deleted:**
- ✅ ALL Phase 1 code (entire directory)
- ✅ ALL Phase 1 helpers
- ✅ ALL Phase 1 utilities
- ✅ ALL Phase 1 tests

**What does NOT get deleted:**
- ✅ Generated `/templates/` directory (committed to git)
- ✅ Documentation
- ✅ Phase 2+ code (doesn't exist yet)

**NO preservation:**
- ❌ NO `.archive/` directory
- ❌ NO "emergency recovery" backup
- ❌ NO "keep just in case"
- Migration code lives in git history, that's sufficient

### 4. Manual Validation Gate

**Phase 1 workflow:**
```
1. Generate templates → /templates/
2. Output validation report
3. PAUSE (commit templates to git)
4. Manual review by user
5. User approval required
6. Delete Phase 1 code
7. Proceed to Phase 2
```

**What manual validation checks:**
- All 42 files migrated (29 skills + 13 agents)
- Frontmatter corrections applied
- `{{VARIABLES}}` present and correct
- File structure looks right
- Spot-check content

**Why manual validation?**
- Migration is high-risk, one-way operation
- Automated validation can miss edge cases
- Human review catches unexpected issues
- Explicit approval prevents premature deletion

---

## Phase 1 Migration Architecture (DELETED)

**Confidence: HIGH** (Based on one-time script patterns, codemod tools)

### Problem Statement

Phase 1 is a **ONE-TIME MIGRATION SCRIPT** that:
1. Reads from `.github/skills/` and `.github/agents/`
2. Parses YAML frontmatter
3. Applies corrections (remove fields, rename `tools` → `allowed-tools`, etc.)
4. Generates `version.json` files
5. Writes to `/templates/` with `{{VARIABLES}}`
6. Outputs validation report
7. **PAUSES for manual validation**
8. **ALL CODE DELETED after approval**

### Architectural Question: How Complex?

**The tension:**
- **Too simple:** Becomes unmaintainable spaghetti code
- **Too complex:** Over-engineering code that gets deleted anyway

**Answer:** Keep it simple, but structured.

### Recommended Structure: Simple Modular Script

```
scripts/migrate/           # ALL OF THIS GETS DELETED
├── index.js               # Main script (orchestration)
├── read.js                # Read .github/ YAML files
├── parse.js               # Parse frontmatter
├── transform.js           # Apply corrections
├── write.js               # Write to /templates/
└── validate.js            # Output validation report
```

**Characteristics:**
- ✅ **5-6 files max** - one file per major step
- ✅ **Simple imports** - files import each other directly
- ✅ **Synchronous is fine** - one-time script, performance doesn't matter
- ✅ **Liberal logging** - console.log is your friend
- ✅ **Minimal abstraction** - no complex patterns, just functions

**Anti-patterns to avoid:**
- ❌ NO stage-based architecture (over-engineering)
- ❌ NO reusable components (nothing to reuse after deletion)
- ❌ NO abstract base classes (you ain't gonna need it)
- ❌ NO plugin system (it's a one-time script)

### Example: index.js (Main Script)

```javascript
#!/usr/bin/env node

// scripts/migrate/index.js
import { readSourceFiles } from './read.js'
import { parseYamlFrontmatter } from './parse.js'
import { applyCorrections } from './transform.js'
import { writeTemplates } from './write.js'
import { validateOutput } from './validate.js'

async function migrate() {
  console.log('=== Phase 1: Migration ===\n')
  
  // Read
  console.log('Reading source files...')
  const sourceFiles = await readSourceFiles()
  console.log(`✓ Read ${sourceFiles.length} files\n`)
  
  // Parse
  console.log('Parsing frontmatter...')
  const parsed = parseYamlFrontmatter(sourceFiles)
  console.log(`✓ Parsed ${parsed.length} files\n`)
  
  // Transform
  console.log('Applying corrections...')
  const transformed = applyCorrections(parsed)
  console.log(`✓ Applied corrections to ${transformed.length} files\n`)
  
  // Write
  console.log('Writing templates...')
  await writeTemplates(transformed)
  console.log(`✓ Wrote templates to /templates/\n`)
  
  // Validate
  console.log('Validating output...')
  const report = validateOutput(transformed)
  console.log(report)
  
  console.log('\n=== Migration Complete ===')
  console.log('Next steps:')
  console.log('1. Review /templates/ directory')
  console.log('2. Check validation report above')
  console.log('3. If OK: git add /templates/ && git commit')
  console.log('4. If OK: rm -rf scripts/migrate/')
}

migrate().catch(console.error)
```

### Example: transform.js (Corrections)

```javascript
// scripts/migrate/transform.js

export function applyCorrections(parsedFiles) {
  return parsedFiles.map(file => {
    const corrected = { ...file }
    
    // Remove unwanted fields
    delete corrected.frontmatter.default_enabled
    delete corrected.frontmatter.disabled_reason
    
    // Rename tools → allowed-tools
    if (corrected.frontmatter.tools) {
      corrected.frontmatter.allowed_tools = corrected.frontmatter.tools
      delete corrected.frontmatter.tools
    }
    
    // Add {{INSTALL_DIR}} to content
    corrected.content = corrected.content.replace(
      /\/path\/to\/install/g,
      '{{INSTALL_DIR}}'
    )
    
    return corrected
  })
}
```

**Key points:**
- Simple, straightforward functions
- Easy to understand and debug
- No fancy patterns or abstractions
- Gets deleted anyway, so keep it simple

### Validation Report Format

Output a clear report that humans can review:

```
=== Validation Report ===

Files migrated: 42
- Skills: 29
- Agents: 13

Corrections applied:
- Removed default_enabled: 42 files
- Removed disabled_reason: 12 files
- Renamed tools → allowed-tools: 38 files
- Added {{INSTALL_DIR}}: 25 files

Variables detected:
- {{INSTALL_DIR}}: 25 files
- {{PLATFORM_NAME}}: 42 files
- {{SKILL_NAME}}: 29 files

Warnings:
- None

Errors:
- None

✓ Migration successful
```

### Deletion Checklist

Before deleting Phase 1 code:

- [ ] All 42 files in `/templates/`
- [ ] Frontmatter corrections verified
- [ ] `{{VARIABLES}}` present
- [ ] `version.json` files generated
- [ ] Templates committed to git
- [ ] Manual spot-check passed

**Then delete:**
```bash
rm -rf scripts/migrate/
git add -A
git commit -m "Remove Phase 1 migration code"
```

---

## Phase 2+ Installation Architecture (PERMANENT)

**Confidence: HIGH** (Based on npx tool patterns, installer best practices)

### Problem Statement

Phase 2+ is the **PERMANENT NPX INSTALLER** that:
1. User runs: `npx @org/installer`
2. Interactive prompts (or flags for non-interactive)
3. Reads from `/templates/`
4. Renders `{{VARIABLES}}` to actual values
5. Copies to target directory
6. **NO migration logic** - templates already correct

### Architectural Principle: npx Installer, NOT Library

**Entry point:**
```
/bin/install.js               # Executable, #!/usr/bin/env node
```

**Package.json:**
```json
{
  "name": "@org/installer",
  "bin": {
    "install": "./bin/install.js"
  }
}
```

**Internal helpers:**
```
/lib/
├── platforms/                # Platform detection
├── templates/                # Template loading
├── rendering/                # Variable rendering
├── io/                       # File operations
└── prompts/                  # Interactive CLI
```

**Key point:** No `index.js` with exports. All helpers are internal.

### Recommended Structure: Simple Internal Modules

```
/
├── bin/
│   └── install.js            # Main executable (entry point)
│
├── lib/                      # Internal helpers (NOT public exports)
│   ├── platforms/
│   │   ├── detect.js         # detectPlatform()
│   │   └── configs.js        # Platform configurations
│   │
│   ├── templates/
│   │   ├── loader.js         # loadTemplates()
│   │   └── validator.js      # validateTemplate()
│   │
│   ├── rendering/
│   │   ├── render.js         # renderTemplate()
│   │   └── variables.js      # resolveVariables()
│   │
│   ├── io/
│   │   ├── copy.js           # copyFiles()
│   │   └── write.js          # writeFile()
│   │
│   └── prompts/
│       ├── platform.js       # promptForPlatform()
│       └── template.js       # promptForTemplate()
│
└── templates/                # Template files (from Phase 1)
    ├── skills/
    └── agents/
```

**Characteristics:**
- ✅ **Direct imports** - files import each other as needed
- ✅ **NO index.js** - no "public API" abstraction layer
- ✅ **Internal only** - all code is implementation detail
- ✅ **Simple structure** - organized by domain, easy to navigate

### Example: bin/install.js (Main Executable)

```javascript
#!/usr/bin/env node

// bin/install.js
import { parseArgs } from 'node:util'
import { detectPlatform } from '../lib/platforms/detect.js'
import { loadTemplates } from '../lib/templates/loader.js'
import { renderTemplate } from '../lib/rendering/render.js'
import { copyFiles } from '../lib/io/copy.js'
import { promptForPlatform, promptForTemplate } from '../lib/prompts/platform.js'

async function main() {
  const args = parseArgs({
    options: {
      platform: { type: 'string' },
      template: { type: 'string' },
      dir: { type: 'string' }
    }
  })
  
  // Interactive vs non-interactive
  const platform = args.values.platform || await promptForPlatform()
  const template = args.values.template || await promptForTemplate()
  const targetDir = args.values.dir || await detectPlatform(platform)
  
  // Load and render
  const templateFiles = await loadTemplates(template)
  const rendered = renderTemplate(templateFiles, { 
    INSTALL_DIR: targetDir,
    PLATFORM_NAME: platform 
  })
  
  // Copy to target
  await copyFiles(rendered, targetDir)
  
  console.log(`✓ Installed ${template} to ${targetDir}`)
}

main().catch(console.error)
```

**Key points:**
- Entry point is simple orchestration
- Direct imports from internal helpers
- No abstraction layers
- Clear flow: prompt → load → render → copy

### Example: lib/platforms/detect.js (Internal Helper)

```javascript
// lib/platforms/detect.js
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

export function detectPlatform() {
  // Try Claude Desktop
  const claudeDesktop = getClaudeDesktopPath()
  if (claudeDesktop && fs.existsSync(claudeDesktop)) {
    return 'claude-desktop'
  }
  
  // Future: Add more platforms
  
  return null
}

export function getPlatformPath(platform) {
  const configs = {
    'claude-desktop': getClaudeDesktopPath(),
    // Future: Add more platforms
  }
  
  return configs[platform] || null
}

function getClaudeDesktopPath() {
  const homeDir = os.homedir()
  
  switch (process.platform) {
    case 'darwin':
      return path.join(homeDir, 'Library/Application Support/Claude')
    case 'win32':
      return path.join(homeDir, 'AppData/Roaming/Claude')
    case 'linux':
      return path.join(homeDir, '.config/claude')
    default:
      return null
  }
}
```

**Key points:**
- Simple exports (functions, not classes)
- No base classes or interfaces
- Direct platform checks
- Easy to understand and debug

### Example: lib/rendering/render.js (Internal Helper)

```javascript
// lib/rendering/render.js
import Mustache from 'mustache'

export function renderTemplate(files, variables) {
  return files.map(file => ({
    ...file,
    content: Mustache.render(file.content, variables),
    path: renderPath(file.path, variables)
  }))
}

function renderPath(templatePath, variables) {
  // Render {{VARIABLES}} in paths
  return Mustache.render(templatePath, variables)
}
```

**Key points:**
- Uses `mustache` for template rendering
- Simple function exports
- No complex abstractions

### When to Introduce Platform Adapters?

**Phase 2 (MVP):**
- ✅ Hardcoded platform detection (if/else)
- ✅ Simple path resolution
- ✅ Single platform (Claude Desktop)

```javascript
// Simple is fine for MVP
function detectPlatform() {
  const claudePath = getClaudeDesktopPath()
  if (fs.existsSync(claudePath)) return 'claude-desktop'
  return null
}
```

**Phase 3 (Multiple Platforms):**
- ✅ Extract platform configs to data
- ✅ Add more platforms (Claude CLI, etc.)

```javascript
// lib/platforms/configs.js
export const PLATFORMS = {
  'claude-desktop': {
    name: 'Claude Desktop',
    paths: {
      darwin: '~/Library/Application Support/Claude',
      win32: '%APPDATA%/Claude',
      linux: '~/.config/claude'
    }
  },
  'claude-cli': {
    name: 'Claude CLI',
    paths: {
      darwin: '~/.claude',
      win32: '%USERPROFILE%/.claude',
      linux: '~/.claude'
    }
  }
}
```

**Phase 4+ (Advanced):**
- ✅ Platform adapter pattern (if needed)
- ✅ Plugin system (if needed)

**Rule of thumb:** Start simple. Add abstraction when you have 3+ similar things.

---

## Manual Validation Gate

**Confidence: HIGH** (Based on database migration best practices)

### Problem Statement

How do we prevent Phase 2 from starting before Phase 1 is validated?

### Solution: Explicit Pause Point

**Phase 1 script ends with:**
```javascript
console.log('\n=== Migration Complete ===')
console.log('Next steps:')
console.log('1. Review /templates/ directory')
console.log('2. Check validation report above')
console.log('3. If OK: git add /templates/ && git commit')
console.log('4. THEN: rm -rf scripts/migrate/')
console.log('5. THEN: Proceed to Phase 2')
console.log('\n⚠️  DO NOT proceed until templates are validated!')
```

**User workflow:**
```bash
# Run Phase 1
node scripts/migrate/index.js

# Review output
ls -la templates/
cat templates/skills/memory-management.md
# ... spot-check files ...

# If OK, commit
git add templates/
git commit -m "Phase 1: Generated templates from .github/"

# Delete Phase 1 code
rm -rf scripts/migrate/
git add -A
git commit -m "Remove Phase 1 migration code"

# Now ready for Phase 2
```

**Why manual?**
- Migration is high-risk
- Automated validation can't catch everything
- Human review catches edge cases
- Explicit approval prevents mistakes

### Validation Checklist for User

Provide a checklist in the output:

```
=== Validation Checklist ===

Before proceeding to Phase 2:

[ ] All 42 files in /templates/ (ls -la templates/{skills,agents})
[ ] Frontmatter corrections applied (check a few files)
[ ] {{VARIABLES}} present (grep -r "{{" templates/)
[ ] version.json files generated (ls templates/*/version.json)
[ ] File structure looks correct (compare to .github/)
[ ] Content looks correct (spot-check 3-5 files)
[ ] No errors in validation report above
[ ] Templates committed to git (git status)

If all checks pass:
✓ rm -rf scripts/migrate/
✓ git commit -m "Remove Phase 1 migration code"
✓ Proceed to Phase 2
```

---

## Domain-Specific Patterns

### Path Rewriting: Hybrid Approach

**Confidence: HIGH** (Based on template engine patterns)

**Recommended approach:**
1. **Template variables** for file content: `{{INSTALL_DIR}}`
2. **Template variables** for file paths: `templates/skills/{{SKILL_NAME}}.md`
3. **Library:** `mustache` (v4.2.0) - simple, battle-tested

**Example template content:**
```markdown
---
name: memory-management
path: {{INSTALL_DIR}}/skills/memory-management.md
---

Install this skill to {{INSTALL_DIR}}/skills/
```

**Example path rewriting:**
```javascript
// lib/rendering/render.js
import Mustache from 'mustache'

export function renderTemplate(files, variables) {
  return files.map(file => ({
    ...file,
    content: Mustache.render(file.content, variables),
    path: Mustache.render(file.path, variables)
  }))
}
```

**Why mustache?**
- ✅ Simple, no complex logic in templates
- ✅ Battle-tested (used by many projects)
- ✅ Logic-less (encourages simple templates)
- ✅ Good error messages

**Alternative considered:** Handlebars (more features, but overkill for our needs)

### Interactive CLI: @clack/prompts

**Confidence: HIGH** (Based on modern CLI tool patterns)

**Recommended library:** `@clack/prompts` (v0.11.0)

**Why @clack/prompts?**
- ✅ Modern, beautiful UI
- ✅ Built-in spinners and progress indicators
- ✅ Supports disabled options ("coming soon")
- ✅ Handles Ctrl+C gracefully
- ✅ Good TypeScript support

**Example: Platform selection**
```javascript
// lib/prompts/platform.js
import * as p from '@clack/prompts'

export async function promptForPlatform() {
  const platform = await p.select({
    message: 'Select platform:',
    options: [
      { value: 'claude-desktop', label: 'Claude Desktop' },
      { value: 'claude-cli', label: 'Claude CLI', disabled: '(coming soon)' },
      { value: 'github-cli', label: 'GitHub CLI', disabled: '(coming soon)' }
    ]
  })
  
  if (p.isCancel(platform)) {
    p.cancel('Installation cancelled')
    process.exit(0)
  }
  
  return platform
}
```

**Example: Progress indicators**
```javascript
// bin/install.js
import * as p from '@clack/prompts'

const spinner = p.spinner()

spinner.start('Loading templates...')
const templates = await loadTemplates()
spinner.stop('✓ Loaded templates')

spinner.start('Rendering variables...')
const rendered = renderTemplate(templates, variables)
spinner.stop('✓ Rendered variables')

spinner.start('Copying files...')
await copyFiles(rendered, targetDir)
spinner.stop('✓ Copied files')
```

**Pattern: No flags = interactive mode**
```javascript
// bin/install.js
const args = parseArgs({ ... })

// If flags provided → non-interactive
if (args.values.platform && args.values.template) {
  await installNonInteractive(args.values)
  return
}

// If no flags → interactive
await installInteractive()
```

---

## Comparison: Phase 1 vs Phase 2+

| Aspect | Phase 1 (Migration) | Phase 2+ (Installation) |
|--------|-------------------|------------------------|
| **Purpose** | One-time migration | Ongoing installation |
| **Lifetime** | Temporary (deleted) | Permanent |
| **Input** | `.github/skills/`, `.github/agents/` | `/templates/` |
| **Output** | `/templates/` | User's platform directory |
| **Complexity** | Complex (parsing, corrections) | Simple (load, render, copy) |
| **Structure** | Simple modular script (5-6 files) | npx installer (/bin + /lib) |
| **Abstractions** | Minimal (it gets deleted) | Appropriate (it's permanent) |
| **Code reuse** | None (all deleted) | None from Phase 1 |
| **Testing** | Manual validation | Automated tests |
| **Error handling** | Liberal logging | User-friendly messages |
| **Pattern** | Sequential script | Interactive CLI |

**Key insight:** Phase 1 is SIMPLE because it's TEMPORARY. Phase 2+ is STRUCTURED because it's PERMANENT.

---

## Common Anti-Patterns to Avoid

### Anti-Pattern 1: Stage Reuse Between Phases

❌ **Don't do this:**
```
/lib/stages/              # "Reusable" stages
  ├── read.js             # Used by both phases
  ├── parse.js            # Used by both phases
  └── ...

/lib/pipelines/
  ├── migrate.js          # Phase 1 (composes stages)
  └── install.js          # Phase 2 (composes stages)
```

**Why bad:**
- Creates coupling between temporary and permanent code
- Makes deletion harder (which stages can we delete?)
- Over-engineering for code that gets deleted
- Adds complexity without benefit

✅ **Do this instead:**
```
scripts/migrate/          # Phase 1 (ALL DELETED)
  ├── index.js
  ├── read.js
  └── ...

lib/                      # Phase 2+ (PERMANENT)
  ├── templates/
  ├── rendering/
  └── ...
```

### Anti-Pattern 2: Public API Pattern (Library Pattern)

❌ **Don't do this:**
```javascript
// lib/platforms/index.js (Public API)
export { detectPlatform, getPlatformPath } from './detector.js'

// bin/install.js (Consumer)
import { detectPlatform } from '../lib/platforms/index.js'
```

**Why bad:**
- This is NOT a library, no public API needed
- Extra indirection without benefit
- More files to maintain
- Confusing: suggests external consumers

✅ **Do this instead:**
```javascript
// lib/platforms/detect.js (Internal helper)
export function detectPlatform() { ... }

// bin/install.js (Consumer)
import { detectPlatform } from '../lib/platforms/detect.js'
```

### Anti-Pattern 3: Preserving Phase 1 Code

❌ **Don't do this:**
```bash
# "Just in case we need it"
mkdir .archive/
mv scripts/migrate/ .archive/
git commit -m "Archive Phase 1 code"
```

**Why bad:**
- Adds clutter to repository
- False sense of security
- Git history already has the code
- Violates "complete deletion" principle

✅ **Do this instead:**
```bash
# Delete completely
rm -rf scripts/migrate/
git commit -m "Remove Phase 1 migration code"

# Code lives in git history
git log --all -- scripts/migrate/
```

### Anti-Pattern 4: Over-Engineering Phase 1

❌ **Don't do this:**
```
scripts/migrate/
  ├── src/
  │   ├── core/
  │   │   ├── BaseReader.js
  │   │   ├── BaseTransformer.js
  │   │   └── BaseWriter.js
  │   ├── interfaces/
  │   ├── factories/
  │   └── ...
  ├── tests/
  └── ...
```

**Why bad:**
- It gets deleted anyway
- Wastes time on code that's temporary
- Makes simple script complex
- Harder to debug and modify

✅ **Do this instead:**
```
scripts/migrate/
  ├── index.js            # Main script
  ├── read.js             # Read .github/
  ├── transform.js        # Apply corrections
  └── write.js            # Write /templates/
```

### Anti-Pattern 5: Automatic Progression

❌ **Don't do this:**
```javascript
// Phase 1 script
await migrate()
console.log('Migration complete, starting Phase 2...')
await deletePhase1()
await startPhase2()
```

**Why bad:**
- No manual validation gate
- Can't catch errors before deletion
- User doesn't review output
- Risky for one-way operations

✅ **Do this instead:**
```javascript
// Phase 1 script
await migrate()
console.log('Migration complete. STOP.')
console.log('Review output, then manually delete Phase 1 code.')
console.log('DO NOT proceed to Phase 2 until validated.')
```

---

## Technology Stack

### Phase 1 (Migration) - DELETED

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v18+ | Runtime |
| gray-matter | v4.2.3 | YAML frontmatter parsing |
| (no other deps) | | Keep it minimal |

**Install:**
```bash
npm install gray-matter
```

**Why minimal?**
- It gets deleted anyway
- Less to install and maintain
- Simpler is better for one-time scripts

### Phase 2+ (Installation) - PERMANENT

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | v18+ | Runtime |
| mustache | v4.2.0 | Template rendering |
| @clack/prompts | v0.11.0 | Interactive CLI |

**Install:**
```bash
npm install mustache @clack/prompts
```

**Future additions (Phase 3+):**
- `joi` or `zod` - Schema validation (if needed)
- `execa` - Process execution (if needed)

---

## Summary: Key Takeaways

### Phase 1 Migration (DELETED)

✅ **Simple modular script** (5-6 files)  
✅ **Minimal dependencies** (just gray-matter)  
✅ **Liberal logging** (console.log is your friend)  
✅ **Manual validation gate** (PAUSE before deletion)  
✅ **Complete deletion** (rm -rf scripts/migrate/)  
✅ **NO stage reuse** (no coupling to Phase 2+)  
✅ **NO over-engineering** (it gets deleted anyway)

### Phase 2+ Installation (PERMANENT)

✅ **npx installer** (NOT a library)  
✅ **Entry point:** `/bin/install.js` (executable)  
✅ **Internal helpers:** `/lib/` (NO public API)  
✅ **Direct imports** (no index.js abstraction)  
✅ **Interactive CLI** (@clack/prompts)  
✅ **Template rendering** (mustache)  
✅ **Start simple** (hardcoded detection in Phase 2)  
✅ **Add abstraction later** (platform adapters in Phase 3+)

### Critical Principles

✅ **NO stage reuse** - Phase 1 and Phase 2+ are completely separate  
✅ **NO public API** - This is npx installer, not a library  
✅ **Complete deletion** - ALL Phase 1 code deleted, no preservation  
✅ **Manual validation** - Phase 1 PAUSES for approval  
✅ **Simple first** - Start with hardcoded logic, abstract when needed  

### What Gets Deleted

```bash
# After Phase 1 approval:
rm -rf scripts/migrate/   # ALL Phase 1 code
git add -A
git commit -m "Remove Phase 1 migration code"
```

### What Stays

- ✅ `/templates/` directory (committed to git)
- ✅ `/bin/install.js` (Phase 2+ entry point)
- ✅ `/lib/` helpers (Phase 2+ internal modules)
- ✅ Documentation

---

## Quality Gate Checklist

Before proceeding with this architecture:

- [x] NO mention of stage reuse or shared stages
- [x] NO mention of public API or index.js exports pattern
- [x] NO mention of .archive/ or code preservation
- [x] Emphasizes Phase 1 simplicity (it's deleted, don't over-engineer)
- [x] Phase 2+ is npx installer (/bin + /lib), NOT a library
- [x] Manual validation gate clearly documented
- [x] Complete code deletion clearly documented
- [x] Phase separation clearly documented

This architecture correctly reflects the project constraints and will inform roadmap creation.
