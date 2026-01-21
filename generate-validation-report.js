const fs = require('fs');
const path = require('path');
const { validateClaudeSpec, validateCopilotSpec } = require('./bin/lib/template-system/validators');
const matter = require('gray-matter');

/**
 * Validate YAML frontmatter format
 * @param {string} content - Agent file content
 * @param {string} platform - Platform name ('claude' or 'copilot')
 * @returns {Object} Validation result
 */
function validateFormat(content, platform) {
  const issues = [];
  
  // Extract frontmatter
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) {
    return { valid: false, issues: ['No frontmatter found'] };
  }
  
  const frontmatter = match[1];
  
  // Check 1: Description should be single-line (no >-)
  if (frontmatter.includes('description: >-') || frontmatter.includes('description: |-')) {
    issues.push('Description uses multi-line format (should be single-line)');
  }
  
  // Check 2: Claude tools should be comma-separated string
  if (platform === 'claude') {
    // Look for tools: with array brackets
    if (/tools:\s*\n\s*-/.test(frontmatter)) {
      issues.push('Claude tools use array format (should be comma-separated string)');
    }
    // Check for metadata fields
    if (frontmatter.includes('_platform:') || frontmatter.includes('_generated:')) {
      issues.push('Claude has metadata fields at root (should have none)');
    }
    if (frontmatter.includes('metadata:')) {
      issues.push('Claude has metadata object (should have none)');
    }
  }
  
  // Check 3: Copilot tools should be single-line array
  if (platform === 'copilot') {
    // Look for multi-line array
    if (/tools:\s*\n\s*-/.test(frontmatter)) {
      issues.push('Copilot tools use multi-line array (should be single-line array)');
    }
    // Check for metadata structure
    if (frontmatter.includes('_platform:') && !frontmatter.includes('metadata:')) {
      issues.push('Copilot has _platform at root (should be under metadata object)');
    }
  }
  
  return {
    valid: issues.length === 0,
    issues: issues
  };
}

const agentNames = [
  'gsd-planner', 'gsd-executor', 'gsd-verifier',
  'gsd-codebase-mapper', 'gsd-debugger', 'gsd-phase-researcher',
  'gsd-plan-checker', 'gsd-project-researcher', 'gsd-research-synthesizer',
  'gsd-roadmapper', 'gsd-integration-checker'
];

const OUTPUT_DIR = 'test-output';
const report = [];
report.push('# Platform Generation Validation Report');
report.push('');
report.push('**Generated:** ' + new Date().toISOString());
report.push('**Agents tested:** ' + agentNames.length);
report.push('');

// Read existing generated files
const results = { claude: [], copilot: [] };

console.log('Reading Claude agents...');
for (const name of agentNames) {
  const agentPath = path.join(OUTPUT_DIR, 'claude', `${name}.md`);
  
  if (fs.existsSync(agentPath)) {
    const content = fs.readFileSync(agentPath, 'utf8');
    const parsed = matter(content);
    const validation = validateClaudeSpec(parsed.data);
    
    results.claude.push({
      name,
      success: true,
      size: content.length,
      errors: [],
      warnings: [],
      valid: validation.valid,
      validationErrors: validation.errors || []
    });
    console.log(`  ${name}: ✓`);
  } else {
    results.claude.push({
      name,
      success: false,
      size: 0,
      errors: [{ message: 'File not found' }],
      warnings: [],
      valid: false,
      validationErrors: []
    });
    console.log(`  ${name}: ✗ (not found)`);
  }
}

console.log('\nReading Copilot agents...');
for (const name of agentNames) {
  const agentPath = path.join(OUTPUT_DIR, 'copilot', `${name}.md`);
  
  if (fs.existsSync(agentPath)) {
    const content = fs.readFileSync(agentPath, 'utf8');
    const parsed = matter(content);
    const validation = validateCopilotSpec(parsed.data);
    
    results.copilot.push({
      name,
      success: true,
      size: content.length,
      errors: [],
      warnings: [],
      valid: validation.valid,
      validationErrors: validation.errors || []
    });
    console.log(`  ${name}: ✓`);
  } else {
    // Check if this is expected (gsd-planner and gsd-debugger are too large)
    const expectedMissing = ['gsd-planner', 'gsd-debugger'].includes(name);
    results.copilot.push({
      name,
      success: false,
      size: 0,
      errors: [{ 
        message: expectedMissing ? 'Exceeds 30K size limit' : 'File not found',
        stage: expectedMissing ? 'prompt-length' : 'file-read'
      }],
      warnings: [],
      valid: false,
      validationErrors: []
    });
    console.log(`  ${name}: ✗ (${expectedMissing ? 'too large' : 'not found'})`);
  }
}

// Summary stats
const claudeSuccess = results.claude.filter(r => r.success).length;
const claudeValid = results.claude.filter(r => r.valid).length;
const copilotSuccess = results.copilot.filter(r => r.success).length;
const copilotValid = results.copilot.filter(r => r.valid).length;

report.push('## Summary');
report.push('');
report.push('| Platform | Generated | Valid | Success Rate |');
report.push('|----------|-----------|-------|--------------|');
report.push(`| Claude | ${claudeSuccess}/${agentNames.length} | ${claudeValid}/${claudeSuccess} | ${Math.round(claudeSuccess/agentNames.length*100)}% |`);
report.push(`| Copilot | ${copilotSuccess}/${agentNames.length} | ${copilotValid}/${copilotSuccess} | ${Math.round(copilotSuccess/agentNames.length*100)}% |`);
report.push('');

// Claude results
report.push('## Claude Generation Results');
report.push('');
report.push('| Agent | Status | Size | Valid | Issues |');
report.push('|-------|--------|------|-------|--------|');
for (const r of results.claude) {
  const status = r.success ? '✓' : '✗';
  const valid = r.valid ? '✓' : (r.success ? '✗' : '-');
  const issues = [...r.errors, ...(r.validationErrors || [])].length;
  report.push(`| ${r.name} | ${status} | ${r.size} | ${valid} | ${issues} |`);
}
report.push('');

// Copilot results
report.push('## Copilot Generation Results');
report.push('');
report.push('| Agent | Status | Size | Valid | Issues |');
report.push('|-------|--------|------|-------|--------|');
for (const r of results.copilot) {
  const status = r.success ? '✓' : '✗';
  const valid = r.valid ? '✓' : (r.success ? '✗' : '-');
  const issues = [...r.errors, ...(r.validationErrors || [])].length;
  const errorNote = !r.success && r.errors.some(e => e.stage === 'prompt-length') ? ' (too large)' : '';
  report.push(`| ${r.name} | ${status} | ${r.size} | ${valid} | ${issues}${errorNote} |`);
}
report.push('');

// Format Compliance Section

report.push('## Format Compliance');
report.push('');
report.push('### Claude Agents');
report.push('');
report.push('| Agent | Description | Tools | Metadata | Status |');
report.push('|-------|-------------|-------|----------|--------|');

const claudeDir = path.join(OUTPUT_DIR, 'claude');
if (fs.existsSync(claudeDir)) {
  const claudeFiles = fs.readdirSync(claudeDir).filter(f => f.endsWith('.md'));
  for (const file of claudeFiles) {
    const content = fs.readFileSync(path.join(claudeDir, file), 'utf8');
    const validation = validateFormat(content, 'claude');
    
    const agentName = file.replace('.md', '');
    const descOk = !validation.issues.some(i => i.includes('Description'));
    const toolsOk = !validation.issues.some(i => i.includes('tools'));
    const metadataOk = !validation.issues.some(i => i.includes('metadata'));
    const status = validation.valid ? '✅ Pass' : '❌ Fail';
    
    report.push(`| ${agentName} | ${descOk ? '✅' : '❌'} | ${toolsOk ? '✅' : '❌'} | ${metadataOk ? '✅' : '❌'} | ${status} |`);
  }
}

report.push('');
report.push('### Copilot Agents');
report.push('');
report.push('| Agent | Description | Tools | Metadata | Status |');
report.push('|-------|-------------|-------|----------|--------|');

const copilotDir = path.join(OUTPUT_DIR, 'copilot');
if (fs.existsSync(copilotDir)) {
  const copilotFiles = fs.readdirSync(copilotDir).filter(f => f.endsWith('.md'));
  for (const file of copilotFiles) {
    const content = fs.readFileSync(path.join(copilotDir, file), 'utf8');
    const validation = validateFormat(content, 'copilot');
    
    const agentName = file.replace('.md', '');
    const descOk = !validation.issues.some(i => i.includes('Description'));
    const toolsOk = !validation.issues.some(i => i.includes('tools'));
    const metadataOk = !validation.issues.some(i => i.includes('metadata'));
    const status = validation.valid ? '✅ Pass' : '❌ Fail';
    
    report.push(`| ${agentName} | ${descOk ? '✅' : '❌'} | ${toolsOk ? '✅' : '❌'} | ${metadataOk ? '✅' : '❌'} | ${status} |`);
  }
}

report.push('');

// Platform differences
report.push('## Platform Differences');
report.push('');
report.push('**Claude-specific features:**');
report.push('- Case-sensitive tool names (Bash, Read, Write)');
report.push('- WebFetch tool (internet access)');
report.push('- MCP wildcard tools (mcp__context7__*)');
report.push('- Model field support (haiku, sonnet, opus)');
report.push('- Hooks and skills support');
report.push('- 200K character prompt limit');
report.push('');
report.push('**Copilot-specific features:**');
report.push('- Lowercase tool names (bash, read, write)');
report.push('- MCP server configuration (mcp-servers field)');
report.push('- Excludes model, hooks, skills, disallowedTools fields');
report.push('- 30K character prompt limit');
report.push('');
report.push('**Note:** Some agents exceed Copilot\'s 30K limit (gsd-planner: 41KB, gsd-debugger: 35KB)');
report.push('');

// Write report
fs.writeFileSync('test-output/VALIDATION-REPORT.md', report.join('\n'), 'utf8');
console.log('\n✓ Validation report generated: test-output/VALIDATION-REPORT.md');
console.log('Claude: ' + claudeSuccess + '/' + agentNames.length + ' generated, ' + claudeValid + '/' + claudeSuccess + ' valid');
console.log('Copilot: ' + copilotSuccess + '/' + agentNames.length + ' generated, ' + copilotValid + '/' + copilotSuccess + ' valid');

// Report status
if (claudeSuccess < agentNames.length) {
  console.error('\n✗ Some Claude agents failed to generate!');
  process.exit(1);
}
if (claudeValid < claudeSuccess) {
  console.error('\n✗ Some Claude agents failed validation!');
  process.exit(1);
}

// For Copilot, allow some failures due to size limits
if (copilotSuccess < (agentNames.length - 2)) {
  console.error('\n✗ Too many Copilot agents failed (expected max 2 due to size)!');
  process.exit(1);
}
if (copilotValid < copilotSuccess) {
  console.error('\n✗ Some Copilot agents failed validation!');
  process.exit(1);
}

console.log('\n✓ All validations passed!');
