---
subject: function
name: detectOldStructure
source_file: detect-old-structure.js
source_location: bin/lib/installation/migration/detect-old-structure.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.862Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - pathExists
  - catch
  - readdir
called_by:
  - detectAllPlatforms
confidence: 95%
---
# Function: detectOldStructure

## Purpose

To be documented


## Signature

```javascript
function detectOldStructure(platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `pathExists()`
- `catch()`
- `readdir()`


## Side Effects

- **file_system**: fs.pathExists (line 22)
- **file_system**: fs.readdir (line 26)


## Complexity Analysis

- Cyclomatic complexity: 3
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
name: detectAllPlatforms
source_file: detect-old-structure.js
source_location: bin/lib/installation/migration/detect-old-structure.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.862Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 0
depends_on:
  - all
  - map
  - detectOldStructure
  - filter
called_by:
  - runMigration
confidence: 85%
---
# Function: detectAllPlatforms

## Purpose

To be documented


## Signature

```javascript
function detectAllPlatforms()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `all()`
- `map()`
- `detectOldStructure()`
- `filter()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
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

