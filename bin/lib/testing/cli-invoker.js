const { spawn, execSync } = require('child_process');
const path = require('path');

/**
 * Invoke agent via Claude CLI
 * @param {string} agentName - Agent to invoke (e.g., 'gsd-executor')
 * @param {string} prompt - Prompt to send to agent
 * @param {Object} options - CLI options
 * @returns {Promise<Object>} - { stdout, stderr, exitCode, duration }
 */
async function invokeClaude(agentName, prompt, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const args = ['agent', agentName, prompt];
    
    if (options.model) {
      args.unshift('--model', options.model);
    }
    
    const proc = spawn('claude', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: options.timeout || 30000
    });
    
    let stdout = '';
    let stderr = '';
    let completed = false;
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (exitCode) => {
      if (!completed) {
        completed = true;
        const duration = Date.now() - startTime;
        resolve({ stdout, stderr, exitCode, duration });
      }
    });
    
    proc.on('error', (err) => {
      if (!completed) {
        completed = true;
        reject(new Error('Failed to spawn claude: ' + err.message));
      }
    });
    
    // Timeout handler
    const timeoutMs = options.timeout || 30000;
    setTimeout(() => {
      if (!completed) {
        completed = true;
        proc.terminate();
        reject(new Error('Claude invocation timeout after ' + timeoutMs + 'ms'));
      }
    }, timeoutMs);
  });
}

/**
 * Invoke agent via Copilot CLI
 * @param {string} agentName - Agent to invoke (e.g., '@gsd-executor')
 * @param {string} prompt - Prompt to send to agent
 * @param {Object} options - CLI options
 * @returns {Promise<Object>} - { stdout, stderr, exitCode, duration }
 */
async function invokeCopilot(agentName, prompt, options = {}) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    // Copilot CLI syntax: gh copilot agent @agent-name "prompt"
    const args = ['copilot', 'agent', '@' + agentName, prompt];
    
    const proc = spawn('gh', args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: options.timeout || 30000,
      cwd: options.cwd || process.cwd()
    });
    
    let stdout = '';
    let stderr = '';
    let completed = false;
    
    proc.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    proc.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    proc.on('close', (exitCode) => {
      if (!completed) {
        completed = true;
        const duration = Date.now() - startTime;
        resolve({ stdout, stderr, exitCode, duration });
      }
    });
    
    proc.on('error', (err) => {
      if (!completed) {
        completed = true;
        reject(new Error('Failed to spawn gh: ' + err.message));
      }
    });
    
    // Timeout handler
    const timeoutMs = options.timeout || 30000;
    setTimeout(() => {
      if (!completed) {
        completed = true;
        proc.terminate();
        reject(new Error('Copilot invocation timeout after ' + timeoutMs + 'ms'));
      }
    }, timeoutMs);
  });
}

/**
 * Check if Claude CLI is available
 */
function isClaudeAvailable() {
  try {
    execSync('claude --version', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Check if Copilot CLI is available
 */
function isCopilotAvailable() {
  try {
    execSync('gh copilot --version', { stdio: 'ignore' });
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  invokeClaude,
  invokeCopilot,
  isClaudeAvailable,
  isCopilotAvailable
};
