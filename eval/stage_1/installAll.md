---
subject: function
name: installAll
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.847Z'
complexity:
  cyclomatic: 19
  nesting_depth: 2
  parameter_count: 0
depends_on:
  - detectInstalledCLIs
  - map
  - filter
  - entries
  - log
  - exit
  - install
  - finishInstall
  - getTargetDirs
  - verify
  - readdirSync
  - endsWith
  - push
  - error
  - cwd
  - installCopilot
  - installCodex
  - isDirectory
  - statSync
  - join
  - forEach
called_by:
  - oldInstallationLogic
confidence: 70%
---
# Function: installAll

## Purpose

To be documented


## Signature

```javascript
function installAll()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `detectInstalledCLIs()`
- `map()`
- `filter()`
- `entries()`
- `log()`
- `exit()`
- `install()`
- `finishInstall()`
- `getTargetDirs()`
- `verify()`
- `readdirSync()`
- `endsWith()`
- `push()`
- `error()`
- `cwd()`
- `installCopilot()`
- `installCodex()`
- `isDirectory()`
- `statSync()`
- `join()`
- `forEach()`


## Side Effects

- **console**: console.log (line 1494)
- **console**: console.log (line 1495)
- **console**: console.log (line 1496)
- **console**: console.log (line 1497)
- **console**: console.log (line 1501)
- **console**: console.log (line 1507)
- **file_system**: fs.readdirSync (line 1517)
- **file_system**: fs.readdirSync (line 1519)
- **console**: console.error (line 1529)
- **console**: console.log (line 1536)
- **file_system**: fs.readdirSync (line 1545)
- **file_system**: fs.readdirSync (line 1547)
- **console**: console.error (line 1557)
- **console**: console.log (line 1564)
- **file_system**: fs.readdirSync (line 1572)
- **file_system**: fs.readdirSync (line 1574)
- **file_system**: fs.statSync (line 1574)
- **console**: console.error (line 1584)
- **console**: console.log (line 1590)
- **console**: console.log (line 1601)
- **console**: console.log (line 1605)
- **console**: console.log (line 1606)
- **console**: console.log (line 1607)
- **console**: console.log (line 1608)
- **console**: console.log (line 1609)


## Complexity Analysis

- Cyclomatic complexity: 19
- Nesting depth: 2
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
- ❓ Complexity 19 but no documentation
- ❓ Dependencies used but purpose unclear

