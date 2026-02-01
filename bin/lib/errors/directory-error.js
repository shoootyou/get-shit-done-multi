
import * as logger from '../cli/logger.js';

export function multipleDirectoryErrors() {
    logger.errorSubtitle('Error', 0, 80, true)
    logger.error('The parameter --custom-path can only be specified once.', 1, true);
    logger.error('To check additional paths, run the installer separately for each path.', 1, true);
    logger.error('', 1, true);
    logger.error('Example:', 1, true);
    logger.error('  npx get-shit-done-multi --custom-path=/path1', 1, true);
    logger.error('  npx get-shit-done-multi --custom-path=/path2', 1, true);
}