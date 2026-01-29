# Contributing to Get Shit Done Multi

Thank you for considering contributing to GSD Multi! This document provides guidelines for development setup, testing,
and the pull request process.

## Types of Contributions

We welcome:

- Bug fixes and error handling improvements
- Documentation improvements
- Test coverage additions
- Platform adapter enhancements (Claude, Copilot, Codex)
- Template improvements
- Performance optimizations

## Development Setup

### Prerequisites

- Node.js 20+ (Node 20 LTS)
- npm 9+
- Git
- One of: Claude Code, GitHub Copilot CLI, or Codex CLI

### Installation

```bash
git clone https://github.com/shoootyou/get-shit-done-multi.git
cd get-shit-done-multi
npm install
```plaintext

### Project Structure

```

get-shit-done-multi/
├── bin/                    # CLI entry point
│   └── install.js
├── templates/             # Skills and agents (source of truth)
│   ├── skills/           # 28 GSD command skills
│   ├── agents/           # 13 specialized agents
│   └── shared/           # Platform-specific configuration
├── tests/                # Integration tests
└── docs/                 # Documentation

```plaintext

## Running Tests

All tests execute under `/tmp` directory with isolated subdirectories. Never execute installation in the source directory.

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run specific test file
npm test -- tests/integration/installer.test.js
```

### Test Environment

Tests use Vitest and run in isolated temporary directories:

- Each test creates a fresh `/tmp/gsd-test-*` directory
- Installation manifests are validated
- Platform-specific files are verified
- No tests modify the source directory

## Code Style

This project uses ESLint and Prettier (when available). The codebase maintains:

- ES modules (`import`/`export`)
- Async/await for asynchronous operations
- Descriptive variable names
- Comments for complex logic

While linting and formatting tools are not yet configured, follow the existing code style in the repository.

### Markdown Documentation

We use markdownlint-cli2 for documentation consistency:

```bash
# Check markdown files
npm run lint:md

# Auto-fix markdown issues
npm run lint:md:fix
```

**Before submitting PR:**

- Run `npm run lint:md` to check documentation
- All markdown files must pass linting (0 errors)
- Configuration in `.markdownlint-cli2.jsonc`

## Pull Request Process

1. **Create a feature branch:**

   ```bash
   git checkout -b fix/your-bug-fix
   # or
   git checkout -b feat/your-feature

```plaintext

2. **Make changes with tests:**
   - Write or update tests for your changes
   - Ensure all tests pass: `npm test`
   - Verify no regressions

3. **Run linting and tests:**

   ```bash
   npm test
   ```

1. **Update documentation:**
   - Update relevant docs/ files if changing behavior
   - Update README.md if adding major features
   - Update CHANGELOG.md following Keep a Changelog format

2. **Submit PR with clear description:**
   - Describe what changed and why
   - Reference any related issues
   - Include test results
   - Explain breaking changes (if any)

## Commit Message Format

Follow Conventional Commits:

```plaintext
<type>(<scope>): <subject>

<body>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Test changes
- `chore`: Maintenance tasks (dependencies, tooling)

**Examples:**

```plaintext
feat(installer): add automatic backup before migration

fix(copilot): correct tools field serialization format

docs(readme): add platform comparison section

test(installer): add test for symlink validation
```

## Reporting Issues

### Bug Reports

Include:

- Description of the issue
- Steps to reproduce
- Expected behavior
- Actual behavior
- Environment (OS, Node.js version, platform: Claude/Copilot/Codex)
- Error messages or logs

### Feature Requests

Include:

- Use case description
- Proposed solution or approach
- Why this benefits GSD Multi users
- Alternative approaches considered

### Security Issues

For security vulnerabilities, please email the maintainer privately rather than opening a public issue. This allows us
to address the issue before public disclosure.

## Code of Conduct

Be respectful and constructive:

- Assume good intentions
- Provide actionable feedback
- Focus on the work, not the person
- Welcome newcomers and help them learn

Thank you for contributing to Get Shit Done Multi!
