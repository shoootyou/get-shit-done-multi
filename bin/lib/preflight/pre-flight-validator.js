// bin/lib/preflight/pre-flight-validator.js

import { statfs } from 'fs';
import { promisify } from 'util';
import { readdir, stat } from 'fs/promises';
import { join, resolve } from 'path';
import { checkDiskSpace, checkWritePermissions } from '../validation/pre-install-checks.js';
import { validateAllPaths } from '../validation/path-validator.js';
import { resolveSymlinkSingleLevel } from '../paths/symlink-resolver.js';
import { formatPreflightReport } from './error-formatter.js';
import { InstallError, missingTemplates } from '../errors/install-error.js';
import { pathExists } from '../io/file-operations.js';

const statfsPromise = promisify(statfs);

/**
 * Pre-flight validation orchestrator
 * Validates all requirements before installation begins
 * 
 * EXECUTION STRATEGY:
 * - Fail-fast on prerequisite failures (templates missing → skip paths)
 * - Collect independent validation errors for grouped display
 * - Validation order: cheap-first (disk, templates) then expensive (paths, symlinks)
 * 
 * VALIDATION ORDER (per CONTEXT.md):
 * 1. Disk space check (cheapest, independent)
 * 2. Templates exist check (cheap, PREREQUISITE for paths)
 * 3. Permissions check (medium cost, independent)
 * 4. Path validation (expensive: 8-layer × N paths)
 * 5. Symlink detection (expensive: lstat + readlink per target)
 * 
 * @param {Array<string>} platforms - Platforms to install (copilot, cursor, etc)
 * @param {string} scope - Installation scope (skills, agents, all)
 * @param {Object} config - Configuration object
 * @param {string} config.scriptDir - Script directory (__dirname from install.js)
 * @param {boolean} config.verbose - Verbose logging enabled
 * @param {string|null} config.customPath - Custom installation path (or null)
 * @returns {Promise<void>} - Resolves if validation passes, throws if fails
 */
export async function validateBeforeInstall(platforms, scope, config) {
  const errors = [];
  
  // Determine target directory
  const targetDir = config.customPath || process.cwd();
  const templatesDir = join(config.scriptDir, '..', 'templates');
  
  if (config.verbose) {
    console.log('Running pre-flight validation...');
    console.log(`  Platforms: ${platforms.join(', ')}`);
    console.log(`  Scope: ${scope}`);
    console.log(`  Target: ${targetDir}`);
  }
  
  // ===== VALIDATION 1: Disk space (cheap, independent) =====
  try {
    // Calculate template size for selected platforms/scope
    const templateSize = await calculateTemplateSize(templatesDir, platforms, scope);
    
    // Check disk space with 50% buffer (per CONTEXT.md)
    const requiredBytes = Math.ceil(templateSize * 1.5);
    
    // Check using parent directory if target doesn't exist
    let checkPath = targetDir;
    if (!await pathExists(targetDir)) {
      checkPath = resolve(targetDir, '..');
    }
    
    const stats = await statfsPromise(checkPath);
    const availableBytes = stats.bavail * stats.bsize; // bavail = available to non-root
    
    if (availableBytes < requiredBytes) {
      errors.push({
        category: 'Disk',
        error: new InstallError(
          'Insufficient disk space',
          5,
          {
            required: requiredBytes,
            available: availableBytes,
            path: targetDir,
            requiredMB: (requiredBytes / 1024 / 1024).toFixed(2),
            availableMB: (availableBytes / 1024 / 1024).toFixed(2)
          }
        )
      });
    }
    
    if (config.verbose && availableBytes >= requiredBytes) {
      console.log(`  ✓ Disk space: ${(availableBytes / 1024 / 1024).toFixed(2)} MB available`);
    }
  } catch (error) {
    // Only collect error if it's not just statfs unavailable (Node < 19)
    if (error.code !== 'ERR_METHOD_NOT_IMPLEMENTED' && error.name === 'InstallError') {
      errors.push({ category: 'Disk', error });
    } else if (config.verbose) {
      console.log('  ⚠ Could not check disk space (requires Node.js 19+)');
    }
  }
  
  // ===== VALIDATION 2: Templates exist (cheap, PREREQUISITE) =====
  let templatesValid = true;
  try {
    const requiredDirs = determineRequiredTemplates(scope);
    const missingDirs = [];
    
    for (const dir of requiredDirs) {
      const dirPath = join(templatesDir, dir);
      if (!await pathExists(dirPath)) {
        missingDirs.push(dir);
      }
    }
    
    if (missingDirs.length > 0) {
      templatesValid = false;
      errors.push({
        category: 'Templates',
        error: missingTemplates(
          `Missing template directories: ${missingDirs.join(', ')}`,
          { missing: missingDirs, templatesDir }
        )
      });
      
      // PREREQUISITE FAILURE: Skip path validation (can't validate paths without templates)
      if (config.verbose) {
        console.log('  ✗ Templates missing - skipping path validation');
      }
    } else if (config.verbose) {
      console.log(`  ✓ Templates exist: ${requiredDirs.join(', ')}`);
    }
  } catch (error) {
    templatesValid = false;
    errors.push({ category: 'Templates', error });
  }
  
  // ===== VALIDATION 3: Permissions (medium cost, independent) =====
  try {
    await checkWritePermissions(targetDir);
    if (config.verbose) {
      console.log(`  ✓ Write permissions OK`);
    }
  } catch (error) {
    errors.push({ category: 'Permissions', error });
  }
  
  // ===== VALIDATION 4: Path validation (expensive, depends on templates) =====
  if (templatesValid) {
    try {
      // Collect all paths from templates
      const allPaths = await collectTemplatePaths(templatesDir, platforms, scope);
      
      if (allPaths.length > 0) {
        // Run batch validation (collects all errors)
        const results = validateAllPaths(targetDir, allPaths);
        
        if (results.totalErrors > 0) {
          // Add each invalid path as a separate error
          for (const invalid of results.invalid) {
            errors.push({
              category: 'Paths',
              error: new InstallError(
                `Invalid path: ${invalid.input}`,
                6,
                { 
                  path: invalid.input,
                  reason: invalid.error,
                  ...invalid.details
                }
              )
            });
          }
        } else if (config.verbose) {
          console.log(`  ✓ Path validation: ${results.valid.length} paths OK`);
        }
      }
    } catch (error) {
      errors.push({ category: 'Paths', error });
    }
  }
  
  // ===== VALIDATION 5: Symlink detection (expensive, warning only) =====
  try {
    const symlinkInfo = await resolveSymlinkSingleLevel(targetDir);
    
    if (symlinkInfo.isSymlink) {
      // Symlink detected - warning, not fatal (per CONTEXT.md)
      errors.push({
        category: 'Symlinks',
        error: new InstallError(
          `Target is a symlink: ${targetDir} -> ${symlinkInfo.target}`,
          0, // Code 0 = warning, not fatal
          {
            path: targetDir,
            target: symlinkInfo.target,
            warning: true
          }
        )
      });
      
      if (config.verbose) {
        console.log(`  ⚠ Target is symlink: ${symlinkInfo.target}`);
      }
    }
  } catch (error) {
    // Broken symlinks or symlink chains are errors
    if (error.name === 'InstallError') {
      errors.push({ category: 'Symlinks', error });
    }
  }
  
  // ===== REPORT ERRORS =====
  if (errors.length > 0) {
    // Separate warnings from fatal errors
    const warnings = errors.filter(e => e.error.code === 0);
    const fatalErrors = errors.filter(e => e.error.code !== 0);
    
    if (fatalErrors.length > 0) {
      const report = formatPreflightReport(fatalErrors);
      const error = new InstallError('VALIDATION_FAILED', 1, { errors: fatalErrors });
      error.message = report; // Override message with full report
      throw error;
    }
    
    // Only warnings - show them but don't fail
    if (warnings.length > 0 && config.verbose) {
      console.log('\nWarnings:');
      for (const warning of warnings) {
        console.log(`  ⚠ ${warning.error.message}`);
      }
      console.log('');
    }
  }
  
  if (config.verbose) {
    console.log('✓ Pre-flight validation passed\n');
  }
}

/**
 * Determine required template directories based on scope
 */
function determineRequiredTemplates(scope) {
  const dirs = [];
  
  if (scope === 'skills' || scope === 'all') {
    dirs.push('skills');
  }
  
  if (scope === 'agents' || scope === 'all') {
    dirs.push('agents');
  }
  
  if (scope === 'workflows' || scope === 'all') {
    dirs.push('workflows');
  }
  
  // Shared templates always required
  dirs.push('shared');
  
  return dirs;
}

/**
 * Calculate total template size for selected platforms/scope
 */
async function calculateTemplateSize(templatesDir, platforms, scope) {
  const requiredDirs = determineRequiredTemplates(scope);
  let totalSize = 0;
  
  for (const dir of requiredDirs) {
    const dirPath = join(templatesDir, dir);
    if (await pathExists(dirPath)) {
      totalSize += await calculateDirectorySize(dirPath);
    }
  }
  
  return totalSize;
}

/**
 * Calculate directory size recursively
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
      // Ignore permission errors on individual files
      if (error.code !== 'EACCES' && error.code !== 'EPERM') {
        throw error;
      }
    }
  }
  
  await walk(dirPath);
  return totalSize;
}

/**
 * Collect all paths from templates for validation
 */
async function collectTemplatePaths(templatesDir, platforms, scope) {
  const paths = [];
  const requiredDirs = determineRequiredTemplates(scope);
  
  for (const dir of requiredDirs) {
    const dirPath = join(templatesDir, dir);
    if (await pathExists(dirPath)) {
      await collectPathsRecursive(dirPath, templatesDir, paths);
    }
  }
  
  return paths;
}

/**
 * Recursively collect relative paths from directory
 */
async function collectPathsRecursive(dirPath, basePath, paths) {
  try {
    const entries = await readdir(dirPath, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = join(dirPath, entry.name);
      const relativePath = fullPath.substring(basePath.length + 1);
      
      paths.push(relativePath);
      
      if (entry.isDirectory()) {
        await collectPathsRecursive(fullPath, basePath, paths);
      }
    }
  } catch (error) {
    // Ignore permission errors
    if (error.code !== 'EACCES' && error.code !== 'EPERM') {
      throw error;
    }
  }
}
