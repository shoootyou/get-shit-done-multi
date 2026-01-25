---
phase: 05-message-optimization
discussed: 2026-01-25T01:47:00Z
areas:
  - Message Verbosity Levels
  - Multi-Platform Installation Output
  - Warning Message Behavior
  - Error Recovery Messaging
decisions_count: 16
---

# Phase 5 Context: Message Optimization

**Phase Goal:** Installation output is clean, context-aware, and shows only necessary information

**Discussed:** 2026-01-25

## Essential Features

### Message Verbosity Standards

**Success messages (detailed):**
- Show installation path + file counts
- Format: `✓ Claude Code installed to ~/.claude/ (5 commands, 13 agents, 2 skills)`
- Include all context users need to verify installation

**Progress indicators (phase transitions only):**
- Show major phase transitions: checking → installing → complete
- Remove verbose intermediate steps
- No progress bars or percentages

**Error messages (minimal):**
- State the problem only, no hints or suggestions
- Format: `✗ Error: Permission denied for ~/.claude/`
- No recovery guidance, troubleshooting steps, or links

**Warning display (relevant only):**
- Migration warnings: Only when relevant to current operation
- Old Claude path warning: Only show on global install (not local)
- All warnings require explicit user context to appear

### Multi-Platform Installation Flow

**Sequential processing:**
- Install platforms one at a time (not parallel)
- Use indentation to group messages under platform name
- Format:
  ```
  Installing Claude...
    ✓ Installed to ~/.claude/ (5 commands, 13 agents, 2 skills)

  Installing Copilot...
    ✓ Installed to ~/.copilot/ (5 commands, 13 agents, 2 skills)
  ```

**Error handling:**
- Continue to other platforms if one fails
- Show errors at end after all platforms attempted
- Don't stop on first error

**Final summary:**
- After all platforms processed, show summary with platform names
- Format: `✓ Claude, Copilot, Codex installed`
- List names, not just count

### Warning Message Presentation

**Visual treatment:**
- Warnings shown in separate box/frame
- Use Unicode box-drawing characters for frame
- Include `⚠️ WARNING` header

**Multiple warnings:**
- Combine all warnings into single box
- Show count: `⚠️ WARNINGS (2)`
- List each warning as bullet point

**Codex global warning behavior:**
- Always require user confirmation (safer)
- Show warning, wait for y/N input
- Don't auto-continue

**Warning box format:**
```
┌─────────────────────────────────────────────┐
│ ⚠️  WARNING                                 │
│ Global not supported for Codex              │
│ Installing locally instead                  │
└─────────────────────────────────────────────┘
Continue? [y/N]: _
```

### Error Recovery Behavior

**Actionable errors:**
- Just state the problem (no recovery hints)
- No example commands or troubleshooting steps
- Keep consistent with minimal error principle

**Fatal errors:**
- Show error message
- Continue to next platform (if multi-platform install)
- Don't exit immediately

**Unexpected errors:**
- Just error message (current behavior)
- No troubleshooting guidance or links
- User expected to know how to debug

**Exit codes:**
- Exit 0: All platforms installed successfully
- Exit 1: Any failure (all failed OR partial success)
- Follows POSIX standard (exit code 2 reserved for shell command misuse)
- Summary message provides success/failure details for multi-platform installs

## Technical Boundaries

**Message manager module:**
- Build separate module for context-aware message logic
- Extract message templates from install.js
- Handle conditional display based on platform/OS/scope

**Unicode symbols (standardized):**
- Success: ✓
- Error: ✗
- Progress: ⠿ (or phase-specific indicators)
- Warning: ⚠️

**Context awareness:**
- Platform being installed (Claude, Copilot, Codex)
- Scope (global vs local)
- Operating system (macOS, Linux, Windows)
- Multi-platform vs single platform operation

**No verbose generic messages:**
- Remove: "Linux XDG Base Directory support..."
- Remove: Platform-agnostic explanations
- Show only relevant context for current operation

## Scope Limits

**Out of scope for Phase 5:**
- Logging to file (just terminal output)
- Verbose/debug mode flags
- Colorization based on terminal capabilities
- Progress bars or spinners
- Interactive progress updates
- Message localization/i18n
- Custom message templates from config

**Explicitly NOT changing:**
- Flag parsing messages (Phase 2 owns this)
- Interactive menu messages (Phase 3 owns this)
- Migration detection messages (Phase 4 owns this)
- Only optimizing installation output flow

## Open Questions for Research

**Message manager architecture:**
- Best pattern for context-aware message display?
- How to make messages testable without mocking console?
- Should message templates live in separate file or inline?

**Box-drawing characters:**
- Do box characters render correctly on Windows CMD/PowerShell?
- Fallback strategy if terminal doesn't support Unicode?
- Should box width be fixed or dynamic based on message length?

**Multi-platform error aggregation:**
- How to best display multiple errors at end?
- Should errors show in order of occurrence or grouped by type?
- Format for error summary section?

**Exit code standards:**
- Does exit code 2 for partial success align with CLI conventions?
- Should exit code be configurable?
- How do other CLIs handle multi-operation partial failures?

**Confirmation prompt integration:**
- How to integrate Codex global confirmation with multi-platform flow?
- Should confirmation pause all operations or just current platform?
- Format for confirmation prompt with warning box?

## Implementation Notes

**Message categories to optimize:**
1. Migration detection output
2. Platform installation output
3. Conflict resolution output  
4. Success confirmation output
5. Warning display output
6. Error display output
7. Multi-platform summary output

**Context variables needed:**
- currentPlatform (claude/copilot/codex)
- currentScope (global/local)
- currentOS (macos/linux/windows)
- multiPlatformMode (boolean)
- platformCount (number)
- successCount (number)
- failureCount (number)

**Output should feel:**
- Clean: No unnecessary noise
- Scannable: Key info stands out
- Actionable: Errors are clear
- Professional: Consistent formatting
