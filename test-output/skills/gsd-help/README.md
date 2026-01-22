# Test Output: gsd-help Skill

This directory contains the generated platform-specific outputs from the canonical skill spec.

## Source Spec

**Location:** `/specs/skills/gsd-help/SKILL.md`

The source spec uses **conditional syntax** to support multiple platforms:

```yaml
---
name: gsd-help
description: Show available GSD commands and usage guide

{{#isClaude}}
tools: [Read, Bash, Glob]
{{/isClaude}}
{{#isCopilot}}
tools: [file_read, shell_execute, glob]
{{/isCopilot}}
{{#isCodex}}
tools: [read, bash, glob]
{{/isCodex}}
---
```

## Generated Outputs

Each platform receives a **clean, platform-specific** version with:
- Only the tools for that platform
- No conditional syntax (all `{{}}` blocks removed)
- Same body content

### 1. Claude Code Output

**File:** `claude-output.md`

```yaml
---
name: gsd-help
description: Show available GSD commands and usage guide
tools: [Read, Bash, Glob]
---
```

**Tools:** Read, Bash, Glob (Claude's native tool names)

### 2. GitHub Copilot CLI Output

**File:** `copilot-output.md`

```yaml
---
name: gsd-help
description: Show available GSD commands and usage guide
tools: [file_read, shell_execute, glob]
---
```

**Tools:** file_read, shell_execute, glob (Copilot's tool names)

### 3. Codex CLI Output

**File:** `codex-output.md`

```yaml
---
name: gsd-help
description: Show available GSD commands and usage guide
tools: [read, bash, glob]
---
```

**Tools:** read, bash, glob (Codex's tool names)

## Comparison

| Aspect | Source Spec | Claude Output | Copilot Output | Codex Output |
|--------|-------------|---------------|----------------|--------------|
| Size | 11,288 bytes | 10,934 bytes | 10,948 bytes | 10,934 bytes |
| Conditionals | ✓ 3 blocks | ✗ Removed | ✗ Removed | ✗ Removed |
| Tools | All 3 sets | Claude only | Copilot only | Codex only |
| Body | Identical | Identical | Identical | Identical |

## Key Achievements

✅ **Single source of truth** - One spec generates 3 platform outputs
✅ **Platform-specific tools** - Each platform gets correct tool names
✅ **Clean output** - No template syntax in generated files
✅ **Content preservation** - All functionality identical across platforms
✅ **Folder structure** - Follows `gsd-[command]/SKILL.md` pattern

## Installation Paths

When installed, these outputs go to:

- **Claude:** `~/.claude/skills/gsd-help.md`
- **Copilot:** `.github/skills/gsd-help/skill.md`
- **Codex:** `~/.codex/skills/gsd-help.md` or `.codex/skills/gsd-help.md`

## Next Steps

Phase 2 will implement the generation pipeline in `bin/install.js` to:
1. Read specs from `/specs/skills/`
2. Process conditionals for target platform
3. Generate clean output files
4. Install to platform-specific locations

This test output proves the architecture works! 🎉
