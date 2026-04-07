# TreeUI AI Docs

This directory is the low-token, machine-oriented documentation layer for TreeUI.

It is optimized for:

- code assistants
- agents making changes in this repository
- models consuming only the minimum context needed for a task

It is not optimized for onboarding prose. Human-facing context lives in `README.md`, `ARCHITECTURE.md`, `DESIGN.md`, and `CONTRIBUTING.md`.

## Load Order

Load files in this order and stop as soon as you have enough context:

1. `docs/ai/INDEX.md`
2. `docs/ai/CONTRACTS.yaml`
3. One or more files in `docs/ai/COMPONENTS/`
4. `docs/ai/TOKENS.yaml` only if visual, spacing, motion, or theming details matter
5. `docs/ai/STANDARDS.yaml` for design system conformance rules
6. `docs/ai/VALIDATION.yaml` for per-component acceptance criteria audit
7. `docs/ai/DECISIONS.md` only if rationale matters

## Canonical Files

- `CONTRACTS.yaml`: global public API rules and shared component conventions
- `TOKENS.yaml`: framework-agnostic visual contract and theme values
- `STANDARDS.yaml`: design system conformance rules (colors, typography, spacing, motion, icons)
- `VALIDATION.yaml`: per-component acceptance criteria (naming, CSS, states, a11y, docs)
- `COMPONENTS/*.yaml`: component-level public API manifests
- `DECISIONS.md`: rationale behind the contract shape

If a public API changes, update the matching file here in the same change.

## Usage Hints

- For naming, shared props, shared events, or value formats, load `CONTRACTS.yaml`.
- For a single component change, load `CONTRACTS.yaml` and that component manifest.
- For styling or theme work, load `TOKENS.yaml` in addition to the component manifest.
- For rationale, migration context, or intent behind the contracts, load `DECISIONS.md`.

## Component Manifests

- `COMPONENTS/button.yaml`
- `COMPONENTS/combobox.yaml`
- `COMPONENTS/empty-state.yaml`
- `COMPONENTS/input.yaml`
- `COMPONENTS/card.yaml`
- `COMPONENTS/badge.yaml`
- `COMPONENTS/spinner.yaml`
- `COMPONENTS/tooltip.yaml`
- `COMPONENTS/date-picker.yaml`
- `COMPONENTS/modal.yaml`

## Non-goals

- Duplicate contract data that already lives in YAML
- Long-form examples
- Duplicate prose from Storybook pages
- Full source-code explanations
