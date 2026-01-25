---
subject: function
name: generateSkillsFromSpecs
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.841Z'
complexity:
  cyclomatic: 12
  nesting_depth: 5
  parameter_count: 3
depends_on:
  - mkdirSync
  - filter
  - readdirSync
  - join
  - isDirectory
  - statSync
  - startsWith
  - existsSync
  - log
  - generateAgent
  - writeFileSync
  - forEach
  - map
  - push
  - error
called_by:
  - oldInstallationLogic
  - install
  - installCopilot
  - installCodex
confidence: 70%
---
# Function: generateSkillsFromSpecs

## Purpose

To be documented


## Signature

```javascript
function generateSkillsFromSpecs(specsDir, outputDir, platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `mkdirSync()`
- `filter()`
- `readdirSync()`
- `join()`
- `isDirectory()`
- `statSync()`
- `startsWith()`
- `existsSync()`
- `log()`
- `generateAgent()`
- `writeFileSync()`
- `forEach()`
- `map()`
- `push()`
- `error()`


## Side Effects

- **file_system**: fs.mkdirSync (line 540)
- **file_system**: fs.readdirSync (line 543)
- **file_system**: fs.statSync (line 546)
- **file_system**: fs.existsSync (line 552)
- **console**: console.log (line 553)
- **file_system**: fs.mkdirSync (line 564)
- **file_system**: fs.writeFileSync (line 566)
- **console**: console.log (line 572)
- **console**: console.error (line 581)
- **console**: console.error (line 586)
- **console**: console.error (line 591)


## Complexity Analysis

- Cyclomatic complexity: 12
- Nesting depth: 5
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
- ❓ Complexity 12 but no documentation
- ❓ Dependencies used but purpose unclear

