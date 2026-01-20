/**
 * Diagnostic Test Framework - Base class and runner
 * Modular diagnostic tests following "doctor" pattern
 * Used by /gsd:verify-installation command
 * 
 * @module verification/diagnostic-test
 */

/**
 * Base class for diagnostic tests
 * Extend this class to create specific verification tests
 * 
 * @example
 * class MyTest extends DiagnosticTest {
 *   constructor() {
 *     super('My Test', 'Verify something works');
 *   }
 *   
 *   async run() {
 *     return {
 *       status: 'pass',
 *       message: 'Everything works!',
 *       fixes: []
 *     };
 *   }
 * }
 */
class DiagnosticTest {
  /**
   * Create a diagnostic test
   * @param {string} name - Test name (e.g., "CLI Installed")
   * @param {string} description - Human-readable description
   */
  constructor(name, description) {
    this.name = name;
    this.description = description;
  }
  
  /**
   * Run the diagnostic test
   * Must be implemented by subclasses
   * 
   * @returns {Promise<{status: string, message: string, fixes: string[]}>}
   *   - status: 'pass' | 'fail' | 'warn'
   *   - message: Human-readable result message
   *   - fixes: Array of actionable fix suggestions
   */
  async run() {
    throw new Error(`${this.name}: Must implement run() method`);
  }
}

module.exports = {
  DiagnosticTest
};
