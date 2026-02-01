<purpose>

Display all archived milestones from the `.planning/MILESTONES.md` registry with metadata.

Reads milestone registry, parses table entries, and presents them in a readable format with total count and helpful next-step suggestions.

</purpose>

<philosophy>

**Why milestone discovery matters:**
- Visibility into what has been archived and when
- Enables informed restore decisions
- Historical context for project evolution
- Transparency of milestone progression

**Discovery vs restore:**
- `list-milestones`: Read-only visibility into archive
- `restore-milestone`: Brings archived planning back to active workspace

**User-friendly approach:**
- Graceful handling when no milestones exist yet
- Clear table format for scanning multiple milestones
- Helpful suggestions for next actions (restore, archive)
- No errors for normal "empty" state

</philosophy>

<process>

<step name="check_registry">

Check if `.planning/MILESTONES.md` exists:

```bash
if [ ! -f .planning/MILESTONES.md ]; then
  echo "No milestones archived yet."
  echo ""
  echo "Archive your first milestone with {{COMMAND_PREFIX}}archive-milestone"
  exit 0
fi
```

**If registry doesn't exist:**
Display friendly message guiding user to archive first milestone.
Exit workflow.

**If registry exists:**
Continue to read_milestones.

</step>

<step name="read_milestones">

Read MILESTONES.md content and parse table:

```bash
# Read the full registry
REGISTRY_CONTENT=$(cat .planning/MILESTONES.md)

# Count milestone rows (skip header and separator lines)
MILESTONE_COUNT=$(echo "$REGISTRY_CONTENT" | grep -E '^\|[^-]' | grep -v '| Milestone |' | wc -l | tr -d ' ')

# Extract table rows
echo "$REGISTRY_CONTENT"
```

Continue to format_output.

</step>

<step name="format_output">

Display milestones in readable format:

```bash
echo ""
echo "Archived Milestones"
echo "=================="
echo ""

# Display the table (already formatted in MILESTONES.md)
cat .planning/MILESTONES.md

echo ""
echo "Total: ${MILESTONE_COUNT} milestone(s) archived"
echo ""
echo "Restore a milestone: {{COMMAND_PREFIX}}restore-milestone [name]"
```

**Output structure:**
1. Header: "Archived Milestones" with separator
2. Table from MILESTONES.md (includes headers and data)
3. Footer: Total count
4. Suggestion: How to restore a milestone

</step>

</process>

<success_criteria>

- [ ] Gracefully handles missing MILESTONES.md registry
- [ ] Displays helpful "no milestones yet" message when registry missing
- [ ] Reads and displays complete milestone table when registry exists
- [ ] Shows total count of archived milestones
- [ ] Provides restore command suggestion
- [ ] No errors for normal states (missing or populated registry)

</success_criteria>
