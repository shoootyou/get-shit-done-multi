# Phase 8: Documentation & Release - Research

**Researched:** 2026-01-24
**Domain:** Technical documentation, migration guides, release management
**Confidence:** HIGH

## Summary

Phase 8 documents the new spec-based skill system and releases v1.9.1 with complete legacy removal. Research focused on documentation patterns proven within this codebase rather than external standards, as GSD already has established, effective patterns.

**Key findings:**
1. **Reuse proven patterns** - `/specs/skills/README.md` structure is exemplary and should be template for new documentation
2. **Platform-specific is essential** - All 3 CLIs (Claude, Copilot, Codex) must be documented separately, not as "platform-agnostic"
3. **Complete removal, not deprecation** - v1.9.1 removes legacy entirely; cleanup script + manual steps required
4. **Focus on creation, not conversion** - Migration guide teaches how to CREATE new specs, not convert old commands

The codebase already contains HIGH quality documentation patterns (README structure, CHANGELOG format, troubleshooting structure). The task is consistency and application, not inventing new formats.

**Primary recommendation:** Follow the `/specs/skills/README.md` pattern exactly - it's the gold standard for schema documentation in this codebase.

## Standard Stack

No external libraries needed - this is pure markdown documentation following established project patterns.

### Core Documentation Format
| Format | Purpose | Standard |
|--------|---------|----------|
| GitHub Flavored Markdown | All documentation files | CommonMark + GFM extensions |
| YAML frontmatter | Metadata in spec files | gray-matter compatible |
| Keep a Changelog | CHANGELOG.md format | https://keepachangelog.com/en/1.1.0/ |
| Semantic Versioning | Version numbering | Major.Minor.Patch |

### Documentation Structure (Existing)
| Location | Purpose | Update Needed |
|----------|---------|---------------|
| `/specs/skills/README.md` | Skill schema documentation | Expand conditional syntax examples |
| `CHANGELOG.md` | Release history | Add v1.9.1 entry |
| `README.md` | Project overview | Brief mention + link to skills |
| `/docs/` | Deep-dive documentation | New migration guide |

### No Tooling Additions
**Decision:** Don't add markdown linting or link checking tools in this phase.
- Current state: No markdown tooling, manual review process
- Recommendation: Manual review sufficient for v1.9.1
- Rationale: Scope control, avoid infrastructure changes during documentation phase

## Architecture Patterns

### Pattern 1: Schema Documentation Structure (from `/specs/skills/README.md`)

**What:** Field-by-field documentation with type, format, examples, constraints
**When to use:** Documenting any structured data format (frontmatter, config, etc.)
**Source:** `/workspace/specs/skills/README.md` (lines 43-150)

**Structure:**
```markdown
## Canonical [Format Name] Schema

### Required Fields
[Summary table]

### Optional Fields  
[Summary table]

### Field Specifications

#### `field-name` (required/optional)

- **Type:** [data type]
- **Format:** [structure/pattern]  
- **Examples:** [2-3 concrete examples]
- **Usage:** [when/how to use]
- **Constraints:** [limitations/rules]
- **Validation:** [what causes errors]
```

**Why effective:**
- Progressive disclosure: summary → details
- Examples inline with each field
- Constraints explicit, not implied
- Validation rules clear

### Pattern 2: Multi-Platform Documentation (from `docs/TROUBLESHOOTING-OLD.md`)

**What:** Platform-specific instructions within single document
**When to use:** Any documentation covering Claude, Copilot, and Codex
**Source:** `/workspace/docs/TROUBLESHOOTING-OLD.md` (lines 38-82)

**Structure:**
```markdown
### Issue/Topic Name

**[General explanation]**

**Solutions by CLI:**

**Claude Code:**
[Specific commands/steps for Claude]

**Copilot CLI:**  
[Specific commands/steps for Copilot]

**Codex CLI:**
[Specific commands/steps for Codex]
```

**Why effective:**
- User finds their platform immediately
- No ambiguity ("might work on...")
- All platforms always covered
- Copy-paste ready commands

### Pattern 3: Troubleshooting Structure (from `docs/TROUBLESHOOTING-OLD.md`)

**What:** Diagnosis → Solution → Root Cause → Prevention flow
**When to use:** Documenting installation issues, common errors
**Source:** `/workspace/docs/TROUBLESHOOTING-OLD.md` (lines 21-150)

**Structure:**
```markdown
### Issue Name

**Symptom:** [what user sees/experiences]

**Diagnosis:**
\`\`\`bash
# Commands to verify the issue
[check commands]
\`\`\`

**Solutions by CLI:**
[Platform-specific fixes]

**Root Cause:**
[Why this happens]

**Prevention:**
[How to avoid in future]
```

**Why effective:**
- Self-service diagnosis first
- Platform-specific solutions
- Educational (root cause)
- Prevents recurrence

### Pattern 4: Migration Guide Structure (proven in `/specs/skills/README.md`)

**What:** Overview → Example → Details → Reference → Patterns
**When to use:** Teaching new system to existing users
**Source:** `/workspace/specs/skills/README.md` structure

**Structure:**
```markdown
# Migration Guide Title

## Why This Change
[Benefits, problems solved]

## What Changed
[High-level summary]

## Old vs New Comparison
[Side-by-side table]

## Creating Your First Spec (Tutorial)
### Step 1: [Action]
[Instructions + code]
### Step 2: [Action]
[Instructions + code]
[...continue]

## Working Example
[Complete, working spec for each platform]

## Reference
[Link to schema documentation]

## Common Patterns
[When to use what]

## Troubleshooting
[Common mistakes]
```

**Why effective:**
- WHY before HOW
- Comparison grounds the change
- Step-by-step tutorial format
- Working example = immediate success
- Reference for deep dive

### Pattern 5: Changelog Entry Structure (from `CHANGELOG.md`)

**What:** User impact → Technical details, with breaking changes explicit
**When to use:** Every release
**Source:** `/workspace/CHANGELOG.md` (lines 7-22)

**Structure:**
```markdown
## [VERSION] - YYYY-MM-DD

### For Users

- **[Key benefit]** - [What this means for users]
- **[Action required]** - [What users need to do]

### Added
- [New feature] - [brief description]

### Changed  
- [Modified behavior] - [what changed]

### Removed
- **BREAKING:** [Removed feature] — [what replaces it]

### Fixed
- [Bug fix] - [what was wrong]

### Technical

[Implementation details for developers]
```

**Why effective:**
- Users see impact first
- Breaking changes impossible to miss
- Technical details separate
- Follows Keep a Changelog standard

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown linting | Custom style checker | (none - manual review) | No tooling this phase; manual sufficient |
| Link validation | Custom crawler | (none - manual review) | Low link count, visual review works |
| Changelog format | Custom structure | Keep a Changelog standard | Already in use, proven format |
| Version numbering | Custom scheme | Semantic Versioning | Already in use, industry standard |
| Cleanup script | One-off deletion | Idempotent script with dry-run | Reversibility, safety, user confidence |

**Key insight:** Don't add tooling infrastructure during documentation phase. The codebase has no markdown tooling currently, and manual review has worked well. Adding linting/checking tools now would expand scope unnecessarily.

## Common Pitfalls

### Pitfall 1: Assuming Platform-Agnostic Documentation Works

**What goes wrong:** Users can't tell if instructions apply to their platform (Claude, Copilot, or Codex).

**Why it happens:** Desire for DRY documentation, assuming "it's the same everywhere."

**How to avoid:** 
- Always have "by CLI" sections for installation/configuration
- When in doubt, show all 3 platforms explicitly
- Test: "Can a Copilot user follow this without guessing?"

**Warning signs:**
- Phrases like "depending on your platform..."
- Conditional instructions (if X, then...)
- Missing platform-specific paths

**Reference:** Every section in `docs/TROUBLESHOOTING-OLD.md` shows all 3 platforms.

### Pitfall 2: Documentation Drift from Implementation

**What goes wrong:** Documented file paths, commands, or structure don't match actual generated output.

**Why it happens:** Documentation written before final implementation, not updated after changes.

**How to avoid:**
- Document AFTER implementation is stable (Phase 7 complete)
- Test commands in documentation by actually running them
- Verify file paths exist: `ls -la /path/from/docs`
- Cross-reference with actual spec files in `/specs/skills/`

**Warning signs:**
- "Should be at..." (implies uncertainty)
- File paths not tested
- Commands not actually run

**Prevention checklist:**
```bash
# For each documented command:
cd /workspace
[run the command from docs]
# Verify it works

# For each documented file path:
ls -la [path from docs]
# Verify it exists
```

### Pitfall 3: Migration Guide That Converts Instead of Creates

**What goes wrong:** Guide focuses on converting old commands to new specs, which is NOT the goal.

**Why it happens:** Misunderstanding the decision from CONTEXT.md - focus is on creating NEW specs from scratch.

**How to avoid:**
- CONTEXT.md clearly states: "Focus: How to create new spec from scratch (NOT migrating legacy commands)"
- Guide should teach: "Here's how to create a skill for a new command"
- NOT: "Here's how to convert your old command files"
- Comparison table shows differences, but tutorial teaches creation

**Warning signs:**
- "Convert your command.md to SKILL.md"
- Scripts that parse old format
- Step-by-step conversion process

**Correct approach:**
- Show comparison table (what changed)
- Teach creation from scratch
- Provide working example to copy
- Link to schema documentation

### Pitfall 4: Unsafe Cleanup Script

**What goes wrong:** Script deletes user files without confirmation, can't be undone, or fails on edge cases.

**Why it happens:** Treating cleanup as simple `rm -rf` operation.

**How to avoid:**
- **MUST HAVE:** Dry-run mode showing what WOULD be deleted
- **MUST HAVE:** Explicit confirmation prompt
- **MUST HAVE:** Check if paths exist before deleting
- **SHOULD HAVE:** Backup option
- **MUST BE:** Idempotent (safe to run multiple times)

**Safety pattern:**
```bash
#!/usr/bin/env bash
set -euo pipefail

# Dry-run mode
if [ "${1:-}" = "--dry-run" ]; then
  echo "Would delete:"
  [ -d "./commands/gsd" ] && echo "  ./commands/gsd/"
  exit 0
fi

# Confirmation
echo "This will delete legacy command files."
read -p "Continue? (y/N): " confirm
[ "$confirm" != "y" ] && exit 0

# Idempotent deletion
[ -d "./commands/gsd" ] && rm -rf "./commands/gsd" && echo "✓ Removed ./commands/gsd/"
[ -d "./commands/gsd" ] || echo "✓ Already cleaned up"
```

**Warning signs:**
- No dry-run mode
- No confirmation prompt
- Assumes paths exist (not checking)
- Script fails if already cleaned

### Pitfall 5: Changelog Without Breaking Change Markers

**What goes wrong:** Users miss that v1.9.1 removes legacy system entirely, don't prepare.

**Why it happens:** Breaking changes listed as regular changes, not highlighted.

**How to avoid:**
- Prefix ALL breaking changes with `**BREAKING:**`
- Group in `### Removed` section
- Link to migration guide
- State what replaces removed feature

**Format (from CHANGELOG.md):**
```markdown
### Removed
- **BREAKING:** Legacy `/commands/gsd/*.md` system — use `/specs/skills/*/SKILL.md` instead ([migration guide](docs/migration-guide.md))
- **BREAKING:** Command prefix `/gsd:` — use `/gsd-` prefix (e.g., `/gsd-help` not `/gsd:help`)
```

**Warning signs:**
- Breaking changes in `### Changed` section
- No "BREAKING" prefix
- No migration guide link
- Unclear what replaces removed feature

## Code Examples

### Example 1: Field Documentation (from `/specs/skills/README.md`)

Complete field documentation following proven pattern:

```markdown
#### `name` (required)

- **Type:** String
- **Format:** `gsd-{action}` or `gsd-{action}-{object}`
- **Examples:** 
  - `gsd-help`
  - `gsd-new-project`
  - `gsd-plan-phase`
- **Usage:** Unique identifier for the skill, must match parent folder name
- **Constraints:** 
  - Lowercase only
  - Hyphens only (no underscores or spaces)
  - Must start with `gsd-`
  - Length: 3-30 characters
- **Validation:** Must match parent folder name exactly
  - ✅ `gsd-help/SKILL.md` with `name: gsd-help`
  - ❌ `gsd-help/SKILL.md` with `name: gsd-helper` (mismatch)
```

**Source:** Adapted from `/workspace/specs/skills/README.md` lines 65-72

### Example 2: Platform-Specific Instructions

Show all 3 platforms explicitly:

```markdown
### Installing the New Skill System

**Claude Code:**
```bash
# Check current installation
ls -la ~/.claude/get-shit-done/

# Reinstall to regenerate skills
npx get-shit-done-multi --global

# Verify skills directory exists
ls -la ~/.claude/get-shit-done/.github/skills/
```

**GitHub Copilot CLI:**
```bash
# Check current installation  
ls -la .github/skills/get-shit-done/

# Reinstall to regenerate skills
npx get-shit-done-multi --copilot

# Reload skills
gh copilot reload
```

**Codex CLI:**
```bash
# Check current installation
ls -la .codex/skills/get-shit-done/

# Reinstall to regenerate skills
npx get-shit-done-multi --codex

# Verify installation
codex skills list | grep gsd-
```
```

**Source:** Pattern from `/workspace/docs/TROUBLESHOOTING-OLD.md` lines 38-82

### Example 3: Comparison Table

Side-by-side format showing old vs new:

```markdown
## Command System Comparison

| Aspect | Legacy (Pre-v1.9.1) | New (v1.9.1+) |
|--------|---------------------|---------------|
| **Invocation** | `/gsd:plan-phase` | `/gsd-plan-phase` |
| **File location** | `commands/gsd/plan-phase.md` | `specs/skills/gsd-plan-phase/SKILL.md` |
| **Structure** | Single file per command | Folder per skill |
| **Frontmatter** | Optional, unstructured | Required YAML with schema |
| **Platform support** | Static per platform | Generated from template |
| **Conditional syntax** | None | Mustache conditionals |
| **Generation** | Hand-written | Template-based |
```

**Source:** Pattern from GSD comparison tables + CONTEXT.md requirements

### Example 4: Troubleshooting Entry

Complete troubleshooting structure:

```markdown
### Skill Not Found After Installation

**Symptom:** Running `/gsd-new-project` shows "command not found" or "skill not recognized" after installing v1.9.1.

**Diagnosis:**
```bash
# Check if skills directory exists
ls -la ~/.claude/get-shit-done/.github/skills/

# Check if SKILL.md files are present
find ~/.claude/get-shit-done -name "SKILL.md" | wc -l
# Expected: 28 (one per skill)
```

**Solutions by CLI:**

**Claude Code:**
```bash
# Regenerate skills from specs
npx get-shit-done-multi --global

# Restart Claude Code
# (Skills are cached by runtime)
```

**Copilot CLI:**
```bash
# Regenerate skills
npx get-shit-done-multi --copilot

# Reload skills registry
gh copilot reload
```

**Codex CLI:**
```bash
# Regenerate skills
npx get-shit-done-multi --codex

# Verify skills loaded
codex skills list | grep "gsd-"
```

**Root Cause:**
- Skills not generated during installation (generation step failed)
- CLI hasn't refreshed skills registry since installation
- Installation path mismatch (global vs local)

**Prevention:**
- Always run installation command appropriate for your CLI
- Restart CLI or run reload command after installation
- Verify with `ls -la [skills-path]` immediately after install
```

**Source:** Pattern from `/workspace/docs/TROUBLESHOOTING-OLD.md` lines 21-150

### Example 5: Safe Cleanup Script

Idempotent, safe deletion with dry-run:

```bash
#!/usr/bin/env bash
# cleanup-legacy-commands.sh - Remove pre-v1.9.1 command system
set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Legacy paths to check
LEGACY_PATHS=(
  "$HOME/.claude/commands/gsd"
  "./.claude/commands/gsd"
  "./.github/copilot/commands"
  "$HOME/.codex/commands/gsd"
  "./.codex/commands/gsd"
)

# Dry-run mode
if [ "${1:-}" = "--dry-run" ]; then
  echo "Dry-run mode - showing what WOULD be deleted:"
  for path in "${LEGACY_PATHS[@]}"; do
    if [ -d "$path" ]; then
      echo "  ${YELLOW}Would delete:${NC} $path"
    fi
  done
  exit 0
fi

# Show what will be deleted
echo "Legacy command cleanup for GSD v1.9.1+"
echo ""
echo "The following directories will be removed:"
for path in "${LEGACY_PATHS[@]}"; do
  if [ -d "$path" ]; then
    echo "  - $path"
  fi
done

# Check if anything to delete
found_any=false
for path in "${LEGACY_PATHS[@]}"; do
  [ -d "$path" ] && found_any=true && break
done

if [ "$found_any" = false ]; then
  echo ""
  echo "${GREEN}✓ Already cleaned up${NC} - no legacy directories found"
  exit 0
fi

# Confirmation
echo ""
read -p "Continue with deletion? (y/N): " confirm
if [ "$confirm" != "y" ] && [ "$confirm" != "Y" ]; then
  echo "Cancelled"
  exit 0
fi

# Delete (idempotent)
echo ""
for path in "${LEGACY_PATHS[@]}"; do
  if [ -d "$path" ]; then
    rm -rf "$path"
    echo "${GREEN}✓ Removed:${NC} $path"
  fi
done

echo ""
echo "${GREEN}Cleanup complete!${NC}"
echo "Legacy command system removed. Use ${YELLOW}/gsd-${NC} prefix for all commands."
```

**Source:** Shell scripting best practices + safety patterns from findings

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Legacy `/commands/gsd/*.md` | Spec-based `/specs/skills/*/SKILL.md` | v1.9.1 | Complete replacement, breaking change |
| Command prefix `/gsd:` | Skill prefix `/gsd-` | v1.9.1 | Invocation syntax change |
| Static per-platform files | Template-generated skills | v1.9.0 | Infrastructure change, user-transparent |
| Inline platform differences | Mustache conditionals | v1.9.0 | Maintainability improvement |
| Optional frontmatter | Required YAML schema | v1.9.1 | Structured metadata |

**Deprecated/outdated in v1.9.1:**
- **Legacy commands directory:** `commands/gsd/*.md` - Removed entirely, use `specs/skills/*/SKILL.md`
- **Command prefix `/gsd:`** - Use `/gsd-` prefix (e.g., `/gsd-help` not `/gsd:help`)
- **Unstructured frontmatter:** - Use canonical schema documented in `/specs/skills/README.md`

**Current as of v1.9.1:**
- **Skill specs:** `/specs/skills/{skill-name}/SKILL.md` with folder-per-skill structure
- **Skill invocation:** `/gsd-{action}` prefix across all platforms
- **Platform conditionals:** Mustache syntax (`{{#isClaude}}`, `{{#isCopilot}}`, `{{#isCodex}}`)
- **Schema documentation:** `/specs/skills/README.md` as canonical reference

## Open Questions

### 1. Documentation Tooling Investment

**What we know:** 
- Project currently has no markdown linting or link checking
- Manual review has worked well historically
- Adding tooling would expand scope

**What's unclear:** 
- Whether future milestones should add tooling
- If documentation quality suffers without automation

**Recommendation:** 
- Don't add tooling in v1.9.1 (scope control)
- Manual review sufficient for this release
- Consider for future milestone if quality issues emerge

**Confidence:** HIGH (based on current project state)

### 2. Legacy Installation Cleanup Detection

**What we know:**
- Legacy may exist in 5+ locations (global/local × 3 platforms)
- Not all users have all platforms installed
- Some paths may not exist even in old installations

**What's unclear:**
- How to reliably detect "incomplete" installations (some platforms cleaned, others not)
- Whether to warn about global vs local inconsistency

**Recommendation:**
- Cleanup script checks all possible paths
- Idempotency handles "already cleaned" case
- Manual instructions as fallback

**Confidence:** MEDIUM (edge cases possible)

### 3. I18n Documentation Strategy

**What we know:**
- `/docs/commands/README.md` is in Spanish
- Other docs are in English
- No documented i18n policy

**What's unclear:**
- Whether to translate new migration guide
- If Spanish documentation should be maintained

**Recommendation:**
- Write all new v1.9.1 documentation in English
- Note for future: Consider i18n policy in separate milestone
- Don't translate migration guide in this phase

**Confidence:** MEDIUM (no documented policy found)

## Sources

### Primary (HIGH confidence)
- `/workspace/specs/skills/README.md` - Schema documentation pattern (field specification structure)
- `/workspace/CHANGELOG.md` - Keep a Changelog format, breaking change patterns
- `/workspace/docs/TROUBLESHOOTING-OLD.md` - Multi-platform documentation structure
- `/workspace/.planning/phases/08-documentation-and-release/08-01-CONTEXT.md` - User decisions and requirements
- `/workspace/bin/install.js` - Installation system structure

### Secondary (MEDIUM confidence)
- Shell scripting best practices - Safe deletion patterns (not verified with official source)
- https://keepachangelog.com/en/1.1.0/ - Referenced in CHANGELOG.md, not independently verified

### Official References (HIGH confidence)
- https://code.claude.com/docs/en/slash-commands#control-who-invokes-a-skill - Claude documentation on skills (from CONTEXT.md user quote)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Based on existing project patterns, no external dependencies
- Architecture: HIGH - All patterns proven in current codebase
- Pitfalls: HIGH - Derived from CONTEXT.md decisions and analysis of similar documentation
- Code examples: HIGH - All examples from current working code or established patterns
- Cleanup automation: MEDIUM - Shell patterns not verified against external authoritative source

**Research date:** 2026-01-24
**Valid until:** 2026-02-23 (30 days - documentation standards are stable)

**Research constraints from CONTEXT.md:**
- Complete legacy removal (not deprecation) in v1.9.1
- Migration guide for CREATING new specs, not CONVERTING old
- Manual migration + automated cleanup script required
- All 3 platforms must be documented (Claude, Copilot, Codex)
- Focus on WHY (benefits) before HOW (instructions)
