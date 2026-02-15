#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  replace-text.sh <folder_path> <original_text> <replacement_text>

Description:
  Replaces all occurrences of <original_text> with <replacement_text>
  in all regular files under <folder_path> (recursively).

Notes:
  - Fails if you don't provide exactly 3 arguments.
  - Creates a .bak backup per edited file, then removes it if successful.
  - Uses sed (BSD/macOS compatible).

Examples:
  ./replace-text.sh templates/agents "old" "new"
  ./replace-text.sh ./docs "foo bar" "baz"
EOF
}

# Require exactly 3 args
if [[ $# -ne 3 ]]; then
  echo "ERROR: You must provide exactly 3 arguments." >&2
  usage >&2
  exit 1
fi

DIR="$1"
FROM="$2"
TO="$3"

if [[ ! -d "$DIR" ]]; then
  echo "ERROR: Folder does not exist: $DIR" >&2
  exit 1
fi

# Escape strings for sed replacement (delimiter = |)
escape_sed_search() {
  # Escape regex-relevant chars so we treat FROM as literal text
  printf '%s' "$1" | sed -e 's/[.[\*^$()+?{\\|]/\\&/g'
}

escape_sed_replace() {
  # Escape & and delimiter and backslashes in replacement
  printf '%s' "$1" | sed -e 's/[\\&|]/\\&/g'
}

FROM_ESCAPED="$(escape_sed_search "$FROM")"
TO_ESCAPED="$(escape_sed_replace "$TO")"

# Process all regular files (recursively), safely (null-delimited)
changed=0
while IFS= read -r -d '' file; do
  # Skip obvious binary files (best-effort)
  if ! LC_ALL=C grep -Iq . "$file"; then
    continue
  fi

  # Only edit files that actually contain the search string
  if LC_ALL=C grep -Fq -- "$FROM" "$file"; then
    # macOS/BSD sed requires an extension for -i
    sed -i.bak "s|$FROM_ESCAPED|$TO_ESCAPED|g" "$file"
    rm -f -- "$file.bak"
    echo "Updated: $file"
    changed=$((changed + 1))
  fi
done < <(find "$DIR" -type f -print0)

echo "Done. Files updated: $changed"