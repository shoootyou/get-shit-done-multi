# Migration Guide: v1.x → v2.0

**Last updated:** 2026-01-22

This guide helps you upgrade from v1.x (static agents) to v2.0 (template-based agent generation) with confidence.

## Table of Contents

- [What's New in v2.0](#whats-new-in-v20)
- [Breaking Changes](#breaking-changes)
- [Benefits](#benefits)
- [Upgrade Steps](#upgrade-steps)
- [What's Preserved](#whats-preserved)
- [Custom Agents](#custom-agents)
- [FAQ](#faq)

---

## What's New in v2.0

v2.0 introduces **template-based agent generation** for platform-specific optimization.

### Key Features

**1. Template-Based Agent Generation**
- Agents generated from `specs/agents/` templates during installation
- Single source of truth prevents documentation drift
- Platform-specific rendering (Claude vs Copilot get optimal formats)

**2. Platform-Specific Optimization**
- **Claude agents:** String-based tools format, no metadata field
- **Copilot agents:** Array-based tools format, nested metadata object
- Each platform gets format that matches official specification

**3. Tool Mapping with PRIMARY Aliases**
- Copilot agents use PRIMARY aliases (`execute`, `edit`, `search`, `agent`)
- Claude agents use canonical names (`Bash`, `Read`, `Edit`, `Grep`, `Glob`, `Task`)
- Bidirectional tool mapper handles all variants automatically

**4. Zero-Warnings Installation**
- Install runs without warnings on all platforms
- Full Copilot specification compliance
- Color field filtered, tools normalized, format validated

**5. Complete Test Coverage**
- **208 tests** validating generation, installation, and invocation
- E2E test orchestrator: generation → installation → invocation
- Both platforms tested via actual CLI installations

**6. Agent Size Optimization**
- Large agents split into coordinator/specialist pairs
- All Copilot agents under 30KB limit (except 2 documented exceptions)
- Content preservation: zero information loss during splits

---

## Breaking Changes

**1. Agents Are Now Generated Files**

| v1.x | v2.0 |
|------|------|
| Static files in `agents/` directory | Generated from `specs/agents/` during install |
| Edit `agents/my-agent.md` directly | Edit `specs/agents/my-agent.md` then regenerate |
| Manual synchronization across platforms | Automatic platform-specific generation |

**2. Tool References Use Platform-Specific Names**

| Platform | v1.x | v2.0 |
|----------|------|------|
| Claude | `Bash`, `Read`, `Edit` | `Bash`, `Read`, `Edit` (unchanged) |
| Copilot | `bash`, `read`, `write` | `execute`, `edit`, `search` (PRIMARY aliases) |

**3. Custom Agent Modifications**

| v1.x | v2.0 |
|------|------|
| Edit `agents/custom.md` | Edit `specs/agents/custom.md` |
| Changes persist across reinstalls | Must regenerate after changes |
| No template support | Mustache conditionals for platform features |

**4. Installation Behavior**

| v1.x | v2.0 |
|------|------|
| Copies static agent files | Generates agents from templates |
| Preserves manual agent edits | Overwrites generated agents (idempotent) |
| No generation step | Renders templates with platform context |

---

## Benefits

### Why Template-Based Generation?

**1. Single Source of Truth**
- Edit one template spec → generates both platform versions
- No drift between Claude and Copilot agents
- Documentation always matches implementation

**2. Platform Optimization**
- Claude gets string-based tools: `tools: "Bash, Read, Edit"`
- Copilot gets array-based tools: `tools: ["execute", "edit", "search"]`
- Each platform gets format matching official specification

**3. Easier Maintenance**
- Fix bug in one spec → both platforms updated
- Add feature once → both platforms benefit
- Test coverage ensures no regressions

**4. Size Optimization**
- Agent splitting strategy for Copilot 30KB limit
- Coordinator/specialist pattern preserves full functionality
- Backward-compatible naming (`gsd-planner` still works)

**5. Zero Installation Warnings**
- Full Copilot specification compliance
- Tool mapping with PRIMARY aliases
- Format validation before file write

**6. Comprehensive Testing**
- 208 tests covering generation, installation, invocation
- E2E validation through actual CLI usage
- Platform-specific feature validation

---

## Upgrade Steps

### Prerequisites

Ensure you have:
- Node.js 16+ installed
- Git (for version verification)
- Existing v1.x installation

### Step-by-Step Upgrade

```bash
# Step 1: Update package globally
npm update -g get-shit-done-multi

# Step 2: Verify version
npm list -g get-shit-done-multi
# Expected output: get-shit-done-multi@2.0.0

# Step 3: Regenerate agents (preserves .planning/ state)

# For Claude Code:
npx get-shit-done-multi --local
# or
npx get-shit-done-multi --global

# For GitHub Copilot CLI:
npx get-shit-done-multi --copilot

# For both (auto-detects installed CLIs):
npx get-shit-done-multi --all

# Step 4: Verify installation
ls -la agents/
# Claude agents regenerated with optimized format

ls -la .github/copilot/agents/
# Copilot agents regenerated (if --copilot used)

# Step 5: Verify your .planning/ state is intact
cat .planning/STATE.md
cat .planning/ROADMAP.md
# Your project state is PRESERVED - continue where you left off
```

### Verification Commands

```bash
# Confirm version
npm list -g get-shit-done-multi

# Check agent count (should be 13 agents)
ls agents/*.md | wc -l
# Expected: 13

# Verify generation metadata (v2.0 agents have metadata)
head -20 agents/gsd-executor.md
# Should show YAML frontmatter with tools, name, description

# Test agent invocation (Claude Code example)
claude
# In Claude: "Invoke the gsd-executor agent"
# Should work identically to v1.x
```

---

## What's Preserved

### Your Work Stays Intact

v2.0 upgrade is **non-destructive** for project state:

✅ **Preserved:**
- `.planning/` directory (all state, roadmaps, plans, summaries)
- `.planning/STATE.md` (current position, decisions, blockers)
- `.planning/ROADMAP.md` (phase structure, progress)
- `.planning/phases/` (all phase plans and summaries)
- `.planning/history/` (archived milestones)
- `.planning/research/` (domain research files)
- Git history and commits
- Project metadata in `package.json`

❌ **Not Preserved:**
- Manual edits to `agents/*.md` files (regenerated from specs)
- Custom agents NOT in `specs/agents/` (must migrate manually)

### Orchestration Unchanged

All GSD commands work identically:

```bash
/gsd:new-project          # Same behavior
/gsd:plan-phase 3         # Same behavior
/gsd:execute-plan 03-02   # Same behavior
/gsd:verify-phase 3       # Same behavior
```

### Installation Flags Unchanged

```bash
--local          # Still installs to ~/.claude/agents/
--global         # Still installs to ~/.config/claude/agents/
--copilot        # Still installs to .github/copilot/agents/
--codex          # Still installs to ~/.openai/codex/agents/
--codex-global   # Still installs to ~/.config/openai-codex/agents/
--all            # Still auto-detects and installs to all CLIs
```

---

## Custom Agents

### Migrating Custom Agents from v1.x

If you created custom agents in v1.x, follow this migration pattern:

#### Step 1: Copy to specs/

```bash
# If you have custom agent in agents/
cp agents/my-custom-agent.md specs/agents/
```

#### Step 2: Add Platform Conditionals (Optional)

Edit `specs/agents/my-custom-agent.md` to add platform-specific content:

```markdown
---
name: my-custom-agent
description: My custom agent
tools: {{tools}}
{{#isCopilot}}
metadata:
  platform: copilot
  generated: {{generatedDate}}
{{/isCopilot}}
---

# My Custom Agent

You are a custom agent for...

## Tools

{{#isClaude}}
Use these tools: Bash, Read, Edit, Grep, Glob
{{/isClaude}}

{{#isCopilot}}
Use these tools: execute, edit, search
{{/isCopilot}}
```

#### Step 3: Regenerate Agents

```bash
# Regenerate with platform-specific optimization
npx get-shit-done-multi --all
```

#### Step 4: Verify Output

```bash
# Check Claude version
cat agents/my-custom-agent.md

# Check Copilot version
cat .github/copilot/agents/my-custom-agent.md
```

### Template Syntax Reference

Use Mustache conditionals for platform-specific content:

```markdown
{{#isClaude}}
Claude-only content
{{/isClaude}}

{{#isCopilot}}
Copilot-only content
{{/isCopilot}}

{{tools}}  # Replaced with platform-specific tools format
{{name}}   # Agent name
{{description}}  # Agent description
{{generatedDate}}  # Generation timestamp
```

### Best Practices

1. **Edit specs, not generated agents**
   - Always edit `specs/agents/` templates
   - Regenerate to see changes in `agents/` and `.github/copilot/agents/`

2. **Use platform conditionals sparingly**
   - Most content can be platform-agnostic
   - Only use conditionals for tool references and metadata

3. **Test on both platforms**
   - Generate for Claude: `npx get-shit-done-multi --local`
   - Generate for Copilot: `npx get-shit-done-multi --copilot`
   - Verify behavior matches expectations

4. **Preserve agent size**
   - Keep agents under 30KB for Copilot compatibility
   - Split into coordinator/specialist if needed (see `docs/AGENT-SPLIT-PATTERN.md`)

---

## FAQ

### General Questions

**Q: Do I need to recreate my project from scratch?**

**A:** No. Your `.planning/` state is fully preserved. Just update the package and regenerate agents.

---

**Q: Will my in-progress phase work break?**

**A:** No. Agent functionality is identical between v1.x and v2.0. Only the generation method changed. Continue your phase exactly where you left off.

---

**Q: Can I still use `--copilot` and `--all` flags?**

**A:** Yes. All installation flags work the same way, now with platform-specific optimization built in.

---

**Q: What if I customized agents in v1.x?**

**A:** Move customizations to `specs/agents/` (see [Custom Agents](#custom-agents) section). Agents in `agents/` directory are now generated files and will be overwritten during install.

---

**Q: How do I know which agents changed?**

**A:** See `CHANGELOG.md` for detailed list. Functionality is identical, format optimized. Key changes:
- Tool references use PRIMARY aliases for Copilot
- Metadata structure matches platform specifications
- Large agents split into coordinator/specialist pairs

---

**Q: Why template-based generation?**

**A:** See `docs/architecture.md` for technical rationale. TL;DR:
- Single source of truth (no drift)
- Platform optimization (best format for each CLI)
- Easier maintenance (edit once, generate twice)
- Size optimization (split for Copilot 30KB limit)

---

**Q: Do tests still pass?**

**A:** Yes. v2.0 has 208 tests validating:
- Generation (22 tests): Template rendering and YAML formatting
- Installation (5 tests): File placement and format compliance
- Invocation (smoke tests): Actual CLI usage on both platforms
- E2E orchestration: Full workflow validation

---

**Q: Are there any size limits?**

**A:** Copilot has a 30KB agent file size limit. v2.0 addresses this:
- Most agents under 30KB through optimization
- 2 agents exceed limit (documented in `CHANGELOG.md`):
  - `gsd-planner` (41KB): Split available as `gsd-planner` + `gsd-planner-specialist`
  - `gsd-debugger` (35KB): Split available as `gsd-debugger` + `gsd-debugger-specialist`
- Claude has no size limit

---

**Q: What happens if I edit generated agents directly?**

**A:** Changes will be **overwritten** next time you run install. Always edit `specs/agents/` templates instead, then regenerate.

---

**Q: Can I revert to v1.x?**

**A:** Yes, but not recommended:
```bash
npm install -g get-shit-done-multi@1.8.1
```
Your `.planning/` state works with both versions.

---

**Q: Where can I learn more about the template system?**

**A:** See documentation:
- `docs/architecture.md` - System architecture and design decisions
- `docs/AGENT-SPLIT-PATTERN.md` - Agent splitting strategy for size limits
- `CHANGELOG.md` - Complete change list for v2.0

---

**Q: How do I customize agent tools or behavior?**

**A:** Edit the spec file in `specs/agents/`, then regenerate:
```bash
# Edit spec
vim specs/agents/my-agent.md

# Regenerate for all platforms
npx get-shit-done-multi --all

# Verify changes
cat agents/my-agent.md
cat .github/copilot/agents/my-agent.md
```

---

**Q: What if installation produces warnings?**

**A:** v2.0 targets zero warnings. If you see warnings:
1. Check you're running v2.0.0: `npm list -g get-shit-done-multi`
2. Report issue with warning message at: https://github.com/shoootyou/get-shit-done-multi/issues

---

## Getting Help

### Resources

- **Documentation:** `docs/` directory in repository
- **Architecture:** `docs/architecture.md`
- **Agent Splitting:** `docs/AGENT-SPLIT-PATTERN.md`
- **Testing Guide:** `docs/TESTING-CROSS-PLATFORM.md`
- **Changelog:** `CHANGELOG.md`

### Support

- **GitHub Issues:** https://github.com/shoootyou/get-shit-done-multi/issues
- **Discussions:** https://github.com/shoootyou/get-shit-done-multi/discussions

### Reporting Bugs

If you encounter issues during migration:

1. Verify version: `npm list -g get-shit-done-multi`
2. Check `.planning/` state is intact
3. Try regenerating: `npx get-shit-done-multi --all`
4. Report with:
   - v1.x version you upgraded from
   - Error message or unexpected behavior
   - Output of `npm list -g get-shit-done-multi`
   - Platform (Claude, Copilot, Codex)

---

## Summary

### Upgrade Checklist

- [ ] Update package: `npm update -g get-shit-done-multi`
- [ ] Verify version: `npm list -g get-shit-done-multi` shows 2.0.0
- [ ] Regenerate agents: `npx get-shit-done-multi --all`
- [ ] Verify `.planning/` state preserved
- [ ] Migrate custom agents to `specs/agents/`
- [ ] Test orchestration commands work
- [ ] Review `CHANGELOG.md` for detailed changes

### Key Takeaways

✅ **Safe upgrade** - `.planning/` state preserved
✅ **Identical functionality** - agents work the same way
✅ **Platform optimization** - best format for each CLI
✅ **Zero warnings** - full specification compliance
✅ **Complete testing** - 208 tests validate everything
✅ **Backward compatible** - all commands and flags unchanged

**Ready to upgrade?** Follow the [Upgrade Steps](#upgrade-steps) above.

---

*Migration guide for v2.0.0 template-based agent generation system*
*Last updated: 2026-01-22*
