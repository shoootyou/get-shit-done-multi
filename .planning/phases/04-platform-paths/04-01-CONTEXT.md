---
phase: 04-platform-paths
discussed: 2026-01-24T23:50:00Z
areas: [path-validation-conflicts, config-directory-handling, path-migration-strategy, cross-platform-handling]
decisions_count: 24
---

# Phase 4: Platform Path Implementation - CONTEXT

## Phase Goal

Each platform installs to correct local and global directories per updated specification:
- Claude: `[repo]/.claude/` (local), `~/.claude/` (global)
- Copilot: `[repo]/.github/` (local), `~/.copilot/` (global)
- Codex: `[repo]/.codex/` (local only)

## Essential Features

### Path Resolution (Core)
- Use Node.js `path.join()` for ALL path construction (cross-platform safety)
- Use `os.homedir()` for tilde expansion (no manual ~ replacement)
- Paths must work in PowerShell, CMD, and Git Bash on Windows
- Detect WSL and treat as Linux (not Windows)

### Validation & Safety
- Validate paths before installation:
  - Windows: Check for invalid characters `<>:"|?*`
  - Unix: Check permissions before mkdir
  - All platforms: Check path length limits (Windows 260 char, Unix 4096)
- Show platform-specific error messages when validation fails

### Conflict Resolution
1. **GSD content exists** (re-installation): Automatic cleanup and install latest version
2. **Non-GSD content exists** (user files): Per-file confirmation with conflict path shown
3. **Permission errors**: Fail with suggestion to use `--local` instead of `--global`
4. **Partial installation state**: Silent detection, cleanup GSD content only, continue installation

### What Identifies GSD Content
- Files in `commands/` directory
- Files in `agents/` directory  
- Files in `skills/` directory
- The `get-shit-done/` folder itself
- These are the "outputs" of GSD installation that can be safely removed

## Technical Boundaries

### Config Directory Behavior
- `--config-dir /custom/path` replaces default installation destination
- Creates platform subdirectories: `/custom/path/.claude/`, `/custom/path/.github/`, etc.
- **Error** if used with `--global`: "Cannot use --config-dir with --global"
- Works with `--local` (explicit) or no scope (default local)
- Supports multi-platform: `--claude --copilot --config-dir /path` creates both subdirs

### Path Migration (Breaking Change)
- **Old Claude path:** `~/Library/Application Support/Claude` → **New:** `~/.claude/`
- **During install:** Silently detect old path, show warning if exists, do NOT auto-remove
- **During uninstall:** Remove ONLY from `~/.claude/`, ignore old path completely
- **Documentation:** CHANGELOG mentions path change (users may need manual cleanup)
- Warning message: "Note: Old installation found at ~/Library/Application Support/Claude. Manual cleanup recommended."

### No Symlink Creation
- Phase 4 installs files to directories directly
- No symbolic links or shortcuts created
- Platforms find files in their respective directories naturally

### Cross-Platform Specifics
- Always use Node.js `fs` defaults for permissions (no explicit chmod on Unix, no ACLs on Windows)
- No special handling for shortcuts (.lnk files) on Windows
- WSL detection: Check for `/proc/version` containing "Microsoft" or `process.platform === 'linux'` + `/mnt/c/` existence

## Scope Limits

### Explicitly Out of Scope
- Migration automation from old Claude path (user manual cleanup only)
- Custom permission models (chmod/ACLs beyond Node.js defaults)
- PATH environment variable manipulation
- Shell configuration updates (.bashrc, .zshrc, etc.)
- Symlink or shortcut creation
- Administrator/sudo privilege escalation
- Path cleanup for non-GSD content (only GSD files removed)

### Deferred to Future Phases
- Message optimization (Phase 5) - clean path-related output
- Uninstall implementation (Phase 6) - removal logic with same path rules
- Testing validation (Phase 7) - cross-platform path tests

## Open Questions for Research

### Path Resolution
1. How does current `bin/lib/paths.js` implement path resolution? Can it be adapted or needs rewrite?
2. What path-related utilities exist in the codebase? `getConfigPaths()`, `replaceClaudePaths()`?
3. Are there any hardcoded paths in adapters that need updating?

### Adapter Integration
4. Do Claude/Copilot/Codex adapters in `bin/lib/adapters/` handle paths correctly?
5. What path expectations do adapters have? Do they construct paths or receive them?
6. Are there adapter-specific path quirks to preserve?

### Validation & Safety
7. What error handling exists for permission failures? Can it be reused?
8. How does current codebase handle partial installations?
9. Are there existing utilities for directory cleanup or conflict detection?

### Config Directory
10. How is `--config-dir` currently implemented in install.js?
11. Does it work correctly with the new flag system from Phase 2/3?
12. What changes are needed to support multi-platform config-dir?

### Cross-Platform Support
13. How well does current codebase work on Windows? Known issues?
14. Are there existing platform detection utilities? OS-specific logic?
15. What path normalization (if any) is currently done?

### Breaking Change Impact
16. Where are all references to `~/Library/Application Support/Claude` in codebase?
17. Are there any tests or documentation that assume old path?
18. What user-facing documentation mentions paths?

### Testing Strategy
19. What platform/OS test coverage exists currently?
20. How can path resolution be tested without real OS environments?
21. Are there integration tests that verify installation paths?

## User Experience Notes

### Conflict Prompts
When non-GSD content exists, show:
```
File conflict detected: /path/to/file
[R]eplace  [S]kip  [A]ll  [Q]uit
```

Only show conflicting file path (not diff or metadata).

### Permission Error Message
```
Error: Permission denied writing to ~/.claude/
Suggestion: Try using --local to install in current directory instead
```

### Partial State Cleanup
Silent unless issues found. If cleanup happens:
```
Detected incomplete installation. Cleaning up...
Removed 3 incomplete files from previous installation.
Continuing installation...
```

### Old Path Warning (Claude global only)
```
⚠️  Old installation detected at ~/Library/Application Support/Claude
   Manual cleanup recommended to avoid conflicts.
   New installation will use: ~/.claude/
```

Only show once per installation, not per platform.

### Platform-Specific Error Examples
- **macOS/Linux:** "Check permissions: `ls -la ~/.claude/`"
- **Windows:** "Check permissions in File Explorer properties"
- **WSL:** Treated as Linux (show Unix commands)

## Success Criteria

### Must Deliver
- [x] Claude local installs to `[repo-root]/.claude/`
- [x] Claude global installs to `~/.claude/`
- [x] Copilot local installs to `[repo-root]/.github/`
- [x] Copilot global installs to `~/.copilot/`
- [x] Codex local installs to `[repo-root]/.codex/`
- [x] Codex global shows warning and installs locally
- [x] `--config-dir` creates platform subdirectories in custom location
- [x] Path validation catches invalid characters and length limits
- [x] Permission errors show helpful suggestions
- [x] Re-installation automatically cleans up GSD content
- [x] Non-GSD content prompts for per-file confirmation
- [x] Old Claude path detected and warning shown (no auto-removal)
- [x] Cross-platform support: macOS, Linux, Windows, WSL

### Integration Points
- Phase 2 flag parser output (`platforms`, `scope`) drives path selection
- Phase 3 interactive menu output uses same path logic
- Phase 5 will optimize path-related messages (keep logic clean for reuse)
- Phase 6 uninstall will mirror path logic (design for reusability)

---

*Context captured through adaptive discussion - 2026-01-24*
