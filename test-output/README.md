# Test Outputs

This directory contains generated outputs for testing the skills spec transformation pipeline.

## Structure

```
test-output/
├── claude/
│   ├── agents/           # Agent specs (existing)
│   └── skills/           # Skill specs (Phase 2)
│       └── gsd-help/
│           └── SKILL.md
├── copilot/
│   ├── agents/           # Agent specs (existing)
│   └── skills/           # Skill specs (Phase 2)
│       └── gsd-help/
│           └── SKILL.md
├── codex/
│   └── skills/           # Skill specs (Phase 2)
│       └── gsd-help/
│           └── SKILL.md
└── install-test/         # Integration test outputs from install.js
    ├── claude/skills/gsd-help/SKILL.md
    ├── copilot/skills/gsd-help/SKILL.md
    └── codex/skills/gsd-help/SKILL.md
```

**Structure:** Each skill gets its own directory with `SKILL.md` inside (per [Claude documentation](https://code.claude.com/docs/en/slash-commands#automatic-discovery-from-nested-directories)).

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
3. Extracts platform-specific tool declarations (if present)
4. Generates clean output files (no template syntax)
5. Writes to `test-output/[platform]/skills/[skill-name]/SKILL.md`

**Note:** Skills are generated with folder structure (`gsd-help/SKILL.md`), not flat files, following Claude's automatic discovery spec.

## Current Test Case: gsd-help

**Source:** `specs/skills/gsd-help/SKILL.md` (10,993 bytes)

**Outputs:**
- `claude/skills/gsd-help/SKILL.md` (10,908 bytes) - No tools (reference only)
- `copilot/skills/gsd-help/SKILL.md` (10,908 bytes) - No tools (reference only)
- `codex/skills/gsd-help/SKILL.md` (10,908 bytes) - No tools (reference only)

**Key Points:**
- gsd-help is a reference command with no execution permissions needed
- Original gsd:help has no `allowed-tools` field
- Follows principle of least privilege (skills declare tools explicitly)

## Verification

```bash
# Verify folder structure
ls -la test-output/claude/skills/gsd-help/
ls -la test-output/copilot/skills/gsd-help/
ls -la test-output/codex/skills/gsd-help/

# Compare outputs (should be identical for reference commands)
diff test-output/claude/skills/gsd-help/SKILL.md \
     test-output/copilot/skills/gsd-help/SKILL.md

# Check no tools in frontmatter
head -5 test-output/claude/skills/gsd-help/SKILL.md
```

## Integration with Phase 2

Phase 2 implemented this in `bin/install.js`:
- ✅ Function: `generateSkillsFromSpecs(specsDir, outputDir, platform)`
- ✅ Generates folder structure: `{skill-name}/SKILL.md`
- ✅ Integration: Called during `installClaude()`, `installCopilot()`, `installCodex()`
- ✅ Validation: `test-output/install-test/` shows actual install.js outputs

This test script validates architecture independently of install.js for faster iteration.
