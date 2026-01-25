// bin/lib/analysis/ast-parser.js
const fs = require('fs');

// Resolved Question 5: @babel/parser primary, acorn fallback
let babelParser;
let acorn;

try {
  babelParser = require('@babel/parser');
} catch (e) {
  console.warn('⚠️  @babel/parser not available');
}

try {
  acorn = require('acorn');
} catch (e) {
  console.warn('⚠️  acorn not available');
}

/**
 * Parse JavaScript file with fallback strategy
 * Resolved Question 5: Try @babel/parser first, then acorn, handle errors gracefully
 * @param {string} filePath - Path to JavaScript file
 * @returns {Object} AST
 */
function parseFile(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  
  // Try @babel/parser first (most complete)
  if (babelParser) {
    const parseOptions = [
      { sourceType: 'module' },       // ES modules
      { sourceType: 'script' },       // CommonJS
      { sourceType: 'unambiguous' }   // Auto-detect
    ];
    
    for (const options of parseOptions) {
      try {
        return babelParser.parse(code, {
          ...options,
          plugins: ['jsx'],  // Support JSX
          errorRecovery: true,  // Continue on errors
          ecmaVersion: 'latest'  // Latest ES features
        });
      } catch (err) {
        continue;  // Try next option
      }
    }
  }
  
  // Fallback to acorn
  if (acorn) {
    try {
      return acorn.parse(code, {
        ecmaVersion: 'latest',
        sourceType: 'module',
        locations: true  // Include loc info
      });
    } catch (err) {
      // Try as script
      try {
        return acorn.parse(code, {
          ecmaVersion: 'latest',
          sourceType: 'script',
          locations: true
        });
      } catch (err2) {
        throw new Error(`Failed to parse ${filePath} with both parsers: ${err2.message}`);
      }
    }
  }
  
  throw new Error(`No parser available for ${filePath}`);
}

/**
 * Extract all functions from a JavaScript file
 * @param {string} filePath - Path to JavaScript file
 * @returns {Array} Array of function objects with metadata
 */
function extractFunctions(filePath) {
  const ast = parseFile(filePath);
  const functions = [];
  
  function visit(node, parent = null, depth = 0) {
    let functionInfo = null;
    
    // Handle different function types
    if (node.type === 'FunctionDeclaration') {
      functionInfo = {
        name: node.id?.name || `anonymous_function_${node.loc.start.line}`,
        type: 'declaration',
        params: node.params,
        body: node.body,
        loc: node.loc,
        isExported: parent?.type === 'ExportNamedDeclaration' || parent?.type === 'ExportDefaultDeclaration',
        depth: depth
      };
    } else if (node.type === 'FunctionExpression') {
      const name = node.id?.name || (parent?.type === 'VariableDeclarator' ? parent.id.name : `anonymous_${node.loc.start.line}`);
      functionInfo = {
        name,
        type: 'expression',
        params: node.params,
        body: node.body,
        loc: node.loc,
        isExported: false,  // Will check module.exports separately
        depth: depth
      };
    } else if (node.type === 'ArrowFunctionExpression') {
      const name = parent?.type === 'VariableDeclarator' ? parent.id.name : `arrow_${node.loc.start.line}`;
      functionInfo = {
        name,
        type: 'arrow',
        params: node.params,
        body: node.body,
        loc: node.loc,
        isExported: false,
        depth: depth
      };
    }
    
    if (functionInfo) {
      functions.push(functionInfo);
    }
    
    // Recursive traversal
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(child => {
            if (child && typeof child === 'object' && child.type) {
              visit(child, node, depth);
            }
          });
        } else if (node[key].type) {
          visit(node[key], node, depth);
        }
      }
    }
  }
  
  visit(ast, null, 0);
  return functions;
}

module.exports = {
  parseFile,
  extractFunctions
};
