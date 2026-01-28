// bin/lib/paths/symlink-resolver.js

import { lstat, readlink } from 'fs/promises';
import path from 'path';
import { invalidPath } from '../errors/install-error.js';

/**
 * Detect and resolve symlinks (single level only)
 * @param {string} filePath - Path to check
 * @returns {Promise<Object>} { isSymlink, original, target }
 * @throws {InstallError} If symlink chain detected or target doesn't exist
 */
export async function resolveSymlinkSingleLevel(filePath) {
  let stats;
  try {
    stats = await lstat(filePath);
  } catch (e) {
    throw invalidPath(
      `Path does not exist: ${filePath}`,
      { path: filePath, error: e.message }
    );
  }
  
  if (!stats.isSymbolicLink()) {
    return {
      isSymlink: false,
      original: filePath,
      target: filePath
    };
  }
  
  // It's a symlink - read the target
  const linkTarget = await readlink(filePath);
  const resolvedTarget = path.resolve(path.dirname(filePath), linkTarget);
  
  // Check if target exists
  let targetStats;
  try {
    targetStats = await lstat(resolvedTarget);
  } catch (e) {
    throw invalidPath(
      `Broken symlink: ${filePath} -> ${linkTarget} (does not exist)`,
      { 
        path: filePath,
        target: linkTarget,
        resolved: resolvedTarget,
        error: e.message
      }
    );
  }
  
  // Check if target is itself a symlink (chain detection)
  if (targetStats.isSymbolicLink()) {
    throw invalidPath(
      `Symlink chain detected: ${filePath} -> ${linkTarget} (target is also a symlink)`,
      {
        path: filePath,
        target: linkTarget,
        resolved: resolvedTarget
      }
    );
  }
  
  return {
    isSymlink: true,
    original: filePath,
    target: resolvedTarget
  };
}

/**
 * Check if path is a symlink without resolving
 * @param {string} filePath - Path to check
 * @returns {Promise<boolean>} True if symlink
 */
export async function isSymlink(filePath) {
  try {
    const stats = await lstat(filePath);
    return stats.isSymbolicLink();
  } catch {
    return false;
  }
}
