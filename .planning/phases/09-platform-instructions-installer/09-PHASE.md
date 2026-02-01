# Phase 9: Platform Instructions Installer

**Status:** PENDING  
**Created:** 2026-01-30  
**Goal:** Install platform-specific instructions file (AGENTS.md/CLAUDE.md/copilot-instructions.md) with smart merge logic

## Overview

Add functionality to install `templates/AGENTS.md` to platform-specific instruction files during installation process. This provides custom instructions that platforms can read to understand GSD workflows.

**Key Feature:** Smart merge logic that appends content if file exists, or creates new file, with deduplication via `<gsd_instructions>` tags.

## Requirements

### Installation Flow
- Install after `installShared()` in both verbose and non-verbose modes
- Use existing template variable replacement system (`PLATFORM_ROOT`, `COMMAND_PREFIX`)
- Support all three platforms with different target filenames

### Platform-Specific Targets
- **Codex:** `[root]/AGENTS.md`
- **Claude:** `[root]/CLAUDE.md`  
- **Copilot:** `.github/copilot-instructions.md`

### Smart Merge Logic
1. **File doesn't exist:** Create new file with template content
2. **File exists without tags:** Append template content to end of file
3. **File exists with `<gsd_instructions>` tags:** Replace only content between tags (preserve user's other content)

### Tag Format
```markdown
<gsd_instructions>
[GSD content here]
</gsd_instructions>
```

## Technical Approach

### 1. Create New Function: `installPlatformInstructions()`
Location: `bin/lib/installer/install-platform-instructions.js`

Similar structure to `install-shared.js`:
- Takes same parameters: `(templatesDir, targetDir, variables, multiBar, isVerbose, adapter)`
- Returns count (always 1)
- Uses `replaceVariables()` from template-renderer

### 2. Merge Logic Implementation

```javascript
async function installPlatformInstructions(templatesDir, targetDir, variables, multiBar, isVerbose, adapter) {
  const templatePath = join(templatesDir, 'AGENTS.md');
  const targetFilename = adapter.getInstructionsFilename(); // New adapter method
  const targetPath = join(targetDir, targetFilename);
  
  // Read and process template
  const templateContent = await readFile(templatePath, 'utf8');
  const processedContent = replaceVariables(templateContent, variables);
  
  // Check if target exists
  if (await pathExists(targetPath)) {
    const existingContent = await readFile(targetPath, 'utf8');
    
    // Check for <gsd_instructions> tags
    const tagRegex = /<gsd_instructions>.*?<\/gsd_instructions>/s;
    
    if (tagRegex.test(existingContent)) {
      // Replace content between tags
      const mergedContent = existingContent.replace(tagRegex, processedContent);
      await fsWriteFile(targetPath, mergedContent, 'utf8');
      logger.verboseComplete(`Updated ${targetFilename} (replaced GSD section)`, isVerbose);
    } else {
      // Append to end
      const mergedContent = existingContent + '\n\n' + processedContent;
      await fsWriteFile(targetPath, mergedContent, 'utf8');
      logger.verboseComplete(`Updated ${targetFilename} (appended)`, isVerbose);
    }
  } else {
    // Create new file
    await fsWriteFile(targetPath, processedContent, 'utf8');
    logger.verboseComplete(`Created ${targetFilename}`, isVerbose);
  }
  
  return 1;
}
```

### 3. Adapter Method Addition

Add to each adapter (`claude-adapter.js`, `copilot-adapter.js`, `codex-adapter.js`):

```javascript
getInstructionsFilename() {
  // Claude: 'CLAUDE.md'
  // Copilot: 'copilot-instructions.md'
  // Codex: 'AGENTS.md'
}
```

### 4. Orchestrator Integration

In `bin/lib/installer/orchestrator.js`:

**Non-verbose mode (after line 168):**
```javascript
// Phase 3: Install shared directory
stats.shared = await installShared(templatesDir, targetDir, templateVars, null, isVerbose);
displayCompletionLine('Shared', stats.shared, stats.shared);

// Phase 4: Install platform instructions
stats.instructions = await installPlatformInstructions(templatesDir, targetDir, templateVars, null, isVerbose, adapter);
displayCompletionLine('Platform Instructions', stats.instructions, stats.instructions);
```

**Verbose mode (after line 185):**
```javascript
console.log();
logger.simpleSubtitle('Installing Shared Directory');
stats.shared = await installShared(templatesDir, targetDir, templateVars, null, isVerbose);

console.log();
logger.simpleSubtitle('Installing Platform Instructions');
stats.instructions = await installPlatformInstructions(templatesDir, targetDir, templateVars, null, isVerbose, adapter);
```

## Plans

### Plan 09-01: Implement install-platform-instructions.js
- Create new function with merge logic
- Handle all 3 merge scenarios (new file, append, replace)
- Add verbose logging
- Unit tests for merge logic

### Plan 09-02: Add adapter method getInstructionsFilename()
- Implement in claude-adapter.js (returns 'CLAUDE.md')
- Implement in copilot-adapter.js (returns 'copilot-instructions.md')
- Implement in codex-adapter.js (returns 'AGENTS.md')
- Unit tests for each adapter

### Plan 09-03: Integrate into orchestrator.js
- Add import statement
- Call in non-verbose block (after installShared)
- Call in verbose block (after installShared)
- Update stats object
- Integration test

### Plan 09-04: Create integration tests
- Test new file creation
- Test append when no tags exist
- Test replace when tags exist
- Test template variable replacement
- Test all 3 platforms with correct filenames

## Success Criteria

- [ ] New function `installPlatformInstructions()` created
- [ ] Merge logic handles all 3 scenarios correctly
- [ ] Tag detection and replacement works with `<gsd_instructions>` markers
- [ ] All 3 adapters return correct filenames
- [ ] Orchestrator calls function in both verbose modes
- [ ] Template variables (PLATFORM_ROOT, COMMAND_PREFIX) replaced correctly
- [ ] Integration tests pass for all platforms
- [ ] No duplicate content when installing multiple times
- [ ] User content preserved when replacing GSD section

## Dependencies

- Phase 2: Core installer (templates system, variable replacement)
- Phase 3: Multi-platform support (adapters)
- Existing: `install-shared.js` as reference implementation

## Files Modified

- `bin/lib/installer/install-platform-instructions.js` (NEW)
- `bin/lib/installer/orchestrator.js` (modify)
- `bin/lib/platforms/claude-adapter.js` (add method)
- `bin/lib/platforms/copilot-adapter.js` (add method)
- `bin/lib/platforms/codex-adapter.js` (add method)
- `tests/integration/platform-instructions.test.js` (NEW)

## Notes

- This is a v2.1+ feature (post-v2.0 release)
- Does NOT affect existing v2.0 installations (backward compatible)
- Template file `templates/AGENTS.md` already exists
- Similar pattern to `install-shared.js` makes implementation straightforward
