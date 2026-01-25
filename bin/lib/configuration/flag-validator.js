/**
 * Flag Validator - Post-parse validation
 * 
 * Validates parsed flag combinations and exits on errors.
 * 
 * Edge cases handled:
 * - Conflicting scopes (--local --global): ERROR, exit 2
 * - Duplicate platforms: Handled by parser (warn + dedupe)
 * - --all with specific platforms: Handled by parser (info + ignore specific)
 * - --all --global: ALLOWED - Claude/Copilot global, Codex local (see codex-warning.js)
 * - Scope without platform: ALLOWED - triggers menu (needsMenu: true)
 */

const { red, reset } = require('../colors');

/**
 * Validate flag combinations
 * @param {string[]} argv - Raw argv (for checking what flags were present)
 * @param {{ platforms: string[], scope: string, needsMenu: boolean }} config - Parsed config
 * @throws Exits process on validation errors
 */
function validateFlags(argv, config) {
  // Check for conflicting scopes (both --local and --global)
  const hasLocal = argv.includes('--local') || argv.includes('-l');
  const hasGlobal = argv.includes('--global') || argv.includes('-g');
  
  if (hasLocal && hasGlobal) {
    console.error(`${red}Error: Cannot use both --local and --global. Choose one.${reset}`);
    console.error(`Example: npx get-shit-done-multi --claude --global`);
    process.exit(2);  // Exit code 2 for command misuse
  }
  
  // All other validations already handled by parser:
  // - Duplicate platforms: deduped with warning
  // - --all with specific platforms: --all wins with info message
  // - Scope without platform: needsMenu flag set
  
  // Validation passed (no errors)
}

module.exports = validateFlags;
