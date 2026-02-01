---
name: gsd-restore-milestone
description: Archives are now permanent in history. This command is no longer needed. Shows deprecation notice and exits.
allowed-tools: Read
---


# Restore Milestone (DEPRECATED)

**This command is no longer needed.**

<objective>
DEPRECATED: Archives are now permanent in history/. No restore operation needed.
</objective>

<process>

<step name="show_deprecation_and_exit">
Display deprecation notice using GSD branded banner format:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 GSD ► DEPRECATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This command is no longer needed.

**Old workflow (deprecated):**
1. /gsd-complete-milestone    # Mark complete
2. /gsd-archive-milestone     # Move to milestones/
3. /gsd-restore-milestone     # Retrieve from milestones/ ← YOU ARE HERE

**New approach:**
Archives in `.planning/history/v{X.Y}/` are permanent and git-tracked.
There is no need to restore — simply reference files directly or use
git to view historical versions.

───────────────────────────────────────────────────────────────

## Accessing Archived Milestones

**View milestone history:**
```bash
ls .planning/history/
```

**Read archived files:**
```bash
cat .planning/history/v1.0/ROADMAP.md
```

**View at specific git tag:**
```bash
git show v1.0:ROADMAP.md
```

**List all milestones:**
/gsd-list-milestones

───────────────────────────────────────────────────────────────

## Why No Restore?

The new workflow archives to permanent history/ with mirrored directory
structure. Files are git-tracked and always accessible. Restoring would
conflict with the current active milestone.

If you need to reference old planning artifacts, use bash commands to
read them directly from history/ or use git commands to view historical
commits.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

Exit immediately without executing any operations.
</step>

</process>

<success_criteria>
- [ ] Deprecation message displayed with branded banner
- [ ] Explains why restore is no longer needed
- [ ] Shows alternative approaches (ls, cat, git show)
- [ ] No file operations executed
- [ ] Template variables (/gsd-) used for cross-platform support
</success_criteria>
