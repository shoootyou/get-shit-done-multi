/**
 * Old Flag Detector - Pre-parse detection for removed flags
 * 
 * Detects old flags (--local, --global, --codex-global) before Commander.js parsing,
 * shows migration warnings, and returns cleaned argv for parsing.
 * 
 * Part of v1.10.0 flag system redesign - Phase 2, Task 1
 */

const { yellow, reset } = require('../installation/colors');

// Old flags and their migration examples
const OLD_FLAGS = {
  '--local': '--claude --local',
  '--global': '--claude --global',
  '--codex-global': '--codex --local'
};

/**
 * Detect old flags in argv and show migration warning
 * 
 * Old flags are the standalone --local/--global that meant "Claude local/global".
 * NEW flags are the same names but used as scope modifiers WITH platform flags.
 * 
 * Detection strategy: --local/--global are only OLD if they're the ONLY flags.
 * If used alone (no platform), they trigger the NEW interactive menu with scope preset.
 * If used with platform flags (--claude --global), it's the NEW usage.
 * 
 * @param {string[]} argv - Raw process.argv array
 * @returns {string[]} - Cleaned argv with old flags removed
 */
function detectAndFilterOldFlags(argv) {
  // Check if platform flags are present (new usage with explicit platform)
  const hasPlatformFlags = argv.some(arg => 
    ['--claude', '--copilot', '--codex', '--all'].includes(arg)
  );
  
  // Check if scope flags are present
  const hasScopeFlags = argv.some(arg => 
    ['--local', '-l', '--global', '-g'].includes(arg)
  );
  
  // OLD usage: --codex-global is ALWAYS old (removed completely)
  // NEW usage: --local/--global with platform flags = scope modifier
  // NEW usage: --local/--global without platform = scope preset for menu
  
  // Only --codex-global is truly "old" and should be removed
  const oldFlagsToCheck = ['--codex-global'];
  
  // Find all old flags present in argv
  const found = oldFlagsToCheck.filter(flag => argv.includes(flag));
  
  // Show warning if any old flags detected
  if (found.length > 0) {
    console.warn(`${yellow}⚠️  The following flags have been removed in v1.10.0: ${found.join(', ')}${reset}`);
    console.warn(`${yellow}    Use '${OLD_FLAGS[found[0]]}' instead of '${found[0]}'${reset}`);
    console.warn(`${yellow}    See MIGRATION.md for details${reset}`);
    console.warn('');
  }
  
  // Filter out old flags from argv
  const cleaned = argv.filter(arg => !found.includes(arg));
  
  return cleaned;
}

module.exports = detectAndFilterOldFlags;
