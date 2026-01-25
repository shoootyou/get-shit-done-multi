---
subject: function
name: detectIOSideEffects
source_file: side-effects.js
source_location: bin/lib/analysis/side-effects.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.854Z'
complexity:
  cyclomatic: 24
  nesting_depth: 4
  parameter_count: 1
depends_on:
  - push
  - includes
  - isArray
  - forEach
  - visit
called_by: []
confidence: 70%
---
# Function: detectIOSideEffects

## Purpose

To be documented


## Signature

```javascript
function detectIOSideEffects(functionNode)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `push()`
- `includes()`
- `isArray()`
- `forEach()`
- `visit()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 24
- Nesting depth: 4
- Parameter count: 1
- Classification: Complex


## Analysis Confidence

**Confidence:** 70%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Complexity 24 but no documentation
- ❓ Dependencies used but purpose unclear

