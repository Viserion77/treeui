import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TTextarea } from '@treeui/vue';

const meta = {
  title: 'Components/Data Entry/Textarea',
  component: TTextarea,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: 'Write something…',
    modelValue: '',
    rows: 3,
    autoGrow: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TTextarea>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TTextarea },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem;">
        <TTextarea
          aria-label="Message"
          :size="args.size"
          :disabled="args.disabled"
          :loading="args.loading"
          :invalid="args.invalid"
          :placeholder="args.placeholder"
          :rows="args.rows"
          :auto-grow="args.autoGrow"
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
    components: { TTextarea },
    setup: () => ({
      filledValue: ref('TreeUI is a Vue 3 component library.'),
    }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TTextarea aria-label="Default" placeholder="Default textarea" />
        <TTextarea aria-label="Invalid" invalid placeholder="Invalid state" />
        <TTextarea aria-label="Loading" loading placeholder="Loading state" />
        <TTextarea aria-label="Filled" :model-value="filledValue" />
      </div>
    `,
  }),
};

export const AutoGrow: Story = {
  render: () => ({
    components: { TTextarea },
    setup: () => {
      const value = ref('');
      return { value };
    },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem;">
        <TTextarea
          aria-label="Auto-growing textarea"
          placeholder="Type to see it grow…"
          auto-grow
          :rows="2"
          :model-value="value"
          @update:model-value="value = $event"
        />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TTextarea },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TTextarea aria-label="Small" size="sm" placeholder="Small" :rows="2" />
        <TTextarea aria-label="Medium" size="md" placeholder="Medium (default)" :rows="2" />
        <TTextarea aria-label="Large" size="lg" placeholder="Large" :rows="2" />
      </div>
    `,
  }),
};

export const AutoGrowWithCeiling: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Without a ceiling `autoGrow` grows forever and a composer eventually pushes the conversation off screen. `maxRows` stops the growth at N lines and the field starts scrolling internally instead, with the border and focus ring of the component standing still.',
      },
    },
  },
  render: () => ({
    components: { TTextarea },
    setup: () => ({
      unbounded: ref('Type several lines here — this one keeps growing.'),
      bounded: ref('Type several lines here — this one stops at four rows.'),
    }),
    template: `
      <div style="display: grid; gap: 1.5rem; max-width: 420px;">
        <div>
          <p style="margin: 0 0 0.5rem; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            auto-grow, no ceiling
          </p>
          <TTextarea
            aria-label="Unbounded"
            :rows="1"
            auto-grow
            :model-value="unbounded"
            @update:model-value="unbounded = $event"
          />
        </div>
        <div>
          <p style="margin: 0 0 0.5rem; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            auto-grow with :max-rows="4"
          </p>
          <TTextarea
            aria-label="Bounded"
            :rows="1"
            auto-grow
            :max-rows="4"
            :model-value="bounded"
            @update:model-value="bounded = $event"
          />
        </div>
      </div>
    `,
  }),
};
