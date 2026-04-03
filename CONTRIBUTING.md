# Contributing to TreeUI

Thank you for contributing to TreeUI.

Use the setup in [README.md](./README.md) to install dependencies and start the docs locally. TreeUI treats Docker as the default local runtime.

## Before Opening a Pull Request

Run the quality checks:

```bash
docker compose run --rm workspace pnpm lint
docker compose run --rm workspace pnpm typecheck
docker compose run --rm workspace pnpm test
docker compose run --rm workspace pnpm build
```

If your change touches interaction or accessibility, also run:

```bash
docker compose run --rm e2e
```

## Change Expectations

- Keep APIs consistent with existing component contracts
- Preserve framework-agnostic naming in tokens and utilities
- Prefer composition over one-off props
- Update Storybook when public behavior or states change
- Add or update tests for behavior changes
- Update `docs/ai/CONTRACTS.yaml`, `docs/ai/TOKENS.yaml`, or `docs/ai/COMPONENTS/*` when public contracts change

## Release Notes

Use Changesets for any user-facing package change:

```bash
docker compose run --rm workspace pnpm changeset
```
