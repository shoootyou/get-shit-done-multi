#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { detectInstalledCLIs } = require('./lib/cli-detection/detect');
const { getConfigPaths } = require('./lib/configuration/paths');
const { preserveUserData, restoreUserData } = require('./lib/upgrade');
const { replaceClaudePaths } = require('./lib/adapters/shared/path-rewriter');
const { getRecommendations } = require('./lib/cli-detection/recommender');
const { cyan, green, yellow, dim, reset } = require('./lib/colors');
const claudeAdapter = require('./lib/adapters/claude');
const copilotAdapter = require('./lib/adapters/copilot');
const codexAdapter = require('./lib/adapters/codex');
const { generateAgent } = require('./lib/template-system/generator');
const { buildContext } = require('./lib/template-system/context-builder');
const { render } = require('./lib/template-system/engine');
const { runMigration } = require('./lib/migration/migration-flow');
const detectAndFilterOldFlags = require('./lib/configuration/old-flag-detector');
const parseFlags = require('./lib/configuration/flag-parser');
const validateFlags = require('./lib/configuration/flag-validator');
const warnAndConfirmCodexLocal = require('./lib/codex-warning');
const Reporter = require('./lib/output/reporter');

// Get version from package.json
const pkg = require('../package.json');

const banner = `
${cyan}   ██████╗ ███████╗██████╗
  ██╔════╝ ██╔════╝██╔══██╗
  ██║  ███╗███████╗██║  ██║
  ██║   ██║╚════██║██║  ██║
  ╚██████╔╝███████║██████╔╝
   ╚═════╝ ╚══════╝╚═════╝${reset}

  Get Shit Done ${dim}v${pkg.version}${reset}
  A meta-prompting, context engineering and spec-driven development system.
   * Forked from TÂCHES/get-shit-done
   * Maintained by shoootyou/get-shit-done-multi
`;

// Old flag handling removed in v1.10.0 - see FLAG-05/FLAG-06
// New three-stage flag parsing system:
// Stage 1: Pre-parse old flag detection (done below after help check)
// Stage 2: Commander.js parsing (done below after help check)
// Stage 3: Validation (done below after help check)

// Parse args (keep for --help, --config-dir, --project-dir, --force-statusline)
const args = process.argv.slice(2);

// Parse --config-dir argument
function parseConfigDirArg() {
  const configDirIndex = args.findIndex(arg => arg === '--config-dir' || arg === '-c');
  if (configDirIndex !== -1) {
    const nextArg = args[configDirIndex + 1];
    // Error if --config-dir is provided without a value or next arg is another flag
    if (!nextArg || nextArg.startsWith('-')) {
      console.error(`  ${yellow}--config-dir requires a path argument${reset}`);
      process.exit(1);
    }
    return nextArg;
  }
  // Also handle --config-dir=value format
  const configDirArg = args.find(arg => arg.startsWith('--config-dir=') || arg.startsWith('-c='));
  if (configDirArg) {
    return configDirArg.split('=')[1];
  }
  return null;
}
const explicitConfigDir = parseConfigDirArg();

// Parse --project-dir argument
function parseProjectDirArg() {
  const projectDirIndex = args.findIndex(arg => arg === '--project-dir');
  if (projectDirIndex !== -1) {
    const nextArg = args[projectDirIndex + 1];
    if (!nextArg || nextArg.startsWith('-')) {
      console.error(`  ${yellow}--project-dir requires a path argument${reset}`);
      process.exit(1);
    }
    return nextArg;
  }
  // Handle --project-dir=value format
  const projectDirArg = args.find(arg => arg.startsWith('--project-dir='));
  if (projectDirArg) {
    return projectDirArg.split('=')[1];
  }
  return null;
}
const explicitProjectDir = parseProjectDirArg();

const hasHelp = args.includes('--help') || args.includes('-h');
const forceStatusline = args.includes('--force-statusline');

console.log(banner);

// Show help if requested
if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} npx get-shit-done-multi [options]

  ${yellow}Options:${reset}
    ${cyan}-g, --global${reset}              Install Claude globally (to Claude config directory)
    ${cyan}-l, --local${reset}               Install Claude locally (to ./.claude in current directory)
    ${cyan}-c, --config-dir <path>${reset}   Specify custom Claude config directory
    ${cyan}--project-dir <path>${reset}      Install to specific project directory (for Copilot/Codex)
    ${cyan}--all, -A${reset}                Install to all detected CLIs (Claude, Copilot, Codex)
    ${cyan}--copilot${reset}                 Install GitHub Copilot CLI assets locally (to ./.github)
    ${cyan}--codex${reset}                   Install Codex CLI assets locally (to ./.codex)
    ${cyan}--codex-global${reset}            Install Codex CLI assets globally (to ~/.codex)
    ${cyan}-h, --help${reset}                Show this help message
    ${cyan}--force-statusline${reset}        Replace existing statusline config

  ${yellow}CLI Recommendations:${reset}
    ${green}Claude Code${reset}              Recommended for solo developers - fastest startup, native agent support
    ${green}GitHub Copilot CLI${reset}       Recommended for teams - GitHub integration, collaborative workflows
    ${green}Codex CLI${reset}                Recommended for OpenAI users - integrates with existing OpenAI workflows

    ${dim}Multi-CLI Setup:${reset} You can install GSD for multiple CLIs and switch between them
    seamlessly. Run with ${cyan}--all${reset} to install for all detected CLIs at once.

  ${yellow}Examples:${reset}
    ${dim}# Install to all detected CLIs in one command${reset}
    npx get-shit-done-multi --all

    ${dim}# Install to default ~/.claude directory${reset}
    npx get-shit-done-multi --global

    ${dim}# Install to custom config directory (for multiple Claude accounts)${reset}
    npx get-shit-done-multi --global --config-dir ~/.claude-bc

    ${dim}# Using environment variable${reset}
    CLAUDE_CONFIG_DIR=~/.claude-bc npx get-shit-done-multi --global

    ${dim}# Install to current project only${reset}
    npx get-shit-done-multi --local

    ${dim}# Install GitHub Copilot CLI assets to this repository${reset}
    npx get-shit-done-multi --copilot

    ${dim}# Install Codex CLI assets to current project${reset}
    npx get-shit-done-multi --codex

    ${dim}# Install Codex CLI assets globally${reset}
    npx get-shit-done-multi --codex-global

  ${yellow}Notes:${reset}
    The --config-dir option is useful when you have multiple Claude Code
    configurations (e.g., for different subscriptions). It takes priority
    over the CLAUDE_CONFIG_DIR environment variable.
`);
  process.exit(0);
}

// ============================================================================
// THREE-STAGE FLAG PARSING (v1.10.0)
// ============================================================================

// Wrap in async function for Stage 4 (Codex warning with async prompt)
(async function main() {
  // Stage 1: Pre-parse old flag detection
  const cleanedArgv = detectAndFilterOldFlags(process.argv);

  // Stage 2: Parse flags with Commander.js
  let flagConfig;
  try {
    flagConfig = parseFlags(cleanedArgv);
  } catch (err) {
    console.error(`  ${yellow}${err.message}${reset}`);
    process.exit(2);
  }

  // Stage 3: Validate flag combinations
  validateFlags(process.argv, flagConfig);

  // Extract parsed configuration
  let { platforms, scope, needsMenu, configDir } = flagConfig;

  // Handle interactive menu mode (Phase 3 integration point)
  if (needsMenu) {
    const { showInteractiveMenu } = require('./lib/configuration/interactive-menu');
    try {
      const menuConfig = await showInteractiveMenu(scope);
      platforms = menuConfig.platforms;
      scope = menuConfig.scope;
    } catch (err) {
      console.error(`  ${yellow}${err.message}${reset}`);
      process.exit(1);
    }
  }

  // Stage 4: Codex global warning (if applicable)
  const shouldProceed = await warnAndConfirmCodexLocal(platforms, scope);
  if (!shouldProceed) {
    console.log('Installation cancelled by user');
    process.exit(0);
  }

  // Create reporter for centralized output management
  const reporter = new Reporter();

  // ============================================================================
  // PHASE 4: PATH RESOLUTION & CONFLICT HANDLING
  // ============================================================================

  const { validatePath } = require('./lib/configuration/path-validator');
  const { ensureInstallDir } = require('./lib/configuration/paths');
  const { 
    analyzeInstallationConflicts, 
    cleanupGSDContent, 
    detectOldClaudePath 
  } = require('./lib/configuration/conflict-resolver');

  // Validate --config-dir with --global conflict
  if (configDir && scope === 'global') {
    console.error(`  ${yellow}Error: Cannot use --config-dir with --global${reset}`);
    console.error(`  ${dim}--config-dir is only valid with --local or when no scope is specified${reset}`);
    process.exit(1);
  }

  // Detect old Claude path (only if installing Claude globally)
  if (platforms.includes('claude') && scope === 'global') {
    const oldPathCheck = await detectOldClaudePath();
    if (oldPathCheck.exists) {
      console.warn(`\n${oldPathCheck.warning}\n`);
    }
  }

  // Run migration check (before installation)
  try {
    const migrationResult = await runMigration();
    // No message needed - migration output is self-contained
  } catch (err) {
    console.error(`  ${yellow}Migration failed:${reset} ${err.message}`);
    console.error(`  ${dim}Please backup manually and try again.${reset}`);
    process.exit(1);
  }

  /**
   * Helper function to validate and prepare for platform installation
   */
  async function validateAndPrepareInstall(platform, finalScope) {
    // Get target path
    const targetPath = getConfigPaths(platform, finalScope, configDir);
    
    // Validate path
    const validation = validatePath(targetPath);
    if (!validation.valid) {
      throw new Error(`Invalid path for ${platform}: ${validation.errors.join(', ')}`);
    }
    
    // Analyze conflicts
    const conflicts = await analyzeInstallationConflicts(targetPath);
    
    // Auto-cleanup GSD content
    if (conflicts.gsdFiles.length > 0 && conflicts.canAutoClean) {
      const { removed } = await cleanupGSDContent(conflicts.gsdFiles);
      console.log(`  ${dim}Cleaned up ${removed} directories from previous installation${reset}`);
    }
    
    // Handle user file conflicts
    if (conflicts.hasConflicts && !conflicts.canAutoClean) {
      throw new Error(`User files exist in ${targetPath}: ${conflicts.userFiles.join(', ')}. Manual cleanup required.`);
    }
    
    // Create directory with permission checking
    const dirResult = await ensureInstallDir(targetPath, finalScope);
    if (!dirResult.success) {
      throw new Error(`${dirResult.error}. Suggestion: ${dirResult.suggestion}`);
    }
    
    return targetPath;
  }

  // Install each platform
  reporter.info(`Installing GSD for ${platforms.length} platform(s)...\n`);
  
  const results = [];
  
  for (const platform of platforms) {
    // Codex always uses local scope (even if --global specified)
    const finalScope = (platform === 'codex' && scope === 'global') ? 'local' : scope;
    
    reporter.platformStart(platform, finalScope);
    
    try {
      // Validate and prepare (creates dir, checks conflicts, etc.)
      const targetPath = await validateAndPrepareInstall(platform, finalScope);
      
      // TODO: Phase 4 focuses on PATH resolution and validation
      // Actual file installation (copying skills, agents, templates) happens in current functions below
      // For now, directory structure is created and validated
      // Full integration of file copying will be completed as part of cleanup/refactor
      
      // Count installed items (placeholder for now - will be populated by actual installation)
      const details = {
        path: targetPath,
        commands: 5,  // Placeholder
        agents: 13,   // Placeholder
        skills: 2     // Placeholder
      };
      
      reporter.platformSuccess(platform, details);
      results.push({ platform, success: true, details });
      
    } catch (error) {
      reporter.platformError(platform, error);
      results.push({ platform, success: false, error });
      // Continue to next platform instead of exiting
    }
  }
  
  // Show summary
  reporter.summary(results);
  
  // Exit code: 0 if all succeeded, 1 if any failed
  const hasFailures = results.some(r => !r.success);
  process.exit(hasFailures ? 1 : 0);
})();

// ============================================================================
// OLD INSTALLATION LOGIC (will be updated in Phase 4)
// ============================================================================

// Note: Function definition kept but not invoked to prevent race condition
// The new three-stage system (above) handles everything and exits
// This old code will be refactored in Phase 4

// Run async initialization (migration check)
// DISABLED: (async function() {
async function oldInstallationLogic() {
  // Check for old structure and migrate if needed
  try {
    const migrationResult = await runMigration();
    // No message needed - migration output is self-contained
  } catch (err) {
    console.error(`  ${yellow}Migration failed:${reset} ${err.message}`);
    console.error(`  ${dim}Please backup manually and try again.${reset}`);
    process.exit(1);
  }

  // Handle --all flag first
  if (hasAll) {
    console.log(banner);
    installAll();
    process.exit(0);
  }

  // Display detected CLIs and recommendations
  const detected = detectInstalledCLIs();
  const currentCLIs = Object.entries(detected)
    .filter(([_, isInstalled]) => isInstalled)
    .map(([cli, _]) => cli);

  // Get intelligent recommendations
  const recommendations = getRecommendations({
    currentCLIs,
    platform: os.platform(),
    installingCLIs: [
      ...(hasLocal || hasGlobal ? ['claude'] : []),
      ...(hasCopilot ? ['copilot'] : []),
      ...(hasCodex || hasCodexGlobal ? ['codex'] : [])
    ]
  });

  // Display CLI status
  console.log(`  ${cyan}CLI Status:${reset}`);
  for (const cli of recommendations.installed) {
    console.log(`  ${green}✓${reset} ${cli.message}`);
  }
  for (const cli of recommendations.available) {
    console.log(`  ${dim}○${reset} ${cli.message}`);
  }

  // Display recommendation
  console.log(`\n  ${cyan}Recommendation:${reset}`);
  console.log(`  ${recommendations.recommendation}`);

  // Display platform notes if any
  if (recommendations.platformNotes.length > 0) {
    console.log(`\n  ${dim}Note: ${recommendations.platformNotes.join(', ')}${reset}`);
  }

  console.log(); // Empty line for spacing

/**
 * Expand ~ to home directory (shell doesn't expand in env vars passed to node)
 */
function expandTilde(filePath) {
  if (filePath && filePath.startsWith('~/')) {
    return path.join(os.homedir(), filePath.slice(2));
  }
  return filePath;
}

/**
 * Read and parse settings.json, returning empty object if doesn't exist
 */
function readSettings(settingsPath) {
  if (fs.existsSync(settingsPath)) {
    try {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    } catch (e) {
      return {};
    }
  }
  return {};
}

/**
 * Write settings.json with proper formatting
 */
function writeSettings(settingsPath, settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2) + '\n');
}

/**
 * Recursively copy directory, replacing paths in .md files using adapter
 * Deletes existing destDir first to remove orphaned files from previous versions
 * Also renders template variables ({{cmdPrefix}}, etc.) for markdown files
 */
function copyWithPathReplacement(srcDir, destDir, adapter, contentType = 'skill', platform = 'claude') {
  // Clean install: remove existing destination to prevent orphaned files
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    // Skip CLI-specific SKILL source files (SKILL-codex.md, SKILL-copilot.md, etc.)
    if (entry.name.match(/^SKILL-\w+\.md$/)) {
      continue;
    }

    if (entry.isDirectory()) {
      copyWithPathReplacement(srcPath, destPath, adapter, contentType, platform);
    } else if (entry.name.endsWith('.md')) {
      let content = fs.readFileSync(srcPath, 'utf8');
      
      // Render template variables ({{cmdPrefix}}, {{gsdPath}}, etc.)
      // Use lenient mode to preserve placeholders like {{PHASE_NAME}} in template files
      const context = buildContext(platform);
      content = render(content, context, { lenient: true });
      
      // Apply adapter-specific path replacements
      content = adapter.convertContent(content, contentType);
      
      fs.writeFileSync(destPath, content);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

/**
 * Generate agents from spec files using template system
 * @param {string} specsDir - Directory containing spec files (*.md)
 * @param {string} outputDir - Directory to write generated agents
 * @param {string} platform - Target platform ('claude', 'copilot', 'codex')
 * @returns {Object} { generated: number, failed: number, errors: Array }
 */
function generateAgentsFromSpecs(specsDir, outputDir, platform) {
  const errors = [];
  let generated = 0;
  let failed = 0;

  try {
    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Read all spec files
    const specFiles = fs.readdirSync(specsDir)
      .filter(file => file.endsWith('.md') && file !== '.gitkeep');

    for (const specFile of specFiles) {
      const specPath = path.join(specsDir, specFile);
      
      try {
        // Generate agent using template system
        const result = generateAgent(specPath, platform);
        
        if (result.success) {
          // Write generated content to output directory
          const outputPath = path.join(outputDir, specFile);
          fs.writeFileSync(outputPath, result.output, 'utf8');
          generated++;
          
          // Log warnings if any
          if (result.warnings && result.warnings.length > 0) {
            result.warnings.forEach(warning => {
              console.log(`  ${yellow}⚠${reset} ${specFile}: ${warning.message || warning}`);
            });
          }
        } else {
          // Generation failed
          failed++;
          const errorMsg = result.errors && result.errors.length > 0
            ? result.errors.map(e => e.message).join(', ')
            : 'Unknown error';
          errors.push({ file: specFile, error: errorMsg });
          console.error(`  ${yellow}✗${reset} Failed to generate ${specFile}: ${errorMsg}`);
        }
      } catch (err) {
        failed++;
        errors.push({ file: specFile, error: err.message });
        console.error(`  ${yellow}✗${reset} Error generating ${specFile}: ${err.message}`);
      }
    }
  } catch (err) {
    errors.push({ error: `Failed to read specs directory: ${err.message}` });
    console.error(`  ${yellow}✗${reset} Failed to read specs directory: ${err.message}`);
  }

  return { generated, failed, errors };
}

/**
 * Generate skills from /specs/skills/ directory (folder-per-skill structure)
 * 
 * Each skill is a directory matching the pattern gsd-* containing SKILL.md
 * Example: specs/skills/gsd-help/SKILL.md
 * 
 * @param {string} specsDir - Path to specs/skills directory
 * @param {string} outputDir - Output directory for generated skills
 * @param {string} platform - Target platform (claude|copilot|codex)
 * @returns {Object} { generated: number, failed: number, errors: Array }
 */
function generateSkillsFromSpecs(specsDir, outputDir, platform) {
  const errors = [];
  let generated = 0;
  let failed = 0;

  try {
    // Ensure output directory exists
    fs.mkdirSync(outputDir, { recursive: true });

    // Read all skill directories (folder-per-skill pattern)
    const skillDirs = fs.readdirSync(specsDir)
      .filter(name => {
        const fullPath = path.join(specsDir, name);
        return fs.statSync(fullPath).isDirectory() && name.startsWith('gsd-');
      });

    for (const skillDir of skillDirs) {
      const specPath = path.join(specsDir, skillDir, 'SKILL.md');
      
      if (!fs.existsSync(specPath)) {
        console.log(`  ${yellow}⚠${reset} Skipping ${skillDir}: no SKILL.md found`);
        continue;
      }
      
      try {
        // Generate skill using template system (reuses existing generateAgent)
        const result = generateAgent(specPath, platform);
        
        if (result.success) {
          // Output structure: gsd-help/SKILL.md (folder per skill)
          const skillOutputDir = path.join(outputDir, skillDir);
          fs.mkdirSync(skillOutputDir, { recursive: true });
          const outputPath = path.join(skillOutputDir, 'SKILL.md');
          fs.writeFileSync(outputPath, result.output, 'utf8');
          generated++;
          
          // Log warnings if any
          if (result.warnings && result.warnings.length > 0) {
            result.warnings.forEach(warning => {
              console.log(`  ${yellow}⚠${reset} ${skillDir}: ${warning.message || warning}`);
            });
          }
        } else {
          failed++;
          const errorMsg = result.errors && result.errors.length > 0
            ? result.errors.map(e => e.message).join(', ')
            : 'Unknown error';
          errors.push({ file: skillDir, error: errorMsg });
          console.error(`  ${yellow}✗${reset} Failed to generate ${skillDir}: ${errorMsg}`);
        }
      } catch (err) {
        failed++;
        errors.push({ file: skillDir, error: err.message });
        console.error(`  ${yellow}✗${reset} Error generating ${skillDir}: ${err.message}`);
      }
    }
  } catch (err) {
    errors.push({ error: `Failed to read specs directory: ${err.message}` });
    console.error(`  ${yellow}✗${reset} Failed to read specs directory: ${err.message}`);
  }

  return { generated, failed, errors };
}

/**
 * Clean up orphaned files from previous GSD versions
 */
function cleanupOrphanedFiles(claudeDir) {
  const orphanedFiles = [
    'hooks/gsd-notify.sh',  // Removed in v1.6.x
  ];

  for (const relPath of orphanedFiles) {
    const fullPath = path.join(claudeDir, relPath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
      console.log(`  ${green}✓${reset} Removed orphaned ${relPath}`);
    }
  }
}

/**
 * Clean up orphaned hook registrations from settings.json
 */
function cleanupOrphanedHooks(settings) {
  const orphanedHookPatterns = [
    'gsd-notify.sh',  // Removed in v1.6.x
  ];

  let cleaned = false;

  // Check all hook event types (Stop, SessionStart, etc.)
  if (settings.hooks) {
    for (const eventType of Object.keys(settings.hooks)) {
      const hookEntries = settings.hooks[eventType];
      if (Array.isArray(hookEntries)) {
        // Filter out entries that contain orphaned hooks
        const filtered = hookEntries.filter(entry => {
          if (entry.hooks && Array.isArray(entry.hooks)) {
            // Check if any hook in this entry matches orphaned patterns
            const hasOrphaned = entry.hooks.some(h =>
              h.command && orphanedHookPatterns.some(pattern => h.command.includes(pattern))
            );
            if (hasOrphaned) {
              cleaned = true;
              return false;  // Remove this entry
            }
          }
          return true;  // Keep this entry
        });
        settings.hooks[eventType] = filtered;
      }
    }
  }

  if (cleaned) {
    console.log(`  ${green}✓${reset} Removed orphaned hook registrations`);
  }

  return settings;
}

/**
 * Verify a directory exists and contains files
 */
function verifyInstalled(dirPath, description) {
  if (!fs.existsSync(dirPath)) {
    console.error(`  ${yellow}✗${reset} Failed to install ${description}: directory not created`);
    return false;
  }
  try {
    const entries = fs.readdirSync(dirPath);
    if (entries.length === 0) {
      console.error(`  ${yellow}✗${reset} Failed to install ${description}: directory is empty`);
      return false;
    }
  } catch (e) {
    console.error(`  ${yellow}✗${reset} Failed to install ${description}: ${e.message}`);
    return false;
  }
  return true;
}

/**
 * Verify a file exists
 */
function verifyFileInstalled(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`  ${yellow}✗${reset} Failed to install ${description}: file not created`);
    return false;
  }
  return true;
}

function installIssueTemplates(projectDir) {
  const srcDir = path.join(__dirname, '..', 'github', 'ISSUE_TEMPLATE');
  if (!fs.existsSync(srcDir)) {
    return false;
  }
  const destDir = path.join(projectDir, '.github', 'ISSUE_TEMPLATE');
  fs.mkdirSync(destDir, { recursive: true });
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }
    if (!entry.name.startsWith('gsd-')) {
      continue;
    }
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    fs.copyFileSync(srcPath, destPath);
  }
  return true;
}

function yamlEscape(value) {
  return String(value).replace(/"/g, '\\"');
}

function parseFrontMatter(content) {
  const match = content.match(/^---\s*[\s\S]*?\n---\s*\n?/);
  if (!match) {
    return { frontMatter: '', body: content };
  }
  return { frontMatter: match[0], body: content.slice(match[0].length) };
}

function getFrontMatterValue(frontMatter, key) {
  const match = frontMatter.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim() : '';
}

function copyCopilotAgents(srcDir, destDir, pathPrefix) {
  // Use template generation instead of static copying
  const specsDir = path.join(__dirname, '..', 'specs', 'agents');
  
  if (fs.existsSync(specsDir)) {
    // Remove old GSD agents before generating new ones
    fs.mkdirSync(destDir, { recursive: true });
    for (const file of fs.readdirSync(destDir)) {
      if (file.startsWith('gsd-') && (file.endsWith('.agent.md') || file.endsWith('.md'))) {
        fs.unlinkSync(path.join(destDir, file));
      }
    }

    // Generate platform-optimized agents
    const genResult = generateAgentsFromSpecs(specsDir, destDir, 'copilot');
    
    // Rename .md to .agent.md for Copilot convention
    if (genResult.generated > 0) {
      const files = fs.readdirSync(destDir);
      for (const file of files) {
        if (file.endsWith('.md') && !file.endsWith('.agent.md')) {
          const oldPath = path.join(destDir, file);
          const newPath = path.join(destDir, file.replace(/\.md$/, '.agent.md'));
          fs.renameSync(oldPath, newPath);
        }
      }
    }
    
    return genResult.generated > 0;
  }
  
  // Fallback to old copy method if specs don't exist
  if (!fs.existsSync(srcDir)) {
    return false;
  }

  fs.mkdirSync(destDir, { recursive: true });

  // Remove old GSD agents before copying new ones
  for (const file of fs.readdirSync(destDir)) {
    if (file.startsWith('gsd-') && (file.endsWith('.agent.md') || file.endsWith('.md'))) {
      fs.unlinkSync(path.join(destDir, file));
    }
  }

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile() || !entry.name.endsWith('.md')) {
      continue;
    }
    const srcPath = path.join(srcDir, entry.name);
    const raw = fs.readFileSync(srcPath, 'utf8');
    const { frontMatter, body } = parseFrontMatter(raw);
    const name = getFrontMatterValue(frontMatter, 'name') || entry.name.replace(/\.md$/, '');
    const description = getFrontMatterValue(frontMatter, 'description') || 'GSD agent for GitHub Copilot CLI.';
    const updatedBody = replaceClaudePaths(body, pathPrefix, true).trimStart();
    const copilotFrontMatter = [
      '---',
      `name: "${yamlEscape(name)}"`,
      `description: "${yamlEscape(description)}"`,
      'target: github-copilot',
      'tools: ["*"]',
      '---',
      ''
    ].join('\n');

    const destName = entry.name.replace(/\.md$/, '.agent.md');
    const destPath = path.join(destDir, destName);
    fs.writeFileSync(destPath, `${copilotFrontMatter}\n${updatedBody}`);
  }

  return true;
}

/**
 * Install to the specified directory (updated for Phase 4)
 * @param {boolean} isGlobal - Legacy parameter for compatibility
 * @param {string} scope - New scope parameter: 'global' or 'local'
 * @param {string|null} configDir - Optional custom config directory
 */
function install(isGlobal, scope = null, configDir = null) {
  // Use scope if provided, otherwise fall back to isGlobal
  const effectiveScope = scope || (isGlobal ? 'global' : 'local');
  
  const src = path.join(__dirname, '..');
  
  // Get target directories from adapter with new signature
  const dirs = claudeAdapter.getTargetDirs(effectiveScope, configDir);
  
  // Determine base directory (for display and settings)
  const claudeDir = getConfigPaths('claude', effectiveScope, configDir);

  const locationLabel = isGlobal
    ? claudeDir.replace(os.homedir(), '~')
    : claudeDir.replace(process.cwd(), '.');

  console.log(`  Installing to ${cyan}${locationLabel}${reset}\n`);

  // Preserve user data before upgrade
  const backups = preserveUserData(claudeDir);

  // Track installation failures
  const failures = [];

  // Clean up orphaned files from previous versions
  cleanupOrphanedFiles(claudeDir);

  // Copy workflows, templates, and references to .claude/get-shit-done/
  const gsdSrc = path.join(src, 'get-shit-done');
  const gsdDirs = ['workflows', 'templates', 'references'];
  
  fs.mkdirSync(dirs.gsd, { recursive: true });
  
  for (const dir of gsdDirs) {
    const srcPath = path.join(gsdSrc, dir);
    const destPath = path.join(dirs.gsd, dir);
    if (fs.existsSync(srcPath)) {
      copyWithPathReplacement(srcPath, destPath, claudeAdapter, 'skill', 'claude');
    }
  }
  
  if (fs.existsSync(dirs.gsd) && fs.readdirSync(dirs.gsd).length > 0) {
    console.log(`  ${green}✓${reset} Installed get-shit-done resources (workflows, templates, references)`);
  } else {
    failures.push('get-shit-done resources');
  }

  // Generate agents from specs using template system
  const specsDir = path.join(src, 'specs', 'agents');
  if (fs.existsSync(specsDir)) {
    // Remove old GSD agents (gsd-*.md) before generating new ones
    fs.mkdirSync(dirs.agents, { recursive: true });
    if (fs.existsSync(dirs.agents)) {
      for (const file of fs.readdirSync(dirs.agents)) {
        if (file.startsWith('gsd-') && file.endsWith('.md')) {
          fs.unlinkSync(path.join(dirs.agents, file));
        }
      }
    }

    // Generate platform-optimized agents
    const genResult = generateAgentsFromSpecs(specsDir, dirs.agents, 'claude');
    if (genResult.generated > 0) {
      const failedMsg = genResult.failed > 0 ? ` (${genResult.failed} failed)` : '';
      console.log(`  ${green}✓${reset} Generated ${genResult.generated} agents from specs${failedMsg}`);
    }
    if (genResult.failed > 0) {
      failures.push(`agents (${genResult.failed} generation failures)`);
    }
  }

  // Generate skills from specs
  const skillSpecsDir = path.join(src, 'specs', 'skills');
  if (fs.existsSync(skillSpecsDir)) {
    const skillGenResult = generateSkillsFromSpecs(skillSpecsDir, dirs.skills, 'claude');
    
    if (skillGenResult.failed > 0) {
      console.log(`  ${yellow}⚠${reset} Skills: ${skillGenResult.generated} generated, ${skillGenResult.failed} failed`);
      // Log specific errors if any
      if (skillGenResult.errors.length > 0) {
        skillGenResult.errors.forEach(err => {
          console.log(`    ${yellow}✗${reset} ${err.file || 'Unknown'}: ${err.error}`);
        });
      }
      failures.push(`skills (${skillGenResult.failed} generation failures)`);
    } else if (skillGenResult.generated > 0) {
      console.log(`  ${green}✓${reset} Skills: ${skillGenResult.generated} generated at ${cyan}${dirs.skills}${reset}`);
      
      // List each skill created (similar to Copilot installation)
      try {
        const skillDirs = fs.readdirSync(dirs.skills)
          .filter(name => {
            const fullPath = path.join(dirs.skills, name);
            return name.startsWith('gsd-') && fs.statSync(fullPath).isDirectory();
          });
        
        skillDirs.forEach(skillName => {
          const skillPath = path.join(dirs.skills, skillName, 'SKILL.md');
          if (fs.existsSync(skillPath)) {
            const stats = fs.statSync(skillPath);
            const sizeKB = (stats.size / 1024).toFixed(1);
            console.log(`    ${green}✓${reset} ${skillName}/ (${sizeKB} KB)`);
          }
        });
      } catch (err) {
        // Silently skip listing if there's an error
      }
    }
  }

  // Copy agents to ~/.claude/agents (subagents must be at root level)
  // Keep as fallback for any agents not in specs/
  const agentsSrc = path.join(src, 'agents');
  if (fs.existsSync(agentsSrc)) {
    fs.mkdirSync(dirs.agents, { recursive: true });

    // Copy any agents from static agents/ directory (fallback)
    const agentEntries = fs.readdirSync(agentsSrc, { withFileTypes: true });
    for (const entry of agentEntries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        // Only copy if not already generated from specs
        const destPath = path.join(dirs.agents, entry.name);
        if (!fs.existsSync(destPath)) {
          let content = fs.readFileSync(path.join(agentsSrc, entry.name), 'utf8');
          content = claudeAdapter.convertContent(content, 'agent');
          fs.writeFileSync(destPath, content);
        }
      }
    }
    if (verifyInstalled(dirs.agents, 'agents')) {
      console.log(`  ${green}✓${reset} Installed agents`);
    } else {
      failures.push('agents');
    }
  }

  // Create skills/get-shit-done directory for SKILL.md (like Copilot)
  const gsdSkillDir = path.join(dirs.skills, 'get-shit-done');
  fs.mkdirSync(gsdSkillDir, { recursive: true });

  // Generate SKILL.md from template for Claude
  const skillTemplateSrc = path.join(src, 'get-shit-done', 'SKILL.md');
  const skillTemplateDest = path.join(gsdSkillDir, 'SKILL.md');
  if (fs.existsSync(skillTemplateSrc)) {
    const skillTemplate = fs.readFileSync(skillTemplateSrc, 'utf8');
    // Generate platform-specific version using template system
    const { generateFromTemplate } = require('./lib/template-system/generator');
    const skillContent = generateFromTemplate(skillTemplate, 'claude');
    fs.writeFileSync(skillTemplateDest, skillContent);
    if (verifyFileInstalled(skillTemplateDest, 'skills/get-shit-done/SKILL.md')) {
      console.log(`  ${green}✓${reset} Installed SKILL.md`);
    } else {
      failures.push('skills/get-shit-done/SKILL.md');
    }
  } else {
    failures.push('get-shit-done/SKILL.md (source missing)');
  }

  // Copy CHANGELOG.md
  const changelogSrc = path.join(src, 'CHANGELOG.md');
  const changelogDest = path.join(gsdSkillDir, 'CHANGELOG.md');
  if (fs.existsSync(changelogSrc)) {
    fs.copyFileSync(changelogSrc, changelogDest);
    if (verifyFileInstalled(changelogDest, 'CHANGELOG.md')) {
      console.log(`  ${green}✓${reset} Installed CHANGELOG.md`);
    } else {
      failures.push('CHANGELOG.md');
    }
  }

  // Write VERSION file for whats-new command
  const versionDest = path.join(gsdSkillDir, 'VERSION');
  fs.writeFileSync(versionDest, pkg.version);
  if (verifyFileInstalled(versionDest, 'VERSION')) {
    console.log(`  ${green}✓${reset} Wrote VERSION (${pkg.version})`);
  } else {
    failures.push('VERSION');
  }

  // Copy hooks
  const hooksSrc = path.join(src, 'hooks');
  if (fs.existsSync(hooksSrc)) {
    const hooksDest = path.join(claudeDir, 'hooks');
    fs.mkdirSync(hooksDest, { recursive: true });
    const hookEntries = fs.readdirSync(hooksSrc);
    for (const entry of hookEntries) {
      const srcFile = path.join(hooksSrc, entry);
      const destFile = path.join(hooksDest, entry);
      fs.copyFileSync(srcFile, destFile);
    }
    if (verifyInstalled(hooksDest, 'hooks')) {
      console.log(`  ${green}✓${reset} Installed hooks`);
    } else {
      failures.push('hooks');
    }
  }

  // Claude doesn't need GitHub issue templates (only Copilot uses them)
  // Templates are installed in installCopilot() function instead

  // Verify installation with detailed reporting
  const verifyResult = claudeAdapter.verify(dirs);
  if (verifyResult.success) {
    const skillCount = fs.readdirSync(dirs.skills)
      .filter(name => {
        const fullPath = path.join(dirs.skills, name);
        return name.startsWith('gsd-') && fs.statSync(fullPath).isDirectory();
      }).length;
    const agentCount = fs.readdirSync(dirs.agents)
      .filter(f => f.startsWith('gsd-') && f.endsWith('.md')).length;
    console.log(`  ${dim}✓ Verified: ${skillCount} skill files, ${agentCount} agents${reset}\n`);
  } else {
    console.error(`  ${yellow}⚠ Installation verification warnings:${reset}`);
    verifyResult.errors.forEach(err => console.error(`    - ${err}`));
    console.log();
  }

  // If critical components failed, exit with error
  if (failures.length > 0) {
    console.error(`\n  ${yellow}Installation incomplete!${reset} Failed: ${failures.join(', ')}`);
    console.error(`  Try running directly: node ~/.npm/_npx/*/node_modules/get-shit-done-multi/bin/install.js --global\n`);
    process.exit(1);
  }

  // Configure statusline and hooks in settings.json
  const settingsPath = path.join(claudeDir, 'settings.json');
  const settings = cleanupOrphanedHooks(readSettings(settingsPath));
  const statuslineCommand = isGlobal
    ? 'node "$HOME/.claude/hooks/statusline.js"'
    : 'node .claude/hooks/statusline.js';
  const updateCheckCommand = isGlobal
    ? 'node "$HOME/.claude/hooks/gsd-check-update.js"'
    : 'node .claude/hooks/gsd-check-update.js';

  // Configure SessionStart hook for update checking
  if (!settings.hooks) {
    settings.hooks = {};
  }
  if (!settings.hooks.SessionStart) {
    settings.hooks.SessionStart = [];
  }

  // Check if GSD update hook already exists
  const hasGsdUpdateHook = settings.hooks.SessionStart.some(entry =>
    entry.hooks && entry.hooks.some(h => h.command && h.command.includes('gsd-check-update'))
  );

  if (!hasGsdUpdateHook) {
    settings.hooks.SessionStart.push({
      hooks: [
        {
          type: 'command',
          command: updateCheckCommand
        }
      ]
    });
    console.log(`  ${green}✓${reset} Configured update check hook`);
  }

  // Restore user data after upgrade
  if (backups && Object.keys(backups).length > 0) {
    restoreUserData(claudeDir, backups);
  }

  return { settingsPath, settings, statuslineCommand };
}

/**
 * Install to GitHub Copilot CLI local directories
 */
function installCopilot(projectDir = process.cwd(), scope = 'local', configDir = null) {
  const src = path.join(__dirname, '..');
  
  // Get target directories from adapter (with new signature)
  const dirs = copilotAdapter.getTargetDirs(scope, configDir);
  
  const githubDir = path.join(projectDir, '.github');

  console.log(`  Installing GitHub Copilot CLI assets to ${cyan}./.github${reset}\n`);

  // Preserve user data before upgrade
  const backups = preserveUserData(dirs.skills);

  const failures = [];

  // Copy workflows, templates, and references to .github/get-shit-done/
  const gsdSrc = path.join(src, 'get-shit-done');
  const gsdDirs = ['workflows', 'templates', 'references'];
  
  fs.mkdirSync(dirs.gsd, { recursive: true });
  
  for (const dir of gsdDirs) {
    const srcPath = path.join(gsdSrc, dir);
    const destPath = path.join(dirs.gsd, dir);
    if (fs.existsSync(srcPath)) {
      copyWithPathReplacement(srcPath, destPath, copilotAdapter, 'skill', 'copilot');
    }
  }
  
  if (fs.existsSync(dirs.gsd) && fs.readdirSync(dirs.gsd).length > 0) {
    console.log(`  ${green}✓${reset} Installed get-shit-done resources (workflows, templates, references)`);
  } else {
    failures.push('get-shit-done resources');
  }

  // Ensure skills directory exists for SKILL.md and commands
  fs.mkdirSync(dirs.skills, { recursive: true });

  // Generate SKILL.md from template for Copilot
  const skillTemplateSrc = path.join(src, 'get-shit-done', 'SKILL.md');
  const skillTemplateDest = path.join(dirs.skills, 'SKILL.md');
  if (fs.existsSync(skillTemplateSrc)) {
    const skillTemplate = fs.readFileSync(skillTemplateSrc, 'utf8');
    // Generate platform-specific version using template system
    const { generateFromTemplate } = require('./lib/template-system/generator');
    const skillContent = generateFromTemplate(skillTemplate, 'copilot');
    fs.writeFileSync(skillTemplateDest, skillContent);
    if (verifyFileInstalled(skillTemplateDest, 'skills/get-shit-done/SKILL.md')) {
      console.log(`  ${green}✓${reset} Installed SKILL.md`);
    } else {
      failures.push('skills/get-shit-done/SKILL.md');
    }
  } else {
    failures.push('get-shit-done/SKILL.md (source missing)');
  }

  // Copy CHANGELOG.md and VERSION
  const changelogSrc = path.join(src, 'CHANGELOG.md');
  const changelogDest = path.join(dirs.skills, 'CHANGELOG.md');
  if (fs.existsSync(changelogSrc)) {
    fs.copyFileSync(changelogSrc, changelogDest);
    if (verifyFileInstalled(changelogDest, 'skills/get-shit-done/CHANGELOG.md')) {
      console.log(`  ${green}✓${reset} Installed CHANGELOG.md`);
    } else {
      failures.push('skills/get-shit-done/CHANGELOG.md');
    }
  }

  const versionDest = path.join(dirs.skills, 'VERSION');
  fs.writeFileSync(versionDest, pkg.version);
  if (verifyFileInstalled(versionDest, 'skills/get-shit-done/VERSION')) {
    console.log(`  ${green}✓${reset} Wrote VERSION (${pkg.version})`);
  } else {
    failures.push('skills/get-shit-done/VERSION');
  }

  // Install Copilot agents
  const agentsSrc = path.join(src, 'agents');
  // Use adapter to get correct agents path
  if (copyCopilotAgents(agentsSrc, dirs.agents, '.github/skills/get-shit-done/') && verifyInstalled(dirs.agents, 'agents')) {
    console.log(`  ${green}✓${reset} Installed Copilot agents`);
  } else {
    failures.push('agents');
  }

  // Generate skills from specs
  const skillSpecsDir = path.join(src, 'specs', 'skills');
  const dotGithubDir = path.join(projectDir, '.github');
  const skillDestDir = path.join(dotGithubDir, 'skills');
  if (fs.existsSync(skillSpecsDir)) {
    fs.mkdirSync(skillDestDir, { recursive: true });
    
    const skillGenResult = generateSkillsFromSpecs(skillSpecsDir, skillDestDir, 'copilot');
    
    if (skillGenResult.failed > 0) {
      console.log(`  ${yellow}⚠${reset} Skills: ${skillGenResult.generated} generated, ${skillGenResult.failed} failed`);
      failures.push(`skills (${skillGenResult.failed} generation failures)`);
    } else if (skillGenResult.generated > 0) {
      console.log(`  ${green}✓${reset} Skills: ${skillGenResult.generated} generated at ${cyan}${skillDestDir}${reset}`);
      
      // List each skill created
      try {
        const skillDirs = fs.readdirSync(skillDestDir)
          .filter(name => {
            const fullPath = path.join(skillDestDir, name);
            return name.startsWith('gsd-') && fs.statSync(fullPath).isDirectory();
          });
        
        skillDirs.forEach(skillName => {
          const skillPath = path.join(skillDestDir, skillName, 'SKILL.md');
          if (fs.existsSync(skillPath)) {
            const stats = fs.statSync(skillPath);
            const sizeKB = (stats.size / 1024).toFixed(1);
            console.log(`    ${green}✓${reset} ${skillName}/ (${sizeKB} KB)`);
          }
        });
        
        console.log(`  ${dim}Verify with: ls ${skillDestDir}${reset}`);
      } catch (err) {
        // Silent fail on listing - generation was successful
      }
    }
  }

  // Install copilot-instructions.md if none exists
  const instructionsSrc = path.join(src, 'lib-ghcc', 'copilot-instructions.md');
  const instructionsDest = path.join(githubDir, 'copilot-instructions.md');
  if (fs.existsSync(instructionsSrc)) {
    if (!fs.existsSync(instructionsDest)) {
      fs.mkdirSync(githubDir, { recursive: true });
      fs.copyFileSync(instructionsSrc, instructionsDest);
      if (verifyFileInstalled(instructionsDest, '.github/copilot-instructions.md')) {
        console.log(`  ${green}✓${reset} Installed copilot-instructions.md`);
      } else {
        failures.push('.github/copilot-instructions.md');
      }
    } else {
      console.log(`  ${yellow}⚠${reset} copilot-instructions.md already exists — skipped`);
    }
  }

  // Install GitHub issue templates
  if (installIssueTemplates(projectDir)) {
    console.log(`  ${green}✓${reset} Installed GitHub issue templates`);
  } else {
    failures.push('issue templates');
  }

  // Verify installation with detailed reporting
  const verifyResult = copilotAdapter.verify(dirs);
  if (verifyResult.success) {
    const skillFiles = fs.readdirSync(dirs.skills)
      .filter(f => f.endsWith('.md')).length;
    const agentCount = fs.readdirSync(dirs.agents)
      .filter(f => f.endsWith('.agent.md')).length;
    console.log(`  ${dim}✓ Verified: ${skillFiles} skill files, ${agentCount} agents${reset}\n`);
  } else {
    console.error(`  ${yellow}⚠ Installation verification warnings:${reset}`);
    verifyResult.errors.forEach(err => console.error(`    - ${err}`));
    console.log();
  }

  if (failures.length > 0) {
    console.error(`\n  ${yellow}Installation incomplete!${reset} Failed: ${failures.join(', ')}`);
    process.exit(1);
  }

  // Restore user data after upgrade
  if (backups && Object.keys(backups).length > 0) {
    restoreUserData(dirs.skills, backups);
  }

  console.log(`
  ${green}Done!${reset} Start GitHub Copilot CLI in this repo and use ${cyan}/gsd-help${reset} for guidance.
`);
}

/**
 * Install to Codex CLI directories
 */
function installCodex(isGlobal, scope = null, configDir = null) {
  // Use scope if provided, otherwise fall back to isGlobal
  const effectiveScope = scope || (isGlobal ? 'global' : 'local');
  
  const src = path.join(__dirname, '..');
  
  // Get target directories from adapter with new signature
  const dirs = codexAdapter.getTargetDirs(effectiveScope, configDir);
  
  const codexDir = getConfigPaths('codex', effectiveScope, configDir);
  
  const locationLabel = isGlobal
    ? codexDir.replace(os.homedir(), '~')
    : codexDir.replace(process.cwd(), '.');

  console.log(`  Installing Codex CLI assets to ${cyan}${locationLabel}${reset}\n`);

  // Preserve user data before upgrade
  const backups = preserveUserData(dirs.skills);

  const failures = [];

  // Copy workflows, templates, and references to .codex/get-shit-done/
  const gsdSrc = path.join(src, 'get-shit-done');
  const gsdDirs = ['workflows', 'templates', 'references'];
  
  fs.mkdirSync(dirs.gsd, { recursive: true });
  
  for (const dir of gsdDirs) {
    const srcPath = path.join(gsdSrc, dir);
    const destPath = path.join(dirs.gsd, dir);
    if (fs.existsSync(srcPath)) {
      copyWithPathReplacement(srcPath, destPath, codexAdapter, 'skill', 'codex');
    }
  }
  
  if (fs.existsSync(dirs.gsd) && fs.readdirSync(dirs.gsd).length > 0) {
    console.log(`  ${green}✓${reset} Installed get-shit-done resources (workflows, templates, references)`);
  } else {
    failures.push('get-shit-done resources');
  }

  // Create skills/get-shit-done directory for SKILL.md
  fs.mkdirSync(dirs.gsdSkill, { recursive: true });

  // Generate SKILL.md from template for Codex (required for Codex skill recognition)
  const skillMdSrc = path.join(src, 'get-shit-done', 'SKILL.md');
  const skillMdDest = path.join(dirs.gsdSkill, 'SKILL.md');
  if (fs.existsSync(skillMdSrc)) {
    const skillTemplate = fs.readFileSync(skillMdSrc, 'utf8');
    // Generate platform-specific version using template system
    const { generateFromTemplate } = require('./lib/template-system/generator');
    const skillContent = generateFromTemplate(skillTemplate, 'codex');
    fs.writeFileSync(skillMdDest, skillContent);
    console.log(`  ${green}✓${reset} Installed SKILL.md`);
  }

  // For global Codex, commands are embedded in skills (not separate prompts)
  // Codex invokes the skill with: $get-shit-done command
  // No need to copy to separate prompts directory

  // Copy CHANGELOG.md and VERSION
  const changelogSrc = path.join(src, 'CHANGELOG.md');
  const changelogDest = path.join(dirs.gsdSkill, 'CHANGELOG.md');
  if (fs.existsSync(changelogSrc)) {
    fs.copyFileSync(changelogSrc, changelogDest);
    if (verifyFileInstalled(changelogDest, 'skills/get-shit-done/CHANGELOG.md')) {
      console.log(`  ${green}✓${reset} Installed CHANGELOG.md`);
    } else {
      failures.push('skills/get-shit-done/CHANGELOG.md');
    }
  }

  const versionDest = path.join(dirs.gsdSkill, 'VERSION');
  fs.writeFileSync(versionDest, pkg.version);
  if (verifyFileInstalled(versionDest, 'skills/get-shit-done/VERSION')) {
    console.log(`  ${green}✓${reset} Wrote VERSION (${pkg.version})`);
  } else {
    failures.push('skills/get-shit-done/VERSION');
  }

  // Generate agents from specs using template system
  const specsDir = path.join(src, 'specs', 'agents');
  if (fs.existsSync(specsDir)) {
    // Create temporary directory for generated agents
    const tempAgentsDir = path.join(src, '.temp-codex-agents');
    fs.mkdirSync(tempAgentsDir, { recursive: true });
    
    // Generate platform-optimized agents for Codex
    const genResult = generateAgentsFromSpecs(specsDir, tempAgentsDir, 'codex');
    
    if (genResult.generated > 0) {
      // Convert generated agents to Codex skill format
      const agentFiles = fs.readdirSync(tempAgentsDir).filter(f => f.endsWith('.md'));
      for (const agentFile of agentFiles) {
        const agentPath = path.join(tempAgentsDir, agentFile);
        const agentContent = fs.readFileSync(agentPath, 'utf8');
        const skillContent = codexAdapter.convertContent(agentContent, 'agent');
        
        const agentName = agentFile.replace('.md', '');
        const agentSkillDir = path.join(dirs.agents, agentName);
        fs.mkdirSync(agentSkillDir, {recursive: true});
        fs.writeFileSync(path.join(agentSkillDir, 'SKILL.md'), skillContent);
      }
      
      // Clean up temp directory
      fs.rmSync(tempAgentsDir, { recursive: true });
      
      if (verifyInstalled(dirs.agents, 'agents')) {
        const failedMsg = genResult.failed > 0 ? ` (${genResult.failed} failed)` : '';
        console.log(`  ${green}✓${reset} Generated and installed ${genResult.generated} agents as skills${failedMsg}`);
      } else {
        failures.push('agents');
      }
    }
  }

  // Codex: convert agents to skill format (folder-per-skill structure) - FALLBACK
  const agentsSrc = path.join(src, '.github', 'agents');
  if (fs.existsSync(agentsSrc)) {
    const agentFiles = fs.readdirSync(agentsSrc).filter(f => f.endsWith('.agent.md'));
    for (const agentFile of agentFiles) {
      const agentName = agentFile.replace('.agent.md', '');
      const agentSkillDir = path.join(dirs.agents, agentName);
      
      // Only copy if not already generated
      if (!fs.existsSync(agentSkillDir)) {
        const agentPath = path.join(agentsSrc, agentFile);
        const agentContent = fs.readFileSync(agentPath, 'utf8');
        const skillContent = codexAdapter.convertContent(agentContent, 'agent');
        
        fs.mkdirSync(agentSkillDir, {recursive: true});
        fs.writeFileSync(path.join(agentSkillDir, 'SKILL.md'), skillContent);
      }
    }
    if (verifyInstalled(dirs.agents, 'agents')) {
      console.log(`  ${green}✓${reset} Installed agents as skills (fallback)`);
    } else {
      failures.push('agents');
    }
  }

  // Generate skills from specs
  const skillSpecsDir = path.join(src, 'specs', 'skills');
  if (fs.existsSync(skillSpecsDir)) {
    // Skills go to .codex/skills/ (parent of dirs.skills which is .codex/skills/get-shit-done/)
    const skillDestDir = path.join(codexDir, 'skills');
    fs.mkdirSync(skillDestDir, { recursive: true });
    
    const skillGenResult = generateSkillsFromSpecs(skillSpecsDir, skillDestDir, 'codex');
    
    if (skillGenResult.failed > 0) {
      console.log(`  ${yellow}⚠${reset} Skills: ${skillGenResult.generated} generated, ${skillGenResult.failed} failed`);
      failures.push(`skills (${skillGenResult.failed} generation failures)`);
    } else if (skillGenResult.generated > 0) {
      console.log(`  ${green}✓${reset} Skills: ${skillGenResult.generated} generated at ${cyan}${skillDestDir}${reset}`);
      
      // List each skill created (similar to Claude/Copilot installation)
      try {
        const skillDirs = fs.readdirSync(skillDestDir)
          .filter(name => {
            const fullPath = path.join(skillDestDir, name);
            return name.startsWith('gsd-') && fs.statSync(fullPath).isDirectory();
          });
        
        skillDirs.forEach(skillName => {
          const skillPath = path.join(skillDestDir, skillName, 'SKILL.md');
          if (fs.existsSync(skillPath)) {
            const stats = fs.statSync(skillPath);
            const sizeKB = (stats.size / 1024).toFixed(1);
            console.log(`    ${green}✓${reset} ${skillName}/ (${sizeKB} KB)`);
          }
        });
      } catch (err) {
        // Silently skip listing if there's an error
      }
    }
  }

  // Verify installation with detailed reporting
  const verifyResult = codexAdapter.verify(dirs);
  if (verifyResult.success) {
    const skillFiles = fs.readdirSync(dirs.skills)
      .filter(f => f.endsWith('.md')).length;
    const agentDirs = fs.readdirSync(dirs.agents)
      .filter(f => fs.statSync(path.join(dirs.agents, f)).isDirectory()).length;
    console.log(`  ${dim}✓ Verified: ${skillFiles} skill files, ${agentDirs} agent skills${reset}\n`);
  } else {
    console.error(`  ${yellow}⚠ Installation verification warnings:${reset}`);
    verifyResult.errors.forEach(err => console.error(`    - ${err}`));
    console.log();
  }

  if (failures.length > 0) {
    console.error(`\n  ${yellow}Installation incomplete!${reset} Failed: ${failures.join(', ')}`);
    process.exit(1);
  }

  // Restore user data after upgrade
  if (backups && Object.keys(backups).length > 0) {
    restoreUserData(dirs.skills, backups);
  }

  console.log(`
  ${green}Done!${reset} Start Codex CLI in this ${isGlobal ? 'session' : 'repo'} and use ${cyan}$gsd-help${reset} for guidance.
`);
}

/**
 * Apply statusline config, then print completion message
 */
function finishInstall(settingsPath, settings, statuslineCommand, shouldInstallStatusline) {
  if (shouldInstallStatusline) {
    settings.statusLine = {
      type: 'command',
      command: statuslineCommand
    };
    console.log(`  ${green}✓${reset} Configured statusline`);
  }

  // Always write settings (hooks were already configured in install())
  writeSettings(settingsPath, settings);

  console.log(`
  ${green}Done!${reset} Launch Claude Code and run ${cyan}/gsd-help${reset}.
`);
}

/**
 * Install to all detected CLIs
 */
function installAll() {
  const detected = detectInstalledCLIs();
  const availableCLIs = Object.entries(detected)
    .filter(([_, isInstalled]) => isInstalled)
    .map(([cli, _]) => cli);
  
  if (availableCLIs.length === 0) {
    console.log(`  ${yellow}No CLIs detected. Install a CLI first:${reset}`);
    console.log(`    - Claude Code: https://claude.ai/download`);
    console.log(`    - GitHub Copilot CLI: npm install -g @github/copilot-cli`);
    console.log(`    - Codex CLI: npm install -g @codex/cli`);
    process.exit(1);
  }
  
  console.log(`  ${green}Installing to ${availableCLIs.length} detected CLI(s)...${reset}\n`);
  
  const results = [];
  
  // Install Claude if detected
  if (detected.claude) {
    console.log(`  ${cyan}━━━ Claude Code ━━━${reset}\n`);
    try {
      const { settingsPath, settings, statuslineCommand } = install(true);
      // Skip statusline prompts in batch mode
      finishInstall(settingsPath, settings, statuslineCommand, false);
      
      // Capture verification
      const dirs = claudeAdapter.getTargetDirs(true);
      const verifyResult = claudeAdapter.verify(dirs);
      const commandCount = verifyResult.success ? 
        fs.readdirSync(dirs.commands).filter(f => f.endsWith('.md')).length : 0;
      const agentCount = verifyResult.success ?
        fs.readdirSync(dirs.agents).filter(f => f.endsWith('.agent.md')).length : 0;
      
      results.push({ 
        cli: 'Claude Code', 
        success: true,
        commands: commandCount,
        agents: agentCount,
        verified: verifyResult.success
      });
    } catch (err) {
      console.error(`  ${yellow}⚠ Claude installation failed: ${err.message}${reset}\n`);
      results.push({ cli: 'Claude Code', success: false, error: err.message });
    }
  }
  
  // Install Copilot if detected
  if (detected.copilot) {
    console.log(`  ${cyan}━━━ GitHub Copilot CLI ━━━${reset}\n`);
    try {
      const targetProjectDir = explicitProjectDir || process.cwd();
      installCopilot(targetProjectDir);
      
      // Capture verification
      const dirs = copilotAdapter.getTargetDirs(false, targetProjectDir);
      const verifyResult = copilotAdapter.verify(dirs);
      const skillFiles = verifyResult.success ?
        fs.readdirSync(dirs.skills).filter(f => f.endsWith('.md')).length : 0;
      const agentCount = verifyResult.success ?
        fs.readdirSync(dirs.agents).filter(f => f.endsWith('.agent.md')).length : 0;
      
      results.push({ 
        cli: 'GitHub Copilot CLI', 
        success: true,
        commands: skillFiles,
        agents: agentCount,
        verified: verifyResult.success
      });
    } catch (err) {
      console.error(`  ${yellow}⚠ Copilot installation failed: ${err.message}${reset}\n`);
      results.push({ cli: 'GitHub Copilot CLI', success: false, error: err.message });
    }
  }
  
  // Install Codex if detected
  if (detected.codex) {
    console.log(`  ${cyan}━━━ Codex CLI ━━━${reset}\n`);
    try {
      installCodex(true); // Global install
      
      // Capture verification
      const dirs = codexAdapter.getTargetDirs(true);
      const verifyResult = codexAdapter.verify(dirs);
      const skillFiles = verifyResult.success ?
        fs.readdirSync(dirs.skills).filter(f => f.endsWith('.md')).length : 0;
      const agentDirs = verifyResult.success ?
        fs.readdirSync(dirs.agents).filter(f => fs.statSync(path.join(dirs.agents, f)).isDirectory()).length : 0;
      
      results.push({ 
        cli: 'Codex CLI', 
        success: true,
        commands: skillFiles,
        agents: agentDirs,
        verified: verifyResult.success
      });
    } catch (err) {
      console.error(`  ${yellow}⚠ Codex installation failed: ${err.message}${reset}\n`);
      results.push({ cli: 'Codex CLI', success: false, error: err.message });
    }
  }
  
  // Summary
  console.log(`\n  ${cyan}━━━ Installation Summary ━━━${reset}\n`);
  results.forEach(result => {
    const status = result.success ? `${green}✓${reset}` : `${yellow}✗${reset}`;
    let line = `  ${status} ${result.cli}`;
    
    if (result.success && result.verified) {
      line += ` ${dim}(${result.commands} commands, ${result.agents} agents)${reset}`;
    } else if (result.error) {
      line += ` ${dim}(${result.error})${reset}`;
    }
    
    console.log(line);
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n  ${green}✓${reset} Installed to ${successCount}/${results.length} CLI(s)\n`);
  console.log(`  Invoke commands with your CLI's syntax:`);
  console.log(`    • Claude Code:       ${cyan}/gsd-help${reset}`);
  console.log(`    • GitHub Copilot:    ${cyan}/gsd-help${reset}`);
  console.log(`    • Codex CLI:         ${cyan}$gsd-help${reset}\n`);
}

/**
 * Handle statusline configuration with optional prompt
 */
function handleStatusline(settings, isInteractive, callback) {
  const hasExisting = settings.statusLine != null;

  // No existing statusline - just install it
  if (!hasExisting) {
    callback(true);
    return;
  }

  // Has existing and --force-statusline flag
  if (forceStatusline) {
    callback(true);
    return;
  }

  // Has existing, non-interactive mode - skip
  if (!isInteractive) {
    console.log(`  ${yellow}⚠${reset} Statusline already configured in settings.json`);
    console.log(`    ${dim}The statusline shows project status and updates in your terminal prompt.${reset}`);
    console.log(`    Current config preserved. Use ${cyan}--force-statusline${reset} to replace.\n`);
    callback(false);
    return;
  }

  // Has existing, interactive mode - prompt user
  const existingCmd = settings.statusLine.command || settings.statusLine.url || '(custom)';

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`
  ${yellow}⚠${reset} Existing statusline detected

  Your current statusline:
    ${dim}command: ${existingCmd}${reset}

  GSD includes a statusline showing:
    • Model name
    • Current task (from todo list)
    • Context window usage (color-coded)

  ${cyan}1${reset}) Keep existing
  ${cyan}2${reset}) Replace with GSD statusline
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    rl.close();
    const choice = answer.trim() || '1';
    callback(choice === '2');
  });
}

/**
 * Prompt for install location
 */
function promptLocation() {
  // Check if stdin is a TTY - if not, fall back to global install
  // This handles npx execution in environments like WSL2 where stdin may not be properly connected
  if (!process.stdin.isTTY) {
    console.log(`  ${yellow}Non-interactive terminal detected, defaulting to global install${reset}\n`);
    const { settingsPath, settings, statuslineCommand } = install(true);
    handleStatusline(settings, false, (shouldInstallStatusline) => {
      finishInstall(settingsPath, settings, statuslineCommand, shouldInstallStatusline);
    });
    return;
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  // Track whether we've processed the answer to prevent double-execution
  let answered = false;

  // Handle Ctrl+C on readline interface - this overrides default behavior
  rl.on('SIGINT', () => {
    answered = true;  // Prevent close event from triggering installation
    console.log(`\n\n  ${yellow}Installation aborted. See you next time!${reset}\n`);
    rl.close();
    process.exit(0);
  });

  // Handle readline close event to detect premature stdin closure
  rl.on('close', () => {
    if (!answered) {
      answered = true;
      console.log(`\n  ${yellow}Input stream closed, defaulting to global install${reset}\n`);
      const { settingsPath, settings, statuslineCommand } = install(true);
      handleStatusline(settings, false, (shouldInstallStatusline) => {
        finishInstall(settingsPath, settings, statuslineCommand, shouldInstallStatusline);
      });
    }
  });

  const configDir = expandTilde(explicitConfigDir) || expandTilde(process.env.CLAUDE_CONFIG_DIR);
  const globalPath = configDir || path.join(os.homedir(), '.claude');
  const globalLabel = globalPath.replace(os.homedir(), '~');

  console.log(`  ${yellow}Where would you like to install?${reset}

  ${cyan}1${reset}) Cloud Global ${dim}(${globalLabel})${reset} - Claude, all projects
  ${cyan}2${reset}) Cloude Local ${dim}(./.claude)${reset} - Claude, this project only
  ${cyan}3${reset}) GitHub Copilot CLI ${dim}(./.github)${reset} - skills + agents for this repo
  ${cyan}4${reset}) Codex CLI Local ${dim}(./.codex)${reset} - Codex, this project only
  ${cyan}5${reset}) Codex CLI Global ${dim}(~/.codex)${reset} - Codex, all projects
`);

  rl.question(`  Choice ${dim}[1]${reset}: `, (answer) => {
    answered = true;
    rl.close();
    const choice = answer.trim() || '1';
    if (choice === '3') {
      installCopilot(explicitProjectDir || process.cwd());
      return;
    }
    if (choice === '4') {
      installCodex(false);
      return;
    }
    if (choice === '5') {
      installCodex(true);
      return;
    }
    const isGlobal = choice !== '2';
    const { settingsPath, settings, statuslineCommand } = install(isGlobal);
    handleStatusline(settings, true, (shouldInstallStatusline) => {
      finishInstall(settingsPath, settings, statuslineCommand, shouldInstallStatusline);
    });
  });
}

  // Main
  if (hasGlobal && hasLocal) {
    console.error(`  ${yellow}Cannot specify both --global and --local${reset}`);
    process.exit(1);
  } else if (hasCodex && hasCodexGlobal) {
    console.error(`  ${yellow}Cannot specify both --codex and --codex-global${reset}`);
    process.exit(1);
  } else if (hasCopilot && (hasGlobal || hasLocal)) {
    console.error(`  ${yellow}Cannot combine --copilot with --global or --local${reset}`);
    process.exit(1);
  } else if ((hasCodex || hasCodexGlobal) && (hasGlobal || hasLocal)) {
    console.error(`  ${yellow}Cannot combine --codex flags with --global or --local${reset}`);
    process.exit(1);
  } else if ((hasCodex || hasCodexGlobal) && hasCopilot) {
    console.error(`  ${yellow}Cannot combine --codex with --copilot${reset}`);
    process.exit(1);
  } else if (hasCopilot && explicitConfigDir) {
    console.error(`  ${yellow}Cannot use --config-dir with --copilot${reset}`);
    process.exit(1);
  } else if ((hasCodex || hasCodexGlobal) && explicitConfigDir) {
    console.error(`  ${yellow}Cannot use --config-dir with --codex flags${reset}`);
    process.exit(1);
  } else if (explicitConfigDir && hasLocal) {
    console.error(`  ${yellow}Cannot use --config-dir with --local${reset}`);
    process.exit(1);
  } else if (hasCopilot) {
    installCopilot(explicitProjectDir || process.cwd());
  } else if (hasCodex) {
    installCodex(false);
  } else if (hasCodexGlobal) {
    installCodex(true);
  } else if (hasGlobal) {
    const { settingsPath, settings, statuslineCommand } = install(true);
    // Non-interactive - respect flags
    handleStatusline(settings, false, (shouldInstallStatusline) => {
      finishInstall(settingsPath, settings, statuslineCommand, shouldInstallStatusline);
    });
  } else if (hasLocal) {
    const { settingsPath, settings, statuslineCommand } = install(false);
    // Non-interactive - respect flags
    handleStatusline(settings, false, (shouldInstallStatusline) => {
      finishInstall(settingsPath, settings, statuslineCommand, shouldInstallStatusline);
    });
  } else {
    promptLocation();
  }

}
// DISABLED: })().catch(err => {
//   console.error(`  ${yellow}Fatal error:${reset} ${err.message}`);
//   process.exit(1);
// });
