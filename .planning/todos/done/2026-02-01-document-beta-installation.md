---
created: 2026-02-01T17:15
title: Document beta installation in README
area: docs
files:
  - README.md
---

## Problem

The README.md currently doesn't document how to install the beta version from the dev branch. Users should be able to install the beta version using `npx get-shit-done-multi@beta` to test new features before they're released to the stable/latest version.

The documentation should follow the current writing style and structure of the README.md.

## Solution

Add a section in README.md explaining:
- How to install the beta version: `npx get-shit-done-multi@beta`
- What the beta version represents (dev branch, pre-release features)
- When users might want to use beta vs stable
- How to check which version they're running

Follow the existing README.md tone and formatting conventions.
