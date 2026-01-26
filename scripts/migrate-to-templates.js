#!/usr/bin/env node
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';

// Helper modules (to be created in this task)
import { parseFrontmatter, validateFrontmatter } from './lib/frontmatter-parser.js';
import { Validator } from './lib/validator.js';
import { injectTemplateVariables } from './lib/template-injector.js';
import { migrateAllSkills } from './lib/skill-migrator.js';
import { migrateAllAgents } from './lib/agent-migrator.js';

async function main() {
  console.log(chalk.blue.bold('🔄 Phase 1: ONE-TIME Template Migration\n'));
  
  const validator = new Validator();
  
  // Prepare directories
  const sourceSkillsDir = path.join(process.cwd(), '.github/skills');
  const targetSkillsDir = path.join(process.cwd(), 'templates/skills');
  
  // Clean templates/skills if exists (start fresh)
  if (await fs.pathExists(targetSkillsDir)) {
    console.log(chalk.yellow('⚠ Removing existing templates/skills directory'));
    await fs.remove(targetSkillsDir);
  }
  await fs.ensureDir(targetSkillsDir);
  
  // Migrate skills
  console.log(chalk.cyan('\n📝 Migrating skills...'));
  const skillsResult = await migrateAllSkills(sourceSkillsDir, targetSkillsDir, validator);
  
  console.log(chalk.green(`✓ Skills migrated: ${skillsResult.successful}/${skillsResult.total}`));
  if (skillsResult.failed > 0) {
    console.log(chalk.red(`✗ Skills failed: ${skillsResult.failed}`));
  }
  
  // Prepare agents directories
  const sourceAgentsDir = path.join(process.cwd(), '.github/agents');
  const targetAgentsDir = path.join(process.cwd(), 'templates/agents');
  
  // Clean templates/agents if exists (start fresh)
  if (await fs.pathExists(targetAgentsDir)) {
    console.log(chalk.yellow('⚠ Removing existing templates/agents directory'));
    await fs.remove(targetAgentsDir);
  }
  await fs.ensureDir(targetAgentsDir);
  
  // Migrate agents (pass skillsDir for skill reference scanning)
  console.log(chalk.cyan('\n🤖 Migrating agents...'));
  const agentsResult = await migrateAllAgents(
    sourceAgentsDir, 
    targetAgentsDir, 
    targetSkillsDir,
    validator
  );
  
  console.log(chalk.green(`✓ Agents migrated: ${agentsResult.successful}/${agentsResult.total}`));
  if (agentsResult.failed > 0) {
    console.log(chalk.red(`✗ Agents failed: ${agentsResult.failed}`));
  }
  console.log(chalk.gray(`  Consolidated versions.json: ${agentsResult.versionsPath}`));
  
  // Migrate shared directory
  console.log(chalk.cyan('\n📦 Copying shared directory...'));
  const sourceSharedDir = path.join(process.cwd(), 'get-shit-done');
  const targetSharedDir = path.join(process.cwd(), 'templates/get-shit-done');
  
  if (await fs.pathExists(targetSharedDir)) {
    await fs.remove(targetSharedDir);
  }
  
  await fs.copy(sourceSharedDir, targetSharedDir);
  
  // Inject template variables into manifest template
  const manifestPath = path.join(targetSharedDir, '.gsd-install-manifest.json');
  if (await fs.pathExists(manifestPath)) {
    let manifestContent = await fs.readFile(manifestPath, 'utf-8');
    manifestContent = injectTemplateVariables(manifestContent);
    await fs.writeFile(manifestPath, manifestContent, 'utf-8');
  }
  
  console.log(chalk.green(`✓ Shared directory copied to templates/get-shit-done/`));
  
  // TODO: Validation and manual review (Plan 04)
  
  // Show validation report
  console.log('\n' + validator.generateReport());
  
  if (validator.hasErrors()) {
    console.log(chalk.red('\n❌ Migration blocked - fix errors and retry'));
    process.exit(1);
  }
  
  console.log(chalk.green('\n✓ Migration foundation ready'));
}

main().catch(err => {
  console.error(chalk.red('✗ Migration failed:'), err);
  process.exit(1);
});
