// bin/lib/output/reporter.js
const prompts = require('prompts');
const symbols = require('./symbols');
const { indent } = require('./formatter');
const { cyan, green, yellow, dim, reset } = require('../colors');

// Lazy-load boxen to support Jest mocking
let boxen;
function getBoxen() {
  if (!boxen) {
    boxen = require('boxen').default;
  }
  return boxen;
}

/**
 * Centralized message manager for CLI output
 * Follows Reporter pattern from npm/yarn/cargo
 */
class Reporter {
  constructor(options = {}) {
    this.indentLevel = 0;
    this.write = options.write || ((msg) => process.stdout.write(msg));
    this.silent = options.silent || false;
    this.context = {
      platform: null,
      scope: null,
      os: null,
      multiPlatform: false
    };
  }

  /**
   * Set context for conditional messaging
   */
  setContext(context) {
    this.context = { ...this.context, ...context };
  }

  /**
   * Start platform installation
   */
  platformStart(platform, scope) {
    this.setContext({ platform, scope });
    this._write(`  ${cyan}Installing ${platform} (${scope})...${reset}\n`);
    this.indentLevel++;
  }

  /**
   * Platform installation success
   */
  platformSuccess(platform, details) {
    const msg = `${green}${symbols.SUCCESS}${reset} Installed to ${cyan}${details.path}${reset}`;
    const counts = [];
    if (details.commands) counts.push(`${details.commands} commands`);
    if (details.agents) counts.push(`${details.agents} agents`);
    if (details.skills) counts.push(`${details.skills} skills`);
    
    const fullMsg = counts.length > 0 
      ? `${msg} (${counts.join(', ')})\n`
      : `${msg}\n`;
    
    this._writeIndented(fullMsg);
    this.indentLevel--;
  }

  /**
   * Platform installation error
   */
  platformError(platform, error) {
    this._writeIndented(`${yellow}${symbols.ERROR}${reset} Error: ${error.message}\n`);
    this.indentLevel--;
  }

  /**
   * Display warning box with optional confirmation
   */
  async warning(message, options = {}) {
    const box = getBoxen()(`${symbols.WARNING}  WARNING\n${message}`, {
      padding: 1,
      borderStyle: 'single',
      borderColor: 'yellow'
    });
    this._write('\n' + box + '\n');

    if (options.confirm) {
      const response = await prompts({
        type: 'confirm',
        name: 'continue',
        message: 'Continue?',
        initial: false
      }, {
        onCancel: () => {
          this._write('\nInstallation cancelled\n');
          process.exit(1);
        }
      });
      return response.continue;
    }
    return true;
  }

  /**
   * Multi-platform installation summary
   */
  summary(results) {
    const succeeded = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    this._write('\n');
    
    if (succeeded.length > 0) {
      const names = succeeded.map(r => r.platform).join(', ');
      this._write(`  ${green}${symbols.SUCCESS} ${names} installed${reset}\n`);
    }
    
    if (failed.length > 0) {
      this._write(`  ${yellow}${symbols.ERROR} Errors:${reset}\n`);
      failed.forEach(r => {
        this._write(`    ${r.platform}: ${r.error.message}\n`);
      });
    }
  }

  /**
   * Generic success message
   */
  success(message) {
    this._write(`  ${green}${symbols.SUCCESS}${reset} ${message}\n`);
  }

  /**
   * Generic error message
   */
  error(message) {
    this._write(`  ${yellow}${symbols.ERROR}${reset} ${message}\n`);
  }

  /**
   * Generic info message
   */
  info(message) {
    this._write(`  ${dim}${message}${reset}\n`);
  }

  /**
   * Write with current indentation
   */
  _writeIndented(message) {
    const indentStr = '  '.repeat(this.indentLevel);
    this._write(indentStr + message);
  }

  /**
   * Write to output (respects silent mode)
   */
  _write(message) {
    if (!this.silent) {
      this.write(message);
    }
  }
}

module.exports = Reporter;
