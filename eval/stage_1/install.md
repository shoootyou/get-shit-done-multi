---
subject: function
name: install
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.845Z'
complexity:
  cyclomatic: 51
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
  - cleanupOrphanedFiles
  - mkdirSync
  - existsSync
  - copyWithPathReplacement
  - readdirSync
  - push
  - startsWith
  - endsWith
  - unlinkSync
  - generateAgentsFromSpecs
  - generateSkillsFromSpecs
  - forEach
  - filter
  - isDirectory
  - statSync
  - toFixed
  - isFile
  - readFileSync
  - convertContent
  - writeFileSync
  - verifyInstalled
  - require
  - generateFromTemplate
  - verifyFileInstalled
  - copyFileSync
  - verify
  - error
  - exit
  - cleanupOrphanedHooks
  - readSettings
  - some
  - includes
  - keys
  - restoreUserData
called_by:
  - oldInstallationLogic
  - installAll
  - promptLocation
confidence: 50%
---
# Function: install

## Purpose

To be documented


## Signature

```javascript
function install(isGlobal, param, param)
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
- `cleanupOrphanedFiles()`
- `mkdirSync()`
- `existsSync()`
- `copyWithPathReplacement()`
- `readdirSync()`
- `push()`
- `startsWith()`
- `endsWith()`
- `unlinkSync()`
- `generateAgentsFromSpecs()`
- `generateSkillsFromSpecs()`
- `forEach()`
- `filter()`
- `isDirectory()`
- `statSync()`
- `toFixed()`
- `isFile()`
- `readFileSync()`
- `convertContent()`
- `writeFileSync()`
- `verifyInstalled()`
- `require()`
- `generateFromTemplate()`
- `verifyFileInstalled()`
- `copyFileSync()`
- `verify()`
- `error()`
- `exit()`
- `cleanupOrphanedHooks()`
- `readSettings()`
- `some()`
- `includes()`
- `keys()`
- `restoreUserData()`


## Side Effects

- **console**: console.log (line 822)
- **file_system**: fs.mkdirSync (line 837)
- **file_system**: fs.existsSync (line 842)
- **file_system**: fs.existsSync (line 847)
- **file_system**: fs.readdirSync (line 847)
- **console**: console.log (line 848)
- **file_system**: fs.existsSync (line 855)
- **file_system**: fs.mkdirSync (line 857)
- **file_system**: fs.existsSync (line 858)
- **file_system**: fs.readdirSync (line 859)
- **file_system**: fs.unlinkSync (line 861)
- **console**: console.log (line 870)
- **file_system**: fs.existsSync (line 879)
- **console**: console.log (line 883)
- **console**: console.log (line 887)
- **console**: console.log (line 892)
- **file_system**: fs.readdirSync (line 896)
- **file_system**: fs.statSync (line 899)
- **file_system**: fs.existsSync (line 904)
- **file_system**: fs.statSync (line 905)
- **console**: console.log (line 907)
- **file_system**: fs.existsSync (line 919)
- **file_system**: fs.mkdirSync (line 920)
- **file_system**: fs.readdirSync (line 923)
- **file_system**: fs.existsSync (line 928)
- **file_system**: fs.readFileSync (line 929)
- **file_system**: fs.writeFileSync (line 931)
- **console**: console.log (line 936)
- **file_system**: fs.mkdirSync (line 944)
- **file_system**: fs.existsSync (line 949)
- **file_system**: fs.readFileSync (line 950)
- **file_system**: fs.writeFileSync (line 954)
- **console**: console.log (line 956)
- **file_system**: fs.existsSync (line 967)
- **file_system**: fs.copyFileSync (line 968)
- **console**: console.log (line 970)
- **file_system**: fs.writeFileSync (line 978)
- **console**: console.log (line 980)
- **file_system**: fs.existsSync (line 987)
- **file_system**: fs.mkdirSync (line 989)
- **file_system**: fs.readdirSync (line 990)
- **file_system**: fs.copyFileSync (line 994)
- **console**: console.log (line 997)
- **file_system**: fs.readdirSync (line 1009)
- **file_system**: fs.statSync (line 1012)
- **file_system**: fs.readdirSync (line 1014)
- **console**: console.log (line 1016)
- **console**: console.error (line 1018)
- **console**: console.error (line 1019)
- **console**: console.log (line 1020)
- **console**: console.error (line 1025)
- **console**: console.error (line 1026)
- **console**: console.log (line 1062)


## Complexity Analysis

- Cyclomatic complexity: 51
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
- ❓ Complexity 51 but no documentation
- ❓ Dependencies used but purpose unclear

