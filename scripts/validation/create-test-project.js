#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const platforms = ['copilot', 'claude', 'codex'];
const testRoot = path.join(__dirname, '..', 'test-environments');

async function createTestProject(platform) {
  console.log(`\n📦 Creating ${platform} test project...`);
  
  const projectDir = path.join(testRoot, `${platform}-test-project`);
  
  // Clean existing
  if (fs.existsSync(projectDir)) {
    console.log(`  🧹 Cleaning existing ${platform}-test-project/...`);
    fs.rmSync(projectDir, { recursive: true, force: true });
  }
  
  // Create directory
  fs.mkdirSync(projectDir, { recursive: true });
  
  // Create minimal package.json
  const packageJson = {
    name: `gsd-test-${platform}`,
    version: '1.0.0',
    private: true,
    description: `Test project for GSD ${platform} installation`,
    main: 'index.js',
    scripts: {},
    keywords: [],
    author: '',
    license: 'ISC'
  };
  
  fs.writeFileSync(
    path.join(projectDir, 'package.json'),
    JSON.stringify(packageJson, null, 2)
  );
  
  // Create .gitignore
  const gitignore = `node_modules/
.claude/
.github/
.codex/
*.log
`;
  fs.writeFileSync(path.join(projectDir, '.gitignore'), gitignore);
  
  // Create README
  const readme = `# GSD ${platform.toUpperCase()} Test Project

Minimal test project for validating GSD npm package installation.

## Test Flow

1. Install GSD: \`npm install <path-to-gsd-package>\`
2. Verify commands installed in platform-specific directory
3. Test command invocation and output
`;
  fs.writeFileSync(path.join(projectDir, 'README.md'), readme);
  
  console.log(`  ✅ ${platform} test project created at ${projectDir}`);
  
  return { platform, projectDir };
}

async function main() {
  console.log('🚀 Creating test projects for npm installation testing\n');
  console.log(`Test root: ${testRoot}\n`);
  
  const projects = [];
  
  for (const platform of platforms) {
    const result = await createTestProject(platform);
    projects.push(result);
  }
  
  console.log('\n✅ All test projects ready!');
  console.log('\nNext steps:');
  console.log('  1. Install GSD package: node scripts/test-npm-install.js');
  console.log('  2. Test commands: node scripts/test-platform-commands.js');
  
  return projects;
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  });
}

module.exports = { createTestProject };
