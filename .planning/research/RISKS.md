# Risk Analysis: Template-Based Multi-CLI Installer

**Project:** get-shit-done-multi  
**Researched:** 2025-01-25 (Updated: 2025-01-26 with migration risks)  
**Domain:** Template-based installer for AI CLI skills and agents  
**Confidence:** HIGH (based on established installer patterns, Node.js ecosystem practices, and security best practices)

---

## Executive Summary

Building a template-based installer that supports multiple AI CLI platforms (Claude, Copilot, Codex, and future platforms) introduces risks across **validation**, **versioning**, **extensibility**, **security**, and **one-time migration architecture**.

**CRITICAL MIGRATION RISKS (Phase 1):**
- **🔴 CRITICAL:** Migration errors corrupt all 42 template files with no recovery path
- **🔴 CRITICAL:** Premature deletion of migration code prevents bug fixes
- **🔴 CRITICAL:** Incomplete validation allows broken templates into production
- **🟡 HIGH:** Manual edits to `/templates/` diverge from `.github/` source
- **🟡 HIGH:** Future `.github/` updates have no re-migration path

**POST-MIGRATION RISKS (Phase 2+):**
- **🔴 CRITICAL:** Template bugs discovered after migration deletion require manual fixes
- **🟡 HIGH:** No conversion pipeline means template errors propagate to installations
- **🟡 MODERATE:** Version drift between platforms if templates manually edited

**INSTALLATION RISKS (All Phases):**
- **🔴 CRITICAL:** Partial installations without rollback can corrupt user environments
- **🔴 CRITICAL:** Path traversal vulnerabilities can overwrite system files
- **🟡 HIGH:** Breaking changes in CLI frontmatter specs can break existing templates
- **🟡 MODERATE:** Adding new platforms requires careful abstraction to avoid template pollution

**Architecture recommendation:** 
1. Phase 1: Comprehensive validation before deletion, keep migration code in git history
2. All Phases: Plugin-based adapter pattern with atomic installation transactions

---

## ⚠️ MIGRATION-SPECIFIC RISKS (Phase 1 Only)

These risks are unique to the **one-time migration architecture** where Phase 1 converts `.github/` → `/templates/` with frontmatter corrections, then deletes migration code.

---

### 🔴 CRITICAL: Mass Template Corruption from Migration Bugs

**What goes wrong:**
Migration script has a bug (incorrect regex, wrong tool mapping, malformed YAML). It runs successfully but corrupts frontmatter across **all 42 files**:
- 29 skills with broken `allowed-tools` fields
- 13 agents with invalid `skills` references
- Template variables incorrectly replaced
- Missing or malformed version files

**Why it happens:**
- Migration is ONE-TIME and processes all files in batch
- No incremental validation (all-or-nothing execution)
- Complex transformations (tool mappings, frontmatter parsing, reference extraction)
- Easy to test on one file, miss edge cases across 42 files

**Consequences:**
- All templates broken = installer completely non-functional
- If migration code deleted, must recreate transformations manually
- Lost work: hours debugging and manually fixing 42 files
- Can't re-run migration (code deleted, `.github/` unchanged)

**Example failure scenario:**
```javascript
// Migration bug: Regex matches too broadly
content = content.replace(/tools:\s*\[.*\]/g, 'tools: Read, Write, Bash')

// Corrupts agent content that mentions tools array in documentation:
// "The following tools: [read, edit] are available"
// → "The following tools: Read, Write, Bash are available" (WRONG)
```

**Prevention strategy:**

**1. Dry-run mode (mandatory first):**
```javascript
// scripts/migrate-to-templates.js --dry-run
async function migrate(options = {}) {
  const { dryRun = false } = options
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified')
  }
  
  for (const file of filesToMigrate) {
    const result = await processFile(file)
    
    if (dryRun) {
      console.log(`Would write: ${result.outputPath}`)
      console.log('Diff:', result.changes)
    } else {
      await fs.writeFile(result.outputPath, result.content)
    }
  }
  
  if (dryRun) {
    console.log('\n✓ Dry run complete. Review changes above.')
    console.log('To apply: npm run migrate:apply')
  }
}
```

**2. Incremental validation (file-by-file):**
```javascript
async function processFile(file) {
  const original = await fs.readFile(file, 'utf-8')
  const transformed = await applyTransformations(original)
  
  // Validate IMMEDIATELY after transformation
  const validation = validateFrontmatter(transformed)
  
  if (!validation.valid) {
    throw new Error(`Validation failed for ${file}: ${validation.errors}`)
  }
  
  return { content: transformed, validation }
}
```

**3. Checkpoint system (rollback on first failure):**
```javascript
class MigrationTransaction {
  constructor() {
    this.checkpoints = []
    this.completed = []
  }
  
  async processFile(file) {
    // Create checkpoint before transformation
    this.checkpoints.push({
      file,
      original: await fs.readFile(file, 'utf-8')
    })
    
    const result = await transformFile(file)
    
    // Validate BEFORE marking complete
    if (!result.valid) {
      await this.rollback()
      throw new Error(`Migration failed at ${file}`)
    }
    
    this.completed.push(result)
  }
  
  async rollback() {
    // Restore all original files
    for (const checkpoint of this.checkpoints) {
      await fs.writeFile(checkpoint.file, checkpoint.original)
    }
  }
}
```

**4. Reference integrity checks:**
```javascript
// After migration, verify cross-references work
async function validateReferences() {
  const errors = []
  
  // Check agent skill references
  for (const agent of agents) {
    const skillRefs = extractSkillReferences(agent.content)
    for (const ref of skillRefs) {
      const skillExists = await fs.pathExists(`templates/skills/${ref}/SKILL.md`)
      if (!skillExists) {
        errors.push(`Agent ${agent.name} references missing skill: ${ref}`)
      }
    }
  }
  
  // Check tool name consistency
  const allTools = extractAllTools()
  const invalidTools = allTools.filter(t => !VALID_TOOLS.includes(t))
  if (invalidTools.length > 0) {
    errors.push(`Invalid tools found: ${invalidTools.join(', ')}`)
  }
  
  return errors
}
```

**5. Official spec validation:**
```javascript
// Validate against Claude/Copilot official specs
async function validateAgainstSpecs(file) {
  const { frontmatter, content } = parseFile(file)
  
  // Check against Claude spec
  if (file.includes('claude')) {
    const allowedFields = ['name', 'description', 'allowed-tools', 'argument-hint', ...]
    const unknownFields = Object.keys(frontmatter).filter(k => !allowedFields.includes(k))
    
    if (unknownFields.length > 0) {
      return { valid: false, error: `Unknown fields: ${unknownFields}` }
    }
  }
  
  return { valid: true }
}
```

**Detection:**
- **Pre-migration:** Run dry-run and review ALL diffs manually
- **During migration:** Validate each file immediately after transformation
- **Post-migration:** Run comprehensive test suite against templates
- **Before deletion:** Manual spot-check 5-10 files for correctness

**Implementation checklist:**
- [ ] Migration has `--dry-run` mode (default: dry-run, must use `--apply` to execute)
- [ ] File-by-file validation with immediate failure on error
- [ ] Transaction system with rollback on first failure
- [ ] Reference integrity checker (agents → skills, tool names)
- [ ] Official spec validator (checks against Claude/Copilot docs)
- [ ] Manual review step in migration workflow (documented in README)
- [ ] Migration report shows before/after for ALL fields changed
- [ ] Keep `.github/` untouched as reference for comparison

**When safe to delete migration code:**
- ✅ Dry-run reviewed and approved
- ✅ Migration applied successfully with zero validation errors
- ✅ Manual spot-check confirms correctness (10+ files)
- ✅ Reference integrity verified (all skill references valid)
- ✅ Test suite passes against templates
- ✅ At least one successful installation test using templates
- ✅ Committed to git (can recover if needed)

**Phase mapping:** Phase 1 (migration script execution)

---

### 🔴 CRITICAL: Premature Deletion of Migration Code

**What goes wrong:**
Migration code deleted immediately after Phase 1 completes. Later discovery:
- Template has subtle bug (wrong tool mapping, malformed version.json)
- `.github/` updated with new skill (need to migrate one more file)
- Frontmatter spec changes (need to re-apply corrections)
- Must recreate migration logic manually or fix 42 files by hand

**Why it happens:**
- Excitement to "clean up" after Phase 1
- Assumption migration is perfect
- No buffer period for validation
- "Delete temporary code" interpreted too literally

**Consequences:**
- Can't re-run migration if bugs found
- Must manually fix template errors (hours of work)
- Lost institutional knowledge (migration logic only in deleted code)
- Risk of inconsistent manual fixes across templates

**Example failure scenario:**
```
Day 1: Phase 1 completes, migration code deleted
Day 3: Discover agent skill references are case-sensitive, migration used wrong case
Day 3: Must manually fix 13 agent files (no migration script to re-run)
Day 5: Another bug found in tool mappings
Day 5: Must manually audit all 42 files again
```

**Prevention strategy:**

**1. Keep migration code in git history (never truly delete):**
```bash
# After Phase 1 completes
git add scripts/migrate-to-templates.js
git commit -m "Phase 1: Migration script (preserved in history)"

# Move to archive directory instead of deleting
mkdir -p .archive/phase-1-migration
git mv scripts/migrate-to-templates.js .archive/phase-1-migration/
git commit -m "Phase 1: Archive migration script (can restore if needed)"

# Keep README explaining how to recover
cat > .archive/phase-1-migration/README.md << EOF
# Phase 1 Migration Script (Archived)

This migration script converted .github/ to /templates/ with frontmatter corrections.

## Recovery

If you need to re-run migration:
1. Restore this script: git checkout HEAD~1 -- scripts/migrate-to-templates.js
2. Delete /templates/ directory
3. Run: node scripts/migrate-to-templates.js --dry-run
4. Review changes, then: node scripts/migrate-to-templates.js --apply

## When to recover

- Template bugs discovered that affect multiple files
- Need to migrate new files added to .github/
- Frontmatter spec changes require re-applying corrections

EOF
```

**2. Validation period (don't delete immediately):**
```markdown
## Migration Completion Checklist

Phase 1 is NOT complete until:

- [ ] Migration executed successfully (zero errors)
- [ ] Manual spot-check completed (10+ files reviewed)
- [ ] Reference integrity validated
- [ ] Test suite passes (100% pass rate)
- [ ] Installation test completed (npx install using templates)
- [ ] **WAIT 7 DAYS for validation period**
- [ ] No bugs discovered during validation period
- [ ] Migration code archived (not deleted) to .archive/

**DO NOT delete migration code until validation period complete.**
```

**3. Emergency recovery procedure:**
```bash
#!/bin/bash
# scripts/emergency-remigrate.sh

set -e

echo "⚠️  EMERGENCY RE-MIGRATION"
echo ""
echo "This will:"
echo "  1. Delete current /templates/"
echo "  2. Restore migration script from git history"
echo "  3. Re-run migration with latest fixes"
echo ""
read -p "Continue? [y/N] " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

# Backup current templates
mv templates templates.backup.$(date +%Y%m%d-%H%M%S)

# Restore migration script
git show HEAD:scripts/migrate-to-templates.js > scripts/migrate-to-templates.js.recovered

# Re-run migration
node scripts/migrate-to-templates.js.recovered --apply

echo ""
echo "✓ Re-migration complete"
echo "  Review templates/, then:"
echo "    - If good: rm -rf templates.backup.*"
echo "    - If bad: mv templates.backup.* templates"
```

**4. Document migration decisions:**
```javascript
// scripts/migrate-to-templates.js

/**
 * MIGRATION DECISIONS LOG
 * 
 * Why this script exists:
 *   Phase 1 is ONE-TIME conversion from .github/ to /templates/ with frontmatter fixes.
 * 
 * Key transformations:
 *   - Tool names: Copilot aliases → Claude official (read → Read, execute → Bash)
 *   - Frontmatter: Remove unsupported fields (metadata, skill_version, etc.)
 *   - Template variables: Inject {{PLATFORM_ROOT}}, {{COMMAND_PREFIX}}
 *   - Version files: Extract metadata to version.json per skill
 * 
 * Validation:
 *   - Dry-run mode shows all changes before applying
 *   - File-by-file validation against official specs
 *   - Reference integrity checks (agents → skills)
 * 
 * Recovery:
 *   - Script preserved in .archive/phase-1-migration/
 *   - Can restore and re-run if bugs discovered
 *   - Emergency procedure: scripts/emergency-remigrate.sh
 * 
 * When to re-run:
 *   - Template bugs affecting multiple files
 *   - New files added to .github/ need migration
 *   - Frontmatter spec changes
 */
```

**Detection:**
- Don't rely on detection — **prevent deletion**
- Keep migration code in archive (not deleted)
- Document recovery procedure before Phase 1 completes

**When safe to archive (not delete):**
- ✅ 7+ days validation period completed
- ✅ Zero bugs discovered in templates
- ✅ At least 3 successful installations using templates
- ✅ Archived to `.archive/` with recovery instructions
- ✅ Emergency recovery procedure tested

**Phase mapping:** Phase 1 completion (archive decision)

---

### 🔴 CRITICAL: Incomplete Validation Allows Broken Templates

**What goes wrong:**
Migration completes with "success" message. Validation only checked:
- YAML parses (syntax check only)
- Files exist (presence check only)
- Missed deeper issues:
  - Tool names valid but wrong platform (used Copilot names in Claude templates)
  - Agent skill references point to non-existent skills
  - Template variables malformed (`{{PLATFORMROOT}}` instead of `{{PLATFORM_ROOT}}`)
  - version.json has correct schema but wrong values

**Why it happens:**
- Validation focuses on "can parse" not "is correct"
- No cross-reference checks (agents → skills)
- No platform-specific validation (Claude vs Copilot rules)
- No test installation attempt

**Consequences:**
- Templates appear valid but fail at installation time
- Users get cryptic errors ("skill not found", "invalid tool name")
- Debugging requires deep knowledge of platform specs
- Multiple iterations to fix (each iteration touches 42 files)

**Example failure scenario:**
```yaml
# Migration output (looks valid)
---
name: gsd-executor
tools: read, write, execute  # ❌ Wrong: Copilot names, should be Read, Write, Bash
skills: gsd-new-project      # ❌ Wrong: Missing path prefix /gsd-new-project
---

# YAML parses ✅
# File exists ✅
# But fails at runtime:
#   - Claude: "Unknown tool: read"
#   - Agent: "Skill not found: gsd-new-project"
```

**Prevention strategy:**

**1. Multi-layer validation:**
```javascript
// Validation layers (each must pass)
async function validateMigration() {
  const results = {
    syntax: await validateSyntax(),           // Layer 1: Parseable
    schema: await validateSchema(),           // Layer 2: Correct structure
    semantics: await validateSemantics(),     // Layer 3: Valid values
    references: await validateReferences(),   // Layer 4: Cross-references
    integration: await validateIntegration()  // Layer 5: Test install
  }
  
  const failures = Object.entries(results)
    .filter(([_, result]) => !result.valid)
  
  if (failures.length > 0) {
    throw new Error(`Validation failed: ${failures.map(f => f[0]).join(', ')}`)
  }
  
  return results
}
```

**2. Platform-specific validation:**
```javascript
// Validate Claude templates
async function validateClaudeTemplate(file) {
  const { frontmatter } = parseFile(file)
  const errors = []
  
  // Check tool names (must be capitalized official names)
  if (frontmatter['allowed-tools']) {
    const tools = frontmatter['allowed-tools'].split(',').map(t => t.trim())
    const validTools = ['Read', 'Write', 'Bash', 'Edit', 'Grep', 'Task']
    
    const invalidTools = tools.filter(t => !validTools.includes(t))
    if (invalidTools.length > 0) {
      errors.push(`Invalid Claude tools: ${invalidTools} (must be: ${validTools})`)
    }
  }
  
  // Check for Copilot-style aliases (common migration bug)
  if (frontmatter['allowed-tools']?.includes('execute')) {
    errors.push(`Found Copilot alias 'execute', should be 'Bash'`)
  }
  
  // Check frontmatter fields (no unsupported fields)
  const supportedFields = ['name', 'description', 'allowed-tools', 'argument-hint']
  const unsupportedFields = Object.keys(frontmatter).filter(k => !supportedFields.includes(k))
  
  if (unsupportedFields.length > 0) {
    errors.push(`Unsupported Claude fields: ${unsupportedFields}`)
  }
  
  return { valid: errors.length === 0, errors }
}
```

**3. Reference integrity validation:**
```javascript
// Check all cross-references resolve
async function validateReferences() {
  const errors = []
  
  // Build skill index
  const skills = await listSkills('templates/skills')
  const skillNames = skills.map(s => s.name)
  
  // Check agent skill references
  for (const agent of await listAgents('templates/agents')) {
    const { frontmatter, content } = parseFile(agent.path)
    
    // Check frontmatter skills field
    if (frontmatter.skills) {
      const refs = frontmatter.skills.split(',').map(s => s.trim())
      const missing = refs.filter(ref => !skillNames.includes(ref))
      
      if (missing.length > 0) {
        errors.push(`Agent ${agent.name} references missing skills: ${missing}`)
      }
    }
    
    // Check inline skill references in content
    const contentRefs = content.match(/{{COMMAND_PREFIX}}([a-z-]+)/g) || []
    for (const ref of contentRefs) {
      const skillName = ref.replace('{{COMMAND_PREFIX}}', '')
      if (!skillNames.includes(skillName)) {
        errors.push(`Agent ${agent.name} content references missing skill: ${skillName}`)
      }
    }
  }
  
  return { valid: errors.length === 0, errors }
}
```

**4. Test installation validation:**
```javascript
// Attempt actual installation in test environment
async function validateIntegration() {
  const testDir = path.join(os.tmpdir(), `gsd-test-${Date.now()}`)
  
  try {
    // Run installer using migrated templates
    await runInstaller({
      platform: 'claude',
      scope: 'local',
      targetDir: testDir,
      templatesDir: 'templates'
    })
    
    // Verify installation structure
    const errors = []
    
    // Check skill files exist and parse
    for (const skill of await listSkills('templates/skills')) {
      const installedPath = path.join(testDir, '.claude/skills', skill.name, 'SKILL.md')
      
      if (!await fs.pathExists(installedPath)) {
        errors.push(`Skill not installed: ${skill.name}`)
        continue
      }
      
      // Verify template variables replaced
      const content = await fs.readFile(installedPath, 'utf-8')
      if (content.includes('{{PLATFORM_ROOT}}')) {
        errors.push(`Skill ${skill.name} has unreplaced variables`)
      }
    }
    
    return { valid: errors.length === 0, errors }
    
  } finally {
    await fs.remove(testDir)
  }
}
```

**5. Comprehensive validation report:**
```javascript
// Generate detailed validation report
async function generateValidationReport() {
  const results = await validateMigration()
  
  console.log('📋 MIGRATION VALIDATION REPORT')
  console.log('=' .repeat(50))
  console.log()
  
  for (const [layer, result] of Object.entries(results)) {
    const icon = result.valid ? '✅' : '❌'
    console.log(`${icon} ${layer.toUpperCase()}`)
    
    if (!result.valid) {
      for (const error of result.errors) {
        console.log(`   ❌ ${error}`)
      }
    } else {
      console.log(`   ✅ ${result.summary}`)
    }
    console.log()
  }
  
  if (Object.values(results).every(r => r.valid)) {
    console.log('✅ MIGRATION VALIDATED - Safe to proceed')
  } else {
    console.log('❌ MIGRATION FAILED - Fix errors above')
    process.exit(1)
  }
}
```

**Detection:**
- Run comprehensive validation after migration
- Check all 5 layers (syntax, schema, semantics, references, integration)
- Review validation report manually

**Implementation checklist:**
- [ ] Syntax validation (YAML parses)
- [ ] Schema validation (correct field types)
- [ ] Semantic validation (tool names, platform-specific rules)
- [ ] Reference validation (agents → skills, template variables)
- [ ] Integration validation (test installation in temp directory)
- [ ] Validation report generated and reviewed
- [ ] Zero validation errors required before Phase 1 complete

**Phase mapping:** Phase 1 (validation after migration)

---

### 🟡 HIGH: Manual Template Edits Diverge from Source

**What goes wrong:**
After Phase 1, developer needs to:
- Fix a typo in skill description
- Add new argument to skill
- Update agent tool list

Developer edits `/templates/skills/gsd-new-project/SKILL.md` directly. Change works, but:
- `.github/skills/gsd-new-project/SKILL.md` unchanged (divergence)
- Next time migration runs (if ever), overwrites manual fix
- No record of why change was made
- Can't distinguish "template bug" from "intentional customization"

**Why it happens:**
- Templates are now source of truth, feels natural to edit them
- `.github/` is "old source", why keep it in sync?
- No clear workflow for "template updates"
- Tempting to make quick fixes directly

**Consequences:**
- Source and templates diverge (confusion about "real" source)
- Lost changes if migration ever re-run
- Difficult to track what's been customized vs migrated
- Can't easily regenerate templates from source

**Example failure scenario:**
```
Day 10: Fix typo in /templates/skills/gsd-debug/SKILL.md
Day 30: Add new skill to .github/skills/gsd-test/
Day 30: Run migration again to get gsd-test template
Day 30: Migration overwrites gsd-debug fix (typo back)
```

**Prevention strategy:**

**1. Clear "source of truth" documentation:**
```markdown
# TEMPLATES.md

## Source of Truth

After Phase 1 migration, `/templates/` is the PERMANENT source of truth.

### ⛔ DO NOT edit .github/

`.github/` directories are HISTORICAL REFERENCE ONLY:
- `.github/skills/` — Original source before migration
- `.github/agents/` — Original source before migration

DO NOT edit these files. Changes will not be reflected in templates.

### ✅ DO edit /templates/

To update skills or agents:
1. Edit files in `/templates/`
2. Commit with clear message explaining change
3. Tag as manual customization if not migrating from .github/

### Migration is ONE-TIME

Phase 1 migration ran once and is complete. Migration code archived.

If you need to add new files from .github/:
1. Manually copy to /templates/
2. Apply same transformations migration did
3. See .archive/phase-1-migration/README.md for reference
```

**2. Protect .github/ from edits:**
```json
// .github/.readonly-marker
{
  "note": "This directory is HISTORICAL REFERENCE ONLY",
  "do_not_edit": "Changes here will NOT affect templates",
  "source_of_truth": "/templates/",
  "migration_complete": "2025-01-26"
}
```

```bash
# Add git attributes to warn on edits
cat >> .gitattributes << EOF
# .github/ is historical reference only
.github/**/*.md linguist-generated=true
EOF
```

**3. Template change workflow:**
```markdown
## Template Update Workflow

### For bug fixes:
1. Edit file in `/templates/skills/` or `/templates/agents/`
2. Run validation: `npm run validate:templates`
3. Test installation: `npm run test:install`
4. Commit: `fix(templates): correct tool name in gsd-debug`

### For new features:
1. Add to `/templates/` directly (NOT .github/)
2. Create version.json if needed
3. Update CHANGELOG.md
4. Commit: `feat(templates): add argument-hint to gsd-new-project`

### For new skills (rare):
1. Create in `/templates/skills/gsd-new-skill/`
2. Apply same structure as existing skills
3. Create version.json
4. Reference .archive/phase-1-migration for format examples
```

**4. Divergence detection:**
```javascript
// scripts/check-divergence.js
// Compare .github/ vs /templates/ to detect manual edits

async function checkDivergence() {
  const divergences = []
  
  for (const skill of await listSkills('.github/skills')) {
    const sourcePath = `.github/skills/${skill.name}/SKILL.md`
    const templatePath = `templates/skills/${skill.name}/SKILL.md`
    
    if (!await fs.pathExists(templatePath)) {
      continue // Template deleted intentionally
    }
    
    // Reverse template transformations to compare
    const sourceContent = await fs.readFile(sourcePath, 'utf-8')
    const templateContent = await fs.readFile(templatePath, 'utf-8')
    const denormalizedTemplate = reverseTransformations(templateContent)
    
    if (sourceContent !== denormalizedTemplate) {
      divergences.push({
        file: skill.name,
        reason: 'Template has manual customizations not in source'
      })
    }
  }
  
  if (divergences.length > 0) {
    console.log('⚠️  Divergence detected (manual edits in templates):')
    for (const d of divergences) {
      console.log(`  - ${d.file}: ${d.reason}`)
    }
  } else {
    console.log('✅ No divergence (templates match source)')
  }
}
```

**Detection:**
- Periodic divergence check (weekly?)
- Code review catches direct .github/ edits
- CI warning if .github/ modified after Phase 1

**Implementation checklist:**
- [ ] TEMPLATES.md documents source of truth
- [ ] .github/ marked as historical reference
- [ ] Template change workflow documented
- [ ] Divergence checker script available
- [ ] Code review guidelines enforce template-first edits

**Phase mapping:** Phase 2+ (ongoing template maintenance)

---

### 🟡 HIGH: No Re-Migration Path for Future Updates

**What goes wrong:**
Six months after Phase 1:
- `.github/` repository releases new skill (`gsd-monitor`)
- Frontmatter spec changes (new `hooks` field supported)
- Need to add new skill and update all existing templates
- But: Migration code deleted, transformations lost

Must either:
- Manually recreate migration logic (hours of work)
- Manually copy and transform new skill (error-prone)
- Skip update entirely (miss new features)

**Why it happens:**
- Assumed migration is truly "one-time" (never need again)
- No plan for incorporating upstream updates
- `.github/` continues evolving while templates static

**Consequences:**
- Templates drift from latest `.github/` source
- New skills not available to template users
- Spec improvements not adopted
- Manual work for each update (high friction)

**Example failure scenario:**
```
Phase 1: Migrate 29 skills from .github/
Phase 1: Delete migration code
6 months later: .github/ has 35 skills (6 new)
6 months later: Need to manually port 6 skills to /templates/
6 months later: Each skill takes 20 minutes (formatting, tool mapping, validation)
6 months later: 2 hours of manual work per update
```

**Prevention strategy:**

**1. Keep migration code accessible (already covered above):**
- Archive migration script to `.archive/phase-1-migration/`
- Document recovery procedure
- Keep git history intact

**2. Template update procedure:**
```markdown
## Adding New Skills from .github/

If new skills added to .github/ repository:

### Option A: Use archived migration script

1. Restore migration script:
   ```bash
   git show HEAD:.archive/phase-1-migration/migrate-to-templates.js > scripts/migrate.js
   ```

2. Modify to process only new files:
   ```javascript
   const newSkills = ['gsd-monitor', 'gsd-benchmark']
   for (const skill of newSkills) {
     await migrateSkill(skill)
   }
   ```

3. Run and validate:
   ```bash
   node scripts/migrate.js --dry-run
   node scripts/migrate.js --apply
   npm run validate:templates
   ```

### Option B: Manual migration

1. Copy new skill to templates:
   ```bash
   cp -r .github/skills/gsd-monitor templates/skills/
   ```

2. Apply transformations manually:
   - Fix frontmatter (remove unsupported fields)
   - Map tool names (execute → Bash, etc.)
   - Inject template variables
   - Create version.json

3. Validate:
   ```bash
   npm run validate:templates -- --file templates/skills/gsd-monitor
   ```

### Reference

See `.archive/phase-1-migration/` for transformation examples.
```

**3. Upstream sync strategy:**
```javascript
// scripts/sync-from-upstream.js
// Semi-automated sync of new files from .github/

async function syncFromUpstream() {
  console.log('🔄 Checking for new files in .github/...')
  
  const sourceSkills = await listSkills('.github/skills')
  const templateSkills = await listSkills('templates/skills')
  
  const newSkills = sourceSkills.filter(s => 
    !templateSkills.find(t => t.name === s.name)
  )
  
  if (newSkills.length === 0) {
    console.log('✅ No new skills to sync')
    return
  }
  
  console.log(`📦 Found ${newSkills.length} new skills:`)
  for (const skill of newSkills) {
    console.log(`  - ${skill.name}`)
  }
  
  console.log()
  console.log('To migrate these skills:')
  console.log('  1. Restore migration script: npm run restore:migration')
  console.log('  2. Modify to process new skills only')
  console.log('  3. Run migration: npm run migrate:apply')
  console.log()
  console.log('Or migrate manually:')
  console.log('  1. Copy to templates/')
  console.log('  2. Apply transformations (see .archive/phase-1-migration/)')
  console.log('  3. Validate: npm run validate:templates')
}
```

**4. Template versioning:**
```json
// templates/VERSION
{
  "template_version": "1.0.0",
  "source_commit": "abc123def",  // .github/ commit used for migration
  "migrated_at": "2025-01-26",
  "skills_count": 29,
  "agents_count": 13,
  "last_sync": "2025-01-26"
}
```

**Detection:**
- Regular checks for new skills in .github/
- Automated upstream sync checker (CI job?)
- Template version tracking

**Implementation checklist:**
- [ ] Migration script archived (not deleted)
- [ ] Template update procedure documented
- [ ] Upstream sync checker available
- [ ] Template VERSION file tracks source commit
- [ ] Clear workflow for adding new skills

**Phase mapping:** Phase 2+ (ongoing maintenance)

---

## 🔴 POST-MIGRATION RISKS (Phase 2+)

These risks emerge after Phase 1 migration completes and migration code is deleted/archived.

---

### 🔴 CRITICAL: Template Bugs Discovered After Migration Deletion

**What goes wrong:**
Phase 1 complete, migration archived. Phase 3 development starts (multi-platform support). Discover bug:
- Agent skill references missing leading slash (should be `/gsd-new-project`, not `gsd-new-project`)
- Affects all 13 agents
- Migration script could fix in seconds, but it's archived
- Must manually edit 13 files

Worse: Bug found in production after installation:
- Tool mapping was wrong (used Copilot names instead of Claude)
- Installer fails for all users
- Emergency hotfix needed, but templates already shipped

**Why it happens:**
- Validation missed edge cases
- Bugs only surface during integration (Phase 2-3 development)
- Real-world usage reveals issues testing didn't catch

**Consequences:**
- Manual fixes across multiple files (error-prone)
- Inconsistent fixes if done in batches
- Emergency hotfix pressure leads to mistakes
- Users experience broken installations

**Example failure scenario:**
```
Phase 1: Migration complete, validated, archived
Phase 2: Build installer using templates
Phase 3: Test installation — works!
v2.0 Release: Users install, report errors:
  "Skill not found: gsd-new-project"
  "Invalid tool name: execute"
Root cause: Migration bug in skill references, tool mappings
Fix requires: Edit all 42 template files manually
Time to fix: 2-4 hours
Risk: Manual edits introduce new bugs
```

**Prevention strategy:**

**1. Extended validation period (covered above):**
- Don't archive migration immediately
- Wait 7+ days for bug discovery
- Run comprehensive test suite
- Attempt real installations

**2. Quick recovery procedure:**
```bash
#!/bin/bash
# scripts/emergency-fix-templates.sh

echo "🚨 EMERGENCY TEMPLATE FIX"
echo ""
echo "This restores migration script for emergency fixes."
echo "Use only for bugs affecting multiple templates."
echo ""

# Restore migration from archive
cp .archive/phase-1-migration/migrate-to-templates.js scripts/

# Backup current templates
cp -r templates templates.backup.$(date +%Y%m%d-%H%M%S)

# Run migration with fix
node scripts/migrate-to-templates.js --apply

echo ""
echo "✓ Templates regenerated"
echo "  1. Test installation"
echo "  2. If good: rm -rf templates.backup.*"
echo "  3. If bad: restore from templates.backup.*"
```

**3. Template test suite (catches bugs before production):**
```javascript
// tests/templates.test.js

describe('Template Validation', () => {
  it('all agent skill references are valid', async () => {
    const agents = await loadAllAgents('templates/agents')
    const skills = await loadAllSkills('templates/skills')
    const skillNames = skills.map(s => s.name)
    
    for (const agent of agents) {
      const refs = extractSkillReferences(agent)
      for (const ref of refs) {
        expect(skillNames).toContain(ref)
      }
    }
  })
  
  it('all tool names are valid for Claude', async () => {
    const validTools = ['Read', 'Write', 'Bash', 'Edit', 'Grep', 'Task']
    const skills = await loadAllSkills('templates/skills')
    
    for (const skill of skills) {
      if (skill.frontmatter['allowed-tools']) {
        const tools = skill.frontmatter['allowed-tools'].split(',').map(t => t.trim())
        for (const tool of tools) {
          expect(validTools).toContain(tool)
        }
      }
    }
  })
  
  it('no unreplaced template variables in content', async () => {
    const allFiles = await glob('templates/**/*.md')
    for (const file of allFiles) {
      const content = await fs.readFile(file, 'utf-8')
      // Template variables should exist in templates (replaced during install)
      // But check for malformed variables
      expect(content).not.toMatch(/\{\{[^}]*\}\}/g) // No partial variables
    }
  })
})
```

**4. Phased rollout (catch bugs before full release):**
```markdown
## Release Strategy

### Alpha (Internal Testing)
- Install templates on dev machines
- Use for real work (dogfooding)
- Duration: 1 week
- Goal: Catch integration bugs

### Beta (Limited Release)
- Release to npm with `beta` tag
- Invite 5-10 early adopters
- Duration: 1 week
- Goal: Catch real-world usage bugs

### Production Release
- Only after alpha + beta validation
- Full npm release
- Documented known issues

**If bugs found:** Restore migration, fix templates, re-release
```

**5. Template hot-fix procedure:**
```markdown
## Emergency Template Hot-Fix

If critical bug found in released templates:

### Step 1: Assess impact
- How many templates affected?
- Can users work around it?
- Is migration restore needed?

### Step 2: Quick fix (1-2 templates)
- Edit templates directly
- Run validation: `npm run validate:templates`
- Test install: `npm run test:install`
- Release patch: `npm version patch && npm publish`

### Step 3: Migration restore (3+ templates)
- Run: `scripts/emergency-fix-templates.sh`
- Fix migration script bug
- Regenerate all templates
- Validate and test
- Release patch

### Step 4: Post-mortem
- Why did validation miss this?
- Add test case to prevent recurrence
- Update validation checklist
```

**Detection:**
- Comprehensive test suite (run before archive)
- Alpha/beta testing phase
- Monitor production errors
- Quick recovery procedure ready

**Implementation checklist:**
- [ ] Extended validation period (7+ days)
- [ ] Emergency fix script ready
- [ ] Template test suite comprehensive
- [ ] Phased rollout strategy
- [ ] Hot-fix procedure documented
- [ ] Migration can be restored quickly

**Phase mapping:** Phase 2+ (after migration archived)

---

### 🟡 HIGH: No Conversion Pipeline for Template Bug Fixes

**What goes wrong:**
After Phase 1, discover that:
- All agent tool names need updating (new spec released)
- All skills need new `hooks` field added
- Template variable format changes (`{{VAR}}` → `${{VAR}}`)

No conversion pipeline exists (migration deleted). Must either:
- Manually edit 42 files (hours, error-prone)
- Write new script from scratch (recreate migration work)

**Why it happens:**
- Migration was "one-time" architecture
- No plan for bulk template updates
- Assumed templates are static after Phase 1

**Consequences:**
- High friction for template maintenance
- Bulk changes avoided due to manual work
- Templates become stale/outdated
- Quality degrades over time

**Prevention strategy:**

**1. Keep migration as "template maintenance tool":**
```markdown
## Migration Script Purpose (Revised)

The migration script is not just for ONE-TIME migration.

### Primary uses:
1. ✅ Phase 1: Initial migration (.github/ → /templates/)
2. ✅ Ongoing: Bulk template updates
3. ✅ Emergency: Fix bugs across multiple templates
4. ✅ Maintenance: Apply spec changes to all templates

### Do NOT delete migration permanently

Archive to `.archive/`, but keep accessible for bulk operations.
```

**2. Generalized transformation system:**
```javascript
// scripts/transform-templates.js
// Generic tool for bulk template updates

import { globby } from 'globby';
import fs from 'fs-extra';

async function applyTransformation(files, transformer) {
  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8')
    const transformed = await transformer(content, file)
    await fs.writeFile(file, transformed)
    console.log(`✓ ${file}`)
  }
}

// Example transformations
const transformers = {
  // Update tool names
  updateToolNames: (content) => {
    return content
      .replace(/tools:\s*execute/g, 'tools: Bash')
      .replace(/tools:\s*read/g, 'tools: Read')
  },
  
  // Add new frontmatter field
  addHooksField: (content) => {
    const { frontmatter, body } = parseFrontmatter(content)
    frontmatter.hooks = { onLoad: 'initialize' }
    return serializeFrontmatter(frontmatter, body)
  },
  
  // Update template variable format
  updateVariableFormat: (content) => {
    return content.replace(/\{\{(\w+)\}\}/g, '$$\{\{$1\}\}')
  }
}

// Usage:
// node scripts/transform-templates.js --transformer=updateToolNames --files="templates/**/*.md"
```

**3. Template maintenance playbook:**
```markdown
## Template Maintenance Playbook

### Scenario: Update tool names across all templates

**Before:**
```yaml
tools: read, execute
```

**After:**
```yaml
tools: Read, Bash
```

**Procedure:**
1. Write transformation function:
   ```javascript
   function updateTools(content) {
     return content
       .replace(/tools:\s*read/gi, 'tools: Read')
       .replace(/tools:\s*execute/gi, 'tools: Bash')
   }
   ```

2. Test on single file:
   ```bash
   node scripts/transform-templates.js \
     --transformer=updateTools \
     --files="templates/skills/gsd-debug/SKILL.md" \
     --dry-run
   ```

3. Review changes, then apply to all:
   ```bash
   node scripts/transform-templates.js \
     --transformer=updateTools \
     --files="templates/**/*.md"
   ```

4. Validate:
   ```bash
   npm run validate:templates
   npm run test:install
   ```

5. Commit:
   ```bash
   git add templates/
   git commit -m "chore(templates): update tool names to official format"
   ```
```

**4. Version migration strategy:**
```javascript
// templates/migrations/
// Keep template migrations like database migrations

export const migrations = [
  {
    version: '1.0.0',
    description: 'Initial migration from .github/',
    up: async () => { /* original migration */ },
    down: async () => { /* rollback */ }
  },
  {
    version: '1.1.0',
    description: 'Update tool names to official format',
    up: async () => {
      await applyTransformation('templates/**/*.md', updateToolNames)
    },
    down: async () => {
      await applyTransformation('templates/**/*.md', revertToolNames)
    }
  },
  {
    version: '1.2.0',
    description: 'Add hooks field to all skills',
    up: async () => {
      await applyTransformation('templates/skills/**/*.md', addHooksField)
    },
    down: async () => {
      await applyTransformation('templates/skills/**/*.md', removeHooksField)
    }
  }
]

// Run migrations
// node scripts/migrate-templates.js up   # Apply pending migrations
// node scripts/migrate-templates.js down # Rollback last migration
```

**Detection:**
- Need for bulk changes identified
- Transformation tool available

**Implementation checklist:**
- [ ] Keep migration script as maintenance tool
- [ ] Generic transformation system available
- [ ] Template maintenance playbook documented
- [ ] Migration versioning system (like DB migrations)
- [ ] Each bulk change logged and reversible

**Phase mapping:** Phase 2+ (ongoing maintenance)

---

## Risk Categories

### 🔴 Critical Risks
Issues that can corrupt user environments, cause data loss, or create security vulnerabilities.

### 🟡 Moderate Risks
Issues that cause installation failures, maintenance burden, or poor user experience.

### 🟢 Minor Risks
Issues that cause annoyance but are easily recoverable.

---

## 1. Validation & Error Handling Risks

### 🔴 CRITICAL: Partial Installations Without Rollback

**What goes wrong:**
Installation fails halfway through (e.g., permission denied on one file, disk space exhausted). User is left with:
- Some skills installed, others missing
- Inconsistent state between platforms
- Broken references in installed files

**Why it happens:**
- File operations performed incrementally without transaction tracking
- No manifest of "what was installed" to enable cleanup
- Error handling that exits immediately without cleanup

**Consequences:**
- User must manually identify and remove partial installations
- Subsequent reinstall attempts may fail due to existing partial state
- Difficult to debug what's actually installed

**Mitigation strategy:**

```javascript
// Use transaction pattern
class InstallTransaction {
  constructor() {
    this.operations = []
    this.completed = []
  }
  
  async addOperation(operation) {
    this.operations.push(operation)
  }
  
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
    // Reverse completed operations
    for (const op of this.completed.reverse()) {
      await op.undo()
    }
  }
}

// Usage
const tx = new InstallTransaction()
tx.addOperation(new CopyFileOperation(src, dest))
tx.addOperation(new CreateDirectoryOperation(dir))
await tx.commit() // All or nothing
```

**Detection:**
- Pre-installation: Check for partial installation markers
- During installation: Track each operation in manifest
- Post-installation: Verify complete manifest against expected files

**Implementation checklist:**
- [ ] Transaction manager tracks all file operations
- [ ] Each operation implements `execute()` and `undo()`
- [ ] Installation creates `.gsd-install.lock` with operation log
- [ ] Rollback removes all files created during transaction
- [ ] Lock file cleaned up only on successful completion

---

### 🔴 CRITICAL: Directory Already Exists Conflicts

**What goes wrong:**
Target directories (`.claude/skills/gsd-*`, `.github/skills/gsd-*`) already exist from:
- Previous installation
- Manual user setup
- Different GSD version
- Name collision with unrelated content

**Why it happens:**
- No pre-flight validation of target state
- No detection of existing installation version
- No merge strategy for existing content

**Consequences:**
- Overwriting user customizations
- Mixed version states (old + new files)
- Breaking existing workflows
- Data loss of user modifications

**Mitigation strategy:**

```javascript
// Pre-flight validation
async function validateTargetState(targetPath, options = {}) {
  const { force, merge, backup } = options
  
  if (!fs.existsSync(targetPath)) {
    return { status: 'clean', action: 'install' }
  }
  
  // Check for installation marker
  const markerPath = path.join(targetPath, '.gsd-meta.json')
  if (fs.existsSync(markerPath)) {
    const meta = JSON.parse(fs.readFileSync(markerPath))
    
    if (meta.version === CURRENT_VERSION) {
      return { status: 'up-to-date', action: 'skip' }
    }
    
    if (force) {
      return { status: 'outdated', action: 'backup-and-replace' }
    }
    
    // Version comparison
    if (semver.gt(CURRENT_VERSION, meta.version)) {
      return { status: 'outdated', action: 'upgrade', from: meta.version }
    } else {
      return { status: 'newer', action: 'abort', installed: meta.version }
    }
  }
  
  // Unknown content in directory
  if (options.force) {
    return { status: 'unknown', action: 'backup-and-replace' }
  }
  
  return { 
    status: 'conflict', 
    action: 'abort',
    message: 'Directory exists without GSD marker. Use --force to overwrite.'
  }
}
```

**Handling strategies:**

| Scenario | Default Action | With `--force` | With `--backup` |
|----------|---------------|----------------|-----------------|
| No directory | Install | Install | Install |
| Same version | Skip | Reinstall | Reinstall + backup |
| Older version | Prompt to upgrade | Upgrade | Upgrade + backup old |
| Newer version | Abort (safety) | Downgrade (warn) | Downgrade + backup |
| Unknown content | Abort (safety) | Replace | Backup + replace |

**Detection:**
- Pre-installation: Scan all target directories
- Check for `.gsd-meta.json` marker files
- Compare versions if marker exists
- List files that would be affected

**Implementation checklist:**
- [ ] Every installation writes `.gsd-meta.json` with version
- [ ] Pre-flight check validates all target directories
- [ ] Interactive prompt for conflicts (unless `--force` or CI mode)
- [ ] Backup creates timestamped `.gsd-backup-YYYYMMDD-HHMMSS/`
- [ ] Clear error messages explain conflict and resolution options

---

### 🟡 MODERATE: Template Validation Failures

**What goes wrong:**
Templates fail validation because:
- Missing required frontmatter fields
- Invalid YAML syntax
- Referenced files don't exist
- Circular dependencies
- Platform compatibility mismatches

**Why it happens:**
- Template authors make mistakes
- Template format evolves
- No validation during template development
- No CI checks for template correctness

**Consequences:**
- Installation fails after user runs command
- Unclear error messages ("YAML parse error at line 42")
- Wastes user time debugging
- Damages trust in installer

**Mitigation strategy:**

```javascript
// JSON Schema for frontmatter validation
const skillFrontmatterSchema = {
  type: 'object',
  required: ['name', 'description', 'skill_version', 'platforms'],
  properties: {
    name: { 
      type: 'string', 
      pattern: '^gsd-[a-z0-9-]+$',
      description: 'Skill name must start with gsd-'
    },
    description: { 
      type: 'string',
      minLength: 10,
      maxLength: 200
    },
    skill_version: { 
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+$'
    },
    requires_version: {
      type: 'string',
      pattern: '^\\d+\\.\\d+\\.\\d+\\+?$'
    },
    platforms: {
      type: 'array',
      items: { enum: ['claude', 'copilot', 'codex'] },
      minItems: 1
    },
    tools: {
      type: 'array',
      items: { type: 'string' }
    },
    arguments: {
      type: 'array',
      items: {
        type: 'object',
        required: ['name', 'type'],
        properties: {
          name: { type: 'string' },
          type: { enum: ['string', 'number', 'boolean', 'array', 'object'] },
          required: { type: 'boolean' },
          description: { type: 'string' }
        }
      }
    }
  },
  additionalProperties: true // Allow platform-specific extensions
}

// Validation function
async function validateTemplate(templatePath) {
  const errors = []
  const warnings = []
  
  // 1. File exists
  if (!fs.existsSync(templatePath)) {
    errors.push({ type: 'missing', message: `Template not found: ${templatePath}` })
    return { valid: false, errors, warnings }
  }
  
  // 2. Parse frontmatter
  const content = fs.readFileSync(templatePath, 'utf-8')
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/)
  
  if (!frontmatterMatch) {
    errors.push({ type: 'format', message: 'Missing YAML frontmatter' })
    return { valid: false, errors, warnings }
  }
  
  let frontmatter
  try {
    frontmatter = yaml.parse(frontmatterMatch[1])
  } catch (e) {
    errors.push({ 
      type: 'yaml', 
      message: `YAML parse error: ${e.message}`,
      line: e.mark?.line 
    })
    return { valid: false, errors, warnings }
  }
  
  // 3. Validate against schema
  const ajv = new Ajv()
  const validate = ajv.compile(skillFrontmatterSchema)
  
  if (!validate(frontmatter)) {
    for (const error of validate.errors) {
      errors.push({
        type: 'schema',
        field: error.instancePath,
        message: error.message
      })
    }
  }
  
  // 4. Check referenced files
  const body = content.slice(frontmatterMatch[0].length)
  const fileRefs = body.match(/@[~\/]?[\w\/.-]+/g) || []
  
  for (const ref of fileRefs) {
    const refPath = ref.slice(1) // Remove @
    // Check if referenced file exists in template set
    if (!templateExists(refPath)) {
      warnings.push({
        type: 'reference',
        message: `Referenced file may not exist: ${refPath}`
      })
    }
  }
  
  // 5. Platform compatibility check
  if (frontmatter.platforms) {
    for (const platform of frontmatter.platforms) {
      const adapter = getAdapter(platform)
      if (!adapter) {
        warnings.push({
          type: 'platform',
          message: `Platform not yet implemented: ${platform}`
        })
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    warnings,
    frontmatter
  }
}
```

**Validation stages:**

1. **Development time:** Template authors run `npm run validate-templates`
2. **CI time:** Automated checks in PR/push workflows
3. **Install time:** Installer validates before copying files
4. **Runtime:** CLI platforms validate on skill load (their responsibility)

**Detection:**
- Lint templates with JSON Schema
- Parse all template files during install
- Fail fast with clear error messages
- Suggest fixes when possible

**Implementation checklist:**
- [ ] JSON Schema defined for skill frontmatter
- [ ] Validation utility in `lib/validate-template.js`
- [ ] Pre-installation: Validate all templates
- [ ] CLI command: `npm run validate-templates` for development
- [ ] CI: GitHub Action runs validation on all templates
- [ ] Error messages include file, line number, and suggested fix

---

### 🟡 MODERATE: Installation Failure Detection

**What goes wrong:**
Installation completes but is actually broken:
- Files copied but with wrong permissions
- Symlinks created but pointing to wrong locations
- JSON files copied but contain syntax errors
- Platform-specific files missing

**Why it happens:**
- Success determined by "no errors thrown"
- No post-installation verification
- Silent failures in file operations
- Platform differences in file system behavior

**Consequences:**
- User runs command, gets cryptic error from CLI platform
- Hours debugging before realizing installation is broken
- Loss of trust in installer

**Mitigation strategy:**

```javascript
// Post-installation verification
async function verifyInstallation(platform, targetPath) {
  const issues = []
  
  // 1. Verify expected files exist
  const expectedFiles = getExpectedFiles(platform)
  for (const file of expectedFiles) {
    const fullPath = path.join(targetPath, file)
    if (!fs.existsSync(fullPath)) {
      issues.push({
        severity: 'error',
        file,
        message: `Expected file missing: ${file}`
      })
    }
  }
  
  // 2. Verify file permissions (Unix only)
  if (process.platform !== 'win32') {
    for (const file of expectedFiles) {
      const fullPath = path.join(targetPath, file)
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath)
        if (file.endsWith('.js') || file.endsWith('.sh')) {
          if (!(stats.mode & 0o100)) {
            issues.push({
              severity: 'warning',
              file,
              message: `File should be executable: ${file}`
            })
          }
        }
      }
    }
  }
  
  // 3. Verify JSON/YAML syntax
  for (const file of expectedFiles) {
    if (file.endsWith('.json')) {
      try {
        const content = fs.readFileSync(path.join(targetPath, file), 'utf-8')
        JSON.parse(content)
      } catch (e) {
        issues.push({
          severity: 'error',
          file,
          message: `Invalid JSON: ${e.message}`
        })
      }
    }
  }
  
  // 4. Verify platform-specific requirements
  const adapter = getAdapter(platform)
  const platformIssues = await adapter.verifyInstallation(targetPath)
  issues.push(...platformIssues)
  
  return {
    success: issues.filter(i => i.severity === 'error').length === 0,
    issues
  }
}
```

**Verification checklist:**
- [ ] All expected files present
- [ ] File permissions correct (executables marked)
- [ ] JSON/YAML files parse correctly
- [ ] Platform-specific requirements met
- [ ] Symlinks point to valid targets
- [ ] Marker files (`.gsd-meta.json`) written correctly

**Implementation:**
- Run verification after installation completes
- Print summary: "✓ Installed 29 skills, 12 agents, 4 hooks"
- Print warnings for non-critical issues
- Fail installation if critical issues found
- Provide `--verify-only` flag to check existing installation

---

### 🔴 CRITICAL: YAML Frontmatter Transformation Errors

**What goes wrong:**
When transforming 42 template files with frontmatter modifications, systematic errors affect ALL files:
- Field removal matches partial names (removing `platform` also removes `platformVersion`)
- YAML structure corruption (breaking multiline strings, comments, or indentation)
- Array syntax changes (converting `[read, edit]` to block style unintentionally)
- Tool name mapping with case mismatches (`execute` vs `Execute` vs `Bash`)
- Incomplete transformations leaving files in invalid state

**Why it happens:**
- Regex-based field removal instead of AST manipulation
- Not preserving original YAML formatting style
- Naive string matching without understanding YAML structure
- No validation after transformation
- Batch operations without per-file verification

**Consequences:**
- All 29 skills broken by systematic error
- Invalid YAML that fails to parse
- Claude/Copilot cannot load skills
- User must manually fix 42 files
- Rollback required but may be incomplete

**Critical edge cases:**

1. **Flow sequence syntax:**
```yaml
# Original
tools: [read, edit, execute]

# MUST preserve flow style, not convert to:
tools:
  - read
  - edit
  - execute
```

2. **Partial field name matches:**
```yaml
metadata:
  platform: copilot        # Want to remove this
  platformVersion: 1.0     # MUST NOT remove this
  generated: '2024-01-01'
```

3. **Multiline string fields:**
```yaml
description: |
  This is a multiline
  description that spans
  multiple lines
# Regex match on 'description:' must handle ALL lines
```

4. **YAML comments:**
```yaml
tools: [read, edit]  # Required tools
# Inline comments must be preserved or removed consistently
```

5. **Indentation preservation:**
```yaml
metadata:
  platform: copilot  # Remove this line
  version: 1.0       # MUST preserve indentation exactly
  project: gsd       # Otherwise YAML structure breaks
```

6. **Empty objects after removal:**
```yaml
metadata:
  platform: copilot  # Only field
# After removal, should 'metadata:' line be removed too?
```

**Mitigation strategy:**

```javascript
// Use proper YAML parsing, not regex
const yaml = require('yaml')

function transformFrontmatter(content, transformations) {
  // 1. Extract frontmatter safely
  const fenceRegex = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
  const match = content.match(fenceRegex)
  
  if (!match) {
    throw new Error('No frontmatter found')
  }
  
  const [, yamlContent, body] = match
  
  // 2. Parse to AST (preserves formatting metadata)
  const doc = yaml.parseDocument(yamlContent)
  
  // 3. Apply transformations at AST level
  for (const { action, path, value } of transformations) {
    switch (action) {
      case 'remove':
        doc.deleteIn(path.split('.'))
        break
      case 'set':
        doc.setIn(path.split('.'), value)
        break
      case 'map':
        const current = doc.getIn(path.split('.'))
        doc.setIn(path.split('.'), value(current))
        break
    }
  }
  
  // 4. Stringify preserving flow style for arrays
  const options = {
    // Preserve original array style
    flowCollectionPadding: false,
    // Don't force block style
    defaultStringType: 'PLAIN'
  }
  const newYaml = doc.toString(options)
  
  // 5. Reconstruct file
  return `---\n${newYaml}---\n${body}`
}

// Example: Remove metadata.platform safely
const transformed = transformFrontmatter(content, [
  { 
    action: 'remove', 
    path: 'metadata.platform'  // Exact path, not regex
  }
])

// Example: Map tool names
const transformed = transformFrontmatter(content, [
  {
    action: 'map',
    path: 'tools',
    value: (tools) => tools.map(t => TOOL_MAPPING[t.toLowerCase()] || t)
  }
])
```

**Field removal safety checklist:**
- [ ] Use exact field paths, not substring matching
- [ ] Remove `metadata.platform` not all lines containing "platform"
- [ ] Validate YAML parses after each transformation
- [ ] Preserve array syntax (flow vs block style)
- [ ] Preserve indentation exactly
- [ ] Handle empty parent objects (remove or keep?)
- [ ] Detect and handle YAML comments appropriately

**Tool mapping safety checklist:**
- [ ] Normalize to lowercase before lookup: `tool.toLowerCase()`
- [ ] Define explicit mapping: `{ execute: 'Bash', search: 'Grep' }`
- [ ] Handle unknown tools: error or warn, don't silently pass through
- [ ] Validate mapped names exist in target platform
- [ ] Test with case variations: `Execute`, `EXECUTE`, `execute`
- [ ] Handle platform-specific tools: `mcp__context7__query`

**Batch operation safety:**
```javascript
// Transform 42 files with validation
async function transformAllFiles(files, transformations) {
  const results = []
  
  for (const file of files) {
    try {
      // 1. Read original
      const original = fs.readFileSync(file, 'utf-8')
      
      // 2. Transform
      const transformed = transformFrontmatter(original, transformations)
      
      // 3. Validate YAML parses
      const fenceMatch = transformed.match(/^---\r?\n([\s\S]*?)\r?\n---/)
      yaml.parse(fenceMatch[1])  // Throws if invalid
      
      // 4. Write to temp file
      const tmpFile = file + '.tmp'
      fs.writeFileSync(tmpFile, transformed, 'utf-8')
      
      // 5. Track for atomic rename
      results.push({ file, tmpFile, original })
      
    } catch (error) {
      // Rollback all temp files
      for (const { tmpFile } of results) {
        fs.unlinkSync(tmpFile)
      }
      throw new Error(`Transformation failed on ${file}: ${error.message}`)
    }
  }
  
  // 6. Atomic rename all at once
  for (const { file, tmpFile } of results) {
    fs.renameSync(tmpFile, file)
  }
  
  return results
}
```

**Detection and early validation:**
- Pre-transformation: Validate all 42 files parse correctly
- During transformation: Validate each transformed file before writing
- Post-transformation: Run full validation suite
- Syntax errors: Fail immediately with filename and line number
- Semantic errors: Warn but allow (e.g., unknown tool name)

**Warning signs of problems:**
- Transformation takes >1 second per file (regex catastrophic backtracking?)
- Different array styles in output (flow style became block style)
- Different indentation than original (2 spaces became 4 spaces)
- File size changed significantly (content lost or duplicated?)
- YAML parser warnings about deprecated syntax

**Test cases that MUST pass:**
```javascript
describe('Frontmatter transformation', () => {
  test('preserves flow array syntax', () => {
    const input = 'tools: [read, edit]'
    const output = transform(input, [{ action: 'remove', path: 'other' }])
    expect(output).toContain('tools: [read, edit]')  // NOT block style
  })
  
  test('removes exact field only', () => {
    const input = `
metadata:
  platform: copilot
  platformVersion: 1.0
`
    const output = transform(input, [{ action: 'remove', path: 'metadata.platform' }])
    expect(output).not.toContain('platform: copilot')
    expect(output).toContain('platformVersion: 1.0')  // MUST remain
  })
  
  test('handles multiline strings', () => {
    const input = `
description: |
  Line 1
  Line 2
  Line 3
`
    const output = transform(input, [{ action: 'remove', path: 'other' }])
    expect(output).toContain('Line 1\n  Line 2\n  Line 3')
  })
  
  test('preserves inline comments', () => {
    const input = 'tools: [read, edit]  # Required'
    const output = transform(input, [{ action: 'remove', path: 'other' }])
    expect(output).toContain('# Required')
  })
  
  test('case-insensitive tool mapping', () => {
    const input = 'tools: [Execute, SEARCH, read]'
    const output = transform(input, [
      { action: 'map', path: 'tools', value: mapTools }
    ])
    expect(output).toContain('Bash')  // Execute mapped
    expect(output).toContain('Grep')  // SEARCH mapped
  })
})
```

**Implementation checklist:**
- [ ] Use `yaml` package with AST support (not regex)
- [ ] Test all edge cases above with real template files
- [ ] Validate YAML after every transformation
- [ ] Atomic file operations (write to .tmp, then rename)
- [ ] Rollback on first error (don't leave 25/42 files changed)
- [ ] Clear error messages with filename and line number
- [ ] Dry-run mode to preview changes without writing

---

### 🔴 CRITICAL: Skill Reference Extraction Regex Failures

**What goes wrong:**
When scanning markdown for `/gsd-*` skill references, regex matches false positives:
- Matching `/gsd-` in code blocks or comments
- Matching URLs like `https://github.com/gsd-docs/gsd-guide`
- Matching file paths in error messages
- Missing references due to line break variations
- Extracting partial names (stopping at hyphen or whitespace)

**Why it happens:**
- Simple regex without context awareness
- Not excluding code blocks (` ```...``` `)
- Not handling markdown link syntax `[text](/gsd-skill)`
- Greedy matching stops at wrong boundary

**Consequences:**
- False skill dependencies added to version.json
- Build breaks looking for non-existent skills
- Version validation fails
- Manual editing required to fix JSON

**Edge cases:**

1. **Code blocks should be IGNORED:**
````markdown
```bash
# Don't match this: /gsd-test-skill
./get-shit-done /gsd-execute-plan
```
````

2. **Inline code should be IGNORED:**
```markdown
Run the `/gsd-plan-phase` command (not: use `/gsd-old-name`)
```

3. **URLs should be IGNORED:**
```markdown
See docs at https://example.com/gsd-docs/gsd-troubleshooting
```

4. **Valid references to EXTRACT:**
```markdown
Spawns `/gsd-planner` agent
This skill depends on: /gsd-map-codebase
```

**Mitigation strategy:**

```javascript
function extractSkillReferences(markdownContent) {
  // 1. Remove code blocks first
  const withoutCodeBlocks = markdownContent.replace(/```[\s\S]*?```/g, '')
  
  // 2. Remove inline code
  const withoutInlineCode = withoutCodeBlocks.replace(/`[^`]+`/g, '')
  
  // 3. Extract valid skill references
  const skillPattern = /\/gsd-[a-z0-9-]+/g
  const matches = withoutInlineCode.match(skillPattern) || []
  
  // 4. Deduplicate
  return [...new Set(matches)]
}

// Test cases
const markdown = `
# Test Document

Spawns \`/gsd-planner\` agent.

\`\`\`bash
# Don't match: /gsd-fake
\`\`\`

Depends on /gsd-map-codebase and /gsd-execute-phase.

See https://example.com/gsd-docs for more.
`

const refs = extractSkillReferences(markdown)
// Should return: ['/gsd-planner', '/gsd-map-codebase', '/gsd-execute-phase']
// Should NOT include: '/gsd-fake', '/gsd-docs'
```

**Implementation checklist:**
- [ ] Strip code blocks before matching
- [ ] Strip inline code before matching
- [ ] Use word boundary or punctuation to end match
- [ ] Validate extracted names exist in skill list
- [ ] Report references to non-existent skills as warnings
- [ ] Handle skill name case variations consistently

---

### 🟡 MODERATE: Cross-Platform File Operation Issues

**What goes wrong:**
File operations behave differently on Windows vs Unix:
- Path separators (`\` vs `/`)
- Line endings (`\r\n` vs `\n`)
- Case sensitivity (Windows ignores case, Unix doesn't)
- Executable permissions (Unix has, Windows doesn't)
- Symlink support (varies)

**Why it happens:**
- Hard-coded path separators
- Not normalizing line endings
- Assuming case-sensitive filesystem
- Setting execute bits on Windows (silently fails)

**Consequences:**
- Windows users see `\` in paths where `/` expected
- Git shows entire file changed due to line ending conversion
- Files conflict on case-insensitive systems (Skill.md vs skill.md)
- Permissions lost when copying from Unix to Windows

**Mitigation strategy:**

```javascript
const path = require('path')
const os = require('os')

// Use path.join() and path.resolve(), never string concat
const skillPath = path.join(targetDir, 'skills', 'gsd-skill', 'SKILL.md')
// NOT: const skillPath = targetDir + '/skills/gsd-skill/SKILL.md'

// Normalize line endings on read
function readTemplateFile(filepath) {
  let content = fs.readFileSync(filepath, 'utf-8')
  // Normalize to LF
  content = content.replace(/\r\n/g, '\n')
  return content
}

// Preserve line endings on write
function writeFileWithCorrectEndings(filepath, content) {
  // On Windows, optionally convert to CRLF
  if (os.platform() === 'win32' && shouldUseCRLF()) {
    content = content.replace(/\n/g, '\r\n')
  }
  fs.writeFileSync(filepath, content, 'utf-8')
}

// Handle executable permissions safely
function makeExecutable(filepath) {
  if (os.platform() !== 'win32') {
    const stats = fs.statSync(filepath)
    fs.chmodSync(filepath, stats.mode | 0o111)  // Add execute bit
  }
  // On Windows, do nothing (no execute bit concept)
}

// Case-insensitive file checks on Windows
function fileExistsCaseInsensitive(filepath) {
  if (!fs.existsSync(filepath)) return false
  
  // On case-insensitive systems, verify exact case
  if (os.platform() === 'win32' || os.platform() === 'darwin') {
    const dir = path.dirname(filepath)
    const base = path.basename(filepath)
    const files = fs.readdirSync(dir)
    return files.includes(base)  // Exact match
  }
  
  return true
}
```

**Implementation checklist:**
- [ ] Use `path.join()` for all path construction
- [ ] Normalize line endings on read
- [ ] Preserve or standardize line endings on write
- [ ] Skip chmod on Windows
- [ ] Test on Windows, Mac, and Linux
- [ ] Use `.gitattributes` to control line endings in repo

---

### 🟡 MODERATE: Atomic File Write Without Rollback

**What goes wrong:**
Writing transformed files directly without atomic operations:
```javascript
// DANGER: If this fails mid-write, file is corrupted
fs.writeFileSync(skillPath, transformedContent)
```

Power loss, disk full, or process kill during write → corrupted file.

**Why it happens:**
- Using `writeFileSync()` directly instead of write-then-rename pattern
- Not using temp files
- No verification of write success

**Consequences:**
- Partial file written (ends mid-line)
- Invalid YAML that can't be parsed
- Original content lost
- Manual recovery required

**Mitigation strategy:**

```javascript
function atomicWriteFile(filepath, content) {
  const tmpPath = filepath + '.tmp.' + Date.now()
  
  try {
    // 1. Write to temp file
    fs.writeFileSync(tmpPath, content, 'utf-8')
    
    // 2. Verify write
    const written = fs.readFileSync(tmpPath, 'utf-8')
    if (written !== content) {
      throw new Error('Write verification failed')
    }
    
    // 3. Atomic rename (POSIX guarantees atomicity)
    fs.renameSync(tmpPath, filepath)
    
  } catch (error) {
    // Clean up temp file
    if (fs.existsSync(tmpPath)) {
      fs.unlinkSync(tmpPath)
    }
    throw error
  }
}

// For batch operations, prepare all temp files first
function atomicBatchWrite(operations) {
  const tempFiles = []
  
  try {
    // Write all temp files
    for (const { filepath, content } of operations) {
      const tmpPath = filepath + '.tmp'
      fs.writeFileSync(tmpPath, content, 'utf-8')
      tempFiles.push({ tmp: tmpPath, dest: filepath })
    }
    
    // Verify all temp files
    for (const { tmp, dest } of tempFiles) {
      const content = fs.readFileSync(tmp, 'utf-8')
      const expected = operations.find(op => op.filepath === dest).content
      if (content !== expected) {
        throw new Error(`Verification failed: ${dest}`)
      }
    }
    
    // Atomic rename all at once
    for (const { tmp, dest } of tempFiles) {
      fs.renameSync(tmp, dest)
    }
    
  } catch (error) {
    // Rollback: delete all temp files
    for (const { tmp } of tempFiles) {
      if (fs.existsSync(tmp)) {
        fs.unlinkSync(tmp)
      }
    }
    throw error
  }
}
```

**Implementation checklist:**
- [ ] Never write directly to destination file
- [ ] Always write to temp file first
- [ ] Verify temp file contents match expected
- [ ] Use atomic rename (rename syscall is atomic)
- [ ] Clean up temp files on error
- [ ] Handle disk full gracefully
- [ ] Test interruption scenarios (SIGINT during write)

---

### 🟡 MODERATE: JSON Generation Validation Gaps

**What goes wrong:**
Generating 29 `version.json` + 1 `versions.json` with invalid JSON:
- Trailing commas: `{ "skills": ["a", "b",] }`
- Unquoted keys: `{ name: "test" }`
- Single quotes: `{ 'name': 'test' }`
- Undefined values: `{ "key": undefined }`
- NaN or Infinity: `{ "value": NaN }`

**Why it happens:**
- String concatenation instead of `JSON.stringify()`
- Template literals with JS values
- Not validating JSON after generation

**Consequences:**
- Files fail to parse in Node.js or CLI tools
- Silent failures when reading versions
- Version detection breaks
- User must manually fix JSON syntax

**Mitigation strategy:**

```javascript
// NEVER use string templates for JSON
// BAD:
const json = `{
  "name": "${name}",
  "version": "${version}"
}`

// GOOD: Use JSON.stringify
const obj = {
  name: name,
  version: version,
  skills: skillNames
}
const json = JSON.stringify(obj, null, 2)  // Pretty print with 2 spaces

// Validate JSON after generation
function generateAndValidateJSON(data, filepath) {
  // 1. Stringify
  const json = JSON.stringify(data, null, 2)
  
  // 2. Parse back to verify
  try {
    const parsed = JSON.parse(json)
    
    // 3. Deep equality check
    if (JSON.stringify(parsed) !== JSON.stringify(data)) {
      throw new Error('JSON roundtrip failed')
    }
  } catch (error) {
    throw new Error(`Invalid JSON generated: ${error.message}`)
  }
  
  // 4. Write atomically
  atomicWriteFile(filepath, json + '\n')  // Add trailing newline
}

// For versions.json with all skills
function generateVersionsManifest(skills) {
  const manifest = {
    version: '1.9.0',
    generated: new Date().toISOString(),
    skills: skills.map(skill => ({
      name: skill.name,
      version: skill.version,
      path: skill.path
    }))
  }
  
  generateAndValidateJSON(manifest, 'versions.json')
}
```

**Validation checklist:**
- [ ] Use `JSON.stringify()`, never string templates
- [ ] Parse generated JSON to verify validity
- [ ] Check for common errors (trailing commas, quotes)
- [ ] Add trailing newline to files (POSIX compliance)
- [ ] Validate schema after generation
- [ ] Test with special characters in values

---

## 2. Breaking Changes & Versioning Risks

### 🔴 CRITICAL: CLI Platform Spec Changes

**What goes wrong:**
Claude, Copilot, or Codex changes their frontmatter specification:
- New required fields added
- Field names changed
- Field validation rules changed
- New platform-specific metadata required

Existing templates stop working. Users can't use installed skills.

**Why it happens:**
- CLI platforms are actively developed
- No formal specification or versioning from vendors
- No backward compatibility guarantees
- Silent changes in platform updates

**Consequences:**
- Installed skills break after CLI update
- Users blame GSD installer
- Mass reinstallation required
- Developer burden to update all templates

**Mitigation strategy:**

**1. Version-aware template rendering**

```javascript
// Platform adapter with version detection
class ClaudeAdapter {
  constructor() {
    this.specVersion = this.detectSpecVersion()
  }
  
  detectSpecVersion() {
    // Try to detect Claude CLI version
    try {
      const output = execSync('claude --version', { encoding: 'utf-8' })
      const version = output.match(/(\d+\.\d+\.\d+)/)?.[1]
      return version || 'unknown'
    } catch {
      return 'unknown'
    }
  }
  
  renderTemplate(template, targetPath) {
    // Transform template based on detected spec version
    const frontmatter = template.frontmatter
    
    if (semver.gte(this.specVersion, '2.0.0')) {
      // Claude 2.0+ uses 'capabilities' instead of 'tools'
      if (frontmatter.tools) {
        frontmatter.capabilities = frontmatter.tools
        delete frontmatter.tools
      }
    }
    
    // Add platform-specific metadata
    frontmatter.metadata = frontmatter.metadata || {}
    frontmatter.metadata.platform = 'claude'
    frontmatter.metadata.generatedFor = this.specVersion
    frontmatter.metadata.generated = new Date().toISOString().split('T')[0]
    
    return this.serializeFrontmatter(frontmatter) + template.body
  }
}
```

**2. Template spec versioning**

```javascript
// Template declares which spec versions it supports
---
name: gsd-new-project
spec_versions:
  claude: '>=1.5.0 <3.0.0'  // Supports Claude 1.5.x - 2.x
  copilot: '>=0.1.0'        // Supports all Copilot versions
  codex: '>=1.0.0 <2.0.0'   // Supports Codex 1.x only
---
```

**3. Adapter abstraction layer**

```javascript
// Adapter handles all platform-specific logic
class PlatformAdapter {
  // Must implement these methods
  async detectVersion() { throw new Error('Not implemented') }
  async validateCompatibility(template) { throw new Error('Not implemented') }
  async transformTemplate(template) { throw new Error('Not implemented') }
  async getTargetPath(skillName) { throw new Error('Not implemented') }
  async verifyInstallation(path) { throw new Error('Not implemented') }
}

// Platform-specific implementations
class ClaudeAdapter extends PlatformAdapter {
  async detectVersion() {
    // Claude-specific detection
  }
  
  async transformTemplate(template) {
    // Claude-specific transformations
  }
  
  getTargetPath(skillName) {
    return path.join(
      process.env.CLAUDE_CONFIG_DIR || path.join(os.homedir(), '.claude'),
      'skills',
      skillName
    )
  }
}
```

**4. Template migration system**

```javascript
// Migrate templates to new spec versions
const migrations = {
  'claude-1.5-to-2.0': (template) => {
    // Rename tools → capabilities
    if (template.frontmatter.tools) {
      template.frontmatter.capabilities = template.frontmatter.tools
      delete template.frontmatter.tools
    }
    return template
  },
  
  'copilot-0.1-to-0.2': (template) => {
    // Add required scope field
    template.frontmatter.scope = 'workspace'
    return template
  }
}

function migrateTemplate(template, fromVersion, toVersion) {
  const migrationKey = `${template.platform}-${fromVersion}-to-${toVersion}`
  const migration = migrations[migrationKey]
  
  if (migration) {
    return migration(template)
  }
  
  // Check for chained migrations
  // e.g., 1.0 → 1.5 → 2.0
  return template
}
```

**Detection:**
- Monitor CLI platform release notes (manual process)
- Detect spec version at install time
- Warn if installed version unknown
- Fail fast if incompatible version detected

**Implementation checklist:**
- [ ] Platform adapters detect CLI version
- [ ] Templates declare supported spec versions
- [ ] Installer validates compatibility before rendering
- [ ] Migration system transforms templates between spec versions
- [ ] Version metadata embedded in installed files
- [ ] Release notes document breaking changes
- [ ] Test suite includes multiple spec versions

---

### 🟡 MODERATE: Template Versioning

**What goes wrong:**
- User has v1.5.0 installed
- Templates updated to v1.6.0 with new features
- No way to upgrade just templates
- Or: User wants to downgrade to stable version

**Why it happens:**
- Template version coupled to installer version
- No separate template registry
- No upgrade-in-place mechanism

**Consequences:**
- Full reinstall required for template updates
- Can't install specific template versions
- Can't roll back broken template changes

**Mitigation strategy:**

**1. Separate template versioning from installer**

```
get-shit-done-multi/
├── package.json (installer v1.8.0)
├── templates/
│   ├── package.json (templates v1.6.0)
│   └── gsd-*/
└── bin/install.js
```

**2. Template update command**

```bash
# Update just templates, not installer
npx get-shit-done-multi update-templates

# Install specific template version
npx get-shit-done-multi --template-version=1.5.0

# Install from custom source
npx get-shit-done-multi --template-source=/path/to/templates
```

**3. Template manifest**

```json
// templates/manifest.json
{
  "version": "1.6.0",
  "installer_requires": ">=1.7.0",
  "skills": {
    "gsd-new-project": {
      "version": "1.9.1",
      "platforms": ["claude", "copilot", "codex"],
      "requires_version": "1.9.0",
      "files": [
        "SKILL.md"
      ]
    },
    "gsd-execute-phase": {
      "version": "2.0.0",
      "platforms": ["claude", "copilot", "codex"],
      "requires_version": "1.9.0",
      "files": [
        "SKILL.md"
      ]
    }
  },
  "agents": {
    "researcher": {
      "version": "1.5.0",
      "files": ["prompt.md", "config.json"]
    }
  }
}
```

**Implementation checklist:**
- [ ] Templates have independent version
- [ ] Template manifest tracks all components
- [ ] Installer validates template compatibility
- [ ] Update command refreshes templates only
- [ ] Lock file tracks installed template version

---

### 🟡 MODERATE: Backward Compatibility

**What goes wrong:**
- New installer version changes behavior
- Existing projects break
- Users can't upgrade installer without risk

**Why it happens:**
- No compatibility testing across versions
- Breaking changes not documented
- No migration path for old projects

**Mitigation strategy:**

**1. Semantic versioning**

```
Major.Minor.Patch

Major: Breaking changes (require migration)
Minor: New features (backward compatible)
Patch: Bug fixes (backward compatible)
```

**2. Compatibility matrix**

```javascript
// lib/compatibility.js
const COMPATIBILITY_MATRIX = {
  '2.0.0': {
    supports: {
      templates: '>=1.5.0 <2.0.0',
      projects: '>=1.0.0',
      platforms: {
        claude: '>=1.5.0',
        copilot: '>=0.1.0',
        codex: '>=1.0.0'
      }
    },
    breaking_changes: [
      'Templates must include metadata field',
      'Dropped support for Claude <1.5.0'
    ]
  }
}
```

**3. Migration guides**

```markdown
# Upgrading from v1.x to v2.x

## Breaking Changes

1. Template format changed
   - Before: `tools: []`
   - After: `capabilities: []`
   - Migration: Run `npx gsd migrate-templates`

2. Environment variables renamed
   - Before: `CLAUDE_DIR`
   - After: `CLAUDE_CONFIG_DIR`
   - Migration: Update your shell config

## Automatic Migrations

The installer will automatically:
- Backup old installation
- Transform templates to new format
- Update config files
```

**Implementation checklist:**
- [ ] Follow semantic versioning strictly
- [ ] Maintain compatibility matrix
- [ ] Test upgrades from previous versions
- [ ] Provide migration tools
- [ ] Document breaking changes in CHANGELOG

---

## 3. Extensibility Risks

### 🔴 CRITICAL: Platform Adapter Leakage into Templates

**What goes wrong:**
Templates contain platform-specific logic:
- Conditional blocks: `{{#if platform === 'claude'}}`
- Platform-specific file references
- Different content for different platforms

This violates separation of concerns. Adding a new platform requires editing every template.

**Why it happens:**
- No clear adapter boundary
- Templates trying to handle platform differences
- Insufficient adapter abstraction

**Consequences:**
- Adding new platform = editing 30+ template files
- Error-prone (easy to miss templates)
- Templates become complex and hard to maintain
- Platform-specific bugs affect all platforms

**Mitigation strategy:**

**1. Single-source templates**

Templates should be platform-agnostic. All platform-specific logic lives in adapters.

```markdown
---
name: gsd-new-project
description: Initialize a new project
platforms: [claude, copilot, codex]
tools: [read, write, bash]
---

<objective>
Initialize a new project...
</objective>

<!-- NO platform-specific content -->
<!-- Adapter handles platform differences -->
```

**2. Adapter transforms paths**

```javascript
class PlatformAdapter {
  transformTemplate(template) {
    // Replace generic paths with platform-specific paths
    let body = template.body
    
    body = body.replace(
      /@~\/.gsd\/([^/]+)/g,
      (match, path) => this.resolveReference(path)
    )
    
    return {
      frontmatter: this.transformFrontmatter(template.frontmatter),
      body
    }
  }
  
  resolveReference(path) {
    // Platform-specific path resolution
    switch (this.platform) {
      case 'claude':
        return `@~/.claude/get-shit-done/${path}`
      case 'copilot':
        return `@.github/get-shit-done/${path}`
      case 'codex':
        return `@.codex/get-shit-done/${path}`
    }
  }
}
```

**3. Feature flags in adapter**

```javascript
class PlatformAdapter {
  get features() {
    return {
      supportsGlobalInstall: true,
      supportsProjectInstall: true,
      requiresWorkspaceRoot: false,
      supportsNestedSkills: true
    }
  }
  
  shouldInstall(template) {
    // Skip templates that require unsupported features
    if (template.requiresGlobalInstall && !this.features.supportsGlobalInstall) {
      return false
    }
    return true
  }
}
```

**Detection:**
- Lint templates for platform-specific content
- CI check: Templates should be identical except for metadata
- Template validator flags conditional logic

**Implementation checklist:**
- [ ] Templates are platform-agnostic
- [ ] All path resolution in adapters
- [ ] All frontmatter transformation in adapters
- [ ] Feature flags determine capability
- [ ] Template linter checks for platform-specific content
- [ ] Adding new platform = new adapter file only

---

### 🟡 MODERATE: Adding New Skills Requires Code Changes

**What goes wrong:**
Adding a new skill requires:
1. Creating template file
2. Editing installer code to include it
3. Updating configuration
4. Rebuilding package

Developer friction. Slows down skill development.

**Why it happens:**
- Skills hardcoded in installer
- No convention-based discovery
- Manual registration required

**Mitigation strategy:**

**1. Convention-based discovery**

```javascript
// Automatically discover all skills
async function discoverSkills(templatesDir) {
  const skillsDir = path.join(templatesDir, 'skills')
  const dirs = await fs.promises.readdir(skillsDir)
  
  const skills = []
  for (const dir of dirs) {
    if (!dir.startsWith('gsd-')) continue
    
    const skillPath = path.join(skillsDir, dir, 'SKILL.md')
    if (fs.existsSync(skillPath)) {
      const skill = await parseSkill(skillPath)
      skills.push(skill)
    }
  }
  
  return skills
}

// No hardcoded skill list!
// Just add file to templates/skills/gsd-new-skill/SKILL.md
```

**2. Manifest-based registration**

```json
// templates/skills/manifest.json (auto-generated)
{
  "skills": [
    {
      "name": "gsd-new-project",
      "path": "gsd-new-project/SKILL.md",
      "platforms": ["claude", "copilot", "codex"]
    }
  ]
}

// Generated by: npm run build-manifest
// Or dynamically at install time
```

**3. Plugin system for custom skills**

```javascript
// User can provide custom skills directory
npx get-shit-done-multi --custom-skills=/path/to/my/skills

// Installer merges custom + built-in skills
const skills = [
  ...await discoverSkills(builtInTemplatesDir),
  ...await discoverSkills(customSkillsDir)
]
```

**Implementation checklist:**
- [ ] Convention: `templates/skills/gsd-*/SKILL.md`
- [ ] Dynamic discovery at install time
- [ ] No hardcoded skill list in code
- [ ] Manifest auto-generated or optional
- [ ] Support custom skill directories
- [ ] Validation: Ensure no name conflicts

---

### 🟡 MODERATE: Testing Without Polluting User Directories

**What goes wrong:**
- Running tests installs to `~/.claude/`, `~/.github/`, etc.
- Test files mixed with user's real installations
- Tests fail if user has existing installations
- Hard to clean up after tests

**Why it happens:**
- Tests use real file system paths
- No isolation mechanism
- No mock file system

**Mitigation strategy:**

**1. Test-specific installation paths**

```javascript
// Test sets environment variables
process.env.CLAUDE_CONFIG_DIR = path.join(tmpDir, '.claude')
process.env.GSD_TEST_MODE = 'true'

// Installer respects test mode
function getInstallPath(platform) {
  if (process.env.GSD_TEST_MODE) {
    return path.join(process.env.CLAUDE_CONFIG_DIR, 'skills')
  }
  return path.join(os.homedir(), '.claude', 'skills')
}
```

**2. Temporary directory for each test**

```javascript
import { mkdtemp } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

describe('Installation', () => {
  let testDir
  
  beforeEach(async () => {
    testDir = await mkdtemp(join(tmpdir(), 'gsd-test-'))
    process.env.CLAUDE_CONFIG_DIR = testDir
  })
  
  afterEach(async () => {
    await fs.promises.rm(testDir, { recursive: true })
  })
  
  it('installs skills', async () => {
    await install({ platform: 'claude' })
    
    const installed = await fs.promises.readdir(
      join(testDir, '.claude', 'skills')
    )
    expect(installed).toContain('gsd-new-project')
  })
})
```

**3. Mock file system**

```javascript
import { vol } from 'memfs'
import { patchFs } from 'fs-monkey'

describe('Installation with mock fs', () => {
  beforeEach(() => {
    vol.reset()
    vol.fromJSON({
      '/home/user/.claude': null, // Empty directory
      '/templates/skills/gsd-test/SKILL.md': 'template content'
    })
    patchFs(vol)
  })
  
  afterEach(() => {
    // Restore real fs
  })
  
  it('installs to mock filesystem', async () => {
    await install({ platform: 'claude' })
    
    const files = vol.toJSON()
    expect(files).toHaveProperty('/home/user/.claude/skills/gsd-test/SKILL.md')
  })
})
```

**4. Docker containers for integration tests**

```dockerfile
# test.Dockerfile
FROM node:18
WORKDIR /test
COPY . .
RUN npm install
CMD ["npm", "test"]
```

```bash
# Run tests in isolated container
docker run --rm gsd-test
```

**Implementation checklist:**
- [ ] Environment variables control install paths
- [ ] Test mode flag prevents pollution
- [ ] Each test uses temporary directory
- [ ] Cleanup in `afterEach()` hooks
- [ ] Integration tests use containers
- [ ] CI runs tests in fresh environment

---

## 4. Security & Safety Risks

### 🔴 CRITICAL: Path Traversal Vulnerability

**What goes wrong:**
Malicious template contains:
```markdown
<!-- Path traversal attack -->
Copy template to: ../../../../.ssh/authorized_keys
```

Attacker overwrites system files, gains SSH access, or deletes data.

**Why it happens:**
- User-provided paths not validated
- Relative paths (`../`) not blocked
- Symbolic links followed

**Consequences:**
- System compromise
- Data loss
- Security vulnerability disclosure
- Reputation damage

**Mitigation strategy:**

**1. Path validation**

```javascript
function validatePath(userPath, allowedBase) {
  // Resolve to absolute path
  const absolute = path.resolve(allowedBase, userPath)
  
  // Ensure it's within allowed base
  if (!absolute.startsWith(path.resolve(allowedBase))) {
    throw new Error(`Path traversal detected: ${userPath}`)
  }
  
  // Block dangerous paths
  const dangerous = [
    '/etc',
    '/bin',
    '/usr',
    '/System',
    '/.ssh',
    '/.aws',
    '/.kube'
  ]
  
  for (const dir of dangerous) {
    if (absolute.startsWith(dir)) {
      throw new Error(`Dangerous path: ${absolute}`)
    }
  }
  
  return absolute
}

// Usage
const targetPath = validatePath(
  skillName, 
  getBasePath(platform)
)
```

**2. Sandboxed file operations**

```javascript
class SafeFileOperations {
  constructor(allowedBase) {
    this.allowedBase = path.resolve(allowedBase)
  }
  
  async copyFile(src, dest) {
    const safeDest = this.validatePath(dest)
    
    // Check if destination already exists
    if (fs.existsSync(safeDest)) {
      throw new Error(`File already exists: ${dest}`)
    }
    
    // Ensure parent directory exists
    await fs.promises.mkdir(path.dirname(safeDest), { recursive: true })
    
    // Copy with explicit permissions
    await fs.promises.copyFile(src, safeDest, fs.constants.COPYFILE_EXCL)
    
    // Set safe permissions (no execute by default)
    await fs.promises.chmod(safeDest, 0o644)
  }
  
  validatePath(userPath) {
    const absolute = path.resolve(this.allowedBase, userPath)
    
    if (!absolute.startsWith(this.allowedBase)) {
      throw new Error(`Path outside allowed base: ${userPath}`)
    }
    
    // Resolve symlinks and check again
    const real = fs.realpathSync(path.dirname(absolute))
    if (!real.startsWith(this.allowedBase)) {
      throw new Error(`Symlink outside allowed base: ${userPath}`)
    }
    
    return absolute
  }
}
```

**3. Whitelist allowed destinations**

```javascript
const ALLOWED_INSTALL_BASES = {
  claude: [
    path.join(os.homedir(), '.claude'),
    process.env.CLAUDE_CONFIG_DIR
  ].filter(Boolean),
  
  copilot: [
    '.github',  // Project-level only
    process.cwd()  // Must be within current project
  ],
  
  codex: [
    '.codex',
    process.cwd()
  ]
}

function getInstallBase(platform) {
  const allowed = ALLOWED_INSTALL_BASES[platform]
  
  // For project-level installs, ensure we're in a project
  if (platform === 'copilot' || platform === 'codex') {
    if (!fs.existsSync('.git')) {
      throw new Error('Project-level install requires git repository')
    }
  }
  
  return allowed[0]
}
```

**Detection:**
- Static analysis: Scan templates for `../`
- Runtime validation: Check all paths before operations
- Unit tests: Attempt path traversal attacks

**Implementation checklist:**
- [ ] All paths validated before file operations
- [ ] Relative paths resolved and checked
- [ ] Symlinks resolved and validated
- [ ] Whitelist of allowed install locations
- [ ] Reject paths outside allowed base
- [ ] Test suite includes path traversal attacks

---

### 🔴 CRITICAL: Malicious Template Content

**What goes wrong:**
Template contains malicious code:
- Shell commands that exfiltrate data
- Code that modifies other files
- Backdoors in installed skills

**Why it happens:**
- Templates not reviewed before distribution
- User installs from untrusted source
- Compromised npm package

**Consequences:**
- Data theft
- System compromise
- Malware distribution

**Mitigation strategy:**

**1. Content Security Policy for templates**

```javascript
// Analyze template content for suspicious patterns
function analyzeTemplate(content) {
  const warnings = []
  const errors = []
  
  // Check for shell commands
  const shellPatterns = [
    /\$\((.*)\)/g,        // $(command)
    /`([^`]*)`/g,         // `command`
    /exec\(/g,            // exec()
    /spawn\(/g,           // spawn()
    /eval\(/g,            // eval()
    /Function\(/g         // Function()
  ]
  
  for (const pattern of shellPatterns) {
    const matches = content.match(pattern)
    if (matches) {
      warnings.push({
        type: 'shell_command',
        message: `Template contains shell command: ${matches[0]}`,
        severity: 'high'
      })
    }
  }
  
  // Check for network access
  const networkPatterns = [
    /fetch\(/g,
    /XMLHttpRequest/g,
    /require\(['"]https?:/g,
    /import.*from ['"]https?:/g
  ]
  
  for (const pattern of networkPatterns) {
    if (pattern.test(content)) {
      errors.push({
        type: 'network_access',
        message: 'Template contains network access',
        severity: 'critical'
      })
    }
  }
  
  // Check for file system access outside skill directory
  const filePatterns = [
    /fs\.(write|unlink|rm)/g,
    /process\.env/g
  ]
  
  for (const pattern of filePatterns) {
    if (pattern.test(content)) {
      warnings.push({
        type: 'file_system',
        message: 'Template accesses file system',
        severity: 'medium'
      })
    }
  }
  
  return { warnings, errors }
}
```

**2. Template signing**

```javascript
// Sign templates with private key
const crypto = require('crypto')

function signTemplate(templatePath, privateKey) {
  const content = fs.readFileSync(templatePath)
  const sign = crypto.createSign('RSA-SHA256')
  sign.update(content)
  const signature = sign.sign(privateKey, 'base64')
  
  return {
    content,
    signature,
    signedBy: 'get-shit-done-multi',
    signedAt: new Date().toISOString()
  }
}

function verifyTemplate(templatePath, signature, publicKey) {
  const content = fs.readFileSync(templatePath)
  const verify = crypto.createVerify('RSA-SHA256')
  verify.update(content)
  
  return verify.verify(publicKey, signature, 'base64')
}

// On install, verify signatures
if (options.requireSignedTemplates) {
  const verified = verifyTemplate(templatePath, signature, PUBLIC_KEY)
  if (!verified) {
    throw new Error('Template signature verification failed')
  }
}
```

**3. Source trust levels**

```javascript
const TRUST_LEVELS = {
  OFFICIAL: {
    source: 'npm:get-shit-done-multi',
    checks: ['signature']
  },
  VERIFIED: {
    source: 'npm:*',
    checks: ['signature', 'content_analysis']
  },
  UNTRUSTED: {
    source: 'file://*',
    checks: ['signature', 'content_analysis', 'manual_approval']
  }
}

async function installFromSource(source) {
  const trustLevel = getTrustLevel(source)
  
  // Run checks based on trust level
  for (const check of trustLevel.checks) {
    await runSecurityCheck(check, source)
  }
  
  // Prompt user for untrusted sources
  if (trustLevel === TRUST_LEVELS.UNTRUSTED) {
    const confirmed = await promptUser(
      `Installing from untrusted source: ${source}. Continue? (yes/no)`
    )
    if (!confirmed) {
      throw new Error('Installation cancelled by user')
    }
  }
}
```

**Detection:**
- Static analysis on all templates
- Content scanning for suspicious patterns
- Signature verification
- User confirmation for untrusted sources

**Implementation checklist:**
- [ ] Content analyzer scans templates
- [ ] Template signing for official release
- [ ] Signature verification on install
- [ ] Trust levels for different sources
- [ ] User confirmation for untrusted sources
- [ ] Block obviously malicious patterns
- [ ] Security advisory system for compromised templates

---

### 🟡 MODERATE: Overwriting User Data

**What goes wrong:**
User has customized a skill. Reinstallation overwrites their changes.

**Why it happens:**
- No backup before overwrite
- No detection of user modifications
- No merge strategy

**Consequences:**
- Loss of user customizations
- Frustration
- Hesitation to upgrade

**Mitigation strategy:**

**1. Detect modifications**

```javascript
function detectModifications(installedPath) {
  const metaPath = path.join(installedPath, '.gsd-meta.json')
  
  if (!fs.existsSync(metaPath)) {
    return { modified: false, reason: 'not installed' }
  }
  
  const meta = JSON.parse(fs.readFileSync(metaPath))
  
  // Check file hashes
  for (const [file, expectedHash] of Object.entries(meta.files)) {
    const filePath = path.join(installedPath, file)
    const actualHash = hashFile(filePath)
    
    if (actualHash !== expectedHash) {
      return {
        modified: true,
        reason: 'file changed',
        file,
        expectedHash,
        actualHash
      }
  }
  
  return { modified: false }
}

function hashFile(filePath) {
  const content = fs.readFileSync(filePath)
  return crypto.createHash('sha256').update(content).digest('hex')
}
```

**2. Backup before overwrite**

```javascript
async function backupBeforeInstall(targetPath) {
  if (!fs.existsSync(targetPath)) {
    return null
  }
  
  const timestamp = new Date().toISOString().replace(/:/g, '-').split('.')[0]
  const backupPath = `${targetPath}.backup-${timestamp}`
  
  await fs.promises.cp(targetPath, backupPath, { recursive: true })
  
  console.log(`✓ Backed up to: ${backupPath}`)
  
  return backupPath
}
```

**3. Interactive merge**

```javascript
async function handleModifiedFile(file, options) {
  console.log(`\nFile modified: ${file}`)
  console.log('1. Keep your version')
  console.log('2. Use new version')
  console.log('3. See diff')
  console.log('4. Manual merge')
  
  const choice = await promptUser('Choice: ')
  
  switch (choice) {
    case '1':
      return 'keep'
    case '2':
      return 'replace'
    case '3':
      showDiff(file)
      return handleModifiedFile(file, options)
    case '4':
      return 'merge'
  }
}
```

**Implementation checklist:**
- [ ] Hash files on installation
- [ ] Detect modifications before reinstall
- [ ] Automatic backup before overwrite
- [ ] Interactive merge for conflicts
- [ ] `--force` flag skips confirmation
- [ ] `--backup-only` creates backup without install

---

### 🟢 MINOR: Permission Requirements

**What goes wrong:**
Installation fails due to insufficient permissions:
- Can't write to `~/.claude/`
- Can't create directories
- Can't set executable permissions

**Why it happens:**
- User account restrictions
- File system permissions
- Corporate security policies

**Mitigation strategy:**

**1. Permission check before install**

```javascript
async function checkPermissions(targetPath) {
  const issues = []
  
  // Check if parent directory exists and is writable
  const parent = path.dirname(targetPath)
  
  if (!fs.existsSync(parent)) {
    try {
      await fs.promises.mkdir(parent, { recursive: true })
    } catch (error) {
      issues.push({
        path: parent,
        message: `Cannot create directory: ${error.message}`,
        suggestion: 'Run with sudo or fix permissions'
      })
    }
  }
  
  try {
    await fs.promises.access(parent, fs.constants.W_OK)
  } catch (error) {
    issues.push({
      path: parent,
      message: 'No write permission',
      suggestion: `Run: chmod u+w ${parent}`
    })
  }
  
  return issues
}
```

**2. Graceful degradation**

```javascript
async function copyWithFallback(src, dest) {
  try {
    await fs.promises.copyFile(src, dest)
  } catch (error) {
    if (error.code === 'EACCES') {
      console.warn(`⚠️  Permission denied: ${dest}`)
      console.warn('   Trying alternative location...')
      
      // Fall back to user-local directory
      const altDest = path.join(os.homedir(), '.local', 'share', 'gsd', ...)
      await fs.promises.mkdir(path.dirname(altDest), { recursive: true })
      await fs.promises.copyFile(src, altDest)
      
      console.log(`✓  Installed to alternative location: ${altDest}`)
      return altDest
    }
    throw error
  }
}
```

**Implementation checklist:**
- [ ] Pre-flight permission check
- [ ] Clear error messages for permission issues
- [ ] Suggest fixes (chmod, sudo)
- [ ] Fallback to user-local directories
- [ ] Document permission requirements in README

---

## 5. Design Recommendations for Extensibility

### Architecture: Plugin-Based Adapters

```
installer/
├── core/
│   ├── transaction.js       # Atomic installation
│   ├── validator.js         # Template validation
│   ├── discovery.js         # Convention-based skill discovery
│   └── installer.js         # Main installer logic
├── adapters/
│   ├── base.js              # PlatformAdapter base class
│   ├── claude.js            # ClaudeAdapter
│   ├── copilot.js           # CopilotAdapter
│   ├── codex.js             # CodexAdapter
│   └── registry.js          # Adapter registration
├── templates/
│   ├── skills/              # Platform-agnostic templates
│   ├── agents/
│   └── manifest.json        # Template metadata
└── cli.js                   # Command-line interface
```

**Key principles:**

1. **Separation of concerns**
   - Templates: Content only, no platform logic
   - Adapters: Platform-specific transformations
   - Core: Installation orchestration

2. **Convention over configuration**
   - Discover skills by directory structure
   - No hardcoded file lists
   - Metadata in standardized locations

3. **Fail-safe by default**
   - Transaction-based installation
   - Backup before overwrite
   - Rollback on error

4. **Security first**
   - Path validation
   - Content analysis
   - Permission checks

---

### Adding a New Platform (Example: Gemini CLI)

**Step 1:** Create adapter

```javascript
// adapters/gemini.js
import { PlatformAdapter } from './base.js'

export class GeminiAdapter extends PlatformAdapter {
  get platform() {
    return 'gemini'
  }
  
  async detectVersion() {
    // Gemini CLI detection logic
  }
  
  getTargetPath(skillName) {
    return path.join(os.homedir(), '.gemini', 'skills', skillName)
  }
  
  transformFrontmatter(frontmatter) {
    // Gemini-specific transformations
    return {
      ...frontmatter,
      gemini_version: this.specVersion
    }
  }
  
  resolveReference(refPath) {
    return `@~/.gemini/get-shit-done/${refPath}`
  }
}
```

**Step 2:** Register adapter

```javascript
// adapters/registry.js
import { GeminiAdapter } from './gemini.js'

export function getAdapter(platform) {
  const adapters = {
    claude: ClaudeAdapter,
    copilot: CopilotAdapter,
    codex: CodexAdapter,
    gemini: GeminiAdapter  // ← Add here
  }
  
  const AdapterClass = adapters[platform]
  if (!AdapterClass) {
    throw new Error(`Unknown platform: ${platform}`)
  }
  
  return new AdapterClass()
}
```

**Step 3:** Update platform list

```javascript
// core/constants.js
export const SUPPORTED_PLATFORMS = [
  'claude',
  'copilot',
  'codex',
  'gemini'  // ← Add here
]
```

**That's it!** Templates automatically work with new platform.

---

### Testing Strategy

**1. Unit tests** (Fast, isolated)

```javascript
describe('Transaction', () => {
  it('rolls back on failure', async () => {
    const tx = new Transaction()
    const testDir = await mkdtemp()
    
    tx.addOperation(new CreateFile(path.join(testDir, 'file1.txt')))
    tx.addOperation(new CreateFile('/forbidden/path')) // Will fail
    
    await expect(tx.commit()).rejects.toThrow()
    
    // Verify rollback: file1.txt should not exist
    expect(fs.existsSync(path.join(testDir, 'file1.txt'))).toBe(false)
  })
})

describe('PathValidator', () => {
  it('blocks path traversal', () => {
    expect(() => {
      validatePath('../../../etc/passwd', '/home/user/.claude')
    }).toThrow('Path traversal detected')
  })
})
```

**2. Integration tests** (Medium speed, real file system in temp dir)

```javascript
describe('Installation', () => {
  let testDir
  
  beforeEach(async () => {
    testDir = await mkdtemp()
    process.env.CLAUDE_CONFIG_DIR = testDir
  })
  
  afterEach(async () => {
    await fs.promises.rm(testDir, { recursive: true })
  })
  
  it('installs all skills', async () => {
    await install({ platform: 'claude' })
    
    const skills = await fs.promises.readdir(
      path.join(testDir, '.claude', 'skills')
    )
    
    expect(skills).toContain('gsd-new-project')
    expect(skills).toContain('gsd-execute-phase')
  })
})
```

**3. E2E tests** (Slow, real CLI platforms)

```javascript
describe('E2E: Claude installation', () => {
  it('installs and skill is usable', async () => {
    // Run actual installation
    execSync('npx get-shit-done-multi', { stdio: 'inherit' })
    
    // Verify Claude can see skills
    const output = execSync('claude --list-skills', { encoding: 'utf-8' })
    expect(output).toContain('gsd-new-project')
  })
})
```

**4. Security tests** (Critical)

```javascript
describe('Security', () => {
  it('rejects malicious path', async () => {
    const maliciousTemplate = {
      name: 'evil-skill',
      targetPath: '../../../../.ssh/authorized_keys'
    }
    
    await expect(
      install(maliciousTemplate)
    ).rejects.toThrow('Path traversal detected')
  })
  
  it('rejects template with shell commands', async () => {
    const template = `
      ---
      name: evil-skill
      ---
      $(rm -rf /)
    `
    
    const analysis = analyzeTemplate(template)
    expect(analysis.errors).toHaveLength(1)
    expect(analysis.errors[0].type).toBe('shell_command')
  })
})
```

**Test matrix:**

| Platform | Node Version | OS |
|----------|--------------|-----|
| claude   | 16, 18, 20   | Linux, macOS, Windows |
| copilot  | 16, 18, 20   | Linux, macOS, Windows |
| codex    | 16, 18, 20   | Linux, macOS, Windows |

**CI pipeline:**

```yaml
# .github/workflows/test.yml
name: Test
on: [push, pull_request]

jobs:
  test:
    strategy:
      matrix:
        node: [16, 18, 20]
        os: [ubuntu-latest, macos-latest, windows-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: ${{ matrix.node }}
      
      - run: npm ci
      - run: npm run test:unit
      - run: npm run test:integration
      - run: npm run validate-templates
      
      # Security checks
      - run: npm audit
      - run: npm run test:security
```

---

## Summary: Risk Matrix

| Risk | Severity | Likelihood | Impact | Mitigation Priority |
|------|----------|-----------|--------|---------------------|
| **Frontmatter Transformation Risks** | | | | |
| YAML frontmatter transformation errors | 🔴 Critical | High | Critical | **P0** |
| Skill reference extraction regex failures | 🔴 Critical | Medium | High | **P0** |
| Atomic file write without rollback | 🟡 Moderate | High | High | **P0** |
| JSON generation validation gaps | 🟡 Moderate | Medium | Medium | **P1** |
| Cross-platform file operation issues | 🟡 Moderate | High | Medium | **P1** |
| **General Installer Risks** | | | | |
| Partial installation without rollback | 🔴 Critical | High | High | **P0** |
| Path traversal vulnerability | 🔴 Critical | Medium | Critical | **P0** |
| Malicious template content | 🔴 Critical | Low | Critical | **P0** |
| Directory conflicts | 🔴 Critical | High | High | **P0** |
| CLI platform spec changes | 🔴 Critical | Medium | High | **P1** |
| Adapter leakage into templates | 🔴 Critical | Medium | High | **P1** |
| Template validation failures | 🟡 Moderate | High | Medium | **P1** |
| Installation failure detection | 🟡 Moderate | Medium | Medium | **P2** |
| Template versioning | 🟡 Moderate | Medium | Low | **P2** |
| Backward compatibility | 🟡 Moderate | Low | Medium | **P2** |
| Adding skills requires code | 🟡 Moderate | High | Low | **P2** |
| Testing pollutes directories | 🟡 Moderate | Medium | Low | **P3** |
| Overwriting user data | 🟡 Moderate | Medium | Medium | **P3** |
| Permission requirements | 🟢 Minor | Medium | Low | **P3** |

---

## Testing Strategy for Frontmatter Transformation

### Critical Test Scenarios

**These tests MUST pass before shipping transformation code:**

#### 1. YAML Edge Cases

```javascript
describe('YAML parsing edge cases', () => {
  test('preserves flow array syntax', () => {
    const input = `---
tools: [read, edit, execute]
---`
    const output = transform(input, removeField('other'))
    expect(output).toMatch(/tools: \[read, edit, execute\]/)
  })
  
  test('handles trailing commas in flow arrays', () => {
    const input = `tools: [read, edit,]`
    // Should parse correctly despite trailing comma
    expect(() => transform(input, [])).not.toThrow()
  })
  
  test('preserves multiline literal strings', () => {
    const input = `---
description: |
  Line 1
  Line 2
  Line 3
---`
    const output = transform(input, removeField('other'))
    expect(output).toContain('Line 1\n  Line 2\n  Line 3')
  })
  
  test('preserves inline comments', () => {
    const input = `tools: [read, edit]  # Required tools`
    const output = transform(input, removeField('other'))
    expect(output).toContain('# Required tools')
  })
  
  test('handles special characters in values', () => {
    const input = `name: "User's Guide: Getting Started"`
    const output = transform(input, [])
    expect(output).toContain(`"User's Guide: Getting Started"`)
  })
  
  test('handles colons in unquoted values', () => {
    const input = `name: Error: invalid`
    // Should require quotes or fail gracefully
    expect(() => yaml.parse(input)).toThrow()
  })
})
```

#### 2. Field Removal Precision

```javascript
describe('Field removal precision', () => {
  test('removes exact field only', () => {
    const input = `---
metadata:
  platform: copilot
  platformVersion: 1.0
  generated: '2024-01-01'
---`
    const output = transform(input, removeField('metadata.platform'))
    expect(output).not.toContain('platform: copilot')
    expect(output).toContain('platformVersion: 1.0')
    expect(output).toContain('generated:')
  })
  
  test('removes nested field without affecting siblings', () => {
    const input = `---
tools: [read, edit]
tools_optional: [agent]
---`
    const output = transform(input, removeField('tools_optional'))
    expect(output).toContain('tools: [read, edit]')
    expect(output).not.toContain('tools_optional')
  })
  
  test('handles empty parent after removal', () => {
    const input = `---
metadata:
  platform: copilot
---`
    const output = transform(input, removeField('metadata.platform'))
    // Should remove empty 'metadata:' or leave it - must be consistent
    const hasEmptyMetadata = output.match(/metadata:\s*\n---/)
    expect(hasEmptyMetadata).toBe(null)  // Should remove empty parent
  })
  
  test('preserves indentation after removal', () => {
    const input = `---
agent:
  name: test
  metadata:
    platform: copilot
    version: 1.0
---`
    const output = transform(input, removeField('agent.metadata.platform'))
    expect(output).toMatch(/version: 1\.0/)
    // Indentation should remain consistent
    expect(output).toMatch(/\n    version: 1\.0/)
  })
})
```

#### 3. Tool Mapping

```javascript
describe('Tool name mapping', () => {
  test('maps case-insensitive tool names', () => {
    const cases = [
      { input: 'execute', expected: 'Bash' },
      { input: 'Execute', expected: 'Bash' },
      { input: 'EXECUTE', expected: 'Bash' },
      { input: 'search', expected: 'Grep' },
      { input: 'SEARCH', expected: 'Grep' }
    ]
    
    for (const { input, expected } of cases) {
      const yaml = `tools: [${input}]`
      const output = transform(yaml, mapTools)
      expect(output).toContain(expected)
    }
  })
  
  test('handles unknown tool names', () => {
    const input = `tools: [read, unknown_tool, edit]`
    // Should either error or warn, not silently pass through
    expect(() => transform(input, mapTools)).toThrow(/unknown_tool/)
  })
  
  test('preserves platform-specific tools', () => {
    const input = `tools: [read, mcp__context7__query]`
    const output = transform(input, mapTools)
    expect(output).toContain('mcp__context7__query')
  })
  
  test('maps multiple tools in array', () => {
    const input = `tools: [execute, search, read, edit]`
    const output = transform(input, mapTools)
    expect(output).toContain('Bash')
    expect(output).toContain('Grep')
  })
})
```

#### 4. Skill Reference Extraction

```javascript
describe('Skill reference extraction', () => {
  test('extracts valid skill references', () => {
    const markdown = `
Spawns /gsd-planner agent.
Depends on /gsd-map-codebase.
`
    const refs = extractSkillRefs(markdown)
    expect(refs).toEqual(['/gsd-planner', '/gsd-map-codebase'])
  })
  
  test('ignores code blocks', () => {
    const markdown = `
Valid: /gsd-real

\`\`\`bash
# Fake: /gsd-fake
\`\`\`
`
    const refs = extractSkillRefs(markdown)
    expect(refs).toEqual(['/gsd-real'])
    expect(refs).not.toContain('/gsd-fake')
  })
  
  test('ignores inline code', () => {
    const markdown = `Use \`/gsd-old\` or /gsd-new`
    const refs = extractSkillRefs(markdown)
    expect(refs).toEqual(['/gsd-new'])
    expect(refs).not.toContain('/gsd-old')
  })
  
  test('ignores URLs', () => {
    const markdown = `
See https://example.com/gsd-docs/gsd-guide
Use /gsd-real-skill
`
    const refs = extractSkillRefs(markdown)
    expect(refs).toEqual(['/gsd-real-skill'])
  })
  
  test('handles skill names with numbers', () => {
    const markdown = `/gsd-add-phase-v2`
    const refs = extractSkillRefs(markdown)
    expect(refs).toContain('/gsd-add-phase-v2')
  })
})
```

#### 5. Batch Transformation with Rollback

```javascript
describe('Batch transformation', () => {
  test('transforms all files atomically', async () => {
    const files = ['file1.md', 'file2.md', 'file3.md']
    
    // Setup: Create test files
    for (const file of files) {
      fs.writeFileSync(file, `---\nname: ${file}\n---\nContent`)
    }
    
    // Transform
    await transformAllFiles(files, removeField('other'))
    
    // Verify all transformed
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8')
      expect(content).toMatch(/^---/)
    }
  })
  
  test('rolls back on error', async () => {
    const files = ['good1.md', 'good2.md', 'bad.md', 'good3.md']
    
    // Setup files
    for (const file of files) {
      if (file === 'bad.md') {
        fs.writeFileSync(file, 'invalid yaml')
      } else {
        fs.writeFileSync(file, `---\nname: ${file}\n---`)
      }
    }
    
    // Attempt transform
    await expect(transformAllFiles(files, [])).rejects.toThrow()
    
    // Verify NO files changed (atomic rollback)
    for (const file of files) {
      if (file !== 'bad.md') {
        const content = fs.readFileSync(file, 'utf-8')
        expect(content).toBe(`---\nname: ${file}\n---`)
      }
    }
  })
  
  test('handles disk full during write', async () => {
    // Mock fs.writeFileSync to fail after 2 files
    let writeCount = 0
    const originalWrite = fs.writeFileSync
    fs.writeFileSync = (...args) => {
      if (++writeCount > 2) throw new Error('ENOSPC: disk full')
      return originalWrite(...args)
    }
    
    try {
      const files = ['f1.md', 'f2.md', 'f3.md', 'f4.md']
      await expect(transformAllFiles(files, [])).rejects.toThrow('disk full')
      
      // Verify cleanup of temp files
      for (const file of files) {
        expect(fs.existsSync(file + '.tmp')).toBe(false)
      }
    } finally {
      fs.writeFileSync = originalWrite
    }
  })
})
```

#### 6. Cross-Platform File Operations

```javascript
describe('Cross-platform compatibility', () => {
  test('handles Windows path separators', () => {
    const winPath = 'templates\\agents\\skill.md'
    const normalized = normalizePath(winPath)
    expect(normalized).toBe('templates/agents/skill.md')
  })
  
  test('handles Windows line endings', () => {
    const content = "line1\r\nline2\r\nline3"
    const normalized = normalizeLineEndings(content)
    expect(normalized).toBe("line1\nline2\nline3")
  })
  
  test('preserves mixed line endings warning', () => {
    const content = "line1\nline2\r\nline3\n"
    expect(() => validateLineEndings(content)).toThrow(/mixed/)
  })
  
  test('skips chmod on Windows', () => {
    if (process.platform === 'win32') {
      expect(() => makeExecutable('file.sh')).not.toThrow()
    }
  })
})
```

#### 7. JSON Generation Validation

```javascript
describe('JSON generation', () => {
  test('generates valid JSON', () => {
    const data = {
      name: 'test',
      version: '1.0.0',
      skills: ['skill1', 'skill2']
    }
    const json = generateJSON(data)
    expect(() => JSON.parse(json)).not.toThrow()
  })
  
  test('rejects invalid data', () => {
    const data = {
      name: 'test',
      value: undefined  // Invalid in JSON
    }
    expect(() => generateJSON(data)).toThrow()
  })
  
  test('adds trailing newline', () => {
    const json = generateJSON({ name: 'test' })
    expect(json.endsWith('\n')).toBe(true)
  })
  
  test('pretty prints with 2 spaces', () => {
    const json = generateJSON({ a: { b: 'c' } })
    expect(json).toContain('  "a"')
    expect(json).toContain('    "b"')
  })
})
```

### Systematic Error Detection

**Before batch transformation, run pre-flight checks:**

```javascript
async function preflight(files) {
  const issues = []
  
  for (const file of files) {
    // 1. File exists and readable
    if (!fs.existsSync(file)) {
      issues.push({ file, error: 'File not found' })
      continue
    }
    
    // 2. Valid UTF-8
    try {
      fs.readFileSync(file, 'utf-8')
    } catch (e) {
      issues.push({ file, error: 'Invalid UTF-8 encoding' })
      continue
    }
    
    // 3. Has frontmatter
    const content = fs.readFileSync(file, 'utf-8')
    if (!content.match(/^---\r?\n[\s\S]*?\n---/)) {
      issues.push({ file, error: 'No frontmatter found' })
      continue
    }
    
    // 4. Frontmatter parses
    try {
      const fenceMatch = content.match(/^---\r?\n([\s\S]*?)\n---/)
      yaml.parse(fenceMatch[1])
    } catch (e) {
      issues.push({ file, error: `YAML parse error: ${e.message}` })
      continue
    }
    
    // 5. Check line endings
    if (content.includes('\r\n') && content.includes('\n') && 
        !content.match(/\n/g).every((_, i, arr) => 
          i === arr.length - 1 || content[content.indexOf('\n', i) - 1] === '\r'
        )) {
      issues.push({ file, warning: 'Mixed line endings detected' })
    }
  }
  
  if (issues.some(i => i.error)) {
    throw new Error(`Preflight failed:\n${formatIssues(issues)}`)
  }
  
  if (issues.some(i => i.warning)) {
    console.warn(`Preflight warnings:\n${formatIssues(issues)}`)
  }
}
```

### Regression Test Suite

**Must run before every commit:**

```bash
# Test with real template files
npm run test:templates

# Test edge cases
npm run test:edge-cases

# Test cross-platform (in CI)
npm run test:windows
npm run test:linux
npm run test:macos

# Test with 42 files simultaneously
npm run test:batch

# Test rollback scenarios
npm run test:rollback
```

### Warning Signs During Development

**If you see these, STOP and investigate:**

1. **Transformation takes >100ms per file** → Regex catastrophic backtracking
2. **Output file size differs by >10% from input** → Content lost or duplicated
3. **Array syntax changes** (flow → block or vice versa) → Not preserving style
4. **Indentation changes** (2 spaces → 4 spaces) → YAML structure may break
5. **Test passes locally but fails in CI** → Platform-specific issue
6. **Git shows entire file changed** when only frontmatter touched → Line ending issue
7. **One file fails but others succeed** → Not atomic, rollback missing
8. **Error message doesn't include filename** → Hard to debug, add context

---

## Implementation Roadmap

### Phase 1: Foundation (P0)
**Goal:** Safe, atomic installation with frontmatter transformation

**Frontmatter Transformation (Critical):**
- [ ] Use `yaml` package with AST support (not regex)
- [ ] Atomic file writes (write to .tmp, then rename)
- [ ] Batch transformation with rollback on first error
- [ ] Preserve YAML formatting (flow arrays, indentation, comments)
- [ ] Field removal by exact path (`metadata.platform`, not substring match)
- [ ] Tool name mapping with case normalization
- [ ] Skill reference extraction (excluding code blocks)
- [ ] JSON generation with validation

**Transaction Safety:**
- [ ] Transaction-based installation
- [ ] Rollback on failure
- [ ] Path validation (block traversal)
- [ ] Pre-flight directory checks
- [ ] Installation markers (`.gsd-meta.json`)

**Testing (Critical - run on every commit):**
- [ ] YAML edge case tests (flow arrays, multiline, comments)
- [ ] Field removal precision tests
- [ ] Tool mapping tests (case insensitive)
- [ ] Skill reference extraction tests
- [ ] Batch transformation with rollback tests
- [ ] Cross-platform tests (Windows, Mac, Linux)

### Phase 2: Validation (P1)
**Goal:** Fail fast with clear errors

**Frontmatter Validation:**
- [ ] Pre-flight: Validate all 42 files parse correctly
- [ ] During transformation: Validate after each file
- [ ] Post-transformation: Full validation suite
- [ ] Error messages with filename and line number
- [ ] Warning for mixed line endings
- [ ] JSON schema validation for version.json files

**Template Validation:**
- [ ] Template validation (JSON Schema)
- [ ] Frontmatter parsing
- [ ] Content security analysis
- [ ] Post-installation verification
- [ ] Platform adapter abstraction

### Phase 3: Extensibility (P2)
**Goal:** Easy to add platforms and skills

- [ ] Convention-based skill discovery
- [ ] Adapter registry
- [ ] Template versioning
- [ ] Version compatibility checks
- [ ] Migration system

### Phase 4: Polish (P3)
**Goal:** Great user experience

- [ ] Interactive conflict resolution
- [ ] Backup before overwrite
- [ ] Graceful permission degradation
- [ ] Test isolation
- [ ] Comprehensive error messages
- [ ] Dry-run mode for transformations
- [ ] Progress reporting for 42-file batch

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| **Frontmatter Transformation** | | |
| YAML parsing with AST | **HIGH** | `yaml` package is mature, battle-tested |
| Field removal precision | **HIGH** | AST manipulation is predictable |
| Tool name mapping | **HIGH** | Simple dictionary lookup with normalization |
| Skill reference extraction | **MEDIUM** | Regex-based, tested but needs edge case validation |
| Batch atomic operations | **HIGH** | Standard write-tmp-rename pattern |
| Cross-platform file ops | **MEDIUM** | Windows/Unix differences require careful testing |
| **General Installer** | | |
| Validation patterns | **HIGH** | Standard JSON Schema + YAML parsing (established tools) |
| Transaction/rollback | **HIGH** | Well-known pattern (databases, package managers) |
| Path security | **HIGH** | Standard path traversal prevention techniques |
| Adapter pattern | **HIGH** | Proven extensibility pattern (webpack, babel, etc.) |
| Content analysis | **MEDIUM** | Heuristic-based, can have false positives/negatives |
| Platform spec changes | **MEDIUM** | Can't predict vendor changes, must react |
| Testing isolation | **HIGH** | Standard temp directory + env var patterns |

**Critical confidence gaps:**
1. **Skill reference extraction** - Markdown parsing with regex has edge cases; needs comprehensive test suite
2. **Cross-platform file operations** - Windows line endings, path separators, permissions need testing on actual Windows systems
3. **Edge case coverage** - Unknown unknowns in 42 diverse template files; need to test with REAL files early

---

## Open Questions for Phase-Specific Research

1. **What YAML formatting variations exist in current 42 template files?**
   - Array syntax: all flow `[a, b]` or some block style?
   - Multiline strings: literal `|` or folded `>`?
   - Comment usage: inline vs block?
   - Indentation: consistently 2 spaces?
   - Flag for Phase 1 research - MUST examine real files before implementing

2. **What is the complete tool mapping for Copilot → Claude?**
   - Currently known: `execute` → `Bash`, `search` → `Grep`
   - What other tool aliases exist?
   - Are there platform-specific tools (like `mcp__*`)?
   - Flag for Phase 1 research

3. **What fields need to be removed vs transformed in frontmatter?**
   - Remove: `metadata.platform`, `metadata.generated`, etc.
   - Transform: `tools` array with mapping
   - Preserve: which fields stay unchanged?
   - Flag for Phase 1 research

4. **What is the exact frontmatter spec for each platform today?**
   - Need to document current state for each CLI
   - Identify what varies between platforms
   - Flag for Phase 1 research

5. **How do Claude/Copilot/Codex handle skill updates?**
   - Do they hot-reload?
   - Require restart?
   - Cache skill definitions?
   - Flag for Phase 1 research

6. **What file permissions do skills need?**
   - Executable bits required?
   - Platform differences?
   - Flag for Phase 1 research

7. **How can we detect CLI platform versions?**
   - Command-line flags?
   - Config files?
   - API endpoints?
   - Flag for Phase 2 research

---

## Sources

**HIGH confidence (established patterns):**
- YAML parsing: `yaml` npm package documentation (v2.x), YAML 1.2 specification
- Transaction pattern: Database systems (PostgreSQL docs), package managers (npm, apt)
- Path validation: OWASP Path Traversal Prevention Cheat Sheet
- JSON Schema: Official JSON Schema specification
- Adapter pattern: Gang of Four Design Patterns
- Atomic file operations: POSIX rename(2) semantics, Node.js fs.renameSync documentation

**MEDIUM confidence (domain knowledge):**
- Frontmatter edge cases: Common issues from Jekyll, Hugo, and other static site generators
- YAML pitfalls: Known from js-yaml, yaml-js parser issues
- Regex catastrophic backtracking: Standard regex performance issues
- Cross-platform file operations: Node.js platform differences (documented)

**LOW confidence (inferred from project):**
- CLI frontmatter structure: Based on existing `.claude/skills/` and `.github/skills/` files
- Platform differences: Observed from current multi-platform support
- File structure: Current project layout

**Areas needing validation with real data:**
- Exact YAML formatting in all 42 template files (MUST examine before implementing)
- Complete tool mapping dictionary (may have more than execute→Bash, search→Grep)
- Full list of fields to remove vs transform
- Skill reference patterns in markdown (may have edge cases not covered)
- Platform-specific installation requirements
- Skill hot-reloading behavior

**Critical: Test with REAL template files EARLY**
- Don't implement transformation logic without examining actual file variations
- One systematic error affects all 42 files
- Early validation with real data prevents rewrite

---

**Research complete. Ready for roadmap creation.**
