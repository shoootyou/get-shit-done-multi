---
created: 2026-02-01T17:41
title: Pin GitHub Actions to SHA with version comments
area: tooling
files:
  - .github/workflows/pr-validation.yml
  - .github/workflows/publish-main.yml
---

## Problem

Currently GitHub Actions use version tags (e.g., `uses: actions/checkout@v4`), which can be updated by the action maintainer and potentially break workflows or introduce security issues. Best practice is to pin to specific commit SHAs for security and reproducibility, while keeping version tags in comments for readability.

Example current format:
```yaml
uses: actions/checkout@v4
uses: actions/setup-node@v6
```

## Solution

Update all action references to use commit SHA with version comment:

```yaml
uses: actions/checkout@b4ffde6 # v4.1.1
uses: actions/setup-node@60edb5d # v6.0.0
```

Steps:
1. For each action used, find the latest stable version
2. Get the commit SHA for that version from the action's repository
3. Update all workflow files to use SHA format with version comment
4. Document in comments why we pin to SHA (security, reproducibility)

Actions to update:
- actions/checkout@v4
- actions/setup-node@v6

Benefits:
- Immutable action versions (SHA can't change)
- Clear version reference in comments
- Protection against action updates that could break workflows
- Security best practice (dependabot can still suggest updates)
