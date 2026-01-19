/**
 * Directory-based locking mechanism for multi-process coordination
 * 
 * Uses fs.mkdir() atomicity to implement locks without npm dependencies.
 * Safe for concurrent CLI usage across Claude Code, Copilot CLI, and Codex CLI.
 * 
 * @module directory-lock
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Directory-based lock for multi-process coordination
 * 
 * Provides exclusive access to shared resources using atomic directory creation.
 * Lock acquisition uses fs.mkdir() which is atomic across processes (OS kernel guarantee).
 * 
 * Features:
 * - Exponential backoff with jitter to prevent thundering herd
 * - Automatic cleanup via withLock() finally block
 * - Safe for concurrent access across multiple CLI processes
 * 
 * Example:
 * ```js
 * const lock = new DirectoryLock('.planning/.lock');
 * await lock.withLock(async () => {
 *   // Critical section - only one process at a time
 *   const state = await readState();
 *   state.lastUpdate = Date.now();
 *   await writeState(state);
 * });
 * ```
 * 
 * @class
 */
export class DirectoryLock {
  /**
   * Create a directory-based lock
   * 
   * @param {string} lockPath - Path to lock directory (e.g., '.planning/.lock')
   * @param {Object} options - Configuration options
   * @param {number} [options.maxRetries=10] - Maximum lock acquisition attempts
   * @param {number} [options.baseDelay=100] - Base delay in ms for exponential backoff
   */
  constructor(lockPath, options = {}) {
    this.lockPath = lockPath;
    this.maxRetries = options.maxRetries !== undefined ? options.maxRetries : 10;
    this.baseDelay = options.baseDelay !== undefined ? options.baseDelay : 100;
  }

  /**
   * Acquire exclusive lock
   * 
   * Attempts to create lock directory using fs.mkdir(). If directory already exists
   * (EEXIST error), another process holds the lock. Retry with exponential backoff.
   * 
   * Backoff strategy:
   * - delay = baseDelay * 2^attempt
   * - jitter = random(0, 100ms)
   * - total wait = delay + jitter
   * 
   * @returns {Promise<boolean>} True on successful acquisition
   * @throws {Error} After maxRetries exhausted or on non-EEXIST errors
   */
  async acquire() {
    // Ensure parent directory exists before creating lock
    const parentDir = path.dirname(this.lockPath);
    await fs.mkdir(parentDir, { recursive: true });
    
    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        // Atomic lock acquisition - mkdir is atomic across processes
        await fs.mkdir(this.lockPath);
        return true;
      } catch (err) {
        if (err.code === 'EEXIST') {
          // Lock held by another process - wait and retry
          
          // Exponential backoff: 100ms, 200ms, 400ms, 800ms, ...
          const delay = this.baseDelay * Math.pow(2, attempt);
          
          // Add jitter to prevent thundering herd
          const jitter = Math.random() * 100;
          
          await new Promise(resolve => setTimeout(resolve, delay + jitter));
          continue;
        }
        
        // Other errors (permissions, etc.) - fail immediately
        throw err;
      }
    }
    
    throw new Error(
      `Failed to acquire lock at ${this.lockPath} after ${this.maxRetries} attempts. ` +
      `Another CLI process may be running. Wait for it to complete or remove lock manually.`
    );
  }

  /**
   * Release exclusive lock
   * 
   * Removes lock directory. Ignores ENOENT (already released).
   * Safe to call multiple times.
   * 
   * @returns {Promise<void>}
   * @throws {Error} On errors other than ENOENT
   */
  async release() {
    try {
      await fs.rmdir(this.lockPath);
    } catch (err) {
      // Ignore ENOENT - lock already released
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  /**
   * Execute operation with automatic lock acquisition and release
   * 
   * Acquires lock, executes operation, and releases lock even on errors.
   * Ensures cleanup via finally block.
   * 
   * @param {Function} operation - Async function to execute with lock held
   * @returns {Promise<*>} Result of operation
   * @throws {Error} If lock acquisition fails or operation throws
   */
  async withLock(operation) {
    await this.acquire();
    
    try {
      return await operation();
    } finally {
      // Always release lock, even on errors
      await this.release();
    }
  }
}
