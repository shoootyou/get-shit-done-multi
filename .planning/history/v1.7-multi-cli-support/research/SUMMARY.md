# Project Research Summary

**Project:** GSD Multi-CLI Tool Support (Codex CLI Integration)
**Domain:** Developer tooling for multi-AI CLI platforms
**Researched:** January 19-20, 2025
**Confidence:** HIGH

## Executive Summary

GSD should extend from single-CLI (GitHub Copilot CLI) to multi-CLI support (Claude Code, GitHub Copilot CLI, Codex CLI) using a **plugin/adapter architecture** with a CLI-agnostic core. This approach allows a single codebase to deploy to multiple AI coding assistant platforms while preserving the core workflow logic that makes GSD effective.

The good news: All three CLIs have converged on the Open Agent Skills specification, meaning GSD's existing content is ~90% compatible with minimal conversion. The primary challenge is not the format but the **architectural differences** between CLIs—specifically that GitHub Copilot supports custom agents with native orchestration, while Codex CLI only supports skills (instructional packages without orchestration). This means GSD's 11 specialized agents must be adapted, not just copied, and some functionality may need to be reimplemented as workflow instructions rather than programmatic orchestration.

The critical insight from research: **Core logic must be CLI-agnostic, with thin adapter layers handling platform-specific concerns** (directory structure, invocation mechanisms, metadata formats). Implementation requires zero npm dependencies, using only Node.js built-ins (`fs/promises`, `path`, `os`) to maintain GSD's lightweight philosophy. Cross-platform path handling is non-negotiable—hardcoded path separators are the #1 cause of installation failures on Windows.

## Key Findings

### Recommended Stack

**Constraint-driven design:** GSD maintains zero npm dependencies, using only Node.js 16.7.0+ built-in modules. This constraint shapes the entire technical approach—no YAML parsers, no CLI libraries, no fancy abstractions. Pure Node.js.

**Core technologies:**
- **Node.js 16.7.0+** with native `fs/promises` — async file operations for skill installation and format conversion
- **`path` module** — cross-platform path handling; abstracts Windows vs Unix separators; use `path.join()` everywhere
- **`os` module** — home directory resolution with `os.homedir()`; replaces fragile env var checks
- **Path Resolver utility** — centralized logic mapping CLI type to correct directory structure (`~/.claude`, `.github/skills`, `~/.codex`)
- **Format Converter utility** — transforms GitHub Copilot agent format to Codex skill format (YAML frontmatter + path references)
- **CLI Detector utility** — identifies which CLIs are installed to route installations appropriately

**Architecture pattern:** Plugin/adapter architecture with three layers:
1. **Core content** (CLI-agnostic): Commands, workflows, templates, references — single source of truth
2. **Adapters** (CLI-specific): CopilotGitHubAdapter, CopilotCLIAdapter, CodexAdapter — handle format conversion, path rewriting, directory layout
3. **Installer** (orchestration): Detects target CLIs, loads appropriate adapters, executes installation

### Expected Features

**Must have (table stakes):**
- **Auto-detection of installed CLIs** — probe common locations, validate installations before offering options
- **Unified command interface** — abstract CLI differences so users don't think about which CLI executes
- **CLI-agnostic state management** — `.planning/` directory works regardless of which CLI is active
- **Graceful degradation** — if preferred CLI unavailable, fall back to alternatives or provide clear error
- **Session persistence** — commands resume across CLI switches without losing context
- **Agent/subagent mapping** — GSD's 11 agents must work in each CLI (full or partial support)
- **Configuration file** — user sets preferences (default CLI, fallback order, per-project overrides)

**Should have (differentiators):**
- **Intelligent CLI selection** — auto-route tasks to best CLI (code review to Claude, fast edits to Copilot)
- **CLI comparison mode** — side-by-side output from multiple CLIs for same command (educational)
- **Smart retry logic** — if one CLI fails, automatically retry with different CLI
- **Capability matrix UI** — interactive table showing which CLI supports which GSD features
- **CLI health monitoring** — proactive detection of CLI issues (auth expiry, rate limits)

**Defer (v2+):**
- **Cross-CLI context passing** — share conversation history when switching CLIs (very complex)
- **Parallel CLI execution** — run same task on multiple CLIs, use first/best result
- **Performance benchmarking** — track which CLI is faster for each command type
- **Cost tracking** — monitor API usage/costs across CLIs

### Architecture Approach

**Plugin/adapter pattern** with clear separation of concerns. Core workflow logic is CLI-agnostic; adapters handle platform-specific transformations. This enables extensibility—adding support for a new CLI (Cursor, Windsurf) requires only a new adapter, no core changes.

**Major components:**

1. **Core Content (`core/`)** — Single source of truth for commands, workflows, templates, references; CLI-agnostic markdown and instructions
2. **Adapter Layer (`adapters/`)** — CopilotGitHubAdapter (`.github/skills/`), CopilotCLIAdapter (`~/.claude/agents/`), CodexAdapter (`~/.codex/prompts/`); each handles format conversion and path rewriting
3. **Path Resolver** — Maps CLI type to directory structure; abstracts `~/.claude` vs `.github/skills/` vs `~/.codex`
4. **Format Converter** — Transforms agent definitions to skill format; handles YAML frontmatter differences, instruction adaptation
5. **CLI Detector** — Identifies installed CLIs via directory checks and command execution; supports auto-detection and explicit flags
6. **Installer (`bin/install.js`)** — Orchestrates detection → adapter selection → conversion → deployment; supports multi-CLI parallel installation

**Data flow:** User runs `npx get-shit-done --copilot` → CLI Detector identifies targets → Path Resolver determines directories → Adapter loads and converts core content → Output written to CLI-specific locations → Verification confirms installation worked.

### Critical Pitfalls

Research identified 8 critical pitfalls with HIGH recovery costs. Top 5 by impact:

1. **Hardcoded path separators break cross-platform compatibility** — Use `path.join()` everywhere, never string concatenation with `/` or `\`; test on Windows/macOS/Linux in CI matrix. **Prevention: Phase 1 (foundation)**

2. **Agent → Skill conversion loses critical functionality** — GitHub Copilot agents have native orchestration; Codex skills are instructional only. Must convert orchestration logic to workflow instructions, accept partial feature parity, document limitations. **Prevention: Phase 2 (conversion testing)**

3. **Shared state directory structure incompatibility** — Each CLI writes to `.planning/` differently, causing corruption when switching. Need shared state specification with validation, non-destructive writes, CLI-specific namespaced extensions. **Prevention: Phase 4 (interop testing)**

4. **Installer overwrites cause data loss** — No version detection, treats every run as fresh install. Must detect existing installations, backup before overwriting, merge configurations, test upgrade path. **Prevention: Phase 1 (installer logic)**

5. **Absolute paths break portability** — Hardcoded paths like `/Users/developer/.claude/` fail on different machines. Use relative paths, environment variables, runtime resolution. **Prevention: Phase 1 (path strategy)**

Additional notable pitfalls:
- **Command invocation differences** — `/gsd:new-project` (Claude) vs `gsd:new-project` (Copilot) vs `codex gsd:new-project` (Codex)
- **CLI detection fails in edge cases** — Non-standard install locations, multiple versions, WSL scenarios
- **Documentation drift across CLI variants** — Examples only show one CLI, feature tables incomplete

## Implications for Roadmap

Based on research, suggested 5-phase structure with clear dependency chain:

### Phase 1: Foundation — Installation Infrastructure
**Rationale:** Nothing works without a solid installation foundation. Path handling, CLI detection, and version management are prerequisites for everything else. Pitfalls #1, #4, #5, and #7 all require getting this right first.

**Delivers:**
- Cross-platform path utilities using `path.join()` and `os.homedir()`
- CLI detector with multi-stage validation (directory check → binary exists → runs `--version`)
- Version detection and upgrade logic (prevents data loss)
- Base adapter framework with common methods (path rewriting, file copying)
- Installation to GitHub Copilot CLI (`.github/skills/`) as proof of concept

**Addresses features:**
- Auto-detection of installed CLIs
- Installation verification
- Configuration file (basic)

**Avoids pitfalls:**
- Hardcoded path separators (cross-platform from day 1)
- Installer overwrites (version detection upfront)
- Absolute paths (path strategy defined)
- CLI detection failures (robust detection logic)

**Research flag:** Standard installation patterns, well-documented. Skip `/gsd:research-phase`.

### Phase 2: Adapter Implementation — Multi-CLI Deployment
**Rationale:** With foundation solid, implement adapters for each target CLI. GitHub Copilot is first (existing user base), then Claude/Codex. Research shows ~90% format compatibility, so conversion is mostly mechanical.

**Delivers:**
- CopilotGitHubAdapter (`.github/skills/`, YAML frontmatter, `gsd:` commands)
- CopilotCLIAdapter (`~/.claude/agents/`, agent frontmatter, `/gsd:` commands)
- CodexAdapter (`~/.codex/prompts/`, prompt format with manifest.json)
- Format conversion utilities (agent → skill, path rewriting)
- Parallel installation support (can install to multiple CLIs at once)

**Uses stack:**
- Path Resolver for directory mapping
- Format Converter for YAML frontmatter transformation
- Node.js fs/promises for file operations

**Implements architecture:**
- Adapter layer with CLI-specific transformers
- Core content remains untouched (CLI-agnostic)

**Avoids pitfalls:**
- Agent → Skill conversion (test each adapter thoroughly)
- Command invocation differences (CLI-specific files)

**Research flag:** **NEEDS RESEARCH** — Codex CLI API is experimental, may have changed since research. Before planning, verify Codex CLI 0.87.0 availability and skill format.

### Phase 3: Agent Translation — Orchestration Adaptation
**Rationale:** GSD's value is in its 11 specialized agents (gsd-planner, gsd-executor, gsd-verifier, etc.). These must work across CLIs despite architectural differences. This is the highest-risk phase due to Pitfall #2 (lost functionality).

**Delivers:**
- Core agents translated to skills for CLIs without native agents
- Orchestration logic converted to workflow instructions
- Agent capability matrix (which agents fully/partially supported per CLI)
- Documentation of functional differences per CLI

**Addresses features:**
- Agent/subagent mapping (core GSD capability)
- Graceful degradation (accept partial support where needed)

**Implements architecture:**
- Conversion layer for agent definitions
- CLI-specific invocation mechanisms

**Avoids pitfalls:**
- Agent → Skill conversion loss (explicit testing, accept limitations)
- Documentation drift (document differences upfront)

**Research flag:** **NEEDS RESEARCH** — Agent orchestration workarounds for Codex. How to achieve multi-step workflows without native agent delegation? May need workflow instruction patterns.

### Phase 4: State Management — CLI Interoperability
**Rationale:** Users need to switch CLIs mid-project without breaking workflows. Requires shared state format with validation and non-destructive merging.

**Delivers:**
- Shared state specification (required fields, CLI-specific namespaced extensions)
- State validation on read (version check, required fields present, warn on unknown fields)
- Non-destructive writes (read-modify-write, preserve unknown fields from other CLIs)
- Migration utilities (repair corrupted state, upgrade old formats)

**Addresses features:**
- CLI-agnostic state management
- Session persistence across CLI switches

**Avoids pitfalls:**
- Shared state incompatibility (spec + validation prevents corruption)

**Research flag:** Standard state management patterns. Skip `/gsd:research-phase`.

### Phase 5: Polish — Documentation and Verification
**Rationale:** After implementation complete, comprehensive testing and documentation ensures usability and prevents support burden.

**Delivers:**
- Integration tests (install to each CLI, run sample command, verify output)
- CLI comparison documentation (feature matrix, command syntax per CLI, migration guide)
- Post-install verification command (`gsd:verify-installation`)
- Performance testing (ensure abstraction layer adds <200ms per command)
- User guides for each CLI (getting started, troubleshooting, advanced usage)

**Addresses features:**
- Installation verification
- Capability matrix UI (documentation form)
- Configuration file (comprehensive docs)

**Avoids pitfalls:**
- Documentation drift (systematic review, validation scripts in CI)

**Research flag:** Standard testing/documentation. Skip `/gsd:research-phase`.

### Phase Ordering Rationale

**Why this order:**
- Foundation → Adapters → Agents → State → Polish follows natural dependency chain
- Can't implement adapters without path utilities (Phase 1)
- Can't translate agents without adapters deployed (Phase 2)
- Can't test CLI switching without state management (Phase 4)
- Documentation meaningless without features implemented (Phase 5)

**Why this grouping:**
- Phase 1: Core infrastructure (no CLI-specific code yet)
- Phase 2-3: CLI-specific implementations (adapters, then content)
- Phase 4: Cross-CLI concerns (state interoperability)
- Phase 5: Quality and usability (testing, docs)

**How this avoids pitfalls:**
- Addresses highest-impact pitfalls first (path handling, installer logic in Phase 1)
- Tests each layer before building on it (foundation → adapters → agents)
- Defers complex problems until infrastructure solid (state management Phase 4)
- Ensures documentation stays synchronized (Phase 5 after all features complete)

### Research Flags

**Needs deeper research during planning:**
- **Phase 2 (Adapters):** Codex CLI 0.87.0 version availability — web search indicated version mismatch (0.84.0 vs 0.87.0). Verify actual version on npm, confirm skill format before implementing CodexAdapter.
- **Phase 3 (Agents):** Orchestration workarounds for Codex — skills don't have native delegation. Research workflow instruction patterns that achieve multi-step execution without programmatic orchestration.

**Standard patterns (skip research-phase):**
- **Phase 1 (Foundation):** Installation patterns well-documented; Node.js path handling standard
- **Phase 4 (State):** State management patterns established; validation techniques known
- **Phase 5 (Polish):** Testing and documentation standard practices

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Node.js built-ins well-documented; path utilities proven; zero dependencies feasible |
| **Features** | HIGH | Multi-CLI tools have established patterns (AWS CLI Agent Orchestrator, Terraform providers); table stakes clear from ecosystem research |
| **Architecture** | HIGH | Plugin/adapter pattern proven (Repomix, multi-format CLIs); separation of concerns documented in multiple sources |
| **Pitfalls** | HIGH | Cross-platform pitfalls well-known; agent/skill differences confirmed in official docs; state management patterns established |

**Overall confidence:** HIGH

Research draws from official documentation (Node.js, GitHub Copilot, Codex CLI), recent ecosystem developments (Open Agent Skills spec convergence), and proven architectural patterns (adapter pattern, multi-backend systems). Low-confidence areas flagged for validation during implementation (Codex CLI version, orchestration workarounds).

### Gaps to Address

**Minor gaps requiring validation:**

1. **Codex CLI 0.87.0 availability** — Research sources conflicted (0.84.0 vs 0.87.0 latest). Before Phase 2 planning, verify actual version on npm registry: `npm view @openai/codex version`. If 0.87.0 not available, confirm skill format in whatever version is current.

2. **Skill invocation syntax in Codex** — Research indicated `$skill-name` and `codex gsd:command` patterns, but unclear which is preferred. During Phase 2, test both invocation methods in actual Codex CLI installation.

3. **Progressive disclosure depth limits** — Codex docs mention ~5,000 words per skill guideline. GSD's main skill is large (~15,000 words with all content). May need to split into multiple skills or test if guideline is enforced.

4. **Agent delegation in Codex** — No native equivalent to GitHub Copilot's Task tool for spawning sub-agents. Phase 3 needs to research alternative patterns (explicit skill chaining, workflow instructions, manual invocation).

5. **GitHub Copilot global skills support** — As of research date (Jan 2025), GitHub Copilot only supports local skills (`.github/`), no global (`~/.github/`). Monitor for feature addition; may enable global GSD installation for GitHub backend.

**How to handle:**
- Gaps 1-3: Quick validation during Phase 2 planning (30 min research + testing)
- Gap 4: Dedicated research during Phase 3 planning (may need `/gsd:research-phase` if no clear pattern emerges)
- Gap 5: Monitor GitHub Copilot changelog; defer to future milestone if feature ships

**No critical gaps:** Research provided sufficient foundation for roadmap creation and phase planning. Identified gaps are validation-level, not blocker-level.

## Sources

### Primary (HIGH confidence)

**Node.js:**
- Node.js v25.3.0 Official Documentation — fs, path, os modules
- Cross-platform Node.js Guide (GitHub: ehmicky/cross-platform-node-guide) — Path handling best practices

**Architecture:**
- Plugin/Adapter Architecture: https://peerdh.com/blogs/programming-insights/designing-a-plugin-architecture-for-extensible-cli-applications-3
- Adapter Design Pattern: https://www.geeksforgeeks.org/system-design/adapter-pattern/
- Real-world Example (Repomix multi-format): https://dev.to/jongwan93/a-deep-dive-into-repomix-how-a-simple-style-flag-powers-multiple-output-formats-1caa

**GitHub Copilot:**
- GitHub Copilot CLI Enhanced Agents: https://github.blog/changelog/2026-01-14-github-copilot-cli-enhanced-agents-context-management-and-new-ways-to-install/
- About custom agents: https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents
- About Agent Skills: https://docs.github.com/en/copilot/concepts/agents/about-agent-skills

**Pitfalls:**
- Navigating File Paths Across Windows, Linux/macOS, and WSL: https://dev.to/imperatoroz/navigating-file-paths-across-windows-linux-and-wsl-a-devops-essential-1n03
- Top 7 CLI Developer Experience Mistakes: https://www.techbuddies.io/2026/01/09/top-7-cli-developer-experience-mistakes-devs-still-make-in-2025/

### Secondary (MEDIUM confidence)

**Multi-CLI patterns:**
- AWS CLI Agent Orchestrator: https://aws.amazon.com/blogs/opensource/introducing-cli-agent-orchestrator-transforming-developer-cli-tools-into-a-multi-agent-powerhouse/
- Claude Code vs Copilot Comparison: https://vikrampawar.github.io/2025/06/14/claude-code-vs-github-copilot-a-week-that-changed-my-workflow.html

**Codex CLI:**
- OpenAI Codex CLI features documentation
- betterup/codex-cli-subagents: https://github.com/betterup/codex-cli-subagents
- Codex CLI 0.86.0 Update Guide: https://rexai.top/en/posts/2026-01-16-openai-codex-cli-guide/

### Tertiary (LOW confidence, needs validation)

**Codex-specific:**
- Codex CLI 0.87.0 version number (conflicting reports 0.84.0 vs 0.87.0)
- `$skill-name` invocation syntax (mentioned but not verified in official docs)
- Progressive disclosure 5,000 word limit (guideline vs hard limit unclear)

---

*Research completed: January 20, 2025*  
*Ready for roadmap: YES*  
*Next step: Orchestrator proceeds to requirements definition phase*
