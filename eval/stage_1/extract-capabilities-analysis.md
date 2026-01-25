---
subject: function
name: extractAgentCapabilities
source_file: extract-capabilities.js
source_location: bin/lib/templating/doc-generator/extract-capabilities.js
function_count_in_file: 12
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.886Z'
complexity:
  cyclomatic: 5
  nesting_depth: 1
  parameter_count: 0
depends_on:
  - join
  - require
  - entries
  - getAgentDescription
  - push
called_by:
  - extractCapabilities
confidence: 65%
---
# Function: extractAgentCapabilities

## Purpose

To be documented


## Signature

```javascript
function extractAgentCapabilities()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `require()`
- `entries()`
- `getAgentDescription()`
- `push()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 1
- Parameter count: 0
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
name: getAgentDescription
source_file: extract-capabilities.js
source_location: bin/lib/templating/doc-generator/extract-capabilities.js
function_count_in_file: 12
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.886Z'
complexity:
  cyclomatic: 2
  nesting_depth: 0
  parameter_count: 1
depends_on: []
called_by:
  - extractAgentCapabilities
confidence: 95%
---
# Function: getAgentDescription

## Purpose

To be documented


## Signature

```javascript
function getAgentDescription(agentName)
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


---

---
subject: function
name: extractCommandCapabilities
source_file: extract-capabilities.js
source_location: bin/lib/templating/doc-generator/extract-capabilities.js
function_count_in_file: 12
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.886Z'
complexity:
  cyclomatic: 8
  nesting_depth: 4
  parameter_count: 0
depends_on:
  - join
  - require
  - push
  - sort
  - filter
  - readdirSync
  - endsWith
  - replace
  - readFileSync
  - match
  - trim
  - warn
called_by:
  - extractCapabilities
confidence: 65%
---
# Function: extractCommandCapabilities

## Purpose

To be documented


## Signature

```javascript
function extractCommandCapabilities()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `require()`
- `push()`
- `sort()`
- `filter()`
- `readdirSync()`
- `endsWith()`
- `replace()`
- `readFileSync()`
- `match()`
- `trim()`
- `warn()`


## Side Effects

- **console**: console.warn (line 134)


## Complexity Analysis

- Cyclomatic complexity: 8
- Nesting depth: 4
- Parameter count: 0
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
name: extractStateCapabilities
source_file: extract-capabilities.js
source_location: bin/lib/templating/doc-generator/extract-capabilities.js
function_count_in_file: 12
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.887Z'
complexity:
  cyclomatic: 8
  nesting_depth: 1
  parameter_count: 0
depends_on:
  - join
  - require
  - push
called_by:
  - extractCapabilities
confidence: 75%
---
# Function: extractStateCapabilities

## Purpose

To be documented


## Signature

```javascript
function extractStateCapabilities()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `require()`
- `push()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 8
- Nesting depth: 1
- Parameter count: 0
- Classification: Moderate


## Analysis Confidence

**Confidence:** 75%

**Deductions:**

- **-20%**: Dynamic requires/imports detected
- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Dynamic requires make dependency analysis uncertain
- ❓ Missing JSDoc comments


---

---
subject: function
name: aggregateByFeature
source_file: extract-capabilities.js
source_location: bin/lib/templating/doc-generator/extract-capabilities.js
function_count_in_file: 12
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.887Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - sort
  - localeCompare
called_by:
  - extractCapabilities
confidence: 95%
---
# Function: aggregateByFeature

## Purpose

To be documented


## Signature

```javascript
function aggregateByFeature(capabilities)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `sort()`
- `localeCompare()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 2
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
name: extractCapabilities
source_file: extract-capabilities.js
source_location: bin/lib/templating/doc-generator/extract-capabilities.js
function_count_in_file: 12
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.887Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - extractAgentCapabilities
  - extractCommandCapabilities
  - extractStateCapabilities
  - aggregateByFeature
called_by:
  - writeCapabilityData
confidence: 85%
---
# Function: extractCapabilities

## Purpose

To be documented


## Signature

```javascript
function extractCapabilities(param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `extractAgentCapabilities()`
- `extractCommandCapabilities()`
- `extractStateCapabilities()`
- `aggregateByFeature()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
- Parameter count: 1
- Classification: Simple


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
name: writeCapabilityData
source_file: extract-capabilities.js
source_location: bin/lib/templating/doc-generator/extract-capabilities.js
function_count_in_file: 12
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.887Z'
complexity:
  cyclomatic: 6
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - extractCapabilities
  - toISOString
  - dirname
  - mkdir
  - writeFile
  - stringify
  - log
  - reduce
  - error
called_by: []
confidence: 85%
---
# Function: writeCapabilityData

## Purpose

To be documented


## Signature

```javascript
function writeCapabilityData(outputPath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `extractCapabilities()`
- `toISOString()`
- `dirname()`
- `mkdir()`
- `writeFile()`
- `stringify()`
- `log()`
- `reduce()`
- `error()`


## Side Effects

- **file_system**: fs.mkdir (line 291)
- **file_system**: fs.writeFile (line 294)
- **console**: console.log (line 296)
- **console**: console.log (line 297)
- **console**: console.log (line 305)
- **console**: console.log (line 306)
- **console**: console.log (line 307)
- **console**: console.log (line 308)
- **console**: console.error (line 313)


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 1
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

