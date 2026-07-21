import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge, TButton, TEmptyState } from '@treeui/vue';
import { InfoIcon, SearchIcon, iconProps } from './icon-helpers';
import { practiceNote } from './practice-refs';

const meta = {
  title: 'Components/Feedback/EmptyState',
  component: TEmptyState,
  parameters: {
    docs: { description: { component: practiceNote('TEmptyState') } },
  },
  tags: ['autodocs'],
  args: {
    as: 'section',
    size: 'md',
    title: 'No projects yet',
    description: 'Create your first project to start tracking releases, issues, and roadmap work.',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
} satisfies Meta<typeof TEmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { InfoIcon, TButton, TEmptyState },
    setup: () => ({ args, iconProps }),
    template: `
      <div style="width: 420px;">
        <TEmptyState v-bind="args">
          <template #icon>
            <InfoIcon v-bind="iconProps" />
          </template>
          <template #actions>
            <TButton size="sm">Create project</TButton>
          </template>
        </TEmptyState>
      </div>
    `,
  }),
};

export const Sizes: Story = {
  render: () => ({
    components: { InfoIcon, TButton, TEmptyState },
    setup: () => ({ iconProps }),
    template: `
      <div style="display: grid; gap: 1.5rem; width: 420px;">
        <TEmptyState
          size="sm"
          title="Small"
          description="Compact scale for cards, panels, and table bodies."
        >
          <template #icon>
            <InfoIcon v-bind="iconProps" />
          </template>
          <template #actions>
            <TButton size="sm">Create project</TButton>
          </template>
        </TEmptyState>
        <TEmptyState
          size="md"
          title="Medium"
          description="Default scale for section-level empty results."
        >
          <template #icon>
            <InfoIcon v-bind="iconProps" />
          </template>
          <template #actions>
            <TButton size="sm">Create project</TButton>
          </template>
        </TEmptyState>
        <TEmptyState
          size="lg"
          title="Large"
          description="Roomy scale for full-page zero states and onboarding screens."
        >
          <template #icon>
            <InfoIcon v-bind="iconProps" />
          </template>
          <template #actions>
            <TButton size="sm">Create project</TButton>
          </template>
        </TEmptyState>
      </div>
    `,
  }),
};

export const SearchResults: Story = {
  render: () => ({
    components: { SearchIcon, TButton, TEmptyState },
    setup: () => ({ iconProps }),
    template: `
      <div style="width: 420px;">
        <TEmptyState
          title="No matching results"
          description="Try a different search term or clear one of the active filters."
        >
          <template #icon>
            <SearchIcon v-bind="iconProps" />
          </template>
          <template #actions>
            <TButton size="sm" variant="outline">Clear filters</TButton>
          </template>
        </TEmptyState>
      </div>
    `,
  }),
};

export const RichContent: Story = {
  render: () => ({
    components: { TButton, TEmptyState },
    template: `
      <div style="width: 420px;">
        <TEmptyState
          title="Invite your team"
          description="Start by adding the people who will review releases and manage design tokens."
        >
          <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
            You can invite teammates now or skip this step and return later from settings.
          </div>
          <template #actions>
            <TButton size="sm">Invite people</TButton>
            <TButton size="sm" variant="outline">Skip for now</TButton>
          </template>
        </TEmptyState>
      </div>
    `,
  }),
};

export const RichTitleAndDescription: Story = {
  render: () => ({
    components: { SearchIcon, TBadge, TButton, TEmptyState },
    setup: () => ({ iconProps }),
    template: `
      <div style="width: 420px;">
        <TEmptyState>
          <template #icon>
            <SearchIcon v-bind="iconProps" />
          </template>
          <template #title>
            <span style="display: inline-flex; align-items: center; gap: 0.5rem;">
              No archived releases
              <TBadge size="sm" tone="info">Beta</TBadge>
            </span>
          </template>
          <template #description>
            Releases are archived <strong>30 days</strong> after they are superseded — see the
            <a href="#retention">retention policy</a> for the full schedule.
          </template>
          <template #actions>
            <TButton size="sm" variant="outline">Open policy</TButton>
          </template>
        </TEmptyState>
      </div>
    `,
  }),
};

export const SemanticElement: Story = {
  render: () => ({
    components: { InfoIcon, TEmptyState },
    setup: () => ({ iconProps }),
    template: `
      <div style="display: grid; gap: 1.25rem; width: 460px;">
        <section style="padding: 1rem; border: 1px solid var(--tree-color-border-default); border-radius: 0.75rem;">
          <h2 style="margin: 0 0 0.75rem; font-size: var(--tree-font-size-md);">Team activity</h2>
          <TEmptyState
            as="div"
            size="sm"
            title="Nothing logged this week"
            description="Rendered as a div so it does not add a second region inside a section that already has one."
          >
            <template #icon>
              <InfoIcon v-bind="iconProps" />
            </template>
          </TEmptyState>
        </section>

        <TEmptyState
          as="article"
          title="No saved reports"
          description="Any element name works; the root defaults to section. The title always renders as an h2, so pick a placement where that heading level fits the page outline."
        >
          <template #icon>
            <InfoIcon v-bind="iconProps" />
          </template>
        </TEmptyState>
      </div>
    `,
  }),
};
