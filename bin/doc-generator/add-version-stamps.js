#!/usr/bin/env node
/**
 * Documentation Version Stamping Utility
 * 
 * Adds version stamps and "Added in vX.Y" badges to generated documentation.
 * Marks generated files with metadata headers to prevent manual edits.
 * Zero npm dependencies - uses only Node.js built-ins.
 * 
 * @module add-version-stamps
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Read package.json to get current GSD version
 * 
 * @returns {Promise<string>} Current version from package.json
 */
async function getGSDVersion() {
  try {
    const packagePath = path.join(__dirname, '..', '..', 'package.json');
    const packageData = await fs.readFile(packagePath, 'utf-8');
    const pkg = JSON.parse(packageData);
    return pkg.version || '0.0.0';
  } catch (error) {
    console.warn('Warning: Could not read package.json version, using 0.0.0');
    return '0.0.0';
  }
}

/**
 * Format timestamp in human-readable format
 * 
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string (e.g., "January 20, 2026")
 */
function formatDate(date) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  const month = months[date.getMonth()];
  const day = date.getDate();
  const year = date.getFullYear();
  
  return `${month} ${day}, ${year}`;
}

/**
 * Add version stamp header to Markdown file
 * 
 * @param {string} content - Original file content
 * @param {Object} options - Stamping options
 * @param {string} options.generator - Name of the generator script
 * @param {string} options.version - GSD version
 * @returns {string} Content with version stamp prepended
 */
function addVersionStamp(content, options = {}) {
  const now = new Date();
  const timestamp = now.toISOString();
  const humanDate = formatDate(now);
  
  const generator = options.generator || 'unknown';
  const version = options.version || '0.0.0';
  
  // Create frontmatter header
  const frontmatter = `---
generated: true
timestamp: ${timestamp}
generator: ${generator}
gsd-version: ${version}
---

> **Note:** This file is auto-generated. Do not edit manually.
> Last generated: ${humanDate}

`;
  
  // If content already has frontmatter, replace it
  const frontmatterRegex = /^---\n[\s\S]*?---\n\n>/m;
  if (frontmatterRegex.test(content)) {
    return content.replace(frontmatterRegex, frontmatter.trim());
  }
  
  // Otherwise, prepend it
  return frontmatter + content;
}

/**
 * Add feature version badge to text
 * 
 * @param {string} text - Text to add badge to
 * @param {string} version - Version to badge (e.g., "2.0.0")
 * @returns {string} Text with badge appended
 */
function addFeatureBadge(text, version) {
  // Simple implementation: add badge at end of line
  return `${text} \`Added in v${version}\``;
}

/**
 * Stamp a single documentation file
 * 
 * @param {string} filePath - Path to documentation file
 * @param {Object} options - Stamping options
 * @returns {Promise<void>}
 */
async function stampFile(filePath, options = {}) {
  try {
    // Read file content
    const content = await fs.readFile(filePath, 'utf-8');
    
    // Determine generator name from file
    const fileName = path.basename(filePath);
    const generatorMap = {
      'cli-comparison.md': 'generate-comparison.js',
      'capability-data.json': 'extract-capabilities.js',
      'capability-matrix.html': 'generate-matrix.js'
    };
    
    const generator = options.generator || generatorMap[fileName] || 'unknown';
    
    // Add version stamp
    const stamped = addVersionStamp(content, {
      generator,
      version: options.version
    });
    
    // Write back to file
    await fs.writeFile(filePath, stamped, 'utf-8');
    
    console.log(`✓ Stamped: ${fileName}`);
  } catch (error) {
    console.error(`✗ Failed to stamp ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Stamp all generated documentation files
 * 
 * @param {string} docsDir - Path to docs directory
 * @returns {Promise<void>}
 */
async function stampAllDocs(docsDir) {
  const version = await getGSDVersion();
  
  // Files to stamp (only generated files, not manual docs)
  const generatedFiles = [
    'cli-comparison.md'
  ];
  
  console.log(`Stamping generated docs with version ${version}...`);
  
  for (const file of generatedFiles) {
    const filePath = path.join(docsDir, file);
    try {
      await stampFile(filePath, { version });
    } catch (error) {
      // File might not exist yet, that's okay
      if (error.code !== 'ENOENT') {
        throw error;
      }
    }
  }
  
  console.log('✓ All generated docs stamped');
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    // Stamp all docs
    const docsDir = path.join(__dirname, '..', '..', 'docs');
    stampAllDocs(docsDir).catch(error => {
      console.error('Error stamping docs:', error);
      process.exit(1);
    });
  } else {
    // Stamp specific file
    const filePath = path.resolve(args[0]);
    getGSDVersion().then(version => {
      return stampFile(filePath, { version });
    }).catch(error => {
      console.error('Error stamping file:', error);
      process.exit(1);
    });
  }
}

module.exports = {
  addVersionStamp,
  addFeatureBadge,
  stampFile,
  stampAllDocs,
  getGSDVersion
};
