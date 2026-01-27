import fs from 'fs-extra';
import { validateManifest } from './schema.js';

/**
 * Read and validate manifest file
 * Does NOT auto-repair - returns error if corrupt
 * 
 * @param {string} manifestPath - Path to manifest file
 * @returns {Promise<{success: boolean, manifest?: object, reason?: string, error?: string}>}
 */
export async function readManifest(manifestPath) {
  try {
    // Check if file exists
    if (!await fs.pathExists(manifestPath)) {
      return { 
        success: false, 
        reason: 'not_found', 
        manifest: null 
      };
    }
    
    // Read and parse
    const content = await fs.readFile(manifestPath, 'utf8');
    const manifest = JSON.parse(content);
    
    // Validate using centralized schema
    const validation = validateManifest(manifest);
    
    if (!validation.valid) {
      return {
        success: false,
        reason: 'invalid_schema',
        error: `Missing required fields: ${validation.missing.join(', ')}`,
        manifest: null
      };
    }
    
    // Success
    return { success: true, manifest };
    
  } catch (error) {
    // Permission errors
    if (error.code === 'EACCES') {
      return {
        success: false,
        reason: 'permission_denied',
        error: error.message,
        manifest: null
      };
    }
    
    // JSON parse errors
    if (error instanceof SyntaxError) {
      return {
        success: false,
        reason: 'corrupt',
        error: 'Invalid JSON format',
        manifest: null
      };
    }
    
    // Unknown errors
    return {
      success: false,
      reason: 'unknown_error',
      error: error.message,
      manifest: null
    };
  }
}
