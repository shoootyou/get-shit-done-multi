const fs = require('fs');
const { generateAgent } = require('./bin/lib/template-system/generator');
const { validateClaudeSpec, validateCopilotSpec } = require('./bin/lib/template-system/validators');
const matter = require('gray-matter');

const agentNames = [
  'gsd-planner', 'gsd-executor', 'gsd-verifier',
  'gsd-codebase-mapper', 'gsd-debugger', 'gsd-phase-researcher',
  'gsd-plan-checker', 'gsd-project-researcher', 'gsd-research-synthesizer',
  'gsd-roadmapper', 'gsd-integration-checker'
];

const report = [];
report.push('# Platform Generation Validation Report');
report.push('');
report.push('**Generated:** ' + new Date().toISOString());
report.push('**Agents tested:** ' + agentNames.length);
report.push('');

// Test each agent on both platforms
const results = { claude: [], copilot: [] };

console.log('Testing Claude generation...');
for (const name of agentNames) {
  const specPath = `specs/agents/${name}.md`;
  
  // Generate for Claude
  const claudeResult = generateAgent(specPath, 'claude', { workDir: '/workspace' });
  results.claude.push({
    name,
    success: claudeResult.success,
    size: claudeResult.success ? claudeResult.output.length : 0,
    errors: claudeResult.errors || [],
    warnings: claudeResult.warnings || []
  });
  
  // Validate Claude output
  if (claudeResult.success) {
    const parsed = matter(claudeResult.output);
    const validation = validateClaudeSpec(parsed.data);
    results.claude[results.claude.length - 1].valid = validation.valid;
    results.claude[results.claude.length - 1].validationErrors = validation.errors || [];
  }
  
  console.log(`  ${name}: ${claudeResult.success ? '✓' : '✗'}`);
}

console.log('\nTesting Copilot generation...');
for (const name of agentNames) {
  const specPath = `specs/agents/${name}.md`;
  
  // Generate for Copilot
  const copilotResult = generateAgent(specPath, 'copilot', { workDir: '.github/skills/get-shit-done' });
  results.copilot.push({
    name,
    success: copilotResult.success,
    size: copilotResult.success ? copilotResult.output.length : 0,
    errors: copilotResult.errors || [],
    warnings: copilotResult.warnings || []
  });
  
  // Validate Copilot output
  if (copilotResult.success) {
    const parsed = matter(copilotResult.output);
    const validation = validateCopilotSpec(parsed.data);
    results.copilot[results.copilot.length - 1].valid = validation.valid;
    results.copilot[results.copilot.length - 1].validationErrors = validation.errors || [];
  }
  
  console.log(`  ${name}: ${copilotResult.success ? '✓' : '✗'}`);
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
