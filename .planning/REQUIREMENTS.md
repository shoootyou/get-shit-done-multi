# Requirements: Multi-Platform Agent Optimization

**Defined:** 2026-01-21
**Core Value:** Agent definitions use native platform capabilities—Claude and Copilot each get configurations that leverage their specific features through declarative frontmatter, not interpretation.

## v1 Requirements

Requirements for initial release. Each maps to roadmap phases.

### Template Foundation

- [ ] **TMPL-01**: System uses variable substitution with {{variable}} syntax for platform-specific values
- [ ] **TMPL-02**: Template system integrates with existing install flags (--copilot, --local, --global)
- [ ] **TMPL-03**: Single source template file per agent (not platform-specific copies)
- [ ] **TMPL-04**: All 11 agents converted to template format
- [ ] **TMPL-05**: Generated output validated against platform schemas (Claude and Copilot specs)
- [ ] **TMPL-06**: Files generated using existing adapter logic and folder structure
- [ ] **TMPL-07**: Clear error messages when template invalid or platform unsupported
- [ ] **TMPL-08**: Re-running install overwrites safely (idempotency)
- [ ] **TMPL-09**: Help documentation for template syntax available to users

### Platform Compliance

- [ ] **PLAT-01**: Claude agent format validated using https://code.claude.com/docs/en/sub-agents#supported-frontmatter-fields
- [ ] **PLAT-02**: Copilot agent format generated using https://docs.github.com/en/copilot/reference/custom-agents-configuration
- [ ] **PLAT-03**: Both platforms have equal optimization priority (no compromise)
- [ ] **PLAT-04**: Tool names use correct case sensitivity (Bash, Read, Edit, Grep)
- [ ] **PLAT-05**: Platform-specific features documented (model, hooks for Claude; mcp-servers for Copilot)
- [ ] **PLAT-06**: Generated agents use YAML frontmatter for both platforms

### Installation Integration

- [ ] **INST-01**: Template system extends existing bin/install.js (not rewrite)
- [ ] **INST-02**: Template generation respects existing install flags: --copilot (GitHub Copilot to ./.github), --local (Claude to ./.claude), --global (Claude to ~/.claude)
- [ ] **INST-03**: --all flag reuses other parameters to install optimized agents for all detected CLIs
- [ ] **INST-04**: Uses existing adapter logic (claudeAdapter, copilotAdapter) for platform-specific paths
- [ ] **INST-05**: No external dependencies beyond Node.js and existing packages (gray-matter, js-yaml)
- [ ] **INST-06**: Works with existing CLI detection and adapter system

### Agent Preservation

- [ ] **AGNT-01**: Agent functionality unchanged—only metadata/config optimized
- [ ] **AGNT-02**: All existing agent capabilities preserved in templates
- [ ] **AGNT-03**: Agent behavior identical across Claude and Copilot platforms
- [ ] **AGNT-04**: Existing orchestration system continues to work with generated agents

### Versioning

- [ ] **VERS-01**: Package version bumped to 1.8.1 (patch release per semantic versioning)
- [ ] **VERS-02**: Version metadata embedded in generated agents
- [ ] **VERS-03**: Changelog documents optimization changes

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Enhanced Generation

- **TMPL-10**: Conditional logic for platform-specific sections ({% if platform == "copilot" %})
- **TMPL-11**: Metadata transformation between YAML and JSON formats

### User Experience

- **UX-01**: Dry-run/preview mode to see output before writing files
- **UX-02**: Interactive prompts ask user for platform if not specified
- **UX-03**: Auto-detection of platform from environment
- **UX-04**: Diff view showing changes from current to new version

### Advanced Features

- **ADV-01**: Migration tools to convert existing agents to templates
- **ADV-02**: Template validation linting at development time
- **ADV-03**: Template inheritance for shared base patterns
- **ADV-04**: Bidirectional support (update template from modified agent)

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Codex optimization | Deferred to future phase per project scope |
| Runtime platform detection | Violates "platform-agnostic agent" principle; transform at install-time |
| Custom template DSL | Learning curve friction; use existing templating patterns |
| Per-platform template files | Creates maintenance burden (11 agents × 2 platforms = 22 files to sync) |
| GUI/Interactive editor | CLI-first approach; templates are text files in git |
| Auto-update of agents | Silent updates without consent; requires explicit user action |
| Breaking changes | Must remain backward compatible; patch release only |
| Build step requirement | Preserve simplicity—pure JavaScript, no compilation |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| TMPL-01 | Phase 1 | Pending |
| TMPL-02 | Phase 4 | Pending |
| TMPL-03 | Phase 1 | Pending |
| TMPL-04 | Phase 3 | Pending |
| TMPL-05 | Phase 1 | Pending |
| TMPL-06 | Phase 3 | Pending |
| TMPL-07 | Phase 1 | Pending |
| TMPL-08 | Phase 4 | Pending |
| TMPL-09 | Phase 6 | Pending |
| PLAT-01 | Phase 2 | Pending |
| PLAT-02 | Phase 2 | Pending |
| PLAT-03 | Phase 2 | Pending |
| PLAT-04 | Phase 2 | Pending |
| PLAT-05 | Phase 6 | Pending |
| PLAT-06 | Phase 2 | Pending |
| INST-01 | Phase 4 | Pending |
| INST-02 | Phase 4 | Pending |
| INST-03 | Phase 4 | Pending |
| INST-04 | Phase 4 | Pending |
| INST-05 | Phase 4 | Pending |
| INST-06 | Phase 4 | Pending |
| AGNT-01 | Phase 3 | Pending |
| AGNT-02 | Phase 3 | Pending |
| AGNT-03 | Phase 3 | Pending |
| AGNT-04 | Phase 3 | Pending |
| VERS-01 | Phase 4 | Pending |
| VERS-02 | Phase 4 | Pending |
| VERS-03 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 27 total
- Mapped to phases: 27 (100% ✓)
- Unmapped: 0

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 after initialization*
