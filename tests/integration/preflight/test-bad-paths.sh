#!/bin/bash
# Test: Path traversal detected

set -e
source "$(dirname "$0")/setup-scenarios.sh"

TEST_DIR=$(setup_test_env "bad-paths")
trap "cleanup_test_env $TEST_DIR" EXIT

cd "$TEST_DIR/gsd"

# Execute with traversal path
# Disable pipefail temporarily to capture output
set +e
output=$(node bin/install.js --copilot --custom-path "../../../etc" 2>&1)
set -e

# Should show path validation error
if ! echo "$output" | grep -q "Paths:"; then
  echo "✗ Should show path category"
  exit 1
fi

if ! echo "$output" | grep -q "traversal\|Invalid path"; then
  echo "✗ Should detect traversal"
  exit 1
fi

echo "✓ Path validation works"
exit 0
