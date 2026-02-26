#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  sanitize-description.sh <folder_path>

What it does (recursively):
  - Sanitizes YAML frontmatter lines starting with:
      description: ...
    so they contain only:
      letters, numbers, spaces, hyphens, periods, commas, parentheses

It:
  - Removes quotes (")
  - Replaces any other invalid char with a space
  - Collapses repeated spaces
  - Trims leading/trailing spaces
EOF
}

require_args() {
  if [[ $# -ne 1 ]]; then
    echo "ERROR: You must provide exactly 1 argument: <folder_path>" >&2
    usage >&2
    exit 1
  fi
}

is_text_file() {
  LC_ALL=C grep -Iq . "$1"
}

sanitize_description_file() {
  local file="$1"

  # Only touch files that have a description line
  if ! LC_ALL=C grep -Eq '^[[:space:]]*description:' "$file"; then
    return 0
  fi

  # Sanitize only the value part after "description:"
  perl -i -pe '
    if (/^([ \t]*description:[ \t]*)(.*)$/) {
      my $prefix = $1;
      my $val    = $2;

      # Remove double quotes
      $val =~ s/\"//g;

      # Replace any disallowed character with a space
      # Allowed: letters, numbers, spaces, hyphen, period, comma, parentheses
      $val =~ s/[^A-Za-z0-9 \-\.\,\(\)]/ /g;

      # Collapse repeated spaces
      $val =~ s/ +/ /g;

      # Trim
      $val =~ s/^ +//;
      $val =~ s/ +$//;

      $_ = $prefix . $val . "\n";
    }
  ' "$file"
}

process_file() {
  local file="$1"
  if ! is_text_file "$file"; then
    return 0
  fi

  sanitize_description_file "$file"
}

main() {
  require_args "$@"
  local dir="$1"

  if [[ ! -d "$dir" ]]; then
    echo "ERROR: Folder does not exist: $dir" >&2
    exit 1
  fi

  local updated=0

  while IFS= read -r -d '' file; do
    local before after
    before="$(cksum < "$file" | awk '{print $1 "-" $2}')"

    process_file "$file"

    after="$(cksum < "$file" | awk '{print $1 "-" $2}')"
    if [[ "$before" != "$after" ]]; then
      echo "Updated: $file"
      updated=$((updated + 1))
    fi
  done < <(find "$dir" -type f -name "SKILL.md" -print0)

  echo "Done. Files updated: $updated"
}

main "$@"