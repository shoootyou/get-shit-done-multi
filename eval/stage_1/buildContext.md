---
subject: function
name: buildContext
source_file: context-builder.js
source_location: bin/lib/templating/context-builder.js
function_count_in_file: 10
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.882Z'
complexity:
  cyclomatic: 12
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - includes
  - join
  - getConfigPaths
  - getAgentsPath
  - getSkillsPath
  - getGsdPath
  - getGsdPathRef
  - cwd
  - getPlatformCapabilities
  - getCommandPrefix
called_by:
  - oldInstallationLogic
  - copyWithPathReplacement
  - generateAgent
  - generateFromSpec
  - generateFromTemplate
confidence: 70%
---
# Function: buildContext

## Purpose

To be documented


## Signature

```javascript
function buildContext(platform, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `includes()`
- `join()`
- `getConfigPaths()`
- `getAgentsPath()`
- `getSkillsPath()`
- `getGsdPath()`
- `getGsdPathRef()`
- `cwd()`
- `getPlatformCapabilities()`
- `getCommandPrefix()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 12
- Nesting depth: 2
- Parameter count: 2
- Classification: Complex


## Analysis Confidence

**Confidence:** 70%

**Deductions:**

- **-5%**: No JSDoc documentation
- **-15%**: Complex control flow without documentation
- **-10%**: External dependencies without clear purpose

**Reasons:**

- ❓ Missing JSDoc comments
- ❓ Complexity 12 but no documentation
- ❓ Dependencies used but purpose unclear

