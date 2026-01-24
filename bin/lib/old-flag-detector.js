/**
 * Old Flag Detector - Pre-parse detection for removed flags
 * 
 * Detects old flags (--local, --global, --codex-global) before Commander.js parsing,
 * shows migration warnings, and returns cleaned argv for parsing.
 * 
 * Part of v1.10.0 flag system redesign - Phase 2, Task 1
 */

const { yellow, reset } = require('./colors');

// Old flags and their migration examples
const OLD_FLAGS = {
  '--local': '--claude --local',
  '--global': '--claude --global',
  '--codex-global': '--codex --local'
};

/**
 * Detect old flags in argv and show migration warning
 * @param {string[]} argv - Raw process.argv array
 * @returns {string[]} - Cleaned argv with old flags removed
 */
function detectAndFilterOldFlags(argv) {
  // Find all old flags present in argv
  const found = Object.keys(OLD_FLAGS).filter(flag => argv.includes(flag));
  
  // Show warning if any old flags detected
  if (found.length > 0) {
    console.warn(`${yellow}⚠️  The following flags have been removed in v1.10.0: ${found.join(', ')}${reset}`);
    console.warn(`${yellow}    Use '${OLD_FLAGS[found[0]]}' instead of '${found[0]}'${reset}`);
    console.warn(`${yellow}    See MIGRATION.md for details${reset}`);
    console.warn('');
  }
  
  // Filter out all old flags from argv
  const cleaned = argv.filter(arg => !Object.keys(OLD_FLAGS).includes(arg));
  
  return cleaned;
}

module.exports = detectAndFilterOldFlags;
