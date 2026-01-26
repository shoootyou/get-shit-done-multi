# Project Research Summary

**Project:** get-shit-done-multi  
**Domain:** Template-based CLI installer for multi-platform AI skills & agents  
**Researched:** 2025-01-26 (Re-researched with migration architecture)  
**Overall Confidence:** HIGH

## Executive Summary

**CRITICAL ARCHITECTURE INSIGHT:** This project has **TWO DISTINCT CONCERNS** that must be separated:

### Phase 1: ONE-TIME Migration (Temporary)
- **Purpose:** Convert `.github/` → `/templates/` with frontmatter corrections
- **Lifespan:** Used once, then **archived** (not deleted entirely)
- **Technology:** YAML parsing (`gray-matter`, `js-yaml`), AST manipulation, validation (`ajv`)
- **Architecture:** Batch transformation pipeline with comprehensive validation
- **Output:** Clean `/templates/` directory ready for permanent use

### Phase 2+: Installation (Permanent)
- **Purpose:** Install from `/templates/` to user directories (`.claude/`, `.github/`)
- **Lifespan:** Remains in codebase forever
- **Technology:** Template rendering (simple string replacement), CLI UX (`@clack/prompts`), file operations (`fs-extra`)
- **Architecture:** Interactive installer with platform adapters
- **Input:** Uses corrected `/templates/` (NO conversion logic)

**Why this matters:** Phase 1 dependencies (gray-matter, js-yaml, ajv) are TEMPORARY. After migration completes and validation passes, these tools become dead weight. Phase 2+ never needs YAML parsing or frontmatter manipulation — templates are already correct.

**Key finding:** Current `.github/` files contain 42 templates with **unsupported frontmatter fields** (`skill_version`, `requires_version`, `platforms`, `arguments`, `metadata`) that violate official Claude/Copilot specifications. Phase 1 must:
1. Remove unsupported fields from frontmatter
2. Store metadata in separate `version.json` files
3. Fix field naming (`tools` → `allowed-tools` for Claude skills)
4. Convert tool arrays to platform-specific formats
5. Replace `arguments` arrays with `argument-hint` strings
6. Insert template variables (`{{INSTALL_DIR}}`) for Phase 2 rendering

**Critical migration risk:** Mass template corruption from bugs affecting all 42 files with no recovery path. Mitigation: Mandatory dry-run mode, incremental validation, archive migration code (don't delete), emergency re-migration procedure.

## Key Findings by Domain

### 1. Technology Stack (ECOSYSTEM.md)

**Confidence: HIGH** — All package versions verified against npm registry (Jan 2026).

**CRITICAL: Two distinct technology stacks for two distinct phases.**

#### Phase 1 Migration Stack (TEMPORARY - Will be archived)

```json
{
  "devDependencies": {
    "gray-matter": "^4.0.3",    // Parse/modify frontmatter (TEMPORARY)
    "js-yaml": "^4.1.1",        // YAML validation (TEMPORARY)
    "ajv": "^8.17.1"            // JSON Schema validation (TEMPORARY)
  }
}
```

**Why these libraries (Phase 1 only):**
- **gray-matter** — Extract, modify, and re-serialize frontmatter while preserving formatting
- **js-yaml** — Validate YAML structure after transformation
- **ajv** — Validate against official Claude/Copilot frontmatter schemas
- **Status:** These dependencies will be **archived after Phase 1 completes**

#### Phase 2+ Installation Stack (PERMANENT)

```json
{
  "dependencies": {
    "commander": "^14.0.2",      // CLI argument parsing (PERMANENT)
    "fs-extra": "^11.3.3",       // File operations with atomic writes (PERMANENT)
    "chalk": "^5.6.2",           // Terminal colors (PERMANENT)
    "@clack/prompts": "^0.11.0"  // Interactive CLI UX (PERMANENT)
  },
  "devDependencies": {
    "vitest": "^4.0.18",         // Testing framework
    "@vitest/ui": "^4.0.18"      // Test UI
  }
}
```

**Why these libraries (Phase 2+):**
- **commander** — ESM support, clean API for CLI args
- **fs-extra** — Atomic writes, promise-based, cross-platform
- **chalk** — Terminal colors for user feedback
- **@clack/prompts** — Beautiful interactive prompts with spinners
- **NO template engine** — Use simple string replacement for `{{VARIABLES}}`

**Key decision:** Phase 2+ does **NOT include YAML parsing libraries**. Templates are pre-corrected by Phase 1. Installation only does string replacement and file copying.

### 2. Platform Specifications (PLATFORMS.md)

**Confidence: HIGH** — All findings verified against official documentation.

**CRITICAL DISCOVERY:** The current `.github/` codebase uses fields that are **NOT supported** by official specifications for either platform. Phase 1 must correct this.

#### Unsupported Fields (Must Remove from Frontmatter)

| Field | Status | Phase 1 Action |
|-------|--------|----------------|
| `skill_version` | ❌ NOT SUPPORTED | Extract → store in `version.json` |
| `requires_version` | ❌ NOT SUPPORTED | Extract → store in `version.json` |
| `platforms` | ❌ NOT SUPPORTED | Extract → store in `version.json` |
| `arguments` | ❌ NOT SUPPORTED | Convert → `argument-hint` (string) |
| `metadata` | ❌ NOT SUPPORTED | Extract → store in `version.json` |

#### Official Frontmatter Fields

**Claude Code Skills (Correct):**
- `name`, `description`, `argument-hint`, `disable-model-invocation`, `user-invocable`
- **`allowed-tools`** (NOT `tools`) — comma-separated string, capitalized names
- `model`, `context`, `agent`, `hooks`

**GitHub Copilot Agents (Correct):**
- `name`, `description`, `target`, `infer`, `mcp-servers`
- **`tools`** — array or string, case-insensitive

**Key correction:** Claude Skills use `allowed-tools` (string), GitHub uses `tools` (array). Current `.github/` incorrectly uses `tools` everywhere.

#### Tool Name Mappings (Phase 1 Transformation)

| Current (Copilot) | Claude Canonical | GitHub Format |
|-------------------|------------------|---------------|
| `execute` | `Bash` | `execute` |
| `read` | `Read` | `read` |
| `edit` | `Edit` | `edit` |
| `search` | `Grep` or `Glob` | `search` |
| `agent` | `Task` | `agent` |

**Phase 1 transformation:**
- Convert `['execute', 'read']` → `'Bash, Read'` (Claude)
- Keep `['execute', 'read']` (GitHub)
- Capitalize for Claude, lowercase for GitHub

#### Path References (Phase 2 Template Variables)

Templates must use variables that Phase 2 replaces:

- Claude: `@{{PLATFORM_ROOT}}/get-shit-done/references/...`
- GitHub: `@{{PLATFORM_ROOT}}/get-shit-done/references/...`

Phase 2 replaces `{{PLATFORM_ROOT}}` with `.claude` or `.github` based on target.

#### File Extensions (Phase 2 Output)

- Claude agents: `.md`
- GitHub agents: `.agent.md`
- Skills: `SKILL.md` (both platforms)

### 3. Architecture & Domain Patterns (DOMAIN.md)

**Confidence: HIGH** — Based on migration patterns, ETL pipelines, and installer best practices.

**CRITICAL: Two separate architectures, not one pipeline.**

#### Phase 1 Migration Architecture (Temporary)

**Purpose:** One-time batch transformation of `.github/` → `/templates/` with corrections.

**Pipeline stages:**
```
read → parse → transform → validate → generate → write → archive
```

**Stage details:**
1. **Read** — Load all 42 files from `.github/skills/` and `.github/agents/`
2. **Parse** — Extract frontmatter with `gray-matter`, preserve content
3. **Transform** — Remove unsupported fields, rename `tools`, convert arrays
4. **Validate** — Check against JSON schemas (ajv), verify no corruption
5. **Generate** — Create `version.json` files from extracted metadata
6. **Write** — Save to `/templates/` with template variables inserted
7. **Archive** — Move migration scripts to `.archive/phase-1-migration/`

**Key characteristics:**
- Runs ONCE (not repeatable after deletion)
- Processes ALL files in batch
- Complex transformations (YAML AST manipulation)
- Must be 100% correct (no recovery path after archiving)
- Comprehensive validation at each stage

**Module structure (temporary):**
```
scripts/
└── migrate-to-templates.js     # Main migration script (archived after use)
    ├── stages/
    │   ├── read.js
    │   ├── parse.js
    │   ├── transform.js
    │   ├── validate.js
    │   ├── generate.js
    │   └── write.js
    └── lib/
        ├── yaml-ast.js         # AST-based YAML manipulation
        ├── tool-mappings.js    # Copilot → Claude tool conversions
        └── schemas.js          # Official platform schemas
```

#### Phase 2+ Installation Architecture (Permanent)

**Purpose:** Install pre-corrected templates from `/templates/` to user directories.

**Pipeline stages:**
```
detect → prompt → load → render → copy → validate → commit
```

**Stage details:**
1. **Detect** — Find available platforms (Claude, Copilot)
2. **Prompt** — Interactive selection with `@clack/prompts`
3. **Load** — Read from `/templates/` (already correct)
4. **Render** — Replace `{{VARIABLES}}` with actual values (simple string replacement)
5. **Copy** — Write to target directories (`.claude/`, `.github/`)
6. **Validate** — Check file integrity
7. **Commit** — Write manifest, cleanup temp files

**Key characteristics:**
- Runs FOREVER (permanent codebase)
- User-initiated (interactive or CI mode)
- Simple transformations (string replacement only)
- NO YAML parsing (templates already correct)
- Transaction pattern for rollback

**Module structure (permanent):**
```
/bin/lib/
├── platforms/          # Platform detection & config
│   ├── detector.js    # Find available CLIs
│   └── adapters/      # Claude, GitHub adapters
├── templates/         # Template loading
│   └── loader.js      # Read from /templates/
├── rendering/         # Simple string replacement
│   └── renderer.js    # Replace {{VARIABLES}}
├── io/                # File operations
│   ├── writer.js      # Atomic writes
│   └── transaction.js # Rollback support
└── prompts/           # Interactive UX
    └── interactive.js # @clack/prompts flows
```

#### Why Separate Architectures?

| Aspect | Phase 1 (Migration) | Phase 2+ (Installation) |
|--------|---------------------|-------------------------|
| **Complexity** | HIGH (YAML manipulation) | LOW (string replacement) |
| **Dependencies** | gray-matter, js-yaml, ajv | fs-extra, chalk, prompts |
| **Input** | `.github/` (needs correction) | `/templates/` (already correct) |
| **Output** | `/templates/` (corrected) | User directories (rendered) |
| **Lifespan** | ONE-TIME → archived | FOREVER → maintained |
| **Risk** | Mass corruption | Partial installation |

**Architectural principle:** Keep migration concerns COMPLETELY SEPARATE from installation concerns. No shared code except maybe validation utilities.

### 4. Critical Risks & Mitigations (RISKS.md)

**Confidence: HIGH** — Risks identified from real-world migration and installer failures.

**Risk categorization:** Phase 1 migration risks vs Phase 2+ installation risks are DIFFERENT.

#### Phase 1 Migration Risks (ONE-TIME)

**🔴 CRITICAL #1: Mass Template Corruption from Migration Bugs**

**What goes wrong:**
- Migration bug corrupts frontmatter across all 42 files systematically
- Incorrect regex matches (e.g., removing `platform` also removes `platformVersion`)
- YAML structure breaks (multiline strings, comments, indentation)
- Tool mappings with case mismatches
- Can't re-run migration if code deleted

**Why critical:**
- Affects all files in batch (no incremental recovery)
- If migration code archived, must manually fix 42 files
- Easy to test on 1 file, miss edge cases across 42

**Mitigation (P0):**
```javascript
// ❌ WRONG: Regex-based removal (dangerous)
content = content.replace(/^metadata:.*$/gm, '')  // Breaks YAML

// ✅ CORRECT: AST-based manipulation (safe)
import matter from 'gray-matter'
const { data, content } = matter(fileContent)
delete data.metadata  // Safe deletion
const output = matter.stringify(content, data)
```

**Additional safeguards:**
1. **Mandatory dry-run mode** — Preview all changes before applying
2. **Incremental validation** — Validate each file after transformation
3. **Diff generation** — Show before/after for manual review
4. **Emergency recovery** — Archive migration code, don't delete
5. **Git snapshots** — Commit `.github/` before migration

---

**🔴 CRITICAL #2: Premature Deletion of Migration Code**

**What goes wrong:**
- Migration code deleted after Phase 1 completes
- Bug discovered in Phase 2 affecting templates
- Need to re-run migration with fixes
- Code no longer exists, must recreate from scratch

**Why critical:**
- Migration errors may not surface until installation testing
- Manual fixes to 42 templates error-prone
- Lost institutional knowledge of transformation rules

**Mitigation (P0):**
```bash
# ❌ WRONG: Delete migration code
rm -rf scripts/migrate-to-templates.js

# ✅ CORRECT: Archive for emergency use
mkdir -p .archive/phase-1-migration
mv scripts/migrate-to-templates.js .archive/phase-1-migration/
git add .archive/
git commit -m "archive: preserve Phase 1 migration code for emergency recovery"
```

**Archive strategy:**
- Keep migration code in `.archive/phase-1-migration/`
- Include emergency re-migration script
- Document recovery procedure in README
- Maintain for minimum 6 months post-launch

---

**🔴 CRITICAL #3: Incomplete Validation Before Archiving**

**What goes wrong:**
- Migration completes, validation "passes"
- Templates look correct in static analysis
- Installation testing reveals broken references, invalid tool names
- Migration code already archived/deleted

**Why critical:**
- Static validation insufficient (YAML structure valid but content wrong)
- Need runtime validation (actual installation test)
- Can't fix templates without re-running migration

**Mitigation (P0):**
```javascript
// Three-tier validation before archiving

// 1. Static validation (structure)
validateYAMLStructure(template)
validateRequiredFields(template)

// 2. Semantic validation (content)
validateToolNames(template.tools, platform)
validateReferences(template.skills, availableSkills)
validatePaths(template.paths)

// 3. Runtime validation (actual installation)
await testInstallation(template, platform)
verifySkillLoads(installedPath)
```

**Validation checklist:**
- [ ] All 42 files parse without YAML errors
- [ ] No unsupported fields remain in frontmatter
- [ ] All `version.json` files created correctly
- [ ] Tool names match platform specifications
- [ ] Agent → skill references valid
- [ ] Path variables inserted correctly
- [ ] Test installation succeeds on both platforms
- [ ] Skills load without errors in actual CLIs

#### Phase 2+ Installation Risks (ONGOING)

**🔴 CRITICAL #4: Partial Installation Without Rollback**

**What goes wrong:**
- Installation fails midway (permission denied, disk full)
- Some files written, others not
- User left with broken state
- Subsequent reinstalls fail due to partial state

**Mitigation (P0):**
```javascript
class InstallTransaction {
  async commit() {
    try {
      for (const op of this.operations) {
        await op.execute()
        this.completed.push(op)
      }
      await this.writeManifest()
    } catch (error) {
      await this.rollback()  // Undo in reverse order
      throw error
    }
  }
  
  async rollback() {
    for (const op of this.completed.reverse()) {
      await op.undo()
    }
  }
}
```

---

**🔴 CRITICAL #5: Path Traversal Vulnerability**

**What goes wrong:**
- Malicious template uses `../../etc/passwd` in paths
- Overwrites system files outside allowed directories
- Security vulnerability

**Mitigation (P0):**
```javascript
function validatePath(targetPath, allowedRoot) {
  const resolved = path.resolve(targetPath)
  const normalized = path.normalize(resolved)
  
  if (!normalized.startsWith(allowedRoot)) {
    throw new Error('Path traversal detected')
  }
  
  // Check for symlinks
  const stats = fs.lstatSync(normalized)
  if (stats.isSymbolicLink()) {
    throw new Error('Symbolic links not allowed')
  }
}
```

---

**🟡 HIGH #6: Manual Edits to `/templates/` Diverge from Source**

**What goes wrong:**
- After migration, developer manually edits `/templates/`
- Original `.github/` files unchanged
- Need to re-run migration (e.g., add new platform)
- Manual edits lost, divergence between source and templates

**Mitigation:**
- Document that `/templates/` is DERIVED, not source
- Keep `.github/` as source of truth for 6 months
- Eventual migration: delete `.github/`, use `/templates/` as source
- Version control strategy in docs

---

**Risk Priority Matrix:**

| Risk | Phase | Severity | Mitigation Priority |
|------|-------|----------|---------------------|
| Mass template corruption | Phase 1 | 🔴 CRITICAL | P0 (dry-run, AST validation) |
| Premature code deletion | Phase 1 | 🔴 CRITICAL | P0 (archive, don't delete) |
| Incomplete validation | Phase 1 | 🔴 CRITICAL | P0 (3-tier validation) |
| Partial installation | Phase 2+ | 🔴 CRITICAL | P0 (transaction pattern) |
| Path traversal | Phase 2+ | 🔴 CRITICAL | P0 (strict validation) |
| Manual edits divergence | Post-migration | 🟡 HIGH | P1 (documentation) |
| Platform spec changes | Phase 2+ | 🟡 MODERATE | P1 (versioned adapters) |

## Technology Stack (Phase-Separated)

**All versions verified against npm registry, Jan 2026.**

### Phase 1 Migration Stack (Temporary)

**These dependencies will be ARCHIVED after Phase 1 completes.**

```json
{
  "devDependencies": {
    "gray-matter": "^4.0.3",
    "js-yaml": "^4.1.1",
    "ajv": "^8.17.1"
  }
}
```

| Library | Version | Purpose | Why | Lifespan |
|---------|---------|---------|-----|----------|
| **gray-matter** | 4.0.3 | Frontmatter parsing & modification | Extract, modify, re-stringify while preserving formatting | TEMPORARY |
| **js-yaml** | 4.1.1 | YAML validation | Validate structure after transformation | TEMPORARY |
| **ajv** | 8.17.1 | JSON Schema validation | Validate against official Claude/Copilot specs | TEMPORARY |

**Why these are temporary:**
- Only needed for one-time migration
- Phase 2+ never parses YAML (templates already correct)
- Dead weight after migration completes
- Will be archived to `.archive/phase-1-migration/`

### Phase 2+ Installation Stack (Permanent)

**These dependencies remain in codebase forever.**

```json
{
  "dependencies": {
    "commander": "^14.0.2",
    "fs-extra": "^11.3.3",
    "chalk": "^5.6.2",
    "@clack/prompts": "^0.11.0"
  },
  "devDependencies": {
    "vitest": "^4.0.18",
    "@vitest/ui": "^4.0.18"
  }
}
```

| Library | Version | Purpose | Why | Lifespan |
|---------|---------|---------|-----|----------|
| **commander** | 14.0.2 | CLI argument parsing | ESM support, clean API, widely used | PERMANENT |
| **fs-extra** | 11.3.3 | File operations | Atomic writes, promise-based, cross-platform | PERMANENT |
| **chalk** | 5.6.2 | Terminal colors | Simple, zero-config, ESM support | PERMANENT |
| **@clack/prompts** | 0.11.0 | Interactive CLI | Beautiful UI, spinners, disabled menu options | PERMANENT |
| **vitest** | 4.0.18 | Testing | ESM-native, fast, snapshot support | PERMANENT |

**Why these are permanent:**
- Core to installer functionality
- No YAML parsing (simple string replacement only)
- User-facing features (interactive prompts, colors)
- Testing infrastructure

### What NOT to Use

| Avoid | Why | Alternative |
|-------|-----|-------------|
| **EJS/Handlebars** | Template syntax conflicts with frontmatter | Plain string replacement |
| **ora** | Redundant | @clack/prompts has spinners |
| **inquirer** | Older API | @clack/prompts is modern |
| **yargs** | Worse ESM support | commander 14+ |
| **js-yaml (Phase 2)** | Doesn't handle frontmatter | Not needed (templates correct) |

### Bundle Size Impact

**Phase 1 (temporary):**
- gray-matter + js-yaml + ajv: ~180 KB minified
- Only during development, never shipped to users

**Phase 2+ (permanent):**
- commander + fs-extra + chalk + prompts: ~220 KB minified, ~60 KB gzipped
- Acceptable for npx usage (downloads fast)

## Implications for Roadmap

### Recommended Phase Structure

Based on combined research, the roadmap should follow this strict separation:

#### Phase 1: One-Time Migration (TEMPORARY CODE)

**Goal:** Convert `.github/` → `/templates/` with all corrections applied.

**Deliverables:**
- Migration script: `scripts/migrate-to-templates.js`
- Dry-run mode with diff preview
- 42 corrected template files in `/templates/`
- 42 `version.json` files with extracted metadata
- Validation report (all checks passed)
- Archived migration code in `.archive/phase-1-migration/`

**Technologies:** gray-matter, js-yaml, ajv (temporary)

**Key features from FEATURES.md:**
- ✅ Remove unsupported frontmatter fields
- ✅ Fix field naming (`tools` → `allowed-tools` for Claude)
- ✅ Convert tool arrays to platform formats
- ✅ Replace `arguments` with `argument-hint`
- ✅ Generate version files
- ✅ Insert template variables (`{{INSTALL_DIR}}`)
- ✅ Comprehensive validation

**Critical pitfalls to avoid (from PITFALLS.md):**
- ⚠️ Regex-based field removal (use AST)
- ⚠️ Mass corruption from bugs (dry-run mode mandatory)
- ⚠️ Premature code deletion (archive, don't delete)
- ⚠️ Incomplete validation (3-tier: static, semantic, runtime)

**Duration:** 3-5 days  
**Status:** After completion, code ARCHIVED (not deleted entirely)

---

#### Phase 2: Installation Pipeline (PERMANENT CODE)

**Goal:** Build installer that deploys templates to user directories.

**Deliverables:**
- CLI tool: `bin/install.js` (npx-compatible)
- Platform detection & adapters
- Interactive prompts with `@clack/prompts`
- Template rendering (simple string replacement)
- Atomic file operations with rollback
- Installation manifest & version tracking
- Cross-platform testing (macOS, Linux, Windows)

**Technologies:** commander, fs-extra, chalk, @clack/prompts (permanent)

**Key features from FEATURES.md:**
- ✅ Platform detection (Claude, GitHub, Codex)
- ✅ Interactive mode (no flags = prompts)
- ✅ Non-interactive mode (CI/CD support)
- ✅ Template rendering (`{{VARIABLES}}` replacement)
- ✅ Atomic writes with rollback
- ✅ Progress indicators & spinners
- ✅ Version detection & upgrade path

**Critical pitfalls to avoid (from PITFALLS.md):**
- ⚠️ Partial installation (transaction pattern)
- ⚠️ Path traversal (strict validation)
- ⚠️ Directory conflicts (pre-flight checks)
- ⚠️ Overwriting user customizations (backup first)

**Duration:** 5-7 days  
**Status:** Permanent codebase, maintained forever

---

#### Phase 3: Multi-Platform Support (PERMANENT ENHANCEMENT)

**Goal:** Extend to all platforms (Claude, GitHub, Codex, future).

**Deliverables:**
- Platform adapters for Claude, GitHub, Codex
- Platform-specific validation
- Cross-platform testing suite
- Documentation per platform

**Technologies:** Extends Phase 2 stack (no new dependencies)

**Key features from FEATURES.md:**
- ✅ All three platforms supported
- ✅ Platform-specific frontmatter transformations
- ✅ Tool name mapping per platform
- ✅ File extension handling
- ✅ Path reference corrections

**Duration:** 3-4 days  
**Status:** Permanent enhancement

---

### Phase Dependencies

**Sequential (must follow order):**
1. Phase 1 MUST complete before Phase 2 (templates required)
2. Phase 2 MUST work on one platform before Phase 3 (validate core)

**Parallel opportunities:**
- None — phases are strictly sequential

**Migration notes:**
- Phase 1 code is ARCHIVED after completion, not deleted entirely
- Emergency re-migration procedure documented
- Keep `.github/` as source of truth for 6 months
- Eventually delete `.github/`, use `/templates/` as source

### Research Flags

**Phase 1: No additional research needed** ✅
- All frontmatter corrections documented (PLATFORMS.md)
- Tool mappings verified (PLATFORMS.md)
- YAML manipulation patterns established (ECOSYSTEM.md)
- Validation strategy defined (RISKS.md)

**Phase 2: No additional research needed** ✅
- Template rendering approach decided (simple string replacement)
- Interactive CLI library selected (@clack/prompts)
- Transaction pattern documented (RISKS.md)
- Path validation strategy defined (RISKS.md)

**Phase 3: Minor research needed** ⚠️
- Codex-specific frontmatter specs (if different from GitHub)
- Platform detection methods for all three CLIs
- Cross-platform path handling edge cases (Windows)

**Later phases: Plugin system research needed** 📋
- Plugin discovery mechanisms (Phase 4+)
- ESLint vs Babel plugin patterns (Phase 4+)

### Confidence Levels by Phase

| Phase | Technology | Architecture | Risks | Overall |
|-------|------------|--------------|-------|---------|
| **Phase 1** | HIGH | HIGH | HIGH | **HIGH** ✅ |
| **Phase 2** | HIGH | HIGH | HIGH | **HIGH** ✅ |
| **Phase 3** | MEDIUM-HIGH | HIGH | MEDIUM | **MEDIUM-HIGH** ⚠️ |

**Ready to start:** Phase 1 (all research complete)  
**Blocked:** None

## Validation Strategy (Before Archiving Migration Code)

**CRITICAL:** Phase 1 migration code cannot be archived until ALL validation passes.

### Three-Tier Validation

#### Tier 1: Static Validation (Structure)

**Run after:** Each file transformation  
**Checks:**
- [ ] YAML parses without syntax errors
- [ ] Required fields present (`name`, `description`)
- [ ] No unsupported fields in frontmatter
- [ ] Field types correct (string vs array vs object)
- [ ] Template variables inserted correctly

**Tools:** js-yaml parser, ajv schema validation

```javascript
// Example validation
const schema = {
  type: 'object',
  required: ['name', 'description'],
  properties: {
    name: { type: 'string' },
    description: { type: 'string' },
    'allowed-tools': { type: 'string' },  // Claude skills
    tools: { type: ['array', 'string'] }  // GitHub
  },
  additionalProperties: false  // No unsupported fields
}

const valid = ajv.validate(schema, frontmatter)
```

#### Tier 2: Semantic Validation (Content)

**Run after:** All files transformed  
**Checks:**
- [ ] Tool names match platform specifications
- [ ] Agent → skill references valid (skills exist)
- [ ] Path variables use correct format (`{{VAR}}`)
- [ ] File extensions match platform conventions
- [ ] Version files created for each template
- [ ] No duplicate names across templates

**Tools:** Custom validators with platform specs

```javascript
// Example semantic validation
function validateToolNames(tools, platform) {
  const allowedTools = {
    claude: ['Read', 'Write', 'Edit', 'Bash', 'Grep', 'Glob', 'Task'],
    github: ['read', 'edit', 'execute', 'search', 'agent']
  }
  
  const toolList = Array.isArray(tools) 
    ? tools 
    : tools.split(',').map(t => t.trim())
  
  for (const tool of toolList) {
    if (!allowedTools[platform].includes(tool)) {
      throw new Error(`Invalid tool: ${tool} for ${platform}`)
    }
  }
}
```

#### Tier 3: Runtime Validation (Actual Installation)

**Run after:** Semantic validation passes  
**Checks:**
- [ ] Test installation succeeds for both platforms
- [ ] Skills load without errors in Claude CLI
- [ ] Agents load without errors in GitHub CLI
- [ ] Slash commands appear in menus
- [ ] Agent invocation works
- [ ] No path resolution errors

**Tools:** Integration tests with real CLIs

```bash
# Test installation script
#!/bin/bash

# Install to test directory
INSTALL_DIR="/tmp/gsd-test-install"
rm -rf "$INSTALL_DIR"

# Run installer
node bin/install.js --platform=claude --target="$INSTALL_DIR/.claude"

# Validate Claude skills load
claude --list-skills | grep "gsd-new-project" || exit 1

# Validate agents load
claude --list-agents | grep "gsd-executor" || exit 1

echo "✓ All runtime validation passed"
```

### Validation Checklist (Before Archiving)

**All must pass before archiving migration code:**

**Static (Structure):**
- [ ] All 42 template files parse without YAML errors
- [ ] All required fields present
- [ ] No unsupported fields remain
- [ ] Field types match platform specifications

**Semantic (Content):**
- [ ] All tool names valid for each platform
- [ ] All agent → skill references valid
- [ ] All path variables use correct syntax
- [ ] All version files created correctly (42 total)
- [ ] No duplicate template names

**Runtime (Installation):**
- [ ] Test installation succeeds (Claude)
- [ ] Test installation succeeds (GitHub)
- [ ] Skills load in Claude CLI without errors
- [ ] Agents load in GitHub CLI without errors
- [ ] Slash commands visible and functional
- [ ] Agent delegation works correctly

**Documentation:**
- [ ] Emergency recovery procedure documented
- [ ] Archive location documented in README
- [ ] Validation results saved to report file
- [ ] Manual review completed by at least one developer

### Emergency Recovery Procedure

**When to use:** Template bugs discovered after archiving.

**Prerequisites:**
- Migration code archived in `.archive/phase-1-migration/`
- Original `.github/` files unchanged in git history
- Emergency script: `scripts/emergency-remigrate.sh`

**Procedure:**

```bash
#!/bin/bash
# scripts/emergency-remigrate.sh

set -e

echo "⚠️  EMERGENCY RE-MIGRATION"
echo ""
echo "This will:"
echo "  1. Backup current /templates/"
echo "  2. Restore migration script from archive"
echo "  3. Re-run migration with latest fixes"
echo ""
read -p "Continue? [y/N] " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

# 1. Backup current templates
BACKUP_DIR="templates.backup.$(date +%Y%m%d-%H%M%S)"
mv templates "$BACKUP_DIR"
echo "✓ Backed up to $BACKUP_DIR"

# 2. Restore migration script
cp .archive/phase-1-migration/migrate-to-templates.js scripts/
echo "✓ Restored migration script"

# 3. Re-run migration
node scripts/migrate-to-templates.js --dry-run
echo ""
read -p "Dry-run looks good? Apply migration? [y/N] " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
  node scripts/migrate-to-templates.js --apply
  echo "✓ Re-migration complete"
else
  echo "❌ Aborted. Restoring backup..."
  rm -rf templates
  mv "$BACKUP_DIR" templates
fi
```

**Recovery checklist:**
- [ ] Backup current `/templates/` before re-migration
- [ ] Restore migration script from `.archive/`
- [ ] Apply fixes to migration script
- [ ] Run dry-run mode first
- [ ] Manually review diff output
- [ ] Run full 3-tier validation
- [ ] Test installations on both platforms
- [ ] Commit corrected templates
- [ ] Update archive with fixed migration code

## Ready for Phase 1

### What We Know (High Confidence) ✅

✅ **Phase separation architecture** — Two distinct concerns, two distinct stacks  
✅ **Technology stack** — Phase 1 temporary (gray-matter, js-yaml, ajv), Phase 2+ permanent (commander, prompts)  
✅ **Official frontmatter specs** — Verified against Claude & GitHub docs, unsupported fields identified  
✅ **Tool name mappings** — Complete mapping table from official docs  
✅ **Critical risks** — Identified with concrete mitigations for both phases  
✅ **Migration risks** — Mass corruption, premature deletion, incomplete validation  
✅ **Installation risks** — Partial installation, path traversal, directory conflicts  
✅ **Validation strategy** — 3-tier validation (static, semantic, runtime)  
✅ **Emergency recovery** — Documented procedure, archived migration code

### What to Build First (Phase 1 MVP)

**Goal:** Validate core migration pipeline with comprehensive safeguards.

**Scope:**
1. Read 42 template files from `.github/`
2. Parse YAML frontmatter with `gray-matter`
3. Remove unsupported fields (AST-based, NOT regex)
4. Fix field naming (`tools` → `allowed-tools` for Claude)
5. Convert tool arrays to platform-specific formats
6. Replace `arguments` with `argument-hint`
7. Generate `version.json` for extracted metadata
8. Insert template variables (`{{INSTALL_DIR}}`, etc.)
9. Write transformed files to `/templates/`
10. Run 3-tier validation
11. Generate validation report
12. Archive migration code to `.archive/phase-1-migration/`

**Success Criteria:**
- [ ] All 42 templates migrate without errors
- [ ] Dry-run mode shows accurate diffs
- [ ] All 3-tier validation checks pass
- [ ] Test installation succeeds on both platforms
- [ ] Skills load without errors in real CLIs
- [ ] Emergency recovery procedure tested
- [ ] Migration code archived (not deleted)
- [ ] Validation report committed to git

**What to Defer:**
- ❌ Interactive prompts (Phase 2)
- ❌ Multi-platform support beyond Claude/GitHub (Phase 3)
- ❌ Plugin system (Phase 4+)
- ❌ CI/CD integration (Phase 2)

**Estimated Duration:** 3-5 days for Phase 1 (migration + validation + archiving)

### Next Steps

1. **Implement migration script** — `scripts/migrate-to-templates.js` with dry-run mode
2. **Add 3-tier validation** — Static (ajv), semantic (custom), runtime (integration tests)
3. **Test emergency recovery** — Verify archive and re-migration procedure works
4. **Run full migration** — Convert all 42 files with validation
5. **Test installations** — Verify on both Claude and GitHub platforms
6. **Archive migration code** — Move to `.archive/phase-1-migration/`
7. **Document recovery procedure** — Add to README and script comments
8. **Commit everything** — Templates, version files, validation report, archive

**Blocked by:** Nothing — all research complete, ready to start Phase 1 ✅

---

## Confidence Assessment

| Area | Confidence | Source Quality | Notes |
|------|------------|----------------|-------|
| **Phase separation** | **HIGH** | Migration patterns, ETL pipelines | Clear architectural boundary |
| **Technology stack (Phase 1)** | **HIGH** | npm registry, package docs | All versions verified |
| **Technology stack (Phase 2)** | **HIGH** | npm registry, package docs | All versions verified |
| **Platform specs** | **HIGH** | Official Claude & GitHub docs | Comprehensive field tables |
| **Tool mappings** | **HIGH** | Official tool alias docs | Complete mapping verified |
| **Migration risks** | **HIGH** | Real-world migration failures | Concrete examples, proven mitigations |
| **Installation risks** | **HIGH** | Real-world installer failures | Transaction pattern established |
| **Validation strategy** | **HIGH** | Testing best practices | 3-tier approach proven in industry |
| **Emergency recovery** | **MEDIUM-HIGH** | Git workflows, backup patterns | Procedure documented but untested |

**Overall Confidence: HIGH** — Sufficient to start Phase 1 implementation immediately.

**Gaps:**
- Emergency recovery untested (test during Phase 1)
- Windows-specific edge cases (test during Phase 2)
- Codex platform specs (research during Phase 3)

---

## Sources

### Primary Sources (HIGH Confidence)

**Official Documentation:**
- Claude Code skills: https://code.claude.com/docs/en/slash-commands#frontmatter-reference
- Claude Code agents: https://code.claude.com/docs/en/sub-agents
- GitHub Copilot agents: https://docs.github.com/en/copilot/reference/custom-agents-configuration
- GitHub tool aliases: https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases

**Package Documentation:**
- gray-matter: https://github.com/jonschlinkert/gray-matter
- js-yaml: https://github.com/nodeca/js-yaml
- ajv: https://ajv.js.org/
- commander: https://github.com/tj/commander.js
- fs-extra: https://github.com/jprichardson/node-fs-extra
- @clack/prompts: https://github.com/bombshell-dev/clack
- vitest: https://vitest.dev/

**npm Registry:**
- All package versions verified against npm (2025-01-26)
- Bundle sizes measured from registry data

### Secondary Sources (MEDIUM Confidence)

**Design Patterns:**
- Database migration patterns (Flyway, Liquibase)
- ETL pipeline architecture
- Domain-driven design principles
- Functional pipeline architecture
- Adapter pattern (Gang of Four)
- Transaction pattern (database systems)

**Reference Implementations:**
- create-vite: https://github.com/vitejs/vite/tree/main/packages/create-vite
- ESLint plugin system: https://eslint.org/docs/latest/extend/plugins
- Babel plugin system: https://babeljs.io/docs/en/plugins

**Security:**
- OWASP Path Traversal: https://cheatsheetseries.owasp.org/cheatsheets/Path_Traversal_Cheat_Sheet.html
- npm security best practices

### Tertiary Sources (Needs Validation)

- Codex platform specifications (not yet researched)
- Windows path handling edge cases (not tested on real Windows)
- Plugin system for Phase 4+ (not researched yet)

---

**Research Date:** 2025-01-26  
**Re-researched Date:** 2025-01-26 (with migration architecture)  
**Synthesized By:** gsd-research-synthesizer  
**Status:** ✅ READY FOR PHASE 1 PLANNING

**Key Insight:** This project has TWO DISTINCT PHASES with different technology needs. Phase 1 (migration) is temporary code that will be archived. Phase 2+ (installation) is permanent code with no YAML parsing. Do NOT mix these concerns.
