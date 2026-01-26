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
import { generateSummary, interactiveReview, requestApproval } from './lib/interactive-review.js';

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
  
  // Generate migration summary
  console.log(generateSummary(skillsResult, agentsResult));
  
  // Show validation report
  console.log('\n' + validator.generateReport());
  
  // Block if errors exist
  if (validator.hasErrors()) {
    console.log(chalk.red('\n❌ Migration blocked - fix errors and retry'));
    
    // Clean up templates/ directory
    const templatesDir = path.join(process.cwd(), 'templates');
    await fs.remove(templatesDir);
    console.log(chalk.yellow('⚠ Cleaned up templates/ directory'));
    
    process.exit(1);
  }
  
  // Save migration report to phase directory
  const reportPath = path.join(
    process.cwd(), 
    '.planning/phases/01-template-migration/01-MIGRATION-REPORT.md'
  );
  
  const reportContent = `# Phase 1 Migration Report

**Generated:** ${new Date().toISOString()}
**Status:** ${validator.hasErrors() ? 'Failed' : 'Success'}

${generateSummary(skillsResult, agentsResult)}

## Validation Results

${validator.generateReport()}

## Files Created

### Skills (${skillsResult.total})
${skillsResult.results.map(r => `- ${r.skillName} → ${r.file}`).join('\n')}

### Agents (${agentsResult.total})
${agentsResult.results.map(r => `- ${r.agentName} → ${r.file}`).join('\n')}

### Shared Directory
- templates/get-shit-done/

## Next Steps

After approval:
1. Commit migration code to git
2. Delete migration code from working tree
3. Begin Phase 2 (installation foundation)
`;
  
  await fs.writeFile(reportPath, reportContent, 'utf-8');
  console.log(chalk.green(`\n✓ Migration report saved: ${reportPath}`));
  
  // Interactive review
  const templatesDir = path.join(process.cwd(), 'templates');
  await interactiveReview(templatesDir);
  
  // Request approval
  const approved = await requestApproval();
  
  if (!approved) {
    // Clean up templates/
    await fs.remove(templatesDir);
    process.exit(0);
  }
  
  console.log(chalk.green('\n✅ Phase 1 migration complete!'));
  console.log(chalk.cyan('\nNext steps:'));
  console.log(chalk.gray('  1. Run: git add scripts/ templates/ .planning/'));
  console.log(chalk.gray('  2. Run: git commit -m "feat(phase-1): complete template migration"'));
  console.log(chalk.gray('  3. Run: rm -rf scripts/migrate-to-templates.js scripts/lib/'));
  console.log(chalk.gray('  4. Run: git add -A && git commit -m "chore: remove migration code"'));
  console.log(chalk.gray('  5. Begin Phase 2 planning\n'));

}

main().catch(err => {
  console.error(chalk.red('✗ Migration failed:'), err);
  process.exit(1);
});
