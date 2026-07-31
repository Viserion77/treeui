import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TFormField, TTagInput } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Data Entry/TagInput',
  component: TTagInput,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: practiceNote('TTagInput') } },
  },
  args: {
    size: 'md',
    disabled: false,
    invalid: false,
    placeholder: 'Add a service…',
    modelValue: ['dynamodb', 'sqs', 'sns'],
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof TTagInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TTagInput },
    setup: () => {
      const value = ref(args.modelValue as string[]);
      return { args, value };
    },
    template: `
      <div style="width: 380px; display: grid; gap: 0.75rem;">
        <TTagInput
          aria-label="Services"
          :size="args.size"
          :disabled="args.disabled"
          :invalid="args.invalid"
          :placeholder="args.placeholder"
          :model-value="value"
          @update:model-value="value = $event"
        />
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Value: {{ value.join(', ') || 'none' }}
        </div>
      </div>
    `,
  }),
};

export const InFormField: Story = {
  render: () => ({
    components: { TFormField, TTagInput },
    setup: () => ({ value: ref<string[]>(['dynamodb', 'sqs']) }),
    template: `
      <div style="width: 380px;">
        <TFormField
          label="LocalStack services"
          hint="Press Enter or comma to add. Backspace removes the last tag."
        >
          <TTagInput
            :model-value="value"
            placeholder="Add a service…"
            @update:model-value="value = $event"
          />
        </TFormField>
      </div>
    `,
  }),
};
