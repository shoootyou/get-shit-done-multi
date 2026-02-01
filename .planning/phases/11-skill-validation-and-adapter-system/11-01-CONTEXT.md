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
- **Fail-fast approach:** Stop immediately on first validation error
- **Error format:** Generate markdown bug report template automatically
- **Bug report includes:**
  - Template name (which skill failed)
  - Field name (which field is invalid)
  - Error description (what went wrong)
  - Expected format (what was expected per spec)
  - Spec reference URL (agentskills.io)
  - System info (package version, target platform, Node version)
- **GitHub issue link:** Include https://github.com/shoootyou/get-shit-done-multi/issues
- **No bypass:** Always validate, no way to skip (strict enforcement)
- Users copy/paste the formatted markdown report into GitHub issue

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
- **Invalid optional field behavior:** Platform decides
  - Some platforms fail on invalid optional fields
  - Some platforms warn and continue
  - Defined per-platform in validator implementation
- **Unknown field behavior:** Platform decides
  - Some platforms allow extra fields (permissive)
  - Some platforms reject unknown fields (strict)
  - Defined per-platform in validator implementation

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
