---
"@treeui/vue": minor
"@treeui/react": minor
---

Harden the consumer-facing contract for icon-only actions, loading buttons, plain-text output, table semantics, and immersive layouts.

**TButton — icon-only actions (`iconOnly`, `label`)**

`iconOnly` renders a square control that matches its size token instead of a padded pill, and suppresses the `t-button__label` wrapper. Because the `icon` slot is `aria-hidden`, an icon-only button needs an explicit name — `label` is the first-class channel and is rendered as `aria-label`. Mirrored in `@treeui/react` (which names itself via `aria-label`).

**TButton — localized, single-glyph loading (`loadingLabel`, `hideIconWhileLoading`)**

The loading announcement was hardcoded to English "Loading" with no way to translate it. `loadingLabel` forwards to the nested spinner, so the state is announced in the app's locale — consistent with TreeUI shipping English defaults as overridable props rather than an i18n layer.

The spinner also used to render *beside* a supplied icon, showing two glyphs and widening the button mid-action. The spinner now replaces the icon by default. **Behavior change:** pass `hideIconWhileLoading: false` to restore the previous spinner + icon + label order.

**TText — `preserveWhitespace`**

Renders authored line breaks and blank lines as written (`white-space: pre-wrap`) while still wrapping long lines, so plain-text output such as AI responses no longer needs a local `white-space: pre-wrap` class. Mutually exclusive with `truncate`, which wins when both are set.

**TTable — honest semantics and a reachable accessible name (`caption`)**

TTable applied `role="grid"` without implementing the composite-widget keyboard model — no roving tabindex, no `gridcell`/`row` roles, no 2D arrow-key navigation. Screen readers announced an interactive grid and offered cell navigation that did not exist. **Behavior change:** the explicit role is removed and the component is now a native reading table. An opt-in interactive grid mode is deliberately withheld until the keyboard model ships.

The accessible name was also unreachable: `role="grid"` sat on the `<table>` while attributes fell through to the `.t-table-wrapper` scroll container, so a consumer's `aria-label` never reached the named element. `inheritAttrs` is now false — `class`/`style` stay on the wrapper and every other attribute is forwarded to the `<table>`. The new `caption` prop renders a visible `<caption>`.

**TAppShell — `immersive`**

Hides the header and sidebar so content fills the viewport, replacing consumer-side `:deep()` overrides of `.t-app-shell__header` / `.t-app-shell__sidebar` plus a re-templated grid. The chrome is hidden with CSS rather than unmounted, so toggling never remounts the default slot. Follows the existing controllable pattern (`immersive` / `defaultImmersive` + `update:immersive` / `immersive-change`).

Because immersive hides the chrome, the default slot is the only place an exit control can live, so it now also receives `immersive` and `toggleImmersive`. `AppShellSlotProps` gains both.

**Internal glyphs now resolve through the icon registry**

`TAppShell` (hamburger, collapse toggle), `TTag` (remove) and `TTable` (sort affordances) rendered hand-inlined SVGs that bypassed `@treeui/icons`. They now resolve through the registry, so they follow the same geometry and any registry override. The collapse toggle additionally reflects direction (`panel-left` / `panel-right`) instead of a single static glyph. Expect small visual diffs where the registry geometry differs from the old inline paths.
