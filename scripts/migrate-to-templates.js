#!/usr/bin/env node
import path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';

// Helper modules (to be created in this task)
import { parseFrontmatter, validateFrontmatter } from './lib/frontmatter-parser.js';
import { Validator } from './lib/validator.js';
import { injectTemplateVariables } from './lib/template-injector.js';
import { migrateAllSkills } from './lib/skill-migrator.js';

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
  
  // TODO: Agents migration (Plan 03)
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
