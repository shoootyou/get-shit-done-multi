// bin/lib/analysis/confidence.js

/**
 * Calculate confidence percentage for function analysis
 * Resolved Question 3: Start at 100%, apply deductions, minimum 30%
 * 
 * Deductions:
 * - Dynamic requires/imports: -20%
 * - Unclear/generic naming: -10%
 * - No JSDoc comments: -5%
 * - Complex control flow without documentation: -15%
 * - External dependency usage without clear purpose: -10%
 * 
 * @param {Object} functionInfo - Function metadata
 * @param {Object} ast - AST node for checking documentation
 * @returns {Object} { confidence: number, deductions: [], reasons: [] }
 */
function calculateConfidence(functionInfo, ast = null) {
  let confidence = 100;
  const deductions = [];
  const reasons = [];
  
  // Check for dynamic requires/imports
  if (hasDynamicRequires(functionInfo)) {
    confidence -= 20;
    deductions.push({ amount: 20, reason: 'Dynamic requires/imports detected' });
    reasons.push('Dynamic requires make dependency analysis uncertain');
  }
  
  // Check for unclear/generic naming
  if (hasUnclearNaming(functionInfo.name)) {
    confidence -= 10;
    deductions.push({ amount: 10, reason: 'Unclear or generic function name' });
    reasons.push(`Name "${functionInfo.name}" is generic or unclear`);
  }
  
  // Check for JSDoc comments
  if (!hasJSDoc(functionInfo, ast)) {
    confidence -= 5;
    deductions.push({ amount: 5, reason: 'No JSDoc documentation' });
    reasons.push('Missing JSDoc comments');
  }
  
  // Check for complex control flow without documentation
  if (isComplexWithoutDocs(functionInfo, ast)) {
    confidence -= 15;
    deductions.push({ amount: 15, reason: 'Complex control flow without documentation' });
    reasons.push(`Complexity ${functionInfo.complexity.cyclomatic} but no documentation`);
  }
  
  // Check for unclear external dependencies
  if (hasUnclearDependencies(functionInfo)) {
    confidence -= 10;
    deductions.push({ amount: 10, reason: 'External dependencies without clear purpose' });
    reasons.push('Dependencies used but purpose unclear');
  }
  
  // Minimum confidence: 30%
  confidence = Math.max(confidence, 30);
  
  return {
    confidence,
    deductions,
    reasons
  };
}

/**
 * Check for dynamic require() calls
 */
function hasDynamicRequires(functionInfo) {
  // Check if dependencies include patterns like require(variable)
  if (functionInfo.dependencies) {
    return functionInfo.dependencies.some(dep => 
      dep.includes('require') && !dep.match(/require\(['"][\w/-]+['"]\)/)
    );
  }
  return false;
}

/**
 * Check for unclear/generic naming
 */
function hasUnclearNaming(name) {
  const genericNames = [
    /^temp/i, /^tmp/i, /^test/i, /^foo/i, /^bar/i,
    /^handle/i, /^process/i, /^do/i, /^run/i,
    /^func\d*/i, /^fn\d*/i, /^method\d*/i,
    /^util$/i, /^helper$/i, /^main$/i
  ];
  
  return genericNames.some(pattern => pattern.test(name));
}

/**
 * Check for JSDoc comments
 * (Simplified - just check if ast has comments property)
 */
function hasJSDoc(functionInfo, ast) {
  // If no AST provided, assume no JSDoc
  if (!ast || !ast.leadingComments) {
    return false;
  }
  
  // Check for /** */ style comments
  return ast.leadingComments.some(comment => 
    comment.type === 'CommentBlock' && comment.value.trim().startsWith('*')
  );
}

/**
 * Check if complex but undocumented
 */
function isComplexWithoutDocs(functionInfo, ast) {
  const isComplex = functionInfo.complexity && functionInfo.complexity.cyclomatic >= 10;
  const lacksDoc = !hasJSDoc(functionInfo, ast);
  return isComplex && lacksDoc;
}

/**
 * Check for unclear external dependencies
 */
function hasUnclearDependencies(functionInfo) {
  // If has external deps but no clear documentation, flag it
  if (functionInfo.dependencies && functionInfo.dependencies.length > 3) {
    return !functionInfo.purpose;  // Many deps but no documented purpose
  }
  return false;
}

module.exports = {
  calculateConfidence
};
