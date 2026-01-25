---
subject: function
name: generateMigrationReport
source_file: migrate-agents.js
source_location: bin/lib/templating/migrate-agents.js
function_count_in_file: 11
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.893Z'
complexity:
  cyclomatic: 13
  nesting_depth: 4
  parameter_count: 1
depends_on:
  - push
  - forEach
  - join
called_by: []
confidence: 80%
---
# Function: generateMigrationReport

## Purpose

To be documented


## Signature

```javascript
function generateMigrationReport(migrationResults)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `push()`
- `forEach()`
- `join()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 13
- Nesting depth: 4
- Parameter count: 1
- Classification: Complex


## Analysis Confidence

**Confidence:** 80%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Complexity 13 but no documentation

