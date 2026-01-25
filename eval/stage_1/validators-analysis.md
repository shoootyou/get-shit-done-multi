---
subject: function
name: validateSpec
source_file: validators.js
source_location: bin/lib/templating/validators.js
function_count_in_file: 16
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.897Z'
complexity:
  cyclomatic: 4
  nesting_depth: 3
  parameter_count: 2
depends_on:
  - validateClaudeSpec
  - validateCopilotSpec
  - validateCodexSpec
called_by:
  - generateAgent
  - generateFromSpec
confidence: 95%
---
# Function: validateSpec

## Purpose

To be documented


## Signature

```javascript
function validateSpec(frontmatter, platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `validateClaudeSpec()`
- `validateCopilotSpec()`
- `validateCodexSpec()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 3
- Parameter count: 2
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: checkPromptLength
source_file: validators.js
source_location: bin/lib/templating/validators.js
function_count_in_file: 16
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.897Z'
complexity:
  cyclomatic: 5
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - push
  - toFixed
called_by:
  - generateAgent
  - generateFromSpec
confidence: 95%
---
# Function: checkPromptLength

## Purpose

To be documented


## Signature

```javascript
function checkPromptLength(promptText, platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `push()`
- `toFixed()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 2
- Parameter count: 2
- Classification: Moderate


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

