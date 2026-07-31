import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TFormField, TKeyValueEditor } from '@treeui/vue';
import type { TKeyValueEditorValidity } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Data Entry/KeyValueEditor',
  component: TKeyValueEditor,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: practiceNote('TKeyValueEditor') } },
  },
  args: {
    size: 'md',
    disabled: false,
    invalid: false,
    modelValue: { primary: '#0969da', accent: '#8250df' },
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
} satisfies Meta<typeof TKeyValueEditor>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TKeyValueEditor },
    setup: () => {
      const value = ref(args.modelValue as Record<string, string>);
      return { args, value };
    },
    template: `
      <div style="width: 460px; display: grid; gap: 0.75rem;">
        <TKeyValueEditor
          :size="args.size"
          :disabled="args.disabled"
          :invalid="args.invalid"
          :model-value="value"
          @update:model-value="value = $event"
        />
        <pre style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted); margin: 0;">{{ value }}</pre>
      </div>
    `,
  }),
};

export const InFormFieldWithValidation: Story = {
  render: () => ({
    components: { TFormField, TKeyValueEditor },
    setup: () => {
      const value = ref<Record<string, string>>({ primary: '#0969da' });
      const summary = ref('');
      const onValidity = (v: TKeyValueEditorValidity) => {
        summary.value = v.valid ? '' : v.errors.join(' ');
      };
      return { value, summary, onValidity };
    },
    template: `
      <div style="width: 460px;">
        <TFormField
          label="Brand colors"
          :error="summary"
          hint="A key/value map of theme color tokens."
        >
          <TKeyValueEditor
            :model-value="value"
            :labels="{ key: 'Token', value: 'Hex' }"
            @update:model-value="value = $event"
            @validity-change="onValidity"
          />
        </TFormField>
      </div>
    `,
  }),
};
