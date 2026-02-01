// bin/lib/installer/install-platform-instructions.js

import { readFile, writeFile, rename, unlink } from 'fs/promises';
import { pathExists } from 'fs-extra';
import { join } from 'path';
import { replaceVariables } from '../templates/template-renderer.js';
import { verboseInProgress, verboseComplete } from '../cli/logger.js';

/**
 * Install platform instructions with smart merge logic
 * Handles three scenarios: create new, append, or replace existing block
 * 
 * @param {string} templatesDir - Path to templates directory
 * @param {string} targetDir - Target installation directory (unused, adapter provides path)
 * @param {Object} variables - Template variables for replacement
 * @param {Object} multiBar - Progress bar (unused in this function)
 * @param {boolean} isVerbose - Verbose logging flag
 * @param {Object} adapter - Platform adapter with getInstructionsPath method
 * @returns {Promise<number>} Number of files processed (always 1)
 */
export async function installPlatformInstructions(
  templatesDir,
  targetDir,
  variables,
  multiBar,
  isVerbose,
  adapter
) {
  // Setup paths
  const templatePath = join(templatesDir, 'AGENTS.md');
  const destPath = adapter.getInstructionsPath(variables.isGlobal);
  
  verboseInProgress(`${adapter.platformName} instructions`, isVerbose);
  
  // Read and process template
  const templateContent = await readFile(templatePath, 'utf8');
  
  // Replace variables FIRST (markers vary by platform)
  const processedContent = replaceVariables(templateContent, variables);
  
  // Normalize line endings before split
  const normalized = processedContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const templateLines = normalized.split('\n');
  
  // Extract dynamic markers (first/last line)
  const startMarker = templateLines[0];
  const endMarker = templateLines[templateLines.length - 1];
  const blockLength = templateLines.length;
  
  // Check if destination exists
  const exists = await pathExists(destPath);
  
  if (!exists) {
    // SCENARIO 1: Create new file
    await writeFileAtomic(destPath, templateLines.join('\n'));
    verboseComplete(isVerbose);
    return 1;
  }
  
  // Read existing file and normalize
  const existingContent = await readFile(destPath, 'utf8');
  const existingNormalized = existingContent.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const existingLines = existingNormalized.split('\n');
  
  // Search for start marker
  const startIdx = existingLines.findIndex(line => line === startMarker);
  
  if (startIdx === -1) {
    // SCENARIO 2: Append (marker not found)
    const merged = [...existingLines, '', ...templateLines];
    await writeFileAtomic(destPath, merged.join('\n'));
    verboseComplete(isVerbose);
    return 1;
  }
  
  // SCENARIO 3: Replace or skip
  const expectedEndIdx = startIdx + blockLength - 1;
  
  // Check if block is interrupted by markdown title
  if (expectedEndIdx < existingLines.length) {
    // Look for markdown headers between start and expected end
    for (let i = startIdx + 1; i < Math.min(expectedEndIdx + 1, existingLines.length); i++) {
      if (/^#+\s/.test(existingLines[i])) {
        // Interrupted by user's section - insert full block before it
        const merged = [
          ...existingLines.slice(0, startIdx),
          ...templateLines,
          ...existingLines.slice(i)
        ];
        await writeFileAtomic(destPath, merged.join('\n'));
        verboseComplete(isVerbose);
        return 1;
      }
    }
  }
  
  // Extract existing block for comparison
  const existingBlock = existingLines.slice(startIdx, expectedEndIdx + 1);
  
  // Check if content matches exactly
  const isIdentical = existingBlock.length === templateLines.length &&
    existingBlock.every((line, i) => line === templateLines[i]);
  
  if (isIdentical) {
    // Skip - already up to date
    verboseComplete(isVerbose);
    return 1;
  }
  
  // Replace block
  const merged = [
    ...existingLines.slice(0, startIdx),
    ...templateLines,
    ...existingLines.slice(expectedEndIdx + 1)
  ];
  await writeFileAtomic(destPath, merged.join('\n'));
  verboseComplete(isVerbose);
  return 1;
}

/**
 * Atomic file write using temp file + rename
 * @param {string} filePath - Destination file path
 * @param {string} content - Content to write
 */
async function writeFileAtomic(filePath, content) {
  const tempPath = `${filePath}.tmp`;
  try {
    await writeFile(tempPath, content, 'utf8');
    await rename(tempPath, filePath);
  } catch (error) {
    // Cleanup temp file if rename failed
    try {
      await unlink(tempPath);
    } catch {
      // Ignore cleanup errors
    }
    throw error;
  }
}
