# TreeUI AI Decisions

This file explains why the contracts look the way they do. Exact prop names, event names, value formats, and token values live in `CONTRACTS.yaml`, `TOKENS.yaml`, and `COMPONENTS/*.yaml`.

## Naming

- `T<Name>` is the public naming for all components, exported types, and BEM CSS classes (`.t-button`)
- The earlier `Tree<Name>` export aliases and `Tree*.vue` source filenames were removed in favor of a single `T`-prefixed surface
- Design-token CSS variables keep the `--tree-*` prefix because they belong to the framework-agnostic token layer, not the Vue component surface

## Variant Vocabulary

Variant names are scoped to an axis, not shared across every component. Two components can both accept `variant` without accepting the same values.

- **Action variants** (`solid | outline | ghost | soft | danger`) describe *emphasis on an interactive control*. `solid` here means "filled with the brand color" — `TButton`, `TBadge`, `TTag`.
- **Card variants** (`outline | soft | inset`) describe a *surface scale*: plain, tinted, recessed. There is no brand fill and no inversion.

`TCard` previously accepted a `solid` variant that swapped the text and background tokens (`background: var(--tree-color-text-primary)`). It was removed because:

- It made `solid` a homonym. On a button `solid` meant "brand blue"; on a card it meant "inverted neutral". In dark themes the two diverged visibly — the button stayed blue while the card turned light.
- It coupled a *surface* role to a *text* token. Any theme overriding `color.text.primary` silently changed the card surface, and the inverted result was not guaranteed to stay legible.
- Inverting the surface broke every nested component, which still read the normal tokens. The fix was a `.t-card--solid > *` block re-scoping seven tokens — a cascade that never covered every case and was never ported to React.

**For a high-emphasis card, use a brand-colored border** rather than an inverted surface. If a genuinely inverted surface is needed later, it should arrive as first-class tokens (`--tree-color-bg-inverse` + a matching on-inverse text token) defined per theme, not as a runtime swap of two unrelated tokens.

## Density

**TreeUI has no density axis.** Spacing density is expressed through the existing `size` prop (`sm | md | lg`), which every sized component already accepts.

A separate density axis was considered and rejected for now. It would be a *token-layer* decision, not a component prop: a real density system needs a scoped selector (like `[data-tree-theme]`) that re-emits the spacing scale, and today `createFoundationCss` emits `:root` unconditionally while the typed theme contract is color-only. Adding a density prop per component would instead multiply every component's variant matrix for an effect `size` already delivers.

The example dashboards label their `size` control "Density" because that is the term end users recognize in a preferences panel. That label is an *application* choice mapping onto `size` (Compact→`sm`, Comfortable→`md`, Spacious→`lg`) — it is not a TreeUI API. Consumer apps are free to present `size` under whatever label fits their product.

## Portability Boundary

- Tokens, variants, sizes, accessibility expectations, and interaction patterns stay framework-agnostic
- Vue-specific concerns stay inside `@treeui/vue` so future framework packages do not inherit Vue vocabulary

## Shared Interaction Shape

- Form-like components share one value model so the API feels predictable across inputs
- Overlay components share one open-state model so controlled and uncontrolled behavior stay consistent
- The exact field names are centralized in `CONTRACTS.yaml` so they are not copied across prose docs

## Documentation Strategy

- Storybook is the human-facing explanation layer
- `docs/ai` is the compact contract layer for tooling and automation
- Root markdown files explain repository structure and contributor workflow
- When public behavior changes, the matching contract files should change in the same patch
