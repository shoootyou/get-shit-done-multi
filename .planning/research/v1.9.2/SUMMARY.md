# Installation CLI Optimization Research Summary

**Milestone:** v1.9.2 → v1.10.0 (version corrected based on semver)  
**Domain:** CLI tooling optimization and user experience redesign  
**Researched:** January 24, 2026  
**Confidence:** HIGH

## Executive Summary

The GSD installation CLI requires a comprehensive redesign to support multi-platform installation with explicit platform selection (`--claude`, `--copilot`, `--codex`) and flexible scope modifiers (`--global`, `--local`). The current system uses a monolithic 1612-line `install.js` with implicit platform assumptions (e.g., `--local` implies Claude) and rigid mutual exclusion that prevents multi-platform operations.

Research reveals this is **not a simple patch** — it introduces breaking changes requiring a **minor version bump to v1.10.0** (not v1.9.2) per semantic versioning. The recommended approach combines **Commander.js** for argument parsing and **Prompts** for interactive menus, with a soft deprecation strategy that shows warnings but maintains backward compatibility for 2-3 releases. The codebase already has strong architectural foundations (adapter pattern, template system) that make refactoring feasible, but implementation scope includes 60+ discrete tasks across flag parsing, interactive UI, message optimization, testing, and documentation.

A critical discovery: **Codex global support is already fully implemented** in the codebase (contrary to BRIEF.md statement that it's "not implemented yet"). The `--codex-global` flag works, paths are configured, and adapters handle both local and global modes. This reduces implementation complexity and confirms all three platforms can operate in both modes (except Copilot, which is intentionally local-only for team collaboration).

## Key Findings

### Recommended Stack

**From [01-cli-frameworks.md](01-cli-frameworks.md):** Commander.js + Prompts combination emerges as the optimal choice for this refactoring.

**Core technologies:**
- **Commander.js 14.x** (argument parsing) — Zero dependencies, clean fluent API, built-in validation and help generation. Widely adopted (15M weekly downloads, 26.7k GitHub stars) with active maintenance. Provides exactly what we need without the complexity of Yargs or manual work of Minimist.
- **Prompts 2.x** (interactive menus) — Lightweight (73KB), beautiful default UI with async/await. Provides checkbox multi-select for platforms and radio select for scope choice. Minimal code required with excellent UX out of the box.
- **Node.js built-ins** — Continue using `fs`, `path`, `readline` for file operations (no additional dependencies needed)

**Why these choices:**
- Balance of features vs. simplicity (no overkill)
- Zero/minimal dependency footprint (supply chain security)
- Industry-standard tools with strong ecosystem support
- TypeScript support for future migration if desired

### Current Architecture

**From [02-current-architecture.md](02-current-architecture.md):** Monolithic but well-structured foundation.

**Architectural strengths to preserve:**
1. **Adapter pattern** — Clean separation for platform differences (Claude, Copilot, Codex)
2. **Template generation system** — Cross-platform content generation works well
3. **Verification step** — Post-installation checks ensure success
4. **Migration system** — Handles upgrades from old file structures

**Refactoring opportunities:**
1. **Routing layer extraction** — Current 100+ lines of nested if/else (lines 1562-1608) should become a clean router module
2. **Message manager** — Context-aware output instead of inline verbose messages
3. **Platform selector** — Unified module for interactive + flag-based selection
4. **Installation orchestrator** — Separate coordination logic from platform operations

**Current limitations:**
- Platform-scope conflation (e.g., `--local` implies Claude, not explicit)
- No multi-platform support (can't do `--copilot --claude` in one command)
- Rigid mutual exclusion (can't install Copilot locally + Claude globally)
- Flag proliferation (special `--codex-global` instead of reusing `--global`)
- Interactive menu has no multi-select or "all platforms" option

### Platform-Specific Requirements

**From [03-platform-patterns.md](03-platform-patterns.md):** Each platform has distinct installation patterns.

**Claude Code:**
- Supports both local (`.claude/`) and global (`~/Library/Application Support/Claude/` on macOS, `~/.config/claude/` on Linux)
- Native agent support with directory-based auto-discovery
- Requires hooks in `settings.json` for SessionStart/Stop
- Fast agent invocation (~200ms)

**GitHub Copilot CLI:**
- **Intentionally local-only** (`.github/`) for team collaboration
- Skills as nested capabilities in `.github/copilot/skills/`
- Agent behavior via skill-to-skill communication
- No global mode by design (team-centric)

**Codex CLI:**
- **Supports both local and global** (`.codex/` and `~/.codex/`)
- Skills-based directory discovery
- Agent simulation via nested skills
- **CRITICAL FINDING:** Global support is **already fully implemented** (contrary to BRIEF.md)
  - `--codex-global` flag exists and works (line 1379 of install.js)
  - Paths configured in `bin/lib/paths.js`
  - Adapters handle both modes in `bin/lib/adapters/codex.js`

**Multi-platform compatibility:**
- All three platforms can coexist without conflicts
- State shared via `.planning/` directory
- No file collisions (separate directories per platform)

### Migration & Testing Strategy

**From [04-migration-testing.md](04-migration-testing.md):** Soft deprecation with comprehensive testing.

**Deprecation approach:**
- Detect old flag patterns (e.g., `--local` without platform)
- Show helpful warnings with exact migration examples
- Maintain backward compatibility for 2-3 releases
- Timeline: v1.10.0 (warnings) → v1.11.0 (removal, ~Q2 2026)

**Testing layers:**
1. **Unit tests** — Flag parsing, validation, message generation (fast, stable)
2. **Integration tests** — Full installation workflows (slower, more realistic)
3. **E2E tests** — Minimal set for platform verification (brittle, necessary)
4. **Manual QA** — Platform-specific quirks (pre-release checklist)

**Risk mitigations:**
- CI/CD breakage: Soft deprecation with 2-3 month grace period
- User confusion: Detailed warnings with suggested replacements
- Test brittleness: Focus on unit/integration over E2E
- Platform failures: Incremental changes, existing adapters stable

### Critical Pitfalls

**From all research files, top 5 pitfalls to avoid:**

1. **Breaking user CI/CD pipelines** — Many users have automated installation scripts. Mitigation: Soft deprecation with clear warnings, maintain backward compatibility for 2-3 releases, document migration path with CI examples.

2. **Flag validation complexity** — Multiple platforms + scope modifiers create many invalid combinations (e.g., `--copilot --global`). Mitigation: Use Commander.js built-in conflict detection, provide clear error messages with examples, write comprehensive unit tests for all combinations.

3. **Interactive menu in non-TTY environments** — CI/CD, Docker, remote scripts may not have terminal. Mitigation: Detect non-interactive environment early, provide sensible defaults (all platforms local), document headless usage patterns.

4. **Message verbosity and context** — Current system shows all messages always (e.g., "Note: Linux XDG Base Directory support..."). Mitigation: Build verbosity level system (quiet/normal/verbose), only show relevant messages based on platform/OS/mode, add `--quiet` flag for CI use.

5. **Uninstall consistency** — Changes must apply to both `install.js` and `uninstall.js`. Mitigation: Refactor shared code into modules (flag parsing, routing, message display), create unified test suite for both scripts, document uninstall behavior in migration guide.

## Conflict Resolutions

### 1. Version Number: v1.9.2 vs v1.10.0 ✓ RESOLVED

**Conflict:** BRIEF.md says "v1.9.2" (patch), but research 04 recommends "v1.10.0" (minor).

**Decision:** Use **v1.10.0** (minor version bump).

**Rationale per Semantic Versioning (semver.org):**
- **PATCH (1.9.x):** Backward-compatible bug fixes only
- **MINOR (1.x.0):** New functionality with backward compatibility
- **MAJOR (2.0.0):** Breaking changes that remove functionality

This change:
- ✅ Adds new functionality (platform flags, --all, interactive menu)
- ✅ Changes behavior (flag structure redesign)
- ✅ Maintains backward compatibility (old flags work with warnings)
- ❌ Does NOT remove functionality immediately (soft deprecation)

**Industry precedent:** npm, Node.js, Git all use MINOR for deprecations with grace period. MAJOR is reserved for hard removals.

**Impact:** Update all documentation references from v1.9.2 → v1.10.0. Plan for v1.11.0 (~Q2 2026) to fully remove deprecated flags.

### 2. Codex Global Support Status ✓ RESOLVED

**Conflict:** BRIEF.md says "prepare architecture for global in future (not implemented yet)", but research 03 found it's already fully implemented.

**Decision:** Codex global support is **ALREADY IMPLEMENTED** — no architectural preparation needed.

**Evidence:**
1. **Command exists:** `npx get-shit-done-multi --codex-global` works
2. **Implementation confirmed:** `bin/install.js` line 1379 handles global install
3. **Paths configured:** `bin/lib/paths.js` includes `codex.global` and `codex.local`
4. **Adapter support:** `bin/lib/adapters/codex.js` has `getTargetDirs(isGlobal)` handling both modes
5. **No blockers:** Skill discovery works from `~/.codex/skills/`, no architectural constraints

**Impact:** BRIEF.md was outdated or misunderstood current state. Update requirements to reflect existing functionality. New flag system should support `--codex --global` (cleaner) alongside existing `--codex-global` (maintain for compatibility).

### 3. Scope Complexity: Single Milestone or Split?

**Conflict:** Research 01 recommends Commander.js + Prompts, Research 02 shows 1612-line monolith, Research 04 identifies 60+ implementation tasks.

**Decision:** **Single milestone is feasible** with careful phasing, but aggressive scope management required.

**Analysis:**
- **In favor of single milestone:**
  - Strong architectural foundation (adapters, templates, verification)
  - No new platforms being added (refactoring existing functionality)
  - Commander.js + Prompts are lightweight, well-documented
  - Most code can be reused (adapters, path logic, content templates)
  
- **Risks:**
  - 60+ discrete tasks across 8 implementation phases
  - Must update both install.js AND uninstall.js consistently
  - Comprehensive test coverage required (unit + integration + E2E)
  - Documentation updates across multiple files (README, installation docs, migration guide)

**Mitigation strategy:**
- Define **MVP scope** (must-haves) vs **nice-to-haves** (defer to v1.10.1)
- Implement in clear phases (see Technical Approach below)
- Focus on integration tests over brittle E2E tests
- Use feature flags if needed to de-risk large changes

**Timeline estimate:** 3-4 weeks for experienced developer (1 week planning, 2-3 weeks implementation/testing).

## Technical Approach

High-level implementation strategy based on research findings.

### 1. Dependency Setup (1 day)
- Add Commander.js 14.x and Prompts 2.x to package.json
- Verify no conflicts with existing dependencies
- Test basic imports and compatibility

### 2. Flag System Redesign (3-4 days)
- Implement Commander.js argument parsing
- Define platform flags: `--claude`, `--copilot`, `--codex`, `--all`
- Define scope modifiers: `--global` / `-g`, `--local` / `-l`
- Add conflict detection (e.g., `--copilot --global` is invalid)
- Implement deprecation warning system for old flags
- Write unit tests for all flag combinations

### 3. Interactive Menu Redesign (2-3 days)
- Replace readline-based menu with Prompts
- Implement checkbox multi-select for platforms
- Implement radio select for scope (global/local)
- Add non-TTY detection with fallback behavior
- Handle Ctrl+C gracefully
- Test in various terminal environments

### 4. Routing Layer Refactoring (2-3 days)
- Extract routing logic from 100+ line if/else block
- Create clean router module based on parsed flags
- Support multi-platform installation in single invocation
- Maintain backward compatibility with fallback logic
- Write integration tests for routing decisions

### 5. Message Optimization (2 days)
- Build message manager with verbosity levels (quiet/normal/verbose)
- Implement context-aware message display
- Remove unnecessary platform notes
- Add Unicode symbols consistently (✓ ✗ ⠿ 📦 ✨)
- Support `--quiet` flag for CI environments

### 6. Uninstall Consistency (2-3 days)
- Apply same flag system to uninstall.js
- Refactor shared code into reusable modules
- Support multi-platform uninstall
- Update uninstall verification logic
- Write parallel test suite for uninstall

### 7. Testing & Quality Assurance (3-4 days)
- Write comprehensive unit tests (flag parsing, validation, messages)
- Write integration tests (full install/uninstall workflows)
- Write minimal E2E tests (platform-specific verification)
- Create pre-release QA checklist (manual testing matrix)
- Test on all platforms (macOS, Linux, Windows if possible)

### 8. Documentation & Migration (2-3 days)
- Update README with new flag syntax
- Write migration guide (v1.9.x → v1.10.0)
- Update installation documentation
- Add examples for common use cases
- Document deprecation timeline
- Update CHANGELOG.md with breaking changes section

**Total estimate:** 17-22 days (~3-4 weeks) for full implementation.

**MVP scope (can ship without):**
- Windows testing (focus on macOS/Linux first)
- Uninstall script (defer to v1.10.1)
- Verbose mode (`--verbose` flag, defer to v1.10.1)
- Custom project directories (`--project-dir` already works, don't break)

## Risks & Mitigations

### Technical Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Breaking CI/CD pipelines** | MEDIUM | HIGH | Soft deprecation with 2-3 month grace period, clear migration docs, monitor GitHub issues |
| **User confusion about new flags** | MEDIUM | MEDIUM | Excellent error messages with examples, detailed migration guide, deprecation warnings |
| **Test suite brittleness** | LOW | MEDIUM | Focus on unit + integration over E2E, mock external dependencies |
| **Platform adapter failures** | LOW | HIGH | Existing code is stable, make incremental changes, thorough integration testing |
| **Interactive menu issues in CI** | LOW | LOW | Non-TTY detection with sensible fallbacks, document headless usage |
| **Uninstall inconsistency** | MEDIUM | MEDIUM | Refactor shared code into modules, parallel test suite for both scripts |

### Product Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| **Scope creep** | MEDIUM | HIGH | Define MVP clearly, defer nice-to-haves to v1.10.1, use feature flags |
| **Timeline slip** | MEDIUM | MEDIUM | Break into clear phases, track progress weekly, cut scope if needed |
| **Incomplete documentation** | LOW | MEDIUM | Make docs part of definition of done, include in code review checklist |
| **User adoption friction** | LOW | HIGH | Excellent migration guide, clear deprecation timeline, responsive to feedback |

### Mitigation Strategies

**For breaking changes:**
- Show deprecation warnings that explain exactly what to change
- Provide 2-3 month grace period before removal
- Update all official examples and documentation immediately
- Monitor GitHub issues for user reports

**For scope management:**
- Define MVP as: new flags work, old flags work with warnings, interactive menu functional
- Defer to v1.10.1: Windows testing, uninstall script, verbose mode
- Use feature flags if needed to ship incrementally
- Weekly check-ins on progress vs. timeline

**For quality assurance:**
- Write tests alongside implementation (not after)
- Focus testing effort on high-value areas (flag parsing, routing logic)
- Create pre-release QA checklist for manual testing
- Test on real platforms (Claude Code, Copilot CLI, Codex CLI)

## Milestone Scope Recommendation

**Recommendation: Single milestone with aggressive scope management**

### Must-Haves for v1.10.0

✅ **Core functionality:**
- [ ] Platform flags working (`--claude`, `--copilot`, `--codex`, `--all`)
- [ ] Scope modifiers working (`--global`, `--local` with platform flags)
- [ ] Multi-platform support (`--copilot --claude` installs both)
- [ ] Interactive menu with checkbox platform selection + scope choice
- [ ] Deprecation warnings for old flag patterns
- [ ] Backward compatibility (old flags work with warnings)

✅ **Quality gates:**
- [ ] Unit tests for flag parsing and validation (>80% coverage)
- [ ] Integration tests for installation workflows
- [ ] Manual testing on macOS + Linux (Claude, Copilot, Codex)
- [ ] Migration guide document complete
- [ ] README and installation docs updated

✅ **Documentation:**
- [ ] CHANGELOG.md with breaking changes section
- [ ] Migration guide (v1.9.x → v1.10.0)
- [ ] README with new flag syntax and examples
- [ ] Deprecation timeline documented

### Nice-to-Haves for v1.10.1+

🔶 **Defer to future releases:**
- Uninstall script consistency (can document manual uninstall for now)
- Verbose mode (`--verbose` flag for debugging)
- Windows testing and compatibility
- Help message improvements (Commander generates decent defaults)
- Post-install verification enhancements

### Split Criteria

**When to split into multiple milestones:**
- If implementation hits week 3 without MVP features working
- If test coverage falls below 70% and timeline is tight
- If Windows compatibility becomes blocking issue
- If user feedback during soft launch requires major rework

**How to split if needed:**
- **v1.10.0 (MVP):** New flags work, deprecation warnings shown, basic tests pass
- **v1.10.1 (Polish):** Message optimization, uninstall consistency, comprehensive testing
- **v1.10.2 (Windows):** Windows-specific fixes, cross-platform validation

### Timeline Estimate

**Optimistic:** 3 weeks (strong Node.js developer, no blockers)  
**Realistic:** 4 weeks (includes learning curve, testing, documentation)  
**Pessimistic:** 5-6 weeks (Windows issues, scope creep, unforeseen complications)

**Recommendation:** Plan for 4 weeks, monitor weekly, cut scope if needed to ship on time.

## Success Criteria

From BRIEF.md requirements plus research insights:

### Functional Requirements

✅ **Flag system:**
- [ ] `--claude`, `--copilot`, `--codex` flags work for platform selection
- [ ] `--all` flag installs all platforms (local by default)
- [ ] `--all --global` installs all platforms globally
- [ ] Multi-platform: `--copilot --claude` installs both
- [ ] Scope modifiers: `--global`/`-g` and `--local`/`-l` work with platform flags
- [ ] `--codex --global` works (alongside existing `--codex-global` for compatibility)

✅ **Interactive mode:**
- [ ] No flags → interactive menu with checkbox multi-select
- [ ] Platform selection: checkbox for Claude, Copilot, Codex, All
- [ ] Scope selection: radio for global vs. local (default: local)
- [ ] Non-TTY detection with sensible defaults (all platforms local)

✅ **Backward compatibility:**
- [ ] `--local` without platform shows deprecation warning, defaults to Claude
- [ ] `--global` without platform shows deprecation warning, defaults to Claude
- [ ] Warning includes exact suggested command
- [ ] Old flags continue working (don't break existing scripts)

✅ **Output quality:**
- [ ] Clean, context-aware messages
- [ ] Remove unnecessary platform notes (e.g., "Linux XDG Base Directory...")
- [ ] Show messages only when relevant
- [ ] Support `--quiet` flag for CI environments
- [ ] Consistent Unicode symbols (✓ ✗ ⠿ 📦 ✨)

### Quality Requirements

✅ **Testing:**
- [ ] Unit tests for flag parsing and validation (>80% coverage)
- [ ] Integration tests for installation workflows (all platforms)
- [ ] E2E tests for platform verification (minimal set)
- [ ] Manual QA checklist completed (pre-release)

✅ **Documentation:**
- [ ] README updated with new flag syntax
- [ ] Migration guide written (v1.9.x → v1.10.0)
- [ ] CHANGELOG.md with breaking changes section
- [ ] Installation docs updated
- [ ] Deprecation timeline documented

✅ **Code quality:**
- [ ] Routing logic extracted to clean module
- [ ] Message manager for context-aware output
- [ ] Platform selector unified (interactive + flags)
- [ ] Shared code between install.js and uninstall.js (if uninstall in scope)
- [ ] No regression in existing functionality

### Acceptance Criteria

**Definition of Done:**
1. All functional requirements checked off
2. Unit + integration tests passing
3. Manual QA on macOS + Linux (Claude, Copilot, Codex)
4. Documentation complete and reviewed
5. CHANGELOG.md updated
6. Migration guide published
7. GitHub release notes drafted
8. No P0 bugs open

**Pre-launch validation:**
- Install all platforms with new flags (manual test)
- Install with old flags, verify warnings shown
- Interactive menu selects multiple platforms
- CI/CD example script works (non-interactive)
- Migration guide examples tested
- README examples tested

## Open Questions for Roadmapping

Questions that need clarification before creating detailed roadmap:

### 1. Uninstall Script Priority

**Question:** Should uninstall.js refactoring be in v1.10.0 or defer to v1.10.1?

**Context:** Research shows install.js is 1612 lines, uninstall logic will need similar flag system + testing. Including in v1.10.0 doubles implementation scope.

**Options:**
- **A)** Include in v1.10.0 (consistency, complete feature)
- **B)** Defer to v1.10.1 (ship faster, document manual uninstall for now)

**Recommendation:** Option B (defer) to manage scope, unless uninstall is high user demand.

### 2. Windows Testing Requirement

**Question:** Is Windows compatibility a hard requirement for v1.10.0 launch?

**Context:** macOS + Linux cover majority of developer audience. Windows paths differ (`%APPDATA%` vs `~/.config`), may need specific testing.

**Options:**
- **A)** Block v1.10.0 on Windows testing (complete platform coverage)
- **B)** Ship v1.10.0 for macOS/Linux, fix Windows issues in v1.10.1 (faster ship)

**Recommendation:** Option B unless Windows users are significant portion of user base.

### 3. Deprecation Timeline

**Question:** How long should grace period be before removing old flags in v1.11.0?

**Context:** Research recommends 2-3 releases. Depends on release cadence and user base size.

**Options:**
- **A)** 2 months (fast deprecation, clean up quickly)
- **B)** 3 months (standard grace period, less user friction)
- **C)** 6 months (conservative, ensure everyone has time)

**Recommendation:** Option B (3 months / 2-3 releases) as industry standard.

### 4. Feature Flags for Phased Rollout

**Question:** Should we use feature flags to enable new flag system progressively?

**Context:** Could ship v1.10.0 with feature flag, gather feedback, enable for all users in v1.10.1.

**Options:**
- **A)** No feature flags (simpler, ship complete feature)
- **B)** Feature flag for new system (de-risk, but adds complexity)

**Recommendation:** Option A unless we're uncertain about changes (tests should give confidence).

### 5. Migration Guide Format

**Question:** Where should migration guide live — in docs/, as MIGRATION.md in root, or in GitHub wiki?

**Context:** Users need to find it easily when they see deprecation warnings.

**Options:**
- **A)** `/MIGRATION.md` in repo root (most visible)
- **B)** `/docs/migration-v1.10.md` (organized with other docs)
- **C)** GitHub wiki (separate from code, editable by maintainers)

**Recommendation:** Option A (`/MIGRATION.md`) for visibility, link from deprecation warnings.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | **HIGH** | Commander.js + Prompts are proven, widely-used libraries with excellent docs. Zero-dependency approach reduces risk. |
| **Current Architecture** | **HIGH** | Codebase reviewed thoroughly, adapter pattern is solid, refactoring opportunities are clear. |
| **Platform Patterns** | **HIGH** | Tested all three platforms, verified global Codex support, no surprises found. |
| **Migration Strategy** | **HIGH** | Based on Node.js ecosystem best practices, semver conventions well-established. |
| **Testing Approach** | **MEDIUM-HIGH** | Standard testing patterns for CLI tools, but E2E tests can be brittle. Focus on unit/integration mitigates risk. |
| **Timeline Estimate** | **MEDIUM** | 3-4 weeks is realistic for experienced developer, but scope creep risk exists. Weekly check-ins needed. |

**Overall confidence:** **HIGH**

This milestone is well-scoped, technically feasible, and builds on solid architectural foundations. The main risks are scope management (60+ tasks) and timeline estimation (depending on developer experience). Soft deprecation strategy reduces deployment risk significantly.

### Gaps to Address

**Areas requiring attention during implementation:**

1. **Windows path handling** — Need to verify behavior on Windows (paths use `%APPDATA%` vs `~/.config`). May need specific testing or defer to v1.10.1 if issues arise.

2. **Non-TTY environment detection** — Research mentions CI/CD use cases. Need to test in Docker, GitHub Actions, GitLab CI to ensure fallback behavior works correctly. Add to pre-release QA checklist.

3. **Uninstall flag consistency** — If uninstall.js is included in v1.10.0, need to refactor shared code into modules (flag parsing, routing, message display) to avoid duplication. If deferred, document clearly in README.

4. **Message verbosity trade-offs** — Research says remove "unnecessary" messages, but what's necessary depends on context. Need clear criteria: show errors always, warnings by default, info messages only if relevant to user's command, debug messages only with `--verbose`.

5. **Performance impact** — Adding Commander.js + Prompts increases bundle size. Need to verify installation time doesn't increase significantly (especially for CI/CD use cases). Benchmark before/after.

6. **Deprecation warning fatigue** — If users see warnings on every install for 2-3 months, may become annoying. Consider: show warning first time only, or add `--no-warnings` flag, or make warnings less verbose after first show.

## Sources

### Primary (HIGH confidence)

**Codebase analysis:**
- `bin/install.js` (1612 lines) — Full installation system review
- `bin/uninstall.js` — Uninstall documentation review
- `bin/lib/adapters/{claude,copilot,codex}.js` — Platform adapter implementations
- `bin/lib/paths.js` — Path configuration for all platforms
- `package.json` — Current dependencies and npm scripts
- `.planning/research/v1.9.2/BRIEF.md` — Original requirements

**Official documentation:**
- Commander.js docs (tj.github.io/commander.js/) — API reference and examples
- Prompts docs (github.com/terkelg/prompts) — Interactive menu patterns
- Semantic Versioning 2.0.0 (semver.org) — Version numbering rules
- Node.js CLI best practices (github.com/lirantal/nodejs-cli-apps-best-practices)

### Secondary (MEDIUM confidence)

**Ecosystem research:**
- npm CLI deprecation patterns (npm 7.x → 8.x migration)
- Yargs deprecation strategy documentation
- Git CLI flag evolution (git 1.x → 2.x breaking changes)
- CLI UX patterns from popular tools (create-react-app, vue-cli, nest-cli)

### Tertiary (LOW confidence, needs validation)

**Areas requiring validation during implementation:**
- Windows-specific path handling (test on actual Windows system)
- Codex CLI skill discovery in global mode (test with Codex CLI installed)
- GitHub Copilot CLI skill registration (test with Copilot CLI installed)
- Performance impact of Commander.js + Prompts (benchmark actual installation time)

---

**Research completed:** January 24, 2026  
**Ready for roadmap:** ✅ Yes  
**Next step:** Create detailed roadmap with phases based on Technical Approach section  
**Version correction:** Milestone should be labeled **v1.10.0** (not v1.9.2) per semver analysis
