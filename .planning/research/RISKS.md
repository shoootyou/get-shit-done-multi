# Risk Analysis: Template-Based Multi-CLI Installer

**Project:** get-shit-done-multi  
**Researched:** 2025-01-25  
**Domain:** Template-based installer for AI CLI skills and agents  
**Confidence:** HIGH (based on established installer patterns, Node.js ecosystem practices, and security best practices)

---

## Executive Summary

Building a template-based installer that supports multiple AI CLI platforms (Claude, Copilot, Codex, and future platforms) introduces risks across **validation**, **versioning**, **extensibility**, and **security**. This analysis identifies critical and moderate risks with concrete mitigation strategies.

**Key findings:**
- **Critical risk:** Partial installations without rollback can corrupt user environments
- **Critical risk:** Path traversal vulnerabilities can overwrite system files
- **High risk:** Breaking changes in CLI frontmatter specs can break existing templates
- **Moderate risk:** Adding new platforms requires careful abstraction to avoid template pollution

**Architecture recommendation:** Plugin-based adapter pattern with atomic installation transactions.

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

## Implementation Roadmap

### Phase 1: Foundation (P0)
**Goal:** Safe, atomic installation

- [ ] Transaction-based installation
- [ ] Rollback on failure
- [ ] Path validation (block traversal)
- [ ] Pre-flight directory checks
- [ ] Installation markers (`.gsd-meta.json`)

### Phase 2: Validation (P1)
**Goal:** Fail fast with clear errors

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

---

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| Validation patterns | **HIGH** | Standard JSON Schema + YAML parsing (established tools) |
| Transaction/rollback | **HIGH** | Well-known pattern (databases, package managers) |
| Path security | **HIGH** | Standard path traversal prevention techniques |
| Adapter pattern | **HIGH** | Proven extensibility pattern (webpack, babel, etc.) |
| Content analysis | **MEDIUM** | Heuristic-based, can have false positives/negatives |
| Platform spec changes | **MEDIUM** | Can't predict vendor changes, must react |
| Testing isolation | **HIGH** | Standard temp directory + env var patterns |

---

## Open Questions for Phase-Specific Research

1. **What is the exact frontmatter spec for each platform today?**
   - Need to document current state for each CLI
   - Identify what varies between platforms
   - Flag for Phase 1 research

2. **How do Claude/Copilot/Codex handle skill updates?**
   - Do they hot-reload?
   - Require restart?
   - Cache skill definitions?
   - Flag for Phase 1 research

3. **What file permissions do skills need?**
   - Executable bits required?
   - Platform differences?
   - Flag for Phase 1 research

4. **How can we detect CLI platform versions?**
   - Command-line flags?
   - Config files?
   - API endpoints?
   - Flag for Phase 2 research

---

## Sources

**HIGH confidence (established patterns):**
- Transaction pattern: Database systems (PostgreSQL docs), package managers (npm, apt)
- Path validation: OWASP Path Traversal Prevention Cheat Sheet
- JSON Schema: Official JSON Schema specification
- Adapter pattern: Gang of Four Design Patterns

**MEDIUM confidence (inferred from project):**
- CLI frontmatter structure: Based on existing `.claude/skills/` and `.github/skills/` files
- Platform differences: Observed from current multi-platform support
- File structure: Current project layout

**Areas needing validation:**
- Specific platform version detection methods
- Exact frontmatter specifications
- Platform-specific installation requirements
- Skill hot-reloading behavior

---

**Research complete. Ready for roadmap creation.**
