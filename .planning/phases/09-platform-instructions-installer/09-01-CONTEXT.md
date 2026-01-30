---
phase: 9
discussed: 2026-01-30T02:55:00Z
areas: [marcadores-de-bloque, merge-behavior, template-structure, error-handling, documentación]
decisions_count: 18
---

# Phase 9 Context: Platform Instructions Installer

## Essential Features

**Smart Merge Installation:**
- Install `templates/AGENTS.md` to platform-specific instruction files
- Platform targets:
  - Codex: `[root]/AGENTS.md`
  - Claude: `[root]/CLAUDE.md`
  - Copilot: `.github/copilot-instructions.md`
- Dynamic block detection using first and last lines as markers
- Three merge scenarios: create new, append, or replace with intelligent insertion

**Block Detection Logic:**
- Read template file completely
- Extract first line → start marker (after variable replacement)
- Extract last line → end marker (after variable replacement)
- Count total lines → block length
- Use these dynamic values to search in destination file

**Merge Scenarios:**
1. **File doesn't exist:** Create new file with processed template content
2. **File exists, no start marker found:** Append template to end with 1 blank line separator
3. **File exists, start marker found:** 
   - Compare X lines (template length) starting from marker
   - If exact match → skip (already up to date)
   - If no match → replace block, pushing other content down
   - If another markdown title found mid-block → insert full template before that title

## Technical Boundaries

**Variable Replacement:**
- Replace `{{PLATFORM_ROOT}}` and `{{COMMAND_PREFIX}}` BEFORE extracting markers
- This means markers will vary by platform (different command prefixes)
- Comparison in destination file uses post-replacement markers

**Comparison Rules:**
- Line-by-line EXACT text comparison (case-sensitive, spaces included)
- No fuzzy matching or partial matches
- Any difference triggers full block replacement

**Installation Flow:**
- Install AFTER `installShared()` in orchestrator
- Integrate in both verbose and non-verbose modes
- Use existing template-renderer for variable replacement
- Function signature matches pattern: `(templatesDir, targetDir, variables, multiBar, isVerbose, adapter)`

**Adapter Method:**
- Add `getInstructionsFilename()` to each adapter
- Returns platform-specific filename (no path logic, just filename)

## Scope Limits

**OUT of scope:**
- XML-style tags like `<gsd_instructions>` (not used)
- Manual diff/merge tools
- Backup of original file before modification
- GUI or interactive merge conflict resolution
- Support for platforms beyond Claude/Copilot/Codex

**Deferred to future phases:**
- Advanced merge strategies (3-way merge, etc.)
- User notification system for conflicts
- Rollback mechanism for failed merges

## Open Questions

**Research needed:**
- How to handle very large instruction files (>1MB) efficiently?
- Should we add SHA256 hash comparison as optimization (skip if hash matches)?
- What's the performance impact of line-by-line comparison for large files?
- Are there edge cases with different line endings (CRLF vs LF)?

## Implementation Decisions

**Block Insertion Logic:**
When replacing block and another markdown title is found:
1. Find start marker (`# Instructions for GSD`)
2. Start reading X lines (template length)
3. If another `#` title found at line N (where N < X):
   - Insert complete template (X lines) at start marker position
   - Push everything from line N onwards down
   - Preserve user's custom sections intact

**Error Handling:**
- File permission errors → FAIL installation (error fatal)
- Partial line matches → Replace entire block (no partial updates)
- Missing end marker → Still attempt replacement based on block length
- Write failures → Propagate error up to orchestrator

**Logging:**
- Verbose mode: Log action taken (created/appended/replaced/skipped)
- Non-verbose: Simple completion line with count
- Example: `"Updated CLAUDE.md (replaced GSD section)"`

## Documentation Updates

**Files to update:**

1. **`docs/what-gets-installed.md`**
   - Add section: "Platform Instructions File (1 file)"
   - List platform-specific filenames
   - Explain merge behavior briefly
   - Total count: 4 types of files (was 3)

2. **`docs/how-to-customize.md`**
   - New section: "Customizing Platform Instructions"
   - Explain safe zones (before/after GSD block)
   - Show how to add custom instructions without conflicts
   - Mention automatic merge on upgrade

3. **`docs/how-to-install.md`**
   - Update: "3 types of files" → "4 types of files"
   - Brief mention of platform instructions file
   - Link to what-gets-installed for details

## Success Criteria

- [ ] Block detection works with dynamic first/last line extraction
- [ ] Variable replacement happens before marker extraction
- [ ] All 3 merge scenarios (create/append/replace) work correctly
- [ ] Exact line-by-line comparison implemented
- [ ] Title interruption handled (insert full block before new title)
- [ ] Permission errors fail installation gracefully
- [ ] All 3 platforms use correct filename via adapter method
- [ ] Verbose and non-verbose modes integrated in orchestrator
- [ ] Documentation updated in 3 identified files
- [ ] Integration tests cover all merge scenarios and platforms
