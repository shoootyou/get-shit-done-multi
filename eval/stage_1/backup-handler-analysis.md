---
subject: function
name: createBackup
source_file: backup-handler.js
source_location: bin/lib/installation/migration/backup-handler.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.861Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - split
  - toISOString
  - join
  - cwd
  - pathExists
  - remove
  - copy
  - countFiles
called_by:
  - runMigration
confidence: 85%
---
# Function: createBackup

## Purpose

To be documented


## Signature

```javascript
function createBackup(sourcePath, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `split()`
- `toISOString()`
- `join()`
- `cwd()`
- `pathExists()`
- `remove()`
- `copy()`
- `countFiles()`


## Side Effects

- **file_system**: fs.pathExists (line 18)
- **file_system**: fs.remove (line 20)
- **file_system**: fs.copy (line 24)


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 1
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
name: countFiles
source_file: backup-handler.js
source_location: bin/lib/installation/migration/backup-handler.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.861Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - readdir
  - filter
  - statSync
  - join
  - isFile
called_by:
  - createBackup
confidence: 85%
---
# Function: countFiles

## Purpose

To be documented


## Signature

```javascript
function countFiles(dir)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `readdir()`
- `filter()`
- `statSync()`
- `join()`
- `isFile()`


## Side Effects

- **file_system**: fs.readdir (line 45)
- **file_system**: fs.statSync (line 47)


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
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
name: addToGitignore
source_file: backup-handler.js
source_location: bin/lib/installation/migration/backup-handler.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.862Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 0
depends_on:
  - join
  - cwd
  - catch
  - readFile
  - includes
  - writeFile
called_by:
  - runMigration
confidence: 85%
---
# Function: addToGitignore

## Purpose

To be documented


## Signature

```javascript
function addToGitignore()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `cwd()`
- `catch()`
- `readFile()`
- `includes()`
- `writeFile()`


## Side Effects

- **file_system**: fs.readFile (line 54)
- **file_system**: fs.writeFile (line 58)


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 1
- Parameter count: 0
- Classification: Simple


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear

