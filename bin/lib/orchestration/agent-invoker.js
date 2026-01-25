/**
 * Agent Invoker - CLI-agnostic agent invocation
 * Abstracts CLI differences behind unified API
 * 
 * @module orchestration/agent-invoker
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const { AgentRegistry } = require('./agent-registry');
const { detectCLI } = require('../installation/cli-detection/detect');
const { PerformanceTracker } = require('./performance-tracker');

// Import state management integration (ES modules)
import { integrateStateManagement } from '../../../lib-ghcc/state-integration.js';

// Instantiate tracker (singleton shared across all invocations)
const perfTracker = new PerformanceTracker();

// Initialize state management modules
const stateModules = integrateStateManagement();

/**
 * Invoke an agent with CLI abstraction
 * @param {string} agentName - Agent name (e.g., 'gsd-executor')
 * @param {string} prompt - Prompt to send to agent
 * @param {Object} options - Additional options (description, model, etc.)
 * @returns {Promise<Object>} Structured result with success, result, performance
 * @throws {Error} If agent not found or unsupported on current CLI
 */
async function invokeAgent(agentName, prompt, options = {}) {
  // Wrap entire invocation with directory lock for concurrent safety
  return await stateModules.lock.withLock(async () => {
    let startMark;
    const invocationStart = Date.now();
    
    try {
      // Detect current CLI
      const cli = detectCLI();
    
    // Start performance tracking
    startMark = perfTracker.startAgent(agentName, cli);
    
    // Get CLI name without suffix for adapter loading
    const cliAdapter = cli.replace('-code', '').replace('-cli', '');
    
    // Instantiate registry and get agent metadata
    const registry = new AgentRegistry();
    const agent = registry.getAgent(agentName, cliAdapter);
    
    // Check if agent exists
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}. Use AgentRegistry.getAgentNames() to see available agents.`);
    }
    
    // Check if agent is supported on current CLI
    if (agent.capability === 'unsupported') {
      throw new Error(
        `Agent '${agentName}' is not supported on ${cli}. ` +
        `Check capability matrix with AgentRegistry.getCapabilityMatrix() for supported CLIs.`
      );
    }
    
    // Load CLI-specific adapter
    let adapter;
    try {
      adapter = require(`../adapters/${cliAdapter}`);
    } catch (error) {
      throw new Error(`Failed to load adapter for ${cli}: ${error.message}`);
    }
    
    // Check if adapter has invokeAgent method
    if (typeof adapter.invokeAgent !== 'function') {
      // End tracking for fallback case
      const duration = await perfTracker.endAgent(agentName, cli, startMark);
      
      // Graceful fallback for adapters not yet wired
      return {
        success: true,
        message: 'Agent invocation not yet implemented in adapter',
        agent: agentName,
        cli,
        result: null,
        performance: {
          cli,
          duration,
          timestamp: new Date().toISOString()
        }
      };
    }
    
    // Invoke agent via adapter
    const result = await adapter.invokeAgent(agent, prompt, options);
    
    // End performance tracking
    const duration = await perfTracker.endAgent(agentName, cli, startMark);
    
    // Track usage
    await stateModules.usageTracker.trackUsage({
      timestamp: Date.now(),
      cli,
      command: 'invoke-agent',
      agent: agentName,
      duration: Date.now() - invocationStart,
      tokens: { input: 0, output: 0 }, // Estimate if possible from result
      cost: 0  // Calculate if possible from result
    });
    
    // Return structured result
    return {
      success: true,
      result,
      performance: {
        cli,
        duration,
        timestamp: new Date().toISOString()
      }
    };
    
  } catch (error) {
    // End tracking even on failure to record failed execution time
    if (startMark) {
      try {
        await perfTracker.endAgent(agentName, detectCLI(), startMark);
      } catch (perfError) {
        // Ignore performance tracking errors in exception path
      }
    }
    
    // Re-throw with context
    throw new Error(`Agent invocation failed for '${agentName}': ${error.message}`);
  }
  }); // End of withLock wrapper
}

/**
 * Get the performance tracker instance for external queries
 * @returns {PerformanceTracker} The shared performance tracker instance
 */
function getPerformanceTracker() {
  return perfTracker;
}

/**
 * Get the state management modules for external access
 * @returns {Object} State management modules
 */
function getStateModules() {
  return stateModules;
}

export { invokeAgent, getPerformanceTracker, getStateModules };
