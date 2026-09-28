import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { TButton } from '@treeui/vue';
import { CheckIcon, iconProps } from './icon-helpers';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Actions/Button',
  component: TButton,
  parameters: {
    docs: { description: { component: practiceNote('TButton') } },
  },
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
    tone: {
      control: 'select',
      // `undefined` first: unset is the default and is not the same as
      // `neutral` — unset fills with the brand, `neutral` fills with ink.
      options: [undefined, 'neutral', 'brand', 'accent', 'success', 'warning', 'danger', 'info'],
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

export const Tones: Story = {
  render: () => ({
    components: { TButton },
    template: `
      <div style="display: grid; gap: 1rem;">
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
          <TButton tone="neutral">Neutral</TButton>
          <TButton tone="brand">Brand</TButton>
          <TButton tone="accent">Accent</TButton>
          <TButton tone="success">Success</TButton>
          <TButton tone="warning">Warning</TButton>
          <TButton tone="danger">Danger</TButton>
          <TButton tone="info">Info</TButton>
        </div>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          <code>tone</code> is orthogonal to <code>variant</code>: the variant decides the shape,
          the tone decides which colour set that shape paints with. Each tone carries its own
          hover, press and tint steps, plus the ink computed to clear AA on both — which is why
          <code>tone="warning"</code> does not put white on amber.
        </div>
      </div>
    `,
  }),
};

export const ToneAcrossVariants: Story = {
  render: () => ({
    components: { TButton },
    template: `
      <div style="display: grid; gap: 1rem;">
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
          <TButton variant="solid" tone="danger">Solid</TButton>
          <TButton variant="soft" tone="danger">Soft</TButton>
          <TButton variant="outline" tone="danger">Outline</TButton>
          <TButton variant="ghost" tone="danger">Ghost</TButton>
        </div>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          This is the row the axis exists for. On the quiet variants a tone inks the label and the
          edge instead of filling the button, so a destructive action can say what it is without
          outweighing everything around it. The deprecated <code>variant="danger"</code> could only
          ever be the first of these four.
        </div>
      </div>
    `,
  }),
};

export const QuietDestructive: Story = {
  render: () => ({
    components: { TButton },
    template: `
      <div style="display: grid; gap: 1rem; max-width: 26rem;">
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
          <TButton>Save changes</TButton>
          <TButton variant="ghost">Duplicate</TButton>
          <TButton variant="ghost">Archive</TButton>
          <TButton variant="ghost" tone="danger">Delete</TButton>
        </div>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          One primary action, three quiet ones, and the destructive one still reads as destructive.
          A filled red button here would outweigh the action people actually came to take.
        </div>
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

export const IconOnly: Story = {
  render: () => ({
    components: { TButton, CheckIcon },
    setup: () => ({ iconProps }),
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <div style="display: flex; gap: 0.75rem; align-items: center;">
          <TButton icon-only label="Confirm" size="sm">
            <template #icon><CheckIcon v-bind="iconProps" /></template>
          </TButton>
          <TButton icon-only label="Confirm" variant="outline">
            <template #icon><CheckIcon v-bind="iconProps" /></template>
          </TButton>
          <TButton icon-only label="Confirm" variant="ghost" size="lg">
            <template #icon><CheckIcon v-bind="iconProps" /></template>
          </TButton>
        </div>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          The icon slot is aria-hidden, so <code>label</code> supplies the accessible name.
          The square is the size token; the 44×44 hit area still comes from the base rule.
        </div>
      </div>
    `,
  }),
};

export const LoadingReplacesTheIcon: Story = {
  render: () => ({
    components: { TButton, CheckIcon },
    setup: () => ({ iconProps }),
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <div style="display: flex; gap: 0.75rem; flex-wrap: wrap; align-items: center;">
          <TButton>
            <template #icon><CheckIcon v-bind="iconProps" /></template>
            Idle
          </TButton>
          <TButton loading loading-label="Gerando resumo">
            <template #icon><CheckIcon v-bind="iconProps" /></template>
            Generating
          </TButton>
          <TButton loading :hide-icon-while-loading="false">
            <template #icon><CheckIcon v-bind="iconProps" /></template>
            Both shown
          </TButton>
        </div>
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          The spinner replaces the icon by default, so loading never shows two glyphs.
          <code>loading-label</code> is the announced text — pass your locale's string.
        </div>
      </div>
    `,
  }),
};
