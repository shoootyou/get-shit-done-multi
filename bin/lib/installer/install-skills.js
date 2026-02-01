import { join, basename, dirname } from 'path';
import { ensureDirectory, pathExists, copyDirectory, writeFile } from '../io/file-operations.js';
import { readdir, readFile } from 'fs/promises';
import { findUnknownVariables, replaceVariables } from '../serialization/template-renderer.js';
import { cleanFrontmatter as cleanClaudeFrontmatter } from '../serialization/claude-cleaner.js';
import { cleanFrontmatter as cleanCopilotFrontmatter } from '../serialization/copilot-cleaner.js';
import { cleanFrontmatter as cleanCodexFrontmatter } from '../serialization/codex-cleaner.js';
import * as logger from '../cli/logger.js';
import matter from 'gray-matter';
import { ClaudeValidator } from '../frontmatter/claude-validator.js';
import { CopilotValidator } from '../frontmatter/copilot-validator.js';
import { CodexValidator } from '../frontmatter/codex-validator.js';
import { ValidationError } from '../frontmatter/validation-error.js';

/**
 * Validator registry - map of platform names to validator instances
 */
const validators = {
  'claude': new ClaudeValidator(),
  'copilot': new CopilotValidator(),
  'codex': new CodexValidator()
};

/**
 * Cleaner registry - map of platform names to cleaner functions
 */
const cleaners = {
  'claude': cleanClaudeFrontmatter,
  'copilot': cleanCopilotFrontmatter,
  'codex': cleanCodexFrontmatter
};

/**
 * Validate skill frontmatter after template variable replacement
 * @param {string} content - Processed skill content with variables replaced
 * @param {string} templateName - Name of the skill template
 * @param {string} filePath - Path to the skill file
 * @param {string} platform - Target platform (claude, copilot, codex)
 * @throws {ValidationError} If frontmatter validation fails
 */
function validateSkillFrontmatter(content, templateName, filePath, platform) {
  // Parse frontmatter from content
  const { data: frontmatter } = matter(content);
  
  // Get validator for platform
  const validator = validators[platform];
  if (!validator) {
    throw new Error(`No validator found for platform: ${platform}`);
  }
  
  // Validate with context
  const context = { templateName, filePath, platform };
  validator.validate(frontmatter, context);
}

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
    await processTemplateFile(skillFile, variables, isVerbose, platform);

    count++;
    logger.verboseComplete(isVerbose);
  }

  // Install platform-specific get-shit-done skill
  if (hasGetShitDone) {
    logger.verboseInProgress('get-shit-done', isVerbose);

    const destDir = join(skillsTargetDir, 'get-shit-done');
    await copyDirectory(getShitDoneTemplateDir, destDir);

    const skillFile = join(destDir, 'SKILL.md');
    await processTemplateFile(skillFile, variables, isVerbose, platform);

    count++;
    logger.verboseComplete(isVerbose);
  }

  return count;
}

/**
 * Process template file (read, replace variables, validate, clean, write)
 */
async function processTemplateFile(filePath, variables, isVerbose, platform) {
  const content = await readFile(filePath, 'utf8');

  // Find unknown variables and warn
  const unknown = findUnknownVariables(content, variables);
  if (unknown.length > 0 && isVerbose) {
    logger.warn(`Unknown variables in ${filePath}: ${unknown.join(', ')}`);
  }

  // Replace template variables
  const processed = replaceVariables(content, variables);

  // Validate frontmatter after variable replacement
  const templateName = basename(dirname(filePath));
  try {
    validateSkillFrontmatter(processed, templateName, filePath, platform);
  } catch (error) {
    if (error instanceof ValidationError) {
      // Print formatted error and exit
      console.error(error.toConsoleOutput());
      process.exit(1);
    }
    throw error; // Re-throw non-validation errors
  }

  // Clean frontmatter (remove empty fields) with platform-specific formatting
  const cleanFrontmatter = cleaners[platform];
  if (!cleanFrontmatter) {
    throw new Error(`No cleaner found for platform: ${platform}`);
  }
  const cleaned = cleanFrontmatter(processed);

  await writeFile(filePath, cleaned);
}
