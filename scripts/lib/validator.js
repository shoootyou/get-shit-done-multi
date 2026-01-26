import chalk from 'chalk';

/**
 * Collect-all-errors validator (not fail-fast)
 * Accumulates validation errors and generates comprehensive reports
 */
export class Validator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }
  
  /**
   * Add validation error
   */
  addError(file, field, message) {
    this.errors.push({ file, field, message, severity: 'error' });
  }
  
  /**
   * Add validation warning
   */
  addWarning(file, field, message) {
    this.warnings.push({ file, field, message, severity: 'warning' });
  }
  
  /**
   * Add multiple issues from frontmatter validation
   */
  addIssues(file, issues) {
    issues.forEach(issue => {
      if (issue.severity === 'error') {
        this.addError(file, issue.field, issue.issue);
      } else {
        this.addWarning(file, issue.field, issue.issue);
      }
    });
  }
  
  /**
   * Check if any errors exist
   */
  hasErrors() {
    return this.errors.length > 0;
  }
  
  /**
   * Check if any warnings exist
   */
  hasWarnings() {
    return this.warnings.length > 0;
  }
  
  /**
   * Generate comprehensive validation report
   */
  generateReport() {
    const lines = [];
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      lines.push(chalk.green('✓ All validations passed'));
      return lines.join('\n');
    }
    
    lines.push(chalk.red.bold(`\n✗ Validation Issues Found\n`));
    lines.push(chalk.gray(`Errors: ${this.errors.length} | Warnings: ${this.warnings.length}\n`));
    
    // Group by file
    const byFile = {};
    [...this.errors, ...this.warnings].forEach(issue => {
      if (!byFile[issue.file]) byFile[issue.file] = [];
      byFile[issue.file].push(issue);
    });
    
    // Show issues grouped by file
    Object.keys(byFile).sort().forEach(file => {
      lines.push(chalk.yellow(`\n${file}:`));
      byFile[file].forEach(issue => {
        const icon = issue.severity === 'error' ? '✗' : '⚠';
        const color = issue.severity === 'error' ? chalk.red : chalk.yellow;
        lines.push(color(`  ${icon} ${issue.field}: ${issue.message}`));
      });
    });
    
    if (this.errors.length > 0) {
      lines.push(chalk.red.bold(`\n❌ Migration blocked - fix all errors before proceeding`));
    }
    
    return lines.join('\n');
  }
}
