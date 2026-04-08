import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TDateTimePicker } from '@treeui/vue';

const meta = {
  title: 'Components/Data Entry/DateTimePicker',
  component: TDateTimePicker,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    modelValue: '2026-04-08T14:30',
    min: '',
    max: '',
    step: 900,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    step: {
      control: 'number',
    },
  },
} satisfies Meta<typeof TDateTimePicker>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TDateTimePicker },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value };
    },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem;">
        <TDateTimePicker
          aria-label="Release window"
          :size="args.size"
          :disabled="args.disabled"
          :loading="args.loading"
          :invalid="args.invalid"
          :min="args.min"
          :max="args.max"
          :step="args.step"
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
    components: { TDateTimePicker },
    setup: () => ({
      value: ref('2026-04-10T10:30'),
    }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TDateTimePicker aria-label="Default" />
        <TDateTimePicker aria-label="Filled" :model-value="value" />
        <TDateTimePicker aria-label="Invalid" invalid model-value="2026-04-12T09:15" />
        <TDateTimePicker aria-label="Loading" loading model-value="2026-04-12T12:00" />
        <TDateTimePicker aria-label="Disabled" disabled model-value="2026-04-18T16:45" />
      </div>
    `,
  }),
};

export const Scheduling: Story = {
  render: () => ({
    components: { TDateTimePicker },
    setup: () => ({
      kickoff: ref('2026-04-14T09:00'),
      launch: ref('2026-04-21T16:30'),
    }),
    template: `
      <div style="display: grid; gap: 1rem; width: min(100%, 34rem);">
        <div style="display: grid; gap: 0.75rem; padding: 1rem; border: 1px solid var(--tree-color-border-default); border-radius: 1rem;">
          <label style="display: grid; gap: 0.4rem;">
            <span style="font-size: var(--tree-font-size-sm); font-weight: var(--tree-font-weight-medium);">Kickoff</span>
            <TDateTimePicker
              aria-label="Kickoff"
              :model-value="kickoff"
              @update:model-value="kickoff = $event"
            />
          </label>

          <label style="display: grid; gap: 0.4rem;">
            <span style="font-size: var(--tree-font-size-sm); font-weight: var(--tree-font-weight-medium);">Launch</span>
            <TDateTimePicker
              aria-label="Launch"
              :model-value="launch"
              min="2026-04-14T09:00"
              :step="1800"
              @update:model-value="launch = $event"
            />
          </label>
        </div>
      </div>
    `,
  }),
};
