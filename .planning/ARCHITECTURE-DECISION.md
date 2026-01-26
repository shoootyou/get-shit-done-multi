# Architecture Decision Record

**Date:** 2026-01-26  
**Decision:** Platform Adapter Isolation Over DRY  
**Status:** ✅ APPROVED

---

## Context

Phase 3 introduces multi-platform support (Claude, Copilot, Codex) using the Adapter pattern. Initial research suggested using inheritance (`CodexAdapter extends CopilotAdapter`) since Copilot and Codex are 95% identical (only command prefix differs).

## Decision

**Each platform MUST have its own complete adapter implementation.**

- NO inheritance between platform adapters (ClaudeAdapter, CopilotAdapter, CodexAdapter)
- Each adapter extends only the base `PlatformAdapter` class
- Code duplication between adapters is ACCEPTABLE and PREFERRED over coupling
- Changes to one platform should NOT affect others

## Rationale

### 1. Platform Isolation
If Copilot CLI specifications change, only `CopilotAdapter` should be affected. CodexAdapter should remain untouched.

### 2. Maintainability
Clear boundaries make the codebase more predictable. No inheritance surprises or unexpected side effects.

### 3. Debugging Simplicity
When debugging Codex issues, developers only need to look at `codex-adapter.js`, not trace through parent classes.

### 4. Future-Proofing
Platform specifications may diverge over time. Starting with isolated adapters prevents future refactoring pain.

### 5. Code Duplication is Acceptable
200 lines of duplicated code across 3 files is a reasonable trade-off for isolation and maintainability.

## Consequences

### Positive
- ✅ Platform isolation: Changes confined to single file
- ✅ Clear boundaries: Each adapter is self-contained
- ✅ Easier debugging: No inheritance chain to trace
- ✅ Easier testing: Mock/stub single adapter, not parent classes
- ✅ Future-proof: Platform divergence won't require refactoring

### Negative
- ⚠️ Code duplication: ~200 lines duplicated across 3 adapters
- ⚠️ Consistency burden: Tool mappings must be manually kept in sync
- ⚠️ More files to update: Bug fixes may need changes in multiple adapters

## Implementation

### Adapter Structure
```
PlatformAdapter (base)
    ↑
    ├─ ClaudeAdapter (complete implementation)
    ├─ CopilotAdapter (complete implementation)
    └─ CodexAdapter (complete implementation)
```

### Example: Tool Transformation

**ClaudeAdapter:**
```javascript
transformTools(tools) {
  // Keep capitalized: "Read, Write, Bash"
  return tools;
}
```

**CopilotAdapter:**
```javascript
transformTools(tools) {
  // Lowercase with mappings: Bash → execute
  const toolMappings = {
    'Read': 'read', 'Bash': 'execute', ...
  };
  return applyMappings(tools, toolMappings);
}
```

**CodexAdapter:**
```javascript
transformTools(tools) {
  // DUPLICATED from CopilotAdapter (intentional)
  const toolMappings = {
    'Read': 'read', 'Bash': 'execute', ...
  };
  return applyMappings(tools, toolMappings);
}
```

## Related Requirements

- **PLATFORM-02:** Platform adapter interface (contains architectural rule)
- **PLATFORM-03:** Claude Code adapter
- **PLATFORM-04:** GitHub Copilot adapter
- **PLATFORM-04B:** Codex CLI adapter (notes NO inheritance)

## References

- `.planning/REQUIREMENTS.md` — PLATFORM-02 contains the rule
- `.planning/phases/03-multi-platform-support/03-RESEARCH.md` — Updated with no-inheritance pattern
- `.planning/phases/03-multi-platform-support/03-RESEARCH-CLARIFICATIONS.md` — User decision documented

---

**Approved by:** User (2026-01-26)  
**Documented by:** Phase 3 Research  
**Next Action:** Phase 3 planning will implement this architecture
