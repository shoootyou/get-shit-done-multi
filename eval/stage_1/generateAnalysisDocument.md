---
subject: function
name: generateAnalysisDocument
source_file: doc-generator.js
source_location: bin/lib/analysis/doc-generator.js
function_count_in_file: 7
analysis_stage: 1
last_updated: '2026-01-25T18:52:31.852Z'
complexity:
  cyclomatic: 19
  nesting_depth: 2
  parameter_count: 2
depends_on:
  - basename
  - toISOString
  - push
  - forEach
  - classifyComplexityLevel
  - join
  - stringify
  - sanitizeFunctionName
  - existsSync
  - readFileSync
  - writeFileSync
called_by: []
confidence: 70%
---
# Function: generateAnalysisDocument

## Purpose

To be documented


## Signature

```javascript
function generateAnalysisDocument(functionAnalysis, outputDir)
```

## Inputs/Outputs

- **Inputs**: None documented
- **Returns**: None documented


## Dependencies

**Direct calls only** (Stage 1 - resolved Question 4):

- `basename()`
- `toISOString()`
- `push()`
- `forEach()`
- `classifyComplexityLevel()`
- `join()`
- `stringify()`
- `sanitizeFunctionName()`
- `existsSync()`
- `readFileSync()`
- `writeFileSync()`


## Side Effects

- **file_system**: fs.existsSync (line 113)
- **file_system**: fs.readFileSync (line 114)
- **file_system**: fs.writeFileSync (line 115)
- **file_system**: fs.writeFileSync (line 117)
- **file_system**: fs.writeFileSync (line 120)


## Complexity Analysis

- Cyclomatic complexity: 19
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
- ❓ Complexity 19 but no documentation
- ❓ Dependencies used but purpose unclear

