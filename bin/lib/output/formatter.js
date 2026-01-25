// bin/lib/output/formatter.js
/**
 * Text formatting utilities for CLI output
 */

/**
 * Create indented string
 * @param {string} text - Text to indent
 * @param {number} level - Indentation level (each level = 2 spaces)
 * @returns {string} Indented text
 */
function indent(text, level = 1) {
  const spaces = '  '.repeat(level);
  return text.split('\n').map(line => spaces + line).join('\n');
}

/**
 * Wrap text in box with padding
 * @param {string} text - Text to wrap
 * @param {object} options - boxen options
 * @returns {string} Boxed text
 */
function box(text, options = {}) {
  const boxen = require('boxen').default;
  return boxen(text, {
    padding: 1,
    borderStyle: 'single',
    ...options
  });
}

module.exports = {
  indent,
  box
};
