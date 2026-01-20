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
    
    // Expected GSD commands based on the project structure
    this.expectedCommands = [
      'add-phase.md',
      'add-todo.md',
      'audit-milestone.md',
      'check-todos.md',
      'complete-milestone.md',
      'debug.md',
      'discuss-phase.md',
      'execute-phase.md',
      'execute-plan.md',
      'help.md',
      'init-project.md',
      'invoke-agent.md',
      'map-codebase.md',
      'new-milestone.md',
      'new-project.md',
      'plan-phase.md',
      'progress.md',
      'refine-phase.md',
      'rename-phase.md',
      'research-phase.md',
      'status.md',
      'track-decision.md',
      'verify-phase.md',
      'verify-installation.md'
    ];
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
      
      // Check which command files exist
      const existingCommands = fs.readdirSync(commandsDir)
        .filter(file => file.endsWith('.md'));
      
      const missingCommands = this.expectedCommands.filter(
        cmd => !existingCommands.includes(cmd)
      );
      
      // Calculate availability
      const availableCount = this.expectedCommands.length - missingCommands.length;
      const totalCount = this.expectedCommands.length;
      
      if (missingCommands.length === 0) {
        return {
          status: 'pass',
          message: `All ${totalCount} GSD commands available`,
          fixes: []
        };
      } else if (availableCount > 0) {
        return {
          status: 'warn',
          message: `${availableCount}/${totalCount} GSD commands available (missing: ${missingCommands.length})`,
          fixes: [
            `Missing commands: ${missingCommands.slice(0, 3).join(', ')}${missingCommands.length > 3 ? '...' : ''}`,
            'Reinstall GSD to restore missing commands'
          ]
        };
      } else {
        return {
          status: 'fail',
          message: 'No GSD commands found',
          fixes: [
            'Run: npx get-shit-done-multi --<cli> to install GSD',
            'Check CLI skill/prompt directory exists'
          ]
        };
      }
      
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
