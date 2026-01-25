---
phase: 1
phase_name: Core Installer Foundation
discussed: 2026-01-25T21:54:00Z
areas: [Installation Output & Feedback, Path Resolution & Existing Files, Template Variable Behavior, CLI Flag Interaction & Help Text]
decisions_count: 16
---

# Phase 1 Context: Core Installer Foundation

**Goal:** User can install get-shit-done skills to Claude Code via `npx get-shit-done-multi --claude`

This document captures implementation decisions from phase discussion. Use this to guide research and planning.

---

## 1. Installation Output & Feedback

### Progress Display
- **Style:** Moderate verbosity with step-based progress
- **Format:** Show major steps with checkmarks
  - Example: `✓ Copying templates...`
  - Example: `✓ Installing to ~/.claude/skills/gsd/`
- **Not detailed:** Don't show individual file operations
- **Not minimal:** Don't use just a spinner without context

### Success Message
- **Content:** Completion message + next steps
- **Include:**
  - Installation confirmation
  - Where files were installed
  - How to use the installed skills (next command to run)
- **Example format:**
  ```
  ✓ Installation complete!
  
  Installed to: ~/.claude/skills/gsd/
  
  Next steps:
  - Restart Claude Code or reload skills
  - Run /gsd-new-project to start a new project
  ```

### Error Messages
- **Format:** Error message + actionable fix suggestion
- **Include:**
  - Clear description of what went wrong
  - Concrete action user can take to fix it
  - No stack traces in user-facing errors
- **Example:**
  ```
  ✗ Permission denied to write ~/.claude/skills/
  
  Fix: Check directory permissions or create the directory manually:
  mkdir -p ~/.claude/skills/
  ```

### Output Styling
- **Colors:** Auto-detect terminal capabilities
  - Use colors (green ✓, red ✗, yellow warnings) if TTY detected
  - Plain text if output is piped or redirected
- **Flag:** Support `--no-color` flag to disable colors
- **Dependencies:** Use chalk for color support with auto-detection

---

## 2. Path Resolution & Existing Files

### Missing Directories
- **Behavior:** Create automatically
- **Feedback:** Inform user about directory creation
- **Example:** `Created ~/.claude/skills/gsd/`
- **Recursive:** Create parent directories as needed (`mkdir -p` behavior)

### Existing Files
- **Behavior:** Overwrite silently
- **Rationale:** Assume user is updating/re-installing
- **No prompts:** Don't ask for confirmation per file
- **Future:** Phase 5 adds version detection for smarter update behavior

### Symlinks
- **Behavior:** Warn but continue
- **Message:** `⚠ Warning: ~/.claude/skills/ is a symlink`
- **Action:** Follow symlink and install to target location
- **No error:** Don't block installation due to symlinks

### Permission Errors
- **Behavior:** Error immediately and exit
- **Message:** Clear error without sudo suggestion
- **Example:** `✗ Permission denied to write ~/.claude/skills/`
- **No fallbacks:** Don't attempt alternative locations
- **User responsibility:** Let user fix permissions or use appropriate directory

---

## 3. Template Variable Behavior

### Supported Variables
**Extended set for Phase 1:**
- `{{PLATFORM_ROOT}}` → `.claude/` (platform-specific root directory)
- `{{VERSION}}` → `2.0.0` (installer version)
- `{{COMMAND_PREFIX}}` → `/gsd-` (command prefix for skills)
- `{{INSTALL_DATE}}` → ISO 8601 timestamp of installation
- `{{USER}}` → Current username from system
- `{{PLATFORM_NAME}}` → `claude` (platform identifier)

### Missing Variable Handling
- **Behavior:** Replace with placeholder
- **Format:** `[MISSING:VARIABLE_NAME]`
- **Example:** `{{UNDEFINED}}` → `[MISSING:UNDEFINED]`
- **Rationale:** Makes issues visible without breaking rendering
- **Future:** Phase 6 may add stricter validation

### Variable Name Rules
- **Case:** Uppercase only (canonical form enforced)
- **Valid:** `{{VERSION}}` ✓
- **Invalid:** `{{version}}` ✗ (will not be replaced, becomes `[MISSING:version]`)
- **Rationale:** Consistency in template authoring
- **No warnings:** Lowercase variables treated as undefined

### Template Validation
- **Timing:** Pre-validate before any file writes
- **Scan:** Check all templates for:
  - Proper `{{...}}` syntax
  - Known variable names
  - Balanced braces
- **Fail fast:** Error and exit if validation fails
- **Error message:** List all problematic templates and issues found
- **Rationale:** Catch issues before making any filesystem changes

---

## 4. CLI Flag Interaction & Help Text

### Help Text Structure
- **Default (`--help`):** Brief help (10-15 lines)
  - Usage line
  - Common flags with descriptions
  - Example: `npx get-shit-done-multi --claude`
- **Detailed (`--help-full`):** Full documentation (30-40 lines)
  - All flags with descriptions
  - Multiple examples
  - Links to online docs
  - Troubleshooting tips

### Version Output
- **Format:** Version + installation detection
- **Display:**
  ```
  get-shit-done-multi v2.0.0
  
  Installed at:
  - ~/.claude/skills/gsd/ (Claude Code)
  
  (no other installations detected)
  ```
- **Detection:** Check for existing GSD installations and show them
- **Phase 1:** Basic detection (check if directories exist)
- **Phase 5:** Enhanced detection (read manifests, show versions)

### Invalid Flag Handling
- **Behavior:** Show error + suggest closest match
- **Algorithm:** Levenshtein distance or simple prefix matching
- **Example:**
  ```
  ✗ Unknown flag: --clude
  
  Did you mean: --claude?
  
  Run --help for all available flags.
  ```
- **Suggestions:** Show up to 3 closest matches if multiple are close

### Multiple Platform Flags (Phase 1)
- **Phase 1 scope:** Claude only
- **Behavior:** Error if non-Claude platform specified
- **Example:**
  ```
  ✗ --copilot is not supported in this version
  
  Phase 1 supports --claude only.
  Copilot and Codex support coming in Phase 2.
  ```
- **Future:** Phase 2 adds support for multiple platforms simultaneously

---

## Scope Boundaries

### In Scope (Phase 1)
- NPX entry point (`bin/install.js`)
- Basic file operations (copy, create directories)
- Template variable replacement (string-based)
- Path normalization and basic validation
- CLI flags: `--claude`, `--help`, `--help-full`, `--version`, `--no-color`
- Error handling with actionable messages
- Installation to `~/.claude/skills/gsd/` only

### Out of Scope (Future Phases)
- **Phase 2:** Copilot and Codex support, adapter pattern
- **Phase 3:** Interactive prompts (no flags = interactive mode)
- **Phase 4:** Atomic transactions and rollback
- **Phase 5:** Version comparison and update detection
- **Phase 6:** Advanced path security (traversal prevention)
- **Phase 7:** Complete documentation

### Explicitly Not Included
- Interactive prompts (comes in Phase 3)
- Rollback on failure (comes in Phase 4)
- Version checking and updates (comes in Phase 5)
- Multi-platform adapters (comes in Phase 2)
- Advanced security validation (comes in Phase 6)

---

## Open Questions for Research

### Template Engine Choice
- Should Phase 1 use a template library (EJS, Mustache) or just string replacement?
- Tradeoff: Simplicity vs future extensibility
- Consider: Phase 2 may need conditional logic for platform differences

### Path Validation Depth
- What level of path validation is needed in Phase 1?
- Current: Basic normalization (`path.join`, `path.resolve`)
- Future: Phase 6 adds traversal prevention and symlink resolution
- Question: Is basic validation sufficient for Phase 1?

### Error Recovery Strategies
- Should Phase 1 attempt any recovery, or just fail fast?
- Current decision: Fail fast with clear error messages
- Future: Phase 4 adds transaction-based rollback
- Question: Are there low-hanging recovery opportunities?

### Cross-Platform Path Handling
- Phase 1 targets macOS/Linux (`~/.claude/`)
- Windows uses different paths (`%APPDATA%` or `%USERPROFILE%`)
- Question: Should Phase 1 include basic Windows support, or defer entirely?
- Current: Defer Windows-specific testing to Phase 7

---

## Technical Constraints

### Dependencies
- **Required:** Node.js ≥16.7.0 (for native ESM)
- **Allowed:** fs-extra, chalk, minimist/commander (CLI parsing)
- **Not yet:** @clack/prompts (Phase 3), ora (Phase 3), semver (Phase 5)

### File Structure
- Entry: `/bin/install.js` (thin orchestrator)
- Modules: `/bin/lib/` (domain-organized)
  - `/bin/lib/io/` - file operations
  - `/bin/lib/rendering/` - template processing
  - `/bin/lib/paths/` - path resolution
  - `/bin/lib/validation/` - template validation
- Templates: `/templates/skills/`, `/templates/agents/`
- Shared: `/get-shit-done/` (copied to install location)

### Code Organization
- Follow SOLID principles
- Keep `install.js` thin (orchestration only)
- Domain libraries with clean APIs
- No duplication across modules
- Each module owns one responsibility

---

## Success Criteria Refinement

### From Roadmap
1. ✓ User runs `npx get-shit-done-multi --claude` → installs to `~/.claude/skills/gsd/`
2. ✓ Shared directory copies to `.claude/get-shit-done/` with manifest template
3. ✓ Template variables replaced correctly in output files
4. ✓ Installation completes in <30 seconds
5. ✓ `--help` and `--version` show correct information
6. ✓ Version displays as 2.0.0

### Additional Criteria from Discussion
7. ✓ Progress shows moderate detail (step-based with checkmarks)
8. ✓ Success message includes next steps
9. ✓ Errors include actionable fix suggestions
10. ✓ Colors auto-detect with `--no-color` override
11. ✓ Missing directories created automatically
12. ✓ Existing files overwritten silently
13. ✓ Symlinks generate warning but continue
14. ✓ Permission errors fail with clear message
15. ✓ Invalid flags suggest closest match
16. ✓ Template validation happens before file writes

---

**Context captured:** 2026-01-25  
**Ready for:** Research phase (`/gsd-research-phase 1`) or direct planning (`/gsd-plan-phase 1`)
