# Feature Research: Skill Spec System

**Domain:** Command-to-skill migration for GSD system
**Researched:** 2025-01-22
**Confidence:** HIGH

## Feature Landscape

### Table Stakes (Must Have or Migration Fails)

Features that MUST exist in the new spec format for commands to work. Missing any = commands break.

| Feature | Why Expected | Current Usage | Complexity | Risk if Omitted |
|---------|--------------|---------------|------------|-----------------|
| **Frontmatter metadata** | All 29 commands have YAML frontmatter with name, description, allowed-tools | 100% of commands use this | LOW | Commands cannot be invoked - no name/description |
| **@-references** | Commands load context via `@path` syntax (templates, workflows, project state) | 25+ commands use @-references for context loading | MEDIUM | Commands lose required context - will hallucinate or fail |
| **Multi-section structure** | Commands organized into `<objective>`, `<process>`, `<success_criteria>`, etc. | All commands use 3-8 sections each | LOW | Loss of structural clarity - prompts become unorganized |
| **Process subsections** | Many commands have `<step name="X">` blocks or `## Phase N` subsections | 15+ commands use phase/step subsections | MEDIUM | Complex multi-stage commands lose structure |
| **Tool mappings** | `allowed-tools` in frontmatter maps to platform-specific tools | All commands specify tools (Read, Bash, Task, etc.) | MEDIUM | Commands cannot execute - no tool access |
| **Conditional content** | Platform-specific content via `{{#isClaude}}` / `{{#isCopilot}}` | Agent specs use this extensively | MEDIUM | Cannot support multi-platform deployment |
| **Embedded bash blocks** | Process sections contain executable bash with validation logic | 20+ commands use inline bash for checks/validation | LOW | Commands lose validation capabilities |
| **Subagent spawning** | Commands spawn specialized agents via Task tool with structured prompts | 8 commands spawn subagents (research, planning, execution) | HIGH | Orchestration breaks - no parallel work or specialization |
| **Argument handling** | Commands parse `$ARGUMENTS` with flags (`--research`, `--gaps`, `--skip-verify`) | 15+ commands accept arguments/flags | MEDIUM | Commands lose flexibility and modes |
| **Structured returns** | Agents return specific formats (`## RESEARCH COMPLETE`, `## ROADMAP CREATED`) | All subagents use structured returns | HIGH | Orchestrators cannot parse agent results |

**Total table stakes:** 10 features
**Current dependency:** All 29 commands depend on at least 6 of these

### Differentiators (Advanced Features that Improve Quality)

Features that enhance the system but aren't strictly required for basic functionality.

| Feature | Value Proposition | Current Usage | Complexity | Notes |
|---------|-------------------|---------------|------------|-------|
| **Git integration** | Auto-commits with semantic messages after each step | 12 commands use commit blocks | MEDIUM | Provides audit trail and rollback capability |
| **State persistence** | Updates STATE.md, ROADMAP.md to maintain context across sessions | 10 commands update state files | MEDIUM | Enables session recovery after `/clear` |
| **Checkpoint protocol** | Pauses execution for user approval at critical decision points | 5 commands use checkpoints (non-autonomous mode) | HIGH | Enables interactive vs YOLO modes |
| **Wave-based parallelization** | Groups tasks by dependency wave, runs wave in parallel | execute-phase uses wave execution | HIGH | Speeds up execution 3-5x for independent tasks |
| **Verification loops** | Plans verified before execution, phases verified after completion | plan-phase, execute-phase use verification | MEDIUM | Catches issues before context is burned |
| **Context budget awareness** | Plans sized to stay under ~50% context to maintain quality | Planner agents factor context pressure | HIGH | Prevents quality degradation in long executions |
| **Brownfield detection** | Auto-detects existing code and offers codebase mapping | new-project detects code files | MEDIUM | Enables brownfield project onboarding |
| **Research routing** | Optional research step with parallel researchers (Stack, Features, Architecture, Pitfalls) | new-project spawns 4 researchers + synthesizer | HIGH | Domain-aware planning instead of guessing |
| **Todo capture** | Capture ideas mid-work without losing context | add-todo, check-todos commands | LOW | Prevents "I'll remember that" loss |
| **Debug persistence** | Debug sessions survive `/clear` via state files | debug command maintains .planning/debug/ | MEDIUM | Long investigations don't restart from zero |
| **Requirement traceability** | REQ-IDs link requirements → phases → plans → commits | REQUIREMENTS.md has traceability table | MEDIUM | Answers "where did we implement REQ-AUTH-03?" |
| **Gap closure mode** | After verification finds gaps, re-plan to fill them | plan-phase `--gaps` reads VERIFICATION.md | HIGH | Iterative refinement until phase goal met |

**Total differentiators:** 12 features
**High-value subset:** Checkpoint protocol, wave parallelization, verification loops, research routing, gap closure

### Anti-Features (Do NOT Migrate These)

Features from legacy format that should be deliberately excluded or replaced.

| Anti-Feature | Why It Exists in Current | Why Problematic | Better Alternative |
|--------------|-------------------------|-----------------|-------------------|
| **Hard-coded paths** | Commands use `~/.claude/get-shit-done/` paths | Not portable across platforms/installations | Use `@skill-root/` or relative paths |
| **Inline documentation** | Long explanatory comments in command process sections | Bloats context unnecessarily | Move docs to separate reference files, @-reference them |
| **Duplicated logic** | Bash validation repeated across commands | Hard to update, gets out of sync | Extract to reusable workflow snippets |
| **Mixing orchestration and execution** | Some commands both coordinate AND execute work | Confuses responsibility, burns context | Always separate: orchestrator spawns executor |
| **Overly prescriptive UX** | Commands dictate exact banner format, emoji usage | Limits platform flexibility | Define UX principles, let platforms adapt |
| **String-based phase matching** | Commands use brittle string parsing for phase numbers | Fails on whitespace variations | Use structured frontmatter queries |
| **Unstructured error handling** | Commands echo errors inconsistently | User doesn't know what went wrong | Define error return protocol with codes |
| **Implicit dependencies** | Commands assume files exist without checking | Fails silently or with cryptic errors | Explicit validation in `<prerequisites>` section |

**Total anti-features:** 8 patterns to avoid

## Feature Dependencies

```
Frontmatter metadata
    ├──requires──> Tool mappings (tools defined in frontmatter)
    └──requires──> Argument handling (argument-hint in frontmatter)

@-references
    ├──requires──> Multi-section structure (sections can @-reference)
    └──enhances──> Conditional content (can @-reference conditionally)

Subagent spawning
    ├──requires──> Structured returns (to parse results)
    ├──requires──> Tool mappings (Task tool needed)
    └──enhances──> Wave-based parallelization (spawns waves)

Process subsections
    ├──requires──> Multi-section structure (subsections within <process>)
    └──enhances──> Checkpoint protocol (checkpoints are subsections)

Verification loops
    ├──requires──> Subagent spawning (spawns verifier)
    └──requires──> Structured returns (parses verification result)

State persistence
    ├──requires──> Embedded bash blocks (updates files)
    └──enhances──> Debug persistence (maintains debug state)

Gap closure mode
    ├──requires──> Verification loops (reads VERIFICATION.md)
    └──requires──> Argument handling (--gaps flag)

Research routing
    ├──requires──> Subagent spawning (4 parallel researchers)
    ├──requires──> Structured returns (parses research complete)
    └──enhances──> Requirement traceability (research informs requirements)
```

### Dependency Notes

- **Frontmatter → Tool mappings → Subagent spawning:** Core dependency chain. Without frontmatter, no tool declaration. Without tools, no Task spawning.
- **@-references + Multi-section:** Foundational for command structure. Every command uses both.
- **Structured returns critical for orchestration:** Orchestrators parse `## KEYWORD FORMAT` to route. Without this, orchestration breaks.
- **Verification depends on spawning:** Cannot verify without spawning gsd-verifier or gsd-plan-checker agents.

## MVP Definition

### Launch With (v1 Migration)

Minimum feature set to migrate all 29 commands without losing functionality.

**Critical path (must have):**
- [x] **Frontmatter metadata** — Command identity and tool access
- [x] **Multi-section structure** — `<objective>`, `<process>`, `<success_criteria>`, `<context>`, `<execution_context>`
- [x] **@-references** — Context loading from templates, workflows, state files
- [x] **Tool mappings** — Platform-specific tool translation
- [x] **Conditional content** — `{{#isClaude}}` / `{{#isCopilot}}` for multi-platform
- [x] **Embedded bash blocks** — Validation and state manipulation
- [x] **Argument handling** — Flags and parameters
- [x] **Subagent spawning** — Task tool usage patterns
- [x] **Structured returns** — `## STATUS FORMAT` parsing
- [x] **Process subsections** — Steps and phases within `<process>`

**Phase 1 scope:** These 10 features enable 100% of current command functionality.

### Add After Validation (v1.x)

Features to add once migration is stable and patterns are validated.

**Post-migration enhancements:**
- [ ] **Verification loops** — Add after executors proven stable
- [ ] **State persistence patterns** — Document conventions for STATE.md updates
- [ ] **Git integration patterns** — Standardize commit message formats
- [ ] **Checkpoint protocol** — Formalize checkpoint conventions
- [ ] **Context budget tracking** — Add metadata for context cost estimates

**Trigger:** After first 5 commands migrated and executing successfully.

### Future Consideration (v2+)

Advanced features that require ecosystem maturity.

**Deferred to v2:**
- [ ] **Wave parallelization optimization** — Auto-calculate optimal waves
- [ ] **Research routing framework** — Generalized researcher spawning
- [ ] **Gap closure automation** — Auto-detect and auto-plan gaps
- [ ] **Debug persistence** — Cross-session debug state management
- [ ] **Requirement traceability automation** — Auto-link commits to REQ-IDs

**Why defer:** Require stable v1 patterns to build on. Premature optimization without real usage data.

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority | Migration Phase |
|---------|------------|---------------------|----------|-----------------|
| Frontmatter metadata | HIGH | LOW | P1 | Phase 1 (baseline) |
| Multi-section structure | HIGH | LOW | P1 | Phase 1 (baseline) |
| @-references | HIGH | MEDIUM | P1 | Phase 1 (baseline) |
| Tool mappings | HIGH | MEDIUM | P1 | Phase 1 (baseline) |
| Conditional content | MEDIUM | MEDIUM | P1 | Phase 1 (baseline) |
| Embedded bash | HIGH | LOW | P1 | Phase 1 (baseline) |
| Argument handling | HIGH | MEDIUM | P1 | Phase 1 (baseline) |
| Subagent spawning | HIGH | HIGH | P1 | Phase 1 (baseline) |
| Structured returns | HIGH | LOW | P1 | Phase 1 (baseline) |
| Process subsections | MEDIUM | LOW | P1 | Phase 1 (baseline) |
| Git integration | MEDIUM | MEDIUM | P2 | Phase 2 (patterns) |
| State persistence | HIGH | MEDIUM | P2 | Phase 2 (patterns) |
| Checkpoint protocol | MEDIUM | HIGH | P2 | Phase 2 (patterns) |
| Verification loops | HIGH | HIGH | P2 | Phase 3 (quality) |
| Wave parallelization | HIGH | HIGH | P3 | Phase 4 (optimization) |
| Context budget awareness | MEDIUM | HIGH | P3 | Phase 4 (optimization) |
| Research routing | MEDIUM | HIGH | P3 | Phase 5 (advanced) |
| Gap closure mode | MEDIUM | MEDIUM | P3 | Phase 5 (advanced) |
| Todo capture | LOW | LOW | P3 | Phase 5 (advanced) |
| Debug persistence | MEDIUM | MEDIUM | P3 | Phase 5 (advanced) |
| Requirement traceability | MEDIUM | MEDIUM | P3 | Phase 5 (advanced) |
| Brownfield detection | LOW | MEDIUM | P3 | Phase 5 (advanced) |

**Priority key:**
- **P1 (Critical):** Must have for migration. All commands depend on these.
- **P2 (High):** Needed for production quality. Add after P1 stable.
- **P3 (Medium):** Enhance usability. Add incrementally after P2.

## Current Command Feature Matrix

Analysis of which commands use which features (helps prioritize migration order).

### Core Features Usage

| Command | @-refs | Subagents | Args | Bash | Checkpoints | State Updates |
|---------|--------|-----------|------|------|-------------|---------------|
| new-project | ✓✓✓ | ✓✓✓✓✓ | — | ✓✓✓ | ✓ | ✓✓ |
| execute-phase | ✓✓ | ✓✓✓ | ✓ | ✓✓ | ✓ | ✓✓✓ |
| plan-phase | ✓ | ✓✓ | ✓✓✓ | ✓✓✓ | — | ✓ |
| research-phase | ✓✓ | ✓ | ✓ | ✓✓ | ✓ | ✓ |
| new-milestone | ✓✓✓ | ✓✓✓✓✓ | ✓ | ✓✓✓ | ✓ | ✓✓ |
| discuss-phase | ✓✓ | — | ✓ | ✓✓ | — | ✓ |
| complete-milestone | ✓✓ | — | ✓ | ✓✓✓ | — | ✓✓✓ |
| progress | ✓✓✓ | — | — | ✓✓ | — | — |
| add-phase | ✓✓ | — | ✓ | ✓✓ | — | ✓✓ |
| remove-phase | ✓✓ | — | ✓ | ✓✓✓ | — | ✓✓ |
| debug | ✓✓ | ✓✓ | ✓ | ✓✓ | ✓✓ | ✓✓ |
| add-todo | ✓ | — | ✓ | ✓ | — | ✓ |
| check-todos | ✓✓ | — | ✓ | ✓ | — | — |
| map-codebase | ✓ | ✓✓✓✓ | — | ✓✓✓ | — | ✓ |

**Legend:**
- ✓ = Uses feature (one check per instance)
- More checks = heavier usage

**Observation:** 
- new-project and new-milestone are most complex (use all features heavily)
- Simple commands (add-todo, progress) use fewer features
- Subagent orchestrators (new-project, execute-phase, map-codebase) are critical path

### Migration Complexity by Command

| Complexity | Commands | Key Challenge |
|------------|----------|---------------|
| **HIGH** | new-project, new-milestone, execute-phase | Multi-stage orchestration with 4-5 subagent types |
| **MEDIUM** | plan-phase, research-phase, debug, map-codebase | 1-2 subagents + argument complexity |
| **LOW** | progress, add-todo, check-todos, help, verify-installation | Single-stage, no orchestration |

**Migration strategy:**
1. Start with LOW complexity to validate format
2. Migrate one MEDIUM to test subagent spawning
3. Tackle HIGH complexity last (proven patterns)

## Command-Specific Feature Requirements

### Commands Requiring Subagent Spawning (8)
- new-project (spawns: 4 researchers + synthesizer + roadmapper)
- new-milestone (spawns: 4 researchers + synthesizer + roadmapper)
- execute-phase (spawns: N executors in parallel waves)
- plan-phase (spawns: planner + checker in verification loop)
- research-phase (spawns: phase-researcher)
- debug (spawns: debugger + optional specialist)
- map-codebase (spawns: 4-7 explore agents + synthesizer)
- audit-milestone (spawns: integration-checker)

**Critical:** These 8 cannot work without subagent spawning infrastructure.

### Commands with Complex Argument Parsing (7)
- plan-phase: `[phase] [--research] [--skip-research] [--gaps] [--skip-verify]`
- execute-phase: `<phase-number> [--gaps-only]`
- new-milestone: `<name>`
- research-phase: `[phase]`
- debug: `[issue description]`
- check-todos: `[area]`
- complete-milestone: `<version>`

**Critical:** Argument parsing must handle optional args, flags, and defaults.

### Commands with @-reference Heavy Usage (12)
- new-project: 4+ @-references (templates, workflows, references)
- execute-phase: 2 @-references + dynamic plan loading
- audit-milestone: 4+ @-references (PROJECT, REQUIREMENTS, ROADMAP, config)
- plan-phase: 1 @-reference + conditional loading
- new-milestone: 4+ @-references (same as new-project)
- progress: 3+ @-references (STATE, ROADMAP, PROJECT)
- add-phase: 2 @-references (ROADMAP, STATE)
- discuss-phase: 4+ @-references (workflows, templates, state)

**Critical:** @-reference resolution must work across templates/, workflows/, references/, and .planning/.

## Feature Implementation Considerations

### Frontmatter Extensions Needed

Current agent specs have:
```yaml
---
name: gsd-project-researcher
description: "..."
tools: [Read, Write, ...]
---
```

Commands need additional fields:
```yaml
---
name: gsd:new-project
description: "..."
argument-hint: "[optional hint]"
allowed-tools: [Read, Write, Bash, Task, AskUserQuestion]
category: project-initialization  # (optional grouping)
---
```

**Migration note:** Commands use `allowed-tools`, agents use `tools`. Standardize to one.

### Section Naming Conventions

**Current sections across all 29 commands:**
- `<objective>` — What and why (present in 100%)
- `<context>` — @-references to state (present in 80%)
- `<execution_context>` — @-references to workflows/templates (present in 60%)
- `<process>` — Step-by-step execution (present in 100%)
- `<success_criteria>` — Observable outcomes (present in 90%)
- `<output>` — Files created (present in 70%)

**Recommendation:** Standardize these 6 as required sections in spec format.

### @-reference Resolution Rules

**Current patterns observed:**
1. `@~/.claude/get-shit-done/references/ui-brand.md` — Absolute path to skill files
2. `@.planning/PROJECT.md` — Relative path to project state
3. `@{plan_path}` — Variable interpolation for dynamic paths

**Migration needs:**
- Resolve `~/.claude/` to `.github/skills/` for GitHub Copilot
- Support relative paths from skill root
- Support variable interpolation in spawned prompts

### Tool Mapping Requirements

**Current tools used:**
- Read, Write, Edit — File operations
- Bash, Grep, Glob — Shell operations
- Task — Subagent spawning (Claude-specific)
- WebSearch, WebFetch — Research (Claude-specific)
- mcp__context7__* — Documentation lookup (Claude-specific)
- AskUserQuestion — Interactive UX (Claude-specific)
- TodoWrite — Todo management (extension)

**Platform mapping needed:**
```
Claude           → GitHub Copilot
-------------------------------------
Bash             → execute
Read             → read
Write            → edit (create mode)
Edit             → edit
Task             → Custom agent invocation
AskUserQuestion  → Conversational prompt
WebSearch        → N/A (not available)
WebFetch         → N/A (not available)
mcp__context7__* → N/A (not available)
```

**Critical:** Commands using WebSearch/WebFetch/Context7 need fallback strategies for Copilot.

## Sources

- **Primary:** Analyzed all 29 command files in `./commands/gsd/*.md`
- **Secondary:** Reviewed 10 agent specs in `./specs/agents/*.md`
- **Tertiary:** Examined template structure in `.github/skills/get-shit-done/templates/`
- **Context:** PROJECT.md milestone requirements for this migration

**Research methodology:**
- Static analysis of all command frontmatter (YAML parsing)
- Pattern extraction from `<section>` structures
- @-reference enumeration via grep
- Tool usage frequency analysis
- Subagent spawning pattern identification

**Confidence rationale:**
- HIGH confidence because analyzing actual codebase (not external sources)
- 100% coverage of existing commands
- Observable patterns, not inferred requirements
- Requirements directly traceable to current usage

---
*Feature research for: GSD skill spec system migration*
*Researched: 2025-01-22*
*Commands analyzed: 29/29 (100%)*
*Agent specs reviewed: 10*
