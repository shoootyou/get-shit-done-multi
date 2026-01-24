#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platforms = [
  { name: 'copilot', cmd: 'npm run install:copilot' },
  { name: 'claude', cmd: 'npm run install:claude' },
  { name: 'codex', cmd: 'npm run install:codex' }
];

async function testPlatformInstall(platform) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${platform.name} installation`);
  console.log('='.repeat(60));
  
  const testDir = path.join(__dirname, '..', 'test-environments', `${platform.name}-test`, 'get-shit-done');
  
  if (!fs.existsSync(testDir)) {
    return {
      platform: platform.name,
      success: false,
      error: 'Test environment not found. Run: node test-environments/setup-test-env.js'
    };
  }
  
  try {
    console.log(`📦 Installing in ${platform.name}-test/get-shit-done...`);
    
    const output = execSync(platform.cmd, {
      cwd: testDir,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(output);
    
    // Verify installation
    const result = verifyInstallation(platform.name, testDir);
    
    if (result.success) {
      console.log(`✅ ${platform.name}: ${result.skillsGenerated} commands installed`);
    } else {
      console.log(`❌ ${platform.name}: Installation failed`);
      console.log(`   Errors: ${result.errors.join(', ')}`);
    }
    
    return {
      platform: platform.name,
      success: result.success,
      skillsGenerated: result.skillsGenerated,
      errors: result.errors
    };
    
  } catch (error) {
    console.log(`❌ ${platform.name}: Installation threw error`);
    console.log(`   ${error.message}`);
    
    return {
      platform: platform.name,
      success: false,
      error: error.message
    };
  }
}

function verifyInstallation(platform, testDir) {
  const platformPaths = {
    copilot: '.github/skills',
    claude: '.claude/skills',
    codex: '.codex/skills'
  };
  
  const skillsDir = path.join(testDir, platformPaths[platform]);
  
  if (!fs.existsSync(skillsDir)) {
    return {
      success: false,
      skillsGenerated: 0,
      errors: [`Skills directory not found: ${platformPaths[platform]}`]
    };
  }
  
  const skills = fs.readdirSync(skillsDir).filter(f => {
    const fullPath = path.join(skillsDir, f);
    return fs.statSync(fullPath).isDirectory() && f.startsWith('gsd-');
  });
  const expectedCount = 28; // Total GSD commands
  
  const success = skills.length === expectedCount;
  const errors = [];
  
  if (skills.length < expectedCount) {
    errors.push(`Expected ${expectedCount} commands, found ${skills.length}`);
  }
  
  return {
    success,
    skillsGenerated: skills.length,
    errors
  };
}

async function main() {
  console.log('🚀 Testing platform installations\n');
  console.log('Testing order: Copilot → Claude → Codex\n');
  
  const results = [];
  
  for (const platform of platforms) {
    const result = await testPlatformInstall(platform);
    results.push(result);
    
    // Pause between platforms
    if (platform !== platforms[platforms.length - 1]) {
      console.log('\n⏸️  Pausing 2 seconds before next platform...\n');
      await sleep(2000);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Installation Test Summary');
  console.log('='.repeat(60));
  
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    const skills = result.skillsGenerated || 0;
    console.log(`${status} ${result.platform}: ${skills}/28 commands`);
    
    if (!result.success && result.error) {
      console.log(`   Error: ${result.error}`);
    }
    if (!result.success && result.errors) {
      result.errors.forEach(err => console.log(`   - ${err}`));
    }
  }
  
  // Write results
  const resultsPath = path.join(__dirname, '..', 'test-environments', 'install-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results written to: test-environments/install-results.json`);
  
  // Exit code
  const allSuccess = results.every(r => r.success);
  if (!allSuccess) {
    console.log('\n❌ Some installations failed');
    process.exit(1);
  }
  
  console.log('\n✅ All installations successful!');
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Test script error:', err);
    process.exit(1);
  });
}

module.exports = { testPlatformInstall, verifyInstallation };
