---
created: 2026-01-27T10:59
title: Optimize disk space check on first installation
area: tooling
files:
  - bin/install.js (disk space check logic)
---

## Problem

During first installation, the warning "Could not check disk space (requires Node.js 19+)" shows even when Node.js v25.4.0 is installed. The warning disappears after first installation and shows expected warnings like "⚠ Existing installation detected (v2.0.0)" on subsequent runs.

The issue is specific to first-time installation and suggests the disk space check logic may not be working correctly or efficiently, rather than just being a warning message issue.

## Solution

Investigate and optimize the disk space checking process:
1. Identify why the Node.js version check fails on first install despite v25+ being present
2. Optimize the disk space check implementation instead of just suppressing warnings
3. Test in isolated /tmp environment (NEVER in current directory)
4. Ensure disk space check works reliably on first installation

TBD - Need to examine bin/install.js disk space checking logic
