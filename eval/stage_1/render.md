---
subject: function
name: render
source_file: engine.js
source_location: bin/lib/templating/engine.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.890Z'
complexity:
  cyclomatic: 14
  nesting_depth: 2
  parameter_count: 3
depends_on:
  - replace
  - toString
  - stringify
  - String
called_by:
  - oldInstallationLogic
  - copyWithPathReplacement
  - renderAndValidate
  - generateAgent
  - generateFromSpec
  - generateFromTemplate
confidence: 70%
---
# Function: render

## Purpose

To be documented


## Signature

```javascript
function render(template, context, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `replace()`
- `toString()`
- `stringify()`
- `String()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 14
- Nesting depth: 2
- Parameter count: 3
- Classification: Complex


## Analysis Confidence

**Confidence:** 70%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Complexity 14 but no documentation
- ❓ Dependencies used but purpose unclear

