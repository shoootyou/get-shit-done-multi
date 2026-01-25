#!/usr/bin/env node
// bin/scripts/analyze-bin.js

const fs = require('fs-extra');
const glob = require('glob');
const prompts = require('prompts');
const chalk = require('chalk');

// Import analysis utilities (all with resolved research questions)
const { extractFunctions } = require('../lib/analysis/ast-parser.js');
const { calculateComplexity, classifyComplexity, COMPLEXITY_THRESHOLDS } = require('../lib/analysis/complexity.js');
const { detectIOSideEffects } = require('../lib/analysis/side-effects.js');
const { classifyFunction, isHelperFunction } = require('../lib/analysis/classifier.js');
const { extractDependencies, buildCalledByMap } = require('../lib/analysis/relationships.js');
const { calculateConfidence } = require('../lib/analysis/confidence.js');
const { generateAnalysisDocument } = require('../lib/analysis/doc-generator.js');

/**
 * Main analyzer function
 * Applies all 5 resolved research questions during analysis
 */
async function analyzeAllFunctions() {
  console.log(chalk.bold('\n🔍 Phase 5.2: Function-level Inventory (Stage 1)\n'));
  console.log(chalk.cyan('Using resolved research questions:'));
  console.log(`  1. Thresholds: Simple < ${COMPLEXITY_THRESHOLDS.SIMPLE}, Complex >= ${COMPLEXITY_THRESHOLDS.MODERATE}`);
  console.log('  2. Helper detection: 3-heuristic algorithm (2+ = helper)');
  console.log('  3. Confidence: Deduction formula (start 100%, min 30%)');
  console.log('  4. Dependencies: Direct calls only (Stage 1)');
  console.log('  5. Parser: @babel/parser + acorn fallback\n');
  
  // Step 1: Find all JavaScript files in bin/
  const binFiles = glob.sync('bin/**/*.js', {
    ignore: ['**/*.test.js', '**/node_modules/**', '**/fixtures/**', '**/scripts/**']
  });
  
  console.log(`Found ${binFiles.length} JavaScript files in bin/\n`);
  
  // Step 2: Analyze all files (investigation-first approach)
  console.log(chalk.cyan('📊 Analyzing all functions...\n'));
  
  const allAnalyses = [];
  const skippedHelpers = [];
  
  for (const file of binFiles) {
    try {
      const functions = extractFunctions(file);
      const fileFunctionCount = functions.length;
      
      for (const fn of functions) {
        // Calculate metrics
        const complexity = calculateComplexity(fn);
        const sideEffects = detectIOSideEffects(fn);
        const dependencies = extractDependencies(fn);
        
        // Temporary analysis for helper detection
        const tempAnalysis = {
          name: fn.name,
          isExported: fn.isExported,
          depth: fn.depth,
          calledBy: []  // Will be populated after all functions parsed
        };
        
        // Resolved Question 2: Apply 3-heuristic helper detection
        const helperCheck = isHelperFunction(tempAnalysis);
        if (helperCheck.isHelper) {
          skippedHelpers.push({
            name: fn.name,
            file,
            heuristics: helperCheck.heuristics
          });
          continue; // Skip helpers per CONTEXT.md
        }
        
        // Build analysis
        const classification = classifyFunction({ complexity });
        const params = fn.params.map(p => p.name || 'param').join(', ');
        const signature = `${fn.type === 'arrow' ? 'const' : 'function'} ${fn.name}(${params})`;
        
        const analysis = {
          name: fn.name,
          sourceFile: file,
          totalInFile: fileFunctionCount,
          type: fn.type,
          complexity,
          classification,
          sideEffects,
          dependencies,
          signature,
          isExported: fn.isExported,
          depth: fn.depth,
          purpose: null,
          inputs: null,
          returns: null,
          calledBy: [],
          confidenceScore: null  // Will calculate after relationships built
        };
        
        allAnalyses.push(analysis);
      }
    } catch (err) {
      console.error(chalk.red(`✗ Failed to analyze ${file}: ${err.message}`));
    }
  }
  
  console.log(chalk.green(`✓ Analyzed ${allAnalyses.length} functions`));
  console.log(chalk.gray(`  (Skipped ${skippedHelpers.length} helper functions)\n`));
  
  // Step 3: Build called_by relationships (for helper heuristic #3 and confidence)
  const calledByMap = buildCalledByMap(allAnalyses);
  allAnalyses.forEach(fn => {
    fn.calledBy = calledByMap.get(fn.name) || [];
  });
  
  // Step 4: Calculate confidence for each function (resolved Question 3)
  allAnalyses.forEach(fn => {
    fn.confidenceScore = calculateConfidence(fn);
  });
  
  // Step 5: Group by classification (resolved Question 1: use hardcoded thresholds)
  const simple = allAnalyses.filter(a => a.classification === 'simple');
  const moderate = allAnalyses.filter(a => a.classification === 'moderate');
  const complex = allAnalyses.filter(a => a.classification === 'complex');
  const lowConfidence = allAnalyses.filter(a => a.confidenceScore.confidence < 100);
  
  console.log(chalk.bold('📋 Analysis Summary:\n'));
  console.log(`  ${chalk.green('Simple')} (complexity < ${COMPLEXITY_THRESHOLDS.SIMPLE}):     ${simple.length} functions`);
  console.log(`  ${chalk.yellow('Moderate')} (complexity ${COMPLEXITY_THRESHOLDS.SIMPLE}-${COMPLEXITY_THRESHOLDS.MODERATE-1}):  ${moderate.length} functions`);
  console.log(`  ${chalk.red('Complex')} (complexity >= ${COMPLEXITY_THRESHOLDS.MODERATE}): ${complex.length} functions`);
  console.log(`  ${chalk.magenta('Low confidence')} (<100%):   ${lowConfidence.length} functions`);
  console.log();
  
  // Step 6: Interactive confirmation workflow
  const confirmed = await confirmAnalyses(simple, moderate, complex, lowConfidence);
  
  if (!confirmed) {
    console.log(chalk.yellow('\n⚠️  Analysis cancelled by user\n'));
    return;
  }
  
  // Step 7: Generate documentation
  console.log(chalk.cyan('\n📝 Generating analysis documents...\n'));
  
  const outputDir = 'eval/stage_1';
  fs.ensureDirSync(outputDir);
  
  let docCount = 0;
  for (const analysis of allAnalyses) {
    try {
      generateAnalysisDocument(analysis, outputDir);
      docCount++;
    } catch (err) {
      console.error(chalk.red(`✗ Failed to generate doc for ${analysis.name}: ${err.message}`));
    }
  }
  
  console.log(chalk.green(`✓ Generated ${docCount} analysis documents\n`));
  
  // Step 8: Summary
  console.log(chalk.bold.green('\n✅ Phase 5.2 Plan 02 Complete!\n'));
  console.log(`Analysis documents: ${outputDir}/`);
  console.log(`Functions analyzed: ${allAnalyses.length}`);
  console.log(`Helpers skipped: ${skippedHelpers.length}`);
  console.log(`Low confidence flagged: ${lowConfidence.length}`);
  console.log(`\nNext: Plan 03 will generate dependency graph and summary\n`);
}

/**
 * Interactive confirmation workflow with progressive disclosure
 */
async function confirmAnalyses(simple, moderate, complex, lowConfidence) {
  console.log(chalk.bold('\n👤 User Confirmation Required\n'));
  
  // Show low-confidence functions first for extra attention
  if (lowConfidence.length > 0) {
    console.log(chalk.magenta(`\n⚠️  ${lowConfidence.length} functions have confidence < 100%\n`));
    
    const { reviewLowConf } = await prompts({
      type: 'confirm',
      name: 'reviewLowConf',
      message: `Review ${lowConfidence.length} low-confidence functions individually?`,
      initial: true
    });
    
    if (reviewLowConf) {
      for (const fn of lowConfidence) {
        console.log(chalk.bold(`\n=== ${fn.name} ===`));
        console.log(`Confidence: ${chalk.magenta(fn.confidenceScore.confidence + '%')}`);
        console.log(`Reasons:`);
        fn.confidenceScore.reasons.forEach(r => console.log(`  - ${r}`));
        
        const { action } = await prompts({
          type: 'select',
          name: 'action',
          message: 'Action:',
          choices: [
            { title: 'Accept (document uncertainty)', value: 'accept' },
            { title: 'Show full details', value: 'show' },
            { title: 'Abort', value: 'abort' }
          ]
        });
        
        if (action === 'abort') return false;
        if (action === 'show') {
          console.log('\nComplexity:', fn.complexity.cyclomatic);
          console.log('Dependencies:', fn.dependencies.join(', ') || 'None');
          console.log('Side effects:', fn.sideEffects.map(se => se.operation).join(', ') || 'None');
        }
      }
    }
  }
  
  // Batch confirm simple functions
  if (simple.length > 0) {
    console.log(chalk.cyan(`\n--- Simple Functions (${simple.length} total) ---\n`));
    
    const { showSimple } = await prompts({
      type: 'confirm',
      name: 'showSimple',
      message: `Show details for ${simple.length} simple functions?`,
      initial: false
    });
    
    if (showSimple) {
      simple.forEach(a => {
        console.log(`  - ${a.name} (complexity ${a.complexity.cyclomatic})`);
      });
    }
    
    const { approveSimple } = await prompts({
      type: 'confirm',
      name: 'approveSimple',
      message: `Approve all ${simple.length} simple functions?`,
      initial: true
    });
    
    if (!approveSimple) return false;
  }
  
  // Batch confirm moderate functions
  if (moderate.length > 0) {
    console.log(chalk.cyan(`\n--- Moderate Functions (${moderate.length} total) ---\n`));
    
    const { approveModerate } = await prompts({
      type: 'confirm',
      name: 'approveModerate',
      message: `Approve all ${moderate.length} moderate functions?`,
      initial: true
    });
    
    if (!approveModerate) return false;
  }
  
  // Individual review for complex functions
  if (complex.length > 0) {
    console.log(chalk.cyan(`\n--- Complex Functions (${complex.length} total) ---\n`));
    
    for (const analysis of complex) {
      console.log(chalk.bold(`\n=== ${analysis.name} ===`));
      console.log(`File: ${analysis.sourceFile}`);
      console.log(`Complexity: ${analysis.complexity.cyclomatic}`);
      console.log(`Dependencies: ${analysis.dependencies.length}`);
      console.log(`Side effects: ${analysis.sideEffects.length}`);
      
      const { action } = await prompts({
        type: 'select',
        name: 'action',
        message: 'Action:',
        choices: [
          { title: 'Approve', value: 'approve' },
          { title: 'Show details', value: 'show' },
          { title: 'Abort', value: 'abort' }
        ]
      });
      
      if (action === 'abort') return false;
      if (action === 'show') {
        console.log('\nSignature:', analysis.signature);
        console.log('Dependencies:', analysis.dependencies.join(', ') || 'None');
      }
    }
  }
  
  return true;
}

// Run analyzer
analyzeAllFunctions().catch(err => {
  console.error(chalk.red('\n✗ Analysis failed:', err.message));
  console.error(err.stack);
  process.exit(1);
});
