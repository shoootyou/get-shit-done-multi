---
created: 2026-01-28T02:52
title: Verify GSD-STYLE.md documents all multi-platform workflows
area: docs
files:
  - GSD-STYLE.md
  - bin/install.js
  - bin/lib/platforms/registry.js
  - bin/lib/platforms/claude-adapter.js
  - bin/lib/platforms/copilot-adapter.js
  - bin/lib/platforms/codex-adapter.js
---

## Problem

GSD now supports multi-platform installation (Claude, Copilot, Codex) via bin/install.js with:
- Platform-specific adapters that transform tools, frontmatter, and file extensions
- Interactive and non-interactive installation modes
- Global, local, and custom-path scope options
- Platform detection and auto-selection

Need to verify GSD-STYLE.md accurately documents:
1. How the multi-platform system works
2. File structure conventions for each platform (frontmatter, tools format, extensions)
3. Path references and command prefixes per platform
4. New installation workflows and options

The verification should:
- Test install.js by installing all platforms to isolated directory (/tmp or /Users/rodolfo/gsd-tests subdirectory)
- Examine actual installed file structure
- Compare with GSD-STYLE.md documentation
- Iterate with user confirmation until all discrepancies resolved

## Solution

1. Create isolated test directory
2. Run `npx ./bin/install.js --claude --copilot --codex --local --dry-run` to see what would be installed
3. Run actual installation to test directory
4. Examine installed files for each platform
5. Compare structure/format with GSD-STYLE.md sections
6. Document any gaps or inaccuracies
7. AskUser for confirmation on findings
8. Repeat until user confirms documentation is complete
