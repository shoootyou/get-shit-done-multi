/**
 * Flag Parser - Commander.js-based flag parsing
 * 
 * Parses platform flags (--claude, --copilot, --codex, --all) and
 * scope modifiers (--global, --local) into structured configuration.
 * 
 * Part of v1.10.0 flag system redesign - Phase 2, Task 2
 */

const { Command } = require('commander');
const { cyan, yellow, reset } = require('./colors');

/**
 * Parse command-line flags into structured configuration
 * @param {string[]} argv - Cleaned argv array (old flags already removed)
 * @returns {{ platforms: string[], scope: 'local'|'global', needsMenu: boolean }}
 */
function parseFlags(argv) {
  const program = new Command();
  
  // Configure Commander.js
  program
    .name('get-shit-done-multi')
    .description('Multi-platform AI assistant configuration')
    .version('1.10.0')
    .option('--claude', 'install for Claude Desktop')
    .option('--copilot', 'install for GitHub Copilot CLI')
    .option('--codex', 'install for Codex CLI')
    .option('--all', 'install for all platforms')
    .option('-g, --global', 'install globally (user home directory)')
    .option('-l, --local', 'install locally (current directory, default)')
    .allowUnknownOption(false)  // Strict mode
    .exitOverride();  // Don't exit process, throw errors instead
  
  let parsedOptions;
  
  try {
    // Parse argv
    program.parse(argv);
    parsedOptions = program.opts();
  } catch (err) {
    // Re-throw Commander errors as regular errors for easier handling
    throw new Error(err.message);
  }
  
  // Process platforms
  let platforms = [];
  
  if (parsedOptions.all) {
    // --all flag selects all platforms
    platforms = ['claude', 'copilot', 'codex'];
    
    // Show info if specific platform flags were also present
    if (parsedOptions.claude || parsedOptions.copilot || parsedOptions.codex) {
      console.log(`${cyan}ℹ️  Using --all (specific platform flags ignored)${reset}`);
    }
  } else {
    // Accumulate individual platform flags
    if (parsedOptions.claude) platforms.push('claude');
    if (parsedOptions.copilot) platforms.push('copilot');
    if (parsedOptions.codex) platforms.push('codex');
  }
  
  // Deduplicate platforms (handle --claude --claude)
  const originalLength = platforms.length;
  platforms = [...new Set(platforms)];
  
  if (platforms.length < originalLength) {
    const duplicates = [];
    const seen = new Set();
    
    // Find which platforms were duplicated
    for (const platform of ['claude', 'copilot', 'codex']) {
      if (parsedOptions[platform] && seen.has(platform)) {
        duplicates.push(`--${platform}`);
      }
      if (parsedOptions[platform]) seen.add(platform);
    }
    
    console.warn(`${yellow}⚠️  Duplicate flags detected: ${duplicates.join(', ')} (will install once)${reset}`);
  }
  
  // Determine scope (default: local)
  const scope = parsedOptions.global ? 'global' : 'local';
  
  // Check if interactive menu is needed (no platforms selected)
  const needsMenu = platforms.length === 0;
  
  return {
    platforms,
    scope,
    needsMenu
  };
}

module.exports = parseFlags;
