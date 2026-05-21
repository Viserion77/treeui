# Releasing TreeUI

This document describes the **end-to-end contribution and release flow** for the
TreeUI monorepo. It is the source of truth for what is automated, what requires
human action, and how the repository is configured.

## Audience

- Contributors opening pull requests
- Maintainers cutting releases
- Coding agents (Copilot, Claude, etc.) following [AGENTS.md](./AGENTS.md)

## TL;DR

```
feature branch → PR → CI green → review → squash-merge into main
                                                ↓
                                       release workflow runs
                                                ↓
                            Changesets bot opens/updates the "Version Packages" PR
                                                ↓
                                       merge that PR when ready
                                                ↓
                                publishes to npm + tags + GitHub Releases
```

You never edit `package.json` versions or `CHANGELOG.md` files by hand.

## Repository configuration (current state)

These are enforced by GitHub settings on `Viserion77/treeui`. Anything in this
section is mirrored from the live config — keep this section in sync when you
change settings via UI or the GitHub API.

### Branch protection (ruleset `main`, id `16707131`)

- Target: `~DEFAULT_BRANCH` (currently `main`)
- Enforcement: **active**
- Rules:
  - **Pull request required** to merge into `main`
    - 1 approving review
    - Dismiss stale approvals when new commits are pushed
    - Require review from **Code Owners** (see `.github/CODEOWNERS`)
    - Require all review threads to be resolved
    - Allowed merge methods: **squash only**
  - **Required status checks** must pass before merge
    - `validate` (the job in `.github/workflows/ci.yml`)
    - Branch must be up to date with base (`strict`)
  - **Linear history** required (no merge commits on `main`)
  - **Deletion** of the protected branch blocked
  - **Non-fast-forward** pushes blocked (no `--force` to `main`)
- Bypass actors: none. Even admins go through the PR flow.

### Merge button settings

- ✅ Squash merging only (merge commits and rebase merges disabled)
- ✅ Auto-merge available
- ✅ "Update branch" button available
- ✅ Delete head branch after merge

### Actions permissions

- `default_workflow_permissions`: **write** (so `GITHUB_TOKEN` can push tags,
  open PRs, etc. when the workflow declares it)
- `can_approve_pull_request_reviews`: **true** (so the Changesets bot can open
  the version PR)

### Secrets

- `NPM_TOKEN` — npm automation token for publishing the `@treeui/*` scope.

### Environments

- `github-pages` — used by `deploy-pages` job to publish Storybook.

## Workflows

A single workflow file orchestrates everything: [.github/workflows/ci.yml](./.github/workflows/ci.yml)

### `validate` job (runs on every PR and on push to `main`)

Required check for branch protection. Steps:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm test` (Vitest)
5. `pnpm build:packages`
6. `pnpm build:docs` (Storybook)
7. `pnpm exec playwright install --with-deps chromium`
8. `pnpm test:e2e`
9. Uploads `storybook-static` artifact for the pages job.

### `release` job (push to `main` only, after `validate` succeeds)

1. Rebuilds all packages.
2. Verifies that npm tarballs include the expected `dist/style*.css` and
   `dist/index.js` files (`npm pack --dry-run`).
3. Configures npm auth using `NPM_TOKEN`.
4. Runs [`changesets/action@v1`](https://github.com/changesets/action):
   - If `.changeset/*.md` files exist, **opens or updates** a PR titled
     `chore: version packages` against `main`, on branch
     `changeset-release/main`. This PR contains the version bumps and updated
     `CHANGELOG.md` files.
   - If no `.changeset/*.md` files exist (the version PR was just merged),
     **publishes** all bumped packages to npm using
     `pnpm -w exec changeset publish`, creates git tags, and creates GitHub
     Releases.

### `upload-pages` and `deploy-pages` jobs

Run on push to `main`. Deploy the built Storybook to
<https://viserion77.github.io/treeui/>.

## Contributor workflow

```bash
# 1. Branch from main
git switch main && git pull
git switch -c fix/short-description

# 2. Make changes; run the same checks CI will run
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm test:e2e   # optional locally; required in CI

# 3. Describe the change for the changelog
pnpm changeset
#   - select affected packages (the four are linked, so they release together)
#   - choose bump type: patch | minor | major
#   - write a one-paragraph user-facing summary

# 4. Commit and push
git add .
git commit -m "fix: short description"
git push -u origin HEAD

# 5. Open a PR against main
gh pr create --fill --base main
```

### What CI enforces

- `validate` must be green.
- 1 approving review from a code owner (`@Viserion77`).
- All review threads resolved.
- Branch up to date with `main` (use the "Update branch" button or `gh pr update-branch`).
- Squash merge (the only allowed method).

### When you don't need a changeset

Documentation-only or repo-config changes (workflows, CODEOWNERS, dependabot,
this file). Use `pnpm changeset --empty` if you want to record that explicitly,
or just open the PR without one — the changesets bot is happy either way.

## Release workflow (maintainer)

Releases happen by **merging** the auto-generated version PR. There is no
manual `npm publish` step.

```
several feature/fix PRs merge into main
            ↓
release job opens/updates "chore: version packages" PR
            ↓
review the version PR (versions, CHANGELOG entries)
            ↓
squash-merge the version PR
            ↓
release job re-runs on the merge commit
            ↓
publishes @treeui/tokens, @treeui/utils, @treeui/icons, @treeui/vue, @treeui/mcp to npm
            ↓
creates git tag(s) + GitHub Release(s)
```

The four UI packages (`@treeui/tokens`, `@treeui/utils`, `@treeui/icons`,
`@treeui/vue`) are **linked** in [.changeset/config.json](./.changeset/config.json),
so they always release with the same version number. `@treeui/mcp` is also
published by the same release job, but it versions independently.

### Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Release job: "GitHub Actions is not permitted to create or approve pull requests" | `can_approve_pull_request_reviews` is `false` | `gh api -X PUT repos/Viserion77/treeui/actions/permissions/workflow -F default_workflow_permissions=write -F can_approve_pull_request_reviews=true` |
| Release job: `EAUTH` from npm | `NPM_TOKEN` expired or wrong scope | Rotate token at npmjs.com → `gh secret set NPM_TOKEN -R Viserion77/treeui` |
| Version PR has nothing to release | No `.changeset/*.md` files were committed | Add a changeset in a follow-up PR with `pnpm changeset` |
| Status check `validate` not appearing in PR | Workflow not triggered (draft? path filter?) | Mark PR ready for review; CI runs on `pull_request` for all paths |
| Merge button greyed out | Branch behind `main` or required review missing | Click "Update branch"; request review from a code owner |

## Local commands cheat sheet

```bash
pnpm install                          # install all workspace deps
pnpm lint                             # ESLint across all packages
pnpm typecheck                        # vue-tsc + tsc across all packages
pnpm test                             # Vitest suites
pnpm build                            # build packages + Storybook
pnpm build:packages                   # build only @treeui/tokens/@treeui/utils/@treeui/icons/@treeui/vue/@treeui/mcp
pnpm test:e2e                         # Playwright smoke tests against docs site
pnpm changeset                        # create a changeset entry
pnpm changeset status                 # list pending changesets
pnpm ai:catalog                       # regenerate docs/ai/treeui.catalog.json
pnpm mcp:start                        # run the local TreeUI MCP server
```

All commands also work inside Docker:

```bash
docker compose run --rm workspace pnpm <cmd>
```

## See also

- [CONTRIBUTING.md](./CONTRIBUTING.md) — code style, PR checklist, design rules.
- [AGENTS.md](./AGENTS.md) — guidance for coding agents working in this repo.
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) — Copilot-specific repo rules.
- [docs/ai/](./docs/ai/) — machine-oriented API contracts (kept in sync with the code).
