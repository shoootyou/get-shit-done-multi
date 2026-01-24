// scripts/documentation/link-checker.js
const markdownLinkCheck = require('markdown-link-check');
const fs = require('fs-extra');
const path = require('path');
const chalk = require('chalk').default || require('chalk');
const fg = require('fast-glob');

async function checkLinksInFile(filePath) {
  const markdown = await fs.readFile(filePath, 'utf8');
  
  const options = {
    baseUrl: 'file://' + path.dirname(path.resolve(filePath)),
    showProgressBar: false,
    timeout: '10s',
    retryOn429: true,
    retryCount: 3,
    aliveStatusCodes: [200, 206, 999], // 999 = LinkedIn blocks scrapers
    ignorePatterns: [
      { pattern: '^https://github.com/.*/blob/main' }, // May not exist on branches
      { pattern: '^mailto:' }, // Skip email validation
      { pattern: '^#' }, // Skip anchor links (require custom validation)
      { pattern: '^https://www.npmjs.com' }, // npmjs returns 403 to scrapers
      { pattern: '^https://claude.ai' }, // Claude AI blocks scrapers
      { pattern: '^https://platform.openai.com' }, // OpenAI platform blocks scrapers
      { pattern: '^https://openai.com' }, // OpenAI blocks scrapers
      { pattern: '^https://codex.dev' }, // Codex dev site
      { pattern: '^https://github.com/.*/(releases|issues)' }, // GitHub releases/issues may 404 on forks
      { pattern: '^https://github.com/glittercowboy' }, // Old repo
      { pattern: '^https://docs.anthropic.com' } // Anthropic docs blocks scrapers
    ]
  };
  
  return new Promise((resolve) => {
    markdownLinkCheck(markdown, options, (err, results) => {
      if (err) {
        console.error(chalk.red(`✗ Error checking ${filePath}: ${err.message}`));
        resolve({ file: filePath, errors: [err.message], broken: [] });
        return;
      }
      
      const broken = results.filter(r => r.status === 'dead');
      const warnings = results.filter(r => r.status === 'error'); // DNS errors, timeouts
      
      if (broken.length > 0) {
        console.log(chalk.red(`\n✗ ${filePath} - ${broken.length} broken links:`));
        broken.forEach(link => {
          console.log(chalk.red(`  ${link.link}`));
          console.log(chalk.dim(`    ${link.statusCode} ${link.err || ''}`));
        });
      } else if (warnings.length > 0) {
        console.log(chalk.yellow(`\n⚠ ${filePath} - ${warnings.length} warnings:`));
        warnings.forEach(link => {
          console.log(chalk.yellow(`  ${link.link}`));
          console.log(chalk.dim(`    ${link.err || 'Timeout/DNS error'}`));
        });
      } else {
        console.log(chalk.green(`✓ ${filePath} - all links valid`));
      }
      
      resolve({
        file: filePath,
        total: results.length,
        broken: broken,
        warnings: warnings,
        passed: results.length - broken.length - warnings.length
      });
    });
  });
}

async function checkAllDocs() {
  console.log(chalk.cyan('\n🔍 Checking documentation links...\n'));
  
  // Find all markdown files
  const files = await fg([
    'docs/**/*.md',
    'README.md',
    'CHANGELOG.md',
    'specs/skills/**/*.md',
    '!node_modules/**',
    '!.git/**',
    '!**/node_modules/**'
  ]);
  
  console.log(`Found ${files.length} markdown files to check\n`);
  
  const results = [];
  for (const file of files) {
    const result = await checkLinksInFile(file);
    results.push(result);
  }
  
  // Summary
  const totalBroken = results.reduce((sum, r) => sum + r.broken.length, 0);
  const totalWarnings = results.reduce((sum, r) => sum + r.warnings.length, 0);
  const filesWithIssues = results.filter(r => r.broken.length > 0 || r.warnings.length > 0);
  
  console.log(chalk.cyan('\n📊 Summary:\n'));
  console.log(`  Files checked: ${results.length}`);
  console.log(`  Files with broken links: ${filesWithIssues.filter(f => f.broken.length > 0).length}`);
  console.log(`  Total broken links: ${totalBroken}`);
  console.log(`  Total warnings: ${totalWarnings}`);
  
  if (totalBroken > 0) {
    console.log(chalk.red('\n✗ Link checking failed\n'));
    process.exit(1);
  } else if (totalWarnings > 0) {
    console.log(chalk.yellow('\n⚠ Link checking passed with warnings\n'));
    process.exit(0);
  } else {
    console.log(chalk.green('\n✅ All links valid\n'));
    process.exit(0);
  }
}

// Run if called directly
if (require.main === module) {
  checkAllDocs().catch(err => {
    console.error(chalk.red(`Fatal error: ${err.message}`));
    process.exit(1);
  });
}

module.exports = { checkLinksInFile, checkAllDocs };
