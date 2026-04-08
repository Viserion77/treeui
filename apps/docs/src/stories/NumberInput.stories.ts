import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TNumberInput } from '@treeui/vue';

const meta = {
  title: 'Components/Data Entry/NumberInput',
  component: TNumberInput,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    invalid: false,
    placeholder: 'Seats',
    modelValue: 3,
    min: 0,
    max: 10,
    step: 1,
    controls: true,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TNumberInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TNumberInput },
    setup: () => {
      const value = ref(args.modelValue as number | null);
      return { args, value };
    },
    template: `
      <div style="width: 240px; display: grid; gap: 0.75rem;">
        <TNumberInput
          aria-label="Seats"
          :size="args.size"
          :disabled="args.disabled"
          :invalid="args.invalid"
          :placeholder="args.placeholder"
          :model-value="value"
          :min="args.min"
          :max="args.max"
          :step="args.step"
          :controls="args.controls"
          @update:model-value="value = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Value: {{ value ?? 'empty' }}
        </div>
      </div>
    `,
  }),
};

export const DecimalSteps: Story = {
  render: () => ({
    components: { TNumberInput },
    setup: () => ({
      value: ref(1.5),
    }),
    template: `
      <div style="width: 240px; display: grid; gap: 0.75rem;">
        <TNumberInput
          aria-label="Story points"
          :model-value="value"
          :min="0"
          :max="8"
          :step="0.5"
          placeholder="Story points"
          @update:model-value="value = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Current estimate: {{ value }}
        </div>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TNumberInput },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 240px;">
        <TNumberInput aria-label="Small" size="sm" :model-value="1" />
        <TNumberInput aria-label="Medium" size="md" :model-value="4" />
        <TNumberInput aria-label="Large" size="lg" :model-value="8" />
      </div>
    `,
  }),
};
