---
subject: function
name: mapTools
source_file: tool-mapper.js
source_location: bin/lib/templating/tool-mapper.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.895Z'
complexity:
  cyclomatic: 12
  nesting_depth: 3
  parameter_count: 2
depends_on:
  - isArray
  - filter
  - map
  - startsWith
  - includes
  - warn
called_by:
  - generateAgent
  - generateFromSpec
confidence: 70%
---
# Function: mapTools

## Purpose

To be documented


## Signature

```javascript
function mapTools(toolArray, platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `isArray()`
- `filter()`
- `map()`
- `startsWith()`
- `includes()`
- `warn()`


## Side Effects

- **console**: console.warn (line 244)


## Complexity Analysis

- Cyclomatic complexity: 12
- Nesting depth: 3
- Parameter count: 2
- Classification: Complex


## Analysis Confidence

**Confidence:** 70%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Complexity 12 but no documentation
- ❓ Dependencies used but purpose unclear

