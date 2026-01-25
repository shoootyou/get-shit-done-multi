/**
 * Codex Warning - Global installation warning with user confirmation
 * 
 * Handles FLAG-03: Codex only supports local installation
 * Shows warning, installation plan, and prompts for confirmation when
 * user attempts --codex --global or --all --global
 * 
 * Part of v1.10.0 flag system redesign - Phase 2, Plan 2
 * Updated in Phase 5, Plan 2 to use boxen for warning display
 */

const prompts = require('prompts');
const { yellow, cyan, dim, reset } = require('./colors');

// Lazy-load boxen to support testing
let boxen;
function getBoxen() {
  if (!boxen) {
    boxen = require('boxen').default;
  }
  return boxen;
}
const path = require('path');

/**
 * Warn user about Codex global limitation and get confirmation
 * @param {string[]} platforms - List of platforms to install
 * @param {'local'|'global'} scope - Installation scope
 * @returns {Promise<boolean>} - true to proceed, false to cancel
 */
async function warnAndConfirmCodexLocal(platforms, scope) {
  // Check if warning is needed
  if (!platforms.includes('codex') || scope !== 'global') {
    return true;  // No warning needed
  }
  
  // Show warning in boxed format (MSG-02)
  const warningText = `⚠️  WARNING

Global installation not supported for Codex.
Installing locally in current folder instead.`;

  const box = getBoxen()(warningText, {
    padding: 1,
    borderStyle: 'single',
    borderColor: 'yellow'
  });

  console.log('\n' + box + '\n');
  
  // Show installation plan
  console.log('  Installation plan:');
  
  platforms.forEach(platform => {
    let installPath;
    let effectiveScope;
    
    if (platform === 'codex') {
      // Codex always local (PATH-03)
      installPath = '[repo-root]/.codex/';
      effectiveScope = 'local';
    } else if (platform === 'claude') {
      // Claude paths (PATH-01)
      installPath = scope === 'global' ? '~/.claude/' : '[repo-root]/.claude/';
      effectiveScope = scope;
    } else if (platform === 'copilot') {
      // Copilot paths (PATH-02)
      installPath = scope === 'global' ? '~/.copilot/' : '[repo-root]/.github/';
      effectiveScope = scope;
    }
    
    console.log(`  ${cyan}•${reset} ${platform.charAt(0).toUpperCase() + platform.slice(1)} → ${installPath} (${effectiveScope})`);
  });
  
  console.log('');
  
  // TTY detection - auto-proceed in non-interactive environments
  if (!process.stdout.isTTY) {
    console.log('(auto-proceeding in non-interactive mode)');
    return true;
  }
  
  // Confirmation prompt
  const response = await prompts({
    type: 'confirm',
    name: 'continue',
    message: 'Continue with installation?',
    initial: true
  });
  
  // Handle cancellation (Ctrl+C, ESC)
  if (response.continue === undefined) {
    console.log('Installation cancelled');
    return false;
  }
  
  return response.continue;
}

module.exports = warnAndConfirmCodexLocal;
