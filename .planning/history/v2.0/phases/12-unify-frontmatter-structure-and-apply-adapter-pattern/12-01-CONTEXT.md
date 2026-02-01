# Phase 12: Unify frontmatter structure and apply adapter pattern - Context

**Gathered:** 2026-02-01
**Status:** Ready for planning

<domain>
## Phase Boundary

Reorganize frontmatter validation and rendering modules to follow consistent per-platform adapter pattern established in Phase 11. This includes evaluating module organization (bin/lib/frontmatter/ vs bin/lib/rendering/) and refactoring serialization/cleaning components to follow the one-per-platform pattern.

</domain>

<decisions>
## Implementation Decisions

### Module Organization
- Keep validation and serialization **separate** but rename for clarity
- `bin/lib/frontmatter/` → validation (already per-platform from Phase 11)
- `bin/lib/rendering/` → split into two modules:
  - `bin/lib/serialization/` → frontmatter serializers and cleaners (will be per-platform)
  - `bin/lib/templates/` → template-renderer.js (general EJS rendering, not frontmatter-specific)
- This separates concerns: validation → serialization → template rendering

### Serializer Pattern
- **One serializer per platform**: claude-serializer.js, copilot-serializer.js, codex-serializer.js
- Each serializer is **fully independent** (duplicate code like Phase 11 validators)
- Platform adapters own their serialization: each adapter imports its own serializer
- Example: claude-adapter.js imports claude-serializer.js directly

### Cleaner Pattern
- **One cleaner per platform**: claude-cleaner.js, copilot-cleaner.js, codex-cleaner.js
- Cleaners import and use their platform's serializer
- Cleaners return fully rebuilt content (not just data objects)
- API: `cleanFrontmatter(content)` returns `---\nYAML\n---\ncontent`
- Example: claude-cleaner.js imports and calls claude-serializer.js

### Migration Strategy
- **Wave 1**: Rename `bin/lib/rendering/` → `bin/lib/serialization/`, update all imports (no logic changes)
- **Wave 2**: Split shared serializer/cleaner into per-platform files (claude-serializer.js, copilot-serializer.js, codex-serializer.js, etc.)
- **Wave 3**: Move template-renderer.js to `bin/lib/templates/`, update imports
- Run test suite **after Wave 3 only** (at the end of all changes)

### Integration Pattern
- **Manual imports** like Phase 11 validators (no auto-discovery registry)
- Platform adapters explicitly import their serializer/cleaner
- Consistent with existing validator pattern

### Documentation
- Create `docs/adding-platforms.md` with complete checklist:
  - Platform adapter creation
  - Validator implementation
  - Serializer implementation
  - Cleaner implementation
  - Test coverage requirements
  - Documentation updates
- Guide should show step-by-step process for contributors adding new platforms

### Claude's Discretion
- Specific error messages during migration if imports fail
- Exact structure of docs/adding-platforms.md (tone, examples, formatting)
- Test organization and naming conventions
- Whether to add migration validation script

</decisions>

<specifics>
## Specific Ideas

- Follow Phase 11's independence philosophy: each platform's serializer/cleaner is self-contained
- Pattern consistency matters more than DRY: duplicated code is acceptable for platform isolation
- Current structure reference:
  - `bin/lib/frontmatter/`: base-validator.js, claude-validator.js, copilot-validator.js, codex-validator.js, field-validators.js, validation-error.js
  - `bin/lib/rendering/`: frontmatter-serializer.js (shared), frontmatter-cleaner.js (shared), template-renderer.js
- Migration affects ~10 import statements across the codebase

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 12-unify-frontmatter-structure-and-apply-adapter-pattern*
*Context gathered: 2026-02-01*
