/**
 * CLI Detection Tests - Verify which CLIs are installed and GSD-enabled
 * Uses child_process to check CLI availability and fs to check skill registration
 * 
 * @module verification/cli-detector
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const { DiagnosticTest } = require('./diagnostic-test');

/**
 * Get config paths for a CLI (adapted from bin/lib/paths.js pattern)
 * @param {string} cli - CLI name ('claude', 'copilot', 'codex')
 * @returns {{global: string, skill: string}}
 */
function getConfigPaths(cli) {
  const homeDir = require('os').homedir();
  
  const paths = {
    claude: {
      global: path.join(homeDir, 'Library', 'Application Support', 'Claude'),
      skill: path.join(homeDir, 'Library', 'Application Support', 'Claude', '.agent', 'get-shit-done')
    },
    copilot: {
      global: path.join(homeDir, '.copilot'),
      skill: path.join(homeDir, '.copilot', 'skills', 'get-shit-done')
    },
    codex: {
      global: path.join(homeDir, '.codex'),
      skill: path.join(homeDir, '.codex', 'skills', 'get-shit-done')
    }
  };
  
  return paths[cli];
}

/**
 * Test if a CLI executable is installed and accessible
 * Spawns CLI with --version flag to check availability
 */
class CLIInstalledTest extends DiagnosticTest {
  /**
   * Create CLI installed test
   * @param {string} cliName - Human-readable CLI name (e.g., "Claude Code")
   * @param {string} cliCommand - CLI executable name (e.g., "claude")
   */
  constructor(cliName, cliCommand) {
    super(
      `${cliName} Installed`,
      `Verify ${cliName} is installed and accessible`
    );
    this.cliName = cliName;
    this.cliCommand = cliCommand;
  }
  
  async run() {
    return new Promise((resolve) => {
      // Timeout after 5 seconds
      const timeout = setTimeout(() => {
        resolve({
          status: 'warn',
          message: `${this.cliName} check timed out`,
          fixes: [`Try running '${this.cliCommand} --version' manually to diagnose`]
        });
      }, 5000);
      
      const proc = spawn(this.cliCommand, ['--version'], {
        stdio: 'pipe',
        shell: true
      });
      
      let output = '';
      proc.stdout.on('data', (data) => output += data.toString());
      proc.stderr.on('data', (data) => output += data.toString());
      
      proc.on('close', (code) => {
        clearTimeout(timeout);
        
        if (code === 0) {
          // Extract version from output (first line, trim whitespace)
          const version = output.split('\n')[0].trim();
          resolve({
            status: 'pass',
            message: `${this.cliName} installed (${version})`,
            fixes: []
          });
        } else {
          resolve({
            status: 'fail',
            message: `${this.cliName} not found`,
            fixes: [this.getInstallInstruction()]
          });
        }
      });
      
      proc.on('error', () => {
        clearTimeout(timeout);
        resolve({
          status: 'fail',
          message: `${this.cliName} not found`,
          fixes: [this.getInstallInstruction()]
        });
      });
    });
  }
  
  /**
   * Get installation instruction for this CLI
   * @returns {string}
   */
  getInstallInstruction() {
    const instructions = {
      'claude': 'Install Claude Code CLI from https://claude.ai/download',
      'gh': 'Install GitHub CLI from https://cli.github.com/ then run: gh extension install github/gh-copilot',
      'codex': 'Install Codex CLI: npm install -g @codex/cli'
    };
    
    return instructions[this.cliCommand] || `Install ${this.cliName}`;
  }
}

/**
 * Test if GSD skill/prompt is registered in a CLI
 * Checks for skill directory and required files
 */
class SkillRegisteredTest extends DiagnosticTest {
  /**
   * Create skill registered test
   * @param {string} cli - CLI identifier ('claude', 'copilot', 'codex')
   */
  constructor(cli) {
    super(
      `GSD Skill Registered (${cli})`,
      `Verify GSD is registered in ${cli}`
    );
    this.cli = cli;
  }
  
  async run() {
    try {
      const paths = getConfigPaths(this.cli);
      
      // Check if CLI is installed first
      if (!fs.existsSync(paths.global)) {
        return {
          status: 'warn',
          message: `${this.cli} not installed - skipping skill check`,
          fixes: [`Install ${this.cli} CLI first`]
        };
      }
      
      // Check if skill directory exists
      if (!fs.existsSync(paths.skill)) {
        return {
          status: 'fail',
          message: `GSD skill not registered in ${this.cli}`,
          fixes: [
            `Run: npx get-shit-done-multi --${this.cli}`,
            `Or manually copy skill files to: ${paths.skill}`
          ]
        };
      }
      
      // Check for key skill files
      const requiredFiles = this.cli === 'claude' 
        ? ['.agent.md']  // Claude uses .agent.md
        : ['SKILL.md'];  // Copilot and Codex use SKILL.md
      
      const missingFiles = requiredFiles.filter(file => 
        !fs.existsSync(path.join(paths.skill, file))
      );
      
      if (missingFiles.length > 0) {
        return {
          status: 'warn',
          message: `GSD skill directory exists but missing files: ${missingFiles.join(', ')}`,
          fixes: [
            `Run: npx get-shit-done-multi --${this.cli} to reinstall`,
            `Check skill directory: ${paths.skill}`
          ]
        };
      }
      
      return {
        status: 'pass',
        message: `GSD skill registered in ${this.cli}`,
        fixes: []
      };
      
    } catch (error) {
      return {
        status: 'fail',
        message: `Skill check error: ${error.message}`,
        fixes: ['Check CLI installation and try reinstalling GSD']
      };
    }
  }
}

module.exports = {
  CLIInstalledTest,
  SkillRegisteredTest
};
