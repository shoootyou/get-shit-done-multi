# Phase 3: Multi-Platform Support - Research

**Researched:** 2025-01-26
**Domain:** Multi-platform CLI installer with adapter pattern for platform-specific transformations
**Confidence:** HIGH

## Summary

Researched Node.js adapter pattern implementation for multi-platform CLI installer that transforms universal templates into platform-specific formats (Claude Code, GitHub Copilot, Codex CLI). The standard approach uses the **Strategy pattern** with a base adapter interface and concrete implementations per platform, combined with a **Registry pattern** for adapter lookup. 

Key findings: Phase 2 already established template variable replacement (simple string.replace with RegExp), file operations (fs-extra), and path resolution. Phase 3 extends this with platform adapters that encapsulate transformation logic. Use gray-matter (already in project as devDependency) for safe YAML frontmatter manipulation. Binary detection uses `which`/`where` commands via child_process but is only for recommendations—actual installation validation uses file path detection via fs.existsSync().

The critical insight: Don't mix adapter responsibilities. Tool name transformation, file extension determination, and path resolution should all live in adapters, but template variable replacement stays in the existing renderer. Adapters wrap the renderer with platform-specific logic.

**Primary recommendation:** Create PlatformAdapter base class with concrete implementations (ClaudeAdapter, CopilotAdapter, CodexAdapter). Each platform adapter is ISOLATED - NO inheritance between them (ARCHITECTURAL RULE per PLATFORM-02). Use Registry pattern for adapter lookup. Extend existing orchestrator to accept platform parameter and delegate transformations to adapters. Keep template rendering in existing template-renderer.js.

**CRITICAL:** Code duplication between platform adapters is ACCEPTABLE and PREFERRED over coupling. Platform isolation over DRY principle.

## Standard Stack

The established libraries/tools for multi-platform CLI adapters:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gray-matter | 4.0.3 | YAML frontmatter parsing and manipulation | Industry standard for markdown frontmatter. Already in project as devDependency. Safe parsing/stringifying with edge case handling |
| fs-extra | 11.3.3 | File system operations | Already in project from Phase 2. Used for path existence checks for platform detection |
| Node.js child_process | Built-in | Execute which/where commands | Standard for binary detection. Use promisify(exec) for async/await pattern |
| Node.js path | Built-in | Cross-platform path operations | Already used in Phase 2. Essential for platform-specific path construction |
| Node.js os | Built-in | Platform detection and home directory | Get process.platform for Windows vs Unix, os.homedir() for global installations |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Node.js Map | Built-in | Adapter registry storage | Efficient key-value lookup for platform → adapter mapping |
| Node.js util.promisify | Built-in | Convert exec callback to promise | Wrap exec for async/await pattern in binary detection |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Strategy pattern | Factory pattern | Factory returns instances; Strategy uses composition. Strategy better for runtime adapter selection |
| Strategy pattern | Plugin architecture | Plugins require dynamic loading from filesystem. Overkill for 3 known platforms |
| gray-matter | js-yaml + manual split | gray-matter handles markdown splitting edge cases (code blocks, delimiters). Don't hand-roll |
| which/where commands | Manual PATH parsing | PATH parsing is OS-specific and complex. Shell commands handle edge cases |

**Installation:**
```bash
# gray-matter already in devDependencies
# Move to dependencies for runtime use
npm install gray-matter --save
npm uninstall gray-matter --save-dev
```

## Architecture Patterns

### Recommended Project Structure
```
bin/lib/
├── platforms/
│   ├── base-adapter.js        # PlatformAdapter base class
│   ├── claude-adapter.js      # Claude Code transformations
│   ├── copilot-adapter.js     # GitHub Copilot transformations
│   ├── codex-adapter.js       # Codex CLI transformations
│   ├── detector.js            # GSD installation detection via paths
│   ├── binary-detector.js     # CLI binary detection for recommendations
│   └── registry.js            # AdapterRegistry for lookup
├── rendering/
│   └── template-renderer.js   # Existing - extended to accept adapter
└── installer/
    └── orchestrator.js        # Existing - extended to use adapters
```

**Separation of Concerns:**
- **Base adapter:** Abstract interface defining required methods
- **Concrete adapters:** Platform-specific transformation logic
- **Registry:** Adapter lookup by platform name
- **Detectors:** Filesystem and binary detection isolated from installation logic
- **Renderer:** Template variable replacement (platform-agnostic)
- **Orchestrator:** Installation coordination using adapters

### Pattern 1: Strategy Pattern with Base Class

**What:** Base adapter class defining interface, concrete classes implementing platform-specific behavior

**When to use:** Multiple platforms with different transformation requirements but same overall flow

**Example:**
```javascript
// Source: Strategy pattern + Node.js best practices

// bin/lib/platforms/base-adapter.js
export class PlatformAdapter {
  constructor(platformName) {
    this.platformName = platformName;
  }
  
  // Required methods - throw if not implemented
  getFileExtension() {
    throw new Error(`${this.platformName}: getFileExtension() must be implemented`);
  }
  
  getTargetDir(isGlobal) {
    throw new Error(`${this.platformName}: getTargetDir() must be implemented`);
  }
  
  getCommandPrefix() {
    throw new Error(`${this.platformName}: getCommandPrefix() must be implemented`);
  }
  
  transformTools(toolsArray) {
    throw new Error(`${this.platformName}: transformTools() must be implemented`);
  }
  
  transformFrontmatter(data) {
    throw new Error(`${this.platformName}: transformFrontmatter() must be implemented`);
  }
  
  getPathReference() {
    throw new Error(`${this.platformName}: getPathReference() must be implemented`);
  }
}

// bin/lib/platforms/claude-adapter.js
import { PlatformAdapter } from './base-adapter.js';

export class ClaudeAdapter extends PlatformAdapter {
  constructor() {
    super('claude');
  }
  
  getFileExtension() {
    return '.md';
  }
  
  getTargetDir(isGlobal) {
    return isGlobal ? '~/.claude' : '.claude';
  }
  
  getCommandPrefix() {
    return '/gsd-';
  }
  
  getPathReference() {
    return '.claude';
  }
  
  transformTools(toolsArray) {
    // Claude: capitalized, comma-separated string
    // Input: ['read', 'edit', 'bash']
    // Output: 'Read, Edit, Bash'
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    return toolsArray.map(capitalize).join(', ');
  }
  
  transformFrontmatter(data) {
    // Claude agents: name, description, tools (comma-separated)
    return {
      name: data.name,
      description: data.description,
      tools: this.transformTools(data.tools)
    };
  }
}

// bin/lib/platforms/copilot-adapter.js
import { PlatformAdapter } from './base-adapter.js';

export class CopilotAdapter extends PlatformAdapter {
  constructor() {
    super('copilot');
    // Tool mappings: Copilot aliases → Claude official names
    this.toolMappings = {
      'read': 'Read',
      'edit': 'Edit',
      'execute': 'Bash',
      'search': 'Grep',
      'agent': 'Task'
    };
  }
  
  getFileExtension() {
    return '.agent.md';
  }
  
  getTargetDir(isGlobal) {
    return isGlobal ? '~/.copilot' : '.github';
  }
  
  getCommandPrefix() {
    return '/gsd-'; // Same as Claude
  }
  
  getPathReference() {
    return '.github';
  }
  
  transformTools(toolsArray) {
    // Copilot: lowercase array format
    // Input: ['Read', 'Edit', 'Bash']
    // Output: ['read', 'edit', 'execute']
    const reverseMap = Object.fromEntries(
      Object.entries(this.toolMappings).map(([k, v]) => [v, k])
    );
    return toolsArray.map(t => reverseMap[t] || t.toLowerCase());
  }
  
  transformFrontmatter(data) {
    // Copilot agents: name, description, tools (array), metadata
    return {
      name: data.name,
      description: data.description,
      tools: this.transformTools(data.tools),
      metadata: {
        platform: 'copilot',
        generated: new Date().toISOString().split('T')[0],
        templateVersion: '1.0.0',
        projectVersion: '2.0.0',
        projectName: 'get-shit-done-multi'
      }
    };
  }
}

// bin/lib/platforms/codex-adapter.js
import { PlatformAdapter } from './base-adapter.js';

// ARCHITECTURAL RULE: NO inheritance from CopilotAdapter
// Each platform adapter is ISOLATED - code duplication is ACCEPTABLE
export class CodexAdapter extends PlatformAdapter {
  constructor() {
    super();
    this.platformName = 'codex';
    // Tool mappings (DUPLICATED from CopilotAdapter - this is INTENTIONAL)
    this.toolMappings = {
      'Read': 'read',
      'Edit': 'edit',
      'Write': 'edit',
      'Bash': 'execute',
      'Grep': 'search',
      'Glob': 'search',
      'Task': 'agent'
    };
  }
  
  getTargetDir(isGlobal) {
    return isGlobal ? '~/.codex' : '.codex';
  }
  
  getCommandPrefix() {
    return '$gsd-'; // DIFFERENT from Claude/Copilot
  }
  
  getPathReference() {
    return '.codex';
  }
  
  getFileExtension(type) {
    return type === 'agent' ? '.agent.md' : '.md';
  }
  
  transformTools(tools) {
    // Convert Claude capitalized tools to lowercase Codex format
    // DUPLICATED from CopilotAdapter - platform isolation over DRY
    const toolsArray = tools.split(',').map(t => t.trim());
    const reverseMap = Object.fromEntries(
      Object.entries(this.toolMappings).map(([k, v]) => [v, k])
    );
    return toolsArray.map(t => reverseMap[t] || t.toLowerCase());
  }
  
  transformFrontmatter(data) {
    // DUPLICATED from CopilotAdapter with different metadata
    return {
      name: data.name,
      description: data.description,
      tools: this.transformTools(data.tools),
      metadata: {
        platform: 'codex',
        generated: new Date().toISOString().split('T')[0],
        templateVersion: '1.0.0',
        projectVersion: '2.0.0',
        projectName: 'get-shit-done-multi'
      }
    };
  }
}
```

### Pattern 2: Registry Pattern for Adapter Lookup

**What:** Centralized registry storing and retrieving platform adapters

**When to use:** Need runtime platform selection based on CLI flags or detection

**Example:**
```javascript
// Source: Registry pattern + Service Locator pattern

// bin/lib/platforms/registry.js
import { ClaudeAdapter } from './claude-adapter.js';
import { CopilotAdapter } from './copilot-adapter.js';
import { CodexAdapter } from './codex-adapter.js';

class AdapterRegistry {
  constructor() {
    this.adapters = new Map();
    this._initialize();
  }
  
  _initialize() {
    // Register all platform adapters
    this.register('claude', new ClaudeAdapter());
    this.register('copilot', new CopilotAdapter());
    this.register('codex', new CodexAdapter());
  }
  
  register(platform, adapter) {
    if (this.adapters.has(platform)) {
      throw new Error(`Platform already registered: ${platform}`);
    }
    this.adapters.set(platform, adapter);
  }
  
  get(platform) {
    if (!this.adapters.has(platform)) {
      throw new Error(`Unknown platform: ${platform}. Supported: ${this.getSupportedPlatforms().join(', ')}`);
    }
    return this.adapters.get(platform);
  }
  
  has(platform) {
    return this.adapters.has(platform);
  }
  
  getSupportedPlatforms() {
    return Array.from(this.adapters.keys());
  }
}

// Singleton instance
export const adapterRegistry = new AdapterRegistry();
```

### Pattern 3: Platform Detection via File Paths

**What:** Detect GSD installations by checking for platform-specific directory structures

**When to use:** Need to show existing installations or validate installation success

**Example:**
```javascript
// Source: fs-extra + Node.js best practices

// bin/lib/platforms/detector.js
import { pathExists } from '../io/file-operations.js';
import { homedir } from 'os';
import { join } from 'path';

/**
 * Detect GSD installations by checking platform-specific paths
 * @returns {Promise<Object>} Detection results per platform
 */
export async function detectInstallations() {
  const results = {
    claude: { global: false, local: false },
    copilot: { global: false, local: false },
    codex: { global: false, local: false }
  };
  
  // Check global installations
  const home = homedir();
  results.claude.global = await isGSDInstalled(join(home, '.claude'));
  results.copilot.global = await isGSDInstalled(join(home, '.copilot'));
  results.codex.global = await isGSDInstalled(join(home, '.codex'));
  
  // Check local installations (current directory)
  results.claude.local = await isGSDInstalled('.claude');
  results.copilot.local = await isGSDInstalled('.github');
  results.codex.local = await isGSDInstalled('.codex');
  
  return results;
}

/**
 * Check if GSD is installed in a directory
 * @param {string} dir - Directory to check
 * @returns {Promise<boolean>}
 */
async function isGSDInstalled(dir) {
  // GSD is installed if manifest exists
  const manifestPath = join(dir, 'get-shit-done', '.gsd-install-manifest.json');
  return await pathExists(manifestPath);
}

/**
 * Get installed platforms
 * @returns {Promise<string[]>} Array of platform names
 */
export async function getInstalledPlatforms() {
  const detections = await detectInstallations();
  const installed = [];
  
  for (const [platform, locations] of Object.entries(detections)) {
    if (locations.global || locations.local) {
      installed.push(platform);
    }
  }
  
  return installed;
}
```

### Pattern 4: Binary Detection for Recommendations

**What:** Detect installed CLI binaries using which/where commands

**When to use:** Providing recommendations like "Install for Claude? (detected)"

**Example:**
```javascript
// Source: Node.js child_process + cross-platform best practices

// bin/lib/platforms/binary-detector.js
import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';

const execAsync = promisify(exec);

/**
 * Check if a command exists in PATH
 * @param {string} command - Command name
 * @returns {Promise<boolean>}
 */
async function commandExists(command) {
  const isWindows = platform() === 'win32';
  const checkCmd = isWindows ? `where ${command}` : `which ${command}`;
  
  try {
    await execAsync(checkCmd);
    return true;
  } catch {
    return false;
  }
}

/**
 * Detect available platform CLI binaries
 * @returns {Promise<Object>} Binary detection results
 */
export async function detectBinaries() {
  const [claude, copilot, codex] = await Promise.all([
    commandExists('claude'),
    commandExists('copilot'),
    commandExists('codex')
  ]);
  
  return { claude, copilot, codex };
}

/**
 * Get list of available platform binaries
 * @returns {Promise<string[]>} Array of platform names with binaries
 */
export async function getAvailableBinaries() {
  const binaries = await detectBinaries();
  return Object.entries(binaries)
    .filter(([_, exists]) => exists)
    .map(([name]) => name);
}
```

### Pattern 5: Frontmatter Transformation with gray-matter

**What:** Parse YAML frontmatter, transform data, stringify back to markdown

**When to use:** Need to modify agent/skill frontmatter while preserving content

**Example:**
```javascript
// Source: gray-matter documentation + Phase 1 research

// bin/lib/rendering/frontmatter-transformer.js
import matter from 'gray-matter';

/**
 * Transform agent frontmatter for target platform
 * @param {string} content - Markdown content with frontmatter
 * @param {PlatformAdapter} adapter - Platform adapter
 * @returns {string} Transformed markdown
 */
export function transformAgentFrontmatter(content, adapter) {
  // Parse markdown with frontmatter
  const parsed = matter(content);
  
  // Transform frontmatter using adapter
  const transformed = adapter.transformFrontmatter(parsed.data);
  
  // Stringify back to markdown
  return matter.stringify(parsed.content, transformed);
}

/**
 * Example usage in orchestrator:
 */
async function installAgent(agentFile, adapter) {
  const content = await readFile(agentFile, 'utf8');
  
  // Transform frontmatter for platform
  const transformed = transformAgentFrontmatter(content, adapter);
  
  // Transform template variables
  const variables = {
    PLATFORM_ROOT: adapter.getTargetDir(isGlobal),
    COMMAND_PREFIX: adapter.getCommandPrefix(),
    VERSION: '2.0.0',
    PLATFORM_NAME: adapter.platformName
  };
  const rendered = renderTemplate(transformed, variables);
  
  // Determine output filename with platform extension
  const outputName = agentFile.replace('.agent.md', adapter.getFileExtension());
  await writeFile(outputName, rendered);
}
```

### Pattern 6: Command Prefix Transformation

**What:** Replace command references in content using RegExp

**When to use:** Need to transform `/gsd-` to `$gsd-` for Codex

**Example:**
```javascript
// Source: String manipulation best practices

/**
 * Transform command prefix in content
 * @param {string} content - Content with command references
 * @param {string} fromPrefix - Source prefix (e.g., '/gsd-')
 * @param {string} toPrefix - Target prefix (e.g., '$gsd-')
 * @returns {string} Transformed content
 */
export function transformCommandPrefix(content, fromPrefix, toPrefix) {
  // Escape special regex characters in prefixes
  const escaped = fromPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Match command prefix followed by word characters
  // Handles: /gsd-plan-phase, /gsd-execute-phase, etc.
  const pattern = new RegExp(`${escaped}([a-z-]+)`, 'g');
  
  return content.replace(pattern, `${toPrefix}$1`);
}

/**
 * Example: Transform for Codex
 */
const codexContent = transformCommandPrefix(
  content,
  '/gsd-',  // From
  '$gsd-'   // To (Codex uses $ prefix)
);
```

### Anti-Patterns to Avoid

- **Adapter doing too much:** Don't put template variable replacement in adapters. Adapters transform structure, renderer replaces variables
- **Registry mutation:** Don't allow runtime adapter registration after initialization. All platforms registered at startup
- **Binary detection for validation:** Don't use `which claude` to validate installation. Use file path detection (manifest.json existence)
- **Hard-coded platform checks:** Don't use `if (platform === 'claude')` in orchestrator. Use adapter methods polymorphically
- **Mixing concerns:** Don't put detection logic in adapters. Detectors are separate from transformers

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML frontmatter parsing | Manual string splitting on `---` | gray-matter | Handles edge cases: missing frontmatter, code blocks with ---, malformed YAML, empty frontmatter |
| Binary existence check | Manual PATH parsing and lookup | which/where via child_process | OS-specific PATH handling (Windows %PATH% vs Unix $PATH), executable extensions on Windows |
| Platform detection | String checks on process.platform | Node.js os.platform() | Returns canonical platform names, handles edge cases |
| File path existence | fs.access or fs.stat | fs-extra pathExists() | Simpler API, returns boolean, no error handling needed |
| Adapter pattern | Switch statements or if/else chains | Base class + Registry pattern | Extensible for new platforms, testable in isolation, cleaner separation |

**Key insight:** Frontmatter manipulation is complex. Code blocks can contain `---`, YAML can be malformed, empty frontmatter is valid. gray-matter handles all edge cases and is battle-tested by metalsmith, assemble, and hundreds of static site generators.

## Common Pitfalls

### Pitfall 1: Tool Name Capitalization Inconsistency

**What goes wrong:** Mixing tool name capitalization between platforms causes frontmatter validation errors

**Why it happens:** Claude uses `Read, Write, Bash` (capitalized), Copilot uses `read, edit, execute` (lowercase aliases). Easy to forget which platform uses which format.

**How to avoid:**
- Store canonical tool names in base adapter as constants
- Each adapter has tool mapping table (Copilot: `execute` → `Bash`, Codex: `execute` → `Bash`)
- Use adapter.transformTools() method, never hard-code transformations

**Warning signs:**
- Agent fails to load with "invalid tool name" error
- Tools show as undefined in agent frontmatter
- Tests pass but actual installation fails

### Pitfall 2: Command Prefix Replacement Breaking Code Blocks

**What goes wrong:** Replacing `/gsd-` with `$gsd-` transforms code examples in markdown, breaking documentation

**Why it happens:** Simple string replace doesn't distinguish between command references and code blocks

**How to avoid:**
- Use targeted RegExp patterns that match command context
- Consider excluding code blocks (but requirements don't specify this, so simple replace is acceptable)
- Test with content containing both real commands and code examples

**Warning signs:**
- Code examples in agent documentation show wrong prefix
- Inline code like `` `$gsd-plan-phase` `` when it should be `` `/gsd-plan-phase` ``

### Pitfall 3: Path Detection vs Binary Detection Confusion

**What goes wrong:** Using `which claude` to determine if GSD is installed for Claude

**Why it happens:** Binary existence doesn't mean GSD is installed. User might have Claude installed but no GSD skills.

**How to avoid:**
- Binary detection (which/where) → recommendations only ("Install for Claude? (detected)")
- Path detection (manifest file) → validation only ("GSD already installed at...")
- Never use binary detection for installation validation
- Never use path detection for recommendations

**Warning signs:**
- Installer says "Claude detected" but user hasn't installed GSD yet
- Installer says "Install successful" but skills don't load
- Manifest exists but Claude binary not in PATH

### Pitfall 4: Adapter Registry Not Initialized

**What goes wrong:** Registry.get() throws "Unknown platform" even though platform is valid

**Why it happens:** Forgot to call registry._initialize() or adapter constructor failed silently

**How to avoid:**
- Initialize registry in constructor (singleton pattern)
- Add validation that all expected adapters are registered
- Export singleton instance, not class (prevents multiple registries)

**Warning signs:**
- Error: "Unknown platform: claude" when claude should be supported
- getSupportedPlatforms() returns empty array
- Tests pass but CLI fails

### Pitfall 5: File Extension Mismatch

**What goes wrong:** Installing `.md` files when platform expects `.agent.md` or vice versa

**Why it happens:** Hard-coding extensions or using wrong adapter method

**How to avoid:**
- Always use `adapter.getFileExtension()` for output filename
- Template files use `.agent.md` as source (universal format)
- Adapter transforms to target extension (`.md` for Claude, `.agent.md` for Copilot/Codex)

**Warning signs:**
- Agent files don't appear in platform's agent list
- Files installed but platform doesn't recognize them
- Manifest shows installed but `copilot agent list` shows nothing

### Pitfall 6: Global vs Local Path Confusion

**What goes wrong:** Installing to `~/.claude` when user specified `--local` or vice versa

**Why it happens:** Not passing isGlobal flag through adapter chain

**How to avoid:**
- adapter.getTargetDir(isGlobal) requires isGlobal parameter
- Orchestrator passes isGlobal to all adapter methods
- Test both global and local installations

**Warning signs:**
- User runs `--local` but files appear in `~/.claude`
- User runs `--global` but files appear in project `.claude`
- Multiple installations in unexpected locations

## Code Examples

Verified patterns from project requirements and Node.js best practices:

### Multi-Platform Installation

```javascript
// Source: Phase 3 requirements + orchestrator pattern from Phase 2

// bin/lib/installer/orchestrator.js (extended)
import { adapterRegistry } from '../platforms/registry.js';
import { renderTemplate } from '../rendering/template-renderer.js';
import { transformAgentFrontmatter } from '../rendering/frontmatter-transformer.js';

/**
 * Install for multiple platforms
 * @param {Object} options - Installation options
 * @param {string[]} options.platforms - Array of platform names
 * @param {boolean} options.isGlobal - Global vs local
 * @param {boolean} options.isVerbose - Verbose output
 * @param {string} options.scriptDir - Script directory
 * @returns {Promise<Object>} Installation stats per platform
 */
export async function installMultiPlatform(options) {
  const { platforms, isGlobal, isVerbose, scriptDir } = options;
  
  const results = {};
  
  for (const platformName of platforms) {
    logger.sectionTitle(`Installing for ${platformName}...`);
    
    // Get adapter for platform
    const adapter = adapterRegistry.get(platformName);
    
    // Run installation with adapter
    results[platformName] = await installSinglePlatform({
      adapter,
      isGlobal,
      isVerbose,
      scriptDir
    });
  }
  
  return results;
}

/**
 * Install for single platform using adapter
 */
async function installSinglePlatform({ adapter, isGlobal, isVerbose, scriptDir }) {
  const targetDir = adapter.getTargetDir(isGlobal);
  const templatesDir = getTemplatesDirectory(scriptDir);
  
  await ensureDirectory(targetDir);
  
  // Get template variables for platform
  const variables = {
    PLATFORM_ROOT: adapter.getPathReference(),
    COMMAND_PREFIX: adapter.getCommandPrefix(),
    VERSION: '2.0.0',
    PLATFORM_NAME: adapter.platformName
  };
  
  // Install phases
  const stats = {
    skills: await installSkills(templatesDir, targetDir, adapter, variables, isVerbose),
    agents: await installAgents(templatesDir, targetDir, adapter, variables, isVerbose),
    shared: await installShared(templatesDir, targetDir, adapter, variables, isVerbose)
  };
  
  // Generate manifest
  await generateManifest(targetDir, adapter, stats, isGlobal);
  
  return stats;
}

/**
 * Install agents with platform transformations
 */
async function installAgents(templatesDir, targetDir, adapter, variables, isVerbose) {
  const agentsTemplateDir = join(templatesDir, 'agents');
  const agentsTargetDir = join(targetDir, 'agents');
  
  await ensureDirectory(agentsTargetDir);
  
  const agentFiles = await readdir(agentsTemplateDir);
  const agents = agentFiles.filter(f => f.endsWith('.agent.md'));
  
  for (const agentFile of agents) {
    logger.verboseInProgress(agentFile, isVerbose);
    
    const srcFile = join(agentsTemplateDir, agentFile);
    const content = await readFile(srcFile, 'utf8');
    
    // Step 1: Transform frontmatter for platform
    const transformed = transformAgentFrontmatter(content, adapter);
    
    // Step 2: Replace template variables
    let rendered = renderTemplate(transformed, variables);
    
    // Step 3: Transform command prefix if needed (Codex only)
    if (adapter.platformName === 'codex') {
      rendered = transformCommandPrefix(rendered, '/gsd-', '$gsd-');
    }
    
    // Step 4: Determine output filename with platform extension
    const baseName = agentFile.replace('.agent.md', '');
    const outputName = baseName + adapter.getFileExtension();
    const destFile = join(agentsTargetDir, outputName);
    
    await writeFile(destFile, rendered);
    
    logger.verboseComplete(isVerbose);
  }
  
  return agents.length;
}
```

### Testing Platform Adapters

```javascript
// Source: Vitest patterns + Phase 2 test structure

// tests/unit/platforms/claude-adapter.test.js
import { describe, it, expect } from 'vitest';
import { ClaudeAdapter } from '../../../bin/lib/platforms/claude-adapter.js';

describe('ClaudeAdapter', () => {
  const adapter = new ClaudeAdapter();
  
  it('should return .md extension', () => {
    expect(adapter.getFileExtension()).toBe('.md');
  });
  
  it('should return global target directory', () => {
    expect(adapter.getTargetDir(true)).toBe('~/.claude');
  });
  
  it('should return local target directory', () => {
    expect(adapter.getTargetDir(false)).toBe('.claude');
  });
  
  it('should return /gsd- command prefix', () => {
    expect(adapter.getCommandPrefix()).toBe('/gsd-');
  });
  
  it('should transform tools to capitalized comma-separated', () => {
    const result = adapter.transformTools(['read', 'edit', 'bash']);
    expect(result).toBe('Read, Edit, Bash');
  });
  
  it('should transform frontmatter', () => {
    const input = {
      name: 'test-agent',
      description: 'Test description',
      tools: ['read', 'edit']
    };
    
    const result = adapter.transformFrontmatter(input);
    
    expect(result).toEqual({
      name: 'test-agent',
      description: 'Test description',
      tools: 'Read, Edit'
    });
  });
});

// tests/unit/platforms/registry.test.js
import { describe, it, expect } from 'vitest';
import { adapterRegistry } from '../../../bin/lib/platforms/registry.js';

describe('AdapterRegistry', () => {
  it('should have all platforms registered', () => {
    const platforms = adapterRegistry.getSupportedPlatforms();
    expect(platforms).toContain('claude');
    expect(platforms).toContain('copilot');
    expect(platforms).toContain('codex');
  });
  
  it('should get claude adapter', () => {
    const adapter = adapterRegistry.get('claude');
    expect(adapter.platformName).toBe('claude');
  });
  
  it('should throw for unknown platform', () => {
    expect(() => adapterRegistry.get('unknown')).toThrow('Unknown platform');
  });
});
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Hard-coded platform checks | Adapter pattern with polymorphism | Design patterns standardized 2010s | Extensible for new platforms without modifying core code |
| if/else chains for platforms | Strategy pattern + Registry | Node.js best practices 2015+ | Clean separation, testable in isolation |
| Manual frontmatter parsing | gray-matter library | Static site generators 2013+ | Handles edge cases, battle-tested |
| Synchronous exec | Promisify + async/await | Node.js 8+ (2017) | Cleaner async code, better error handling |
| String concatenation for paths | path.join() | Node.js always | Cross-platform compatibility |
| Callback-based fs | fs-extra with promises | fs-extra 9+ (2020) | Async/await patterns, recursive operations |

**Deprecated/outdated:**
- Manual PATH parsing: Use which/where commands
- Factory pattern for adapters: Strategy pattern with composition is cleaner for runtime selection
- Handlebars/Mustache for simple variables: Regex replace is simpler and faster

## Open Questions ➜ ✅ RESOLVED

All questions resolved with user decisions (2026-01-26):

### 1. Command prefix in code blocks ✅
   - **Question:** Should code examples be excluded from transformation?
   - **Decision:** NO - transform everywhere (text, inline code, code blocks)
   - **Rationale:** Users copy-paste examples, so they need correct prefix for their platform
   - **Implementation:** Simple string replace transforms `{{COMMAND_PREFIX}}` in all contexts
   - **Status:** ✅ APPROVED - Document as expected behavior in tests

### 2. Adapter architecture ✅ (OVERRIDDEN BY USER)
   - **Original recommendation:** CodexAdapter extends CopilotAdapter (DRY principle)
   - **User decision:** NO INHERITANCE between platform adapters
   - **ARCHITECTURAL RULE (PLATFORM-02):** Each platform MUST have its own complete adapter
   - **Rationale:** Platform isolation over DRY - changes to one platform should NOT affect others
   - **Implementation:** 
     - ClaudeAdapter extends PlatformAdapter (complete implementation)
     - CopilotAdapter extends PlatformAdapter (complete implementation)
     - CodexAdapter extends PlatformAdapter (complete implementation, code duplication acceptable)
   - **Status:** ✅ APPROVED - Documented in ARCHITECTURE-DECISION.md and REQUIREMENTS.md

### 3. Binary detection timeout ✅
   - **Question:** What timeout for which/where commands?
   - **Decision:** 2-second timeout on exec()
   - **Rationale:** Prevents hanging if binary doesn't exist
   - **Implementation:** `await execAsync('which copilot', { timeout: 2000 })`
   - **Status:** ✅ APPROVED

**See also:**
- `.planning/phases/03-multi-platform-support/03-RESEARCH-CLARIFICATIONS.md` — Detailed explanations
- `.planning/ARCHITECTURE-DECISION.md` — Complete ADR for adapter isolation decision
- `.planning/REQUIREMENTS.md` — PLATFORM-02 contains architectural rule

## Sources

### Primary (HIGH confidence)
- Node.js official documentation - child_process, os, path modules
- fs-extra documentation (v11.3.3) - pathExists, copy, ensureDir methods
- gray-matter documentation (v4.0.3) - parse/stringify API
- Phase 2 RESEARCH.md - Established patterns for file operations, CLI, rendering
- Phase 1 RESEARCH.md - Tool name mappings and frontmatter corrections
- .planning/REQUIREMENTS.md - PLATFORM-01 through PLATFORM-05, TEMPLATE-02
- .planning/FRONTMATTER-CORRECTIONS.md - Skills frontmatter specifications
- .planning/AGENT-CORRECTIONS.md - Agents frontmatter specifications

### Secondary (MEDIUM confidence)
- Strategy pattern - Design Patterns: Elements of Reusable Object-Oriented Software (Gang of Four)
- Registry pattern - Martin Fowler's Patterns of Enterprise Application Architecture
- Existing code analysis - bin/lib/rendering/template-renderer.js, bin/lib/installer/orchestrator.js

### Tertiary (LOW confidence)
- None - All findings verified against official sources or existing code

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project or Node.js built-ins
- Architecture patterns: HIGH - Strategy + Registry patterns are industry standard, NO inheritance between platforms (user decision)
- Tool transformations: HIGH - Requirements document specifies exact mappings
- Binary detection: HIGH - Standard which/where pattern with 2-second timeout (user approved)
- Frontmatter handling: HIGH - gray-matter is industry standard, already in project
- Command prefix transformation: HIGH - Simple RegExp transforms everywhere including code blocks (user approved)
- Pitfalls: MEDIUM - Based on requirements analysis and common adapter pattern mistakes

**Research date:** 2026-01-26  
**Updated:** 2026-01-26 (open questions resolved with user decisions)  
**Valid until:** 2026-02-25 (30 days - stable patterns and requirements)
