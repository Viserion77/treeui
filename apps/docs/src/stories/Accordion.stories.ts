import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TAccordion, TAccordionItem } from '@treeui/vue';

const meta = {
  title: 'Components/Data Display/Accordion',
  component: TAccordion,
  tags: ['autodocs'],
  args: {
    type: 'single',
    collapsible: false,
    disabled: false,
  },
  argTypes: {
    type: { control: 'select', options: ['single', 'multiple'] },
    collapsible: { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
} satisfies Meta<typeof TAccordion>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TAccordion, TAccordionItem },
    setup: () => ({ args }),
    template: `
      <div style="max-width: 480px;">
        <TAccordion v-bind="args">
          <TAccordionItem value="item-1">
            <template #trigger>Is it accessible?</template>
            Yes. It adheres to the WAI-ARIA Accordion pattern with full keyboard navigation.
          </TAccordionItem>

          <TAccordionItem value="item-2">
            <template #trigger>Is it styled?</template>
            Yes. It ships with default styles built on TreeUI design tokens.
          </TAccordionItem>

          <TAccordionItem value="item-3">
            <template #trigger>Is it animated?</template>
            The chevron rotates and the panel reveals smoothly via CSS transitions.
          </TAccordionItem>
        </TAccordion>
      </div>
    `,
  }),
};

export const SingleCollapsible: Story = {
  name: 'Single (collapsible)',
  render: () => ({
    components: { TAccordion, TAccordionItem },
    template: `
      <div style="max-width: 480px;">
        <TAccordion type="single" collapsible>
          <TAccordionItem value="item-1">
            <template #trigger>First section</template>
            Content for the first section. Click again to collapse.
          </TAccordionItem>

          <TAccordionItem value="item-2">
            <template #trigger>Second section</template>
            Content for the second section.
          </TAccordionItem>
        </TAccordion>
      </div>
    `,
  }),
};

export const Multiple: Story = {
  render: () => ({
    components: { TAccordion, TAccordionItem },
    template: `
      <div style="max-width: 480px;">
        <TAccordion type="multiple">
          <TAccordionItem value="item-1">
            <template #trigger>First section</template>
            Multiple items can be open at once.
          </TAccordionItem>

          <TAccordionItem value="item-2">
            <template #trigger>Second section</template>
            Open this alongside the first.
          </TAccordionItem>

          <TAccordionItem value="item-3">
            <template #trigger>Third section</template>
            All three can be visible simultaneously.
          </TAccordionItem>
        </TAccordion>
      </div>
    `,
  }),
};

export const Controlled: Story = {
  render: () => ({
    components: { TAccordion, TAccordionItem },
    setup() {
      const openItem = ref<string | undefined>('item-2');
      return { openItem };
    },
    template: `
      <div style="max-width: 480px;">
        <p style="margin-bottom: 0.5rem;">Open: <code>{{ openItem ?? 'none' }}</code></p>
        <TAccordion type="single" collapsible v-model="openItem">
          <TAccordionItem value="item-1">
            <template #trigger>First section</template>
            Controlled via v-model.
          </TAccordionItem>

          <TAccordionItem value="item-2">
            <template #trigger>Second section (default open)</template>
            This item starts open.
          </TAccordionItem>

          <TAccordionItem value="item-3">
            <template #trigger>Third section</template>
            Content here.
          </TAccordionItem>
        </TAccordion>
      </div>
    `,
  }),
};

export const DefaultValue: Story = {
  name: 'Default value (uncontrolled)',
  render: () => ({
    components: { TAccordion, TAccordionItem },
    template: `
      <div style="display: grid; gap: 2rem; max-width: 480px;">
        <TAccordion type="single" collapsible default-value="item-2">
          <TAccordionItem value="item-1">
            <template #trigger>First section</template>
            Pass a single string to open one item on mount.
          </TAccordionItem>

          <TAccordionItem value="item-2">
            <template #trigger>Second section (starts open)</template>
            Opened by <code>default-value="item-2"</code>, with no v-model needed.
          </TAccordionItem>
        </TAccordion>

        <TAccordion type="multiple" :default-value="['item-1', 'item-3']">
          <TAccordionItem value="item-1">
            <template #trigger>First section (starts open)</template>
            With type="multiple", default-value takes an array of values.
          </TAccordionItem>

          <TAccordionItem value="item-2">
            <template #trigger>Second section</template>
            This one starts closed.
          </TAccordionItem>

          <TAccordionItem value="item-3">
            <template #trigger>Third section (starts open)</template>
            Both listed values are open from the first render.
          </TAccordionItem>
        </TAccordion>
      </div>
    `,
  }),
};

export const ControlledMultiple: Story = {
  name: 'Controlled (multiple)',
  render: () => ({
    components: { TAccordion, TAccordionItem },
    setup() {
      const openItems = ref<string[]>(['item-1']);
      return { openItems };
    },
    template: `
      <div style="max-width: 480px;">
        <p style="margin-bottom: 0.5rem;">Open: <code>{{ openItems.length ? openItems.join(', ') : 'none' }}</code></p>
        <TAccordion type="multiple" v-model="openItems">
          <TAccordionItem value="item-1">
            <template #trigger>First section</template>
            In multiple mode the model value is an array of open values.
          </TAccordionItem>

          <TAccordionItem value="item-2">
            <template #trigger>Second section</template>
            Toggling emits update:modelValue with the full array.
          </TAccordionItem>

          <TAccordionItem value="item-3">
            <template #trigger>Third section</template>
            Content here.
          </TAccordionItem>
        </TAccordion>
      </div>
    `,
  }),
};

export const CustomTrigger: Story = {
  name: 'Custom trigger (scoped slot)',
  render: () => ({
    components: { TAccordion, TAccordionItem },
    template: `
      <div style="max-width: 480px;">
        <TAccordion type="single" collapsible>
          <TAccordionItem value="item-1">
            <template #trigger="{ open }">
              <span style="display: flex; align-items: center; gap: var(--tree-space-2);">
                Shipping details
                <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
                  {{ open ? 'Hide' : 'Show' }}
                </span>
              </span>
            </template>
            The trigger slot is scoped and exposes the item's <code>open</code> state.
          </TAccordionItem>

          <TAccordionItem value="item-2">
            <template #trigger="{ open }">
              <span style="display: flex; align-items: center; gap: var(--tree-space-2);">
                Payment details
                <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
                  {{ open ? 'Hide' : 'Show' }}
                </span>
              </span>
            </template>
            Use it to swap labels, badges, or icons as the item expands.
          </TAccordionItem>
        </TAccordion>
      </div>
    `,
  }),
};

export const DisabledItem: Story = {
  name: 'Disabled item',
  render: () => ({
    components: { TAccordion, TAccordionItem },
    template: `
      <div style="max-width: 480px;">
        <TAccordion type="single" collapsible>
          <TAccordionItem value="item-1">
            <template #trigger>Enabled section</template>
            This section works normally.
          </TAccordionItem>

          <TAccordionItem value="item-2" disabled>
            <template #trigger>Disabled section</template>
            You won't see this content.
          </TAccordionItem>

          <TAccordionItem value="item-3">
            <template #trigger>Another enabled section</template>
            This also works normally.
          </TAccordionItem>
        </TAccordion>
      </div>
    `,
  }),
};

export const DisabledAll: Story = {
  name: 'Disabled (all items)',
  render: () => ({
    components: { TAccordion, TAccordionItem },
    template: `
      <div style="max-width: 480px;">
        <TAccordion type="single" collapsible disabled default-value="item-1">
          <TAccordionItem value="item-1">
            <template #trigger>First section</template>
            Disabling the container disables every trigger, but items opened via
            default-value stay open and readable.
          </TAccordionItem>

          <TAccordionItem value="item-2">
            <template #trigger>Second section</template>
            This trigger cannot be activated or focused.
          </TAccordionItem>

          <TAccordionItem value="item-3">
            <template #trigger>Third section</template>
            Individual items can still be disabled on their own instead.
          </TAccordionItem>
        </TAccordion>
      </div>
    `,
  }),
};
