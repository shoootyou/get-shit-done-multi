#!/usr/bin/env node
// bin/scripts/generate-dependency-graph.js

const fs = require('fs-extra');
const glob = require('glob');
const matter = require('gray-matter');

function generateDependencyGraph() {
  const analysisFiles = glob.sync('eval/stage_1/*.md', {
    ignore: ['**/DEPENDENCY-GRAPH.md', '**/INVENTORY-SUMMARY.md', '**/.gitkeep']
  });
  
  console.log(`Found ${analysisFiles.length} analysis documents`);
  
  const functions = [];
  
  // Parse all analysis documents
  for (const file of analysisFiles) {
    const content = fs.readFileSync(file, 'utf8');
    const parsed = matter(content);
    
    if (parsed.data.subject === 'function') {
      functions.push({
        name: parsed.data.name,
        sourceFile: parsed.data.source_file,
        dependsOn: parsed.data.depends_on || [],
        calledBy: parsed.data.called_by || [],
        complexity: parsed.data.complexity?.cyclomatic || 0,
        confidence: parsed.data.confidence || '100%'
      });
    }
  }
  
  console.log(`Parsed ${functions.length} functions`);
  
  // Build graph sections
  const sections = [];
  
  sections.push('# Function Dependency Graph\n');
  sections.push('**Phase 5.2 - Stage 1: Function-level Inventory**\n');
  sections.push(`**Generated:** ${new Date().toISOString()}\n`);
  sections.push(`**Total functions:** ${functions.length}\n`);
  
  // IMPORTANT: Document Question 4 constraint
  sections.push('## ⚠️  Important Constraint\n');
  sections.push('**Dependencies tracked: DIRECT CALLS ONLY** (Stage 1)\n');
  sections.push('Per resolved research Question 4: This graph shows only immediate dependencies (one level deep).');
  sections.push('Transitive call analysis is deferred to Stage 2 (Phase 5.3).\n');
  
  // Statistics
  const withDeps = functions.filter(f => f.dependsOn.length > 0).length;
  const withCallers = functions.filter(f => f.calledBy.length > 0).length;
  const isolated = functions.filter(f => f.dependsOn.length === 0 && f.calledBy.length === 0).length;
  const lowConfidence = functions.filter(f => parseInt(f.confidence) < 100).length;
  
  sections.push('## Statistics\n');
  sections.push(`- Functions with dependencies: ${withDeps}`);
  sections.push(`- Functions with callers: ${withCallers}`);
  sections.push(`- Isolated functions: ${isolated}`);
  sections.push(`- Low confidence (<100%): ${lowConfidence}\n`);
  
  // High-dependency functions
  const highDependency = functions
    .filter(f => f.calledBy.length >= 3)
    .sort((a, b) => b.calledBy.length - a.calledBy.length);
  
  if (highDependency.length > 0) {
    sections.push('## High-Dependency Functions\n');
    sections.push('Functions called by 3+ other functions (direct calls only):\n');
    highDependency.forEach(f => {
      sections.push(`- **${f.name}** (called by ${f.calledBy.length} functions)`);
    });
    sections.push('');
  }
  
  // Complex functions
  const complexFunctions = functions
    .filter(f => f.complexity >= 10)
    .sort((a, b) => b.complexity - a.complexity);
  
  if (complexFunctions.length > 0) {
    sections.push('## Complex Functions\n');
    sections.push('Functions with cyclomatic complexity >= 10 (per Question 1 threshold):\n');
    complexFunctions.forEach(f => {
      sections.push(`- **${f.name}** (complexity ${f.complexity})`);
    });
    sections.push('');
  }
  
  // Full dependency list by file
  sections.push('## Function Dependencies by File\n');
  
  const byFile = new Map();
  functions.forEach(f => {
    if (!byFile.has(f.sourceFile)) {
      byFile.set(f.sourceFile, []);
    }
    byFile.get(f.sourceFile).push(f);
  });
  
  const sortedFiles = Array.from(byFile.keys()).sort();
  
  for (const file of sortedFiles) {
    sections.push(`### ${file}\n`);
    const fileFunctions = byFile.get(file);
    
    for (const fn of fileFunctions) {
      sections.push(`#### \`${fn.name}()\`\n`);
      
      if (fn.confidence !== '100%') {
        sections.push(`*Confidence: ${fn.confidence}*\n`);
      }
      
      if (fn.dependsOn.length > 0) {
        sections.push('**Depends on (direct):**');
        fn.dependsOn.forEach(dep => {
          sections.push(`- \`${dep}()\``);
        });
        sections.push('');
      }
      
      if (fn.calledBy.length > 0) {
        sections.push('**Called by (direct):**');
        fn.calledBy.forEach(caller => {
          sections.push(`- \`${caller}()\``);
        });
        sections.push('');
      }
      
      if (fn.dependsOn.length === 0 && fn.calledBy.length === 0) {
        sections.push('*Isolated function (no dependencies or callers)*\n');
      }
    }
  }
  
  // Write graph
  const graphContent = sections.join('\n');
  fs.writeFileSync('eval/stage_1/DEPENDENCY-GRAPH.md', graphContent, 'utf8');
  
  console.log('✓ Generated DEPENDENCY-GRAPH.md');
}

generateDependencyGraph();
