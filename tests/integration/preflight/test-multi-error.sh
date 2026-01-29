#!/bin/bash
# Test: Multiple validation errors grouped

set -e
source "$(dirname "$0")/setup-scenarios.sh"

TEST_DIR=$(setup_test_env "multi-error")
trap "cleanup_test_env $TEST_DIR" EXIT

# Remove templates + use bad path
setup_no_templates "$TEST_DIR"

cd "$TEST_DIR/gsd"

# Execute with multiple issues
# Disable pipefail temporarily to capture output
set +e
output=$(node bin/install.js --copilot --custom-path "../etc" 2>&1)
set -e

# Should show multiple categories
if ! echo "$output" | grep -q "Templates:"; then
  echo "✗ Should show templates error"
  exit 1
fi

if ! echo "$output" | grep -q "Paths:"; then
  echo "✗ Should show paths error"
  exit 1
fi

echo "✓ Error grouping works"
exit 0
