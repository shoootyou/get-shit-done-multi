# Domain Pitfalls: Multi-Platform Agent Template Systems

**Domain:** Template-based agent installation systems (Claude + Copilot)
**Researched:** 2025-01-20
**Confidence:** HIGH (based on official documentation from both platforms)

## Critical Pitfalls

Mistakes that cause silent failures, broken agents, or require complete rewrites.

---

### Pitfall 1: Case-Sensitive Tool Names Cause Silent Tool Loss

**What goes wrong:**
Templates use lowercase tool names (e.g., `bash`, `read`, `edit`) which work perfectly on Copilot but silently fail on Claude. The agent loads successfully but tools don't work because Claude expects exact case: `Bash`, `Read`, `Edit`.

**Why it happens:**
- Copilot tool aliases are case-insensitive
- Claude tool names are case-sensitive
- YAML parsers don't validate tool names against platform specs
- No error message when agent loads with invalid tool names

**Consequences:**
- Agents appear to work but can't execute tools
- Users get "tool not available" errors during invocation
- Debugging is hard because frontmatter validation passes
- 10 existing agents could all break if templates use wrong case

**Prevention:**
```yaml
# WRONG - works Copilot, breaks Claude
tools: ['bash', 'read', 'edit', 'grep']

# CORRECT - works both platforms
tools: ['Bash', 'Read', 'Edit', 'Grep']

# ALTERNATIVE - document platform differences in template
tools: ['Bash', 'Read', 'Edit']  # Claude: case-sensitive. Copilot: case-insensitive.
```

**Detection:**
- Test each generated agent on BOTH platforms
- Load agent and attempt to use each listed tool
- Check for "tool not available" errors in invocation logs
- Create integration test that invokes tools, not just parses frontmatter

**Phase mapping:** Phase 1 (Template Design) must establish canonical tool names.

---

### Pitfall 2: Tool Aliasing Creates Platform-Dependent Behavior

**What goes wrong:**
Template uses `Write` tool which exists on Claude but maps to `edit` on Copilot. Or uses `shell` which works on Copilot but doesn't exist on Claude. Agents behave differently across platforms despite "identical" configs.

**Why it happens:**
- Copilot supports multiple aliases for same tool (`edit` = `Edit` = `Write` = `MultiEdit`)
- Claude has distinct tool names with no aliasing
- Template designers pick tool names that work on one platform but mean something else (or nothing) on the other
- No cross-platform tool name registry

**Consequences:**
- Agent works on one platform, fails on the other
- Subtle behavior differences when tools overlap but differ
- Users can't reliably predict which tools agent has
- Maintenance nightmare tracking which aliases are safe

**Prevention:**
```yaml
# WRONG - Write exists on Claude, Edit on both, but aliases differ
tools: ['Write', 'shell']

# CORRECT - Use canonical names that exist on both
tools: ['Edit', 'Bash']  # 'Edit' = explicit on both, 'Bash' = canonical exec tool

# ALTERNATIVE - Platform-specific sections with validation
# tools: ['Bash', 'Read', 'Edit', 'Grep']  # Claude
# tools_copilot_aliases: ['execute', 'read', 'edit', 'search']  # Copilot equivalent
```

**Tool compatibility matrix:**
| Claude Name | Copilot Primary | Copilot Aliases | Safe to Use? |
|-------------|-----------------|-----------------|--------------|
| `Bash` | `execute` | `shell`, `Bash`, `powershell` | ✅ YES (`Bash` works both) |
| `Read` | `read` | `Read`, `NotebookRead` | ✅ YES (both accept `Read`) |
| `Edit` | `edit` | `Edit`, `Write`, `MultiEdit` | ✅ YES (both accept `Edit`) |
| `Grep` | `search` | `Grep`, `Glob` | ✅ YES (both accept `Grep`) |
| `Glob` | `search` | `Grep`, `Glob` | ✅ YES (both accept `Glob`) |
| `Write` | N/A (maps to `edit`) | N/A | ⚠️ RISKY (Claude-only) |
| `Task` | `agent` | `custom-agent`, `Task` | ⚠️ CONTEXT (different meaning) |
| `WebSearch` / `WebFetch` | `web` | `WebSearch`, `WebFetch` | ❌ NO (not in Copilot coding agent) |

**Detection:**
- Maintain tool compatibility matrix (above)
- Validate generated agent tools against matrix
- Integration tests on both platforms
- Check for platform-specific tool warnings in logs

**Phase mapping:** Phase 2 (Platform Abstraction) must create tool mapping layer.

---

### Pitfall 3: Model Field Creates False Optimization Expectations

**What goes wrong:**
Template includes `model: haiku` for performance optimization. Works great on Claude (fast, cheap). On Copilot, field is silently ignored—agent runs on same model as main conversation. Users expect Haiku performance but get Sonnet costs and latency.

**Why it happens:**
- Claude supports dynamic model selection per agent
- Copilot intentionally ignores `model` field for compatibility
- No warning when ignored fields are present
- Template designers assume field works everywhere

**Consequences:**
- Cost optimization doesn't port to Copilot
- Performance characteristics differ across platforms
- Users budget for Haiku, get billed for Sonnet
- Agent behavior may differ (Haiku vs Sonnet reasoning)

**Prevention:**
```yaml
# WRONG - creates false expectations
model: haiku  # Fast and cheap!

# CORRECT - document platform differences
# model: haiku  # CLAUDE ONLY: Uses Haiku for cost/speed. COPILOT: Ignored (uses main model)

# ALTERNATIVE - conditional generation
{% if platform == "claude" %}
model: haiku
{% endif %}
# NOTE: Copilot always uses main conversation model
```

**Detection:**
- Document which fields are platform-specific
- Warn users when Copilot config includes `model`
- Integration test: verify Copilot ignores model field
- Check invocation logs for model used vs model specified

**Phase mapping:** Phase 1 (Template Design) must document unsupported fields.

---

### Pitfall 4: DenyListing Tools Breaks On Copilot

**What goes wrong:**
Claude agent uses `disallowedTools: ['Write', 'Edit']` to create read-only agent. Field doesn't exist on Copilot. Agent loads but has write access when it shouldn't.

**Why it happens:**
- Claude supports both `tools` (allowlist) and `disallowedTools` (denylist)
- Copilot only supports `tools` (allowlist)
- Copilot's "unrecognized fields are ignored" policy hides the problem
- No validation error when Copilot sees `disallowedTools`

**Consequences:**
- Security boundary disappears on Copilot
- Read-only agents become read-write
- Users trust agent won't modify code, but it can
- Template can't enforce constraints across platforms

**Prevention:**
```yaml
# WRONG - denylist doesn't work on Copilot
tools: ['Bash', 'Read', 'Grep', 'Glob']
disallowedTools: ['Write', 'Edit']  # Ignored on Copilot!

# CORRECT - use allowlist only
tools: ['Bash', 'Read', 'Grep', 'Glob']  # Explicitly list allowed tools
# Both platforms honor allowlist. Don't use disallowedTools.

# IN PROMPT - reinforce constraints
# "You are a READ-ONLY agent. Never modify files. If user requests changes, explain you cannot edit."
```

**Detection:**
- Avoid `disallowedTools` in templates entirely
- Use allowlisting for all tool restrictions
- Reinforce read-only behavior in agent prompt text
- Test agent on Copilot: verify it respects tool limits

**Phase mapping:** Phase 2 (Platform Abstraction) must map denylist to allowlist.

---

### Pitfall 5: Frontmatter YAML Parsing Ambiguities

**What goes wrong:**
Template generates `tools: [Bash, Read]` (unquoted) which parses as booleans or keywords in some YAML parsers instead of strings. Or uses `description: >` with wrong indentation, causing multiline description to break.

**Why it happens:**
- YAML has complex parsing rules (quoted vs unquoted strings)
- `Read`, `Write`, `Bash` can be interpreted as keywords
- Indentation-sensitive syntax is error-prone
- Template engines may not escape YAML special chars

**Consequences:**
- Agent fails to load with cryptic YAML parse errors
- Different YAML parsers behave differently
- Works in development, breaks in production
- Users can't tell if it's a template bug or user error

**Prevention:**
```yaml
# WRONG - unquoted can be misinterpreted
tools: [Bash, Read, Edit]
description: >
  Multi-line description
  with wrong indentation

# CORRECT - always quote strings in arrays
tools: ['Bash', 'Read', 'Edit']
description: 'Single-line description avoids multiline complexity'

# OR - use explicit block syntax with correct indentation
tools:
  - 'Bash'
  - 'Read'
  - 'Edit'
description: >-
  Multi-line description
  with consistent indentation
  and explicit block scalar
```

**YAML gotchas for agent frontmatter:**
- Always quote tool names: `'Bash'` not `Bash`
- Use `'single quotes'` to avoid escape issues
- Avoid `:` in unquoted strings (triggers key parsing)
- Be careful with `*`, `[`, `{` (YAML special chars)
- Test with multiple YAML parsers (JS, Python, Ruby)

**Detection:**
- Validate generated YAML with multiple parsers
- Use YAML linting in template tests
- Check for parse errors on both platforms
- Test edge cases: empty arrays, special chars, long strings

**Phase mapping:** Phase 3 (Generation Logic) must emit valid YAML.

---

### Pitfall 6: Install-Time Generation Creates Version Drift

**What goes wrong:**
User installs agent template at v1.0. Spec changes in v1.2 (new tool alias, deprecated field). User's installed agents work fine but new installs generate incompatible configs. Two users with "same" agent have different configs.

**Why it happens:**
- Generation happens once at install time, not at runtime
- Template updates don't automatically update installed agents
- No version tracking in generated files
- Users don't know their agent is out of date

**Consequences:**
- Impossible to debug "works for me" issues
- Security fixes don't propagate to installed agents
- Breaking spec changes require manual user updates
- Support burden: which version is user running?

**Prevention:**
```yaml
# GENERATED FILE - DO NOT EDIT MANUALLY
# Generated by: agent-installer v1.2.3
# Template version: v1.0.0
# Generation date: 2025-01-20T10:30:00Z
# Platform: claude
# Source: https://github.com/org/repo/tree/main/templates/agent-name.yml
---
name: agent-name
description: ...
```

**Version tracking strategy:**
1. Embed generation metadata in comments
2. Include template version + installer version
3. Add source URL for original template
4. Create upgrade command: `agent-installer upgrade agent-name`
5. Check for outdated agents on startup

**Detection:**
- Scan installed agents for version metadata
- Compare against current template versions
- Warn users when agents are outdated
- Provide upgrade instructions

**Phase mapping:** Phase 4 (Installation Workflow) must embed version metadata.

---

### Pitfall 7: Prompt Character Limits Differ Across Platforms

**What goes wrong:**
Template generates 35,000 character prompt that works fine on Claude but silently truncates on Copilot (30,000 char limit). Agent behavior differs because system prompt is cut off mid-sentence.

**Why it happens:**
- Copilot has 30,000 character prompt limit
- Claude limit is undocumented (likely higher)
- Template doesn't validate prompt length
- Truncation is silent, no error message

**Consequences:**
- Agent instructions incomplete on Copilot
- Critical constraints may be cut off
- Behavior differs across platforms
- Hard to debug (no error, just wrong behavior)

**Prevention:**
```python
# In template generation
MAX_PROMPT_LENGTH = 28000  # Safety margin below Copilot's 30k limit

def validate_prompt(prompt: str, platform: str):
    if len(prompt) > MAX_PROMPT_LENGTH:
        raise ValueError(
            f"Prompt too long: {len(prompt)} chars. "
            f"Max: {MAX_PROMPT_LENGTH} (Copilot limit: 30,000)"
        )
    return prompt

# OR - warn in generated file
{% if prompt|length > 28000 %}
# WARNING: Prompt is {{ prompt|length }} characters.
# Copilot limit: 30,000. Consider shortening.
{% endif %}
```

**Detection:**
- Measure prompt length during generation
- Fail if exceeds safe limit (28k)
- Test agent loading on both platforms
- Check for truncation warnings

**Phase mapping:** Phase 3 (Generation Logic) must validate prompt length.

---

### Pitfall 8: MCP Server Configuration Is Platform-Asymmetric

**What goes wrong:**
Template includes `mcp-servers` configuration which works on Copilot (org/enterprise level) but doesn't exist on Claude. Or assumes Claude's MCP auto-inheritance when Copilot requires explicit config.

**Why it happens:**
- MCP configuration syntax differs completely:
  - Claude: Global config, agents inherit MCP tools
  - Copilot: Agent-specific `mcp-servers` in frontmatter (org/enterprise only)
- Repository-level Copilot agents can't define MCP servers
- Template tries to be DRY, creates platform-specific behavior

**Consequences:**
- MCP-dependent agents work on one platform, fail on other
- Repository-level agents can't use custom MCP on Copilot
- Template complexity explodes handling MCP differences
- Users confused why same agent has different capabilities

**Prevention:**
```yaml
# CLAUDE: No MCP config in agent (inherits from global)
---
name: agent-with-mcp
tools: ['Read', 'some-mcp-server/tool-name']  # References global MCP
---

# COPILOT (org/enterprise): MCP config in agent frontmatter
---
name: agent-with-mcp
tools: ['read', 'custom-mcp/tool-1']
mcp-servers:
  custom-mcp:
    type: 'local'
    command: 'some-command'
    args: ['--arg1']
    tools: ["*"]
---

# COPILOT (repository): Can't define MCP, must use repo-configured servers
---
name: agent-with-mcp
tools: ['read', 'github/get_file_contents']  # References repo-level MCP
---
```

**Strategy:**
- Document MCP configuration differences prominently
- For repository-level agents: don't use custom MCP (not portable)
- For org/enterprise: generate platform-specific MCP blocks
- Consider MCP a non-portable feature

**Detection:**
- Check if template uses MCP
- Validate MCP config against platform + scope
- Test agent with MCP tools on both platforms
- Document which agents require MCP setup

**Phase mapping:** Phase 2 (Platform Abstraction) must handle MCP divergence.

---

### Pitfall 9: Tool Wildcard Semantics Differ

**What goes wrong:**
Template uses `tools: ['*']` expecting "all tools." On Claude, this might be interpreted literally as a tool named `*`. On Copilot, it means "enable all tools." Agent has no tools on Claude but all tools on Copilot.

**Why it happens:**
- Copilot explicitly documents `tools: ["*"]` as "all tools" syntax
- Claude doesn't document wildcard behavior
- Omitting `tools` field is the Claude way to inherit all tools
- Template designers use Copilot syntax for Claude

**Consequences:**
- Agent completely broken on Claude (no tools)
- Works perfectly on Copilot
- Inverse of usual failure mode (Claude breaks, Copilot works)

**Prevention:**
```yaml
# WRONG - '*' is Copilot-specific syntax
tools: ['*']

# CORRECT - omit field for "all tools"
# (no tools field) = inherit all tools (Claude) or all available (Copilot)

# OR - explicitly list all needed tools
tools: ['Bash', 'Read', 'Edit', 'Grep', 'Glob']  # Portable

# COPILOT-SPECIFIC - use wildcard only if needed
tools: ['*']  # Only on Copilot for truly all tools
```

**Detection:**
- Check for `tools: ['*']` in templates
- Test "all tools" config on both platforms
- Verify agent can use expected tools
- Document platform differences in template

**Phase mapping:** Phase 1 (Template Design) must avoid wildcards.

---

### Pitfall 10: Skills and Hooks Are Claude-Only

**What goes wrong:**
Template includes `skills` or `hooks` which are powerful Claude features. Copilot silently ignores these fields. Agent has superpowers on Claude but is basic on Copilot.

**Why it happens:**
- Claude has `skills` (inject content) and `hooks` (lifecycle events)
- Copilot has neither feature
- "Unrecognized fields ignored" policy hides the issue
- Template designers assume features are standard

**Consequences:**
- Agent capabilities differ dramatically across platforms
- Skills-dependent agents completely broken on Copilot
- Hooks don't fire on Copilot (no error, just silent failure)
- Users expect behavior they don't get

**Prevention:**
```yaml
# IF agent requires Claude-only features:
---
name: skill-dependent-agent
description: Uses advanced Claude features (Claude-only)
skills: ['some-skill']  # CLAUDE ONLY - Copilot ignores
hooks:  # CLAUDE ONLY - Copilot ignores
  on_create: 'echo "Agent created"'
---

# PROMINENTLY document in agent description:
# "⚠️ CLAUDE ONLY: This agent uses Skills and Hooks. Not compatible with Copilot."

# OR - make agent work without skills/hooks
# Embed skill content directly in prompt instead of referencing
# Use prompt text instead of hooks for initialization
```

**Strategy:**
1. Avoid skills/hooks if cross-platform is required
2. If Claude-only, document clearly and fail gracefully on Copilot
3. Consider separate templates for Claude-enhanced vs portable agents
4. Test on both platforms to verify behavior

**Detection:**
- Scan for `skills` or `hooks` in templates
- Flag agents as "Claude-only"
- Test on Copilot: verify agent works (differently) or fails gracefully
- Document feature support matrix

**Phase mapping:** Phase 1 (Template Design) must decide on cross-platform vs platform-specific agents.

---

## Moderate Pitfalls

Mistakes that cause delays, technical debt, or poor user experience but are recoverable.

---

### Pitfall 11: Template Complexity Explosion

**What goes wrong:**
Template starts simple but grows conditional logic for every platform difference. Becomes unmaintainable spaghetti of `{% if platform == "claude" %}` blocks. Adding third platform (VS Code) is impossible.

**Why it happens:**
- Every spec difference adds conditionals
- No abstraction layer between template and platform
- Copy-paste solutions instead of systematic design
- "Just one more if statement" mindset

**Prevention:**
- Create platform abstraction layer (tool mapper, field validator)
- Use separate template files per platform if differences are large
- Extract common logic into shared functions
- Limit template conditionals to <10% of content

**Detection:**
- Count `if` statements in template
- Measure template cognitive complexity
- Try adding mock third platform—how hard is it?
- Code review: is template logic understandable?

**Phase mapping:** Phase 2 (Platform Abstraction) prevents this.

---

### Pitfall 12: No Round-Trip Validation

**What goes wrong:**
Template generates agent. User installs. Agent loads. But does it *work*? No validation that generated config is actually valid and functional on target platform.

**Why it happens:**
- Generation is separate from validation
- Testing happens manually, inconsistently
- No CI that installs and invokes agents
- "It parsed" ≠ "It works"

**Prevention:**
- Integration tests that install + invoke agents
- Test on both platforms in CI
- Verify each tool is actually usable
- Test agent accomplishes its described task

**Detection:**
- CI pipeline that generates, installs, tests agents
- Smoke test: invoke agent with simple task
- Verify tool usage in logs
- Check agent produces expected outputs

**Phase mapping:** Phase 5 (Testing Strategy) must include round-trip tests.

---

### Pitfall 13: Install-Time Errors Are User-Hostile

**What goes wrong:**
Installation fails with cryptic error: "YAML parse error line 23." User has no idea what went wrong or how to fix it. No context, no suggestions, no recovery.

**Why it happens:**
- Errors from YAML parsers are technical
- No context about which template or platform
- No suggestions for common mistakes
- No way to validate before installing

**Prevention:**
```python
# Good error handling
try:
    agent = parse_yaml(generated_content)
except YAMLError as e:
    raise InstallError(
        f"Failed to parse agent '{agent_name}' for {platform}.\n"
        f"YAML error: {e}\n\n"
        f"Common causes:\n"
        f"  - Unquoted tool names (use 'Bash' not Bash)\n"
        f"  - Incorrect indentation\n"
        f"  - Special characters in description\n\n"
        f"Generated file saved to: {debug_path}\n"
        f"Please report at: {issue_url}"
    )
```

**Detection:**
- Test error paths (malformed input, invalid config)
- User testing: can non-experts fix errors?
- Check error messages include context + suggestions
- Provide debug mode that saves generated files

**Phase mapping:** Phase 4 (Installation Workflow) must handle errors gracefully.

---

### Pitfall 14: Documentation Drift From Implementation

**What goes wrong:**
README says "works on Claude and Copilot." Implementation generates Claude-only features. Or docs show old example that doesn't match current template output.

**Why it happens:**
- Docs updated separately from code
- Examples aren't generated from tests
- No CI check that docs match reality
- Platform support changes, docs don't

**Prevention:**
- Generate docs examples from actual template output
- CI checks docs examples are valid
- Explicitly document platform-specific features
- Version docs with code

**Detection:**
- Doc review: do examples match generated output?
- Try following docs as new user
- Check platform support claims against tests
- Verify examples parse and work

**Phase mapping:** Phase 6 (Documentation) must be testable.

---

### Pitfall 15: Breaking Changes Have No Migration Path

**What goes wrong:**
Template v2.0 changes tool names or renames fields. Existing installed agents break. No upgrade path, users must manually fix or reinstall.

**Why it happens:**
- Generation is one-way (template → file)
- No way to update installed agents
- Breaking changes not versioned or documented
- "Just reinstall" isn't a solution for customized agents

**Prevention:**
- Semantic versioning for templates
- CHANGELOG documenting breaking changes
- Upgrade command that migrates old agents
- Support old formats for one major version

**Detection:**
- Test upgrade path in CI
- Install v1.0 agent, upgrade to v2.0
- Verify agent still works after upgrade
- Check migration docs are accurate

**Phase mapping:** Phase 4 (Installation Workflow) needs upgrade support.

---

## Minor Pitfalls

Annoyances that cause confusion but are easily fixable.

---

### Pitfall 16: No Visual Distinction Between Platforms

**What goes wrong:**
User installs agent, doesn't know which platform it's for. File named `agent.md` works on Claude but not Copilot (should be `.agent.md`). Or tries to use Claude agent on Copilot.

**Prevention:**
- Use platform-specific file extensions or directories
- Comment at top: `# Generated for Claude Code`
- Installation confirms platform during install
- Docs clearly state which platform

**Detection:**
- Check file has platform marker
- Verify file extension matches platform
- Test: can user identify platform from file alone?

---

### Pitfall 17: Empty Tools Array Ambiguity

**What goes wrong:**
Template generates `tools: []` meaning "no tools" but user expects "all tools."

**Prevention:**
- Document that `tools: []` disables all tools
- Use comment: `tools: []  # No tools enabled`
- Warn during generation if tools list is empty
- Validate agent can accomplish its purpose with no tools

**Detection:**
- Check for empty `tools: []` in generated files
- Test agent actually works with empty tools
- Verify it's intentional, not a bug

---

### Pitfall 18: Inconsistent Naming Conventions

**What goes wrong:**
Some agents use `snake_case`, others `kebab-case`, others `camelCase`. Names don't sort well or are hard to remember.

**Prevention:**
- Enforce `kebab-case` for all agent names (both platforms support it)
- Validate naming during generation
- Lint template names in CI

**Detection:**
- Scan agent names for consistency
- Check against naming convention
- User testing: are names memorable?

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Template Design | Tool name case sensitivity, wildcard syntax | Establish canonical names early, test both platforms |
| Platform Abstraction | Tool aliasing, MCP config divergence | Build mapper layer, avoid platform-specific features |
| Generation Logic | YAML escaping, prompt length | Validate output, use safe YAML generation |
| Installation Workflow | Version drift, error handling | Embed metadata, provide helpful errors |
| Testing Strategy | No round-trip validation | Test install + invoke, not just parsing |
| Documentation | Examples don't match output | Generate examples from actual output |

---

## Sources

**HIGH confidence sources (official documentation):**
- Claude Code subagents documentation: https://code.claude.com/docs/en/sub-agents
- GitHub Copilot custom agents configuration: https://docs.github.com/en/copilot/reference/custom-agents-configuration
- Specification comparison: see `/tmp/spec_analysis.md` (created from official docs)

**Domain knowledge (multi-platform systems):**
- YAML parsing pitfalls: general knowledge + official specs
- Template system complexity: architectural patterns + official warnings
- Version drift: standard versioning practices
- Install-time generation issues: deployment best practices

**What wasn't verified:**
- Exact character limits on Claude (undocumented)
- Future spec changes (can only document current state)
- Performance implications of tool restrictions
- User experience impact (requires user testing)

---

## Summary

Multi-platform agent template systems face **10 critical pitfalls**, **5 moderate pitfalls**, and **3 minor pitfalls**.

**Most dangerous:**
1. Tool name case sensitivity (silent breakage)
2. Tool aliasing differences (behavior divergence)
3. Model field ignored on Copilot (false expectations)
4. DenyListing doesn't work cross-platform (security)
5. Install-time generation causes version drift (support nightmare)

**Key principle:** When in doubt, use the intersection of both specs, not the union. Features that don't exist on both platforms should be avoided or clearly marked as platform-specific.

**Testing mandate:** Every generated agent must be tested on BOTH platforms with actual tool invocation, not just frontmatter parsing.
