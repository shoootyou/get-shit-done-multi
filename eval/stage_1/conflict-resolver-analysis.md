---
subject: function
name: isGSDContent
source_file: conflict-resolver.js
source_location: bin/lib/configuration/conflict-resolver.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.854Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - relative
  - split
  - includes
called_by: []
confidence: 95%
---
# Function: isGSDContent

## Purpose

To be documented


## Signature

```javascript
function isGSDContent(filePath, installRoot)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `relative()`
- `split()`
- `includes()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
- Parameter count: 2
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
name: analyzeInstallationConflicts
source_file: conflict-resolver.js
source_location: bin/lib/configuration/conflict-resolver.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.854Z'
complexity:
  cyclomatic: 9
  nesting_depth: 5
  parameter_count: 1
depends_on:
  - pathExists
  - readdir
  - join
  - isDirectory
  - includes
  - collectFiles
  - push
called_by:
  - main
  - validateAndPrepareInstall
confidence: 85%
---
# Function: analyzeInstallationConflicts

## Purpose

To be documented


## Signature

```javascript
function analyzeInstallationConflicts(targetPath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `pathExists()`
- `readdir()`
- `join()`
- `isDirectory()`
- `includes()`
- `collectFiles()`
- `push()`


## Side Effects

- **file_system**: fse.pathExists (line 38)
- **file_system**: fse.readdir (line 51)
- **file_system**: fse.readdir (line 60)


## Complexity Analysis

- Cyclomatic complexity: 9
- Nesting depth: 5
- Parameter count: 1
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
name: collectFiles
source_file: conflict-resolver.js
source_location: bin/lib/configuration/conflict-resolver.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.855Z'
complexity:
  cyclomatic: 3
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - readdir
  - join
  - isDirectory
  - collectFiles
  - push
called_by:
  - analyzeInstallationConflicts
  - collectFiles
confidence: 85%
---
# Function: collectFiles

## Purpose

To be documented


## Signature

```javascript
const collectFiles(dirPath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `readdir()`
- `join()`
- `isDirectory()`
- `collectFiles()`
- `push()`


## Side Effects

- **file_system**: fse.readdir (line 60)


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 2
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
name: cleanupGSDContent
source_file: conflict-resolver.js
source_location: bin/lib/configuration/conflict-resolver.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.855Z'
complexity:
  cyclomatic: 6
  nesting_depth: 3
  parameter_count: 1
depends_on:
  - includes
  - endsWith
  - split
  - add
  - remove
called_by:
  - main
  - validateAndPrepareInstall
confidence: 85%
---
# Function: cleanupGSDContent

## Purpose

To be documented


## Signature

```javascript
function cleanupGSDContent(gsdFiles)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `includes()`
- `endsWith()`
- `split()`
- `add()`
- `remove()`


## Side Effects

- **file_system**: fse.remove (line 120)


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 3
- Parameter count: 1
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
name: detectOldClaudePath
source_file: conflict-resolver.js
source_location: bin/lib/configuration/conflict-resolver.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.855Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 0
depends_on:
  - join
  - homedir
  - pathExists
called_by:
  - main
confidence: 95%
---
# Function: detectOldClaudePath

## Purpose

To be documented


## Signature

```javascript
function detectOldClaudePath()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `homedir()`
- `pathExists()`


## Side Effects

- **file_system**: fse.pathExists (line 133)


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 1
- Parameter count: 0
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

