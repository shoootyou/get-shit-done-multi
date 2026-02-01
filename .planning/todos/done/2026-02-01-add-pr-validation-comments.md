---
created: 2026-02-01T17:41
title: Add PR comments for validation results
area: tooling
files:
  - .github/workflows/pr-validation.yml
---

## Problem

The PR validation workflow runs tests and tarball validation but doesn't post a comment to the PR with the results. Users have to click into the Actions tab to see what passed or failed. This creates friction in the review process.

Current behavior:
- Workflow runs silently
- Success/failure only visible in checks
- No summary in PR conversation

Desired behavior:
- Automatic comment on PR when validation completes
- Success: Brief summary of what passed
- Failure: Error details with links to logs

## Solution

Add a comment step to the PR validation workflow using `actions/github-script` or similar action:

**On success:**
```
✅ Validation Passed

- Tests: 262 passed
- Tarball: Created and validated successfully
- Ready for review

View details: [link to workflow run]
```

**On failure:**
```
❌ Validation Failed

Tests: 5 failed
- test/unit/foo.test.js: TypeError at line 42
- test/integration/bar.test.js: Connection timeout

View full logs: [link to workflow run]
```

Implementation:
1. Use `actions/github-script@v7` to post comments
2. Add step that runs on success: posts success comment
3. Add step that runs on failure: posts failure comment with error details
4. Include link to workflow run for full details
5. Consider using job outputs to pass test results to comment step

Note: Requires `pull-requests: write` permission in workflow.
