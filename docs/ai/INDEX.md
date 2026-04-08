# TreeUI AI Docs

This directory is the low-token, machine-oriented documentation layer for TreeUI.

It is optimized for:

- code assistants choosing the right TreeUI component
- agents implementing or reviewing code in this repository
- tools that need canonical setup, selection, and API metadata with minimal prompt cost

It is not optimized for onboarding prose. Human-facing context lives in `README.md`, `ARCHITECTURE.md`, `DESIGN.md`, `CONTRIBUTING.md`, and Storybook.

## Load Order

Load files in this order and stop as soon as you have enough context:

1. `docs/ai/INDEX.md`
2. `docs/ai/CONTRACTS.yaml`
3. `docs/ai/SELECTION.yaml` when choosing between components or patterns
4. `docs/ai/SETUP.yaml` when installation, providers, model formats, or app wiring matter
5. One or more files in `docs/ai/COMPONENTS/`
6. `docs/ai/RECIPES.yaml` when composing multiple components into a feature
7. `docs/ai/TOKENS.yaml` only if visual, spacing, motion, or theming details matter
8. `docs/ai/STANDARDS.yaml` for design-system conformance rules
9. `docs/ai/VALIDATION.yaml` for acceptance-criteria auditing
10. `docs/ai/DECISIONS.md` only if rationale matters

## Canonical Files

- `CONTRACTS.yaml`: global public API rules and shared component conventions
- `SELECTION.yaml`: component-choice heuristics, alternatives, and decision guides
- `SETUP.yaml`: installation, import, provider, and value-format requirements
- `RECIPES.yaml`: cross-component composition guidance
- `TOKENS.yaml`: framework-agnostic visual contract and theme values
- `STANDARDS.yaml`: design-system conformance rules (colors, typography, spacing, motion, icons)
- `VALIDATION.yaml`: per-component acceptance criteria (naming, CSS, states, a11y, docs)
- `COMPONENTS/*.yaml`: component-level public API manifests
- `DECISIONS.md`: rationale behind the contract shape

If a public API changes, update the matching file here in the same change. If a component-selection rule changes, update `SELECTION.yaml` in the same change. If provider or install requirements change, update `SETUP.yaml` in the same change.

## Usage Hints

- For naming, shared props, shared events, or value formats, load `CONTRACTS.yaml`.
- For “which component should I use?”, load `SELECTION.yaml` before any specific component manifest.
- For “how do I wire this correctly in a consumer app?”, load `SETUP.yaml`.
- For a single component change, load `CONTRACTS.yaml` and that component manifest.
- For multi-component feature work, load `RECIPES.yaml` after the relevant manifests.
- For styling or theme work, load `TOKENS.yaml` in addition to the component manifest.
- For rationale, migration context, or intent behind the contracts, load `DECISIONS.md`.

## Coverage

`docs/ai/COMPONENTS/` covers the Storybook-documented public components and key composition subcomponents such as `TAccordionItem`, `TRadioGroup`, `TTabList`, `TTab`, `TTabPanel`, and `TPricingCard`.

## Non-goals

- Duplicate contract data that already lives in YAML
- Long-form examples
- Duplicate prose from Storybook pages
- Full source-code explanations
