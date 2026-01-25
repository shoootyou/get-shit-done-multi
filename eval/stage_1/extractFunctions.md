---
subject: function
name: extractFunctions
source_file: ast-parser.js
source_location: bin/lib/analysis/ast-parser.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.848Z'
complexity:
  cyclomatic: 18
  nesting_depth: 4
  parameter_count: 1
depends_on:
  - parseFile
  - push
  - isArray
  - forEach
  - visit
called_by: []
confidence: 70%
---
# Function: extractFunctions

## Purpose

To be documented


## Signature

```javascript
function extractFunctions(filePath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `parseFile()`
- `push()`
- `isArray()`
- `forEach()`
- `visit()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 18
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
- ❓ Complexity 18 but no documentation
- ❓ Dependencies used but purpose unclear

