import fs from 'fs-extra';
import path from 'path';
import { SHARED_DIR } from '../platforms/platform-paths.js';

/**
 * Priority order for version detection
 * Higher priority sources are checked first
 */
const VERSION_SOURCE_PRIORITY = {
  META_SKILL: 3,      // skills/get-shit-done/version.json
  AGENTS: 2,          // agents/versions.json
  INDIVIDUAL_SKILL: 1 // skills/gsd-*/version.json
};

/**
 * Detect GSD version from installation directory
 * Checks multiple version file locations following platform structure
 * 
 * @param {string} installDir - Installation directory path (e.g., .claude/get-shit-done)
 * @param {string} platform - Platform ID (claude, copilot, codex) - optional for better logging
 * @returns {Promise<{version: string, source: string}>} Version and source file
 */
export async function detectVersionFromDirectory(installDir, platform = 'unknown') {
  try {
    // Collect all potential version file paths
    const versionCandidates = await findVersionFiles(installDir);
    
    if (versionCandidates.length === 0) {
      return { version: 'unknown', source: 'none' };
    }
    
    // Read all version files in parallel
    const versionData = await Promise.all(
      versionCandidates.map(async (candidate) => {
        try {
          const data = await fs.readJson(candidate.path);
          return {
            ...candidate,
            data,
            version: extractVersion(data, candidate.type)
          };
        } catch (error) {
          return null; // Skip invalid JSON files
        }
      })
    );
    
    // Filter out failed reads
    const validVersions = versionData.filter(v => v !== null && v.version);
    
    if (validVersions.length === 0) {
      return { version: 'unknown', source: 'none' };
    }
    
    // Sort by priority (highest first)
    validVersions.sort((a, b) => b.priority - a.priority);
    
    // Return highest priority version
    const best = validVersions[0];
    return {
      version: best.version,
      source: path.relative(installDir, best.path)
    };
    
  } catch (error) {
    return { version: 'unknown', source: 'error', error: error.message };
  }
}

/**
 * Find all version files in installation directory
 * @param {string} installDir - Installation directory
 * @returns {Promise<Array<{path: string, type: string, priority: number}>>}
 */
async function findVersionFiles(installDir) {
  const candidates = [];
  
  // 1. Check meta-skill: skills/get-shit-done/version.json
  const metaSkillPaths = [
    path.join(installDir, 'skills', 'get-shit-done', 'version.json'),
    path.join(installDir, 'skills', 'get-shit-done', 'claude', 'version.json'),
    path.join(installDir, 'skills', 'get-shit-done', 'copilot', 'version.json'),
    path.join(installDir, 'skills', 'get-shit-done', 'codex', 'version.json')
  ];
  
  for (const metaPath of metaSkillPaths) {
    if (await fs.pathExists(metaPath)) {
      candidates.push({
        path: metaPath,
        type: 'META_SKILL',
        priority: VERSION_SOURCE_PRIORITY.META_SKILL
      });
    }
  }
  
  // 2. Check agents/versions.json
  const agentsPath = path.join(installDir, 'agents', 'versions.json');
  if (await fs.pathExists(agentsPath)) {
    candidates.push({
      path: agentsPath,
      type: 'AGENTS',
      priority: VERSION_SOURCE_PRIORITY.AGENTS
    });
  }
  
  // 3. Check individual skills: skills/gsd-*/version.json
  try {
    const skillsDir = path.join(installDir, 'skills');
    if (await fs.pathExists(skillsDir)) {
      const entries = await fs.readdir(skillsDir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory() && entry.name.startsWith('gsd-')) {
          const versionPath = path.join(skillsDir, entry.name, 'version.json');
          if (await fs.pathExists(versionPath)) {
            candidates.push({
              path: versionPath,
              type: 'INDIVIDUAL_SKILL',
              priority: VERSION_SOURCE_PRIORITY.INDIVIDUAL_SKILL
            });
          }
        }
      }
    }
  } catch (error) {
    // If skills directory doesn't exist or can't be read, skip individual skills
  }
  
  return candidates;
}

/**
 * Extract version from version file data
 * Handles different version file formats
 * 
 * @param {object} data - Parsed JSON data
 * @param {string} type - Version source type
 * @returns {string|null} Version string or null
 */
function extractVersion(data, type) {
  if (!data) return null;
  
  switch (type) {
    case 'META_SKILL':
      // Format: { "version": "1.9.0", ... }
      return data.version || null;
      
    case 'AGENTS':
      // Format: { "agent-name": { "metadata": { "projectVersion": "1.9.0" } } }
      // Extract from first agent entry
      const firstAgent = Object.values(data)[0];
      return firstAgent?.metadata?.projectVersion || null;
      
    case 'INDIVIDUAL_SKILL':
      // Format: { "metadata": { "projectVersion": "1.9.0" } } or { "skill_version": "..." }
      return data.metadata?.projectVersion || data.skill_version || null;
      
    default:
      return null;
  }
}

/**
 * Get version from a specific version file
 * Direct read without directory scanning
 * 
 * @param {string} versionFilePath - Full path to version.json
 * @returns {Promise<string|null>} Version or null
 */
export async function getVersionFromFile(versionFilePath) {
  try {
    if (!await fs.pathExists(versionFilePath)) {
      return null;
    }
    
    const data = await fs.readJson(versionFilePath);
    
    // Try common version field names
    return data.version || 
           data.gsd_version ||
           data.metadata?.projectVersion ||
           data.skill_version ||
           null;
  } catch (error) {
    return null;
  }
}
