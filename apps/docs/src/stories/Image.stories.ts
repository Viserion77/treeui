import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TImage } from '@treeui/vue';
import { practiceNote } from './practice-refs';

// Inline SVG data URI so the story needs no network/asset.
const SAMPLE =
  'data:image/svg+xml;utf8,' +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200">
      <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#0969da"/><stop offset="1" stop-color="#1a7f37"/>
      </linearGradient></defs>
      <rect width="320" height="200" fill="url(#g)"/>
      <text x="160" y="108" font-size="24" fill="white" text-anchor="middle" font-family="sans-serif">sample</text>
    </svg>`,
  );

const meta = {
  title: 'Components/Data Display/Image',
  component: TImage,
  parameters: {
    docs: { description: { component: practiceNote('TImage') } },
  },
  tags: ['autodocs'],
  args: { src: SAMPLE, alt: 'Sample image', fit: 'cover', radius: 'md', ratio: '16 / 9' },
  argTypes: {
    fit: { control: 'select', options: ['cover', 'contain'] },
    radius: { control: 'select', options: ['none', 'sm', 'md', 'lg', 'pill'] },
  },
} satisfies Meta<typeof TImage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TImage },
    setup: () => ({ args }),
    template: `<div style="max-width: 20rem;"><TImage v-bind="args" /></div>`,
  }),
};

export const Ratios: Story = {
  render: () => ({
    components: { TImage },
    setup: () => ({ SAMPLE }),
    template: `
      <div style="display: flex; gap: 1rem; align-items: flex-start;">
        <div style="width: 10rem;"><TImage :src="SAMPLE" alt="Square" ratio="1 / 1" /></div>
        <div style="width: 14rem;"><TImage :src="SAMPLE" alt="Wide" ratio="16 / 9" /></div>
        <TImage :src="SAMPLE" alt="Round" ratio="1 / 1" radius="pill" style="width: 6rem;" />
      </div>
    `,
  }),
};
