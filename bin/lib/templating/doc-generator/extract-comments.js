#!/usr/bin/env node
/**
 * JSDoc Comment Extractor
 * 
 * Extracts JSDoc comments from JavaScript files using regex patterns.
 * Zero npm dependencies - uses only Node.js built-ins (fs, path).
 * 
 * @module extract-comments
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Extract all JSDoc comments from a file
 * 
 * @param {string} filePath - Path to JavaScript file
 * @returns {Promise<Array>} Array of {description, tags, raw} objects
 */
async function extractDocComments(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const comments = [];
    
    // Match JSDoc blocks: /** ... */
    const jsdocPattern = /\/\*\*([\s\S]*?)\*\//g;
    let match;
    
    while ((match = jsdocPattern.exec(content)) !== null) {
      const raw = match[0];
      const body = match[1];
      
      // Clean up comment body (remove leading * and whitespace)
      const lines = body.split('\n').map(line => {
        return line.replace(/^\s*\*\s?/, '').trim();
      }).filter(line => line.length > 0);
      
      // Separate description from tags
      const description = [];
      const tagLines = [];
      let inTags = false;
      
      for (const line of lines) {
        if (line.startsWith('@')) {
          inTags = true;
          tagLines.push(line);
        } else if (inTags) {
          // Continuation of previous tag
          tagLines[tagLines.length - 1] += ' ' + line;
        } else {
          description.push(line);
        }
      }
      
      const tags = parseJSDocTags(tagLines);
      
      comments.push({
        description: description.join(' '),
        tags,
        raw
      });
    }
    
    return comments;
  } catch (error) {
    console.error(`Error extracting from ${filePath}:`, error.message);
    return [];
  }
}

/**
 * Parse @tag lines into structured object
 * 
 * @param {Array<string>} tagLines - Array of @tag lines
 * @returns {Object} Object with tag names as keys, values as arrays
 */
function parseJSDocTags(tagLines) {
  const tags = {};
  
  for (const line of tagLines) {
    // Match @tagname rest-of-line
    const match = line.match(/^@(\w+)\s+(.+)$/);
    if (match) {
      const tagName = match[1];
      const tagValue = match[2].trim();
      
      // Support multiple tags with same name
      if (!tags[tagName]) {
        tags[tagName] = [];
      }
      tags[tagName].push(tagValue);
    }
  }
  
  return tags;
}

/**
 * Recursively extract JSDoc comments from all .js files in a directory
 * 
 * @param {string} dirPath - Directory to scan
 * @returns {Promise<Object>} Map of filePath -> comments array
 */
async function extractFromDirectory(dirPath) {
  const results = {};
  
  async function scan(dir) {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Skip node_modules, .git, etc.
          if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
            await scan(fullPath);
          }
        } else if (entry.isFile() && entry.name.endsWith('.js')) {
          const comments = await extractDocComments(fullPath);
          if (comments.length > 0) {
            results[fullPath] = comments;
          }
        }
      }
    } catch (error) {
      console.error(`Error scanning ${dir}:`, error.message);
    }
  }
  
  await scan(dirPath);
  return results;
}

// CLI usage
if (require.main === module) {
  const target = process.argv[2] || '.';
  
  (async () => {
    const stat = await fs.stat(target);
    
    if (stat.isDirectory()) {
      const results = await extractFromDirectory(target);
      console.log(JSON.stringify(results, null, 2));
    } else {
      const comments = await extractDocComments(target);
      console.log(JSON.stringify(comments, null, 2));
    }
  })().catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
}

module.exports = {
  extractDocComments,
  parseJSDocTags,
  extractFromDirectory
};
