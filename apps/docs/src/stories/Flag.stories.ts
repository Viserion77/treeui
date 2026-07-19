import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TFlag } from '@treeui/vue';

const meta = {
  title: 'Components/Data Display/Flag',
  component: TFlag,
  tags: ['autodocs'],
  args: {
    code: 'br',
    size: 'md',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TFlag>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TFlag },
    setup: () => ({ args }),
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TFlag :code="args.code" :size="args.size" :label="args.label" />
        <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          {{ args.code }}
        </span>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { TFlag },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TFlag code="br" size="sm" />
        <TFlag code="br" size="md" />
        <TFlag code="br" size="lg" />
      </div>
    `,
  }),
};

export const TrueProportions: Story = {
  render: () => ({
    components: { TFlag },
    // Flags keep their real proportions and flat artwork: Nepal stays a pennant,
    // Switzerland stays square. A shared height is what aligns the row.
    setup: () => ({ codes: ['br', 'np', 'ch', 'us', 'jp', 'qa'] }),
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TFlag v-for="code in codes" :key="code" :code="code" size="lg" />
      </div>
    `,
  }),
};

export const Labelled: Story = {
  render: () => ({
    components: { TFlag },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TFlag code="br" size="lg" label="Brazil" />
        <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Exposed to assistive tech as an image named "Brazil"
        </span>
      </div>
    `,
  }),
};

export const Fallback: Story = {
  render: () => ({
    components: { TFlag },
    template: `
      <div style="display: flex; gap: 0.75rem; align-items: center;">
        <TFlag code="zz" size="lg" />
        <TFlag code="zz" size="lg" fallback-text="?" />
        <span style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Unknown codes, a blocked CDN, or an offline client fall back to text
        </span>
      </div>
    `,
  }),
};

export const SelfHosted: Story = {
  render: () => ({
    components: { TFlag },
    template: `
      <div style="display: grid; gap: 0.75rem;">
        <TFlag code="br" size="lg" base-url="https://flagcdn.com" />
        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          A mirror must serve <code>&#123;baseUrl&#125;/h20|h24/&#123;code&#125;.png</code>
          plus the retina steps <code>h40|h60</code> — flat artwork at a fixed height.
        </div>
      </div>
    `,
  }),
};
