/**
 * Shared color constants for GSD scripts
 * Uses ANSI escape codes for zero-dependency coloring
 * Consistent with bin/install.js color system
 */

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

// Composite styles (commonly used patterns)
const success = green;
const warning = yellow;
const error = red;
const info = cyan;
const muted = dim;

module.exports = {
  // Basic colors
  cyan,
  green,
  yellow,
  red,
  dim,
  reset,
  
  // Semantic aliases
  success,
  warning,
  error,
  info,
  muted
};
