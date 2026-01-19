/**
 * Atomic file I/O operations for state management
 * 
 * Provides atomic write-then-rename pattern to prevent data corruption
 * during concurrent CLI usage. Zero npm dependencies.
 * 
 * @module state-io
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Atomically write JSON data to file using write-then-rename pattern
 * 
 * Guarantees:
 * - Write completes atomically or not at all
 * - No partial writes visible to other processes
 * - Safe for concurrent access across multiple CLI processes
 * 
 * Process:
 * 1. Ensure parent directory exists
 * 2. Write to temp file with process PID
 * 3. Atomically rename temp to target (POSIX guarantee on same filesystem)
 * 4. Clean up temp file on any error
 * 
 * @param {string} filePath - Target file path
 * @param {Object} data - Data to write (will be JSON.stringify'd)
 * @returns {Promise<void>}
 * @throws {Error} On write/rename failure or EXDEV (cross-filesystem)
 */
export async function atomicWriteJSON(filePath, data) {
  // Use PID + timestamp + random for uniqueness in concurrent scenarios
  const uniqueSuffix = `${process.pid}.${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
  const tempPath = `${filePath}.${uniqueSuffix}.tmp`;
  const jsonData = JSON.stringify(data, null, 2);

  try {
    // Ensure parent directory exists
    const parentDir = path.dirname(filePath);
    await fs.mkdir(parentDir, { recursive: true });

    // Write to temp file in same directory (ensures same filesystem)
    await fs.writeFile(tempPath, jsonData, {
      mode: 0o600, // Restrictive permissions (owner read/write only)
      encoding: 'utf8'
    });

    // Atomic rename (POSIX guarantees atomicity on same filesystem)
    await fs.rename(tempPath, filePath);
  } catch (err) {
    // Clean up temp file on any error
    try {
      await fs.unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }

    // Provide clear error message for cross-filesystem boundary
    if (err.code === 'EXDEV') {
      throw new Error(
        `Cannot atomically write to ${filePath}: crosses filesystem boundary. ` +
        `Ensure .planning/ directory is on same filesystem as project.`
      );
    }

    throw err;
  }
}

/**
 * Read and parse JSON file with retry logic for transient errors
 * 
 * Handles:
 * - File doesn't exist (returns default if provided)
 * - JSON parse errors with retry (may catch mid-write)
 * - Transient read errors
 * 
 * @param {string} filePath - File to read
 * @param {Object} options - Configuration options
 * @param {number} [options.retry=3] - Number of retry attempts for JSON parse errors
 * @param {Object} [options.default] - Default value if file doesn't exist
 * @returns {Promise<Object>} Parsed JSON object
 * @throws {Error} After retries exhausted or on non-ENOENT errors
 */
export async function atomicReadJSON(filePath, options = {}) {
  const maxRetries = options.retry !== undefined ? options.retry : 3;
  const hasDefault = 'default' in options;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const content = await fs.readFile(filePath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      // File doesn't exist - return default if provided
      if (err.code === 'ENOENT') {
        if (hasDefault) {
          return options.default;
        }
        throw err;
      }

      // JSON parse error - might be mid-write, retry with delay
      if (err instanceof SyntaxError && attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
        continue;
      }

      throw err;
    }
  }

  // Should never reach here due to throw in loop
  throw new Error(`Failed to read ${filePath} after ${maxRetries} attempts`);
}
