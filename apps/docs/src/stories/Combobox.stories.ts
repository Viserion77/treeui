import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TCombobox } from '@treeui/vue';
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
