import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TCheckbox } from '@treeui/vue';

const meta = {
  title: 'Components/Data Entry/Checkbox',
  component: TCheckbox,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    indeterminate: false,
    invalid: false,
    modelValue: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TCheckbox },
    setup: () => {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TCheckbox
          :size="args.size"
          :disabled="args.disabled"
          :indeterminate="args.indeterminate"
          :invalid="args.invalid"
          :model-value="checked"
          @update:model-value="checked = $event"
        >
          Accept terms and conditions
        </TCheckbox>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Checked: {{ checked }}
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TCheckbox },
    setup: () => {
      const a = ref(false);
      const b = ref(true);
      const c = ref(false);
      const d = ref(false);
      const e = ref(false);
      return { a, b, c, d, e };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TCheckbox :model-value="a" @update:model-value="a = $event">Unchecked</TCheckbox>
        <TCheckbox :model-value="b" @update:model-value="b = $event">Checked</TCheckbox>
        <TCheckbox :model-value="c" @update:model-value="c = $event" indeterminate>Indeterminate</TCheckbox>
        <TCheckbox :model-value="d" @update:model-value="d = $event" disabled>Disabled</TCheckbox>
        <TCheckbox :model-value="e" @update:model-value="e = $event" invalid>Invalid</TCheckbox>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TCheckbox },
    setup: () => {
      const sm = ref(true);
      const md = ref(true);
      const lg = ref(true);
      return { sm, md, lg };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TCheckbox size="sm" :model-value="sm" @update:model-value="sm = $event">Small</TCheckbox>
        <TCheckbox size="md" :model-value="md" @update:model-value="md = $event">Medium</TCheckbox>
        <TCheckbox size="lg" :model-value="lg" @update:model-value="lg = $event">Large</TCheckbox>
      </div>
    `,
  }),
};
