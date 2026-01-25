---
subject: function
name: getConfigPaths
source_file: paths.js
source_location: bin/lib/configuration/paths.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.857Z'
complexity:
  cyclomatic: 7
  nesting_depth: 1
  parameter_count: 3
depends_on:
  - homedir
  - cwd
  - join
  - resolve
called_by:
  - main
  - validateAndPrepareInstall
  - oldInstallationLogic
  - install
  - installCodex
  - detectInstalledCLIs
  - getTargetDirs
  - getTargetDirs
  - getTargetDirs
  - buildContext
confidence: 85%
---
# Function: getConfigPaths

## Purpose

To be documented


## Signature

```javascript
function getConfigPaths(platform, scope, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `homedir()`
- `cwd()`
- `join()`
- `resolve()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 1
- Parameter count: 3
- Classification: Moderate


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
name: expandTilde
source_file: paths.js
source_location: bin/lib/configuration/paths.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.858Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - startsWith
  - join
  - homedir
  - slice
called_by:
  - oldInstallationLogic
  - promptLocation
confidence: 85%
---
# Function: expandTilde

## Purpose

To be documented


## Signature

```javascript
function expandTilde(filePath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `startsWith()`
- `join()`
- `homedir()`
- `slice()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 1
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
name: ensureDirExists
source_file: paths.js
source_location: bin/lib/configuration/paths.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.858Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - mkdirSync
  - error
called_by: []
confidence: 95%
---
# Function: ensureDirExists

## Purpose

To be documented


## Signature

```javascript
function ensureDirExists(dirPath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `mkdirSync()`
- `error()`


## Side Effects

- **file_system**: fs.mkdirSync (line 91)
- **console**: console.error (line 94)


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 1
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: ensureInstallDir
source_file: paths.js
source_location: bin/lib/configuration/paths.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.858Z'
complexity:
  cyclomatic: 5
  nesting_depth: 3
  parameter_count: 2
depends_on:
  - ensureDir
called_by:
  - main
  - validateAndPrepareInstall
confidence: 95%
---
# Function: ensureInstallDir

## Purpose

To be documented


## Signature

```javascript
function ensureInstallDir(targetPath, scope)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `ensureDir()`


## Side Effects

- **file_system**: fs.ensureDir (line 107)


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 3
- Parameter count: 2
- Classification: Moderate


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

