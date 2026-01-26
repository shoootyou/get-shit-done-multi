// bin/lib/installer/orchestrator.js

import { join } from 'path';
import { homedir } from 'os';
import { resolveTargetDirectory, getTemplatesDirectory, validatePath } from '../paths/path-resolver.js';
import { copyDirectory, ensureDirectory, writeFile, pathExists } from '../io/file-operations.js';
import { renderTemplate, findUnknownVariables, replaceVariables } from '../rendering/template-renderer.js';
import { cleanFrontmatter } from '../rendering/frontmatter-cleaner.js';
import { createMultiBar, createProgressBar, updateProgress, stopAllProgress } from '../cli/progress.js';
import * as logger from '../cli/logger.js';
import { missingTemplates } from '../errors/install-error.js';
import { adapterRegistry } from '../platforms/registry.js';
import { readdir, readFile } from 'fs/promises';

/**
 * Main installation orchestrator
 * @param {Object} options - Installation options
 * @param {string} options.platform - Platform name (claude/copilot/codex)
 * @param {boolean} options.isGlobal - Global vs local installation
 * @param {boolean} options.isVerbose - Verbose output
 * @param {string} options.scriptDir - Script directory path
 * @param {string} [options.targetDir] - Override target directory (for testing)
 * @returns {Promise<Object>} Installation statistics
 */
export async function install(options) {
  const { platform, isGlobal, isVerbose, scriptDir, targetDir: targetDirOverride } = options;
  
  // Get platform adapter
  const adapter = adapterRegistry.get(platform);
  
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
    VERSION: '2.0.0',
    PLATFORM_NAME: platform
  };
  
  logger.info(`Target directory: ${targetDir}`, 1);
  logger.info(`Templates source: ${templatesDir}`, 1);
  logger.info(`Command prefix: ${commandPrefix}`, 1);
  
  // Validate templates exist
  await validateTemplates(templatesDir);
  
  // Check for existing installation
  const manifestPath = join(targetDir, 'get-shit-done', '.gsd-install-manifest.json');
  const hasExisting = await pathExists(manifestPath);
  
  if (hasExisting) {
    logger.sectionTitle('Warnings');
    logger.warn('Existing installation detected', 1);
    logger.warn('Installation will overwrite existing files', 1);
    // In Phase 4, we'll add interactive confirmation here
    // For now, proceed with overwrite
  }
  
  // Create target directory
  await ensureDirectory(targetDir);
  
  // Initialize progress tracking
  const stats = { skills: 0, agents: 0, shared: 0, target: targetDir };
  
  if (!isVerbose) {
    // Add section title before progress bars
    logger.sectionTitle('Installing...');
    
    // Multi-bar progress for non-verbose mode
    const multiBar = createMultiBar();
    
    try {
      // Phase 1: Install skills
      stats.skills = await installSkills(templatesDir, targetDir, templateVars, multiBar, isVerbose, platform);
      
      // Phase 2: Install agents
      stats.agents = await installAgents(templatesDir, targetDir, templateVars, multiBar, isVerbose);
      
      // Phase 3: Install shared directory
      stats.shared = await installShared(templatesDir, targetDir, templateVars, multiBar, isVerbose);
      
      stopAllProgress(multiBar);
    } catch (error) {
      stopAllProgress(multiBar);
      throw error;
    }
  } else {
    // Verbose mode: no progress bars, show files
    logger.header('Installing Skills');
    stats.skills = await installSkills(templatesDir, targetDir, templateVars, null, isVerbose, platform);
    
    logger.header('Installing Agents');
    stats.agents = await installAgents(templatesDir, targetDir, templateVars, null, isVerbose);
    
    logger.header('Installing Shared Directory');
    stats.shared = await installShared(templatesDir, targetDir, templateVars, null, isVerbose);
  }
  
  // Generate installation manifest
  await generateManifest(targetDir, stats, isGlobal, platform);
  
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
  
  const total = skills.length + (hasGetShitDone ? 1 : 0);
  const bar = multiBar ? createProgressBar(multiBar, 'Skills', total) : null;
  
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
    if (bar) updateProgress(bar, count);
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
    if (bar) updateProgress(bar, count);
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
  
  const total = agents.length; // versions.json doesn't count as an agent
  const bar = multiBar ? createProgressBar(multiBar, 'Agents', total) : null;
  
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
    if (bar) updateProgress(bar, count);
    logger.verboseComplete(isVerbose);
  }
  
  // Copy versions.json (don't update progress - not counted as agent)
  const versionsFile = join(agentsTemplateDir, 'versions.json');
  if (await pathExists(versionsFile)) {
    logger.verboseInProgress('versions.json', isVerbose);
    
    const content = await readFile(versionsFile, 'utf8');
    const processed = replaceVariables(content, variables);
    await writeFile(join(agentsTargetDir, 'versions.json'), processed);
    // Don't increment count or update bar - versions.json is metadata, not an agent
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
  
  const bar = multiBar ? createProgressBar(multiBar, 'Shared', 1) : null;
  
  logger.verboseInProgress('get-shit-done/', isVerbose);
  
  // Copy entire directory
  await copyDirectory(sharedTemplateDir, sharedTargetDir);
  
  // Process manifest template
  const manifestFile = join(sharedTargetDir, '.gsd-install-manifest.json');
  if (await pathExists(manifestFile)) {
    await processTemplateFile(manifestFile, variables, isVerbose);
  }
  
  if (bar) updateProgress(bar, 1);
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
  const processed = renderTemplate(content, variables);
  
  // Clean frontmatter (remove empty fields)
  const cleaned = cleanFrontmatter(processed);
  
  await writeFile(filePath, cleaned);
}

/**
 * Generate installation manifest
 */
async function generateManifest(targetDir, stats, isGlobal, platform) {
  const manifestPath = join(targetDir, 'get-shit-done', '.gsd-install-manifest.json');
  
  const manifest = {
    version: '2.0.0',
    platform: platform,
    scope: isGlobal ? 'global' : 'local',
    installedAt: new Date().toISOString(),
    stats: {
      skills: stats.skills,
      agents: stats.agents
    }
  };
  
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
}
