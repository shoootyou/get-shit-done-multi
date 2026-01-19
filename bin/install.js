#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { detectInstalledCLIs, getDetectedCLIsMessage } = require('./lib/detect');
const { getConfigPaths } = require('./lib/paths');
const { preserveUserData, restoreUserData } = require('./lib/upgrade');
const claudeAdapter = require('./lib/adapters/claude');
const copilotAdapter = require('./lib/adapters/copilot');
const codexAdapter = require('./lib/adapters/codex');

// Colors
const cyan = '\x1b[36m';
const green = '\x1b[32m';
const yellow = '\x1b[33m';
const dim = '\x1b[2m';
const reset = '\x1b[0m';

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
  A meta-prompting, context engineering and spec-driven
  development system for Claude Code by TÂCHES.
`;

// Parse args
const args = process.argv.slice(2);
const hasGlobal = args.includes('--global') || args.includes('-g');
const hasLocal = args.includes('--local') || args.includes('-l');
const hasCopilot = args.includes('--copilot') || args.includes('--github-copilot') || args.includes('--copilot-cli');
const hasCodex = args.includes('--codex') || args.includes('--codex-cli');
const hasCodexGlobal = args.includes('--codex-global');
const hasAll = args.includes('--all') || args.includes('-A');

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
const hasHelp = args.includes('--help') || args.includes('-h');
const forceStatusline = args.includes('--force-statusline');

console.log(banner);

// Show help if requested
if (hasHelp) {
  console.log(`  ${yellow}Usage:${reset} npx get-shit-done-cc [options]

  ${yellow}Options:${reset}
    ${cyan}-g, --global${reset}              Install Claude globally (to Claude config directory)
    ${cyan}-l, --local${reset}               Install Claude locally (to ./.claude in current directory)
    ${cyan}-c, --config-dir <path>${reset}   Specify custom Claude config directory
    ${cyan}--all, -A${reset}                Install to all detected CLIs (Claude, Copilot, Codex)
    ${cyan}--copilot${reset}                 Install GitHub Copilot CLI assets locally (to ./.github)
    ${cyan}--codex${reset}                   Install Codex CLI assets locally (to ./.codex)
    ${cyan}--codex-global${reset}            Install Codex CLI assets globally (to ~/.codex)
    ${cyan}-h, --help${reset}                Show this help message
    ${cyan}--force-statusline${reset}        Replace existing statusline config

  ${yellow}Examples:${reset}
    ${dim}# Install to all detected CLIs in one command${reset}
    npx get-shit-done-cc --all

    ${dim}# Install to default ~/.claude directory${reset}
    npx get-shit-done-cc --global

    ${dim}# Install to custom config directory (for multiple Claude accounts)${reset}
    npx get-shit-done-cc --global --config-dir ~/.claude-bc

    ${dim}# Using environment variable${reset}
    CLAUDE_CONFIG_DIR=~/.claude-bc npx get-shit-done-cc --global

    ${dim}# Install to current project only${reset}
    npx get-shit-done-cc --local

    ${dim}# Install GitHub Copilot CLI assets to this repository${reset}
    npx get-shit-done-cc --copilot

    ${dim}# Install Codex CLI assets to current project${reset}
    npx get-shit-done-cc --codex

    ${dim}# Install Codex CLI assets globally${reset}
    npx get-shit-done-cc --codex-global

  ${yellow}Notes:${reset}
    The --config-dir option is useful when you have multiple Claude Code
    configurations (e.g., for different subscriptions). It takes priority
    over the CLAUDE_CONFIG_DIR environment variable.
`);
  process.exit(0);
}

// Handle --all flag first
if (hasAll) {
  console.log(banner);
  installAll();
  process.exit(0);
}

// Display detected CLIs
const detected = detectInstalledCLIs();
const detectionMsg = getDetectedCLIsMessage(detected);
console.log(`  ${dim}${detectionMsg}${reset}\n`);

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
 */
function copyWithPathReplacement(srcDir, destDir, adapter, contentType = 'skill') {
  // Clean install: remove existing destination to prevent orphaned files
  if (fs.existsSync(destDir)) {
    fs.rmSync(destDir, { recursive: true });
  }
  fs.mkdirSync(destDir, { recursive: true });

  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      copyWithPathReplacement(srcPath, destPath, adapter, contentType);
    } else if (entry.name.endsWith('.md')) {
      let content = fs.readFileSync(srcPath, 'utf8');
      content = adapter.convertContent(content, contentType);
      fs.writeFileSync(destPath, content);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
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
 * Install to the specified directory
 */
function install(isGlobal) {
  const src = path.join(__dirname, '..');
  
  // Get target directories from adapter
  const dirs = claudeAdapter.getTargetDirs(isGlobal);
  
  // Determine base directory (for display and settings)
  const { globalConfigPath, localConfigPath } = getConfigPaths('claude');
  const claudeDir = isGlobal ? globalConfigPath : localConfigPath;

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

  // Copy commands/gsd with path replacement
  const gsdSrc = path.join(src, 'commands', 'gsd');
  copyWithPathReplacement(gsdSrc, dirs.commands, claudeAdapter, 'command');
  if (verifyInstalled(dirs.commands, 'commands/gsd')) {
    console.log(`  ${green}✓${reset} Installed commands/gsd`);
  } else {
    failures.push('commands/gsd');
  }

  // Copy get-shit-done skill with path replacement
  const skillSrc = path.join(src, 'get-shit-done');
  copyWithPathReplacement(skillSrc, dirs.skills, claudeAdapter, 'skill');
  if (verifyInstalled(dirs.skills, 'get-shit-done')) {
    console.log(`  ${green}✓${reset} Installed get-shit-done`);
  } else {
    failures.push('get-shit-done');
  }

  // Copy agents to ~/.claude/agents (subagents must be at root level)
  // Only delete gsd-*.md files to preserve user's custom agents
  const agentsSrc = path.join(src, 'agents');
  if (fs.existsSync(agentsSrc)) {
    fs.mkdirSync(dirs.agents, { recursive: true });

    // Remove old GSD agents (gsd-*.md) before copying new ones
    if (fs.existsSync(dirs.agents)) {
      for (const file of fs.readdirSync(dirs.agents)) {
        if (file.startsWith('gsd-') && file.endsWith('.md')) {
          fs.unlinkSync(path.join(dirs.agents, file));
        }
      }
    }

    // Copy new agents
    const agentEntries = fs.readdirSync(agentsSrc, { withFileTypes: true });
    for (const entry of agentEntries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        let content = fs.readFileSync(path.join(agentsSrc, entry.name), 'utf8');
        content = claudeAdapter.convertContent(content, 'agent');
        fs.writeFileSync(path.join(dirs.agents, entry.name), content);
      }
    }
    if (verifyInstalled(dirs.agents, 'agents')) {
      console.log(`  ${green}✓${reset} Installed agents`);
    } else {
      failures.push('agents');
    }
  }

  // Copy CHANGELOG.md
  const changelogSrc = path.join(src, 'CHANGELOG.md');
  const changelogDest = path.join(dirs.skills, 'CHANGELOG.md');
  if (fs.existsSync(changelogSrc)) {
    fs.copyFileSync(changelogSrc, changelogDest);
    if (verifyFileInstalled(changelogDest, 'CHANGELOG.md')) {
      console.log(`  ${green}✓${reset} Installed CHANGELOG.md`);
    } else {
      failures.push('CHANGELOG.md');
    }
  }

  // Write VERSION file for whats-new command
  const versionDest = path.join(dirs.skills, 'VERSION');
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

  // Install GitHub issue templates for local installs only
  if (!isGlobal) {
    if (installIssueTemplates(process.cwd())) {
      console.log(`  ${green}✓${reset} Installed GitHub issue templates`);
    } else {
      failures.push('issue templates');
    }
  }

  // Verify installation
  const verifyResult = claudeAdapter.verify(dirs);
  if (!verifyResult.success) {
    console.error(`  ${yellow}⚠ Installation verification warnings:${reset}`);
    verifyResult.errors.forEach(err => console.error(`    - ${err}`));
  }

  // If critical components failed, exit with error
  if (failures.length > 0) {
    console.error(`\n  ${yellow}Installation incomplete!${reset} Failed: ${failures.join(', ')}`);
    console.error(`  Try running directly: node ~/.npm/_npx/*/node_modules/get-shit-done-cc/bin/install.js --global\n`);
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
function installCopilot() {
  const src = path.join(__dirname, '..');
  
  // Get target directories from adapter (always local for Copilot)
  const dirs = copilotAdapter.getTargetDirs(false);
  
  const projectDir = process.cwd();
  const githubDir = path.join(projectDir, '.github');

  console.log(`  Installing GitHub Copilot CLI assets to ${cyan}./.github${reset}\n`);

  // Preserve user data before upgrade
  const backups = preserveUserData(dirs.skills);

  const failures = [];

  // Copy core GSD resources into the skill directory
  const skillSrc = path.join(src, 'get-shit-done');
  copyWithPathReplacement(skillSrc, dirs.skills, copilotAdapter, 'skill');
  if (verifyInstalled(dirs.skills, 'skills/get-shit-done')) {
    console.log(`  ${green}✓${reset} Installed skill resources`);
  } else {
    failures.push('skills/get-shit-done');
  }

  // Copy commands into the skill directory
  const commandsSrc = path.join(src, 'commands', 'gsd');
  const commandsDest = path.join(dirs.skills, 'commands', 'gsd');
  copyWithPathReplacement(commandsSrc, commandsDest, copilotAdapter, 'command');
  if (verifyInstalled(commandsDest, 'skills/get-shit-done/commands/gsd')) {
    console.log(`  ${green}✓${reset} Installed command definitions`);
  } else {
    failures.push('skills/get-shit-done/commands/gsd');
  }

  // Copy SKILL.md template
  const skillTemplateSrc = path.join(src, 'lib-ghcc', 'SKILL.md');
  const skillTemplateDest = path.join(dirs.skills, 'SKILL.md');
  if (fs.existsSync(skillTemplateSrc)) {
    fs.copyFileSync(skillTemplateSrc, skillTemplateDest);
    if (verifyFileInstalled(skillTemplateDest, 'skills/get-shit-done/SKILL.md')) {
      console.log(`  ${green}✓${reset} Installed SKILL.md`);
    } else {
      failures.push('skills/get-shit-done/SKILL.md');
    }
  } else {
    failures.push('lib-ghcc/SKILL.md');
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

  // Verify installation
  const verifyResult = copilotAdapter.verify(dirs);
  if (!verifyResult.success) {
    console.error(`  ${yellow}⚠ Installation verification warnings:${reset}`);
    verifyResult.errors.forEach(err => console.error(`    - ${err}`));
    console.log(); // Blank line before success message
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
  ${green}Done!${reset} Start GitHub Copilot CLI in this repo and use ${cyan}gsd:help${reset} for guidance.
`);
}

/**
 * Install to Codex CLI directories
 */
function installCodex(isGlobal) {
  const src = path.join(__dirname, '..');
  
  // Get target directories from adapter
  const dirs = codexAdapter.getTargetDirs(isGlobal);
  
  const { globalConfigPath, localConfigPath } = getConfigPaths('codex');
  const codexDir = isGlobal ? globalConfigPath : localConfigPath;
  
  const locationLabel = isGlobal
    ? codexDir.replace(os.homedir(), '~')
    : codexDir.replace(process.cwd(), '.');

  console.log(`  Installing Codex CLI assets to ${cyan}${locationLabel}${reset}\n`);

  // Preserve user data before upgrade
  const backups = preserveUserData(dirs.skills);

  const failures = [];

  // Copy core GSD resources into the skill directory
  const skillSrc = path.join(src, 'get-shit-done');
  copyWithPathReplacement(skillSrc, dirs.skills, codexAdapter, 'skill');
  if (verifyInstalled(dirs.skills, 'skills/get-shit-done')) {
    console.log(`  ${green}✓${reset} Installed skill resources`);
  } else {
    failures.push('skills/get-shit-done');
  }

  // Copy commands into the skill directory (commands embedded in skills for Codex)
  const commandsSrc = path.join(src, 'commands', 'gsd');
  const commandsDest = path.join(dirs.skills, 'commands', 'gsd');
  copyWithPathReplacement(commandsSrc, commandsDest, codexAdapter, 'command');
  if (verifyInstalled(commandsDest, 'skills/get-shit-done/commands/gsd')) {
    console.log(`  ${green}✓${reset} Installed command definitions`);
  } else {
    failures.push('skills/get-shit-done/commands/gsd');
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

  // Codex: convert agents to skill format (folder-per-skill structure)
  const agentsSrc = path.join(src, 'agents');
  if (fs.existsSync(agentsSrc)) {
    const agentFiles = fs.readdirSync(agentsSrc).filter(f => f.endsWith('.agent.md'));
    for (const agentFile of agentFiles) {
      const agentPath = path.join(agentsSrc, agentFile);
      const agentContent = fs.readFileSync(agentPath, 'utf8');
      const skillContent = codexAdapter.convertContent(agentContent, 'agent');
      
      const agentName = agentFile.replace('.agent.md', '');
      const agentSkillDir = path.join(dirs.agents, agentName);
      fs.mkdirSync(agentSkillDir, {recursive: true});
      fs.writeFileSync(path.join(agentSkillDir, 'SKILL.md'), skillContent);
    }
    if (verifyInstalled(dirs.agents, 'agents')) {
      console.log(`  ${green}✓${reset} Installed agents as skills`);
    } else {
      failures.push('agents');
    }
  }

  // Verify installation
  const verifyResult = codexAdapter.verify(dirs);
  if (!verifyResult.success) {
    console.error(`  ${yellow}⚠ Installation verification warnings:${reset}`);
    verifyResult.errors.forEach(err => console.error(`    - ${err}`));
    console.log(); // Blank line before success message
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
  ${green}Done!${reset} Start Codex CLI in this ${isGlobal ? 'session' : 'repo'} and use ${cyan}/gsd:help${reset} for guidance.
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
  ${green}Done!${reset} Launch Claude Code and run ${cyan}/gsd:help${reset}.
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
      results.push({ cli: 'Claude Code', success: true });
    } catch (err) {
      console.error(`  ${yellow}⚠ Claude installation failed: ${err.message}${reset}\n`);
      results.push({ cli: 'Claude Code', success: false, error: err.message });
    }
  }
  
  // Install Copilot if detected
  if (detected.copilot) {
    console.log(`  ${cyan}━━━ GitHub Copilot CLI ━━━${reset}\n`);
    try {
      installCopilot();
      results.push({ cli: 'GitHub Copilot CLI', success: true });
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
      results.push({ cli: 'Codex CLI', success: true });
    } catch (err) {
      console.error(`  ${yellow}⚠ Codex installation failed: ${err.message}${reset}\n`);
      results.push({ cli: 'Codex CLI', success: false, error: err.message });
    }
  }
  
  // Summary
  console.log(`\n  ${cyan}━━━ Installation Summary ━━━${reset}\n`);
  results.forEach(result => {
    const status = result.success ? `${green}✓${reset}` : `${yellow}✗${reset}`;
    console.log(`  ${status} ${result.cli}${result.error ? ` (${result.error})` : ''}`);
  });
  
  const successCount = results.filter(r => r.success).length;
  console.log(`\n  Installed to ${successCount}/${results.length} CLI(s)\n`);
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
    console.log(`  ${yellow}⚠${reset} Skipping statusline (already configured)`);
    console.log(`    Use ${cyan}--force-statusline${reset} to replace\n`);
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
      installCopilot();
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
  installCopilot();
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
