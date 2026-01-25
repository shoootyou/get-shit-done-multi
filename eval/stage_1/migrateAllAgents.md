---
subject: function
name: migrateAllAgents
source_file: migrate-agents.js
source_location: bin/lib/templating/migrate-agents.js
function_count_in_file: 11
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.893Z'
complexity:
  cyclomatic: 16
  nesting_depth: 4
  parameter_count: 3
depends_on:
  - existsSync
  - push
  - mkdirSync
  - sort
  - filter
  - readdirSync
  - endsWith
  - join
  - convertAgentToSpec
  - log
  - writeFileSync
  - forEach
called_by: []
confidence: 70%
---
# Function: migrateAllAgents

## Purpose

To be documented


## Signature

```javascript
function migrateAllAgents(param, param, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `existsSync()`
- `push()`
- `mkdirSync()`
- `sort()`
- `filter()`
- `readdirSync()`
- `endsWith()`
- `join()`
- `convertAgentToSpec()`
- `log()`
- `writeFileSync()`
- `forEach()`


## Side Effects

- **file_system**: fs.existsSync (line 24)
- **file_system**: fs.existsSync (line 31)
- **file_system**: fs.mkdirSync (line 32)
- **file_system**: fs.readdirSync (line 36)
- **file_system**: fs.existsSync (line 49)
- **console**: console.log (line 71)
- **file_system**: fs.writeFileSync (line 77)
- **console**: console.log (line 87)
- **console**: console.log (line 90)


## Complexity Analysis

- Cyclomatic complexity: 16
- Nesting depth: 4
- Parameter count: 3
- Classification: Complex


## Analysis Confidence

**Confidence:** 70%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Complexity 16 but no documentation
- ❓ Dependencies used but purpose unclear

