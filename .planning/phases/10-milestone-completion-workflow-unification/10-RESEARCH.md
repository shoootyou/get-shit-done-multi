# Phase 10: Milestone Completion Workflow Unification - Research

**Researched:** 2026-01-31
**Domain:** GSD workflow refactoring (internal codebase patterns)
**Confidence:** HIGH

## Summary

Researched existing GSD skill patterns, workflow structures, and milestone management commands to unify the completion workflow. The current system has three separate commands (complete-milestone, archive-milestone, restore-milestone) with overlapping functionality. User decisions specify moving directly to history/ with ask_user confirmations and deprecating redundant commands.

The standard approach in GSD is:
- SKILL.md files with YAML frontmatter defining metadata and XML-structured process steps
- Workflow files (.md) in templates/get-shit-done/workflows/ for reusable procedures
- Git identity preservation via helper functions for all commits
- Stage banners (━━━━ GSD ► STAGE NAME ━━━━) for major transitions
- Filesystem moves using atomic `mv` commands with git tracking

**Primary recommendation:** Consolidate into single /gsd-complete-milestone command that archives directly to history/v{X.Y}/ mirroring .planning/ structure, use AskUserQuestion tool for all confirmations, and modify deprecated commands to show branded blocking messages.

## AI-First Development Philosophy

**Critical principle:** This project is oriented toward writing skills for other AI agents. Skills should be written primarily in natural language (Markdown) with clear instructions, not code.

### When to Use Scripts vs Natural Language

**Prefer natural language instructions (HIGH freedom):**
- File operations (mv, mkdir, git commands) - AI can execute bash directly
- Text manipulation (sed, grep, awk) - AI can compose these
- Workflow orchestration - AI follows procedural steps
- User interactions (AskUserQuestion) - AI tool, not script
- Git operations with identity helpers - Source and call bash functions

**Scripts are last resort (require user justification):**
- Complex algorithms that AI repeatedly gets wrong
- Performance-critical operations (large file processing)
- Deterministic reliability requirements (data transformations)
- Operations AI has no tools for

**For Phase 10:** All tasks can be accomplished with natural language instructions + bash commands. No scripts needed.

## Standard Stack

The established tools/patterns for GSD skill development:

### Core
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Bash | Native | File operations, git commands | Atomic filesystem operations, no external dependencies |
| Git | Native | Versioning, identity preservation | Built into workflow, user identity helpers available |
| Markdown | N/A | Documentation format | All planning artifacts use .md |
| XML | N/A | Skill structure | Semantic tags for process steps, conditions |

### Supporting
| Pattern | Purpose | When to Use |
|---------|---------|-------------|
| git-identity-helpers.sh | Preserve user identity in commits | Every git commit from skill |
| ui-brand.md patterns | Consistent UI/banners | User-facing output |
| AskUserQuestion | User confirmations | Any decision gate |
| SKILL.md YAML frontmatter | Skill metadata | Every skill definition |

### GSD File Structure (Template Variables)

**Note:** When working with templates under `/templates/`, use `{{PLATFORM_ROOT}}` variable which gets replaced during installation with the actual platform directory (`.github`, `.claude`, or `.codex`).

```
{{PLATFORM_ROOT}}/                      # Replaced with .github, .claude, or .codex
├── skills/
│   └── gsd-{name}/
│       └── SKILL.md                    # Skill definition
└── get-shit-done/
    ├── workflows/
    │   └── {workflow}.md               # Reusable workflows
    ├── references/
    │   ├── ui-brand.md                 # UI patterns
    │   └── git-integration.md          # Git conventions
    └── templates/
        └── {template}.md               # File templates

.planning/
├── PROJECT.md, ROADMAP.md, etc.        # Active milestone
├── phases/                              # All phases (cumulative)
├── research/                            # Current milestone research
├── todos/                               # Todo system
└── history/                             # Archived milestones
    └── v{X.Y}/                         # Mirrored .planning/ structure
        ├── PROJECT.md
        ├── ROADMAP.md
        ├── STATE.md
        ├── REQUIREMENTS.md
        ├── phases/                      # Phase subset
        ├── research/                    # Research subset
        └── todos/                       # Todos subset
```

**Template variables:**
- `{{PLATFORM_ROOT}}` - Platform directory (.github, .claude, or .codex)
- `{{COMMAND_PREFIX}}` - Command prefix (e.g., /gsd-, gsd-, $gsd-)

**Installation:** N/A (internal refactoring)

## Architecture Patterns

### Recommended Skill Structure (SKILL.md)

```markdown
---
name: gsd-command-name
description: Brief one-liner
allowed-tools: Read, Edit, Bash, Task
argument-hint: '[optional-arg]'
---

<objective>
What this skill does and why it exists.
Purpose: [reason]
Output: [what gets created/modified]
</objective>

<execution_context>
Files to load (uses @-references):
@path/to/workflow.md
@path/to/reference.md
</execution_context>

<context>
Files to check or variables to receive:
- User input: {{arg_name}}
- Required files: .planning/FILE.md
</context>

<process>
<step name="descriptive_name">
What this step does.

```bash
# Example commands
```

**If condition:** Action to take
**Otherwise:** Alternative action
</step>

<step name="next_step">
...
</step>
</process>

<success_criteria>
- [ ] Checklist of completion requirements
- [ ] File created/modified
- [ ] User knows next steps
</success_criteria>
```

### Pattern 1: Atomic File Operations

**What:** Use `mv` for file moves (atomic at filesystem level), git for tracking
**When to use:** Archiving, moving files between directories
**Example:**
```bash
# Create destination first
mkdir -p .planning/history/v1.0/phases

# Move atomically (appears instantly at destination or not at all)
mv .planning/phases .planning/history/v1.0/
mv .planning/ROADMAP.md .planning/history/v1.0/

# Handle optional files (don't fail if missing)
mv .planning/research .planning/history/v1.0/ 2>/dev/null || true

# Git tracks the move
git add .planning/history/v1.0/
git add -u .planning/  # Stages deletions
```

**Why atomic:** If interrupted, git status shows exactly what moved. No partial states.

### Pattern 2: User Confirmations with AskUserQuestion

**What:** Use AskUserQuestion tool (provided by Claude Desktop) for all user decisions
**When to use:** Any decision gate, confirmation, or choice between options

**Example (Simple confirmation):**
```markdown
<step name="confirm_archive">
Use AskUserQuestion:
- header: "Archive Milestone"
- question: "Archive v1.0 to history? This will move all planning files."
- options:
  - "Archive now" — Proceed with archival
  - "Cancel" — Exit without changes

If "Cancel": Exit with message.
If "Archive now": Continue to move_files step.
</step>
```

**Example (Multi-question workflow preferences):**
```markdown
<!-- Source: templates/skills/gsd-new-project/SKILL.md - Phase 5: Workflow Preferences -->
<step name="workflow_preferences">
Ask all workflow preferences in a single AskUserQuestion call (3 questions):

```
questions: [
  {
    header: "Mode",
    question: "How do you want to work?",
    multiSelect: false,
    options: [
      { label: "YOLO (Recommended)", description: "Auto-approve, just execute" },
      { label: "Interactive", description: "Confirm at each step" }
    ]
  },
  {
    header: "Depth",
    question: "How thorough should planning be?",
    multiSelect: false,
    options: [
      { label: "Quick", description: "Ship fast (3-5 phases, 1-3 plans each)" },
      { label: "Standard", description: "Balanced scope and speed (5-8 phases, 3-5 plans each)" },
      { label: "Comprehensive", description: "Thorough coverage (8-12 phases, 5-10 plans each)" }
    ]
  },
  {
    header: "Execution",
    question: "Run plans in parallel?",
    multiSelect: false,
    options: [
      { label: "Parallel (Recommended)", description: "Independent plans run simultaneously" },
      { label: "Sequential", description: "One plan at a time" }
    ]
  }
]
```

Create `.planning/config.json` with chosen mode, depth, and parallelization.
</step>
```

**Why:** Consistent UI, explicit choice tracking, avoids manual text prompts. Supports both single and multi-question patterns.

### Pattern 3: Git Identity Preservation

**What:** Source helper functions, use commit_as_user for all commits
**When to use:** Every git commit from a skill
**Example:**
```bash
# Source helpers (idempotent check)
if ! type commit_as_user >/dev/null 2>&1; then
    source {{PLATFORM_ROOT}}/get-shit-done/workflows/git-identity-helpers.sh
fi

# Stage files
git add .planning/history/v1.0/
git add .planning/MILESTONES.md

# Commit with user identity (not agent name)
commit_as_user "milestone: archive v1.0 to history

Moved to long-term storage.
Files preserved: ROADMAP, STATE, PROJECT, phases/, research/"
```

**Note:** In templates, use `{{PLATFORM_ROOT}}` variable which gets replaced with `.github`, `.claude`, or `.codex` during installation.

**Why:** Preserves user as commit author, not Claude agent name.

### Pattern 4: Stage Banners for Major Transitions

**What:** Use branded banner format from ui-brand.md for major workflow stages
**When to use:** Start of major phase, completion messages, error states
**Example:**
```markdown
Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► MILESTONE COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**v1.0 MVP** — 4 phases shipped
Files archived to: .planning/history/v1.0/
Git tag: v1.0
```
```

**Stage name patterns:**
- Major actions: `GSD ► {ACTION NAME}` (uppercase)
- Completions: `GSD ► {STAGE} COMPLETE ✓`
- Errors: `GSD ► ERROR` or `GSD ► BLOCKED`
- Deprecation: `GSD ► DEPRECATED`

### Pattern 5: Deprecation Blocking

**What:** Show deprecation message and exit immediately (don't allow execution)
**When to use:** Commands being sunset in favor of unified workflow
**Example:**
```markdown
<objective>
DEPRECATED: This command has been replaced by /gsd-complete-milestone.
</objective>

<process>
<step name="show_deprecation">
Display blocking message:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► DEPRECATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This command has been replaced.

**Old workflow:**
/gsd-complete-milestone → /gsd-archive-milestone → /gsd-restore-milestone

**New workflow (unified):**
/gsd-complete-milestone — archives directly to history/v{X.Y}/

Archives are permanent (git-tracked). No restore needed.
To review: `ls .planning/history/`

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Exit immediately (do not execute).
</step>
</process>
```

**Why:** Clear communication, prevents confused workflow, maintains brand consistency.

### Anti-Patterns to Avoid

- **Manual text prompts:** Don't use "Type 'yes' to continue" — use AskUserQuestion
- **Non-atomic operations:** Don't use `cp` then `rm` — use `mv` for atomicity
- **Missing git identity:** Don't use `git commit -m` directly — use commit_as_user
- **Partial moves:** Don't move files individually in separate steps — batch moves reduce failure surface
- **Silent failures:** Don't use `|| true` without good reason — make optional files explicit

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Git commits from agent | Custom git config per-commit | git-identity-helpers.sh functions | Already handles config hierarchy, validation, env vars |
| User confirmations | Manual text parsing | AskUserQuestion tool | Consistent UI, explicit tracking, options enumeration |
| Stage banners | Custom ASCII art | ui-brand.md patterns | Brand consistency, established width/format |
| Directory structure mirroring | Custom recursion | mv entire directories + mkdir parents | Filesystem handles recursion atomically |
| File existence checks | Complex conditionals | `2>/dev/null \|\| true` pattern | Established pattern for optional files |
| File operations | Python/JS scripts | Bash commands in SKILL.md | AI executes bash directly, no script needed |
| Text processing | Custom scripts | sed/grep/awk in bash | AI composes these, readable by other AIs |

**Key insight:** GSD skills are written for AI consumption. Use natural language instructions + bash commands (which AI can read and execute) rather than opaque scripts.

### Skill-Creator Standard (templates/skills/skill-creator)

**Core principle:** Skills should be concise, AI-readable instructions. Default assumption: Claude is already very smart.

**Skill structure:**
```
skill-name/
├── SKILL.md (required)
│   ├── YAML frontmatter (name, description)
│   └── Markdown instructions
└── Bundled Resources (optional - last resort)
    ├── scripts/          - Only when AI repeatedly fails
    ├── references/       - Documentation loaded as needed
    └── assets/           - Templates, not documentation
```

**Progressive disclosure:**
1. Metadata (name + description) - Always in context (~100 words)
2. SKILL.md body - When skill triggers (<5k words, prefer <500 lines)
3. Bundled resources - As needed by Claude

**When to use scripts:**
- Same code rewritten repeatedly (token inefficient)
- Deterministic reliability needed (complex algorithms)
- NOT for simple bash operations AI can execute directly

**For Phase 10:** All skills being modified follow this standard. Use natural language instructions in SKILL.md, reference workflows from templates/get-shit-done/workflows/, no new scripts needed.

## Common Pitfalls

### Pitfall 1: Forgetting Git Identity Helpers

**What goes wrong:** Commits show "Claude" or agent name as author instead of user
**Why it happens:** Direct `git commit` uses platform default identity
**How to avoid:** 
- Always source git-identity-helpers.sh at start of git operations
- Use commit_as_user for every commit
- Check idempotently: `if ! type commit_as_user >/dev/null 2>&1`

**Warning signs:** 
- Using `git commit -m` directly
- Not sourcing helper functions before commits

### Pitfall 2: Manual Text Prompt Confirmations

**What goes wrong:** Inconsistent UX, no structured choice tracking
**Why it happens:** Habit from traditional CLI tools
**How to avoid:**
- Use AskUserQuestion for all user decisions
- Provide explicit options array
- Handle each option case in process steps

**Warning signs:**
- "Type 'yes' to continue"
- Freeform text parsing for decisions
- No header/question structure

### Pitfall 3: Assuming Files Exist

**What goes wrong:** Commands fail midway when optional files missing
**Why it happens:** Not all milestones have all artifacts (research/ may not exist)
**How to avoid:**
- Use `2>/dev/null || true` for optional file operations
- Check existence before operations on required files
- Document which files are required vs optional

**Warning signs:**
- No existence checks before `mv` or `cat`
- Failure messages about missing files that should be optional

### Pitfall 4: Non-Mirrored Archive Structure

**What goes wrong:** History/ has flat structure, hard to understand what was archived
**Why it happens:** Simple to move everything into one directory
**How to avoid:**
- Mirror .planning/ structure in history/v{X.Y}/
- Preserve subdirectory organization (phases/, research/, todos/)
- Move entire directories with `mv .planning/phases .planning/history/v1.0/`

**Warning signs:**
- Flat file list in history/v{X.Y}/
- No subdirectories in archived milestone

### Pitfall 5: Partial Archive States

**What goes wrong:** Some files moved, others not, workspace in inconsistent state
**Why it happens:** Individual mv commands executed, process interrupted
**How to avoid:**
- Use mkdir -p before moves to ensure destination exists
- Batch git add operations
- Let git track the changes (rollback via git if issues)
- Operations are atomic at filesystem level

**Warning signs:**
- Files partially moved
- Mix of files in both source and destination
- No git tracking of the move

### Pitfall 6: Deprecated Command Still Functional

**What goes wrong:** Users keep using old workflow, split usage patterns
**Why it happens:** Command still works, deprecation is just a warning
**How to avoid:**
- Show deprecation message FIRST (before any processing)
- Exit immediately after message (don't allow execution)
- Use GSD branded banner for deprecation notice

**Warning signs:**
- Deprecation message after processing starts
- Command still functional "with warning"
- No clear direction to new command

## Code Examples

Verified patterns from existing GSD codebase:

### Complete Archive with Git Identity
```bash
# Source: templates/get-shit-done/workflows/archive-milestone.md
# Pattern: Atomic move with git tracking and user identity preservation

# 1. Source helpers (idempotent)
if ! type commit_as_user >/dev/null 2>&1; then
    source {{PLATFORM_ROOT}}/get-shit-done/workflows/git-identity-helpers.sh
fi

# 2. Create destination
mkdir -p .planning/history/v1.0/

# 3. Move files atomically
mv .planning/ROADMAP.md .planning/history/v1.0/
mv .planning/STATE.md .planning/history/v1.0/
mv .planning/PROJECT.md .planning/history/v1.0/
mv .planning/REQUIREMENTS.md .planning/history/v1.0/ 2>/dev/null || true

# 4. Move directories
mv .planning/phases .planning/history/v1.0/ 2>/dev/null || true
mv .planning/research .planning/history/v1.0/ 2>/dev/null || true
mv .planning/todos .planning/history/v1.0/ 2>/dev/null || true

# 5. Stage all changes
git add .planning/history/v1.0/
git add -u .planning/  # Stages deletions

# 6. Commit with user identity
commit_as_user "milestone: archive v1.0 to history

Moved to .planning/history/v1.0/:
- ROADMAP.md, STATE.md, PROJECT.md
- REQUIREMENTS.md
- phases/, research/, todos/

Workspace ready for next milestone."
```

### AskUserQuestion Confirmation Pattern
```markdown
<!-- Source: templates/skills/gsd-new-milestone/SKILL.md -->
<!-- Pattern: User confirmation with explicit options -->

<step name="confirm_scope">
Use AskUserQuestion:
- header: "Ready?"
- question: "I think I understand what you're after. Ready to update PROJECT.md?"
- options:
  - "Update PROJECT.md" — Let's move forward
  - "Keep exploring" — I want to share more / ask me more

If "Keep exploring": Ask what they want to add, continue discussion.
If "Update PROJECT.md": Continue to next step.
</step>
```

### Stage Banner Pattern
```markdown
<!-- Source: templates/get-shit-done/references/ui-brand.md -->
<!-- Pattern: Major workflow transition banner -->

Display stage banner:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► MILESTONE COMPLETE ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**v1.0 MVP** — 4 phases, 8 plans complete

Archived to: .planning/history/v1.0/
Git tag: v1.0

───────────────────────────────────────────────────────────────

## ▶ Next Up

**New Milestone** — Start planning v1.1

`{{COMMAND_PREFIX}}new-milestone`

<sub>`/clear` first → fresh context window</sub>

───────────────────────────────────────────────────────────────
```
```

### Deprecation Blocking Message
```markdown
<!-- Pattern: Deprecated command with blocking message -->

<objective>
**DEPRECATED: Use {{COMMAND_PREFIX}}complete-milestone instead.**
</objective>

<process>
<step name="block_execution">
Display deprecation notice:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► DEPRECATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This command has been unified into {{COMMAND_PREFIX}}complete-milestone.

**Old workflow (deprecated):**
1. {{COMMAND_PREFIX}}complete-milestone    # Mark complete
2. {{COMMAND_PREFIX}}archive-milestone     # Move to milestones/
3. {{COMMAND_PREFIX}}restore-milestone     # Retrieve from milestones/

**New workflow:**
{{COMMAND_PREFIX}}complete-milestone       # Archives directly to history/v{X.Y}/

All milestone files now move directly to history/ with mirrored
.planning/ structure. Archives are permanent and git-tracked.

To review archived milestones: {{COMMAND_PREFIX}}list-milestones

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Exit without processing.
</step>
</process>
```

### MILESTONES.md Listing Pattern
```bash
# Source: templates/get-shit-done/workflows/list-milestones.md
# Pattern: Parse and display milestone registry

# Check if registry exists
if [ ! -f .planning/MILESTONES.md ]; then
    echo "No milestones archived yet."
    echo ""
    echo "Complete your first milestone with {{COMMAND_PREFIX}}complete-milestone"
    exit 0
fi

# Read and display
echo ""
echo "Completed Milestones"
echo "===================="
echo ""

cat .planning/MILESTONES.md

echo ""
echo "To start next milestone: {{COMMAND_PREFIX}}new-milestone"
```

### Phase Directory Detection
```bash
# Source: templates/skills/gsd-new-milestone/SKILL.md
# Pattern: Find highest phase number for continuation

# Match both zero-padded (05-*) and unpadded (5-*) folders
PHASE_NUM=10
PADDED_PHASE=$(printf "%02d" ${PHASE_NUM} 2>/dev/null || echo "${PHASE_NUM}")
PHASE_DIR=$(ls -d .planning/phases/${PADDED_PHASE}-* .planning/phases/${PHASE_NUM}-* 2>/dev/null | head -1)

# Example: PHASE_DIR = ".planning/phases/10-milestone-completion-workflow-unification"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Archive to milestones/ then move to history/ | Archive directly to history/v{X.Y}/ | Phase 10 (v2.0) | Simpler workflow, one command |
| Separate archive/restore commands | Unified complete-milestone | Phase 10 (v2.0) | Deprecated archive-milestone, restore-milestone |
| Manual text prompts | AskUserQuestion tool | Established pattern | Consistent UX, structured choices |
| Flat archive structure | Mirrored .planning/ subdirectories | Phase 10 (v2.0) | Better organization, clear structure |

**Deprecated/outdated:**
- `{{COMMAND_PREFIX}}archive-milestone`: Replaced by complete-milestone direct archiving
- `{{COMMAND_PREFIX}}restore-milestone`: Archives are permanent (git-tracked), no restore needed
- Manual confirmation prompts: Use AskUserQuestion instead
- Two-step archival (complete → archive): Now single-step (complete archives directly)

## Open Questions

None. All patterns verified from existing codebase.

## Sources

### Primary (HIGH confidence)
- `templates/skills/gsd-complete-milestone/SKILL.md` — Current complete workflow
- `templates/skills/gsd-archive-milestone/SKILL.md` — Archive patterns to consolidate
- `templates/skills/gsd-restore-milestone/SKILL.md` — Restore patterns to deprecate
- `templates/skills/gsd-list-milestones/SKILL.md` — Listing patterns
- `templates/skills/gsd-new-milestone/SKILL.md` — Banner patterns, AskUserQuestion usage
- `templates/get-shit-done/workflows/complete-milestone.md` — Full completion workflow
- `templates/get-shit-done/workflows/archive-milestone.md` — Archive file operations
- `templates/get-shit-done/workflows/git-identity-helpers.sh` — Git identity functions
- `templates/get-shit-done/references/ui-brand.md` — Banner and UI patterns
- `.planning/phases/*/` — Phase directory structure examples

**Note:** Sources are under `/templates/` and use `{{PLATFORM_ROOT}}` variable which gets replaced with `.github`, `.claude`, or `.codex` during installation.

### Research Method
Direct codebase inspection (not external research). All patterns verified from existing implementation.

## Metadata

**Confidence breakdown:**
- Skill patterns: HIGH - Examined 29 existing skills, consistent structure verified
- Git operations: HIGH - Helper functions exist, pattern usage verified across skills
- User confirmations: HIGH - AskUserQuestion used in gsd-new-milestone, gsd-check-todos
- File operations: HIGH - Archive patterns verified in archive-milestone.md workflow
- UI/Banners: HIGH - ui-brand.md reference document with explicit patterns

**Research date:** 2026-01-31
**Valid until:** 90 days (internal codebase patterns, stable)
