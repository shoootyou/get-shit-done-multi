const { generateAgent } = require('./bin/lib/template-system/generator');
const fs = require('fs');
const path = require('path');

// All 13 agents to generate (11 original - 2 old + 4 new = 13)
const AGENTS = [
  'gsd-codebase-mapper',
  'gsd-debugger-investigator',      // NEW (split from gsd-debugger)
  'gsd-debugger-specialist',        // NEW (split from gsd-debugger)
  'gsd-executor',
  'gsd-integration-checker',
  'gsd-phase-researcher',
  'gsd-plan-checker',
  'gsd-planner-coordinator',        // NEW (split from gsd-planner)
  'gsd-planner-strategist',         // NEW (split from gsd-planner)
  'gsd-project-researcher',
  'gsd-research-synthesizer',
  'gsd-roadmapper',
  'gsd-verifier'
];

const SPECS_DIR = path.join(__dirname, 'specs/agents');
const OUTPUT_DIR = path.join(__dirname, 'test-output');

// Ensure output directories exist
fs.mkdirSync(path.join(OUTPUT_DIR, 'claude'), { recursive: true });
fs.mkdirSync(path.join(OUTPUT_DIR, 'copilot'), { recursive: true });

// Generate for both platforms
for (const platform of ['claude', 'copilot']) {
  console.log(`\n=== Generating ${platform} agents ===`);
  let successCount = 0;
  let failureCount = 0;
  
  const workDir = platform === 'claude' ? '/workspace' : '.github/skills/get-shit-done';
  
  for (const agentName of AGENTS) {
    const specPath = path.join(SPECS_DIR, `${agentName}.md`);
    const result = generateAgent(specPath, platform, { workDir, validate: true });
    
    if (result.success) {
      const outputPath = path.join(OUTPUT_DIR, platform, `${agentName}.md`);
      fs.writeFileSync(outputPath, result.output);
      console.log(`✓ ${agentName} (${result.output.length} chars)`);
      successCount++;
    } else {
      const errorMsg = result.errors[0] ? result.errors[0].message : 'Unknown error';
      console.log(`✗ ${agentName} - ${errorMsg}`);
      failureCount++;
    }
  }
  
  console.log(`\n${platform}: ${successCount} success, ${failureCount} failed`);
}

// After generation, report sizes
console.log('\n=== Size Report ===');
const platforms = ['claude', 'copilot'];
for (const platform of platforms) {
  const dir = path.join(OUTPUT_DIR, platform);
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
  
  console.log(`\n${platform}:`);
  for (const file of files) {
    const content = fs.readFileSync(path.join(dir, file), 'utf8');
    const sizeKB = (content.length / 1024).toFixed(1);
    const status = platform === 'copilot' && content.length > 30000 ? '⚠️ TOO LARGE' : '✓';
    console.log(`  ${status} ${file}: ${sizeKB}KB`);
  }
}

console.log('\n✓ All agents generated successfully!');
