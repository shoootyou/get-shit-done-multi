import { join } from 'path';
import { copyDirectory } from '../io/file-operations.js';
import { readdir, readFile, writeFile as fsWriteFile } from 'fs/promises';
import { replaceVariables } from '../templates/template-renderer.js';
import * as logger from '../cli/logger.js';
import yaml from 'js-yaml';

/**
 * Install shared directory from templates
 */
export async function installShared(templatesDir, targetDir, variables, multiBar, isVerbose) {
  const sharedTemplateDir = join(templatesDir, 'get-shit-done');
  const sharedTargetDir = join(targetDir, 'get-shit-done');

  logger.verboseInProgress('get-shit-done/', isVerbose);

  // Copy entire directory
  await copyDirectory(sharedTemplateDir, sharedTargetDir);

  logger.verboseComplete(isVerbose);

  // Process all text files recursively for template variables
  await processDirectoryRecursively(sharedTargetDir, variables, isVerbose);

  return 1;
}

/**
 * Text file extensions to process for template variables
 */
const TEXT_EXTENSIONS = new Set([
  '.md', '.json', '.sh', '.bash', '.txt',
  '.yml', '.yaml', '.config', '.js', '.mjs',
  '.ts', '.html', '.css', '.xml'
]);

/**
 * Recursively process all text files in directory for template variables
 * @param {string} dir - Directory to process
 * @param {Object} variables - Template variables to replace
 * @param {boolean} isVerbose - Verbose logging
 */
async function processDirectoryRecursively(dir, variables, isVerbose) {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      continue; // recursive: true handles subdirectories
    }

    // In Node.js 20.1+, entry has parentPath property which contains the directory
    // entry.name is just the filename
    const fullPath = join(entry.parentPath || dir, entry.name);

    // Check if text file by extension
    const ext = entry.name.substring(entry.name.lastIndexOf('.'));
    if (!TEXT_EXTENSIONS.has(ext)) {
      if (isVerbose) {
        logger.warn(`Skipping binary: ${entry.name}`, 4);
      }
      continue;
    }

    // Process text file
    try {
      const content = await readFile(fullPath, 'utf8');
      const processed = replaceVariables(content, variables);

      // Validate JSON/YAML after replacement
      if (ext === '.json') {
        try {
          JSON.parse(processed);
        } catch (error) {
          throw new Error(`Invalid JSON after variable replacement in ${entry.name}: ${error.message}`);
        }
      } else if (ext === '.yml' || ext === '.yaml') {
        try {
          yaml.load(processed);
        } catch (error) {
          throw new Error(`Invalid YAML after variable replacement in ${entry.name}: ${error.message}`);
        }
      }

      await fsWriteFile(fullPath, processed);
    } catch (error) {
      // Re-throw with context
      throw new Error(`Failed to process ${entry.name}: ${error.message}`);
    }
  }
}
