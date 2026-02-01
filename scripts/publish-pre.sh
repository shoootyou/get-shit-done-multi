#!/usr/bin/env bash

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Usage message
usage() {
  cat <<EOF
Usage: $0 <version> [--publish]
       PUBLISH=true $0 <version>

Validate and optionally publish a pre-release version to NPM.

Arguments:
  version     Semantic version (e.g., 1.9.1-beta.1, 2.0.0-rc.2, or 1.9.1)

Flags:
  --publish   Actually publish to NPM (default: dry-run only)

Environment Variables:
  PUBLISH=true   Alternative to --publish flag, useful with npm run

Examples:
  # Direct script invocation:
  $0 1.9.1-beta.1              # Dry-run validation only
  $0 1.9.1-beta.1 --publish    # Validate and publish to NPM

  # Via npm run with environment variable:
  npm run publish-pre 1.9.1-beta.1              # Dry-run
  PUBLISH=true npm run publish-pre 1.9.1-beta.1 # Publish

  # Via npm run with -- separator (also works):
  npm run publish-pre -- 1.9.1-beta.1              # Dry-run
  npm run publish-pre -- 1.9.1-beta.1 --publish    # Publish

EOF
  exit 1
}

# Parse arguments
VERSION=""
PUBLISH_FLAG=""

# Check environment variable first
if [ "$PUBLISH" = "true" ]; then
  PUBLISH_FLAG="true"
fi

for arg in "$@"; do
  case $arg in
    --publish)
      PUBLISH_FLAG="true"
      ;;
    -h|--help)
      usage
      ;;
    *)
      if [ -z "$VERSION" ]; then
        VERSION="$arg"
      else
        echo -e "${RED}❌ Multiple versions specified${NC}"
        usage
      fi
      ;;
  esac
done

if [ -z "$VERSION" ]; then
  echo -e "${RED}❌ Version argument required${NC}"
  usage
fi

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE} NPM Pre-Release Validation & Publishing${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "Version: ${GREEN}$VERSION${NC}"
if [ "$PUBLISH_FLAG" = "true" ]; then
  echo -e "Mode: ${YELLOW}PUBLISH${NC} (will publish to NPM)"
else
  echo -e "Mode: ${GREEN}DRY-RUN${NC} (validation only)"
fi
echo ""

# Step 1: Validate version format
echo -e "${BLUE}[1/9]${NC} Validating version format..."
if ! echo "$VERSION" | grep -qE '^[0-9]+\.[0-9]+\.[0-9]+(-[a-zA-Z0-9.]+)?$'; then
  echo -e "${RED}❌ Invalid version format${NC}"
  echo "Must be X.Y.Z or X.Y.Z-prerelease (e.g., 1.9.1, 1.9.1-beta.1)"
  exit 1
fi
echo -e "${GREEN}✓${NC} Version format valid"

# Step 2: Check if tag exists
echo -e "\n${BLUE}[2/9]${NC} Checking tag existence..."
if git ls-remote --tags origin | grep -q "refs/tags/v${VERSION}$"; then
  echo -e "${RED}❌ Tag v${VERSION} already exists${NC}"
  echo "Please choose a different version or delete the existing tag"
  exit 1
fi
echo -e "${GREEN}✓${NC} Tag v${VERSION} does not exist"

# Step 3: Validate against current package.json version
echo -e "\n${BLUE}[3/9]${NC} Validating against current package.json version..."
CURRENT=$(jq -r '.version' package.json)
echo "Current version: $CURRENT"
echo "Input version: $VERSION"

# Strip pre-release suffixes for comparison
CURRENT_BASE=$(echo "$CURRENT" | sed 's/-.*$//')
INPUT_BASE=$(echo "$VERSION" | sed 's/-.*$//')

if [ "$(printf '%s\n' "$CURRENT_BASE" "$INPUT_BASE" | sort -V | head -n1)" != "$CURRENT_BASE" ]; then
  echo -e "${RED}❌ Input version $VERSION must be >= current version $CURRENT${NC}"
  exit 1
fi
echo -e "${GREEN}✓${NC} Version is valid"

# Step 4: Verify package.json files field
echo -e "\n${BLUE}[4/9]${NC} Verifying package.json files field..."
if ! jq -e '.files' package.json > /dev/null; then
  echo -e "${RED}❌ package.json missing 'files' field${NC}"
  echo "Add a 'files' field to control what gets published"
  exit 1
fi
echo -e "${GREEN}✓${NC} Files field exists"

# Step 5: Update package.json version (ephemeral)
echo -e "\n${BLUE}[5/9]${NC} Updating package.json version..."
jq --arg ver "$VERSION" '.version = $ver' package.json > package.json.tmp
mv package.json.tmp package.json
echo -e "${GREEN}✓${NC} Version updated to $VERSION"

# Step 6: Run tests
echo -e "\n${BLUE}[6/9]${NC} Running tests..."
if ! npm test; then
  echo -e "${RED}❌ Tests failed${NC}"
  git checkout package.json  # Restore original version
  exit 1
fi
echo -e "${GREEN}✓${NC} All tests passed"

# Step 7: Pack and validate installation
echo -e "\n${BLUE}[7/9]${NC} Creating tarball and validating installation..."
TARBALL=$(npm pack)
echo "Created: $TARBALL"

# Save absolute path to tarball before changing directories
TARBALL_PATH="$(pwd)/$TARBALL"

TEMP_DIR=$(mktemp -d)
echo "Testing installation in: $TEMP_DIR"

cd "$TEMP_DIR"
if ! npm install "$TARBALL_PATH" --verbose; then
  echo -e "${RED}❌ Installation test failed${NC}"
  cd -
  rm -rf "$TEMP_DIR"
  rm "$TARBALL_PATH"
  git checkout package.json
  exit 1
fi
cd -
rm -rf "$TEMP_DIR"
echo -e "${GREEN}✓${NC} Tarball installs successfully"

# Step 8: Dry-run publish (always)
echo -e "\n${BLUE}[8/9]${NC} Running npm publish --dry-run..."

# Extract dist-tag from version suffix (e.g., "beta" from "2.0.0-beta.1")
if echo "$VERSION" | grep -q '-'; then
  # Extract the tag name from version (e.g., beta from 2.0.0-beta.1)
  DIST_TAG=$(echo "$VERSION" | sed 's/^[0-9]*\.[0-9]*\.[0-9]*-\([^.]*\).*/\1/')
  echo "Pre-release detected, using dist-tag: $DIST_TAG"
else
  # This script should only be used for pre-releases
  echo -e "${RED}❌ Version $VERSION is not a pre-release${NC}"
  echo "This script is for pre-releases only (e.g., 1.9.1-beta.1)"
  echo "Use GitHub Actions for stable releases"
  rm "$TARBALL_PATH"
  git checkout package.json
  exit 1
fi

if ! npm publish --dry-run --tag "$DIST_TAG"; then
  echo -e "${RED}❌ Dry-run failed${NC}"
  rm "$TARBALL_PATH"
  git checkout package.json
  exit 1
fi
echo -e "${GREEN}✓${NC} Dry-run successful"

# Step 9: Actually publish (if --publish flag)
if [ "$PUBLISH_FLAG" = "true" ]; then
  echo -e "\n${BLUE}[9/9]${NC} Publishing to NPM..."
  
  # Dist-tag was already extracted in step 8
  if ! npm publish --tag "$DIST_TAG" ; then
    echo -e "${RED}❌ Publish failed${NC}"
    rm "$TARBALL_PATH"
    git checkout package.json
    exit 1
  fi
  
  echo -e "${GREEN}✓${NC} Package published to NPM"
  echo -e "View at: ${BLUE}https://www.npmjs.com/package/get-shit-done-multi/v/${VERSION}${NC}"
  
  # Clean up tarball
  rm "$TARBALL_PATH"
  
  # Restore package.json (version update was ephemeral)
  git checkout package.json
  
  echo -e "\n${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN} PUBLISHED SUCCESSFULLY${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
else
  # Dry-run mode - clean up
  rm "$TARBALL_PATH"
  git checkout package.json
  
  echo -e "\n${BLUE}[9/9]${NC} Skipping publish (dry-run mode)"
  echo -e "\n${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW} VALIDATION COMPLETE${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  echo -e "All checks passed! To actually publish, use one of:"
  echo -e "  ${GREEN}./scripts/publish-pre.sh $VERSION --publish${NC}"
  echo -e "  ${GREEN}PUBLISH=true npm run publish-pre $VERSION${NC}"
  echo -e "  ${GREEN}npm run publish-pre -- $VERSION --publish${NC}"
fi
