---
created: 2026-01-27T19:33:00
title: Centralize manifest field definitions
area: versioning
files:
  - bin/lib/manifests/reader.js:26
  - bin/lib/manifests/writer.js:22-26
  - bin/lib/manifests/repair.js:47-51
---

## Problem

Manifest field names are repeated across multiple files:
- `reader.js` has `requiredFields` array
- `writer.js` manually constructs manifest object
- `repair.js` manually constructs manifest object

To add a new field requires:
1. Adding to requiredFields array
2. Adding to writer creation
3. Adding to repair creation
4. Updating tests

This is error-prone and violates DRY principle.

## Solution

Implement **Option 2: Factory Function with Defaults**

Create `bin/lib/manifests/schema.js`:
- Single `FIELD_DEFINITIONS` object with all fields
- `createManifest(data)` - creates manifest with auto-defaults
- `validateManifest(manifest)` - validates from definitions
- `FIELDS` export for reference

Benefits:
- ✅ Add new field in ONE place (FIELD_DEFINITIONS)
- ✅ Automatic validation generation
- ✅ Auto-defaults for timestamps/arrays
- ✅ Reduces duplication
- ✅ Matches functional code style

Changes needed:
1. Create schema.js with field definitions
2. Update reader.js to use validateManifest()
3. Update writer.js to use createManifest()
4. Update repair.js to use createManifest()
5. Test all flows still work

User confirmed: Proceed with Option 2 implementation.
