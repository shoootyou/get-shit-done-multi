#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  flatten-allowed-tools.sh <folder_path>

Converts YAML blocks like:

  allowed-tools:
    - Read
    - Bash
    - Write

into:

  allowed-tools: Read, Bash, Write

Recursively processes all files under <folder_path>.
Skips binary files (best-effort).
EOF
}

if [[ $# -ne 1 ]]; then
  echo "ERROR: You must provide exactly 1 argument: <folder_path>" >&2
  usage >&2
  exit 1
fi

DIR="$1"
if [[ ! -d "$DIR" ]]; then
  echo "ERROR: Folder does not exist: $DIR" >&2
  exit 1
fi

changed=0

while IFS= read -r -d '' file; do
  # Skip binaries (best-effort)
  if ! LC_ALL=C grep -Iq . "$file"; then
    continue
  fi

  # Only touch files that contain the key line alone
  if ! LC_ALL=C grep -q '^[[:space:]]*allowed-tools:[[:space:]]*$' "$file"; then
    continue
  fi

  tmp="$(mktemp)"

  awk '
    function flush() {
      if (in_list) {
        printf "%sallowed-tools: ", indent
        for (i = 1; i <= n; i++) {
          printf "%s", items[i]
          if (i < n) printf ", "
        }
        printf "\n"
      }
      in_list = 0
      n = 0
      indent = ""
    }

    {
      # Start of block: allowed-tools: (and nothing else on that line)
      if ($0 ~ /^[[:space:]]*allowed-tools:[[:space:]]*$/) {
        flush()

        # Capture leading indentation in a portable way (no match() 3rd arg)
        indent = $0
        sub(/allowed-tools:[[:space:]]*$/, "", indent)

        in_list = 1
        next
      }

      # Collect list items: "- Something" with any indentation
      if (in_list && $0 ~ /^[[:space:]]*-[[:space:]]+/) {
        line = $0
        sub(/^[[:space:]]*-[[:space:]]+/, "", line)
        items[++n] = line
        next
      }

      # If we were collecting and we hit a non-item line, flush first
      if (in_list) {
        flush()
      }

      print
    }

    END {
      flush()
    }
  ' "$file" > "$tmp"

  if ! cmp -s "$file" "$tmp"; then
    mv -- "$tmp" "$file"
    echo "Updated: $file"
    changed=$((changed + 1))
  else
    rm -f -- "$tmp"
  fi
done < <(find "$DIR" -type f -name "SKILL.md" -print0)

echo "Done. Files updated: $changed"