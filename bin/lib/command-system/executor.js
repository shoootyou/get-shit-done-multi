/**
 * Command executor - Executes commands with CLI detection and error handling
 * Integrates with CLI detection from Phase 1 and command registry
 * @module command-system/executor
 */

import { createRequire } from 'node:module';
import { registry } from './registry.js';
import { formatError, degradeGracefully, CommandError } from './error-handler.js';
import { generateHelp } from './help-generator.js';

// Create require for CommonJS modules
const require = createRequire(import.meta.url);
const { detectCLI } = require('../detect.js');

/**
 * Execute a command with CLI-specific adaptations and error handling
 * @param {string} commandName - Name of command to execute (e.g., 'gsd:help')
 * @param {Array} args - Array of arguments for the command
 * @returns {Promise<{success: boolean, result: any}>} Execution result
 * @throws {CommandError} If command not found or execution fails
 */
export async function executeCommand(commandName, args = []) {
  try {
    // Special handling for help command
    if (commandName === 'gsd:help') {
      const helpArg = args[0];
      const helpText = generateHelp(helpArg);
      console.log(helpText);
      return {
        success: true,
        result: helpText
      };
    }
    
    // Detect which CLI is currently running
    const currentCLI = detectCLI();
    
    // Retrieve command from registry
    const command = registry.get(commandName);
    
    if (!command) {
      // Command not found - suggest similar commands
      const availableCommands = registry.list();
      const suggestions = [
        'Run /gsd-help to see all available commands',
        `Available commands: ${availableCommands.slice(0, 5).join(', ')}${availableCommands.length > 5 ? '...' : ''}`
      ];
      
      throw new CommandError(
        `Command not found: ${commandName}`,
        'COMMAND_NOT_FOUND',
        suggestions
      );
    }
    
    // Check CLI-specific feature requirements
    if (command.metadata.requires) {
      const missingFeatures = [];
      
      // Check each required feature
      for (const feature of command.metadata.requires) {
        // Feature support detection logic
        // For now, log degradation warnings but continue
        const isSupported = checkFeatureSupport(feature, currentCLI);
        
        if (!isSupported) {
          missingFeatures.push(feature);
          console.warn(degradeGracefully(feature, currentCLI));
        }
      }
    }
    
    // Execute command handler
    const result = await command.handler(args);
    
    return {
      success: true,
      result
    };
    
  } catch (error) {
    // Format and display error
    const formattedError = formatError(error, commandName);
    console.error(formattedError);
    
    // Exit with non-zero code for script integration
    process.exit(1);
  }
}

/**
 * Check if a feature is supported by the current CLI
 * @param {string} feature - Feature name to check
 * @param {string} cli - CLI name (claude-code, copilot-cli, codex-cli)
 * @returns {boolean} True if feature is supported
 * @private
 */
function checkFeatureSupport(feature, cli) {
  // Feature support matrix
  const support = {
    'claude-code': ['agent-delegation', 'task-tool', 'multi-step-workflows'],
    'copilot-cli': ['agent-delegation', 'task-tool'],
    'codex-cli': ['progressive-disclosure', 'skill-based-help']
  };
  
  const supportedFeatures = support[cli] || [];
  return supportedFeatures.includes(feature);
}
