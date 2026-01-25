---
subject: function
name: replaceClaudePaths
source_file: path-rewriter.js
source_location: bin/lib/platforms/shared/path-rewriter.js
function_count_in_file: 1
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.877Z'
complexity:
  cyclomatic: 4
  nesting_depth: 2
  parameter_count: 3
depends_on:
  - replace
  - endsWith
  - slice
  - includes
called_by:
  - oldInstallationLogic
  - copyCopilotAgents
  - convertContent
  - convertContent
confidence: 85%
---
# Function: replaceClaudePaths

## Purpose

To be documented


## Signature

```javascript
function replaceClaudePaths(content, targetPrefix, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `replace()`
- `endsWith()`
- `slice()`
- `includes()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 2
- Parameter count: 3
- Classification: Simple


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear

