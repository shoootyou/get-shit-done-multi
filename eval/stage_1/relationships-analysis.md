---
subject: function
name: buildCalledByMap
source_file: relationships.js
source_location: bin/lib/analysis/relationships.js
function_count_in_file: 7
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.853Z'
complexity:
  cyclomatic: 3
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - forEach
  - set
  - has
  - push
  - get
called_by: []
confidence: 85%
---
# Function: buildCalledByMap

## Purpose

To be documented


## Signature

```javascript
function buildCalledByMap(allFunctions)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `forEach()`
- `set()`
- `has()`
- `push()`
- `get()`


## Side Effects

None detected


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

