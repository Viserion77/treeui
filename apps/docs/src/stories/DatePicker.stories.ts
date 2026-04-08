import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TDatePicker } from '@treeui/vue';

const meta = {
  title: 'Components/Data Entry/DatePicker',
  component: TDatePicker,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    invalid: false,
    placeholder: 'Select ship date',
    modelValue: '2026-03-31',
    locale: 'en-US',
    min: '',
    max: '',
    weekStartsOn: 0,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    weekStartsOn: {
      control: 'select',
      options: [0, 1, 2, 3, 4, 5, 6],
    },
  },
} satisfies Meta<typeof TDatePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TDatePicker },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem;">
        <TDatePicker
          aria-label="Ship date"
          :size="args.size"
          :disabled="args.disabled"
          :invalid="args.invalid"
          :placeholder="args.placeholder"
          :locale="args.locale"
          :min="args.min"
          :max="args.max"
          :week-starts-on="args.weekStartsOn"
          :model-value="value"
          @update:model-value="value = $event"
        />
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Current value: {{ value || 'empty' }}
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TDatePicker },
    setup: () => ({
      value: ref('2026-04-06'),
    }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TDatePicker aria-label="Default" placeholder="Default picker" />
        <TDatePicker aria-label="Filled" :model-value="value" />
        <TDatePicker aria-label="Invalid" invalid model-value="2026-04-12" />
        <TDatePicker aria-label="Disabled" disabled model-value="2026-04-18" />
      </div>
    `,
  }),
};
