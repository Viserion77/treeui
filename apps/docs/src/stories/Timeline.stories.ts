import type { Meta, StoryObj } from '@storybook/vue3';
import { TTimeline } from '@treeui/vue';
import type { TreeTimelineItem } from '@treeui/vue';
import { CheckIcon, InfoIcon, iconProps } from './icon-helpers';

const releaseEvents: TreeTimelineItem[] = [
  {
    id: 'queued',
    meta: 'Queued',
    title: 'Release queued for review',
    description: 'The release was created and sent to the product review lane.',
    timestamp: '09:12',
    datetime: '2026-04-07T09:12:00Z',
    tone: 'brand',
  },
  {
    id: 'approved',
    meta: 'Approved',
    title: 'Design review approved',
    description: 'Design signed off on the token updates and component changes.',
    timestamp: '10:03',
    datetime: '2026-04-07T10:03:00Z',
    tone: 'success',
  },
  {
    id: 'warning',
    meta: 'Needs attention',
    title: 'Regression found in docs',
    description: 'Storybook screenshots show a visual diff in the modal footer.',
    timestamp: '11:18',
    datetime: '2026-04-07T11:18:00Z',
    tone: 'warning',
  },
];

const auditEvents: TreeTimelineItem[] = [
  {
    id: 'delete',
    meta: 'Destructive action',
    title: 'Component removed',
    description: 'TreeMarketingBanner was removed from the registry by an admin.',
    timestamp: 'Today',
    tone: 'danger',
  },
  {
    id: 'restore',
    meta: 'Follow-up',
    title: 'Fallback content published',
    description: 'A replacement content block was published to restore the page layout.',
    timestamp: '5 minutes later',
    tone: 'neutral',
  },
];

const meta = {
  title: 'Components/Data Display/Timeline',
  component: TTimeline,
  tags: ['autodocs'],
  args: {
    size: 'md',
    items: releaseEvents,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TTimeline>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TTimeline },
    setup: () => ({ args }),
    template: `
      <div style="width: 480px;">
        <TTimeline v-bind="args" aria-label="Release timeline" />
      </div>
    `,
  }),
};

export const StatusTones: Story = {
  render: () => ({
    components: { TTimeline },
    setup: () => ({ auditEvents }),
    template: `
      <div style="width: 480px;">
        <TTimeline :items="auditEvents" aria-label="Audit timeline" />
      </div>
    `,
  }),
};

export const CustomMarker: Story = {
  render: () => ({
    components: { CheckIcon, InfoIcon, TTimeline },
    setup: () => ({ iconProps, releaseEvents }),
    template: `
      <div style="width: 480px;">
        <TTimeline :items="releaseEvents" aria-label="Custom timeline">
          <template #marker="{ item }">
            <CheckIcon v-if="item.tone === 'success'" v-bind="iconProps" />
            <InfoIcon v-else v-bind="iconProps" />
          </template>
        </TTimeline>
      </div>
    `,
  }),
};

export const CustomItem: Story = {
  render: () => ({
    components: { TTimeline },
    setup: () => ({ releaseEvents }),
    template: `
      <div style="width: 480px;">
        <TTimeline :items="releaseEvents" aria-label="Custom item timeline">
          <template #item="{ item }">
            <div style="display: grid; gap: 0.35rem;">
              <div style="display: flex; justify-content: space-between; gap: 1rem; align-items: baseline;">
                <strong>{{ item.title }}</strong>
                <span style="font-size: var(--tree-font-size-xs); color: var(--tree-color-text-muted);">
                  {{ item.timestamp }}
                </span>
              </div>
              <span style="font-size: var(--tree-font-size-xs); color: var(--tree-color-brand-primary);">
                {{ item.meta }}
              </span>
              <p style="margin: 0; color: var(--tree-color-text-muted);">
                {{ item.description }}
              </p>
            </div>
          </template>
        </TTimeline>
      </div>
    `,
  }),
};
