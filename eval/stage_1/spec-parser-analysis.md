---
subject: function
name: loadSharedFrontmatter
source_file: spec-parser.js
source_location: bin/lib/templating/spec-parser.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.894Z'
complexity:
  cyclomatic: 3
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - dirname
  - join
  - existsSync
  - readFileSync
  - load
  - warn
called_by:
  - parseSpec
confidence: 85%
---
# Function: loadSharedFrontmatter

## Purpose

To be documented


## Signature

```javascript
function loadSharedFrontmatter(specPath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `dirname()`
- `join()`
- `existsSync()`
- `readFileSync()`
- `load()`
- `warn()`


## Side Effects

- **file_system**: fs.existsSync (line 23)
- **file_system**: fs.readFileSync (line 25)
- **console**: console.warn (line 29)


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 2
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
name: mergeFrontmatter
source_file: spec-parser.js
source_location: bin/lib/templating/spec-parser.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.894Z'
complexity:
  cyclomatic: 7
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - isArray
called_by:
  - parseSpec
confidence: 95%
---
# Function: mergeFrontmatter

## Purpose

To be documented


## Signature

```javascript
function mergeFrontmatter(shared, specific)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `isArray()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 2
- Parameter count: 2
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
name: parseSpec
source_file: spec-parser.js
source_location: bin/lib/templating/spec-parser.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.894Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - resolve
  - existsSync
  - read
  - loadSharedFrontmatter
  - mergeFrontmatter
  - buildParseError
called_by: []
confidence: 85%
---
# Function: parseSpec

## Purpose

To be documented


## Signature

```javascript
function parseSpec(filePath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `resolve()`
- `existsSync()`
- `read()`
- `loadSharedFrontmatter()`
- `mergeFrontmatter()`
- `buildParseError()`


## Side Effects

- **file_system**: fs.existsSync (line 83)


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 1
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
name: parseSpecString
source_file: spec-parser.js
source_location: bin/lib/templating/spec-parser.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.894Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - matter
  - buildParseError
called_by:
  - generateAgent
confidence: 95%
---
# Function: parseSpecString

## Purpose

To be documented


## Signature

```javascript
function parseSpecString(content, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `matter()`
- `buildParseError()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 2
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
name: buildParseError
source_file: spec-parser.js
source_location: bin/lib/templating/spec-parser.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.895Z'
complexity:
  cyclomatic: 4
  nesting_depth: 1
  parameter_count: 2
depends_on: []
called_by:
  - parseSpec
  - parseSpecString
confidence: 95%
---
# Function: buildParseError

## Purpose

To be documented


## Signature

```javascript
function buildParseError(error, sourcePath)
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
- Parameter count: 2
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments

