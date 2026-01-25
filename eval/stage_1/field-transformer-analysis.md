---
subject: function
name: validateFieldSupport
source_file: field-transformer.js
source_location: bin/lib/templating/field-transformer.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.891Z'
complexity:
  cyclomatic: 5
  nesting_depth: 1
  parameter_count: 2
depends_on: []
called_by: []
confidence: 95%
---
# Function: validateFieldSupport

## Purpose

To be documented


## Signature

```javascript
function validateFieldSupport(fieldName, platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

None detected


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 1
- Parameter count: 2
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
name: addPlatformMetadata
source_file: field-transformer.js
source_location: bin/lib/templating/field-transformer.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.891Z'
complexity:
  cyclomatic: 7
  nesting_depth: 1
  parameter_count: 3
depends_on:
  - split
  - toISOString
called_by:
  - generateAgent
  - generateFromSpec
confidence: 95%
---
# Function: addPlatformMetadata

## Purpose

To be documented


## Signature

```javascript
function addPlatformMetadata(frontmatter, platform, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `split()`
- `toISOString()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 1
- Parameter count: 3
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
name: getFieldRules
source_file: field-transformer.js
source_location: bin/lib/templating/field-transformer.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.891Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 0
depends_on:
  - parse
  - stringify
called_by: []
confidence: 95%
---
# Function: getFieldRules

## Purpose

To be documented


## Signature

```javascript
function getFieldRules()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `parse()`
- `stringify()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
- Parameter count: 0
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
name: supportsField
source_file: field-transformer.js
source_location: bin/lib/templating/field-transformer.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.892Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 2
depends_on: []
called_by:
  - getFieldWarning
confidence: 95%
---
# Function: supportsField

## Purpose

To be documented


## Signature

```javascript
function supportsField(fieldName, platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

None detected


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

