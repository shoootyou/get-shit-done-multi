#!/bin/bash
# Setup functions for test scenarios

# Get project root (3 levels up from this script)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

# Copy project to isolated tmp directory
setup_test_env() {
  local scenario=$1
  local test_dir="/tmp/gsd-test-preflight-$scenario-$$"
  
  mkdir -p "$test_dir"
  cp -r "$PROJECT_ROOT" "$test_dir/gsd"
  
  echo "$test_dir"
}

# Setup: Remove templates directory
setup_no_templates() {
  local test_dir=$1
  rm -rf "$test_dir/gsd/templates"
}

# Setup: Create path traversal scenario
setup_bad_paths() {
  local test_dir=$1
  # Tests will use --custom-path with traversal
}

# Cleanup test directory
cleanup_test_env() {
  local test_dir=$1
  cd /
  rm -rf "$test_dir"
}
