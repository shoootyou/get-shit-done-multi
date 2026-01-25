# Phase 7: Multi-Platform Testing - Context

**Gathered:** 2026-01-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Test installation and execution of all 29 GSD commands on 3 platforms (Claude Code, GitHub Copilot CLI, Codex CLI) with comprehensive coverage. Verify tool mapping, platform-specific content rendering, legacy fallback, Jest test suite, and regression testing to ensure spec-based commands behave identically to legacy versions.

</domain>

<decisions>
## Implementation Decisions

### Test environment setup
- **Isolation method:** Isolated directories on same machine (not Docker, VMs, or containers)
- **Repository structure:** Separate repos per platform (3 clones of GSD)
- **Git identity:** Use same git identity for all platforms (consistent attribution)
- **Cleanup strategy:** Clean state before each test (re-install, not incremental or snapshot/restore)

### Test execution strategy
- **Automation level:** Hybrid approach — automated install, manual command testing
- **Test order:** Test one platform fully before moving to next platform
- **Platform sequence:** Copilot → Claude → Codex (primary platform first)
- **Success threshold:** All 29 commands must install and work on all 3 platforms (100% strict, no tolerance)
- **Failure handling:** Continue testing, batch all failures for review (don't stop on first failure)

### Regression test approach
- **Equivalence definition:** Exact output match (text diff) between legacy and spec-based commands
- **Test scope:** Test all 29 commands for regression (comprehensive, not sample)
- **Platform differences:** Platform differences are bugs to be fixed (not documented as expected)
- **Test mechanism:** Run legacy command, run spec command, compare output (direct comparison)

### Failure triage workflow
- **Failure categories:** Use all 5 categories:
  - Platform bug (tool limitation)
  - Spec bug (incorrect migration)
  - Install bug (generation issue)
  - Test setup bug (environment problem)
  - Expected difference (not a bug)
- **Fix timing:** Create fix plans but don't execute yet (defer to Phase 7.1)
- **Blocking criteria:** Use severity levels — P0 (blocking) vs P1 (non-blocking)
- **Documentation format:** JSON/YAML file for programmatic access (test-results.json or test-results.yml)

### Claude's Discretion
- Exact directory naming conventions for test environments
- Script implementation details for automated installation
- Test result parsing and diff formatting
- P0 vs P1 severity classification criteria
- Phase 7.1 structure and planning approach

</decisions>

<specifics>
## Specific Ideas

- Phase 5.1 added git identity preservation — test environments must verify this works correctly
- Phase 6 established 100% success rate as quality bar — Phase 7 follows same standard
- Test results JSON/YAML should enable programmatic analysis and reporting
- Clean reinstall strategy ensures no cross-contamination between test runs

</specifics>

<deferred>
## Deferred Ideas

- Fixing bugs discovered during testing — Phase 7.1 will handle remediation
- CI/CD automation of test suite — future enhancement
- Performance benchmarking across platforms — out of scope
- Automated screenshot/video capture of command execution — not needed

</deferred>

---

*Phase: 07-multi-platform-testing*
*Context gathered: 2026-01-23*
