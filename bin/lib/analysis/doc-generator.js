const matter = require('gray-matter');
const fs = require('fs-extra');
const path = require('path');

/**
 * Generate analysis document for a function
 * Includes confidence percentage if < 100% (per resolved Question 3)
 * @param {Object} functionAnalysis - Complete analysis
 * @param {string} outputDir - Output directory (eval/stage_1/)
 * @returns {string} Path to generated document
 */
function generateAnalysisDocument(functionAnalysis, outputDir) {
  const metadata = {
    subject: 'function',
    name: functionAnalysis.name,
    source_file: path.basename(functionAnalysis.sourceFile),
    source_location: functionAnalysis.sourceFile,
    function_count_in_file: functionAnalysis.totalInFile,
    analysis_stage: 1,
    last_updated: new Date().toISOString(),
    complexity: {
      cyclomatic: functionAnalysis.complexity.cyclomatic,
      nesting_depth: functionAnalysis.complexity.nesting_depth,
      parameter_count: functionAnalysis.complexity.parameter_count
    },
    depends_on: functionAnalysis.dependencies || [],
    called_by: functionAnalysis.calledBy || []
  };
  
  // Add confidence field only if < 100% (resolved Question 3)
  if (functionAnalysis.confidenceScore && functionAnalysis.confidenceScore.confidence < 100) {
    metadata.confidence = `${functionAnalysis.confidenceScore.confidence}%`;
  }
  
  // Build markdown body
  const sections = [];
  
  sections.push(`# Function: ${functionAnalysis.name}\n`);
  
  sections.push('## Purpose\n');
  sections.push(functionAnalysis.purpose || 'To be documented');
  sections.push('\n');
  
  sections.push('## Signature\n');
  sections.push('```javascript');
  sections.push(functionAnalysis.signature || 'function signature()');
  sections.push('```\n');
  
  sections.push('## Inputs/Outputs\n');
  sections.push(`- **Inputs**: ${functionAnalysis.inputs || 'None documented'}`);
  sections.push(`- **Returns**: ${functionAnalysis.returns || 'None documented'}`);
  sections.push('\n');
  
  sections.push('## Dependencies\n');
  if (functionAnalysis.dependencies && functionAnalysis.dependencies.length > 0) {
    sections.push('**Direct calls only** (Stage 1 - resolved Question 4):\n');
    functionAnalysis.dependencies.forEach(dep => {
      sections.push(`- \`${dep}()\``);
    });
  } else {
    sections.push('None detected');
  }
  sections.push('\n');
  
  sections.push('## Side Effects\n');
  if (functionAnalysis.sideEffects && functionAnalysis.sideEffects.length > 0) {
    functionAnalysis.sideEffects.forEach(se => {
      sections.push(`- **${se.type}**: ${se.operation}${se.line ? ` (line ${se.line})` : ''}`);
    });
  } else {
    sections.push('None detected');
  }
  sections.push('\n');
  
  sections.push('## Complexity Analysis\n');
  sections.push(`- Cyclomatic complexity: ${functionAnalysis.complexity.cyclomatic}`);
  sections.push(`- Nesting depth: ${functionAnalysis.complexity.nesting_depth}`);
  sections.push(`- Parameter count: ${functionAnalysis.complexity.parameter_count}`);
  sections.push(`- Classification: ${classifyComplexityLevel(functionAnalysis.complexity.cyclomatic)}`);
  sections.push('\n');
  
  // Confidence analysis (if < 100%)
  if (functionAnalysis.confidenceScore && functionAnalysis.confidenceScore.confidence < 100) {
    sections.push('## Analysis Confidence\n');
    sections.push(`**Confidence:** ${functionAnalysis.confidenceScore.confidence}%\n`);
    sections.push('**Deductions:**\n');
    functionAnalysis.confidenceScore.deductions.forEach(d => {
      sections.push(`- **-${d.amount}%**: ${d.reason}`);
    });
    sections.push('\n**Reasons:**\n');
    functionAnalysis.confidenceScore.reasons.forEach(r => {
      sections.push(`- ❓ ${r}`);
    });
    sections.push('\n');
  }
  
  const markdownBody = sections.join('\n');
  const document = matter.stringify(markdownBody, metadata);
  
  // Determine filename based on complexity (resolved Question 1: Complex >= 10)
  let filename;
  if (functionAnalysis.complexity.cyclomatic >= 10) {
    filename = `${sanitizeFunctionName(functionAnalysis.name)}.md`;
  } else {
    const sourceBasename = path.basename(functionAnalysis.sourceFile, '.js');
    filename = `${sourceBasename}-analysis.md`;
  }
  
  const outputPath = path.join(outputDir, filename);
  
  // Append to existing file for simple/moderate, dedicated for complex
  if (functionAnalysis.complexity.cyclomatic < 10) {
    if (fs.existsSync(outputPath)) {
      const existing = fs.readFileSync(outputPath, 'utf8');
      fs.writeFileSync(outputPath, existing + '\n---\n\n' + document, 'utf8');
    } else {
      fs.writeFileSync(outputPath, document, 'utf8');
    }
  } else {
    fs.writeFileSync(outputPath, document, 'utf8');
  }
  
  return outputPath;
}

function sanitizeFunctionName(name) {
  return name.replace(/[^a-zA-Z0-9_-]/g, '_');
}

function classifyComplexityLevel(cyclomatic) {
  // Use resolved Question 1 thresholds
  if (cyclomatic < 5) return 'Simple';
  if (cyclomatic < 10) return 'Moderate';
  return 'Complex';
}

module.exports = {
  generateAnalysisDocument
};
