import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TSelect } from '@treeui/vue';

const fruitOptions = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Grape', value: 'grape' },
  { label: 'Orange', value: 'orange' },
];

const meta = {
  title: 'Components/Select',
  component: TSelect,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: 'Choose a fruit',
    modelValue: '',
    options: fruitOptions,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TSelect },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value, fruitOptions };
    },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem;">
        <TSelect
          aria-label="Fruit"
          :size="args.size"
          :disabled="args.disabled"
          :loading="args.loading"
          :invalid="args.invalid"
          :placeholder="args.placeholder"
          :options="fruitOptions"
          :model-value="value"
          @update:model-value="value = $event"
        />
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selected: {{ value || 'none' }}
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TSelect },
    setup: () => ({
      fruitOptions,
      selected: ref('banana'),
    }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TSelect aria-label="Default" placeholder="Default" :options="fruitOptions" />
        <TSelect aria-label="With value" :options="fruitOptions" :model-value="selected" />
        <TSelect aria-label="Invalid" invalid placeholder="Invalid state" :options="fruitOptions" />
        <TSelect aria-label="Loading" loading placeholder="Loading state" :options="fruitOptions" />
        <TSelect aria-label="Disabled" disabled placeholder="Disabled" :options="fruitOptions" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TSelect },
    setup: () => ({ fruitOptions }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TSelect size="sm" aria-label="Small" placeholder="Small" :options="fruitOptions" />
        <TSelect size="md" aria-label="Medium" placeholder="Medium" :options="fruitOptions" />
        <TSelect size="lg" aria-label="Large" placeholder="Large" :options="fruitOptions" />
      </div>
    `,
  }),
};

export const DisabledOptions: Story = {
  render: () => ({
    components: { TSelect },
    setup: () => ({
      options: [
        { label: 'Available', value: 'a' },
        { label: 'Unavailable', value: 'b', disabled: true },
        { label: 'Also available', value: 'c' },
      ],
    }),
    template: `
      <div style="width: 320px;">
        <TSelect aria-label="Plan" placeholder="Choose a plan" :options="options" />
      </div>
    `,
  }),
};
