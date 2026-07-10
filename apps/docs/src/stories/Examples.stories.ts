import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { TBadge, TButton, TCard, TTag } from '@treeui/vue';

// The examples are standalone Vite apps assembled next to this Storybook on the
// deployed site (site/examples/*). From the Storybook iframe at /vue/, the apps
// live one level up; during local Storybook dev, run `pnpm example:vue:dev`.
const vueExampleHref = '../examples/dashboard-vue/';
const reactExampleHref = '../examples/dashboard-react/';

const meta = {
  title: 'Showcase/Examples',
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Full standalone applications built with TreeUI, deployed alongside these docs. Source lives in the `examples/` folder of the repository.',
      },
    },
  },
} satisfies Meta<Record<string, never>>;

export default meta;
type Story = StoryObj<Record<string, never>>;

export const FullApplications: Story = {
  render: () => ({
    components: { TBadge, TButton, TCard, TTag },
    setup: () => ({ vueExampleHref, reactExampleHref }),
    template: `
      <div style="display: grid; gap: var(--tree-space-5); max-width: 56rem; font-family: var(--tree-font-family-sans);">
        <div>
          <h2 style="margin: 0 0 var(--tree-space-2); font-size: var(--tree-font-size-xl, 1.4rem); color: var(--tree-color-text-primary);">
            Full application examples
          </h2>
          <p style="margin: 0; color: var(--tree-color-text-muted); max-width: 64ch;">
            Configurable dashboard apps built entirely with TreeUI — app shell, data views, and a
            settings drawer for theme, accent color, density, and widgets. Source code lives in
            the <code>examples/</code> folder of the repository.
          </p>
        </div>

        <TCard variant="outline">
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--tree-space-3);">
              <strong>Vue dashboard</strong>
              <TBadge tone="success" size="sm">Live demo</TBadge>
            </div>
          </template>
          <p style="margin: 0 0 var(--tree-space-3); color: var(--tree-color-text-muted);">
            Sidebar shell with TSidebar + TNavMenu, KPI stats, sortable tables with pagination,
            modal and confirm-dialog flows, toasts, and a TDrawer settings panel.
          </p>
          <div style="display: flex; gap: var(--tree-space-2); flex-wrap: wrap;">
            <TTag size="sm">TSidebar</TTag>
            <TTag size="sm">TNavMenu</TTag>
            <TTag size="sm">TStat</TTag>
            <TTag size="sm">TTable</TTag>
            <TTag size="sm">TDrawer</TTag>
            <TTag size="sm">useToast</TTag>
          </div>
          <template #footer>
            <TButton as="a" :href="vueExampleHref" target="_blank" rel="noopener">
              Open Vue example
            </TButton>
          </template>
        </TCard>

        <TCard variant="outline">
          <template #header>
            <div style="display: flex; align-items: center; justify-content: space-between; gap: var(--tree-space-3);">
              <strong>React dashboard</strong>
              <TBadge tone="success" size="sm">Live demo</TBadge>
            </div>
          </template>
          <p style="margin: 0 0 var(--tree-space-3); color: var(--tree-color-text-muted);">
            The same dashboard concept using the React primitives — TButton, TInput, TBadge, and
            TCard — composed on the shared design tokens.
          </p>
          <div style="display: flex; gap: var(--tree-space-2); flex-wrap: wrap;">
            <TTag size="sm">TButton</TTag>
            <TTag size="sm">TInput</TTag>
            <TTag size="sm">TBadge</TTag>
            <TTag size="sm">TCard</TTag>
            <TTag size="sm">@treeui/tokens</TTag>
          </div>
          <template #footer>
            <TButton as="a" :href="reactExampleHref" target="_blank" rel="noopener">
              Open React example
            </TButton>
          </template>
        </TCard>
      </div>
    `,
  }),
};
