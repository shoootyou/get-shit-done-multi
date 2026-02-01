# Releasing get-shit-done-multi

## Overview

The `get-shit-done-multi` package uses two different approaches for publishing to NPM:

- **Stable Releases** - Automated GitHub Actions workflow using OIDC trusted publishers (main branch, admin-only)
- **Pre-Releases** - Local script for fast validation and optional publishing

## Prerequisites

**For Stable Releases:**
- Admin access to repository required
- NPM package configured for GitHub OIDC trusted publishers (see [OIDC Setup](#oidc-setup))
- GitHub environment "prod" configured (optional: with approval rules)

**For Pre-Releases:**
- NPM authentication configured locally (`npm login` or `.npmrc`)
- Write access to repository (optional, for git operations)

**General:**
- Package must pass all tests
- Package must have a `files` field in `package.json`

---

## Stable Releases (Main Branch)

Use the GitHub Actions workflow to publish production-ready stable versions from the `main` branch.

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

### Key Features

- **OIDC Authentication**: Uses GitHub's OpenID Connect for secure, tokenless authentication
- **Provenance**: Publishes with `--provenance` flag for supply chain security
- **Environment Protection**: Uses GitHub environment "prod" (can configure approval rules)
- **No Secrets Required**: No NPM_TOKEN needed, eliminating token rotation and compromise risks

---

## Pre-Releases (Local Script)

Use the local script `publish-pre.sh` for fast validation and optional publishing of pre-release versions.

### Why Local?

- ⚡ **Faster**: No CI wait time, instant feedback
- 🔍 **Safe**: Dry-run by default prevents accidental publishes
- 🛠️ **Flexible**: Test locally before committing
- 🎯 **Simple**: One command for complete validation

### Quick Start

**Dry-run validation only** (recommended first):
```bash
npm run publish-pre -- 2.0.0-beta.1
```

**Validate and publish** (after dry-run succeeds):
```bash
npm run publish-pre -- 2.0.0-beta.1 --publish
```

> **Note:** The `--` separator is required when passing flags through `npm run`. It tells npm to pass everything after it to the script.

### Step-by-Step Instructions

1. Ensure you're authenticated to NPM:
   ```bash
   npm login
   ```

2. Choose your version:
   - Pre-release: `2.0.0-beta.1`, `1.9.2-alpha.1`, `2.1.0-rc.1`
   - Stable: `1.9.1`, `2.0.0` (will use `latest` dist-tag)

3. Run validation (dry-run):
   ```bash
   npm run publish-pre -- 2.0.0-beta.1
   ```

4. Review output and verify all checks pass

5. If validation succeeds, publish:
   ```bash
   npm run publish-pre -- 2.0.0-beta.1 --publish
   ```

6. Verify success:
   - For pre-release: `npm view get-shit-done-multi@beta`
   - For stable: Check [NPM package page](https://www.npmjs.com/package/get-shit-done-multi)

### What Happens During Pre-Release

The script executes these steps in order:

1. ✅ Validates version format (`X.Y.Z` or `X.Y.Z-prerelease`)
2. ✅ Checks tag doesn't already exist
3. ✅ Validates version is >= current version
4. ✅ Verifies `package.json` has `files` field
5. ✅ Updates `package.json` version (ephemeral, restored after)
6. ✅ Runs tests (`npm test`)
7. ✅ Creates and tests tarball installation in temp directory
8. ✅ Dry-run publish validation (`npm publish --dry-run`)
9. 📦 **If --publish flag:** Publishes to NPM with appropriate dist-tag

### Dist-Tag Selection

The script automatically determines the dist-tag:

| Version Format | Example | NPM Dist-Tag | Install Command |
|----------------|---------|--------------|-----------------|
| `X.Y.Z-suffix` | `2.0.0-beta.1` | `beta` | `npm install get-shit-done-multi@beta` |
| `X.Y.Z` | `1.9.1` | `latest` | `npm install get-shit-done-multi` |

### When to Use Pre-release Versions
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
1. Review build output in workflow logs or local script output
2. Test build locally:
   ```bash
   npm run build
   ```
3. Fix build errors and re-run workflow/script

#### "Authentication error" or "OIDC authentication failed"

**Cause (Stable Releases):** OIDC trusted publisher not configured or misconfigured.

**Solutions:**
1. Verify trusted publisher exists on npmjs.com package settings
2. Check repository owner/name match exactly
3. Verify workflow name is `publish-main.yml`
4. Check environment name (`prod`) if configured
5. See [OIDC Setup](#oidc-setup) for detailed instructions

**Cause (Pre-Releases):** Not authenticated to NPM locally.

**Solutions:**
1. Run `npm login` to authenticate
2. Verify `~/.npmrc` has valid authentication token
3. Check token hasn't expired (regenerate if needed)

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

---

## OIDC Setup

The stable release workflow uses GitHub's OpenID Connect (OIDC) for secure, tokenless authentication to NPM.

### Benefits of OIDC

- ✅ **No Tokens**: Eliminates long-lived secrets and token rotation
- ✅ **More Secure**: No risk of token compromise or leak
- ✅ **Automatic**: GitHub generates short-lived tokens per workflow run
- ✅ **Provenance**: Built-in supply chain security with npm provenance

### Setting Up NPM Trusted Publishers

This is a **one-time setup** for repository maintainers.

1. **Log in to npmjs.com**
   - Go to [npmjs.com](https://www.npmjs.com/)
   - Sign in with your account

2. **Navigate to Package Settings**
   - Go to your package: `get-shit-done-multi`
   - Click **Settings** tab

3. **Configure Publishing**
   - Scroll to **Publishing access** section
   - Click **Add trusted publisher**

4. **Add GitHub Actions Publisher**
   - **Provider**: Select **GitHub Actions**
   - **Repository owner**: `shoootyou` (or your org/username)
   - **Repository name**: `get-shit-done-multi`
   - **Workflow name**: `publish-main.yml`
   - **Environment**: `prod` (optional but recommended)
   - Click **Add**

5. **Verify Setup**
   - You should see the publisher listed under "Trusted publishers"
   - No additional secrets needed in GitHub

### GitHub Environment Setup (Optional)

For additional security, configure the "prod" environment:

1. Go to repository **Settings** → **Environments**
2. Click **New environment**
3. Name: `prod`
4. Configure protection rules (optional):
   - **Required reviewers**: Add maintainers for approval requirement
   - **Wait timer**: Add delay before deployment (e.g., 5 minutes)
   - **Deployment branches**: Restrict to `main` branch only
5. Click **Save protection rules**

### Troubleshooting OIDC

If publishing fails with authentication error:

1. Verify trusted publisher is configured correctly on npmjs.com
2. Check workflow file has `id-token: write` permission (already configured)
3. Verify repository owner and name match exactly
4. Check environment name matches (`prod`) if configured
5. Review [npm documentation](https://docs.npmjs.com/trusted-publishers) for updates

---

## NPM Authentication for Pre-Releases

For the local pre-release script, you need NPM authentication configured locally.

### Option 1: npm login (Recommended)

```bash
npm login
```

Follow the prompts to authenticate. This creates a token in your `~/.npmrc` file.

### Option 2: Manual .npmrc Configuration

If you prefer token-based auth:

1. Generate NPM access token (see NPM Token section below if needed)
2. Add to `~/.npmrc`:
   ```
   //registry.npmjs.org/:_authToken=YOUR_TOKEN_HERE
   ```

### NPM Token for Local Development

If you need to generate a token for local use:

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Profile → **Access Tokens** → **Generate New Token**
3. Choose **Granular Access Token**:
   - Name: `Local Development - get-shit-done-multi`
   - Expiration: **30 days** or **90 days**
   - Packages: **Read and write** on `get-shit-done-multi`
4. Copy token and add to `~/.npmrc` (see above)

⚠️ **Never commit tokens to git or share them publicly**

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
