# Template System for Spec Migration

A flexible, section-based template generation system for creating standardized TypeSpec migration documentation from OpenAPI specifications.

## Overview

The template system provides:

- **Data Structures**: Type-safe template definitions with JSDoc
- **Generator Engine**: Extract data from OpenAPI specs and render documents
- **Registry Management**: Store, retrieve, and version templates
- **Validation**: Ensure template and content integrity
- **Unified API**: Simple integration via `createTemplateSystem`

## Architecture

```
lib-ghcc/templates/
├── types.js          - Type definitions and constants
├── generator.js      - Document generation engine
├── registry.js       - Template storage and retrieval
├── validator.js      - Validation logic
├── index.js          - Unified API
└── __tests__/
    └── verify.js     - Structure verification
```

## Quick Start

```javascript
import { createTemplateSystem } from './lib-ghcc/templates/index.js';

// Create system instance
const system = await createTemplateSystem('.planning/templates');

// Initialize (creates default template)
await system.initialize();

// Generate document from OpenAPI spec
const result = await system.generateDocument(
  'spec-migration-v1',
  openApiSpec,
  { /* options */ }
);

if (result.success) {
  console.log(result.output); // Generated markdown document
}
```

## Core Components

### Types (`types.js`)

Defines data structures for the template system:

- **TemplateSection**: Section definition with metadata
- **SpecMigrationTemplate**: Complete template structure
- **ValidationSchema**: Validation rules
- **TemplateRegistry**: Registry structure
- **Constants**: `SECTION_TYPES`, `VALIDATION_TYPES`

### Generator (`generator.js`)

Generates documents from templates and OpenAPI specs:

```javascript
import { TemplateGenerator, createDefaultTemplate } from './generator.js';

const template = createDefaultTemplate();
const generator = new TemplateGenerator(template);

const result = await generator.generate({
  openApiSpec: mySpec,
  options: {},
  metadata: {}
});
```

**Features:**
- Extract endpoints from OpenAPI paths
- Extract schemas from components/definitions
- Render sections (markdown, table, list, YAML, code)
- Validate data against schema
- Collect errors and warnings

### Registry (`registry.js`)

Manages template storage and lifecycle:

```javascript
import { TemplateRegistry, createRegistry } from './registry.js';

const registry = new TemplateRegistry('.planning/templates');
await registry.initialize();

// Register template
await registry.registerTemplate(template, 'my-template.json', ['tag1']);

// Retrieve template
const template = await registry.getTemplate('spec-migration-v1');

// Search templates
const results = await registry.searchTemplates('migration');
```

**Features:**
- Atomic file operations via `state-io`
- Version management
- Tag-based discovery
- Activation/deactivation (soft delete)
- Template statistics

### Validator (`validator.js`)

Validates templates and generated content:

```javascript
import { validateTemplate, validateContent, validateOpenApiSpec } from './validator.js';

// Validate template structure
const templateResult = validateTemplate(template);

// Validate generated content
const contentResult = validateContent(content, template);

// Validate OpenAPI spec
const specResult = validateOpenApiSpec(openApiSpec);

if (!result.valid) {
  console.error(result.errors);
}
```

**Checks:**
- Required fields presence
- ID and version format (semver)
- Section structure
- Validation rules
- OpenAPI spec structure

### Unified API (`index.js`)

High-level integration interface:

```javascript
import { createTemplateSystem } from './index.js';

const system = createTemplateSystem();

// Initialize with default template
await system.initialize();

// Generate document (validates everything)
const result = await system.generateDocument(templateId, spec, options);

// Register new template (validates before registration)
await system.registerTemplate(template, filename, tags);

// List and search
const templates = await system.listTemplates({ tags: ['migration'] });
const results = await system.searchTemplates('typespec');

// Get statistics
const stats = await system.getStats();
```

## Template Structure

### Default Template Sections

1. **overview** (required) - Migration overview and goals
2. **source-spec** (required) - OpenAPI specification details
3. **endpoints** (required) - API endpoints to migrate
4. **schemas** (required) - Data models and schemas
5. **migration-strategy** (required) - Conversion approach
6. **challenges** (optional) - Known issues
7. **dependencies** (optional) - External dependencies
8. **validation** (required) - Success criteria

### Section Types

- **text**: Plain text content
- **list**: Bullet point list
- **table**: Markdown table
- **code**: Code block (JSON/other)
- **yaml**: YAML-formatted code block
- **markdown**: Rich markdown content

### Validation Rules

- **required**: Field must be present
- **minLength**: Minimum content length
- **maxLength**: Maximum content length
- **pattern**: Regular expression match
- **custom**: Custom validation function

## Example: Custom Template

```javascript
import { createTemplateSystem, SECTION_TYPES, VALIDATION_TYPES } from './index.js';

const customTemplate = {
  id: 'my-migration',
  name: 'My Custom Migration Template',
  version: '1.0.0',
  description: 'Custom template for specific use case',
  sections: [
    {
      id: 'intro',
      title: 'Introduction',
      description: 'Overview of the migration',
      required: true,
      order: 1,
      type: SECTION_TYPES.MARKDOWN,
      placeholder: 'Provide introduction...'
    }
    // ... more sections
  ],
  defaults: {},
  validation: {
    sections: {
      intro: [
        {
          type: VALIDATION_TYPES.REQUIRED,
          value: true,
          message: 'Introduction is required'
        },
        {
          type: VALIDATION_TYPES.MIN_LENGTH,
          value: 100,
          message: 'Introduction must be at least 100 characters'
        }
      ]
    },
    global: {}
  },
  metadata: {}
};

const system = createTemplateSystem();
await system.registerTemplate(customTemplate, 'my-migration.json', ['custom']);
```

## Data Flow

```
OpenAPI Spec
    ↓
Generator.extract()  → { endpoints, schemas, overview, ... }
    ↓
Validator.validate() → Check data completeness
    ↓
Generator.render()   → Markdown sections
    ↓
Generator.assemble() → Complete document
    ↓
Validator.validate() → Check output quality
    ↓
Result + Errors/Warnings
```

## Error Handling

The system provides detailed error and warning information:

```javascript
const result = await system.generateDocument(templateId, spec);

if (!result.success) {
  result.errors.forEach(error => {
    console.error(`[${error.code}] ${error.message}`);
    if (error.field) console.error(`  Field: ${error.field}`);
  });
}

result.warnings.forEach(warning => {
  console.warn(`[${warning.code}] ${warning.message}`);
  if (warning.suggestion) console.warn(`  Suggestion: ${warning.suggestion}`);
});
```

## Testing

Run verification tests:

```bash
node lib-ghcc/templates/__tests__/verify.js
```

This validates:
- All files exist
- All exports are present
- Classes have required methods
- Imports are correctly referenced

## Integration with GSD

The template system integrates with the Get Shit Done workflow:

1. **Phase Planning**: Generate migration specs from OpenAPI
2. **Documentation**: Create standardized migration guides
3. **Validation**: Ensure specs meet quality standards
4. **Registry**: Store and reuse templates across projects

## Future Enhancements

Potential improvements:

- [ ] Template inheritance
- [ ] Custom section renderers
- [ ] Interactive template builder
- [ ] OpenAPI 3.1 specific features
- [ ] AsyncAPI support
- [ ] Template marketplace/sharing

## Contributing

When adding new features:

1. Update type definitions in `types.js`
2. Implement logic in appropriate module
3. Add validation rules if needed
4. Update tests in `__tests__/verify.js`
5. Document changes in this README

## License

Part of the get-shit-done-multi project. See root LICENSE file.
