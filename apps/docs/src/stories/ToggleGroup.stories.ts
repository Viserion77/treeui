import type { Meta, StoryObj } from '@storybook/vue3-vite';
import type { ComponentProps } from 'vue-component-type-helpers';
import { ref } from 'vue';
import { TStack, TText, TToggleGroup } from '@treeui/vue';
import { practiceNote } from './practice-refs';

// `TToggleGroup` is generic over its option type AND its selection mode, so
// `typeof TToggleGroup` is a generic FUNCTION, which Storybook's
// `Meta<Component>` cannot accept. Same shape as Input.stories.ts: type the
// story by its PROPS and annotate, so `Story` never infers args back out of the
// component. The component itself is untouched.
type TToggleGroupArgs = ComponentProps<typeof TToggleGroup>;

const options = [
  { label: 'Day', value: 'day' },
  { label: 'Week', value: 'week' },
  { label: 'Month', value: 'month' },
  { label: 'Quarter', value: 'quarter', disabled: true },
];

const meta: Meta<TToggleGroupArgs> = {
  title: 'Components/Data Entry/ToggleGroup',
  component: TToggleGroup as never,
  tags: ['autodocs'],
  parameters: {
    docs: { description: { component: practiceNote('TToggleGroup') } },
  },
  args: {
    size: 'md',
    variant: 'outline',
    selectionMode: 'single',
    disabled: false,
    modelValue: 'week',
    options,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    variant: {
      control: 'select',
      options: ['outline', 'soft', 'solid'],
    },
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple'],
    },
  },
};

export default meta;
type Story = StoryObj<TToggleGroupArgs>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TToggleGroup },
    setup: () => {
      const value = ref(args.modelValue as string | string[]);
      return { args, value };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TToggleGroup
          aria-label="Time range"
          :size="args.size"
          :variant="args.variant"
          :selection-mode="args.selectionMode"
          :disabled="args.disabled"
          :options="args.options"
          :model-value="value"
          @update:model-value="value = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Value: {{ Array.isArray(value) ? value.join(', ') : value }}
        </div>
      </div>
    `,
  }),
};

export const Multiple: Story = {
  render: () => ({
    components: { TToggleGroup },
    setup: () => ({
      value: ref(['design', 'engineering']),
      options: [
        { label: 'Design', value: 'design' },
        { label: 'Engineering', value: 'engineering' },
        { label: 'Support', value: 'support' },
        { label: 'Finance', value: 'finance' },
      ],
    }),
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TToggleGroup
          aria-label="Teams"
          selection-mode="multiple"
          variant="soft"
          :options="options"
          :model-value="value"
          @update:model-value="value = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selected: {{ value.join(', ') }}
        </div>
      </div>
    `,
  }),
};

export const SizesAndVariants: Story = {
  render: () => ({
    components: { TToggleGroup },
    setup: () => ({ options }),
    template: `
      <div style="display: grid; gap: 1rem;">
        <TToggleGroup aria-label="Small" size="sm" variant="outline" :options="options" model-value="day" />
        <TToggleGroup aria-label="Medium" size="md" variant="soft" :options="options" model-value="week" />
        <TToggleGroup aria-label="Large" size="lg" variant="solid" :options="options" model-value="month" />
      </div>
    `,
  }),
};

export const SubtitleInTheOptionSlot: Story = {
  name: 'Secondary text stays legible on the selected item',
  parameters: {
    docs: {
      description: {
        story:
          'The selected item repaints its background, so the SECONDARY text colours of its descendants have to be repainted with it — not only the inherited one. A `TText tone="muted"` in the `#option` slot kept reading `--tree-color-text-muted` over the brand fill and measured 1.18:1 in light and 1.09:1 in dark, where `xs` text needs 4.5:1. The selected item now rebinds that token to `--tree-color-brand-contrast`, the one value that clears AA in both themes (5.19:1 / 6.21:1). Check this story in both themes.',
      },
    },
  },
  render: () => ({
    components: { TStack, TText, TToggleGroup },
    setup: () => ({
      platforms: [
        { label: 'macOS', value: 'macos', hint: 'Apple Silicon · Intel' },
        { label: 'Windows', value: 'windows', hint: 'x64 · ARM64' },
        { label: 'Linux', value: 'linux', hint: 'deb · rpm' },
      ],
      picked: ref('macos'),
    }),
    template: `
      <TToggleGroup
        v-model="picked"
        aria-label="Operating system"
        :options="platforms"
      >
        <template #option="{ option }">
          <TStack :gap="0">
            <TText size="sm">{{ option.label }}</TText>
            <TText size="xs" tone="muted">{{ option.hint }}</TText>
          </TStack>
        </template>
      </TToggleGroup>
    `,
  }),
};
