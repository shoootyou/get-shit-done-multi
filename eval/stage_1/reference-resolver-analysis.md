---
subject: function
name: validateReferences
source_file: reference-resolver.js
source_location: bin/lib/orchestration/reference-resolver.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.870Z'
complexity:
  cyclomatic: 6
  nesting_depth: 3
  parameter_count: 2
depends_on:
  - push
  - exec
  - startsWith
  - substring
  - join
  - replace
  - existsSync
called_by:
  - testReferenceResolution
  - validateAndInterpolate
confidence: 85%
---
# Function: validateReferences

## Purpose

To be documented


## Signature

```javascript
function validateReferences(prompt, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `push()`
- `exec()`
- `startsWith()`
- `substring()`
- `join()`
- `replace()`
- `existsSync()`


## Side Effects

- **file_system**: fs.existsSync (line 64)


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 3
- Parameter count: 2
- Classification: Moderate


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear


---

---
subject: function
name: interpolateVariables
source_file: reference-resolver.js
source_location: bin/lib/orchestration/reference-resolver.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.870Z'
complexity:
  cyclomatic: 4
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - replace
called_by:
  - testReferenceResolution
  - validateAndInterpolate
confidence: 95%
---
# Function: interpolateVariables

## Purpose

To be documented


## Signature

```javascript
function interpolateVariables(template, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `replace()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 1
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
name: extractVariables
source_file: reference-resolver.js
source_location: bin/lib/orchestration/reference-resolver.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.870Z'
complexity:
  cyclomatic: 6
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - exec
  - includes
  - push
called_by: []
confidence: 95%
---
# Function: extractVariables

## Purpose

To be documented


## Signature

```javascript
function extractVariables(template)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `exec()`
- `includes()`
- `push()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 6
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
name: validateAndInterpolate
source_file: reference-resolver.js
source_location: bin/lib/orchestration/reference-resolver.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.870Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 3
depends_on:
  - interpolateVariables
  - validateReferences
called_by: []
confidence: 95%
---
# Function: validateAndInterpolate

## Purpose

To be documented


## Signature

```javascript
function validateAndInterpolate(prompt, param, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `interpolateVariables()`
- `validateReferences()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
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
name: extractReferences
source_file: reference-resolver.js
source_location: bin/lib/orchestration/reference-resolver.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.871Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - exec
  - push
called_by: []
confidence: 95%
---
# Function: extractReferences

## Purpose

To be documented


## Signature

```javascript
function extractReferences(prompt)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `exec()`
- `push()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 1
- Parameter count: 1
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
name: resolveReferencePath
source_file: reference-resolver.js
source_location: bin/lib/orchestration/reference-resolver.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.871Z'
complexity:
  cyclomatic: 3
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - startsWith
  - substring
  - join
called_by: []
confidence: 95%
---
# Function: resolveReferencePath

## Purpose

To be documented


## Signature

```javascript
function resolveReferencePath(reference, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `startsWith()`
- `substring()`
- `join()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 2
- Parameter count: 2
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

