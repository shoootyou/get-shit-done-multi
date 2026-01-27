// bin/lib/installer/orchestrator.js

import { join } from 'path';
import { homedir } from 'os';
import chalk from 'chalk';
import { resolveTargetDirectory, getTemplatesDirectory, validatePath } from '../paths/path-resolver.js';
import { copyDirectory, ensureDirectory, writeFile, pathExists } from '../io/file-operations.js';
import { renderTemplate, findUnknownVariables, replaceVariables } from '../rendering/template-renderer.js';
import { cleanFrontmatter } from '../rendering/frontmatter-cleaner.js';
import { createMultiBar, createProgressBar, updateProgress, stopAllProgress, displayCompletionLine } from '../cli/progress.js';
import * as logger from '../cli/logger.js';
import { missingTemplates } from '../errors/install-error.js';
import { readdir, readFile } from 'fs/promises';
import { runPreInstallationChecks } from '../validation/pre-install-checks.js';
import { generateAndWriteManifest } from '../validation/manifest-generator.js';

/**
 * Main installation orchestrator
 * @param {string} appVersion - Application version
 * @param {Object} options - Installation options
 * @param {string} options.platform - Platform name (claude/copilot/codex)
 * @param {PlatformAdapter} options.adapter - Platform adapter instance
 * @param {boolean} options.isGlobal - Global vs local installation
 * @param {boolean} options.isVerbose - Verbose output
 * @param {string} options.scriptDir - Script directory path
 * @param {string} [options.targetDir] - Override target directory (for testing)
 * @returns {Promise<Object>} Installation statistics
 */
export async function install(appVersion, options) {
  const { platform, adapter, isGlobal, isVerbose, scriptDir, targetDir: targetDirOverride } = options;

  // Determine target directory
  const targetBase = adapter.getTargetDir(isGlobal);
  const targetDir = targetDirOverride || (isGlobal
    ? join(homedir(), targetBase.replace('~/', ''))
    : targetBase);

  const templatesDir = getTemplatesDirectory(scriptDir);

  // Get command prefix and path reference for variable replacement
  const commandPrefix = adapter.getCommandPrefix();
  const pathReference = adapter.getPathReference();

  const templateVars = {
    PLATFORM_ROOT: pathReference,
    COMMAND_PREFIX: commandPrefix,
    VERSION: `${appVersion}`,
    PLATFORM_NAME: platform
  };

  // Always show these informational lines - they provide useful context
  logger.info(`Target directory: ${targetDir}`, 2);
  logger.info(`Command prefix: ${commandPrefix}`, 2);

  // === NEW: Pre-installation validation gate (Phase 5) ===
  const validationResults = await runPreInstallationChecks(
    targetDir,
    templatesDir,
    isGlobal,
    platform
  );

  // Use validation results to enhance existing installation detection
  const { existingInstall } = validationResults;

  // Validate templates exist
  await validateTemplates(templatesDir);

  // Check for existing installation (validation already detected it)
  if (existingInstall) {
    if (!isVerbose) {
      logger.warn(`Existing installation detected (v${existingInstall.version})`, 2);
      logger.warn('Installation will overwrite existing files', 2);
    } else {
      logger.warnSubtitle('Warnings');
      logger.listItem(`Existing installation detected (v${existingInstall.version})`, 2);
      logger.listItem('Installation will overwrite existing files', 2);
    }
  } else if (isVerbose) {
    logger.infoSubtitle('Info');
    logger.listItem('No existing installation found', 2);
  }

  // Create target directory
  await ensureDirectory(targetDir);

  // Initialize progress tracking
  const stats = { skills: 0, agents: 0, shared: 0, target: targetDir };

  if (!isVerbose) {
    logger.infoSubtitle('Install progress');
    // Simple completion line display for non-verbose mode
    try {
      // Phase 1: Install skills
      stats.skills = await installSkills(templatesDir, targetDir, templateVars, null, isVerbose, platform);
      displayCompletionLine('Skills', stats.skills, stats.skills);

      // Phase 2: Install agents
      stats.agents = await installAgents(templatesDir, targetDir, templateVars, null, isVerbose);
      displayCompletionLine('Agents', stats.agents, stats.agents);

      // Phase 3: Install shared directory
      stats.shared = await installShared(templatesDir, targetDir, templateVars, null, isVerbose);
      displayCompletionLine('Shared', stats.shared, stats.shared);
    } catch (error) {
      throw error;
    }
  } else {
    // Verbose mode: no progress bars, show files
    logger.simpleSubtitle('Installing Skills');
    stats.skills = await installSkills(templatesDir, targetDir, templateVars, null, isVerbose, platform);

    logger.simpleSubtitle('Installing Agents');
    stats.agents = await installAgents(templatesDir, targetDir, templateVars, null, isVerbose);

    logger.simpleSubtitle('Installing Shared Directory');
    stats.shared = await installShared(templatesDir, targetDir, templateVars, null, isVerbose);
  }

  // Generate manifest after successful installation (Phase 5)
  await generateAndWriteManifest(targetDir, appVersion, platform, isGlobal);

  return stats;
}

/**
 * Validate templates directory exists
 */
async function validateTemplates(templatesDir) {
  const skillsDir = join(templatesDir, 'skills');
  const agentsDir = join(templatesDir, 'agents');
  const sharedDir = join(templatesDir, 'get-shit-done');

  const skillsExist = await pathExists(skillsDir);
  const agentsExist = await pathExists(agentsDir);
  const sharedExist = await pathExists(sharedDir);

  if (!skillsExist || !agentsExist || !sharedExist) {
    throw missingTemplates(
      'Templates directory incomplete',
      { skillsExist, agentsExist, sharedExist, path: templatesDir }
    );
  }
}

/**
 * Install skills from templates
 */
async function installSkills(templatesDir, targetDir, variables, multiBar, isVerbose, platform) {
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
 * Install agents from templates
 */
async function installAgents(templatesDir, targetDir, variables, multiBar, isVerbose) {
  const agentsTemplateDir = join(templatesDir, 'agents');
  const agentsTargetDir = join(targetDir, 'agents');

  await ensureDirectory(agentsTargetDir);

  // Get agent files
  const agentFiles = await readdir(agentsTemplateDir);
  const agents = agentFiles.filter(f => f.startsWith('gsd-') && f.endsWith('.md'));

  let count = 0;
  for (const agent of agents) {
    logger.verboseInProgress(agent, isVerbose);

    const srcFile = join(agentsTemplateDir, agent);
    const destFile = join(agentsTargetDir, agent);

    // Read, process, write
    const content = await readFile(srcFile, 'utf8');
    const processed = replaceVariables(content, variables);
    await writeFile(destFile, processed);

    count++;
    logger.verboseComplete(isVerbose);
  }

  // Copy versions.json (don't update progress - not counted as agent)
  const versionsFile = join(agentsTemplateDir, 'versions.json');
  if (await pathExists(versionsFile)) {
    logger.verboseInProgress('versions.json', isVerbose);

    const content = await readFile(versionsFile, 'utf8');
    const processed = replaceVariables(content, variables);
    await writeFile(join(agentsTargetDir, 'versions.json'), processed);
    // Don't increment count - versions.json is metadata, not an agent
    logger.verboseComplete(isVerbose);
  }

  return agents.length; // Don't count versions.json in agent count
}

/**
 * Install shared directory from templates
 */
async function installShared(templatesDir, targetDir, variables, multiBar, isVerbose) {
  const sharedTemplateDir = join(templatesDir, 'get-shit-done');
  const sharedTargetDir = join(targetDir, 'get-shit-done');

  logger.verboseInProgress('get-shit-done/', isVerbose);

  // Copy entire directory
  await copyDirectory(sharedTemplateDir, sharedTargetDir);

  // Process manifest template
  const manifestFile = join(sharedTargetDir, '.gsd-install-manifest.json');
  if (await pathExists(manifestFile)) {
    await processTemplateFile(manifestFile, variables, isVerbose);
  }

  logger.verboseComplete(isVerbose);

  return 1;
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
