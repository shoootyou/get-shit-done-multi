import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const MANIFEST_FILE = '.gsd-install-manifest.json';

export async function findInstallations(scope, customPaths = [], verbose = false) {
  // Get standard paths for scope
  const standardPaths = getManifestPaths(scope);
  
  // Process custom paths - they need to be manifest paths, not just directories
  const processedCustomPaths = customPaths.map(p => {
    // If it's a directory path, add the manifest file name
    if (!p.endsWith(MANIFEST_FILE)) {
      return path.join(p, MANIFEST_FILE);
    }
    return p;
  });
  
  // Combine with standard paths
  const allPaths = [...standardPaths, ...processedCustomPaths];
  
  if (verbose) {
    console.log(`  Checking ${allPaths.length} paths...`);
  }
  
  // Check all paths in parallel (Promise.all safe for read-only)
  const checks = await Promise.all(
    allPaths.map(async (manifestPath) => {
      const exists = await fs.pathExists(manifestPath);
      if (!exists) {
        if (verbose) {
          console.log(`  ✗ Not found: ${manifestPath}`);
        }
        return null;
      }
      
      if (verbose) {
        console.log(`  ✓ Found: ${manifestPath}`);
      }
      
      return {
        path: manifestPath,
        scope: deriveScope(manifestPath, scope),
        platform: derivePlatform(manifestPath)
      };
    })
  );
  
  return checks.filter(c => c !== null);
}

function getManifestPaths(scope) {
  const homeDir = os.homedir();
  
  if (scope === 'global') {
    return [
      path.join(homeDir, '.claude', 'get-shit-done', MANIFEST_FILE),
      path.join(homeDir, '.copilot', 'get-shit-done', MANIFEST_FILE),
      path.join(homeDir, '.codex', 'get-shit-done', MANIFEST_FILE)
    ];
  } else {
    return [
      path.join(process.cwd(), '.claude', 'get-shit-done', MANIFEST_FILE),
      path.join(process.cwd(), '.github', 'get-shit-done', MANIFEST_FILE),
      path.join(process.cwd(), '.codex', 'get-shit-done', MANIFEST_FILE)
    ];
  }
}

function deriveScope(manifestPath, hintScope) {
  const homeDir = os.homedir();
  // If path starts with home directory, it's global
  if (manifestPath.startsWith(homeDir)) {
    return 'global';
  }
  // If we have a hint scope from the search, use it
  if (hintScope) {
    return hintScope;
  }
  // Otherwise assume local
  return 'local';
}

function derivePlatform(manifestPath) {
  // Extract platform from path structure
  // Example: ~/.claude/get-shit-done/... → 'claude'
  const parts = manifestPath.split(path.sep);
  const platformDirIndex = parts.findIndex(p => 
    p === '.claude' || p === '.copilot' || p === '.codex' || p === '.github'
  );
  
  if (platformDirIndex === -1) {
    // For custom paths where we can't derive platform from path,
    // we'll need to read the manifest to get the platform
    // Return a placeholder that will be resolved by reading the manifest
    return 'custom';
  }
  
  const platformDir = parts[platformDirIndex];
  // Map .github to copilot (local copilot uses .github)
  if (platformDir === '.github') return 'copilot';
  return platformDir.substring(1); // Remove leading dot
}
