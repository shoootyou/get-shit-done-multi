# Risk Analysis: Template-Based Multi-CLI Installer

**Project:** get-shit-done-multi  
**Researched:** 2025-01-25 (Updated: 2025-01-26 with corrected migration architecture)  
**Domain:** Template-based installer for AI CLI skills and agents  
**Confidence:** HIGH (based on established installer patterns, Node.js ecosystem practices, and security best practices)

---

## Executive Summary

Building a template-based installer that supports multiple AI CLI platforms (Claude, Copilot, Codex, and future platforms) introduces risks across **validation**, **versioning**, **extensibility**, **security**, and **one-time migration architecture**.

**CRITICAL MIGRATION RISKS (Phase 1):**
- **🔴 CRITICAL:** User approves migration with bugs → broken templates committed to production
- **🔴 CRITICAL:** Manual validation is incomplete → subtle bugs missed
- **🔴 CRITICAL:** Migration deleted after approval → bugs found later require manual fixes
- **🟡 HIGH:** User doesn't understand what to check → approves without thorough review
- **🟡 HIGH:** Validation checklist incomplete → critical checks missed

**POST-MIGRATION RISKS (Phase 2+):**
- **🔴 CRITICAL:** Template bugs discovered after deletion → must fix manually (no automation)
- **🔴 CRITICAL:** Multiple templates affected → hours of manual editing
- **🟡 HIGH:** Manual fixes are error-prone → may introduce new bugs
- **🟡 MODERATE:** No recovery mechanism → must write new migration code if needed

**INSTALLATION RISKS (All Phases):**
- **🔴 CRITICAL:** Partial installations without rollback can corrupt user environments
- **🔴 CRITICAL:** Path traversal vulnerabilities can overwrite system files
- **🟡 HIGH:** Breaking changes in CLI frontmatter specs can break existing templates
- **🟡 MODERATE:** Adding new platforms requires careful abstraction to avoid template pollution

**Architecture principle:** 
1. Phase 1: Make manual validation FOOLPROOF before deletion
2. Post-deletion: Accept that fixes are manual (trade-off for simplicity)
3. All Phases: Plugin-based adapter pattern with atomic installation transactions

---

## ⚠️ MIGRATION-SPECIFIC RISKS (Phase 1 Only)

These risks are unique to the **one-time migration architecture** where Phase 1 converts `.github/` → `/templates/` with frontmatter corrections, commits once, then **completely deletes** migration code (`rm -rf scripts/`).

**Key architectural constraints:**
- Migration runs ONCE, user manually validates, explicit approval required
- After approval: migration code DELETED (committed to git, then removed)
- NO .archive/, NO preservation, NO emergency recovery mechanisms
- Git history is ONLY reference (not executable)
- Bugs found later: Must fix manually or write NEW code

---

### 🔴 CRITICAL: User Approves Migration With Bugs

**What goes wrong:**
User runs migration, sees "✓ Migration complete", quickly reviews a few files, approves. Migration code deleted. Later discover:
- Agent skill references have wrong format (`gsd-new-project` instead of `/gsd-new-project`)
- Tool names use wrong platform conventions (Copilot names in Claude templates)
- Template variables malformed (`{{PLATFORMROOT}}` instead of `{{PLATFORM_ROOT}}`)
- Affects 13+ files, must fix manually (migration code is gone)

**Why it happens:**
- User doesn't understand what to check
- Validation output too verbose/unclear
- User trusts "migration complete" message
- Pressure to finish Phase 1
- Validation checklist incomplete

**Consequences:**
- Broken templates committed to production
- Migration code deleted (can't re-run)
- Must manually fix all affected files
- Hours of manual editing work
- Manual fixes may introduce new bugs
- Users experience broken installations

**Example failure scenario:**
```bash
$ npm run migrate
✓ Migration complete. 42 files processed.
✓ No YAML errors detected.
✓ All files written successfully.

# User quickly checks 3 files, looks OK
$ git add templates/
$ git commit -m "Phase 1: Migrate to templates"
$ rm -rf scripts/  # Migration deleted

# Days later, during installation testing...
$ npx get-shit-done install /gsd-new-project
ERROR: Skill not found: gsd-new-project
# Wrong format! Should be "/gsd-new-project" with leading slash
# Must manually fix 13 agent files (migration can't be re-run)
```

**Prevention strategy:**

**1. MANDATORY Manual Validation Checklist:**

Phase 1 MUST pause after migration for explicit approval. User MUST complete this checklist:

```markdown
## Phase 1 Validation Checklist

Migration has completed. Before approving deletion:

### YAML Syntax (Automated)
- [ ] All 42 files parse as valid YAML
- [ ] No syntax errors reported

### Frontmatter Correctness (MANUAL)
- [ ] Pick 3 random skills: Check `allowed-tools` use correct names (Read, Write, Bash)
- [ ] Pick 3 random agents: Check `skills` references have leading slash (`/gsd-new-project`)
- [ ] Check version.json files have correct schema

### Template Variables (MANUAL)
- [ ] Search for `{{PLATFORM_ROOT}}` - correctly formatted (not `{{PLATFORMROOT}}`)
- [ ] Search for `{{COMMAND_PREFIX}}` - correctly formatted (not `{{COMMAND-PREFIX}}`)
- [ ] No malformed variables (partial replacements, typos)

### Reference Integrity (Automated + Manual Spot-Check)
- [ ] All agent skill references point to existing skills
- [ ] All tool names are valid for target platform
- [ ] No broken internal links

### Test Installation (CRITICAL)
- [ ] Install one skill: `node bin/install.js /gsd-test-skill /tmp/test`
- [ ] Install one agent: `node bin/install.js /gsd-executor /tmp/test`
- [ ] Both installations complete without errors
- [ ] Check installed files have correct content

### Manual Review (HIGH SCRUTINY)
- [ ] Review 10+ files in detail (not just 2-3)
- [ ] Check at least 3 skills AND 3 agents
- [ ] Look for patterns of error (if one file wrong, check similar files)

**ONLY approve if ALL checks pass. If ANY check fails, fix migration and re-run.**

**After approval, migration code will be DELETED. You cannot re-run it.**
```

**2. Explicit Approval Command:**

Don't make deletion automatic. Require explicit command:

```bash
# scripts/approve-migration.sh
#!/bin/bash

echo "⚠️  MIGRATION APPROVAL"
echo ""
echo "You are about to:"
echo "  1. Commit migrated templates to git"
echo "  2. DELETE migration code (rm -rf scripts/)"
echo "  3. Cannot re-run migration after this"
echo ""
echo "Have you completed the validation checklist?"
read -p "  (Y)es, all checks passed / (N)o, need more time: " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Approval cancelled. Complete validation before approving."
  exit 1
fi

echo ""
echo "Final confirmation:"
read -p "  Type 'DELETE MIGRATION' to proceed: " confirm

if [[ "$confirm" != "DELETE MIGRATION" ]]; then
  echo "Approval cancelled."
  exit 1
fi

# Commit templates
git add templates/
git commit -m "Phase 1: Migrate to templates (validated)"

# Delete migration code
rm -rf scripts/migrate-to-templates.js scripts/migrate-*.js

# Commit deletion
git add -A
git commit -m "Phase 1: Remove migration code (one-time use)"

echo ""
echo "✓ Migration approved and code deleted."
echo ""
echo "⚠️  Migration code is now only in git history."
echo "   If bugs found later, you must fix manually."
```

**3. Verbose, Focused Validation Output:**

Don't just say "✓ complete". Show what to check:

```javascript
// scripts/migrate-to-templates.js (end of execution)

console.log('\n✓ Migration executed successfully\n')
console.log('📋 MANUAL VALIDATION REQUIRED\n')
console.log('Before approving (scripts/approve-migration.sh), CHECK:')
console.log('')
console.log('1. Frontmatter correctness:')
console.log('   - Open templates/skills/gsd-new-project.md')
console.log('   - Check allowed-tools: Read, Write, Bash (capitalized)')
console.log('   - Open templates/agents/gsd-executor.md')
console.log('   - Check skills: /gsd-new-project (leading slash)')
console.log('')
console.log('2. Template variables:')
console.log('   - Search for {{PLATFORM_ROOT}} (correct)')
console.log('   - Search for {{COMMAND_PREFIX}} (correct)')
console.log('   - Ensure no {{platformroot}} or {{command-prefix}} (wrong)')
console.log('')
console.log('3. Test installation:')
console.log('   - Run: node bin/install.js /gsd-test-skill /tmp/test')
console.log('   - Should complete without errors')
console.log('')
console.log('4. Review at least 10 files manually')
console.log('')
console.log('⚠️  After approval, migration code will be DELETED.')
console.log('   You cannot re-run it. Validate thoroughly.')
console.log('')
console.log('When ready: scripts/approve-migration.sh')
```

**4. Automated Pre-Flight Checks:**

Catch obvious errors before user review:

```javascript
// scripts/validate-migration.js (runs automatically after migration)

async function validateMigration() {
  const errors = []
  
  // Check 1: All skill references in agents are valid
  const skills = await loadSkills('templates/skills')
  const agents = await loadAgents('templates/agents')
  const skillNames = skills.map(s => s.name)
  
  for (const agent of agents) {
    const refs = extractSkillReferences(agent.content)
    for (const ref of refs) {
      if (!skillNames.includes(ref)) {
        errors.push(`${agent.file}: Invalid skill reference: ${ref}`)
      }
    }
  }
  
  // Check 2: All tool names are valid
  const validTools = ['Read', 'Write', 'Bash', 'Edit', 'Grep', 'Task']
  for (const skill of skills) {
    if (skill.frontmatter['allowed-tools']) {
      const tools = skill.frontmatter['allowed-tools'].split(',').map(t => t.trim())
      for (const tool of tools) {
        if (!validTools.includes(tool)) {
          errors.push(`${skill.file}: Invalid tool name: ${tool}`)
        }
      }
    }
  }
  
  // Check 3: No malformed template variables
  const allFiles = await glob('templates/**/*.md')
  for (const file of allFiles) {
    const content = await fs.readFile(file, 'utf-8')
    const malformed = content.match(/\{\{[^}]*\}\}/g) || []
    for (const variable of malformed) {
      if (!['{{PLATFORM_ROOT}}', '{{COMMAND_PREFIX}}'].includes(variable)) {
        errors.push(`${file}: Malformed variable: ${variable}`)
      }
    }
  }
  
  if (errors.length > 0) {
    console.error('\n❌ VALIDATION FAILED\n')
    console.error('Fix these errors before approving:\n')
    errors.forEach(err => console.error(`  - ${err}`))
    console.error('\nDo NOT approve until all errors fixed.')
    process.exit(1)
  }
  
  console.log('\n✓ Automated validation passed')
  console.log('  Proceed to manual validation checklist.')
}
```

**Detection:**
- Automated pre-flight catches obvious errors
- Manual checklist catches subtle errors
- Test installation catches runtime errors
- CANNOT detect after approval (migration deleted)

**When safe to approve:**
- ✅ All automated checks pass (no errors)
- ✅ Manual checklist completed (all boxes checked)
- ✅ Test installation successful (at least 2 installs)
- ✅ Reviewed 10+ files in detail
- ✅ Understand you cannot re-run migration after approval

**Phase mapping:** Phase 1 completion (approval decision)

---

### 🔴 CRITICAL: Bugs Discovered After Migration Deleted

**What goes wrong:**
Phase 1 complete, migration approved and deleted. Development continues (Phase 2-3). Discover bugs:
- **Scenario A:** Agent skill references all missing leading slash (13 files affected)
- **Scenario B:** Tool mappings incorrect (29 files affected)
- **Scenario C:** New skill added to `.github/`, need to migrate one more file

Migration code is DELETED. Cannot re-run. Must:
- Fix manually (hours of editing)
- Write NEW migration code from scratch
- Or live with broken templates

**Why it happens:**
- Validation missed edge cases
- Bugs only surface during integration
- Real-world usage reveals issues testing didn't catch
- Manual validation is imperfect (human error)

**Consequences:**
- Hours of manual editing work
- Error-prone (manual fixes may introduce new bugs)
- Inconsistent fixes if done in batches
- Lost productivity
- May need to write new migration code (recreate deleted work)

**Example failure scenario:**
```
Day 1: Phase 1 complete, migration approved, code deleted
Day 5: Phase 2 - building installer, test installation
       Discover: All agent skill references fail
       Cause: Missing leading slash (should be /gsd-new-project)
       Affected: 13 agent files
       
Day 5: Must manually edit 13 files:
       - Open each agent file
       - Find skills: line in frontmatter
       - Add leading slash to each skill reference
       - Test installation
       - Fix any typos made during manual editing
       Time: 1-2 hours
       
Day 7: Discover ANOTHER bug (tool names wrong)
       Must manually edit 29 skill files
       Time: 2-4 hours
       
Total cost: 3-6 hours of manual work that migration could do in seconds
```

**Prevention strategy:**

**1. Accept the trade-off:**

This architecture makes a conscious trade-off:
- ✅ PRO: Simple, clean deletion after one-time use
- ✅ PRO: No maintenance of migration code
- ❌ CON: Cannot re-run if bugs found
- ❌ CON: Manual fixes required

**Make this trade-off explicit in documentation:**

```markdown
## Phase 1 Architecture: One-Time Migration

**Design decision:** Migration code is deleted after Phase 1 approval.

**Why:**
- Phase 1 is temporary scaffolding (not permanent infrastructure)
- Keeping migration code adds maintenance burden
- Migration is ONE-TIME (templates diverge from .github/ after Phase 1)
- Git history preserves migration code as reference

**Consequence:**
If bugs found after deletion, you CANNOT re-run migration. Options:

1. **Fix manually** (preferred for 1-3 files)
   - Edit template files directly
   - Test thoroughly
   - Fastest for small changes

2. **Write new migration code** (preferred for 5+ files)
   - Reference git history for examples
   - Write focused script for specific fix
   - Delete after use

3. **Live with it** (if non-critical)
   - Document known issue
   - Fix in next major version

**Mitigation:** Make Phase 1 validation EXTREMELY thorough.
```

**2. Git history as reference (not executable):**

```markdown
## If Bugs Found After Deletion

Migration code is in git history. You CAN reference it, but NOT execute it.

### View migration code:
\`\`\`bash
# Find the commit where migration was deleted
git log --all --oneline -- scripts/migrate-to-templates.js

# View the file as it was
git show <commit>:scripts/migrate-to-templates.js
\`\`\`

### Use as reference:
- Copy transformation logic
- Understand what was done
- Write NEW focused script for specific fix

### Do NOT:
- Try to restore and re-run (templates have diverged)
- Assume it will work unchanged
- Skip testing (must test new code)
```

**3. Manual fix procedure:**

```markdown
## Manual Template Fix Procedure

When bugs found after deletion affecting multiple files:

### Step 1: Assess scope
- How many files affected? (1-3 = manual, 5+ = write script)
- What's the pattern? (same fix across all files?)
- Is it critical? (breaks installations vs cosmetic)

### Step 2: Manual fix (1-3 files)
\`\`\`bash
# 1. Edit files directly
vim templates/agents/gsd-executor.md
# Fix frontmatter...

# 2. Validate fix
npm run validate:templates

# 3. Test installation
node bin/install.js /gsd-executor /tmp/test

# 4. Commit fix
git add templates/agents/gsd-executor.md
git commit -m "fix: Correct skill reference format in gsd-executor"
\`\`\`

### Step 3: Write new script (5+ files)
\`\`\`bash
# 1. Create focused script for specific fix
cat > scripts/fix-skill-references.js << 'EOF'
// Fix specific bug: Add leading slash to skill references
const fs = require('fs').promises
const glob = require('glob').sync

async function fixSkillReferences() {
  const agents = glob('templates/agents/*.md')
  
  for (const file of agents) {
    let content = await fs.readFile(file, 'utf-8')
    
    // Fix pattern: skills: gsd-name → skills: /gsd-name
    content = content.replace(
      /^skills:\s+([^/\n][^\n]+)$/gm,
      'skills: /$1'
    )
    
    await fs.writeFile(file, content)
    console.log(\`Fixed: \${file}\`)
  }
}

fixSkillReferences()
EOF

# 2. Run script
node scripts/fix-skill-references.js

# 3. Validate
npm run validate:templates

# 4. Test
node bin/install.js /gsd-executor /tmp/test

# 5. Commit fix
git add templates/
git commit -m "fix: Add leading slash to all skill references"

# 6. Delete script (one-time use)
rm scripts/fix-skill-references.js
git add scripts/
git commit -m "chore: Remove one-time fix script"
\`\`\`

### Step 4: Document the bug
Add to CHANGELOG.md, update validation checklist to catch similar bugs.
```

**4. Improved validation (prevents bugs):**

The BEST mitigation is preventing bugs in Phase 1:

```markdown
## Enhanced Validation Checklist

Add these checks to Phase 1 validation:

### Pattern Checks (catch systematic errors)
- [ ] Check file #1, #15, #30 for pattern consistency
- [ ] If error in file #1, check ALL files for same pattern
- [ ] Don't just check 3 random files (may miss systematic bugs)

### Edge Cases
- [ ] Files with complex frontmatter (multiple skills)
- [ ] Files with special characters in names
- [ ] Files with unusual formatting

### Installation Testing
- [ ] Test install at least 3 skills
- [ ] Test install at least 2 agents
- [ ] Test on clean directory (no existing files)

### Cross-Reference Integrity
- [ ] Every agent skill reference exists as a skill
- [ ] Every tool name is valid for platform
- [ ] Every template variable is correctly formatted
```

**Detection:**
- CANNOT detect after deletion (code is gone)
- Prevention is the ONLY strategy
- Make Phase 1 validation foolproof

**When to write new migration code:**
- Affects 5+ files
- Pattern is clear and repeatable
- Faster than manual editing
- Reference git history for examples

**When to fix manually:**
- Affects 1-3 files
- Quick edit (minutes, not hours)
- Non-repeating change
- Faster than writing script

**Phase mapping:** Phase 2+ (after migration deleted)

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

### �� CRITICAL: Partial Installations Without Rollback

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

**Phase mapping:** Phase 2 (installer implementation)

---

### 🔴 CRITICAL: Path Traversal Vulnerability

**What goes wrong:**
Malicious template names exploit path traversal:
- `../../../.ssh/authorized_keys` overwrites SSH keys
- `~/.bashrc` injects malicious commands
- Absolute paths write outside intended directory

**Why it happens:**
- User input (skill name) used directly in file paths
- No validation of path safety
- No sandboxing of installation directory

**Consequences:**
- Data loss (overwrite system files)
- Security breach (inject malicious code)
- Privilege escalation

**Mitigation strategy:**

```javascript
const path = require('path')

function validateSkillName(name) {
  // Must start with /
  if (!name.startsWith('/')) {
    throw new Error('Skill name must start with /')
  }
  
  // No path traversal
  if (name.includes('..') || name.includes('~')) {
    throw new Error('Invalid characters in skill name')
  }
  
  // Only allowed characters
  if (!/^\/[a-z0-9-]+$/.test(name)) {
    throw new Error('Skill name must match /[a-z0-9-]+')
  }
  
  return true
}

function safeInstallPath(targetDir, skillName) {
  validateSkillName(skillName)
  
  // Resolve to absolute path
  const basePath = path.resolve(targetDir)
  const skillPath = path.join(basePath, skillName)
  
  // Ensure result is within basePath
  if (!skillPath.startsWith(basePath)) {
    throw new Error('Path traversal detected')
  }
  
  return skillPath
}
```

**Detection:**
- Pre-installation validation of all skill names
- Unit tests with malicious inputs

**Implementation checklist:**
- [ ] All skill names validated before use
- [ ] Path construction uses `path.join()`, never string concatenation
- [ ] All paths resolved to absolute before comparison
- [ ] Test suite includes path traversal attempts

**Phase mapping:** Phase 2 (installer implementation)

---

## 2. Template & Migration Risks

### 🟡 HIGH: Manual Template Edits Create Inconsistency

**What goes wrong:**
After Phase 1, developer manually edits `/templates/` files:
- Bug fix in one file, forgot to apply to similar files
- Formatting inconsistency across templates
- One platform updated, others not

**Why it happens:**
- No enforcement of template consistency
- Easy to edit files directly
- No review process for template changes

**Consequences:**
- Template drift between platforms
- Inconsistent user experience
- Bugs in some templates but not others

**Mitigation strategy:**

**1. Document template editing policy:**

```markdown
## TEMPLATES.md

### Source of Truth

After Phase 1 migration, `/templates/` is the source of truth.

### Editing Policy

**For bug fixes affecting 1-3 files:**
- Edit template files directly
- Run validation: `npm run validate:templates`
- Test installation
- Document in CHANGELOG

**For changes affecting 5+ files:**
- Write focused script (reference git history)
- Apply to all affected files
- Validate and test
- Delete script after use

**For new features:**
- Update template structure (may require installer changes)
- Update all relevant templates
- Version bump

### Review Checklist

Before committing template changes:
- [ ] All similar templates updated
- [ ] Validation passes
- [ ] Installation tested
- [ ] Changes documented
```

**2. Linting for templates:**

```javascript
// scripts/lint-templates.js
async function lintTemplates() {
  const errors = []
  
  // Check 1: All skills use same frontmatter fields
  const skills = await loadSkills('templates/skills')
  const requiredFields = ['name', 'description', 'allowed-tools']
  
  for (const skill of skills) {
    for (const field of requiredFields) {
      if (!skill.frontmatter[field]) {
        errors.push(`${skill.file}: Missing required field: ${field}`)
      }
    }
  }
  
  // Check 2: Consistent formatting
  for (const skill of skills) {
    if (!skill.content.startsWith('---\n')) {
      errors.push(`${skill.file}: Frontmatter must start with ---`)
    }
  }
  
  // Report errors
  if (errors.length > 0) {
    console.error('Template lint errors:')
    errors.forEach(err => console.error(`  - ${err}`))
    process.exit(1)
  }
}
```

**Detection:**
- Pre-commit hook runs template linter
- CI validates all templates
- Manual review for multi-file changes

**Phase mapping:** Phase 2+ (ongoing maintenance)

---

## 3. Platform Compatibility Risks

### 🟡 HIGH: Breaking Changes in CLI Frontmatter Specs

**What goes wrong:**
Claude CLI updates frontmatter spec:
- Renames `allowed-tools` to `tools`
- Changes `skills` format
- Adds required new fields

Existing templates break. All 42 files need updates.

**Why it happens:**
- No control over platform spec changes
- Templates reference current spec version
- No automated migration for spec changes

**Consequences:**
- Templates stop working after platform updates
- Emergency fix needed across all templates
- Users experience broken installations

**Mitigation strategy:**

**1. Version detection and warnings:**

```javascript
// bin/install.js
async function checkPlatformCompatibility(platform) {
  const platformVersion = await detectVersion(platform)
  const supportedVersions = {
    'claude': '^1.0.0',
    'copilot': '^2.0.0'
  }
  
  if (!semver.satisfies(platformVersion, supportedVersions[platform])) {
    console.warn(`
      ⚠️  WARNING: Platform version mismatch
      
      Your ${platform} version: ${platformVersion}
      Supported versions: ${supportedVersions[platform]}
      
      Templates may not work correctly.
      Check for updates: npm update get-shit-done-multi
    `)
  }
}
```

**2. Graceful degradation:**

```javascript
// Handle missing/renamed fields
function parseFrontmatter(content, platform) {
  const frontmatter = parseFrontmatterBlock(content)
  
  // Handle field renames
  if (!frontmatter.tools && frontmatter['allowed-tools']) {
    frontmatter.tools = frontmatter['allowed-tools']
  }
  
  // Handle format changes
  if (platform === 'claude' && typeof frontmatter.skills === 'string') {
    frontmatter.skills = frontmatter.skills.split(',').map(s => s.trim())
  }
  
  return frontmatter
}
```

**3. Document supported versions:**

```markdown
## Platform Compatibility

| Platform | Supported Versions | Notes |
|----------|-------------------|-------|
| Claude CLI | 1.0.0 - 1.5.0 | Frontmatter spec v1 |
| GitHub Copilot CLI | 2.0.0 - 2.3.0 | Skill reference format changed in 2.4 |
| Codex CLI | 0.1.0 - 0.2.0 | Beta, spec may change |

**If your platform version is not supported:**
- Check for updates: `npm update get-shit-done-multi`
- Report compatibility issue: GitHub issues
- May need to manually update templates
```

**Detection:**
- Platform version detection at install time
- Warning if version mismatch
- CI tests against multiple platform versions

**Phase mapping:** Phase 3 (multi-platform support)

---

## Summary: Risk Mitigation Priority

### Phase 1 (Migration)
**Top Priority:**
1. Make manual validation foolproof (prevent bad approval)
2. Automated pre-flight checks (catch errors before user review)
3. Clear validation checklist (user knows what to check)

**Accept:**
- Migration code will be deleted (trade-off for simplicity)
- Bugs found later require manual fixes

### Phase 2+ (Post-Migration)
**Top Priority:**
1. Transaction-based installation (prevent partial installs)
2. Path traversal validation (security)
3. Template validation/linting (maintain quality)

**Accept:**
- Manual template editing (no automated pipeline)
- Platform spec changes may break templates

### Key Principle

**Prevention over recovery.** Make Phase 1 validation so thorough that bugs are caught BEFORE deletion, not after.

---

## Sources

- Node.js installer best practices: https://docs.npmjs.com/cli/v9/using-npm/scripts
- Path traversal prevention: OWASP Path Traversal
- Transaction patterns: Database transaction design patterns
- Frontmatter specs: Claude CLI documentation, GitHub Copilot CLI docs
- Manual validation: Code review best practices

