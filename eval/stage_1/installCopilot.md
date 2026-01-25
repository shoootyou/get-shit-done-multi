---
subject: function
name: installCopilot
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.846Z'
complexity:
  cyclomatic: 26
  nesting_depth: 5
  parameter_count: 3
depends_on:
  - join
  - getTargetDirs
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
  - verifyFileInstalled
  - copyFileSync
  - copyCopilotAgents
  - verifyInstalled
  - generateSkillsFromSpecs
  - filter
  - startsWith
  - isDirectory
  - statSync
  - forEach
  - toFixed
  - installIssueTemplates
  - verify
  - endsWith
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
# Function: installCopilot

## Purpose

To be documented


## Signature

```javascript
function installCopilot(param, param, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `getTargetDirs()`
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
- `verifyFileInstalled()`
- `copyFileSync()`
- `copyCopilotAgents()`
- `verifyInstalled()`
- `generateSkillsFromSpecs()`
- `filter()`
- `startsWith()`
- `isDirectory()`
- `statSync()`
- `forEach()`
- `toFixed()`
- `installIssueTemplates()`
- `verify()`
- `endsWith()`
- `error()`
- `exit()`
- `keys()`
- `restoreUserData()`


## Side Effects

- **console**: console.log (line 1084)
- **file_system**: fs.mkdirSync (line 1095)
- **file_system**: fs.existsSync (line 1100)
- **file_system**: fs.existsSync (line 1105)
- **file_system**: fs.readdirSync (line 1105)
- **console**: console.log (line 1106)
- **file_system**: fs.mkdirSync (line 1112)
- **file_system**: fs.existsSync (line 1117)
- **file_system**: fs.readFileSync (line 1118)
- **file_system**: fs.writeFileSync (line 1122)
- **console**: console.log (line 1124)
- **file_system**: fs.existsSync (line 1135)
- **file_system**: fs.copyFileSync (line 1136)
- **console**: console.log (line 1138)
- **file_system**: fs.writeFileSync (line 1145)
- **console**: console.log (line 1147)
- **console**: console.log (line 1156)
- **file_system**: fs.existsSync (line 1165)
- **file_system**: fs.mkdirSync (line 1166)
- **console**: console.log (line 1171)
- **console**: console.log (line 1174)
- **file_system**: fs.readdirSync (line 1178)
- **file_system**: fs.statSync (line 1181)
- **file_system**: fs.existsSync (line 1186)
- **file_system**: fs.statSync (line 1187)
- **console**: console.log (line 1189)
- **console**: console.log (line 1193)
- **file_system**: fs.existsSync (line 1203)
- **file_system**: fs.existsSync (line 1204)
- **file_system**: fs.mkdirSync (line 1205)
- **file_system**: fs.copyFileSync (line 1206)
- **console**: console.log (line 1208)
- **console**: console.log (line 1213)
- **console**: console.log (line 1219)
- **file_system**: fs.readdirSync (line 1227)
- **file_system**: fs.readdirSync (line 1229)
- **console**: console.log (line 1231)
- **console**: console.error (line 1233)
- **console**: console.error (line 1234)
- **console**: console.log (line 1235)
- **console**: console.error (line 1239)
- **console**: console.log (line 1248)


## Complexity Analysis

- Cyclomatic complexity: 26
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
- ❓ Complexity 26 but no documentation
- ❓ Dependencies used but purpose unclear

