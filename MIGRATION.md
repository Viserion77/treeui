# Migrating to the TreeUI colour contract (v1.0)

This guide is for **every product consuming TreeUI**, not one of them. It
assumes nothing about which components you use, whether you theme at all, or
which framework package you are on.

**Nothing was removed.** Every token, prop and CSS variable that worked before
this release still works and still means the same thing. You can upgrade,
change nothing, and ship — see [Path A](#path-a-do-nothing). The rest of this
document is about what you gain by doing more.

---

## What changed, in one paragraph

Colour in TreeUI is now three layers instead of one. **Primitives** hold raw
values and nothing references them. **Semantics** (`--tree-color-bg-surface`,
`--tree-color-brand-primary`, …) are the public API — the list your product
fills in. **Derived states** (hover, press, selected, disabled) are computed by
the library from your semantics, so a product that supplies one colour gets a
complete, contrast-checked set of interaction states. A validator ships with the
package so a broken theme fails your build instead of shipping.

---

## Path A: do nothing

Upgrade the package. Your app keeps working.

You will see four visual differences, all of them deliberate:

| What you will notice | Why |
|---|---|
| Buttons now change colour on hover and have a pressed state | Hover previously changed no colour at all — the only feedback was a 1px lift — and no component in the library had a `:active` rule. |
| Disabled controls are grey rather than faded | `opacity` on muted text measured roughly 2.2:1 against the surface. Disabled is now a colour, held at the 3:1 floor. |
| Input, select, checkbox and radio borders are darker | They measured 1.29–1.86:1. WCAG 1.4.11 asks for 3:1 on the boundary that identifies a control. Card and divider edges are unchanged. |
| Shadows are near-black in dark mode | The elevation scale emitted a slate umbra on `:root` and reused it verbatim on the dark surface. |

Six token values moved by a step or two to clear AA. If you have a screenshot
test suite, expect diffs on these and nothing else:

| Token | Was | Is | Why |
|---|---|---|---|
| `--tree-color-status-warning` (light) | `#9a6700` | `#956400` | 4.33:1 on `bg.subtle` |
| `--tree-color-brand-primary` (dark) | `#539bf5` | `#559cf5` | 4.47:1 on `bg.subtle` |
| `--tree-color-status-success` (dark) | `#57ab5a` | `#59ac5c` | 4.48:1 on `bg.subtle` |
| `--tree-color-status-error` (dark) | `#f47067` | `#f5766e` | 4.47:1 on `bg.subtle` |
| `--tree-color-chart-2` (light) | `#1baf7a` | `#12855c` | 2.82:1 on the surface |
| `--tree-color-chart-3` (light) | `#eda100` | `#8a6100` | 2.17:1 on the surface |
| `--tree-color-chart-7` (light) | `#e87ba4` | `#c4587f` | 2.69:1 on the surface |

---

## Path B: adopt the derived states

If your app writes its own hover, press or disabled colours over TreeUI
components, you can delete that CSS. The table below maps every recipe the
library itself used to have — if you copied one out of TreeUI's stylesheet, this
is what it becomes.

### Old recipe → new token

| What you probably wrote | Replace with | Notes |
|---|---|---|
| `opacity: 0.5` (or `.4`/`.45`/`.55`/`.6`/`.65`/`.68`) on a disabled control | `background: var(--tree-color-state-disabled-bg)`<br>`color: var(--tree-color-state-disabled-fg)`<br>`border-color: var(--tree-color-state-disabled-border)` | Eight different values existed. If the element carries no text (an icon, a thumbnail), use `opacity: var(--tree-opacity-disabled)` instead. |
| `background: var(--tree-color-bg-subtle)` as a hover | `var(--tree-color-state-hover-bg)` | `bg-subtle` is a recessed band, not a state. Nearly the same value; now it has a name. |
| *(nothing — there was no press state)* | `var(--tree-color-state-press-bg)` | |
| `color-mix(in srgb, var(--tree-color-status-error) 14%, var(--tree-color-bg-surface))` | `var(--tree-color-status-error-soft)` | Also replaces the 8%, 10%, 12%, 16% and 18% spellings of the same idea. |
| `color-mix(in srgb, var(--tree-color-status-error) 36%, var(--tree-color-border-default))` | `var(--tree-color-status-error-border)` | Also replaces 30%, 40%, 45%, 50%. The old recipe produced a ~1.8:1 edge on the tint; the token clears 3:1. |
| `var(--tree-color-text-inverse)` as ink on a status fill | `var(--tree-color-status-<s>-contrast)` | Computed per status per theme. White on the light warning measured 4.87:1 and broke on any lighter amber. |
| `var(--tree-color-brand-primary)` as ink on `brand.soft` | `var(--tree-color-brand-on-soft)` | On the shipped dark tint the raw brand measured 4.44:1. |
| `var(--tree-color-brand-hover)` for a pressed state | `var(--tree-color-brand-press)` | Press is a bigger step than hover, and now differs from it. |

### The full derived set

Read these; do not set them. Setting one is unsupported and the next release may
change how it is computed.

```
--tree-color-{brand,accent}-press
--tree-color-{brand,accent}-soft-hover
--tree-color-{brand,accent}-soft-press
--tree-color-{brand,accent}-on-soft
--tree-color-{brand,accent}-on-soft-hover
--tree-color-{brand,accent}-on-soft-press
--tree-color-status-{success,warning,error,info}-hover
--tree-color-status-{success,warning,error,info}-press
--tree-color-status-{success,warning,error,info}-soft
--tree-color-status-{success,warning,error,info}-soft-hover
--tree-color-status-{success,warning,error,info}-border
--tree-color-status-{success,warning,error,info}-contrast
--tree-color-status-{success,warning,error,info}-on-soft
--tree-color-status-{success,warning,error,info}-on-soft-hover
--tree-color-state-hover-bg
--tree-color-state-press-bg
--tree-color-state-selected-bg
--tree-color-state-selected-fg
--tree-color-state-selected-border
--tree-color-state-disabled-bg
--tree-color-state-disabled-fg
--tree-color-state-disabled-border
--tree-color-border-interactive
```

---

## Path C: theme by seed

If your product has a brand colour, this replaces every hand-written theme
override you have.

```ts
import { createThemePair, createSemanticThemeCss } from '@treeui/tokens';

const { light, dark } = createThemePair({ accent: '#7c3aed' });

const css = [
  createSemanticThemeCss('acme', light, 'light', '[data-tree-theme="acme"]'),
  createSemanticThemeCss('acme', dark, 'dark', '[data-tree-theme="acme-dark"]'),
].join('\n\n');
```

That one input produces both modes, the hover and press ramps, the tints, the
ink that goes on top of the accent, the focus ring, and every interaction state.

Optional inputs, in the order most products need them:

| Field | Required | What it does |
|---|---|---|
| `accent` | **yes** | Your brand colour. Walked toward the surface if it is not legible as ink on its own tint. |
| `accentSecondary` | no | A second voice. Defaults to the library's secondary accent. |
| `neutral` | no | Tints the greys toward a hue, preserving luminance so nothing's contrast moves. |
| `status` | no | Override any of `success`/`warning`/`error`/`info`. **Statuses are never derived from your accent** — success staying green when your brand is red is the point. |
| `overrides` | no | Pointwise per-mode overrides of any semantic token. Validated like everything else. |

### Runtime accent switching

If your app lets users pick an accent, `accentCssVariables` now returns the full
derived set, not just the five brand variables:

```ts
import { accentCssVariables } from '@treeui/tokens';

for (const [name, value] of Object.entries(accentCssVariables(userAccent, mode))) {
  document.documentElement.style.setProperty(name, value);
}
```

If you were calling this already, no change is needed — you simply stop getting
a half-applied theme, where the rest colour moved but the pressed colour did
not.

---

## Path D: validate in CI

This is the part that keeps the contract true over time. Add one script:

```ts
// scripts/check-theme.ts
import { assertThemeValid } from '@treeui/tokens';
// The extension is required: `--experimental-strip-types` does no extension
// resolution, so `'../src/theme'` fails with ERR_MODULE_NOT_FOUND.
import { light, dark } from '../src/theme.ts';

assertThemeValid(light, 'light', { label: 'acme-light' });
assertThemeValid(dark, 'dark', { label: 'acme-dark' });
```

```jsonc
// package.json
"scripts": {
  "check:theme": "node --experimental-strip-types scripts/check-theme.ts"
}
```

It throws on failure, so a red build says exactly what to change:

```
FAIL @treeui/tokens colour contract v1.0 — acme-light (light): 47/50 pairs pass
  error  [acme-light] contrast 3.91:1 is below 4.5:1 — text.muted (#8a94a0) on
         bg.subtle (#eff2f5). Help text, captions, placeholders.
  error  [acme-light] state is not distinguishable: brand.press (#0c101b) vs
         brand.hover (#0e1420) measures 1.031:1, below 1.05:1. Press vs hover on
         a primary button would give no visible feedback.
```

If your product does not have one theme but a RANGE — an accent picker, a
per-tenant brand colour — validate the range, not the default. A worked example
is `examples/dashboard-vue`: `src/theme.ts` exports the accents it offers plus a
`checkAccent` helper, `scripts/check-theme.ts` runs every preset through it in
CI, and the settings drawer runs a custom accent through the same helper at pick
time, so the build and the running app can never disagree about what passes.

If you seed rather than hand-author, use `createValidatedThemePair`, which does
both in one pass:

```ts
const { themes, results, valid } = createValidatedThemePair({ accent: '#7c3aed' });
if (!valid) {
  console.error(results.map(formatValidationResult).join('\n'));
  process.exit(1);
}
```

### What it checks

1. **Every required semantic token is present.**
2. **Every text-on-background pair the library renders clears WCAG AA** — 4.5:1
   for normal text, 3:1 for UI elements and inactive controls. The pair list is
   `CONTRAST_PAIRS` in `@treeui/tokens`, not a heuristic.
3. **Every interactive state is visibly different from the state it replaces.**
   This is the check that catches a hover nobody can see.

Disabled text is held to 3:1 rather than 4.5:1. WCAG 1.4.3 exempts inactive
controls from the text floor entirely; 3:1 is a deliberate tightening of that
exemption, and a large improvement on the ~2.2:1 that `opacity` produced.

---

## Deprecated, still working

| Deprecated | Replacement | Removed in |
|---|---|---|
| `<TButton variant="danger">` | `<TButton variant="solid" tone="danger">` | Next major. Composes with every variant; `variant="danger"` could only ever be a filled red button. |
| `--tree-color-border-default` on a **form control** boundary | `--tree-color-border-interactive` | Not removed — it is still correct for cards, dividers and table rules. Only control boundaries should move. |
| `opacity` for a disabled control that carries text | `--tree-color-state-disabled-*` | Not removed. `--tree-opacity-disabled` remains correct for icon-only and composite elements. |

Nothing in this table emits a runtime warning today, because nothing in it is
broken — each is a better expression of something that still works.

---

## Free-form colour props

`TChart`, `TDonutChart` and `TSparkline` accept `color?: string` per series.
These are the only places in the public API that take an arbitrary colour, and
they are unvalidated: a value passed here is not measured for contrast and does
not participate in theming.

Prefer `--tree-color-chart-1` … `--tree-color-chart-8`, which are validated for
CVD separation and hold ≥3:1 against their own theme's surface. If you must pass
a literal, check it yourself:

```ts
import { contrastRatio, parseHex, treeThemes } from '@treeui/tokens';

const ratio = contrastRatio(parseHex(mySeriesColor), parseHex(treeThemes.light.color.bg.surface));
if (ratio < 3) throw new Error(`Series colour ${mySeriesColor} is invisible: ${ratio.toFixed(2)}:1`);
```

---

## Reference

| Thing | Where |
|---|---|
| The versioned semantic list | `packages/tokens/src/contract.ts` (`SEMANTIC_TOKENS`) |
| Every raw colour value | `packages/tokens/src/primitives.ts` |
| How states are derived | `packages/tokens/src/states.ts` |
| The validator | `packages/tokens/src/validate.ts` |
| Seeding | `packages/tokens/src/seed.ts` |
| Machine-readable token contract | `docs/ai/TOKENS.yaml` |
| Live preview for any seed | Storybook → **Foundation → Theme preview** |
