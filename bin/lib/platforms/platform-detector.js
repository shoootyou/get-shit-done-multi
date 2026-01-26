import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { normalizeHomePath } from '../paths/path-resolver.js';

/**
 * Detect if GSD installation exists at a specific platform path
 * @param {string} platform - Platform name ('claude', 'copilot', 'codex')
 * @param {string} scope - Installation scope ('global' or 'local')
 * @returns {Promise<{exists: boolean, path: string, skillCount: number}>}
 */
export async function detectInstallation(platform, scope) {
  if (platform !== 'claude') {
    throw new Error(`Platform ${platform} not supported in Phase 1`);
  }
  
  const basePath = scope === 'global' 
    ? normalizeHomePath('~/.claude/skills/')
    : './.claude/skills/';
  
  if (!existsSync(basePath)) {
    return { exists: false, path: basePath, skillCount: 0 };
  }
  
  // Count gsd-* directories
  const entries = readdirSync(basePath, { withFileTypes: true });
  const gsdSkills = entries.filter(e => 
    e.isDirectory() && e.name.startsWith('gsd-')
  );
  
  return {
    exists: gsdSkills.length > 0,
    path: basePath,
    skillCount: gsdSkills.length
  };
}

/**
 * Detect all GSD installations (global and local)
 * @returns {Promise<Array<{exists: boolean, path: string, skillCount: number, scope: string, platform: string}>>}
 */
export async function detectAllInstallations() {
  const installations = [];
  
  // Check global
  const globalInstall = await detectInstallation('claude', 'global');
  if (globalInstall.exists) {
    installations.push({ ...globalInstall, scope: 'global', platform: 'claude' });
  }
  
  // Check local
  const localInstall = await detectInstallation('claude', 'local');
  if (localInstall.exists) {
    installations.push({ ...localInstall, scope: 'local', platform: 'claude' });
  }
  
  return installations;
}
