import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TAvatar } from '@treeui/vue';

// Inline placeholder portrait so the image branch renders identically offline —
// a remote photo that fails to load is indistinguishable from the broken-image state.
const PORTRAIT_SRC =
  "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2096%2096'%3E%3Crect%20width='96'%20height='96'%20fill='%232a78d6'/%3E%3Ccircle%20cx='48'%20cy='37'%20r='17'%20fill='%23ffffff'/%3E%3Cpath%20d='M14%2096c0-19%2015-30%2034-30s34%2011%2034%2030z'%20fill='%23ffffff'/%3E%3C/svg%3E";

const meta = {
  title: 'Components/Data Display/Avatar',
  component: TAvatar,
  tags: ['autodocs'],
  args: {
    size: 'md',
    alt: 'Jane Doe',
  },
  argTypes: {
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
    status: { control: 'select', options: [undefined, 'online', 'offline', 'busy', 'away'] },
  },
} satisfies Meta<typeof TAvatar>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TAvatar },
    setup: () => ({ args }),
    template: `<TAvatar v-bind="args" />`,
  }),
  args: {
    src: 'https://i.pravatar.cc/150?u=jane',
    alt: 'Jane Doe',
  },
};

export const WithInitials: Story = {
  render: () => ({
    components: { TAvatar },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TAvatar alt="Jane Doe" size="sm" />
        <TAvatar alt="Jane Doe" size="md" />
        <TAvatar alt="Jane Doe" size="lg" />
      </div>
    `,
  }),
};

export const WithStatus: Story = {
  render: () => ({
    components: { TAvatar },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TAvatar alt="Online User" initials="ON" status="online" />
        <TAvatar alt="Offline User" initials="OF" status="offline" />
        <TAvatar alt="Busy User" initials="BU" status="busy" />
        <TAvatar alt="Away User" initials="AW" status="away" />
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TAvatar },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TAvatar alt="Small" initials="SM" size="sm" />
        <TAvatar alt="Medium" initials="MD" size="md" />
        <TAvatar alt="Large" initials="LG" size="lg" />
      </div>
    `,
  }),
};

export const WithImage: Story = {
  render: () => ({
    components: { TAvatar },
    // The image is cropped to the circle at every size, and the status dot keeps its
    // surface-coloured ring so it stays readable over arbitrary photo pixels.
    setup: () => ({ portrait: PORTRAIT_SRC }),
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TAvatar :src="portrait" alt="Jane Doe" size="sm" />
        <TAvatar :src="portrait" alt="Jane Doe" size="md" />
        <TAvatar :src="portrait" alt="Jane Doe" size="lg" />
        <TAvatar :src="portrait" alt="Jane Doe" size="lg" status="online" />
        <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          A photo replaces the initials entirely; status still sits on the bounding-box corner
        </span>
      </div>
    `,
  }),
};

export const BrokenImage: Story = {
  render: () => ({
    components: { TAvatar },
    // Today a failed image only hides the <img>: the initials span is v-else on src,
    // so it never mounts and the circle stays empty. Pass src only when the URL is
    // known-good, and fall back to initials on the consumer side.
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TAvatar src="/treeui-missing-portrait.png" alt="Jane Doe" initials="JD" size="lg" />
        <TAvatar alt="Jane Doe" initials="JD" size="lg" />
        <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Left: a broken <code>src</code> leaves an empty circle — initials are not an
          automatic fallback. Right: omit <code>src</code> when the photo may be missing.
        </span>
      </div>
    `,
  }),
};

export const WithOverlay: Story = {
  render: () => ({
    components: { TAvatar },
    // The default slot renders inside the .t-avatar span, which is position: relative.
    // Absolutely positioned children stack over the image or initials without joining
    // the flex row and without clipping the status dot.
    setup: () => ({ portrait: PORTRAIT_SRC }),
    template: `
      <div style="display: flex; gap: 1.25rem; align-items: center;">
        <TAvatar :src="portrait" alt="Jane Doe" size="lg">
          <span style="position: absolute; inset: auto 0 0 0; padding: 0.15rem 0; border-radius: 0 0 var(--tree-radius-pill) var(--tree-radius-pill); background: var(--tree-color-brand-primary); color: var(--tree-color-brand-contrast); font-size: var(--tree-font-size-xs); line-height: 1.4; text-align: center;">
            Edit
          </span>
        </TAvatar>
        <TAvatar alt="Jane Doe" initials="JD" size="lg" status="online">
          <span aria-hidden="true" style="position: absolute; top: -2px; right: -2px; display: flex; align-items: center; justify-content: center; width: 1.1rem; height: 1.1rem; border-radius: var(--tree-radius-pill); border: 2px solid var(--tree-color-bg-surface); background: var(--tree-color-status-success); color: var(--tree-color-brand-contrast); font-size: var(--tree-font-size-xs); line-height: 1;">
            &#10003;
          </span>
        </TAvatar>
        <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Overlay content coexists with the status dot — keep it decorative and
          <code>aria-hidden</code>, since the avatar itself is a single <code>role="img"</code>
        </span>
      </div>
    `,
  }),
};

export const DerivedInitials: Story = {
  render: () => ({
    components: { TAvatar },
    // Initials come from alt when the prop is unset: first letter of the first two
    // words, uppercased. An explicit initials prop wins, and an empty alt drops both
    // the initials and the aria-label.
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TAvatar alt="Jane Doe" />
        <TAvatar alt="ada lovelace" />
        <TAvatar alt="Jane Doe" initials="J" />
        <TAvatar alt="" />
        <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          "Jane Doe" &rarr; JD, "ada lovelace" &rarr; AL, an explicit <code>initials</code>
          wins over the derivation, and an empty alt renders an unlabelled empty circle
        </span>
      </div>
    `,
  }),
};
