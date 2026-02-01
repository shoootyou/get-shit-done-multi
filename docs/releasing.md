# Releasing get-shit-done-multi

## Overview

The `get-shit-done-multi` package uses two separate GitHub Actions workflows for publishing to NPM:

- **Main Branch Workflow** (`publish-main.yml`) - For stable releases (admin-only)
- **Dev Branch Workflow** (`publish-dev.yml`) - For pre-releases and development versions

Both workflows follow the same 15-step validation pipeline but differ in version format requirements and NPM dist-tags.

## Prerequisites

Before publishing:

- **NPM_TOKEN** must be configured in GitHub repository secrets (see [NPM Token Setup](#npm-token-setup))
- **Admin access** required for main branch releases
- **Write access** required for dev branch releases
- Package must pass all tests
- Package must have a `files` field in `package.json`

## Stable Releases (Main Branch)

Use this workflow to publish production-ready stable versions from the `main` branch.

### Step-by-Step Instructions

1. Navigate to the repository on GitHub
2. Click on **Actions** tab
3. Select **"Publish to NPM (Main Branch)"** from the workflow list
4. Click **"Run workflow"** button (top right)
5. Select branch: **`main`**
6. Enter version in format `X.Y.Z` (e.g., `1.9.1`, `2.0.0`)
   - ⚠️ **No pre-release suffixes allowed** (no `-beta`, `-alpha`, `-rc`)
   - Version must be higher than current `package.json` version
7. Click **"Run workflow"** button to start
8. Wait for workflow completion (typically 2-3 minutes)
9. Verify success:
   - Check [NPM package page](https://www.npmjs.com/package/get-shit-done-multi)
   - Check [GitHub Releases](https://github.com/shoootyou/get-shit-done-multi/releases)
   - Verify git tag created: `git fetch --tags && git tag -l "v*"`

### What Happens During Stable Release

The workflow executes these steps in order:

1. ✅ Validates version format (must be `X.Y.Z`)
2. ✅ Checks tag doesn't already exist
3. ✅ Validates version is higher than current
4. ✅ Verifies `package.json` has `files` field
5. ✅ Updates `package.json` version (ephemeral, not committed back)
6. ✅ Installs dependencies (`npm ci`)
7. ✅ Runs tests (`npm test`)
8. ✅ Runs build if build script exists (`npm run build`)
9. ✅ Creates and tests tarball installation
10. ✅ Dry-run publish validation
11. ⚠️ **Point of no return:** Creates annotated git tag `vX.Y.Z`
12. 📦 Creates GitHub release
13. 📦 Publishes to NPM with `latest` dist-tag

Steps 1-10 are "safe" - they can fail without side effects. After step 11, the tag is created and cannot be easily undone.

## Pre-Releases (Dev Branch)

Use this workflow to publish beta, alpha, or release candidate versions from the `dev` branch.

### Step-by-Step Instructions

1. Navigate to the repository on GitHub
2. Click on **Actions** tab
3. Select **"Publish to NPM (Dev Branch)"** from the workflow list
4. Click **"Run workflow"** button (top right)
5. Select branch: **`dev`**
6. Enter version in format `X.Y.Z-prerelease` or `X.Y.Z`
   - Pre-release: `2.0.0-beta.1`, `1.9.2-alpha.1`, `2.1.0-rc.1`
   - Stable: `1.9.1`, `2.0.0` (publishes with `latest` tag)
   - Version must be higher than current `package.json` version
7. Click **"Run workflow"** button to start
8. Wait for workflow completion (typically 2-3 minutes)
9. Verify success:
   - For pre-release: `npm view get-shit-done-multi@beta`
   - For stable: Check [NPM package page](https://www.npmjs.com/package/get-shit-done-multi)
   - Check [GitHub Releases](https://github.com/shoootyou/get-shit-done-multi/releases)

### Pre-release vs Stable on Dev Branch

The dev branch workflow automatically determines the dist-tag based on version format:

| Version Format | Example | NPM Dist-Tag | Install Command |
|----------------|---------|--------------|-----------------|
| `X.Y.Z-suffix` | `2.0.0-beta.1` | `beta` | `npm install get-shit-done-multi@beta` |
| `X.Y.Z` | `1.9.1` | `latest` | `npm install get-shit-done-multi` |

**When to use pre-release versions:**
- Testing breaking changes before stable release
- Gathering feedback on new features
- Release candidates before major versions

**When to use stable from dev:**
- Emergency patches that bypass normal main branch flow
- Special circumstances requiring immediate release

## Version Numbering Conventions

Follow [Semantic Versioning (semver.org)](https://semver.org/) guidelines:

### Stable Versions (X.Y.Z)

- **Major** (X): Breaking changes, incompatible API changes
  - Example: `1.9.1` → `2.0.0`
- **Minor** (Y): New features, backward-compatible
  - Example: `2.0.0` → `2.1.0`
- **Patch** (Z): Bug fixes, backward-compatible
  - Example: `2.1.0` → `2.1.1`

### Pre-release Versions (X.Y.Z-suffix.N)

- **Alpha**: Early development, incomplete features
  - Example: `2.0.0-alpha.1`, `2.0.0-alpha.2`
- **Beta**: Feature-complete, may have bugs
  - Example: `2.0.0-beta.1`, `2.0.0-beta.2`
- **Release Candidate (RC)**: Stable candidate for release
  - Example: `2.0.0-rc.1`, `2.0.0-rc.2`

### Branch-Specific Rules

| Branch | Allowed Formats | Examples | Dist-Tag |
|--------|----------------|----------|----------|
| `main` | `X.Y.Z` only | `1.9.1`, `2.0.0` | `latest` |
| `dev` | `X.Y.Z` or `X.Y.Z-suffix` | `2.0.0-beta.1`, `1.9.1` | `beta` or `latest` |

## Troubleshooting

### Common Failures and Solutions

#### "Tag vX.Y.Z already exists"

**Cause:** The git tag was created manually or by a previous workflow run.

**Solutions:**
1. Choose a different version number (recommended)
2. Delete the tag if it was created by mistake:
   ```bash
   git tag -d vX.Y.Z
   git push origin :refs/tags/vX.Y.Z
   ```
3. Verify the tag was deleted: `git ls-remote --tags origin | grep vX.Y.Z`

#### "Input version X.Y.Z must be higher than current version"

**Cause:** The version you entered is lower than or equal to the version in `package.json`.

**Solutions:**
1. Check current version: `jq -r '.version' package.json`
2. Enter a higher version number
3. Follow semantic versioning rules for incrementing

#### "Tests failed"

**Cause:** Test suite encountered errors.

**Solutions:**
1. Review test output in workflow logs
2. Fix failing tests locally:
   ```bash
   npm test
   ```
3. Commit fixes and re-run workflow

#### "Build failed"

**Cause:** Build script encountered errors.

**Solutions:**
1. Review build output in workflow logs
2. Test build locally:
   ```bash
   npm run build
   ```
3. Fix build errors and re-run workflow

#### "NPM_TOKEN invalid" or "Authentication error"

**Cause:** NPM token is missing, expired, or has insufficient permissions.

**Solutions:**
1. Verify token exists: GitHub → Settings → Secrets → Actions → `NPM_TOKEN`
2. Verify token hasn't expired (check NPM access tokens page)
3. Regenerate token with publish permissions (see [NPM Token Setup](#npm-token-setup))
4. Update GitHub secret with new token

#### "Package scope must be public" or "Payment required"

**Cause:** Scoped packages (e.g., `@org/package`) default to private on NPM.

**Solutions:**
1. Add `publishConfig` to `package.json`:
   ```json
   {
     "publishConfig": {
       "access": "public"
     }
   }
   ```
2. Commit and push changes
3. Re-run workflow

#### "Pre-release version not allowed on main branch"

**Cause:** Attempted to publish version with `-suffix` from main branch.

**Solutions:**
1. Use dev branch workflow for pre-releases
2. Or remove pre-release suffix and publish stable version

#### Orphaned Tag (Tag exists but NPM not published)

**Cause:** Workflow failed after creating git tag but before publishing to NPM.

**Symptoms:**
- Git tag exists: `git tag -l "vX.Y.Z"` shows tag
- NPM doesn't have version: `npm view get-shit-done-multi@X.Y.Z` returns error

**Recovery:**
1. Identify what failed from workflow logs
2. Fix the underlying issue
3. Delete the orphaned tag:
   ```bash
   git tag -d vX.Y.Z
   git push origin :refs/tags/vX.Y.Z
   ```
4. Re-run workflow with same version

**Prevention:** The workflow validates extensively before creating tags to minimize this scenario.

## NPM Token Setup

Maintainers need to create an NPM access token and add it to GitHub repository secrets.

### Creating NPM Access Token

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Click on your profile → **Access Tokens**
3. Click **Generate New Token**
4. Choose token type:
   - **Granular Access Token** (recommended for security)
   - **Classic Automation Token** (simpler, less restrictive)

#### Granular Access Token (Recommended)

1. Name: `GitHub Actions - get-shit-done-multi`
2. Expiration: **1 year** (recommended, set calendar reminder to rotate)
3. Packages and scopes:
   - Permissions: **Read and write**
   - Packages: Select **`get-shit-done-multi`**
4. Organizations: (leave default if not org-scoped)
5. IP allowlist: (optional, leave empty for GitHub Actions)
6. Click **Generate Token**

#### Classic Automation Token

1. Name: `GitHub Actions - get-shit-done-multi`
2. Type: **Automation**
3. Click **Generate Token**

**⚠️ Important:** Copy the token immediately - you won't be able to see it again.

### Adding Token to GitHub Secrets

1. Go to repository on GitHub
2. Click **Settings** tab
3. Navigate to **Secrets and variables** → **Actions**
4. Click **New repository secret**
5. Name: `NPM_TOKEN`
6. Secret: Paste the NPM token
7. Click **Add secret**

### Token Rotation Schedule

- **Recommended:** Rotate tokens annually
- Set calendar reminder for 2 weeks before expiration
- Generate new token before old one expires
- Update GitHub secret immediately
- Test with dry-run: trigger workflow but it will validate token

### Verifying Token Permissions

Test token locally before adding to GitHub:

```bash
# Create temporary .npmrc
echo "//registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE" > .npmrc.test

# Test authentication
npm whoami --userconfig .npmrc.test

# Test publish permissions (dry-run)
npm publish --dry-run --userconfig .npmrc.test

# Clean up
rm .npmrc.test
```

## Workflow Behavior

Understanding what happens at each stage helps with troubleshooting.

### Validation Phase (Can Fail Safely)

These steps can fail without creating any artifacts:

1. **Version format validation** - Checks regex pattern
2. **Tag existence check** - Prevents duplicate tags
3. **Version comparison** - Ensures monotonic version increase
4. **Files field check** - Prevents publishing empty packages
5. **Version update** - Modifies package.json (not committed)
6. **Dependency installation** - Downloads dependencies
7. **Test execution** - Runs test suite
8. **Build execution** - Compiles/bundles if needed
9. **Tarball creation** - Creates package archive
10. **Dry-run publish** - Simulates NPM publish

If any step fails, no git tag or release is created, and nothing is published.

### Point of No Return

**Step 11: Create git tag**

Once the git tag is pushed to the remote repository:
- Tag is **immutable** and should not be deleted
- Deletion requires manual intervention
- Subsequent failures require manual cleanup

This is why extensive validation happens before this step.

### Publishing Phase

After tag creation:

12. **GitHub release creation** - Creates release on GitHub
13. **NPM publish** - Uploads package to NPM registry

If either fails, manual intervention is required to fix and complete the release.

## Manual Recovery

If a workflow fails after tag creation, follow these steps.

### Scenario: Workflow Failed After Tag Creation

1. **Identify failure point** from workflow logs
2. **Check what exists:**
   ```bash
   # Check if tag exists
   git ls-remote --tags origin | grep vX.Y.Z
   
   # Check if GitHub release exists
   gh release view vX.Y.Z
   
   # Check if NPM package exists
   npm view get-shit-done-multi@X.Y.Z
   ```

3. **Fix the underlying issue** (auth, network, etc.)

4. **Complete the release manually or delete tag:**

   **Option A: Complete release manually**
   ```bash
   # If tag exists but release missing
   gh release create vX.Y.Z --title "Release vX.Y.Z" --notes "Release vX.Y.Z"
   
   # If release exists but NPM missing
   # (requires local setup with .npmrc)
   npm publish
   ```
   
   **Option B: Delete tag and retry workflow**
   ```bash
   # Delete local tag
   git tag -d vX.Y.Z
   
   # Delete remote tag
   git push origin :refs/tags/vX.Y.Z
   
   # Delete GitHub release if created
   gh release delete vX.Y.Z --yes
   
   # Re-run workflow with same version
   ```

### Tag Deletion Process

Only delete tags if:
- Release never completed
- NPM package was never published
- No users have pulled the tag

**Steps:**
```bash
# 1. Delete local tag
git tag -d vX.Y.Z

# 2. Delete remote tag
git push origin :refs/tags/vX.Y.Z

# 3. Verify deletion
git ls-remote --tags origin | grep vX.Y.Z  # Should return nothing

# 4. Delete GitHub release if it exists
gh release delete vX.Y.Z --yes
```

## Screenshots and Examples

### Successful Release Output

When a release succeeds, you'll see:

**Workflow Summary:**
```
✓ Version format valid: 1.9.1
✓ Tag v1.9.1 does not exist
✓ Input version 1.9.1 is higher than current 1.9.0
✓ package.json has 'files' field
✓ package.json updated
✓ Version update verified: 1.9.1
✓ Tarball installation test passed
✓ Dry-run publish successful
✓ Git tag v1.9.1 created and pushed
✓ GitHub release created
✓ Package published to NPM
View at: https://www.npmjs.com/package/get-shit-done-multi/v/1.9.1
```

**NPM Page:**
- Latest version shows: `1.9.1`
- Published: "a few seconds ago"
- Install command works: `npm install get-shit-done-multi`

**GitHub Releases:**
- New release appears: `v1.9.1`
- Release notes: "Published version 1.9.1 to NPM"

### Failed Validation Examples

**Example 1: Invalid version format**
```
❌ Invalid version format: must be X.Y.Z (no pre-release suffixes on main)
Examples: 1.9.1, 2.0.0, 1.10.5
Got: 2.0.0-beta.1
```

**Example 2: Tag already exists**
```
❌ Tag v1.9.1 already exists
Please choose a different version or delete the existing tag
```

**Example 3: Version not higher**
```
Current version in package.json: 2.0.0
Input version: 1.9.1
❌ Input version 1.9.1 must be higher than current version 2.0.0
```

## Best Practices

1. **Always test locally first**
   ```bash
   npm ci
   npm test
   npm run build  # if applicable
   ```

2. **Follow semantic versioning** - Increment version appropriately based on changes

3. **Use pre-releases for breaking changes** - Test with beta users before stable release

4. **Document breaking changes** - Update changelog and release notes

5. **Verify package contents** before publishing:
   ```bash
   npm pack --dry-run
   ```

6. **Test installation** after publishing:
   ```bash
   npm install get-shit-done-multi@latest
   # or
   npm install get-shit-done-multi@beta
   ```

7. **Monitor NPM page** for successful publish confirmation

8. **Set up notifications** - Watch repository to get notified of workflow failures

## Additional Resources

- [Semantic Versioning Specification](https://semver.org/)
- [NPM Publishing Documentation](https://docs.npmjs.com/cli/v10/commands/npm-publish)
- [GitHub Actions Workflow Syntax](https://docs.github.com/en/actions/using-workflows/workflow-syntax-for-github-actions)
- [Package.json `files` field](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#files)
