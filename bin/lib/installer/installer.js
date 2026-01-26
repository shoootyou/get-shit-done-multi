import { copyDirectory, ensureDirectory } from '../io/file-operations.js';
import { normalizeHomePath } from '../paths/path-resolver.js';
import { renderFile, getDefaultVariables } from '../templates/template-renderer.js';
import { validateTemplateDirectory } from '../templates/template-validator.js';
import { progress, success, warning, info } from '../cli/output.js';
import { formatError, isExpectedError } from '../cli/errors.js';
import { detectInstallation } from '../platforms/platform-detector.js';
import { readdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Main installation function that orchestrates the installation process
 * @param {Object} options - Installation options
 * @param {boolean} options.claude - Install to Claude Code
 * @param {boolean} options.local - Install locally (./.claude/) instead of globally (~/.claude/)
 * @param {boolean} options.color - Enable/disable colored output
 * @returns {Promise<void>}
 */
export async function install(options) {
  try {
    // 1. Validate options
    if (!options.claude) {
      throw new Error('Phase 1 requires --claude flag. Other platforms coming in Phase 2.');
    }
    
    const platform = 'claude';
    const scope = options.local ? 'local' : 'global';
    
    // 2. Detect existing installation
    const existing = await detectInstallation(platform, scope);
    if (existing.exists) {
      warning(`Existing installation found at ${existing.path} (${existing.skillCount} skills)`);
      info('Files will be overwritten');
    }
    
    // 3. Validate templates (pre-flight)
    progress('Validating templates...');
    const templateDir = join(__dirname, '../../../templates');
    const validationResult = await validateTemplateDirectory(templateDir, [
      'PLATFORM_ROOT', 'VERSION', 'COMMAND_PREFIX', 
      'INSTALL_DATE', 'USER', 'PLATFORM_NAME'
    ]);
    
    if (validationResult.issueCount > 0) {
      throw new Error(`Template validation failed: ${validationResult.issueCount} issues found`);
    }
    
    // 4. Prepare variables
    const variables = getDefaultVariables();
    
    // 5. Determine target paths
    const targetBase = scope === 'global' 
      ? normalizeHomePath('~/.claude/') 
      : './.claude/';
    const skillsPath = join(targetBase, 'skills/gsd/');
    const agentsPath = join(targetBase, 'agents/');
    const sharedPath = join(targetBase, 'get-shit-done/');
    
    // 6. Create base directories
    progress('Creating directories...');
    await ensureDirectory(skillsPath);
    await ensureDirectory(agentsPath);
    await ensureDirectory(sharedPath);
    
    // 7. Install skills (28 directories)
    progress('Installing skills...');
    const skillsTemplateDir = join(templateDir, 'skills');
    const skillDirs = readdirSync(skillsTemplateDir, { withFileTypes: true })
      .filter(e => e.isDirectory());
    
    for (const skillDir of skillDirs) {
      const srcPath = join(skillsTemplateDir, skillDir.name);
      const destPath = join(skillsPath, skillDir.name);
      
      // Copy directory structure
      await ensureDirectory(destPath);
      
      // Render and copy SKILL.md
      const skillFile = join(srcPath, 'SKILL.md');
      const renderedContent = await renderFile(skillFile, variables);
      const destFile = join(destPath, 'SKILL.md');
      
      writeFileSync(destFile, renderedContent, 'utf-8');
    }
    
    // 8. Install agents (13 flat files)
    progress('Installing agents...');
    const agentsTemplateDir = join(templateDir, 'agents');
    const agentFiles = readdirSync(agentsTemplateDir)
      .filter(f => f.endsWith('.agent.md'));
    
    for (const agentFile of agentFiles) {
      const srcPath = join(agentsTemplateDir, agentFile);
      const renderedContent = await renderFile(srcPath, variables);
      const destFile = join(agentsPath, agentFile);
      
      writeFileSync(destFile, renderedContent, 'utf-8');
    }
    
    // 9. Copy shared directory
    progress('Installing shared resources...');
    const sharedTemplateDir = join(templateDir, 'get-shit-done');
    await copyDirectory(sharedTemplateDir, sharedPath);
    
    // 10. Report success
    success('Installation complete!', {
      installedTo: scope === 'global' ? '~/.claude/' : './.claude/',
      skills: skillDirs.length,
      agents: agentFiles.length
    });
    
    // Show next steps from CONTEXT.md
    console.log('\nNext steps:');
    console.log('- Restart Claude Code or reload skills');
    console.log('- Run /gsd-new-project to start a new project');
    
  } catch (error) {
    if (isExpectedError(error)) {
      console.error(formatError(error));
    } else {
      console.error(`✗ Installation failed: ${error.message}`);
    }
    throw error;
  }
}
