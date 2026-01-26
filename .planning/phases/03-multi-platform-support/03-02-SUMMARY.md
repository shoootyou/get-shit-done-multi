---
phase: 03-multi-platform-support
plan: 02
subsystem: multi-platform
tags: [adapters, platform-abstraction, claude, copilot, codex, registry]
requires: [03-01]
provides:
  - ClaudeAdapter: transformTools (capitalized), transformFrontmatter (no metadata), .md extension, /gsd- prefix
  - CopilotAdapter: transformTools (lowercase array with mappings), transformFrontmatter (with metadata), .agent.md extension, /gsd- prefix
  - CodexAdapter: transformTools (lowercase array, same as Copilot), transformFrontmatter (with metadata, platform='codex'), $gsd- prefix
  - AdapterRegistry: All three adapters registered, getSupportedPlatforms() returns ['claude', 'copilot', 'codex']
affects: [03-03, 04-01]
tech-stack:
  added: []
  patterns:
    - Platform adapter pattern with isolated implementations (no cross-inheritance)
    - Registry singleton pattern with auto-initialization
    - Tool name mapping strategy (Claude names → platform-specific aliases)
key-files:
  created:
    - bin/lib/platforms/claude-adapter.js
    - bin/lib/platforms/copilot-adapter.js
    - bin/lib/platforms/codex-adapter.js
  modified:
    - bin/lib/platforms/registry.js
decisions:
  - id: ADAPTER-01
    choice: ClaudeAdapter extends ONLY PlatformAdapter
    rationale: Base adapter defines contract, Claude implements with capitalized tools and no metadata
  - id: ADAPTER-02
    choice: CopilotAdapter extends ONLY PlatformAdapter
    rationale: Implements lowercase array tools with mappings (Read→read, Bash→execute) and metadata block
  - id: ADAPTER-03
    choice: CodexAdapter extends ONLY PlatformAdapter (NOT CopilotAdapter)
    rationale: 95% identical to Copilot but isolated per PLATFORM-02 architectural rule. Code duplication intentional.
  - id: ADAPTER-04
    choice: Codex uses $gsd- prefix instead of /gsd-
    rationale: Only difference from Copilot adapter, distinguishes Codex command invocation
  - id: ADAPTER-05
    choice: Tool mappings duplicated in Copilot and Codex adapters
    rationale: Platform isolation over DRY principle per ARCHITECTURE-DECISION.md
  - id: ADAPTER-06
    choice: Registry auto-initializes adapters on construction
    rationale: Simple singleton pattern, all adapters available immediately on import
metrics:
  duration: 281 seconds (4 minutes 41 seconds)
  completed: 2026-01-26
---

# Phase 3 Plan 02: Concrete Platform Adapters Summary

**One-liner:** Three isolated platform adapters (Claude, Copilot, Codex) with tool name mappings, frontmatter transformations, and registry auto-initialization

## What We Built

Created complete platform adapter implementations for Claude, Copilot, and Codex:

### ClaudeAdapter (bin/lib/platforms/claude-adapter.js)
- **Extends:** PlatformAdapter base class
- **Tools transformation:** Keeps capitalized comma-separated format (no transformation needed)
- **Frontmatter:** Minimal - only name, description, tools (no metadata block)
- **File extension:** `.md`
- **Command prefix:** `/gsd-`
- **Target directories:** `~/.claude` (global), `.claude` (local)

### CopilotAdapter (bin/lib/platforms/copilot-adapter.js)
- **Extends:** PlatformAdapter base class
- **Tools transformation:** Converts to lowercase array with mappings
  - Read → read
  - Write → edit
  - Bash → execute
  - Grep → search
  - Task → agent
- **Frontmatter:** Includes metadata block (platform, generated, templateVersion, projectVersion, projectName)
- **File extension:** `.agent.md`
- **Command prefix:** `/gsd-`
- **Target directories:** `~/.copilot` (global), `.github` (local)

### CodexAdapter (bin/lib/platforms/codex-adapter.js)
- **Extends:** PlatformAdapter base class (NOT CopilotAdapter)
- **Tools transformation:** DUPLICATED from Copilot (same lowercase array with mappings)
- **Frontmatter:** DUPLICATED from Copilot with `platform: 'codex'`
- **File extension:** `.agent.md`
- **Command prefix:** `$gsd-` (DIFFERENT from Copilot's `/gsd-`)
- **Target directories:** `~/.codex` (global), `.codex` (local)
- **Architectural note:** 95% identical to Copilot but isolated implementation per PLATFORM-02

### Registry Integration (bin/lib/platforms/registry.js)
- **Added imports:** ClaudeAdapter, CopilotAdapter, CodexAdapter
- **Added _initialize() method:** Registers all three adapters on construction
- **Registration:** `claude`, `copilot`, `codex` all registered in singleton
- **getSupportedPlatforms():** Returns `['claude', 'copilot', 'codex']`

## Technical Details

### Adapter Interface Implementation
Each adapter implements 6 methods from PlatformAdapter:
1. `getFileExtension()` - Returns platform-specific file extension
2. `getTargetDir(isGlobal)` - Returns installation directory path
3. `getCommandPrefix()` - Returns command prefix for skill invocation
4. `getPathReference()` - Returns path reference prefix for documentation
5. `transformTools(tools)` - Transforms tools from template format to platform format
6. `transformFrontmatter(data)` - Transforms frontmatter object for platform

### Tool Mappings (Copilot & Codex)
```javascript
this.toolMappings = {
  'Read': 'read',
  'Write': 'edit',
  'Edit': 'edit',
  'Bash': 'execute',
  'Grep': 'search',
  'Glob': 'search',
  'Task': 'agent'
};
```

### Platform Isolation Architecture
- **Rule:** Each adapter extends ONLY PlatformAdapter
- **No inheritance between concrete adapters:** CodexAdapter does NOT extend CopilotAdapter
- **Code duplication is intentional:** Copilot and Codex have nearly identical implementations
- **Rationale:** Platform isolation over DRY principle (per ARCHITECTURE-DECISION.md and PLATFORM-02)
- **Benefit:** Platform-specific changes don't affect other platforms

## Verification Results

All verification checks passed:

✅ Three adapter files created: claude-adapter.js, copilot-adapter.js, codex-adapter.js  
✅ Each adapter extends ONLY PlatformAdapter (no cross-inheritance)  
✅ ClaudeAdapter: transformTools() keeps capitalized, no metadata in frontmatter  
✅ CopilotAdapter: transformTools() returns lowercase array, includes metadata  
✅ CodexAdapter: transformTools() returns lowercase array, includes metadata  
✅ Codex getCommandPrefix() returns `$gsd-` (not `/gsd-`)  
✅ Claude and Copilot getCommandPrefix() return `/gsd-`  
✅ AdapterRegistry contains all three adapters  
✅ getSupportedPlatforms() returns `['claude', 'copilot', 'codex']`  
✅ Tool mappings work correctly: Bash→execute, Read→read, Write→edit

### Test Output Examples

**Tool Transformations:**
```
Input: Read, Write, Bash
Claude output: Read, Write, Bash (unchanged)
Copilot output: ["read","edit","execute"]
Codex output: ["read","edit","execute"]
```

**Command Prefixes:**
```
Claude prefix: /gsd-
Copilot prefix: /gsd-
Codex prefix: $gsd-
```

**Adapter Isolation:**
```
ClaudeAdapter parent: PlatformAdapter
CopilotAdapter parent: PlatformAdapter
CodexAdapter parent: PlatformAdapter
✓ All extend PlatformAdapter directly
```

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **ClaudeAdapter isolation (ADAPTER-01)**
   - Each adapter extends base class independently
   - Claude keeps template format unchanged (capitalized tools)
   - No metadata block needed for Claude

2. **CopilotAdapter tool mappings (ADAPTER-02)**
   - Implemented complete tool mapping dictionary
   - Converts comma-separated string to lowercase array
   - Adds metadata block with platform identification

3. **CodexAdapter isolation vs inheritance (ADAPTER-03)**
   - Chose to duplicate code from CopilotAdapter instead of inheritance
   - Per PLATFORM-02 architectural rule: platform isolation over DRY
   - Enables independent evolution of platforms

4. **Codex command prefix differentiation (ADAPTER-04)**
   - `$gsd-` for Codex vs `/gsd-` for Claude/Copilot
   - Only behavioral difference between Codex and Copilot adapters
   - Distinguishes command invocation syntax

5. **Tool mapping duplication (ADAPTER-05)**
   - Duplicated mapping dictionary in both Copilot and Codex
   - Could have been extracted to shared module
   - Chose duplication for platform isolation

6. **Registry auto-initialization (ADAPTER-06)**
   - Adapters registered on AdapterRegistry construction
   - Simple singleton pattern with _initialize() method
   - All adapters available immediately on registry import

## Files Changed

### Created (3 files)
- `bin/lib/platforms/claude-adapter.js` - 72 lines, Claude platform adapter
- `bin/lib/platforms/copilot-adapter.js` - 95 lines, Copilot platform adapter with tool mappings
- `bin/lib/platforms/codex-adapter.js` - 105 lines, Codex platform adapter (isolated, 95% duplicate of Copilot)

### Modified (1 file)
- `bin/lib/platforms/registry.js` - Added imports, _initialize() method, adapter registration

## Commits

1. `6a95ab2` - feat(03-02): add ClaudeAdapter for Claude Code platform
2. `588304b` - feat(03-02): add CopilotAdapter for GitHub Copilot CLI platform
3. `1a080d3` - feat(03-02): add CodexAdapter for Codex CLI platform
4. `7f73769` - feat(03-02): register all three platform adapters in registry

## Integration Points

### Upstream Dependencies (Wave 1 - Plan 03-01)
- **PlatformAdapter base class:** Defines 6 abstract methods that each adapter implements
- **AdapterRegistry singleton:** Provides Map storage and lookup methods

### Downstream Impact (Wave 3)
- **Plan 03-03 (Orchestrator Integration):** Will use `adapterRegistry.get(platform)` for adapter lookup
- **Plan 04-01 (Interactive UX):** Will use `getSupportedPlatforms()` for platform selection menu
- **Future plans:** All platform-specific transformations now handled by adapters

## Next Phase Readiness

### What's Ready
✅ Three complete platform adapters with all 6 methods implemented  
✅ Tool transformation logic (capitalized, lowercase array, mappings)  
✅ Frontmatter transformation logic (with/without metadata)  
✅ Command prefix differentiation (/, $)  
✅ Registry populated with all adapters  
✅ Platform isolation maintained (no cross-inheritance)

### What's Blocked
None - all dependencies resolved

### What's Next
- **Plan 03-03:** Orchestrator integration - Use adapters during installation
- **Plan 04-01:** Interactive UX - Use getSupportedPlatforms() for menu
- **Future:** Add more platforms by creating new isolated adapters

## Lessons Learned

1. **Platform isolation is powerful:** Having separate adapters with no inheritance makes platform-specific changes safe
2. **Code duplication can be intentional:** CodexAdapter duplicates 95% of CopilotAdapter code, but this is architecturally correct
3. **Tool mappings are platform-specific:** Claude uses capitalized names, Copilot/Codex use lowercase aliases
4. **Registry pattern simplifies lookup:** Single import gives access to all platforms
5. **Base class as contract:** PlatformAdapter defines interface without forcing inheritance between implementations

## Risk Assessment

**Current Risks:**
- None identified

**Mitigated Risks:**
- ✅ Cross-platform coupling (mitigated by isolation rule)
- ✅ Tool name confusion (mitigated by explicit mappings)
- ✅ Registry initialization order (mitigated by singleton pattern)

**Future Considerations:**
- Adding new platforms requires creating new isolated adapter (straightforward)
- Tool mapping updates need to be applied to both Copilot and Codex (intentional)
- Metadata structure should remain consistent across platforms

## Quality Metrics

- **Code coverage:** All 6 adapter methods implemented for each platform (100%)
- **Test verification:** All verification checks passed (10/10)
- **Architecture compliance:** Platform isolation rule enforced (PLATFORM-02)
- **Documentation:** All methods have JSDoc comments
- **Commit atomicity:** 4 atomic commits (1 per task)

## Performance Metrics

- **Duration:** 281 seconds (4 minutes 41 seconds)
- **Tasks completed:** 4/4 (100%)
- **Files created:** 3 adapter files
- **Files modified:** 1 registry file
- **Lines added:** ~270 lines (72 + 95 + 105 for adapters, ~15 for registry updates)

---

**Plan Status:** ✅ COMPLETE  
**Phase 3 Progress:** 2/3 plans complete (67%)  
**Next Plan:** 03-03 - Orchestrator Integration
