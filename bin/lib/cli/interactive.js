import * as p from '@clack/prompts';
import { detectBinaries } from '../platforms/binary-detector.js';
import { getInstalledVersion } from '../platforms/detector.js';
import { getScriptDir } from './installation-core.js';
import * as logger from './logger.js';
import { platformNames } from '../platforms/platform-names.js';
import { executeInstallationLoop } from './install-loop.js';

/**
 * Run interactive installation mode with beautiful prompts
 * @param {string} appVersion - Application version
 * @param {object} options - Command line options (for future extensibility)
 * @returns {Promise<void>}
 */
export async function runInteractive(appVersion, options = {}) {
  // Show intro with instructions
  p.intro('Interactive Installer');
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

  // Hand off to shared installation core (same path as CLI mode)
  const scriptDir = getScriptDir(import.meta.url);

  // Close the lateral line with step message
  p.log.success('Installation starting...');
  console.log();

  try {
    // Execute installation loop for selected platforms
    await executeInstallationLoop(platforms, scope, appVersion, {
      scriptDir,
      verbose: options.verbose || false,
    });
  } catch (error) {
    // Installation failed
    console.log();
    logger.error(`Installation failed: ${error.message}`);
    process.exit(1);
  }
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
  for (const platform of Object.keys(platformNames)) {
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
