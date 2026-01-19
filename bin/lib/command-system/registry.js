/**
 * Command Registry - Map-based storage for dynamic command system
 * Implements Command Registry Pattern for storing and retrieving command definitions
 * @module command-system/registry
 */

/**
 * CommandRegistry class provides centralized command storage and retrieval
 * using Map-based storage for O(1) operations.
 */
export class CommandRegistry {
  constructor() {
    /** @type {Map<string, {metadata: object, handler: Function}>} */
    this.commands = new Map();
  }

  /**
   * Register a command with its metadata and handler function
   * @param {string} name - Command name (e.g., 'gsd:help', 'gsd:execute-phase')
   * @param {object} metadata - Command metadata (description, options, etc.)
   * @param {Function} handler - Async function that executes the command
   * @returns {void}
   */
  register(name, metadata, handler) {
    this.commands.set(name, { metadata, handler });
  }

  /**
   * Retrieve a command by name
   * @param {string} name - Command name to retrieve
   * @returns {{metadata: object, handler: Function}|null} Command object or null if not found
   */
  get(name) {
    return this.commands.get(name) || null;
  }

  /**
   * Get list of all registered command names
   * @returns {string[]} Array of command names
   */
  list() {
    return Array.from(this.commands.keys());
  }

  /**
   * Check if a command exists in the registry
   * @param {string} name - Command name to check
   * @returns {boolean} True if command exists, false otherwise
   */
  has(name) {
    return this.commands.has(name);
  }
}

/**
 * Singleton registry instance for global command storage
 * @type {CommandRegistry}
 */
export const registry = new CommandRegistry();
