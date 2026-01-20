#!/usr/bin/env node
/**
 * Documentation Validation Script
 * 
 * Comprehensive documentation validator checking links, freshness, and structure.
 * Ensures generated docs stay accurate and in sync with code.
 * Zero npm dependencies - uses only Node.js built-ins.
 * 
 * @module validate-docs
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Check for broken internal links in documentation
 * 
 * @param {string} docsDir - Path to docs directory
 * @returns {Promise<{valid: boolean, brokenLinks: Array}>}
 */
async function checkBrokenLinks(docsDir) {
  const brokenLinks = [];
  
  try {
    // Get all markdown files
    const files = await fs.readdir(docsDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    for (const file of mdFiles) {
      const filePath = path.join(docsDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Find all markdown links: [text](path)
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
      let match;
      
      while ((match = linkRegex.exec(content)) !== null) {
        const linkText = match[1];
        const linkTarget = match[2];
        
        // Skip external links (http/https)
        if (linkTarget.startsWith('http://') || linkTarget.startsWith('https://')) {
          continue;
        }
        
        // Skip anchors and fragments
        if (linkTarget.startsWith('#')) {
          continue;
        }
        
        // Remove fragments from target
        const targetPath = linkTarget.split('#')[0];
        
        // Resolve relative path
        const resolvedPath = path.join(docsDir, targetPath);
        
        // Check if target exists
        try {
          await fs.access(resolvedPath);
        } catch (error) {
          brokenLinks.push({
            file,
            text: linkText,
            target: linkTarget,
            resolved: resolvedPath
          });
        }
      }
    }
    
    return {
      valid: brokenLinks.length === 0,
      brokenLinks
    };
  } catch (error) {
    console.error('Error checking links:', error.message);
    return {
      valid: false,
      brokenLinks: [],
      error: error.message
    };
  }
}

/**
 * Check if generated docs are fresh (not stale)
 * 
 * @param {string} docsDir - Path to docs directory
 * @returns {Promise<{fresh: boolean, staleFiles: Array}>}
 */
async function checkFreshness(docsDir) {
  const staleFiles = [];
  const now = Date.now();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  
  try {
    // Files to check for freshness
    const generatedFiles = [
      'cli-comparison.md',
      'capability-data.json'
    ];
    
    for (const file of generatedFiles) {
      const filePath = path.join(docsDir, file);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check for version stamp
        const timestampMatch = content.match(/timestamp: (.+)/);
        if (!timestampMatch) {
          staleFiles.push({
            file,
            reason: 'Missing version stamp - file may not be generated',
            age: null
          });
          continue;
        }
        
        // Parse timestamp
        const timestamp = new Date(timestampMatch[1]);
        const ageMs = now - timestamp.getTime();
        const ageDays = Math.floor(ageMs / (24 * 60 * 60 * 1000));
        
        if (ageMs > sevenDaysMs) {
          staleFiles.push({
            file,
            reason: `File is ${ageDays} days old (> 7 days)`,
            age: ageDays
          });
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          staleFiles.push({
            file,
            reason: 'File does not exist',
            age: null
          });
        } else {
          throw error;
        }
      }
    }
    
    // Check if capability-data.json matches capability-matrix.js
    try {
      const dataPath = path.join(docsDir, 'capability-data.json');
      const matrixPath = path.join(__dirname, '..', 'lib-ghcc', 'orchestration', 'capability-matrix.js');
      
      const dataStat = await fs.stat(dataPath);
      const matrixStat = await fs.stat(matrixPath);
      
      // If capability-matrix.js is newer than data JSON, it's stale
      if (matrixStat.mtime > dataStat.mtime) {
        staleFiles.push({
          file: 'capability-data.json',
          reason: 'capability-matrix.js has been modified since data was generated',
          age: null
        });
      }
    } catch (error) {
      // Files might not exist, that's handled above
    }
    
    return {
      fresh: staleFiles.length === 0,
      staleFiles
    };
  } catch (error) {
    console.error('Error checking freshness:', error.message);
    return {
      fresh: false,
      staleFiles: [],
      error: error.message
    };
  }
}

/**
 * Check if required doc files exist and have proper structure
 * 
 * @param {string} docsDir - Path to docs directory
 * @returns {Promise<{valid: boolean, missing: Array, incomplete: Array}>}
 */
async function checkStructure(docsDir) {
  const missing = [];
  const incomplete = [];
  
  try {
    // Required files with their expected sections
    const requiredFiles = {
      'cli-comparison.md': ['## Agent Availability', '## CLI-Specific Limitations'],
      'setup-claude-code.md': ['## Prerequisites', '## Installation'],
      'setup-copilot-cli.md': ['## Prerequisites', '## Installation'],
      'setup-codex-cli.md': ['## Prerequisites', '## Installation'],
      'troubleshooting.md': ['## Common Issues'],
      'migration-guide.md': ['## Migration Process'],
      'capability-matrix.html': ['<div id="capability-matrix"']
    };
    
    for (const [file, requiredSections] of Object.entries(requiredFiles)) {
      const filePath = path.join(docsDir, file);
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        
        // Check for required sections
        const missingSections = [];
        for (const section of requiredSections) {
          if (!content.includes(section)) {
            missingSections.push(section);
          }
        }
        
        if (missingSections.length > 0) {
          incomplete.push({
            file,
            missingSections
          });
        }
      } catch (error) {
        if (error.code === 'ENOENT') {
          missing.push(file);
        } else {
          throw error;
        }
      }
    }
    
    return {
      valid: missing.length === 0 && incomplete.length === 0,
      missing,
      incomplete
    };
  } catch (error) {
    console.error('Error checking structure:', error.message);
    return {
      valid: false,
      missing: [],
      incomplete: [],
      error: error.message
    };
  }
}

/**
 * Run all documentation validation checks
 * 
 * @param {string} docsDir - Path to docs directory
 * @returns {Promise<{success: boolean, results: Object}>}
 */
async function validateDocs(docsDir) {
  console.log('Validating documentation...\n');
  
  // Run all checks
  const linkResults = await checkBrokenLinks(docsDir);
  const freshnessResults = await checkFreshness(docsDir);
  const structureResults = await checkStructure(docsDir);
  
  // Format results
  console.log('Link Validation:');
  if (linkResults.valid) {
    console.log('  ✓ No broken links found');
  } else {
    console.log('  ✗ Broken links detected:');
    for (const link of linkResults.brokenLinks) {
      console.log(`    - ${link.file}: [${link.text}](${link.target})`);
    }
  }
  
  console.log('\nFreshness Check:');
  if (freshnessResults.fresh) {
    console.log('  ✓ All generated docs are fresh');
  } else {
    console.log('  ✗ Stale documentation detected:');
    for (const file of freshnessResults.staleFiles) {
      console.log(`    - ${file.file}: ${file.reason}`);
    }
  }
  
  console.log('\nStructure Validation:');
  if (structureResults.valid) {
    console.log('  ✓ All required files present with proper structure');
  } else {
    if (structureResults.missing.length > 0) {
      console.log('  ✗ Missing files:');
      for (const file of structureResults.missing) {
        console.log(`    - ${file}`);
      }
    }
    if (structureResults.incomplete.length > 0) {
      console.log('  ✗ Incomplete files:');
      for (const file of structureResults.incomplete) {
        console.log(`    - ${file.file}:`);
        for (const section of file.missingSections) {
          console.log(`      Missing: ${section}`);
        }
      }
    }
  }
  
  // Overall result
  const success = linkResults.valid && freshnessResults.fresh && structureResults.valid;
  
  console.log('\n' + '='.repeat(50));
  if (success) {
    console.log('✓ Documentation validation passed');
  } else {
    console.log('✗ Documentation validation failed');
  }
  
  return {
    success,
    results: {
      links: linkResults,
      freshness: freshnessResults,
      structure: structureResults
    }
  };
}

// CLI interface
if (require.main === module) {
  const docsDir = path.join(__dirname, '..', 'docs');
  
  validateDocs(docsDir).then(result => {
    process.exit(result.success ? 0 : 1);
  }).catch(error => {
    console.error('Error validating docs:', error);
    process.exit(1);
  });
}

module.exports = {
  checkBrokenLinks,
  checkFreshness,
  checkStructure,
  validateDocs
};
