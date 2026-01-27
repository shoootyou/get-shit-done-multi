// bin/lib/cli/banner-manager.js

import * as logger from './logger.js';
import { getTemplatesDirectory } from '../paths/path-resolver.js';

/**
 * Show application banner with context information
 * Should be called once at the start of any installation flow
 * 
 * @param {string} scriptDir - Script directory path
 * @param {string} version - Application version
 */
export function showBannerWithContext(scriptDir, version) {
  logger.banner(version);
  
  const templatesDir = getTemplatesDirectory(scriptDir);
  logger.info(`Using templates from: ${templatesDir}`, 1);
  console.log(); // Jump line after banner
}
