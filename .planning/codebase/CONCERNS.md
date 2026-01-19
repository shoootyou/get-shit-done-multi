# Codebase Concerns

**Analysis Date:** 2026-01-19

## Tech Debt

**Empty catch blocks - Silent error suppression:**
- Issue: Multiple catch blocks swallow exceptions without logging, making debugging difficult
- Files: `hooks/gsd-check-update.js:31`, `hooks/gsd-check-update.js:36`, `hooks/statusline.js:58`, `hooks/statusline.js:71`
- Impact: Update check failures and statusline errors fail silently - users don't know when features break
- Fix approach: Add minimal logging (e.g., write to stderr or debug file) to catch blocks while keeping non-blocking behavior

**Synchronous file operations in installer:**
- Issue: Installer uses `fs.readFileSync`, `fs.writeFileSync` throughout, blocking event loop during installation
- Files: `bin/install.js:114`, `bin/install.js:126`, `bin/install.js:168`, `bin/install.js:170`, `bin/install.js:304`, `bin/install.js:321`, `bin/install.js:401`, `bin/install.js:403`
- Impact: Large projects with many agent files can freeze installer for several seconds, poor UX on slower systems
- Fix approach: Migrate to async/await with `fs.promises` API for better performance, especially for multi-file operations

**Destructive clean install behavior:**
- Issue: Installer performs `fs.rmSync(destDir, { recursive: true })` at line 155 to remove existing directories before copying
- Files: `bin/install.js:155`
- Impact: User customizations or local changes to GSD files in `.claude/` get wiped without warning during updates
- Fix approach: Implement backup mechanism or selective file merge instead of full directory deletion

**Large monolithic installer file:**
- Issue: Single 768-line installer handles all installation logic, path replacement, settings management, and user interaction
- Files: `bin/install.js` (768 lines)
- Impact: Difficult to maintain, test, or extend - adding new installation targets requires understanding entire file
- Fix approach: Extract modules for settings management, path replacement, file operations, and user prompting

**Empty return values without context:**
- Issue: Functions return `null`, `{}`, or `[]` without clear error indication
- Files: `bin/install.js:54`, `bin/install.js:116`, `bin/install.js:119`
- Impact: Callers can't distinguish between "settings file missing" vs "settings file corrupted" scenarios
- Fix approach: Use explicit error objects or throw exceptions with context instead of silent fallback values

## Known Bugs

**WSL2/Non-TTY detection fallback:**
- Symptoms: Installation prompts fail or hang on WSL2 and non-interactive terminals
- Files: `bin/install.js:682-689`
- Trigger: Running `npx get-shit-done-cc` in WSL2 or piped stdin environments
- Workaround: Fixed in v1.6.4 - now detects non-TTY and falls back to global install automatically

**Orphaned hook files from previous versions:**
- Symptoms: Old `gsd-notify.sh` hook remains after updating from pre-1.6.x versions
- Files: Referenced in `bin/install.js:180-192`
- Trigger: Updating from v1.5.x or earlier
- Workaround: Installer now auto-removes orphaned files in `cleanupOrphanedFiles()` function

## Security Considerations

**Command execution from external data:**
- Risk: `execSync('npm view get-shit-done-cc version')` in background process without input validation
- Files: `hooks/gsd-check-update.js:35`
- Current mitigation: Command is hardcoded string without user input interpolation, runs with 10s timeout
- Recommendations: No immediate risk, but document that custom forks should validate package names if they parameterize this

**Tilde expansion from environment variables:**
- Risk: Manual tilde expansion at `bin/install.js:101-106` could mishandle malicious paths
- Files: `bin/install.js:101-106`
- Current mitigation: Only applied to `CLAUDE_CONFIG_DIR` env var and `--config-dir` argument
- Recommendations: Use `os.homedir()` consistently and validate paths don't escape expected directories

**Path traversal in installation targets:**
- Risk: No validation that custom `--config-dir` paths don't write outside expected boundaries
- Files: `bin/install.js:38-56` (parseConfigDirArg)
- Current mitigation: None - user controls destination path completely
- Recommendations: Add path validation to ensure config directory is absolute and doesn't use `..` traversal

## Performance Bottlenecks

**Synchronous file I/O during installation:**
- Problem: Installer blocks on every file read/write, creating noticeable lag
- Files: `bin/install.js:152-175` (copyWithPathReplacement), multiple fs.*Sync calls throughout
- Cause: Using sync API for convenience, but affects perceived installation speed
- Improvement path: Batch file operations with Promise.all() after converting to async

**Spawned update check process at every session start:**
- Problem: SessionStart hook spawns Node.js subprocess to check npm for updates every time
- Files: `hooks/gsd-check-update.js:21-51`
- Cause: No rate limiting or cache TTL check before spawning
- Improvement path: Check cache timestamp first, only spawn if >24 hours since last check

**Statusline reads entire todos directory on every render:**
- Problem: Reads and filters all todo files on each statusline update
- Files: `hooks/statusline.js:47-71`
- Cause: No in-memory caching of session-specific todo file path
- Improvement path: Cache todo file path in memory or use session-based lookup instead of scanning directory

## Fragile Areas

**Path replacement in markdown files:**
- Files: `bin/install.js:130-145` (replaceClaudePaths), `bin/install.js:152-175`
- Why fragile: String replacement with regex can break if markdown files contain similar patterns in code blocks or examples
- Safe modification: Test path replacement against all agent .md files, add unit tests for edge cases
- Test coverage: None - no automated tests for path replacement logic

**Settings.json merge logic:**
- Files: `bin/install.js:197-233` (cleanupOrphanedHooks)
- Why fragile: Deep object manipulation of hook arrays without schema validation
- Safe modification: Validate settings structure before manipulation, add explicit error handling for malformed settings
- Test coverage: None - no tests for settings merge or cleanup

**Readline prompt handling with multiple exit paths:**
- Files: `bin/install.js:680-710` (promptLocation), `bin/install.js:650-675` (handleStatusline)
- Why fragile: Complex async flow with multiple callbacks, close event handlers, and answered flag to prevent double-execution
- Safe modification: Refactor to async/await or Promises to linearize control flow
- Test coverage: None - difficult to test interactive prompts without mocking

## Scaling Limits

**Single-file command distribution:**
- Current capacity: 26 commands in `commands/gsd/` directory (average 8KB each)
- Limit: No technical limit, but discoverability and maintenance difficulty increases linearly
- Scaling path: Group related commands into sub-namespaces (e.g., `/gsd:plan/*`, `/gsd:execute/*`) or add command categories

**Agent markdown file duplication:**
- Current capacity: 13 agents x 2 locations (source + installed) = 26 files kept in sync
- Limit: Installation copies agents to both `.claude/agents/` and `.github/agents/`, doubling storage and update complexity
- Scaling path: Use symlinks where supported, or generate target-specific versions only when needed

## Dependencies at Risk

**No dependencies declared:**
- Risk: Package has zero runtime dependencies, relies entirely on Node.js built-ins
- Impact: No dependency supply chain risk, but limits functionality to Node.js stdlib capabilities
- Migration plan: Not applicable - this is actually a strength of the project

**Minimum Node.js version (16.7.0):**
- Risk: Node 16 reaches EOL September 2023 - some users on LTS versions may have older Node
- Impact: Package won't install on Node < 16.7.0 due to engines requirement
- Migration plan: Consider bumping minimum to Node 18 LTS (maintained until 2025-04-30) and document in README

## Missing Critical Features

**No rollback mechanism:**
- Problem: If installation fails midway, no way to restore previous GSD version
- Blocks: Safe updates - users risk breaking their setup when updating
- Priority: Medium - workaround is to reinstall previous version via npm

**No installation verification:**
- Problem: Installer shows checkmarks but doesn't verify files are actually usable
- Blocks: Detecting corrupted installations or permission issues
- Priority: Low - installer now has basic verification (v1.6.4+), but doesn't test file contents

**No automated tests:**
- Problem: Entire project has zero test files (0 test files found)
- Blocks: Confident refactoring, preventing regressions, validating edge cases
- Priority: High - critical for maintaining quality as project grows

## Test Coverage Gaps

**Installer logic (bin/install.js):**
- What's not tested: Path replacement, settings merging, orphan cleanup, readline prompts, file operations
- Files: `bin/install.js` (768 lines, 0% coverage)
- Risk: Changes to installer can break installation on different platforms without detection
- Priority: High

**Hook scripts:**
- What's not tested: Update check logic, statusline rendering, cache file handling
- Files: `hooks/gsd-check-update.js` (52 lines), `hooks/statusline.js` (84 lines)
- Risk: Silent failures in background processes, malformed statusline output
- Priority: Medium

**Command markdown files:**
- What's not tested: 26 command definitions in `commands/gsd/` have no validation
- Files: All `.md` files in `commands/gsd/` directory
- Risk: Syntax errors or incorrect instructions in command files only discovered at runtime by users
- Priority: Low - these are consumed by Claude, harder to unit test

## CI/CD Pipeline Missing

**No automated CI:**
- Problem: No GitHub Actions, CircleCI, or other CI pipeline detected
- Impact: Manual testing required for every change, no automated validation before npm publish
- Files: `.github/workflows/` directory does not exist
- Priority: High - increases risk of publishing broken versions to npm

**No automated npm publishing:**
- Problem: Package publishing appears to be manual process
- Impact: Human error in version tagging, changelog updates, or npm publish command
- Priority: Medium - could automate with semantic-release or GitHub Actions

---

*Concerns audit: 2026-01-19*
