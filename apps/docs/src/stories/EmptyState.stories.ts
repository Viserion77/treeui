import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TButton, TEmptyState } from '@treeui/vue';
import { InfoIcon, SearchIcon, iconProps } from './icon-helpers';

const meta = {
  title: 'Components/Feedback/EmptyState',
  component: TEmptyState,
  tags: ['autodocs'],
  args: {
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
