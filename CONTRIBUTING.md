# Contributing to TreeUI

Thank you for contributing to TreeUI.

Use the setup in [README.md](./README.md#getting-started) to install dependencies and start the docs locally. Docker is a supported local runtime for the Vue Storybook and the checks below; the React Storybook, the landing page, and the example dashboards run through pnpm.

## Before Opening a Pull Request

Run the quality gates — the same commands CI runs:

```bash
pnpm lint          # ESLint, zero warnings
pnpm typecheck     # TypeScript strict mode across every workspace package
pnpm test          # Vitest unit tests with coverage
pnpm build:site    # what CI builds: packages + landing + both Storybooks + examples
```

If your change touches interaction or accessibility, also run:

```bash
pnpm test:e2e      # Playwright; optional locally, required in CI
```

`pnpm build` is the faster inner loop (packages + Vue Storybook only) and does not cover the landing page, the React Storybook, or the examples — `pnpm build:site` does.

Without a local Node setup, `docker compose run --rm workspace pnpm <cmd>` wraps any of these, and `docker compose run --rm e2e` runs the Playwright suite.

## Change Expectations

- Keep APIs consistent with existing component contracts
- Preserve framework-agnostic naming in tokens and utilities
- Prefer composition over one-off props
- Update Storybook when public behavior or states change
- Add or update tests for behavior changes
- Update the matching contract in `docs/ai/` (see [docs/ai/INDEX.md](./docs/ai/INDEX.md)) when public contracts change

## Release Notes

Use Changesets for any user-facing package change: `pnpm changeset`. See [RELEASING.md](./RELEASING.md) for the full release flow.
