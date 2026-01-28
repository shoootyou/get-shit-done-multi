// bin/lib/migration/backup-manager.js

import { ensureDir } from 'fs-extra';
import { copyDirectory, pathExists } from '../io/file-operations.js';
import { resolve, join, basename } from 'path';
import { statfs } from 'fs';
import { promisify } from 'util';
import { readdir, stat } from 'fs/promises';
import { insufficientSpace } from '../errors/install-error.js';

const statfsPromise = promisify(statfs);

/**
 * Calculate total size of a directory recursively
 * @param {string} dirPath - Directory to calculate
 * @returns {Promise<number>} Total size in bytes
 */
async function calculateDirectorySize(dirPath) {
  let totalSize = 0;
  
  async function walk(currentPath) {
    try {
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
    } catch (error) {
      // Skip inaccessible directories
    }
  }
  
  await walk(dirPath);
  return totalSize;
}

/**
 * Create backup directory with timestamp
 * @param {string} oldVersion - Version being backed up
 * @param {string} targetDir - Base directory for backup
 * @returns {Promise<string>} Path to created backup directory
 */
export async function createBackupDirectory(oldVersion, targetDir) {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  
  const timestamp = `${year}-${month}-${day}-${hour}${minute}`;
  let backupPath = resolve(targetDir, '.gsd-backup', timestamp);
  
  // Handle edge case where directory exists (append seconds)
  if (await pathExists(backupPath)) {
    const second = String(now.getSeconds()).padStart(2, '0');
    backupPath = resolve(targetDir, '.gsd-backup', `${timestamp}-${second}`);
  }
  
  await ensureDir(backupPath);
  return backupPath;
}

/**
 * Validate sufficient disk space for backup
 * @param {string[]} sourcePaths - Paths to backup
 * @param {string} backupDir - Backup destination directory
 * @returns {Promise<void>}
 * @throws {InstallError} If insufficient disk space
 */
export async function validateBackupSpace(sourcePaths, backupDir) {
  // Calculate total size of all source paths
  let totalSize = 0;
  for (const path of sourcePaths) {
    if (await pathExists(path)) {
      totalSize += await calculateDirectorySize(path);
    }
  }
  
  // Check disk space with 10% buffer
  const checkPath = await pathExists(backupDir) 
    ? backupDir 
    : resolve(backupDir, '..');
  
  try {
    const stats = await statfsPromise(checkPath);
    const availableBytes = stats.bavail * stats.bsize;
    
    // Add 10% buffer
    const requiredWithBuffer = Math.ceil(totalSize * 1.1);
    
    if (availableBytes < requiredWithBuffer) {
      throw insufficientSpace(
        `Backup requires ${(requiredWithBuffer / 1024 / 1024).toFixed(2)}MB (with 10% buffer), Available: ${(availableBytes / 1024 / 1024).toFixed(2)}MB`,
        {
          required: requiredWithBuffer,
          available: availableBytes,
          path: backupDir,
          requiredMB: (requiredWithBuffer / 1024 / 1024).toFixed(2),
          availableMB: (availableBytes / 1024 / 1024).toFixed(2)
        }
      );
    }
  } catch (error) {
    if (error.name === 'InstallError') throw error;
    // If statfs not available, continue without check
  }
}

/**
 * Copy file/directory with retry logic
 * @param {string} sourcePath - Source path
 * @param {string} destPath - Destination path
 * @param {Object} options - Copy options
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function copyWithRetry(sourcePath, destPath, options = {}) {
  const { maxRetries = 3, retryDelay = 1000 } = options;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await copyDirectory(sourcePath, destPath, {
        overwrite: false,
        preserveTimestamps: true,
        errorOnExist: false
      });
      return { success: true };
    } catch (error) {
      if (attempt === maxRetries) {
        return { 
          success: false, 
          error: error.message 
        };
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
  
  // Fallback (should never reach here)
  return { success: false, error: 'Max retries exceeded' };
}

/**
 * Create backup of old installation
 * @param {string} platform - Platform name (claude, copilot, codex)
 * @param {string} oldVersion - Version being backed up
 * @param {string[]} sourcePaths - Array of relative paths to backup
 * @param {string} targetDir - Base directory
 * @returns {Promise<{success: boolean, backupPath: string, failed?: string[]}>}
 */
export async function createBackup(platform, oldVersion, sourcePaths, targetDir) {
  try {
    // 1. Create backup directory
    const backupPath = await createBackupDirectory(oldVersion, targetDir);
    
    // 2. Resolve source paths (they should be relative to targetDir)
    const resolvedPaths = sourcePaths.map(p => {
      // If already absolute, use as-is; otherwise resolve relative to targetDir
      return resolve(p.startsWith('/') ? p : join(targetDir, p));
    });
    
    // 3. Validate disk space (throws if insufficient)
    await validateBackupSpace(resolvedPaths, backupPath);
    
    // 4. Copy each source path with retry, preserving directory structure
    const failed = [];
    
    for (let i = 0; i < sourcePaths.length; i++) {
      const sourcePath = resolvedPaths[i];
      const relativePath = sourcePaths[i]; // Original relative path
      
      if (!await pathExists(sourcePath)) {
        continue; // Skip non-existent paths
      }
      
      // Preserve full directory structure in backup
      const destPath = join(backupPath, relativePath);
      
      const result = await copyWithRetry(sourcePath, destPath);
      
      if (!result.success) {
        failed.push(sourcePath);
      }
    }
    
    // 5. Return result
    if (failed.length > 0) {
      // Partial backup - keep files, report failures
      return {
        success: false,
        backupPath,
        failed
      };
    }
    
    return {
      success: true,
      backupPath
    };
  } catch (error) {
    // Disk space errors or permission errors bubble up
    throw error;
  }
}
