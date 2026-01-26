# Phase 3 Research - Open Questions Clarification

**Date:** 2026-01-26  
**Clarifying:** Questions 1 and 2 from 03-RESEARCH.md

---

## Question 1: Command Prefix in Code Blocks

**Original Question:**
> "Command prefix in code blocks: Simple replace will transform code examples too. Requirements don't specify exclusion, so document this behavior in tests."

**User Question:** "I don't understand if you're referring to the js files, the templates, outputs or what?"

### Answer: Transformation happens in OUTPUT files (installed skills)

**What gets transformed:**

1. **Source:** `/templates/skills/gsd-new-project/SKILL.md` contains:
   ```markdown
   Run `{{COMMAND_PREFIX}}plan-phase 1` to start execution.
   
   Use {{COMMAND_PREFIX}}progress to check status.
   ```

2. **Process:** Platform adapter replaces `{{COMMAND_PREFIX}}` during installation:
   - Claude/Copilot: `/gsd-`
   - Codex: `$gsd-`

3. **Output for Claude:** `~/.claude/skills/gsd-new-project/SKILL.md` becomes:
   ```markdown
   Run `/gsd-plan-phase 1` to start execution.
   
   Use /gsd-progress to check status.
   ```

4. **Output for Codex:** `~/.codex/skills/gsd-new-project/SKILL.md` becomes:
   ```markdown
   Run `$gsd-plan-phase 1` to start execution.
   
   Use $gsd-progress to check status.
   ```

**The "problem" (not really a problem):**

The replacement is a simple string replace, so it transforms command references EVERYWHERE in the content, including:
- Regular text: `Use {{COMMAND_PREFIX}}progress` → `Use /gsd-progress` ✅
- Inline code: `` `{{COMMAND_PREFIX}}progress` `` → `` `/gsd-progress` `` ✅ (wanted)
- Code blocks:
  ```bash
  # Run this command:
  {{COMMAND_PREFIX}}new-project
  ```
  becomes:
  ```bash
  # Run this command:
  /gsd-new-project
  ```
  ✅ (also wanted)

**Conclusion:** This is actually CORRECT behavior. We WANT command prefixes transformed everywhere, including code examples. Users will copy-paste these examples, so they need the correct prefix for their platform.

**Action:** Document this in tests as expected behavior, not a pitfall.

---

## Question 2: CodexAdapter Inheritance

**Original Question:**
> "CodexAdapter inheritance: Extends CopilotAdapter since 95% identical (only command prefix differs). Trade-off between DRY and inheritance depth."

**User Question:** "What do you mean with extending copilot adapter?"

**USER DECISION (2026-01-26):** ❌ DO NOT use inheritance. Each platform gets its own complete adapter.

### Answer: ~~Use JavaScript class inheritance~~ Create separate adapters per platform (UPDATED)

**Background:**

Copilot and Codex are nearly identical:
- ✅ Both use lowercase tool names: `read`, `edit`, `execute`
- ✅ Both use same tool mappings: `Bash` → `execute`, `Grep` → `search`
- ✅ Both use `.agent.md` file extension
- ✅ Both transform frontmatter the same way
- ✅ Both use same directory structure
- ❌ **ONLY DIFFERENCE:** Command prefix (`/gsd-` vs `$gsd-`)

**Option A: Duplicate everything (BAD)**
```javascript
// bin/lib/platforms/copilot-adapter.js
export class CopilotAdapter extends PlatformAdapter {
  transformTools(tools) { /* 50 lines */ }
  transformFrontmatter(fm) { /* 30 lines */ }
  getFileExtension() { return '.agent.md'; }
  getCommandPrefix() { return '/gsd-'; }
  // ... 200 more lines
}

// bin/lib/platforms/codex-adapter.js
export class CodexAdapter extends PlatformAdapter {
  transformTools(tools) { /* 50 lines DUPLICATED */ }
  transformFrontmatter(fm) { /* 30 lines DUPLICATED */ }
  getFileExtension() { return '.agent.md'; }
  getCommandPrefix() { return '$gsd-'; } // ONLY LINE THAT DIFFERS!
  // ... 200 more lines DUPLICATED
}
```

**Option B: Extend CopilotAdapter (GOOD - RECOMMENDED)**
```javascript
// bin/lib/platforms/copilot-adapter.js
export class CopilotAdapter extends PlatformAdapter {
  transformTools(tools) { /* 50 lines */ }
  transformFrontmatter(fm) { /* 30 lines */ }
  getFileExtension() { return '.agent.md'; }
  getCommandPrefix() { return '/gsd-'; }
  // ... 200 lines
}

// bin/lib/platforms/codex-adapter.js
import { CopilotAdapter } from './copilot-adapter.js';

export class CodexAdapter extends CopilotAdapter {
  // Inherit everything from CopilotAdapter
  // Override ONLY what differs:
  getCommandPrefix() {
    return '$gsd-'; // Codex uses $ instead of /
  }
  // That's it! 5 lines total.
}
```

**How it works:**

When installer calls `codexAdapter.transformTools(tools)`:
1. CodexAdapter doesn't have transformTools method
2. JavaScript looks up inheritance chain
3. Finds transformTools in CopilotAdapter (parent)
4. Uses CopilotAdapter's implementation
5. ✅ Same behavior, zero duplication

When installer calls `codexAdapter.getCommandPrefix()`:
1. CodexAdapter DOES have getCommandPrefix method
2. Uses CodexAdapter's version (returns `$gsd-`)
3. ✅ Overridden behavior

**Inheritance chain:**
```
PlatformAdapter (base)
    ↑
    |
CopilotAdapter
    ↑
    |
CodexAdapter (inherits 95%, overrides 5%)
```

**Pros:**
- ✅ DRY (Don't Repeat Yourself): 5 lines instead of 200
- ✅ Single source of truth: Fix bug in tool mapping, both platforms get fix
- ✅ Easy to maintain: Changes to Copilot logic automatically apply to Codex

**Cons:**
- ⚠️ Inheritance coupling: If Copilot adapter changes, Codex affected
- ⚠️ Inheritance depth: 2 levels deep (not too bad, but not flat either)

**~~Decision:~~ ❌ REJECTED - Use Option B (extend CopilotAdapter)**

**✅ ACTUAL DECISION (User override):** Use Option A (separate adapters) because:
1. **Platform isolation** is more important than DRY
2. If Copilot CLI changes, only CopilotAdapter should be affected
3. If Codex CLI changes, only CodexAdapter should be affected
4. Code duplication is acceptable and preferred over coupling
5. Easier to maintain: clear boundaries, no inheritance surprises

**ARCHITECTURAL RULE (added to REQUIREMENTS.md):**
- Each platform MUST have its own complete adapter
- NO inheritance between platform adapters
- Changes to one platform should NOT affect others
- Code duplication between adapters is ACCEPTABLE and PREFERRED

**Implementation:**
```javascript
// bin/lib/platforms/copilot-adapter.js
export class CopilotAdapter extends PlatformAdapter {
  transformTools(tools) { /* 50 lines */ }
  transformFrontmatter(fm) { /* 30 lines */ }
  getFileExtension() { return '.agent.md'; }
  getCommandPrefix() { return '/gsd-'; }
  // ... 200 lines - COMPLETE implementation
}

// bin/lib/platforms/codex-adapter.js
export class CodexAdapter extends PlatformAdapter {
  transformTools(tools) { /* 50 lines DUPLICATED */ }
  transformFrontmatter(fm) { /* 30 lines DUPLICATED */ }
  getFileExtension() { return '.agent.md'; }
  getCommandPrefix() { return '$gsd-'; } // ONLY difference
  // ... 200 lines DUPLICATED - ISOLATED implementation
}
```

**Rationale:** Platform specifications can diverge over time. Keeping adapters isolated makes the codebase more maintainable and predictable.

---

## Question 3: Binary Detection Timeout

**User Response:** "Is OK and continue with the recommendation"

**Confirmed:** Use 2-second timeout on `exec()` calls when detecting CLI binaries (`copilot`, `claude`, `codex`) to prevent hanging if command doesn't exist.

**Implementation:**
```javascript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function detectBinary(binaryName) {
  try {
    await execAsync(`which ${binaryName}`, { timeout: 2000 }); // 2 second timeout
    return true;
  } catch {
    return false;
  }
}
```

---

## Summary

**Question 1 (Command prefixes):** ✅ CLARIFIED
- Transformation happens in OUTPUT files during installation
- Templates contain `{{COMMAND_PREFIX}}`, outputs contain `/gsd-` or `$gsd-`
- Transformation happens everywhere (text, inline code, code blocks) - this is CORRECT
- Document as expected behavior in tests

**Question 2 (CodexAdapter inheritance):** ✅ CLARIFIED ➜ ❌ REJECTED ➜ ✅ UPDATED
- ~~JavaScript class inheritance: `class CodexAdapter extends CopilotAdapter`~~
- **USER DECISION:** Each platform gets its own complete adapter (NO inheritance)
- CodexAdapter and CopilotAdapter are SEPARATE implementations
- Code duplication between adapters is ACCEPTABLE and PREFERRED
- Platform isolation over DRY principle
- **ARCHITECTURAL RULE added to REQUIREMENTS.md (PLATFORM-02)**

**Question 3 (Binary timeout):** ✅ CONFIRMED
- Use 2-second timeout on exec() for binary detection
- Prevents hanging if binary doesn't exist

---

**Ready for Planning:** All clarifications complete, proceed with Phase 3 planning.
