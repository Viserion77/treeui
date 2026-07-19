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

## Locale Data and Flag Assets

**TreeUI ships no language, locale, or country dataset.** `TLanguageSelect` is options-driven like every other choice control: the application owns its language list and every locale side effect.

- The library has no i18n layer. Every string is a hardcoded English default exposed as an overridable prop, so a bundled language list would be the one piece of data in the package pretending to be localized.
- Library-owned data would have to be duplicated into `@treeui/react` to keep the two packages honest, and per **Portability Boundary** it could never live in `tokens`, `utils`, or `icons` — there is no correct home for it.

**`TFlag` loads flags from a third-party CDN by default.** Bundling ~250 images would dominate the package size for a component most apps never mount.

- `baseUrl` makes self-hosting a configuration change rather than a breaking change. That promotes the path template to public contract: a mirror must serve the same fixed-height segments per `size`, at 1x and 2x.
- **Flat artwork over normalized ratios.** The CDN also offers ratio-normalized endpoints, but it normalizes the ratio only by switching to the *waving* artwork, which reads as decoration beside flat UI icons. TreeUI takes the fixed-height flat endpoints and accepts the varying widths.
- A shared *height* is what actually aligns a column of flags — not a shared ratio. The component keeps each flag's true proportions (Nepal is a pennant, Switzerland is square, Qatar is elongated) and CSS places them in a fixed 3:2 box with `object-fit: contain`, so the outliers centre inside the box instead of being cropped or distorted. 3:2 is the most common national flag ratio, so most flags simply fill it.
- Each step's retina asset is at least twice its box height (`--tree-size-icon-sm/md/lg`), so 2x screens never upscale.
- The text fallback is not an error state, it is the degraded rendering. When the request is blocked by CSP or the network is gone, the component still resolves to the uppercased code.
- Flags are an imprecise proxy for languages: Spanish is not Spain, English is not the US. That is why `code` is optional per option rather than derived from the locale value — the application decides which languages get a flag and which one, and options without a `code` render text only.

**`TLanguageSelect` ships two variants because the control's context decides how much it has to explain itself.**

- `field` is a form control. A label already says what the question is, so the flag leads the trigger, the trigger fills its container, and `width` applies.
- `switcher` is a page-level control for a navbar or app bar, where nothing nearby says what it changes. It earns its translate icon (`TIcon name="languages"`) and its trailing current flag precisely because there is no external label: icon states the purpose, flag states the present value, so the row reads as "page language, now set to this". The trigger sizes to its content, `width` does not apply, and the listbox aligns to the trigger's right edge where a navbar control usually sits.
- `iconOnly` is a `switcher` affordance only, and it drops the accessible name with the visible one — the consumer must supply `aria-label`. A variant flag that removes text cannot invent the replacement.

## Shared Interaction Shape

- Form-like components share one value model so the API feels predictable across inputs
- Overlay components share one open-state model so controlled and uncontrolled behavior stay consistent
- The exact field names are centralized in `CONTRACTS.yaml` so they are not copied across prose docs

## Documentation Strategy

- Storybook is the human-facing explanation layer
- `docs/ai` is the compact contract layer for tooling and automation
- Root markdown files explain repository structure and contributor workflow
- When public behavior changes, the matching contract files should change in the same patch
