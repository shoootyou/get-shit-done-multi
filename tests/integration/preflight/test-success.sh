#!/bin/bash
# Test: All validation passes

set -e
source "$(dirname "$0")/setup-scenarios.sh"

TEST_DIR=$(setup_test_env "success")
trap "cleanup_test_env $TEST_DIR" EXIT

cd "$TEST_DIR/gsd"

# Execute with valid configuration
output=$(node bin/install.js --copilot --custom-path "$TEST_DIR/target" 2>&1 || true)
exit_code=$?

# Should succeed (or at least pass validation)
if echo "$output" | grep -q "🚨 Validation Failed"; then
  echo "✗ Validation should have passed"
  echo "$output"
  exit 1
fi

echo "✓ Validation passed"
exit 0
