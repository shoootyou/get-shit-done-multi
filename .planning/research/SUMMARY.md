# Project Research Summary

**Project:** get-shit-done-multi  
**Domain:** npx-based installer for multi-platform AI skills & agents  
**Researched:** 2025-01-26 (CORRECTED architecture)  
**Overall Confidence:** HIGH

## Executive Summary

**CRITICAL ARCHITECTURE CORRECTIONS:** This project is an **npx installer** (NOT a library) with a unique **two-phase architecture** where Phase 1 code is **completely deleted** after use.

### Phase 1: ONE-TIME Migration (DELETED after approval)
- **Purpose:** Convert `.github/` → `/templates/` with frontmatter corrections  
- **Lifespan:** ONE-TIME use, then **completely deleted** (`rm -rf scripts/`)  
- **Technology:** gray-matter (YAML parsing), ajv (validation) — temporary devDependencies  
- **Architecture:** Simple modular script (5-6 files max), NOT reusable components  
- **Critical gate:** **MANUAL VALIDATION REQUIRED** — Phase 1 PAUSES for user approval  
- **After approval:** ALL Phase 1 code deleted (exists ONLY in git history)

### Phase 2+: Installation (PERMANENT, written FRESH)
- **Purpose:** Install from `/templates/` → user directories (`.claude/`, `.github/`)  
- **Lifespan:** Permanent (core product)  
- **Technology:** commander, @inquirer/prompts, chalk, ora, execa — permanent dependencies  
- **Architecture:** `/bin/install.js` (executable) + `/lib` (internal helpers)  
- **NOT a library:** NO public API, NO index.js exports, NO reusable components  
- **NO migration logic:** Phase 2+ assumes templates are ALREADY correct

### CRITICAL ARCHITECTURAL CONSTRAINTS

**1. Complete Deletion (NO preservation):**
- After Phase 1 approval: `rm -rf scripts/`
- NO `.archive/` directory
- NO "emergency recovery" mechanisms
- Migration code exists ONLY in git history (not executable)

**2. Manual Validation Gate (MANDATORY):**
- Phase 1 completes → outputs validation report → PAUSES
- User manually reviews 42 generated templates
- User explicitly approves (cannot be automated)
- ONLY after approval: commit templates, delete migration code

**3. NO Code Reuse Between Phases:**
- Phase 1 and Phase 2+ are COMPLETELY SEPARATE
- Phase 2+ does NOT import ANY Phase 1 code
- MAY DUPLICATE LOGIC (that's OK, Phase 1 gets deleted)
- NO shared stages, NO composition patterns

**4. NOT a Library (npx installer pattern):**
- Entry point: `/bin/install.js` (executable with shebang)
- Internal helpers: `/lib/platforms/`, `/lib/templates/`, `/lib/io/`
- NO public API, NO exports for external consumers
- Users run `npx get-shit-done-multi`, NOT `import { install } from '...'`

### Key Migration Requirements

Current `.github/` files contain 42 templates with **unsupported frontmatter fields** that violate official specs. Phase 1 must:

1. Remove unsupported fields: `skill_version`, `requires_version`, `platforms`, `arguments`, `metadata`
2. Store metadata in separate `version.json` files
3. Fix field naming: `tools` → `allowed-tools` (Claude skills only)
4. Convert tool arrays to platform-specific formats
5. Replace `arguments` arrays with `argument-hint` strings
6. Insert template variables: `{{INSTALL_DIR}}`, `{{PLATFORM_ROOT}}`
7. Generate validation report for manual review
8. PAUSE for user approval before deletion

### Critical Risks & Mitigation

**RISK:** User approves migration with bugs → broken templates committed → Phase 1 deleted → cannot re-run  
**MITIGATION:** Make manual validation FOOLPROOF:
- Comprehensive automated pre-flight checks
- Detailed validation checklist (what to inspect)
- Test installation of 2+ templates before approval
- Explicit approval command (cannot rush through)

**RISK:** Bugs discovered after Phase 1 deletion → cannot re-run migration  
**MITIGATION:** Accept the trade-off:
- 1-3 files: Fix manually (faster than script)
- 5+ files: Write new focused script (reference git history)
- This is INTENTIONAL design (simplicity over recovery)

## Key Findings by Domain

### 1. Technology Stack (ECOSYSTEM.md)

**Confidence: HIGH** — All package versions verified against npm registry (Jan 2026).

**CRITICAL: Two distinct technology stacks for two distinct phases.**

#### Phase 1 Migration Stack (TEMPORARY - DELETED after approval)

```json
{
  "devDependencies": {
    "gray-matter": "^4.0.3",    // YAML frontmatter parsing (TEMPORARY)
    "ajv": "^8.17.1",           // JSON Schema validation (TEMPORARY)
    "ajv-formats": "^3.0.1"     // String format validation (TEMPORARY)
  }
}
```

**Why these libraries (Phase 1 only):**
- **gray-matter** — De facto standard for frontmatter parsing (stable since 2021)
- **ajv** — JSON Schema validation (8.17.1 latest, well-maintained)
- **ajv-formats** — Companion for date/URI validation
- **Status:** These dependencies **DELETED from package.json** after Phase 1 approval
- **NOT needed:** js-yaml (gray-matter handles YAML), fs-extra (native fs.promises sufficient)

#### Phase 2+ Installation Stack (PERMANENT)

```json
{
  "type": "module",
  "bin": {
    "get-shit-done-multi": "bin/install.js"
  },
  "dependencies": {
    "commander": "^14.0.2",      // CLI framework (industry standard)
    "@inquirer/prompts": "^8.2.0", // Interactive prompts (modern rewrite)
    "chalk": "^5.6.2",           // Terminal colors (universal standard)
    "ora": "^9.1.0",             // Spinners/progress (standard)
    "execa": "^9.6.1"            // Shell commands (better than child_process)
  }
}
```

**Why these libraries (Phase 2+):**
- **commander** — Industry standard CLI framework (used by Vue CLI, create-react-app)
- **@inquirer/prompts** — Modern, tree-shakeable (replaces monolithic inquirer)
- **chalk** — Universal terminal color library
- **ora** — Standard CLI spinner library (used by all major npx tools)
- **execa** — Promise-based shell commands (for git operations)
- **NO template engine** — Native string replacement (`String.replace()`)
- **NO fs-extra** — Native `fs.promises` sufficient (has `mkdir({ recursive: true })`)

**Key decision:** Phase 2+ does **NOT include YAML parsing**. Templates are pre-corrected by Phase 1. Installation only does string replacement and file copying with native Node.js APIs.

### 2. Platform Specifications (PLATFORMS.md)

**Confidence: HIGH** — All findings verified against official documentation.

**CRITICAL DISCOVERY:** Current `.github/` files use fields **NOT supported** by official specifications.

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

**Key correction:** Claude Skills use `allowed-tools` (string), GitHub uses `tools` (array).

#### Tool Name Mappings

| Copilot | Claude | Purpose |
|---------|--------|---------|
| `execute` | `Bash` | Execute shell command |
| `read` | `Read` | Read file contents |
| `edit` | `Edit` | File editing |
| `search` | `Grep` | Search files/text |
| `agent` | `Task` | Delegate to agent |

**Phase 1 transformation:**
- Convert `['execute', 'read']` → `'Bash, Read'` (Claude)
- Keep `['execute', 'read']` unchanged (GitHub)

### 3. Architecture & Domain Patterns (DOMAIN.md)

**Confidence: HIGH** — Based on npx installer patterns, one-time script architecture.

**CRITICAL: This is an npx installer (NOT a library), with complete Phase separation.**

#### Phase 1 Migration Architecture (DELETED after approval)

**Purpose:** ONE-TIME script that converts `.github/` → `/templates/`.

**Structure: Simple Modular Script (5-6 files max)**
```
scripts/migrate/              # ALL OF THIS GETS DELETED
├── index.js                  # Main orchestrator
├── read.js                   # Read .github/ files
├── parse.js                  # Parse frontmatter
├── transform.js              # Apply corrections
├── validate.js               # Validation report
└── write.js                  # Write to /templates/
```

**Key characteristics:**
- **Simple, not reusable** — Gets deleted, don't over-engineer
- **5-6 files max** — One file per major step
- **Synchronous is fine** — Performance doesn't matter
- **Liberal logging** — console.log everywhere
- **NO stage-based architecture** — Over-engineering for temporary code
- **NO reusable components** — Nothing to reuse after deletion

**Lifecycle:**
1. Run migration → generates `/templates/`
2. Output validation report
3. PAUSE for manual review
4. User approves explicitly
5. Commit templates to git
6. `rm -rf scripts/migrate/` (complete deletion)
7. Remove devDependencies from package.json
8. Commit deletion

#### Phase 2+ Installation Architecture (PERMANENT)

**Purpose:** npx installer that installs from `/templates/`.

**Structure: npx Installer (/bin + /lib)**
```
/
├── bin/
│   └── install.js              # Executable entry point
│
├── lib/                        # Internal helpers (NO public API)
│   ├── platforms/
│   │   ├── detect.js           # detectPlatform()
│   │   └── configs.js          # Platform configs
│   │
│   ├── templates/
│   │   ├── loader.js           # loadTemplates()
│   │   └── validator.js        # validateTemplate()
│   │
│   ├── rendering/
│   │   └── render.js           # String replacement
│   │
│   ├── io/
│   │   ├── copy.js             # copyFiles()
│   │   └── write.js            # writeFile()
│   │
│   └── prompts/
│       └── platform.js         # Interactive CLI
│
└── templates/                  # From Phase 1
    ├── skills/
    └── agents/
```

**Key characteristics:**
- **Direct imports** — Files import each other
- **NO index.js** — Not a library, no public API
- **Internal only** — All code is implementation detail
- **NO migration logic** — Assumes templates correct

**Anti-patterns to avoid:**
- ❌ Public API pattern (this is NOT a library)
- ❌ Stage reuse from Phase 1 (creates coupling)
- ❌ Preserving Phase 1 code (violates complete deletion)

### 4. Critical Risks & Mitigations (RISKS.md)

**Confidence: HIGH** — Based on migration patterns and security best practices.

#### Phase 1 Migration Risks (BEFORE deletion)

**🔴 CRITICAL: User Approves Migration With Bugs**

**Problem:** User approves without thorough review. Migration deleted. Later discover bugs in 13+ files.

**Mitigation: Make manual validation FOOLPROOF**

1. **Mandatory Validation Checklist:**
   - [ ] All 42 files parse as valid YAML
   - [ ] Pick 3 skills: Check `allowed-tools` correct
   - [ ] Pick 3 agents: Check `skills` format correct
   - [ ] Search for `{{INSTALL_DIR}}` - no typos
   - [ ] Test install 2+ templates
   - [ ] Review 10+ files in detail

2. **Explicit Approval Command:**
   ```bash
   npm run approve-migration
   # Prompts: "Type 'DELETE MIGRATION' to proceed:"
   ```

3. **Automated Pre-Flight Checks:**
   - All skill references valid
   - All tool names valid
   - No malformed variables
   - YAML syntax valid

**🔴 CRITICAL: Bugs After Deletion**

**Problem:** Bugs found after migration deleted. Cannot re-run.

**Mitigation: Accept the trade-off**

Options when bugs found:
1. **Fix manually** (1-3 files) — fastest
2. **Write new script** (5+ files) — reference git history
3. **Live with it** (non-critical) — document, fix in v2

This is INTENTIONAL design (simplicity over recovery).

#### Phase 2+ Installation Risks (AFTER deletion)

**🔴 CRITICAL: Partial Installations Without Rollback**

**Mitigation: Transaction pattern**
```javascript
class InstallTransaction {
  async commit() {
    try {
      for (const op of this.operations) {
        await op.execute()
        this.completed.push(op)
      }
    } catch (error) {
      await this.rollback()
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

**🔴 CRITICAL: Path Traversal Vulnerability**

**Mitigation: Path validation**
```javascript
function validateSkillName(name) {
  if (name.includes('..') || name.includes('~')) {
    throw new Error('Invalid characters')
  }
  if (!/^\/[a-z0-9-]+$/.test(name)) {
    throw new Error('Invalid format')
  }
}
```

## Manual Validation Strategy (CRITICAL)

**The ONLY defense against bugs is manual validation before deletion.**

### Phase 1 Validation Checklist (REQUIRED before approval)

```markdown
Migration complete. Before approving deletion:

### YAML Syntax (Automated)
- [ ] All 42 files parse as valid YAML
- [ ] No syntax errors reported

### Frontmatter Correctness (MANUAL)
- [ ] Pick 3 skills: `allowed-tools` use correct names
- [ ] Pick 3 agents: `skills` format correct
- [ ] version.json files have correct schema

### Template Variables (MANUAL)
- [ ] Search for `{{INSTALL_DIR}}` - correctly formatted
- [ ] No malformed variables (typos, partial replacements)

### Test Installation (CRITICAL)
- [ ] Install one skill: Renders correctly
- [ ] Install one agent: Renders correctly
- [ ] Both complete without errors

### Manual Review (HIGH SCRUTINY)
- [ ] Review 10+ files in detail (not just 2-3)
- [ ] Look for patterns of error
- [ ] Check both skills AND agents

ONLY approve if ALL checks pass.
After approval, migration code DELETED. Cannot re-run.
```

### Validation Output Format

```
✓ Migration executed successfully

📋 MANUAL VALIDATION REQUIRED

Before approving (npm run approve-migration), CHECK:

1. Frontmatter correctness:
   - Open templates/skills/gsd-new-project.md
   - Check allowed-tools: Read, Write, Bash (capitalized)

2. Template variables:
   - Search for {{INSTALL_DIR}} (correct)
   - Ensure no {{installdir}} (wrong)

3. Test installation:
   - Run: npm run test:install
   - Should complete without errors

4. Review at least 10 files manually

⚠️  After approval, migration code will be DELETED.
   You cannot re-run it. Validate thoroughly.

When ready: npm run approve-migration
```

## Implications for Roadmap

### Recommended Phase Structure

#### Phase 1: One-Time Migration (DELETED after approval)

**Goal:** Convert `.github/` → `/templates/` with all corrections.

**Deliverables:**
- Migration script: `scripts/migrate/index.js`
- 42 corrected template files in `/templates/`
- 42 `version.json` files with metadata
- Validation report
- Approved and DELETED migration code

**Technologies:** gray-matter, ajv (temporary devDependencies)

**Key features:**
- ✅ Remove unsupported frontmatter fields
- ✅ Fix field naming (`tools` → `allowed-tools` for Claude)
- ✅ Convert tool arrays to platform formats
- ✅ Replace `arguments` with `argument-hint`
- ✅ Generate version files
- ✅ Insert template variables
- ✅ Manual validation gate

**Critical pitfalls to avoid:**
- ⚠️ Premature approval (incomplete validation)
- ⚠️ Preserving migration code (violates deletion)
- ⚠️ Over-engineering (it gets deleted anyway)

#### Phase 2: Installer MVP (Claude Desktop only)

**Goal:** npx installer for single platform.

**Deliverables:**
- `/bin/install.js` (executable)
- `/lib` helpers (platforms, templates, rendering, io, prompts)
- Transaction-based installation
- Path traversal protection
- Basic error handling

**Technologies:** commander, @inquirer/prompts, chalk, ora, execa

**Key features:**
- ✅ Interactive platform selection
- ✅ Template loading from `/templates/`
- ✅ Variable rendering (string replacement)
- ✅ File copying with rollback
- ✅ Basic validation

**Critical pitfalls to avoid:**
- ⚠️ Public API pattern (it's NOT a library)
- ⚠️ Stage reuse from Phase 1 (no coupling)
- ⚠️ Partial installations without rollback

#### Phase 3: Multi-Platform Support

**Goal:** Support GitHub Copilot, add platform adapters.

**Deliverables:**
- Platform detection
- GitHub adapter
- Platform-specific rendering
- Extended validation

**Technologies:** Same as Phase 2

**Key features:**
- ✅ Multiple platform support
- ✅ Platform adapters
- ✅ Auto-detection
- ✅ Platform-specific validation

#### Phase 4+: Advanced Features

**Goal:** Polish, optimization, additional platforms.

**Deliverables:**
- Additional platforms (Codex CLI)
- CI/CD mode (non-interactive)
- Update checking
- Telemetry (opt-in)

### Research Flags

**Needs deeper research:**
- Phase 3: Platform detection mechanisms
- Phase 4: Codex CLI frontmatter specs

**Standard patterns (skip research):**
- Phase 2: Transaction pattern (well-documented)
- Phase 2: Path validation (security standard)

## Ready for Phase 1

**Prerequisites met:**
- ✅ Architecture understood (complete deletion, no reuse)
- ✅ Technology stack identified (gray-matter, ajv)
- ✅ Platform specs documented (unsupported fields)
- ✅ Validation strategy defined (manual gate)
- ✅ Risks identified (approval with bugs)
- ✅ Mitigations defined (comprehensive checklist)

**Next steps:**
1. Create Phase 1 migration script (simple modular structure)
2. Implement automated pre-flight checks
3. Create manual validation checklist
4. Run migration (output to `/templates/`)
5. PAUSE for manual review
6. Explicit approval (npm run approve-migration)
7. Delete migration code (rm -rf scripts/migrate/)
8. Remove devDependencies from package.json
9. Commit deletion
10. Proceed to Phase 2

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Architecture** | HIGH | Corrected: Complete deletion, no reuse, npx installer |
| **Stack** | HIGH | Verified versions (Jan 2026), minimal dependencies |
| **Platform specs** | HIGH | Based on official documentation |
| **Risks** | HIGH | Based on migration patterns, security best practices |
| **Manual validation** | HIGH | Comprehensive checklist, explicit approval |

### Gaps Identified

- Manual validation is critical but imperfect (human error possible)
- Bugs found after deletion require manual fixes (trade-off accepted)
- Platform specs may change (version detection needed in Phase 3)

### Overall Assessment

Research is comprehensive and actionable. Architecture corrections are critical:

**CORRECTED:**
- ❌ Stage-based reuse → ✅ Complete phase separation
- ❌ Public API pattern → ✅ npx installer with internal helpers
- ❌ Archive migration code → ✅ Complete deletion (rm -rf)
- ❌ Automatic approval → ✅ Manual validation gate

**Confidence to proceed:** HIGH

Roadmap can be created based on this research. Phase 1 is well-defined with clear constraints and validation strategy.

## Sources

**Official Documentation:**
- Claude Code skills: https://code.claude.com/docs/en/slash-commands#frontmatter-reference
- Claude Code agents: https://code.claude.com/docs/en/sub-agents
- GitHub Copilot agents: https://docs.github.com/en/copilot/reference/custom-agents-configuration
- GitHub tool aliases: https://docs.github.com/en/copilot/reference/custom-agents-configuration#tool-aliases

**Package Verification:**
- npm registry (verified Jan 2026): gray-matter 4.0.3, ajv 8.17.1, commander 14.0.2, @inquirer/prompts 8.2.0, chalk 5.6.2, ora 9.1.0, execa 9.6.1

**Architecture Patterns:**
- npx installer patterns (create-react-app, create-vite)
- One-time migration scripts (database migrations, codemod tools)
- Transaction patterns (database ACID, rollback mechanisms)
- Path traversal prevention (OWASP security)

**Research Date:** 2025-01-26
**Confidence:** HIGH (verified against official docs, established patterns)
