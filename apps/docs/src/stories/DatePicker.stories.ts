import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TButton, TDatePicker } from '@treeui/vue';
import { InfoIcon, iconProps } from './icon-helpers';

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

export const Sizes: Story = {
  render: () => ({
    components: { TDatePicker },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TDatePicker aria-label="Small" size="sm" model-value="2026-04-06" />
        <TDatePicker aria-label="Medium" size="md" model-value="2026-04-06" />
        <TDatePicker aria-label="Large" size="lg" model-value="2026-04-06" />
      </div>
    `,
  }),
};

export const OpenCalendar: Story = {
  render: () => ({
    components: { TDatePicker },
    setup: () => ({
      value: ref('2026-04-16'),
    }),
    template: `
      <div style="display: flex; column-gap: 1.5rem; row-gap: 23rem; flex-wrap: wrap; padding-bottom: 22rem;">
        <div style="display: grid; gap: 0.5rem; width: 320px;">
          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            Selected date — the calendar opens on the selected month.
          </span>
          <TDatePicker
            aria-label="Ship date"
            default-open
            :model-value="value"
            @update:model-value="value = $event"
          />
        </div>
        <div style="display: grid; gap: 0.5rem; width: 320px;">
          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            Empty — the calendar opens on the current month and marks today.
          </span>
          <TDatePicker aria-label="Delivery date" default-open placeholder="Select date" />
        </div>
      </div>
    `,
  }),
};

export const RangeLimits: Story = {
  render: () => ({
    components: { TDatePicker },
    template: `
      <div style="display: flex; column-gap: 1.5rem; row-gap: 23rem; flex-wrap: wrap; padding-bottom: 22rem;">
        <div style="display: grid; gap: 0.5rem; width: 320px;">
          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            min="2026-05-04" — earlier days and Previous month are disabled.
          </span>
          <TDatePicker
            aria-label="Earliest ship date"
            default-open
            model-value="2026-05-14"
            min="2026-05-04"
          />
        </div>
        <div style="display: grid; gap: 0.5rem; width: 320px;">
          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            max="2026-05-22" — later days and Next month are disabled.
          </span>
          <TDatePicker
            aria-label="Latest ship date"
            default-open
            model-value="2026-05-14"
            max="2026-05-22"
          />
        </div>
      </div>
    `,
  }),
};

export const Localized: Story = {
  render: () => ({
    components: { TDatePicker },
    template: `
      <div style="display: flex; column-gap: 1.5rem; row-gap: 23rem; flex-wrap: wrap; padding-bottom: 22rem;">
        <div style="display: grid; gap: 0.5rem; width: 320px;">
          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            locale="pt-BR" with week-starts-on="1" (Monday).
          </span>
          <TDatePicker
            aria-label="Data de envio"
            default-open
            locale="pt-BR"
            placeholder="Selecione a data"
            model-value="2026-04-16"
            :week-starts-on="1"
          />
        </div>
        <div style="display: grid; gap: 0.5rem; width: 320px;">
          <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            locale="ja-JP" with the default week-starts-on="0" (Sunday).
          </span>
          <TDatePicker
            aria-label="Ship date (ja-JP)"
            default-open
            locale="ja-JP"
            model-value="2026-04-16"
          />
        </div>
      </div>
    `,
  }),
};

export const WithSlots: Story = {
  render: () => ({
    components: { TDatePicker, InfoIcon },
    setup: () => ({ iconProps }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TDatePicker aria-label="Prefix slot" model-value="2026-04-16">
          <template #prefix>
            <InfoIcon v-bind="iconProps" />
          </template>
        </TDatePicker>
        <TDatePicker aria-label="Suffix slot" model-value="2026-04-16">
          <template #suffix>
            <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">Change</span>
          </template>
        </TDatePicker>
      </div>
    `,
  }),
};

export const ControlledOpen: Story = {
  render: () => ({
    components: { TButton, TDatePicker },
    setup: () => {
      const open = ref(false);
      const value = ref('2026-04-16');
      const log = ref<string[]>([]);
      const push = (entry: string) => {
        log.value = [entry, ...log.value].slice(0, 4);
      };
      return { open, value, log, push };
    },
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px; padding-bottom: 22rem;">
        <div style="display: flex; gap: 0.5rem;">
          <TButton size="sm" variant="outline" @click="open = true">Open</TButton>
          <TButton size="sm" variant="outline" @click="open = false">Close</TButton>
        </div>
        <TDatePicker
          aria-label="Controlled ship date"
          :open="open"
          :model-value="value"
          @update:open="open = $event"
          @update:model-value="value = $event"
          @open-change="push('open-change: ' + $event)"
          @select="push('select: ' + $event)"
        />
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Open: {{ open }} · Current value: {{ value || 'empty' }}
        </div>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          <div v-if="!log.length">No events yet — select never fires from external value changes.</div>
          <div v-for="entry in log" :key="entry">{{ entry }}</div>
        </div>
      </div>
    `,
  }),
};

export const InForm: Story = {
  render: () => ({
    components: { TButton, TDatePicker },
    setup: () => {
      const shipDate = ref('2026-05-12');
      const submitted = ref('');
      const onSubmit = (event: Event) => {
        const data = new FormData(event.target as HTMLFormElement);
        submitted.value = Array.from(data.entries())
          .map(([key, entry]) => key + '=' + String(entry))
          .join(' · ');
      };
      return { shipDate, submitted, onSubmit };
    },
    template: `
      <form style="display: grid; gap: 0.75rem; width: 320px;" @submit.prevent="onSubmit($event)">
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          A name attribute renders a hidden input, so the value is picked up by native form submission.
        </div>
        <div style="display: grid; gap: 0.4rem;">
          <span style="font-size: var(--tree-font-size-sm); font-weight: var(--tree-font-weight-medium);">Ship date</span>
          <TDatePicker
            name="ship_date"
            aria-label="Ship date"
            :model-value="shipDate"
            @update:model-value="shipDate = $event"
          />
        </div>
        <TButton type="submit" size="sm">Submit</TButton>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Submitted: {{ submitted || 'nothing yet' }}
        </div>
      </form>
    `,
  }),
};
