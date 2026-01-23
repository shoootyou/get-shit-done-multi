import { atomicWriteJSON, atomicReadJSON } from './state-io.js';
import { join } from 'path';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

/**
 * UsageTracker - Cost tracking and monitoring for multi-CLI operations
 * 
 * Tracks command execution, duration, token usage, and estimated costs
 * across Claude Code, GitHub Copilot CLI, and Codex CLI for cost analysis
 * and optimization.
 * 
 * Features:
 * - Tracks commands, duration, tokens, and costs per CLI
 * - Maintains summary statistics for quick analysis
 * - Bounded event storage (last 1000) prevents disk exhaustion
 * - Per-CLI breakdown for cost optimization
 * - Export to JSON or CSV for external analysis
 * - Atomic writes for concurrent safety
 * 
 * @example
 * const tracker = new UsageTracker('.planning');
 * await tracker.trackUsage({
 *   cli: 'claude-code',
 *   command: 'gsd-execute-phase',
 *   duration: 5000,
 *   tokens: { input: 1000, output: 500 },
 *   cost: 0.02
 * });
 * const summary = await tracker.getUsageSummary();
 * console.log(`Total cost: $${summary.totalCost.toFixed(2)}`);
 */
export class UsageTracker {
  /**
   * Create UsageTracker instance
   * @param {string} stateDir - Path to state directory (default: '.planning')
   */
  constructor(stateDir = '.planning') {
    this.stateDir = stateDir;
    this.usageFile = join(stateDir, 'usage.json');
    this.maxEvents = 1000; // Prevent unbounded growth
  }

  /**
   * Track a usage event
   * 
   * @param {Object} event - Usage event data
   * @param {string} event.cli - CLI identifier (claude-code, github-copilot-cli, codex-cli)
   * @param {string} event.command - Command executed
   * @param {string} [event.agent] - Agent invoked (if applicable)
   * @param {number} event.duration - Duration in milliseconds
   * @param {Object} [event.tokens] - Token usage
   * @param {number} [event.tokens.input] - Input tokens
   * @param {number} [event.tokens.output] - Output tokens
   * @param {number} [event.cost] - Estimated cost in USD
   * @returns {Promise<void>}
   */
  async trackUsage(event) {
    // Ensure state directory exists
    await this._ensureStateDir();

    // Load existing usage data
    const usage = await this._loadUsage();

    // Add timestamp if not present
    const enrichedEvent = {
      timestamp: Date.now(),
      ...event
    };

    // Append event
    usage.events.push(enrichedEvent);

    // Keep only last N events
    if (usage.events.length > this.maxEvents) {
      usage.events = usage.events.slice(-this.maxEvents);
    }

    // Update summary statistics
    this._updateSummary(usage, enrichedEvent);

    // Save atomically
    await atomicWriteJSON(this.usageFile, usage);
  }

  /**
   * Get usage summary with per-CLI breakdown
   * 
   * @returns {Promise<{
   *   totalCommands: number,
   *   totalDuration: number,
   *   totalTokens: {input: number, output: number},
   *   totalCost: number,
   *   perCLI: Object
   * }>}
   */
  async getUsageSummary() {
    const usage = await this._loadUsage();
    return usage.summary;
  }

  /**
   * Reset usage data with backup
   * 
   * @returns {Promise<void>}
   */
  async resetUsage() {
    const usage = await this._loadUsage();

    // Backup old data if exists
    if (usage.events.length > 0) {
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      const backupFile = join(
        this.stateDir,
        `usage-backup-${timestamp}.json`
      );
      await atomicWriteJSON(backupFile, usage);
    }

    // Reset to initial state
    const initial = this._getInitialUsage();
    await atomicWriteJSON(this.usageFile, initial);
  }

  /**
   * Export usage data in requested format
   * 
   * @param {string} format - Export format ('json' or 'csv')
   * @returns {Promise<string>} Formatted usage data
   */
  async exportUsage(format = 'json') {
    const usage = await this._loadUsage();

    if (format === 'json') {
      return JSON.stringify(usage, null, 2);
    }

    if (format === 'csv') {
      return this._toCSV(usage.events);
    }

    throw new Error(`Unsupported export format: ${format}`);
  }

  /**
   * Load usage data from file
   * @private
   * @returns {Promise<Object>} Usage data
   */
  async _loadUsage() {
    try {
      return await atomicReadJSON(this.usageFile);
    } catch (error) {
      // If file doesn't exist or is corrupt, return initial state
      return this._getInitialUsage();
    }
  }

  /**
   * Get initial usage structure
   * @private
   * @returns {Object} Empty usage data
   */
  _getInitialUsage() {
    return {
      events: [],
      summary: {
        totalCommands: 0,
        totalDuration: 0,
        totalTokens: { input: 0, output: 0 },
        totalCost: 0,
        perCLI: {}
      }
    };
  }

  /**
   * Update summary statistics
   * @private
   * @param {Object} usage - Usage data object
   * @param {Object} event - New event to incorporate
   */
  _updateSummary(usage, event) {
    const { summary } = usage;

    // Update totals
    summary.totalCommands++;
    summary.totalDuration += event.duration || 0;
    
    if (event.tokens) {
      summary.totalTokens.input += event.tokens.input || 0;
      summary.totalTokens.output += event.tokens.output || 0;
    }
    
    summary.totalCost += event.cost || 0;

    // Update per-CLI stats
    if (!summary.perCLI[event.cli]) {
      summary.perCLI[event.cli] = {
        commands: 0,
        duration: 0,
        tokens: { input: 0, output: 0 },
        cost: 0
      };
    }

    const cliStats = summary.perCLI[event.cli];
    cliStats.commands++;
    cliStats.duration += event.duration || 0;
    
    if (event.tokens) {
      cliStats.tokens.input += event.tokens.input || 0;
      cliStats.tokens.output += event.tokens.output || 0;
    }
    
    cliStats.cost += event.cost || 0;
  }

  /**
   * Convert events to CSV format
   * @private
   * @param {Array} events - Usage events
   * @returns {string} CSV formatted data
   */
  _toCSV(events) {
    const header = 'timestamp,cli,command,agent,duration,tokens_input,tokens_output,cost';
    const rows = events.map(e => {
      const timestamp = new Date(e.timestamp).toISOString();
      const cli = e.cli || '';
      const command = e.command || '';
      const agent = e.agent || '';
      const duration = e.duration || 0;
      const tokensIn = e.tokens?.input || 0;
      const tokensOut = e.tokens?.output || 0;
      const cost = e.cost || 0;
      
      return `${timestamp},${cli},${command},${agent},${duration},${tokensIn},${tokensOut},${cost}`;
    });

    return [header, ...rows].join('\n');
  }

  /**
   * Ensure state directory exists
   * @private
   */
  async _ensureStateDir() {
    if (!existsSync(this.stateDir)) {
      await mkdir(this.stateDir, { recursive: true });
    }
  }
}
