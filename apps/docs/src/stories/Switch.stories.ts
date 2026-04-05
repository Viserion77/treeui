import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TSwitch } from '@treeui/vue';

const meta = {
  title: 'Components/Data Entry/Switch',
  component: TSwitch,
  tags: ['autodocs'],
  args: {
    size: 'md',
    disabled: false,
    invalid: false,
    modelValue: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TSwitch>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TSwitch },
    setup: () => {
      const checked = ref(args.modelValue);
      return { args, checked };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TSwitch
          :size="args.size"
          :disabled="args.disabled"
          :invalid="args.invalid"
          :model-value="checked"
          @update:model-value="checked = $event"
        >
          Enable notifications
        </TSwitch>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Value: {{ checked }}
        </div>
      </div>
    `,
  }),
};

export const States: Story = {
  render: () => ({
    components: { TSwitch },
    setup: () => {
      const a = ref(false);
      const b = ref(true);
      const c = ref(false);
      const d = ref(false);
      return { a, b, c, d };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TSwitch :model-value="a" @update:model-value="a = $event">Off</TSwitch>
        <TSwitch :model-value="b" @update:model-value="b = $event">On</TSwitch>
        <TSwitch :model-value="c" @update:model-value="c = $event" disabled>Disabled</TSwitch>
        <TSwitch :model-value="d" @update:model-value="d = $event" invalid>Invalid</TSwitch>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TSwitch },
    setup: () => {
      const sm = ref(true);
      const md = ref(true);
      const lg = ref(true);
      return { sm, md, lg };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TSwitch size="sm" :model-value="sm" @update:model-value="sm = $event">Small</TSwitch>
        <TSwitch size="md" :model-value="md" @update:model-value="md = $event">Medium</TSwitch>
        <TSwitch size="lg" :model-value="lg" @update:model-value="lg = $event">Large</TSwitch>
      </div>
    `,
  }),
};
