/**
 * Bulk Migration Script for Agents
 * 
 * Automates conversion of all agents from agents/ to specs/agents/ format
 * with platform-specific template variables.
 */

const fs = require('fs');
const path = require('path');
const { convertAgentToSpec } = require('./agent-converter');

/**
 * Migrate all agents from source directory to target directory
 * 
 * @param {string} sourceDir - Path to agents/ directory
 * @param {string} targetDir - Path to specs/agents/ directory  
 * @param {object} options - {dryRun, verbose, skipExisting}
 * @returns {object} {success: boolean, migrated: [], warnings: [], errors: []}
 */
function migrateAllAgents(sourceDir = 'agents', targetDir = 'specs/agents', options = {}) {
  const results = { migrated: [], warnings: [], errors: [] };
  
  // Ensure directories exist
  if (!fs.existsSync(sourceDir)) {
    results.errors.push({ error: `Source directory not found: ${sourceDir}` });
    results.success = false;
    return results;
  }
  
  // Create target directory if it doesn't exist
  if (!options.dryRun && !fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  
  // Get all .md files from source directory
  const agentFiles = fs.readdirSync(sourceDir)
    .filter(f => f.endsWith('.md'))
    .sort(); // Consistent order
  
  if (agentFiles.length === 0) {
    results.warnings.push('No .md files found in source directory');
  }

  for (const file of agentFiles) {
    const sourcePath = path.join(sourceDir, file);
    const targetPath = path.join(targetDir, file);
    
    // Skip if target exists and skipExisting=true
    if (options.skipExisting && fs.existsSync(targetPath)) {
      results.warnings.push({ file, message: 'Skipped (already exists)' });
      continue;
    }

    try {
      // Convert agent to spec
      const conversionResult = convertAgentToSpec(sourcePath);
      
      if (!conversionResult.success) {
        results.errors.push({ 
          file, 
          errors: conversionResult.errors,
          warnings: conversionResult.warnings 
        });
        continue;
      }

      // Dry run: don't write files
      if (options.dryRun) {
        results.migrated.push({ file, dryRun: true });
        if (options.verbose) {
          console.log(`[DRY RUN] Would migrate: ${file}`);
        }
        continue;
      }

      // Write spec to target directory
      fs.writeFileSync(targetPath, conversionResult.spec, 'utf8');
      
      results.migrated.push({ 
        file, 
        success: true,
        targetPath,
        warningCount: conversionResult.warnings.length
      });
      
      if (options.verbose) {
        console.log(`✓ Migrated: ${file}`);
        if (conversionResult.warnings.length > 0) {
          conversionResult.warnings.forEach(w => {
            console.log(`  ⚠ ${w}`);
          });
        }
      }

      // Collect warnings from conversion
      if (conversionResult.warnings && conversionResult.warnings.length > 0) {
        results.warnings.push({ 
          file, 
          warnings: conversionResult.warnings 
        });
      }

    } catch (error) {
      results.errors.push({ 
        file, 
        error: error.message,
        stack: error.stack 
      });
    }
  }

  results.success = results.errors.length === 0;
  return results;
}

/**
 * Validate all specs in directory can be read (basic existence check)
 * 
 * Note: We can't parse template specs with gray-matter because they contain
 * Mustache variables. This function just checks files exist and are readable.
 * 
 * @param {string} specsDir - Path to specs/agents/ directory
 * @returns {object} {valid: [], invalid: []}
 */
function validateMigration(specsDir = 'specs/agents') {
  const results = { valid: [], invalid: [] };
  
  if (!fs.existsSync(specsDir)) {
    results.invalid.push({ 
      file: specsDir, 
      error: 'Directory does not exist' 
    });
    return results;
  }
  
  const specFiles = fs.readdirSync(specsDir)
    .filter(f => f.endsWith('.md'));

  for (const file of specFiles) {
    const specPath = path.join(specsDir, file);
    try {
      // Basic validation: file exists and is readable
      const content = fs.readFileSync(specPath, 'utf8');
      
      // Check for required template markers
      const hasClaudeBlock = content.includes('{{#isClaude}}');
      const hasCopilotBlock = content.includes('{{#isCopilot}}');
      const hasFrontmatter = content.startsWith('---');
      
      if (!hasClaudeBlock && !hasCopilotBlock) {
        results.invalid.push({ 
          file, 
          error: 'Missing platform conditionals ({{#isClaude}} or {{#isCopilot}})' 
        });
      } else if (!hasFrontmatter) {
        results.invalid.push({ 
          file, 
          error: 'Missing YAML frontmatter (should start with ---)' 
        });
      } else {
        results.valid.push(file);
      }
    } catch (error) {
      results.invalid.push({ 
        file, 
        error: error.message 
      });
    }
  }

  return results;
}

/**
 * Generate migration report with statistics
 * 
 * @param {object} migrationResults - Results from migrateAllAgents()
 * @returns {string} Human-readable report
 */
function generateMigrationReport(migrationResults) {
  const lines = [];
  
  lines.push('=== Migration Report ===');
  lines.push('');
  lines.push(`Status: ${migrationResults.success ? '✓ SUCCESS' : '✗ FAILED'}`);
  lines.push(`Migrated: ${migrationResults.migrated.length}`);
  lines.push(`Warnings: ${migrationResults.warnings.length}`);
  lines.push(`Errors: ${migrationResults.errors.length}`);
  lines.push('');
  
  if (migrationResults.migrated.length > 0) {
    lines.push('Migrated files:');
    migrationResults.migrated.forEach(m => {
      lines.push(`  ✓ ${m.file}${m.warningCount ? ` (${m.warningCount} warnings)` : ''}`);
    });
    lines.push('');
  }
  
  if (migrationResults.warnings.length > 0) {
    lines.push('Warnings:');
    migrationResults.warnings.forEach(w => {
      if (typeof w === 'string') {
        lines.push(`  ⚠ ${w}`);
      } else if (w.message) {
        lines.push(`  ⚠ ${w.file}: ${w.message}`);
      } else if (w.warnings) {
        lines.push(`  ⚠ ${w.file}:`);
        w.warnings.forEach(msg => lines.push(`    - ${msg}`));
      }
    });
    lines.push('');
  }
  
  if (migrationResults.errors.length > 0) {
    lines.push('Errors:');
    migrationResults.errors.forEach(e => {
      if (typeof e === 'string') {
        lines.push(`  ✗ ${e}`);
      } else if (e.error) {
        lines.push(`  ✗ ${e.file || 'Unknown'}: ${e.error}`);
      } else if (e.errors) {
        lines.push(`  ✗ ${e.file}:`);
        e.errors.forEach(msg => lines.push(`    - ${msg}`));
      }
    });
  }
  
  return lines.join('\n');
}

module.exports = {
  migrateAllAgents,
  validateMigration,
  generateMigrationReport
};
