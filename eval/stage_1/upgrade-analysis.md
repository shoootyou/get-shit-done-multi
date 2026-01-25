---
subject: function
name: preserveUserData
source_file: upgrade.js
source_location: bin/lib/installation/upgrade.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.864Z'
complexity:
  cyclomatic: 4
  nesting_depth: 3
  parameter_count: 1
depends_on:
  - now
  - join
  - existsSync
  - renameSync
  - error
called_by:
  - oldInstallationLogic
  - install
  - installCopilot
  - installCodex
confidence: 85%
---
# Function: preserveUserData

## Purpose

To be documented


## Signature

```javascript
function preserveUserData(installDir)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `now()`
- `join()`
- `existsSync()`
- `renameSync()`
- `error()`


## Side Effects

- **file_system**: fs.existsSync (line 24)
- **file_system**: fs.renameSync (line 29)
- **console**: console.error (line 32)


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 3
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear


---

---
subject: function
name: restoreUserData
source_file: upgrade.js
source_location: bin/lib/installation/upgrade.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.864Z'
complexity:
  cyclomatic: 3
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - entries
  - join
  - renameSync
  - error
called_by:
  - oldInstallationLogic
  - install
  - installCopilot
  - installCodex
confidence: 85%
---
# Function: restoreUserData

## Purpose

To be documented


## Signature

```javascript
function restoreUserData(installDir, backups)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `entries()`
- `join()`
- `renameSync()`
- `error()`


## Side Effects

- **file_system**: fs.renameSync (line 51)
- **console**: console.error (line 54)
- **console**: console.error (line 55)


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 2
- Parameter count: 2
- Classification: Simple


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear


---

---
subject: function
name: cleanOrphanedFiles
source_file: upgrade.js
source_location: bin/lib/installation/upgrade.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.864Z'
complexity:
  cyclomatic: 4
  nesting_depth: 3
  parameter_count: 1
depends_on:
  - join
  - existsSync
  - rmSync
  - log
  - error
called_by: []
confidence: 85%
---
# Function: cleanOrphanedFiles

## Purpose

To be documented


## Signature

```javascript
function cleanOrphanedFiles(installDir)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `existsSync()`
- `rmSync()`
- `log()`
- `error()`


## Side Effects

- **file_system**: fs.existsSync (line 72)
- **file_system**: fs.rmSync (line 74)
- **console**: console.log (line 75)
- **console**: console.error (line 77)


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 3
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear

