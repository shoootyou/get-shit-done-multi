/**
 * Structured Return Parser
 * 
 * Parses agent markdown output to extract structured return status blocks.
 * Used by orchestrators to route actions based on subagent completion status.
 * 
 * Supported status patterns:
 * - ## RESEARCH COMPLETE
 * - ## PLAN COMPLETE
 * - ## EXECUTION COMPLETE
 * - ## RESEARCH BLOCKED
 * - ## CHECKPOINT REACHED
 */

/**
 * Parse structured return from agent markdown output
 * 
 * @param {string} markdown - Agent output markdown string
 * @returns {object} - { status, content, raw }
 *   - status: Parsed status (e.g., 'research_complete', 'plan_complete', 'unknown')
 *   - content: Content section extracted from the status block
 *   - raw: Original markdown string
 */
function parseStructuredReturn(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return {
      status: 'unknown',
      content: '',
      raw: markdown || ''
    };
  }

  // Define structured return patterns
  const patterns = [
    { regex: /^## RESEARCH COMPLETE$/m, status: 'research_complete' },
    { regex: /^## PLAN COMPLETE$/m, status: 'plan_complete' },
    { regex: /^## EXECUTION COMPLETE$/m, status: 'execution_complete' },
    { regex: /^## RESEARCH BLOCKED$/m, status: 'research_blocked' },
    { regex: /^## CHECKPOINT REACHED$/m, status: 'checkpoint_reached' }
  ];

  // Try each pattern (use first match)
  for (const pattern of patterns) {
    const match = markdown.match(pattern.regex);
    
    if (match) {
      // Extract content section (from header to next ## or end of string)
      const headerStart = match.index;
      const contentStart = headerStart + match[0].length;
      
      // Find next ## heading or end of string
      const remainingText = markdown.substring(contentStart);
      const nextHeaderMatch = remainingText.search(/^## /m);
      const contentEnd = nextHeaderMatch === -1 
        ? markdown.length 
        : contentStart + nextHeaderMatch;
      
      const content = markdown.substring(contentStart, contentEnd).trim();
      
      return {
        status: pattern.status,
        content,
        raw: markdown
      };
    }
  }

  // No structured return found
  return {
    status: 'unknown',
    content: markdown,
    raw: markdown
  };
}

/**
 * Check if markdown contains a valid structured return
 * 
 * @param {string} markdown - Agent output markdown string
 * @returns {boolean} - True if valid structured return found
 */
function hasStructuredReturn(markdown) {
  const result = parseStructuredReturn(markdown);
  return result.status !== 'unknown';
}

/**
 * Extract all structured return blocks from markdown
 * Useful for multi-section outputs or validation
 * 
 * @param {string} markdown - Agent output markdown string
 * @returns {array} - Array of { status, content } objects
 */
function extractAllStructuredReturns(markdown) {
  if (!markdown || typeof markdown !== 'string') {
    return [];
  }

  const patterns = [
    { regex: /^## RESEARCH COMPLETE$/m, status: 'research_complete' },
    { regex: /^## PLAN COMPLETE$/m, status: 'plan_complete' },
    { regex: /^## EXECUTION COMPLETE$/m, status: 'execution_complete' },
    { regex: /^## RESEARCH BLOCKED$/m, status: 'research_blocked' },
    { regex: /^## CHECKPOINT REACHED$/m, status: 'checkpoint_reached' }
  ];

  const results = [];
  const allHeaders = /^## (RESEARCH COMPLETE|PLAN COMPLETE|EXECUTION COMPLETE|RESEARCH BLOCKED|CHECKPOINT REACHED)$/gm;
  let match;

  while ((match = allHeaders.exec(markdown)) !== null) {
    const headerStart = match.index;
    const contentStart = headerStart + match[0].length;
    
    // Find next ## or end
    const remainingText = markdown.substring(contentStart);
    const nextHeaderMatch = remainingText.search(/^## /m);
    const contentEnd = nextHeaderMatch === -1 
      ? markdown.length 
      : contentStart + nextHeaderMatch;
    
    const content = markdown.substring(contentStart, contentEnd).trim();
    
    // Match status to pattern
    const statusPattern = patterns.find(p => p.regex.test(match[0]));
    if (statusPattern) {
      results.push({
        status: statusPattern.status,
        content
      });
    }
  }

  return results;
}

module.exports = {
  parseStructuredReturn,
  hasStructuredReturn,
  extractAllStructuredReturns
};
