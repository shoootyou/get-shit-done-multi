const { generateAgent } = require('./bin/lib/template-system/generator');
const fs = require('fs');
const path = require('path');

// Generate Claude agent
console.log('Generating Claude agent...');
const claudeResult = generateAgent(
  path.join(__dirname, 'specs/agents/gsd-planner.md'),
  'claude',
  { workDir: '/workspace', validate: true }
);

if (!claudeResult.success) {
  console.error('Claude generation failed:', claudeResult.errors);
  process.exit(1);
}

fs.writeFileSync('test-output/claude/gsd-planner.md', claudeResult.output, 'utf8');
console.log('✓ Generated Claude agent:', claudeResult.output.length, 'bytes');
console.log('  Warnings:', claudeResult.warnings.length);

// Generate Copilot agent (use smaller agent)
console.log('\nGenerating Copilot agent...');
const copilotResult = generateAgent(
  path.join(__dirname, 'specs/agents/gsd-verifier.md'),
  'copilot',
  { workDir: '.github/skills/get-shit-done', validate: true }
);

if (!copilotResult.success) {
  console.error('Copilot generation failed:', copilotResult.errors);
  process.exit(1);
}

fs.writeFileSync('test-output/copilot/gsd-verifier.md', copilotResult.output, 'utf8');
console.log('✓ Generated Copilot agent:', copilotResult.output.length, 'bytes');
console.log('  Warnings:', copilotResult.warnings.length);

console.log('\n✓ Sample agents generated successfully!');
