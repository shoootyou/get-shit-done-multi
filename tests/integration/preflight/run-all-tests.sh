#!/bin/bash
# Pre-flight validation integration test runner
# Executes all test scenarios in isolated /tmp directories

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Source setup functions
source "$SCRIPT_DIR/setup-scenarios.sh"

# Test counter
PASSED=0
FAILED=0

# Test scenarios
tests=(
  "test-success"
  "test-no-disk"
  "test-no-templates"
  "test-bad-paths"
  "test-multi-error"
)

echo "🧪 Running Pre-Flight Validation Integration Tests"
echo "Project: $PROJECT_ROOT"
echo ""

for test in "${tests[@]}"; do
  echo "Running: $test"
  if bash "$SCRIPT_DIR/$test.sh"; then
    echo "✓ $test passed"
    ((PASSED++))
  else
    echo "✗ $test failed"
    ((FAILED++))
  fi
  echo ""
done

echo "Results: $PASSED passed, $FAILED failed"
[ $FAILED -eq 0 ] && exit 0 || exit 1
