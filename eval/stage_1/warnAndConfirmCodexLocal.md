---
subject: function
name: warnAndConfirmCodexLocal
source_file: codex-warning.js
source_location: bin/lib/installation/codex-warning.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.860Z'
complexity:
  cyclomatic: 10
  nesting_depth: 3
  parameter_count: 2
depends_on:
  - includes
  - getBoxen
  - log
  - forEach
  - toUpperCase
  - charAt
  - slice
  - prompts
called_by:
  - main
confidence: 70%
---
# Function: warnAndConfirmCodexLocal

## Purpose

To be documented


## Signature

```javascript
function warnAndConfirmCodexLocal(platforms, scope)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `includes()`
- `getBoxen()`
- `log()`
- `forEach()`
- `toUpperCase()`
- `charAt()`
- `slice()`
- `prompts()`


## Side Effects

- **console**: console.log (line 49)
- **console**: console.log (line 52)
- **console**: console.log (line 72)
- **console**: console.log (line 75)
- **process_io**: process.stdout (line 78)
- **console**: console.log (line 79)
- **console**: console.log (line 93)


## Complexity Analysis

- Cyclomatic complexity: 10
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
- ❓ Complexity 10 but no documentation
- ❓ Dependencies used but purpose unclear

