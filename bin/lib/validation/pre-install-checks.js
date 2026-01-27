// bin/lib/validation/pre-install-checks.js

import { statfs } from 'fs';
import { promisify } from 'util';
import { readdir, stat, writeFile, unlink, readFile } from 'fs/promises';
import { join, normalize, resolve } from 'path';
import { homedir } from 'os';
import { ensureDirectory, pathExists } from '../io/file-operations.js';
import { insufficientSpace, permissionDenied } from '../errors/install-error.js';
import { invalidPath } from '../errors/install-error.js';

const statfsPromise = promisify(statfs);

/**
 * Run all pre-installation checks
 * @param {string} targetDir - Installation target directory
 * @param {string} templatesDir - Templates source directory
 * @param {boolean} isGlobal - Global vs local installation
 * @param {string} platform - Platform name
 * @throws {InstallError} If any validation fails
 * @returns {Promise<Object>} Validation results with existing installation info and warnings
 */
export async function runPreInstallationChecks(targetDir, templatesDir, isGlobal, platform) {
  const warnings = [];
  
  // 1. Validate paths (security check)
  await validatePaths(targetDir, isGlobal);
  
  // 2. Calculate required space
  const templateSize = await calculateDirectorySize(templatesDir);
  
  // 3. Check disk space (with 10% buffer)
  const diskSpaceWarning = await checkDiskSpace(targetDir, templateSize);
  if (diskSpaceWarning) warnings.push(diskSpaceWarning);
  
  // 4. Check write permissions (actual write test)
  await checkWritePermissions(targetDir);
  
  // 5. Detect existing installation (info only, doesn't fail)
  const existingInstall = await detectExistingInstallation(targetDir);
  
  return { existingInstall, templateSize, warnings };
}

/**
 * Check available disk space with 10% buffer
 * @returns {string|null} Warning message if check failed, null otherwise
 */
export async function checkDiskSpace(targetDir, requiredBytes) {
  try {
    const stats = await statfsPromise(targetDir);
    const availableBytes = stats.bavail * stats.bsize;
    
    // Add 10% buffer (context decision)
    const requiredWithBuffer = Math.ceil(requiredBytes * 1.1);
    
    if (availableBytes < requiredWithBuffer) {
      throw insufficientSpace(
        'Insufficient disk space',
        {
          required: requiredWithBuffer,
          available: availableBytes,
          path: targetDir,
          requiredMB: (requiredWithBuffer / 1024 / 1024).toFixed(2),
          availableMB: (availableBytes / 1024 / 1024).toFixed(2)
        }
      );
    }
    
    return null; // No warning - check passed
  } catch (error) {
    if (error.name === 'InstallError') throw error;
    
    // If statfs not available (Node < 19), return warning message
    return 'Could not check disk space (requires Node.js 19+)';
  }
}

/**
 * Test write permissions by actually writing a test file
 */
export async function checkWritePermissions(targetDir) {
  const testFile = join(targetDir, `.gsd-test-write-${Date.now()}`);
  
  try {
    // Ensure directory exists first
    await ensureDirectory(targetDir);
    
    // Test actual write
    await writeFile(testFile, 'test', 'utf8');
    
    // Cleanup
    await unlink(testFile);
  } catch (error) {
    // Try cleanup if file was partially created
    try {
      await unlink(testFile);
    } catch {}
    
    throw permissionDenied(
      `Cannot write to directory: ${targetDir}`,
      {
        path: targetDir,
        error: error.message,
        code: error.code
      }
    );
  }
}

/**
 * Validate paths for security (no traversal, correct scope)
 */
export async function validatePaths(targetDir, isGlobal) {
  // Normalize to resolve .. and . segments
  const normalized = normalize(targetDir);
  const resolved = resolve(normalized);
  
  // Check for traversal attempts
  if (normalized.includes('..')) {
    throw invalidPath(
      'Path traversal detected',
      { path: targetDir, reason: 'Contains ..' }
    );
  }
  
  // Validate scope matches path
  const home = homedir();
  if (isGlobal && !resolved.startsWith(home)) {
    throw invalidPath(
      'Global installation must be in home directory',
      { path: targetDir, home }
    );
  }
  
  // Block system directories
  const systemDirs = ['/etc', '/usr', '/bin', '/sbin', '/var', '/tmp'];
  if (systemDirs.some(dir => resolved.startsWith(dir))) {
    throw invalidPath(
      'Cannot install to system directories',
      { path: targetDir, blocked: true }
    );
  }
  
  return resolved;
}

/**
 * Detect existing installation and return info
 */
export async function detectExistingInstallation(targetDir) {
  const manifestPath = join(targetDir, 'get-shit-done', '.gsd-install-manifest.json');
  
  if (!await pathExists(manifestPath)) {
    return null;
  }
  
  try {
    const content = await readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(content);
    
    return {
      version: manifest.gsd_version || manifest.version,
      platform: manifest.platform,
      scope: manifest.scope,
      installedAt: manifest.installed_at || manifest.installedAt,
      path: manifestPath
    };
  } catch (error) {
    // Manifest exists but is corrupted
    return {
      version: 'unknown',
      corrupted: true,
      path: manifestPath
    };
  }
}

/**
 * Calculate total size of directory recursively
 */
async function calculateDirectorySize(dirPath) {
  let totalSize = 0;
  
  async function walk(currentPath) {
    const entries = await readdir(currentPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(currentPath, entry.name);
      
      if (entry.isDirectory()) {
        await walk(fullPath);
      } else if (entry.isFile()) {
        const stats = await stat(fullPath);
        totalSize += stats.size;
      }
    }
  }
  
  await walk(dirPath);
  return totalSize;
}
