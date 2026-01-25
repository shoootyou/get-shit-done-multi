# Ecosystem Research: Template-Based Installer for Skills & Agents

**Project:** get-shit-done-multi  
**Domain:** CLI installer supporting multiple AI platforms (Claude, GitHub Copilot, Codex)  
**Researched:** 2025-01-22  
**Overall Confidence:** HIGH

## Executive Summary

The GSD multi-CLI installer needs to solve three core problems:
1. **Installation across platforms** - Supporting Windows, macOS, Linux with different path conventions
2. **Template management** - Generating platform-specific skill files from shared templates
3. **Multiple target CLIs** - Installing to Claude, Copilot, and Codex with different directory structures

**Key Finding:** The current approach (npx + persistent skills) is sound, but can be improved with:
- Auto-detection of available CLIs
- Interactive prompts for better UX  
- Template system with shared base + platform overlays
- Verification and update checking

---

## 1. CLI Installer Patterns

### Current Industry Approaches

#### Pattern 1: npx-based Installation (Modern Standard)
**Examples:** create-react-app, create-vite, create-next-app

```bash
npx create-foo@latest my-app
```

**How it works:**
1. npm downloads package to cache
2. Executes bin script
3. Prompts for options
4. Scaffolds from templates
5. Exits (no persistent installation)

**Pros:**
- Always latest version
- No global pollution
- Simple UX
- Cross-platform

**Cons:**
- Requires network
- Slightly slower than global
- Cache grows over time

**Code Pattern:**
```javascript
#!/usr/bin/env node
const prompts = require('prompts');
const fs = require('fs-extra');
const path = require('path');

async function init() {
  const result = await prompts([
    { type: 'text', name: 'projectName', message: 'Project name?' },
    { type: 'select', name: 'template', message: 'Select template',
      choices: [
        { title: 'Basic', value: 'basic' },
        { title: 'Advanced', value: 'advanced' }
      ]
    }
  ]);
  
  const targetDir = path.resolve(process.cwd(), result.projectName);
  const templateDir = path.join(__dirname, '../templates', result.template);
  
  await fs.copy(templateDir, targetDir);
  console.log('✅ Project created!');
}

init().catch(console.error);
```

---

#### Pattern 2: Global Installation with Plugins
**Examples:** ESLint, Prettier, Babel

```bash
npm install -g foo-cli
```

**How it works:**
1. Installs to global node_modules
2. Creates symlink in PATH
3. Can install plugins to:
   - `~/.foo/plugins/` (global)
   - `./.foo/plugins/` (local)
   - Custom location via env var

**Pros:**
- Command always available
- Supports global + local modes
- Plugins update independently

**Cons:**
- Global installs can conflict
- Version management harder
- Requires explicit install step

**Code Pattern:**
```javascript
const os = require('os');
const path = require('path');

function getInstallPaths() {
  const home = os.homedir();
  
  return {
    global: {
      claude: path.join(home, '.claude', 'commands'),
      copilot: path.join(home, '.github', 'copilot', 'skills'),
      codex: path.join(home, '.codex', 'skills')
    },
    local: {
      claude: path.join(process.cwd(), '.claude', 'commands'),
      copilot: path.join(process.cwd(), '.github', 'skills'),
      codex: path.join(process.cwd(), '.codex', 'skills')
    }
  };
}
```

---

#### Pattern 3: Self-Installing (Rustup Pattern)
**Examples:** rustup, pyenv, nvm

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

**How it works:**
1. Downloads shell script
2. Detects platform and architecture
3. Downloads appropriate binary
4. Installs to `~/.cargo/bin` or `~/.rustup`
5. Modifies shell profile
6. Prompts to restart shell

**Pros:**
- Single command
- Cross-platform shell script
- Auto PATH modification
- Can install dependencies

**Cons:**
- Security risk (`curl | sh`)
- Requires shell access
- Complex implementation
- Not suitable for npm-based tools

---

#### Pattern 4: Hybrid npx + Persistent Skills (GSD Current)
**What GSD does:**

```bash
npx get-shit-done-multi --copilot
```

**How it works:**
1. npx runs installer
2. Detects target CLI (claude, copilot, codex)
3. Copies skills to appropriate directory:
   - `~/.claude/commands/gsd/` (global for Claude)
   - `./.github/skills/get-shit-done/` (local for Copilot)
   - `./.codex/skills/get-shit-done/` (local for Codex)
4. Skills persist after npx exits
5. User runs commands in their AI CLI

**Pros:**
- Combines npx convenience with persistence
- Always latest version
- Multi-target support
- No global npm pollution

**Cons:**
- Manual updates needed
- User must know install location
- Different paths for different CLIs

---

### Recommendation for GSD: Keep Hybrid Pattern with Improvements

**Current pattern is correct.** Enhance with:

#### 1. Auto-detection of Available CLIs

```javascript
async function detectAvailableCLIs() {
  const home = os.homedir();
  const cwd = process.cwd();
  
  const detectors = {
    claude: async () => {
      return await fs.pathExists(path.join(home, '.claude')) ||
             await fs.pathExists(path.join(cwd, '.claude'));
    },
    
    copilot: async () => {
      try {
        require('child_process').execSync('gh copilot --version', 
          { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    },
    
    codex: async () => {
      try {
        require('child_process').execSync('codex --version', 
          { stdio: 'ignore' });
        return true;
      } catch {
        return false;
      }
    }
  };
  
  const results = await Promise.all(
    Object.entries(detectors).map(async ([name, detector]) => ({
      name,
      available: await detector()
    }))
  );
  
  return results.filter(r => r.available).map(r => r.name);
}
```

#### 2. Interactive Prompts

```javascript
const prompts = require('prompts');

async function interactiveInstall() {
  const available = await detectAvailableCLIs();
  
  if (available.length === 0) {
    console.log('⚠️  No AI CLIs detected.');
    console.log('Install one of: Claude Code, GitHub Copilot CLI, Codex CLI');
    return;
  }
  
  let target;
  if (available.length === 1) {
    target = available[0];
    console.log(`✓ Detected ${target}`);
  } else {
    const response = await prompts({
      type: 'select',
      name: 'target',
      message: 'Install to which CLI?',
      choices: available.map(cli => ({
        title: cli.charAt(0).toUpperCase() + cli.slice(1),
        value: cli
      }))
    });
    target = response.target;
  }
  
  const { mode } = await prompts({
    type: 'select',
    name: 'mode',
    message: 'Installation mode?',
    choices: [
      { title: 'Global (all projects)', value: 'global' },
      { title: 'Local (this project only)', value: 'local' }
    ],
    initial: 0
  });
  
  await install(target, mode);
}
```

#### 3. Installation Verification

```javascript
async function verifyInstallation(installPath, cli) {
  console.log('Verifying installation...');
  
  if (!await fs.pathExists(installPath)) {
    throw new Error(`Installation directory not found: ${installPath}`);
  }
  
  const requiredFiles = {
    claude: ['skill.mcp.json', 'commands/'],
    copilot: ['skill.mcp.json', 'skills/'],
    codex: ['skill.mcp.json', 'skills/']
  };
  
  for (const file of requiredFiles[cli]) {
    const filePath = path.join(installPath, file);
    if (!await fs.pathExists(filePath)) {
      throw new Error(`Required file missing: ${file}`);
    }
  }
  
  console.log('✅ Installation verified');
  
  // Write version file for update checking
  await fs.writeFile(
    path.join(installPath, '.version'),
    require('./package.json').version
  );
}
```

#### 4. Update Checking

```javascript
async function checkForUpdates(installPath) {
  const versionFile = path.join(installPath, '.version');
  
  if (!await fs.pathExists(versionFile)) {
    return null;
  }
  
  const installedVersion = (await fs.readFile(versionFile, 'utf-8')).trim();
  const currentVersion = require('./package.json').version;
  
  if (installedVersion !== currentVersion) {
    return {
      installed: installedVersion,
      current: currentVersion,
      updateAvailable: true
    };
  }
  
  return { installed: installedVersion, current: currentVersion, updateAvailable: false };
}
```

---

## 2. Template Systems

### Template Engine Comparison

| Engine | Syntax | Pros | Cons | Best For |
|--------|--------|------|------|----------|
| **EJS** | `<%= var %>` | Full JS, flexible | Can get messy | Complex logic, JS/JSON |
| **Handlebars** | `{{var}}` | Logic-less, clean | Need helpers | Moderate complexity |
| **Mustache** | `{{var}}` | Very simple | Too limited | Simple substitution |
| **Plain Replacement** | `__VAR__` | Zero deps | No conditionals | Static content |
| **Template Literals** | `` `${var}` `` | Native JS | Must be in JS | Programmatic generation |

### Detailed Analysis

#### EJS (Embedded JavaScript)

```javascript
const ejs = require('ejs');

const template = `
// <%= fileName %>.js
export function <%= functionName %>() {
  <% if (includeLogging) { %>
  console.log('Starting <%= functionName %>');
  <% } %>
  return '<%= returnValue %>';
}
`;

const result = ejs.render(template, {
  fileName: 'utils',
  functionName: 'doWork',
  includeLogging: true,
  returnValue: 'Done!'
});
```

**Pros:**
- Familiar JavaScript syntax
- Full JS expressions inside templates
- Good for complex conditional logic
- npm: `ejs` (stable, maintained)

**Cons:**
- Can become messy with too much logic
- Verbose syntax (`<% %>`)
- Not "logic-less" (mixing concerns)

**Use for:** JavaScript files, JSON configs, complex conditionals

---

#### Handlebars

```javascript
const Handlebars = require('handlebars');

// Register custom helper
Handlebars.registerHelper('uppercase', str => str.toUpperCase());

const template = `
// {{fileName}}.js
export function {{uppercase functionName}}() {
  {{#if includeLogging}}
  console.log('Starting {{functionName}}');
  {{/if}}
  return '{{returnValue}}';
}
`;

const compiled = Handlebars.compile(template);
const result = compiled({
  fileName: 'utils',
  functionName: 'doWork',
  includeLogging: true,
  returnValue: 'Done!'
});
```

**Pros:**
- Clean, logic-less syntax
- Forces separation of concerns
- Helper functions for reuse
- npm: `handlebars`

**Cons:**
- Learning curve for helpers
- Less flexible than EJS
- Need to register helpers upfront

**Use for:** HTML-like files, moderate complexity

---

#### Plain String Replacement (Zero Dependencies)

```javascript
function renderTemplate(template, vars) {
  return Object.entries(vars).reduce((result, [key, value]) => {
    const placeholder = new RegExp(`__${key.toUpperCase()}__`, 'g');
    return result.replace(placeholder, value);
  }, template);
}

const template = `
// __FILE_NAME__.js
export function __FUNCTION_NAME__() {
  return '__RETURN_VALUE__';
}
`;

const result = renderTemplate(template, {
  file_name: 'utils',
  function_name: 'doWork',
  return_value: 'Done!'
});
```

**Pros:**
- Zero dependencies
- Very simple
- Easy to understand
- Full control

**Cons:**
- No conditionals or loops
- Manual escaping
- All logic in code

**Use for:** XML files, static content with few variables

---

### Handling Platform-Specific Variations

#### Approach 1: Conditional Blocks in Templates

```ejs
<%# single-template.js.ejs %>
export function getPaths() {
  return {
    <% if (platform === 'claude') { %>
    commands: '~/.claude/commands',
    <% } else if (platform === 'copilot') { %>
    skills: '.github/skills',
    <% } else { %>
    skills: '.codex/skills',
    <% } %>
  };
}
```

**Pros:** Single file, easy to see all variations  
**Cons:** Complex with many platforms, hard to maintain

---

#### Approach 2: Separate Templates per Platform

```
templates/
  claude/
    skill.mcp.json
    commands/
      gsd-new-project.xml
  copilot/
    skill.mcp.json
    skills/
      gsd-new-project.md
  codex/
    skill.mcp.json
    skills/
      gsd-new-project.md
```

**Pros:** Clean separation, easy to maintain  
**Cons:** Duplication of common code

---

#### Approach 3: Shared Base + Platform Overlays ⭐ RECOMMENDED

```
templates/
  base/
    skill.mcp.json.ejs          # Common metadata
    lib/
      utils.js.ejs               # Shared utilities
      orchestrator.js.ejs        # Common logic
  platforms/
    claude/
      commands/
        gsd-new-project.xml
        gsd-plan-phase.xml
    copilot/
      skills/
        gsd-new-project.md
        gsd-plan-phase.md
    codex/
      skills/
        gsd-new-project.md
        gsd-plan-phase.md
```

**Installation logic:**
```javascript
async function install(platform, targetDir) {
  const templateDir = path.join(__dirname, 'templates');
  const context = {
    platform,
    timestamp: new Date().toISOString(),
    version: require('./package.json').version
  };
  
  // 1. Copy and render base templates
  await processTemplates(
    path.join(templateDir, 'base'),
    targetDir,
    context
  );
  
  // 2. Copy and render platform templates (overwrites conflicts)
  await processTemplates(
    path.join(templateDir, 'platforms', platform),
    targetDir,
    context
  );
}
```

**Pros:**
- Avoids duplication of common code
- Platform-specific code is isolated
- Easy to add new platforms
- Clear separation of concerns

**Cons:**
- Slightly more complex structure
- Need to understand overlay system

---

#### Approach 4: Programmatic Generation

```javascript
function generateSkillFile(platform, commandName) {
  const config = PLATFORM_CONFIGS[platform];
  
  return {
    name: `gsd-${commandName}`,
    syntax: config.syntax,
    path: config.commandPath,
    handler: config.handlerType
  };
}
```

**Pros:** Maximum flexibility, type-safe  
**Cons:** Harder to see output, mixing code/content

---

### Special Consideration: XML Templates

**Problem:** XML uses `<` and `>`, which conflicts with EJS syntax `<% %>`

**Solution 1:** Use different delimiters
```javascript
ejs.render(template, context, { delimiter: '?' });
// Use <?= ?> instead of <%= %>
```

**Solution 2:** Escape template syntax
```xml
<command>
  <%% This is literal %% in output %>
</command>
```

**Solution 3:** Use plain string replacement ⭐ RECOMMENDED
```xml
<!-- command.xml.template -->
<command>
  <name>__COMMAND_NAME__</name>
  <description>__DESCRIPTION__</description>
</command>
```

**Why Solution 3:** XML files are mostly static with few variables. Simple replacement avoids conflicts.

---

### Recommendation for GSD

**Use Approach 3 (Shared Base + Platform Overlays)**

**Template engines:**
- **EJS** for JavaScript/JSON files (complex logic)
- **Plain replacement** for XML files (avoid conflicts)

**Structure:**
```
templates/
  base/
    skill.mcp.json.ejs          # Common skill metadata (all platforms)
    lib/
      utils.js.ejs               # Shared utilities
      orchestrator.js.ejs        # Common orchestration
  platforms/
    claude/
      commands/
        gsd-new-project.xml      # Claude-specific command format
    copilot/
      skills/
        gsd-new-project.md       # Copilot-specific skill format
    codex/
      skills/
        gsd-new-project.md       # Codex-specific skill format
```

**Processing:**
```javascript
async function processTemplates(sourceDir, targetDir, context) {
  const files = glob.sync('**/*', { cwd: sourceDir, nodir: true });
  
  for (const file of files) {
    const sourcePath = path.join(sourceDir, file);
    const outputFile = file.replace(/\.ejs$/, '');
    const targetPath = path.join(targetDir, outputFile);
    
    await fs.ensureDir(path.dirname(targetPath));
    
    if (file.endsWith('.ejs')) {
      const template = await fs.readFile(sourcePath, 'utf-8');
      const rendered = ejs.render(template, context);
      await fs.writeFile(targetPath, rendered);
    } else {
      await fs.copy(sourcePath, targetPath);
    }
  }
}
```

---

## 3. Multi-Platform Tooling

### Path Resolution Challenges

Different platforms have different conventions:

| Platform | Home | Config Location | Path Separator |
|----------|------|----------------|----------------|
| **Windows** | `C:\Users\user` | `%APPDATA%\app` | `\` |
| **macOS** | `/Users/user` | `~/Library/Application Support/app` | `/` |
| **Linux** | `/home/user` | `~/.config/app` | `/` |

### Solution: Node.js Path Module

**Always use `path.join()` or `path.resolve()`:**

```javascript
const path = require('path');
const os = require('os');

// ✅ Cross-platform
const configPath = path.join(os.homedir(), '.config', 'myapp');

// ❌ Platform-specific
const configPath = os.homedir() + '/.config/myapp';
```

### Platform-Specific Config Directories

```javascript
function getConfigDir(appName) {
  const platform = os.platform();
  const home = os.homedir();
  
  switch (platform) {
    case 'win32':
      // Windows: %APPDATA%
      return path.join(
        process.env.APPDATA || path.join(home, 'AppData', 'Roaming'),
        appName
      );
    
    case 'darwin':
      // macOS: ~/Library/Application Support
      return path.join(home, 'Library', 'Application Support', appName);
    
    case 'linux':
    default:
      // Linux: ~/.config or $XDG_CONFIG_HOME
      return path.join(
        process.env.XDG_CONFIG_HOME || path.join(home, '.config'),
        appName
      );
  }
}
```

---

### Global vs Local Installation

#### Pattern: Cascade (Local Overrides Global)

Similar to npm's node_modules resolution and ESLint configs:

```javascript
async function findConfig(filename) {
  // 1. Walk up from current directory
  let currentDir = process.cwd();
  
  while (currentDir !== path.parse(currentDir).root) {
    const configPath = path.join(currentDir, filename);
    if (await fs.pathExists(configPath)) {
      return configPath;
    }
    currentDir = path.dirname(currentDir);
  }
  
  // 2. Check home directory
  const homeConfig = path.join(os.homedir(), filename);
  if (await fs.pathExists(homeConfig)) {
    return homeConfig;
  }
  
  // 3. Not found
  return null;
}
```

---

### How Other Tools Handle Plugins

#### ESLint Plugin System

```javascript
// .eslintrc.js
module.exports = {
  plugins: ['react', 'jsx-a11y'],  // Loads eslint-plugin-*
  extends: ['eslint:recommended', 'plugin:react/recommended']
};
```

**How it works:**
1. Looks for `node_modules/eslint-plugin-{name}` (local)
2. Falls back to global node_modules
3. Plugins export rules and configs
4. Merges configs via `extends`

**Key insight:** Plugins are npm packages, leverage npm for installation

---

#### Prettier Config System

```javascript
// .prettierrc.js
module.exports = {
  semi: false,
  plugins: ['prettier-plugin-tailwindcss']
};
```

**How it works:**
1. Config files cascade (local overrides global)
2. Searches: current dir → home dir
3. Plugins are npm packages

**Key insight:** Zero-config by default, config optional

---

#### Babel Presets and Plugins

```javascript
// babel.config.js
module.exports = {
  presets: ['@babel/preset-env'],
  plugins: ['@babel/plugin-proposal-class-properties']
};
```

**How it works:**
1. Presets = collections of plugins
2. Loads from node_modules
3. Supports custom paths

**Key insight:** Presets simplify common use cases

---

### Applying to GSD

#### Platform-Aware Paths

```javascript
function getCLIPaths(cli) {
  const home = os.homedir();
  const cwd = process.cwd();
  const platform = os.platform();
  
  const paths = {
    claude: {
      global: platform === 'win32'
        ? path.join(process.env.APPDATA, 'Claude', 'commands', 'gsd')
        : path.join(home, '.claude', 'commands', 'gsd'),
      local: path.join(cwd, '.claude', 'commands', 'gsd')
    },
    
    copilot: {
      global: platform === 'win32'
        ? path.join(process.env.USERPROFILE, '.github', 'copilot', 'skills', 'get-shit-done')
        : path.join(home, '.github', 'copilot', 'skills', 'get-shit-done'),
      local: path.join(cwd, '.github', 'skills', 'get-shit-done')
    },
    
    codex: {
      global: platform === 'win32'
        ? path.join(process.env.USERPROFILE, '.codex', 'skills', 'get-shit-done')
        : path.join(home, '.codex', 'skills', 'get-shit-done'),
      local: path.join(cwd, '.codex', 'skills', 'get-shit-done')
    }
  };
  
  return paths[cli];
}
```

---

### Windows-Specific Issues

#### Issue 1: Path Separators

```javascript
// ❌ Don't hardcode separators
const path = home + '/.config/myapp';

// ✅ Use path.join()
const path = path.join(home, '.config', 'myapp');
```

#### Issue 2: Case Sensitivity

```javascript
// ❌ Don't assume CONFIG.json === config.json
const exists = await fs.pathExists('CONFIG.json');

// ✅ Use consistent casing
const configFile = 'config.json';
```

#### Issue 3: Line Endings

Use `.gitattributes`:
```
*.js text eol=lf
*.json text eol=lf
*.md text eol=lf
```

Or normalize in code:
```javascript
const content = fileContent.replace(/\r\n/g, '\n');
```

#### Issue 4: Environment Variables

```javascript
// ✅ Cross-platform
const home = os.homedir();

// ❌ Unix-only
const home = process.env.HOME; // undefined on Windows

// ✅ Windows-specific
const appData = process.env.APPDATA;
const userProfile = process.env.USERPROFILE;
```

---

## Recommended Stack

### Dependencies

```json
{
  "dependencies": {
    "fs-extra": "^11.2.0",      // Better fs with promises
    "prompts": "^2.4.2",         // Interactive prompts
    "chalk": "^5.3.0",           // Colored output
    "ora": "^8.0.1",             // Loading spinners
    "semver": "^7.5.4"           // Version comparison
  },
  "optionalDependencies": {
    "ejs": "^3.1.9"              // Template engine
  }
}
```

### Why These Libraries

| Library | Purpose | Why This One |
|---------|---------|--------------|
| `fs-extra` | File operations | Promise-based, better API than fs |
| `prompts` | Interactive CLI | Lightweight, good UX |
| `chalk` | Terminal colors | Industry standard |
| `ora` | Loading spinners | Clean visual feedback |
| `semver` | Version comparison | Standard for npm ecosystem |
| `ejs` | Templates | Flexible, JavaScript-native |

---

## Key Gotchas and Lessons Learned

### 1. Don't Assume File System Case Sensitivity

**Problem:** macOS/Linux are case-sensitive, Windows is not.

**Solution:** Use consistent casing in file names and code.

```javascript
// ✅ Good
const configFile = 'config.json';

// ❌ Bad (breaks on Linux if file is config.json)
const configFile = 'CONFIG.json';
```

---

### 2. Handle Missing Target Directories Gracefully

**Problem:** User might not have Claude/Copilot/Codex installed.

**Solution:** Detect and provide clear error message.

```javascript
const available = await detectAvailableCLIs();
if (available.length === 0) {
  console.log('⚠️  No AI CLIs detected.');
  console.log('Install one of:');
  console.log('  - Claude Code: https://claude.ai/download');
  console.log('  - GitHub Copilot CLI: gh extension install github/gh-copilot');
  console.log('  - Codex CLI: ...');
  process.exit(1);
}
```

---

### 3. XML Template Syntax Conflicts

**Problem:** EJS uses `<% %>`, XML uses `< >`.

**Solution:** Use plain string replacement for XML files.

```javascript
// XML files: use __PLACEHOLDER__ syntax
function renderXML(template, vars) {
  return Object.entries(vars).reduce((result, [key, value]) => {
    return result.replace(`__${key}__`, value);
  }, template);
}

// JavaScript files: use EJS
const ejs = require('ejs');
const result = ejs.render(template, context);
```

---

### 4. Version File for Update Detection

**Problem:** Users don't know if they're running old version.

**Solution:** Write `.version` file during installation.

```javascript
async function install(cli, mode, installPath) {
  // ... copy files ...
  
  // Write version file
  await fs.writeFile(
    path.join(installPath, '.version'),
    require('./package.json').version
  );
}

async function checkForUpdates(installPath) {
  const versionFile = path.join(installPath, '.version');
  if (await fs.pathExists(versionFile)) {
    const installed = (await fs.readFile(versionFile, 'utf-8')).trim();
    const current = require('./package.json').version;
    if (installed !== current) {
      console.log(`⚠️  Update available: ${installed} → ${current}`);
      console.log(`Run: npx get-shit-done-multi@latest`);
    }
  }
}
```

---

### 5. Verify Installation Success

**Problem:** Silent failures leave incomplete installations.

**Solution:** Verify required files exist after install.

```javascript
async function verifyInstallation(installPath, cli) {
  const requiredFiles = {
    claude: ['skill.mcp.json', 'commands/'],
    copilot: ['skill.mcp.json', 'skills/'],
    codex: ['skill.mcp.json', 'skills/']
  };
  
  for (const file of requiredFiles[cli]) {
    if (!await fs.pathExists(path.join(installPath, file))) {
      throw new Error(`Installation incomplete: missing ${file}`);
    }
  }
}
```

---

### 6. Support Both Interactive and Non-Interactive Modes

**Problem:** CI/CD or scripts need non-interactive installation.

**Solution:** Support flags for automated installs.

```javascript
// Interactive (no flags)
if (process.argv.length === 2) {
  await interactiveInstall();
}

// Non-interactive (with flags)
else {
  const target = parseTargetFlag(process.argv);
  const mode = parseModeFlag(process.argv);
  await install(target, mode);
}
```

---

## Recommendations for Implementation

### Phase 1: Core Installer (Current State)
✅ npx-based installation  
✅ Platform detection (--copilot, --codex)  
✅ Global vs local modes (--local)  
✅ Copy files to target directory  

### Phase 2: Enhanced UX
- [ ] Auto-detect available CLIs
- [ ] Interactive prompts (if no flags)
- [ ] Colored output with chalk
- [ ] Loading spinners with ora
- [ ] Better error messages

### Phase 3: Template System
- [ ] Implement base + overlay structure
- [ ] Use EJS for JS/JSON files
- [ ] Use plain replacement for XML files
- [ ] Support variable interpolation
- [ ] Handle platform-specific variations

### Phase 4: Verification & Updates
- [ ] Verify installation success
- [ ] Write `.version` file
- [ ] Check for updates on reinstall
- [ ] Prompt to update if old version
- [ ] Handle failed installations gracefully

---

## Confidence Assessment

| Area | Confidence | Reasoning |
|------|-----------|-----------|
| CLI Patterns | **HIGH** | Based on direct analysis of create-react-app, vite, npm patterns |
| Template Systems | **HIGH** | Evaluated multiple options (EJS, Handlebars, Mustache), clear recommendation |
| Multi-Platform | **HIGH** | Node.js path module is standard, patterns from ESLint/Prettier |
| Windows Support | **MEDIUM** | Logical analysis of path differences, but not tested on Windows |
| Update Strategy | **HIGH** | Common pattern (version file + semver comparison) |

---

## Open Questions

1. **Should GSD support installing to all detected CLIs at once?**
   - Pro: Convenience for users with multiple CLIs
   - Con: More complex logic, potential confusion
   - **Recommendation:** Start with single-target, add multi-target later if requested

2. **Should GSD auto-update on each npx run?**
   - Pro: Always latest version
   - Con: Unexpected changes, bandwidth usage
   - **Recommendation:** Prompt user if update available, don't force

3. **Should templates be embedded in package or fetched from repo?**
   - Pro (embedded): Works offline, faster
   - Con (embedded): Larger package size
   - Pro (fetched): Can update templates independently
   - Con (fetched): Requires network
   - **Recommendation:** Embed templates in package for reliability

---

## Sources

**CLI Installer Patterns:**
- npm documentation: https://docs.npmjs.com/
- create-react-app source (archived): https://github.com/facebook/create-react-app
- Vite create patterns: https://vitejs.dev/guide/
- Yeoman documentation: https://yeoman.io/authoring/

**Template Systems:**
- EJS: https://ejs.co/
- Handlebars: https://handlebarsjs.com/
- Mustache: https://mustache.github.io/

**Multi-Platform Tooling:**
- Node.js path module: https://nodejs.org/api/path.html
- Node.js os module: https://nodejs.org/api/os.html
- ESLint plugin system: https://eslint.org/docs/latest/extend/plugins
- Prettier plugin system: https://prettier.io/docs/en/plugins.html

**Confidence:** HIGH (all sources are official documentation or well-established open source projects)

---

## Next Steps for Roadmap Creation

Based on this research, roadmap should prioritize:

1. **Phase: Core Improvements** - Auto-detection, interactive prompts, verification
2. **Phase: Template System** - Implement base + overlay with EJS
3. **Phase: Update Mechanism** - Version tracking and update prompts
4. **Phase: Windows Testing** - Verify path handling on Windows
5. **Phase: Documentation** - Document installation paths and troubleshooting

**Research flags for future phases:**
- Phase "Windows Support": Test path resolution on actual Windows system
- Phase "Multi-Install": Research UX for installing to multiple CLIs
- Phase "Template Validation": Research how to validate generated files

---

**Research complete. Ready for roadmap creation.**
