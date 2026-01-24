#!/usr/bin/env node
/**
 * Validate GSD installation
 * Usage: scripts/validate-installation.js [path] [--platform copilot|claude|codex]
 */

const fs = require('fs');
const path = require('path');

// ANSI colors
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const red = '\x1b[31m';
const cyan = '\x1b[36m';
const reset = '\x1b[0m';

// Expected skills for each platform
const EXPECTED_SKILLS = {
  copilot: ['gsd-help', 'gsd-execute-phase', 'gsd-new-project', 'gsd-new-milestone'],
  claude: ['gsd-help', 'gsd-execute-phase', 'gsd-new-project', 'gsd-new-milestone'],
  codex: ['gsd-help', 'gsd-execute-phase', 'gsd-new-project', 'gsd-new-milestone']
};

// Platform-specific paths
const PLATFORM_PATHS = {
  copilot: { skills: '.github/skills', agents: '.github/agents' },
  claude: { skills: '.claude/skills', agents: '.claude/agents' },
  codex: { skills: '.codex/skills', agents: '.codex/agents' }
};

function validateInstallation(basePath, platform) {
  const results = {
    success: true,
    checks: [],
    errors: [],
    warnings: []
  };
  
  const paths = PLATFORM_PATHS[platform];
  const skillsDir = path.join(basePath, paths.skills);
  const agentsDir = path.join(basePath, paths.agents);
  
  // Check 1: Skills directory exists
  if (!fs.existsSync(skillsDir)) {
    results.success = false;
    results.errors.push(`Skills directory not found: ${skillsDir}`);
    return results;
  }
  results.checks.push({ name: 'Skills directory exists', status: 'pass', path: skillsDir });
  
  // Check 2: Expected skills present
  const expectedSkills = EXPECTED_SKILLS[platform];
  const missingSkills = [];
  const foundSkills = [];
  
  for (const skillName of expectedSkills) {
    const skillPath = path.join(skillsDir, skillName, 'SKILL.md');
    if (fs.existsSync(skillPath)) {
      const stats = fs.statSync(skillPath);
      if (stats.size > 0) {
        foundSkills.push(skillName);
        results.checks.push({ name: `Skill: ${skillName}`, status: 'pass', size: stats.size });
      } else {
        results.success = false;
        results.errors.push(`Skill file is empty: ${skillName}/SKILL.md`);
      }
    } else {
      missingSkills.push(skillName);
      results.success = false;
      results.errors.push(`Skill not found: ${skillName}/SKILL.md`);
    }
  }
  
  // Check 3: Agents directory exists
  if (fs.existsSync(agentsDir)) {
    const agentFiles = fs.readdirSync(agentsDir).filter(f => f.endsWith('.agent.md'));
    results.checks.push({ name: `Agents installed`, status: 'pass', count: agentFiles.length });
  } else {
    results.warnings.push(`Agents directory not found: ${agentsDir}`);
  }
  
  // Check 4: Legacy skill exists (for Copilot)
  if (platform === 'copilot') {
    const legacyPath = path.join(skillsDir, 'get-shit-done', 'SKILL.md');
    if (fs.existsSync(legacyPath)) {
      results.checks.push({ name: 'Legacy skill (get-shit-done)', status: 'pass' });
    } else {
      results.warnings.push('Legacy skill not found (non-critical)');
    }
  }
  
  return results;
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const targetPath = args[0] && !args[0].startsWith('--') ? args[0] : process.cwd();
  const platformIndex = args.indexOf('--platform');
  const platform = platformIndex !== -1 && args[platformIndex + 1] 
    ? args[platformIndex + 1] 
    : 'copilot';
  
  console.log(`${cyan}Validating ${platform} installation at:${reset} ${targetPath}\n`);
  
  const results = validateInstallation(targetPath, platform);
  
  // Print results
  console.log(`${cyan}Checks:${reset}`);
  results.checks.forEach(check => {
    const statusIcon = check.status === 'pass' ? `${green}✓${reset}` : `${red}✗${reset}`;
    let msg = `  ${statusIcon} ${check.name}`;
    if (check.size) msg += ` ${yellow}(${(check.size / 1024).toFixed(1)} KB)${reset}`;
    if (check.count !== undefined) msg += ` ${yellow}(${check.count})${reset}`;
    console.log(msg);
  });
  
  if (results.errors.length > 0) {
    console.log(`\n${red}Errors:${reset}`);
    results.errors.forEach(err => console.log(`  ${red}✗${reset} ${err}`));
  }
  
  if (results.warnings.length > 0) {
    console.log(`\n${yellow}Warnings:${reset}`);
    results.warnings.forEach(warn => console.log(`  ${yellow}⚠${reset} ${warn}`));
  }
  
  if (results.success) {
    console.log(`\n${green}✓ Installation valid${reset}`);
    process.exit(0);
  } else {
    console.log(`\n${red}✗ Installation invalid${reset}`);
    console.log(`\nTo fix, run: node bin/install.js --${platform}${targetPath !== process.cwd() ? ' --project-dir ' + targetPath : ''}`);
    process.exit(1);
  }
}

module.exports = { validateInstallation };
