---
subject: function
name: showInteractiveMenu
source_file: interactive-menu.js
source_location: bin/lib/configuration/interactive-menu.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.856Z'
complexity:
  cyclomatic: 8
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - push
  - prompts
  - log
  - exit
  - includes
called_by:
  - main
confidence: 85%
---
# Function: showInteractiveMenu

## Purpose

To be documented


## Signature

```javascript
function showInteractiveMenu(param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `push()`
- `prompts()`
- `log()`
- `exit()`
- `includes()`


## Side Effects

- **console**: console.log (line 62)


## Complexity Analysis

- Cyclomatic complexity: 8
- Nesting depth: 1
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

