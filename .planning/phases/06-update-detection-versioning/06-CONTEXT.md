---
phase: 06-update-detection-versioning
status: context-gathered
created: 2026-01-27
tags: [update-detection, versioning, manifest-reading, semver-comparison]
---

# Phase 6 Context: Update Detection and Versioning

## Phase Goal

User re-runs installer → sees installed version, gets prompted if update available, can upgrade

## Dependencies

- Phase 5 (needs installation manifest with version tracking)
- `semver` package (version comparison)

## Requirements Mapped

- VERSION-02: Update detection
- VERSION-03: Version display

## Context Gathering

### Gray Area 1: Update Prompting Strategy

**1.1 When should the installer prompt for updates?**
- **Decision:** Show version info inline with platform options (like CLI detection)
- **Rationale:** User provided: "Show if the version it's outdated just at the side of the option. Something like the detection of the CLI"
- **Implementation:** Platform selection shows "Claude Code (v2.0.0 → v2.1.0)" inline

**1.2 Default update behavior?**
- **Decision:** Auto-update (recommended) - Update without asking
- **Rationale:** Streamlined UX, users expect latest version
- **Implementation:** No separate confirmation, selecting outdated platform auto-updates

**1.3 Multiple outdated platforms?**
- **Decision:** Let user select which to update (checkboxes in platform selection)
- **Rationale:** User control over what gets updated
- **Implementation:** Platform selection allows multiple choices, each auto-updates when selected

**1.4 Partial update failures?**
- **Decision:** Continue with successful updates (log failures)
- **Rationale:** Don't block all updates because one failed
- **Implementation:** Log error to `.gsd-error.log`, continue with remaining platforms

### Gray Area 2: Version Display & Communication

**2.1 Where should version information appear?**
- **Decision:** Inline with platform options (refers to 1.1)
- **Rationale:** User specified inline display like CLI detection
- **Implementation:** Platform list shows version status per platform

**2.2 How verbose should version display be?**
- **Decision:** Minimal: Just version numbers (v2.0.0 → v2.1.0)
- **Rationale:** Clean, scannable UI
- **Implementation:** No dates, no scope labels in inline display

**2.3 Downgrade scenario?**
- **Decision:** Block downgrade completely - No downgrade support
- **Rationale:** User specified: "Downgrade is not possible. Discard all implementation about it. If the user want to install an older version block the execution and recommend to use the latest"
- **Implementation:** 
  - Detect if installer version < installed version
  - Block execution with error message
  - Recommend using latest version via `npx get-shit-done-multi@latest`
  - No --force override for downgrades

**2.4 Major version jump warnings?**
- **Decision:** Yes - Warn about breaking changes for major bumps
- **Rationale:** Protect users from unexpected breaking changes
- **Implementation:** Detect major version increase (2.x → 3.x), show warning before update

### Gray Area 3: Update Behavior & User Control

**3.1 Preserve customizations during update?**
- **Decision:** Ask user + recommend contributing
- **Rationale:** User specified: "Ask user to preserve customizations and recommend to collaborate to the project with the url of the repository in pkg"
- **Implementation:**
  - Prompt: "Preserve customizations? [Y/n]"
  - If customizations detected, show: "Consider contributing: https://github.com/shoootyou/get-shit-done-multi"
  - Use package.json repository URL dynamically

**3.2 Can users skip update prompts?**
- **Decision:** No - Always check and inform (can't skip)
- **Rationale:** Keep users informed, no silent outdated installations
- **Implementation:** No --skip-update-check flag, always runs version check

**3.3 Check-updates-only mode?**
- **Decision:** Yes - Add --check-updates flag (no installation)
- **Rationale:** Let users check status without full install
- **Implementation:** New CLI flag that shows all installations and versions, exits without installing

**3.4 CLI flags for update control?**
- **Decision:** None - no special flags needed (except --check-updates from 3.3)
- **Rationale:** Auto-update behavior + inline selection covers all cases
- **Implementation:** Only --check-updates flag, no --force or --skip-update-check

### Gray Area 4: Installation Discovery Scope

**4.1 Check both global and local or match scope?**
- **Decision:** Match scope - Global install only checks global, local checks local
- **Rationale:** Respect user's chosen scope, avoid confusion
- **Implementation:** 
  - Global mode: Check only ~/.claude/, ~/.copilot/, ~/.codex/
  - Local mode: Check only .claude/, .github/, .codex/

**4.2 Non-standard installation locations?**
- **Decision:** Add --custom-path flag to specify additional search paths
- **Rationale:** Support edge cases without auto-scanning entire system
- **Implementation:** `--custom-path=/custom/location` adds to search list

**4.3 Silent or show discoveries?**
- **Decision:** Verbose mode only (--verbose flag shows discovery)
- **Rationale:** Keep default output clean, detailed info available when needed
- **Implementation:** Default silent, --verbose shows "Found: Claude v2.0.0 (global)"

**4.4 Corrupted manifests?**
- **Decision:** Attempt repair - Try to reconstruct manifest from files
- **Rationale:** Recover gracefully instead of failing
- **Implementation:**
  - Detect corrupted JSON or missing fields
  - Scan directory to reconstruct file list
  - Derive version from package.json or commit if possible
  - Log reconstruction attempt
  - If repair fails, treat as new installation

## Success Criteria

1. ✅ On re-run, installer reads manifests from scope-appropriate paths
2. ✅ Installer compares versions using semver (handle major bumps specially)
3. ✅ Inline version display in platform selection: "Claude Code (v2.0.0 → v2.1.0)"
4. ✅ Auto-update when user selects outdated platform (no extra prompt)
5. ✅ User can select multiple platforms to update via checkboxes
6. ✅ Partial failures logged, other updates continue
7. ✅ Block downgrade attempts with helpful message
8. ✅ Warn on major version jumps
9. ✅ Ask to preserve customizations + show contribution link
10. ✅ --check-updates flag shows all installations without installing
11. ✅ --custom-path flag for non-standard locations
12. ✅ --verbose flag shows discovery process
13. ✅ Attempt manifest repair on corruption

## Key Deliverables

**Core Modules:**
- `/bin/lib/version/installation-finder.js` - Discover GSD installations by scope
- `/bin/lib/version/manifest-reader.js` - Read and validate manifests (with repair)
- `/bin/lib/version/version-checker.js` - Compare versions using semver
- `/bin/lib/version/update-prompter.js` - Inline version display logic

**CLI Enhancements:**
- `--check-updates` flag (check-only mode)
- `--custom-path` flag (additional search paths)
- `--verbose` flag (show discovery)

**Interactive UX Changes:**
- Platform selection shows inline version status
- Customization preservation prompt
- Major version bump warning
- Contribution link display

## Non-Goals (Out of Scope)

- ❌ Downgrade support (explicitly blocked)
- ❌ Automatic scheduled update checks (user must run installer)
- ❌ Update rollback mechanism (handled by Phase 5 validation)
- ❌ Delta updates (always full reinstall)
- ❌ --force or --skip-update-check flags (not needed with auto-update)

## Technical Notes

### Version Comparison Logic

```javascript
// Major bump detection (2.x → 3.x)
const installedMajor = semver.major(installedVersion);
const currentMajor = semver.major(currentVersion);
if (currentMajor > installedMajor) {
  showMajorBumpWarning();
}

// Downgrade block
if (semver.lt(currentVersion, installedVersion)) {
  throw new Error('Downgrade not supported. Use latest version.');
}

// Update available
if (semver.gt(currentVersion, installedVersion)) {
  return { updateAvailable: true, from: installedVersion, to: currentVersion };
}
```

### Manifest Search Paths (Scope-Based)

```javascript
// Global scope
const globalPaths = [
  '~/.claude/get-shit-done/.gsd-install-manifest.json',
  '~/.copilot/get-shit-done/.gsd-install-manifest.json',
  '~/.codex/get-shit-done/.gsd-install-manifest.json'
];

// Local scope (cwd-relative)
const localPaths = [
  '.claude/get-shit-done/.gsd-install-manifest.json',
  '.github/get-shit-done/.gsd-install-manifest.json',
  '.codex/get-shit-done/.gsd-install-manifest.json'
];
```

### Manifest Repair Strategy

```javascript
// 1. Try to parse JSON
// 2. If invalid, scan directory for files
// 3. Extract version from:
//    - package.json in parent directory
//    - git commit if .git exists
//    - Latest known version as fallback
// 4. Reconstruct manifest structure
// 5. Write repaired manifest
// 6. Log repair action
```

## Integration Points

- **Phase 5 Manifest Generation:** Reads manifests created in Phase 5
- **Phase 2 Orchestrator:** Update logic integrated into installation flow
- **Phase 4 Interactive CLI:** Version display in platform selection prompts
- **Phase 3 Platform Adapters:** Uses platform metadata for discovery

## Risks & Mitigations

**Risk 1: Manifest corruption detection**
- Mitigation: Attempt repair with directory scan + version heuristics

**Risk 2: Multiple installations conflict**
- Mitigation: Scope-based discovery prevents global/local collision

**Risk 3: User confusion about auto-update**
- Mitigation: Clear inline display shows what will happen

**Risk 4: Non-standard locations not found**
- Mitigation: --custom-path flag for edge cases

## Testing Strategy

**Unit Tests:**
- version-checker: semver comparison, major bump detection, downgrade detection
- manifest-reader: valid manifest, corrupted manifest, repair logic
- installation-finder: scope-based discovery, custom paths

**Integration Tests:**
- Full update flow: detect → display → select → update
- Downgrade blocking
- Major version warning
- Manifest repair
- Partial failure handling

**Manual Tests:**
- --check-updates output
- --verbose discovery display
- Customization preservation prompt
- Contribution link display
- Multiple platform updates

## Open Questions

None - all gray areas resolved through user input.

## Next Steps

1. Create detailed plan breaking down implementation into waves
2. Identify file structure and module responsibilities
3. Define test coverage requirements
4. Plan integration points with existing code

Ready for planning phase.
