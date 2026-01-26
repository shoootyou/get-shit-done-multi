import { input, select } from '@inquirer/prompts';
import chalk from 'chalk';
import open from 'open';
import path from 'node:path';
import fs from 'fs-extra';
import { execSync } from 'node:child_process';

/**
 * Generate migration summary statistics
 */
export function generateSummary(skillsResult, agentsResult) {
  const lines = [];
  
  lines.push(chalk.blue.bold('\n📊 Migration Summary\n'));
  
  lines.push(chalk.cyan('Skills:'));
  lines.push(`  Total: ${skillsResult.total}`);
  lines.push(`  ${chalk.green('✓ Successful:')} ${skillsResult.successful}`);
  if (skillsResult.failed > 0) {
    lines.push(`  ${chalk.red('✗ Failed:')} ${skillsResult.failed}`);
  }
  
  lines.push(chalk.cyan('\nAgents:'));
  lines.push(`  Total: ${agentsResult.total}`);
  lines.push(`  ${chalk.green('✓ Successful:')} ${agentsResult.successful}`);
  if (agentsResult.failed > 0) {
    lines.push(`  ${chalk.red('✗ Failed:')} ${agentsResult.failed}`);
  }
  
  lines.push(chalk.cyan('\nFiles Created:'));
  lines.push(`  Skills: ${skillsResult.total} × 2 files (SKILL.md + version.json)`);
  lines.push(`  Agents: ${agentsResult.total} × 1 file (.agent.md) + versions.json`);
  lines.push(`  Shared: templates/get-shit-done/ directory`);
  
  const totalFiles = (skillsResult.total * 2) + agentsResult.total + 1;
  lines.push(chalk.green(`\n  Total files: ${totalFiles}`));
  
  return lines.join('\n');
}

/**
 * Check if diff tool is available
 */
function getDiffTool() {
  const tools = [
    { command: 'code', name: 'VS Code' },
    { command: 'meld', name: 'Meld' },
    { command: 'diffuse', name: 'Diffuse' },
    { command: 'kompare', name: 'Kompare' }
  ];
  
  for (const tool of tools) {
    try {
      execSync(`which ${tool.command}`, { stdio: 'ignore' });
      return tool;
    } catch {
      // Tool not found, try next
    }
  }
  
  return null;
}

/**
 * Open external diff viewer for comparing before/after
 */
async function openDiffViewer(sourcePath, targetPath) {
  const diffTool = getDiffTool();
  
  if (!diffTool) {
    console.log(chalk.yellow('⚠ No diff tool found (code, meld, diffuse, kompare)'));
    console.log(chalk.gray(`  Source: ${sourcePath}`));
    console.log(chalk.gray(`  Target: ${targetPath}`));
    return;
  }
  
  console.log(chalk.cyan(`Opening ${diffTool.name} for diff...`));
  
  if (diffTool.command === 'code') {
    // VS Code diff syntax
    execSync(`code --diff "${sourcePath}" "${targetPath}"`, { stdio: 'inherit' });
  } else {
    // Generic diff tool syntax
    execSync(`${diffTool.command} "${sourcePath}" "${targetPath}"`, { stdio: 'inherit' });
  }
}

/**
 * Interactive file browser for reviewing migrated files
 */
export async function interactiveReview(templatesDir) {
  console.log(chalk.blue.bold('\n🔍 Manual Review\n'));
  console.log(chalk.gray('Review migrated templates before approval.\n'));
  
  const choices = [
    { name: 'View skills (28 files)', value: 'skills' },
    { name: 'View agents (13 files)', value: 'agents' },
    { name: 'View shared directory', value: 'shared' },
    { name: 'Open templates/ in file browser', value: 'browse' },
    { name: 'Continue to approval', value: 'done' }
  ];
  
  while (true) {
    const action = await select({
      message: 'What would you like to review?',
      choices
    });
    
    if (action === 'done') break;
    
    if (action === 'browse') {
      console.log(chalk.cyan('Opening templates/ directory...'));
      await open(templatesDir);
      continue;
    }
    
    if (action === 'skills') {
      const skillsDir = path.join(templatesDir, 'skills');
      const skills = await fs.readdir(skillsDir);
      const skillFiles = skills.filter(s => s.startsWith('gsd-'));
      
      const skill = await select({
        message: 'Select skill to review:',
        choices: [
          ...skillFiles.map(s => ({ name: s, value: s })),
          { name: '← Back', value: null }
        ]
      });
      
      if (skill) {
        const sourcePath = path.join(process.cwd(), '.github/skills', skill, 'SKILL.md');
        const targetPath = path.join(skillsDir, skill, 'SKILL.md');
        await openDiffViewer(sourcePath, targetPath);
      }
      continue;
    }
    
    if (action === 'agents') {
      const agentsDir = path.join(templatesDir, 'agents');
      const agents = await fs.readdir(agentsDir);
      const agentFiles = agents.filter(a => a.endsWith('.agent.md'));
      
      const agent = await select({
        message: 'Select agent to review:',
        choices: [
          ...agentFiles.map(a => ({ name: a, value: a })),
          { name: '← Back', value: null }
        ]
      });
      
      if (agent) {
        const sourcePath = path.join(process.cwd(), '.github/agents', agent);
        const targetPath = path.join(agentsDir, agent);
        await openDiffViewer(sourcePath, targetPath);
      }
      continue;
    }
    
    if (action === 'shared') {
      const sharedDir = path.join(templatesDir, 'get-shit-done');
      console.log(chalk.cyan('Opening shared directory...'));
      await open(sharedDir);
      continue;
    }
  }
}

/**
 * Explicit approval gate - user must type 'APPROVED'
 */
export async function requestApproval() {
  console.log(chalk.yellow.bold('\n⚠️  MANUAL APPROVAL REQUIRED\n'));
  console.log(chalk.gray('This is a ONE-TIME migration. Once approved:'));
  console.log(chalk.gray('  1. Migration code will be committed to git'));
  console.log(chalk.gray('  2. Migration code will be deleted from working tree'));
  console.log(chalk.gray('  3. templates/ becomes permanent source of truth'));
  console.log(chalk.gray('  4. No rollback possible\n'));
  
  const confirmation = await input({
    message: 'Type "APPROVED" to continue (or anything else to abort):',
  });
  
  if (confirmation.trim().toUpperCase() !== 'APPROVED') {
    console.log(chalk.red('\n❌ Migration aborted by user'));
    console.log(chalk.yellow('Cleaning up templates/ directory...'));
    return false;
  }
  
  console.log(chalk.green('\n✓ Migration approved!'));
  return true;
}
