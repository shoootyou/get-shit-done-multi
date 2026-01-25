#!/usr/bin/env node
import fs from 'fs-extra';
import path from 'path';

/**
 * Convert file content to template by replacing hardcoded values with variables
 * @param {string} filePath - Path to file to convert
 */
async function convertToTemplate(filePath) {
  let content = await fs.readFile(filePath, 'utf-8');
  
  // Replace hardcoded values with template variables
  content = content.replace(/\.github\//g, '{{PLATFORM_ROOT}}');
  content = content.replace(/\/gsd-/g, '{{COMMAND_PREFIX}}');
  
  // Replace version numbers (be careful not to replace semantic versions in package.json dependencies)
  // This is a simple pattern for now - can be refined later
  content = content.replace(/version\s*[\'\"]\s*\d+\.\d+\.\d+/gi, (match) => {
    return match.replace(/\d+\.\d+\.\d+/, '{{VERSION}}');
  });
  
  await fs.writeFile(filePath, content, 'utf-8');
}

/**
 * Build templates from source files
 */
async function buildTemplates() {
  console.log('Building templates from .github/...');
  
  try {
    // 1. Clean and recreate templates/
    await fs.remove('templates');
    await fs.ensureDir('templates');
    
    // 2. Copy skills (directories)
    const skillsDir = '.github/skills';
    
    if (await fs.pathExists(skillsDir)) {
      const skills = await fs.readdir(skillsDir);
      let skillCount = 0;
      
      for (const skill of skills) {
        // Skip 'get-shit-done' subdirectory (handled separately as shared directory)
        if (skill === 'get-shit-done') continue;
        
        const srcPath = path.join(skillsDir, skill);
        const stat = await fs.stat(srcPath);
        
        if (stat.isDirectory()) {
          const destPath = path.join('templates/skills', skill);
          await fs.copy(srcPath, destPath);
          
          // Convert SKILL.md to template
          const skillFile = path.join(destPath, 'SKILL.md');
          if (await fs.pathExists(skillFile)) {
            await convertToTemplate(skillFile);
          }
          
          skillCount++;
        }
      }
      
      console.log(`  ✓ Copied ${skillCount} skills`);
    } else {
      console.log('  ⚠ No .github/skills/ directory found');
    }
    
    // 3. Copy agents (flat files)
    const agentsDir = '.github/agents';
    
    if (await fs.pathExists(agentsDir)) {
      await fs.ensureDir('templates/agents');
      const agents = await fs.readdir(agentsDir);
      const agentFiles = agents.filter(f => f.endsWith('.agent.md'));
      
      for (const agent of agentFiles) {
        const srcPath = path.join(agentsDir, agent);
        const destPath = path.join('templates/agents', agent);
        await fs.copy(srcPath, destPath);
        await convertToTemplate(destPath);
      }
      
      console.log(`  ✓ Copied ${agentFiles.length} agents`);
    } else {
      console.log('  ⚠ No .github/agents/ directory found');
    }
    
    // 4. Copy shared directory
    if (await fs.pathExists('get-shit-done')) {
      await fs.copy('get-shit-done', 'templates/get-shit-done');
      console.log('  ✓ Copied shared directory');
    } else {
      console.log('  ⚠ No get-shit-done/ directory found');
    }
    
    console.log();
    console.log('✓ Templates built successfully');
  } catch (error) {
    console.error('✗ Build failed:', error.message);
    process.exit(1);
  }
}

buildTemplates();
