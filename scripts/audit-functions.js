#!/usr/bin/env node

/**
 * Audit Functions Script
 * 
 * Analyzes all JavaScript files under /bin to identify:
 * 1. Unused functions (0 calls)
 * 2. Low-usage functions (1-5 calls)
 * 3. Potential inline candidates (exactly 1 call)
 * 
 * Generates both JSON and Markdown reports.
 * 
 * Usage: node scripts/audit-functions.js
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, relative, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from '@babel/parser';
import traverse from '@babel/traverse';

// Get current file directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, '..');
const BIN_DIR = join(PROJECT_ROOT, 'bin');

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  blue: '\x1b[34m',
};

/**
 * Get all JavaScript files in a directory recursively
 */
function getAllJsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    const stat = statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllJsFiles(filePath, fileList);
    } else if (file.endsWith('.js')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

/**
 * Extract function definitions from a file using AST
 */
function extractFunctions(filePath) {
  const functions = [];
  
  try {
    const code = readFileSync(filePath, 'utf-8');
    const ast = parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript'],
    });
    
    traverse.default(ast, {
      // Function declarations: function foo() {}
      FunctionDeclaration(path) {
        if (path.node.id && path.node.id.name) {
          functions.push({
            name: path.node.id.name,
            type: 'function',
            line: path.node.loc.start.line,
            exported: path.parent.type === 'ExportNamedDeclaration' || 
                     path.parent.type === 'ExportDefaultDeclaration',
          });
        }
      },
      
      // Arrow functions and function expressions: const foo = () => {}
      VariableDeclarator(path) {
        if (path.node.id && path.node.id.name && 
            (path.node.init?.type === 'ArrowFunctionExpression' ||
             path.node.init?.type === 'FunctionExpression')) {
          
          const isExported = path.findParent(p => 
            p.isExportNamedDeclaration() || p.isExportDefaultDeclaration()
          );
          
          functions.push({
            name: path.node.id.name,
            type: 'arrow',
            line: path.node.loc.start.line,
            exported: !!isExported,
          });
        }
      },
      
      // Class methods: class Foo { method() {} }
      ClassMethod(path) {
        if (path.node.key && path.node.key.name) {
          const className = path.findParent(p => p.isClassDeclaration())?.node.id?.name || 'Anonymous';
          
          functions.push({
            name: path.node.key.name,
            type: 'method',
            className: className,
            line: path.node.loc.start.line,
            exported: false, // Methods are part of class export
          });
        }
      },
    });
    
  } catch (error) {
    console.error(`${colors.red}Error parsing ${filePath}: ${error.message}${colors.reset}`);
  }
  
  return functions;
}

/**
 * Search for function calls in all project files
 */
function findFunctionCalls(functionName, searchDir) {
  const calls = [];
  const files = getAllJsFiles(searchDir);
  
  files.forEach(filePath => {
    try {
      const code = readFileSync(filePath, 'utf-8');
      
      // Use regex to find potential calls
      // Matches: functionName( or functionName({ or functionName<
      const callRegex = new RegExp(`\\b${functionName}\\s*[\\(<]`, 'g');
      const lines = code.split('\n');
      
      lines.forEach((line, index) => {
        if (callRegex.test(line)) {
          calls.push({
            file: relative(PROJECT_ROOT, filePath),
            line: index + 1,
            code: line.trim(),
          });
        }
      });
      
    } catch (error) {
      // Skip files that can't be read
    }
  });
  
  return calls;
}

/**
 * Main analysis function
 */
function analyzeFunctions() {
  console.log(`${colors.bright}${colors.cyan}=== Function Usage Audit ===${colors.reset}\n`);
  console.log(`Analyzing files in: ${colors.yellow}${relative(PROJECT_ROOT, BIN_DIR)}${colors.reset}`);
  console.log(`Searching for calls in: ${colors.yellow}${relative(PROJECT_ROOT, PROJECT_ROOT)}${colors.reset}\n`);
  
  // Step 1: Get all JS files in /bin
  const binFiles = getAllJsFiles(BIN_DIR);
  console.log(`${colors.blue}Found ${binFiles.length} JavaScript files${colors.reset}\n`);
  
  // Step 2: Extract all functions
  const allFunctions = [];
  binFiles.forEach(filePath => {
    const functions = extractFunctions(filePath);
    functions.forEach(func => {
      allFunctions.push({
        ...func,
        file: relative(PROJECT_ROOT, filePath),
      });
    });
  });
  
  console.log(`${colors.blue}Found ${allFunctions.length} functions${colors.reset}\n`);
  
  // Step 3: Analyze usage for each function
  console.log(`${colors.cyan}Analyzing function calls...${colors.reset}`);
  const results = [];
  
  allFunctions.forEach((func, index) => {
    process.stdout.write(`\r${colors.cyan}Progress: ${index + 1}/${allFunctions.length}${colors.reset}`);
    
    const calls = findFunctionCalls(func.name, PROJECT_ROOT);
    
    // Filter out the definition itself
    const filteredCalls = calls.filter(call => 
      !(call.file === func.file && call.line === func.line)
    );
    
    results.push({
      ...func,
      callCount: filteredCalls.length,
      calls: filteredCalls,
    });
  });
  
  console.log('\n');
  
  return results;
}

/**
 * Categorize results
 */
function categorizeResults(results) {
  const unused = results.filter(r => r.callCount === 0);
  const lowUsage = results.filter(r => r.callCount > 0 && r.callCount <= 5);
  const potentialInline = results.filter(r => r.callCount === 1);
  const normalUsage = results.filter(r => r.callCount > 5);
  
  return {
    unused: unused.sort((a, b) => a.name.localeCompare(b.name)),
    lowUsage: lowUsage.sort((a, b) => a.callCount - b.callCount),
    potentialInline: potentialInline.sort((a, b) => a.name.localeCompare(b.name)),
    normalUsage: normalUsage.sort((a, b) => b.callCount - a.callCount),
    summary: {
      totalFunctions: results.length,
      unusedCount: unused.length,
      lowUsageCount: lowUsage.length,
      potentialInlineCount: potentialInline.length,
      normalUsageCount: normalUsage.length,
    },
  };
}

/**
 * Generate Markdown report
 */
function generateMarkdown(categorized) {
  const { unused, lowUsage, potentialInline, normalUsage, summary } = categorized;
  
  let md = `# Function Usage Audit Report\n\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `**Analysis Scope:**\n`;
  md += `- Functions analyzed: \`bin/**/*.js\`\n`;
  md += `- Usage searched in: Entire project\n\n`;
  
  md += `## Summary\n\n`;
  md += `| Category | Count | Percentage |\n`;
  md += `|----------|-------|------------|\n`;
  md += `| **Total Functions** | ${summary.totalFunctions} | 100% |\n`;
  md += `| Unused (0 calls) | ${summary.unusedCount} | ${(summary.unusedCount / summary.totalFunctions * 100).toFixed(1)}% |\n`;
  md += `| Low Usage (1-5 calls) | ${summary.lowUsageCount} | ${(summary.lowUsageCount / summary.totalFunctions * 100).toFixed(1)}% |\n`;
  md += `| Potential Inline (1 call) | ${summary.potentialInlineCount} | ${(summary.potentialInlineCount / summary.totalFunctions * 100).toFixed(1)}% |\n`;
  md += `| Normal Usage (>5 calls) | ${summary.normalUsageCount} | ${(summary.normalUsageCount / summary.totalFunctions * 100).toFixed(1)}% |\n\n`;
  
  // Unused Functions
  md += `---\n\n## ❌ Unused Functions (${unused.length})\n\n`;
  md += `Functions that are **not called anywhere** in the codebase.\n\n`;
  
  if (unused.length > 0) {
    md += `| Function Name | Type | File | Line | Exported |\n`;
    md += `|---------------|------|------|------|----------|\n`;
    unused.forEach(func => {
      md += `| \`${func.name}\` | ${func.type} | \`${func.file}\` | ${func.line} | ${func.exported ? '✅' : '❌'} |\n`;
    });
  } else {
    md += `*No unused functions found!* ✨\n`;
  }
  
  md += `\n`;
  
  // Low Usage Functions
  md += `---\n\n## ⚠️ Low Usage Functions (${lowUsage.length})\n\n`;
  md += `Functions called **1-5 times**. Consider if they're truly needed.\n\n`;
  
  if (lowUsage.length > 0) {
    md += `| Function Name | Type | File | Line | Calls | Call Locations |\n`;
    md += `|---------------|------|------|------|-------|----------------|\n`;
    lowUsage.forEach(func => {
      const locations = func.calls.map(c => `\`${c.file}:${c.line}\``).join('<br>');
      md += `| \`${func.name}\` | ${func.type} | \`${func.file}\` | ${func.line} | **${func.callCount}** | ${locations || 'N/A'} |\n`;
    });
  } else {
    md += `*No low-usage functions found!*\n`;
  }
  
  md += `\n`;
  
  // Potential Inline
  md += `---\n\n## 🔍 Potential Inline Candidates (${potentialInline.length})\n\n`;
  md += `Functions called **exactly once**. Consider inlining at call site.\n\n`;
  
  if (potentialInline.length > 0) {
    md += `| Function Name | Type | File | Line | Called From |\n`;
    md += `|---------------|------|------|------|-------------|\n`;
    potentialInline.forEach(func => {
      const call = func.calls[0];
      const location = call ? `\`${call.file}:${call.line}\`` : 'N/A';
      md += `| \`${func.name}\` | ${func.type} | \`${func.file}\` | ${func.line} | ${location} |\n`;
    });
  } else {
    md += `*No single-use functions found!*\n`;
  }
  
  md += `\n`;
  
  // Normal Usage (summary only)
  md += `---\n\n## ✅ Normal Usage Functions (${normalUsage.length})\n\n`;
  md += `Functions called **more than 5 times**. These are likely core functionality.\n\n`;
  md += `*Top 10 most-used functions:*\n\n`;
  
  if (normalUsage.length > 0) {
    md += `| Function Name | Type | File | Calls |\n`;
    md += `|---------------|------|------|-------|\n`;
    normalUsage.slice(0, 10).forEach(func => {
      md += `| \`${func.name}\` | ${func.type} | \`${func.file}\` | **${func.callCount}** |\n`;
    });
  }
  
  md += `\n`;
  
  // Recommendations
  md += `---\n\n## 📋 Recommended Action Plan\n\n`;
  md += `### Phase 1: Quick Wins (Low Risk)\n\n`;
  md += `1. **Remove unused functions** (${summary.unusedCount} functions)\n`;
  md += `   - Priority: Exported functions that are unused (dead exports)\n`;
  md += `   - Action: Delete or comment out, commit, and test\n`;
  md += `   - Risk: Low (not called anywhere)\n\n`;
  
  md += `### Phase 2: Inline Candidates (Medium Risk)\n\n`;
  md += `2. **Inline single-use functions** (${summary.potentialInlineCount} functions)\n`;
  md += `   - Priority: Small utility functions (<10 lines)\n`;
  md += `   - Action: Move code to call site, remove function\n`;
  md += `   - Risk: Medium (changes code structure)\n\n`;
  
  md += `### Phase 3: Review Low Usage (Higher Risk)\n\n`;
  md += `3. **Review low-usage functions** (${summary.lowUsageCount} functions)\n`;
  md += `   - Priority: Complex functions with 2-3 calls\n`;
  md += `   - Action: Determine if abstraction is needed or can be simplified\n`;
  md += `   - Risk: Higher (may have architectural implications)\n\n`;
  
  md += `### Testing Strategy\n\n`;
  md += `For each phase:\n`;
  md += `1. Create isolated test directory in \`/tmp\`\n`;
  md += `2. Run \`install.js\` with all parameter combinations:\n`;
  md += `   - \`--all --local\`\n`;
  md += `   - \`--all --global\`\n`;
  md += `   - \`--claude --local\`\n`;
  md += `   - \`--copilot --local\`\n`;
  md += `   - \`--codex --local\`\n`;
  md += `   - Interactive mode (no flags)\n`;
  md += `3. Verify all tests pass\n`;
  md += `4. Commit changes with \`chore(audit):\` prefix\n\n`;
  
  md += `---\n\n`;
  md += `## 🤔 Next Steps\n\n`;
  md += `**User decision required:**\n\n`;
  md += `1. Review this report\n`;
  md += `2. Confirm which phase to start with\n`;
  md += `3. Approve execution of that phase\n`;
  md += `4. Run comprehensive tests\n`;
  md += `5. Proceed to next phase\n\n`;
  md += `*Each phase requires explicit user approval before execution.*\n`;
  
  return md;
}

/**
 * Main execution
 */
function main() {
  try {
    // Analyze
    const results = analyzeFunctions();
    const categorized = categorizeResults(results);
    
    // Generate JSON report
    const jsonPath = join(PROJECT_ROOT, 'audit-functions.json');
    writeFileSync(jsonPath, JSON.stringify(categorized, null, 2));
    console.log(`${colors.green}✓ JSON report saved: ${relative(PROJECT_ROOT, jsonPath)}${colors.reset}`);
    
    // Generate Markdown report
    const markdown = generateMarkdown(categorized);
    const mdPath = join(PROJECT_ROOT, 'audit-functions.md');
    writeFileSync(mdPath, markdown);
    console.log(`${colors.green}✓ Markdown report saved: ${relative(PROJECT_ROOT, mdPath)}${colors.reset}\n`);
    
    // Print summary
    console.log(`${colors.bright}${colors.cyan}Summary:${colors.reset}`);
    console.log(`  Total Functions: ${colors.yellow}${categorized.summary.totalFunctions}${colors.reset}`);
    console.log(`  ${colors.red}Unused: ${categorized.summary.unusedCount}${colors.reset}`);
    console.log(`  ${colors.yellow}Low Usage (1-5): ${categorized.summary.lowUsageCount}${colors.reset}`);
    console.log(`  ${colors.blue}Potential Inline (1): ${categorized.summary.potentialInlineCount}${colors.reset}`);
    console.log(`  ${colors.green}Normal Usage (>5): ${categorized.summary.normalUsageCount}${colors.reset}\n`);
    
    console.log(`${colors.bright}Review the reports and decide on next actions!${colors.reset}`);
    
  } catch (error) {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  }
}

// Run
main();
