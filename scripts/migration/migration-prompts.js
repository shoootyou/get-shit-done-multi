const prompts = require('prompts');
const { cyan, green, yellow, dim, reset } = require('../shared/colors');

async function confirmMigration(detectedStructures) {
  console.log(`\n  ${yellow}⚠${reset}  Old GSD structure detected:\n`);
  
  detectedStructures.forEach(structure => {
    console.log(`  ${cyan}${structure.platform}:${reset} ${structure.path}`);
    console.log(`  ${dim}Files: ${structure.fileCount}${reset}`);
  });
  
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n  Backup will be created at: ${dim}.old-gsd-system/${today}/${reset}`);
  
  const response = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: 'Backup old structure and migrate to new skill-based system?',
    initial: true
  });
  
  return response.proceed;
}

module.exports = { confirmMigration };
