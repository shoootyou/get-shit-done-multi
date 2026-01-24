#!/usr/bin/env bash
# cleanup-legacy-commands.sh - Remove pre-v1.9.1 command system
# 
# Usage:
#   ./cleanup-legacy-commands.sh           # Interactive mode with confirmation
#   ./cleanup-legacy-commands.sh --dry-run # Show what would be deleted
#   ./cleanup-legacy-commands.sh --help    # Show usage
#
# This script removes legacy GSD command directories that existed before v1.9.1.
# Safe to run multiple times (idempotent).

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script version
VERSION="1.0.0"

# Legacy paths to remove (both global and local installations)
LEGACY_PATHS=(
  # Claude Code global
  "$HOME/.claude/commands/gsd"
  "$HOME/.claude/get-shit-done/commands"
  
  # Claude Code local
  "./.claude/commands/gsd"
  "./.claude/get-shit-done/commands"
  
  # GitHub Copilot CLI
  "./.github/copilot/commands"
  "$HOME/.github/copilot/commands"
  
  # Codex CLI global
  "$HOME/.codex/commands/gsd"
  
  # Codex CLI local
  "./.codex/commands/gsd"
  
  # Legacy source directory (if in GSD repo)
  "./commands/gsd"
)

# Function: Display usage
show_usage() {
  cat << EOF
${BLUE}GSD Legacy Cleanup Script v${VERSION}${NC}

Remove legacy command directories from GSD pre-v1.9.1 installations.

${YELLOW}Usage:${NC}
  ./cleanup-legacy-commands.sh           Interactive mode (prompts for confirmation)
  ./cleanup-legacy-commands.sh --dry-run Show what would be deleted (safe)
  ./cleanup-legacy-commands.sh --help    Display this help message

${YELLOW}What this script does:${NC}
  - Scans for legacy command directories (commands/gsd/, .claude/commands/, etc.)
  - Shows which directories will be deleted
  - Asks for confirmation (unless --dry-run)
  - Safely removes legacy directories
  - Safe to run multiple times

${YELLOW}Legacy directories checked:${NC}
  - ~/.claude/commands/gsd/
  - ~/.claude/get-shit-done/commands/
  - ./.claude/commands/gsd/
  - ./.github/copilot/commands/
  - ~/.codex/commands/gsd/
  - ./.codex/commands/gsd/
  - ./commands/gsd/ (if in GSD source)

${YELLOW}After running:${NC}
  - Old /gsd: commands will no longer work
  - Use /gsd- commands instead (e.g., /gsd-help)
  - Reinstall if needed: npm install -g get-shit-done-multi

${YELLOW}Documentation:${NC}
  - Migration guide: docs/MIGRATION-GUIDE.md
  - Comparison: docs/COMMAND-COMPARISON.md
  - Troubleshooting: docs/TROUBLESHOOTING.md

EOF
  exit 0
}

# Function: Check if any legacy directories exist
check_legacy_exists() {
  local found=false
  for path in "${LEGACY_PATHS[@]}"; do
    if [ -d "$path" ]; then
      found=true
      break
    fi
  done
  echo "$found"
}

# Function: Show what will be deleted
show_plan() {
  local mode="$1"  # "dry-run" or "real"
  local found_any=false
  
  echo -e "${BLUE}Scanning for legacy command directories...${NC}"
  echo ""
  
  for path in "${LEGACY_PATHS[@]}"; do
    if [ -d "$path" ]; then
      found_any=true
      if [ "$mode" = "dry-run" ]; then
        echo -e "  ${YELLOW}Would delete:${NC} $path"
      else
        echo -e "  ${RED}Will delete:${NC} $path"
      fi
      
      # Show directory size
      size=$(du -sh "$path" 2>/dev/null | cut -f1 || echo "unknown")
      echo -e "    ${BLUE}Size:${NC} $size"
      
      # Show file count
      count=$(find "$path" -type f 2>/dev/null | wc -l | tr -d ' ')
      echo -e "    ${BLUE}Files:${NC} $count"
      echo ""
    fi
  done
  
  if [ "$found_any" = false ]; then
    echo -e "  ${GREEN}✓ No legacy directories found${NC}"
    echo ""
    echo "Your system is already clean. Either:"
    echo "  - Legacy commands were never installed"
    echo "  - Already cleaned up in a previous run"
    echo ""
    exit 0
  fi
}

# Function: Perform cleanup
do_cleanup() {
  local deleted_count=0
  
  echo -e "${BLUE}Removing legacy directories...${NC}"
  echo ""
  
  for path in "${LEGACY_PATHS[@]}"; do
    if [ -d "$path" ]; then
      # Attempt deletion
      if rm -rf "$path" 2>/dev/null; then
        echo -e "${GREEN}✓ Removed:${NC} $path"
        ((deleted_count++))
      else
        echo -e "${RED}✗ Failed to remove:${NC} $path"
        echo -e "  ${YELLOW}Reason:${NC} Permission denied or directory in use"
        echo -e "  ${YELLOW}Try:${NC} sudo ./cleanup-legacy-commands.sh"
      fi
    fi
  done
  
  echo ""
  echo -e "${GREEN}Cleanup complete!${NC}"
  echo -e "Removed ${GREEN}$deleted_count${NC} legacy director$([ $deleted_count -eq 1 ] && echo 'y' || echo 'ies')"
  echo ""
  echo -e "${YELLOW}Next steps:${NC}"
  echo "  1. Verify removal: ls ~/.claude/commands/ (should not exist)"
  echo "  2. Use new commands: /gsd-help (not /gsd:help)"
  echo "  3. Reinstall if needed: npm install -g get-shit-done-multi"
  echo ""
  echo -e "${YELLOW}Documentation:${NC}"
  echo "  - Migration guide: docs/MIGRATION-GUIDE.md"
  echo "  - Command changes: docs/COMMAND-COMPARISON.md"
}

# Main execution

# Parse arguments
case "${1:-}" in
  --dry-run)
    echo -e "${BLUE}=== DRY-RUN MODE ===${NC}"
    echo "This is a safe preview. Nothing will be deleted."
    echo ""
    show_plan "dry-run"
    echo -e "${YELLOW}To actually delete, run without --dry-run flag${NC}"
    exit 0
    ;;
  --help|-h)
    show_usage
    ;;
  "")
    # Interactive mode (default)
    ;;
  *)
    echo -e "${RED}Error: Unknown option '$1'${NC}"
    echo "Run with --help for usage"
    exit 1
    ;;
esac

# Interactive mode
echo -e "${BLUE}=== GSD Legacy Cleanup ===${NC}"
echo ""
echo "This script removes legacy command directories from pre-v1.9.1 installations."
echo ""

# Check if anything to delete
if [ "$(check_legacy_exists)" = "false" ]; then
  echo -e "${GREEN}✓ No legacy directories found${NC}"
  echo "Your system is already clean!"
  exit 0
fi

# Show what will be deleted
show_plan "real"

# Confirmation prompt
echo -e "${YELLOW}⚠️  WARNING:${NC} This action cannot be undone."
echo -e "${YELLOW}⚠️  Old /gsd: commands will stop working after cleanup.${NC}"
echo ""
read -p "Continue with deletion? (type 'yes' to confirm): " confirm

if [ "$confirm" != "yes" ]; then
  echo "Cancelled. No changes made."
  echo ""
  echo "To preview without deleting, run:"
  echo "  ./cleanup-legacy-commands.sh --dry-run"
  exit 0
fi

# Perform cleanup
do_cleanup
