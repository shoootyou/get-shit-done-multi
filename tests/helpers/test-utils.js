// tests/helpers/test-utils.js

import { join } from 'path';
import { mkdtemp, rm, mkdir, writeFile } from 'fs/promises';
import { tmpdir } from 'os';

/**
 * Create isolated test directory in /tmp
 * @returns {Promise<string>} Test directory path
 */
export async function createTestDir() {
  const prefix = join(tmpdir(), 'gsd-test-');
  return mkdtemp(prefix);
}

/**
 * Clean up test directory
 * @param {string} dir - Directory to remove
 */
export async function cleanupTestDir(dir) {
  try {
    await rm(dir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
    console.warn(`Cleanup warning: ${error.message}`);
  }
}

/**
 * Create minimal template structure for testing
 * @param {string} baseDir - Base directory for templates
 */
export async function createMinimalTemplates(baseDir) {
  // Create structure
  const templatesDir = join(baseDir, 'templates');
  const skillsDir = join(templatesDir, 'skills', 'gsd-test-skill');
  const agentsDir = join(templatesDir, 'agents');
  const sharedDir = join(templatesDir, 'get-shit-done');
  
  await mkdir(skillsDir, { recursive: true });
  await mkdir(agentsDir, { recursive: true });
  await mkdir(sharedDir, { recursive: true });
  
  // Create skill
  await writeFile(
    join(skillsDir, 'SKILL.md'),
    `---
name: Test Skill
description: Test skill
allowed-tools: Read, Write
---
Install to {{PLATFORM_ROOT}}/skills/
Use {{COMMAND_PREFIX}}test-skill
`
  );
  
  // Create agent
  await writeFile(
    join(agentsDir, 'gsd-test-agent.md'),
    `---
name: test-agent
description: Test agent
tools: Read, Write
---
Agent content with {{PLATFORM_ROOT}} reference
`
  );
  
  // Create versions.json
  await writeFile(
    join(agentsDir, 'versions.json'),
    JSON.stringify({ 'test-agent': { version: '2.0.0' } }, null, 2)
  );
  
  // Create shared manifest template
  await writeFile(
    join(sharedDir, '.gsd-install-manifest.json'),
    JSON.stringify({
      version: '{{VERSION}}',
      platform: '{{PLATFORM_NAME}}'
    }, null, 2)
  );
  
  return templatesDir;
}
