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

  const questions = [
    {
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
      validate: value => value.length === 0 
        ? 'At least one platform must be selected' 
        : true
    },
    {
      type: () => scopeFromFlags ? null : 'select',  // Skip if scope preset from flags
      name: 'scope',
      message: 'Select installation scope:',
      choices: [
        { title: 'Local', value: 'local' },
        { title: 'Global', value: 'global' }
      ],
      initial: 0  // Default to Local
    }
  ];

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
