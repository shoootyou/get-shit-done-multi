---
subject: function
name: detectInstalledCLIs
source_file: detect.js
source_location: bin/lib/installation/cli-detection/detect.js
function_count_in_file: 2
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.859Z'
complexity:
  cyclomatic: 3
  nesting_depth: 2
  parameter_count: 0
depends_on:
  - getConfigPaths
  - existsSync
called_by:
  - oldInstallationLogic
  - installAll
  - detectCLI
confidence: 95%
---
# Function: detectInstalledCLIs

## Purpose

To be documented


## Signature

```javascript
function detectInstalledCLIs()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `getConfigPaths()`
- `existsSync()`


## Side Effects

- **file_system**: fs.existsSync (line 21)


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 2
- Parameter count: 0
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

