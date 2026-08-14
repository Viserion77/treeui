import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TButton, THero, TPageSurface, TSection, TText } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Layout/PageSurface',
  component: TPageSurface,
  parameters: {
    docs: { description: { component: practiceNote('TPageSurface') } },
  },
  tags: ['autodocs'],
  args: {
    as: 'div',
    overlay: false,
  },
  argTypes: {
    accent: {
      control: 'select',
      options: [undefined, 'brand', 'neutral', 'success', 'warning', 'danger', 'info'],
    },
  },
} satisfies Meta<typeof TPageSurface>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The surface for a screen with no app shell: a landing page, a login or locked screen, a public status page. It zeroes the user-agent body margin the same depth-agnostic way TAppShell does, so a sticky header touches the viewport edge.',
      },
    },
  },
  render: (args: Record<string, unknown>) => ({
    components: { TButton, THero, TPageSurface, TSection, TText },
    setup: () => ({ args }),
    template: `
      <TPageSurface v-bind="args">
        <THero glow>
          <TText as="h1" size="display">One surface, every entry point</TText>
          <TText measure="lead" tone="muted" style="margin-block: 0.75rem 1.5rem;">
            An anonymous screen composes the same primitives as an authenticated one.
          </TText>
          <TButton variant="brand">Sign in</TButton>
        </THero>
        <TSection banded>
          <TText as="h2" size="title">What you get</TText>
        </TSection>
        <TSection>
          <TText as="h2" size="title">How it works</TText>
        </TSection>
      </TPageSurface>
    `,
  }),
};

export const Overlay: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'With `overlay`, the surface takes the viewport and declares itself the scroll host, so a landing rendered over a mounted SPA scrolls itself instead of dragging the screen behind it. Scroll chaining is contained, so reaching the end does not move the page underneath. Open this story in a new tab to see it fill the viewport.',
      },
    },
  },
  render: () => ({
    components: { TPageSurface, TSection, TText },
    template: `
      <div style="position: relative; block-size: 320px; overflow: hidden; border-radius: 0.75rem; border: 1px dashed var(--tree-color-border-strong);">
        <div style="padding: 1rem;">
          <TText tone="muted">The application behind, which must not scroll along.</TText>
        </div>
        <TPageSurface
          overlay
          accent="info"
          style="position: absolute; z-index: 1;"
        >
          <TSection rhythm="tight">
            <TText as="h2" size="title">Overlay surface</TText>
            <TText measure="prose" tone="muted">This region owns the scroll.</TText>
          </TSection>
          <TSection rhythm="loose" banded>
            <TText measure="prose">Scroll me — the panel behind stays put.</TText>
          </TSection>
        </TPageSurface>
      </div>
    `,
  }),
};
