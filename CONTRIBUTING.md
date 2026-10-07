# Contributing to TreeUI

Thank you for contributing to TreeUI.

Use the setup in [README.md](./README.md#getting-started) to install dependencies and start the docs locally. Docker is a supported local runtime for the Vue Storybook and the checks below; the React Storybook, the landing page, and the example dashboards run through pnpm.

## Before Opening a Pull Request

Run the quality gates — the same commands CI runs:

```bash
pnpm lint                        # ESLint, zero warnings
pnpm typecheck                   # TypeScript strict mode across every workspace package
pnpm codegen:native:check        # the ports' generated token source matches the model
pnpm test                        # Vitest unit tests with coverage
pnpm build:site                  # what CI builds: packages + landing + both Storybooks + examples
pnpm typecheck:strict-templates  # typechecks consumer templates against the built package (strictTemplates)
pnpm check:theme                 # validates the example's accent presets against the colour contract
```

If `codegen:native:check` fails, run `pnpm codegen:native` and commit what it
writes. It means the token model changed and the Kotlin and Rust ports are
carrying the previous release's values.

`typecheck:strict-templates` and `check:theme` both read the **built**
package, not the source, so they run after `build:site` here — in CI they sit
between the dedicated `build:packages` step and the `build:site` step, but
this list has no standalone `build:packages` line, since `build:site` already
runs it first.

If your change touches interaction or accessibility, also run:

```bash
pnpm test:e2e      # Playwright; optional locally, required in CI
```

`pnpm build` is the faster inner loop (packages + Vue Storybook only) and does not cover the landing page, the React Storybook, or the examples — `pnpm build:site` does.

Without a local Node setup, `docker compose run --rm workspace pnpm <cmd>` wraps any of these, and `docker compose run --rm e2e` runs the Playwright suite.

If your change touches the **Kotlin** or **Rust** port, run that port's own gate too — neither is covered by the commands above, and each has its own CI job:

```bash
cd packages/compose && ./gradlew build          # Kotlin: both modules, lint, tests
cd packages/egui    && cargo fmt --all -- --check \
                    && cargo clippy --all-targets -- -D warnings \
                    && cargo test --all         # Rust
```

The Kotlin build needs JDK 17 and the Android SDK; the Rust build needs a stable toolchain with `rustfmt` and `clippy`. Neither port's job is a required status check yet — see [RELEASING.md](./RELEASING.md#branch-protection-ruleset-main-id-16707131).

## Change Expectations

- Keep APIs consistent with existing component contracts — across all four ecosystems, not just the one you are editing
- Preserve framework-agnostic naming in tokens and utilities
- Never re-declare a closed vocabulary (sizes, variants, tones) in a framework package; it lives in `@treeui/tokens` and is re-exported
- Never hand-edit a generated file (`Generated.kt`, `generated.rs`) — change the model and regenerate
- Prefer composition over one-off props
- Update Storybook when public behavior or states change
- Add or update tests for behavior changes
- Update the matching contract in `docs/ai/` (see [docs/ai/INDEX.md](./docs/ai/INDEX.md)) when public contracts change

## Release Notes

Use Changesets for any user-facing package change: `pnpm changeset`. See [RELEASING.md](./RELEASING.md) for the full release flow.
