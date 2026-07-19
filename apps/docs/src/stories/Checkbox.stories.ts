import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { computed, ref } from 'vue';
import { TCheckbox } from '@treeui/vue';

const meta = {
  title: 'Components/Data Entry/Checkbox',
  component: TCheckbox,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    indeterminate: false,
    invalid: false,
    modelValue: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TCheckbox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TCheckbox },
    setup: () => {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TCheckbox
          :size="args.size"
          :disabled="args.disabled"
          :indeterminate="args.indeterminate"
          :invalid="args.invalid"
          :model-value="checked"
          @update:model-value="checked = $event"
        >
          Accept terms and conditions
        </TCheckbox>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Checked: {{ checked }}
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TCheckbox },
    setup: () => {
      const a = ref(false);
      const b = ref(true);
      const c = ref(false);
      const d = ref(false);
      const e = ref(false);
      const f = ref(true);
      const g = ref(false);
      return { a, b, c, d, e, f, g };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TCheckbox :model-value="a" @update:model-value="a = $event">Unchecked</TCheckbox>
        <TCheckbox :model-value="b" @update:model-value="b = $event">Checked</TCheckbox>
        <TCheckbox :model-value="c" @update:model-value="c = $event" indeterminate>Indeterminate</TCheckbox>
        <TCheckbox :model-value="d" @update:model-value="d = $event" disabled>Disabled</TCheckbox>
        <TCheckbox :model-value="f" @update:model-value="f = $event" disabled>Disabled checked</TCheckbox>
        <TCheckbox :model-value="g" @update:model-value="g = $event" indeterminate disabled>Disabled indeterminate</TCheckbox>
        <TCheckbox :model-value="e" @update:model-value="e = $event" invalid>Invalid</TCheckbox>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TCheckbox },
    setup: () => {
      const sm = ref(true);
      const md = ref(true);
      const lg = ref(true);
      return { sm, md, lg };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TCheckbox size="sm" :model-value="sm" @update:model-value="sm = $event">Small</TCheckbox>
        <TCheckbox size="md" :model-value="md" @update:model-value="md = $event">Medium</TCheckbox>
        <TCheckbox size="lg" :model-value="lg" @update:model-value="lg = $event">Large</TCheckbox>
      </div>
    `,
  }),
};

export const WithoutLabel: Story = {
  render: () => ({
    components: { TCheckbox },
    setup: () => {
      const rows = ref([
        { id: 'INV-1041', amount: '$1,200.00', selected: true },
        { id: 'INV-1042', amount: '$840.00', selected: false },
        { id: 'INV-1043', amount: '$2,310.00', selected: false },
      ]);
      const allSelected = computed(() => rows.value.every((row) => row.selected));
      const someSelected = computed(() => rows.value.some((row) => row.selected) && !allSelected.value);
      const toggleAll = (value: boolean) => {
        rows.value.forEach((row) => {
          row.selected = value;
        });
      };
      return { rows, allSelected, someSelected, toggleAll };
    },
    template: `
      <div style="display: grid; gap: 0.75rem; max-width: 22rem;">
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Omit the default slot for control-only checkboxes and pass an aria-label instead, so the control keeps an accessible name.
        </div>
        <div style="border: 1px solid var(--tree-color-border-default); border-radius: var(--tree-radius-md); background: var(--tree-color-bg-surface);">
          <div style="display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.875rem; border-bottom: 1px solid var(--tree-color-border-default);">
            <TCheckbox
              :model-value="allSelected"
              :indeterminate="someSelected"
              aria-label="Select all invoices"
              @update:model-value="toggleAll"
            />
            <span style="font-size: var(--tree-font-size-sm); font-weight: var(--tree-font-weight-medium);">Invoice</span>
          </div>
          <div
            v-for="row in rows"
            :key="row.id"
            style="display: flex; align-items: center; gap: 0.75rem; padding: 0.625rem 0.875rem;"
          >
            <TCheckbox
              :model-value="row.selected"
              :aria-label="'Select invoice ' + row.id"
              @update:model-value="row.selected = $event"
            />
            <span style="font-size: var(--tree-font-size-sm);">{{ row.id }}</span>
            <span style="margin-left: auto; font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">{{ row.amount }}</span>
          </div>
        </div>
      </div>
    `,
  }),
};
