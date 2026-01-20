# Feature Research

**Domain:** Milestone Management & Codebase Analysis Tooling
**Researched:** 2025-01-23
**Confidence:** MEDIUM

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

#### Milestone Archiving

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Archive milestone with metadata | Standard workflow completion pattern in project management | LOW | Must include: milestone name, completion date, archive timestamp, who archived |
| View archived milestone list | Users need reference to past work | LOW | Read-only list with search/filter by date, name |
| Restore from archive | Mistakes happen, users need undo | MEDIUM | Safety valve for accidental archival |
| Automatic artifact preservation | Losing work data on archive is unacceptable | MEDIUM | Archive associated planning docs, phase plans, verification reports |
| Archive confirmation prompt | Prevents accidental data loss | LOW | CLI confirmation before destructive action |

#### Codebase Mapping

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Respect .gitignore patterns | Standard exclusion mechanism all tools honor | LOW | Must parse .gitignore, apply patterns correctly |
| Exclude node_modules, .git, build dirs | Universal noise patterns | LOW | Hardcoded defaults: node_modules/, .git/, dist/, build/, target/, venv/, __pycache__/ |
| Exclude binary/media files | Don't analyze non-code | LOW | Common extensions: .jpg, .png, .pdf, .zip, .exe, .dll, .so |
| Directory tree visualization | Users need to understand structure | MEDIUM | ASCII tree or hierarchical JSON output |
| File size/line count metrics | Basic codebase health indicators | LOW | Per-file and aggregate statistics |

#### Integration & Workflow

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Archive → cleanup workflow | Completing milestone should clean slate | MEDIUM | Archive triggers: move files to archive/, update active milestone tracker |
| Map refresh after archive | Codebase state changes, map should update | LOW | Trigger map-codebase automatically or prompt user |
| State consistency | Tools shouldn't work on stale data | MEDIUM | Archive updates PROJECT.md, triggers dependent refreshes |

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valuable.

#### Advanced Archiving

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Archive comparison (diff) | "What changed between milestones?" | HIGH | Compare archived milestone A vs B: features added, files changed, metrics delta |
| Archive analytics | Understand project velocity over time | MEDIUM | Time-to-complete per phase, lines added/removed per milestone, trend analysis |
| Selective restore | Restore specific artifacts from archive | MEDIUM | "Give me the research docs from milestone 1" without full restore |
| Archive export/import | Share completed work across repos/teams | MEDIUM | JSON/tarball export of archived milestone with all artifacts |
| Archive tagging/categorization | Organize milestones beyond chronological | LOW | Tags like "mvp", "bugfix", "feature-release" for filtering |

#### Smart Codebase Mapping

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Custom exclusion patterns | Project-specific needs beyond .gitignore | LOW | .gsd/map-exclusions config: additional glob patterns |
| Language-aware analysis | Differentiate between languages | MEDIUM | Detect languages, report breakdowns (40% TypeScript, 30% Python, etc.) |
| Hotspot identification | Find where code changes most | HIGH | Git history analysis: which files/dirs have most commits/churn |
| Dependency graph visualization | Understand module relationships | HIGH | Parse imports, show dependency tree |
| Documentation coverage | How well is code documented? | MEDIUM | Count docstrings/comments vs code, highlight undocumented areas |

#### Integration Automation

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Webhook triggers | Archive completion → external workflows | MEDIUM | Emit webhook on archive (GitHub Actions, CI/CD integration) |
| Pre-archive validation | Prevent archiving incomplete work | MEDIUM | Check: all phase goals verified, no open blockers |
| Post-archive hooks | Custom automation after archive | LOW | Run user-defined scripts (e.g., generate report, notify team) |
| Milestone templates | Faster setup for recurring patterns | MEDIUM | Save milestone structure as template, instantiate with params |
| Cross-repo milestone tracking | Manage related milestones across repos | HIGH | Track milestone dependencies in multi-repo projects |

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| Full version control inside archive | "Git for project management" | Complexity explosion: you already have Git. Don't reimplement it. Confuses users about Git vs GSD. | Use Git tags at archive time. Reference Git SHA in archive metadata. Keep archives simple. |
| Real-time codebase monitoring | "Auto-refresh map on file change" | Performance killer for large codebases. Watcher overhead. When does it stop? Battery drain. | Manual refresh or event-triggered (e.g., post-merge hook). User controls when map updates. |
| Unlimited archive history | "Never delete anything" | Storage bloat. Search/list performance degrades. Old archives rarely accessed. | Retention policy: archive archives older than X months to cold storage or prune with user consent. |
| Archive everything (including dependencies) | "Complete snapshot" | node_modules in archive = gigabytes of noise. Defeats purpose of lightweight archival. | Archive package.json/lock files, not dependencies. Reproducible via package manager. |
| AI-generated milestone summaries | "Auto-document what we did" | AI hallucinations in historical records. Trust issues. Maintenance burden. | User writes summary at archive time (required field). AI can suggest, not replace. |
| Automatic archive on timeline | "Archive milestone if not touched in 30 days" | False positives: long phases aren't abandoned. Creates surprise/confusion. | Manual archive only. Users know when milestone complete. |

## Feature Dependencies

```
Archive Milestone
    └──requires──> Metadata Storage (name, date, artifacts)
    └──triggers──> Archive Cleanup Workflow
                       └──triggers──> Map Refresh (optional)

Map Codebase
    └──requires──> .gitignore Parser
    └──requires──> File Tree Walker
    └──enhances──> Documentation (shows what to document)

Custom Exclusion Patterns
    └──enhances──> Map Codebase (project-specific filtering)
    └──requires──> .gsd/map-exclusions Config

Archive Comparison
    └──requires──> Archive Milestone (need 2+ archives)
    └──requires──> Diff Engine

Webhook Triggers
    └──requires──> Archive Milestone (event to emit)
    └──conflicts──> Offline-First (needs network)

Pre-Archive Validation
    └──requires──> Phase Verification System
    └──blocks──> Archive Milestone (validation must pass)
```

### Dependency Notes

- **Archive Milestone requires Metadata Storage:** Can't archive without recording what/when/who
- **Archive triggers Map Refresh:** Codebase state changed, map should reflect current state
- **Map Codebase requires .gitignore Parser:** Must honor existing Git conventions
- **Custom Exclusions enhance Map Codebase:** Power users need project-specific patterns beyond .gitignore
- **Archive Comparison requires 2+ Archives:** Can't diff if only one milestone archived
- **Webhook Triggers conflict with Offline-First:** If tool must work offline, webhooks are optional/degraded
- **Pre-Archive Validation blocks Archive:** Prevents incomplete work from being marked done

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

#### Milestone Archiving
- [x] Archive milestone command — Archive current milestone with metadata (name, date, who)
- [x] Archive to `.planning/archive/{milestone-name}/` — Standard location, preserves planning docs
- [x] List archived milestones — View what's been archived (JSON output or table)
- [x] Update PROJECT.md on archive — Mark milestone complete, remove from active tracking
- [x] Confirmation prompt — "Archive milestone X? [y/N]" safety check

#### Codebase Mapping
- [x] Parse .gitignore — Honor existing exclusions automatically
- [x] Hardcoded exclusions — node_modules/, .git/, dist/, build/, common noise
- [x] Directory tree output — ASCII tree showing structure
- [x] File count/size metrics — Basic stats (X files, Y lines, Z MB)
- [x] Respect .gsd/map-exclusions — If file exists, apply additional patterns

#### Integration
- [x] Archive completion message — Guide user: "Milestone archived. Run `map-codebase` to refresh?"
- [x] No automatic triggers (v1) — User controls when map refreshes (simpler, more predictable)

### Add After Validation (v1.x)

Features to add once core is working.

#### Enhanced Archiving
- [ ] Archive comparison — Compare two archived milestones, show diff
- [ ] Archive search — Find archived milestone by name/date/tag
- [ ] Archive analytics — Time-per-phase, velocity trends over multiple milestones

#### Advanced Mapping
- [ ] Language detection — Show language breakdown (e.g., "40% TypeScript, 30% Python")
- [ ] Documentation coverage — Percentage of files with docstrings/comments
- [ ] Configurable output formats — JSON, Markdown, HTML tree

#### Integration Automation
- [ ] Post-archive hooks — Run custom scripts after archive (e.g., `.gsd/hooks/post-archive`)
- [ ] Pre-archive validation — Check phase verification complete before allowing archive
- [ ] Automatic map refresh on archive — Optional flag: `--refresh-map` triggers map after archive

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Webhook triggers — Emit events for external integration (GitHub Actions, Slack)
- [ ] Selective restore — Extract specific files from archive without full restore
- [ ] Archive export/import — Share archived milestones across repos
- [ ] Dependency graph visualization — Parse imports, show module dependencies
- [ ] Hotspot identification — Git history analysis for high-churn areas
- [ ] Cross-repo milestone tracking — Manage dependencies across multiple repositories

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Archive milestone (basic) | HIGH | LOW | P1 |
| .gitignore parsing | HIGH | LOW | P1 |
| Hardcoded exclusions | HIGH | LOW | P1 |
| Directory tree output | HIGH | MEDIUM | P1 |
| List archived milestones | HIGH | LOW | P1 |
| Update PROJECT.md on archive | HIGH | LOW | P1 |
| Confirmation prompt | MEDIUM | LOW | P1 |
| .gsd/map-exclusions config | MEDIUM | LOW | P1 |
| Post-archive map refresh prompt | MEDIUM | LOW | P1 |
| Archive comparison | MEDIUM | HIGH | P2 |
| Language detection | MEDIUM | MEDIUM | P2 |
| Documentation coverage | LOW | MEDIUM | P2 |
| Pre-archive validation | HIGH | MEDIUM | P2 |
| Post-archive hooks | MEDIUM | LOW | P2 |
| Archive search/filter | MEDIUM | MEDIUM | P2 |
| Webhook triggers | LOW | MEDIUM | P3 |
| Selective restore | LOW | MEDIUM | P3 |
| Archive export/import | LOW | MEDIUM | P3 |
| Dependency graph | LOW | HIGH | P3 |
| Hotspot identification | LOW | HIGH | P3 |
| Cross-repo tracking | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch (basic archiving + basic mapping)
- P2: Should have, add when possible (enhancements, validation, automation)
- P3: Nice to have, future consideration (advanced analytics, cross-repo)

## Competitor Feature Analysis

| Feature | Project Management Tools (Jira, Asana, Monday) | Code Analysis Tools (Sourcegraph, CodeViz, CodeScene) | Our Approach (GSD) |
|---------|--------------|--------------|--------------|
| **Milestone archiving** | Close milestone → read-only, filterable archive list. No restore. | N/A (not milestone-focused) | Archive to `.planning/archive/`, preserve all artifacts, support restore. CLI-native. |
| **Archive metadata** | Completion date, owner, linked issues | N/A | Name, date, who archived, Git SHA reference, artifact manifest |
| **Exclusion patterns** | N/A (not code-aware) | Respect .gitignore, custom patterns, language filters | .gitignore + .gsd/map-exclusions + hardcoded noise (node_modules, etc.) |
| **Codebase visualization** | N/A | Interactive diagrams, dependency graphs, call trees | ASCII tree (CLI-friendly), JSON export for tooling integration |
| **Metrics** | Time tracking, velocity, burn-down | LOC, complexity, churn, hotspots, doc coverage | LOC, file count, size, language breakdown (simple, actionable) |
| **Integration triggers** | Webhooks, Slack/email notifications, automation rules | CI/CD integration, IDE plugins, API access | Post-archive hooks, optional webhooks (v2), GitHub Actions friendly |
| **Validation gates** | Custom workflow rules, approval steps | Linting, quality gates in CI/CD | Pre-archive: verify phase goals met, no open blockers |
| **Historical analysis** | Burndown charts, velocity trends, retrospectives | Code churn over time, technical debt growth | Archive comparison (diff), analytics (time-per-phase, trends) |

### Key Differentiators for GSD

1. **CLI-native, Git-aware:** Works where developers work (terminal, Git repos), not separate web app
2. **Integrated workflow:** Archive milestone → clean up planning dir → refresh code map = cohesive flow
3. **Lightweight, local-first:** No server, no accounts, no SaaS. Files in `.planning/`, Git-committable
4. **Opinionated simplicity:** Hardcoded smart defaults (node_modules excluded), minimal config needed
5. **Developer-focused:** Features developers need (code mapping, language detection) + PM features (milestones, phases)

## Sources

**Milestone Archiving Research:**
- NotionSender: Document Archiving Best Practices 2025 (MEDIUM confidence)
- Documind: Expert Document Archiving Best Practices 2025 (MEDIUM confidence)
- RoseMet: Project Artifact Archiving Best Practices (MEDIUM confidence)
- ONES Project: Maximizing Efficiency with Project Archiving (MEDIUM confidence)
- Docsie: Milestones Definition, Examples & Best Practices (MEDIUM confidence)

**Codebase Mapping Research:**
- Official Git .gitignore Documentation (HIGH confidence)
- Advanced .gitignore Exclusion Strategies (MEDIUM confidence)
- GitHub's Official .gitignore Templates Collection (HIGH confidence)
- GitIgnore.pro Advanced Patterns Guide (MEDIUM confidence)

**Code Analysis Tools Research:**
- GitLoop: Top AI-Powered Codebase Analysis Tools 2025 (MEDIUM confidence)
- CodeViz: Visual Codebase Maps (VSCode Marketplace) (HIGH confidence)
- Developex: Code Mapping & AI Tools for Modern Development (MEDIUM confidence)
- MarkAI: VSCode 2025 AI-Powered Refactoring (MEDIUM confidence)
- OneFileApp: How to Generate Documentation from Code Using AI (MEDIUM confidence)

**CI/CD Integration Research:**
- GitHub Docs: Events that trigger workflows (HIGH confidence)
- GitHub Docs: Webhook events and payloads (HIGH confidence)
- Kellton: CI/CD Best Practices 2025 (MEDIUM confidence)
- GitLab: Ultimate Guide to CI/CD Fundamentals (HIGH confidence)
- ONES: Continuous Integration Deployment Guide 2025 (MEDIUM confidence)

**Documentation Automation Research:**
- AugmentCode: Auto Document Your Code - Tools & Best Practices Guide 2025 (MEDIUM confidence)
- Edana: Intelligently Documenting Your Code Best Practices (MEDIUM confidence)
- Kodesage: Best Software Documentation Tools in 2025 (MEDIUM confidence)
- DeepDocs: Code Documentation Best Practices 2025 (MEDIUM confidence)

**Confidence Assessment:**
- **HIGH confidence:** Official documentation (Git, GitHub, GitLab)
- **MEDIUM confidence:** Industry blogs, tool vendor documentation, practitioner guides (all 2025 sources, cross-verified)
- **LOW confidence:** None used for final recommendations

**Research Notes:**
- All web searches included "2025" for currency
- Multiple sources cross-referenced for table-stakes features (e.g., .gitignore support universal)
- Anti-features identified from "common mistakes" and "pitfalls" discussions
- Competitor analysis synthesized from tool comparisons and feature lists
- No Context7 queries needed (no specific libraries being evaluated)

---
*Feature research for: Milestone Management & Codebase Analysis Tooling*  
*Researched: 2025-01-23*  
*Confidence: MEDIUM (web sources, no official GSD spec to verify against)*
