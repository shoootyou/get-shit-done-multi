# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Fork Information:**
Forked from v1.6.4 of [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done).
For original project history (versions ≤ v1.6.4), see the [original releases](https://github.com/glittercowboy/get-shit-done/releases).

This CHANGELOG documents the fork development journey from v1.7.0 onward.

**Audience Guide:**
- **For End Users**: What's new from a workflow and usage perspective
- **For Contributors**: What changed internally (architecture, patterns, refactoring)

---

## [2.0.0] - 2026-01-30

Complete rewrite with multi-platform support, template-based installation, and comprehensive automation.

### For End Users

**What's New:**

- **Multi-Platform Support**: Install GSD to Claude Code, GitHub Copilot CLI, or Codex CLI with single command (`npx get-shit-done-multi`)
- **Interactive Installation**: Select your platform interactively during installation with clear visual feedback
- **Auto-Configuration**: Installer now creates platform instructions file (CLAUDE.md, copilot-instructions.md, or AGENTS.md) that teaches your AI assistant about GSD workflows
- **Smart Merge**: If you already have custom instructions, GSD only updates its own section without overwriting your content
- **Update Detection**: Automatically detects when newer GSD version available across all platforms (local and global installations)
- **Old Version Migration**: Automatically backs up and migrates from v1.x installations (preserves your customizations)
- **Better Error Messages**: Clear, actionable guidance when installation fails (disk space, permissions, invalid paths)
- **Installation Verification**: Confirms all files installed correctly before showing success

**Skills & Agents:**

- **29 Skills**: Complete workflow from project creation to milestone completion
- **13 Specialized Agents**: Research, planning, execution, verification, debugging
- **Correct Frontmatter**: All skills have proper `allowed-tools` format (comma-separated string), `argument-hint` for usage guidance
- **Proper Tool Names**: Uses canonical tool names (Read, Write, Edit, Bash, Grep, Glob, Task) that work identically across platforms
- **Auto-Generated Skills Field**: Claude agents automatically get `skills` field populated from content analysis

**Documentation:**

- **13 Documentation Files**: Complete coverage from installation to troubleshooting
- **Quick Start Guide**: Get working in under 60 seconds
- **Platform Comparison Tables**: See differences between Claude/Copilot/Codex at a glance
- **Real Code Examples**: Every example comes from actual codebase with source file citations
- **Troubleshooting Guide**: Solutions for common installation issues

**Requirements:**

- **Node.js 20.0.0+**: Updated from v18 for better ESM support and performance
- **Platform Binary Required**: Must have `claude`, `copilot`, or `codex` command available

### For Contributors

**Architecture Changes:**

- **Template System**: Migrated from `.github/` direct markdown to `templates/` with variable replacement
  - Variables: `{{PLATFORM_ROOT}}`, `{{COMMAND_PREFIX}}`, `{{VERSION}}`, `{{PLATFORM_NAME}}`
  - Single source of truth for skills/agents, rendered per platform
  - Centralized frontmatter correction in templates (no runtime fixes)

- **Platform Adapter Pattern**: 
  - `bin/lib/platforms/base-adapter.js`: Interface definition
  - `bin/lib/platforms/claude-adapter.js`: Claude Code implementation
  - `bin/lib/platforms/copilot-adapter.js`: GitHub Copilot CLI implementation
  - `bin/lib/platforms/codex-adapter.js`: Codex CLI implementation
  - Each adapter handles platform-specific paths, frontmatter, and detection logic

- **Modular Installer Architecture**:
  - `bin/lib/installer/orchestrator.js`: Main installation coordinator
  - `bin/lib/installer/install-skills.js`: Skills installation with progress tracking
  - `bin/lib/installer/install-agents.js`: Agent installation with skills field generation
  - `bin/lib/installer/install-shared.js`: Shared directory (references, templates, workflows)
  - `bin/lib/installer/install-platform-instructions.js`: Platform instructions file with smart merge
  - `bin/lib/installer/install-manifest.js`: Manifest generation and tracking

- **Platform Instructions Installer** (Phase 9):
  - Smart merge logic: creates new, appends without marker, or replaces content between dynamic markers
  - Dynamic block detection: extracts first and last line from template as markers (after variable replacement)
  - Scope-aware paths: different locations for local vs global installations per platform
  - Line ending normalization: CRLF → LF before comparison (cross-platform compatibility)
  - Atomic writes: temp + rename pattern for safe file operations
  - Markdown title interruption handling: inserts before user's custom sections

**Package Structure:**

```
bin/
├── install.js                    # CLI entry point
└── lib/
    ├── installer/                # Installation logic (6 modules)
    ├── platforms/                # Platform adapters (4 files)
    ├── rendering/                # Template rendering
    ├── validation/               # Pre-flight checks (5 validators)
    ├── io/                       # File operations
    └── manifest/                 # Manifest management

templates/
├── skills/                       # 29 skill templates
├── agents/                       # 13 agent templates
├── shared/                       # References, templates, workflows
└── AGENTS.md                     # Platform instructions template

tests/
├── integration/                  # End-to-end tests
└── unit/                         # Module tests
```

**Pre-Flight Validation** (8 layers):

1. **Disk Space**: Ensures 10MB+ available before installation
2. **Write Permissions**: Tests target directory writable
3. **Path Security**: 8-layer validation (traversal prevention, symlink resolution, depth limits)
4. **Binary Detection**: Confirms platform binary exists and is executable
5. **Old Version Detection**: Checks for v1.x installations, offers migration
6. **Directory State**: Validates or creates target directories
7. **File Conflicts**: Detects existing files, handles gracefully
8. **Manifest Integrity**: Validates previous installations before upgrade

**Installation Manifest** (`.gsd-install-manifest.json`):

- Tracks: version, platform, scope, timestamp, file list
- Used for: update detection, version comparison, uninstall operations, integrity checking
- Location: Inside get-shit-done/ directory (one manifest per installation)

**Tool Name Normalization**:

Copilot aliases → Claude canonical:
- `execute` → `Bash`
- `search` → `Grep`
- `replace` → `Sed`
- Case-insensitive matching during rendering

**Testing**:

- Integration tests for all platforms and scenarios
- Unit tests for validators, adapters, template rendering
- Test coverage for: installation flow, migration, update detection, error handling

**Fixes:**

- Agent frontmatter `skills` field auto-generation (scans content for `/gsd-*` references)
- Tools field serialization (comma-separated, single-line format)
- Template variable replacement in shared directory files (recursive processing)
- Path resolution on Windows (proper separator handling)
- Installation permissions on macOS (user directory permission checks)
- Version comparison logic (proper semver handling)
- File permission handling during installation (mode preservation)
- Template rendering edge cases (missing variables, malformed frontmatter)

**Build & Publishing**:

- Optimized package structure for npm (excluded test fixtures, planning files)
- Added proper `.npmignore` for clean package
- ESM-only package (no CommonJS)
- Minimum Node.js 20.0.0 enforced

---

## [1.8.0] - 2026-01-20

### Added

- Milestone archiving workflow
- Codebase mapping improvements

### Changed

- Refined planning and verification workflows

---

## [1.7.0] - 2026-01-19

### Added

- Initial multi-CLI support experiments
- Codex CLI adapter prototype
- Early template migration exploration

### Changed

- Began migration from Claude-only to multi-platform architecture

---

## [1.6.4] - 2026-01-17

**Note:** This is the fork point. For versions prior to v1.6.4, see the [original project history](https://github.com/glittercowboy/get-shit-done/releases).

### Fixed

- Installation on WSL2/non-TTY terminals now works correctly
- Installation now verifies files were actually copied before showing success checkmarks
- Orphaned `gsd-notify.sh` hook from previous versions is now automatically removed
