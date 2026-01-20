# Pitfalls Research: Multi-CLI Tool Development and Codex CLI Integration

**Domain:** Multi-AI CLI tool support (Claude Code, GitHub Copilot CLI, OpenAI Codex CLI)
**Researched:** 2026-01-20
**Confidence:** HIGH

## Critical Pitfalls

### Pitfall 1: Hardcoded Path Separators Break Cross-Platform Compatibility

**What goes wrong:**
Code that manually concatenates paths with hardcoded `/` or `\\` separators fails on different operating systems. Windows uses backslashes (`\`), while macOS/Linux use forward slashes (`/`). When installing to different CLI config directories (`~/.claude/`, `.github/`, `.codex/`), this causes file not found errors and broken installations.

**Why it happens:**
Developers test on their primary OS (usually macOS/Linux) and use string concatenation for paths (`claudeDir + '/commands/gsd'`) instead of OS-agnostic path utilities. The installer works locally but fails for users on different platforms.

**How to avoid:**
1. **Always use `path.join()` or `path.resolve()`** in Node.js (similar utilities in other languages)
2. Never concatenate paths with string literals containing `/` or `\\`
3. Use `path.sep` when you need the separator explicitly
4. Test installation on Windows, macOS, and Linux via CI matrix

**Warning signs:**
- Installation fails on Windows with "file not found" errors
- Paths displayed in error messages show mixed `/` and `\\` separators
- User reports "works on Mac but not Windows"
- String concatenation visible in path construction code

**Phase to address:**
Phase 1: Installation Infrastructure (test path utilities work cross-platform before building CLI-specific installers)

**Recovery cost:** MEDIUM (requires refactoring all path construction and retesting)

---

### Pitfall 2: Agent → Skill Conversion Loses Critical Functionality

**What goes wrong:**
GitHub Copilot CLI supports custom agents with native orchestration, tool access, and delegation. Codex CLI only supports skills (instructional packages without native orchestration). When converting agents to skills, you lose:
- Multi-step orchestration capabilities
- Native tool/MCP server bindings
- Ability to delegate to coding agent
- Persistent context across invocations
- Specialized prompt engineering for agent roles

**Why it happens:**
Teams assume "agent" and "skill" are equivalent concepts because both customize CLI behavior. They copy agent definitions to `SKILL.md` files without understanding architectural differences. The skill loads but behaves differently—orchestration logic doesn't execute, tools aren't available, workflows break.

**How to avoid:**
1. **Understand CLI architecture differences:**
   - **Copilot agents:** Persistent personas with orchestration, can own workflows
   - **Codex skills:** Instructional bundles loaded on-demand, no native orchestration
   - **Claude:** Inline role adoption, no separate agent system
2. **Convert orchestration logic to workflow instructions**
   - Agent: Calls sub-agents programmatically
   - Skill: Provides step-by-step instructions for user to follow
3. **Document what changes** in CLI-specific behavior guides
4. **Test converted skills** for functional equivalence (does the workflow still work?)
5. **Accept limitations** or build workarounds (e.g., skill invokes helper commands)

**Warning signs:**
- Skill loads but workflow doesn't complete
- Missing features users report from Copilot version
- Skill instructions reference "delegating to agent" (impossible in Codex)
- Tools/MCP servers not accessible in Codex that work in Copilot
- Multi-phase workflows require manual re-invocation

**Phase to address:**
Phase 2: Agent/Skill Adaptation (after installation working, convert each agent with testing)

**Recovery cost:** HIGH (may require architectural changes to workflows, documenting limitations, user training)

---

### Pitfall 3: Command Invocation Differences Create Broken Workflows

**What goes wrong:**
Each CLI has different command invocation patterns:
- **Claude Code:** Slash commands `/gsd:new-project` (native)
- **GitHub Copilot CLI:** Typed commands `gsd:new-project` (matched by skill description)
- **Codex CLI:** Prompt-based `/gsd:new-project` (requires `~/.codex/prompts/gsd/*.md`)

Teams implement commands for one CLI, then assume they'll "just work" in others. Users type `/gsd:new-project` in Copilot—nothing happens. Or commands work but arguments aren't parsed correctly across CLIs.

**Why it happens:**
Insufficient research into each CLI's command system. Assumption that "slash commands" work the same everywhere. Missing the prompt file requirement for Codex or skill description matching logic for Copilot.

**How to avoid:**
1. **Research each CLI's command architecture** before implementation
2. **Create CLI-specific command files:**
   - Claude: Command definitions in `commands/gsd/*.md`
   - Copilot: Skill with clear description for matching
   - Codex: Prompt files in `~/.codex/prompts/gsd/*.md`
3. **Test command invocation** in each CLI during development
4. **Document invocation patterns** clearly for each CLI
5. **Build installer logic** that creates CLI-appropriate files

**Warning signs:**
- Command works in Claude but "command not found" in Copilot/Codex
- Arguments parsed differently across CLIs
- User confusion about how to invoke commands
- Missing prompt files in Codex installation

**Phase to address:**
Phase 3: Command System Integration (implement CLI-specific command invocation)

**Recovery cost:** MEDIUM (requires creating CLI-specific files, testing, updating docs)

---

### Pitfall 4: Installer Overwrites Cause Data Loss

**What goes wrong:**
User runs installer for second CLI (e.g., adding Codex after Claude), and it:
- Overwrites `.planning/` state files
- Deletes CLI-specific customizations
- Replaces global config with defaults
- Removes hooks/scripts user added
No backup, no merge strategy—just destructive overwrite.

**Why it happens:**
Installer doesn't detect existing installations. No version detection. No "update vs. fresh install" logic. Treats every run as clean install. Developer tested fresh install but not upgrade/multi-CLI scenarios.

**How to avoid:**
1. **Detect existing installations** before copying files
2. **Version detection:**
   - Check for VERSION files in each CLI directory
   - Compare with new version being installed
   - Prompt for update/reinstall/cancel
3. **Preserve state files:**
   - Never touch `.planning/` directory
   - Backup CLI-specific files before overwriting
   - Merge configurations where possible
4. **Selective installation:**
   - Update only changed files
   - Ask before replacing customized files
   - Provide `--force` flag for clean reinstall
5. **Test upgrade path:**
   - Install v1 → Install v2 (should update)
   - Claude installed → Add Copilot (should coexist)
   - Test with user customizations present

**Warning signs:**
- User reports "lost my project state after installing"
- Customized files get replaced silently
- No version detection in installer code
- Installation always copies all files
- No backup/restore functionality

**Phase to address:**
Phase 1: Installation Infrastructure (build before CLI-specific installers)

**Recovery cost:** HIGH (data loss may be unrecoverable, damages user trust)

---

### Pitfall 5: Shared State Directory Structure Incompatibility

**What goes wrong:**
Each CLI writes state files to `.planning/` in different formats or with different assumptions:
- Claude writes `STATE.md` with specific structure
- Copilot expects `config.json` with additional fields
- Codex creates `session.json` that conflicts with others
User switches CLIs mid-project → state corruption, lost context, broken workflows.

**Why it happens:**
No specification for shared state format. Each CLI implementation treats `.planning/` as "theirs." Lack of version field in state files. No validation when reading state written by another CLI.

**How to avoid:**
1. **Define shared state specification:**
   - Required fields all CLIs must support
   - Optional CLI-specific extensions (namespaced)
   - Version field in all state files
2. **Validation on read:**
   - Check state file version
   - Validate required fields present
   - Warn if unknown fields (may be from different CLI)
3. **Non-destructive writes:**
   - Read existing state before writing
   - Merge CLI-specific data, don't replace
   - Preserve unknown fields from other CLIs
4. **Test CLI interoperability:**
   - Claude writes state → Copilot reads → Codex reads
   - Verify all CLIs can work on same project
   - Check no data loss when switching

**Warning signs:**
- State corruption after switching CLIs
- Missing fields when loading in different CLI
- Project state reset when using new CLI
- Error messages about invalid state format
- User must "reinitialize" project after CLI switch

**Phase to address:**
Phase 4: Shared State Management (after individual CLIs working, ensure interop)

**Recovery cost:** HIGH (may require state format redesign, migration scripts, data recovery)

---

### Pitfall 6: Absolute Paths Break Portability Across Systems

**What goes wrong:**
Installer or generated files contain absolute paths like `/Users/developer/.claude/get-shit-done`. When user:
- Clones project to different machine
- Different username or home directory structure
- Windows vs. macOS path conventions
Files break with "file not found" errors.

**Why it happens:**
Path rewriting during installation uses `__dirname` or `process.cwd()` to generate absolute paths, then hardcodes them in output files. Seemed like a good idea to "make paths work" but breaks portability.

**How to avoid:**
1. **Use relative paths** whenever possible in project files
2. **Environment variables** for system-specific paths:
   - `$HOME` / `%USERPROFILE%` instead of hardcoded home paths
   - `${CLAUDE_DIR}` variable that resolves at runtime
3. **Runtime path resolution:**
   - Calculate paths when needed, don't store them
   - Use markers like `@root` that resolve at execution time
4. **Document path expectations** clearly
5. **Test on different systems:**
   - Different usernames
   - Different install locations
   - Windows vs. macOS/Linux

**Warning signs:**
- Files contain `/Users/specific-user/...` paths
- Project doesn't work when moved between machines
- Windows paths (`C:\Users\...`) in cross-platform files
- Hard-to-maintain path rewriting in installer
- User reports "works on your machine but not mine"

**Phase to address:**
Phase 1: Installation Infrastructure (path strategy before implementation)

**Recovery cost:** MEDIUM (requires refactoring path handling, may need file format changes)

---

### Pitfall 7: CLI Detection Logic Fails in Edge Cases

**What goes wrong:**
Installer tries to detect which CLIs are installed to offer appropriate options. Detection logic fails when:
- CLI installed in non-standard location
- Multiple versions of same CLI present
- CLI binary exists but not configured
- WSL/Windows dual-boot scenarios
Installer offers wrong options or fails to detect available CLIs.

**Why it happens:**
Overly simplistic detection logic: checks if `~/.claude` directory exists. Doesn't verify CLI is actually functional. Doesn't handle edge cases. Never tested beyond developer's local setup.

**How to avoid:**
1. **Multi-stage detection:**
   - Check common install locations
   - Verify CLI binary exists and is executable
   - Test CLI actually runs (`--version` command)
   - Check configuration files present
2. **Support custom install locations:**
   - Accept `--claude-dir` / `--codex-dir` flags
   - Use environment variables (e.g., `CLAUDE_CONFIG_DIR`)
   - Let user specify location if auto-detect fails
3. **Graceful degradation:**
   - If detection fails, still offer manual installation
   - Provide clear instructions for non-standard setups
   - Don't block installation due to detection failure
4. **Test edge cases:**
   - No CLI installed (fresh machine)
   - Multiple CLIs installed
   - Non-standard install locations
   - WSL scenarios

**Warning signs:**
- Installer says "Claude not found" when it's installed
- Detection fails in CI/CD environments
- Custom install locations not detected
- User forced to use workarounds
- Detection logic has hardcoded paths

**Phase to address:**
Phase 1: Installation Infrastructure (robust detection before CLI-specific features)

**Recovery cost:** LOW (refactor detection, doesn't affect core functionality)

---

### Pitfall 8: Documentation Becomes Outdated Across CLI Variants

**What goes wrong:**
Documentation written for Claude Code. Add Copilot support—update some docs but miss others. Add Codex—documentation now inconsistent:
- Command invocation examples only show Claude
- Installation instructions outdated for new CLIs
- Feature comparison table missing Codex column
- Screenshots from Claude, confusing for Copilot users
Users follow outdated docs → installation fails or workflows don't work.

**Why it happens:**
Documentation not treated as code. No "definition of done" requiring doc updates. Documentation scattered across multiple files. No systematic review process. Manual updates error-prone.

**How to avoid:**
1. **Documentation as code:**
   - Store docs in repo with version control
   - Require doc updates in PR checklist
   - Block merge if docs not updated
2. **Automated validation:**
   - Scripts verify all CLIs mentioned in feature tables
   - Check command examples exist for each CLI
   - Validate installation instructions complete
3. **Single source of truth:**
   - Template-based docs generated from data
   - CLI comparison table from structured data
   - Command help text generated from definitions
4. **Systematic review:**
   - Doc review in every sprint
   - Assign documentation owner
   - User testing catches doc issues
5. **CLI-specific sections:**
   - Clear delineation of CLI differences
   - "Works in: Claude, Copilot, Codex" markers
   - Separate setup guide for each CLI

**Warning signs:**
- User follows docs but commands don't work
- Installation instructions missing steps for new CLIs
- Feature table has empty cells
- Examples only show one CLI
- Issue reports cite outdated documentation
- Internal team confusion about capabilities

**Phase to address:**
Phase 5: Documentation and Testing (comprehensive docs after implementation complete)

**Recovery cost:** MEDIUM (requires systematic doc audit and updates, but doesn't break code)

---

## Technical Debt Patterns

Shortcuts that seem reasonable but create long-term problems.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip Windows testing, "handle later" | Faster initial development | Windows users hit show-stopping bugs; costly to fix after architecture set | Never (Windows is 30%+ of users) |
| Copy-paste agent to skill without conversion | Quick "it loads" milestone | Broken workflows, lost functionality, user confusion, architecture debt | Only for proof-of-concept demos (never production) |
| Hardcode paths during development | "Makes it work" quickly | Breaks portability, tech debt spreads, requires refactor before release | Never (using `path.join()` is just as fast) |
| Document only primary CLI | Faster to ship | Other CLI users confused, support burden increases, feature adoption lower | Only during private alpha (single CLI) |
| Single flat config file for all CLIs | Simpler initial implementation | CLI conflicts, no namespacing, merge conflicts, state corruption | Never (namespaced config costs nothing) |
| Skip version detection in installer | Fewer edge cases to handle | Data loss, upgrade issues, user frustration, support burden | Never (version detection is 50 lines) |
| Manual path rewriting during install | Seems to solve path issues | Absolute paths break portability, maintenance nightmare | Never (use relative paths or env vars) |

## Integration Gotchas

Common mistakes when connecting to CLI-specific features.

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| GitHub Copilot agents | Assuming skills and agents are interchangeable | Agents have orchestration; use for workflows. Skills are instructional; use for tasks. |
| Codex CLI skills | Expecting native tool/MCP access like Copilot | Skills are docs-only; build tool access via workflow instructions, not native bindings |
| Claude Code commands | Assuming other CLIs support same slash commands | Each CLI has different command system; build CLI-specific invocation |
| Shared `.planning/` directory | Each CLI writing incompatible formats | Define shared spec with namespaced extensions; validate on read |
| Multi-CLI installation | Treating as separate products | Build single codebase with CLI-specific adapters; shared core logic |
| Path handling | Using string concatenation or hardcoded separators | Always use `path.join()`, `path.resolve()`, test cross-platform |
| Command arguments | Assuming argument parsing works identically | Each CLI parses differently; test and document per-CLI behavior |
| Hooks and statusline | Installing Claude-specific hooks in all CLIs | Only install in Claude; document CLI-specific features clearly |

## Performance Traps

Patterns that work at small scale but fail as usage grows.

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Loading all skills/agents on startup | Slow CLI startup time, high memory | Lazy load on invocation; only load active skills | >10 skills installed |
| Synchronous file operations in installer | Installation hangs, unresponsive | Use async I/O; show progress indicator | >100 files to copy |
| Reading entire `.planning/` directory on load | Slow command execution, memory issues | Lazy load only needed state files | >50 planning files |
| No caching of CLI detection results | Repeated detection slows every command | Cache detection results; invalidate on config change | Every command invocation |
| Regenerating all templates on every command | Slow command response time | Cache templates; only regenerate if changed | >20 templates |
| Full state validation on every read | Slow file operations | Validate once at project load; trust thereafter | Every state access |

## Security Mistakes

Domain-specific security issues beyond general web security.

| Mistake | Risk | Prevention |
|---------|------|------------|
| Running installer with `sudo` unnecessarily | Privilege escalation, malicious file replacement | Install to user directories; never require sudo for user-level CLIs |
| Accepting arbitrary paths from user input | Path traversal attacks, file overwrites | Validate and sanitize paths; reject `..` and absolute paths outside project |
| Storing secrets in `.planning/` state files | Credentials leaked in repos, version control | Use environment variables; document never commit secrets to `.planning/` |
| Executing user-provided scripts without validation | Arbitrary code execution | Sandbox script execution; validate before running; document security model |
| Trusting CLI detection without verification | Malicious binaries masquerading as CLIs | Verify CLI signatures/checksums; validate CLI identity before integration |
| Writing installer temp files to CWD | Privilege escalation (CVE-2024-XXXXX Salesforce CLI) | Write to secure temp directory with random names; clean up after |
| Hardcoding API keys or tokens in templates | Token leakage in user projects | Use placeholders; require users to provide their own credentials |

## UX Pitfalls

Common user experience mistakes in this domain.

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| No progress indicator during installation | User thinks it's hung; kills process | Show progress bar, file-by-file feedback, estimated time |
| Error messages like "Installation failed" | No actionable information; user stuck | Specific error + suggested fix: "Claude not found at ~/.claude. Install Claude first or use --local" |
| Requiring manual path configuration | Friction; users give up | Auto-detect with fallback to manual; provide clear examples |
| Silent overwrites of existing files | User loses customizations without warning | Detect customizations; prompt before overwrite; backup option |
| Documentation doesn't match CLI behavior | User follows docs, commands fail | Doc validation in CI; update docs with code changes |
| No way to verify installation worked | User unsure if it's working | Post-install verification command; test each CLI integration |
| Inconsistent command naming across CLIs | User must learn different names for same function | Keep names identical; only invocation differs |
| No migration path between CLIs | User locked to first choice | Shared state format; seamless switching; document migration |

## "Looks Done But Isn't" Checklist

Things that appear complete but are missing critical pieces.

- [ ] **Installer works on Mac:** Often missing Windows path handling — verify on Windows with PowerShell and CMD
- [ ] **Commands load in CLI:** Often missing proper invocation — test actual command execution, not just file presence
- [ ] **Agent/skill exists:** Often missing functional conversion — test workflow completes end-to-end, not just loads
- [ ] **Documentation updated:** Often missing CLI-specific details — verify all CLIs documented with examples
- [ ] **Cross-CLI state works:** Often missing validation/merge logic — test switching CLIs mid-project preserves state
- [ ] **Path handling implemented:** Often still has hardcoded paths — grep for `/` and `\\` in path construction
- [ ] **Installation tested:** Often only tested fresh install — test upgrade, multi-CLI, and edge cases
- [ ] **CLI detection works:** Often only tested default install — test non-standard locations, missing CLIs

## Recovery Strategies

When pitfalls occur despite prevention, how to recover.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Path separator issues | LOW | 1. Replace string concat with `path.join()` globally<br>2. Test on Windows<br>3. Add CI test matrix |
| Agent → Skill lost functionality | HIGH | 1. Audit functionality differences<br>2. Document limitations clearly<br>3. Build workarounds or accept gaps<br>4. User communication about changes |
| Command invocation broken | MEDIUM | 1. Research correct CLI command system<br>2. Create CLI-specific files<br>3. Update installer to deploy them<br>4. Test in each CLI |
| Installer overwrote data | HIGH | 1. User may need to restore from backup<br>2. Add detection immediately<br>3. Communicate about data loss<br>4. Provide recovery docs if possible |
| State corruption from CLI switch | HIGH | 1. Implement state validation<br>2. Provide migration/repair tool<br>3. Document state format<br>4. May need manual state reconstruction |
| Absolute paths break portability | MEDIUM | 1. Switch to relative paths or env vars<br>2. Provide migration tool for old installs<br>3. Update docs with path strategy |
| CLI detection fails | LOW | 1. Add robust multi-stage detection<br>2. Support manual specification<br>3. Improve error messages<br>4. Test edge cases |
| Documentation outdated | MEDIUM | 1. Systematic audit of all docs<br>2. Update with CLI-specific sections<br>3. Add validation to CI<br>4. Announce doc refresh to users |

## Pitfall-to-Phase Mapping

How roadmap phases should address these pitfalls.

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Hardcoded path separators | Phase 1: Installation Infrastructure | Test installer on Windows, macOS, Linux in CI matrix |
| Agent → Skill conversion | Phase 2: Agent/Skill Adaptation | Execute workflows in each CLI; compare functionality |
| Command invocation differences | Phase 3: Command System Integration | Invoke each command in each CLI; verify args parsed |
| Installer overwrites | Phase 1: Installation Infrastructure | Install v1 → Install v2; verify state preserved |
| Shared state incompatibility | Phase 4: Shared State Management | Write state in Claude → Read in Copilot → Read in Codex |
| Absolute paths | Phase 1: Installation Infrastructure | Move installed project between machines; verify works |
| CLI detection failures | Phase 1: Installation Infrastructure | Test with no CLI, multiple CLIs, non-standard locations |
| Documentation drift | Phase 5: Documentation and Testing | Doc validation script in CI; user testing each CLI |

## Sources

**Cross-platform CLI development:**
- [Navigating File Paths Across Windows, Linux/macOS, and WSL](https://dev.to/imperatoroz/navigating-file-paths-across-windows-linux-and-wsl-a-devops-essential-1n03)
- [Top 7 CLI Developer Experience Mistakes Devs Still Make in 2025](https://www.techbuddies.io/2026/01/09/top-7-cli-developer-experience-mistakes-devs-still-make-in-2025/)
- [Top 10 Cross-Platform Pitfalls & How to Avoid Them](https://www.iplocation.net/top-10-cross-platform-pitfalls-how-to-avoid-them-before-or-after-launch)

**Agent/Skill conversion challenges:**
- [GitHub Copilot: About custom agents](https://docs.github.com/en/copilot/concepts/agents/coding-agent/about-custom-agents)
- [GitHub Copilot: About Agent Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Anthropic: Equipping agents for the real world with Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills)
- [Salesforce Agentforce Limitations You Should Know in 2025](https://www.getgenerative.ai/salesforce-agentforce-limitations/)

**Codex CLI architecture:**
- [OpenAI: Agent Skills Documentation](https://developers.openai.com/codex/skills)
- [OpenAI: Create skills](https://developers.openai.com/codex/skills/create-skill)
- [Codex CLI 0.86.0 Update Guide](https://rexai.top/en/posts/2026-01-16-openai-codex-cli-guide/)

**Multi-AI CLI state management:**
- [AWS: CLI Agent Orchestrator](https://aws.amazon.com/blogs/opensource/introducing-cli-agent-orchestrator-transforming-developer-cli-tools-into-a-multi-agent-powerhouse/)
- [Unified AI-CLI Configurator](https://github.com/Diadems666/unified-ai-cli-configurator)
- [Anthropic: Code execution with MCP](https://www.anthropic.com/engineering/code-execution-with-mcp)

**Installation and version detection:**
- [How to fix Python version conflict due to multiple installations](https://stackoverflow.com/questions/79272452/how-to-fix-python-version-conflict-due-to-multiple-installations-on-windows)
- [Salesforce CLI Installer Vulnerability](https://cybersecuritynews.com/salesforce-cli-installer-vulnerability/)
- [SCCM application deployment detection](https://serverfault.com/questions/1165416/sccm-application-deployment-detection-fails-at-first-but-succeeds-later)

**Documentation drift:**
- [Why Documentation Gets Outdated & How to Fix It](https://www.glitter.io/blog/process-documentation/why-documentation-gets-outdated)
- [Taming Version Drift: Keeping Product Docs Aligned Across Teams](https://www.cinfinitysolutions.com/limitless-blog/version-drift-doc-chaos)
- [DocDrift - Catch and Prevent Documentation Drift](https://docdrift.io/)
- [Automating Documentation Maintenance with Prodigy](https://entropicdrift.com/blog/prodigy-docs-automation/)

**GSD codebase analysis:**
- `bin/install.js` - Path handling patterns using `path.join()` and `path.resolve()`
- `.planning/PROJECT.md` - Multi-CLI requirements and architecture decisions
- `docs/github-copilot-cli.md` - Copilot-specific implementation differences

---
*Pitfalls research for: Multi-CLI tool development and Codex CLI integration*
*Researched: 2026-01-20*
*Confidence: HIGH - Based on official documentation, recent blog posts (2024-2025), community discussions, and GSD codebase analysis*
