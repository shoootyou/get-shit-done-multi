// bin/lib/version/old-version-detector.js

import { pathExists, readFile } from '../io/file-operations.js';
import { resolve, join } from 'path';
import fs from 'fs-extra';

/**
 * Detect old v1.x installation for a specific platform
 * @param {string} platform - Platform name (claude, copilot, codex)
 * @param {string} targetDir - Directory to check (default: '.')
 * @param {Object} options - Detection options
 * @returns {Promise<{isOld: boolean, version: string | null, paths: string[]}>}
 */
export async function detectOldVersion(platform, targetDir = '.', options = {}) {
  try {
    const resolvedDir = resolve(targetDir);
    let isOld = false;
    
    // Platform-specific detection logic
    if (platform === 'claude') {
      // Check for VERSION file
      const versionPath = join(resolvedDir, '.claude/get-shit-done/VERSION');
      const versionExists = await pathExists(versionPath);
      
      if (versionExists) {
        // Check for either commands/gsd directory OR hooks/gsd-check-update.js
        const commandsPath = join(resolvedDir, '.claude/commands/gsd');
        const hooksPath = join(resolvedDir, '.claude/hooks/gsd-check-update.js');
        
        const commandsExists = await pathExists(commandsPath);
        const hooksExists = await pathExists(hooksPath);
        
        isOld = commandsExists || hooksExists;
      }
    } else if (platform === 'copilot') {
      // Check for SKILL.md AND VERSION in skills directory
      const skillPath = join(resolvedDir, '.github/skills/get-shit-done/SKILL.md');
      const versionPath = join(resolvedDir, '.github/skills/get-shit-done/VERSION');
      
      const skillExists = await pathExists(skillPath);
      const versionExists = await pathExists(versionPath);
      
      isOld = skillExists && versionExists;
    } else if (platform === 'codex') {
      // Check for SKILL.md AND VERSION in skills directory
      const skillPath = join(resolvedDir, '.codex/skills/get-shit-done/SKILL.md');
      const versionPath = join(resolvedDir, '.codex/skills/get-shit-done/VERSION');
      
      const skillExists = await pathExists(skillPath);
      const versionExists = await pathExists(versionPath);
      
      isOld = skillExists && versionExists;
    }
    
    // If old version detected, read version and get paths
    if (isOld) {
      const version = await readOldVersion(platform, resolvedDir);
      const paths = await getOldInstallationPaths(platform, resolvedDir);
      return { isOld: true, version, paths };
    }
    
    return { isOld: false, version: null, paths: [] };
  } catch (error) {
    // Don't throw - detection failures should not block installation
    return { isOld: false, version: null, paths: [] };
  }
}

/**
 * Read version string from old VERSION file
 * @param {string} platform - Platform name (claude, copilot, codex)
 * @param {string} targetDir - Directory to check
 * @returns {Promise<string>} Version string (e.g., "1.8.0")
 */
export async function readOldVersion(platform, targetDir = '.') {
  const resolvedDir = resolve(targetDir);
  let versionPath;
  
  if (platform === 'claude') {
    versionPath = join(resolvedDir, '.claude/get-shit-done/VERSION');
  } else if (platform === 'copilot') {
    versionPath = join(resolvedDir, '.github/skills/get-shit-done/VERSION');
  } else if (platform === 'codex') {
    versionPath = join(resolvedDir, '.codex/skills/get-shit-done/VERSION');
  }
  
  const content = await readFile(versionPath);
  return content.trim();
}

/**
 * Get all old installation paths to include in backup
 * @param {string} platform - Platform name (claude, copilot, codex)
 * @param {string} targetDir - Directory to check
 * @returns {Promise<string[]>} Array of existing paths
 */
export async function getOldInstallationPaths(platform, targetDir = '.') {
  const resolvedDir = resolve(targetDir);
  const paths = [];
  
  try {
    if (platform === 'claude') {
      // Static paths
      const staticPaths = [
        '.claude/commands/gsd',
        '.claude/hooks/gsd-check-update.js',
        '.claude/hooks/pre-commit-docs',
        '.claude/hooks/statusline.js',
        '.claude/get-shit-done',
        '.claude/settings.json'
      ];
      
      // Check static paths
      for (const relativePath of staticPaths) {
        const fullPath = join(resolvedDir, relativePath);
        if (await pathExists(fullPath)) {
          paths.push(relativePath);
        }
      }
      
      // Find agent files: .claude/agents/gsd-*.md (NOT .agent.md)
      const agentsDir = join(resolvedDir, '.claude/agents');
      if (await pathExists(agentsDir)) {
        const entries = await fs.readdir(agentsDir);
        for (const entry of entries) {
          if (entry.startsWith('gsd-') && entry.endsWith('.md') && !entry.endsWith('.agent.md')) {
            paths.push(join('.claude/agents', entry));
          }
        }
      }
    } else if (platform === 'copilot') {
      // Static paths
      const staticPaths = [
        '.github/skills/get-shit-done',
        '.github/copilot-instructions.md'
      ];
      
      // Check static paths
      for (const relativePath of staticPaths) {
        const fullPath = join(resolvedDir, relativePath);
        if (await pathExists(fullPath)) {
          paths.push(relativePath);
        }
      }
      
      // Find agent files: .github/agents/gsd-*.agent.md
      const agentsDir = join(resolvedDir, '.github/agents');
      if (await pathExists(agentsDir)) {
        const entries = await fs.readdir(agentsDir);
        for (const entry of entries) {
          if (entry.startsWith('gsd-') && entry.endsWith('.agent.md')) {
            paths.push(join('.github/agents', entry));
          }
        }
      }
      
      // Find issue template files: .github/ISSUE_TEMPLATE/gsd-*.yml
      const issueTemplateDir = join(resolvedDir, '.github/ISSUE_TEMPLATE');
      if (await pathExists(issueTemplateDir)) {
        const entries = await fs.readdir(issueTemplateDir);
        for (const entry of entries) {
          if (entry.startsWith('gsd-') && entry.endsWith('.yml')) {
            paths.push(join('.github/ISSUE_TEMPLATE', entry));
          }
        }
      }
    } else if (platform === 'codex') {
      // Static paths
      const staticPaths = [
        '.codex/skills/get-shit-done'
      ];
      
      // Check static paths
      for (const relativePath of staticPaths) {
        const fullPath = join(resolvedDir, relativePath);
        if (await pathExists(fullPath)) {
          paths.push(relativePath);
        }
      }
      
      // Find agent files: .codex/agents/gsd-*.agent.md
      const agentsDir = join(resolvedDir, '.codex/agents');
      if (await pathExists(agentsDir)) {
        const entries = await fs.readdir(agentsDir);
        for (const entry of entries) {
          if (entry.startsWith('gsd-') && entry.endsWith('.agent.md')) {
            paths.push(join('.codex/agents', entry));
          }
        }
      }
    }
    
    return paths;
  } catch (error) {
    // Return empty array on errors
    return [];
  }
}

/**
 * Detect all old versions across all platforms in target directory
 * @param {string} targetDir - Directory to check (default: '.')
 * @returns {Promise<Array<{platform: string, scope: string, version: string, paths: string[]}>>}
 */
export async function detectAllOldVersions(targetDir = '.') {
  const results = [];
  const platforms = ['claude', 'copilot', 'codex'];
  
  // Determine scope based on target directory
  const resolvedDir = resolve(targetDir);
  const homeDir = require('os').homedir();
  const scope = resolvedDir === homeDir ? 'global' : 'local';
  
  for (const platform of platforms) {
    const detection = await detectOldVersion(platform, targetDir);
    if (detection.isOld) {
      results.push({
        platform,
        scope,
        version: detection.version,
        paths: detection.paths
      });
    }
  }
  
  return results;
}
