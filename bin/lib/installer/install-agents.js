import { join } from 'path';
import { ensureDirectory, writeFile, pathExists } from '../io/file-operations.js';
import { readdir, readFile } from 'fs/promises';
import { renderTemplate, findUnknownVariables, replaceVariables } from '../rendering/template-renderer.js';
import * as logger from '../cli/logger.js';

/**
 * Install agents from templates
 */
export async function installAgents(templatesDir, targetDir, variables, multiBar, isVerbose, adapter) {
    const agentsTemplateDir = join(templatesDir, 'agents');
    const agentsTargetDir = join(targetDir, 'agents');

    await ensureDirectory(agentsTargetDir);

    // Get agent files
    const agentFiles = await readdir(agentsTemplateDir);
    const agents = agentFiles.filter(f => f.startsWith('gsd-') && f.endsWith('.agent.md'));

    let count = 0;
    for (const agent of agents) {
        // Strip .agent.md and add platform-specific extension
        const baseName = agent.replace('.agent.md', '');
        const targetFile = baseName + adapter.getFileExtension();

        logger.verboseInProgress(targetFile, isVerbose);

        const srcFile = join(agentsTemplateDir, agent);
        const destFile = join(agentsTargetDir, targetFile);

        // Read, process, write
        const content = await readFile(srcFile, 'utf8');

        // Step 1: Replace template variables
        const withVariables = replaceVariables(content, variables);

        // Step 2: Transform frontmatter (platform-specific)
        const processed = adapter.transformFrontmatter(withVariables);

        await writeFile(destFile, processed);

        count++;
        logger.verboseComplete(isVerbose);
    }

    // Copy versions.json (don't update progress - not counted as agent)
    const versionsFile = join(agentsTemplateDir, 'versions.json');
    if (await pathExists(versionsFile)) {
        logger.verboseInProgress('versions.json', isVerbose);

        const content = await readFile(versionsFile, 'utf8');
        const processed = replaceVariables(content, variables);
        await writeFile(join(agentsTargetDir, 'versions.json'), processed);
        // Don't increment count - versions.json is metadata, not an agent
        logger.verboseComplete(isVerbose);
    }

    return agents.length; // Don't count versions.json in agent count
}