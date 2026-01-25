---
subject: function
name: main
source_file: validate-planning-dir.js
source_location: bin/lib/orchestration/validate-planning-dir.js
function_count_in_file: 5
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.873Z'
complexity:
  cyclomatic: 20
  nesting_depth: 4
  parameter_count: 0
depends_on:
  - log
  - repeat
  - validateStructure
  - forEach
  - validateJSON
  - readdir
  - startsWith
  - stat
  - isDirectory
  - validateAgentOutput
  - exit
called_by: []
confidence: 60%
---
# Function: main

## Purpose

To be documented


## Signature

```javascript
function main()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `log()`
- `repeat()`
- `validateStructure()`
- `forEach()`
- `validateJSON()`
- `readdir()`
- `startsWith()`
- `stat()`
- `isDirectory()`
- `validateAgentOutput()`
- `exit()`


## Side Effects

- **console**: console.log (line 14)
- **console**: console.log (line 19)
- **console**: console.log (line 20)
- **console**: console.log (line 22)
- **console**: console.log (line 25)
- **console**: console.log (line 26)
- **console**: console.log (line 28)
- **console**: console.log (line 32)
- **console**: console.log (line 33)
- **console**: console.log (line 39)
- **console**: console.log (line 41)
- **console**: console.log (line 47)
- **console**: console.log (line 51)
- **console**: console.log (line 52)
- **file_system**: fs.readdir (line 55)
- **file_system**: fs.stat (line 61)
- **console**: console.log (line 67)
- **console**: console.log (line 69)
- **console**: console.log (line 70)
- **console**: console.log (line 72)
- **console**: console.log (line 73)
- **console**: console.log (line 79)
- **console**: console.log (line 83)
- **console**: console.log (line 85)
- **console**: console.log (line 90)
- **console**: console.log (line 95)
- **console**: console.log (line 96)
- **console**: console.log (line 98)
- **console**: console.log (line 99)
- **console**: console.log (line 102)


## Complexity Analysis

- Cyclomatic complexity: 20
- Nesting depth: 4
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

- ❓ Name "main" is generic or unclear
- ❓ Missing JSDoc comments
- ❓ Complexity 20 but no documentation
- ❓ Dependencies used but purpose unclear

