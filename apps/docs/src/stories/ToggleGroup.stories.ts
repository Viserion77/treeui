import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TToggleGroup } from '@treeui/vue';

const options = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter', disabled: true },
];

const meta = {
  title: 'Components/Data Entry/ToggleGroup',
  component: TToggleGroup,
  tags: ['autodocs'],
  args: {
    size: 'md',
    variant: 'outline',
    selectionMode: 'single',
    disabled: false,
    modelValue: 'week',
    options,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['outline', 'soft', 'solid'],
    },
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple'],
    },
  },
} satisfies Meta<typeof TToggleGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TToggleGroup },
    setup: () => {
      const value = ref(args.modelValue as string | string[]);
      return { args, value };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TToggleGroup
          aria-label="Time range"
          :size="args.size"
          :variant="args.variant"
          :selection-mode="args.selectionMode"
          :disabled="args.disabled"
          :options="args.options"
          :model-value="value"
          @update:model-value="value = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Value: {{ Array.isArray(value) ? value.join(', ') : value }}
        </div>
      </div>
    `,
  }),
};

export const Multiple: Story = {
  render: () => ({
    components: { TToggleGroup },
    setup: () => ({
      value: ref(['design', 'engineering']),
      options: [
        { label: 'Design', value: 'design' },
        { label: 'Engineering', value: 'engineering' },
        { label: 'Support', value: 'support' },
        { label: 'Finance', value: 'finance' },
      ],
    }),
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TToggleGroup
          aria-label="Teams"
          selection-mode="multiple"
          variant="soft"
          :options="options"
          :model-value="value"
          @update:model-value="value = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selected: {{ value.join(', ') }}
        </div>
      </div>
    `,
  }),
};

export const SizesAndVariants: Story = {
  render: () => ({
    components: { TToggleGroup },
    setup: () => ({ options }),
    template: `
      <div style="display: grid; gap: 1rem;">
        <TToggleGroup aria-label="Small" size="sm" variant="outline" :options="options" model-value="day" />
        <TToggleGroup aria-label="Medium" size="md" variant="soft" :options="options" model-value="week" />
        <TToggleGroup aria-label="Large" size="lg" variant="solid" :options="options" model-value="month" />
      </div>
    `,
  }),
};
