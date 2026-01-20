# Domain Pitfalls: Milestone Archiving & Codebase Analysis

**Domain:** Milestone management and codebase analysis tooling
**Researched:** January 20, 2025
**Context:** Safety-critical operations (file moves, git commits) in CLI workflow systems

## Critical Pitfalls

Mistakes that cause data loss or require rewrites.

---

### Pitfall 1: Archiving Uncommitted Changes

**What goes wrong:**
Archiving or moving milestone directories when the workspace has uncommitted changes leads to permanent data loss. The standard `git archive` command only captures committed files—it silently ignores:
- Modified tracked files (not yet committed)
- Untracked files (never added with `git add`)
- Staged but uncommitted changes

**Why it happens:**
- Developers assume archiving operations capture the "current state" of the workspace
- No pre-flight check for dirty working directory state
- Trust in git operations without understanding their scope limitations

**Consequences:**
- Hours or days of uncommitted work lost permanently
- No recovery path unless IDE local history or OS-level backups exist
- User loses trust in the tooling after first data loss incident

**Prevention:**
1. **Pre-flight dirty state check** - ALWAYS run `git status --porcelain` before any archive/move operation
2. **Block operations on dirty state** - Refuse to proceed if output is non-empty
3. **Require explicit confirmation** - Force user to acknowledge uncommitted changes will be lost, or require `--force` flag with scary warning
4. **Offer stash or commit** - Provide clear guidance: "You have uncommitted changes. Run `git stash` or commit them first."
5. **Include dry-run mode** - Show exactly what would be archived before proceeding

**Detection (Warning Signs):**
- User reports "files disappeared" after archiving
- Git status shows clean state but user insists they had changes
- Archive doesn't contain recently edited files

**Phase Mapping:**
- Phase 1 (Archive Command): Implement dirty state detection
- Phase 2 (Safety Checks): Add pre-flight validation protocol
- Phase 3 (User Guidance): Provide recovery suggestions in error messages

**Sources:**
- Git archive documentation (official)
- Stack Overflow: git archive with uncommitted changes
- GitHub Codespaces data loss incident (2025)

---

### Pitfall 2: Non-Atomic File Move Operations

**What goes wrong:**
Moving milestone directories without atomic operations can leave the repository in a broken state:
- Partial moves (some files moved, others not)
- Interrupted operations (process killed mid-move)
- Cross-filesystem moves that aren't atomic

**Why it happens:**
- Using simple `mv` or file system operations without transaction safety
- Not checking if source and destination are on same filesystem
- No rollback mechanism for failed operations

**Consequences:**
- Split milestone state: files in both old and new locations
- Broken git history: commits reference paths that no longer exist
- Cannot complete operation, cannot undo it
- Requires manual cleanup and may lose data

**Prevention:**
1. **Atomic rename when possible** - Use rename operations within same filesystem (guaranteed atomic)
2. **Temporary staging directory** - Move to `.tmp/milestone-archive-{timestamp}` first, then final location
3. **Transaction pattern** - Write operations to temp location, verify success, then atomic rename
4. **Verify before delete** - After copy, verify destination matches source before deleting source
5. **Create checkpoint** - Save state before operation, with clear rollback instructions

**Detection (Warning Signs):**
- Duplicate files in old and new locations
- Git shows massive file deletions and additions (should be renames)
- Archive operation reports partial success
- Directory structure incomplete in destination

**Phase Mapping:**
- Phase 1 (Archive Command): Implement atomic move pattern
- Phase 2 (Transaction Safety): Add rollback mechanism
- Phase 3 (Verification): Validate complete state transfer

**Sources:**
- Linux atomic file operations best practices
- Java Files.move ATOMIC_MOVE documentation
- Enterprise archiving transaction patterns

---

### Pitfall 3: Orphaned Git Commits After Archiving

**What goes wrong:**
Archiving a milestone branch without proper ref tracking creates orphaned commits—commits no longer referenced by any branch or tag. These commits:
- Are invisible in normal git history
- Will be garbage collected (permanently deleted) eventually
- Contain valuable work that becomes unrecoverable

**Why it happens:**
- Deleting branch without creating archive tag or ref
- Moving files without updating git history references
- Assuming archived commits remain accessible indefinitely

**Consequences:**
- Historical work becomes unrecoverable after garbage collection
- Cannot trace why decisions were made (lost context)
- Compliance/audit issues if milestone history is required
- Team confusion: "I remember we solved this, but where?"

**Prevention:**
1. **Create archive tag** - Always create `archive/{milestone-name}` tag before deleting branch
2. **Update refs** - Create ref in `refs/archive/` namespace to preserve commit history
3. **Document in commit** - Archive operation should create commit referencing original branch SHA
4. **Namespace convention** - Use `archive/v1/milestone-name` format for discoverability
5. **Pre-delete verification** - Show commits that will become orphaned, require confirmation

**Detection (Warning Signs):**
- `git fsck --lost-found` finds dangling commits
- Cannot find expected commits in git log
- Branch deleted but no corresponding tag exists
- Team asking "where did the X implementation go?"

**Phase Mapping:**
- Phase 1 (Archive Command): Implement tag creation
- Phase 2 (Git Integration): Add ref preservation logic
- Phase 3 (Documentation): Generate archive manifest with SHAs

**Sources:**
- Git orphan branch strategies
- Git ref tracking and archiving best practices
- git-orphanarium tool documentation

---

### Pitfall 4: Overly Broad Exclusion Patterns

**What goes wrong:**
Codebase analysis exclusion patterns (`.gsdignore`, gitignore-style) accidentally exclude critical files:
- Pattern `**/*.*` excludes ALL files with extensions
- Pattern `*.md` excludes documentation needed for context
- Pattern `/log` only excludes root-level, not `src/services/log/`
- Negation patterns `!important.log` fail if parent directory already excluded

**Why it happens:**
- Copy-paste from templates without understanding glob semantics
- Testing with small subset, deploying to full codebase
- Not understanding difference between directory (`logs/`) and file (`logs`) patterns
- Negation pattern ordering issues (must come after broader pattern)

**Consequences:**
- Critical source files excluded from analysis, appearing as "not found"
- Security vulnerabilities in excluded files never detected
- Incomplete codebase context for analysis tools
- Silent failures—tool doesn't warn about excluded files

**Prevention:**
1. **Validate patterns before use** - Test against actual file tree, show what matches
2. **Dry-run visualization** - `--show-excluded` flag to preview what will be ignored
3. **Be specific, not broad** - Use `build/output/` not `build/`, `*.log` not `*.*`
4. **Directory trailing slash** - Always use `logs/` to exclude directories, not `logs`
5. **Pattern audit command** - Tool to show all exclusions and verify intent
6. **Sane defaults** - Start with minimal exclusions, let users add more

**Detection (Warning Signs):**
- Analysis results show fewer files than expected
- "File not found" errors for files that exist
- Exclusion config file growing without bound
- Team members confused about what's being analyzed

**Phase Mapping:**
- Phase 1 (Exclusion System): Implement pattern validation and dry-run
- Phase 2 (User Guidance): Add pattern audit and visualization
- Phase 3 (Safety): Warn on overly broad patterns (e.g., `**/*`)

**Sources:**
- Advanced .gitignore patterns guide
- gitignore pattern debugging best practices
- Codebase analysis configuration complexity pitfalls

---

## Moderate Pitfalls

Mistakes that cause delays or technical debt.

---

### Pitfall 5: Poor Auto-Generated Commit Messages

**What goes wrong:**
Automated archiving commits with low-quality messages:
- "Update files" (completely uninformative)
- "Archive milestone" (missing which milestone, why, when)
- Generic AI-generated message that misinterprets the change
- No reference to original milestone or ticket

**Why it happens:**
- Trusting automation without human review
- Template doesn't include context variables (milestone name, date, reason)
- No enforcement of commit message quality standards
- AI generation without customization for domain

**Consequences:**
- Git history becomes useless for debugging
- Cannot understand why archive was created
- Compliance issues: audit trail unclear
- Blame becomes "who ran the tool?" not "why was this decision made?"

**Prevention:**
1. **Rich commit templates** - Include milestone name, date, reason, ticket reference
2. **Conventional Commits format** - `archive(milestone-v1): Move completed phase 1 to archive [PROJ-123]`
3. **Human review step** - Always prompt user to review/edit commit message before committing
4. **Context injection** - Auto-populate with metadata: milestone ID, completion date, responsible party
5. **Commit message linting** - Validate message meets quality standards before accepting

**Detection (Warning Signs):**
- Recent commits have generic messages
- Cannot determine why archive was created from git log
- Multiple "Archive milestone" commits with no differentiation
- Team using `git blame` complains about useless messages

**Phase Mapping:**
- Phase 1 (Archive Command): Implement rich commit message templates
- Phase 2 (Git Integration): Add human review step
- Phase 3 (Quality): Add commit message validation

**Sources:**
- AI-generated commit message mistakes and prevention
- Conventional Commits specification
- Git commit message best practices 2025

---

### Pitfall 6: No Clear Recovery Path

**What goes wrong:**
User archives milestone but has no documented way to:
- Undo the archive operation
- Restore archived files to working state
- Access archived content for reference
- Recover from accidental archive

**Why it happens:**
- Tool focuses on "forward path" (archiving) but not "backward path" (recovery)
- Assumption that git is enough (but users don't know how to use it)
- No documentation of recovery procedures
- No built-in recovery commands

**Consequences:**
- Users afraid to use archiving feature (fear of losing access)
- Support burden: "How do I get this back?"
- Manual git operations required (intimidating for non-experts)
- Lost productivity recovering from mistakes

**Prevention:**
1. **Document recovery in archive output** - "To restore: git checkout archive/milestone-v1"
2. **Built-in restore command** - `gsd:restore-milestone --milestone v1`
3. **Archive manifest** - Create `ARCHIVE_MANIFEST.md` with recovery instructions
4. **Test recovery path** - Ensure restore actually works, not just theory
5. **Preview archive contents** - `--list` flag to show archived files without restoring

**Detection (Warning Signs):**
- Users asking "How do I get this back?"
- Feature avoidance: "I won't archive because I might need it"
- Manual git operations attempted (and failed)
- Support tickets about recovery

**Phase Mapping:**
- Phase 1 (Archive Command): Add recovery documentation to output
- Phase 2 (Restore Command): Implement restore functionality
- Phase 3 (UX Polish): Add preview and verification features

**Sources:**
- Enterprise file archiving recovery best practices
- Disaster recovery path documentation patterns
- CLI undo operation design patterns

---

### Pitfall 7: Cross-Platform Path Handling

**What goes wrong:**
Archive operations fail or corrupt data due to path handling differences:
- Windows `\` vs Unix `/` path separators
- Case-sensitive (Linux) vs case-insensitive (macOS/Windows) filesystems
- Path length limits (Windows MAX_PATH = 260 characters)
- Special characters in filenames (`:` invalid on Windows)

**Why it happens:**
- Testing only on development platform (usually macOS/Linux)
- Using platform-specific path operations
- Not normalizing paths before git operations
- Assuming all paths are valid across platforms

**Consequences:**
- Archive fails on Windows but works on macOS
- Silently corrupts filenames with special characters
- Path truncation on Windows loses data
- Cannot restore archive on different platform than created

**Prevention:**
1. **Normalize all paths** - Use `path.normalize()` or equivalent before operations
2. **Validate path lengths** - Warn if paths exceed Windows limits
3. **Sanitize filenames** - Replace invalid characters before archiving
4. **Test on all platforms** - CI must include Windows, macOS, Linux tests
5. **Use cross-platform libraries** - Don't roll your own path handling

**Detection (Warning Signs):**
- Works on macOS, fails on Windows (or vice versa)
- Filenames with `\` appearing in git commits
- "Path too long" errors on Windows
- Special characters cause failures

**Phase Mapping:**
- Phase 1 (Archive Command): Implement path normalization
- Phase 2 (Platform Testing): Add cross-platform CI tests
- Phase 3 (Validation): Add path validation and sanitization

**Sources:**
- Node.js path module documentation
- Cross-platform file operations best practices
- Windows path length limitations

---

## Minor Pitfalls

Mistakes that cause annoyance but are fixable.

---

### Pitfall 8: Ignoring Already-Tracked Files

**What goes wrong:**
User adds pattern to `.gsdignore` expecting files to be excluded, but they're still analyzed because they're already tracked by git.

**Why it happens:**
- Misunderstanding that ignore patterns only apply to untracked files
- Not running `git rm --cached` to untrack files first
- Tool doesn't distinguish between tracked and untracked when reading ignore patterns

**Prevention:**
1. **Detect tracked files matching new patterns** - Warn "Pattern matches 5 already-tracked files"
2. **Offer to untrack** - "Run `git rm --cached <files>` to exclude them"
3. **Documentation** - Clearly explain ignore patterns don't affect tracked files
4. **Analysis-time override** - For analysis tools, allow ignoring tracked files (unlike git)

**Detection (Warning Signs):**
- User adds ignore pattern, files still appear in analysis
- Confusion about why ignore isn't working
- Multiple attempts to add more specific patterns

**Phase Mapping:**
- Phase 2 (Exclusion System): Add tracked file detection
- Phase 3 (User Guidance): Provide untrack suggestions

---

### Pitfall 9: Lost Context After Archive

**What goes wrong:**
Archived milestone has no context about:
- Why it was archived (completion? cancellation? superseded?)
- What it accomplished
- Related tickets/issues
- Next steps or follow-up work

**Why it happens:**
- Archive operation is mechanical (just moving files)
- No prompt for archive reason or notes
- No template for archival documentation

**Prevention:**
1. **Prompt for archive reason** - Required field: "Why archiving? (completed/cancelled/superseded)"
2. **Generate ARCHIVE_README.md** - Template with completion date, reason, accomplishments, related work
3. **Link to original milestone** - Include pointer to PROJECT.md or original phase document
4. **Tag with metadata** - Git tag annotation includes reason and timestamp

**Detection (Warning Signs):**
- Team asking "Why did we archive this?"
- Cannot determine if milestone was completed or abandoned
- Lost institutional knowledge

**Phase Mapping:**
- Phase 2 (Archive Documentation): Add reason prompt and README generation
- Phase 3 (Metadata): Add tag annotations with context

---

### Pitfall 10: No Progress Indication for Large Archives

**What goes wrong:**
Archiving large milestone (thousands of files) appears to hang—no progress indicator, no feedback, user doesn't know if it's working.

**Why it happens:**
- Focus on correctness, not UX
- Operations happen synchronously without progress tracking
- No indication of what's happening (checking status? moving files? committing?)

**Prevention:**
1. **Progress bars** - Show file count and percentage
2. **Step indicators** - "1/5: Checking git status... 2/5: Creating archive tag..."
3. **Time estimates** - "Archiving 1,247 files (estimated 30s)..."
4. **Verbose mode** - `--verbose` flag for detailed operation logs
5. **Spinner for async ops** - At minimum, show activity indicator

**Detection (Warning Signs):**
- Users killing "hung" operations that were actually working
- "Is it frozen?" support questions
- Anxiety about large archive operations

**Phase Mapping:**
- Phase 3 (UX Polish): Add progress indicators and time estimates

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| Archive Command (Phase 1) | Data loss from uncommitted changes | Pre-flight dirty state check, block on dirty state |
| Git Integration (Phase 2) | Orphaned commits after archiving | Create archive tags and refs before deleting branches |
| Exclusion Patterns (Phase 2) | Overly broad patterns exclude critical files | Pattern validation, dry-run visualization, audit command |
| Recovery System (Phase 2) | No way to undo archive | Built-in restore command, recovery documentation |
| User Experience (Phase 3) | Confusing workflows, unclear next steps | Progress indicators, clear messaging, confirmation prompts |
| Cross-Platform Support (Phase 3) | Path handling breaks on Windows | Path normalization, cross-platform CI tests |
| Commit Quality (Phase 2) | Generic auto-generated messages | Rich templates, human review, message linting |

---

## Research Confidence

| Area | Confidence | Source Quality |
|------|------------|----------------|
| Git uncommitted changes | HIGH | Official Git docs, Stack Overflow consensus |
| Atomic file operations | HIGH | Platform documentation (Linux, Java), enterprise best practices |
| Orphaned commits | MEDIUM | Community tools (git-orphanarium), best practice articles |
| Exclusion patterns | HIGH | Official gitignore documentation, pattern debugging guides |
| Commit message quality | MEDIUM | AI tooling articles, Conventional Commits spec |
| Recovery paths | MEDIUM | Enterprise archiving best practices, disaster recovery guides |
| CLI UX patterns | HIGH | CLI design guidelines (clig.dev), destructive operations best practices |
| Cross-platform paths | HIGH | Platform documentation (Node.js, Windows, POSIX) |

---

## Sources

### Official Documentation
- Git official documentation (git-archive, refs, orphan branches)
- Node.js path module documentation
- Java Files.move API documentation

### Best Practices & Guidelines
- Command Line Interface Guidelines (clig.dev)
- Conventional Commits specification
- Advanced .gitignore patterns guide (2025)
- Enterprise file archiving and disaster recovery best practices

### Community Knowledge
- Stack Overflow: git archive with uncommitted changes
- GitHub Codespaces data loss incident discussion (2025)
- git-orphanarium tool (orphaned commit detection)
- 7 Deadly AI Git Commit Message Mistakes article

### Analysis Tools
- Codebase-digest (codebase analysis configuration)
- Configuration complexity research (Bay Tech Consulting)
- Code complexity measurement best practices (2025)

---

## Critical Success Factors

For this milestone to succeed, the implementation MUST:

1. **Never lose data** - Pre-flight checks, atomic operations, rollback capability
2. **Be reversible** - Clear recovery path, restore command, archive manifest
3. **Provide feedback** - Progress indicators, clear errors, next steps
4. **Work cross-platform** - Windows, macOS, Linux all supported
5. **Maintain git hygiene** - Quality commits, preserved history, no orphans
6. **Be conservative** - Fail safe, require confirmation, provide dry-run

The stakes are high: one data loss incident destroys user trust permanently.
