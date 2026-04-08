import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TRadio, TRadioGroup } from '@treeui/vue';

const meta = {
  title: 'Components/Data Entry/Radio',
  component: TRadioGroup,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    invalid: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TRadioGroup>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TRadio, TRadioGroup },
    setup: () => {
      const selected = ref('option-1');
      return { args, selected };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TRadioGroup
          :size="args.size"
          :disabled="args.disabled"
          :invalid="args.invalid"
          :model-value="selected"
          name="playground"
          @update:model-value="selected = $event"
        >
          <TRadio value="option-1">Option 1</TRadio>
          <TRadio value="option-2">Option 2</TRadio>
          <TRadio value="option-3">Option 3</TRadio>
        </TRadioGroup>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selected: {{ selected }}
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TRadio, TRadioGroup },
    setup: () => {
      const a = ref('yes');
      const b = ref('');
      const c = ref('on');
      return { a, b, c };
    },
    template: `
      <div style="display: grid; gap: 1.5rem;">
        <div>
          <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted); margin-bottom: 0.5rem;">Default</div>
          <TRadioGroup :model-value="a" name="default" @update:model-value="a = $event">
            <TRadio value="yes">Yes</TRadio>
            <TRadio value="no">No</TRadio>
          </TRadioGroup>
        </div>
        <div>
          <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted); margin-bottom: 0.5rem;">Disabled</div>
          <TRadioGroup :model-value="b" name="disabled" disabled @update:model-value="b = $event">
            <TRadio value="on">On</TRadio>
            <TRadio value="off">Off</TRadio>
          </TRadioGroup>
        </div>
        <div>
          <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted); margin-bottom: 0.5rem;">Invalid</div>
          <TRadioGroup :model-value="c" name="invalid" invalid @update:model-value="c = $event">
            <TRadio value="on">On</TRadio>
            <TRadio value="off">Off</TRadio>
          </TRadioGroup>
        </div>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TRadio, TRadioGroup },
    setup: () => {
      const sm = ref('a');
      const md = ref('a');
      const lg = ref('a');
      return { sm, md, lg };
    },
    template: `
      <div style="display: grid; gap: 1.5rem;">
        <div>
          <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted); margin-bottom: 0.5rem;">Small</div>
          <TRadioGroup size="sm" :model-value="sm" name="sm" @update:model-value="sm = $event">
            <TRadio value="a">Option A</TRadio>
            <TRadio value="b">Option B</TRadio>
          </TRadioGroup>
        </div>
        <div>
          <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted); margin-bottom: 0.5rem;">Medium</div>
          <TRadioGroup size="md" :model-value="md" name="md" @update:model-value="md = $event">
            <TRadio value="a">Option A</TRadio>
            <TRadio value="b">Option B</TRadio>
          </TRadioGroup>
        </div>
        <div>
          <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted); margin-bottom: 0.5rem;">Large</div>
          <TRadioGroup size="lg" :model-value="lg" name="lg" @update:model-value="lg = $event">
            <TRadio value="a">Option A</TRadio>
            <TRadio value="b">Option B</TRadio>
          </TRadioGroup>
        </div>
      </div>
    `,
  }),
};
