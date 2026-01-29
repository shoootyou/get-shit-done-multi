import { join } from 'path';
import { ensureDirectory, pathExists, copyDirectory, writeFile } from '../io/file-operations.js';
import { readdir, readFile } from 'fs/promises';
import { findUnknownVariables, replaceVariables } from '../rendering/template-renderer.js';
import { cleanFrontmatter } from '../rendering/frontmatter-cleaner.js';
import * as logger from '../cli/logger.js';

/**
 * Install skills from templates
 */
export async function installSkills(templatesDir, targetDir, variables, multiBar, isVerbose, platform) {
  const skillsTemplateDir = join(templatesDir, 'skills');
  const skillsTargetDir = join(targetDir, 'skills');

  // Get skill directories (exclude get-shit-done which has platform subdirectories)
  const skillDirs = await readdir(skillsTemplateDir, { withFileTypes: true });
  const skills = skillDirs.filter(d => d.isDirectory() && d.name.startsWith('gsd-') && d.name !== 'get-shit-done');

  // Add platform-specific get-shit-done skill
  const getShitDoneTemplateDir = join(skillsTemplateDir, 'get-shit-done', platform);
  const hasGetShitDone = await pathExists(getShitDoneTemplateDir);

  let count = 0;

  // Install regular skills
  for (const skill of skills) {
    logger.verboseInProgress(skill.name, isVerbose);

    const srcDir = join(skillsTemplateDir, skill.name);
    const destDir = join(skillsTargetDir, skill.name);

    // Copy skill directory
    await copyDirectory(srcDir, destDir);

    // Process SKILL.md file
    const skillFile = join(destDir, 'SKILL.md');
    await processTemplateFile(skillFile, variables, isVerbose);

    count++;
    logger.verboseComplete(isVerbose);
  }

  // Install platform-specific get-shit-done skill
  if (hasGetShitDone) {
    logger.verboseInProgress('get-shit-done', isVerbose);

    const destDir = join(skillsTargetDir, 'get-shit-done');
    await copyDirectory(getShitDoneTemplateDir, destDir);

    const skillFile = join(destDir, 'SKILL.md');
    await processTemplateFile(skillFile, variables, isVerbose);

    count++;
    logger.verboseComplete(isVerbose);
  }

  return count;
}

/**
 * Process template file (read, replace variables, write)
 */
async function processTemplateFile(filePath, variables, isVerbose) {
  const content = await readFile(filePath, 'utf8');

  // Find unknown variables and warn
  const unknown = findUnknownVariables(content, variables);
  if (unknown.length > 0 && isVerbose) {
    logger.warn(`Unknown variables in ${filePath}: ${unknown.join(', ')}`);
  }

  // Replace template variables
  const processed = replaceVariables(content, variables);

  // Clean frontmatter (remove empty fields)
  const cleaned = cleanFrontmatter(processed);

  await writeFile(filePath, cleaned);
}
