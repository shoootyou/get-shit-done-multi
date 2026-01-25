---
subject: function
name: invokeAgent
source_file: agent-invoker.js
source_location: bin/lib/orchestration/agent-invoker.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.865Z'
complexity:
  cyclomatic: 8
  nesting_depth: 3
  parameter_count: 3
depends_on:
  - withLock
  - now
  - detectCLI
  - startAgent
  - replace
  - getAgent
  - require
  - endAgent
  - toISOString
  - invokeAgent
  - trackUsage
called_by:
  - invokeAgent
  - testEquivalence
confidence: 65%
---
# Function: invokeAgent

## Purpose

To be documented


## Signature

```javascript
function invokeAgent(agentName, prompt, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `withLock()`
- `now()`
- `detectCLI()`
- `startAgent()`
- `replace()`
- `getAgent()`
- `require()`
- `endAgent()`
- `toISOString()`
- `invokeAgent()`
- `trackUsage()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 8
- Nesting depth: 3
- Parameter count: 3
- Classification: Moderate


## Analysis Confidence

**Confidence:** 65%

**Deductions:**

- **-20%**: Dynamic requires/imports detected
- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Dynamic requires make dependency analysis uncertain
- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear


---

---
subject: function
name: getPerformanceTracker
source_file: agent-invoker.js
source_location: bin/lib/orchestration/agent-invoker.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.865Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 0
depends_on: []
called_by: []
confidence: 95%
---
# Function: getPerformanceTracker

## Purpose

To be documented


## Signature

```javascript
function getPerformanceTracker()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

None detected


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
name: getStateModules
source_file: agent-invoker.js
source_location: bin/lib/orchestration/agent-invoker.js
function_count_in_file: 4
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.865Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 0
depends_on: []
called_by: []
confidence: 95%
---
# Function: getStateModules

## Purpose

To be documented


## Signature

```javascript
function getStateModules()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

None detected


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

