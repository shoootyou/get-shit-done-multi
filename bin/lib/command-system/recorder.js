/**
 * Command Execution Recorder - Records command executions for cross-CLI comparison
 * Implements CMD-05 and CMD-06 requirements for command recording and comparison
 * @module command-system/recorder
 */

import { promises as fs } from 'fs';
import path from 'path';

/**
 * Record a command execution to disk for later analysis
 * Creates recording directory if it doesn't exist
 * @param {string} commandName - Name of the command executed
 * @param {Array} args - Arguments passed to the command
 * @param {object} result - Execution result object
 * @param {string} cli - CLI that executed the command ('claude-code', 'copilot-cli', 'codex-cli')
 * @param {number} duration - Execution duration in milliseconds
 * @returns {Promise<object>} Recording object with timestamp and metadata
 */
export async function recordExecution(commandName, args, result, cli, duration) {
  const timestamp = Date.now();
  
  // Create recording object
  const recording = {
    timestamp,
    cli,
    command: commandName,
    args,
    result,
    duration,
    success: result.success || false
  };
  
  // Generate filename: .planning/command-recordings/cli-command-timestamp.json
  const recordingsDir = path.join('.planning', 'command-recordings');
  const filename = `${cli}-${commandName.replace(/:/g, '-')}-${timestamp}.json`;
  const filepath = path.join(recordingsDir, filename);
  
  // Ensure directory exists
  try {
    await fs.mkdir(recordingsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, which is fine
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
  
  // Write recording to file
  await fs.writeFile(filepath, JSON.stringify(recording, null, 2), 'utf8');
  
  return recording;
}

/**
 * Load recorded command executions from disk
 * @param {string|null} commandName - Optional command name filter
 * @returns {Promise<Array<object>>} Array of recording objects, sorted by timestamp (newest first)
 */
export async function loadRecordings(commandName = null) {
  const recordingsDir = path.join('.planning', 'command-recordings');
  
  try {
    // Check if directory exists
    await fs.access(recordingsDir);
  } catch {
    // Directory doesn't exist yet, return empty array
    return [];
  }
  
  // Read all JSON files
  const files = await fs.readdir(recordingsDir);
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  
  // Load and parse each file
  const recordings = [];
  for (const file of jsonFiles) {
    try {
      const filepath = path.join(recordingsDir, file);
      const content = await fs.readFile(filepath, 'utf8');
      const recording = JSON.parse(content);
      recordings.push(recording);
    } catch (error) {
      // Skip invalid files
      console.warn(`Warning: Could not load recording ${file}:`, error.message);
    }
  }
  
  // Filter by command name if provided
  let filtered = recordings;
  if (commandName) {
    filtered = recordings.filter(r => r.command === commandName);
  }
  
  // Sort by timestamp descending (newest first)
  filtered.sort((a, b) => b.timestamp - a.timestamp);
  
  return filtered;
}

/**
 * Compare command executions across different CLIs
 * Groups recordings by CLI and generates comparison report
 * @param {string} commandName - Command name to compare
 * @returns {Promise<object>} Comparison report with grouped results and summary
 */
export async function compareExecutions(commandName) {
  // Load all recordings for this command
  const recordings = await loadRecordings(commandName);
  
  if (recordings.length === 0) {
    return {
      command: commandName,
      byCLI: {},
      summary: {
        totalExecutions: 0,
        clis: [],
        message: 'No recordings found for this command'
      }
    };
  }
  
  // Group recordings by CLI
  const byCLI = {};
  for (const recording of recordings) {
    const cli = recording.cli;
    if (!byCLI[cli]) {
      byCLI[cli] = [];
    }
    byCLI[cli].push(recording);
  }
  
  // Generate summary statistics
  const summary = {
    totalExecutions: recordings.length,
    clis: Object.keys(byCLI),
    byCliStats: {}
  };
  
  // Calculate per-CLI statistics
  for (const [cli, cliRecordings] of Object.entries(byCLI)) {
    const successCount = cliRecordings.filter(r => r.success).length;
    const avgDuration = cliRecordings.reduce((sum, r) => sum + r.duration, 0) / cliRecordings.length;
    
    summary.byCliStats[cli] = {
      executions: cliRecordings.length,
      successRate: (successCount / cliRecordings.length * 100).toFixed(1) + '%',
      avgDuration: Math.round(avgDuration) + 'ms',
      successCount,
      failureCount: cliRecordings.length - successCount
    };
  }
  
  return {
    command: commandName,
    byCLI,
    summary
  };
}
