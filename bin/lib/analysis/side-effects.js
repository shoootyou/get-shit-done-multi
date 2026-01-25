// bin/lib/analysis/side-effects.js

/**
 * Detect I/O side effects in a function
 * Per CONTEXT.md: I/O operations only (file system, console, network)
 * NOT state mutations
 * @param {Object} functionNode - AST node for the function
 * @returns {Array} Array of side effect objects
 */
function detectIOSideEffects(functionNode) {
  const sideEffects = [];
  
  function visit(node) {
    // Check for member expressions: fs.readFile, console.log, etc.
    if (node.type === 'MemberExpression' && node.object?.name && node.property) {
      const object = node.object.name;
      const property = node.property.name || node.property.value;
      
      // File system operations
      if (object === 'fs' || object === 'fse' || object === 'fsExtra') {
        sideEffects.push({
          type: 'file_system',
          operation: `${object}.${property}`,
          line: node.loc?.start.line
        });
      }
      
      // Console operations
      if (object === 'console') {
        sideEffects.push({
          type: 'console',
          operation: `console.${property}`,
          line: node.loc?.start.line
        });
      }
      
      // Process I/O (stdout/stderr only)
      if (object === 'process' && (property === 'stdout' || property === 'stderr')) {
        sideEffects.push({
          type: 'process_io',
          operation: `process.${property}`,
          line: node.loc?.start.line
        });
      }
    }
    
    // Check for require() calls to network modules
    if (node.type === 'CallExpression' && node.callee?.name === 'require') {
      const arg = node.arguments?.[0];
      if (arg?.value) {
        const networkModules = ['http', 'https', 'net', 'node-fetch', 'axios', 'request'];
        if (networkModules.includes(arg.value)) {
          sideEffects.push({
            type: 'network_import',
            operation: `require('${arg.value}')`,
            line: node.loc?.start.line
          });
        }
      }
    }
    
    // Recursive traversal
    for (const key in node) {
      if (node[key] && typeof node[key] === 'object') {
        if (Array.isArray(node[key])) {
          node[key].forEach(child => {
            if (child && typeof child === 'object' && child.type) {
              visit(child);
            }
          });
        } else if (node[key].type) {
          visit(node[key]);
        }
      }
    }
  }
  
  visit(functionNode.body);
  return sideEffects;
}

module.exports = {
  detectIOSideEffects
};
