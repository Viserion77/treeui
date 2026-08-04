import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { THide, TShow, TTag } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Layout/Hide',
  component: THide,
  parameters: {
    docs: {
      description: {
        component: [
          'The inverse of `TShow`, and CSS-only for the same reasons — see **Components/Layout/Show** for why this belongs to the library rather than to a `matchMedia` composable.',
          '',
          'Reach for whichever of the two reads better at the call site: `<THide below="lg">` and `<TShow at="lg">` produce the same result.',
          '',
          practiceNote('THide'),
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
} satisfies Meta<typeof THide>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { THide, TTag },
    setup: () => ({ args }),
    template: `
      <THide v-bind="args">
        <TTag variant="soft">Hidden for the current bounds</TTag>
      </THide>
    `,
  }),
};

export const SameResultEitherWay: Story = {
  parameters: {
    docs: {
      description: {
        story: '`THide below="lg"` and `TShow at="lg"` are the same condition written from opposite sides.',
      },
    },
  },
  render: () => ({
    components: { THide, TShow, TTag },
    template: `
      <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
        <THide below="lg"><TTag tone="info" variant="soft">THide below="lg"</TTag></THide>
        <TShow at="lg"><TTag tone="success" variant="soft">TShow at="lg"</TTag></TShow>
      </div>
    `,
  }),
};
