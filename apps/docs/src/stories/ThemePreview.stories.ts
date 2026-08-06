import type { Meta, StoryObj } from '@storybook/vue3-vite';
import ThemePreview from '../blocks/ThemePreview.vue';

/**
 * Seed preview — the visual counterpart to `assertThemeValid`.
 *
 * Type any hex into `accent` and the whole library re-renders against the theme
 * derived from it, light and dark, with every contrast pair the validator
 * measures printed underneath. A seed that fails here fails CI.
 */
const meta = {
  title: 'Foundation/Theme preview',
  component: ThemePreview,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Renders the component set against a theme generated from an arbitrary seed. ' +
          'The contrast table under each panel is the `measurements` array returned by ' +
          '`validateTheme` — the same data that breaks a build when a pair fails. ' +
          'Products supply the seed; the hover, press, selected and disabled states, the ' +
          'ink on every accent, and both modes are derived.',
      },
    },
  },
  argTypes: {
    accent: { control: 'color', description: 'The brand colour. The only required input.' },
    accentSecondary: { control: 'color', description: 'Optional second voice.' },
    neutral: {
      control: 'color',
      description: 'Optional neutral hue. Tints the grays without moving their luminance.',
    },
    showAllPairs: {
      control: 'boolean',
      description: 'Show every measured pair, not only failures and near-misses.',
    },
  },
  args: {
    accent: '#0969da',
    showAllPairs: false,
  },
} satisfies Meta<typeof ThemePreview>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The library's own fallback theme. */
export const Default: Story = {};

/** A violet product brand — the common case for a seed that is not blue. */
export const VioletBrand: Story = {
  args: { accent: '#7c3aed' },
};

/**
 * A brand close to the error colour. Worth looking at: `status.error` stays red
 * and stays distinguishable, because statuses are never derived from the accent.
 */
export const RedBrand: Story = {
  args: { accent: '#dc2626' },
};

/**
 * A near-black brand. Darkening it for hover produces no visible change, so the
 * derivation flips direction — the case that shipped a button with no press.
 */
export const NearBlackBrand: Story = {
  args: { accent: '#111827' },
};

/**
 * A high-luminance seed. `deriveBrandRamp` walks it toward the surface until it
 * is legible as ink on its own tint and on the quietest page surface, rather
 * than handing back an unreadable label.
 */
export const HighLuminanceBrand: Story = {
  args: { accent: '#84cc16' },
};

/** A warm neutral alongside a teal accent, with every pair listed. */
export const TintedNeutrals: Story = {
  args: { accent: '#0f766e', neutral: '#b45309', showAllPairs: true },
};
