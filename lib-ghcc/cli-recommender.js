/**
 * CLI Recommendation Engine
 * Provides intelligent CLI selection recommendations based on system state and use cases
 * Uses only Node.js built-ins (no npm dependencies)
 */

const os = require('os');

/**
 * Get intelligent CLI recommendations based on system state
 * @param {Object} options - Configuration options
 * @param {Array<string>} options.currentCLIs - Array of installed CLI names from detectInstalledCLIs()
 * @param {string} options.platform - os.platform() result (darwin, win32, linux)
 * @param {string} [options.useCase='general'] - Use case: 'general' | 'team' | 'personal'
 * @returns {Object} Recommendation object with installed, available, recommendation, and platformNotes
 */
function getRecommendations(options = {}) {
  const currentCLIs = options.currentCLIs || [];
  const platform = options.platform || os.platform();
  const useCase = options.useCase || 'general';
  
  // CLI metadata
  const cliInfo = {
    claude: {
      name: 'Claude Code',
      bestFor: 'solo developers - fastest startup, native agent support',
      description: 'Recommended for fast iteration and powerful AI assistance'
    },
    copilot: {
      name: 'GitHub Copilot CLI',
      bestFor: 'teams - GitHub integration, collaborative workflows',
      description: 'Recommended for GitHub-centric teams and collaborative development'
    },
    codex: {
      name: 'Codex CLI',
      bestFor: 'OpenAI users - integrates with existing OpenAI workflows',
      description: 'Recommended for developers in the OpenAI ecosystem'
    }
  };
  
  // Build installed and available arrays
  const installed = [];
  const available = [];
  
  for (const [cli, info] of Object.entries(cliInfo)) {
    if (currentCLIs.includes(cli)) {
      installed.push({
        cli,
        status: 'installed',
        message: `${info.name} detected - ${info.bestFor.split(' - ')[1]}`
      });
    } else {
      available.push({
        cli,
        status: 'not-installed',
        message: `${info.name} - ${info.description}`
      });
    }
  }
  
  // Generate recommendation based on current state
  let recommendation;
  const installedCount = installed.length;
  
  if (installedCount === 0) {
    // No CLIs installed - recommend Claude Code first
    recommendation = 'Install Claude Code first (easiest setup), add others later for flexibility';
  } else if (installedCount === 1) {
    // One CLI installed - suggest adding more for flexibility
    const installedCLI = installed[0].cli;
    const cliName = cliInfo[installedCLI].name;
    recommendation = `${cliName} is installed. You can add other CLIs for flexibility - run with --all flag`;
  } else {
    // Multiple CLIs installed - great setup
    const installedNames = installed.map(i => cliInfo[i.cli].name).join(' and ');
    recommendation = `✓ Multi-CLI setup detected (${installedNames}) - you can switch between CLIs seamlessly`;
  }
  
  // Add use case specific guidance
  if (useCase === 'team' && !currentCLIs.includes('copilot')) {
    recommendation += '. Consider adding GitHub Copilot CLI for team workflows';
  } else if (useCase === 'personal' && !currentCLIs.includes('claude')) {
    recommendation += '. Consider adding Claude Code for fast personal development';
  }
  
  // Platform-specific notes
  const platformNotes = [];
  
  if (platform === 'win32') {
    platformNotes.push('Windows: Paths differ on Windows - installer handles this automatically');
  } else if (platform === 'darwin') {
    platformNotes.push('macOS: Using ~/Library/Application Support/Claude for Claude Code');
  } else if (platform === 'linux') {
    platformNotes.push('Linux: XDG Base Directory support for config paths');
  }
  
  return {
    installed,
    available,
    recommendation,
    platformNotes
  };
}

/**
 * Analyze system to provide detailed recommendations
 * @param {Object} options - Configuration options
 * @returns {Object} Analysis object with system info and recommendations
 */
function analyzeSystem(options = {}) {
  const platform = os.platform();
  const arch = os.arch();
  const homedir = os.homedir();
  
  return {
    platform,
    arch,
    homedir,
    recommendations: getRecommendations({ ...options, platform })
  };
}

module.exports = {
  getRecommendations,
  analyzeSystem
};
