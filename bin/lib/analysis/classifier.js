// bin/lib/analysis/classifier.js

/**
 * Classify a function based on complexity
 * Used for smart batching
 * @param {Object} functionInfo - Function metadata with complexity
 * @returns {string} Classification (simple/moderate/complex)
 */
function classifyFunction(functionInfo) {
  const { complexity } = functionInfo;
  
  // Use thresholds from complexity module
  if (complexity.cyclomatic < 5) {
    return 'simple';
  } else if (complexity.cyclomatic < 10) {
    return 'moderate';
  } else {
    return 'complex';
  }
}

/**
 * Determine if function is a helper using 3-heuristic algorithm
 * Resolved Question 2: Use ALL THREE heuristics, 2+ matches = helper
 * 
 * Heuristics:
 * 1. Scope: function is not exported
 * 2. Naming: follows helper naming patterns (_*, internal*, private*, anonymous*)
 * 3. Usage: called by only one parent function (single caller)
 * 
 * @param {Object} functionInfo - Function metadata
 * @param {Array} allFunctions - All functions for usage analysis
 * @returns {Object} { isHelper: boolean, matchedHeuristics: number, heuristics: [] }
 */
function isHelperFunction(functionInfo, allFunctions = []) {
  const heuristics = [];
  
  // Heuristic 1: Scope (not exported)
  if (!functionInfo.isExported) {
    heuristics.push('scope');
  }
  
  // Heuristic 2: Naming patterns
  const name = functionInfo.name;
  const helperPatterns = [
    /^_/,            // Starts with underscore
    /^internal/i,    // Starts with internal
    /^private/i,     // Starts with private
    /^anonymous/,    // Anonymous function
    /^arrow_/,       // Arrow function
    /helper$/i,      // Ends with helper
    /util$/i         // Ends with util
  ];
  
  if (helperPatterns.some(pattern => pattern.test(name))) {
    heuristics.push('naming');
  }
  
  // Heuristic 3: Usage (single caller)
  // Only applicable if we have calledBy information
  if (functionInfo.calledBy && functionInfo.calledBy.length === 1) {
    heuristics.push('usage');
  } else if (functionInfo.depth > 0) {
    // Nested function (defined inside another) = definitely helper
    heuristics.push('usage');
  }
  
  // Resolved Question 2: If 2+ heuristics match → classify as helper
  const matchedCount = heuristics.length;
  const isHelper = matchedCount >= 2;
  
  return {
    isHelper,
    matchedHeuristics: matchedCount,
    heuristics
  };
}

module.exports = {
  classifyFunction,
  isHelperFunction
};
