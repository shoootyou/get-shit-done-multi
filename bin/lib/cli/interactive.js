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
  // Show intro
  p.intro('Get Shit Done - Multi-Platform Installer');
  
  // Detect platforms
  const detected = await detectBinaries();
  
  // Global detection check (Pattern 4 from research)
  const hasAnyPlatform = Object.values(detected).some(x => x);
  if (!hasAnyPlatform) {
    await showGlobalDetectionWarning();
  }
  
  // Prompt for selections (Pattern 5 from research)
  const { platforms, scope } = await promptSelections(detected);
  
  // Run installation (Pattern 3 from research)
  await runInstallation(platforms, scope);
  
  // Show completion
  p.outro('Installation complete! Run /gsd-help to get started.');
}

/**
 * Show warning when no platform CLIs detected
 * @returns {Promise<void>}
 */
async function showGlobalDetectionWarning() {
  p.log.warn('No platform CLIs detected on your system.');
  p.log.info('You can still proceed, but installation may fail without CLI binaries.');
  p.log.info('Install Claude Code, GitHub Copilot CLI, or Codex CLI first for best results.');
  
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
  
  // Track failures for partial success handling
  const failures = [];
  
  for (const platform of platforms) {
    try {
      logger.info(`Installing GSD for ${platform}...`);
      
      const adapter = adapterRegistry.get(platform);
      await install({
        platform,
        adapter,
        isGlobal,
        scriptDir,
        multiBar
      });
      
      logger.success(`${platform} installation complete`);
    } catch (error) {
      failures.push({ platform, error });
      logger.error(`${platform} installation failed: ${error.message}`);
    }
  }
  
  multiBar.stop();
  
  // Show summary
  if (failures.length > 0) {
    p.log.warn(`${failures.length} platform(s) failed to install:`);
    failures.forEach(f => p.log.error(`  - ${f.platform}: ${f.error.message}`));
    
    if (failures.length === platforms.length) {
      // All failed - error exit
      process.exit(1);
    }
    // Partial success - continue to outro
  }
}
