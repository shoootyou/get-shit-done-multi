import fs from 'fs-extra';
import os from 'os';
import path from 'path';
import { getAllGlobalPaths, getAllLocalPaths, derivePlatformFromPath, MANIFEST_FILE } from '../platforms/platform-paths.js';

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
        platform: derivePlatformFromPath(manifestPath)
      };
    })
  );
  
  return checks.filter(c => c !== null);
}

function getManifestPaths(scope) {
  // If no scope is provided (for custom-path-only mode), return empty array
  if (!scope) {
    return [];
  }
  
  if (scope === 'global') {
    return getAllGlobalPaths();
  } else {
    return getAllLocalPaths();
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
