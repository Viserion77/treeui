# @treeui/icons

The icon registry behind TreeUI's Vue components, with a curated built-in catalog of 364 names.

Icons are looked up **by name**, and applications extend the registry with their own icons rather than importing a second icon package. Three ways in:

- `TIcon` takes `name` — a registered name, and only a name. It does not accept a component.
- `TNavMenu` items take `icon?: TIconInput` — a name *or* a component. This is the only icon field in the library that takes either.
- Everything else takes icons through **slots**. `TButton` and `TBadge` have no `icon` prop; you pass `<TIcon name="..." />` into `#icon` (or the default slot).

## Install

Most applications never install this package directly. Everything below is re-exported from `@treeui/vue`:

```ts
import { TIcon, registerTreeIcons, type TIconName } from '@treeui/vue';
```

Install it on its own only when you need the registry outside the Vue component layer:

```bash
pnpm add @treeui/icons vue
```

`vue` is a peer dependency: icons are built as Vue components.

## Rendering an icon

```vue
<script setup lang="ts">
import { TIcon } from '@treeui/vue';
</script>

<template>
  <TIcon name="cpu" />
  <TIcon name="triangle-alert" :size="32" />
  <TIcon name="log-out" label="Sign out" />
</template>
```

`TIcon` is decorative by default (`aria-hidden="true"`). Passing `label` promotes it to `role="img"` with that accessible name — use it when the icon is the only thing conveying meaning, and leave it off when adjacent text already says it.

Inside a slot, that same `TIcon` is how a button or a badge gets its icon:

```vue
<TButton variant="solid">
  <template #icon><TIcon name="download" /></template>
  Export
</TButton>
```

`TNavMenu` is the one place that takes an icon as data, on its items:

```ts
const items: TNavMenuItem[] = [
  { label: 'Overview', value: 'overview', icon: 'layout-dashboard', to: '/' },
  { label: 'Servers', value: 'servers', icon: 'server', to: '/servers' },
];
```

`label` and `value` are both required — `value` is what `v-model` selects on. The route target is `to`, not `href`.

Prefer the name over a component here. A string is never made reactive, whereas a component object stored in a `ref` or `reactive` trips Vue's reactivity warning unless you remember to `markRaw` it.

## Built-in icons

Names use TreeUI's descriptive kebab-case vocabulary, so related concepts remain predictable across components.

The catalog covers application chrome, actions, status, files, products, and product-specific workflows. Company logos are not built-ins; when one is needed, register its official SVG as an app-owned component.

| | | | |
|---|---|---|---|
| `account` | `activity` | `ai-studio` | `alert-circle` |
| `align-left` | `app-window` | `apps-grid` | `archive` |
| `archive-restore` | `arrow-down` | `arrow-left` | `arrow-left-right` |
| `arrow-right` | `arrow-up` | `arrow-up-right` | `assistant` |
| `automation-key` | `automations` | `badge` | `badge-check` |
| `badge-star` | `ban` | `bell` | `book-open` |
| `bookmark` | `bot` | `bot-badge` | `bot-users` |
| `boxes` | `boxes-model` | `braces` | `brackets` |
| `brain` | `brain-circuit` | `brain-lock` | `browser` |
| `brush` | `brush-stroke` | `bug` | `building-2` |
| `calculator` | `calendar` | `calendar-clock` | `calendar-day` |
| `calendar-days` | `calendar-dot` | `calendar-plus` | `calendar-range` |
| `calendar-x` | `carousel` | `catalog` | `chart-column` |
| `chart-line` | `chart-pie` | `chat` | `check` |
| `check-circle` | `check-square` | `chevron-down` | `chevron-left` |
| `chevron-right` | `chevron-up` | `chevron-updown` | `chevrons-up-down` |
| `circle-alert` | `circle-check` | `circle-dot` | `circle-help` |
| `circle-x` | `clipboard-list` | `clock` | `clock-alert` |
| `clock-sparkles` | `clock-x` | `close` | `cloud` |
| `cloud-off` | `code` | `code-2` | `code-api` |
| `coins` | `comment` | `companion` | `compass` |
| `connections` | `contentpilot` | `copy` | `cpu` |
| `cpu-chip` | `credit-card` | `crosshair` | `crown` |
| `cube` | `database` | `developer-settings` | `device-link` |
| `dollar-circle` | `dollar-limit` | `download` | `download-video` |
| `draw` | `droplet` | `ellipsis` | `ellipsis-vertical` |
| `embed-code` | `eraser` | `extension` | `external-link` |
| `eye` | `eye-off` | `file` | `file-archive` |
| `file-audio` | `file-code` | `file-edit` | `file-image` |
| `file-pdf` | `file-plus` | `file-scan` | `file-text` |
| `file-video` | `file-warning` | `files` | `film` |
| `filter` | `filter-capabilities` | `fingerprint` | `flag` |
| `flask-play` | `folder` | `folder-input` | `folder-kanban` |
| `folder-open` | `folder-plus` | `folder-shared` | `folder-tree` |
| `folder-x` | `folders` | `gauge` | `gauge-high` |
| `gauge-low` | `gauge-medium` | `gavel` | `git-branch` |
| `git-fork` | `globe` | `globe-check` | `grid` |
| `grip-vertical` | `hand-check` | `hard-drive` | `hard-drive-alert` |
| `hard-drive-off` | `hash` | `heart` | `heart-chart-up` |
| `heart-pulse` | `help` | `hierarchy` | `history` |
| `home` | `hourglass` | `house` | `human-lock` |
| `id-badge` | `image` | `image-minus` | `image-plus` |
| `image-up` | `inbox` | `inbox-empty` | `info` |
| `install` | `journal` | `key` | `key-off` |
| `key-round` | `languages` | `laptop` | `laptop-bridge` |
| `layers` | `layout-dashboard` | `layout-grid` | `layout-kanban` |
| `leaf` | `library-books` | `life-buoy` | `lightbulb` |
| `lightbulb-sparkles` | `line-width` | `link` | `link-2` |
| `link-off` | `list` | `list-checks` | `list-ordered` |
| `list-rule` | `list-todo` | `llm` | `loader-circle` |
| `lock` | `lock-keyhole` | `log-in` | `log-out` |
| `log-out-all` | `magic-wand` | `mail` | `mail-check` |
| `mail-open` | `mail-plus` | `mail-warning` | `mails` |
| `market` | `maximize-2` | `megaphone` | `memory-stick` |
| `menu` | `message-circle` | `message-square` | `message-square-plus` |
| `messages-square` | `mic` | `microphone` | `minimize-2` |
| `minus` | `minus-square` | `monitor-home` | `monitor-smartphone` |
| `moon` | `more-horizontal` | `mouse-pointer-2` | `move-horizontal` |
| `network` | `network-nodes` | `newsletter` | `newspaper` |
| `octagon-x` | `package` | `package-download` | `page-snapshot` |
| `palette` | `panel-left` | `panel-right` | `panels-top-left` |
| `paper-plane` | `paperclip` | `pause` | `pause-circle` |
| `pencil` | `persona` | `piggy-bank` | `pipette` |
| `play` | `play-circle` | `plug` | `plug-cloud` |
| `plug-off` | `plug-plus` | `plugin` | `plus` |
| `price-tag` | `publish` | `quote` | `radio` |
| `radio-tower` | `receipt` | `refresh` | `refresh-cw` |
| `refresh-cw-off` | `repeat` | `repeat-2` | `repeat-fallback` |
| `repeat-interval` | `responses-list` | `rocket` | `rotate-ccw` |
| `rotate-cw` | `route` | `rss` | `save` |
| `scale` | `scan` | `search` | `search-x` |
| `send` | `send-check` | `send-request` | `server` |
| `server-api` | `server-environment` | `settings` | `settings-2` |
| `share` | `share-nodes` | `shield` | `shield-check` |
| `shield-lock` | `shield-question` | `shield-x` | `shopping-basket` |
| `shopping-cart` | `shuffle` | `signal` | `signal-high` |
| `signal-low` | `signal-medium` | `signal-off` | `siren` |
| `sliders-horizontal` | `smartphone` | `sparkles` | `square` |
| `square-check` | `square-plus` | `square-terminal` | `star` |
| `sticker` | `storage` | `store` | `story` |
| `sun` | `support` | `target` | `target-choice` |
| `tasks` | `terminal` | `ticket` | `ticket-plus` |
| `tickets` | `timeline` | `timer` | `toggle-left` |
| `toggle-right` | `token-input` | `token-output` | `trail` |
| `trash-2` | `trend-up` | `triangle-alert` | `type` |
| `unlink` | `unplug` | `upload` | `upload-cloud` |
| `user` | `user-check` | `user-cog` | `user-minus` |
| `user-plus` | `user-round` | `user-x` | `users` |
| `users-round` | `vault` | `volume-2` | `wallet` |
| `wand-sparkles` | `warehouse` | `workflow` | `workspace` |
| `wrench` | `wrench-zap` | `x` | `zap` |

`listTreeIcons()` returns this list at runtime, including anything you have registered.

Twelve compatibility names preserve the migration vocabulary without duplicating a visual:

| Alias | Canonical name | Alias | Canonical name |
|---|---|---|---|
| `grid` | `layout-grid` | `share` | `share-nodes` |
| `chevron-updown` | `chevrons-up-down` | `refresh` | `refresh-cw` |
| `comment` | `message-circle` | `chat` | `message-circle` |
| `check-square` | `square-check` | `help` | `circle-help` |
| `automations` | `zap` | `connections` | `external-link` |
| `persona` | `user-round` | `close` | `x` |

Every glyph inherits the surrounding text colour through the root `currentColor` stroke. Company logos are not built-ins; import the official SVG as an app-owned component and register it under the name your application uses.

Every built-in glyph is original TreeUI geometry authored locally for this catalog.
The set uses TreeUI's Branchline visual language: rounded 24×24 strokes,
shared structural frames, and consistent modifiers for status and actions.

## Registering your own icons

Call `registerTreeIcons` once near the application root. Registered names then work everywhere a built-in name works. Registering later is fine too: lookups are reactive, so an icon registered by a lazily loaded route appears in components that already rendered.

Pick a name the built-in set does not already use. Registration is an upsert, not an add: any of the 364 names above will be **replaced** app-wide, which is a legitimate thing to do deliberately and a confusing one to do by accident.

### Geometry form

Pass the children of the `<svg>` as `[tag, attrs]` pairs, drawn on TreeUI's 24×24 coordinate grid. TreeUI supplies the `<svg>` wrapper, `currentColor` stroke, line caps, and stroke scaling:

```ts
import { registerTreeIcons } from '@treeui/vue';

registerTreeIcons({
  orbit: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['path', { d: 'M8 12a4 4 0 1 0 8 0 4 4 0 1 0-8 0' }],
  ],
});
```

Attribute values take numbers as well as strings, so there is no need to hand-quote every coordinate.

### Component form

`registerTreeIcons` also accepts ready-built components, which is how an application adds one of its own SVG components:

```ts
import WebhookIcon from './icons/WebhookIcon.vue';
import { registerTreeIcons } from '@treeui/vue';

registerTreeIcons({ webhook: WebhookIcon });
```

Replacement works in either direction: registering geometry over a component supersedes it, and a component over geometry does the same. The old form is dropped, not merged.

### Teaching TypeScript the new names

`TIconName` is derived from the `TIconRegistry` **interface**, not a closed union, so applications can widen it. Augment it once (in `env.d.ts` or any ambient `.d.ts`) to get autocomplete and typo-checking on your own icons:

```ts
export {};

declare module '@treeui/icons' {
  interface TIconRegistry {
    orbit: true;
  }
}
```

The `export {}` is required. It makes the file a module, which is what turns `declare module` into an augmentation; in a script file the same block declares a new ambient module that shadows the real one, and every icon export starts reading as missing.

Augment `'@treeui/icons'` even when you import from `@treeui/vue` — that is where the interface is declared.

The augmentation and the `registerTreeIcons` call are independent. Declaring a name you never register is the one way to get `undefined` out of `getTreeIcon`; a `console.warn` names the icon when it happens.

### Resetting between tests

The registry is process-wide mutable state, anchored on a global symbol so duplicate copies of the package share it. That means one test registering an icon leaks into every test after it. `resetTreeIcons()` restores the icons TreeUI ships and drops everything registered since:

```ts
import { afterEach } from 'vitest';
import { resetTreeIcons } from '@treeui/vue';

afterEach(resetTreeIcons);
```

## One-off icons

For an icon you do not want in the registry — a marketing glyph used on one screen, a logo — `createTreeIcon` builds a component with the same props and behaviour as a built-in. Render it directly, or hand it to a `TNavMenu` item's `icon` field, which is the one field that accepts a component:

```vue
<script setup lang="ts">
import { createTreeIcon } from '@treeui/vue';

const TSpiralIcon = createTreeIcon('TSpiralIcon', [
  ['path', { d: 'M12 12a3 3 0 1 0 3 3' }],
  ['circle', { cx: 12, cy: 12, r: 10 }],
]);
</script>

<template>
  <TSpiralIcon :size="32" />
</template>
```

Store it with `markRaw` if it has to live in reactive state.

## Sizing

`TIcon`'s `size` is a **pixel count**, not the `sm | md | lg` token scale used elsewhere in TreeUI. `<TIcon size="md" />` is not an error — it emits `width="md" height="md"`, which the browser ignores, so you get an unsized `<svg>` and the stroke correction silently falls back to the nominal `strokeWidth`.

To size from tokens, leave `size` alone and set the dimensions in CSS:

```css
.my-thing .t-icon {
  width: var(--tree-size-icon-sm);
  height: var(--tree-size-icon-sm);
}
```

The scale is `--tree-size-icon-sm | -md | -lg | -xl | -2xl`.

## Why not hand-roll an `<svg>`

Because a hand-rolled icon gets **heavier as it gets bigger**, and next to library icons at the same size it reads as bolded.

Icons draw on `viewBox="0 0 24 24"` and are scaled to `size`, so the stroke you actually see is `stroke-width × size / 24` — the viewBox units get stretched along with everything else. `createTreeIcon` applies `absoluteStrokeWidth` (on by default), which pre-divides the attribute by that same factor: it emits `(strokeWidth * 24) / size`.

| `size` | emitted `stroke-width` | painted |
|---|---|---|
| 20 | `2.4` | 2px |
| 32 | `1.5` | 2px |
| 48 | `1` | 2px |

Constant 2px at every size. That is the whole point of the correction.

A hand-written `<svg viewBox="0 0 24 24" stroke-width="2">` leaves the attribute at `2`, so the scaling goes uncorrected:

| `size` | emitted `stroke-width` | painted |
|---|---|---|
| 20 | `2` | 1.67px |
| 32 | `2` | 2.67px |
| 48 | `2` | 4px |

So it is slightly *light* at 20, and at 48 it paints **double** the library's weight. The symptom to look for is a large icon that looks bold or clumsy beside its neighbours — not a thin one.

Hand-rolling also drops the `size` / `strokeWidth` / `absoluteStrokeWidth` props, the `currentColor` stroke, and the `aria-hidden` default. Use `createTreeIcon` for a one-off, `registerTreeIcons` for anything used more than once.

If you *want* the uncorrected behaviour — an icon that thickens with its box, matching a non-TreeUI set — pass `:absolute-stroke-width="false"` and the attribute stays at `strokeWidth`.

## API

| Export | Signature | Purpose |
|---|---|---|
| `createTreeIcon` | `(name: string, nodes: TIconNodes) => Component` | Build an icon component from geometry, without registering it. |
| `registerTreeIcons` | `(icons: Record<string, TIconDefinition>) => void` | Add icons to the registry by name; accepts geometry or components. |
| `resetTreeIcons` | `() => void` | Restore the registry to the icons TreeUI ships, dropping everything registered since. For an `afterEach`. |
| `getTreeIcon` | `(name: TIconName) => Component` | Look up a registered icon. |
| `resolveTreeIcon` | `(icon: TIconInput \| undefined \| null) => Component \| undefined` | Normalize a name *or* a component into a component. |
| `hasTreeIcon` | `(name: string) => name is TIconName` | Test whether a name is registered; narrows untrusted strings. |
| `listTreeIcons` | `() => TIconName[]` | Every registered name, sorted — built-ins plus your own. |
| `treeIcons` | `Record<TIconName, Component>` | Lazy name-to-component map of the whole registry. |
| `treeIconDefaults` | `{ size: 20, strokeWidth: 2, absoluteStrokeWidth: true }` | The prop defaults, for components that re-expose them. |
| `builtinTreeIconNodes` | `Record<string, TIconNodes>` | The **geometry** of the 364 built-ins — raw `[tag, attrs]` data, not components. Read it to inspect or re-draw an icon; it is not a component map. |
| `TIconNode` | `[tag: string, attrs: Record<string, string \| number>]` | One child of an icon's `<svg>`. |
| `TIconNodes` | `TIconNode[]` | An icon's geometry: all children of its `<svg>`. |
| `TIconRegistry` | `interface` | The augmentable set of icon names. |
| `TIconName` | `keyof TIconRegistry & string` | A registered icon name. |
| `TIconInput` | `TIconName \| Component` | What an `icon` prop accepts. |
| `TIconDefinition` | `TIconNodes \| Component` | What `registerTreeIcons` accepts. |

### Using `resolveTreeIcon` in a template

A component that exposes its own `icon` prop must resolve it before `<component :is>`:

```vue
<script setup lang="ts">
import { computed } from 'vue';
import { resolveTreeIcon, type TIconInput } from '@treeui/vue';

const props = defineProps<{ icon?: TIconInput }>();
const iconComponent = computed(() => resolveTreeIcon(props.icon));
</script>

<template>
  <component :is="iconComponent" v-if="iconComponent" />
</template>
```

Passing the raw string through would not work: Vue resolves a string `is` as a *globally registered component name*, so `"cpu"` would look for a component called `cpu` and render nothing.

## Behaviour notes

- **Unused icons stay as data.** Geometry is stored as `[tag, attrs]` arrays and turned into a component on first lookup, then cached, so importing the package does not instantiate 364 components. It does not make them free: the registry seeds itself with `new Map(Object.entries(builtinTreeIconNodes))` at module scope, which holds a live reference to all 364, so the geometry is in your bundle whether or not you render it. `sideEffects: false` does not change that. What is lazy is component construction, not bytes shipped.
- **Unknown names fail soft.** `resolveTreeIcon` returns `undefined` and logs a `console.warn` listing every valid name. The dedupe key is the **name**, so each bad name warns exactly once and a miss inside a render loop will not flood the console. It warns in production too — that is deliberate: a missing icon is a misconfiguration worth hearing about, and sniffing `process.env.NODE_ENV` reads as `undefined` in most browser bundles. `TNavMenu` falls back to its letter marker.
- **Registration is live.** Lookups read a version counter, so an icon resolved inside a `computed` or a render function re-resolves after a later registration. `TIcon` resolves per render, so an icon registered by a lazily loaded route appears in components that already mounted.
- **The registry is global.** State is anchored on `Symbol.for('@treeui/icons.registry')`, so two copies of the package in one app share one registry instead of each getting its own.

## Conventions

- Registry keys use TreeUI's descriptive kebab-case naming.
- Generated components are named `T<Name>Icon` (`cpu` → `TCpuIcon`) in Vue devtools and warnings.
- Icons inherit `currentColor` through the root stroke. Company logos stay app-owned: import the official SVG as a component and register it when needed. Set the color on an ancestor, or on `.t-icon`, using `--tree-*` tokens.

## License

TreeUI and its original built-in icon geometry are MIT licensed.
