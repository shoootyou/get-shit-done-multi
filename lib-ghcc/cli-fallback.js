import { StateManager } from './state-manager.js';
import { createRequire } from 'module';

// Import CommonJS detect.js via createRequire
const require = createRequire(import.meta.url);
const { detectCLI } = require('../bin/lib/detect.js');

/**
 * CLIFallback - Smart retry with CLI fallback logic
 * 
 * Provides resilience when one CLI fails by automatically retrying the operation
 * in alternative CLIs based on configurable fallback order.
 * 
 * Features:
 * - Configurable fallback order from .planning/config.json
 * - Skip specific CLIs via options
 * - Aggregates errors from failed attempts for debugging
 * - Returns which CLI succeeded for traceability
 * - Respects maxRetries limit
 * 
 * @example
 * const fallback = new CLIFallback('.planning');
 * const result = await fallback.executeWithFallback(
 *   async (cli) => await someOperation(cli),
 *   { currentCLI: 'claude-code', maxRetries: 3 }
 * );
 * console.log(`Succeeded with ${result.cli} after ${result.attempts} attempts`);
 */
export class CLIFallback {
  /**
   * Create CLIFallback instance
   * @param {string} stateDir - Path to state directory (default: '.planning')
   */
  constructor(stateDir = '.planning') {
    this.stateDir = stateDir;
    this.stateManager = new StateManager(stateDir);
  }

  /**
   * Execute operation with automatic CLI fallback on failure
   * 
   * @param {Function} operation - Async function (cli: string) => result
   * @param {Object} options - Execution options
   * @param {number} options.maxRetries - Maximum number of CLIs to try (default: 3)
   * @param {string} options.currentCLI - Current CLI to try first (default: detectCLI())
   * @param {string[]} options.skipCLIs - CLIs to exclude from fallback list (default: [])
   * @returns {Promise<{success: boolean, cli: string, result: any, attempts: number, errors: Error[]}>}
   * @throws {Error} If all CLIs fail
   */
  async executeWithFallback(operation, options = {}) {
    const {
      maxRetries = await this._getMaxRetries(),
      currentCLI = detectCLI(),
      skipCLIs = []
    } = options;

    // Get fallback order from config
    const fallbackOrder = await this.getFallbackOrder();
    
    // Filter out skipped CLIs
    const availableCLIs = fallbackOrder.filter(cli => !skipCLIs.includes(cli));
    
    if (availableCLIs.length === 0) {
      throw new Error('No CLIs available after applying skipCLIs filter');
    }

    // Ensure currentCLI is first in the list if present
    const cliList = [currentCLI, ...availableCLIs.filter(cli => cli !== currentCLI)]
      .slice(0, maxRetries);

    const errors = [];
    let attempts = 0;

    for (const cli of cliList) {
      attempts++;
      try {
        const result = await operation(cli);
        return {
          success: true,
          cli,
          result,
          attempts,
          errors
        };
      } catch (error) {
        errors.push({
          cli,
          error: error.message || String(error),
          stack: error.stack
        });

        // If last CLI in list, break to throw aggregated error
        if (cli === cliList[cliList.length - 1]) {
          break;
        }
        
        // Log failure and continue to next CLI
        console.warn(`CLI ${cli} failed: ${error.message || error}. Trying next CLI...`);
      }
    }

    // All CLIs failed - throw aggregated error
    const errorDetails = errors
      .map(e => `  - ${e.cli}: ${e.error}`)
      .join('\n');
    
    throw new Error(
      `All CLIs failed after ${attempts} attempts:\n${errorDetails}`
    );
  }

  /**
   * Get current CLI name
   * @returns {Promise<string>} Current CLI identifier
   */
  async getCurrentCLI() {
    return detectCLI();
  }

  /**
   * Get fallback order from config
   * @returns {Promise<string[]>} Array of CLI names in fallback order
   */
  async getFallbackOrder() {
    try {
      const config = await this.stateManager.readConfig();
      return config.fallbackOrder || this._getDefaultFallbackOrder();
    } catch (error) {
      // If config read fails, return default
      return this._getDefaultFallbackOrder();
    }
  }

  /**
   * Get default fallback order
   * @private
   * @returns {string[]} Default CLI order
   */
  _getDefaultFallbackOrder() {
    return ['claude-code', 'github-copilot-cli', 'codex-cli'];
  }

  /**
   * Get max retries from config
   * @private
   * @returns {Promise<number>} Max retries value
   */
  async _getMaxRetries() {
    try {
      const config = await this.stateManager.readConfig();
      return config.maxRetries || 3;
    } catch (error) {
      return 3; // Default
    }
  }
}
