#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  update-agents.sh [directory] [-r|--recursive]

Defaults:
  If no directory is provided, it uses: <repo_root>/templates/agents
  (repo_root is inferred as the parent folder of this script's directory)

Examples:
  ./scripts/update-agents.sh                  # defaults to templates/agents
  ./scripts/update-agents.sh templates/agents # explicit
  ./scripts/update-agents.sh -r               # recursive in default dir
  ./scripts/update-agents.sh docs -r          # recursive in ./docs

What it does:
  - Renames: file.md -> file.agent.md
  - Skips files that already end with .agent.md
EOF
}

# Resolve script directory (works no matter where you run it from)
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd)"

DIR="$REPO_ROOT/templates/agents"
RECURSIVE="false"

# Simple argument parsing:
# - first non-flag argument is treated as the directory
for arg in "$@"; do
  case "$arg" in
    -h|--help)
      usage
      exit 0
      ;;
    -r|--recursive)
      RECURSIVE="true"
      ;;
    *)
      DIR="$arg"
      ;;
  esac
done

if [[ ! -d "$DIR" ]]; then
  echo "ERROR: Directory does not exist: $DIR" >&2
  exit 1
fi

rename_one_dir() {
  local d="$1"
  shopt -s nullglob
  for f in "$d"/*.md; do
    [[ "$f" == *.agent.md ]] && continue
    mv -- "$f" "${f%.md}.agent.md"
    echo "Renamed: $f -> ${f%.md}.agent.md"
  done
}

rename_recursive() {
  local d="$1"
  while IFS= read -r -d '' f; do
    local new="${f%.md}.agent.md"
    mv -- "$f" "$new"
    echo "Renamed: $f -> $new"
  done < <(find "$d" -type f -name "*.md" ! -name "*.agent.md" -print0)
}

if [[ "$RECURSIVE" == "true" ]]; then
  rename_recursive "$DIR"
else
  rename_one_dir "$DIR"
fi