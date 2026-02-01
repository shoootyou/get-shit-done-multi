# Phase 11: Skill Validation and Adapter System - Research

**Researched:** 2025-02-01
**Domain:** Frontmatter validation, schema validation, adapter pattern
**Confidence:** HIGH

## Summary

Validation layer for skill frontmatter requires three core components: (1) schema validation library for field-level rules, (2) platform-specific validators using adapter pattern, and (3) auto-discovery registry for extensibility. Project already uses `gray-matter` 4.0.3 for YAML parsing and follows adapter pattern in `/bin/lib/platforms/`. Research shows **Joi 18.0.2** is optimal for JavaScript-first validation with fail-fast support, template method pattern enables shared base validation with platform-specific overrides, and `fs.readdir()` + dynamic imports provide standard auto-discovery. Key insight: validate AFTER template variable replacement but BEFORE file I/O to catch errors early without breaking installations.

**Primary recommendation:** Use Joi for schema validation, extend existing adapter pattern, validate at `transformFrontmatter()` integration point, fail-fast with markdown bug report generation.

## Standard Stack

The established libraries/tools for frontmatter validation:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gray-matter | 4.0.3 | Parse YAML frontmatter from markdown | Industry standard (11k+ GitHub stars), used by Jekyll, Hugo, static site generators |
| joi | 18.0.2 | Schema validation with fail-fast | JavaScript-first design, battle-tested (hapi ecosystem), readable API, built-in `abortEarly` option |
| js-yaml | 4.1.1 | YAML parsing/serialization | Already in project, needed for edge cases gray-matter doesn't handle |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fs-extra | 11.3.3 | File system operations | Already in project, needed for auto-discovery (readdir) |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Joi | AJV 8.17.1 | AJV faster (compiles schemas), but JSON Schema syntax more verbose. Choose if performance critical or JSON Schema standard required. |
| Joi | Zod 4.3.6 | Zod has TypeScript type inference, but benefits lost in pure JS project. Project is ESM JavaScript only, not TypeScript. |

**Installation:**
```bash
npm install joi@18.0.2
```

**Why Joi over alternatives:**
- Project is pure ESM JavaScript (no TypeScript compilation)
- Joi's JavaScript-first API most readable: `Joi.string().min(1).max(64).pattern(/^[a-z0-9-]+$/)`
- Built-in fail-fast mode: `validate(data, schema, { abortEarly: true })`
- Battle-tested in production (hapi framework ecosystem)
- Custom error messages straightforward: `.messages({ 'string.pattern.base': 'Custom message' })`

## Architecture Patterns

### Recommended Project Structure
```
bin/lib/frontmatter/
├── base-validator.js           # Abstract base class (template method pattern)
├── claude-validator.js         # Claude-specific rules
├── copilot-validator.js        # Copilot-specific rules
├── codex-validator.js          # Codex-specific rules
├── validation-error.js         # Custom error class
├── error-formatter.js          # Markdown bug report generator
├── field-validators.js         # Reusable Joi schemas
└── validators-registry.js      # Auto-discovery + registration
```

### Pattern 1: Template Method with Base Validator
**What:** Base class defines validation sequence, subclasses override specific steps
**When to use:** Multiple validators share common structure but differ in details

**Example:**
```javascript
// base-validator.js
export class BaseValidator {
  constructor(platform) {
    this.platform = platform;
  }
  
  // Template method - defines algorithm skeleton
  validate(frontmatter, context) {
    // 1. Structural validation (shared)
    this.validateStructure(frontmatter, context);
    
    // 2. Required fields (shared)
    this.validateRequiredFields(frontmatter, context);
    
    // 3. Optional fields (platform-specific hook)
    this.validateOptionalFields(frontmatter, context);
    
    // 4. Unknown fields (platform-specific hook)
    this.validateUnknownFields(frontmatter, context);
  }
  
  // Shared implementation
  validateStructure(frontmatter, context) {
    if (!frontmatter || typeof frontmatter !== 'object') {
      throw new ValidationError('Frontmatter must be an object', {
        field: 'frontmatter',
        template: context.templateName
      });
    }
    
    if (Object.keys(frontmatter).length === 0) {
      throw new ValidationError('Frontmatter cannot be empty', {
        field: 'frontmatter',
        template: context.templateName
      });
    }
  }
  
  validateRequiredFields(frontmatter, context) {
    // Use Joi schema for name validation
    const nameSchema = Joi.string()
      .min(1)
      .max(64)
      .pattern(/^[a-z0-9-]+$/)
      .required()
      .messages({
        'string.pattern.base': 'Name must contain only letters, numbers, and hyphens',
        'string.max': 'Name must be 1-64 characters (current: {#value.length})',
        'any.required': 'Name field is required'
      });
    
    const { error } = nameSchema.validate(frontmatter.name, { abortEarly: true });
    if (error) {
      throw new ValidationError(error.details[0].message, {
        field: 'name',
        value: frontmatter.name,
        template: context.templateName,
        spec: 'https://agentskills.io/specification#name-field'
      });
    }
    
    // Similar for description...
  }
  
  // Hook methods - must override
  validateOptionalFields(frontmatter, context) {
    throw new Error(`${this.platform}: validateOptionalFields() must be implemented`);
  }
  
  validateUnknownFields(frontmatter, context) {
    throw new Error(`${this.platform}: validateUnknownFields() must be implemented`);
  }
}
```

### Pattern 2: Auto-Discovery Registry
**What:** Scan directory for `*-validator.js` files, dynamically import and register
**When to use:** Extensible plugin architecture, avoid manual registration

**Example:**
```javascript
// validators-registry.js
import { readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const validators = new Map();

export async function loadValidators() {
  const files = await readdir(__dirname);
  
  for (const file of files) {
    if (!file.endsWith('-validator.js') || file === 'base-validator.js') {
      continue;
    }
    
    // Dynamic import
    const module = await import(`./${file}`);
    
    // Get validator class (e.g., ClaudeValidator from claude-validator.js)
    const ValidatorClass = Object.values(module).find(
      exp => exp.prototype instanceof BaseValidator
    );
    
    if (!ValidatorClass || !ValidatorClass.supportedPlatforms) {
      console.warn(`Skipping ${file}: no valid validator class found`);
      continue;
    }
    
    // Register for each supported platform
    for (const platform of ValidatorClass.supportedPlatforms) {
      validators.set(platform, new ValidatorClass());
    }
  }
}

export function getValidator(platform) {
  const validator = validators.get(platform);
  if (!validator) {
    throw new Error(`No validator registered for platform: ${platform}`);
  }
  return validator;
}
```

### Pattern 3: Fail-Fast with ValidationError
**What:** Throw immediately on first error, include all context for debugging
**When to use:** Per context decision - stop on first validation error

**Example:**
```javascript
// validation-error.js
export class ValidationError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
  
  toMarkdownReport() {
    const lines = [
      '# Validation Error Report',
      '',
      `**Template:** ${this.details.template || 'Unknown'}`,
      `**Field:** ${this.details.field || 'Unknown'}`,
      `**Error:** ${this.message}`,
      ''
    ];
    
    if (this.details.value !== undefined) {
      lines.push(`**Actual Value:** \`${this.details.value}\``);
      lines.push('');
    }
    
    if (this.details.expected) {
      lines.push('**Expected Format:**');
      lines.push(this.details.expected);
      lines.push('');
    }
    
    if (this.details.spec) {
      lines.push(`**Specification:** ${this.details.spec}`);
      lines.push('');
    }
    
    lines.push('## System Information');
    lines.push(`- Package: get-shit-done-multi@${process.env.npm_package_version || '2.0.0'}`);
    lines.push(`- Platform: ${this.details.platform || 'Unknown'}`);
    lines.push(`- Node: ${process.version}`);
    lines.push('');
    lines.push('## Report Issue');
    lines.push('https://github.com/shoootyou/get-shit-done-multi/issues');
    
    return lines.join('\n');
  }
}
```

### Pattern 4: Integration with Platform Adapters
**What:** Call validator during `transformFrontmatter()` before file operations
**When to use:** Validate after template variables replaced, before disk writes

**Example:**
```javascript
// claude-adapter.js (modified)
import { getValidator } from '../frontmatter/validators-registry.js';

export class ClaudeAdapter extends PlatformAdapter {
  transformFrontmatter(content) {
    const { data, content: body } = matter(content);
    
    // Validate frontmatter BEFORE transformation
    const validator = getValidator('claude');
    validator.validate(data, {
      templateName: this.currentTemplateName,
      platform: 'claude'
    });
    
    // Extract skills if needed
    if (!data.skills) {
      const skillReferences = this.extractSkillReferences(body);
      if (skillReferences.length > 0) {
        data.skills = skillReferences;
      }
    }
    
    // Serialize and return
    const frontmatter = serializeFrontmatter(data, 'claude');
    return `---\n${frontmatter}\n---\n\n${body}`;
  }
}
```

### Anti-Patterns to Avoid
- **Validating before template variables replaced:** Check for `{{VARIABLE}}` patterns and skip content validation if present
- **Hardcoded platform names:** Always import from `platform-names.js`
- **Validating after file I/O:** Validate during transformation, not after installation
- **Generic error messages:** Always include field name, actual value, expected format, spec URL
- **Type coercion:** Validate actual parsed types (YAML converts "2.0.0" to number 2.0)

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Schema validation | Custom if/else chains checking each field | Joi schemas with `.validate()` | Joi handles edge cases (type coercion, nested objects, array validation), provides consistent error messages, supports custom messages, has fail-fast mode |
| YAML parsing | Regex to extract frontmatter | gray-matter library | Handles delimiters, different YAML formats, edge cases (multiline strings, special characters), already in project |
| File discovery | Manual list of validator files | fs.readdir() + dynamic import() | Automatic, extensible, no updates needed when adding validators |
| Error formatting | String concatenation | Template literals + class methods | Consistent format, reusable, supports markdown/JSON output |
| Field regex patterns | Individual regex per validator | Shared field-validators.js module | DRY principle, consistent rules across platforms, single source of truth |

**Key insight:** Joi handles many validation edge cases that custom code would miss:
- Type checking after YAML parsing (string vs number vs boolean)
- Consistent error message formatting
- Conditional validation (field A required if field B present)
- Array element validation
- Nested object validation
- Custom error messages per rule violation

## Common Pitfalls

### Pitfall 1: YAML Type Coercion
**What goes wrong:** YAML automatically converts strings that look like numbers, dates, or booleans
```yaml
version: 2.0.0    # Parsed as number 2.0, not string "2.0.0"
date: 2025-01-31  # Parsed as Date object
enabled: true     # Boolean, not string "true"
```
**Why it happens:** YAML spec defines implicit typing rules, gray-matter follows spec
**How to avoid:** 
- Validate parsed types, not raw YAML strings
- Check `typeof field === 'string'` before regex validation
- Use Joi type validation: `Joi.string()` fails if field is number/boolean
**Warning signs:** Regex validation passes on raw YAML but fails on parsed object

### Pitfall 2: Validating Before Template Variables Replaced
**What goes wrong:** Validator checks `{{SKILL_NAME}}` against regex, fails because contains braces
```markdown
---
name: {{SKILL_NAME}}
description: {{DESCRIPTION}}
---
```
**Why it happens:** Validation called on raw template before rendering
**How to avoid:**
- Context decision specifies: validate both raw AND rendered
- Raw validation: structural only (has delimiters, not empty)
- Rendered validation: content rules (length, patterns, required fields)
- Check for template variable pattern: `/\{\{[A-Z_]+\}\}/`
**Warning signs:** Validation fails on templates that work fine after installation

### Pitfall 3: Multiline Strings in Single-Line Fields
**What goes wrong:** Spec requires single-line but YAML allows multiline syntax
```yaml
description: This is a long description
  that continues here
```
**Why it happens:** YAML multiline strings (folded/literal style) parse to strings with `\n`
**How to avoid:**
- Check parsed value for line breaks: `if (field.includes('\n'))`
- Joi pattern with anchors: `Joi.string().pattern(/^[^\\n]+$/)`
- Error message: "Field must be single line (no line breaks)"
**Warning signs:** Validation passes but rendered output has unexpected formatting

### Pitfall 4: Quote Handling Confusion
**What goes wrong:** Spec says "no quotes" but unclear if that means wrapping quotes or apostrophes in content
```yaml
# Which is invalid?
description: "Help command"        # Wrapped in YAML quotes
description: Don't use this       # Contains apostrophe
```
**Why it happens:** Ambiguous spec language, different interpretation of "quotes"
**How to avoid:**
- Validate parsed value, not raw YAML string
- After parsing, `"Help command"` becomes `Help command` (quotes removed)
- Allow apostrophes in content (contractions are valid English)
- Reject if field starts/ends with quote characters: `/^["']|["']$/`
**Warning signs:** Valid contractions flagged as errors

### Pitfall 5: Platform-Specific Tool Format Differences
**What goes wrong:** Tool names validated with wrong format expectations
```javascript
// Claude: "Read, Write, Bash" (capitalized string)
// Copilot: ['read', 'write', 'bash'] (lowercase array)
// Codex: ['read', 'write', 'bash'] (lowercase array)
```
**Why it happens:** Each platform has different tool format, base validator doesn't know platform context
**How to avoid:**
- Don't validate tools in base validator
- Platform-specific validators handle tool format
- Validate AFTER adapter's `transformTools()` method
- Each validator knows its platform's format
**Warning signs:** Validation fails only on specific platforms

### Pitfall 6: Auto-Discovery Import Path Issues
**What goes wrong:** Dynamic imports fail because paths don't resolve correctly
```javascript
// Breaks if CWD different from module location
await import(`./validators/${filename}`);
```
**Why it happens:** Relative imports resolve from CWD, not module location
**How to avoid:**
- Use `import.meta.url` to get module location
- Resolve absolute paths: `fileURLToPath(import.meta.url)`
- Join with validator directory: `join(__dirname, filename)`
**Warning signs:** Auto-discovery works in development but fails in production

### Pitfall 7: Empty Frontmatter Silently Passing
**What goes wrong:** gray-matter parses empty frontmatter as `{}` without error
```markdown
---
---

Body content here
```
**Why it happens:** Technically valid YAML (empty object), but violates spec requirements
**How to avoid:**
- Check `Object.keys(frontmatter).length > 0` in `validateStructure()`
- Require minimum fields: name and description
- Fail with clear error: "Frontmatter cannot be empty - must include name and description"
**Warning signs:** Files pass validation but fail at runtime

## Code Examples

Verified patterns from research and existing codebase:

### Joi Field Validation Schema
```javascript
// bin/lib/frontmatter/field-validators.js
import Joi from 'joi';

// Name field: 1-64 chars, letters/numbers/hyphens only
export const nameSchema = Joi.string()
  .min(1)
  .max(64)
  .pattern(/^[a-z0-9-]+$/)
  .required()
  .messages({
    'string.pattern.base': 'Name must contain only lowercase letters, numbers, and hyphens',
    'string.min': 'Name must be at least 1 character',
    'string.max': 'Name must be 1-64 characters (current: {#limit} exceeded)',
    'any.required': 'Name field is required'
  });

// Description field: max 1024 chars, single line, limited special chars
export const descriptionSchema = Joi.string()
  .max(1024)
  .pattern(/^[a-zA-Z0-9\s\-.,;:()]+$/)
  .pattern(/^[^\n]+$/)
  .required()
  .messages({
    'string.pattern.base': 'Description contains invalid characters - use letters, numbers, spaces, hyphens, periods, commas only',
    'string.max': 'Description must be max 1024 characters (current: {#limit} exceeded)',
    'any.required': 'Description field is required'
  });

// Optional argument-hint field
export const argumentHintSchema = Joi.string()
  .allow('')
  .optional();

// Platform-specific allowed-tools (Claude format)
export const claudeToolsSchema = Joi.string()
  .pattern(/^[A-Z][a-z]+(\s*,\s*[A-Z][a-z]+)*$/)
  .optional()
  .messages({
    'string.pattern.base': 'Tools must be capitalized, comma-separated (e.g., "Read, Write, Bash")'
  });

// Platform-specific allowed-tools (Copilot/Codex format)
export const arrayToolsSchema = Joi.array()
  .items(Joi.string().lowercase())
  .optional()
  .messages({
    'array.base': 'Tools must be an array of lowercase strings (e.g., ["read", "write", "bash"])'
  });
```

### Platform Validator Implementation
```javascript
// bin/lib/frontmatter/claude-validator.js
import { BaseValidator } from './base-validator.js';
import { claudeToolsSchema } from './field-validators.js';
import { ValidationError } from './validation-error.js';

export class ClaudeValidator extends BaseValidator {
  static supportedPlatforms = ['claude'];
  
  constructor() {
    super('claude');
  }
  
  validateOptionalFields(frontmatter, context) {
    // Claude allows 'allowed-tools' field (string format)
    if (frontmatter['allowed-tools']) {
      const { error } = claudeToolsSchema.validate(frontmatter['allowed-tools']);
      if (error) {
        throw new ValidationError(error.details[0].message, {
          field: 'allowed-tools',
          value: frontmatter['allowed-tools'],
          template: context.templateName,
          platform: 'claude',
          expected: 'Capitalized, comma-separated: "Read, Write, Bash"',
          spec: 'https://code.claude.com/docs/en/slash-commands#frontmatter-reference'
        });
      }
    }
    
    // Claude allows 'argument-hint' field
    // No special validation needed (any string valid)
  }
  
  validateUnknownFields(frontmatter, context) {
    const knownFields = [
      'name',
      'description',
      'allowed-tools',
      'argument-hint',
      'skills'
    ];
    
    const unknownFields = Object.keys(frontmatter).filter(
      field => !knownFields.includes(field)
    );
    
    // Claude is permissive - warn but don't fail
    if (unknownFields.length > 0) {
      console.warn(
        `Warning: Unknown fields in ${context.templateName}: ${unknownFields.join(', ')}`
      );
      console.warn('These fields may be ignored by Claude Code');
    }
  }
}
```

### Integration with Adapter transformFrontmatter()
```javascript
// bin/lib/platforms/claude-adapter.js (modified)
import matter from 'gray-matter';
import { PlatformAdapter } from './base-adapter.js';
import { serializeFrontmatter } from '../rendering/frontmatter-serializer.js';
import { getValidator } from '../frontmatter/validators-registry.js';

export class ClaudeAdapter extends PlatformAdapter {
  transformFrontmatter(content, templateName) {
    const { data, content: body } = matter(content);
    
    // VALIDATION POINT: After parsing, before transformation
    const validator = getValidator('claude');
    validator.validate(data, {
      templateName: templateName,
      platform: 'claude',
      filePath: this.currentFilePath // For error context
    });
    
    // Extract skills if needed
    if (!data.skills) {
      const skillReferences = this.extractSkillReferences(body);
      if (skillReferences.length > 0) {
        data.skills = skillReferences;
      }
    }
    
    // Serialize and return
    const frontmatter = serializeFrontmatter(data, 'claude');
    return `---\n${frontmatter}\n---\n\n${body}`;
  }
}
```

### Markdown Bug Report Generation
```javascript
// bin/lib/frontmatter/error-formatter.js
import { readPackageJson } from '../utils/package-reader.js';

export function generateBugReport(error, context) {
  const pkg = readPackageJson();
  
  const report = `
# Validation Error Report

**Generated:** ${new Date().toISOString()}

## Error Details

- **Template:** ${context.templateName}
- **Platform:** ${context.platform}
- **Field:** ${error.details.field || 'Unknown'}
- **Error:** ${error.message}

${error.details.value !== undefined ? `**Actual Value:**
\`\`\`
${error.details.value}
\`\`\`
` : ''}

${error.details.expected ? `**Expected Format:**
${error.details.expected}
` : ''}

${error.details.spec ? `**Specification:**
${error.details.spec}
` : ''}

## System Information

- **Package:** ${pkg.name}@${pkg.version}
- **Node.js:** ${process.version}
- **Platform:** ${process.platform}
- **Architecture:** ${process.arch}

## Next Steps

1. Review the error details above
2. Check the specification link for correct format
3. Update the template file: \`templates/skills/${context.templateName}/SKILL.md\`
4. If you believe this is a bug, copy this report and submit an issue:
   https://github.com/shoootyou/get-shit-done-multi/issues

---
*Report generated by get-shit-done-multi validation system*
`.trim();
  
  return report;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Custom validation logic per validator | Joi schema-based validation | 2024+ | Consistent error messages, handles edge cases, reduces code duplication |
| Manual validator registration | Auto-discovery with fs.readdir() | 2023+ | Extensible, no code changes to add validators |
| String concatenation errors | Structured ValidationError class | 2024+ | Machine-readable, supports multiple formats (markdown/JSON) |
| Validate after installation | Validate during transformation | 2024+ | Fail-fast prevents partial installs, better UX |

**Deprecated/outdated:**
- **validate.js:** Older validation library, replaced by Joi/AJV/Zod ecosystem
- **Manual if/else validation:** Replaced by schema-based validation
- **Callback-based async validation:** Use async/await patterns (Node 20+ requirement matches project)

## Open Questions

Things that couldn't be fully resolved:

1. **Exact agentskills.io spec interpretation for "no quotes"**
   - What we know: Spec says "no quotes" for name/description fields
   - What's unclear: Does this mean no wrapping YAML quotes, or no quote characters at all (including apostrophes)?
   - Recommendation: Validate parsed values (after YAML parsing removes wrapping quotes), allow apostrophes in content for contractions

2. **Tool name validation strictness**
   - What we know: Claude uses "Read, Write, Bash" (capitalized), Copilot/Codex use lowercase arrays
   - What's unclear: Should base validator enforce ANY tool name format, or leave entirely to platforms?
   - Recommendation: No tool validation in base validator, entirely platform-specific (context decision: platform-specific field adapters)

3. **Unknown field handling consistency**
   - What we know: Context decision says "platform decides" whether to fail or warn
   - What's unclear: Should there be a recommended default behavior?
   - Recommendation: Default to permissive (warn) for unknown fields, strict (fail) for invalid known fields

## Sources

### Primary (HIGH confidence)
- **gray-matter npm:** https://www.npmjs.com/package/gray-matter - Version 4.0.3 verified, feature set documented
- **Joi documentation:** https://joi.dev/api/ - API reference for schema validation patterns
- **Node.js fs module:** https://nodejs.org/docs/latest-v20.x/api/fs.html - fs.readdir() with recursive option for auto-discovery
- **Existing codebase:**
  - `bin/lib/platforms/base-adapter.js` - Adapter pattern reference
  - `bin/lib/errors/install-error.js` - Custom error class pattern
  - `bin/lib/validation/error-logger.js` - Error formatting conventions
  - `bin/lib/utils/file-scanner.js` - File discovery patterns

### Secondary (MEDIUM confidence)
- **agentskills.io specification:** https://agentskills.io/specification - Base spec for frontmatter validation (referenced in context, not verified against live site)
- **Claude frontmatter reference:** https://code.claude.com/docs/en/slash-commands#frontmatter-reference - Platform-specific extensions (referenced in context)

### Tertiary (LOW confidence)
- npm version checks for joi, ajv, zod - Versions verified via npm registry API (accurate as of research date)
- Validation library comparisons - Based on documented features + common usage patterns, not benchmarked

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Libraries verified in existing package.json (gray-matter, js-yaml) and npm registry (Joi versions)
- Architecture: HIGH - Patterns derived from existing codebase (adapter pattern in platforms/, error handling in validation/)
- Pitfalls: HIGH - Based on YAML spec behavior (type coercion documented), gray-matter behavior (tested in project), common validation errors (standard patterns)
- Don't hand-roll: HIGH - Joi feature set documented, edge cases well-known in validation domain
- Code examples: HIGH - Adapted from existing codebase patterns, Joi API documented

**Research date:** 2025-02-01
**Valid until:** 2025-03-01 (30 days - stable domain, Joi/gray-matter mature libraries with infrequent breaking changes)

**Notes:**
- Project uses ESM modules exclusively (type: "module" in package.json)
- Node.js 20+ requirement enables modern async/await, fs.readdir recursive option
- Existing adapter pattern in `/bin/lib/platforms/` provides strong architectural precedent
- Context decisions constrain implementation: fail-fast, markdown bug reports, validation at transformFrontmatter()
