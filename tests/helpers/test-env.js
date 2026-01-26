import { mkdtempSync, rmSync, cpSync } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Creates isolated test environment in /tmp
 * Returns { testDir, sourceDir, installCmd, copyTemplates, copySource, cleanup }
 */
export function createTestEnv() {
  // Create unique /tmp directory
  const testDir = mkdtempSync(join(tmpdir(), 'gsd-test-'));
  
  // Get source directory (where package.json lives)
  const sourceDir = join(__dirname, '../..');
  
  return {
    testDir,
    sourceDir,
    
    /**
     * Run installer command in test directory
     * Example: installCmd('--claude --local')
     */
    installCmd(args = '') {
      const cmd = `node "${join(sourceDir, 'bin/install.js')}" ${args}`;
      return execSync(cmd, { 
        cwd: testDir,
        encoding: 'utf-8',
        env: { ...process.env, FORCE_COLOR: '0' } // Disable colors in tests
      });
    },
    
    /**
     * Copy templates to test directory (for testing build script)
     */
    copyTemplates() {
      const templatesDir = join(sourceDir, 'templates');
      const destDir = join(testDir, 'templates');
      cpSync(templatesDir, destDir, { recursive: true });
    },
    
    /**
     * Copy source files to test directory (for testing build script)
     */
    copySource() {
      const githubDir = join(sourceDir, '.github');
      const gsdDir = join(sourceDir, 'get-shit-done');
      
      cpSync(githubDir, join(testDir, '.github'), { recursive: true });
      cpSync(gsdDir, join(testDir, 'get-shit-done'), { recursive: true });
    },
    
    /**
     * Cleanup test directory (called after successful test)
     */
    cleanup() {
      try {
        rmSync(testDir, { recursive: true, force: true });
      } catch (error) {
        // Ignore cleanup errors (failed tests may want to inspect directory)
        console.warn(`Warning: Failed to cleanup ${testDir}`);
      }
    }
  };
}

/**
 * Creates isolated test environment and auto-cleans up
 * Use in tests: await withTestEnv(async (env) => { ... })
 */
export async function withTestEnv(testFn) {
  const env = createTestEnv();
  try {
    await testFn(env);
    env.cleanup();
  } catch (error) {
    // Don't cleanup on error - allow inspection
    console.error(`Test failed. Inspect: ${env.testDir}`);
    throw error;
  }
}
