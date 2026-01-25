---
subject: function
name: parseStructuredReturn
source_file: structured-return-parser.js
source_location: bin/lib/orchestration/structured-return-parser.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.873Z'
complexity:
  cyclomatic: 7
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - match
  - substring
  - search
  - trim
called_by:
  - testStructuredReturn
  - hasStructuredReturn
confidence: 85%
---
# Function: parseStructuredReturn

## Purpose

To be documented


## Signature

```javascript
function parseStructuredReturn(markdown)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `match()`
- `substring()`
- `search()`
- `trim()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 2
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
name: hasStructuredReturn
source_file: structured-return-parser.js
source_location: bin/lib/orchestration/structured-return-parser.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.873Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - parseStructuredReturn
called_by: []
confidence: 95%
---
# Function: hasStructuredReturn

## Purpose

To be documented


## Signature

```javascript
function hasStructuredReturn(markdown)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `parseStructuredReturn()`


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
name: extractAllStructuredReturns
source_file: structured-return-parser.js
source_location: bin/lib/orchestration/structured-return-parser.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.873Z'
complexity:
  cyclomatic: 6
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - exec
  - substring
  - search
  - trim
  - find
  - test
  - push
called_by: []
confidence: 85%
---
# Function: extractAllStructuredReturns

## Purpose

To be documented


## Signature

```javascript
function extractAllStructuredReturns(markdown)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `exec()`
- `substring()`
- `search()`
- `trim()`
- `find()`
- `test()`
- `push()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 2
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

