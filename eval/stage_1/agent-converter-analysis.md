---
subject: function
name: convertAgentToSpec
source_file: agent-converter.js
source_location: bin/lib/templating/agent-converter.js
function_count_in_file: 18
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.877Z'
complexity:
  cyclomatic: 5
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - existsSync
  - readFileSync
  - matter
  - keys
  - push
  - convertFrontmatter
  - assembleSpec
called_by:
  - migrateAllAgents
confidence: 85%
---
# Function: convertAgentToSpec

## Purpose

To be documented


## Signature

```javascript
function convertAgentToSpec(agentPath, param)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `existsSync()`
- `readFileSync()`
- `matter()`
- `keys()`
- `push()`
- `convertFrontmatter()`
- `assembleSpec()`


## Side Effects

- **file_system**: fs.existsSync (line 66)
- **file_system**: fs.readFileSync (line 67)


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 2
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
name: convertFrontmatter
source_file: agent-converter.js
source_location: bin/lib/templating/agent-converter.js
function_count_in_file: 18
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.877Z'
complexity:
  cyclomatic: 9
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - push
  - formatValue
  - convertTools
  - join
  - filter
  - keys
  - includes
called_by:
  - convertAgentToSpec
confidence: 85%
---
# Function: convertFrontmatter

## Purpose

To be documented


## Signature

```javascript
function convertFrontmatter(frontmatter, warnings)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `push()`
- `formatValue()`
- `convertTools()`
- `join()`
- `filter()`
- `keys()`
- `includes()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 9
- Nesting depth: 2
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
name: convertTools
source_file: agent-converter.js
source_location: bin/lib/templating/agent-converter.js
function_count_in_file: 18
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.877Z'
complexity:
  cyclomatic: 6
  nesting_depth: 3
  parameter_count: 1
depends_on:
  - trim
  - replace
  - filter
  - map
  - split
  - isArray
  - push
  - isClaudeSpecificTool
  - isSharedTool
  - toLowerCase
called_by:
  - convertFrontmatter
  - extractPlatformVariables
confidence: 85%
---
# Function: convertTools

## Purpose

To be documented


## Signature

```javascript
function convertTools(tools)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `trim()`
- `replace()`
- `filter()`
- `map()`
- `split()`
- `isArray()`
- `push()`
- `isClaudeSpecificTool()`
- `isSharedTool()`
- `toLowerCase()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 6
- Nesting depth: 3
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
name: isClaudeSpecificTool
source_file: agent-converter.js
source_location: bin/lib/templating/agent-converter.js
function_count_in_file: 18
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.878Z'
complexity:
  cyclomatic: 2
  nesting_depth: 1
  parameter_count: 1
depends_on:
  - some
  - endsWith
  - startsWith
  - slice
called_by:
  - convertTools
confidence: 85%
---
# Function: isClaudeSpecificTool

## Purpose

To be documented


## Signature

```javascript
function isClaudeSpecificTool(tool)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `some()`
- `endsWith()`
- `startsWith()`
- `slice()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 2
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
name: isSharedTool
source_file: agent-converter.js
source_location: bin/lib/templating/agent-converter.js
function_count_in_file: 18
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.878Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 1
depends_on:
  - some
  - toLowerCase
called_by:
  - convertTools
  - extractPlatformVariables
confidence: 95%
---
# Function: isSharedTool

## Purpose

To be documented


## Signature

```javascript
function isSharedTool(tool)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `some()`
- `toLowerCase()`


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
name: assembleSpec
source_file: agent-converter.js
source_location: bin/lib/templating/agent-converter.js
function_count_in_file: 18
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.878Z'
complexity:
  cyclomatic: 1
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - push
  - trim
  - join
called_by:
  - convertAgentToSpec
confidence: 95%
---
# Function: assembleSpec

## Purpose

To be documented


## Signature

```javascript
function assembleSpec(frontmatterLines, body)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `push()`
- `trim()`
- `join()`


## Side Effects

None detected


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
name: extractPlatformVariables
source_file: agent-converter.js
source_location: bin/lib/templating/agent-converter.js
function_count_in_file: 18
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.879Z'
complexity:
  cyclomatic: 5
  nesting_depth: 3
  parameter_count: 1
depends_on:
  - matter
  - convertTools
  - filter
  - isSharedTool
  - keys
  - includes
  - push
called_by: []
confidence: 85%
---
# Function: extractPlatformVariables

## Purpose

To be documented


## Signature

```javascript
function extractPlatformVariables(agentContent)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `matter()`
- `convertTools()`
- `filter()`
- `isSharedTool()`
- `keys()`
- `includes()`
- `push()`


## Side Effects

None detected


## Complexity Analysis

- Cyclomatic complexity: 5
- Nesting depth: 3
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
name: wrapWithConditionals
source_file: agent-converter.js
source_location: bin/lib/templating/agent-converter.js
function_count_in_file: 18
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.881Z'
complexity:
  cyclomatic: 2
  nesting_depth: 0
  parameter_count: 2
depends_on:
  - toLowerCase
called_by: []
confidence: 95%
---
# Function: wrapWithConditionals

## Purpose

To be documented


## Signature

```javascript
function wrapWithConditionals(content, platform)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `toLowerCase()`


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

