/**
 * Command Verification Tests - Verify GSD commands are accessible
 * Checks command registry to ensure all expected commands are available
 * 
 * @module verification/command-verifier
 */

const { DiagnosticTest } = require('./diagnostic-test');
const fs = require('fs');
const path = require('path');

/**
 * Test if GSD commands are available in the command registry
 * Checks that command files exist in commands/gsd/ directory
 */
class CommandAvailableTest extends DiagnosticTest {
  constructor() {
    super(
      'GSD Commands Available',
      'Verify GSD command files are accessible'
    );
    
    // No hardcoded list - discover commands dynamically from filesystem
    this.expectedCommands = null;
  }
  
  async run() {
    try {
      // Find commands/gsd directory relative to project root
      const commandsDir = this.findCommandsDirectory();
      
      if (!commandsDir) {
        return {
          status: 'fail',
          message: 'commands/gsd/ directory not found',
          fixes: [
            'Reinstall GSD: npm install -g get-shit-done-multi',
            'Check that you are in a GSD-enabled directory'
          ]
        };
      }
      
      // Discover all command files dynamically
      const existingCommands = fs.readdirSync(commandsDir)
        .filter(file => file.endsWith('.md'));
      
      const commandCount = existingCommands.length;
      
      if (commandCount === 0) {
        return {
          status: 'fail',
          message: 'No GSD commands found',
          fixes: [
            'Run: npx get-shit-done-multi --<cli> to install GSD',
            'Check CLI skill/prompt directory exists'
          ]
        };
      }
      
      // All discovered commands are available
      return {
        status: 'pass',
        message: `All ${commandCount} GSD commands available`,
        fixes: []
      };
      
    } catch (error) {
      return {
        status: 'fail',
        message: `Command check error: ${error.message}`,
        fixes: ['Verify GSD installation is complete']
      };
    }
  }
  
  /**
   * Find commands/gsd directory in project
   * Searches upward from current directory to find commands/gsd
   * @returns {string|null} Path to commands/gsd or null if not found
   */
  findCommandsDirectory() {
    let currentDir = process.cwd();
    const maxDepth = 10;
    
    for (let i = 0; i < maxDepth; i++) {
      const commandsPath = path.join(currentDir, 'commands', 'gsd');
      if (fs.existsSync(commandsPath)) {
        return commandsPath;
      }
      
      // Move up one directory
      const parentDir = path.dirname(currentDir);
      if (parentDir === currentDir) {
        // Reached root
        break;
      }
      currentDir = parentDir;
    }
    
    // Try checking from module location (when run from installed package)
    const moduleDir = path.join(__dirname, '..', '..', 'commands', 'gsd');
    if (fs.existsSync(moduleDir)) {
      return moduleDir;
    }
    
    return null;
  }
}

module.exports = {
  CommandAvailableTest
};
