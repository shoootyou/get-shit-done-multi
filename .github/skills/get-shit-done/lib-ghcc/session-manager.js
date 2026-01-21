/**
 * SessionManager - Session persistence across CLI switches
 * 
 * Manages temporary session state that needs to survive CLI switches.
 * Session data expires after 24 hours to prevent stale state.
 * 
 * Features:
 * - DirectoryLock for concurrent CLI safety
 * - 24-hour session expiry
 * - CLI switch tracking
 * - Session restoration
 * 
 * @example
 * const sm = new SessionManager('.planning');
 * await sm.saveSession({ currentPhase: '05', currentPlan: '03' });
 * const session = await sm.restoreSession();
 * await sm.switchCLI('codex-cli');
 * 
 * @module session-manager
 */

import { DirectoryLock } from './directory-lock.js';
import { atomicWriteJSON, atomicReadJSON } from './state-io.js';
import { join } from 'path';
import { unlink } from 'fs/promises';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { detectCLI } = require('../bin/lib/detect.js');

/**
 * SessionManager class for CLI-agnostic session persistence
 */
export class SessionManager {
  /**
   * Create SessionManager instance
   * @param {string} stateDir - Path to state directory (default: '.planning')
   */
  constructor(stateDir = '.planning') {
    this.stateDir = stateDir;
    this.sessionFile = join(stateDir, '.session.json');
    this.lockPath = join(stateDir, '.lock');
  }

  /**
   * Save session data with locking for concurrent safety
   * 
   * Session data structure:
   * {
   *   cli: string,           // Current CLI (detectCLI() result)
   *   timestamp: number,     // Date.now()
   *   currentPhase: string,  // Current phase identifier
   *   currentPlan: string,   // Current plan identifier
   *   context: object,       // Session-specific temporary data
   *   _version: number       // Session data version
   * }
   * 
   * @param {object} sessionData - Session data to save
   * @returns {Promise<void>}
   */
  async saveSession(sessionData) {
    // Ensure session has required fields
    const session = {
      cli: sessionData.cli || detectCLI(),
      timestamp: sessionData.timestamp || Date.now(),
      currentPhase: sessionData.currentPhase || null,
      currentPlan: sessionData.currentPlan || null,
      context: sessionData.context || {},
      _version: sessionData._version || 1
    };

    // Use DirectoryLock for concurrent safety
    const lock = new DirectoryLock(this.lockPath);
    await lock.withLock(async () => {
      await atomicWriteJSON(this.sessionFile, session);
    });
  }

  /**
   * Load session data
   * 
   * Returns null if:
   * - Session file doesn't exist
   * - Session is stale (>24 hours old)
   * 
   * @returns {Promise<object|null>} Session data or null
   */
  async loadSession() {
    try {
      const session = await atomicReadJSON(this.sessionFile);
      
      // Check if session is stale (>24 hours)
      const now = Date.now();
      const age = now - (session.timestamp || 0);
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (age > maxAge) {
        // Session expired
        return null;
      }
      
      return session;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist
        return null;
      }
      throw error;
    }
  }

  /**
   * Clear session data
   * 
   * Safely deletes session file. Ignores ENOENT (file already deleted).
   * 
   * @returns {Promise<void>}
   */
  async clearSession() {
    try {
      await unlink(this.sessionFile);
    } catch (error) {
      // Ignore ENOENT - file already deleted
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }

  /**
   * Switch to a different CLI
   * 
   * Updates session with new CLI and refreshes timestamp.
   * Logs CLI switch for debugging.
   * 
   * @param {string} newCLI - New CLI identifier (e.g., 'codex-cli')
   * @returns {Promise<void>}
   */
  async switchCLI(newCLI) {
    // Load current session
    let session = await this.loadSession();
    
    // If no session exists, create new one
    if (!session) {
      session = {
        cli: detectCLI(),
        timestamp: Date.now(),
        currentPhase: null,
        currentPlan: null,
        context: {},
        _version: 1
      };
    }
    
    // Log CLI switch for debugging
    console.log(`[SessionManager] CLI switch: ${session.cli} → ${newCLI}`);
    
    // Update CLI and timestamp
    session.cli = newCLI;
    session.timestamp = Date.now();
    
    // Save updated session
    await this.saveSession(session);
  }

  /**
   * Restore session or create fresh session
   * 
   * Returns valid session data or fresh session if none exists/expired.
   * 
   * @returns {Promise<object>} Session data (never null)
   */
  async restoreSession() {
    // Try to load existing session
    const session = await this.loadSession();
    
    if (session) {
      return session;
    }
    
    // No valid session - return fresh session
    return {
      cli: detectCLI(),
      timestamp: Date.now(),
      currentPhase: null,
      currentPlan: null,
      context: {},
      _version: 1
    };
  }
}
