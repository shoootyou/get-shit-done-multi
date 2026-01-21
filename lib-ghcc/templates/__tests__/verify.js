#!/usr/bin/env node
/**
 * Verification Script for Template System
 * 
 * Verifies that all template system files exist and have correct structure.
 * Does not execute the code, just validates presence and basic structure.
 */

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, '..');
let errors = 0;
let checks = 0;

function check(description, fn) {
  checks++;
  try {
    fn();
    console.log(`✓ ${description}`);
  } catch (error) {
    errors++;
    console.error(`✗ ${description}`);
    console.error(`  ${error.message}`);
  }
}

function fileExists(filename) {
  const filepath = path.join(TEMPLATES_DIR, filename);
  if (!fs.existsSync(filepath)) {
    throw new Error(`File not found: ${filename}`);
  }
  return filepath;
}

function fileContains(filename, ...patterns) {
  const filepath = fileExists(filename);
  const content = fs.readFileSync(filepath, 'utf8');
  for (const pattern of patterns) {
    if (!content.includes(pattern)) {
      throw new Error(`Pattern not found in ${filename}: ${pattern}`);
    }
  }
}

console.log('Verifying Template System Structure...\n');

// Check all required files exist
console.log('File existence:');
check('types.js exists', () => fileExists('types.js'));
check('generator.js exists', () => fileExists('generator.js'));
check('registry.js exists', () => fileExists('registry.js'));
check('validator.js exists', () => fileExists('validator.js'));
check('index.js exists', () => fileExists('index.js'));

// Check types.js structure
console.log('\ntypes.js structure:');
check('exports SECTION_TYPES', () => fileContains('types.js', 'export const SECTION_TYPES'));
check('exports VALIDATION_TYPES', () => fileContains('types.js', 'export const VALIDATION_TYPES'));
check('exports DEFAULT_SECTIONS', () => fileContains('types.js', 'export const DEFAULT_SECTIONS'));
check('exports DEFAULT_VALIDATION_SCHEMA', () => fileContains('types.js', 'export const DEFAULT_VALIDATION_SCHEMA'));
check('has JSDoc type definitions', () => fileContains('types.js', '@typedef', 'TemplateSection', 'SpecMigrationTemplate'));

// Check generator.js structure
console.log('\ngenerator.js structure:');
check('exports TemplateGenerator class', () => fileContains('generator.js', 'export class TemplateGenerator'));
check('exports createDefaultTemplate', () => fileContains('generator.js', 'export function createDefaultTemplate'));
check('has generate method', () => fileContains('generator.js', 'async generate(context)'));
check('has extractEndpoints method', () => fileContains('generator.js', 'extractEndpoints(spec)'));
check('has extractSchemas method', () => fileContains('generator.js', 'extractSchemas(spec)'));
check('has section renderers', () => fileContains('generator.js', 'renderMarkdown', 'renderTable', 'renderList'));

// Check registry.js structure
console.log('\nregistry.js structure:');
check('exports TemplateRegistry class', () => fileContains('registry.js', 'export class TemplateRegistry'));
check('exports createRegistry', () => fileContains('registry.js', 'export function createRegistry'));
check('has registerTemplate method', () => fileContains('registry.js', 'async registerTemplate'));
check('has getTemplate method', () => fileContains('registry.js', 'async getTemplate'));
check('has listTemplates method', () => fileContains('registry.js', 'async listTemplates'));
check('has searchTemplates method', () => fileContains('registry.js', 'async searchTemplates'));
check('imports state-io', () => fileContains('registry.js', 'atomicWriteJSON', 'atomicReadJSON'));

// Check validator.js structure
console.log('\nvalidator.js structure:');
check('exports TemplateValidator class', () => fileContains('validator.js', 'export class TemplateValidator'));
check('exports validateTemplate', () => fileContains('validator.js', 'export function validateTemplate'));
check('exports validateContent', () => fileContains('validator.js', 'export function validateContent'));
check('exports validateOpenApiSpec', () => fileContains('validator.js', 'export function validateOpenApiSpec'));
check('has validateTemplate method', () => fileContains('validator.js', 'validateTemplate(template)'));
check('has validateSections method', () => fileContains('validator.js', 'validateSections'));
check('has validation rule checks', () => fileContains('validator.js', 'VALIDATION_TYPES'));

// Check index.js structure
console.log('\nindex.js structure:');
check('re-exports TemplateGenerator', () => fileContains('index.js', 'export { TemplateGenerator'));
check('re-exports TemplateRegistry', () => fileContains('index.js', 'export { TemplateRegistry'));
check('re-exports TemplateValidator', () => fileContains('index.js', 'TemplateValidator'));
check('exports createTemplateSystem', () => fileContains('index.js', 'export function createTemplateSystem'));
check('exports types', () => fileContains('index.js', 'SECTION_TYPES', 'VALIDATION_TYPES'));

// Check integration
console.log('\nIntegration:');
check('generator imports types', () => fileContains('generator.js', "from './types.js'"));
check('registry imports state-io', () => fileContains('registry.js', "from '../state-io.js'"));
check('validator imports types', () => fileContains('validator.js', "from './types.js'"));
check('index imports all modules', () => fileContains('index.js', 
  "from './generator.js'",
  "from './registry.js'",
  "from './validator.js'"
));

// Summary
console.log('\n' + '='.repeat(50));
console.log(`Checks passed: ${checks - errors}/${checks}`);
console.log(`Checks failed: ${errors}`);
console.log('='.repeat(50));

if (errors > 0) {
  console.error('\nVerification FAILED');
  process.exit(1);
} else {
  console.log('\n✓ All verification checks passed!');
  process.exit(0);
}
