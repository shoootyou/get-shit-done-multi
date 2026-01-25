---
subject: function
name: generateCapabilityDocs
source_file: generate-capability-docs.js
source_location: bin/lib/orchestration/generate-capability-docs.js
function_count_in_file: 6
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.866Z'
complexity:
  cyclomatic: 4
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - generateCapabilityMatrix
  - split
  - toISOString
  - forEach
  - entries
  - join
  - map
  - toUpperCase
  - charAt
  - slice
  - require
  - dirname
  - mkdir
  - writeFile
  - log
called_by: []
confidence: 65%
---
# Function: generateCapabilityDocs

## Purpose

To be documented


## Signature

```javascript
function generateCapabilityDocs(param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `generateCapabilityMatrix()`
- `split()`
- `toISOString()`
- `forEach()`
- `entries()`
- `join()`
- `map()`
- `toUpperCase()`
- `charAt()`
- `slice()`
- `require()`
- `dirname()`
- `mkdir()`
- `writeFile()`
- `log()`


## Side Effects

- **file_system**: fs.mkdir (line 100)
- **file_system**: fs.writeFile (line 103)
- **console**: console.log (line 104)


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 0
- Parameter count: 1
- Classification: Simple


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

