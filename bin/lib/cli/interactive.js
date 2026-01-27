import * as p from '@clack/prompts';
import { detectBinaries } from '../platforms/binary-detector.js';
import { getInstalledVersion } from '../platforms/detector.js';
import { getScriptDir } from './installation-core.js';
import * as logger from './logger.js';
import { platformNames } from '../platforms/platform-names.js';
import { executeInstallationLoop } from './install-loop.js';
import { findInstallations } from '../version/installation-finder.js';
import { readManifest } from '../manifests/reader.js';
import { repairManifest } from '../manifests/repair.js';
import { compareVersions, formatPlatformOption } from '../version/version-checker.js';

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
  const { platforms, scope } = await promptSelections(detected, appVersion, options);

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
 * Discover installations with version status
 * @param {string} scope - Installation scope (global/local)
 * @param {string} currentVersion - Current installer version
 * @param {Array} customPaths - Custom search paths
 * @returns {Promise<Map>} Map of platform to version status
 */
async function discoverInstallationsWithStatus(scope, currentVersion, customPaths = []) {
  const found = await findInstallations(scope, customPaths);
  
  const statusMap = new Map();
  
  await Promise.all(
    found.map(async (install) => {
      let manifestResult = await readManifest(install.path);
      
      // If corrupt, try to repair
      if (!manifestResult.success && manifestResult.reason === 'corrupt') {
        manifestResult = await repairManifest(install.path);
      }
      
      if (!manifestResult.success) {
        statusMap.set(install.platform, { 
          status: 'unknown', 
          reason: manifestResult.reason 
        });
        return;
      }
      
      const versionStatus = compareVersions(
        manifestResult.manifest.gsd_version,
        currentVersion
      );
      
      statusMap.set(install.platform, versionStatus);
    })
  );
  
  return statusMap;
}

/**
 * Prompt user for platform and scope selections
 * @param {object} detected - Platform detection results
 * @param {string} appVersion - Current installer version
 * @param {object} options - Options with customPath
 * @returns {Promise<{platforms: string[], scope: string}>}
 */
async function promptSelections(detected, appVersion, options = {}) {
  // Discover installations for both global and local scopes
  const customPaths = options.customPath ? [options.customPath] : [];
  
  // If custom path is provided, treat it as implicit local scope and skip scope prompt
  if (options.customPath) {
    const localInstallations = await discoverInstallationsWithStatus('local', appVersion, customPaths);
    
    const platforms = await p.group(
      {
        platforms: () => {
          return p.multiselect({
            message: 'Select platforms to install GSD:',
            options: [
              {
                value: 'claude',
                label: formatPlatformOption('claude', localInstallations.get('claude')),
                hint: getHintForPlatform('claude', localInstallations.get('claude'), detected.claude)
              },
              {
                value: 'copilot',
                label: formatPlatformOption('copilot', localInstallations.get('copilot')),
                hint: getHintForPlatform('copilot', localInstallations.get('copilot'), detected.copilot)
              },
              {
                value: 'codex',
                label: formatPlatformOption('codex', localInstallations.get('codex')),
                hint: getHintForPlatform('codex', localInstallations.get('codex'), detected.codex)
              }
            ],
            required: true
          });
        }
      },
      {
        onCancel: () => {
          p.cancel('Installation cancelled.');
          process.exit(0);
        }
      }
    );
    
    // Return with implicit local scope
    return { platforms: platforms.platforms, scope: 'local' };
  }
  
  // Normal flow: prompt for both scope and platforms
  const globalInstallations = await discoverInstallationsWithStatus('global', appVersion, customPaths);
  const localInstallations = await discoverInstallationsWithStatus('local', appVersion, customPaths);
  
  return await p.group(
    {
      scope: () => p.select({
        message: 'Installation scope:',
        options: [
          { value: 'local', label: 'Local (.claude/, .github/, .codex/)', hint: 'recommended' },
          { value: 'global', label: 'Global (~/.claude/, ~/.copilot/, ~/.codex/)' }
        ],
        initialValue: 'local'
      }),
      platforms: ({ results }) => {
        // Use the appropriate installation map based on selected scope
        const installationMap = results.scope === 'global' ? globalInstallations : localInstallations;
        
        return p.multiselect({
          message: 'Select platforms to install GSD:',
          options: [
            {
              value: 'claude',
              label: formatPlatformOption('claude', installationMap.get('claude')),
              hint: getHintForPlatform('claude', installationMap.get('claude'), detected.claude)
            },
            {
              value: 'copilot',
              label: formatPlatformOption('copilot', installationMap.get('copilot')),
              hint: getHintForPlatform('copilot', installationMap.get('copilot'), detected.copilot)
            },
            {
              value: 'codex',
              label: formatPlatformOption('codex', installationMap.get('codex')),
              hint: getHintForPlatform('codex', installationMap.get('codex'), detected.codex)
            }
          ],
          required: true
        });
      }
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
 * Get hint for platform option based on version status
 * @param {string} platform - Platform name
 * @param {object} versionStatus - Version status from compareVersions
 * @param {boolean} binaryDetected - Whether binary was detected
 * @returns {string} Hint text
 */
function getHintForPlatform(platform, versionStatus, binaryDetected) {
  if (versionStatus) {
    if (versionStatus.status === 'update_available') {
      return `${versionStatus.updateType} update available`;
    }
    if (versionStatus.status === 'major_update') {
      return 'Major update available (breaking changes)';
    }
    if (versionStatus.status === 'up_to_date') {
      return 'Already installed (up to date)';
    }
    if (versionStatus.status === 'unknown') {
      return 'Installed (version unknown)';
    }
  }
  
  return binaryDetected ? 'Detected' : 'Not detected';
}
