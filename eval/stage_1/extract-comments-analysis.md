---
subject: function
name: extractDocComments
source_file: extract-comments.js
source_location: bin/lib/templating/doc-generator/extract-comments.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.887Z'
complexity:
  cyclomatic: 6
  nesting_depth: 5
  parameter_count: 1
depends_on:
  - readFile
  - exec
  - filter
  - map
  - split
  - trim
  - replace
  - startsWith
  - push
  - parseJSDocTags
  - join
  - error
called_by:
  - extractFromDirectory
  - scan
confidence: 85%
---
# Function: extractDocComments

## Purpose

To be documented


## Signature

```javascript
function extractDocComments(filePath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `readFile()`
- `exec()`
- `filter()`
- `map()`
- `split()`
- `trim()`
- `replace()`
- `startsWith()`
- `push()`
- `parseJSDocTags()`
- `join()`
- `error()`


## Side Effects

- **file_system**: fs.readFile (line 22)
- **console**: console.error (line 66)


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 5
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
name: parseJSDocTags
source_file: extract-comments.js
source_location: bin/lib/templating/doc-generator/extract-comments.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.888Z'
complexity:
  cyclomatic: 4
  nesting_depth: 3
  parameter_count: 1
depends_on:
  - match
  - trim
  - push
called_by:
  - extractDocComments
confidence: 95%
---
# Function: parseJSDocTags

## Purpose

To be documented


## Signature

```javascript
function parseJSDocTags(tagLines)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `match()`
- `trim()`
- `push()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 3
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
name: extractFromDirectory
source_file: extract-comments.js
source_location: bin/lib/templating/doc-generator/extract-comments.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.888Z'
complexity:
  cyclomatic: 9
  nesting_depth: 5
  parameter_count: 1
depends_on:
  - readdir
  - join
  - isDirectory
  - startsWith
  - scan
  - isFile
  - endsWith
  - extractDocComments
  - error
called_by: []
confidence: 85%
---
# Function: extractFromDirectory

## Purpose

To be documented


## Signature

```javascript
function extractFromDirectory(dirPath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `readdir()`
- `join()`
- `isDirectory()`
- `startsWith()`
- `scan()`
- `isFile()`
- `endsWith()`
- `extractDocComments()`
- `error()`


## Side Effects

- **file_system**: fs.readdir (line 109)
- **console**: console.error (line 127)


## Complexity Analysis

- Cyclomatic complexity: 9
- Nesting depth: 5
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
name: scan
source_file: extract-comments.js
source_location: bin/lib/templating/doc-generator/extract-comments.js
function_count_in_file: 8
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.888Z'
complexity:
  cyclomatic: 9
  nesting_depth: 5
  parameter_count: 1
depends_on:
  - readdir
  - join
  - isDirectory
  - startsWith
  - scan
  - isFile
  - endsWith
  - extractDocComments
  - error
called_by:
  - extractFromDirectory
  - scan
confidence: 85%
---
# Function: scan

## Purpose

To be documented


## Signature

```javascript
function scan(dir)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `readdir()`
- `join()`
- `isDirectory()`
- `startsWith()`
- `scan()`
- `isFile()`
- `endsWith()`
- `extractDocComments()`
- `error()`


## Side Effects

- **file_system**: fs.readdir (line 109)
- **console**: console.error (line 127)


## Complexity Analysis

- Cyclomatic complexity: 9
- Nesting depth: 5
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

