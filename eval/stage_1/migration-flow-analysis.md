---
subject: function
name: runMigration
source_file: migration-flow.js
source_location: bin/lib/installation/migration/migration-flow.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.863Z'
complexity:
  cyclomatic: 6
  nesting_depth: 1
  parameter_count: 0
depends_on:
  - log
  - detectAllPlatforms
  - confirmMigration
  - createBackup
  - push
  - replace
  - cwd
  - addToGitignore
  - createProgressBar
  - start
  - remove
  - update
  - stop
  - map
  - reduce
called_by:
  - main
  - oldInstallationLogic
confidence: 75%
---
# Function: runMigration

## Purpose

To be documented


## Signature

```javascript
function runMigration()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `log()`
- `detectAllPlatforms()`
- `confirmMigration()`
- `createBackup()`
- `push()`
- `replace()`
- `cwd()`
- `addToGitignore()`
- `createProgressBar()`
- `start()`
- `remove()`
- `update()`
- `stop()`
- `map()`
- `reduce()`


## Side Effects

- **console**: console.log (line 9)
- **console**: console.log (line 15)
- **console**: console.log (line 22)
- **console**: console.log (line 27)
- **console**: console.log (line 35)
- **console**: console.log (line 41)
- **console**: console.log (line 45)
- **file_system**: fs.remove (line 50)
- **console**: console.log (line 56)
- **console**: console.log (line 57)


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 1
- Parameter count: 0
- Classification: Moderate


## Analysis Confidence

**Confidence:** 75%

**Deductions:**

- **-10%**: Unclear or generic function name
- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Name "runMigration" is generic or unclear
- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear

