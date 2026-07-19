import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TButton, TDateTimePicker } from '@treeui/vue';

const meta = {
  title: 'Components/Data Entry/DateTimePicker',
  component: TDateTimePicker,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: 'Select date and time',
    modelValue: '2026-04-08T14:30',
    locale: 'en-US',
    min: '',
    max: '',
    weekStartsOn: 0,
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
          :placeholder="args.placeholder"
          :locale="args.locale"
          :min="args.min"
          :max="args.max"
          :week-starts-on="args.weekStartsOn"
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

export const Sizes: Story = {
  render: () => ({
    components: { TDateTimePicker },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TDateTimePicker size="sm" aria-label="Small" model-value="2026-04-16T09:00" />
        <TDateTimePicker size="md" aria-label="Medium" model-value="2026-04-16T09:00" />
        <TDateTimePicker size="lg" aria-label="Large" model-value="2026-04-16T09:00" />
      </div>
    `,
  }),
};

export const Open: Story = {
  render: () => ({
    components: { TDateTimePicker },
    template: `
      <div style="width: 320px; padding-bottom: 32rem;">
        <TDateTimePicker
          aria-label="Release window"
          default-open
          model-value="2026-04-16T10:30"
          :step="900"
        />
      </div>
    `,
  }),
};

export const ControlledOpen: Story = {
  render: () => ({
    components: { TButton, TDateTimePicker },
    setup: () => {
      const value = ref('2026-04-16T10:30');
      const isOpen = ref(true);
      const log = ref<string[]>([]);
      const push = (entry: string) => {
        log.value = [...log.value, entry].slice(-6);
      };
      return { isOpen, log, push, value };
    },
    template: `
      <div style="display: flex; gap: 3rem; align-items: flex-start; flex-wrap: wrap; padding-bottom: 32rem;">
        <div style="width: 320px; display: grid; gap: 0.75rem;">
          <TButton size="sm" variant="outline" @click="isOpen = !isOpen">
            {{ isOpen ? 'Close' : 'Open' }} picker
          </TButton>
          <TDateTimePicker
            aria-label="Controlled slot"
            :open="isOpen"
            :model-value="value"
            :step="900"
            @update:open="isOpen = $event; push('update:open -> ' + $event)"
            @open-change="push('open-change -> ' + $event)"
            @update:model-value="value = $event; push('update:modelValue -> ' + ($event || '(empty)'))"
            @change="push('change -> ' + ($event || '(empty)'))"
            @select="push('select -> ' + ($event || '(empty)'))"
          />
        </div>

        <div style="min-width: 15rem; display: grid; gap: 0.5rem;">
          <span style="font-size: var(--tree-font-size-sm); font-weight: var(--tree-font-weight-medium);">Emit log</span>
          <p v-if="!log.length" style="margin: 0; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            Pick a day, then press Apply or Clear to see the emit order.
          </p>
          <ol v-else style="margin: 0; padding-left: 1.25rem; display: grid; gap: 0.25rem; font-family: var(--tree-font-family-mono); font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
            <li v-for="(entry, index) in log" :key="index">{{ entry }}</li>
          </ol>
        </div>
      </div>
    `,
  }),
};

export const WeekStart: Story = {
  render: () => ({
    components: { TDateTimePicker },
    template: `
      <div style="display: flex; gap: 3rem; align-items: flex-start; flex-wrap: wrap; padding-bottom: 32rem;">
        <div style="width: 320px; display: grid; gap: 0.5rem;">
          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">weekStartsOn: 0 (Sunday)</span>
          <TDateTimePicker
            aria-label="Sunday first"
            default-open
            :week-starts-on="0"
            model-value="2026-04-16T10:30"
          />
        </div>

        <div style="width: 320px; display: grid; gap: 0.5rem;">
          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">weekStartsOn: 1 (Monday)</span>
          <TDateTimePicker
            aria-label="Monday first"
            default-open
            :week-starts-on="1"
            model-value="2026-04-16T10:30"
          />
        </div>
      </div>
    `,
  }),
};

export const MinAndMax: Story = {
  render: () => ({
    components: { TDateTimePicker },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem; padding-bottom: 32rem;">
        <p style="margin: 0; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Bounded to 2026-04-10 09:00 through 2026-04-20 17:00: both month arrows, out-of-range days,
          and the hours before 09:00 on the first allowed day are disabled.
        </p>
        <TDateTimePicker
          aria-label="Bounded slot"
          default-open
          model-value="2026-04-10T09:00"
          min="2026-04-10T09:00"
          max="2026-04-20T17:00"
          :step="1800"
        />
      </div>
    `,
  }),
};

export const Localized: Story = {
  render: () => ({
    components: { TDateTimePicker },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 340px;">
        <TDateTimePicker aria-label="English" locale="en-US" model-value="2026-04-16T18:30" />
        <TDateTimePicker aria-label="German" locale="de-DE" model-value="2026-04-16T18:30" />
        <TDateTimePicker aria-label="Japanese" locale="ja-JP" model-value="2026-04-16T18:30" />
        <TDateTimePicker
          aria-label="Brazilian Portuguese"
          locale="pt-BR"
          placeholder="Selecione data e hora"
        />
      </div>
    `,
  }),
};

export const Slots: Story = {
  render: () => ({
    components: { TDateTimePicker },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 340px;">
        <TDateTimePicker aria-label="With prefix" model-value="2026-04-16T10:00">
          <template #prefix>
            <span style="font-size: var(--tree-font-size-xs); font-weight: var(--tree-font-weight-medium); color: var(--tree-color-text-muted);">
              Starts
            </span>
          </template>
        </TDateTimePicker>

        <TDateTimePicker aria-label="Custom suffix" model-value="2026-04-16T18:30">
          <template #suffix>
            <span style="font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
              UTC-03
            </span>
          </template>
        </TDateTimePicker>
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
