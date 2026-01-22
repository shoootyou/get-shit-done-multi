#!/usr/bin/env node

const { generateAgent } = require('./lib/template-system/generator');
const fs = require('fs');
const path = require('path');
const os = require('os');

function runTests() {
  let passed = 0;
  let failed = 0;
  
  console.log('=== Agent Installation Tests ===\n');
  
  const testDir = path.join(os.tmpdir(), 'agent-installation-test-' + Date.now());
  fs.mkdirSync(testDir, { recursive: true });
  
  try {
    // Test 1: Claude local installation
    console.log('Test 1: Claude local installation\n');
    
    const claudeLocalDir = path.join(testDir, 'claude-local');
    const claudeDirs = {
      agents: path.join(claudeLocalDir, '.claude', 'agents'),
      commands: path.join(claudeLocalDir, '.claude', 'commands', 'gsd'),
      getShitDone: path.join(claudeLocalDir, '.claude', 'get-shit-done')
    };
    
    // Create directories
    for (const dir of Object.values(claudeDirs)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Generate test agent
    const testAgentResult = generateAgent('agents/gsd-executor.md', 'claude');
    
    if (!testAgentResult.success) {
      console.log(`❌ Claude: Failed to generate test agent: ${testAgentResult.errors[0].message}`);
      failed++;
    } else {
      const testAgentPath = path.join(claudeDirs.agents, 'gsd-executor.md');
      fs.writeFileSync(testAgentPath, testAgentResult.output, 'utf8');
      
      // Verify installation
      const installed = fs.existsSync(testAgentPath);
      if (installed) {
        console.log('✅ Claude: Agent installed to .claude/agents/');
        passed++;
      } else {
        console.log('❌ Claude: Agent not found in expected location');
        failed++;
      }
    }
    
    // Test 2: Copilot installation
    console.log('\nTest 2: Copilot installation\n');
    
    const copilotLocalDir = path.join(testDir, 'copilot-local');
    const copilotDirs = {
      agents: path.join(copilotLocalDir, '.github', 'copilot', 'agents')
    };
    
    // Create directories
    for (const dir of Object.values(copilotDirs)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    // Generate test agent
    const testAgentCopilotResult = generateAgent('agents/gsd-executor.md', 'copilot');
    
    if (!testAgentCopilotResult.success) {
      console.log(`❌ Copilot: Failed to generate test agent: ${testAgentCopilotResult.errors[0].message}`);
      failed++;
    } else {
      const testAgentCopilotPath = path.join(copilotDirs.agents, 'gsd-executor.md');
      fs.writeFileSync(testAgentCopilotPath, testAgentCopilotResult.output, 'utf8');
      
      // Verify installation
      const installed = fs.existsSync(testAgentCopilotPath);
      if (installed) {
        console.log('✅ Copilot: Agent installed to .github/copilot/agents/');
        passed++;
      } else {
        console.log('❌ Copilot: Agent not found in expected location');
        failed++;
      }
    }
    
    // Test 3: Validate installed content
    console.log('\nTest 3: Validate installed content\n');
    
    const claudeContent = fs.readFileSync(path.join(claudeDirs.agents, 'gsd-executor.md'), 'utf8');
    const copilotContent = fs.readFileSync(path.join(copilotDirs.agents, 'gsd-executor.md'), 'utf8');
    
    // Claude: tools should be comma-separated string
    const claudeToolsMatch = claudeContent.match(/tools:\s*(.+)/);
    if (claudeToolsMatch && !claudeToolsMatch[1].includes('[')) {
      console.log('✅ Claude: Tools formatted as string (not array)');
      passed++;
    } else {
      console.log('❌ Claude: Tools should be comma-separated string');
      failed++;
    }
    
    // Copilot: tools should be array
    const copilotToolsMatch = copilotContent.match(/tools:\s*\[(.+)\]/);
    if (copilotToolsMatch) {
      console.log('✅ Copilot: Tools formatted as array');
      passed++;
    } else {
      console.log('❌ Copilot: Tools should be array format');
      failed++;
    }
    
    // Copilot: should have metadata
    if (copilotContent.includes('metadata:')) {
      console.log('✅ Copilot: Metadata field present');
      passed++;
    } else {
      console.log('❌ Copilot: Missing metadata field');
      failed++;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log('='.repeat(60));
    
    // Cleanup
    fs.rmSync(testDir, { recursive: true, force: true });
    
    process.exit(failed > 0 ? 1 : 0);
    
  } catch (err) {
    console.error('Test suite error:', err);
    process.exit(1);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { runTests };
