---
name: gsd-audit-milestone
description: Spawn integration checker to validate cross-phase integration and E2E flows
allowed-tools: Read, Edit, Bash, Task
argument-hint: '[version]'
---


<objective>
Check cross-phase integration and end-to-end flows before milestone completion.

Purpose: Verify phases connect properly and user workflows complete end-to-end.
Output: v{version}-MILESTONE-AUDIT.md with status (passed/gaps_found) where version is the milestone argument.
</objective>

<process>
<step name="load_milestone_context">
Load milestone context:

```bash
# Load requirements
cat .planning/REQUIREMENTS.md

# Find all completed phases
ls -d .planning/phases/*/

# Load all SUMMARY files
find .planning/phases -name "*-SUMMARY.md" | sort
```
</step>

<step name="check_existing_audit">
Check for existing audit:

```bash
version="$1"
audit_file=".planning/v${version}-MILESTONE-AUDIT.md"
```

If audit file exists:
  Display current status
  Ask: "Re-audit or view existing? (re-audit/view)"
  If view: display and exit
  If re-audit: proceed
</step>

<step name="spawn_integration_checker">
Spawn gsd-integration-checker with full context:

```javascript
task({
  agent_type: "gsd-integration-checker",
  description: "Audit milestone E2E flows",
  prompt: `
<objective>
Audit milestone ${version} for cross-phase integration and E2E flow completion.
</objective>

<requirements>
@.planning/REQUIREMENTS.md
</requirements>

<verification_files>
\${allVerificationMdFiles.map(f => \`@\${f}\`).join('\\n')}
</verification_files>

<summaries>
\${allSummaryFiles.map(f => \`@\${f}\`).join('\\n')}
</summaries>

<tasks>
1. Map requirements to implementing phases
2. Check all requirements have implementation
3. Test E2E user workflows (can user complete primary flows?)
4. Identify integration gaps (phases built but not connected)
5. Verify key data flows (create → read → update → delete chains)
</tasks>

<output>
Write: .planning/v\${version}-MILESTONE-AUDIT.md

Frontmatter:
---
milestone: \${version}
audited: {timestamp}
status: passed|gaps_found
gaps_count: {number}
---

## Requirements Coverage

{requirement → phase mapping}

## E2E Flow Results

{workflow testing results}

## Integration Gaps

{gaps found, if any}

## Recommendation

{passed: ready for completion / gaps_found: run plan-milestone-gaps}
</output>
  `
})
```
</step>

<step name="present_audit_results">
After checker completes:

```bash
cat ".planning/v${version}-MILESTONE-AUDIT.md"
```

Display status prominently

If status: passed:
  "✓ Milestone ready for completion: /gsd-complete-milestone {version}"

If status: gaps_found:
  "⚠ Gaps found: {count} integration issues
   Next: /gsd-plan-milestone-gaps {version} (creates fix phases)"
</step>
</process>
