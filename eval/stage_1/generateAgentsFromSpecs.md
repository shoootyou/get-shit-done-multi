---
subject: function
name: generateAgentsFromSpecs
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.841Z'
complexity:
  cyclomatic: 11
  nesting_depth: 5
  parameter_count: 3
depends_on:
  - mkdirSync
  - filter
  - readdirSync
  - endsWith
  - join
  - generateAgent
  - writeFileSync
  - forEach
  - log
  - map
  - push
  - error
called_by:
  - oldInstallationLogic
  - copyCopilotAgents
  - install
  - installCodex
confidence: 70%
---
# Function: generateAgentsFromSpecs

## Purpose

To be documented


## Signature

```javascript
function generateAgentsFromSpecs(specsDir, outputDir, platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `mkdirSync()`
- `filter()`
- `readdirSync()`
- `endsWith()`
- `join()`
- `generateAgent()`
- `writeFileSync()`
- `forEach()`
- `log()`
- `map()`
- `push()`
- `error()`


## Side Effects

- **file_system**: fs.mkdirSync (line 474)
- **file_system**: fs.readdirSync (line 477)
- **file_system**: fs.writeFileSync (line 490)
- **console**: console.log (line 496)
- **console**: console.error (line 506)
- **console**: console.error (line 511)
- **console**: console.error (line 516)


## Complexity Analysis

- Cyclomatic complexity: 11
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
- ❓ Complexity 11 but no documentation
- ❓ Dependencies used but purpose unclear

