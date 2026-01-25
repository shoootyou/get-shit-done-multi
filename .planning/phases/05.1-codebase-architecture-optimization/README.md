# Phase 5.1: Codebase Architecture Optimization

**Status:** Not Started  
**Type:** INSERTED (Critical - MUST happen FIRST before any new features)  
**Depends on:** Phase 5 (Message Optimization)  
**Timeline:** 4-5 days

⚠️ **CRITICAL PATH BOTTLENECK** - This is the longest single phase and blocks all downstream work

## Goal

Restructure `bin/` and `lib-ghcc/` following SOLID principles, eliminate low-value files, modernize dependencies, and prepare architecture for future AI tool integrations (GPT-4All, Mistral, Gemini).

## Why Inserted Now - CRITICAL REASONING

**This MUST happen FIRST (before Phase 5.2 Codex Global) because:**

1. **Avoid refactoring new code:** If we implement Codex global first, then restructure, we have to refactor the Codex code we just wrote
2. **Clean foundation for all features:** All new features (Codex global, Uninstall) should be built on clean architecture
3. **Single refactoring pass:** Restructure once, then build new features on that foundation
4. **Future-proofing done once:** Prepare for GPT-4All/Mistral/Gemini in the architecture itself

**This is the same reasoning you used for doing architecture before Uninstall - but taken one step further.**

## Requirements

### ARCH-OPT-01: File Value Audit
- Evaluate every file in `bin/` and `lib-ghcc/` for value
- Files that add value: restructure and keep
- Files with no value: remove and clean all references

### ARCH-OPT-02: Restructure `bin/` Organization
- Organize by function: tool/scope/phase
- Minimize files in root `/bin/` directory
- Create logical subdirectories under `/bin/lib/`
- Move `doc-generator` to `/bin/lib`

### ARCH-OPT-03: SOLID Principles
- Single Responsibility Principle: One purpose per module
- Open/Closed: Extensible for new platforms (GPT-4All, Mistral, Gemini)
- Clear interfaces between modules
- Dependency injection where appropriate

### ARCH-OPT-04: Test Unification
- Decide: `__tests__/` OR `bin/` for tests (pick one)
- Move all tests to chosen location
- Update test configurations
- Single, clear convention

### ARCH-OPT-05: Coverage Directory
- Evaluate `coverage/` directory value
- If no value: remove or add to `.gitignore`
- If value: document purpose and keep

### ARCH-OPT-06: Dependency Modernization
- Update all libraries to latest compatible versions
- Document any that can't be updated with detailed justification
- Test after each update
- No breaking changes without explicit decision

### ARCH-OPT-07: Keep install.js Central
- `install.js` remains main entry point
- Processes live in organized modules
- Clear orchestration pattern

### ARCH-OPT-08: Detailed Report (DELIVERABLE)
- Before/after structure comparison
- Files removed with justification
- Files moved/renamed with mapping
- Library updates table
- Test results showing no regressions
- Architecture diagram

## Success Criteria

- [ ] `bin/` and `lib-ghcc/` restructured with clear organization
- [ ] All files evaluated - low-value files removed
- [ ] Code follows SOLID principles
- [ ] Test structure unified (single convention)
- [ ] `coverage/` evaluated and cleaned
- [ ] All dependencies updated (or justification documented)
- [ ] `doc-generator` moved to `/bin/lib`
- [ ] `install.js` remains central orchestrator
- [ ] Architecture prepared for GPT-4All/Mistral/Gemini
- [ ] All existing functionality works (no regressions)
- [ ] Detailed report delivered
- [ ] All tests run in `/tmp` (never real config directories)

## Testing Requirements

**MANDATORY:** All tests execute in temporary directories

- Every test creates isolated environment in `/tmp/gsd-test-*`
- Never use actual `.claude/`, `.copilot/`, `.codex/` directories
- Test all parameter combinations after restructuring
- Validate no regressions: `node bin/install.js` with all flags in `/tmp`

## Implementation Phases

### Phase 1: Audit & Planning (Day 1)
1. List all files in `bin/` and `lib-ghcc/`
2. Categorize by: tool, scope, phase, value
3. Identify duplicated logic
4. Design target structure
5. Document files to remove/move/consolidate

### Phase 2: Restructuring (Days 2-3)
1. Create new directory structure under `/bin/lib/`
2. Move files to organized locations
3. Update all imports and references
4. Consolidate duplicated logic
5. Move `doc-generator` to `/bin/lib`

### Phase 3: Test Unification (Day 3)
1. Decide on test convention
2. Move all tests to chosen location
3. Update Jest configuration
4. Clean up `coverage/` directory

### Phase 4: Dependency Modernization (Day 4)
1. Audit `package.json` dependencies
2. Update to latest compatible versions
3. Test after each update
4. Document any that can't be updated

### Phase 5: Documentation & Validation (Day 5)
1. Create detailed report
2. Run comprehensive test suite
3. Validate all flag combinations
4. Architecture diagram
5. Sign-off checklist

## Target Structure Example

```
bin/
├── install.js              # Main entry point (orchestrator)
├── uninstall.js            # Uninstall entry point (to be added Phase 6)
└── lib/
    ├── core/               # Core utilities
    │   ├── paths.js
    │   ├── file-ops.js
    │   └── reporter.js
    ├── flags/              # Flag system
    │   ├── parser.js
    │   ├── validator.js
    │   └── router.js
    ├── platforms/          # Platform adapters
    │   ├── claude.js
    │   ├── copilot.js
    │   ├── codex.js
    │   └── base-adapter.js # Shared adapter logic
    ├── menu/               # Interactive menu
    │   └── prompts.js
    ├── generators/         # Content generation
    │   ├── doc-generator/  # Moved from root
    │   ├── skill-generator.js
    │   └── agent-generator.js
    └── validation/         # Install validation
        └── verify.js
```

## Architecture Principles

1. **Modularity:** Clear boundaries between concerns
2. **Extensibility:** Easy to add new AI platforms
3. **Single Responsibility:** Each module does one thing
4. **Testability:** All modules can be tested in isolation
5. **Clarity:** Directory names reflect purpose
6. **Minimal Root:** Keep root directories clean

## Future Integration Preparation

Structure must easily accommodate:
- **GPT-4All:** Local AI model platform
- **Mistral:** Alternative AI platform
- **Gemini:** Google AI platform
- Any future AI tool platforms

Design patterns:
- Platform adapter interface (base class/protocol)
- Platform registry for dynamic discovery
- Unified configuration format
- Path resolution for arbitrary platforms

## Deliverable: Detailed Report

The report MUST include:

### 1. Structure Changes
- Before/after directory tree
- File movement mapping table
- New directories created with purpose

### 2. Files Removed
- Complete list of removed files
- Justification for each removal
- References cleaned (imports, requires, tests)

### 3. Files Consolidated
- Which files were merged
- Why consolidation made sense
- New consolidated file locations

### 4. Library Updates
| Package | Old Version | New Version | Reason | Notes |
|---------|-------------|-------------|--------|-------|
| example | 1.0.0 | 2.0.0 | Security fix | Breaking change handled |

### 5. Libraries NOT Updated
| Package | Current | Latest | Reason Not Updated |
|---------|---------|--------|-------------------|
| example | 1.0.0 | 3.0.0 | Incompatible with Node 14 |

### 6. Test Results
- All tests passing
- Coverage maintained/improved
- All flag combinations validated
- Performance impact (if any)

### 7. Architecture Diagram
- Visual representation of new structure
- Module relationships
- Extension points for future platforms

### 8. Sign-off Checklist
- [ ] All files evaluated
- [ ] Structure follows SOLID principles
- [ ] Tests unified and passing
- [ ] Dependencies modernized
- [ ] No regressions detected
- [ ] Documentation updated
- [ ] Ready for Phase 6 (Uninstall)

## Files to Create/Modify

**Will be determined during audit phase**

Expected major changes:
- Restructure entire `bin/lib/` directory
- Move `doc-generator` to `/bin/lib/generators/`
- Update all `require()` statements
- Consolidate duplicated logic
- Update test files and Jest config
- Possibly remove `lib-ghcc/` entirely if redundant

## Risks

- **HIGH:** Extensive refactoring could introduce regressions
- **MEDIUM:** Breaking existing integrations if not careful with imports
- **MEDIUM:** Timeline could slip if structure more chaotic than expected

**Mitigation:**
- Comprehensive test suite before and after
- Incremental changes with validation
- Git branches for safety
- Test every flag combination after restructuring

## Next Phase

After completion, proceed to Phase 5.2 (Codex Global Support) - now implementing on clean, organized architecture.
