# How It Works

This guide walks through the complete GSD workflow from project initialization to milestone completion.

## Table of Contents

- [Before You Start: Brownfield Projects](#before-you-start-brownfield-projects)
- [Step 1: Initialize Project](#step-1-initialize-project)
- [Step 2: Discuss Phase](#step-2-discuss-phase)
- [Step 3: Plan Phase](#step-3-plan-phase)
- [Step 4: Execute Phase](#step-4-execute-phase)
- [Step 5: Verify Work](#step-5-verify-work)
- [Step 6: Complete & Continue](#step-6-complete--continue)
- [The Complete Cycle](#the-complete-cycle)

---

## Before You Start: Brownfield Projects

> **Already have code?** Run `/gsd-map-codebase` first. It spawns parallel agents to analyze your stack, architecture, conventions, and concerns. Then `/gsd-new-project` knows your codebase — questions focus on what you're adding, and planning automatically loads your patterns.

---

## Step 1: Initialize Project

```
/gsd-new-project
```

One command, one flow. The system:

1. **Questions** — Asks until it understands your idea completely (goals, constraints, tech preferences, edge cases)
2. **Research** — Spawns parallel agents to investigate the domain (optional but recommended)
3. **Requirements** — Extracts what's v1, v2, and out of scope
4. **Roadmap** — Creates phases mapped to requirements

You approve the roadmap. Now you're ready to build.

**Creates:** `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `.planning/research/`

**Example Output:**

```
✓ Understanding your project...
✓ Researching domain (4 parallel agents)
✓ Extracting requirements (v1: 12 requirements, v2: 8 requirements)
✓ Creating roadmap (8 phases)

Your project is ready to build.
Next: /gsd-discuss-phase 1
```

---

## Step 2: Discuss Phase

```
/gsd-discuss-phase 1
```

**This is where you shape the implementation.**

Your roadmap has a sentence or two per phase. That's not enough context to build something the way *you* imagine it. This step captures your preferences before anything gets researched or planned.

The system analyzes the phase and identifies gray areas based on what's being built:

- **Visual features** → Layout, density, interactions, empty states
- **APIs/CLIs** → Response format, flags, error handling, verbosity
- **Content systems** → Structure, tone, depth, flow
- **Organization tasks** → Grouping criteria, naming, duplicates, exceptions

For each area you select, it asks until you're satisfied. The output — `CONTEXT.md` — feeds directly into the next two steps:

1. **Researcher reads it** — Knows what patterns to investigate ("user wants card layout" → research card component libraries)
2. **Planner reads it** — Knows what decisions are locked ("infinite scroll decided" → plan includes scroll handling)

The deeper you go here, the more the system builds what you actually want. Skip it and you get reasonable defaults. Use it and you get *your* vision.

**Creates:** `{phase}-CONTEXT.md`

**Example Interaction:**

```
Phase 01: User authentication system

I've identified 4 areas where your input would help:

1. Login flow & experience
2. Error handling & security
3. Session management
4. Password reset flow

Which areas would you like to discuss? (Select all that apply)
→ 1, 2, 4

[Area 1: Login flow & experience]

How should users log in?
→ Email + password, with option for OAuth later

Should there be "Remember me" functionality?
→ Yes, default to 7 days

What happens after successful login?
→ Redirect to dashboard, or original destination if they came from protected route

[Continues for each selected area...]

✓ Context captured in 01-CONTEXT.md
Next: /gsd-plan-phase 1
```

---

## Step 3: Plan Phase

```
/gsd-plan-phase 1
```

The system:

1. **Researches** — Investigates how to implement this phase, guided by your CONTEXT.md decisions
2. **Plans** — Creates 2-3 atomic task plans with XML structure
3. **Verifies** — Checks plans against requirements, loops until they pass

Each plan is small enough to execute in a fresh context window. No degradation, no "I'll be more concise now."

**Creates:** `{phase}-RESEARCH.md`, `{phase}-{N}-PLAN.md`

**Example Plan Structure:**

```xml
<plan phase="01" plan_number="1">
  <goal>Implement user authentication database schema and models</goal>
  
  <task type="auto">
    <name>Create users table migration</name>
    <files>prisma/migrations/001_create_users.sql</files>
    <action>
      Create users table with:
      - id (uuid, primary key)
      - email (unique, not null)
      - password_hash (not null)
      - created_at, updated_at
    </action>
    <verify>prisma migrate status shows migration pending</verify>
    <done>Users table created, migration file committed</done>
  </task>
  
  <task type="auto">
    <name>Create session model</name>
    <files>src/models/session.ts</files>
    <action>
      TypeScript interface for session:
      - sessionId, userId, expiresAt
      - Methods: isValid(), extend()
    </action>
    <verify>TypeScript compiles without errors</verify>
    <done>Session model exported and typed</done>
  </task>
</plan>
```

---

## Step 4: Execute Phase

```
/gsd-execute-phase 1
```

The system:

1. **Runs plans in waves** — Parallel where possible, sequential when dependent
2. **Fresh context per plan** — 200k tokens purely for implementation, zero accumulated garbage
3. **Commits per task** — Every task gets its own atomic commit
4. **Verifies against goals** — Checks the codebase delivers what the phase promised

Walk away, come back to completed work with clean git history.

**Creates:** `{phase}-{N}-SUMMARY.md`, `{phase}-VERIFICATION.md`

**Example Git History:**

```bash
abc123f docs(01-01): complete user authentication schema plan
def456g feat(01-01): create users table migration
ghi789j feat(01-01): create session model
jkl012k feat(01-02): implement login endpoint
mno345l feat(01-02): add JWT generation
pqr678m feat(01-02): implement session middleware
```

**Example Summary Output:**

```
✓ Wave 1: Plans 01-01, 01-02 (parallel)
  - 01-01: Database schema ✓ (6 tasks, 3 files modified)
  - 01-02: Login endpoint ✓ (4 tasks, 2 files created)

✓ Wave 2: Plan 01-03 (depends on 01-02)
  - 01-03: Password reset flow ✓ (5 tasks, 4 files modified)

✓ Verification against phase goals:
  - Users can create account ✓
  - Users can log in ✓
  - Sessions persist across page loads ✓
  - Password reset works ✓

Phase 01 complete. Next: /gsd-verify-work 1
```

---

## Step 5: Verify Work

```
/gsd-verify-work 1
```

**This is where you confirm it actually works.**

Automated verification checks that code exists and tests pass. But does the feature *work* the way you expected? This is your chance to use it.

The system:

1. **Extracts testable deliverables** — What you should be able to do now
2. **Walks you through one at a time** — "Can you log in with email?" Yes/no, or describe what's wrong
3. **Diagnoses failures automatically** — Spawns debug agents to find root causes
4. **Creates verified fix plans** — Ready for immediate re-execution

If everything passes, you move on. If something's broken, you don't manually debug — you just run `/gsd-execute-phase` again with the fix plans it created.

**Creates:** `{phase}-UAT.md`, fix plans if issues found

**Example Interaction:**

```
Phase 01 Verification: User Authentication

I've identified 5 testable deliverables:

[1/5] Can you create a new account?
→ Yes

[2/5] Can you log in with valid credentials?
→ Yes

[3/5] Does invalid password show error?
→ No - it shows generic "server error" instead of "invalid credentials"

  Diagnosing issue...
  ✓ Root cause: Error handler not catching AuthenticationError
  ✓ Fix plan created: 01-FIX-01-PLAN.md

[4/5] Does session persist after page refresh?
→ Yes

[5/5] Can you reset password via email?
→ No - email is not being sent

  Diagnosing issue...
  ✓ Root cause: Email service not configured in production
  ✓ Fix plan created: 01-FIX-02-PLAN.md

Results:
- 3/5 deliverables working
- 2 issues found
- 2 fix plans ready

Next steps:
1. Review fix plans (01-FIX-01-PLAN.md, 01-FIX-02-PLAN.md)
2. Run: /gsd-execute-phase 1 --fixes-only
3. Re-run: /gsd-verify-work 1
```

---

## Step 6: Complete & Continue

### Loop Through Phases

```
/gsd-discuss-phase 2
/gsd-plan-phase 2
/gsd-execute-phase 2
/gsd-verify-work 2
...
```

Repeat **discuss → plan → execute → verify** for each phase in your roadmap.

Each phase gets:
- Your input (discuss)
- Proper research (plan)
- Clean execution (execute)
- Human verification (verify)

Context stays fresh. Quality stays high.

---

### Complete Milestone

```
/gsd-complete-milestone
```

When all phases are done, this command:
1. Archives the milestone to `.planning/archive/{milestone}/`
2. Creates a git tag for the release
3. Updates STATE.md

**Example:**

```
Completing milestone: v1.0 - User Authentication & Core Features

✓ Archiving planning files...
✓ Creating git tag: v1.0.0
✓ Updating STATE.md

Milestone complete!

Stats:
- 8 phases completed
- 24 plans executed
- 156 tasks completed
- 342 files modified
- 89 commits created

Next: /gsd-new-milestone
```

---

### Start Next Milestone

```
/gsd-new-milestone v2.0
```

Same flow as `new-project` but for your existing codebase:
1. Describe what you want to build next
2. System researches the domain
3. Scope requirements
4. Create fresh roadmap

Each milestone is a clean cycle: **define → build → ship**.

**Example:**

```
Starting new milestone: v2.0

What do you want to build in this milestone?
→ Add social features: user profiles, following, activity feed

[Research phase runs...]
[Requirements extracted...]
[Roadmap created with 6 new phases...]

✓ Milestone v2.0 ready
✓ 6 phases planned
✓ Mapped to 18 requirements

Next: /gsd-discuss-phase 1
```

---

## The Complete Cycle

```
┌─────────────────────────────────────────────┐
│ 1. INITIALIZE                               │
│    /gsd-new-project                         │
│    → Questions, research, requirements      │
│    → Roadmap with phases                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 2. FOR EACH PHASE                           │
│                                             │
│    /gsd-discuss-phase N                     │
│    → Capture your vision                    │
│                                             │
│    /gsd-plan-phase N                        │
│    → Research + atomic plans                │
│                                             │
│    /gsd-execute-phase N                     │
│    → Build in fresh context                 │
│                                             │
│    /gsd-verify-work N                       │
│    → Manual testing + auto-fix              │
│                                             │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 3. COMPLETE MILESTONE                       │
│    /gsd-complete-milestone                  │
│    → Archive + tag release                  │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│ 4. NEXT VERSION                             │
│    /gsd-new-milestone                       │
│    → Repeat cycle                           │
└─────────────────────────────────────────────┘
```

---

## Tips & Best Practices

### Use discuss-phase Strategically

- **Skip it** when you're okay with defaults
- **Use it** when you have a specific vision
- **Go deep** on areas that matter most to you

### Plan in Small Batches

- Don't plan all phases upfront
- Plan 1-2 phases ahead maximum
- Allows flexibility to adjust based on learnings

### Verify Thoroughly

- Actually use the feature during verify-work
- Don't just check if code exists
- The auto-fix system saves debugging time

### Pause & Resume

Use `/gsd-pause-work` when stopping:
- Mid-phase execution
- Before context switch
- End of work session

Resume with `/gsd-resume-work` to restore exactly where you left off.

### Capture TODOs

When ideas pop up:
```
/gsd-add-todo "Add dark mode support"
/gsd-add-todo "Optimize database queries in user search"
```

Review later with `/gsd-check-todos` when planning new phases.

---

## Next Steps

- **Understand why it works:** [Architecture](architecture.md)
- **Troubleshoot issues:** [Troubleshooting](troubleshooting.md)
- **All commands:** [Command Reference](commands/README.md)
