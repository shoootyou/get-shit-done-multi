---
subject: function
name: calculateConfidence
source_file: confidence.js
source_location: bin/lib/analysis/confidence.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.850Z'
complexity:
  cyclomatic: 6
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - hasDynamicRequires
  - push
  - hasUnclearNaming
  - hasJSDoc
  - isComplexWithoutDocs
  - hasUnclearDependencies
  - max
called_by: []
confidence: 85%
---
# Function: calculateConfidence

## Purpose

To be documented


## Signature

```javascript
function calculateConfidence(functionInfo, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `hasDynamicRequires()`
- `push()`
- `hasUnclearNaming()`
- `hasJSDoc()`
- `isComplexWithoutDocs()`
- `hasUnclearDependencies()`
- `max()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 1
- Parameter count: 2
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
name: hasDynamicRequires
source_file: confidence.js
source_location: bin/lib/analysis/confidence.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.850Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - some
  - includes
  - match
called_by:
  - calculateConfidence
confidence: 95%
---
# Function: hasDynamicRequires

## Purpose

To be documented


## Signature

```javascript
function hasDynamicRequires(functionInfo)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `some()`
- `includes()`
- `match()`


## Side Effects

None detected


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
name: hasUnclearNaming
source_file: confidence.js
source_location: bin/lib/analysis/confidence.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.851Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - some
  - test
called_by:
  - calculateConfidence
confidence: 95%
---
# Function: hasUnclearNaming

## Purpose

To be documented


## Signature

```javascript
function hasUnclearNaming(name)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `some()`
- `test()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
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
name: hasJSDoc
source_file: confidence.js
source_location: bin/lib/analysis/confidence.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.851Z'
complexity:
  cyclomatic: 4
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - some
  - startsWith
  - trim
called_by:
  - calculateConfidence
  - isComplexWithoutDocs
confidence: 95%
---
# Function: hasJSDoc

## Purpose

To be documented


## Signature

```javascript
function hasJSDoc(functionInfo, ast)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `some()`
- `startsWith()`
- `trim()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 1
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
name: isComplexWithoutDocs
source_file: confidence.js
source_location: bin/lib/analysis/confidence.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.851Z'
complexity:
  cyclomatic: 3
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - hasJSDoc
called_by:
  - calculateConfidence
confidence: 95%
---
# Function: isComplexWithoutDocs

## Purpose

To be documented


## Signature

```javascript
function isComplexWithoutDocs(functionInfo, ast)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `hasJSDoc()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 3
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
name: hasUnclearDependencies
source_file: confidence.js
source_location: bin/lib/analysis/confidence.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.852Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 1
depends_on: []
called_by:
  - calculateConfidence
confidence: 95%
---
# Function: hasUnclearDependencies

## Purpose

To be documented


## Signature

```javascript
function hasUnclearDependencies(functionInfo)
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
- Nesting depth: 1
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

