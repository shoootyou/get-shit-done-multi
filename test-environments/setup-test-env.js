#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platforms = ['copilot', 'claude', 'codex'];
const testRoot = path.join(__dirname);

async function setupEnvironment(platform) {
  console.log(`\n📦 Setting up ${platform} test environment...`);
  
  const platformDir = path.join(testRoot, `${platform}-test`);
  const repoDir = path.join(platformDir, 'get-shit-done');
  
  // Clean existing
  if (fs.existsSync(platformDir)) {
    console.log(`  🧹 Cleaning existing ${platform}-test/...`);
    fs.rmSync(platformDir, { recursive: true, force: true });
  }
  
  // Create directory
  fs.mkdirSync(platformDir, { recursive: true });
  
  // Clone repo (from parent directory)
  const parentRepo = path.resolve(__dirname, '..');
  console.log(`  🔄 Cloning repo to ${platform}-test/get-shit-done/...`);
  execSync(`git clone ${parentRepo} ${repoDir}`, {
    cwd: platformDir,
    stdio: 'inherit'
  });
  
  // Install dependencies
  console.log(`  📥 Installing dependencies in ${platform}-test/...`);
  execSync('npm install', {
    cwd: repoDir,
    stdio: 'inherit'
  });
  
  console.log(`  ✅ ${platform} environment ready`);
  
  return { platformDir, repoDir };
}

async function main() {
  console.log('🚀 Setting up multi-platform test environments\n');
  console.log(`Test root: ${testRoot}\n`);
  
  for (const platform of platforms) {
    await setupEnvironment(platform);
  }
  
  console.log('\n✅ All test environments ready!');
  console.log('\nNext steps:');
  console.log('  1. Run platform installation: node scripts/test-platform-install.js');
  console.log('  2. Test commands: node scripts/test-platform-commands.js');
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Setup failed:', err.message);
    process.exit(1);
  });
}

module.exports = { setupEnvironment };
