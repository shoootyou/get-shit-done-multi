// bin/lib/analysis/relationships.js

/**
 * Extract function dependencies
 * Resolved Question 4: Stage 1 is DIRECT CALLS ONLY (one level deep)
 * Transitive call analysis deferred to Stage 2
 * @param {Object} functionNode - AST node for the function
 * @returns {Array} Array of function names called directly
 */
function extractDependencies(functionNode) {
  const dependencies = [];
  
  function visit(node) {
    // Direct function calls only
    if (node.type === 'CallExpression') {
      if (node.callee?.type === 'Identifier') {
        dependencies.push(node.callee.name);
      } else if (node.callee?.type === 'MemberExpression') {
        // method.call() - track the method name
        const method = node.callee.property?.name;
        if (method) {
          dependencies.push(method);
        }
      }
    }
    
    // Recursive traversal (but only record immediate calls, not transitive)
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
  
  // Deduplicate
  return [...new Set(dependencies)];
}

/**
 * Build reverse dependency map (called_by)
 * @param {Array} allFunctions - All analyzed functions
 * @returns {Map} Map of function name -> array of callers
 */
function buildCalledByMap(allFunctions) {
  const calledByMap = new Map();
  
  // Initialize map
  allFunctions.forEach(fn => {
    calledByMap.set(fn.name, []);
  });
  
  // Build reverse dependencies (direct only, per Question 4)
  allFunctions.forEach(fn => {
    if (fn.dependencies) {
      fn.dependencies.forEach(depName => {
        if (calledByMap.has(depName)) {
          calledByMap.get(depName).push(fn.name);
        }
      });
    }
  });
  
  return calledByMap;
}

module.exports = {
  extractDependencies,
  buildCalledByMap
};
