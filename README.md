# TreeUI

Clean components for modern Vue products.

TreeUI is an open source component library for Vue 3 with a framework-ready foundation. The first release stays intentionally small and focuses on production-oriented components, strong accessibility defaults, and token-driven theming that can outlive a single framework package.

Public Vue components use the `T` prefix, such as `TButton`, `TInput`, `TDatePicker`, and `TModal`.

## Why TreeUI

- Clean visual language with production-oriented defaults
- Accessibility-first interactions and predictable state contracts
- Semantic tokens and themes that stay framework-agnostic
- A compact API surface that is easier to maintain and extend
- Docker-first local workflow for teams without a local Node setup

## Getting Started

### Docker workflow

```bash
docker compose run --rm workspace pnpm install
docker compose up docs
```

Open [http://localhost:6006](http://localhost:6006) for documentation and component stories.

### Common commands

```bash
docker compose run --rm workspace pnpm lint
docker compose run --rm workspace pnpm typecheck
docker compose run --rm workspace pnpm test
docker compose run --rm workspace pnpm build
docker compose run --rm e2e
```

## Workspace Layout

```text
apps/docs          Storybook documentation and playground
packages/tokens    Framework-agnostic design tokens and themes
packages/utils     Shared accessibility and interaction helpers
packages/icons     Curated icon registry and defaults
packages/vue       Vue 3 component package and plugin entry
tooling            Docker, ESLint, and TypeScript shared config
```

## Documentation Map

- `README.md`: project overview, quickstart, and repo map
- `ARCHITECTURE.md`: package boundaries and portability rules
- `DESIGN.md`: design principles and review checklist
- `CONTRIBUTING.md`: contributor workflow, quality gates, and release notes
- `docs/ai/`: compact, canonical contracts for tools and automation

The human-facing product docs and component playground live in Storybook under `apps/docs`.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before opening a pull request.

## License

MIT. See [LICENSE](./LICENSE).
