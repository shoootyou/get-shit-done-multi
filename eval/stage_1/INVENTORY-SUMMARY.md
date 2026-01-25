# Function-level Inventory Summary

**Phase 5.2 - Stage 1 Complete**

**Generated:** 2026-01-25T19:00:39.344Z

## Overview

Comprehensive function-level analysis of `bin/**` with all 5 resolved research questions applied.

## Research Questions Applied

This analysis incorporated 5 resolved research questions as concrete implementation:

### Question 1: Complexity Thresholds

**Resolution:** Hardcoded thresholds - Simple < 5, Moderate 5-9, Complex >= 10

**Application:**
- Simple functions: 30 (32.6%)
- Moderate functions: 21 (22.8%)
- Complex functions: 41 (44.6%)
**Impact:** Smart batching during user confirmation - simple batched, complex reviewed individually

### Question 2: Helper Function Detection

**Resolution:** 3-heuristic algorithm (scope + naming + usage), 2+ matches = helper

**Application:** Helpers automatically skipped from separate analysis (documented within parent)
**Impact:** Reduced document count, focused on meaningful functions

### Question 3: Confidence Calculation

**Resolution:** Deduction-based formula starting at 100%, minimum 30%

**Application:**
- Perfect confidence (100%): 0 functions
- Low confidence (<100%): 92 functions
**Flagged functions:**
  - getGSDVersion (85%)
  - convertAgentToSpec (85%)
  - invokeAgent (65%)
  - parseFile (95%)
  - createBackup (85%)
  - buildContext (70%)
  - calculateComplexity (70%)
  - generateCapabilityMatrix (95%)
  - classifyFunction (95%)
  - getTargetDirs (95%)
  - invokeClaude (85%)
  - getTargetDirs (95%)
  - getBoxen (75%)
  - classifyComplexity (95%)
  - calculateConfidence (85%)
  - isGSDContent (95%)
  - getAgentsPath (95%)
  - getTargetDirs (95%)
  - copyCopilotAgents (70%)
  - detectInstalledCLIs (95%)
  - detectOldStructure (95%)
  - detectCLI (70%)
  - detectIOSideEffects (70%)
  - sanitizeFunctionName (95%)
  - validate (95%)
  - extractAgentCapabilities (65%)
  - extractDocComments (85%)
  - extractDependencies (70%)
  - extractFunctions (70%)
  - validateFieldSupport (95%)
  - validateFlags (95%)
  - agentToSkill (85%)
  - indent (85%)
  - formatValue (70%)
  - generateCapabilityDocs (65%)
  - formatSupportLevel (95%)
  - transformCapabilityToJSON (95%)
  - generateAgent (50%)
  - generateAgentsFromSpecs (70%)
  - generateAnalysisDocument (70%)
  - generateFromSpec (70%)
  - generateMatrixData (50%)
  - generateMigrationReport (80%)
  - generateReport (70%)
  - generateSkillsFromSpecs (70%)
  - generateFromTemplate (95%)
  - getRecommendations (70%)
  - parseConfigDirArg (85%)
  - install (50%)
  - installAll (70%)
  - installCodex (50%)
  - installCopilot (50%)
  - showInteractiveMenu (85%)
  - main (60%)
  - mapTools (70%)
  - validateMigration (85%)
  - migrateAllAgents (70%)
  - runMigration (75%)
  - confirmMigration (85%)
  - detectAndFilterOldFlags (85%)
  - oldInstallationLogic (50%)
  - testStructuredReturn (75%)
  - measureExecutionTime (95%)
  - parseFlags (70%)
  - replaceClaudePaths (85%)
  - isWSL (85%)
  - getConfigPaths (85%)
  - promptLocation (70%)
  - analyzeSystem (85%)
  - validateReferences (85%)
  - buildCalledByMap (85%)
  - render (70%)
  - getBoxen (75%)
  - runEquivalenceTests (60%)
  - runOrchestrationValidation (60%)
  - validateSequentialSpawning (95%)
  - serializeFrontmatter (70%)
  - loadSharedFrontmatter (85%)
  - parseStructuredReturn (85%)
  - testEquivalence (60%)
  - getToolCompatibility (95%)
  - transformFields (80%)
  - preserveUserData (85%)
  - validateClaudeSpec (70%)
  - validateCodexSpec (70%)
  - validateCopilotSpec (70%)
  - validateParallelSpawning (70%)
  - validatePath (70%)
  - validateToolList (70%)
  - validateSpec (95%)
  - visit (70%)
  - warnAndConfirmCodexLocal (70%)
**Impact:** Uncertainty explicitly documented, flagged for extra user review

### Question 4: Call Site Analysis Depth

**Resolution:** Direct calls only (one level deep) in Stage 1

**Application:** All dependency graphs show immediate calls only
**Constraint:** Transitive call analysis deferred to Stage 2 (Phase 5.3)
**Impact:** Clear limitation documented, prevents over-analysis in Stage 1

### Question 5: Parser Choice

**Resolution:** @babel/parser primary, acorn fallback

**Application:** Graceful parser fallback strategy (transparent to analysis)
**Impact:** All ~54 files parsed successfully with no failures

## Summary Statistics

- **Total files analyzed:** 55
- **Total functions documented:** 92
- **Average complexity:** 13.49
- **Maximum complexity:** 247

## Next Steps

1. **Phase 5.3 (Stage 2):** Consolidation analysis using this inventory
2. **Phase 5.4 (Stage 3):** index.js function-by-function review
3. **Phase 5.5:** Execute unification plans
4. **Phase 5.6:** Codex global support
5. **Phase 5.7:** Future integration preparation

## Success Criteria ✓

- [x] All 5 research questions resolved and applied
- [x] Every function in bin/** analyzed (helpers skipped per Question 2)
- [x] Complexity metrics calculated using hardcoded thresholds (Question 1)
- [x] Confidence scores calculated via deduction formula (Question 3)
- [x] Dependencies limited to direct calls only (Question 4)
- [x] Parser fallback strategy successful (Question 5)
- [x] YAML+Markdown documents generated
- [x] Dependency graph created
- [x] Inventory summary generated
