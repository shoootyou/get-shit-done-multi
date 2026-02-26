#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  md_to_skill_folder.sh <folder_path>

What it does (recursively):
  For every file named: <name>.md
  - Creates a folder: gsd-<name> (in the same directory as the file)
  - Writes the original file content into: gsd-<name>/SKILL.md
  - Deletes the original <name>.md

Example:
  ./md_to_skill_folder.sh templates/agents

Example transform:
  templates/agents/add-phase.md
    -> templates/agents/gsd-add-phase/SKILL.md
EOF
}

if [[ $# -ne 1 ]]; then
  echo "ERROR: You must provide exactly 1 argument: <folder_path>" >&2
  usage >&2
  exit 1
fi

ROOT_DIR="$1"

if [[ ! -d "$ROOT_DIR" ]]; then
  echo "ERROR: Folder does not exist: $ROOT_DIR" >&2
  exit 1
fi

migrated=0
skipped=0

while IFS= read -r -d '' src; do
  base="$(basename -- "$src")"          # e.g. add-phase.md
  name="${base%.md}"                   # e.g. add-phase
  parent="$(dirname -- "$src")"        # e.g. templates/agents

  dest_dir="$parent/gsd-$name"
  dest_file="$dest_dir/SKILL.md"

  # Safety: skip if dest already exists (avoid overwriting)
  if [[ -e "$dest_file" || -d "$dest_dir" ]]; then
    echo "SKIP (destination exists): $src -> $dest_file"
    skipped=$((skipped + 1))
    continue
  fi

  mkdir -p -- "$dest_dir"
  cp -- "$src" "$dest_file"
  rm -- "$src"

  echo "MIGRATED: $src -> $dest_file"
  migrated=$((migrated + 1))
done < <(find "$ROOT_DIR" -type f -name "*.md" -print0)

echo "Done."
echo "Migrated: $migrated"
echo "Skipped : $skipped"