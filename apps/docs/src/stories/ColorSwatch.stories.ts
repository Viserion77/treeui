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
    customLabel: 'Custom accent color',
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

/** Disabled — preset buttons and the native colour input are both inert. */
export const Disabled: Story = {
  render: () => ({
    components: { TColorSwatch },
    setup: () => ({ presets }),
    template: `
      <div style="display: grid; gap: 1rem;">
        <TColorSwatch disabled :options="presets" allow-custom model-value="#0969da"
          label="Disabled accent color" custom-label="Custom accent color" />
        <TColorSwatch disabled :options="presets" model-value="#1a7f37" label="Disabled presets" />
      </div>
    `,
  }),
};

export const ReadOnly: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'A brand manual or a palette table shows colour as evidence, not as a choice. `readonly` renders inert `role="img"` chips — not focusable, not clickable, no selected state — and steps the border up to `--tree-color-border-strong`, because half of these chips ARE background colours and in their own theme a weak border makes the chip vanish into the page.',
      },
    },
  },
  render: () => ({
    components: { TColorSwatch },
    template: `
      <div style="display: grid; gap: 1rem;">
        <TColorSwatch
          readonly
          label="Light theme surfaces"
          :options="[
            { label: 'bg-primary', value: '#f6f8fa' },
            { label: 'bg-surface', value: '#ffffff' },
            { label: 'bg-subtle', value: '#eff2f5' },
          ]"
        />
        <TColorSwatch
          readonly
          label="Dark theme surfaces"
          :options="[
            { label: 'bg-primary', value: '#1c2128' },
            { label: 'bg-surface', value: '#22272e' },
            { label: 'bg-subtle', value: '#2d333b' },
          ]"
        />
      </div>
    `,
  }),
};
