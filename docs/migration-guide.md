# Migration Guide: Creating GSD Skills

**Last updated:** 2026-01-24 (v1.9.1)

**Audience:** GSD maintainers and users creating custom skills

**Goal:** Complete this guide with a working custom skill installed on your platform

## Table of Contents

1. [Why Spec-Based Skills?](#why)
2. [What Changed in v1.9.1](#what-changed)
3. [Prerequisites](#prerequisites)
4. [Tutorial: Your First Skill](#tutorial)
5. [Working Examples by Platform](#examples)
6. [Reference Documentation](#reference)
7. [Common Patterns](#patterns)
8. [Troubleshooting](#troubleshooting)

## Why Spec-Based Skills? {#why}

Before v1.9.1, creating a new GSD command required:
1. Writing command file for legacy format
2. Duplicating it 3 times for Claude, Copilot, Codex
3. Manually adapting tool names per platform
4. Maintaining synchronization across 4 files

**Problems this caused:**
- 4× work for every change
- Platform drift (subtle differences emerged)
- Hard to add new platforms
- Manual tool mapping error-prone

**With spec-based skills:**
1. Write ONE spec file with conditional syntax
2. Template system generates all platforms automatically
3. Zero drift (generated files guaranteed identical)
4. Proven foundation (reuses agent template system with 208 passing tests)

**Migration impact:** v1.9.1 removes legacy system entirely. This guide teaches creating NEW specs from scratch.

## What Changed in v1.9.1 {#what-changed}

See [Command Comparison](./command-comparison.md) for detailed side-by-side comparison.

**Key changes:**
- Invocation: `/gsd:` → `/gsd-`
- File structure: Single file → Folder-per-skill
- Frontmatter: Optional → Required with schema
- Tool declarations: Implicit → Explicit with conditionals
- Generation: Manual → Template-based

## Prerequisites {#prerequisites}

**Before creating a skill, ensure:**

1. **GSD v1.9.1+ installed:**
   ```bash
   npm list -g get-shit-done-multi
   # Should show v1.9.1 or higher
   ```

2. **CLI installed (at least one):**
   - Claude Code
   - GitHub Copilot CLI (`gh copilot` works)
   - Codex CLI (`codex` command works)

3. **Tools installed:**
   - Node.js 16+ (`node --version`)
   - Git (`git --version`)

4. **Basic familiarity with:**
   - YAML frontmatter
   - Markdown syntax
   - Your CLI of choice

## Tutorial: Your First Skill {#tutorial}

**What we'll build:** A simple `/gsd-whoami` skill that displays Git user identity.

**Why this example:**
- Reads from external tool (git config)
- Platform-agnostic logic
- Real-world useful
- Tests conditional syntax

### Step 1: Create Skill Directory

```bash
# Navigate to GSD source (if forked/cloned)
cd /path/to/get-shit-done-multi

# Create skill directory
mkdir -p specs/skills/gsd-whoami

# Verify structure
ls specs/skills/gsd-whoami
# Should be empty (ready for SKILL.md)
```

**Folder name rules:**
- Must match skill name exactly
- Lowercase only
- Hyphens only (no spaces, underscores)
- Must start with `gsd-`

### Step 2: Create SKILL.md File

```bash
# Create the skill specification
touch specs/skills/gsd-whoami/SKILL.md
```

**File name rules:**
- MUST be `SKILL.md` (all caps)
- No other names allowed
- One per skill folder

### Step 3: Write Frontmatter

Open `specs/skills/gsd-whoami/SKILL.md` and add:

```yaml
---
name: gsd-whoami
description: Display Git user identity from config
tools:
  {{#isClaude}}
  - Bash
  {{/isClaude}}
  {{#isCopilot}}
  - shell_execute
  {{/isCopilot}}
  {{#isCodex}}
  - shell.run
  {{/isCodex}}
---
```

**Breakdown:**
- `name`: Skill identifier, must match folder name (`gsd-whoami`)
- `description`: One-line description (shown in help, max 100 chars)
- `tools`: Platform-specific tool declarations using Mustache conditionals

**Why conditionals:**
- Claude uses `Bash`, Copilot uses `shell_execute`, Codex uses `shell.run`
- Template system renders appropriate tools during generation
- Body stays platform-agnostic

### Step 4: Write Body Content

Add body after frontmatter (after `---`):

```markdown
---
[frontmatter from Step 3]
---

# Role

You are the `/gsd-whoami` skill. Display the Git user identity configured for the current environment.

## Objective

Show the user's Git name and email from git config.

## Process

1. Check global git config:
   ```bash
   git config --global user.name
   git config --global user.email
   ```

2. Check local git config (if in a repository):
   ```bash
   git config --local user.name 2>/dev/null
   git config --local user.email 2>/dev/null
   ```

3. Display results in table format:

   | Scope | Name | Email |
   |-------|------|-------|
   | Global | [name] | [email] |
   | Local | [name or "Not set"] | [email or "Not set"] |

4. If no git config found, show helpful message:
   ```
   No Git identity configured. Set with:
   git config --global user.name "Your Name"
   git config --global user.email "your.email@example.com"
   ```

## Output Format

```markdown
## Git Identity

[Table or helpful message]
```
```

**Body rules:**
- Platform-agnostic markdown (no conditionals here)
- Clear role and objective
- Specific process steps
- Expected output format

### Step 5: Validate Syntax

```bash
# Check YAML frontmatter is valid
head -20 specs/skills/gsd-whoami/SKILL.md | grep "^---$"
# Should show two lines (opening and closing ---)

# Check name matches folder
grep "^name:" specs/skills/gsd-whoami/SKILL.md
# Should show: name: gsd-whoami
```

### Step 6: Generate for Your Platform

**Claude Code:**
```bash
npm run install --prefix . -- --global
# Generates to: ~/.claude/get-shit-done/.github/skills/gsd-whoami.md
```

**GitHub Copilot CLI:**
```bash
npm run install --prefix . -- --copilot
# Generates to: .github/skills/get-shit-done/gsd-whoami.md

# Reload skills
gh copilot reload
```

**Codex CLI:**
```bash
npm run install --prefix . -- --codex
# Generates to: .codex/skills/get-shit-done/gsd-whoami.md

# Verify
codex skills list | grep gsd-whoami
```

### Step 7: Test Your Skill

**Claude Code:**
```
In Claude Code chat:
/gsd-whoami
```

**GitHub Copilot CLI:**
```bash
gh copilot /gsd-whoami
```

**Codex CLI:**
```bash
codex /gsd-whoami
```

**Expected output:**
- Table showing your Git name and email
- Or helpful message if not configured

### Step 8: Iterate and Refine

```bash
# Edit the spec
vi specs/skills/gsd-whoami/SKILL.md

# Regenerate
npm run install --prefix . -- [--global|--copilot|--codex]

# Test again
/gsd-whoami
```

**🎉 Congratulations!** You've created a custom GSD skill.

## Working Examples by Platform {#examples}

### Example 1: Simple Info Skill (No Tools)

**File:** `specs/skills/gsd-about/SKILL.md`

```yaml
---
name: gsd-about
description: Display information about GSD project
tools: []
---

# Role

You are the `/gsd-about` skill. Display GSD project information.

## Output

```markdown
# About Get Shit Done (GSD)

**Version:** 1.9.1
**Purpose:** Multi-platform project orchestration system
**Platforms:** Claude Code, GitHub Copilot CLI, Codex CLI
**Commands:** 28 skills available

Run `/gsd-help` for command list.
```
```

**Note:** No tools needed for simple informational responses.

### Example 2: File Reading Skill

**File:** `specs/skills/gsd-show-state/SKILL.md`

```yaml
---
name: gsd-show-state
description: Display current project state from STATE.md
tools:
  {{#isClaude}}
  - Read
  {{/isClaude}}
  {{#isCopilot}}
  - file_read
  {{/isCopilot}}
  {{#isCodex}}
  - fs.read
  {{/isCodex}}
---

# Role

Display current project state from `.planning/STATE.md`.

## Process

1. Check if `.planning/STATE.md` exists
2. Read and display contents
3. If missing, show helpful message

## Output

Contents of STATE.md or:
```
No project state found. Initialize with /gsd-new-project
```
```

### Example 3: Multi-Tool Orchestration Skill

**File:** `specs/skills/gsd-quick-status/SKILL.md`

```yaml
---
name: gsd-quick-status
description: Show quick project status (git + state)
tools:
  {{#isClaude}}
  - Bash
  - Read
  {{/isClaude}}
  {{#isCopilot}}
  - shell_execute
  - file_read
  {{/isCopilot}}
  {{#isCodex}}
  - shell.run
  - fs.read
  {{/isCodex}}
---

# Role

Show quick project status combining git and GSD state.

## Process

1. Check git status: `git status --short`
2. Read current phase from STATE.md
3. Display combined summary

## Output

```markdown
## Quick Status

**Git:** [files changed]
**GSD:** Phase [N] - [name]
```
```

## Reference Documentation {#reference}

**Full schema documentation:** [specs/skills/README.md](../specs/skills/README.md)

**Quick reference:**
- Required fields: `name`, `description`, `tools`
- Optional fields: `argument-hint`
- Conditionals: `{{#isClaude}}`, `{{#isCopilot}}`, `{{#isCodex}}`
- Tool mapping: Automatic during generation

**Tool reference tables:** See [README Tool Reference](../specs/skills/README.md#tool-reference-by-platform)

## Common Patterns {#patterns}

### Pattern 1: Read-Only Information Skill

**When to use:** Display static information, no file/command access needed

```yaml
tools: []
```

**Example:** gsd-about, gsd-help

### Pattern 2: File Reader Skill

**When to use:** Read configuration, state, or project files

```yaml
tools:
  {{#isClaude}}- Read{{/isClaude}}
  {{#isCopilot}}- file_read{{/isCopilot}}
  {{#isCodex}}- fs.read{{/isCodex}}
```

**Example:** gsd-show-state, reading STATE.md

### Pattern 3: Command Executor Skill

**When to use:** Run git, npm, or shell commands

```yaml
tools:
  {{#isClaude}}- Bash{{/isClaude}}
  {{#isCopilot}}- shell_execute{{/isCopilot}}
  {{#isCodex}}- shell.run{{/isCodex}}
```

**Example:** gsd-whoami (git config), gsd-verify-installation

### Pattern 4: File Writer Skill

**When to use:** Create/modify files (plans, state, summaries)

```yaml
tools:
  {{#isClaude}}- Read
  - Write{{/isClaude}}
  {{#isCopilot}}- file_read
  - file_write{{/isCopilot}}
  {{#isCodex}}- fs.read
  - fs.write{{/isCodex}}
```

**Example:** Creating PLAN.md, updating STATE.md

### Pattern 5: Orchestrator Skill

**When to use:** Spawn subagents for multi-step workflows

```yaml
tools:
  {{#isClaude}}- Read
  - Bash
  - Write
  - Task{{/isClaude}}
  {{#isCopilot}}- file_read
  - shell_execute
  - file_write
  - agent_spawn{{/isCopilot}}
  {{#isCodex}}- fs.read
  - shell.run
  - fs.write
  - agent.invoke{{/isCodex}}
```

**Example:** gsd-new-project, gsd-execute-phase

## Troubleshooting {#troubleshooting}

### Skill Not Generated

**Symptom:** After installation, skill missing from generated directory.

**Diagnosis:**
```bash
# Check spec exists
ls specs/skills/gsd-yourskill/SKILL.md

# Check for generation errors during install
npm run install --prefix . -- [platform] 2>&1 | grep -i error
```

**Solution:**
- Verify YAML frontmatter is valid (matching `---` lines)
- Check folder name matches `name` field exactly
- Ensure required fields present (name, description, tools)

### Invalid YAML Frontmatter

**Symptom:** Installation errors mentioning "frontmatter" or "YAML".

**Common causes:**
- Missing closing `---` line
- Indentation errors (use 2 spaces, not tabs)
- Quotes mismatch (`"` vs `'`)
- Unclosed conditionals (`{{#isClaude}}` without `{{/isClaude}}`)

**Solution:**
```bash
# Validate YAML online: https://www.yamllint.com/
# Or use local validator:
node -e "console.log(require('js-yaml').load(require('fs').readFileSync('specs/skills/gsd-yourskill/SKILL.md', 'utf8').split('---')[1]))"
```

### Name Mismatch Error

**Symptom:** Generation fails with "folder name doesn't match skill name".

**Diagnosis:**
```bash
# Check folder name
basename $(dirname specs/skills/gsd-yourskill/SKILL.md)

# Check name field
grep "^name:" specs/skills/gsd-yourskill/SKILL.md
```

**Solution:** Ensure exact match:
- Folder: `gsd-plan-phase/`
- Name field: `name: gsd-plan-phase`
- No mismatches (e.g., `gsd-plan-phases` ≠ `gsd-plan-phase`)

## Next Steps

- **Customize existing skills:** Fork GSD, modify specs in `specs/skills/`
- **Share your skills:** Submit PRs to GSD repository
- **Advanced patterns:** Study orchestrator skills (gsd-new-project, gsd-execute-phase)
- **Troubleshooting:** See [troubleshooting.md](./troubleshooting.md) for installation issues

**Need help?** File an issue at https://github.com/shoootyou/get-shit-done-multi/issues
