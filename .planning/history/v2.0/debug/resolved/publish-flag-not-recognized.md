---
status: resolved
trigger: "Investigate issue: publish-flag-not-recognized"
created: 2024-12-20T00:00:00Z
updated: 2024-12-20T00:06:00Z
---

## Current Focus

hypothesis: npm intercepts --publish as npm option, making it impossible to use without -- separator. Solution: Modify script to accept PUBLISH=true env var AND create a publish-pre:live npm script for convenience
test: Modify publish-pre.sh to check for PUBLISH env var, add publish-pre:live script to package.json
expecting: Both PUBLISH=true npm run publish-pre 2.0.0-beta.1 and npm run publish-pre:live 2.0.0-beta.1 will work
next_action: Implement the fix

## Symptoms

expected: When running `npm run publish-pre 2.0.0-beta.1 --publish`, the script should recognize the --publish flag and perform actual publication (not dry-run)
actual: The --publish flag is not recognized and the script does not publish
errors: No specific error messages reported, flag just not working
reproduction: Execute `npm run publish-pre 2.0.0-beta.1 --publish` - script does not publish
started: First time trying to use the --publish flag. Documentation was updated to use `--` separator but that doesn't solve the issue.

## Eliminated

## Evidence

- timestamp: 2024-12-20T00:01:00Z
  checked: Executed `npm run publish-pre 2.0.0-beta.1 --publish` (without --)
  found: npm gives warning "Unknown cli config --publish" and the flag is NOT passed to the script. Script shows "Mode: DRY-RUN (validation only)"
  implication: npm is consuming the --publish flag as an npm option, not passing it through to the script

- timestamp: 2024-12-20T00:02:00Z
  checked: Executed `npm run publish-pre -- 2.0.0-beta.1 --publish` (with --)
  found: No warning, script shows "Mode: PUBLISH (will publish to NPM)" and --publish flag is recognized
  implication: The -- separator correctly passes arguments to the script, but user wants to avoid needing it

- timestamp: 2024-12-20T00:03:00Z
  checked: Modified publish-pre.sh to check PUBLISH env var, tested with `PUBLISH=true npm run publish-pre 2.0.0-beta.1`
  found: Script shows "Mode: PUBLISH (will publish to NPM)" - the environment variable is recognized without needing -- separator
  implication: Environment variable provides a clean solution without needing -- separator

- timestamp: 2024-12-20T00:04:00Z
  checked: Tested all three methods: default dry-run, PUBLISH=true env var, and -- separator with --publish flag
  found: All three methods work correctly. Default shows DRY-RUN, both publish methods show PUBLISH mode
  implication: Fix is complete and backward compatible

- timestamp: 2024-12-20T00:05:00Z
  checked: Updated docs/releasing.md to document the new PUBLISH=true environment variable method
  found: Documentation now shows both methods with PUBLISH=true as recommended
  implication: Users now have clear guidance on using the simpler method

## Resolution

root_cause: npm treats arguments starting with -- as npm configuration options, not script arguments, unless they come after the -- separator. When running `npm run publish-pre 2.0.0-beta.1 --publish`, npm intercepts --publish as an npm config option (showing warning "Unknown cli config") and never passes it to the script.

fix: Modified scripts/publish-pre.sh to accept PUBLISH=true as an environment variable in addition to the --publish flag. This allows users to run `PUBLISH=true npm run publish-pre 2.0.0-beta.1` without needing the -- separator. Updated usage documentation in the script and docs/releasing.md to show the new method.

verification: 
- ✅ Tested default dry-run: `npm run publish-pre 2.0.0-beta.2` shows "Mode: DRY-RUN"
- ✅ Tested new method: `PUBLISH=true npm run publish-pre 2.0.0-beta.2` shows "Mode: PUBLISH"
- ✅ Tested existing method: `npm run publish-pre -- 2.0.0-beta.2 --publish` shows "Mode: PUBLISH"
- ✅ All three methods work correctly and custom registry is maintained
- ✅ Help message updated to show all methods
- ✅ Documentation updated with new recommended method

files_changed:
- scripts/publish-pre.sh: Added PUBLISH env var check, updated usage examples
- docs/releasing.md: Updated Quick Start and Step-by-Step sections with new method
