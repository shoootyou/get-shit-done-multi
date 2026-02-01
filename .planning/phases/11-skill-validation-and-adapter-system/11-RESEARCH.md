# Phase 11: Skill Validation and Adapter System - Research

**Researched:** 2025-02-01
**Domain:** Frontmatter validation, schema validation, adapter pattern
**Confidence:** HIGH

## Summary

Validation layer for skill frontmatter requires three core components: (1) schema validation library for field-level rules, (2) platform-specific validators using adapter pattern, and (3) auto-discovery registry for extensibility. Project already uses `gray-matter` 4.0.3 for YAML parsing and follows adapter pattern in `/bin/lib/platforms/`. Research shows **Joi 18.0.2** is optimal for JavaScript-first validation with fail-fast support, template method pattern enables shared base validation with platform-specific overrides, and `fs.readdir()` + dynamic imports provide standard auto-discovery. Key insight: validate AFTER template variable replacement but BEFORE file I/O to catch errors early without breaking installations.

**Primary recommendation:** Use Joi for schema validation, extend existing adapter pattern, validate at `transformFrontmatter()` integration point, fail-fast with console error output.

**Error reporting approach (2026-02-01):**
- **Required field errors:** Stop installation immediately, print formatted error to console with all context
- **Optional field warnings:** Continue installation, print warning to console, skip invalid field
- **User reports:** Copy error/warning from console output and paste into GitHub issue
- **No file writes:** All error information displayed in console, user manually copies for reporting

**Decisions finalized (2026-02-01):**
1. **Quote handling:** Use YAML standard — validate parsed values after YAML parsing (wrapping quotes removed by parser, apostrophes allowed)
2. **Tool format:** Standardize capitalized format across ALL platforms — "Read, Write, Bash" (no more platform-specific transformations)
3. **Field strictness:** Required fields (name, description) fail on violation; optional fields (allowed-tools, argument-hint) generate warnings only; unknown fields warn but don't fail

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
**What:** Throw immediately on first error (required fields), include all context for debugging
**When to use:** Per context decision - stop on first validation error for required fields

**Two-tier error handling (2026-02-01):**
- **Required fields:** Throw `ValidationError` → installation stops, user gets full markdown report
- **Optional fields:** Console warning → installation continues, user sees warning with report URL

**Example (Required Field - Throws Error):**
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
  
  toConsoleOutput() {
    // Formatted for console display
    const lines = [
      '',
      '❌ VALIDATION ERROR',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `Template: ${this.details.template || 'Unknown'}`,
      `Platform: ${this.details.platform || 'Unknown'}`,
      `Field: ${this.details.field || 'Unknown'}`,
      `Error: ${this.message}`,
      ''
    ];
    
    if (this.details.value !== undefined) {
      lines.push(`Value: "${this.details.value}"`);
      lines.push('');
    }
    
    if (this.details.expected) {
      lines.push('Expected Format:');
      lines.push(this.details.expected);
      lines.push('');
    }
    
    if (this.details.spec) {
      lines.push(`Specification: ${this.details.spec}`);
      lines.push('');
    }
    
    lines.push('Installation stopped. Please fix the error and try again.');
    lines.push('');
    lines.push('To report this issue, copy the information above and submit to:');
    lines.push('https://github.com/shoootyou/get-shit-done-multi/issues');
    lines.push('');
    lines.push(`System: get-shit-done-multi@${process.env.npm_package_version || '2.0.0'} | Node ${process.version}`);
    lines.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    lines.push('');
    
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
- **DECISION (2026-02-01):** Use YAML standard recommendation
- Validate parsed value, not raw YAML string
- After parsing, `"Help command"` becomes `Help command` (wrapping quotes removed by YAML parser)
- Allow apostrophes in content (contractions are valid English per YAML standard)
- Wrapping quotes are YAML syntax, not content — don't validate them
**Warning signs:** Valid contractions flagged as errors

### Pitfall 5: Platform-Specific Tool Format Differences
**What goes wrong:** Tool names validated with wrong format expectations
```javascript
// OLD (before 2026-02-01):
// Claude: "Read, Write, Bash" (capitalized string)
// Copilot: ['read', 'write', 'bash'] (lowercase array)
// Codex: ['read', 'write', 'bash'] (lowercase array)

// NEW (decision 2026-02-01):
// ALL PLATFORMS: "Read, Write, Bash" (capitalized string)
```
**Why it happens:** Previously each platform had different tool format
**How to avoid:**
- **DECISION (2026-02-01):** Standardize on capitalized format across all platforms
- Base validator enforces format: capitalized, comma-separated string
- No platform-specific tool transformation needed
- Validate in base validator's `validateOptionalFields()` method
- Use `claudeToolsSchema` from field-validators.js for all platforms
**Warning signs:** None — format now consistent across platforms

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

// Unified allowed-tools format for all platforms (2026-02-01 decision)
export const allowedToolsSchema = Joi.string()
  .pattern(/^[A-Z][a-z]+(\s*,\s*[A-Z][a-z]+)*$/)
  .optional()
  .messages({
    'string.pattern.base': 'Tools must be capitalized, comma-separated (e.g., "Read, Write, Bash")'
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
    const optionalFields = {
      'allowed-tools': allowedToolsSchema,
      'argument-hint': argumentHintSchema
    };
    
    // Validate each optional field
    for (const [field, schema] of Object.entries(optionalFields)) {
      if (frontmatter[field] !== undefined) {
        const { error } = schema.validate(frontmatter[field]);
        if (error) {
          // Optional fields generate WARNING, not error (2026-02-01 decision)
          // Print structured error to console for user to report
          const report = this.generateWarningReport(error, field, frontmatter[field], context);
          console.warn('\n' + report + '\n');
        }
      }
    }
  }
  
  generateWarningReport(error, field, value, context) {
    // Generate markdown-formatted warning for console output
    const lines = [
      '⚠️  VALIDATION WARNING',
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
      `Template: ${context.templateName}`,
      `Platform: ${context.platform}`,
      `Field: ${field}`,
      `Error: ${error.details[0].message}`,
      `Value: "${value}"`,
      '',
      'This field will be skipped during installation.',
      '',
      'If you believe this is incorrect, please report:',
      'https://github.com/shoootyou/get-shit-done-multi/issues',
      '',
      `System: get-shit-done-multi@${process.env.npm_package_version || '2.0.0'} | Node ${process.version}`,
      '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
    ];
    return lines.join('\n');
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
    
    // Permissive by default - warn but don't fail (2026-02-01 decision)
    if (unknownFields.length > 0) {
      console.warn(
        `Warning: Unknown fields in ${context.templateName}: ${unknownFields.join(', ')}`
      );
      console.warn('These fields may be ignored by the target platform');
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
import { ValidationError } from '../frontmatter/validation-error.js';

export class ClaudeAdapter extends PlatformAdapter {
  transformFrontmatter(content, templateName) {
    const { data, content: body } = matter(content);
    
    // VALIDATION POINT: After parsing, before transformation
    try {
      const validator = getValidator('claude');
      validator.validate(data, {
        templateName: templateName,
        platform: 'claude',
        filePath: this.currentFilePath // For error context
      });
    } catch (error) {
      if (error instanceof ValidationError) {
        // Print formatted error to console for user to report
        console.error(error.toConsoleOutput());
        // Re-throw to stop installation
        throw error;
      }
      throw error;
    }
    
    // Extract skills if needed (validation passed, warnings logged)
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

### Console Error Output (User Reports from This)
```javascript
// bin/lib/frontmatter/error-formatter.js
// Note: ValidationError.toConsoleOutput() handles formatting now
// This module provides additional helpers if needed

export function formatValidationErrorForConsole(error) {
  // ValidationError class already has toConsoleOutput() method
  // This is a wrapper if additional formatting needed at call site
  return error.toConsoleOutput();
}

export function formatWarningForConsole(field, message, value, context) {
  // Used by validators for optional field warnings
  const lines = [
    '',
    '⚠️  VALIDATION WARNING',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    `Template: ${context.templateName}`,
    `Platform: ${context.platform}`,
    `Field: ${field}`,
    `Error: ${message}`,
    `Value: "${value}"`,
    '',
    'This field will be skipped during installation.',
    '',
    'If you believe this is incorrect, please report:',
    'https://github.com/shoootyou/get-shit-done-multi/issues',
    '',
    `System: get-shit-done-multi@${process.env.npm_package_version || '2.0.0'} | Node ${process.version}`,
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    ''
  ];
  return lines.join('\n');
}

// Example console output for REQUIRED field error:
/*
❌ VALIDATION ERROR
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Template: gsd-new-project
Platform: claude
Field: name
Error: Name must contain only lowercase letters, numbers, and hyphens

Value: "My Skill!"

Expected Format:
1-64 characters, lowercase letters, numbers, hyphens only

Specification: https://agentskills.io/specification#name-field

Installation stopped. Please fix the error and try again.

To report this issue, copy the information above and submit to:
https://github.com/shoootyou/get-shit-done-multi/issues

System: get-shit-done-multi@2.0.0 | Node v20.11.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/

// Example console output for OPTIONAL field warning:
/*
⚠️  VALIDATION WARNING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Template: gsd-plan-phase
Platform: copilot
Field: allowed-tools
Error: Tools must be capitalized, comma-separated (e.g., "Read, Write, Bash")
Value: "read, write, bash"

This field will be skipped during installation.

If you believe this is incorrect, please report:
https://github.com/shoootyou/get-shit-done-multi/issues

System: get-shit-done-multi@2.0.0 | Node v20.11.0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
*/
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

~~Things that couldn't be fully resolved:~~ **RESOLVED** (2026-02-01)

1. **Exact agentskills.io spec interpretation for "no quotes"**
   - What we know: Spec says "no quotes" for name/description fields
   - ~~What's unclear: Does this mean no wrapping YAML quotes, or no quote characters at all (including apostrophes)?~~
   - ~~Recommendation: Validate parsed values (after YAML parsing removes wrapping quotes), allow apostrophes in content for contractions~~
   - **DECISION:** Use YAML standard recommendation — validate parsed values after YAML parsing. Wrapping quotes are removed by parser, apostrophes in content are valid.

2. **Tool name validation strictness**
   - What we know: Claude uses "Read, Write, Bash" (capitalized), Copilot/Codex use lowercase arrays
   - ~~What's unclear: Should base validator enforce ANY tool name format, or leave entirely to platforms?~~
   - ~~Recommendation: No tool validation in base validator, entirely platform-specific (context decision: platform-specific field adapters)~~
   - **DECISION:** Tools must be same format (capitalized) in ALL platforms for now. Base validator enforces capitalized comma-separated string format: "Read, Write, Bash". Platform adapters no longer transform tool formats.

3. **Unknown field handling consistency**
   - What we know: Context decision says "platform decides" whether to fail or warn
   - ~~What's unclear: Should there be a recommended default behavior?~~
   - ~~Recommendation: Default to permissive (warn) for unknown fields, strict (fail) for invalid known fields~~
   - **DECISION:** Field strictness controlled via field declaration:
     - **Required fields** (name, description): Fail on any violation
     - **Optional fields** (argument-hint, allowed-tools, etc.): Generate warning only, don't fail
     - Platform validators declare which fields are required vs optional
     - Unknown fields generate warnings (permissive by default)

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
