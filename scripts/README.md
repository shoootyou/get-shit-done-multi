# Scripts Directory

This directory contains test suites, validation scripts, and utility tools for the GSD project.

## Test Scripts

### Agent Generation & Installation
- **test-agent-generation.js** - Tests template-to-agent generation for all 13 agents on both platforms
- **test-agent-installation.js** - Validates installation paths and formatting (Claude, Copilot)
- **test-agent-invocation.js** - Smoke tests that invoke agents via CLI and validate responses
- **test-cross-platform.js** - E2E orchestrator running all test stages (generation → installation → invocation)

### System Tests
- **test-cross-cli-state.js** - Tests cross-CLI state management
- **test-state-management.js** - Tests state persistence and consistency

### Validation
- **validate-docs.js** - Validates documentation consistency and completeness

## Utility Scripts

- **generate-samples.js** - Generates all 13 agents for both platforms (Claude + Copilot) from specs
- **generate-validation-report.js** - Creates comprehensive validation report for all generated agents

## Usage

### Running Tests

```bash
# Generation tests
node scripts/test-agent-generation.js

# Installation tests
node scripts/test-agent-installation.js

# Invocation tests (requires CLI installed)
node scripts/test-agent-invocation.js

# Full E2E test suite
node scripts/test-cross-platform.js
```

### Utilities

```bash
# Generate all agents
node scripts/generate-samples.js

# Generate validation report
node scripts/generate-validation-report.js

# Validate documentation
node scripts/validate-docs.js
```

## Directory Structure

```
scripts/
├── README.md                      # This file
├── test-agent-generation.js       # Agent generation tests
├── test-agent-installation.js     # Installation validation
├── test-agent-invocation.js       # CLI invocation smoke tests
├── test-cross-platform.js         # E2E test orchestrator
├── test-cross-cli-state.js        # State management tests
├── test-state-management.js       # State persistence tests
├── validate-docs.js               # Documentation validator
├── generate-samples.js            # Agent generator utility
└── generate-validation-report.js  # Validation report generator
```

## Test Philosophy

All test scripts follow a consistent pattern:
- Console-based output (no dependencies on test frameworks)
- Exit codes: 0 = pass, 1 = fail
- Clear pass/fail/skip reporting
- Automatic cleanup of temporary files
- Graceful handling of missing dependencies (CLI tools, etc.)

## Integration

Test scripts use the core template system from `bin/lib/template-system/`:
- `generator.js` - Template rendering and agent generation
- `tool-mapper.js` - Platform-specific tool mapping
- `field-transformer.js` - Metadata transformation
- `validators.js` - Platform spec compliance

All import paths are relative: `require('../bin/lib/...')`
