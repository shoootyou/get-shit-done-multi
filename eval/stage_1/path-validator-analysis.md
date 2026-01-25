---
subject: function
name: isWSL
source_file: path-validator.js
source_location: bin/lib/configuration/path-validator.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.857Z'
complexity:
  cyclomatic: 6
  nesting_depth: 2
  parameter_count: 0
depends_on:
  - toLowerCase
  - readFileSync
  - includes
  - statSync
called_by:
  - getEffectivePlatform
confidence: 85%
---
# Function: isWSL

## Purpose

To be documented


## Signature

```javascript
function isWSL()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `toLowerCase()`
- `readFileSync()`
- `includes()`
- `statSync()`


## Side Effects

- **file_system**: fs.readFileSync (line 17)
- **file_system**: fs.statSync (line 27)


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 2
- Parameter count: 0
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
name: getEffectivePlatform
source_file: path-validator.js
source_location: bin/lib/configuration/path-validator.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.857Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 0
depends_on:
  - isWSL
called_by:
  - validatePath
confidence: 95%
---
# Function: getEffectivePlatform

## Purpose

To be documented


## Signature

```javascript
function getEffectivePlatform()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `isWSL()`


## Side Effects

None detected


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

