#!/bin/bash
# Execution script for Plan 12.1-02: Migrate Copilot Platform
# This script completes the migration of Copilot platform files
set -e

cd "$(dirname "$0")/.."

# Source git identity helpers
if ! type commit_as_user >/dev/null 2>&1; then
    source .github/get-shit-done/workflows/git-identity-helpers.sh
fi

echo "=== Plan 12.1-02: Migrate Copilot Platform ==="
echo ""

# Task 1: Migrate Copilot platform source files
echo "Task 1: Migrate Copilot platform source files"
mkdir -p bin/lib/platforms/copilot
git mv bin/lib/frontmatter/copilot-validator.js bin/lib/platforms/copilot/validator.js
git mv bin/lib/serialization/copilot-serializer.js bin/lib/platforms/copilot/serializer.js
git mv bin/lib/serialization/copilot-cleaner.js bin/lib/platforms/copilot/cleaner.js
git mv bin/lib/platforms/copilot-adapter.js bin/lib/platforms/copilot/adapter.js

# Update imports in moved files
sed -i '' "s|from './base-adapter.js'|from '../base-adapter.js'|g" bin/lib/platforms/copilot/adapter.js
sed -i '' "s|from './platform-paths.js'|from '../platform-paths.js'|g" bin/lib/platforms/copilot/adapter.js
sed -i '' "s|from './instruction-paths.js'|from '../instruction-paths.js'|g" bin/lib/platforms/copilot/adapter.js
sed -i '' "s|from '../serialization/copilot-serializer.js'|from './serializer.js'|g" bin/lib/platforms/copilot/adapter.js
sed -i '' "s|from './base-validator.js'|from '../../frontmatter/base-validator.js'|g" bin/lib/platforms/copilot/validator.js
sed -i '' "s|from '../cli/logger.js'|from '../../cli/logger.js'|g" bin/lib/platforms/copilot/validator.js
sed -i '' "s|from './copilot-serializer.js'|from './serializer.js'|g" bin/lib/platforms/copilot/cleaner.js

git add bin/lib/platforms/copilot/
commit_as_user "refactor(12.1-02): migrate Copilot platform files to platforms/copilot/

- Move copilot-adapter.js → platforms/copilot/adapter.js
- Move copilot-validator.js → platforms/copilot/validator.js  
- Move copilot-serializer.js → platforms/copilot/serializer.js
- Move copilot-cleaner.js → platforms/copilot/cleaner.js
- Update internal imports to use relative paths
"
TASK1_COMMIT=$(git rev-parse --short HEAD)
echo "✓ Task 1 committed: $TASK1_COMMIT"
echo ""

# Task 2: Migrate Copilot platform test files
echo "Task 2: Migrate Copilot platform test files"
mkdir -p tests/unit/platforms/copilot
git mv tests/unit/copilot-serializer.test.js tests/unit/platforms/copilot/serializer.test.js

# Update imports in test file
sed -i '' "s|from '../../bin/lib/serialization/copilot-serializer.js'|from '../../../../bin/lib/platforms/copilot/serializer.js'|g" tests/unit/platforms/copilot/serializer.test.js

git add tests/unit/platforms/copilot/
commit_as_user "refactor(12.1-02): migrate Copilot test files to tests/unit/platforms/copilot/

- Move copilot-serializer.test.js → tests/unit/platforms/copilot/serializer.test.js
- Update import paths to reflect new source file locations
"
TASK2_COMMIT=$(git rev-parse --short HEAD)
echo "✓ Task 2 committed: $TASK2_COMMIT"
echo ""

# Task 3: Update imports in files that use Copilot platform
echo "Task 3: Update imports in files that use Copilot platform"
sed -i '' "s|from '../frontmatter/copilot-validator.js'|from '../platforms/copilot/validator.js'|g" bin/lib/installer/install-skills.js
sed -i '' "s|from '../serialization/copilot-cleaner.js'|from '../platforms/copilot/cleaner.js'|g" bin/lib/installer/install-skills.js

git add bin/lib/installer/install-skills.js
commit_as_user "refactor(12.1-02): update imports to use new Copilot platform paths

- Update CopilotValidator import in install-skills.js
- Update cleanCopilotFrontmatter import in install-skills.js
- All imports now reference platforms/copilot/ directory
"
TASK3_COMMIT=$(git rev-parse --short HEAD)
echo "✓ Task 3 committed: $TASK3_COMMIT"
echo ""

# Task 4: Validate Copilot migration with install test
echo "Task 4: Validate Copilot migration with install test"
mkdir -p /tmp/gsd-test-copilot-migration
cd /tmp/gsd-test-copilot-migration
node "$(dirname "$0")/../../bin/install.js" --copilot --yes

if [ $? -eq 0 ]; then
    echo "✓ Install test passed"
    echo "✓ Checking installed files..."
    ls -la .github/skills/ .github/agents/ 2>/dev/null || echo "Note: Some directories may not exist"
    cd /
    rm -rf /tmp/gsd-test-copilot-migration
    echo "✓ Task 4 complete"
else
    echo "✗ Install test failed"
    cd /
    rm -rf /tmp/gsd-test-copilot-migration
    exit 1
fi

echo ""
echo "=== All tasks completed ==="
echo "Task 1 (source migration): $TASK1_COMMIT"
echo "Task 2 (test migration): $TASK2_COMMIT"
echo "Task 3 (import updates): $TASK3_COMMIT"
echo "Task 4 (validation): ✓"
