# Phase 2: Flag System Redesign - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can select platforms explicitly via flags with scope modifiers, and receive clear errors if old flags are used. This phase implements the Commander.js-based flag parsing system that replaces the old implicit platform assumptions (`--local` = Claude) with explicit platform selection (`--claude --local`). Supports multi-platform installation in a single command.

**Scope:**
- Platform flags: `--claude`, `--copilot`, `--codex`, `--all`
- Scope modifiers: `--global`, `--local` (default: local)
- Old flag detection and warnings: `--local`, `--global`, `--codex-global`
- Validation for flag conflicts and combinations
- Codex global warning system

**Out of scope (other phases):**
- Interactive menu (Phase 3)
- Actual installation logic (later phases)
- Uninstall implementation (Phase 6)

</domain>

<decisions>
## Implementation Decisions

### Flag Conflict Resolution

**Conflicting scope flags** (`--local --global`):
- Error immediately with message: "Cannot use both --local and --global. Choose one."
- Exit with non-zero code
- Do not attempt to proceed

**Duplicate platform flags** (`--claude --claude`):
- Show warning: "⚠️  Duplicate flag detected: --claude (will be installed once)"
- Deduplicate silently (treat as single occurrence)
- Continue with installation

**--all with specific platforms** (`--all --claude`):
- `--all` wins, ignore specific platform flags
- Show info message: "ℹ️  Using --all (specific platform flags ignored)"
- Install all platforms

**Scope without platform** (`--global` with no platform):
- Proceed with empty platform selection
- Trigger interactive menu (Phase 3 behavior)
- Scope modifier is remembered when menu completes

### Old Flag Detection

**Detection timing**:
- Check for old flags BEFORE Commander.js parsing
- Raw argv inspection: `process.argv.includes('--local')`, etc.
- Early detection allows cleaner error handling

**Mixed old/new flags** (`--local --claude`):
- Execute using new flags only
- Show warning about old flags being ignored
- Continue with installation (not a fatal error)

**--codex-global special handling**:
- NO special treatment
- Treat as invalid/unknown flag (let Commander.js handle)
- Falls into "unknown option" error path

**Detection strictness**:
- Exact match only: `--local`, `--global`, `--codex-global`
- Do NOT catch variations: `--locale`, `-l`, `--loc`, etc.
- Typos are unrelated errors

### Warning Message UX

**Verbosity level**:
- Minimal format: flag removed + migration example + link
- Structure:
  ```
  ⚠️  The following flags have been removed in v1.10.0: --local
      Use '--claude --local' instead of '--local'
      See MIGRATION.md for details
  ```

**Migration example specificity**:
- Show specific replacement, not generic
- `--local` → "Use '--claude --local' instead of '--local'"
- `--global` → "Use '--claude --global' instead of '--global'"
- Not context-aware (always suggest --claude regardless of intent)

**Multiple old flags** (`--local --global`):
- Single warning listing all old flags found
- Format:
  ```
  ⚠️  The following flags have been removed in v1.10.0: --local, --global
      Use '--claude --local' instead
      See MIGRATION.md for details
  ```

**Warning timing**:
- Display at the very beginning, before any processing
- Show warning → continue with new flags → proceed with installation
- Warning doesn't block execution (unless conflicting scopes)

### Codex Global Warning

**Warning timing**:
- Show before any installation starts
- Display during validation phase, after flag parsing
- Must appear before progress indicators

**--all --global behavior**:
- Show both: Codex-specific warning + full installation summary
- Format:
  ```
  ⚠️  Global installation not supported for Codex. Installing locally in current folder.
  
  Installation plan:
    • Claude → ~/.claude/ (global)
    • Copilot → ~/.copilot/ (global)
    • Codex → [repo-root]/.codex/ (local)
  ```

**Visual formatting**:
- Warning icon: ⚠️
- Color: Yellow/orange (ANSI color codes)
- Indentation: 2-space indent for wrapped lines
- Distinct from regular output (color + icon + formatting)

**User confirmation**:
- After showing warning, ask: "Continue with installation? (y/n)"
- Wait for user input
- y/Y → proceed with installation
- n/N → abort with message "Installation cancelled"
- Invalid input → re-prompt
- Non-TTY environment → auto-proceed (no prompt)

### Claude's Discretion

- Exact wording of info messages (not warnings/errors)
- ANSI color code selection (as long as warnings are yellow/orange)
- Commander.js configuration details (option order, aliases)
- Internal module structure for flag validation
- Unit test organization

</decisions>

<specifics>
## Specific Ideas

- Old flag handling evolved during discussion: started as "reject with error" but changed to "warn and continue" to be less disruptive
- Codex warning needs confirmation to prevent accidental local installs when user expected global
- Flag conflict errors should be strict (fail fast) but duplicate flags should be lenient (warn and dedupe)
- The warning message format should match the format already used in the codebase (check for existing warning patterns)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. All flag-related decisions captured.

</deferred>

---

*Phase: 02-flag-system-redesign*
*Context gathered: 2026-01-24*
*Areas discussed: Flag Conflict Resolution, Old Flag Detection, Warning Message UX, Codex Global Warning*
*Decisions captured: 16*
