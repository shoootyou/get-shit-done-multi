---
subject: function
name: formatSupportLevel
source_file: generate-comparison.js
source_location: bin/lib/templating/doc-generator/generate-comparison.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.889Z'
complexity:
  cyclomatic: 5
  nesting_depth: 1
  parameter_count: 2
depends_on: []
called_by:
  - generateComparison
confidence: 95%
---
# Function: formatSupportLevel

## Purpose

To be documented


## Signature

```javascript
function formatSupportLevel(level, notes)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

None detected


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 1
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
name: generateLegend
source_file: generate-comparison.js
source_location: bin/lib/templating/doc-generator/generate-comparison.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.889Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 0
depends_on: []
called_by:
  - generateComparison
confidence: 95%
---
# Function: generateLegend

## Purpose

To be documented


## Signature

```javascript
function generateLegend()
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
name: generateComparison
source_file: generate-comparison.js
source_location: bin/lib/templating/doc-generator/generate-comparison.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.889Z'
complexity:
  cyclomatic: 8
  nesting_depth: 4
  parameter_count: 1
depends_on:
  - join
  - require
  - generateCapabilityMatrix
  - substring
  - replace
  - toISOString
  - formatSupportLevel
  - entries
  - generateLegend
  - writeFile
  - log
  - error
called_by: []
confidence: 65%
---
# Function: generateComparison

## Purpose

To be documented


## Signature

```javascript
function generateComparison(outputPath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `require()`
- `generateCapabilityMatrix()`
- `substring()`
- `replace()`
- `toISOString()`
- `formatSupportLevel()`
- `entries()`
- `generateLegend()`
- `writeFile()`
- `log()`
- `error()`


## Side Effects

- **file_system**: fs.writeFile (line 165)
- **console**: console.log (line 166)
- **console**: console.log (line 167)
- **console**: console.log (line 168)
- **console**: console.log (line 169)
- **console**: console.error (line 172)


## Complexity Analysis

- Cyclomatic complexity: 8
- Nesting depth: 4
- Parameter count: 1
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

