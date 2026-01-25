# Phase 5.1 Discussion Context

**Date:** 2026-01-25  
**Phase:** 5.1 - Codebase Architecture Optimization  
**Participants:** User decisions gathered via gsd-discuss-phase

---

## Decisions Made

### 1. File Organization Strategy ✅

**Decision:** **By feature/domain organization**

**Rationale:** Organize code by business domain/feature rather than technical layers.

**Top-level structure under `bin/lib/`:**
```
bin/lib/
├── platforms/        # Claude, Copilot, Codex adapters + future (GPT-4All, Mistral, Gemini)
├── installation/     # Install flow logic, validation, file operations
├── configuration/    # Flags, paths, menu, routing
├── templating/       # Generators for skills, agents, docs
└── testing/          # Shared test utilities, mocks, fixtures
```

**Benefits:**
- Clear domain boundaries
- Easy to find code related to a feature
- Extensible for new platforms (add to `platforms/`)
- Supports future AI tool integrations naturally

**Constraints:**
- Shared utilities go in appropriate domain (e.g., path utils in `configuration/`)
- Cross-cutting concerns need clear home (e.g., `testing/` for test utils)

---

### 2. File Elimination Criteria ✅

**Decision:** **Strict audit - Remove anything not directly supporting current features**

**Criteria for removal:**
- ❌ Not imported/required by any active code
- ❌ Not called/used in current feature set
- ❌ Experimental or legacy code not in use
- ❌ Duplicates existing functionality

**Criteria for keeping:**
- ✅ Directly supports current installation features
- ✅ Required by install.js or its dependencies
- ✅ Part of active test suite
- ✅ Configuration files in use

**Process:**
1. Map dependency tree from `install.js`
2. Identify all files NOT in dependency tree
3. Remove immediately (no staging area)
4. Document each removal in detailed report with:
   - File path
   - Why it was removed
   - References cleaned (imports, requires, tests)

**Safety net:**
- Git history preserves everything
- Detailed removal report for audit trail
- No temporary archive folder needed

**Aggressive stance:** If unclear whether file is used, default to **REMOVE** (can restore from git if needed).

---

### 3. Test Location & Convention ✅

**Decision:** **Split by type - Integration in `__tests__/`, Unit in `bin/`**

**Structure:**
```
__tests__/                    # Integration tests (full workflows)
├── installation/
│   ├── install-claude.test.js
│   ├── install-multi-platform.test.js
│   └── install-interactive-menu.test.js
└── configuration/
    └── flag-combinations.test.js

bin/lib/
├── platforms/
│   ├── claude.js
│   ├── claude.test.js        # Unit test (colocated)
│   ├── copilot.js
│   └── copilot.test.js
├── configuration/
│   ├── flags.js
│   └── flags.test.js
└── ...
```

**Naming convention:** `*.test.js` (simple, standard)

**Rules:**
- **Unit tests:** Colocated with code in `bin/lib/` (test single module)
- **Integration tests:** Centralized in `__tests__/` (test full workflows)
- Same naming pattern for both: `*.test.js`
- Jest config updated to include both locations

**Benefits:**
- Clear separation of concerns
- Unit tests close to implementation (easy to maintain)
- Integration tests together (see full system behavior)
- Standard naming = no confusion

**Jest config changes needed:**
```javascript
testMatch: [
  '**/__tests__/**/*.test.js',  // Integration tests
  '**/bin/**/*.test.js'          // Unit tests
]
```

---

### 4. Dependency Update Strategy ✅

**Decision:** **Aggressive - Update everything possible, fix breaking changes as needed**

**Approach:**
1. Update ALL dependencies to latest stable versions
2. Run tests after each update
3. If breaking changes occur: fix them immediately
4. Document any dependencies that CANNOT be updated with detailed justification

**Process:**
- Use `npm outdated` to identify updates
- Update one dependency at a time (or related groups)
- Run full test suite after each update
- Fix breaking changes before moving to next
- Document incompatibilities in report

**Justification required for NOT updating:**
- Dependency A requires Node 18+, project uses Node 14
- Dependency B v3.0 incompatible with Dependency C (explain why C can't also update)
- Dependency D has breaking changes that affect core architecture (explain why)

**Success criteria:**
- All "safe" updates applied
- Breaking changes fixed and tested
- Detailed table in report:
  - Package name
  - Old version
  - New version
  - Breaking changes encountered (if any)
  - Resolution/fix applied

**If something CANNOT be updated:**
- Document in separate table
- Explain technical reason
- Identify blocker dependency
- Propose future resolution path

**Risk acceptance:** User accepts risk of breaking changes for benefit of modern, secure dependencies.

---

## Constraints & Guidelines

### Must-Have Outcomes

1. **Structure:** Feature/domain organization with 5 top-level folders
2. **Cleanup:** Aggressive file removal (strict audit)
3. **Tests:** Split by type (integration vs unit) with `*.test.js` naming
4. **Dependencies:** Latest versions with breaking changes fixed
5. **Documentation:** Detailed report covering all changes

### Testing Requirements

All tests MUST run in `/tmp` temporary directories:
- ✅ Create isolated environments: `/tmp/gsd-test-*/`
- ✅ Simulate `.claude/`, `.copilot/`, `.codex/` in `/tmp`
- ❌ NEVER touch real project config directories

### Non-Negotiables

- `install.js` stays as main entry point
- All existing functionality must work (no regressions)
- SOLID principles applied throughout
- Prepare for future platforms (GPT-4All, Mistral, Gemini)

---

## Open Questions (None)

All major decision areas have been addressed. Proceed to planning phase.

---

## Next Steps

With these decisions locked in, the planning phase can now:

1. Design exact folder structure under `bin/lib/`
2. Create file mapping (old location → new location)
3. Identify files for removal (dependency analysis)
4. Plan dependency update order
5. Design test migration strategy
6. Create detailed work breakdown

**Ready for:** `gsd-plan-phase 5.1`

---

## Summary Table

| Area | Decision | Impact |
|------|----------|--------|
| Organization | Feature/domain (5 folders) | Clear boundaries, extensible |
| File removal | Strict audit | Aggressive cleanup, lean codebase |
| Tests | Split by type (integration/unit) | Clear separation, colocated units |
| Dependencies | Aggressive updates | Modern versions, fix breaking changes |

**Overall philosophy:** Bold restructuring with aggressive cleanup to create clean, modern, extensible foundation.
