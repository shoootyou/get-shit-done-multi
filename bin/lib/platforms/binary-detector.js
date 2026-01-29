// bin/lib/platforms/binary-detector.js
import { exec } from 'child_process';
import { promisify } from 'util';
import { platform } from 'os';

const execAsync = promisify(exec);

/**
 * Check if a command exists in PATH
 * @param {string} command - Command name
 * @returns {Promise<boolean>}
 */
async function commandExists(command) {
  const isWindows = platform() === 'win32';
  const checkCmd = isWindows ? `where ${command}` : `which ${command}`;
  
  try {
    // 2-second timeout per RESEARCH-CLARIFICATIONS Q3
    await execAsync(checkCmd, { timeout: 2000 });
    return true;
  } catch (error) {
    // Any error means binary not available - this is expected behavior
    // Common errors: ENOENT (command not found), timeout (process.killed), EACCES (no permission)
    // For binary detection, we don't need to distinguish - any error = "not available"
    return false;
  }
}

/**
 * Detect available platform CLI binaries
 * @returns {Promise<Object>} Binary detection results
 */
export async function detectBinaries() {
  return {
    claude: await commandExists('claude'),
    copilot: await commandExists('copilot'),
    codex: await commandExists('codex')
  };
}
