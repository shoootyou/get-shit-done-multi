---
subject: function
name: validateSequentialSpawning
source_file: sequential-spawn-validator.js
source_location: bin/lib/orchestration/sequential-spawn-validator.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.871Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 3
depends_on:
  - push
called_by:
  - testSequentialSpawn
confidence: 95%
---
# Function: validateSequentialSpawning

## Purpose

To be documented


## Signature

```javascript
function validateSequentialSpawning(orchestratorCmd, checkpointPattern, testPrompt)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `push()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 1
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
name: detectCheckpointFile
source_file: sequential-spawn-validator.js
source_location: bin/lib/orchestration/sequential-spawn-validator.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.872Z'
complexity:
  cyclomatic: 5
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - existsSync
  - readdirSync
  - replace
  - test
  - join
called_by: []
confidence: 85%
---
# Function: detectCheckpointFile

## Purpose

To be documented


## Signature

```javascript
function detectCheckpointFile(directory, checkpointPattern)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `existsSync()`
- `readdirSync()`
- `replace()`
- `test()`
- `join()`


## Side Effects

- **file_system**: fs.existsSync (line 56)
- **file_system**: fs.readdirSync (line 60)


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 2
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
name: detectRespawnWithReference
source_file: sequential-spawn-validator.js
source_location: bin/lib/orchestration/sequential-spawn-validator.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.872Z'
complexity:
  cyclomatic: 7
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - replace
  - test
  - match
  - includes
called_by: []
confidence: 85%
---
# Function: detectRespawnWithReference

## Purpose

To be documented


## Signature

```javascript
function detectRespawnWithReference(output, checkpointPath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `replace()`
- `test()`
- `match()`
- `includes()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 1
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
name: verifyContextPassing
source_file: sequential-spawn-validator.js
source_location: bin/lib/orchestration/sequential-spawn-validator.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.872Z'
complexity:
  cyclomatic: 6
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - existsSync
  - replace
  - includes
  - readFileSync
  - substring
called_by: []
confidence: 85%
---
# Function: verifyContextPassing

## Purpose

To be documented


## Signature

```javascript
function verifyContextPassing(checkpointPath, respawnPrompt)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `existsSync()`
- `replace()`
- `includes()`
- `readFileSync()`
- `substring()`


## Side Effects

- **file_system**: fs.existsSync (line 119)
- **file_system**: fs.readFileSync (line 133)


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 1
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
name: parseCheckpointWorkflow
source_file: sequential-spawn-validator.js
source_location: bin/lib/orchestration/sequential-spawn-validator.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.872Z'
complexity:
  cyclomatic: 5
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - match
  - includes
  - toLowerCase
  - exec
  - push
called_by: []
confidence: 85%
---
# Function: parseCheckpointWorkflow

## Purpose

To be documented


## Signature

```javascript
function parseCheckpointWorkflow(output)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `match()`
- `includes()`
- `toLowerCase()`
- `exec()`
- `push()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 2
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

