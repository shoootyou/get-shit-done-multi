# Phase 11: Skill Validation and Adapter System - Context

**Gathered:** 2026-01-31
**Status:** Ready for planning

<domain>
## Phase Boundary

Create validation layer and flexible adapter system to ensure skill frontmatter compliance with agentskills.io spec and platform-specific extensions. This phase is **skills only** — agents are not included.

</domain>

<decisions>
## Implementation Decisions

### Validation Error Experience
- **Fail-fast approach:** Stop immediately on first validation error (required fields only)
- **Error format:** Print formatted error to console with all context
- **Console error output includes:**
  - Template name (which skill failed)
  - Field name (which field is invalid)
  - Error description (what went wrong)
  - Actual value (what was provided)
  - Expected format (what was expected per spec)
  - Spec reference URL (agentskills.io)
  - System info (package version, target platform, Node version)
  - GitHub issue link for reporting
- **GitHub issue link:** Include https://github.com/shoootyou/get-shit-done-multi/issues
- **No file writes:** All error information displayed in console
- **User reporting:** Users copy/paste console output into GitHub issue (no automatic file generation)
- **Warning vs Error:**
  - Required fields (name, description): Print error and stop installation
  - Optional fields (allowed-tools, argument-hint): Print warning and continue installation
  - Unknown fields: Print warning and continue installation

### Validator Integration Point
- **Validation timing:** Both raw template AND rendered output
  - Validate before template variable replacement
  - Validate after `{{PLATFORM_ROOT}}` and other variables replaced
- **Validation granularity:** Individual file validation (per-skill)
- **Validator invocation:** Validators integrated into platform adapters
  - Each adapter validates its own output
  - Validation happens during adapter's `transformFrontmatter()` method
- **Scope:** Skills only (SKILL.md files) — agents not included

### Platform Validator Extensibility
- **Registration:** Auto-discovery pattern
  - Scan `/bin/lib/frontmatter/` for `*-validator.js` files
  - No manual registration needed
- **Export pattern:** Named exports
  - `export class ClaudeValidator extends BaseValidator`
  - `export class CopilotValidator extends BaseValidator`
- **Platform identification:** Validator declares supported platforms
  - `supportedPlatforms: ['claude']` property on validator class
  - Research `/bin/lib/platforms/platform-names.js` for reusable constants
  - Avoid hardcoded platform name strings
- **Testing strategy:** Integration tests only
  - Test validators with platform adapters together
  - No separate unit tests for validators (they're simple)

### Field Validation Strictness
- **Overall strictness:** Mixed approach
  - Required fields (name, description): fail on any violation
  - Optional fields (argument-hint, allowed-tools): warn only
- **Invalid optional field behavior:** Warn and continue (2026-02-01 decision)
  - Optional fields that fail validation generate warnings
  - Installation continues with field skipped
  - User sees warning in console but process doesn't fail
- **Unknown field behavior:** Warn but don't fail (2026-02-01 decision)
  - Unknown fields generate warnings
  - Fields may be ignored by target platform
  - Permissive by default

### Field Validation Rules

**Name field (required):**
- 1-64 characters
- No quotes (single or double)
- Letters, numbers, hyphens only
- Single line (no line breaks)
- Spec: https://agentskills.io/specification#name-field

**Description field (required):**
- Max 1024 characters
- No quotes (single or double)
- Letters, numbers, spaces, hyphens, periods only
- Prevent special characters (!, @, #, $, %, etc.)
- Single line (no line breaks)
- Spec: https://agentskills.io/specification

**Frontmatter structure:**
- Must have proper `---` delimiters at start and end
- Cannot be empty (e.g., `---\n\n---`)
- Must include both required fields

### Quote Handling (2026-02-01 Decision)
- **Use YAML standard recommendation**
- Validate parsed values AFTER YAML parsing
- Wrapping quotes (e.g., `"Help command"`) are YAML syntax, removed by parser
- Apostrophes in content (e.g., `Don't`) are valid per YAML standard
- No need to detect or reject quote characters — YAML parser handles this

### Tool Format (2026-02-01 Decision)
- **Tools must be same format (capitalized) in ALL platforms**
- Format: Capitalized, comma-separated string: `"Read, Write, Bash"`
- Base validator enforces this format for all platforms
- No platform-specific tool transformations
- Platform adapters no longer need `transformTools()` method for format

### Field Declaration (2026-02-01 Decision)
- **Required fields:** Declared in base validator, fail on violation
  - `name` (required)
  - `description` (required)
- **Optional fields:** Declared per platform, warn on violation
  - `allowed-tools` (optional)
  - `argument-hint` (optional)
  - `skills` (optional, Claude-specific)
- **Unknown fields:** Not in known list, warn but don't fail
- Validators declare field requirements via validation method

### Claude's Discretion
- Exact error message wording (as long as it includes required info)
- Validator base class interface design
- Field validator utility function organization
- Test structure and assertions
- Performance optimizations

</decisions>

<specifics>
## Specific Ideas

- Use `/bin/lib/platforms/platform-names.js` for platform name constants
- Pattern validation error report similar to existing error formats in codebase
- Validation architecture mirrors `/bin/lib/platforms/` pattern:
  - `base-validator.js` (interface)
  - `claude-validator.js`, `copilot-validator.js`, `codex-validator.js` (implementations)
  - Each validator functions independently (code isolation)
- Base spec: https://agentskills.io/specification
- Claude extensions: https://code.claude.com/docs/en/slash-commands#frontmatter-reference

</specifics>

<deferred>
## Deferred Ideas

- Agent validation — separate phase if needed
- Template sandboxing — already in roadmap as future enhancement (v2.2)
- Custom field support beyond platform specs — user can propose if needed

</deferred>

---

*Phase: 11-skill-validation-and-adapter-system*
*Context gathered: 2026-01-31*
