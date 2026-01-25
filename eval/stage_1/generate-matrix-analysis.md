---
subject: function
name: transformCapabilityToJSON
source_file: generate-matrix.js
source_location: bin/lib/templating/doc-generator/generate-matrix.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.889Z'
complexity:
  cyclomatic: 2
  nesting_depth: 0
  parameter_count: 3
depends_on: []
called_by: []
confidence: 95%
---
# Function: transformCapabilityToJSON

## Purpose

To be documented


## Signature

```javascript
function transformCapabilityToJSON(agentName, cliName, capability)
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
- Nesting depth: 0
- Parameter count: 3
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
name: addMetadata
source_file: generate-matrix.js
source_location: bin/lib/templating/doc-generator/generate-matrix.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.889Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - toISOString
called_by:
  - generateMatrixData
confidence: 95%
---
# Function: addMetadata

## Purpose

To be documented


## Signature

```javascript
function addMetadata(data)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `toISOString()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

