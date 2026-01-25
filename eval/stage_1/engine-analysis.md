---
subject: function
name: validate
source_file: engine.js
source_location: bin/lib/templating/engine.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.890Z'
complexity:
  cyclomatic: 8
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - load
called_by:
  - renderAndValidate
  - generateAgent
  - generateFromSpec
confidence: 95%
---
# Function: validate

## Purpose

To be documented


## Signature

```javascript
function validate(yamlString)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `load()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 8
- Nesting depth: 2
- Parameter count: 1
- Classification: Moderate


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: renderAndValidate
source_file: engine.js
source_location: bin/lib/templating/engine.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.891Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - render
  - validate
called_by: []
confidence: 95%
---
# Function: renderAndValidate

## Purpose

To be documented


## Signature

```javascript
function renderAndValidate(template, context)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `render()`
- `validate()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 1
- Parameter count: 2
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

