# What is GSD?

> This documentation provides an overview of GSD concepts. For the complete, authoritative GSD documentation including latest developments, visit [get-shit-done](https://github.com/glittercowboy/get-shit-done).

**Get Shit Done (GSD)** is a spec-driven development workflow for AI coding assistants. It provides structured skills
and agents that guide AI through project planning, implementation, and verification.

## The Problem

AI coding assistants are powerful but can be chaotic:

- Jump between tasks without finishing
- Skip planning and verification steps
- Make changes without documentation
- Lack systematic approach to large projects

## The Solution

GSD provides a **structured workflow** that AI assistants follow:

1. **Research** the domain and libraries
2. **Plan** phases and tasks systematically
3. **Execute** plans with atomic commits
4. **Verify** goals were achieved
5. **Document** decisions and outcomes

## How It Works

GSD installs **skills** (commands you invoke) and **agents** (specialized sub-agents) to your AI assistant:

- Skills: `/gsd-plan-phase`, `/gsd-execute-phase`, `/gsd-verify-phase`
- Agents: gsd-planner, gsd-executor, gsd-verifier

When you run a skill, the AI assistant:

1. Loads the skill definition
2. Follows the structured workflow
3. Spawns specialized agents for complex tasks
4. Creates artifacts in `.planning/` directory
5. Commits progress to git

## Key Concepts

### Phases

Logical groupings of work (e.g., "Phase 1: Setup", "Phase 2: Core Features")

### Plans

Executable task lists within a phase (e.g., "01-01-PLAN.md", "01-02-PLAN.md")

### Summaries

Post-execution documentation of what was built (e.g., "01-01-SUMMARY.md")

### Verification

Goal-backward analysis ensuring phase objectives were achieved

### .planning/ Directory

Central repository for all project artifacts:

```text
.planning/
├── ROADMAP.md        # Project phases and goals
├── REQUIREMENTS.md   # Requirements traceability
├── STATE.md          # Current project state
└── phases/
    └── 01-setup/
        ├── 01-01-PLAN.md
        ├── 01-01-SUMMARY.md
        └── 01-VERIFICATION.md
```

## Benefits

**For Solo Developers:**

- Systematic approach to large projects
- Documentation generated automatically
- Clear progress tracking
- AI stays focused on goals

**For Teams:**

- Consistent development workflow
- Clear project history in git
- Easy onboarding (read .planning/)
- Traceability from requirements to code

**For AI Assistants:**

- Structured prompts reduce hallucination
- Goal-backward verification ensures correctness
- Specialized agents handle complex tasks
- Atomic commits enable rollback

## Multi-Platform Support

GSD Multi supports three AI platforms:

- **Claude Code** - VS Code extension
- **GitHub Copilot CLI** - Command-line tool
- **Codex CLI** - OpenAI Codex interface

All platforms provide the same GSD workflow. Choose based on your AI assistant preference.

**About GSD Multi:**

GSD Multi is a template installer that deploys GSD skills and agents to multiple platforms. Starting v2.0.0, this repository focuses solely on multi-platform deployment—all new capabilities are developed in the [original get-shit-done repository](https://github.com/glittercowboy/get-shit-done) and synced here.

## Next Steps

- [How GSD Works](how-gsd-works.md) - Detailed workflow explanation
- [How to Install](how-to-install.md) - Get started with installation
- [What Gets Installed](what-gets-installed.md) - Understand skills and agents
