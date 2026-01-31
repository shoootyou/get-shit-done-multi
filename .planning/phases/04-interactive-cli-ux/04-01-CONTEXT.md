---
phase: 4
discussed: 2026-01-26T19:46:00Z
areas: [Platform Detection & Recommendations, Skill Selection Interaction, Progress & Feedback Density, Error Recovery UX]
decisions_count: 12
---

# Phase 4 Context: Interactive CLI with Beautiful UX

**Phase Goal:** User runs `npx get-shit-done-multi` (no flags), sees beautiful interactive prompts, selects platform and skills, confirms installation

**Discussed:** 2026-01-26  
**Areas Covered:** 4/4 (complete deep-dive)

---

## Essential Features

### Platform Detection & Selection
- **Show all three platforms** in selection menu regardless of detection status
- **Disable undetected platforms** with "Install CLI first" message
- **Display existing GSD versions** next to platform name (e.g., "Claude (v2.0.0)")
- **Allow multi-platform selection** in single run (same as CLI --claude --copilot)
- **Global detection check:** If NO CLIs are detected at all, show warning asking for confirmation before proceeding to platform selection

### Skill Selection
- **Install everything by default** - All 29 skills + 13 agents automatically
- **Skip skill selection step entirely** - No prompt for individual skill choice
- **No confirmation prompt** - Proceed directly to installation progress after platform/scope selection

### Progress & Feedback
- **Use same progress display as CLI version** (multi-bar: Skills, Agents, Shared per platform)
- **Use same spinner/text format as CLI** during installation
- **Use same success message as CLI** after completion (summary + next steps)

### Error Recovery
- **Use same error format as CLI** (technical error + actionable guidance)
- **Just exit with error code** - No retry/recovery prompts in interactive mode
- **Continue with successful platforms** if multi-platform install, warn about failures

---

## Technical Boundaries

### Library Choices
- **@clack/prompts** for interactive CLI (from roadmap)
- **cli-progress** for progress bars (already in use from Phase 2)
- **chalk** for colored output (already in use from Phase 2)

### Reuse CLI Implementation
- **Progress rendering:** Reuse existing progress display from Phase 2/3 CLI
- **Error formatting:** Reuse existing error handler with actionable guidance
- **Success messages:** Reuse existing completion messages

### Entry Point Detection
- **No flags detected** in `bin/install.js` → enter interactive mode
- **Any flags present** → use existing non-interactive CLI mode

---

## Scope Limits

### Out of Scope for Phase 4
- **Individual skill selection** - Not needed, install everything by default
- **Confirmation prompts** - Skip to streamline UX
- **Retry/recovery prompts** - Just exit on error (can be Phase 5+ enhancement)
- **Custom installation paths** - Use standard global/local paths only
- **Selective agent installation** - All agents installed together with skills

### Explicitly NOT Building
- **Uninstall flow** - Separate future feature
- **Update prompts** - Handled in Phase 6 (Version Detection)
- **Skill descriptions/previews** - Not in v2.0 scope
- **Installation analytics** - Not in project scope

---

## Open Questions for Research

### Platform Detection Implementation
- **Q:** How to detect CLI binaries reliably across platforms (macOS, Linux, Windows)?
- **Research:** Binary detection utilities in Node.js, cross-platform PATH resolution
- **Why:** Need to mark platforms as detected/undetected in menu

### Disabled Menu Options in @clack/prompts
- **Q:** Can @clack/prompts disable menu items with custom messages?
- **Research:** @clack/prompts API for disabled options, "coming soon" pattern
- **Why:** Need "Install CLI first" message for undetected platforms

### Multi-Select Platform Implementation
- **Q:** How to do multi-select checkbox list in @clack/prompts?
- **Research:** @clack/prompts multiselect API, checkbox patterns
- **Why:** Allow selecting multiple platforms like CLI flags

### Progress Bar Reuse
- **Q:** Can cli-progress MultiBar be reused between CLI and interactive modes?
- **Research:** cli-progress API, shared progress renderer architecture
- **Why:** Want consistent progress display across modes

### Global Detection Warning Pattern
- **Q:** Best UX pattern for "No CLIs detected at all" warning before platform selection?
- **Research:** @clack/prompts confirm() with warning messages, early-exit patterns
- **Why:** Need user confirmation when zero platforms detected before showing selection menu
- **Decision:** Show warning, ask confirmation, if declined exit gracefully

---

## User-Facing Behavior Decisions

### Interactive Flow
1. **Welcome screen** (optional intro message)
2. **Global detection check** (if zero CLIs detected, show warning and confirm to proceed)
3. **Platform selection** (multi-select menu, show all three, disable undetected)
4. **Scope selection** (global vs local, one choice per platform if multi-selected)
5. **Immediate installation** (no skill selection, no confirmation)
6. **Progress display** (same as CLI - multi-bar per platform)
7. **Completion** (success message with next steps)

### Error Handling Flow
1. **Error occurs** during installation
2. **Display error** (technical message + actionable guidance, same as CLI)
3. **Exit with error code** (no retry prompt)
4. **Multi-platform:** Continue successful platforms, warn about failures at end

### Detection States
- **Detected + Installed:** "Claude (v2.0.0)" - normal selectable option
- **Detected + Not Installed:** "Claude" - normal selectable option
- **Not Detected:** "Claude (Install CLI first)" - disabled in menu, but can be forced

---

## Phase Completion Criteria

### Must Demonstrate
- ✅ Interactive mode triggers when no CLI flags present
- ✅ Global detection check: If zero CLIs detected, show warning and confirm
- ✅ Platform menu shows all three platforms with detection status
- ✅ Multi-platform selection works (can select Claude + Copilot)
- ✅ Scope selection works (global/local per platform)
- ✅ Progress display matches CLI version (multi-bar)
- ✅ Success message matches CLI version
- ✅ Error handling matches CLI version
- ✅ Multi-platform partial failure handled correctly

### Success Validation
Run `npx get-shit-done-multi` (no flags) and verify:
1. Interactive prompts appear
2. Can select multiple platforms
3. Can choose global or local scope
4. Installation proceeds without confirmation
5. Progress bars show correctly
6. Success message displays with next steps
7. If error: shows guidance and exits cleanly

---

## Notes

### Design Philosophy
- **Streamlined:** Skip unnecessary prompts (confirmation, skill selection)
- **Consistent:** Use same progress/error display as CLI mode
- **Flexible:** Allow multi-platform selection like CLI
- **Forgiving:** Allow installation to undetected platforms with warning

### Future Enhancements (NOT Phase 4)
- Individual skill selection toggle (if user feedback demands it)
- Retry/recovery prompts after errors
- Preview mode before installation
- Custom installation paths
- Skill descriptions/documentation in menu

---

**Context ready for:** Research phase → Planning phase  
**Downstream agents:** Use these decisions without re-asking user
