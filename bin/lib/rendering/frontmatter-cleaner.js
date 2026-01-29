// bin/lib/rendering/frontmatter-cleaner.js

import matter from 'gray-matter';
import { serializeFrontmatter } from './frontmatter-serializer.js';

/**
 * Clean frontmatter by removing empty string fields
 * @param {string} content - Markdown file content with frontmatter
 * @param {string} [platform='claude'] - Platform name for serialization
 * @returns {string} Content with cleaned frontmatter
 */
export function cleanFrontmatter(content, platform = 'claude') {
  try {
    const parsed = matter(content);
    const data = parsed.data;
    
    // Remove fields with empty string values
    const cleanedData = {};
    for (const [key, value] of Object.entries(data)) {
      // Special handling for argument-hint
      if (key === 'argument-hint') {
        if (value === '' || value === null || value === undefined) {
          // Skip empty argument-hint
          continue;
        } else if (Array.isArray(value)) {
          // Convert array back to string format: [arg1, arg2, ...]
          cleanedData[key] = '[' + value.join(', ') + ']';
        } else {
          cleanedData[key] = value;
        }
      }
      // Keep field if it has a non-empty value
      else if (value !== '' && value !== null && value !== undefined) {
        cleanedData[key] = value;
      }
      // Also keep if it's explicitly false or 0
      else if (value === false || value === 0) {
        cleanedData[key] = value;
      }
    }
    
    // Rebuild content with cleaned frontmatter using custom serializer
    const serialized = serializeFrontmatter(cleanedData, platform);
    return `---\n${serialized}\n---\n\n${parsed.content}`;
  } catch (error) {
    // If parsing fails, return original content
    return content;
  }
}
