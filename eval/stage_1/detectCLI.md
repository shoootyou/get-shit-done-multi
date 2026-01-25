---
subject: function
name: detectCLI
source_file: detect.js
source_location: bin/lib/installation/cli-detection/detect.js
function_count_in_file: 2
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.859Z'
complexity:
  cyclomatic: 16
  nesting_depth: 2
  parameter_count: 0
depends_on:
  - detectInstalledCLIs
  - cwd
  - includes
  - filter
  - values
called_by:
  - invokeAgent
confidence: 70%
---
# Function: detectCLI

## Purpose

To be documented


## Signature

```javascript
function detectCLI()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `detectInstalledCLIs()`
- `cwd()`
- `includes()`
- `filter()`
- `values()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 16
- Nesting depth: 2
- Parameter count: 0
- Classification: Complex


## Analysis Confidence

**Confidence:** 70%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Complexity 16 but no documentation
- ❓ Dependencies used but purpose unclear

