#!/bin/bash
# Validate @-references in legacy commands before migration
# Usage: ./scripts/validate-references.sh

ERRORS=0
CHECKED=0

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " GSD Reference Validator"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Validating @-references in commands/gsd/*.md..."
echo ""

# Extract @-references to temp file
REFS_FILE=$(mktemp)
grep -rho "@[^[:space:]<>\"'\`]*" commands/gsd/*.md 2>/dev/null | sort -u > "$REFS_FILE"

# Check each reference
while IFS= read -r ref; do
  # Skip if it's a variable reference or placeholder
  if [[ "$ref" =~ \{|\}|\$ ]]; then
    echo "⏭️  Skipping variable: $ref"
    continue
  fi
  
  # Skip @latest and other non-file references
  if [[ "$ref" == "@latest" ]]; then
    echo "⏭️  Skipping special: $ref"
    continue
  fi
  
  # Skip malformed references (e.g., contains newline characters)
  if [[ "$ref" =~ \\n ]]; then
    echo "⏭️  Skipping malformed: $ref"
    continue
  fi
  
  # Remove @ prefix
  path="${ref#@}"
  
  # Expand ~ if present
  if [[ "$path" == ~/* ]]; then
    path="${path/#\~/$HOME}"
  fi
  
  # Check if file exists
  ((CHECKED++))
  if [ -f "$path" ]; then
    echo "✅ Valid: $ref"
  elif [ -d "$path" ]; then
    echo "📁 Directory: $ref"
  else
    echo "❌ Missing: $ref → $path"
    ((ERRORS++))
  fi
done < "$REFS_FILE"

# Cleanup
rm -f "$REFS_FILE"

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo " Results"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "References checked: $CHECKED"
echo "Missing references: $ERRORS"
echo ""

if [ $ERRORS -eq 0 ]; then
  echo "✅ All @-references valid"
  exit 0
else
  echo "❌ Found $ERRORS missing references"
  echo ""
  echo "Action required:"
  echo "  1. Create missing files, or"
  echo "  2. Update references in commands to correct paths"
  exit 1
fi
