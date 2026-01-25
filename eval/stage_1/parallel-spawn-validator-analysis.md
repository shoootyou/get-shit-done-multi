---
subject: function
name: measureExecutionTime
source_file: parallel-spawn-validator.js
source_location: bin/lib/orchestration/parallel-spawn-validator.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.869Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - now
  - fn
called_by: []
confidence: 95%
---
# Function: measureExecutionTime

## Purpose

To be documented


## Signature

```javascript
function measureExecutionTime(fn)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `now()`
- `fn()`


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


---

---
subject: function
name: calculateSequentialEstimate
source_file: parallel-spawn-validator.js
source_location: bin/lib/orchestration/parallel-spawn-validator.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.869Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - reduce
called_by: []
confidence: 95%
---
# Function: calculateSequentialEstimate

## Purpose

To be documented


## Signature

```javascript
function calculateSequentialEstimate(agentDurations)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `reduce()`


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


---

---
subject: function
name: detectSpawnedAgents
source_file: parallel-spawn-validator.js
source_location: bin/lib/orchestration/parallel-spawn-validator.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.869Z'
complexity:
  cyclomatic: 4
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - exec
  - add
  - from
called_by: []
confidence: 95%
---
# Function: detectSpawnedAgents

## Purpose

To be documented


## Signature

```javascript
function detectSpawnedAgents(output)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `exec()`
- `add()`
- `from()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 4
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
name: validateParallelTiming
source_file: parallel-spawn-validator.js
source_location: bin/lib/orchestration/parallel-spawn-validator.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.869Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 3
depends_on:
  - toFixed
called_by: []
confidence: 95%
---
# Function: validateParallelTiming

## Purpose

To be documented


## Signature

```javascript
function validateParallelTiming(actualDuration, sequentialEstimate, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `toFixed()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 1
- Parameter count: 3
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

