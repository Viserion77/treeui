import type { Meta, StoryObj } from '@storybook/vue3';
import {
  TAlert,
  TBadge,
  TButton,
  TCard,
  TFormField,
  TGrid,
  TInput,
  TSelectableList,
  TStack,
  TStat,
  TTable,
  TTag,
  TTextarea,
} from '@treeui/vue';

const rankingColumns = [
  { key: 'rank', label: '#' },
  { key: 'name', label: 'Segment' },
  { key: 'score', label: 'Score', align: 'right' as const },
];

const rankingRows = [
  { rank: 1, name: 'Expansion accounts', score: '92' },
  { rank: 2, name: 'Onboarding recovery', score: '84' },
  { rank: 3, name: 'Self-serve trials', score: '78' },
];

const templateItems = [
  {
    label: 'Expansion accounts',
    value: 'expansion',
    description: 'Highest revenue upside this quarter.',
    meta: '92',
  },
  {
    label: 'Onboarding recovery',
    value: 'recovery',
    description: 'Fastest path to activation lift.',
    meta: '84',
  },
  {
    label: 'Self-serve trials',
    value: 'trial',
    description: 'Broadest funnel reach with lower ACV.',
    meta: '78',
  },
];

const meta = {
  title: 'Patterns/Recipes',
  parameters: {
    docs: {
      description: {
        component:
          'Docs-first composition recipes built from TreeUI primitives. These patterns stay documented instead of becoming standalone exports.',
      },
    },
  },
} satisfies Meta<Record<string, never>>;

export default meta;
type Story = StoryObj<Record<string, never>>;

export const StatGroup: Story = {
  render: () => ({
    components: { TGrid, TStat },
    template: `
      <TGrid min-item-width="14rem">
        <TStat label="MRR" value="$48.2k" trend="12.4%" tone="success" trend-direction="up" />
        <TStat label="Activation" value="68%" trend="4.1%" tone="info" trend-direction="up" />
        <TStat label="Open incidents" value="7" trend="2 urgent" tone="warning" trend-direction="neutral" />
      </TGrid>
    `,
  }),
};

export const SectionHeader: Story = {
  render: () => ({
    components: { TBadge, TButton, TStack },
    template: `
      <TStack gap="var(--tree-space-3)">
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;">
          <div style="display: grid; gap: 0.35rem;">
            <strong>Workspace members</strong>
            <span style="color: var(--tree-color-text-muted); font-size: var(--tree-font-size-sm);">
              Manage roles, invitations, and access scopes.
            </span>
          </div>

          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <TBadge size="sm">12 active</TBadge>
            <TButton size="sm">Invite member</TButton>
          </div>
        </div>
      </TStack>
    `,
  }),
};

export const Subpanel: Story = {
  render: () => ({
    components: { TButton, TCard },
    template: `
      <div style="max-width: 28rem;">
        <TCard variant="soft">
          <template #header>
            <strong>Deployment notes</strong>
          </template>

          <p style="margin: 0;">
            Use a soft card when content should feel secondary to the main page canvas but still stay grouped and readable.
          </p>

          <template #footer>
            <div style="display: flex; justify-content: flex-end;">
              <TButton size="sm" variant="outline">Open checklist</TButton>
            </div>
          </template>
        </TCard>
      </div>
    `,
  }),
};

export const StackedCard: Story = {
  render: () => ({
    components: { TBadge, TButton, TCard, TTag },
    template: `
      <div style="max-width: 28rem;">
        <TCard>
          <template #header>
            <div style="display: grid; gap: 0.5rem;">
              <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
                <strong>Q2 launch brief</strong>
                <TBadge size="sm">Draft</TBadge>
              </div>

              <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <TTag size="sm">Launch</TTag>
                <TTag size="sm">GTM</TTag>
              </div>
            </div>
          </template>

          <p style="margin: 0;">
            Keep the card shell consistent while letting the center content change from list to list.
          </p>

          <template #footer>
            <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
              <TButton size="sm" variant="ghost">Preview</TButton>
              <TButton size="sm" variant="outline">Edit</TButton>
            </div>
          </template>
        </TCard>
      </div>
    `,
  }),
};

export const EyebrowText: Story = {
  render: () => ({
    template: `
      <div style="display: grid; gap: 0.5rem;">
        <span
          style="
            color: var(--tree-color-text-muted);
            font-size: var(--tree-font-size-xs);
            font-weight: var(--tree-font-weight-medium);
            letter-spacing: 0.08em;
            text-transform: uppercase;
          "
        >
          Launch sequence
        </span>
        <strong>Prepare the customer rollout</strong>
        <p style="margin: 0; color: var(--tree-color-text-muted);">
          This stays a typography recipe until TreeUI grows a broader text primitive strategy.
        </p>
      </div>
    `,
  }),
};

export const FormStack: Story = {
  render: () => ({
    components: { TButton, TFormField, TGrid, TInput, TStack, TTextarea },
    template: `
      <div style="max-width: 40rem;">
        <TStack gap="var(--tree-space-4)">
          <TGrid min-item-width="14rem" gap="var(--tree-space-3)">
            <TFormField label="Name">
              <TInput />
            </TFormField>

            <TFormField label="Email">
              <TInput />
            </TFormField>
          </TGrid>

          <TFormField
            label="Launch notes"
            hint="Summarize rollout details for support and product."
          >
            <TTextarea />
          </TFormField>

          <div style="display: flex; justify-content: flex-end;">
            <TButton size="sm">Save draft</TButton>
          </div>
        </TStack>
      </div>
    `,
  }),
};

export const Ranking: Story = {
  render: () => ({
    components: { TBadge, TCard, TSelectableList, TTable },
    setup: () => ({
      rankingColumns,
      rankingRows,
      templateItems,
    }),
    template: `
      <div style="display: grid; gap: 1rem;">
        <TCard>
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
              <strong>Top opportunities</strong>
              <TBadge size="sm">Table recipe</TBadge>
            </div>
          </template>

          <TTable :columns="rankingColumns" :rows="rankingRows" />
        </TCard>

        <div style="max-width: 28rem;">
          <TSelectableList aria-label="Ranked opportunities" :items="templateItems" />
        </div>
      </div>
    `,
  }),
};

export const ActionPanel: Story = {
  render: () => ({
    components: { TAlert, TButton, TCard, TStack },
    template: `
      <div style="max-width: 32rem;">
        <TCard>
          <TStack gap="var(--tree-space-4)">
            <TAlert variant="warning">
              Publishing now will notify every workspace member and lock the release notes for editing.
            </TAlert>

            <div style="display: flex; justify-content: flex-end; gap: 0.5rem; flex-wrap: wrap;">
              <TButton variant="ghost">Cancel</TButton>
              <TButton variant="outline">Preview</TButton>
              <TButton>Publish</TButton>
            </div>
          </TStack>
        </TCard>
      </div>
    `,
  }),
};
