import type { Meta, StoryObj } from '@storybook/vue3';
import { ref } from 'vue';
import { TTreeView } from '@treeui/vue';

const nodes = [
  {
    id: 'workspace',
    label: 'Workspace',
    meta: 'root',
    children: [
      {
        id: 'workspace-docs',
        label: 'Docs',
        description: 'Guides, changelogs, and onboarding notes.',
        children: [
          { id: 'workspace-docs-roadmap', label: 'Roadmap.mdx', meta: 'MDX' },
          { id: 'workspace-docs-release', label: 'ReleasePlan.mdx', meta: 'MDX' },
        ],
      },
      {
        id: 'workspace-app',
        label: 'App',
        description: 'Main application source.',
        children: [
          { id: 'workspace-app-dashboard', label: 'Dashboard.vue', meta: 'Vue' },
          { id: 'workspace-app-shell', label: 'Shell.vue', meta: 'Vue' },
        ],
      },
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    description: 'Workspace-level permissions and preferences.',
    children: [
      { id: 'settings-members', label: 'Members', meta: '27' },
      { id: 'settings-billing', label: 'Billing', meta: 'Admin only', disabled: true },
    ],
  },
];

const meta = {
  title: 'Components/Navigation & Disclosure/TreeView',
  component: TTreeView,
  tags: ['autodocs'],
  args: {
    selectionMode: 'single',
    modelValue: 'workspace-docs-roadmap',
    nodes,
    defaultExpanded: ['workspace', 'workspace-docs'],
    disabled: false,
  },
  argTypes: {
    selectionMode: {
      control: 'select',
      options: ['single', 'multiple'],
    },
  },
} satisfies Meta<typeof TTreeView>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {
  render: (args: Record<string, unknown>) => ({
    components: { TTreeView },
    setup: () => {
      const value = ref(args.modelValue as string | string[]);
      const expanded = ref(args.defaultExpanded as string[]);
      return { args, expanded, value };
    },
    template: `
      <div style="width: 420px; display: grid; gap: 0.75rem;">
        <TTreeView
          aria-label="Workspace tree"
          :selection-mode="args.selectionMode"
          :nodes="args.nodes"
          :model-value="value"
          :expanded="expanded"
          :disabled="args.disabled"
          @update:model-value="value = $event"
          @update:expanded="expanded = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Selection: {{ Array.isArray(value) ? value.join(', ') : value }}
        </div>
      </div>
    `,
  }),
};

export const Permissions: Story = {
  render: () => ({
    components: { TTreeView },
    setup: () => ({
      expanded: ref(['workspace', 'settings']),
      value: ref(['workspace-app-dashboard', 'settings-members']),
      nodes: [
        {
          id: 'org',
          label: 'Organization',
          children: [
            {
              id: 'org-admin',
              label: 'Admin tools',
              description: 'Manage roles and escalations',
              children: [
                { id: 'org-admin-audit', label: 'Audit logs' },
                { id: 'org-admin-billing', label: 'Billing access' },
              ],
            },
            {
              id: 'org-projects',
              label: 'Projects',
              description: 'Project-level visibility',
              children: [
                { id: 'org-projects-alpha', label: 'Alpha workspace' },
                { id: 'org-projects-beta', label: 'Beta workspace' },
              ],
            },
          ],
        },
      ],
    }),
    template: `
      <div style="width: 420px; display: grid; gap: 0.75rem;">
        <TTreeView
          aria-label="Permissions tree"
          selection-mode="multiple"
          :nodes="nodes"
          :model-value="value"
          :expanded="expanded"
          @update:model-value="value = $event"
          @update:expanded="expanded = $event"
        />

        <div style="font-size: var(--tree-font-size-sm); color: var(--tree-color-text-muted);">
          Granted: {{ value.join(', ') }}
        </div>
      </div>
    `,
  }),
};

export const Empty: Story = {
  render: () => ({
    components: { TTreeView },
    template: `
      <div style="width: 420px;">
        <TTreeView aria-label="Empty tree" :nodes="[]" empty-text="No hierarchy available." />
      </div>
    `,
  }),
};
