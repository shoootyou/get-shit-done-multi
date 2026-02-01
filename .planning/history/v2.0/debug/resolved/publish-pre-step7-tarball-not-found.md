---
status: resolved
trigger: "Investigate issue: publish-pre-step7-tarball-not-found"
created: 2025-01-10T00:00:00Z
updated: 2025-01-10T00:05:00Z
---

## Current Focus

hypothesis: VERIFIED - Fix works correctly
test: Ran npm run publish-pre 2.0.0-beta.99, Step 7 passed
expecting: Complete
next_action: Archive debug session and commit fix

## Symptoms

expected: Script should create tarball and successfully test installation in temp directory
actual: Tarball is created (get-shit-done-multi-2.0.0-beta.1.tgz) but npm install fails with ENOENT when trying to install it
errors: 
```
npm warn tarball tarball data for file:../get-shit-done-multi-2.0.0-beta.1.tgz (null) seems to be corrupted. Trying again.
npm verbose stack Error: ENOENT: no such file or directory, open '/private/var/folders/pm/8bs2t2ps01dgz4021m9_cc7c0000gn/T/get-shit-done-multi-2.0.0-beta.1.tgz'
npm error code ENOENT
npm error syscall open
npm error path /private/var/folders/pm/8bs2t2ps01dgz4021m9_cc7c0000gn/T/get-shit-done-multi-2.0.0-beta.1.tgz
npm error errno -2
npm error enoent ENOENT: no such file or directory, open '/private/var/folders/pm/8bs2t2ps01dgz4021m9_cc7c0000gn/T/get-shit-done-multi-2.0.0-beta.1.tgz'
```

Key observations:
- Created: get-shit-done-multi-2.0.0-beta.1.tgz (confirms tarball was created)
- Testing installation in: /var/folders/pm/8bs2t2ps01dgz4021m9_cc7c0000gn/T/tmp.OYbSRuCtSw
- npm cwd: /private/var/folders/pm/8bs2t2ps01dgz4021m9_cc7c0000gn/T/tmp.OYbSRuCtSw
- npm trying to install from: ../get-shit-done-multi-2.0.0-beta.1.tgz
- npm looking for file at: /private/var/folders/pm/8bs2t2ps01dgz4021m9_cc7c0000gn/T/get-shit-done-multi-2.0.0-beta.1.tgz

The problem appears to be a path resolution issue - the tarball is created in the project directory, but the script changes to a temp directory and tries to reference it with a relative path that doesn't work.

reproduction: Run `npm run publish-pre 2.0.0-beta.1` and it fails at Step 7
timeline: Just discovered, unknown when it started failing

## Eliminated

## Evidence

- timestamp: 2025-01-10T00:01:00Z
  checked: scripts/publish-pre.sh lines 133-151 (Step 7)
  found: |
    Line 134: TARBALL=$(npm pack) - creates tarball in current dir (project root)
    Line 137: TEMP_DIR=$(mktemp -d) - creates temp dir in /tmp or /var/folders
    Line 140: cd "$TEMP_DIR" - changes working directory to temp dir
    Line 141: npm install "../$TARBALL" - tries to install from relative path
  implication: |
    The relative path "../$TARBALL" assumes the tarball is one directory up from temp dir.
    But mktemp -d creates dir like /var/folders/.../tmp.xxx, not /project/tmp.xxx
    So ../tarball resolves to /var/folders/.../tarball (wrong!)
    Instead of /project/tarball (correct!)
    Need to save absolute path to tarball before changing directories.

- timestamp: 2025-01-10T00:02:00Z
  checked: Path resolution with mktemp -d
  found: |
    From project dir: /Users/rodolfo/croonix-github/gsd/get-shit-done-multi
    mktemp -d creates: /var/folders/.../T/tmp.xxx
    From temp dir, ../ resolves to: /var/folders/.../T/ (NOT project dir!)
  implication: Confirms the relative path is broken. Must use absolute path.

## Resolution

root_cause: Script creates tarball in project directory, then changes to temp directory created by mktemp -d (which is in /tmp or /var/folders), then tries to install with relative path "../$TARBALL". The relative path resolves to /tmp/tarball instead of /project/tarball because mktemp -d creates the temp directory outside the project tree.
fix: |
  Added line to save absolute path to tarball before changing directories:
    TARBALL_PATH="$(pwd)/$TARBALL"
  Changed npm install command to use absolute path:
    npm install "$TARBALL_PATH" --verbose
  Updated all cleanup commands to use $TARBALL_PATH for consistency
verification: |
  Ran: npm run publish-pre 2.0.0-beta.99
  Result: Step 7 now passes successfully
  Evidence: npm install used absolute path "/Users/rodolfo/croonix-github/gsd/get-shit-done-multi/get-shit-done-multi-2.0.0-beta.99.tgz"
  Output: "✓ Tarball installs successfully"
  The tarball installation test now works correctly - the file is found and installed without ENOENT errors.
files_changed: ['scripts/publish-pre.sh']
