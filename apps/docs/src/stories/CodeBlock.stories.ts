import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TCodeBlock } from '@treeui/vue';
import { practiceNote } from './practice-refs';

const LOG = `2026-07-22T14:03:11Z START RequestId: 8b1c-4f2a-9d3e Version: $LATEST
2026-07-22T14:03:11Z INFO  received 3 messages from orders-queue
2026-07-22T14:03:12Z INFO  processed order 10482 (ok)
2026-07-22T14:03:12Z WARN  order 10483 missing region, defaulting to us-east-1
2026-07-22T14:03:12Z END   Duration: 842.11 ms  Billed: 900 ms  Memory: 128 MB`;

const JSON_ITEM = `{
  "id": { "S": "order-10482" },
  "region": { "S": "us-east-1" },
  "total": { "N": "129.90" },
  "items": { "L": [ { "S": "sku-1" }, { "S": "sku-9" } ] }
}`;

const meta = {
  title: 'Components/Data Display/CodeBlock',
  component: TCodeBlock,
  parameters: {
    docs: { description: { component: practiceNote('TCodeBlock') } },
  },
  tags: ['autodocs'],
  args: { wrap: false, copyable: true, label: 'Lambda log', maxBlockSize: '16rem' },
} satisfies Meta<typeof TCodeBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const LambdaLog: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TCodeBlock },
    setup: () => ({ args, code: LOG }),
    template: `<TCodeBlock v-bind="args" :code="code" />`,
  }),
};

export const WrappedJson: Story = {
  args: { wrap: true, label: 'DynamoDB item' },
  render: (args: Record<string, unknown>) => ({
    components: { TCodeBlock },
    setup: () => ({ args, code: JSON_ITEM }),
    template: `<TCodeBlock v-bind="args" :code="code" />`,
  }),
};
