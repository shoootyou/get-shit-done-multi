/**
 * Command Loader - Dynamic command discovery and registration
 * Loads commands from filesystem and registers them with the command registry
 * @module command-system/loader
 */

import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { registry } from './registry.js';

/**
 * Parse a command file with YAML-like frontmatter
 * @param {string} content - File content to parse
 * @returns {{metadata: object, prompt: string}} Parsed frontmatter metadata and command prompt
 * 
 * @example
 * const { metadata, prompt } = parseCommandFile(fileContent);
 * // metadata: { name: 'gsd:help', description: '...' }
 * // prompt: '<objective>...</objective>'
 */
export function parseCommandFile(content) {
  // Match frontmatter pattern: ---\n...\n---\n...
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  
  if (!frontmatterMatch) {
    // No frontmatter found, return whole content as prompt
    return { metadata: {}, prompt: content };
  }

  const [, frontmatterText, prompt] = frontmatterMatch;
  
  // Parse YAML-like key: value pairs
  const metadata = {};
  const lines = frontmatterText.split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim();
      const value = line.slice(colonIndex + 1).trim();
      metadata[key] = value;
    }
  }

  return { metadata, prompt };
}

/**
 * Load all commands from a directory and register them
 * @param {string} commandsDir - Directory path containing .md command files
 * @returns {Promise<number>} Number of commands loaded
 * 
 * @example
 * const count = await loadCommands('commands/gsd');
 * console.log(`Loaded ${count} commands`);
 */
export async function loadCommands(commandsDir) {
  let loadedCount = 0;

  try {
    // Read all .md files from directory
    const files = await readdir(commandsDir);
    const commandFiles = files.filter(file => file.endsWith('.md'));

    for (const file of commandFiles) {
      const filePath = join(commandsDir, file);
      const content = await readFile(filePath, 'utf-8');
      const { metadata, prompt } = parseCommandFile(content);

      // Extract command name from metadata or filename
      const commandName = metadata.name || file.replace('.md', '');

      // Register command with async handler
      // Handler returns the parsed command data for execution
      registry.register(commandName, metadata, async (args) => {
        return { prompt, args, metadata };
      });

      loadedCount++;
    }
  } catch (err) {
    console.error(`Error loading commands from ${commandsDir}:`, err.message);
  }

  return loadedCount;
}
