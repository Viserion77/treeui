import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TButton } from '@treeui/vue';
import { CheckIcon, iconProps } from './icon-helpers';

const meta = {
  title: 'Components/Actions/Button',
  component: TButton,
  tags: ['autodocs'],
  args: {
    variant: 'solid',
    size: 'md',
    disabled: false,
    loading: false,
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'outline', 'ghost', 'soft', 'danger', 'brand'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TButton>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TButton, CheckIcon },
    setup: () => ({ args, iconProps }),
    template: `
      <TButton v-bind="args">
        <template #icon>
          <CheckIcon v-bind="iconProps" />
        </template>
        Invite teammate
      </TButton>
    `,
  }),
};

export const Loading: Story = {
  args: {
    loading: true,
  },
  render: Playground.render,
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
  render: Playground.render,
};

export const Variants: Story = {
  render: () => ({
    components: { TButton },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TButton variant="solid">Solid</TButton>
        <TButton variant="outline">Outline</TButton>
        <TButton variant="ghost">Ghost</TButton>
        <TButton variant="soft">Soft</TButton>
        <TButton variant="danger">Danger</TButton>
        <TButton variant="brand">Brand</TButton>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TButton },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
        <TButton size="sm">Small</TButton>
        <TButton size="md">Medium</TButton>
        <TButton size="lg">Large</TButton>
      </div>
    `,
  }),
};

export const BlockAndAlignment: Story = {
  render: () => ({
    components: { TButton, CheckIcon },
    setup: () => ({ iconProps }),
    template: `
      <div style="display: grid; gap: 0.75rem; max-width: 20rem;">
        <TButton block variant="ghost" align="start">
          <template #icon>
            <CheckIcon v-bind="iconProps" />
          </template>
          Align start
        </TButton>
        <TButton block variant="ghost">
          <template #icon>
            <CheckIcon v-bind="iconProps" />
          </template>
          Align center (default)
        </TButton>
        <TButton block variant="ghost" align="end">
          <template #icon>
            <CheckIcon v-bind="iconProps" />
          </template>
          Align end
        </TButton>
        <TButton block>Full-width primary action</TButton>
      </div>
    `,
  }),
};

export const FormActions: Story = {
  render: () => ({
    components: { TButton },
    setup: () => {
      const status = ref('Untouched');
      const onSubmit = () => {
        status.value = 'Submitted';
      };
      const onReset = () => {
        status.value = 'Untouched';
      };
      return { status, onSubmit, onReset };
    },
    template: `
      <form
        style="display: grid; gap: 0.75rem; max-width: 20rem;"
        @submit.prevent="onSubmit"
        @reset="onReset"
      >
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <TButton type="submit">Save changes</TButton>
          <TButton type="reset" variant="outline">Reset</TButton>
        </div>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Form state: {{ status }}
        </div>
      </form>
    `,
  }),
};

export const AsLink: Story = {
  render: () => ({
    components: { TButton },
    template: `
      <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <TButton as="a" href="https://github.com/Viserion77/treeui" target="_blank" rel="noopener">
          Open repository
        </TButton>
        <TButton
          as="a"
          href="https://github.com/Viserion77/treeui"
          variant="outline"
          target="_blank"
          rel="noopener"
          disabled
        >
          Disabled link
        </TButton>
      </div>
    `,
  }),
};

export const ClickHandling: Story = {
  render: () => ({
    components: { TButton },
    setup: () => {
      const count = ref(0);
      const onClick = () => {
        count.value += 1;
      };
      return { count, onClick };
    },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <TButton @click="onClick">Enabled</TButton>
          <TButton variant="outline" disabled @click="onClick">Disabled</TButton>
          <TButton variant="outline" loading @click="onClick">Loading</TButton>
        </div>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Clicks received: {{ count }} — disabled and loading buttons never emit.
        </div>
      </div>
    `,
  }),
};
