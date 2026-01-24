// scripts/audit/script-analyzer.js
const fs = require('fs-extra');
const path = require('path');
const fg = require('fast-glob');

/**
 * Find what a script INVOKES (its dependencies)
 */
function findInvocations(content, filename) {
  const invocations = [];
  
  // require() calls in JS
  const requires = content.matchAll(/require\(['"](\.\.?\/[^'"]+)['"]\)/g);
  for (const match of requires) {
    invocations.push(match[1]);
  }
  
  // import statements in JS
  const imports = content.matchAll(/import .+ from ['"](\.\.?\/[^'"]+)['"]/g);
  for (const match of imports) {
    invocations.push(match[1]);
  }
  
  // Shell script sourcing
  if (filename.endsWith('.sh')) {
    const sources = content.matchAll(/(?:source|\.)\s+([^\s;]+)/g);
    for (const match of sources) {
      if (!match[1].startsWith('$')) { // Skip variables
        invocations.push(match[1]);
      }
    }
  }
  
  // Executable calls (node, bash, python, etc.)
  const execs = content.matchAll(/(?:node|bash|sh|python3?)\s+([^\s;'"]+)/g);
  for (const match of execs) {
    if (match[1].includes('/') || match[1].includes('.')) {
      invocations.push(match[1]);
    }
  }
  
  return [...new Set(invocations)]; // dedupe
}

/**
 * Analyze script usage across codebase
 * Per CONTEXT.md essential criteria:
 * - Used in package.json scripts, OR
 * - Called by install.js or core functionality, OR
 * - Referenced in documentation as user-facing tool, OR
 * - Part of CI/CD workflow
 */
async function analyzeScript(filePath) {
  const stat = await fs.stat(filePath);
  const content = await fs.readFile(filePath, 'utf8');
  const filename = path.basename(filePath);
  const relativePath = path.relative(process.cwd(), filePath);
  
  const usage = [];
  
  // 1. In package.json scripts?
  const pkgJson = await fs.readJson('package.json').catch(() => ({}));
  const inPackageScripts = Object.entries(pkgJson.scripts || {})
    .filter(([name, script]) => script.includes(filename) || script.includes(relativePath))
    .map(([name]) => name);
  
  if (inPackageScripts.length) {
    usage.push(`package.json: ${inPackageScripts.join(', ')}`);
  }
  
  // 2. Called by install.js or core files?
  const coreFiles = [
    'bin/install.js',
    'bin/gsd-cli.js',
    'lib-ghcc/state-integration.js',
    'bin/lib/command-system/executor.js'
  ];
  
  const callers = [];
  for (const coreFile of coreFiles) {
    if (!await fs.pathExists(coreFile)) continue;
    
    const coreContent = await fs.readFile(coreFile, 'utf8');
    if (coreContent.includes(filename) || coreContent.includes(relativePath)) {
      callers.push(path.basename(coreFile));
    }
  }
  
  if (callers.length) {
    usage.push(`called by: ${callers.join(', ')}`);
  }
  
  // 3. Referenced in docs?
  const docFiles = await fg(['docs/**/*.md', 'README.md', 'specs/**/*.md']);
  const referencedInDocs = [];
  
  for (const docFile of docFiles) {
    const docContent = await fs.readFile(docFile, 'utf8');
    if (docContent.includes(filename) || docContent.includes(relativePath)) {
      referencedInDocs.push(path.basename(docFile));
    }
  }
  
  if (referencedInDocs.length) {
    usage.push(`docs: ${referencedInDocs.slice(0, 3).join(', ')}${referencedInDocs.length > 3 ? '...' : ''}`);
  }
  
  // 4. In GitHub workflows?
  const workflowFiles = await fg(['.github/workflows/**/*.yml']).catch(() => []);
  const inWorkflows = [];
  
  for (const workflowFile of workflowFiles) {
    const workflowContent = await fs.readFile(workflowFile, 'utf8');
    if (workflowContent.includes(filename) || workflowContent.includes(relativePath)) {
      inWorkflows.push(path.basename(workflowFile));
    }
  }
  
  if (inWorkflows.length) {
    usage.push(`CI: ${inWorkflows.join(', ')}`);
  }
  
  // NEW: Find what this script invokes
  const invocations = findInvocations(content, filename);
  
  return {
    path: filePath,
    relativePath,
    filename,
    purpose: inferPurpose(content, filename),
    lastModified: stat.mtime.toISOString().split('T')[0],
    size: formatBytes(stat.size),
    usage: usage.length ? usage : ['Not detected'],
    invocations: invocations.length ? invocations : ['None detected'],
    essential: usage.length > 0 // Used = essential
  };
}

function inferPurpose(content, filename) {
  // 1. Extract first comment block (most descriptive)
  const commentMatch = 
    content.match(/^\/\/\s*(.+)$/m) ||          // JS single-line
    content.match(/^#\s*(.+)$/m) ||              // Shell/Python comment
    content.match(/\/\*\*\s*\n\s*\*\s*(.+)/);    // JSDoc
  
  if (commentMatch) {
    return commentMatch[1].trim();
  }
  
  // 2. Look for descriptive function names or exported functionality
  const functionMatch = content.match(/(?:function|const|async function)\s+(\w+)/);
  if (functionMatch) {
    return `Exports: ${functionMatch[1]}()`;
  }
  
  // 3. Infer from filename patterns
  if (filename.includes('test')) return 'Testing/validation';
  if (filename.includes('doc')) return 'Documentation generation';
  if (filename.includes('migration')) return 'Migration/upgrade utility';
  if (filename.includes('cleanup')) return 'Cleanup/maintenance';
  if (filename.includes('install')) return 'Installation';
  if (filename.includes('analyzer')) return 'Analysis tool';
  if (filename.includes('checker')) return 'Validation/checking';
  
  return 'Unknown (no header comment found)';
}

function formatBytes(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

async function analyzeAllScripts() {
  // Find all script files (excluding core system and node_modules)
  const scriptFiles = await fg([
    'scripts/**/*.js',
    'scripts/**/*.sh',
    '*.js',
    '!bin/**',           // Core system - don't audit
    '!lib-ghcc/**',      // Core system - don't audit
    '!node_modules/**',
    '!.git/**'
  ]);
  
  const results = [];
  for (const file of scriptFiles) {
    const analysis = await analyzeScript(file);
    results.push(analysis);
  }
  
  return results;
}

module.exports = { analyzeScript, analyzeAllScripts };
