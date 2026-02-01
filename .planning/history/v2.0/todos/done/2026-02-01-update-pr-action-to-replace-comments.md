---
created: 2026-02-01T18:05
title: Update PR action to replace comments instead of creating new ones
area: ci
files:
  - TBD (GitHub Actions workflows)
---

## Problem

The PR action is currently creating multiple comments on pull requests instead of updating a single comment. This creates clutter and makes it harder to track the latest status.

## Solution

Investigate the approach used by hashicorp/setup-terraform which has examples showing how to find and replace comments in GitHub Actions. The pattern involves:
- Searching for an existing comment (likely by a unique identifier or marker)
- Updating that comment if found, or creating a new one if not
- Consider adding a timestamp to the comment to show when it was last updated

Reference: https://github.com/hashicorp/setup-terraform
