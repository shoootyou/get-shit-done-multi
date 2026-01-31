---
created: 2026-01-28T01:36
title: Fix agent installation filter to match .agent.md templates
area: installer
files:
  - bin/lib/installer/orchestrator.js:236-248
---

## Problem

The agent installation filter in orchestrator.js is looking for files ending with `.md`, but template files are named `gsd-*.agent.md`. This causes **zero agents to be installed** across all platforms.

**Bug location:** `bin/lib/installer/orchestrator.js:236`

```javascript
// Current (BROKEN):
const agents = agentFiles.filter(f => f.startsWith('gsd-') && f.endsWith('.md'));
```

**Impact:** Users installing GSD are not getting any agents, breaking the entire workflow system.

**Template structure:**
- Templates: `templates/agents/gsd-*.agent.md`
- Expected output:
  - Claude: `gsd-planner.md` (no .agent suffix)
  - Copilot: `gsd-planner.agent.md` (keep .agent suffix)
  - Codex: `gsd-planner.agent.md` (keep .agent suffix)

## Solution

Update the filter and filename transformation to:

1. **Line 236:** Match `.agent.md` template files
```javascript
const agents = agentFiles.filter(f => 
  f.startsWith('gsd-') && f.endsWith('.agent.md')
);
```

2. **Line 248:** Strip `.agent.md` and add platform-specific extension
```javascript
const baseName = agent.replace('.agent.md', '');
const targetFile = baseName + adapter.getFileExtension();
```

This allows the adapter's `getFileExtension()` method to control the output:
- `ClaudeAdapter.getFileExtension()` returns `.md`
- `CopilotAdapter.getFileExtension()` returns `.agent.md`
- `CodexAdapter.getFileExtension()` returns `.agent.md`

## Testing

```bash
# Test installation includes agents
node bin/install.js --copilot --custom-path=$HOME/test-agents
ls -1 $HOME/test-agents/agents/ | wc -l  # Should be 13+, not 0
```
