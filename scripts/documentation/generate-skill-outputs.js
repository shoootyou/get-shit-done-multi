#!/usr/bin/env node

/**
 * Generate platform-specific skill outputs from canonical specs
 * 
 * Usage:
 *   node scripts/generate-skill-outputs.js [skill-name]
 * 
 * Examples:
 *   node scripts/generate-skill-outputs.js gsd-help
 *   node scripts/generate-skill-outputs.js --all
 */

const fs = require('fs');
const path = require('path');

// Platform configurations
const PLATFORMS = [
  { 
    name: 'claude', 
    flag: 'isClaude', 
    toolMap: {
      'Read': 'Read',
      'Bash': 'Bash', 
      'Glob': 'Glob',
      'Grep': 'Grep',
      'Edit': 'Edit',
      'Write': 'Write'
    }
  },
  { 
    name: 'copilot', 
    flag: 'isCopilot',
    toolMap: {
      'Read': 'file_read',
      'Bash': 'shell_execute',
      'Glob': 'glob',
      'Grep': 'grep',
      'Edit': 'file_edit',
      'Write': 'file_write'
    }
  },
  { 
    name: 'codex', 
    flag: 'isCodex',
    toolMap: {
      'Read': 'read',
      'Bash': 'bash',
      'Glob': 'glob',
      'Grep': 'grep',
      'Edit': 'edit',
      'Write': 'write'
    }
  }
];

/**
 * Process conditional blocks in content
 * @param {string} content - Content with conditional blocks
 * @param {string} platformFlag - Platform flag (e.g., 'isClaude')
 * @returns {string} Processed content
 */
function processConditionals(content, platformFlag) {
  let result = content;
  
  // Remove other platform blocks entirely
  PLATFORMS.forEach(platform => {
    if (platform.flag !== platformFlag) {
      const regex = new RegExp(`\\{\\{#${platform.flag}\\}\\}[\\s\\S]*?\\{\\{\\/${platform.flag}\\}\\}`, 'g');
      result = result.replace(regex, '');
    }
  });
  
  // Remove conditional markers for current platform (keep content)
  result = result.replace(new RegExp(`\\{\\{#${platformFlag}\\}\\}`, 'g'), '');
  result = result.replace(new RegExp(`\\{\\{\\/${platformFlag}\\}\\}`, 'g'), '');
  
  return result;
}

/**
 * Extract tools from frontmatter for specific platform
 * @param {string} frontmatter - Raw frontmatter with conditionals
 * @param {string} platformFlag - Platform flag
 * @returns {Array<string>} Tool names
 */
function extractTools(frontmatter, platformFlag) {
  const lines = frontmatter.split('\n');
  let inBlock = false;
  let tools = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if entering our platform block
    if (line === `{{#${platformFlag}}}`) {
      inBlock = true;
      continue;
    }
    
    // Check if leaving our platform block
    if (line === `{{/${platformFlag}}}`) {
      inBlock = false;
      continue;
    }
    
    // If in our block and line has tools
    if (inBlock && line.startsWith('tools:')) {
      const match = line.match(/tools:\s*\[(.*)\]/);
      if (match) {
        tools = match[1].split(',').map(t => t.trim());
      }
    }
  }
  
  return tools;
}

/**
 * Generate platform-specific output from spec
 * @param {string} specPath - Path to spec file
 * @param {Object} platform - Platform configuration
 * @returns {string} Generated output
 */
function generateOutput(specPath, platform) {
  const content = fs.readFileSync(specPath, 'utf8');
  
  // Split frontmatter and body
  const parts = content.split('---');
  if (parts.length < 3) {
    throw new Error(`Invalid spec format: ${specPath}`);
  }
  
  const frontmatterRaw = parts[1];
  const body = parts.slice(2).join('---');
  
  // Extract metadata from frontmatter
  const nameMatch = frontmatterRaw.match(/name:\s*(.+)/);
  const descMatch = frontmatterRaw.match(/description:\s*(.+)/);
  
  if (!nameMatch || !descMatch) {
    throw new Error(`Missing name or description in: ${specPath}`);
  }
  
  const name = nameMatch[1].trim();
  const description = descMatch[1].trim();
  
  // Extract tools for this platform
  const tools = extractTools(frontmatterRaw, platform.flag);
  
  // Process body conditionals
  const processedBody = processConditionals(body, platform.flag);
  
  // Build clean frontmatter
  const cleanFrontmatter = [
    'name: ' + name,
    'description: ' + description
  ];
  
  // Only add tools if they exist
  if (tools && tools.length > 0) {
    cleanFrontmatter.push('tools: [' + tools.join(', ') + ']');
  }
  
  // Combine
  return `---\n${cleanFrontmatter.join('\n')}\n---\n${processedBody}`;
}

/**
 * Generate outputs for a single skill
 * @param {string} skillName - Skill name (e.g., 'gsd-help')
 */
function generateSkill(skillName) {
  const specPath = path.join(process.cwd(), 'specs', 'skills', skillName, 'SKILL.md');
  
  if (!fs.existsSync(specPath)) {
    console.error(`❌ Spec not found: ${specPath}`);
    return false;
  }
  
  console.log(`\n📝 Processing: ${skillName}`);
  console.log(`   Source: ${specPath}`);
  
  let success = true;
  
  PLATFORMS.forEach(platform => {
    try {
      const output = generateOutput(specPath, platform);
      const outPath = path.join(
        process.cwd(), 
        'test-output', 
        platform.name, 
        'skills',
        skillName,
        'SKILL.md'
      );
      
      // Ensure directory exists
      fs.mkdirSync(path.dirname(outPath), { recursive: true });
      
      // Write output
      fs.writeFileSync(outPath, output);
      
      console.log(`   ✓ ${platform.name.padEnd(8)}: ${outPath} (${output.length} bytes)`);
    } catch (error) {
      console.error(`   ❌ ${platform.name}: ${error.message}`);
      success = false;
    }
  });
  
  return success;
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: node scripts/generate-skill-outputs.js [skill-name|--all]');
    console.log('\nExamples:');
    console.log('  node scripts/generate-skill-outputs.js gsd-help');
    console.log('  node scripts/generate-skill-outputs.js --all');
    process.exit(1);
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(' SKILL OUTPUT GENERATOR');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (args[0] === '--all') {
    // Generate all skills
    const skillsDir = path.join(process.cwd(), 'specs', 'skills');
    
    if (!fs.existsSync(skillsDir)) {
      console.error('❌ No specs/skills/ directory found');
      process.exit(1);
    }
    
    const skills = fs.readdirSync(skillsDir).filter(name => {
      const specPath = path.join(skillsDir, name, 'SKILL.md');
      return fs.existsSync(specPath);
    });
    
    console.log(`\nFound ${skills.length} skill(s) to process\n`);
    
    let successCount = 0;
    skills.forEach(skill => {
      if (generateSkill(skill)) {
        successCount++;
      }
    });
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(` ✓ Generated outputs for ${successCount}/${skills.length} skill(s)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    if (successCount < skills.length) {
      process.exit(1);
    }
  } else {
    // Generate single skill
    const skillName = args[0];
    
    if (!generateSkill(skillName)) {
      process.exit(1);
    }
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(' ✓ Generation complete');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateOutput, processConditionals, extractTools };
