#!/bin/bash
# Test: Missing templates directory

set -e
source "$(dirname "$0")/setup-scenarios.sh"

TEST_DIR=$(setup_test_env "no-templates")
trap "cleanup_test_env $TEST_DIR" EXIT

# Remove templates
setup_no_templates "$TEST_DIR"

cd "$TEST_DIR/gsd"

# Execute - should fail validation
# Disable pipefail temporarily to capture output and exit code
set +e
output=$(node bin/install.js --copilot 2>&1)
exit_code=$?
set -e

# Should show validation error
if ! echo "$output" | grep -q "🚨 Validation Failed"; then
  echo "✗ Should show validation failure"
  exit 1
fi

if ! echo "$output" | grep -q "Templates:"; then
  echo "✗ Should show template category"
  exit 1
fi

if [ $exit_code -eq 0 ]; then
  echo "✗ Should exit with error code"
  exit 1
fi

echo "✓ Template validation works"
exit 0
