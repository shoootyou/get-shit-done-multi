/**
 * Template System - Public API
 * Entry point for the template generation system
 * 
 * @module template-system
 */

const { parseSpec, parseSpecString } = require('./spec-parser');
const { buildContext } = require('./context-builder');
const { render, validate } = require('./engine');
const { generateAgent, generateFromSpec } = require('./generator');

module.exports = {
  // High-level API (most common usage)
  generateAgent,
  generateFromSpec,
  
  // Low-level API (for advanced use or testing)
  parseSpec,
  parseSpecString,
  buildContext,
  render,
  validate
};
