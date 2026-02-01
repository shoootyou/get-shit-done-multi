---
created: 2026-01-29T22:40
title: Fix string escaping security issues in frontmatter serializer
area: security
files:
  - bin/lib/rendering/frontmatter-serializer.js:168
  - bin/lib/rendering/frontmatter-serializer.js:175
  - bin/lib/rendering/frontmatter-serializer.js:193
pr: https://github.com/shoootyou/get-shit-done-multi/pull/20
---

## Problem

GitHub Advanced Security flagged 3 "Incomplete string escaping or encoding" issues in PR #20.

### Comment 1 (Line 168)
- **Author:** github-advanced-security
- **Created:** 2026-01-29T12:13:00Z
- **Issue:** Incomplete string escaping or encoding - This does not escape backslash characters in the input
- **Link:** https://github.com/shoootyou/get-shit-done-multi/pull/20#discussion_r2741340130
- **Details:** https://github.com/shoootyou/get-shit-done-multi/security/code-scanning/4

### Comment 2 (Line 175)
- **Author:** github-advanced-security
- **Created:** 2026-01-28T21:17:22Z
- **Issue:** Incomplete string escaping or encoding - This does not escape backslash characters in the input
- **Link:** https://github.com/shoootyou/get-shit-done-multi/pull/20#discussion_r2738646762
- **Details:** https://github.com/shoootyou/get-shit-done-multi/security/code-scanning/2

### Comment 3 (Line 193)
- **Author:** github-advanced-security
- **Created:** 2026-01-28T21:17:23Z
- **Issue:** Incomplete string escaping or encoding - This does not escape backslash characters in the input
- **Link:** https://github.com/shoootyou/get-shit-done-multi/pull/20#discussion_r2738646770
- **Details:** https://github.com/shoootyou/get-shit-done-multi/security/code-scanning/3

All three issues are in `bin/lib/rendering/frontmatter-serializer.js`. The current code uses `.replace(/"/g, '\\"')` to escape double quotes but does not escape backslash characters. This creates a security vulnerability where backslashes in input strings are not properly escaped before being embedded in YAML strings.

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
