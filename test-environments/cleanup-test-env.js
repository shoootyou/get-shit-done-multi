#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const platforms = ['copilot', 'claude', 'codex'];
const testRoot = path.join(__dirname);

function cleanup() {
  console.log('🧹 Cleaning up test environments...\n');
  
  for (const platform of platforms) {
    const platformDir = path.join(testRoot, `${platform}-test`);
    
    if (fs.existsSync(platformDir)) {
      console.log(`  🗑️  Removing ${platform}-test/...`);
      fs.rmSync(platformDir, { recursive: true, force: true });
      console.log(`  ✅ ${platform}-test removed`);
    } else {
      console.log(`  ⏭️  ${platform}-test doesn't exist, skipping`);
    }
  }
  
  console.log('\n✅ Cleanup complete!');
}

if (require.main === module) {
  cleanup();
}

module.exports = { cleanup };
