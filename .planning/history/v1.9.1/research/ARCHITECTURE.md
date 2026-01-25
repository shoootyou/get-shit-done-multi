# Architecture Research: Skills Migration

**Domain:** Skill specification and multi-platform installation system
**Researched:** 2025-01-22
**Confidence:** HIGH

## Executive Summary

The new `/specs/skills/` structure integrates into the existing GSD architecture by mirroring the already-successful `/specs/agents/` pattern. Skills follow the same spec → template → platform-specific installation flow, leveraging the existing template system and adapter infrastructure.

**Key finding:** The architecture is already 90% ready for skills. The agent spec generation pipeline (spec-parser → context-builder → engine → field-transformer → platform adapters) works identically for skills with minor adaptations.

## System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                      SOURCE LAYER (Git)                          │
├──────────────────────────────────────────────────────────────────┤
│  /specs/skills/             │  /specs/agents/                    │
│  ├── gsd-new-project/       │  ├── gsd-planner.md                │
│  │   └── SKILL.md           │  ├── gsd-executor.md               │
│  ├── gsd-plan-phase/        │  └── gsd-verifier.md               │
│  │   └── SKILL.md           │                                    │
│  └── [29 skills...]         │  [14 agents...]                    │
│                              │                                    │
│  SHARED FORMAT: Frontmatter + Mustache templates {{#isClaude}}   │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│                   PROCESSING LAYER (install.js)                  │
├──────────────────────────────────────────────────────────────────┤
│  bin/install.js                                                  │
│  ├── detectInstalledCLIs() → Choose adapter(s)                  │
│  ├── preserveUserData()    → Backup custom content              │
│  └── install{Platform}()   → Platform-specific installer        │
│                                                                  │
│  bin/lib/template-system/                                        │
│  ├── spec-parser.js        → Parse YAML frontmatter + body      │
│  ├── context-builder.js    → Build {isClaude, isCopilot, ...}   │
│  ├── engine.js             → Mustache rendering                 │
│  ├── tool-mapper.js        → Map tools to platform              │
│  ├── field-transformer.js  → Transform fields                   │
│  └── generator.js          → Orchestrate pipeline               │
│                                                                  │
│  bin/lib/adapters/                                               │
│  ├── claude.js    → getTargetDirs(), convertContent(), verify() │
│  ├── copilot.js  → getTargetDirs(), convertContent(), verify() │
│  └── codex.js    → getTargetDirs(), convertContent(), verify() │
└──────────────────────────────────────────────────────────────────┘
                               ↓
┌──────────────────────────────────────────────────────────────────┐
│                    INSTALLATION LAYER (Filesystem)               │
├──────────────────────────────────────────────────────────────────┤
│  CLAUDE (global/local)      │  COPILOT (local)                   │
│  ~/.claude/                 │  .github/                          │
│  ├── commands/gsd/          │  ├── skills/get-shit-done/         │
│  │   ├── new-project.md     │  │   ├── SKILL.md                  │
│  │   └── [commands...]      │  │   ├── commands/gsd/             │
│  ├── agents/                │  │   │   └── [commands...]         │
│  │   ├── gsd-planner.md     │  │   ├── workflows/                │
│  │   └── [agents...]        │  │   └── templates/                │
│  └── get-shit-done/         │  └── agents/                       │
│      ├── workflows/         │      ├── gsd-planner.agent.md      │
│      └── templates/         │      └── [agents...]               │
│                             │                                    │
│  CODEX (global/local)       │  LEGACY (unchanged)                │
│  ~/.codex/                  │  ./commands/gsd/                   │
│  └── skills/get-shit-done/  │  ├── new-project.md                │
│      ├── SKILL.md           │  └── [29 commands...]              │
│      ├── commands/gsd/      │                                    │
│      ├── agents/            │  ./agents/                         │
│      ├── workflows/         │  └── [fallback agents]             │
│      └── templates/         │                                    │
└──────────────────────────────────────────────────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | Input | Output |
|-----------|----------------|-------|--------|
| **spec-parser.js** | Parse spec files (YAML frontmatter + markdown body) | `.md` file path or string | `{frontmatter, body, path}` |
| **context-builder.js** | Build template context with platform flags | `(spec, platform)` | `{isClaude, isCopilot, ...}` |
| **engine.js** | Mustache template rendering | `(template, context)` | Rendered string |
| **tool-mapper.js** | Map tool names to platform-specific names | `(tools[], platform)` | Platform-specific tools |
| **field-transformer.js** | Transform fields for platform compatibility | `(frontmatter, platform)` | Transformed frontmatter |
| **generator.js** | Orchestrate the pipeline | `(specPath, platform)` | `{success, output, errors, warnings}` |
| **Platform Adapters** | Platform-specific directory structure and content transformation | `(content, type)` | Platform-specific content |
| **install.js** | Orchestrate installation flow | CLI arguments | Installed files + settings |

## Data Flow: Spec → Installed Skill

### Phase 1: Spec Authoring (Developer)

```
Developer writes:
  /specs/skills/gsd-new-project/SKILL.md

Structure:
  ---
  name: gsd-new-project
  description: "Initialize a new project"
  {{#isClaude}}
  tools: [Read, Write, Bash, Task]
  {{/isClaude}}
  {{#isCopilot}}
  tools: [read, edit, bash, task]
  {{/isCopilot}}
  ---
  
  <objective>
  Initialize project...
  </objective>
```

**Key decisions:**
- Frontmatter uses Mustache conditionals for platform-specific values
- Body is platform-neutral (adapters handle path replacement)
- One spec source for all platforms

### Phase 2: Template Processing (install.js)

```
User runs: npx get-shit-done-multi --copilot

Flow:
  1. detectInstalledCLIs() → {copilot: true}
  2. installCopilot() called
  3. For each spec in /specs/skills/*.md:
     a. generateSkillFromSpec(specPath, 'copilot')
        → spec-parser: parse frontmatter + body
        → context-builder: {isCopilot: true, isClaude: false}
        → engine: render {{#isCopilot}}...{{/isCopilot}} blocks
        → tool-mapper: map tools to copilot names
        → field-transformer: format for copilot
     b. Write to .github/skills/get-shit-done/commands/gsd/
  4. copilotAdapter.verify(dirs) → check installation
```

**Pipeline stages:**
1. **Parse** — Extract frontmatter and body
2. **Build context** — Set platform flags
3. **Render** — Execute Mustache templates
4. **Transform tools** — Map to platform-specific names
5. **Transform fields** — Format frontmatter for platform
6. **Validate** — Check YAML structure
7. **Write** — Save to platform-specific location

### Phase 3: Platform Installation (Adapters)

```
Each adapter provides:
  - getTargetDirs(isGlobal) → {skills, agents, commands}
  - convertContent(content, type) → Platform-specific content
  - verify(dirs) → {success, errors[]}

Claude adapter:
  dirs.commands = ~/.claude/commands/gsd/
  dirs.agents   = ~/.claude/agents/
  dirs.skills   = ~/.claude/get-shit-done/
  
  convertContent() → No-op (Claude is source format)

Copilot adapter:
  dirs.skills   = .github/skills/get-shit-done/
  dirs.agents   = .github/agents/
  dirs.commands = null (embedded in skills)
  
  convertContent() → Replace paths:
    ~/.claude/get-shit-done/ → .github/skills/get-shit-done/
    ~/.claude/agents/ → .github/agents/

Codex adapter:
  dirs.skills   = .codex/skills/get-shit-done/
  dirs.agents   = .codex/skills/get-shit-done/agents/
  dirs.commands = null (embedded in skills)
  
  convertContent() → Replace paths + replace command syntax:
    /gsd:command → $get-shit-done command
    ~/.claude/ → .codex/skills/get-shit-done/
```

## Integration with Existing System

### What Already Exists (Agents)

The agent spec system is fully operational:

```javascript
// bin/install.js lines 242-295
function generateAgentsFromSpecs(specsDir, outputDir, platform) {
  const specFiles = fs.readdirSync(specsDir)
    .filter(file => file.endsWith('.md'));
  
  for (const specFile of specFiles) {
    const result = generateAgent(specPath, platform);
    
    if (result.success) {
      fs.writeFileSync(outputPath, result.output, 'utf8');
    }
  }
}

// Called for each platform:
install()  → generateAgentsFromSpecs(specsDir, dirs.agents, 'claude')
installCopilot() → generateAgentsFromSpecs(specsDir, dirs.agents, 'copilot')
installCodex() → generateAgentsFromSpecs(specsDir, dirs.agents, 'codex')
```

**Pattern to replicate:** Same pipeline, different source directory.

### What Needs to be Added (Skills)

Create parallel function for skills:

```javascript
// NEW: bin/install.js
function generateSkillsFromSpecs(specsDir, outputDir, platform) {
  // Identical structure to generateAgentsFromSpecs
  // but processes /specs/skills/ → platform-specific skills directory
  
  const specFiles = fs.readdirSync(specsDir)
    .filter(file => file.endsWith('SKILL.md')); // Skills in folders
  
  for (const specFile of specFiles) {
    const result = generateSkill(specPath, platform); // Uses same generator.js
    if (result.success) {
      fs.writeFileSync(outputPath, result.output, 'utf8');
    }
  }
}
```

**Integration points:**

1. **install() function (Claude):**
   ```javascript
   // After line 567 (agent generation)
   const skillsSpecsDir = path.join(src, 'specs', 'skills');
   if (fs.existsSync(skillsSpecsDir)) {
     const genResult = generateSkillsFromSpecs(
       skillsSpecsDir, 
       dirs.commands,  // ~/.claude/commands/gsd/
       'claude'
     );
     console.log(`Generated ${genResult.generated} skills from specs`);
   }
   ```

2. **installCopilot() function:**
   ```javascript
   // After line 737 (command copy)
   const skillsSpecsDir = path.join(src, 'specs', 'skills');
   if (fs.existsSync(skillsSpecsDir)) {
     const commandsDest = path.join(dirs.skills, 'commands', 'gsd');
     const genResult = generateSkillsFromSpecs(
       skillsSpecsDir,
       commandsDest,  // .github/skills/get-shit-done/commands/gsd/
       'copilot'
     );
   }
   ```

3. **installCodex() function:**
   ```javascript
   // After line 883 (command copy)
   const skillsSpecsDir = path.join(src, 'specs', 'skills');
   if (fs.existsExists(skillsSpecsDir)) {
     const commandsDest = path.join(dirs.skills, 'commands', 'gsd');
     const genResult = generateSkillsFromSpecs(
       skillsSpecsDir,
       commandsDest,  // .codex/skills/get-shit-done/commands/gsd/
       'codex'
     );
   }
   ```

### Legacy Compatibility

**Critical constraint:** Legacy commands in `./commands/gsd/*.md` must continue working.

**Strategy:**
1. Skills from `/specs/skills/` are generated FIRST
2. Legacy commands are copied SECOND (as fallback)
3. Generated skills overwrite static files (same filename)
4. Any command NOT in `/specs/skills/` still installs from legacy

```javascript
// Execution order in install():
1. generateSkillsFromSpecs(specsDir, dirs.commands, 'claude')  // New system
2. copyWithPathReplacement(gsdSrc, dirs.commands, adapter)      // Legacy fallback

// If gsd-new-project.md exists in /specs/skills/:
//   → Generated version used
// If NOT in /specs/skills/:
//   → Legacy ./commands/gsd/new-project.md used
```

## Directory Structure Decisions

### Option A: Folder-per-skill (Recommended)

```
/specs/skills/
├── gsd-new-project/
│   └── SKILL.md
├── gsd-plan-phase/
│   └── SKILL.md
└── gsd-verify-phase/
    └── SKILL.md
```

**Pros:**
- Follows Claude's folder-based skill structure
- Extensible (can add assets per skill later)
- Clear separation of concerns
- Matches `/specs/agents/*.md` pattern (flat files)

**Cons:**
- More directories to navigate

### Option B: Flat file structure

```
/specs/skills/
├── gsd-new-project.md
├── gsd-plan-phase.md
└── gsd-verify-phase.md
```

**Pros:**
- Simpler initial structure
- Matches `/specs/agents/*.md` exactly

**Cons:**
- Inconsistent with Claude's installed skill format
- No room for skill-specific assets

**Recommendation:** Use **Option A** (folder-per-skill) for:
1. Consistency with Claude's installed format
2. Future extensibility (skill-specific templates, assets)
3. Clear namespace separation

## Component Boundaries

### What Processes Specs

**spec-parser.js** (no changes needed)
- Already handles YAML frontmatter + markdown body
- Works for both agents and skills
- Used by: generator.js

### What Installs Them

**install.js** orchestrator (needs minor additions)
- Current: `generateAgentsFromSpecs()`
- New: `generateSkillsFromSpecs()` (parallel function)
- Both call: `generator.js`

**Platform adapters** (no changes needed)
- Already provide `getTargetDirs()`, `convertContent()`, `verify()`
- Skills use same adapter interface
- Path replacement works identically

### What Reads Them

**At runtime:**
- Claude Code: Reads from `~/.claude/commands/gsd/*.md` or `~/.claude/agents/*.md`
- GitHub Copilot: Reads from `.github/skills/get-shit-done/commands/gsd/*.md`
- Codex CLI: Reads from `.codex/skills/get-shit-done/commands/gsd/*.md`

**No changes needed** — runtime systems already read from these locations.

## Build Order & Dependencies

### Phase 1: Spec Structure (No dependencies)

```
Tasks:
1. Create /specs/skills/ directory
2. Create folder structure: /specs/skills/gsd-{command}/
3. Write SKILL.md specs with frontmatter
4. Test: spec-parser can parse new specs

Dependencies: None (new directory, isolated)
```

### Phase 2: Generation Function (Depends on Phase 1)

```
Tasks:
1. Add generateSkillsFromSpecs() to install.js
2. Call it in install(), installCopilot(), installCodex()
3. Test: Skills generate correctly for each platform

Dependencies:
- /specs/skills/ directory exists
- generator.js (already exists)
- Platform adapters (already exist)
```

### Phase 3: Migration (Depends on Phase 2)

```
Tasks:
1. Migrate commands one-by-one to /specs/skills/
2. Test each migration on all 3 platforms
3. Update CHANGELOG.md

Dependencies:
- generateSkillsFromSpecs() working
- Legacy commands still in ./commands/gsd/ (fallback)
```

### Parallel Development Safe

**Yes** — phases can be developed independently:
- Phase 1 (spec creation) doesn't break existing system
- Phase 2 (generation function) only runs if /specs/skills/ exists
- Phase 3 (migration) can be gradual (command-by-command)

**Rollback strategy:** Delete `/specs/skills/` directory → system reverts to legacy

## Architectural Patterns

### Pattern 1: Single Source, Multiple Targets

**What:** One spec generates platform-specific output via adapters

**Implementation:**
```markdown
/specs/skills/gsd-new-project/SKILL.md (source)
  ↓ [generate with platform='claude']
~/.claude/commands/gsd/new-project.md
  ↓ [generate with platform='copilot']
.github/skills/get-shit-done/commands/gsd/new-project.md
  ↓ [generate with platform='codex']
.codex/skills/get-shit-done/commands/gsd/new-project.md
```

**When to use:** When content is 95% identical across platforms (this case)

**Trade-offs:**
- ✅ Single source of truth
- ✅ Consistent behavior across platforms
- ❌ Mustache conditionals in spec ({{#isClaude}}...{{/isClaude}})

### Pattern 2: Adapter-Based Path Rewriting

**What:** Adapters replace platform-specific paths in content

**Implementation:**
```javascript
// copilot.js
function convertContent(content, type) {
  return content.replace(
    /~\/.claude\/get-shit-done\//g,
    '.github/skills/get-shit-done/'
  );
}

// codex.js
function convertContent(content, type) {
  let converted = content.replace(
    /~\/.claude\/get-shit-done\//g,
    '.codex/skills/get-shit-done/'
  );
  // Also replace command syntax
  return converted.replace(/\/gsd:(\S+)/g, '$get-shit-done $1');
}
```

**When to use:** When platforms have different path conventions

**Trade-offs:**
- ✅ Specs stay clean (use Claude paths as canonical)
- ✅ Easy to add new platforms
- ❌ Must maintain regex patterns per platform

### Pattern 3: Template-First Generation

**What:** Specs are templates that get rendered, not static files copied

**Implementation:**
```javascript
// OLD (static copy):
fs.copyFileSync(srcPath, destPath);

// NEW (template rendering):
const spec = parseSpec(srcPath);
const context = buildContext(spec, platform);
const rendered = render(spec.body, context);
fs.writeFileSync(destPath, rendered);
```

**When to use:** When content needs platform-specific variations

**Trade-offs:**
- ✅ Powerful (can customize deeply per platform)
- ✅ Testable (render with different contexts)
- ❌ More complex than static copy

## Anti-Patterns to Avoid

### Anti-Pattern 1: Platform-Specific Specs

**What people might do:**
```
/specs/skills/claude/gsd-new-project.md
/specs/skills/copilot/gsd-new-project.md
/specs/skills/codex/gsd-new-project.md
```

**Why it's wrong:**
- Triples maintenance burden
- Specs drift apart over time
- Defeats purpose of single source

**Do this instead:**
```
/specs/skills/gsd-new-project/SKILL.md (with {{#isClaude}} conditionals)
```

### Anti-Pattern 2: Duplicating Template System

**What people might do:**
Create a separate skills-specific generator instead of using existing `generator.js`

**Why it's wrong:**
- Code duplication
- Different bugs in each system
- Harder to maintain

**Do this instead:**
Use `generateAgent()` function for both agents and skills (it's generic)

### Anti-Pattern 3: Modifying Legacy Commands

**What people might do:**
Update `./commands/gsd/*.md` files directly during migration

**Why it's wrong:**
- Breaks deployed installations
- Confuses source of truth
- Rollback becomes complex

**Do this instead:**
Leave legacy commands untouched. New specs overwrite at install time.

### Anti-Pattern 4: Complex Frontmatter Conditionals

**What people might do:**
```yaml
---
{{#isClaude}}
name: gsd-new-project
tools: [Read, Write, Bash]
{{/isClaude}}
{{#isCopilot}}
name: new-project
tools: [read, edit, bash]
{{/isCopilot}}
---
```

**Why it's wrong:**
- Frontmatter becomes unreadable
- YAML structure changes per platform
- Hard to parse and validate

**Do this instead:**
```yaml
---
name: gsd-new-project  # Same across platforms
description: "Initialize project"
{{#isClaude}}
tools: [Read, Write, Bash]
{{/isClaude}}
{{#isCopilot}}
tools: [read, edit, bash]
{{/isCopilot}}
---
```

Keep conditionals to MINIMUM (only for tools and platform-specific fields)

## Scaling Considerations

| Scale | Architecture Implications |
|-------|---------------------------|
| **29 skills (current)** | Current architecture handles well. One-time generation at install. |
| **100+ skills** | May need skill categories (`/specs/skills/planning/`, `/specs/skills/execution/`). Generator still fast enough. |
| **1000+ skills** | Would need lazy loading at runtime (not install-time generation). This is unlikely for GSD. |

**Bottlenecks to watch:**
1. **Install time** — Generating 29 skills takes ~1 second (acceptable)
2. **File system** — 29 files in one directory is fine (100+ might need categorization)
3. **Spec complexity** — Heavy Mustache logic slows rendering (keep conditionals minimal)

**Optimization opportunities:**
- Parallel generation (Promise.all on spec list)
- Caching rendered output (only regenerate on spec change)
- Incremental updates (detect which specs changed)

*None needed at current scale.*

## Integration Points with install.js

### Insertion Point 1: Claude Installation (install function)

**Location:** `bin/install.js` line ~567 (after agent generation)

```javascript
// EXISTING: Generate agents from specs
const specsDir = path.join(src, 'specs', 'agents');
const genResult = generateAgentsFromSpecs(specsDir, dirs.agents, 'claude');

// NEW: Generate skills from specs
const skillsSpecsDir = path.join(src, 'specs', 'skills');
if (fs.existsSync(skillsSpecsDir)) {
  const skillsResult = generateSkillsFromSpecs(skillsSpecsDir, dirs.commands, 'claude');
  if (skillsResult.generated > 0) {
    console.log(`  ${green}✓${reset} Generated ${skillsResult.generated} skills from specs`);
  }
}

// EXISTING: Copy legacy commands (fallback)
const gsdSrc = path.join(src, 'commands', 'gsd');
copyWithPathReplacement(gsdSrc, dirs.commands, claudeAdapter, 'command');
```

**Key decision:** Skills generate BEFORE legacy copy (overwrite fallbacks)

### Insertion Point 2: Copilot Installation (installCopilot function)

**Location:** `bin/install.js` line ~737 (after legacy command copy)

```javascript
// EXISTING: Copy commands into skill directory
const commandsSrc = path.join(src, 'commands', 'gsd');
const commandsDest = path.join(dirs.skills, 'commands', 'gsd');
copyWithPathReplacement(commandsSrc, commandsDest, copilotAdapter, 'command');

// NEW: Generate skills from specs (overwrites legacy)
const skillsSpecsDir = path.join(src, 'specs', 'skills');
if (fs.existsSync(skillsSpecsDir)) {
  const skillsResult = generateSkillsFromSpecs(skillsSpecsDir, commandsDest, 'copilot');
  if (skillsResult.generated > 0) {
    console.log(`  ${green}✓${reset} Generated ${skillsResult.generated} skills from specs`);
  }
}
```

**Order matters:** Legacy first, then specs overwrite (graceful fallback)

### Insertion Point 3: Codex Installation (installCodex function)

**Location:** `bin/install.js` line ~883 (after legacy command copy)

```javascript
// EXISTING: Copy commands into skill directory
const commandsSrc = path.join(src, 'commands', 'gsd');
const commandsDest = path.join(dirs.skills, 'commands', 'gsd');
copyWithPathReplacement(commandsSrc, commandsDest, codexAdapter, 'command');

// NEW: Generate skills from specs (overwrites legacy)
const skillsSpecsDir = path.join(src, 'specs', 'skills');
if (fs.existsSync(skillsSpecsDir)) {
  const skillsResult = generateSkillsFromSpecs(skillsSpecsDir, commandsDest, 'codex');
  if (skillsResult.generated > 0) {
    console.log(`  ${green}✓${reset} Generated ${skillsResult.generated} skills from specs`);
  }
}
```

## /specs/skills/ vs /specs/agents/ Relationship

### Similarities (Leverage Existing Patterns)

| Aspect | /specs/agents/ | /specs/skills/ |
|--------|----------------|----------------|
| **Format** | YAML frontmatter + markdown body | YAML frontmatter + markdown body |
| **Templating** | Mustache conditionals ({{#isClaude}}) | Mustache conditionals ({{#isClaude}}) |
| **Generation** | generateAgentsFromSpecs() | generateSkillsFromSpecs() (parallel) |
| **Pipeline** | spec-parser → context-builder → engine | spec-parser → context-builder → engine |
| **Adapters** | Platform-specific convertContent() | Platform-specific convertContent() |
| **Source of truth** | Single spec → 3 platforms | Single spec → 3 platforms |

### Differences (Why Separate Directories)

| Aspect | /specs/agents/ | /specs/skills/ |
|--------|----------------|----------------|
| **Purpose** | Agent definitions (spawned by Task tool) | Command definitions (invoked by user) |
| **Structure** | Flat: `gsd-planner.md` | Folder: `gsd-new-project/SKILL.md` |
| **Install target (Claude)** | `~/.claude/agents/` | `~/.claude/commands/gsd/` |
| **Install target (Copilot)** | `.github/agents/` | `.github/skills/get-shit-done/commands/gsd/` |
| **Naming** | `gsd-planner.md` → `gsd-planner.md` | `SKILL.md` → `gsd-new-project.md` (from folder name) |
| **Legacy fallback** | `./agents/` (rarely used) | `./commands/gsd/` (29 files, critical) |

**Why separate directories:**
1. Different runtime behavior (agents vs commands)
2. Different install locations per platform
3. Different naming conventions
4. Clear separation of concerns

**Why same pipeline:**
Both are markdown specs that need platform-specific rendering.

## Recommended Implementation Order

### Phase 1: Foundation (No Breaking Changes)

**Goal:** Prove the architecture works

**Tasks:**
1. Create `/specs/skills/` directory
2. Create one test skill: `/specs/skills/gsd-help/SKILL.md`
3. Migrate help command (simplest, low risk)
4. Add `generateSkillsFromSpecs()` to install.js
5. Test installation on all 3 platforms

**Success criteria:**
- `gsd-help` works identically from spec and legacy
- No regression in other commands
- Install time not noticeably slower

**Estimated effort:** 4-6 hours (setup + one command)

### Phase 2: Core Commands (Iterative)

**Goal:** Migrate high-value commands

**Tasks (priority order):**
1. `gsd-new-project` (most complex, validates architecture)
2. `gsd-plan-phase` (second most used)
3. `gsd-execute-phase` (executor commands)
4. `gsd-verify-phase` (verification commands)
5. Remaining 25 commands (batch processing)

**Success criteria:**
- Each command tested on all 3 platforms before next
- Legacy fallback still works
- No user-facing changes

**Estimated effort:** 2-3 days (29 commands, testing)

### Phase 3: Documentation (Finalize)

**Goal:** Document the new system

**Tasks:**
1. Create `/specs/skills/README.md`
2. Update CHANGELOG.md
3. Update developer documentation
4. Create migration guide (if needed)

**Success criteria:**
- Developers understand spec format
- Contributors can add new skills
- Users unaware of migration (no breaking changes)

**Estimated effort:** 2-3 hours

## Sources

**HIGH Confidence:**
- `bin/install.js` (lines 1-1100) — Existing installation logic
- `bin/lib/template-system/generator.js` — Template generation pipeline
- `bin/lib/adapters/{claude,copilot,codex}.js` — Platform adapters
- `specs/agents/gsd-planner.md` — Working spec example
- `.planning/PROJECT.md` — Project requirements

**MEDIUM Confidence:**
- Claude Code slash commands spec: https://code.claude.com/docs/en/slash-commands
- Frontmatter reference: https://code.claude.com/docs/en/slash-commands#frontmatter-reference
- (Both require verification but align with observed patterns)

---
*Architecture research for: Skills migration to /specs/skills/*
*Researched: 2025-01-22*
