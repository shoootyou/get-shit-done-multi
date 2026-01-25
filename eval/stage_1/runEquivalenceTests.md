---
subject: function
name: runEquivalenceTests
source_file: equivalence-test.js
source_location: bin/lib/orchestration/equivalence-test.js
function_count_in_file: 9
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.866Z'
complexity:
  cyclomatic: 15
  nesting_depth: 2
  parameter_count: 0
depends_on:
  - log
  - repeat
  - execFileAsync
  - push
  - join
  - testEquivalence
  - forEach
called_by: []
confidence: 60%
---
# Function: runEquivalenceTests

## Purpose

To be documented


## Signature

```javascript
function runEquivalenceTests()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `log()`
- `repeat()`
- `execFileAsync()`
- `push()`
- `join()`
- `testEquivalence()`
- `forEach()`


## Side Effects

- **console**: console.log (line 136)
- **console**: console.log (line 137)
- **console**: console.log (line 142)
- **console**: console.log (line 148)
- **console**: console.log (line 150)
- **console**: console.log (line 157)
- **console**: console.log (line 159)
- **console**: console.log (line 166)
- **console**: console.log (line 168)
- **console**: console.log (line 173)
- **console**: console.log (line 174)
- **console**: console.log (line 175)
- **console**: console.log (line 179)
- **console**: console.log (line 188)
- **console**: console.log (line 197)
- **console**: console.log (line 200)
- **console**: console.log (line 201)
- **console**: console.log (line 205)
- **console**: console.log (line 212)
- **console**: console.log (line 221)
- **console**: console.log (line 224)
- **console**: console.log (line 225)
- **console**: console.log (line 229)
- **console**: console.log (line 236)
- **console**: console.log (line 245)
- **console**: console.log (line 248)
- **console**: console.log (line 249)
- **console**: console.log (line 253)
- **console**: console.log (line 258)
- **console**: console.log (line 259)
- **console**: console.log (line 260)
- **console**: console.log (line 261)
- **console**: console.log (line 262)
- **console**: console.log (line 263)
- **console**: console.log (line 265)


## Complexity Analysis

- Cyclomatic complexity: 15
- Nesting depth: 2
- Parameter count: 0
- Classification: Complex


## Analysis Confidence

**Confidence:** 60%

**Deductions:**

- **-10%**: Unclear or generic function name
- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Name "runEquivalenceTests" is generic or unclear
- ❓ Missing JSDoc comments
- ❓ Complexity 15 but no documentation
- ❓ Dependencies used but purpose unclear

