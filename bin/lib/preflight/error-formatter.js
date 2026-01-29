// bin/lib/preflight/error-formatter.js

/**
 * Format pre-flight validation errors into grouped report
 * 
 * FORMATTING STRATEGY:
 * - Group errors by category (Templates, Disk, Permissions, Paths, Symlinks)
 * - Category order: Prerequisites first (Templates), then independent (Disk, Permissions), then dependent (Paths, Symlinks)
 * - Each error: ✗ symbol + message + multi-line details (| prefix) + fix suggestion
 * - User-friendly language with actionable guidance
 * 
 * @param {Array<Object>} errors - Collected validation errors
 * @param {string} errors[].category - Error category (Disk, Templates, Permissions, Paths, Symlinks)
 * @param {Error} errors[].error - Error object with message and details
 * @returns {string} - Formatted multi-line error report
 */
export function formatPreflightReport(errors) {
  const lines = [];
  
  // Header
  lines.push('');
  lines.push('🚨 Validation Failed');
  lines.push('');
  
  // Group errors by category
  const grouped = groupErrorsByCategory(errors);
  
  // Category display order (prerequisite → independent → dependent)
  const categoryOrder = ['Templates', 'Disk', 'Permissions', 'Paths', 'Symlinks'];
  
  for (const category of categoryOrder) {
    if (!grouped[category] || grouped[category].length === 0) continue;
    
    // Category header
    lines.push(`${category}:`);
    
    // Each error in category
    for (const { error } of grouped[category]) {
      lines.push(formatError(error));
    }
    
    lines.push(''); // Blank line between categories
  }
  
  return lines.join('\n');
}

/**
 * Group errors by category
 */
function groupErrorsByCategory(errors) {
  const grouped = {
    Templates: [],
    Disk: [],
    Permissions: [],
    Paths: [],
    Symlinks: []
  };
  
  for (const error of errors) {
    const category = error.category;
    if (grouped[category]) {
      grouped[category].push(error);
    }
  }
  
  return grouped;
}

/**
 * Format single error with details and fix suggestion
 */
function formatError(error) {
  const lines = [];
  
  // Main error message with symbol
  lines.push(` ✗ ${error.message}`);
  
  // Extract details
  const details = error.details || {};
  
  // Add reason if available
  if (details.reason) {
    lines.push(` | Reason: ${details.reason}`);
  }
  
  // Add category-specific details
  if (error.code === 5) {
    // Insufficient space
    if (details.requiredMB && details.availableMB) {
      lines.push(` | Required: ${details.requiredMB} MB (including 50% buffer)`);
      lines.push(` | Available: ${details.availableMB} MB`);
      const needMB = (parseFloat(details.requiredMB) - parseFloat(details.availableMB)).toFixed(2);
      lines.push(` | Fix: Free up at least ${needMB} MB and try again`);
    }
  } else if (error.code === 4) {
    // Permission denied
    if (details.path) {
      lines.push(` | Location: ${details.path}`);
      lines.push(` | Fix: Run with appropriate permissions or use --custom-path`);
    }
  } else if (error.code === 6) {
    // Invalid path
    if (details.path) {
      lines.push(` | Path: ${details.path}`);
    }
    if (details.firstSegment && details.allowlist) {
      lines.push(` | Blocked: ${details.firstSegment} not in allowlist`);
      lines.push(` | Allowed: ${details.allowlist.join(', ')}`);
    }
    lines.push(` | Fix: Use a valid installation directory`);
  } else if (error.code === 3) {
    // Missing templates
    if (details.missing) {
      for (const dir of details.missing) {
        lines.push(` | Missing: templates/${dir}/`);
      }
    }
    if (details.templatesDir) {
      lines.push(` | Location: ${details.templatesDir}`);
    }
    lines.push(` | Fix: Ensure template directories exist or reinstall package`);
  } else {
    // Generic error - add fix suggestion if not already present
    if (!details.fix && !lines.some(l => l.includes('Fix:'))) {
      lines.push(` | Fix: ${getGenericFix(error)}`);
    } else if (details.fix) {
      lines.push(` | Fix: ${details.fix}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Get generic fix suggestion based on error type
 */
function getGenericFix(error) {
  if (error.message.includes('symlink')) {
    return 'Resolve symlink or use actual target directory';
  }
  if (error.message.includes('permission')) {
    return 'Check directory permissions';
  }
  if (error.message.includes('path')) {
    return 'Use a valid installation path';
  }
  return 'Review error details and retry';
}
