import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TSelectableList } from '@treeui/vue';

const items = [
  {
    label: 'Release notes',
    value: 'release-notes',
    description: 'Customer-facing summary for the next shipment.',
    meta: 'Docs',
  },
  {
    label: 'Incident playbook',
    value: 'incident-playbook',
    description: 'Escalation flow and recovery checklist.',
    meta: 'Ops',
  },
  {
    label: 'Launch brief',
    value: 'launch-brief',
    description: 'Cross-functional launch summary for GTM and support.',
    meta: 'Launch',
  },
];

const meta = {
  title: 'Components/Navigation & Disclosure/SelectableList',
  component: TSelectableList,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    modelValue: 'incident-playbook',
    items,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TSelectableList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TSelectableList },
    setup: () => {
      const value = ref(args.modelValue as string);
      return { args, value };
    },
    template: `
      <div style="width: 420px; display: grid; gap: 0.75rem;">
        <TSelectableList
          aria-label="Templates"
          :size="args.size"
          :disabled="args.disabled"
          :items="args.items"
          :model-value="value"
          @update:model-value="value = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Active item: {{ value }}
        </div>
      </div>
    `,
  }),
};

export const CustomTemplates: Story = {
  render: () => ({
    components: { TSelectableList },
    setup: () => ({
      value: ref('launch-brief'),
      items,
    }),
    template: `
      <div style="width: 420px;">
        <TSelectableList
          aria-label="Guides"
          :items="items"
          :model-value="value"
          @update:model-value="value = $event"
        >
          <template #item="{ item, selected }">
            <span style="display: grid; grid-template-columns: 1fr auto; gap: 0.75rem; width: 100%; align-items: center;">
              <span style="display: grid; gap: 0.25rem; min-width: 0;">
                <strong>{{ item.label }}</strong>
                <span style="color: var(--tree-color-text-muted); font-size: var(--tree-font-size-sm);">
                  {{ item.description }}
                </span>
              </span>
              <span
                style="padding: 0.2rem 0.5rem; border-radius: 999px; background: var(--tree-color-bg-subtle); font-size: var(--tree-font-size-xs);"
              >
                {{ selected ? 'Selected' : item.meta }}
              </span>
            </span>
          </template>
        </TSelectableList>
      </div>
    `,
  }),
};

export const Empty: Story = {
  render: () => ({
    components: { TSelectableList },
    template: `
      <div style="width: 420px;">
        <TSelectableList aria-label="Empty list" :items="[]" empty-text="Nothing to review yet." />
      </div>
    `,
  }),
};
