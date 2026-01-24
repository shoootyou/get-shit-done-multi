const { gitMv } = require('../shared/git-operations');
const path = require('path');
const fs = require('fs-extra');

async function renameDocsToLowercase() {
  const docsDir = path.join(process.cwd(), 'docs');
  const files = await fs.readdir(docsDir);
  
  const renamed = [];
  
  for (const file of files) {
    if (!file.endsWith('.md')) continue;
    
    const lowercase = file.toLowerCase();
    if (file !== lowercase) {
      const oldPath = path.join(docsDir, file);
      const newPath = path.join(docsDir, lowercase);
      
      console.log(`Renaming: ${file} → ${lowercase}`);
      const result = await gitMv(oldPath, newPath);
      
      renamed.push({ old: file, new: lowercase, ...result });
    }
  }
  
  return renamed;
}

renameDocsToLowercase().then(results => {
  console.log(`\nRenamed ${results.length} files`);
  results.forEach(r => {
    const method = r.method === 'git' ? '✓' : '⚠';
    console.log(`${method} ${r.new}`);
  });
}).catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
