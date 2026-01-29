---
created: 2026-01-29T22:40
title: Fix string escaping security issues in frontmatter serializer
area: security
files:
  - bin/lib/rendering/frontmatter-serializer.js:168
  - bin/lib/rendering/frontmatter-serializer.js:175
  - bin/lib/rendering/frontmatter-serializer.js:193
---

## Problem

GitHub Advanced Security flagged 3 "Incomplete string escaping or encoding" issues in PR #20. All issues are in the frontmatter serializer at lines 168, 175, and 193.

The current code uses `.replace(/"/g, '\\"')` to escape double quotes but does not escape backslash characters. This creates a security vulnerability where backslashes in input strings are not properly escaped before being embedded in YAML strings.

Example vulnerability:
- Input: `value with \ backslash`
- Current output: `"value with \ backslash"` (invalid/unsafe)
- Expected output: `"value with \\ backslash"` (properly escaped)

## Solution

Add backslash escaping before quote escaping in all three locations:

1. Line 168: `value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')`
2. Line 175: `value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')`
3. Line 193: `value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')`

Order matters: escape backslashes first, then quotes, to avoid double-escaping.
