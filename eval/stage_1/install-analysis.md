---
subject: function
name: parseConfigDirArg
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.834Z'
complexity:
  cyclomatic: 7
  nesting_depth: 2
  parameter_count: 0
depends_on:
  - findIndex
  - startsWith
  - error
  - exit
  - find
  - split
called_by: []
confidence: 85%
---
# Function: parseConfigDirArg

## Purpose

To be documented


## Signature

```javascript
function parseConfigDirArg()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `findIndex()`
- `startsWith()`
- `error()`
- `exit()`
- `find()`
- `split()`


## Side Effects

- **console**: console.error (line 59)


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 2
- Parameter count: 0
- Classification: Moderate


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear


---

---
subject: function
name: parseProjectDirArg
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.836Z'
complexity:
  cyclomatic: 5
  nesting_depth: 2
  parameter_count: 0
depends_on:
  - findIndex
  - startsWith
  - error
  - exit
  - find
  - split
called_by: []
confidence: 85%
---
# Function: parseProjectDirArg

## Purpose

To be documented


## Signature

```javascript
function parseProjectDirArg()
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `findIndex()`
- `startsWith()`
- `error()`
- `exit()`
- `find()`
- `split()`


## Side Effects

- **console**: console.error (line 79)


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 2
- Parameter count: 0
- Classification: Moderate


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear


---

---
subject: function
name: validateAndPrepareInstall
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.838Z'
complexity:
  cyclomatic: 7
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - getConfigPaths
  - validatePath
  - join
  - analyzeInstallationConflicts
  - cleanupGSDContent
  - log
  - ensureInstallDir
called_by:
  - main
confidence: 85%
---
# Function: validateAndPrepareInstall

## Purpose

To be documented


## Signature

```javascript
function validateAndPrepareInstall(platform, finalScope)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `getConfigPaths()`
- `validatePath()`
- `join()`
- `analyzeInstallationConflicts()`
- `cleanupGSDContent()`
- `log()`
- `ensureInstallDir()`


## Side Effects

- **console**: console.log (line 258)


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 1
- Parameter count: 2
- Classification: Moderate


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear


---

---
subject: function
name: expandTilde
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.839Z'
complexity:
  cyclomatic: 3
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - startsWith
  - join
  - homedir
  - slice
called_by:
  - oldInstallationLogic
  - promptLocation
confidence: 85%
---
# Function: expandTilde

## Purpose

To be documented


## Signature

```javascript
function expandTilde(filePath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `startsWith()`
- `join()`
- `homedir()`
- `slice()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 1
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear


---

---
subject: function
name: readSettings
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.839Z'
complexity:
  cyclomatic: 3
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - existsSync
  - parse
  - readFileSync
called_by:
  - oldInstallationLogic
  - install
confidence: 95%
---
# Function: readSettings

## Purpose

To be documented


## Signature

```javascript
function readSettings(settingsPath)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `existsSync()`
- `parse()`
- `readFileSync()`


## Side Effects

- **file_system**: fs.existsSync (line 400)
- **file_system**: fs.readFileSync (line 402)


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 2
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: writeSettings
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.840Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - writeFileSync
  - stringify
called_by:
  - oldInstallationLogic
  - finishInstall
confidence: 95%
---
# Function: writeSettings

## Purpose

To be documented


## Signature

```javascript
function writeSettings(settingsPath, settings)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `writeFileSync()`
- `stringify()`


## Side Effects

- **file_system**: fs.writeFileSync (line 414)


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
- Parameter count: 2
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: copyWithPathReplacement
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.840Z'
complexity:
  cyclomatic: 6
  nesting_depth: 3
  parameter_count: 5
depends_on:
  - existsSync
  - rmSync
  - mkdirSync
  - readdirSync
  - join
  - match
  - isDirectory
  - copyWithPathReplacement
  - endsWith
  - readFileSync
  - buildContext
  - render
  - convertContent
  - writeFileSync
  - copyFileSync
called_by:
  - oldInstallationLogic
  - copyWithPathReplacement
  - install
  - installCopilot
  - installCodex
confidence: 85%
---
# Function: copyWithPathReplacement

## Purpose

To be documented


## Signature

```javascript
function copyWithPathReplacement(srcDir, destDir, adapter, param, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `existsSync()`
- `rmSync()`
- `mkdirSync()`
- `readdirSync()`
- `join()`
- `match()`
- `isDirectory()`
- `copyWithPathReplacement()`
- `endsWith()`
- `readFileSync()`
- `buildContext()`
- `render()`
- `convertContent()`
- `writeFileSync()`
- `copyFileSync()`


## Side Effects

- **file_system**: fs.existsSync (line 424)
- **file_system**: fs.rmSync (line 425)
- **file_system**: fs.mkdirSync (line 427)
- **file_system**: fs.readdirSync (line 429)
- **file_system**: fs.readFileSync (line 443)
- **file_system**: fs.writeFileSync (line 453)
- **file_system**: fs.copyFileSync (line 455)


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 3
- Parameter count: 5
- Classification: Moderate


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear


---

---
subject: function
name: cleanupOrphanedFiles
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.842Z'
complexity:
  cyclomatic: 3
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - join
  - existsSync
  - unlinkSync
  - log
called_by:
  - oldInstallationLogic
  - install
confidence: 85%
---
# Function: cleanupOrphanedFiles

## Purpose

To be documented


## Signature

```javascript
function cleanupOrphanedFiles(claudeDir)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `existsSync()`
- `unlinkSync()`
- `log()`


## Side Effects

- **file_system**: fs.existsSync (line 607)
- **file_system**: fs.unlinkSync (line 608)
- **console**: console.log (line 609)


## Complexity Analysis

- Cyclomatic complexity: 3
- Nesting depth: 2
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 85%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear


---

---
subject: function
name: cleanupOrphanedHooks
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.842Z'
complexity:
  cyclomatic: 9
  nesting_depth: 5
  parameter_count: 1
depends_on:
  - keys
  - isArray
  - filter
  - some
  - includes
  - log
called_by:
  - oldInstallationLogic
  - install
confidence: 85%
---
# Function: cleanupOrphanedHooks

## Purpose

To be documented


## Signature

```javascript
function cleanupOrphanedHooks(settings)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `keys()`
- `isArray()`
- `filter()`
- `some()`
- `includes()`
- `log()`


## Side Effects

- **console**: console.log (line 649)


## Complexity Analysis

- Cyclomatic complexity: 9
- Nesting depth: 5
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


---

---
subject: function
name: verifyInstalled
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.843Z'
complexity:
  cyclomatic: 4
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - existsSync
  - error
  - readdirSync
called_by:
  - oldInstallationLogic
  - install
  - installCopilot
  - installCodex
confidence: 95%
---
# Function: verifyInstalled

## Purpose

To be documented


## Signature

```javascript
function verifyInstalled(dirPath, description)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `existsSync()`
- `error()`
- `readdirSync()`


## Side Effects

- **file_system**: fs.existsSync (line 659)
- **console**: console.error (line 660)
- **file_system**: fs.readdirSync (line 664)
- **console**: console.error (line 666)
- **console**: console.error (line 670)


## Complexity Analysis

- Cyclomatic complexity: 4
- Nesting depth: 2
- Parameter count: 2
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: verifyFileInstalled
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.843Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 2
depends_on:
  - existsSync
  - error
called_by:
  - oldInstallationLogic
  - install
  - installCopilot
  - installCodex
confidence: 95%
---
# Function: verifyFileInstalled

## Purpose

To be documented


## Signature

```javascript
function verifyFileInstalled(filePath, description)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `existsSync()`
- `error()`


## Side Effects

- **file_system**: fs.existsSync (line 680)
- **console**: console.error (line 681)


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 1
- Parameter count: 2
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: installIssueTemplates
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.844Z'
complexity:
  cyclomatic: 5
  nesting_depth: 2
  parameter_count: 1
depends_on:
  - join
  - existsSync
  - mkdirSync
  - readdirSync
  - isFile
  - startsWith
  - copyFileSync
called_by:
  - oldInstallationLogic
  - installCopilot
confidence: 85%
---
# Function: installIssueTemplates

## Purpose

To be documented


## Signature

```javascript
function installIssueTemplates(projectDir)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `join()`
- `existsSync()`
- `mkdirSync()`
- `readdirSync()`
- `isFile()`
- `startsWith()`
- `copyFileSync()`


## Side Effects

- **file_system**: fs.existsSync (line 689)
- **file_system**: fs.mkdirSync (line 693)
- **file_system**: fs.readdirSync (line 694)
- **file_system**: fs.copyFileSync (line 704)


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 2
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


---

---
subject: function
name: yamlEscape
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.844Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - replace
  - String
called_by:
  - oldInstallationLogic
  - copyCopilotAgents
confidence: 95%
---
# Function: yamlEscape

## Purpose

To be documented


## Signature

```javascript
function yamlEscape(value)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `replace()`
- `String()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 1
- Nesting depth: 0
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: parseFrontMatter
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.844Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - match
  - slice
called_by:
  - oldInstallationLogic
  - copyCopilotAgents
confidence: 95%
---
# Function: parseFrontMatter

## Purpose

To be documented


## Signature

```javascript
function parseFrontMatter(content)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `match()`
- `slice()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 1
- Parameter count: 1
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: getFrontMatterValue
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.844Z'
complexity:
  cyclomatic: 2
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - match
  - trim
called_by:
  - oldInstallationLogic
  - copyCopilotAgents
confidence: 95%
---
# Function: getFrontMatterValue

## Purpose

To be documented


## Signature

```javascript
function getFrontMatterValue(frontMatter, key)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `match()`
- `trim()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 0
- Parameter count: 2
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: finishInstall
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.846Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 4
depends_on:
  - log
  - writeSettings
called_by:
  - oldInstallationLogic
  - installAll
  - promptLocation
confidence: 95%
---
# Function: finishInstall

## Purpose

To be documented


## Signature

```javascript
function finishInstall(settingsPath, settings, statuslineCommand, shouldInstallStatusline)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `log()`
- `writeSettings()`


## Side Effects

- **console**: console.log (line 1473)
- **console**: console.log (line 1479)


## Complexity Analysis

- Cyclomatic complexity: 2
- Nesting depth: 1
- Parameter count: 4
- Classification: Simple


## Analysis Confidence

**Confidence:** 95%

**Deductions:**

- **-5%**: No JSDoc documentation

**Reasons:**

- ❓ Missing JSDoc comments


---

---
subject: function
name: handleStatusline
source_file: install.js
source_location: bin/install.js
function_count_in_file: 82
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.847Z'
complexity:
  cyclomatic: 7
  nesting_depth: 1
  parameter_count: 3
depends_on:
  - callback
  - log
  - createInterface
  - question
  - close
  - trim
called_by:
  - oldInstallationLogic
  - promptLocation
confidence: 75%
---
# Function: handleStatusline

## Purpose

To be documented


## Signature

```javascript
function handleStatusline(settings, isInteractive, callback)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `callback()`
- `log()`
- `createInterface()`
- `question()`
- `close()`
- `trim()`


## Side Effects

- **console**: console.log (line 1632)
- **console**: console.log (line 1633)
- **console**: console.log (line 1634)
- **process_io**: process.stdout (line 1644)
- **console**: console.log (line 1647)


## Complexity Analysis

- Cyclomatic complexity: 7
- Nesting depth: 1
- Parameter count: 3
- Classification: Moderate


## Analysis Confidence

**Confidence:** 75%

**Deductions:**

- **-10%**: Unclear or generic function name
- **-5%**: No JSDoc documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Name "handleStatusline" is generic or unclear
- ❓ Missing JSDoc comments
- ❓ Dependencies used but purpose unclear

