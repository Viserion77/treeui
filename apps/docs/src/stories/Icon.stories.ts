import type { Meta, StoryObj } from '@storybook/vue3-vite';
import {
  TIcon,
  listTreeIcons,
  registerTreeIcons,
  type TIconNodes,
} from '@treeui/vue';

// Derived, never transcribed. A hardcoded list drifts the moment an icon is
// added to @treeui/icons — this file used to omit `languages` for exactly that
// reason. `listTreeIcons()` is the registry's own answer, already sorted.
const iconNames = listTreeIcons();

// Geometry for the CustomIcon story, drawn on the same 24x24 grid as every
// built-in icon. `tree-node` is deliberately a name @treeui/icons does not ship:
// registering an existing name REPLACES that built-in, so an example teaching
// "add an icon" must not quietly demonstrate replacement.
//
// The registry is process-wide, so this registration outlives the story that
// makes it. The Gallery is unaffected because `iconNames` above is a snapshot
// taken at module load, before any story renders — not because the call sits
// inside `setup()`. Keeping it in `setup()` is about locality: the registration
// lives next to the story documenting it.
const treeNodeIcon: TIconNodes = [
  ['circle', { cx: 12, cy: 5, r: 2.5 }],
  ['circle', { cx: 5, cy: 19, r: 2.5 }],
  ['circle', { cx: 19, cy: 19, r: 2.5 }],
  ['path', { d: 'M10.9 7.2 6.1 16.8' }],
  ['path', { d: 'M13.1 7.2 17.9 16.8' }],
];

const meta = {
  title: 'Components/Data Display/Icon',
  component: TIcon,
  tags: ['autodocs'],
  args: {
    name: 'info',
    size: 24,
  },
  argTypes: {
    name: {
      control: 'select',
      options: iconNames,
    },
    size: { control: { type: 'number', min: 12, max: 64, step: 2 } },
    strokeWidth: { control: { type: 'number', min: 1, max: 4, step: 0.5 } },
    label: { control: 'text' },
  },
} satisfies Meta<typeof TIcon>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

/** Every icon the library ships, with the name a consumer needs to copy. */
export const Gallery: Story = {
  // The global `centered` layout shrink-wraps the story, which turns 364 icons
  // into three tall columns. The gallery wants the full canvas.
  parameters: { layout: 'fullscreen' },
  render: () => ({
    components: { TIcon },
    setup: () => ({ iconNames }),
    template: `
      <div style="display: grid; gap: var(--tree-space-4);">
        <p style="margin: 0; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          {{ iconNames.length }} original TreeUI icons, using descriptive kebab-case names.
          Click a name to select it.
        </p>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fill, minmax(calc(var(--tree-space-16) * 2), 1fr)); gap: var(--tree-space-2);"
        >
          <div
            v-for="name in iconNames"
            :key="name"
            style="display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: var(--tree-space-2); padding: var(--tree-space-3) var(--tree-space-2); border: var(--tree-border-width-subtle) solid var(--tree-color-border-default); border-radius: var(--tree-radius-md); background: var(--tree-color-bg-surface);"
          >
            <TIcon :name="name" :size="28" />
            <code
              style="font-family: var(--tree-font-family-mono); font-size: var(--tree-font-size-xs); line-height: var(--tree-font-lineHeight-tight); color: var(--tree-color-text-muted); text-align: center; overflow-wrap: anywhere; user-select: all;"
            >{{ name }}</code>
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * `size` is a pixel count, not the `sm | md | lg` token scale. To size from
 * tokens instead, leave `size` alone and set width/height in CSS — see
 * SizingFromTokens.
 */
export const Sizes: Story = {
  render: () => ({
    components: { TIcon },
    setup: () => ({ sizes: [16, 20, 24, 32, 48] }),
    template: `
      <div style="display: flex; align-items: flex-end; gap: var(--tree-space-6);">
        <div
          v-for="size in sizes"
          :key="size"
          style="display: flex; flex-direction: column; align-items: center; gap: var(--tree-space-2);"
        >
          <TIcon name="check" :size="size" />
          <small style="font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">{{ size }}px</small>
        </div>
      </div>
    `,
  }),
};

/**
 * The token scale route. `size` stays at its default and CSS drives the box
 * from `--tree-size-icon-sm | -md | -lg`, so icons follow the design system
 * rather than a magic number. Passing `size="md"` writes `width="md"` onto the
 * svg, which the browser discards — the icon ends up unsized.
 */
export const SizingFromTokens: Story = {
  render: () => ({
    components: { TIcon },
    setup: () => ({
      steps: [
        { label: 'sm', width: 'var(--tree-size-icon-sm)' },
        { label: 'md', width: 'var(--tree-size-icon-md)' },
        { label: 'lg', width: 'var(--tree-size-icon-lg)' },
        { label: 'xl', width: 'var(--tree-size-icon-xl)' },
      ],
    }),
    template: `
      <div style="display: flex; align-items: flex-end; gap: var(--tree-space-6);">
        <div
          v-for="step in steps"
          :key="step.label"
          style="display: flex; flex-direction: column; align-items: center; gap: var(--tree-space-2);"
        >
          <TIcon name="settings" :style="{ width: step.width, height: step.width }" />
          <small style="font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
            --tree-size-icon-{{ step.label }}
          </small>
        </div>
      </div>
    `,
  }),
};

/**
 * `absoluteStrokeWidth` (on by default) renders the stroke at
 * `strokeWidth * 24 / size`, so an icon keeps the same optical weight at every
 * size. Turn it off and the stroke scales with the box: the large icons in the
 * bottom row read heavier than their neighbours. This correction is exactly
 * what a hand-rolled `<svg stroke-width="2">` loses.
 */
export const StrokeScaling: Story = {
  render: () => ({
    components: { TIcon },
    setup: () => ({
      sizes: [20, 32, 48, 64],
      rows: [
        { label: 'absoluteStrokeWidth (default)', absolute: true },
        { label: 'absoluteStrokeWidth={false}', absolute: false },
      ],
    }),
    template: `
      <div style="display: grid; gap: var(--tree-space-6);">
        <div v-for="row in rows" :key="row.label" style="display: grid; gap: var(--tree-space-2);">
          <small style="font-family: var(--tree-font-family-mono); font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
            {{ row.label }}
          </small>
          <div style="display: flex; align-items: center; gap: var(--tree-space-6);">
            <TIcon
              v-for="size in sizes"
              :key="size"
              name="star"
              :size="size"
              :absolute-stroke-width="row.absolute"
            />
          </div>
        </div>
      </div>
    `,
  }),
};

/**
 * Icons are decorative by default: `aria-hidden="true"`, invisible to assistive
 * tech, which is correct next to a visible text label. A `label` promotes the
 * icon to `role="img"` with that label — use it only when the icon carries
 * meaning no adjacent text repeats.
 */
export const WithAccessibleLabel: Story = {
  render: () => ({
    components: { TIcon },
    template: `
      <div style="display: grid; gap: var(--tree-space-4);">
        <div style="display: flex; align-items: center; gap: var(--tree-space-2);">
          <TIcon name="trash-2" :size="24" />
          <span>Delete project</span>
          <small style="font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
            decorative — the text already says it
          </small>
        </div>
        <div style="display: flex; align-items: center; gap: var(--tree-space-2);">
          <TIcon name="alert-circle" :size="24" label="Warning" />
          <small style="font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
            role="img" — announced as "Warning", because nothing else says it
          </small>
        </div>
      </div>
    `,
  }),
};

/**
 * The icon you need is not in the set? Register it. `registerTreeIcons` takes
 * geometry on a 24x24 grid (or an app-owned component) and
 * the name then works everywhere a built-in does — `<TIcon name="…" />` and
 * `TNavMenu`'s item `icon` field. The result is a real TreeUI icon: same
 * `size` / `strokeWidth` / `absoluteStrokeWidth` props, same stroke scaling.
 *
 * Pick a name the library does not already ship — registering an existing one
 * replaces that built-in. `resetTreeIcons()` puts the registry back to the
 * shipped set, which is what an `afterEach` wants in an app's own tests.
 *
 * Augment `TIconRegistry` once in `env.d.ts` to get autocomplete on the new
 * name — see the Foundation → Icons page.
 */
export const CustomIcon: Story = {
  render: () => ({
    components: { TIcon },
    setup: () => {
      registerTreeIcons({ 'tree-node': treeNodeIcon });

      return { sizes: [20, 32, 48] };
    },
    template: `
      <div style="display: grid; gap: var(--tree-space-4); justify-items: start;">
        <div style="display: flex; align-items: center; gap: var(--tree-space-6);">
          <TIcon v-for="size in sizes" :key="size" name="tree-node" :size="size" />
        </div>
        <small style="font-family: var(--tree-font-family-mono); font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
          registerTreeIcons({ 'tree-node': [...] }) → &lt;TIcon name="tree-node" /&gt;
        </small>
      </div>
    `,
  }),
};
