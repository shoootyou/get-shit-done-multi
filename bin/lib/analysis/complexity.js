// bin/lib/analysis/complexity.js

// Resolved Question 1: Hardcoded complexity thresholds (configurable via constants)
const COMPLEXITY_THRESHOLDS = {
  SIMPLE: 5,      // cyclomatic < 5
  MODERATE: 10    // cyclomatic < 10
  // Complex is >= 10
};

/**
 * Calculate complexity metrics for a function node
 * Uses McCabe's cyclomatic complexity algorithm
 * @param {Object} functionNode - AST node for the function
 * @returns {Object} Complexity metrics
 */
function calculateComplexity(functionNode) {
  let cyclomaticComplexity = 1; // Base complexity
  let maxNestingDepth = 0;
  let currentDepth = 0;
  
  function visit(node) {
    // Track nesting depth
    const depthIncreasingNodes = [
      'IfStatement',
      'ForStatement',
      'ForInStatement',
      'ForOfStatement',
      'WhileStatement',
      'DoWhileStatement',
      'SwitchStatement',
      'TryStatement'
    ];
    
    if (depthIncreasingNodes.includes(node.type)) {
      currentDepth++;
      maxNestingDepth = Math.max(maxNestingDepth, currentDepth);
    }
    
    // Count decision points (McCabe's algorithm)
    switch (node.type) {
      case 'IfStatement':
      case 'ConditionalExpression': // Ternary operator
      case 'ForStatement':
      case 'ForInStatement':
      case 'ForOfStatement':
      case 'WhileStatement':
      case 'DoWhileStatement':
        cyclomaticComplexity++;
        break;
      case 'SwitchCase':
        // Each case adds complexity (not default)
        if (node.test) {
          cyclomaticComplexity++;
        }
        break;
      case 'CatchClause':
        cyclomaticComplexity++;
        break;
      case 'LogicalExpression':
        // && and || add complexity
        if (node.operator === '&&' || node.operator === '||') {
          cyclomaticComplexity++;
        }
        break;
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
    
    // Decrease depth when leaving nesting node
    if (depthIncreasingNodes.includes(node.type)) {
      currentDepth--;
    }
  }
  
  visit(functionNode.body);
  
  return {
    cyclomatic: cyclomaticComplexity,
    nesting_depth: maxNestingDepth,
    parameter_count: functionNode.params.length
  };
}

/**
 * Classify complexity level using hardcoded thresholds
 * Resolved Question 1: Simple < 5, Moderate 5-9, Complex >= 10
 * @param {number} cyclomatic - Cyclomatic complexity score
 * @returns {string} Classification (Simple/Moderate/Complex)
 */
function classifyComplexity(cyclomatic) {
  if (cyclomatic < COMPLEXITY_THRESHOLDS.SIMPLE) return 'Simple';
  if (cyclomatic < COMPLEXITY_THRESHOLDS.MODERATE) return 'Moderate';
  return 'Complex';
}

/**
 * Get complexity thresholds for external use
 * @returns {Object} Threshold constants
 */
function getThresholds() {
  return { ...COMPLEXITY_THRESHOLDS };
}

module.exports = {
  calculateComplexity,
  classifyComplexity,
  getThresholds,
  COMPLEXITY_THRESHOLDS  // Export for testing
};
