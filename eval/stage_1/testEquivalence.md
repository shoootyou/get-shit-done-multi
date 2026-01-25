---
subject: function
name: testEquivalence
source_file: equivalence-test.js
source_location: bin/lib/orchestration/equivalence-test.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.866Z'
complexity:
  cyclomatic: 13
  nesting_depth: 4
  parameter_count: 3
depends_on:
  - log
  - substring
  - join
  - invokeAgent
  - filter
  - entries
  - push
  - map
  - stringify
  - trim
  - replace
  - parse
  - sort
  - keys
called_by:
  - runEquivalenceTests
confidence: 60%
---
# Function: testEquivalence

## Purpose

To be documented


## Signature

```javascript
function testEquivalence(agentName, testPrompt, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `log()`
- `substring()`
- `join()`
- `invokeAgent()`
- `filter()`
- `entries()`
- `push()`
- `map()`
- `stringify()`
- `trim()`
- `replace()`
- `parse()`
- `sort()`
- `keys()`


## Side Effects

- **console**: console.log (line 34)
- **console**: console.log (line 35)
- **console**: console.log (line 36)
- **console**: console.log (line 46)
- **console**: console.log (line 48)
- **console**: console.log (line 51)
- **console**: console.log (line 60)
- **console**: console.log (line 85)
- **console**: console.log (line 94)
- **console**: console.log (line 107)
- **console**: console.log (line 110)
- **console**: console.log (line 115)


## Complexity Analysis

- Cyclomatic complexity: 13
- Nesting depth: 4
- Parameter count: 3
- Classification: Complex


## Analysis Confidence

**Confidence:** 60%

**Deductions:**

- **-10%**: Unclear or generic function name
- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Name "testEquivalence" is generic or unclear
- ❓ Missing JSDoc comments
- ❓ Complexity 13 but no documentation
- ❓ Dependencies used but purpose unclear

