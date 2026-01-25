import chalk from 'chalk';

/**
 * Display a progress message with checkmark
 * @param {string} message - Progress message
 */
export function progress(message) {
  console.log(chalk.green(`✓ ${message}`));
}

/**
 * Display a success message with optional details
 * @param {string} message - Success message
 * @param {Object} details - Optional details object
 */
export function success(message, details = null) {
  console.log();
  console.log(chalk.green.bold(`✓ ${message}`));
  
  if (details) {
    console.log();
    for (const [key, value] of Object.entries(details)) {
      const label = key.replace(/([A-Z])/g, ' $1').trim();
      const capitalizedLabel = label.charAt(0).toUpperCase() + label.slice(1);
      console.log(chalk.dim(`${capitalizedLabel}: ${value}`));
    }
  }
}

/**
 * Display a warning message
 * @param {string} message - Warning message
 */
export function warning(message) {
  console.log(chalk.yellow(`⚠ Warning: ${message}`));
}

/**
 * Display an informational message
 * @param {string} message - Info message
 */
export function info(message) {
  console.log(chalk.blue(message));
}

/**
 * Create a progress reporter for step-based progress tracking
 * @param {number} totalSteps - Total number of steps
 * @returns {Object} - Progress reporter with step() and complete() methods
 */
export function createProgressReporter(totalSteps) {
  let currentStep = 0;

  return {
    /**
     * Report progress on a step
     * @param {string} message - Step message
     */
    step(message) {
      currentStep++;
      console.log(chalk.green(`✓ [${currentStep}/${totalSteps}] ${message}`));
    },

    /**
     * Report completion
     * @param {string} message - Completion message
     */
    complete(message) {
      console.log();
      console.log(chalk.green.bold(`✓ ${message}`));
    }
  };
}
