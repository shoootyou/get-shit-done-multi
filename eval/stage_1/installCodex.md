---
subject: function
name: installCodex
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.846Z'
complexity:
  cyclomatic: 32
  nesting_depth: 5
  parameter_count: 3
depends_on:
  - join
  - getTargetDirs
  - getConfigPaths
  - replace
  - homedir
  - cwd
  - log
  - preserveUserData
  - mkdirSync
  - existsSync
  - copyWithPathReplacement
  - readdirSync
  - push
  - readFileSync
  - require
  - generateFromTemplate
  - writeFileSync
  - copyFileSync
  - verifyFileInstalled
  - generateAgentsFromSpecs
  - filter
  - endsWith
  - convertContent
  - rmSync
  - verifyInstalled
  - generateSkillsFromSpecs
  - startsWith
  - isDirectory
  - statSync
  - forEach
  - toFixed
  - verify
  - error
  - exit
  - keys
  - restoreUserData
called_by:
  - oldInstallationLogic
  - installAll
  - promptLocation
confidence: 50%
---
# Function: installCodex

## Purpose

To be documented


## Signature

```javascript
function installCodex(isGlobal, param, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `getTargetDirs()`
- `getConfigPaths()`
- `replace()`
- `homedir()`
- `cwd()`
- `log()`
- `preserveUserData()`
- `mkdirSync()`
- `existsSync()`
- `copyWithPathReplacement()`
- `readdirSync()`
- `push()`
- `readFileSync()`
- `require()`
- `generateFromTemplate()`
- `writeFileSync()`
- `copyFileSync()`
- `verifyFileInstalled()`
- `generateAgentsFromSpecs()`
- `filter()`
- `endsWith()`
- `convertContent()`
- `rmSync()`
- `verifyInstalled()`
- `generateSkillsFromSpecs()`
- `startsWith()`
- `isDirectory()`
- `statSync()`
- `forEach()`
- `toFixed()`
- `verify()`
- `error()`
- `exit()`
- `keys()`
- `restoreUserData()`


## Side Effects

- **console**: console.log (line 1271)
- **file_system**: fs.mkdirSync (line 1282)
- **file_system**: fs.existsSync (line 1287)
- **file_system**: fs.existsSync (line 1292)
- **file_system**: fs.readdirSync (line 1292)
- **console**: console.log (line 1293)
- **file_system**: fs.mkdirSync (line 1299)
- **file_system**: fs.existsSync (line 1304)
- **file_system**: fs.readFileSync (line 1305)
- **file_system**: fs.writeFileSync (line 1309)
- **console**: console.log (line 1310)
- **file_system**: fs.existsSync (line 1320)
- **file_system**: fs.copyFileSync (line 1321)
- **console**: console.log (line 1323)
- **file_system**: fs.writeFileSync (line 1330)
- **console**: console.log (line 1332)
- **file_system**: fs.existsSync (line 1339)
- **file_system**: fs.mkdirSync (line 1342)
- **file_system**: fs.readdirSync (line 1349)
- **file_system**: fs.readFileSync (line 1352)
- **file_system**: fs.mkdirSync (line 1357)
- **file_system**: fs.writeFileSync (line 1358)
- **file_system**: fs.rmSync (line 1362)
- **console**: console.log (line 1366)
- **file_system**: fs.existsSync (line 1375)
- **file_system**: fs.readdirSync (line 1376)
- **file_system**: fs.existsSync (line 1382)
- **file_system**: fs.readFileSync (line 1384)
- **file_system**: fs.mkdirSync (line 1387)
- **file_system**: fs.writeFileSync (line 1388)
- **console**: console.log (line 1392)
- **file_system**: fs.existsSync (line 1400)
- **file_system**: fs.mkdirSync (line 1403)
- **console**: console.log (line 1408)
- **console**: console.log (line 1411)
- **file_system**: fs.readdirSync (line 1415)
- **file_system**: fs.statSync (line 1418)
- **file_system**: fs.existsSync (line 1423)
- **file_system**: fs.statSync (line 1424)
- **console**: console.log (line 1426)
- **file_system**: fs.readdirSync (line 1438)
- **file_system**: fs.readdirSync (line 1440)
- **file_system**: fs.statSync (line 1441)
- **console**: console.log (line 1442)
- **console**: console.error (line 1444)
- **console**: console.error (line 1445)
- **console**: console.log (line 1446)
- **console**: console.error (line 1450)
- **console**: console.log (line 1459)


## Complexity Analysis

- Cyclomatic complexity: 32
- Nesting depth: 5
- Parameter count: 3
- Classification: Complex


## Analysis Confidence

**Confidence:** 50%

**Deductions:**

- **-20%**: Dynamic requires/imports detected
- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Dynamic requires make dependency analysis uncertain
- ❓ Missing JSDoc comments
- ❓ Complexity 32 but no documentation
- ❓ Dependencies used but purpose unclear

