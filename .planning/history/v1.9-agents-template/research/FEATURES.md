# Feature Landscape: Multi-Platform Agent Template Systems

**Domain:** Template-based agent installation system for dual-platform (Claude + GitHub Copilot) support
**Researched:** 2025-01-20
**Confidence:** MEDIUM-HIGH

## Executive Summary

Multi-platform template systems combine three domains: **template engines** (Jinja, Handlebars), **scaffolding tools** (Cookiecutter, Yeoman), and **transpilers** (Babel, TypeScript). For agent installation, the core challenge is transforming a single source template into platform-optimized configurations while preserving functionality.

**Key insight:** Success depends on making platform differences explicit at install-time, not runtime. The template should be "platform-aware" but agents themselves must remain "platform-agnostic."

---

## Table Stakes

Features users expect. Missing = system doesn't work or feels broken.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| **Variable Substitution** | Core templating primitive—all systems have this | Low | Use `{{variable}}` or similar syntax for platform-specific values |
| **Platform Targeting** | Must explicitly specify output platform | Low | CLI flag like `--copilot` or `--claude`; defaults to Claude for backward compatibility |
| **Conditional Logic** | Platform-specific sections require conditionals | Low | `{% if platform == "copilot" %}...{% endif %}` patterns |
| **Output Validation** | Generated config must be valid for target platform | Medium | Schema validation against Claude/Copilot formats |
| **File Generation** | Template → output file in correct location | Low | Write to `.github/copilot/agents/` or `.claude/agents/` |
| **Error Messages** | Clear feedback when template invalid or platform unsupported | Low | "Template missing required field: description" |
| **Idempotency** | Re-running install overwrites safely | Medium | Preserve user modifications vs regenerate—need clear policy |
| **Single Source Template** | One template file, not platform-specific copies | Medium | Avoids maintenance burden of parallel versions |
| **Metadata Transformation** | Platform-specific metadata fields (name, description format) | Medium | Claude uses YAML frontmatter, Copilot uses JSON |
| **Help/Documentation** | Users need to understand template syntax | Low | `--help`, README, error messages |

### Critical Dependencies

```
Platform Targeting → Conditional Logic → Output Validation → File Generation
                                    ↓
                            Single Source Template
```

**Why these are table stakes:**
- Without **platform targeting**, system can't distinguish output formats
- Without **conditional logic**, can't express platform differences
- Without **validation**, generates invalid configs that fail silently
- Without **single source**, maintenance becomes unsustainable (10 agents × 2 platforms = 20 files to keep in sync)

---

## Differentiators

Features that set product apart. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Dry-Run/Preview Mode** | See output before writing files | Low | `--dry-run` shows what would be generated |
| **Diff View** | Show changes from current to new version | Medium | Helpful for updates: "what changed in this release?" |
| **Auto-Detection** | Detect platform from environment or existing config | Medium | Check for `.github/copilot/` vs `.claude/` directories |
| **Bidirectional Support** | Update template from modified agent | High | Extract common template from Claude agent, generate Copilot version |
| **Template Validation** | Lint templates before use | Medium | Catch template errors at development time, not install time |
| **Migration Tools** | Convert existing agents to templates | Medium | One-time effort to adopt system: `agent-to-template` command |
| **Version Management** | Track template versions, agent versions independently | Medium | Template v2 can generate agent v1.5 format |
| **Hooks/Extensions** | Custom logic before/after generation | High | Post-install validation, pre-install checks |
| **Interactive Prompts** | Ask user for platform if not specified | Low | Better UX than requiring `--copilot` flag |
| **Partial Updates** | Update only metadata, not entire agent | Medium | Useful for version bumps without regenerating |
| **Multi-Agent Batch** | Install/update all 10 agents at once | Low | `install-all --copilot` convenience command |
| **Source Maps** | Track which template section generated which output | High | Debugging: "where did this line come from?" |
| **Template Inheritance** | Shared base template for common patterns | Medium | All agents share common structure |
| **Format Preservation** | Keep existing formatting/comments where possible | Low | Respect user preferences (tabs vs spaces) |
| **Rollback Support** | Undo installation if validation fails | Medium | Atomic operation: all succeed or all revert |

### Impact Assessment

**High-value, low-effort (do these first):**
- Dry-run mode
- Auto-detection
- Interactive prompts
- Multi-agent batch

**High-value, high-effort (do if time permits):**
- Bidirectional support
- Migration tools
- Template inheritance

**Low-value (defer unless requested):**
- Source maps
- Hooks/extensions (YAGNI until proven needed)

---

## Anti-Features

Features to explicitly NOT build. Common mistakes in this domain.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Runtime Platform Detection** | Agent should not detect platform at runtime—breaks "platform-agnostic" principle | Transform at install-time; agent receives optimized config |
| **Custom Template DSL** | Learning curve is friction; users already know basic templating | Use Jinja2/Handlebars or simple string replacement |
| **Embedded Agent Logic** | Platform-specific logic in agent code | Keep agents pure; platform differences only in metadata/config |
| **Manual Version Sync** | Requiring users to update template and agent versions separately | Single version identifier; template knows agent compatibility |
| **Lossy Roundtrips** | Template → Agent → Template loses information | If bidirectional, preserve all fields (even unknown ones) |
| **Implicit Defaults** | Guessing platform or values without telling user | Explicit flags; fail fast with clear errors |
| **Per-Platform Templates** | Separate template files for Claude vs Copilot | Single template with conditionals; enforce single source |
| **Complex Dependencies** | Template requires external tools (Python, Node, etc.) | Self-contained: pure Bash or built into CLI |
| **Over-Abstraction** | Generic "multi-platform framework" for all use cases | Solve this problem (agent templates) well; don't generalize prematurely |
| **GUI/Interactive Editor** | Visual template editor adds complexity | CLI-first; templates are text files in git |
| **Auto-Update** | Silently updating agents without user consent | Explicit update command; show diff; require confirmation |
| **Platform Emulation** | Making Copilot "look like" Claude or vice versa | Embrace differences; optimize for each platform's strengths |

### Rationale

**Why avoid these?**

1. **Runtime detection**: Violates "agent functionality unchanged" requirement. Platform optimizations must be baked in.
2. **Custom DSL**: Every new syntax is cognitive load. Use existing, familiar patterns.
3. **Manual sync**: Error-prone; humans forget; automate what can be automated.
4. **Per-platform templates**: Technical debt multiplier. 10 agents → 20 templates → 40 when adding third platform.
5. **Over-abstraction**: YAGNI. Build what's needed for this problem, not a general framework.

---

## Feature Dependencies

```
Core Flow:
  Template Source
      ↓
  Platform Targeting (--copilot flag)
      ↓
  Conditional Logic (if/else based on platform)
      ↓
  Metadata Transformation (YAML ↔ JSON)
      ↓
  Output Validation (schema check)
      ↓
  File Generation (write to disk)
      ↓
  [Optional] Verification (test agent works)

Enhanced Flow (with differentiators):
  Template Validation (before use)
      ↓
  Dry-Run Preview (show intent)
      ↓
  Core Flow (as above)
      ↓
  Rollback Support (if validation fails)
      ↓
  Diff View (show changes made)
```

### Conditional Dependencies

- **Bidirectional support** requires **lossless serialization** (preserve unknown fields)
- **Template inheritance** requires **template composition** (include/extend mechanics)
- **Migration tools** require **reverse transformation** (agent → template)
- **Rollback support** requires **backup strategy** (previous state storage)

---

## MVP Recommendation

For MVP, prioritize:

### Must Have (MVP 1.0)
1. ✅ **Variable substitution** — Use simple `{{VAR}}` pattern
2. ✅ **Platform targeting** — `--copilot` flag, default Claude
3. ✅ **Conditional logic** — Basic if/else for platform blocks
4. ✅ **Metadata transformation** — YAML frontmatter ↔ JSON object
5. ✅ **Output validation** — Check required fields exist
6. ✅ **File generation** — Write to correct platform directory
7. ✅ **Error messages** — Clear, actionable feedback
8. ✅ **Single source template** — One `.agent.template` file per agent

### Should Have (MVP 1.1)
9. ✅ **Dry-run mode** — Preview without writing
10. ✅ **Interactive prompts** — Ask platform if not specified
11. ✅ **Multi-agent batch** — Install all agents at once

### Nice to Have (MVP 2.0)
12. 🔲 **Auto-detection** — Infer platform from existing setup
13. 🔲 **Template validation** — Lint templates before use
14. 🔲 **Diff view** — Show changes on update
15. 🔲 **Migration tools** — Convert existing agents to templates

### Defer to Post-MVP
- Bidirectional support (complex, unclear if needed)
- Hooks/extensions (YAGNI until proven)
- Source maps (debugging feature, low ROI)
- Template inheritance (wait for duplication pain)
- Version management (add when versioning becomes problem)

---

## Complexity Ratings Explained

| Rating | Description | Effort Estimate |
|--------|-------------|-----------------|
| **Low** | Straightforward implementation; well-known patterns | 1-3 days |
| **Medium** | Requires design decisions; moderate testing burden | 4-10 days |
| **High** | Architectural challenge; extensive testing; edge cases | 2-4 weeks |

---

## Real-World Examples

### Similar Systems in the Wild

**Cookiecutter** (project templates):
- ✅ Single template → multiple outputs
- ✅ Variable substitution
- ✅ Interactive prompts
- ✅ Hooks for custom logic
- ❌ No platform targeting (one output format)

**Babel** (JavaScript transpilation):
- ✅ Platform targeting (ES5, ES2015, ESNext)
- ✅ Plugin architecture for transformations
- ✅ Source maps for debugging
- ❌ Not template-based (AST transformation)

**Terraform** (infrastructure templates):
- ✅ Multi-provider support (AWS, Azure, GCP)
- ✅ Conditional logic for provider differences
- ✅ Validation and dry-run (plan)
- ✅ Single source with provider blocks
- ✅ Version management
- ❌ Runtime transformation (not install-time)

**npm package.json "exports"**:
- ✅ Platform-specific entry points (Node vs browser)
- ✅ Conditional exports based on environment
- ✅ Single source of truth
- ✅ Well-documented, familiar to developers
- ❌ Runtime resolution (not generation)

### Lessons from Similar Systems

1. **Explicit over implicit**: Terraform requires provider blocks, Babel requires presets. Don't guess.
2. **Preview before apply**: Terraform's `plan` command is beloved. Dry-run is essential.
3. **Single source**: npm's "exports" field avoids duplicate package.json files. Follow this.
4. **Clear errors**: Babel's error messages show code context. Do this.
5. **Validation early**: Cookiecutter validates at generation time, not usage time. Validate templates before distribution.

---

## Sources

### HIGH Confidence (Official Documentation)
- Jinja2 templating: https://jinja.palletsprojects.com/en/3.1.x/
- Handlebars templating: https://handlebarsjs.com/guide/
- Cookiecutter project templates: https://cookiecutter.readthedocs.io/en/stable/
- Babel transpilation: https://babeljs.io/docs/
- npm package.json: https://docs.npmjs.com/cli/v10/configuring-npm/package-json

### MEDIUM Confidence (Ecosystem Patterns)
- Yeoman scaffolding patterns: https://yeoman.io/
- Template system feature comparison (synthesized from above sources)
- Multi-platform configuration patterns (observed in Terraform, Docker Compose, etc.)

### Confidence Assessment

| Area | Confidence | Reason |
|------|------------|--------|
| Core templating features | HIGH | Well-documented in Jinja/Handlebars official docs |
| Scaffolding patterns | HIGH | Cookiecutter and Yeoman are established, documented projects |
| Multi-platform patterns | MEDIUM | Synthesized from multiple domains (transpilation, infrastructure) |
| Agent-specific needs | MEDIUM | Based on project requirements, not external validation |

---

## Open Questions

1. **Template syntax**: Use Jinja2-style `{% if %}`, Handlebars-style `{{#if}}`, or simple string replacement? 
   - **Recommendation**: Simple string replacement for MVP (lowest complexity), migrate to Jinja2 if complexity grows
   
2. **Bidirectional support**: Is extracting templates from agents actually needed?
   - **Recommendation**: Wait for user request; one-time migration tool may suffice
   
3. **Template distribution**: Templates in repo, or separate package?
   - **Recommendation**: Co-locate with agents initially (`.agent.template` next to `.agent`), extract if reuse emerges
   
4. **Validation strictness**: Fail on unknown fields, or warn and continue?
   - **Recommendation**: Fail on missing required fields, warn on unknown (forward compatibility)

5. **Installation target**: Per-user global, per-project local, or both?
   - **Recommendation**: Per-project (`.github/copilot/`, `.claude/`) matches agent distribution model

---

## Gaps to Address

1. **Real-world validation**: No external confirmation that agent template systems exist—this may be greenfield
   - **Mitigation**: Strong patterns from adjacent domains (project templates, transpilers)
   
2. **GitHub Copilot agent format**: No public documentation found for Copilot agent metadata format
   - **Mitigation**: Reverse-engineer from Copilot CLI or examples
   
3. **Platform evolution**: What if Claude/Copilot add new metadata fields?
   - **Mitigation**: Forward compatibility—preserve unknown fields, warn instead of fail

4. **Testing strategy**: How to validate generated agents work correctly?
   - **Mitigation**: Post-generation validation (schema check + optional smoke test)

---

## Summary

**Table stakes (10 features)**: Variable substitution, platform targeting, conditional logic, metadata transformation, output validation, file generation, error messages, idempotency, single source template, help/documentation

**Differentiators (15 features)**: Dry-run mode (highest value), auto-detection, interactive prompts, multi-agent batch, migration tools, template validation, diff view, bidirectional support (most complex)

**Anti-features (12 features)**: Runtime detection, custom DSL, embedded agent logic, per-platform templates, over-abstraction, GUI editor

**MVP recommendation**: Focus on 8 table stakes features + 3 differentiators (dry-run, prompts, batch). Defer bidirectional support, hooks, and source maps until proven necessary.

**Biggest risk**: GitHub Copilot agent format may differ from assumptions—need to validate against real Copilot CLI.

**Confidence**: MEDIUM-HIGH overall (HIGH for template patterns, MEDIUM for agent-specific needs)
