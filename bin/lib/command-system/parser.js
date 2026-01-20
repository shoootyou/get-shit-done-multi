/**
 * Argument Parser - Thin wrapper around Node.js util.parseArgs()
 * Provides consistent argument parsing interface for command system
 * @module command-system/parser
 */

import { parseArgs } from 'node:util';

/**
 * Parse command arguments using Node.js built-in util.parseArgs()
 * @param {string[]} args - Array of arguments to parse
 * @param {object} options - Options configuration for parseArgs (e.g., { verbose: { type: 'boolean' } })
 * @returns {{values: object, positionals: string[], error: string|null}} Parsed result with values, positionals, and optional error
 * 
 * @example
 * const result = parseCommandArgs(['3', '--verbose'], { verbose: { type: 'boolean' } });
 * // Returns: { values: { verbose: true }, positionals: ['3'], error: null }
 */
export function parseCommandArgs(args, options) {
  try {
    const result = parseArgs({
      args,
      options,
      strict: false,
      allowPositionals: true
    });

    return {
      values: result.values || {},
      positionals: result.positionals || [],
      error: null
    };
  } catch (err) {
    return {
      values: {},
      positionals: [],
      error: err.message
    };
  }
}
