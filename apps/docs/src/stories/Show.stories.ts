import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { THide, TShow, TTag, TText } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Layout/Show',
  component: TShow,
  parameters: {
    docs: {
      description: {
        component: [
          'TShow and THide choose between two compositions by viewport width — in pure CSS.',
          '',
          'Both branches always render. That is the point: `matchMedia` has no `window` while the HTML is written, so a JS answer forces the server to guess a viewport and a crawler reads one navigation instead of both. It is also something a consumer cannot write, because `@media (min-width: var(--tree-breakpoint-lg))` is invalid — media queries are evaluated before the cascade exists — so the pixel gets hardcoded in every app and drifts from the library.',
          '',
          'Resize the preview to see the switch.',
          '',
          practiceNote('TShow'),
        ].join('\n'),
      },
    },
  },
  tags: ['autodocs'],
  args: {
    as: 'div',
    at: 'lg',
  },
  argTypes: {
    at: { control: 'select', options: [undefined, 'sm', 'md', 'lg', 'xl'] },
    below: { control: 'select', options: [undefined, 'sm', 'md', 'lg', 'xl'] },
  },
} satisfies Meta<typeof TShow>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TShow, TText },
    setup: () => ({ args }),
    template: `
      <TShow v-bind="args">
        <TText weight="semibold">Visible for the current bounds</TText>
      </TShow>
    `,
  }),
};

export const OneOrTheOther: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The canonical use: inline navigation on wide screens, a menu trigger below. Both are in the served HTML, so every link stays crawlable.',
      },
    },
  },
  render: () => ({
    components: { THide, TShow, TTag },
    template: `
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <TShow at="lg">
          <div style="display: flex; gap: 0.5rem;">
            <TTag variant="outline">Product</TTag>
            <TTag variant="outline">Docs</TTag>
            <TTag variant="outline">Pricing</TTag>
          </div>
        </TShow>
        <THide at="lg">
          <TTag variant="soft">Menu (below lg)</TTag>
        </THide>
      </div>
    `,
  }),
};

export const Bands: Story = {
  parameters: {
    docs: {
      description: {
        story: '`at` and `below` combine into a band — visible from `sm` up to (not including) `lg`.',
      },
    },
  },
  render: () => ({
    components: { TShow, TText },
    template: `
      <div style="display: grid; gap: 0.5rem;">
        <TShow below="sm"><TText tone="muted">below sm</TText></TShow>
        <TShow at="sm" below="lg"><TText tone="muted">sm → lg</TText></TShow>
        <TShow at="lg"><TText tone="muted">lg and up</TText></TShow>
      </div>
    `,
  }),
};

export const Breakpoints: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'The steps are the library breakpoints: sm 640px, md 768px, lg 1024px, xl 1280px. A unit test fails the build if the stylesheet literals ever drift from `--tree-breakpoint-*`.',
      },
    },
  },
  render: () => ({
    components: { TShow, TTag },
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <TShow at="sm"><TTag tone="info" variant="soft">≥ sm</TTag></TShow>
        <TShow at="md"><TTag tone="info" variant="soft">≥ md</TTag></TShow>
        <TShow at="lg"><TTag tone="info" variant="soft">≥ lg</TTag></TShow>
        <TShow at="xl"><TTag tone="info" variant="soft">≥ xl</TTag></TShow>
      </div>
    `,
  }),
};
