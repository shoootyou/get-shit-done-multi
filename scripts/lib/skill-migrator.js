import path from 'node:path';
import fs from 'fs-extra';
import matter from 'gray-matter';
import { parseFrontmatter, validateFrontmatter } from './frontmatter-parser.js';
import { injectTemplateVariables } from './template-injector.js';

/**
 * Tool name mappings (Copilot aliases → Claude official names)
 * From TEMPLATE-02B specification
 */
const TOOL_NAME_MAP = {
  'read': 'Read',
  'write': 'Write',
  'edit': 'Edit',
  'bash': 'Bash',
  'execute': 'Bash',        // Copilot alias
  'grep': 'Grep',
  'glob': 'Glob',
  'search': 'Grep',         // Copilot alias
  'task': 'Task',
  'agent': 'Task',          // Copilot alias
  'skill': 'Skill',
  'askuserquestion': 'AskUserQuestion',
  'webfetch': 'WebFetch',
  'websearch': 'WebSearch',
  'lsp': 'LSP',
  'mcpsearch': 'MCPSearch',
  'taskoutput': 'TaskOutput',
  'killshell': 'KillShell',
  'notebookedit': 'NotebookEdit',
  'exitplanmode': 'ExitPlanMode',
  'taskcreate': 'TaskCreate',
  'taskget': 'TaskGet',
  'tasklist': 'TaskList',
  'taskupdate': 'TaskUpdate'
};

/**
 * Normalize tool name to official Claude format
 */
function normalizeToolName(toolName) {
  const lower = toolName.toLowerCase().trim();
  return TOOL_NAME_MAP[lower] || toolName;
}

/**
 * Convert tools array to comma-separated string with proper capitalization
 */
function convertToolsToString(toolsArray) {
  if (!Array.isArray(toolsArray)) {
    return typeof toolsArray === 'string' ? toolsArray : '';
  }
  
  return toolsArray
    .map(tool => normalizeToolName(tool))
    .join(', ');
}

/**
 * Convert arguments array to argument-hint string
 * Examples:
 *   ['domain'] → '[domain]'
 *   ['filename', 'format'] → '[filename] [format]'
 *   [{name: 'domain', ...}] → '[domain]'
 */
function convertArgumentsToHint(argsArray) {
  if (!Array.isArray(argsArray)) {
    return argsArray || '';
  }
  
  return argsArray.map(arg => {
    // Handle both string and object formats
    const argName = typeof arg === 'string' ? arg : (arg.name || arg);
    return `[${argName}]`;
  }).join(' ');
}

/**
 * Apply frontmatter corrections to skill data
 * Implements TEMPLATE-01C specification
 */
export function correctSkillFrontmatter(data) {
  const corrected = { ...data };
  const metadata = {};
  
  // Store unsupported fields in metadata object
  const fieldsToRemove = ['skill_version', 'requires_version', 'platforms', 'metadata'];
  fieldsToRemove.forEach(field => {
    if (corrected[field] !== undefined) {
      metadata[field] = corrected[field];
      delete corrected[field];
    }
  });
  
  // Convert tools array → allowed-tools string
  if (corrected.tools !== undefined) {
    corrected['allowed-tools'] = convertToolsToString(corrected.tools);
    // Store original in metadata for reference (don't put in version.json)
    delete corrected.tools;
  }
  
  // Convert allowed-tools if it exists and is an array
  if (corrected['allowed-tools'] && Array.isArray(corrected['allowed-tools'])) {
    corrected['allowed-tools'] = convertToolsToString(corrected['allowed-tools']);
  }
  
  // Convert arguments → argument-hint
  if (corrected.arguments !== undefined) {
    corrected['argument-hint'] = convertArgumentsToHint(corrected.arguments);
    // Don't store arguments in metadata - used only as reference during conversion
    delete corrected.arguments;
  }
  
  return { corrected, metadata };
}

/**
 * Migrate a single skill
 * @param {string} sourcePath - Path to source skill file (.github/skills/gsd-xx/SKILL.md)
 * @param {string} targetDir - Target directory (templates/skills/)
 * @param {object} validator - Validator instance for error collection
 * @returns {object} - Migration result {success, file, errors}
 */
export async function migrateSkill(sourcePath, targetDir, validator) {
  const skillName = path.basename(path.dirname(sourcePath));
  const targetSkillDir = path.join(targetDir, skillName);
  const targetPath = path.join(targetSkillDir, 'SKILL.md');
  const versionPath = path.join(targetSkillDir, 'version.json');
  
  try {
    // Read source file
    const content = await fs.readFile(sourcePath, 'utf-8');
    
    // Parse frontmatter
    const { data, content: body } = parseFrontmatter(sourcePath, content);
    
    // Apply corrections
    const { corrected, metadata } = correctSkillFrontmatter(data);
    
    // Inject template variables into body
    const injectedBody = injectTemplateVariables(body);
    
    // Validate corrected frontmatter
    const validationErrors = validateFrontmatter(targetPath, corrected, 'skill');
    if (validationErrors.length > 0) {
      validator.addIssues(targetPath, validationErrors);
    }
    
    // Create target directory
    await fs.ensureDir(targetSkillDir);
    
    // Write corrected skill file
    const newContent = matter.stringify(injectedBody, corrected);
    await fs.writeFile(targetPath, newContent, 'utf-8');
    
    // Write version.json (metadata only - no arguments field)
    await fs.writeJson(versionPath, metadata, { spaces: 2 });
    
    return {
      success: true,
      file: targetPath,
      skillName,
      metadata
    };
    
  } catch (err) {
    validator.addError(sourcePath, 'migration', err.message);
    return {
      success: false,
      file: sourcePath,
      error: err.message
    };
  }
}

/**
 * Migrate all skills from source to target directory
 */
export async function migrateAllSkills(sourceDir, targetDir, validator) {
  // Find all skill directories
  const skillDirs = await fs.readdir(sourceDir);
  const skillPaths = [];
  
  for (const dir of skillDirs) {
    if (!dir.startsWith('gsd-')) continue;
    
    const skillPath = path.join(sourceDir, dir, 'SKILL.md');
    if (await fs.pathExists(skillPath)) {
      skillPaths.push(skillPath);
    }
  }
  
  console.log(`Found ${skillPaths.length} skills to migrate`);
  
  // Migrate each skill
  const results = [];
  for (const skillPath of skillPaths) {
    const result = await migrateSkill(skillPath, targetDir, validator);
    results.push(result);
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  return {
    total: results.length,
    successful,
    failed,
    results
  };
}
