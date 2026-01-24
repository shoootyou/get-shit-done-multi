const prompts = require('prompts');
const chalk = require('chalk');

async function confirmMigration(detectedStructures) {
  console.log(chalk.yellow('\n⚠  Old GSD structure detected:\n'));
  
  detectedStructures.forEach(structure => {
    console.log(`  ${chalk.cyan(structure.platform)}: ${structure.path}`);
    console.log(`    Files: ${structure.fileCount}`);
  });
  
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n  Backup will be created at: ${chalk.green(`.old-gsd-system/${today}/`)}`);
  
  const response = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: 'Backup old structure and migrate to new skill-based system?',
    initial: true
  });
  
  return response.proceed;
}

module.exports = { confirmMigration };
