---
'@treeui/tokens': minor
'@treeui/vue': minor
'@treeui/react': minor
'@treeui/mcp': minor
---

Turn colour into a three-layer, validated, themeable contract.

Colour is now **primitives** (raw values, never referenced, never emitted),
**semantics** (the public API a product fills in), and **derived states** (hover,
press, selected, disabled — computed by the library). A product supplies one
accent and gets a complete, contrast-checked interaction set.

**New**

- `contract.ts` — the versioned semantic token list, the pairs the library
  renders, and the state-distinction rules. One file, `CONTRACT_VERSION` 1.0.
- `validateTheme` / `assertThemeValid` / `validateThemePair` — an exportable
  validator for consumer CI. Failures name the pair, both values, the measured
  ratio and the threshold.
- `createTheme` / `createThemePair` / `createValidatedThemePair` — theming from a
  seed. `accent` is the only required input; `accentSecondary`, `neutral`,
  `status` and pointwise `overrides` are optional and validated identically.
- 53 derived colour variables, including the first press states the library has
  ever shipped, and `--tree-color-border-interactive` (3:1 control boundaries,
  WCAG 1.4.11).
- Storybook → **Foundation → Theme preview**: renders the component set against
  any seed, light and dark, with every contrast pair measured on the page.

**Fixed**

- `TButton` never changed colour on hover — the only feedback was a 1px lift.
  No component in the library had an `:active` rule.
- Disabled was `opacity` in eight different values, dropping muted text to
  roughly 2.2:1 and invisible to any contrast check. It is now a colour held at
  the 3:1 UI floor; opacity survives only where no text is involved.
- Control borders measured 1.29–1.86:1 against 1.4.11's 3:1.
- Seven token values failed AA and were corrected: light `status.warning` and
  chart 2/3/7; dark `brand.primary`, `status.success` and `status.error`.
- The elevation scale emitted a slate umbra on `:root` and reused it on the dark
  surface; shadow colour is now themed via `--tree-color-shadow-rgb`.
- `accentCssVariables` set five variables while the ramp fed fourteen, so a
  runtime accent switch changed a button's rest colour but not its pressed one.
  `useTheme` cleared only those five, leaving nine stale inline properties.
- `deriveBrandRamp` only checked legibility on the soft tint, letting a seeded
  brand land at 4.37:1 on the quietest surface; it now checks both, and no
  longer returns an invisible hover for a near-black or near-white seed.

**Enforced**

- `contract.test.ts` fails on any colour literal outside `primitives.ts` —
  `VALIDATION.yaml` had required this since v0.2 with nothing checking it.
- `tokens-contract-sync.test.ts` fails when `docs/ai/TOKENS.yaml` drifts from
  what the package emits.

No token, prop or CSS variable was removed. See `MIGRATION.md`.
