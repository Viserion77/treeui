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

You never edit `package.json` versions or `packages/*/CHANGELOG.md` files by hand.

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
    - ⚠️ **`kotlin` and `rust` are NOT yet in the ruleset.** Both jobs run on every
      PR, but until they are added as required checks a red port does not block a
      merge. Adding them is a repository-settings change, not a code change —
      see "Adding the port jobs to the ruleset" below.
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

Not configured yet, and needed before either port can publish:

| Secret                                              | For                               | Notes                                                                                                                  |
| --------------------------------------------------- | --------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `MAVEN_CENTRAL_USERNAME` / `MAVEN_CENTRAL_PASSWORD` | `treeui-tokens`, `treeui-compose` | A Sonotype Central Portal user token, not the account password.                                                        |
| `SIGNING_KEY` / `SIGNING_PASSWORD`                  | the same                          | Maven Central requires a GPG signature on every artifact. Export the private key armoured and store it base64-encoded. |
| `CARGO_REGISTRY_TOKEN`                              | `treeui-tokens`, `treeui-egui`    | A crates.io API token.                                                                                                 |

### Environments

- `github-pages` — used by `deploy-pages` job to publish the docs site.

## Workflows

A single workflow file orchestrates everything: [.github/workflows/ci.yml](./.github/workflows/ci.yml)

### `validate` job (runs on every PR and on push to `main`)

Required check for branch protection. Steps:

1. `pnpm install --frozen-lockfile`
2. `pnpm lint`
3. `pnpm typecheck`
4. `pnpm codegen:native:check` — fails if the generated Kotlin and Rust token
   source in the two ports is not what `@treeui/tokens` would emit right now.
   Fix with `pnpm codegen:native` and commit the result.
5. `pnpm test` (Vitest)
6. `pnpm build:packages`
7. `pnpm build:site` (landing + Vue/React Storybooks + example dashboards)
8. `pnpm exec playwright install --with-deps chromium`
9. `pnpm test:e2e` (with `PW_SKIP_BUILD=1`, reusing the build from step 7)
10. Uploads the `site` artifact for the pages job.

### `kotlin` and `rust` jobs (run on every PR and on push to `main`)

Separate jobs rather than steps in `validate`: each needs a toolchain the Node
build shares nothing with, and a Gradle or Cargo problem should not hold up the
npm packages or the docs site.

- **`kotlin`** — JDK 17 (Temurin), the Android SDK, then `./gradlew build` in
  `packages/compose`. That covers both modules, their lint and their tests.
  It compiles exactly what is committed and does NOT regenerate the token
  source, because `validate` already failed the build if it were stale.
- **`rust`** — `cargo fmt --all -- --check`, `cargo clippy --all-targets -- -D warnings`
  and `cargo test --all` in `packages/egui`, plus a `cargo tree` check asserting
  `treeui-tokens` has no dependencies. The crate already denies `missing_docs`
  and forbids `unsafe_code`; `-D warnings` makes everything else as loud.

### Adding the port jobs to the ruleset

One-time repository-settings change, after the two jobs have run green on a PR:

```bash
gh api -X PUT repos/Viserion77/treeui/rulesets/16707131 \
  --input ruleset.json   # add "kotlin" and "rust" to required_status_checks
```

Do it only once both jobs are reliably green — a required check that flakes
blocks every merge, and the ports are young.

### `release` job (push to `main` only, after `validate` succeeds)

1. Rebuilds all packages.
2. Verifies that the `@treeui/tokens`, `@treeui/vue`, and `@treeui/mcp` tarballs
   include the expected `dist/style*.css`, `dist/index.js`, and `dist/cli.js`
   files (`npm pack --dry-run`). `@treeui/utils`, `@treeui/icons`, and
   `@treeui/react` publish without a tarball check.
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

Run on push to `main`. Deploy the assembled `site/` artifact to
<https://viserion77.github.io/treeui/>: the landing app at the root, the
Storybooks at `/vue` and `/react`, and the example dashboards at
`/examples/dashboard-vue` and `/examples/dashboard-react`.

## Contributor workflow

```bash
# 1. Branch from main
git switch main && git pull
git switch -c fix/short-description

# 2. Make changes; run the quality gates from CONTRIBUTING.md
#    (lint, typecheck, test, build:site; e2e optional locally, required in CI)

# 3. Describe the change for the changelog
pnpm changeset
#   - select affected packages (the four UI packages are linked, so any of them
#     bumped in the same release share a version number)
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
publishes @treeui/tokens, @treeui/utils, @treeui/icons, @treeui/vue, @treeui/react, @treeui/mcp to npm
            ↓
creates git tag(s) + GitHub Release(s)
```

The four UI packages (`@treeui/tokens`, `@treeui/utils`, `@treeui/icons`,
`@treeui/vue`) are **linked** in [.changeset/config.json](./.changeset/config.json),
so any of them bumped in the same release share that version number — they are not
forced to the same number when only some of them change. `@treeui/react` and
`@treeui/mcp` are published by the same release job but version independently.

### Troubleshooting

| Symptom                                                                           | Cause                                           | Fix                                                                                                                                                 |
| --------------------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Release job: "GitHub Actions is not permitted to create or approve pull requests" | `can_approve_pull_request_reviews` is `false`   | `gh api -X PUT repos/Viserion77/treeui/actions/permissions/workflow -F default_workflow_permissions=write -F can_approve_pull_request_reviews=true` |
| Release job: `EAUTH` from npm                                                     | `NPM_TOKEN` expired or wrong scope              | Rotate token at npmjs.com → `gh secret set NPM_TOKEN -R Viserion77/treeui`                                                                          |
| Version PR has nothing to release                                                 | No `.changeset/*.md` files were committed       | Add a changeset in a follow-up PR with `pnpm changeset`                                                                                             |
| Status check `validate` not appearing in PR                                       | Workflow not triggered (draft? path filter?)    | Mark PR ready for review; CI runs on `pull_request` for all paths                                                                                   |
| Merge button greyed out                                                           | Branch behind `main` or required review missing | Click "Update branch"; request review from a code owner                                                                                             |

## Publishing the two ports

Neither port is published yet, and neither is wired into the `release` job. Both
are deliberate: a first publish fixes a coordinate permanently, and the
component sets are young enough that the API will still move.

**Decide the Maven coordinate before the first publish, not after.**
`io.github.viserion77` is verifiable for free through the GitHub account and
needs no domain. `dev.treeui` would read better and match the npm scope, but it
requires owning `treeui.dev` — and changing a published groupId later is a
breaking change for every consumer, so it is a decision to make once.

| Ecosystem | Registry                                       | Coordinate / crate                                      | Docs                          |
| --------- | ---------------------------------------------- | ------------------------------------------------------- | ----------------------------- |
| Kotlin    | Maven Central, via the Sonatype Central Portal | `io.github.viserion77:treeui-tokens`, `:treeui-compose` | Dokka → javadoc.io, automatic |
| Rust      | crates.io                                      | `treeui-tokens`, `treeui-egui`                          | docs.rs, automatic            |

Both names were checked and are free.

What each needs before a first publish:

- **Kotlin** — a verified namespace on the Central Portal, a GPG key published to
  a keyserver, and a publishing plugin in `packages/compose` (the
  `com.vanniktech.maven.publish` plugin handles signing, the POM and the
  staging-repository dance). The module already emits a sources jar and a
  javadoc jar via its `publishing { singleVariant("release") }` block.
- **Rust** — a crates.io account and API token. Publish in dependency order:
  `treeui-tokens` first, then `treeui-egui`, which depends on it by version.
  A path dependency will not publish, so the workspace already declares
  `treeui-tokens = { version = "0.1.0", path = "…" }` — cargo uses the path
  locally and the version on the registry.

Versioning is independent of the npm packages for now. Changesets does not know
about Gradle or Cargo, and pretending it does by hand-editing four files per
release is how a version number stops meaning anything.

## Release commands cheat sheet

The pre-PR quality gates live in
[CONTRIBUTING.md](./CONTRIBUTING.md#before-opening-a-pull-request). The
release-specific commands are:

```bash
pnpm build:packages                   # build the six published packages only
pnpm changeset                        # create a changeset entry
pnpm changeset status                 # list pending changesets
pnpm ai:catalog                       # regenerate docs/ai/treeui.catalog.json
pnpm codegen:native                   # regenerate the ports' token source
pnpm codegen:native:check             # fail if that source is stale (runs in CI)
pnpm mcp:start                        # run the local TreeUI MCP server
```

The two ports build with their own toolchains:

```bash
cd packages/compose && ./gradlew build                        # Kotlin: both modules, lint, tests
cd packages/egui    && cargo fmt --all -- --check \
                    && cargo clippy --all-targets -- -D warnings \
                    && cargo test --all                       # Rust
```

## See also

- [CONTRIBUTING.md](./CONTRIBUTING.md) — code style, PR checklist, design rules.
- [AGENTS.md](./AGENTS.md) — guidance for coding agents working in this repo.
- [.github/copilot-instructions.md](./.github/copilot-instructions.md) — Copilot-specific repo rules.
- [docs/ai/](./docs/ai/) — machine-oriented API contracts (kept in sync with the code).
