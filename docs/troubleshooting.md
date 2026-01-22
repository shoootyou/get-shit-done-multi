# Troubleshooting Guide

This guide covers common errors and their solutions when working with the multi-platform agent template system.

## Table of Contents

1. [Installation Errors](#installation-errors)
2. [Validation Failures](#validation-failures)
3. [Generation Errors](#generation-errors)
4. [Runtime Errors](#runtime-errors)
5. [Platform Detection Issues](#platform-detection-issues)
6. [Agent Invocation Problems](#agent-invocation-problems)
7. [Getting Help](#getting-help)

## Installation Errors

### npm install failures

**Symptom:**
```
Error: Cannot find module 'gray-matter'
Error: Cannot find module 'js-yaml'
```

**Cause:** Incomplete or failed installation

**Solution:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Verify installation
npm ls gray-matter js-yaml mustache
```

**Expected output:**
```
├── gray-matter@4.0.3
├── js-yaml@4.1.0
└── mustache@4.2.0
```

---

### Permission errors during install

**Symptom:**
```
Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
npm ERR! code EACCES
```

**Cause:** npm global install without proper permissions

**Solution:**

**Option 1 - Use npx (recommended):**
```bash
npx lib-ghcc --all
```

**Option 2 - Fix npm permissions:**
```bash
# Use npm's built-in solution
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc

# Retry installation
npm install -g lib-ghcc
```

**Option 3 - Use local install:**
```bash
node bin/install.js --local
```

---

### Platform detection failures

**Symptom:**
```
Warning: Could not detect installed CLIs
Warning: Neither Claude nor Copilot CLI detected
```

**Cause:** CLI not installed or not in PATH

**Solution:**

**Verify CLI installation:**
```bash
# Check Claude CLI
which claude
claude --version

# Check Copilot CLI
which gh
gh copilot --version
```

**If not installed:**

**Claude CLI:**
```bash
# Follow installation instructions from Claude documentation
# (Installation method varies by platform)
```

**Copilot CLI:**
```bash
# Install GitHub CLI first
# macOS: brew install gh
# Linux: See https://github.com/cli/cli/blob/trunk/docs/install_linux.md
# Windows: See https://github.com/cli/cli#windows

# Install Copilot extension
gh extension install github/gh-copilot
```

**If CLIs installed but not detected:**
```bash
# Use explicit platform flag
node bin/install.js --local    # Force Claude local install
node bin/install.js --copilot  # Force Copilot install
```

---

## Validation Failures

### Tool name validation errors

**Symptom:**
```
Error: Unknown tool name: 'bash' in agent spec
Warning: Tool 'grep' not recognized for platform 'copilot'
```

**Cause:** Tool name doesn't match canonical set or uses wrong case

**Solution:**

Check tool names against canonical list:

**Valid tool names:**
- **Claude:** `Bash`, `Read`, `Edit`, `Grep`, `Glob`, `Task` (uppercase)
- **Copilot:** `execute`, `read`, `edit`, `search`, `agent` (lowercase PRIMARY aliases)

**Fix in spec:**
```yaml
# ❌ Wrong
tools: [bash, read, grep]

# ✅ Correct for Claude
{{#isClaude}}
tools: [Bash, Read, Grep]
{{/isClaude}}

# ✅ Correct for Copilot
{{#isCopilot}}
tools: [execute, read, search]
{{/isCopilot}}
```

**Note:** Both `Grep` and `Glob` map to `search` in Copilot (automatically deduplicated)

---

### Spec validation errors

**Symptom:**
```
Error: Invalid frontmatter in specs/agents/my-agent.md
Error: YAML parse error at line 5: unexpected token
```

**Cause:** YAML syntax error in spec frontmatter

**Solution:**

**Validate YAML syntax:**
```bash
# Use Node.js to validate
node -e "const yaml = require('js-yaml'); const fs = require('fs'); const matter = require('gray-matter'); console.log(matter(fs.readFileSync('specs/agents/my-agent.md', 'utf8')).data)"
```

**Or use online validator:**
- Copy frontmatter (between `---` markers)
- Validate at https://www.yamllint.com/

**Common YAML errors:**

**Unquoted special characters:**
```yaml
# ❌ Wrong
description: Agent with: colons causes errors

# ✅ Correct
description: "Agent with: colons needs quotes"
```

**Inconsistent indentation:**
```yaml
# ❌ Wrong
tools:
 - execute
  - read  # Mixed spaces/tabs

# ✅ Correct
tools:
  - execute
  - read
```

**Unclosed quotes:**
```yaml
# ❌ Wrong
description: "Agent description

# ✅ Correct
description: "Agent description"
```

---

### Size limit exceeded (Copilot)

**Symptom:**
```
Error: Agent exceeds 30,000 character limit (34,567 chars)
Generation failed for platform 'copilot'
```

**Cause:** Agent content too large for Copilot's 30K character limit

**Solution:**

**Option 1 - Use agent splitting pattern:**

See [AGENT-SPLIT-PATTERN.md](AGENT-SPLIT-PATTERN.md) for coordinator/specialist decomposition.

**Key steps:**
1. Split into coordinator (execution) + specialist (methodology)
2. Coordinator uses original name (backward compatible)
3. Specialist provides deep knowledge via task tool
4. 100% content preservation (zero loss)

**Example structure:**
```
gsd-large-agent.md (41K) →
  ├─ gsd-large-agent.md (20K - coordinator)
  └─ gsd-large-agent-specialist.md (21K - specialist)
```

**Option 2 - Reduce content:**
```bash
# Check current size
wc -c specs/agents/my-agent.md

# Identify large sections
grep -n "##" specs/agents/my-agent.md

# Consider moving examples to separate docs
```

**Option 3 - Skip Copilot for this agent:**
```yaml
# Document in README that agent is Claude-only
# due to size constraints
```

---

## Generation Errors

### Template rendering failures

**Symptom:**
```
Error: Unclosed tag at line 42
Error: Unknown variable '{{unknownVar}}'
```

**Cause:** Mustache syntax error in template

**Solution:**

**Check for matching tags:**
```bash
# Find unclosed conditionals
grep -n "{{#" specs/agents/my-agent.md
grep -n "{{/" specs/agents/my-agent.md

# Each {{#name}} must have matching {{/name}}
```

**Common mistakes:**

**Unclosed conditional:**
```markdown
# ❌ Wrong
{{#isClaude}}
Claude-specific content
# Missing {{/isClaude}}

# ✅ Correct
{{#isClaude}}
Claude-specific content
{{/isClaude}}
```

**Mismatched tags:**
```markdown
# ❌ Wrong
{{#isClaude}}
Content
{{/isCopilot}}  # Wrong closing tag

# ✅ Correct
{{#isClaude}}
Content
{{/isClaude}}
```

**Unknown variables:**
```markdown
# ❌ Wrong
tools: {{unknownTool}}

# ✅ Correct
tools: {{toolBash}}
```

**Available variables:**
- `{{toolBash}}`, `{{toolRead}}`, `{{toolEdit}}`
- `{{toolGrep}}`, `{{toolGlob}}`, `{{toolTask}}`
- `{{isClaude}}`, `{{isCopilot}}`
- `{{timestamp}}`, `{{projectName}}`, `{{projectVersion}}`

---

### File write errors

**Symptom:**
```
Error: ENOENT: no such file or directory, open 'agents/my-agent.md'
Error: EACCES: permission denied, open 'agents/my-agent.md'
```

**Cause:** Directory doesn't exist or no write permissions

**Solution:**

**Check directories exist:**
```bash
# Create missing directories
mkdir -p agents
mkdir -p .github/copilot/agents

# Verify permissions
ls -ld agents .github/copilot/agents
```

**Fix permissions:**
```bash
# Make directories writable
chmod 755 agents
chmod -R 755 .github/copilot/agents
```

**Check disk space:**
```bash
df -h .
# Ensure sufficient space for generated files
```

---

### Platform transformation errors

**Symptom:**
```
Warning: Tools not transformed correctly
Warning: Metadata structure incorrect for platform
```

**Cause:** Field transformer mapping issue or platform capability mismatch

**Solution:**

**Check tool mapping:**
```javascript
// Test tool mapper
node -e "const tm = require('./bin/lib/template-system/tool-mapper'); console.log(tm.mapToolsForPlatform(['Bash', 'Read'], 'copilot'))"
// Expected: ['execute', 'read']
```

**Verify platform capabilities:**
```javascript
// Check field transformer
node -e "const ft = require('./bin/lib/template-system/field-transformer'); console.log(ft.PLATFORM_CAPABILITIES.copilot)"
```

**Run validation tests:**
```bash
# Test field transformation
node bin/lib/template-system/field-transformer.test.js

# Test tool mapping
node bin/lib/template-system/tool-mapper.test.js
```

---

## Runtime Errors

### Agent not found errors

**Symptom:**
```
# Claude
Error: Agent 'my-agent' not found

# Copilot
Error: No agent named 'my-agent' is available
```

**Cause:** Agent not generated or in wrong location

**Solution:**

**Verify agent exists:**
```bash
# Claude agents
ls -la agents/ | grep my-agent

# Copilot agents
ls -la .github/copilot/agents/ | grep my-agent
```

**If missing, regenerate:**
```bash
# Regenerate all agents
node bin/install.js --all

# Or platform-specific
node bin/install.js --local     # Claude
node bin/install.js --copilot   # Copilot
```

**Verify generation succeeded:**
```bash
npm run test:generation
```

**Check CLI can find agents:**
```bash
# Claude
claude --list-agents | grep my-agent

# Copilot
gh copilot agent list | grep my-agent
```

---

### Tool invocation failures

**Symptom:**
```
Error: Tool 'execute' failed to execute
Error: Unknown tool 'search' requested by agent
```

**Cause:** Tool not available in CLI or incorrect tool name

**Solution:**

**Check CLI version:**
```bash
# Claude
claude --version
# Requires recent version with tool support

# Copilot
gh copilot --version
# Requires recent version with tool support
```

**Update CLI if needed:**
```bash
# Claude - Follow update instructions for your platform

# Copilot
gh extension upgrade gh-copilot
```

**Verify tool availability:**
```bash
# List available tools (if CLI supports)
claude --help | grep -i tools
gh copilot --help | grep -i tools
```

**Check agent spec uses correct tool names:**
```bash
# View generated agent
cat agents/my-agent.md | head -20
cat .github/copilot/agents/my-agent.md | head -20
```

---

### Checkpoint parsing errors

**Symptom:**
```
Agent stopped unexpectedly
Agent returned invalid checkpoint structure
```

**Cause:** Checkpoint markup incorrect in agent content

**Solution:**

**Check checkpoint structure in spec:**
```xml
<!-- ✅ Correct checkpoint structure -->
<checkpoint type="human-verify">
  <what-was-built>
    Description of completed work
  </what-was-built>
  <how-to-verify>
    1. Step one
    2. Step two
  </how-to-verify>
</checkpoint>
```

**Validate XML structure:**
```bash
# Check for unclosed tags
grep -n "<checkpoint" specs/agents/my-agent.md
grep -n "</checkpoint>" specs/agents/my-agent.md
```

**Test checkpoint handling:**
```bash
# Manually invoke and observe checkpoint behavior
claude --agent my-agent "test checkpoint flow"
```

---

## Platform Detection Issues

### Claude not detected

**Symptom:**
```
Warning: Claude CLI not detected, skipping Claude agent generation
Installation complete (Copilot only)
```

**Cause:** Claude CLI not installed or not in PATH

**Solution:**

**Verify Claude CLI:**
```bash
# Check installation
which claude
claude --version
```

**If not in PATH:**
```bash
# Find Claude installation
find /usr/local -name "claude" 2>/dev/null
find ~ -name "claude" 2>/dev/null

# Add to PATH (example)
echo 'export PATH="/path/to/claude/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

**Force install without detection:**
```bash
# Install to local directory regardless of CLI detection
node bin/install.js --local
```

---

### Copilot not detected

**Symptom:**
```
Warning: GitHub Copilot CLI not detected
Install with: gh extension install github/gh-copilot
```

**Cause:** GitHub Copilot CLI extension not installed

**Solution:**

**Install Copilot extension:**
```bash
# Check GitHub CLI installed first
gh --version

# Install Copilot extension
gh extension install github/gh-copilot

# Verify installation
gh copilot --version
```

**If GitHub CLI not installed:**
```bash
# macOS
brew install gh

# Ubuntu/Debian
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh

# Windows
# Download from https://github.com/cli/cli/releases
```

**Force install with flag:**
```bash
node bin/install.js --copilot
```

---

## Agent Invocation Problems

### Agent doesn't respond

**Symptom:**
```
# No output after invoking agent
$ claude --agent my-agent "test prompt"
# ... silence ...
```

**Cause:** Agent not properly registered with CLI

**Solution:**

**Restart CLI:**
```bash
# Some CLIs cache agent list
# Restart terminal or reload config
source ~/.bashrc

# Or kill and restart CLI daemon (if applicable)
```

**Re-install agent:**
```bash
# Remove and regenerate
rm agents/my-agent.md
node bin/install.js --local

# Verify registration
claude --list-agents | grep my-agent
```

**Check agent content valid:**
```bash
# Validate YAML frontmatter
head -20 agents/my-agent.md
```

---

### Wrong platform agent invoked

**Symptom:**
```
Using Copilot CLI but getting Claude tool names in output
Agent references 'Bash' but Copilot uses 'execute'
```

**Cause:** Wrong platform agents generated or installed to wrong location

**Solution:**

**Verify correct platform agents exist:**
```bash
# Claude should have uppercase tools
grep "tools:" agents/my-agent.md
# Expected: tools: Bash, Read, Edit

# Copilot should have lowercase array
grep -A 3 "tools:" .github/copilot/agents/my-agent.md
# Expected: 
# tools:
#   - execute
#   - read
#   - edit
```

**Regenerate for correct platform:**
```bash
# Clear old agents
rm -rf agents/*
rm -rf .github/copilot/agents/*

# Regenerate
node bin/install.js --all

# Verify generation
npm run test:generation
```

**Check CLI using correct location:**
```bash
# Claude looks in: agents/ or ~/.config/claude/agents/
# Copilot looks in: .github/copilot/agents/

# Verify CLI configuration
claude --help | grep -i "agent"
gh copilot --help | grep -i "agent"
```

---

### Model selection not working

**Symptom:**
```
Agent always uses default model despite 'model: claude-opus-4.5' in spec
```

**Cause:** Model parameter not supported by CLI version or incorrect syntax

**Solution:**

**Check CLI version:**
```bash
claude --version
gh copilot --version
```

**Verify model support:**
```bash
# Check if CLI supports model parameter
claude --help | grep -i model
gh copilot --help | grep -i model
```

**Check spec syntax:**
```yaml
# ✅ Correct
---
name: my-agent
model: claude-sonnet-4.5
---

# ❌ Wrong - typo or unsupported model
---
name: my-agent
model: gpt-4  # May not be supported by Claude CLI
---
```

**Override at invocation (if supported):**
```bash
# Force specific model
claude --agent my-agent --model claude-opus-4.5 "prompt"
gh copilot agent my-agent --model gpt-4o "prompt"
```

---

## Getting Help

### Check Documentation

Before filing an issue, review these resources:

1. **[ARCHITECTURE.md](../ARCHITECTURE.md)** - Technical design and implementation details
2. **[CONTRIBUTING.md](../CONTRIBUTING.md)** - How to add agents and run tests
3. **[TESTING-CROSS-PLATFORM.md](TESTING-CROSS-PLATFORM.md)** - Test suite documentation
4. **[AGENT-SPLIT-PATTERN.md](AGENT-SPLIT-PATTERN.md)** - Size optimization pattern
5. **[README.md](../README.md)** - Project overview and quick start

### Run Tests

Validate your setup with tests:

```bash
# Full test suite
npm test

# Individual test stages
npm run test:generation     # Check generation works
npm run test:installation   # Check installation works
npm run test:invocation     # Check CLI invocation works (requires CLIs)
```

### Enable Debug Mode

Get detailed logging:

```bash
# Enable debug output
DEBUG=gsd:* node bin/install.js --all

# Or for specific module
DEBUG=gsd:generator node bin/install.js --all
DEBUG=gsd:tool-mapper node bin/install.js --all
```

**Debug output includes:**
- Template rendering details
- Platform transformation steps
- Tool mapping decisions
- Validation results
- File write operations

### Report Issues

If you've exhausted troubleshooting steps, file an issue on GitHub:

**Include in issue:**
1. **Error messages** - Full output, not just summary
2. **Steps to reproduce** - Commands run, in order
3. **Expected vs actual behavior** - What should happen vs what happened
4. **Environment:**
   ```bash
   node --version
   npm --version
   claude --version  # If applicable
   gh copilot --version  # If applicable
   ```
5. **Relevant files** - Spec content, generated output, test results

**Example issue template:**
```markdown
## Description
Generation fails for my custom agent

## Error Message
\`\`\`
Error: Unclosed tag at line 42
\`\`\`

## Steps to Reproduce
1. Created specs/agents/my-agent.md
2. Ran npm run test:generation
3. Error occurred

## Expected Behavior
Agent should generate for both platforms

## Actual Behavior
Generation fails with unclosed tag error

## Environment
- Node: v18.17.0
- npm: 9.6.7
- OS: macOS 13.4

## Spec Content
\`\`\`yaml
---
name: my-agent
...
\`\`\`
```

### Community Support

Get help from the community:

- **GitHub Discussions** - Ask questions, share solutions
- **GitHub Issues** - Report bugs, request features
- **Pull Requests** - Contribute fixes and improvements

### Common Commands Reference

Quick reference for troubleshooting:

```bash
# Installation
npm install                    # Install dependencies
node bin/install.js --all      # Install all agents
node bin/install.js --local    # Claude only
node bin/install.js --copilot  # Copilot only

# Testing
npm test                       # All tests
npm run test:generation        # Generation tests
npm run test:installation      # Installation tests
npm run test:invocation        # Invocation tests

# Validation
npm run test:generation        # Validate generation
cat agents/my-agent.md         # View Claude agent
cat .github/copilot/agents/my-agent.md  # View Copilot agent

# Cleanup
rm -rf agents/*                # Remove Claude agents
rm -rf .github/copilot/agents/* # Remove Copilot agents
rm -rf node_modules            # Clean dependencies

# Debugging
DEBUG=gsd:* node bin/install.js --all  # Debug mode
node --version                 # Check Node version
which claude                   # Find Claude CLI
which gh                       # Find GitHub CLI
```

---

*Troubleshooting guide last updated: 2026-01-22*
*Still stuck? Open a GitHub Issue or Discussion.*
