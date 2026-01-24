# v1.10.0 Milestone Requirements Validation

Date: 2026-01-24  
Codebase: commit 8ce4d0cddb0fe1eb5023ddfec5a97b542f3df21e  
Validator: GSD Research Agent  

## Executive Summary

**Overall Assessment:** All 29 P0 requirements are **achievable** with the current codebase. The milestone is well-scoped and realistic for a 3-4 week timeline.

**Key Findings:**
- ✅ All old flags (`--local`, `--global`, `--codex-global`) exist and can be safely removed
- ✅ Prompts v2.4.2 is **already installed** — no new dependency needed (DEPS-02 already satisfied!)
- ⚠️ Commander.js NOT present — must be added for DEPS-01
- ✅ Current architecture has strong adapter pattern — excellent foundation for refactoring
- ✅ Path resolution logic is well-structured in `bin/lib/paths.js`
- ⚠️ Claude global path uses `~/Library/Application Support/Claude` (macOS-specific) not `~/.claude/` — **PATH-01 requires change**
- ✅ No uninstall.js exists — clean slate for UNINST requirements
- ⚠️ Linux XDG reference found in recommender.js (line 97) — needs removal per MSG-01

**Risk Level:** LOW-MEDIUM  
The requirements are technically sound, but PATH-01 represents a **BREAKING CHANGE** beyond flag removal (Claude global path change from `~/Library/Application Support/Claude` to `~/.claude/`). This should be clearly documented and may impact macOS users.

---

## Validation Results by Category

### FLAG Requirements (6 items)

**FLAG-01**: Platform selection flags  
- **Requirement:** Add `--claude`, `--copilot`, `--codex`, `--all` flags  
- **Current State:** 
  - Lines 42-45: `hasCopilot`, `hasCodex`, `hasAll` variables exist
  - Line 42: `--copilot` | `--github-copilot` | `--copilot-cli` aliases already parsed
  - Line 43: `--codex` | `--codex-cli` aliases already parsed
  - Line 45: `--all` | `-A` aliases already parsed
  - **MISSING:** `--claude` flag does NOT exist (Claude is implicit via `--local` or `--global`)
- **Gap Analysis:** Need to add `--claude` flag, refactor routing logic to treat Claude as explicit platform choice
- **Risk Level:** LOW  
- **Notes:** Current code assumes Claude by default. New system requires explicit `--claude` flag. This is the core architectural change.

**FLAG-02**: Scope modifier flags  
- **Requirement:** `--global` (or `-g`) and `--local` (or `-l`) as scope modifiers  
- **Current State:**
  - Lines 40-41: Both flags exist and are parsed
  - Line 40: `hasGlobal = args.includes('--global') || args.includes('-g')`
  - Line 41: `hasLocal = args.includes('--local') || args.includes('-l')`
  - **CURRENT BEHAVIOR:** These are mutually exclusive Claude-specific flags (see validation at line 1563)
- **Gap Analysis:** Must REDEFINE these flags as scope modifiers that combine with platform flags
- **Risk Level:** MEDIUM (semantic change to existing flags)
- **Notes:** Breaking change in flag semantics. Old: "Claude local vs Claude global". New: "Any platform, local vs global scope".

**FLAG-03**: Platform-specific scope validation  
- **Requirement:** Claude/Copilot support both scopes, Codex local only with warning for global  
- **Current State:**
  - No validation exists for Codex global support (line 1591: `hasCodexGlobal` just calls `installCodex(true)`)
  - Codex global is CURRENTLY SUPPORTED (contrary to requirements)
  - Copilot is ALWAYS local (line 1587: no global support)
- **Gap Analysis:** 
  - Must ADD Codex global warning and force local installation
  - Must ADD Copilot global support (currently local-only)
  - Claude already supports both scopes
- **Risk Level:** MEDIUM  
- **Notes:** Requirements conflict with current implementation. Codex currently HAS global support that must be REMOVED. Copilot currently LACKS global support that must be ADDED.

**FLAG-04**: Bulk installation with `--all`  
- **Requirement:** `--all` alone installs all locally, `--all --global` handles Codex warning  
- **Current State:**
  - Line 45: `--all` flag exists
  - Lines 163-167: `--all` triggers `installAll()` function
  - Function installs to all detected CLIs without scope control
- **Gap Analysis:** Must refactor `installAll()` to respect scope modifier and show Codex warning for global
- **Risk Level:** LOW  
- **Notes:** Function exists, just needs scope-awareness added.

**FLAG-05**: HARD REMOVAL of old flags  
- **Requirement:** Remove `--local`, `--global`, `--codex-global` with clear error  
- **Current State:** 
  - Lines 40-41: `--local` and `--global` actively parsed and used
  - Line 44: `--codex-global` actively parsed and used
  - Lines 1563-1606: Extensive routing logic based on these flags
  - Help text (lines 98-99, 105): Documents all three flags
  - README.md line 223: Example uses `--global`
- **Gap Analysis:** Must delete flag parsing, add error detection, update help text, update all documentation
- **Risk Level:** MEDIUM (breaking change, wide impact)  
- **Notes:** This is the PRIMARY breaking change. Affects install.js, help text, README, all examples, potentially CI/CD scripts.

**FLAG-06**: Error handling for removed flags  
- **Requirement:** Detect old flags, show clear "removed" error with migration guide link  
- **Current State:** No error handling exists (flags are actively used)
- **Gap Analysis:** Must implement detection logic for deprecated flags and error messages
- **Risk Level:** LOW  
- **Notes:** Clean implementation — detect old flags in args array, show error, exit. No complexity.

---

### PATH Requirements (3 items)

**PATH-01**: Claude platform paths  
- **Requirement:** Local: `[repo-root]/.claude/`, Global: `~/.claude/`  
- **Current State:**
  - **bin/lib/paths.js lines 21-24:**
    ```javascript
    claude: {
      global: path.join(home, 'Library', 'Application Support', 'Claude'),
      local: path.join(cwd, '.claude')
    }
    ```
  - ✅ Local path is CORRECT: `.claude/`
  - ❌ Global path is WRONG: Uses macOS-specific `~/Library/Application Support/Claude` instead of `~/.claude/`
- **Gap Analysis:** Must change global path to `~/.claude/` — this is a **BREAKING CHANGE** for existing macOS users
- **Risk Level:** HIGH  
- **Notes:** This change will break existing global Claude installations on macOS. Users will need to migrate or reinstall. Should be clearly documented in CHANGELOG and MIGRATION.md. Consider data migration helper.

**PATH-02**: Copilot platform paths  
- **Requirement:** Local: `[repo-root]/.github/`, Global: `~/.copilot/`  
- **Current State:**
  - **bin/lib/paths.js lines 25-28:**
    ```javascript
    copilot: {
      global: path.join(home, '.copilot'),
      local: path.join(cwd, '.github')
    }
    ```
  - ✅ Both paths are CORRECT per requirements
  - However, current implementation (line 1587) only installs locally
- **Gap Analysis:** Paths are correct, but installation logic must support global Copilot
- **Risk Level:** LOW  
- **Notes:** Path infrastructure exists, just need to wire up global Copilot installation flow.

**PATH-03**: Codex platform paths  
- **Requirement:** Local: `[repo-root]/.codex/` only, Global: NOT SUPPORTED  
- **Current State:**
  - **bin/lib/paths.js lines 29-32:**
    ```javascript
    codex: {
      global: path.join(home, '.codex'),
      local: path.join(cwd, '.codex')
    }
    ```
  - Path infrastructure supports BOTH local and global
  - Lines 1589-1592: Both `hasCodex` (local) and `hasCodexGlobal` work
  - Function `installCodex(isGlobal)` at line 1590 accepts boolean parameter
- **Gap Analysis:** Must remove global Codex functionality or add warning that forces local
- **Risk Level:** LOW-MEDIUM  
- **Notes:** Breaking change for users currently using `--codex-global`. Must show warning and force local install.

---

### MENU Requirements (4 items)

**MENU-01**: Interactive mode activation  
- **Requirement:** No flags triggers interactive menu  
- **Current State:**
  - Lines 1605-1607: `else { promptLocation(); }` — interactive mode exists
  - Function `promptLocation()` at line 1489 uses Node.js readline (NOT Prompts library)
  - Lines 1529-1536: Shows 5 options in text menu (not checkbox UI)
- **Gap Analysis:** Must replace readline-based menu with Prompts library checkbox UI
- **Risk Level:** LOW  
- **Notes:** Interactive mode exists but uses wrong library. Prompts library already installed (v2.4.2), just needs integration.

**MENU-02**: Platform selection in menu  
- **Requirement:** Checkbox multi-select: Claude, Copilot, Codex, All  
- **Current State:**
  - Current menu uses readline with numbered choices (1-5)
  - NOT multi-select (single choice only)
  - Options: 1) Claude Global, 2) Claude Local, 3) Copilot, 4) Codex Local, 5) Codex Global
- **Gap Analysis:** Must replace with Prompts checkbox (`type: 'multiselect'`)
- **Risk Level:** LOW  
- **Notes:** Architecture change: separate platform selection from scope selection into two prompts.

**MENU-03**: Scope selection in menu  
- **Requirement:** Radio button (single select): Local or Global, default Local  
- **Current State:** Scope is mixed with platform in single menu (see MENU-02)
- **Gap Analysis:** Must create separate scope selection prompt after platform selection
- **Risk Level:** LOW  
- **Notes:** Two-step menu: 1) Select platforms (multi), 2) Select scope (single).

**MENU-04**: Non-TTY environment handling  
- **Requirement:** Detect non-interactive, fallback to "install all locally"  
- **Current State:**
  - Lines 1513-1523: Has fallback for closed stdin → defaults to global (NOT local)
  - Detection: Uses `rl.on('close')` event, NOT TTY detection
  - No explicit `process.stdin.isTTY` check
- **Gap Analysis:** Must add proper TTY detection and change default to "all local" (not "global")
- **Risk Level:** LOW  
- **Notes:** Simple check: `if (!process.stdin.isTTY) { /* install all locally */ }`. Current fallback goes to global Claude only.

---

### MSG Requirements (3 items)

**MSG-01**: Clean output principle  
- **Requirement:** Remove generic platform notes like "Linux: XDG Base Directory support..."  
- **Current State:**
  - **bin/lib/cli-detection/recommender.js line 97:**
    ```javascript
    } else if (platform === 'linux') {
      platformNotes.push('Linux: XDG Base Directory support for config paths');
    }
    ```
  - This note is displayed at line 201: `console.log(\`\\n  ${dim}Note: ${recommendations.platformNotes.join(', ')}${reset}\`);`
  - 120+ console.log/error statements throughout install.js
- **Gap Analysis:** Must remove XDG note from recommender.js, audit all console messages for context-relevance
- **Risk Level:** LOW  
- **Notes:** Line 97 is the only XDG reference. Other messages need review for necessity.

**MSG-02**: Codex global warning  
- **Requirement:** Show "⚠️ Global installation not supported for Codex..." when `--codex --global` detected  
- **Current State:** No warning exists — Codex global installs without issue (line 1591)
- **Gap Analysis:** Must add warning message and force local installation
- **Risk Level:** LOW  
- **Notes:** Simple conditional message before calling `installCodex(false)` instead of `installCodex(true)`.

**MSG-03**: Installation confirmation messages  
- **Requirement:** Use Unicode ✓, ✗, ⠿ consistently; format: "✓ Claude Code installed to ~/.claude/"  
- **Current State:**
  - Mixed Unicode usage throughout file
  - Line 189: Uses `${green}✓${reset}` for CLI detection
  - Line 192: Uses `${dim}○${reset}` for available CLIs
  - Line 501: Uses `${yellow}✗${reset}` for errors
  - No consistent "installed to" format
- **Gap Analysis:** Must standardize success messages with path display
- **Risk Level:** LOW  
- **Notes:** Message formatting issue, no logic changes needed.

---

### DEPS Requirements (2 items)

**DEPS-01**: Add Commander.js  
- **Requirement:** Install Commander.js v14+ for argument parsing  
- **Current State:**
  - `grep -i "commander" package.json` → NO RESULTS
  - Commander.js is NOT installed
  - Current parsing: Manual `args.includes('--flag')` checks (lines 40-45)
- **Gap Analysis:** Must run `npm install commander` and add to package.json
- **Risk Level:** LOW  
- **Notes:** Clean addition, no conflicts expected. Commander.js has zero dependencies.

**DEPS-02**: Add Prompts library  
- **Requirement:** Install Prompts v2.4+ for interactive menus  
- **Current State:**
  - **package.json line 77:** `"prompts": "^2.4.2"` ✅ ALREADY INSTALLED
  - NOT currently imported or used in install.js
- **Gap Analysis:** DEPENDENCY ALREADY SATISFIED — just needs to be imported and used
- **Risk Level:** NONE  
- **Notes:** ✅ This requirement is already complete! Phase 1 reduced to just adding Commander.js.

---

### UNINST Requirements (3 items)

**UNINST-01**: Uninstall flag system  
- **Requirement:** Support same flags as install.js: `--claude`, `--copilot`, `--codex`, `--all`, `--global`, `--local`  
- **Current State:**
  - `ls -la bin/*.js | grep uninstall` → NO RESULTS
  - bin/uninstall.js does NOT exist
- **Gap Analysis:** Must create bin/uninstall.js from scratch with flag system
- **Risk Level:** MEDIUM  
- **Notes:** Clean slate implementation. Can reuse flag parsing logic from install.js. Main complexity: determining what's installed.

**UNINST-02**: Uninstall validation  
- **Requirement:** Verify platform exists before uninstall, error if not installed  
- **Current State:** No uninstall logic exists
- **Gap Analysis:** Must implement existence checks for each platform's installation directory
- **Risk Level:** LOW  
- **Notes:** Simple fs.existsSync() checks for `.claude/`, `.github/get-shit-done/`, `.codex/`, etc.

**UNINST-03**: Uninstall consistency  
- **Requirement:** Same error handling as install.js, same message optimization  
- **Current State:** No uninstall implementation
- **Gap Analysis:** Should extract shared code (flag parsing, message display) into modules used by both install and uninstall
- **Risk Level:** LOW-MEDIUM  
- **Notes:** Good opportunity for refactoring. Create `bin/lib/cli-parser.js` and `bin/lib/messages.js` shared modules.

---

### DOCS Requirements (4 items)

**DOCS-01**: README updates  
- **Requirement:** Update installation section with new flag syntax, examples for common use cases  
- **Current State:**
  - README.md line 223: `npx get-shit-done-multi --global` (old syntax)
  - Quick Start section starts at line 45
  - Uses old flag examples throughout
- **Gap Analysis:** Must rewrite installation examples to use platform flags
- **Risk Level:** LOW  
- **Notes:** Documentation update, no code changes. Examples: `--claude --local`, `--copilot --global`, `--all`, etc.

**DOCS-02**: Migration guide  
- **Requirement:** Create MIGRATION.md with simple before/after examples for flag transition  
- **Current State:**
  - docs/migration-guide.md EXISTS but covers different topic (v1.9 structural changes)
  - No MIGRATION.md in repo root
- **Gap Analysis:** Must create NEW file `/workspace/MIGRATION.md` for v1.10.0 flag changes
- **Risk Level:** LOW  
- **Notes:** Simple one-page document. Requirements specify "as simple as possible" — just flag mappings.

**DOCS-03**: CHANGELOG with two sections  
- **Requirement:** Section 1 "End Users", Section 2 "Contributors"  
- **Current State:**
  - CHANGELOG.md exists at repo root
  - Current structure: Single section per version, no End Users/Contributors split
  - Latest entry: v1.9.1 (line 1)
- **Gap Analysis:** Must add v1.10.0 entry with two-section format
- **Risk Level:** LOW  
- **Notes:** First time using two-section format. Will set template for future releases.

**DOCS-04**: Installation documentation  
- **Requirement:** Update guides with multi-platform examples, interactive menu workflow  
- **Current State:**
  - docs/setup-claude-code.md: Claude-specific installation guide
  - docs/github-issues.md line 10: References old `--local` flag
  - docs/contributing.md line 187: Uses `node bin/install.js --local`
  - docs/troubleshooting-old.md line 122: Shows old syntax
- **Gap Analysis:** Must update all documentation files that reference installation
- **Risk Level:** LOW  
- **Notes:** Systematic search-and-replace for old flag patterns across docs/.

---

### TEST Requirements (4 items)

**TEST-01**: Flag parsing tests  
- **Requirement:** Unit tests for all flag combinations, >80% coverage  
- **Current State:**
  - jest.config.js exists (lines 1-49 from earlier)
  - __tests__/ directory has 6 test files (template system tests)
  - NO tests for install.js or flag parsing
  - Coverage threshold set to 0% (lines 24-29)
- **Gap Analysis:** Must create `__tests__/flag-parsing.test.js` with 20+ test cases
- **Risk Level:** MEDIUM  
- **Notes:** Zero current coverage for installation logic. Will need extensive mocking.

**TEST-02**: Interactive menu tests  
- **Requirement:** Test platform/scope selection, non-TTY fallback, mock Prompts  
- **Current State:** No menu tests exist
- **Gap Analysis:** Must create `__tests__/interactive-menu.test.js` with Prompts mocks
- **Risk Level:** MEDIUM  
- **Notes:** Testing interactive UI requires mocking stdin/stdout and Prompts library. Moderately complex.

**TEST-03**: Installation workflow tests  
- **Requirement:** Integration tests for each platform, multi-platform, `--all` flag  
- **Current State:**
  - scripts/test-*.js files exist for cross-platform testing
  - No integration tests in __tests__/ directory
- **Gap Analysis:** Must create `__tests__/installation.test.js` with temp directory fixtures
- **Risk Level:** MEDIUM-HIGH  
- **Notes:** Integration tests are brittle. Need clean temp directories, file system mocking, verification of side effects.

**TEST-04**: Uninstall workflow tests  
- **Requirement:** Integration tests for uninstall operations  
- **Current State:** No uninstall tests (uninstall.js doesn't exist)
- **Gap Analysis:** Must create `__tests__/uninstall.test.js` alongside uninstall.js implementation
- **Risk Level:** MEDIUM  
- **Notes:** Similar to TEST-03. Can share test utilities.

---

## Critical Findings

### Confirmed for Removal

**Lines requiring deletion or refactoring in bin/install.js:**

1. **Line 40:** `const hasGlobal = args.includes('--global') || args.includes('-g');` — DELETE flag parsing
2. **Line 41:** `const hasLocal = args.includes('--local') || args.includes('-l');` — DELETE flag parsing  
3. **Line 44:** `const hasCodexGlobal = args.includes('--codex-global');` — DELETE flag parsing
4. **Lines 98-99:** Help text for `--global` and `--local` — DELETE from help
5. **Line 105:** Help text for `--codex-global` — DELETE from help
6. **Lines 122, 125, 128, 131, 140:** Example commands in help — UPDATE to new syntax
7. **Line 180:** `...(hasLocal || hasGlobal ? ['claude'] : [])` — REFACTOR to use `--claude` flag
8. **Line 182:** `...(hasCodex || hasCodexGlobal ? ['codex'] : [])` — REFACTOR to remove `hasCodexGlobal`
9. **Lines 1563-1606:** Entire routing logic block — COMPLETE REWRITE with new flag system
10. **Lines 1489-1560:** `promptLocation()` function — REPLACE with Prompts-based menu

**Other files:**

11. **bin/lib/cli-detection/recommender.js line 97:** XDG note — DELETE
12. **bin/lib/paths.js line 22:** Claude global path — CHANGE to `~/.claude/`
13. **README.md line 223:** Example command — UPDATE to new syntax
14. **docs/contributing.md line 187:** Example command — UPDATE
15. **docs/github-issues.md line 10:** Reference to old flag — UPDATE
16. **package.json line 60:** `"install:claude": "node bin/install.js --local"` — UPDATE to `--claude --local`

**Message strings to remove:**
- "Cannot specify both --global and --local" (line 1564)
- "Cannot specify both --codex and --codex-global" (line 1567)
- "Cannot combine --copilot with --global or --local" (line 1570)
- "Cannot combine --codex flags with --global or --local" (line 1573)
- All old flag validation errors (lines 1563-1586)

### Architecture Patterns Found

**Strong Points:**
1. **Adapter Pattern** (bin/lib/adapters/): Each platform has dedicated adapter (~150 lines each). Clean separation of platform-specific logic.
2. **Path Resolution** (bin/lib/paths.js): Centralized path logic with clear getConfigPaths() function. Easily extensible.
3. **CLI Detection** (bin/lib/cli-detection/): Modular detection and recommendation system. Zero dependencies.
4. **Template System** (bin/lib/template-system/): Agent generation from specs. Platform-aware rendering.

**Weak Points:**
1. **Monolithic install.js** (1612 lines): All installation logic in single file. Hard to test and maintain.
2. **Manual Flag Parsing** (lines 40-45): Brittle string matching. No validation framework.
3. **Deep Nesting** (lines 1563-1606): if-else chain 40+ lines deep. Should be router/dispatcher.
4. **Mixed Concerns**: UI (readline), logic (installation), and orchestration all in one file.

**Refactoring Opportunities:**
- Extract flag parsing → `bin/lib/cli-parser.js`
- Extract message display → `bin/lib/messages.js`
- Extract routing logic → `bin/lib/router.js`
- Keep adapters as-is (already good)

### Hidden Dependencies

**Breaking changes beyond install.js:**

1. **npm scripts** (package.json lines 59-61):
   - `"install:copilot": "node bin/install.js --copilot"` ✅ OK (Copilot flag unchanged)
   - `"install:claude": "node bin/install.js --local"` ❌ BREAKS (must use `--claude --local`)
   - `"install:codex": "node bin/install.js --codex"` ✅ OK (Codex flag unchanged)

2. **Documentation** (multiple files):
   - README.md: 1+ references to old flags
   - docs/contributing.md: 1+ references
   - docs/github-issues.md: 1+ references
   - docs/troubleshooting-old.md: 1+ references
   - docs/migration-guide.md: Multiple `git config --global/--local` references (unrelated, safe)

3. **CI/CD Scripts** (not found in search):
   - .github/workflows/*.yml: No workflows found using old flags
   - scripts/*.sh: No shell scripts found using old flags
   - **Risk:** LOW — appears to use npm scripts or no CI automation

4. **User Scripts** (unknown):
   - Users may have automation calling `npx get-shit-done-multi --global`
   - This WILL BREAK with clear error message (good)
   - Migration guide link will help users fix their scripts

5. **Claude Global Path Change** (HIGH IMPACT):
   - Existing macOS users with global install at `~/Library/Application Support/Claude`
   - Will need to reinstall or migrate data after upgrade
   - Consider migration helper script or manual instructions

### Edge Cases Discovered

1. **Mixed Platform Installation:**
   - What if user runs `--claude --copilot --local`?
   - Expected: Both install locally (Claude to `.claude/`, Copilot to `.github/`)
   - Current code: Can't handle this (each platform has separate code path)
   - **Solution:** Router must support parallel platform installation

2. **Codex Global Warning with --all:**
   - User runs `--all --global`
   - Expected: Claude and Copilot install globally, Codex shows warning and installs locally
   - **Challenge:** Must detect Codex in batch operation and override scope
   - **Solution:** installAll() must have per-platform scope logic

3. **Interactive Menu + Codex Global Selection:**
   - User selects Codex + Global scope in menu
   - Expected: Show warning, install locally
   - **Challenge:** Menu flow must detect invalid combination AFTER selections
   - **Solution:** Validate selections before installation, show warning, continue with local

4. **Non-TTY with Platform Detection:**
   - CI/CD environment, some CLIs installed but not all
   - Expected: Install all platforms locally (per MENU-04)
   - Question: What if Claude is already installed globally? Install locally too?
   - **Recommendation:** Document that non-TTY always installs locally, doesn't check existing installations

5. **Custom Config Dir with New Flags:**
   - User runs `--claude --global --config-dir ~/.claude-work`
   - Expected: Claude global install to custom directory
   - Current behavior (line 1525): `--config-dir` only works with old `--global` flag
   - **Solution:** `--config-dir` should work with `--claude --global` combination

6. **Copilot Global Path Ambiguity:**
   - Requirements say Copilot global is `~/.copilot/`
   - Copilot CLI may expect different path for global extensions
   - **Recommendation:** Verify with Copilot CLI documentation before implementing global support

---

## Risk Assessment

### HIGH Risk Items

**1. Claude Global Path Change** (PATH-01)
- **Impact:** Breaking change for all macOS users with global Claude install
- **Current:** `~/Library/Application Support/Claude`
- **New:** `~/.claude/`
- **Mitigation:**
  - Document clearly in CHANGELOG and MIGRATION.md
  - Consider data migration script to move existing installation
  - Provide manual migration instructions
  - Consider keeping old path for macOS and using `~/.claude/` only for Linux/Windows
  - **Alternative:** Make path OS-specific (macOS keeps Library path, others use `~/.claude/`)

**2. Integration Test Brittleness** (TEST-03, TEST-04)
- **Impact:** Tests may be flaky, slow, or hard to maintain
- **Mitigation:**
  - Use tmp-promise for clean temp directories (already in devDependencies)
  - Mock file system operations where possible
  - Focus on high-value integration tests, not exhaustive coverage
  - Accept lower coverage for integration tests (e.g., 60% vs 80% for unit tests)

### MEDIUM Risk Items

**1. Flag Semantic Change** (FLAG-02)
- **Impact:** `--global` and `--local` change meaning (Claude-specific → scope modifiers)
- **Current:** Mutually exclusive, Claude-only
- **New:** Combine with platform flags
- **Mitigation:**
  - Clear error messages showing correct new syntax
  - Migration guide with before/after examples
  - Consider short transition period with compatibility mode (out of scope for v1.10.0)

**2. Platform Capability Mismatch** (FLAG-03)
- **Impact:** Codex loses global support, Copilot gains global support
- **Current:** Codex has global, Copilot doesn't
- **New:** Codex local-only, Copilot supports both
- **Mitigation:**
  - Codex: Show clear warning, install locally anyway (don't error)
  - Copilot: Verify global path works with Copilot CLI before shipping
  - Test both scenarios on actual CLI installations

**3. Shared Code Refactoring** (UNINST-03)
- **Impact:** Extracting shared modules could introduce bugs in install.js
- **Mitigation:**
  - Write tests BEFORE refactoring
  - Refactor incrementally (one module at a time)
  - Keep existing install.js working until uninstall.js is ready
  - Consider deferring refactoring to separate PR after feature complete

### LOW Risk Items

**1. Commander.js Integration** (DEPS-01)
- **Impact:** New dependency, possible API learning curve
- **Mitigation:** Commander.js is well-documented, stable, widely adopted. Minimal risk.

**2. Prompts Library Integration** (MENU-01, MENU-02, MENU-03)
- **Impact:** Replace readline with Prompts
- **Mitigation:** Prompts already installed, simple API, good documentation. Low risk.

**3. Message Optimization** (MSG-01, MSG-02, MSG-03)
- **Impact:** UI changes, possible user confusion
- **Mitigation:** Cleaner output is objective improvement. Document changes in CHANGELOG.

**4. Documentation Updates** (DOCS-01, DOCS-02, DOCS-03, DOCS-04)
- **Impact:** Outdated docs during transition
- **Mitigation:** Update all docs in Phase 8 before release. No partial documentation.

---

## Technology Stack Validation

### Commander.js v14+

**Appropriate for use case?** ✅ YES  

**Reasons:**
- Zero dependencies (won't bloat package size)
- Industry standard for CLI argument parsing (2M+ weekly downloads)
- Built-in help generation (reduces code in install.js)
- Clean, declarative API: `.option()`, `.action()`, `.parse()`
- Excellent TypeScript support (if we add types later)
- Version 14+ has modern ESM support

**Conflicts?** ✅ NONE  
- No existing argument parsing library in package.json
- No naming conflicts with existing code

**Size impact?** ~20KB  
- Minimal increase to package size
- Well worth the maintenance benefits

**Alternative considered?** NO  
- Yargs: More features but heavier (we don't need advanced features)
- Minimist: Too low-level, no validation framework
- Manual parsing: Current approach, brittle and hard to maintain
- **Verdict:** Commander.js is optimal choice

**Implementation confidence:** HIGH  
- Standard library choice, proven in production
- Clear migration path from manual parsing
- Extensive examples and documentation available

---

### Prompts v2.4+

**Appropriate for use case?** ✅ YES  

**Already installed?** ✅ YES (package.json line 77: `"prompts": "^2.4.2"`)

**Reasons:**
- Lightweight (15KB gzipped)
- Beautiful, modern UI with minimal configuration
- Supports checkbox (multiselect), radio (select), input, confirm
- Promise-based API (async/await friendly)
- Auto-detects non-TTY environments
- Works on all platforms (Windows, macOS, Linux)

**TTY handling?** ✅ EXCELLENT  
- Built-in `process.stdin.isTTY` detection
- Graceful fallback for non-interactive environments
- Can provide default values when TTY not available

**Size impact?** ✅ ZERO  
- Already installed as dependency (currently unused in install.js)
- No additional package size

**Conflicts?** ✅ NONE  
- Not currently imported in install.js
- Won't conflict with readline (we'll replace readline usage)

**Alternative considered?** NO  
- Inquirer.js: Heavier, more features than we need
- readline (current): Built-in but very low-level, no UI components
- **Verdict:** Prompts is optimal and already available

**Implementation confidence:** HIGH  
- Already in dependencies (reduces Phase 1 work)
- Simple API, well-documented
- Proven in production by thousands of CLI tools

**Example usage:**
```javascript
const prompts = require('prompts');

const platformResponse = await prompts({
  type: 'multiselect',
  name: 'platforms',
  message: 'Select platforms to install',
  choices: [
    { title: 'Claude Code', value: 'claude' },
    { title: 'GitHub Copilot CLI', value: 'copilot' },
    { title: 'Codex CLI', value: 'codex' }
  ]
});

const scopeResponse = await prompts({
  type: 'select',
  name: 'scope',
  message: 'Installation scope',
  choices: [
    { title: 'Local (current project)', value: 'local' },
    { title: 'Global (all projects)', value: 'global' }
  ],
  initial: 0 // Default to local
});
```

---

## Recommendations

### Requirements Updates Needed

**1. Clarify Claude Global Path Strategy** (PATH-01)
- **Issue:** Changing from `~/Library/Application Support/Claude` to `~/.claude/` may break existing installations
- **Options:**
  - A) Use `~/.claude/` for all platforms (breaking change)
  - B) Keep macOS-specific path, use `~/.claude/` for Linux/Windows only
  - C) Provide migration helper script
- **Recommendation:** Choose option B or C to reduce user impact

**2. Add Copilot Global Path Verification** (PATH-02)
- **Issue:** Requirements assume `~/.copilot/` works for global Copilot, but this needs verification
- **Action:** Test with actual Copilot CLI to confirm global path expectations
- **Risk:** If Copilot doesn't support global installs, requirement needs adjustment

**3. Define Migration Helper Scope**
- **Issue:** DOCS-02 requires simple migration guide, but users need help with data migration
- **Action:** Add optional P1 requirement for migration helper script (out of scope for v1.10.0)
- **Rationale:** MIGRATION.md can document manual migration; automated helper is nice-to-have

**4. Specify Coverage Targets**
- **Issue:** TEST requirements say ">80%" but jest.config.js has 0% threshold
- **Action:** Update coverage thresholds in jest.config.js as part of TEST phase
- **Recommendation:** 
  - Flag parsing: 90%+ (pure logic, easy to test)
  - Interactive menu: 70%+ (UI mocking is harder)
  - Installation workflow: 60%+ (integration tests are brittle)
  - Overall: 80%+ across all new code

### Phase Adjustments Needed

**Phase 1: Reduce Scope**
- **Current:** Install Commander.js + Prompts
- **Updated:** Install Commander.js only (Prompts already installed)
- **Impact:** Phase 1 can complete in < 1 day (just verify Commander.js installation)

**Phase 2: Expand Scope**
- **Issue:** Current scope doesn't include shared modules for code reuse
- **Recommendation:** Add task to extract flag parsing into `bin/lib/cli-parser.js`
- **Rationale:** Uninstall will need same parsing logic (UNINST-03)
- **Impact:** +0.5 days to Phase 2 timeline

**Phase 4: Add Verification Task**
- **Issue:** Copilot global path needs verification with actual CLI
- **Recommendation:** Add task "Verify Copilot global path with actual Copilot CLI installation"
- **Rationale:** Prevent shipping non-functional feature
- **Impact:** +0.5 days if issues found

**Phase 6: Consider Parallel Work**
- **Opportunity:** Uninstall implementation could start during Phase 5 (message optimization)
- **Dependencies:** Needs shared modules from Phase 2, but not message optimization
- **Recommendation:** Keep sequential to reduce risk of merge conflicts
- **Alternative:** Advanced developers could overlap Phase 5 and 6

**Phase 8: Add Pre-Release Validation**
- **Current:** Documentation phase
- **Recommendation:** Add pre-release validation checklist (from ROADMAP.md lines 351-360)
- **Tasks:**
  - Manual test all flag combinations
  - Verify error messages for old flags
  - Test interactive menu on macOS and Linux
  - Verify migration guide examples work
- **Impact:** +1 day for thorough validation

### Additional Research Needed

**1. Copilot CLI Global Installation**
- **Question:** Does Copilot CLI support global installs at `~/.copilot/`?
- **Action:** Install Copilot CLI, test with global GSD assets, verify path resolution
- **Priority:** HIGH (blocks PATH-02 implementation)
- **Deadline:** Before Phase 4 starts

**2. Claude Path Migration Strategy**
- **Question:** How should we handle existing installations at old global path?
- **Action:** Research file migration approaches, user data preservation
- **Options:**
  - Symlink from old path to new path
  - Copy data on upgrade (in migration script)
  - Detect old path, prompt user to migrate
  - Document manual migration only
- **Priority:** MEDIUM (can defer to v1.10.1 if needed)
- **Deadline:** Before Phase 8 (documentation)

**3. Windows Path Compatibility**
- **Question:** Do new paths work on Windows? (scope explicitly excludes Windows testing)
- **Context:** Copilot uses `.github/`, Windows allows this. Claude uses `.claude/`, should work.
- **Action:** Document Windows paths for future testing (out of scope for v1.10.0)
- **Priority:** LOW (deferred to v1.10.1 per requirements)

**4. Error Message Testing**
- **Question:** Do old flag error messages provide enough context for migration?
- **Action:** User test error messages with fresh eyes (someone not familiar with v1.10.0 changes)
- **Priority:** MEDIUM (part of Phase 8 validation)
- **Deadline:** Before release

---

## Confidence Assessment

**Overall Confidence:** 78%

### Breakdown:

**Flag system refactor:** 85%
- Strengths: Commander.js is proven, flag logic is straightforward
- Concerns: Semantic change to existing flags might confuse users
- Mitigation: Clear error messages and migration guide
- Confidence justification: Technical implementation is low-risk, but user migration has some uncertainty

**Interactive menu:** 90%
- Strengths: Prompts library already installed, simple API, good documentation
- Concerns: Non-TTY fallback needs testing
- Mitigation: Prompts has built-in TTY detection
- Confidence justification: Replacing readline with Prompts is straightforward, minimal complexity

**Path resolution:** 65%
- Strengths: Path logic is well-structured in bin/lib/paths.js
- Concerns: Claude global path change is breaking change, Copilot global path needs verification
- Mitigation: Thorough testing, clear documentation, consider migration helper
- Confidence justification: Technical risk is low, but user impact is high (pulls down overall confidence)

**Message optimization:** 95%
- Strengths: Simple string replacements, clear requirements
- Concerns: None significant
- Mitigation: Systematic review of all console.log statements
- Confidence justification: Low-risk cosmetic changes, easy to verify manually

**Uninstall implementation:** 70%
- Strengths: Can reuse flag parsing and path logic from install.js
- Concerns: No existing code to build on, testing requires file system mocking
- Mitigation: Strong test coverage, shared modules with install.js
- Confidence justification: Clean-slate implementation has moderate risk, but requirements are clear

**Testing approach:** 75%
- Strengths: Jest already configured, test patterns established in __tests__/
- Concerns: Integration tests are brittle, 80% coverage is ambitious for complex file system operations
- Mitigation: Focus on unit tests for high coverage, accept lower coverage for integration tests
- Confidence justification: Testing file system operations is inherently complex, but achievable with good practices

**Documentation:** 90%
- Strengths: Clear requirements, existing docs as template, simple scope
- Concerns: None significant
- Mitigation: Systematic review of all documentation files
- Confidence justification: Documentation updates are straightforward, easy to verify completeness

**Timeline estimate:** 70%
- Strengths: Phases are well-scoped, requirements are clear, no major technical unknowns
- Concerns: Integration testing may take longer than estimated, user migration edge cases
- Mitigation: Buffer time in each phase, prioritize P0 requirements, defer nice-to-haves
- Confidence justification: 3-4 week estimate is realistic for experienced developer, but could slip to 5 weeks with complications

**Overall justification (78%):**
- Technical implementation is low-risk (85-95% confidence on most phases)
- User migration and breaking changes introduce uncertainty (65-70% confidence)
- Timeline is realistic but tight (70% confidence)
- Weighted average: ~78% overall confidence

**Recommendation:** Proceed with milestone, but allocate extra attention to:
1. PATH-01 (Claude global path change) — needs clear communication strategy
2. Testing (integration tests) — be ready to adjust coverage targets if needed
3. Phase 4 (Copilot global verification) — may need requirements adjustment

---

## Appendices

### A. Complete Flag Removal Inventory

**Every line in bin/install.js where old flags are used:**

| Line | Code | Action |
|------|------|--------|
| 40 | `const hasGlobal = args.includes('--global') \|\| args.includes('-g');` | DELETE variable declaration |
| 41 | `const hasLocal = args.includes('--local') \|\| args.includes('-l');` | DELETE variable declaration |
| 44 | `const hasCodexGlobal = args.includes('--codex-global');` | DELETE variable declaration |
| 98 | `${cyan}-g, --global${reset}              Install Claude globally` | DELETE help text line |
| 99 | `${cyan}-l, --local${reset}               Install Claude locally` | DELETE help text line |
| 105 | `${cyan}--codex-global${reset}            Install Codex CLI assets globally` | DELETE help text line |
| 122 | `npx get-shit-done-multi --global` | UPDATE to `--claude --global` |
| 125 | `npx get-shit-done-multi --global --config-dir ~/.claude-bc` | UPDATE to `--claude --global --config-dir ~/.claude-bc` |
| 128 | `CLAUDE_CONFIG_DIR=~/.claude-bc npx get-shit-done-multi --global` | UPDATE to `--claude --global` |
| 131 | `npx get-shit-done-multi --local` | UPDATE to `--claude --local` |
| 140 | `npx get-shit-done-multi --codex-global` | DELETE example (feature removed) |
| 180 | `...(hasLocal \|\| hasGlobal ? ['claude'] : [])` | REPLACE with `hasClaudeFlag` logic |
| 182 | `...(hasCodex \|\| hasCodexGlobal ? ['codex'] : [])` | REPLACE with `hasCodexFlag` logic (remove global) |
| 1563 | `if (hasGlobal && hasLocal) {` | DELETE entire if block |
| 1564 | `console.error(\`Cannot specify both --global and --local\`);` | DELETE error message |
| 1566 | `} else if (hasCodex && hasCodexGlobal) {` | DELETE entire if block |
| 1567 | `console.error(\`Cannot specify both --codex and --codex-global\`);` | DELETE error message |
| 1569 | `} else if (hasCopilot && (hasGlobal \|\| hasLocal)) {` | DELETE entire if block |
| 1570 | `console.error(\`Cannot combine --copilot with --global or --local\`);` | DELETE error message |
| 1572 | `} else if ((hasCodex \|\| hasCodexGlobal) && (hasGlobal \|\| hasLocal)) {` | DELETE entire if block |
| 1573 | `console.error(\`Cannot combine --codex flags with --global or --local\`);` | DELETE error message |
| 1575 | `} else if ((hasCodex \|\| hasCodexGlobal) && hasCopilot) {` | UPDATE condition (remove hasCodexGlobal) |
| 1581 | `} else if ((hasCodex \|\| hasCodexGlobal) && explicitConfigDir) {` | UPDATE condition (remove hasCodexGlobal) |
| 1584 | `} else if (explicitConfigDir && hasLocal) {` | DELETE entire if block |
| 1585 | `console.error(\`Cannot use --config-dir with --local\`);` | DELETE error message |
| 1591 | `} else if (hasCodexGlobal) {` | DELETE entire else-if block |
| 1592 | `installCodex(true);` | DELETE (Codex global not supported) |
| 1593 | `} else if (hasGlobal) {` | REPLACE with new flag routing |
| 1594-1598 | Global installation logic | REFACTOR with new flag system |
| 1599 | `} else if (hasLocal) {` | REPLACE with new flag routing |
| 1600-1604 | Local installation logic | REFACTOR with new flag system |

**Total impact:** 28 lines require deletion or modification. Entire routing block (lines 1563-1607) needs complete rewrite.

---

### B. Message String Inventory

**Every console.log/console.error statement in install.js (120 total):**

**Keep (necessary):**
- Line 91: Banner display (keep)
- Line 189: CLI detection success messages (keep)
- Line 192: CLI available messages (keep)
- Line 197: Recommendation display (keep)
- Line 501: File installation failure (keep)
- Success/failure messages throughout (keep with standardization)

**Remove (generic platform notes):**
- Line 201: Platform notes display — CONDITIONAL REMOVE (only if platform note is generic)
- bin/lib/cli-detection/recommender.js line 97: "Linux: XDG Base Directory support" — REMOVE

**Add (new requirements):**
- Codex global warning: "⚠️  Global installation not supported for Codex. Installing locally in current folder."
- Old flag error: "The flag '{flag}' has been removed in v1.10.0. Use '--claude --local' instead. See MIGRATION.md for details."
- Installation success: "✓ Claude Code installed to ~/.claude/" (standardize format)

**Modify (format standardization):**
- All success messages → Use ✓ symbol consistently
- All error messages → Use ✗ symbol consistently
- All progress messages → Use ⠿ symbol consistently
- Add path display to all installation confirmations

**Message categories:**
1. **Banner/Help** (lines 24-148): Keep, update examples
2. **CLI Detection** (lines 187-203): Keep, remove generic platform note
3. **Migration** (lines 153-159): Keep
4. **File Operations** (lines 501-504): Keep, standardize format
5. **Installation Progress** (throughout): Keep, standardize Unicode symbols
6. **Error Handling** (throughout): Keep, add old flag errors
7. **Interactive Prompts** (lines 1529-1560): Replace with Prompts library UI

**Audit checklist:**
- [ ] Remove XDG reference (recommender.js line 97)
- [ ] Add Codex global warning message
- [ ] Add old flag error messages
- [ ] Standardize all success messages (✓ + path)
- [ ] Standardize all error messages (✗)
- [ ] Standardize all progress messages (⠿)
- [ ] Review each message for context-relevance
- [ ] Remove any deprecated/outdated language

---

### C. Path Resolution Code Locations

**Every place paths are computed or used in codebase:**

**bin/lib/paths.js:**
- Lines 21-24: Claude paths definition — UPDATE line 22 (global path)
- Lines 25-28: Copilot paths definition — OK (no changes needed)
- Lines 29-32: Codex paths definition — OK (but disable global in routing)

**bin/install.js:**
- Line 210: `expandTilde()` function — Keep (utility function)
- Line 1526: `const globalPath = configDir || path.join(os.homedir(), '.claude');` — UPDATE to use paths.js
- Line 512: `.github/ISSUE_TEMPLATE` — Keep (hardcoded, correct)
- Line 648: `.claude/get-shit-done/` comment — Keep (destination path)
- Line 731: `~/.claude/agents` comment — UPDATE to reflect new global path
- Line 849-850: `.claude/hooks/statusline.js` paths — Keep (correct)
- Line 897: `.github` for Copilot — Keep (correct)
- Line 970: `.github/skills/get-shit-done/` — Keep (correct)
- Line 1022: `.github/copilot-instructions.md` — Keep (correct)
- Line 1091: `.codex/get-shit-done/` comment — Keep (correct)

**bin/lib/adapters/claude.js:**
- Uses getConfigPaths('claude') from paths.js — Will automatically get new paths

**bin/lib/adapters/copilot.js:**
- Uses getConfigPaths('copilot') from paths.js — OK (no changes)

**bin/lib/adapters/codex.js:**
- Uses getConfigPaths('codex') from paths.js — OK (just disable global in routing)

**Path usage patterns:**
1. ✅ **Centralized**: Most paths come from bin/lib/paths.js (good architecture)
2. ⚠️ **Hardcoded**: Some paths hardcoded in install.js (e.g., line 1526)
3. ✅ **Adapter isolation**: Adapters use paths.js, not hardcoded values

**Changes needed:**
1. **bin/lib/paths.js line 22:** Change Claude global from `~/Library/Application Support/Claude` to `~/.claude/`
2. **bin/install.js line 1526:** Replace hardcoded path with call to getConfigPaths('claude')
3. **All documentation:** Update path references to reflect new Claude global path

**Verification checklist:**
- [ ] Update paths.js with new Claude global path
- [ ] Verify all adapters use paths.js (not hardcoded)
- [ ] Replace hardcoded path at line 1526
- [ ] Update all comments mentioning old paths
- [ ] Test path resolution on macOS (primary concern)
- [ ] Test path resolution on Linux (secondary)
- [ ] Document Windows paths (out of scope for testing, but document for future)

---

### D. Breaking Changes Checklist

**Everything outside install.js that will be affected:**

**1. package.json**
- [ ] Line 60: Update `"install:claude"` script to use `--claude --local`
- [ ] Line 77: Verify prompts version (already OK: `^2.4.2`)
- [ ] Add commander to dependencies (new)

**2. README.md**
- [ ] Line 223: Update example command to new syntax
- [ ] Quick Start section (line 45+): Update installation examples
- [ ] Remove any references to old flags throughout file
- [ ] Add examples for multi-platform installation

**3. docs/contributing.md**
- [ ] Line 187: Update `node bin/install.js --local` to new syntax

**4. docs/github-issues.md**
- [ ] Line 10: Update reference to `--local` flag

**5. docs/troubleshooting-old.md**
- [ ] Line 122: Update command to new syntax

**6. docs/setup-claude-code.md**
- [ ] Review for any old flag references (none found in grep, but review full file)

**7. Create new files:**
- [ ] `/workspace/MIGRATION.md` - Create new file for v1.10.0 migration guide
- [ ] `/workspace/bin/uninstall.js` - Create new uninstall script
- [ ] `/workspace/bin/lib/cli-parser.js` - Extract shared flag parsing logic (optional but recommended)
- [ ] `/workspace/bin/lib/messages.js` - Extract shared message display logic (optional but recommended)
- [ ] `/workspace/__tests__/flag-parsing.test.js` - Flag parsing unit tests
- [ ] `/workspace/__tests__/interactive-menu.test.js` - Interactive menu tests
- [ ] `/workspace/__tests__/installation.test.js` - Installation workflow integration tests
- [ ] `/workspace/__tests__/uninstall.test.js` - Uninstall workflow tests

**8. Update existing files:**
- [ ] `/workspace/CHANGELOG.md` - Add v1.10.0 entry with two-section format
- [ ] `/workspace/bin/install.js` - Complete rewrite of flag parsing and routing (1612 lines)
- [ ] `/workspace/bin/lib/paths.js` - Update Claude global path (line 22)
- [ ] `/workspace/bin/lib/cli-detection/recommender.js` - Remove XDG note (line 97)
- [ ] `/workspace/jest.config.js` - Update coverage thresholds

**9. CI/CD (if exists):**
- [ ] Search .github/workflows/ for old flag usage (none found, but verify before release)
- [ ] Update any installation commands in workflows

**10. User-facing impact:**
- [ ] Existing global Claude installations on macOS will break (path change)
- [ ] Scripts calling `npx get-shit-done-multi --global` will break (flag removed)
- [ ] Scripts calling `--codex-global` will break (flag removed)
- [ ] npm run install:claude will break (uses old flag in package.json)

**11. Migration path:**
- [ ] Document old → new flag mapping in MIGRATION.md
- [ ] Document Claude global path change in MIGRATION.md
- [ ] Provide clear error messages with migration guide link
- [ ] Consider data migration helper script (optional, P1 for v1.10.1)

**Complete checklist before release:**
- [ ] All files above updated
- [ ] All tests passing
- [ ] Manual QA on macOS (primary platform)
- [ ] Manual QA on Linux (secondary platform)
- [ ] Documentation reviewed by fresh eyes
- [ ] Migration guide tested with actual old commands
- [ ] Error messages tested with old flags
- [ ] CHANGELOG complete with breaking changes section

---

**End of Validation Report**

Generated by: GSD Phase Research Agent  
Date: 2026-01-24  
Commit: 8ce4d0cddb0fe1eb5023ddfec5a97b542f3df21e  

**Next Steps:**
1. Review this validation with stakeholders
2. Address HIGH risk items (Claude global path strategy)
3. Verify Copilot global path with actual CLI
4. Proceed with Phase 1 (Commander.js installation)
