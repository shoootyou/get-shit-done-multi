/**
 * StateValidator - State validation and repair utilities
 * 
 * Validates .planning/ directory structure and repairs common issues.
 * Detects concurrent CLI modifications to prevent race conditions.
 * 
 * Features:
 * - Directory structure validation
 * - JSON file integrity checking
 * - Auto-repair with backup
 * - Concurrent modification detection
 * 
 * @example
 * const sv = new StateValidator('.planning');
 * const result = await sv.validate();
 * if (!result.valid) {
 *   await sv.repair({ autoFix: true });
 * }
 * 
 * @module state-validator
 */

import { StateManager } from './state-manager.js';
import { atomicReadJSON } from './state-io.js';
import { promises as fs } from 'fs';
import { join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { detectCLI } = require('../bin/lib/detect.js');

/**
 * StateValidator class for state consistency checks
 */
export class StateValidator {
  /**
   * Create StateValidator instance
   * @param {string} stateDir - Path to state directory (default: '.planning')
   */
  constructor(stateDir = '.planning') {
    this.stateDir = stateDir;
    this.stateManager = new StateManager(stateDir);
  }

  /**
   * Validate directory structure and file integrity
   * 
   * Checks:
   * - Required directories exist (.planning/, .planning/phases/)
   * - JSON files are parseable
   * - Files have valid _version field
   * 
   * @returns {Promise<object>} Validation result
   * {
   *   valid: boolean,      // True if no errors
   *   errors: string[],    // Blocking issues
   *   warnings: string[],  // Non-blocking concerns
   *   repaired: boolean    // True if auto-repair was applied
   * }
   */
  async validate() {
    const errors = [];
    const warnings = [];

    try {
      // Check directory structure
      const dirChecks = [
        { path: this.stateDir, name: '.planning/' },
        { path: join(this.stateDir, 'phases'), name: '.planning/phases/' }
      ];

      for (const { path, name } of dirChecks) {
        try {
          const stats = await fs.stat(path);
          if (!stats.isDirectory()) {
            errors.push(`${name} exists but is not a directory`);
          }
        } catch (error) {
          if (error.code === 'ENOENT') {
            errors.push(`${name} directory not found`);
          } else {
            errors.push(`Cannot access ${name}: ${error.message}`);
          }
        }
      }

      // Check config.json if it exists
      const configPath = join(this.stateDir, 'config.json');
      try {
        await atomicReadJSON(configPath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          // Config missing is not an error - will use defaults
          warnings.push('config.json not found, using defaults');
        } else if (error.name === 'SyntaxError') {
          errors.push(`config.json is not valid JSON: ${error.message}`);
        } else {
          warnings.push(`Cannot read config.json: ${error.message}`);
        }
      }

      // Check STATE.md exists (optional but recommended)
      const statePath = join(this.stateDir, 'STATE.md');
      try {
        await fs.stat(statePath);
      } catch (error) {
        if (error.code === 'ENOENT') {
          warnings.push('STATE.md not found (optional but recommended)');
        }
      }

      // Check all JSON files in .planning/ directory
      try {
        const files = await fs.readdir(this.stateDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        for (const file of jsonFiles) {
          const filePath = join(this.stateDir, file);
          try {
            const data = await atomicReadJSON(filePath);
            
            // Check for _version field in state files
            if (file !== 'config.json' && file !== '.meta.json') {
              if (!data._version) {
                warnings.push(`${file} missing _version field`);
              }
            }
          } catch (error) {
            if (error.name === 'SyntaxError') {
              errors.push(`${file} is not valid JSON: ${error.message}`);
            } else {
              warnings.push(`Cannot read ${file}: ${error.message}`);
            }
          }
        }
      } catch (error) {
        // If we can't read directory, it's already captured in directory checks
      }

    } catch (error) {
      errors.push(`Validation failed: ${error.message}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      repaired: false
    };
  }

  /**
   * Repair common state issues
   * 
   * Fixes:
   * - Creates missing directories
   * - Creates default config.json if missing
   * - Moves unparseable JSON files to .backup/
   * 
   * @param {object} options - Repair options
   * @param {boolean} [options.autoFix=false] - Execute repairs if true, plan only if false
   * @returns {Promise<object>} Repair result
   * {
   *   repaired: boolean,   // True if repairs were executed
   *   actions: string[],   // List of repairs performed/planned
   *   errors: string[]     // Repairs that failed
   * }
   */
  async repair(options = { autoFix: false }) {
    const actions = [];
    const errors = [];
    const { autoFix } = options;

    try {
      // Validate first to identify issues
      const validation = await this.validate();

      // Create missing directories
      const missingDirs = validation.errors
        .filter(e => e.includes('directory not found'))
        .map(e => {
          if (e.includes('.planning/phases/')) {
            return join(this.stateDir, 'phases');
          }
          if (e.includes('.planning/')) {
            return this.stateDir;
          }
          return null;
        })
        .filter(Boolean);

      for (const dir of missingDirs) {
        if (autoFix) {
          try {
            await fs.mkdir(dir, { recursive: true });
            actions.push(`Created directory: ${dir}`);
          } catch (error) {
            errors.push(`Failed to create ${dir}: ${error.message}`);
          }
        } else {
          actions.push(`Would create directory: ${dir}`);
        }
      }

      // Create missing metrics directory
      const metricsDir = join(this.stateDir, 'metrics');
      try {
        await fs.stat(metricsDir);
      } catch (error) {
        if (error.code === 'ENOENT') {
          if (autoFix) {
            try {
              await fs.mkdir(metricsDir, { recursive: true });
              actions.push(`Created directory: ${metricsDir}`);
            } catch (mkdirError) {
              errors.push(`Failed to create ${metricsDir}: ${mkdirError.message}`);
            }
          } else {
            actions.push(`Would create directory: ${metricsDir}`);
          }
        }
      }

      // Create default config.json if missing
      const configMissing = validation.warnings.some(w => w.includes('config.json not found'));
      if (configMissing) {
        if (autoFix) {
          try {
            const defaultConfig = {
              fallbackOrder: ['claude-code', 'github-copilot-cli', 'codex-cli'],
              maxRetries: 3,
              lockTimeout: 10000
            };
            await this.stateManager.writeConfig(defaultConfig);
            actions.push('Created default config.json');
          } catch (error) {
            errors.push(`Failed to create config.json: ${error.message}`);
          }
        } else {
          actions.push('Would create default config.json');
        }
      }

      // Move unparseable JSON files to .backup/
      const unparseableFiles = validation.errors
        .filter(e => e.includes('is not valid JSON'))
        .map(e => {
          const match = e.match(/^(.+?) is not valid JSON/);
          return match ? match[1] : null;
        })
        .filter(Boolean);

      if (unparseableFiles.length > 0) {
        const backupDir = join(this.stateDir, '.backup');
        
        if (autoFix) {
          try {
            await fs.mkdir(backupDir, { recursive: true });
          } catch (error) {
            // Directory might already exist, ignore EEXIST
            if (error.code !== 'EEXIST') {
              errors.push(`Failed to create backup directory: ${error.message}`);
            }
          }
        }

        for (const file of unparseableFiles) {
          const sourcePath = join(this.stateDir, file);
          const backupPath = join(backupDir, `${file}.${Date.now()}.corrupted`);
          
          if (autoFix) {
            try {
              await fs.rename(sourcePath, backupPath);
              actions.push(`Moved corrupted ${file} to .backup/`);
            } catch (error) {
              errors.push(`Failed to backup ${file}: ${error.message}`);
            }
          } else {
            actions.push(`Would move corrupted ${file} to .backup/`);
          }
        }
      }

    } catch (error) {
      errors.push(`Repair failed: ${error.message}`);
    }

    return {
      repaired: autoFix && actions.length > 0,
      actions,
      errors
    };
  }

  /**
   * Detect concurrent modifications by different CLIs
   * 
   * Checks .planning/.meta.json to see if a different CLI modified state
   * since last read. Helps debug race conditions.
   * 
   * @returns {Promise<object>} Detection result
   * {
   *   concurrent: boolean,  // True if different CLI detected
   *   lastCLI: string,      // CLI that last modified state
   *   currentCLI: string    // Current CLI identifier
   * }
   */
  async detectConcurrentModifications() {
    const currentCLI = detectCLI();
    const metaPath = join(this.stateDir, '.meta.json');

    try {
      const meta = await atomicReadJSON(metaPath);
      const lastCLI = meta.lastCLI || 'unknown';
      
      return {
        concurrent: lastCLI !== currentCLI && lastCLI !== 'unknown',
        lastCLI,
        currentCLI
      };
    } catch (error) {
      if (error.code === 'ENOENT') {
        // No meta file - first access
        return {
          concurrent: false,
          lastCLI: 'none',
          currentCLI
        };
      }
      throw error;
    }
  }

  /**
   * Ensure consistency with automatic repair
   * 
   * Convenience method that validates and optionally repairs.
   * Logs warnings to console.
   * 
   * @param {object} options - Options
   * @param {boolean} [options.autoFix=false] - Execute repairs automatically
   * @returns {Promise<object>} Validation result (after repair if autoFix=true)
   */
  async ensureConsistency(options = { autoFix: false }) {
    // Run validation
    let validation = await this.validate();

    // If errors found and autoFix enabled, run repair
    if (!validation.valid && options.autoFix) {
      const repair = await this.repair({ autoFix: true });
      
      // Log repair actions
      for (const action of repair.actions) {
        console.log(`[StateValidator] ${action}`);
      }
      
      // Log repair errors
      for (const error of repair.errors) {
        console.error(`[StateValidator] ERROR: ${error}`);
      }
      
      // Re-validate after repair
      validation = await this.validate();
      validation.repaired = repair.repaired;
    }

    // Log warnings
    for (const warning of validation.warnings) {
      console.warn(`[StateValidator] WARNING: ${warning}`);
    }

    return validation;
  }
}
