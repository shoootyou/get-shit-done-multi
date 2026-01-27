import fs from 'fs-extra';
import os from 'os';
import path from 'path';

const MANIFEST_FILE = '.gsd-install-manifest.json';

export async function findInstallations(scope, customPaths = []) {
  // Get standard paths for scope
  const standardPaths = getManifestPaths(scope);
  
  // Combine with custom paths
  const allPaths = [...standardPaths, ...customPaths];
  
  // Check all paths in parallel (Promise.all safe for read-only)
  const checks = await Promise.all(
    allPaths.map(async (manifestPath) => {
      const exists = await fs.pathExists(manifestPath);
      if (!exists) return null;
      
      return {
        path: manifestPath,
        scope: deriveScope(manifestPath),
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

function deriveScope(manifestPath) {
  const homeDir = os.homedir();
  return manifestPath.startsWith(homeDir) ? 'global' : 'local';
}

function derivePlatform(manifestPath) {
  // Extract platform from path structure
  // Example: ~/.claude/get-shit-done/... → 'claude'
  const parts = manifestPath.split(path.sep);
  const platformDirIndex = parts.findIndex(p => 
    p === '.claude' || p === '.copilot' || p === '.codex' || p === '.github'
  );
  
  if (platformDirIndex === -1) return 'unknown';
  
  const platformDir = parts[platformDirIndex];
  // Map .github to copilot (local copilot uses .github)
  if (platformDir === '.github') return 'copilot';
  return platformDir.substring(1); // Remove leading dot
}
