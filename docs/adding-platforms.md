# Adding New Platforms

Guide for contributors adding support for new AI CLI platforms (e.g., Cursor, Windsurf).

## Overview

**What this guide is for:** Adding support for new AI CLI platforms to GSD Multi installer

**Prerequisites:**
- Understanding of adapter pattern and platform isolation philosophy
- Node.js ESM module system
- YAML frontmatter formats
- Basic testing with Vitest

**Time estimate:** 4-6 hours for a new platform (research + implementation + testing)

**Philosophy:** Each platform is **fully independent**. Code duplication is acceptable and preferred over coupling between platforms. Pattern consistency matters more than DRY.

---

## Architecture Context

### Per-Platform Pattern Philosophy

GSD Multi follows a **strict isolation pattern** where each platform gets its own complete set of components:

- **Platform Adapter** - Frontmatter transformation, tool mapping, path rewriting
- **Frontmatter Validator** - Platform-specific validation rules
- **Frontmatter Serializer** - YAML formatting (block vs flow style, quoting rules)
- **Frontmatter Cleaner** - Parse, clean, rebuild using platform serializer

**Why isolation over DRY:**

- Platform requirements change independently
- No cascading breakage when one platform updates
- Each platform is self-documenting
- Easier to debug and test in isolation
- New contributors can understand one platform without learning others

### Module Organization

```text
bin/lib/
├── platforms/          # Platform adapters
│   ├── base-adapter.js
│   ├── claude-adapter.js
│   ├── copilot-adapter.js
│   ├── codex-adapter.js
│   └── registry.js
├── frontmatter/        # Validators (per-platform)
│   ├── base-validator.js
│   ├── field-validators.js
│   ├── validation-error.js
│   ├── claude-validator.js
│   ├── copilot-validator.js
│   └── codex-validator.js
├── serialization/      # Serializers and cleaners (per-platform)
│   ├── claude-serializer.js
│   ├── claude-cleaner.js
│   ├── copilot-serializer.js
│   ├── copilot-cleaner.js
│   ├── codex-serializer.js
│   └── codex-cleaner.js
└── templates/          # General template rendering
    └── template-renderer.js
```

**Separation of concerns:**

1. **Validation** (frontmatter/) - Check frontmatter structure and fields
2. **Serialization** (serialization/) - Convert objects to YAML strings
3. **Cleaning** (serialization/) - Remove empty fields using platform serializer
4. **Rendering** (templates/) - Replace template variables (EJS)
5. **Adaptation** (platforms/) - Orchestrate all above for a platform

---

## Step-by-Step Checklist

### □ Step 1: Research Platform Specifications

Before writing code, document the platform's requirements:

**Tool names and mappings:**
```bash
# Example research questions:
# - What are the tool names? (Read, Write, Edit vs read, write, edit)
# - Are tools capitalized? (Read vs read)
# - How are multiple tools formatted? (comma-separated vs array)
```

**Frontmatter format:**
```yaml
# Example: Analyze sample skill files
# - Is YAML strict or lenient?
# - Block style or flow style for arrays?
# - Required vs optional fields?
# - Field naming conventions (camelCase vs kebab-case)?
```

**File extensions:**
```bash
# - Skills: .md, .skill.md, or custom?
# - Agents: .agent.md, .md, or custom?
```

**Directory structure:**
```bash
# - Skills directory: .platform/skills/ ?
# - Agents directory: .platform/agents/ ?
# - Global directory: ~/.platform/ ?
```

**Command prefix:**
```bash
# - Slash commands: /skill-name
# - Dollar commands: $skill-name
# - Other prefix?
```

**Create research document:**
```bash
# Document findings in:
# .planning/platforms/[platform-name]-research.md
```

---

### □ Step 2: Create Platform Adapter

**File:** `bin/lib/platforms/{platform}-adapter.js`

**Purpose:** Orchestrate frontmatter transformation, tool mapping, and path rewriting

**Implementation:**

```javascript
import matter from 'gray-matter';
import { PlatformAdapter } from './base-adapter.js';
import { getPlatformDir, getPathReference } from './platform-paths.js';
import { getInstructionPath } from './instruction-paths.js';
import { serializeFrontmatter } from '../serialization/{platform}-serializer.js';

/**
 * Platform adapter for [Platform Name]
 * Tools: [format description]
 * Frontmatter: [format description]
 * File extension: [.md or .agent.md]
 * Command prefix: [/gsd- or $gsd-]
 */
export class {Platform}Adapter extends PlatformAdapter {
  constructor() {
    super('{platform}');
  }
  
  /**
   * Get file extension for platform agents
   * @returns {string}
   */
  getFileExtension() {
    return '.md'; // or '.agent.md' or platform-specific
  }
  
  /**
   * Get target installation directory
   * @param {boolean} isGlobal - Global vs local installation
   * @returns {string}
   */
  getTargetDir(isGlobal) {
    const dir = getPlatformDir('{platform}', isGlobal);
    return isGlobal ? `~/${dir}` : dir;
  }
  
  /**
   * Get command prefix for platform
   * @returns {string}
   */
  getCommandPrefix() {
    return '/gsd-'; // or '$gsd-' or platform-specific
  }
  
  /**
   * Get path reference prefix
   * @returns {string}
   */
  getPathReference() {
    return getPathReference('{platform}');
  }
  
  /**
   * Get path to platform instruction file
   * @param {boolean} isGlobal - Global or local installation
   * @returns {string} Absolute path to instructions file
   */
  getInstructionsPath(isGlobal) {
    return getInstructionPath('{platform}', isGlobal);
  }
  
  /**
   * Transform tools for platform
   * @param {string} tools - Comma-separated tools from template
   * @returns {string} Platform-specific format
   */
  transformTools(tools) {
    // Example: Claude keeps "Read, Write, Bash"
    // Example: Copilot might need lowercase "read, write, bash"
    // Example: Codex might need array format
    return tools; // Customize based on platform needs
  }
  
  /**
   * Transform agent frontmatter for platform
   * @param {string} content - Agent file content with frontmatter
   * @returns {string} Transformed content with platform-specific frontmatter
   */
  transformFrontmatter(content) {
    const { data, content: body } = matter(content);
    
    // Extract skills from agent content if not already present
    if (!data.skills) {
      const skillReferences = this.extractSkillReferences(body);
      if (skillReferences.length > 0) {
        data.skills = skillReferences;
      }
    }
    
    // Use platform-specific serializer for correct format
    const frontmatter = serializeFrontmatter(data);
    
    return `---\n${frontmatter}\n---\n\n${body}`;
  }
  
  /**
   * Extract skill references from agent content
   * @param {string} content - Agent body content
   * @returns {string[]} Array of skill names
   */
  extractSkillReferences(content) {
    const skills = new Set();
    
    // Match command pattern (e.g., /gsd-* or $gsd-*)
    const prefix = this.getCommandPrefix();
    const pattern = new RegExp(`${prefix.replace('/', '\\/')}([a-z-]+)`, 'g');
    const matches = content.matchAll(pattern);
    
    for (const match of matches) {
      skills.add(`gsd-${match[1]}`);
    }
    
    return Array.from(skills).sort();
  }
}
```

**Register in exports:**

```javascript
// bin/lib/platforms/index.js
export { {Platform}Adapter } from './{platform}-adapter.js';
```

**Update platform registry:**

```javascript
// bin/lib/platforms/registry.js
import { {Platform}Adapter } from './{platform}-adapter.js';

const adapters = {
  claude: ClaudeAdapter,
  copilot: CopilotAdapter,
  codex: CodexAdapter,
  {platform}: {Platform}Adapter, // Add new platform
};
```

---

### □ Step 3: Create Frontmatter Validator

**File:** `bin/lib/frontmatter/{platform}-validator.js`

**Purpose:** Validate frontmatter structure and fields for platform

**Implementation:**

```javascript
import { BaseValidator } from './base-validator.js';

const {PLATFORM_CONSTANT} = '{platform}';

/**
 * {Platform}Validator class
 * Validates skills for {Platform Name} platform
 */
export class {Platform}Validator extends BaseValidator {
  /**
   * Supported platforms for this validator
   */
  static supportedPlatforms = [{PLATFORM_CONSTANT}];

  /**
   * Create {Platform} validator
   */
  constructor() {
    super({PLATFORM_CONSTANT});
    this.platformName = {PLATFORM_CONSTANT};
  }

  /**
   * Validate optional fields
   * Warns on invalid optional fields but does NOT throw
   * 
   * @param {Object} frontmatter - Parsed frontmatter object
   * @param {Object} context - Validation context
   */
  validateOptionalFields(frontmatter, context) {
    // Validate platform-specific optional fields
    // Example:
    if (frontmatter['allowed-tools'] !== undefined) {
      this.validateAllowedTools(frontmatter['allowed-tools'], context);
    }
    
    if (frontmatter['argument-hint'] !== undefined) {
      this.validateArgumentHint(frontmatter['argument-hint'], context);
    }
  }

  /**
   * Validate unknown fields
   * Warns about unknown fields but does NOT throw
   * 
   * @param {Object} frontmatter - Parsed frontmatter object
   * @param {Object} context - Validation context
   */
  validateUnknownFields(frontmatter, context) {
    // Define known fields for platform
    const knownFields = [
      'name',
      'description',
      // Add platform-specific fields here
    ];

    // Find unknown fields
    const unknownFields = Object.keys(frontmatter).filter(
      key => !knownFields.includes(key)
    );

    // Warn about each unknown field
    for (const field of unknownFields) {
      console.warn(
        `Unknown field "${field}" in ${context.file} (platform: ${this.platformName})`
      );
    }
  }
}
```

**Use field-validators.js for common validations:**

The base validator provides helper methods via `field-validators.js`:
- `validateAllowedTools(value, context)` - Validates tool field format
- `validateArgumentHint(value, context)` - Validates argument-hint format
- `validateStringField(field, value, context)` - Generic string validation

**Full independence:** Do NOT import from other platform validators. Each validator is self-contained.

---

### □ Step 4: Create Frontmatter Serializer

**File:** `bin/lib/serialization/{platform}-serializer.js`

**Purpose:** Convert frontmatter object to YAML string with platform-specific formatting

**Implementation:**

```javascript
/**
 * {Platform}-specific YAML frontmatter serializer
 * 
 * {Platform} formatting rules:
 * - Arrays: block style vs flow style
 * - Objects: block style with indentation
 * - Strings: quoting rules
 * - Special character handling
 * 
 * @module {platform}-serializer
 */

/**
 * Serialize frontmatter data to YAML string with {Platform}-specific formatting
 * 
 * @param {Object} data - Frontmatter data object
 * @returns {string} YAML string (without --- delimiters)
 * 
 * @example
 * // {Platform} (choose format)
 * serializeFrontmatter({skills: ['gsd-help', 'gsd-verify']})
 * // Block style => "skills:\n  - gsd-help\n  - gsd-verify"
 * // Flow style => "skills: ['gsd-help', 'gsd-verify']"
 */
export function serializeFrontmatter(data) {
  const lines = [];
  
  // Field ordering: standard fields first, then others
  const standardFields = ['name', 'description', 'tools', 'skills'];
  const allFields = new Set([...standardFields, ...Object.keys(data)]);
  
  for (const key of allFields) {
    if (!(key in data)) {
      continue; // Field not present in data
    }
    
    const value = data[key];
    
    // Skip undefined/null/empty
    if (value === undefined || value === null) {
      continue;
    }
    
    // Skip empty arrays
    if (Array.isArray(value) && value.length === 0) {
      continue;
    }
    
    // Format by type
    if (Array.isArray(value)) {
      lines.push(formatArray(key, value));
    } else if (typeof value === 'object' && value !== null) {
      lines.push(formatObject(key, value));
    } else {
      lines.push(formatScalar(key, value));
    }
  }
  
  return lines.join('\n');
}

/**
 * Format array field
 * Choose block style or flow style based on platform
 * 
 * @param {string} key - Field name
 * @param {Array} value - Array value
 * @returns {string} Formatted YAML
 * @private
 */
function formatArray(key, value) {
  // OPTION A: Block style (Claude)
  const items = value.map(item => `  - ${item}`).join('\n');
  return `${key}:\n${items}`;
  
  // OPTION B: Flow style (Copilot, Codex)
  // const items = value.map(item => `'${item}'`).join(', ');
  // return `${key}: [${items}]`;
}

/**
 * Format object field with indentation
 * 
 * @param {string} key - Field name
 * @param {Object} value - Object value
 * @returns {string} Formatted YAML
 * @private
 */
function formatObject(key, value) {
  const lines = [`${key}:`];
  for (const [k, v] of Object.entries(value)) {
    lines.push(`  ${k}: ${formatValue(v)}`);
  }
  return lines.join('\n');
}

/**
 * Format scalar field
 * 
 * @param {string} key - Field name
 * @param {*} value - Scalar value
 * @returns {string} Formatted YAML
 * @private
 */
function formatScalar(key, value) {
  return `${key}: ${formatValue(value)}`;
}

/**
 * Format a single value with proper quoting
 * 
 * @param {*} value - Value to format
 * @returns {string} Formatted value
 * @private
 */
function formatValue(value) {
  if (typeof value === 'string') {
    // Add quoting rules if needed
    // Example: quote strings with special chars
    if (value.includes(':') || value.includes('#')) {
      return `"${value}"`;
    }
    return value;
  }
  
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }
  
  if (typeof value === 'number') {
    return String(value);
  }
  
  return String(value);
}
```

**Platform-specific formatting examples:**

**Claude (block style):**
```yaml
skills:
  - gsd-help
  - gsd-verify
```

**Copilot (flow style):**
```yaml
skills: ['gsd-help', 'gsd-verify']
```

**Codex (flow style with double quotes):**
```yaml
skills: ["gsd-help", "gsd-verify"]
```

**Full independence:** Duplicate formatting logic is acceptable. Do NOT share code between serializers.

---

### □ Step 5: Create Frontmatter Cleaner

**File:** `bin/lib/serialization/{platform}-cleaner.js`

**Purpose:** Parse frontmatter, remove empty fields, rebuild using platform serializer

**Implementation:**

```javascript
import matter from 'gray-matter';
import { serializeFrontmatter } from './{platform}-serializer.js';

/**
 * Clean frontmatter by removing empty string fields
 * @param {string} content - Markdown file content with frontmatter
 * @returns {string} Content with cleaned frontmatter
 */
export function cleanFrontmatter(content) {
  try {
    const parsed = matter(content);
    const data = parsed.data;
    
    // Remove fields with empty string values
    const cleanedData = {};
    for (const [key, value] of Object.entries(data)) {
      // Special handling for argument-hint
      if (key === 'argument-hint') {
        if (value === '' || value === null || value === undefined) {
          continue; // Skip empty argument-hint
        } else if (Array.isArray(value)) {
          // Convert array back to string format if needed
          cleanedData[key] = '[' + value.join(', ') + ']';
        } else {
          cleanedData[key] = value;
        }
      }
      // Keep field if it has a non-empty value
      else if (value !== '' && value !== null && value !== undefined) {
        cleanedData[key] = value;
      }
      // Also keep if it's explicitly false or 0
      else if (value === false || value === 0) {
        cleanedData[key] = value;
      }
    }
    
    // Rebuild content with cleaned frontmatter using platform serializer
    const serialized = serializeFrontmatter(cleanedData);
    return `---\n${serialized}\n---\n\n${parsed.content}`;
  } catch (error) {
    // If parsing fails, return original content
    return content;
  }
}
```

**Key points:**
- Import platform-specific serializer
- Parse → Clean → Rebuild workflow
- Preserve body content unchanged
- Handle errors gracefully

**Full independence:** Each cleaner uses its own serializer. No shared cleaning logic.

---

### □ Step 6: Add Platform Detection

**File:** `bin/lib/platforms/binary-detector.js`

**Purpose:** Detect if platform CLI is installed

**Add detection function:**

```javascript
/**
 * Check if {Platform} CLI is installed
 * @returns {Promise<boolean>}
 */
export async function is{Platform}Installed() {
  try {
    const result = await execAsync('{platform-cli} --version');
    return result.code === 0;
  } catch (error) {
    return false;
  }
}
```

**Update detector exports:**

```javascript
// bin/lib/platforms/binary-detector.js
export async function detectInstalledPlatforms() {
  return {
    claude: await isClaudeInstalled(),
    copilot: await isCopilotInstalled(),
    codex: await isCodexInstalled(),
    {platform}: await is{Platform}Installed(), // Add new platform
  };
}
```

**Add installation path detection:**

```javascript
// bin/lib/platforms/platform-paths.js
const PLATFORM_DIRS = {
  claude: '.claude',
  copilot: '.github',
  codex: '.codex',
  {platform}: '.{platform}', // Add new platform
};
```

---

### □ Step 7: Update CLI Prompts

**File:** `bin/lib/cli/prompts.js`

**Add platform to selection:**

```javascript
const platformChoices = [
  { title: 'Claude Code', value: 'claude', description: 'Anthropic Claude Desktop' },
  { title: 'GitHub Copilot CLI', value: 'copilot', description: 'GitHub Copilot in terminal' },
  { title: 'Codex CLI', value: 'codex', description: 'OpenAI Codex command-line' },
  { 
    title: '{Platform Name}', 
    value: '{platform}', 
    description: '{Brief description}' 
  },
];
```

**Add help text:**

```javascript
const platformHelp = {
  claude: 'Install to .claude/ directory',
  copilot: 'Install to .github/ directory',
  codex: 'Install to .codex/ directory',
  {platform}: 'Install to .{platform}/ directory',
};
```

---

### □ Step 8: Write Tests

Create comprehensive test coverage for all new components.

#### Unit Tests: Validator

**File:** `tests/unit/{platform}-validator.test.js`

```javascript
import { describe, test, expect } from 'vitest';
import { {Platform}Validator } from '../../bin/lib/frontmatter/{platform}-validator.js';

describe('{Platform}Validator', () => {
  const validator = new {Platform}Validator();
  
  test('validates required fields', () => {
    const frontmatter = {
      name: 'test-skill',
      description: 'Test skill',
    };
    
    expect(() => {
      validator.validate(frontmatter, { file: 'test.md' });
    }).not.toThrow();
  });
  
  test('rejects missing required fields', () => {
    const frontmatter = { name: 'test-skill' };
    
    expect(() => {
      validator.validate(frontmatter, { file: 'test.md' });
    }).toThrow();
  });
  
  // Add more tests for platform-specific validation
});
```

#### Unit Tests: Serializer

**File:** `tests/unit/{platform}-serializer.test.js`

```javascript
import { describe, test, expect } from 'vitest';
import { serializeFrontmatter } from '../../bin/lib/serialization/{platform}-serializer.js';

describe('{Platform} Serializer', () => {
  test('serializes arrays in {block/flow} style', () => {
    const data = { skills: ['gsd-help', 'gsd-verify'] };
    const result = serializeFrontmatter(data);
    
    // For block style:
    expect(result).toContain('skills:\n  - gsd-help');
    
    // For flow style:
    // expect(result).toContain("skills: ['gsd-help', 'gsd-verify']");
  });
  
  test('serializes strings with proper quoting', () => {
    const data = { description: 'Test: description' };
    const result = serializeFrontmatter(data);
    
    // Verify quoting rules
    expect(result).toContain('description:');
  });
  
  test('omits empty arrays', () => {
    const data = { name: 'test', skills: [] };
    const result = serializeFrontmatter(data);
    
    expect(result).not.toContain('skills');
  });
  
  // Add more tests for nested objects, special characters, etc.
});
```

#### Unit Tests: Cleaner

**File:** `tests/unit/{platform}-cleaner.test.js`

```javascript
import { describe, test, expect } from 'vitest';
import { cleanFrontmatter } from '../../bin/lib/serialization/{platform}-cleaner.js';

describe('{Platform} Cleaner', () => {
  test('removes empty string fields', () => {
    const content = `---
name: test-skill
description: ''
---

# Skill content`;
    
    const result = cleanFrontmatter(content);
    
    expect(result).not.toContain('description:');
    expect(result).toContain('name: test-skill');
  });
  
  test('preserves non-empty fields', () => {
    const content = `---
name: test-skill
description: Valid description
---

# Content`;
    
    const result = cleanFrontmatter(content);
    
    expect(result).toContain('name: test-skill');
    expect(result).toContain('description: Valid description');
  });
  
  // Add more tests
});
```

#### Integration Tests

**File:** `tests/integration/install-platform.test.js`

Add test case for new platform:

```javascript
test('installs skills for {platform}', async () => {
  const result = await installSkills({
    platform: '{platform}',
    skills: ['gsd-help'],
    targetDir: './test-output/{platform}',
  });
  
  expect(result.success).toBe(true);
  expect(result.filesCreated).toContain('gsd-help/SKILL.md');
});
```

**Test coverage target:** 80%+ for all new files

**Run tests:**
```bash
npm test
npm run test:coverage
```

---

### □ Step 9: Update Documentation

#### Platform Differences

**File:** `docs/platform-specifics.md`

Add section for new platform:

```markdown
## {Platform Name}

### Overview

- **Target Directory:** `.{platform}/skills/`, `.{platform}/agents/`
- **Global Directory:** `~/.{platform}/`
- **Instructions File:** `{PLATFORM}.md`
- **Command Prefix:** `/{command-prefix}`
- **File Extensions:** `.md` for skills, `.agent.md` for agents
- **Frontmatter:** YAML with {description}

### Skill Frontmatter Example

\`\`\`yaml
---
name: /gsd-plan-phase
description: Create execution plans for a phase
# Add platform-specific fields
---
\`\`\`

### Official Supported Fields

- `name` (required): Skill name
- `description` (required): What the skill does
- {Add platform-specific fields}

### Path References

{Describe how path references work}

### Documentation Links

- Official Docs: {URL}
- GitHub: {URL}
```

#### README Updates

**File:** `README.md`

Add platform to supported platforms list:

```markdown
## Supported Platforms

- ✅ Claude Code (Anthropic)
- ✅ GitHub Copilot CLI (GitHub)
- ✅ Codex CLI (OpenAI)
- ✅ {Platform Name} ({Company})
```

#### Requirements

**File:** `REQUIREMENTS.md`

Add platform requirements:

```markdown
### {Platform Name}

**Required:**
- {Platform} CLI version X.X.X or higher
- {Other requirements}

**Installation:**
\`\`\`bash
{installation commands}
\`\`\`
```

---

### □ Step 10: Manual Testing

Run end-to-end tests with actual platform:

**Install with new platform:**
```bash
npx get-shit-done-multi --{platform}
```

**Verify skills install:**
```bash
ls .{platform}/skills/
# Check: gsd-help/, gsd-verify/, etc.
```

**Verify agents install:**
```bash
ls .{platform}/agents/
# Check: gsd-executor.agent.md, etc.
```

**Test with platform CLI:**
```bash
# Test skill invocation
{platform-cli} {command-prefix}gsd-help

# Verify frontmatter validation works
{platform-cli} validate .{platform}/skills/gsd-help/SKILL.md
```

**Verify frontmatter format:**
```bash
cat .{platform}/skills/gsd-help/SKILL.md
# Check: Arrays formatted correctly (block vs flow)
# Check: Quoting rules applied correctly
# Check: Field ordering matches platform expectations
```

**Test error handling:**
```bash
# Test with invalid frontmatter
# Verify validator catches errors
# Verify helpful error messages
```

---

## Code Examples

### Complete Adapter Implementation

See reference implementation: `bin/lib/platforms/claude-adapter.js`

Key features to replicate:
- Extend `PlatformAdapter` base class
- Import platform-specific serializer
- Implement all required methods
- Extract skills from agent content
- Use platform serializer for frontmatter

### Complete Validator Implementation

See reference implementation: `bin/lib/frontmatter/claude-validator.js`

Key features to replicate:
- Extend `BaseValidator` base class
- Define `supportedPlatforms` array
- Implement `validateOptionalFields()`
- Implement `validateUnknownFields()`
- Use field validators for common checks
- Warn, don't throw, for optional/unknown fields

### Complete Serializer Implementation

See reference implementation: `bin/lib/serialization/claude-serializer.js`

Key features to replicate:
- Export `serializeFrontmatter(data)` function
- Field ordering (standard fields first)
- Array formatting (block vs flow style)
- Object formatting (indented block style)
- Scalar formatting (proper quoting)
- Omit undefined/null/empty values
- Private helper functions for formatting

### Complete Cleaner Implementation

See reference implementation: `bin/lib/serialization/claude-cleaner.js`

Key features to replicate:
- Import platform-specific serializer
- Export `cleanFrontmatter(content)` function
- Parse with `gray-matter`
- Remove empty/null/undefined fields
- Special handling for `argument-hint`
- Rebuild using platform serializer
- Error handling (return original on failure)

---

## Testing Strategy

### Unit Testing

**Per-component isolation:**
- Test validators independently
- Test serializers independently
- Test cleaners independently
- Test adapters with mocked dependencies

**Coverage targets:**
- Validators: 80%+ line coverage
- Serializers: 90%+ line coverage (pure functions)
- Cleaners: 80%+ line coverage
- Adapters: 70%+ line coverage (integration points)

### Integration Testing

**End-to-end flows:**
- Install skills to platform directory
- Transform frontmatter correctly
- Validate installed files
- Clean frontmatter in installed files

**Platform combinations:**
- Test with platform CLI if available
- Test without platform CLI (install anyway)
- Test global vs local installation

### Manual Testing Checklist

- [ ] Skills install to correct directory
- [ ] Agents install to correct directory
- [ ] Frontmatter format matches platform expectations
- [ ] Skills work with platform CLI
- [ ] Agents work with platform CLI
- [ ] Error messages are helpful
- [ ] Validation catches invalid frontmatter
- [ ] Cleaning removes empty fields

**Run test suite:**
```bash
# All tests
npm test

# Specific platform
npm test -- {platform}

# Coverage report
npm run test:coverage
```

---

## Common Pitfalls

### ❌ DON'T: Share code between platform validators/serializers

**Bad:**
```javascript
// shared-validator.js
export function validateCommon(frontmatter) { ... }

// claude-validator.js
import { validateCommon } from './shared-validator.js';
```

**Why:** Breaks platform isolation. Changes to shared code affect all platforms.

**Good:**
```javascript
// claude-validator.js
validateOptionalFields(frontmatter, context) {
  // Duplicate validation logic here (OK!)
}
```

### ❌ DON'T: Use conditional logic instead of separate files

**Bad:**
```javascript
// shared-serializer.js
export function serializeFrontmatter(data, platform) {
  if (platform === 'claude') {
    // Claude formatting
  } else if (platform === 'copilot') {
    // Copilot formatting
  }
}
```

**Why:** Hard to maintain, test, and debug. Coupling between platforms.

**Good:**
```javascript
// claude-serializer.js
export function serializeFrontmatter(data) {
  // Claude formatting only
}

// copilot-serializer.js
export function serializeFrontmatter(data) {
  // Copilot formatting only
}
```

### ❌ DON'T: Forget to update CLI prompts

After adding adapter/validator/serializer, update:
- `bin/lib/cli/prompts.js` - Platform selection
- `bin/lib/platforms/binary-detector.js` - Platform detection
- `bin/lib/platforms/platform-paths.js` - Directory paths

### ❌ DON'T: Skip tests for platform-specific logic

Every platform needs:
- Validator tests
- Serializer tests
- Cleaner tests
- Integration tests

### ✅ DO: Duplicate code for platform isolation

Code duplication is **acceptable and preferred** when it maintains platform independence.

**Example:** Each serializer duplicates array formatting logic.

**Why:** Platform requirements change independently. Duplication prevents cascading failures.

### ✅ DO: Each platform is fully independent

No shared state. No shared logic. No conditional branches.

**Each platform gets:**
- Own adapter file
- Own validator file
- Own serializer file
- Own cleaner file
- Own test files

### ✅ DO: Update all three components

When adding a platform, implement:
1. **Adapter** (orchestration)
2. **Validator** (validation rules)
3. **Serializer + Cleaner** (formatting)

Missing any component breaks the platform.

---

## References

### Architecture Documentation

- **Architecture overview:** `docs/architecture.md`
- **Platform differences:** `docs/platform-specifics.md`
- **How GSD works:** `docs/how-gsd-works.md`

### Phase Summaries

- **Phase 11:** Per-platform validator pattern established
  - See: `.planning/phases/11-*/11-02-SUMMARY.md`
  - Established validator isolation philosophy

- **Phase 12:** Per-platform serializer pattern established
  - See: `.planning/phases/12-*/12-02-SUMMARY.md`
  - Applied isolation to serializers and cleaners

### Official Platform Documentation

- **Claude Code:** https://code.claude.com/docs
- **GitHub Copilot CLI:** https://docs.github.com/en/copilot/github-copilot-in-the-cli
- **Codex CLI:** https://platform.openai.com/docs/guides/codex

### Code References

- **Base classes:** `bin/lib/platforms/base-adapter.js`, `bin/lib/frontmatter/base-validator.js`
- **Field validators:** `bin/lib/frontmatter/field-validators.js`
- **Platform paths:** `bin/lib/platforms/platform-paths.js`
- **Template renderer:** `bin/lib/templates/template-renderer.js`

---

## Checklist Summary

Use this quick reference when adding a new platform:

- [ ] **Research:** Document platform specifications
- [ ] **Adapter:** Create `{platform}-adapter.js` extending `PlatformAdapter`
- [ ] **Validator:** Create `{platform}-validator.js` extending `BaseValidator`
- [ ] **Serializer:** Create `{platform}-serializer.js` with `serializeFrontmatter()`
- [ ] **Cleaner:** Create `{platform}-cleaner.js` with `cleanFrontmatter()`
- [ ] **Detection:** Add platform to `binary-detector.js` and `platform-paths.js`
- [ ] **CLI:** Update prompts in `prompts.js`
- [ ] **Tests:** Write unit tests for validator, serializer, cleaner
- [ ] **Integration:** Add platform to integration tests
- [ ] **Docs:** Update `platform-specifics.md`, `README.md`, `REQUIREMENTS.md`
- [ ] **Manual:** Test with actual platform CLI

**Expected time:** 4-6 hours for a complete platform implementation.

**Questions?** See existing implementations (claude, copilot, codex) as reference.

---

*Last updated: 2026-02-01*  
*Phase: 12-unify-frontmatter-structure-and-apply-adapter-pattern*
