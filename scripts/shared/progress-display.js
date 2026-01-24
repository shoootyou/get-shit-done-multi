const cliProgress = require('cli-progress');
const chalk = require('chalk');

function createProgressBar(label, total) {
  // Detect CI/non-TTY environment (per RESEARCH.md Pitfall 1)
  if (!process.stdout.isTTY || process.env.CI) {
    // Mock progress bar for CI
    let current = 0;
    return {
      start: () => console.log(`⏳ ${label} (0/${total})`),
      update: (value) => {
        current = value;
        if (value % Math.ceil(total / 5) === 0 || value === total) {
          const pct = Math.round((value / total) * 100);
          console.log(`⏳ ${label} (${value}/${total}) ${pct}%`);
        }
      },
      increment: () => {
        current++;
        if (current === total) {
          console.log(`✓ ${label} complete (${total}/${total})`);
        }
      },
      stop: () => console.log(`✓ ${label} complete`)
    };
  }
  
  const bar = new cliProgress.SingleBar({
    format: `${label} |${chalk.cyan('{bar}')}| {percentage}% | {value}/{total} files`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });
  
  return bar;
}

module.exports = { createProgressBar };
