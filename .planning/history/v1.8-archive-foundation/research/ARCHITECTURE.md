# Architecture Research

**Domain:** Milestone Management & Codebase Analysis for CLI Workflow System
**Researched:** 2025-01-27
**Confidence:** HIGH

## Standard Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Command Interface Layer                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │
│  │ archive-     │  │ verify-      │  │ map-         │       │
│  │ milestone.md │  │ milestone.md │  │ codebase.md  │       │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘       │
│         │                  │                  │               │
├─────────┴──────────────────┴──────────────────┴───────────────┤
│                  Orchestration Layer                          │
│  ┌───────────────────┐  ┌────────────────────────┐           │
│  │ archive-          │  │ map-codebase.md        │           │
│  │ milestone.md      │  │ (Workflow)             │           │
│  │ (Workflow)        │  └────────────┬───────────┘           │
│  └────────┬──────────┘               │                       │
│           │                          │                       │
│           ├──────────────────────────┴───────────────┐       │
│           ↓                          ↓               ↓       │
│  ┌────────────────┐     ┌──────────────────────┐    │       │
│  │ Task tool      │     │ Agent Registry        │    │       │
│  │ (spawn agents) │←───→│ (gsd-codebase-mapper,│←───┘       │
│  └────────────────┘     │  gsd-verifier, etc.)  │            │
│                         └──────────────────────┘             │
├─────────────────────────────────────────────────────────────┤
│                      State Management Layer                  │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ MILESTONES  │  │ .planning/   │  │ .planning/   │        │
│  │ .md         │  │ STATE.md     │  │ codebase/    │        │
│  │ (Registry)  │  │ PROJECT.md   │  │ (Documents)  │        │
│  └──────┬──────┘  └──────┬───────┘  └──────┬───────┘        │
│         │                │                  │                │
├─────────┴────────────────┴──────────────────┴────────────────┤
│                      Persistence Layer                        │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ .planning/history/{milestone-name}/                 │     │
│  │  ├── ROADMAP.md                                     │     │
│  │  ├── STATE.md                                       │     │
│  │  ├── PROJECT.md                                     │     │
│  │  ├── REQUIREMENTS.md                                │     │
│  │  ├── research/                                      │     │
│  │  └── phases/                                        │     │
│  └─────────────────────────────────────────────────────┘     │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Git Layer (commits, tags)                           │     │
│  └─────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| **archive-milestone.md** (Command) | Entry point for milestone archiving | Markdown file with YAML frontmatter, delegates to workflow |
| **archive-milestone.md** (Workflow) | Orchestrates archival process: validate → move → register → commit | Markdown file with step-by-step instructions |
| **verify-milestone.md** (Command) | Entry point for milestone verification | Markdown file, spawns gsd-verifier agent |
| **map-codebase.md** (Command) | Entry point for codebase analysis | Markdown file with optional focus argument |
| **map-codebase.md** (Workflow) | Spawns 4 parallel mapper agents for tech/arch/quality/concerns | Markdown file orchestrating parallel Task tool invocations |
| **MILESTONES.md** | Registry tracking all archived milestones with metadata | Markdown table with timestamps, versions, commit hashes |
| **.planning/history/** | Archive storage for completed milestones | Directory structure with timestamped subdirectories |
| **.planning/codebase/** | Active codebase documentation (not archived) | 7 markdown files (STACK, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, INTEGRATIONS, CONCERNS) |
| **Task tool** | Spawns parallel agents with context isolation | CLI adapter invoking Claude Code/Copilot CLI/Codex CLI |
| **Agent Registry** | Maps agent names to capabilities and prompts | JavaScript registry + markdown agent definitions |

## Recommended Project Structure

### Existing Structure (Preserved)

```
.planning/
├── PROJECT.md          # Project metadata
├── STATE.md            # Current milestone state
├── ROADMAP.md          # Phase definitions
├── REQUIREMENTS.md     # Requirements tracking
├── config.json         # Config (mode: "yolo", parallelization: "enabled")
├── codebase/           # Generated by map-codebase (NOT ARCHIVED)
│   ├── STACK.md
│   ├── ARCHITECTURE.md
│   ├── STRUCTURE.md
│   ├── CONVENTIONS.md
│   ├── TESTING.md
│   ├── INTEGRATIONS.md
│   └── CONCERNS.md
├── research/           # Discovery phase docs
└── phases/             # Phase plans & summaries
    └── {PHASE}/
        ├── RESEARCH.md
        ├── PLAN.md
        ├── SUMMARY.md
        └── {PHASE}-UAT.md
```

### New Structure (Added)

```
.planning/
├── MILESTONES.md       # NEW: Registry of archived milestones
└── history/            # NEW: Archive storage
    └── {milestone-name}/
        ├── ROADMAP.md
        ├── STATE.md
        ├── PROJECT.md
        ├── REQUIREMENTS.md
        ├── research/
        └── phases/
```

### Command & Workflow Structure

```
.github/skills/get-shit-done/
├── commands/
│   └── gsd/
│       ├── archive-milestone.md    # NEW: Command entry point
│       ├── verify-milestone.md     # MODIFIED: Add suggestion to archive
│       └── map-codebase.md         # MODIFIED: Add exclusion config
└── workflows/
    ├── archive-milestone.md        # NEW: Orchestration workflow
    ├── verify-work.md              # MODIFIED: Suggest archive on success
    └── map-codebase.md             # MODIFIED: Add .planning/map-config.json support
```

### Structure Rationale

- **.planning/history/:** Timestamped archives preserve milestone context while keeping active workspace clean
- **MILESTONES.md:** Single source of truth for archive history, enables navigation and auditing
- **.planning/codebase/:** Lives outside history/ because it's actively maintained and applies to ALL milestones
- **Command vs Workflow separation:** Commands are user-facing entry points, workflows contain orchestration logic

## Architectural Patterns

### Pattern 1: Command-Workflow Separation

**What:** Commands are thin entry points; workflows contain orchestration logic

**When to use:** All CLI commands that require multi-step processes

**Trade-offs:**
- **Pro:** Separation of concerns; workflows can be reused or invoked programmatically
- **Pro:** Commands stay simple and focused on argument parsing
- **Con:** Indirection can make flow harder to trace

**Example:**
```markdown
# commands/gsd/archive-milestone.md
---
name: gsd:archive-milestone
description: Archive the current milestone
argument-hint: "[milestone-name]"
allowed-tools: [Read, Bash, Write, Task]
---

<objective>
Archive the current milestone to .planning/history/ and update MILESTONES.md registry
</objective>

<execution_context>
@.github/skills/get-shit-done/workflows/archive-milestone.md
</execution_context>

<process>
Follow the archive-milestone workflow exactly.
</process>
```

```markdown
# workflows/archive-milestone.md

## Step 1: Validate Git State
- Check git status is clean (no uncommitted changes)
- Fail if dirty (prevents incomplete archive)

## Step 2: Determine Milestone Name
- Use argument if provided
- Otherwise, generate from PROJECT.md version + timestamp

## Step 3: Move Files to Archive
- Create .planning/history/{milestone-name}/
- Move ROADMAP.md, STATE.md, PROJECT.md, REQUIREMENTS.md
- Move research/, phases/
- DO NOT move codebase/ (stays active)

## Step 4: Update Registry
- Create/update .planning/MILESTONES.md
- Add row with milestone name, timestamp, commit hash

## Step 5: Commit
- git add .planning/
- git commit -m "Archive milestone: {milestone-name}"
```

### Pattern 2: Parallel Agent Orchestration

**What:** Spawn multiple independent agents simultaneously using Task tool with `run_in_background: true`

**When to use:** Analysis tasks with no interdependencies (e.g., different codebase dimensions)

**Trade-offs:**
- **Pro:** 4x faster than sequential (4 agents in parallel vs sequential)
- **Pro:** Context isolation prevents orchestrator token overload
- **Con:** Requires careful boundary definition to avoid overlap
- **Con:** Harder to debug than sequential execution

**Example:**
```markdown
# map-codebase.md workflow

Spawn 4 parallel agents:

1. Task tool:
   - agent_type: gsd-codebase-mapper
   - description: "Map tech stack"
   - prompt: "Focus on: tech, stack, dependencies. Write STACK.md and INTEGRATIONS.md"
   - run_in_background: true

2. Task tool:
   - agent_type: gsd-codebase-mapper
   - description: "Map architecture"
   - prompt: "Focus on: architecture, structure. Write ARCHITECTURE.md and STRUCTURE.md"
   - run_in_background: true

3. Task tool:
   - agent_type: gsd-codebase-mapper
   - description: "Map quality"
   - prompt: "Focus on: quality, conventions, testing. Write CONVENTIONS.md and TESTING.md"
   - run_in_background: true

4. Task tool:
   - agent_type: gsd-codebase-mapper
   - description: "Map concerns"
   - prompt: "Focus on: concerns, tech debt. Write CONCERNS.md"
   - run_in_background: true

**Critical:** Agents write directly to .planning/codebase/, return only confirmation.
```

### Pattern 3: Markdown-Based State Management

**What:** Use markdown files with structured frontmatter and tables for state persistence

**When to use:** CLI tools where human readability and git diffability are important

**Trade-offs:**
- **Pro:** Human-readable, git-friendly, no database required
- **Pro:** Easy to edit manually if needed
- **Con:** Not suitable for high-frequency writes or large datasets
- **Con:** Requires parsing logic for structured queries

**Example:**
```markdown
# .planning/MILESTONES.md

# Milestone Archive Registry

| Milestone | Archived | Commit | Description |
|-----------|----------|--------|-------------|
| v1.8-auth-complete | 2025-01-15 14:23:00 | abc123f | Authentication system shipped |
| v1.1-api-mvp | 2025-01-20 09:45:12 | def456a | API MVP with core endpoints |
| v2.0-dashboard | 2025-01-27 16:30:45 | ghi789b | Dashboard feature complete |

## Archive Locations

All archived milestones live in `.planning/history/{milestone-name}/`

## Usage

To view archived milestone:
```bash
cd .planning/history/v1.8-auth-complete
cat ROADMAP.md
```

To restore (manual process):
```bash
# Backup current state first
cp -r .planning .planning-backup

# Copy archive back
cp -r .planning/history/v1.8-auth-complete/* .planning/

# Remove archived copy
rm -rf .planning/history/v1.8-auth-complete
```
```

### Pattern 4: Suggested Workflow Transitions

**What:** Commands suggest next logical steps without forcing them

**When to use:** End of workflows where common next actions exist

**Trade-offs:**
- **Pro:** Guides users through happy path
- **Pro:** Non-intrusive; user can ignore
- **Con:** Suggestions can become stale if workflow changes

**Example:**
```markdown
# End of verify-work.md workflow

## Success Path

All tests passed! ✅

**Suggested next steps:**
1. Run `gsd:archive-milestone` to archive this milestone
2. Run `gsd:map-codebase` to refresh codebase documentation
3. Start next milestone with `gsd:new-milestone`

User can proceed with any command or ignore suggestions.
```

## Data Flow

### Archive Milestone Flow

```
[User: gsd:archive-milestone v1.8]
    ↓
[Command Loader] → [archive-milestone.md]
    ↓
[Workflow: archive-milestone.md]
    ↓
┌─────────────────────────────────────────────┐
│ 1. Validate git clean                       │
│    bash tool: git status                    │
│    Exit if dirty                            │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 2. Determine milestone name                 │
│    Use arg or generate from PROJECT.md      │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 3. Create archive directory                 │
│    bash: mkdir -p .planning/history/v1.8    │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 4. Move files to archive                    │
│    bash: mv .planning/ROADMAP.md            │
│          .planning/history/v1.8/            │
│    Repeat for: STATE, PROJECT, REQUIREMENTS,│
│                research/, phases/           │
│    SKIP: codebase/ (stays active)           │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 5. Update MILESTONES.md                     │
│    Read existing (or create new)            │
│    Append row: v1.8, timestamp, commit hash │
│    Write back                               │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 6. Commit archive                           │
│    bash: git add .planning/                 │
│          git commit -m "Archive: v1.8"      │
└──────────────┬──────────────────────────────┘
               ↓
[Return success + suggestion to refresh map]
```

### Map Codebase Flow (with Exclusions)

```
[User: gsd:map-codebase]
    ↓
[Command Loader] → [map-codebase.md]
    ↓
[Workflow: map-codebase.md]
    ↓
┌─────────────────────────────────────────────┐
│ 1. Load exclusion config (optional)         │
│    Read .planning/map-config.json           │
│    Default: [.claude, .github, node_modules,│
│             .git, dist, build, coverage]    │
└──────────────┬──────────────────────────────┘
               ↓
┌─────────────────────────────────────────────┐
│ 2. Spawn 4 parallel agents                  │
│    Task tool × 4 (run_in_background: true)  │
│                                             │
│    ┌──────────┐  ┌───────────┐             │
│    │ Tech     │  │ Arch      │             │
│    │ Focus    │  │ Focus     │             │
│    └────┬─────┘  └────┬──────┘             │
│         │             │                     │
│    ┌────┴─────────────┴──────┐             │
│    │ Agent: gsd-codebase-    │             │
│    │        mapper           │             │
│    │ Tools: bash, grep, glob │             │
│    │ Exclusions: from config │             │
│    └─────────┬───────────────┘             │
│              ↓                              │
│    Write directly to:                       │
│    .planning/codebase/STACK.md              │
│    .planning/codebase/INTEGRATIONS.md       │
│    .planning/codebase/ARCHITECTURE.md       │
│    .planning/codebase/STRUCTURE.md          │
│                                             │
│    ┌──────────┐  ┌───────────┐             │
│    │ Quality  │  │ Concerns  │             │
│    │ Focus    │  │ Focus     │             │
│    └────┬─────┘  └────┬──────┘             │
│         │             │                     │
│    (same agent, different focus)            │
│         ↓             ↓                     │
│    CONVENTIONS.md  CONCERNS.md              │
│    TESTING.md                               │
└──────────────┬──────────────────────────────┘
               ↓
[Orchestrator receives confirmations only]
[Returns success with line counts]
```

### Verify-to-Archive Transition Flow

```
[User: gsd:verify-work]
    ↓
[verify-work.md workflow]
    ↓
┌─────────────────────────────────────────────┐
│ 1. Load test cases from SUMMARY files       │
│ 2. Run tests (parallel gsd-verifier agents) │
│ 3. Check results                            │
└──────────────┬──────────────────────────────┘
               ↓
         ┌─────┴──────┐
         │ All Pass?  │
         └─────┬──────┘
               │
        ┌──────┴─────────┐
        │ NO             │ YES
        ↓                ↓
  ┌──────────┐    ┌──────────────────┐
  │ Diagnose │    │ Success! ✅       │
  │ Failures │    │                  │
  │ Create   │    │ **Suggestion:**  │
  │ Fix Plan │    │ gsd:archive-     │
  └──────────┘    │ milestone        │
                  │                  │
                  │ gsd:map-codebase │
                  │ (if significant  │
                  │  changes)        │
                  └──────────────────┘
```

### Key Data Flows

1. **Archive Creation Flow:** Command → Workflow → Validate → Move Files → Update Registry → Commit → Suggest Refresh
2. **Codebase Mapping Flow:** Command → Workflow → Load Config → Spawn Agents (parallel) → Agents Write Directly → Return Confirmations
3. **Verification-to-Archive Flow:** Verify → Pass → Suggest Archive → User Decides → Archive (if accepted)
4. **State Isolation:** `.planning/codebase/` stays active across milestones; `.planning/history/` contains snapshots

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 1-10 milestones | Current architecture is perfect; MILESTONES.md is easily scannable |
| 10-50 milestones | Consider grouping in MILESTONES.md by year or major version |
| 50-100 milestones | Archive older milestones to `.planning/history/archived/{year}/` for performance |
| 100+ milestones | Consider external archival system or database for metadata; keep recent 20 in .planning/history/ |

### Scaling Priorities

1. **First bottleneck:** MILESTONES.md becomes unwieldy to scan
   - **Fix:** Add summary sections (e.g., "2024 Milestones", "2025 Milestones")
   - **Fix:** Add search command: `gsd:find-milestone [query]`

2. **Second bottleneck:** `.planning/history/` grows too large
   - **Fix:** Implement tiered archival (recent 20 local, older on S3/cloud)
   - **Fix:** Add `.planning/history/.gitignore` for old archives

## Anti-Patterns

### Anti-Pattern 1: Archiving .planning/codebase/

**What people do:** Move `.planning/codebase/` into milestone archive

**Why it's wrong:** Codebase documentation is living and applies to the CURRENT codebase, not a past milestone. It should evolve continuously via `map-codebase` refreshes.

**Do this instead:**
- Keep `.planning/codebase/` outside archives
- Use `gsd:map-codebase` after significant changes to refresh documentation
- If you need historical codebase state, use git tags and checkout

### Anti-Pattern 2: Manual File Moving

**What people do:** Manually `mv` files to create archives instead of using `gsd:archive-milestone`

**Why it's wrong:**
- Forgets to update MILESTONES.md registry
- Inconsistent naming conventions
- No git commit message convention
- Easy to accidentally delete files

**Do this instead:**
- Always use `gsd:archive-milestone` command
- Command ensures atomic operation (all-or-nothing)
- Consistent metadata tracking in registry

### Anti-Pattern 3: Creating Archive Before Verification

**What people do:** Archive milestone immediately after completing work, before running `gsd:verify-work`

**Why it's wrong:**
- Archiving unverified work creates misleading "complete" milestones
- Rework after verification requires manual archive updates
- Loses the "archive = shipped" semantic

**Do this instead:**
- Workflow: Complete work → Verify → Archive
- Only archive after `gsd:verify-work` passes all tests
- Archive represents "actually complete and tested" not "we think it's done"

### Anti-Pattern 4: Archiving with Uncommitted Changes

**What people do:** Run `gsd:archive-milestone` with dirty git state

**Why it's wrong:**
- Archive commit doesn't represent true snapshot
- Uncommitted changes might be lost or forgotten
- Hard to correlate archive with exact code state

**Do this instead:**
- `archive-milestone` workflow validates git status FIRST
- Fails early if dirty
- Forces user to commit or stash before archiving

### Anti-Pattern 5: Over-Configuring map-codebase Exclusions

**What people do:** Create complex `.planning/map-config.json` with 50+ exclusion rules

**Why it's wrong:**
- Maintenance burden
- Risk of excluding important directories
- Premature optimization (default exclusions cover 95% of cases)

**Do this instead:**
- Use default exclusions unless specific need
- Only add exclusions for large generated directories
- Document WHY each custom exclusion exists

## Integration Points

### External Services

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| Git | Direct `bash` tool invocation | Used for validation (git status), commits (git add/commit), tagging (optional) |
| File System | Direct `bash` tool (mkdir, mv, cp) | All state is file-based in `.planning/` |
| Task Tool (Claude Code/Copilot CLI) | Agent Registry + CLI Adapters | Spawns parallel agents; abstracts underlying CLI differences |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| Command ↔ Workflow | Execution context (`@workflow.md`) | Commands delegate to workflows; workflows contain process logic |
| Workflow ↔ Agent | Task tool with structured prompt | Workflows spawn agents; agents write directly to state files |
| Workflow ↔ State Files | Direct file I/O (bash read/write) | `.planning/` is single source of truth; no in-memory cache |
| MILESTONES.md ↔ history/ | Filename reference | Registry points to directory names; no symbolic links |
| Agents ↔ .planning/codebase/ | Direct file write | Agents write documents; orchestrator receives confirmations only |

## Build Order Recommendations

Based on dependencies, recommended implementation sequence:

### Phase 1: State Management Foundation
1. **Create MILESTONES.md schema** — Define table structure, validation rules
2. **Create .planning/history/ structure** — Define archive naming conventions
3. **Add `.planning/codebase/` to .gitignore exclusion** — Ensure it's not archived

### Phase 2: Archive Command & Workflow
4. **Implement archive-milestone.md workflow** — Core archival logic
5. **Implement archive-milestone.md command** — Entry point
6. **Add git validation** — Ensure clean state before archive
7. **Add registry update logic** — Atomic MILESTONES.md updates

### Phase 3: Map-Codebase Enhancements
8. **Create .planning/map-config.json schema** — Define exclusion format
9. **Modify map-codebase.md workflow** — Load config, pass to agents
10. **Modify gsd-codebase-mapper agent** — Accept and apply exclusions

### Phase 4: Integration Points
11. **Modify verify-work.md** — Add suggestion to archive on success
12. **Add archive suggestion to verify-milestone.md** — Guide user flow
13. **Test archive-verify-map cycle** — E2E workflow validation

### Phase 5: Quality of Life
14. **Add `gsd:list-milestones` command** — Quick registry viewer
15. **Add archive restore documentation** — Manual process guide
16. **Add example configurations** — Sample .planning/map-config.json

## Sources

**Architecture Patterns:**
- Microsoft .NET CLI Design Guidance (2025): https://learn.microsoft.com/en-us/dotnet/standard/commandline/design-guidance
- PatternFly CLI Handbook (2025): https://www.patternfly.org/developer-resources/cli-handbook/
- Better CLI Design Guide (2025): https://bettercli.org/

**State Management:**
- State Design Pattern (GeeksforGeeks, 2025): https://www.geeksforgeeks.org/system-design/state-design-pattern/
- Command Pattern in 2025 (Dev.to): https://dev.to/anna_golubkova/how-does-the-command-pattern-simplify-code-in-2025-3i5j
- Scopecraft Command (Markdown-based task management): https://github.com/scopecraft/command

**File Organization:**
- Document Archiving Best Practices (NotionSender, 2025): https://www.notionsender.com/blog/post/document-archiving-best-practices
- Project Artifact Archiving (Rosemet): https://www.rosemet.com/project-artifact-archiving/
- Data Archiving Strategies (Compresto, 2025): https://compresto.app/blog/data-archiving-best-practices

**Existing Codebase:**
- GSD CLI codebase exploration (internal, 2025-01-27)
- Current command/workflow patterns in `.github/skills/get-shit-done/`
- Existing agent orchestration in `agents/gsd-codebase-mapper.md`

---
*Architecture research for: Milestone Management & Codebase Analysis Integration*
*Researched: 2025-01-27*
*Confidence: HIGH (verified with current codebase exploration + 2025 best practices)*
