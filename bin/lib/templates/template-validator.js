import fs from 'fs-extra';
import path from 'path';

/**
 * Known template variables for validation
 */
const KNOWN_VARIABLES = [
  'PLATFORM_ROOT',
  'VERSION',
  'COMMAND_PREFIX',
  'INSTALL_DATE',
  'USER',
  'PLATFORM_NAME'
];

/**
 * Validate template content for syntax errors
 * @param {string} content - Template content to validate
 * @param {string} filePath - Path to file (for error reporting)
 * @returns {Array} - Array of issue objects { line, column, message }
 */
export function validateTemplate(content, filePath) {
  const issues = [];
  const lines = content.split('\n');

  lines.forEach((line, lineNum) => {
    // Only validate lines that look like template variables ({{UPPERCASE}})
    // Skip lines with just braces (like JSX: {{}} or () => {})
    const templatePattern = /\{\{[A-Z_][A-Z0-9_]*\}\}/;
    
    // Check for unclosed braces only if line has template-like content
    if (templatePattern.test(line)) {
      const openCount = (line.match(/\{\{/g) || []).length;
      const closeCount = (line.match(/\}\}/g) || []).length;
      if (openCount !== closeCount) {
        issues.push({
          line: lineNum + 1,
          message: 'Unclosed braces'
        });
      }
    }

    // Check for lowercase variables
    const lowercaseVars = line.match(/\{\{[a-z_]+\}\}/g);
    if (lowercaseVars) {
      issues.push({
        line: lineNum + 1,
        message: `Lowercase variables not allowed: ${lowercaseVars.join(', ')}`
      });
    }

    // Check for variables with spaces
    const spacedVars = line.match(/\{\{\s+[A-Z_]+\s+\}\}/g);
    if (spacedVars) {
      issues.push({
        line: lineNum + 1,
        message: `Variables cannot contain spaces: ${spacedVars.join(', ')}`
      });
    }

    // Check for numeric-only variables
    const numericVars = line.match(/\{\{[0-9]+\}\}/g);
    if (numericVars) {
      issues.push({
        line: lineNum + 1,
        message: `Numeric-only variables not allowed: ${numericVars.join(', ')}`
      });
    }

    // Check for unknown variables
    const variables = line.match(/\{\{([A-Z_]+)\}\}/g);
    if (variables) {
      variables.forEach(v => {
        const varName = v.replace(/\{\{|\}\}/g, '');
        if (!KNOWN_VARIABLES.includes(varName)) {
          issues.push({
            line: lineNum + 1,
            message: `Unknown variable: ${v}`
          });
        }
      });
    }
  });

  return issues;
}

/**
 * Validate all templates in a directory
 * @param {string} dirPath - Directory path to scan
 * @param {Array} knownVariables - Array of known variable names
 * @returns {Promise<Object>} - Validation summary { validCount, issueCount, issues }
 */
export async function validateTemplateDirectory(dirPath, knownVariables = KNOWN_VARIABLES) {
  const issues = [];
  let validCount = 0;
  let issueCount = 0;

  async function scanDirectory(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        await scanDirectory(fullPath);
      } else if (entry.name.endsWith('.md')) {
        const content = await fs.readFile(fullPath, 'utf-8');
        const fileIssues = validateTemplate(content, fullPath);

        if (fileIssues.length === 0) {
          validCount++;
        } else {
          issueCount++;
          issues.push({
            file: fullPath,
            issues: fileIssues
          });
        }
      }
    }
  }

  await scanDirectory(dirPath);

  return {
    validCount,
    issueCount,
    issues
  };
}
