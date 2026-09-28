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

`tone` is scoped the same way, and for the same reason: it names a *semantic role*, and which roles a component can express depends on what it renders.

| Type | Values | Why it differs |
|---|---|---|
| `TBadgeTone`, `TStatTone` | `neutral · success · warning · danger · info` | Status surfaces. The full status scale applies. |
| `TTimelineTone` | `neutral · brand · success · warning · danger` | A timeline marks progress, so `brand` (current step) replaces `info`. |
| `TLinkTileTone` | `neutral · brand · success · warning · danger · info` | A navigational tile can be either, so it carries both. |
| `TTextTone` | `default · muted · inverse · brand` | Text tone is a *legibility* role against a surface, not a status. It shares no values with the others by design. |

A component takes the narrowest union it can honestly render. Do not widen one to match another.

## Density

**TreeUI has no density axis.** Spacing density is expressed through the existing `size` prop (`sm | md | lg`), which 50 components accept.

Four components deliberately spell `size` differently, because they are not sizing a control:

- `TContainer` — `sm | md | lg | xl | full`: a page width, not a control height.
- `TText` — `xs | sm | md | lg | xl | 2xl | 3xl`: the type scale, which is longer than the control scale.
- `TIcon` — `number | string`: a glyph edge length, usually driven by a `--tree-size-icon-*` token.
- `TDonutChart` — `number`: a drawing dimension in a fixed-geometry SVG.

Anything that renders a *control* uses `TSize`. These four do not, and forcing them onto a three-step scale would cost more than it buys.

A separate density axis was considered and rejected for now. It would be a *token-layer* decision, not a component prop: a real density system needs a scoped selector (like `[data-tree-theme]`) that re-emits the spacing scale, and today `createFoundationCss` emits `:root` unconditionally while the typed theme contract is color-only. Adding a density prop per component would instead multiply every component's variant matrix for an effect `size` already delivers.

The example dashboards label their `size` control "Density" because that is the term end users recognize in a preferences panel. That label is an *application* choice mapping onto `size` (Compact→`sm`, Comfortable→`md`, Spacious→`lg`) — it is not a TreeUI API. Consumer apps are free to present `size` under whatever label fits their product.

## Portability Boundary

- Tokens, variants, sizes, accessibility expectations, and interaction patterns stay framework-agnostic
- Vue-specific concerns stay inside `@treeui/vue` so future framework packages do not inherit Vue vocabulary

**A renderer of the token model belongs in `@treeui/tokens`.** `css.ts` has always emitted custom
properties from that package, and `kotlin.ts` and `rust.ts` now emit Kotlin and Rust source the same
way. This looks like it violates "no framework-specific code in tokens" and does not: a renderer
emits text and imports nothing, so the package stays dependency-free and the alternative is worse —
an emitter living beside the port it feeds is an emitter that can drift from the model it renders,
and 84 colours times two themes is not a number that survives drift.

**What actually crosses over to a non-web ecosystem.** There is no CSS in Compose or in egui, so the
`t-*` class layer is a web implementation detail rather than a contract. What the ports reproduce is:
the resolved token model; the closed vocabularies; which colour each interaction state resolves to;
and the accessibility floor — a 44×44 target, a focus indicator that clears 3:1, a reported role and
name, and disabled expressed as a measured colour rather than an opacity.

**The closed vocabularies live in `@treeui/tokens`, not in a framework package.** They were in
`@treeui/vue`, which left `@treeui/react` maintaining a hand-typed copy — with a comment admitting
it — and left the two ports with nowhere to import them from. A closed set kept in four places is
not closed. `@treeui/vue` and `@treeui/react` now re-export; the ports generate their enums.

**A port reproduces the contract, not the contract's mistakes.** `variant="danger"` is a colour
trapped in the shape scale and is deprecated on the web, where it stays because removing it would
break consumers. A port shipping today has no consumers to break, so `treeDeprecatedVariants`
declares the exclusion as data and the emitters leave those members out. Shipping a known mistake
into a second ecosystem to match the first is how a deprecation becomes permanent.

**The tone axis is data, and the stylesheet is tested against it.** The mapping from a tone to the
ten colours it resolves to was only ever expressed as seven blocks of CSS. It is now
`NATIVE_TONES`, and `@treeui/vue`'s `tone-contract.test.ts` parses the shipped stylesheet and fails
when the two disagree — so one decision has three renderings and no copy.

**Three values the ports need are still stranded in the stylesheet.** The 44px target floor,
`--tree-focus-ring-width` and `--tree-focus-ring-offset` are literals in
`packages/vue/src/styles/index.css` rather than tokens, so each port restates them as a documented
constant. They should move into `treeTokens`; recorded here rather than fixed so the reason is
written down.

**The icon registry is Vue-coupled today.** `@treeui/icons` renders through `defineComponent`/`h` and declares a `vue` peer dependency, so despite sitting beside `tokens` and `utils` it is not framework-agnostic and `@treeui/react` cannot consume it. This is recorded rather than fixed: a React icon layer would need the SVG data and the registry lookup extracted from the Vue rendering, which is a package split, not a patch. Until that happens, treat only `tokens` and `utils` as the framework-agnostic pair.

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

## What Is Not an Icon

Names and categories leave the icon catalog for the same reason: each put a
decision inside the library that belongs to the product using it.

**An interactive control is a component, not a glyph.** `toggle-left` and
`toggle-right` drew a switch. TreeUI ships `TSwitch`, which is a switch — with
keyboard operation, `role="switch"`, focus-visible treatment and a 44×44 target.
A picture of one has none of that, and shipping it invites
`<TIcon name="toggle-right" />` where `<TSwitch>` was meant. The rule: if the
thing depicted is a control the library already builds, the catalog does not
draw it. The same test rules out a checkbox, a radio, a slider or a progress
bar as an icon.

The rule is about *depicting the control itself*, not about the concepts those
controls express. `check`, `circle-check` and `square-check` stay: a tick is a
statement about state, drawn in running text, in a list, on a badge. It is
`TCheckbox` that owns "a box the user can click".

**A category describes what an icon draws, not who uses it.** There was a
`product` category holding sixteen glyphs — `market`, `storage`, `tasks`,
`trail` and the rest. Whether `market` is a product mark or just a shop front is
decided by whatever renders it, so "products" recorded an application's decision
as library metadata: two applications would file the same glyph differently, and
the category answered no question a search can ask. It also made those sixteen
unfindable by anyone searching for what they actually show. They are now filed by
subject: `market` under commerce, `storage` under data, `assistant` under ai,
`trail` under navigation.

They still share a rounded-square container, which is a drawing treatment and
stays — `FRAMED_GLYPH_NAMES` in `icons.ts` is where that treatment is applied,
and its name says what it is rather than who it is for.

**A name is held to the same rule as a category.** It describes the subject
drawn, never the application that renders it. A name that only reads as a
subject from inside one product is renamed to what the drawing shows, and the
old name is removed rather than aliased — an alias would keep the unsearchable
name working, which is the entire cost being removed.
