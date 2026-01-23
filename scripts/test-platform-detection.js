#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

async function testPlatformDetection() {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Testing Platform Detection & Fallbacks');
  console.log('='.repeat(60));
  
  const testDir = path.join(__dirname, '..', 'test-environments', 'detection-test');
  
  // Create test environment without platform directories
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
  }
  fs.mkdirSync(testDir, { recursive: true });
  
  // Copy repo to test dir
  const parentRepo = path.resolve(__dirname, '..');
  console.log('\n📦 Setting up detection test environment...');
  execSync(`git clone ${parentRepo} ${path.join(testDir, 'get-shit-done')}`, {
    stdio: 'pipe'
  });
  
  const repoDir = path.join(testDir, 'get-shit-done');
  
  console.log('\n🧪 Test 1: Platform detection when no platform available');
  
  try {
    // Run install without specifying platform
    const output = execSync('npm run install 2>&1 || true', {
      cwd: repoDir,
      encoding: 'utf8'
    });
    
    console.log(output);
    
    // Should gracefully handle absence of platform
    if (output.includes('No platform detected') || output.includes('Platform not available') || output.includes('Defaulting to')) {
      console.log('✅ Graceful fallback message detected');
    } else {
      console.log('⚠️  No explicit fallback message (may still work)');
    }
    
  } catch (error) {
    console.log('⚠️  Installation without platform:', error.message);
  }
  
  console.log('\n🧪 Test 2: Install --all flag (parallel installation)');
  
  try {
    const startTime = Date.now();
    const output = execSync('npm run install -- --all 2>&1', {
      cwd: repoDir,
      encoding: 'utf8',
      timeout: 120000 // 2 minutes
    });
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log(output);
    console.log(`\n⏱️  Completed in ${duration}s`);
    
    // Verify all 3 platforms installed
    const platformDirs = [
      '.github/copilot/skills',
      '.claude/get-shit-done',
      '.codex/skills'
    ];
    
    let allInstalled = true;
    for (const dir of platformDirs) {
      const fullPath = path.join(repoDir, dir);
      if (fs.existsSync(fullPath)) {
        const skills = fs.readdirSync(fullPath).filter(f => f.startsWith('gsd-'));
        console.log(`✅ ${dir}: ${skills.length} commands`);
      } else {
        console.log(`❌ ${dir}: not found`);
        allInstalled = false;
      }
    }
    
    if (allInstalled) {
      console.log('\n✅ --all flag successfully installed all platforms');
    } else {
      console.log('\n❌ --all flag did not install all platforms');
    }
    
  } catch (error) {
    console.log('❌ --all flag test failed:', error.message);
  }
  
  console.log('\n🧪 Test 3: Legacy fallback when spec missing');
  
  // Rename a spec to test fallback
  const testSpecDir = path.join(repoDir, 'specs', 'skills', 'gsd-help');
  const backupDir = path.join(repoDir, 'specs', 'skills', 'gsd-help.backup');
  
  try {
    if (fs.existsSync(testSpecDir)) {
      fs.renameSync(testSpecDir, backupDir);
      console.log('  Temporarily removed gsd-help spec');
    }
    
    // Try to run installation
    const output = execSync('npm run install:claude 2>&1 || true', {
      cwd: repoDir,
      encoding: 'utf8'
    });
    
    // Should fallback to legacy command or skip gracefully
    if (output.includes('fallback') || output.includes('legacy') || output.includes('skipping')) {
      console.log('✅ Legacy fallback detected');
    } else if (output.includes('Error') || output.includes('Failed')) {
      console.log('❌ Installation failed instead of falling back');
    } else {
      console.log('⚠️  Unclear behavior - check output');
    }
    
    console.log(output.substring(0, 500)); // First 500 chars
    
  } catch (error) {
    console.log('⚠️  Legacy fallback test:', error.message);
  } finally {
    // Restore spec
    if (fs.existsSync(backupDir)) {
      fs.renameSync(backupDir, testSpecDir);
      console.log('  Restored gsd-help spec');
    }
  }
  
  // Cleanup
  fs.rmSync(testDir, { recursive: true, force: true });
  console.log('\n🧹 Test environment cleaned up');
}

async function main() {
  console.log('🔍 Platform Detection & Legacy Fallback Tests\n');
  
  await testPlatformDetection();
  
  console.log('\n' + '='.repeat(60));
  console.log('Platform Detection Tests Complete');
  console.log('='.repeat(60));
  console.log('\nNote: These tests verify graceful degradation and fallback behavior.');
  console.log('Review output above to confirm expected behavior.');
}

if (require.main === module) {
  main().catch(err => {
    console.error('❌ Test error:', err);
    process.exit(1);
  });
}

module.exports = { testPlatformDetection };
