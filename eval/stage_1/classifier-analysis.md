---
subject: function
name: classifyFunction
source_file: classifier.js
source_location: bin/lib/analysis/classifier.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.848Z'
complexity:
  cyclomatic: 3
  nesting_depth: 2
  parameter_count: 1
depends_on: []
called_by: []
confidence: 95%
---
# Function: classifyFunction

## Purpose

To be documented


## Signature

```javascript
function classifyFunction(functionInfo)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

None detected


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 2
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
name: isHelperFunction
source_file: classifier.js
source_location: bin/lib/analysis/classifier.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.849Z'
complexity:
  cyclomatic: 6
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - push
  - some
  - test
called_by: []
confidence: 95%
---
# Function: isHelperFunction

## Purpose

To be documented


## Signature

```javascript
function isHelperFunction(functionInfo, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `push()`
- `some()`
- `test()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 2
- Parameter count: 2
- Classification: Moderate


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

