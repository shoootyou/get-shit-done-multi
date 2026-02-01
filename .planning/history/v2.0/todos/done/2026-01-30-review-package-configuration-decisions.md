---
created: 2026-01-30T00:33
title: Review package configuration decisions
area: tooling
files:
  - package.json:9-12
  - .markdownlint-cli2.jsonc
---

## Problem

Two package configuration questions need investigation and decision:

1. **Why keep .markdownlint-cli2.jsonc?**
   - Phase 8 Plan 05 installed markdownlint-cli2
   - Configuration file created with custom rules
   - Question: Is this needed post-release? For contributors only?
   - Should this be in devDependencies vs dependencies?

2. **Should README.md and docs/ be in package.json files array?**
   - Current package.json `files` array (lines 9-12): `["bin", "templates"]`
   - README.md auto-included by npm (standard)
   - But docs/ is NOT auto-included
   - Question: Should users who `npm install get-shit-done-multi` get docs/?
   - Trade-off: Package size vs offline documentation availability

## Solution

**Investigation needed:**

1. **For .markdownlint-cli2.jsonc:**
   - Check if markdownlint-cli2 is in dependencies vs devDependencies
   - If devDependencies only → config is for contributors, keep as-is
   - If dependencies → investigate why (likely should be dev-only)
   - Verify config doesn't interfere with user projects

2. **For docs/ in package.json files:**
   - Check current package size: `npm pack --dry-run`
   - Estimate docs/ size: `du -sh docs/`
   - Check what top npm packages do (e.g., commander, chalk, inquirer)
   - Decision factors:
     - Users can always read docs on GitHub
     - docs/ in package = ~50-100KB extra
     - Consider `npm publish --dry-run` to see actual impact

**Recommendation approach:**
- Small increase (<100KB) + valuable offline docs = Include docs/
- Large increase or online-preferred = Exclude, rely on GitHub/npm page

TBD: Make decision based on investigation findings
