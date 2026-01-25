# Project Research Summary

**Project:** get-shit-done-multi  
**Domain:** Template-based CLI installer for multi-platform AI skills & agents  
**Researched:** 2025-01-25  
**Overall Confidence:** HIGH

## Executive Summary

This project is a **template-based installer** that deploys AI CLI skills and agents to multiple platforms (Claude Desktop, GitHub Copilot, Codex, and future platforms). Similar to tools like `create-react-app` or `create-vite`, it uses the npx pattern for convenience while installing persistent skills that remain after the installer exits. The core technical challenge is **multi-platform templating** — generating platform-specific files (`.agent.md` vs `.md`, different frontmatter formats, different tool names) from shared source templates.

**Recommended approach:** Use the **adapter pattern** with domain-driven architecture. Keep universal templates internally, transform them per-platform during installation using dedicated adapters (ClaudeAdapter, CopilotAdapter, etc.). Support interactive installation via `@clack/prompts` (no flags = beautiful interactive mode) while maintaining non-interactive CLI flags for automation. Use atomic transactions with rollback to prevent partial installations from corrupting user environments.

**Key risks and mitigation:** The biggest risk is **partial installation without rollback** — if installation fails midway, users are left with broken state. Mitigate with transaction pattern (track all operations, rollback on failure). Second risk is **path traversal vulnerabilities** — malicious templates could write outside target directories. Mitigate with strict path validation and sandboxing. Third risk is **frontmatter breaking changes** — platforms may change their specs. Mitigate with versioned adapters and validation schemas.

## Key Findings

### 1. Recommended Stack (from ecosystem.md)

The **npx-based hybrid pattern** is the right choice: run via npx for convenience, but install persistent skills that outlive the installer process. This combines the "always latest version" benefit of npx with the "persistent tooling" need for AI CLI extensions.

**Core dependencies:**
- **fs-extra** (^11.2.0) — Promise-based file operations with better error handling than native fs
- **@clack/prompts** (^0.11.0) — Modern interactive CLI prompts with built-in spinners and disabled menu options (perfect for "coming soon" features)
- **chalk** (^5.3.0) — Terminal color output for better UX
- **ora** (^8.0.1) — Loading spinners for long operations
- **ejs** (^3.1.9) — Template engine for JavaScript/JSON files (flexible, JavaScript-native)
- **semver** (^7.5.4) — Version comparison for update detection

**Template approach:** Use **shared base + platform overlays** pattern:
```
templates/
  base/                    # Shared across platforms
    skill.mcp.json.ejs
    lib/
      utils.js.ejs
  platforms/
    claude/                # Claude-specific files
      commands/
        gsd-new-project.xml
    copilot/              # GitHub-specific files
      skills/
        gsd-new-project.md
```

Installation copies base templates, then overlays platform-specific files. EJS used for JavaScript/JSON (supports conditionals), plain string replacement for XML (avoids syntax conflicts with `<% %>`).

### 2. Platform Differences (from PLATFORMS.md)

Claude Desktop and GitHub Copilot CLI are highly compatible but differ in critical ways:

**Directory structure:**
- Claude: `.claude/` root, agents use `.md` extension
- GitHub: `.github/` root, agents use `.agent.md` extension

**Tool naming:**
- Claude: Capitalized comma-separated → `tools: Read, Write, Bash`
- GitHub: Lowercase JSON array → `tools: [read, edit, execute]`

**Tool mappings:**
| Claude | GitHub | Notes |
|--------|--------|-------|
| `Read` | `read` | Case change |
| `Write` + `Edit` | `edit` | GitHub consolidates both |
| `Bash` | `execute` | Name change |
| `Grep` + `Glob` | `search` | GitHub consolidates |
| `Task` | `agent` | Name change |
| `WebSearch`, `WebFetch` | N/A | Claude-specific, not available on GitHub |

**Metadata requirements:**
- Claude: No metadata block needed
- GitHub: **Required** metadata block with `platform`, `generated`, `templateVersion`, `projectVersion`, `projectName`

**Path references:**
- Claude: `@~/.claude/get-shit-done/references/...`
- GitHub: `@.github/get-shit-done/references/...`

**Adapter implementation:** Use platform-specific adapters that handle frontmatter transformation, tool mapping, path rewriting, and file extension assignment. Each adapter exposes `transformFrontmatter()`, `transformTools()`, `transformPath()`, `getFileExtension()`, and `getTargetDir()`.

### 3. Architecture Approach (from domain.md)

**Domain-driven module structure** (organize by responsibility, not file type):

```
/bin/lib/
├── platforms/      # Platform detection & adapter registry
├── templates/      # Template discovery & loading
├── rendering/      # Template rendering & path rewriting
├── paths/          # Path resolution & normalization
├── io/             # File operations with atomic transactions
├── prompts/        # Interactive CLI prompts
└── validation/     # Input & path validation
```

Each module exposes a clean public API via `index.js`. Internal implementation files are hidden from external consumers.

**Path rewriting strategy:** Use **hybrid approach**:
- Template variables (`{{PLATFORM_ROOT}}`) for platform differences
- Path aliases (`@install`) for runtime-determined paths
- Explicit rewriting phase during render pipeline

**Interactive CLI pattern:** No flags = interactive mode with beautiful `@clack/prompts` UI. CLI flags available for automation:
```bash
# Interactive (auto-detect platforms, prompt for choices)
npx get-shit-done-multi

# Non-interactive (for CI/CD)
npx get-shit-done-multi --platform=copilot --mode=local --confirm
```

**Key architectural decisions:**
- Domain modules over file-type organization
- Adapter pattern for platform differences
- Transaction pattern for atomic installation with rollback
- Progressive disclosure (no flags = interactive, flags = automation)

### 4. Critical Pitfalls (from risks.md)

**🔴 Critical Risk 1: Partial Installations Without Rollback**
- **Problem:** Installation fails midway (permission denied, disk full), leaving broken state
- **Impact:** User must manually clean up, subsequent installs may fail
- **Mitigation:** Transaction pattern — track all operations, rollback on failure:
  ```javascript
  class InstallTransaction {
    async commit() {
      try {
        for (const op of this.operations) {
          await op.execute()
          this.completed.push(op)
        }
      } catch (error) {
        await this.rollback()  // Undo completed operations
        throw error
      }
    }
  }
  ```

**🔴 Critical Risk 2: Path Traversal Vulnerabilities**
- **Problem:** Malicious template uses `../../etc/passwd` to overwrite system files
- **Impact:** Security vulnerability, data loss
- **Mitigation:** Strict path validation before any file writes:
  ```javascript
  function validatePath(targetPath, allowedRoot) {
    const resolved = path.resolve(targetPath)
    if (!resolved.startsWith(allowedRoot)) {
      throw new Error('Path traversal detected')
    }
  }
  ```

**🟡 High Risk 3: Frontmatter Breaking Changes**
- **Problem:** Claude/GitHub change their frontmatter specs, breaking existing templates
- **Impact:** Installed skills stop working after platform updates
- **Mitigation:** 
  - Version adapters (ClaudeAdapterV1, ClaudeAdapterV2)
  - Validation schemas that detect spec changes
  - Graceful degradation (warn about unknown fields)

**🟡 Moderate Risk 4: Adding New Platforms Creates Template Pollution**
- **Problem:** Each new platform adds conditionals to templates, making them unreadable
- **Impact:** Maintenance burden, error-prone templates
- **Mitigation:**
  - Plugin-based adapter registry
  - Keep platform logic in adapters, templates stay clean
  - Universal template format internally

**🟡 Moderate Risk 5: Windows Path Handling**
- **Problem:** Hardcoded Unix paths (`~/.claude/`) fail on Windows
- **Impact:** Installation fails on Windows
- **Mitigation:**
  - Always use `path.join()` and `path.resolve()`
  - Use `os.homedir()` instead of `process.env.HOME`
  - Test on Windows with different path separators

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Core Installer with Single Platform
**Rationale:** Validate architecture with simplest implementation first. Claude Desktop has cleaner frontmatter (no required metadata block), making it easier to start.

**Delivers:**
- Basic npx installer (`npx get-shit-done-multi --platform=claude`)
- Platform detection (detect if Claude Desktop is installed)
- Template loading and rendering
- File system operations (copy base + overlay platform files)
- Path rewriting (replace `{{PLATFORM_ROOT}}` with `.claude/`)
- Basic error handling

**Stack elements:**
- fs-extra for file operations
- path module for cross-platform paths
- Simple template rendering (string replacement or EJS)

**Avoids:**
- Partial installation risk (implement basic validation, full transactions can come later)
- Path traversal (add basic path validation)

**Research flag:** ❌ **No additional research needed** — ecosystem.md covers installer patterns thoroughly

---

### Phase 2: Multi-Platform Support with Adapter Pattern
**Rationale:** Once core installer works for Claude, add GitHub Copilot support using adapter pattern. This validates the abstraction before adding more platforms.

**Delivers:**
- Platform adapter interface
- ClaudeAdapter implementation
- CopilotAdapter implementation
- Tool name mapping (Read → read, Bash → execute, etc.)
- Frontmatter transformation (add metadata block for GitHub)
- Path rewriting per platform (`~/.claude/` vs `.github/`)
- File extension handling (`.md` vs `.agent.md`)

**Addresses:**
- Platform difference handling (PLATFORMS.md findings)
- Extensibility for future platforms

**Implements:**
- Adapter pattern (from architecture recommendations)
- Domain module structure (`/bin/lib/platforms/`)

**Avoids:**
- Template pollution (keep platform logic in adapters, not templates)

**Research flag:** ❌ **No additional research needed** — PLATFORMS.md provides comprehensive tool mappings and requirements

---

### Phase 3: Interactive CLI with Beautiful UX
**Rationale:** With working installer, enhance UX for manual installation (most common use case). Auto-detect platforms, show beautiful prompts, guide users through choices.

**Delivers:**
- @clack/prompts integration
- Auto-detection of installed platforms (check for `.claude/`, run `gh copilot --version`, etc.)
- Interactive platform selection (with disabled "coming soon" options)
- Multi-select for skills/agents to install
- Confirmation prompt before installation
- Progress spinners during file operations
- Beautiful intro/outro messages

**Stack elements:**
- @clack/prompts for interactive UI
- chalk for colored output
- ora for spinners (if not using clack's built-in spinner)

**Implements:**
- Interactive prompts module (`/bin/lib/prompts/`)
- Platform detection logic (`/bin/lib/platforms/detector.js`)

**Avoids:**
- Poor UX (no feedback during long operations)
- Confusing options (disabled items show "coming soon" clearly)

**Research flag:** ❌ **No additional research needed** — domain.md covers CLI libraries and patterns thoroughly

---

### Phase 4: Atomic Transactions and Rollback
**Rationale:** Add production-grade reliability. Partial installations are the #1 critical risk — users left with broken state that's hard to debug.

**Delivers:**
- InstallTransaction class
- Operation tracking (record each file write, directory create)
- Rollback mechanism (undo operations in reverse order)
- Pre-installation checks (disk space, permissions, conflicts)
- Post-installation verification (check all required files exist)
- Installation manifest (`.gsd-install-manifest.json` with version, files, timestamp)

**Addresses:**
- Critical Risk 1: Partial installations

**Implements:**
- Transaction pattern (from risks.md mitigation)
- IO module with safe operations (`/bin/lib/io/`)
- Validation module (`/bin/lib/validation/`)

**Avoids:**
- Partial installations without recovery
- Silent failures

**Research flag:** ❌ **No additional research needed** — transaction pattern is well-established

---

### Phase 5: Update Detection and Versioning
**Rationale:** Users need to know when updates are available. Track installed version, compare with current, prompt to update.

**Delivers:**
- Write `.version` file during installation
- Check installed version on re-run
- Prompt user if update available
- semver comparison (handle major/minor/patch differences)
- Changelog display (show what's new)
- Optional: auto-update flag (`--update`)

**Stack elements:**
- semver for version comparison

**Implements:**
- Version tracking in installation manifest
- Update detection in platform detector

**Avoids:**
- Users running outdated skills with known bugs

**Research flag:** ❌ **No additional research needed** — standard versioning patterns

---

### Phase 6: Template Validation and Security
**Rationale:** Before allowing custom templates or publishing to npm, need robust security. Path traversal is a critical risk.

**Delivers:**
- Path validation (detect `../` traversal attempts)
- Sandbox target directory (restrict writes to allowed paths)
- Template schema validation (check frontmatter structure)
- Dependency scanning (warn about large dependencies in templates)
- Digital signatures (optional: verify template authenticity)

**Addresses:**
- Critical Risk 2: Path traversal vulnerabilities
- High Risk 3: Malicious templates

**Implements:**
- Validation module (`/bin/lib/validation/`)
- Security checks before any file writes

**Avoids:**
- Path traversal attacks
- Malicious template injection

**Research flag:** ⚠️ **May need research** — Security best practices for template sandboxing (check npm advisories, OWASP guidance)

---

### Phase 7: Windows Testing and Cross-Platform Polish
**Rationale:** Most developers are on macOS/Linux, but many users are on Windows. Path handling bugs are common source of Windows failures.

**Delivers:**
- Windows path resolution testing
- Environment variable handling (`%APPDATA%` vs `$HOME`)
- Path separator normalization
- Case sensitivity testing (Windows is case-insensitive)
- PowerShell compatibility testing

**Addresses:**
- Moderate Risk 5: Windows path handling

**Implements:**
- Cross-platform path utilities (`/bin/lib/paths/`)

**Avoids:**
- Windows-specific failures

**Research flag:** ⚠️ **Needs testing on Windows** — Can't fully validate without actual Windows environment

---

### Phase 8: Plugin System for Future Platforms
**Rationale:** Enable external adapters for new platforms (Cursor, Windsurf, Cline, etc.) without modifying core codebase.

**Delivers:**
- Adapter registry with plugin loading
- External adapter API (extend BaseAdapter)
- Adapter discovery (check `~/.gsd/adapters/` or via npm)
- Platform validation (ensure adapter meets interface)
- Adapter versioning (semver compatibility)

**Addresses:**
- Moderate Risk 4: Template pollution from new platforms

**Implements:**
- Plugin architecture (registry pattern)
- Adapter abstraction (`/bin/lib/platforms/base-adapter.js`)

**Avoids:**
- Core codebase bloat as new platforms emerge

**Research flag:** ✅ **Needs research** — Plugin systems for Node.js CLIs (look at ESLint plugin pattern, Babel plugin pattern)

---

### Phase Ordering Rationale

**Dependencies:**
- Phase 1 must come first (establishes core architecture)
- Phase 2 depends on Phase 1 (adapter pattern needs working core)
- Phase 3 can run parallel to Phase 4 (UX and transactions are independent)
- Phase 5 depends on Phase 1-2 (needs installation to track versions)
- Phase 6 should come before Phase 8 (security before extensibility)
- Phase 7 can run in parallel with later phases (testing vs features)

**Grouping rationale:**
- Phases 1-2: **Foundation** (core installation mechanics)
- Phases 3-5: **User Experience** (interactive prompts, reliability, updates)
- Phases 6-7: **Production Readiness** (security, cross-platform)
- Phase 8: **Extensibility** (plugin system for future growth)

**Pitfall avoidance:**
- Early phases address critical risks (partial installations, path traversal)
- Mid phases improve reliability and UX
- Late phases enable long-term maintainability

### Research Flags

**Phases needing deeper research during planning:**
- **Phase 6 (Template Validation):** Security best practices for template sandboxing — check OWASP guidelines for path traversal prevention, npm security advisories for template injection
- **Phase 8 (Plugin System):** Node.js CLI plugin patterns — study ESLint's plugin system, Babel's plugin registry, explore cosmiconfig for plugin discovery

**Phases with standard patterns (skip research-phase):**
- **Phase 1 (Core Installer):** Well-documented file operations, ecosystem.md covers patterns
- **Phase 2 (Multi-Platform):** PLATFORMS.md provides complete tool mappings
- **Phase 3 (Interactive CLI):** domain.md covers @clack/prompts thoroughly
- **Phase 4 (Transactions):** Standard transaction pattern, risks.md has implementation
- **Phase 5 (Versioning):** Standard semver comparison, npm ecosystem practices
- **Phase 7 (Windows Testing):** Empirical testing, not research

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| **Installer Patterns** | **HIGH** | Based on direct analysis of create-react-app, vite, npm patterns. npx-based hybrid approach is proven. |
| **Platform Differences** | **HIGH** | Comprehensive comparison of Claude vs GitHub Copilot from existing codebase. Tool mappings verified, frontmatter differences documented. |
| **Template Systems** | **HIGH** | Evaluated multiple options (EJS, Handlebars, Mustache). EJS for JS/JSON, plain replacement for XML is sound. |
| **Architecture** | **MEDIUM-HIGH** | Domain-driven structure based on DDD principles and Node.js best practices. Adapter pattern is proven, but specific implementation untested. |
| **CLI UX** | **HIGH** | @clack/prompts is verified on npm, used by major projects (Astro, SvelteKit). Excellent match for requirements. |
| **Risks & Mitigation** | **HIGH** | Critical risks identified (partial installations, path traversal) with concrete mitigation strategies (transactions, validation). |
| **Windows Support** | **MEDIUM** | Logical analysis of path differences, but not tested on actual Windows system. Needs empirical validation in Phase 7. |
| **Security** | **MEDIUM** | Path traversal mitigation is standard, but template sandboxing needs deeper research in Phase 6. |

**Overall confidence:** **HIGH**

All research is based on official documentation (npm, GitHub, Claude), established patterns (create-react-app, ESLint), and direct codebase analysis. The only areas needing additional validation are Windows testing (needs real environment) and template security (needs OWASP/npm security research).

### Gaps to Address

**Gap 1: Windows path resolution**
- **Issue:** Path handling logic designed on macOS/Linux may fail on Windows with different separators (`\` vs `/`), case sensitivity, environment variables
- **How to handle:** Phase 7 dedicated to Windows testing. Use `path.join()` and `path.resolve()` everywhere, avoid string concatenation for paths. Test with actual Windows environment or GitHub Actions Windows runner.

**Gap 2: Template security sandboxing**
- **Issue:** Path validation prevents obvious traversal (`../../etc/passwd`), but symbolic links, junction points, or environment variable expansion could bypass checks
- **How to handle:** Phase 6 includes deeper research into OWASP path traversal prevention, npm security advisories for similar tools. Consider using libraries like `safepath` or implementing chroot-like restrictions.

**Gap 3: Platform spec evolution**
- **Issue:** Claude/GitHub may change frontmatter specs, add new required fields, deprecate tools. Current adapters may break.
- **How to handle:** Version adapters (e.g., `ClaudeAdapterV1`, `ClaudeAdapterV2`), add schema validation that can detect spec changes. Set up automated tests that query official docs or run actual platform installs to detect changes early.

**Gap 4: Plugin system design**
- **Issue:** No clear consensus on best plugin architecture for Node.js CLIs. ESLint pattern vs Babel pattern vs Rollup pattern all differ.
- **How to handle:** Phase 8 includes research into plugin patterns. Likely use cosmiconfig for plugin discovery + simple adapter interface. Defer this until core is stable.

**Gap 5: Large skill installations**
- **Issue:** If skill bundles include many files (e.g., reference libraries), installation may be slow or exceed disk space
- **How to handle:** Add pre-installation checks for disk space (Phase 4). Consider progress bars for large operations (Phase 3). Possibly add `--skip-references` flag for minimal installs.

## Sources

### Primary (HIGH confidence)
- **npm official documentation:** https://docs.npmjs.com/ — npx patterns, package.json structure
- **create-vite source code:** https://github.com/vitejs/vite/tree/main/packages/create-vite — Template installer reference implementation
- **Node.js path module:** https://nodejs.org/api/path.html — Cross-platform path handling
- **Claude Code documentation:** https://code.claude.com/docs/en/ — Sub-agents, skills, frontmatter reference
- **GitHub Copilot CLI documentation:** https://docs.github.com/en/copilot/reference/custom-agents-configuration — Custom agents, tool aliases
- **@clack/prompts:** https://github.com/bombshell-dev/clack — Interactive CLI library (verified on npm, 1.4M weekly downloads)
- **EJS documentation:** https://ejs.co/ — Template engine syntax and features
- **get-shit-done codebase:** Direct analysis of `.claude/` and `.github/` structures — Tool mappings, frontmatter differences

### Secondary (MEDIUM confidence)
- **DDD principles:** Domain-driven design patterns for module organization — Applied to `/bin/lib` structure
- **Transaction pattern:** Database transaction concepts applied to file operations — Standard pattern, adapted for installer use case
- **ESLint plugin system:** https://eslint.org/docs/latest/extend/plugins — Reference for plugin architecture

### Tertiary (LOW confidence, needs validation)
- **Windows path handling:** Logical inference from path module docs — Not tested on actual Windows system
- **Template sandboxing:** Security best practices extrapolated from web template security — Needs deeper research with OWASP/npm advisories

---

**Research completed:** 2025-01-25  
**Ready for roadmap:** ✅ Yes

**Next steps:**
1. Use this summary to inform roadmap phase structure (Phase 1-8 suggestions above)
2. Flag Phase 6 and Phase 8 for targeted research during planning
3. Prioritize Phase 1-5 as MVP (Foundation + UX + Reliability)
4. Defer Phase 6-8 to post-MVP (Security + Plugins can come after validation)

**Key decision points for roadmap:**
- **MVP scope:** Phase 1-3 (single platform + multi-platform + interactive UX) OR Phase 1-5 (add transactions + versioning)?
- **Platform priority:** Start with Claude (cleaner frontmatter) or GitHub (larger user base)?
- **Testing strategy:** Add Phase 7 (Windows) before or after initial release?
