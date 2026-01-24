const prompts = require('prompts');
const { cyan, green, yellow, dim, reset } = require('../shared/colors');

async function confirmMigration(detectedStructures) {
  console.log(`  ${cyan}Old GSD detected:${reset}`);
  
  detectedStructures.forEach(structure => {
    const fileLabel = structure.fileCount === 1 ? 'file' : 'files';
    console.log(`  ${structure.platform}: ${structure.path} ${dim}(${structure.fileCount} ${fileLabel})${reset}`);
  });
  
  const today = new Date().toISOString().split('T')[0];
  console.log(`\n  ${dim}Creating backup at: .old-gsd-system/${today}/${reset}`);
  
  const response = await prompts({
    type: 'confirm',
    name: 'proceed',
    message: 'Backup old structure and migrate?',
    initial: true
  });
  
  return response.proceed;
}

module.exports = { confirmMigration };
