#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Tool mapping: Claude → Platform equivalents
const toolMappings = {
  copilot: {
    view: 'read_file',
    edit: 'edit_file',
    create: 'create_file',
    bash: 'execute_command',
    task: 'delegate_task'
  },
  claude: {
    view: 'view',
    edit: 'edit',
    create: 'create',
    bash: 'bash',
    task: 'task'
  },
  codex: {
    view: 'file.read',
    edit: 'file.modify',
    create: 'file.create',
    bash: 'shell.execute',
    task: 'agent.spawn'
  }
};

async function testToolMapping(platform) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing Tool Mapping: ${platform}`);
  console.log('='.repeat(60));
  
  const testDir = path.join(__dirname, '..', 'test-environments', `${platform}-test`, 'get-shit-done');
  const platformPaths = {
    copilot: '.github/copilot/skills',
    claude: '.claude/get-shit-done',
    codex: '.codex/skills'
  };
  
  const skillsDir = path.join(testDir, platformPaths[platform]);
  
  if (!fs.existsSync(skillsDir)) {
    console.log(`❌ Skills directory not found: ${skillsDir}`);
    return { platform, success: false, error: 'Skills directory not found' };
  }
  
  const skills = fs.readdirSync(skillsDir).filter(f => f.startsWith('gsd-') && f.endsWith('.md'));
  const results = { platform, tested: 0, passed: 0, failed: 0, failures: [] };
  
  for (const skillFile of skills.slice(0, 5)) { // Sample 5 skills
    const content = fs.readFileSync(path.join(skillsDir, skillFile), 'utf8');
    results.tested++;
    
    // Check tool declarations
    const toolsMatch = content.match(/tools:\s*\[(.*?)\]/s);
    if (!toolsMatch) {
      results.failed++;
      results.failures.push({
        skill: skillFile,
        issue: 'No tools array found'
      });
      continue;
    }
    
    const declaredTools = toolsMatch[1].split(',').map(t => t.trim().replace(/['"]/g, ''));
    
    // Verify each tool is properly mapped
    let allToolsValid = true;
    for (const tool of declaredTools) {
      const expectedMapping = toolMappings[platform][tool];
      if (!expectedMapping) {
        allToolsValid = false;
        results.failures.push({
          skill: skillFile,
          tool,
          issue: `No mapping defined for platform ${platform}`
        });
      } else if (platform !== 'claude') {
        // For non-Claude platforms, verify tool is mapped in content
        // (This is simplified - actual implementation would check tool descriptions)
        const hasMapping = content.includes(expectedMapping) || content.includes(tool);
        if (!hasMapping) {
          console.log(`  ⚠️  ${skillFile}: Tool '${tool}' not clearly mapped to '${expectedMapping}'`);
        }
      }
    }
    
    if (allToolsValid) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  console.log(`\n✅ Passed: ${results.passed}/${results.tested}`);
  if (results.failed > 0) {
    console.log(`❌ Failed: ${results.failed}`);
    results.failures.forEach(f => {
      console.log(`  - ${f.skill}: ${f.issue || f.tool + ' - ' + f.issue}`);
    });
  }
  
  return results;
}

async function testContentRendering(platform) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing Platform-Specific Content: ${platform}`);
  console.log('='.repeat(60));
  
  const testDir = path.join(__dirname, '..', 'test-environments', `${platform}-test`, 'get-shit-done');
  const platformPaths = {
    copilot: '.github/copilot/skills',
    claude: '.claude/get-shit-done',
    codex: '.codex/skills'
  };
  
  const skillsDir = path.join(testDir, platformPaths[platform]);
  const skills = fs.readdirSync(skillsDir).filter(f => f.startsWith('gsd-') && f.endsWith('.md'));
  
  const results = { platform, tested: 0, passed: 0, failed: 0, issues: [] };
  
  // Sample check: Verify platform-specific conditionals rendered correctly
  for (const skillFile of skills.slice(0, 5)) {
    const content = fs.readFileSync(path.join(skillsDir, skillFile), 'utf8');
    results.tested++;
    
    let passed = true;
    
    // Should NOT contain other platform conditionals
    const otherPlatforms = ['claude', 'copilot', 'codex'].filter(p => p !== platform);
    for (const other of otherPlatforms) {
      const conditionalPattern = new RegExp(`{{#is${other.charAt(0).toUpperCase() + other.slice(1)}}}`, 'i');
      if (conditionalPattern.test(content)) {
        passed = false;
        results.issues.push({
          skill: skillFile,
          issue: `Contains unrendered conditional for ${other}`
        });
      }
    }
    
    // Should NOT contain closing conditional tags
    if (content.includes('{{/isClaude}}') || content.includes('{{/isCopilot}}') || content.includes('{{/isCodex}}')) {
      passed = false;
      results.issues.push({
        skill: skillFile,
        issue: 'Contains unrendered conditional closing tags'
      });
    }
    
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }
  
  console.log(`\n✅ Clean rendering: ${results.passed}/${results.tested}`);
  if (results.failed > 0) {
    console.log(`❌ Issues found: ${results.failed}`);
    results.issues.forEach(i => {
      console.log(`  - ${i.skill}: ${i.issue}`);
    });
  }
  
  return results;
}

async function main() {
  console.log('🔧 Testing Tool Mapping & Content Rendering\n');
  
  const platforms = ['copilot', 'claude', 'codex'];
  const allResults = [];
  
  for (const platform of platforms) {
    const mappingResults = await testToolMapping(platform);
    const renderingResults = await testContentRendering(platform);
    
    allResults.push({
      platform,
      toolMapping: mappingResults,
      contentRendering: renderingResults
    });
  }
  
  // Write results
  const resultsPath = path.join(__dirname, '..', 'test-environments', 'tool-mapping-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(allResults, null, 2));
  console.log(`\n📄 Results written to: test-environments/tool-mapping-results.json`);
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Summary');
  console.log('='.repeat(60));
  
  let totalPassed = 0;
  let totalFailed = 0;
  
  for (const result of allResults) {
    const mappingRate = ((result.toolMapping.passed / result.toolMapping.tested) * 100).toFixed(0);
    const renderingRate = ((result.contentRendering.passed / result.contentRendering.tested) * 100).toFixed(0);
    
    console.log(`\n${result.platform}:`);
    console.log(`  Tool Mapping: ${mappingRate}% (${result.toolMapping.passed}/${result.toolMapping.tested})`);
    console.log(`  Content Rendering: ${renderingRate}% (${result.contentRendering.passed}/${result.contentRendering.tested})`);
    
    totalPassed += result.toolMapping.passed + result.contentRendering.passed;
    totalFailed += result.toolMapping.failed + result.contentRendering.failed;
  }
  
  console.log(`\n✅ Overall: ${totalPassed}/${totalPassed + totalFailed} checks passed`);
  
  if (totalFailed > 0) {
    console.log(`\n⚠️  ${totalFailed} checks failed - review results for details`);
    process.exit(1);
  }
  
  console.log('\n✅ All tool mapping and content rendering checks passed!');
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Test error:', err);
    process.exit(1);
  });
}

module.exports = { testToolMapping, testContentRendering, toolMappings };
