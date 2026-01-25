---
subject: function
name: extractDependencies
source_file: relationships.js
source_location: bin/lib/analysis/relationships.js
function_count_in_file: 7
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.853Z'
complexity:
  cyclomatic: 13
  nesting_depth: 4
  parameter_count: 1
depends_on:
  - push
  - isArray
  - forEach
  - visit
called_by: []
confidence: 70%
---
# Function: extractDependencies

## Purpose

To be documented


## Signature

```javascript
function extractDependencies(functionNode)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `push()`
- `isArray()`
- `forEach()`
- `visit()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 13
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
- ❓ Complexity 13 but no documentation
- ❓ Dependencies used but purpose unclear

