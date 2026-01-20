/**
 * State Management Integration
 * Single entry point for all state management components
 * 
 * @module state-integration
 */

import { StateManager } from './state-manager.js';
import { SessionManager } from './session-manager.js';
import { StateValidator } from './state-validator.js';
import { CLIFallback } from './cli-fallback.js';
import { UsageTracker } from './usage-tracker.js';
import { DirectoryLock } from './directory-lock.js';
import path from 'path';

/**
 * Initialize all state management modules with a shared state directory
 * @param {string} stateDir - Path to .planning directory (default: '.planning')
 * @returns {Object} Initialized state modules
 */
export function integrateStateManagement(stateDir = '.planning') {
  return {
    stateManager: new StateManager(stateDir),
    sessionManager: new SessionManager(stateDir),
    stateValidator: new StateValidator(stateDir),
    cliFallback: new CLIFallback(stateDir),
    usageTracker: new UsageTracker(stateDir),
    lock: new DirectoryLock(path.join(stateDir, '.lock'))
  };
}
