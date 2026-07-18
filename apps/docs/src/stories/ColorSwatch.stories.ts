import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TColorSwatch } from '@treeui/vue';

const presets = [
  { label: 'Ocean blue', value: '#0969da' },
  { label: 'Forest green', value: '#1a7f37' },
  { label: 'Grape violet', value: '#6d28d9' },
  { label: 'Clay orange', value: '#c2410c' },
  { label: 'Rosewood', value: '#be185d' },
];

const meta = {
  title: 'Components/Data Entry/ColorSwatch',
  component: TColorSwatch,
  tags: ['autodocs'],
  args: {
    options: presets,
    allowCustom: true,
    size: 'md',
    label: 'Accent color',
    disabled: false,
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    allowCustom: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof TColorSwatch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TColorSwatch },
    setup: () => ({ args, value: ref('#0969da') }),
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TColorSwatch v-bind="args" v-model="value" />
        <code>{{ value }}</code>
      </div>
    `,
  }),
};

/** Presets only — drop `allowCustom` when arbitrary colours are not allowed. */
export const PresetsOnly: Story = {
  args: { allowCustom: false },
  render: (args: Record<string, unknown>) => ({
    components: { TColorSwatch },
    setup: () => ({ args, value: ref('#1a7f37') }),
    template: `<TColorSwatch v-bind="args" v-model="value" />`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TColorSwatch },
    setup: () => ({ presets, value: ref('#6d28d9') }),
    template: `
      <div style="display: grid; gap: 1rem;">
        <TColorSwatch v-for="s in ['sm', 'md', 'lg']" :key="s" :size="s"
          :options="presets" allow-custom v-model="value" :label="'Accent ' + s" />
      </div>
    `,
  }),
};
