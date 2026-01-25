---
subject: function
name: getAgentsPath
source_file: context-builder.js
source_location: bin/lib/templating/context-builder.js
function_count_in_file: 10
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.882Z'
complexity:
  cyclomatic: 4
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - join
called_by:
  - buildContext
confidence: 95%
---
# Function: getAgentsPath

## Purpose

To be documented


## Signature

```javascript
function getAgentsPath(platform, configPaths)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 4
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
name: getSkillsPath
source_file: context-builder.js
source_location: bin/lib/templating/context-builder.js
function_count_in_file: 10
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.882Z'
complexity:
  cyclomatic: 4
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - join
called_by:
  - buildContext
confidence: 95%
---
# Function: getSkillsPath

## Purpose

To be documented


## Signature

```javascript
function getSkillsPath(platform, configPaths)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 4
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
name: getGsdPath
source_file: context-builder.js
source_location: bin/lib/templating/context-builder.js
function_count_in_file: 10
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.882Z'
complexity:
  cyclomatic: 4
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - join
called_by:
  - buildContext
confidence: 95%
---
# Function: getGsdPath

## Purpose

To be documented


## Signature

```javascript
function getGsdPath(platform, configPaths)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 4
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
name: getGsdPathRef
source_file: context-builder.js
source_location: bin/lib/templating/context-builder.js
function_count_in_file: 10
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.883Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on: []
called_by:
  - buildContext
confidence: 95%
---
# Function: getGsdPathRef

## Purpose

To be documented


## Signature

```javascript
function getGsdPathRef(platform)
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
name: getPlatformCapabilities
source_file: context-builder.js
source_location: bin/lib/templating/context-builder.js
function_count_in_file: 10
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.883Z'
complexity:
  cyclomatic: 4
  nesting_depth: 1
  parameter_count: 1
depends_on: []
called_by:
  - buildContext
  - supportsField
  - getPlatformLimits
confidence: 95%
---
# Function: getPlatformCapabilities

## Purpose

To be documented


## Signature

```javascript
function getPlatformCapabilities(platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

None detected


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
name: supportsField
source_file: context-builder.js
source_location: bin/lib/templating/context-builder.js
function_count_in_file: 10
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.883Z'
complexity:
  cyclomatic: 4
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - getPlatformCapabilities
  - includes
called_by:
  - getFieldWarning
confidence: 95%
---
# Function: supportsField

## Purpose

To be documented


## Signature

```javascript
function supportsField(platform, fieldName)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `getPlatformCapabilities()`
- `includes()`


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
name: getFieldWarning
source_file: context-builder.js
source_location: bin/lib/templating/context-builder.js
function_count_in_file: 10
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.883Z'
complexity:
  cyclomatic: 4
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - supportsField
called_by: []
confidence: 95%
---
# Function: getFieldWarning

## Purpose

To be documented


## Signature

```javascript
function getFieldWarning(platform, fieldName)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `supportsField()`


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
name: getPlatformLimits
source_file: context-builder.js
source_location: bin/lib/templating/context-builder.js
function_count_in_file: 10
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.884Z'
complexity:
  cyclomatic: 2
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - getPlatformCapabilities
called_by: []
confidence: 95%
---
# Function: getPlatformLimits

## Purpose

To be documented


## Signature

```javascript
function getPlatformLimits(platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `getPlatformCapabilities()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 2
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
name: getCommandPrefix
source_file: context-builder.js
source_location: bin/lib/templating/context-builder.js
function_count_in_file: 10
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.884Z'
complexity:
  cyclomatic: 2
  nesting_depth: 0
  parameter_count: 1
depends_on: []
called_by:
  - buildContext
confidence: 95%
---
# Function: getCommandPrefix

## Purpose

To be documented


## Signature

```javascript
function getCommandPrefix(platform)
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
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

