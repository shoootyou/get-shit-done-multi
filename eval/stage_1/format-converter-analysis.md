---
subject: function
name: agentToSkill
source_file: format-converter.js
source_location: bin/lib/platforms/shared/format-converter.js
function_count_in_file: 2
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.877Z'
complexity:
  cyclomatic: 6
  nesting_depth: 3
  parameter_count: 2
depends_on:
  - match
  - trim
  - slice
  - split
  - indexOf
  - join
  - map
  - entries
called_by:
  - convertContent
confidence: 85%
---
# Function: agentToSkill

## Purpose

To be documented


## Signature

```javascript
function agentToSkill(agentContent, agentName)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `match()`
- `trim()`
- `slice()`
- `split()`
- `indexOf()`
- `join()`
- `map()`
- `entries()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 3
- Parameter count: 2
- Classification: Moderate


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear

