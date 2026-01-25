# Pitfalls Research: Skills Migration

**Domain:** Command/Skill Migration to Standardized Multi-Platform Format
**Researched:** 2025-01-22
**Confidence:** HIGH (based on common migration patterns from npm, pip, RubyGems format migrations; multi-platform packaging systems; and adapter pattern implementations)

## Critical Pitfalls

### Pitfall 1: Incompletely Migrated Command References

**What goes wrong:**
Commands reference each other by name. During migration, some commands use old naming (`gsd:command`) while others use new (`gsd-command`), causing invocation failures. Users see "command not found" errors when one migrated command tries to invoke another.

**Why it happens:**
- Migration happens incrementally, file by file
- Cross-references buried in command descriptions or examples
- Template variables expand differently in old vs new format
- Search-and-replace misses inline code blocks or conditional sections

**How to avoid:**
1. Create mapping table: `gsd:X` → `gsd-X` for all 29 commands BEFORE migration
2. Audit cross-references: `grep -r "gsd:" commands/gsd/ specs/skills/` 
3. Use semantic replacement, not just string replacement (preserve markdown code blocks)
4. Test command invocation chains end-to-end, not just individual commands

**Warning signs:**
- Commands work in isolation but fail when invoked by other commands
- Error messages like "gsd:old-name not found" after migration
- Template expansion differs between platforms (works in Claude, fails in Copilot)

**Phase to address:**
Phase 1 (Pre-migration audit) - Create comprehensive cross-reference map
Phase 2 (Migration execution) - Validate all references updated together

---

### Pitfall 2: Platform-Specific Frontmatter Breaks Installation

**What goes wrong:**
Conditional frontmatter sections (`{{#isClaude}}`, `{{#isCopilot}}`) don't render correctly during installation, causing:
- Missing tool declarations (command thinks it can't use bash/grep)
- Syntax errors in generated skill files
- Platform installs succeed but commands fail at runtime with "tool not available"

**Why it happens:**
- Template engine processes conditionals AFTER platform detection in some cases, BEFORE in others
- install.js adapter logic evaluates conditionals at wrong stage
- Handlebars/Mustache syntax differences between template systems
- Nested conditionals not handled consistently

**How to avoid:**
1. **Explicit template evaluation order:** Document whether install.js should:
   - Evaluate conditionals BEFORE writing to platform directory (recommended)
   - Write raw template then let platform evaluate (dangerous)
2. **Validate generated output:** After installation, parse generated files and verify:
   - No template syntax remains (`{{` should not appear in final files)
   - Tool arrays are valid JSON/YAML for each platform
   - Frontmatter is platform-appropriate
3. **Test installation on all 3 platforms in CI:**
   - Mock install to each platform directory
   - Parse and validate generated frontmatter
   - Attempt to invoke command with platform CLI

**Warning signs:**
- install.js succeeds but commands don't show up in `/help`
- Generated files contain `{{#isClaude}}` literal strings
- Tool declarations empty or malformed in one platform
- Works locally (your dev platform) but breaks on other platforms

**Phase to address:**
Phase 1 (Adapter testing) - Verify template evaluation works for all conditionals
Phase 3 (Multi-platform validation) - Test actual installation on all 3 CLIs

---

### Pitfall 3: Metadata Block Schema Drift

**What goes wrong:**
Metadata blocks in `/specs/skills/` don't match metadata in `/specs/agents/`, or migrate with inconsistent field names:
- `projectVersion` vs `project_version`
- `templateVersion` vs `template_version`  
- Missing required fields for some platforms
- Version strings formatted differently (`1.9.1` vs `v1.9.1`)

This causes:
- Template generation failures
- Installation succeeds but version checking breaks
- Upgrade detection fails (system thinks old version is new)

**Why it happens:**
- Agents and skills evolved separately, no enforced schema
- Copy-paste from different examples
- No validation of metadata during build/install
- Schema documentation outdated or missing

**How to avoid:**
1. **Define canonical metadata schema** in `/specs/README.md`:
   ```yaml
   platform: "claude" | "copilot" | "codex"
   generated: "YYYY-MM-DD"  # ISO 8601 date only
   templateVersion: "X.Y.Z"  # semver without 'v' prefix
   projectVersion: "X.Y.Z"   # semver without 'v' prefix  
   projectName: "get-shit-done"
   ```
2. **JSON Schema validation:** Add to install.js:
   ```javascript
   const Ajv = require('ajv');
   const metadataSchema = require('./schemas/metadata.json');
   validateMetadata(parsedFrontmatter);
   ```
3. **Linting pre-commit hook:** Validate all specs before commit
4. **Template generation validates schema:** Generator should enforce schema

**Warning signs:**
- Different fields in different spec files
- Version comparison logic breaks (`1.9.1 > 1.10.0` = true)
- Template generation works for agents, fails for skills
- Install succeeds but `gsd:verify-installation` reports errors

**Phase to address:**
Phase 1 (Schema definition) - Document and enforce canonical schema
Phase 2 (Migration) - Validate every migrated spec against schema
Phase 4 (Testing) - Integration tests verify metadata consistency

---

### Pitfall 4: Legacy Path Assumptions in Install Logic

**What goes wrong:**
install.js contains hardcoded assumptions about command locations:
- `./commands/gsd/*.md` paths hardcoded
- Glob patterns don't match new folder structure `/specs/skills/gsd-*/`
- Path rewriting logic assumes flat file structure, breaks with nested folders
- Relative imports in commands expect old directory layout

Result: Installation copies files to wrong locations, or skips new specs entirely.

**Why it happens:**
- install.js was built around legacy structure
- Path manipulation uses string replacement instead of proper path joining
- Adapters each implement path logic slightly differently
- No abstraction for "where do specs live"

**How to avoid:**
1. **Extract path configuration to constants:**
   ```javascript
   const PATHS = {
     legacyCommands: './commands/gsd',
     skillSpecs: './specs/skills',
     agentSpecs: './specs/agents'
   };
   ```
2. **Unified glob patterns:**
   ```javascript
   const skillFiles = glob.sync(`${PATHS.skillSpecs}/gsd-*/SKILL.md`);
   ```
3. **Path-aware adapters:** Each adapter should:
   - Accept source path as parameter (don't assume)
   - Use `path.join()` for all path construction
   - Test with both flat and nested structures
4. **Dual-source installation:** Support both legacy and new in parallel:
   ```javascript
   const commands = [
     ...loadLegacyCommands(), // from ./commands/gsd/
     ...loadSkillSpecs()       // from ./specs/skills/
   ];
   ```

**Warning signs:**
- `npx install.js` succeeds but no new commands appear
- Manual file copy works, automated install doesn't
- Works when run from repo root, fails from subdirectory
- Adapter A finds files, adapter B doesn't

**Phase to address:**
Phase 2 (Adapter refactor) - Extract path logic, parameterize sources
Phase 3 (Dual-source testing) - Verify both legacy and new specs install

---

### Pitfall 5: Breaking Changes Disguised as Formatting

**What goes wrong:**
"Just changing format" introduces subtle behavior changes:
- Command descriptions shortened to fit frontmatter constraints
- Tool permissions reduced (legacy had bash, new doesn't declare it)
- Examples removed or relocated, breaking copy-paste workflows
- Command aliases lost in migration

Users upgrade and commands become less capable or harder to use.

**Why it happens:**
- Frontmatter has character limits (description: 150 chars)
- New format seems "cleaner" so content gets trimmed
- Tools must be explicitly declared (legacy had implicit access)
- Focus on structure over preserving functionality

**How to avoid:**
1. **Feature parity checklist for each command:**
   - [ ] All tools from legacy explicitly declared in new
   - [ ] Description captures same information (use full content section if needed)
   - [ ] Examples preserved (in content body if not in frontmatter)
   - [ ] All command aliases/names still work
2. **Behavioral smoke tests:**
   ```bash
   # Test that each command still does what it used to
   for cmd in gsd-*; do
     echo "Testing $cmd..."
     ./$cmd --help > new.txt
     ./legacy-version --help > old.txt
     diff old.txt new.txt || echo "WARNING: $cmd output changed"
   done
   ```
3. **Documentation of intentional changes:** If behavior MUST change:
   - Document in CHANGELOG under "Breaking Changes"
   - Provide migration guide for affected workflows
   - Keep legacy version available during transition

**Warning signs:**
- "Works for me" but users report issues
- Commands succeed but output/behavior differs
- Features "nobody used" are the exact features 10% of users depend on
- GitHub issues: "After upgrade, X stopped working"

**Phase to address:**
Phase 2 (Migration) - Feature parity validation per command
Phase 3 (Testing) - Behavioral regression tests
Phase 5 (Documentation) - Migration guide for any breaking changes

---

### Pitfall 6: Race Conditions in Parallel Installation

**What goes wrong:**
Installing to multiple platforms simultaneously (e.g., `--all` flag) causes:
- File write conflicts (two adapters writing to temp directory)
- Incomplete installations (adapter A overwrites adapter B's work)
- Template cache corruption (shared state between adapters)
- Partial success (Claude installed, Copilot failed, no rollback)

**Why it happens:**
- Adapters share temporary directories/state
- No file locking or atomic operations
- Promises run in parallel without coordination
- Error in one adapter doesn't stop others

**How to avoid:**
1. **Sequential installation by default:**
   ```javascript
   if (hasAll) {
     for (const adapter of [claudeAdapter, copilotAdapter, codexAdapter]) {
       await adapter.install(specs);  // Wait for each
     }
   }
   ```
2. **Isolated working directories per adapter:**
   ```javascript
   const workdir = path.join(os.tmpdir(), `gsd-install-${adapter.name}-${Date.now()}`);
   ```
3. **Transaction-like rollback:**
   ```javascript
   try {
     await adapter.install();
     await adapter.verify();
   } catch (err) {
     await adapter.rollback();  // Remove partial installation
     throw err;
   }
   ```
4. **Explicit parallel opt-in:** If parallelization desired:
   ```bash
   --all --parallel  # User explicitly requests parallel
   ```

**Warning signs:**
- Intermittent installation failures
- "File already exists" errors during install
- One platform works, others don't, pattern varies run-to-run
- Installation logs show overlapping timestamps

**Phase to address:**
Phase 2 (Adapter implementation) - Ensure isolation and sequencing
Phase 3 (Integration testing) - Test `--all` flag specifically

---

### Pitfall 7: Frontmatter Parser Differences Across Platforms

**What goes wrong:**
Each platform (Claude, Copilot, Codex) parses frontmatter differently:
- Claude uses YAML 1.2, Copilot uses YAML 1.1 (different boolean handling)
- String quoting rules differ (description with `:` breaks in one platform)
- Tool array syntax varies (`tools: [A, B]` vs `tools: ["A", "B"]`)
- Conditional blocks supported in Claude, cause syntax errors in Copilot

Result: Same spec file works in one platform, fails in another.

**Why it happens:**
- No universal frontmatter standard
- Each CLI implemented parsing independently
- YAML spec has subtle version differences
- Markdown parsers handle --- delimiters differently

**How to avoid:**
1. **Least common denominator approach:**
   - Always quote strings with special characters: `description: "Deploy: production"`
   - Always use quoted array items: `tools: ["bash", "grep"]`
   - No flow-style YAML (use block style only)
   - Test that YAML parses with multiple parsers
2. **Platform-specific generation:**
   ```javascript
   function generateFrontmatter(spec, platform) {
     const template = platform === 'claude' 
       ? spec.claudeTemplate  // Can use conditionals
       : spec.staticTemplate;  // Pre-rendered, no conditionals
     return renderTemplate(template, { platform });
   }
   ```
3. **Validation during build:**
   ```javascript
   const yaml = require('js-yaml');
   const yamlV1_1 = require('yaml-1.1');  // Multiple parsers
   
   function validateFrontmatter(content) {
     yaml.load(content);      // YAML 1.2
     yamlV1_1.parse(content); // YAML 1.1
     // If both parse, compatible across platforms
   }
   ```
4. **Frontmatter linter:**
   - Detect unquoted strings with `:` or `#`
   - Detect flow-style YAML
   - Detect platform-specific features used in wrong context

**Warning signs:**
- "YAML parsing error" on install for one platform only
- Tool arrays empty after installation
- Descriptions truncated or garbled
- Works in development (Claude) but fails in CI (different parser)

**Phase to address:**
Phase 1 (Standards definition) - Define compatible YAML subset
Phase 2 (Template generation) - Enforce subset in templates
Phase 3 (Validation) - Test with all platform parsers

---

### Pitfall 8: Command Name Collision During Transition

**What goes wrong:**
During migration, both old and new commands exist:
- Legacy: `gsd:help` in `.github/skills/get-shit-done/commands/`
- New: `gsd-help` in `~/.claude/skills/gsd-help/`

Platform sees both, doesn't know which to invoke:
- Copilot prefers legacy (shorter path? alphabetical?)
- Claude prefers new (fresher timestamp?)
- User runs `gsd-help`, gets legacy version, confused why migration didn't work

**Why it happens:**
- No uninstall of legacy before installing new
- Installation adds new without removing old
- Platform command discovery picks first match, not newest
- User has global AND local installations

**How to avoid:**
1. **Detection and warning:**
   ```javascript
   function detectLegacyInstallation(platform) {
     const legacyPaths = [
       '.github/skills/get-shit-done/commands/',
       '.github/copilot/skills/gsd/',
       // ... platform-specific legacy paths
     ];
     return legacyPaths.filter(fs.existsSync);
   }
   
   if (detectLegacyInstallation().length > 0) {
     console.warn('Legacy installation detected. Recommend uninstall first.');
     // Prompt: Continue anyway? [y/N]
   }
   ```
2. **Explicit uninstall step:**
   ```bash
   npx get-shit-done-multi uninstall --legacy
   npx get-shit-done-multi install --all
   ```
3. **Namespace isolation:**
   - New commands use `gsd-v2-command` if coexistence required
   - Or install to different skill name entirely: `gsd-migrated/`
4. **Version detection in commands:**
   ```javascript
   // At runtime, command checks its own version
   const MY_VERSION = '1.9.1';
   if (detectNewerVersion()) {
     console.log('Newer version available at: ...');
   }
   ```

**Warning signs:**
- User reports commands not updated after install
- `which gsd:help` and `which gsd-help` both exist
- Different behavior when run from different directories
- Help output doesn't match installed version

**Phase to address:**
Phase 1 (Migration planning) - Define coexistence strategy or require uninstall
Phase 2 (Installation) - Detect and warn about legacy
Phase 6 (Documentation) - Clear migration guide: uninstall then install

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip frontmatter validation | Faster development | Silent failures in production, hard to debug | Never - validation is fast |
| Hardcode platform detection | Simpler adapter logic | Can't add new platforms, brittle | Only for MVP, refactor in Phase 2 |
| String replacement for command names | Quick migration | Breaks in edge cases (code blocks, URLs) | Never - use AST or semantic parsing |
| Copy-paste adapter logic | Get 3 adapters quickly | Bug fixes must be applied 3 times | Only if refactoring planned in next phase |
| Assume legacy won't change | Don't need compatibility layer | Legacy installation breaks, users stuck | Never - always support downgrade |
| Skip rollback logic | Install is simpler | Failed installs leave broken state | Acceptable for local dev, not for `--global` |
| Generate frontmatter dynamically | More flexible | Runtime errors instead of build-time | Acceptable if validated at generation time |
| Use template inheritance | DRY between platforms | Harder to debug which template applied | Acceptable with good error messages |

## Integration Gotchas

Common mistakes when connecting to platform CLIs.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| Claude Code | Assuming `~/.claude/skills/` is writable | Check permissions, fall back to `--local` |
| GitHub Copilot | Installing to repo root instead of `.github/` | Use `getConfigPaths()` from detect.js |
| Codex CLI | Not handling `--codex-global` vs `--codex-local` | Separate code paths for global vs local |
| All platforms | Writing files before validating paths exist | `fs.mkdirSync(path, { recursive: true })` |
| Template system | Passing raw user input to template | Sanitize variables, escape shell characters |
| Path rewriting | Using `__dirname` instead of `process.cwd()` | Commands run from arbitrary locations |
| Version detection | Parsing package.json at runtime | Inject version at build time as constant |
| Config loading | Searching only current directory | Walk up tree to find `.claude/`, `.github/` |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Re-parsing all specs on every install | Install takes 10+ seconds | Cache parsed specs, only parse changed files | >50 skills |
| Loading all commands into memory | High memory usage during install | Stream processing, load one at a time | >100 commands |
| Synchronous file operations | Install hangs/blocks | Use async fs operations with Promise.all | Any production use |
| Copying files instead of symlinking | Disk space bloat, slow updates | Symlink to source, or use references | >10 installations |
| Regenerating unchanged files | Slow install, unnecessary disk I/O | Hash comparison, skip if unchanged | Every run |
| Global regex replace on large files | CPU spike during migration | Stream-based replacement or AST | Files >10KB |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Executing commands without sanitization | Command injection via skill names | Whitelist allowed characters in names |
| Writing to user-specified paths | Path traversal, overwrite system files | Validate paths are within skill directory |
| Including secrets in skill specs | Secrets committed to git | Lint for API keys, tokens before commit |
| Loading templates from untrusted sources | Arbitrary code execution | Only load templates from bundled sources |
| Not validating metadata fields | XSS if metadata rendered in UI | Sanitize all user-facing fields |
| Symlinks pointing outside skill directory | Escape skill sandbox | Validate symlink targets before creating |
| Running install.js with sudo | Overwrites system files if bug exists | Never require sudo, error if detected |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Silent installation failures | User thinks install succeeded, commands don't work | Always show success/failure explicitly, exit with proper code |
| No progress indication for long installs | User thinks process hung | Show progress: "Installing 15/29 commands..." |
| Error messages without remediation | "Installation failed" - now what? | "Installation failed: X. To fix: Y" |
| Requiring uninstall without tool | User doesn't know how to uninstall | Provide `npx gsd uninstall` command |
| No way to verify installation | User unsure if install worked | Provide `npx gsd verify` command |
| Breaking changes without migration guide | User upgrades, workflows break | Always include migration guide in release |
| Assuming user knows platform installed | "Install failed" but which platform? | "Claude Code install failed" - specific |
| No rollback on failed upgrade | Upgrade fails, old version also broken | Preserve backup, restore on failure |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Frontmatter validation:** Often missing quote escaping rules — verify strings with `:`, `#`, quotes parse correctly
- [ ] **Cross-platform testing:** Often tested on dev platform only — verify on all 3 CLIs (Claude, Copilot, Codex)
- [ ] **Legacy compatibility:** Often assumed but not tested — verify old installations still work after migration
- [ ] **Command invocation chains:** Often tested individually — verify commands that invoke other commands work end-to-end
- [ ] **Error handling in adapters:** Often just happy path — verify behavior on permission errors, disk full, invalid paths
- [ ] **Rollback logic:** Often missing entirely — verify failed install doesn't leave broken state
- [ ] **Version upgrade path:** Often assumes fresh install — verify 1.9.0 → 1.9.1 upgrade works without uninstall
- [ ] **Template variable edge cases:** Often tested with simple strings — verify names with spaces, special chars, unicode
- [ ] **Metadata schema consistency:** Often agents and skills diverge — verify all specs use same schema
- [ ] **Documentation completeness:** Often technical docs only — verify user-facing migration guide exists

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Incomplete command name migration | MEDIUM | 1. Grep all specs for old names<br>2. Create sed script for batch replace<br>3. Test each command invocation<br>4. Release patch version |
| Broken frontmatter on one platform | LOW | 1. Identify problematic YAML construct<br>2. Regenerate with compatible syntax<br>3. Hotfix release for affected platform |
| Metadata schema drift | MEDIUM | 1. Define canonical schema<br>2. Write migration script<br>3. Run on all specs<br>4. Add validation to CI |
| Race condition in parallel install | LOW | 1. Switch to sequential installation<br>2. Add file locking if parallel required<br>3. Document limitation |
| Legacy path assumptions | HIGH | 1. Extract path constants<br>2. Refactor all adapters<br>3. Test with both structures<br>4. Major version bump |
| Breaking changes disguised as formatting | HIGH | 1. Identify affected commands<br>2. Restore lost functionality<br>3. Release as revert + proper migration<br>4. Apologize to users |
| Command name collisions | MEDIUM | 1. Document uninstall process<br>2. Add detection and warning<br>3. Provide cleanup script<br>4. Update install docs |
| Frontmatter parser differences | MEDIUM | 1. Identify compatible YAML subset<br>2. Regenerate all specs<br>3. Add validation step<br>4. Patch release |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Incomplete command name migration | Phase 1: Pre-migration audit | Grep shows no old-style names in new specs |
| Platform-specific frontmatter breaks | Phase 1: Adapter testing | Generated files parse on all platforms |
| Metadata schema drift | Phase 1: Schema definition | All specs validate against JSON schema |
| Legacy path assumptions | Phase 2: Adapter refactor | Install works from any directory |
| Breaking changes disguised as formatting | Phase 2: Feature parity validation | Behavioral tests pass for all commands |
| Race conditions in parallel install | Phase 2: Adapter implementation | `--all` flag completes successfully 10x in a row |
| Frontmatter parser differences | Phase 3: Multi-platform testing | Same spec installs correctly on all 3 CLIs |
| Command name collisions | Phase 1: Migration planning | Detection logic warns when legacy present |

## Sources

**Migration Pattern Research:**
- npm package format migrations (4.x → 5.x, 6.x → 7.x): lockfile format changes, dependency resolution
- Python packaging migrations (setup.py → pyproject.toml): metadata standardization lessons
- RubyGems spec format evolution: backward compatibility strategies
- Cargo manifest changes: semver handling and feature flags

**Multi-Platform Compatibility:**
- Cross-platform CLI tools (Git, Docker): command parity challenges
- Package managers (Homebrew, apt, Chocolatey): install script patterns
- YAML spec differences (YAML 1.1 vs 1.2): parser compatibility issues

**Template System Patterns:**
- Handlebars/Mustache conditional handling: evaluation order matters
- Jekyll/Hugo frontmatter parsing: YAML edge cases
- Terraform provider migrations: schema validation approaches

**Domain-Specific:**
- Project-specific: bin/install.js implementation, specs/agents/ format
- GitHub Copilot CLI documentation: skill format requirements
- Claude Code documentation: slash command specifications
- Real installation failures observed in multi-platform environments

**Confidence Notes:**
- HIGH confidence on platform-specific frontmatter issues (directly observable from project structure)
- HIGH confidence on metadata schema drift (seen in specs/agents/ vs legacy commands)
- HIGH confidence on path assumptions (evident in install.js implementation)
- MEDIUM confidence on exact parser differences (would need to test each platform)
- MEDIUM confidence on race conditions (common pattern, not verified in this specific codebase)

---
*Pitfalls research for: GSD Skills Migration (29 commands, 3 platforms)*
*Researched: 2025-01-22*
*Focus: Command/skill format standardization across Claude Code, GitHub Copilot CLI, and Codex CLI*
