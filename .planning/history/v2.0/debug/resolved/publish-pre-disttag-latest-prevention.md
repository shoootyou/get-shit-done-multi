---
status: resolved
trigger: "publish-pre-disttag-latest-prevention

**Summary:** The publish-pre script should NEVER publish as 'latest' tag, but currently has logic that determines dist-tag based on version which could allow latest. Additionally, npm publish --dry-run is failing because it requires explicit --tag for prerelease versions."
created: 2025-01-15T00:00:00Z
updated: 2025-01-15T00:15:00Z
---

## Current Focus

hypothesis: CONFIRMED - Lines 170-177 have conditional logic that publishes stable versions as 'latest', and line 158 npm publish --dry-run is missing --tag flag
test: Found exact problematic code in scripts/publish-pre.sh
expecting: Will apply fix to remove 'latest' option and add --tag to dry-run
next_action: Apply fix to hardcode dist-tag extraction from version and add --tag flag to dry-run

## Symptoms

expected: Script should never publish as 'latest' - always use a non-latest dist-tag (like 'beta'). GitHub Actions should handle 'latest' releases.
actual: Script has "# Determine dist-tag based on version" logic that could potentially publish as latest. Also npm publish --dry-run fails with error requiring --tag.
errors: 
```
[8/9] Running npm publish --dry-run...
npm error You must specify a tag using --tag when publishing a prerelease version.
npm error A complete log of this run can be found in: /Users/rodolfo/.npm/_logs/2026-02-01T15_26_52_689Z-debug-0.log
❌ Dry-run failed
```
reproduction: Run `npm run publish-pre 2.0.0-beta.1` - fails at step 8/9 with npm error
started: Just discovered. Script design should prevent 'latest' publication entirely.

## Eliminated

## Evidence

- timestamp: 2025-01-15T00:01:00Z
  checked: scripts/publish-pre.sh lines 170-177
  found: Conditional dist-tag logic that sets DIST_TAG="latest" for stable versions (line 175)
  implication: Script CAN publish as 'latest', violating design requirement

- timestamp: 2025-01-15T00:01:30Z
  checked: scripts/publish-pre.sh line 158
  found: npm publish --dry-run without --tag flag
  implication: Causes error "You must specify a tag using --tag when publishing a prerelease version"

- timestamp: 2025-01-15T00:02:00Z
  checked: Script design intent
  found: Script is named "publish-pre" and should only handle pre-releases, NOT stable versions
  implication: The else clause (lines 175-176) that handles stable versions should never execute in correct usage

- timestamp: 2025-01-15T00:10:00Z
  checked: npm run publish-pre 2.0.0-beta.1 after fix
  found: Succeeds with "Publishing to https://registry.npmjs.org/ with tag beta and default access (dry-run)"
  implication: Fix successfully adds --tag flag and extracts correct dist-tag

- timestamp: 2025-01-15T00:11:00Z
  checked: npm run publish-pre 2.0.0 after fix
  found: Properly rejects with "❌ Version 2.0.0 is not a pre-release"
  implication: Fix successfully prevents stable versions from being published

- timestamp: 2025-01-15T00:12:00Z
  checked: Dist-tag extraction for rc, alpha, beta versions
  found: All extract correctly (rc→rc, alpha→alpha, beta→beta)
  implication: Fix works for all common prerelease tag formats

## Resolution

root_cause: Two issues found - (1) Lines 170-177 contain conditional logic that sets DIST_TAG="latest" for stable versions, allowing the script to publish as 'latest' which violates design requirement. (2) Line 158 npm publish --dry-run missing --tag flag, causing error for prerelease versions.
fix: Applied minimal fix - (1) Changed step 8 to extract dist-tag from version suffix (e.g., "beta" from "2.0.0-beta.1") and reject stable versions with error message. (2) Added --tag flag to npm publish --dry-run command. (3) Removed redundant dist-tag logic in step 9 since it's already extracted in step 8.
verification: VERIFIED - (1) npm run publish-pre 2.0.0-beta.1 succeeds with "Publishing to https://registry.npmjs.org/ with tag beta". (2) npm run publish-pre 2.0.0 properly rejects with "Version 2.0.0 is not a pre-release" error. (3) Dist-tag extraction tested for beta, alpha, and rc versions - all work correctly.
files_changed: [scripts/publish-pre.sh]
