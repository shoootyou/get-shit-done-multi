# Codebase Concerns

**Analysis Date:** 2026-01-19

## Tech Debt

**No Dependency Management:**
- Issue: No dependencies listed in `package.json` - relies only on Node.js built-ins
- Files: `package.json`, `bin/install.js`, `hooks/gsd-check-update.js`, `hooks/statusline.js`
- Impact: Limited flexibility, all functionality must use Node.js stdlib. No external libraries for enhanced features.
- Fix approach: This is intentional for zero-dependency portability, but consider if features like better terminal UI, HTTP clients, or JSON validation would benefit from deps.

**Empty Returns Pattern:**
- Issue: Silent failures with empty object/null returns instead of throwing errors
- Files: `bin/install.js:54`, `bin/install.js:116`, `bin/install.js:119`
- Impact: Errors in JSON parsing or settings reading fail silently, making debugging harder
- Fix approach: Add logging or throw descriptive errors when JSON parse fails or settings are corrupted

**Large Monolithic Install Script:**
- Issue: `bin/install.js` is 819 lines doing installation, file copying, path replacement, prompting, and verification
- Files: `bin/install.js`
- Impact: Hard to test individual functions, changes risk breaking multiple install scenarios
- Fix approach: Split into modules: `lib/installer.js`, `lib/path-utils.js`, `lib/prompt.js`, `lib/file-ops.js`

**Synchronous File Operations:**
- Issue: All file operations use sync APIs (`readFileSync`, `writeFileSync`, `rmSync`, `unlinkSync`)
- Files: `bin/install.js:114`, `bin/install.js:126`, `bin/install.js:168`, `bin/install.js:181`, `bin/install.js:183`, `bin/install.js:201`, `hooks/statusline.js:55`, `hooks/statusline.js:67`
- Impact: Blocks event loop during install, could cause issues with large file trees
- Fix approach: Migrate to async file operations with proper error handling. Consider using `fs/promises` API.

**Complex Path Replacement Logic:**
- Issue: String replacement for paths across 3 install modes (global, local, copilot) with many edge cases
- Files: `bin/install.js:132-159`
- Impact: Fragile to path variations, hard to verify all cases work. Easy to miss edge cases.
- Fix approach: Use structured path mapping with tests for each install scenario

**Stdin Edge Cases:**
- Issue: Complex workarounds for stdin not being TTY or closing unexpectedly (WSL2, npx scenarios)
- Files: `bin/install.js:734`, `bin/install.js:748-761`
- Impact: Installation may behave unexpectedly in different terminal environments
- Fix approach: Consider CLI argument approach instead of interactive prompts for CI/automated scenarios

**Background Process Spawn:**
- Issue: Update check spawns detached process with stringified code in spawn call
- Files: `hooks/gsd-check-update.js:21-46`
- Impact: Debugging is hard, error handling is minimal, process may silently fail
- Fix approach: Extract to separate script file, add proper error logging to cache file

## Known Bugs

**Double-execution Prevention:**
- Symptoms: Installer tracks `answered` flag to prevent double-execution when readline closes unexpectedly
- Files: `bin/install.js:749`, `bin/install.js:753-760`
- Trigger: Non-interactive terminals or stdin closure during prompt
- Workaround: Uses flag to prevent duplicate install attempts

**Statusline Silent Failures:**
- Symptoms: Statusline script catches all errors and fails silently
- Files: `hooks/statusline.js:81-83`
- Trigger: Any JSON parse error, missing cache files, or filesystem issues
- Workaround: None - errors are completely swallowed. Consider logging to temp file.

## Security Considerations

**Command Injection in Update Check:**
- Risk: Uses `execSync('npm view get-shit-done-cc version')` without input sanitization
- Files: `hooks/gsd-check-update.js:35`
- Current mitigation: Hard-coded package name, no user input
- Recommendations: Consider using npm registry API instead of shell command

**Path Traversal Risk:**
- Risk: User-provided `--config-dir` path is expanded but not validated
- Files: `bin/install.js:38-55`, `bin/install.js:101-106`, `bin/install.js:368`, `bin/install.js:763`
- Current mitigation: Only expands tilde, doesn't sanitize beyond that
- Recommendations: Validate config dir is within reasonable bounds, check for path traversal patterns (`..`, symlinks)

**Recursive Directory Deletion:**
- Risk: `fs.rmSync(destDir, { recursive: true })` deletes entire directory trees
- Files: `bin/install.js:168`
- Current mitigation: Only called on calculated install paths
- Recommendations: Add safety check to ensure path contains expected markers (`.claude`, `.github`) before deletion

**Environment Variable Injection:**
- Risk: Reads `process.env.CLAUDE_CONFIG_DIR` without validation
- Files: `bin/install.js:368`, `bin/install.js:763`
- Current mitigation: Only used for path resolution
- Recommendations: Validate env var doesn't contain malicious paths

## Performance Bottlenecks

**Synchronous NPM Check:**
- Problem: Update check runs `execSync('npm view ...')` with 10s timeout on every Claude session start
- Files: `hooks/gsd-check-update.js:35`
- Cause: Network call blocks for up to 10 seconds
- Improvement path: Cache more aggressively (24hrs), reduce timeout to 3s, or skip check if offline

**Recursive File Operations:**
- Problem: Install copies entire directory trees synchronously without streaming
- Files: `bin/install.js:165-188`
- Cause: Recursive readDir/writeFile on entire agent + command + skill directories
- Improvement path: Use streams for large files, show progress for long operations

**Statusline Reads Multiple Files:**
- Problem: Every statusline render reads multiple JSON files from disk
- Files: `hooks/statusline.js:46-72`
- Cause: Checks todos directory, cache file on every statusline update
- Improvement path: Add in-memory cache with TTL, batch reads

## Fragile Areas

**Path Replacement in Markdown:**
- Files: `bin/install.js:132-159`, `bin/install.js:180-183`
- Why fragile: Uses 15+ string replacements to update paths in .md files. Easy to miss edge cases or add conflicting patterns.
- Safe modification: Add test cases for each install mode (global, local, copilot) before changing patterns
- Test coverage: None - no automated tests

**Settings.json Manipulation:**
- Files: `bin/install.js:111-127`, `bin/install.js:210-246`
- Why fragile: Direct JSON parse/stringify without schema validation. Orphaned hook cleanup relies on string matching.
- Safe modification: Read existing settings first, backup before writing, validate structure
- Test coverage: None - no tests for settings merging or cleanup

**Interactive Prompt Flow:**
- Files: `bin/install.js:700-788`
- Why fragile: Multiple nested callbacks, readline event handling, edge cases for non-TTY terminals
- Safe modification: Test in multiple environments (Mac terminal, WSL2, CI, npx)
- Test coverage: None - manual testing only

**Hook Registration:**
- Files: `bin/install.js:470-540`
- Why fragile: Compares existing hook arrays, merges with new hooks, handles different formats
- Safe modification: Ensure hooks array is well-formed before merging, validate command paths exist
- Test coverage: None

## Scaling Limits

**Single Install Script:**
- Current capacity: Handles ~10 agents, ~25 commands, statusline hook
- Limit: 819-line script becomes unmaintainable beyond current scope
- Scaling path: Modularize into separate installer, file utilities, hook manager, path transformer

**Agent File Size:**
- Current capacity: 11 agents totaling 8,337 lines
- Limit: Large agent files (35K+ lines like `gsd-debugger.md`) are hard to maintain
- Scaling path: Consider splitting large agents into sub-agents or extracting shared references

**Cache Directory Growth:**
- Current capacity: `~/.claude/cache/` stores update check results
- Limit: Single cache file, no cleanup strategy
- Scaling path: Add cache eviction, size limits, or periodic cleanup

## Dependencies at Risk

**Node.js Built-ins Only:**
- Risk: Zero external dependencies means vulnerable to Node.js API changes
- Impact: Breaking changes in `fs`, `readline`, `child_process` APIs could break installer
- Migration plan: Pin minimum Node version (currently >=16.7.0), test on major Node releases

**Relies on npm CLI:**
- Risk: Update check uses `npm view` command which may not be available in all environments
- Impact: Update notification breaks if npm not in PATH
- Migration plan: Consider npm registry HTTP API instead of CLI

## Missing Critical Features

**No Rollback Mechanism:**
- Problem: Install overwrites files without backup, no way to undo
- Blocks: Users can't easily revert to previous GSD version if new version breaks
- Priority: High

**No Version Migration:**
- Problem: No automated migration for breaking changes between versions
- Blocks: Users must manually clean up when file structure or settings format changes
- Priority: Medium

**No Install Verification:**
- Problem: Install checks if files exist but doesn't verify they work
- Blocks: Broken installs may not be detected until user tries to use commands
- Priority: Medium

## Test Coverage Gaps

**Install Script:**
- What's not tested: All installation logic, path replacement, settings merging
- Files: `bin/install.js`
- Risk: Breaking changes can ship undetected, regressions in install scenarios
- Priority: High

**Hook Scripts:**
- What's not tested: Update check background process, statusline rendering
- Files: `hooks/gsd-check-update.js`, `hooks/statusline.js`
- Risk: Hook failures are silent, no way to detect if they work
- Priority: Medium

**Command Orchestrators:**
- What's not tested: None of the GSD commands have automated tests
- Files: `commands/gsd/*.md`
- Risk: Command changes may break workflows, no regression detection
- Priority: Low - commands are prompts, not code

---

*Concerns audit: 2026-01-19*
