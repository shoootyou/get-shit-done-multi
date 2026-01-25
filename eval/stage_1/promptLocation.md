---
subject: function
name: promptLocation
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.847Z'
complexity:
  cyclomatic: 10
  nesting_depth: 1
  parameter_count: 0
depends_on:
  - log
  - install
  - handleStatusline
  - finishInstall
  - createInterface
  - 'on'
  - close
  - exit
  - expandTilde
  - join
  - homedir
  - replace
  - question
  - trim
  - installCopilot
  - cwd
  - installCodex
called_by:
  - oldInstallationLogic
confidence: 70%
---
# Function: promptLocation

## Purpose

To be documented


## Signature

```javascript
function promptLocation()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `log()`
- `install()`
- `handleStatusline()`
- `finishInstall()`
- `createInterface()`
- `on()`
- `close()`
- `exit()`
- `expandTilde()`
- `join()`
- `homedir()`
- `replace()`
- `question()`
- `trim()`
- `installCopilot()`
- `cwd()`
- `installCodex()`


## Side Effects

- **console**: console.log (line 1676)
- **process_io**: process.stdout (line 1686)
- **console**: console.log (line 1695)
- **console**: console.log (line 1704)
- **console**: console.log (line 1716)


## Complexity Analysis

- Cyclomatic complexity: 10
- Nesting depth: 1
- Parameter count: 0
- Classification: Complex


## Analysis Confidence

**Confidence:** 70%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Complexity 10 but no documentation
- ❓ Dependencies used but purpose unclear

