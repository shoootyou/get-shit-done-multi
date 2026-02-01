# Technology Ecosystem: npx CLI Installer

**Project Type:** npx-based installer (like create-react-app, create-vite)
**Architecture:** Two-phase with complete deletion between phases
**Researched:** January 2026
**Node.js Target:** v18+ (LTS), tested with v25.4.0

---

## Phase Architecture Overview

This project has a **unique two-phase architecture** with a manual validation gate:

```
Phase 1 (TEMPORARY)           Phase 2+ (PERMANENT)
Migration Scripts             CLI Installer
├── /scripts/*.js            ├── /bin/install.js (entry)
├── devDependencies          └── /lib/*.js (utilities)
└── DELETED after approval   └── dependencies (forever)

Manual Gate: User reviews → Approves → Commit → `rm -rf scripts/` → Phase 2
```

**Critical architectural constraint:** Phase 1 code is **completely deleted** after approval. NO `.archive/`, NO `stages/`, NO preservation. Exists ONLY in git history.

---

## Phase 1: Migration Stack (TEMPORARY, DELETED after approval)

**Duration:** One-time use, then completely removed
**Purpose:** Convert 29 skills + 13 agents from .github/ → /templates/
**End state:** Code committed once, then `rm -rf scripts/` before Phase 2

### Core Dependencies (Temporary)

| Package | Version | Purpose | When Removed |
|---------|---------|---------|--------------|
| `gray-matter` | ^4.0.3 | Parse frontmatter from existing files | After Phase 1 approval |
| `ajv` | ^8.17.1 | Validate frontmatter schemas | After Phase 1 approval |
| `ajv-formats` | ^3.0.1 | Date/URI validation for ajv | After Phase 1 approval |

**Installation:**
```bash
npm install --save-dev gray-matter ajv ajv-formats
```

**Why These:**
- **gray-matter**: De facto standard for frontmatter parsing (4.0.3 from 2021, stable)
- **ajv**: JSON Schema validation standard (8.17.1, latest, well-maintained)
- **ajv-formats**: Companion for string format validation

**Alternative considered:**
- `yaml` + `zod`: More modern, but gray-matter is battle-tested for frontmatter specifically

### Phase 1 Script Structure

```
/scripts/
├── migrate.js              # Main migration orchestrator
├── parse-frontmatter.js    # gray-matter wrapper
├── validate-schema.js      # ajv validation
├── generate-templates.js   # Write to /templates/
└── report.js              # Validation report generator
```

### Phase 1 Lifecycle

1. **Install dependencies:** `npm install --save-dev gray-matter ajv ajv-formats`
2. **Run migration:** `node scripts/migrate.js`
3. **Output:** 
   - `/templates/skills/*.skill.md` (29 files)
   - `/templates/agents/*.agent.md` (13 files)
   - `/templates/version.json`
   - `MIGRATION_REPORT.md` (validation results)
4. **Manual review:** User inspects corrections, validation report
5. **Approval:** User explicitly approves (e.g., flag file or command)
6. **Commit once:** `git add . && git commit -m "feat: migrate templates"`
7. **DELETE completely:** `rm -rf scripts/`
8. **Remove from package.json:** Delete devDependencies entries for gray-matter, ajv, ajv-formats
9. **Clean node_modules:** `npm install` (removes unused packages)
10. **Commit deletion:** `git commit -m "chore: remove migration scripts"`

**After this point:** NO migration code exists in working directory. Only in git history.

---

## Phase 2+: Installation Stack (PERMANENT)

**Duration:** Forever (core product)
**Purpose:** Install from /templates/ → user's .claude/, .github/, .codex/
**Architecture:** `/bin/install.js` (executable) + `/lib/*.js` (internal utilities)

### Core Dependencies (Permanent)

| Package | Version | Purpose | Why This |
|---------|---------|---------|----------|
| `commander` | ^14.0.2 | CLI framework | Industry standard, mature (14.x latest) |
| `@inquirer/prompts` | ^8.2.0 | Interactive prompts | Modern rewrite of inquirer, lighter |
| `chalk` | ^5.6.2 | Terminal colors | Universal standard for CLI color |
| `ora` | ^9.1.0 | Spinners/progress | Standard CLI spinner library |
| `execa` | ^9.6.1 | Shell command execution | Better than child_process, promise-based |

**Installation:**
```bash
npm install commander @inquirer/prompts chalk ora execa
```

**Why These:**

**commander (14.0.2):**
- Industry standard CLI framework (since 2011)
- Declarative API for commands, options, arguments
- Built-in help generation
- v14.x is latest stable (Oct 2025)
- Used by: Vue CLI, create-react-app, vercel CLI

**@inquirer/prompts (8.2.0):**
- Modern rewrite of inquirer (lighter, tree-shakeable)
- Individual prompt exports (select, confirm, input, etc.)
- Native ESM support
- Better performance than inquirer@13
- Replaces old `inquirer` (13.2.1, monolithic)

**chalk (5.6.2):**
- Universal terminal color library
- Simple API: `chalk.green('success')`
- Auto-detects color support
- Latest 5.x (ESM-first)

**ora (9.1.0):**
- Standard CLI spinner library
- `ora('Loading...').start()` → `.succeed()` / `.fail()`
- Used by all major npx tools
- Latest 9.x (stable)

**execa (9.6.1):**
- Better than `child_process.spawn()`
- Promise-based, cleaner error handling
- Used for git commands during installation
- Latest 9.x (stable)

### Supporting Libraries (Optional UX)

| Package | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `cli-table3` | ^0.6.5 | Tables for reports | If showing feature matrices |
| `boxen` | ^8.0.1 | Terminal boxes | For important messages |
| `update-notifier` | ^7.3.1 | Check for installer updates | If publishing to npm |

**NOT NEEDED (NO public API):**
- ~~TypeScript~~ (overkill for scripts, no external consumers)
- ~~@types packages~~ (no TS)
- ~~index.js exports~~ (NOT a library, no API)
- ~~rollup/webpack~~ (Node.js scripts, no bundling)

### Phase 2+ File Structure

```
/
├── bin/
│   └── install.js          # #!/usr/bin/env node entry point
├── lib/                    # Internal utilities (NO exports)
│   ├── copy-templates.js   # Copy from /templates/ to target
│   ├── prompt.js          # User interaction (@inquirer/prompts wrapper)
│   ├── validate-target.js  # Check target directory
│   ├── git-check.js       # Verify git status (via execa)
│   └── logger.js          # Console output (chalk, ora)
├── templates/              # Source templates (from Phase 1)
│   ├── skills/*.skill.md
│   ├── agents/*.agent.md
│   └── version.json
└── package.json
    ├── "bin": { "get-shit-done-multi": "bin/install.js" }
    └── "type": "module"   # ESM (all dependencies support)
```

### Phase 2+ Capabilities

**What it does:**
1. **Interactive selection:** `@inquirer/prompts` → select skills/agents
2. **Target validation:** Check if .claude/, .github/ exist
3. **Git safety:** Use `execa` to check git status (warn if dirty)
4. **File copying:** Native `fs.promises` (NO fs-extra needed)
5. **Progress feedback:** `ora` spinners during copy
6. **Success message:** `chalk` + `boxen` for final output

**What it does NOT do:**
- NO frontmatter parsing (templates already correct)
- NO schema validation (done in Phase 1)
- NO YAML generation (templates already valid)
- NO "conversion" logic (Phase 1 handled that)

### ESM vs CommonJS

**Recommendation: ESM (type: "module")**

**Why ESM:**
- All major dependencies support ESM (commander 14, inquirer/prompts 8, chalk 5, ora 9, execa 9)
- Node.js v18+ has stable ESM
- Cleaner `import`/`export` syntax
- Future-proof

**package.json:**
```json
{
  "type": "module",
  "bin": {
    "get-shit-done-multi": "bin/install.js"
  },
  "engines": {
    "node": ">=18"
  }
}
```

**bin/install.js:**
```javascript
#!/usr/bin/env node
import { Command } from 'commander';
import { select, confirm } from '@inquirer/prompts';
import chalk from 'chalk';
import ora from 'ora';

// NO require(), NO module.exports
// Pure ESM
```

---

## Dependency Lifecycle Timeline

### Timeline

```
DAY 1: Phase 1 Start
├── npm install --save-dev gray-matter ajv ajv-formats
├── Write /scripts/*.js
└── Run migration

DAY 2: Manual Review
├── User inspects /templates/
├── User reviews MIGRATION_REPORT.md
└── User approves (or rejects)

DAY 3: Phase 1 Cleanup
├── git add . && git commit -m "feat: migrate templates"
├── rm -rf scripts/
├── Edit package.json: remove gray-matter, ajv, ajv-formats from devDependencies
├── npm install (clean up node_modules)
└── git commit -m "chore: remove migration scripts"

DAY 4: Phase 2 Start
├── npm install commander @inquirer/prompts chalk ora execa
├── Write /bin/install.js
├── Write /lib/*.js
└── Test: npx . (in repo root)

DAY 5+: Phase 2+ Development
├── Add features
├── Publish to npm (npx get-shit-done-multi)
└── Phase 1 code is GONE (only in git history)
```

### package.json Evolution

**Phase 1 (temporary):**
```json
{
  "devDependencies": {
    "gray-matter": "^4.0.3",
    "ajv": "^8.17.1",
    "ajv-formats": "^3.0.1"
  },
  "scripts": {
    "migrate": "node scripts/migrate.js"
  }
}
```

**After Phase 1 approval (DELETE):**
```json
{
  "dependencies": {},
  "devDependencies": {}
}
```

**Phase 2+ (permanent):**
```json
{
  "name": "get-shit-done-multi",
  "version": "1.0.0",
  "type": "module",
  "bin": {
    "get-shit-done-multi": "bin/install.js"
  },
  "engines": {
    "node": ">=18"
  },
  "dependencies": {
    "commander": "^14.0.2",
    "@inquirer/prompts": "^8.2.0",
    "chalk": "^5.6.2",
    "ora": "^9.1.0",
    "execa": "^9.6.1"
  },
  "files": [
    "bin/",
    "lib/",
    "templates/"
  ]
}
```

---

## Native Node.js vs External Libraries

### File System: Native `fs.promises` (NO fs-extra)

**Use native fs.promises:**
- `fs.promises.readFile()` → read templates
- `fs.promises.writeFile()` → write to .claude/, .github/
- `fs.promises.mkdir(path, { recursive: true })` → create directories
- `fs.promises.copyFile()` → copy files

**Why NOT fs-extra:**
- fs-extra (11.3.3) provides `fs.copySync()`, `fs.ensureDir()`
- BUT: Native fs.promises has `mkdir({ recursive: true })` since Node v10.12
- Simple file operations don't need external library
- One less dependency

**Only use fs-extra IF:**
- Need `fs.copy()` for recursive directory copy (templates → target)
- Native `fs.promises` would require manual recursion

**Decision:** Start with native fs.promises. Add fs-extra only if recursive copy becomes complex.

### String Replacement: Native Template Literals

**NO mustache/handlebars needed:**
- Templates are markdown with frontmatter
- Replacement is simple: `{{USER_NAME}}` → actual value
- Native `String.prototype.replace()` or template literals

**Example:**
```javascript
const template = await fs.promises.readFile('template.md', 'utf-8');
const output = template.replace(/\{\{USER_NAME\}\}/g, userName);
await fs.promises.writeFile(targetPath, output);
```

**NO templating library needed** (Mustache, Handlebars, EJS) unless complex logic required.

---

## npx Installer Best Practices (2025)

### Entry Point (`bin/install.js`)

**MUST include shebang:**
```javascript
#!/usr/bin/env node
```

**MUST be executable:**
```bash
chmod +x bin/install.js
```

**package.json bin field:**
```json
{
  "bin": {
    "get-shit-done-multi": "bin/install.js"
  }
}
```

**Usage:**
```bash
npx get-shit-done-multi        # After npm publish
npx . (in repo root)           # During development
```

### Error Handling

**Commander provides:**
- Auto-generated help (`--help`)
- Version flag (`--version`)
- Error handling for unknown options

**Custom error handling:**
```javascript
try {
  await installTemplates();
} catch (error) {
  console.error(chalk.red('✖'), error.message);
  process.exit(1);
}
```

### Output Standards

**Success:**
```javascript
console.log(chalk.green('✔'), 'Templates installed successfully!');
```

**Error:**
```javascript
console.error(chalk.red('✖'), 'Installation failed:', error.message);
```

**Spinner:**
```javascript
const spinner = ora('Installing templates...').start();
await installTemplates();
spinner.succeed('Installation complete!');
```

**Info:**
```javascript
console.log(chalk.blue('ℹ'), 'Found 29 skills, 13 agents');
```

---

## Alternatives Considered

### CLI Framework

| Option | Version | Pros | Cons | Verdict |
|--------|---------|------|------|---------|
| **commander** | 14.0.2 | Industry standard, mature, great docs | None | ✅ **RECOMMENDED** |
| yargs | 17.7.2 | Feature-rich, flexible | More complex API | Not needed |
| cac | 6.7.14 | Lightweight | Less adoption | Overkill |

### Interactive Prompts

| Option | Version | Pros | Cons | Verdict |
|--------|---------|------|------|---------|
| **@inquirer/prompts** | 8.2.0 | Modern, tree-shakeable, lightweight | New (2024) | ✅ **RECOMMENDED** |
| inquirer | 13.2.1 | Mature, battle-tested | Monolithic, heavy | Old approach |
| prompts | 2.4.2 | Lightweight, promise-based | Less features | Simpler, viable |

**Why @inquirer/prompts over inquirer:**
- inquirer 13 is monolithic (imports all prompt types)
- @inquirer/prompts is modular (`import { select } from '@inquirer/prompts'`)
- Better tree-shaking, smaller bundle
- Same team, same API philosophy

### Frontmatter Parsing (Phase 1 only)

| Option | Version | Pros | Cons | Verdict |
|--------|---------|------|------|---------|
| **gray-matter** | 4.0.3 | Standard for frontmatter, stable | Old (2021) | ✅ **RECOMMENDED** |
| yaml + custom | 2.8.2 | Modern YAML parser | Manual frontmatter split | More work |
| front-matter | 4.0.2 | Simpler | Less features | gray-matter is better |

### Schema Validation (Phase 1 only)

| Option | Version | Pros | Cons | Verdict |
|--------|---------|------|------|---------|
| **ajv** | 8.17.1 | JSON Schema standard, fast | Verbose schemas | ✅ **RECOMMENDED** |
| zod | 4.3.6 | Modern, TypeScript-first | Not JSON Schema | No TS here |
| joi | 17.13.3 | Expressive API | Heavy | Overkill |

---

## Version Verification (January 2026)

| Package | Checked Version | Published | Status |
|---------|----------------|-----------|--------|
| commander | 14.0.2 | Oct 2025 | ✅ Latest stable |
| @inquirer/prompts | 8.2.0 | Jan 2026 | ✅ Latest |
| chalk | 5.6.2 | Current | ✅ Latest 5.x |
| ora | 9.1.0 | Current | ✅ Latest 9.x |
| execa | 9.6.1 | Current | ✅ Latest 9.x |
| gray-matter | 4.0.3 | Apr 2021 | ⚠️ Old but stable |
| ajv | 8.17.1 | Jul 2024 | ✅ Latest 8.x |
| fs-extra | 11.3.3 | Dec 2025 | ✅ Latest (if needed) |

**Confidence:** HIGH (all versions verified via npm registry)

---

## Key Takeaways

### Phase 1 (Migration)
- **Install:** gray-matter, ajv, ajv-formats (devDependencies)
- **Use:** YAML parsing, schema validation, template generation
- **Lifecycle:** ONE-TIME use, then completely deleted

### Phase 2+ (Installer)
- **Install:** commander, @inquirer/prompts, chalk, ora, execa (dependencies)
- **Use:** CLI framework, user prompts, file operations
- **Lifecycle:** PERMANENT (core product)

### NOT a Library
- NO `index.js` with exports
- NO public API
- Users run `npx get-shit-done-multi`, NOT `import { install } from '...'`
- Entry point: `/bin/install.js` (executable)
- Utilities: `/lib/*.js` (internal only)

### Complete Deletion
- After Phase 1 approval: `rm -rf scripts/`
- Remove migration dependencies from package.json
- NO `.archive/`, NO `stages/`, NO preservation
- Migration code exists ONLY in git history

### Modern Stack
- ESM (`"type": "module"`)
- Node.js 18+ (LTS)
- Latest stable versions (verified Jan 2026)
- Battle-tested libraries (commander, chalk, ora)
- Modern rewrites where beneficial (@inquirer/prompts over inquirer)

---

**Next steps:** Use this stack for Phase 1 planning. After Phase 1 completion and deletion, use Phase 2+ stack for installer development.
