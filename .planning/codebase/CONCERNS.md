# Codebase Concerns

**Analysis Date:** 2026-01-20

**Analysis Scope:**
- Files scanned: 55 source files
- TODO/FIXME found: 0 instances
- Large files (>500 LOC): 2 files

## Tech Debt

**Massive install.js file:**
- Issue: `bin/install.js` contains 1,170 lines of mixed concerns (CLI detection, interactive prompts, file copying, validation, error handling)
- Files: `bin/install.js`
- Impact: Difficult to maintain, test, and modify installation logic. High cognitive load for contributors. Changes risk breaking multiple installation paths.
- Fix approach: Refactor into separate modules: `lib/installer/prompt.js`, `lib/installer/file-ops.js`, `lib/installer/validation.js`, `lib/installer/statusline.js`. Keep `install.js` as thin orchestrator.

**Complex conditional logic in install.js:**
- Issue: Lines 1126-1170 contain deeply nested if-else chains with 10+ `process.exit(1)` calls for flag validation
- Files: `bin/install.js` (lines 1126-1170)
- Impact: Hard to test all code paths, easy to introduce logic errors when adding new flags. Exit calls scattered throughout make graceful error handling impossible.
- Fix approach: Extract validation to `validateFlags()` function that returns error objects instead of calling `process.exit()`. Use lookup table or validation rules array instead of nested conditionals.

**Sync file operations in critical paths:**
- Issue: 21 instances of `fs.readFileSync`/`fs.writeFileSync` in install script and utilities
- Files: `bin/install.js`, `bin/lib/adapters/*.js`
- Impact: Blocks Node.js event loop during file I/O. Degrades performance on slow filesystems. Makes concurrent operations impossible.
- Fix approach: Already partially addressed - `lib-ghcc/state-io.js` provides async patterns. Migrate remaining sync operations to use `fs.promises` API.

**Limited structured logging:**
- Issue: 362 console.log/error/warn calls scattered throughout codebase without log levels, contexts, or structured data
- Files: All modules
- Impact: Difficult to debug production issues, no ability to filter logs by severity, can't parse logs programmatically
- Fix approach: Introduce lightweight logger (e.g., `lib-ghcc/logger.js`) with levels (DEBUG, INFO, WARN, ERROR) and optional JSON output mode. Migrate console.* calls incrementally.

## Known Bugs

**Session expiry edge case:**
- Symptoms: `SessionManager` marks sessions as stale after 24 hours but doesn't clean up expired session files
- Files: `lib-ghcc/session-manager.js` (lines 92-100)
- Trigger: Long-running projects with infrequent CLI usage accumulate expired session files in `.planning/`
- Workaround: Manually delete `.planning/.session.json` if experiencing state issues
- Fix: Add `cleanupExpiredSessions()` method to remove stale files during `readSession()` or on state initialization

**Lock directory not cleaned on process kill:**
- Symptoms: If CLI process is killed (SIGKILL) during state write, `.planning/.lock` directory remains and blocks future operations
- Files: `lib-ghcc/directory-lock.js` (lines 66-98)
- Trigger: User kills process with `kill -9` or IDE termination during operation
- Workaround: Manual removal of `.planning/.lock` directory
- Fix: Add lock staleness detection (check lock age, clean up locks older than 5 minutes). Document manual recovery in error message.

## Security Considerations

**Restrictive file permissions:**
- Risk: State files created with 0o600 permissions (owner-only read/write) may cause issues in team environments or CI/CD
- Files: `lib-ghcc/state-io.js` (line 45)
- Current mitigation: Permission mode is explicit and documented in code comments
- Recommendations: Add configuration option to allow more permissive modes (0o644) for shared environments. Document security implications in README.

**No input sanitization in install.js:**
- Risk: `--config-dir` flag accepts arbitrary paths without validation. Could write to unintended directories if combined with malicious npm scripts.
- Files: `bin/install.js` (lines 49-66)
- Current mitigation: None explicit
- Recommendations: Validate config-dir path is within user home directory or current project. Reject absolute paths to system directories. Add path traversal checks (`../` sequences).

**Temp file predictability:**
- Risk: Temp files use `${process.pid}.${Date.now()}.${Math.random()}` but Math.random() is not cryptographically secure
- Files: `lib-ghcc/state-io.js` (line 34)
- Current mitigation: PID and timestamp provide sufficient uniqueness for intended use case (preventing file conflicts, not security)
- Recommendations: Document that temp file names are not security-critical. If needed, migrate to `crypto.randomBytes()` for unpredictable suffixes.

## Performance Bottlenecks

**Synchronous file operations during install:**
- Problem: Install script performs multiple sync file reads/writes in sequence
- Files: `bin/install.js`
- Cause: Using `fs.readFileSync`/`fs.writeFileSync` instead of async operations
- Improvement path: Parallelize independent file operations using `Promise.all()`. Use async file APIs for non-blocking I/O. Estimated improvement: 40-60% faster install on slow disks.

**No caching in StateManager:**
- Problem: Every `readState()` call performs file I/O even if state hasn't changed
- Files: `lib-ghcc/state-manager.js`
- Cause: No in-memory cache or mtime-based change detection
- Improvement path: Add optional in-memory cache with configurable TTL. Check file mtime before reading. Profile to confirm if optimization is needed (may be premature).

**Large string concatenation in doc generators:**
- Problem: Doc generators build large strings using `+=` in loops
- Files: `bin/doc-generator/generate-comparison.js` (340 lines), `bin/doc-generator/generate-matrix.js` (159 lines)
- Cause: Not using array join pattern for efficient string building
- Improvement path: Refactor to use array accumulation and final `.join('')`. Minor impact but follows JS best practices.

## Fragile Areas

**State migration system:**
- Files: `lib-ghcc/state-migrations.js` (174 lines)
- Why fragile: Schema changes require careful version increments. Missing migration breaks existing projects. No rollback mechanism.
- Safe modification: Always add migrations, never modify existing ones. Test migrations with real `.planning/` directories from older versions. Add migration validation in CI.
- Test coverage: No automated tests for migration paths

**Multi-CLI state coordination:**
- Files: `lib-ghcc/directory-lock.js`, `lib-ghcc/state-io.js`, `lib-ghcc/state-validator.js`
- Why fragile: Race conditions possible if locking fails. Filesystem atomicity assumptions may not hold on network filesystems (NFS, SMB).
- Safe modification: Never bypass `withLock()` when writing state. Test on network filesystems if deploying in team environments. Document filesystem requirements.
- Test coverage: Manual testing only, no automated concurrency tests

**CLI adapter abstraction:**
- Files: `bin/lib/adapters/claude.js` (152 lines), `bin/lib/adapters/copilot.js` (204 lines), `bin/lib/adapters/codex.js` (204 lines)
- Why fragile: Each adapter has slightly different path conventions and config locations. Adding new features requires updating all three adapters consistently.
- Safe modification: Keep changes symmetric across all three adapters. Run `test-cross-cli-state.js` after modifications. Consider extracting shared logic to `bin/lib/adapters/shared/`.
- Test coverage: Integration tests exist (`test-cross-cli-state.js`) but limited coverage

**Path rewriting for multi-CLI support:**
- Files: `bin/lib/adapters/shared/path-rewriter.js`
- Why fragile: Regex-based path replacement. Edge cases with unusual directory structures. Must handle relative paths, absolute paths, and tilde expansion.
- Safe modification: Add test cases for new path patterns before modifying. Use path normalization before regex matching.
- Test coverage: No automated tests

## Scaling Limits

**Single-threaded state operations:**
- Current capacity: Works well for single developer, occasional multi-CLI usage
- Limit: Lock contention if >5 concurrent CLI processes accessing same `.planning/` directory
- Scaling path: Current design is intentionally simple for target use case. If team usage grows, consider external locking service (Redis, etcd) or shard state by phase.

**In-memory metrics storage:**
- Current capacity: Performance metrics stored in Map with no size limits
- Limit: Unbounded growth if agent executions never clear metrics
- Scaling path: Add metrics rotation (keep last 1000 entries) or time-based expiry. Flush to disk periodically instead of accumulating in memory.

**Documentation generation performance:**
- Current capacity: Doc generators parse and process entire codebase
- Limit: Slow on large repositories (>1000 files)
- Scaling path: Add incremental generation (only regenerate changed sections). Cache parsed AST/comments. Consider moving to build-time generation instead of runtime.

## Dependencies at Risk

**Zero runtime dependencies:**
- Risk: Intentional design to avoid npm dependency tree bloat, but limits access to well-tested libraries
- Impact: Re-implementing features like structured logging, better locking primitives, or JSON schema validation
- Migration plan: Current approach is working well. If adding dependencies, prefer lightweight, stable packages with minimal sub-dependencies. Consider optional dependencies for enhanced features.

**Node.js version requirement:**
- Risk: Requires Node.js >=16.7.0 (specified in package.json). Older LTS versions not supported.
- Impact: Users on older Node versions cannot install
- Migration plan: Current requirement is reasonable (16.7.0 released July 2021). Consider testing on Node 18 LTS and 20 LTS explicitly. Document tested versions in README.

**File system atomicity assumptions:**
- Risk: Code assumes POSIX filesystem semantics (atomic rename, mkdir atomicity). May not hold on all platforms.
- Impact: State corruption possible on Windows SMB shares, network drives, or virtualized filesystems
- Migration plan: Add filesystem detection and warn users on non-POSIX filesystems. Provide alternative locking strategy for Windows network shares.

## Missing Critical Features

**Backup and recovery:**
- Problem: No automated backup of `.planning/` state before migrations or destructive operations
- Blocks: Recovery from migration failures, accidental state corruption, testing state changes safely
- Priority: Medium - Current manual recovery works but is error-prone

**State validation on every operation:**
- Problem: `StateValidator` exists but isn't automatically invoked on CLI operations
- Blocks: Early detection of state corruption, automatic repair of common issues
- Priority: Low - Users can manually run validation, automatic validation adds overhead

**Multi-user conflict resolution:**
- Problem: Lock-based approach prevents concurrent modifications but provides no merge strategy for divergent changes
- Blocks: Team workflows where multiple developers work on different phases simultaneously
- Priority: Low - Current use case is solo developers, teams use sequential phase completion

**Rollback mechanism:**
- Problem: No way to undo completed phase or revert state to previous version
- Blocks: Recovering from incorrect phase execution, iterating on phase definitions
- Priority: Medium - Git history provides some safety but state is separate

## Test Coverage Gaps

**State synchronization edge cases:**
- What's not tested: Concurrent writes from multiple processes, filesystem errors mid-write, corrupt JSON recovery
- Files: `lib-ghcc/state-io.js`, `lib-ghcc/directory-lock.js`, `lib-ghcc/state-manager.js`
- Risk: Silent data corruption, lock deadlocks, state inconsistency across CLIs
- Priority: High - Core functionality with complex failure modes

**Install script error paths:**
- What's not tested: Missing directory permissions, disk full, invalid user input, interrupted installation
- Files: `bin/install.js`
- Risk: Poor error messages, incomplete installations, corrupted config files
- Priority: Medium - Manual testing covers happy path, but error cases are untested

**CLI adapter equivalence:**
- What's not tested: All three adapters produce identical results for same operations
- Files: `bin/lib/adapters/*.js`
- Risk: Inconsistent behavior across Claude Code, Copilot CLI, and Codex CLI
- Priority: High - Cross-CLI consistency is core value proposition
- Note: `test-cross-cli-state.js` exists but has limited coverage (2 test scenarios)

**Migration paths:**
- What's not tested: Upgrading from each previous version to current version, missing version field, corrupted migration state
- Files: `lib-ghcc/state-migrations.js`
- Risk: Breaking existing user projects during package updates
- Priority: High - Migrations are one-way and irreversible

**Path rewriting edge cases:**
- What's not tested: Windows paths, UNC paths, symlinks, path traversal, non-ASCII characters
- Files: `bin/lib/adapters/shared/path-rewriter.js`
- Risk: Incorrect file paths in generated configs, cross-platform compatibility issues
- Priority: Medium - Most users on macOS/Linux, but Windows support is advertised

**Doc generator correctness:**
- What's not tested: Generated markdown is valid, comparisons are accurate, version stamps are applied correctly
- Files: `bin/doc-generator/*.js` (340-290 lines each)
- Risk: Incorrect documentation published to npm, misleading CLI comparison table
- Priority: Low - Documentation errors are non-breaking and easily fixed

**Performance tracker accuracy:**
- What's not tested: Measurement precision under load, metric persistence across sessions, edge cases (zero duration, missing end mark)
- Files: `bin/lib/orchestration/performance-tracker.js` (201 lines), `bin/lib/orchestration/performance-tracker.test.js` (198 lines)
- Risk: Inaccurate performance metrics, misleading benchmarks
- Priority: Low - Metrics are informational, not critical to functionality
- Note: Tests exist but don't cover error cases

---

*Concerns audit: 2026-01-20*
