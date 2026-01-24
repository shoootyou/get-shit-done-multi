# Current Installation Architecture

**Project:** GSD Installation CLI Optimization (v1.9.2)  
**Researched:** 2024-12-19  
**Confidence:** HIGH

## Executive Summary

The current GSD installation system is a monolithic `bin/install.js` (1612 lines) that handles three CLI platforms (Claude, Copilot, Codex) with adapter-based architecture. The system uses boolean flags (`--local`, `--global`, `--copilot`, `--codex`, `--codex-global`, `--all`) to control installation mode and platform selection. Messages are inline and verbose, with platform notes shown unconditionally. No uninstall script exists - manual deletion documented.

**Key architectural strengths:**
- Clean adapter pattern for platform differences
- Template generation system for cross-platform content
- Verification step after installation

**Key refactoring opportunities:**
- Extract routing logic to separate module
- Create message manager for contextual output
- Build platform selector (interactive + flag-based)
- Separate installation orchestration from platform operations

---

## Installation System Architecture

### 1. Entry Point Flow

```
bin/install.js (1612 lines)
│
├─ Parse command-line args (lines 39-90)
│  ├─ --global / -g / --local / -l (Claude)
│  ├─ --copilot / --github-copilot / --copilot-cli
│  ├─ --codex / --codex-cli / --codex-global
│  ├─ --all / -A (multi-platform)
│  ├─ --config-dir / -c (Claude custom path)
│  ├─ --project-dir (Copilot/Codex custom path)
│  ├─ --help / -h
│  └─ --force-statusline
│
├─ Run async initialization (lines 151-204)
│  ├─ Migration check (upgrading from old versions)
│  ├─ CLI detection (which CLIs are installed)
│  └─ Display recommendations
│
├─ Route to installation function (lines 1562-1608)
│  ├─ --all → installAll()
│  ├─ --copilot → installCopilot()
│  ├─ --codex → installCodex(false)
│  ├─ --codex-global → installCodex(true)
│  ├─ --global → install(true)
│  ├─ --local → install(false)
│  └─ no flags → promptLocation() (interactive)
│
└─ Platform-specific installation
   ├─ install(isGlobal) - Claude Code
   ├─ installCopilot(projectDir) - GitHub Copilot CLI
   ├─ installCodex(isGlobal) - Codex CLI
   └─ installAll() - Multi-platform batch
```

### 2. Flag Processing Logic

**Location:** Lines 39-90 (parsing), 1562-1608 (routing)

**Current flags:**
```javascript
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasCopilot = args.includes('--copilot') || args.includes('--github-copilot') || args.includes('--copilot-cli');
const hasCodex = args.includes('--codex') || args.includes('--codex-cli');
const hasCodexGlobal = args.includes('--codex-global');
const hasAll = args.includes('--all') || args.includes('-A');
```

**Mutual exclusion checks:** Lines 1563-1586
- `--global` and `--local` cannot coexist
- `--codex` and `--codex-global` cannot coexist
- `--copilot` cannot combine with `--global`/`--local`
- `--codex` flags cannot combine with `--global`/`--local`
- `--copilot` and `--codex` cannot combine
- `--config-dir` cannot combine with `--copilot`/`--codex`/`--local`

**Problems with current approach:**
1. **Platform-scope conflation:** `--local`/`--global` implies Claude (not explicit)
2. **No multi-platform support:** Cannot do `--copilot --claude` in one command
3. **Rigid mutual exclusion:** Cannot install Copilot locally + Claude globally
4. **Flag proliferation:** Special `--codex-global` flag instead of reusing `--global`

### 3. Platform Adapter Interface

**Location:** `bin/lib/adapters/{claude,copilot,codex}.js`

Each adapter implements:

```javascript
/**
 * Platform Adapter Interface
 * All three adapters (claude, copilot, codex) implement this contract
 */
{
  /**
   * Get target installation directories
   * @param {boolean} isGlobal - Global vs local installation
   * @param {string} [projectDir] - Project directory override (optional)
   * @returns {Object} { skills, agents, gsd, commands }
   */
  getTargetDirs(isGlobal, projectDir),
  
  /**
   * Convert content for platform-specific format
   * @param {string} content - Source content (Claude format)
   * @param {string} type - Content type: 'skill' | 'agent' | 'command'
   * @returns {string} Converted content
   */
  convertContent(content, type),
  
  /**
   * Verify installation success
   * @param {Object} dirs - Target directories from getTargetDirs()
   * @returns {Object} { success: boolean, errors: string[] }
   */
  verify(dirs),
  
  /**
   * Invoke an agent (not used in installation, runtime feature)
   * @param {Object} agent - Agent metadata
   * @param {string} prompt - Prompt text
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Invocation result
   */
  invokeAgent(agent, prompt, options)
}
```

#### Platform-Specific Differences

**Claude Adapter (`claude.js`):**
- Global: `~/Library/Application Support/Claude` (macOS)
- Local: `./.claude`
- Structure:
  - `skills/` - Individual skill folders
  - `agents/` - Agent files (`.md` not `.agent.md`)
  - `get-shit-done/` - Workflows, templates, references
  - `hooks/` - Statusline, update checker
- Content conversion: None (source format)
- Settings: `settings.json` for statusline, hooks

**Copilot Adapter (`copilot.js`):**
- Global: `~/.copilot` (NOT USED - Copilot is local-only)
- Local: `./.github`
- Structure:
  - `skills/get-shit-done/` - Main skill directory
  - `skills/{gsd-*}/` - Individual skill folders
  - `agents/` - Agent files (`.agent.md`)
  - `get-shit-done/` - Workflows, templates, references
  - `ISSUE_TEMPLATE/` - GitHub issue templates
  - `copilot-instructions.md` - Instructions file
- Content conversion: Path rewrite (Claude → `.github/skills/get-shit-done/`)
- No settings file

**Codex Adapter (`codex.js`):**
- Global: `~/.codex`
- Local: `./.codex`
- Structure:
  - `skills/get-shit-done/` - Main skill (SKILL.md, CHANGELOG, VERSION only)
  - `skills/get-shit-done/agents/` - Agents nested in skill directory
  - `get-shit-done/` - Workflows, templates, references (separate)
- Content conversion: 
  - Path rewrite (Claude → `.codex/skills/get-shit-done/`)
  - Command syntax (`/gsd-*` → `$get-shit-done *`)
  - Agent format conversion (`.agent.md` → `SKILL.md`)
  - CLI references (Claude Code → Codex CLI)
- No settings file

### 4. Installation Functions

#### Claude Installation: `install(isGlobal)` (Lines 623-886)

**Steps:**
1. Get target directories from adapter
2. Preserve user data (backup before upgrade)
3. Clean up orphaned files from old versions
4. Copy `get-shit-done/` resources (workflows, templates, references)
5. Generate agents from `specs/agents/` using template system
6. Generate skills from `specs/skills/` using template system
7. Copy static agents (fallback if not in specs)
8. Generate `SKILL.md` from template
9. Copy `CHANGELOG.md` and write `VERSION` file
10. Copy hooks (statusline, update checker)
11. Verify installation
12. Configure `settings.json` (statusline, hooks)
13. Restore user data (from backup)
14. Return settings for `finishInstall()`

**Key operations:**
- Template generation via `generateAgent()` and `generateSkillsFromSpecs()`
- Path replacement for platform-specific references
- Hook registration in `settings.json`
- Cleanup of orphaned files from previous versions

#### Copilot Installation: `installCopilot(projectDir)` (Lines 891-1066)

**Steps:**
1. Get target directories (always local)
2. Preserve user data
3. Copy `get-shit-done/` resources
4. Generate `SKILL.md` from template
5. Copy `CHANGELOG.md` and `VERSION`
6. Generate agents with `.agent.md` extension
7. Generate skills from specs
8. Install `copilot-instructions.md` (skip if exists)
9. Install GitHub issue templates
10. Verify installation
11. Restore user data

**Differences from Claude:**
- No hooks or settings file
- Agents use `.agent.md` extension (renamed after generation)
- Issue templates copied to `.github/ISSUE_TEMPLATE/`
- `copilot-instructions.md` conditionally installed

#### Codex Installation: `installCodex(isGlobal)` (Lines 1071-1275)

**Steps:**
1. Get target directories from adapter
2. Preserve user data
3. Copy `get-shit-done/` resources to `.codex/get-shit-done/`
4. Generate `SKILL.md` to `.codex/skills/get-shit-done/`
5. Copy `CHANGELOG.md` and `VERSION`
6. Generate skills from specs (nested structure)
7. Generate agents to `.codex/skills/get-shit-done/agents/`
8. Verify installation
9. Restore user data

**Differences from others:**
- Agents nested in `skills/get-shit-done/agents/`
- Agent format converted to skill format
- Command syntax transformed (`/gsd-*` → `$get-shit-done *`)
- CLI references transformed (Claude Code → Codex CLI)

#### Multi-Platform Installation: `installAll()` (Lines 1300-1423)

**Steps:**
1. Detect installed CLIs
2. Exit if no CLIs detected
3. For each detected CLI:
   - Claude: `install(true)` then `finishInstall()` (skip statusline prompts)
   - Copilot: `installCopilot()`
   - Codex: `installCodex(true)`
4. Capture verification results
5. Display summary table

**Batch mode characteristics:**
- Always global for Claude/Codex
- Non-interactive (skips statusline prompts)
- Continues on failure (doesn't exit immediately)
- Summary report at end

---

## Template Generation System

### Overview

**Location:** `bin/lib/template-system/`

The template system transforms spec files into platform-specific agents/skills.

**Pipeline:**
```
Spec file (.md with YAML frontmatter)
  ↓
parseSpec() - Extract frontmatter + body
  ↓
buildContext() - Platform-specific variables
  ↓
mapTools() - Transform tool names for platform
  ↓
render() - Replace {{variables}} in content
  ↓
transformFields() - Platform-specific field adjustments
  ↓
validate() - YAML structure validation
  ↓
Platform-specific agent/skill
```

### Context Variables

**From `context-builder.js`:**
```javascript
{
  cmdPrefix: '/gsd-' | '/gsd-' | '$gsd-',  // Command prefix per platform
  gsdPath: '~/.claude/get-shit-done/' | '.github/skills/get-shit-done/' | '.codex/skills/get-shit-done/',
  agentsPath: '~/.claude/agents/' | '.github/agents/' | '.codex/skills/get-shit-done/agents/',
  // ... more platform-specific paths
}
```

These variables are replaced during `render()` step.

### Tool Mapping

**From `tool-mapper.js`:**

Maps generic tool names to platform-specific equivalents:
- Claude: `read, write, bash, ...`
- Copilot: `read_file, write_file, run_terminal_command, ...`
- Codex: Similar to Copilot

**Example:**
```markdown
tools: [read, write, bash]  # Spec format

# After transformation:
# Claude:  tools: read, write, bash
# Copilot: tools: [read_file, write_file, run_terminal_command]
```

---

## Message/Logging System

### Current Approach

Messages are **inline** throughout `install.js`:

```javascript
console.log(`  ${green}✓${reset} Installed agents`);
console.log(`  ${yellow}⚠${reset} Skills: ${genResult.generated} generated, ${genResult.failed} failed`);
console.error(`  ${yellow}✗${reset} Failed to install ${description}: directory not created`);
```

### Message Categories

**Success messages:** (green checkmark)
- "✓ Installed get-shit-done resources (workflows, templates, references)"
- "✓ Generated 12 agents from specs"
- "✓ Skills: 8 generated at .claude/skills"

**Warning messages:** (yellow warning)
- "⚠ Statusline already configured in settings.json"
- "⚠ Skills: 8 generated, 1 failed"
- "⚠ Installation verification warnings:"

**Error messages:** (red X or yellow X)
- "✗ Failed to install agents: directory not created"
- "Installation incomplete! Failed: agents, skills"

**Info messages:** (cyan)
- "Installing to ~/.claude"
- "━━━ Claude Code ━━━"

**Dim/muted messages:** (gray)
- "✓ Verified: 8 skill files, 12 agents"
- "Note: macOS: Using ~/Library/Application Support/Claude for Claude Code"
- "Verify with: ls .github/skills"

### Platform Notes (Lines 199-202)

**Source:** `bin/lib/cli-detection/recommender.js` (`getRecommendations()`)

```javascript
// Platform-specific notes (only show if relevant to CLIs being installed)
const platformNotes = [];

if (platform === 'win32') {
  platformNotes.push('Windows: Paths differ on Windows - installer handles this automatically');
} else if (platform === 'darwin' && installingCLIs.includes('claude')) {
  // Only show Claude path note if Claude is BEING INSTALLED
  platformNotes.push('macOS: Using ~/Library/Application Support/Claude for Claude Code');
} else if (platform === 'linux') {
  platformNotes.push('Linux: XDG Base Directory support for config paths');
}
```

**Problem:** These notes are **contextual** (only relevant when installing specific platform), but displayed unconditionally if any CLI is being installed. The BRIEF flags this as "noise" to remove.

**Display location:**
```javascript
// Lines 199-202
if (recommendations.platformNotes.length > 0) {
  console.log(`\n  ${dim}Note: ${recommendations.platformNotes.join(', ')}${reset}`);
}
```

### Verbosity Control

**None currently exists.** All messages are shown unconditionally.

**Potential levels:**
- Quiet: Only errors
- Normal: Success/warnings/errors (default)
- Verbose: All messages including verification details

---

## CLI Detection System

**Location:** `bin/lib/cli-detection/`

### Detection Logic (`detect.js`)

**`detectInstalledCLIs()`:**
```javascript
// Checks for existence of global config directories
{
  claude: fs.existsSync('~/Library/Application Support/Claude'),
  copilot: fs.existsSync('~/.copilot'),
  codex: fs.existsSync('~/.codex')
}
```

**Limitation:** Only detects **global** installations. Doesn't detect local (`.claude`, `.github`, `.codex` in current project).

**`detectCLI()`:** (runtime detection - not used during installation)
- Checks environment variables
- Checks current working directory
- Defaults to Claude Code

### Recommendation Engine (`recommender.js`)

**`getRecommendations()`:**
- Takes detected CLIs, platform, use case
- Returns installed/available lists
- Provides contextual recommendation
- Generates platform notes

**Used during installation startup** (lines 170-204) to show CLI status before user chooses installation mode.

---

## Path Management

**Location:** `bin/lib/paths.js`

### `getConfigPaths(cli, projectDir)`

Returns global and local paths for each CLI:

```javascript
{
  claude: {
    global: '~/Library/Application Support/Claude',  // macOS
    local: './.claude'
  },
  copilot: {
    global: '~/.copilot',  // NOT USED
    local: './.github'
  },
  codex: {
    global: '~/.codex',
    local: './.codex'
  }
}
```

**Platform handling:**
- Currently hardcoded for macOS (`~/Library/Application Support/Claude`)
- Windows/Linux paths would differ (not currently handled)
- Path expansion handled by `expandTilde()` utility

---

## Uninstallation System

**Current state:** No uninstall script exists.

**Documentation:**
- `docs/troubleshooting.md`: "npm uninstall -g get-shit-done-multi"
- `docs/github-copilot-cli.md`: "Remove `.github/skills/get-shit-done` and any `gsd-*.agent.md` files"

**Manual uninstall process:**

**Claude:**
```bash
# Global
rm -rf ~/Library/Application\ Support/Claude/skills/get-shit-done
rm -rf ~/Library/Application\ Support/Claude/agents/gsd-*
rm -rf ~/Library/Application\ Support/Claude/get-shit-done
rm -rf ~/Library/Application\ Support/Claude/hooks/gsd-*
# Remove hooks from settings.json manually

# Local
rm -rf ./.claude/skills/get-shit-done
rm -rf ./.claude/agents/gsd-*
rm -rf ./.claude/get-shit-done
rm -rf ./.claude/hooks/gsd-*
```

**Copilot:**
```bash
rm -rf ./.github/skills/get-shit-done
rm -rf ./.github/skills/gsd-*
rm -rf ./.github/agents/gsd-*.agent.md
rm -rf ./.github/get-shit-done
rm -rf ./.github/ISSUE_TEMPLATE/gsd-*
# Optionally remove copilot-instructions.md if no other content
```

**Codex:**
```bash
# Global
rm -rf ~/.codex/skills/get-shit-done
rm -rf ~/.codex/get-shit-done

# Local
rm -rf ./.codex/skills/get-shit-done
rm -rf ./.codex/get-shit-done
```

**What uninstall should detect:**
- Which platforms have GSD installed (check for `gsd-*` files)
- User data to preserve (custom agents, config overrides)
- Hooks to remove from settings.json (Claude only)

---

## Entry Points and Invocation

### NPM Package Configuration

**`package.json`:**
```json
{
  "bin": {
    "get-shit-done-multi": "bin/install.js"
  },
  "scripts": {
    "install:copilot": "node bin/install.js --copilot",
    "install:claude": "node bin/install.js --local",
    "install:codex": "node bin/install.js --codex"
  }
}
```

### User Invocation Methods

**NPX (most common):**
```bash
npx get-shit-done-multi --all
npx get-shit-done-multi --global
npx get-shit-done-multi --copilot
```

**NPM script (from package.json):**
```bash
npm run install:copilot
npm run install:claude
npm run install:codex
```

**Direct execution (development):**
```bash
node bin/install.js --local
node bin/install.js --all
```

### Postinstall Hooks

**None currently.** Installation is explicit (user runs npx command).

**Migration system** runs automatically at start of install.js (lines 151-160) to upgrade from old file structures.

---

## Interactive Mode

**Location:** `promptLocation()` function (lines 1485-1560)

### Flow

1. **TTY check:** If not interactive terminal, default to global install
2. **Display menu:**
   ```
   1) Global (~/.claude) - Accessible from all projects
   2) Local (./.claude) - This project only
   3) GitHub Copilot CLI (./.github) - Copilot integration
   4) Codex CLI local (./.codex) - Codex integration
   5) Codex CLI global (~/.codex) - Codex across projects
   ```
3. **Wait for user input** (readline interface)
4. **Route to appropriate install function**

### Limitations

- **No multi-select:** User can only pick one platform
- **No "all" option in menu:** Must use `--all` flag
- **Separate from flags:** Interactive mode only if no flags provided
- **No local/global choice for multi-platform:** Menu forces platform + scope together

---

## Refactoring Opportunities

### 1. Routing Layer Extraction

**Current state:** 100+ lines of nested if/else (lines 1562-1608)

**Proposed:**
```javascript
// bin/lib/routing/command-router.js

class CommandRouter {
  constructor(flags, adapters) {
    this.flags = flags;
    this.adapters = adapters;
  }
  
  /**
   * Parse flags and return installation plan
   * @returns {InstallationPlan} { platforms: [{platform, scope}], errors: [] }
   */
  parseFlags() {
    // Parse --claude --local --copilot --global
    // Return: [
    //   { platform: 'claude', scope: 'local' },
    //   { platform: 'copilot', scope: 'local' }
    // ]
  }
  
  /**
   * Validate installation plan (mutual exclusions, conflicts)
   */
  validate(plan) { }
  
  /**
   * Execute installation plan
   */
  execute(plan) { }
}
```

### 2. Message Management

**Current state:** Inline console.log/error throughout

**Proposed:**
```javascript
// bin/lib/messaging/message-manager.js

class MessageManager {
  constructor(verbosity = 'normal') {
    this.verbosity = verbosity;  // 'quiet' | 'normal' | 'verbose'
  }
  
  success(message, { verbose = false } = {}) {
    if (this.verbosity === 'quiet') return;
    if (verbose && this.verbosity !== 'verbose') return;
    console.log(`  ${green}✓${reset} ${message}`);
  }
  
  warning(message) { }
  error(message) { }
  info(message, { showWhen = [] } = {}) {
    // showWhen: ['claude', 'copilot'] - only show for these platforms
  }
}
```

**Usage:**
```javascript
const msg = new MessageManager(process.env.GSD_VERBOSITY || 'normal');

msg.success('Installed agents');
msg.info('Using ~/Library/Application Support/Claude', { showWhen: ['claude'] });
```

### 3. Platform Selector

**Current state:** Interactive menu and flag parsing separate

**Proposed:**
```javascript
// bin/lib/selection/platform-selector.js

class PlatformSelector {
  /**
   * Interactive multi-select menu
   * @returns {Promise<PlatformSelection[]>}
   */
  async promptInteractive() {
    // Use prompts library (already in dependencies)
    // Checkbox for platforms
    // Then radio for scope (local/global)
    return [
      { platform: 'claude', scope: 'local' },
      { platform: 'copilot', scope: 'local' }
    ];
  }
  
  /**
   * Parse flags into selection
   */
  fromFlags(flags) {
    // --claude --local --copilot
    // Returns same structure as promptInteractive
  }
}
```

### 4. Installation Orchestrator

**Current state:** Logic mixed with CLI routing

**Proposed:**
```javascript
// bin/lib/orchestration/installer.js

class Installer {
  constructor(adapters, messageManager) {
    this.adapters = adapters;
    this.msg = messageManager;
  }
  
  /**
   * Install single platform
   */
  async installPlatform(platform, scope, options) {
    const adapter = this.adapters[platform];
    const dirs = adapter.getTargetDirs(scope === 'global');
    
    // Unified installation flow for all platforms
    await this.preserveUserData(dirs);
    await this.copyResources(dirs, adapter, platform);
    await this.generateContent(dirs, adapter, platform);
    await this.verify(dirs, adapter);
    await this.restoreUserData(dirs);
    
    return { success: true, dirs };
  }
  
  /**
   * Install multiple platforms (batch mode)
   */
  async installMultiple(selections) {
    const results = [];
    for (const { platform, scope } of selections) {
      results.push(await this.installPlatform(platform, scope));
    }
    return results;
  }
}
```

### 5. Settings Manager (Claude-specific)

**Current state:** Settings.json manipulation inline

**Proposed:**
```javascript
// bin/lib/settings/settings-manager.js

class SettingsManager {
  constructor(settingsPath) {
    this.path = settingsPath;
    this.settings = this.read();
  }
  
  read() { }
  write() { }
  
  configureHook(event, command) { }
  configureStatusline(command) { }
  cleanupOrphanedHooks() { }
  hasExistingStatusline() { }
}
```

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      bin/install.js                         │
│                     (Entry Point - 1612 lines)              │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│ CLI Argument │          │   Migration  │
│   Parsing    │          │   System     │
└──────┬───────┘          └──────┬───────┘
       │                         │
       │  ┌──────────────────────┘
       │  │
       ▼  ▼
┌──────────────────────┐
│   CLI Detection      │
│   & Recommendation   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Routing Logic      │
│   (if/else tree)     │
└──────┬───────────────┘
       │
       ├─── --all ──────────────────┐
       ├─── --copilot ──────────┐   │
       ├─── --codex ────────┐   │   │
       └─── --local/global ─┤   │   │
                            │   │   │
       ┌────────────────────┼───┼───┘
       │                    │   │
       ▼                    ▼   ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   install()  │   │installCopilot│   │ installAll() │
│   (Claude)   │   │installCodex()│   │ (Multi-CLI)  │
└──────┬───────┘   └──────┬───────┘   └──────┬───────┘
       │                  │                   │
       │                  │                   │ (loops platforms)
       └──────────────────┴───────────────────┘
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │ Platform Adapter │    │ Template System  │
    │   getTargetDirs  │    │  generateAgent   │
    │   convertContent │    │  generateSkill   │
    │   verify         │    │  render          │
    └──────────────────┘    └──────────────────┘
              │                       │
              ▼                       ▼
    ┌──────────────────┐    ┌──────────────────┐
    │  File System     │    │  Path Utilities  │
    │  Operations      │    │  getConfigPaths  │
    │  copy/mkdir      │    │  expandTilde     │
    └──────────────────┘    └──────────────────┘
```

---

## Data Flow: Installation Process

```
User invokes:
  npx get-shit-done-multi --claude --local --copilot

     ↓

Parse flags:
  hasGlobal=false, hasLocal=true, hasCopilot=true

     ↓

Detect CLIs:
  { claude: true, copilot: true, codex: false }

     ↓

Validate flags:
  ERROR: Cannot combine --copilot with --local
  (Line 1569-1571)

     ↓

Exit with error message
```

**Problem:** User wanted "Claude locally + Copilot locally" but current flag system interprets `--local` as Claude-only.

---

## Key Files and Their Roles

| File | Lines | Purpose | Used By |
|------|-------|---------|---------|
| `bin/install.js` | 1612 | Main entry point, all installation logic | User (npx) |
| `bin/lib/adapters/claude.js` | 148 | Claude-specific installation logic | install() |
| `bin/lib/adapters/copilot.js` | 151 | Copilot-specific installation logic | installCopilot() |
| `bin/lib/adapters/codex.js` | 206 | Codex-specific installation logic | installCodex() |
| `bin/lib/paths.js` | 80 | Path utilities for all platforms | All adapters |
| `bin/lib/cli-detection/detect.js` | 83 | Detect installed CLIs | install.js startup |
| `bin/lib/cli-detection/recommender.js` | 130 | Generate recommendations | install.js startup |
| `bin/lib/template-system/generator.js` | ~500 | Transform specs to agents/skills | All install functions |
| `bin/lib/colors.js` | 38 | ANSI color codes | install.js, adapters |
| `bin/lib/upgrade.js` | - | Preserve/restore user data | All install functions |
| `bin/lib/migration/migration-flow.js` | - | Migrate from old versions | install.js startup |

---

## Recommendations for v1.9.2 Refactoring

### High Priority

1. **Extract routing logic** → `bin/lib/routing/command-router.js`
   - Eliminates 100+ line if/else chain
   - Enables multi-platform flag combinations
   - Testable in isolation

2. **Create message manager** → `bin/lib/messaging/message-manager.js`
   - Context-aware message display
   - Verbosity control
   - Remove "noise" messages per BRIEF requirements

3. **Interactive platform selector** → `bin/lib/selection/platform-selector.js`
   - Checkbox multi-select (requirement from BRIEF)
   - Scope selection per platform
   - Reuse for both interactive and flag-based modes

4. **Build uninstall script** → `bin/uninstall.js`
   - Mirror install.js structure
   - Detect installed platforms
   - Preserve user data option

### Medium Priority

5. **Installation orchestrator** → `bin/lib/orchestration/installer.js`
   - Unify install flows for all platforms
   - Reduce duplication between install()/installCopilot()/installCodex()

6. **Settings manager** → `bin/lib/settings/settings-manager.js`
   - Encapsulate settings.json operations
   - Reusable for uninstall

### Low Priority (Post-v1.9.2)

7. **Path manager refactoring**
   - Handle Windows/Linux Claude paths
   - XDG Base Directory support on Linux

8. **CLI detection improvements**
   - Detect local installations (`.claude`, `.github`, `.codex`)
   - More robust environment detection

---

## Migration Path to New Architecture

### Phase 1: Extract Core Modules (Non-Breaking)

1. Create `bin/lib/routing/flag-parser.js` - extract parsing logic
2. Create `bin/lib/messaging/message-manager.js` - wrap console.log
3. Refactor install.js to use new modules (keep same CLI flags)

### Phase 2: New Flag System (Breaking Changes)

4. Implement new flags (`--claude`, `--copilot`, `--codex`)
5. Add deprecation warnings for old flags (`--local`, `--global` without platform)
6. Update help text

### Phase 3: Interactive Improvements

7. Add checkbox multi-select menu
8. Add per-platform scope selection

### Phase 4: Uninstall System

9. Build `bin/uninstall.js` using same adapters
10. Add `--uninstall` mode to main script

### Phase 5: Documentation

11. Update README.md with new flag syntax
12. Update installation docs
13. Add migration guide

---

## Testing Considerations

### Current Test Coverage

**Installation scripts:**
- `scripts/test-agent-installation.js` - Tests agent installation
- `scripts/test-agent-generation.js` - Tests template generation
- `scripts/test-cross-platform.js` - Tests platform adapters

**No tests for:**
- Flag parsing logic
- Routing decisions
- Message generation
- Interactive mode

### Recommended Test Structure

```
__tests__/
  routing/
    flag-parser.test.js
    command-router.test.js
  messaging/
    message-manager.test.js
  selection/
    platform-selector.test.js
  integration/
    install-flow.test.js
    uninstall-flow.test.js
```

---

## Appendix: Flag Usage Examples (Current System)

### Working Examples

```bash
# Claude global
npx get-shit-done-multi --global

# Claude local
npx get-shit-done-multi --local

# Copilot local
npx get-shit-done-multi --copilot

# Codex local
npx get-shit-done-multi --codex

# Codex global
npx get-shit-done-multi --codex-global

# All detected CLIs
npx get-shit-done-multi --all
```

### Non-Working Examples (Current Limitations)

```bash
# Multi-platform selection
npx get-shit-done-multi --claude --copilot
# ERROR: Cannot combine --copilot with --local

# Per-platform scope
npx get-shit-done-multi --claude --local --copilot --global
# ERROR: Cannot combine --copilot with --global or --local

# All with specific scope
npx get-shit-done-multi --all --local
# Works but installs Claude globally (ignores --local)
```

---

## Sources

- `bin/install.js` (PRIMARY - full source code analysis)
- `bin/lib/adapters/*.js` (adapter implementations)
- `bin/lib/paths.js` (path utilities)
- `bin/lib/cli-detection/*.js` (detection and recommendations)
- `bin/lib/template-system/*.js` (template generation)
- `package.json` (entry points, scripts)
- `docs/github-copilot-cli.md` (uninstall documentation)
- `docs/troubleshooting.md` (uninstall notes)
