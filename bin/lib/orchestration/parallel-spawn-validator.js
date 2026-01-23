/**
 * Parallel Spawn Validator
 * 
 * Validates that orchestrators spawn multiple agents concurrently (parallel execution)
 * rather than sequentially. This is critical for high-complexity orchestrators like
 * gsd-new-project that spawn 4-6 agents simultaneously.
 * 
 * Parallelism verification: 
 * - Measures total execution time
 * - Compares to sequential estimate (sum of individual agent times)
 * - Parallel execution should be < 70% of sequential estimate
 * 
 * @module orchestration/parallel-spawn-validator
 */

const { performance } = require('perf_hooks');

/**
 * Validate parallel spawning by measuring execution time
 * 
 * @param {function} executorFn - Async function that spawns agents and returns results
 * @param {object} options - Validation options
 *   @param {string[]} expectedAgents - Array of agent names expected to spawn
 *   @param {number} sequentialEstimate - Expected duration if agents ran sequentially (ms)
 *   @param {number} parallelThreshold - Threshold ratio (default: 0.7 = 70%)
 * @returns {Promise<object>} Validation result
 *   @returns {boolean} success - True if validation passes
 *   @returns {number} duration - Actual execution time (ms)
 *   @returns {string[]} agents - Detected spawned agents
 *   @returns {boolean} parallel - True if execution was parallel
 *   @returns {string} message - Human-readable result message
 *   @returns {object} timing - Detailed timing breakdown
 */
async function validateParallelSpawning(executorFn, options = {}) {
  const {
    expectedAgents = [],
    sequentialEstimate = 0,
    parallelThreshold = 0.7
  } = options;

  // Record start time
  const startTime = performance.now();
  
  let result;
  let error = null;
  
  try {
    // Execute the function that should spawn agents in parallel
    result = await executorFn();
  } catch (err) {
    error = err;
  }
  
  // Record end time
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  // Handle execution error
  if (error) {
    return {
      success: false,
      duration,
      agents: [],
      parallel: false,
      message: `Execution failed: ${error.message}`,
      timing: {
        duration,
        sequentialEstimate,
        parallelThreshold,
        thresholdValue: sequentialEstimate * parallelThreshold
      },
      error: error.message
    };
  }
  
  // Extract spawned agents from result
  const spawnedAgents = result?.agents || [];
  
  // Check if all expected agents were spawned
  const missingAgents = expectedAgents.filter(agent => !spawnedAgents.includes(agent));
  const extraAgents = spawnedAgents.filter(agent => !expectedAgents.includes(agent));
  
  // Determine if execution was parallel
  const thresholdValue = sequentialEstimate * parallelThreshold;
  const isParallel = sequentialEstimate > 0 ? duration < thresholdValue : null;
  
  // Build result message
  let message = '';
  if (missingAgents.length > 0) {
    message += `Missing agents: ${missingAgents.join(', ')}. `;
  }
  if (extraAgents.length > 0) {
    message += `Unexpected agents: ${extraAgents.join(', ')}. `;
  }
  if (isParallel === false) {
    message += `Execution appears sequential (${duration.toFixed(2)}ms >= ${thresholdValue.toFixed(2)}ms threshold). `;
  } else if (isParallel === true) {
    message += `Execution is parallel (${duration.toFixed(2)}ms < ${thresholdValue.toFixed(2)}ms threshold). `;
  }
  if (!message) {
    message = 'All agents spawned successfully.';
  }
  
  // Determine overall success
  const success = missingAgents.length === 0 && (isParallel === null || isParallel === true);
  
  return {
    success,
    duration,
    agents: spawnedAgents,
    parallel: isParallel,
    message: message.trim(),
    timing: {
      duration,
      sequentialEstimate,
      parallelThreshold,
      thresholdValue
    },
    missing: missingAgents,
    extra: extraAgents
  };
}

/**
 * Measure execution time of a function
 * Simple utility for timing any async operation
 * 
 * @param {function} fn - Async function to measure
 * @returns {Promise<object>} { result, duration }
 */
async function measureExecutionTime(fn) {
  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  return {
    result,
    duration
  };
}

/**
 * Calculate sequential estimate from individual agent durations
 * 
 * @param {object[]} agentDurations - Array of { agent, duration } objects
 * @returns {number} Sum of all durations (ms)
 */
function calculateSequentialEstimate(agentDurations) {
  return agentDurations.reduce((sum, item) => sum + item.duration, 0);
}

/**
 * Detect Task() spawning patterns in orchestrator output
 * Used for validation when executing real orchestrators
 * 
 * @param {string} output - Orchestrator output text
 * @returns {string[]} Array of detected agent names
 */
function detectSpawnedAgents(output) {
  if (!output || typeof output !== 'string') {
    return [];
  }
  
  // Look for Task() patterns in output
  // Example: Task(prompt="...", subagent_type="gsd-project-researcher", description="...")
  const taskPattern = /Task\([^)]*subagent_type=["']([^"']+)["'][^)]*\)/g;
  const agents = new Set();
  let match;
  
  while ((match = taskPattern.exec(output)) !== null) {
    agents.add(match[1]);
  }
  
  return Array.from(agents);
}

/**
 * Validate parallel execution timing ratio
 * 
 * @param {number} actualDuration - Actual execution time (ms)
 * @param {number} sequentialEstimate - Expected sequential time (ms)
 * @param {number} threshold - Threshold ratio (default: 0.7)
 * @returns {object} { isParallel, ratio, message }
 */
function validateParallelTiming(actualDuration, sequentialEstimate, threshold = 0.7) {
  if (sequentialEstimate <= 0) {
    return {
      isParallel: null,
      ratio: null,
      message: 'Cannot validate without sequential estimate'
    };
  }
  
  const ratio = actualDuration / sequentialEstimate;
  const isParallel = ratio < threshold;
  const thresholdValue = sequentialEstimate * threshold;
  
  return {
    isParallel,
    ratio,
    message: isParallel
      ? `Execution is parallel: ${actualDuration.toFixed(2)}ms < ${thresholdValue.toFixed(2)}ms (${(ratio * 100).toFixed(1)}% of sequential)`
      : `Execution appears sequential: ${actualDuration.toFixed(2)}ms >= ${thresholdValue.toFixed(2)}ms (${(ratio * 100).toFixed(1)}% of sequential)`
  };
}

module.exports = {
  validateParallelSpawning,
  measureExecutionTime,
  calculateSequentialEstimate,
  detectSpawnedAgents,
  validateParallelTiming
};
