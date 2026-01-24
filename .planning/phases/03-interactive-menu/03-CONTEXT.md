# Phase 3: Interactive Menu Implementation - Context

**Gathered:** 2026-01-24
**Status:** Ready for planning

<domain>
## Phase Boundary

Users without flags enter intuitive multi-select menu for platform and scope choice. This phase implements the Prompts-based interactive menu system that triggers when no platform flags are provided. The menu produces the same output format as Phase 2's flag parser, ensuring seamless integration.

**Scope:**
- Interactive platform selection (checkbox multi-select)
- Interactive scope selection (radio single-select)
- TTY detection and non-TTY error handling
- Integration with Phase 2 flag parser output format
- Pre-installation summary display

**Out of scope (other phases):**
- Flag parsing (Phase 2 - already complete)
- Actual installation logic (Phase 4)
- Old flag detection (Phase 2 - already complete)
- Uninstall implementation (Phase 6)

</domain>

<decisions>
## Implementation Decisions

### Menu Selection Behavior

**"All" platform handling:**
- When user selects "All", ignore any individual platform selections
- "All" acts as override, not additive
- Result: platforms = ['claude', 'copilot', 'codex']

**Empty platform selection:**
- If user presses Enter without selecting any platforms → show error
- Error message: "At least one platform must be selected"
- Re-prompt the same platform selection menu
- Do not exit or default - user must make a choice

**Codex global warning:**
- Do NOT show warning in menu code
- Menu just constructs: { platforms: ['codex'], scope: 'global' }
- Phase 2's codex-warning module handles warning + confirmation
- Menu integration happens before codex warning check

**Selection confirmation:**
- Platform selection: Space to toggle, Enter to confirm
- Scope selection: Arrow keys to navigate, Enter to confirm
- Esc or Ctrl+C at any point → cancel and exit

### Error Handling & Edge Cases

**Cancel behavior (Ctrl+C / Esc):**
- Exit immediately with message: "Installation cancelled"
- Exit code: 0 (user choice, not an error)
- No confirmation prompt ("Are you sure?")
- Clean exit, no stack trace

**Non-TTY environment:**
- If `!process.stdin.isTTY` when menu would trigger → error
- Error message: "Interactive menu requires TTY. Use explicit flags for non-interactive environments."
- Exit code: 1 (error condition)
- **Important:** Do NOT auto-proceed with defaults in non-TTY

**Prompt error during selection:**
- If prompts library throws error mid-selection → restore to main menu
- Show message: "Selection failed. Restarting menu..."
- Start over from platform selection (don't preserve partial state)
- After 3 failed attempts → exit with error

**Scope prompt failure:**
- If scope selection fails after successful platform selection → error
- Error message: "Scope selection failed"
- Exit code: 1
- Do NOT default to local - explicit failure

### Visual Presentation & Clarity

**Platform selection prompt:**
- Instruction text: "Select platforms to install (Space to toggle, Enter to confirm):"
- Options: "Claude", "Copilot", "Codex", "All"
- Just names, no descriptions or icons
- No default selection (all unchecked initially)

**Scope selection prompt:**
- Instruction text: "Select installation scope:"
- Options: "Local", "Global"
- Default: "Local" pre-selected
- Radio button (single select only)

**Pre-installation summary:**
- Show both summary and detailed plan
- Format:
  ```
  Installing Claude, Copilot globally...
  
  Installation plan:
    • Claude → ~/.claude/ (global)
    • Copilot → ~/.copilot/ (global)
  ```
- Display after menu selections, before calling installation logic

**Menu styling:**
- Use prompts library default styling
- Checkboxes: `[ ]` unchecked, `[✓]` checked
- Radio: `( )` unselected, `(•)` selected
- Current selection: highlighted (prompts default behavior)

### Integration with Flag System

**Partial platform flags:**
- If platform provided but no scope (e.g., `--copilot`)
- Default to local scope, do NOT trigger menu
- Show message: "No scope specified, defaulting to local"
- Proceed with flag-based installation

**Scope-only flags:**
- If scope provided but no platform (e.g., `--global`)
- Trigger interactive menu for platform selection ONLY
- Skip scope prompt (scope already known from flag)
- Use flag-provided scope with menu-selected platforms

**Menu output format:**
- Return object matching Phase 2 flag parser exactly:
  ```javascript
  {
    platforms: ['claude', 'copilot'], // Array of strings
    scope: 'global', // String: 'global' or 'local'
    needsMenu: false // Always false after menu completes
  }
  ```

**Integration timing:**
- Phase 2 flag parser sets `needsMenu: true` when no platforms
- install.js checks `needsMenu` flag after flag parsing
- If true, call menu module
- Menu module returns same structure as flag parser
- Continue to Phase 2's codex-warning check with menu output

### Claude's Discretion

- Exact wording of error messages (as long as clear and actionable)
- Prompts library configuration details (colors, formatting)
- Internal menu module structure
- Retry logic implementation details
- Log levels for debugging (if any)

</decisions>

<specifics>
## Specific Ideas

- "All" override behavior prevents user confusion about whether selections are additive
- Non-TTY strict error (not auto-proceed) forces explicit flags in CI/CD, preventing surprises
- Menu output matches flag parser format for seamless integration - downstream code doesn't know which system was used
- Scope-only flag case (`--global` alone) enables power users to quickly select platforms while keeping global scope
- Partial flags default to local matches Phase 2's default behavior

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. All menu-related decisions captured.

</deferred>

---

*Phase: 03-interactive-menu*
*Context gathered: 2026-01-24*
*Areas discussed: Menu Selection Behavior, Error Handling & Edge Cases, Visual Presentation & Clarity, Integration with Flag System*
*Decisions captured: 16*
