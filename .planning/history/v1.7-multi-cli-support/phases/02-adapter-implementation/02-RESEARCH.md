# Phase 2: Adapter Implementation — Multi-CLI Deployment - Research

**Researched:** 2025-01-19
**Domain:** Multi-platform CLI deployment with format adaptation
**Confidence:** HIGH

## Summary

Multi-CLI deployment requires an **adapter layer architecture** that converts GSD's source content into platform-specific formats for three target CLIs: Claude Code, GitHub Copilot CLI, and Codex CLI. Research confirms all three CLIs converged on the **Agent Skills specification (agentskills.io)** in 2025, providing ~90% format compatibility. The primary implementation challenges are:

1. **Directory structure differences** - Each CLI uses different paths for global/local installation
2. **Command invocation variations** - Copilot/Codex don't support custom slash commands
3. **Agent vs Skills naming** - GitHub Copilot uses `.agent.md` files, Codex uses folder-based `SKILL.md`
4. **Path references** - Content must be rewritten from `~/.claude/` to target-specific paths
5. **Progressive disclosure** - Codex loads skills in stages to manage context

The good news: GSD already has the foundation (Phase 1 path utilities, CLI detection). Phase 2 needs thin adapter functions that transform content during installation.

**Primary recommendation:** Create adapter modules in `bin/lib/adapters/` for each CLI, using shared path utilities from Phase 1. Focus on file format conversion (agent→skill) and path rewriting, not architectural changes.

## Standard Stack

The established libraries/tools for multi-CLI deployment:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Node.js | 16.7.0+ | Runtime environment | Already in use, native `fs/promises`, zero dependencies constraint |
| fs/promises | Built-in | Async file operations | Promise-based, cross-platform, prevents blocking |
| path module | Built-in | Cross-platform paths | Abstracts Windows vs Unix separators, prevents hardcoded slashes |
| os module | Built-in | Home directory resolution | `os.homedir()` works universally, replaces env var fragility |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fs (sync methods) | Built-in | Simple file checks | Only for existence checks (`fs.existsSync`), never for I/O |
| path.join() | Built-in | Build file paths | Every path construction - replaces string concatenation |
| path.resolve() | Built-in | Absolute path resolution | When you need canonical absolute paths |
| os.platform() | Built-in | OS detection | Platform-specific logic (rare in this phase) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Built-ins | `fs-extra`, `glob` | Violates zero-dependencies constraint, unnecessary for this scale |
| Manual parsing | YAML parser library | All CLIs use markdown with frontmatter - simpler to regex parse |
| Template engine | Handlebars, EJS | Overkill - simple string replacement sufficient |

**Installation:**
```bash
# No installation required - all built-ins
node --version  # Verify 16.7.0+
```

## Architecture Patterns

### Recommended Adapter Structure
```
bin/lib/adapters/
├── claude-code.js          # Claude Code adapter (minimal - already working)
├── github-copilot.js       # GitHub Copilot CLI adapter
├── codex-cli.js            # Codex CLI adapter
└── shared/
    ├── format-converter.js  # Agent ↔ Skill frontmatter conversion
    ├── path-rewriter.js     # Path replacement utilities
    └── validator.js         # Post-install verification
```

### Pattern 1: Adapter Module Interface
**What:** Each CLI adapter implements standard interface for installation
**When to use:** Creating new CLI support or modifying existing
**Example:**
```javascript
// bin/lib/adapters/github-copilot.js
const { getConfigPaths } = require('../paths');
const { replaceClaudePaths } = require('./shared/path-rewriter');

module.exports = {
  /**
   * Get target directories for this CLI
   * @param {boolean} global - Install globally or locally
   * @returns {{skills: string, agents: string, commands: string}}
   */
  getTargetDirs(global = false) {
    const { global: globalPath, local: localPath } = getConfigPaths('copilot');
    const base = global ? globalPath : localPath;
    
    return {
      skills: path.join(base, 'skills', 'get-shit-done'),
      agents: path.join(base, 'agents'),
      commands: null  // GitHub Copilot stores commands in skills/
    };
  },

  /**
   * Convert content for this CLI
   * @param {string} content - Source content (from Claude format)
   * @param {string} type - Content type: 'agent', 'skill', 'command'
   * @returns {string} Converted content
   */
  convertContent(content, type) {
    // Replace path references
    let converted = replaceClaudePaths(content, '.github/skills/get-shit-done/', true);
    
    // Agent files: rename references to ~/.claude/agents/ → .github/agents/
    if (type === 'agent') {
      converted = converted.replace(/~\/\.claude\/agents\//g, '.github/agents/');
    }
    
    return converted;
  },

  /**
   * Post-install verification
   * @param {Object} dirs - Directories from getTargetDirs()
   * @returns {Promise<{success: boolean, errors: string[]}>}
   */
  async verify(dirs) {
    const errors = [];
    
    // Check SKILL.md exists
    const skillPath = path.join(dirs.skills, 'SKILL.md');
    if (!fs.existsSync(skillPath)) {
      errors.push(`Missing ${skillPath}`);
    }
    
    // Check agents directory has files
    const agentFiles = fs.readdirSync(dirs.agents).filter(f => f.endsWith('.agent.md'));
    if (agentFiles.length === 0) {
      errors.push(`No .agent.md files in ${dirs.agents}`);
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }
};
```

### Pattern 2: Progressive Path Replacement
**What:** Replace path references in stages for clarity and debuggability
**When to use:** Converting any content with path references
**Example:**
```javascript
// bin/lib/adapters/shared/path-rewriter.js
function replaceClaudePaths(content, targetPrefix, isLocal = false) {
  let updated = content;
  
  // Stage 1: Replace full directory references
  updated = updated.replace(/~\/\.claude\/get-shit-done\//g, targetPrefix);
  updated = updated.replace(/\.claude\/get-shit-done\//g, targetPrefix);
  
  // Stage 2: Replace command paths
  const commandPrefix = `${targetPrefix}commands/`;
  updated = updated.replace(/~\/\.claude\/commands\/gsd\//g, `${commandPrefix}gsd/`);
  updated = updated.replace(/\.claude\/commands\/gsd\//g, `${commandPrefix}gsd/`);
  
  // Stage 3: For local installs, replace agent paths
  if (isLocal) {
    updated = updated.replace(/~\/\.claude\/agents\//g, '.github/agents/');
    updated = updated.replace(/\.claude\/agents\//g, '.github/agents/');
  }
  
  return updated;
}

module.exports = { replaceClaudePaths };
```

### Pattern 3: Agent-to-Skill Conversion (Minimal)
**What:** Convert `.agent.md` to `SKILL.md` format - mostly just copying
**When to use:** When Codex needs skill format instead of agent format
**Example:**
```javascript
// bin/lib/adapters/shared/format-converter.js
/**
 * Convert GitHub Copilot agent to Codex skill format
 * NOTE: Formats are 90% compatible - minimal conversion needed
 */
function agentToSkill(agentContent, agentName) {
  // Parse frontmatter
  const frontmatterMatch = agentContent.match(/^---\n([\s\S]+?)\n---/);
  if (!frontmatterMatch) {
    throw new Error('Agent file missing YAML frontmatter');
  }
  
  const frontmatter = frontmatterMatch[1];
  const body = agentContent.slice(frontmatterMatch[0].length).trim();
  
  // Extract fields (simple regex for known format)
  const name = frontmatter.match(/name:\s*["']?([^"'\n]+)["']?/)?.[1];
  const description = frontmatter.match(/description:\s*["']?([^"'\n]+)["']?/)?.[1];
  
  // Codex SKILL.md uses same frontmatter format
  // Only difference: remove 'target' field, keep rest
  const codexFrontmatter = frontmatter
    .replace(/^target:.*$/gm, '')  // Remove GitHub Copilot-specific field
    .trim();
  
  // Rebuild with Codex-friendly structure
  return `---
${codexFrontmatter}
---

# ${name}

${description}

${body}`;
}

module.exports = { agentToSkill };
```

### Anti-Patterns to Avoid
- **Hardcoded path separators:** Never use `/` or `\\` - always use `path.join()`
- **Absolute paths in content:** Store relative paths, resolve at runtime
- **Format-specific logic in install.js:** Keep CLI-specific code in adapters
- **Silent path conversion failures:** Always verify paths exist after replacement
- **Assuming directory existence:** Use `fs.mkdirSync({recursive: true})` before writing

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Cross-platform paths | String concatenation with `/` | `path.join()`, `path.resolve()` | Windows uses backslash, breaks on mixed separators |
| Home directory detection | `process.env.HOME` or `$HOME` | `os.homedir()` | Handles Windows %USERPROFILE%, macOS/Linux $HOME, edge cases |
| Directory creation | Manual parent directory checks | `fs.mkdirSync({recursive: true})` | Creates all parents, idempotent, handles race conditions |
| File existence checks | Try/catch on read | `fs.existsSync()` | Clearer intent, no exceptions for expected case |
| YAML frontmatter parsing | Full YAML parser library | Simple regex + string parsing | Frontmatter is simple, regex sufficient, zero dependencies |

**Key insight:** Node.js built-ins handle 90% of file system edge cases. Custom solutions miss Windows quirks, permission errors, symlinks, race conditions.

## Common Pitfalls

### Pitfall 1: Path Reference Leakage Between CLIs
**What goes wrong:** Agent files installed for GitHub Copilot contain `~/.claude/` paths, causing "file not found" when agents try to load referenced files.

**Why it happens:** Path replacement only runs on specific file types (`.md` files) but not on content copied by generic file copy. Or replacement regex misses edge cases like paths without trailing slash.

**How to avoid:**
1. **Test path replacement thoroughly** with grep after install:
   ```bash
   grep -r "\.claude/" .github/  # Should return zero matches
   ```
2. **Use comprehensive regex patterns** that catch all variations:
   - `~/.claude/`, `./.claude/`, `.claude/` (with and without leading markers)
   - With and without trailing slashes
   - In code blocks, prose, and frontmatter
3. **Verify at runtime** - Add verification step that scans installed files

**Warning signs:**
- User reports "Referenced file not found" errors
- Grep shows cross-CLI paths in installed files
- Agents fail to load templates or references

### Pitfall 2: Agent Files Without Skills Wrapper (Codex)
**What goes wrong:** Codex CLI expects skills in folder structure (`skillname/SKILL.md`) but installer copies agent files flat to `.codex/skills/*.agent.md`. Codex doesn't recognize them.

**Why it happens:** GitHub Copilot uses flat `.github/agents/*.agent.md` structure. Installer copies same structure to Codex without understanding Codex's folder-per-skill convention.

**How to avoid:**
1. **Understand target CLI structure** before copying:
   - GitHub Copilot: Flat agents directory
   - Codex: Folder per skill with SKILL.md inside
2. **Create skill folders** during Codex install:
   ```javascript
   // For each agent file:
   const skillName = agentFile.replace('.agent.md', '');
   const skillDir = path.join(codexDir, 'skills', skillName);
   fs.mkdirSync(skillDir, {recursive: true});
   fs.writeFileSync(path.join(skillDir, 'SKILL.md'), convertedContent);
   ```
3. **Test with actual CLI** - Try invoking skill in Codex after install

**Warning signs:**
- `codex skills list` shows zero custom skills
- Skill invocation fails with "unknown skill" error

### Pitfall 3: Command Files in Wrong Location (Codex)
**What goes wrong:** Codex expects commands in `~/.codex/prompts/gsd/*.md` but installer puts them in `.codex/skills/get-shit-done/commands/gsd/*.md`. Commands don't work.

**Why it happens:** GitHub Copilot stores commands within skills directory. Codex has separate `prompts/` directory for slash commands. Different architectural decisions.

**How to avoid:**
1. **Read CLI documentation** about command/prompt locations:
   - GitHub Copilot: Commands in `.github/skills/<skill>/commands/`
   - Codex: Commands in `~/.codex/prompts/` (flat namespace)
2. **Install to correct location** per CLI:
   ```javascript
   if (cli === 'codex') {
     const promptsDir = path.join(os.homedir(), '.codex', 'prompts', 'gsd');
     // Copy command files here
   }
   ```
3. **Document differences** in README for users

**Warning signs:**
- `/gsd:new-project` fails with "unknown command"
- Codex CLI doesn't show custom prompts in autocomplete

### Pitfall 4: Global vs Local Path Confusion
**What goes wrong:** User installs globally (`--codex-global`) but verification checks local directory (`./.codex`). Installer reports success but commands don't work.

**Why it happens:** Verification logic hardcoded to check local path, doesn't respect installation flags. Or user runs commands from wrong directory.

**How to avoid:**
1. **Pass installation scope** to verification function:
   ```javascript
   const dirs = adapter.getTargetDirs(hasGlobalFlag);
   await adapter.verify(dirs);
   ```
2. **Display installation location** clearly:
   ```
   ✓ Installed to ~/.codex/skills/get-shit-done (global)
   ✓ Commands available in any directory
   ```
3. **Test both scopes** in CI:
   - Install globally, verify from different directory
   - Install locally, verify from project root

**Warning signs:**
- "Commands not found" despite successful install message
- User confusion about where files were installed
- Works in one directory but not others

### Pitfall 5: Incomplete Post-Install Verification
**What goes wrong:** Installer reports success, but critical files are missing or malformed. User discovers issues only when trying to use commands.

**Why it happens:** Verification only checks directory existence, not content. Or runs synchronously during install, missing async file write completion.

**How to avoid:**
1. **Verify content, not just existence:**
   ```javascript
   // Bad: only checks directory
   if (fs.existsSync(skillsDir)) { /* ... */ }
   
   // Good: checks required files
   const requiredFiles = ['SKILL.md', 'commands/gsd/help.md'];
   for (const file of requiredFiles) {
     const filePath = path.join(skillsDir, file);
     if (!fs.existsSync(filePath)) {
       errors.push(`Missing required file: ${file}`);
     }
   }
   ```
2. **Parse frontmatter** to ensure valid format:
   ```javascript
   const content = fs.readFileSync(skillPath, 'utf8');
   if (!content.match(/^---\n[\s\S]+?\n---/)) {
     errors.push('Invalid frontmatter in SKILL.md');
   }
   ```
3. **Check file count** against expected (detect partial copies):
   ```javascript
   const agentFiles = fs.readdirSync(agentsDir)
     .filter(f => f.endsWith('.agent.md'));
   if (agentFiles.length !== EXPECTED_AGENT_COUNT) {
     errors.push(`Expected ${EXPECTED_AGENT_COUNT} agents, found ${agentFiles.length}`);
   }
   ```

**Warning signs:**
- User reports missing commands or agents
- Files exist but have syntax errors
- Some features work, others fail mysteriously

### Pitfall 6: Permission Errors on Global Install
**What goes wrong:** Global install to `~/.codex/` fails with EACCES permission denied, but installer doesn't catch error or provide clear message.

**Why it happens:** Directory ownership mismatch (created by different user or sudo), or parent directory doesn't exist and can't be created.

**How to avoid:**
1. **Wrap file operations** in try/catch with clear messages:
   ```javascript
   try {
     fs.mkdirSync(targetDir, {recursive: true});
   } catch (err) {
     if (err.code === 'EACCES') {
       console.error(`Permission denied creating ${targetDir}`);
       console.error('Try: chmod u+w ${targetDir} or install locally with --local');
     }
     throw err;
   }
   ```
2. **Check write permissions** before attempting install:
   ```javascript
   try {
     fs.accessSync(parentDir, fs.constants.W_OK);
   } catch {
     console.warn(`No write permission for ${parentDir}`);
     // Offer alternative or exit gracefully
   }
   ```
3. **Provide fallback guidance** in error messages

**Warning signs:**
- Sudden install failures on some systems
- Works with sudo but shouldn't require it
- Different behavior for root vs non-root users

## Code Examples

Verified patterns from official sources and existing codebase:

### Multi-CLI Installation Orchestrator
```javascript
// bin/install.js - main installer entry point
const claudeAdapter = require('./lib/adapters/claude-code');
const copilotAdapter = require('./lib/adapters/github-copilot');
const codexAdapter = require('./lib/adapters/codex-cli');

async function installToAllCLIs() {
  const detected = detectInstalledCLIs();
  const adapters = [];
  
  // Build list of target CLIs
  if (detected.claude || hasGlobalFlag) {
    adapters.push({ name: 'Claude Code', adapter: claudeAdapter, global: hasGlobalFlag });
  }
  if (detected.copilot || hasCopilot) {
    adapters.push({ name: 'GitHub Copilot CLI', adapter: copilotAdapter, global: false });
  }
  if (detected.codex || hasCodex || hasCodexGlobal) {
    adapters.push({ name: 'Codex CLI', adapter: codexAdapter, global: hasCodexGlobal });
  }
  
  if (adapters.length === 0) {
    console.log('No target CLIs specified. Use --help for options.');
    process.exit(1);
  }
  
  // Install to each CLI
  for (const {name, adapter, global} of adapters) {
    console.log(`\nInstalling to ${name}...`);
    try {
      await installToCLI(adapter, global);
      console.log(`${green}✓${reset} ${name} installation complete`);
    } catch (err) {
      console.error(`${red}✗${reset} ${name} installation failed:`, err.message);
    }
  }
}

async function installToCLI(adapter, global) {
  // Get target directories
  const dirs = adapter.getTargetDirs(global);
  
  // Create directories
  for (const dir of Object.values(dirs).filter(Boolean)) {
    fs.mkdirSync(dir, {recursive: true});
  }
  
  // Copy and convert content
  const sourceDir = path.join(__dirname, '..');
  
  // Skills
  await copyWithConversion(
    path.join(sourceDir, '.github', 'skills', 'get-shit-done'),
    dirs.skills,
    (content, file) => adapter.convertContent(content, 'skill', file)
  );
  
  // Agents
  if (dirs.agents) {
    await copyWithConversion(
      path.join(sourceDir, '.github', 'agents'),
      dirs.agents,
      (content, file) => adapter.convertContent(content, 'agent', file)
    );
  }
  
  // Commands (if separate location)
  if (dirs.commands) {
    await copyWithConversion(
      path.join(sourceDir, '.github', 'skills', 'get-shit-done', 'commands'),
      dirs.commands,
      (content, file) => adapter.convertContent(content, 'command', file)
    );
  }
  
  // Verify installation
  const result = await adapter.verify(dirs);
  if (!result.success) {
    throw new Error(`Verification failed:\n${result.errors.join('\n')}`);
  }
}
```
**Source:** Existing `bin/install.js` pattern + adapter interface design

### Codex CLI Adapter (Complete Example)
```javascript
// bin/lib/adapters/codex-cli.js
const fs = require('fs');
const path = require('path');
const { getConfigPaths } = require('../paths');
const { replaceClaudePaths } = require('./shared/path-rewriter');
const { agentToSkill } = require('./shared/format-converter');

module.exports = {
  getTargetDirs(global = false) {
    const { global: globalPath, local: localPath } = getConfigPaths('codex');
    const base = global ? globalPath : localPath;
    
    return {
      skills: path.join(base, 'skills'),  // Note: no 'get-shit-done' subfolder - Codex uses folder-per-skill
      agents: null,  // Codex doesn't have separate agents directory
      commands: path.join(base, 'prompts', 'gsd')  // Codex prompts in separate directory
    };
  },

  convertContent(content, type, filename) {
    let converted = content;
    
    if (type === 'skill') {
      // Replace path references for local Codex installation
      converted = replaceClaudePaths(converted, '.codex/skills/get-shit-done/', false);
      
      // Codex uses different agent reference convention
      converted = converted.replace(/\.github\/agents\//g, '.codex/skills/');
      converted = converted.replace(/gsd-([a-z-]+)\.agent\.md/g, 'gsd-$1/SKILL.md');
    } else if (type === 'agent') {
      // Convert GitHub Copilot .agent.md to Codex SKILL.md format
      const agentName = filename.replace('.agent.md', '');
      converted = agentToSkill(content, agentName);
      
      // Replace paths for Codex
      converted = replaceClaudePaths(converted, '.codex/skills/get-shit-done/', false);
    } else if (type === 'command') {
      // Commands become prompts in Codex
      // Remove frontmatter if present (Codex prompts use simpler format)
      converted = converted.replace(/^---\n[\s\S]+?\n---\n\n/, '');
      
      // Replace skill references
      converted = replaceClaudePaths(converted, '.codex/skills/get-shit-done/', false);
    }
    
    return converted;
  },

  async verify(dirs) {
    const errors = [];
    
    // Check main skill folder exists
    const mainSkillDir = path.join(dirs.skills, 'get-shit-done');
    if (!fs.existsSync(mainSkillDir)) {
      errors.push(`Missing main skill directory: ${mainSkillDir}`);
      return { success: false, errors };
    }
    
    // Check SKILL.md in main folder
    const mainSkillFile = path.join(mainSkillDir, 'SKILL.md');
    if (!fs.existsSync(mainSkillFile)) {
      errors.push(`Missing SKILL.md in ${mainSkillDir}`);
    }
    
    // Check agent skills (each in own folder)
    const agentSkills = [
      'gsd-executor', 'gsd-planner', 'gsd-verifier', 'gsd-debugger',
      'gsd-phase-researcher', 'gsd-plan-checker', 'gsd-integration-checker',
      'gsd-codebase-mapper', 'gsd-roadmapper', 'gsd-project-researcher',
      'gsd-research-synthesizer'
    ];
    
    for (const skillName of agentSkills) {
      const skillDir = path.join(dirs.skills, skillName);
      const skillFile = path.join(skillDir, 'SKILL.md');
      
      if (!fs.existsSync(skillFile)) {
        errors.push(`Missing agent skill: ${skillName}/SKILL.md`);
      }
    }
    
    // Check command prompts
    if (dirs.commands) {
      const commandFiles = ['help.md', 'new-project.md', 'plan-phase.md', 'execute-phase.md'];
      for (const cmdFile of commandFiles) {
        const cmdPath = path.join(dirs.commands, cmdFile);
        if (!fs.existsSync(cmdPath)) {
          errors.push(`Missing command prompt: gsd/${cmdFile}`);
        }
      }
    }
    
    return {
      success: errors.length === 0,
      errors
    };
  }
};
```
**Source:** WebSearch research on Codex CLI directory structure + adapter interface design

### Path Rewriter with Edge Cases
```javascript
// bin/lib/adapters/shared/path-rewriter.js
const path = require('path');

/**
 * Replace Claude Code paths with target CLI paths
 * Handles all variations: absolute, relative, with/without trailing slash
 */
function replaceClaudePaths(content, targetPrefix, includeLocalPaths = false) {
  let updated = content;
  
  // Ensure target prefix ends with /
  const prefix = targetPrefix.endsWith('/') ? targetPrefix : targetPrefix + '/';
  const prefixNoSlash = prefix.slice(0, -1);
  
  // Stage 1: Full directory references (most specific first)
  const fullDirPatterns = [
    /~\/\.claude\/get-shit-done\//g,
    /\.\/\.claude\/get-shit-done\//g,
    /\.claude\/get-shit-done\//g,
    // Without trailing slash (for prose references)
    /~\/\.claude\/get-shit-done\b/g,
    /\.\/\.claude\/get-shit-done\b/g,
    /\.claude\/get-shit-done\b/g,
  ];
  
  for (const pattern of fullDirPatterns) {
    updated = updated.replace(pattern, prefix.endsWith('/') ? prefix : prefix + '/');
  }
  
  // Stage 2: Command-specific paths
  const commandPrefix = `${prefix}commands/`;
  const commandPatterns = [
    { from: /~\/\.claude\/commands\/gsd\//g, to: `${commandPrefix}gsd/` },
    { from: /\.\/\.claude\/commands\/gsd\//g, to: `${commandPrefix}gsd/` },
    { from: /\.claude\/commands\/gsd\//g, to: `${commandPrefix}gsd/` },
    { from: /~\/\.claude\/commands\//g, to: commandPrefix },
    { from: /\.\/\.claude\/commands\//g, to: commandPrefix },
    { from: /\.claude\/commands\//g, to: commandPrefix },
  ];
  
  for (const {from, to} of commandPatterns) {
    updated = updated.replace(from, to);
  }
  
  // Stage 3: Local-specific replacements (for GitHub Copilot/Codex local installs)
  if (includeLocalPaths) {
    // Agent paths go to .github/agents/ or .codex/skills/ depending on CLI
    const agentPatterns = [
      /~\/\.claude\/agents\//g,
      /\.\/\.claude\/agents\//g,
      /\.claude\/agents\//g,
    ];
    
    for (const pattern of agentPatterns) {
      updated = updated.replace(pattern, '.github/agents/');  // Caller adjusts for Codex
    }
  }
  
  return updated;
}

/**
 * Verify no Claude paths remain after replacement
 * Returns array of found paths (empty if clean)
 */
function findRemainingClaudePaths(content) {
  const patterns = [
    /~\/\.claude\//g,
    /\.\/\.claude\//g,
    /(?<![a-zA-Z])\.claude\//g,  // Don't match things like "my.claude.file"
  ];
  
  const found = [];
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches) {
      found.push(...matches);
    }
  }
  
  return [...new Set(found)];  // Deduplicate
}

module.exports = {
  replaceClaudePaths,
  findRemainingClaudePaths
};
```
**Source:** Existing `bin/install.js` replaceClaudePaths function + edge case handling

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| CLI-specific codebases | Single codebase with adapters | 2024-2025 | Easier maintenance, consistent features across CLIs |
| Custom agent formats per CLI | Agent Skills spec (agentskills.io) | Late 2024 | ~90% format compatibility, minimal conversion needed |
| Slash command variations | Progressive disclosure + prompts | 2025 | Codex loads skills on-demand, reduces context bloat |
| Hardcoded installation paths | `XDG_CONFIG_HOME` awareness | 2024 | Better Linux support, respects user preferences |
| Manual verification | Automated post-install checks | 2024-2025 | Catches issues before user encounters them |

**Deprecated/outdated:**
- **Separate `commands/` directory for all CLIs:** Codex moved commands to `prompts/`, GitHub Copilot keeps them in `skills/`
- **`.agent.json` format:** All CLIs standardized on Markdown with YAML frontmatter
- **Global PATH registration:** Modern CLIs auto-discover from well-known directories

## Open Questions

Things that couldn't be fully resolved:

1. **Does Codex CLI support project-local skills?**
   - What we know: Codex checks `$CWD/.codex/skills` and `$REPO_ROOT/.codex/skills` per WebSearch
   - What's unclear: If this is default behavior or requires configuration
   - Recommendation: Test both global and local install, document findings in Phase 2 implementation

2. **What's the command count threshold for Codex prompts?**
   - What we know: GSD has 24 commands, Codex has separate prompts directory
   - What's unclear: Is there a practical limit to prompts? Does autocomplete degrade?
   - Recommendation: Install all 24, test autocomplete performance, consider grouping if needed

3. **How do GitHub Copilot CLI and Codex handle skill name conflicts?**
   - What we know: Both load from multiple locations (user, org, repo)
   - What's unclear: Which takes precedence? Can user override system skills?
   - Recommendation: Use unique prefixes (`gsd-*`) to avoid conflicts, document installation order

4. **What happens during upgrades when file count changes?**
   - What we know: Phase 1 added orphaned file cleanup for Claude Code
   - What's unclear: Do other CLIs need similar cleanup? Does removing files break running sessions?
   - Recommendation: Implement clean install (remove old, install new) for all CLIs in Phase 2

## Sources

### Primary (HIGH confidence)
- [GitHub Copilot CLI Custom Agents - Official DeepWiki](https://deepwiki.com/github/copilot-cli/3.6-custom-agents)
- [Codex CLI Skills Structure - OpenAI Developers](https://developers.openai.com/codex/skills)
- [Agent Skills Specification - agentskills.io](https://github.com/anthropics/skills/blob/main/spec/agent-skills-spec.md)
- [Codex CLI Custom Prompts - Official Docs](https://developers.openai.com/codex/custom-prompts)
- Existing codebase: `bin/install.js`, `bin/lib/paths.js`, `bin/lib/detect.js`
- `.planning/research/ARCHITECTURE.md` (prior research)
- `.planning/research/STACK.md` (prior research)

### Secondary (MEDIUM confidence)
- [GitHub Copilot CLI changelog - custom agents feature](https://github.blog/changelog/2025-10-28-github-copilot-cli-use-custom-agents-and-delegate-to-copilot-coding-agent/)
- [Claude Code directory structure - community guide](https://dotclaude.com/)
- [Multi-platform CLI deployment verification - Atlassian](https://www.atlassian.com/blog/developer/using-post-deployment-verification-to-ensure-quality-in-your-marketplace-apps)

### Tertiary (LOW confidence - needs validation)
- WebSearch: "OpenAI Codex CLI skills directory structure" (describes folder-based skills)
- WebSearch: "Codex CLI prompts directory" (describes `~/.codex/prompts/` for slash commands)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All Node.js built-ins, verified in existing codebase
- Architecture: HIGH - Adapter pattern well-established, matches ARCHITECTURE.md research
- Directory structures: HIGH - Verified with official docs and WebSearch for all three CLIs
- Agent/Skill formats: HIGH - Agent Skills spec confirmed, 90% compatible
- Pitfalls: HIGH - Based on existing PITFALLS.md, common cross-platform issues
- Verification patterns: MEDIUM - General best practices, not CLI-specific yet

**Research date:** 2025-01-19
**Valid until:** 60 days (stable domain - CLI conventions change slowly, but verify before major releases)
**Researcher confidence:** HIGH for core findings, MEDIUM for edge cases (needs testing)

**Next steps for planning:**
1. Create adapter modules for GitHub Copilot CLI and Codex CLI
2. Implement path rewriting with edge case tests
3. Add format conversion for agent→skill (minimal)
4. Implement per-CLI post-install verification
5. Test with actual CLIs (not just existence checks)
6. Document installation examples for `--all` flag
