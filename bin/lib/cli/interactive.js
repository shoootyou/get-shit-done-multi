import * as p from '@clack/prompts';
import { detectBinaries } from '../platforms/binary-detector.js';
import { getInstalledVersion } from '../platforms/detector.js';
import { adapterRegistry } from '../platforms/registry.js';
import { install } from '../installer/orchestrator.js';
import { createMultiBar } from './progress.js';
import * as logger from './logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

/**
 * Run interactive installation mode with beautiful prompts
 * @param {object} options - Command line options (for future extensibility)
 * @returns {Promise<void>}
 */
export async function runInteractive(options = {}) {
  // Show banner
  logger.banner();
  
  // Show intro with instructions
  p.intro('Get Shit Done - Multi-Platform Installer');
  p.log.info('Use ↑/↓ to navigate, Space to select, Enter to continue');
  
  // Detect platforms
  const detected = await detectBinaries();
  
  // Global detection check (Pattern 4 from research)
  const hasAnyPlatform = Object.values(detected).some(x => x);
  if (!hasAnyPlatform) {
    await showGlobalDetectionWarning();
  }
  
  // Prompt for selections (Pattern 5 from research)
  const { platforms, scope } = await promptSelections(detected);
  
  // Close the lateral line with step message
  p.log.step('Installation starting...');
  
  // Run installation (Pattern 3 from research)
  await runInstallation(platforms, scope);
}

/**
 * Show warning when no platform CLIs detected
 * @returns {Promise<void>}
 */
async function showGlobalDetectionWarning() {
  // Close lateral line before showing warnings
  console.log();
  
  // Use CLI logger format for warnings
  logger.warn('No platform CLIs detected on your system.');
  logger.info('You can still proceed, but installation may fail without CLI binaries.');
  logger.info('Install Claude Code, GitHub Copilot CLI, or Codex CLI first for best results.');
  console.log();
  
  const shouldContinue = await p.confirm({
    message: 'Continue anyway?',
    initialValue: false
  });
  
  if (p.isCancel(shouldContinue)) {
    p.cancel('Installation cancelled.');
    process.exit(0);
  }
  
  if (!shouldContinue) {
    p.outro('Install a platform CLI first, then run this installer again.');
    process.exit(0);
  }
}

/**
 * Prompt user for platform and scope selections
 * @param {object} detected - Platform detection results
 * @returns {Promise<{platforms: string[], scope: string}>}
 */
async function promptSelections(detected) {
  // Get installed versions
  const versions = {};
  for (const platform of ['claude', 'copilot', 'codex']) {
    versions[platform] = await getInstalledVersion(platform);
  }
  
  return await p.group(
    {
      platforms: () => p.multiselect({
        message: 'Select platforms to install GSD:',
        options: [
          {
            value: 'claude',
            label: 'Claude Code',
            hint: versions.claude ? `v${versions.claude}` : (detected.claude ? 'detected' : 'Install CLI first')
          },
          {
            value: 'copilot',
            label: 'GitHub Copilot CLI',
            hint: versions.copilot ? `v${versions.copilot}` : (detected.copilot ? 'detected' : 'Install CLI first')
          },
          {
            value: 'codex',
            label: 'Codex CLI',
            hint: versions.codex ? `v${versions.codex}` : (detected.codex ? 'detected' : 'Install CLI first')
          }
        ],
        required: true
      }),
      scope: () => p.select({
        message: 'Installation scope:',
        options: [
          { value: 'local', label: 'Local (.claude/, .github/, .codex/)', hint: 'recommended' },
          { value: 'global', label: 'Global (~/.claude/, ~/.copilot/, ~/.codex/)' }
        ],
        initialValue: 'local'
      })
    },
    {
      onCancel: () => {
        p.cancel('Installation cancelled.');
        process.exit(0);
      }
    }
  );
}

/**
 * Run installation for selected platforms
 * @param {string[]} platforms - Selected platforms
 * @param {string} scope - Installation scope (global or local)
 * @returns {Promise<void>}
 */
async function runInstallation(platforms, scope) {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = dirname(__filename);
  const scriptDir = path.resolve(__dirname, '../..');
  
  const isGlobal = scope === 'global';
  const multiBar = createMultiBar();
  
  // Map platform names for display
  const platformNames = {
    claude: 'Claude Code',
    copilot: 'GitHub Copilot CLI',
    codex: 'Codex CLI'
  };
  
  // Track failures and successes for summary
  const failures = [];
  const successes = [];
  
  for (const platform of platforms) {
    try {
      const platformLabel = platformNames[platform] || platform;
      console.log(); // Add spacing before each platform installation
      logger.info(`Installing ${platformLabel}...`);
      
      const adapter = adapterRegistry.get(platform);
      const stats = await install({
        platform,
        adapter,
        isGlobal,
        scriptDir,
        multiBar,
        silent: true // Don't show command prefix logging
      });
      
      logger.success(`${platform} installation complete`, 1);
      successes.push({ platform, platformLabel, stats });
    } catch (error) {
      failures.push({ platform: platformNames[platform] || platform, error });
    }
  }
  
  multiBar.stop();
  
  if (failures.length > 0) {
    console.log();
    logger.warn(`${failures.length} platform(s) failed to install:`);
    failures.forEach(f => logger.error(`  ${f.platform}: ${f.error.message}`));
    
    if (failures.length === platforms.length) {
      // All failed - error exit
      process.exit(1);
    }
  }
  
  // Show installation complete message with platform names
  console.log(); // One jump line before
  if (successes.length > 1) {
    const names = successes.map(s => s.platform).join(', ');
    logger.success(`${names} installation complete`);
  } else if (successes.length === 1) {
    logger.success(`${successes[0].platform} installation complete`);
  }
  
  // Add next steps section with header
  logger.header('Next Steps');
  
  // Dynamic AI CLI name based on number of platforms
  const cliName = platforms.length > 1 
    ? 'your AI CLI' 
    : platformNames[platforms[0]] || 'your AI CLI';
  
  logger.info(`Open ${cliName} and run /gsd-help to see available commands`);
  logger.info('Try /gsd-diagnose to validate your setup');
  logger.info('Explore skills with /gsd-list-skills');
  
  console.log(); // Add spacing at end
}
