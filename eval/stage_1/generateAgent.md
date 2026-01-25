---
subject: function
name: generateAgent
source_file: generator.js
source_location: bin/lib/templating/generator.js
function_count_in_file: 23
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.892Z'
complexity:
  cyclomatic: 50
  nesting_depth: 8
  parameter_count: 3
depends_on:
  - require
  - cwd
  - isAbsolute
  - resolve
  - existsSync
  - readFileSync
  - buildContext
  - render
  - parseSpecString
  - dump
  - validate
  - map
  - filter
  - split
  - trim
  - isArray
  - validateToolList
  - forEach
  - match
  - push
  - mapTools
  - transformFields
  - addPlatformMetadata
  - String
  - validateSpec
  - serializeFrontmatter
  - checkPromptLength
called_by:
  - oldInstallationLogic
  - generateAgentsFromSpecs
  - generateSkillsFromSpecs
confidence: 50%
---
# Function: generateAgent

## Purpose

To be documented


## Signature

```javascript
function generateAgent(specPath, platform, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `require()`
- `cwd()`
- `isAbsolute()`
- `resolve()`
- `existsSync()`
- `readFileSync()`
- `buildContext()`
- `render()`
- `parseSpecString()`
- `dump()`
- `validate()`
- `map()`
- `filter()`
- `split()`
- `trim()`
- `isArray()`
- `validateToolList()`
- `forEach()`
- `match()`
- `push()`
- `mapTools()`
- `transformFields()`
- `addPlatformMetadata()`
- `String()`
- `validateSpec()`
- `serializeFrontmatter()`
- `checkPromptLength()`


## Side Effects

- **file_system**: fs.existsSync (line 141)
- **file_system**: fs.readFileSync (line 145)


## Complexity Analysis

- Cyclomatic complexity: 50
- Nesting depth: 8
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
- ❓ Complexity 50 but no documentation
- ❓ Dependencies used but purpose unclear

