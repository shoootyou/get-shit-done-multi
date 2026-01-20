/**
 * Performance Tracker for Agent Execution
 * 
 * Tracks agent execution time using Node.js perf_hooks API with sub-millisecond precision.
 * Stores metrics to .planning/metrics/agent-performance.json for benchmarking across CLIs.
 * 
 * @module performance-tracker
 */

const { performance, PerformanceObserver } = require('perf_hooks');
const fs = require('fs').promises;
const path = require('path');

/**
 * PerformanceTracker class
 * 
 * Measures agent execution time with sub-millisecond precision and stores metrics
 * to enable benchmarking across different CLIs (AGENT-09 requirement).
 */
class PerformanceTracker {
  /**
   * Create a PerformanceTracker instance
   * 
   * @param {string} metricsFile - Path to metrics storage file
   */
  constructor(metricsFile = '.planning/metrics/agent-performance.json') {
    this.metricsFile = metricsFile;
    this.metrics = new Map(); // In-memory cache: key = "agent:cli", value = [{duration, timestamp}]
    
    // Create PerformanceObserver to automatically collect measures
    this.observer = new PerformanceObserver((items) => {
      items.getEntries().forEach(entry => {
        this._recordMetric(entry);
      });
    });
    
    this.observer.observe({ entryTypes: ['measure'] });
  }
  
  /**
   * Start tracking agent execution
   * 
   * @param {string} agentName - Name of the agent (e.g., 'gsd-executor', 'gsd-planner')
   * @param {string} cli - CLI name ('claude', 'copilot', 'codex')
   * @returns {string} Mark name for use in endAgent()
   */
  startAgent(agentName, cli) {
    const markName = `${agentName}:${cli}:start`;
    performance.mark(markName);
    return markName;
  }
  
  /**
   * End tracking agent execution and store metric
   * 
   * @param {string} agentName - Name of the agent
   * @param {string} cli - CLI name
   * @param {string} startMark - Mark name returned from startAgent()
   * @returns {Promise<number>} Duration in milliseconds (with sub-millisecond precision)
   */
  async endAgent(agentName, cli, startMark) {
    const endMark = `${agentName}:${cli}:end`;
    const measureName = `${agentName}:${cli}`;
    
    // Create marks and measure
    performance.mark(endMark);
    performance.measure(measureName, startMark, endMark);
    
    // Get measurement
    const entries = performance.getEntriesByName(measureName);
    const entry = entries[entries.length - 1]; // Get most recent
    const duration = entry ? entry.duration : 0;
    
    // Store metric asynchronously
    await this._storeMetric(agentName, cli, duration);
    
    // Cleanup marks and measures to prevent memory leak
    performance.clearMarks(startMark);
    performance.clearMarks(endMark);
    performance.clearMeasures(measureName);
    
    return duration;
  }
  
  /**
   * Record metric from PerformanceObserver (internal method)
   * 
   * @private
   * @param {PerformanceEntry} entry - Performance entry from observer
   */
  _recordMetric(entry) {
    // Parse agent and CLI from entry name (format: "agent:cli")
    const parts = entry.name.split(':');
    if (parts.length < 2) return; // Invalid format
    
    const agent = parts[0];
    const cli = parts[1];
    const key = `${agent}:${cli}`;
    
    // Initialize array if first metric for this agent/CLI combo
    if (!this.metrics.has(key)) {
      this.metrics.set(key, []);
    }
    
    // Append metric to array
    const metrics = this.metrics.get(key);
    metrics.push({
      duration: entry.duration,
      timestamp: Date.now()
    });
  }
  
  /**
   * Store metric to file (internal async method)
   * 
   * @private
   * @param {string} agentName - Name of the agent
   * @param {string} cli - CLI name
   * @param {number} duration - Execution duration in milliseconds
   */
  async _storeMetric(agentName, cli, duration) {
    try {
      // Create metric object
      const metric = {
        agent: agentName,
        cli,
        duration,
        timestamp: new Date().toISOString()
      };
      
      // Ensure directory exists
      const metricsDir = path.dirname(this.metricsFile);
      await fs.mkdir(metricsDir, { recursive: true });
      
      // Read existing metrics (handle missing file gracefully)
      let existingMetrics = [];
      try {
        const data = await fs.readFile(this.metricsFile, 'utf8');
        existingMetrics = JSON.parse(data);
      } catch (error) {
        if (error.code !== 'ENOENT') {
          console.warn(`[PerformanceTracker] Failed to read metrics file: ${error.message}`);
        }
        // ENOENT is expected for first write - initialize empty array
      }
      
      // Append new metric
      existingMetrics.push(metric);
      
      // Keep only last 100 measurements per agent/CLI combo (prevent unbounded growth)
      const key = `${agentName}:${cli}`;
      const filteredMetrics = existingMetrics.filter(m => {
        const mKey = `${m.agent}:${m.cli}`;
        if (mKey === key) {
          // Keep only last 100 for this agent/CLI
          const sameKeyMetrics = existingMetrics.filter(x => `${x.agent}:${x.cli}` === key);
          const index = sameKeyMetrics.indexOf(m);
          return index >= sameKeyMetrics.length - 100;
        }
        return true; // Keep all metrics for other agent/CLI combos
      });
      
      // Write back to file
      await fs.writeFile(this.metricsFile, JSON.stringify(filteredMetrics, null, 2), 'utf8');
      
    } catch (error) {
      // Metric storage failure shouldn't break agent execution
      console.warn(`[PerformanceTracker] Failed to store metric: ${error.message}`);
    }
  }
  
  /**
   * Get average execution time for an agent on a specific CLI
   * 
   * @param {string} agentName - Name of the agent
   * @param {string} cli - CLI name
   * @returns {number|null} Average duration in milliseconds, or null if no metrics exist
   */
  getAverageTime(agentName, cli) {
    const key = `${agentName}:${cli}`;
    const metrics = this.metrics.get(key);
    
    if (!metrics || metrics.length === 0) {
      return null;
    }
    
    const sum = metrics.reduce((acc, m) => acc + m.duration, 0);
    return sum / metrics.length;
  }
  
  /**
   * Dispose of the tracker (cleanup observer)
   */
  dispose() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

module.exports = { PerformanceTracker };
