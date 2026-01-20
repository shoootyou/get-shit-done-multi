# GitHub Issue Templates

## Purpose
GSD installs a GitHub issue template that captures the minimum context required to run `gsd:new-project` effectively. The template is designed so a new issue can serve as the project intake document.

## Installed files
- `.github/ISSUE_TEMPLATE/gsd-new-project.yml`

## When it is installed
- Local Claude install (`npx get-shit-done-multi --local`)
- GitHub Copilot CLI install (`npx get-shit-done-multi --copilot`)

Global Claude installs do not touch repository files.

## Usage
1. Create a new issue using **GSD New Project**.
2. Fill out the form completely.
3. Start GSD and reference the issue content as the source for project requirements.

## Removing the template
Delete `.github/ISSUE_TEMPLATE/gsd-new-project.yml`.
