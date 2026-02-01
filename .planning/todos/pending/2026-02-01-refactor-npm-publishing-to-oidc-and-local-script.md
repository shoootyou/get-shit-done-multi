---
created: 2026-02-01T14:59
title: Refactor NPM publishing to use OIDC trusted publishers and local dev script
area: tooling
files:
  - .github/workflows/publish-main.yml
  - .github/workflows/publish-dev.yml
  - docs/releasing.md
---

## Problem

Phase 12.2 implemented two GitHub Actions workflows for NPM publishing:
- `publish-main.yml` - Uses NPM_TOKEN secret for stable releases
- `publish-dev.yml` - Uses NPM_TOKEN secret for pre-releases

Current approach has security and workflow limitations:
1. **Security**: NPM_TOKEN secrets can be compromised; OIDC trusted publishers are more secure
2. **Dev workflow overhead**: Pre-release testing requires GitHub Actions run instead of local validation
3. **Token management**: Requires manual NPM token setup and rotation

## Solution

**Phase 1: Migrate main workflow to OIDC**
- Remove NPM_TOKEN dependency from `publish-main.yml`
- Implement NPM trusted publishers using GitHub OIDC (per https://docs.npmjs.com/trusted-publishers)
- Use GitHub environment "prod" for production releases
- Update `docs/releasing.md` with OIDC setup instructions

**Phase 2: Replace dev workflow with local script**
- Delete `.github/workflows/publish-dev.yml` entirely
- Create `/scripts/publish-dev.sh` (or similar name) with same validation logic:
  - Version validation
  - Tag existence check
  - Run tests
  - Run build
  - Create tarball and test installation in temp dir
  - npm publish --dry-run by DEFAULT
  - Optional `--publish` flag to actually publish to NPM
- Add npm script: `npm run publish-dev` that invokes the shell script
- Update `docs/releasing.md` with local script usage

**Phase 3: Cleanup**
- Remove all references to publish-dev.yml workflow from documentation
- Update releasing guide to clearly distinguish:
  - Stable releases: GitHub Actions workflow (main branch, OIDC, prod environment)
  - Pre-releases: Local script (developers run manually with --publish flag)

## Benefits

1. **Security**: OIDC eliminates long-lived secrets
2. **Speed**: Developers can validate locally without waiting for CI
3. **Flexibility**: Dry-run by default prevents accidental publishes
4. **Simplicity**: One workflow (main) instead of two

## Technical Details

- OIDC setup requires NPM package settings configuration
- GitHub environment "prod" may need approval rules
- Script should preserve all validation steps from current workflow
- Consider script name: `publish-pre.sh`, `release-dev.sh`, or `validate-publish.sh`
