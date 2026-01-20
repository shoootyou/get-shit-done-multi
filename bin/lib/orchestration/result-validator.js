/**
 * ResultValidator - Validates .planning/ directory structure for cross-CLI compatibility
 * 
 * Ensures that .planning/ structure created by agents is consistent across
 * Claude, Copilot, and Codex CLIs, enabling seamless CLI switching.
 */

const fs = require('fs').promises;
const path = require('path');

class ResultValidator {
  constructor(planningDir = '.planning') {
    this.planningDir = planningDir;
    
    // Define required .planning/ structure for CLI compatibility
    this.requiredStructure = {
      'STATE.md': 'file',
      'ROADMAP.md': 'file',
      'REQUIREMENTS.md': 'file',
      'PROJECT.md': 'file',
      'config.json': 'file',
      'phases/': 'directory',
      'metrics/': 'directory'
    };
  }

  /**
   * Validate that .planning/ directory has required structure
   * @returns {Promise<{valid: boolean, errors: string[]}>}
   */
  async validateStructure() {
    const errors = [];

    for (const [itemPath, expectedType] of Object.entries(this.requiredStructure)) {
      const fullPath = path.join(this.planningDir, itemPath);
      
      try {
        const stats = await fs.stat(fullPath);
        
        // Check if type matches expectation
        if (expectedType === 'file' && !stats.isFile()) {
          errors.push(`Expected ${itemPath} to be a file, but found directory`);
        } else if (expectedType === 'directory' && !stats.isDirectory()) {
          errors.push(`Expected ${itemPath} to be a directory, but found file`);
        }
      } catch (err) {
        if (err.code === 'ENOENT') {
          errors.push(`Missing required ${expectedType}: ${itemPath}`);
        } else {
          errors.push(`Error checking ${itemPath}: ${err.message}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate that a JSON file is parseable
   * @param {string} filePath - Path relative to planningDir
   * @returns {Promise<{valid: boolean, error?: string}>}
   */
  async validateJSON(filePath) {
    const fullPath = path.join(this.planningDir, filePath);
    
    try {
      const content = await fs.readFile(fullPath, 'utf8');
      JSON.parse(content);
      
      return { valid: true };
    } catch (err) {
      if (err.code === 'ENOENT') {
        return { valid: false, error: `File not found: ${filePath}` };
      } else if (err instanceof SyntaxError) {
        return { valid: false, error: `Invalid JSON in ${filePath}: ${err.message}` };
      } else {
        return { valid: false, error: `Error reading ${filePath}: ${err.message}` };
      }
    }
  }

  /**
   * Validate agent output in a phase directory
   * @param {string} phasePath - Path to phase directory relative to planningDir
   * @returns {Promise<{valid: boolean, errors: string[], warnings: string[]}>}
   */
  async validateAgentOutput(phasePath) {
    const fullPath = path.join(this.planningDir, phasePath);
    const errors = [];
    const warnings = [];

    try {
      const entries = await fs.readdir(fullPath);
      
      // Find PLAN and SUMMARY files
      const planFiles = entries.filter(f => f.match(/\d+-\d+-PLAN\.md$/));
      const summaryFiles = entries.filter(f => f.match(/\d+-\d+-SUMMARY\.md$/));
      
      // Check that at least one PLAN file exists
      if (planFiles.length === 0) {
        errors.push(`No PLAN.md files found in ${phasePath}`);
      }
      
      // SUMMARY files may not exist during planning - not an error, just a note
      if (summaryFiles.length === 0) {
        warnings.push(`No SUMMARY.md files found in ${phasePath} (may be in planning stage)`);
      }
      
      // Verify PLAN files have corresponding structure
      for (const planFile of planFiles) {
        const planPath = path.join(fullPath, planFile);
        try {
          const content = await fs.readFile(planPath, 'utf8');
          
          // Check for frontmatter
          if (!content.startsWith('---')) {
            errors.push(`${planFile} missing frontmatter`);
          }
          
          // Check for required sections
          const requiredSections = ['<objective>', '<tasks>', '<verification>'];
          for (const section of requiredSections) {
            if (!content.includes(section)) {
              errors.push(`${planFile} missing required section: ${section}`);
            }
          }
        } catch (err) {
          errors.push(`Error reading ${planFile}: ${err.message}`);
        }
      }
      
    } catch (err) {
      if (err.code === 'ENOENT') {
        errors.push(`Phase directory not found: ${phasePath}`);
      } else {
        errors.push(`Error reading phase directory ${phasePath}: ${err.message}`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate complete .planning/ directory
   * @returns {Promise<{valid: boolean, structureErrors: string[], jsonErrors: object[], phaseErrors: object[]}>}
   */
  async validateAll() {
    const structureResult = await this.validateStructure();
    const jsonErrors = [];
    const phaseErrors = [];

    // Validate JSON files if structure is valid
    if (structureResult.valid) {
      // Check config.json
      const configResult = await this.validateJSON('config.json');
      if (!configResult.valid) {
        jsonErrors.push({ file: 'config.json', error: configResult.error });
      }

      // Check phases
      try {
        const phasesPath = path.join(this.planningDir, 'phases');
        const phases = await fs.readdir(phasesPath);
        
        for (const phase of phases) {
          if (phase.startsWith('.')) continue; // Skip hidden files
          
          const phaseStats = await fs.stat(path.join(phasesPath, phase));
          if (phaseStats.isDirectory()) {
            const phaseResult = await this.validateAgentOutput(`phases/${phase}`);
            if (!phaseResult.valid || phaseResult.warnings.length > 0) {
              phaseErrors.push({
                phase,
                errors: phaseResult.errors,
                warnings: phaseResult.warnings
              });
            }
          }
        }
      } catch (err) {
        // Phases directory might not exist yet
        if (err.code !== 'ENOENT') {
          phaseErrors.push({ phase: 'phases/', error: err.message });
        }
      }
    }

    return {
      valid: structureResult.valid && jsonErrors.length === 0 && phaseErrors.length === 0,
      structureErrors: structureResult.errors,
      jsonErrors,
      phaseErrors
    };
  }
}

module.exports = { ResultValidator };
