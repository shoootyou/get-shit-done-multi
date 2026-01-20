# Feature Landscape: Multi-CLI Developer Tools

**Domain:** Multi-CLI AI Coding Assistant Integration Tools
**Researched:** January 19, 2025
**Context:** GSD tool with 24 commands and 11 specialized agents, expanding from single-CLI to multi-CLI support (GitHub Copilot CLI, Claude Code, Codex CLI)

---

## Table Stakes

Features users expect. Missing = product feels incomplete or unusable.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Auto-Detection of Installed CLIs** | Users expect tools to discover available CLIs without manual configuration | Medium | Must probe common install locations, check PATH, validate versions. Similar to how Terraform detects providers【3:1†source】. |
| **Unified Command Interface** | Abstracting CLI differences is the core value proposition | High | Translation layer maps GSD commands to CLI-specific invocations. Critical dependency for all features【3:0†source】. |
| **CLI-Agnostic State Management** | .planning/ directory must work regardless of which CLI executes commands | Medium | State format can't assume CLI-specific features. Must be portable【3:0†source】. |
| **Graceful Degradation** | If preferred CLI unavailable, fall back to alternatives or clear error | Medium | Better UX than hard failure. "Copilot not found, trying Claude..."【3:5†source】. |
| **Installation Verification** | Check that detected CLIs are properly authenticated and functional | Low | Quick validation before attempting real work. Prevent cryptic auth errors mid-execution【3:1†source】. |
| **Session Persistence** | Commands must resume across CLI switches without losing context | High | Critical for "switch mid-project" use case. Requires careful state design【3:2†source】【3:6†source】. |
| **Agent/Subagent Mapping** | GSD's 11 agents must map to equivalent capabilities in each CLI | High | Core complexity: Copilot has "task agent", Codex has "subagents", Claude has different model. Need abstraction【3:7†source】【3:9†source】. |
| **Error Translation** | CLI-specific errors must be translated to user-friendly, actionable messages | Medium | "ghcli error 403" → "GitHub authentication expired. Run 'gh auth login'"【3:5†source】. |
| **Configuration File** | Users need to set preferences (default CLI, fallback order, per-project overrides) | Low | YAML/JSON config at ~/.gsd/config.yml and .planning/gsd-config.yml【3:1†source】. |
| **Version Compatibility Checks** | Different CLI versions have different capabilities; must detect and warn | Medium | Codex CLI subagents require v2.0+, Copilot custom agents require v1.5+【3:7†source】【3:9†source】. |

---

## Differentiators

Features that set GSD apart. Not expected, but highly valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Intelligent CLI Selection** | Auto-select optimal CLI per task based on capability matrix | High | Route code review to Claude (better reasoning), fast edits to Copilot (faster), complex workflows to Codex (subagent support). Game-changer for UX【3:4†source】【3:8†source】. |
| **Cross-CLI Context Passing** | Share context/memory when switching CLIs mid-session | Very High | Preserve conversation history, file context, project understanding across CLI boundaries. Requires custom context protocol【3:2†source】【3:6†source】. |
| **Unified Agent Registry** | Single definition for GSD agents that deploys to all CLIs | High | Define gsd-planner once, auto-generate Copilot custom agent, Codex subagent, Claude prompt. DRY principle【3:3†source】【3:7†source】【3:9†source】. |
| **CLI Performance Benchmarking** | Track which CLI is faster/better for each command type in user's environment | Medium | "On your machine, Copilot executes 2x faster for file edits." Data-driven CLI selection【3:8†source】. |
| **Parallel CLI Execution** | Run same task on multiple CLIs, use first/best result | High | For critical operations, hedge against CLI failures or quality issues. Present best answer【3:0†source】. |
| **CLI Comparison Mode** | Side-by-side output from multiple CLIs for the same command | Medium | Educational + quality check. "Compare how Copilot vs Claude would solve this"【3:4†source】. |
| **Workflow Recording** | Capture full GSD workflow, replay on different CLI | Medium | "Export this workflow to run on teammate's machine using their preferred CLI"【3:5†source】. |
| **CLI Health Monitoring** | Proactive detection of CLI issues (auth expiry, rate limits, degraded performance) | Medium | Background checks prevent mid-workflow failures. Show status in `gsd status`【3:1†source】. |
| **Cost Tracking** | Monitor API usage/costs across CLIs (Copilot tokens, Claude API calls) | Low-Medium | Important for teams. "This phase used 2M tokens across 3 CLIs = $X"【3:4†source】. |
| **Smart Retry Logic** | If one CLI fails, automatically retry with different CLI | Medium | Resilience feature. "Copilot rate limited, retrying with Claude..."【3:5†source】. |
| **Documentation Generator** | Auto-generate comparison docs: "How this GSD command works in each CLI" | Low-Medium | Onboarding aid. Helps users understand what's happening under the hood【3:4†source】. |
| **Capability Matrix UI** | Interactive table showing which CLI supports which GSD features | Low | Transparency: "✓ Copilot supports this, ✗ Codex doesn't, ⚠ Claude partial support"【3:4†source】. |

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **CLI Emulation Layer** | Don't try to make one CLI perfectly mimic another's API | Creates fragile abstraction that breaks with every CLI update. Instead: explicit capability detection and graceful degradation【3:0†source】【3:5†source】. |
| **Vendor Lock-In** | Don't design state format that only works with specific CLI | Defeats multi-CLI purpose. Instead: CLI-agnostic state schema, CLI-specific adapters【3:0†source】. |
| **Automatic CLI Installation** | Don't auto-install CLIs without user consent | Security risk, permission issues, disk space. Instead: detect + prompt with clear instructions【3:1†source】. |
| **Silent CLI Switching** | Don't switch CLIs without user awareness | Confusing when behavior changes unexpectedly. Instead: log switches, allow user override【3:5†source】. |
| **Single Config File Format** | Don't force one config format (e.g., only JSON or only YAML) | Different CLIs prefer different formats. Instead: support multiple, auto-detect【3:1†source】. |
| **Real-Time CLI Polling** | Don't constantly ping CLIs to check availability | Performance drain, unnecessary API calls. Instead: lazy detection on command invocation + caching【3:1†source】. |
| **Complete Feature Parity** | Don't try to make every GSD command work identically on all CLIs | Impossible—CLIs have different capabilities. Instead: document differences, partial implementations OK【3:4†source】【3:8†source】. |
| **CLI Output Interception** | Don't intercept and reformat all CLI stdout/stderr | Breaks streaming, hides useful CLI output. Instead: passthrough with minimal annotation【3:5†source】. |
| **Shared Agent Context** | Don't assume agents across CLIs can share memory/state | Each CLI has isolated context. Instead: explicit context serialization/deserialization【3:2†source】【3:6†source】. |
| **Synchronous Multi-CLI Execution** | Don't wait for all CLIs sequentially when trying multiple | Slow. Instead: parallel execution with timeout + first-success or best-result strategies【3:0†source】. |

---

## Feature Dependencies

Critical dependency chains that affect implementation order:

```
Auto-Detection → Installation Verification → CLI Selection
              ↓
         Unified Command Interface → Agent Mapping → All High-Level Features
              ↓
         CLI-Agnostic State → Session Persistence → Cross-CLI Context
              ↓
         Error Translation → Smart Retry Logic
              ↓
         Configuration File → All User Preferences
```

**Critical Path:** Unified Command Interface is the foundation. Nothing works without it.

**Parallel Tracks:**
- Track 1: Detection → Verification → Health Monitoring
- Track 2: State Management → Session Persistence → Context Passing
- Track 3: Configuration → CLI Selection → Intelligent Routing

---

## CLI-Specific Feature Notes

### GitHub Copilot CLI

**Key Capabilities (as of Jan 2025):**
- **Specialized Built-In Agents:** `explore`, `task`, `plan`, `code-review` agents with parallel execution【3:9†source】
- **Custom Agent Support:** Project/org/global-level agent definitions (since v1.5)【3:3†source】【3:9†source】
- **MCP (Model Context Protocol):** Enhanced context management, "Spaces" for project-specific understanding【3:9†source】
- **Delegation:** Background `/delegate` commands for async workflows【3:9†source】
- **Authentication:** Seamless GitHub integration, org-level permissions

**GSD Mapping Challenges:**
- Custom agent format differs from GSD agent definitions (need translation layer)
- Parallel agent execution may conflict with GSD's sequential orchestration
- MCP Spaces vs .planning/ directory (overlap in purpose)

### Claude Code

**Key Capabilities:**
- **Large Context Window:** 200K tokens (2-3x Copilot), retains context for 47+ minutes【3:8†source】
- **Superior Reasoning:** Best for architecture, refactoring, complex explanations【3:4†source】【3:8†source】
- **Autonomous Task Execution:** More aggressive agentic behavior, fewer approval prompts【3:4†source】
- **Fast Response:** Notably faster than Copilot for complex queries【3:8†source】

**GSD Mapping Challenges:**
- No native "subagent" concept (but strong context means less need for specialization)
- Terminal-first, less IDE integration (affects some GSD workflows)
- Less GitHub integration (may need manual PR creation)

### Codex CLI

**Key Capabilities (as of Jan 2025):**
- **Subagent System:** Explicit subagent support via agent definitions, `agent-exec` wrapper【3:7†source】
- **Image Inputs:** PNG/JPEG for multimodal prompts (diagrams, screenshots)【3:7†source】
- **Session Management:** Strong `codex resume` with full history【3:7†source】
- **Model Flexibility:** Switch models mid-session (gpt-5-codex, gpt-5)【3:7†source】
- **Community Extensions:** Open-source subagent implementations (betterup/codex-cli-subagents)【3:7†source】

**GSD Mapping Challenges:**
- Subagent definitions are file-based (YAML frontmatter in Markdown)—need parser
- Wrapper script pattern (`agent-exec`) different from Copilot's built-in agents
- Image input feature unique to Codex—how to surface in GSD?
- Experimental native agent support means API may change【3:7†source】

---

## MVP Recommendation

For MVP multi-CLI support, prioritize:

### Phase 1: Foundation (Must-Have)
1. **Auto-Detection of Installed CLIs** - Core infrastructure
2. **Unified Command Interface** - Abstraction layer for 3-5 key commands
3. **Configuration File** - Default CLI + fallback order
4. **CLI-Agnostic State Management** - Ensure .planning/ works everywhere
5. **Error Translation** - Basic error handling

**Reasoning:** Without these, multi-CLI support doesn't exist.

### Phase 2: Basic Interop (Early Value)
6. **Session Persistence** - Can switch CLIs without losing work
7. **Agent/Subagent Mapping** - Map 2-3 core GSD agents
8. **Graceful Degradation** - Fallback when CLI missing
9. **Installation Verification** - Catch auth issues early

**Reasoning:** Makes multi-CLI support actually usable, not just functional.

### Phase 3: Differentiators (Post-MVP)
10. **Intelligent CLI Selection** - Auto-route tasks
11. **CLI Comparison Mode** - Educational feature
12. **Smart Retry Logic** - Resilience
13. **Unified Agent Registry** - DRY agent definitions

**Reasoning:** These make GSD *better* than manual CLI switching.

### Defer to Post-MVP:
- **Cross-CLI Context Passing** - Very complex, diminishing returns
- **Parallel CLI Execution** - Edge case, high complexity
- **Performance Benchmarking** - Data collection takes time
- **Cost Tracking** - Nice-to-have, not critical
- **Workflow Recording** - Advanced use case

---

## Implementation Complexity Tiers

**Low (1-2 days):**
- Configuration File
- Installation Verification
- Capability Matrix UI
- Documentation Generator

**Medium (3-5 days):**
- Auto-Detection
- Error Translation
- Graceful Degradation
- CLI Health Monitoring
- Workflow Recording
- Version Compatibility Checks

**High (1-2 weeks):**
- Unified Command Interface
- CLI-Agnostic State Management
- Agent/Subagent Mapping
- Session Persistence
- Intelligent CLI Selection
- Unified Agent Registry
- Parallel CLI Execution
- Smart Retry Logic

**Very High (3+ weeks):**
- Cross-CLI Context Passing
- Complete Agent/Subagent parity across all CLIs

---

## Sources & Confidence

| Area | Confidence | Sources |
|------|------------|---------|
| **Multi-backend architecture patterns** | HIGH | AWS CLI Agent Orchestrator documentation, multi-agent orchestration patterns【3:0†source】 |
| **CLI detection/installation** | MEDIUM | Generic CLI tool patterns, inferred from package manager behaviors【3:1†source】 |
| **Switching CLIs mid-project** | MEDIUM | WebSearch synthesis of AI coding assistant workflow articles【3:2†source】【3:6†source】 |
| **GitHub Copilot CLI capabilities** | HIGH | Official GitHub blog changelog (Jan 2026), specialized agents documentation【3:9†source】 |
| **Claude Code capabilities** | HIGH | Multiple comparison articles, benchmark studies【3:4†source】【3:8†source】 |
| **Codex CLI capabilities** | MEDIUM-HIGH | Official OpenAI Codex CLI docs, community repos (betterup/codex-cli-subagents)【3:7†source】 |
| **Command translation patterns** | MEDIUM | AI-powered CLI abstraction articles, Terraform/kubectl examples【3:0†source】【3:5†source】 |

**Key URLs:**
- [AWS CLI Agent Orchestrator](https://aws.amazon.com/blogs/opensource/introducing-cli-agent-orchestrator-transforming-developer-cli-tools-into-a-multi-agent-powerhouse/)【3:0†source】
- [GitHub Copilot CLI Enhanced Agents](https://github.blog/changelog/2026-01-14-github-copilot-cli-enhanced-agents-context-management-and-new-ways-to-install/)【3:9†source】
- [Codex CLI Features](https://developers.openai.com/codex/cli/features)【3:7†source】
- [Claude Code vs Copilot Comparison](https://vikrampawar.github.io/2025/06/14/claude-code-vs-github-copilot-a-week-that-changed-my-workflow.html)【3:8†source】
- [betterup/codex-cli-subagents](https://github.com/betterup/codex-cli-subagents)【3:7†source】

---

## Open Questions & Research Gaps

**Need deeper investigation:**
1. **Codex CLI native agent API stability** - Currently experimental, may change【3:7†source】
2. **MCP protocol details** - How does Copilot's MCP Spaces work exactly?【3:9†source】
3. **Claude Code subagent workarounds** - If no native subagents, how to achieve similar?
4. **Cross-CLI authentication** - Can one auth session work for multiple CLIs?
5. **State format versioning** - How to evolve .planning/ format without breaking old projects?
6. **Performance benchmarks** - Real-world speed comparison of CLIs for GSD use cases

**Flagged for phase-specific research:**
- **Phase 2 (Agent Mapping):** Deep dive into each CLI's agent/subagent implementation
- **Phase 3 (Context Passing):** Protocol design for serializing conversation/context
- **Phase 4 (Intelligent Selection):** Capability matrix maintenance as CLIs evolve

---

## Notes on Feature Scope

**Conservative approach recommended:**
- Start with 3-5 frequently-used GSD commands for multi-CLI support
- Choose commands with clear CLI equivalents (e.g., "edit file", "explain code")
- Avoid commands requiring CLI-specific features initially (e.g., GitHub PR creation)
- Expand coverage incrementally based on usage data

**Agent parity strategy:**
- Begin with 2-3 core agents (e.g., gsd-executor, gsd-planner, gsd-verifier)
- Accept partial implementations (some agents may work better in certain CLIs)
- Document capability matrix clearly: "This agent fully supported in Copilot, partially in Codex, not in Claude"
- Consider "best CLI per agent" recommendations

**State management philosophy:**
- .planning/ directory remains source of truth (CLI-agnostic)
- CLIs are execution engines, not state owners
- Session metadata can include "last_cli_used" for continuity
- But must not require same CLI for resumption

---

## Downstream Implications

**For ARCHITECTURE.md:**
- Need adapter/plugin pattern for CLI integration
- Command translation layer is central component
- State management must be truly CLI-agnostic
- Consider "CLI capability registry" as core abstraction

**For STACK.md:**
- May need CLI SDK/wrapper libraries (e.g., `@github/copilot-cli-sdk` if exists)
- Configuration management library (for parsing multiple formats)
- Process management (spawning CLI subprocesses, capturing output)
- Possibly gRPC/IPC for CLI communication if direct SDK unavailable

**For PITFALLS.md:**
- CLI version drift (different team members on different CLI versions)
- Auth token expiry mid-workflow
- CLI-specific bugs surfacing as GSD bugs
- Context loss when switching CLIs
- Performance regression if abstraction layer is inefficient

---

## Success Criteria

Feature set is complete when:

- [ ] User can run GSD commands without knowing which CLI executes them
- [ ] Switching CLIs mid-project doesn't break workflow
- [ ] Each GSD agent works in at least 2 out of 3 CLIs
- [ ] Configuration is intuitive (10-line YAML file sufficient)
- [ ] Errors are actionable ("Run this command to fix")
- [ ] Documentation clearly explains CLI differences
- [ ] Performance overhead < 200ms per command (abstraction layer)
- [ ] System degrades gracefully when CLIs unavailable

---

**Last Updated:** January 19, 2025
**Next Review:** After architecture research (ARCHITECTURE.md completion)
