/**
 * Interactive Menu System
 * 
 * Provides interactive platform and scope selection when no flags are provided.
 * Integrates with Phase 2 flag parser - returns same output format.
 */

const prompts = require('prompts');

/**
 * Show interactive menu for platform and scope selection
 * 
 * @param {string|null} scopeFromFlags - Pre-selected scope from flags (e.g., --global)
 * @returns {Promise<{platforms: string[], scope: string, needsMenu: boolean}>}
 * @throws {Error} When not in TTY environment
 */
async function showInteractiveMenu(scopeFromFlags = null) {
  // TTY Detection - must be first, before prompts
  if (!process.stdin.isTTY) {
    throw new Error('Interactive menu requires TTY. Use explicit flags for non-interactive environments.');
  }

  const questions = [];
  
  // Platform selection (always shown when menu is needed)
  questions.push({
    type: 'multiselect',
    name: 'platforms',
    message: 'Select platforms to install (Space to toggle, Enter to confirm):',
    choices: [
      { title: 'Claude', value: 'claude' },
      { title: 'Copilot', value: 'copilot' },
      { title: 'Codex', value: 'codex' },
      { title: 'All', value: 'all' }
    ],
    instructions: false,
    min: 1,  // Require at least one selection
    validate: value => {
      if (!value || value.length === 0) {
        return 'At least one platform must be selected';
      }
      return true;
    }
  });
  
  // Scope selection (only if not provided via flags)
  if (!scopeFromFlags) {
    questions.push({
      type: 'select',
      name: 'scope',
      message: 'Select installation scope:',
      choices: [
        { title: 'Local', value: 'local' },
        { title: 'Global', value: 'global' }
      ],
      initial: 0  // Default to Local
    });
  }

  const response = await prompts(questions, {
    onCancel: () => {
      console.log('\nInstallation cancelled');
      process.exit(0);
    }
  });

  // Handle "All" platform override (not additive)
  let platforms = response.platforms;
  if (platforms && platforms.includes('all')) {
    platforms = ['claude', 'copilot', 'codex'];
  }

  // Return flag-parser-compatible format
  return {
    platforms,
    scope: scopeFromFlags || response.scope,
    needsMenu: false  // Menu complete
  };
}

module.exports = { showInteractiveMenu };
