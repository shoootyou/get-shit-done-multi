# Phase 1: Foundation & Schema - Research

**Researched:** 2025-01-22
**Domain:** Skill specification schema and directory structure for multi-platform CLI installation
**Confidence:** HIGH

## Summary

Phase 1 establishes the `/specs/skills/` directory structure and canonical schema for GSD command specifications. This phase replicates the proven `/specs/agents/` pattern that successfully supports multi-platform generation for 13 agent specs with 208 passing tests. The architecture is already complete—spec-parser, context-builder, engine, tool-mapper, and platform adapters exist and work. This phase defines the schema standards and proves the architecture with one test skill migration (gsd-help).

**Key finding:** The existing template system (`bin/lib/template-system/`) handles everything needed for skills. The same YAML frontmatter parsing (gray-matter 4.0.3), Mustache conditional rendering, tool mapping, and platform-specific field transformation that works for agents will work identically for skills. The only differences are: (1) folder structure (`gsd-*/SKILL.md` instead of flat files), (2) target directories (commands vs agents), and (3) metadata fields for versioning.

**Primary recommendation:** Follow the agent spec pattern exactly. Create `/specs/skills/gsd-help/SKILL.md` with the same frontmatter structure agents use (name, description, conditional tools), same Mustache syntax (`{{#isClaude}}`), same metadata approach (platform, generated timestamp, versions). Test against the existing generator.js pipeline to prove compatibility before bulk migration.

## Standard Stack

The project already has all required technology. No new dependencies needed.

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| gray-matter | 4.0.3 | YAML frontmatter parsing | Proven in spec-parser.js for 13 agent specs, handles `---` delimited frontmatter with zero issues, used in 208+ passing tests |
| js-yaml | 4.1.1 | YAML serialization | Required for platform-specific formatting (arrays vs strings), handles flowLevel options for single-line arrays |
| Node.js built-ins | 16.7.0+ | fs, path, util | Zero external dependencies for file operations, path resolution cross-platform (POSIX/Windows) |
| Mustache conditionals | Custom regex | Template engine for `{{#var}}...{{/var}}` | Custom implementation in engine.js, proven for 13 agents, handles nested conditionals and variable substitution |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| matter() API | 4.0.3 | Parse strings or files | `matter.read(path)` for files, `matter(content)` for strings (testing) |
| yaml.dump() | 4.1.1 | Serialize frontmatter | Platform-specific formatting with flowLevel, lineWidth options |
| path.join() | Built-in | Cross-platform paths | Always—prevents Windows/POSIX path separator issues |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| gray-matter | Manual regex | gray-matter handles edge cases (quoted strings, multiline, escape sequences)—manual parsing breaks on real-world complexity |
| Custom conditionals | Handlebars/Mustache libraries | Current regex-based approach is 100 lines, zero dependencies, proven for 13 agents—library adds 50KB+ for features we don't use |
| js-yaml | JSON.stringify() | YAML supports comments, human-readable format, platform conventions (tools: [a, b] vs "tools": ["a", "b"])—JSON breaks readability |

**Installation:**
```bash
# Already installed (check package.json dependencies)
npm list gray-matter js-yaml
# Expected output:
# get-shit-done-multi@1.9.0
# ├── gray-matter@4.0.3
# └── js-yaml@4.1.1
```

## Architecture Patterns

### Recommended Project Structure
```
/specs/skills/
├── README.md                    # Schema documentation, examples, validation rules
├── gsd-help/                    # Folder-per-skill structure
│   └── SKILL.md                 # Single source of truth for gsd-help command
├── gsd-new-project/
│   └── SKILL.md
└── [27 more skills...]
```

**Key decisions:**
- Folder-per-skill (not flat files) enables future expansion (assets, templates, workflows per skill)
- File named `SKILL.md` (not skill name) keeps glob patterns simple (`/specs/skills/*/SKILL.md`)
- README at `/specs/skills/README.md` documents schema, serves as single source of truth
- No nested folders (keeps depth to 2 levels maximum for glob performance)

### Pattern 1: Canonical Frontmatter Schema
**What:** YAML frontmatter block at top of SKILL.md with name, description, tools, and metadata fields
**When to use:** Every skill spec—this is the contract between specs and generator pipeline

**Example:**
```yaml
---
name: gsd-help
description: "Show available GSD commands and usage guide"

{{#isClaude}}
tools: [Read, Bash]
{{/isClaude}}
{{#isCopilot}}
tools: [read, execute]
{{/isCopilot}}
{{#isCodex}}
tools: [read, bash]
{{/isCodex}}
---
```

**Source:** Proven pattern from `/specs/agents/gsd-planner.md`, gsd-executor.md, and 11 other agents. The generator.js pipeline expects this exact structure.

**Field requirements:**
- `name`: Required. Format `gsd-{command}` for skills (replaces legacy `gsd:{command}` with hyphen)
- `description`: Required. Brief summary for CLI help text, keep under 80 chars
- `tools`: Required. Platform-conditional blocks for tool access (Claude: uppercase, Copilot/Codex: lowercase)
- `metadata`: Optional. Auto-generated fields (platform, generated timestamp, versions) added by field-transformer.js

### Pattern 2: Metadata Template Structure
**What:** Standardized metadata fields for versioning, timestamps, and platform tracking
**When to use:** Auto-generated during install.js processing—not authored in spec files

**Example (Claude output):**
```yaml
---
name: gsd-help
description: "Show available GSD commands and usage guide"
tools: [Read, Bash]
# Note: Claude doesn't support metadata field, fields are top-level
---
```

**Example (Copilot output):**
```yaml
---
name: gsd-help
description: "Show available GSD commands and usage guide"
tools: [read, execute]
metadata:
  platform: copilot
  generated: '2025-01-22T12:34:56.789Z'
  gsdVersion: '1.9.0'
---
```

**Source:** field-transformer.js `addPlatformMetadata()` function, platform capabilities defined in PLATFORM_CAPABILITIES object.

**Platform differences:**
- **Claude:** No metadata field support—fields are top-level or omitted
- **Copilot/Codex:** Nested metadata object with platform, generated, gsdVersion
- **Timestamp format:** ISO 8601 string (js-yaml requires quotes to prevent date parsing)
- **Version source:** package.json `version` field (1.9.0)

### Pattern 3: Command Name Mapping
**What:** Table documenting legacy `gsd:*` names to new `gsd-*` names for all 29 commands
**When to use:** Reference during migration to prevent incorrect command references

**Format:**
```markdown
| Legacy Name | New Name | Notes |
|-------------|----------|-------|
| gsd:help | gsd-help | Simple command, no subagent spawning |
| gsd:new-project | gsd-new-project | Orchestrator, spawns 4 parallel researchers |
```

**Source:** Analyze `commands/gsd/*.md` frontmatter name fields, map to folder structure

**Critical:** Commands reference each other by name (Task tool invocations, workflow @-references). Incomplete mapping causes runtime failures when one command invokes another using wrong name format.

### Pattern 4: Folder-Per-Skill Structure
**What:** Each skill gets dedicated folder under `/specs/skills/` containing SKILL.md
**When to use:** All skill specs—enables future expansion (assets, templates, sub-workflows)

**Structure:**
```
/specs/skills/gsd-help/
└── SKILL.md                # Spec file (frontmatter + body)

/specs/skills/gsd-new-project/
└── SKILL.md                # Future: add templates/, workflows/ subdirs
```

**Benefits:**
- Scales to complex commands (new-project could have templates/ subfolder for PROJECT.md generation)
- Glob patterns simple (`/specs/skills/*/SKILL.md` finds all specs)
- Folder name becomes skill identifier (no parsing needed)
- Supports assets (icons, config files) per skill

**Constraints:**
- Folder name must match skill name: `gsd-help/` for `name: gsd-help`
- File must be named `SKILL.md` (case-sensitive, all-caps)
- No nested skill folders (maximum depth: `/specs/skills/{name}/SKILL.md`)

### Anti-Patterns to Avoid

- **Flat file structure** (`/specs/skills/gsd-help.md`): Works initially but doesn't scale when skills need templates, workflows, or assets. Agents use flat files but have no such needs. Refactor cost: high (glob patterns, path logic, tests).

- **Inconsistent casing** (`skill.md` vs `SKILL.md` vs `Skill.md`): Cross-platform filesystems handle differently (macOS case-insensitive, Linux case-sensitive). Pick one (SKILL.md) and enforce globally. Breaking on Linux after working on macOS: high frustration.

- **Platform-specific content in spec body**: `{{#isClaude}}Use Bash{{/isClaude}}` in markdown body. Platform differences belong in frontmatter (tool declarations) or adapter-level transforms (path rewriting). Body should be platform-neutral. Maintenance cost: every update touches 3 conditional blocks.

- **Metadata in spec files**: Developers shouldn't write `generated: '2025-01-22'` in specs. Metadata auto-generates during install.js processing via field-transformer.js. Authored metadata gets stale, conflicts with generated values, breaks version tracking.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| YAML frontmatter parsing | Regex-based frontmatter extractor | gray-matter 4.0.3 | Handles quoted strings, multiline values, escape sequences, CRLF/LF normalization. Custom regex breaks on edge cases (description with `---` inside quotes, keys with colons). |
| Mustache template rendering | String replace with regex | engine.js (existing) | Handles nested conditionals (`{{#a}}{{#b}}...{{/b}}{{/a}}`), variable substitution (`{{name}}`), whitespace preservation. Already proven for 13 agents. Don't duplicate. |
| Tool name mapping | Manual per-command mapping | tool-mapper.js (existing) | Single source of truth for all tool mappings (Claude: `Bash` → Copilot: `execute`, etc.). Handles deduplication (Grep + Glob both map to `search`). Manual mapping gets out of sync. |
| Platform-specific formatting | Per-platform generator functions | field-transformer.js (existing) | Handles all platform differences (tools: string vs array, metadata: nested vs omitted, case sensitivity). Adding new platform requires one new block, not N new functions. |
| Directory structure creation | `fs.mkdirSync()` with error handling | Platform adapters getTargetDirs() | Handles global vs local installs, OS-specific paths (macOS: ~/Library/Application Support/Claude/, Windows: %APPDATA%\Claude\), permission checks. Cross-platform path logic has 20+ edge cases. |

**Key insight:** The template system (`bin/lib/template-system/`) is a complete solution with 208 passing tests. Every "I'll just..." thought should check if the system already does it. The agent spec migration proved the system works—don't rebuild what's proven.

## Common Pitfalls

### Pitfall 1: Incomplete Command Name Mapping
**What goes wrong:** Migrated command references another command by old name (`gsd:plan-phase` instead of `gsd-plan-phase`). Command fails at runtime with "skill not found."

**Why it happens:** Commands reference each other via:
- Task tool invocations: `task(agent_type="gsd-planner", ...)` (agents, OK)
- Command invocations: `/gsd:execute-phase 1` (needs update to `/gsd-execute-phase` if used in examples)
- Workflow @-references: `@.planning/workflows/execute-phase.sh` (file paths, safe)

**How to avoid:**
1. Create complete mapping table BEFORE migration (all 29 commands)
2. Audit all cross-references: `grep -r "gsd:" commands/gsd/*.md specs/agents/*.md`
3. Distinguish command invocations (needs update) from agent spawning (stays same)
4. Test invocation chains end-to-end (new-project → plan-phase → execute-phase)

**Warning signs:**
- Task tool calls use `agent_type="gsd-..."` (these reference agents, not commands)
- Command examples show `/gsd:...` syntax (these are command names, need mapping)
- Missing commands from mapping table (all 29 must be documented)

### Pitfall 2: Conditional Frontmatter Rendering Failures
**What goes wrong:** Spec has `{{#isClaude}}tools: [Read, Bash]{{/isClaude}}` but generated output has literal `{{#isClaude}}` text or missing tools declaration. Command installs but fails with "tool not available."

**Why it happens:** 
- Conditionals not evaluated before YAML parsing (spec-parser sees raw template, not rendered content)
- Context builder didn't set platform flags (`isClaude: true`)
- Engine.js conditional regex doesn't match (whitespace, nesting issues)

**How to avoid:**
1. Render conditionals BEFORE parsing frontmatter (context → render → parse, not parse → render)
2. Validate rendered output has no template syntax: `!/\{\{/.test(output)`
3. Test generated files manually: `cat .claude/commands/gsd/help.md | grep -v "{{"` (no braces)
4. CI test: Install to all 3 platforms, verify no template syntax in output files

**Warning signs:**
- Braces in generated output (`{{` or `}}` in .claude/commands/ files)
- YAML parsing errors about unexpected `{` character
- Tool declarations missing in generated files (check with `grep "^tools:" output.md`)

### Pitfall 3: Metadata Schema Drift
**What goes wrong:** Agent specs use `projectVersion` but skill specs use `project_version`. Generator fails with "unknown field" or "invalid schema."

**Why it happens:**
- No canonical schema documentation (developers guess field names)
- Copy-paste from inconsistent sources (old agent vs new agent)
- Snake_case vs camelCase inconsistency across codebase

**How to avoid:**
1. Define canonical schema in `/specs/skills/README.md` with field names, types, descriptions
2. Single source of truth: All specs reference README for field names
3. Validation in install.js: Check spec against schema before processing
4. Pre-commit hook: `npm run validate-specs` checks all specs match schema

**Warning signs:**
- Multiple field name patterns in codebase (`generated` vs `generatedAt` vs `generated_at`)
- Generator warnings about unknown fields
- Field-transformer.js has special cases for field name normalization

### Pitfall 4: Legacy Path Assumptions in install.js
**What goes wrong:** install.js has hardcoded `./commands/gsd/*.md` paths. New folder structure (`/specs/skills/*/SKILL.md`) doesn't match glob patterns. Installation succeeds but generates zero files.

**Why it happens:**
- install.js written before folder-per-skill structure decided
- Glob patterns assume flat files: `*.md` doesn't match `*/SKILL.md`
- Path rewriting logic assumes source and target have same structure

**How to avoid:**
1. Extract path configuration to constants at top of install.js
2. Use unified glob patterns: `path.join(SPECS_DIR, '*', 'SKILL.md')` works for folders
3. Adapters must be path-agnostic: `getTargetDirs()` returns platform paths, not hardcoded
4. Test with file-not-found scenario: Comment out specs, verify installation detects missing files

**Warning signs:**
- Hardcoded strings like `"./commands/gsd/"` or `"*.md"` in install.js
- Glob patterns without wildcards for nested structure
- Copy-paste of agent installation code without adapting paths

### Pitfall 5: Breaking Changes Disguised as Formatting
**What goes wrong:** "Just migrating to new format" but new specs have shorter descriptions, fewer tool permissions, removed examples, missing aliases. Users upgrade and commands become less capable.

**Why it happens:**
- Migration mindset: "Clean up while we're here" removes "unnecessary" content
- Diff focus: Reviewing format changes, not functionality changes
- No feature parity checklist: Migration completes without verifying equivalent capability

**How to avoid:**
1. Feature parity checklist per command: `[ ] Description length ≥ original`, `[ ] Tool count ≥ original`, `[ ] Examples preserved`
2. Behavioral smoke tests: Run old command and new command side-by-side, compare outputs
3. CHANGELOG: Document ALL intentional changes (removals, simplifications) with rationale
4. Two-pass migration: (1) Exact replication, (2) Improvements as separate commits

**Warning signs:**
- Migration PR has both format changes AND content changes mixed together
- "Cleaned up descriptions" or "Simplified examples" in commit messages
- No testing methodology described in PR (how was equivalence verified?)

## Code Examples

Verified patterns from existing codebase:

### Frontmatter Structure (Agent Pattern)
```yaml
---
name: gsd-planner
description: "Primary orchestrator for phase planning. Spawns gsd-planner-strategist for complex scenarios. Produces executable PLAN.md files."

{{#isClaude}}
tools: [Read, Write, Bash, Glob, Grep, WebFetch, mcp__context7__*, Task]
{{/isClaude}}
{{#isCopilot}}
tools: [read, edit, bash, glob, grep, task]
{{/isCopilot}}
---
```
Source: `/specs/agents/gsd-planner.md` lines 1-11

**Adaptation for skills:**
- Change `name` from agent name (`gsd-planner`) to command name (`gsd-help`, `gsd-new-project`)
- Keep same conditional tool blocks pattern
- Description should be command-focused ("Show available commands") not agent-focused ("Orchestrates planning")

### Spec Parsing (Parser Pattern)
```javascript
const matter = require('gray-matter');
const fs = require('fs');
const path = require('path');

function parseSpec(filePath) {
  const absolutePath = path.resolve(filePath);
  
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Spec file not found: ${absolutePath}`);
  }
  
  const result = matter.read(absolutePath);
  
  return {
    frontmatter: result.data,
    body: result.content,
    path: absolutePath
  };
}
```
Source: `bin/lib/template-system/spec-parser.js` lines 28-51

**Usage for Phase 1:**
- Reuse this exact function for skill specs
- `parseSpec('/specs/skills/gsd-help/SKILL.md')` returns `{frontmatter, body, path}`
- No modifications needed—gray-matter handles folder structure automatically

### Metadata Generation (Field Transformer Pattern)
```javascript
function addPlatformMetadata(frontmatter, platform) {
  const pkg = require('../../../package.json');
  
  if (platform === 'copilot' || platform === 'codex') {
    // Copilot/Codex: nest under metadata field
    return {
      ...frontmatter,
      metadata: {
        platform: platform,
        generated: new Date().toISOString(),
        gsdVersion: pkg.version
      }
    };
  } else {
    // Claude: no metadata field, fields are top-level or omitted
    return frontmatter;
  }
}
```
Source: `bin/lib/template-system/field-transformer.js` lines 85-100 (simplified)

**Usage for Phase 1:**
- Call during generator pipeline: `addPlatformMetadata(frontmatter, 'copilot')`
- Reads version from `package.json` (currently 1.9.0)
- Timestamp format: ISO 8601 string (`'2025-01-22T12:34:56.789Z'`)

### Command Name Mapping Table Pattern
```markdown
| Legacy Name | Spec Name | Folder | Notes |
|-------------|-----------|--------|-------|
| gsd:help | gsd-help | gsd-help/ | Simple reference command |
| gsd:new-project | gsd-new-project | gsd-new-project/ | Orchestrator, spawns researchers |
| gsd:plan-phase | gsd-plan-phase | gsd-plan-phase/ | Spawns gsd-planner agent |
```
**Location:** Create as `/specs/skills/COMMAND-MAPPING.md` or in README

**Usage:**
- Reference during migration to ensure consistent naming
- Audit tool for finding cross-references: `grep -f mapping.txt commands/gsd/*.md`
- Documentation for users upgrading from v1.8 to v1.9

### Glob Pattern for Folder Structure
```javascript
const glob = require('glob');
const path = require('path');

// Find all skill specs in folder-per-skill structure
const specFiles = glob.sync(path.join(__dirname, '../specs/skills/*/SKILL.md'));

// Process each spec
specFiles.forEach(specPath => {
  const skillName = path.basename(path.dirname(specPath)); // Extract folder name
  console.log(`Processing skill: ${skillName}`);
  // Generate skill...
});
```

**Usage for Phase 1:**
- Add to install.js for discovering skill specs
- Folder name (`gsd-help`) becomes skill identifier
- Glob pattern `*/SKILL.md` finds exactly one file per skill folder

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Flat command files in `commands/gsd/*.md` | Folder-per-skill in `/specs/skills/gsd-*/SKILL.md` | Phase 1 (this project) | Enables per-skill assets, scales to complex commands with templates/workflows |
| Static files copied during install | Generated from specs with conditionals | v1.7 (agent migration) | Single source of truth, platform-specific generation, zero drift |
| Tool declarations without conditionals | `{{#isClaude}}tools: [Read]{{/isClaude}}` pattern | v1.7 (agent migration) | Multi-platform support, correct tools per platform |
| Manual tool name mapping per command | Centralized tool-mapper.js | v1.7 (agent migration) | Consistent mapping, handles deduplication, single update point |

**Deprecated/outdated:**
- **Legacy command name format** (`gsd:command`): Colon syntax deprecated, use hyphen (`gsd-command`). Why: Platform consistency (agents use hyphens), prevents shell escaping issues with colons.
- **Top-level metadata fields in specs**: Developers shouldn't author `generated: '...'` in specs. Auto-generated during install. Why: Prevents staleness, ensures accurate timestamps and versions.

## Open Questions

Things that couldn't be fully resolved:

1. **Should SKILL.md files have allowed-tools field like legacy commands?**
   - What we know: Legacy commands use `allowed-tools: [Read, Bash]` format. Agent specs use conditional `tools: [Read, Bash]` blocks.
   - What's unclear: Whether skills should preserve `allowed-tools` for backward compatibility or adopt `tools` for consistency with agents.
   - Recommendation: Use `tools` (agent pattern) for consistency. field-transformer.js already handles this field. If `allowed-tools` needed for legacy installs, add alias in spec-parser.js (`allowed-tools` → `tools` normalization).

2. **How should command arguments be documented in frontmatter?**
   - What we know: Commands like `gsd:plan-phase <number>` or `gsd:new-project --research` take arguments. Current format documents in `<objective>` section body.
   - What's unclear: Whether arguments belong in frontmatter (`args: ["<number>", "--research"]`) or stay in body.
   - Recommendation: Keep in body for now (Phase 1 focus: schema foundation, not argument parsing). Revisit in Phase 4 if multi-platform CLI tools need structured argument metadata.

3. **Should /specs/skills/README.md include JSON Schema for validation?**
   - What we know: JSON Schema would enable automated validation (`npm run validate-specs`). Agent specs don't have this.
   - What's unclear: Whether JSON Schema overhead (learning curve, maintenance) worth validation benefits.
   - Recommendation: Start with Markdown schema documentation (field names, types, descriptions, examples). Add JSON Schema in Phase 6 if validation gaps found during migration (pitfall: inconsistent field names detected).

## Sources

### Primary (HIGH confidence)
- `/specs/agents/*.md` - 13 agent specs following identical pattern, proven with 208 tests
- `bin/lib/template-system/*.js` - spec-parser, context-builder, engine, tool-mapper, field-transformer (working implementation)
- `bin/install.js` - Installation orchestrator with platform adapter integration (150+ lines, proven for agents)
- `.planning/research/ARCHITECTURE.md` - Project-specific architecture documentation
- `.planning/research/SUMMARY.md` - Domain research for this migration project

### Secondary (MEDIUM confidence)
- `docs/architecture.md` - Template system documentation, may lag code changes
- `package.json` - Dependency versions (gray-matter 4.0.3, js-yaml 4.1.1)
- `commands/gsd/*.md` - 29 legacy command files for comparison

### Tertiary (LOW confidence)
- None—all research based on codebase analysis and existing documentation

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All dependencies installed, proven in production for 13 agents, 208 tests passing
- Architecture: HIGH - Agent pattern already implemented and working, skills follow identical pattern with minor adaptations
- Pitfalls: HIGH - Derived from existing code patterns, .planning/research/ docs, and common multi-platform migration issues

**Research date:** 2025-01-22
**Valid until:** 2025-02-22 (30 days - stable codebase, established patterns, no fast-moving dependencies)
