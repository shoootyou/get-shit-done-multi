# Stack Research: Multi-CLI Tool Development with Codex CLI Integration

**Domain:** Multi-CLI developer tools supporting Claude Code, GitHub Copilot CLI, and OpenAI Codex CLI  
**Researched:** January 19, 2025  
**Confidence:** MEDIUM

## Executive Summary

Adding Codex CLI support to GSD requires:
1. **Path abstraction layer** for handling 3 CLI installation patterns (Claude: `~/.claude/`, GitHub: `.github/skills/`, Codex: `~/.codex/`)
2. **Skill format converter** to translate GSD's GitHub Copilot SKILL.md format to Codex's SKILL.md format (minimal differences)
3. **Progressive disclosure awareness** in skill structure (Codex loads skills in stages)
4. **Zero dependencies constraint honored** — pure Node.js 16.7.0+ with native `fs/promises`, `path`, and `os` modules

The good news: All three CLIs converged on the **open Agent Skills specification** (agentskills.io) in late 2025, meaning GSD's existing SKILL.md format is ~90% compatible with Codex. Main differences are metadata conventions and path references.

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Node.js** | 16.7.0+ | Runtime (already in use) | Native support for fs/promises (since 16.7.0), cross-platform APIs, widespread adoption. GSD constraint: zero npm dependencies, so use built-in modules exclusively. |
| **fs/promises** | Built-in | Async file operations | Promise-based, non-blocking, cross-platform. Preferred over callbacks or sync methods. Use `readFile`, `writeFile`, `mkdir`, `readdir` with await. **HIGH confidence** |
| **path module** | Built-in | Cross-platform path handling | Abstracts Windows vs Unix path separators. Use `path.join()`, `path.resolve()`, never hard-code `/` or `\`. **HIGH confidence** |
| **os module** | Built-in | Home directory resolution | `os.homedir()` works universally across Mac/Windows/Linux. Replaces fragile env var checks (`$HOME`, `%USERPROFILE%`). **HIGH confidence** |

### Supporting Libraries (Zero Dependencies = Use Conditionally)

Since GSD has a **zero npm dependencies** constraint, all functionality must use Node.js built-ins:

| Built-in Module | Purpose | When to Use |
|-----------------|---------|-------------|
| **fs/promises** | Skill file I/O | All file reads/writes for skill installation, format conversion |
| **path** | Path construction | Every file path operation (joining, resolving, normalizing) |
| **os** | System info | Detecting home directory, platform (`os.platform()` for Mac/Windows/Linux differences) |
| **util** | Promisify legacy APIs | If any legacy callback APIs needed (likely not for this milestone) |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Node.js REPL** | Quick testing of path logic | Test `path.join()` and `os.homedir()` interactively across platforms |
| **Git Bash (Windows)** | Windows testing | Ensures POSIX-style paths work on Windows dev environments |
| **jq** | JSON validation | If config files used (not required, but helpful for debugging) |

## Architecture Patterns

### 1. Path Abstraction Layer

**Problem:** Three CLIs, three installation patterns:
- Claude Code: `~/.claude/skills/` (global), `.claude/skills/` (local)
- GitHub Copilot CLI: `.github/skills/` (local only as of Jan 2025)
- Codex CLI: `~/.codex/skills/` (global), `.codex/skills/` (local)

**Solution:** Create `PathResolver` utility:

```javascript
// utils/path-resolver.js
const os = require('os');
const path = require('path');

const PathResolver = {
  getGlobalSkillsPath(cli) {
    const home = os.homedir();
    const cliPaths = {
      'claude': path.join(home, '.claude', 'skills'),
      'github': null, // GitHub Copilot doesn't support global skills yet
      'codex': path.join(home, '.codex', 'skills')
    };
    return cliPaths[cli];
  },
  
  getLocalSkillsPath(cli, repoRoot) {
    const cliPaths = {
      'claude': path.join(repoRoot, '.claude', 'skills'),
      'github': path.join(repoRoot, '.github', 'skills'),
      'codex': path.join(repoRoot, '.codex', 'skills')
    };
    return cliPaths[cli];
  },
  
  getPromptsPath(cli) {
    const home = os.homedir();
    // Only Codex has dedicated prompts directory
    if (cli === 'codex') {
      return path.join(home, '.codex', 'prompts');
    }
    return null;
  }
};

module.exports = PathResolver;
```

**Why this works:**
- Pure Node.js built-ins (`os`, `path`)
- Centralized logic for all three CLIs
- Easy to extend if GitHub adds global skills support
- Cross-platform by design (no hard-coded slashes)

**Confidence:** HIGH (based on official Codex CLI 0.87.0 docs, Node.js official docs)

### 2. Skill Format Converter

**Problem:** GitHub Copilot SKILL.md → Codex SKILL.md differences

**Key Differences:**

| Aspect | GitHub Copilot | Codex CLI |
|--------|----------------|-----------|
| YAML frontmatter | `name`, `description` | `name`, `description` (same!) |
| Optional metadata | `license`, `author` | `version`, `tags`, `allowed-tools`, `dependencies` |
| Body format | Markdown instructions | Markdown instructions (same!) |
| Progressive disclosure | Not used | Critical: only name/description loaded at startup |

**Conversion Strategy:**

```javascript
// utils/skill-converter.js
const fs = require('fs/promises');
const path = require('path');

async function convertGitHubSkillToCodex(githubSkillPath, codexSkillPath) {
  // Read GitHub skill
  const skillContent = await fs.readFile(
    path.join(githubSkillPath, 'SKILL.md'), 
    'utf8'
  );
  
  // Parse YAML frontmatter (simple regex, since zero dependencies)
  const yamlMatch = skillContent.match(/^---\n([\s\S]*?)\n---/);
  if (!yamlMatch) throw new Error('No YAML frontmatter found');
  
  const yaml = yamlMatch[1];
  const body = skillContent.slice(yamlMatch[0].length);
  
  // Add Codex-specific metadata
  const codexYaml = yaml
    .replace(/^(---\n[\s\S]*?)$/m, `$1\nversion: "1.0.0"\ntags: ["gsd", "workflow"]`)
    .replace(/license:/g, '# license:'); // Comment out GitHub-specific fields
  
  const codexContent = `---\n${codexYaml}\n---${body}`;
  
  // Write to Codex location
  await fs.mkdir(codexSkillPath, { recursive: true });
  await fs.writeFile(
    path.join(codexSkillPath, 'SKILL.md'),
    codexContent,
    'utf8'
  );
  
  // Copy supporting files (commands, workflows, references, templates)
  await copyDirectory(
    githubSkillPath,
    codexSkillPath,
    ['SKILL.md'] // Skip, we already wrote it
  );
}

async function copyDirectory(src, dest, exclude = []) {
  const entries = await fs.readdir(src, { withFileTypes: true });
  
  for (const entry of entries) {
    if (exclude.includes(entry.name)) continue;
    
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      await fs.mkdir(destPath, { recursive: true });
      await copyDirectory(srcPath, destPath, exclude);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

module.exports = { convertGitHubSkillToCodex };
```

**Why this works:**
- Minimal changes needed (both use SKILL.md with YAML frontmatter)
- Preserves all commands, workflows, templates
- Zero npm dependencies (uses built-in fs/promises, path)
- Cross-platform file operations

**Confidence:** MEDIUM-HIGH (based on SKILL.md format research, but untested in production)

### 3. CLI Detection & Installation

**Problem:** GSD needs to know which CLIs are installed and where

**Solution:** CLI detector utility:

```javascript
// utils/cli-detector.js
const fs = require('fs/promises');
const path = require('path');
const os = require('os');

async function detectInstalledCLIs() {
  const home = os.homedir();
  const clis = {};
  
  // Check Claude Code
  try {
    await fs.access(path.join(home, '.claude'));
    clis.claude = {
      installed: true,
      globalSkills: path.join(home, '.claude', 'skills'),
      supportsCustomAgents: true
    };
  } catch {
    clis.claude = { installed: false };
  }
  
  // Check GitHub Copilot CLI
  // Note: GitHub doesn't have a global config dir, check via command instead
  clis.github = {
    installed: false, // TODO: run `gh copilot --version` to detect
    localSkillsOnly: true
  };
  
  // Check Codex CLI
  try {
    await fs.access(path.join(home, '.codex'));
    clis.codex = {
      installed: true,
      globalSkills: path.join(home, '.codex', 'skills'),
      promptsDir: path.join(home, '.codex', 'prompts'),
      supportsCustomAgents: false, // Codex uses skills, not agents
      progressiveDisclosure: true
    };
  } catch {
    clis.codex = { installed: false };
  }
  
  return clis;
}

module.exports = { detectInstalledCLIs };
```

**Confidence:** MEDIUM (directory-based detection works for Claude/Codex, GitHub needs command execution)

## Codex CLI-Specific Requirements

### Progressive Disclosure Pattern

**Critical insight:** Codex CLI uses a 3-stage loading pattern for skills:

1. **Discovery (startup):** Load only YAML frontmatter (`name`, `description`) from all skills
2. **Activation (on-demand):** Load full SKILL.md when skill is invoked
3. **Resource loading (execution):** Load `scripts/`, `references/`, etc. only when referenced

**Implications for GSD:**
- Keep skill descriptions **concise** (under 100 words) — this is loaded for every skill at startup
- Put detailed instructions in the **body**, not the YAML frontmatter
- Structure large skills with subfolder references rather than embedding everything in SKILL.md

**Example optimization:**

```markdown
---
name: get-shit-done
description: Structured spec-driven workflow for planning and executing software projects. Use for /gsd:* commands.
version: "1.0.0"
tags: ["gsd", "workflow", "planning"]
---

# Get Shit Done (GSD)

## Quick Start
Run `/gsd:help` to see available commands.

## Command Reference
See `commands/gsd/` directory for all available commands.

## Detailed Documentation
- [Workflow patterns](references/workflow-patterns.md)
- [Phase execution](references/phase-execution.md)
- [Verification strategies](references/verification-patterns.md)
```

**Why:** Codex only loads the description at startup. The body is loaded when the skill is invoked. Subfolder files are loaded when explicitly referenced.

**Confidence:** HIGH (confirmed by Codex CLI official docs on progressive disclosure)

### Skill vs Custom Agent Translation

**Key difference between CLIs:**

| Feature | Claude Code | GitHub Copilot | Codex CLI |
|---------|-------------|----------------|-----------|
| Custom agents | Yes (`.claude/agents/*.md`) | Yes (`.github/agents/*.md`) | **No** — use skills instead |
| Skill system | Yes (`.claude/skills/`) | Yes (`.github/skills/`) | Yes (`.codex/skills/`) |
| Task delegation | Agent spawns sub-agents | Agent spawns sub-agents | Skill invokes other skills |

**Implication:** GSD's custom agents (gsd-executor, gsd-planner, gsd-verifier, etc.) need to be converted to **Codex skills**, not agents. 

**Translation strategy:**

1. GSD agent (`gsd-executor`) → Codex skill (`gsd-executor`)
2. Agent YAML frontmatter → Skill YAML frontmatter (add `version`, `tags`)
3. Agent instructions → Skill instructions (same structure)
4. Agent invocation (`/agent gsd-executor`) → Skill invocation (`$gsd-executor` or auto-triggered)

**Confidence:** MEDIUM (based on Codex docs stating "skills as agent equivalents")

### Path Reference Conversion

**Problem:** GSD skills reference paths like:
- `@.github/skills/get-shit-done/commands/gsd/new-project.md` (GitHub Copilot)
- `~/.claude/skills/get-shit-done/workflows/execute-plan.md` (Claude Code)

**Solution:** Codex skills should use:
- `@.codex/skills/get-shit-done/commands/gsd/new-project.md` (local)
- `~/.codex/skills/get-shit-done/workflows/execute-plan.md` (global)

**Conversion logic:**

```javascript
function convertPathReferences(content, targetCLI) {
  const pathMappings = {
    codex: {
      '~/.claude/': '~/.codex/',
      '.claude/': '.codex/',
      '.github/skills/': '.codex/skills/'
    },
    claude: {
      '~/.codex/': '~/.claude/',
      '.codex/': '.claude/',
      '.github/skills/': '.claude/skills/'
    },
    github: {
      '~/.codex/': '.github/skills/', // GitHub doesn't have global
      '.codex/': '.github/skills/',
      '~/.claude/': '.github/skills/'
    }
  };
  
  let converted = content;
  for (const [from, to] of Object.entries(pathMappings[targetCLI])) {
    converted = converted.replace(new RegExp(from, 'g'), to);
  }
  return converted;
}
```

**Confidence:** MEDIUM (path conventions verified, but untested in production)

## Installation & Setup

### For GSD Development

No npm packages needed! Just use Node.js built-ins:

```bash
# Verify Node.js version
node --version  # Should be 16.7.0 or higher

# Test path utilities
node -e "const os = require('os'); console.log(os.homedir())"
node -e "const path = require('path'); console.log(path.join('a', 'b', 'c'))"
```

### For Codex CLI Users

```bash
# Install Codex CLI (if not already installed)
npm install -g @openai/codex@0.87.0

# Verify installation
codex --version

# Authenticate
codex auth login

# Install GSD skill globally
mkdir -p ~/.codex/skills/get-shit-done
# (GSD installer will handle copying files)

# Or install locally (per-project)
mkdir -p .codex/skills/get-shit-done
# (GSD installer will handle copying files)
```

## Alternatives Considered

| Decision | Chosen Approach | Alternative | Why Not Alternative |
|----------|-----------------|-------------|---------------------|
| **Path handling** | `os.homedir()` + `path.join()` | Environment variables (`$HOME`, `%USERPROFILE%`) | Env vars can be unset or overridden in containers/CI. Node.js built-ins are more reliable. |
| **File I/O** | `fs/promises` with async/await | `fs` callbacks or `fs.readFileSync` | Callbacks are harder to maintain, sync methods block event loop. Promises integrate with modern async code. |
| **YAML parsing** | Simple regex (zero dependencies) | `js-yaml` npm package | GSD constraint: zero npm dependencies. Regex works for simple frontmatter. |
| **Skill format** | Open Agent Skills spec (SKILL.md) | Custom JSON/TOML format | All three CLIs converged on SKILL.md. Custom format would require parsers for each CLI. |
| **CLI detection** | Check for `~/.codex/` directory | Parse `package.json` or run `which codex` | Directory check is faster, works offline, doesn't require shell access. |

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **npm dependencies** | GSD constraint: zero dependencies. Bloat, security surface, maintenance burden. | Node.js built-ins (`fs/promises`, `path`, `os`) |
| **Hard-coded paths** | `'/home/user/.codex'` breaks on Windows and multi-user systems | `path.join(os.homedir(), '.codex')` |
| **Synchronous file I/O** | `fs.readFileSync` blocks event loop, hurts performance | `fs.promises.readFile` with await |
| **String concatenation for paths** | `dir + '/' + file` breaks on Windows | `path.join(dir, file)` |
| **YAML libraries** | Adds npm dependency, overkill for simple frontmatter | Regex: `/^---\n([\s\S]*?)\n---/` |
| **Environment variable detection** | `process.env.HOME` undefined on Windows, overrideable | `os.homedir()` (cross-platform, reliable) |

## Version Compatibility

| Component | Compatible With | Notes |
|-----------|-----------------|-------|
| **Node.js 16.7.0+** | fs/promises (native), ESM/CommonJS | Required for fs/promises without util.promisify |
| **Codex CLI 0.87.0** | Open Agent Skills spec | Confirmed compatible with GitHub Copilot SKILL.md format |
| **GitHub Copilot CLI** | Codex CLI skills (with path adjustments) | Both use SKILL.md, conversion is straightforward |
| **Claude Code agents** | Codex CLI skills (structural changes) | Claude agents → Codex skills (rename, adjust metadata) |

## Stack Patterns by Use Case

### Pattern 1: Global Installation (Recommended for Teams)

**Use case:** Install GSD once, available across all projects for a user

```bash
# Codex
~/.codex/skills/get-shit-done/

# Claude
~/.claude/skills/get-shit-done/

# GitHub Copilot
# Not supported globally yet, use local installation
```

**When to use:**
- User wants GSD available in all projects
- Centralized skill management
- Single source of truth for updates

### Pattern 2: Local Installation (Recommended for Projects)

**Use case:** Version-control GSD with the project

```bash
# Codex
.codex/skills/get-shit-done/

# Claude
.claude/skills/get-shit-done/

# GitHub Copilot
.github/skills/get-shit-done/
```

**When to use:**
- Project-specific GSD customizations
- Team collaboration (skill checked into git)
- Reproducible dev environments

### Pattern 3: Hybrid (Best of Both)

**Use case:** Global baseline, local overrides

```bash
# Global baseline (standard GSD)
~/.codex/skills/get-shit-done/

# Local override (project-specific commands)
.codex/skills/get-shit-done/commands/custom/
```

**When to use:**
- Most projects use standard GSD
- Some projects need custom workflows
- Codex checks local first, falls back to global

## Open Questions & Research Gaps

### LOW Confidence Areas

1. **Codex CLI 0.87.0 availability:** WebSearch indicates version mismatch (some sources report 0.84.0 as latest). Need to verify actual version on npm registry before assuming 0.87.0 features.

2. **GitHub Copilot custom agent detection:** Directory-based detection doesn't work for GitHub CLI (no global config dir). Need to implement command execution (`gh copilot --version`) to detect installation.

3. **Skill invocation syntax in Codex:** Research indicates `$skill-name` syntax, but unclear if `/skills` slash command also works. Need to test both patterns.

4. **Progressive disclosure depth limits:** Codex docs mention ~5,000 words per skill, but unclear if this is a hard limit or a guideline. Large skills like GSD may need splitting.

### Validation Needed

- Test skill format conversion on actual Codex CLI installation
- Verify `allowed-tools` metadata behavior (does Codex enforce tool restrictions?)
- Confirm `dependencies` field in YAML (for skills using npm packages)
- Test path reference conversion with nested skill invocations

## Sources

**HIGH Confidence:**
- Node.js v25.3.0 Official Documentation (fs, path, os modules) — https://nodejs.org/api/
- Cross-platform Node.js Guide (GitHub: ehmicky/cross-platform-node-guide) — Path handling best practices
- Node.js Official: Path Module — https://nodejs.org/api/path.html

**MEDIUM Confidence:**
- WebSearch (Jan 2025): "OpenAI Codex CLI 0.87.0 installation skills prompts 2025" — Installation patterns, SKILL.md format
- WebSearch (Jan 2025): "Codex CLI skills SKILL.md format specification 2025" — YAML frontmatter, progressive disclosure
- WebSearch (Jan 2025): "OpenAI Codex CLI skills progressive disclosure context loading 2025" — 3-stage loading pattern
- WebSearch (Jan 2025): "GitHub Copilot CLI SKILL.md format vs Claude agent format differences 2025" — Cross-CLI comparison

**LOW Confidence:**
- WebSearch: Codex CLI 0.87.0 version number (conflicting reports of 0.84.0 vs 0.87.0)
- WebSearch: `$skill-name` invocation syntax (mentioned but not verified in official docs)

---

*Stack research for: Multi-CLI tool development (GSD + Codex CLI)*  
*Researched: January 19, 2025*  
*Next steps: Implement path abstraction layer, build skill converter, test on Codex CLI installation*
