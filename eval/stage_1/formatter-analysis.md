---
subject: function
name: indent
source_file: formatter.js
source_location: bin/lib/installation/formatter.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.860Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - repeat
  - join
  - map
  - split
called_by: []
confidence: 85%
---
# Function: indent

## Purpose

To be documented


## Signature

```javascript
function indent(text, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `repeat()`
- `join()`
- `map()`
- `split()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
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
name: box
source_file: formatter.js
source_location: bin/lib/installation/formatter.js
function_count_in_file: 3
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.861Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - require
  - boxen
called_by: []
confidence: 75%
---
# Function: box

## Purpose

To be documented


## Signature

```javascript
function box(text, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `require()`
- `boxen()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
- Parameter count: 2
- Classification: Simple


## Analysis Confidence

**Confidence:** 75%

**Deductions:**

- **-20%**: Dynamic requires/imports detected
- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Dynamic requires make dependency analysis uncertain
- ❓ Missing JSDoc comments

