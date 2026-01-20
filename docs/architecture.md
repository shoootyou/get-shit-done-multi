# Why It Works: GSD Architecture

This document explains the technical principles that make GSD reliable and effective.

## Table of Contents

- [Context Engineering](#context-engineering)
- [XML Prompt Formatting](#xml-prompt-formatting)
- [Multi-Agent Orchestration](#multi-agent-orchestration)
- [Atomic Git Commits](#atomic-git-commits)
- [Modular by Design](#modular-by-design)
- [Cross-Platform Compatibility](#cross-platform-compatibility)

---

## Context Engineering

AI coding assistants are incredibly powerful *if* you give them the context they need. Most people don't.

GSD handles it for you automatically.

### The Context Problem

As context windows fill up, AI quality degrades:
- Earlier information gets "forgotten"
- Responses become less precise
- Hallucinations increase
- Performance slows down

**GSD's Solution:** Fresh context windows for heavy lifting, structured files for persistence.

### Context Files

Every piece of information has a home:

| File | Purpose | Size Limit | When Loaded |
|------|---------|------------|-------------|
| `PROJECT.md` | Project vision, core constraints | 2 KB | Always |
| `REQUIREMENTS.md` | Scoped v1/v2 requirements with phase traceability | 4 KB | Planning, execution |
| `ROADMAP.md` | Phases, what's done, what's next | 3 KB | Navigation, planning |
| `STATE.md` | Current decisions, blockers, position | 2 KB | Session restore |
| `{phase}-CONTEXT.md` | User's implementation preferences | 3 KB | Planning, execution for that phase |
| `{phase}-RESEARCH.md` | Ecosystem knowledge for the phase | 5 KB | Planning that phase |
| `{phase}-PLAN.md` | Atomic task with XML structure | 4 KB | Executing that plan |
| `{phase}-SUMMARY.md` | What happened, what changed | 2 KB | Historical reference |
| `{phase}-VERIFICATION.md` | Automated verification results | 2 KB | After execution |
| `{phase}-UAT.md` | User acceptance test results | 3 KB | After verification |
| `.planning/research/` | Domain research from parallel agents | 20 KB total | Initial planning |
| `.planning/todos/` | Captured ideas for later | No limit | When reviewing |

**Key Principle:** Size limits based on where AI quality degrades. Stay under limits, get consistent excellence.

### Context Loading Strategy

Different commands load different contexts:

**Planning Phase:**
```
Load: PROJECT.md, REQUIREMENTS.md, ROADMAP.md, {phase}-CONTEXT.md, .planning/research/
Skip: Summaries, verification, other phases
```

**Executing Plan:**
```
Load: PROJECT.md, {phase}-CONTEXT.md, {phase}-RESEARCH.md, THIS-PLAN.md
Skip: Everything else - fresh 200k token context for work
```

**Verification:**
```
Load: PROJECT.md, REQUIREMENTS.md, {phase}-CONTEXT.md, git diff output
Skip: Plans, research
```

This ensures AI always has exactly what it needs, nothing more.

---

## XML Prompt Formatting

GSD uses XML-structured prompts optimized for Claude's architecture (and compatible with other models).

### Why XML?

1. **Structured Parsing** — AI models handle XML better than unstructured text
2. **Clear Boundaries** — Sections don't bleed into each other
3. **Validation** — Can verify structure before sending
4. **Consistency** — Same format = predictable results

### Plan Structure

Every plan follows this XML format:

```xml
<plan phase="01" plan_number="1">
  <goal>Create user authentication endpoint</goal>
  
  <context>
    User wants: JWT-based auth, httpOnly cookies, 7-day sessions by default
    Research shows: jose library preferred over jsonwebtoken (ESM compatibility)
  </context>
  
  <task type="auto">
    <name>Create login endpoint</name>
    <files>src/app/api/auth/login/route.ts</files>
    <action>
      POST /api/auth/login
      - Accept { email, password, rememberMe? }
      - Validate credentials against users table
      - Use jose for JWT (not jsonwebtoken - CommonJS issues)
      - Return httpOnly cookie
      - 7 days if rememberMe, 1 day otherwise
    </action>
    <verify>
      curl -X POST localhost:3000/api/auth/login \
        -d '{"email":"test@example.com","password":"test123"}' \
      Returns 200 + Set-Cookie header
    </verify>
    <done>
      Valid credentials return cookie with JWT
      Invalid credentials return 401 with clear error
      Cookie is httpOnly and secure in production
    </done>
  </task>
  
  <task type="manual">
    <name>Configure email service for password reset</name>
    <action>
      1. Sign up for SendGrid account
      2. Generate API key
      3. Add SENDGRID_API_KEY to .env
      4. Update .env.example
    </action>
    <done>
      Environment configured
      API key verified with test send
      Documentation updated
    </done>
  </task>
</plan>
```

### Task Types

**`type="auto"`** — AI executes automatically:
- Code changes
- File creation
- Running tests
- Database migrations

**`type="manual"`** — Requires human action:
- External service setup
- API key generation
- DNS configuration
- Payment setup

### Verification Built-In

Every auto task includes `<verify>` — a command to test that the task worked:

```xml
<verify>npm test -- auth.test.ts</verify>
<verify>curl -I http://localhost:3000/api/health</verify>
<verify>git diff --name-only | grep migration</verify>
```

Executor runs verification after each task. If it fails, it debugs and fixes before moving on.

---

## Multi-Agent Orchestration

GSD uses specialized agents for different tasks. Orchestrators coordinate, agents execute.

### The Pattern

```
┌──────────────────────────────────────┐
│  Orchestrator (Thin)                 │
│  - Spawns agents                     │
│  - Collects results                  │
│  - Routes to next step               │
│  - Stays in main context (light)     │
└──────────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        ↓                   ↓
┌──────────────┐    ┌──────────────┐
│ Agent 1      │    │ Agent 2      │
│ (Fresh ctx)  │    │ (Fresh ctx)  │
│ - Heavy work │    │ - Heavy work │
│ - 200k ctx   │    │ - 200k ctx   │
└──────────────┘    └──────────────┘
```

**Key Insight:** Orchestrator never does heavy lifting. It spawns agents with fresh contexts, waits, integrates results.

### Agent Types

| Agent | Responsibility | Context Size |
|-------|---------------|--------------|
| `gsd-project-researcher` | Research domain before roadmap | 200k tokens |
| `gsd-research-synthesizer` | Combine research from 4 parallel researchers | 200k tokens |
| `gsd-roadmapper` | Create roadmap with phase breakdown | 200k tokens |
| `gsd-phase-researcher` | Research how to implement a phase | 200k tokens |
| `gsd-planner` | Create atomic task plans | 200k tokens |
| `gsd-plan-checker` | Verify plans will achieve goals | 200k tokens |
| `gsd-executor` | Execute a single plan with fresh context | 200k tokens |
| `gsd-verifier` | Check codebase against phase goals | 200k tokens |
| `gsd-debugger` | Systematic debugging with scientific method | 200k tokens |
| `gsd-integration-checker` | Verify cross-phase integration | 200k tokens |
| `gsd-codebase-mapper` | Analyze existing codebase | 200k tokens |

### Orchestration Stages

**1. Research Stage**

```
/gsd:new-project orchestrator
  ├─> spawns: gsd-project-researcher (stack)
  ├─> spawns: gsd-project-researcher (features)
  ├─> spawns: gsd-project-researcher (architecture)
  └─> spawns: gsd-project-researcher (pitfalls)
       └─> waits for all 4 to complete
           └─> spawns: gsd-research-synthesizer
               └─> creates: .planning/research/SUMMARY.md
```

**2. Planning Stage**

```
/gsd:plan-phase orchestrator
  └─> spawns: gsd-phase-researcher
      └─> creates: {phase}-RESEARCH.md
          └─> spawns: gsd-planner
              └─> creates: {phase}-01-PLAN.md
                  └─> spawns: gsd-plan-checker
                      └─> if fails: loop to planner
                          └─> if passes: next plan
```

**3. Execution Stage**

```
/gsd:execute-phase orchestrator
  ├─> groups plans into waves (parallel/sequential)
  ├─> Wave 1: [01-01, 01-02] (parallel)
  │   ├─> spawns: gsd-executor (01-01)
  │   └─> spawns: gsd-executor (01-02)
  └─> Wave 2: [01-03] (depends on Wave 1)
      └─> spawns: gsd-executor (01-03)
          └─> spawns: gsd-verifier
              └─> creates: {phase}-VERIFICATION.md
```

### The Result

Your main context window stays at **30-40%** even during massive operations:
- Deep research across 4 domains
- Multiple plans created and verified
- Thousands of lines of code written
- Automated verification

All the heavy work happens in fresh subagent contexts.

---

## Atomic Git Commits

Each task gets its own commit immediately after completion.

### Commit Format

```
<type>(phase-plan): <description>

Examples:
feat(01-01): create users table migration
feat(01-02): implement login endpoint
fix(01-02): handle invalid credentials error
docs(01-03): add password reset documentation
test(01-01): add user model validation tests
```

### Why Atomic Commits?

1. **Git Bisect** — Find exact failing task
2. **Independent Revert** — Undo specific task without touching others
3. **Clear History** — AI can understand what happened in future sessions
4. **Observability** — See progress in real-time via `git log`
5. **Collaboration** — Clear commits for code review

### Example History

```bash
$ git log --oneline

abc123f docs(08-02): complete user registration plan
def456g feat(08-02): add email confirmation flow
ghi789j feat(08-02): implement password hashing
klm012n feat(08-02): create registration endpoint
opq345r feat(08-01): add user validation middleware
stu678v feat(08-01): create user model
```

Each commit is:
- **Surgical** — Changes only what that task needs
- **Traceable** — Phase and plan number in message
- **Meaningful** — Clear what was done

### Auto-Commit on Task Completion

Executor pattern:
```
1. Read task from plan
2. Execute action
3. Run verification
4. If verification passes:
   - git add (files from task)
   - git commit -m "type(phase-plan): task name"
5. Move to next task
```

No manual commits. No forgetting to commit. Every task = one commit.

---

## Modular by Design

GSD doesn't lock you into a rigid workflow. It's designed for flexibility.

### You Can:

**Add phases to current milestone**
```
/gsd:add-phase "Add real-time notifications"
```

**Insert urgent work between phases**
```
/gsd:insert-phase 3 "Fix critical security vulnerability"
```
(Renumbers phases 3+ automatically)

**Complete milestones and start fresh**
```
/gsd:complete-milestone
/gsd:new-milestone "v2.0 - Social Features"
```

**Adjust plans without rebuilding everything**
- Edit `{phase}-PLAN.md` directly
- Re-run `/gsd:execute-phase N` with modified plans
- System adapts

**Skip steps when appropriate**
```
/gsd:discuss-phase 5  # Optional - skip if defaults are fine
/gsd:plan-phase 5
/gsd:execute-phase 5
```

**Work on multiple milestones**
```
/gsd:archive-milestone
# Work on something else
/gsd:restore-milestone "v1.0"
```

### No Lock-In

- Plans are markdown files — edit in any editor
- State is in git — full version control
- Agents are stateless — no hidden state
- Documentation is portable — works across CLIs

You're never locked in. The system adapts to you.

---

## Cross-Platform Compatibility

GSD works on **three different AI coding assistants** with the same workflow.

### Architecture Differences

| Platform | Command System | Agent System | File Location |
|----------|---------------|--------------|---------------|
| **Claude Code** | Slash commands (`/gsd:*`) | `.agent.md` files in `.agent/` | `.claude/` or `~/.claude/` |
| **GitHub Copilot CLI** | Skills (conversational) | `.agent.md` files in `.github/agents/` | `.github/skills/` |
| **Codex CLI** | Skills (conversational) | Skill-based agents | `.codex/skills/` |

### Same Workflow, Different Syntax

**Claude Code:**
```
/gsd:new-project
/gsd:plan-phase 1
/gsd:execute-phase 1
```

**GitHub Copilot CLI:**
```
Hey, can you run gsd:new-project?
Now plan phase 1
Execute it
```

**Codex CLI:**
```
Start a new GSD project
Plan the first phase
Execute that phase
```

### Unified Agent Definitions

All platforms use the same agent definitions:
- Same prompts
- Same context loading
- Same verification steps
- Same output format

**Agent file locations:**
- Claude Code: `.agent/gsd-executor.agent.md`
- Copilot CLI: `.github/agents/gsd-executor.agent.md`
- Codex CLI: `.codex/agents/gsd-executor.agent.md`

But the agent logic is identical across all three.

### Portable Projects

Projects created with one CLI work with another:
- Planning files are the same
- Git history is the same
- Verification works the same

Switch CLIs mid-project without issues.

---

## Performance Characteristics

### Context Window Usage

| Operation | Main Context | Agent Contexts | Total |
|-----------|-------------|----------------|-------|
| `/gsd:new-project` | 35% | 4 × 200k | ~800k |
| `/gsd:plan-phase` | 30% | 3 × 200k | ~600k |
| `/gsd:execute-phase` | 25% | N × 200k | Variable |
| `/gsd:verify-work` | 40% | 2 × 200k | ~400k |

Main context stays light because heavy work is delegated.

### Execution Time

Typical phase (with 3 plans, 15 tasks total):

| Step | Duration | Can Work In Parallel |
|------|----------|---------------------|
| Discuss | 5-10 min | No (interactive) |
| Research | 3-5 min | Yes (1 agent) |
| Planning | 10-15 min | Yes (planner + checker loop) |
| Execution | 20-40 min | Yes (wave-based) |
| Verification | 5-10 min | Partially |
| **Total** | **45-80 min** | — |

Most time is execution. You can walk away during execute — it commits atomically and summarizes results.

---

## Next Steps

- **See the workflow:** [How It Works](how-it-works.md)
- **Try it yourself:** [Quick Start Guide](../README.md#getting-started)
- **All commands:** [Command Reference](commands/README.md)
- **Troubleshooting:** [Common Issues](troubleshooting.md)
