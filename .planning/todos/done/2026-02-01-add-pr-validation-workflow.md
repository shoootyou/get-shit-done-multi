---
created: 2026-02-01T17:15
title: Add GitHub Action for PR validation
area: tooling
files:
  - .github/workflows/
  - scripts/publish-pre.sh
---

## Problem

Currently there's no automated validation when PRs are opened against dev or main branches. Need a GitHub Action workflow that validates PRs by:
1. Running the test suite
2. Testing tarball creation and installation (similar to publish-pre script's validation steps)
3. NOT publishing to npm (only validation, no actual publish)

This ensures PRs are validated before merge without manual intervention.

## Solution

Create `.github/workflows/pr-validation.yml` that:
- Triggers on pull_request to dev and main branches
- Runs `npm test` to execute the test suite
- Runs tarball validation similar to `scripts/publish-pre.sh` Steps 1-8:
  - Creates tarball with `npm pack`
  - Tests installation in temp directory
  - Validates the installation works
- Does NOT include Step 9 (publish) at all

Can reuse logic from `scripts/publish-pre.sh` or extract shared validation steps.
