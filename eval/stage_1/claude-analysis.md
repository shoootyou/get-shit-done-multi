---
subject: function
name: getTargetDirs
source_file: claude.js
source_location: bin/lib/platforms/claude.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.874Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - getConfigPaths
  - join
called_by:
  - oldInstallationLogic
  - install
  - installCopilot
  - installCodex
  - installAll
confidence: 95%
---
# Function: getTargetDirs

## Purpose

To be documented


## Signature

```javascript
function getTargetDirs(scope, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `getConfigPaths()`
- `join()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
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
name: convertContent
source_file: claude.js
source_location: bin/lib/platforms/claude.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.874Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 2
depends_on: []
called_by:
  - oldInstallationLogic
  - copyWithPathReplacement
  - install
  - installCodex
confidence: 95%
---
# Function: convertContent

## Purpose

To be documented


## Signature

```javascript
function convertContent(content, type)
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
name: verify
source_file: claude.js
source_location: bin/lib/platforms/claude.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.874Z'
complexity:
  cyclomatic: 8
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - existsSync
  - push
  - join
  - filter
  - readdirSync
  - startsWith
  - endsWith
called_by:
  - oldInstallationLogic
  - install
  - installCopilot
  - installCodex
  - installAll
confidence: 85%
---
# Function: verify

## Purpose

To be documented


## Signature

```javascript
function verify(dirs)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `existsSync()`
- `push()`
- `join()`
- `filter()`
- `readdirSync()`
- `startsWith()`
- `endsWith()`


## Side Effects

- **file_system**: fs.existsSync (line 69)
- **file_system**: fs.existsSync (line 72)
- **file_system**: fs.existsSync (line 78)
- **file_system**: fs.existsSync (line 84)
- **file_system**: fs.existsSync (line 89)
- **file_system**: fs.readdirSync (line 90)


## Complexity Analysis

- Cyclomatic complexity: 8
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


---

---
subject: function
name: invokeAgent
source_file: claude.js
source_location: bin/lib/platforms/claude.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.874Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 3
depends_on:
  - execFileAsync
  - trim
called_by:
  - invokeAgent
  - testEquivalence
confidence: 95%
---
# Function: invokeAgent

## Purpose

To be documented


## Signature

```javascript
function invokeAgent(agent, prompt, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `execFileAsync()`
- `trim()`


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

