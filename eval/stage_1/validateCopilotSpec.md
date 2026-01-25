---
subject: function
name: validateCopilotSpec
source_file: validators.js
source_location: bin/lib/templating/validators.js
function_count_in_file: 16
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.896Z'
complexity:
  cyclomatic: 26
  nesting_depth: 4
  parameter_count: 1
depends_on:
  - trim
  - push
  - isArray
  - includes
  - forEach
  - keys
called_by:
  - validateSpec
confidence: 70%
---
# Function: validateCopilotSpec

## Purpose

To be documented


## Signature

```javascript
function validateCopilotSpec(frontmatter)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `trim()`
- `push()`
- `isArray()`
- `includes()`
- `forEach()`
- `keys()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 26
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
- ❓ Complexity 26 but no documentation
- ❓ Dependencies used but purpose unclear

