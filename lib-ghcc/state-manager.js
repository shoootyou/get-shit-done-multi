import { atomicWriteJSON, atomicReadJSON } from './state-io.js';
import { mkdir } from 'fs/promises';
import { join } from 'path';

/**
 * StateManager - High-level state management for .planning/ directory
 * 
 * Provides CLI-agnostic state read/write with version tracking and config management.
 * Works consistently across Claude Code, GitHub Copilot CLI, and Codex CLI.
 * 
 * Features:
 * - Atomic state operations (via state-io.js)
 * - Version tracking for migration support
 * - Config file management with defaults
 * - Lazy loading (no I/O in constructor)
 * 
 * @example
 * const sm = new StateManager('.planning');
 * await sm.ensureStateDir();
 * const state = await sm.readState('STATE.json');
 * await sm.updateState('STATE.json', s => ({ ...s, foo: 'bar' }));
 */
export class StateManager {
  /**
   * Create StateManager instance
   * @param {string} stateDir - Path to state directory (default: '.planning')
   */
  constructor(stateDir = '.planning') {
    this.stateDir = stateDir;
  }

  /**
   * Read state from file
   * @param {string} filename - State file name (default: 'STATE.md')
   * @returns {Promise<object>} State object with _version field
   */
  async readState(filename = 'STATE.md') {
    const filePath = join(this.stateDir, filename);
    try {
      const state = await atomicReadJSON(filePath);
      // Ensure state has _version field
      if (!state._version) {
        state._version = 1;
      }
      return state;
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, return initial state
        return { _version: 1 };
      }
      throw error;
    }
  }

  /**
   * Write state to file
   * @param {string} filename - State file name (default: 'STATE.md')
   * @param {object} data - State data (must include _version field)
   * @returns {Promise<void>}
   */
  async writeState(filename = 'STATE.md', data) {
    if (!data._version) {
      throw new Error('State data must include _version field');
    }
    
    // Ensure directory exists before writing
    await this.ensureStateDir();
    
    const filePath = join(this.stateDir, filename);
    await atomicWriteJSON(filePath, data);
  }

  /**
   * Update state using transformation function
   * @param {string} filename - State file name (default: 'STATE.md')
   * @param {function} updateFn - Function to transform state: (state) => newState
   * @returns {Promise<object>} Updated state
   */
  async updateState(filename = 'STATE.md', updateFn) {
    // Read current state
    const currentState = await this.readState(filename);
    
    // Apply transformation
    const updatedState = updateFn(currentState);
    
    // Increment version
    updatedState._version = (currentState._version || 0) + 1;
    
    // Write updated state
    await this.writeState(filename, updatedState);
    
    return updatedState;
  }

  /**
   * Read configuration from config.json
   * @returns {Promise<object>} Config object merged with defaults
   */
  async readConfig() {
    const configPath = join(this.stateDir, 'config.json');
    const defaults = {
      fallbackOrder: ['claude-code', 'github-copilot-cli', 'codex-cli'],
      maxRetries: 3,
      lockTimeout: 10000
    };

    try {
      const userConfig = await atomicReadJSON(configPath);
      // Merge user config with defaults (user config takes precedence)
      return { ...defaults, ...userConfig };
    } catch (error) {
      if (error.code === 'ENOENT') {
        // Config doesn't exist, return defaults
        return defaults;
      }
      throw error;
    }
  }

  /**
   * Write configuration to config.json
   * @param {object} config - Configuration object
   * @returns {Promise<void>}
   */
  async writeConfig(config) {
    const configPath = join(this.stateDir, 'config.json');
    
    // Merge with existing config to preserve user customizations
    const existingConfig = await this.readConfig();
    const mergedConfig = { ...existingConfig, ...config };
    
    await atomicWriteJSON(configPath, mergedConfig);
  }

  /**
   * Ensure state directory exists
   * @returns {Promise<void>}
   */
  async ensureStateDir() {
    await mkdir(this.stateDir, { recursive: true });
  }
}
