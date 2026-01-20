/**
 * Help Generator - Auto-generated help text from command metadata
 * Generates command list and detailed help for individual commands
 * @module command-system/help-generator
 */

import { registry } from './registry.js';

/**
 * Generate help text for commands
 * @param {string|null} commandName - Optional command name for detailed help
 * @returns {string} Formatted help text
 */
export function generateHelp(commandName = null) {
  if (commandName) {
    return formatCommandHelp(commandName);
  }
  
  return formatAllCommandsHelp();
}

/**
 * Format detailed help for a specific command
 * @param {string} name - Command name
 * @returns {string} Formatted command help
 * @private
 */
function formatCommandHelp(name) {
  const command = registry.get(name);
  
  if (!command) {
    return `❌ Command not found: ${name}\n\nRun /gsd:help to see all available commands.`;
  }
  
  const { metadata } = command;
  let help = `# /${name}\n\n`;
  
  // Description
  if (metadata.description) {
    help += `${metadata.description}\n\n`;
  }
  
  // Arguments
  if (metadata['argument-hint'] || metadata.arguments) {
    help += `## Arguments\n\n`;
    const argInfo = metadata['argument-hint'] || metadata.arguments;
    help += `\`${argInfo}\`\n\n`;
  }
  
  // Examples
  if (metadata.examples) {
    help += `## Examples\n\n`;
    if (Array.isArray(metadata.examples)) {
      for (const example of metadata.examples) {
        help += `\`\`\`\n${example}\n\`\`\`\n\n`;
      }
    } else {
      help += `\`\`\`\n${metadata.examples}\n\`\`\`\n\n`;
    }
  }
  
  // Allowed tools (if specified)
  if (metadata['allowed-tools']) {
    help += `## Available Tools\n\n`;
    help += metadata['allowed-tools'].join(', ') + '\n\n';
  }
  
  return help.trimEnd();
}

/**
 * Format help for all commands grouped by category
 * @returns {string} Formatted command list
 * @private
 */
function formatAllCommandsHelp() {
  const commands = registry.list();
  const grouped = groupCommands(commands);
  
  let help = `# GSD Commands\n\n`;
  help += `GSD provides ${commands.length} commands for project planning and execution.\n\n`;
  
  // Project Setup
  if (grouped['Project Setup'].length > 0) {
    help += `## Project Setup\n\n`;
    for (const name of grouped['Project Setup']) {
      help += formatCommandLine(name);
    }
    help += '\n';
  }
  
  // Phase Management
  if (grouped['Phase Management'].length > 0) {
    help += `## Phase Management\n\n`;
    for (const name of grouped['Phase Management']) {
      help += formatCommandLine(name);
    }
    help += '\n';
  }
  
  // Milestone Management
  if (grouped['Milestone Management'].length > 0) {
    help += `## Milestone Management\n\n`;
    for (const name of grouped['Milestone Management']) {
      help += formatCommandLine(name);
    }
    help += '\n';
  }
  
  // Utilities
  if (grouped['Utilities'].length > 0) {
    help += `## Utilities\n\n`;
    for (const name of grouped['Utilities']) {
      help += formatCommandLine(name);
    }
    help += '\n';
  }
  
  help += `\nFor detailed help on a specific command:\n`;
  help += `  /gsd:help [command]\n`;
  help += `\nExample:\n`;
  help += `  /gsd:help gsd:execute-phase\n`;
  
  return help.trimEnd();
}

/**
 * Format a single command line for the list view
 * @param {string} name - Command name
 * @returns {string} Formatted command line
 * @private
 */
function formatCommandLine(name) {
  const command = registry.get(name);
  if (!command) return '';
  
  const { metadata } = command;
  const paddedName = `/${name}`.padEnd(27);
  const description = metadata.description || 'No description available';
  
  return `${paddedName} ${description}\n`;
}

/**
 * Group commands by category based on naming patterns
 * @param {string[]} commands - Array of command names
 * @returns {Object} Commands grouped by category
 * @private
 */
function groupCommands(commands) {
  const groups = {
    'Project Setup': [],
    'Phase Management': [],
    'Milestone Management': [],
    'Utilities': []
  };
  
  for (const name of commands) {
    // Get full command object for better categorization
    const command = registry.get(name);
    const description = command?.metadata?.description?.toLowerCase() || '';
    const lowerName = name.toLowerCase();
    
    // Categorize based on keywords
    if (lowerName.includes('project') || lowerName.includes('map-codebase')) {
      groups['Project Setup'].push(name);
    } else if (lowerName.includes('phase') && !lowerName.includes('milestone')) {
      groups['Phase Management'].push(name);
    } else if (lowerName.includes('milestone')) {
      groups['Milestone Management'].push(name);
    } else {
      groups['Utilities'].push(name);
    }
  }
  
  // Sort commands within each group
  for (const category in groups) {
    groups[category].sort();
  }
  
  return groups;
}
