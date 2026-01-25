---
subject: function
name: validateMigration
source_file: migrate-agents.js
source_location: bin/lib/templating/migrate-agents.js
function_count_in_file: 11
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.893Z'
complexity:
  cyclomatic: 7
  nesting_depth: 4
  parameter_count: 1
depends_on:
  - existsSync
  - push
  - filter
  - readdirSync
  - endsWith
  - join
  - readFileSync
  - includes
  - startsWith
called_by: []
confidence: 85%
---
# Function: validateMigration

## Purpose

To be documented


## Signature

```javascript
function validateMigration(param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `existsSync()`
- `push()`
- `filter()`
- `readdirSync()`
- `endsWith()`
- `join()`
- `readFileSync()`
- `includes()`
- `startsWith()`


## Side Effects

- **file_system**: fs.existsSync (line 128)
- **file_system**: fs.readdirSync (line 136)
- **file_system**: fs.readFileSync (line 143)


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 4
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

