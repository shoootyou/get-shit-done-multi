import path from 'node:path';
import fs from 'fs-extra';
import matter from 'gray-matter';
import { parseFrontmatter, validateFrontmatter } from './frontmatter-parser.js';
import { injectTemplateVariables } from './template-injector.js';
import { scanForSkillReferences } from './skill-scanner.js';

/**
 * Tool name mappings (same as skills - from TEMPLATE-02B)
 */
const TOOL_NAME_MAP = {
  'read': 'Read',
  'write': 'Write',
  'edit': 'Edit',
  'bash': 'Bash',
  'execute': 'Bash',
  'grep': 'Grep',
  'glob': 'Glob',
  'search': 'Grep',
  'task': 'Task',
  'agent': 'Task',
  'skill': 'Skill',
  'askuserquestion': 'AskUserQuestion',
  'webfetch': 'WebFetch',
  'websearch': 'WebSearch',
  'lsp': 'LSP',
  'mcpsearch': 'MCPSearch',
  'taskoutput': 'TaskOutput',
  'killshell': 'KillShell',
  'notebookedit': 'NotebookEdit',
  'exitplanmode': 'ExitPlanMode'
};

function normalizeToolName(toolName) {
  const lower = toolName.toLowerCase().trim();
  return TOOL_NAME_MAP[lower] || toolName;
}

function convertToolsToString(toolsArray) {
  if (!Array.isArray(toolsArray)) {
    return typeof toolsArray === 'string' ? toolsArray : '';
  }
  return toolsArray.map(tool => normalizeToolName(tool)).join(', ');
}

/**
 * Apply frontmatter corrections to agent data
 * Implements TEMPLATE-01D specification
 */
export async function correctAgentFrontmatter(data, content, skillsDir) {
  const corrected = { ...data };
  const metadata = {};
  
  // Store unsupported fields in metadata object
  if (corrected.metadata !== undefined) {
    metadata.metadata = corrected.metadata;
    delete corrected.metadata;
  }
  
  // Store version fields if present
  ['skill_version', 'requires_version', 'platforms'].forEach(field => {
    if (corrected[field] !== undefined) {
      metadata[field] = corrected[field];
      delete corrected[field];
    }
  });
  
  // Convert tools array → string
  if (corrected.tools && Array.isArray(corrected.tools)) {
    corrected.tools = convertToolsToString(corrected.tools);
  }
  
  // Auto-generate skills field by scanning content
  const skillRefs = await scanForSkillReferences(content, skillsDir);
  if (skillRefs.length > 0) {
    corrected.skills = skillRefs;
  }
  
  return { corrected, metadata };
}

/**
 * Migrate a single agent
 */
export async function migrateAgent(sourcePath, targetDir, skillsDir, validator) {
  const agentName = path.basename(sourcePath, '.agent.md');
  const targetPath = path.join(targetDir, path.basename(sourcePath));
  
  try {
    // Read source file
    const content = await fs.readFile(sourcePath, 'utf-8');
    
    // Parse frontmatter
    const { data, content: body } = parseFrontmatter(sourcePath, content);
    
    // Apply corrections (pass body content for skill scanning)
    const { corrected, metadata } = await correctAgentFrontmatter(data, body, skillsDir);
    
    // Inject template variables into body
    const injectedBody = injectTemplateVariables(body);
    
    // Validate corrected frontmatter
    const validationErrors = validateFrontmatter(targetPath, corrected, 'agent');
    if (validationErrors.length > 0) {
      validator.addIssues(targetPath, validationErrors);
    }
    
    // Write corrected agent file
    const newContent = matter.stringify(injectedBody, corrected);
    await fs.writeFile(targetPath, newContent, 'utf-8');
    
    return {
      success: true,
      file: targetPath,
      agentName,
      metadata,
      skillsFound: corrected.skills || []
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
 * Migrate all agents from source to target directory
 */
export async function migrateAllAgents(sourceDir, targetDir, skillsDir, validator) {
  // Find all agent files
  const files = await fs.readdir(sourceDir);
  const agentPaths = files
    .filter(f => f.startsWith('gsd-') && f.endsWith('.agent.md'))
    .map(f => path.join(sourceDir, f));
  
  console.log(`Found ${agentPaths.length} agents to migrate`);
  
  // Migrate each agent
  const results = [];
  const versionsData = {};
  
  for (const agentPath of agentPaths) {
    const result = await migrateAgent(agentPath, targetDir, skillsDir, validator);
    results.push(result);
    
    if (result.success && result.metadata) {
      versionsData[result.agentName] = result.metadata;
    }
  }
  
  // Write consolidated versions.json
  const versionsPath = path.join(targetDir, 'versions.json');
  await fs.writeJson(versionsPath, versionsData, { spaces: 2 });
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  return {
    total: results.length,
    successful,
    failed,
    results,
    versionsPath
  };
}
