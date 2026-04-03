import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TInput } from '@treeui/vue';
import { CheckIcon, SearchIcon, iconProps } from './icon-helpers';

const meta = {
  title: 'Components/Input',
  component: TInput,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: 'Search products',
    modelValue: '',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TInput>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TInput, SearchIcon, CheckIcon },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value, iconProps };
    },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem;">
        <TInput
          aria-label="Search products"
          :size="args.size"
          :disabled="args.disabled"
          :loading="args.loading"
          :invalid="args.invalid"
          :placeholder="args.placeholder"
          :model-value="value"
          @update:model-value="value = $event"
        >
          <template #prefix>
            <SearchIcon v-bind="iconProps" />
          </template>
          <template #suffix>
            <CheckIcon v-bind="iconProps" />
          </template>
        </TInput>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Current value: {{ value || 'empty' }}
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TInput },
    setup: () => ({
      validValue: ref('treeui.dev'),
    }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TInput aria-label="Default" placeholder="Default input" />
        <TInput aria-label="Invalid" invalid placeholder="Invalid state" />
        <TInput aria-label="Loading" loading placeholder="Loading state" />
        <TInput aria-label="Filled" :model-value="validValue" />
      </div>
    `,
  }),
};
