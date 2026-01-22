# Test Outputs

This directory contains generated outputs for testing the skills spec transformation pipeline.

## Structure

```
test-output/
├── claude/
│   ├── agents/     # Agent specs (existing)
│   └── skills/     # Skill specs (Phase 1)
│       └── gsd-help.md
├── copilot/
│   ├── agents/     # Agent specs (existing)
│   └── skills/     # Skill specs (Phase 1)
│       └── gsd-help.md
└── codex/
    └── skills/     # Skill specs (Phase 1)
        └── gsd-help.md
```

## Generation Script

**Location:** `scripts/generate-skill-outputs.js`

### Usage

```bash
# Generate single skill
node scripts/generate-skill-outputs.js gsd-help

# Generate all skills
node scripts/generate-skill-outputs.js --all
```

### What it does

1. Reads canonical spec from `specs/skills/[skill-name]/SKILL.md`
2. Processes conditional blocks (`{{#isClaude}}`, `{{#isCopilot}}`, `{{#isCodex}}`)
3. Extracts platform-specific tool declarations
4. Generates clean output files (no template syntax)
5. Writes to `test-output/[platform]/skills/[skill-name].md`

## Current Test Case: gsd-help

**Source:** `specs/skills/gsd-help/SKILL.md` (11,288 bytes)

**Outputs:**
- `claude/skills/gsd-help.md` (10,934 bytes) - tools: [Read, Bash, Glob]
- `copilot/skills/gsd-help.md` (10,948 bytes) - tools: [file_read, shell_execute, glob]
- `codex/skills/gsd-help.md` (10,934 bytes) - tools: [read, bash, glob]

## Verification

```bash
# Compare outputs
diff test-output/claude/skills/gsd-help.md \
     test-output/copilot/skills/gsd-help.md

# Should show only tools declaration differs
```

## Integration with Phase 2

Phase 2 will implement this same logic in `bin/install.js`:
- Function: `generateSkillsFromSpecs(specsDir, outputDir, platform)`
- Reuse: Same conditional processing logic
- Integration: Called during `installClaude()`, `installCopilot()`, `installCodex()`

This test output validates the architecture before full implementation.
