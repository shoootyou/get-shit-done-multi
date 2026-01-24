#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platforms = [
  { name: 'copilot', installFlag: '--copilot', dir: '.github/skills' },
  { name: 'claude', installFlag: '--local', dir: '.claude/skills' },
  { name: 'codex', installFlag: '--codex', dir: '.codex/skills' }
];

async function testNpmInstall(platform) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`Testing ${platform.name} npm installation`);
  console.log('='.repeat(60));
  
  const projectDir = path.join(__dirname, '..', 'test-environments', `${platform.name}-test-project`);
  
  if (!fs.existsSync(projectDir)) {
    return {
      platform: platform.name,
      success: false,
      error: 'Test project not found. Run: node scripts/create-test-project.js'
    };
  }
  
  try {
    // Get path to current GSD package (parent directory of scripts/)
    const packagePath = path.resolve(__dirname, '..');
    
    console.log(`📦 Installing GSD package from: ${packagePath}`);
    console.log(`   Target project: ${projectDir}`);
    
    // Install GSD package into test project
    const installCmd = `npm install "${packagePath}"`;
    console.log(`   Command: ${installCmd}\n`);
    
    const installOutput = execSync(installCmd, {
      cwd: projectDir,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(installOutput);
    
    // Run GSD installation script within the test project
    console.log(`\n🔧 Running GSD install ${platform.installFlag}...`);
    
    const gsdInstallCmd = `node node_modules/get-shit-done-multi/bin/install.js ${platform.installFlag}`;
    const gsdOutput = execSync(gsdInstallCmd, {
      cwd: projectDir,
      encoding: 'utf8',
      stdio: 'pipe'
    });
    
    console.log(gsdOutput);
    
    // Verify installation
    const result = verifyInstallation(platform, projectDir);
    
    if (result.success) {
      console.log(`✅ ${platform.name}: ${result.skillsGenerated}/28 commands installed`);
    } else {
      console.log(`❌ ${platform.name}: Installation verification failed`);
      result.errors.forEach(err => console.log(`   - ${err}`));
    }
    
    return {
      platform: platform.name,
      success: result.success,
      skillsGenerated: result.skillsGenerated,
      errors: result.errors,
      projectDir
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

function verifyInstallation(platform, projectDir) {
  const skillsDir = path.join(projectDir, platform.dir);
  
  if (!fs.existsSync(skillsDir)) {
    return {
      success: false,
      skillsGenerated: 0,
      errors: [`Skills directory not found: ${platform.dir}`]
    };
  }
  
  // Skills are directories in the skills folder
  const skills = fs.readdirSync(skillsDir).filter(f => {
    const fullPath = path.join(skillsDir, f);
    return fs.statSync(fullPath).isDirectory() && f.startsWith('gsd-');
  });
  
  const expectedCount = 28; // Updated from installer output
  const success = skills.length === expectedCount;
  const errors = [];
  
  if (skills.length < expectedCount) {
    errors.push(`Expected ${expectedCount} commands, found ${skills.length}`);
  }
  
  return {
    success,
    skillsGenerated: skills.length,
    installedCommands: skills,
    errors
  };
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 Testing npm package installation workflow\n');
  console.log('Testing order: Copilot → Claude → Codex\n');
  
  const results = [];
  
  for (const platform of platforms) {
    const result = await testNpmInstall(platform);
    results.push(result);
    
    if (platform !== platforms[platforms.length - 1]) {
      await sleep(2000);
    }
  }
  
  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('NPM Installation Test Summary');
  console.log('='.repeat(60));
  
  let totalSuccess = 0;
  let totalInstalled = 0;
  
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    const skills = result.skillsGenerated || 0;
    console.log(`${status} ${result.platform}: ${skills}/28 commands`);
    
    if (result.success) {
      totalSuccess++;
      totalInstalled += skills;
    }
  }
  
  console.log('\n' + '='.repeat(60));
  console.log(`Overall: ${totalSuccess}/3 platforms successful`);
  console.log(`Total commands installed: ${totalInstalled}/84`);
  console.log('='.repeat(60));
  
  // Write results
  const resultsPath = path.join(__dirname, '..', 'test-environments', 'install-results.json');
  fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n📄 Results: test-environments/install-results.json`);
  
  if (totalSuccess < 3) {
    console.error('\n❌ Installation testing failed');
    process.exit(1);
  }
  
  console.log('\n✅ All platforms successful!');
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Test failed:', err.message);
    process.exit(1);
  });
}

module.exports = { testNpmInstall, verifyInstallation };
