---
phase: 02-codebase-mapping-enhancement
plan: 02
subsystem: codebase-mapping
tags: [metrics, tree-visualization, codebase-analysis]

requires:
  - phase: 02
    plan: 01
    reason: builds on codebase exclusion pattern foundation

provides:
  - metrics: directory tree visualization in STRUCTURE.md
  - metrics: file counts and LOC metrics in all codebase documents
  - metrics: aggregate metrics display in map-codebase workflow summary

affects:
  - future: codebase mapping now provides quantitative insights for planning

tech-stack:
  added: []
  patterns:
    - bash-metrics: find + wc -l for file/line counts
    - tree-command: tree with exclusion patterns (-I flag)
    - grep-metrics: grep for TODO/FIXME counting

key-files:
  created: []
  modified:
    - agents/gsd-codebase-mapper.md: Added tree visualization and metrics collection to all focus areas
    - get-shit-done/workflows/map-codebase.md: Added aggregate metrics to completion summary

decisions:
  - id: tree-fallback
    what: Use tree command with find fallback for directory visualization
    why: tree provides cleaner output but may not be installed everywhere
    impact: STRUCTURE.md shows visual directory tree when available
    
  - id: metrics-in-templates
    what: Add metrics sections to all document templates after Analysis Date
    why: Provides consistent quantitative context across all codebase documents
    impact: Each document now includes scope metrics (files, LOC, test counts, etc.)
    
  - id: infrastructure-exclusions
    what: Exclude .claude, .github, .codex, node_modules, .git, dist, build, out, target, coverage from all metrics
    why: Metrics should reflect application code only, not infrastructure or generated artifacts
    impact: All metrics commands consistently use same exclusion patterns

metrics:
  duration: 7 min
  completed: 2026-01-20

---

# Phase 02 Plan 02: Metrics & Tree Visualization Summary

**One-liner:** Added directory tree visualization and comprehensive metrics collection (file counts, LOC, test coverage) to all codebase mapping documents with consistent infrastructure exclusions

## What Was Built

### 1. Tree Visualization in STRUCTURE.md
- Added `tree` command to arch focus exploration with exclusion patterns
- Updated STRUCTURE.md template with:
  - Codebase Metrics section before Directory Layout
  - Directory tree placeholder using actual tree command output
  - Note about exclusions applied
- Fallback to `find` command when tree not available

### 2. Metrics Collection in All Documents
Added metrics sections to all document templates:
- **STACK.md**: Codebase Size (files analyzed, LOC)
- **ARCHITECTURE.md**: Scope (source files, primary language, LOC)
- **STRUCTURE.md**: Codebase Metrics (total files, source files, test files, LOC breakdown)
- **CONVENTIONS.md**: Analysis Scope (files reviewed, test files)
- **TESTING.md**: Test Coverage (test files, source files, test ratio)
- **CONCERNS.md**: Analysis Scope (files scanned, TODO/FIXME count, large files >500 LOC)

### 3. Metrics Collection Commands
Added bash commands to each focus area:
- **Tech focus**: File count using find + wc -l
- **Arch focus**: File counts, test counts, total LOC using find + wc -l + xargs
- **Quality focus**: Source and test file counts with exclusions
- **Concerns focus**: TODO/FIXME count using grep + wc -l, large file count using awk

### 4. Workflow Summary Enhancement
Updated map-codebase.md workflow:
- verify_output step now extracts metrics from STRUCTURE.md
- offer_next step displays:
  - Codebase Metrics table (files analyzed, LOC, test files)
  - Documents created list with line counts
  - Excluded from analysis section
  - Note that metrics reflect application code only

## Technical Implementation

### Commands Added

**Tree generation:**
```bash
tree -L 3 -I 'node_modules|.git|.github|.claude|.codex|dist|build|out|target|coverage' --charset ascii 2>/dev/null || \
  find . -type d [exclusions...] | head -100
```

**File counting:**
```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  -not -path '*/node_modules/*' [more exclusions...] | wc -l
```

**LOC counting:**
```bash
find . -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) \
  [exclusions...] | xargs wc -l 2>/dev/null | tail -1
```

**TODO counting:**
```bash
grep -r "TODO\|FIXME\|HACK" . --include="*.ts" --include="*.js" \
  --exclude-dir={node_modules,...} | wc -l
```

**Large file detection:**
```bash
find . -type f \( -name "*.ts" -o -name "*.js" \) \
  [exclusions...] | xargs wc -l 2>/dev/null | awk '$1 > 500' | wc -l
```

### Exclusion Pattern Consistency
All metrics commands exclude:
- **Infrastructure**: .claude, .github, .codex, node_modules, .git
- **Build artifacts**: dist, build, out, target, coverage

Applied via:
- `tree -I` flag: pipe-separated pattern list
- `find -not -path`: multiple path patterns
- `grep --exclude-dir`: brace-enclosed pattern list

## Decisions Made

### 1. Tree Command with Find Fallback
**Decision:** Use `tree` as primary tool, `find` as fallback
**Rationale:** 
- tree provides cleaner, more readable output
- Not all systems have tree installed
- find is ubiquitous and provides acceptable alternative
**Impact:** STRUCTURE.md includes visual directory tree when possible

### 2. Metrics After Analysis Date
**Decision:** Place metrics section immediately after "Analysis Date" in all templates
**Rationale:**
- Establishes scope before diving into details
- Consistent location across all documents
- Metrics provide quantitative context for qualitative analysis
**Impact:** All codebase documents now start with quantitative scope

### 3. Infrastructure Exclusion Consistency
**Decision:** Use identical exclusion patterns across all metrics commands
**Rationale:**
- Consistent metrics across documents
- Reflects application code only
- Avoids inflated metrics from dependencies/artifacts
**Impact:** Metrics are directly comparable across different document types

### 4. Multiple Metrics Per Document Type
**Decision:** Tailor metrics to each document's purpose
**Rationale:**
- TESTING.md needs test coverage ratio
- CONCERNS.md needs TODO count and large file count
- STACK.md just needs overall size
- Each metric serves the document's specific analysis
**Impact:** Each document includes relevant quantitative insights

## Files Modified

### agents/gsd-codebase-mapper.md
- Added tree command and metrics collection to arch focus exploration (lines 141-175)
- Updated STRUCTURE.md template with Codebase Metrics section (lines 522-544)
- Updated STACK.md template with Codebase Size metrics (lines 315-318)
- Updated ARCHITECTURE.md template with Scope metrics (lines 470-473)
- Updated CONVENTIONS.md template with Analysis Scope metrics (lines 631-633)
- Updated TESTING.md template with Test Coverage metrics (lines 744-747)
- Updated CONCERNS.md template with Analysis Scope metrics (lines 859-862)
- Added metrics collection commands to tech focus (lines 137-148)
- Added metrics collection commands to quality focus (lines 264-295)
- Added metrics collection commands to concerns focus (lines 316-329)

### get-shit-done/workflows/map-codebase.md
- Updated verify_output step to extract metrics from STRUCTURE.md (line 235)
- Updated offer_next output format with Codebase Metrics table (lines 279-282)
- Added "Excluded from analysis" section (lines 290-291)
- Added clarification note about metrics (line 293)

## Deviations from Plan

None - plan executed exactly as written.

## Test Results

### Verification Commands Passed
✓ Tree command present in arch focus
✓ Codebase Metrics section in STRUCTURE.md template
✓ All 7 document templates (STACK, INTEGRATIONS, ARCHITECTURE, STRUCTURE, CONVENTIONS, TESTING, CONCERNS) have template entries
✓ Metrics commands present with infrastructure exclusions (9 wc -l commands found)
✓ Large files awk command present
✓ Workflow includes metrics extraction and display

### Success Criteria Met
✓ STRUCTURE.md template includes Codebase Metrics section and tree visualization placeholder
✓ Tree command in arch focus uses exclusion patterns (-I flag)
✓ All document templates include metrics sections
✓ Exploration commands for each focus collect relevant metrics
✓ Workflow verify_output and offer_next steps extract and display aggregate metrics
✓ All metrics commands exclude infrastructure directories
✓ Requirements MAP-09 (tree visualization) and MAP-10 (metrics) satisfied

## Commits

1. **469017f** - feat(02-02): add tree visualization and metrics to arch focus
   - Added tree command with exclusion patterns
   - Updated STRUCTURE.md template with metrics section
   - Added metrics collection commands to arch focus

2. **ccb652a** - feat(02-02): add metrics collection to all focus areas
   - Added metrics sections to all document templates
   - Added metrics collection commands to tech, quality, and concerns focus areas

3. **9a884ab** - feat(02-02): add aggregate metrics to workflow summary
   - Updated workflow to extract and display codebase metrics
   - Added exclusion clarification to completion summary

## Next Phase Readiness

### Ready for Phase 03
This enhancement is complete and ready for use. The codebase mapping system now:
- Provides quantitative insights (file counts, LOC, test coverage)
- Shows visual directory structure in STRUCTURE.md
- Displays aggregate metrics in workflow summary
- Consistently excludes infrastructure from all metrics

### No Blockers
No issues or concerns identified.

### Integration Points
- Future phases using `/gsd:map-codebase` will automatically benefit from enhanced metrics
- No changes needed to other GSD commands
- Metrics are informational only and don't affect planning/execution logic

---

*Completed: 2026-01-20 • Duration: 7 min*
