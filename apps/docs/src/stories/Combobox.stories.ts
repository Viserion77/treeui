import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { onBeforeUnmount, ref } from 'vue';
import { TButton, TCombobox } from '@treeui/vue';
import { SearchIcon, iconProps } from './icon-helpers';

const fruitOptions = [
  { label: 'Apple', value: 'apple', keywords: ['macintosh', 'red'] },
  { label: 'Apricot', value: 'apricot', keywords: ['orange', 'stone fruit'] },
  { label: 'Banana', value: 'banana', keywords: ['yellow', 'tropical'] },
  { label: 'Cherry', value: 'cherry', keywords: ['red', 'stone fruit'] },
  { label: 'Grape', value: 'grape', keywords: ['purple', 'green'] },
];

const teamOptions = [
  {
    label: 'Platform',
    value: 'platform',
    description: 'Infrastructure, observability, and shared tooling.',
  },
  {
    label: 'Design Systems',
    value: 'design-systems',
    description: 'Components, tokens, and documentation.',
  },
  {
    label: 'Growth',
    value: 'growth',
    description: 'Activation, lifecycle, and experiment work.',
  },
];

const meta = {
  title: 'Components/Data Entry/Combobox',
  component: TCombobox,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    loading: false,
    invalid: false,
    placeholder: 'Search fruits',
    emptyText: 'No matches found.',
    modelValue: '',
    options: fruitOptions,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TCombobox>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TCombobox, SearchIcon },
    setup: () => {
      const value = ref(args.modelValue);
      return { args, value, fruitOptions, iconProps };
    },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem;">
        <TCombobox
          aria-label="Fruit"
          :size="args.size"
          :disabled="args.disabled"
          :loading="args.loading"
          :invalid="args.invalid"
          :placeholder="args.placeholder"
          :empty-text="args.emptyText"
          :options="fruitOptions"
          :model-value="value"
          @update:model-value="value = $event"
        >
          <template #prefix>
            <SearchIcon v-bind="iconProps" />
          </template>
        </TCombobox>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selected: {{ value || 'none' }}
        </div>
      </div>
    `,
  }),
};

export const RichOptions: Story = {
  render: () => ({
    components: { TCombobox },
    setup: () => ({
      selected: ref('design-systems'),
      teamOptions,
    }),
    template: `
      <div style="width: 360px;">
        <TCombobox
          aria-label="Team"
          placeholder="Search teams"
          :options="teamOptions"
          :model-value="selected"
          @update:model-value="selected = $event"
        />
      </div>
    `,
  }),
};

export const EmptyState: Story = {
  render: () => ({
    components: { TCombobox },
    setup: () => ({
      value: ref(''),
      fruitOptions,
    }),
    template: `
      <div style="width: 320px;">
        <TCombobox
          aria-label="Fruit"
          placeholder="Type to filter"
          empty-text="Nothing matched this search."
          :options="fruitOptions"
          :model-value="value"
          @update:model-value="value = $event"
        >
          <template #empty="{ query }">
            <div>
              No results for <strong>{{ query }}</strong>.
            </div>
          </template>
        </TCombobox>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TCombobox },
    setup: () => ({
      fruitOptions,
      selected: ref('banana'),
    }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TCombobox aria-label="Default" placeholder="Default" :options="fruitOptions" />
        <TCombobox aria-label="With value" :options="fruitOptions" :model-value="selected" />
        <TCombobox aria-label="Invalid" invalid placeholder="Validation error" :options="fruitOptions" />
        <TCombobox aria-label="Loading" loading placeholder="Fetching results" :options="fruitOptions" />
        <TCombobox aria-label="Disabled" disabled placeholder="Disabled" :options="fruitOptions" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TCombobox },
    setup: () => ({ fruitOptions }),
    template: `
      <div style="display: grid; gap: 0.75rem; width: 320px;">
        <TCombobox size="sm" aria-label="Small" placeholder="Small" :options="fruitOptions" />
        <TCombobox size="md" aria-label="Medium" placeholder="Medium" :options="fruitOptions" />
        <TCombobox size="lg" aria-label="Large" placeholder="Large" :options="fruitOptions" />
      </div>
    `,
  }),
};

export const DisabledOptions: Story = {
  render: () => ({
    components: { TCombobox },
    setup: () => ({
      stockOptions: [
        { label: 'Available now', value: 'available' },
        { label: 'Back ordered', value: 'backordered', disabled: true },
        { label: 'In transit', value: 'transit' },
        { label: 'Discontinued', value: 'discontinued', disabled: true },
      ],
    }),
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem; padding-bottom: 13rem;">
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Disabled options are announced with aria-disabled and skipped by the arrow keys.
        </div>
        <TCombobox
          aria-label="Stock status"
          placeholder="Search stock status"
          :options="stockOptions"
          default-open
        />
      </div>
    `,
  }),
};

export const CustomOption: Story = {
  name: 'Custom option (scoped slot)',
  render: () => ({
    components: { TCombobox },
    setup: () => ({
      team: ref('design-systems'),
      teamOptions,
    }),
    template: `
      <div style="width: 360px; padding-bottom: 15rem;">
        <TCombobox
          aria-label="Team"
          placeholder="Search teams"
          :options="teamOptions"
          :model-value="team"
          default-open
          @update:model-value="team = $event"
        >
          <template #option="{ option, selected, active }">
            <span style="display: grid; gap: var(--tree-space-1); min-width: 0;">
              <span style="display: flex; align-items: center; gap: var(--tree-space-2);">
                <span style="font-weight: var(--tree-font-weight-medium);">{{ option.label }}</span>
                <span
                  v-if="active"
                  style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);"
                >
                  press Enter
                </span>
              </span>
              <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
                {{ option.description }}
              </span>
            </span>
            <span
              v-if="selected"
              style="font-size: var(--tree-font-size-sm); color: var(--tree-color-brand-primary);"
            >
              Current
            </span>
          </template>
        </TCombobox>
      </div>
    `,
  }),
};

export const ControlledOpen: Story = {
  name: 'Controlled open state',
  render: () => ({
    components: { TButton, TCombobox },
    setup: () => ({
      value: ref(''),
      open: ref(true),
      openChanges: ref(0),
      fruitOptions,
    }),
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem; padding-bottom: 15rem;">
        <div style="display: flex; gap: 0.5rem;">
          <TButton variant="outline" size="sm" @click="open = true">Open listbox</TButton>
          <TButton variant="outline" size="sm" @click="open = false">Close listbox</TButton>
        </div>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          open: {{ open }} — open-change fired {{ openChanges }}x
        </div>
        <TCombobox
          aria-label="Fruit"
          placeholder="Search fruits"
          :options="fruitOptions"
          :model-value="value"
          :open="open"
          @update:model-value="value = $event"
          @update:open="open = $event"
          @open-change="openChanges++"
        />
      </div>
    `,
  }),
};

export const AsyncFiltering: Story = {
  name: 'Async filtering (input-change)',
  render: () => ({
    components: { TCombobox },
    setup() {
      const catalog = [
        { label: 'Amsterdam', value: 'ams' },
        { label: 'Berlin', value: 'ber' },
        { label: 'Lisbon', value: 'lis' },
        { label: 'Madrid', value: 'mad' },
        { label: 'Porto', value: 'opo' },
      ];

      const value = ref('');
      const options = ref<typeof catalog>([]);
      const loading = ref(false);
      const lastQuery = ref('');
      let timer: number | undefined;

      const search = (query: string) => {
        lastQuery.value = query;
        window.clearTimeout(timer);

        if (!query.trim()) {
          loading.value = false;
          options.value = [];
          return;
        }

        loading.value = true;
        timer = window.setTimeout(() => {
          const needle = query.trim().toLowerCase();
          options.value = catalog.filter((city) => city.label.toLowerCase().includes(needle));
          loading.value = false;
        }, 500);
      };

      onBeforeUnmount(() => window.clearTimeout(timer));

      return { value, options, loading, lastQuery, search };
    },
    template: `
      <div style="width: 320px; display: grid; gap: 0.75rem;">
        <TCombobox
          aria-label="City"
          placeholder="Search cities"
          empty-text="No cities match this search."
          :options="options"
          :loading="loading"
          :model-value="value"
          @update:model-value="value = $event"
          @input-change="search"
        />
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          input-change: "{{ lastQuery }}" —
          {{ loading ? 'searching…' : options.length + ' result(s)' }}
        </div>
      </div>
    `,
  }),
};
