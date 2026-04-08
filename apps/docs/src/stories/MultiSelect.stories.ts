import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TMultiSelect } from '@treeui/vue';
import { SearchIcon, iconProps } from './icon-helpers';

const options = [
  { label: 'Design', value: 'design', description: 'Product design and UX' },
  { label: 'Engineering', value: 'engineering', description: 'Core application team' },
  { label: 'Operations', value: 'ops', description: 'Support and incident response' },
  { label: 'Finance', value: 'finance', description: 'Billing and forecasting' },
  { label: 'People', value: 'people', description: 'Hiring and onboarding', disabled: true },
];

const meta = {
  title: 'Components/Data Entry/MultiSelect',
  component: TMultiSelect,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: 'Filter teams',
    modelValue: ['engineering'],
    options,
    maxVisibleTags: 2,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TMultiSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { SearchIcon, TMultiSelect },
    setup: () => {
      const value = ref(args.modelValue as string[]);
      return { args, value, iconProps };
    },
    template: `
      <div style="width: 360px; display: grid; gap: 0.75rem;">
        <TMultiSelect
          aria-label="Teams"
          :size="args.size"
          :disabled="args.disabled"
          :loading="args.loading"
          :invalid="args.invalid"
          :placeholder="args.placeholder"
          :model-value="value"
          :options="args.options"
          :max-visible-tags="args.maxVisibleTags"
          @update:model-value="value = $event"
        >
          <template #prefix>
            <SearchIcon v-bind="iconProps" />
          </template>
        </TMultiSelect>

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selected: {{ value.join(', ') || 'none' }}
        </div>
      </div>
    `,
  }),
};

export const TeamPicker: Story = {
  render: () => ({
    components: { TMultiSelect },
    setup: () => ({
      value: ref(['design', 'engineering']),
      options,
    }),
    template: `
      <div style="width: 360px; display: grid; gap: 0.75rem;">
        <TMultiSelect
          aria-label="Assign teams"
          placeholder="Assign teams"
          :options="options"
          :model-value="value"
          @update:model-value="value = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Reviewing ownership for: {{ value.join(', ') }}
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TMultiSelect },
    setup: () => ({ options }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 360px;">
        <TMultiSelect aria-label="Default" placeholder="Default" :options="options" />
        <TMultiSelect aria-label="Invalid" invalid placeholder="Validation error" :options="options" />
        <TMultiSelect aria-label="Loading" loading placeholder="Syncing options" :options="options" />
        <TMultiSelect aria-label="Disabled" disabled placeholder="Disabled" :options="options" />
      </div>
    `,
  }),
};
