import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { ComponentProps } from 'vue-component-type-helpers';
import { ref } from 'vue';
import { TInput } from '@treeui/vue';
import { CheckIcon, SearchIcon, iconProps } from './icon-helpers';
import { practiceNote } from './practice-refs';

// `TInput` is generic over its model type, so `typeof TInput` is a generic FUNCTION,
// which Storybook's `Meta<Component>` cannot accept. Type the story by its
// PROPS and annotate instead of `satisfies`, so `Story` never has to infer
// args back out of the component. The component itself is untouched.
type TInputArgs = ComponentProps<typeof TInput>;

const meta: Meta<TInputArgs> = {
  title: 'Components/Data Entry/Input',
  component: TInput as never,
  parameters: {
    docs: { description: { component: practiceNote('TInput') } },
  },
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
};

export default meta;

type Story = StoryObj<TInputArgs>;

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
