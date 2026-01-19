/**
 * Path rewriting utility for multi-CLI deployment
 * Converts Claude CLI path references to target CLI format
 * 
 * @module path-rewriter
 */

/**
 * Replace Claude CLI path references with target CLI paths
 * 
 * Uses progressive replacement strategy:
 * 1. Replace directory references (~/.claude/get-shit-done/)
 * 2. Replace command references (~/.claude/commands/gsd/)
 * 3. Replace agent references (~/.claude/agents/) → .github/agents/ when isLocal
 * 
 * Handles multiple path variations:
 * - ~/.claude/get-shit-done/ (home-relative)
 * - ./.claude/get-shit-done/ (current-dir-relative)
 * - .claude/get-shit-done/ (relative without dot-slash)
 * - Both with and without trailing slashes
 * 
 * @param {string} content - Content to transform
 * @param {string} targetPrefix - Target CLI prefix path (e.g., '.github/skills/get-shit-done/')
 * @param {Object} options - Transformation options
 * @param {boolean} options.isLocal - If true, transforms agents paths to .github/agents/
 * @returns {string} Content with Claude paths replaced by target paths
 * 
 * @example
 * const result = replaceClaudePaths(
 *   '~/.claude/get-shit-done/workflows/test.md',
 *   '.github/skills/get-shit-done/',
 *   { isLocal: true }
 * );
 * // Returns: '.github/skills/get-shit-done/workflows/test.md'
 */
function replaceClaudePaths(content, targetPrefix, options = {}) {
  let updated = content;
  
  if (options.isLocal) {
    // Stage 1: Replace directory references (get-shit-done paths)
    const commandPrefix = `${targetPrefix}commands/`;
    
    // Replace with trailing slash
    updated = updated.replace(/~\/\.claude\/get-shit-done\//g, targetPrefix);
    updated = updated.replace(/\.\/\.claude\/get-shit-done\//g, targetPrefix);
    updated = updated.replace(/\.claude\/get-shit-done\//g, targetPrefix);
    
    // Replace without trailing slash (word boundary)
    const prefixNoSlash = targetPrefix.endsWith('/') ? targetPrefix.slice(0, -1) : targetPrefix;
    updated = updated.replace(/~\/\.claude\/get-shit-done\b/g, prefixNoSlash);
    updated = updated.replace(/\.\/\.claude\/get-shit-done\b/g, prefixNoSlash);
    updated = updated.replace(/\.claude\/get-shit-done\b/g, prefixNoSlash);

    // Stage 2: Replace command references
    updated = updated.replace(/~\/\.claude\/commands\/gsd\//g, `${commandPrefix}gsd/`);
    updated = updated.replace(/\.\/\.claude\/commands\/gsd\//g, `${commandPrefix}gsd/`);
    updated = updated.replace(/\.claude\/commands\/gsd\//g, `${commandPrefix}gsd/`);
    updated = updated.replace(/~\/\.claude\/commands\//g, commandPrefix);
    updated = updated.replace(/\.\/\.claude\/commands\//g, commandPrefix);
    updated = updated.replace(/\.claude\/commands\//g, commandPrefix);

    // Stage 3: Replace agent references → .github/agents/
    updated = updated.replace(/~\/\.claude\/agents\//g, '.github/agents/');
    updated = updated.replace(/\.\/\.claude\/agents\//g, '.github/agents/');
    updated = updated.replace(/\.claude\/agents\//g, '.github/agents/');

    // Stage 4: Replace .github/skills references for Codex (when targetPrefix is .codex/skills/)
    if (targetPrefix.includes('.codex/skills/')) {
      updated = updated.replace(/\.github\/skills\/get-shit-done\//g, targetPrefix);
      updated = updated.replace(/\.github\/agents\//g, `${targetPrefix}agents/`);
    }

    return updated;
  }

  // Global mode: simple replacement
  return updated.replace(/~\/\.claude\//g, targetPrefix);
}

module.exports = { replaceClaudePaths };
