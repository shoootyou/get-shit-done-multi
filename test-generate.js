const fs = require('fs');
const path = require('path');
const { generateAgent } = require('./bin/lib/template-system/generator');

// Generate gsd-list-phase-assumptions
const specPath = 'specs/skills/gsd-list-phase-assumptions/SKILL.md';
const outputDir = '.claude/get-shit-done/gsd-list-phase-assumptions';

try {
  const result = generateAgent(specPath, 'claude');
  
  if (result.success) {
    fs.mkdirSync(outputDir, { recursive: true });
    const outputPath = path.join(outputDir, 'SKILL.md');
    fs.writeFileSync(outputPath, result.output, 'utf8');
    console.log('✓ gsd-list-phase-assumptions generated successfully');
  } else {
    console.error('✗ Generation failed:', result.errors);
    process.exit(1);
  }
} catch (err) {
  console.error('✗ Error:', err.message);
  process.exit(1);
}
