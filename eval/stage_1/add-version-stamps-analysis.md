---
subject: function
name: getGSDVersion
source_file: add-version-stamps.js
source_location: bin/lib/templating/doc-generator/add-version-stamps.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.884Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 0
depends_on:
  - join
  - readFile
  - parse
  - warn
called_by:
  - stampAllDocs
confidence: 85%
---
# Function: getGSDVersion

## Purpose

To be documented


## Signature

```javascript
function getGSDVersion()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `readFile()`
- `parse()`
- `warn()`


## Side Effects

- **file_system**: fs.readFile (line 23)
- **console**: console.warn (line 27)


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 1
- Parameter count: 0
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
name: formatDate
source_file: add-version-stamps.js
source_location: bin/lib/templating/doc-generator/add-version-stamps.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.885Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - getMonth
  - getDate
  - getFullYear
called_by:
  - addVersionStamp
confidence: 95%
---
# Function: formatDate

## Purpose

To be documented


## Signature

```javascript
function formatDate(date)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `getMonth()`
- `getDate()`
- `getFullYear()`


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
name: addVersionStamp
source_file: add-version-stamps.js
source_location: bin/lib/templating/doc-generator/add-version-stamps.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.885Z'
complexity:
  cyclomatic: 4
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - toISOString
  - formatDate
  - test
  - replace
  - trim
called_by:
  - stampFile
confidence: 85%
---
# Function: addVersionStamp

## Purpose

To be documented


## Signature

```javascript
function addVersionStamp(content, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `toISOString()`
- `formatDate()`
- `test()`
- `replace()`
- `trim()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 1
- Parameter count: 2
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
name: addFeatureBadge
source_file: add-version-stamps.js
source_location: bin/lib/templating/doc-generator/add-version-stamps.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.885Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 2
depends_on: []
called_by: []
confidence: 95%
---
# Function: addFeatureBadge

## Purpose

To be documented


## Signature

```javascript
function addFeatureBadge(text, version)
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
name: stampFile
source_file: add-version-stamps.js
source_location: bin/lib/templating/doc-generator/add-version-stamps.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.885Z'
complexity:
  cyclomatic: 4
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - readFile
  - basename
  - addVersionStamp
  - writeFile
  - log
  - error
called_by:
  - stampAllDocs
confidence: 85%
---
# Function: stampFile

## Purpose

To be documented


## Signature

```javascript
function stampFile(filePath, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `readFile()`
- `basename()`
- `addVersionStamp()`
- `writeFile()`
- `log()`
- `error()`


## Side Effects

- **file_system**: fs.readFile (line 113)
- **file_system**: fs.writeFile (line 132)
- **console**: console.log (line 134)
- **console**: console.error (line 136)


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 1
- Parameter count: 2
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
name: stampAllDocs
source_file: add-version-stamps.js
source_location: bin/lib/templating/doc-generator/add-version-stamps.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.885Z'
complexity:
  cyclomatic: 4
  nesting_depth: 3
  parameter_count: 1
depends_on:
  - getGSDVersion
  - log
  - join
  - stampFile
called_by: []
confidence: 85%
---
# Function: stampAllDocs

## Purpose

To be documented


## Signature

```javascript
function stampAllDocs(docsDir)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `getGSDVersion()`
- `log()`
- `join()`
- `stampFile()`


## Side Effects

- **console**: console.log (line 155)
- **console**: console.log (line 169)


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 3
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

