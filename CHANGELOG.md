# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

**Fork Information:**
Forked from v1.6.4 of [glittercowboy/get-shit-done](https://github.com/glittercowboy/get-shit-done). 
For original project history (versions ≤ v1.6.4), see the [original releases](https://github.com/glittercowboy/get-shit-done/releases).

This CHANGELOG documents the fork development journey from v1.7.0 onward.

---

## [Unreleased]

### Added
- Root documentation files (README.md, CONTRIBUTING.md, CHANGELOG.md)

---

## [2.0.0] - 2026-01-30

### Added
- Multi-platform installer supporting Claude Code, GitHub Copilot CLI, and Codex CLI
- Template-based skill and agent installation system
- Platform adapter pattern for Claude/Copilot/Codex differences
- Interactive CLI with @clack/prompts for platform selection
- Pre-flight validation (disk space, permissions, path security)
- Installation manifest tracking (.gsd-install-manifest.json)
- Update detection across all platforms (global and local)
- 8-layer path security validation (traversal prevention, symlink resolution)
- Comprehensive documentation (12 docs/ files)
- Old version detection with automatic backup and migration
- Installation output verification for all platforms

### Changed
- Migrated from direct .md skills to template rendering
- Updated minimum Node.js requirement to 20.0.0
- Centralized frontmatter correction in templates/
- Improved error handling with actionable guidance
- Package structure optimized for npm publishing

### Fixed
- Agent frontmatter skills field auto-generation
- Tools field serialization format (single-line comma-separated)
- Template variable replacement in shared directory files
- Path resolution on Windows
- Installation permissions on macOS
- Version comparison logic for update detection
- File permission handling during installation
- Template rendering edge cases

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
