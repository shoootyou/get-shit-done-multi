---
subject: function
name: copyCopilotAgents
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.845Z'
complexity:
  cyclomatic: 20
  nesting_depth: 4
  parameter_count: 3
depends_on:
  - join
  - existsSync
  - mkdirSync
  - readdirSync
  - startsWith
  - endsWith
  - unlinkSync
  - generateAgentsFromSpecs
  - replace
  - renameSync
  - isFile
  - readFileSync
  - parseFrontMatter
  - getFrontMatterValue
  - trimStart
  - replaceClaudePaths
  - yamlEscape
  - writeFileSync
called_by:
  - oldInstallationLogic
  - installCopilot
confidence: 70%
---
# Function: copyCopilotAgents

## Purpose

To be documented


## Signature

```javascript
function copyCopilotAgents(srcDir, destDir, pathPrefix)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `existsSync()`
- `mkdirSync()`
- `readdirSync()`
- `startsWith()`
- `endsWith()`
- `unlinkSync()`
- `generateAgentsFromSpecs()`
- `replace()`
- `renameSync()`
- `isFile()`
- `readFileSync()`
- `parseFrontMatter()`
- `getFrontMatterValue()`
- `trimStart()`
- `replaceClaudePaths()`
- `yamlEscape()`
- `writeFileSync()`


## Side Effects

- **file_system**: fs.existsSync (line 730)
- **file_system**: fs.mkdirSync (line 732)
- **file_system**: fs.readdirSync (line 733)
- **file_system**: fs.unlinkSync (line 735)
- **file_system**: fs.readdirSync (line 744)
- **file_system**: fs.renameSync (line 749)
- **file_system**: fs.existsSync (line 758)
- **file_system**: fs.mkdirSync (line 762)
- **file_system**: fs.readdirSync (line 765)
- **file_system**: fs.unlinkSync (line 767)
- **file_system**: fs.readdirSync (line 771)
- **file_system**: fs.readFileSync (line 777)
- **file_system**: fs.writeFileSync (line 794)


## Complexity Analysis

- Cyclomatic complexity: 20
- Nesting depth: 4
- Parameter count: 3
- Classification: Complex


## Analysis Confidence

**Confidence:** 70%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Complexity 20 but no documentation
- ❓ Dependencies used but purpose unclear

