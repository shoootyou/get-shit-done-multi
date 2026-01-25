---
subject: function
name: invokeClaude
source_file: cli-invoker.js
source_location: bin/lib/testing/cli-invoker.js
function_count_in_file: 16
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.897Z'
complexity:
  cyclomatic: 7
  nesting_depth: 1
  parameter_count: 3
depends_on:
  - now
  - unshift
  - spawn
  - 'on'
  - toString
  - resolve
  - reject
  - setTimeout
  - terminate
called_by: []
confidence: 85%
---
# Function: invokeClaude

## Purpose

To be documented


## Signature

```javascript
function invokeClaude(agentName, prompt, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `now()`
- `unshift()`
- `spawn()`
- `on()`
- `toString()`
- `resolve()`
- `reject()`
- `setTimeout()`
- `terminate()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 1
- Parameter count: 3
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
name: invokeCopilot
source_file: cli-invoker.js
source_location: bin/lib/testing/cli-invoker.js
function_count_in_file: 16
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.898Z'
complexity:
  cyclomatic: 7
  nesting_depth: 1
  parameter_count: 3
depends_on:
  - now
  - spawn
  - cwd
  - 'on'
  - toString
  - resolve
  - reject
  - setTimeout
  - terminate
called_by: []
confidence: 85%
---
# Function: invokeCopilot

## Purpose

To be documented


## Signature

```javascript
function invokeCopilot(agentName, prompt, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `now()`
- `spawn()`
- `cwd()`
- `on()`
- `toString()`
- `resolve()`
- `reject()`
- `setTimeout()`
- `terminate()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 1
- Parameter count: 3
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
name: isClaudeAvailable
source_file: cli-invoker.js
source_location: bin/lib/testing/cli-invoker.js
function_count_in_file: 16
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.898Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 0
depends_on:
  - execSync
called_by: []
confidence: 95%
---
# Function: isClaudeAvailable

## Purpose

To be documented


## Signature

```javascript
function isClaudeAvailable()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `execSync()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 1
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
name: isCopilotAvailable
source_file: cli-invoker.js
source_location: bin/lib/testing/cli-invoker.js
function_count_in_file: 16
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.898Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 0
depends_on:
  - execSync
called_by: []
confidence: 95%
---
# Function: isCopilotAvailable

## Purpose

To be documented


## Signature

```javascript
function isCopilotAvailable()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `execSync()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 1
- Parameter count: 0
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

