# Project Research Summary

**Project:** Multi-Platform Agent Template System
**Domain:** Template-based agent generation and installation for dual CLI support
**Researched:** 2025-01-21
**Confidence:** HIGH

## Executive Summary

This project aims to create a template-based system that generates platform-optimized agent configurations from a single source of truth, supporting both Claude Code and GitHub Copilot CLIs. The recommended approach uses **spec-as-template** with gray-matter for frontmatter parsing, Mustache for logic-less templating, and install-time generation with platform adapters. The architecture extends the existing `install.js` adapter pattern by injecting a template generation pipeline between source specs and output files.

The core challenge is managing platform differences while maintaining single-source agent definitions. Claude and Copilot differ significantly in their metadata formats, tool namespacing, feature support (model selection, skills, hooks), and character limits. The solution is to make platform differences explicit at install-time through conditional template sections, while keeping agents themselves platform-agnostic. Critical success factors include: (1) using canonical tool names that work on both platforms, (2) validating generated configs for each platform, and (3) embedding version metadata for upgrade paths.

The primary risk is **silent failures from platform-specific features**: tools with wrong case sensitivity, model fields ignored on Copilot, or YAML parsing ambiguities. Mitigation requires comprehensive cross-platform testing where every generated agent is validated by actual installation and invocation on both CLIs, not just frontmatter parsing. The template system must fail fast with helpful error messages rather than generating invalid configs that load but don't work.

## Key Findings

### Recommended Stack

The research converged on a minimal, dependency-light stack optimized for install-time generation with CommonJS compatibility. The core consists of **gray-matter** (frontmatter parsing), **js-yaml** (YAML serialization), and native **template literals** for simple field mapping, with **Mustache** as an optional upgrade path if conditional logic becomes complex.

**Core technologies:**
- **gray-matter (^4.0.3):** Parse YAML/JSON/TOML frontmatter from agent specs — battle-tested, handles edge cases regex parsers miss, supports round-trip editing
- **js-yaml (^4.1.1):** YAML serialization for platform-specific frontmatter — industry standard, actively maintained (Nov 2025), needed for writing valid YAML with proper escaping
- **Template Literals (ES6+):** Primary template generation — no dependencies, easier debugging, sufficient for 10-15 agents with mostly direct field mappings
- **Mustache (^4.2.0) [optional]:** Logic-less templates if complexity grows — zero dependencies, widely supported, prevents template complexity from spiraling

**Critical version requirements:**
- Node.js >= 16.7.0 (already required by package.json)
- CommonJS compatibility required (all recommended packages support `require()`)
- gray-matter@^4.0.3 compatible with js-yaml@^3.0.0 or ^4.0.0

**What to avoid:**
- Regex-based frontmatter parsing (fails on edge cases)
- String concatenation for YAML (introduces syntax errors)
- Build-step templates like Nunjucks/Pug (project constraint: no build step)
- Custom template DSL (unnecessary learning curve)

### Expected Features

Research identified 10 table stakes features, 15 differentiators, and 12 anti-features to explicitly avoid.

**Must have (table stakes):**
- **Variable substitution:** `{{variable}}` syntax for platform-specific values
- **Platform targeting:** `--copilot` or `--claude` CLI flag (defaults to Claude for backward compatibility)
- **Conditional logic:** Platform-specific template sections (`{{#isCopilot}}...{{/isCopilot}}`)
- **Output validation:** Schema checks against Claude/Copilot format requirements
- **File generation:** Write to `.github/copilot/agents/` or `.claude/agents/` correctly
- **Single source template:** One spec file per agent, not separate platform copies
- **Metadata transformation:** YAML frontmatter ↔ platform-specific formats
- **Error messages:** Clear, actionable feedback when generation fails

**Should have (competitive differentiators):**
- **Dry-run mode:** Preview output before writing files (high value, low effort)
- **Interactive prompts:** Ask platform if not specified (better UX)
- **Multi-agent batch:** Install/update all 10 agents at once (convenience)
- **Auto-detection:** Infer platform from `.github/copilot/` vs `.claude/` directory existence

**Defer (v2+):**
- Bidirectional support (template ← agent extraction)
- Migration tools (one-time conversion)
- Template inheritance (wait for duplication pain)
- Hooks/extensions (YAGNI until proven needed)
- Source maps for debugging (low ROI)

**Anti-features (explicitly avoid):**
- Runtime platform detection (violates platform-agnostic principle)
- Custom template DSL (use existing, familiar patterns)
- Per-platform templates (maintenance nightmare)
- Manual version sync (automate metadata tracking)
- Over-abstraction (solve this problem, don't build framework)

### Architecture Approach

The recommended architecture is **spec-as-template** with install-time generation, integrating cleanly into the existing `install.js` adapter pattern. Agent spec files ARE the templates (no separate .hbs/.mustache files), containing YAML frontmatter + markdown body with embedded template variables. The template system injects between the existing file copy logic and platform adapters.

**Major components:**
1. **Spec Parser** (`lib/template-system/spec-parser.js`) — Read spec files, parse YAML frontmatter + markdown body, identify template variables
2. **Context Builder** (`lib/template-system/context-builder.js`) — Build platform context (isCopilot, isClaude, paths), merge with spec metadata, add variables
3. **Template Engine** (`lib/template-system/engine.js`) — Wrapper around Mustache, render specs with context, handle conditionals and partials
4. **Generator** (`lib/template-system/generator.js`) — Orchestrate spec → template → output pipeline, coordinate with existing adapters
5. **Existing Adapters** (unchanged) — Reuse `convertContent()` method for path rewriting, maintain backward compatibility

**Data flow (install-time):**
```
User: npx get-shit-done-multi --copilot
  ↓
install.js: Parse CLI args (--copilot detected)
  ↓
CLI Detection: Detect installed CLIs
  ↓
Context Builder: Build platform context
  { isCopilot: true, paths: {...}, workDir: '...' }
  ↓
For each spec in specs/agents/:
  Spec Parser: Read → Parse YAML + markdown
  Template Engine: Render with platform context
  Adapter: Transform paths/content (existing convertContent)
  Output: Write to .github/agents/[name].md
```

**Integration strategy:**
- New: `lib/template-system/` directory with 4 modules
- Modified: `install.js` imports generator, replaces `copyWithPathReplacement` for agents
- Unchanged: Existing adapters (use their `convertContent` for path rewriting)
- Minimal: Template system fits into existing workflow with <50 lines of integration code

**Key design decisions:**
1. **Spec-as-template pattern:** Single file per agent (spec is template), no separate .mustache files
2. **Install-time generation:** Generate platform output when user runs installer, not build-time
3. **Template literals first, Mustache if needed:** Start simple, upgrade only if conditionals proliferate
4. **Extend, don't replace:** Leverage existing adapter pattern, minimal disruption to current system

### Critical Pitfalls

Research identified 10 critical pitfalls that cause silent failures or require complete rewrites.

1. **Tool name case sensitivity (#1 risk)** — Claude requires exact case (`Bash`, `Read`, `Edit`), Copilot is case-insensitive. Using lowercase (`bash`, `read`) works on Copilot but silently fails on Claude. Agents load but tools don't work. **Prevention:** Establish canonical names (`Bash`, `Read`, `Edit`, `Grep`) and always quote in YAML: `tools: ['Bash', 'Read']`

2. **Tool aliasing creates behavior divergence** — Copilot supports multiple aliases (`edit` = `Edit` = `Write`), Claude has distinct tool names. Template using `Write` works on Claude but means something different on Copilot. **Prevention:** Use tool compatibility matrix, stick to canonical names that exist identically on both platforms.

3. **Model field ignored on Copilot** — `model: haiku` optimizes for cost/speed on Claude but is silently ignored on Copilot. Users expect Haiku performance but get Sonnet costs. **Prevention:** Conditional generation (`{% if platform == "claude" %}model: haiku{% endif %}`) or document clearly in comments.

4. **DenyListing tools doesn't work on Copilot** — Claude's `disallowedTools` creates read-only agents. Copilot ignores this field; agent has write access when it shouldn't. Security boundary disappears. **Prevention:** Use allowlisting only (`tools: ['Bash', 'Read']`), reinforce constraints in prompt text.

5. **Install-time generation creates version drift** — User installs template v1.0. Spec changes to v1.2. Users have different configs but "same" agent. Impossible to debug, security fixes don't propagate. **Prevention:** Embed generation metadata (template version, installer version, generation date, platform, source URL) in generated file comments. Create upgrade command.

**Additional critical pitfalls:**
- YAML parsing ambiguities (unquoted tool names interpreted as booleans)
- Prompt character limits (30k on Copilot, higher on Claude)
- MCP server configuration is platform-asymmetric (Copilot frontmatter vs Claude global config)
- Tool wildcard semantics differ (`tools: ['*']` means all on Copilot, literal on Claude)
- Skills and hooks are Claude-only (powerful features silently ignored on Copilot)

## Implications for Roadmap

Based on research, the recommended phase structure follows the natural dependency chain: foundation → platform handling → generation → workflow → polish. Six phases total with clear boundaries and testable deliverables.

### Phase 1: Template Engine Foundation
**Rationale:** Must establish template infrastructure before platform-specific logic. Stack research shows gray-matter + Mustache as proven choices. This phase has zero dependencies and can be developed/tested independently.

**Delivers:** 
- Template system modules (`spec-parser.js`, `context-builder.js`, `engine.js`, `generator.js`)
- Core parsing and rendering capabilities
- Unit tests for each module

**Addresses features:**
- Variable substitution (table stakes)
- Template literals for simple field mapping
- YAML frontmatter parsing with gray-matter

**Avoids pitfalls:**
- YAML parsing ambiguities (use proper parser, not regex)
- Template complexity explosion (logic-less Mustache prevents this)

**Research flag:** ❌ Skip research — well-documented patterns, established libraries (gray-matter, Mustache)

---

### Phase 2: Platform Abstraction Layer
**Rationale:** Platform differences must be isolated before generation logic. This addresses the critical tool aliasing and MCP configuration pitfalls. Architecture research shows adapter pattern already exists; extend it.

**Delivers:**
- Tool compatibility matrix and canonical name mapping
- Platform capability flags (supportsModel, supportsMCP, etc.)
- Field transformations (model, tools, mcp-servers)
- Cross-platform validation rules

**Addresses features:**
- Platform targeting (table stakes)
- Conditional logic (table stakes)
- Metadata transformation (table stakes)

**Avoids pitfalls:**
- Tool name case sensitivity (#1 critical pitfall)
- Tool aliasing behavior divergence (#2 critical pitfall)
- Model field ignored on Copilot (#3 critical pitfall)
- MCP configuration asymmetry (#8 critical pitfall)

**Research flag:** ❌ Skip research — official Claude/Copilot docs already analyzed, spec differences documented in PITFALLS.md

---

### Phase 3: Spec Migration & Template Generation
**Rationale:** Convert existing agents to spec-as-template format and implement platform-specific rendering. Dependencies: Phase 1 (engine) and Phase 2 (platform abstraction) must be complete.

**Delivers:**
- `specs/agents/` directory with template-enabled agent specs
- Platform-specific rendering logic
- Migration of all 10 existing agents to spec format
- Shared partials for common sections

**Addresses features:**
- Single source template (table stakes)
- Output validation (table stakes)
- Shared content via partials

**Avoids pitfalls:**
- YAML parsing ambiguities (validate output YAML)
- Prompt character limits (check length during generation)
- Tool wildcard semantics (avoid `tools: ['*']` in specs)
- Skills/hooks Claude-only (mark platform-specific clearly)

**Research flag:** ❌ Skip research — spec format derived from Phase 2 analysis

---

### Phase 4: Installation Workflow Integration
**Rationale:** Integrate template generation into existing `install.js`. Architecture research shows minimal changes required (import generator, replace `copyWithPathReplacement`). This phase connects all previous work.

**Delivers:**
- Modified `install.js` with template system integration
- CLI flag support (`--copilot`, `--claude`, `--dry-run`)
- Version metadata embedding in generated files
- Helpful error messages with context

**Addresses features:**
- File generation (table stakes)
- Error messages (table stakes)
- Dry-run mode (differentiator)
- Interactive prompts (differentiator)

**Avoids pitfalls:**
- Version drift (embed metadata in generated files)
- User-hostile errors (provide context + suggestions)
- Breaking changes (support upgrade command)

**Research flag:** ❌ Skip research — existing `install.js` already analyzed, integration points clear

---

### Phase 5: Cross-Platform Testing & Validation
**Rationale:** Critical pitfalls research shows silent failures are the primary risk. Every agent must be tested by actual installation and invocation on both CLIs, not just frontmatter parsing. This phase validates all previous work.

**Delivers:**
- CI pipeline that generates and installs agents on both platforms
- Smoke tests that invoke agents with simple tasks
- Tool usage verification in logs
- Round-trip validation (template → agent → verify works)

**Addresses features:**
- Output validation (table stakes, extended to runtime)
- Auto-detection (differentiator)
- Multi-agent batch (differentiator)

**Avoids pitfalls:**
- No round-trip validation (#12 moderate pitfall)
- Template complexity explosion (test coverage reveals issues)
- Documentation drift (examples generated from actual output)

**Research flag:** 🔬 **Needs research** — Testing strategy for multi-platform CLI tools is niche. May need research into CI approaches for Claude Code (local) vs GitHub Copilot (cloud-based) testing environments.

---

### Phase 6: Documentation & Polish
**Rationale:** Documentation must be generated from tested examples to avoid drift. Final phase ensures users can successfully adopt the system. Dependencies: All previous phases complete.

**Delivers:**
- README with installation and usage instructions
- Migration guide for existing agent authors
- Platform support matrix documentation
- Troubleshooting guide with common errors
- Examples generated from actual template output

**Addresses features:**
- Help/documentation (table stakes)
- Migration tools guidance (deferred feature)

**Avoids pitfalls:**
- Documentation drift from implementation (#14 moderate pitfall)
- Inconsistent naming conventions (#18 minor pitfall)
- No visual distinction between platforms (#16 minor pitfall)

**Research flag:** ❌ Skip research — documentation patterns are standard

---

### Phase Ordering Rationale

**Why this order:**
1. **Foundation first (Phase 1):** Template engine has zero dependencies, can be built and tested independently
2. **Platform abstraction before generation (Phase 2 before 3):** Must know platform differences before generating platform-specific output
3. **Generation before integration (Phase 3 before 4):** Need working generation pipeline before integrating into installer
4. **Testing after implementation (Phase 5):** Validates all previous phases work correctly
5. **Documentation last (Phase 6):** Based on tested, working system

**Dependency chain:**
```
Phase 1 (Foundation) ──┬──> Phase 3 (Generation) ──> Phase 4 (Integration)
                       │                                       │
Phase 2 (Platform) ────┘                                       │
                                                               ↓
                                                        Phase 5 (Testing)
                                                               │
                                                               ↓
                                                        Phase 6 (Docs)
```

**How this avoids pitfalls:**
- Phase 1: Prevents YAML parsing issues by using proper parser
- Phase 2: Addresses 5 of 10 critical pitfalls (tool names, aliasing, model field, denylisting, MCP config)
- Phase 3: Validates output prevents silent failures
- Phase 4: Version metadata prevents drift
- Phase 5: Round-trip testing catches silent failures
- Phase 6: Generated examples prevent documentation drift

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 5 (Testing):** Multi-platform CLI testing strategy is niche. Need to research CI approaches for:
  - Testing Claude Code agents (local installation)
  - Testing GitHub Copilot agents (cloud-based, requires auth)
  - Mocking or actual CLI invocation in tests
  - Cross-platform test environments (local dev vs CI)

**Phases with standard patterns (skip research-phase):**
- **Phase 1:** Template engine integration (well-documented npm packages)
- **Phase 2:** Platform abstraction (specs already analyzed, matrix documented)
- **Phase 3:** Spec migration (straightforward file conversion)
- **Phase 4:** Install integration (existing codebase already analyzed)
- **Phase 6:** Documentation (standard practices)

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Stack** | HIGH | Official npm packages with active maintenance, gray-matter and js-yaml are industry standards, version compatibility verified |
| **Features** | MEDIUM-HIGH | Table stakes derived from template system patterns (Cookiecutter, Yeoman). Differentiators synthesized from multiple domains. No external validation for agent-specific needs |
| **Architecture** | HIGH | Spec-as-template pattern is proven (Yeoman, Hygen), existing `install.js` analyzed and integration points identified, Mustache is well-documented |
| **Pitfalls** | HIGH | Based on official Claude and Copilot documentation fetched 2025-01-21, platform differences verified from current specs, YAML parsing issues are well-known |

**Overall confidence:** HIGH

### Gaps to Address

**Gaps identified during research:**

1. **Testing multi-platform CLI tools in CI** — No clear pattern for testing both Claude Code (local) and GitHub Copilot (cloud) agents in automated pipelines. May require mock CLIs, fixture-based validation, or actual CLI installation in CI.
   - **How to handle:** Research during Phase 5 planning. Prototype test approaches early (mock vs real CLI).

2. **Future platform evolution** — Claude and Copilot will add new metadata fields, deprecate old ones. How to handle forward compatibility?
   - **How to handle:** Design Phase 2 abstraction layer to preserve unknown fields with warnings, not errors. Document versioning strategy in Phase 4.

3. **Bidirectional support feasibility** — Is extracting templates from existing agents actually needed, or is one-time migration sufficient?
   - **How to handle:** Defer to post-MVP. If users request template extraction, build migration tool. For now, focus on unidirectional (template → agent).

4. **Character limit on Claude prompts** — Copilot has documented 30k limit. Claude limit is undocumented, likely higher but unknown.
   - **How to handle:** Use conservative limit (28k) during Phase 3 generation, add length validation with warnings.

5. **MCP server configuration at repository level** — Copilot repository-level agents can reference MCP servers configured elsewhere, but configuration format is unclear.
   - **How to handle:** Document as non-portable feature. If MCP usage is critical, flag during Phase 2 for deeper investigation.

## Sources

### Primary (HIGH confidence)

**Official Documentation:**
- Claude Code subagents: https://code.claude.com/docs/en/sub-agents (fetched 2025-01-21)
- GitHub Copilot custom agents: https://docs.github.com/en/copilot/reference/custom-agents-configuration (fetched 2025-01-21)
- gray-matter: https://github.com/jonschlinkert/gray-matter (v4.0.3)
- js-yaml: https://github.com/nodeca/js-yaml (v4.1.1, updated Nov 2025)
- Mustache spec: https://mustache.github.io/mustache.5.html

**Current System Analysis:**
- `bin/install.js` — existing adapter pattern analyzed
- `bin/lib/adapters/copilot.js` — convertContent interface identified
- `agents/gsd-planner.md` — current agent format examined

### Secondary (MEDIUM confidence)

**Template Systems & Patterns:**
- Cookiecutter: https://cookiecutter.readthedocs.io/en/stable/
- Yeoman: https://yeoman.io/authoring/
- Handlebars: https://handlebarsjs.com/guide/
- EJS: https://ejs.co/ (v4.0.1, updated Jan 2026)

**Multi-Platform Patterns:**
- npm package.json "exports" field (conditional exports)
- Terraform multi-provider patterns (AWS/Azure/GCP)
- Babel transpilation patterns (ES5/ES2015/ESNext)

### Tertiary (LOW confidence)

**Inferred/Synthesized:**
- Agent template systems (greenfield area, no existing examples found)
- Multi-platform agent testing (niche domain, sparse documentation)
- Template feature expectations (derived from adjacent domains, not validated by users)

---
*Research completed: 2025-01-21*
*Ready for roadmap: yes*
