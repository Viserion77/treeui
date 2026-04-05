import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TAccordion, TAccordionItem } from '@treeui/vue';

const meta = {
  title: 'Components/Accordion',
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
