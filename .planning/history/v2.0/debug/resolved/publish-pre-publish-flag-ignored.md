---
status: resolved
trigger: "Investigate issue: publish-pre-publish-flag-ignored"
created: 2024-12-11T00:00:00Z
updated: 2024-12-11T00:06:00Z
---

## Current Focus

hypothesis: ROOT CAUSE CONFIRMED - fix applied
test: Verify script usage message and documentation show correct syntax
expecting: Both script and docs show npm run requires -- separator
next_action: Test that the script correctly receives flags with -- separator

## Symptoms

expected: Script should publish to the registry (not dry-run) when --publish flag is passed
actual: Script shows "[9/9] Skipping publish (dry-run mode)" even when --publish flag is provided
errors: No error messages, just continues in dry-run mode ignoring the flag
reproduction: Run `npm run publish-pre 2.0.0-beta.1 --publish` - still shows dry-run mode
started: First time trying to use the --publish flag

## Eliminated

## Evidence

- timestamp: 2024-12-11T00:01:00Z
  checked: scripts/publish-pre.sh lines 34-55
  found: Script correctly parses --publish flag using `for arg in "$@"` loop
  implication: Script argument parsing logic is correct

- timestamp: 2024-12-11T00:01:30Z
  checked: package.json line 44
  found: Script is invoked as `"publish-pre": "./scripts/publish-pre.sh"`
  implication: npm run calls bash script directly, needs to understand npm run argument passing

- timestamp: 2024-12-11T00:02:00Z
  checked: npm run behavior documentation
  found: npm run requires -- separator before flags: `npm run script -- --flag`
  implication: User command `npm run publish-pre 2.0.0-beta.1 --publish` likely passes --publish to npm, not the script

- timestamp: 2024-12-11T00:03:00Z
  checked: Tested npm run with and without -- separator
  found: WITHOUT --: "Number of arguments: 1, arg: [2.0.0-beta.1]" + npm warning "Unknown cli config --publish"
        WITH --: "Number of arguments: 2, arg: [2.0.0-beta.1], arg: [--publish]"
  implication: CONFIRMED - npm run without -- does not pass --publish to the script, npm interprets it as npm flag

## Resolution

root_cause: npm run command does not pass flags to scripts without -- separator. User ran `npm run publish-pre 2.0.0-beta.1 --publish` but npm interpreted --publish as an npm CLI flag (not a script argument), so the script only received "2.0.0-beta.1". The script's argument parsing is correct but never receives the --publish flag.

root_cause: npm run command does not pass flags to scripts without -- separator. User ran `npm run publish-pre 2.0.0-beta.1 --publish` but npm interpreted --publish as an npm CLI flag (not a script argument), so the script only received "2.0.0-beta.1". The script's argument parsing is correct but never receives the --publish flag.

fix: Updated scripts/publish-pre.sh usage message and docs/releasing.md to show correct syntax: `npm run publish-pre -- VERSION --publish` (with -- separator). Added explanatory note about npm run requiring -- separator before flags.

verification: Verified fix successfully:
  1. Script help message now shows both direct call and npm run syntax with -- separator
  2. Documentation (docs/releasing.md) updated with correct examples and explanatory note
  3. Dry-run completion message shows both invocation methods
  4. User can now see correct syntax: `npm run publish-pre -- VERSION --publish`

files_changed: 
  - scripts/publish-pre.sh: Updated usage examples and dry-run message
  - docs/releasing.md: Updated Quick Start and Step-by-Step sections with correct syntax
